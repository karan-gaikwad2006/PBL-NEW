function successResponse(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message: message || 'Success',
    data: data || {},
  });
}

function errorResponse(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message: message || 'An unexpected error occurred',
  });
}

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  successResponse,
  errorResponse,
  AppError,
};
