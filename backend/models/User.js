import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["doctor", "patient", "admin"],
  },
  proof: { type: String, required: true },

  // Optional health and contact fields
  blood_type: { type: String },
  phone: { type: String },
  address: { type: String },
  emergency_contact_name: { type: String },
  emergency_contact_phone: { type: String },
  preferred_language: { type: String, default: "en" },

  // Enhancements
  profile_image: { type: String, default: "" },
  isApproved: { type: Boolean, default: false },

  // 🔗 Assigned doctor for patient filtering
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.role === "patient";
    },
  },
}, { timestamps: true });

// Index for faster queries
userSchema.index({ email: 1 });

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);