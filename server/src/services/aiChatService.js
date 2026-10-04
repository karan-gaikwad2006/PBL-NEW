/**
 * AI Chat Service — conversational endpoint for PoshanSetu.
 *
 * DESIGN PRINCIPLES (non-negotiable)
 * ────────────────────────────────────────────────────────
 * 1. RETRIEVAL-GROUNDED: Every factual claim in a reply traces back to a live
 *    data lookup (matching engine, district repo, institution repo). The LLM may
 *    only REWORD facts already returned from those sources, never invent them.
 *
 * 2. INTENT CLASSIFICATION IS RULE-BASED: Classification uses only keyword /
 *    pattern rules — no AI call. This ensures out_of_scope is handled
 *    deterministically and the LLM is never invoked for it.
 *
 * 3. OUT_OF_SCOPE → STATIC RESPONSE: Health/medical personal questions and
 *    bypass-verification requests get a fixed string. The LLM is never called for
 *    these, so there is no chance of the model improvising around a soft refusal.
 *
 * 4. CONVERSATION HISTORY CAPPED: Accept last N turns (max 6) for natural follow-up
 *    context. But every factual sentence must still trace to a live lookup, not to
 *    history alone.
 *
 * 5. FAIL SAFE: Any AIServiceError from underlying services returns the defined
 *    FALLBACK_REPLY text with source:'fallback'. Never re-throws to the caller.
 */

'use strict';

const { AIServiceError, generateText: defaultGenerateText } = require('./geminiClient');
const { isAiEnabled } = require('../config/env');
const aiParserService = require('./aiParserService');
const matchingEngine = require('./matchingEngine');
const requirementRepository = require('../repositories/requirementRepository');
const districtRepository = require('../repositories/districtRepository');
const institutionRepository = require('../repositories/institutionRepository');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_HISTORY_TURNS = 6;
const MAX_MESSAGE_LENGTH = 500;

const SOURCE_AI = 'ai';
const SOURCE_FALLBACK = 'fallback';
const SOURCE_STATIC = 'static';

const FALLBACK_REPLY =
  "I'm having trouble reaching that right now — try the Explore or Food Matching " +
  'pages directly, or ask again in a moment.';

/** Intent categories — order matters: medical/bypass are checked first. */
const INTENT = Object.freeze({
  OUT_OF_SCOPE: 'out_of_scope',
  FIND_DONATION_LOCATION: 'find_donation_location',
  DESCRIBE_SUPPLY: 'describe_supply',
  DISTRICT_INFO: 'district_info',
  INSTITUTION_STATUS: 'institution_status',
  GENERAL_HELP: 'general_help',
});

// ─── STATIC RESPONSES (never routed to the LLM) ──────────────────────────────

const OUT_OF_SCOPE_RESPONSES = Object.freeze({
  medical: [
    "I'm not able to give medical or nutritional advice for individual people.",
    'For health concerns, please consult a doctor, ASHA worker, or Anganwadi / ANM worker.',
    'PoshanSetu connects food donors with institutions — it does not provide medical guidance.',
  ].join(' '),
  bypass: [
    'Verification on PoshanSetu is required for all institutions to ensure trust and accountability.',
    'I cannot help with bypassing or shortcutting the verification process.',
    'If you believe there is an error in your verification status, please contact the admin team.',
  ].join(' '),
  default: [
    "That's outside what I can help with here.",
    'I can answer questions about where to donate food, what districts need, or how to find food matching.',
    'Is there something along those lines I can help you with?',
  ].join(' '),
});

// ─── SYSTEM PROMPT FOR CHAT REPLIES ──────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = [
  'You are a helpful assistant for PoshanSetu, a platform that connects food donors with institutions in Maharashtra, India.',
  'Your role is to PRESENT facts that have ALREADY been retrieved from a live database.',
  '',
  'Hard rules (enforced, not aspirational):',
  '- Use ONLY the data provided in the user message. Never add any number, district, institution, or food item not given to you.',
  '- Never invent a nutrition claim, percentage, citation, or recommendation.',
  '- Nutrition statistics are population-level. Never apply them to a specific person or child.',
  '- If asked about health, medical conditions, or personal nutrition, decline gracefully and refer to a doctor or ANM worker.',
  '- Keep responses concise (2–4 sentences). Be friendly, clear, and direct.',
  '- If a suggestedAction is included in the data, mention it naturally.',
  '- Do not mention match scores, rankings, or how the algorithm works.',
  '- Reply in plain text only. No markdown, no bullet points, no emoji.',
].join('\n');

