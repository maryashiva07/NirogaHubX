const { User, Patient, Doctor, Token, Prescription } = require("../models");

// Get Patient Details

const getPatientDetails = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: { userId: req.user.userId },
      attributes: ["id"],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // Dashboard passes Token.id, not Patient.id.
    const tokenId = Number(req.params.patientId);

    if (!Number.isInteger(tokenId) || tokenId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid token ID",
      });
    }

    const token = await Token.findOne({
      where: {
        id: tokenId,
        doctorId: doctor.id,
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found for this doctor",
      });
    }

    const patientDetails = {
      id: token.patientId,
      tokenId: token.id,
      patientId: token.patientId,
      name: token.patientName,
      age: token.patientAge,
      gender: token.patientGender,
      mobile: token.patientMobile,
      address: token.patientAddress,
      photo: null,
    };

    return res.status(200).json({
      success: true,
      patient: patientDetails,
      latestVisit: token,
    });
  } catch (error) {
    next(error);
  }
};


// Get Patient Visit History

const getPatientHistory = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: { userId: req.user.userId },
      attributes: ["id"],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // URL parameter is Token ID, not Patient ID.
    const tokenId = Number(req.params.patientId);

    const selectedToken = await Token.findOne({
      where: {
        id: tokenId,
        doctorId: doctor.id,
      },
    });

    if (!selectedToken) {
      return res.status(404).json({
        success: false,
        message: "Token not found for this doctor",
      });
    }

    // Get all visits for this patient with this doctor.
    const history = await Token.findAll({
      where: {
        patientId: selectedToken.patientId,
        doctorId: doctor.id,
      },
      order: [
        ["date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};


// Get Patient Prescriptions

const getPatientPrescriptions = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: { userId: req.user.userId },
      attributes: ["id"],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const tokenId = Number(req.params.patientId);

    const selectedToken = await Token.findOne({
      where: {
        id: tokenId,
        doctorId: doctor.id,
      },
    });

    if (!selectedToken) {
      return res.status(404).json({
        success: false,
        message: "Token not found for this doctor",
      });
    }

    const prescriptions = await Prescription.findAll({
      where: {
        patientId: selectedToken.patientId,
        doctorId: doctor.id,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};


// Create Prescription

const createPrescription = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: { userId: req.user.userId },
      attributes: ["id"],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const tokenId = Number(req.params.patientId);
    const {
      diagnosis,
      medicines,
      instructions,
      followUpDate,
      notes,
    } = req.body;

    if (!Number.isInteger(tokenId) || tokenId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid token ID",
      });
    }

    if (!Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        message: "Medicines must be an array",
      });
    }

    const selectedToken = await Token.findOne({
      where: {
        id: tokenId,
        doctorId: doctor.id,
      },
    });

    if (!selectedToken) {
      return res.status(404).json({
        success: false,
        message: "Token not found for this doctor",
      });
    }

    const prescription = await Prescription.create({
      patientId: selectedToken.patientId,
      doctorId: doctor.id,
      tokenId: selectedToken.id,
      diagnosis: diagnosis || null,
      medicines,
      instructions: instructions || null,
      followUpDate: followUpDate || null,
      notes: notes || null,
    });

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getPatientDetails,
  getPatientHistory,
  getPatientPrescriptions,
  createPrescription,
};
