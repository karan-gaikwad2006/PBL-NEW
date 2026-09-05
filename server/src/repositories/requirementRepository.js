const { getPool, query } = require('../config/db');

const DISTRICT_ALIASES = {
  ahmednagar: 'ahilyanagar',
  ahmadnagar: 'ahilyanagar',
  aurangabad: 'chhatrapati sambhajinagar',
  osmanabad: 'dharashiv',
  beed: 'beed',
  bid: 'beed',
  buldana: 'buldhana',
  gondiya: 'gondia',
  raigarh: 'raigad',
  mumbai: 'mumbai city',
};

function normalizeDistrictName(name) {
  const normalized = String(name || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  return DISTRICT_ALIASES[normalized] || normalized;
}

function mapItem(item) {
  return {
    id: item.id,
    name: item.item_name,
    category: item.category,
    quantityRequired: Number(item.quantity_required),
    quantityRemaining: Number(item.quantity_remaining),
    unit: item.unit,
  };
}

function mapRequirement(row) {
  return {
    id: row.id,
    title: row.title || `Food support for ${row.beneficiary_count} beneficiaries`,
    district: row.district,
    city: row.taluka,
    address: row.address,
    beneficiaryCount: row.beneficiary_count,
    beneficiaryDescription: row.beneficiary_description,
    urgency: row.urgency,
    status: row.status,
    description: row.description,
    expiresAt: row.expires_at,
    submittedAt: row.submitted_at,
    institutionName: row.institution_name || row.beneficiary_description || 'Local Institution',
    institutionType: row.institution_type || 'Ashram Shala',
    items: Array.isArray(row.items) ? row.items.filter(Boolean).map(mapItem) : [],
  };
}

const requirementSelect = `
  SELECT r.id, d.name AS district, r.taluka, r.address,
         r.beneficiary_count, r.beneficiary_description, r.urgency,
         r.status, r.description, r.expires_at, r.submitted_at,
         i.name AS institution_name, i.organization_type AS institution_type,
         json_agg(json_build_object(
           'id', ri.id, 'item_name', ri.item_name, 'category', ri.category,
           'quantity_required', ri.quantity_required,
           'quantity_remaining', ri.quantity_remaining, 'unit', ri.unit
         ) ORDER BY ri.created_at) AS items
  FROM requirements r
  JOIN districts d ON d.id = r.district_id
  LEFT JOIN institutions i ON i.id = r.institution_id
  LEFT JOIN requirement_items ri ON ri.requirement_id = r.id
`;

async function findDistrictId(name) {
  const { rows } = await query(
    `SELECT id FROM districts WHERE lower(name) = $1 OR lower(slug) = $1 LIMIT 1`,
    [normalizeDistrictName(name)]
  );
  return rows[0]?.id || null;
}

async function findDuplicateRequirement(userId, districtId, itemNames = []) {
  if (!itemNames || itemNames.length === 0) return null;
  const { rows } = await query(
    `SELECT r.id, r.status, r.submitted_at, r.beneficiary_count, ri.item_name
     FROM requirements r
     JOIN requirement_items ri ON ri.requirement_id = r.id
     WHERE r.requester_user_id = $1
       AND r.district_id = $2
       AND r.status IN ('under_review', 'active', 'partially_supported')
       AND r.expires_at > NOW()
       AND lower(ri.item_name) = ANY($3)
     LIMIT 1`,
    [userId, districtId, itemNames.map((n) => String(n).trim().toLowerCase())]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    ...row,
    title: `Food support for ${row.beneficiary_count} beneficiaries`
  };
}

async function countRecentRequirements(userId, hours = 24) {
  const { rows } = await query(
    `SELECT COUNT(*) AS count
     FROM requirements
     WHERE requester_user_id = $1
       AND submitted_at > (NOW() - ($2 || ' hours')::INTERVAL)`,
    [userId, String(hours)]
  );
  return parseInt(rows[0]?.count || 0, 10);
}

async function create(userId, payload, expiresAt) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const districtResult = await client.query(
      `SELECT id FROM districts WHERE lower(name) = $1 OR lower(slug) = $1 LIMIT 1`,
      [normalizeDistrictName(payload.district)]
    );
    const districtId = districtResult.rows[0]?.id;
    if (!districtId) {
      const error = new Error('District not found');
      error.statusCode = 422;
      throw error;
    }

    const requirementResult = await client.query(
      `INSERT INTO requirements
       (requester_user_id, district_id, taluka, address, beneficiary_count,
        beneficiary_description, urgency, status, expires_at, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'under_review', $8, $9)
       RETURNING id`,
      [userId, districtId, payload.taluka, payload.address, payload.beneficiary_count,
        payload.beneficiary_description, payload.urgency, expiresAt, payload.description]
    );
    const requirementId = requirementResult.rows[0].id;
    for (const item of payload.items) {
      await client.query(
        `INSERT INTO requirement_items
         (requirement_id, item_name, quantity_required, quantity_remaining, unit)
         VALUES ($1, $2, $3, $3, $4)`,
        [requirementId, item.name, item.quantity, item.unit]
      );
    }
    await client.query('COMMIT');

    // Asynchronous safety & fraud controls
    // 1. Audit Log
    try {
      const { logAudit } = require('../utils/auditLogger');
      await logAudit({
        userId,
        action: 'requirement_created',
        entityType: 'requirement',
        entityId: requirementId,
        details: { district: payload.district, beneficiaryCount: payload.beneficiary_count, itemsCount: payload.items?.length },
      });
    } catch (e) {
      console.error('[Safety] Audit logging failed', e.message);
    }

    // 2. High-quantity / high-beneficiary fraud signal
    try {
      const beneficiaryCount = Number(payload.beneficiary_count || 0);
      const hasLargeQuantity = payload.items?.some((itm) => Number(itm.quantity) > 10000);
      if (beneficiaryCount > 5000 || hasLargeQuantity) {
        const fraudSignalRepo = require('./fraudSignalRepository');
        await fraudSignalRepo.createFraudSignal({
          entityType: 'requirement',
          entityId: requirementId,
          signalType: beneficiaryCount > 5000 ? 'high_beneficiary_count' : 'high_quantity',
          severity: beneficiaryCount > 10000 ? 'high' : 'medium',
          description: `Requirement submitted with ${beneficiaryCount} beneficiaries and large item quantities. Manual verification suggested.`,
        });
      }
    } catch (e) {
      console.error('[Safety] Fraud signal creation failed', e.message);
    }

    // 3. Notification for requester
    try {
      const notificationRepository = require('./notificationRepository');
      await notificationRepository.createNotification(userId, {
        type: 'requirement_submitted',
        title: 'Requirement Submitted',
        message: `Your requirement has been submitted and is under review.`,
        relatedEntityType: 'requirement',
        relatedEntityId: requirementId,
      });
    } catch (e) {
      console.error('Failed to create notification for requirement submission', e);
    }

    return findById(requirementId, false);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}


