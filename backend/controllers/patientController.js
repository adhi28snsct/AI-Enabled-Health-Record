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


// This assumes this function is located in the backend/controllers/patientController.js file

export const getPatientProfile = async (req, res) => {
  try {
    // 💡 CRITICAL FIX: Prioritize the ID from the URL parameter, otherwise use the ID from the token.
    const userId = req.params.userId || req.user?._id; 
    
    if (!userId) return res.status(400).json({ message: "User ID not provided" });

    // 1. Fetch user profile
    const user = await User.findById(userId).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });


    // 2. Fetch AI Summary
    const ai = await AISummary.findOne({ patient: userId });

    // 3. Calculate Highest Risk Level
    const risks = [
      ai?.diabetes_risk,
      ai?.anemia_risk,
      ai?.hypertension_risk,
      ai?.cardiac_risk,
    ].filter(r => typeof r === 'number'); 

    const maxRiskPercentage = risks.length > 0 ? Math.max(...risks) : 0;
    
    let highestRiskLevel = "unknown";
    if (maxRiskPercentage > 75) highestRiskLevel = "critical";
    else if (maxRiskPercentage > 50) highestRiskLevel = "high";
    else if (maxRiskPercentage > 25) highestRiskLevel = "moderate";
    else if (maxRiskPercentage > 0) highestRiskLevel = "low";
    
    // 4. Send combined response
    res.json({ ...user, risk_level: highestRiskLevel }); 
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
