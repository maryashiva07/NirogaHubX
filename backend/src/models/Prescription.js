const { DataTypes } = require("sequelize");

const { sequelize } = require("../config/database");

const Prescription = sequelize.define(
  "Prescription",
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

    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    diagnosis: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    medicines: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },

    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "prescriptions",
    timestamps: true,
  }
);

module.exports = Prescription;