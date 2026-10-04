/**
 * ============================================================
 * PoshanSetu — AI Chat Service: Unit Test Suite
 * ============================================================
 *
 * Testing Types Covered:
 * ┌─────┬──────────────────────────┬────────────────────────────────────────────────────┐
 * │Suite│ Testing Type             │ What is Verified                                   │
 * ├─────┼──────────────────────────┼────────────────────────────────────────────────────┤
 * │  1  │ Unit Testing             │ Intent classification for all 6 categories         │
 * │  2  │ Unit Testing             │ out_of_scope never reaches the LLM (mock not called)│
 * │  3  │ Unit Testing             │ AIServiceError → fallback reply, no throw          │
 * │  4  │ Unit Testing             │ History cap enforced (max 6 turns)                 │
 * │  5  │ Unit Testing             │ suggestedAction default per intent                 │
 * │  6  │ Integration Testing      │ POST /api/v1/ai/chat returns 401 without auth       │
 * └─────┴──────────────────────────┴────────────────────────────────────────────────────┘
 *
 * Run: node test/aiChatTests.js   (from server/)
 * No database, no Gemini API key required for Suites 1–5.
 * Suite 6 needs the backend running on localhost:5000 and is skipped if not reachable.
 */

'use strict';

const http = require('http');

// Enable AI layer so isAiEnabled() === true for tests that call generateText.
process.env.AI_ENABLED = 'true';

const {
  INTENT,
  classifyIntent,
  getOutOfScopeReply,
  sanitizeReplyText,
  parseSuggestedAction,
  FALLBACK_REPLY,
  OUT_OF_SCOPE_RESPONSES,
  handleChatMessage,
} = require('../src/services/aiChatService');
const { AIServiceError } = require('../src/services/geminiClient');

const TEST_PORT = Number(process.env.TEST_PORT || 5000);

let passed = 0;
let failed = 0;
let skipped = 0;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
    throw new Error(message);
  }
  console.log(`  ✅ PASSED: ${message}`);
  passed++;
}

function assertEqual(actual, expected, message) {
  assert(
    actual === expected,
    `${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`,
  );
}

function skip(message) {
  console.log(`  ⚠️  SKIPPED: ${message}`);
  skipped++;
}

/**
 * createRecordingGenerator — returns a stubbed generateText function that records
 * every call and returns the given result (or throws if result is an Error).
 */
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
        try { json = JSON.parse(data); } catch { /* non-JSON */ }
        resolve({ status: res.statusCode, headers: res.headers, body: json || data });
      });
    });
    req.on('error', (err) => resolve({ error: err.message, status: 0 }));
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ─── SUITE 1: Intent Classification ──────────────────────────────────────────

async function runSuite1() {
  console.log('\n━━━ Suite 1: Intent Classification (rule-based) ━━━');
  const cases = [
    // out_of_scope — medical
    { msg: 'My child has severe anemia, what should she eat?', expected: INTENT.OUT_OF_SCOPE, label: 'medical: child anemia' },
    { msg: 'Is my son diagnosed with malnutrition?', expected: INTENT.OUT_OF_SCOPE, label: 'medical: diagnosis question' },
    { msg: 'What treatment is there for vitamin D deficiency?', expected: INTENT.OUT_OF_SCOPE, label: 'medical: treatment query' },
    // out_of_scope — bypass verification
    { msg: 'How can I bypass the verification process?', expected: INTENT.OUT_OF_SCOPE, label: 'bypass: verification circumvent' },
    { msg: 'Can we get approved without documents?', expected: INTENT.OUT_OF_SCOPE, label: 'bypass: without documents' },
    // describe_supply
    { msg: 'I have 50 kg of rice to donate.', expected: INTENT.DESCRIBE_SUPPLY, label: 'describe_supply: rice kg' },
    { msg: 'We have surplus 20 bags of wheat flour.', expected: INTENT.DESCRIBE_SUPPLY, label: 'describe_supply: wheat bags' },
    { msg: 'I am donating 100 litres of milk.', expected: INTENT.DESCRIBE_SUPPLY, label: 'describe_supply: milk litres' },
    // find_donation_location
    { msg: 'Where can I donate food?', expected: INTENT.FIND_DONATION_LOCATION, label: 'find_donation: generic' },
    { msg: 'Who needs rice in Nashik?', expected: INTENT.FIND_DONATION_LOCATION, label: 'find_donation: specific food+district' },
    { msg: 'Where should I donate dal?', expected: INTENT.FIND_DONATION_LOCATION, label: 'find_donation: food item' },
    // district_info
    { msg: 'What is the nutrition situation in Pune district?', expected: INTENT.DISTRICT_INFO, label: 'district_info: Pune' },
    { msg: 'Tell me about nutrition in Nashik.', expected: INTENT.DISTRICT_INFO, label: 'district_info: Nashik' },
    { msg: 'What does Akola need?', expected: INTENT.DISTRICT_INFO, label: 'district_info: district name only' },
    // institution_status
    { msg: 'Is Nandanvan Ashram verified?', expected: INTENT.INSTITUTION_STATUS, label: 'institution_status: ashram' },
    { msg: "What is the verification status of Sunrise School?", expected: INTENT.INSTITUTION_STATUS, label: 'institution_status: school' },
    // general_help
    { msg: 'How does PoshanSetu work?', expected: INTENT.GENERAL_HELP, label: 'general_help: how does it work' },
    { msg: 'Hello, what can you help me with?', expected: INTENT.GENERAL_HELP, label: 'general_help: greeting' },
    { msg: 'What is this platform?', expected: INTENT.GENERAL_HELP, label: 'general_help: platform info' },
  ];

  for (const { msg, expected, label } of cases) {
    try {
      const intent = classifyIntent(msg);
      assertEqual(intent, expected, `classifyIntent: ${label}`);
    } catch {
      // assert already recorded failure
    }
  }
}

