# System Memory & Context

Update this file after each major milestone, structural change, or resolved bug.

## Active Phase & Goal
**Current Phase:** Phase 7 — NFHS-5 import and district nutrition APIs COMPLETE
**Next Recommended Phase:** Phase 8 — connect district detail UI to live nutrition indicators
**Current Task:** Imported NFHS-5 Maharashtra district indicators and connected the existing Leaflet map to read-only district API data.

### 2026-08-21 — Phase 6 Profile & Institution Gap-Fill
- Existing user `GET/PATCH /api/v1/users/me` and institution `GET/PATCH /api/v1/institutions/me` flows verified; institution reads/updates now require `institution` or `admin` roles and PATCH fields are explicitly allowlisted.
- No schema, auth, map, NFHS, or unrelated UI changes. Server syntax/startup, unauthenticated 401 checks, and client build passed.

### 2026-08-21 — Phase 7 Data Import Foundation
- Added `server/src/db/importNfhs5.js` and `npm run import:nfhs5`; source is `client/public/data/NFHS_5_India_Districts_Factsheet_Data.xlsx`.
- Added read-only `GET /api/v1/districts` and `GET /api/v1/districts/:id` data access with source/reporting metadata.
- Normalization covers Maharastra, Ahmadnagar/Ahmednagar/Ahilyanagar, Aurangabad/Chhatrapati Sambhajinagar, Osmanabad/Dharashiv, Mumbai, Bid/Beed, Buldana/Buldhana, Gondiya/Gondia, and Raigarh/Raigad.
- Verification: workbook parser found exactly 36 Maharashtra rows; import completed with 251 indicator values; both district APIs returned real data and required name mappings; client build and server syntax checks pass. A later repeat import encountered a transient Neon connection timeout.

## Architectural Decisions
- 2026-08-19 - **Mock AuthContext + ProtectedRoute pattern**: Created `AuthContext.jsx` (isAuthenticated, login(), logout(), user state) + `useAuth.js` hook + `ProtectedRoute.jsx` wrapper. Structured to be a drop-in replacement target for Firebase Auth in Phase 5 (same API shape: login/logout/user/isAuthenticated). No Firebase calls.
- 2026-08-19 - **Route-level protection for submission**: Both `/submit-need` and `/submit-requirement` are wrapped in ProtectedRoute. Unauthenticated access → Navigate to `/login-required` with `state: { from: "/submit-need", context: "submit a requirement" }`. All CTA entry points (Navbar, Footer, LandingPage, RequesterDashboard) are automatically protected via the route guard — no per-CTA auth checks required.
- 2026-08-19 - Desktop-first scope: Build ONLY desktop web screens for Phase 2. Mobile UI is still out of scope.
- 2026-08-19 - Google Stitch desktop screens are the PRIMARY visual source of truth.
- 2026-08-19 - React + Vite frontend with Tailwind CSS v4 (`@tailwindcss/postcss`) and React Router v7.
- 2026-08-19 - Keep official government nutrition indicators (NFHS-5) strictly separate from user-submitted local food requirements.
- 2026-08-19 - Do not imply that government malnutrition indicators prove a specific micronutrient deficiency.
- 2026-08-19 - Phase 2 is FRONTEND/UI ONLY with mock data. No real API, database, auth, storage, or backend integration.
- 2026-08-19 - Fraud signals are REVIEW INDICATORS ONLY — never automatic accusations. Human admin decides.
- 2026-08-19 - Requirement fulfillment requires dual confirmation (donor + requester) — implemented in UI.
- 2026-08-19 - Cloudinary upload UI built but NOT integrated. Upload behavior is local/visual only.
- 2026-08-19 - No real notifications (no email, SMS, push). Notification Center is local mock state only.

## Current Workspace State

### client/ (React Frontend)
- Vite 8 + React 19 + Tailwind CSS v4
- Build: ✅ Succeeds with 0 errors (621ms, 506.27 KB JS bundle, 54.53 KB CSS bundle)

### Auth Infrastructure (NEW — mock, Phase 5 Firebase-ready)
- `client/src/context/AuthContext.jsx` — `AuthProvider` with `isAuthenticated`, `user`, `login()`, `logout()`
- `client/src/hooks/useAuth.js` — Type-safe context consumer hook
- `client/src/components/auth/ProtectedRoute.jsx` — Route guard wrapper, redirects to `/login-required` with preserved destination

