import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import obstacleSubCategoryController from '../controllers/obstacleSubCategory.controller.js';

const router = Router();

router.get('/findByCategoryId/:id', authMiddleware, obstacleSubCategoryController.findByCategoryId);

export default router;