// ─── SUITE 2: out_of_scope never reaches the LLM ─────────────────────────────

async function runSuite2() {
  console.log('\n━━━ Suite 2: out_of_scope messages — LLM must NOT be called ━━━');

  const outOfScopeMessages = [
    'My child has severe anemia, what should she eat?',
    'What treatment is there for malnutrition?',
    'How can I bypass the verification process?',
    'Can we get approved without submitting documents?',
    'My son is diagnosed with stunting, what medicines to give?',
  ];

  for (const msg of outOfScopeMessages) {
    try {
      const mockGen = createRecordingGenerator('This should never be returned');
      const result = await handleChatMessage({ userMessage: msg }, { generateText: mockGen });

      assert(
        mockGen.calls.length === 0,
        `LLM NOT called for out_of_scope: "${msg.slice(0, 60)}..."`,
      );
      assertEqual(result.source, 'static', `source is 'static' for out_of_scope`);
      assert(typeof result.reply === 'string' && result.reply.length > 0, 'reply is non-empty');
      // Verify it's one of our static responses (not AI-generated text)
      const isStaticReply = Object.values(OUT_OF_SCOPE_RESPONSES).some((r) => result.reply === r);
      assert(isStaticReply, `reply matches a known static response for: "${msg.slice(0, 40)}..."`);
    } catch {
      // assert already recorded failure
    }
  }
}

// ─── SUITE 3: AIServiceError → fallback ──────────────────────────────────────

async function runSuite3() {
  console.log('\n━━━ Suite 3: AIServiceError → fallback reply, no throw ━━━');

  const aiError = new AIServiceError('Gemini is unavailable');
  const mockGen = createRecordingGenerator(aiError);

  // A general_help intent will reach the LLM call path
  try {
    const result = await handleChatMessage(
      { userMessage: 'Hello, what can you help me with?', conversationHistory: [], userLocation: null },
      { generateText: mockGen },
    );

    assertEqual(result.source, 'fallback', 'source is "fallback" when AIServiceError thrown');
    assertEqual(result.reply, FALLBACK_REPLY, 'reply matches the defined FALLBACK_REPLY constant');
    assert(!result.reply.includes('Error'), 'fallback reply contains no error stack/message');
  } catch {
    // already recorded
  }

  // Verify the mock WAS called (i.e. the path reached the AI call before failing)
  try {
    assert(mockGen.calls.length >= 1, 'generateText was called before the error was caught');
  } catch {
    // already recorded
  }
}

// ─── SUITE 4: History cap ─────────────────────────────────────────────────────

