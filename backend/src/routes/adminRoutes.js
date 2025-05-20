import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getUsers,
  getBookings,
  exportUsers,
  exportBookings,
  updateBookingStatus,
  getUserVehicleEntries,
} from '../controllers/AdminController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */
router.get('/dashboard', protect, getDashboardStats);
router.get('/users', protect, getUsers);
router.get('/bookings', protect, getBookings);
router.get('/users/export', protect, exportUsers);
router.get('/bookings/export', protect, exportBookings);
router.put('/bookings/:id/status', protect, updateBookingStatus);
router.get('/users/:userId/vehicle-entries', protect, getUserVehicleEntries);

export default router;