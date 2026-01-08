import { Router } from 'express';
import { authMiddleware, checkAdminRole } from '../middlewares/auth.middleware.js';
import recordedRouteController from '../controllers/recordedRoute.controller.js';

const router = Router();

router.post('/insert', authMiddleware, recordedRouteController.insert);

router.post('/admin/insert', authMiddleware, checkAdminRole, recordedRouteController.insert);

router.get('/admin/findById/:id', authMiddleware, checkAdminRole, recordedRouteController.adminFindById);

router.get('/findById/:id', authMiddleware, recordedRouteController.findById);

router.post('/admin/findAll', authMiddleware, recordedRouteController.adminFindAll);

router.post('/findAll', authMiddleware, recordedRouteController.findAll);

router.get('/findAllForMap', authMiddleware, recordedRouteController.findAllForMap);

router.delete('/admin/delete/:id', authMiddleware, checkAdminRole, recordedRouteController.delete);

router.post('/visibility', authMiddleware, recordedRouteController.updateIsPublic);

router.post('/admin/export', authMiddleware, checkAdminRole, recordedRouteController.export);

router.post('/findRouteAllByUserId', authMiddleware, recordedRouteController.findRouteAll);

export default router;
