const { User, Patient } = require("../models");

const getProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: {
        userId: req.user.userId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "mobile", "photo", "role"],
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, age, gender, address, emergencyContact } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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

    await user.update({
      name: name || user.name,
    });

    await patient.update({
      age: age || null,
      gender: gender || null,
      address: address || null,
      emergencyContact: emergencyContact || null,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

const updatePhoto = async (req, res, next) => {
  try {
    console.log("PHOTO REQUEST RECEIVED");
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const photoUrl = `/uploads/patients/${req.file.filename}`;

    await user.update({
      photo: photoUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      photo: photoUrl,
    });
  } catch (error) {
    console.error("PHOTO UPLOAD ERROR:", error);

    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePhoto,
};
