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
    items: Array.isArray(row.items) ? row.items.map(mapItem) : [],
  };
}

const requirementSelect = `
  SELECT r.id, d.name AS district, r.taluka, r.address,
         r.beneficiary_count, r.beneficiary_description, r.urgency,
         r.status, r.description, r.expires_at, r.submitted_at,
         json_agg(json_build_object(
           'id', ri.id, 'item_name', ri.item_name, 'category', ri.category,
           'quantity_required', ri.quantity_required,
           'quantity_remaining', ri.quantity_remaining, 'unit', ri.unit
         ) ORDER BY ri.created_at) AS items
  FROM requirements r
  JOIN districts d ON d.id = r.district_id
  LEFT JOIN requirement_items ri ON ri.requirement_id = r.id
`;

async function findDistrictId(name) {
  const { rows } = await query(
    `SELECT id FROM districts WHERE lower(name) = $1 OR lower(slug) = $1 LIMIT 1`,
    [normalizeDistrictName(name)]
  );
  return rows[0]?.id || null;
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
    return findById(requirementId, false);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findAll({ district, limit = 50, offset = 0 } = {}) {
  const values = [];
  const conditions = ["r.status = 'active'", 'r.expires_at > NOW()'];
  if (district) {
    values.push(district);
    conditions.push(`(lower(d.name) = $${values.length} OR lower(d.slug) = $${values.length})`);
  }
  values.push(Math.min(Math.max(Number(limit) || 50, 1), 100));
  const limitIndex = values.length;
  values.push(Math.max(Number(offset) || 0, 0));
  const offsetIndex = values.length;
  const { rows } = await query(
    `${requirementSelect}
     WHERE ${conditions.join(' AND ')}
     GROUP BY r.id, d.name
     ORDER BY r.submitted_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );
  return rows.map(mapRequirement);
}

async function findById(id, publicOnly = true) {
  const conditions = ['r.id = $1'];
  if (publicOnly) conditions.push("r.status = 'active'", 'r.expires_at > NOW()');
  const { rows } = await query(
    `${requirementSelect}
     WHERE ${conditions.join(' AND ')}
     GROUP BY r.id, d.name
     LIMIT 1`,
    [id]
  );
  return rows[0] ? mapRequirement(rows[0]) : null;
}

module.exports = { findAll, findById, create, findDistrictId };
