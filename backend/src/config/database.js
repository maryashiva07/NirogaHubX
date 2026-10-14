const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",

    logging: false,
  },
);

const connectDB = async () => {
  console.log({
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
  });

  try {
    await sequelize.authenticate();

    console.log("MySQL connected successfully");
  } catch (error) {
    console.error("MySQL connection failed");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
