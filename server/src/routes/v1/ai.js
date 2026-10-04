const express = require('express');
const aiController = require('../../controllers/aiController');
const aiChatController = require('../../controllers/aiChatController');
const {
  verifyFirebaseToken,
  attachUser,
  requireAuthenticatedUser,
} = require('../../middleware/authMiddleware');

const { createRateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// All AI routes require a signed-in user, matching every other v1 resource router.
// These routes narrate or parse — they never expose private data beyond what the
// authenticated user could already read, and they never compute or alter a match.
const authChain = [verifyFirebaseToken, attachUser, requireAuthenticatedUser];

// Rate limit AFTER auth so the limiter keys on req.user.id and unauthenticated
// requests are rejected with 401 before ever consuming a slot.
const aiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many AI requests. Please wait a few minutes before trying again.',
});

// Chat is tighter than the explain/parse routes because it is conversational and
// easy to spam — 10 messages per minute per authenticated user.
const chatLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1-minute rolling window
  max: 10,                   // 10 messages per minute
  message: 'Too many chat messages. Please wait a moment before sending another.',
});

router.post('/explain', ...authChain, aiLimiter, aiController.explainMatch);

router.post('/parse-donation', ...authChain, aiLimiter, aiController.parseDonationText);

// POST /api/v1/ai/chat — conversational endpoint
// Requires auth. Rate-limited more tightly than explain/parse.
router.post('/chat', ...authChain, chatLimiter, aiChatController.chat);

module.exports = router;
