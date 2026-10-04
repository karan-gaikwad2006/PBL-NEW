/**
 * AI Explanation Service — narrates facts that the deterministic matching engine
 * has ALREADY produced.
 *
 * TRUST BOUNDARY (enforced, not aspirational)
 * ───────────────────────────────────────────
 * This service may only REWORD supplied facts. It must never:
 *   - compute or alter a match score,
 *   - choose a food, nutrient, or nutrition recommendation,
 *   - invent a percentage, district, or citation that is not in its input.
 *
 * The deficiency-to-food mapping is the static read-only dataset at
 * `data reference/deficiency-seed-data-maharashtra.json`. The model never generates it.
 *
 * DATA ATTRIBUTION RULE (from the dataset's own framing_template)
 * ─────────────────────────────────────────────────────────────
 * When `dataSource === 'state_average_fallback'` the sentence MUST read
 * "Maharashtra state reports ..." and MUST state that district-specific data is not
 * yet available. A state-level number must never be presented as a district figure.
 * This branch is applied to the AI prompt AND to the non-AI fallback template.
 *
 * If the AI call fails for any reason, a deterministic template string is returned
 * with `source: 'fallback'` so the page degrades instead of breaking.
 */

const fs = require('fs');
const path = require('path');
const { isAiEnabled } = require('../config/env');
const { AIServiceError, generateText: defaultGenerateText } = require('./geminiClient');

const REFERENCE_PATH = path.resolve(
  __dirname,
  '../../data reference/deficiency-seed-data-maharashtra.json',
);

const STATE_AVERAGE_FALLBACK = 'state_average_fallback';
const DISTRICT_FACTSHEET = 'district_factsheet';
const STATE_NAME = 'Maharashtra';

const SOURCE_AI = 'ai';
const SOURCE_FALLBACK = 'fallback';

const MAX_TEXT_LENGTH = 300;

/**
 * Seed data uses legacy district names (Ahmednagar, Aurangabad, Osmanabad) while the
 * `districts` table uses the current official names. Both sides are folded onto one key
 * so a verified factsheet row is still recognised after the rename.
 */
const DISTRICT_NAME_ALIASES = Object.freeze({
  ahmednagar: 'ahilyanagar',
  ahmadnagar: 'ahilyanagar',
  ahilyanagar: 'ahilyanagar',
  aurangabad: 'chhatrapati sambhajinagar',
  'chhatrapati sambhajinagar': 'chhatrapati sambhajinagar',
  osmanabad: 'dharashiv',
  dharashiv: 'dharashiv',
  beed: 'beed',
  bid: 'beed',
  buldana: 'buldhana',
  buldhana: 'buldhana',
  gondiya: 'gondia',
  gondia: 'gondia',
  raigarh: 'raigad',
  raigad: 'raigad',
});

const EXPLANATION_SYSTEM_PROMPT = [
  'You are a writing assistant for PoshanSetu, a platform that connects food donors with institutions in Maharashtra, India.',
  'You turn facts that have ALREADY been computed by a deterministic matching engine into one short, friendly sentence for a donor.',
  '',
  'Hard rules — these are not negotiable:',
  '- Use ONLY the facts given in the user message. Never add a nutrition, health, or deficiency claim that is not present in the input.',
  '- Never introduce a number, percentage, district, food, nutrient, or source that is not in the input.',
  '- Never suggest a food, diet, supplement, or medical treatment. You are not a nutrition advisor.',
  '- Nutrition statistics are population-level. Never state or imply that a figure describes a specific individual, child, or institution.',
  '- If the input describes a figure as a Maharashtra state average, you must NOT attribute it to the named district.',
  '- Do not mention match scores, rankings, weights, urgency levels, or how the match was calculated.',
  '- Reply with exactly one sentence of plain text. No preamble, no bullet points, no quotation marks, no markdown, no emoji.',
].join('\n');

function canonicalDistrictKey(name) {
  const normalized = String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return '';
  return DISTRICT_NAME_ALIASES[normalized] || normalized;
}

function loadReference() {
  return JSON.parse(fs.readFileSync(REFERENCE_PATH, 'utf8'));
}

/**
 * Resolve whether a district's nutrition indicators are real district factsheet values
 * or the Maharashtra state-average placeholder.
 *
 * Derived from the read-only reference dataset, which documents this rule in
 * `_note_on_pending_districts`. Fails SAFE: anything not confidently identified as a
 * complete `district_factsheet` entry is reported as `state_average_fallback`, because
 * mislabelling real data as fallback only adds a caveat, whereas the reverse would
 * attribute a state number to a specific district.
 *
 * Note: Bhandara is present with `data_source: 'district_factsheet'` but is flagged
 * `incomplete: true` with null indicator values, so it is treated as a fallback too.
 *
 * @param {string} district
 * @param {object} [reference] Pre-loaded reference dataset (injected by tests).
 * @returns {'district_factsheet'|'state_average_fallback'}
 */
function resolveDataSource(district, reference = loadReference()) {
  const key = canonicalDistrictKey(district);
  if (!key) return STATE_AVERAGE_FALLBACK;

  const entries = Array.isArray(reference?.district_indicators) ? reference.district_indicators : [];
  const match = entries.find((entry) => canonicalDistrictKey(entry?.district) === key);

  if (!match) return STATE_AVERAGE_FALLBACK;
  if (match.data_source !== DISTRICT_FACTSHEET) return STATE_AVERAGE_FALLBACK;
  if (match.incomplete === true) return STATE_AVERAGE_FALLBACK;

  const indicators = Array.isArray(match.indicators) ? match.indicators : [];
  if (indicators.length === 0) return STATE_AVERAGE_FALLBACK;
  if (indicators.every((indicator) => indicator?.value === null || indicator?.value === undefined)) {
    return STATE_AVERAGE_FALLBACK;
  }

  return DISTRICT_FACTSHEET;
}

