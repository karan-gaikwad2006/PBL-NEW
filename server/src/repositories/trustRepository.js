const { getPool, query } = require('../config/db');

async function findRequirementOwner(requirementId) {
  const { rows } = await query(
    `SELECT id, requester_user_id, institution_id, visibility_status
     FROM requirements WHERE id = $1`,
    [requirementId]
  );
  return rows[0] || null;
}

async function insertReport(requirementId, reporterId, reason, note) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO requirement_reports (requirement_id, reporter_id, reason, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [requirementId, reporterId, reason, note]
    );
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'requirement_reported', 'requirement', $2, $3::jsonb)`,
      [reporterId, requirementId, JSON.stringify({ reportId: rows[0].id, reason })]
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findReporterIds(requirementId) {
  const { rows } = await query(
    `SELECT DISTINCT reporter_id FROM requirement_reports WHERE requirement_id = $1`,
    [requirementId]
  );
  return rows.map((row) => row.reporter_id);
}

async function reduceVisibility(requirementId, actorId) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: requirementRows } = await client.query(
      `UPDATE requirements
       SET visibility_status = 'reduced'
       WHERE id = $1 AND visibility_status <> 'reduced'
       RETURNING requester_user_id`,
      [requirementId]
    );
    if (!requirementRows[0]) {
      await client.query('COMMIT');
      return false;
    }
    const ownerId = requirementRows[0].requester_user_id;
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'requirement_visibility_reduced', 'requirement', $2, $3::jsonb)`,
      [actorId, requirementId, JSON.stringify({ visibilityStatus: 'reduced' })]
    );
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
       VALUES ($1, 'requirement_visibility_reduced', 'Requirement visibility updated',
         'Your requirement is being shown lower in search while community reports are reviewed.',
         'requirement', $2)`,
      [ownerId, requirementId]
    );
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findOfferForDispute(offerId) {
  const { rows } = await query(
    `SELECT so.id, so.status, so.donor_user_id, so.handoff_at,
            r.requester_user_id, r.institution_id, i.created_by_user_id AS institution_owner_id
     FROM support_offers so
     JOIN requirements r ON r.id = so.requirement_id
     LEFT JOIN institutions i ON i.id = r.institution_id
     WHERE so.id = $1`,
    [offerId]
  );
  return rows[0] || null;
}

async function createDispute(offer, actorId, reason, institutionDelta, donorDelta) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE support_offers SET status = 'disputed'
       WHERE id = $1 AND status = 'handed_off'
       RETURNING id`,
      [offer.id]
    );
    if (!rows[0]) {
      const error = new Error('This offer can no longer be disputed');
      error.statusCode = 409;
      throw error;
    }
    if (offer.institution_owner_id) {
      await client.query(
        `INSERT INTO trust_score_events (user_id, event_type, score_delta, related_id)
         VALUES ($1, 'disputed', $2, $3)`,
        [offer.institution_owner_id, institutionDelta, offer.id]
      );
    }
    await client.query(
      `INSERT INTO trust_score_events (user_id, event_type, score_delta, related_id)
       VALUES ($1, 'disputed', $2, $3)`,
      [offer.donor_user_id, donorDelta, offer.id]
    );
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'offer_disputed', 'offer', $2, $3::jsonb)`,
      [actorId, offer.id, JSON.stringify({ reason })]
    );
    if (offer.institution_owner_id) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
         VALUES ($1, 'offer_disputed', 'A support offer was disputed', $2, 'offer', $3)`,
        [offer.institution_owner_id, 'A donor reported that the handoff was not received.', offer.id]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findConfirmedInstitutionOffer(donorId, institutionId) {
  const { rows } = await query(
    `SELECT so.id
     FROM support_offers so
     JOIN requirements r ON r.id = so.requirement_id
     JOIN support_confirmations sc ON sc.support_offer_id = so.id
     WHERE so.donor_user_id = $1
       AND r.institution_id = $2
       AND so.status = 'completed'
       AND sc.confirmed_by_donor = TRUE
       AND sc.confirmed_by_requester = TRUE
     ORDER BY so.updated_at DESC LIMIT 1`,
    [donorId, institutionId]
  );
  return rows[0]?.id || null;
}