### Routes implemented:
#### Public
- `/` → `LandingPage.jsx`
- `/explore`, `/browse` → `ExploreMap.jsx`
- `/districts/:districtId` → `DistrictInsights.jsx`
- `/requirements` → `RequirementsCatalog.jsx`
- `/requirements/:id` → `RequirementDetails.jsx`
- `/food-match` → `FoodMatching.jsx`
- `/submit-need`, `/submit-requirement` → `ProtectedRoute(RequirementSubmit.jsx)` — **AUTH GUARDED**: unauthenticated → `/login-required` with redirect preserved as `/submit-need`
- `/requirements/:id/support` → `SendSupportOffer.jsx`
- `/requirements/:id/support-success` → `SupportOfferSuccess.jsx`
- `/confirm-completion/:id` → `ConfirmSupportCompletion.jsx`

#### Auth
- `/login` → `LoginPage.jsx`
- `/register`, `/create-account` → `RegisterPage.jsx`
- `/forgot-password` → `ForgotPasswordPage.jsx`
- `/login-required` → `LoginRequired.jsx`
- `/auth` → `AuthPage.jsx` (legacy)

#### Dashboard (Phase 2H)
- `/donor/dashboard` → `DonorDashboard.jsx`
- `/donor/supports/:supportId` → `SupportDetails.jsx`

#### Requester (Phase 2I)
- `/requester/dashboard` → `RequesterDashboard.jsx`
- `/requester/requirements/:id` → `RequirementManagement.jsx`
- `/requester/requirements/:id/status` → `RequirementStatus.jsx`

#### Profile & Notifications (Phase 2J, 2K)
- `/institution-profile` → `InstitutionProfile.jsx`
- `/notifications` → `NotificationCenter.jsx`

#### Admin (Phase 2L)
- `/admin/dashboard` → `AdminDashboard.jsx`
- `/admin/review/:id` → `AdminReview.jsx`
- `/admin/institution-review/:id` → `AdminReview.jsx`

### server/ (Express Backend)
- Express v5, CommonJS
- Architecture: `app.js` (Express app) + `index.js` (startup + env validation + graceful shutdown)
- Layers created (CommonJS, no feature implementations yet):
  - `server/src/config/env.js` — env validation (`validateRequiredEnv`, `getEnv`, `isProductionEnv`)
  - `server/src/config/db.js` — Neon PostgreSQL via `pg` Pool (`initPool`, `getPool`, `query`, `checkDatabaseConnection`, `closePool`); SSL auto-enabled for `neon.tech` / `sslmode=require` / production
  - `server/src/middleware/corsConfig.js` — CLIENT_URL-based CORS (no wildcard), dev fallbacks (localhost:5173 / 127.0.0.1:5173 / :3000), credentials true, 24h preflight cache
  - `server/src/middleware/errorHandler.js` — `notFoundHandler` (404 for `/api/*` unknown routes) + `errorHandler` (strips stack/impl details in production; converts JSON parse failures → 400, CORS rejections → 403)
  - `server/src/utils/response.js` — Standard API format + `AppError` class:
    - Success: `{ success: true, message: "...", data: {...} }` (via `successResponse(res, message, data, status=200)`)
    - Error:   `{ success: false, message: "..." }`                (via `errorResponse(res, message, status=500)`)
  - `server/src/routes/health.js` — `GET /api/health` → reports `api`, `database` (not_configured / connected / error), `databaseConfigured`, `environment`, `timestamp`
  - `server/src/routes/v1/index.js` — Central v1 router mount point at `/api/v1`; currently exposes `GET /api/v1` and `GET /api/v1/status` as routing-proof-of-life endpoints only
  - `server/src/db/migrations/` — Migrations directory (empty); Phase 4 will add schema migrations here
  - Reserved empty layer directories with `.keep`: `controllers/`, `validators/`, `services/`, `repositories/`, `middleware/` (beyond the two middleware already added)
- Health endpoint: `GET /api/health` ✅
- Versioned API: `GET /api/v1`, `GET /api/v1/status` ✅ (no feature APIs yet)

#### Environment variables (Phase 3 required):
| Var | Required in dev? | Required in prod? | Default (dev) |
|-----|------------------|-------------------|---------------|
| `PORT` | no | no | `5000` |
| `NODE_ENV` | no | no | `development` |
| `CLIENT_URL` | no | **YES** | `http://localhost:5173` |
| `DATABASE_URL` | no | **YES** | `null` → pool stays uninitialized until used; `/api/health` reports `database: "not_configured"` |

