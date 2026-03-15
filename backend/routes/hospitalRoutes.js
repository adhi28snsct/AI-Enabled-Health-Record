import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  addDoctor,
  getHospitalDoctors,
  approveDoctor,
  deactivateDoctor,
  getHospitalPatients,
  getHospitalAppointments,
  getHospitalStats,
} from "../controllers/hospitalPortal/hospitalController.js";

const router = express.Router();

/* ======================================================
   HOSPITAL ADMIN GUARD
====================================================== */
const requireHospitalAdmin = (req, res, next) => {
  if (req.user.role !== "hospital_admin") {
    return res.status(403).json({ message: "Hospital admin only" });
  }

  if (!req.user.hospitalId) {
    return res.status(400).json({ message: "Hospital not assigned" });
  }

  next();
};

/* ======================================================
   ALL ROUTES PROTECTED
====================================================== */
router.use(authMiddleware, requireHospitalAdmin);

/* ======================================================
   DOCTOR MANAGEMENT
====================================================== */

// ✅ Create doctor directly (no invite system)
router.post("/add-doctor", addDoctor);

router.get("/doctors", getHospitalDoctors);

router.patch("/approve-doctor/:id", approveDoctor);

router.patch("/deactivate-doctor/:doctorId", deactivateDoctor);

/* ======================================================
   HOSPITAL DATA (READ ONLY)
====================================================== */

router.get("/patients", getHospitalPatients);

router.get("/appointments", getHospitalAppointments);

router.get("/stats", getHospitalStats);

export default router;