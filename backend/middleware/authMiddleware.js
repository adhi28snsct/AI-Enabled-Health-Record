import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

/* ======================================================
   AUTH MIDDLEWARE (JWT)
   - No approval logic
   - Hospital invite = trusted doctor
====================================================== */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ identity comes from JWT + DB
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ authMiddleware", err);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
