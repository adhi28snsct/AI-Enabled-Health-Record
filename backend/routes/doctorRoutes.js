import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
  getMyPatients,
  getMyAppointments,
  getPatientVitalsForDoctor,
  getPatientPrescriptionsForDoctor,
  getPatientLabReportsForDoctor,
  getPatientAISummaryForDoctor,
  getPatientAlertsForDoctor,
} from "../controllers/doctorController.js";

const router = express.Router();

router.use(authMiddleware);

/* ===== PROFILE ===== */
router.get("/me", getMyDoctorProfile);
router.patch("/me", updateMyDoctorProfile);

/* ===== DASHBOARD ===== */
router.get("/patients", getMyPatients);
router.get("/my-appointments", getMyAppointments);

/* ===== PATIENT DATA ===== */
router.get("/patients/:patientId/vitals", getPatientVitalsForDoctor);
router.get("/patients/:patientId/prescriptions", getPatientPrescriptionsForDoctor);
router.get("/patients/:patientId/lab-reports", getPatientLabReportsForDoctor);
router.get("/patients/:patientId/ai-summary", getPatientAISummaryForDoctor);
router.get("/patients/:patientId/alerts", getPatientAlertsForDoctor);

export default router;