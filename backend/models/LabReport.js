import mongoose from "mongoose";

const LabReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  test_name: {
    type: String,
    required: true,
    trim: true,
  },
  test_type: {
    type: String,
    required: true,
    trim: true,
  },
  test_date: {
    type: Date,
    default: Date.now,
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
}, { timestamps: true });

// Index for faster patient-based queries
LabReportSchema.index({ patient: 1, test_date: -1 });

export default mongoose.model("LabReport", LabReportSchema);