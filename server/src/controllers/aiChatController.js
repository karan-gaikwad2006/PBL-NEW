/**
 * AI Chat Controller — thin transport layer for POST /api/v1/ai/chat.
 *
 * Contains no business logic: validates input, delegates to aiChatService,
 * shapes the response. The aiChatService owns all intent classification,
 * data retrieval, and AI narration.
 */

'use strict';

const { successResponse, AppError } = require('../utils/response');
const aiChatService = require('../services/aiChatService');

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 6; // mirrored from aiChatService for input trimming

/**
 * POST /api/v1/ai/chat
 *
 * Body: {
 *   message: string,                                   // required
 *   conversationHistory?: Array<{role, content}>,      // optional, last N turns
 *   location?: { lat: number, lng: number }            // optional
 * }
 *
 * Returns: {
 *   reply: string,
 *   source: 'ai' | 'fallback' | 'static',
 *   suggestedAction?: { type: 'navigate', path: string, label: string }
 * }
 */
async function chat(req, res, next) {
  try {
    const body = req.body || {};

    // ── Validate message ──────────────────────────────────────────────────
    const rawMessage = body.message;
    if (typeof rawMessage !== 'string' || !rawMessage.trim()) {
      throw new AppError('message is required and must be a non-empty string', 422);
    }
    const message = rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH);

    // ── Validate + sanitize conversation history ──────────────────────────
    const rawHistory = body.conversationHistory;
    let conversationHistory = [];
    if (Array.isArray(rawHistory)) {
      conversationHistory = rawHistory
        .filter(
          (turn) =>
            turn &&
            typeof turn === 'object' &&
            (turn.role === 'user' || turn.role === 'assistant') &&
            typeof turn.content === 'string' &&
            turn.content.trim()
        )
        .map((turn) => ({
          role: turn.role,
          // Truncate individual history entries to prevent prompt stuffing
          content: String(turn.content).trim().slice(0, MAX_MESSAGE_LENGTH),
        }))
        .slice(-MAX_HISTORY_TURNS);
    }

    // ── Validate optional location ────────────────────────────────────────
    let userLocation = null;
    if (body.location && typeof body.location === 'object') {
      const lat = Number(body.location.lat);
      const lng = Number(body.location.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        userLocation = { lat, lng };
      }
    }

    // ── Delegate to service ───────────────────────────────────────────────
    const result = await aiChatService.handleChatMessage({
      userMessage: message,
      conversationHistory,
      userLocation,
    });

    // ── Shape response ────────────────────────────────────────────────────
    const responseData = {
      reply: result.reply,
      source: result.source,
    };
    if (result.suggestedAction) {
      responseData.suggestedAction = result.suggestedAction;
    }

    return successResponse(res, 'Chat response generated', responseData);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  chat,
};
