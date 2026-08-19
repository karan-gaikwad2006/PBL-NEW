# PoshanSetu — Complete Implementation Plan

**Project:** PoshanSetu
**Version:** MVP 1.0
**Platform:** Desktop-first responsive Web Application
**Implementation Scope:** All approved P0, P1, and P2 features
**Development Approach:** Phase-by-phase development with testing after every phase
**User Role:** Karan acts primarily as Project Supervisor; AI coding tools assist with implementation while each major step is reviewed and approved.

---

# 1. Purpose of This Document

This document defines the exact order in which PoshanSetu should be built.

It answers:

* What should be built first
* What depends on what
* Which services must be configured
* When API keys and environment variables are needed
* Which database components should be created
* Which frontend modules should be connected
* Which features belong to each implementation phase
* What must be tested before moving forward
* How all P0, P1, and P2 features will eventually be completed

The project must **not** be built as one giant AI-generated implementation.

Instead, development must follow:

```text
PLAN
↓
SETUP
↓
BUILD ONE PHASE
↓
TEST
↓
FIX
↓
REVIEW
↓
APPROVE
↓
NEXT PHASE
```

No major phase should be considered complete merely because code has been generated.

A phase is complete only when:

```text
Code works
+
Main user flow works
+
Errors are handled
+
Relevant tests pass
+
UI matches Design.md
+
Navigation matches AppFlow.md
```

---

# 2. Source Documents

Before implementing any feature, the coding AI must read:

```text
docs/
├── PRD-PoshanSetu-MVP.md
├── TechDesign-PoshanSetu-MVP.md
├── Design.md
├── AppFlow.md
└── ImplementationPlan.md
```

## Document Responsibilities

### PRD

Defines:

```text
WHAT must be built
```

### TechDesign

Defines:

```text
HOW the system should technically work
```

### Design.md

Defines:

```text
HOW the application should visually look
```

Including:

* Milaap-inspired experience
* Desktop-first design
* Human-designed appearance
* User-friendly information hierarchy
* Approved colours

Primary colours:

```text
#304355
#E8E8E2
```

### AppFlow.md

Defines:

```text
HOW users move through the application
```

Including:

* Navigation
* Authentication redirects
* Role-based dashboards
* Requirement lifecycle
* Support lifecycle
* Confirmation rules
* Status transitions

### ImplementationPlan.md

Defines:

```text
IN WHICH ORDER everything must be built
```

---

# 3. Final Approved Architecture

```text
                    POSHANSETU
                         │
              ┌──────────┴──────────┐
              │                     │
          Firebase Auth         React Frontend
              │                     │
              └──────────┬──────────┘
                         ▼
                  Node.js + Express
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
       Neon PostgreSQL          Cloudinary
       Application Data         File Storage
             │                       │
             │                ┌──────┴──────┐
             │                │             │
             │             PDF/JPG/PNG   Other Files
             │
             └── Document Metadata
```

## Architecture Responsibilities

### React + Vite

Responsible for:

* User interface
* Pages
* Components
* Client-side navigation
* Forms
* Dashboards
* Responsive layouts
* Firebase client authentication integration

### Node.js + Express

Responsible for:

* Business logic
* Protected APIs
* Role authorization
* Requirement processing
* Food matching logic
* Support workflow
* Fraud/duplicate signals
* Admin actions
* Database communication
* Cloudinary upload handling

### Firebase Authentication

Responsible for:

* User authentication
* Login
* Logout
* Account identity
* Authentication tokens

Email/mobile verification is **not required for the current MVP**, but the architecture must not prevent adding verification later.

### Neon PostgreSQL

Responsible for:

* Application users
* Profiles
* Institutions
* Requirements
* Requirement items
* Support offers
* Confirmations
* Notifications
* Food information
* Data sources
* Fraud/review signals
* Admin activity
* Document metadata

### Cloudinary

Responsible for storing:

* PDFs
* JPG files
* PNG files
* Other approved supporting files

Cloudinary secrets must remain server-side and must never be exposed in frontend code. Cloudinary's Node integration is designed for server-side SDK use and recommends keeping API secrets out of exposed application code. ([Cloudinary][2])

---

# 4. Implementation Principles

## Principle 1 — Build Incrementally

Never:

```text
Generate entire project
→ Assume it works
```

Instead:

```text
Build module
→ Run module
→ Test module
→ Fix
→ Review
→ Continue
```

---

## Principle 2 — Build Dependencies First

For example:

```text
Authentication
↓
User profile
↓
Role system
↓
Dashboard
↓
Requirement submission
```

