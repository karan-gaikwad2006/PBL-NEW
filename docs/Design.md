Absolutely. Below is a **detailed `design.md`** specifically written as a design brief for Google Stitch.

I’ve based the UX inspiration on the broad patterns visible on [Milaap's platform](https://give.milaap.org/?utm_source=chatgpt.com): clear action-oriented entry points, human-centered cards/stories, strong trust signals, simple multi-step journeys, search/discovery, and approachable rather than overly corporate layouts. The goal is **not to copy Milaap**, but to make PoshanSetu feel similarly trustworthy, practical, and human. ([Milaap][1])

Copy everything below into **`design.md`**.

````md
# PoshanSetu — UI/UX Design Specification

## 1. Project Overview

### Project Name
**PoshanSetu**

### Tagline
**Find where help is needed. Understand why. Know how to help.**

### Product Type
A web-based Nutrition Needs and Donation Intelligence Platform.

### Primary Purpose

PoshanSetu helps people and organizations make more informed food-support decisions.

A person may have food available to donate but may not know:

- Where help is currently needed
- Which locations need greater attention
- Why a location needs attention
- What food items are currently required
- Which institution or requester can benefit from their available food

The platform connects:

**People who want to help**
with
**Locations and institutions that currently need food support**

The platform does NOT process payments or donations.

The actual donation happens outside PoshanSetu.

---

# 2. Core Design Philosophy

The website must feel:

- Human
- Trustworthy
- Warm
- Practical
- Indian
- Community-focused
- Modern
- Clean
- Easy to understand
- Purpose-driven

The design should NOT look like a generic AI-generated SaaS dashboard.

Avoid:

- Excessive gradients
- Neon colors
- Glassmorphism everywhere
- Floating futuristic cards
- Too many rounded pills
- Overuse of icons
- Huge empty areas
- Random decorative blobs
- Generic AI illustrations
- Overly technical dashboards
- A cold corporate appearance

Instead, create a polished, believable social-impact platform.

The visual feeling should be similar to a professionally designed Indian social-impact platform:

- Clear calls to action
- Human-centered content
- Strong hierarchy
- Easy navigation
- Trust and transparency
- Storytelling through information
- Cards that represent real needs
- Useful information visible immediately

The user should understand the purpose of PoshanSetu within the first few seconds of opening the website.

---

# 3. Primary User Types

The design must support five major user types:

1. Donors
2. Normal users submitting requirements
3. Institutions
   - Ashram Shalas
   - Schools
   - NGOs
   - Charitable organizations
4. Admin
5. Public visitors

Public visitors should be able to explore nutrition information and current requirements without logging in.

Login is required when a user wants to:

- Respond to a requirement
- Click "I Want to Help"
- Submit a requirement
- Manage their dashboard
- Confirm support
- Access private interactions

---

# 4. The Most Important UX Rule

When a user enters PoshanSetu, they should immediately know which path applies to them.

The homepage must prominently answer:

### "What do you want to do?"

Show three primary paths:

#### A. I Want to Help
For donors and people who have food/items available.

Example:
"I have food or resources and want to find where they can help."

Primary CTA:
**Find Where to Help**

---

#### B. Find Current Needs
For people who want to browse active requirements.

Example:
"Explore locations and institutions currently requesting support."

Primary CTA:
**Explore Needs**

---

#### C. Submit a Requirement
For users and institutions that need support.

Example:
"Tell the community what food or items are currently required."

Primary CTA:
**Submit a Requirement**

These options must be immediately understandable.

Do not force the user to first understand the entire platform.

Guide them through their purpose.

---

# 5. Brand Colors

The primary color palette is fixed.

## Primary Dark Color

### Deep Slate Blue
`#304355`

Use for:

- Primary buttons
- Header/navigation
- Important headings
- Navigation active states
- Major dashboard elements
- Strong borders where required
- Important icons
- Footer background
- Primary data visualizations

This color should communicate:

- Trust
- Stability
- Reliability
- Intelligence
- Seriousness

---

## Primary Light Color

### Warm Off-White
`#E8E8E2`

Use for:

- Main page backgrounds
- Large content areas
- Secondary surfaces
- Soft cards
- Section backgrounds

This should prevent the platform from feeling like a typical pure-white SaaS application.

The website should have a warm, calm, grounded appearance.

---

## Supporting Neutral Colors

Use neutral shades derived naturally from the primary palette.

### Main Text
Very dark slate, almost black.

Suggested direction:
`#1F2933`

### Secondary Text
Muted slate-gray.

Suggested direction:
`#64707A`

### White
`#FFFFFF`

Use primarily for:

- Cards placed over darker or colored sections
- Forms
- Modals
- Content surfaces requiring contrast

Do not use pure white excessively as the entire page background.

---

# 6. Semantic Status Colors

Use semantic colors carefully.

Do not allow status colors to dominate the design.

### Critical
Red

Used for:
- Critical urgency
- Expiring very soon
- Serious flagged issues

### High
Orange

Used for:
- High urgency

### Medium
Warm amber or yellow

Used for:
- Medium urgency

### Low
Muted blue or soft green

Used for:
- Lower urgency

### Active / Positive
Green

Used for:
- Verified/high confidence
- Completed support
- Fulfilled requirements

### Flagged
Red or dark warning tone.

---

# 7. Typography

Use a modern, highly readable sans-serif font.

Preferred direction:

- Inter
- Manrope
- DM Sans

The typography should feel professional and human.

Avoid:

- Overly futuristic fonts
- Decorative fonts
- Very thin font weights
- Excessive use of all caps

### Heading Style

Headings should be:

- Strong
- Clear
- Slightly bold
- Easy to scan

Example:

# Find where your help can make a difference.

Subheading:

Explore nutrition information and current local needs to make more informed food-support decisions.

---

# 8. Overall Layout System

Use a responsive layout.

### Desktop

Content maximum width:
Approximately 1200–1280px.

Do not stretch content excessively across large screens.

Use:

- Clear grid structure
- Comfortable whitespace
- Consistent alignment
- Strong content hierarchy

### Tablet

Reorganize multi-column sections intelligently.

### Mobile

Mobile-first usability is extremely important.

On mobile:

- Navigation should be simplified
- Cards stack vertically
- Maps remain usable
- Primary CTAs remain visible
- Forms use single-column layouts
- Tables should become cards or horizontally scroll only when absolutely necessary

---

# 9. Navigation Design

## Public Navigation

Logo:
**PoshanSetu**

Navigation links:

- Home
- Explore Needs
- Nutrition Insights
- How It Works

Right side:

- Login
- Sign Up

Primary navigation CTA:

**I Want to Help**

The CTA should use `#304355`.

---

## Logged-In Navigation

Depending on the user:

- Explore
- My Dashboard
- Notifications
- Profile

For donors:
Dashboard = Donor Dashboard

For requesters:
Dashboard = My Requirements

For institutions:
Dashboard = Institution Dashboard

For admins:
Dashboard = Admin Panel

---

# 10. Homepage Design

## Goal

Within five seconds, a new visitor should understand:

1. What PoshanSetu does
2. What they can do
3. Where to click next

---

## Section 1 — Header

Simple, compact, trustworthy.

Left:
PoshanSetu logo

Center/right:
Navigation links

Right:
Login
Primary CTA

Do not make the header excessively tall.

---

## Section 2 — Hero

This is the most important section.

### Main Headline

**Your food can help. Find where it is needed most.**

Alternative supporting line:

**Explore local nutrition needs, discover current food requirements, and make your support more informed.**

The hero must contain a prominent search/discovery interaction.

### Main Search Component

Large search bar:

**Search a district, city, or location**

Placeholder examples:

- Search Nashik
- Search Pune
- Search Nagpur

Next to or below search:

**Explore Maharashtra Map**

The hero should also visually show Maharashtra or an abstract geographic/community-related visual.

Do not use generic AI people holding hands.

Prefer:

- Maharashtra map visualization
- Subtle location markers
- Food-related visual context
- Community support imagery
- Realistic editorial-style photography only if appropriate

---

## Section 3 — Choose Your Purpose

Heading:

# How would you like to use PoshanSetu?

Three large cards.

### Card 1

Icon:
Helping hand or food package

Title:
**I Want to Help**

Description:
I have food or resources and want to find where they are needed.

CTA:
**Find Where to Help →**

---

### Card 2

Icon:
Map/location

Title:
**Explore Current Needs**

Description:
See active food requirements and locations that currently need support.

CTA:
**Explore Needs →**

---

### Card 3

Icon:
Clipboard or request

Title:
**Submit a Requirement**

Description:
Tell the community what food or items your institution or community currently needs.

CTA:
**Submit Requirement →**

Cards should be clearly clickable.

Use subtle hover elevation.

Do not make them look like generic dashboard widgets.

---

# 11. "Where → Why → How" Journey

This is the central PoshanSetu experience.

Display a visually clear three-step section.

## Step 1

### WHERE

**Find locations that need attention**

Explore Maharashtra through:

- Interactive map
- Search
- District browsing

---

## Step 2

### WHY

**Understand the situation**

See:

- District-level nutrition risk information
- Available official indicators
- Reporting period
- Data source
- Last sync information

Important:

Do not imply that district malnutrition indicators diagnose specific micronutrient deficiencies.

---

## Step 3

### HOW CAN I HELP?

**Discover useful support options**

See:

- Broad food categories
- Current local requirements
- Suggested support guidance
- Specific active institutions/users requesting items

The visual flow should make this journey extremely obvious.

Use connecting lines/arrows subtly.

---

# 12. Interactive Maharashtra Map Page

Route example:

`/explore`

This is one of the major pages.

## Layout

### Top

Breadcrumb:
Home / Explore Maharashtra

Heading:

# Explore nutrition needs across Maharashtra

Subtext:

Select a district to understand available nutrition information and discover current local requirements.

Search bar:
Search district or city

---

## Main Area

Large interactive Maharashtra map.

Districts should visually represent available nutrition risk levels.

Use a clear legend.

Example:

- Higher Attention
- Moderate Attention
- Lower Attention
- Data Limited / Not Available

Do not make the map visually confusing.

Clicking a district opens:

- District summary
- Current requirements
- Navigation to district detail page

---

## Side Panel on Desktop

When a district is selected:

### Nashik

**Overall Nutrition Attention Level**
Moderate Attention

Small explanation:

Based on available official district-level indicators. This is not a medical diagnosis.

Data source card:

Source: Official Government Dataset
Reporting Period: [period]
Last Synced: [date]

Buttons:

**View District Details**

**View Current Needs**

---

# 13. District Detail Page

Route example:

`/locations/maharashtra/nashik`

This page follows the exact required order.

## Section 1

# Overall District Nutrition Risk

Large summary card.

Show:

- District name
- Overall attention level
- Important available indicators
- Data reporting period

Include a transparent disclaimer:

"District-level nutrition indicators describe population-level conditions and should not be interpreted as diagnosis of individual or specific micronutrient deficiencies."

---

## Section 2

# Why does this location need attention?

Use easy-to-understand explanation cards.

For example:

### Nutrition Indicators

Show available indicators such as:

- Stunting
- Wasting
- Underweight
- SAM/MAM where available

Each indicator should have:

- Value
- Label
- Reporting period
- Source

Avoid alarming visuals.

The goal is clarity, not fear.

---

## Section 3

# How can I help?

Split into two layers.

### A. Broad Support Categories

Cards:

- Cereals and Staples
- Pulses and Protein-Rich Foods
- Diverse Food Support
- Other Evidence-Based Support

Each card explains generally how the category may contribute to nutritional support.

Do not make unsupported medical claims.

---

### B. Current Local Requirements

Show actual requirements in cards.

Example:

#### Ashram Shala, Nashik

Currently Needed:
Rice, Moong Dal, Chana

Beneficiaries:
120 students

Urgency:
High

Remaining Need:
60 kg rice

Trust:
High Confidence

CTA:

**View Requirement**

or

**I Want to Help**

---

# 14. "I Have This Food — Where Should I Donate It?" Feature

This is an important PoshanSetu feature.

The platform must help a donor who already knows what item they have.

## Entry Point

Prominent component on homepage and Explore page.

Heading:

# What do you have to offer?

Subheading:

Tell us what food you have, and we'll show active requirements where it may be useful.

Input:

**What do you have?**

Example suggestions:

- Dal
- Rice
- Jowar
- Bajra
- Ragi
- Chana
- Moong Dal

Quantity field:

Example:
`50`

Unit:
kg

Location preference:

- Near me
- Select district
- Anywhere in Maharashtra

Button:

**Find Matching Needs**

---

## Results Page

Heading:

# Places currently looking for Dal

Show ranked matching requirements.

Each result includes:

- Institution/requester
- Location
- Requested item
- Quantity remaining
- Urgency
- Number of beneficiaries where appropriate
- Confidence level
- Distance/location relevance when available

Example card:

### Ashram Shala — Nashik

Needs:
Moong Dal / Pulses

Remaining Requirement:
25 kg

Urgency:
High

Confidence:
High Confidence

Button:
**I Want to Help**

This page should feel extremely practical and useful.

---

# 15. Current Requirements Listing Page

Route example:

`/requirements`

Heading:

# Current food requirements

Subheading:

Explore active requirements submitted by communities and institutions.

---

## Filters

Desktop:
Horizontal filter row.

Mobile:
Filter button opening bottom sheet.

Filters:

- Location
- District
- Food item
- Food category
- Urgency
- Requester type
- Confidence level
- Requirement status

Default:
Show active requirements.

---

## Requirement Card

Each card should contain:

Top row:

Requester name or institution

Location

Confidence badge

Main content:

### What is needed?

Rice
60 kg remaining

Beneficiaries:
120

Urgency:
High

Expires:
In 12 days

Progress indicator:

40 kg supported
60 kg remaining

Footer:

View Details

I Want to Help

---

# 16. Requirement Detail Page

Route example:

`/requirements/:id`

This page should feel similar to a detailed campaign/need page, but it must have its own PoshanSetu identity.

## Top Section

Requester/institution identity.

Example:

# Food Support Needed for 120 Students

Institution:
XYZ Ashram Shala

Location:
Nashik, Maharashtra

Confidence:
High Confidence

Status:
Active

---

## Requirement Story

Explain:

- Who needs support
- Why the requirement exists
- Number of beneficiaries
- What items are needed
- Additional notes

---

## Requirements Progress

Visual progress bars.

Example:

### Rice

100 kg needed

40 kg supported

60 kg remaining

Progress bar.

---

### Moong Dal

50 kg needed

10 kg supported

40 kg remaining

---

## Support CTA

Large sticky CTA on desktop/mobile where appropriate.

**I Want to Help**

Clicking it should explain:

"You will coordinate support directly or through PoshanSetu. PoshanSetu does not process donations or payments."

---

## Transparency Section

Show:

- Requirement created date
- Expiry date
- Last updated
- Confidence level
- Verification information where appropriate
- Support history summary

Do not expose sensitive personal data of normal users publicly.

---

# 17. Requirement Submission Flow

Route example:

`/submit-requirement`

The experience must be simple.

Do not show one huge intimidating form.

Use a multi-step form.

Show progress.

Example:

### Step 1 of 4
Who is submitting this requirement?

---

## Step 1 — Requester Type

Choose:

- Individual / Community User
- Institution

Institution examples:

- Ashram Shala
- School
- NGO
- Other organization

---

## Step 2 — Requirement Details

Fields:

- Requirement title
- Food/items required
- Quantity
- Unit
- Number of beneficiaries
- Urgency
- Description

Food item selection should support multiple items.

---

## Step 3 — Location

Fields:

- State
- District
- City/location
- Address/location details

Use Maharashtra as the initial scope.

---

## Step 4 — Supporting Information

Optional or appropriate fields:

- Documents
- Images
- Additional notes

Show accepted formats:

PDF / JPG / PNG

Explain why information is requested.

---

## Expiry and Urgency

The user selects urgency.

The system suggests an expiry date.

Use:

- Critical: short validity
- High: shorter validity
- Medium: moderate validity
- Low: longer validity

The system should allow the maximum validity to extend beyond one month.

The exact expiry date should be clearly shown before submission.

Example:

"Based on your urgency level, this requirement is suggested to remain active until 15 September 2026."

Allow an appropriate date adjustment within platform rules.

---

## Review Screen

Before submission:

Show a clean summary.

Sections:

- Requester
- Location
- Items required
- Quantity
- Beneficiaries
- Urgency
- Expiry date

Primary CTA:

**Submit Requirement**

After submission:

Status:
**Under Review**

Explain:

"We perform automated checks before making requirements fully visible."

---

# 18. Donor Support Flow

When the user clicks:

**I Want to Help**

If logged out:

Show login prompt.

After login:

---

## Step 1

# How would you like to support?

Show matching requested items.

Example:

You selected:

Rice

Requirement remaining:

60 kg

Input:

How much can you provide?

`[ 20 ] kg`

Optional message:

"I can arrange delivery next week."

---

## Step 2

Choose interaction method where appropriate:

- Send response through PoshanSetu
- Contact requester when permitted

For normal users, sensitive contact information remains protected until controlled interaction.

---

## Step 3

Review Support Offer

Show:

- Requirement
- Item
- Quantity
- Requester/institution
- Location

CTA:

**Send Support Offer**

---

# 19. Donor Dashboard

Route:

`/dashboard/donor`

The dashboard should be easy to understand at a glance.

Do not use a dense enterprise admin style.

## Welcome Area

"Good morning, Karan"

Optional personalized summary:

"You have 3 active support offers."

---

## Overview Cards

- Active Supports
- Pending Confirmations
- Completed Supports
- Requirements Responded To

Use meaningful icons.

---

## Active Support Section

Cards, not dense tables.

Each support card shows:

Institution:
XYZ Ashram Shala

Item:
Rice

Quantity Offered:
40 kg

Status:
Awaiting Requester Confirmation

Timeline:

Offer Sent
→ Accepted
→ Donor Marked Completed
→ Requester Confirmation Pending

---

## Completed Support

Show meaningful history.

Example:

### Rice Support

Nashik

40 kg

Completed

Date

Button:
View Details

---

# 20. Requester Dashboard

Route:

`/dashboard/requester`

Overview cards:

- Active Requirements
- Total Remaining Need
- Support Offers Received
- Awaiting Confirmation

---

## My Active Requirements

Card example:

### Food Support for 120 Students

Status:
Partially Supported

Progress:

40 kg received
60 kg remaining

Button:

Manage Requirement

---

## Support Offers

Show incoming donor responses.

Each card:

Donor:
Available name based on privacy rules

Offering:
20 kg Moong Dal

Date:
...

Buttons:

Accept / Decline / Contact

---

## Confirmation Actions

After donor says support is completed:

Requester sees:

# Did you receive the support?

Buttons:

**Yes, Received**

**Not Yet Received**

Only both confirmations should result in completed fulfillment.

---

# 21. Partial Support UX

Requirements can receive support from multiple donors.

This must be visually clear.

Example:

# Rice Requirement

Original:
100 kg

Supported:
40 kg

Remaining:
60 kg

Use a progress bar.

Show contribution/support history.

Example:

Support 1
40 kg
Completed

Support 2
20 kg
Awaiting confirmation

The requester should easily update:

- Remaining quantity
- Items still required
- Urgency
- Notes

Do not erase history.

---

# 22. Notifications

Route:

`/notifications`

Use in-app notifications only for MVP.

Examples:

- A donor responded to your requirement
- Your support offer was accepted
- Confirmation is pending
- A requirement will expire soon
- Your requirement was partially supported
- A requirement was fulfilled
- A requirement was flagged or needs attention

Unread notifications should be obvious but not distracting.

---

# 23. Institution Dashboard

Institution users need a stronger operational view.

Sections:

## Overview

- Active requirements
- Total beneficiaries
- Support offers
- Pending confirmations

## My Requirements

Clear cards with progress.

## Incoming Support

Show donors and offered items.

## Documents / Verification

Show:

- Submitted documents
- Verification/confidence status
- Any action required

---

# 24. Confidence and Trust UI

Automated verification is not proof that a requirement is genuine.

The UI must communicate this honestly.

Use three levels:

### High Confidence

Green indicator.

Meaning:

Automated checks found strong consistency.

---

### Medium Confidence

Amber indicator.

Meaning:

Some checks passed, but more certainty is not available.

---

### Low Confidence / Flagged

Red indicator.

Meaning:

The system detected unusual patterns or inconsistencies.

---

Do not simply display:

"100% Verified"

Avoid misleading certainty.

Provide a small tooltip or "How is this assessed?" link.

Factors may include:

- Data consistency
- Duplicate checks
- Location consistency
- Quantity sanity checks
- Institution information
- Suspicious multiple-account patterns

The system should also detect possible multiple accounts submitting similar requirements for:

- The same institution
- Nearby institutions
- The same or nearby location
- Highly similar requirement content

Admin review may be required.

---

# 25. Admin Dashboard

Route:

`/admin`

Admin UI can be more data-focused but should still remain clean.

Use a sidebar layout.

Navigation:

- Overview
- Flagged Requirements
- Requirements
- Users
- Institutions
- Verification
- Reports / Monitoring

---

## Admin Overview

Cards:

- Active Requirements
- Flagged Requirements
- High-Risk Accounts
- Pending Reviews

---

## Flagged Requirements

Each row/card:

- Requirement
- Requester
- Location
- Reason flagged
- Confidence
- Date

Actions:

- View
- Hide
- Restore
- Remove

Admin actions must feel deliberate.

Use confirmation dialogs for destructive actions.

---

# 26. Nutrition Insights Page

Route:

`/nutrition-insights`

This page provides educational and transparent information.

Sections:

## Understanding the Data

Explain:

- What district-level nutrition indicators mean
- What they do not mean
- Why data reporting periods matter
- Why the platform does not diagnose individuals

---

## Food Support Guidance

Show broad categories.

### Cereals and Staples

Examples:
- Rice
- Jowar
- Bajra
- Ragi

### Pulses and Protein-Rich Foods

Examples:
- Moong Dal
- Chana
- Other pulses

For each item/category, show general nutritional relevance where supported by reliable data.

Important wording:

Do not say:

"Donate this because the district has iron deficiency"

unless verified evidence specifically supports that conclusion.

Instead use:

"May contribute to a diverse and nutritionally supportive food basket."

If nutritional composition is shown, clearly distinguish:

- Food nutrient information
from
- District-level malnutrition indicators

---

# 27. Food Information UI

When a food item is selected, show:

Example:

# Moong Dal

Category:
Pulses / Protein-Rich Foods

General nutritional contribution:

- Protein
- Dietary fibre
- Other nutrients according to reliable food composition data

Important note:

"Food nutrient information does not mean that a specific population has been diagnosed with a deficiency."

Also show:

### Current Requirements Matching This Food

Example:

12 active requirements

Button:

**Find Places That Need Moong Dal**

This creates a direct bridge between food knowledge and action.

---

# 28. Data Transparency Design

Every government-data-driven insight should show transparency information.

Create a reusable component:

### Data Information

Source:
Official Government Dataset

Reporting Period:
2025–26

Last Synced:
15 August 2026

Data Type:
District-level population indicator

Use small, clean information styling.

Do not hide this information in a footer.

It should be accessible directly from the relevant insight.

---

# 29. Empty States

Empty states must be thoughtfully designed.

Example:

# No active requirements found

There are currently no active requirements matching "Ragi" in this location.

Try:

- Another nearby district
- A broader location
- Another food item

Button:

**Explore All Requirements**

Avoid generic empty-folder illustrations.

---

# 30. Loading States

Use skeleton loaders.

Examples:

- Map loading skeleton
- Requirement card skeleton
- Dashboard card skeleton

Do not rely only on spinning loaders.

---

# 31. Error States

Use clear human language.

Example:

### We couldn't load this location right now.

Please try again in a moment.

Button:

**Try Again**

Avoid technical error codes in the main UI.

---

# 32. Forms

Forms should feel calm and easy.

Use:

- Clear labels
- Helpful examples
- Inline validation
- Visible required fields
- Clear error messages

Do not make users guess what is wrong.

Example:

Bad:
"Invalid input"

Good:
"Please enter the quantity in kilograms."

---

# 33. Buttons

Primary button:

Background:
`#304355`

Text:
White

Style:
Moderately rounded corners.

Avoid extremely rounded pill buttons everywhere.

Primary button examples:

- Find Where to Help
- Explore Needs
- Submit Requirement
- I Want to Help
- Send Support Offer

Secondary buttons:

- Light background
- Slate border
- Dark slate text

Text buttons:

Used for less important actions.

---

# 34. Cards

Cards are important to the product.

Use:

- White or subtle off-white surfaces
- Moderate border radius
- Thin subtle border
- Soft shadow only where useful
- Comfortable internal padding

Do not create floating cards everywhere.

Cards should be used to organize meaningful information.

---

# 35. Icon Style

Use one consistent icon library.

Preferred visual direction:

Simple line icons.

Avoid mixing:

- 3D icons
- Emoji icons
- Filled icons
- Random illustration styles

Use icons to improve comprehension, not decoration.

---

# 36. Images and Illustrations

If images are used:

Prefer:

- Authentic-looking Indian community contexts
- Food support
- Institutions
- Schools
- Human stories
- Maharashtra context where relevant

Avoid:

- Artificial-looking AI-generated people
- Excessively posed corporate teams
- Generic stock handshake images
- Sadness used purely for emotional manipulation

The design should communicate dignity.

People receiving support should not be visually portrayed as helpless objects.

---

# 37. Footer

Dark `#304355` background.

Light text.

Columns:

### PoshanSetu
Short mission statement.

### Explore
- Maharashtra Map
- Current Requirements
- Nutrition Insights

### Get Involved
- I Want to Help
- Submit Requirement
- For Institutions

### Information
- How It Works
- Data Transparency
- Privacy
- Terms

Bottom:

© PoshanSetu

"Helping connect informed support with real local needs."

---

# 38. Accessibility

The UI must support:

- Sufficient contrast
- Keyboard navigation
- Clear focus states
- Proper form labels
- Large enough touch targets
- Color should not be the only indicator of urgency/status

For example:

Do not communicate "Critical" using only red.

Also include:

- Text label
- Icon or visual indicator

---

# 39. Responsive Priority

On mobile, prioritize:

1. Search
2. Find where to help
3. Current requirements
4. Requirement details
5. Support flow
6. Dashboards

The primary user journey must not become difficult on a phone.

---

# 40. Key Homepage Wireframe

The approximate homepage structure should be:

```text
┌──────────────────────────────────────────────────────────────┐
│ LOGO       Home Explore Needs Insights How It Works  Login │
│                                                [I Want Help]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│          YOUR FOOD CAN HELP.                                 │
│          FIND WHERE IT IS NEEDED MOST.                       │
│                                                              │
│   Explore local nutrition information and current needs.     │
│                                                              │
│   [ Search district, city or location                ]      │
│                                                              │
│       [Explore Maharashtra Map]                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                  HOW WOULD YOU LIKE TO HELP?                 │
│                                                              │
│ ┌─────────────┐ ┌──────────────┐ ┌────────────────┐          │
│ │ I Want to   │ │ Explore      │ │ Submit a       │          │
│ │ Help        │ │ Current Needs│ │ Requirement    │          │
│ └─────────────┘ └──────────────┘ └────────────────┘          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│             WHERE  →  WHY  →  HOW CAN I HELP?                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│        WHAT DO YOU HAVE TO OFFER?                            │
│                                                              │
│ [ Dal / Rice / Jowar / Other ] [ Quantity ] [Find Needs]    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│               EXPLORE MAHARASHTRA                            │
│                                                              │
│                  INTERACTIVE MAP                             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                 CURRENT REQUIREMENTS                         │
│                                                              │
│   Requirement Card   Requirement Card   Requirement Card     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                 HOW POSHANSETU WORKS                         │
│                                                              │
│      Explore → Understand → Respond → Support Outside        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                       FOOTER                                 │
└──────────────────────────────────────────────────────────────┘
````

---

# 41. Critical Screens Stitch Must Generate

Generate a consistent design system and interfaces for:

## Public

1. Homepage
2. Explore Maharashtra Map
3. District Detail Page
4. Current Requirements Listing
5. Requirement Detail Page
6. Food Matching / "What Do You Have?" Page
7. Nutrition Insights Page
8. How It Works Page

## Authentication

9. Login
10. Sign Up

## Requester

11. Submit Requirement - Step 1
12. Submit Requirement - Step 2
13. Submit Requirement - Step 3
14. Submit Requirement - Review
15. Requester Dashboard
16. Requirement Management Page
17. Support Offers Page

## Donor

18. Donor Dashboard
19. Send Support Offer Flow
20. Support Detail and Confirmation Page
21. Completed Support History

## Institution

22. Institution Dashboard
23. Institution Requirements
24. Institution Verification/Documents

## Admin

25. Admin Dashboard
26. Flagged Requirements
27. Requirement Review Detail
28. Verification Monitoring

## Shared

29. Notifications
30. Profile/Account
31. Empty States
32. Error States
33. Loading States

---

# 42. Component System

Create reusable components for:

* Navbar
* Footer
* Search bar
* Location selector
* Requirement card
* Food item card
* Nutrition indicator card
* Data source/transparency card
* Urgency badge
* Confidence badge
* Status badge
* Progress bar
* Support timeline
* Dashboard metric card
* Filter component
* Modal
* Confirmation dialog
* Notification item
* Empty state
* Skeleton loader

All screens must reuse these components consistently.

---

# 43. Important UX Copy Style

The copy should sound:

* Clear
* Calm
* Helpful
* Human
* Non-judgmental

Examples:

Instead of:
"Donate Now"

Use:
**I Want to Help**

Instead of:
"High Risk Area"

Prefer:
**Higher Attention Needed**

when appropriate.

Instead of:
"Verified 100%"

Use:
**High Confidence**

Instead of:
"No results"

Use:
**No active requirements match your search right now.**

---

# 44. Important Product Disclaimers

The UI should clearly communicate where relevant:

### Nutrition Data Disclaimer

"District-level indicators provide population-level insights and are not medical diagnoses for individuals."

### Food Recommendation Disclaimer

"Food guidance is intended to support informed food assistance and does not diagnose or treat nutrient deficiencies."

### Donation Disclaimer

"PoshanSetu helps connect people with needs and support opportunities. Donations and transfers take place outside the platform."

These should not overwhelm users but must be accessible and visible at relevant decision points.

---

# 45. Final Visual Direction for Stitch

Design PoshanSetu as a polished, modern Indian social-impact web platform.

The strongest visual priorities are:

1. Immediately understandable purpose
2. Clear user paths
3. Trust
4. Human warmth
5. Information clarity
6. Practical action
7. Transparency
8. Accessibility
9. Mobile usability
10. Consistent design system

Use:

### Primary

`#304355`

### Light Background

`#E8E8E2`

### White

For elevated content surfaces.

The final product should feel:

**Trustworthy like a serious public platform.**

**Warm like a human-centered social-impact service.**

**Easy to navigate like a well-designed consumer product.**

**Practical enough that someone with Dal, Rice, Jowar, Bajra, Ragi, Chana, or Moong Dal immediately understands how to find where that item is currently needed.**

Most importantly:

A first-time visitor should not need instructions to understand what PoshanSetu does.

They should immediately see:

"I want to help."
"I want to find current needs."
"I need to submit a requirement."

The interface should guide them naturally from there.

Do not create a generic AI-looking dashboard.

Do not copy another website's exact UI.

Use the inspiration only for the overall qualities of:
human-centered design, trust, strong calls to action, clear journeys, approachable cards, transparent information, and easy navigation.

Create an original PoshanSetu design system and interface.

```

One small recommendation: give this to Stitch **first as the main design specification**, then ask it to generate the **Homepage first**. Once you like that visual direction, use the same design system for the remaining screens. That usually gives much more consistent results than asking it to generate all 32 screens independently.
```

[1]: https://crowdfunding.milaap.org/?utm_source=chatgpt.com "Exhausted Your Savings? Start A Free Fundraiser On Milaap!"
