import User from "../../models/User.js"
import Appointment from "../../models/Appointment.js"
import Alert from "../../models/Alert.js"
import AISummary from "../../models/AISummary.js"
import Hospital from "../../models/Hospital.js"

import PDFDocument from "pdfkit"

/* ======================================================
   COMMON METRIC BUILDER
====================================================== */

const getCoreMetrics = async () => {
  const [
    totalPatients,
    activePatients,
    totalDoctors,
    totalHospitals,
    activeHospitals,
    criticalAlerts,
    highRiskPatients,
  ] = await Promise.all([
    User.countDocuments({ role: "patient" }),
    User.countDocuments({ role: "patient", isActive: true }),
    User.countDocuments({ role: "doctor" }),
    Hospital.countDocuments(),
    Hospital.countDocuments({ isActive: true }),
    Alert.countDocuments({ severity: "critical" }),
    AISummary.countDocuments({
      $or: [
        { diabetes_risk: { $gte: 70 } },
        { hypertension_risk: { $gte: 70 } },
        { cardiac_risk: { $gte: 70 } },
      ],
    }),
  ])

  return {
    totalPatients,
    activePatients,
    totalDoctors,
    totalHospitals,
    activeHospitals,
    suspendedHospitals: totalHospitals - activeHospitals,
    highRiskPatients,
    criticalAlerts,
  }
}

/* ======================================================
   DASHBOARD (JSON)
====================================================== */

export const getPlatformDashboard = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "platform_admin") {
      return res.status(403).json({ message: "Platform admin only" })
    }

    const totals = await getCoreMetrics()

    res.json({
      generatedAt: new Date(),
      totals,
    })

  } catch (err) {
    console.error("❌ getPlatformDashboard:", err)
    res.status(500).json({ message: "Dashboard failed" })
  }
}

/* ======================================================
   GENERATE PLATFORM REPORT (PDF DOWNLOAD)
====================================================== */

export const generatePlatformReport = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "platform_admin") {
      return res.status(403).json({ message: "Platform admin only" })
    }

    const totals = await getCoreMetrics()

    const hospitalPerformance = await Appointment.aggregate([
      {
        $group: {
          _id: "$hospitalId",
          appointments: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "hospitals",
          localField: "_id",
          foreignField: "_id",
          as: "hospital",
        },
      },
      { $unwind: "$hospital" },
      {
        $project: {
          hospitalName: "$hospital.name",
          district: "$hospital.district",
          appointments: 1,
        },
      },
      { $sort: { appointments: -1 } },
      { $limit: 10 },
    ])

    /* ================= CREATE PDF ================= */

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=platform-report.pdf"
    )

    doc.pipe(res)

    /* ================= HEADER ================= */

    doc
      .fontSize(20)
      .text("HealthConnect Platform Report", { align: "center" })

    doc.moveDown()
    doc
      .fontSize(10)
      .text(`Generated At: ${new Date().toLocaleString()}`, {
        align: "right",
      })

    doc.moveDown(2)

    /* ================= INFRASTRUCTURE ================= */

    doc.fontSize(16).text("Infrastructure Overview")
    doc.moveDown()

    doc.fontSize(12)
    doc.text(`Total Hospitals: ${totals.totalHospitals}`)
    doc.text(`Active Hospitals: ${totals.activeHospitals}`)
    doc.text(`Suspended Hospitals: ${totals.suspendedHospitals}`)
    doc.text(`Total Doctors: ${totals.totalDoctors}`)
    doc.text(`Total Patients: ${totals.totalPatients}`)

    doc.moveDown(2)

    /* ================= RISK SUMMARY ================= */

    doc.fontSize(16).text("Risk Summary")
    doc.moveDown()

    doc.fontSize(12)
    doc.text(`High Risk Patients: ${totals.highRiskPatients}`)
    doc.text(`Critical Alerts: ${totals.criticalAlerts}`)

    doc.moveDown(2)

    /* ================= TOP HOSPITALS ================= */

    doc.fontSize(16).text("Top Performing Hospitals")
    doc.moveDown()

    hospitalPerformance.forEach((h, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${h.hospitalName} (${h.district}) - ${h.appointments} appointments`
        )
    })

    doc.moveDown(3)

    doc
      .fontSize(10)
      .text("This is a system-generated governance report.", {
        align: "center",
      })

    doc.end()

  } catch (err) {
    console.error("❌ generatePlatformReport:", err)
    res.status(500).json({ message: "Report generation failed" })
  }
}