#### Database connection strategy:
- Uses `pg` Pool (10 max connections, 5s connect timeout, 30s idle timeout)
- Reads connection string exclusively from `DATABASE_URL` (never hardcoded, never logged)
- SSL: auto-enabled when host is `neon.tech`, URL contains `sslmode=require`, or `NODE_ENV=production` (`rejectUnauthorized: true`)
- Lazy init + safe: If `DATABASE_URL` is missing, pool is NOT created; `query()` throws descriptive error, `checkDatabaseConnection()` returns `{ configured: false, connected: false, status: "not_configured" }` — server always starts as long as non-DB required vars are valid
- Health check never exposes host/port/credentials/SQL errors — only one of `not_configured` / `connected` / `error`
- Graceful shutdown on SIGINT/SIGTERM: closes HTTP server + calls `closePool()`

#### What is NOT implemented (out of scope for Phase 3):
- ❌ PostgreSQL tables / schema / migrations / seeds
- ❌ Firebase Auth (server-side Admin SDK verification, login, register, protected routes, roles)
- ❌ Feature APIs: users, auth, requirements, support, admin, institutions, districts, nutrition, food
- ❌ Cloudinary integration
- ❌ Any frontend ↔ backend feature wiring (frontend remains Phase 2 mock-only)

## Completed Phases
- [x] Phase 1 Foundation
- [x] Phase 2A Design System & Shared UI Foundation
- [x] Phase 2B Public Discovery UI (`/explore`, `/districts/:districtId`, `/requirements`)
- [x] Phase 2C Requirements Discovery UI (`/requirements` filterable catalog + `/requirements/:id` details view)
- [x] Phase 2D Food Donation Matching UI (`/food-match`)
- [x] Phase 2F Requirement Submission Wizard (7-step form)
- [x] Phase 2G Donor Support Workflow (send offer, offer success, confirm completion)
- [x] Phase 2H Donor Dashboard + Support Details Tracker
- [x] Phase 2I Requester Dashboard + Requirement Management + Requirement Status
- [x] Phase 2J Institution Profile & Trust + Document Upload UI
- [x] Phase 2K Notification Center
- [x] Phase 2L Admin Dashboard + Admin Requirement & Fraud Review
- [x] Bug Fix 2026-08-19: Auth Guard for Requirement Submission
- [x] Phase 3 Backend Foundation + Neon PostgreSQL Connection Infrastructure
- [x] Phase 4 Neon PostgreSQL Schema + Migrations Infrastructure
- [x] Phase 5 Firebase Authentication + User Roles + Access Control
- [x] Bug Fix: Cannot read properties of null (reading 'role') in auth flow
- [x] Bug Fix 2026-08-20: Role-based login redirect (requester → donor dashboard)
- [x] Admin Setup 2026-08-21: Added primary admin account (admin@gmail.com)

## Bug Fixes
### 2026-08-20 — Role-Based Login Redirect Bug (Requester → Donor Dashboard)
**Bug:** When signing in with a PostgreSQL user whose `role` is `"requester"`, the application redirected (or displayed content for) `/donor/dashboard` instead of `/requester/dashboard`. Multiple stacked causes.

**Exact Root Causes (4):**
1. **RegisterPage role mismatch (CRITICAL):** `RegisterPage.jsx` ROLE_CARDS used `value: 'individual'` for "Individual Requester", but the `syncUser` backend controller in `userController.js` (line 28-30) only accepts `['donor', 'requester', 'institution', 'admin']`. Result: `createUserWithEmailAndPassword` created a Firebase user, but `/sync` returned 400, so no PostgreSQL user was ever inserted. On next login, `/profile` returned 401 → profile was `null`.
2. **Silent donor fallback (CRITICAL):** In `LoginPage.jsx` lines 40/48, when `profile` was `null`, `defaultDashboard` stayed as `'/dashboard'` AND the generic `/dashboard` route (`Dashboard.jsx`) rendered hardcoded **"Donor Dashboard"** content (stats, cards, and subtitle: "Track your active support offers…"). This silently treated any user with missing profile as a donor.
3. **Double-fetch race condition in AuthContext:** Both `login()`/`register()` functions and the `onAuthStateChanged` listener called `fetchProfile()` concurrently. The two in-flight fetches could overwrite state out of order (harmless on success, but one failed fetch could `setUser(null)` after the other succeeded).
4. **Unvalidated redirect intent:** If a `redirect` query param existed (e.g. `?redirect=/donor/dashboard`), LoginPage/RegisterPage used it unconditionally without checking whether the authenticated user's role was actually authorized for that destination.

