import { Router } from 'express';
import roleController from '../controllers/role.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/findAll', authMiddleware, roleController.findAll);

export default router;
