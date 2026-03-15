// server.js

import dotenv from "dotenv"
dotenv.config() // ✅ ALWAYS FIRST

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import http from "http"
import { Server as IOServer } from "socket.io"
import jwt from "jsonwebtoken"

/* ================= ROUTES ================= */

import authRoutes from "./routes/auth.js"
import patientRoutes from "./routes/patients.js"
import doctorRoutes from "./routes/doctorRoutes.js"
import appointmentRoutes from "./routes/appointmentRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"

import vitalsRoutes from "./routes/vitalsRoutes.js"
import prescriptionRoutes from "./routes/prescriptionRoutes.js"
import labReportRoutes from "./routes/labReportRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"

import hospitalAdminRoutes from "./routes/hospitalRoutes.js"
import platformAdminRoutes from "./routes/platformadminRoutes.js"

/* ================= ENV ================= */

const JWT_SECRET = process.env.JWT_SECRET
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173"
const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT || 5000

if (!JWT_SECRET || !MONGO_URI) {
  console.error("❌ Missing required environment variables")
  process.exit(1)
}

/* ======================================================
   START SERVER
====================================================== */

async function start() {
  try {
    const app = express()
    app.set("trust proxy", true)

    /* ================= CORS ================= */

    const FRONTEND_ORIGINS = FRONTEND_ORIGIN.split(",").map((s) =>
      s.trim()
    )

    app.use(
      cors({
        origin: (origin, cb) => {
          if (!origin) return cb(null, true)
          if (FRONTEND_ORIGINS.includes(origin)) return cb(null, true)
          return cb(new Error("CORS blocked"), false)
        },
        credentials: true,
      })
    )

    app.use(express.json())

    /* ================= HEALTH CHECK ================= */

    app.get("/health", (req, res) => {
      res.json({ status: "OK", uptime: process.uptime() })
    })

    /* ================= API ROUTES ================= */

    app.use("/api/auth", authRoutes)

    app.use("/api/platform", platformAdminRoutes)
    app.use("/api/hospital", hospitalAdminRoutes)

    app.use("/api/patients", patientRoutes)
    app.use("/api/doctor", doctorRoutes)
    app.use("/api/appointments", appointmentRoutes)
    app.use("/api/notifications", notificationRoutes)

    app.use("/api/vitals", vitalsRoutes)
    app.use("/api/prescriptions", prescriptionRoutes)
    app.use("/api/lab-reports", labReportRoutes)
    app.use("/api/ai", aiRoutes)

    /* ================= 404 HANDLER ================= */

    app.use((req, res) => {
      res.status(404).json({
        message: "Route not found",
      })
    })

    /* ================= GLOBAL ERROR HANDLER ================= */

    app.use((err, req, res, next) => {
      console.error("❌ Global Error:", err)

      res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
      })
    })

    /* ================= SOCKET ================= */

    const server = http.createServer(app)

    const io = new IOServer(server, {
      cors: {
        origin: FRONTEND_ORIGINS,
        credentials: true,
      },
    })

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error("No token"))

      try {
        const payload = jwt.verify(token, JWT_SECRET)
        socket.user = payload
        next()
      } catch {
        next(new Error("Invalid token"))
      }
    })

    io.on("connection", (socket) => {
      console.log(
        "🔌 Socket connected:",
        socket.id,
        "User:",
        socket.user?.id
      )

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id)
      })
    })

    app.set("io", io)

    /* ================= DATABASE ================= */

    await mongoose.connect(MONGO_URI, {
      dbName: "Health_Record_Platform",
    })

    console.log("✅ MongoDB Connected")

    /* ================= START LISTENING ================= */

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error("❌ Failed to start server:", err)
    process.exit(1)
  }
}

start()