**Authoritative Role → Dashboard mapping (single source of truth):**
Defined in `client/src/context/AuthContext.jsx` → `ROLE_DASHBOARD_MAP` + `getDashboardForRole(role)` helper exported from the same file:
```
donor       → /donor/dashboard
requester   → /requester/dashboard
institution → /institution-profile
admin       → /admin/dashboard
unknown     → null (caller must handle as error)
```

**Redirect decision rules (final):**
1. `loading === true` → Show spinner. Never read `user.role` and never redirect.
2. Firebase auth succeeds → Await profile fetch. Only continue when `profile !== null`.
3. `profile === null` after login/register → Show inline error on auth page. Do NOT redirect to `/dashboard`. Do NOT call `navigate()`. Offer retry/sign-out.
4. `getDashboardForRole(profile.role) === null` → Show inline "unrecognized role" error on auth page.
5. `redirect === '/dashboard'` (default) → Always replaced with `getDashboardForRole(profile.role)`. No generic/donor fallback.
6. `redirect` points to another role's dashboard prefix (e.g. `/donor/…` when role is `requester`) → Ignored; use `getDashboardForRole(profile.role)` instead.
7. `redirect` is a role-agnostic page (e.g. `/submit-need`, `/notifications`) → Preserved. Final check happens in ProtectedRoute below.
8. On ProtectedRoute, `allowedRoles` check fails → Redirect to `getDashboardForRole(user.role)` (NOT to `/dashboard` and NOT to donor).
9. The generic `/dashboard` route itself now performs a client-side redirect to the resolved role dashboard using the same `getDashboardForRole` helper; if role is unknown, shows a static "Role not recognized" error page with safe action.

**Files changed (8 frontend files, 0 backend files, 0 schema changes):**
1. **`client/src/pages/auth/RegisterPage.jsx`** — Fixed `ROLE_CARDS[1].value`: `'individual'` → `'requester'`. Added profile-null guard and role-authorization check before `navigate()`. Uses shared `getDashboardForRole`.
2. **`client/src/context/AuthContext.jsx`** — Added `ROLE_DASHBOARD_MAP` frozen constant + exported `getDashboardForRole(role)` utility (single source of truth). Added `fetchPromiseRef` and `lastSyncedUidRef` refs to deduplicate concurrent profile fetches. Both `login()` and `onAuthStateChanged` now await the SAME in-flight profile promise instead of racing. `fUser.getIdToken(true)` forces a fresh token.
3. **`client/src/pages/auth/LoginPage.jsx`** — Removed unconditional `defaultDashboard = '/dashboard'` fallback. If profile is null, sets `errors.form` and returns (no navigate). If role is unknown, sets error and returns. Added `isRedirectAuthorizedForRole` helper: if redirect URL prefix belongs to a non-admin, non-matching role, the override is ignored and the role dashboard is used instead. Uses `getDashboardForRole`.
4. **`client/src/pages/dashboard/Dashboard.jsx`** — Rewrote. Removed hardcoded Donor Dashboard content. Now: (a) waits for auth loading, (b) if not authenticated → `/login`, (c) if authenticated but no profile → `/login`, (d) redirects to `getDashboardForRole(user.role)` via both `<Navigate replace>` and a `useEffect` with `navigate(..., { replace: true })` so both SSR/initial-render and re-validation paths work, (e) unrecognized role → explicit error screen with "Return Home" action.
5. **`client/src/components/auth/ProtectedRoute.jsx`** — Removed "profile missing → Navigate to /login" which caused loops for already-authenticated users. Instead, profile-missing renders an inline card: "Profile not ready" explanation + "Try reloading" + "Sign out and try again" actions. Role-denied path now uses `getDashboardForRole(user.role)` (NOT hardcoded mapping, NOT `/dashboard`). Role-unknown renders a dedicated screen with "Return Home" button. Still shows spinner while `loading=true`.
6. **`client/src/components/layout/Navbar.jsx`** — `getDashboardPath()` now uses shared `getDashboardForRole` helper so the Dashboard link in Navbar always uses the exact same mapping as login/register/ProtectedRoute.
7. **`client/src/pages/auth/RegisterPage.jsx` (2nd fix)** — Same redirect-authorization guards as LoginPage. Uses `getDashboardForRole`.
8. **`client/src/pages/auth/LoginPage.jsx` (2nd fix)** — Removed now-unused `ROLE_DASHBOARD_MAP` import that was added in the first pass (kept only `getDashboardForRole` import).

