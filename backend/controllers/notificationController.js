import Notification from "../models/Notification.js";
import mongoose from "mongoose";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ======================================================
   GET MY NOTIFICATIONS (PATIENT)
====================================================== */
export const getNotifications = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const list = await Notification.find({
      patientId: req.user._id,
    })
      .sort({ pinned: -1, createdAt: -1 })
      .lean();

    return res.json({ data: list });
  } catch (err) {
    console.error("[getNotifications]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET SINGLE NOTIFICATION
====================================================== */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid id" });

    const notif = await Notification.findById(id).lean();
    if (!notif)
      return res.status(404).json({ message: "Notification not found" });

    if (String(notif.patientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({ data: notif });
  } catch (err) {
    console.error("[getNotificationById]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   MARK SINGLE NOTIFICATION READ
====================================================== */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid id" });

    const notif = await Notification.findById(id);
    if (!notif)
      return res.status(404).json({ message: "Notification not found" });

    if (String(notif.patientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    notif.read = true;
    await notif.save();

    return res.json({ data: notif });
  } catch (err) {
    console.error("[markNotificationRead]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   MARK ALL NOTIFICATIONS READ
====================================================== */
export const markAllNotificationsRead = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const result = await Notification.updateMany(
      { patientId: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.json({
      message: "All notifications marked read",
      updatedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error("[markAllNotificationsRead]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   MARK NOTIFICATION UNREAD
====================================================== */
export const markNotificationUnread = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid id" });

    const notif = await Notification.findById(id);
    if (!notif)
      return res.status(404).json({ message: "Notification not found" });

    if (String(notif.patientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    notif.read = false;
    await notif.save();

    return res.json({ data: notif });
  } catch (err) {
    console.error("[markNotificationUnread]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DELETE NOTIFICATION
====================================================== */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid id" });

    const notif = await Notification.findById(id);
    if (!notif)
      return res.status(404).json({ message: "Notification not found" });

    if (String(notif.patientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Notification.deleteOne({ _id: id });

    return res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("[deleteNotification]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   PIN / UNPIN NOTIFICATION
====================================================== */
export const pinNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const pinned = !!req.body?.pinned;

    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid id" });

    const notif = await Notification.findById(id);
    if (!notif)
      return res.status(404).json({ message: "Notification not found" });

    if (String(notif.patientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    notif.pinned = pinned;
    await notif.save();

    return res.json({ data: notif });
  } catch (err) {
    console.error("[pinNotification]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   PATCH NOTIFICATION (read / pinned)
====================================================== */
export const patchNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid id" });

    const allowed = {};
    if (Object.prototype.hasOwnProperty.call(req.body, "pinned"))
      allowed.pinned = !!req.body.pinned;
    if (Object.prototype.hasOwnProperty.call(req.body, "read"))
      allowed.read = !!req.body.read;

    if (Object.keys(allowed).length === 0) {
      return res.status(400).json({ message: "No supported fields to update" });
    }

    const notif = await Notification.findById(id);
    if (!notif)
      return res.status(404).json({ message: "Notification not found" });

    if (String(notif.patientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(notif, allowed);
    await notif.save();

    return res.json({ data: notif });
  } catch (err) {
    console.error("[patchNotification]", err);
    return res.status(500).json({ message: "Server error" });
  }
};
