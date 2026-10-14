const bcrypt = require("bcryptjs");

const { User, Patient, Doctor } = require("../models");
const { sequelize } = require("../config/database");

const generateToken = require("../utils/generateToken");

// Signup

const signup = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, mobile, password, photo, role } = req.body;

    if (!name || !mobile || !password || !role) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Name, mobile, password and role are required",
      });
    }

    // Validate role
    if (!["patient", "doctor"].includes(role)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      where: {
        mobile,
      },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "Mobile number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create(
      {
        name,
        mobile,
        password: hashedPassword,
        photo: photo || null,
        role,
      },
      {
        transaction,
      },
    );

    // Create role-specific profile
    if (role === "patient") {
      await Patient.create(
        {
          userId: user.id,
        },
        {
          transaction,
        },
      );
    }

    if (role === "doctor") {
      await Doctor.create(
        {
          userId: user.id,
        },
        {
          transaction,
        },
      );
    }

    // Commit transaction
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: `${role} signup successful`,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    // Rollback if something failed
    if (!transaction.finished) {
      await transaction.rollback();
    }

    next(error);
  }
};

// Login

const login = async (req, res, next) => {
  try {
    const { mobile, password, role } = req.body;

    // Validate fields
    if (!mobile || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Mobile, password and login role are required",
      });
    }

    // Validate requested role
    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid login role",
      });
    }

    // Find user by mobile
    const user = await User.findOne({
      where: {
        mobile,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile or password",
      });
    }

    // Check whether account belongs to selected login type
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "This account is not registered for this login.",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // Compare password
    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile or password",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User

const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
};
