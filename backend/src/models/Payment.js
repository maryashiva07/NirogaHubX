const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    orderId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    paymentSessionId: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "success",
        "failed",
        "refunded"
      ),
      defaultValue: "pending",
    },

    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

module.exports = Payment;