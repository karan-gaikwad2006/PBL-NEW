const REQUIRED_VARS = [
  'PORT',
  'NODE_ENV',
  'CLIENT_URL',
];

const REQUIRED_FOR_DB = [
  'DATABASE_URL',
];

const REQUIRED_FOR_FIREBASE = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

function parseNodeEnv(value) {
  const env = (value || 'development').toLowerCase();
  if (['development', 'test', 'production'].includes(env)) {
    return env;
  }
  return 'development';
}

function validateRequiredEnv() {
  const parsed = {};
  const missing = [];

  process.env.NODE_ENV = parseNodeEnv(process.env.NODE_ENV);
  parsed.NODE_ENV = process.env.NODE_ENV;

  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }
  parsed.PORT = String(process.env.PORT);

  if (!process.env.CLIENT_URL) {
    if (isProductionEnv()) {
      missing.push('CLIENT_URL');
    } else {
      process.env.CLIENT_URL = 'http://localhost:5173';
      parsed.CLIENT_URL = process.env.CLIENT_URL;
    }
  } else {
    parsed.CLIENT_URL = process.env.CLIENT_URL;
  }

  const isProduction = parsed.NODE_ENV === 'production';

  REQUIRED_FOR_DB.forEach((varName) => {
    const value = process.env[varName];
    if (isProduction && !value) {
      missing.push(varName);
    }
  });

  REQUIRED_FOR_FIREBASE.forEach((varName) => {
    const value = process.env[varName];
    if (isProduction && !value) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}. ` +
      `Check server/.env and copy from server/.env.example if needed.`;
    throw new Error(msg);
  }

  return parsed;
}

function getEnv(varName, fallback) {
  const value = process.env[varName];
  if (value === undefined || value === null || value === '') {
    return fallback !== undefined ? fallback : null;
  }
  return value;
}

function isProductionEnv() {
  return getEnv('NODE_ENV', 'development') === 'production';
}

function isDevelopmentEnv() {
  return getEnv('NODE_ENV', 'development') === 'development';
}

module.exports = {
  validateRequiredEnv,
  getEnv,
  isProductionEnv,
  isDevelopmentEnv,
};
