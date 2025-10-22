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

// 1. PROFILE (Requires ID for retrieval/update)
// The frontend calls: /patients/[userId] 
router.get("/:userId", authMiddleware, getPatientProfile);
router.patch("/:userId", authMiddleware, updatePatientProfile); // Updated to accept ID for clarity

// 2. MEDICAL RECORDS (Requires ID to fetch specific patient's data)
// The frontend calls: /patients/[userId]/records, /patients/[userId]/ai-summary, etc.
router.get("/:userId/records", authMiddleware, getPatientRecords);
router.get("/:userId/prescriptions", authMiddleware, getPatientPrescriptions);
router.get("/:userId/lab-reports", authMiddleware, getPatientLabReports);
router.get("/:userId/alerts", authMiddleware, getPatientAlerts);
router.get("/:userId/ai-summary", authMiddleware, getPatientAISummary);


export default router;