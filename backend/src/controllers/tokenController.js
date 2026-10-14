const { Op } = require("sequelize");
const axios = require("axios");

const { Token, Patient, Doctor, Clinic, User, Payment } = require("../models");

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const CASHFREE_API_VERSION = "2025-01-01";

const TOKEN_AMOUNT = 10;

const TOKEN_GAP_MINUTES = 5;

const getTodayDate = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
};

const getTodayDayName = () => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  })
    .format(new Date())
    .toLowerCase();
};

const getTodayAvailability = (availableSlots) => {
  if (
    !availableSlots ||
    typeof availableSlots !== "object" ||
    Array.isArray(availableSlots)
  ) {
    return [];
  }

  const today = getTodayDayName();

  const dayName = today.charAt(0).toUpperCase() + today.slice(1);

  const slots = availableSlots[today] || availableSlots[dayName];

  if (!Array.isArray(slots)) {
    return [];
  }

  return slots;
};

const getTodayStartTime = (availableSlots) => {
  const slots = getTodayAvailability(availableSlots);

  if (slots.length === 0) {
    return null;
  }

  const firstSlot = slots[0];

  if (!firstSlot || typeof firstSlot !== "string") {
    return null;
  }

  // Example:
  // "09:00 AM - 10:00 AM"
  if (firstSlot.includes(" - ")) {
    return firstSlot.split(" - ")[0].trim();
  }

  // Example:
  // "10:00 AM"
  return firstSlot.trim();
};

const parseTimeToMinutes = (time) => {
  if (!time || typeof time !== "string") {
    return null;
  }

  const normalizedTime = time.trim().toUpperCase();

  const twelveHourMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);

    const minute = Number(twelveHourMatch[2]);

    const period = twelveHourMatch[3];

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return null;
    }

    if (period === "AM") {
      if (hour === 12) {
        hour = 0;
      }
    } else {
      if (hour !== 12) {
        hour += 12;
      }
    }

    return hour * 60 + minute;
  }

  const twentyFourHourMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);

    const minute = Number(twentyFourHourMatch[2]);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }

    return hour * 60 + minute;
  }

  return null;
};

