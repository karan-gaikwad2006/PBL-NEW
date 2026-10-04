/**
 * ============================================================
 * PoshanSetu — Local Verification Script: AI Explanation + Parsing Layer
 * ============================================================
 * MANUAL / LOCAL verification. This is deliberately NOT part of the automated test
 * suite (test/testRunner.js or test/aiLayerTests.js). It exercises the AI layer
 * against the REAL Gemini API so a developer can confirm behaviour before pushing
 * and before GEMINI_API_KEY is configured on Render.
 *
 * Usage
 * ─────
 *   node scripts/verifyAiLayer.js            Checks 1-3 (service level, no server needed)
 *   node scripts/verifyAiLayer.js --no-ai    Force the key-missing path (simulates Render
 *                                           without a key; equivalent to commenting the
 *                                           key out of .env)
 *   node scripts/verifyAiLayer.js --http     Include the HTTP checks (needs a running server)
 *   node scripts/verifyAiLayer.js --http-only  Only the HTTP checks
 *   node scripts/verifyAiLayer.js --model-smoke-test
 *                                           ONE live call per case (Nashik explanation +
 *                                           free-text parser) against whatever model
 *                                           GEMINI_MODEL resolves to. Prints the model
 *                                           name AND the outbound request URL so the run
 *                                           can be audited. Never retries or loops —
 *                                           a smoke test must not burn free-tier quota.
 *                                           Combine with --no-ai to inspect resolution only.
 *
 *   Optional env vars:
 *     TEST_FIREBASE_TOKEN   Firebase ID token used for the authenticated HTTP sub-checks.
 *                           When absent those sub-checks are SKIPPED, not failed.
 *     AI_VERIFY_BASE_URL    Override the target server (default http://localhost:5000)
 *
 * Recommended local sequence (run twice, as the AI layer must degrade gracefully):
 *   1) npm run verify:ai              with GEMINI_API_KEY present in server/.env
 *   2) npm run verify:ai -- --no-ai   with the key forced off
 *
 * Exit code: 1 if any check FAILS, otherwise 0.
 */

const path = require('path');
const http = require('http');
const https = require('https');

// ─── CLI flags ────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const FORCE_NO_AI = argv.includes('--no-ai');
const WITH_HTTP = argv.includes('--http') || argv.includes('--http-only');
const HTTP_ONLY = argv.includes('--http-only');
const MODEL_SMOKE_TEST = argv.includes('--model-smoke-test');

// Load server/.env exactly like the other scripts in this folder.
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// --no-ai must clear the key AFTER dotenv has populated it. The services read
// process.env on every call, so this genuinely exercises the missing-key path.
if (FORCE_NO_AI) {
  delete process.env.GEMINI_API_KEY;
}

// ─── Constants for the checks ─────────────────────────────────────────────────
const VERIFIED_CASE = {
  district: 'Nashik',
  dataSource: 'district_factsheet',
  indicatorName: 'women_pregnant_anaemic_pct',
  indicatorValue: 73,
  nutrientCategory: 'Iron',
  institutionName: 'Test Ashram Shala',
  foodItem: 'Ragi',
  quantity: 30,
};

const STATE_FALLBACK_CASE = {
  district: 'Pune',
  dataSource: 'state_average_fallback',
  indicatorName: 'women_pregnant_anaemic_pct',
  indicatorValue: 45.7,
  nutrientCategory: 'Iron',
  institutionName: 'Test Trust',
  foodItem: 'Chana',
  quantity: 15,
};

const AMBIGUOUS_DONATION_TEXT = 'I have around 2 sacks of jowar and some dal, not sure how much';

const MAX_PREVIEW = 320;
const HTTP_TIMEOUT_MS = 30000;

// ─── Failure / skip plumbing ──────────────────────────────────────────────────
class CheckFailure extends Error {
  constructor(name, failures) {
    super(`${name} failed ${failures.length} assertion(s)`);
    this.name = 'CheckFailure';
    this.failures = failures;
  }
}

class CheckSkipped extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'CheckSkipped';
  }
}

const results = [];

