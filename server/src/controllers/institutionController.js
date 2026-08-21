const { query } = require('../config/db');
const { successResponse, AppError } = require('../utils/response');

const ALLOWED_INSTITUTION_UPDATE_FIELDS = [
  'name',
  'organization_type',
  'description',
  'district_id',
  'address',
  'contact_email',
  'contact_phone',
];

const sanitizeInstitutionUpdate = (payload = {}) => {
  const entries = Object.entries(payload || {});
  const invalidKeys = entries
    .map(([key]) => key)
    .filter((key) => !ALLOWED_INSTITUTION_UPDATE_FIELDS.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError('Only permitted institution profile fields may be updated', 422);
  }

  const nextData = {};
  for (const [key, value] of entries) {
    if (value !== undefined && value !== null) {
      nextData[key] = typeof value === 'string' ? value.trim() : value;
    }
  }

  if (Object.keys(nextData).length === 0) {
    throw new AppError('No valid institution fields supplied for update', 422);
  }

  return nextData;
};

/**
 * Get current user's institution profile
 */
const getMyInstitution = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT i.*, d.name as district_name 
       FROM institutions i
       LEFT JOIN districts d ON i.district_id = d.id
       WHERE i.created_by_user_id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return successResponse(res, 'No institution found for this user', null);
    }

    return successResponse(res, 'Institution profile retrieved', rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new institution profile
 */
const createInstitution = async (req, res, next) => {
  try {
    const { 
      name, 
      organization_type, 
      description, 
      district_id, 
      address, 
      contact_email, 
      contact_phone 
    } = req.body;

    if (!name || !organization_type) {
      throw new AppError('Institution name and organization type are required', 400);
    }

    // Check if user already has an institution
    const { rows: existing } = await query(
      'SELECT id FROM institutions WHERE created_by_user_id = $1',
      [req.user.id]
    );

    if (existing.length > 0) {
      throw new AppError('User already has an institution profile. Use UPDATE instead.', 400);
    }

    const { rows } = await query(
      `INSERT INTO institutions (
        name, organization_type, description, district_id, 
        address, contact_email, contact_phone, created_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [name, organization_type, description, district_id, address, contact_email, contact_phone, req.user.id]
    );

    return successResponse(res, 'Institution profile created successfully', rows[0], 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user's institution profile
 */
const updateMyInstitution = async (req, res, next) => {
  try {
    const updates = sanitizeInstitutionUpdate(req.body);
    const fields = Object.keys(updates);
    const values = fields.map((field) => updates[field]);
    const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
    values.push(req.user.id);

    const { rows } = await query(
      `UPDATE institutions 
       SET ${assignments.join(', ')},
           updated_at = NOW()
       WHERE created_by_user_id = $${values.length}
       RETURNING *`,
      values
    );

    if (rows.length === 0) {
      throw new AppError('Institution profile not found', 404);
    }

    return successResponse(res, 'Institution profile updated successfully', rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInstitution,
  createInstitution,
  updateMyInstitution,
};
