const express = require('express');
const districtController = require('../../controllers/districtController');

const router = express.Router();

// Publicly accessible
router.get('/:id', districtController.getDistrictById);
router.get('/', districtController.getAllDistricts);

module.exports = router;
