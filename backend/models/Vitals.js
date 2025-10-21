import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blood_pressure_systolic: {
    type: Number,
    required: false,
    min: 50,
  },
  blood_pressure_diastolic: {
    type: Number,
    required: false,
    min: 30,
  },
  heart_rate: {
    type: Number,
    required: true,
    min: 30,
  },
  temperature: {
    type: Number,
    required: true,
    min: 30,
  },
  respiration_rate: {
    type: Number,
    required: true,
    min: 5,
  },
  oxygen_saturation: {
    type: Number,
    required: false,
    min: 50,
  },
  symptoms: {
    type: String,
    required: false,
    trim: true,
  },
  recorded_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

vitalsSchema.index({ patient: 1, recorded_at: -1 });

export default mongoose.model("Vitals", vitalsSchema);