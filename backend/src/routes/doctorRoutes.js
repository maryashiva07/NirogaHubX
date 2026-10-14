const express = require("express");

const {
  getProfile,
  updateProfile,
  updatePhoto,
  updateAvailability,
  getAllApprovedDoctors,
  getDoctorPatients,
  getDoctorQueue,
  completeAndCallNext,
  callNextPatient,
} = require("../controllers/doctorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { uploadDoctorPhoto } = require("../middleware/doctorUploadMiddleware");

const router = express.Router();

// Logged-in users can see approved doctors
router.get("/all", authMiddleware, getAllApprovedDoctors);

// Doctor authentication
router.use(authMiddleware, roleMiddleware("doctor"));

router.get("/profile", getProfile);

router.put("/profile", updateProfile);

router.put("/photo", uploadDoctorPhoto.single("photo"), updatePhoto);

router.put("/availability", updateAvailability);

router.get("/patients", getDoctorPatients);

router.get("/queue/today", getDoctorQueue);

router.post("/queue/complete-and-next", completeAndCallNext);

router.post("/queue/call-next", callNextPatient);

module.exports = router;
