import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// 💡 Import ALL Route Files (Auth, Patient Read, Doctor Actions, Appointments)
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patients.js"; 
import doctorRoutes from "./routes/doctorRoutes.js"; 
import appointmentRoutes from "./routes/appointmentRoutes.js"; // Appointment System Routes

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Body parser for JSON payloads

// --- Register all API Routes ---
// The final mapping for your entire application
app.use("/api/auth", authRoutes); // Handles login/register and Health Worker patient creation
app.use("/api/patients", patientRoutes); // Handles Patient Portal retrieval requests
app.use("/api/doctor", doctorRoutes); // Handles Doctor C.R.U.D. actions (Vitals, Labs, Prescriptions)
app.use("/api/appointments", appointmentRoutes); // Handles appointment booking and triage queue

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, { dbName: "Health_Record_Platform" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error:", err.message));

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));