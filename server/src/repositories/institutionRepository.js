const { query } = require('../config/db');

async function findByUserId(userId) {
  const { rows } = await query(
    `SELECT i.*, d.name as district_name
     FROM institutions i
     LEFT JOIN districts d ON i.district_id = d.id
     WHERE i.created_by_user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query(
    `SELECT i.*, d.name as district_name, u.full_name as creator_name, u.email as creator_email
     FROM institutions i
     LEFT JOIN districts d ON i.district_id = d.id
     LEFT JOIN users u ON i.created_by_user_id = u.id
     WHERE i.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findDocumentsByInstitutionId(institutionId) {
  const { rows } = await query(
    `SELECT id, institution_id, uploaded_by_user_id, document_type,
            file_name, storage_provider, storage_public_id, file_url,
            mime_type, file_size, review_status, created_at, updated_at
     FROM institution_documents
     WHERE institution_id = $1
     ORDER BY created_at DESC`,
    [institutionId]
  );
  return rows.map((r) => ({
    id: r.id,
    institutionId: r.institution_id,
    uploadedByUserId: r.uploaded_by_user_id,
    documentType: r.document_type,
    fileName: r.file_name,
    storageProvider: r.storage_provider,
    storagePublicId: r.storage_public_id,
    fileUrl: r.file_url,
    mimeType: r.mime_type,
    fileSize: r.file_size,
    reviewStatus: r.review_status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

async function create(userId, payload) {
  const { name, organization_type, description, district_id, address, contact_email, contact_phone } = payload;
  const { rows } = await query(
    `INSERT INTO institutions (
      name, organization_type, description, district_id,
      address, contact_email, contact_phone, created_by_user_id, verification_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
    RETURNING *`,
    [name, organization_type, description, district_id, address, contact_email, contact_phone, userId]
  );
  return rows[0];
}

async function update(userId, updates) {
  const fields = Object.keys(updates);
  const values = fields.map((field) => updates[field]);
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  values.push(userId);

  const { rows } = await query(
    `UPDATE institutions
     SET ${assignments.join(', ')},
         updated_at = NOW()
     WHERE created_by_user_id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0] || null;
}

async function addDocument(institutionId, userId, doc) {
  const { documentType, fileName, storageProvider, storagePublicId, fileUrl, mimeType, fileSize } = doc;
  const { rows } = await query(
    `INSERT INTO institution_documents (
      institution_id, uploaded_by_user_id, document_type,
      file_name, storage_provider, storage_public_id, file_url,
      mime_type, file_size, review_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
    RETURNING *`,
    [institutionId, userId, documentType || 'verification_doc', fileName, storageProvider || 'cloudinary', storagePublicId, fileUrl, mimeType, fileSize]
  );

  // Update institution status to under_review if pending/rejected
  await query(
    `UPDATE institutions
     SET verification_status = 'under_review', updated_at = NOW()
     WHERE id = $1 AND verification_status IN ('pending', 'rejected')`,
    [institutionId]
  );

  return rows[0];
}

async function findDocumentById(docId) {
  const { rows } = await query(
    `SELECT * FROM institution_documents WHERE id = $1 LIMIT 1`,
    [docId]
  );
  return rows[0] || null;
}

async function deleteDocument(docId, userId) {
  const { rows } = await query(
    `DELETE FROM institution_documents
     WHERE id = $1 AND uploaded_by_user_id = $2
     RETURNING *`,
    [docId, userId]
  );
  return rows[0] || null;
}

async function findAllForAdmin({ status, limit = 50, offset = 0 } = {}) {
  const values = [];
  const conditions = [];
  if (status) {
    values.push(status);
    conditions.push(`i.verification_status = $${values.length}`);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(Math.min(Math.max(Number(limit) || 50, 1), 100));
  const limitIndex = values.length;
  values.push(Math.max(Number(offset) || 0, 0));
  const offsetIndex = values.length;

  const { rows } = await query(
    `SELECT i.id, i.name, i.organization_type, i.verification_status, i.created_at, i.updated_at,
            d.name as district_name, u.full_name as creator_name, u.email as creator_email,
            COUNT(doc.id) AS docs_submitted
     FROM institutions i
     LEFT JOIN districts d ON i.district_id = d.id
     LEFT JOIN users u ON i.created_by_user_id = u.id
     LEFT JOIN institution_documents doc ON doc.institution_id = i.id
     ${whereClause}
     GROUP BY i.id, d.name, u.full_name, u.email
     ORDER BY i.created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.organization_type,
    verificationStatus: r.verification_status,
    districtName: r.district_name,
    creatorName: r.creator_name,
    creatorEmail: r.creator_email,
    submittedOn: r.created_at,
    updatedAt: r.updated_at,
    docsSubmitted: Number(r.docs_submitted || 0),
    docsRequired: 3,
  }));
}

async function updateVerificationStatus(institutionId, newStatus) {
  const { rows } = await query(
    `UPDATE institutions
     SET verification_status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [newStatus, institutionId]
  );
  const updated = rows[0] || null;

  if (updated) {
    // Notify institution owner
    try {
      const notificationRepository = require('./notificationRepository');
      const isVerified = newStatus === 'verified';
      await notificationRepository.createNotification(updated.created_by_user_id, {
        type: isVerified ? 'document_reviewed' : 'document_rejected',
        title: isVerified ? 'Institution Verified' : 'Institution Verification Rejected',
        message: isVerified
          ? `Your institution "${updated.name}" has been verified by the PoshanSetu team.`
          : `Your institution verification for "${updated.name}" was not approved. Please review and resubmit documents.`,
        relatedEntityType: 'institution',
        relatedEntityId: updated.id,
      });
    } catch (e) {
      console.error('Failed to send verification notification', e);
    }
  }

  return updated;
}

module.exports = {
  findByUserId,
  findById,
  findDocumentsByInstitutionId,
  create,
  update,
  addDocument,
  findDocumentById,
  deleteDocument,
  findAllForAdmin,
  updateVerificationStatus,
};