Do not build the dashboard before the role system exists.

Do not build support workflows before requirements exist.

Do not build food matching before requirement data exists.

---

## Principle 3 — Use Real Database Early

Do not create the complete application using fake arrays and then try to replace everything later.

Temporary mock data is acceptable for early UI development, but core modules must be connected to Neon before they are considered complete.

---

## Principle 4 — Keep Frontend and Backend Responsibilities Separate

Frontend:

```text
Displays data
Collects user input
Calls APIs
Manages UI state
```

Backend:

```text
Validates requests
Checks permissions
Applies business rules
Writes data
Calculates protected results
```

Do not trust frontend validation alone.

---

## Principle 5 — Security Before Advanced Features

Before advanced automation:

```text
Authentication
↓
Authorization
↓
Input validation
↓
Protected routes
↓
Rate limiting
↓
File validation
↓
Then advanced features
```

---

# 5. Complete Development Roadmap

```text
PHASE 0  → Development Preparation
PHASE 1  → Project Initialization
PHASE 2  → Design System and UI Foundation
PHASE 3  → Backend Foundation
PHASE 4  → Database Foundation
PHASE 5  → Firebase Authentication
PHASE 6  → User Profiles and Roles
PHASE 7  → Public Discovery Experience
PHASE 8  → Government Nutrition Data Module
PHASE 9  → Requirement Management
PHASE 10 → Institution Module and Documents
PHASE 11 → Requirement Discovery and Search
PHASE 12 → Food Donation Matching
PHASE 13 → Donor Support Workflow
PHASE 14 → Requester and Institution Dashboards
PHASE 15 → Notifications
PHASE 16 → Admin Dashboard
PHASE 17 → Fraud and Duplicate Detection
PHASE 18 → Advanced P1/P2 Features
PHASE 19 → Security Hardening
PHASE 20 → Complete Testing
PHASE 21 → Deployment
PHASE 22 → Final Review and Demonstration Preparation
```

All approved features must eventually be mapped to one of these phases.

---

# PHASE 0 — DEVELOPMENT PREPARATION

## Goal

Prepare everything before writing production code.

## Tasks

### 0.1 Organize Documentation

Create:

```text
PoshanSetu/
└── docs/
    ├── PRD-PoshanSetu-MVP.md
    ├── TechDesign-PoshanSetu-MVP.md
    ├── Design.md
    ├── AppFlow.md
    └── ImplementationPlan.md
```

### 0.2 Create Project Checklist

Track:

```text
[ ] Development environment
[ ] Frontend initialized
[ ] Backend initialized
[ ] Git repository
[ ] Firebase configured
[ ] Neon configured
[ ] Cloudinary configured
[ ] Database created
[ ] Authentication working
[ ] Public flows working
[ ] Requirements working
[ ] Food matching working
[ ] Support workflow working
[ ] Dashboards working
[ ] Admin working
[ ] Security tested
[ ] Production deployed
```

### 0.3 Define Branching Strategy

Recommended simple strategy:

```text
main
│
├── feature/authentication
├── feature/requirements
├── feature/food-matching
├── feature/support-workflow
└── feature/admin
```

For a supervised AI-assisted project, avoid creating dozens of unnecessary branches.

---

## Phase 0 Completion Criteria

```text
[ ] All documentation exists
[ ] Project folder is ready
[ ] Implementation order is understood
[ ] No production coding has started yet
```

---

# PHASE 1 — PROJECT INITIALIZATION

## Goal

Create the actual React frontend and Node.js backend.

## Recommended Structure

```text
PoshanSetu/
│
├── docs/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

Vite is the approved frontend build tool because it provides a modern development server and optimized production build process. ([vitejs][1])

## Tasks

### 1.1 Install Required Tools

Install:

```text
Node.js
npm
Git
VS Code or chosen AI coding IDE
```

### 1.2 Create Git Repository

```text
PoshanSetu
→ Initialize Git
→ First commit
→ Push to GitHub
```

### 1.3 Create React Frontend

Create:

```text
frontend/
```

with:

```text
React
Vite
JavaScript or TypeScript according to TechDesign
```

### 1.4 Create Express Backend

Create:

```text
backend/
```

Initial structure:

```text
backend/
└── src/
    ├── config/
    ├── routes/
    ├── controllers/
    ├── services/
    ├── middleware/
    ├── utils/
    └── server.js
