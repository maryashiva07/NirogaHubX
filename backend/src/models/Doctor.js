const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Doctor = sequelize.define(
  "Doctor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    specialization: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    clinicName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "approved",
    },

    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    availableSlots: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    profileImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "doctors",
    timestamps: true,
  }
);

module.exports = Doctor;