import { Router } from 'express';
import userStatusController from '../controllers/userStatus.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/findAll', authMiddleware, userStatusController.findAll);

export default router;
