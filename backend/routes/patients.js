import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientRecords,
  getPatientPrescriptions,
  getPatientLabReports,
  getPatientAlerts,
  getPatientAISummary,
} from "../controllers/patientController.js";

const router = express.Router();

// 👤 Patient Routes — All protected and token-based

router.get("/profile", authMiddleware, getPatientProfile);
router.patch("/profile", authMiddleware, updatePatientProfile);

router.get("/records", authMiddleware, getPatientRecords);
router.get("/prescriptions", authMiddleware, getPatientPrescriptions);
router.get("/lab-reports", authMiddleware, getPatientLabReports);
router.get("/alerts", authMiddleware, getPatientAlerts);
router.get("/ai-summary", authMiddleware, getPatientAISummary);

export default router;