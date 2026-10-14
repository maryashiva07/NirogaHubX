const express = require("express");

const {
  getProfile,
  updateProfile,
  updatePhoto,
} = require("../controllers/patientController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { uploadPatientPhoto } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("patient"));

router.get("/profile", getProfile);

router.put("/profile", updateProfile);

router.put("/photo", uploadPatientPhoto.single("photo"), updatePhoto);

module.exports = router;
