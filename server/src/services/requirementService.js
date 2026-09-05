const { getEnv } = require('../config/env');
const { AppError } = require('../utils/response');
const requirementRepository = require('../repositories/requirementRepository');

function getExpiryDays() {
  const configuredDays = Number(getEnv('REQUIREMENT_EXPIRY_DAYS', 30));
  return Number.isInteger(configuredDays) && configuredDays > 0 ? configuredDays : 30;
}

async function createRequirement(userId, payload) {
  // 1. Rate check: Maximum 5 requirements per 24 hours per requester
  const recentCount = await requirementRepository.countRecentRequirements(userId, 24);
  if (recentCount >= 5) {
    throw new AppError('You have reached the maximum allowed submissions for today (5). Please wait before creating more requirements.', 429);
  }

  // 2. Duplicate check: Check for existing active/under-review requirement in same district with overlapping items
  const districtId = await requirementRepository.findDistrictId(payload.district);
  if (districtId) {
    const itemNames = payload.items?.map((i) => i.name) || [];
    const duplicate = await requirementRepository.findDuplicateRequirement(userId, districtId, itemNames);
    if (duplicate) {
      throw new AppError(
        `You already have an ${duplicate.status.replace('_', ' ')} requirement ("${duplicate.title}") for similar items in this district.`,
        409
      );
    }
  }

  const expiresAt = new Date(Date.now() + getExpiryDays() * 24 * 60 * 60 * 1000);
  return requirementRepository.create(userId, payload, expiresAt);
}

module.exports = { createRequirement, getExpiryDays };

