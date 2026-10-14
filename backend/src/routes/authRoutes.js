const express = require("express");

const { signup, login, getMe } = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const rateLimitMiddleware = require("../middleware/rateLimitMiddleware");

const router = express.Router();

const loginRateLimit = rateLimitMiddleware({
  windowInSeconds: 60,
  maxRequests: 5,
  keyPrefix: "login",
});

router.post("/signup", signup);

router.post("/login", loginRateLimit, login);

router.get("/me", authMiddleware, getMe);

module.exports = router;
