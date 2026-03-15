// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/* ================= DOCTOR AVAILABILITY ================= */

const availabilitySlotSchema = new mongoose.Schema({
  day: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  notes: { type: String, default: "" },
});

/* ================= USER SCHEMA ================= */

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: false,
      required: function () {
        return this.role === "patient" && this.authProvider === "local";
      },
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    role: {
      type: String,
      required: true,
      enum: ["platform_admin", "hospital_admin", "doctor", "patient"],
      index: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
      index: true,
    },

    /* ================= STATUS MANAGEMENT ================= */

    isActive: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED"],
      default: function () {
        if (this.role === "patient") return "ACTIVE";
        return "PENDING";
      },
      index: true,
    },

    hospitalApproved: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },

    /* ================= PROFILE ================= */

    dob: Date,
    gender: String,
    blood_type: String,
    phone: String,
    address: String,

    preferred_language: { type: String, default: "en" },
    profile_image: { type: String, default: "" },

    /* ================= DOCTOR ================= */

    specialization: String,
    otherSpecialization: String,
    bio: String,

    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },

    consultation_fee: { type: Number, default: 0 },
    online_consultation: { type: Boolean, default: false },
    languages: { type: [String], default: [] },

    rating: { type: Number, min: 0, max: 5, default: 0 },

    /* ================= SECURITY ================= */

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

/* ================= VIRTUAL ================= */

userSchema.virtual("isApproved").get(function () {
  if (this.role !== "doctor") return false;
  return this.hospitalApproved && this.isProfileComplete;
});

/* ================= PASSWORD ================= */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createPasswordResetToken = function (
  expiresInMs = 60 * 60 * 1000
) {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + expiresInMs;
  return token;
};

export default mongoose.model("User", userSchema);