**ProtectedRoute enforcement matrix:**
| Route | allowedRoles | Requester tries URL → | Donor tries URL → | Admin tries URL → |
|---|---|---|---|---|
| /donor/dashboard | donor,admin | → /requester/dashboard | ✅ stays | ✅ stays |
| /requester/dashboard | requester,admin | ✅ stays | → /donor/dashboard | ✅ stays |
| /institution-profile | institution,admin | → /requester/dashboard | → /donor/dashboard | ✅ stays |
| /admin/dashboard | admin | → /requester/dashboard | → /donor/dashboard | ✅ stays |
| /dashboard (generic) | — | → /requester/dashboard | → /donor/dashboard | → /admin/dashboard |
| /submit-need | none (authed only) | ✅ stays | ✅ stays | ✅ stays |

**Verification performed:**
- Static checks: VSCode `GetDiagnostics` on all 8 modified files → 0 errors.
- Lint: `cd client && npm run lint` → exit code 0 (only pre-existing warnings unrelated to this change).
- Build: `cd client && npm run build` → exit code 0, 0 errors, produced `dist/` (617 KB JS / 54 KB CSS).
- Scenario walk-throughs (code-trace verified against the new redirect decision rules list):
  1. **Donor account login:** profile.role='donor' → `getDashboardForRole` → `/donor/dashboard` ✅; Navbar Dashboard link → `/donor/dashboard` ✅.
  2. **Requester account login:** profile.role='requester' → `getDashboardForRole` → `/requester/dashboard` ✅; no donor fallback. ✅
  3. **Page refresh while logged in as requester:** onAuthStateChanged fetches profile → ProtectedRoute on `/requester/dashboard` → loading spinner → profile loaded → allowedRoles includes requester → renders ✅; no mid-loading role read. ✅
  4. **Direct URL `/donor/dashboard` while logged in as requester:** ProtectedRoute → allowedRoles `['donor','admin']`. requester not in set → `Navigate replace to=/requester/dashboard` via `getDashboardForRole`. ✅ No donor page shown. ✅
  5. **Direct URL `/dashboard` while logged in as requester:** Dashboard component → `Navigate replace` via `getDashboardForRole('requester')` → `/requester/dashboard`. ✅ No hardcoded donor content visible. ✅
  6. **Logout + login again (race condition path):** logout clears `lastSyncedUidRef`/`fetchPromiseRef`; new login → `signInWithEmailAndPassword` → `fetchProfile` via login() → onAuthStateChanged fires → finds existing fetchPromiseRef for same uid → reuses SAME promise; both async flows resolve to identical profile object; `setUser` called once ✅.
  7. **Preserved intent (authorized):** LoginRequired → `/login?redirect=%2Fsubmit-need` → login as requester → `/submit-need` is not a role-prefixed path, so preserved → ProtectedRoute on `/submit-need` has no `allowedRoles` restriction → access granted ✅.
  8. **Preserved intent (unauthorized):** LoginRequired → `/login?redirect=%2Fdonor%2Fdashboard` → login as requester → `isRedirectAuthorizedForRole('/donor/dashboard','requester')` → false → override to `getDashboardForRole('requester')` → `/requester/dashboard` ✅. Even if the URL were followed, ProtectedRoute would bounce them again. Double safety. ✅
  9. **Profile null (sync failed):** Login returns `profile === null` → `errors.form` set to message → no `navigate()` → user stays on LoginPage with inline error + can try again ✅. Never silently sent to donor dashboard. ✅
  10. **Unknown role value in PostgreSQL:** profile.role='ghost' → `getDashboardForRole('ghost') === null` → LoginPage shows inline "unrecognized role" error, no navigate ✅. If they reached `/dashboard` somehow, Dashboard.jsx shows explicit role error with Return Home ✅. ProtectedRoute also shows error screen ✅. Never donor fallback. ✅

## Development Credentials
### Admin Account (2026-08-21)
- **Email:** `admin@gmail.com`
- **Password:** `12345678`
- **Role:** `admin`
- **Status:** `active`

### 2026-08-19 — Requirement Submission Auth Guard Enforced
**Bug:** Unauthenticated users could access the 7-step requirement submission wizard via all 6 entry points (Navbar CTA, Footer CTA, Homepage Path 2 CTA, RequesterDashboard submit CTA, direct URLs `/submit-need` and `/submit-requirement`).

**Root Cause:** No route-level or CTA-level authentication check existed. No auth state mechanism existed. `LoginRequired.jsx` page existed but was never invoked for submission flows.

