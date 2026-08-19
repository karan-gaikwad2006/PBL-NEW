# PoshanSetu — Application Flow & User Experience Specification

**Document Type:** Application Flow / Navigation / UX Specification  
**Project:** PoshanSetu  
**Platform:** Desktop-first responsive Web Application  
**Version:** MVP 1.0  
**Status:** Approved Application Flow Specification  

---

# 1. Purpose of This Document

This document defines how users move through the PoshanSetu web application.

It specifies:

- Which screens connect to each other
- What happens when users click important buttons
- Which screens are accessible without login
- Which actions require authentication
- Role-based user journeys
- Requirement lifecycle
- Support/donation lifecycle
- Navigation rules
- Redirect rules
- Status transitions
- Dashboard flows
- Notification flows
- Error, empty, and edge states
- UX principles that must be followed while implementing the application

This document must be used together with:

```text
PRD-PoshanSetu-MVP.md
TechDesign-PoshanSetu-MVP.md
Design.md
AppFlow.md
````

## Priority of Documents

When implementing the application:

1. **PRD** defines WHAT the product must do.
2. **TechDesign** defines HOW the product should technically work.
3. **Design.md** defines HOW the product should visually look.
4. **AppFlow.md** defines HOW users navigate and experience the application.

If there is a conflict between documents:

* Product/business requirements → PRD takes priority.
* Technical architecture/security → TechDesign takes priority.
* Visual styling/layout → Design.md takes priority.
* Navigation and user journey decisions → AppFlow.md takes priority.

Do not invent new navigation flows unless required to resolve a missing edge case.

---

# 2. Product Navigation Philosophy

PoshanSetu must feel like one connected, understandable platform.

A first-time visitor should quickly understand what they can do.

The main questions PoshanSetu answers are:

1. **Where can I help?**
2. **Why is help needed there?**
3. **How can I help?**
4. **I have a specific food item — where can I donate it?**
5. **I need food support — how can I submit my requirement?**

The application must not force users to understand the entire platform before taking action.

Users should be able to enter from different intentions and immediately find the correct path.

---

# 3. User Roles

PoshanSetu has five primary user types.

## 3.1 Public Visitor

A person who has not logged in.

Can:

* View the landing page
* Explore Maharashtra
* Search locations
* View district nutrition insights
* View current public requirements
* View requirement details where publicly visible
* Use food/item matching
* Learn how PoshanSetu works

Cannot:

* Submit a requirement
* Send a support offer
* Access dashboards
* View protected contact information
* Confirm support completion

---

## 3.2 Donor

A logged-in user who wants to support requirements.

Can:

* Browse all public information
* Search locations
* Find requirements
* Match available food with needs
* Send support offers
* View support progress
* Confirm support completion
* View support history
* Receive notifications

---

## 3.3 Normal Requester

A logged-in individual who submits a food requirement.

Can:

* Submit requirements
* View requirement status
* Update eligible active/partial requirements
* Review donor support offers
* Confirm support received
* Track support history
* Receive notifications

Personal contact information must remain protected according to the privacy rules.

---

## 3.4 Institution

Examples:

* Ashram Shalas
* Schools
* NGOs
* Charitable institutions
* Other eligible organizations

Can:

* Maintain an institution profile
* Submit institutional requirements
* Upload supporting documents
* Track active requirements
* Receive donor responses
* Update remaining needs
* Confirm received support
* View requirement history

Institution requests may undergo stronger automated confidence checks.

---

## 3.5 Admin

The admin is the safety and oversight layer.

Admin can:

* View platform overview
* Review flagged or attention-required requirements
* View automated verification signals
* View confidence information and reasons
* Review institutions at a basic level
* Monitor users
* Hide requirements temporarily
* Remove clearly suspicious or inappropriate content
* Add internal notes
* Monitor active requirements and basic platform activity

Automated signals assist admin review.

A flagged requirement must never automatically be treated as proven fraudulent.

---

# 4. Global Application Entry Flow

```text
USER OPENS POSHANSETU
        |
        v
LANDING PAGE
        |
        +--------------------------------------+
        |                                      |
        v                                      v
EXPLORE WHERE TO HELP                    I HAVE FOOD TO DONATE
        |                                      |
        v                                      v
LOCATION / MAP / SEARCH                   FOOD ITEM MATCHING
        |                                      |
        v                                      v
