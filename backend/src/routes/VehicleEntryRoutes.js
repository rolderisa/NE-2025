import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { registerVehicleEntry, updateVehicleExit } from '../controllers/VehicleEntryController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: VehicleEntries
 *   description: Vehicle entry and exit management
 */
router.post('/', protect, registerVehicleEntry);
router.put('/:id/exit', protect, updateVehicleExit);

export default router;