```

### 1.5 Create Health Check

Backend must initially provide:

```text
GET /api/health
```

Expected result:

```json
{
  "success": true,
  "message": "PoshanSetu API is running"
}
```

---

## Phase 1 Testing

Verify:

```text
[ ] Frontend starts
[ ] Frontend opens in browser
[ ] Backend starts
[ ] /api/health works
[ ] Git repository contains initial project
[ ] .env files are ignored
```

---

# PHASE 2 — DESIGN SYSTEM AND UI FOUNDATION

## Goal

Convert the design direction into reusable React components.

Do not immediately build all business logic.

First create the visual foundation.

## Create Design Tokens

Primary:

```text
#304355
```

Light background:

```text
#E8E8E2
```

The implementation must follow `Design.md`.

## Build Reusable Components

```text
components/
├── layout/
│   ├── Navbar
│   ├── Footer
│   ├── Sidebar
│   └── PageContainer
│
├── common/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── TextArea
│   ├── Modal
│   ├── Badge
│   ├── Card
│   ├── EmptyState
│   ├── ErrorState
│   ├── LoadingState
│   └── ConfirmDialog
│
└── domain/
    ├── RequirementCard
    ├── FoodItemCard
    ├── SupportCard
    ├── NotificationCard
    └── StatusBadge
```

## Build Static Versions of Major Screens

Initially:

* Landing page
* Explore page
* Requirements listing
* Requirement details
* Food matching
* Login page
* Dashboard shells
* Admin shell

Use temporary mock data only during this visual stage.

---

## Phase 2 Testing

```text
[ ] Screens match Design.md
[ ] Desktop layout works
[ ] Responsive layout works
[ ] Navigation layout is understandable
[ ] Buttons have visible states
[ ] Loading states exist
[ ] Empty states exist
```

---

# PHASE 3 — BACKEND FOUNDATION

## Goal

Create a maintainable Express backend.

## Required Modules

```text
backend/src/
├── config/
├── routes/
├── controllers/
├── services/
├── middleware/
├── validators/
├── utils/
└── server.js
```

## Middleware

Add:

```text
JSON parsing
CORS configuration
Request logging
Authentication middleware
Role authorization middleware
Validation middleware
Global error handler
Not found handler
```

## API Convention

Use:

```text
/api/v1/
```

Example:

```text
GET /api/v1/requirements
POST /api/v1/requirements
GET /api/v1/requirements/:id
```

## Standard Response Shape

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": []
}
```

Do not expose stack traces to production users.

---

# PHASE 4 — DATABASE FOUNDATION

## Goal

Create Neon PostgreSQL and connect it to the backend.

Neon provides managed/serverless Postgres and supports standard application database workflows. ([Vercel][3])

## Initial Database Groups

### Users

```text
users
```

### Institutions

```text
institutions
institution_members
```

### Requirements

```text
requirements
requirement_items
requirement_status_history
```

### Support

```text
support_offers
support_confirmations
```

### Documents

```text
documents
```

### Notifications

```text
notifications
```

### Fraud / Review

```text
fraud_signals
requirement_review_notes
admin_actions
```

### Nutrition Data

```text
nutrition_data_sources
nutrition_indicators
location_data
food_nutrition_guidance
```

## Important Relationships

```text
User
 ├── creates Requirements
 ├── sends Support Offers
 └── receives Notifications

Institution
 ├── has Members
 ├── creates Requirements
 └── has Documents

Requirement
 ├── has Items
 ├── has Support Offers
 ├── has Status History
 ├── may have Documents
 └── may have Fraud Signals
```

## Database Rules

Every important table should include appropriate fields such as:

```text
id
created_at
updated_at
```

Use foreign keys where appropriate.

Create indexes for commonly searched fields.

Examples:

```text
district
status
expiry_date
urgency
user_id
institution_id
```

---

## Phase 4 Testing

```text
[ ] Neon database created
[ ] Backend connects successfully
[ ] Tables created
[ ] Relationships work
[ ] Invalid foreign keys fail
[ ] Important indexes exist
```

---

# PHASE 5 — FIREBASE AUTHENTICATION

## Goal

Implement secure user identity.

Firebase's web SDK supports modular application integration through npm-based workflows, which fits the React/Vite architecture. ([Firebase][4])

## Authentication Flow

```text
User
→ Login / Sign Up
→ Firebase Authentication
→ Firebase ID Token
→ Frontend sends token
→ Backend verifies token
→ Backend identifies user
```

## MVP Authentication

Implement approved login methods.

Email/mobile verification is not required in the current scope.

However, structure the system so future verification can be added.

## Backend Verification

Never trust only:

```text
user_id from frontend
```

Instead:

```text
Firebase token
→ Backend verification
→ Authenticated Firebase UID
→ Find/Create application user
```

