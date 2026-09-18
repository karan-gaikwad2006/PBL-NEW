const cors = require('cors');
const { getEnv, isDevelopmentEnv } = require('../config/env');

function buildCorsConfig() {
  const clientUrl = getEnv('CLIENT_URL');
  const allowedOrigins = [];

  if (clientUrl) {
    allowedOrigins.push(clientUrl);
  }

  if (isDevelopmentEnv()) {
    allowedOrigins.push('http://localhost:5173');
    allowedOrigins.push('http://127.0.0.1:5173');
    allowedOrigins.push('http://localhost:3000');
  }

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || (isDevelopmentEnv() && isLocalDevelopmentOrigin(origin))) {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  };
}

function isLocalDevelopmentOrigin(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'http:') return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

    const octets = hostname.split('.').map(Number);
    if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
      return false;
    }

    return (
      octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168)
    );
  } catch (_) {
    return false;
  }
}

const corsMiddleware = () => cors(buildCorsConfig());

module.exports = {
  corsMiddleware,
  buildCorsConfig,
};
