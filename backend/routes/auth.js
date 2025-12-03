import express from "express";
import {
  registerUser,
  loginUser,
  registerPatientByHW,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/register-patient", authMiddleware, registerPatientByHW);

export default router;
