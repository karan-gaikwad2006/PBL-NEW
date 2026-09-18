# Product Requirements Document: PoshanSetu MVP (v2)

**Project Name:** PoshanSetu
**Tagline:** Dynamic Nutrition Needs & Donation Matching Platform
**Geographic Scope (MVP):** One pilot city — Nashik, Maharashtra (expand later)
**Document Status:** MVP-ready, scoped for build
**Version:** 2.0 — supersedes v1.0
**Intended audience of this document:** an AI coding assistant / dev team building the MVP

---

## 0. What changed from v1 and why

v1 of this PRD specified a 2–3 day build containing a full two-sided marketplace, government dataset ingestion, AI-driven nutrition matching, institution verification, automated fraud detection, dispute resolution, audit logs, and RAG — effectively a 6+ month product roadmap labeled as an MVP.

v2 narrows this to a single, coherent, buildable loop:

> A donor (individual or NGO) can see **what a region needs and why**, find a **real, verified institution's active requirement**, get matched using **deterministic logic + a citable nutrition table**, and be **handed off to complete the donation offline**, with the loop closed by an **automated confirmation + trust-score system**.

Only **one manual step exists in the entire product**: admin review of an institution's registration documents at signup. Everything else — matching, requirement posting by verified institutions, requirement posting by individuals, fulfillment confirmation, disputes, fraud flags, expiry — is automated.

Everything runs on **100% free-tier infrastructure**.

---

## 1. Problem Statement

Food donation today is supply-driven: a donor knows what they have but not where it's genuinely needed, how urgent the need is, or whether the requester is legitimate. Institutions (Ashram Shalas, NGOs, schools) have real, ongoing needs but no centralized, low-friction way to publish them to donors who are actively looking to help — and no way for donors to understand *why* a particular food matters in a particular place.

PoshanSetu closes this gap by combining:
- **Real, live, institution-submitted requirements** (the actual need)
- **Public district-level nutrition indicators** (why this region needs attention)
- **A citable nutrient-to-food mapping** (what kind of food actually helps)
- **Deterministic matching** (connecting a donor's supply, or a donor's desire to help, to the closest relevant real need)

## 2. What PoshanSetu Explicitly Does NOT Do (Out of Scope for MVP and beyond)

- Does not process payments or handle money in any form
- Does not physically transport, store, or handle food
- Does not diagnose any individual's nutritional deficiency
- Does not claim a district-level statistic applies to any specific child or family
- Does not perform paid/registry-backed KYC verification (no budget for this at MVP — see §8)
- Does not use AI to generate or infer the nutrition science — the deficiency-to-food mapping is a static, human-curated, cited table (see §7)
- Does not use AI, or any automated system, to approve or reject an institution's legitimacy — that is the one human step in the product (see §8)

---

## 3. Target Users & Roles

| Role | Description | Capabilities |
|---|---|---|
| **Individual Donor** | Any person with food to give | Post supply, browse/search by location, get matched, initiate handoff, confirm fulfillment |
| **NGO/Institution Donor** | Organization donating (not requesting) | Same as individual donor |
| **Individual Requester** | Person/family needing food support | Post a requirement, gated by trust tier (see §9); no document verification required |
| **Institution Requester** | Ashram Shala, NGO, school, etc. | Must complete one-time document verification (admin-reviewed) before requirements go live; thereafter posts requirements with no further manual review |
| **Admin** | Platform operator | **Only** reviews institution verification documents at signup. Does not review individual requirement posts, does not adjudicate disputes, does not manually flag fraud. |

---

## 4. Core Product Loop

Two entry points into the same underlying matching engine:

**Flow A — "Where is help needed?" (discovery-first)**
```
Select/detect location
   → See district nutrition context (why this area needs attention)
   → See active, real institution requirements nearby, ranked by relevance
   → Pick one → Handoff page → Complete offline → Confirm
```

**Flow B — "I have food, where should it go?" (supply-first)**
```
Enter food item + quantity (+ optional free-text via AI parser)
   → System matches against active requirements
   → Ranked results shown with deficiency-based rationale
   → Pick one → Handoff page → Complete offline → Confirm
```

