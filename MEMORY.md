# System Memory & Context

Update this file after each major milestone, structural change, or resolved bug.

## Active Phase & Goal
**Current Phase:** Phase 2D Food Donation Matching UI — COMPLETE
**Next Phase:** Phase 2E — Requirement Submission Wizard (7-step form) & Donor Support Response Workflow
**Current Task:** Awaiting approval for Phase 2E
**Next Steps:**
1. Implement 7-step requirement submission wizard desktop UI screens (`e96929bc` through `86238302`).
2. Implement Send Support Offer modal/screen (`543031207a994931bf6c88de4437b0d7`) & Support Confirmation screens (`c2d7efd54cd94237b4640087c66660ab`).

## Architectural Decisions
- 2026-08-19 - Desktop-first scope: Build ONLY desktop web screens for Phase 2. Ignore mobile screens until a separate phase.
- 2026-08-19 - Google Stitch desktop screens are the PRIMARY visual source of truth.
- 2026-08-19 - React + Vite frontend with Tailwind CSS v4 (`@tailwindcss/postcss`) and React Router v7.
- 2026-08-19 - Keep official government nutrition indicators (NFHS-5) strictly separate from user-submitted local food requirements.
- 2026-08-19 - Do not imply that government malnutrition indicators prove a specific micronutrient deficiency.
- 2026-08-19 - "I Want to Help" CTA preserves user intent and routes smoothly according to `AppFlow.md`.

## Current Workspace State

### client/ (React Frontend)
- Vite 8 + React 19 + Tailwind CSS v4
- Routes implemented:
  - `/` → `LandingPage.jsx` (Official Homepage from Stitch `cd970b0cb91a47ccb4199c7b427978fb`)
  - `/explore` → `ExploreMap.jsx` (Map Discovery from Stitch `5066d2851eee46b0b89d1965aed6f33e`)
  - `/districts/:districtId` → `DistrictInsights.jsx` (Nashik Insights from Stitch `b7b9d5e4df4346ceb1ec10d7ff2bb337`)
  - `/requirements` → `RequirementsCatalog.jsx` (Catalog & Response Selection from Stitch `090f78df99a2419a8069268dac397bf5`)
  - `/requirements/:id` → `RequirementDetails.jsx` (Details view from Stitch `e8a2075d4c10454182ea6d08e4f13cbd`)
  - `/submit-requirement` → `RequirementSubmit.jsx`
  - `/dashboard` → `Dashboard.jsx`
  - `/auth` / `/login` → `AuthPage.jsx`

### server/ (Express Backend)
- Express v5, CommonJS
- Health endpoint: `GET /api/health` → `{ status: 'OK' }`

## Completed Phases
- [x] Phase 1 Foundation
- [x] Phase 2A Design System & Shared UI Foundation
- [x] Official Homepage Stitch 1:1 Reproduction
- [x] Phase 2B Public Discovery UI (`/explore`, `/districts/:districtId`, `/requirements`)
- [x] Phase 2C Requirements Discovery UI (`/requirements` filterable catalog + `/requirements/:id` details view)

## Verification Performed
- Interactive filter tests (district, category, urgency, search text, reset filters) against local mock data.
- Catalog → Details navigation (`/requirements` → `/requirements/req-1`).
- Details → "I Want to Help" intent preservation.
- Production build `npm run build` in `client` succeeded in 383ms with 0 errors.

## Known Issues & Quirks
- None.

## Exact Next Task
- Phase 2D: Requirement Submission Wizard (7-step form) & Support Response Workflow screens.
