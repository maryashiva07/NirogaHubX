const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Token = sequelize.define(
  "Token",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    clinicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    tokenNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "payment_pending",
        "waiting",
        "called",
        "completed",
        "cancelled"
      ),
      defaultValue: "payment_pending",
    },

    tokenType: {
      type: DataTypes.ENUM("normal", "priority"),
      defaultValue: "normal",
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    appointmentTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    patientName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    patientAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    patientGender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },

    patientMobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },

    patientAddress: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "tokens",
    timestamps: true,
  }
);

module.exports = Token;