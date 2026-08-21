const express = require('express');
const userController = require('../../controllers/userController');
const { verifyFirebaseToken, attachUser, requireAuthenticatedUser } = require('../../middleware/authMiddleware');

const router = express.Router();

// Publicly accessible via Firebase token (for sync)
router.post('/sync', verifyFirebaseToken, userController.syncUser);

// Protected routes (require DB user record)
router.get('/me', verifyFirebaseToken, attachUser, requireAuthenticatedUser, userController.getProfile);
router.patch('/me', verifyFirebaseToken, attachUser, requireAuthenticatedUser, userController.updateProfile);

// Backward-compatible aliases for earlier Phase 5 contracts
router.get('/profile', verifyFirebaseToken, attachUser, requireAuthenticatedUser, userController.getProfile);
router.patch('/profile', verifyFirebaseToken, attachUser, requireAuthenticatedUser, userController.updateProfile);

module.exports = router;
