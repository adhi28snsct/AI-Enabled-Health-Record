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
router.get("/:id", authMiddleware, getPatientProfile);
router.patch("/:id", authMiddleware, updatePatientProfile);
router.get("/:id/records", authMiddleware, getPatientRecords);
router.get("/:id/prescriptions", authMiddleware, getPatientPrescriptions);
router.get("/:id/lab-reports", authMiddleware, getPatientLabReports);
router.get("/:id/alerts", authMiddleware, getPatientAlerts);
router.get("/:id/ai-summary", authMiddleware, getPatientAISummary);

export default router;
