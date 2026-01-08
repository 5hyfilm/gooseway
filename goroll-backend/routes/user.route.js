import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { authMiddleware, checkAdminRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/admin/findAll', authMiddleware, checkAdminRole, userController.findAll);

router.get('/admin/findById/:id', authMiddleware, checkAdminRole, userController.adminFindById);

router.get('/findById/:id', authMiddleware, userController.findById);

router.post('/admin/insert', authMiddleware, checkAdminRole, userController.insert);

router.post('/update', authMiddleware, userController.update);

router.delete('/admin/delete/:id', authMiddleware, checkAdminRole, userController.delete);

router.post('/admin/status', authMiddleware, checkAdminRole, userController.changeStatus);

router.post('/admin/update', authMiddleware, checkAdminRole, userController.adminUpdate);

router.post('/wheelchair/update', authMiddleware, userController.updateWheelChair);

router.get('/findWheelChairByUserId/:userId', authMiddleware, userController.findWheelChairByUserId);

router.post('/follow', authMiddleware, userController.followUser);

router.post('/findAllFollower', authMiddleware, checkAdminRole, userController.findAllFollower);

router.post('/findAllFollowing', authMiddleware, checkAdminRole, userController.findAllFollowing);

router.get('/profile', authMiddleware, userController.profile);

router.post('/admin/export', authMiddleware, checkAdminRole, userController.export);

export default router;
