const { successResponse, AppError } = require('../utils/response');
const notificationRepository = require('../repositories/notificationRepository');

async function getMyNotifications(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const notifications = await notificationRepository.findByUserId(req.user.id, { limit, offset });
    return successResponse(res, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    next(error);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await notificationRepository.markAsRead(req.params.id, req.user.id);
    if (!notification) {
      throw new AppError('Notification not found or unauthorized', 404);
    }
    return successResponse(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
}

async function markAllNotificationsAsRead(req, res, next) {
  try {
    const updatedCount = await notificationRepository.markAllAsRead(req.user.id);
    return successResponse(res, 'All notifications marked as read', { count: updatedCount });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
