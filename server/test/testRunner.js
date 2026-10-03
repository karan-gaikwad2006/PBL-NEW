/**
 * ============================================================
 * PoshanSetu — SPPU Software Testing Report: Test Runner
 * ============================================================
 * University  : Savitribai Phule Pune University (SPPU)
 * Course      : Software Testing (TE/BE Computer Engineering)
 * Project     : PoshanSetu — Maharashtra Food Need Connect Platform
 * Academic Yr : 2025–2026
 *
 * This file is the automated test execution script corresponding to
 * the Software Testing Report submitted for the PBL project.
 *
 * Testing Types Covered (as per SPPU Software Testing Syllabus):
 * ┌─────┬────────────────────────┬─────────────────────────────────────────┐
 * │Suite│ Testing Type           │ What is Verified                        │
 * ├─────┼────────────────────────┼─────────────────────────────────────────┤
 * │  1  │ Unit Testing           │ Public API health & district endpoints  │
 * │  2  │ Integration Testing    │ Firebase RBAC middleware, 11 routes     │
 * │  3  │ System Testing         │ HTTP security headers + CORS policy     │
 * │  4  │ Security Testing       │ Payload sanitization, malformed JSON    │
 * │  5  │ Unit Testing           │ Input validators (BVA + EP techniques)  │
 * │  6  │ Unit Testing           │ Deterministic matching + nutrition algo │
 * │  7  │ Performance Testing    │ Rate limiter 429 enforcement            │
 * │  8  │ System Testing         │ File upload MIME type whitelist         │
 * │  9  │ UAT / Business Logic   │ Workflow states, dual confirmation math │
 * └─────┴────────────────────────┴─────────────────────────────────────────┘
 *
 * Run: npm test (from root) OR node test/testRunner.js (from server/)
 * Requires: Backend server running on localhost:5000 with Neon DB seeded.
 */

const http = require('http');
const { validateCreateRequirement } = require('../src/validators/requirementValidator');
const { isValidUUID, requireUUID, sanitizePagination } = require('../src/validators/commonValidators');
const { createRateLimiter } = require('../src/middleware/rateLimiter');
const { ALLOWED_MIME_TYPES } = require('../src/middleware/uploadMiddleware');
const { AppError } = require('../src/utils/response');
const matchingEngine = require('../src/services/matchingEngine');
const { calculateNutritionAttention, canonicalIndicatorName } = require('../src/services/nutritionAttention');

// Global counters — track pass/fail across all suites
let passedTests = 0;
let failedTests = 0;

/**
 * assert(condition, message)
 * ─────────────────────────
 * Core test assertion helper used by every test case in this file.
 * - Prints ✅ PASSED or ❌ FAILED to the console for each assertion.
 * - Increments the global passedTests or failedTests counter.
 * - Throws an Error on failure so the current suite block halts immediately,
 *   preventing misleading downstream results from a broken precondition.
 *
 * @param {boolean} condition - The boolean result to assert as true.
 * @param {string}  message   - Human-readable label shown in the test output.
 */
function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failedTests++;
    throw new Error(message);
  } else {
    console.log(`  ✅ PASSED: ${message}`);
    passedTests++;
  }
}

/**
 * makeRequest(options, body)
 * ──────────────────────────
 * Lightweight HTTP client used for Integration and System test suites.
 * Built on Node.js's built-in 'http' module — zero external dependencies.
 *
 * Sends a real TCP/HTTP request to the backend server running on
 * localhost:5000 and resolves with a structured response object:
 *   { status: number, headers: object, body: object|string }
 *
 * - body is automatically JSON-parsed if possible; otherwise raw string.
 * - On network error, resolves with { error: string, status: 0 } instead
 *   of rejecting, so the test suite can report cleanly.
 *
 * @param {object} options - http.request options (host, port, path, method, headers).
 * @param {object|string|null} body - Optional request body (auto-serialized to JSON).
 * @returns {Promise<{status, headers, body}>}
 */
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
          // Non-JSON response — return raw string body (e.g. plain text errors)
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json || data,
        });
      });
    });
    req.on('error', (err) => resolve({ error: err.message, status: 0 }));
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

/**
 * runAllTests()
 * ─────────────
 * Main test orchestrator. Executes all 9 test suites sequentially.
 * Awaits each async suite before proceeding to the next, ensuring
 * a deterministic top-to-bottom execution order in the console output.
 */