## Required Features

```text
[ ] Sign up
[ ] Login
[ ] Logout
[ ] Persistent session
[ ] Protected frontend routes
[ ] Protected backend APIs
[ ] Token verification
[ ] Authentication error handling
```

---

# PHASE 6 — USER PROFILES AND ROLES

## Goal

Connect Firebase identity to PoshanSetu application roles.

## Roles

```text
donor
requester
institution
admin
```

## User Creation Flow

```text
Firebase Sign Up
→ Firebase UID received
→ Create/find PostgreSQL user
→ Select/setup application role
→ Create role-specific profile
→ Redirect to correct dashboard
```

## Role Protection

Examples:

```text
Donor
→ Cannot access admin APIs

Requester
→ Cannot edit another requester's requirement

Institution
→ Cannot manage another institution

Admin
→ Can access approved oversight tools
```

---

# PHASE 7 — PUBLIC DISCOVERY EXPERIENCE

## Goal

Build the main experience available before login.

## Screens

```text
Landing Page
Explore Maharashtra
Location Search
District Insights
Requirements Listing
Requirement Details
Food Matching Entry
How It Works
```

## Critical Rule

Users must be able to discover information without logging in.

Login occurs only when protected action is attempted.

Example:

```text
View Requirement
→ No login required

Click I Want to Help
→ Login if required
→ Return to same requirement
```

## Preserve Intent

Implement:

```text
redirect_after_login
```

Example:

```text
/requirements/123
→ Login
→ Successful authentication
→ /requirements/123
```

---

# PHASE 8 — GOVERNMENT NUTRITION DATA MODULE

## Goal

Implement the data layer for district/location nutrition information.

## Important Data Rule

Never claim:

```text
Malnutrition indicator
=
Direct proof of a specific micronutrient deficiency
```

Instead display data with correct context.

## Build Components

### Data Source Management

Store:

```text
Source name
Source URL/reference
Reporting period
Last updated date
Last sync date
Geographic level
Indicator name
Value
Unit
```

### Location Insights

Flow:

```text
Location
→ Available Nutrition Indicators
→ Context
→ Data Source
→ Reporting Period
→ Current Local Requirements
```

Government indicators and local requirements must remain separate.

## Initial Data Import

Do not assume every source provides a free real-time API.

The implementation should support:

```text
Official API
OR
Approved downloadable dataset
OR
Admin-managed import/update process
```

The data architecture must support future updates without requiring frontend rewrites.

---

# PHASE 9 — REQUIREMENT MANAGEMENT

## Goal

Build one of the most important PoshanSetu modules.

## Requirement Creation

Requester:

```text
Dashboard
→ Submit Requirement
→ Validate
→ Save
→ Automated checks
→ Status
```

## Required Fields

According to final PRD requirements, include appropriate fields such as:

```text
Requester/institution reference
Location
District
Address/location details
Beneficiary count
Requirement items
Quantity
Urgency
Suggested expiry date
Selected expiry date within allowed rules
Description
Status
```

## Requirement Items

A requirement can contain multiple items.

Example:

```text
Requirement
├── Rice — 100 kg
├── Moong Dal — 50 kg
└── Ragi — 25 kg
```

## Expiry

Every requirement must have an expiry date.

The system:

```text
Urgency selected
→ Suggest expiry date
→ User reviews/selects eligible date
```

Maximum allowed validity extends beyond one month according to the approved requirement policy.

## Requirement Statuses

```text
UNDER_REVIEW
ACTIVE
PARTIALLY_SUPPORTED
FULFILLED
EXPIRED
REQUIRES_ATTENTION
HIDDEN
```

## Requirement History

Every major status change should be traceable.

---

# PHASE 10 — INSTITUTION MODULE AND DOCUMENTS

## Goal

Allow institutions to manage profiles and submit requirements.

## Institution Profile

Include:

```text
Institution name
Institution type
Location
District
Description
Authorized member information
Supporting documents
Profile status
```

## Document Upload Flow

```text
Frontend
→ File selected
→ Frontend validation
→ Backend upload endpoint
→ Server-side validation
→ Cloudinary upload
→ Metadata stored in Neon
→ Return approved document reference
```

Cloudinary supports Node.js SDK-based server integration and should be configured with server-side environment variables rather than exposing secrets to the client. ([Cloudinary][2])

## File Validation

Validate:

```text
Allowed type
File size
Actual file characteristics where practical
Authorization
Associated institution/requirement
```

Do not allow unrestricted file uploads.

---

# PHASE 11 — REQUIREMENT DISCOVERY AND SEARCH

