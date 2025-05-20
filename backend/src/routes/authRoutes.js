import express from 'express';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  verifyEmail,
  initiateEmailVerification,
  initiateResetPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/verify-email', verifyEmail);
router.put('/initiate-email-verification', initiateEmailVerification);
router.put('/initiate-reset-password', initiateResetPassword);
router.put('/reset-password', resetPassword);

// Protected route
router.get('/me', protect, getCurrentUser);

export default router;
