const { redisClient } = require("../config/redis");

const rateLimitMiddleware = ({
  windowInSeconds = 60,
  maxRequests = 100,
  keyPrefix = "rate-limit",
}) => {
  return async (req, res, next) => {
    try {
      const identifier = req.ip;

      const key = `${keyPrefix}:${identifier}`;

      const currentRequests = await redisClient.incr(key);

      // First request → set expiration
      if (currentRequests === 1) {
        await redisClient.expire(key, windowInSeconds);
      }

      // Headers for client
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, maxRequests - currentRequests),
      );

      if (currentRequests > maxRequests) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);

      next();
    }
  };
};

module.exports = rateLimitMiddleware;
