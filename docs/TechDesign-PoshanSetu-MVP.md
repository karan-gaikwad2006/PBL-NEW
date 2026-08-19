# Technical Design Document: PoshanSetu MVP

**Project:** PoshanSetu  
**Document:** Technical Design Document  
**Version:** MVP 1.0  
**Platform:** Web Application  
**Geographical Scope:** Maharashtra initially  
**Future Scope:** India-wide expansion  
**Primary Users:** Donors, NGOs, institutions, normal users, administrators  
**Development Approach:** AI-assisted / Supervisor-led development  
**Primary Goal:** Build a functional, secure, user-friendly nutrition needs and donation intelligence platform using free/free-tier services.

---

# 1. Executive Summary

## 1.1 What is PoshanSetu?

PoshanSetu is a web-based Dynamic Nutrition Needs & Donation Intelligence Platform.

The platform helps people and organizations answer three questions:

1. **WHERE can I help?**
2. **WHY is help needed there?**
3. **HOW can I help?**

The platform initially focuses on Maharashtra and combines two separate information layers:

### Layer A — District Nutrition Information

This layer uses the latest available reliable government or official nutrition-related data.

It provides contextual information such as:

- District-level nutrition indicators
- Reporting period
- Data source
- Last synchronization date
- Relevant nutrition-risk indicators

### Layer B — Current Local Requirements

This layer contains requirements submitted by:

- NGOs
- Ashram Shalas
- Schools
- Other institutions
- Normal users

Examples:

- Rice required
- Dal required
- Jowar required
- Bajra required
- Ragi required
- Pulses required
- Other approved food/support categories

These two layers must remain separate.

The application must never create an arbitrary combined "nutrition score" by mixing government indicators and user-submitted requirements.

---

# 2. Technical Design Philosophy

PoshanSetu is being built under the following principles:

1. **Free-first**
2. **Simple architecture**
3. **Secure by default**
4. **Easy to understand**
5. **Easy to maintain**
6. **Automation-first**
7. **Human oversight for suspicious cases**
8. **Transparent data sources**
9. **No unsupported nutrition claims**
10. **Mobile-friendly**
11. **Milaap-inspired usability**
12. **Do not make the website look AI-generated**
13. **Architecture should be expandable to India**
14. **The project owner supervises the implementation**
15. **All approved P0, P1 and P2 features remain part of the project scope**

---

# 3. Project Owner / Development Role

## 3.1 Role of the Project Owner

The project owner is primarily the:

- Supervisor
- Tester
- Decision maker
- Product owner

The project owner is not expected to independently understand every technical implementation detail before development begins.

The development process should therefore be AI-assisted and highly guided.

---

# 4. Guided Development Workflow

The implementation workflow will be:

```text
                    PROJECT OWNER
                          |
                    SUPERVISES
                          |
                          v
                 AI-ASSISTED DEVELOPMENT
                          |
        +-----------------+------------------+
        |                 |                  |
        v                 v                  v
     Explain           Build             Test
        |                 |                  |
        +-----------------+------------------+
                          |
                          v
                    Fix / Improve
                          |
                          v
                    Verify Feature


For every technical task:

1. Explain what is being built.
2. Explain why it is required.
3. Explain where it belongs.
4. Provide exact setup instructions.
5. Provide commands where required.
6. Provide code when implementation begins.
7. Ask the project owner to run/test it.
8. Analyze any errors.
9. Fix the issue.
10. Verify the result.
11. Move to the next feature.

The project owner should not be expected to guess:

* API keys
* Environment variables
* Database configuration
* Firebase configuration
* Cloudinary configuration
* Deployment settings
* Backend configuration
* Security configuration

These will be handled step-by-step during implementation.

---

# 5. Development Level

## User Technical Level

**Path A — Vibe-Coder / AI-Assisted Builder**

The project owner has basic programming knowledge but wants AI to guide and assist with the majority of implementation.

The project owner should still understand the high-level architecture and major decisions but does not need to manually implement every component from scratch.

---

# 6. Platform

## Recommended Platform

**Web Application**

The application must work in modern browsers.

### Target devices

* Desktop
* Laptop
* Tablet
* Mobile browser

A dedicated Android/iOS application is not part of the initial implementation.

However, the frontend must use responsive design so that the web application is usable on mobile devices.

---

# 7. Architecture Decision

## Recommended Architecture

PoshanSetu will use a simple layered full-stack architecture.

```text
                         POSHANSETU
                              |
              +---------------+---------------+
              |                               |
              v                               v
        Firebase Auth                   React Frontend
              |                               |
              +---------------+---------------+
                              |
                              v
                       Node.js + Express
                              |
                +-------------+-------------+
                |                           |
                v                           v
        Neon PostgreSQL                Cloudinary
        Application Data              File Storage
                |                           |
                |                    +------+------+
                |                    |             |
                |                    v             v
                |                  PDF/JPG/PNG   Other files
                |
                +---- Document Metadata
```

---

# 8. Why This Architecture?

This architecture is recommended because:

* React is suitable for the interactive UI.
* Node.js and Express are familiar and widely supported.
* Firebase Authentication avoids building authentication from scratch.
* Neon provides managed PostgreSQL.
* PostgreSQL is better suited than a document database for relationships such as:

  * users
  * requirements
  * support offers
  * confirmations
  * locations
  * institutions
  * notifications
* Cloudinary handles uploaded documents and media.
* The architecture separates authentication, application data, and file storage.
* The architecture can be expanded later.
* The project does not need a complex microservice architecture for the MVP.

---

# 9. Architecture Alternatives

## Option A — Firebase for Everything

### Advantages

* Very easy initial setup
* Authentication is easy
* Firebase ecosystem is integrated
* Realtime features are possible

### Disadvantages

* Firestore's document-oriented model is less natural for complex relational workflows.
* Complex relationships can become harder to manage.
* Requirement/support/confirmation relationships are better represented using PostgreSQL.
* Vendor-specific data modeling can make future migration harder.

### Decision

**Not selected as the primary database.**

Firebase will primarily handle authentication.

---

# 10. Option B — Supabase for Everything

### Advantages

* PostgreSQL
* Authentication
* Storage
* Database
* APIs
* Relational data model

### Disadvantages

* Would replace the already-selected Firebase + Neon + Cloudinary architecture.
* Less aligned with the approved architecture.
* Mixing several responsibilities into one platform is not necessary.

### Decision

**Not selected.**

---

# 11. Option C — Firebase Auth + Neon PostgreSQL + Cloudinary

### Advantages

* Firebase handles authentication.
* Neon handles relational application data.
* Cloudinary handles files/media.
* Clear separation of responsibilities.
* PostgreSQL is appropriate for PoshanSetu's relational workflows.
* Each service can be replaced independently in the future.
* Fits the approved architecture.
* Suitable for a free/free-tier MVP.

### Disadvantages

* More services need to be configured.
* Backend must securely connect these services.
* More environment variables need to be managed.

### Decision

**SELECTED**

---

# 12. Final Technology Stack

| Layer            | Technology                                     | Purpose                            |
| ---------------- | ---------------------------------------------- | ---------------------------------- |
| Frontend         | React + Vite                                   | Web interface                      |
| Styling          | Tailwind CSS                                   | Responsive UI                      |
| Routing          | React Router                                   | Page navigation                    |
| Authentication   | Firebase Authentication                        | User login/authentication          |
| Backend          | Node.js                                        | Server runtime                     |
| API framework    | Express.js                                     | REST API                           |
| Database         | Neon PostgreSQL                                | Application data                   |
| Database driver  | `pg`                                           | PostgreSQL connection              |
| File storage     | Cloudinary                                     | Documents/images/files             |
| API format       | REST/JSON                                      | Frontend-backend communication     |
| Version control  | Git + GitHub                                   | Source control                     |
| Frontend hosting | Vercel or equivalent static hosting            | React deployment                   |
| Backend hosting  | Render Free Web Service or equivalent          | Node/Express deployment            |
| AI assistance    | ChatGPT + coding agent/IDE                     | Development assistance             |
| Notifications    | PostgreSQL + application layer                 | In-app notifications               |
| Maps             | Browser/map library + verified map data source | Maharashtra/location visualization |

---

# 13. Free-Service Strategy

The project should be developed using free tiers wherever possible.

The free-tier strategy is a development constraint, not a guarantee that the application can operate indefinitely at arbitrary scale for ₹0.

Usage must be monitored.

Current official documentation indicates:

* Firebase provides a no-cost Spark plan with usage limits.
* Neon provides a Free plan.
* Cloudinary provides a Free plan.
* Render provides Free web services with important limitations such as spin-down after inactivity.
* Vercel provides free deployment options subject to its current plan limits.

Because service pricing and limits change, the official pricing pages must be checked again immediately before deployment.

---

# 14. Hosting Strategy

## Frontend

Preferred:

**Vercel**

Alternative:

**Render Static Site**

## Backend

Preferred for the approved Node.js + Express architecture:

**Render Web Service**

Render supports Node.js/Express web services and provides a Free instance option, but its free service can spin down after inactivity.

Therefore:

* The backend must not depend on persistent local files.
* Database data must be stored in Neon.
* Uploaded files must be stored in Cloudinary.
* The frontend should gracefully handle backend wake-up delays.

---

# 15. Database

## Primary Database

**Neon PostgreSQL**

PostgreSQL is selected because PoshanSetu has strong relational requirements.

Examples:

```text
User
  |
  +---- Requirement
  |
  +---- Support
  |
  +---- Notification