DISTRICT / LOCATION INSIGHTS              MATCHING REQUIREMENTS
        |                                      |
        +------------------+-------------------+
                           |
                           v
                  REQUIREMENT DETAILS
                           |
                           v
                   I WANT TO HELP
                           |
                 +---------+---------+
                 |                   |
                 v                   v
           NOT LOGGED IN          LOGGED IN
                 |                   |
                 v                   v
            LOGIN / SIGN UP     SUPPORT OFFER
                 |
                 v
        RETURN TO SAME REQUIREMENT
                 |
                 v
             SUPPORT OFFER
```

The user must never lose their original context after login.

For example:

```text
Requirement A
→ Click I Want to Help
→ Login
→ Successful Login
→ Return to Requirement A
→ Open Support Offer
```

Do not redirect the user to a generic dashboard after login when they were in the middle of supporting a specific requirement.

---

# 5. Public Landing Page Flow

## Primary Landing Page Actions

The landing page should clearly present the main user intentions.

Primary actions:

### Action A — Explore Where Help Is Needed

```text
Landing Page
→ Explore Maharashtra
→ Map / Location Search
→ Select Location
→ District Nutrition Insights
→ Current Requirements
```

---

### Action B — Find a Requirement

```text
Landing Page
→ Find Where to Help
→ Location Search / Requirements Listing
→ Apply Filters
→ Select Requirement
→ Requirement Details
```

---

### Action C — I Have Food to Donate

This is a major PoshanSetu flow.

The platform must support users who already have a food item and want to know where it may be useful.

Example:

> "I have 20 kg of Moong Dal. Where can I donate it?"

Flow:

```text
Landing Page
→ I Have Food to Donate
→ Food Matching Screen
→ Select / Enter Food Item
→ Optional Quantity
→ Optional Location
→ Search
→ Matching Active Requirements
→ Select Requirement
→ Requirement Details
→ I Want to Help
```

The platform must not claim that a food item treats or diagnoses a specific person's medical deficiency.

Matching should be based on:

* Current submitted item requirements
* Location relevance
* Requirement urgency
* Quantity relevance
* Broad nutrition/support guidance where supported by reliable evidence

---

### Action D — Submit a Requirement

```text
Landing Page
→ Submit a Requirement
→ Login / Sign Up
→ Role Selection if required
→ Requester or Institution Dashboard
→ Requirement Submission
```

---

# 6. Public Location Exploration Flow

```text
Landing Page
→ Explore Maharashtra
→ Maharashtra Map
OR
→ Search Location
        |
        v
Select State / District / Available Location
        |
        v
Location Insights Screen
```

The MVP starts with Maharashtra.

The architecture and navigation should allow future expansion:

```text
India
→ State
→ District
→ City / Location
```

For the MVP, the user primarily navigates:

```text
Maharashtra
→ District
→ Available Location Details
```

---

# 7. District / Location Insights Flow

When a user selects a district, information must be displayed in the following order:

## 7.1 Overall District Nutrition Risk

```text
District Selected
→ Overall Nutrition Risk
```

Display the risk using available reliable official indicators.

Do not combine government data and local requirements into one arbitrary score.

---

## 7.2 Why Does This Location Need Attention?

```text
Overall Nutrition Risk
→ Why Attention Is Needed
```

Explain relevant available indicators.

Show:

* Indicator information
* Reporting period
* Last data sync
* Data source
* Appropriate context

Do not falsely describe old or periodically updated information as real-time.

Do not claim that general malnutrition indicators directly prove specific micronutrient deficiencies.

---

## 7.3 How Can I Help?

```text
Why Attention Is Needed
→ How Can I Help?
```

Show:

* Broad food support categories
* Evidence-based donation guidance
* Specific food items where appropriate
* Link to current local requirements

---

## 7.4 Current Local Requirements

```text
How Can I Help?
→ Current Local Requirements
```

Government nutrition information and current submitted requirements must remain visually and logically separate.

The user should clearly understand:

```text
District Nutrition Information
= Official / reliable reported data

