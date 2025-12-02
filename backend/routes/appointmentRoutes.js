import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  bookAppointment,
  getDoctorAppointmentQueue,
  updateAppointmentStatus,
  getAppointmentById,
} from "../controllers/appointmentController.js";

import { getAllDoctors } from "../controllers/doctorController.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== role)
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  return next();
};

router.post(
  "/book",
  authMiddleware,
  requireRole("patient"),
  bookAppointment
);

router.get(
  "/patient/appointments",
  authMiddleware,
  requireRole("patient"),
  async (req, res) => {
    try {
      const patientId = req.user._id;
      const list = await Appointment.find({ patient: patientId })
        .sort({ requested_at: -1 })
        .lean();
      return res.json({ data: list });
    } catch (err) {
      console.error("[GET patient/appointments] Error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/doctor/appointments",
  authMiddleware,
  requireRole("doctor"),
  getDoctorAppointmentQueue
);

// FIXED: single appointment route should be relative to the router base
router.get("/:id", authMiddleware, getAppointmentById);

router.patch(
  "/doctor/appointments/:id/status",
  authMiddleware,
  requireRole("doctor"),
  updateAppointmentStatus
);

router.get("/doctors/available", authMiddleware, getAllDoctors);

export default router;
