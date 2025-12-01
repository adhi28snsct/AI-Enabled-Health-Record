import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import AISummary from "../models/AISummary.js";

// Helper to calculate the highest risk level string from percentages
const calculateRiskLevel = (summary) => {
    if (!summary) return "unknown";
    
    // Filter for numerical risk scores only
    const risks = [summary.diabetes_risk, summary.hypertension_risk, summary.anemia_risk, summary.cardiac_risk].filter(r => typeof r === 'number');
    const maxRisk = risks.length > 0 ? Math.max(...risks) : 0;
    
    // Map percentage to categorical risk level (Triage logic)
    if (maxRisk > 75) return "critical";
    if (maxRisk > 50) return "high";
    if (maxRisk > 25) return "moderate";
    return "low";
};

// --- POST /api/appointments/book ---
// Patient requests a new appointment
export const bookAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, requestedTime, notes } = req.body;
        
        if (!patientId || !doctorId || !requestedTime) {
            return res.status(400).json({ message: "Missing patient ID, doctor ID, or requested time." });
        }

        // 1. Fetch patient's current AI Summary for Triage Snapshot
        const aiSummary = await AISummary.findOne({ patient: patientId }).lean();
        
        // 2. Build the risk snapshot
        const riskSnapshot = {
            risk_level: calculateRiskLevel(aiSummary), // The triage level
            diabetes_risk: aiSummary?.diabetes_risk || 0,
            hypertension_risk: aiSummary?.hypertension_risk || 0,
        };

        // 3. Create the appointment
        const newAppointment = await Appointment.create({
            patient: patientId,
            doctor: doctorId,
            requested_at: new Date(requestedTime),
            risk_snapshot: riskSnapshot,
            notes,
            status: 'pending',
        });

        res.status(201).json({ 
            message: "Appointment request sent successfully.", 
            appointment: newAppointment 
        });
        
    } catch (err) {
        console.error("❌ [bookAppointment] Error:", err.message);
        res.status(500).json({ message: "Server error during appointment booking." });
    }
};

// --- GET /api/appointments/doctor/appointments ---
// Doctor views their pending appointment queue, ordered by risk
export const getDoctorAppointmentQueue = async (req, res) => {
    try {
        const doctorId = req.user._id; // Assumes ID is retrieved from JWT token

        const queue = await Appointment.find({
            doctor: doctorId,
            status: 'pending' 
        })
        .populate('patient', 'name gender dob') // Get basic patient details
        .sort({ 'risk_snapshot.risk_level': -1, requested_at: 1 }); // Sort by risk (critical first) then by time

        // Logic to sort risk levels: Mongoose can't sort strings this way directly, 
        // so we manually map the risk level to a number for proper queue ordering on the frontend.
        const riskOrder = { critical: 4, high: 3, moderate: 2, low: 1, unknown: 0 };
        
        const sortedQueue = queue.sort((a, b) => {
            const riskA = riskOrder[a.risk_snapshot.risk_level] || 0;
            const riskB = riskOrder[b.risk_snapshot.risk_level] || 0;
            return riskB - riskA; // Descending sort (Critical > High > Low)
        });

        res.json(sortedQueue);
    } catch (err) {
        console.error("❌ [getDoctorAppointmentQueue] Error:", err.message);
        res.status(500).json({ message: "Server error retrieving appointment queue." });
    }
};

// --- PATCH /api/appointments/doctor/appointments/:id/status ---
// Doctor confirms or cancels an appointment
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Status should be 'confirmed', 'cancelled', or 'completed'

        if (!status || !['confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status, confirmed_at: status === 'confirmed' ? new Date() : undefined },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        res.json({ message: `Appointment status updated to ${status}.`, appointment });

    } catch (err) {
        console.error("❌ [updateAppointmentStatus] Error:", err.message);
        res.status(500).json({ message: "Server error updating appointment status." });
    }
};