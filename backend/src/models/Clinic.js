const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Clinic = sequelize.define(
  "Clinic",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    timings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "clinics",
    timestamps: true,
  },
);

module.exports = Clinic;
