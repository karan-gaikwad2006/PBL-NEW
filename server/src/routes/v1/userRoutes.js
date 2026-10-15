const express = require('express');
const userController = require('../../controllers/userController');
const userDocumentController = require('../../controllers/userDocumentController');
const { verifyFirebaseToken, attachUser, requireAuthenticatedUser, requireRole } = require('../../middleware/authMiddleware');
const { upload } = require('../../middleware/uploadMiddleware');

const router = express.Router();
const authChain = [verifyFirebaseToken, attachUser, requireAuthenticatedUser];

// Publicly accessible via Firebase token (for sync)
router.post('/sync', verifyFirebaseToken, userController.syncUser);

// Protected routes (require DB user record)
router.get('/me', ...authChain, userController.getProfile);
router.patch('/me', ...authChain, userController.updateProfile);
router.get('/me/documents', ...authChain, userDocumentController.getMyDocuments);
router.post(
  '/me/documents',
  ...authChain,
  requireRole(['donor', 'requester', 'institution']),
  upload.single('file'),
  userDocumentController.uploadMyDocument
);
router.get('/documents/:id/access', ...authChain, userDocumentController.accessDocument);
router.get('/admin/:userId/documents', ...authChain, requireRole(['admin']), userDocumentController.getUserDocuments);
router.patch(
  '/admin/:userId/documents/:documentId',
  ...authChain,
  requireRole(['admin']),
  userDocumentController.reviewDocument
);

// Backward-compatible aliases for earlier Phase 5 contracts
router.get('/profile', ...authChain, userController.getProfile);
router.patch('/profile', ...authChain, userController.updateProfile);

module.exports = router;
