import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { authMiddleware, checkAdminRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('', authMiddleware, checkAdminRole, dashboardController.dashboard);

router.post('/log', authMiddleware, checkAdminRole, dashboardController.log);

export default router;
