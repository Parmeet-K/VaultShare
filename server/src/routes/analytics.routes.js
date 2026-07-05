import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { analytics } from '../controllers/analytics.controller.js';
export const analyticsRoutes = Router();
analyticsRoutes.use(protect);
analyticsRoutes.get('/', analytics);
