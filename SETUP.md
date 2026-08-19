# PoshanSetu — Workspace & Agent Setup Guide

**Purpose:** Complete onboarding reference for setting up the PoshanSetu development environment on a new machine or account.  
**Last Updated:** 2026-08-19  
**Status:** Phase 1 Foundation — in progress

---

## 1. Quick Context

PoshanSetu is a Maharashtra-focused web platform that connects donors with local food requirements, while presenting official district nutrition context. The core user journey answers:

```
WHERE is help needed?
WHY is attention useful there?
HOW can a donor support it?
```

**Read these documents in order before touching any code:**

| Document | Purpose |
|---|---|
| `docs/PRD-PoshanSetu-MVP.md` | WHAT must be built |
| `docs/TechDesign-PoshanSetu-MVP.md` | HOW it technically works |
| `docs/design.md` | HOW it visually looks |
| `docs/AppFlow.md` | HOW users navigate |
| `docs/ImplementationPlan.md` | IN WHICH ORDER to build |
| `AGENTS.md` | Rules for AI coding assistants |
| `MEMORY.md` | Session continuity & current state |
| `REVIEW-CHECKLIST.md` | Definition of done |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8, Tailwind CSS v4, React Router v7 |
| Backend | Node.js + Express v5, CommonJS |
| Auth | Firebase Authentication (client + Admin SDK) |
| Database | Neon PostgreSQL (via `pg`) |
| File Storage | Cloudinary |
| Frontend Host | Vercel (planned) |
| Backend Host | Render (planned) |
| Version Control | GitHub |

---

## 3. Prerequisites — Install These First

Before cloning or running anything, make sure these are installed on the new machine:

```
Node.js   ≥ 18.x LTS    https://nodejs.org
npm       ≥ 9.x          (bundled with Node.js)
Git       latest          https://git-scm.com
VS Code   latest          https://code.visualstudio.com
```

Verify with:

```bash
node -v
npm -v
git -v
```

---

## 4. Repository Layout

```
PBL NEW/                          ← workspace root
│
├── client/                       ← React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DistrictBrowse.jsx
│   │   │   ├── RequirementSubmit.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx               ← Router + Navigation layout
│   │   ├── App.css
│   │   ├── index.css             ← @import "tailwindcss"
│   │   └── main.jsx
│   ├── .env                      ← DO NOT COMMIT
│   ├── .env.example              ← Safe template to copy
│   ├── package.json
│   └── vite.config.js            ← includes @tailwindcss/vite plugin
│
├── server/                       ← Node.js + Express backend
│   ├── src/
│   │   ├── app.js                ← Express app setup
│   │   ├── index.js              ← Server entry point
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── .env                      ← DO NOT COMMIT
│   ├── .env.example              ← Safe template to copy
│   └── package.json
│
├── docs/
│   ├── PRD-PoshanSetu-MVP.md
│   ├── TechDesign-PoshanSetu-MVP.md
│   ├── design.md
│   ├── AppFlow.md
│   ├── ImplementationPlan.md
│   ├── research-PoshanSetu.md
│   ├── CHANGELOG.md
│   └── golden-path-checklist.md
│
├── agent_docs/                   ← Detailed context for AI agents
│   ├── tech_stack.md
│   ├── code_patterns.md
│   ├── project_brief.md
│   ├── product_requirements.md
│   └── testing.md
│
├── .gitignore
├── package.json                  ← Root orchestration (concurrently)
├── AGENTS.md                     ← AI assistant rules (source of truth)
├── MEMORY.md                     ← Session continuity
├── REVIEW-CHECKLIST.md           ← Definition of done
└── SETUP.md                      ← This file
```

---

## 5. First-Time Setup Steps

Follow these steps in order on a new machine or account.

### Step 1 — Clone the Repository

```bash
git clone <your-github-repo-url> "PBL NEW"
cd "PBL NEW"
```

### Step 2 — Install Root Dependencies

```bash
npm install
```

This installs `concurrently` used to run client + server together.

### Step 3 — Install Client Dependencies

```bash
cd client
npm install
cd ..
```

