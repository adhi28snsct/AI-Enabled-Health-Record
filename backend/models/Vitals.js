import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blood_pressure: { type: String, required: true },
  heart_rate: { type: Number, required: true }, 
  temperature: { type: Number, required: true }, 
  respiration_rate: { type: Number, required: true }, 
  recorded_at: { type: Date, default: Date.now },
});

export default mongoose.model("Vitals", vitalsSchema);
