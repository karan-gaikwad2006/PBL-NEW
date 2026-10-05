# 🥗 PoshanSetu

> **Connecting nutrition needs with informed community support.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Firebase](https://img.shields.io/badge/Firebase_Auth-12.17-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## 📌 Overview

**PoshanSetu** (*पोषणसेतु* — Bridge of Nutrition) is a Maharashtra-focused web platform engineered to bridge the critical gap between grassroots food requirements and community goodwill. Rather than facilitating generic food drives, PoshanSetu contextualizes local food requests with official district-level nutrition indicators, empowering donors, community organizers, and institutions to direct resources where they are needed most.

The platform answers three fundamental questions:
- **WHERE** help is needed — interactive geographic visualization across Maharashtra's 36 districts and talukas.
- **WHY** attention may be useful — transparent district nutrition factsheets derived from official sources (NFHS-5).
- **HOW** support can be aligned — specific food categories and quantity requirements submitted by verified community requesters and institutions.

> [!IMPORTANT]
> **Financial & Medical Boundary Disclaimer:**
> - PoshanSetu does **not** process monetary donations or financial transactions. It coordinates physical food requirements and support offers.
> - Government nutrition indicators represent **population-level statistical context** from official surveys (e.g., NFHS-5) and **do not constitute individual clinical diagnoses or medical advice**.
> - Official nutrition indicators and user-submitted local requirements are maintained as strictly independent data layers.

---

## 🎯 Problem Statement

Despite abundant agricultural output and widespread philanthropic willingness, food assistance in urban and rural areas frequently encounters systemic inefficiencies:

1. **Information Asymmetry:** Grassroots care centers, shelter homes, and rural communities struggle to broadcast immediate, granular food shortages to willing donors.
2. **Nutritional Misalignment:** Donors frequently provide standard staples or packaged processed foods that do not address the acute dietary or micronutrient gaps of vulnerable groups (e.g., protein deficits in growing children or anemia among young women).
3. **Lack of Geographic Context:** Well-known metropolitan centers often receive surplus donations, while under-served districts face severe resource scarcity without public visibility.
4. **Coordination Deficits:** Without structured tracking, multiple donors may unknowingly fulfill the same request, leading to food spoilage, while critical requests elsewhere expire unaddressed.

---

## 💡 Solution

PoshanSetu introduces an evidence-informed coordination framework connecting official nutrition data with real-time, ground-level food requests:

```text
  Official Health Data (NFHS-5)
               │
               ▼
   District Nutrition Insights ────────┐
   (Population-level indicators)       │
                                       ▼
  Local Food Requirements ────► Transparent Food-to-Need ────► Structured Support
  (Specific items & quantities)      Context Matching             Offers & Dual Confirmation
```

1. **Official Data Integration:** Ingests official district health factsheets (NFHS-5) covering stunting, wasting, underweight, and anemia metrics.
2. **Standardized Requirement Catalog:** Organizers submit itemized food requests categorized by food group, urgency, beneficiary demographic, and quantity.
3. **Contextual Food Matching:** Recommends nutrient-dense local food items (pulses, millets, dairy, leafy vegetables) tailored to local needs.
4. **Dual-Confirmation Fulfillment:** Both donor and requester must confirm delivery and receipt before a requirement is marked fulfilled.

---

## ✨ Key Features

Status Legend:
- `✅ Implemented` — Fully developed and operational in the active codebase.
- `🚧 In Progress` — Implemented in UI / schema with backend service wiring underway.
- `⬜ Planned` — Documented in architectural roadmap for upcoming iterations.

### 🌐 Public Discovery
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Interactive Maharashtra Map** | ✅ Implemented | Leaflet-powered district exploration across all 36 districts. |
| **District Nutrition Factsheets** | ✅ Implemented | Live district insights detailing NFHS-5 nutrition indicators with source and reporting period metadata. |
| **Requirements Catalog** | ✅ Implemented | Filterable public feed of active, non-expired food requirements by district and urgency. |
| **Requirement Detail View** | ✅ Implemented | Itemized breakdown of required foods, quantities remaining, beneficiary counts, and delivery location. |
| **Food-to-Need Matching Guide** | ✅ Implemented | Educational guidance mapping nutritional attributes of food categories to dietary support goals. |

### 📝 Requirements Workflow
| Feature | Status | Description |
| :--- | :---: | :--- |
| **7-Step Submission Wizard** | ✅ Implemented | Comprehensive submission flow covering categories, item quantities, beneficiary breakdowns, address, and review. |
| **Route-Level Auth Guard** | ✅ Implemented | Guest submissions are intercepted and prompted to log in while preserving the submission draft target. |
| **Database Persistence** | ✅ Implemented | Authenticated POST creates requirements and associated items atomically in PostgreSQL under `under_review` status. |
| **Requirement Status Timeline** | ✅ Implemented | Visual lifecycle progression (`under_review` → `active` → `partially_supported` → `fulfilled` / `expired`). |
| **Urgency & Expiry Calculation** | ✅ Implemented | Dynamic deadline tracking with urgency levels (`critical`, `high`, `medium`, `low`). |

### 🤝 Support Coordination
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Send Support Offer Flow** | ✅ Implemented | UI for donors to specify offered items, quantities, and coordination notes. |
| **Dual Confirmation Workflow** | ✅ Implemented | UI flows for both donor and requester to independently confirm delivery completion. |
| **Donor Dashboard** | ✅ Implemented | Overview tracking active offers, pending handovers, and completed community support history. |
| **Requester Dashboard** | ✅ Implemented | Manage posted requirements, monitor incoming support offers, and review item fulfillment progress. |
| **Support Offer Persistence API** | 🚧 In Progress | Database schema ready (`support_offers`, `support_confirmations`); backend API endpoints in progress. |

### 🔐 Authentication & Roles
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Firebase Client Auth** | ✅ Implemented | Secure email/password login, registration, password recovery, and session persistence. |
| **Server-Side Token Verification** | ✅ Implemented | Express middleware verifying Firebase Bearer tokens via Firebase Admin SDK. |
| **PostgreSQL User Sync** | ✅ Implemented | Automatic user identity mapping from Firebase UID to PostgreSQL `users` table upon registration. |
| **Role-Based Access Control (RBAC)** | ✅ Implemented | Strict permission gating on routes and APIs for `donor`, `requester`, `institution`, and `admin`. |
| **Role-Aware Redirection** | ✅ Implemented | Deterministic routing directing users to their appropriate role dashboard upon sign-in. |

### 🏢 Institution Verification
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Institution Profile Management** | ✅ Implemented | Profile page for institutional details, registration numbers, and operational scope. |
| **Institution API** | ✅ Implemented | `GET`, `POST`, and `PATCH /api/v1/institutions/me` with strict role and field validation. |
| **Document Upload UI** | ✅ Implemented | Drag-and-drop document upload interface for verification credentials. |
| **Cloudinary Document Storage** | 🚧 In Progress | Cloudinary SDK installed; automated upload handler and secure cloud storage pipeline in progress. |

### 🛡️ Administration & Moderation
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Admin Dashboard UI** | ✅ Implemented | Metrics overview, flagged requirement queues, and review management console. |
| **Review & Moderation Workflow** | ✅ Implemented | UI interface to approve, flag, or hide requirements and review institutions. |
| **Fraud Signal Tracking Schema** | ✅ Implemented | PostgreSQL tables for `fraud_signals`, `admin_reviews`, and `audit_logs`. |
| **Automated Heuristic Anomaly Detection** | ⬜ Planned | Pattern analysis flags for rapid repetitive requests or conflicting beneficiary claims. |

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (React 19 + Vite)"]
        UI["Tailwind CSS UI / Pages"]
        LeafletMap["Leaflet Map Engine"]
        ClientAuth["Firebase Client Auth SDK"]
        APIClient["API Client Services (/services/api.js)"]
    end

    subgraph AuthLayer ["Authentication & Identity"]
        FirebaseAuth["Firebase Authentication Service"]
    end

    subgraph ServerLayer ["Server Layer (Node.js + Express 5)"]
        Router["Express Router (/api/v1)"]
        AuthMiddleware["Auth Middleware (verifyFirebaseToken + requireRole)"]
        Controllers["Controllers (Users, Institutions, Districts, Requirements)"]
        Services["Domain Services & Business Logic"]
        Repositories["Data Repositories (pg Pool)"]
    end

    subgraph DataLayer ["Database & External Data"]
        NeonDB[("Neon PostgreSQL Database")]
        NFHSData["NFHS-5 Maharashtra Factsheets (XLSX)"]
        Cloudinary["Cloudinary Storage (Planned)"]
    end

    UI --> APIClient
    ClientAuth <--> FirebaseAuth
    APIClient -- "REST / JSON + Bearer Token" --> Router
    Router --> AuthMiddleware
    AuthMiddleware -- "Verify Token" --> FirebaseAuth
    AuthMiddleware --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> NeonDB
    NFHSData -. "npm run import:nfhs5" .-> NeonDB
    Controllers -. "Future Uploads" .-> Cloudinary
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :---: | :--- |
| **Frontend Framework** | React | `19.2.8` | Component-based reactive user interface |
| **Build Tool** | Vite | `8.2.0` | High-performance bundling and local dev server |
| **Routing** | React Router | `7.18.2` | Client-side routing with nested routes and navigation guards |
| **Styling** | Tailwind CSS | `4.3.3` | Utility-first responsive styling and design system |
| **Mapping Engine** | Leaflet + React-Leaflet | `1.9.4` / `5.0.0` | Maharashtra geographic district exploration |
| **Icons** | Lucide React | `1.32.0` | Consistent UI iconography |
| **Backend Framework** | Node.js + Express | `5.2.1` | RESTful API server and request orchestration |
| **Database Engine** | PostgreSQL (Neon Serverless) | `8.23.0` (`pg`) | Relational application database with pooling and SSL |
| **Authentication** | Firebase Auth + Firebase Admin | `12.17` / `14.2` | Identity management, client auth, and server token verification |
| **Data Processing** | SheetJS (`xlsx`) | `0.18.5` | Excel parser for government NFHS-5 factsheet ingestion |
| **Document Storage** | Cloudinary SDK | `2.10.0` | Document and verification media pipeline *(in progress)* |
| **Linter** | Oxlint | `1.75.0` | High-speed JavaScript/JSX code quality linting |

---

## 📂 Project Structure

```text
PBL NEW/
├── client/                               # Frontend Application
│   ├── public/
│   │   ├── data/                         # GeoJSON & NFHS-5 Factsheet source spreadsheets
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                     # ProtectedRoute and authentication guards
│   │   │   ├── domain/                   # Domain components (wizard steps, cards, status)
│   │   │   ├── layout/                   # Navbar, Footer, and responsive wrappers
│   │   │   └── ui/                       # Shared design system components
│   │   ├── config/                       # Firebase client SDK initialization
│   │   ├── context/                      # AuthContext and global state providers
│   │   ├── hooks/                        # useAuth and custom utility hooks
│   │   ├── pages/
│   │   │   ├── admin/                    # AdminDashboard, AdminReview
│   │   │   ├── auth/                     # Login, Register, ForgotPassword, LoginRequired
│   │   │   ├── dashboard/                # Donor, Requester, Institution dashboards
│   │   │   └── public/                   # Landing, Explore, Districts, Requirements, Matching
│   │   ├── services/                     # api.js fetch client for backend endpoints
│   │   ├── App.jsx                       # Master route configuration
│   │   └── main.jsx                      # Application entry point
│   ├── .env.example                      # Client environment template
│   ├── package.json
│   └── vite.config.js
│
├── server/                               # Backend Application
│   ├── src/
│   │   ├── config/                       # Database pool and environment variable validation
│   │   ├── controllers/                  # District, Institution, Requirement, User controllers
│   │   ├── db/
│   │   │   ├── migrations/               # SQL schema definitions & reference seeds
│   │   │   ├── importNfhs5.js            # Automated NFHS-5 data ingestion script
│   │   │   └── runMigrations.js          # Migration runner with migration tracking
│   │   ├── middleware/                   # Firebase auth verification, RBAC, CORS, error handling
│   │   ├── repositories/                 # District and Requirement SQL query abstractions
│   │   ├── routes/
│   │   │   ├── health.js                 # Server health and DB connectivity check
│   │   │   └── v1/                       # Version 1 API route definitions
│   │   ├── services/                     # Requirement and domain service layers
│   │   ├── utils/                        # Standardized JSON response formatters
│   │   ├── app.js                        # Express application instance setup
│   │   └── index.js                      # HTTP server startup & graceful shutdown
│   ├── .env.example                      # Server environment template
│   └── package.json
│
├── docs/                                 # Project specifications and architecture docs
│   ├── AppFlow.md
│   ├── ImplementationPlan.md
│   ├── PRD-PoshanSetu-MVP.md
│   └── TechDesign-PoshanSetu-MVP.md
├── AGENTS.md                             # AI assistant guidelines and operational constraints
├── MEMORY.md                             # System history, active phases, and decisions
├── package.json                          # Root workspace runner scripts
└── README.md
```

---

## 🔑 User Roles & Access Matrix

PoshanSetu enforces strict Role-Based Access Control (RBAC) across both the UI routing layer and backend API endpoints:

| Role | Badge | Permissions & Purpose | Default Dashboard |
| :--- | :---: | :--- | :--- |
| **Donor** | 👤 | Discovers local food needs, reviews district nutrition insights, submits support offers, and tracks handover progress. | `/donor/dashboard` |
| **Requester** | 📝 | Submits granular food requirements for community groups, manages requirement status, and reviews donor offers. | `/requester/dashboard` |
| **Institution** | 🏢 | Represents registered NGOs, care homes, or shelters; submits institutional needs, maintains profile data, and uploads verification documents. | `/institution-profile` |
| **Admin** | 🛡️ | Moderates submitted requirements, reviews institution verification status, inspects fraud signals, and oversees platform health. | `/admin/dashboard` |

---

## 🔌 API Overview

All backend endpoints are prefixed with `/api` and return standardized JSON responses:
- **Success:** `{ "success": true, "message": "...", "data": { ... } }`
- **Error:** `{ "success": false, "message": "..." }`

### System & Health Endpoints
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | Public | System health check (reports API status, database pool state, and timestamp). |
| `GET` | `/api/v1` | Public | V1 root proof-of-life status. |
| `GET` | `/api/v1/status` | Public | Routing operational status verification. |

### Users & Identity
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/users/sync` | Bearer Token | Synchronizes authenticated Firebase user into PostgreSQL `users` table with assigned role. |
| `GET` | `/api/v1/users/me` | Bearer Token | Retrieves authenticated user profile record from PostgreSQL. |
| `PATCH` | `/api/v1/users/me` | Bearer Token | Updates allowable profile attributes (`full_name`); blocks changes to role, email, or IDs. |

### Institutions
| Method | Endpoint | Auth / Roles | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/institutions/me` | `institution`, `admin` | Retrieves institution record linked to the authenticated user. |
| `POST` | `/api/v1/institutions` | `requester`, `institution`, `admin` | Registers a new institution profile with district, address, and contact details. |
| `PATCH` | `/api/v1/institutions/me` | `institution`, `admin` | Updates existing institution profile information. |

### Districts & Nutrition Indicators
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/districts` | Public | Lists all 36 Maharashtra districts along with recorded nutrition indicator counts. |
| `GET` | `/api/v1/districts/:id` | Public | Retrieves specific district details with associated NFHS-5 nutrition indicators and metadata. |

### Requirements
| Method | Endpoint | Auth / Roles | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/requirements` | Public | Queries active, non-expired requirements with optional district filtering and pagination. |
| `GET` | `/api/v1/requirements/:id` | Public | Retrieves full requirement details including itemized quantities, beneficiary counts, and district. |
| `POST` | `/api/v1/requirements` | `requester`, `institution`, `admin` | Creates a new requirement and associated items atomically in PostgreSQL (`under_review`). |

---

## 🗄️ Database Architecture

The data layer is hosted on **Neon Serverless PostgreSQL**, initialized and tracked using custom atomic SQL migrations (`server/src/db/runMigrations.js`).

```
                    ┌────────────────────────┐
                    │       districts        │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│nutrition_ind...  │   │  institutions    │   │  requirements    │
└──────────────────┘   └────────┬─────────┘   └────────┬─────────┘
                                │                      │
                                │                      ├────────► requirement_items
                                ▼                      │
                       ┌──────────────────┐            ├────────► support_offers
                       │institution_doc...│            │                 │
                       └──────────────────┘            │                 ▼
                                                       │         support_confirmations
                                                       │
                                                       └────────► fraud_signals
```

### Key Database Entities

1. **`users`**: Manages user records mapped to Firebase UIDs, email, full name, role (`donor`, `requester`, `institution`, `admin`), and status.
2. **`districts`**: Authoritative record of Maharashtra's 36 administrative districts with standardized slugs.
3. **`nutrition_indicators`**: Stores official NFHS-5 indicator values, units, reporting periods, source factsheets, and data years per district.
4. **`food_categories` & `food_items`**: Nutritional reference library organizing staple foods with informational nutritional attributes (stored as JSONB).
5. **`institutions`**: Organization profiles, verification states (`pending`, `verified`, `rejected`, `under_review`), and contact points.
6. **`requirements`**: Core food requests containing beneficiary demographics, urgency, geographic location, expiration dates, and lifecycle status.
7. **`requirement_items`**: Individual food item demands per requirement, tracking `quantity_required` and `quantity_remaining`.
8. **`support_offers`**: Donor pledges targeting specific requirement items and quantities.
9. **`support_confirmations`**: Tracks independent confirmation booleans (`confirmed_by_donor`, `confirmed_by_requester`) for dual fulfillment.
10. **`institution_documents`**: Records uploaded verification documents and Cloudinary storage identifiers.
11. **`notifications`**: User alerts regarding requirement status transitions and support updates.
12. **`fraud_signals` & `admin_reviews`**: System review signals and human administrator audit decisions.
13. **`audit_logs`**: Immutable ledger of administrative actions and sensitive state changes.

---

## 🔐 Security & Data Principles

- **Firebase Token Verification:** Every protected endpoint requires a valid JWT verified server-side using the Firebase Admin SDK.
- **Server-Side Authorization & Immutability:** Roles are stored in PostgreSQL and cannot be altered by client payload manipulation. Critical fields (roles, emails, record IDs) are explicitly stripped on updates.
- **CORS Whitelist Protection:** Strict origin matching against `CLIENT_URL` ensures that cross-origin credentials and headers cannot be exploited from unauthorized domains. No wildcard (`*`) origins in production.
- **Strict Separation of Data Layers:** Public health survey figures (NFHS-5) and user-submitted requirement data are completely separated. The system explicitly disclaims clinical diagnostic capability.
- **Human-in-the-Loop Moderation:** Fraud signals function strictly as flags for human administrator review; the system never makes automated public fraud accusations.
- **Safe Environment Handling:** Production secrets (`DATABASE_URL`, Firebase private keys) are strictly isolated into environment files excluded by `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Neon PostgreSQL account or local PostgreSQL instance (v14+)
- **Firebase Project**: Firebase project with Email/Password Authentication enabled

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/karan-gaikwad2006/PBL-NEW.git
   cd "PBL NEW"
   ```

2. **Install root, client, and server dependencies:**
   ```bash
   # Install all packages across client and server
   npm run install:all

   # Install root dev dependencies (concurrently)
   npm install
   ```

---

### Environment Configuration

#### 1. Client Environment (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 2. Server Environment (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@ep-sample-pool.region.neon.tech/poshansetu?sslmode=require

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

---

### Database Setup & Data Ingestion

1. **Run Database Migrations:**
   Applies schema tables, constraints, triggers, and baseline seed data (36 Maharashtra districts and food categories):
   ```bash
   cd server
   npm run migrate
   ```

2. **Import Official NFHS-5 Nutrition Data:**
   Parses the official Maharashtra district factsheet Excel spreadsheet and populates `nutrition_indicators`:
   ```bash
   npm run import:nfhs5
   ```

---

### Running in Development

You can run both client and server concurrently from the root directory:

```bash
# Run both frontend and backend concurrently
npm run dev
```

Alternatively, run each service independently in separate terminals:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

---

## 🧪 Testing & Verification

| Area | Check | Status | Details |
| :--- | :--- | :---: | :--- |
| **Frontend Code Quality** | `npm run lint` (Oxlint) | ✅ Verified | Static code analysis passes with zero blocking syntax or import errors. |
| **Frontend Production Build** | `npm run build` (Vite) | ✅ Verified | Client bundle builds cleanly into production `dist/` bundle (React 19 + Tailwind CSS v4). |
| **Backend Startup & Health** | `GET /api/health` | ✅ Verified | Returns `200 OK` with database connection state verification. |
| **API Version Routing** | `GET /api/v1` & `/status` | ✅ Verified | Versioned route mounting confirmed. |
| **Database Migrations** | `npm run migrate` | ✅ Verified | `001_initial_schema.sql` and `002_reference_data.sql` execute cleanly with migration tracking. |
| **NFHS-5 Data Ingestion** | `npm run import:nfhs5` | ✅ Verified | Successfully parsed 36 Maharashtra district rows, importing 251 verified indicator records. |
| **Auth Redirection Guard** | Route test | ✅ Verified | Guest access to `/submit-need` correctly intercepts to `/login-required` and preserves target. |
| **Automated Test Suite** | Integration & Unit | 🚧 In Progress | Dedicated Jest/Vitest unit and API integration suites scheduled for Phase 9. |

---

## 🗺️ Project Roadmap

PoshanSetu follows a structured, milestone-driven engineering implementation plan:

- [x] **Phase 1 — Workspace & Foundation:** Repository scaffolding, Tailwind CSS v4, React Router v7, directory architecture.
- [x] **Phase 2 — UI & Interaction Design:** Desktop UI implementation covering discovery, catalog, submit wizard, and user dashboards.
- [x] **Phase 3 — Backend Foundation:** Express v5 architecture, environment validation, CORS policies, and connection pooling.
- [x] **Phase 4 — Database Architecture:** PostgreSQL schema migrations, relational constraints, triggers, and reference seed data.
- [x] **Phase 5 — Authentication & Access Control:** Firebase Client & Admin SDK integration, user sync to PostgreSQL, and role-based route guards.
- [x] **Phase 6 — Profiles & Institution APIs:** Authenticated `/users/me` and `/institutions/me` profile management with input whitelisting.
- [x] **Phase 7 — Government Data Ingestion:** Automated parser importing 36 Maharashtra districts and NFHS-5 factsheet indicators.
- [x] **Phase 8 — Requirements Integration:** Real requirement submission wizard posting to PostgreSQL with live catalog exploration.
- [ ] **Phase 9 — Support Offer Persistence:** Complete backend endpoints for submitting, accepting, and dual-confirming support offers.
- [ ] **Phase 10 — Document Management & Storage:** Cloudinary media pipeline integration for institution verification documents.
- [ ] **Phase 11 — Moderation & Fraud Heuristics:** Admin review APIs and automated anomaly detection signals.
- [ ] **Phase 12 — Mobile Responsiveness:** Layout adaptation and viewport optimization for smartphone displays.

---

## 📸 Screenshots

> *Interface screenshots will be documented here as visual design passes are completed.*

| Public Discovery & Map | Requirement Submission Wizard |
| :---: | :---: |
| *(Interactive district exploration)* | *(7-step structured requirement intake)* |

| Donor Dashboard | Requester Management |
| :---: | :---: |
| *(Active pledges & fulfillment tracker)* | *(Requirement lifecycle & offers oversight)* |

---

## 🌱 Sustainable Development Goals (SDG) Alignment

PoshanSetu aligns with the United Nations Sustainable Development Goals (SDGs) as an informational and coordination technology platform:

```
  ┌─────────────────────────┐         ┌─────────────────────────┐
  │       SDG 2             │         │       SDG 3             │
  │   Zero Hunger           │         │   Good Health &         │
  │   (Targets 2.1 & 2.2)   │         │   Well-Being (3.4)      │
  └────────────┬────────────┘         └────────────┬────────────┘
               │                                   │
               └─────────────────┬─────────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │      PoshanSetu       │
                     │   Evidence-Informed   │
                     │  Food Coordination   │
                     └───────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
  │    SDG 9     │        │    SDG 10    │        │    SDG 17    │
  │  Innovation  │        │   Reduced    │        │ Partnerships │
  │ & Inf...     │        │ Inequalities │        │ for Goals    │
  └──────────────┘        └──────────────┘        └──────────────┘
```

- **Primary SDG 2: Zero Hunger (Targets 2.1 & 2.2):** Enhances access to safe, nutritious food and addresses the nutritional needs of vulnerable demographics by prioritizing nutrient-dense food coordination over bulk empty calories.
- **Primary SDG 3: Good Health and Well-Being (Target 3.4):** Emphasizes maternal and child nutritional health context using NFHS-5 indicators (e.g. stunting, wasting, anemia).
- **Supporting SDG 9: Industry, Innovation, and Infrastructure:** Leverages modern open-source software, cloud databases, and open government data architectures for social impact.
- **Supporting SDG 10: Reduced Inequalities:** Directs visibility to under-resourced districts and grassroots community homes that lack public outreach channels.
- **Supporting SDG 17: Partnerships for the Goals:** Fosters collaboration between private citizens, community organizers, civil society institutions, and government data sources.

---

## ⚠️ Current Limitations

In adherence to engineering honesty and project transparency:
1. **Desktop-First Scope:** Current frontend layouts are optimized for desktop viewports; mobile-specific responsive layouts are queued for Phase 12.
2. **Support Offer Persistence:** While the support offer and dual-confirmation UI flows are fully built, their dedicated backend endpoints are in active development (`support_offers` and `support_confirmations` schema are in place).
3. **Document Cloud Storage:** The document upload interface in `InstitutionProfile.jsx` functions with local file state; direct upload streaming to Cloudinary is currently pending backend wiring.
4. **Notification Transport:** Notifications operate via local application state; automated email, SMS, or web push delivery is not yet configured.
5. **Simulated Heuristics:** Fraud signals in the admin panel operate as review indicators; automated statistical anomaly algorithms are planned for future phases.

---

## 🔮 Future Improvements

- **Comprehensive Offer Lifecycle APIs:** Backend endpoints to accept, decline, and complete support offers with dual verification.
- **Automated Communication:** Transactional email and SMS notifications alerting requesters when support offers are pledged.
- **Automated Verification Pipeline:** Cloudinary-backed document processing for institution accreditation.
- **Granular Taluka Indicators:** Integration of sub-district healthcare data where available from regional datasets.
- **Mobile PWA Support:** Progressive Web App capability for low-bandwidth field access by community organizers.

---

## 👨‍💻 Development Philosophy

- **Architectural Sovereignty:** Strict separation of concerns between presentation (React), transport/API (Express), and data persistence (PostgreSQL).
- **Responsible Nutrition Context:** Population health data informs community understanding, but never claims clinical diagnosis.
- **Security by Default:** Zero trust in client-submitted role declarations; all authorization decisions occur server-side.
- **Transparency & Integrity:** Ground-level needs are never merged or conflated with government statistical figures.
- **Iterative Delivery:** Continuous validation via linting, build integrity checks, and schema migrations.

---

## 📄 Documentation

For in-depth technical specifications, architectural designs, and setup guides, refer to the project documentation:

- [Product Requirements Document (PRD)](file:///c:/Users/Karan/Web%20development/PBL%20NEW/docs/PRD-PoshanSetu-MVP.md) — Feature scope, user personas, and acceptance criteria.
- [Technical Design Document](file:///c:/Users/Karan/Web%20development/PBL%20NEW/docs/TechDesign-PoshanSetu-MVP.md) — Detailed architecture, API specifications, and data flow diagrams.
- [Application Flow Guide](file:///c:/Users/Karan/Web%20development/PBL%20NEW/docs/AppFlow.md) — Navigation trees, state management, and user journeys.
- [Implementation Plan](file:///c:/Users/Karan/Web%20development/PBL%20NEW/docs/ImplementationPlan.md) — 22-phase structured engineering roadmap.
- [System Memory & Decisions](file:///c:/Users/Karan/Web%20development/PBL%20NEW/MEMORY.md) — Chronological log of architectural decisions, completed milestones, and bug fixes.
- [Local Setup Guide](file:///c:/Users/Karan/Web%20development/PBL%20NEW/SETUP.md) — Detailed developer setup and environment configuration instructions.