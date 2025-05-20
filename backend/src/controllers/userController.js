import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { generateUserPDF } from '../utils/pdfGenerator.js';
import { registerSchema } from '../utils/validationSchemas.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      // plateNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Validate request data
  const { name, email, password } = req.body;
  
  // Prepare update data
  const updateData = {};
  
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  // if (plateNumber) updateData.plateNumber = plateNumber;
  
  // Hash password if provided
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }
  
  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      // plateNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  res.status(200).json(updatedUser);
});

// @desc    Get user booking history
// @route   GET /api/users/bookings
// @access  Private
export const getUserBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where = { userId: req.user.id };
  if (status) where.status = status;
  
  // Get total count
  const totalCount = await prisma.booking.count({ where });
  
  // Get bookings
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      parkingSlot: true,
      payment: {
        include: {
          plan: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: parseInt(limit)
  });
  
  res.status(200).json({
    bookings,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalCount / limit),
    totalCount
  });
});

// @desc    Download user profile as PDF
// @route   GET /api/users/profile/pdf
// @access  Private
export const downloadUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      // plateNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Get user bookings
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: {
      parkingSlot: true,
      payment: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // Generate PDF
  generateUserPDF(user, bookings, res);
});