Both flows terminate at the same **Handoff & Confirmation** step (§10).

---

## 5. Matching Engine (Deterministic — No AI in the decision logic)

Every match is scored using a fixed, explainable formula. AI may narrate the result; AI never computes the score.

```
match_score =
    w1 * proximity_score(donor_location, institution_location)
  + w2 * food_type_match(donor_food_or_browsed_category, requirement_food)
  + w3 * deficiency_relevance(district_indicator_table, requirement_food_category)
  + w4 * urgency_score(requirement.urgency_flag, requirement.days_until_expiry)
  + w5 * remaining_need_score(requirement.remaining_quantity)
```

- `proximity_score`: distance via OpenStreetMap/Nominatim geocoding, inverse-distance weighted, capped at a configurable radius (default 50 km for MVP)
- `food_type_match`: exact category match = 1.0, related category (e.g. dal ↔ pulses) = 0.5, no match = excluded from results
- `deficiency_relevance`: lookup against the static table in §7 — does this food category address this district's reported indicator?
- `urgency_score`: derived from requirement's declared urgency and days remaining before auto-expiry
- `remaining_need_score`: favors requirements with meaningful remaining quantity over nearly-fulfilled ones

Weights (`w1`–`w5`) should be config values, not hardcoded, so they can be tuned post-launch without a redeploy.

---

## 6. Requirement Lifecycle (fully automated)

```
Draft → Active → (Partially Fulfilled ⇄ Active) → Fulfilled
                → Expired (auto, if no activity before deadline)
                → Renewed (auto-offered to requester near expiry, one click to extend)
```

- Institution requirements go live immediately after the institution's one-time verification is approved — no per-requirement review
- Individual requirements go live immediately, gated by the poster's trust tier (see §9)
- Expiry is a scheduled job (e.g. daily cron), not a manual action
- Partial fulfillment simply decrements `remaining_quantity`; requirement stays active until it hits zero or expires

---

## 7. Nutrition Deficiency Layer (Static, Citable — NOT AI-generated)

### 7.1 Data source
District-level indicators from **NFHS-5 (National Family Health Survey)** district factsheets — publicly available, free, no API needed (import as a static dataset at build time).

Indicators to store per district (MVP subset):
- % children under 5 stunted
- % children under 5 wasted
- % children under 5 underweight
- % children 6–59 months anemic
- % women 15–49 anemic

### 7.2 The mapping table (build once, by hand, cite ICMR/NIN dietary guidelines)

| Indicator (NFHS-5) | Nutrient Category | Recommended Food Categories |
|---|---|---|
| High child/women anemia % | Iron | Ragi, Jaggery, Green leafy vegetables, Chana |
| High child stunting/underweight % | Protein + Calories | Moong Dal, Peanuts, Milk powder, Soya |
| High wasting % | Acute calorie need | Rice, Wheat, Groundnut oil |
| Low dietary diversity | General diversity | Mixed dal, Millets (Jowar/Bajra), Seasonal vegetables |

This table is stored as a simple reference dataset (JSON or a DB table), not computed. It is the single source of truth for every deficiency-based recommendation shown anywhere in the product, including AI-generated text.

### 7.3 Mandatory framing rule

Every UI surface (and every AI-generated sentence) referencing this data must follow this chain, never skip a step:

> **District-level statistic (cited, NFHS-5)** → **general nutrient category (cited, ICMR/NIN)** → **actual, live, real institution requirement**

The system must never say or imply that a specific child, family, or institution "has" a deficiency — only that the district reports an elevated population-level indicator, and that certain food categories are generally recommended in response.

---

## 8. Institution Verification (the one manual step)

Because paid registry-verification APIs (NGO Darpan, PAN/GSTIN KYC providers) are out of budget for MVP, verification is **document-upload + one-time admin review**, not automated identity verification. This is a known, accepted limitation — document it in-product, don't overstate it as "verified" in a legal/registry sense.

**Flow:**
1. Institution registers, fills profile, uploads registration document(s) (Cloudinary storage)
2. Optional: client-side/server-side OCR (Tesseract.js, free) pre-extracts a likely registration number to speed up admin review — this is an assist, not an approval mechanism
3. Admin sees a queue of pending institutions, reviews the document, clicks Approve or Reject
4. On approval: institution can post requirements immediately, no further review, ever, for future requirement posts
5. On rejection: institution is notified, may re-submit corrected documents

