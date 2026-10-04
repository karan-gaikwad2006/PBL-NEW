/**
 * Gemini Client — thin, dependency-free wrapper around the Google Gemini REST API.
 *
 * SCOPE / TRUST BOUNDARY
 * ──────────────────────
 * This client is a TRANSPORT layer only. It sends text to a model and returns text.
 * It must never be used to compute a match score, pick a food, or decide a nutrition
 * recommendation. Those are produced by the deterministic matching engine
 * (src/services/matchingEngine.js) and the static reference dataset
 * (data reference/deficiency-seed-data-maharashtra.json).
 *
 * Uses the platform-global fetch() (Node 18+) so no new dependency is introduced.
 */

const { getEnv, isAiEnabled } = require('../config/env');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── SINGLE SOURCE OF TRUTH FOR THE MODEL NAME ───────────────────────────────
// Production model: gemini-3.7-flash. One generation back from 3.8 Flash, chosen
// because it leaves more free-tier quota headroom for PoshanSetu's request volume.
// Nothing else in the codebase may hardcode a model string: every caller must go
// through getModel(), which resolves GEMINI_MODEL from the environment and falls
// back to this constant. See docs/PRD-PoshanSetu-MVP-v2.md (Gemini Flash, free tier).
//   - gemini-2.5-flash is retired (HTTP 404 "no longer available to new users").
//   - Set GEMINI_MODEL=gemini-flash-latest to auto-track the newest Flash instead.
const DEFAULT_MODEL = 'gemini-3.7-flash';
const DEFAULT_TIMEOUT_MS = 15000;

// Gemini 2.5+ Flash models spend "thinking" tokens from the SAME output budget as the
// answer, so the budget must cover thinking PLUS the answer, or the answer is silently
// cut off mid-sentence (finishReason MAX_TOKENS).
//
// !! RE-VALIDATE THIS BUDGET FOR THE CURRENT MODEL !!
// 1024 was raised as generic headroom after a truncation incident, but it was NOT
// validated against gemini-3.7-flash's actual behaviour. The original evidence
// (188 thought tokens + 8 answer tokens on a 200-token budget) was captured on
// 3.7 Flash, and thinking-token consumption is not guaranteed to be identical across
// Flash generations. Re-confirm with a single live call before trusting it:
//     npm run verify:ai -- --model-smoke-test
// If explanations still return MAX_TOKENS, RAISE this value — never lower it, since
// a too-small budget silently degrades every explanation to the fallback template.
const DEFAULT_MAX_OUTPUT_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.2;

