import Hospital from "../../models/Hospital.js"
import User from "../../models/User.js"
import crypto from "crypto"
import { sendInviteEmail } from "../../utils/mailer.js"
import { logAction } from "../../utils/AuditLogger.js"

/* ======================================================
   GET ALL HOSPITALS (PLATFORM ADMIN)
====================================================== */

export const getHospitals = async (req, res) => {
  try {
    /* ================= ROLE CHECK ================= */

    if (!req.user || req.user.role !== "platform_admin") {
      return res.status(403).json({ message: "Platform admin only" })
    }

    /* ================= QUERY PARAMS ================= */

    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 10, 50) // cap at 50
    const search = req.query.search?.trim()
    const status = req.query.status
    const district = req.query.district?.trim()
    const sortBy = req.query.sortBy || "createdAt"
    const order = req.query.order === "asc" ? 1 : -1

    const skip = (page - 1) * limit

    /* ================= BUILD FILTER ================= */

    const filter = {}

    // 🔍 Search by hospital name OR manager email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { managerEmail: { $regex: search, $options: "i" } },
      ]
    }

    // 📌 Status filter
    if (status === "active") {
      filter.isActive = true
    }

    if (status === "inactive") {
      filter.isActive = false
    }

    // 📍 District filter (case insensitive partial match)
    if (district) {
      filter.district = { $regex: district, $options: "i" }
    }

    /* ================= DB OPERATIONS ================= */

    const total = await Hospital.countDocuments(filter)

    const hospitals = await Hospital.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .lean()

    /* ================= RESPONSE ================= */

    res.json({
      success: true,
      data: hospitals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (err) {
    console.error("❌ getHospitals:", err)
    res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals",
    })
  }
}

/* ======================================================
   CREATE HOSPITAL + PRE-CREATE ADMIN + SEND EMAIL
====================================================== */

export const createHospital = async (req, res) => {
  try {
    if (req.user.role !== "platform_admin") {
      return res.status(403).json({ message: "Platform admin only" })
    }

    const { name, district, managerEmail } = req.body

    if (!name || !district || !managerEmail) {
      return res.status(400).json({
        message: "Name, district and managerEmail are required",
      })
    }

    const email = managerEmail.toLowerCase()

    const existingHospital = await Hospital.findOne({ name })
    if (existingHospital) {
      return res.status(400).json({ message: "Hospital already exists" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hospitalCode =
      "HSP-" + crypto.randomBytes(3).toString("hex").toUpperCase()

    const hospital = await Hospital.create({
      hospitalId: hospitalCode,
      name,
      district,
      managerEmail: email,
      createdBy: req.user.id,
      isActive: true,
    })

    await User.create({
      name: "Hospital Admin",
      email,
      role: "hospital_admin",
      hospitalId: hospital._id,
      authProvider: "google",
      isActive: true,
      hospitalApproved: false,
      status: "PENDING",
    })

    /* ================= AUDIT LOG ================= */

    await logAction({
      action: "CREATE_HOSPITAL",
      performedBy: req.user.id,
      targetId: hospital._id,
      targetType: "Hospital",
      metadata: {
        hospitalName: hospital.name,
        district: hospital.district,
        managerEmail: email,
      },
    })

    /* ================= EMAIL ================= */

    const inviteLink = `${process.env.FRONTEND_URL}/login`

    try {
      await sendInviteEmail({
        to: email,
        link: inviteLink,
        role: "Hospital Admin",
      })
      console.log("✅ Invite email sent to:", email)
    } catch (mailErr) {
      console.error("❌ Email sending failed:", mailErr.message)
    }

    res.status(201).json({
      message: "Hospital created successfully",
      hospital,
    })

  } catch (err) {
    console.error("❌ createHospital:", err)
    res.status(500).json({ message: "Server error" })
  }
}

/* ======================================================
   UPDATE HOSPITAL STATUS (SUSPEND / REACTIVATE)
====================================================== */

export const updateHospitalStatus = async (req, res) => {
  try {
    if (req.user.role !== "platform_admin") {
      return res.status(403).json({ message: "Platform admin only" })
    }

    const { id } = req.params
    const { isActive } = req.body

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive boolean value required",
      })
    }

    const hospital = await Hospital.findById(id)

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" })
    }

    hospital.isActive = isActive
    await hospital.save()

    await User.updateMany(
      { hospitalId: hospital._id },
      { $set: { isActive } }
    )

    /* ================= AUDIT LOG ================= */

    await logAction({
      action: isActive
        ? "REACTIVATE_HOSPITAL"
        : "SUSPEND_HOSPITAL",
      performedBy: req.user.id,
      targetId: hospital._id,
      targetType: "Hospital",
      metadata: {
        hospitalName: hospital.name,
        newStatus: isActive,
      },
    })

    res.json({
      message: isActive
        ? "Hospital reactivated successfully"
        : "Hospital suspended successfully",
    })

  } catch (err) {
    console.error("❌ updateHospitalStatus:", err)
    res.status(500).json({ message: "Server error" })
  }
}