import express from "express";
import {
  // Patients
  getAllPatients,

  // Vitals
  getPatientVitals,
  addPatientVitals,
  updateVitals,
  deleteVitals,

  // Prescriptions
  getPatientPrescriptions,
  addPrescription,
  updatePrescription,
  deletePrescription,
  addPrescriptionById, // Optional: POST with ID in URL

  // Lab Reports
  getPatientLabReports,
  addLabReport,
  updateLabReport,
  deleteLabReport,

  // AI Summary
  getPatientAISummary,
  addAISummary,
  updateAISummary,
  deleteAISummary,

  // Alerts
  getPatientAlerts,
  addAlert,
  updateAlert,
  deleteAlert

  // Impressions
  
} from "../controllers/doctorController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👨‍⚕️ Doctor Endpoints — All protected routes

// 🧑‍🤝‍🧑 Patients
router.get("/patients", authMiddleware, getAllPatients);

// ❤️ Vitals
router.get("/vitals/:patientId", authMiddleware, getPatientVitals);
router.post("/vitals", authMiddleware, addPatientVitals);
router.put("/vitals/:id", authMiddleware, updateVitals);
router.delete("/vitals/:id", authMiddleware, deleteVitals);

// 💊 Prescriptions
router.get("/prescriptions/:patientId", authMiddleware, getPatientPrescriptions);
router.post("/prescriptions", authMiddleware, addPrescription);
router.put("/prescriptions/:id", authMiddleware, updatePrescription);
router.delete("/prescriptions/:id", authMiddleware, deletePrescription);
router.post("/prescriptions/:id", authMiddleware, addPrescriptionById); // Optional route

// 🧪 Lab Reports
router.get("/lab-reports/:patientId", authMiddleware, getPatientLabReports);
router.post("/lab-reports", authMiddleware, addLabReport);
router.put("/lab-reports/:id", authMiddleware, updateLabReport);
router.delete("/lab-reports/:id", authMiddleware, deleteLabReport);

// 🧠 AI Summary
router.get("/ai-summary/:patientId", authMiddleware, getPatientAISummary);
router.post("/ai-summary", authMiddleware, addAISummary);
router.put("/ai-summary/:id", authMiddleware, updateAISummary);
router.delete("/ai-summary/:id", authMiddleware, deleteAISummary);

// 🚨 Alerts
router.get("/alerts/:patientId", authMiddleware, getPatientAlerts);
router.post("/alerts", authMiddleware, addAlert);
router.put("/alerts/:id", authMiddleware, updateAlert);
router.delete("/alerts/:id", authMiddleware, deleteAlert);


export default router;