import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medication_name: String,
  dosage: String,
  frequency: String,
  duration: String,
  notes: String,
  prescribed_at: Date,
}, { timestamps: true });

export default mongoose.model("Prescription", PrescriptionSchema);