/** Public catalog — only active/partially_supported, non-expired */
async function findAll({ district, limit = 50, offset = 0 } = {}) {
  const values = [];
  const conditions = ["r.status IN ('active', 'partially_supported')", 'r.expires_at > NOW()'];
  if (district) {
    values.push(normalizeDistrictName(district));
    conditions.push(`(lower(d.name) = $${values.length} OR lower(d.slug) = $${values.length})`);
  }
  values.push(Math.min(Math.max(Number(limit) || 50, 1), 100));
  const limitIndex = values.length;
  values.push(Math.max(Number(offset) || 0, 0));
  const offsetIndex = values.length;
  const { rows } = await query(
    `${requirementSelect}
     WHERE ${conditions.join(' AND ')}
     GROUP BY r.id, d.name, i.id, i.name, i.organization_type
     ORDER BY r.submitted_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );
  return rows.map(mapRequirement);
}

/** Public single requirement — only active/partially_supported, non-expired */
async function findById(id, publicOnly = true) {
  const conditions = ['r.id = $1'];
  if (publicOnly) conditions.push("r.status IN ('active', 'partially_supported')", 'r.expires_at > NOW()');
  const { rows } = await query(
    `${requirementSelect}
     WHERE ${conditions.join(' AND ')}
     GROUP BY r.id, d.name, i.id, i.name, i.organization_type
     LIMIT 1`,
    [id]
  );
  return rows[0] ? mapRequirement(rows[0]) : null;
}

/** Owner/admin single requirement — no status/expiry filter */
async function findByIdUnrestricted(id) {
  const { rows } = await query(
    `${requirementSelect}
     WHERE r.id = $1
     GROUP BY r.id, d.name, i.id, i.name, i.organization_type
     LIMIT 1`,
    [id]
  );
  return rows[0] ? mapRequirement(rows[0]) : null;
}

/** Requester's own requirements — all statuses */
async function findByUserId(userId, { limit = 50, offset = 0 } = {}) {
  const values = [userId];
  values.push(Math.min(Math.max(Number(limit) || 50, 1), 100));
  const limitIndex = values.length;
  values.push(Math.max(Number(offset) || 0, 0));
  const offsetIndex = values.length;
  const { rows } = await query(
    `${requirementSelect}
     WHERE r.requester_user_id = $1
     GROUP BY r.id, d.name, i.id, i.name, i.organization_type
     ORDER BY r.submitted_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );
  return rows.map(mapRequirement);
}

