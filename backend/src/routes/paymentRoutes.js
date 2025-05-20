import express from 'express';
import { 
  createPaymentPlan, 
  deletePaymentPlan, 
  getPaymentById, 
  getPaymentPlanById, 
  getPaymentPlans, 
  getUserPayments, 
  updatePayment, 
  updatePaymentPlan 
} from '../controllers/paymentController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/plans', getPaymentPlans);
router.get('/plans/:id', getPaymentPlanById);

// Protected routes
router.use(protect);
router.get('/', getUserPayments);
router.get('/:id', getPaymentById);

// Admin routes
router.post('/plans', admin, createPaymentPlan);
router.put('/plans/:id', admin, updatePaymentPlan);
router.delete('/plans/:id', admin, deletePaymentPlan);
router.put('/:id', admin, updatePayment);

export default router;