Client installs: `react`, `react-dom`, `react-router-dom`, `firebase`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`, `postcss`, `autoprefixer`, `vite`, `@vitejs/plugin-react`.

### Step 4 — Install Server Dependencies

```bash
cd server
npm install
cd ..
```

Server installs: `express`, `cors`, `dotenv`, `pg`, `firebase-admin`, `cloudinary`, `nodemon`.

### Step 5 — Set Up Client Environment Variables

```bash
copy client\.env.example client\.env
```

Then open `client/.env` and fill in your Firebase project credentials:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 6 — Set Up Server Environment Variables

```bash
copy server\.env.example server\.env
```

Then open `server/.env` and fill in your credentials:

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **NEVER commit `.env` files.** The `.gitignore` already excludes them.

### Step 7 — Verify Setup

Start both servers to verify everything runs:

```bash
# Terminal 1 — Start backend
cd server
npm run dev
# Expected: "PoshanSetu server running on port 5000"

# Terminal 2 — Start frontend
cd client
npm run dev
# Expected: "Local: http://localhost:5173"
```

Or run both together from the root:

```bash
npm run dev
```

Verify the health check endpoint works:

```
GET http://localhost:5000/api/health
Expected: { "status": "OK", "timestamp": "..." }
```

---

## 6. Available npm Scripts

### Root (`package.json`)

| Script | What it does |
|---|---|
| `npm install` | Install root devDependencies (concurrently) |
| `npm run dev` | Run client + server concurrently |
| `npm run dev:client` | Run only the Vite frontend |
| `npm run dev:server` | Run only the Express backend |
| `npm run build` | Build client + server for production |
| `npm run build:client` | Build Vite client only |
| `npm run install:all` | Install client + server dependencies |

### Client (`client/package.json`)

| Script | What it does |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview production build locally |

### Server (`server/package.json`)

| Script | What it does |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start without auto-reload |

---

## 7. Agent Configuration Files

### `AGENTS.md`

**Purpose:** Single source of truth for AI coding assistants.

Defines:
- Project overview and tech stack
- Setup commands
- Protected areas (never touch without approval)
- Coding conventions (layered architecture, type safety)
- How the AI should think (plan → approve → execute)
- What the AI must NOT do
- Current state and roadmap
- References to all context files

**Location:** `c:\Users\Karan\Web development\PBL NEW\AGENTS.md`

**Key rules for AI agents from `AGENTS.md`:**
```
1. Understand → explain → ask if critical context is missing
2. Plan briefly → get approval → then execute
3. Execute one feature at a time
4. Verify with tests/linting after each change
5. Record decisions in MEMORY.md
```

---

### `MEMORY.md`

**Purpose:** Session continuity. Updated after every major milestone.

Tracks:
- Active phase and current task
- Next steps
- Architectural decisions (with dates)
- Known issues and quirks
- Completed phases

**Location:** `c:\Users\Karan\Web development\PBL NEW\MEMORY.md`

**Current state as of 2026-08-19:**
```
Active Phase:   Phase 1 Foundation
Current Task:   Project setup
Next Steps:
  1. Scaffold React/Vite frontend (DONE - client/ exists)
  2. Configure Tailwind CSS (DONE - @tailwindcss/vite configured)
  3. Set up Express backend (DONE - server/ exists)
  4. Configure Neon PostgreSQL connection
  5. Configure Firebase Authentication
  6. Build first landing page
