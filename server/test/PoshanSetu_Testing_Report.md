# PoshanSetu — Software Testing Report

---

**Project Title:** PoshanSetu — Maharashtra Food Need Connect Platform  
**Report Type:** Software Testing Report  
**University:** Savitribai Phule Pune University (SPPU)  
**Course:** Software Testing (TE / BE Computer Engineering)  
**Academic Year:** 2025–2026  
**Prepared By:** PoshanSetu Development Team  
**Date:** October 2026  
**Version:** 1.0  

---

## Table of Contents

1. [Introduction](#1-introduction)  
2. [Scope of Testing](#2-scope-of-testing)  
3. [Testing Objectives](#3-testing-objectives)  
4. [Testing Tools Used](#4-testing-tools-used)  
5. [Test Environment](#5-test-environment)  
6. [Testing Methodology](#6-testing-methodology)  
7. [Test Plan Summary](#7-test-plan-summary)  
8. [Test Cases — Unit Testing](#8-test-cases--unit-testing)  
9. [Test Cases — Integration Testing](#9-test-cases--integration-testing)  
10. [Test Cases — System Testing](#10-test-cases--system-testing)  
11. [Test Cases — Security Testing](#11-test-cases--security-testing)  
12. [Test Cases — Performance & Load Testing](#12-test-cases--performance--load-testing)  
13. [Test Cases — User Acceptance Testing (UAT)](#13-test-cases--user-acceptance-testing-uat)  
14. [Traceability Matrix](#14-traceability-matrix)  
15. [Test Execution Results](#15-test-execution-results)  
16. [Defect Report](#16-defect-report)  
17. [Test Summary & Conclusion](#17-test-summary--conclusion)  

---

## 1. Introduction

### 1.1 Purpose
This document presents the formal Software Testing Report for **PoshanSetu**, a Maharashtra-focused web platform developed as a Project-Based Learning (PBL) submission. The report is prepared in accordance with the **SPPU Software Testing** course curriculum and describes the testing strategy, tools employed, test cases designed and executed, results obtained, defects found and resolved, and overall quality assessment.

### 1.2 Project Description
PoshanSetu (पोषणसेतू — "Nutrition Bridge") is a full-stack web application that:
- Connects food donors with institutions (Ashram Shalas, orphanages, NGOs) having current food requirements
- Presents official NFHS-5 district-level nutrition indicators for all 36 Maharashtra districts
- Provides a deterministic food-to-need matching engine
- Manages the full donor → offer → dual confirmation lifecycle
- Provides Admin, Donor, and Requester role-based dashboards

### 1.3 Document Scope
This report covers testing performed from **Phase 14 (Security Hardening)** through **Phase 16 (Comprehensive Testing)** and subsequent phases including the completed donor support flow and admin controls.

---

## 2. Scope of Testing

### 2.1 In Scope

| Module | Description |
|--------|-------------|
| **Authentication & Authorization** | Firebase token verification, RBAC enforcement across all roles |
| **Requirement Management** | Submission, validation, lifecycle states, expiry |
| **Donor Offer Flow** | Offer creation, partial support, dual confirmation, quantity deduction |
| **District Data API** | 36 Maharashtra districts, NFHS-5 nutrition indicators |
| **Matching Engine** | Deterministic proximity + food + deficiency + urgency scoring |
| **Nutrition Attention** | Composite vulnerability scoring and food recommendation |
| **Admin Dashboard** | Fraud signals, institution review, stats |
| **Security Controls** | HTTP headers, CORS, rate limiting, input validation |
| **File Upload** | MIME type validation, Cloudinary integration |
| **Frontend UI** | Landing page, Explore Map, Dashboards, Public pages |

### 2.2 Out of Scope
- Payment processing (not implemented — by design)
- Physical logistics or transport management
- Medical diagnosis or clinical nutrition recommendations
- Full browser E2E with live Firebase credential issuance (requires live auth tokens)

---

## 3. Testing Objectives

In line with SPPU Software Testing syllabus objectives:

1. **Verify correctness** — Ensure every module behaves as per its functional specification.
2. **Validate security** — Confirm that authentication barriers, CORS, headers, and rate limiting protect sensitive resources.
3. **Validate data integrity** — Ensure quantities never go negative, dual confirmation is enforced, and official nutrition data is kept separate from user-submitted data.
4. **Detect and document defects** — Record all defects discovered during testing and their resolution status.
5. **Ensure regression safety** — Confirm that new features do not break existing verified functionality.
6. **Validate business rules** — Confirm requirement lifecycle states, fraud flags, and offer eligibility rules operate correctly.

---

## 4. Testing Tools Used

| # | Tool | Type | Purpose | Version / Notes |
|---|------|------|---------|-----------------|
| 1 | **Node.js Custom Test Runner** | Unit / Integration | `server/test/testRunner.js` — 100+ assertions, no external dependency | Node.js ≥ 18 built-in `http` module |
| 2 | **Postman** | API / Integration | Manual and collection-based API endpoint testing; RBAC and contract verification | v10+ (`.postman/` collections included) |
| 3 | **ESLint** | Static Analysis | Code quality linting, unused import detection, style conformance | Configured per project `eslint.config.js` |
| 4 | **Vite Build** | Build Verification | Production bundle build verification; catches dead imports and compile errors | Vite v5 |
| 5 | **Browser DevTools** | UI / Compatibility | Manual UI testing, network tab inspection, responsive mode, console error monitoring | Chromium-based (Edge / Chrome) |
| 6 | **nodemon** | Dev Environment | Auto-restart server during iterative test cycles | v3.1.x |
| 7 | **Firebase Admin SDK** | Auth Testing | Server-side token verification integration testing | v14.x |
| 8 | **Cloudinary SDK** | Upload Testing | MIME filtering and upload pipeline verification | v2.x |

### 4.1 Custom Test Runner Architecture
The project uses a **custom lightweight test runner** (`server/test/testRunner.js`) built on Node.js native `http` module. This avoids external test framework dependencies on the backend while providing:
- `assert(condition, message)` — synchronous assertion helper
- `makeRequest(options, body)` — async HTTP request helper wrapping `http.request`
- Grouped test suites printed with emoji pass/fail indicators
- Non-zero exit code on any failure (CI-compatible)

---

## 5. Test Environment

### 5.1 Hardware & OS
| Attribute | Value |
|-----------|-------|
| OS | Windows 11 (development), Linux (Render hosting — production parity) |
| CPU | Multi-core (Intel/AMD x86-64) |
| RAM | ≥ 8 GB |
| Network | Local loopback (`localhost:5000` backend, `localhost:5173` frontend during dev) |

### 5.2 Software Environment
| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React + Vite | React 19, Vite 6 |
| Styling | Tailwind CSS | v4 |
| Backend | Node.js + Express | Express v5, Node ≥ 18 |
| Database | Neon PostgreSQL | pg v8.x |
| Auth | Firebase Authentication | Admin SDK v14 |
| File Storage | Cloudinary | SDK v2 |
| Frontend Hosting | Vercel | — |
| Backend Hosting | Render | — |
| Version Control | Git + GitHub | — |

### 5.3 Configuration
- Backend runs on `localhost:5000` during test execution
- PostgreSQL connection via `DATABASE_URL` environment variable (Neon)
- Firebase Admin initialized with `FIREBASE_SERVICE_ACCOUNT_JSON` (env var)
- All secrets held in `.env` files; never committed (verified via `.gitignore`)

---

## 6. Testing Methodology

PoshanSetu follows the **V-Model** testing approach aligned with SPPU curriculum:

```
Requirements ──────────────────────────── UAT
    System Design ────────────────── System Testing
        Module Design ────────── Integration Testing
            Coding ───────── Unit Testing
```

### 6.1 Testing Types Applied

| Type | Approach | Coverage |
|------|----------|----------|
| **Unit Testing** | White-box; pure logic functions tested in isolation | Validators, matching engine, nutrition attention, rate limiter, fulfillment math |
| **Integration Testing** | Black-box HTTP; real server endpoints called with constructed requests | All REST API routes, auth middleware chain, CORS policy |
| **System Testing** | End-to-end flow verification across combined modules | Full donor journey, full requester journey, admin review workflow |
| **Security Testing** | Penetration-style; unauthorized access, injection, header verification | RBAC, SQL injection prevention, header policy, CORS rejection |
| **Performance Testing** | Rate limiter verification; build time monitoring | 429 enforcement, Vite production build timing |
| **UAT** | Role-based walkthrough with real UI pages | Donor dashboard, requester submission, admin approval |
| **Regression Testing** | Re-run full test suite after each phase | Backend suite re-run after every phase (100/100 maintained) |
| **Static Analysis** | ESLint lint pass | All new code linted before merging |

---

## 7. Test Plan Summary

| Attribute | Detail |
|-----------|--------|
| **Entry Criteria** | Server running on port 5000; database seeded with 36 districts and NFHS-5 data |
| **Exit Criteria** | All test cases PASS; 0 critical/high defects open; production build succeeds |
| **Test Execution Order** | Unit → Integration → Security → System → UAT |
| **Pass Criteria** | HTTP status codes match expected; JSON response envelopes are standard; business rules are enforced |
| **Fail Criteria** | Any assertion failure; unexpected status code; missing security header; exposed sensitive data |
| **Reporting** | Automated console report + this document |

---

## 8. Test Cases — Unit Testing

### Suite 8.1 — Input Validators (`commonValidators.js`, `requirementValidator.js`)

| TC ID | Test Case Description | Test Data | Expected Result | Actual Result | Status |
|-------|----------------------|-----------|-----------------|---------------|--------|
| UT-01 | Valid UUID recognized | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | Returns `true` | Returns `true` | ✅ PASS |
| UT-02 | Invalid UUID string rejected | `"invalid-uuid-string"` | Returns `false` | Returns `false` | ✅ PASS |
| UT-03 | Null UUID rejected | `null` | Returns `false` | Returns `false` | ✅ PASS |
| UT-04 | Empty string UUID rejected | `""` | Returns `false` | Returns `false` | ✅ PASS |
| UT-05 | Pagination — valid limit & offset | `{ limit: '20', offset: '10' }` | `{ limit: 20, offset: 10 }` | `{ limit: 20, offset: 10 }` | ✅ PASS |
| UT-06 | Pagination — limit clamped to max 100 | `{ limit: '500', offset: '0' }` | `limit === 100` | `limit === 100` | ✅ PASS |
| UT-07 | Pagination — negative offset clamped to 0 | `{ limit: '10', offset: '-5' }` | `offset === 0` | `offset === 0` | ✅ PASS |
| UT-08 | Valid requirement payload accepted | Full valid payload with items | Validated object returned | Object returned correctly | ✅ PASS |
| UT-09 | Negative beneficiary count rejected | `beneficiary_count: -10` | `AppError` thrown | `AppError` thrown | ✅ PASS |
| UT-10 | Invalid urgency enum rejected | `urgency: 'super_urgent'` | `AppError` thrown | `AppError` thrown | ✅ PASS |
| UT-11 | Empty items array rejected | `items: []` | `AppError` thrown | `AppError` thrown | ✅ PASS |
| UT-12 | Negative item quantity rejected | `items: [{ quantity: -5 }]` | `AppError` thrown | `AppError` thrown | ✅ PASS |

### Suite 8.2 — Matching Engine (`matchingEngine.js`)

| TC ID | Test Case Description | Test Data | Expected Result | Actual Result | Status |
|-------|----------------------|-----------|-----------------|---------------|--------|
| UT-13 | Zero-distance proximity scores 1.0 | Same lat/lng for donor and requirement | `proximityScore = 1` | `1` | ✅ PASS |
| UT-14 | Beyond-radius proximity scores 0 | Distance > 50 km | `proximityScore = 0` | `0` | ✅ PASS |
| UT-15 | Exact food alias match scores 1.0 | `'Ragi (Finger Millet)'` vs `'ragi'` | `foodMatchScore = 1` | `1` | ✅ PASS |
| UT-16 | Related pulse category scores 0.5 | `'Moong Dal'` vs `'Toor Dal'` | `foodMatchScore = 0.5` | `0.5` | ✅ PASS |
| UT-17 | Unrelated food scores 0 | `'Rice'` vs `'Jaggery'` | `foodMatchScore = 0` | `0` | ✅ PASS |
| UT-18 | Nearly fulfilled need uses 0.1 floor | `quantityRequired: 100, quantityRemaining: 5` | `remainingNeedScore = 0.1` | `0.1` | ✅ PASS |
| UT-19 | Partially supported requirement is matchable | Partially supported fixture | Matched list length = 1 | Length = 1 | ✅ PASS |
| UT-20 | Multiple donor items match multiple req. items | Fixture with Jowar + Toor Dal | `matchedItems.length = 2` | Length = 2 | ✅ PASS |
| UT-21 | Score breakdown exposes proximity | Full match fixture | `scoreBreakdown.proximity === 1` | `1` | ✅ PASS |
| UT-22 | Location-only Flow A keeps nearby requirements | `foodItems: []` | Result has `foodMatch = 0`, length = 1 | Correct | ✅ PASS |
| UT-23 | Expired requirements excluded from Flow B | Expired fixture + active fixture | `noMatch.length = 0` | `0` | ✅ PASS |

### Suite 8.3 — Nutrition Attention Service (`nutritionAttention.js`)

| TC ID | Test Case Description | Test Data | Expected Result | Actual Result | Status |
|-------|----------------------|-----------|-----------------|---------------|--------|
| UT-24 | High anaemia + underweight → VERY_HIGH | `anaemic: 68.9`, `underweight: 77.5` | Level = `VERY_HIGH` | `VERY_HIGH` | ✅ PASS |
| UT-25 | VERY_HIGH attention recommends Ragi | Same as UT-24 | `Ragi` in recommendations | Present | ✅ PASS |
| UT-26 | Empty indicators → UNAVAILABLE | `[]` | Level = `UNAVAILABLE` | `UNAVAILABLE` | ✅ PASS |
| UT-27 | NFHS import name maps to canonical key | `'stunting'` | Returns `children_under5_stunted_pct` | Correct | ✅ PASS |
| UT-28 | Imported NFHS indicators trigger recommendations | `stunting + underweight + wasting` | `Moong Dal` in recommendations | Present | ✅ PASS |

### Suite 8.4 — Rate Limiter Middleware (`rateLimiter.js`)

| TC ID | Test Case Description | Test Data | Expected Result | Actual Result | Status |
|-------|----------------------|-----------|-----------------|---------------|--------|
| UT-29 | First request within limit allowed | `max: 2`, call 1 | HTTP-equivalent status 200 | 200 | ✅ PASS |
| UT-30 | Second request within limit allowed | `max: 2`, call 2 | Status 200 | 200 | ✅ PASS |
| UT-31 | Third request exceeding limit blocked | `max: 2`, call 3 | Status 429 | 429 | ✅ PASS |
| UT-32 | Rate limit response includes custom message | `message: 'Rate limit test exceeded'` | Message in response body | Present | ✅ PASS |

### Suite 8.5 — Business Logic (Fulfillment Math)

| TC ID | Test Case Description | Test Data | Expected Result | Actual Result | Status |
|-------|----------------------|-----------|-----------------|---------------|--------|
| UT-33 | Donor-only confirmation does not fulfill | `donorConfirmed: true, requesterConfirmed: false` | `false` | `false` | ✅ PASS |
| UT-34 | Requester-only confirmation does not fulfill | `donorConfirmed: false, requesterConfirmed: true` | `false` | `false` | ✅ PASS |
| UT-35 | Dual confirmation triggers fulfillment | `donorConfirmed: true, requesterConfirmed: true` | `true` | `true` | ✅ PASS |
| UT-36 | Quantity deduction is accurate | `original: 100, fulfilled: 40` | `remaining = 60` | `60` | ✅ PASS |
| UT-37 | Remaining quantity cannot go negative | `50 - 60` floored at 0 | `0` | `0` | ✅ PASS |
| UT-38 | Fulfillment rate is 0 with no eligible requirements | `fulfilled: 0, active: 0, partial: 0` | `0` | `0` | ✅ PASS |
| UT-39 | Fulfillment rate = fulfilled / (active + partial + fulfilled) | `fulfilled: 2, active: 2, partial: 0` | `50%` | `50` | ✅ PASS |

### Suite 8.6 — File Upload Safety (`uploadMiddleware.js`)

| TC ID | Test Case Description | Expected Result | Actual Result | Status |
|-------|----------------------|-----------------|---------------|--------|
| UT-40 | PDF MIME type is allowed | `true` | `true` | ✅ PASS |
| UT-41 | JPEG MIME type is allowed | `true` | `true` | ✅ PASS |
| UT-42 | PNG MIME type is allowed | `true` | `true` | ✅ PASS |
| UT-43 | JavaScript files are disallowed | `false` | `false` | ✅ PASS |
| UT-44 | Shell script MIME type is disallowed | `false` | `false` | ✅ PASS |
| UT-45 | Generic binary (`octet-stream`) is disallowed | `false` | `false` | ✅ PASS |

---

## 9. Test Cases — Integration Testing

### Suite 9.1 — Public API Endpoints

| TC ID | Method | Endpoint | Test Data | Expected HTTP Status | Expected Response | Actual Status | Status |
|-------|--------|----------|-----------|---------------------|-------------------|---------------|--------|
| IT-01 | GET | `/api/health` | — | 200 | `{ success: true, data: { api: "up" } }` | 200 | ✅ PASS |
| IT-02 | GET | `/api/v1` | — | 200 | `{ data: { version: "v1" } }` | 200 | ✅ PASS |
| IT-03 | GET | `/api/v1/districts` | — | 200 | Array of 36 districts | 200, 36 items | ✅ PASS |
| IT-04 | GET | `/api/v1/districts/pune` | — | 200 | `{ name: "pune", nutritionIndicators: [...] }` | 200 | ✅ PASS |
| IT-05 | GET | `/api/v1/districts/nashik` | — | 200 | District data with indicators | 200 | ✅ PASS |
| IT-06 | GET | `/api/v1/districts/akola` | — | 200 | District data with indicators | 200 | ✅ PASS |
| IT-07 | GET | `/api/v1/requirements` | — | 200 | Array of active requirements | 200 | ✅ PASS |
| IT-08 | GET | `/api/v1/districts/nashik` | — | 200 | `nutritionAttention.recommendedFoodCategories.length > 0` | 200, non-empty | ✅ PASS |
| IT-09 | GET | `/api/v1/districts/pune` | — | 200 | Food categories derived from NFHS data | 200, present | ✅ PASS |
| IT-10 | GET | `/api/v1/districts/akola` | — | 200 | Food categories derived from NFHS data | 200, present | ✅ PASS |

### Suite 9.2 — Authentication & RBAC (Unauthenticated Access Blocked)

| TC ID | Method | Endpoint | Role Required | Expected Status | Actual Status | Status |
|-------|--------|----------|--------------|-----------------|---------------|--------|
| IT-11 | GET | `/api/v1/requirements/mine/list` | Requester | 401 | 401 | ✅ PASS |
| IT-12 | POST | `/api/v1/requirements` | Requester | 401 | 401 | ✅ PASS |
| IT-13 | GET | `/api/v1/offers/mine` | Donor | 401 | 401 | ✅ PASS |
| IT-14 | POST | `/api/v1/offers` | Donor | 401 | 401 | ✅ PASS |
| IT-15 | GET | `/api/v1/notifications` | Any Auth | 401 | 401 | ✅ PASS |
| IT-16 | GET | `/api/v1/institutions/me` | Requester | 401 | 401 | ✅ PASS |
| IT-17 | POST | `/api/v1/institutions/me/documents` | Requester | 401 | 401 | ✅ PASS |
| IT-18 | GET | `/api/v1/admin/stats` | Admin | 401 | 401 | ✅ PASS |
| IT-19 | GET | `/api/v1/admin/fraud-signals` | Admin | 401 | 401 | ✅ PASS |
| IT-20 | GET | `/api/v1/requirements/admin/list` | Admin | 401 | 401 | ✅ PASS |
| IT-21 | GET | `/api/v1/institutions/admin/list` | Admin | 401 | 401 | ✅ PASS |
| IT-22 | All above | — | — | `{ success: false }` in response | All confirm | ✅ PASS |

### Suite 9.3 — Matching Engine API Integration

| TC ID | Method | Endpoint | Test Data | Expected Result | Actual Result | Status |
|-------|--------|----------|-----------|-----------------|---------------|--------|
| IT-23 | POST | `/api/v1/matching` | `{ location, foodItems: [Jowar] }` | Ranked matches with score breakdown | Returns matches | ✅ PASS |
| IT-24 | POST | `/api/v1/matching` | Empty foodItems, valid location | Location-only matches returned | Matches present | ✅ PASS |
| IT-25 | POST | `/api/v1/matching` | Expired requirements in DB | Expired excluded from results | Not in results | ✅ PASS |

---

## 10. Test Cases — System Testing

### Suite 10.1 — End-to-End: Requester Submission Flow

| TC ID | Step | Action | Expected Result | Status |
|-------|------|--------|-----------------|--------|
| ST-01 | 1 | Requester navigates to `/requirement/submit` | Form rendered with all fields | ✅ PASS |
| ST-02 | 2 | Requester submits form without authentication | Redirect to `/login-required` | ✅ PASS |
| ST-03 | 3 | Requester logs in via Firebase | Auth token acquired; redirect to form | ✅ PASS |
| ST-04 | 4 | Valid form submission with district + items | `POST /api/v1/requirements` → 201, status `under_review` | ✅ PASS |
| ST-05 | 5 | Duplicate active requirement submitted | 409 Conflict returned | ✅ PASS |
| ST-06 | 6 | More than 5 requirements in one day | 429 Too Many Requests | ✅ PASS |
| ST-07 | 7 | Admin reviews requirement | Status transitions `under_review → active` | ✅ PASS |
| ST-08 | 8 | Requirement visible on Explore Map | Appears as card with correct district | ✅ PASS |

### Suite 10.2 — End-to-End: Donor Support Flow

| TC ID | Step | Action | Expected Result | Status |
|-------|------|--------|-----------------|--------|
| ST-09 | 1 | Donor visits Explore Needs | Map renders with district overlays and requirements | ✅ PASS |
| ST-10 | 2 | Donor clicks pledge on public requirement card (unauthenticated) | Redirected to `/login-required` with destination preserved | ✅ PASS |
| ST-11 | 3 | Donor logs in; arrives at support offer page | Offer form pre-filled with requirement details | ✅ PASS |
| ST-12 | 4 | Donor submits offer to own requirement | 409 Conflict — self-support blocked | ✅ PASS |
| ST-13 | 5 | Donor submits valid offer for active requirement | 201 Created; offer visible on donor dashboard | ✅ PASS |
| ST-14 | 6 | Donor submits duplicate active offer | 409 Conflict — duplicate blocked | ✅ PASS |
| ST-15 | 7 | Donor confirms delivery via Confirm Support page | `PATCH /api/v1/offers/:id/confirm` — donor flag set | ✅ PASS |
| ST-16 | 8 | Requester confirms receipt | Both confirmed → requirement status = `fulfilled` | ✅ PASS |
| ST-17 | 9 | Remaining quantity updated after offer | `quantityRemaining` never goes negative | ✅ PASS |

### Suite 10.3 — Admin Dashboard Flow

| TC ID | Step | Action | Expected Result | Status |
|-------|------|--------|-----------------|--------|
| ST-18 | 1 | Admin logs in | Redirected to `/admin/dashboard` | ✅ PASS |
| ST-19 | 2 | Dashboard stats load | Active requirements, total donors, fulfillment rate shown | ✅ PASS |
| ST-20 | 3 | Admin reviews institution verification queue | Pending institutions listed | ✅ PASS |
| ST-21 | 4 | Admin approves/rejects institution | Status updated; reflected in requester profile | ✅ PASS |
| ST-22 | 5 | Admin views fraud signals | `GET /api/v1/admin/fraud-signals` → list returned | ✅ PASS |
| ST-23 | 6 | Admin resolves fraud signal | `PATCH /api/v1/admin/fraud-signals/:id/resolve` → 200 | ✅ PASS |
| ST-24 | 7 | Non-admin accesses `/admin/dashboard` | Redirected or 403 | ✅ PASS |

### Suite 10.4 — Nutrition Attention & Explore Map

| TC ID | Step | Action | Expected Result | Status |
|-------|------|--------|-----------------|--------|
| ST-25 | 1 | User opens Explore Map in Nutrition Needs mode | Map shows 4 color bands (VERY_HIGH/HIGH/MODERATE/LOWER) | ✅ PASS |
| ST-26 | 2 | Click Nashik district | Nutrition panel shows NFHS-5 indicators and food recommendations | ✅ PASS |
| ST-27 | 3 | Explore food matching for Nashik | Donor location + food selection sends to `/api/v1/matching` | ✅ PASS |
| ST-28 | 4 | Switch between Institution Needs and Nutrition Needs layers | Layer toggle renders distinct overlays | ✅ PASS |
| ST-29 | 5 | Apply Location + Urgency filter combination | Requirements list narrows correctly | ✅ PASS |
| ST-30 | 6 | Reset filters | All requirements restored without page reload | ✅ PASS |

---

## 11. Test Cases — Security Testing

### Suite 11.1 — HTTP Security Headers

| TC ID | Header Under Test | Expected Value | Actual Value | Status |
|-------|------------------|----------------|--------------|--------|
| SEC-01 | `X-Content-Type-Options` | `nosniff` | `nosniff` | ✅ PASS |
| SEC-02 | `X-Frame-Options` | `DENY` | `DENY` | ✅ PASS |
| SEC-03 | `Referrer-Policy` | `strict-origin-when-cross-origin` | `strict-origin-when-cross-origin` | ✅ PASS |
| SEC-04 | `X-Powered-By` | Not present (removed) | Absent | ✅ PASS |
| SEC-05 | `Permissions-Policy` | Restrictive policy set | Present | ✅ PASS |

### Suite 11.2 — CORS Policy

| TC ID | Test Scenario | Origin Sent | Expected Response | Actual Response | Status |
|-------|--------------|-------------|-------------------|-----------------|--------|
| SEC-06 | Unauthorized origin rejected | `https://evil-unauthorized-site.com` | 403, `{ success: false }` | 403 | ✅ PASS |
| SEC-07 | Authorized origin allowed | Configured frontend origin | 200 | 200 | ✅ PASS |

### Suite 11.3 — Input Injection & Payload Sanitization

| TC ID | Test Scenario | Input | Expected Result | Actual Result | Status |
|-------|--------------|-------|-----------------|---------------|--------|
| SEC-08 | Malformed JSON payload rejected | `{ malformed-json-payload-without-quotes ` | 400, JSON error message | 400 | ✅ PASS |
| SEC-09 | SQL injection in UUID parameter | `'; DROP TABLE requirements;--` | Rejected by UUID validator before DB | 400 | ✅ PASS |
| SEC-10 | Parameterized SQL across all repositories | All queries use `$1, $2...` placeholders | No string interpolation in SQL | Verified (code audit) | ✅ PASS |
| SEC-11 | Oversized JSON payload rejected | Payload exceeding size limit | 400 entity.too.large | 400 | ✅ PASS |

### Suite 11.4 — Secret Exposure Audit

| TC ID | Test Scenario | Expected Result | Actual Result | Status |
|-------|--------------|-----------------|---------------|--------|
| SEC-12 | `.env` files not committed | No `.env` in git history | Verified — `.gitignore` blocks `.env*` | ✅ PASS |
| SEC-13 | No hardcoded credentials in source | Zero secrets in source | Code audit confirms no hardcoded keys | ✅ PASS |
| SEC-14 | Client bundle exposes only `VITE_*` vars | No server secrets in bundle | Vite build output verified | ✅ PASS |
| SEC-15 | Production 500 errors masked | Generic message in prod mode | `errorHandler.js` masks details | ✅ PASS |

### Suite 11.5 — Rate Limiting (API Abuse Prevention)

| TC ID | Route Protected | Limit | Test Result | Status |
|-------|----------------|-------|-------------|--------|
| SEC-16 | `POST /api/v1/requirements` | Sliding window | 429 after threshold | ✅ PASS |
| SEC-17 | `POST /api/v1/offers` | Sliding window | 429 after threshold | ✅ PASS |
| SEC-18 | `POST /api/v1/institutions/me/documents` | Sliding window | 429 after threshold | ✅ PASS |
| SEC-19 | Daily requirement limit per requester | Max 5/day | 6th submission → 429 | ✅ PASS |
| SEC-20 | Large quantity fraud flag | > 10,000 units | Auto-flagged in fraud signals | ✅ PASS |

---

## 12. Test Cases — Performance & Load Testing

### Suite 12.1 — Build Performance

| TC ID | Test | Metric | Target | Actual | Status |
|-------|------|--------|--------|--------|--------|
| PERF-01 | Vite production build | Build time | < 2000 ms | ~519 ms | ✅ PASS |
| PERF-02 | Vite production build — zero errors | Error count | 0 errors | 0 | ✅ PASS |
| PERF-03 | Node.js server startup | Startup time | < 3 seconds | < 1 second | ✅ PASS |

### Suite 12.2 — Rate Limiter Under Synthetic Load

| TC ID | Test | Input | Expected | Actual | Status |
|-------|------|-------|----------|--------|--------|
| PERF-04 | 2 requests inside window allowed | 2 requests in 1s window (max=2) | 200, 200 | 200, 200 | ✅ PASS |
| PERF-05 | 3rd request blocked with 429 | 3rd request in same window | 429 | 429 | ✅ PASS |
| PERF-06 | Window resets after interval | New window after 1000 ms | Next request allowed | Allowed | ✅ PASS |

### Suite 12.3 — Database Query Performance (Observed)

| TC ID | Query | Observed Response Time | Status |
|-------|-------|----------------------|--------|
| PERF-07 | GET all 36 districts | < 200 ms (Neon connection) | ✅ PASS |
| PERF-08 | GET requirements with joins (institutionName, district) | < 300 ms | ✅ PASS |
| PERF-09 | Admin stats aggregation (counts by role/status) | < 500 ms | ✅ PASS |

---

## 13. Test Cases — User Acceptance Testing (UAT)

### Suite 13.1 — Donor Journey UAT

| TC ID | Scenario | Steps | Acceptance Criteria | Result |
|-------|----------|-------|--------------------|-|
| UAT-01 | New Donor Registration | Register → Verify Email → Login | Donor dashboard loads with stats | ✅ PASS |
| UAT-02 | Explore Maharashtra Needs | Open Explore → Select district on map → View food recommendations | Nutrition indicators and recommendations visible | ✅ PASS |
| UAT-03 | Food Matching Flow | Select foods → Submit → View matches | Sorted matches with score breakdown shown | ✅ PASS |
| UAT-04 | Make a Support Offer | Click "Support" on requirement → Fill offer → Submit | Offer confirmed, donor dashboard updated | ✅ PASS |
| UAT-05 | Confirm Delivery | Visit Confirm Support page → Confirm | Success state shown; status updated | ✅ PASS |
| UAT-06 | View Offer History | Open Donor Dashboard → Offers tab | All offers listed with status and items | ✅ PASS |

### Suite 13.2 — Requester Journey UAT

| TC ID | Scenario | Steps | Acceptance Criteria | Result |
|-------|----------|-------|--------------------|-|
| UAT-07 | Institution Registration | Register as Institution → Submit verification docs | Status shows "Under Review" | ✅ PASS |
| UAT-08 | Submit Food Requirement | Fill requirement form → Submit | Requirement appears in "under_review" state | ✅ PASS |
| UAT-09 | View Incoming Offers | Dashboard → Offers received tab | Donor offers listed with item details | ✅ PASS |
| UAT-10 | Confirm Receipt | Click Confirm Receipt on offer | Dual confirmation triggers fulfillment | ✅ PASS |
| UAT-11 | View Requirement History | Dashboard → My Requirements | All requirements with statuses shown | ✅ PASS |

### Suite 13.3 — Admin Journey UAT

| TC ID | Scenario | Steps | Acceptance Criteria | Result |
|-------|----------|-------|--------------------|-|
| UAT-12 | Admin Dashboard Overview | Login as admin → View dashboard | Stats cards show live counts | ✅ PASS |
| UAT-13 | Approve Institution | Review queue → Approve institution | Institution status changes to verified | ✅ PASS |
| UAT-14 | Review Requirements | Admin list → Approve/Reject | Requirement status updates and notifies requester | ✅ PASS |
| UAT-15 | Handle Fraud Signal | Fraud signals list → Resolve | Signal marked resolved; audit log updated | ✅ PASS |

---

## 14. Traceability Matrix

> Maps each functional requirement to corresponding test cases

| Req ID | Requirement Description | Unit TC | Integration TC | System TC | Security TC | UAT TC |
|--------|------------------------|---------|---------------|-----------|-------------|--------|
| FR-01 | Firebase Authentication (login/register) | — | IT-11 to IT-22 | ST-02, ST-03 | SEC-12 to SEC-15 | UAT-01 |
| FR-02 | Role-Based Access Control (Admin/Donor/Requester) | — | IT-11 to IT-22 | ST-24 | — | UAT-12 |
| FR-03 | Requirement submission with validation | UT-08 to UT-12 | IT-12 | ST-01 to ST-08 | SEC-08, SEC-09 | UAT-08 |
| FR-04 | Donor offer creation and eligibility checks | UT-33 to UT-37 | IT-14 | ST-09 to ST-17 | SEC-16, SEC-17 | UAT-04 |
| FR-05 | Dual confirmation fulfillment | UT-33 to UT-35 | — | ST-16 | — | UAT-05, UAT-10 |
| FR-06 | District data (36 Maharashtra districts) | — | IT-03 to IT-10 | ST-25 to ST-30 | — | UAT-02 |
| FR-07 | NFHS-5 nutrition indicators per district | UT-24 to UT-28 | IT-04 to IT-10 | ST-26 | — | UAT-02 |
| FR-08 | Deterministic matching engine | UT-13 to UT-23 | IT-23 to IT-25 | ST-27 | — | UAT-03 |
| FR-09 | Nutrition attention scoring | UT-24 to UT-28 | — | ST-25 | — | UAT-02 |
| FR-10 | Admin fraud signal management | — | IT-19 | ST-22, ST-23 | SEC-20 | UAT-15 |
| FR-11 | Rate limiting on mutation routes | UT-29 to UT-32 | — | ST-06 | SEC-16 to SEC-20 | — |
| FR-12 | HTTP security headers | — | — | — | SEC-01 to SEC-05 | — |
| FR-13 | CORS policy enforcement | — | — | — | SEC-06, SEC-07 | — |
| FR-14 | File upload MIME validation | UT-40 to UT-45 | IT-17 | — | — | UAT-07 |
| FR-15 | Institution verification workflow | — | — | ST-18 to ST-24 | — | UAT-07, UAT-13 |
| FR-16 | Quantity remaining non-negative floor | UT-36, UT-37 | — | ST-17 | — | — |
| FR-17 | Admin stats (fulfillment rate calculation) | UT-38, UT-39 | IT-18 | ST-19 | — | UAT-12 |

---

## 15. Test Execution Results

### 15.1 Automated Test Suite Results

The following results are from the **PoshanSetu Comprehensive Test Suite** (`node test/testRunner.js`) executed against a live backend server connected to the Neon PostgreSQL database:

```
========================================
🧪 PoshanSetu Comprehensive Test Suite
========================================

--- 1. Public API & Health Endpoints ---
  ✅ PASSED: GET /api/health returns 200
  ✅ PASSED: Health response has standard success envelope
  ✅ PASSED: API status is up
  ✅ PASSED: GET /api/v1 returns 200
  ✅ PASSED: API version is v1
  ✅ PASSED: GET /api/v1/districts returns 200
  ✅ PASSED: Districts response contains an array
  ✅ PASSED: Returns all 36 Maharashtra districts
  ✅ PASSED: GET /api/v1/districts/pune returns 200
  ✅ PASSED: District data matches Pune
  ✅ PASSED: GET /api/v1/districts/nashik returns 200
  ✅ PASSED: nashik exposes real nutrition indicators
  ✅ PASSED: nashik derives nutrition recommendations
  ✅ PASSED: GET /api/v1/districts/pune returns 200
  ✅ PASSED: pune exposes real nutrition indicators
  ✅ PASSED: pune derives nutrition recommendations
  ✅ PASSED: GET /api/v1/districts/akola returns 200
  ✅ PASSED: akola exposes real nutrition indicators
  ✅ PASSED: akola derives nutrition recommendations
  ✅ PASSED: GET /api/v1/requirements returns 200
  ✅ PASSED: Public requirements response is an array

--- 2. Authentication & RBAC Protection (Unauthenticated 401s) ---
  ✅ PASSED: GET /api/v1/requirements/mine/list (Requester requirements) blocked with 401
  ✅ PASSED: POST /api/v1/requirements (Requirement submission) blocked with 401
  ✅ PASSED: GET /api/v1/offers/mine (Donor offers) blocked with 401
  ✅ PASSED: POST /api/v1/offers (Offer creation) blocked with 401
  ✅ PASSED: GET /api/v1/notifications (Notifications list) blocked with 401
  ✅ PASSED: GET /api/v1/institutions/me (Institution profile) blocked with 401
  ✅ PASSED: POST /api/v1/institutions/me/documents (Document upload) blocked with 401
  ✅ PASSED: GET /api/v1/admin/stats (Admin dashboard stats) blocked with 401
  ✅ PASSED: GET /api/v1/admin/fraud-signals (Admin fraud signals) blocked with 401
  ✅ PASSED: GET /api/v1/requirements/admin/list (Admin requirements list) blocked with 401
  ✅ PASSED: GET /api/v1/institutions/admin/list (Admin institutions list) blocked with 401
  [22 total RBAC assertions — all PASSED]

--- 3. HTTP Security Headers & CORS ---
  ✅ PASSED: X-Content-Type-Options is nosniff
  ✅ PASSED: X-Frame-Options is DENY
  ✅ PASSED: Referrer-Policy is strict-origin-when-cross-origin
  ✅ PASSED: X-Powered-By is removed
  ✅ PASSED: Disallowed CORS origin rejected with 403
  ✅ PASSED: CORS rejection response is standard format

--- 4. Payload Sanitization & Malformed Input Handling ---
  ✅ PASSED: Malformed JSON rejected with 400 Bad Request
  ✅ PASSED: Error message clearly indicates JSON payload issue

--- 5. Input Validation Unit Tests ---
  ✅ PASSED: Valid UUID recognized
  ✅ PASSED: Invalid UUID string rejected
  ✅ PASSED: Null UUID rejected
  ✅ PASSED: Empty UUID rejected
  ✅ PASSED: Valid pagination parsed correctly
  ✅ PASSED: Limit clamped to max 100
  ✅ PASSED: Negative offset clamped to 0
  ✅ PASSED: Valid requirement payload validated
  ✅ PASSED: Valid item preserved
  ✅ PASSED: Negative beneficiary count rejected
  ✅ PASSED: Invalid urgency enum rejected
  ✅ PASSED: Empty items array rejected
  ✅ PASSED: Negative item quantity rejected

--- 6. Deterministic Matching Engine Unit Tests ---
  ✅ PASSED: Zero-distance proximity scores 1
  ✅ PASSED: Beyond-radius proximity scores 0
  ✅ PASSED: Food aliases normalize as exact matches
  ✅ PASSED: Related pulse categories score 0.5
  ✅ PASSED: Unrelated foods do not match
  ✅ PASSED: Nearly fulfilled valid need uses the 0.1 floor
  ✅ PASSED: Partially supported requirements remain matchable
  ✅ PASSED: Multiple donor items match multiple requirement items
  ✅ PASSED: Score breakdown exposes proximity
  ✅ PASSED: Location-only Flow A keeps nearby requirements
  ✅ PASSED: Expired and no-food-match requirements are excluded from Flow B
  ✅ PASSED: Nutrition attention uses available indicator data deterministically
  ✅ PASSED: Nutrition attention returns curated food recommendations
  ✅ PASSED: Nutrition attention supports unavailable data
  ✅ PASSED: Imported NFHS indicator names map to reference keys
  ✅ PASSED: Imported NFHS indicators trigger curated recommendations

--- Rate Limiter Middleware Unit Tests ---
  ✅ PASSED: Rate limiter call 1 allowed (200)
  ✅ PASSED: Rate limiter call 2 allowed (200)
  ✅ PASSED: Rate limiter call 3 blocked with 429
  ✅ PASSED: Rate limit message returned in response

--- 7. File Upload Safety & MIME Validation ---
  ✅ PASSED: PDF allowed for document upload
  ✅ PASSED: JPEG allowed for document upload
  ✅ PASSED: PNG allowed for document upload
  ✅ PASSED: JavaScript files disallowed
  ✅ PASSED: Shell scripts disallowed
  ✅ PASSED: Generic binary files disallowed

--- 8. Core Business Flow & State Consistency Logic ---
  ✅ PASSED: under_review is valid
  ✅ PASSED: active is valid
  ✅ PASSED: fulfilled is valid
  ✅ PASSED: Donor-only confirmation does not fulfill requirement
  ✅ PASSED: Requester-only confirmation does not fulfill requirement
  ✅ PASSED: Dual confirmation successfully triggers completion
  ✅ PASSED: Quantity deduction is accurate
  ✅ PASSED: Remaining quantity cannot go negative (floored at 0)
  ✅ PASSED: Fulfillment rate is 0 when no eligible requirements exist
  ✅ PASSED: Fulfillment rate is fulfilled / (active + partial + fulfilled)

========================================
📊 Test Results: 100 passed, 0 failed
========================================
```

### 15.2 Build Verification Results

| Build Target | Command | Outcome | Time |
|-------------|---------|---------|------|
| Client Production Build | `vite build` | ✅ 0 errors | ~519 ms |
| Server Syntax Check | `node --check src/index.js` | ✅ Valid | < 100 ms |
| ESLint Lint Pass | `npm run lint` | ✅ 0 new warnings (pre-existing warnings noted) | — |

### 15.3 Overall Test Execution Summary

| Test Type | Total TCs | Passed | Failed | Pass Rate |
|-----------|-----------|--------|--------|-----------|
| Unit Testing | 45 | 45 | 0 | **100%** |
| Integration Testing | 25 | 25 | 0 | **100%** |
| System Testing | 30 | 30 | 0 | **100%** |
| Security Testing | 20 | 20 | 0 | **100%** |
| Performance Testing | 9 | 9 | 0 | **100%** |
| UAT | 15 | 15 | 0 | **100%** |
| **TOTAL** | **144** | **144** | **0** | **100%** |

---

## 16. Defect Report

### 16.1 Defects Found and Resolved During Development

| Defect ID | Module | Severity | Description | Root Cause | Resolution | Status |
|-----------|--------|----------|-------------|-----------|------------|--------|
| DEF-01 | `MaharashtraDistrictMap.jsx` | High | React Rules of Hooks crash — `useMemo` placed after early return | Hook placed after a conditional `return`, violating React hook rules | Moved `useMemo` before all conditional early returns | ✅ Resolved |
| DEF-02 | `ExploreMap.jsx` — Needed Right Now cards | Medium | Live requirement cards not rendering — items were spread instead of nested | `requirement.items.map(item => ...)` instead of `{ item, requirement }` spread | Fixed spread to correctly nest item and requirement references | ✅ Resolved |
| DEF-03 | `nutritionAttention.js` — NFHS Recommendations | High | Zero food recommendations returned for all districts | NFHS import column names (`stunting`) compared against reference keys (`children_under5_stunted_pct`) — mismatch blocked all matches | Added canonical indicator name aliases (`canonicalIndicatorName()`) | ✅ Resolved |
| DEF-04 | `AdminDashboard.jsx` | High | Blank screen on admin login — `ReferenceError: RECENT_ACTIVITY is not defined` | `RECENT_ACTIVITY` array removed in data audit but sidebar still iterated over it | Replaced with live fraud signal / pending requirement snapshot | ✅ Resolved |
| DEF-05 | `ExploreMap.jsx` | Medium | Food image mismatches — moong dal showed mason jar, jowar duplicated wheat | `foodImageMap.js` had stale/incorrect mappings | Added dedicated high-resolution food images; registered clean aliases | ✅ Resolved |
| DEF-06 | `RequirementDetails.jsx` | Low | Missing Back navigation on nested pages | No back action on support and requirement detail pages | Added consistent Back action to nested requirement, support, and district pages | ✅ Resolved |
| DEF-07 | `DonorDashboard.jsx` | Low | Donor stats counted all offers, not just the authenticated donor's | `support_offers` joined without filtering by `donor_id` | Filtered dashboard statistics to current user's `support_offers` only | ✅ Resolved |
| DEF-08 | `LoginRequired.jsx` | Low | Post-login redirect ignored router state destination | `LoginRequired` used a hardcoded fallback, discarding router `state.from` | Fixed to prioritize `router.state.from` for post-login destination | ✅ Resolved |

### 16.2 Open Defects / Known Limitations

| Defect ID | Module | Severity | Description | Notes |
|-----------|--------|----------|-------------|-------|
| DEF-09 | Existing ESLint warnings | Low | Several unused import warnings in `RequesterDashboard.jsx` and other components | Pre-existing; no functional impact; target for Phase 3 cleanup |
| DEF-10 | Full E2E browser testing | Medium | Cannot automate full multi-user session flows with real Firebase token issuance without live credentials | Limitation of testing environment; manually verified |

---

## 17. Test Summary & Conclusion

### 17.1 Summary

PoshanSetu underwent rigorous, multi-phase testing spanning six testing types as defined by SPPU's Software Testing curriculum. A total of **144 test cases** were designed and executed using a combination of an automated custom test runner, Postman API collections, Vite production builds, ESLint static analysis, and manual browser-based UAT.

The automated backend test suite passes **100 out of 100 assertions** with zero failures, covering:
- Public API health and data correctness
- Full RBAC enforcement (11 protected endpoints verified)
- HTTP security headers (nosniff, X-Frame-Options, Referrer-Policy, Express fingerprint removal)
- CORS rejection for unauthorized origins
- Malformed input handling (400 on bad JSON)
- UUID and pagination validation with boundary cases
- Requirement validator with field-level rules
- Deterministic matching engine with 11 scoring assertions
- Nutrition attention with canonical NFHS indicator normalization
- Rate limiter sliding-window enforcement
- MIME type whitelist for file uploads
- Core business logic: dual confirmation, quantity floors, fulfillment rate

### 17.2 Quality Metrics

| Metric | Value |
|--------|-------|
| Total Test Cases | 144 |
| Automated Test Assertions | 100 |
| Pass Rate | **100%** |
| Open Critical/High Defects | **0** |
| Defects Found & Resolved | 8 |
| Client Production Build | ✅ 0 errors |
| ESLint New Warnings | 0 |
| Vite Build Time | ~519 ms |

### 17.3 Conclusion

Testing confirms that PoshanSetu is **functionally correct, secure, and stable** for its current development phase. The platform correctly enforces:

- **Authentication and authorization** across all three user roles
- **Data integrity** through dual-confirmation fulfillment, non-negative quantity floors, and status machine enforcement
- **Security boundaries** through hardened HTTP headers, parameterized SQL, CORS restrictions, and rate limiting
- **Deterministic, AI-free logic** in matching and nutrition attention scoring

The test coverage satisfies SPPU Software Testing requirements for Unit Testing, Integration Testing, System Testing, Security Testing, Performance Testing, and UAT with documented test cases, tools, traceability, and defect tracking.

---

*Prepared in accordance with SPPU Software Testing Syllabus | PoshanSetu PBL Project | October 2026*
