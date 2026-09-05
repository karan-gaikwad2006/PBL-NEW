require('dotenv').config();

const express = require('express');

const { corsMiddleware } = require('./middleware/corsConfig');
const { securityHeaders } = require('./middleware/securityHeaders');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./routes/health');
const v1Routes = require('./routes/v1');

const app = express();

// Disable Express fingerprinting header
app.disable('x-powered-by');

// Security headers & CORS
app.use(securityHeaders);
app.use(corsMiddleware());
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/v1', v1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

