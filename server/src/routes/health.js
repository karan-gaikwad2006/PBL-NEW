const express = require('express');
const { successResponse } = require('../utils/response');
const { checkDatabaseConnection } = require('../config/db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    let dbStatus = { status: 'not_configured', connected: false, configured: false };
    try {
      dbStatus = await checkDatabaseConnection();
    } catch (dbErr) {
      dbStatus = { configured: !!process.env.DATABASE_URL, connected: false, status: 'error' };
    }

    const data = {
      api: 'up',
      database: dbStatus.status,
      databaseConfigured: dbStatus.configured,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };

    return successResponse(res, 'API is healthy', data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
