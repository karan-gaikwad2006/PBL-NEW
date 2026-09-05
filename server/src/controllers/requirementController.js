const { successResponse, AppError } = require('../utils/response');
const { validateCreateRequirement } = require('../validators/requirementValidator');
const requirementService = require('../services/requirementService');
const requirementRepository = require('../repositories/requirementRepository');

const ALLOWED_ADMIN_STATUSES = new Set(['active', 'rejected', 'hidden', 'under_review']);

async function createRequirement(req, res, next) {
  try {
    const payload = validateCreateRequirement(req.body);
    const requirement = await requirementService.createRequirement(req.user.id, payload);
    return successResponse(res, 'Requirement submitted for review', requirement, 201);
  } catch (error) {
    next(error);
  }
}

async function getRequirements(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const requirements = await requirementRepository.findAll({
      district: req.query.district,
      limit,
      offset,
    });
    return successResponse(res, 'Requirements retrieved successfully', requirements);
  } catch (error) {
    next(error);
  }
}

async function getRequirementById(req, res, next) {
  try {
    const requirement = await requirementRepository.findById(req.params.id);
    if (!requirement) throw new AppError('Requirement not found', 404);
    return successResponse(res, 'Requirement retrieved successfully', requirement);
  } catch (error) {
    next(error);
  }
}

/** GET /api/v1/requirements/mine — requester's own requirements */
async function getMyRequirements(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const requirements = await requirementRepository.findByUserId(req.user.id, { limit, offset });
    return successResponse(res, 'Your requirements retrieved successfully', requirements);
  } catch (error) {
    next(error);
  }
}

/** GET /api/v1/requirements/:id/manage — owner or admin can see any status */
async function getMyRequirementById(req, res, next) {
  try {
    const requirement = await requirementRepository.findByIdUnrestricted(req.params.id);
    if (!requirement) throw new AppError('Requirement not found', 404);

    // Admin sees all; requester only sees own
    if (req.user.role !== 'admin') {
      const owns = await requirementRepository.isOwner(req.params.id, req.user.id);
      if (!owns) throw new AppError('Forbidden: You do not own this requirement', 403);
    }

    return successResponse(res, 'Requirement retrieved successfully', requirement);
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/v1/requirements/:id/approve — admin only */
async function adminApproveRequirement(req, res, next) {
  try {
    const requirement = await requirementRepository.findByIdUnrestricted(req.params.id);
    if (!requirement) throw new AppError('Requirement not found', 404);
    if (requirement.status !== 'under_review') {
      throw new AppError(`Cannot approve: requirement is already ${requirement.status}`, 409);
    }
    const updated = await requirementRepository.updateStatus(req.params.id, 'active');
    return successResponse(res, 'Requirement approved and set to active', updated);
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/v1/requirements/:id/reject — admin only */
async function adminRejectRequirement(req, res, next) {
  try {
    const requirement = await requirementRepository.findByIdUnrestricted(req.params.id);
    if (!requirement) throw new AppError('Requirement not found', 404);
    if (!['under_review', 'active', 'partially_supported'].includes(requirement.status)) {
      throw new AppError(`Cannot reject: requirement is already ${requirement.status}`, 409);
    }
    const updated = await requirementRepository.updateStatus(req.params.id, 'rejected');
    return successResponse(res, 'Requirement rejected', updated);
  } catch (error) {
    next(error);
  }
}

/** GET /api/v1/requirements/admin — admin sees all requirements with requester info */
async function adminGetRequirements(req, res, next) {
  try {
    const { status, limit, offset } = req.query;
    const requirements = await requirementRepository.findAllForAdmin({
      status: status || null,
      limit: Number(limit) || 100,
      offset: Number(offset) || 0,
    });
    return successResponse(res, 'Admin: requirements retrieved', requirements);
  } catch (error) {
    next(error);
  }
}

/** GET /api/v1/requirements/:id/admin — admin single requirement with requester info */
async function adminGetRequirementById(req, res, next) {
  try {
    const requirement = await requirementRepository.findByIdForAdmin(req.params.id);
    if (!requirement) throw new AppError('Requirement not found', 404);
    return successResponse(res, 'Admin: requirement retrieved', requirement);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRequirement,
  getRequirements,
  getRequirementById,
  getMyRequirements,
  getMyRequirementById,
  adminApproveRequirement,
  adminRejectRequirement,
  adminGetRequirements,
  adminGetRequirementById,
};
