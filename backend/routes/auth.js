import express from "express";
import {
  registerPatient,
  loginPatient,
  googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

/* ================= AUTH ================= */

// Patient Register
router.post("/register", registerPatient);

// Login
router.post("/login", loginPatient);

// Google Login
router.post("/google-login", googleLogin);

export default router;
