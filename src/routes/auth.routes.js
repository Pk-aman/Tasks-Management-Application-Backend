import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/send-otp', authController.sendSignupOTP);
router.post('/signup', authController.signup);
router.post('/signin', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.sendPasswordResetOTP);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
