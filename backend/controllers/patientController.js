import User from "../models/User.js";
import HealthRecord from "../models/HealthRecord.js";
import Prescription from "../models/Prescription.js";
import LabReport from "../models/LabReport.js";
import Alert from "../models/Alert.js";
import AISummary from "../models/AISummary.js";
export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;
    if (!userId) return res.status(400).json({ message: "User ID not provided" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ message: "User ID not provided" });
    const allowedFields = ["name", "email", "dob", "gender", "blood_type", "phone", "address", "preferred_language"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find({ patient: req.user._id }).sort({ recorded_at: -1 });
    res.json(records || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id }).sort({ prescribed_at: -1 });
    res.json(prescriptions || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientLabReports = async (req, res) => {
  try {
    const reports = await LabReport.find({ patient: req.user._id }).sort({ test_date: -1 });
    res.json(reports || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ patient: req.user._id }).sort({ created_at: -1 });
    res.json(alerts || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientAISummary = async (req, res) => {
  try {
    const summary = await AISummary.findOne({ patient: req.user._id });
    res.json(summary || {}); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
