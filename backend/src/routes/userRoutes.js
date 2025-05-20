import express from 'express';
import { downloadUserProfile, getUserBookings, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/bookings', getUserBookings);
router.get('/profile/pdf', downloadUserProfile);

export default router;