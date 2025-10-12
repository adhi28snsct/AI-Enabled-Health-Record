import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  severity: { type: String, enum: ["low", "medium", "high", "critical"] },
  message: String,
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Alert", AlertSchema);
