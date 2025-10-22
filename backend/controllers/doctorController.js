import User from "../models/User.js";
import Vitals from "../models/Vitals.js";
import Prescription from "../models/Prescription.js";
import LabReport from "../models/LabReport.js";
import Alert from "../models/Alert.js";
import AISummary from "../models/AISummary.js";
import { triggerAIHealthSummary } from "../utils/aiService.js"; 

/* -------------------------------------------------------------------------- */
/*                             PATIENT MANAGEMENT                             */
/* -------------------------------------------------------------------------- */

// Get all patients with AI risk enrichment
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");

    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const ai = await AISummary.findOne({ patient: patient._id });
        const risks = [
          ai?.diabetes_risk,
          ai?.anemia_risk,
          ai?.hypertension_risk,
          ai?.cardiac_risk,
        ].filter(Boolean);

        const riskOrder = ["low", "moderate", "high", "critical"];
        const highestRisk =
          risks.sort((a, b) => riskOrder.indexOf(b) - riskOrder.indexOf(a))[0] || "unknown";

        return { ...patient.toObject(), risk_level: highestRisk };
      })
    );

    res.json(enrichedPatients);
  } catch (err) {
    console.error("❌ [getAllPatients] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                  VITALS                                    */
/* -------------------------------------------------------------------------- */

export const getPatientVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const vitals = await Vitals.find({ patient: patientId }).sort({ recorded_at: -1 });
    res.json(vitals || []);
  } catch (err) {
    console.error("❌ [getPatientVitals] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE VITALS CONTROLLER (AI TRIGGER POINT 1)
export const addPatientVitals = async (req, res) => {
  console.log("📥 Received vitals payload:", req.body); 

  try {
    const patientId = req.body.patient; 

    if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required to add vitals." });
    }

    const vitals = new Vitals(req.body);
    const saved = await vitals.save();

    // 🚨 CRITICAL FIX: Trigger AI Analysis after saving new Vitals
    await triggerAIHealthSummary(patientId);

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ [addPatientVitals] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVitals = async (req, res) => {
  try {
    const updated = await Vitals.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ [updateVitals] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVitals = async (req, res) => {
  try {
    await Vitals.findByIdAndDelete(req.params.id);
    res.json({ message: "Vitals deleted" });
  } catch (err) {
    console.error("❌ [deleteVitals] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                              PRESCRIPTIONS                                 */
/* -------------------------------------------------------------------------- */

export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patient: patientId }).sort({
      prescribed_at: -1,
    });
    res.json(prescriptions || []);
  } catch (err) {
    console.error("❌ [getPatientPrescriptions] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const addPrescription = async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    const saved = await prescription.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ [addPrescription] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const addPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = new Prescription({ ...req.body, patient: id });
    const saved = await prescription.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ [addPrescriptionById] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const updated = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ [updatePrescription] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: "Prescription deleted" });
  } catch (err) {
    console.error("❌ [deletePrescription] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               LAB REPORTS                                  */
/* -------------------------------------------------------------------------- */

export const getPatientLabReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await LabReport.find({ patient: patientId }).sort({ test_date: -1 });
    res.json(reports || []);
  } catch (err) {
    console.error("❌ [getPatientLabReports] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE LAB REPORT CONTROLLER (AI TRIGGER POINT 2)
export const addLabReport = async (req, res) => {
  try {
    const patientId = req.body.patient; 

    if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required to add a lab report." });
    }

    const report = new LabReport(req.body);
    const saved = await report.save();

    // 🚨 CRITICAL FIX: Trigger AI Analysis after saving Lab Report
    await triggerAIHealthSummary(patientId);

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ [addLabReport] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLabReport = async (req, res) => {
  try {
    const updated = await LabReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ [updateLabReport] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLabReport = async (req, res) => {
  try {
    await LabReport.findByIdAndDelete(req.params.id);
    res.json({ message: "Lab report deleted" });
  } catch (err) {
    console.error("❌ [deleteLabReport] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
/* -------------------------------------------------------------------------- */
/*                                 AI SUMMARY                                 */
/* -------------------------------------------------------------------------- */

export const getPatientAISummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const summary = await AISummary.findOne({ patient: patientId });
    res.json(summary || {});
  } catch (err) {
    console.error("❌ [getPatientAISummary] Error:", err.message);
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

    const saved = await new AISummary({
      patient,
      diabetes_risk,
      anemia_risk,
      hypertension_risk,
      cardiac_risk,
    }).save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ [addAISummary] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAISummary = async (req, res) => {
  try {
    const updated = await AISummary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ [updateAISummary] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAISummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const deleted = await AISummary.findOneAndDelete({ patient: patientId });

    if (!deleted) return res.status(404).json({ message: "AI summary not found" });

    res.json({ message: "AI summary deleted successfully" });
  } catch (err) {
    console.error("❌ [deleteAISummary] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                   ALERTS                                   */
/* -------------------------------------------------------------------------- */

export const getPatientAlerts = async (req, res) => {
  try {
    const { patientId } = req.params;
    const alerts = await Alert.find({ patient: patientId }).sort({ created_at: -1 });
    res.json(alerts || []);
  } catch (err) {
    console.error("❌ [getPatientAlerts] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const addAlert = async (req, res) => {
  try {
    const alert = new Alert(req.body);
    const saved = await alert.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ [addAlert] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAlert = async (req, res) => {
  try {
    const updated = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ [updateAlert] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (err) {
    console.error("❌ [deleteAlert] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};