**This is the only screen in the admin dashboard that requires human judgment.** No other admin moderation queue should exist in MVP.

---

## 9. Trust Score System (replaces all other manual review)

Every account (donor or requester, individual or institution) has an automatically computed trust score, used only to gate limits/visibility — never to publicly shame or manually ban.

**Signals (all free, all derived from in-platform behavior):**
- Account age
- Fulfillment rate (requirements that reached "Fulfilled" vs. expired unfulfilled)
- Response rate/time to matches or offers
- Dispute count (see §10)
- Non-response to confirmation requests (counts against the non-responder)
- Optional peer corroboration: a donor who completed a real handoff with an institution can "vouch" for it once

**What the score controls (all automatic, no human in the loop):**
- New accounts: capped requirement size/frequency
- Rising trust: higher caps, higher ranking in match results
- Repeated disputes/non-response: throttled visibility and lower caps — never an outright ban triggered by a human, purely score-driven

---

## 10. Handoff & Confirmation Flow (fully automated)

The actual donation happens **outside the platform** — PoshanSetu never handles food or payment. After a donor selects a match:

1. **Handoff page** shows: institution name, contact number, address, map link (OpenStreetMap), the exact item/quantity still needed, any stated drop-off instructions, and a "Mark as completed" action for later
2. Donor completes the donation offline
3. Donor returns and clicks **Confirm** (optional photo/note upload via Cloudinary — not mandatory)
4. Institution has a fixed window (e.g. 72 hours) to confirm receipt
   - No response within window → **auto-confirmed**, but logged (repeated non-response dings that institution's trust score)
   - Explicit dispute ("never received") → **no human adjudicates**; both parties' trust scores adjust automatically based on dispute history, and the requirement's remaining quantity is not decremented until independently reconfirmed
5. Reminder notification (in-app only for MVP — no email/SMS budget) nudges the donor to confirm if they haven't within a day or two

---

## 11. AI Usage — Explicit Scope (grounded/retrieval-only, never open-ended)

AI is a **presentation and parsing layer over deterministic, real data** — never the source of a matching or nutrition decision.

| Use | What AI does | Hard constraint |
|---|---|---|
| Explanation generation | Turns a deficiency-table lookup + live requirement into a friendly sentence for the donor | Must only restate facts passed into the prompt; no added claims |
| Match rationale | Explains why a result was ranked/shown | Ranking itself is computed by the deterministic formula in §5, not by the AI |
| Free-text food input parsing | "I have some jowar and 2 sacks of dal" → structured `{food, qty, unit}` | Ambiguous quantities are flagged back to the user, never guessed silently |
| Natural-language search | "urgent protein needs near Nashik" → structured DB filter query | Query only ever runs against real DB records |
| Admin OCR assist | Pre-extracts likely registration numbers from uploaded documents | Never auto-approves; admin still makes the verification call |
| Chatbot (secondary UI) | Wraps all of the above in a conversational interface | Same retrieval-only constraint; refuses individual health/medical questions and refuses any request to bypass admin verification |

**Prompt discipline:** every AI call that touches nutrition or matching content should use a template that only allows rephrasing of supplied facts, e.g.:

```
Given: district="{district}", indicator="{indicator_stat}",
recommended_category="{food_category}",
matched_requirement="{institution_name} needs {qty} {item}",
Write one friendly sentence connecting these facts for a donor.
Do not add any nutrition claim not present in the input.
```

**Free-tier AI providers:** Google Gemini (Flash tier, free quota) as primary; Groq (free tier, open models) as fallback/secondary if rate limits are hit.

**UI note carried from v1:** AI should operate behind the scenes on the primary flows (Flow A/B). The chatbot is a secondary, optional entry point — not the primary way a first-time user is expected to interact with the platform.

---

## 12. Data Model (core entities)

```
User
  id, name, phone, email, role [donor|requester|both], account_type [individual|institution],
  trust_score, created_at

Institution (1:1 extension of User where account_type = institution)
  id, user_id, org_name, registration_doc_url, ocr_extracted_number,
  verification_status [pending|approved|rejected], verified_at, verified_by_admin_id

Requirement
  id, requester_id, institution_id (nullable if individual),
  food_item, quantity_needed, quantity_remaining, unit,
  location (lat/lng + district + city), urgency, status [draft|active|partially_fulfilled|fulfilled|expired],
  created_at, expires_at

DonorOffer
  id, donor_id, requirement_id, quantity_offered, status [pending|handed_off|confirmed|disputed],
  handoff_at, confirmed_at, proof_photo_url (optional), dispute_reason (optional)

DistrictIndicator
  id, district, indicator_name, value, source ["NFHS-5"], reporting_period

DeficiencyFoodMap  (static reference table, seeded once)
  id, indicator_name, nutrient_category, recommended_food_categories[]

TrustScoreEvent
  id, user_id, event_type [fulfilled|expired_unfulfilled|disputed|non_response|vouch],
  score_delta, created_at
```

---

## 13. Technology Stack (100% free tier)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Tailwind | Hosted on Vercel or Netlify free tier |
| Backend | Node.js + Express | Hosted on Render or Railway free tier |
| Database | PostgreSQL via Neon | Free tier |
| Auth | Firebase Authentication | Free tier |
| File storage | Cloudinary | Free tier (~25 credits/mo — sufficient for MVP volume) |
| OCR | Tesseract.js | Open-source, no API cost |
| Geocoding/maps | OpenStreetMap + Nominatim | Free, avoid Google Maps API (not free at scale) |
| AI | Gemini Flash (primary), Groq (fallback) | Free tiers |
| Notifications | In-app only for MVP | Email/SMS deferred — first cost center to add post-MVP |
| Scheduled jobs (expiry, reminders) | Node cron / Render cron jobs | Free tier compatible |

---

## 14. MVP Build Phases

### Phase 1 — Foundation
- Auth (Firebase), base schema (Neon), project scaffolding, basic nav/homepage

### Phase 2 — Institution & Requirement Core
- Institution registration + document upload (Cloudinary) + OCR pre-fill
- Admin review screen (the one manual checkpoint)
- Requirement CRUD, lifecycle states, expiry cron

### Phase 3 — Matching Engine
- Deterministic scoring (§5), district indicator import (NFHS-5 static data for pilot city), deficiency-food static table (§7)
- Flow A (discovery) and Flow B (supply-first) UIs

### Phase 4 — Handoff & Trust Loop
- Handoff page, confirm flow with timeout auto-confirm, dispute handling (score-based, no admin queue)
- Trust score engine + tiered posting limits

### Phase 5 — AI Layer
- Explanation generation, match rationale, free-text parser, natural-language search
- Chatbot wrapper (secondary UI) using the same retrieval-grounded calls

### Phase 6 — Polish & Pilot Launch
- Manually onboard 5–10 real institutions in the pilot city (cold-start seeding — this matters more than any remaining feature work)
- Basic responsive/accessibility pass
- Deploy

---

## 15. Known MVP Limitations (state these plainly, don't hide them)

- Institution verification is document-review based, not registry-API-verified — a sufficiently motivated bad actor could pass a single admin check with a fabricated document. There is no second checkpoint downstream; the trust-score system only catches bad behavior *after* it happens, not before.
- Deficiency data is district-level and population-level; it never applies to a specific individual or institution's actual nutritional status.
- No SMS/email notifications at MVP — all communication is in-app, which risks donors/institutions missing time-sensitive confirmations.
- Single pilot city at launch; multi-district/state scaling is a post-MVP concern, not a v1 requirement.

---

## 16. Success Criteria for MVP

- A real donor can, end-to-end, discover a real institution's need (via either flow), understand why it matters (deficiency context), get handed off, and have the platform correctly auto-confirm or track the outcome — without any human touching that donor's journey.
- At least 5–10 real institutions onboarded and verified in the pilot city before/at launch (cold-start seeding, not a stretch goal).
- Admin involvement in the entire system is limited to the institution verification queue — measurable as "zero other manual actions required to operate the platform."

---

# END OF PRD (v2)
