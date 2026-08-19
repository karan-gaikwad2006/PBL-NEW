# AGENTS.md - Master Plan for PoshanSetu

Single source of truth for AI coding assistants. Keep details in `agent_docs/` and update this file as the project evolves.

## Project Overview & Stack
**App:** PoshanSetu
**Overview:** PoshanSetu is a Maharashtra-focused web platform that connects people and organizations with current local food requirements, while presenting official district nutrition context and transparent food-to-need matching. It answers WHERE help is needed, WHY attention may be useful, and HOW a donor can support it.
**Stack:** React + Vite, Tailwind CSS, React Router, Firebase Authentication, Node.js, Express.js, REST/JSON, Neon PostgreSQL with `pg`, Cloudinary, Vercel frontend hosting, Render backend hosting, GitHub.
**Critical Constraints:** Level A guided development; mobile-friendly; free/free-tier first; strict separation of official nutrition indicators from user-submitted needs; no payments, logistics, medical diagnosis, unsupported nutrition claims, or exposed secrets; AI is optional and never the source of truth.

## Setup & Commands
These scripts will be confirmed when the React/Vite and Express packages are scaffolded. Do not invent commands that are not present in `package.json`.
- **Setup:** `npm install`
- **Development:** `npm run dev`
- **Testing:** `npm test`
- **Linting & Formatting:** `npm run lint`
- **Build:** `npm run build`

## Protected Areas
Do NOT modify these without explicit human approval:
- Secrets: never commit `.env` files or hardcode credentials.
- Infrastructure, deployment workflows, and hosting configuration.
- Existing database migrations.
- Firebase authentication setup, authorization rules, and third-party integration secrets.

## Coding Conventions
- **Formatting:** Use the configured ESLint and formatter; new code must have no warnings.
- **Architecture:** layered: route/controller -> validation -> service -> repository -> PostgreSQL.
- **Testing:** unit-test pure logic, integration-test API contracts and critical flows, and E2E-test the main journeys.
- **Type Safety:** use strict typing, avoid `any`, and validate external input at boundaries.

## How I Should Think
1. Understand the requested outcome and explain what is being built, why, and where it belongs.
2. Ask one specific question if critical context is missing.
3. Plan briefly and get approval before changing more than one file. Use plan/reflect mode when available.
4. Execute one feature at a time, preserving the approved architecture.
5. Verify with tests, linting, or manual browser checks after each logical change.
6. Explain important trade-offs in plain language.
7. Record decisions and current state in `MEMORY.md`.
8. Use subagents for focused exploration or test checks when available.

## What NOT To Do
- Do not delete files without explicit confirmation.
- Do not change the database schema without a backup or migration plan.
- Do not add features outside the current phase.
- Do not skip tests or bypass failing hooks.
- Do not replace Neon, Firebase Auth, Cloudinary, or the approved hosting architecture without approval.
- Do not invent government data, nutrition facts, deficiency relationships, or APIs.
- Do not process money, payments, transport, or medical treatment.
- Do not declare people fraudulent automatically; flag suspicious patterns for review.
- Do not mark support fulfilled without donor and requester confirmation.
- Do not expose private data or secrets to the client or external AI.
- Do not copy Milaap branding or copyrighted assets.

## Engineering Constraints
- **Type Safety:** Do not use `any`; use `unknown` with type guards. Type function inputs and outputs and validate external data.
- **Architectural Sovereignty:** Route and UI layers handle transport/presentation only. Business logic belongs in services and core modules. Routes must not call the database directly.
- **Library Governance:** Check existing package manifests before adding dependencies. Prefer deterministic rules and native APIs for MVP functionality.
- **Security:** Verify Firebase tokens server-side, authorize every protected action, validate uploads and inputs, and keep secrets in environment variables.
- **Data Integrity:** Preserve requirement and support history. Use dual confirmation for fulfillment and keep official nutrition data separate from current local needs.
- **Workflow Discipline:** Verify every feature before moving on and update documentation after meaningful decisions.

## Current State
**Last Updated:** 2026-08-19
**Working On:** Phase 2 — Design System and UI Foundation
**Recently Completed:** Phase 1 Foundation (client + server scaffolded, Tailwind CSS v4, React Router, all folder structures, page skeletons, `.env.example` files)
**Blocked By:** None — root `npm install` must be run manually on first clone

## Roadmap
### Phase 1: Foundation ✅ COMPLETE
- [x] Initialize React/Vite frontend and Node/Express backend
- [x] Set up Tailwind CSS v4 and responsive layout skeleton
- [x] Configure environment variables and `.gitignore`
- [ ] Set up Neon PostgreSQL and database migrations
- [ ] Configure Firebase Authentication

### Phase 2: Core Features
- [ ] Landing page and navigation
- [ ] Maharashtra location browsing and search
- [ ] District nutrition information with source, reporting period, and sync metadata
- [ ] Current local requirements and food categories
- [ ] WHERE -> WHY -> HOW journey
- [ ] Food information and deterministic food-to-need matching
- [ ] User registration and Firebase authentication
- [ ] Requirement submission and validation
- [ ] Donor response and basic dashboards
- [ ] Requirement statuses, expiry, partial support, and dual confirmation
- [ ] Basic notifications and admin dashboard
- [ ] Basic privacy/security and source transparency

### Phase 3: Polish
- [ ] Institution profiles and verification
- [ ] Documents and Cloudinary integration
- [ ] Duplicate/multiple-account detection and fraud flags
- [ ] Support history, renewal, moderation, audit logs, and advanced dashboards
- [ ] Food knowledge base and detailed evidence-based explanations
- [ ] Error handling, accessibility, mobile responsiveness, and performance pass

### Phase 4: Launch
- [ ] Security pass using `REVIEW-CHECKLIST.md`
- [ ] Deploy frontend to Vercel or equivalent
- [ ] Deploy backend to Render or equivalent
- [ ] Verify current free-tier limits and production environment variables
- [ ] Run production donor, requester, authorization, and responsive checks

## Context Files
- `SETUP.md` - **START HERE** on a new machine or account
- `MEMORY.md` - session continuity and current state
- `REVIEW-CHECKLIST.md` - definition of done
- `agent_docs/tech_stack.md` - stack and commands
- `agent_docs/code_patterns.md` - architecture and code style
- `agent_docs/project_brief.md` - vision and conventions
- `agent_docs/product_requirements.md` - requirements and user stories
- `agent_docs/testing.md` - test strategy
- `docs/ImplementationPlan.md` - full 22-phase build order
- `docs/AppFlow.md` - navigation and user journey rules
- `specs/` - feature specs created during implementation
