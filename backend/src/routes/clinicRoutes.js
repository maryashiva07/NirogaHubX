const express = require("express");

const {
  createClinic,
  getMyClinic,
  updateClinic,
  deleteClinic,
  getAllClinics,
} = require("../controllers/clinicController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Patients and doctors can view approved clinics
router.get("/all", authMiddleware, getAllClinics);

// Doctor-only clinic operations
router.use(authMiddleware, roleMiddleware("doctor"));

router.post("/", createClinic);

router.get("/my", getMyClinic);

router.put("/:id", updateClinic);

router.delete("/:id", deleteClinic);

module.exports = router;
