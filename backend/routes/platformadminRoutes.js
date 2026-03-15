import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js"

/* ===== CONTROLLERS ===== */

import {
  getHospitals,
  createHospital,
  updateHospitalStatus,
} from "../controllers/platform/hospitalManagementController.js"

import {
  getPlatformDashboard,
  generatePlatformReport,   // ✅ NEW
} from "../controllers/platform/platformAnalyticsController.js"

import {
  getHospitalAnalytics,
} from "../controllers/platform/hospitalAnalyticsController.js"

import {
  getAuditLogs,
  getHospitalLogs,
} from "../controllers/platform/logController.js"

const router = express.Router()

/* ======================================================
   ROLE CHECK MIDDLEWARE
====================================================== */

const requirePlatformAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "platform_admin") {
    return res.status(403).json({ message: "Platform admin only" })
  }
  next()
}

/* ======================================================
   PLATFORM DASHBOARD
====================================================== */

router.get(
  "/dashboard",
  authMiddleware,
  requirePlatformAdmin,
  getPlatformDashboard
)

/* ======================================================
   PLATFORM REPORT (GOVERNMENT EXPORT)
====================================================== */

router.get(
  "/report",                      // ✅ NEW ROUTE
  authMiddleware,
  requirePlatformAdmin,
  generatePlatformReport
)

/* ======================================================
   HOSPITAL MANAGEMENT
====================================================== */

router.get(
  "/hospitals",
  authMiddleware,
  requirePlatformAdmin,
  getHospitals
)

router.post(
  "/hospitals",
  authMiddleware,
  requirePlatformAdmin,
  createHospital
)

router.patch(
  "/hospitals/:id/status",
  authMiddleware,
  requirePlatformAdmin,
  updateHospitalStatus
)

router.get(
  "/hospitals/:id/analytics",
  authMiddleware,
  requirePlatformAdmin,
  getHospitalAnalytics
)

/* ======================================================
   HOSPITAL-SPECIFIC ACTIVITY LOGS
====================================================== */

router.get(
  "/hospitals/:id/logs",
  authMiddleware,
  requirePlatformAdmin,
  getHospitalLogs
)

/* ======================================================
   GLOBAL AUDIT LOGS
====================================================== */

router.get(
  "/logs",
  authMiddleware,
  requirePlatformAdmin,
  getAuditLogs
)

export default router