Current Local Requirements
= Recent submitted needs from users/institutions
```

---

# 8. Requirements Listing Flow

```text
District Insights
→ View Current Requirements
→ Requirements Listing
```

The listing can also be reached through:

```text
Landing Page
→ Find Where to Help
→ Requirements Listing
```

Possible filters:

* District
* Location
* Food/item required
* Urgency
* Requester type
* Requirement status where appropriate

Public listing should primarily show eligible public requirements.

Requirement cards should display enough information for users to decide whether to explore further.

Click:

```text
Requirement Card
→ Requirement Details
```

---

# 9. Requirement Details Flow

The requirement details page is the main decision point for donors.

It should answer:

* Who needs help?
* Where is help needed?
* What is needed?
* How much is needed?
* How urgent is it?
* How much remains?
* What is the current requirement status?

Primary action:

```text
I Want to Help
```

Flow:

```text
Requirement Details
→ Click I Want to Help
```

Authentication check:

```text
Is user logged in?
        |
    +---+---+
    |       |
   NO      YES
    |       |
    v       v
Login    Support Offer
    |
    v
Successful Login
    |
    v
Return to Original Requirement Context
    |
    v
Support Offer
```

---

# 10. Food Matching Flow

## User Journey

```text
I Have Food to Donate
→ Food Matching Screen
→ Select Food
→ Enter Optional Quantity
→ Enter Optional Location
→ Search
→ Matching Requirements
```

Example:

```text
Food:
Moong Dal

Available Quantity:
20 kg

Location:
Nashik
```

The result screen should show relevant active requirements.

Each result may display:

* Requirement name
* Location
* Urgency
* Requested item
* Remaining quantity
* Requester/institution information as permitted
* Match relevance

Click:

```text
View Requirement
→ Requirement Details
```

Then:

```text
I Want to Help
→ Authentication Check
→ Support Offer
```

If no suitable requirements are found:

```text
Food Matching
→ No Direct Match
```

Show useful alternatives:

* Search nearby locations
* Search other districts
* Browse all requirements
* Check broad food support guidance where applicable

Do not create a dead end.

---

# 11. Authentication Flow

Public browsing must not require login.

Authentication is required for protected actions.

Protected actions include:

* Submitting requirements
* Sending support offers
* Accessing dashboards
* Confirming support
* Managing requirements
* Viewing protected interactions
* Admin functions

## Login Flow

```text
Protected Action
→ Check Authentication
        |
    +---+---+
    |       |
   NO      YES
    |       |
    v       v
Login    Continue Action
```

After successful login:

```text
Return to intended action
```

Examples:

```text
Requirement Details
→ I Want to Help
→ Login
→ Return
→ Support Offer
```

```text
Landing Page
→ Submit Requirement
→ Login
→ Requester Dashboard
→ Requirement Submission
```

---

# 12. Role-Based Dashboard Routing

After login, users must access the dashboard appropriate to their role.

```text
Authenticated User
        |
        v
Determine Role
        |
 +------+------+------+
 |             |      |
 v             v      v
Donor      Requester  Institution
 |             |      |
 v             v      v
Donor        Requester Institution
Dashboard    Dashboard Dashboard
```

Admin users:

```text
Admin Authentication
→ Admin Dashboard
```

Do not allow normal users to manually access protected admin pages.

---

# 13. Donor Flow

## 13.1 Start Support

```text
Requirement Details
→ I Want to Help
→ Login if needed
→ Support Offer
```

---

## 13.2 Support Offer

The donor provides:

* Item they want to provide
* Approximate quantity
* Optional message
* Contact/interaction information according to privacy rules

Submit:

```text
Submit Support Offer
→ Support Offer Submitted
→ Support Details
```

---

## 13.3 Support Lifecycle

```text
Support Offer Sent
        |
        v
Requester Receives Offer
        |
        v
Support / Coordination Continues
        |
        v
Donor Marks Support Completed
        |
        v
Waiting for Requester Confirmation
        |
        v
Requester Marks Support Received
        |
        v
Support Completed
```

Both confirmations are required.

```text
Donor Confirmation
+
Requester Confirmation
=
Completed Support
```

One confirmation alone must not complete the support.

---

## 13.4 Quantity Update

If:

```text
Requirement = 100 kg Rice
Support = 40 kg Rice
```

After valid support completion:

```text
Remaining = 60 kg Rice
Status = Partially Supported
```

If the remaining requirement reaches zero or is otherwise fully satisfied according to the requirement rules:

```text
Status = Fulfilled
```

Support history must remain traceable.

---

# 14. Donor Dashboard Flow

The donor dashboard should be the donor's main management center.

Sections:

* Overview
* Active Supports
* Pending Confirmations
* Completed Supports
* Requirements Responded To
* Support History
* Notifications

## Flow

```text
Donor Dashboard
        |
        +-----------------------------+
        |             |               |
        v             v               v
