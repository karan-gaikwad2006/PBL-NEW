/**
 * ============================================================
 * PoshanSetu — AI Explanation + Free-Text Parsing Layer: Test Suite
 * ============================================================
 * Companion to test/testRunner.js (SPPU Software Testing Report). Kept as a SEPARATE
 * file so the original 9-suite runner and its submitted report stay untouched.
 *
 * Testing Types Covered:
 * ┌─────┬──────────────────────────┬──────────────────────────────────────────────┐
 * │Suite│ Testing Type             │ What is Verified                             │
 * ├─────┼──────────────────────────┼──────────────────────────────────────────────┤
 * │  1  │ Unit Testing             │ District-verified vs state-fallback prompt   │
 * │  2  │ Unit Testing             │ Deterministic fallback on AIServiceError     │
 * │  3  │ Unit Testing             │ Parser returns valid, server-validated JSON  │
 * │  4  │ Unit Testing             │ Parser degrades on malformed AI output       │
 * │  5  │ Unit Testing             │ Transport guards: truncation, 503, 429      │
 * │  6  │ Integration Testing      │ Both /api/v1/ai routes return 401            │
 * └─────┴──────────────────────────┴──────────────────────────────────────────────┘
 *
 * Run: npm run test:ai (from server/)
 *
 * Precondition: Suites 1–5 are pure unit tests and need NO server, NO database and
 * NO Gemini API key — Suite 5 stubs global.fetch. Suite 6 needs the backend
 * running on localhost:5000 and is reported as SKIPPED if it is not reachable.
 */

const http = require('http');

// Determinism: enable the AI layer explicitly so the isAiEnabled() default
// (dev on / production off) cannot change the outcome of these tests.
process.env.AI_ENABLED = 'true';

const geminiClient = require('../src/services/geminiClient');
const { AIServiceError } = geminiClient;
const aiExplanationService = require('../src/services/aiExplanationService');
const aiParserService = require('../src/services/aiParserService');

const TEST_PORT = Number(process.env.TEST_PORT || 5000);

let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

/**
 * assert(condition, message)
 * Mirrors the helper in testRunner.js exactly: prints the result, updates the global
 * counters, and throws on failure so the current block halts instead of reporting
 * misleading downstream results from a broken precondition.
 */
function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failedTests++;
    throw new Error(message);
  }
  console.log(`  ✅ PASSED: ${message}`);
  passedTests++;
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

function skip(message) {
  console.log(`  ⚠️  SKIPPED: ${message}`);
  skippedTests++;
}

/** Records the arguments a stubbed generator was called with. */
function createRecordingGenerator(result) {
  const calls = [];
  const generateText = async (systemPrompt, userPrompt, options) => {
    calls.push({ systemPrompt, userPrompt, options });
    if (result instanceof Error) throw result;
    return result;
  };
  generateText.calls = calls;
  return generateText;
}

function makeRequest(options, body = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          // Non-JSON response — return raw string body
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json || data });
      });
    });
    req.on('error', (err) => resolve({ error: err.message, status: 0 }));
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

const VERIFIED_INPUT = {
  district: 'Nashik',
  indicatorName: 'women_pregnant_anaemic_pct',
  indicatorValue: 73,
  dataSource: 'district_factsheet',
  nutrientCategory: 'Iron',
  institutionName: 'Ashram Shala Trust',
  foodItem: 'Ragi',
  quantity: '30kg',
};

const FALLBACK_INPUT = {
  district: 'Pune',
  indicatorName: 'women_pregnant_anaemic_pct',
  indicatorValue: 45.7,
  dataSource: 'state_average_fallback',
  nutrientCategory: 'Iron',
  institutionName: 'Balgram Trust',
  foodItem: 'Chana',
  quantity: '20kg',
};

