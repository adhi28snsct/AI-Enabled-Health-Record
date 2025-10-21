import User from "../models/User.js";
import HealthRecord from "../models/HealthRecord.js";
import Prescription from "../models/Prescription.js";
import LabReport from "../models/LabReport.js";
import Alert from "../models/Alert.js";
import AISummary from "../models/AISummary.js";

/* -------------------------------------------------------------------------- */
/*                          PATIENT PROFILE CONTROLLERS                       */
/* -------------------------------------------------------------------------- */

// Get patient profile with AI risk level
export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;
    if (!userId) return res.status(400).json({ message: "User ID not provided" });

    const user = await User.findById(userId).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const ai = await AISummary.findOne({ patient: userId });

    const risks = [
      ai?.diabetes_risk,
      ai?.anemia_risk,
      ai?.hypertension_risk,
      ai?.cardiac_risk,
    ].filter(Boolean);

    const riskOrder = ["low", "moderate", "high", "critical"];
    const highestRisk =
      risks.sort((a, b) => riskOrder.indexOf(b) - riskOrder.indexOf(a))[0] || "unknown";

    res.json({ ...user, risk_level: highestRisk });
  } catch (err) {
    console.error("❌ [getPatientProfile] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ message: "User ID not provided" });

    const allowedFields = [
      "name",
      "email",
      "dob",
      "gender",
      "blood_type",
      "phone",
      "address",
      "preferred_language",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    console.error("❌ [updatePatientProfile] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                              MEDICAL RECORDS                               */
/* -------------------------------------------------------------------------- */

// Health records
export const getPatientRecords = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const records = await HealthRecord.find({ patient: userId }).sort({ recorded_at: -1 }).lean();
    res.json(records || []);
  } catch (err) {
    console.error("❌ [getPatientRecords] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const prescriptions = await Prescription.find({ patient: userId })
      .sort({ prescribed_at: -1 })
      .lean();
    res.json(prescriptions || []);
  } catch (err) {
    console.error("❌ [getPatientPrescriptions] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Lab Reports
export const getPatientLabReports = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const reports = await LabReport.find({ patient: userId }).sort({ test_date: -1 }).lean();
    res.json(reports || []);
  } catch (err) {
    console.error("❌ [getPatientLabReports] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Alerts
export const getPatientAlerts = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const alerts = await Alert.find({ patient: userId }).sort({ created_at: -1 }).lean();
    res.json(alerts || []);
  } catch (err) {
    console.error("❌ [getPatientAlerts] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// AI Summary
export const getPatientAISummary = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const summary = await AISummary.findOne({ patient: userId }).lean();
    res.json(summary || {});
  } catch (err) {
    console.error("❌ [getPatientAISummary] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
