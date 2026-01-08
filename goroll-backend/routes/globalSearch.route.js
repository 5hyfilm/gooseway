import { Router } from 'express';
import globalSearchController from '../controllers/globalSearch.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/findAll', authMiddleware, globalSearchController.findAll);

export default router;
