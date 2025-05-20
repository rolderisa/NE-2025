import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorMiddleware.js';
// import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from '../swagger/doc/swagger.json' assert { type: 'json' };
// Routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import parkingSlotRoutes from './routes/parkingSlotRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import vehicleRoutes from './routes/vehicleRoute.js';
import logRoutes from './routes/logRoutes.js';
import vehicleEntryRoutes from './routes/VehicleEntryRoutes.js';
import '../cron.js';
// import { swaggerSpec, swaggerUi } from '../swagger/doc/index.js';

// Initialize
dotenv.config();
export const prisma = new PrismaClient(); // Ensure this export is present
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));
// Serve Swagger UI at /api-docs
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parking-slots', parkingSlotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/vehicle-entries', vehicleEntryRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Harare' })}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});