async function runSuite4() {
  console.log('\n━━━ Suite 4: Conversation history — cap at 6 turns ━━━');

  // Build 10 turns — only the last 6 should appear in the prompt
  const history = Array.from({ length: 10 }, (_, i) => ({
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Turn ${i + 1} content`,
  }));

  const capturedPrompts = [];
  const mockGen = async (systemPrompt) => {
    capturedPrompts.push(systemPrompt);
    return 'Mock assistant reply';
  };

  try {
    await handleChatMessage(
      { userMessage: 'Hello', conversationHistory: history },
      { generateText: mockGen },
    );

    // If AI is enabled and mockGen was called, check the captured system prompt
    if (capturedPrompts.length > 0) {
      const prompt = capturedPrompts[0];
      // Turn 1-4 should NOT appear; Turn 5-10 SHOULD appear
      assert(!prompt.includes('Turn 1 content'), 'Turn 1 (early history) is NOT included in context');
      assert(!prompt.includes('Turn 4 content'), 'Turn 4 (early history) is NOT included in context');
      assert(prompt.includes('Turn 5 content') || prompt.includes('Turn 6 content'), 'Recent turns ARE included');
    } else {
      skip('AI disabled — history cap test skipped (would only be visible in the AI prompt)');
    }
  } catch {
    // already recorded
  }
}

// ─── SUITE 5: suggestedAction defaults per intent ─────────────────────────────

async function runSuite5() {
  console.log('\n━━━ Suite 5: suggestedAction defaults per intent ━━━');

  const cases = [
    { intent: INTENT.FIND_DONATION_LOCATION, expectedPath: '/food-match' },
    { intent: INTENT.DESCRIBE_SUPPLY, expectedPath: '/food-match' },
    { intent: INTENT.DISTRICT_INFO, expectedPath: '/explore' },
    { intent: INTENT.INSTITUTION_STATUS, expectedPath: '/explore' },
    { intent: INTENT.GENERAL_HELP, expectedPath: '/how-it-works' },
  ];

  for (const { intent, expectedPath } of cases) {
    try {
      const action = parseSuggestedAction('', intent);
      assert(action !== null, `suggestedAction exists for intent: ${intent}`);
      assertEqual(action.type, 'navigate', `suggestedAction.type is 'navigate' for ${intent}`);
      assertEqual(action.path, expectedPath, `suggestedAction.path is ${expectedPath} for ${intent}`);
    } catch {
      // already recorded
    }
  }

  // out_of_scope has no default action (null)
  try {
    const action = parseSuggestedAction('', INTENT.OUT_OF_SCOPE);
    assert(action === null, 'out_of_scope suggestedAction is null (no navigation needed)');
  } catch {
    // already recorded
  }
}

// ─── SUITE 6: Integration — POST /api/v1/ai/chat returns 401 without auth ────

async function runSuite6() {
  console.log('\n━━━ Suite 6: Integration — /api/v1/ai/chat requires auth (401) ━━━');

  // Check if server is reachable first
  const probe = await makeRequest({
    hostname: 'localhost',
    port: TEST_PORT,
    path: '/api/health',
    method: 'GET',
  });

  if (probe.status === 0 || probe.error) {
    skip(`Server not reachable on localhost:${TEST_PORT} — skipping integration suite`);
    return;
  }

  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/v1/ai/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { message: 'Hello' },
    );

    assertEqual(res.status, 401, 'POST /api/v1/ai/chat without token returns 401');
    assert(res.body?.success === false, 'Response has success: false');
  } catch {
    // already recorded
  }
}

// ─── SUITE 7: sanitizeReplyText ──────────────────────────────────────────────

async function runSuite7() {
  console.log('\n━━━ Suite 7: sanitizeReplyText strips embedded suggestedAction ━━━');

  const cases = [
    {
      input: "There are active requirements in Nashik. suggestedAction: { \"type\": \"navigate\", \"path\": \"/food-match\" }",
      expected: "There are active requirements in Nashik.",
      label: 'strips suggestedAction JSON from reply',
    },
    {
      input: "PoshanSetu is a platform that connects donors with institutions.",
      expected: "PoshanSetu is a platform that connects donors with institutions.",
      label: 'plain text unchanged',
    },
    {
      input: "  Multiple   spaces   collapse.  ",
      expected: "Multiple   spaces   collapse.",
      label: 'leading/trailing whitespace trimmed',
    },
  ];

  for (const { input, expected, label } of cases) {
    try {
      const result = sanitizeReplyText(input);
      // Use includes rather than strict equals for the first case since spacing may vary
      if (label === 'strips suggestedAction JSON from reply') {
        assert(!result.includes('suggestedAction'), `${label}: suggestedAction absent from output`);
      } else {
        assertEqual(result, expected, label);
      }
    } catch {
      // already recorded
    }
  }
}

// ─── RUNNER ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   PoshanSetu — AI Chat Service: Unit Test Suite             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  try {
    await runSuite1();
    await runSuite2();
    await runSuite3();
    await runSuite4();
    await runSuite5();
    await runSuite6();
    await runSuite7();
  } catch (err) {
    console.error('\n[RUNNER] Unexpected error outside a test block:', err.message);
    failed++;
  }

  const total = passed + failed + skipped;
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped / ${total} total`);

  if (failed > 0) {
    console.error(`\n❌ ${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(2);
});
