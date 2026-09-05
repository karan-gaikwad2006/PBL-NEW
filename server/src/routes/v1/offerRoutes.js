const express = require('express');
const offerController = require('../../controllers/offerController');
const {
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
  requireRole,
} = require('../../middleware/authMiddleware');

const { createRateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

const authChain = [verifyFirebaseToken, attachUser, requireAuthenticatedUser];

const offerCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many offer submissions. Please wait a few minutes before trying again.',
});

// ─── Donor / Admin ────────────────────────────────────────────────────────────
// NOTE: /mine routes must come before /:id to avoid id capture
router.get('/mine', ...authChain, requireRole(['donor', 'admin']), offerController.getMyOffers);
router.get('/mine/impact', ...authChain, requireRole(['donor', 'admin']), offerController.getMyImpact);
router.get('/:id', ...authChain, offerController.getOfferById);

// ─── Dual Confirmation Routes ───────────────────────────────────────────────
router.patch('/:id/confirm-donor', ...authChain, requireRole(['donor', 'admin']), offerController.confirmDonor);
router.patch('/:id/confirm-requester', ...authChain, requireRole(['requester', 'institution', 'admin']), offerController.confirmRequester);

// ─── Create ───────────────────────────────────────────────────────────────────
router.post('/', ...authChain, requireRole(['donor', 'admin']), offerCreateLimiter, offerController.createOffer);

module.exports = router;

