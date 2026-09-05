const express = require('express');
const requirementController = require('../../controllers/requirementController');
const {
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
  requireRole,
} = require('../../middleware/authMiddleware');

const { createRateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

const authChain = [verifyFirebaseToken, attachUser, requireAuthenticatedUser];
const adminOnly = [...authChain, requireRole(['admin'])];
const requesterOrAdmin = [...authChain, requireRole(['requester', 'institution', 'admin'])];

const requirementSubmitLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requirement submission attempts. Please wait 15 minutes before submitting again.',
});

// ─── Static authenticated routes FIRST (must come before /:id dynamic routes) ─
// Requester/Institution
router.get('/mine/list', ...requesterOrAdmin, requirementController.getMyRequirements);

// Admin
router.get('/admin/list', ...adminOnly, requirementController.adminGetRequirements);

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', requirementController.getRequirements);

// ─── Create ───────────────────────────────────────────────────────────────────
router.post('/', ...authChain, requireRole(['requester', 'institution', 'admin']), requirementSubmitLimiter, requirementController.createRequirement);

// ─── Dynamic /:id routes (after all static routes) ────────────────────────────
router.get('/:id', requirementController.getRequirementById);
router.get('/:id/manage', ...requesterOrAdmin, requirementController.getMyRequirementById);
router.get('/:id/admin', ...adminOnly, requirementController.adminGetRequirementById);
router.patch('/:id/approve', ...adminOnly, requirementController.adminApproveRequirement);
router.patch('/:id/reject', ...adminOnly, requirementController.adminRejectRequirement);

module.exports = router;