// ─── INTENT CLASSIFICATION (rule-based, NO AI calls) ─────────────────────────

/** Patterns that indicate medical / personal health questions. */
const MEDICAL_PATTERNS = [
  /\b(my child|my son|my daughter|my baby|my infant|my kid)\b/i,
  /\b(diagnosis|diagnosed|symptoms?|treatment|medicine|medication|malnutrit\w+|anemi[ac]|deficien\w+)\b/i,
  /\b(is my|does my|should (i|my)|can (i|my))\b.*\b(eat|take|drink|get)\b/i,
  /\bdoctor\b.*\brecommend\b/i,
  /\bwhat should (i|my \w+) eat\b/i,
  /\b(cure|treatment|therapy|supplement) for\b/i,
];

/** Patterns that indicate attempts to bypass verification. */
const BYPASS_PATTERNS = [
  /\bbypass\b.{0,60}\bverif\w*/i,
  /\bskip\b.{0,40}\bverif\w*/i,
  /\bwithout\b.{0,30}\b(documents?|verif\w+)/i,
  /\b(how (do|can|to) (i|we|they) get (verified|approved) (faster|quickly|without|immediately))\b/i,
  /\b(fake|forge|falsif\w+) (documents?|verif\w+)\b/i,
  /\bapprove (us|me|our) (without|anyway)\b/i,
];

/** Patterns indicating the user wants to find where to donate. */
const FIND_DONATION_PATTERNS = [
  /\b(where (can|should|do) (i|we) donate)\b/i,
  /\b(who needs|who is (looking for|requesting))\b/i,
  /\b(find (a |an )?(institution|school|organisation|organization|place|location))\b.*\b(donate|send|give|deliver)\b/i,
  /\b(donate|give|contribute)\b.*\b(food|rice|dal|wheat|grain|milk|oil|jaggery)\b/i,
  /\bneeds? (rice|dal|wheat|grain|food|milk|oil|jaggery|ragi|bajra|jowar|moong|chana)\b/i,
  /\b(looking for|want to) (donate|contribute|help with food)\b/i,
];

