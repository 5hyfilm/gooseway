import { Router } from 'express';
import locationCategoryController from '../controllers/locationCategory.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/findAll', authMiddleware, locationCategoryController.findAll);

export default router;
