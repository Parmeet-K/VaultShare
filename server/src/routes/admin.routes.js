import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { adminOverview, updateUser } from '../controllers/admin.controller.js';
export const adminRoutes = Router();
adminRoutes.use(protect, authorize('admin'));
adminRoutes.get('/overview', adminOverview);
adminRoutes.patch('/users/:id', updateUser);
