import { Router } from 'express';
import postStatusController from '../controllers/postStatus.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/findAll', authMiddleware, postStatusController.findAll);

export default router;