Active Supports  Pending Confirmation  Completed
        |             |               |
        v             v               v
Support Details  Support Details    Support History
```

Clicking a support card:

```text
Support Card
→ Support Details
```

From Support Details, users may:

* View requirement
* View support information
* View current status
* Complete required confirmation when eligible

---

# 15. Normal Requester Flow

## 15.1 Submit Requirement

```text
Requester Dashboard
→ Submit Requirement
→ Requirement Form
```

The requester enters:

* Name
* Location
* District
* Address/location details
* Number of beneficiaries
* Food/items required
* Quantity
* Urgency
* Description/additional notes

Submit:

```text
Requirement Form
→ Validation
→ Successful Submission
→ Requirement Status
```

---

# 16. Requirement Lifecycle Flow

The overall requirement lifecycle is:

```text
Draft / Submission
        |
        v
Under Review
        |
        +-----------------------------+
        |                             |
        v                             v
Automated Checks Complete       Requires Attention
        |                             |
        v                             v
Active                       Review / Edit if allowed
        |
        +-----------------------------+
        |                             |
        v                             v
Partially Supported             Expired
        |
        v
Fulfilled
```

Primary statuses:

* Under Review
* Active
* Partially Supported
* Fulfilled
* Expired
* Flagged / Requires Attention

The exact internal verification process should not unnecessarily be exposed to users.

---

# 17. Requirement Expiry Flow

Every requirement has an expiry date.

Urgency influences the suggested validity period.

The system should suggest an expiry date automatically based on urgency.

The requester can select an appropriate validity period within allowed product rules.

Example suggested durations:

* Critical → shorter validity
* High → relatively short validity
* Medium → moderate validity
* Low → longer validity

The maximum validity must extend beyond one month.

The approved product policy should support longer validity for appropriate lower-urgency requirements.

The expiry date must be visible.

When the expiry date is reached:

```text
Active / Partially Supported Requirement
→ Expiry Processing
→ Expired
```

The expired requirement should not continue appearing as an active public need.

The requester should have clear next actions:

```text
Expired Requirement
→ View History
→ Create New Requirement
```

---

# 18. Requester Requirement Status Flow

```text
Requester Dashboard
→ My Requirements
→ Select Requirement
→ Requirement Status
```

The screen must clearly communicate:

* Current status
* Requirement summary
* Remaining quantity
* Expiry
* Activity history
* Automated check state at an appropriate high level
* Next available actions

Possible paths:

## Under Review

```text
Requirement Status
→ Under Review
→ Wait for status update
```

Show:

* Submission received
* Automated checks
* Appropriate next-step information

---

## Active

```text
Requirement Status
→ Active
→ Manage Requirement
```

Show:

* Donor responses
* Remaining requirement
* Expiry
* Support progress

---

## Partially Supported

```text
Requirement Status
→ Partially Supported
→ View Support Progress
→ Update Remaining Requirement if needed
```

Requester can update eligible fields:

* Remaining quantity
* Items still required
* Urgency
* Additional notes

The original support history must remain preserved.

---

## Fulfilled

```text
Requirement Status
→ Fulfilled
→ View Support History
```

A requirement is fulfilled only according to the dual-confirmation and quantity completion rules.

---

## Expired

```text
Requirement Status
→ Expired
→ View History
OR
→ Create New Requirement
```

---

## Requires Attention

```text
Requirement Status
→ Requires Attention
→ Review Requirement Information
→ Edit Eligible Information
→ Continue Review
```

Do not display:

> "You are fraudulent."

Instead use neutral language such as:

> "Some information in this requirement needs attention before it can continue normally."

---

# 19. Institution Flow

## Entry

```text
Login
→ Institution Dashboard
```

Institution dashboard sections:

* Overview
* Active Requirements
* Submit Requirement
* Support Offers
* Pending Confirmations
* Requirement History
* Institution Profile
* Supporting Documents
* Notifications

---

## Institution Requirement Submission

```text
Institution Dashboard
→ Submit Requirement
→ Institution Requirement Form
→ Optional Supporting Documents
→ Submit
→ Automated Checks
→ Requirement Status
```

Institution requirements may undergo additional confidence checks.

This does not guarantee authenticity.

---

# 20. Institution Document Flow

```text
Institution Profile / Requirement Form
→ Upload Document
→ File Validation
→ Upload to Cloudinary
→ Store File Metadata in Neon PostgreSQL
→ Display Document in Institution/Admin Context
```

Supported document examples:

* PDF
* JPG
* PNG

Document metadata may include:

* File identifier
* Original filename
* File type
* Storage URL/reference
* Upload date
* Associated institution or requirement

Sensitive documents must not automatically be public.

---

# 21. Support Offer Reception Flow

When a donor sends an offer:

```text
Donor
→ Submit Support Offer
→ Support Record Created
→ Requester Notification Created
```

Requester:

```text
Notification
→ Click Notification
→ Support Offer Details
```

Requester can view appropriate information and continue the support process.

The flow must not imply that PoshanSetu processes the actual donation.

The actual support/donation happens outside the platform.

---

# 22. Dual Confirmation Flow

This is a mandatory business rule.

```text
SUPPORT ACTIVITY OCCURS OUTSIDE POSHANSETU
                    |
                    v