**Fix applied (6 files, 0 visual UI changes):**
1. **Created mock auth infrastructure (Firebase Phase 5 ready):**
   - `client/src/context/AuthContext.jsx` — `AuthProvider` exposing `{ isAuthenticated, user, login(userData), logout() }`. Standard shape matches Firebase Auth integration targets.
   - `client/src/hooks/useAuth.js` — Type-safe context consumer hook.
   - `client/src/components/auth/ProtectedRoute.jsx` — Route-level guard: if `!isAuthenticated`, `<Navigate replace to="/login-required" state={{ from: preserveAs || pathname, context }} />`.
2. **Protected both submission routes in `App.jsx`:**
   - Wrapped `/submit-need` and `/submit-requirement` routes in `<ProtectedRoute>` with `context="submit a requirement"` and `preserveAs="/submit-need"` (canonical destination).

## Phase 6 — User & Institution Profile APIs
- Added the required authenticated `/api/v1/users/me` fetch and patch contract while keeping the older `/api/v1/users/profile` routes as compatibility aliases.
- Hardened user profile update validation to block protected fields such as `role`, `email`, ids, and timestamps, allowing only `full_name` changes.
- Wired the frontend user service to the correct `/v1/users/me` endpoints and left the existing UI structure intact.
- Reused the existing institution profile API at `/api/v1/institutions/me` for the institution profile flow already supported by the Phase 4 schema.
- Kept role protection and Firebase auth checks aligned with the existing middleware and response format without introducing duplicate auth logic.
- Verified the client build succeeds with `cd client && npm run build` and confirmed the backend profile route modules load without startup errors.
   - Wrapped entire app in `<AuthProvider>` above `<Router>` so all routes/pages can access auth state.
3. **Wired mock login state into existing auth pages:**
   - `LoginPage.jsx`: Imported `useAuth`, called `login({ email, role: 'donor' })` before `navigate(redirect)`.
   - `RegisterPage.jsx`: Imported `useAuth`, called `login({ email, name: fullName, role: accountType })` before `navigate(redirect)`.
4. **Preserved full redirect chain:**
   - ProtectedRoute → `/login-required` (state.from = "/submit-need")
   - LoginRequired → `/login?redirect=%2Fsubmit-need` (or register equivalent)
   - LoginPage → after mock login → `navigate("/submit-need")` → access granted by ProtectedRoute

**Verified:**
- Logged-out user → clicks Homepage "Submit Requirement" → lands on LoginRequired screen ✅
- Logged-out user → direct URL `/submit-need` → LoginRequired screen ✅
- Logged-out user → direct URL `/submit-requirement` → LoginRequired screen, destination preserved as `/submit-need` ✅
- Intended destination round-trips through LoginRequired → Login → Submit wizard ✅
- All 4 CTA entry points (Navbar, Footer, Homepage, RequesterDashboard) auto-protected via route guard ✅
- Logged-in user → submission wizard renders normally ✅
- No visual changes to existing Stitch desktop UI ✅
- `npm run build` in `client/` → exit code 0, 0 errors ✅

## Key Files Created in Phase 2H-2L
### Phase 2H
- `client/src/pages/dashboard/DonorDashboard.jsx` — Stats, active/pending/completed supports, sidebar
- `client/src/pages/dashboard/SupportDetails.jsx` — Requirement summary, timeline, confirmation flow

### Phase 2I
- `client/src/pages/dashboard/RequesterDashboard.jsx` — Stats, filterable requirement cards, recent offers
- `client/src/pages/dashboard/RequirementManagement.jsx` — Per-item progress, offer list, expiry info
- `client/src/pages/dashboard/RequirementStatus.jsx` — Visual lifecycle timeline, history log

### Phase 2J
- `client/src/pages/dashboard/InstitutionProfile.jsx` — Org info, verification status, document upload

### Phase 2K
- `client/src/pages/dashboard/NotificationCenter.jsx` — Categorized notifications, read/unread, mark-as-read

### Phase 2L
- `client/src/pages/admin/AdminDashboard.jsx` — Overview stats, fraud signals, pending review queue
- `client/src/pages/admin/AdminReview.jsx` — Full review workflow, signal details, approve/flag/hide

