import { Router } from 'express';
import postCategoryController from '../controllers/postCategory.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/findAll', authMiddleware, postCategoryController.findAll);

export default router;
