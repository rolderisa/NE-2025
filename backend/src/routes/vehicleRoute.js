import express from 'express';
import { 
  createVehicle, 
  deleteVehicle, 
  getVehicleById, 
  getUserVehicles, 
  updateVehicle,
  getVehicleByPlateNumber,
  getAllVehiclesForSelection
} from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/all', getAllVehiclesForSelection); // Static route first
router.get('/plate/:plateNumber', getVehicleByPlateNumber);
router.get('/', getUserVehicles);
router.get('/:id', getVehicleById); // Parameterized route after static routes
router.post('/', createVehicle);
router.put('/plate/:plateNumber', updateVehicle);
router.delete('/plate/:plateNumber', deleteVehicle);

export default router;