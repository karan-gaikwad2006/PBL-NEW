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
      if (!origin || allowedOrigins.includes(origin)) {
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

const corsMiddleware = () => cors(buildCorsConfig());

module.exports = {
  corsMiddleware,
  buildCorsConfig,
};
