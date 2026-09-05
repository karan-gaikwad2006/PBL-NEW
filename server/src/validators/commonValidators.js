const { AppError } = require('../utils/response');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate UUID string format.
 */
function isValidUUID(id) {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

/**
 * Require valid UUID or throw 400 Bad Request.
 */
function requireUUID(id, fieldName = 'ID') {
  if (!isValidUUID(id)) {
    throw new AppError(`Invalid ${fieldName} format`, 400);
  }
  return id.trim();
}

/**
 * Middleware to validate :id parameter as a UUID.
 */
function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !isValidUUID(id)) {
      return next(new AppError(`Invalid ${paramName} parameter`, 400));
    }
    next();
  };
}

/**
 * Sanitize and validate pagination query parameters.
 */
function sanitizePagination(query = {}, defaultLimit = 50, maxLimit = 100) {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  return { limit, offset };
}

module.exports = {
  isValidUUID,
  requireUUID,
  validateIdParam,
  sanitizePagination,
};