// Surfaced so check 3b can prove nothing escaped as an unhandled rejection.
const asyncErrors = [];
process.on('unhandledRejection', (reason) => {
  asyncErrors.push(`unhandledRejection: ${reason && reason.message ? reason.message : String(reason)}`);
});
process.on('uncaughtException', (error) => {
  asyncErrors.push(`uncaughtException: ${error && error.message ? error.message : String(error)}`);
});

function preview(value) {
  if (typeof value === 'string') return value.length > MAX_PREVIEW ? `${value.slice(0, MAX_PREVIEW)}…` : value;
  try {
    const json = JSON.stringify(value, null, 2);
    return json === undefined ? String(value) : (json.length > MAX_PREVIEW ? `${json.slice(0, MAX_PREVIEW)}…` : json);
  } catch {
    return String(value);
  }
}

/**
 * Per-check assertion recorder. Collects every failure so one run shows the whole
 * picture, then throws a single CheckFailure carrying readable actual-vs-expected pairs.
 */
function createChecker(id, title) {
  const failures = [];

  const pass = (label) => console.log(`   PASS  ${label}`);
  const fail = (label, actual, expected, note) => {
    failures.push({ label, actual, expected, note });
    console.log(`   FAIL  ${label}`);
  };

  return {
    id,
    title,
    ok: pass,
    equal(label, actual, expected) {
      if (actual === expected) pass(label);
      else fail(label, actual, expected);
    },
    isTrue(label, actual, expectedTrue, note) {
      if (Boolean(actual) === expectedTrue) pass(label);
      else fail(label, actual, expectedTrue, note);
    },
    contains(label, haystack, needle) {
      if (typeof haystack === 'string' && haystack.includes(needle)) pass(label);
      else fail(label, haystack, `a string containing "${needle}"`);
    },
    containsAny(label, haystack, needles) {
      const hit = needles.find((n) => typeof haystack === 'string' && haystack.toLowerCase().includes(n.toLowerCase()));
      if (hit) pass(`${label} (matched "${hit}")`);
      else fail(label, haystack, `a string containing one of: ${needles.join(' | ')}`);
    },
    notContains(label, haystack, needle) {
      if (typeof haystack !== 'string' || !haystack.includes(needle)) pass(label);
      else fail(label, haystack, `a string NOT containing "${needle}"`, 'wrong-branch template leaked into the output');
    },
    finish() {
      if (failures.length > 0) throw new CheckFailure(`${id} ${title}`, failures);
    },
  };
}

async function runCheck(id, title, fn) {
  console.log(`\n--- ${id}  ${title} ---`);
  const checker = createChecker(id, title);
  try {
    await fn(checker);
    checker.finish();
    results.push({ id, title, status: 'PASS', note: '' });
    console.log(`   => ${id} PASS`);
  } catch (error) {
    if (error instanceof CheckSkipped) {
      results.push({ id, title, status: 'SKIPPED', note: error.message });
      console.log(`   => ${id} SKIPPED — ${error.message}`);
      return;
    }
    if (error instanceof CheckFailure) {
      results.push({ id, title, status: 'FAIL', note: '', failures: error.failures });
      console.log(`   => ${id} FAIL (${error.failures.length} assertion(s))`);
      return;
    }
    results.push({ id, title, status: 'FAIL', note: '', failures: [{ label: 'unexpected error', actual: error.stack || String(error), expected: 'no throw' }] });
    console.log(`   => ${id} FAIL (unexpected error)`);
  }
}

