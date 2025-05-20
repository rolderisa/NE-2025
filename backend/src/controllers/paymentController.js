import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import { createPaymentPlanSchema, updatePaymentPlanSchema } from '../utils/validationSchemas.js';

// @desc    Get payment plans
// @route   GET /api/payments/plans
// @access  Public
export const getPaymentPlans = asyncHandler(async (req, res) => {
  const plans = await prisma.paymentPlan.findMany({
    orderBy: {
      price: 'asc'
    }
  });
  
  res.status(200).json(plans);
});

// @desc    Get payment plan by ID
// @route   GET /api/payments/plans/:id
// @access  Public
export const getPaymentPlanById = asyncHandler(async (req, res) => {
  const plan = await prisma.paymentPlan.findUnique({
    where: { id: req.params.id }
  });
  
  if (!plan) {
    res.status(404);
    throw new Error('Payment plan not found');
  }
  
  res.status(200).json(plan);
});

// @desc    Create payment plan (Admin only)
// @route   POST /api/payments/plans
// @access  Private/Admin
export const createPaymentPlan = asyncHandler(async (req, res) => {
  // Validate request data
  const validatedData = createPaymentPlanSchema.parse(req.body);
  
  // Create plan
  const plan = await prisma.paymentPlan.create({
    data: validatedData
  });
  
  res.status(201).json(plan);
});

// @desc    Update payment plan (Admin only)
// @route   PUT /api/payments/plans/:id
// @access  Private/Admin
export const updatePaymentPlan = asyncHandler(async (req, res) => {
  // Validate request data
  const validatedData = updatePaymentPlanSchema.parse(req.body);
  
  // Check if plan exists
  const plan = await prisma.paymentPlan.findUnique({
    where: { id: req.params.id }
  });
  
  if (!plan) {
    res.status(404);
    throw new Error('Payment plan not found');
  }
  
  // Update plan
  const updatedPlan = await prisma.paymentPlan.update({
    where: { id: req.params.id },
    data: validatedData
  });
  
  res.status(200).json(updatedPlan);
});

// @desc    Delete payment plan (Admin only)
// @route   DELETE /api/payments/plans/:id
// @access  Private/Admin
export const deletePaymentPlan = asyncHandler(async (req, res) => {
  // Check if plan exists
  const plan = await prisma.paymentPlan.findUnique({
    where: { id: req.params.id }
  });
  
  if (!plan) {
    res.status(404);
    throw new Error('Payment plan not found');
  }
  
  // Check if plan is being used in any payments
  const paymentsUsingPlan = await prisma.payment.count({
    where: { planId: req.params.id }
  });
  
  if (paymentsUsingPlan > 0) {
    res.status(400);
    throw new Error('Cannot delete plan that is in use');
  }
  
  // Delete plan
  await prisma.paymentPlan.delete({
    where: { id: req.params.id }
  });
  
  res.status(200).json({ message: 'Payment plan deleted successfully' });
});

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
export const getUserPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * parseInt(limit);
  
  // Build where clause
  const where = { userId: req.user.id };
  if (status) where.status = status;
  
  // Get total count
  const totalCount = await prisma.payment.count({ where });
  
  // Get payments
  const payments = await prisma.payment.findMany({
    where,
    include: {
      booking: true,
      plan: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: parseInt(limit)
  });
  
  res.status(200).json({
    payments,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalCount / parseInt(limit)),
    totalCount
  });
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: {
      booking: true,
      plan: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          plateNumber: true
        }
      }
    }
  });
  
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  
  // Check if user owns the payment or is admin
  if (payment.userId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to access this payment');
  }
  
  res.status(200).json(payment);
});

// @desc    Update payment (admin only)
// @route   PUT /api/payments/:id
// @access  Private/Admin
export const updatePayment = asyncHandler(async (req, res) => {
  // Validate request data
  const validatedData = updatePaymentSchema.parse(req.body);
  
  // Check if payment exists
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: {
      booking: true
    }
  });
  
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  
  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { id: req.params.id },
    data: validatedData,
    include: {
      booking: true,
      plan: true
    }
  });
  
  // If payment is marked as PAID, update booking isPaid status
  if (validatedData.status === 'PAID' && payment.booking) {
    await prisma.booking.update({
      where: { id: payment.booking.id },
      data: { isPaid: true }
    });
  }
  
  // If payment is REFUNDED/FAILED, update booking isPaid status to false
  if ((validatedData.status === 'REFUNDED' || validatedData.status === 'FAILED') && payment.booking) {
    await prisma.booking.update({
      where: { id: payment.booking.id },
      data: { isPaid: false }
    });
  }
  
  res.status(200).json(updatedPayment);
});