```

---

### `REVIEW-CHECKLIST.md`

**Purpose:** Definition of done. Use before declaring any phase complete.

**Location:** `c:\Users\Karan\Web development\PBL NEW\REVIEW-CHECKLIST.md`

---

### `agent_docs/` Directory

Detailed reference files for AI agents:

| File | Contains |
|---|---|
| `tech_stack.md` | Full stack details and approved library versions |
| `code_patterns.md` | Architecture patterns, route→controller→service→repository |
| `project_brief.md` | Vision, mission, non-goals |
| `product_requirements.md` | P0/P1/P2 requirements and user stories |
| `testing.md` | Testing strategy and coverage rules |

---

## 8. Key External Services — What You Need to Set Up

### Firebase (Authentication)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project called `poshansetu`
3. Enable **Email/Password** authentication
4. Go to Project Settings → Your Apps → Web App
5. Copy the config object → paste into `client/.env`
6. Go to Project Settings → Service Accounts → Generate new private key
7. Paste `project_id`, `client_email`, `private_key` into `server/.env`

### Neon PostgreSQL (Database)

1. Go to [Neon Console](https://neon.tech)
2. Create a new project `poshansetu`
3. Create a database `poshansetu_db`
4. Copy the **connection string** → paste as `DATABASE_URL` in `server/.env`
5. Make sure it ends with `?sslmode=require`

### Cloudinary (File Storage)

1. Go to [Cloudinary Console](https://cloudinary.com)
2. Create an account / sign in
3. From the Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
4. Paste all three into `server/.env`

---

## 9. Architecture Rules (Never Violate)

```
Route/Controller  →  handles HTTP transport only
Validator         →  validates and sanitizes input
Service           →  all business logic lives here
Repository        →  all database queries live here
PostgreSQL        →  data storage
```

- **Frontend never calls the database directly**
- **Backend never trusts data sent by the frontend without server-side validation**
- **Firebase tokens must be verified server-side** — never trust a user ID sent from the client
- **Cloudinary API secrets stay server-side** — never expose in frontend code
- **`.env` files are never committed** — use `.env.example` as templates

---

## 10. Current Implementation Progress

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Documentation & preparation | ✅ Done |
| Phase 1.1 | Root workspace setup (`package.json`, `.gitignore`) | ✅ Done |
| Phase 1.2 | React + Vite client scaffolded | ✅ Done |
| Phase 1.3 | Tailwind CSS v4 configured | ✅ Done |
| Phase 1.4 | Client packages installed (`react-router-dom`, `firebase`, `lucide-react`) | ✅ Done |
| Phase 1.5 | Client folder structure created (`pages/`, `components/`, `hooks/`, etc.) | ✅ Done |
| Phase 1.6 | Client `.env.example` created | ✅ Done |
| Phase 1.7 | Express server scaffolded | ✅ Done |
| Phase 1.8 | Server packages installed (`express`, `cors`, `pg`, `firebase-admin`, etc.) | ✅ Done |
| Phase 1.9 | Server folder structure created | ✅ Done |
| Phase 1.10 | Server `.env.example` created | ✅ Done |
| Phase 1.11 | Basic page skeletons created (`LandingPage`, `DistrictBrowse`, etc.) | ✅ Done |
| Phase 1.12 | React Router configured in `App.jsx` | ✅ Done |
| **Phase 2** | **Design System & full UI** | ⬜ Next |
| Phase 3 | Backend Foundation (middleware, API conventions) | ⬜ Pending |
| Phase 4 | Database Foundation (Neon schema + migrations) | ⬜ Pending |
| Phase 5 | Firebase Authentication | ⬜ Pending |

---

## 11. What to Tell the AI Agent When Starting a New Session

Paste this into the AI chat at the start of a new conversation:

```
I am resuming work on PoshanSetu.
Please read AGENTS.md and MEMORY.md first.
Also check docs/ImplementationPlan.md for the full roadmap.

Current state:
- Phase 1 Foundation is complete.
- client/ has React + Vite + Tailwind CSS v4 + React Router configured.
- server/ has Express + pg + firebase-admin + cloudinary configured.
- No database connection yet.
- No Firebase auth yet.
- Next: Phase 2 — Design System and full UI implementation.

Do not start new phases without explaining the plan first.
```

---

## 12. Design Tokens (Critical — Use Everywhere)

Primary colour: `#304355` (dark navy/teal)  
Background colour: `#E8E8E2` (warm off-white)  
UI inspiration: Milaap — human, clear, trust-building  
Font: Inter or similar clean sans-serif  

The UI must **not** look like a generic AI-generated template.

---

## 13. Git Workflow

Simple recommended flow for supervised AI-assisted development:

```bash
# Before starting work
git pull origin main

# After completing a phase
git add .
git commit -m "Phase X: description of what was built"
git push origin main
```

Never commit:
- `.env` files
- `node_modules/`
- Firebase service account JSON files
- Any credentials or secrets

---

## 14. Troubleshooting

| Problem | Fix |
|---|---|
| `npm run dev` fails at root | Run `npm install` at root first |
| Frontend can't reach backend | Check `VITE_API_URL` in `client/.env` points to correct port |
| Backend crashes on start | Check all required `server/.env` variables are filled |
| Tailwind classes not applying | Confirm `vite.config.js` imports `@tailwindcss/vite` and `index.css` has `@import "tailwindcss"` |
| Firebase auth fails | Verify `VITE_FIREBASE_*` variables match your Firebase project |
| Neon connection fails | Check `DATABASE_URL` ends with `?sslmode=require` |
| Cloudinary upload fails | Confirm all three Cloudinary variables are in `server/.env` |

---

*Keep this file updated every time the project structure or setup process changes.*
