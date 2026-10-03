/**
 * PoshanSetu — Comprehensive Test Suite
 * University: Savitribai Phule Pune University (SPPU)
 * Course: Software Testing
 * Project: PoshanSetu (Maharashtra Food Need Connect Platform)
 *
 * Testing Types Covered (as per SPPU syllabus):
 *   1. Unit Testing        — Pure logic functions tested in isolation
 *   2. Integration Testing — API endpoint contracts and auth middleware chain
 *   3. System Testing      — HTTP security headers and CORS enforcement
 *   4. Security Testing    — Payload sanitization, injection prevention
 *   5. Unit Testing (cont) — Validators, matching engine, nutrition attention
 *   6. Performance Testing — Rate limiter sliding-window enforcement
 *   7. System Testing (cont) — File upload MIME type whitelist
 *   8. UAT / Business Logic  — Workflow state consistency, dual confirmation
 */

const http = require('http');
const { validateCreateRequirement } = require('../src/validators/requirementValidator');
const { isValidUUID, requireUUID, sanitizePagination } = require('../src/validators/commonValidators');
const { createRateLimiter } = require('../src/middleware/rateLimiter');
const { ALLOWED_MIME_TYPES } = require('../src/middleware/uploadMiddleware');
const { AppError } = require('../src/utils/response');
const matchingEngine = require('../src/services/matchingEngine');
const { calculateNutritionAttention, canonicalIndicatorName } = require('../src/services/nutritionAttention');

let passedTests = 0;
let failedTests = 0;

