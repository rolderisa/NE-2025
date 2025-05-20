import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import crypto from 'crypto';

/**
 * @swagger
 * /vehicle-entries:
 *   post:
 *     summary: Register a new vehicle entry
 *     tags: [VehicleEntries]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plateNumber]
 *             properties:
 *               plateNumber:
 *                 type: string
 *                 description: Vehicle plate number
 *     responses:
 *       201:
 *         description: Vehicle entry registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 plateNumber: { type: string }
 *                 parkingCode: { type: string }
 *                 entryDateTime: { type: string, format: date-time }
 *                 exitDateTime: { type: string, format: date-time, nullable: true }
 *                 chargedAmount: { type: number }
 *                 vehicleId: { type: string }
 *                 userId: { type: string }
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vehicle not found
 */
export const registerVehicleEntry = asyncHandler(async (req, res) => {
  const { plateNumber } = req.body;

  if (!plateNumber) {
    res.status(400);
    throw new Error('Plate number is required');
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { plateNumber },
    include: { user: true },
  });

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const parkingCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const entry = await prisma.vehicleEntry.create({
    data: {
      plateNumber,
      parkingCode,
      vehicleId: vehicle.id,
      userId: vehicle.userId,
    },
  });

  await prisma.log.create({
    data: {
      action: 'VEHICLE_ENTRY_REGISTERED',
      details: { entryId: entry.id, plateNumber, parkingCode },
      userId: req.user.id,
    },
  });

  res.status(201).json(entry);
});

/**
 * @swagger
 * /vehicle-entries/{id}/exit:
 *   put:
 *     summary: Update vehicle exit and calculate charged amount
 *     tags: [VehicleEntries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle entry ID
 *     responses:
 *       200:
 *         description: Vehicle exit updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 plateNumber: { type: string }
 *                 parkingCode: { type: string }
 *                 entryDateTime: { type: string, format: date-time }
 *                 exitDateTime: { type: string, format: date-time }
 *                 chargedAmount: { type: number }
 *                 vehicleId: { type: string }
 *                 userId: { type: string }
 *       400:
 *         description: Vehicle already exited
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry not found
 */
export const updateVehicleExit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entry = await prisma.vehicleEntry.findUnique({
    where: { id },
  });

  if (!entry) {
    res.status(404);
    throw new Error('Vehicle entry not found');
  }

  if (entry.exitDateTime) {
    res.status(400);
    throw new Error('Vehicle already exited');
  }

  const exitDateTime = new Date();
  const entryDateTime = new Date(entry.entryDateTime);
  const durationHours = (exitDateTime - entryDateTime) / (1000 * 60 * 60);
  const chargedAmount = Math.max(2000, Math.ceil(durationHours) * 2000);

  const updatedEntry = await prisma.vehicleEntry.update({
    where: { id },
    data: {
      exitDateTime,
      chargedAmount,
    },
  });

  await prisma.log.create({
    data: {
      action: 'VEHICLE_EXIT_UPDATED',
      details: { entryId: id, plateNumber: entry.plateNumber, chargedAmount },
      userId: req.user.id,
    },
  });

  res.status(200).json(updatedEntry);
});