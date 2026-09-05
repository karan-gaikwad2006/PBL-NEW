const express = require('express');
const { successResponse } = require('../../utils/response');
const userRoutes = require('./userRoutes');
const institutionRoutes = require('./institutionRoutes');
const districtRoutes = require('./districtRoutes');
const requirementRoutes = require('./requirementRoutes');
const offerRoutes = require('./offerRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();


router.use('/users', userRoutes);
router.use('/institutions', institutionRoutes);
router.use('/districts', districtRoutes);
router.use('/requirements', requirementRoutes);
router.use('/offers', offerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);


router.get('/', (req, res) => {
  return successResponse(res, 'PoshanSetu API v1 — foundation active', {
    version: 'v1',
    status: 'active',
    endpoints: {
      root: 'GET /api/v1',
    },
  });
});

router.get('/status', (req, res) => {
  return successResponse(res, 'API v1 routing is operational', {
    ok: true,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
