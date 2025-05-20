import express from 'express';
import { 
  createParkingSlot, 
  deleteParkingSlot, 
  getAvailableSlots, 
  getParkingSlotById, 
  getParkingSlots, 
  updateParkingSlot 
} from '../controllers/parkingSlotController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getParkingSlots);
router.get('/available', getAvailableSlots);
router.get('/:id', getParkingSlotById);

// Admin routes
router.post('/', protect, admin, createParkingSlot);
router.put('/:id', protect, admin, updateParkingSlot);
router.get('/',protect, admin, getParkingSlots);
router.delete('/:id', protect, admin, deleteParkingSlot);

export default router;