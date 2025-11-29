import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signin', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.sendPasswordResetOTP);
router.post('/reset-password', authController.resetPassword);

// Protected routes - Admin only
router.post('/send-otp', authenticateToken, authorizeRole('admin'), authController.sendSignupOTP);
router.post('/signup', authenticateToken, authorizeRole('admin'), authController.signup);
router.get('/users', authenticateToken, authorizeRole('admin'), authController.getAllUsers);

// Protected routes - All authenticated users
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
