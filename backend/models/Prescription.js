import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medication_name: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  prescribed_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Optional: Index for faster patient-based queries
PrescriptionSchema.index({ patient: 1, prescribed_at: -1 });

export default mongoose.model("Prescription", PrescriptionSchema);