## Goal

Help users answer:

> Where can I help?

## Features

Search/filter by:

```text
District
Location
Food item
Urgency
Requester type
Status where appropriate
```

## Query Flow

```text
Search Input
→ Backend validation
→ Database query
→ Pagination
→ Results
```

Do not fetch thousands of records to the browser and filter everything client-side.

## Results

Each card should allow:

```text
View Requirement
→ Requirement Details
```

---

# PHASE 12 — FOOD DONATION MATCHING

## Goal

Answer:

> I have this food. Where can I donate it?

## Input

```text
Food item
Optional quantity
Optional location
```

## Matching Process

```text
User selects food
→ Normalize item name/category
→ Find active requirements
→ Filter by item relevance
→ Consider location
→ Consider remaining quantity
→ Consider urgency
→ Return useful matches
```

## Initial Matching

Start with transparent rules.

Do not unnecessarily add AI.

Example:

```text
Exact item match
↓
Category match
↓
Location relevance
↓
Urgency
↓
Remaining quantity
```

The result should explain the match at a useful high level.

Example:

```text
"This requirement currently needs Moong Dal."
```

Not:

```text
"AI guarantees this is the best donation."
```

---

# PHASE 13 — DONOR SUPPORT WORKFLOW

## Goal

Allow donors to offer support without PoshanSetu processing payments.

## Flow

```text
Requirement Details
→ I Want to Help
→ Login if required
→ Return to requirement
→ Support Offer
→ Submit
→ Requester notified
```

## Support Offer

Store:

```text
Donor
Requirement
Item
Quantity
Message
Status
Created date
```

## Support Lifecycle

```text
OFFER_SENT
→ COORDINATION / ACTIVE
→ PENDING_CONFIRMATION
→ COMPLETED
```

## Critical Rule — Dual Confirmation

```text
Donor confirms completion
+
Requester confirms receipt
=
Completed
```

One confirmation alone is insufficient.

## Quantity Updates

After completed support:

```text
Completed support quantity
→ Reduce remaining quantity
```

Then:

```text
Remaining > 0
→ PARTIALLY_SUPPORTED

Remaining = 0
→ FULFILLED
```

Preserve historical records.

---

# PHASE 14 — ROLE-BASED DASHBOARDS

## Donor Dashboard

Build:

```text
Overview
Active Supports
Pending Confirmations
Completed Supports
Support History
Notifications
```

## Requester Dashboard

Build:

```text
Overview
My Requirements
Submit Requirement
Support Offers
Pending Confirmations
Requirement History
Notifications
```

## Institution Dashboard

Build:

```text
Overview
Institution Profile
Documents
Active Requirements
Submit Requirement
Support Offers
Pending Confirmations
History
Notifications
```

## Admin Dashboard

Initially create the shell.

Advanced functionality is completed in Phase 16.

---

# PHASE 15 — NOTIFICATIONS

## MVP

Use in-app notifications.

No email/mobile notification requirement for current scope.

## Notification Events

Examples:

```text
New support offer
Requirement status changed
Support confirmation required
Support completed
Requirement expiring soon
Requirement expired
Review requires attention
Admin-related review event
```

## Notification Data

```text
User ID
Type
Title
Message
Related entity type
Related entity ID
Read status
Created date
```

## Navigation Rule

Every notification should lead to the relevant entity.

Example:

```text
New support offer
→ Exact Support Offer Details
```

Not:

```text
New support offer
→ Generic dashboard
```

---

# PHASE 16 — ADMIN DASHBOARD

## Goal

Build oversight and moderation tools.

## Modules

```text
Platform Overview
Flagged Requirements
Requirements
Institutions
Users
Verification Signals
Review Notes
Admin Actions
```

## Admin Requirement Review

Display:

```text
Requirement information
Relevant automated signals
Supporting documents where permitted
Activity history
Internal notes
```

## Actions

```text
Mark reviewed
Keep active
Hide temporarily
Remove clearly inappropriate/suspicious content
Add internal note
```

Automated flags must never automatically be treated as proof of fraud.

---

# PHASE 17 — FRAUD AND DUPLICATE DETECTION

## Goal

Generate review signals.

Do not claim guaranteed fraud detection.

## Signals May Include

### Duplicate Content

```text
Similar requirement
Same/similar location
Same/similar requested items
Similar quantities
Short time period
```

### Multiple Accounts

Look for possible patterns involving:

```text
Multiple accounts
→ Same institution

Multiple accounts
→ Same or nearby location

Multiple accounts
→ Highly similar requirements

Multiple accounts
→ Repeated overlapping submissions
```

