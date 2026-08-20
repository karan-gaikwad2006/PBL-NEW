const admin = require('../config/firebaseAdmin');
const { query } = require('../config/db');
const { AppError } = require('../utils/response');

/**
 * Middleware to verify Firebase ID token
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    next(new AppError('Unauthorized: Invalid or expired token', 401));
  }
};

/**
 * Middleware to attach application user from DB to request
 */
const attachUser = async (req, res, next) => {
  try {
    if (!req.firebaseUser) {
      throw new AppError('Internal Server Error: Firebase user not found in request', 500);
    }

    const { uid } = req.firebaseUser;
    const { rows } = await query(
      'SELECT id, firebase_uid, email, full_name, role, status FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (rows.length === 0) {
      // User authenticated in Firebase but not yet in our DB
      // We don't throw error here because they might be hitting the sync endpoint
      req.user = null;
    } else {
      const user = rows[0];
      if (user.status !== 'active') {
        throw new AppError('Forbidden: User account is ' + user.status, 403);
      }
      req.user = user;
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require authentication and DB user record
 */
const requireAuthenticatedUser = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Unauthorized: User profile not found', 401));
  }
  next();
};

/**
 * Middleware to require specific roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: User profile not found', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }

    next();
  };
};

module.exports = {
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
  requireRole,
};