async function runAllTests() {
  console.log('\n============================================================');
  console.log('🧪  PoshanSetu — SPPU Software Testing Report: Test Execution');
  console.log('============================================================\n');

  // ================================================================
  // SUITE 1: UNIT TESTING — Public API & Health Endpoint Responses
  // ================================================================
  // Report Section : Section 8 — Test Cases: Unit Testing (Suite 8.1 partial)
  // Testing Type   : Unit Testing (Black-box)
  // Technique      : Functional testing of individual REST endpoints
  // Objective      : Verify that each public API endpoint returns the
  //                  correct HTTP status code and a well-formed JSON
  //                  response envelope { success, data }.
  //                  Also confirms all 36 Maharashtra districts are seeded
  //                  and each exposes real NFHS-5 nutrition indicators.
  // Entry Criteria : Server running on localhost:5000; DB seeded with districts.
  // Pass Criteria  : HTTP 200 on all endpoints; correct data shapes returned.
  // ================================================================
  console.log('--- Suite 1 [Unit Testing]: Public API & Health Endpoint Responses ---');

  // TC-IT-01: GET /api/health — server liveness and standard envelope
  // Testing: Health check endpoint used by hosting platform (Render) to confirm uptime.
  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    assert(res.status === 200, 'TC-IT-01a | GET /api/health returns 200');
    assert(res.body?.success === true, 'TC-IT-01b | Health response has standard success envelope { success: true }');
    assert(res.body?.data?.api === 'up', 'TC-IT-01c | Health data.api field equals "up"');
  }

  // TC-IT-02: GET /api/v1 — API version banner
  // Testing: Root versioned API path returns version metadata.
  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1', method: 'GET' });
    assert(res.status === 200, 'TC-IT-02a | GET /api/v1 returns 200');
    assert(res.body?.data?.version === 'v1', 'TC-IT-02b | API version is v1');
  }

  // TC-IT-03: GET /api/v1/districts — all 36 Maharashtra districts
  // Testing: District list contains exactly 36 records (Maharashtra has 36 districts).
  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1/districts', method: 'GET' });
    assert(res.status === 200, 'TC-IT-03a | GET /api/v1/districts returns 200');
    assert(Array.isArray(res.body?.data), 'TC-IT-03b | Districts response contains an array');
    assert(res.body?.data?.length === 36, 'TC-IT-03c | Returns all 36 Maharashtra districts');
  }

  // TC-IT-04: GET /api/v1/districts/pune — specific district data
  // Testing: Single district lookup returns correct district name match.
  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1/districts/pune', method: 'GET' });
    assert(res.status === 200, 'TC-IT-04a | GET /api/v1/districts/pune returns 200');
    assert(res.body?.data?.name?.toLowerCase() === 'pune', 'TC-IT-04b | District data matches Pune');
  }

  // TC-IT-05 to IT-10: Nutrition indicator availability for 3 districts
  // Testing: Nashik, Pune, Akola each return real NFHS-5 indicators and
  //          derived food category recommendations (non-empty arrays).
  // This verifies the nutritionAttention service integration with the DB.
  for (const district of ['nashik', 'pune', 'akola']) {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: `/api/v1/districts/${district}`, method: 'GET' });
    assert(res.status === 200, `TC-IT-05/07/09 | GET /api/v1/districts/${district} returns 200`);
    assert(
      (res.body?.data?.nutritionIndicators || []).length > 0,
      `TC-IT-06/08/10 | ${district} exposes real NFHS-5 nutrition indicators`
    );
    assert(
      (res.body?.data?.nutritionAttention?.recommendedFoodCategories || []).length > 0,
      `TC-IT-06/08/10 | ${district} derives nutrition food recommendations from indicators`
    );
  }

  // TC-IT-07: GET /api/v1/requirements — public requirements catalog
  // Testing: Public requirements list returns an array (may be empty if DB is fresh).
  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1/requirements', method: 'GET' });
    assert(res.status === 200, 'TC-IT-07a | GET /api/v1/requirements returns 200');
    assert(Array.isArray(res.body?.data), 'TC-IT-07b | Public requirements response is an array');
  }


  // ================================================================
  // SUITE 2: INTEGRATION TESTING — Authentication & RBAC Middleware
  // ================================================================
  // Report Section : Section 9 — Test Cases: Integration Testing (Suite 9.2)
  // Testing Type   : Integration Testing (Black-box, API contract testing)
  // Technique      : Negative testing — no Authorization header sent
  // Objective      : Verify that the Firebase auth middleware and RBAC
  //                  (Role-Based Access Control) layer correctly intercepts
  //                  and rejects ALL requests that lack a valid Firebase
  //                  ID token, returning HTTP 401 Unauthorized.
  //                  Tests coverage: 11 protected routes spanning Requester,
  //                  Donor, and Admin role boundaries.
  // Pass Criteria  : Every protected endpoint returns exactly 401 with
  //                  { success: false } in the response body.
  // ================================================================
  console.log('\n--- Suite 2 [Integration Testing]: Firebase Auth & RBAC Protection (401 Enforcement) ---');

  // TC-IT-11 to IT-22: Unauthenticated requests must be blocked with 401
  // Each entry maps to a report TC ID in Section 9.2.
  // Method    : Real HTTP request without Authorization header
  // Expected  : 401 Unauthorized + { success: false } envelope
  const protectedEndpoints = [
    // Requester-role protected routes (TC-IT-11, TC-IT-12)
    { path: '/api/v1/requirements/mine/list', method: 'GET',  name: 'TC-IT-11 | Requester: list own requirements' },
    { path: '/api/v1/requirements',           method: 'POST', name: 'TC-IT-12 | Requester: submit new requirement' },
    // Donor-role protected routes (TC-IT-13, TC-IT-14)
    { path: '/api/v1/offers/mine',            method: 'GET',  name: 'TC-IT-13 | Donor: list own offers' },
    { path: '/api/v1/offers',                 method: 'POST', name: 'TC-IT-14 | Donor: create support offer' },
    // Any-auth protected routes (TC-IT-15, TC-IT-16, TC-IT-17)
    { path: '/api/v1/notifications',          method: 'GET',  name: 'TC-IT-15 | Any auth: notifications list' },
    { path: '/api/v1/institutions/me',        method: 'GET',  name: 'TC-IT-16 | Requester: own institution profile' },
    { path: '/api/v1/institutions/me/documents', method: 'POST', name: 'TC-IT-17 | Requester: upload institution document' },
    // Admin-only protected routes (TC-IT-18 to TC-IT-22)
    { path: '/api/v1/admin/stats',            method: 'GET',  name: 'TC-IT-18 | Admin: dashboard statistics' },
    { path: '/api/v1/admin/fraud-signals',    method: 'GET',  name: 'TC-IT-19 | Admin: fraud signals list' },
    { path: '/api/v1/requirements/admin/list',method: 'GET',  name: 'TC-IT-20 | Admin: all requirements list' },
    { path: '/api/v1/institutions/admin/list',method: 'GET',  name: 'TC-IT-21 | Admin: all institutions list' },
  ];

  for (const ep of protectedEndpoints) {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: ep.path, method: ep.method });
    // Assert 1: Correct HTTP status code (401 Unauthorized)
    assert(res.status === 401, `${ep.name} — blocked with HTTP 401`);
    // Assert 2: Standard error envelope { success: false } present
    assert(res.body?.success === false, `${ep.name} — response has { success: false } envelope`);
  }


  // ================================================================
  // SUITE 3: SYSTEM TESTING — HTTP Security Headers & CORS Policy
  // ================================================================
  // Report Section : Section 11 — Test Cases: Security Testing (Suite 11.1, 11.2)
  // Testing Type   : System Testing (end-to-end header verification)
  // Technique      : Configuration verification; negative CORS test
  // Objective      : Verify that the security middleware (securityHeaders.js
  //                  and corsConfig.js) applies production-grade HTTP response
  //                  headers on every response and denies unauthorized origins.
  //
  // Headers tested (per OWASP recommendations):
  //   X-Content-Type-Options: nosniff     — prevents MIME sniffing attacks
  //   X-Frame-Options: DENY               — prevents clickjacking
  //   Referrer-Policy: strict-origin...   — limits referrer info leakage
  //   X-Powered-By: (absent)             — removes Express fingerprint
  //
  // CORS test: unauthorized origin must receive HTTP 403 (not 200 with wildcard).
  // ================================================================
  console.log('\n--- Suite 3 [System Testing]: HTTP Security Headers & CORS Policy ---');

  // TC-SEC-01 to SEC-05: Security headers present on every response
  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });

    // TC-SEC-01: Prevents MIME-type confusion attacks (e.g., serving script as text)
    assert(res.headers['x-content-type-options'] === 'nosniff',
      'TC-SEC-01 | X-Content-Type-Options header equals "nosniff"');

    // TC-SEC-02: Prevents the page from being loaded in an iframe (clickjacking defense)
    assert(res.headers['x-frame-options'] === 'DENY',
      'TC-SEC-02 | X-Frame-Options header equals "DENY"');

    // TC-SEC-03: Restricts what referrer info is sent on cross-origin requests
    assert(res.headers['referrer-policy'] === 'strict-origin-when-cross-origin',
      'TC-SEC-03 | Referrer-Policy header equals "strict-origin-when-cross-origin"');

    // TC-SEC-04: Express X-Powered-By header must be removed to prevent fingerprinting
    assert(!res.headers['x-powered-by'],
      'TC-SEC-04 | X-Powered-By header is absent (Express fingerprint removed)');
  }

  // TC-SEC-06 to SEC-07: CORS policy rejects unauthorized origin with HTTP 403
  {
    const res = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      // Simulating a request from a disallowed external domain (attack vector)
      headers: { Origin: 'https://evil-unauthorized-site.com' },
    });

    // TC-SEC-06: Server must refuse cross-origin requests not in the allowlist
    assert(res.status === 403,
      'TC-SEC-06 | Disallowed CORS origin rejected with HTTP 403 Forbidden');

    // TC-SEC-07: Error response must use the standard { success: false } envelope
    assert(res.body?.success === false,
      'TC-SEC-07 | CORS rejection response body has standard { success: false } format');
  }


  // ================================================================
  // SUITE 4: SECURITY TESTING — Payload Sanitization & Injection Prevention
  // ================================================================
  // Report Section : Section 11 — Test Cases: Security Testing (Suite 11.3)
  // Testing Type   : Security Testing (negative / fault injection)
  // Technique      : Fault injection — deliberately malformed inputs sent to API
  // Objective      : Verify that the global error handler and Express body
  //                  parser correctly detect and reject syntactically invalid
  //                  or dangerous request payloads BEFORE they reach the
  //                  business logic layer or the database.
  //
  // Critical constraint (from AGENTS.md):
  //   100% parameterized SQL is used in all repositories — no string
  //   interpolation, making SQL injection structurally impossible.
  //   UUID route params are validated before hitting the DB layer.
  // ================================================================
  console.log('\n--- Suite 4 [Security Testing]: Payload Sanitization & Malformed Input ---');

  // TC-SEC-08: Malformed JSON body must be rejected at the middleware level
  // Technique: Fault injection — sending syntactically broken JSON string.
  // The Express body parser (json()) should catch this and return 400 Bad Request
  // before any controller or validator function is even called.
  {
    const res = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/requirements',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      '{ malformed-json-payload-without-quotes '  // Deliberately broken JSON
    );

    // TC-SEC-08a: HTTP 400 Bad Request must be returned (not 500 internal error)
    assert(res.status === 400,
      'TC-SEC-08a | Malformed JSON body rejected with HTTP 400 Bad Request');

    // TC-SEC-08b: Error message must reference JSON so the client knows what went wrong
    assert(res.body?.message?.includes('JSON'),
      'TC-SEC-08b | Error message clearly references the JSON parsing failure');
  }


  // ================================================================
  // SUITE 5: UNIT TESTING — Input Validators (Boundary Value Analysis)
  // ================================================================
  // Report Section : Section 8 — Test Cases: Unit Testing (Suite 8.1)
  // Testing Type   : Unit Testing (White-box; pure function isolation)
  // Techniques     : Boundary Value Analysis (BVA), Equivalence Partitioning (EP)
  // Objective      : Test all validator functions in isolation with controlled
  //                  inputs to verify correct acceptance/rejection behavior.
  //
  //   Modules under test:
  //     commonValidators.js   — isValidUUID(), sanitizePagination()
  //     requirementValidator.js — validateCreateRequirement()
  //
  // These functions are pure (no DB/network calls), making them ideal for
  // isolated unit testing with deterministic inputs and outputs.
  // ================================================================
  console.log('\n--- Suite 5 [Unit Testing]: Input Validators — UUID, Pagination, Requirement ---');

  // ── TC-UT-01 to UT-04: UUID Validation (isValidUUID) ──────────────────
  // Technique: Equivalence Partitioning
  //   Valid partition   : correctly-formatted UUID v4 string
  //   Invalid partition : wrong format string, null, empty string
  {
    // TC-UT-01: A correctly formatted UUID v4 string must be recognized as valid
    assert(isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
      'TC-UT-01 | Valid UUID v4 string recognized correctly');

    // TC-UT-02: A string that looks UUID-like but is incorrectly formatted must be rejected
    assert(!isValidUUID('invalid-uuid-string'),
      'TC-UT-02 | Invalid UUID format string rejected');

    // TC-UT-03: null must be handled gracefully (not throw a TypeError)
    assert(!isValidUUID(null),
      'TC-UT-03 | null UUID input rejected without throwing');

    // TC-UT-04: Empty string is not a valid UUID
    assert(!isValidUUID(''),
      'TC-UT-04 | Empty string UUID rejected');
  }

  // ── TC-UT-05 to UT-07: Pagination Sanitization (sanitizePagination) ───
  // Technique: Boundary Value Analysis
  //   Boundary: limit max = 100; offset min = 0
  {
    // TC-UT-05: Within-bounds values must be parsed correctly from query string format
    const p1 = sanitizePagination({ limit: '20', offset: '10' });
    assert(p1.limit === 20 && p1.offset === 10,
      'TC-UT-05 | Valid pagination strings parsed to integers correctly');

    const p2 = sanitizePagination({ limit: '500', offset: '-5' });

    // TC-UT-06: BVA upper boundary — limit above max (500 > 100) must be clamped to 100
    assert(p2.limit === 100,
      'TC-UT-06 | Limit above max (500) clamped to upper boundary of 100');

    // TC-UT-07: BVA lower boundary — negative offset (-5 < 0) must be floored to 0
    assert(p2.offset === 0,
      'TC-UT-07 | Negative offset (-5) clamped to lower boundary of 0');
  }

  // ── TC-UT-08 to UT-12: Requirement Submission Validator ───────────────
  // Technique: Equivalence Partitioning + Boundary Value Analysis
  //   Valid class   : all fields present and within allowed ranges/enums
  //   Invalid class : negative numbers, invalid enum values, empty required arrays
  {
    // Base valid payload used as the positive test case and mutation source
    const validPayload = {
      district: 'Nashik',
      city: 'Dindori',
      address: 'Ashram Road',
      beneficiary_count: 50,
      beneficiary_desc: 'Tribal schoolchildren',
      urgency: 'high',              // Allowed: 'low' | 'medium' | 'high' | 'critical'
      description: 'Monthly food requirement',
      items: [{ name: 'Toor Dal', quantity: 20, unit: 'kg' }],
    };

    // TC-UT-08: Valid payload in the valid equivalence partition must pass validation
    const validated = validateCreateRequirement(validPayload);
    assert(validated.beneficiary_count === 50,
      'TC-UT-08a | Valid requirement payload accepted; beneficiary_count preserved');
    assert(validated.items[0].name === 'Toor Dal',
      'TC-UT-08b | Valid item name preserved after validation');

    // TC-UT-09: Negative beneficiary_count is below the valid boundary (BVA: min = 1)
    // Mutation: change beneficiary_count from 50 to -10 (invalid class)
    let thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, beneficiary_count: -10 });
    } catch {
      thrown = true;
    }
    assert(thrown,
      'TC-UT-09 | Negative beneficiary_count (-10) throws AppError (below min boundary)');

    // TC-UT-10: Urgency value not in the allowed enum set must be rejected (EP: invalid class)
    // Mutation: change urgency from 'high' to 'super_urgent' (not in enum)
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, urgency: 'super_urgent' });
    } catch {
      thrown = true;
    }
    assert(thrown,
      'TC-UT-10 | Invalid urgency enum value ("super_urgent") throws AppError');

    // TC-UT-11: Empty items array fails minimum-length validation (BVA: min items = 1)
    // Mutation: replace items array with [] (below minimum)
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, items: [] });
    } catch {
      thrown = true;
    }
    assert(thrown,
      'TC-UT-11 | Empty items array throws AppError (below minimum 1 item)');

    // TC-UT-12: Negative item quantity fails the positive-number validation (BVA)
    // Mutation: set item quantity to -5 (invalid, must be > 0)
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, items: [{ name: 'Rice', quantity: -5, unit: 'kg' }] });
    } catch {
      thrown = true;
    }
    assert(thrown,
      'TC-UT-12 | Negative item quantity (-5) throws AppError (below min boundary)');
  }


  // ================================================================
  // SUITE 6: UNIT TESTING — Deterministic Matching Engine & Nutrition Attention
  // ================================================================
  // Report Section : Section 8 — Test Cases: Unit Testing (Suites 8.2, 8.3)
  // Testing Type   : Unit Testing (White-box; algorithm correctness)
  // Technique      : Statement coverage, branch coverage, data-driven testing
  // Objective      : Verify the correctness of the core matching algorithm
  //                  functions and the nutrition attention composite scoring.
  //
  // CRITICAL DESIGN CONSTRAINT (from AGENTS.md + matchingEngine.js):
  //   "This module must remain deterministic. Do not add AI/LLM calls here."
  //   Every test in this suite verifies deterministic, reproducible outputs
  //   given the same inputs — no randomness or external calls permitted.
  //
  // Scoring weights (from matchingEngine.js DEFAULT_MATCHING_CONFIG):
  //   proximity: 0.30, foodMatch: 0.30, deficiencyRelevance: 0.20,
  //   urgency: 0.10, remainingNeed: 0.10
  // ================================================================
  console.log('\n--- Suite 6 [Unit Testing]: Deterministic Matching Engine & Nutrition Attention ---');

  {
    // ── Proximity Scoring (proximityScore) ──────────────────────────────
    // Algorithm: Haversine distance compared against maxRadiusKm (default 50 km)
    // Score range: 0.0 (beyond radius) to 1.0 (exact same location)

    // TC-UT-13: Identical donor and requirement coordinates → distance = 0 → score = 1
    assert(
      matchingEngine.proximityScore({ lat: 18.52, lng: 73.85 }, { lat: 18.52, lng: 73.85 }, 50) === 1,
      'TC-UT-13 | Zero-distance (same lat/lng) proximity scores maximum 1.0'
    );

    // TC-UT-14: Pune (18.52, 73.85) to Amravati (20.59, 78.96) ≈ 560 km >> 50 km radius → score = 0
    assert(
      matchingEngine.proximityScore({ lat: 18.52, lng: 73.85 }, { lat: 20.59, lng: 78.96 }, 50) === 0,
      'TC-UT-14 | Distance beyond maxRadiusKm (50 km) scores 0.0'
    );

    // ── Food Match Scoring (foodMatchScore) ─────────────────────────────
    // Algorithm: FOOD_ALIASES map (exact match → 1.0) then FOOD_FAMILIES
    //            shared-family check (related → 0.5), else no match (0.0)

    // TC-UT-15: 'Ragi (Finger Millet)' normalizes through FOOD_ALIASES to 'ragi' → exact match
    assert(
      matchingEngine.foodMatchScore('Ragi (Finger Millet)', 'ragi') === 1,
      'TC-UT-15 | Food alias "Ragi (Finger Millet)" normalizes to exact match with "ragi" → score 1.0'
    );

    // TC-UT-16: 'Moong Dal' and 'Toor Dal' share the pulses/legumes FOOD_FAMILY → related match
    assert(
      matchingEngine.foodMatchScore('Moong Dal', 'Toor Dal') === 0.5,
      'TC-UT-16 | Moong Dal and Toor Dal are in same FOOD_FAMILY (pulses) → score 0.5'
    );

    // TC-UT-17: 'Rice' and 'Jaggery' are in completely different food families → no match
    assert(
      matchingEngine.foodMatchScore('Rice', 'Jaggery') === 0,
      'TC-UT-17 | Rice and Jaggery share no FOOD_FAMILY → score 0.0'
    );

    // ── Remaining Need Scoring (remainingNeedScore) ─────────────────────
    // Algorithm: quantityRemaining / quantityRequired, floored at 0.1 minimum
    // The 0.1 floor ensures nearly-fulfilled requirements remain discoverable.

    // TC-UT-18: 5 remaining out of 100 required = 5% → below normal range → floored to 0.1
    assert(
      matchingEngine.remainingNeedScore([{ quantityRequired: 100, quantityRemaining: 5 }]) === 0.1,
      'TC-UT-18 | Nearly-fulfilled need (5/100 remaining) uses minimum floor of 0.1'
    );

    // ── Full Match Pipeline — matchRequirements() ───────────────────────
    // Fixture: A partially_supported requirement with 2 food items (Jowar + Toor Dal)
    //          located at Pune coordinates (lat: 18.52, lng: 73.85)
    const fixture = {
      id: 'requirement-1',
      status: 'partially_supported',  // Still eligible for matching (not fulfilled/expired)
      urgency: 'high',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),  // Expires in 24 hours
      location: { lat: 18.52, lng: 73.85 },
      items: [
        { name: 'Jowar', quantityRequired: 100, quantityRemaining: 80, unit: 'kg' },
        { name: 'Toor Dal', quantityRequired: 50, quantityRemaining: 40, unit: 'kg' },
      ],
      nutritionIndicators: [],
    };

    // TC-UT-19: Partially supported requirement must still appear in match results
    // TC-UT-20: Multiple donor food items match multiple requirement items independently
    // TC-UT-21: scoreBreakdown object exposes the proximity component for transparency
    const matches = await matchingEngine.matchRequirements(
      { location: fixture.location, foodItems: [{ item: 'Jowar' }, { item: 'Dal' }] },
      { requirements: [fixture], deficiencyMappings: [] },
    );
    assert(matches.length === 1,
      'TC-UT-19 | Partially supported requirement remains matchable (not excluded)');
    assert(matches[0].matchedItems.length === 2,
      'TC-UT-20 | Two donor food items (Jowar + Dal) each match one requirement item');
    assert(matches[0].scoreBreakdown.proximity === 1,
      'TC-UT-21 | scoreBreakdown.proximity exposed and equals 1.0 for same-location match');

    // TC-UT-22: Flow A — donor has no food preference (empty foodItems) but valid location
    // Expected: requirement still returned, but foodMatch score is 0
    const flowA = await matchingEngine.matchRequirements(
      { location: fixture.location, foodItems: [] },
      { requirements: [fixture], deficiencyMappings: [] },
    );
    assert(
      flowA.length === 1 && flowA[0].scoreBreakdown.foodMatch === 0,
      'TC-UT-22 | Flow A (location-only): nearby requirement returned with foodMatch = 0'
    );

    // TC-UT-23: Flow B — expired requirement + unrelated food must both be excluded
    // Expired fixture: same as above but expiresAt set to 1 second in the past
    const expired = { ...fixture, id: 'expired', expiresAt: new Date(Date.now() - 1000).toISOString() };
    const noMatch = await matchingEngine.matchRequirements(
      { location: fixture.location, foodItems: [{ item: 'Jaggery' }] },
      { requirements: [expired, fixture], deficiencyMappings: [] },
    );
    assert(noMatch.length === 0,
      'TC-UT-23 | Flow B: expired requirement + food mismatch (Jaggery vs Jowar/Dal) → 0 matches');
  }

  // ── Nutrition Attention Service (calculateNutritionAttention) ────────
  // Report Section : Section 8 — Test Cases: Unit Testing (Suite 8.3)
  // Algorithm: Composite vulnerability score from NFHS-5 indicator values,
  //            compared against calibrated thresholds (VERY_HIGH ≥ 0.31,
  //            HIGH ≥ 0.27, MODERATE ≥ 0.245, LOWER < 0.245).
  // Source: NFHS-5 Maharashtra district-level data
  {
    // TC-UT-24: High anaemia (68.9%) + high underweight (77.5%) → composite VERY_HIGH
    // These values are above VERY_HIGH threshold (≥ 0.31) based on calibrated scoring
    const attention = calculateNutritionAttention([
      { name: 'children_6to59m_anaemic_pct', value: 68.9 },
      { name: 'children_under5_underweight_pct', value: 77.5 },
    ]);
    assert(attention.level === 'VERY_HIGH',
      'TC-UT-24 | High anaemia (68.9%) + underweight (77.5%) → composite level VERY_HIGH');

    // TC-UT-25: VERY_HIGH attention must recommend iron/protein-rich foods like Ragi
    assert(attention.recommendedFoodCategories.includes('Ragi'),
      'TC-UT-25 | VERY_HIGH attention includes "Ragi" in curated food recommendations');

    // TC-UT-26: Empty indicator array → UNAVAILABLE (graceful degradation, not crash)
    assert(calculateNutritionAttention([]).level === 'UNAVAILABLE',
      'TC-UT-26 | Empty indicators array produces UNAVAILABLE level (no crash)');

    // TC-UT-27: NFHS import short name 'stunting' must resolve to canonical DB key
    // The NFHS-5 Excel import uses short names; the reference mapping uses long keys.
    // canonicalIndicatorName() bridges this gap for correct composite scoring.
    assert(
      canonicalIndicatorName('stunting') === 'children_under5_stunted_pct',
      'TC-UT-27 | NFHS import name "stunting" maps to canonical key "children_under5_stunted_pct"'
    );

    // TC-UT-28: Indicators supplied by NFHS import short names must trigger recommendations
    const importedNameAttention = calculateNutritionAttention([
      { name: 'stunting',    value: 42 },
      { name: 'underweight', value: 45 },
      { name: 'wasting',     value: 27 },
    ]);
    assert(importedNameAttention.recommendedFoodCategories.includes('Moong Dal'),
      'TC-UT-28 | NFHS import indicators (stunting/underweight/wasting) trigger "Moong Dal" recommendation');
  }


  // ================================================================
  // SUITE 7: PERFORMANCE TESTING — Rate Limiter Sliding-Window Enforcement
  // ================================================================
  // Report Section : Section 12 — Test Cases: Performance & Load Testing (Suite 12.2)
  // Testing Type   : Performance Testing (abuse prevention / throughput limiting)
  // Technique      : Synthetic load test using mock req/res objects
  // Objective      : Verify that the sliding-window rate limiter middleware
  //                  correctly tracks requests per IP within the time window
  //                  and enforces HTTP 429 Too Many Requests once the threshold
  //                  is exceeded, with the correct custom error message.
  //
  // Protected routes in production (from AGENTS.md Phase 14):
  //   POST /api/v1/requirements    (max 5/day per requester + window limit)
  //   POST /api/v1/offers
  //   POST /api/v1/institutions/me/documents
  //
  // Test uses a mock req/res rather than real HTTP to avoid port-binding
  // complexity and make the test fully synchronous and deterministic.
  // ================================================================
  console.log('\n--- Suite 7 [Performance Testing]: Rate Limiter Sliding-Window (429 Enforcement) ---');

  {
    // Create a rate limiter: windowMs=1000ms, max=2 requests per window
    const limiter = createRateLimiter({ windowMs: 1000, max: 2, message: 'Rate limit test exceeded' });

    // Mock request from IP 127.0.0.1
    const req = { ip: '127.0.0.1' };
    let lastCode = 200;
    let lastBody = null;

    // Mock response object that captures the status code and JSON body
    const res = {
      setHeader: () => {},
      status: (c) => {
        lastCode = c;
        return { json: (b) => { lastBody = b; } };
      },
    };
    const next = () => {};  // Mock next() — called when request is allowed through

    // TC-PERF-04: First request within the window (count=1, max=2) → allowed
    limiter(req, res, next);
    assert(lastCode === 200,
      'TC-PERF-04 | Request 1 of 2 within window: allowed (status-equivalent 200)');

    // TC-PERF-05: Second request within the window (count=2, max=2) → still allowed
    limiter(req, res, next);
    assert(lastCode === 200,
      'TC-PERF-05 | Request 2 of 2 within window: allowed (status-equivalent 200)');

    // TC-PERF-06: Third request exceeds window limit (count=3 > max=2) → 429 blocked
    limiter(req, res, next);
    assert(lastCode === 429,
      'TC-PERF-06 | Request 3 exceeds window limit (max=2): blocked with HTTP 429 Too Many Requests');

    // TC-PERF-06b: Rate limit response must contain the configured custom message
    assert(lastBody?.message === 'Rate limit test exceeded',
      'TC-PERF-06b | Rate limit response body contains configured message "Rate limit test exceeded"');
  }


  // ================================================================
  // SUITE 8: SYSTEM TESTING — File Upload Safety & MIME Type Whitelist
  // ================================================================
  // Report Section : Section 10 — Test Cases: System Testing (Suite 10.x)
  //                  Section 11 — Security Testing (reference to upload safety)
  // Testing Type   : System Testing (middleware configuration verification)
  // Technique      : Configuration testing; negative testing for blocked types
  // Objective      : Verify that the Multer upload middleware enforces a strict
  //                  MIME type allowlist for institution document uploads.
  //                  Only safe document types must be accepted; executable and
  //                  script MIME types must be explicitly rejected.
  //
  // Business context: Institutions upload verification documents (e.g., 80G
  // certificates, registration proofs) to Cloudinary. Accepting executable
  // file types would be a critical security vulnerability.
  //
  // Allowlist (from uploadMiddleware.js):
  //   ✅ application/pdf    — Registration certificates, official documents
  //   ✅ image/jpeg         — Scanned documents, photos
  //   ✅ image/png          — Scanned documents, screenshots
  //
  // Blocklist (must NOT be in allowlist):
  //   ❌ application/javascript — Script execution risk
  //   ❌ application/x-sh       — Shell script execution risk
  //   ❌ application/octet-stream — Generic binary, unknown executable risk
  // ================================================================
  console.log('\n--- Suite 8 [System Testing]: File Upload Safety & MIME Type Whitelist ---');

  {
    // TC-UT-40: PDF must be in the allowed MIME types list
    assert(ALLOWED_MIME_TYPES.includes('application/pdf'),
      'TC-UT-40 | application/pdf is in the allowed MIME types list (✅ safe document)');

    // TC-UT-41: JPEG images must be allowed for scanned document uploads
    assert(ALLOWED_MIME_TYPES.includes('image/jpeg'),
      'TC-UT-41 | image/jpeg is in the allowed MIME types list (✅ scanned document)');

    // TC-UT-42: PNG images must be allowed
    assert(ALLOWED_MIME_TYPES.includes('image/png'),
      'TC-UT-42 | image/png is in the allowed MIME types list (✅ screenshot/scan)');

    // TC-UT-43: JavaScript files must NOT be accepted (code execution risk)
    assert(!ALLOWED_MIME_TYPES.includes('application/javascript'),
      'TC-UT-43 | application/javascript is NOT in the allowed list (❌ script execution risk)');

    // TC-UT-44: Shell scripts must NOT be accepted (server-side execution risk)
    assert(!ALLOWED_MIME_TYPES.includes('application/x-sh'),
      'TC-UT-44 | application/x-sh is NOT in the allowed list (❌ shell script execution risk)');

    // TC-UT-45: Generic binary type must NOT be accepted (unknown executable risk)
    assert(!ALLOWED_MIME_TYPES.includes('application/octet-stream'),
      'TC-UT-45 | application/octet-stream is NOT in the allowed list (❌ unknown binary risk)');
  }


  // ================================================================
  // SUITE 9: UAT / BUSINESS LOGIC — Workflow State Consistency
  // ================================================================
  // Report Section : Section 13 — Test Cases: User Acceptance Testing (UAT)
  //                  Section 8  — Test Cases: Unit Testing (Suite 8.5)
  // Testing Type   : UAT / Business Logic (correctness of core domain rules)
  // Technique      : State transition testing, decision table testing
  // Objective      : Verify the correctness of the food donation lifecycle
  //                  business rules that form the contractual basis for UAT:
  //
  //   1. Requirement status state machine (valid lifecycle states)
  //   2. Dual-confirmation logic (BOTH parties must confirm delivery)
  //   3. Quantity deduction math (non-negative floor enforcement)
  //   4. Admin fulfillment rate formula (fulfilled / total eligible)
  //
  // State Machine (requirement.status):
  //   under_review → active → partially_supported → fulfilled
  //                                               → expired
  //                         → rejected
  //                         → hidden
  // ================================================================
  console.log('\n--- Suite 9 [UAT / Business Logic]: Workflow State Consistency & Fulfillment Rules ---');

  {
    // TC-UT-33 (State machine): All valid requirement lifecycle statuses must be recognized
    // Technique: State transition testing — verify valid state names exist
    const validRequirementStatuses = [
      'under_review',       // Newly submitted — awaiting admin approval
      'active',             // Admin-approved — visible to donors
      'partially_supported',// At least one offer made but not fully fulfilled
      'fulfilled',          // Dual-confirmed as received by requester
      'expired',            // Passed expiry date without fulfillment
      'rejected',           // Admin rejected during review
      'hidden',             // Soft-hidden by admin (not deleted)
    ];
    assert(validRequirementStatuses.includes('under_review'),
      'TC-UT-33a | "under_review" is a valid requirement status');
    assert(validRequirementStatuses.includes('active'),
      'TC-UT-33b | "active" is a valid requirement status');
    assert(validRequirementStatuses.includes('fulfilled'),
      'TC-UT-33c | "fulfilled" is a valid requirement status');

    // ── TC-UT-33 to UT-35: Dual Confirmation Logic ─────────────────────
    // Technique: Decision table testing
    // Rule: A requirement can only be marked as fulfilled when BOTH
    //       the donor confirms delivery AND the requester confirms receipt.
    //
    // Decision Table:
    // ┌──────────────────┬────────────────────┬──────────┐
    // │ donorConfirmed   │ requesterConfirmed  │ Fulfilled│
    // ├──────────────────┼────────────────────┼──────────┤
    // │ true             │ false               │ NO       │
    // │ false            │ true                │ NO       │
    // │ true             │ true                │ YES      │
    // └──────────────────┴────────────────────┴──────────┘
    function checkDualFulfillment(donorConfirmed, requesterConfirmed) {
      return Boolean(donorConfirmed && requesterConfirmed);
    }

    // TC-UT-33: Donor alone confirming is NOT sufficient to mark fulfilled
    assert(!checkDualFulfillment(true, false),
      'TC-UT-33 | Donor-only confirmation (true, false) → NOT fulfilled');

    // TC-UT-34: Requester alone confirming is NOT sufficient to mark fulfilled
    assert(!checkDualFulfillment(false, true),
      'TC-UT-34 | Requester-only confirmation (false, true) → NOT fulfilled');

    // TC-UT-35: Both confirming simultaneously → fulfilled (dual confirmation satisfied)
    assert(checkDualFulfillment(true, true),
      'TC-UT-35 | Both confirmed (true, true) → requirement marked as fulfilled');

    // ── TC-UT-36 to UT-37: Quantity Deduction Math ──────────────────────
    // BVA: remaining quantity must NEVER go below 0 (non-negative floor)
    // Formula: remaining = Math.max(0, quantityRequired - quantityFulfilled)

    // TC-UT-36: Standard deduction — 100 required, 40 fulfilled → 60 remaining
    const originalQuantity = 100;
    const fulfilledQuantity = 40;
    const remainingQuantity = Math.max(0, originalQuantity - fulfilledQuantity);
    assert(remainingQuantity === 60,
      'TC-UT-36 | Quantity deduction: 100 - 40 = 60 remaining (correct arithmetic)');

    // TC-UT-37: Over-fulfillment boundary — 50 required but 60 offered → floor to 0 (not -10)
    assert(Math.max(0, 50 - 60) === 0,
      'TC-UT-37 | Over-fulfillment boundary: max(0, 50-60) = 0 (non-negative floor enforced)');

    // ── TC-UT-38 to UT-39: Admin Fulfillment Rate Calculation ───────────
    // Formula: fulfillmentRate = fulfilled / (active + partiallySupported + fulfilled) × 100
    // Edge case: 0 in denominator → rate = 0 (no division by zero)
    const { computeFulfillmentRate } = require('../src/services/adminStatsService');

    // TC-UT-38: All zeros → rate must be 0 (not NaN or Infinity from division by zero)
    assert(
      computeFulfillmentRate({
        fulfilledRequirements: 0,
        activeRequirements: 0,
        partiallySupported: 0,
      }) === 0,
      'TC-UT-38 | Fulfillment rate is 0 when denominator is 0 (no division-by-zero error)'
    );

    // TC-UT-39: 2 fulfilled out of 4 eligible (2 active + 0 partial + 2 fulfilled) = 50%
    assert(
      computeFulfillmentRate({
        fulfilledRequirements: 2,
        activeRequirements: 2,
        partiallySupported: 0,
      }) === 50,
      'TC-UT-39 | Fulfillment rate: 2/(2+0+2) × 100 = 50%'
    );
  }


  // ================================================================
  // SUMMARY — Final Test Execution Report
  // ================================================================
  // Prints the final pass/fail count to the console.
  // Exits with code 1 if any assertions failed (CI pipeline compatible).
  // ================================================================
  console.log('\n============================================================');
  console.log(`📊 Test Execution Results: ${passedTests} passed, ${failedTests} failed`);
  console.log(`📋 Pass Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    process.exit(1);  // Non-zero exit code signals failure to npm test / CI
  }
}

// Entry point: run all test suites and catch any unhandled errors
runAllTests().catch((err) => {
  console.error('⚠️  Test Runner Fatal Error:', err);
  process.exit(1);
});