These are signals for review.

They are not proof.

## Fraud Signal Output

Example:

```text
Signal Type:
POSSIBLE_DUPLICATE

Severity:
MEDIUM

Reason:
Similar active requirement found for nearby location.
```

Admin then reviews.

## Do Not Expose

Do not expose exact fraud scoring formulas publicly.

---

# PHASE 18 — ALL REMAINING P1 AND P2 FEATURES

## Goal

Ensure no approved feature is forgotten.

Create a feature matrix from the PRD.

Example:

| Feature            | Priority    | Phase | Status       |
| ------------------ | ----------- | ----- | ------------ |
| Authentication     | P0          | 5     | Pending/Done |
| Requirements       | P0          | 9     | Pending/Done |
| Food matching      | P0/P1       | 12    | Pending/Done |
| Support workflow   | P0          | 13    | Pending/Done |
| Notifications      | P1          | 15    | Pending/Done |
| Fraud signals      | P1/P2       | 17    | Pending/Done |
| Advanced analytics | P2          | 18    | Pending/Done |
| Future AI features | P2/Optional | 18    | Pending/Done |

Before this phase is closed:

```text
Read PRD from beginning to end
→ List every feature
→ Mark implementation location
→ Verify implemented
```

The rule is:

```text
No approved P0, P1, or P2 feature is silently dropped.
```

---

# PHASE 19 — SECURITY HARDENING

## Authentication Security

```text
[ ] Verify Firebase tokens server-side
[ ] Never trust role sent directly by frontend
[ ] Check permissions on every protected API
[ ] Restrict admin routes
```

## API Security

```text
[ ] Input validation
[ ] Rate limiting
[ ] CORS restrictions
[ ] Security headers
[ ] Safe error responses
```

## Database Security

```text
[ ] Parameterized queries / safe ORM queries
[ ] Foreign keys
[ ] Authorization checks before sensitive reads/writes
[ ] No database credentials in frontend
```

## File Security

```text
[ ] File type restrictions
[ ] File size restrictions
[ ] Server-side upload controls
[ ] Sensitive documents not automatically public
```

## Environment Variables

Examples:

```text
Frontend:
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID

Backend:
DATABASE_URL
FIREBASE_PROJECT_ID
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

The exact names may be adjusted during implementation.

Never commit:

```text
.env
.env.local
service account secrets
database credentials
Cloudinary API secrets
```

---

# PHASE 20 — COMPLETE TESTING

## 20.1 Unit Testing

Test critical business logic.

Examples:

```text
Expiry calculation
Requirement status transitions
Quantity calculations
Food matching rules
Dual confirmation
Duplicate signal rules
```

---

## 20.2 API Testing

Test:

```text
Authentication required
Role restrictions
Invalid data
Valid data
Unauthorized access
Not found
Server error handling
```

---

## 20.3 User Journey Testing

### Journey 1 — Public Discovery

```text
Landing
→ Explore
→ Location
→ Insights
→ Requirement
```

### Journey 2 — Food Donation

```text
Landing
→ I Have Food
→ Enter Dal
→ Find Match
→ Requirement
→ Offer Support
```

### Journey 3 — Requester

```text
Login
→ Dashboard
→ Submit Requirement
→ Track Status
→ Receive Support
→ Confirm Receipt
```

### Journey 4 — Donor

```text
Find Requirement
→ Offer Support
→ Confirm Completion
→ Wait for Requester
→ Completed
```

### Journey 5 — Institution

```text
Login
→ Profile
→ Upload Document
→ Submit Requirement
→ Manage Support
```

### Journey 6 — Admin

```text
Login
→ Flagged Requirement
→ Review Signals
→ Take Action
```

---

# PHASE 21 — DEPLOYMENT

## Recommended Deployment Sequence

```text
GitHub Repository
        ↓
Frontend Deployment
        ↓
Backend Deployment
        ↓
Environment Variables
        ↓
Production Database Connection
        ↓
Production Testing
```

Vite supports Git-based deployment workflows, including Vercel deployment where Vite projects can be detected and configured automatically. ([vitejs][5])

## Before Deployment

Verify:

```text
[ ] Production environment variables added
[ ] Development secrets not exposed
[ ] Production API URL configured
[ ] CORS configured for production
[ ] Database production connection tested
[ ] Firebase authorized domains configured as needed
[ ] Cloudinary works
[ ] File uploads work
```

## After Deployment

Run every critical user journey again.

Never assume:

```text
Works locally
=
Works in production
```

---

# PHASE 22 — FINAL REVIEW AND DEMONSTRATION PREPARATION

## Final Feature Audit

Create:

```text
P0 Features
[ ] All completed

