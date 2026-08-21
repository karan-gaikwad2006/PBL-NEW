const { successResponse } = require('../utils/response');
const districtRepository = require('../repositories/districtRepository');

/**
 * Get all districts
 */
const getAllDistricts = async (req, res, next) => {
  try {
    const districts = await districtRepository.findAll();
    return successResponse(res, 'Districts retrieved successfully', districts);
  } catch (error) {
    next(error);
  }
};

const getDistrictById = async (req, res, next) => {
  try {
    const district = await districtRepository.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    return successResponse(res, 'District retrieved successfully', district);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDistricts,
  getDistrictById,
};
