const adminStatsRepository = require('../repositories/adminStatsRepository');

function computeFulfillmentRate(counts) {
  const completed = counts.fulfilledRequirements;
  const eligible = counts.activeRequirements + counts.partiallySupported + completed;
  if (eligible <= 0) return 0;
  return Math.round((completed / eligible) * 100);
}

async function getDashboardStats() {
  const counts = await adminStatsRepository.getDashboardCounts();
  return {
    totalRequirements: counts.totalRequirements,
    pendingReview: counts.pendingReview,
    verificationQueue: counts.verificationQueue,
    flaggedSignals: counts.flaggedSignals,
    activeRequirements: counts.activeRequirements,
    totalDonors: counts.totalDonors,
    totalRequesters: counts.totalRequesters,
    fulfillmentRate: computeFulfillmentRate(counts),
  };
}

module.exports = { getDashboardStats, computeFulfillmentRate };