Institution
  |
  +---- Requirement

Requirement
  |
  +---- Support
  |
  +---- Requirement Updates
  |
  +---- Documents

Support
  |
  +---- Donor
  |
  +---- Requester
  |
  +---- Confirmation
```

---

# 16. Database Design Principles

The database must:

* Use UUIDs or secure unique identifiers.
* Use foreign keys.
* Use timestamps.
* Avoid storing duplicate information unnecessarily.
* Use indexes for common queries.
* Preserve support history.
* Preserve requirement history.
* Preserve verification results.
* Preserve fraud flags.
* Preserve document metadata.
* Never store passwords.
* Never store Firebase credentials.
* Never store secret API keys in database tables.

---

# 17. Core Database Entities

The final database schema will include at least the following conceptual entities.

## 17.1 Users

Stores application-level user information.

Suggested fields:

```text
id
firebase_uid
name
role
account_type
profile_status
location_id
created_at
updated_at
last_login_at
is_active
```

Possible roles:

```text
DONOR
REQUESTER
INSTITUTION
ADMIN
```

A single authenticated Firebase identity should map to one application user record.

---

# 17.2 Institutions

Stores registered institution information.

Suggested fields:

```text
id
user_id
institution_name
institution_type
district_id
city
address
description
verification_status
confidence_level
created_at
updated_at
```

Possible institution types:

* NGO
* Ashram Shala
* School
* Community organization
* Charitable institution
* Other approved institution types

---

# 17.3 Locations

Architecture should support:

```text
Country
  |
State
  |
District
  |
City / Locality
```

Suggested fields:

```text
id
country
state
district
city
locality
latitude
longitude
created_at
```

MVP focus:

```text
India
└── Maharashtra
    ├── District
    ├── City
    └── Locality
```

---

# 17.4 Nutrition Data

Stores government/official nutrition data.

Suggested fields:

```text
id
location_id
indicator_name
indicator_value
unit
reporting_period
source_name
source_url
source_reference
last_synced_at
data_quality_note
created_at
updated_at
```

Examples of indicators:

* Stunting
* Wasting
* Severe wasting / SAM-related indicator
* Underweight
* Other officially reported nutrition indicators

The system must not automatically translate these indicators into claims of specific micronutrient deficiencies.

---

# 17.5 Requirements

Suggested fields:

```text
id
requester_user_id
institution_id
location_id
title
description
urgency
status
submitted_at
expires_at
created_at
updated_at
```

---

# 17.6 Requirement Items

A requirement may contain multiple food items.

Suggested fields:

```text
id
requirement_id
food_item_id
quantity_required
unit
quantity_remaining
created_at
updated_at
```

Example:

```text
Requirement:
Ashram Shala requires food support

Items:
Rice - 100 kg
Dal - 50 kg
Jowar - 30 kg
```

This design is preferable to putting all food items into one text field.

---

# 17.7 Food Items

Suggested fields:

```text
id
name
category
description
active
created_at
updated_at
```

Examples:

```text
Rice
Jowar
Bajra
Ragi
Moong Dal
Chana
Other Pulses
```

---

# 17.8 Food Nutrition / Support Mapping

This table supports the "What deficiency/nutritional area can this food support?" functionality.

Suggested fields:

```text
id
food_item_id
nutrient_or_nutrition_area
evidence_description
evidence_source
source_url
confidence
created_at
updated_at
```

Important:

This table must contain evidence-based relationships only.

The system must NOT state:

```text
"Dal cures iron deficiency."
```

Instead, it may communicate carefully:

```text
"Dal is a source of protein and several micronutrients and may be useful as part of a diverse food-support strategy."
```

Any nutrient-specific claim must be supported by a reliable source.

---

# 17.9 Supports

Stores donor support offers.

Suggested fields:

```text
id
requirement_id
donor_user_id
status
message
created_at
updated_at
```

Possible statuses:

```text
OFFERED
ACCEPTED
IN_PROGRESS
DONOR_CONFIRMED
REQUESTER_CONFIRMED
COMPLETED
CANCELLED
```

---

# 17.10 Support Items

Suggested fields:

```text
id
support_id
requirement_item_id
quantity_offered
unit
quantity_confirmed
created_at
updated_at
```

This supports partial fulfillment.

---

# 17.11 Confirmations

Suggested fields:

```text
id
support_id
donor_confirmed
requester_confirmed
donor_confirmed_at
requester_confirmed_at
created_at
updated_at
```

A support cannot become fully completed unless both sides confirm.

---

# 17.12 Requirement Updates

Used for partial fulfillment and updates.

Suggested fields:

```text
id
requirement_id
updated_by
change_type
previous_value
new_value
reason
created_at
```

This creates an audit/history trail.

---

# 17.13 Notifications

Suggested fields:

```text
id
user_id
type
title
message
reference_type
reference_id
is_read
created_at
```

---

# 17.14 Documents

Only metadata should be stored in PostgreSQL.

Suggested fields:

```text
id
uploaded_by
requirement_id
institution_id
document_type
file_name
cloudinary_public_id
secure_url
mime_type
file_size
verification_status
created_at
updated_at
```

The actual file is stored in Cloudinary.

---

# 17.15 Verification Results

Suggested fields:

```text
id
target_type
target_id
check_type
result
confidence
reason
created_at
```

Examples:

```text
LOCATION_VALIDATION
DUPLICATE_CHECK
QUANTITY_SANITY
PROFILE_CONSISTENCY
DOCUMENT_CHECK
ACCOUNT_PATTERN_CHECK
```

---

# 17.16 Fraud / Risk Flags

Suggested fields:

```text
id
target_type
target_id
flag_type
severity
reason
status
created_at
resolved_at
resolved_by
```

Possible severity:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

The system should flag suspicious behavior rather than automatically declaring a person or organization fraudulent.

---

# 18. Requirement Lifecycle

Requirement states:

```text
UNDER_REVIEW
ACTIVE
PARTIALLY_SUPPORTED
FULFILLED
EXPIRED
FLAGGED
```

Lifecycle:

```text
Submit
  |
  v
Under Review
  |
  +---- Flagged
  |
  v
Active
  |
  +---- Partially Supported
  |          |
  |          v
  |       Active
  |
  v
Fulfilled
```

A requirement may also become:

```text
Expired
```

when its expiry date passes without being fulfilled.

---

# 19. Requirement Expiry

Every requirement receives an expiry date.

The requester selects urgency.

Recommended validity:

| Urgency  | Default validity |
| -------- | ---------------: |
| Critical |         2 months |
| High     |         3 months |
| Medium   |         4 months |
| Low      |         6 months |

The exact validity values can be adjusted by administrators through configuration.

The important principle is:

* Every requirement has an expiry date.
* Expiry is automatically calculated.
* The requester can see the expiry date.
* The system can display remaining validity.
* Expired requirements cannot continue appearing as active requirements.
* Requirements may be renewed according to platform rules.

The expiry system must not falsely imply that urgency represents a medical emergency.

---

# 20. "I HAVE FOOD" Feature

This is a core feature.

A donor may have food available without knowing where it is needed.

Example:

```text
I have:

Dal
Quantity: 50 kg
Location: Nashik
```

The system should help answer:

```text
Where should I donate this?
```

Flow:

```text
Donor
  |
  v
I HAVE FOOD
  |
  v
Select food
  |
  v
Enter quantity
  |
  v
Select location
  |
  v
Find matching requirements
  |
  v
Rank relevant active requirements
  |
  +-----------------------------+
  |                             |
  v                             v
Nearby requirements       Other Maharashtra
                          requirements
```

Matching factors may include:

* Food item match
* Quantity compatibility
* Requirement urgency
* Distance/location
* Requirement freshness
* Remaining quantity
* Requirement confidence
* Current active status

The system should explain why a requirement is recommended.

Example:

```text
Recommended because:

✓ The institution currently needs dal
✓ Requirement is active
✓ 35 kg remains
✓ Location is within your selected area
✓ Requirement has medium/high confidence
```

---

# 21. Food Recommendation Engine

The recommendation engine will initially be rules-based.

Machine learning is NOT required for the first implementation.

Example:

```text
IF donor_food = "dal"
AND requirement contains "dal"
AND requirement.status = ACTIVE
THEN increase match score
```

Additional factors can be used.

Example conceptual score:

```text
Match Score =
Food Match
+ Location Relevance
+ Urgency
+ Requirement Freshness
+ Remaining Quantity
+ Confidence
```

The exact weighting should be configurable.

The system must not present the score as a medical or nutritional score.

It is a:

**Donation Matching Score**

---

# 22. Broad Food Categories

The system should support broad categories such as:

* Cereals / staples
* Pulses
* Protein-rich foods
* Millets
* Diverse food support
* Other approved food categories

Specific food items can include:

* Rice
* Jowar
* Bajra
* Ragi
* Moong dal
* Chana
* Other pulses

The food catalogue should be expandable.

---

# 23. Nutrition Context

For supported food items, the application can explain relevant nutritional properties.

Example:

```text
Moong Dal

Category:
Pulse / Protein-rich food

Nutritional context:
Provides protein and other nutrients as part of a diverse diet.

Potential support:
Useful for general food and dietary support.

Evidence:
[Verified source]
```

The system must avoid:

```text
"Moong dal fixes anemia."
"Jowar cures malnutrition."
"Rice solves underweight."
```

Such statements are not acceptable.

---

# 24. Government Nutrition Data Architecture

Government nutrition information is a separate data layer.

The system should store:

```text
Indicator
Value
Location
Reporting Period
Source
Last Updated
```

Example:

```text
District: Nashik

Indicator: Wasting
Value: XX%
Reporting Period: YYYY-YYYY
Source: Official dataset
Last Sync: DD-MM-YYYY
```

If the latest available official data is old, the UI must clearly communicate that.

Example:

```text
Data reporting period:
2023–24

Last synchronized:
August 2026

Source:
Official Government Dataset
```

The platform must never call old periodic data "real-time."

---

# 25. Data Source Verification

Before implementing any government data integration:

1. Identify official source.
2. Verify dataset availability.
3. Verify licensing/access.
4. Verify update frequency.
5. Determine whether an API exists.
6. Determine whether authentication is required.
7. Determine whether the API is free.
8. Test sample data.
9. Document source.
10. Implement synchronization.

Important:

A dataset being available online does NOT automatically mean a free public API exists.

POSHAN Tracker must not be treated as having a public developer API unless this is independently verified.

---

# 26. Data Import Strategy

If a reliable free public API is available:

```text
Government API
      |
      v
Backend
      |
      v
Validation
      |
      v
Neon PostgreSQL
      |
      v
Frontend
```

If an API is not available:

```text
Official Dataset
      |
      v
Controlled Import Script
      |
      v
Validation
      |
      v
Neon PostgreSQL
```

Kaggle may be used only for:

* historical/reference information
* prototyping
* additional contextual datasets

Kaggle data must not be described as live data unless its update mechanism and source justify that claim.

---

# 27. Authentication

## Firebase Authentication

Firebase Authentication will manage identity.

Authentication is NOT required for:

* Viewing the homepage
* Exploring the map
* Searching locations
* Viewing public nutrition information
* Viewing public active requirements where permitted

Authentication is required for:

* Submitting requirements
* Responding to requirements
* "I Want to Help"
* Sending support responses
* Viewing personal dashboard
* Managing submitted requirements
* Confirming support
* Viewing protected information

---

# 28. Authentication Flow

```text
User
 |
 v
Firebase Login
 |
 v
Firebase UID
 |
 v
Backend verifies Firebase ID token
 |
 v
Backend finds application user
 |
 v
Role/permission check
 |
 v
Protected API
```

The backend must never trust a user-supplied role.

For example:

```json
{
  "role": "ADMIN"
}
```

must never be sufficient to make someone an admin.

The backend must determine the authenticated user's role from trusted server-side data.

---

# 29. Email and Mobile Verification

For the current version:

* Mandatory email verification is NOT required.
* Mandatory mobile verification is NOT required.
* OTP verification is NOT required.

These are future-scope features.

Future verification may include:

* Email verification
* Mobile OTP
* Institution email verification
* Phone verification
* Stronger identity verification

The architecture should not prevent these from being added later.

---

# 30. Institution / NGO Verification

The platform should not claim that an NGO is legally verified simply because it created an account.

Instead, verification should have levels.

Possible states:

```text
UNVERIFIED
BASIC_CHECKED
DOCUMENT_CHECKED
TRUSTED
FLAGGED
```

Automated checks may include:

* Location consistency
* Institution information consistency
* Duplicate detection
* Document metadata checks
* Account history
* Requirement behavior
* Quantity patterns

Manual admin review remains available for suspicious cases.

---

# 31. Automated Confidence System

Every requirement can receive a confidence level.

```text
HIGH CONFIDENCE
MEDIUM CONFIDENCE
LOW CONFIDENCE
FLAGGED
```

The confidence system considers multiple signals.

Examples:

```text
+ Valid location
+ Complete requirement
+ Consistent quantity
+ No duplicate detected
+ Established institution information
+ No suspicious activity
```

Negative signals:

```text
- Duplicate location
- Duplicate requirement
- Multiple suspicious accounts
- Unusual quantity
- Contradictory information
- Repeated rapid submissions
```

Important:

**Confidence is not proof of authenticity.**

The UI should communicate this clearly.

---

# 32. Fraud Detection

The system should detect suspicious patterns.

## 32.1 Duplicate Requirements

Detect:

* Same institution
* Same location
* Same food item
* Similar quantities
* Similar description
* Similar submission time

---

# 33. Multiple Account Detection

The platform must detect patterns involving multiple accounts.

Examples:

### Same institution

```text
Institution A
  |
  +-- Account 1
  +-- Account 2
  +-- Account 3
```

Potential flag:

```text
Multiple accounts appear associated with the same institution.
```

### Nearby institutions

```text
Location A
Location B
Location C
```

If multiple new accounts repeatedly submit highly similar requirements from nearby locations, the system should flag the pattern for review.

### Nearby users

Multiple accounts from nearby locations submitting:

* identical requirements
* identical quantities
* similar descriptions
* same/similar documents

should increase the risk score.

The system should not automatically declare fraud.

---

# 34. Fraud Detection Approach

The initial system will use rules rather than machine learning.

Example:

```text
IF
same institution
AND multiple accounts
AND same/similar requirements
THEN
increase risk score
```

Another example:

```text
IF
multiple accounts
AND nearby locations
AND highly similar descriptions
AND same food items
THEN
create suspicious-pattern flag
```

Future versions may use machine learning for anomaly detection.

---

# 35. Admin Safety Layer

Admin dashboard must provide:

* Flagged requirements
* Suspicious accounts
* Verification results
* Confidence scores
* Fraud/risk reasons
* Active requirements
* Institution profiles
* Basic user monitoring
* Ability to hide/remove suspicious content
* Ability to resolve flags
* Audit information

Admin actions should be logged.

---

# 36. Privacy Design

The platform should follow data minimization.

Do not expose unnecessary personal information.

Normal users:

* Name may be partially visible where appropriate.
* Personal phone number should not be publicly displayed.
* Personal email should not be publicly displayed.
* Exact personal address should not be publicly exposed unless necessary.

Institutions:

* Institution name may be public.
* General location may be public.
* Official institution details may be shown where appropriate.

Sensitive contact information should be revealed only through controlled interactions where necessary.

---

# 37. Donor Response Flow

```text
Donor views requirement
        |
        v
"I Want to Help"
        |
        v
Login
        |
        v
Support form
        |
        +------------------+
        |                  |
        v                  v
What I can give       Optional message
        |
        v
Approx quantity
        |
        v
Submit support offer
        |
        v
Requester receives notification
```

Actual donation happens outside PoshanSetu.

PoshanSetu does not process:

* payments
* financial transactions
* donation money
* online payment settlements

---

# 38. Support Fulfillment

A support becomes fulfilled only after:

```text
Donor confirms
       AND
Requester confirms
       |
       v
FULFILLED
```

If only one side confirms:

```text
Pending confirmation
```

The system must not mark the support as fulfilled based only on donor confirmation.

---

# 39. Partial Support

Example:

Requirement:

```text
100 kg rice
```

Donor:

```text
40 kg
```

After confirmation:

```text
Supported: 40 kg
Remaining: 60 kg
```

Requirement becomes:

```text
PARTIALLY_SUPPORTED
```

The support history remains preserved.

---

# 40. Multiple Donors

One requirement may have multiple donors.

Example:

```text
Requirement:
100 kg rice

Donor A:
40 kg

Donor B:
30 kg

Donor C:
30 kg

