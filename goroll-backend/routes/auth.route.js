import { Router } from 'express';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', authController.login);

router.get('/oauth/google', authController.loginGoogle);

router.get('/oauth/google/callback', authController.callback);

router.post('/oauth/google/app', authController.callbackOauth);

router.post('/refresh-token', authController.refreshAccessToken);

router.post('/register', authController.register);

router.post('/checkEmail', authController.checkEmail);

router.post('/resetPassword', authController.resetPassword);

router.post('/requestReset', authController.requestReset);

export default router;
