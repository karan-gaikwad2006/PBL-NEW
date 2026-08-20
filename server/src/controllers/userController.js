const { query } = require('../config/db');
const { successResponse, AppError } = require('../utils/response');

/**
 * Synchronize Firebase user with PostgreSQL database
 */
const syncUser = async (req, res, next) => {
  try {
    const { uid, email, name, picture } = req.firebaseUser;
    
    // Check if user already exists
    const { rows: existingRows } = await query(
      'SELECT id, firebase_uid, email, full_name, role, status FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (existingRows.length > 0) {
      // Update existing user (optional: update email or name if changed in Firebase)
      // For now, just return the existing user
      return successResponse(res, 'User synchronized', existingRows[0]);
    }

    // New user signup
    // Role must be provided in the request body for the first sync
    // BUT we should validate it's one of the allowed roles
    const { role, fullName } = req.body;
    
    if (!role || !['donor', 'requester', 'institution', 'admin'].includes(role)) {
      throw new AppError('Invalid or missing role for registration', 400);
    }

    // Don't allow anyone to register as admin via public API
    if (role === 'admin') {
      // Check if there are any users in the DB. If not, the first one can be admin.
      // Otherwise, reject.
      const { rows: userCount } = await query('SELECT COUNT(*) FROM users');
      if (parseInt(userCount[0].count) > 0) {
        throw new AppError('Forbidden: Cannot register as admin', 403);
      }
    }

    const nameToUse = fullName || name || email.split('@')[0];

    const { rows: newRows } = await query(
      `INSERT INTO users (firebase_uid, email, full_name, role, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id, firebase_uid, email, full_name, role, status`,
      [uid, email, nameToUse, role]
    );

    return successResponse(res, 'User created and synchronized', newRows[0], 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User profile not found', 404);
    }
    return successResponse(res, 'User profile retrieved', req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncUser,
  getProfile,
};
