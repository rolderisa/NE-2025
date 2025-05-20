import express from 'express';
import { 
  completeBookingPayment, 
  createBooking, 
  downloadBookingAsPDF, 
  getBookingById, 
  getUserBookings, 
  updateBooking,
  completeBooking,
  approveBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.put('/:id/exit', completeBooking);
router.get('/:id/pdf', downloadBookingAsPDF);
router.post('/:id/pay', completeBookingPayment);
router.post('/approve', approveBooking);

export default router;