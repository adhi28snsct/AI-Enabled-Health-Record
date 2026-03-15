import mongoose from "mongoose";

export const ensureHospitalAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "hospital_admin") {
    return res.status(403).json({ message: "Hospital admin access only" });
  }

  if (
    !req.user.hospitalId ||
    !mongoose.isValidObjectId(req.user.hospitalId)
  ) {
    return res.status(400).json({ message: "Hospital not assigned" });
  }

  next();
};
