const express = require("express");

const {
  createToken,
  getMyTokens,
  getTokenHistory,
  getQueuePosition,
} = require("../controllers/tokenController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("patient"), createToken);

router.get("/my", authMiddleware, roleMiddleware("patient"), getMyTokens);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware("patient"),
  getTokenHistory,
);

router.get(
  "/queue-position/:tokenId",
  authMiddleware,
  roleMiddleware("patient"),
  getQueuePosition,
);

module.exports = router;
