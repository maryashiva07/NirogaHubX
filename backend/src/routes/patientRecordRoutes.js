const express = require("express");

const {
  getPatientDetails,
  getPatientHistory,
  getPatientPrescriptions,
  createPrescription,
} = require("../controllers/patientRecordController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("doctor"));

console.log("Patient record router loaded");
// Patient profile
router.get("/:patientId", getPatientDetails);

// Patient visit history
router.get("/:patientId/history", getPatientHistory);

// Patient prescriptions
router.get("/:patientId/prescriptions", getPatientPrescriptions);

// Create prescription
router.post("/:patientId/prescriptions", createPrescription);

module.exports = router;
