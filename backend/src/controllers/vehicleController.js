import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import { createVehicleSchema, updateVehicleSchema, vehicleSearchSchema } from '../utils/validationSchemas.js';

// @desc    Get user vehicles with pagination and search
// @route   GET /api/vehicles
// @access  Private
export const getUserVehicles = asyncHandler(async (req, res) => {
  const { page, limit, type, plateNumber } = vehicleSearchSchema.parse(req.query);
  const skip = (page - 1) * limit;
  
  const where = { userId: req.user.id };
  if (type) where.type = type;
  if (plateNumber) where.plateNumber = { contains: plateNumber, mode: 'insensitive' };
  
  const totalCount = await prisma.vehicle.count({ where });
  
  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    include: { _count: { select: { bookings: true } } }
  });
  
  res.status(200).json({
    vehicles,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount
  });
});

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { bookings: true } } }
  });
  
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  if (vehicle.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this vehicle');
  }
  
  res.status(200).json(vehicle);
});

// @desc    Get all vehicles for selection (no pagination)
// @route   GET /api/vehicles/all
// @access  Private
export const getAllVehiclesForSelection = asyncHandler(async (req, res) => {
  console.log('Authenticated user ID:', req.user?.id);
  if (!req.user?.id) {
    res.status(401);
    throw new Error('User not authenticated');
  }
  
  const where = { userId: req.user.id };
  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { bookings: true } } }
  });
  
  console.log('Fetched vehicles:', vehicles);
  
  res.status(200).json({ vehicles, message: vehicles.length === 0 ? 'No vehicles found' : undefined });
});

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
export const createVehicle = asyncHandler(async (req, res) => {
  const result = createVehicleSchema.safeParse(req.body);

  if (!result.success) {
    const errorMessages = result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ errors: errorMessages });
  }

  const validatedData = result.data;

  const vehicleExists = await prisma.vehicle.findUnique({
    where: { plateNumber: validatedData.plateNumber }
  });

  if (vehicleExists) {
    return res.status(400).json({ errors: [{ message: 'Vehicle with this plate number already exists' }] });
  }

  const vehicle = await prisma.vehicle.create({
    data: { ...validatedData, userId: req.user.id }
  });

  await prisma.log.create({
    data: {
      userId: req.user.id,
      action: 'CREATE_VEHICLE',
      details: { vehicleId: vehicle.id, plateNumber: vehicle.plateNumber }
    }
  });

  res.status(201).json(vehicle);
});

// @desc    Update vehicle by plate number
// @route   PUT /api/vehicles/plate/:plateNumber
// @access  Private
export const updateVehicle = asyncHandler(async (req, res) => {
  const { plateNumber } = req.params;

  const validatedData = updateVehicleSchema.parse(req.body);

  const vehicle = await prisma.vehicle.findUnique({ where: { plateNumber } });

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this vehicle');
  }

  if (validatedData.plateNumber && validatedData.plateNumber !== plateNumber) {
    const existing = await prisma.vehicle.findUnique({ where: { plateNumber: validatedData.plateNumber } });

    if (existing) {
      res.status(400);
      throw new Error('Vehicle with this plate number already exists');
    }
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: { plateNumber },
    data: validatedData
  });

  await prisma.log.create({
    data: {
      userId: req.user.id,
      action: 'UPDATE_VEHICLE',
      details: { vehicleId: updatedVehicle.id, changes: validatedData }
    }
  });

  res.status(200).json(updatedVehicle);
});

// @desc    Delete vehicle by plate number
// @route   DELETE /api/vehicles/plate/:plateNumber
// @access  Private


export const deleteVehicle = asyncHandler(async (req, res) => {
  const { plateNumber } = req.params;

  console.log('User ID:', req.user.id); // Debug log
  console.log('Requested plateNumber:', plateNumber); // Debug log

  if (!plateNumber) {
    res.status(400);
    throw new Error('Plate number is required');
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { plateNumber },
    include: { bookings: { where: { status: { in: ['PENDING', 'APPROVED'] } } } }
  });

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this vehicle');
  }

  if (vehicle.bookings.length > 0) {
    res.status(400);
    throw new Error('Cannot delete vehicle with active bookings');
  }

  await prisma.vehicle.delete({ where: { plateNumber } });

  await prisma.log.create({
    data: {
      userId: req.user.id,
      action: 'DELETE_VEHICLE',
      details: { vehicleId: vehicle.id, plateNumber: vehicle.plateNumber }
    }
  });

  res.status(200).json({ message: 'Vehicle deleted successfully' });
});

// ... (other functions remain unchanged)
// @desc    Get vehicle by plate number
// @route   GET /api/vehicles/plate/:plateNumber
// @access  Private
export const getVehicleByPlateNumber = asyncHandler(async (req, res) => {
  const plateNumber = req.params.plateNumber.toUpperCase();

  const vehicle = await prisma.vehicle.findFirst({ where: { plateNumber } });

  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  if (vehicle.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to access this vehicle' });
  }

  res.status(200).json(vehicle);
});