const { successResponse, AppError } = require('../utils/response');
const fraudSignalRepository = require('../repositories/fraudSignalRepository');
const { logAudit } = require('../utils/auditLogger');

/**
 * GET /api/v1/admin/fraud-signals
 * Admin fetches all fraud review signals
 */
async function getFraudSignals(req, res, next) {
  try {
    const { status, limit, offset } = req.query;
    const signals = await fraudSignalRepository.findAll({
      status: status || null,
      limit: Number(limit) || 50,
      offset: Number(offset) || 0,
    });
    return successResponse(res, 'Fraud signals retrieved', signals);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/fraud-signals/entity/:type/:id
 * Admin fetches fraud signals for a specific entity
 */
async function getEntityFraudSignals(req, res, next) {
  try {
    const { type, id } = req.params;
    const signals = await fraudSignalRepository.findByEntity(type, id);
    return successResponse(res, 'Entity fraud signals retrieved', signals);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/admin/fraud-signals/:id/resolve
 * Admin resolves or dismisses a signal
 */
async function resolveFraudSignal(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'resolved' | 'dismissed' | 'under_review'

    if (!status || !['resolved', 'dismissed', 'under_review'].includes(status)) {
      throw new AppError("Invalid status. Must be 'resolved', 'dismissed', or 'under_review'", 400);
    }

    const updated = await fraudSignalRepository.updateStatus(id, status, req.user.id);
    if (!updated) {
      throw new AppError('Fraud signal not found', 404);
    }

    await logAudit({
      userId: req.user.id,
      action: `fraud_signal_${status}`,
      entityType: 'fraud_signal',
      entityId: id,
      details: { previousStatus: updated.status, newStatus: status },
    });

    return successResponse(res, `Fraud signal marked as ${status}`, updated);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFraudSignals,
  getEntityFraudSignals,
  resolveFraudSignal,
};
