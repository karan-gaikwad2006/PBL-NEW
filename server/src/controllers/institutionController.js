const { successResponse, AppError } = require('../utils/response');
const institutionRepository = require('../repositories/institutionRepository');
const { uploadBuffer, deleteFile } = require('../config/cloudinary');

const ALLOWED_INSTITUTION_UPDATE_FIELDS = [
  'name',
  'organization_type',
  'description',
  'district_id',
  'address',
  'contact_email',
  'contact_phone',
];

const sanitizeInstitutionUpdate = (payload = {}) => {
  const entries = Object.entries(payload || {});
  const invalidKeys = entries
    .map(([key]) => key)
    .filter((key) => !ALLOWED_INSTITUTION_UPDATE_FIELDS.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError('Only permitted institution profile fields may be updated', 422);
  }

  const nextData = {};
  for (const [key, value] of entries) {
    if (value !== undefined && value !== null) {
      nextData[key] = typeof value === 'string' ? value.trim() : value;
    }
  }

  if (Object.keys(nextData).length === 0) {
    throw new AppError('No valid institution fields supplied for update', 422);
  }

  return nextData;
};

/**
 * Get current user's institution profile and documents
 */
const getMyInstitution = async (req, res, next) => {
  try {
    const institution = await institutionRepository.findByUserId(req.user.id);
    if (!institution) {
      return successResponse(res, 'No institution found for this user', null);
    }

    const documents = await institutionRepository.findDocumentsByInstitutionId(institution.id);
    return successResponse(res, 'Institution profile retrieved', {
      ...institution,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new institution profile
 */
const createInstitution = async (req, res, next) => {
  try {
    const {
      name,
      organization_type,
      description,
      district_id,
      address,
      contact_email,
      contact_phone,
    } = req.body;

    if (!name || !organization_type) {
      throw new AppError('Institution name and organization type are required', 400);
    }

    const existing = await institutionRepository.findByUserId(req.user.id);
    if (existing) {
      throw new AppError('User already has an institution profile. Use UPDATE instead.', 400);
    }

    const institution = await institutionRepository.create(req.user.id, {
      name,
      organization_type,
      description,
      district_id,
      address,
      contact_email,
      contact_phone,
    });

    return successResponse(res, 'Institution profile created successfully', institution, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user's institution profile
 */
const updateMyInstitution = async (req, res, next) => {
  try {
    const updates = sanitizeInstitutionUpdate(req.body);
    const updated = await institutionRepository.update(req.user.id, updates);

    if (!updated) {
      throw new AppError('Institution profile not found', 404);
    }

    const documents = await institutionRepository.findDocumentsByInstitutionId(updated.id);
    return successResponse(res, 'Institution profile updated successfully', {
      ...updated,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload an institution verification document to Cloudinary
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    let institution = await institutionRepository.findByUserId(req.user.id);
    if (!institution) {
      // Auto-create a draft institution profile if not yet created
      institution = await institutionRepository.create(req.user.id, {
        name: req.user.full_name || 'Institution Organization',
        organization_type: 'Institution',
      });
    }

    const documentType = req.body.documentType || 'Registration Certificate';
    const originalName = req.file.originalname || 'document.pdf';
    const mimeType = req.file.mimetype;
    const fileSize = req.file.size;

    // Upload to Cloudinary
    const cloudinaryResult = await uploadBuffer(req.file.buffer, {
      folder: `poshansetu/institutions/${institution.id}`,
      public_id: `doc_${Date.now()}`,
    });

    const docRecord = await institutionRepository.addDocument(institution.id, req.user.id, {
      documentType,
      fileName: originalName,
      storageProvider: 'cloudinary',
      storagePublicId: cloudinaryResult.public_id,
      fileUrl: cloudinaryResult.secure_url,
      mimeType,
      fileSize,
    });

    return successResponse(res, 'Document uploaded successfully', docRecord, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an uploaded verification document
 */
const deleteDocument = async (req, res, next) => {
  try {
    const docId = req.params.id;
    const document = await institutionRepository.findDocumentById(docId);

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (req.user.role !== 'admin' && document.uploaded_by_user_id !== req.user.id) {
      throw new AppError('Forbidden: You can only delete your own documents', 403);
    }

    // Delete from Cloudinary
    if (document.storage_public_id && document.storage_provider === 'cloudinary') {
      try {
        await deleteFile(document.storage_public_id, document.mime_type?.startsWith('image/') ? 'image' : 'raw');
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await institutionRepository.deleteDocument(docId, document.uploaded_by_user_id);
    return successResponse(res, 'Document removed successfully', { id: docId });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all institutions for verification review
 */
const getAdminInstitutions = async (req, res, next) => {
  try {
    const status = req.query.status;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const institutions = await institutionRepository.findAllForAdmin({ status, limit, offset });
    return successResponse(res, 'Admin institutions list retrieved', institutions);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get single institution details with documents for review
 */
const getAdminInstitutionById = async (req, res, next) => {
  try {
    const institution = await institutionRepository.findById(req.params.id);
    if (!institution) {
      throw new AppError('Institution not found', 404);
    }

    const documents = await institutionRepository.findDocumentsByInstitutionId(institution.id);
    return successResponse(res, 'Admin institution details retrieved', {
      ...institution,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Verify or reject institution
 */
const verifyInstitution = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!['verified', 'rejected', 'under_review', 'pending'].includes(status)) {
      throw new AppError('Invalid verification status', 400);
    }

    const updated = await institutionRepository.updateVerificationStatus(req.params.id, status);
    if (!updated) {
      throw new AppError('Institution not found', 404);
    }

    return successResponse(res, `Institution verification status updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInstitution,
  createInstitution,
  updateMyInstitution,
  uploadDocument,
  deleteDocument,
  getAdminInstitutions,
  getAdminInstitutionById,
  verifyInstitution,
};
