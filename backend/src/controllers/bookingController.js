import asyncHandler from "express-async-handler";
import { prisma } from "../index.js";
import {
  bookingSearchSchema,
  createBookingSchema,
  updateBookingSchema,
} from "../utils/validationSchemas.js";
import { generateBookingPDF } from "../utils/pdfGenerator.js";
import { sendSlotRequestNotificationToAdmin } from "../utils/mail.js";
import nodemailer from "nodemailer";
import { z } from "zod";

// Validation schema for approve booking
const approveBookingSchema = z.object({
  id: z.string().uuid(),
});

// Email transporter setup
console.log("Email Config:", {
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASSWORD,
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  console.log("createBooking req.body:", req.body);
  try {
    const validatedData = createBookingSchema.parse(req.body);
    console.log("createBooking validatedData:", validatedData);

    const { startTime, endTime, slotId, vehicle } = validatedData;

    if (!vehicle || !vehicle.connect || !vehicle.connect.id) {
      res.status(400);
      throw new Error("Vehicle is required with a valid connect.id");
    }

    if (!req.user || !req.user.id) {
      res.status(401);
      throw new Error("User not authenticated");
    }

    if (!slotId) {
      res.status(400);
      throw new Error("Parking slot ID is required");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    const slot = await prisma.parkingSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      res.status(404);
      throw new Error("Parking slot not found");
    }

    if (!slot.isAvailable || slot.availableSpaces < 1) {
      res.status(400);
      throw new Error("Parking slot is not available");
    }

    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        slotId,
        status: {
          in: ["PENDING", "APPROVED"],
        },
        AND: [
          {
            startTime: {
              lt: end,
            },
          },
          {
            endTime: {
              gt: start,
            },
          },
        ],
      },
    });

    if (conflictingBookings) {
      res.status(400);
      throw new Error("This slot is already booked for the selected time");
    }

    const vehicleRecord = await prisma.vehicle.findUnique({
      where: { id: vehicle.connect.id },
    });

    if (!vehicleRecord) {
      res.status(404);
      throw new Error("Vehicle not found");
    }

    if (vehicleRecord.userId !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized to book with this vehicle");
    }

    // Calculate duration and amount using slot's chargePerHour
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60));
    const amount = durationInHours * slot.chargePerHour;

    const booking = await prisma.booking.create({
      data: {
        startTime: start,
        endTime: end,
        expiresAt,
        user: {
          connect: { id: req.user.id },
        },
        parkingSlot: {
          connect: { id: slotId },
        },
        vehicle: {
          connect: { id: vehicle.connect.id },
        },
        payment: {
          create: {
            amount,
            userId: req.user.id,
            status: "PENDING",
          },
        },
      },
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
        payment: true,
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
      },
    });

    // Fetch admin emails
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    const adminEmails = admins.map((admin) => admin.email);
    if (adminEmails.length === 0) {
      console.warn("No admin emails found to notify");
    } else {
      console.log("Notifying admins:", adminEmails);
    }

    // Format slot details for the email
    const slotDetails = {
      slotName: booking.parkingSlot.slotNumber,
      slotType: booking.parkingSlot.type,
      plateNumber: booking.vehicle.plateNumber,
      amount: amount.toLocaleString('en-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }),
    };

    // Notify admin
    try {
      const emailResult = await sendSlotRequestNotificationToAdmin(
        adminEmails,
        booking.user.name,
        slotDetails
      );
      console.log("Admin notification result:", emailResult);
    } catch (error) {
      console.error("Failed to send admin notification:", error);
    }

    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      throw error;
    }
  }
});

// ... (rest of the file remains unchanged)
export const getUserBookings = asyncHandler(async (req, res) => {
  const { page, limit, status } = bookingSearchSchema.parse(req.query);
  const skip = (page - 1) * limit;

  const where = req.user.role === "ADMIN" ? {} : { userId: req.user.id };
  if (status) where.status = status;

  const totalCount = await prisma.booking.count({ where });

  const bookings = await prisma.booking.findMany({
    where,
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
      payment: true,
      vehicle: {
        select: {
          id: true,
          plateNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  res.status(200).json({
    bookings,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
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
      payment: true,
      vehicle: {
        select: {
          id: true,
          plateNumber: true,
        },
      },
    },
  });

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.userId !== req.user.id && req.user.role !== "ADMIN") {
    res.status(403);
    throw new Error("Not authorized to access this booking");
  }

  res.status(200).json(booking);
});

export const updateBooking = asyncHandler(async (req, res) => {
  const validatedData = updateBookingSchema.parse(req.body);

  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      payment: true,
    },
  });

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (req.user.role !== "ADMIN") {
    if (booking.userId !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized to update this booking");
    }

    if (validatedData.status && validatedData.status !== "CANCELLED") {
      res.status(403);
      throw new Error("Users can only cancel bookings");
    }

    if (booking.status !== "PENDING") {
      res.status(400);
      throw new Error("Only pending bookings can be cancelled");
    }
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: req.params.id },
    data: validatedData,
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
      payment: true,
      vehicle: {
        select: {
          id: true,
          plateNumber: true,
        },
      },
    },
  });

  if (
    (updatedBooking.status === "CANCELLED" ||
      updatedBooking.status === "REJECTED") &&
    updatedBooking.payment &&
    updatedBooking.payment.status === "PAID"
  ) {
    await prisma.payment.update({
      where: { id: updatedBooking.payment.id },
      data: { status: "REFUNDED" },
    });
  }

  res.status(200).json(updatedBooking);
});

