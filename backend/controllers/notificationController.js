
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const list = await Notification.find({ patientId: userId }).sort({ createdAt: -1 }).lean();
    return res.json({ data: list });
  } catch (err) {
    console.error('[getNotifications] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ message: 'Invalid id' });

    const notif = await Notification.findById(id).lean();
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    const caller = req.user;
    if (!caller) return res.status(401).json({ message: 'Unauthorized' });

    if (String(notif.patientId) !== String(caller._id) && caller.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json({ data: notif });
  } catch (err) {
    console.error('[getNotificationById] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ message: 'Invalid id' });

    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    const caller = req.user;
    if (!caller) return res.status(401).json({ message: 'Unauthorized' });
    if (String(notif.patientId) !== String(caller._id) && caller.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notif.read = true;
    await notif.save();

    return res.json({ data: notif });
  } catch (err) {
    console.error('[markNotificationRead] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const result = await Notification.updateMany({ patientId: userId, read: { $ne: true } }, { $set: { read: true } });
    return res.json({ message: 'All notifications marked read', updatedCount: result.modifiedCount ?? result.nModified ?? 0 });
  } catch (err) {
    console.error('[markAllNotificationsRead] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const markNotificationUnread = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ message: 'Invalid id' });

    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    const caller = req.user;
    if (!caller) return res.status(401).json({ message: 'Unauthorized' });
    if (String(notif.patientId) !== String(caller._id) && caller.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notif.read = false;
    await notif.save();

    return res.json({ data: notif });
  } catch (err) {
    console.error('[markNotificationUnread] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ message: 'Invalid id' });

    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    const caller = req.user;
    if (!caller) return res.status(401).json({ message: 'Unauthorized' });
    if (String(notif.patientId) !== String(caller._id) && caller.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Notification.deleteOne({ _id: id });
    return res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('[deleteNotification] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const pinNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const pinned = req.body?.pinned;
    if (!validId(id)) return res.status(400).json({ message: 'Invalid id' });

    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    const caller = req.user;
    if (!caller) return res.status(401).json({ message: 'Unauthorized' });
    if (String(notif.patientId) !== String(caller._id) && caller.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notif.pinned = !!pinned;
    await notif.save();

    return res.json({ data: notif });
  } catch (err) {
    console.error('[pinNotification] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const patchNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ message: 'Invalid id' });

    const allowed = {};
    if (req.body.hasOwnProperty('pinned')) allowed.pinned = !!req.body.pinned;
    if (req.body.hasOwnProperty('read')) allowed.read = !!req.body.read;

    if (Object.keys(allowed).length === 0) {
      return res.status(400).json({ message: 'No supported fields to update' });
    }

    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    const caller = req.user;
    if (!caller) return res.status(401).json({ message: 'Unauthorized' });
    if (String(notif.patientId) !== String(caller._id) && caller.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    Object.assign(notif, allowed);
    await notif.save();

    return res.json({ data: notif });
  } catch (err) {
    console.error('[patchNotification] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getNotifications,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  pinNotification,
  patchNotification,
};
