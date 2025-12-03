// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const availabilitySlotSchema = new mongoose.Schema({
  day: { type: String },
  from: { type: String },
  to: { type: String },
  notes: { type: String, default: "" },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },

  role: {
    type: String,
    required: true,
    enum: ["doctor", "patient", "admin", "hospital"],
  },

  proof: { type: String, required: true },

  blood_type: { type: String },
  phone: { type: String },
  address: { type: String },
  emergency_contact_name: { type: String },
  emergency_contact_phone: { type: String },
  preferred_language: { type: String, default: "en" },

  profile_image: { type: String, default: "" },
  isApproved: { type: Boolean, default: false },

  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.role === "patient";
    },
  },

  specialization: { type: String, default: "" },
  otherSpecialization: { type: String, default: "" },
  bio: { type: String, default: "" },

  availability: { type: [availabilitySlotSchema], default: [] },

  consultation_fee: { type: Number, default: 0 },
  online_consultation: { type: Boolean, default: false },

  languages: { type: [String], default: [] },

  rating: { type: Number, min: 0, max: 5, default: 0 },

  // --- Password reset fields ---
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Indexes
userSchema.index({ email: 1 });

// Hash password before save (only when changed)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};


userSchema.methods.createPasswordResetToken = function (expiresInMs = 60 * 60 * 1000) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHashed = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordToken = tokenHashed;
  this.resetPasswordExpires = Date.now() + expiresInMs; // default 1 hour
  return token;
};

userSchema.methods.clearPasswordReset = function () {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
};

function hideSensitive(doc, ret) {
  delete ret.password;
  delete ret.resetPasswordToken;
  delete ret.resetPasswordExpires;
  return ret;
}
userSchema.set("toJSON", {
  transform: hideSensitive,
  virtuals: true,
});
userSchema.set("toObject", {
  transform: hideSensitive,
  virtuals: true,
});

export default mongoose.model("User", userSchema);
