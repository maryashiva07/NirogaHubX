const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const clinicRoutes = require("./routes/clinicRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const patientRecordRoutes = require("./routes/patientRecordRoutes");

const rateLimitMiddleware = require("./middleware/rateLimitMiddleware");

const {
  notFoundMiddleware,
  errorMiddleware,
} = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const globalRateLimit = rateLimitMiddleware({
  windowInSeconds: 60,
  maxRequests: 100,
  keyPrefix: "global",
});

app.use(globalRateLimit);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NirogaHub API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/patients", patientRoutes);

app.use("/api/doctors", doctorRoutes);

app.use("/api/clinics", clinicRoutes);

app.use("/api/tokens", tokenRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/doctor/patients", patientRecordRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

module.exports = app;