/**
 * Admin: all requirements with optional status filter, with requester info
 * Returns lightweight list for admin dashboard
 */
async function findAllForAdmin({ status, limit = 100, offset = 0 } = {}) {
  const values = [];
  const conditions = [];
  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(Math.min(Math.max(Number(limit) || 100, 1), 200));
  const limitIndex = values.length;
  values.push(Math.max(Number(offset) || 0, 0));
  const offsetIndex = values.length;

  const { rows } = await query(
    `SELECT r.id, d.name AS district, r.taluka, r.beneficiary_count,
            r.urgency, r.status, r.submitted_at, r.expires_at,
            u.full_name AS requester_name, u.email AS requester_email
     FROM requirements r
     JOIN districts d ON d.id = r.district_id
     JOIN users u ON u.id = r.requester_user_id
     ${whereClause}
     ORDER BY r.submitted_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );
  return rows.map((row) => ({
    id: row.id,
    title: `Food support for ${row.beneficiary_count} beneficiaries`,
    district: row.district,
    city: row.taluka,
    urgency: row.urgency,
    status: row.status,
    submittedAt: row.submitted_at,
    expiresAt: row.expires_at,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    beneficiaryCount: row.beneficiary_count,
  }));
}

/**
 * Admin: get single requirement with requester info (no status filter)
 */
async function findByIdForAdmin(id) {
  const { rows: reqRows } = await query(
    `${requirementSelect}
     WHERE r.id = $1
     GROUP BY r.id, d.name, i.id, i.name, i.organization_type
     LIMIT 1`,
    [id]
  );
  if (!reqRows[0]) return null;
  const req = mapRequirement(reqRows[0]);

  // Attach requester info
  const { rows: userRows } = await query(
    `SELECT u.full_name, u.email, r.taluka, r.address, r.contact_name, r.contact_phone
     FROM requirements r
     JOIN users u ON u.id = r.requester_user_id
     WHERE r.id = $1`,
    [id]
  );
  if (userRows[0]) {
    req.requesterName = userRows[0].full_name;
    req.requesterEmail = userRows[0].email;
    req.contactName = userRows[0].contact_name;
    req.contactPhone = userRows[0].contact_phone;
  }
  return req;
}

/**
 * Update requirement status — admin only (called from service layer)
 * Allowed transitions enforced in service.
 */
async function updateStatus(id, newStatus) {
  const { rows } = await query(
    `UPDATE requirements SET status = $1 WHERE id = $2 RETURNING id, status, requester_user_id, beneficiary_count`,
    [newStatus, id]
  );
  const updated = rows[0] || null;
  if (updated && (newStatus === 'active' || newStatus === 'rejected')) {
    try {
      const notificationRepository = require('./notificationRepository');
      const isApproved = newStatus === 'active';
      await notificationRepository.createNotification(updated.requester_user_id, {
        type: isApproved ? 'requirement_approved' : 'requirement_rejected',
        title: isApproved ? 'Requirement Approved' : 'Requirement Rejected',
        message: isApproved
          ? `Your requirement for ${updated.beneficiary_count} beneficiaries has been approved and is now active.`
          : `Your requirement for ${updated.beneficiary_count} beneficiaries was not approved.`,
        relatedEntityType: 'requirement',
        relatedEntityId: updated.id,
      });
    } catch (e) {
      console.error('Failed to create notification for status update', e);
    }
  }
  return updated;
}


/**
 * Check if a requirement belongs to a user
 */
async function isOwner(requirementId, userId) {
  const { rows } = await query(
    `SELECT 1 FROM requirements WHERE id = $1 AND requester_user_id = $2 LIMIT 1`,
    [requirementId, userId]
  );
  return rows.length > 0;
}

module.exports = {
  findAll,
  findById,
  findByIdUnrestricted,
  findByUserId,
  findAllForAdmin,
  findByIdForAdmin,
  updateStatus,
  isOwner,
  create,
  findDistrictId,
  findDuplicateRequirement,
  countRecentRequirements,
};
