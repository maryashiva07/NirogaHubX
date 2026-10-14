const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
  getPayment,
  cashfreeWebhook,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/create-order",
  authMiddleware,
  roleMiddleware("patient"),
  createPaymentOrder
);

router.get(
  "/:orderId/verify",
  authMiddleware,
  roleMiddleware("patient"),
  verifyPayment
);

router.get(
  "/:orderId",
  authMiddleware,
  roleMiddleware("patient"),
  getPayment
);

router.post(
  "/webhook",
  cashfreeWebhook
);

module.exports = router;