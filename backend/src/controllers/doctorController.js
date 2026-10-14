const { User, Doctor, Clinic, Patient, Token } = require("../models");

const getProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: {
        userId: req.user.userId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "mobile", "photo", "role"],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      specialization,
      experience,
      clinicName,
      address,
      consultationFee,
      availableSlots,
      profileImage,
    } = req.body;

    const doctor = await Doctor.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    await doctor.update({
      specialization,
      experience,
      clinicName,
      address,
      consultationFee,
      availableSlots,
      profileImage,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

const { sequelize } = require("../config/database");
const { Op } = require("sequelize");

// Get Today's Doctor Queue

const getDoctorQueue = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: {
        userId: req.user.userId,
      },
      attributes: ["id"],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const queue = await Token.findAll({
      where: {
        doctorId: doctor.id,
        date: today,
        status: {
          [Op.in]: ["waiting", "called", "completed"],
        },
      },

      include: [
        {
          model: Patient,
          attributes: ["id", "userId"],

          include: [
            {
              model: User,
              attributes: ["id", "name", "mobile", "photo"],
            },
          ],
        },

        {
          model: Clinic,
          attributes: ["id", "name", "address"],
        },
      ],

      order: [["tokenNumber", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error) {
    next(error);
  }
};

// Complete Current Patient & Call Next

const completeAndCallNext = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const doctor = await Doctor.findOne({
      where: {
        userId: req.user.userId,
      },
      attributes: ["id"],
      transaction,
    });

    if (!doctor) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    // Find the currently consulted token.
    const currentToken = await Token.findOne({
      where: {
        doctorId: doctor.id,
        date: today,
        status: "called",
      },
      order: [["tokenNumber", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!currentToken) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "No patient is currently being consulted",
      });
    }

    // Complete ONLY the current token.
    await currentToken.update(
      {
        status: "completed",
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    // Notify patients in this doctor/clinic queue.
    const io = req.app.get("io");

    if (io) {
      io.to(`queue:${doctor.id}:${currentToken.clinicId}`).emit(
        "queueUpdated",
        {
          doctorId: doctor.id,
          clinicId: currentToken.clinicId,
          tokenId: currentToken.id,
          tokenNumber: currentToken.tokenNumber,
          status: "completed",
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Patient completed. Press Call Next to call another patient.",
      currentPatient: {
        tokenId: currentToken.id,
        tokenNumber: currentToken.tokenNumber,
        patientId: currentToken.patientId,
        patientName: currentToken.patientName,
        appointmentTime: currentToken.appointmentTime,
        status: "completed",
      },
      nextPatient: null,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    next(error);
  }
};

const updatePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const photoPath = `/uploads/doctors/${req.file.filename}`;

    await user.update({
      photo: photoPath,
    });

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      photo: user.photo,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { availableSlots } = req.body;

    if (!availableSlots) {
      return res.status(400).json({
        success: false,
        message: "Available slots are required",
      });
    }

    const doctor = await Doctor.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    await doctor.update({
      availableSlots,
    });

    return res.status(200).json({
      success: true,
      message: "Availability updated",
      availableSlots: doctor.availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

const getAllApprovedDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({
      where: {
        status: "approved",
      },
      attributes: [
        "id",
        "userId",
        "specialization",
        "experience",
        "clinicName",
        "address",
        "consultationFee",
        "profileImage",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "name", "photo"],
        },
        {
          model: Clinic,
          attributes: ["id", "name", "address", "location", "phone", "timings"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorPatients = async (req, res, next) => {
  try {
    // Logged-in doctor
    const doctor = await Doctor.findOne({
      where: {
        userId: req.user.userId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "mobile", "photo", "role"],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // Today's tokens for this doctor
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    const tokens = await Token.findAll({
      where: {
        doctorId: doctor.id,
        date: today,
        status: {
          [Op.in]: ["waiting", "called", "completed"],
        },
      },
      include: [
        {
          model: Patient,
          attributes: ["id", "userId"],
          include: [
            {
              model: User,
              attributes: ["id", "name", "mobile", "photo"],
            },
          ],
        },
        {
          model: Clinic,
          attributes: ["id", "name", "address"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["appointmentTime", "ASC"],
        ["tokenNumber", "ASC"],
      ],
    });

    // Direct mapping for frontend
    const patients = tokens.map((token) => {
      const patientUser = token.Patient?.User;

      return {
        id: token.id,

        patientName: token.patientName || "Patient",
        age: token.patientAge ?? "--",
        gender: token.patientGender || "Other",

        problem: doctor.specialization || "General Consultation",
        department: doctor.specialization || "General Medicine",

        lastVisit: token.date || "No visit yet",

        photo: patientUser?.photo || null,
        status: token.status,

        tokenId: token.id,
        tokenNumber: token.tokenNumber,
        appointmentTime: token.appointmentTime,
        tokenType: token.tokenType,

        mobile: token.patientMobile || "",
        address: token.patientAddress || "",

        doctorId: token.doctorId,
        clinicId: token.clinicId,
        clinicName: token.Clinic?.name || "",
        clinicAddress: token.Clinic?.address || "",
      };
    });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Get doctor patients error:", error);
    next(error);
  }
};

// Call Next Patient

const callNextPatient = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const doctor = await Doctor.findOne({
      where: {
        userId: req.user.userId,
      },
      attributes: ["id"],
      transaction,
    });

    if (!doctor) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    // Check whether a consultation is already active.
    const currentToken = await Token.findOne({
      where: {
        doctorId: doctor.id,
        date: today,
        status: "called",
      },
      order: [["tokenNumber", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (currentToken) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "A patient is already being consulted",
        currentPatient: {
          tokenId: currentToken.id,
          tokenNumber: currentToken.tokenNumber,
          patientName: currentToken.patientName,
          appointmentTime: currentToken.appointmentTime,
          status: currentToken.status,
        },
      });
    }

    // Find the next waiting token in queue order.
    const nextToken = await Token.findOne({
      where: {
        doctorId: doctor.id,
        date: today,
        status: "waiting",
      },
      order: [["tokenNumber", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!nextToken) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "No waiting patient in today's queue",
      });
    }

    // Mark only this token as called.
    await nextToken.update(
      {
        status: "called",
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    // Broadcast only after the database commit succeeds.
    const io = req.app.get("io");

    if (io) {
      io.to(`queue:${doctor.id}:${nextToken.clinicId}`).emit("queueUpdated", {
        doctorId: doctor.id,
        clinicId: nextToken.clinicId,
        tokenId: nextToken.id,
        tokenNumber: nextToken.tokenNumber,
        status: "called",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Next patient called",
      currentPatient: {
        tokenId: nextToken.id,
        tokenNumber: nextToken.tokenNumber,
        patientId: nextToken.patientId,
        patientName: nextToken.patientName,
        appointmentTime: nextToken.appointmentTime,
        status: "called",
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePhoto,
  updateAvailability,
  getAllApprovedDoctors,
  getDoctorPatients,
  getDoctorQueue,
  completeAndCallNext,
  callNextPatient,
};
