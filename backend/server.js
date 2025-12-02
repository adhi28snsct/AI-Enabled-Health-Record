import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patients.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;
const PORT = process.env.PORT || 5000;

async function start() {
  const app = express();
  app.use(cors({ origin: FRONTEND_ORIGIN }));
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/doctor", doctorRoutes);
  app.use("/api/appointments", appointmentRoutes);

  app.use("/api/notifications", notificationRoutes);

  const server = http.createServer(app);

  const io = new IOServer(server, {
    cors: {
      origin: FRONTEND_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  // Optional Redis adapter
  if (REDIS_URL) {
    try {
      const { createAdapter } = await import("@socket.io/redis-adapter");
      const { createClient } = await import("redis");
      const pubClient = createClient({ url: REDIS_URL });
      const subClient = pubClient.duplicate();
      await pubClient.connect();
      await subClient.connect();
      io.adapter(createAdapter(pubClient, subClient));
      console.log("✅ Socket.IO Redis adapter enabled");
    } catch (err) {
      console.warn("⚠️ Failed to enable Redis adapter:", err.message || err);
    }
  }
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication token required"));
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      payload.id = payload.id ?? payload._id ?? payload.userId;
      socket.user = payload;
      return next();
    } catch (err) {
      console.error("Socket auth error:", err.message || err);
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.user?.id ?? "unknown");

    socket.on("room:join", (room) => {
      try {
        if (!room || typeof room !== "string") return;

        if (room.startsWith("patient:")) {
          const patientId = room.split(":")[1];
          const allowed =
            socket.user &&
            (String(socket.user.id) === String(patientId) ||
              socket.user.role === "doctor" ||
              socket.user.role === "admin");
          if (allowed) {
            socket.join(room);
            console.log(`Socket ${socket.id} joined ${room}`);
          } else {
            socket.emit("error", { message: "Not authorized to join room" });
          }
          return;
        }

        if (room.startsWith("doctor:")) {
          const doctorId = room.split(":")[1];
          const allowed =
            socket.user &&
            (String(socket.user.id) === String(doctorId) ||
              socket.user.role === "doctor" ||
              socket.user.role === "admin");
          if (allowed) {
            socket.join(room);
            console.log(`Socket ${socket.id} joined ${room}`);
          } else {
            socket.emit("error", { message: "Not authorized to join room" });
          }
          return;
        }

        console.warn("Unsupported room:", room);
        socket.emit("error", { message: "Unsupported room" });
      } catch (err) {
        console.error("Error in room:join handler:", err);
      }
    });

    socket.on("room:leave", (room) => {
      if (!room || typeof room !== "string") return;
      socket.leave(room);
      console.log(`Socket ${socket.id} left ${room}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, "reason:", reason);
    });
  });

  app.set("io", io);

  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is not set");
    await mongoose.connect(MONGO_URI, { dbName: "Health_Record_Platform" });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ Mongo Error:", err.message || err);
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    try {
      console.log(`\n🌙 Received ${signal} — shutting down gracefully...`);
      server.close(() => console.log("HTTP server closed"));
      io.close();
      await mongoose.disconnect();
      console.log("✅ Clean shutdown complete");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (r) =>
    console.error("Unhandled Rejection:", r)
  );
  process.on("uncaughtException", (err) =>
    console.error("Uncaught Exception:", err)
  );
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
