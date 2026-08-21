const { getEnv } = require('../config/env');
const requirementRepository = require('../repositories/requirementRepository');

function getExpiryDays() {
  const configuredDays = Number(getEnv('REQUIREMENT_EXPIRY_DAYS', 30));
  return Number.isInteger(configuredDays) && configuredDays > 0 ? configuredDays : 30;
}

async function createRequirement(userId, payload) {
  const expiresAt = new Date(Date.now() + getExpiryDays() * 24 * 60 * 60 * 1000);
  return requirementRepository.create(userId, payload, expiresAt);
}

module.exports = { createRequirement, getExpiryDays };
