import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { loginSchema, registerSchema } from '../utils/validationSchemas.js';
import {
  sendAccountVerificationEmail,
  sendPaswordResetEmail,
} from "../utils/mail.js";
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(validatedData.password, salt);

  // Generate 6-digit secure random number
  const verificationCode = crypto.randomInt(100000, 1000000).toString();
  const verificationExpires = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours

  const user = await prisma.user.create({
    data: {
      ...validatedData,
      password: hashedPassword,
      verificationCode,
      verificationExpires,
    },
  });

  await sendAccountVerificationEmail(user.email, user.name, verificationCode);

  res.status(201).json({ message: "Verification email sent. Please verify to continue." });
});

// @desc    Verify Email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      verificationCode: code,
      verificationExpires: { gte: new Date() }
    }
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification code");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationStatus: "VERIFIED",
      verificationCode: null,
      verificationExpires: null,
    }
  });

  res.status(200).json({ message: "Email verified successfully" });
});

// @desc    Initiate Email Verification Again
// @route   PUT /api/auth/initiate-email-verification
// @access  Public
export const initiateEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.verificationStatus === "VERIFIED") {
    res.status(400);
    throw new Error("Email already verified");
  }

  const verificationCode = crypto.randomInt(100000, 1000000).toString();
  const verificationExpires = new Date(Date.now() + 6 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationCode,
      verificationExpires,
    }
  });

  await sendAccountVerificationEmail(user.email, user.name, verificationCode);
  res.status(200).json({ message: "Verification email resent" });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (!user || user.verificationStatus !== "VERIFIED") {
    res.status(401);
    throw new Error("Invalid credentials or email not verified");
  }

  const isMatch = await bcrypt.compare(validatedData.password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Initiate password reset
// @route   PUT /api/auth/initiate-reset-password
// @access  Public
export const initiateResetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Generate 6-digit password reset code
  const resetCode = crypto.randomInt(100000, 1000000).toString();
  const resetExpires = new Date(Date.now() + 6 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetCode: resetCode,
      passwordResetExpires: resetExpires,
    }
  });

  await sendPaswordResetEmail(user.email, user.name, resetCode);
  res.status(200).json({ message: "Password reset email sent" });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public

export const resetPassword = asyncHandler(async (req, res) => {
  const { code, password } = req.body;  // <-- Expect 'password' from frontend

  const user = await prisma.user.findFirst({
    where: {
      passwordResetCode: code,
      passwordResetExpires: { gte: new Date() },
    },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset code");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);  // <-- Hash password here

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetExpires: null,
    },
  });

  res.status(200).json({ message: "Password reset successfully" });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      plateNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});
