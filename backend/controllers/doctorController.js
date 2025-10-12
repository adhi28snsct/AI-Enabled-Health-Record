import User from "../models/User.js";
import HealthRecord from "../models/HealthRecord.js";
import Prescription from "../models/Prescription.js";
import LabReport from "../models/LabReport.js";
import Alert from "../models/Alert.js";
import AISummary from "../models/AISummary.js";
import Vitals from "../models/Vitals.js"; // your vitals model

// --- PATIENT LIST ---
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- VITALS ---
export const getPatientVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const vitals = await Vitals.find({ patient: patientId }).sort({ recorded_at: -1 });
    res.json(vitals || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addPatientVitals = async (req, res) => {
  try {
    const vitals = new Vitals(req.body);
    const saved = await vitals.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- PRESCRIPTIONS ---
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patient: patientId }).sort({ prescribed_at: -1 });
    res.json(prescriptions || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addPrescription = async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    const saved = await prescription.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- LAB REPORTS ---
export const getPatientLabReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await LabReport.find({ patient: patientId }).sort({ test_date: -1 });
    res.json(reports || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addLabReport = async (req, res) => {
  try {
    const report = new LabReport(req.body);
    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- AI SUMMARY ---
export const getPatientAISummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const summary = await AISummary.findOne({ patient: patientId });
    res.json(summary || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addAISummary = async (req, res) => {
  try {
    const { patient, diabetes_risk, anemia_risk, hypertension_risk, cardiac_risk } = req.body;
    let summary = await AISummary.findOne({ patient });
    if (summary) {
      summary.diabetes_risk = diabetes_risk;
      summary.anemia_risk = anemia_risk;
      summary.hypertension_risk = hypertension_risk;
      summary.cardiac_risk = cardiac_risk;
      summary = await summary.save();
      return res.json(summary);
    }
    summary = new AISummary({ patient, diabetes_risk, anemia_risk, hypertension_risk, cardiac_risk });
    const saved = await summary.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- ALERTS ---
export const getPatientAlerts = async (req, res) => {
  try {
    const { patientId } = req.params;
    const alerts = await Alert.find({ patient: patientId }).sort({ created_at: -1 });
    res.json(alerts || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addAlert = async (req, res) => {
  try {
    const alert = new Alert(req.body);
    const saved = await alert.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
