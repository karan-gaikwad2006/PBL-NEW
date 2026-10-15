const express = require('express');
const fraudSignalController = require('../../controllers/fraudSignalController');
const adminStatsController = require('../../controllers/adminStatsController');
const trustController = require('../../controllers/trustController');
const {
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
  requireRole,
} = require('../../middleware/authMiddleware');

const router = express.Router();

const adminOnly = [
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
  requireRole(['admin']),
];

router.get('/stats', ...adminOnly, adminStatsController.getDashboardStats);
router.get('/reports/summary', ...adminOnly, trustController.getReportsSummary);

// Fraud Review Signals
router.get('/fraud-signals', ...adminOnly, fraudSignalController.getFraudSignals);
router.get('/fraud-signals/entity/:type/:id', ...adminOnly, fraudSignalController.getEntityFraudSignals);
router.patch('/fraud-signals/:id/resolve', ...adminOnly, fraudSignalController.resolveFraudSignal);

module.exports = router;
