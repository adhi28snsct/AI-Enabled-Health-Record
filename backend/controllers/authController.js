import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

/* ================= ENV ================= */

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/* ================= HELPERS ================= */

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      hospitalId: user.hospitalId || null,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

const verifyGoogle = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

/* =====================================================
   PATIENT REGISTER
===================================================== */

export const registerPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      blood_type,
      address,
      emergency_contact_name,
      emergency_contact_phone,
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Required fields missing" });

    const emailNormalized = email.toLowerCase();

    const exists = await User.findOne({ email: emailNormalized });
    if (exists)
      return res.status(409).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email: emailNormalized,
      password, // 🔥 PLAIN PASSWORD ONLY
      role: "patient",
      phone,
      blood_type,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      isActive: true,
      isProfileComplete: true,
    });

    res.status(201).json({
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("registerPatient", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   PATIENT LOGIN
===================================================== */

export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({
      email: email.toLowerCase(),
      role: "patient",
    }).select("+password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      token: signToken(user),
      role: user.role,
      hospitalId: user.hospitalId,
      name: user.name,
      isProfileComplete: user.isProfileComplete,
    });
  } catch (err) {
    console.error("loginPatient", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GOOGLE LOGIN (DOCTOR / HOSPITAL ADMIN)
===================================================== */

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ message: "Google token required" });

    const payload = await verifyGoogle(idToken);
    const email = payload.email.toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(403)
        .json({ message: "You are not registered in this system" });
    }

    /* ================= ACCOUNT BLOCK CHECK ================= */

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is deactivated. Contact platform admin.",
      });
    }

    /* ================= FIRST LOGIN ACTIVATION ================= */

    if (!user.status || user.status === "PENDING") {
      user.status = "ACTIVE";
      user.firstLoginAt = new Date(); // optional field
      await user.save();
    }

    /* ================= TOKEN ================= */

    res.json({
      token: signToken(user),
      role: user.role,
      hospitalId: user.hospitalId,
      name: user.name,
      isProfileComplete: user.isProfileComplete,
    });
  } catch (err) {
    console.error("googleLogin", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};