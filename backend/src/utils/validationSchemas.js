import { z } from 'zod';

// Authentication schemas
export const registerSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Parking slot schemas
export const createParkingSlotSchema = z.object({
  slotNumber: z.string().min(1).max(20),
  type: z.enum(['VIP', 'REGULAR']).default('REGULAR'),
  isAvailable: z.boolean().default(true),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).default('MEDIUM'),
  vehicleType: z.enum(['CAR', 'BIKE', 'MOTORCYCLE', 'TRUCK']).default('CAR'),
  parkingName: z.string().min(1).max(100).optional(),
  availableSpaces: z.number().int().min(1).default(1),
  chargePerHour: z.number().min(0).default(2000.0),
  location: z.string().min(1).max(200).optional(),
});

export const updateParkingSlotSchema = z.object({
  slotNumber: z.string().min(1).max(20).optional(),
  type: z.enum(['VIP', 'REGULAR']).optional(),
  isAvailable: z.boolean().optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  vehicleType: z.enum(['CAR', 'BIKE', 'MOTORCYCLE', 'TRUCK']).optional(),
  parkingName: z.string().min(1).max(100).optional(),
  availableSpaces: z.number().int().min(1).optional(),
  chargePerHour: z.number().min(0).optional(),
  location: z.string().min(1).max(200).optional(),
});

// Booking schemas
export const createBookingSchema = z
  .object({
    startTime: z.preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    }, z.date({ required_error: 'Start time is required' })),

    endTime: z.preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    }, z.date({ required_error: 'End time is required' })),

    slotId: z.string().uuid({ message: 'Invalid slot ID format' }),
    vehicle: z.object({
      connect: z.object({
        id: z.string().uuid({ message: 'Invalid vehicle ID format' }),
      }),
    }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Start time must be before end time',
    path: ['startTime'],
  })
  .refine((data) => data.startTime > new Date(), {
    message: 'Start time must be in the future',
    path: ['startTime'],
  });

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED']).optional(),
});

// Payment plan schemas
export const createPaymentPlanSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.enum(['FREE', 'MONTHLY', 'YEARLY']),
  price: z.number().min(0),
  duration: z.number().int().positive(),
  description: z.string().optional(),
});

export const updatePaymentPlanSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  price: z.number().min(0).optional(),
  duration: z.number().int().positive().optional(),
  description: z.string().optional(),
});

// Payment schemas
export const createPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

// Search and filter schemas
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => parseInt(val || '1')),
  limit: z
    .string()
    .optional()
    .transform(val => parseInt(val || '10')),
});

export const userSearchSchema = paginationSchema.extend({
  name: z.string().optional(),
  email: z.string().optional(),
  plateNumber: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const bookingSearchSchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED']).optional(),
  userId: z.string().optional(),
  slotId: z.string().optional(),
  isPaid: z.string().transform(val => val === 'true').optional(),
});

export const slotSearchSchema = paginationSchema.extend({
  type: z.enum(['VIP', 'REGULAR']).optional(),
  isAvailable: z.string().transform(val => val === 'true').optional(),
  slotNumber: z.string().optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  vehicleType: z.enum(['CAR', 'BIKE', 'MOTORCYCLE', 'TRUCK']).optional(),
  parkingName: z.string().optional(),
  location: z.string().optional(),
});

// Vehicle schemas
export const createVehicleSchema = z.object({
  plateNumber: z.string().min(2).max(20),
  type: z.enum(['CAR', 'BIKE', 'MOTORCYCLE', 'TRUCK']),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  attributes: z.object({}).passthrough().optional(),
});

export const updateVehicleSchema = z.object({
  plateNumber: z.string().min(2).max(20).optional(),
  type: z.enum(['CAR', 'BIKE', 'MOTORCYCLE', 'TRUCK']).optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  attributes: z.object({}).passthrough().optional(),
});

export const vehicleSearchSchema = paginationSchema.extend({
  type: z.enum(['CAR', 'BIKE', 'MOTORCYCLE', 'TRUCK']).optional(),
  plateNumber: z.string().optional(),
});