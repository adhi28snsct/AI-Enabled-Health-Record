import mongoose from "mongoose";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Vitals from "../models/Vitals.js";
import Prescription from "../models/Prescription.js";
import LabReport from "../models/LabReport.js";
import AISummary from "../models/AISummary.js";
import Alert from "../models/Alert.js";

/* ======================================================
   HELPERS
====================================================== */

const ensureDoctor = (req, res) => {
  if (!req.user || req.user.role !== "doctor") {
    res.status(403).json({ message: "Doctors only" });
    return false;
  }
  return true;
};

const doctorHasPatient = async (doctorId, patientId, hospitalId) => {
  if (
    !mongoose.isValidObjectId(doctorId) ||
    !mongoose.isValidObjectId(patientId) ||
    !mongoose.isValidObjectId(hospitalId)
  ) {
    return false;
  }

  return Appointment.exists({
    doctor: doctorId,
    patient: patientId,
    hospital: hospitalId,
    status: { $in: ["confirmed", "completed"] },
  });
};

/* ======================================================
   DOCTOR DASHBOARD
====================================================== */

export const getMyPatients = async (req, res) => {
  try {
    if (!ensureDoctor(req, res)) return;

    const appointments = await Appointment.find({
      doctor: req.user._id,
      hospital: req.user.hospitalId,
      status: { $in: ["confirmed", "completed"] },
    })
      .populate("patient", "name gender dob phone")
      .lean();

    const uniquePatients = {};
    appointments.forEach((a) => {
      if (a.patient) uniquePatients[a.patient._id] = a.patient;
    });

    res.json({ data: Object.values(uniquePatients) });
  } catch (err) {
    console.error("❌ getMyPatients", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    if (!ensureDoctor(req, res)) return;

    const list = await Appointment.find({
      doctor: req.user._id,
      hospital: req.user.hospitalId,
    })
      .populate("patient", "name gender dob")
      .sort({ requested_at: -1 });

    res.json({ data: list });
  } catch (err) {
    console.error("❌ getMyAppointments", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ======================================================
   PATIENT DATA (ONLY OWN PATIENTS)
====================================================== */

export const getPatientVitalsForDoctor = async (req, res) => {
  try {
    if (!ensureDoctor(req, res)) return;

    const allowed = await doctorHasPatient(
      req.user._id,
      req.params.patientId,
      req.user.hospitalId
    );

    if (!allowed)
      return res.status(403).json({ message: "Not your patient" });

    const vitals = await Vitals.find({ patient: req.params.patientId })
      .sort({ recorded_at: -1 });

    res.json({ data: vitals });
  } catch (err) {
    console.error("❌ getPatientVitalsForDoctor", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientPrescriptionsForDoctor = async (req, res) => {
  try {
    if (!ensureDoctor(req, res)) return;

    const allowed = await doctorHasPatient(
      req.user._id,
      req.params.patientId,
      req.user.hospitalId
    );

    if (!allowed)
      return res.status(403).json({ message: "Not your patient" });

    const prescriptions = await Prescription.find({
      patient: req.params.patientId,
    }).sort({ prescribed_at: -1 });

    res.json({ data: prescriptions });
  } catch (err) {
    console.error("❌ getPatientPrescriptionsForDoctor", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientLabReportsForDoctor = async (req, res) => {
  try {
    if (!ensureDoctor(req, res)) return;

    const allowed = await doctorHasPatient(
      req.user._id,
      req.params.patientId,
      req.user.hospitalId
    );

    if (!allowed)
      return res.status(403).json({ message: "Not your patient" });

    const reports = await LabReport.find({
      patient: req.params.patientId,
    }).sort({ test_date: -1 });

    res.json({ data: reports });
  } catch (err) {
    console.error("❌ getPatientLabReportsForDoctor", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientAISummaryForDoctor = async (req, res) => {
  try {
    if (!ensureDoctor(req, res)) return;

    const allowed = await doctorHasPatient(
      req.user._id,
      req.params.patientId,
      req.user.hospitalId
    );

    if (!allowed)
      return res.status(403).json({ message: "Not your patient" });

    const summary = await AISummary.findOne({
      patient: req.params.patientId,
    });

    res.json({ data: summary || null });
  } catch (err) {
    console.error("❌ getPatientAISummaryForDoctor", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientAlertsForDoctor = async (req, res) => {
  try {
    if (!ensureDoctor(req, res)) return;

    const allowed = await doctorHasPatient(
      req.user._id,
      req.params.patientId,
      req.user.hospitalId
    );

    if (!allowed)
      return res.status(403).json({ message: "Not your patient" });

    const alerts = await Alert.find({
      patient: req.params.patientId,
    }).sort({ created_at: -1 });

    res.json({ data: alerts });
  } catch (err) {
    console.error("❌ getPatientAlertsForDoctor", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DOCTOR PROFILE
====================================================== */

export const getMyDoctorProfile = async (req, res) => {
  try {
    if (!ensureDoctor(req, res)) return;
    res.json({ data: req.user });
  } catch (err) {
    console.error("❌ getMyDoctorProfile", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UPDATE MY DOCTOR PROFILE (OPTION-2)
====================================================== */

export const updateMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Doctors only" });
    }

    const doctor = await User.findById(req.user._id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    /* ================= SIMPLE FIELDS ================= */

    const fields = [
      "name",
      "phone",
      "dob",
      "blood_type",
      "specialization",
      "otherSpecialization",
      "bio",
      "consultation_fee",
      "online_consultation",
      "languages",
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        doctor[f] = req.body[f];
      }
    });

    /* ================= AVAILABILITY (CRITICAL FIX) ================= */

    if (Array.isArray(req.body.availability)) {
      doctor.availability = req.body.availability
        .filter(
          (slot) =>
            slot &&
            typeof slot.day === "string" &&
            typeof slot.from === "string" &&
            typeof slot.to === "string"
        )
        .map((slot) => ({
          day: slot.day,
          from: slot.from,
          to: slot.to,
          notes: slot.notes || "",
        }));
    }

    /* ================= PROFILE COMPLETION ================= */

    doctor.isProfileComplete =
      Boolean(doctor.specialization) &&
      Boolean(doctor.phone) &&
      Array.isArray(doctor.availability) &&
      doctor.availability.length > 0;

    await doctor.save();

    res.json({
      data: doctor,
      approvalStatus: {
        hospitalApproved: doctor.hospitalApproved,
        profileComplete: doctor.isProfileComplete,
        canAcceptAppointments:
          doctor.hospitalApproved && doctor.isProfileComplete,
      },
    });
  } catch (err) {
    console.error("❌ updateMyDoctorProfile:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

/* ======================================================
   PATIENT → LIST DOCTORS FOR BOOKING (OPTION-2)
====================================================== */

export const getAllDoctorsForBooking = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({ message: "Patients only" });
    }

    const doctors = await User.find({
      role: "doctor",
      isActive: true,
      hospitalApproved: true,
      isProfileComplete: true,
      hospitalId: { $exists: true, $ne: null },
    }).select(
      "name specialization otherSpecialization hospitalId consultation_fee profile_image availability"
    );

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (err) {
    console.error("❌ getAllDoctorsForBooking:", err);
    res.status(500).json({ message: "Server error" });
  }
};