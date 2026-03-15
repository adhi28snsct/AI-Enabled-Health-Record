import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  bookAppointment,
  getDoctorAppointmentQueue,
  updateAppointmentStatus,
  acceptAppointment,
  rejectAppointment,
  getHospitalAppointments,
  getPatientAppointments,
} from "../controllers/appointmentController.js";

import { getAllDoctorsForBooking } from "../controllers/doctorController.js";

const router = express.Router();

/* =========================================================
   ROLE MIDDLEWARE
========================================================= */
const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};

/* =========================================================
   DOCTORS (PATIENT VIEW)
========================================================= */

// 🔹 Patient → list doctors for booking
router.get(
  "/doctors",
  authMiddleware,
  requireRole("patient"),
  getAllDoctorsForBooking
);

/* =========================================================
   APPOINTMENTS – PATIENT
========================================================= */

// 🔹 Patient → book appointment
router.post(
  "/",
  authMiddleware,
  requireRole("patient"),
  bookAppointment
);

// 🔹 Patient → view own appointments
router.get(
  "/my",
  authMiddleware,
  requireRole("patient"),
  getPatientAppointments
);

/* =========================================================
   APPOINTMENTS – DOCTOR
========================================================= */

// 🔹 Doctor → appointment queue
router.get(
  "/doctor",
  authMiddleware,
  requireRole("doctor"),
  getDoctorAppointmentQueue
);

// 🔹 Doctor → update appointment status
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("doctor"),
  updateAppointmentStatus
);

// 🔹 Doctor → accept appointment
router.patch(
  "/:id/accept",
  authMiddleware,
  requireRole("doctor"),
  acceptAppointment
);

// 🔹 Doctor → reject appointment
router.patch(
  "/:id/reject",
  authMiddleware,
  requireRole("doctor"),
  rejectAppointment
);

/* =========================================================
   APPOINTMENTS – HOSPITAL ADMIN
========================================================= */

// 🔹 Hospital admin → all hospital appointments
router.get(
  "/hospital",
  authMiddleware,
  requireRole("hospital_admin"),
  getHospitalAppointments
);

export default router;