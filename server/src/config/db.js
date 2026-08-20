const { Pool } = require('pg');

const { getEnv } = require('./env');

let pool = null;

function buildPoolConfig() {
  const databaseUrl = getEnv('DATABASE_URL');

  if (!databaseUrl) {
    return null;
  }

  const baseConfig = {
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  const isProduction = getEnv('NODE_ENV') === 'production';
  const urlRequiresSsl = databaseUrl.includes('sslmode=require') ||
    databaseUrl.includes('neon.tech') ||
    isProduction;

  if (urlRequiresSsl) {
    baseConfig.ssl = {
      rejectUnauthorized: true,
    };
  }

  return baseConfig;
}

function initPool() {
  const config = buildPoolConfig();
  if (!config) {
    return null;
  }
  pool = new Pool(config);

  pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
  });

  return pool;
}

function getPool() {
  if (!pool) {
    return initPool();
  }
  return pool;
}

async function query(text, params) {
  const dbPool = getPool();
  if (!dbPool) {
    throw new Error('Database pool is not initialized. DATABASE_URL may not be configured.');
  }
  return dbPool.query(text, params);
}

async function checkDatabaseConnection() {
  const dbPool = getPool();
  if (!dbPool) {
    return { configured: false, connected: false, status: 'not_configured' };
  }

  const client = await dbPool.connect();
  try {
    await client.query('SELECT 1 AS ok');
    return { configured: true, connected: true, status: 'connected' };
  } catch (err) {
    return { configured: true, connected: false, status: 'error' };
  } finally {
    client.release();
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  initPool,
  getPool,
  query,
  checkDatabaseConnection,
  closePool,
};
