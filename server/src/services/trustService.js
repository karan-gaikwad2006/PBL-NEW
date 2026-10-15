const { query } = require('../config/db');
const TRUST_CONFIG = require('../config/trust');
const { AppError } = require('../utils/response');
const trustRepository = require('../repositories/trustRepository');

async function hasOpenDispute(userId, role, institutionId) {
  const { rows } = await query(
    `SELECT 1
     FROM support_offers so
     JOIN requirements r ON r.id = so.requirement_id
     WHERE so.status = 'disputed'
       AND (
         so.donor_user_id = $1
         OR r.requester_user_id = $1
         OR ($2 = 'institution' AND r.institution_id = $3)
       )
     LIMIT 1`,
    [userId, role, institutionId]
  );
  return rows.length > 0;
}

async function computeTiers(userId) {
  const { rows: userRows } = await query(
    `SELECT id, role, phone_verified_at FROM users WHERE id = $1`,
    [userId]
  );
  const user = userRows[0];
  if (!user) return [];

  const tiers = [];
  const institution = user.role === 'institution'
    ? (await query(
      `SELECT id, verification_status, phone_verified_at
       FROM institutions WHERE created_by_user_id = $1 LIMIT 1`,
      [userId]
    )).rows[0]
    : null;

  if (institution?.verification_status === 'verified') tiers.push('document_verified');
  if ((institution?.phone_verified_at || user.phone_verified_at) && user.role !== 'requester') {
    tiers.push('phone_verified');
  }

  const openDispute = await hasOpenDispute(userId, user.role, institution?.id || null);
  if (!openDispute && user.role === 'institution' && institution) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count
       FROM support_offers so
       JOIN requirements r ON r.id = so.requirement_id
       WHERE r.institution_id = $1 AND so.status = 'completed'`,
      [institution.id]
    );
    if (Number(rows[0]?.count || 0) >= TRUST_CONFIG.TRACK_RECORD_MIN_FULFILMENTS_INSTITUTION) {
      tiers.push('track_record');
    }
  } else if (!openDispute && user.role === 'requester') {
    // TODO: Requester phone verification is intentionally not implemented; no OTP or SMS is used.
    const { rows } = await query(
      `SELECT 1 FROM requirements WHERE requester_user_id = $1 AND status = 'fulfilled' LIMIT 1`,
      [userId]
    );
    if (rows.length > 0) tiers.push('track_record');
  } else if (!openDispute && user.role === 'donor') {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count FROM support_offers
       WHERE donor_user_id = $1 AND status = 'completed'`,
      [userId]
    );
    if (Number(rows[0]?.count || 0) >= TRUST_CONFIG.TRACK_RECORD_MIN_CONFIRMED_DONOR) {
      tiers.push('track_record');
    }
  }

  return tiers;
}

async function getPostingLimits(userId) {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS used
     FROM requirements
     WHERE requester_user_id = $1
       AND submitted_at > NOW() - INTERVAL '24 hours'`,
    [userId]
  );
  const used = Number(rows[0]?.used || 0);
  return {
    daily: TRUST_CONFIG.DAILY_REQUIREMENT_LIMIT,
    used,
    remaining: Math.max(0, TRUST_CONFIG.DAILY_REQUIREMENT_LIMIT - used),
  };
}

async function recordTrustEvent(userId, eventType, scoreDelta, relatedId = null) {
  await query(
    `INSERT INTO trust_score_events (user_id, event_type, score_delta, related_id)
     VALUES ($1, $2, $3, $4)`,
    [userId, eventType, scoreDelta, relatedId]
  );
}

async function getReportWeight(userId) {
  const tiers = await computeTiers(userId);
  if (tiers.includes('track_record')) return TRUST_CONFIG.REPORT_WEIGHT_TRACK_RECORD;
  if (tiers.includes('phone_verified')) return TRUST_CONFIG.REPORT_WEIGHT_PHONE_VERIFIED;
  return TRUST_CONFIG.REPORT_WEIGHT_OTHER;
}

async function reportRequirement(requirementId, reporterId, reason, note) {
  const requirement = await trustRepository.findRequirementOwner(requirementId);
  if (!requirement) throw new AppError('Requirement not found', 404);
  if (requirement.requester_user_id === reporterId) {
    throw new AppError('You cannot report your own requirement', 403);
  }

  let report;
  try {
    report = await trustRepository.insertReport(requirementId, reporterId, reason, note);
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('You have already reported this requirement.', 409);
    }
    throw error;
  }

  const reporterIds = await trustRepository.findReporterIds(requirementId);
  const weights = await Promise.all(reporterIds.map(getReportWeight));
  const weightedCount = weights.reduce((total, weight) => total + weight, 0);
  if (weightedCount >= TRUST_CONFIG.REPORT_VISIBILITY_THRESHOLD) {
    await trustRepository.reduceVisibility(requirementId, reporterId);
  }
  return report;
}

async function disputeOffer(offerId, donorId, reason) {
  const offer = await trustRepository.findOfferForDispute(offerId);
  if (!offer) throw new AppError('Offer not found', 404);
  if (offer.donor_user_id !== donorId) {
    throw new AppError('Only the donor who owns this offer can dispute it', 403);
  }
  if (offer.status !== 'handed_off' || !offer.handoff_at) {
    throw new AppError('Only a handed-off offer can be disputed', 409);
  }
  const elapsedHours = (Date.now() - new Date(offer.handoff_at).getTime()) / 3600000;
  if (!Number.isFinite(elapsedHours) || elapsedHours < 0 || elapsedHours > TRUST_CONFIG.CONFIRMATION_WINDOW_HOURS) {
    throw new AppError('The dispute window for this offer has closed', 409);
  }
  await trustRepository.createDispute(
    offer,
    donorId,
    reason,
    TRUST_CONFIG.DISPUTE_DELTA_INSTITUTION,
    TRUST_CONFIG.DISPUTE_DELTA_DONOR
  );
}

async function vouchForInstitution(donorId, institutionId) {
  const offerId = await trustRepository.findConfirmedInstitutionOffer(donorId, institutionId);
  if (!offerId) {
    throw new AppError('A confirmed offer to this institution is required before you can vouch', 403);
  }
  try {
    return await trustRepository.createVouch(
      donorId,
      institutionId,
      offerId,
      TRUST_CONFIG.VOUCH_DELTA_INSTITUTION
    );
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('You have already vouched for this institution', 409);
    }
    throw error;
  }
}

async function markOfferHandoff(offerId, donorId) {
  const handoff = await trustRepository.markHandoff(offerId, donorId);
  if (!handoff) throw new AppError('Only an active offer owned by you can be marked handed off', 409);
  return handoff;
}

async function extendRequirement(requirementId, userId) {
  const extension = await trustRepository.extendRequirement(
    requirementId,
    userId,
    TRUST_CONFIG.EXTENSION_DAYS
  );
  if (!extension) {
    throw new AppError('Only an active requirement you own can be extended once', 409);
  }
  return extension;
}

module.exports = {
  computeTiers,
  disputeOffer,
  extendRequirement,
  getPostingLimits,
  getReportWeight,
  markOfferHandoff,
  recordTrustEvent,
  reportRequirement,
  vouchForInstitution,
};
