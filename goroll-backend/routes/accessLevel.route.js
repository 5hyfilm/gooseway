import { Router } from 'express';
import accessLevelController from '../controllers/accessLevel.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/findAll', authMiddleware, accessLevelController.findAll);

export default router;
