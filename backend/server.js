// server.js
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
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173"; // comma-separated allowed origins
const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;
const PORT = process.env.PORT || 5000;

async function start() {
  const app = express();

  // If behind a proxy (nginx, cloud load balancer) enable trust proxy
  app.set("trust proxy", true);

  // normalize allowed origins into an array
  const FRONTEND_ORIGINS = (FRONTEND_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // express-level CORS: allow credentials and common headers
  app.use(
    cors({
      origin: (origin, callback) => {
        // allow non-browser (e.g. server-to-server) requests where origin is undefined
        if (!origin) return callback(null, true);
        if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error("CORS not allowed by server"), false);
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
      exposedHeaders: ["Content-Range", "X-Total-Count"],
    })
  );

  app.use(express.json());

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/doctor", doctorRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/notifications", notificationRoutes);

  // create HTTP server
  const server = http.createServer(app);

  // set up Socket.IO with explicit CORS and slightly relaxed ping config
  const io = new IOServer(server, {
    path: "/socket.io",
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error("Socket CORS not allowed"), false);
      },
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
    },
    // ping/pong timeout tweaks - increases tolerance for flaky networks/proxies
    pingInterval: 25000,
    pingTimeout: 60000,
    maxHttpBufferSize: 1e6,
  });

  // Optional Redis adapter for horizontal scaling
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

  // socket auth middleware using handshake.auth.token (client sends via auth)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn("[socket] connection attempt without token, socket id:", socket.id);
      return next(new Error("Authentication token required"));
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // normalize id field
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

  // make io accessible from express routes if needed
  app.set("io", io);

  // connect to Mongo
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is not set");
    await mongoose.connect(MONGO_URI, { dbName: "Health_Record_Platform" });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ Mongo Error:", err.message || err);
    process.exit(1);
  }

  // start server
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // graceful shutdown
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

  process.on("unhandledRejection", (r) => console.error("Unhandled Rejection:", r));
  process.on("uncaughtException", (err) => console.error("Uncaught Exception:", err));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
