import AuditLog from "../../models/AuditLog.js"

/* ======================================================
   GET HOSPITAL ACTIVITY LOGS
====================================================== */

export const getHospitalLogs = async (req, res) => {
  try {
    if (req.user.role !== "platform_admin") {
      return res.status(403).json({ message: "Platform admin only" })
    }

    const { id } = req.params

    const logs = await AuditLog.find({
      targetId: id,
      targetType: "Hospital",
    })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(10) // only recent 10
      .lean()

    res.json(logs)

  } catch (err) {
    console.error("❌ getHospitalLogs:", err)
    res.status(500).json({ message: "Failed to fetch hospital logs" })
  }
}

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    res.json(logs)
  } catch (err) {
    console.error("❌ getAuditLogs:", err)
    res.status(500).json({ message: "Failed to fetch audit logs" })
  }
}