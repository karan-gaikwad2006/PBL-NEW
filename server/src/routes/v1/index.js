const express = require('express');
const { successResponse } = require('../../utils/response');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/users', userRoutes);

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
