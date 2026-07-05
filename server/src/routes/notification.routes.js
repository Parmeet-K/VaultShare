import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { listNotifications, markRead } from '../controllers/notification.controller.js';
export const notificationRoutes = Router();
notificationRoutes.use(protect);
notificationRoutes.get('/', listNotifications);
notificationRoutes.patch('/read', markRead);
