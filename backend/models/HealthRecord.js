import mongoose from "mongoose";

const HealthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  record_type: String,
  recorded_by: String,
  recorded_at: Date,
}, { timestamps: true });

export default mongoose.model("HealthRecord", HealthRecordSchema);
