const { query } = require('../config/db');

function toCount(value) {
  return Number(value) || 0;
}

async function getDashboardCounts() {
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*) FROM requirements) AS total_requirements,
      (SELECT COUNT(*) FROM requirements WHERE status = 'under_review') AS pending_review,
      (SELECT COUNT(*) FROM requirements WHERE status = 'active') AS active_requirements,
      (SELECT COUNT(*) FROM requirements WHERE status = 'partially_supported') AS partially_supported,
      (SELECT COUNT(*) FROM requirements WHERE status = 'fulfilled') AS fulfilled_requirements,
      (SELECT COUNT(*) FROM institutions WHERE verification_status IN ('pending', 'under_review')) AS verification_queue,
      (SELECT COUNT(*) FROM fraud_signals WHERE status = 'pending') AS flagged_signals,
      (SELECT COUNT(*) FROM users WHERE role = 'donor' AND status = 'active') AS total_donors,
      (SELECT COUNT(*) FROM users WHERE role = 'requester' AND status = 'active') AS total_requesters
  `);

  const row = rows[0] || {};
  return {
    totalRequirements: toCount(row.total_requirements),
    pendingReview: toCount(row.pending_review),
    activeRequirements: toCount(row.active_requirements),
    partiallySupported: toCount(row.partially_supported),
    fulfilledRequirements: toCount(row.fulfilled_requirements),
    verificationQueue: toCount(row.verification_queue),
    flaggedSignals: toCount(row.flagged_signals),
    totalDonors: toCount(row.total_donors),
    totalRequesters: toCount(row.total_requesters),
  };
}

module.exports = { getDashboardCounts };
