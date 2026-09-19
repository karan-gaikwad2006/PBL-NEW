const { successResponse, AppError } = require('../utils/response');
const matchingEngine = require('../services/matchingEngine');
const requirementRepository = require('../repositories/requirementRepository');

async function getMatches(req, res, next) {
  try {
    const { location, foodItems } = req.body || {};
    if (location && (!Number.isFinite(Number(location.lat)) || !Number.isFinite(Number(location.lng)))) {
      throw new AppError('Location must contain valid latitude and longitude', 422);
    }
    if (foodItems !== undefined && !Array.isArray(foodItems)) {
      throw new AppError('foodItems must be an array', 422);
    }
    const matches = await matchingEngine.matchRequirements(
      { location: location || null, foodItems: foodItems || [] },
      {
        maxResults: req.body?.maxResults,
        maxRadiusKm: req.body?.maxRadiusKm,
        weights: req.body?.weights,
        requirementRepository,
      },
    );
    return successResponse(res, 'Deterministic matches retrieved successfully', matches);
  } catch (error) {
    next(error);
  }
}

module.exports = { getMatches };