DONOR CONFIRMS COMPLETION
                    |
                    v
WAIT FOR REQUESTER CONFIRMATION
                    |
                    v
REQUESTER CONFIRMS RECEIPT
                    |
                    v
SUPPORT COMPLETED
```

Alternative order is also possible:

```text
Requester Confirms Receipt
→ Wait for Donor Confirmation
```

Final completion only occurs when both confirmations exist.

```text
IF donorConfirmed == true
AND requesterConfirmed == true
THEN supportStatus = Completed
```

Otherwise:

```text
supportStatus = Pending Confirmation
```

---

# 23. Partial Support Flow

Example:

```text
Original Requirement:
100 kg Rice

Completed Support:
40 kg Rice

Remaining:
60 kg Rice
```

Flow:

```text
Support Completed
→ Update Requirement Quantities
→ Remaining Quantity Exists?
        |
    +---+---+
    |       |
   YES      NO
    |       |
    v       v
Partially   Fulfilled
Supported
```

For partially supported requirements:

```text
Requester
→ Update Remaining Need if eligible
```

Updates must not erase historical support information.

---

# 24. Notification Flow

The application uses in-app notifications for the MVP.

No email notifications are required for the MVP.

## Notification Entry

```text
Notification Icon
→ Notification Center
```

Clicking a notification must lead directly to the relevant screen.

Examples:

### Donor

```text
Support offer reviewed
→ Support Details
```

```text
Confirmation required
→ Support Details
```

### Requester

```text
New support offer
→ Support Offer Details
```

```text
Donor confirmed completion
→ Support Details / Confirmation
```

### Institution

```text
Requirement status updated
→ Requirement Status
```

### Admin

```text
New flagged requirement
→ Admin Requirement Review
```

Avoid notifications that lead only to a generic dashboard without context.

---

# 25. Admin Flow

## Admin Entry

```text
Admin Login
→ Admin Dashboard
```

Admin navigation:

```text
Overview
Flagged Requirements
Requirements
Institutions
Users
Verification Signals
Data Monitoring
```

---

# 26. Admin Requirement Review Flow

```text
Admin Dashboard
→ Flagged Requirements
→ Select Requirement
→ Admin Requirement Review
```

Admin can view:

* Requirement information
* Requester/institution details according to permissions
* Automated review signals
* Confidence information
* Supporting documents
* Activity history
* Internal notes

Admin actions:

```text
Keep Active / Mark as Reviewed
```

```text
Hide Temporarily
```

```text
Remove Clearly Suspicious Content
```

```text
Add Internal Note
```

Important actions must require confirmation where appropriate.

---

# 27. Admin Review Principles

The system must communicate:

```text
Automated Signal ≠ Proof of Fraud
Confidence Score ≠ Guarantee
Flagged ≠ Automatically Fraudulent
```

Fraud and duplicate-related detection may consider patterns such as:

* Possible duplicate requirements
* Similar requirements from multiple accounts
* Multiple accounts associated with the same or nearby institution/location
* Unusual location patterns
* Quantity consistency concerns
* Basic information inconsistencies

Exact detection thresholds, formulas, and implementation logic must not be publicly exposed.

---

# 28. Multiple Account / Duplicate Pattern Flow

If automated checks detect a potential pattern:

```text
Requirement Submitted
→ Automated Duplicate / Pattern Checks
        |
        v
