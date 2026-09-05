const { errorResponse, AppError } = require('../utils/response');
const { isProductionEnv } = require('../config/env');

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    const err = new AppError(`Route ${req.method} ${req.path} not found`, 404);
    return next(err);
  }
  next();
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';

  // Handle specific PostgreSQL error codes
  if (err.code === '22P02') {
    // Invalid UUID / type syntax
    statusCode = 400;
    message = 'Invalid parameter format or identifier';
  } else if (err.code === '23505') {
    // Unique violation
    statusCode = 409;
    message = 'Resource already exists or duplicate record conflict';
  } else if (err.code === '23503') {
    // Foreign key violation
    statusCode = 400;
    message = 'Referenced resource was not found';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON payload';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload too large (max 1MB)';
  } else if (err.message && err.message.startsWith('CORS not allowed')) {
    statusCode = 403;
  }

  // Sanitize internal errors in production
  if (isProductionEnv() && !(err instanceof AppError) && statusCode === 500) {
    message = 'An unexpected error occurred. Please try again later.';
  } else if (!isProductionEnv() && statusCode >= 500) {
    console.error('[ERROR INTERNAL]', err.stack || err.message);
  }

  return errorResponse(res, message, statusCode);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

