import { Router } from 'express';
import { authMiddleware, checkAdminRole } from '../middlewares/auth.middleware.js';
import obstacleController from '../controllers/obstacle.controller.js';

const router = Router();

router.post('/admin/findAll', authMiddleware, obstacleController.findAll);

router.get('/admin/findById/:id', authMiddleware, checkAdminRole, obstacleController.adminFindById);

router.get('/findById/:id', authMiddleware, obstacleController.findById);

router.post('/insert', authMiddleware, obstacleController.insert);

router.post('/admin/insert', authMiddleware, checkAdminRole, obstacleController.insert);

router.post('/admin/update', authMiddleware, checkAdminRole, obstacleController.update);

router.delete('/admin/delete/:id', authMiddleware, checkAdminRole, obstacleController.delete);

router.post('/confirmation', authMiddleware, obstacleController.confirmation);

router.get('/findAllForMap', authMiddleware, obstacleController.findAllForMap);

router.post('/admin/export', authMiddleware, checkAdminRole, obstacleController.export);

router.get('/checkResolve/:obstacleId', authMiddleware, obstacleController.checkResolve);

export default router;
