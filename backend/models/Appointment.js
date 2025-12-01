import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Doctor assigned or requested by the patient
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Requested date and time for the appointment
    requested_at: {
        type: Date,
        required: true,
    },
    // Time the appointment was confirmed by the doctor
    confirmed_at: {
        type: Date,
        default: null, 
    },
    // Status of the appointment request
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending",
        required: true,
    },
    // AI risk data snapshot for quick triage
    risk_snapshot: {
        risk_level: { type: String, enum: ["low", "moderate", "high", "critical", "unknown"], default: "unknown" },
        diabetes_risk: { type: Number, default: 0 },
        hypertension_risk: { type: Number, default: 0 },
        // You can add more summary fields here
    },
    notes: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Index for fast lookup of appointments by doctor and status
AppointmentSchema.index({ doctor: 1, status: 1, requested_at: 1 });

export default mongoose.model("Appointment", AppointmentSchema);