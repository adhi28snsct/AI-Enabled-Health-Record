import express from "express";
import {
  getAllPatients,
  getPatientVitals,
  addPatientVitals,
  getPatientPrescriptions,
  addPrescription,
  getPatientLabReports,
  addLabReport,
  getPatientAISummary,
  addAISummary,
  getPatientAlerts,
  addAlert,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js"; // if you have JWT auth

const router = express.Router();

// 👨‍⚕️ Doctor Endpoints — All protected routes
router.get("/patients", protect, getAllPatients);

router.get("/vitals/:patientId", protect, getPatientVitals);
router.post("/vitals", protect, addPatientVitals);

router.get("/prescriptions/:patientId", protect, getPatientPrescriptions);
router.post("/prescriptions", protect, addPrescription);

router.get("/lab-reports/:patientId", protect, getPatientLabReports);
router.post("/lab-reports", protect, addLabReport);

router.get("/ai-summary/:patientId", protect, getPatientAISummary);
router.post("/ai-summary", protect, addAISummary);

router.get("/alerts/:patientId", protect, getPatientAlerts);
router.post("/alerts", protect, addAlert);

export default router;
