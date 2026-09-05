const { successResponse } = require('../utils/response');
const adminStatsService = require('../services/adminStatsService');

async function getDashboardStats(req, res, next) {
  try {
    const stats = await adminStatsService.getDashboardStats();
    return successResponse(res, 'Admin dashboard stats retrieved', stats);
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboardStats };
