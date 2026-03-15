import mongoose from "mongoose";
import User from "../../models/User.js";
import Appointment from "../../models/Appointment.js";
import Hospital from "../../models/Hospital.js";
import { sendInviteEmail } from "../../utils/mailer.js";

/* =========================================================
   ROLE GUARD – HOSPITAL ADMIN ONLY
========================================================= */
const ensureHospitalAdmin = (req, res) => {
  if (req.user.role !== "hospital_admin") {
    res.status(403).json({ message: "Hospital admin only" });
    return false;
  }

  if (!req.user.hospitalId) {
    res.status(400).json({ message: "Hospital not assigned" });
    return false;
  }

  return true;
};

/* =========================================================
   ADD DOCTOR (CREATE USER + EMAIL)
========================================================= */
export const addDoctor = async (req, res) => {
  try {
    if (!ensureHospitalAdmin(req, res)) return;

    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Doctor email required" });
    }

    const normalizedEmail = email.toLowerCase();

    const existingDoctor = await User.findOne({
      email: normalizedEmail,
      role: "doctor",
      hospitalId: req.user.hospitalId,
    });

    if (existingDoctor) {
      return res.status(400).json({
        message: "Doctor already exists in this hospital",
      });
    }

    const doctor = await User.create({
      name: name || "Doctor",
      email: normalizedEmail,
      role: "doctor",
      hospitalId: req.user.hospitalId,
      authProvider: "google",
      isActive: true,
      status: "PENDING",
      hospitalApproved: false,
    });

    /* ---------- EMAIL ---------- */
    try {
      const hospital = await Hospital.findById(req.user.hospitalId);
      const loginLink = `${process.env.FRONTEND_URL}/login`;

      await sendInviteEmail({
        to: normalizedEmail,
        link: loginLink,
        role: `Doctor - ${hospital?.name || "Health Connect"}`,
      });

      console.log("📨 Doctor email sent");
    } catch (mailErr) {
      console.error("❌ Email failed:", mailErr.message);
    }

    res.json({
      message: "Doctor added successfully.",
      doctor,
    });

  } catch (err) {
    console.error("❌ addDoctor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET ALL ACTIVE DOCTORS
========================================================= */
export const getHospitalDoctors = async (req, res) => {
  try {
    if (!ensureHospitalAdmin(req, res)) return;

    const doctors = await User.find({
      role: "doctor",
      hospitalId: req.user.hospitalId,
      isActive: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(doctors);

  } catch (err) {
    console.error("❌ getHospitalDoctors:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   APPROVE DOCTOR
========================================================= */
export const approveDoctor = async (req, res) => {
  try {
    if (!ensureHospitalAdmin(req, res)) return;

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const doctor = await User.findOne({
      _id: id,
      role: "doctor",
      hospitalId: req.user.hospitalId,
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.hospitalApproved = true;
    await doctor.save();

    res.json({ message: "Doctor approved successfully." });

  } catch (err) {
    console.error("❌ approveDoctor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   DEACTIVATE DOCTOR
========================================================= */
export const deactivateDoctor = async (req, res) => {
  try {
    if (!ensureHospitalAdmin(req, res)) return;

    const { doctorId } = req.params;

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
      hospitalId: req.user.hospitalId,
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.isActive = false;
    await doctor.save();

    res.json({ message: "Doctor deactivated" });

  } catch (err) {
    console.error("❌ deactivateDoctor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET ALL PATIENTS
========================================================= */
export const getHospitalPatients = async (req, res) => {
  try {
    if (!ensureHospitalAdmin(req, res)) return;

    const hospitalId = new mongoose.Types.ObjectId(req.user.hospitalId);

    const patients = await Appointment.aggregate([
      { $match: { hospital: hospitalId } },
      { $group: { _id: "$patient" } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $project: {
          _id: "$patient._id",
          name: "$patient.name",
          phone: "$patient.phone",
        },
      },
    ]);

    res.json(patients);

  } catch (err) {
    console.error("❌ getHospitalPatients:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET ALL APPOINTMENTS
========================================================= */
export const getHospitalAppointments = async (req, res) => {
  try {
    if (!ensureHospitalAdmin(req, res)) return;

    const appointments = await Appointment.find({
      hospital: req.user.hospitalId,
    })
      .populate("doctor", "name specialization")
      .populate("patient", "name gender dob")
      .sort({ requested_at: -1 });

    res.json(appointments);

  } catch (err) {
    console.error("❌ getHospitalAppointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   DASHBOARD STATS
========================================================= */
export const getHospitalStats = async (req, res) => {
  try {
    if (!ensureHospitalAdmin(req, res)) return;

    const hospitalId = new mongoose.Types.ObjectId(req.user.hospitalId);

    const [doctorCount, appointmentCount, patientAgg] = await Promise.all([
      User.countDocuments({ role: "doctor", hospitalId, isActive: true }),
      Appointment.countDocuments({ hospital: hospitalId }),
      Appointment.aggregate([
        { $match: { hospital: hospitalId } },
        { $group: { _id: "$patient" } },
        { $count: "count" },
      ]),
    ]);

    res.json({
      doctors: doctorCount,
      appointments: appointmentCount,
      patients: patientAgg[0]?.count || 0,
    });

  } catch (err) {
    console.error("❌ getHospitalStats:", err);
    res.status(500).json({ message: "Server error" });
  }
};