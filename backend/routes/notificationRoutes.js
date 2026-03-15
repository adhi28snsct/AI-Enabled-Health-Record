import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  getNotificationById,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
  patchNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

/* ======================================================
   ALL ROUTES PROTECTED
====================================================== */
router.use(authMiddleware);

/* ======================================================
   COLLECTION ROUTES
====================================================== */

// 🔔 Get all my notifications
router.get("/", getNotifications);

// ✅ Mark all as read
router.patch("/mark-all-read", markAllNotificationsRead);

/* ======================================================
   SINGLE NOTIFICATION ROUTES
====================================================== */

// 📄 Get one notification
router.get("/:id", getNotificationById);

// ✅ Mark read
router.patch("/:id/read", markNotificationRead);

// ↩ Mark unread
router.patch("/:id/unread", markNotificationUnread);

// 📌 Patch (read / pinned)
router.patch("/:id", patchNotification);

// 🗑 Delete
router.delete("/:id", deleteNotification);

export default router;