export const completeBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { parkingSlot: true },
  });

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.userId !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to modify this booking");
  }

  if (booking.status !== "APPROVED") {
    res.status(400);
    throw new Error("Only approved bookings can be marked as completed");
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
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
      payment: true,
      vehicle: {
        select: {
          id: true,
          plateNumber: true,
        },
      },
    },
  });

  res.status(200).json(updatedBooking);
});

export const downloadBookingAsPDF = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
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
      payment: true,
      vehicle: {
        select: {
          id: true,
          plateNumber: true,
        },
      },
    },
  });

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.userId !== req.user.id && req.user.role !== "ADMIN") {
    res.status(403);
    throw new Error("Not authorized to access this booking");
  }

  generateBookingPDF(booking, res);
});

export const completeBookingPayment = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      payment: true,
    },
  });

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.userId !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to pay for this booking");
  }

  if (booking.status !== "APPROVED") {
    res.status(400);
    throw new Error("Can only pay for approved bookings");
  }

  if (booking.isPaid) {
    res.status(400);
    throw new Error("Booking is already paid");
  }

  if (booking.payment) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: "PAID" },
    });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { isPaid: true },
    include: {
      parkingSlot: true,
      payment: true,
      vehicle: {
        select: {
          id: true,
          plateNumber: true,
        },
      },
    },
  });

  res.status(200).json(updatedBooking);
});

export const approveBooking = asyncHandler(async (req, res) => {
  const { id } = req.body;

  try {
    const validatedData = approveBookingSchema.parse({ id });

    if (req.user.role !== "ADMIN") {
      res.status(403);
      throw new Error("Not authorized, admin access required");
    }

    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.id },
      include: {
        user: true,
        vehicle: true,
        parkingSlot: true,
        payment: true,
      },
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    if (booking.status !== "PENDING") {
      res.status(400);
      throw new Error("Booking is not in PENDING status");
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: validatedData.id },
      data: { status: "APPROVED" },
      include: {
        user: true,
        vehicle: true,
        parkingSlot: true,
        payment: true,
      },
    });

    let pdfBuffer;
    try {
      pdfBuffer = await new Promise((resolve, reject) => {
        const output = {
          write: (chunk) => buffers.push(chunk),
          end: (buffer) => resolve(buffer),
          on: (event, fn) => event === "error" && fn(reject),
        };
        const buffers = [];
        try {
          generateBookingPDF(updatedBooking, output);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      res.status(500).json({
        message: "Booking approved, but failed to generate PDF",
        booking: updatedBooking,
      });
      return;
    }

    const start = new Date(updatedBooking.startTime);
    const end = new Date(updatedBooking.endTime);
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60));
    const totalAmount = durationInHours * updatedBooking.parkingSlot.chargePerHour;

    const formattedAmount = totalAmount.toLocaleString('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: updatedBooking.user.email,
      subject: "Your Parking Ticket",
      html: `
        <h2>Your Parking Booking</h2>
        <p>Dear ${updatedBooking.user.name},</p>
        <p>Your booking has been approved. Please find your ticket attached.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Plate Number: ${updatedBooking.vehicle.plateNumber}</li>
          <li>Parking Slot: ${updatedBooking.parkingSlot.slotNumber}</li>
          <li>Start Time: ${start.toLocaleString()}</li>
          <li>End Time: ${end.toLocaleString()}</li>
          <li>Duration: ${durationInHours} hour(s)</li>
          <li>Amount: ${formattedAmount}</li>
        </ul>
        <p>Best regards,<br>Parking Management Team</p>
      `,
      attachments: [
        {
          filename: `ticket-${updatedBooking.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
        logger: true,
        debug: true,
      });

      transporter.verify((error, success) => {
        if (error) {
          console.error("Transporter verification failed:", error);
        } else {
          console.log("Transporter is ready to send emails");
        }
      });
      await transporter.sendMail(mailOptions);
      res.status(200).json({
        message: "Booking approved and ticket sent",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("Failed to send email:", {
        error: error.message,
        code: error.code,
        response: error.response,
        responseCode: error.responseCode,
      });
      res.status(500).json({
        message: "Booking approved, but failed to send email",
        booking: updatedBooking,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      throw error;
    }
  }
}); 