import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

export const canAccessPatient = async (reqUser, patientId) => {
  if (!reqUser) return false;

  /* ================= PATIENT ================= */
  if (reqUser.role === "patient") {
    return String(reqUser._id) === String(patientId);
  }

  /* ================= DOCTOR ================= */
  if (reqUser.role === "doctor") {
    // Doctor can access only if appointment exists with this patient
    return await Appointment.exists({
      doctor: reqUser._id,
      patient: patientId,
      status: { $in: ["pending", "confirmed", "completed"] },
    });
  }

  /* ================= HOSPITAL ADMIN ================= */
  if (reqUser.role === "hospital_admin") {
    const patient = await User.findById(patientId).select("hospitalId");
    if (!patient) return false;
    return String(patient.hospitalId) === String(reqUser.hospitalId);
  }

  /* ================= PLATFORM ADMIN ================= */
  if (reqUser.role === "platform_admin") return true;

  return false;
};
