const { successResponse, AppError } = require('../utils/response');
const { validateCreateRequirement } = require('../validators/requirementValidator');
const requirementService = require('../services/requirementService');
const requirementRepository = require('../repositories/requirementRepository');

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

module.exports = { createRequirement, getRequirements, getRequirementById };
