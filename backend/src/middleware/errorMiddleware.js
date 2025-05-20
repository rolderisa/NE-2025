export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 400;
        message = 'This record already exists';
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'Record not found';
        break;
      default:
        console.error('Prisma Error:', err);
        break;
    }
  }

  // Handle ZOD validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors;
  }

  console.error(`${statusCode} - ${message}`);

  res.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};