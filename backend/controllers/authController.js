import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// FRONTEND_BASE is the server-side base used for reset links
const FRONTEND_BASE = process.env.FRONTEND_BASE || process.env.FRONTEND_BASE_URL || "http://localhost:5173";

/**
 * Register a general user
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, dob, gender, role, proof } = req.body;

    if (!name || !email || !password || !dob || !gender || !role || !proof) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = String(role).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      dob,
      gender,
      role: normalizedRole,
      proof,
    });

    await user.save();

    return res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Register patient by Health Worker
 */
export const registerPatientByHW = async (req, res) => {
  try {
    const {
      name,
      email,
      dob,
      gender,
      blood_type,
      phone,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      assignedDoctor,
    } = req.body;

    if (!name || !dob || !gender || !assignedDoctor) {
      return res.status(400).json({
        success: false,
        message: "Missing required patient registration fields (name, dob, gender, assignedDoctor).",
      });
    }

    let normalizedEmail;
    if (email) {
      normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: "Email already exists in the system." });
      }
    }

    // default temporary password — encourage using forgot-password flow to set real password
    const DEFAULT_TEMP_PASSWORD = process.env.DEFAULT_TEMP_PASSWORD || "HealthConnect_Default";

    const newUser = new User({
      name,
      dob,
      gender,
      role: "patient",
      proof: "HW_REGISTRY",
      assignedDoctor,
      password: DEFAULT_TEMP_PASSWORD,
      email: normalizedEmail || undefined,
      blood_type,
      phone,
      address,
      emergency_contact_name,
      emergency_contact_phone,
    });

    const savedUser = await newUser.save();
    const userObject = savedUser.toObject();
    delete userObject.password;

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully by Health Worker.",
      user: userObject,
    });
  } catch (err) {
    console.error("❌ Patient Registration by HW error:", err);
    return res.status(500).json({ success: false, message: "Failed to register patient." });
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res) => {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, message: "JWT_SECRET is not defined" });
    }

    let { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    email = String(email).trim().toLowerCase();
    role = String(role).trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid password." });

    if (String(user.role || "").toLowerCase() !== role) {
      return res.status(403).json({ success: false, message: "Incorrect role selected." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Forgot password - create reset token and attempt to send email.
 * Returns 404 when email not found (so frontend can show "no account found" toast).
 * Returns 200 with emailSent boolean when user exists.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // explicit 404 so frontend can show "no account found" message
      return res.status(404).json({ success: false, message: "No account found with that email." });
    }

    // create token on user instance and save
    const plainToken = user.createPasswordResetToken(60 * 60 * 1000); // 1 hour
    try {
      await user.save({ validateBeforeSave: false });
    } catch (saveErr) {
      console.error("Failed to save user after creating reset token:", saveErr);
      return res.status(500).json({
        success: false,
        message: "Server error while preparing password reset. Try again later.",
      });
    }

    const resetUrl = `${FRONTEND_BASE.replace(/\/$/, "")}/reset-password/${plainToken}`;

    // Attempt to send email. If SMTP isn't configured, log link for dev
    let emailSent = false;
    try {
      const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

      if (smtpConfigured) {
        // parse SMTP_PORT & SMTP_SECURE safely
        const smtpPort = Number(process.env.SMTP_PORT || 587);
        let smtpSecure = false;
        if (typeof process.env.SMTP_SECURE !== "undefined") {
          const v = String(process.env.SMTP_SECURE).toLowerCase().trim();
          smtpSecure = v === "true";
        } else {
          smtpSecure = smtpPort === 465;
        }

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure: smtpSecure, // true for port 465 (implicit TLS), false for 587 (STARTTLS)
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          // tls: { rejectUnauthorized: false }, // only for temporary local debugging (NOT for prod)
        });

        // optional: verify connection/auth before sending (helpful during deploy)
        try {
          await transporter.verify();
          console.log("SMTP transporter verified (host=%s port=%s secure=%s)", process.env.SMTP_HOST, smtpPort, smtpSecure);
        } catch (verifyErr) {
          console.error("SMTP verify failed:", verifyErr);
          // continue — sendMail will likely fail and be caught below
        }

        await transporter.sendMail({
          from: process.env.MAIL_FROM || "no-reply@healthconnect.example",
          to: user.email,
          subject: "Reset your HealthConnect password",
          html: `
            <p>Hello ${user.name || ""},</p>
            <p>You requested to reset your HealthConnect password.</p>
            <p><a href="${resetUrl}">Click here to reset your password</a></p>
            <p>This link expires in 1 hour.</p>
          `,
        });

        emailSent = true;
      } else {
        // DEV fallback — log link to console so dev/testers can use it
        console.log("DEV MODE reset link:", resetUrl);
        // leave emailSent false to reflect that email wasn't delivered
      }
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr);
      console.log("Fallback reset link:", resetUrl);
      // emailSent remains false
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully.",
      emailSent,
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Reset password (consumes token)
 * Expects token in URL params and new password in body
 *
 * This implementation hashes the password manually and uses findByIdAndUpdate
 * so Mongoose does not run full-document validation (which caused required-field errors).
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const tokenHashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Hash the new password manually (pre('save') middleware won't run for findByIdAndUpdate)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
    });

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
