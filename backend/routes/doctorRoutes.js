import express from "express";
import {

  getAllPatients,
  getPatientVitals,
  addPatientVitals,
  updateVitals,
  deleteVitals,

  getPatientPrescriptions,
  addPrescription,
  updatePrescription,
  deletePrescription,
  addPrescriptionById, 

  getPatientLabReports,
  addLabReport,
  updateLabReport,
  deleteLabReport,

  getPatientAISummary,
  addAISummary,
  updateAISummary,
  deleteAISummary,

  getPatientAlerts,
  addAlert,
  updateAlert,
  deleteAlert,
  getDoctorProfile,
  updateDoctorProfile,
  getAllDoctors
  
} from "../controllers/doctorController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/patients", authMiddleware, getAllPatients);

router.get("/vitals/:patientId", authMiddleware, getPatientVitals);
router.post("/vitals", authMiddleware, addPatientVitals);
router.put("/vitals/:id", authMiddleware, updateVitals);
router.delete("/vitals/:id", authMiddleware, deleteVitals);

router.get("/prescriptions/:patientId", authMiddleware, getPatientPrescriptions);
router.post("/prescriptions", authMiddleware, addPrescription);
router.put("/prescriptions/:id", authMiddleware, updatePrescription);
router.delete("/prescriptions/:id", authMiddleware, deletePrescription);
router.post("/prescriptions/:id", authMiddleware, addPrescriptionById);

router.get("/lab-reports/:patientId", authMiddleware, getPatientLabReports);
router.post("/lab-reports", authMiddleware, addLabReport);
router.put("/lab-reports/:id", authMiddleware, updateLabReport);
router.delete("/lab-reports/:id", authMiddleware, deleteLabReport);

router.get("/ai-summary/:patientId", authMiddleware, getPatientAISummary);
router.post("/ai-summary", authMiddleware, addAISummary);
router.put("/ai-summary/:id", authMiddleware, updateAISummary);
router.delete("/ai-summary/:id", authMiddleware, deleteAISummary);

router.get("/alerts/:patientId", authMiddleware, getPatientAlerts);
router.post("/alerts", authMiddleware, addAlert);
router.put("/alerts/:id", authMiddleware, updateAlert);
router.delete("/alerts/:id", authMiddleware, deleteAlert);

router.get("/doctors", authMiddleware, getAllDoctors);  
router.get("/doctors/:id", authMiddleware, getDoctorProfile);
router.patch("/doctors/:id", authMiddleware, updateDoctorProfile);

export default router;
