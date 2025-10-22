import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Use env secret or fallback to a default
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register User (Standard User, expects password in body)
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, dob, gender, role, proof } = req.body;

        if (!name || !email || !password || !dob || !gender || !role || !proof)
            return res.status(400).json({ message: "All fields are required." });

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedRole = role.trim().toLowerCase();

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) return res.status(400).json({ message: "Email already exists." });

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

        res.status(201).json({ message: "User registered successfully." });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// 💡 NEW CONTROLLER: Register Patient via Health Worker/Doctor
export const registerPatientByHW = async (req, res) => {
    try {
        const { 
            name, email, dob, gender, blood_type, phone, address, 
            emergency_contact_name, emergency_contact_phone, 
            assignedDoctor // Doctor's ID passed from Health Worker Portal
        } = req.body;

        // 1. Basic Validation: Ensure core demographic and assignment data is present
        if (!name || !dob || !gender || !assignedDoctor) {
            return res.status(400).json({ message: "Missing required patient registration fields (Name, DOB, Gender, and assignedDoctor)." });
        }
        
        // Check for email existence ONLY if provided
        if (email) {
            const normalizedEmail = email.trim().toLowerCase();
            const existing = await User.findOne({ email: normalizedEmail });
            if (existing) return res.status(400).json({ message: "Email already exists in the system." });
        }

        // 2. Create the new User document
        const newUser = new User({
            // Core required fields
            name,
            dob,
            gender,
            role: 'patient', // Enforce the patient role
            proof: 'HW_REGISTRY', // Set a default proof for Health Worker registrations
            assignedDoctor,

            // Set a secure default password the patient MUST change later
            password: 'HealthConnect_Default', 
            
            // Optional/Health fields
            email: email ? email.trim().toLowerCase() : undefined,
            blood_type,
            phone,
            address,
            emergency_contact_name,
            emergency_contact_phone,
        });

        const savedUser = await newUser.save();

        // Prepare response without the password
        const userObject = savedUser.toObject();
        delete userObject.password;

        res.status(201).json({ 
            message: "Patient registered successfully by Health Worker.", 
            user: userObject 
        });

    } catch (err) {
        console.error("❌ Patient Registration by HW error:", err.message);
        res.status(500).json({ message: "Failed to register patient." });
    }
};


// Login User
export const loginUser = async (req, res) => {
    try {
        if (!JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET is not defined" });
        }

        let { email, password, role } = req.body;

        if (!email || !password || !role)
            return res.status(400).json({ message: "All fields are required." });

        email = email.trim().toLowerCase();
        role = role.trim().toLowerCase();

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found." });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password." });

        if (user.role.toLowerCase() !== role)
            return res.status(403).json({ message: "Incorrect role selected." });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
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
        res.status(500).json({ message: "Server error" });
    }
};