import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const availabilitySlotSchema = new mongoose.Schema({
  day: { type: String },                 
  from: { type: String },                
  to: { type: String },                   
  notes: { type: String, default: "" }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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

}, { timestamps: true });

userSchema.index({ email: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
