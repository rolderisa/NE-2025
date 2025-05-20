import { schedule } from 'node-cron';
import { prisma } from './src/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Cron Email Config:', {
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASSWORD ? '****' : undefined,
});

// Schedule a job to run every 15 minutes
schedule('*/15 * * * *', async () => {
  console.log('Running cron job to mark expired bookings as COMPLETED at', new Date().toLocaleString('en-US', { timeZone: 'Africa/Harare' }));
  try {
    const updatedCount = await prisma.booking.updateMany({
      where: {
        status: 'APPROVED',
        endTime: {
          lt: new Date()
        }
      },
      data: {
        status: 'COMPLETED'
      }
    });
    console.log(`Marked ${updatedCount.count} expired bookings as COMPLETED`);
  } catch (error) {
    console.error('Error in cron job marking expired bookings:', error);
  }
});

console.log('Cron job for marking expired bookings scheduled');

// Start the server
import './src/index.js';