function skipCheck(id, title, reason) {
  console.log(`\n--- ${id}  ${title} ---`);
  console.log(`   SKIP  ${reason}`);
  results.push({ id, title, status: 'SKIPPED', note: reason });
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────
function request(method, urlPath, { body = null, token = null, timeout = HTTP_TIMEOUT_MS } = {}) {
  const baseUrl = process.env.AI_VERIFY_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  let parsed;
  try {
    parsed = new URL(urlPath, baseUrl);
  } catch {
    return Promise.resolve({ status: 0, body: null, error: `invalid base url: ${baseUrl}` });
  }

  const transport = parsed.protocol === 'https:' ? https : http;
  const payload = body === null ? null : Buffer.from(JSON.stringify(body));

  return new Promise((resolve) => {
    const req = transport.request(
      {
        method,
        hostname: parsed.hostname,
        port: parsed.port,
        path: `${parsed.pathname}${parsed.search}`,
        headers: {
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsedBody = raw;
          try {
            parsedBody = JSON.parse(raw);
          } catch {
            // leave as raw string
          }
          resolve({ status: res.statusCode, body: parsedBody });
        });
      },
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, body: null, error: `request timed out after ${timeout}ms` });
    });
    req.on('error', (error) => resolve({ status: 0, body: null, error: error.message }));
    if (payload) req.write(payload);
    req.end();
  });
}

/** Find a real requirement + a valid indicator name so the authenticated HTTP checks are meaningful. */
async function discoverLiveMatchContext() {
  const matchRes = await request('POST', '/api/v1/matching', {
    body: {
      maxResults: 5,
      foodItems: [
        { item: 'Ragi', quantity: 500, unit: 'kg' },
        { item: 'Rice', quantity: 500, unit: 'kg' },
        { item: 'Moong Dal', quantity: 400, unit: 'kg' },
        { item: 'Chana', quantity: 300, unit: 'kg' },
        { item: 'Wheat', quantity: 300, unit: 'kg' },
      ],
    },
  });
  if (matchRes.status !== 200 || !Array.isArray(matchRes.body?.data) || matchRes.body.data.length === 0) {
    throw new CheckSkipped(`could not discover a live match from /api/v1/matching (status ${matchRes.status}) — is the DB seeded?`);
  }
  const match = matchRes.body.data[0];
  const districtName = match.requirement?.district;
  if (!districtName) throw new CheckSkipped('discovered match has no district name');

  const districtsRes = await request('GET', '/api/v1/districts');
  if (districtsRes.status !== 200 || !Array.isArray(districtsRes.body?.data)) {
    throw new CheckSkipped(`could not load /api/v1/districts (status ${districtsRes.status})`);
  }
  const district = districtsRes.body.data.find((d) => String(d.name).toLowerCase() === String(districtName).toLowerCase());
  if (!district) throw new CheckSkipped(`district "${districtName}" not present in /api/v1/districts`);

  const indicators = Array.isArray(district.nutritionIndicators) ? district.nutritionIndicators : [];
  const withValue = indicators.find((i) => Number.isFinite(Number(i.value)));
  if (!withValue) throw new CheckSkipped(`district "${districtName}" has no nutrition indicator with a value`);

  return {
    requirementId: match.requirementId,
    district: districtName,
    indicatorName: withValue.name,
    indicatorValue: Number(withValue.value),
    matchMetadata: {
      matchedItems: match.matchedItems,
      matchedDeficiencyEntries: match.matchedDeficiencyEntries,
      indicatorName: withValue.name,
    },
  };
}

/**
 * Single-pass model smoke test.
 *
 * Purpose: confirm which model actually served a response, and whether that model
 * still produces COMPLETE output under DEFAULT_MAX_OUTPUT_TOKENS (see the
 * RE-VALIDATE comment in src/services/geminiClient.js).
 *
 * Deliberately frugal, because this project runs on a free-tier key:
 *   - exactly one live request per case, no loop;
 *   - retries disabled via the client's own maxAttempts option (no 503 amplification);
 *   - global.fetch is wrapped only to RECORD the outbound URL (proving which model
 *     string was really sent), then transparently delegates to the real fetch.
 * The AI services are untouched: the no-retry generator is injected through their
 * existing dependency-injection seam.
 */