Potential Signal Detected?
        |
    +---+---+
    |       |
   NO      YES
    |       |
    v       v
Continue   Add Review Signal
Normal          |
Flow            v
          Confidence Assessment
                |
                v
        Continue / Requires Attention
```

A signal alone must not automatically remove a requirement.

Admin review remains the safety layer.

---

# 29. Global Navigation Rules

## Public Navigation

Logo:

```text
Logo
→ Landing Page
```

Explore:

```text
Explore
→ Maharashtra Map / Location Exploration
```

Find Where to Help:

```text
Find Where to Help
→ Location Search / Requirements
```

I Have Food to Donate:

```text
I Have Food to Donate
→ Food Matching
```

Login:

```text
Login
→ Login / Sign Up
```

---

## Authenticated Navigation

My Dashboard:

```text
My Dashboard
→ Role-Based Dashboard
```

Notifications:

```text
Notifications
→ Notification Center
```

Profile:

```text
Profile
→ Account/Profile
```

---

## Admin Navigation

Admin must use the dedicated admin sidebar.

Do not mix normal donor/requester navigation with the primary admin navigation.

---

# 30. Back Navigation Rules

Every detail screen must have a logical way back.

Examples:

```text
Requirement Details
→ Back to Requirements
```

```text
Support Details
→ Back to Active Supports
```

```text
Requirement Status
→ Back to My Requirements
```

```text
Admin Requirement Review
→ Back to Flagged Requirements
```

The browser back button should also work naturally.

Avoid navigation that creates dead ends.

---

# 31. Empty States

Every major data-driven screen needs an empty state.

## No Requirements

```text
No active requirements found.
```

Actions:

* Explore another location
* Clear filters
* Browse Maharashtra

---

## No Food Matches

```text
No direct requirement currently matches this item.
```

Actions:

* Search nearby locations
* Search another district
* Browse all requirements

---

## Donor Has No Active Supports

```text
You have not started supporting any requirements yet.
```

Action:

```text
Find Where to Help
```

---

## Requester Has No Requirements

```text
You have not submitted a requirement yet.
```

Action:

```text
Submit Requirement
```

---

## No Notifications

```text
You're all caught up.
```

---

# 32. Error Handling Flow

Errors should not trap users.

## Form Validation Error

```text
Submit
→ Validation Error
→ Show Field-Level Message
→ Preserve User Input
→ User Corrects Information
→ Submit Again
```

Do not clear the entire form unnecessarily.

---

## Server Error

```text
Action
→ Temporary Error
→ Explain in Simple Language
→ Retry
```

Example:

> "We couldn't complete this action right now. Please try again."

---

## Upload Error

```text
Upload Document
→ Upload Failed
→ Show Reason if Safe
→ Retry
```

Preserve already successfully uploaded files.

---

## Unauthorized Access

```text
Protected Route
→ Authentication Check
→ Login
→ Return to Intended Route if Allowed
```

---

## Forbidden Role Access

```text
User Attempts Restricted Role Page
→ Access Denied
→ Return to Appropriate Dashboard
```

Do not expose protected information.

---

# 33. Loading States

Every data-driven screen should have an appropriate loading state.

Examples:

```text
Map Loading
→ Skeleton / Loading State
```

```text
Requirements Loading
→ Requirement Card Skeletons
```

```text
Requirement Details Loading
→ Structured Content Skeleton
```

Avoid blank white screens during loading.

---

# 34. Responsive Experience Rules

PoshanSetu is designed desktop-first.

Desktop is the primary implementation reference.

Responsive support must adapt layouts without changing the information hierarchy.

Examples:

Desktop:

```text
Main Content       Side Panel
```

Mobile:

```text
Main Content
------------
Side Panel
```

The navigation logic must remain the same.

Do not create different product flows for mobile unless required by device limitations.

---

# 35. Privacy Flow

Public visitors:

```text
View Public Requirement Information
→ Protected Contact Information Remains Hidden
```

After appropriate authenticated interaction:

```text
Logged-in Donor
→ Chooses to Help
→ Controlled Interaction
```

Normal users must have stronger privacy protection than publicly identifiable institutions where appropriate.

Sensitive information must not be unnecessarily exposed through:

* Public requirement cards
* Search results
* URLs
* Client-side logs
* Error messages

---

# 36. Requirement Visibility Rules

A requirement may be visible differently based on:

* Requester type
* Current status
* Admin action
* Privacy rules

Typical flow:

```text
Under Review
→ Not normally public as active requirement

