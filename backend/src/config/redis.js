
const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    tls: true,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error("Redis reconnect limit reached");
      }

      return Math.min(retries * 500, 5000);
    },
  },
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis connected successfully");
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    throw error;
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
