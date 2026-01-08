import { Router } from 'express';
import { authMiddleware, checkAdminRole } from '../middlewares/auth.middleware.js';
import locationController from '../controllers/location.controller.js';

const router = Router();

router.post('/admin/insert', authMiddleware, checkAdminRole, locationController.insert);

router.get('/admin/findById/:id', authMiddleware, checkAdminRole, locationController.findById);

router.get('/findDetailById/:id', authMiddleware, locationController.findDetailById);

router.post('/admin/findAll', authMiddleware, locationController.findAll);

router.get('/findAllForMap', authMiddleware, locationController.findAllForMap);

router.post('/findFeature', authMiddleware, locationController.findFeature);

router.get('/findAllFeature/:locationId', authMiddleware, locationController.findFeatureAll);

router.post('/featureLocationReview', authMiddleware, locationController.reviewLocationFeature);

router.post('/featureLocationReviewImg', authMiddleware, locationController.reviewLocationFeatureImg);

router.post('/locationReview', authMiddleware, locationController.reviewLocation);

router.post('/findReviewByLocationId', authMiddleware, locationController.findReviewById);

router.delete('/admin/deleteReviewById/:id', authMiddleware, checkAdminRole, locationController.deleteReviewById);

router.post('/admin/updateLocation', authMiddleware, checkAdminRole, locationController.updateLocation);

router.delete('/admin/delete/:id', authMiddleware, checkAdminRole, locationController.delete);

router.get('/findAvgReviewByLocationId/:id', authMiddleware, locationController.findAvgReviewById);

router.post('/admin/export', authMiddleware, checkAdminRole, locationController.export);

router.post('/updateReview', authMiddleware, locationController.updateReview);

router.get('/calculateAccessibility/:locationId', authMiddleware, locationController.calAccessibility);

export default router;