const minutesToTime = (totalMinutes) => {
  const normalizedMinutes = totalMinutes % (24 * 60);

  const hour = Math.floor(normalizedMinutes / 60);

  const minute = normalizedMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )}:00`;
};

// Create Token and Cashfree Payment Order

const createToken = async (req, res, next) => {
  try {
    const {
      doctorId,
      clinicId,
      patientName,
      patientAge,
      patientGender,
      patientMobile,
      patientAddress,
    } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Validate patient information

    if (!patientName || !patientMobile) {
      return res.status(400).json({
        success: false,
        message: "Patient name and mobile number are required",
      });
    }

    // Validate gender

    if (patientGender && !["male", "female", "other"].includes(patientGender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender",
      });
    }

    // Find logged-in patient

    const patient = await Patient.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // Find user

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find doctor

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    console.log("BOOKING DEBUG:", {
      loggedInUserId: req.user.userId,
      requestedDoctorId: doctorId,
      actualDoctorId: doctor?.id,
      clinicId,
    });

    // Doctor must be approved

    if (doctor.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "This doctor is not available for appointments",
      });
    }

    // Find clinic

    let clinic;

    if (clinicId) {
      clinic = await Clinic.findOne({
        where: {
          id: clinicId,
          doctorId,
        },
      });
    } else {
      clinic = await Clinic.findOne({
        where: {
          doctorId,
        },
        order: [["id", "ASC"]],
      });
    }

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found for this doctor",
      });
    }

    // Today's date - India timezone

    const today = getTodayDate();

    const availableSlots = doctor.availableSlots;

    const todaySlots = getTodayAvailability(availableSlots);

    if (todaySlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available today",
      });
    }

    const startTime = getTodayStartTime(availableSlots);

    if (!startTime) {
      return res.status(400).json({
        success: false,
        message: "Doctor start time is not configured",
      });
    }

    // Convert starting time

    const startMinutes = parseTimeToMinutes(startTime);

    if (startMinutes === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor availability time",
      });
    }

    const lastToken = await Token.findOne({
      where: {
        doctorId,
        clinicId: clinic.id,
        date: today,
      },

      order: [["tokenNumber", "DESC"]],
    });

    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    // Calculate appointment time
    //
    // Token 1 = start time
    // Token 2 = +5 minutes
    // Token 3 = +10 minutes

    const totalMinutes =
      startMinutes + (nextTokenNumber - 1) * TOKEN_GAP_MINUTES;

    const appointmentTime = minutesToTime(totalMinutes);

    // Create token

    const token = await Token.create({
      patientId: patient.id,

      doctorId,

      clinicId: clinic.id,

      tokenNumber: nextTokenNumber,

      status: "payment_pending",

      tokenType: "normal",

      date: today,

      appointmentTime,

      patientName,

      patientAge: patientAge || null,

      patientGender: patientGender || null,

      patientMobile,

      patientAddress: patientAddress || null,
    });

    // Generate Cashfree order ID

    const orderId = `NH_${token.id}_${Date.now()}`;

    const cashfreeResponse = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,

      {
        order_id: orderId,

        order_amount: TOKEN_AMOUNT,

        order_currency: "INR",

        customer_details: {
          customer_id: String(user.id),

          customer_name: patientName,

          customer_phone: patientMobile,
        },

        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/patient/payment/success?order_id={order_id}`,

          notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
        },

        order_note: `NirogaHub Token #${token.tokenNumber}`,
      },

      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,

          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,

          "x-api-version": CASHFREE_API_VERSION,

          "Content-Type": "application/json",

          Accept: "application/json",
        },
      },
    );

    const cashfreeOrder = cashfreeResponse.data;

    await Payment.create({
      userId: user.id,

      tokenId: token.id,

      orderId: cashfreeOrder.order_id,

      paymentSessionId: cashfreeOrder.payment_session_id,

      amount: TOKEN_AMOUNT,

      status: "pending",

      paymentMethod: "cashfree",
    });

    return res.status(201).json({
      success: true,

      message: "Token created and payment order generated",

      tokenId: token.id,

      tokenNumber: token.tokenNumber,

      appointmentTime: token.appointmentTime,

      date: token.date,

      orderId: cashfreeOrder.order_id,

      paymentSessionId: cashfreeOrder.payment_session_id,

      amount: TOKEN_AMOUNT,
    });
  } catch (error) {
    console.error("Create token error:", error.response?.data || error.message);

    next(error);
  }
};

