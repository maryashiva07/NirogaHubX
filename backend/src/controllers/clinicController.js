const { Clinic, Doctor, User } = require("../models");

// Create clinic for logged-in doctor
const createClinic = async (req, res, next) => {
  try {
    const { name, address, location, phone, timings } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: "Clinic name and address are required",
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

    const clinic = await Clinic.create({
      doctorId: doctor.id,
      name,
      address,
      location,
      phone,
      timings,
    });

    return res.status(201).json({
      success: true,
      message: "Clinic created successfully",
      clinic,
    });
  } catch (error) {
    next(error);
  }
};

// Get clinic of logged-in doctor
const getMyClinic = async (req, res, next) => {
  try {
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

    const clinic = await Clinic.findOne({
      where: {
        doctorId: doctor.id,
      },
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    return res.status(200).json({
      success: true,
      clinic,
    });
  } catch (error) {
    next(error);
  }
};

// Update logged-in doctor's clinic
const updateClinic = async (req, res, next) => {
  try {
    const { name, address, location, phone, timings } = req.body;

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

    const clinic = await Clinic.findOne({
      where: {
        doctorId: doctor.id,
      },
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    await clinic.update({
      name,
      address,
      location,
      phone,
      timings,
    });

    return res.status(200).json({
      success: true,
      message: "Clinic updated successfully",
      clinic,
    });
  } catch (error) {
    next(error);
  }
};

// Delete logged-in doctor's clinic
const deleteClinic = async (req, res, next) => {
  try {
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

    const clinic = await Clinic.findOne({
      where: {
        doctorId: doctor.id,
      },
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    await clinic.destroy();

    return res.status(200).json({
      success: true,
      message: "Clinic deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get approved doctors' clinics for patients
const getAllClinics = async (req, res, next) => {
  try {
    const clinics = await Clinic.findAll({
      include: [
        {
          model: Doctor,
          where: {
            status: "approved",
          },
          attributes: [
            "id",
            "userId",
            "specialization",
            "experience",
            "consultationFee",
            "profileImage",
          ],
          include: [
            {
              model: User,
              attributes: ["id", "name", "mobile", "photo"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: clinics.length,
      clinics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClinic,
  getMyClinic,
  updateClinic,
  deleteClinic,
  getAllClinics,
};
