import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  severity: {
    type: String,
    required: true,
    enum: ["low", "medium", "high", "critical"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for efficient patient alert queries
AlertSchema.index({ patient: 1, created_at: -1 });

export default mongoose.model("Alert", AlertSchema);