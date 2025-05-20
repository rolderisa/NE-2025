import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import { bookingSearchSchema, userSearchSchema } from '../utils/validationSchemas.js';
import { generateCSVReport } from '../utils/pdfGenerator.js';
import { sendBookingStatusEmail } from '../utils/mail.js';


// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total users count
  const totalUsers = await prisma.user.count({
    where: { role: 'USER' }
  });
  
  // Get total slots count
  const totalSlots = await prisma.parkingSlot.count();
  
  // Get available slots count
  const availableSlots = await prisma.parkingSlot.count({
    where: { isAvailable: true }
  });
  
  // Get active bookings count (PENDING + APPROVED)
  const activeBookings = await prisma.booking.count({
    where: {
      status: {
        in: ['PENDING', 'APPROVED']
      }
    }
  });
  
  // Get revenue from PAID bookings
  const revenue = await prisma.payment.aggregate({
    where: {
      status: 'PAID'
    },
    _sum: {
      amount: true
    }
  });
  
  // Get recent bookings
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          plateNumber: true
        }
      },
      parkingSlot: true
    }
  });
  
  // Get booking status counts
  const bookingStatusCounts = await prisma.$transaction([
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'APPROVED' } }),
    prisma.booking.count({ where: { status: 'REJECTED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'EXPIRED' } })
  ]);
  
  // Get VIP vs Regular slot distribution
  const slotTypeCounts = await prisma.$transaction([
    prisma.parkingSlot.count({ where: { type: 'VIP' } }),
    prisma.parkingSlot.count({ where: { type: 'REGULAR' } })
  ]);
  
  res.status(200).json({
    totalUsers,
    totalSlots,
    availableSlots,
    activeBookings,
    revenue: revenue._sum.amount || 0,
    recentBookings,
    bookingStatusCounts: {
      PENDING: bookingStatusCounts[0],
      APPROVED: bookingStatusCounts[1],
      REJECTED: bookingStatusCounts[2],
      CANCELLED: bookingStatusCounts[3],
      COMPLETED: bookingStatusCounts[4],
      EXPIRED: bookingStatusCounts[5]
    },
    slotTypeCounts: {
      VIP: slotTypeCounts[0],
      REGULAR: slotTypeCounts[1]
    }
  });
});

// @desc    Get all users with search and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  // Validate query parameters
  const { page, limit, name, email, plateNumber, role } = userSearchSchema.parse(req.query);
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (plateNumber) where.plateNumber = { contains: plateNumber, mode: 'insensitive' };
  if (role) where.role = role;
  
  // Get total count
  const totalCount = await prisma.user.count({ where });
  
  // Get users
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      plateNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          bookings: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: limit
  });
  
  res.status(200).json({
    users,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount
  });
});

// @desc    Get all bookings with search and pagination
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getBookings = asyncHandler(async (req, res) => {
  // Validate query parameters
  const { page, limit, status, userId, slotId, isPaid } = bookingSearchSchema.parse(req.query);
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (slotId) where.slotId = slotId;
  if (isPaid !== undefined) where.isPaid = isPaid;
  
  // Get total count
  const totalCount = await prisma.booking.count({ where });
  
  // Get bookings
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      parkingSlot: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          plateNumber: true
        }
      },
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
    take: limit
  });
  
  res.status(200).json({
    bookings,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount
  });
});

// @desc    Export users as CSV
// @route   GET /api/admin/users/export
// @access  Private/Admin
export const exportUsers = asyncHandler(async (req, res) => {
  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      plateNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          bookings: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // Define fields for CSV
  const fields = [
    { header: 'ID', value: user => user.id },
    { header: 'Name', value: user => user.name },
    { header: 'Email', value: user => user.email },
    { header: 'Plate Number', value: user => user.plateNumber },
    { header: 'Role', value: user => user.role },
    { header: 'Total Bookings', value: user => user._count.bookings },
    { header: 'Created At', value: user => new Date(user.createdAt).toLocaleString() }
  ];
  
  // Generate and send CSV
  generateCSVReport(users, fields, res, 'users-export.csv');
});

// @desc    Export bookings as CSV
// @route   GET /api/admin/bookings/export
// @access  Private/Admin
export const exportBookings = asyncHandler(async (req, res) => {
  // Get all bookings
  const bookings = await prisma.booking.findMany({
    include: {
      parkingSlot: true,
      user: {
        select: {
          name: true,
          email: true,
          plateNumber: true
        }
      },
      payment: {
        include: {
          plan: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // Define fields for CSV
  const fields = [
    { header: 'ID', value: booking => booking.id },
    { header: 'User', value: booking => booking.user.name },
    { header: 'Email', value: booking => booking.user.email },
    { header: 'Plate Number', value: booking => booking.user.plateNumber },
    { header: 'Slot Number', value: booking => booking.parkingSlot.slotNumber },
    { header: 'Slot Type', value: booking => booking.parkingSlot.type },
    { header: 'Status', value: booking => booking.status },
    { header: 'Start Time', value: booking => new Date(booking.startTime).toLocaleString() },
    { header: 'End Time', value: booking => new Date(booking.endTime).toLocaleString() },
    { header: 'Payment Status', value: booking => booking.payment ? booking.payment.status : 'N/A' },
    { header: 'Payment Amount', value: booking => booking.payment ? `$${booking.payment.amount.toFixed(2)}` : 'N/A' },
    { header: 'Payment Plan', value: booking => booking.payment ? booking.payment.plan.name : 'N/A' },
    { header: 'Created At', value: booking => new Date(booking.createdAt).toLocaleString() }
  ];
  
  // Generate and send CSV
  generateCSVReport(bookings, fields, res, 'bookings-export.csv');
});

// @desc    Approve or reject a booking
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400);
    throw new Error('Please provide a valid status (APPROVED or REJECTED)');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { user: true },
  });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.status !== 'PENDING') {
    res.status(400);
    throw new Error('Only pending bookings can be approved or rejected');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status },
    include: {
      parkingSlot: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          plateNumber: true,
        },
      },
      payment: {
        include: {
          plan: true,
        },
      },
    },
  });

  const { email, name } = updatedBooking.user;

  if (email) {
    const emailResult = await sendBookingStatusEmail(email, name, status);
    if (!emailResult.status) {
      console.warn('Booking status email failed to send:', emailResult.message);
    }
  } else {
    console.warn(`User has no email: ${updatedBooking.user.id}`);
  }

  res.status(200).json(updatedBooking);
});


/**
 * @swagger
 * /admin/users/{userId}/vehicle-entries:
 *   get:
 *     summary: Get vehicle entries for a specific user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of entries per page
 *     responses:
 *       200:
 *         description: List of vehicle entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicleEntries:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/VehicleEntry'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: User not found
 */
export const getUserVehicleEntries = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized, admin access required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [vehicleEntries, totalCount] = await Promise.all([
    prisma.vehicleEntry.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { entryDateTime: 'desc' },
    }),
    prisma.vehicleEntry.count({ where: { userId } }),
  ]);

  res.status(200).json({
    vehicleEntries,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalCount / Number(limit)),
    totalCount,
  });
});


