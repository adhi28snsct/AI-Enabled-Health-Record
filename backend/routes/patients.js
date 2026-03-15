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

router.get("/me/profile", authMiddleware, getPatientProfile);
router.patch("/me/profile", authMiddleware, updatePatientProfile);

router.get("/me/records", authMiddleware, getPatientRecords);
router.get("/me/prescriptions", authMiddleware, getPatientPrescriptions);
router.get("/me/lab-reports", authMiddleware, getPatientLabReports);
router.get("/me/alerts", authMiddleware, getPatientAlerts);
router.get("/me/ai-summary", authMiddleware, getPatientAISummary);


export default router;