P1 Features
[ ] All completed

P2 Features
[ ] All completed
```

Compare directly with the PRD.

## UI Audit

Check:

```text
[ ] Milaap-inspired clarity
[ ] Does not look like generic AI UI
[ ] #304355 used correctly
[ ] #E8E8E2 used correctly
[ ] Desktop-first layouts
[ ] Responsive layouts
[ ] Clear calls to action
[ ] Consistent cards/buttons/forms
```

## App Flow Audit

Compare every major screen against `AppFlow.md`.

Check:

```text
[ ] Every important button has correct navigation
[ ] Login preserves original user intent
[ ] No dead ends
[ ] Back navigation works
[ ] Notifications open relevant screens
[ ] Role restrictions work
```

## Demonstration Preparation

Prepare demonstration journeys.

### Demo 1

```text
Explore Maharashtra
→ Select district
→ View nutrition context
→ View current requirements
```

### Demo 2

```text
I have Dal
→ Find relevant requirement
→ Offer support
```

### Demo 3

```text
Submit requirement
→ Automated review state
→ Active requirement
```

### Demo 4

```text
Partial support
→ Remaining quantity updates
```

### Demo 5

```text
Donor confirmation
+
Requester confirmation
=
Completed support
```

### Demo 6

```text
Potential duplicate signal
→ Admin review
```

---

# 6. Recommended Exact Build Order

The actual coding order should be:

```text
1. Project initialization
2. Git repository
3. Frontend foundation
4. Backend foundation
5. Database connection
6. Design system
7. Static core screens
8. Firebase authentication
9. User profiles
10. Role authorization
11. Public navigation
12. Requirements database
13. Requirement submission
14. Requirement status/history
15. Requirement listing
16. Requirement details
17. Search/filtering
18. Food matching
19. Donor support offers
20. Dual confirmation
21. Quantity updates
22. Requester dashboard
23. Donor dashboard
24. Institution dashboard
25. Cloudinary documents
26. Notifications
27. Nutrition data module
28. Admin dashboard
29. Fraud signals
30. Remaining P1 features
31. Remaining P2 features
32. Security hardening
33. Full testing
34. Deployment
35. Final PRD audit
```

---

# 7. API Keys and Account Creation Schedule

Do not create every account on Day 1 unless needed.

## Immediately

```text
GitHub
Node.js environment
Firebase
```

## When Database Phase Begins

```text
Neon
DATABASE_URL
```

## When Authentication Begins

```text
Firebase Web App configuration
Firebase project credentials/configuration
```

Firebase provides a web configuration object for initializing web apps; it should be handled according to Firebase's application setup guidance. ([Firebase][4])

## When Documents Begin

```text
Cloudinary
Cloud Name
API Key
API Secret
```

Cloudinary documents its use of environment-based configuration for Node.js integrations and explicitly cautions against exposing secrets. ([Cloudinary][2])

## When Deployment Begins

Create/configure the selected hosting service.

---

# 8. Supervisor Workflow

Karan's role is primarily:

```text
1. Receive next implementation task
2. Open the required website/tool
3. Follow exact setup instructions
4. Run provided commands one at a time
5. Let coding AI implement the approved phase
6. Test the result
7. Share errors/screenshots if something fails
8. Review against project documents
9. Approve or request corrections
10. Move to next phase
```

The supervisor should not be expected to independently determine:

```text
Which API to use
Which database table to create
Which package to install
How to structure routes
How to connect services
```

Those decisions must follow the approved project documents and implementation guidance.

---

# 9. AI Coding Agent Rules

The AI coding agent must:

```text
[ ] Read all docs before implementation
[ ] Never ignore P0/P1/P2 requirements
[ ] Build incrementally
[ ] Explain major changes
[ ] Test before declaring success
[ ] Avoid replacing working code unnecessarily
[ ] Keep secrets out of source code
[ ] Follow Design.md
[ ] Follow AppFlow.md
[ ] Follow TechDesign architecture
```

The AI must not:

```text
[ ] Invent new major product features
[ ] Remove approved features
[ ] Replace architecture without explanation
[ ] Expose API secrets
[ ] Mark code complete without testing
[ ] Build actual payment processing
[ ] Treat automated fraud signals as proof
[ ] Claim nutrition indicators diagnose individuals
```

---

# 10. Phase Approval Format

After every major phase, review using:

```text
PHASE:
Completed:

FEATURES IMPLEMENTED:
-

