import express from "express";
import {
    registerUser, 
    loginUser,
    // 💡 Import the new controller
    registerPatientByHW 
} from "../controllers/authController.js";
// Assuming authMiddleware is defined in a separate file as per common practice
import { authMiddleware } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Public routes
router.post("/register", registerUser); 
router.post("/login", loginUser);

// 🩺 NEW ROUTE for Health Worker Patient Registration
// This route is called by the Health Worker Portal (POST /api/auth/register-patient)
// It is protected to ensure only authenticated users (Doctors/HWs) can create records.
router.post("/register-patient", authMiddleware, registerPatientByHW); 

export default router;