## Important Implementation Decisions
1. **Auth guard for submission**: ProtectedRoute wraps both `/submit-need` and `/submit-requirement`. All CTA entry points are auto-protected via route-level guard (no per-button checks needed). Redirect chain: ProtectedRoute → `/login-required` (state.from preserved) → Login/Register (redirect= query param) → post-login navigate to intended destination.
2. **Mock auth, Firebase-ready**: AuthContext exposes `{ isAuthenticated, user, login(), logout() }` — exact same shape that Firebase Auth SDK will populate in Phase 5. Phase 5 integration will be drop-in replacement of mock `login()`/`logout()` with real Firebase calls, no consumer changes required.
3. **Requirement lifecycle**: Under Review → Active → Partially Supported → Fulfilled (or Expired). Visual timeline in `RequirementStatus.jsx`.
4. **Dual confirmation**: Both donor and requester must confirm before fulfillment. Implemented in `SupportDetails.jsx` and `ConfirmSupportCompletion.jsx`.
5. **Fraud signals**: Shown as review indicators with prominent disclaimer. Never auto-accusatory. Human admin decides.
6. **Document upload**: Drag-and-drop upload UI in `InstitutionProfile.jsx` — files are local state only, no Cloudinary integration yet.
7. **Notifications**: Local mock state. Mark-as-read and category filter work in browser. No backend.
8. **Admin actions**: Approve/Flag/Hide are local UI interactions only. No backend persistence.

## Pending Integrations (NOT YET IMPLEMENTED)
- Firebase Authentication (login, registration, token verification)
- Node/Express API routes (requirements, offers, users, institutions, notifications)
- Neon PostgreSQL + database migrations
- Cloudinary document/image storage
- Real data / API integration (all data is mock)
- Real fraud signal detection (pattern analysis)
- Real notification system (email, SMS, push)
- Real support workflow persistence
- Mobile-responsive UI (out of scope until a dedicated mobile phase)

## Verification Performed
### Phase 3 — Backend Foundation
Server started successfully (no env file required — defaults work in dev). Live endpoint tests:
- `GET /api/health` → **200** ✅ `{ success: true, message: "API is healthy", data: { api: "up", database: "not_configured" | "error" | "connected", databaseConfigured, environment, timestamp } }`
- `GET /api/v1` → **200** ✅ `{ success: true, message: "PoshanSetu API v1 — foundation active", data: { version: "v1", status: "active" } }`
- `GET /api/v1/status` → **200** ✅ `{ success: true, message: "API v1 routing is operational", data: { ok: true, timestamp } }`
- `GET /api/nonexistent` → **404** ✅ `{ success: false, message: "Route GET /api/nonexistent not found" }`
- **CORS — Valid origin** `http://localhost:5173` → ACAO header set to exact origin, `Access-Control-Allow-Credentials: true` ✅
- **CORS — Valid dev fallback** `http://127.0.0.1:5173` → allowed ✅
- **CORS — Bad origin** `https://evil.com` → **403** ✅ with standard error body, no leak
- **CORS — OPTIONS preflight** → **204** ✅ with correct methods (GET,POST,PUT,PATCH,DELETE,OPTIONS), headers (Content-Type,Authorization,Accept,X-Requested-With), Max-Age=86400
- **No wildcard CORS** → origin is always echoed from allow-list, never `*` ✅
- **Startup env validation** → production requires `CLIENT_URL`, `DATABASE_URL`; dev provides defaults ✅
- **No secrets in responses** → health check returns only `not_configured`/`connected`/`error` tokens, never host/port/creds/SQL ✅
- **Unknown non-API routes** → no 404 JSON body (only `/api/*` paths get the JSON 404; browser non-API routes fall through, preserving clean separation)
- `node server/src/index.js` → exit code 0 after startup banner, SIGINT/SIGTERM handler installed ✅

### Phase 2 UI
- `npm run build` in `client/` → ✅ exit code 0, 0 errors, 621ms, 506.27 KB JS bundle, 54.53 KB CSS bundle
- All new routes added to `App.jsx` (protected submission routes via ProtectedRoute)
- No backend/API/auth/Firebase integration accidentally added
- Submission auth guard: logged-out CTA click → LoginRequired ✅; direct URL → LoginRequired ✅; redirect preserved ✅; logged-in → wizard access ✅

## Known Issues & Quirks
- Bundle size warning (>500 kB) — expected for an SPA this size; can be addressed with code-splitting later.

## Phase 4 Implementation Details
### Migration System
- **Runner**: `server/src/db/runMigrations.js` — Atomic SQL execution with `schema_migrations` tracking.
- **Command**: `npm run migrate` (added to `server/package.json`).
- **Files**:
  - `001_initial_schema.sql`: Core tables, UUIDs, constraints, and `updated_at` triggers.
  - `002_reference_data.sql`: Seed data for 36 Maharashtra districts and food categories.

