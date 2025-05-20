import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import { z } from 'zod';

// Validation schema for log search
const logSearchSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  action: z.string().optional(),
  userId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'action']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// @desc    Get logs (admin only)
// @route   GET /api/logs
// @access  Private (Admin)
export const getLogs = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to access logs');
  }

  const { page, limit, action, userId, sortBy, sortOrder } = logSearchSchema.parse(req.query);

  const skip = (page - 1) * limit;
  const where = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;

  const totalCount = await prisma.log.count({ where });

  const logs = await prisma.log.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip,
    take: limit,
  });

  res.status(200).json({
    logs,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  });
});