const getMyTokens = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { userId: req.user.userId },
      attributes: ["id"],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // Fetch the logged-in patient's active tokens.
    const tokens = await Token.findAll({
      where: {
        patientId: patient.id,
        status: {
          [Op.in]: ["waiting", "called"],
        },
      },
      include: [
        {
          model: Doctor,
          attributes: ["id", "specialization", "experience", "clinicName"],
          include: [
            {
              model: User,
              attributes: ["id", "name", "photo"],
            },
          ],
        },
        {
          model: Clinic,
          attributes: ["id", "name", "address", "phone", "timings"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    // Cache each doctor/clinic/date queue to avoid fetching it repeatedly.
    const queueCache = new Map();

    const tokensWithQueueInfo = await Promise.all(
      tokens.map(async (token) => {
        const queueKey = [token.doctorId, token.clinicId, token.date].join(":");

        if (!queueCache.has(queueKey)) {
          const queuePromise = Token.findAll({
            where: {
              doctorId: token.doctorId,
              clinicId: token.clinicId,
              date: token.date,
              status: {
                [Op.in]: ["waiting", "called"],
              },
            },
            attributes: ["id", "tokenNumber", "status"],
            order: [["tokenNumber", "ASC"]],
          });

          queueCache.set(queueKey, queuePromise);
        }

        const queue = await queueCache.get(queueKey);

        // A token already called by the doctor is being consulted now.
        const patientsAhead =
          token.status === "called"
            ? 0
            : queue.filter(
                (queueToken) =>
                  Number(queueToken.tokenNumber) < Number(token.tokenNumber) &&
                  queueToken.status === "waiting",
              ).length;

        const isNext = token.status === "waiting" && patientsAhead === 0;

        const calledTokenAhead =
          token.status === "waiting" &&
          queue.some(
            (queueToken) =>
              Number(queueToken.tokenNumber) < Number(token.tokenNumber) &&
              queueToken.status === "called",
          );

        const estimatedWaitMinutes =
          (patientsAhead + (calledTokenAhead ? 1 : 0)) * 5;

        const queuePosition = token.status === "called" ? 0 : patientsAhead + 1;

        return {
          ...token.toJSON(),
          patientsAhead,
          queuePosition,
          estimatedWaitMinutes,
          isNext,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      count: tokensWithQueueInfo.length,
      tokens: tokensWithQueueInfo,
    });
  } catch (error) {
    next(error);
  }
};

const getTokenHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const tokens = await Token.findAll({
      where: {
        patientId: patient.id,

        status: {
          [Op.in]: ["completed", "cancelled"],
        },
      },

      include: [
        {
          model: Doctor,

          attributes: ["id", "specialization", "experience", "clinicName"],

          include: [
            {
              model: User,

              attributes: ["id", "name", "photo"],
            },
          ],
        },

        {
          model: Clinic,

          attributes: ["id", "name", "address", "phone", "timings"],
        },
      ],

      order: [
        ["date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,

      count: tokens.length,

      tokens,
    });
  } catch (error) {
    next(error);
  }
};

const getQueuePosition = async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    // Identify the logged-in patient.
    const patient = await Patient.findOne({
      where: { userId: req.user.userId },
      attributes: ["id"],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // A patient can only check their own token.
    const token = await Token.findOne({
      where: {
        id: tokenId,
        patientId: patient.id,
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    const activeStatuses = ["waiting", "called"];

    const queueTokens = await Token.findAll({
      where: {
        doctorId: token.doctorId,
        clinicId: token.clinicId,
        date: token.date,
        status: activeStatuses,
      },
      attributes: ["id", "tokenNumber", "status", "appointmentTime"],
      order: [
        ["tokenNumber", "ASC"],
        ["id", "ASC"],
      ],
    });

    const activeQueue = queueTokens.map((item) => item.toJSON());

    const currentIndex = activeQueue.findIndex(
      (item) => String(item.id) === String(token.id),
    );

    if (currentIndex === -1) {
      return res.status(200).json({
        success: true,
        queuePosition: {
          tokenId: token.id,
          tokenNumber: token.tokenNumber,
          status: token.status,
          patientsAhead: 0,
          isNext: false,
          estimatedWaitMinutes: null,
          message: "This token is not currently in the active queue.",
        },
      });
    }

    // Every active token before this token is ahead in the queue.
    const patientsAhead = currentIndex;

    const someoneIsBeingConsulted = activeQueue.some(
      (item) => item.status === "called",
    );

    const isNext =
      token.status === "waiting" &&
      patientsAhead === 0 &&
      !someoneIsBeingConsulted;

    // Five-minute estimate per token. If a patient is currently
    const estimatedWaitMinutes =
      token.status === "called"
        ? 0
        : Math.max(0, (patientsAhead + (someoneIsBeingConsulted ? 0 : 0)) * 5);

    return res.status(200).json({
      success: true,
      queuePosition: {
        tokenId: token.id,
        tokenNumber: token.tokenNumber,
        status: token.status,
        patientsAhead,
        isNext,
        estimatedWaitMinutes,
        queueLength: activeQueue.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createToken,
  getMyTokens,
  getTokenHistory,
  getQueuePosition,
};
