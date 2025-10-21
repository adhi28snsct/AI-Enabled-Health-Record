import mongoose from "mongoose";

const HealthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  record_type: {
    type: String,
    required: true,
    enum: ["diagnosis", "treatment", "surgery", "allergy", "immunization", "note", "other"],
  },
  recorded_by: {
    type: String,
    required: true,
  },
  recorded_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for efficient patient record queries
HealthRecordSchema.index({ patient: 1, recorded_at: -1 });

export default mongoose.model("HealthRecord", HealthRecordSchema);