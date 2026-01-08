import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import obstacleStatusController from '../controllers/obstacleStatus.controller.js';

const router = Router();

router.get('/findAll', authMiddleware, obstacleStatusController.findAll);

export default router;