async function createVouch(donorId, institutionId, offerId, delta) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: institutionRows } = await client.query(
      `SELECT created_by_user_id FROM institutions WHERE id = $1`,
      [institutionId]
    );
    if (!institutionRows[0]) {
      const error = new Error('Institution not found');
      error.statusCode = 404;
      throw error;
    }
    const institutionOwnerId = institutionRows[0].created_by_user_id;
    const { rows } = await client.query(
      `INSERT INTO vouches (donor_id, institution_id, offer_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [donorId, institutionId, offerId]
    );
    await client.query(
      `INSERT INTO trust_score_events (user_id, event_type, score_delta, related_id)
       VALUES ($1, 'vouch', 0, $2), ($3, 'vouch_received', $4, $2)`,
      [donorId, offerId, institutionOwnerId, delta]
    );
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'institution_vouched', 'institution', $2, $3::jsonb)`,
      [donorId, institutionId, JSON.stringify({ offerId, vouchId: rows[0].id })]
    );
    if (institutionOwnerId) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
         VALUES ($1, 'vouch_received', 'A donor vouched for your institution',
           'A donor with a confirmed support history vouched for your institution.',
           'institution', $2)`,
        [institutionOwnerId, institutionId]
      );
    }
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function markHandoff(offerId, donorId) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE support_offers
       SET status = 'handed_off', handoff_at = NOW()
       WHERE id = $1 AND donor_user_id = $2 AND status IN ('pending', 'accepted', 'in_progress')
       RETURNING id, handoff_at`,
      [offerId, donorId]
    );
    if (rows[0]) {
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, 'offer_handed_off', 'offer', $2, $3::jsonb)`,
        [donorId, offerId, JSON.stringify({ handoffAt: rows[0].handoff_at })]
      );
    }
    await client.query('COMMIT');
    return rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function extendRequirement(requirementId, userId, extensionDays) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE requirements
       SET expires_at = expires_at + ($3 || ' days')::INTERVAL,
           extended_once = TRUE
       WHERE id = $1 AND requester_user_id = $2
         AND status IN ('active', 'partially_supported')
         AND extended_once = FALSE
       RETURNING id, expires_at`,
      [requirementId, userId, extensionDays]
    );
    if (rows[0]) {
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, 'requirement_extended', 'requirement', $2, $3::jsonb)`,
        [userId, requirementId, JSON.stringify({ expiresAt: rows[0].expires_at, extensionDays })]
      );
    }
    await client.query('COMMIT');
    return rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getAdminReportSummary() {
  const { rows } = await query(
    `SELECT reason, COUNT(*)::int AS count
     FROM requirement_reports GROUP BY reason ORDER BY reason`
  );
  const { rows: requirementRows } = await query(
    `SELECT requirement_id, COUNT(*)::int AS count
     FROM requirement_reports GROUP BY requirement_id ORDER BY count DESC`
  );
  return {
    byReason: rows.map((row) => ({ reason: row.reason, count: row.count })),
    byRequirement: requirementRows.map((row) => ({
      requirementId: row.requirement_id,
      count: row.count,
    })),
  };
}

async function getRequirementReportCountsForInstitution(institutionId) {
  const { rows } = await query(
    `SELECT rr.reason, COUNT(*)::int AS count
     FROM requirement_reports rr
     JOIN requirements r ON r.id = rr.requirement_id
     WHERE r.institution_id = $1
     GROUP BY rr.reason ORDER BY rr.reason`,
    [institutionId]
  );
  return rows.map((row) => ({ reason: row.reason, count: row.count }));
}

async function getVouchCount(institutionId) {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM vouches WHERE institution_id = $1`,
    [institutionId]
  );
  return Number(rows[0]?.count || 0);
}

async function findInstitutionIdForUser(userId) {
  const { rows } = await query(
    `SELECT id FROM institutions WHERE created_by_user_id = $1 LIMIT 1`,
    [userId]
  );
  return rows[0]?.id || null;
}

module.exports = {
  createDispute,
  createVouch,
  findConfirmedInstitutionOffer,
  findInstitutionIdForUser,
  findOfferForDispute,
  findReporterIds,
  findRequirementOwner,
  extendRequirement,
  getAdminReportSummary,
  getRequirementReportCountsForInstitution,
  getVouchCount,
  insertReport,
  markHandoff,
  reduceVisibility,
};
