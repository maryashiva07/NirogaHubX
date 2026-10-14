const axios = require("axios");
const { Payment, Token, Patient, User } = require("../models");
const { sequelize } = require("../config/database");

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const CASHFREE_API_VERSION = "2025-01-01";

const createPaymentOrder = async (req, res, next) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: "Token ID is required",
      });
    }

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

    const existingPayment = await Payment.findOne({
      where: {
        tokenId: token.id,
      },
    });

    if (existingPayment && existingPayment.status === "success") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed",
      });
    }

    if (existingPayment && existingPayment.paymentSessionId) {
      return res.status(200).json({
        success: true,
        message: "Existing payment order found",
        tokenId: token.id,
        tokenNumber: token.tokenNumber,
        orderId: existingPayment.orderId,
        paymentSessionId: existingPayment.paymentSessionId,
        amount: existingPayment.amount,
      });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const amount = 10;

    const orderId = `NH_${token.id}_${Date.now()}`;

    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",

        customer_details: {
          customer_id: String(user.id),
          customer_name: token.patientName,
          customer_phone: token.patientMobile,
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

    const cashfreeOrder = response.data;

    const payment = await Payment.create({
      userId: user.id,
      tokenId: token.id,
      orderId: cashfreeOrder.order_id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount,
      status: "pending",
      paymentMethod: "cashfree",
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created",
      paymentId: payment.id,
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      orderId: cashfreeOrder.order_id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount,
    });
  } catch (error) {
    console.error(
      "Cashfree create order error:",
      error.response?.data || error.message,
    );

    next(error);
  }
};



const verifyPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({
      where: {
        orderId,
        userId: req.user.userId,
      },
      transaction,
    });

    if (!payment) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Already verified: return the existing token.
    if (payment.status === "success") {
      const token = await Token.findByPk(payment.tokenId, {
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        paymentStatus: "success",
        token,
      });
    }

    // Verify payment directly with Cashfree.
    const response = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderId}/payments`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": CASHFREE_API_VERSION,
          Accept: "application/json",
        },
      }
    );

    const transactions = response.data;

    let paymentStatus = "failed";

    if (
      transactions.some(
        (item) => item.payment_status === "SUCCESS"
      )
    ) {
      paymentStatus = "success";
    } else if (
      transactions.some(
        (item) => item.payment_status === "PENDING"
      )
    ) {
      paymentStatus = "pending";
    }

    await payment.update(
      { status: paymentStatus },
      { transaction }
    );

    if (paymentStatus === "success") {
      await Token.update(
        { status: "waiting" },
        {
          where: {
            id: payment.tokenId,
            status: "payment_pending",
          },
          transaction,
        }
      );
    }

    // Commit database changes before notifying connected clients.
    await transaction.commit();

    const token = await Token.findByPk(payment.tokenId);

    // Notify only the relevant doctor's clinic queue.
    if (paymentStatus === "success" && token) {
      const io = req.app.get("io");

      if (io) {
        const room = `queue:${token.doctorId}:${token.clinicId}`;

        io.to(room).emit("queueUpdated", {
          doctorId: token.doctorId,
          clinicId: token.clinicId,
          date: token.date,
          tokenId: token.id,
          tokenNumber: token.tokenNumber,
          status: token.status,
          event: "token_created",
        });
      }
    }

    return res.status(200).json({
      success: true,
      paymentStatus,
      token,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error(
      "Cashfree verification error:",
      error.response?.data || error.message
    );

    next(error);
  }
};




const getPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({
      where: {
        orderId,
        userId: req.user.userId,
      },

      include: [
        {
          model: Token,
          attributes: [
            "id",
            "tokenNumber",
            "status",
            "tokenType",
            "date",
            "patientName",
            "patientAge",
            "patientGender",
            "patientMobile",
            "patientAddress",
          ],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

const cashfreeWebhook = async (req, res, next) => {
  try {
    console.log("Cashfree webhook received");

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPayment,
  cashfreeWebhook,
};
