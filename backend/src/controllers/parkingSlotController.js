import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import { createParkingSlotSchema, slotSearchSchema, updateParkingSlotSchema } from '../utils/validationSchemas.js';

// GET all parking slots with pagination & filters
export const getParkingSlots = asyncHandler(async (req, res) => {
  const { page, limit, type, isAvailable, slotNumber, size, vehicleType, parkingName, location } = slotSearchSchema.parse(req.query);
  const skip = (page - 1) * limit;
  const where = {};
  if (type) where.type = type;
  if (size) where.size = size;
  if (vehicleType) where.vehicleType = vehicleType;
  if (typeof isAvailable === 'string') {
    if (isAvailable === 'true') where.isAvailable = true;
    else if (isAvailable === 'false') where.isAvailable = false;
  }
  if (slotNumber) where.slotNumber = { contains: slotNumber, mode: 'insensitive' };
  if (parkingName) where.parkingName = { contains: parkingName, mode: 'insensitive' };
  if (location) where.location = { contains: location, mode: 'insensitive' };
  const totalCount = await prisma.parkingSlot.count({ where });
  const slots = await prisma.parkingSlot.findMany({
    where,
    orderBy: { slotNumber: 'asc' },
    skip,
    take: limit,
  });
  res.status(200).json({
    slots,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  });
});

// GET parking slot by ID
export const getParkingSlotById = asyncHandler(async (req, res) => {
  const slotId = req.params.id;
  const slot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }
  res.status(200).json(slot);
});

// CREATE parking slot
export const createParkingSlot = asyncHandler(async (req, res) => {
  const validatedData = createParkingSlotSchema.parse(req.body);
  console.log('Validated data:', validatedData);
  const slotExists = await prisma.parkingSlot.findFirst({
    where: { slotNumber: validatedData.slotNumber },
  });
  if (slotExists) {
    res.status(400);
    throw new Error('Parking slot with this number already exists');
  }
  const slot = await prisma.parkingSlot.create({ data: validatedData });
  console.log('Created slot:', slot);
  res.status(201).json(slot);
});

// UPDATE parking slot
export const updateParkingSlot = asyncHandler(async (req, res) => {
  const slotId = req.params.id;
  const validatedData = updateParkingSlotSchema.parse(req.body);
  const slot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }
  if (validatedData.slotNumber && validatedData.slotNumber !== slot.slotNumber) {
    const slotNumberExists = await prisma.parkingSlot.findFirst({
      where: {
        slotNumber: validatedData.slotNumber,
        id: { not: slotId },
      },
    });
    if (slotNumberExists) {
      res.status(400);
      throw new Error('Parking slot with this number already exists');
    }
  }
  if (validatedData.availableSpaces && validatedData.availableSpaces < 0) {
    res.status(400);
    throw new Error('Available spaces cannot be negative');
  }
  if (validatedData.chargePerHour && validatedData.chargePerHour < 0) {
    res.status(400);
    throw new Error('Charge per hour cannot be negative');
  }
  const updatedSlot = await prisma.parkingSlot.update({
    where: { id: slotId },
    data: validatedData,
  });
  res.status(200).json(updatedSlot);
});

// DELETE parking slot
export const deleteParkingSlot = asyncHandler(async (req, res) => {
  const slotId = req.params.id;
  const slot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }
  const bookingsCount = await prisma.booking.count({
    where: {
      slotId,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  });
  if (bookingsCount > 0) {
    res.status(400);
    throw new Error('Cannot delete slot with active bookings');
  }
  await prisma.parkingSlot.delete({ where: { id: slotId } });
  res.status(200).json({ message: 'Parking slot deleted successfully' });
});

// GET available slots for time range
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { startTime, endTime, type, size, vehicleType, parkingName, location } = req.query;
  if (!startTime || !endTime) {
    res.status(400);
    throw new Error('Please provide start and end times');
  }
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400);
    throw new Error('Invalid date format');
  }
  if (start >= end) {
    res.status(400);
    throw new Error('Start time must be before end time');
  }
  const bookedSlotIds = await prisma.booking.findMany({
    where: {
      status: { in: ['PENDING', 'APPROVED'] },
      AND: [
        { startTime: { lt: end } },
        { endTime: { gt: start } },
      ],
    },
    select: { slotId: true },
  });
  const bookedSlotIdsArray = bookedSlotIds.map((b) => b.slotId);
  const where = {
    isAvailable: true,
    availableSpaces: { gte: 1 },
    id: { notIn: bookedSlotIdsArray },
  };
  if (type) where.type = type;
  if (size) where.size = size;
  if (vehicleType) where.vehicleType = vehicleType;
  if (parkingName) where.parkingName = { contains: parkingName, mode: 'insensitive' };
  if (location) where.location = { contains: location, mode: 'insensitive' };
  const availableSlots = await prisma.parkingSlot.findMany({
    where,
    orderBy: { slotNumber: 'asc' },
  });
  res.status(201).json(availableSlots);
});