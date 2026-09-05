const { query } = require('../config/db');

async function createNotification(userId, { type, title, message, relatedEntityType = null, relatedEntityId = null }) {
  if (!userId) return null;
  const { rows } = await query(
    `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, type, title, message, relatedEntityType, relatedEntityId]
  );
  return rows[0];
}

async function findByUserId(userId, { limit = 50, offset = 0 } = {}) {
  const values = [userId, Math.min(Math.max(Number(limit) || 50, 1), 100), Math.max(Number(offset) || 0, 0)];
  const { rows } = await query(
    `SELECT id, type, title, message, related_entity_type, related_entity_id, is_read, created_at, read_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    values
  );

  return rows.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    relatedEntityType: r.related_entity_type,
    relatedEntityId: r.related_entity_id,
    isRead: r.is_read,
    createdAt: r.created_at,
    readAt: r.read_at,
  }));
}

async function markAsRead(notificationId, userId) {
  const { rows } = await query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return rows[0] || null;
}

async function markAllAsRead(userId) {
  const { rows } = await query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND is_read = FALSE
     RETURNING id`,
    [userId]
  );
  return rows.length;
}

module.exports = {
  createNotification,
  findByUserId,
  markAsRead,
  markAllAsRead,
};
