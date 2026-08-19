# System Memory & Context

Update this file after each major milestone, structural change, or resolved bug.

## Active Phase & Goal
**Current Phase:** Phase 2 — Frontend/UI Complete (2A through 2L)
**Next Recommended Phase:** Phase 3 — Backend Foundation (Neon PostgreSQL + Firebase Auth + Express API)
**Current Task:** All Phase 2 desktop screens implemented with mock data.

## Architectural Decisions
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
- Build: ✅ Succeeds with 0 errors (446ms, 504 KB JS bundle)

### Routes implemented:
#### Public
- `/` → `LandingPage.jsx`
- `/explore`, `/browse` → `ExploreMap.jsx`
- `/districts/:districtId` → `DistrictInsights.jsx`
- `/requirements` → `RequirementsCatalog.jsx`
- `/requirements/:id` → `RequirementDetails.jsx`
- `/food-match` → `FoodMatching.jsx`
- `/submit-need`, `/submit-requirement` → `RequirementSubmit.jsx`
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
1. **Requirement lifecycle**: Under Review → Active → Partially Supported → Fulfilled (or Expired). Visual timeline in `RequirementStatus.jsx`.
2. **Dual confirmation**: Both donor and requester must confirm before fulfillment. Implemented in `SupportDetails.jsx` and `ConfirmSupportCompletion.jsx`.
3. **Fraud signals**: Shown as review indicators with prominent disclaimer. Never auto-accusatory. Human admin decides.
4. **Document upload**: Drag-and-drop upload UI in `InstitutionProfile.jsx` — files are local state only, no Cloudinary integration yet.
5. **Notifications**: Local mock state. Mark-as-read and category filter work in browser. No backend.
6. **Admin actions**: Approve/Flag/Hide are local UI interactions only. No backend persistence.

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
- `npm run build` in `client/` → ✅ exit code 0, 0 errors, 446ms
- All new routes added to `App.jsx`
- No backend/API/auth integration accidentally added

## Known Issues & Quirks
- Bundle size warning (>500 kB) — expected for an SPA this size; can be addressed with code-splitting later.

## Exact Next Task
- Phase 3: Backend Foundation — Neon PostgreSQL setup, database migrations, Firebase Auth, and first real API endpoints.
