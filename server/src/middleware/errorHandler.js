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

  if (!(err instanceof AppError) && !isProductionEnv()) {
    console.error('[ERROR]', err.stack || err.message);
  }

  if (!(err instanceof AppError)) {
    if (isProductionEnv()) {
      if (statusCode === 500) {
        message = 'An unexpected error occurred';
      }
    } else {
      console.error('[ERROR STACK]', err.stack);
    }
  }

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON payload';
  }

  if (err.message && err.message.startsWith('CORS not allowed')) {
    statusCode = 403;
  }

  return errorResponse(res, message, statusCode);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
