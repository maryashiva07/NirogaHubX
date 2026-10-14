require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");

const { connectDB, sequelize } = require("./config/database");
const { connectRedis } = require("./config/redis");

const registerTokenSocket = require("./sockets/tokenSocket");

require("./models");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make Socket.IO available
app.set("io", io);

// Register connection
registerTokenSocket(io);

const startServer = async () => {
  try {
    await connectDB();

    await sequelize.sync({ alter: false });

    await connectRedis();

    server.listen(PORT, () => {
      console.log(`NirogaHub server running on port ${PORT}`);
      console.log(`Socket.IO running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed");
    console.error(error);

    process.exit(1);
  }
};

startServer();
