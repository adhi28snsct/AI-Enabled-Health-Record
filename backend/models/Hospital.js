import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    district: {
      type: String,
      required: true,
    },
    managerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // platform admin
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hospital", hospitalSchema);
