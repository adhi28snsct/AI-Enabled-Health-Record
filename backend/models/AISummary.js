import mongoose from "mongoose";

const AISummarySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  diabetes_risk: Number,
  anemia_risk: Number,
  hypertension_risk: Number,
  cardiac_risk: Number,
}, { timestamps: true });

export default mongoose.model("AISummary", AISummarySchema);
