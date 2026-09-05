const { isProductionEnv } = require('../config/env');

/**
 * Lightweight Security Headers Middleware.
 * Adds production-grade security headers to all responses.
 */
function securityHeaders(req, res, next) {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // Disable legacy XSS auditor in modern browsers (standard modern recommendation)
  res.setHeader('X-XSS-Protection', '0');

  // Control referrer information sent in requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict sensitive browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Cross-Origin isolation protections
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // HTTP Strict Transport Security (HSTS) in production
  if (isProductionEnv()) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

module.exports = { securityHeaders };
