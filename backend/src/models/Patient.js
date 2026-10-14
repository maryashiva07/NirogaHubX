const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Patient = sequelize.define(
  "Patient",
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

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    emergencyContact: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
  },
  {
    tableName: "patients",
    timestamps: true,
  }
);

module.exports = Patient;