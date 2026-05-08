const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("./config/env");
const { frontendUrl } = require("./config/env");
const User = require("./models/User");

let io;

const initSocket = (server) => {
  const allowedOrigins = String(frontendUrl || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : true,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    const joinAuthedRooms = async () => {
      const token = socket.handshake?.auth?.token;
      if (!token) return;

      try {
        const decoded = jwt.verify(token, jwtSecret);
        const dbUser = await User.findById(decoded.id).select("_id role isBlocked isAccessGranted");
        if (!dbUser || dbUser.isBlocked) return;
        if (dbUser.role === "user" && dbUser.isAccessGranted === false) return;

        const uid = String(dbUser._id);
        socket.join(uid);
        socket.join(`role:${dbUser.role}`);
        if (dbUser.role === "admin" || dbUser.role === "subowner") {
          socket.join("role:staff");
        }
        console.log(`Socket ${socket.id} authed rooms: ${uid}, role:${dbUser.role}`);
      } catch {
        // ignore invalid tokens (socket stays connected but won't receive protected events)
      }
    };

    joinAuthedRooms();

    // Backward-compatible manual join (client may send userId)
    socket.on("join", (userId) => {
      if (!userId) return;
      socket.join(String(userId));
      console.log(`Socket ${socket.id} joined room: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
