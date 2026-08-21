const express = require('express');
const requirementController = require('../../controllers/requirementController');
const { verifyFirebaseToken, attachUser, requireAuthenticatedUser, requireRole } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/', requirementController.getRequirements);
router.get('/:id', requirementController.getRequirementById);
router.post(
  '/',
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
  requireRole(['requester', 'institution', 'admin']),
  requirementController.createRequirement
);

module.exports = router;