async function runAllTests() {
  console.log('\n============================================================');
  console.log('🧪  PoshanSetu — AI Layer Test Execution');
  console.log('============================================================\n');

  // ================================================================
  // SUITE 1: UNIT TESTING — Prompt Branching (verified vs state fallback)
  // ================================================================
  // The single most safety-critical behaviour in this layer. The reference dataset's
  // framing_template requires that a Maharashtra state-average figure is NEVER worded
  // as a district-specific one.
  // ================================================================
  console.log('--- Suite 1 [Unit Testing]: Explanation Prompt Branching ---');
  {
    // TC-AI-01: District-verified district (Nashik has real NFHS-5 factsheet data)
    const generator = createRecordingGenerator('Nashik needs your ragi.');
    const result = await aiExplanationService.explainMatch(VERIFIED_INPUT, { generateText: generator });

    assertEqual(generator.calls.length, 1, 'TC-AI-01a | Generator called exactly once');
    const verifiedPrompt = generator.calls[0].userPrompt;

    assert(verifiedPrompt.includes('district="Nashik"'), 'TC-AI-01b | Verified prompt names the district');
    assert(
      verifiedPrompt.includes('indicator="73% women_pregnant_anaemic_pct"'),
      'TC-AI-01c | Verified prompt carries the district indicator value verbatim',
    );
    assert(
      !verifiedPrompt.includes('Maharashtra state reports'),
      'TC-AI-01d | Verified prompt does NOT use state-average wording',
    );
    assert(
      !verifiedPrompt.includes('is not yet available'),
      'TC-AI-01e | Verified prompt does NOT claim district data is unavailable',
    );
    assert(
      verifiedPrompt.includes('recommended_category="Iron"'),
      'TC-AI-01f | Verified prompt carries the nutrient category',
    );
    assert(
      verifiedPrompt.includes('matched_requirement="Ashram Shala Trust') &&
        verifiedPrompt.includes('needs 30kg Ragi'),
      'TC-AI-01g | Verified prompt carries the matched requirement',
    );
    assert(
      verifiedPrompt.includes('Do not add any nutrition claim not present in the input.'),
      'TC-AI-01h | Verified prompt ends with the no-added-claims instruction',
    );
    assertEqual(result.source, 'ai', 'TC-AI-01i | Successful generation is reported as source "ai"');
    assertEqual(result.explanation, 'Nashik needs your ragi.', 'TC-AI-01j | Model text is returned as the explanation');
  }

  // TC-AI-02: State-average fallback district (Pune is in remaining_districts_pending_real_data)
  {
    const generator = createRecordingGenerator('Maharashtra reports high anaemia.');
    const result = await aiExplanationService.explainMatch(FALLBACK_INPUT, { generateText: generator });

    const fallbackPrompt = generator.calls[0].userPrompt;

    assert(
      fallbackPrompt.includes(
        'Maharashtra state reports 45.7% women_pregnant_anaemic_pct; ' +
          'district-specific data for Pune is not yet available',
      ),
      'TC-AI-02a | Fallback prompt uses the mandated "Maharashtra state reports ..." wording',
    );
    assert(
      !fallbackPrompt.includes('Pune reports'),
      'TC-AI-02b | Fallback prompt NEVER attributes the state number to Pune',
    );
    assert(
      !fallbackPrompt.includes('indicator="45.7%'),
      'TC-AI-02c | Fallback prompt replaces the bare district indicator slot',
    );
    assertEqual(result.source, 'ai', 'TC-AI-02d | Fallback-wording prompt still reports source "ai"');
  }

  // TC-AI-03: The two branches must actually differ
  {
    const verified = aiExplanationService.buildUserPrompt(aiExplanationService.normalizeInput(VERIFIED_INPUT));
    const fallback = aiExplanationService.buildUserPrompt(aiExplanationService.normalizeInput(FALLBACK_INPUT));
    assert(verified !== fallback, 'TC-AI-03a | Verified and fallback prompts are different strings');
  }

  // TC-AI-04: System prompt forbids adding claims not present in the input
  {
    const systemPrompt = aiExplanationService.EXPLANATION_SYSTEM_PROMPT;
    assert(
      /never add a nutrition, health, or deficiency claim that is not present in the input/i.test(systemPrompt),
      'TC-AI-04a | System prompt forbids adding new nutrition/health/deficiency claims',
    );
    assert(
      /population-level/i.test(systemPrompt),
      'TC-AI-04b | System prompt enforces the population-level framing rule',
    );
    assert(
      /must NOT attribute it to the named district/i.test(systemPrompt),
      'TC-AI-04c | System prompt forbids attributing a state average to a district',
    );
  }

  // TC-AI-05: dataSource resolution from the read-only reference dataset
  {
    const resolve = aiExplanationService.resolveDataSource;
    assertEqual(resolve('Nashik'), 'district_factsheet', 'TC-AI-05a | Nashik resolves to district_factsheet');
    assertEqual(resolve('Akola'), 'district_factsheet', 'TC-AI-05b | Akola resolves to district_factsheet');
    assertEqual(resolve('Pune'), 'state_average_fallback', 'TC-AI-05c | Pune resolves to state_average_fallback');
    assertEqual(resolve('Jalgaon'), 'state_average_fallback', 'TC-AI-05d | Jalgaon resolves to state_average_fallback');
    assertEqual(resolve('Bhandara'), 'state_average_fallback', 'TC-AI-05e | Bhandara (incomplete factsheet) is treated as a fallback');
    assertEqual(resolve('Ahmednagar'), 'district_factsheet', 'TC-AI-05f | Seed legacy name "Ahmednagar" resolves to district_factsheet');
    assertEqual(resolve('Ahilyanagar'), 'district_factsheet', 'TC-AI-05g | DB name "Ahilyanagar" resolves to district_factsheet');
    assertEqual(resolve('Chhatrapati Sambhajinagar'), 'district_factsheet', 'TC-AI-05h | Renamed "Aurangabad" district still resolves to district_factsheet');
    assertEqual(resolve('Atlantis'), 'state_average_fallback', 'TC-AI-05i | Unknown district fails SAFE to state_average_fallback');
    assertEqual(resolve(''), 'state_average_fallback', 'TC-AI-05j | Empty district name fails SAFE to state_average_fallback');
  }

  // TC-AI-06: geminiClient throws a typed error instead of returning bad text
  {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    let thrown = null;
    try {
      await geminiClient.generateText('system', 'user');
    } catch (error) {
      thrown = error;
    }

    assert(thrown instanceof AIServiceError, 'TC-AI-06a | Missing GEMINI_API_KEY throws AIServiceError');
    assertEqual(thrown?.name, 'AIServiceError', 'TC-AI-06b | Error is typed as AIServiceError');
    assert(
      /GEMINI_API_KEY/.test(thrown?.message || ''),
      'TC-AI-06c | Error message names the missing variable',
    );

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
  }

  // ================================================================
  // SUITE 2: UNIT TESTING — Graceful Degradation to Deterministic Template
  // ================================================================
  // Requirement: on AIServiceError the feature must degrade to a plain
  // string-concatenated template, never break the page.
  // ================================================================
  console.log('\n--- Suite 2 [Unit Testing]: Deterministic Fallback ---');
  {
    const generator = createRecordingGenerator(new AIServiceError('Gemini API returned HTTP 429'));
    const result = await aiExplanationService.explainMatch(VERIFIED_INPUT, { generateText: generator });

    assertEqual(result.source, 'fallback', 'TC-AI-07a | AIServiceError downgrades source to "fallback"');
    assert(
      result.explanation.startsWith('Nashik reports 73% women_pregnant_anaemic_pct.'),
      'TC-AI-07b | Verified fallback template leads with the district figure',
    );
    assert(
      result.explanation.includes('Ashram Shala Trust') &&
        result.explanation.includes('30kg Ragi') &&
        result.explanation.includes('Iron'),
      'TC-AI-07c | Verified fallback template carries the same facts as the prompt',
    );
  }

  // TC-AI-08: The NON-AI template must also honour the state/district attribution rule
  {
    const generator = createRecordingGenerator(new AIServiceError('network unreachable'));
    const result = await aiExplanationService.explainMatch(FALLBACK_INPUT, { generateText: generator });

    assertEqual(result.source, 'fallback', 'TC-AI-08a | Fallback source reported for a state-average district');
    assert(
      result.explanation.includes(
        'Maharashtra state reports 45.7% women_pregnant_anaemic_pct; ' +
          'district-specific data for Pune is not yet available.',
      ),
      'TC-AI-08b | Non-AI template uses the mandated state-average wording',
    );
    assert(
      !result.explanation.includes('Pune reports'),
      'TC-AI-08c | Non-AI template NEVER attributes the state number to Pune',
    );
  }

  // TC-AI-09: Any thrown error degrades gracefully rather than 500ing
  {
    const generator = createRecordingGenerator(new TypeError('unexpected internal fault'));
    const result = await aiExplanationService.explainMatch(VERIFIED_INPUT, { generateText: generator });
    assertEqual(result.source, 'fallback', 'TC-AI-09a | Non-AIServiceError throw still degrades to "fallback"');
    assert(typeof result.explanation === 'string' && result.explanation.length > 0, 'TC-AI-09b | A usable sentence is still returned');
  }

  // TC-AI-10: AI_ENABLED=false short-circuits to the template without calling the API
  {
    const generator = createRecordingGenerator('should never be used');
    process.env.AI_ENABLED = 'false';
    try {
      const result = await aiExplanationService.explainMatch(VERIFIED_INPUT, { generateText: generator });
      assertEqual(generator.calls.length, 0, 'TC-AI-10a | AI_ENABLED=false makes zero API calls');
      assertEqual(result.source, 'fallback', 'TC-AI-10b | AI_ENABLED=false reports source "fallback"');
    } finally {
      process.env.AI_ENABLED = 'true';
    }
  }

  // TC-AI-11: Model output is tidied into a single plain sentence
  {
    const generator = createRecordingGenerator('**Ragi** helps\n\nthis institution  ');
    const result = await aiExplanationService.explainMatch(VERIFIED_INPUT, { generateText: generator });
    assertEqual(
      result.explanation,
      'Ragi helps this institution.',
      'TC-AI-11a | Markdown, newlines and trailing whitespace are stripped',
    );
  }

  // ================================================================
  // SUITE 3: UNIT TESTING — Parser Returns Valid, Server-Validated JSON
  // ================================================================
  console.log('\n--- Suite 3 [Unit Testing]: Parser Valid JSON ---');
  {
    const generator = createRecordingGenerator(JSON.stringify([
      { item: 'Moong Dal', quantity: 5, unit: 'kg', confidence: 'high' },
      { item: 'Rice', quantity: 2, unit: 'bags', confidence: 'medium' },
    ]));
    const items = await aiParserService.parseFoodText('5 kg moong dal and 2 bags rice', { generateText: generator });

    assertEqual(generator.calls.length, 1, 'TC-AI-12a | Generator called exactly once');
    assertEqual(items.length, 2, 'TC-AI-12b | Both items parsed');
    assertEqual(items[0].item, 'Moong Dal', 'TC-AI-12c | Item name preserved');
    assertEqual(items[0].quantity, 5, 'TC-AI-12d | Numeric quantity preserved');
    assertEqual(items[0].unit, 'kg', 'TC-AI-12e | Unit preserved');
    assertEqual(items[0].confidence, 'high', 'TC-AI-12f | Model confidence preserved when unambiguous');
    assertEqual(items[1].confidence, 'medium', 'TC-AI-12g | "medium" confidence preserved');

    assertEqual(
      generator.calls[0].options.responseMimeType,
      'application/json',
      'TC-AI-12h | JSON response MIME type requested from the model',
    );
    assert(
      generator.calls[0].userPrompt.includes('5 kg moong dal and 2 bags rice'),
      'TC-AI-12i | Raw donor text is passed through to the model',
    );
    assert(
      /ONLY a JSON array/i.test(generator.calls[0].systemPrompt),
      'TC-AI-12j | System prompt demands JSON only',
    );
  }

  // TC-AI-13: Ambiguity is downgraded to "low" server-side, whatever the model claims
  {
    const generator = createRecordingGenerator(JSON.stringify([
      { item: 'Jaggery', quantity: null, unit: null, confidence: 'high' },
      { item: 'Rice', quantity: 0, unit: 'kg', confidence: 'high' },
      { item: 'Wheat', quantity: 10, unit: null, confidence: 'high' },
      { item: 'Dal', quantity: 4, unit: 'kg', confidence: 'low' },
    ]));
    const items = await aiParserService.parseFoodText('some jaggery, a bit of dal and wheat', { generateText: generator });

    assertEqual(items[0].confidence, 'low', 'TC-AI-13a | Missing quantity+unit forced to "low" despite model saying "high"');
    assertEqual(items[0].quantity, null, 'TC-AI-13b | Missing quantity surfaced as null');
    assertEqual(items[0].unit, null, 'TC-AI-13c | Missing unit surfaced as null');
    assertEqual(items[1].confidence, 'low', 'TC-AI-13d | Zero quantity forced to "low"');
    assertEqual(items[2].confidence, 'low', 'TC-AI-13e | Missing unit alone forced to "low"');
    assertEqual(items[3].confidence, 'low', 'TC-AI-13f | Model-reported "low" is honoured');
  }

  // TC-AI-14: Entries without a usable food name are dropped
  {
    const generator = createRecordingGenerator(JSON.stringify([
      { item: '   ' },
      null,
      'not an object',
      { name: 'Jowar', quantity: 3, unit: 'kg' },
      { item: 'Bajra', quantity: 'many', unit: 'kg' },
    ]));
    const items = await aiParserService.parseFoodText('random', { generateText: generator });

    assertEqual(items.length, 2, 'TC-AI-14a | Unusable entries dropped, valid ones kept');
    assertEqual(items[0].item, 'Jowar', 'TC-AI-14b | "name" key accepted as an alias for "item"');
    assertEqual(items[0].confidence, 'medium', 'TC-AI-14c | Absent confidence with quantity+unit defaults to "medium"');
    assertEqual(items[1].quantity, null, 'TC-AI-14d | Non-numeric quantity ("many") becomes null, not a guess');
    assertEqual(items[1].confidence, 'low', 'TC-AI-14e | Non-numeric quantity forced to "low" confidence');
  }

  // TC-AI-15: Markdown-fenced and prose-wrapped JSON are still accepted
  {
    const fenced = createRecordingGenerator(
      '```json\n[{"item":"Rice","quantity":10,"unit":"kg","confidence":"high"}]\n```',
    );
    const fencedItems = await aiParserService.parseFoodText('10kg rice', { generateText: fenced });
    assertEqual(fencedItems.length, 1, 'TC-AI-15a | Fenced JSON is unwrapped and parsed');
    assertEqual(fencedItems[0].item, 'Rice', 'TC-AI-15b | Fenced JSON yields the correct item');

    const wrapped = createRecordingGenerator(
      'Here are the items I found: [{"item":"Rice","quantity":10,"unit":"kg","confidence":"high"}]',
    );
    const wrappedItems = await aiParserService.parseFoodText('10kg rice', { generateText: wrapped });
    assertEqual(wrappedItems.length, 1, 'TC-AI-15c | Prose-wrapped array is recovered');
    assertEqual(wrappedItems[0].item, 'Rice', 'TC-AI-15d | Prose-wrapped array yields the correct item');
  }

  // TC-AI-16: An empty JSON array is a valid "nothing found" answer
  {
    const generator = createRecordingGenerator('[]');
    const items = await aiParserService.parseFoodText('hello there', { generateText: generator });
    assert(Array.isArray(items) && items.length === 0, 'TC-AI-16a | Empty array returned as an empty array');
  }

  // ================================================================
  // SUITE 4: UNIT TESTING — Parser Gracefully Handles Malformed AI Output
  // ================================================================
  // Requirement: on parse failure return an EMPTY array so the frontend can say
  // "couldn't parse, please use the manual fields" — never guess.
  // ================================================================
  console.log('\n--- Suite 4 [Unit Testing]: Parser Malformed Output ---');
  {
    const malformedOutputs = [
      'Sure! Here are the items I found in your text.',
      '[{"item":"Rice","quantity":10,',
      '{"item":"Rice","quantity":10,"unit":"kg"}',
      'not json at all',
      '',
      '   ',
      '[1, 2, 3]',
      '{"items":[{"item":"Rice"}]}',
    ];

    let index = 0;
    for (const output of malformedOutputs) {
      const generator = createRecordingGenerator(output);
      const items = await aiParserService.parseFoodText('some donation text', { generateText: generator });
      assertEqual(items.length, 0, `TC-AI-17.${index + 1} | Malformed output #${index + 1} returns an empty array`);
      index++;
    }
  }

  // TC-AI-18: An API failure mid-parse returns [] rather than throwing
  {
    const generator = createRecordingGenerator(new AIServiceError('Gemini API returned HTTP 503'));
    const items = await aiParserService.parseFoodText('5kg rice', { generateText: generator });
    assertEqual(items.length, 0, 'TC-AI-18a | AIServiceError during parsing returns an empty array');
  }

  // TC-AI-19: Blank / oversized input is rejected before any API call
  {
    const generator = createRecordingGenerator('[]');

    assertEqual((await aiParserService.parseFoodText('', { generateText: generator })).length, 0, 'TC-AI-19a | Empty text returns empty array');
    assertEqual((await aiParserService.parseFoodText('   ', { generateText: generator })).length, 0, 'TC-AI-19b | Whitespace-only text returns empty array');
    assertEqual((await aiParserService.parseFoodText(null, { generateText: generator })).length, 0, 'TC-AI-19c | Null text returns empty array');

    const longText = 'a'.repeat(aiParserService.MAX_RAW_TEXT_LENGTH + 1);
    assertEqual((await aiParserService.parseFoodText(longText, { generateText: generator })).length, 0, 'TC-AI-19d | Oversized text returns empty array');
    assertEqual(generator.calls.length, 0, 'TC-AI-19e | Rejected inputs never reach the model');
  }

  // TC-AI-20: Result count is capped so a runaway response cannot flood the client
  {
    const many = Array.from({ length: 40 }, (_, i) => ({
      item: `Item ${i}`,
      quantity: 1,
      unit: 'kg',
      confidence: 'high',
    }));
    const generator = createRecordingGenerator(JSON.stringify(many));
    const items = await aiParserService.parseFoodText('lots of food', { generateText: generator });
    assertEqual(items.length, aiParserService.MAX_PARSED_ITEMS, 'TC-AI-20a | Parsed item count is capped');
  }

  // ================================================================
  // SUITE 5: UNIT TESTING — geminiClient transport guards (fetch stubbed)
  // ================================================================
  // These guards were added after a live-API run revealed two real defects:
  //   a) Gemini 2.5+ Flash spends "thinking" tokens from the SAME output budget, so a
  //      small maxOutputTokens returned a truncated fragment ("In Nashik, where.")
  //      that looked like a valid sentence and was served as source "ai".
  //   b) 503 "high demand" is transient and worth one retry; 429 quota is not, and
  //      retrying it on the free tier makes it worse.
  // fetch is stubbed so these run with no API key, no quota and no network.
  // ================================================================
  console.log('\n--- Suite 5 [Unit Testing]: geminiClient Transport Guards ---');
  {
    const originalFetch = global.fetch;
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-key-not-real';

    const okBody = (text, finishReason = 'STOP') => ({
      candidates: [{ finishReason, content: { parts: [{ text }] } }],
    });
    const stubFetch = (responses) => {
      const queue = Array.isArray(responses) ? [...responses] : [responses];
      const seen = [];
      global.fetch = async (url, init) => {
        seen.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null });
        const next = queue.length > 1 ? queue.shift() : queue[0];
        return {
          ok: next.status >= 200 && next.status < 300,
          status: next.status,
          json: async () => next.body,
          text: async () => JSON.stringify(next.body),
        };
      };
      return seen;
    };
    const restore = () => {
      // Only undo fetch here. The key is set once for the whole suite and restored
      // after the last block, so each block can still make a real client call.
      global.fetch = originalFetch;
    };
    const restoreKey = () => {
      if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
      else process.env.GEMINI_API_KEY = originalKey;
    };

    // TC-AI-24: A successful call returns the model text and uses a thinking-safe budget
    try {
      const seen = stubFetch({ status: 200, body: okBody('A complete sentence.') });
      const text = await geminiClient.generateText('sys', 'user');
      assertEqual(text, 'A complete sentence.', 'TC-AI-24a | Successful call returns the model text');
      assert(
        seen[0].body?.generationConfig?.maxOutputTokens >= 1024,
        `TC-AI-24b | maxOutputTokens leaves room for thinking tokens (got ${seen[0].body?.generationConfig?.maxOutputTokens})`,
      );
      const urlModel = seen[0].url.split('/models/')[1]?.split(':')[0];
      assertEqual(urlModel, geminiClient.getModel(),
        'TC-AI-24c | Request URL uses the resolved model, not a per-call literal');
      assertEqual(geminiClient.DEFAULT_MODEL, 'gemini-3.7-flash',
        'TC-AI-24d | Production model constant is gemini-3.7-flash');
      assertEqual(geminiClient.MAX_ATTEMPTS, 3,
        'TC-AI-24e | Default attempt cap is unchanged by the model swap');
    } finally {
      restore();
    }

    // TC-AI-25: A truncated (MAX_TOKENS) response must THROW, never return the fragment
    try {
      stubFetch({ status: 200, body: okBody('In Nashik, where.', 'MAX_TOKENS') });
      let thrown = null;
      let returned = null;
      try {
        returned = await geminiClient.generateText('sys', 'user');
      } catch (error) {
        thrown = error;
      }
      assertEqual(returned, null, 'TC-AI-25a | Truncated response is NOT returned to the caller');
      assert(thrown instanceof AIServiceError, 'TC-AI-25b | Truncated response throws AIServiceError');
      assert(
        /truncated/i.test(thrown?.message || '') && /MAX_TOKENS/.test(thrown?.message || ''),
        `TC-AI-25c | Error names the truncation and finishReason (got: ${thrown?.message})`,
      );
    } finally {
      restore();
    }

    // TC-AI-26: A truncated explanation degrades to the fallback template, never to a fragment
    try {
      const originalFetch2 = global.fetch;
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => okBody('In Nashik, where.', 'MAX_TOKENS'),
        text: async () => '{}',
      });
      const result = await aiExplanationService.explainMatch(VERIFIED_INPUT);
      assertEqual(result.source, 'fallback', 'TC-AI-26a | Truncated model output downgrades to "fallback"');
      assert(
        !result.explanation.includes('In Nashik, where.'),
        'TC-AI-26b | The truncated fragment never reaches the user',
      );
      assert(
        result.explanation.includes('Ashram Shala Trust'),
        'TC-AI-26c | The full deterministic template is used instead',
      );
      global.fetch = originalFetch2;
    } finally {
      restore();
    }

    // TC-AI-27: 503 "high demand" is retried, and succeeds on a later attempt
    try {
      const seen = stubFetch([
        { status: 503, body: { error: { code: 503, message: 'high demand' } } },
        { status: 200, body: okBody('Recovered sentence.') },
      ]);
      const text = await geminiClient.generateText('sys', 'user');
      assertEqual(text, 'Recovered sentence.', 'TC-AI-27a | A transient 503 is retried and recovers');
      assertEqual(seen.length, 2, 'TC-AI-27b | Exactly one retry was attempted');
    } finally {
      restore();
    }

    // TC-AI-27c: maxAttempts:1 disables the retry. --model-smoke-test relies on this so a
    // single smoke run can never amplify into a multi-call burst on a free-tier key.
    try {
      const seen = stubFetch({ status: 503, body: { error: { code: 503, message: 'high demand' } } });
      let thrown = null;
      try {
        await geminiClient.generateText('sys', 'user', { maxAttempts: 1 });
      } catch (error) {
        thrown = error;
      }
      assertEqual(seen.length, 1, 'TC-AI-27c | maxAttempts:1 sends exactly one request on 503');
      assertEqual(thrown?.status, 503, 'TC-AI-27d | The 503 is surfaced to the caller instead of retried');
    } finally {
      restore();
    }

    // TC-AI-28: 429 quota exhaustion is NOT retried (retrying worsens it on the free tier)
    try {
      const seen = stubFetch({ status: 429, body: { error: { code: 429, message: 'quota exceeded' } } });
      let thrown = null;
      try {
        await geminiClient.generateText('sys', 'user');
      } catch (error) {
        thrown = error;
      }
      assertEqual(seen.length, 1, 'TC-AI-28a | A 429 fails fast without retrying');
      assertEqual(thrown?.status, 429, 'TC-AI-28b | The 429 status is preserved on the typed error');
    } finally {
      restore();
    }

    // TC-AI-29: A blocked prompt is rejected rather than silently returning nothing useful
    try {
      stubFetch({ status: 200, body: { promptFeedback: { blockReason: 'SAFETY' } } });
      let thrown = null;
      try {
        await geminiClient.generateText('sys', 'user');
      } catch (error) {
        thrown = error;
      }
      assert(thrown instanceof AIServiceError, 'TC-AI-29a | A blocked prompt throws AIServiceError');
      assert(/SAFETY/.test(thrown?.message || ''), 'TC-AI-29b | The block reason is surfaced');
    } finally {
      restore();
    }

    restoreKey();
  }

  // ================================================================
  // SUITE 6: INTEGRATION TESTING — Unauthenticated Access Is Rejected (401)
  // ================================================================
  // Requires the backend running on localhost:5000. Reported as SKIPPED otherwise,
  // so the pure unit suites above still run on a machine with nothing installed.
  // ================================================================
  console.log('\n--- Suite 6 [Integration Testing]: AI Routes Require Auth ---');

  const health = await makeRequest({ host: 'localhost', port: TEST_PORT, path: '/api/health', method: 'GET' });

  if (health.status === 0) {
    skip(`Server not reachable on localhost:${TEST_PORT} — start the backend to run TC-AI-21/22`);
    skip('POST /api/v1/ai/explain 401 check not executed');
    skip('POST /api/v1/ai/parse-donation 401 check not executed');
  } else {
    const postHeaders = { 'Content-Type': 'application/json' };

    // TC-AI-21: /api/v1/ai/explain must reject a request with no Firebase token
    {
      const res = await makeRequest(
        { host: 'localhost', port: TEST_PORT, path: '/api/v1/ai/explain', method: 'POST', headers: postHeaders },
        { requirementId: '11111111-1111-4111-8111-111111111111', matchMetadata: {} },
      );
      assertEqual(res.status, 401, 'TC-AI-21a | POST /api/v1/ai/explain returns 401 without a token');
      assertEqual(res.body?.success, false, 'TC-AI-21b | 401 response uses the standard error envelope');
    }

    // TC-AI-22: /api/v1/ai/parse-donation must reject a request with no Firebase token
    {
      const res = await makeRequest(
        { host: 'localhost', port: TEST_PORT, path: '/api/v1/ai/parse-donation', method: 'POST', headers: postHeaders },
        { text: '5 kg moong dal' },
      );
      assertEqual(res.status, 401, 'TC-AI-22a | POST /api/v1/ai/parse-donation returns 401 without a token');
      assertEqual(res.body?.success, false, 'TC-AI-22b | 401 response uses the standard error envelope');
    }

    // TC-AI-23: A malformed bearer token must also be rejected
    {
      const res = await makeRequest(
        {
          host: 'localhost',
          port: TEST_PORT,
          path: '/api/v1/ai/parse-donation',
          method: 'POST',
          headers: { ...postHeaders, Authorization: 'Bearer not-a-real-token' },
        },
        { text: '5 kg moong dal' },
      );
      assertEqual(res.status, 401, 'TC-AI-23a | An invalid bearer token returns 401, not 500');
    }
  }

  // ================================================================
  // SUMMARY
  // ================================================================
  console.log('\n============================================================');
  console.log('📊  AI Layer Test Summary');
  console.log('============================================================');
  console.log(`  ✅ Passed  : ${passedTests}`);
  console.log(`  ❌ Failed  : ${failedTests}`);
  console.log(`  ⚠️  Skipped : ${skippedTests}`);
  if (skippedTests > 0) {
    console.log('\n  Skipped cases need the backend running: npm run dev (in server/)');
  }
  console.log('============================================================\n');

  return failedTests === 0 ? 0 : 1;
}

runAllTests()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('\n💥 Test run aborted:', error.message);
    process.exit(1);
  });
