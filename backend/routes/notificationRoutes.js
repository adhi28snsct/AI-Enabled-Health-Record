import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  getNotificationById,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
  pinNotification,
  patchNotification
} from '../controllers/notificationController.js';

const router = express.Router();
 
router.get('/', authMiddleware, getNotifications);
router.get('/:id', authMiddleware, getNotificationById);
router.patch('/:id/read', authMiddleware, markNotificationRead);      
router.patch('/:id/unread', authMiddleware, markNotificationUnread);  
router.patch('/:id', authMiddleware, patchNotification);              
router.patch('/mark-all-read', authMiddleware, markAllNotificationsRead); 
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
