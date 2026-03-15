import mongoose from "mongoose";
import User from "../models/User.js";
import HealthRecord from "../models/HealthRecord.js";
import Prescription from "../models/Prescription.js";
import LabReport from "../models/LabReport.js";
import Alert from "../models/Alert.js";
import AISummary from "../models/AISummary.js";
import Appointment from "../models/Appointment.js";

/* =========================================================
   ACCESS CONTROL HELPER
========================================================= */
const canAccessPatient = async (actor, patientId) => {
  if (!actor) return false;
  if (!mongoose.Types.ObjectId.isValid(patientId)) return false;

  /* ========= PATIENT ========= */
  if (actor.role === "patient") {
    return String(actor._id) === String(patientId);
  }

  /* ========= DOCTOR ========= */
  if (actor.role === "doctor") {
    return await Appointment.exists({
      doctor: actor._id,
      patient: patientId,
      status: { $in: ["pending", "confirmed", "completed"] },
    });
  }

  /* ========= HOSPITAL ADMIN ========= */
  if (actor.role === "hospital_admin") {
    return await Appointment.exists({
      hospital: actor.hospitalId,
      patient: patientId,
      status: { $in: ["confirmed", "completed"] },
    });
  }

  /* ❌ PLATFORM ADMIN SHOULD NOT SEE MEDICAL DATA */
  return false;
};

/* =========================================================
   RESOLVE PATIENT ID (supports /me)
========================================================= */
const resolvePatientId = (req) => {
  if (!req.params.userId || req.params.userId === "me") {
    return req.user._id;
  }
  return req.params.userId;
};

/* =========================================================
   PATIENT PROFILE
========================================================= */
export const getPatientProfile = async (req, res) => {
  try {
    const patientId = resolvePatientId(req);

    if (!(await canAccessPatient(req.user, patientId)))
      return res.status(403).json({ message: "Access denied" });

    const user = await User.findById(patientId)
      .select("-password")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const ai = await AISummary.findOne({ patient: patientId }).lean();

    const risks = [
      ai?.diabetes_risk,
      ai?.anemia_risk,
      ai?.hypertension_risk,
      ai?.cardiac_risk,
    ].filter((r) => typeof r === "number");

    const maxRisk = risks.length ? Math.max(...risks) : 0;

    let risk_level = "unknown";
    if (maxRisk > 75) risk_level = "critical";
    else if (maxRisk > 50) risk_level = "high";
    else if (maxRisk > 25) risk_level = "moderate";
    else if (maxRisk > 0) risk_level = "low";

    res.json({ ...user, risk_level });
  } catch (err) {
    console.error("❌ getPatientProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   UPDATE PATIENT PROFILE (SELF ONLY)
========================================================= */
export const updatePatientProfile = async (req, res) => {
  try {
    if (req.user.role !== "patient")
      return res
        .status(403)
        .json({ message: "Only patients can update profile" });

    const allowedFields = [
      "name",
      "dob",
      "gender",
      "blood_type",
      "phone",
      "address",
      "preferred_language",
      "profile_image",
    ];

    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    console.error("❌ updatePatientProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   HEALTH RECORDS
========================================================= */
export const getPatientRecords = async (req, res) => {
  try {
    const patientId = resolvePatientId(req);

    if (!(await canAccessPatient(req.user, patientId)))
      return res.status(403).json({ message: "Access denied" });

    const records = await HealthRecord.find({ patient: patientId })
      .sort({ recorded_at: -1 })
      .lean();

    res.json(records);
  } catch (err) {
    console.error("❌ getPatientRecords:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   PRESCRIPTIONS
========================================================= */
export const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = resolvePatientId(req);

    if (!(await canAccessPatient(req.user, patientId)))
      return res.status(403).json({ message: "Access denied" });

    const prescriptions = await Prescription.find({ patient: patientId })
      .sort({ prescribed_at: -1 })
      .lean();

    res.json(prescriptions);
  } catch (err) {
    console.error("❌ getPatientPrescriptions:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   LAB REPORTS
========================================================= */
export const getPatientLabReports = async (req, res) => {
  try {
    const patientId = resolvePatientId(req);

    if (!(await canAccessPatient(req.user, patientId)))
      return res.status(403).json({ message: "Access denied" });

    const reports = await LabReport.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(reports);
  } catch (err) {
    console.error("❌ getPatientLabReports:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   ALERTS
========================================================= */
export const getPatientAlerts = async (req, res) => {
  try {
    const patientId = resolvePatientId(req);

    if (!(await canAccessPatient(req.user, patientId)))
      return res.status(403).json({ message: "Access denied" });

    const alerts = await Alert.find({ patient: patientId })
      .sort({ created_at: -1 })
      .lean();

    res.json(alerts);
  } catch (err) {
    console.error("❌ getPatientAlerts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   AI SUMMARY
========================================================= */
export const getPatientAISummary = async (req, res) => {
  try {
    const patientId = resolvePatientId(req);

    if (!(await canAccessPatient(req.user, patientId)))
      return res.status(403).json({ message: "Access denied" });

    const summary = await AISummary.findOne({ patient: patientId }).lean();

    res.json(summary || {});
  } catch (err) {
    console.error("❌ getPatientAISummary:", err);
    res.status(500).json({ message: "Server error" });
  }
};