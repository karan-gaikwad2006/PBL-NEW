const { getPool, query } = require('../config/db');

function mapDocument(row) {
  return {
    id: row.id,
    userId: row.user_id,
    documentType: row.document_type,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    reviewStatus: row.review_status,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

async function create(userId, document) {
  const { rows } = await query(
    `INSERT INTO user_documents
       (user_id, document_type, file_name, storage_public_id, resource_type,
        file_format, mime_type, file_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      userId,
      document.documentType,
      document.fileName,
      document.storagePublicId,
      document.resourceType,
      document.fileFormat,
      document.mimeType,
      document.fileSize,
    ]
  );
  return mapDocument(rows[0]);
}

async function findByUserId(userId) {
  const { rows } = await query(
    `SELECT * FROM user_documents WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(mapDocument);
}

async function findById(id) {
  const { rows } = await query(`SELECT * FROM user_documents WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function review(documentId, userId, status, adminId) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE user_documents
       SET review_status = $1, reviewed_by_user_id = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, review_status`,
      [status, adminId, documentId, userId]
    );
    if (rows[0]) {
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, 'identity_document_reviewed', 'user_document', $2, $3::jsonb)`,
        [adminId, documentId, JSON.stringify({ userId, reviewStatus: status })]
      );
    }
    await client.query('COMMIT');
    return rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { create, findById, findByUserId, review };