Active
→ Eligible for public discovery

Partially Supported
→ Public with remaining need

Fulfilled
→ No longer presented as an active need

Expired
→ Removed from active public discovery

Hidden / Requires Attention
→ Restricted according to review state
```

---

# 37. Food Guidance Navigation Rules

Food guidance must not behave like medical diagnosis.

The application may show:

```text
Broad Nutrition Support Category
→ Example Food Items
→ Current Requirements Where Applicable
```

Examples:

```text
Cereals / Staples
→ Rice
→ Jowar
→ Bajra
→ Ragi
```

```text
Pulses / Protein-Rich Foods
→ Moong Dal
→ Chana
→ Other supported items
```

If deficiency-related information is displayed, it must be carefully contextualized.

Do not claim:

```text
District has indicator X
Therefore every person has nutrient deficiency Y
```

Instead separate:

* Population-level nutrition indicators
* Broad food/nutrition information
* Current local item requirements

---

# 38. Core Status Transition Rules

## Requirement

```text
Under Review
→ Active
→ Partially Supported
→ Fulfilled
```

Alternative transitions:

```text
Under Review
→ Requires Attention
```

```text
Active
→ Expired
```

```text
Partially Supported
→ Expired
```

---

## Support

```text
Offer Sent
→ In Progress / Coordination
→ Pending Confirmation
→ Completed
```

Completion requires:

```text
Donor Confirmation = Yes
AND
Requester Confirmation = Yes
```

---

# 39. Critical User Experience Rules

The implementation must follow these rules.

## Rule 1 — No Login for Discovery

Users can explore where help is needed without creating an account.

---

## Rule 2 — Login Only When Action Requires It

Authentication should be requested at the moment the user performs a protected action.

---

## Rule 3 — Preserve Intent

After login, return users to the action they originally intended to complete.

---

## Rule 4 — No Dead Ends

Every major screen must provide a meaningful next action.

---

## Rule 5 — Explain Status Clearly

Users should always understand:

* What is happening
* Why it is happening where appropriate
* What happens next
* What action they can take

---

## Rule 6 — Separate Data Sources

Government nutrition data and local submitted requirements must remain clearly separate.

---

## Rule 7 — Do Not Overstate Data Freshness

Always show reporting period and source information where relevant.

---

## Rule 8 — Do Not Present Automated Checks as Absolute Truth

Confidence and risk signals are assistance mechanisms.

They are not proof.

---

## Rule 9 — Do Not Handle Actual Payments or Donations

PoshanSetu helps users discover and coordinate support.

The actual donation happens outside the platform.

---

## Rule 10 — Both Parties Confirm Completion

A support activity becomes completed only when both required confirmations are received.

---

# 40. Complete High-Level Application Flow

```text
                         POSHANSETU
                              |
                       LANDING PAGE
                              |
        +---------------------+----------------------+
        |                     |                      |
        v                     v                      v
  EXPLORE HELP         FIND REQUIREMENTS      I HAVE FOOD
        |                     |                      |
        v                     v                      v
 MAP / SEARCH        REQUIREMENTS LIST       FOOD MATCHING
        |                     |                      |
        +----------+----------+----------------------+
                   |
                   v
            REQUIREMENT DETAILS
                   |
                   v
             I WANT TO HELP
                   |
           +-------+-------+
           |               |
           v               v
        LOGIN         SUPPORT OFFER
           |               |
           +-------+-------+
                   |
                   v
             SUPPORT DETAILS
                   |
                   v
           DUAL CONFIRMATION
                   |
            +------+------+
            |             |
            v             v
      PARTIALLY       FULLY
      SUPPORTED       FULFILLED
```

Requester flow:

```text
LOGIN
  |
  v
REQUESTER DASHBOARD
  |
  v