Total:
100 kg
```

After all required confirmations:

```text
FULFILLED
```

---

# 41. Donor Dashboard

The donor dashboard must include:

* Overview
* Active supports
* Pending confirmations
* Partially supported requirements
* Completed supports
* Requirements responded to
* Institution/user/location
* Food item
* Quantity offered
* Current status
* Response date
* Fulfilled history
* Notifications

Recommended UI components:

* Summary cards
* Status badges
* Progress bars
* Timeline
* Requirement cards
* Support history

Avoid dense spreadsheet-like tables where cards/timelines are more understandable.

---

# 42. Requester Dashboard

The requester dashboard must include:

* Active requirements
* Remaining quantities
* Donor responses
* Support offers
* Pending confirmations
* Partially supported requirements
* Fulfilled history
* Requirement editing
* Requirement updates
* Notifications
* Expiry information

---

# 43. Institution Dashboard

Institutions receive additional capabilities:

* Institution profile
* Requirements
* Documents
* Verification status
* Confidence information
* Support responses
* Fulfillment history
* Notifications
* Requirement updates

---

# 44. Admin Dashboard

Admin dashboard sections:

```text
Overview
|
+-- Flagged Requirements
+-- Suspicious Accounts
+-- Institutions
+-- Requirements
+-- Verification
+-- Fraud Signals
+-- Users
+-- Activity
```

The admin UI should prioritize clarity over excessive analytics.

---

# 45. Notification System

MVP notifications are in-app only.

Examples:

```text
A donor responded to your requirement.
```

```text
Your requirement has been partially supported.
```

```text
A donor marked their support as completed.
```

```text
Your confirmation is required.
```

```text
Your requirement is approaching expiry.
```

```text
Your requirement has expired.
```

Email notifications are future scope.

---

# 46. UI/UX Design Philosophy

The UI/UX should be inspired by the usability principles of Milaap.

It should NOT be a copy.

Do not copy:

* Logo
* Brand identity
* Exact colors
* Exact layout
* Images
* Text
* Copyrighted components

Instead, take inspiration from:

* Clear information hierarchy
* Human-centered storytelling
* Strong calls to action
* Trust indicators
* Simple navigation
* Social-impact presentation
* Clean cards
* Easy discovery
* Clear content

---

# 47. "Do Not Look AI-Generated" Requirement

This is an explicit product requirement.

The website should avoid visual patterns commonly associated with generic AI-generated websites.

Avoid excessive:

* Glassmorphism
* Neon gradients
* Huge glowing text
* Random decorative blobs
* Excessive rounded cards
* Excessive animations
* Generic AI illustrations
* Overuse of gradient backgrounds
* Artificial-looking dashboards
* Unnecessary futuristic graphics

Instead use:

* Human-centered imagery where appropriate
* Clean typography
* Strong hierarchy
* Natural spacing
* Professional forms
* Clear buttons
* Real-world content
* Trust indicators
* Meaningful icons
* Restrained animation

---

# 48. Homepage UX

When a user enters the website, they should immediately understand where to go.

Primary actions:

```text
I HAVE FOOD
Find where my food is needed

FIND WHERE HELP IS NEEDED
Explore locations and current requirements

I NEED FOOD SUPPORT
Submit a requirement
```

Secondary actions:

```text
Explore Maharashtra
How PoshanSetu Works
About PoshanSetu
```

---

# 49. Main User Journey

```text
                    POSHANSETU
                         |
             "What do you want to do?"
                         |
        +----------------+----------------+
        |                |                |
        v                v                v
   I HAVE FOOD     FIND WHERE HELP     I NEED FOOD
                    IS NEEDED           SUPPORT
        |                |                |
        v                v                v
   Enter food       Explore map       Submit need
   + quantity       + locations       + location
        |                |                |
        v                v                v
   Matching         District info     Verification
   requirements         |                |
        |                v                v
        v             WHY?             Active
   I WANT TO HELP       |             requirement
                         v
                       HOW?
                         |
                         v
                  Current requirements
```

---

# 50. Location Discovery UX

Users can:

* Explore Maharashtra map
* Select district
* Search district
* Search city/locality where data exists
* View current requirements
* View district nutrition information

The interface should not require users to understand nutrition terminology.

---

# 51. Location Detail Page

Order of information:

## 1. Overall District Nutrition Information

Show:

* Important indicators
* Reporting period
* Source
* Data freshness

## 2. Why Does This Location Need Attention?

Explain the data in simple language.

## 3. How Can I Help?

Show:

* Broad food categories
* Supported food items
* Current needs

## 4. Current Local Requirements

Show:

* Food
* Quantity
* Urgency
* Remaining quantity
* Status
* Confidence
* Expiry
* Institution/requester details according to privacy rules

---

# 52. API Architecture

The frontend must communicate with the backend using REST APIs.

```text
React
 |
 | HTTPS JSON
 v
Express API
 |
 +---- Firebase Admin verification
 |
 +---- Business logic
 |
 +---- Neon PostgreSQL
 |
 +---- Cloudinary
```

---

# 53. API Route Structure

Suggested API organization:

```text
/api/auth
/api/users
/api/locations
/api/nutrition
/api/food
/api/requirements
/api/requirements/:id
/api/supports
/api/notifications
/api/institutions
/api/documents
/api/verification
/api/admin
/api/matching
```

---

# 54. Public APIs

Examples:

```http
GET /api/locations
GET /api/locations/:id
GET /api/nutrition/:locationId
GET /api/requirements
GET /api/requirements/:id
GET /api/food
GET /api/matching
```

Public endpoints must expose only information that is safe to expose publicly.

---

# 55. Protected APIs

Examples:

```http
POST /api/requirements
PUT /api/requirements/:id
POST /api/supports
GET /api/dashboard/donor
GET /api/dashboard/requester
POST /api/supports/:id/confirm
POST /api/documents
```

These require Firebase authentication.

---

# 56. Admin APIs

Examples:

```http
GET /api/admin/flags
GET /api/admin/users
GET /api/admin/institutions
GET /api/admin/verification
PUT /api/admin/requirements/:id/status
PUT /api/admin/flags/:id
```

Every admin endpoint must perform server-side authorization.

---

# 57. API Validation

Every API input must be validated.

Examples:

* Required fields
* Quantity > 0
* Valid location
* Valid food item
* Valid urgency
* Valid status transition
* Valid document type
* Valid file size/type

The frontend is not sufficient for validation.

The backend must validate everything again.

---

# 58. Error Handling

The backend should return structured errors.

Example:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUIREMENT",
    "message": "Requirement quantity must be greater than zero."
  }
}
```

The frontend should show user-friendly messages.

Technical details should be logged internally but not unnecessarily exposed to users.

---

# 59. Security Architecture

## Authentication

Firebase Authentication.

## Authorization

Server-side role checks.

## Database

Neon PostgreSQL.

## File storage

Cloudinary.

## API

HTTPS.

## HTTP security

Use appropriate security headers.

Node/Express should use security middleware such as Helmet or equivalent.

## CORS

Allow only known frontend origins in production.

## Rate limiting

Apply rate limits to:

* Login-related endpoints where relevant
* Requirement creation
* Support creation
* Document upload
* Search endpoints
* Public APIs susceptible to abuse

---

# 60. Secrets Management

Never commit:

```text
.env
.env.local
service account keys
API secrets
Cloudinary secrets
database passwords
private tokens
```

to GitHub.

Use environment variables.

Example:

```text
DATABASE_URL
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Frontend Firebase configuration values should be handled according to Firebase's web SDK requirements.

Server-side secrets must never be exposed to the browser.

---

# 61. Cloudinary File Storage

Cloudinary is the selected file storage service.

The application may store:

* PDF
* JPG
* JPEG
* PNG
* Other approved file types

The actual file is stored in Cloudinary.

PostgreSQL stores only metadata.

```text
User uploads document
        |
        v
Backend validation
        |
        v
Cloudinary
        |
        v
Cloudinary URL + public ID
        |
        v
Neon PostgreSQL
```

---

# 62. File Security

Allowed file types must be restricted.

Maximum file size must be configured.

Files should be validated for:

* MIME type
* Extension
* Size
* Upload success
* Ownership

The system must not blindly trust the filename.

Sensitive documents should not be publicly exposed.

Where necessary, access should be controlled.

---

# 63. Document Types

Possible documents include:

* Institution registration document
* Supporting institution document
* Requirement-related document
* Other approved supporting files

Document type must be stored in PostgreSQL.

---

# 64. Project Structure

Recommended repository:

```text
poshansetu/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       ├── utils/
│       ├── routes/
│       ├── styles/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── db/
│   │   └── app.js
│   ├── package.json
│   └── .env
│
├── docs/
│   ├── research-PoshanSetu.md
│   ├── PRD-PoshanSetu-MVP.md
│   └── tech-design-MVP.md
│
├── .gitignore
├── README.md
└── package.json
```

---

# 65. Frontend Architecture

Frontend responsibilities:

* UI
* Navigation
* Forms
* Maps
* Search
* Dashboards
* Authentication UI
* Notifications UI
* Loading states
* Error states

Frontend must NOT directly access:

* PostgreSQL
* Cloudinary secret credentials
* Firebase Admin SDK
* Server-side secrets

---

# 66. Backend Architecture

Backend responsibilities:

* Authentication verification
* Authorization
* Business logic
* Database operations
* Requirement processing
* Matching
* Verification
* Fraud detection
* Notifications
* Cloudinary integration
* Government data synchronization
* Admin operations

---

# 67. Backend Layering

Recommended:

```text
Route
  |
  v