TESTS COMPLETED:
-

RESULT:
PASS / NEEDS FIXING

ISSUES:
-

NEXT PHASE:
-
```

Only after:

```text
RESULT: PASS
```

should the next major phase begin.

---

# 11. Final Project Completion Checklist

## Foundation

```text
[ ] React application
[ ] Node.js + Express API
[ ] Neon PostgreSQL
[ ] Firebase Authentication
[ ] Cloudinary
[ ] GitHub repository
```

## Public Experience

```text
[ ] Landing page
[ ] Location exploration
[ ] District insights
[ ] Requirements listing
[ ] Requirement details
[ ] Food donation matching
```

## Requesters

```text
[ ] Submit requirements
[ ] Multiple requirement items
[ ] Urgency
[ ] Expiry
[ ] Status tracking
[ ] Support tracking
[ ] Requirement history
```

## Donors

```text
[ ] Find requirements
[ ] Food matching
[ ] Send support offers
[ ] Track supports
[ ] Confirm completion
[ ] View history
```

## Institutions

```text
[ ] Institution profile
[ ] Requirement submission
[ ] Supporting documents
[ ] Support management
```

## Platform Logic

```text
[ ] Partial support
[ ] Remaining quantity calculation
[ ] Dual confirmation
[ ] Fulfilled status
[ ] Expired status
[ ] Notifications
```

## Safety

```text
[ ] Role authorization
[ ] Protected APIs
[ ] Input validation
[ ] File validation
[ ] Duplicate signals
[ ] Multiple-account pattern signals
[ ] Admin review
```

## Data

```text
[ ] Government/reliable nutrition data
[ ] Source attribution
[ ] Reporting periods
[ ] Data freshness context
[ ] Local requirements separated from official indicators
```

## Final Quality

```text
[ ] P0 complete
[ ] P1 complete
[ ] P2 complete
[ ] All critical user journeys tested
[ ] Desktop tested
[ ] Mobile responsiveness tested
[ ] Production tested
[ ] Final PRD audit complete
```

---

# 12. Final Development Rule

PoshanSetu must be developed as a connected system.

The complete journey is:

```text
DOCUMENTS
↓
SETUP
↓
FOUNDATION
↓
AUTHENTICATION
↓
DATABASE
↓
PUBLIC DISCOVERY
↓
REQUIREMENTS
↓
FOOD MATCHING
↓
SUPPORT
↓
DASHBOARDS
↓
ADMINISTRATION
↓
SECURITY
↓
TESTING
↓
DEPLOYMENT
↓
FINAL AUDIT
```

At no point should an approved P0, P1, or P2 feature be forgotten simply because it belongs to a later phase.

Before declaring PoshanSetu complete, the implementation must be compared **feature-by-feature against the PRD**.

---

## Handoff Context

```text
Stage: implementation-planning
App name: PoshanSetu
Platform: Desktop-first responsive web application
User role: Supervisor / guided implementation
Budget: Free-tier-first
Scope: All approved P0, P1, and P2 features
Frontend: React + Vite
Backend: Node.js + Express
Authentication: Firebase Authentication
Database: Neon PostgreSQL
File storage: Cloudinary
UI inspiration: Milaap-inspired, human-looking, user-friendly
Primary colours: #304355 and #E8E8E2
Implementation approach: Phase-by-phase, test and approve each major phase
Source documents:
- PRD-PoshanSetu-MVP.md
- TechDesign-PoshanSetu-MVP.md
- Design.md
- AppFlow.md
- ImplementationPlan.md
```

---

### What you should do after saving this

Create this file:

```text
docs/ImplementationPlan.md
```

Then your planning/documentation stage is essentially complete, and **we should start Phase 0/Phase 1 together**.

My recommendation is: **do not ask the IDE to build PoshanSetu yet**. First, I'll guide you through the actual environment setup—starting with checking what you already have installed, then creating the project folders, GitHub repository, React frontend, and Express backend.

[1]: https://vite.dev/guide/?utm_source=chatgpt.com "Getting Started | Vite"
[2]: https://cloudinary.com/documentation/node_quickstart?utm_source=chatgpt.com "Cloudinary Node.js SDK Quick Start | Documentation"
[3]: https://vercel.com/marketplace/neon?utm_source=chatgpt.com "Neon for Vercel"
[4]: https://firebase.google.com/docs/web/learn-more?utm_source=chatgpt.com "Understand Firebase for web  |  Firebase for web platforms"
[5]: https://vite.dev/guide/static-deploy?utm_source=chatgpt.com "Deploying a Static Site | Vite"
