const express = require('express');
const notificationController = require('../../controllers/notificationController');
const {
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
} = require('../../middleware/authMiddleware');

const router = express.Router();

const authChain = [verifyFirebaseToken, attachUser, requireAuthenticatedUser];

router.get('/', ...authChain, notificationController.getMyNotifications);
router.patch('/read-all', ...authChain, notificationController.markAllNotificationsAsRead);
router.patch('/:id/read', ...authChain, notificationController.markNotificationAsRead);

module.exports = router;
