# Product Requirements Document: PoshanSetu MVP

# PoshanSetu

## Dynamic Nutrition Needs & Donation Intelligence Platform

**Document Type:** Product Requirements Document (PRD)  
**Project Name:** PoshanSetu  
**Project Type:** Web Application  
**Initial Geographic Scope:** Maharashtra, India  
**Future Geographic Scope:** India  
**Primary SDGs:** SDG 2 – Zero Hunger, SDG 3 – Good Health and Well-being  
**Supporting SDGs:** SDG 9, SDG 10, SDG 17  
**MVP Development Target:** 2–3 days  
**Implementation Model:** Guided, automation-first development  
**Document Status:** Approved  
**Version:** 1.0

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Vision](#2-project-vision)
3. [Project Mission](#3-project-mission)
4. [Problem Statement](#4-problem-statement)
5. [Proposed Solution](#5-proposed-solution)
6. [Objectives](#6-objectives)
7. [Scope](#7-scope)
8. [Out of Scope](#8-out-of-scope)
9. [Target Users](#9-target-users)
10. [User Roles](#10-user-roles)
11. [Core Product Concept](#11-core-product-concept)
12. [Core User Journey](#12-core-user-journey)
13. [Website Information Architecture](#13-website-information-architecture)
14. [UI/UX Requirements](#14-uiux-requirements)
15. [Homepage Requirements](#15-homepage-requirements)
16. [Find Needs Module](#16-find-needs-module)
17. [I Have Food Module](#17-i-have-food-module)
18. [I Need Food Support Module](#18-i-need-food-support-module)
19. [District Nutrition Intelligence](#19-district-nutrition-intelligence)
20. [Nutrition Data Principles](#20-nutrition-data-principles)
21. [Data Sources](#21-data-sources)
22. [Data Freshness and Transparency](#22-data-freshness-and-transparency)
23. [Nutrition Risk Classification](#23-nutrition-risk-classification)
24. [Current Local Requirements](#24-current-local-requirements)
25. [Requirement Submission](#25-requirement-submission)
26. [Requirement Lifecycle](#26-requirement-lifecycle)
27. [Requirement Expiry](#27-requirement-expiry)
28. [Requirement Renewal](#28-requirement-renewal)
29. [Partial Support](#29-partial-support)
30. [Multiple Donor Support](#30-multiple-donor-support)
31. [Fulfillment and Dual Confirmation](#31-fulfillment-and-dual-confirmation)
32. [Food Knowledge System](#32-food-knowledge-system)
33. [Food-to-Need Matching Engine](#33-food-to-need-matching-engine)
34. [Food Nutrient and Deficiency Context](#34-food-nutrient-and-deficiency-context)
35. [Nutrition Recommendation Safety](#35-nutrition-recommendation-safety)
36. [Authentication](#36-authentication)
37. [User Registration](#37-user-registration)
38. [Institution Registration](#38-institution-registration)
39. [Institution Verification](#39-institution-verification)
40. [Automated Verification](#40-automated-verification)
41. [Fraud and Abuse Detection](#41-fraud-and-abuse-detection)
42. [Privacy Requirements](#42-privacy-requirements)
43. [Donor Response Flow](#43-donor-response-flow)
44. [Donor Dashboard](#44-donor-dashboard)
45. [Requester Dashboard](#45-requester-dashboard)
46. [Institution Dashboard](#46-institution-dashboard)
47. [Admin Dashboard](#47-admin-dashboard)
48. [Notification System](#48-notification-system)
49. [Document Management](#49-document-management)
50. [File Storage Architecture](#50-file-storage-architecture)
51. [Application Architecture](#51-application-architecture)
52. [Technology Stack](#52-technology-stack)
53. [Database Architecture](#53-database-architecture)
54. [Core Database Entities](#54-core-database-entities)
55. [API Architecture](#55-api-architecture)
56. [Security Architecture](#56-security-architecture)
57. [Authentication and Authorization](#57-authentication-and-authorization)
58. [Environment Variables and Secrets](#58-environment-variables-and-secrets)
59. [Data Validation](#59-data-validation)
60. [Audit Logging](#60-audit-logging)
61. [AI Architecture](#61-ai-architecture)
62. [RAG Architecture](#62-rag-architecture)
63. [AI Safety Rules](#63-ai-safety-rules)
64. [P0/P1/P2 Feature Strategy](#64-p0p1p2-feature-strategy)
65. [MVP Development Strategy](#65-mvp-development-strategy)
66. [Guided Implementation Model](#66-guided-implementation-model)
67. [Deployment Architecture](#67-deployment-architecture)
68. [Free-Tier Strategy](#68-free-tier-strategy)
69. [Error Handling](#69-error-handling)
70. [Testing Requirements](#70-testing-requirements)
71. [Performance Requirements](#71-performance-requirements)
72. [Accessibility Requirements](#72-accessibility-requirements)
73. [Responsive Design](#73-responsive-design)
74. [SEO Requirements](#74-seo-requirements)
75. [Analytics and Monitoring](#75-analytics-and-monitoring)
76. [Important User Scenarios](#76-important-user-scenarios)
77. [Demo Scenarios](#77-demo-scenarios)
78. [Success Criteria](#78-success-criteria)
79. [Future Scope](#79-future-scope)
80. [Risks and Mitigation](#80-risks-and-mitigation)
81. [Project Principles](#81-project-principles)
82. [Final Product Definition](#82-final-product-definition)
83. [Final Architecture Diagram](#83-final-architecture-diagram)
84. [Final Product Flow](#84-final-product-flow)
85. [Implementation Checklist](#85-implementation-checklist)

---

# 1. Executive Summary

PoshanSetu is a web-based **Dynamic Nutrition Needs & Donation Intelligence Platform** initially focused on Maharashtra.

The platform is designed to bridge the gap between:

- people or organizations that have food available for donation, and
- institutions or communities that currently require food support.

The platform helps users answer three fundamental questions:

> **WHERE can I help?**

> **WHY is help needed there?**

> **HOW can I help?**

PoshanSetu combines two separate information layers:

### Layer A — Official Nutrition Information

Government-published and other reliable nutrition datasets are used to provide district-level nutrition context.

### Layer B — Current Local Requirements

Users and institutions can submit current requirements such as:

- Rice
- Wheat
- Jowar
- Bajra
- Ragi
- Moong Dal
- Chana
- Other appropriate food items

These requirements are subject to automated validation and confidence checks.

The system then matches donor food availability with current requirements.

PoshanSetu does **not**:

- process monetary donations,
- process payments,
- physically handle donations,
- transport food,
- diagnose nutritional deficiencies,
- prescribe medical treatment.

Actual food donation/support takes place outside PoshanSetu.

---

# 2. Project Vision

> **To create a trusted digital bridge between food availability and genuine local food needs, enabling people to make more informed, targeted and meaningful food-support decisions.**

The long-term vision is to evolve PoshanSetu from a Maharashtra-focused platform into a scalable India-wide nutrition-support intelligence platform.

---

# 3. Project Mission

The mission of PoshanSetu is to make food support:

- more targeted,
- more transparent,
- more evidence-based,
- more accessible,
- more location-aware,
- more need-driven,
- more privacy-conscious.

Instead of generic donation:

> "I want to donate something."

PoshanSetu should help transform the intention into:

> "I have this food, and here is where it is currently needed."

---

# 4. Problem Statement

Food donation is frequently supply-driven.

A donor may have:

> 50 kg Moong Dal

but may not know:

- Where it is needed.
- Which institution needs it.
- How much is still required.
- How urgent the requirement is.
- Whether the requirement is still active.
- Whether the requester is an institution.
- Whether the institution has provided supporting documents.
- Whether the food is relevant to the requirement.
- How the food contributes nutritionally.

At the same time, institutions such as Ashram Shalas, NGOs, schools and charitable organizations may have genuine requirements but lack a centralized mechanism for communicating these needs to relevant donors.

Traditional donation platforms may primarily focus on:

- fundraising,
- monetary donations,
- campaign discovery.

PoshanSetu focuses on:

> **Food need discovery + nutrition context + food matching + requirement fulfillment.**

---

# 5. Proposed Solution

PoshanSetu provides a platform where users can:

1. Explore Maharashtra.
2. Search districts and locations.
3. View district-level nutrition context.
4. Understand why a location may require attention.
5. View current local food requirements.
6. Search requirements by food.
7. Enter food they already have.
8. Find matching requirements.
9. Understand nutritional contributions of relevant foods.
10. Respond to requirements.
11. Track support offers.
12. Handle partial fulfillment.
13. Confirm completed support.
14. Detect expired requirements.
15. Submit and manage requirements.
16. Perform automated verification.
17. Detect potentially fraudulent patterns.
18. Protect private user information.

---

# 6. Objectives

## 6.1 Primary Objectives

- Improve discovery of food-support needs.
- Connect donors with current requirements.
- Provide transparent nutrition context.
- Enable institutions to communicate their needs.
- Enable food-to-need matching.
- Reduce irrelevant donations.
- Support partial fulfillment.
- Maintain support history.
- Improve trust through automated validation.
- Detect suspicious requirements.
- Protect sensitive user information.

## 6.2 Secondary Objectives

- Demonstrate practical use of technology for SDG 2 and SDG 3.
- Provide an expandable architecture for India.
- Demonstrate responsible AI usage.
- Demonstrate automation without depending on manual intervention for every requirement.

---

# 7. Scope

## 7.1 MVP Geographic Scope

Maharashtra.

The platform should initially support:

- Maharashtra
- Districts
- Cities/locations where feasible
- Local requirements

## 7.2 Future Scope

The architecture should support:

```text
India
  |
  +-- State
        |
        +-- District
              |
              +-- City
                    |
                    +-- Locality
````

---

# 8. Out of Scope

PoshanSetu will not:

* process donations through a payment gateway,
* collect donation money,
* hold donor money,
* physically transport food,
* guarantee the legitimacy of every requester,
* provide medical diagnosis,
* prescribe treatment,
* claim that a general malnutrition indicator proves a specific micronutrient deficiency,
* replace professional nutritionists or healthcare workers.

---

# 9. Target Users

## 9.1 Donors

Individuals, organizations, CSR teams, charitable groups and other entities that have food available.

Example:

> "I have 100 kg rice. Where should I donate it?"

## 9.2 Normal Users

Users who want to:

* donate food,
* submit requirements,
* respond to requirements.

## 9.3 Institutions

Examples:

* NGOs
* Ashram Shalas
* Schools
* Charitable institutions
* Community organizations
* Other eligible institutions

## 9.4 Admin

Responsible for:

* moderation,
* verification,
* fraud monitoring,
* food knowledge management,
* data management,
* system monitoring.

---

# 10. User Roles

## Public User

Can:

* browse the platform,
* view public nutrition information,
* view public requirements,
* search locations,
* explore food guidance.

## Registered User

Can:

* submit requirements,
* respond to requirements,
* offer support,
* manage own requirements,
* view dashboard,
* receive notifications.

## Institution User

Can additionally:

* manage institution profile,
* submit documents,
* manage institution requirements,
* receive institution verification status.

## Admin

Can:

* moderate requirements,
* review flags,
* review institutions,
* manage food knowledge,
* manage nutrition datasets,
* inspect audit records,
* take administrative action.

---

# 11. Core Product Concept

PoshanSetu is built around:

```text
WHERE → WHY → HOW
```

## WHERE

Where is help needed?

Implemented through:

* Maharashtra map,
* district browsing,
* location search,
* requirement search.

## WHY

Why does this location need attention?

Implemented through:

* official nutrition indicators,
* reporting period,
* data sources,
* transparent methodology.

## HOW

How can the user help?

Implemented through:

* food recommendations,
* food-to-need matching,
* current requirements,
* donor response.

---

# 12. Core User Journey

The primary donor journey is:

```text
Homepage
   ↓
Explore / Search
   ↓
Select Location
   ↓
Nutrition Overview
   ↓
Why Attention Is Needed
   ↓
Current Local Requirements
   ↓
How Can I Help?
   ↓
Food Matching
   ↓
Requirement Details
   ↓
I Want to Help
   ↓
Login
   ↓
Support Offer
   ↓
Donation Happens Outside Platform
   ↓
Donor Confirmation
   ↓
Requester Confirmation
   ↓
Fulfilled / Partially Supported
```

---

# 13. Website Information Architecture

The primary navigation should contain:

```text
Home
Find Needs
I Have Food
How It Works
Data & Methodology
Login / Register
```

After authentication:

```text
Dashboard
My Requirements
My Supports
Notifications
Profile
```

Admin users additionally see:

```text
Admin Dashboard
Requirements
Flags
Institutions
Documents
Nutrition Data
Food Knowledge
Audit Logs
```

---

# 14. UI/UX Requirements

The UI/UX should be inspired by the usability and human-centered nature of platforms such as Milaap.

The design must be original and must not copy:

* branding,
* logos,
* exact layouts,
* proprietary graphics,
* exact wording,
* copyrighted assets.

The goal is to capture the general qualities:

* trustworthy,
* human,
* social-impact focused,
* simple,
* content-driven,
* approachable.

## 14.1 The website must not look AI-generated

Avoid:

* excessive gradients,
* glassmorphism,
* excessive rounded cards,
* neon colors,
* excessive animations,
* generic AI illustrations,
* excessive chatbot-like interfaces,
* "AI-powered" labels everywhere,
* overly futuristic SaaS aesthetics.

AI should mostly operate behind the scenes.

---

# 15. Homepage Requirements

The homepage should immediately answer:

> What is PoshanSetu?

And:

> What can I do here?

Three primary actions should be prominent.

## Action 1

### I Have Food to Donate

Description:

> Tell us what food you have and find current requirements that may need it.

## Action 2

### Find Where Help Is Needed

Description:

> Explore locations and discover current food requirements.

## Action 3

### I Need Food Support

Description:

> Submit a requirement for yourself or your institution.

---

# 16. Find Needs Module

Users can discover requirements through:

## 16.1 Map

Interactive Maharashtra map.

Users can:

* select district,
* view district information,
* see requirement indicators,
* open requirements.

## 16.2 Search

Search by:

* district,
* city,
* location,
* food,
* institution,
* requirement.

## 16.3 Filters

Filters may include:

* Food type
* District
* City
* Urgency
* Requirement status
* Institution type
* Verification status
* Remaining quantity
* Expiry

---

# 17. I Have Food Module

This module answers:

> "I already have food. Where can I donate it?"

User enters:

* Food item
* Quantity
* Unit
* Location

Example:

```text
Food: Moong Dal
Quantity: 50 kg
Location: Nashik
```

The system finds compatible active requirements.

---

# 18. I Need Food Support Module

The user selects:

> Individual

or

> Institution

Then provides the required information.

The system performs automated validation before activating the requirement.

---

# 19. District Nutrition Intelligence

Each district should have a dedicated nutrition information page.

Example:

```text
Nashik District

Overall Nutrition Risk
----------------------
Higher Attention

Why?
----------------------
Indicator 1
Indicator 2
Indicator 3

Current Local Needs
----------------------
Rice
Dal
Jowar

How Can I Help?
----------------------
View Requirements
```

---

# 20. Nutrition Data Principles

The platform must clearly distinguish:

### General nutrition indicators

Examples:

* Stunting
* Wasting
* Underweight
* SAM
* MAM

from:

### Specific micronutrient deficiencies

Examples:

* Iron deficiency
* Vitamin A deficiency
* Zinc deficiency
* Iodine deficiency
* Folate deficiency

A general indicator must not be presented as direct proof of a specific deficiency.

For example, PoshanSetu must never state:

> "High stunting means the district has iron deficiency."

unless a reliable source specifically establishes that relationship.

---

# 21. Data Sources

Priority order:

## Tier 1 — Official Government Sources

Preferred sources include:

* Government of India
* Maharashtra Government
* Ministry of Health & Family Welfare
* Ministry of Women & Child Development
* Official government datasets
* Official government reports

Relevant sources may include datasets associated with:

* NFHS
* POSHAN Tracker
* ICDS
* Other official nutrition programs/data systems

However:

> The existence of a government system does not automatically mean a free public developer API exists.

Every API/dataset must be verified before implementation.

## Tier 2 — Recognized Institutions

Potentially:

* WHO
* UNICEF
* World Bank
* Other recognized organizations.

## Tier 3 — Secondary Sources

Potentially:

* Academic datasets
* Research papers
* Kaggle

Kaggle data must not be called "live" unless its source and update process justify that claim.

---

# 22. Data Freshness and Transparency

Every nutrition indicator should show:

* Value
* Unit
* Source
* Reporting period
* Last system synchronization
* Data status

Example:

```text
Indicator: Stunting
Value: XX%

Reporting Period: 2019–2021
Source: Official Government Dataset
Last Synced: 19 August 2026
```

If data is old:

> The platform should explicitly say so.

Do not label old periodic data as real-time.

---

# 23. Nutrition Risk Classification

The platform may provide:

* Lower Attention
* Moderate Attention
* Higher Attention

or equivalent categories.

The classification must use a documented methodology.

It must not be a mysterious AI-generated score.

Users should be able to click:

> "How is this determined?"

and see the methodology.

---

# 24. Missing Data

If a district does not have sufficient data:

```text
Data unavailable
```

must be shown.

The system must never silently convert missing values to:

```text
0
```

or:

```text
No risk
```

---

# 25. Current Local Requirements

Current requirements are separate from official district nutrition data.

A requirement represents:

> A current request for food/support submitted by a user or institution.

Examples:

```text
100 kg Rice
50 kg Moong Dal
25 kg Chana
```

---

# 26. Requirement Submission

Required information may include:

* Requester name
* Requester type
* Institution name if applicable
* Location
* District
* Address/location details
* Number of beneficiaries
* Food items
* Quantity
* Unit
* Urgency
* Description
* Expiry date

Optional:

* Supporting documents
* Additional notes
* Preferred support details

---

# 27. Requirement Lifecycle

The complete lifecycle is:

```text
Under Review
     ↓
Active
     ↓
Partially Supported
     ↓
Fulfilled
```

Alternative paths:

```text
Under Review
     ↓
Flagged
```

or:

```text
Active
     ↓
Expired
```

---

# 28. Requirement Expiry

Every requirement receives an expiry date.

Urgency is used to suggest an expiry date.

The validity system must be configurable rather than hard-coded permanently.

The system should support longer validity periods than the original one-month design.

The requester sees:

> Suggested expiry date

and can select an appropriate date within configured limits.

---

# 29. Requirement Renewal

Expired requirements remain in history.

A requester can choose:

> Renew Requirement

A renewal should create a new requirement cycle rather than destroying historical information.

Example:

```text
Requirement #101
100 kg Rice
     ↓
Expired
     ↓
Renew
     ↓
Requirement #142
60 kg Rice
```

---

# 30. Partial Support

Example:

```text
Original Requirement:
100 kg Rice

Donor Support:
40 kg

Remaining:
60 kg
```

Status:

> Partially Supported

The requester can update:

* Remaining quantity
* Remaining items
* Urgency
* Additional notes

---

# 31. Multiple Donor Support

One requirement may receive support from multiple donors.

Example:

```text
Requirement = 100 kg

Donor A = 20 kg
Donor B = 30 kg
Donor C = 50 kg

Total = 100 kg
```

The system should prevent over-support beyond the remaining requirement unless explicitly allowed by business rules.

---

# 32. Fulfillment and Dual Confirmation

A support is considered fulfilled only when:

```text
Donor confirms completion
        +
Requester confirms receipt
        ↓
Fulfilled
```

If only one side confirms:

```text
Pending Confirmation
```

This prevents one-sided claims.

---

# 33. Food Knowledge System

The platform maintains a curated food knowledge base.

Each food can contain:

* Food name
* Category
* Nutrients
* Dietary role
* Relevant evidence
* Recommendation rules
* Source

Examples:

* Rice
* Jowar
* Bajra
* Ragi
* Moong Dal
* Chana

---

# 34. Food Nutrient and Deficiency Context

The platform should answer:

> "What nutrients does this food contribute?"

Example:

### Moong Dal

Potential information:

* Protein
* Iron
* Folate
* Other relevant nutrients

The wording must remain scientifically responsible.

Use:

> "Contributes to dietary iron intake."

Not:

> "Cures iron deficiency."

---

# 35. Food Categories

Broad categories:

* Cereals/staples
* Pulses
* Protein-rich foods
* Diverse food support
* Other evidence-based categories

The system can display both:

### Broad category

> Pulses / protein-rich foods

and:

### Specific item

> Moong Dal

---

# 36. Food Recommendation Safety

The system must not:

* diagnose deficiencies,
* prescribe diets for medical conditions,
* claim a food treats disease,
* invent nutrient information,
* infer specific micronutrient deficiencies from general malnutrition indicators.

All recommendations must be based on:

* approved data,
* explicit rules,
* reliable sources.

---

# 37. Authentication

Firebase Authentication is used.

Public browsing does not require authentication.

Authentication is required for:

* submitting requirements,
* responding to requirements,
* sending support offers,
* viewing private dashboard information,
* managing requirements,
* controlled contact.

---

# 38. User Registration

MVP should support a simple registration flow.

Potential account information:

* Name
* Username/display name
* Account type
* Basic profile information

Email/mobile verification is **not mandatory for the current MVP**.

---

# 39. Future Authentication Scope

Future enhancements:

* Email verification
* Mobile OTP
* Stronger identity verification
* Institutional identity verification

---

# 40. Institution Registration

Institutions can provide:

* Institution name
* Institution type
* Location
* District
* Address
* Description
* Beneficiary information
* Registration information
* Supporting documents

---

# 41. Institution Verification

Verification states:

```text
Verification Pending
Verified
Limited Confidence
Flagged
```

Verification does not mean:

> "Guaranteed genuine."

It means:

> "The available verification checks have passed to the configured confidence level."

---

# 42. Automated Verification

The system should automatically perform:

* Location validation
* Duplicate detection
* Account consistency checks
* Quantity sanity checks
* Institution information consistency
* Document metadata checks
* Requirement similarity checks

---

# 43. Verification Confidence

Possible levels:

### High Confidence

Automated checks show strong consistency.

### Medium Confidence

Some checks pass, but additional uncertainty exists.

### Low Confidence / Flagged

Potential problems detected.

Important:

> Confidence is not proof of authenticity.

---

# 44. Fraud and Abuse Detection

The system should detect suspicious patterns.

## 44.1 Duplicate Requirements

Compare:

* Institution
* Location
* Food
* Quantity
* Description
* Beneficiary count
* Submission timing

## 44.2 Multiple Accounts

Detect multiple accounts submitting requirements for:

* the same institution,
* the same location,
* nearby institutions,
* closely related requirements.

## 44.3 Nearby Location Abuse

Detect suspicious clusters of similar requests from nearby locations.

## 44.4 Quantity Anomalies

Example:

```text
10 beneficiaries
5,000 kg rice
```

may require review.

The system should flag rather than automatically accuse.

## 44.5 Repeated Suspicious Activity

Monitor:

* repeated duplicate submissions,
* repeated cancellations,
* unusual support behavior,
* repeated requirement manipulation,
* conflicting confirmations.

---

# 45. Fraud Decision Principle

The system must never automatically claim:

> "This person is fraudulent."

Instead:

> "Potentially suspicious activity detected."

The admin can investigate.

---

# 46. Privacy Requirements

Sensitive information must not be publicly exposed.

Potentially protected:

* Personal contact information
* Private addresses
* Identity documents
* Institution documents
* Fraud signals
* Internal verification notes

---

# 47. Controlled Contact

When a donor selects:

> I Want to Help

the donor logs in.

The donor can:

* send a response through PoshanSetu,
* provide approximate donation quantity,
* provide optional message,
* provide contact details if appropriate.

Actual donation occurs outside the platform.

---

# 48. Donor Response Flow

```text
Requirement
   ↓
I Want to Help
   ↓
Login
   ↓
Offer Support
   ↓
Food Item
   ↓
Quantity
   ↓
Message
   ↓
Submit
   ↓
Requester receives offer
```

---

# 49. Donor Dashboard

The dashboard should contain:

## Overview

* Active supports
* Pending confirmations
* Partially supported
* Completed supports

## Support History

* Food
* Quantity
* Requirement
* Institution/user
* Location
* Date
* Status

## Notifications

* New updates
* Confirmation requests
* Status changes

---

# 50. Requester Dashboard

The requester should see:

* Active requirements
* Remaining quantity
* Support offers
* Donors who responded
* Pending confirmations
* Partially supported requirements
* Fulfilled history
* Expiring requirements
* Notifications

---

# 51. Institution Dashboard

Include:

* Institution profile
* Verification status
* Documents
* Active requirements
* Support offers
* Remaining quantities
* Requirement updates
* Fulfillment history
* Notifications

---

# 52. Admin Dashboard

The admin dashboard is mandatory for MVP.

## Overview

* Active requirements
* Pending verification
* Flagged requirements
* Expiring requirements
* Institution status

## Requirement Management

Admin can:

* view,
* flag,
* hide,
* restore,
* inspect,
* monitor.

## Institution Management

Admin can:

* view institution,
* inspect documents,
* review verification,
* change verification state.

## Fraud Management

Admin can:

* view fraud signals,
* inspect related requirements,
* inspect account relationships,
* take action.

## Nutrition Data

Admin can:

* view datasets,
* inspect source,
* update data,
* track reporting period.

## Food Knowledge

Admin can manage:

* food,
* nutrients,
* evidence,
* recommendation rules.

---

# 53. Notification System

MVP uses in-app notifications.

No email notification is required.

Examples:

```text
Your requirement is now active.

A donor has offered 40 kg Moong Dal.

Your requirement has 60 kg remaining.

Confirmation required.

Your requirement expires soon.

Your requirement has expired.

Your institution verification status has changed.
```

---

# 54. Document Management

Supported document types:

* PDF
* JPG/JPEG
* PNG

Documents may include:

* NGO registration documents,
* institution certificates,
* authorization documents,
* other appropriate evidence.

Documents must be access-controlled.

---

# 55. File Storage Architecture

Approved architecture:

```text
React Frontend
      |
      v
Node.js + Express
      |
      v
Cloudinary
      |
      +---- PDF
      +---- JPG/JPEG
      +---- PNG
```

PostgreSQL stores metadata/reference.

---

# 56. Document Metadata

Store:

* document ID,
* institution ID,
* document type,
* Cloudinary reference,
* verification status,
* verification notes,
* upload date,
* verification date.

The database should not be used as the primary binary file store.

---

# 57. Application Architecture

```text
                    POSHANSETU
                         |
              +----------+----------+
              |                     |
          Firebase Auth         React Frontend
              |                     |
              +----------+----------+
                         |
                         v
                  Node.js + Express
                         |
             +-----------+-----------+
             |                       |
             v                       v
       Neon PostgreSQL          Cloudinary
       Application Data         File Storage
             |                       |
             |                 +-----+------+
             |                 |            |
             |              PDF/JPG/PNG   Other Files
             |
             +---- Document Metadata
```

---

# 58. Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS

## Backend

* Node.js
* Express.js

## Database

* PostgreSQL
* Neon

## Authentication

* Firebase Authentication

## File Storage

* Cloudinary

## Source Control

* Git
* GitHub

## AI

AI APIs/services may be integrated only where they provide meaningful value and fit the free-tier constraint.

---

# 59. Database Architecture

Core tables/entities should include:

```text
users
institutions
institution_documents
locations
nutrition_data
foods
food_nutrients
food_recommendations
requirements
requirement_items
support_offers
support_confirmations
requirement_updates
notifications
verification_checks
fraud_flags
audit_logs
```

Additional tables may be added as implementation requires.

---

# 60. Core Database Entities

## users

Stores:

* User ID
* Display name
* Account type
* Firebase UID
* Created date
* Updated date
* Status

## institutions

Stores:

* Institution ID
* Owner/user ID
* Institution name
* Institution type
* Location
* Verification status
* Created date

## requirements

Stores:

* Requirement ID
* Requester ID
* Institution ID if applicable
* Location
* Status
* Urgency
* Beneficiary count
* Description
* Expiry
* Created date
* Updated date

## requirement_items

Stores:

* Requirement item ID
* Requirement ID
* Food ID
* Quantity
* Unit
* Remaining quantity

## support_offers

Stores:

* Offer ID
* Donor ID
* Requirement ID
* Quantity
* Message
* Status
* Created date

## notifications

Stores:

* Notification ID
* User ID
* Type
* Message
* Read status
* Created date

---

# 61. Database Integrity

The system must enforce:

* valid foreign keys,
* non-negative quantities,
* valid statuses,
* valid relationships,
* unique identifiers,
* timestamps,
* appropriate constraints.

---

# 62. API Architecture

Frontend communicates with backend through REST APIs.

Example API groups:

```text
/auth
/users
/locations
/nutrition
/foods
/requirements
/support
/notifications
/institutions
/documents
/admin
```

---

# 63. Example Requirement APIs

```text
POST   /api/requirements
GET    /api/requirements
GET    /api/requirements/:id
PATCH  /api/requirements/:id
POST   /api/requirements/:id/renew
```

---

# 64. Example Support APIs

```text
POST   /api/requirements/:id/support
GET    /api/supports
PATCH  /api/supports/:id
POST   /api/supports/:id/confirm
```

---

# 65. Security Architecture

The backend must perform:

* Authentication verification
* Authorization
* Input validation
* SQL parameterization
* File validation
* Rate limiting
* Error handling
* CORS configuration
* Secret management

---

# 66. Authentication and Authorization

Authentication determines:

> Who are you?

Authorization determines:

> What are you allowed to do?

Example:

A normal donor should not be able to access:

```text
/admin/users
```

Even if they manually enter the URL.

---

# 67. Environment Variables and Secrets

Secrets must never be committed to GitHub.

Example:

```env
DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

The actual secret values must be stored locally or in deployment environment variables.

---

# 68. `.gitignore`

The project must ignore:

```text
.env
.env.local
node_modules/
dist/
```

and other sensitive/build-specific files.

---

# 69. Data Validation

Every user input must be validated.

Examples:

### Quantity

Must be:

```text
> 0
```

### Beneficiaries

Must be:

```text
>= 0
```

### Expiry

Must be a future date when creating a new requirement.

### Food

Must correspond to an approved food item where required.

---

# 70. Audit Logging

Important events should be recorded.

Examples:

```text
Requirement created
Requirement updated
Requirement flagged
Requirement approved
Support offered
Support confirmed
Requirement fulfilled
Institution verified
Institution flagged
Admin action performed
```

Audit logs should contain:

* user,
* action,
* record,
* timestamp,
* relevant old/new values where appropriate.

---

# 71. AI Architecture

AI is an assistance layer.

Potential applications:

## 71.1 Requirement Understanding

Convert natural-language input into structured fields.

## 71.2 Duplicate Detection

Identify semantically similar requirements.

## 71.3 Explanation Generation

Generate understandable explanations from approved facts.

## 71.4 Fraud Pattern Assistance

Identify suspicious patterns.

## 71.5 Search Assistance

Allow natural-language queries such as:

> "Find institutions near Nashik needing pulses."

---

# 72. RAG Architecture

RAG is optional and should only be implemented if genuinely useful.

Potential knowledge sources:

* Official nutrition guidance
* Government documents
* Approved food composition data
* Official methodology documents

Basic flow:

```text
User Question
      ↓
Retrieve Approved Sources
      ↓
Relevant Evidence
      ↓
LLM
      ↓
Grounded Explanation
```

The model must not be allowed to invent nutrition information.

---

# 73. AI Safety Rules

AI must never independently:

* diagnose deficiency,
* diagnose disease,
* accuse users of fraud,
* claim guaranteed authenticity,
* prescribe treatment,
* invent sources,
* invent nutrition values.

AI should:

> Assist → Explain → Flag

rather than:

> Decide everything.

---

# 74. P0/P1/P2 Feature Strategy

All P0, P1 and P2 features are intended to be built.

The classification represents:

> **Priority of implementation**

not:

> **Whether the feature will ever be built.**

---

# 75. P0 — Must Have

Core product functionality:

1. Landing page
2. Navigation
3. Maharashtra location browsing
4. Search
5. District nutrition information
6. Current local requirements
7. WHERE → WHY → HOW journey
8. Food categories
9. Food information
10. Food-to-need matching
11. Firebase authentication
12. User registration
13. Requirement submission
14. Requirement validation
15. Donor response
16. Basic dashboards
17. Requirement statuses
18. Expiry
19. Partial support
20. Dual confirmation
21. Basic notifications
22. Admin dashboard
23. Basic privacy/security
24. Source transparency

---

# 76. P1 — Should Have

Advanced operational functionality:

1. Institution profiles
2. Institution verification
3. Document upload
4. Cloudinary integration
5. Automated verification
6. Duplicate detection
7. Multiple-account detection
8. Nearby-location detection
9. Fraud flags
10. Support history
11. Requirement renewal
12. Advanced dashboards
13. Detailed notifications
14. Audit logs
15. Food knowledge base
16. Detailed nutrition explanations
17. Advanced filters
18. Support tracking
19. Confidence levels
20. Administrative moderation

---

# 77. P2 — Nice to Have

Advanced intelligence and scalability:

1. RAG
2. AI-powered natural-language search
3. Semantic requirement matching
4. Advanced duplicate detection
5. Advanced fraud analytics
6. Predictive requirement analysis
7. Demand forecasting
8. Advanced analytics
9. Pan-India expansion
10. Advanced identity verification
11. Email notifications
12. Mobile OTP
13. External registry integrations
14. Advanced donor impact reports

---

# 78. MVP Development Strategy

Although all features are intended to be built eventually, development should follow a layered approach.

## Day 1 — Foundation

Build:

* Project setup
* React
* Tailwind
* Firebase
* Express
* Neon
* Database
* Basic navigation
* Homepage
* Authentication
* Requirement creation

## Day 2 — Core Workflow

Build:

* Location browsing
* Nutrition data
* Requirement listing
* Food knowledge
* Matching
* Donor flow
* Requester dashboard
* Partial support
* Fulfillment
* Expiry

## Day 3 — Intelligence and Polish

Build:

* Institution verification
* Documents
* Cloudinary
* Duplicate detection
* Fraud flags
* Admin dashboard
* Notifications
* Nutrition explanations
* UI refinement
* Testing
* Deployment

---

# 79. Guided Implementation Model

The project owner is not expected to independently configure infrastructure.

Implementation will follow:

```text
Step 1:
Explain what is required.

Step 2:
Explain why it is required.

Step 3:
Tell the user exactly where to create it.

Step 4:
Tell the user exactly what option to select.

Step 5:
Tell the user exactly where to find credentials.

Step 6:
Tell the user where to place credentials.

Step 7:
Provide exact code/commands.

Step 8:
Tell the user what output to expect.

Step 9:
Debug if the output differs.

Step 10:
Proceed to next step.
```

The project owner primarily acts as:

> Supervisor + Tester + Decision Maker.

---

# 80. Deployment Architecture

```text
                         GitHub
                           |
                  +--------+--------+
                  |                 |
                  v                 v
               Vercel            Render
             React App       Node + Express
                  |                 |
                  |         +-------+-------+
                  |         |               |
                  |         v               v
                  |       Neon          Cloudinary
                  |    PostgreSQL       File Storage
                  |
                  v
              Firebase
            Authentication
```

---

# 81. Free-Tier Strategy

The project should use free-tier services wherever feasible.

Target services:

* Firebase
* Neon
* Cloudinary
* Vercel
* Render or equivalent
* GitHub
* Free/open datasets

Important:

> Free-tier availability and limits can change.

Therefore, infrastructure should be reviewed during implementation.

The project must not depend on a paid service if a suitable free alternative exists.

---

# 82. Error Handling

The system should provide clear user-facing errors.

Instead of:

```text
500 Internal Server Error
```

show:

> Something went wrong while submitting your requirement. Please try again.

Developers should still receive detailed server-side logs.

---

# 83. Performance Requirements

The system should:

* minimize unnecessary API calls,
* paginate large requirement lists,
* optimize images,
* cache appropriate public data,
* avoid loading unnecessary data,
* use database indexes,
* avoid expensive queries on every page load.

---

# 84. Accessibility Requirements

The interface should support:

* readable typography,
* adequate contrast,
* keyboard navigation where practical,
* descriptive labels,
* accessible form errors,
* meaningful button labels,
* screen-reader-friendly structure where feasible.

---

# 85. Responsive Design

The website must work on:

* desktop,
* laptop,
* tablet,
* mobile.

Mobile layout is especially important because users may access the platform through phones.

---

# 86. SEO Requirements

Public pages should have:

* meaningful page titles,
* meta descriptions,
* semantic HTML,
* clean URLs,
* descriptive headings.

Examples:

```text
/district/nashik
/requirements
/requirements/123
/foods/moong-dal
```

---

# 87. Analytics and Monitoring

The system should eventually track non-sensitive aggregate metrics such as:

* Requirement submissions
* Active requirements
* Fulfilled requirements
* Food categories
* District activity
* Support offers
* Platform usage

Do not collect unnecessary personal information.

---

# 88. Important User Scenario 1 — Donor Has Dal

User has:

> 50 kg Moong Dal

They select:

> **I Have Food**

Enter:

```text
Food: Moong Dal
Quantity: 50 kg
Location: Nashik
```

The system finds:

```text
Requirement A
Moong Dal
60 kg remaining
High urgency
Verified institution
Nashik
```

User selects:

> I Want to Help

Logs in.

Offers:

> 50 kg

Donation occurs outside PoshanSetu.

Both sides confirm.

Requirement becomes:

> Partially Supported / Fulfilled

depending on remaining quantity.

---

# 89. Important User Scenario 2 — User Wants to Find Need

User selects:

> Find Where Help Is Needed

Then:

```text
Maharashtra
   ↓
Nashik
   ↓
Nutrition Information
   ↓
Why attention?
   ↓
Current Requirements
```

The user can then choose a requirement.

---

# 90. Important User Scenario 3 — Institution Needs Rice

Institution submits:

```text
Food: Rice
Quantity: 100 kg
Beneficiaries: 120
Urgency: High
Location: Nashik
```

System performs checks.

If acceptable:

> Active

If suspicious:

> Flagged / Under Review

---

# 91. Important User Scenario 4 — Duplicate Account

Two accounts submit:

```text
Same institution
Similar location
Same food
Similar quantity
Similar description
```

The system detects a potential duplicate.

Admin sees:

> Possible duplicate requirement.

Admin investigates.

---

# 92. Important User Scenario 5 — Partial Fulfillment

Requirement:

```text
100 kg rice
```

Donor A:

```text
40 kg
```

Both confirm.

Remaining:

```text
60 kg
```

Status:

> Partially Supported

Donor B can later provide:

```text
60 kg
```

After both confirm:

> Fulfilled

---

# 93. Important User Scenario 6 — Expired Requirement

Requirement reaches expiry.

System:

```text
Active
 ↓
Expired
```

The requirement disappears from active matching.

Requester receives an in-app notification.

Requester may renew.

---

# 94. Important User Scenario 7 — Food Recommendation

User views:

> Moong Dal

System shows:

### Category

Pulses

### Nutritional contribution

Protein, iron, folate and other relevant nutrients.

### Dietary role

Contributes to dietary adequacy as part of a diverse diet.

### Evidence

Approved source.

### Disclaimer

This information does not constitute diagnosis or treatment of nutritional deficiencies.

---

# 95. Demo Scenario 1 — Complete Donor Journey

```text
Homepage
 ↓
I Have Food
 ↓
Moong Dal
 ↓
50 kg
 ↓
Nashik
 ↓
Matching Requirement
 ↓
Requirement Details
 ↓
I Want to Help
 ↓
Login
 ↓
Offer Support
 ↓
Requester Receives Offer
 ↓
Offline Donation
 ↓
Donor Confirmation
 ↓
Requester Confirmation
 ↓
Fulfilled
```

This should be the primary demonstration.

---

# 96. Demo Scenario 2 — Nutrition Intelligence

```text
Maharashtra
 ↓
Nashik
 ↓
Nutrition Overview
 ↓
Indicator
 ↓
Reporting Period
 ↓
Source
 ↓
Why Attention?
 ↓
Food Guidance
 ↓
Current Requirements
```

This demonstrates the intelligence component.

---

# 97. Demo Scenario 3 — Fraud Detection

Create similar requirements.

System flags:

> Possible duplicate.

Admin opens the flag.

Admin sees:

* Similar requirements
* Accounts
* Location
* Quantity
* Verification signals
* Supporting documents
* History

Admin decides action.

---

# 98. Success Criteria

## User Experience

A first-time visitor should understand the primary purpose and available modules within approximately:

> **10 seconds**

## Donor Discovery

A donor should reach relevant requirements within approximately:

> **3–5 meaningful interactions**

## Requirement Lifecycle

A valid requirement must be capable of completing:

```text
Submission
 ↓
Validation
 ↓
Active
 ↓
Support
 ↓
Confirmation
 ↓
Fulfilled
```

without manual database modification.

## Data Transparency

100% of displayed official nutrition indicators should show:

* source,
* reporting period,
* last synchronization information.

## Security

Protected API endpoints must require:

* authentication,
* authorization.

## History

Requirement and support history must remain traceable.

## Deployment

MVP should operate using free-tier infrastructure.

---

# 99. Future Scope

## Authentication

* Email verification
* Mobile OTP
* Strong identity verification

## Geographic Expansion

* Maharashtra
* Other states
* India-wide coverage

## AI

* Advanced RAG
* Natural-language search
* Semantic matching
* Advanced fraud analytics
* Predictive demand analysis

## Verification

* Government registry integration
* NGO database verification
* Advanced institutional verification

## Communication

* Email
* SMS
* WhatsApp integrations where appropriate

## Analytics

* Donor impact reports
* District trends
* Fulfillment trends
* Food demand forecasting

---

# 100. Risks and Mitigation

## Risk 1 — Outdated Government Data

### Problem

Official data may not be recent.

### Mitigation

Always show:

* reporting period,
* source,
* last sync.

Never claim real-time.

---

## Risk 2 — Incorrect Deficiency Interpretation

### Problem

Users may assume general malnutrition indicators prove micronutrient deficiencies.

### Mitigation

Clearly separate:

* general nutrition indicators,
* micronutrient deficiency evidence.

Use responsible wording.

---

## Risk 3 — Fake Requirements

### Problem

Users may submit fraudulent requirements.

### Mitigation

* Automated validation
* Duplicate detection
* Confidence levels
* Institution documents
* Fraud flags
* Admin review

---

## Risk 4 — Multiple Accounts

### Problem

One institution may create multiple accounts.

### Mitigation

Detect:

* similar institution information,
* same/nearby locations,
* similar requirements,
* repeated patterns.

---

## Risk 5 — Malicious Use

### Problem

A platform connecting donors and organizations can potentially be abused.

### Mitigation

* No monetary transactions
* No anonymous public contact
* Controlled communication
* Verification
* Audit logs
* Fraud detection
* Admin moderation

---

## Risk 6 — Free-Tier Limits

### Problem

Free services have quotas.

### Mitigation

* Optimize storage
* Limit file sizes
* Cache data
* Paginate
* Avoid unnecessary API calls
* Maintain alternative architecture options

---

## Risk 7 — AI Hallucinations

### Problem

AI may generate incorrect nutrition information.

### Mitigation

* Curated knowledge base
* RAG where appropriate
* Source grounding
* Rule-based matching
* AI restrictions

---

# 101. Project Principles

## Principle 1 — Transparency

Users should know where information comes from.

## Principle 2 — Separation of Data Layers

Official nutrition data and current requirements must remain separate.

## Principle 3 — Evidence First

Nutrition recommendations must be evidence-backed.

## Principle 4 — AI with Responsibility

AI assists rather than invents.

## Principle 5 — Privacy by Design

Collect and reveal only necessary information.

## Principle 6 — Automation First

Automate routine validation and matching.

## Principle 7 — Human Safety Layer

Admins handle uncertain cases.

## Principle 8 — User First

Technology should simplify the user's task.

## Principle 9 — Free-Tier First

The MVP should not require paid infrastructure.

## Principle 10 — History Matters

Important changes should remain traceable.

---

# 102. Final Product Definition

> **PoshanSetu is a web-based nutrition needs and donation intelligence platform that connects food availability with current local requirements while providing transparent nutrition context and evidence-based food guidance. It separates official nutrition information from user-submitted needs, enables location-based discovery and food-to-need matching, supports users and institutions in submitting and managing requirements, provides automated validation and fraud detection, protects sensitive information, maintains support history, and facilitates confirmation-based fulfillment. PoshanSetu does not process monetary donations, physically handle food donations, diagnose nutritional deficiencies, or replace professional healthcare or nutrition services.**

---

# 103. Final Architecture Diagram

```text
                           POSHANSETU
                               |
               +---------------+---------------+
               |                               |
        Firebase Authentication          React + Vite
               |                               |
               +---------------+---------------+
                               |
                               v
                       Node.js + Express
                               |
               +---------------+---------------+
               |                               |
               v                               v
       Neon PostgreSQL                    Cloudinary
       Application Data                  File Storage
               |                               |
               |                       +-------+-------+
               |                       |               |
               |                    PDF/JPG/PNG    Other Files
               |
               +---------- Document Metadata
```

---

# 104. Final Product Flow

```text
                         POSHANSETU
                             |
             +---------------+---------------+
             |               |               |
             v               v               v
      I HAVE FOOD       FIND NEEDS      I NEED FOOD
             |               |               |
             v               v               v
         Matching        Map/Search      Requirement
             |               |               |
             +-------+-------+-------+-------+
                     |               |
                     v               v
                 Nutrition       Current Need
                   Context           |
                     |               |
                     +-------+-------+
                             |
                             v
                        HOW TO HELP
                             |
                             v
                       I WANT TO HELP
                             |
                             v
                           Login
                             |
                             v
                       Support Offer
                             |
                             v
                    Offline Donation
                             |
                  +----------+----------+
                  |                     |
                  v                     v
           Donor Confirms       Requester Confirms
                  |                     |
                  +----------+----------+
                             |
                             v
                  Fulfilled / Partial
```

---

# 105. Implementation Checklist

## Phase 1 — Project Setup

* [ ] Install Node.js
* [ ] Install VS Code
* [ ] Create project folder
* [ ] Initialize Git
* [ ] Create GitHub repository
* [ ] Create React/Vite application
* [ ] Configure Tailwind CSS
* [ ] Create `.gitignore`
* [ ] Create `.env`

## Phase 2 — Firebase

* [ ] Create Firebase project
* [ ] Configure Authentication
* [ ] Configure required providers
* [ ] Create frontend Firebase configuration
* [ ] Configure backend Firebase Admin SDK
* [ ] Test authentication

## Phase 3 — Neon

* [ ] Create Neon account
* [ ] Create PostgreSQL project
* [ ] Obtain database connection string
* [ ] Configure `DATABASE_URL`
* [ ] Create schema
* [ ] Test database connection

## Phase 4 — Backend

* [ ] Initialize Node.js
* [ ] Install Express
* [ ] Configure middleware
* [ ] Configure authentication middleware
* [ ] Configure database connection
* [ ] Create API structure
* [ ] Implement error handling
* [ ] Implement validation

## Phase 5 — Frontend

* [ ] Build layout
* [ ] Build navbar
* [ ] Build homepage
* [ ] Build search
* [ ] Build map/location interface
* [ ] Build requirement listing
* [ ] Build requirement detail page

## Phase 6 — Nutrition

* [ ] Identify reliable datasets
* [ ] Verify licensing/access
* [ ] Import data
* [ ] Build nutrition data model
* [ ] Build district page
* [ ] Add reporting period
* [ ] Add source information
* [ ] Add methodology

## Phase 7 — Food Intelligence

* [ ] Create food database
* [ ] Add nutrient information
* [ ] Add evidence sources
* [ ] Create food categories
* [ ] Create recommendation rules
* [ ] Build food search
* [ ] Build food-to-need matching

## Phase 8 — Requirements

* [ ] Requirement creation
* [ ] Validation
* [ ] Status system
* [ ] Expiry
* [ ] Renewal
* [ ] Partial support
* [ ] Requirement updates

## Phase 9 — Donor Flow

* [ ] Support offer
* [ ] Donor dashboard
* [ ] Requester dashboard
* [ ] Confirmation
* [ ] Fulfillment history

## Phase 10 — Institutions

* [ ] Institution registration
* [ ] Institution profile
* [ ] Documents
* [ ] Verification
* [ ] Confidence level

## Phase 11 — Cloudinary

* [ ] Create Cloudinary account
* [ ] Configure credentials
* [ ] Implement upload
* [ ] Validate file type
* [ ] Validate file size
* [ ] Store metadata in PostgreSQL

## Phase 12 — Fraud Detection

* [ ] Duplicate detection
* [ ] Multiple-account detection
* [ ] Nearby-location detection
* [ ] Quantity sanity checks
* [ ] Fraud flags
* [ ] Admin review

## Phase 13 — Admin

* [ ] Admin authentication
* [ ] Admin dashboard
* [ ] Requirement moderation
* [ ] Institution verification
* [ ] Fraud monitoring
* [ ] Food management
* [ ] Nutrition data management
* [ ] Audit logs

## Phase 14 — Notifications

* [ ] Notification model
* [ ] In-app notifications
* [ ] Read/unread state
* [ ] Requirement notifications
* [ ] Support notifications
* [ ] Verification notifications

## Phase 15 — AI

* [ ] Evaluate AI requirements
* [ ] Implement only useful AI
* [ ] Build grounded explanations
* [ ] Duplicate semantic matching
* [ ] Optional RAG
* [ ] Apply AI safety rules

## Phase 16 — Testing

* [ ] Authentication tests
* [ ] Requirement tests
* [ ] Support tests
* [ ] Partial fulfillment tests
* [ ] Expiry tests
* [ ] Authorization tests
* [ ] File upload tests
* [ ] Fraud detection tests
* [ ] Mobile testing
* [ ] Error testing

## Phase 17 — Deployment

* [ ] Deploy frontend
* [ ] Deploy backend
* [ ] Configure Neon
* [ ] Configure Firebase
* [ ] Configure Cloudinary
* [ ] Configure production environment variables
* [ ] Test production APIs
* [ ] Test authentication
* [ ] Test complete donor workflow

## Phase 18 — Final Demo

* [ ] Donor scenario
* [ ] Nutrition scenario
* [ ] Institution scenario
* [ ] Partial fulfillment scenario
* [ ] Fraud detection scenario
* [ ] Admin scenario
* [ ] Mobile demonstration
* [ ] Final UI polish

---

# 106. Final Demonstration Story

The ideal final presentation should tell this story:

> A person wants to donate food but does not know where it is needed.

They open PoshanSetu.

Instead of being overwhelmed by technology, the homepage immediately gives them three choices:

> **I Have Food**
> **Find Where Help Is Needed**
> **I Need Food Support**

The donor selects:

> **I Have Food**

They enter:

> **50 kg Moong Dal**

and their location.

PoshanSetu searches current requirements.

It finds an institution in need.

The donor can see:

* the location,
* requirement,
* remaining quantity,
* urgency,
* beneficiary count,
* institution status,
* supporting information,
* nutrition context.

The donor selects:

> **I Want to Help**

They log in and send a support offer.

The actual donation happens outside PoshanSetu.

The donor confirms the support.

The institution confirms receipt.

The requirement is updated.

If only part of the requirement was fulfilled, the remaining requirement stays active.

At the same time, PoshanSetu provides district-level nutrition information separately from the current requirement.

The system also continuously checks for:

* duplicates,
* suspicious accounts,
* suspicious locations,
* unusual quantities,
* potentially fraudulent patterns.

The admin can investigate flagged cases.

Therefore, PoshanSetu is not merely a:

> "food donation website."

It is a:

> **Nutrition Needs + Food Matching + Requirement Intelligence + Verification + Donation Coordination Platform.**

---

# 107. Final Product Philosophy

PoshanSetu should feel like a genuine social-impact platform rather than a technology demonstration.

The user should not think:

> "This website is showing me AI."

The user should think:

> **"This website understands what I am trying to do and helps me do it."**

The technology remains behind the experience.

The product's primary value is:

```text
Food Available
      +
Current Local Need
      +
Nutrition Context
      +
Evidence
      +
Matching
      +
Verification
      =
More Informed Support
```

---

# 108. Final Guiding Principle

> **PoshanSetu should make it easier for the right food to reach the right need at the right time, while being transparent about what the data can—and cannot—tell us.**

---

# END OF PRD

```
```
