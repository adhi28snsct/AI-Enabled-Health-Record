import AuditLog from "../models/AuditLog.js"

export const logAction = async ({
  action,
  performedBy,
  targetId,
  targetType,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetId,
      targetType,
      metadata,
    })
  } catch (err) {
    console.error("❌ Audit log failed:", err.message)
  }
}