Controller
  |
  v
Validation
  |
  v
Service
  |
  v
Repository
  |
  v
PostgreSQL
```

This keeps business logic out of route files.

---

# 68. Matching Engine Architecture

```text
User Food
    |
    v
Normalize Food
    |
    v
Find Active Requirements
    |
    v
Filter by Food
    |
    v
Filter by Location
    |
    v
Calculate Match Score
    |
    v
Rank Results
    |
    v
Explain Match
```

---

# 69. Requirement Matching Factors

The matching engine can consider:

| Factor             | Purpose                              |
| ------------------ | ------------------------------------ |
| Food match         | Does the requirement need this food? |
| Location           | Is it nearby/relevant?               |
| Remaining quantity | Is there an unmet need?              |
| Urgency            | Is support needed sooner?            |
| Freshness          | Is requirement recent?               |
| Confidence         | How trustworthy is the requirement?  |
| Status             | Is the requirement active?           |

---

# 70. AI Features

AI is optional and controlled.

AI must not become the source of truth for nutrition facts.

## Approved AI use cases

### 1. Explanation assistance

Convert structured data into easier-to-understand language.

### 2. Requirement classification

Classify a requirement into approved categories.

### 3. Duplicate detection assistance

Compare similar requirement descriptions.

### 4. Fraud/anomaly assistance

Identify patterns for admin review.

### 5. Future RAG

A future RAG system may retrieve information from approved nutrition sources.

---

# 71. AI Data Sensitivity

AI should receive the minimum information necessary.

Do not send unnecessary:

* Phone numbers
* Emails
* Personal addresses
* Sensitive documents
* Authentication tokens

to external AI providers.

---

# 72. AI Provider Strategy

For the MVP, AI should not be required for the platform's core functionality.

This means:

```text
AI available
    |
    v
AI can enhance feature
```

but:

```text
AI unavailable
    |
    v
Platform still works
```

The core application must work using:

* PostgreSQL
* rules
* structured data
* deterministic logic

---

# 73. AI Failure Fallback

If an AI API fails:

```text
AI failure
   |
   v
Use deterministic rules
   |
   v
Show structured information
```

The platform must never show fabricated AI-generated nutrition information as fact.

---

# 74. Optional RAG Architecture

Future RAG:

```text
Verified Sources
      |
      v
Document Processing
      |
      v
Vector Store
      |
      v
Retriever
      |
      v
LLM
      |
      v
Evidence-based explanation
```

RAG is not required for the initial core functionality.

---

# 75. Testing Strategy

Testing must happen after each feature.

## Unit Testing

Test:

* Matching functions
* Validation
* Expiry calculation
* Status transitions
* Quantity calculations
* Confidence calculations
* Fraud rules

---

# 76. Integration Testing

Test:

```text
Frontend
   |
   v
Backend
   |
   v
Database
```

Examples:

* Submit requirement
* Fetch requirement
* Submit support
* Update support
* Confirm support
* Partial fulfillment

---

# 77. Authentication Testing

Test:

* Sign up
* Login
* Logout
* Invalid credentials
* Protected routes
* Public routes
* Role authorization
* Admin authorization

---

# 78. Security Testing

Test:

* Unauthorized API requests
* Invalid Firebase tokens
* Fake admin role
* SQL injection attempts
* Invalid input
* Oversized uploads
* Unsupported files
* CORS
* Rate limiting
* Sensitive information exposure

---

# 79. End-to-End Testing

Main journey:

```text
Landing Page
   ↓
Explore Location
   ↓
View Nutrition Information
   ↓
View Requirements
   ↓
Login
   ↓
I Want to Help
   ↓
Submit Support
   ↓
Requester Sees Response
   ↓
Partial Support
   ↓
Donor Confirmation
   ↓
Requester Confirmation
   ↓
Fulfilled
```

Second journey:

```text
I HAVE FOOD
   ↓
Select Dal
   ↓
Enter Quantity
   ↓
Choose Location
   ↓
Find Matching Requirements
   ↓
Select Requirement
   ↓
I Want to Help
```

Third journey:

```text
Requester
   ↓
Login
   ↓
Submit Requirement
   ↓
Automated Validation
   ↓
Confidence Assignment
   ↓
Active / Review / Flagged
```

---

# 80. UI Testing

The application must be tested on:

* Desktop
* Laptop
* Tablet
* Mobile

Test:

* Navigation
* Buttons
* Forms
* Map
* Cards
* Dashboards
* Modals
* Notifications
* Tables where used
* Responsive layout

---

# 81. Accessibility

The application should follow basic accessibility principles.

Requirements:

* Sufficient contrast
* Keyboard navigation
* Labels for forms
* Accessible buttons
* Alt text
* Clear error messages
* Focus states
* Logical heading hierarchy

---

# 82. Performance Strategy

The MVP should prioritize simplicity.

Use:

* Pagination
* Lazy loading where appropriate
* Image optimization
* Database indexes
* Limited API payloads
* Debounced search
* Caching of relatively static nutrition data

Do not introduce Redis unless actual need is demonstrated.

---

# 83. Database Indexing

Important indexes may include:

```text
requirements(status)
requirements(location_id)
requirements(expires_at)
requirements(urgency)
requirement_items(food_item_id)
supports(requirement_id)
supports(donor_user_id)
notifications(user_id, is_read)
nutrition_data(location_id)
fraud_flags(status)
```

Exact indexes should be finalized after the query patterns are implemented.

---

# 84. Caching

Potential caching:

### Browser

* Static assets
* Non-sensitive public data

### Frontend

* Public location lists
* Food catalogue

### Backend

* Government nutrition data
* Food metadata

Do not cache sensitive personalized information publicly.

---

# 85. Deployment Architecture

```text
GitHub
   |
   +---------------------+
   |                     |
   v                     v
Vercel                Render
Frontend              Node/Express
   |                     |
   |                     |
   +----------+----------+
              |
              v
        Neon PostgreSQL
              |
              |
        Cloudinary
              |
              |
       Firebase Auth
