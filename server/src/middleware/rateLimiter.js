/**
 * In-Memory Sliding-Window / Token-Bucket Rate Limiter Middleware.
 * No external Redis/heavy dependencies required.
 */
function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 20, // max requests per window
  message = 'Too many requests. Please slow down and try again later.',
  keyGenerator = (req) => req.user?.id || req.ip || req.connection.remoteAddress || 'global',
} = {}) {
  const store = new Map();

  // Periodic cleanup of expired entries every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return function rateLimitMiddleware(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
