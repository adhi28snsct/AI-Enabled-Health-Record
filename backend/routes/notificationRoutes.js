
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  pinNotification,
  patchNotification,
} from '../controllers/notificationController.js';

const router = express.Router();
router.get('/', authMiddleware, getNotifications);

router.get('/:id', authMiddleware, getNotificationById);

router.patch('/:id/read', authMiddleware, markNotificationRead);

router.patch('/read-all', authMiddleware, markAllNotificationsRead);

router.delete('/:id', authMiddleware, deleteNotification);

router.patch('/:id/pin', authMiddleware, pinNotification);

router.patch('/:id', authMiddleware, patchNotification);

export default router;

