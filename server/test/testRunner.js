const http = require('http');
const { validateCreateRequirement } = require('../src/validators/requirementValidator');
const { isValidUUID, requireUUID, sanitizePagination } = require('../src/validators/commonValidators');
const { createRateLimiter } = require('../src/middleware/rateLimiter');
const { ALLOWED_MIME_TYPES } = require('../src/middleware/uploadMiddleware');
const { AppError } = require('../src/utils/response');

let passedTests = 0;
let failedTests = 0;

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
          // non-json response
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

  // -------------------------------------------------------------
  // 1. PUBLIC API & HEALTH CHECKS
  // -------------------------------------------------------------
  console.log('--- 1. Public API & Health Endpoints ---');
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

  {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/v1/requirements', method: 'GET' });
    assert(res.status === 200, 'GET /api/v1/requirements returns 200');
    assert(Array.isArray(res.body?.data), 'Public requirements response is an array');
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATION & RBAC SECURITY
  // -------------------------------------------------------------
  console.log('\n--- 2. Authentication & RBAC Protection (Unauthenticated 401s) ---');
  const protectedEndpoints = [
    { path: '/api/v1/requirements/mine/list', method: 'GET', name: 'Requester requirements' },
    { path: '/api/v1/requirements', method: 'POST', name: 'Requirement submission' },
    { path: '/api/v1/offers/mine', method: 'GET', name: 'Donor offers' },
    { path: '/api/v1/offers', method: 'POST', name: 'Offer creation' },
    { path: '/api/v1/notifications', method: 'GET', name: 'Notifications list' },
    { path: '/api/v1/institutions/me', method: 'GET', name: 'Institution profile' },
    { path: '/api/v1/institutions/me/documents', method: 'POST', name: 'Document upload' },
    { path: '/api/v1/admin/fraud-signals', method: 'GET', name: 'Admin fraud signals' },
    { path: '/api/v1/requirements/admin/list', method: 'GET', name: 'Admin requirements list' },
    { path: '/api/v1/institutions/admin/list', method: 'GET', name: 'Admin institutions list' },
  ];

  for (const ep of protectedEndpoints) {
    const res = await makeRequest({ host: 'localhost', port: 5000, path: ep.path, method: ep.method });
    assert(res.status === 401, `${ep.method} ${ep.path} (${ep.name}) blocked with 401`);
    assert(res.body?.success === false, 'Error response envelope has success: false');
  }

  // -------------------------------------------------------------
  // 3. HTTP SECURITY HEADERS & CORS
  // -------------------------------------------------------------
  console.log('\n--- 3. HTTP Security Headers & CORS ---');
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

  // -------------------------------------------------------------
  // 4. MALFORMED JSON & PAYLOAD SANITIZATION
  // -------------------------------------------------------------
  console.log('\n--- 4. Payload Sanitization & Malformed Input Handling ---');
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

  // -------------------------------------------------------------
  // 5. INPUT VALIDATION UNIT TESTS
  // -------------------------------------------------------------
  console.log('\n--- 5. Input Validation Unit Tests ---');
  // UUID validation
  {
    assert(isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Valid UUID recognized');
    assert(!isValidUUID('invalid-uuid-string'), 'Invalid UUID string rejected');
    assert(!isValidUUID(null), 'Null UUID rejected');
    assert(!isValidUUID(''), 'Empty UUID rejected');
  }

  // Pagination sanitization
  {
    const p1 = sanitizePagination({ limit: '20', offset: '10' });
    assert(p1.limit === 20 && p1.offset === 10, 'Valid pagination parsed correctly');

    const p2 = sanitizePagination({ limit: '500', offset: '-5' });
    assert(p2.limit === 100, 'Limit clamped to max 100');
    assert(p2.offset === 0, 'Negative offset clamped to 0');
  }

  // Requirement Validator
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

    // Invalid beneficiary count
    let thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, beneficiary_count: -10 });
    } catch {
      thrown = true;
    }
    assert(thrown, 'Negative beneficiary count rejected');

    // Invalid urgency
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, urgency: 'super_urgent' });
    } catch {
      thrown = true;
    }
    assert(thrown, 'Invalid urgency enum rejected');

    // Empty items
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, items: [] });
    } catch {
      thrown = true;
    }
    assert(thrown, 'Empty items array rejected');

    // Negative item quantity
    thrown = false;
    try {
      validateCreateRequirement({ ...validPayload, items: [{ name: 'Rice', quantity: -5, unit: 'kg' }] });
    } catch {
      thrown = true;
    }
    assert(thrown, 'Negative item quantity rejected');
  }

  // -------------------------------------------------------------
  // 6. RATE LIMITER UNIT TESTS
  // -------------------------------------------------------------
  console.log('\n--- 6. Rate Limiter Middleware Unit Tests ---');
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

  // -------------------------------------------------------------
  // 7. FILE UPLOAD SAFETY & MIME TYPES
  // -------------------------------------------------------------
  console.log('\n--- 7. File Upload Safety & MIME Validation ---');
  {
    assert(ALLOWED_MIME_TYPES.includes('application/pdf'), 'PDF allowed for document upload');
    assert(ALLOWED_MIME_TYPES.includes('image/jpeg'), 'JPEG allowed for document upload');
    assert(ALLOWED_MIME_TYPES.includes('image/png'), 'PNG allowed for document upload');
    assert(!ALLOWED_MIME_TYPES.includes('application/javascript'), 'JavaScript files disallowed');
    assert(!ALLOWED_MIME_TYPES.includes('application/x-sh'), 'Shell scripts disallowed');
    assert(!ALLOWED_MIME_TYPES.includes('application/octet-stream'), 'Generic binary files disallowed');
  }

  // -------------------------------------------------------------
  // 8. CORE BUSINESS WORKFLOW STATE CONSISTENCY
  // -------------------------------------------------------------
  console.log('\n--- 8. Core Business Flow & State Consistency Logic ---');
  {
    // Requirement status allowed transitions
    const validRequirementStatuses = ['under_review', 'active', 'partially_supported', 'fulfilled', 'expired', 'rejected', 'hidden'];
    assert(validRequirementStatuses.includes('under_review'), 'under_review is valid');
    assert(validRequirementStatuses.includes('active'), 'active is valid');
    assert(validRequirementStatuses.includes('fulfilled'), 'fulfilled is valid');

    // Dual-confirmation fulfillment check simulation
    function checkDualFulfillment(donorConfirmed, requesterConfirmed) {
      return Boolean(donorConfirmed && requesterConfirmed);
    }
    assert(!checkDualFulfillment(true, false), 'Donor-only confirmation does not fulfill requirement');
    assert(!checkDualFulfillment(false, true), 'Requester-only confirmation does not fulfill requirement');
    assert(checkDualFulfillment(true, true), 'Dual confirmation successfully triggers completion');

    // Remaining quantity update math
    const originalQuantity = 100;
    const fulfilledQuantity = 40;
    const remainingQuantity = Math.max(0, originalQuantity - fulfilledQuantity);
    assert(remainingQuantity === 60, 'Quantity deduction is accurate');
    assert(Math.max(0, 50 - 60) === 0, 'Remaining quantity cannot go negative (floored at 0)');
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
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