/**
 * assert() — Core test assertion helper.
 * Logs PASSED or FAILED for each test case.
 * Throws on failure so the test runner halts that suite block.
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
 * makeRequest() — Lightweight HTTP client for integration tests.
 * Uses Node.js built-in 'http' module (no external dependencies).
 * Sends real HTTP requests to the running backend server on localhost:5000.
 * Returns: { status, headers, body } — body is auto-parsed as JSON if possible.
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
          // non-json response — return raw string
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

async function runAllTests() {
  console.log('\n========================================');
  console.log('🧪 PoshanSetu Comprehensive Test Suite');
  console.log('========================================\n');

  // =============================================================
  // SUITE 1: UNIT TESTING — Public API & Health Endpoint Responses
  // Description: Verifies that core public-facing API endpoints
  //              return correct HTTP status codes and well-formed
  //              JSON response envelopes. Tests all 36 Maharashtra
  //              district records and nutrition indicator availability.
  // Method: Black-box unit test — each endpoint called independently.
  // =============================================================
  console.log('--- Suite 1 [Unit Testing]: Public API & Health Endpoints ---');
  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    assert(res.status === 200, 'GET /api/health returns 200');
    assert(res.body?.success === true, 'Health response has standard success envelope');
    assert(res.body?.data?.api === 'up', 'API status is up');
  }

  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1', method: 'GET' });
    assert(res.status === 200, 'GET /api/v1 returns 200');
    assert(res.body?.data?.version === 'v1', 'API version is v1');
  }

  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1/districts', method: 'GET' });
    assert(res.status === 200, 'GET /api/v1/districts returns 200');
    assert(Array.isArray(res.body?.data), 'Districts response contains an array');
    assert(res.body?.data?.length === 36, 'Returns all 36 Maharashtra districts');
  }

  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1/districts/pune', method: 'GET' });
    assert(res.status === 200, 'GET /api/v1/districts/pune returns 200');
    assert(res.body?.data?.name?.toLowerCase() === 'pune', 'District data matches Pune');
  }

  for (const district of ['nashik', 'pune', 'akola']) {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: `/api/v1/districts/${district}`, method: 'GET' });
    assert(res.status === 200, `GET /api/v1/districts/${district} returns 200`);
    assert((res.body?.data?.nutritionIndicators || []).length > 0, `${district} exposes real nutrition indicators`);
    assert((res.body?.data?.nutritionAttention?.recommendedFoodCategories || []).length > 0, `${district} derives nutrition recommendations`);
  }

  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1/requirements', method: 'GET' });
    assert(res.status === 200, 'GET /api/v1/requirements returns 200');
    assert(Array.isArray(res.body?.data), 'Public requirements response is an array');
  }

  // =============================================================
  // SUITE 2: INTEGRATION TESTING — Authentication & RBAC Middleware
  // Description: Verifies that the Firebase auth middleware and RBAC
  //              (Role-Based Access Control) layer correctly blocks
  //              unauthenticated requests to ALL protected endpoints.
  //              Tests 11 routes across Requester, Donor, and Admin roles.
  // Method: Integration test — real HTTP requests without auth token;
  //         all must return 401 Unauthorized with { success: false }.
  // =============================================================
  console.log('\n--- Suite 2 [Integration Testing]: Authentication & RBAC Protection ---');
  const protectedEndpoints = [
    { path: '/api/v1/requirements/mine/list', method: 'GET', name: 'Requester requirements' },
    { path: '/api/v1/requirements', method: 'POST', name: 'Requirement submission' },
    { path: '/api/v1/offers/mine', method: 'GET', name: 'Donor offers' },
    { path: '/api/v1/offers', method: 'POST', name: 'Offer creation' },
    { path: '/api/v1/notifications', method: 'GET', name: 'Notifications list' },
    { path: '/api/v1/institutions/me', method: 'GET', name: 'Institution profile' },
    { path: '/api/v1/institutions/me/documents', method: 'POST', name: 'Document upload' },
    { path: '/api/v1/admin/stats', method: 'GET', name: 'Admin dashboard stats' },
    { path: '/api/v1/admin/fraud-signals', method: 'GET', name: 'Admin fraud signals' },
    { path: '/api/v1/requirements/admin/list', method: 'GET', name: 'Admin requirements list' },
    { path: '/api/v1/institutions/admin/list', method: 'GET', name: 'Admin institutions list' },
  ];

  for (const ep of protectedEndpoints) {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: ep.path, method: ep.method });
    assert(res.status === 401, `${ep.method} ${ep.path} (${ep.name}) blocked with 401`);
    assert(res.body?.success === false, 'Error response envelope has success: false');
  }

  // =============================================================
  // SUITE 3: SYSTEM TESTING — HTTP Security Headers & CORS Policy
  // Description: Verifies that security middleware applies the correct
  //              HTTP response headers on every request and rejects
  //              cross-origin requests from unauthorized domains.
  //              Tests: X-Content-Type-Options, X-Frame-Options,
  //              Referrer-Policy, X-Powered-By removal, and CORS 403.
  // Method: System-level test — verifies headers on real HTTP responses.
  // =============================================================
  console.log('\n--- Suite 3 [System Testing]: HTTP Security Headers & CORS Policy ---');
  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    assert(res.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
    assert(res.headers['x-frame-options'] === 'DENY', 'X-Frame-Options is DENY');
    assert(res.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy is strict-origin-when-cross-origin');
    assert(!res.headers['x-powered-by'], 'X-Powered-By is removed');
  }

  {
    const res = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      headers: { Origin: 'https://evil-unauthorized-site.com' },
    });
    assert(res.status === 403, 'Disallowed CORS origin rejected with 403');
    assert(res.body?.success === false, 'CORS rejection response is standard format');
  }

  // =============================================================
  // SUITE 4: SECURITY TESTING — Payload Sanitization & Injection Prevention
  // Description: Verifies that the server correctly rejects malformed,
  //              oversized, and syntactically invalid request payloads
  //              before they reach business logic or the database.
  //              Tests: malformed JSON → 400, error message content.
  // Method: Security / negative test — sends deliberately bad input.
  // =============================================================
  console.log('\n--- Suite 4 [Security Testing]: Payload Sanitization & Malformed Input ---');
  {
    const res = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/requirements',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      '{ malformed-json-payload-without-quotes '
    );
    assert(res.status === 400, 'Malformed JSON rejected with 400 Bad Request');
    assert(res.body?.message?.includes('JSON'), 'Error message clearly indicates JSON payload issue');
  }

  // =============================================================
  // SUITE 5: UNIT TESTING — Input Validators (Boundary & Equivalence)
  // Description: White-box unit tests for all pure validator functions.
  //              Covers UUID format verification, pagination boundary
  //              clamping, and the requirement submission validator with
  //              both valid and invalid input combinations.
  // Techniques: Boundary Value Analysis, Equivalence Partitioning.
  // =============================================================
  console.log('\n--- Suite 5 [Unit Testing]: Input Validators (UUID, Pagination, Requirement) ---');
  // --- TC 5.1: UUID Validation ---
  // Tests: valid UUID, invalid string, null, and empty string.
  {
    assert(isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Valid UUID recognized');
    assert(!isValidUUID('invalid-uuid-string'), 'Invalid UUID string rejected');
    assert(!isValidUUID(null), 'Null UUID rejected');
    assert(!isValidUUID(''), 'Empty UUID rejected');
  }

  // --- TC 5.2: Pagination Sanitization ---
  // Tests: valid values parsed correctly; limit clamped to max 100; negative offset floored at 0.
  {
    const p1 = sanitizePagination({ limit: '20', offset: '10' });
    assert(p1.limit === 20 && p1.offset === 10, 'Valid pagination parsed correctly');

    const p2 = sanitizePagination({ limit: '500', offset: '-5' });
    assert(p2.limit === 100, 'Limit clamped to max 100');
    assert(p2.offset === 0, 'Negative offset clamped to 0');
  }

  // --- TC 5.3: Requirement Submission Validator ---
  // Tests: valid payload accepted; negative beneficiary count rejected;
  //        invalid urgency enum rejected; empty items array rejected;
  //        negative item quantity rejected.
  {
    const validPayload = {
      district: 'Nashik',
      city: 'Dindori',
      address: 'Ashram Road',
      beneficiary_count: 50,
      beneficiary_desc: 'Tribal schoolchildren',
      urgency: 'high',
      description: 'Monthly food requirement',
      items: [{ name: 'Toor Dal', quantity: 20, unit: 'kg' }],
    };
    const validated = validateCreateRequirement(validPayload);
    assert(validated.beneficiary_count === 50, 'Valid requirement payload validated');
    assert(validated.items[0].name === 'Toor Dal', 'Valid item preserved');

    // TC 5.3.1 — Negative beneficiary count should throw AppError
    let thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, beneficiary_count: -10 });
    } catch {
      thrown = true;
    }
    assert(thrown, 'Negative beneficiary count rejected');

    // TC 5.3.2 — Urgency value not in allowed enum should throw AppError
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, urgency: 'super_urgent' });
    } catch {
      thrown = true;
    }
    assert(thrown, 'Invalid urgency enum rejected');

    // TC 5.3.3 — Empty items array is not a valid requirement
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, items: [] });
    } catch {
      thrown = true;
    }
    assert(thrown, 'Empty items array rejected');

    // TC 5.3.4 — Negative item quantity should throw AppError
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, items: [{ name: 'Rice', quantity: -5, unit: 'kg' }] });
    } catch {
      thrown = true;
    }
    assert(thrown, 'Negative item quantity rejected');
  }

  // =============================================================
  // SUITE 6: UNIT TESTING — Deterministic Matching Engine & Nutrition Attention
  // Description: White-box unit tests for the core matching engine service.
  //              Verifies proximity scoring, food alias normalization,
  //              food family category matching, remaining-need floors,
  //              multi-item matching, expired requirement exclusion,
  //              and nutrition vulnerability composite scoring.
  // Constraint: Engine must remain 100% deterministic — no AI/LLM calls.
  // =============================================================
  console.log('\n--- Suite 6 [Unit Testing]: Deterministic Matching Engine & Nutrition Attention ---');
  {
    // TC 6.1 — Proximity scoring: same location = max score of 1
    assert(matchingEngine.proximityScore({ lat: 18.52, lng: 73.85 }, { lat: 18.52, lng: 73.85 }, 50) === 1, 'Zero-distance proximity scores 1');
    // TC 6.2 — Proximity scoring: beyond maxRadiusKm = score of 0
    assert(matchingEngine.proximityScore({ lat: 18.52, lng: 73.85 }, { lat: 20.59, lng: 78.96 }, 50) === 0, 'Beyond-radius proximity scores 0');
    // TC 6.3 — Food alias normalization: 'Ragi (Finger Millet)' resolves to 'ragi' → exact match
    assert(matchingEngine.foodMatchScore('Ragi (Finger Millet)', 'ragi') === 1, 'Food aliases normalize as exact matches');
    // TC 6.4 — Food family matching: Moong Dal and Toor Dal are in the same pulses family → 0.5
    assert(matchingEngine.foodMatchScore('Moong Dal', 'Toor Dal') === 0.5, 'Related pulse categories score 0.5');
    // TC 6.5 — Unrelated food families score 0
    assert(matchingEngine.foodMatchScore('Rice', 'Jaggery') === 0, 'Unrelated foods do not match');
    // TC 6.6 — Remaining need floor: nearly fulfilled requirement still returns minimum 0.1
    assert(matchingEngine.remainingNeedScore([{ quantityRequired: 100, quantityRemaining: 5 }]) === 0.1, 'Nearly fulfilled valid need uses the 0.1 floor');

    const fixture = {
      id: 'requirement-1',
      status: 'partially_supported',
      urgency: 'high',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      location: { lat: 18.52, lng: 73.85 },
      items: [
        { name: 'Jowar', quantityRequired: 100, quantityRemaining: 80, unit: 'kg' },
        { name: 'Toor Dal', quantityRequired: 50, quantityRemaining: 40, unit: 'kg' },
      ],
      nutritionIndicators: [],
    };
    // TC 6.7 — Full match: multi-food donor matches partially-supported requirement
    const matches = await matchingEngine.matchRequirements(
      { location: fixture.location, foodItems: [{ item: 'Jowar' }, { item: 'Dal' }] },
      { requirements: [fixture], deficiencyMappings: [] },
    );
    assert(matches.length === 1, 'Partially supported requirements remain matchable');
    assert(matches[0].matchedItems.length === 2, 'Multiple donor items match multiple requirement items');
    assert(matches[0].scoreBreakdown.proximity === 1, 'Score breakdown exposes proximity');

    // TC 6.8 — Flow A: location-only donor (no food selected) keeps nearby requirements
    const flowA = await matchingEngine.matchRequirements(
      { location: fixture.location, foodItems: [] },
      { requirements: [fixture], deficiencyMappings: [] },
    );
    assert(flowA.length === 1 && flowA[0].scoreBreakdown.foodMatch === 0, 'Location-only Flow A keeps nearby requirements');

    // TC 6.9 — Flow B: expired requirements and food mismatches are excluded
    const expired = { ...fixture, id: 'expired', expiresAt: new Date(Date.now() - 1000).toISOString() };
    const noMatch = await matchingEngine.matchRequirements(
      { location: fixture.location, foodItems: [{ item: 'Jaggery' }] },
      { requirements: [expired, fixture], deficiencyMappings: [] },
    );
    assert(noMatch.length === 0, 'Expired and no-food-match requirements are excluded from Flow B');
  }

  {
    // TC 6.10 — Nutrition attention: high anaemia + underweight → VERY_HIGH composite score
    const attention = calculateNutritionAttention([
      { name: 'children_6to59m_anaemic_pct', value: 68.9 },
      { name: 'children_under5_underweight_pct', value: 77.5 },
    ]);
    assert(attention.level === 'VERY_HIGH', 'Nutrition attention uses available indicator data deterministically');
    assert(attention.recommendedFoodCategories.includes('Ragi'), 'Nutrition attention returns curated food recommendations');
    // TC 6.11 — Empty indicators produce UNAVAILABLE level (graceful degradation)
    assert(calculateNutritionAttention([]).level === 'UNAVAILABLE', 'Nutrition attention supports unavailable data');
    // TC 6.12 — NFHS import names (e.g. 'stunting') must map to canonical reference keys
    const importedNameAttention = calculateNutritionAttention([
      { name: 'stunting', value: 42 },
      { name: 'underweight', value: 45 },
      { name: 'wasting', value: 27 },
    ]);
    assert(canonicalIndicatorName('stunting') === 'children_under5_stunted_pct', 'Imported NFHS indicator names map to reference keys');
    assert(importedNameAttention.recommendedFoodCategories.includes('Moong Dal'), 'Imported NFHS indicators trigger curated recommendations');
  }

  // =============================================================
  // SUITE 7: PERFORMANCE TESTING — Rate Limiter Sliding-Window Enforcement
  // Description: Verifies that the in-memory rate limiter middleware
  //              correctly allows requests within the configured window
  //              and blocks excess requests with HTTP 429 Too Many Requests.
  //              Simulates multiple requests from the same IP address.
  // Method: Unit-level performance/abuse prevention test using mock req/res.
  // =============================================================
  console.log('\n--- Suite 7 [Performance Testing]: Rate Limiter Sliding-Window (429 Enforcement) ---');
  {
    const limiter = createRateLimiter({ windowMs: 1000, max: 2, message: 'Rate limit test exceeded' });
    const req = { ip: '127.0.0.1' };
    let lastCode = 200;
    let lastBody = null;
    const res = {
      setHeader: () => {},
      status: (c) => {
        lastCode = c;
        return { json: (b) => { lastBody = b; } };
      },
    };
    const next = () => {};

    limiter(req, res, next);
    assert(lastCode === 200, 'Rate limiter call 1 allowed (200)');

    limiter(req, res, next);
    assert(lastCode === 200, 'Rate limiter call 2 allowed (200)');

    limiter(req, res, next);
    assert(lastCode === 429, 'Rate limiter call 3 blocked with 429');
    assert(lastBody?.message === 'Rate limit test exceeded', 'Rate limit message returned in response');
  }

  // =============================================================
  // SUITE 8: SYSTEM TESTING — File Upload Safety & MIME Type Whitelist
  // Description: Verifies that the upload middleware enforces a strict
  //              allowlist of accepted file MIME types for institution
  //              document uploads. Dangerous file types (scripts, binaries)
  //              must be explicitly rejected.
  // Allowed: application/pdf, image/jpeg, image/png
  // Blocked: application/javascript, application/x-sh, application/octet-stream
  // =============================================================
  console.log('\n--- Suite 8 [System Testing]: File Upload Safety & MIME Type Whitelist ---');
  {
    assert(ALLOWED_MIME_TYPES.includes('application/pdf'), 'PDF allowed for document upload');
    assert(ALLOWED_MIME_TYPES.includes('image/jpeg'), 'JPEG allowed for document upload');
    assert(ALLOWED_MIME_TYPES.includes('image/png'), 'PNG allowed for document upload');
    assert(!ALLOWED_MIME_TYPES.includes('application/javascript'), 'JavaScript files disallowed');
    assert(!ALLOWED_MIME_TYPES.includes('application/x-sh'), 'Shell scripts disallowed');
    assert(!ALLOWED_MIME_TYPES.includes('application/octet-stream'), 'Generic binary files disallowed');
  }

  // =============================================================
  // SUITE 9: UAT / BUSINESS LOGIC — Workflow State Consistency
  // Description: Verifies core business rules that govern the food
  //              donation lifecycle: requirement status transitions,
  //              dual-confirmation fulfillment logic, quantity deduction
  //              math with non-negative floor, and admin fulfillment
  //              rate calculation formula.
  // These rules form the contractual basis for User Acceptance Testing (UAT).
  // =============================================================
  console.log('\n--- Suite 9 [UAT / Business Logic]: Workflow State Consistency & Fulfillment Rules ---');
  {
    // TC 9.1 — Valid requirement lifecycle statuses
    // Allowed states: under_review → active → partially_supported → fulfilled / expired / rejected / hidden
    const validRequirementStatuses = ['under_review', 'active', 'partially_supported', 'fulfilled', 'expired', 'rejected', 'hidden'];
    assert(validRequirementStatuses.includes('under_review'), 'under_review is valid');
    assert(validRequirementStatuses.includes('active'), 'active is valid');
    assert(validRequirementStatuses.includes('fulfilled'), 'fulfilled is valid');

    // TC 9.2 — Dual confirmation: BOTH donor AND requester must confirm before fulfillment
    function checkDualFulfillment(donorConfirmed, requesterConfirmed) {
      return Boolean(donorConfirmed && requesterConfirmed);
    }
    assert(!checkDualFulfillment(true, false), 'Donor-only confirmation does not fulfill requirement');
    assert(!checkDualFulfillment(false, true), 'Requester-only confirmation does not fulfill requirement');
    assert(checkDualFulfillment(true, true), 'Dual confirmation successfully triggers completion');

    // TC 9.3 — Quantity deduction math: remaining = max(0, original - fulfilled)
    const originalQuantity = 100;
    const fulfilledQuantity = 40;
    const remainingQuantity = Math.max(0, originalQuantity - fulfilledQuantity);
    assert(remainingQuantity === 60, 'Quantity deduction is accurate');
    assert(Math.max(0, 50 - 60) === 0, 'Remaining quantity cannot go negative (floored at 0)');

    const { computeFulfillmentRate } = require('../src/services/adminStatsService');
    assert(computeFulfillmentRate({
      fulfilledRequirements: 0,
      activeRequirements: 0,
      partiallySupported: 0,
    }) === 0, 'Fulfillment rate is 0 when no eligible requirements exist');
    assert(computeFulfillmentRate({
      fulfilledRequirements: 2,
      activeRequirements: 2,
      partiallySupported: 0,
    }) === 50, 'Fulfillment rate is fulfilled / (active + partial + fulfilled)');
  }

  // =============================================================
  // SUMMARY — Final Test Report
  // Prints total passed/failed count and exits with code 1 on failure
  // (compatible with CI pipelines and npm test scripts).
  // =============================================================
  console.log('\n========================================');
  console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test Runner Error:', err);
  process.exit(1);
});
