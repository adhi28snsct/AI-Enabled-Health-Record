import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { 
    bookAppointment, 
    getDoctorAppointmentQueue,
    updateAppointmentStatus 
} from "../controllers/appointmentController.js";

const router = express.Router();

// 📅 Patient Request Route (Accessible by Patient Portal)
router.post("/book", authMiddleware, bookAppointment);

// 🩺 Doctor Appointment Management Routes (Protected)
router.get("/doctor/appointments", authMiddleware, getDoctorAppointmentQueue);
router.patch("/doctor/appointments/:id/status", authMiddleware, updateAppointmentStatus);

export default router;