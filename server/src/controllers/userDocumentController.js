const { successResponse, AppError } = require('../utils/response');
const { createPrivateDownloadUrl, uploadBuffer } = require('../config/cloudinary');
const userDocumentRepository = require('../repositories/userDocumentRepository');

const DOCUMENT_BY_ROLE = Object.freeze({
  donor: 'aadhaar',
  requester: 'aadhaar',
  institution: 'pan',
});
const REVIEW_STATUSES = new Set(['verified', 'rejected']);

async function uploadMyDocument(req, res, next) {
  try {
    if (!req.file) throw new AppError('A PDF, JPG, or PNG document is required', 400);
    const documentType = DOCUMENT_BY_ROLE[req.user.role];
    if (!documentType) throw new AppError('Document upload is not available for this role', 403);

    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
    const extension = req.file.originalname.split('.').pop()?.toLowerCase();
    const fileFormat = resourceType === 'raw' ? 'pdf' : extension;
    if (!fileFormat || !['pdf', 'jpg', 'jpeg', 'png'].includes(fileFormat)) {
      throw new AppError('Unsupported identity document format', 400);
    }

    const uploaded = await uploadBuffer(req.file.buffer, {
      folder: 'poshansetu/private_identity_documents',
      public_id: `user_${req.user.id}_${Date.now()}`,
      resource_type: resourceType,
      type: 'authenticated',
    });
    const document = await userDocumentRepository.create(req.user.id, {
      documentType,
      fileName: req.file.originalname,
      storagePublicId: uploaded.public_id,
      resourceType,
      fileFormat,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });
    return successResponse(res, 'Identity document uploaded for in-app review', document, 201);
  } catch (error) {
    next(error);
  }
}

async function getMyDocuments(req, res, next) {
  try {
    const documents = await userDocumentRepository.findByUserId(req.user.id);
    return successResponse(res, 'Your identity documents retrieved', documents);
  } catch (error) {
    next(error);
  }
}

async function getUserDocuments(req, res, next) {
  try {
    const documents = await userDocumentRepository.findByUserId(req.params.userId);
    return successResponse(res, 'Identity documents retrieved for admin review', documents);
  } catch (error) {
    next(error);
  }
}

async function accessDocument(req, res, next) {
  try {
    const document = await userDocumentRepository.findById(req.params.id);
    if (!document) throw new AppError('Document not found', 404);
    if (req.user.role !== 'admin' && document.user_id !== req.user.id) {
      throw new AppError('You cannot access this identity document', 403);
    }
    const accessUrl = createPrivateDownloadUrl(
      document.storage_public_id,
      document.file_format,
      document.resource_type
    );
    return successResponse(res, 'Temporary document access granted', { accessUrl });
  } catch (error) {
    next(error);
  }
}

async function reviewDocument(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!REVIEW_STATUSES.has(status)) throw new AppError('Review status must be verified or rejected', 400);
    const document = await userDocumentRepository.review(
      req.params.documentId,
      req.params.userId,
      status,
      req.user.id
    );
    if (!document) throw new AppError('Identity document not found for this user', 404);
    return successResponse(res, 'Identity document review saved', document);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  accessDocument,
  getMyDocuments,
  getUserDocuments,
  reviewDocument,
  uploadMyDocument,
};