/** Patterns indicating the user has specific food items and wants to match them. */
const DESCRIBE_SUPPLY_PATTERNS = [
  /\b(i have|we have|i('ve| have) got)\b.{1,60}\b(kg|bags?|litres?|liters?|quintals?|packets?|cans?|tonnes?)\b/i,
  /\b(i('m| am) donating|i want to donate)\b.*\b(kg|bags?|litres?|quintals?)\b/i,
  /\b(excess|surplus|leftover|spare|extra)\b.*\b(food|rice|dal|wheat|grain|oil|milk)\b/i,
  /\b(supply|offer)\b.{1,40}\b(kg|bags?|litre|quintal)\b/i,
];

/** Patterns indicating questions about a specific district's nutritional situation. */
const DISTRICT_INFO_PATTERNS = [
  /\b(what does|what is the (situation|condition|status|need) in)\b.*\b(district|taluka)?\b/i,
  /\b(district|taluka)\b.{1,60}\b(need|nutrition|deficien\w+|indicator|attention|situation)\b/i,
  /\b(tell me about|information (on|about)|details (on|about))\b.{1,80}\b(district)\b/i,
  /\bnutrition (in|for|of)\b.*\b(district|taluka|maharashtra)\b/i,
  /\b(ahmednagar|pune|nashik|aurangabad|nagpur|solapur|kolhapur|satara|sangli|raigad|thane|jalgaon|akola|amravati|yavatmal|wardha|nanded|osmanabad|latur|beed|hingoli|parbhani|jalna|buldhana|washim|gadchiroli|gondia|bhandara|chandrapur|ratnagiri|sindhudurg|dhule|nandurbar|ahmadnagar|ahilyanagar|dharashiv|chhatrapati sambhajinagar)\b/i,
];

/** Patterns indicating questions about a specific institution. */
const INSTITUTION_STATUS_PATTERNS = [
  /\b(is|are)\b.{1,60}\b(institution|school|ashram|organisation|organization|ngo)\b.{0,40}\b(verified|approved|registered|trusted|legitimate)\b/i,
  /\b(verification status|verification (of|for))\b/i,
  /\b(trusted|legitimate|approved|verified)\b.{1,60}\b(institution|school|ashram|organisation|organization|ngo)\b/i,
  /\bcheck (the )?(status|verification)\b.{0,50}\b(institution|school|ashram)\b/i,
];

/**
 * Rule-based intent classification. Runs synchronously, no AI call.
 * Returns one of the INTENT constants.
 *
 * @param {string} message
 * @returns {string} INTENT constant
 */
function classifyIntent(message) {
  if (!message || typeof message !== 'string') return INTENT.GENERAL_HELP;
  const text = message.trim();

  // Medical must be checked BEFORE find_donation so "can my child get rice" is
  // caught as medical/personal rather than triggering a food-match.
  for (const pattern of MEDICAL_PATTERNS) {
    if (pattern.test(text)) return INTENT.OUT_OF_SCOPE;
  }
  for (const pattern of BYPASS_PATTERNS) {
    if (pattern.test(text)) return INTENT.OUT_OF_SCOPE;
  }

  // describe_supply before find_donation: "I have 50 kg rice to donate" is a supply offer.
  for (const pattern of DESCRIBE_SUPPLY_PATTERNS) {
    if (pattern.test(text)) return INTENT.DESCRIBE_SUPPLY;
  }
  for (const pattern of FIND_DONATION_PATTERNS) {
    if (pattern.test(text)) return INTENT.FIND_DONATION_LOCATION;
  }
  for (const pattern of DISTRICT_INFO_PATTERNS) {
    if (pattern.test(text)) return INTENT.DISTRICT_INFO;
  }
  for (const pattern of INSTITUTION_STATUS_PATTERNS) {
    if (pattern.test(text)) return INTENT.INSTITUTION_STATUS;
  }

  return INTENT.GENERAL_HELP;
}

/**
 * Determine the appropriate out_of_scope static response sub-type.
 * @param {string} message
 * @returns {string} static reply text
 */
function getOutOfScopeReply(message) {
  for (const pattern of MEDICAL_PATTERNS) {
    if (pattern.test(message)) return OUT_OF_SCOPE_RESPONSES.medical;
  }
  for (const pattern of BYPASS_PATTERNS) {
    if (pattern.test(message)) return OUT_OF_SCOPE_RESPONSES.bypass;
  }
  return OUT_OF_SCOPE_RESPONSES.default;
}

// ─── RETRIEVAL HELPERS ────────────────────────────────────────────────────────

/**
 * Extract location information from the message to help with matching.
 * Returns { district, taluka } where available, falls back to userLocation.
 */
function extractLocationFromMessage(message, userLocation) {
  // Extract explicit Maharashtra district names from message.
  const maharashtraDistricts = [
    'ahmednagar', 'ahilyanagar', 'akola', 'amravati', 'aurangabad', 'beed',
    'bhandara', 'buldhana', 'chandrapur', 'chhatrapati sambhajinagar', 'dhule',
    'gadchiroli', 'gondia', 'hingoli', 'jalgaon', 'jalna', 'kolhapur', 'latur',
    'mumbai', 'nagpur', 'nanded', 'nandurbar', 'nashik', 'osmanabad', 'dharashiv',
    'palghar', 'parbhani', 'pune', 'raigad', 'ratnagiri', 'sangli', 'satara',
    'sindhudurg', 'solapur', 'thane', 'wardha', 'washim', 'yavatmal',
  ];
  const lower = message.toLowerCase();
  const foundDistrict = maharashtraDistricts.find((d) => lower.includes(d));
  return foundDistrict
    ? { district: foundDistrict, ...(userLocation || {}) }
    : (userLocation || null);
}

/**
 * Run the matching engine with parsed food items from the message.
 * Returns top 3 results.
 */
async function runFoodMatching(message, location) {
  let parsedItems = [];
  try {
    parsedItems = await aiParserService.parseFoodText(message);
  } catch {
    // Parser failure is non-fatal; proceed with empty items
  }

  const donorInput = {
    foodItems: parsedItems.map((item) => ({ item: item.item, quantity: item.quantity, unit: item.unit })),
    location: location && location.lat && location.lng
      ? { lat: Number(location.lat), lng: Number(location.lng) }
      : null,
  };

  const results = await matchingEngine.matchRequirements(donorInput, {
    requirementRepository,
    maxResults: 3,
  });
  return { parsedItems, results };
}

/**
 * Fetch district nutrition data. Tries by name first, falls back to findAll search.
 */
async function fetchDistrictData(message) {
  const location = extractLocationFromMessage(message, null);
  if (!location?.district) return null;

  const districtName = location.district;
  // Try to find by slug (normalized lowercase)
  const slug = districtName.toLowerCase().replace(/\s+/g, '-');
  let district = await districtRepository.findById(slug);
  if (!district) {
    // Try plain name lookup
    district = await districtRepository.findById(districtName);
  }
  if (!district) {
    // Search all districts for a match
    const all = await districtRepository.findAll();
    district = all.find((d) => d.name.toLowerCase().includes(districtName.toLowerCase())) || null;
  }
  return district;
}

/**
 * Search institutions by name fragment. Returns up to 3 matches.
 */
async function findInstitutionsByName(message) {
  // Extract a likely institution name from the message (simple heuristic: quoted string or capitalised words)
  const quoted = message.match(/["']([^"']+)["']/);
  const searchTerm = quoted ? quoted[1] : message.replace(/is|are|the|institution|school|verified|approved|legitimate|registered/gi, '').trim().slice(0, 60);
  if (!searchTerm) return [];

  // institutionRepository.findAllForAdmin supports no status filter to get all
  const all = await institutionRepository.findAllForAdmin({ limit: 100 });
  return all.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3);
}

// ─── PROMPT BUILDERS ──────────────────────────────────────────────────────────

function buildMatchingPrompt(parsedItems, matchResults, userMessage) {
  const items = parsedItems.map((i) => `${i.item}${i.quantity ? ` (${i.quantity} ${i.unit || ''})` : ''}`).join(', ');
  const matches = matchResults.slice(0, 3).map((m, idx) => {
    const req = m.requirement;
    const itemNames = (req.items || []).map((it) => `${it.name} (${it.quantityRemaining} ${it.unit} needed)`).join(', ');
    return `${idx + 1}. ${req.institutionName} in ${req.district}${req.city ? ', ' + req.city : ''}: needs ${itemNames}. Urgency: ${req.urgency}.`;
  }).join('\n');

  return [
    `Donor message: "${userMessage}"`,
    items ? `Parsed food items: ${items}` : 'No specific food items parsed — show general matches.',
    '',
    matchResults.length === 0
      ? 'No live matching requirements found in the database right now.'
      : `Top ${matchResults.length} matching requirement(s) from the live database:\n${matches}`,
    '',
    'Present these live results to the donor in 2–3 friendly sentences. If there are matches, name the institutions and districts. If no matches, suggest they try the Food Matching page for more options.',
    'suggestedAction: { "type": "navigate", "path": "/food-match", "label": "Open Food Matching" }',
  ].join('\n');
}

function buildDistrictPrompt(district, userMessage) {
  const topIndicators = (district.nutritionIndicators || [])
    .filter((ind) => ind.value !== null && ind.value !== undefined)
    .slice(0, 4)
    .map((ind) => `${ind.name}: ${ind.value}${ind.unit || '%'}`)
    .join(', ');

  return [
    `Donor message: "${userMessage}"`,
    `District: ${district.name} (Maharashtra)`,
    topIndicators
      ? `Nutrition indicators (official NFHS-5 data): ${topIndicators}`
      : 'No district-specific nutrition indicators available — Maharashtra state average applies.',
    `Nutrition attention level: ${district.nutritionAttention?.level || 'unknown'}`,
    '',
    'Describe the district nutrition situation using ONLY the indicators above. Use 2–3 sentences. These are population-level statistics, do not apply them to individuals.',
    'suggestedAction: { "type": "navigate", "path": "/explore", "label": "Explore Needs Map" }',
  ].join('\n');
}

function buildInstitutionStatusPrompt(institutions, userMessage) {
  if (institutions.length === 0) {
    return [
      `Donor message: "${userMessage}"`,
      'No institutions matching that name were found in the PoshanSetu database.',
      'Tell the user no institution with that name was found, and suggest they try searching on the Explore page.',
      'suggestedAction: { "type": "navigate", "path": "/explore", "label": "Explore Needs" }',
    ].join('\n');
  }
  const lines = institutions.map((inst) =>
    `"${inst.name}" (${inst.type || 'institution'}) in ${inst.districtName || 'Maharashtra'}: verification_status = ${inst.verificationStatus}`
  ).join('\n');
  return [
    `Donor message: "${userMessage}"`,
    'Institution verification status from the live database:',
    lines,
    '',
    'State the verification status plainly. If verified, say so. If pending or rejected, say so without guessing why. Keep it to 1–2 sentences.',
  ].join('\n');
}

function buildGeneralHelpPrompt(userMessage) {
  return [
    `User message: "${userMessage}"`,
    'Context: PoshanSetu connects food donors with institutions in Maharashtra that have active food requirements.',
    'Main features: Explore Needs map, Food Matching (donor can describe food and get matched), District Insights, Requirement submission (institutions).',
    '',
    'Answer the user\'s question or greet them using only the context above. Suggest the most relevant page if applicable.',
    'Keep to 2–3 sentences.',
  ].join('\n');
}

// ─── HISTORY FORMATTING ───────────────────────────────────────────────────────

/**
 * Format conversation history into a context string for the system prompt.
 * Capped at MAX_HISTORY_TURNS most-recent turns.
 */
function formatHistory(conversationHistory) {
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) return '';
  const turns = conversationHistory
    .filter((turn) => turn && typeof turn.role === 'string' && typeof turn.content === 'string')
    .slice(-MAX_HISTORY_TURNS);
  if (turns.length === 0) return '';
  return '\n\nConversation so far:\n' + turns.map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.content}`).join('\n');
}

// ─── SUGGESTED ACTION EXTRACTION ─────────────────────────────────────────────

/**
 * Parse a suggestedAction from the model response if the model echoed one back.
 * Falls back to a per-intent default.
 */
function parseSuggestedAction(rawText, intent) {
  // Look for JSON-like suggestedAction in the text (model may echo it back)
  const match = rawText.match(/suggestedAction:\s*(\{[^}]+\})/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1].replace(/'/g, '"'));
      if (parsed.type === 'navigate' && typeof parsed.path === 'string') {
        return { type: 'navigate', path: parsed.path, label: parsed.label || 'Open' };
      }
    } catch {
      // ignore parse error
    }
  }
  // Per-intent defaults
  const defaults = {
    [INTENT.FIND_DONATION_LOCATION]: { type: 'navigate', path: '/food-match', label: 'Open Food Matching' },
    [INTENT.DESCRIBE_SUPPLY]: { type: 'navigate', path: '/food-match', label: 'Open Food Matching' },
    [INTENT.DISTRICT_INFO]: { type: 'navigate', path: '/explore', label: 'Explore Needs Map' },
    [INTENT.INSTITUTION_STATUS]: { type: 'navigate', path: '/explore', label: 'Explore Needs' },
    [INTENT.GENERAL_HELP]: { type: 'navigate', path: '/how-it-works', label: 'How It Works' },
  };
  return defaults[intent] || null;
}

/** Strip the embedded suggestedAction JSON from the reply text before sending. */
function sanitizeReplyText(text) {
  return text
    .replace(/suggestedAction:\s*\{[^}]+\}/gi, '')
    .trim();
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * Handle a single chat message turn.
 *
 * @param {object} params
 * @param {string} params.userMessage        The user's current message.
 * @param {Array}  params.conversationHistory Array of { role, content } turns (capped internally to MAX_HISTORY_TURNS).
 * @param {object} [params.userLocation]     Optional { lat, lng } from the client.
 * @param {object} [deps]                    Dependency injection (for tests).
 * @param {Function} [deps.generateText]     Injected text generator.
 * @returns {Promise<{reply: string, source: 'ai'|'fallback'|'static', suggestedAction?: object}>}
 */
async function handleChatMessage({ userMessage, conversationHistory = [], userLocation = null } = {}, deps = {}) {
  const message = String(userMessage || '').trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!message) {
    return { reply: "I didn't catch that — could you try rephrasing?", source: SOURCE_STATIC };
  }

  // ── Step 1: Classify intent (rule-based, no AI) ───────────────────────────
  const intent = classifyIntent(message);

  // ── Step 2: Handle out_of_scope with static response ─────────────────────
  // IMPORTANT: the LLM is NEVER called for out_of_scope messages.
  if (intent === INTENT.OUT_OF_SCOPE) {
    return { reply: getOutOfScopeReply(message), source: SOURCE_STATIC };
  }

  // ── Step 3: Data retrieval (retrieval-grounded, per-intent) ───────────────
  let userPrompt;
  try {
    switch (intent) {
      case INTENT.FIND_DONATION_LOCATION:
      case INTENT.DESCRIBE_SUPPLY: {
        const location = extractLocationFromMessage(message, userLocation);
        const { parsedItems, results } = await runFoodMatching(message, location);
        userPrompt = buildMatchingPrompt(parsedItems, results, message);
        break;
      }

      case INTENT.DISTRICT_INFO: {
        const district = await fetchDistrictData(message);
        if (!district) {
          return {
            reply: "I couldn't find nutrition data for that district. Try searching on the Explore Needs map.",
            source: SOURCE_FALLBACK,
            suggestedAction: { type: 'navigate', path: '/explore', label: 'Explore Needs Map' },
          };
        }
        userPrompt = buildDistrictPrompt(district, message);
        break;
      }

      case INTENT.INSTITUTION_STATUS: {
        const institutions = await findInstitutionsByName(message);
        userPrompt = buildInstitutionStatusPrompt(institutions, message);
        break;
      }

      case INTENT.GENERAL_HELP:
      default:
        userPrompt = buildGeneralHelpPrompt(message);
        break;
    }
  } catch (err) {
    console.warn('[aiChatService] Data retrieval failed:', err.message);
    return { reply: FALLBACK_REPLY, source: SOURCE_FALLBACK };
  }

  // ── Step 4: AI narration call ─────────────────────────────────────────────
  if (!isAiEnabled()) {
    // When AI is disabled, return a plain data-only fallback based on intent.
    return {
      reply: FALLBACK_REPLY,
      source: SOURCE_FALLBACK,
      suggestedAction: parseSuggestedAction('', intent),
    };
  }

  const generateText = typeof deps.generateText === 'function' ? deps.generateText : defaultGenerateText;
  const historyContext = formatHistory(conversationHistory);
  const systemPromptWithHistory = CHAT_SYSTEM_PROMPT + historyContext;

  let rawText;
  try {
    rawText = await generateText(systemPromptWithHistory, userPrompt, { temperature: 0.4 });
  } catch (err) {
    const reason = err instanceof AIServiceError ? 'AI unavailable' : 'AI call failed';
    console.warn(`[aiChatService] ${reason}: ${err.message}`);
    return {
      reply: FALLBACK_REPLY,
      source: SOURCE_FALLBACK,
      suggestedAction: parseSuggestedAction('', intent),
    };
  }

  const suggestedAction = parseSuggestedAction(rawText, intent);
  const reply = sanitizeReplyText(rawText);

  return { reply: reply || FALLBACK_REPLY, source: SOURCE_AI, suggestedAction };
}

module.exports = {
  // Primary export
  handleChatMessage,

  // Exported for unit testing
  INTENT,
  MAX_HISTORY_TURNS,
  classifyIntent,
  getOutOfScopeReply,
  sanitizeReplyText,
  parseSuggestedAction,
  FALLBACK_REPLY,
  OUT_OF_SCOPE_RESPONSES,
};