SUBMIT REQUIREMENT
  |
  v
UNDER REVIEW
  |
  +-----------------------+
  |                       |
  v                       v
ACTIVE             REQUIRES ATTENTION
  |                       |
  v                       v
SUPPORT OFFERS       REVIEW / UPDATE
  |
  v
PARTIAL / FULL SUPPORT
  |
  v
DUAL CONFIRMATION
  |
  +-------------+
  |             |
  v             v
PARTIALLY     FULFILLED
SUPPORTED
```

Institution flow:

```text
LOGIN
  |
  v
INSTITUTION DASHBOARD
  |
  +-----------------------+
  |                       |
  v                       v
SUBMIT REQUIREMENT   MANAGE INSTITUTION
  |                   PROFILE / DOCUMENTS
  v
AUTOMATED CHECKS
  |
  v
ACTIVE / REQUIRES ATTENTION
  |
  v
DONOR SUPPORT FLOW
```

Admin flow:

```text
ADMIN LOGIN
     |
     v
ADMIN DASHBOARD
     |
     +-----------------------------+
     |             |               |
     v             v               v
FLAGGED       REQUIREMENTS     INSTITUTIONS
REQUIREMENTS
     |
     v
ADMIN REVIEW
     |
     +-----------------------------+
     |             |               |
     v             v               v
KEEP ACTIVE   HIDE TEMPORARILY   REMOVE CONTENT
```

---

# 41. Implementation Instructions for the Coding IDE / AI Agent

Before implementing any PoshanSetu feature, read:

```text
docs/PRD-PoshanSetu-MVP.md
docs/TechDesign-PoshanSetu-MVP.md
docs/Design.md
docs/AppFlow.md
```

Implementation responsibilities:

* Follow PRD for product requirements
* Follow TechDesign for architecture and technology decisions
* Follow Design.md for visual design
* Follow AppFlow.md for routes, navigation, redirects, role-based journeys, and state transitions

Do not treat generated Stitch screens as isolated pages.

They must be implemented as one connected application.

For every screen implemented, verify:

1. How does the user reach this screen?
2. What can the user do on this screen?
3. Where does each important action lead?
4. What happens after success?
5. What happens after failure?
6. What happens if the user is not logged in?
7. What happens if the user does not have permission?
8. How does the user navigate back?
9. What happens if there is no data?
10. What happens while data is loading?

Do not implement a button that has no intended action unless it is explicitly a future-scope placeholder.

---

# 42. Final Definition of Success

The PoshanSetu application flow is successful when a first-time user can intuitively complete the following journeys.

### Journey A

```text
I want to know where help is needed.
```

The user can:

```text
Open PoshanSetu
→ Explore Maharashtra
→ Select a location
→ Understand why attention is needed
→ See how they can help
→ Find current requirements
```

---

### Journey B

```text
I have food. Where can I donate it?
```

The user can:

```text
Open PoshanSetu
→ I Have Food to Donate
→ Enter/select food item
→ Find relevant current requirements
→ Select one
→ Offer support
```

---

### Journey C

```text
I need food support.
```

The user can:

```text
Login
→ Submit Requirement
→ Track Status
→ Receive Support Offers
→ Confirm Support Received
→ Track Completion
```

---

### Journey D

```text
I manage an institution with food requirements.
```

The institution can:

```text
Login
→ Manage Profile
→ Submit Requirement
→ Upload Supporting Documents
→ Track Requirements
→ Receive Support Offers
→ Confirm Support
```

---

### Journey E

```text
I am responsible for platform safety.
```

The admin can:

```text
Login
→ View Flagged Requirements
→ Review Automated Signals
→ Review Relevant Information
→ Take Appropriate Action
```

---

# 43. Final Rule

PoshanSetu must feel like a connected journey:

```text
INTENTION
→ DISCOVERY
→ UNDERSTANDING
→ ACTION
→ COORDINATION
→ CONFIRMATION
→ OUTCOME
```

The user should never feel that they are navigating between unrelated screens.

Every screen, route, button, status, notification, and dashboard action must support this overall journey.

````

Save it as:

```text
AppFlow.md
````

and place it inside your `docs` folder alongside your PRD, technical design, and design files. This will give your coding IDE a clear **navigation blueprint**, while the other documents cover the product, technical architecture, and visual design.