function cleanText(value, maxLength = MAX_TEXT_LENGTH) {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ');
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text;
}

/**
 * Coerce and validate caller-supplied narration inputs.
 * @returns {{district:string, indicatorName:string, indicatorValue:string, dataSource:string, nutrientCategory:string, institutionName:string, foodItem:string, quantity:string}}
 */
function normalizeInput(input = {}) {
  return {
    district: cleanText(input.district, 120) || 'this district',
    indicatorName: cleanText(input.indicatorName, 160) || 'the reported indicator',
    indicatorValue: cleanText(input.indicatorValue, 20),
    dataSource: input.dataSource === DISTRICT_FACTSHEET ? DISTRICT_FACTSHEET : STATE_AVERAGE_FALLBACK,
    nutrientCategory: cleanText(input.nutrientCategory, 120) || 'general dietary diversity',
    institutionName: cleanText(input.institutionName, 160) || 'The institution',
    foodItem: cleanText(input.foodItem, 120) || 'the requested item',
    quantity: cleanText(input.quantity, 40),
  };
}

/**
 * The indicator clause, which is the ONLY part that differs between the two
 * district-verified and state-fallback framings.
 */
function buildIndicatorSlot({ district, indicatorName, indicatorValue, dataSource }) {
  if (dataSource === STATE_AVERAGE_FALLBACK) {
    return `${STATE_NAME} state reports ${indicatorValue}% ${indicatorName}; ` +
      `district-specific data for ${district} is not yet available`;
  }
  return `${indicatorValue}% ${indicatorName}`;
}

function buildUserPrompt(input) {
  const { district, nutrientCategory, institutionName, quantity, foodItem } = input;
  const indicatorSlot = buildIndicatorSlot(input);
  return `Given: district="${district}", indicator="${indicatorSlot}",
recommended_category="${nutrientCategory}", matched_requirement="${institutionName}
needs ${quantity} ${foodItem}". Write one friendly sentence connecting these facts
for a donor. Do not add any nutrition claim not present in the input.`;
}

/**
 * Deterministic explanation built by plain string concatenation — no AI involved.
 * Carries exactly the same information as the prompt and honours the same
 * state-vs-district attribution rule.
 */
function buildFallbackExplanation(input) {
  const { district, indicatorName, indicatorValue, dataSource, nutrientCategory, institutionName, foodItem, quantity } = input;

  const indicatorClause = dataSource === STATE_AVERAGE_FALLBACK
    ? `${STATE_NAME} state reports ${indicatorValue}% ${indicatorName}; ` +
      `district-specific data for ${district} is not yet available.`
    : `${district} reports ${indicatorValue}% ${indicatorName}.`;

  return `${indicatorClause} ${institutionName} in ${district} has an active requirement for ` +
    `${quantity} ${foodItem}, listed under the ${nutrientCategory} category.`;
}

/** Tidy raw model output into a single plain-text sentence. */
function sanitizeExplanation(text) {
  let sentence = String(text || '')
    .replace(/```[a-z]*|```/gi, ' ')
    .replace(/[*_`#>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  sentence = sentence.replace(/^["'“”]+/, '').replace(/["'“”]+$/, '').trim();

  if (!/[.!?]$/.test(sentence)) {
    sentence += '.';
  }
  return sentence;
}

/**
 * Produce a donor-facing explanation of an existing match.
 *
 * @param {object} input
 * @param {string} input.district
 * @param {string} input.indicatorName
 * @param {string|number} input.indicatorValue
 * @param {string} input.dataSource 'district_factsheet' | 'state_average_fallback'
 * @param {string} input.nutrientCategory
 * @param {string} input.institutionName
 * @param {string} input.foodItem
 * @param {string|number} input.quantity
 * @param {object} [deps]
 * @param {Function} [deps.generateText] Injected text generator (tests).
 * @returns {Promise<{explanation: string, source: 'ai'|'fallback'}>}
 */
async function explainMatch(input = {}, deps = {}) {
  const normalized = normalizeInput(input);
  const fallback = { explanation: buildFallbackExplanation(normalized), source: SOURCE_FALLBACK };

  if (!isAiEnabled()) {
    return fallback;
  }

  const generateText = typeof deps.generateText === 'function' ? deps.generateText : defaultGenerateText;

  try {
    const raw = await generateText(EXPLANATION_SYSTEM_PROMPT, buildUserPrompt(normalized), {
      temperature: 0.3,
    });
    const explanation = sanitizeExplanation(raw);
    if (!explanation) {
      return fallback;
    }
    return { explanation, source: SOURCE_AI };
  } catch (error) {
    // AIServiceError is the expected path; any other throw is logged too so a real bug
    // is still visible, but the request still degrades gracefully rather than 500ing.
    const reason = error instanceof AIServiceError ? 'AI unavailable' : 'AI call failed';
    console.warn(`[AI] ${reason}, using deterministic template: ${error.message}`);
    return fallback;
  }
}

module.exports = {
  DISTRICT_FACTSHEET,
  STATE_AVERAGE_FALLBACK,
  EXPLANATION_SYSTEM_PROMPT,
  buildFallbackExplanation,
  buildIndicatorSlot,
  buildUserPrompt,
  explainMatch,
  loadReference,
  normalizeInput,
  resolveDataSource,
  sanitizeExplanation,
};
