const express = require('express');
const institutionController = require('../../controllers/institutionController');
const { verifyFirebaseToken, attachUser, requireAuthenticatedUser, requireRole } = require('../../middleware/authMiddleware');

const router = express.Router();

// All institution routes require authentication
router.use(verifyFirebaseToken, attachUser, requireAuthenticatedUser);

// Get my institution
router.get('/me', requireRole(['institution', 'admin']), institutionController.getMyInstitution);

// Create institution (Only for requesters/institutions/admins)
router.post('/', requireRole(['requester', 'institution', 'admin']), institutionController.createInstitution);

// Update my institution
router.patch('/me', requireRole(['institution', 'admin']), institutionController.updateMyInstitution);

module.exports = router;