```

---

# 86. Deployment Process

## Frontend

1. Push code to GitHub.
2. Connect repository to Vercel.
3. Configure environment variables.
4. Build.
5. Deploy.
6. Test production URL.

## Backend

1. Push backend to GitHub.
2. Create Render Web Service.
3. Connect repository.
4. Configure build/start commands.
5. Add environment variables.
6. Deploy.
7. Test API.
8. Connect frontend to backend URL.

---

# 87. Environment Configuration

Development:

```text
client/.env
server/.env
```

Production:

Environment variables should be configured directly in the hosting provider.

Never commit production secrets.

---

# 88. Git Strategy

Use GitHub.

Recommended branches:

```text
main
develop
feature/*
fix/*
```

For a small MVP, a simpler approach may be:

```text
main
feature/*
```

The project owner should make a commit after each stable milestone.

Example:

```text
feat: add Firebase authentication
feat: add requirement submission
feat: add donor response flow
fix: requirement expiry calculation
```

---

# 89. Development Phases

Because the requested MVP timeline is only 2–3 days, implementation must be highly focused.

All approved P0/P1/P2 features remain part of the project scope.

However, the features should be implemented in dependency order.

---

# 90. Day 1 — Foundation

### Setup

* GitHub
* React + Vite
* Tailwind
* Node.js
* Express
* Firebase
* Neon
* Cloudinary

### Build

* Project structure
* Environment variables
* Database connection
* Firebase authentication
* Basic routing
* Basic layout
* Homepage

---

# 91. Day 2 — Core Platform

Build:

* Maharashtra location browsing
* Nutrition data display
* Requirements
* Food catalogue
* Food matching
* Requirement submission
* Automated validation
* Confidence system
* Donor support
* Requester dashboard
* Donor dashboard

---

# 92. Day 3 — Advanced Features

Build:

* Partial support
* Dual confirmation
* Expiry
* Notifications
* Admin dashboard
* Fraud detection
* Multiple-account detection
* Documents
* Cloudinary integration
* UI polish
* Mobile responsiveness
* Testing
* Deployment

---

# 93. Timeline Reality Check

A fully polished production-grade platform containing every approved P0, P1 and P2 feature cannot realistically be guaranteed in only 2–3 days by a single beginner.

The 2–3 day target should therefore be interpreted as:

**Functional MVP / prototype capable of demonstrating the complete product concept.**

The development strategy is:

```text
Core functionality first
        ↓
Working end-to-end flow
        ↓
All approved modules represented
        ↓
Advanced validation and polish
        ↓
Production hardening
```

The architecture must be designed correctly from the beginning so features can be improved after the demonstration.

---

# 94. Feature Priority

Even though all priorities are approved for development:

## P0 — Must Have

* Landing page
* Maharashtra location discovery
* Nutrition data
* Current requirements
* WHERE → WHY → HOW journey
* Food recommendations
* Food-to-location matching
* Firebase authentication
* Requirement submission
* Basic validation
* Confidence system
* Donor response
* Basic dashboards
* Core requirement lifecycle

## P1 — Should Have

* Partial support
* Dual confirmation
* Requirement expiry
* Notifications
* Institution dashboard
* Admin safety tools
* Document uploads
* Privacy controls
* Support history

## P2 — Nice to Have

* Advanced fraud detection
* Multiple-account pattern detection
* Advanced matching
* AI explanation assistance
* Future RAG foundation
* Advanced analytics
* Advanced institution confidence
* Enhanced location discovery

All P0, P1 and P2 features are approved project requirements.

---

# 95. Status Transition Rules

Valid transitions:

```text
UNDER_REVIEW → ACTIVE
UNDER_REVIEW → FLAGGED

ACTIVE → PARTIALLY_SUPPORTED
ACTIVE → FULFILLED
ACTIVE → EXPIRED
ACTIVE → FLAGGED

PARTIALLY_SUPPORTED → ACTIVE
PARTIALLY_SUPPORTED → FULFILLED
PARTIALLY_SUPPORTED → EXPIRED
PARTIALLY_SUPPORTED → FLAGGED

FLAGGED → ACTIVE
FLAGGED → EXPIRED
```

The backend must reject invalid transitions.

---

# 96. Requirement Editing

A requester may update an active requirement.

Allowed changes may include:

* Remaining quantity
* Food items
* Urgency
* Notes
* Expiry/renewal according to rules

Important:

Updates must not destroy historical information.

The system should maintain an update history.

---

# 97. Audit Trail

Important actions should be logged.

Examples:

```text
Requirement created
Requirement edited
Requirement flagged
Support created
Support quantity updated
Donor confirmed
Requester confirmed
Requirement fulfilled
Requirement expired
Admin changed status
Document uploaded
Document removed
```

Audit data should include:

```text
Who
What
When
Target
Previous value
New value
```

---

# 98. Admin Safety Principle

Automation should assist admins, not replace accountability.

The system may say:

```text
High-risk pattern detected.
```

It should not automatically say:

```text
This organization is fraudulent.
```

unless an explicit verified administrative/legal determination exists outside the automated system.

---

# 99. Data Quality Rules

The system should detect:

* Missing fields
* Invalid quantities
* Impossible values
* Duplicate submissions
* Invalid locations
* Expired requirements
* Unsupported food items
* Inconsistent institution details

---

# 100. Quantity Sanity Checks

Examples:

```text
Quantity <= 0
```

Reject.

Suspiciously large quantity:

```text
Flag for review
```

rather than automatically rejecting.

The thresholds should be configurable.

---

# 101. Location Validation

Requirement location should be validated against the supported location hierarchy.

Example:

```text
State: Maharashtra
District: Nashik
City: Nashik
```

The system should avoid storing arbitrary inconsistent spelling where possible.

Location matching should use normalized identifiers rather than only text strings.

---

# 102. Data Privacy Rules

The application must follow:

```text
Collect minimum necessary information
        ↓
Store securely
        ↓
Expose minimum necessary information
        ↓
Delete/expire unnecessary data according to policy
```

No sensitive personal information should appear in public search results unless explicitly required and appropriate.

---

# 103. Payment Architecture

No payment system is required.

PoshanSetu does not:

* Receive donations
* Process money
* Process UPI payments
* Process credit/debit cards
* Hold funds
* Transfer funds

Actual donations happen outside PoshanSetu.

---

# 104. Analytics

Basic application analytics may be added later.

Potential metrics:

* Number of active requirements
* Number of support responses
* Number of fulfilled requirements
* Food categories requested
* Location demand
* Requirement expiry rate

Analytics must not expose personal information unnecessarily.

---

# 105. Monitoring

MVP monitoring should include:

* Backend logs
* Deployment logs
* API errors
* Database errors
* Authentication failures
* Upload errors

A free monitoring service may be considered later.

Monitoring must not become a paid dependency during MVP development.

---

# 106. Backup Strategy

Database:

* Use Neon's available backup/restore capabilities according to its current plan.
* Export important demonstration data before major changes.

Files:

* Stored in Cloudinary.
* Maintain document metadata in PostgreSQL.

Source code:

* GitHub.

Documentation:

```text
docs/
```

must be committed to Git.

---

# 107. Disaster Recovery Principle

If one service fails:

### Cloudinary failure

The core application should continue to work for non-file features.

### AI failure

Core platform continues using rules.

### Government data API failure

Previously synchronized data remains visible with its reporting period.

### Backend failure

Frontend displays a user-friendly error.

### Database failure

Application should fail safely without exposing credentials or internal errors.

---

# 108. API Failure Handling

Frontend should show:

```text
We couldn't load this information right now.
Please try again.
```

not:

```text
ECONNREFUSED 5432
```

Technical error details belong in logs.

---

# 109. Loading States

Every major asynchronous operation needs a loading state.

Examples:

```text
Loading nutrition information...
Finding nearby requirements...
Submitting requirement...
Uploading document...
Checking requirement...
```

Avoid blank screens.

---

# 110. Empty States

Example:

```text
No active requirements found in this location.

Try:
- another nearby location
- another food item
- expanding your search area
```

---

# 111. Error States

Errors must be:

* Human-readable
* Actionable
* Non-technical
* Consistent

---

# 112. UI Component Strategy

Reusable components should include:

```text
Navbar
Footer
Button
Card
Badge
Modal
Input
Select
SearchBar
Map
RequirementCard
FoodCard
NutritionCard
StatusBadge
ProgressBar
Timeline
NotificationItem
DashboardCard
```

---

# 113. Design System

The UI should use a consistent design system.

Define:

* Typography
* Spacing
* Buttons
* Cards
* Form controls
* Status colors
* Icons
* Shadows
* Borders
* Responsive breakpoints

The design should feel human and trustworthy rather than futuristic.

---

# 114. Suggested Visual Direction

The final exact colors should be decided during UI implementation.

General direction:

* Warm
* Trustworthy
* Natural
* Social-impact oriented
* Clean
* Professional

Use restrained colors rather than excessive gradients.

---

# 115. Map Design

The Maharashtra map should be a major discovery tool.

Users should be able to:

* Select districts
* Search locations
* View requirement density
* View nutrition context
* Navigate to district pages

The map should not overwhelm users.

Cards/list views should also be available because some users may prefer browsing without a map.

---

# 116. Search Strategy

Search should support:

```text
District
City
Locality
Food
Requirement
```

Search should use normalized values where possible.

---

# 117. Security Threat Model

Potential threats:

### Account abuse

Mitigation:

* Firebase Authentication
* Rate limits
* suspicious activity detection

### Fake requirements

Mitigation:

* validation
* confidence scoring
* document support
* admin review
* fraud detection

### Multiple accounts

Mitigation:

* account pattern analysis
* institution matching
* location similarity
* requirement similarity

### API abuse

Mitigation:

* rate limiting
* authentication
* validation
* CORS
* security headers

### Data leakage

Mitigation:

* server-side authorization
* minimal public data
* protected documents
* no secret keys in frontend

---

# 118. API Authorization Matrix

| Action                        | Public | Authenticated | Admin |
| ----------------------------- | -----: | ------------: | ----: |
| View homepage                 |    Yes |           Yes |   Yes |
| View public locations         |    Yes |           Yes |   Yes |
| View nutrition data           |    Yes |           Yes |   Yes |
| View permitted requirements   |    Yes |           Yes |   Yes |
| Submit requirement            |     No |           Yes |   Yes |
| Respond to requirement        |     No |           Yes |   Yes |
| View own dashboard            |     No |           Yes |   Yes |
| Confirm support               |     No |           Yes |   Yes |
| Upload document               |     No |           Yes |   Yes |
| View admin flags              |     No |            No |   Yes |
| Resolve fraud flag            |     No |            No |   Yes |
| Manage suspicious requirement |     No |            No |   Yes |

---

# 119. API Security Rule

Never rely only on frontend route protection.

Bad:

```text
if (user.role === "admin") {
   showAdminPage();
}
```

This only protects the UI.

Correct:

```text
Frontend role check
        +
Backend authorization check
```

The backend is the final authority.

---

# 120. Development Tooling

Recommended:

* VS Code or Cursor
* Git
* GitHub
* Node.js
* npm
* PostgreSQL-compatible SQL
* Browser DevTools

AI assistance can be used throughout development.

---

# 121. AI Coding Workflow

Recommended workflow:

```text
Plan
  ↓
Ask AI to explain
  ↓
Implement one feature
  ↓
Run application
  ↓
Test
  ↓
Fix
  ↓
Commit
```

Do not ask the AI to modify the entire project blindly after every error.

Changes should be incremental.

---

# 122. AI Tool Responsibilities

| Task               | Suggested tool                    |
| ------------------ | --------------------------------- |
| Architecture       | ChatGPT / Claude                  |
| Code generation    | Cursor / Claude Code / equivalent |
| Debugging          | ChatGPT                           |
| Database reasoning | ChatGPT / Claude                  |
| UI ideas           | ChatGPT / Claude                  |
| Documentation      | ChatGPT                           |
| Testing assistance | AI coding assistant               |

Tool choice may change during implementation.

The project must not depend on one AI provider for runtime functionality.

---

# 123. Build Prompts

When using an AI coding assistant, prompts should include:

```text
Project context
Current architecture
Feature requirements
Existing file structure
Constraints
Expected behavior
Testing requirements
```

AI must be instructed not to:

* replace the architecture without permission
* install unnecessary dependencies
* expose secrets
* create fake data sources
* invent government APIs
* change approved product behavior

---

# 124. Dependency Strategy

Use only necessary dependencies.

Before installing a package:

1. Determine whether it is required.
2. Check maintenance/activity.
3. Check license.
4. Check compatibility.
5. Prefer established libraries.

Avoid dependency overload.

---

# 125. Environment Separation

At minimum:

```text
Development
Production
```

If possible:

```text
Development
Staging
Production
```

The MVP may start with Development + Production.

---

# 126. Documentation

The repository should contain:

```text
README.md
docs/research-PoshanSetu.md
docs/PRD-PoshanSetu-MVP.md
docs/tech-design-MVP.md
```

README must explain:

* Project purpose
* Stack
* Setup
* Environment variables
* Run commands
* Deployment
* Important architecture decisions

---

# 127. Definition of Done

A feature is complete only when:

```text
Code exists
+
Feature works
+
Error handling exists
+
Validation exists
+
Security considered
+
UI works on mobile
+
Test performed
+
Git commit created
```

---

# 128. MVP Success Criteria

The MVP is successful if a user can:

### Journey 1

```text
Open website
→ Understand purpose
→ Explore Maharashtra
→ Select location
→ See nutrition information
→ See current requirements
```

### Journey 2

```text
I HAVE FOOD
→ Select food
→ Enter quantity
→ Find matching requirements
→ Select requirement
→ Offer support
```

### Journey 3

```text
Need support
→ Create account
→ Submit requirement
→ Receive automated checks
→ Requirement becomes active/review/flagged
```

### Journey 4

```text
Donor responds
→ Requester receives notification
→ Support occurs externally
→ Donor confirms
→ Requester confirms
→ Support becomes fulfilled
```

---

# 129. Success Metrics

Initial metrics:

* Requirements successfully submitted
* Active requirements
* Support offers
* Partially supported requirements
* Fulfilled requirements
* Matching searches
* Food-to-requirement matches
* Suspicious requirements detected
* Requirements correctly expired

These metrics should be treated as product analytics, not medical outcomes.

---

# 130. Major Technical Trade-offs

## Simplicity vs scalability

The architecture prioritizes simplicity for the MVP.

Future:

```text
Monolith
  ↓
Modular monolith
  ↓
Services only when necessary
```

Do not introduce microservices prematurely.

---

# 131. Managed Services vs Custom Infrastructure

Managed services are selected because:

* Faster setup
* Less maintenance
* Better for a beginner
* Lower operational burden
* Free tiers available

Custom infrastructure is a future possibility.

---

# 132. PostgreSQL vs NoSQL

PostgreSQL is preferred because PoshanSetu has:

* Requirements
* Food items
* Support relationships
* Confirmations
* Users
* Institutions
* Locations
* Notifications
* Audit records

These relationships benefit from relational modeling.

---

# 133. Firebase Auth vs Custom Authentication

Firebase Auth is preferred.

Custom authentication would require implementing:

* Password security
* Session management
* Token handling
* Password reset
* Authentication security
* Account recovery

Firebase significantly reduces this burden.

---

# 134. Cloudinary vs Local Storage

Cloudinary is preferred.

Local filesystem storage is unsuitable because free hosting environments may use ephemeral filesystems.

Cloudinary provides dedicated media/file storage and delivery.

---

# 135. Cloudinary vs Firebase Storage

Firebase Storage is a reasonable alternative.

However, Cloudinary is selected because:

* It is specialized for media/file management.
* It has a free plan.
* It provides upload APIs.
* It supports transformations.
* It keeps file storage separate from Firebase Authentication.
* It aligns with the approved architecture.

---

# 136. Render vs Serverless Backend

Render is preferred for the initial Node.js + Express backend because:

* Express can run naturally as a web service.
* The architecture remains easy to understand.
* The backend remains a normal Node application.

Serverless can be considered later.

---

# 137. Free-Tier Risk

Free tiers may change.

The project therefore must:

* Avoid hard-coding assumptions about free limits.
* Monitor usage.
* Keep data portable.
* Avoid vendor lock-in where practical.
* Document service dependencies.

---

# 138. Future Scalability

The architecture should support:

```text
India
  |
  +-- Maharashtra
  |     +-- Districts
  |     +-- Cities
  |
  +-- Gujarat
  |
  +-- Karnataka
  |
  +-- Other States
```

Database should not hard-code Maharashtra into the core schema.

Maharashtra should be initial seed data.

---

# 139. Future Scope

Future features may include:

* India-wide expansion
* Email verification
* Mobile OTP
* Strong institution verification
* Government API integrations
* Advanced AI
* RAG
* Advanced fraud detection
* ML-based matching
* Advanced analytics
* Mobile application
* Multilingual support
* Marathi/Hindi/English
* NGO verification partnerships
* CSR dashboards
* Advanced donor profiles
* Geographic optimization
* Delivery/logistics integrations

---

# 140. Explicitly Out of Scope

The MVP does NOT process:

* Money
* Payments
* UPI
* Financial donations
* Bank transfers
* Cryptocurrency
* Actual delivery
* Logistics
* Medical diagnosis
* Medical treatment recommendations

---

# 141. Medical/Nutrition Safety Rules

PoshanSetu is not a medical diagnosis platform.

It must not claim:

```text
District X has iron deficiency
```

unless reliable data directly supports that claim.

It must not infer:

```text
High wasting = iron deficiency
```

This is scientifically inappropriate.

The platform can instead say:

```text
This district has a reported prevalence of wasting according to the referenced official data.
```

---

# 142. Nutrition Recommendation Safety

Food recommendations should be:

* Evidence-based
* Transparent
* General
* Support-oriented

They must not replace:

* Medical advice
* Dietitian advice
* Clinical treatment
* Government nutrition programs

---

# 143. Open Questions

The following questions should be finalized during implementation/research:

| Question                                                                     | Status |
| ---------------------------------------------------------------------------- | ------ |
| Which exact government dataset will be used as the primary nutrition source? | TBD    |
| Does the selected government source provide a free public API?               | TBD    |
| What exact nutrition indicators will be displayed?                           | TBD    |
| What exact food-nutrient evidence sources will be used?                      | TBD    |
| What map provider/library will be used?                                      | TBD    |
| What exact free hosting combination will be used at deployment time?         | TBD    |
| What exact AI provider will be used for optional AI features?                | TBD    |
| What exact file-size limits will be used?                                    | TBD    |
| What exact fraud thresholds will be used?                                    | TBD    |
| What exact admin verification rules will be used?                            | TBD    |
| What exact expiry durations will administrators be able to configure?        | TBD    |
| What exact analytics will be enabled?                                        | TBD    |

---

# 144. Implementation Rules for the AI Coding Assistant

The coding assistant must follow these rules:

1. Do not change the approved architecture without asking.
2. Do not replace Neon with another database without approval.
3. Do not replace Firebase Authentication without approval.
4. Do not replace Cloudinary without approval.
5. Do not create fake government APIs.
6. Do not invent government nutrition data.
7. Do not invent nutrition deficiency relationships.
8. Do not expose private user information.
9. Do not expose API secrets.
10. Do not store secrets in Git.
11. Do not process payments.
12. Do not implement medical diagnosis.
13. Do not mark support fulfilled without both confirmations.
14. Do not delete support history.
15. Do not destroy requirement history when editing.
16. Do not automatically declare a user fraudulent.
17. Flag suspicious behavior for review.
18. Maintain responsive UI.
19. Follow the Milaap-inspired human-centered UX direction.
20. Do not copy Milaap branding or copyrighted assets.
21. Avoid generic AI-generated visual design.
22. Keep the interface simple.
23. Test every feature before moving forward.
24. Prefer small incremental changes.
25. Explain major changes before implementing them.
26. Keep documentation updated.
27. Use free/free-tier services wherever possible.
28. Do not introduce unnecessary infrastructure.
29. Preserve the P0/P1/P2 feature roadmap.
30. Treat the project owner as supervisor/product owner.

---

# 145. Technical Design Verification Checklist

| Requirement                          | Status |
| ------------------------------------ | ------ |
| Platform clearly chosen              | Yes    |
| Architecture clearly chosen          | Yes    |
| Alternatives compared                | Yes    |
| Frontend specified                   | Yes    |
| Backend specified                    | Yes    |
| Database specified                   | Yes    |
| Authentication specified             | Yes    |
| File storage specified               | Yes    |
| Hosting specified                    | Yes    |
| Free-tier strategy specified         | Yes    |
| Database model specified             | Yes    |
| API architecture specified           | Yes    |
| Security strategy specified          | Yes    |
| Privacy strategy specified           | Yes    |
| Fraud strategy specified             | Yes    |
| Multiple-account detection specified | Yes    |
| Food matching specified              | Yes    |
| Nutrition safety specified           | Yes    |
| AI strategy specified                | Yes    |
| AI fallback specified                | Yes    |
| UI/UX strategy specified             | Yes    |
| Milaap-inspired direction specified  | Yes    |
| Non-AI visual requirement specified  | Yes    |
| Testing strategy specified           | Yes    |
| Deployment strategy specified        | Yes    |
| Git strategy specified               | Yes    |
| Project structure specified          | Yes    |
| P0/P1/P2 preserved                   | Yes    |
| Supervisor role specified            | Yes    |
| Open questions identified            | Yes    |

---

# 146. Critical Review

## 146.1 Does the stack match the budget?

Yes, the architecture is designed around free/free-tier services.

However, free tiers are subject to provider limits and can change.

Before deployment, current pricing and usage limits must be verified.

---

## 146.2 Does the timeline match the complexity?

The complete product is larger than a typical 2–3 day project.

Therefore:

**2–3 days = functional demonstration MVP**

not:

**2–3 days = fully hardened production platform**

The architecture allows continued development after the initial MVP.

---

## 146.3 Are there security concerns?

Yes.

The most important security areas are:

* Authentication
* Authorization
* Personal information
* Documents
* Fraudulent requirements
* Multiple accounts
* API abuse
* File uploads
* Secret management

These must be addressed during implementation.

---

# 147. Final Architecture Summary

```text
                         POSHANSETU
                              |
        +---------------------+---------------------+
        |                                           |
        v                                           v
 Firebase Authentication                       React + Vite
        |                                           |
        |                                    Tailwind CSS
        |                                           |
        +---------------------+---------------------+
                              |
                              v
                       Node.js + Express
                              |
            +-----------------+------------------+
            |                                    |
            v                                    v
     Neon PostgreSQL                        Cloudinary
            |                                    |
            |                              Documents/Files
            |
      Application Data
            |
   +--------+---------+
   |        |         |
 Users  Requirements Supports
            |
       Notifications
            |
      Fraud / Audit
```

---

# 148. Final Product Flow

```text
                         POSHANSETU
                              |
                              v
                    What do you want to do?
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
       I HAVE FOOD      FIND WHERE HELP    I NEED SUPPORT
             |             IS NEEDED              |
             v                v                    v
      Food + quantity    Maharashtra Map       Requirement
             |                |                 Submission
             v                v                    |
       Matching Engine    Location Page            v
             |                |              Automated Checks
             v                v                    |
      Matching Needs    Nutrition Context           v
             |                |               Confidence
             +--------+-------+                    |
                      |                            v
                      v                         Active /
                 I WANT TO HELP                 Review /
                      |                         Flagged
                      v
                   Login
                      |
                      v
                Support Offer
                      |
                      v
                Requester Response
                      |
                      v
              Partial / Full Support
                      |
             +--------+--------+
             |                 |
             v                 v
       Donor confirms    Requester confirms
             |                 |
             +--------+--------+
                      |
                      v
                  FULFILLED
```

---

# 149. Final Technical Decision

The approved MVP architecture is:

```text
Frontend:
React + Vite + Tailwind CSS

Authentication:
Firebase Authentication

Backend:
Node.js + Express

Database:
Neon PostgreSQL

Database Driver:
pg

File Storage:
Cloudinary

Frontend Hosting:
Vercel or equivalent free static hosting

Backend Hosting:
Render Free Web Service or equivalent free Node.js hosting

Version Control:
Git + GitHub

AI Development:
ChatGPT + AI coding assistant

Runtime AI:
Optional; core functionality must not depend on AI
```

---

# 150. Final Development Principle

PoshanSetu should be built as a real software product rather than a collection of disconnected AI-generated screens.

Every feature must connect to:

```text
User Need
    ↓
UI
    ↓
API
    ↓
Business Logic
    ↓
Database
    ↓
Result
```

The platform must prioritize:

**Trust → Clarity → Usability → Security → Correctness → Scalability**

rather than simply maximizing the number of features.

---

# 151. Maintenance

After MVP completion:

1. Review dependencies periodically.
2. Review Firebase configuration.
3. Review Neon usage.
4. Review Cloudinary usage.
5. Review hosting limits.
6. Review API keys.
7. Rotate secrets when necessary.
8. Review security vulnerabilities.
9. Review government data freshness.
10. Review nutrition evidence sources.
11. Review fraud rules.
12. Review admin activity.
13. Update documentation.
14. Keep AI coding instructions synchronized with the actual project.
15. Keep the PRD synchronized with major product decisions.
16. Review free-tier limits before every major deployment.

Stable dependencies should be preferred over unnecessary frequent upgrades.

---

# 152. Source and Service Documentation

The following official resources should be used during implementation:

* Firebase Authentication documentation
* Firebase pricing documentation
* Neon documentation and pricing
* Cloudinary documentation and pricing
* Render documentation
* Vercel documentation
* React documentation
* Vite documentation
* Express documentation
* PostgreSQL documentation

Pricing and service capabilities must be rechecked before deployment because they can change.

---

# 153. Final Handoff Context

<!-- Machine-readable summary for the next workflow step. Do not delete. -->

* Stage: techdesign
* App name: PoshanSetu
* User level: A
* User level description: Vibe-coder / AI-assisted builder; project owner supervises implementation, testing, and decisions
* Target platform: Web application
* Geographic scope: Maharashtra MVP; India expansion later
* Budget: Free only / free-tier services
* Timeline: 2–3 days for functional MVP demonstration, with continued hardening after MVP
* Primary SDGs: SDG 2 and SDG 3
* Supporting SDGs: SDG 9, SDG 10, SDG 17
* Frontend: React + Vite + Tailwind CSS
* Backend: Node.js + Express
* Database: Neon PostgreSQL
* Authentication: Firebase Authentication
* File storage: Cloudinary
* Frontend hosting: Vercel or equivalent free static hosting
* Backend hosting: Render Free Web Service or equivalent free Node.js hosting
* Database driver: pg
* API style: REST + JSON
* AI coding assistance: ChatGPT + AI coding assistant such as Cursor/Claude Code/equivalent
* Runtime AI: Optional and non-critical; deterministic fallback required
* Runtime AI use cases: explanation assistance, classification, duplicate detection assistance, anomaly/fraud assistance, future RAG
* Payments: Not included
* Email verification: Future scope
* Mobile verification: Future scope
* Email notifications: Not included in MVP
* In-app notifications: Included
* All P0 features: Approved
* All P1 features: Approved
* All P2 features: Approved
* UI/UX direction: Inspired by Milaap's human-centered usability and social-impact presentation, without copying branding, layout, assets, or content
* Visual requirement: Website must not look AI-generated
* Core user journey: WHERE → WHY → HOW CAN I HELP
* Special donor journey: I HAVE FOOD → Find where that food is currently needed
* Nutrition safety: No unsupported micronutrient deficiency claims; government indicators and local requirements remain separate
* Requirement lifecycle: Under Review → Active → Partially Supported → Fulfilled / Expired / Flagged
* Fulfillment rule: Donor confirmation AND requester confirmation required
* Fraud prevention: Automated confidence/risk checks, duplicate detection, multiple-account detection, nearby-location pattern detection, quantity sanity checks, admin safety layer
* Verification: Automated checks first; stronger institution verification can be added later
* Project owner role: Supervisor / Product Owner / Tester
* Development approach: AI-guided step-by-step implementation; project owner should not be expected to independently configure technical services
* Source files: research-PoshanSetu.md → PRD-PoshanSetu-MVP.md → tech-design-MVP.md

---

```

### A couple of important notes

I deliberately **did not put fake API keys, fake government API endpoints, or invented nutrition datasets** into the technical design. Those will be verified when we actually implement the relevant module.

Also, I kept **all P0 + P1 + P2 features** in the technical design, even though the initial 2–3 day target should be treated as a **functional demonstration MVP**, not a fully production-hardened system.

For the service choices, the current official documentation supports the core direction: Firebase has a no-cost Spark plan; Neon currently offers a Free plan; Cloudinary has a Free plan; and Render supports Node/Express web services on a Free instance with limitations such as inactivity spin-down. :contentReference[oaicite:0]{index=0}

The Firebase authentication flow is also compatible with a custom Node/Express backend: Firebase provides web authentication SDKs, and the authenticated identity can be integrated with a custom backend. :contentReference[oaicite:1]{index=1}

**This is ready to save as `tech-design-MVP.md`.**
```
