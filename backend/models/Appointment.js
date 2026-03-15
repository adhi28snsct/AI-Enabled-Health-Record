import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // 🔥 VERY IMPORTANT
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },

  requested_at: {
    type: Date,
    required: true,
  },

  confirmed_at: {
    type: Date,
    default: null,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
    required: true,
  },

  risk_snapshot: {
    risk_level: {
      type: String,
      enum: ["low", "moderate", "high", "critical", "unknown"],
      default: "unknown",
    },
    diabetes_risk: { type: Number, default: 0 },
    hypertension_risk: { type: Number, default: 0 },
    anemia_risk: { type: Number, default: 0 },
    cardiac_risk: { type: Number, default: 0 },
  },

  notes: { type: String, default: "" },
}, { timestamps: true });

AppointmentSchema.index({ doctor: 1, status: 1, requested_at: 1 });
AppointmentSchema.index({ hospital: 1, status: 1 });

export default mongoose.model("Appointment", AppointmentSchema);
