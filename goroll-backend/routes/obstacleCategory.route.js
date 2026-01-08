import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import obstacleCategoryController from '../controllers/obstacleCategory.controller.js';

const router = Router();

router.get('/findAll', authMiddleware, obstacleCategoryController.findAll);

export default router;
