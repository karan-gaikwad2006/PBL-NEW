const express = require('express');
const institutionController = require('../../controllers/institutionController');
const {
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
  requireRole,
} = require('../../middleware/authMiddleware');
const { upload } = require('../../middleware/uploadMiddleware');
const { createRateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// All institution routes require authentication
const authChain = [verifyFirebaseToken, attachUser, requireAuthenticatedUser];

const documentUploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many document upload attempts. Please wait 15 minutes before uploading again.',
});

// ─── Institution Owner Endpoints (must precede /:id) ──────────────────────────
router.get('/me', ...authChain, requireRole(['institution', 'requester', 'admin']), institutionController.getMyInstitution);
router.post('/', ...authChain, requireRole(['requester', 'institution', 'admin']), institutionController.createInstitution);
router.patch('/me', ...authChain, requireRole(['institution', 'requester', 'admin']), institutionController.updateMyInstitution);

// Document management
router.post(
  '/me/documents',
  ...authChain,
  requireRole(['institution', 'requester', 'admin']),
  documentUploadLimiter,
  upload.single('file'),
  institutionController.uploadDocument
);
router.delete(
  '/me/documents/:id',
  ...authChain,
  requireRole(['institution', 'requester', 'admin']),
  institutionController.deleteDocument
);

// ─── Admin Verification Endpoints ─────────────────────────────────────────────
router.get('/admin/list', ...authChain, requireRole(['admin']), institutionController.getAdminInstitutions);
router.get('/admin/:id', ...authChain, requireRole(['admin']), institutionController.getAdminInstitutionById);
router.patch('/:id/verify', ...authChain, requireRole(['admin']), institutionController.verifyInstitution);

module.exports = router;