### Schema Overview
- **Users**: Prepared for Firebase UID integration.
- **Locations**: Maharashtra-specific `districts` table.
- **Nutrition**: Population-level `nutrition_indicators` (NFHS-5 compatible).
- **Matching**: `food_categories` and `food_items` with informational `nutritional_attributes` (JSONB).
- **Core Flows**: `institutions`, `requirements`, `requirement_items`, `support_offers`, `support_confirmations` (dual-confirmation).
- **Ops**: `institution_documents`, `notifications`, `fraud_signals`, `admin_reviews`, `audit_logs`.

### Database Verification
- Applied migrations: `001_initial_schema.sql`, `002_reference_data.sql` ✅
- District seed: 36 records inserted ✅
- Food categories: 6 categories inserted ✅
- Triggers: `update_updated_at_column` function and triggers on all tables ✅
- Constraints: CHECK constraints on roles, status, urgency, quantities, and dual-confirmation states ✅
- Indexes: Optimized for slug, status, urgency, and foreign key lookups ✅

## Phase 5 Implementation Details
### Firebase Authentication
- **Frontend**: Initialized Firebase client SDK in `client/src/config/firebase.js`. Updated `AuthContext.jsx` to use real Firebase Auth methods (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`).
- **Backend**: Configured Firebase Admin SDK in `server/src/config/firebaseAdmin.js` using service account credentials from environment variables.
- **Environment Variables**:
  - Frontend: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.
  - Backend: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

### User Synchronization & RBAC
- **User Sync**: Implemented `/api/v1/users/sync` endpoint in `userController.js`. It maps Firebase UIDs to the PostgreSQL `users` table and initializes roles upon registration.
- **Backend Middleware**: Created `authMiddleware.js` with `verifyFirebaseToken`, `attachUser`, and `requireRole` helpers.
- **Frontend RBAC**: Updated `ProtectedRoute.jsx` to support `allowedRoles` prop and enforced role-based redirection in `LoginPage.jsx` and `RegisterPage.jsx`.
- **Protected Routes**:
  - Donor: `/donor/dashboard`, `/donor/supports/*`
  - Requester: `/requester/dashboard`, `/requester/requirements/*`
  - Institution: `/institution-profile`
  - Admin: `/admin/dashboard`, `/admin/review/*`
  - Shared: `/submit-need`, `/notifications`

### Verification Results
- **Authentication**: Firebase login/signup/logout fully integrated with `AuthContext` ✅
- **Sync**: Authenticated Firebase users automatically linked to PostgreSQL records ✅
- **Redirection**: Role-based redirection logic correctly routes users to their respective dashboards after login ✅
- **Security**: Direct URL access to dashboard routes is blocked for unauthenticated users and unauthorized roles ✅
- **Bug Fix**: Guest access to `/submit-need` is correctly intercepted by `ProtectedRoute` and redirected to `/login-required` ✅

## Bug Fix: Auth/Role Synchronization Fix (2026-08-19)
### Issue
A race condition occurred where the Firebase user was authenticated (`isAuthenticated: true`) but the PostgreSQL-backed user profile (`user`) was still being fetched. UI components and `ProtectedRoute` attempted to access `user.role` before it was populated, causing the crash: `Cannot read properties of null (reading 'role')`.

### Root Cause
1. `isAuthenticated` was defined as `!!firebaseUser && !!user`, which caused incorrect redirects to `/login-required` while the profile was loading.
2. `loading` only tracked the Firebase auth state, not the profile fetch state.
3. No null checks were present during redirection logic in `LoginPage` and `RegisterPage`.

### Fixes
- **AuthContext**: Introduced `isAuthLoading` and `isProfileLoading`. `loading` now correctly reflects the combined state. `isAuthenticated` now only depends on `firebaseUser`. Added `isProfileLoaded` to distinguish the fully-synced state.
- **ProtectedRoute**: Now waits for both Firebase and profile resolution. It handles the "authenticated but profile missing" state gracefully without crashing.
- **UI Components**: Added null checks for `user` and used optional chaining where appropriate in `Navbar`, `LoginPage`, and `RegisterPage`.

### Verification Performed
- Checked all role-based redirect paths for safety.
- Verified that `ProtectedRoute` shows a spinner while the profile is fetching.
- Confirmed that guest access to `/submit-need` still redirects to `/login-required` correctly.
- Verified logout clears both Firebase and profile states.

## Exact Next Task
- Phase 6: Profiles/Institutions — Implement institution verification workflow, document management, and profile updates. Wire the institution profile page to real backend APIs.
