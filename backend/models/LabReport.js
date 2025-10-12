import mongoose from "mongoose";

const LabReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  test_name: String,
  test_type: String,
  test_date: Date,
  results: mongoose.Schema.Types.Mixed,
  notes: String,
}, { timestamps: true });

export default mongoose.model("LabReport", LabReportSchema);
