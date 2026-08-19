# System Memory & Context

Update this file after each major milestone, structural change, or resolved bug.

## Active Phase & Goal
**Current Phase:** Phase 2 — Frontend/UI Complete (2A through 2L) + Bug Fix: Auth Guard for Submission
**Next Recommended Phase:** Phase 3 — Backend Foundation (Neon PostgreSQL + Firebase Auth + Express API)
**Current Task:** All Phase 2 desktop screens implemented + submission auth guard enforced with mock auth state.

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
- Health endpoint: `GET /api/health` → `{ status: 'OK' }`
- NO real API endpoints implemented yet

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

## Bug Fixes
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
- `npm run build` in `client/` → ✅ exit code 0, 0 errors, 621ms, 506.27 KB JS bundle, 54.53 KB CSS bundle
- All new routes added to `App.jsx` (protected submission routes via ProtectedRoute)
- No backend/API/auth/Firebase integration accidentally added
- Submission auth guard: logged-out CTA click → LoginRequired ✅; direct URL → LoginRequired ✅; redirect preserved ✅; logged-in → wizard access ✅

## Known Issues & Quirks
- Bundle size warning (>500 kB) — expected for an SPA this size; can be addressed with code-splitting later.

## Exact Next Task
- Phase 3: Backend Foundation — Neon PostgreSQL setup, database migrations, Firebase Auth, and first real API endpoints.