// 503 UNAVAILABLE is a transient "high demand" spike. It is worth one short retry.
// 429 is NOT retried: the free tier answers bursts with 429, so retrying makes it worse.
const RETRYABLE_STATUSES = new Set([503]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1200;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Typed error for every failure path in this module.
 *
 * Callers MUST branch on this (see aiExplanationService) instead of receiving an
 * empty or malformed string. Returning bad text silently would let the model
 * present an unverified sentence as official district nutrition context.
 */
class AIServiceError extends Error {
  constructor(message, { status = null, cause = null } = {}) {
    super(message);
    this.name = 'AIServiceError';
    this.status = status;
    if (cause) this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Resolve the Gemini model to call. THE single resolution point for the model name.
 *
 * Precedence: an explicit per-call options.model (escape hatch, unused by the
 * services) > GEMINI_MODEL from the environment > DEFAULT_MODEL.
 *
 * Callers must use this (or the exported DEFAULT_MODEL) instead of repeating the
 * model literal, so changing production model stays a one-line change here.
 *
 * @returns {string} e.g. 'gemini-3.7-flash'
 */
function getModel() {
  return getEnv('GEMINI_MODEL', DEFAULT_MODEL) || DEFAULT_MODEL;
}

function getTimeoutMs() {
  const configured = Number(getEnv('GEMINI_TIMEOUT_MS', DEFAULT_TIMEOUT_MS));
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TIMEOUT_MS;
}

/** Pull the first usable text block out of a Gemini generateContent response. */
function extractResponseText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();
}

/**
 * Generate a single block of text with the Gemini Flash model.
 *
 * @param {string} systemPrompt Instructions that constrain the model's behaviour.
 * @param {string} userPrompt   The factual input the model may only work from.
 * @param {object} [options]
 * @param {number} [options.temperature=0.2]
 * @param {number} [options.maxOutputTokens=1024]
 * @param {string} [options.responseMimeType] e.g. 'application/json' to force JSON output.
 * @param {number} [options.model] Override the resolved model (escape hatch; prefer getModel()).
 * @param {number} [options.maxAttempts=3] Cap attempts. Pass 1 to disable the 503 retry —
 *   used by --model-smoke-test so a smoke run can never amplify into a quota burst.
 * @returns {Promise<string>} Non-empty, COMPLETE model text.
 * @throws {AIServiceError} If AI is disabled, the key is missing, the request fails, the
 *   response is blocked, the response is truncated (MAX_TOKENS), or it contains no text.
 */
async function generateText(systemPrompt, userPrompt, options = {}) {
  if (!isAiEnabled()) {
    throw new AIServiceError('AI layer is disabled (AI_ENABLED is false)');
  }

  const apiKey = getEnv('GEMINI_API_KEY');
  if (!apiKey) {
    throw new AIServiceError('GEMINI_API_KEY is not configured');
  }

  const model = options.model || getModel();
  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent`;

  const maxAttempts = Number.isInteger(options.maxAttempts) && options.maxAttempts > 0
    ? Math.min(options.maxAttempts, MAX_ATTEMPTS)
    : MAX_ATTEMPTS;

  const generationConfig = {
    temperature: Number.isFinite(options.temperature) ? options.temperature : DEFAULT_TEMPERATURE,
    maxOutputTokens: Number.isFinite(options.maxOutputTokens) ? options.maxOutputTokens : DEFAULT_MAX_OUTPUT_TOKENS,
  };
  if (options.responseMimeType) {
    generationConfig.responseMimeType = options.responseMimeType;
  }

  const requestBody = {
    systemInstruction: { parts: [{ text: String(systemPrompt || '') }] },
    contents: [{ role: 'user', parts: [{ text: String(userPrompt || '') }] }],
    generationConfig,
  };

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestOnce(url, apiKey, requestBody);
    } catch (error) {
      lastError = error;

      const retryable = error instanceof AIServiceError && RETRYABLE_STATUSES.has(error.status);
      if (!retryable || attempt === maxAttempts) {
        throw error;
      }
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError;
}

async function requestOnce(url, apiKey, requestBody) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(getTimeoutMs()),
    });
  } catch (error) {
    throw new AIServiceError(`Gemini request failed: ${error.message}`, { cause: error });
  }

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.text()).slice(0, 300);
    } catch {
      detail = '(unreadable error body)';
    }
    throw new AIServiceError(`Gemini API returned HTTP ${response.status}: ${detail}`, {
      status: response.status,
    });
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new AIServiceError('Gemini API returned a non-JSON response body', { cause: error });
  }

  const blockReason = payload?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new AIServiceError(`Gemini request was blocked: ${blockReason}`);
  }

  const finishReason = payload?.candidates?.[0]?.finishReason;
  const text = extractResponseText(payload);

  // A truncated response is NOT usable text. Gemini reports this as MAX_TOKENS, and the
  // partial fragment ("In Nashik, where.") looks like a real sentence to the caller, so
  // returning it would present a broken explanation as official nutrition context.
  // Fail loudly instead and let the caller fall back.
  if (finishReason === 'MAX_TOKENS') {
    throw new AIServiceError(
      `Gemini response was truncated (finishReason: MAX_TOKENS, maxOutputTokens was exhausted). ` +
      `Partial text discarded: ${JSON.stringify(text.slice(0, 120))}`,
    );
  }

  if (!text) {
    throw new AIServiceError(`Gemini returned an empty response (finishReason: ${finishReason || 'unknown'})`);
  }

  return text;
}

module.exports = {
  AIServiceError,
  DEFAULT_MODEL,
  MAX_ATTEMPTS,
  generateText,
  getModel,
};
