require('dotenv').config();

const app = require('./app');
const { validateRequiredEnv, getEnv } = require('./config/env');
// Initialize Firebase Admin
require('./config/firebaseAdmin');

let server;

function startup() {
  try {
    validateRequiredEnv();
  } catch (err) {
    console.error('[STARTUP] Environment validation failed:', err.message);
    process.exit(1);
  }

  const port = Number(getEnv('PORT', 5000));
  const nodeEnv = getEnv('NODE_ENV', 'development');
  const clientUrl = getEnv('CLIENT_URL') || '(not set)';
  const dbConfigured = Boolean(getEnv('DATABASE_URL'));

  server = app.listen(port, () => {
    console.log(`[SERVER] PoshanSetu API running`);
    console.log(`  · Environment : ${nodeEnv}`);
    console.log(`  · Port        : ${port}`);
    console.log(`  · Client URL  : ${clientUrl}`);
    console.log(`  · DB Config'd : ${dbConfigured ? 'yes' : 'no'}`);
    console.log(`  · Health      : GET /api/health`);
    console.log(`  · API v1      : GET /api/v1`);
  });

  server.on('error', (err) => {
    if (err.syscall !== 'listen') {
      throw err;
    }
    console.error('[SERVER] Failed to bind to port %d:', port, err.message);
    process.exit(1);
  });
}

function shutdown(signal) {
  console.log(`[SHUTDOWN] ${signal} received — closing server`);
  if (server) {
    server.close(async () => {
      try {
        const { closePool } = require('./config/db');
        await closePool();
      } catch (_) {
        // ignore pool close errors on shutdown
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startup();
