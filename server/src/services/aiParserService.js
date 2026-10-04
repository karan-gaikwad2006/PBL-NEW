/**
 * AI Parser Service — turns a donor's free-text description into structured food items.
 *
 * TRUST BOUNDARY
 * ──────────────
 * Parsing only. This service must never score a match, judge nutritional adequacy, or
 * invent a food, quantity, or unit that the donor did not type.
 *
 * FAIL-SAFE DESIGN
 * ────────────────
 * The model is asked for JSON and the response is validated server-side. Anything that
 * is not cleanly parseable JSON yields an EMPTY ARRAY, never a partial guess. The
 * frontend then asks the donor to use the manual fields. An empty list is a safe,
 * honest outcome; a hallucinated quantity silently accepted by a donor is not.
 *
 * Any item whose quantity or unit is missing or vague is forced to
 * `confidence: 'low'` so the frontend can prompt the donor to confirm it rather than
 * silently accepting a guess.
 */

const { isAiEnabled } = require('../config/env');
const { generateText: defaultGenerateText } = require('./geminiClient');

const MAX_RAW_TEXT_LENGTH = 2000;
const MAX_PARSED_ITEMS = 10;

const CONFIDENCE_LEVELS = ['high', 'medium', 'low'];

const PARSER_SYSTEM_PROMPT = [
  'You extract structured food-donation line items from free text typed by a donor on PoshanSetu.',
  '',
  'Output format — follow exactly:',
  '- Reply with ONLY a JSON array. No prose, no explanation, no markdown code fences.',
  '- Each element must be an object with exactly these four keys:',
  '    "item"       : string  — the food name, cleaned up (e.g. "Moong Dal")',
  '    "quantity"   : number  — the numeric amount, or null if not stated',
  '    "unit"       : string  — the unit as written (e.g. "kg", "bags", "litres"), or null if not stated',
  '    "confidence" : "high" | "medium" | "low" — your own certainty in this line',
  '- Output an empty array [] if the text contains no food items.',
  '',
  'Hard rules:',
  '- Never invent a food, quantity, or unit that is not in the text.',
  '- If a quantity or unit is missing, vague ("some", "a lot", "few", "as required"), or ambiguous, set that field to null and set "confidence" to "low".',
  '- Never add any nutrition, health, or deficiency claim.',
  '- Never expand an abbreviation you are not certain about.',
  '',
  'Example',
  'Input: 5 kg moong dal and 2 bags rice, plus some jaggery',
  'Output: [{"item":"Moong Dal","quantity":5,"unit":"kg","confidence":"high"},{"item":"Rice","quantity":2,"unit":"bags","confidence":"high"},{"item":"Jaggery","quantity":null,"unit":null,"confidence":"low"}]',
].join('\n');

function isParseableJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pull a JSON array out of raw model output.
 *
 * Two stages, deliberately strict:
 *   1. If the response is JSON on its own terms it must BE an array. A JSON object
 *      (e.g. `{"items":[...]}`) is the wrong schema, so we return null rather than
 *      digging inside it for a nested array — that would be guessing at intent.
 *   2. Only if the response is not JSON at all do we recover the outermost bracketed
 *      span, which covers the common case of a model wrapping its array in prose.
 *
 * @returns {unknown[]|null} The parsed array, or null when it is not a valid JSON array.
 */
function extractJsonArray(rawText) {
  const text = String(rawText || '')
    .replace(/```json/gi, ' ')
    .replace(/```/g, ' ')
    .trim();

  if (!text) return null;

  if (isParseableJson(text)) {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : null;
  }

  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end <= start) return null;

  const candidate = text.slice(start, end + 1);
  if (!isParseableJson(candidate)) return null;

  const parsed = JSON.parse(candidate);
  return Array.isArray(parsed) ? parsed : null;
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeConfidence(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return CONFIDENCE_LEVELS.includes(normalized) ? normalized : null;
}

/**
 * Normalise one model-produced entry into the strict output shape.
 * Returns null when the entry has no usable food name.
 *
 * @returns {{item:string, quantity:number|null, unit:string|null, confidence:'high'|'medium'|'low'}|null}
 */
function coerceItem(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const item = String(raw.item ?? raw.name ?? '').trim().replace(/\s+/g, ' ');
  if (!item) return null;

  const quantity = toFiniteNumber(raw.quantity);
  const unit = typeof raw.unit === 'string' ? raw.unit.trim().replace(/\s+/g, ' ') : '';
  const reported = normalizeConfidence(raw.confidence);

  // Ambiguity is decided server-side, not taken on trust from the model.
  const isAmbiguous = quantity === null || quantity <= 0 || !unit;

  let confidence;
  if (isAmbiguous || reported === 'low') {
    confidence = 'low';
  } else {
    confidence = reported || 'medium';
  }

  return {
    item: item.slice(0, 120),
    quantity,
    unit: unit ? unit.slice(0, 40) : null,
    confidence,
  };
}

/**
 * Parse a donor's free-text food description into structured items.
 *
 * @param {string} rawText
 * @param {object} [deps]
 * @param {Function} [deps.generateText] Injected text generator (tests).
 * @returns {Promise<Array<{item:string, quantity:number|null, unit:string|null, confidence:'high'|'medium'|'low'}>>}
 *   Empty array when AI is disabled, the input is unusable, or the model output is
 *   not valid JSON. Never throws for malformed model output.
 */
async function parseFoodText(rawText, deps = {}) {
  const text = String(rawText || '').trim();
  if (!text) return [];
  if (text.length > MAX_RAW_TEXT_LENGTH) return [];
  if (!isAiEnabled()) return [];

  const generateText = typeof deps.generateText === 'function' ? deps.generateText : defaultGenerateText;

  let raw;
  try {
    raw = await generateText(PARSER_SYSTEM_PROMPT, `Donor text:\n"""\n${text}\n"""`, {
      temperature: 0,
      responseMimeType: 'application/json',
    });
  } catch (error) {
    console.warn(`[AI] Food-text parsing unavailable, asking donor to use manual fields: ${error.message}`);
    return [];
  }

  const parsed = extractJsonArray(raw);
  if (!parsed) {
    console.warn('[AI] Food-text parser returned non-JSON output; ignoring it rather than guessing.');
    return [];
  }

  return parsed
    .map(coerceItem)
    .filter(Boolean)
    .slice(0, MAX_PARSED_ITEMS);
}

module.exports = {
  MAX_PARSED_ITEMS,
  MAX_RAW_TEXT_LENGTH,
  PARSER_SYSTEM_PROMPT,
  coerceItem,
  extractJsonArray,
  parseFoodText,
};
