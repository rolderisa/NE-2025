import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';

export const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Or from cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token, deny access
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token payload:', decoded); // Debug: Log decoded payload

    // Get the user from DB (only valid fields)
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    console.log('Authenticated user:', req.user); // Debug: Log authenticated user
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};