async function runModelSmokeTest({ aiExplanationService, aiParserService, hasKey, aiEnabled }) {
  const geminiClient = require('../src/services/geminiClient');

  console.log('\n============================================================');
  console.log(' PoshanSetu — Model Smoke Test (single pass, no retries)');
  console.log('============================================================');
  console.log(` GEMINI_API_KEY   : ${FORCE_NO_AI ? '(force-unset via --no-ai)' : hasKey ? 'present' : 'NOT SET'}`);
  console.log(` AI_ENABLED       : ${String(process.env.AI_ENABLED ?? '(unset)')}  -> isAiEnabled()=${aiEnabled}`);
  console.log(` GEMINI_MODEL env : ${process.env.GEMINI_MODEL ?? '(unset)'}`);
  console.log(` resolved model   : ${geminiClient.getModel()}`);
  console.log(` DEFAULT_MODEL    : ${geminiClient.DEFAULT_MODEL}`);
  console.log(` maxOutputTokens  : 1024 (DEFAULT_MAX_OUTPUT_TOKENS — see RE-VALIDATE note in geminiClient.js)`);
  console.log('============================================================');

  if (FORCE_NO_AI || !hasKey || !aiEnabled) {
    console.log('\n SKIPPED  no live call made: AI is disabled or the key is missing.');
    console.log('          Resolution above still shows which model WOULD be used.\n');
    printSummary();
    return;
  }

  // Record the outbound URL so the reviewer can see the real model segment.
  const requestedUrls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, init) => {
    requestedUrls.push(String(url));
    return originalFetch(url, init);
  };

  // One attempt only. Injected, so neither service file is modified.
  const generateTextOnce = (systemPrompt, userPrompt, options = {}) =>
    geminiClient.generateText(systemPrompt, userPrompt, { ...options, maxAttempts: 1 });

  try {
    // Case 1a: Nashik district-verified explanation.
    await runCheck('1a', `MODEL SMOKE · explainMatch district-verified (Nashik)`, async (c) => {
      const result = await aiExplanationService.explainMatch(VERIFIED_CASE, { generateText: generateTextOnce });
      console.log(`   explanation: ${preview(result.explanation)}`);
      console.log(`   source     : ${result.source}`);

      c.equal('response.source === "ai"', result.source, 'ai');
      c.isTrue('response.explanation is a non-empty string',
        typeof result.explanation === 'string' && result.explanation.trim().length > 0, true);
      c.isTrue('explanation mentions the district', /nashik/i.test(String(result.explanation)), true,
        'a verified district should be named in its own explanation');
      c.notContains('explanation does NOT contain "Maharashtra state reports"',
        result.explanation, 'Maharashtra state reports');
      c.isTrue('explanation is a COMPLETE sentence, not a MAX_TOKENS fragment',
        /[.!?]\s*$/.test(String(result.explanation).trim()), true,
        'ends without terminal punctuation -> suspect finishReason MAX_TOKENS; raise DEFAULT_MAX_OUTPUT_TOKENS');
      c.finish();
    });

    // Case 1b: free-text parser with an ambiguous quantity.
    await runCheck('1b', 'MODEL SMOKE · parseFoodText ambiguous-quantity handling', async (c) => {
      const items = await aiParserService.parseFoodText(AMBIGUOUS_DONATION_TEXT, { generateText: generateTextOnce });
      console.log(`   parsed: ${preview(items)}`);

      c.isTrue('result is a non-empty Array', Array.isArray(items) && items.length > 0, true,
        'expected at least one item from a text that names two foods');
      c.isTrue('every item has the four required keys',
        items.every((i) => i && typeof i === 'object' && 'item' in i && 'quantity' in i && 'unit' in i && 'confidence' in i),
        true);
      c.isTrue('at least one item is flagged confidence "low" (the vague "some dal")',
        items.some((i) => i.confidence === 'low'), true,
        `confidences: ${preview(items.map((i) => i.confidence))}`);
      c.finish();
    });

    const usedModels = [...new Set(requestedUrls.map((u) => u.split('/models/')[1]?.split(':')[0]).filter(Boolean))];
    console.log('\n------------------------------------------------------------');
    console.log(` outbound requests : ${requestedUrls.length} (no retries, single pass)`);
    requestedUrls.forEach((u, i) => console.log(`   [${i + 1}] ${u}`));
    console.log(` model actually used: ${usedModels.join(', ') || '(no request was made)'}`);
    console.log('------------------------------------------------------------');
  } finally {
    global.fetch = originalFetch;
  }

  printSummary();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { isAiEnabled } = require('../src/config/env');
  const aiExplanationService = require('../src/services/aiExplanationService');
  const aiParserService = require('../src/services/aiParserService');

  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  const aiEnabled = isAiEnabled();
  // True only when a real AI call is possible, i.e. the degradation checks (3a/3b)
  // are not actually exercising the key-missing path.
  const aiLayerAvailable = aiEnabled && hasKey;

  if (MODEL_SMOKE_TEST) {
    await runModelSmokeTest({ aiExplanationService, aiParserService, hasKey, aiEnabled });
    return;
  }

  console.log('\n============================================================');
  console.log(' PoshanSetu — AI Layer Local Verification');
  console.log('============================================================');
  console.log(` GEMINI_API_KEY   : ${FORCE_NO_AI ? '(force-unset via --no-ai)' : hasKey ? 'present' : 'NOT SET'}`);
  console.log(` AI_ENABLED       : ${String(process.env.AI_ENABLED ?? '(unset)')}  -> isAiEnabled()=${aiEnabled}`);
  console.log(` Node             : ${process.version}`);

  if (!HTTP_ONLY) {
    // ── Check 1: AI-enabled, district-verified ──────────────────────────────
    if (!aiEnabled) {
      skipCheck('1a', 'AI-ENABLED · explainMatch district-verified (Nashik)',
        'isAiEnabled() is false — set AI_ENABLED=true in server/.env to run this check');
    } else if (!hasKey) {
      skipCheck('1a', 'AI-ENABLED · explainMatch district-verified (Nashik)',
        'GEMINI_API_KEY is not set — add it to server/.env, or run check 3 with --no-ai');
    } else {
      await runCheck('1a', 'AI-ENABLED · explainMatch district-verified (Nashik)', async (c) => {
        const result = await aiExplanationService.explainMatch(VERIFIED_CASE);

        console.log(`   explanation: ${preview(result.explanation)}`);

        c.equal('response.source === "ai"', result.source, 'ai');
        c.isTrue('response.explanation is a non-empty string',
          typeof result.explanation === 'string' && result.explanation.trim().length > 0, true);
        c.notContains('explanation does NOT contain "Maharashtra state reports"',
          result.explanation, 'Maharashtra state reports');
        c.isTrue('explanation mentions the district', /nashik/i.test(String(result.explanation)), true,
          'a verified district should be named in its own explanation');
        c.finish();
      });
    }

    // ── Check 1b: AI-enabled, parser with ambiguous quantity ────────────────
    if (!aiEnabled) {
      skipCheck('1b', 'AI-ENABLED · parseFoodText ambiguous-quantity handling',
        'isAiEnabled() is false — set AI_ENABLED=true in server/.env to run this check');
    } else if (!hasKey) {
      skipCheck('1b', 'AI-ENABLED · parseFoodText ambiguous-quantity handling',
        'GEMINI_API_KEY is not set — add it to server/.env, or run check 3 with --no-ai');
    } else {
      await runCheck('1b', 'AI-ENABLED · parseFoodText ambiguous-quantity handling', async (c) => {
        const items = await aiParserService.parseFoodText(AMBIGUOUS_DONATION_TEXT);

        console.log(`   parsed: ${preview(items)}`);

        c.isTrue('result is an Array (not a stringified JSON blob)', Array.isArray(items), true,
          `got ${typeof items}: ${preview(items)}`);
        c.isTrue('result parses as JSON without throwing', (() => {
          try { JSON.parse(JSON.stringify(items)); return true; } catch { return false; }
        })(), true);

        if (!Array.isArray(items)) {
          c.finish();
          return;
        }

        c.isTrue('result is non-empty', items.length > 0, true, 'the text clearly names jowar and dal');
        c.isTrue('every item is a plain object', items.every((i) => i && typeof i === 'object' && !Array.isArray(i)), true);
        c.isTrue('no item carries a stringified-JSON blob in "item"',
          items.every((i) => typeof i.item === 'string' && !/^[[{]/.test(i.item.trim())), true);
        c.isTrue('every item has the four required keys',
          items.every((i) => 'item' in i && 'quantity' in i && 'unit' in i && 'confidence' in i), true);
        c.isTrue('every confidence is high|medium|low',
          items.every((i) => ['high', 'medium', 'low'].includes(i.confidence)), true,
          `got: ${preview(items.map((i) => i.confidence))}`);
        c.isTrue('at least one item is flagged confidence "low" (the vague "some dal")',
          items.some((i) => i.confidence === 'low'), true,
          `confidences: ${preview(items.map((i) => `${i.item}=${i.confidence}`))}`);
        c.finish();
      });
    }

    // ── Check 2: AI-enabled, state-fallback district ────────────────────────
    if (!aiEnabled) {
      skipCheck('2', 'AI-ENABLED · explainMatch state-fallback wording (Pune)',
        'isAiEnabled() is false — set AI_ENABLED=true in server/.env to run this check');
    } else if (!hasKey) {
      skipCheck('2', 'AI-ENABLED · explainMatch state-fallback wording (Pune)',
        'GEMINI_API_KEY is not set — add it to server/.env, or run check 3 with --no-ai');
    } else {
      await runCheck('2', 'AI-ENABLED · explainMatch state-fallback wording (Pune)', async (c) => {
        const result = await aiExplanationService.explainMatch(STATE_FALLBACK_CASE);

        console.log(`   explanation: ${preview(result.explanation)}`);

        c.equal('response.source === "ai"', result.source, 'ai');
        c.isTrue('response.explanation is a non-empty string',
          typeof result.explanation === 'string' && result.explanation.trim().length > 0, true);
        c.contains('explanation attributes the figure to Maharashtra state', result.explanation, 'Maharashtra');
        c.containsAny('explanation says district-specific data is pending',
          result.explanation,
          ['not yet available', 'not available', 'pending', 'district-specific', 'does not have district']);
        c.notContains('explanation does NOT claim "Pune reports ..."',
          result.explanation, 'Pune reports');
        c.notContains('explanation does NOT contain "Maharashtra state reports Pune"',
          result.explanation, 'Maharashtra state reports Pune');
        c.finish();
      });
    }

    // ── Check 3a: key missing / AI disabled — explanation degrades ──────────
    await runCheck('3a', 'AI-DISABLED · explainMatch plain-template fallback', async (c) => {
      const result = await aiExplanationService.explainMatch(VERIFIED_CASE);

      console.log(`   explanation: ${preview(result.explanation)}`);

      c.equal('response.source === "fallback"', result.source, 'fallback');
      c.isTrue('no error was thrown (degrades instead of failing)', result !== null && typeof result === 'object', true);
      c.isTrue('explanation is a non-empty readable string',
        typeof result.explanation === 'string' && result.explanation.trim().length > 0, true);
      c.contains('explanation interpolates the institution name', result.explanation, VERIFIED_CASE.institutionName);
      c.contains('explanation interpolates the food item', result.explanation, VERIFIED_CASE.foodItem);
      c.contains('explanation interpolates the quantity', result.explanation, String(VERIFIED_CASE.quantity));
      c.contains('explanation interpolates the district', result.explanation, VERIFIED_CASE.district);
      c.finish();
    });

    // ── Check 3b: key missing / AI disabled — parser degrades ───────────────
    await runCheck('3b', 'AI-DISABLED · parseFoodText degrades without crashing', async (c) => {
      const before = asyncErrors.length;
      let items;
      let thrown = null;

      try {
        items = await aiParserService.parseFoodText(AMBIGUOUS_DONATION_TEXT);
      } catch (error) {
        thrown = error;
      }

      // Give the event loop a chance to surface any stray async failure.
      await new Promise((resolve) => setTimeout(resolve, 250));

      console.log(`   returned: ${thrown ? `threw ${thrown.name}: ${thrown.message}` : preview(items)}`);

      c.isTrue('process did not crash and no unhandled rejection was recorded',
        asyncErrors.length === before, true,
        asyncErrors.length > before ? `new async errors: ${preview(asyncErrors.slice(before))}` : '');

      if (thrown) {
        // Acceptable per spec: the implementation may surface a clearly caught error.
        c.isTrue('thrown error is a named, catchable Error (not a crash)',
          thrown instanceof Error && typeof thrown.message === 'string' && thrown.message.length > 0, true,
          'an unhandled throw would have taken the process down');
      } else if (aiLayerAvailable) {
        // The AI layer is actually reachable, so this is NOT the degradation path.
        // The only thing under test here is that nothing crashed; the real parsing
        // assertions live in check 1b.
        c.isTrue('AI layer is reachable, so only crash-safety is asserted',
          Array.isArray(items), true,
          `expected an array from the live API, got ${preview(items)}`);
      } else {
        c.isTrue('returned an empty array rather than guessing at quantities',
          Array.isArray(items) && items.length === 0, true,
          `expected [] when the AI layer is unavailable, got ${preview(items)}`);
      }
      c.finish();
    });
  }

  // ── Check 4: HTTP level ──────────────────────────────────────────────────
  const HTTP_INSTRUCTIONS =
    'Start the server with `npm run dev` in another terminal, then re-run this script with --http to test the live endpoints';

  if (!WITH_HTTP) {
    skipCheck('4a', 'HTTP · unauthenticated requests rejected (401)', `not requested — ${HTTP_INSTRUCTIONS}`);
    skipCheck('4b', 'HTTP · authenticated explain response shape', `not requested — ${HTTP_INSTRUCTIONS}`);
    skipCheck('4c', 'HTTP · authenticated parse-donation response shape', `not requested — ${HTTP_INSTRUCTIONS}`);
  } else {
    const baseUrl = process.env.AI_VERIFY_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const health = await request('GET', '/api/health', { timeout: 8000 });
    const serverUp = health.status === 200;

    if (!serverUp) {
      const reason = `server not reachable at ${baseUrl} (${health.error || `status ${health.status}`}) — ${HTTP_INSTRUCTIONS}`;
      skipCheck('4a', 'HTTP · unauthenticated requests rejected (401)', reason);
      skipCheck('4b', 'HTTP · authenticated explain response shape', reason);
      skipCheck('4c', 'HTTP · authenticated parse-donation response shape', reason);
    } else {
      console.log(`\n(server reachable at ${baseUrl})`);

      await runCheck('4a', 'HTTP · unauthenticated requests rejected (401)', async (c) => {
        const explainRes = await request('POST', '/api/v1/ai/explain', {
          body: { requirementId: '11111111-1111-4111-8111-111111111111', matchMetadata: {} },
        });
        console.log(`   POST /api/v1/ai/explain        -> ${explainRes.status} ${preview(explainRes.body)}`);
        c.equal('POST /api/v1/ai/explain returns 401 without a token', explainRes.status, 401);
        c.equal('  ...with success:false envelope', explainRes.body?.success, false);

        const parseRes = await request('POST', '/api/v1/ai/parse-donation', {
          body: { text: '5 kg moong dal' },
        });
        console.log(`   POST /api/v1/ai/parse-donation  -> ${parseRes.status} ${preview(parseRes.body)}`);
        c.equal('POST /api/v1/ai/parse-donation returns 401 without a token', parseRes.status, 401);
        c.equal('  ...with success:false envelope', parseRes.body?.success, false);
        c.finish();
      });

      const token = process.env.TEST_FIREBASE_TOKEN;

      if (!token) {
        const reason = 'skipped — no test token provided (set TEST_FIREBASE_TOKEN to run this sub-check)';
        skipCheck('4b', 'HTTP · authenticated explain response shape', reason);
        skipCheck('4c', 'HTTP · authenticated parse-donation response shape', reason);
      } else {
        await runCheck('4b', 'HTTP · authenticated explain response shape', async (c) => {
          const context = await discoverLiveMatchContext();
          console.log(`   using requirement ${context.requirementId} (${context.district}, indicator ${context.indicatorName})`);

          const res = await request('POST', '/api/v1/ai/explain', {
            token,
            body: { requirementId: context.requirementId, matchMetadata: context.matchMetadata },
          });
          console.log(`   response: ${preview(res.body)}`);

          c.equal('status is 200', res.status, 200);
          c.equal('envelope success === true', res.body?.success, true);
          c.isTrue('data.explanation is a non-empty string',
            typeof res.body?.data?.explanation === 'string' && res.body.data.explanation.trim().length > 0, true);
          c.isTrue('data.source is "ai" or "fallback"',
            ['ai', 'fallback'].includes(res.body?.data?.source), true,
            `got ${preview(res.body?.data?.source)}`);
          c.isTrue('data.dataSource is reported so the UI can label fallback districts',
            typeof res.body?.data?.dataSource === 'string' && res.body.data.dataSource.length > 0, true,
            'the reference dataset requires data_source to be surfaced');
          c.finish();
        });

        await runCheck('4c', 'HTTP · authenticated parse-donation response shape', async (c) => {
          const res = await request('POST', '/api/v1/ai/parse-donation', {
            token,
            body: { text: AMBIGUOUS_DONATION_TEXT },
          });
          console.log(`   response: ${preview(res.body)}`);

          c.equal('status is 200', res.status, 200);
          c.equal('envelope success === true', res.body?.success, true);
          c.isTrue('data.items is an array', Array.isArray(res.body?.data?.items), true,
            `got ${preview(res.body?.data?.items)}`);
          c.isTrue('data.parsed is a boolean', typeof res.body?.data?.parsed === 'boolean', true);
          if (Array.isArray(res.body?.data?.items)) {
            c.isTrue('every item matches the {item, quantity, unit, confidence} contract',
              res.body.data.items.every((i) => i && typeof i === 'object'
                && 'item' in i && 'quantity' in i && 'unit' in i && 'confidence' in i), true,
              `got ${preview(res.body.data.items)}`);
            c.isTrue('vague quantities are flagged confidence "low", never silently guessed',
              res.body.data.items.length === 0 || res.body.data.items.some((i) => i.confidence === 'low'), true,
              'an empty items array is also acceptable (could not parse → manual fields)');
          }
          c.finish();
        });
      }
    }
  }

  printSummary();
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function printSummary() {
  const failed = results.filter((r) => r.status === 'FAIL');
  const skipped = results.filter((r) => r.status === 'SKIPPED');
  const passed = results.filter((r) => r.status === 'PASS');

  console.log('\n============================================================');
  console.log(' AI LAYER VERIFICATION SUMMARY');
  console.log('============================================================');
  console.log(' RESULT   CHECK');
  console.log(' ------   ----------------------------------------------------------');

  for (const r of results) {
    const label = `${r.id}  ${r.title}`;
    const note = r.status === 'SKIPPED' && r.note ? `\n            ↳ ${r.note}` : '';
    console.log(` ${r.status.padEnd(7)} ${label}${note}`);
  }

  console.log('============================================================');
  console.log(` Passed: ${passed.length}   Failed: ${failed.length}   Skipped: ${skipped.length}`);
  console.log('============================================================');

  if (failed.length > 0) {
    console.log('\n---------------- FAILURE DETAIL ----------------');
    for (const r of failed) {
      console.log(`\n${r.id}  ${r.title}`);
      for (const f of r.failures) {
        console.log(`\n  assertion : ${f.label}`);
        if (f.note) console.log(`  note      : ${f.note}`);
        console.log(`  expected  : ${preview(f.expected)}`);
        console.log(`  actual    : ${preview(f.actual)}`);
      }
    }
    console.log('\n-----------------------------------------------');
  }

  if (!FORCE_NO_AI && !HTTP_ONLY && process.env.GEMINI_API_KEY) {
    console.log('\nNext: run `npm run verify:ai -- --no-ai` to verify graceful degradation without a key.');
  }

  console.log(`\nRESULT: ${failed.length === 0 ? 'OK' : 'FAILED'} (${failed.length} failing check(s))\n`);
  process.exitCode = failed.length === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error('\n💥 Verification script crashed:', error && error.stack ? error.stack : error);
  printSummary();
  process.exitCode = 1;
});
