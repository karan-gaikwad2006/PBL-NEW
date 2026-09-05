const { query } = require('../config/db');

/**
 * Asynchronously write an audit log entry.
 * Fails safely without disrupting the calling request.
 */
async function logAudit({ userId = null, action, entityType = null, entityId = null, details = null, ipAddress = null }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        action,
        entityType,
        entityId,
        details ? JSON.stringify(details) : null,
        ipAddress,
      ]
    );
  } catch (err) {
    console.error('[AuditLogger] Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit };
