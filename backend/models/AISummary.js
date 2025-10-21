import mongoose from "mongoose";

const AISummarySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  diabetes_risk: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  anemia_risk: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  hypertension_risk: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  cardiac_risk: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
}, { timestamps: true });

// Index for efficient patient lookups
AISummarySchema.index({ patient: 1 });

export default mongoose.model("AISummary", AISummarySchema);