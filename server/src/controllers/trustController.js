const { successResponse, AppError } = require('../utils/response');
const trustService = require('../services/trustService');
const trustRepository = require('../repositories/trustRepository');

const REPORT_REASONS = new Set([
  'asks_money_outside_platform',
  'wrong_beneficiary',
  'fake_urgency',
  'other',
]);

async function createRequirementReport(req, res, next) {
  try {
    const { reason, note } = req.body || {};
    if (!REPORT_REASONS.has(reason)) throw new AppError('A valid report reason is required', 400);
    if (note !== undefined && (typeof note !== 'string' || note.trim().length > 300)) {
      throw new AppError('Report note must be 300 characters or fewer', 400);
    }
    const report = await trustService.reportRequirement(
      req.params.id,
      req.user.id,
      reason,
      typeof note === 'string' && note.trim() ? note.trim() : null
    );
    return successResponse(res, 'Report submitted', report, 201);
  } catch (error) {
    next(error);
  }
}

async function getReportsSummary(req, res, next) {
  try {
    return successResponse(res, 'Report summary retrieved', await trustRepository.getAdminReportSummary());
  } catch (error) {
    next(error);
  }
}

async function disputeOffer(req, res, next) {
  try {
    const reason = req.body?.reason;
    if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 300) {
      throw new AppError('A reason of 1 to 300 characters is required', 400);
    }
    await trustService.disputeOffer(req.params.id, req.user.id, reason.trim());
    return successResponse(res, 'Offer disputed', { id: req.params.id });
  } catch (error) {
    next(error);
  }
}

async function vouchForInstitution(req, res, next) {
  try {
    const vouch = await trustService.vouchForInstitution(req.user.id, req.params.id);
    return successResponse(res, 'Vouch recorded', vouch, 201);
  } catch (error) {
    next(error);
  }
}

async function markHandoff(req, res, next) {
  try {
    const handoff = await trustService.markOfferHandoff(req.params.id, req.user.id);
    return successResponse(res, 'Offer handoff recorded', handoff);
  } catch (error) {
    next(error);
  }
}

async function extendRequirement(req, res, next) {
  try {
    const extension = await trustService.extendRequirement(req.params.id, req.user.id);
    return successResponse(res, 'Requirement extended', extension);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRequirementReport,
  disputeOffer,
  extendRequirement,
  getReportsSummary,
  markHandoff,
  vouchForInstitution,
};
