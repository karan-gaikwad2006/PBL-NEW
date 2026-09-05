const { query } = require('../config/db');

/**
 * Record a fraud signal for admin review.
 */
async function createFraudSignal({
  entityType,
  entityId,
  signalType,
  severity = 'medium',
  description = null,
}) {
  try {
    const { rows } = await query(
      `INSERT INTO fraud_signals
       (entity_type, entity_id, signal_type, severity, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [entityType, entityId, signalType, severity, description]
    );
    return rows[0];
  } catch (err) {
    console.error('[FraudSignalRepo] Failed to create fraud signal:', err.message);
    return null;
  }
}

/**
 * Find all fraud signals for admin dashboard.
 */
async function findAll({ status = null, limit = 50, offset = 0 } = {}) {
  const values = [];
  const conditions = [];

  if (status) {
    values.push(status);
    conditions.push(`fs.status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(Math.min(Math.max(Number(limit) || 50, 1), 100));
  const limitIndex = values.length;
  values.push(Math.max(Number(offset) || 0, 0));
  const offsetIndex = values.length;

  const { rows } = await query(
    `SELECT fs.id, fs.entity_type, fs.entity_id, fs.signal_type, fs.severity,
            fs.description, fs.status, fs.created_at, fs.resolved_at,
            u.full_name AS reviewed_by_name,
            CASE
              WHEN fs.entity_type = 'requirement' THEN r.title
              WHEN fs.entity_type = 'institution' THEN i.name
              ELSE NULL
            END AS entity_name,
            CASE
              WHEN fs.entity_type = 'requirement' THEN d.name
              WHEN fs.entity_type = 'institution' THEN idist.name
              ELSE NULL
            END AS district
     FROM fraud_signals fs
     LEFT JOIN users u ON u.id = fs.reviewed_by_user_id
     LEFT JOIN requirements r ON fs.entity_type = 'requirement' AND r.id = fs.entity_id
     LEFT JOIN districts d ON d.id = r.district_id
     LEFT JOIN institutions i ON fs.entity_type = 'institution' AND i.id = fs.entity_id
     LEFT JOIN districts idist ON idist.id = i.district_id
     ${whereClause}
     ORDER BY
       CASE fs.severity
         WHEN 'critical' THEN 1
         WHEN 'high' THEN 2
         WHEN 'medium' THEN 3
         WHEN 'low' THEN 4
         ELSE 5
       END,
       fs.created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );

  return rows.map((r) => ({
    id: r.id,
    entityType: r.entity_type,
    entityId: r.entity_id,
    signalType: r.signal_type,
    severity: r.severity,
    description: r.description,
    status: r.status,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
    reviewedByName: r.reviewed_by_name,
    entityName: r.entity_name || `${r.entity_type} ${r.entity_id}`,
    district: r.district || null,
  }));
}

/**
 * Find fraud signals for a specific entity (requirement or institution).
 */
async function findByEntity(entityType, entityId) {
  const { rows } = await query(
    `SELECT fs.id, fs.entity_type, fs.entity_id, fs.signal_type, fs.severity,
            fs.description, fs.status, fs.created_at, fs.resolved_at,
            u.full_name AS reviewed_by_name
     FROM fraud_signals fs
     LEFT JOIN users u ON u.id = fs.reviewed_by_user_id
     WHERE fs.entity_type = $1 AND fs.entity_id = $2
     ORDER BY fs.created_at DESC`,
    [entityType, entityId]
  );
  return rows.map((r) => ({
    id: r.id,
    entityType: r.entity_type,
    entityId: r.entity_id,
    signalType: r.signal_type,
    severity: r.severity,
    description: r.description,
    status: r.status,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
    reviewedByName: r.reviewed_by_name,
  }));
}

/**
 * Resolve or dismiss a fraud signal.
 */
async function updateStatus(id, status, adminUserId) {
  const { rows } = await query(
    `UPDATE fraud_signals
     SET status = $1, resolved_at = CURRENT_TIMESTAMP, reviewed_by_user_id = $2
     WHERE id = $3
     RETURNING *`,
    [status, adminUserId, id]
  );
  return rows[0] || null;
}

module.exports = {
  createFraudSignal,
  findAll,
  findByEntity,
  updateStatus,
};
