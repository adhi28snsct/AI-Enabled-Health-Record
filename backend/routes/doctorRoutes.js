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
import { authMiddleware } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// 👨‍⚕️ Doctor Endpoints — All protected routes
router.get("/patients", authMiddleware, getAllPatients);

router.get("/vitals/:patientId", authMiddleware, getPatientVitals);
router.post("/vitals", authMiddleware, addPatientVitals);

router.get("/prescriptions/:patientId", authMiddleware, getPatientPrescriptions);
router.post("/prescriptions", authMiddleware, addPrescription);

router.get("/lab-reports/:patientId", authMiddleware, getPatientLabReports);
router.post("/lab-reports", authMiddleware, addLabReport);

router.get("/ai-summary/:patientId", authMiddleware, getPatientAISummary);
router.post("/ai-summary", authMiddleware, addAISummary);

router.get("/alerts/:patientId", authMiddleware, getPatientAlerts);
router.post("/alerts", authMiddleware, addAlert);

export default router;
