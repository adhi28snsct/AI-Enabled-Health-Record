import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import AISummary from "../models/AISummary.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

/* =========================================================
   RISK LEVEL HELPER
========================================================= */
const calculateRiskLevel = (summary) => {
  if (!summary) return "unknown";

  const risks = [
    summary?.diabetes_risk,
    summary?.hypertension_risk,
    summary?.anemia_risk,
    summary?.cardiac_risk,
  ].filter((r) => typeof r === "number");

  const maxRisk = risks.length ? Math.max(...risks) : 0;

  if (maxRisk > 75) return "critical";
  if (maxRisk > 50) return "high";
  if (maxRisk > 25) return "moderate";
  if (maxRisk > 0) return "low";
  return "unknown";
};

/* =========================================================
   PATIENT → BOOK APPOINTMENT
========================================================= */
export const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Patients only" });
    }

    const { doctorId, requestedTime, notes } = req.body;

    if (!doctorId || !requestedTime) {
      return res.status(400).json({ message: "Doctor and time required" });
    }

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    /* ================= LOAD DOCTOR ================= */

    const doctor = await User.findById(doctorId)
      .select(
        "role hospitalId hospitalApproved isProfileComplete isActive availability"
      )
      .lean();

    if (!doctor || doctor.role !== "doctor") {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    if (!doctor.isActive) {
      return res.status(403).json({ message: "Doctor is inactive" });
    }

    /* ================= OPTION-2 APPROVAL CHECK ================= */

    if (!doctor.hospitalApproved || !doctor.isProfileComplete) {
      return res.status(403).json({
        message: "Doctor not approved or profile incomplete",
      });
    }

    if (!doctor.hospitalId) {
      return res.status(400).json({
        message: "Doctor not linked to hospital",
      });
    }

    if (!Array.isArray(doctor.availability) || doctor.availability.length === 0) {
      return res.status(403).json({
        message: "Doctor has no availability set",
      });
    }

    /* ================= VALIDATE DATE ================= */

    const parsedDate = new Date(requestedTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid requested time" });
    }

    /* ================= PREVENT DOUBLE BOOKING ================= */

    const clash = await Appointment.findOne({
      doctor: doctorId,
      requested_at: parsedDate,
      status: { $in: ["pending", "confirmed"] },
    });

    if (clash) {
      return res
        .status(400)
        .json({ message: "Doctor not available at this time" });
    }

    /* ================= AI RISK SNAPSHOT ================= */

    const aiSummary = await AISummary.findOne({
      patient: req.user._id,
    }).lean();

    const riskSnapshot = {
      risk_level: calculateRiskLevel(aiSummary),
      diabetes_risk: aiSummary?.diabetes_risk || 0,
      hypertension_risk: aiSummary?.hypertension_risk || 0,
      anemia_risk: aiSummary?.anemia_risk || 0,
      cardiac_risk: aiSummary?.cardiac_risk || 0,
    };

    /* ================= CREATE APPOINTMENT ================= */

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      hospital: doctor.hospitalId,
      requested_at: parsedDate,
      risk_snapshot: riskSnapshot,
      notes,
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment requested",
      appointment,
    });
  } catch (err) {
    console.error("❌ bookAppointment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   DOCTOR → VIEW QUEUE
========================================================= */
export const getDoctorAppointmentQueue = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Doctors only" });
    }

    const query = {
      doctor: req.user._id,
      hospital: req.user.hospitalId,
    };

    if (req.query.status && req.query.status !== "all") {
      query.status = { $in: req.query.status.split(",") };
    } else {
      query.status = "pending";
    }

    const queue = await Appointment.find(query)
      .populate("patient", "name gender dob")
      .sort({ requested_at: 1 })
      .lean();

    res.json({ data: queue });
  } catch (err) {
    console.error("❌ getDoctorAppointmentQueue:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   DOCTOR → UPDATE STATUS
========================================================= */
export const updateAppointmentStatus = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Doctors only" });
    }

    const { status } = req.body;

    if (!["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (String(appointment.doctor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (String(appointment.hospital) !== String(req.user.hospitalId)) {
      return res.status(403).json({ message: "Hospital mismatch" });
    }

    appointment.status = status;
    if (status === "confirmed") {
      appointment.confirmed_at = new Date();
    }

    await appointment.save();

    /* ================= LINK PATIENT TO HOSPITAL ================= */
    if (status === "confirmed") {
      await User.findByIdAndUpdate(appointment.patient, {
        hospitalId: appointment.hospital,
      });
    }

    /* ================= NOTIFICATION ================= */
    try {
      await Notification.create({
        patientId: appointment.patient,
        appointmentId: appointment._id,
        type: "appointment_status",
        title: `Appointment ${status}`,
        body: `Your appointment has been ${status}`,
      });
    } catch (e) {
      console.warn("Notification failed:", e.message);
    }

    res.json({ message: "Status updated", appointment });
  } catch (err) {
    console.error("❌ updateAppointmentStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptAppointment = (req, res) => {
  req.body.status = "confirmed";
  return updateAppointmentStatus(req, res);
};

export const rejectAppointment = (req, res) => {
  req.body.status = "cancelled";
  return updateAppointmentStatus(req, res);
};

/* =========================================================
   HOSPITAL ADMIN → VIEW HOSPITAL APPOINTMENTS
========================================================= */
export const getHospitalAppointments = async (req, res) => {
  try {
    if (req.user.role !== "hospital_admin") {
      return res.status(403).json({ message: "Hospital admins only" });
    }

    const appts = await Appointment.find({
      hospital: req.user.hospitalId,
    })
      .populate("doctor", "name specialization")
      .populate("patient", "name gender")
      .sort({ createdAt: -1 });

    res.json(appts);
  } catch (err) {
    console.error("❌ getHospitalAppointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   PATIENT → VIEW OWN APPOINTMENTS
========================================================= */
export const getPatientAppointments = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Patients only" });
    }

    const appts = await Appointment.find({
      patient: req.user._id,
    })
      .populate("doctor", "name specialization")
      .sort({ requested_at: -1 });

    res.json(appts);
  } catch (err) {
    console.error("❌ getPatientAppointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   PATIENT → CANCEL APPOINTMENT
========================================================= */
export const cancelAppointmentByPatient = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Patients only" });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ message: "Not found" });
    }

    if (String(appt.patient) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (appt.status !== "pending") {
      return res.status(400).json({ message: "Cannot cancel now" });
    }

    appt.status = "cancelled";
    await appt.save();

    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    console.error("❌ cancelAppointmentByPatient:", err);
    res.status(500).json({ message: "Server error" });
  }
};