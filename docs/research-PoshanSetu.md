# Comprehensive Research Brief: Dynamic Nutrition Needs & Donation Intelligence Platform
## Project Name

# PoshanSetu

## 1. Project Title

# Dynamic Nutrition Needs & Donation Intelligence Platform for Maharashtra

---

## 2. Project Overview

The proposed project is a **web-based platform designed to help NGOs, donors, charitable organizations, CSR teams, institutions, and individuals make more informed food donations**.

The platform will combine:

1. **Latest available government-published nutrition and malnutrition data**
2. **District-level nutrition risk analysis**
3. **Direct needs and requirements submitted by users and institutions such as Ashram Shalas**
4. **Food and grain recommendation logic**
5. **An interactive Maharashtra map**

The primary objective is to answer three simple questions for a person who wants to help:

> ## Where can I help?

> ## Why is help needed there?

> ## How can I help?

Instead of making generic donations without understanding local needs, donors should be able to explore different regions of Maharashtra and receive data-driven guidance about the type of support required.

---

# 3. The Core Problem

Many NGOs, donors, organizations, and individuals want to donate food or nutritional support but face an important problem:

> **They often do not know which regions need help the most, what the actual nutritional challenges are, or what type of food would be most appropriate to donate.**

As a result, donations can become generic and supply-driven.

For example, a donor may decide to donate a large quantity of one type of grain simply because it is easily available, without knowing whether that donation addresses the needs of the intended region or institution.

At the same time, nutrition conditions vary geographically. Government systems such as POSHAN Tracker monitor indicators including:

* Stunting
* Underweight
* Wasting
* Severe Acute Malnutrition (SAM)
* Moderate Acute Malnutrition (MAM)
* Growth monitoring and related service indicators

The Government of India describes POSHAN Tracker as a near-real-time/dynamic monitoring system used for identifying and monitoring nutrition indicators. As of May 2026, official government information stated that it maintained a live monthly nutrition database and tracked indicators including stunting, underweight, wasting, SAM/MAM, and overweight/obesity. ([Press Information Bureau][1])

However, this information may not be easily understandable or actionable for an ordinary donor.

The project aims to bridge this gap.

---

# 4. Proposed Solution

The platform will transform complex nutrition and local requirement information into a **simple decision-support experience**.

The basic flow will be:

```text
Government Nutrition Data
          +
Local Needs Submitted by Institutions/Users
          ↓
District Need & Nutrition Risk Analysis
          ↓
Interactive Maharashtra Map
          ↓
Donor Selects a Location
          ↓
WHERE is help needed?
          ↓
WHY is help needed?
          ↓
HOW can the donor help?
          ↓
Suggested Food/Grain Categories
+
Verified/Confidence-Scored Local Requirements
```

The platform should **not merely display statistics**.

Its primary purpose is to help a potential donor move from:

> "I want to help, but I don't know where or what to donate."

to:

> "This location has these identified needs, and these are the practical ways I can help."

---

# 5. Target Users

The platform will primarily serve the following stakeholders.

## 5.1 Donors

Including:

* Individual donors
* Corporate donors
* CSR teams
* Philanthropic organizations

Their primary need is:

> To discover where their support can create the most relevant impact and understand how they can contribute.

---

## 5.2 NGOs and Charitable Organizations

NGOs can use the platform to:

* Understand district-level nutrition risks
* Identify areas requiring greater attention
* Explore local requirements
* Plan more targeted food support
* Make data-informed intervention decisions

---

## 5.3 Food Banks and Donation Organizations

These organizations may use the platform to understand:

* Geographic need patterns
* Priority districts
* Submitted institutional requirements
* Potential food categories required

---

## 5.4 Ashram Shalas and Other Institutions

Institutions may submit their current needs through the platform.

Examples include:

* Ashram Shalas
* Schools
* Residential institutions
* Community organizations
* Other eligible institutions requiring food support

They can submit information such as:

```text
Institution Name
Location
District
Number of Beneficiaries
Beneficiary Category
Food Requirements
Required Food Categories
Estimated Quantity Required
Urgency Level
Additional Notes
```

---

## 5.5 Normal Users

Normal users may also report or submit relevant needs, subject to automated confidence checks and platform safeguards.

---

# 6. Primary User Journey: The Donor Experience

The donor journey should be one of the most important aspects of the project.

The platform should not initially overwhelm the user with technical terms such as SAM, MAM, stunting, or complex datasets.

Instead, the journey should be:

## Step 1: Donor Opens the Platform

The donor sees:

> **Find Where Your Help Matters**

The user is shown an interactive map of Maharashtra.

---

## Step 2: Donor Explores the Map

Districts can be visually represented according to a calculated **Need/Risk Level**.

For example:

```text
Low Need/Risk
Moderate Need/Risk
High Need/Risk
Priority/Critical Need
```

The exact colours and classifications should be scientifically and technically defined rather than arbitrarily assigned.

---

## Step 3: Donor Selects a District or Location

For example:

```text
Nashik
```

The platform displays:

### Need Level

```text
HIGH PRIORITY
```

### Why?

A simple explanation such as:

```text
• Nutrition indicators require greater attention
• The recent trend has worsened/stayed elevated
• Local institutions have submitted current requirements
```

The actual explanation must be based only on available and reliable data.

---

## Step 4: How Can I Help?

The donor should see actionable options.

For example:

```text
Suggested Support Areas

• Support appropriate supplementary nutrition
• Donate recommended food/grain categories
• Fulfil verified local requirements
• Support a specific institution
```

The platform should avoid unsupported medical claims.

For example, it should **not say**:

> "This district has iron deficiency."

unless the underlying dataset genuinely contains valid evidence supporting that specific claim.

---

# 7. Important Scientific Limitation

This is one of the most important research questions.

Nutrition data such as:

* Stunting
* Wasting
* Underweight
* SAM
* MAM

does **not automatically prove a specific micronutrient deficiency**, such as:

* Iron deficiency
* Zinc deficiency
* Vitamin A deficiency

Therefore, the project must not falsely claim:

> "We detect the exact nutritional deficiency of a district."

unless a valid data source actually supports such a conclusion.

The official POSHAN ecosystem primarily supports monitoring of growth and malnutrition indicators. Government material also describes the supplementary nutrition framework as emphasizing diet diversity, protein, healthy fats and essential micronutrients, but this does not mean every district-level growth indicator can be directly translated into one confirmed micronutrient deficiency. ([Press Information Bureau][2])

Therefore, the research must determine a **scientifically valid recommendation methodology**.

A possible safer approach is:

```text
Nutrition Risk Pattern
        ↓
Evidence-Based Intervention Category
        ↓
Suitable Food/Grain Category
```

rather than:

```text
SAM/MAM
        ↓
Assume a specific vitamin deficiency
        ↓
Recommend a food
```

The second approach would be scientifically unsafe.

---

# 8. Government Data Requirement

A major requirement of the project is that the platform should not depend entirely on an old static dataset.

The platform should attempt to use:

> **The latest available government-published nutrition data that can be legally and technically accessed automatically.**

POSHAN Tracker is highly relevant because official Government of India sources describe it as an ICT-based governance system that supports near-real-time or dynamic identification and monitoring of stunting, wasting, and underweight, as well as nutrition service delivery. ([Press Information Bureau][2])

Official government information published in 2026 describes a live monthly database and large-scale monitoring of child nutrition indicators. ([Press Information Bureau][1])

---

# 9. Free API and Dynamic Data Research Requirement

A major research objective is to determine:

> **Can the project access dynamically updated nutrition data through a free, publicly documented API?**

This must be researched and verified carefully.

The research should distinguish between:

```text
Dynamic data exists
```

and:

```text
A free public developer API exists
```

These are not the same thing.

For example, government sources confirm that POSHAN Tracker dynamically collects and monitors nutrition data, but some OGD resources containing POSHAN-related data explicitly list their sourced web services/APIs as `NA`. ([Data.gov.in][3])

Therefore, the project must not assume that a public API exists simply because a public dashboard exists.

---

# 10. Data Sources to Research

The research must investigate the following.

## 10.1 POSHAN Tracker

Research:

* Is there an official public API?
* Is it free?
* Is developer access documented?
* Does it require authentication?
* Is district-level Maharashtra data available?
* What is the update frequency?
* What indicators are available?
* Is access legally supported for third-party applications?

Official sources confirm that POSHAN Tracker monitors dynamic nutrition indicators and was created for near-real-time monitoring. ([Press Information Bureau][2])

---

## 10.2 data.gov.in

Research:

* Available nutrition APIs
* Available Maharashtra district-level datasets
* API key requirements
* Whether APIs are free
* Rate limits
* Update frequency
* Geographic granularity

The OGD platform contains Maharashtra district-wise nutritional indicator data from POSHAN Tracker, including stunting, underweight and wasting, although at least the currently identified Maharashtra June 2024 resource is a historical snapshot rather than proof of a continuously accessible live API. ([Data.gov.in][3])

---

## 10.3 Ministry of Women and Child Development

Research:

* Mission POSHAN 2.0 datasets
* POSHAN Tracker statistics
* Public reports
* Official APIs
* Monthly or periodic publications

---

## 10.4 Ministry of Health and Family Welfare / HMIS

Research whether HMIS provides relevant district-level indicators that can supplement the nutrition picture.

The OGD platform lists district-level HMIS indicators, including anaemia-related indicators such as pregnant women tested with Hb levels below specified thresholds. The research should determine whether these indicators are suitable for this project's use case and whether they are current and accessible through a usable API. ([Data.gov.in][4])

---

## 10.5 Government of Maharashtra

Research:

* Women and Child Development Department
* ICDS-related reports
* Maharashtra nutrition dashboards
* District-level data
* Downloadable or API-accessible datasets

Maharashtra's Women and Child Development Department describes POSHAN Abhiyaan as using ICT-enabled real-time monitoring and dashboards at multiple administrative levels. ([WCD Maharashtra][5])

---

## 10.6 NFHS

NFHS should be considered primarily for:

* Historical context
* Baseline comparison
* Broader health and nutrition indicators

It should not automatically be treated as a live data source.

---

## 10.7 Kaggle

The research must identify **new and reliable Kaggle datasets** that may help the project.

However, every Kaggle dataset must be evaluated for:

```text
Original Source
Data Collection Period
Last Update Date
Reliability
Geographical Granularity
Maharashtra Coverage
District Coverage
Indicators Available
Licensing
Whether Data Is Static or Updated
```

Kaggle should not be presented as a real-time source unless the underlying dataset is genuinely connected to an updated source.

Possible roles for Kaggle data include:

```text
Historical Analysis
Additional Indicators
Prototype Development
Fallback Demonstration Data
Model Development
```

---

# 11. Existing Solutions and Competitor Research

The project team currently does not know all existing solutions.

Research should investigate:

* Food donation platforms
* Food banks
* NGO donation management systems
* Nutrition intelligence platforms
* Government nutrition dashboards
* Surplus food redistribution platforms
* Geographic need mapping platforms

The key research question is:

> **Does an existing platform combine district-level nutrition information, local submitted requirements, geographic visualization, and actionable food donation guidance for donors?**

The research should identify:

```text
Existing Solution
What It Does
Target Users
Data Used
Key Features
Limitations
What Our Project Can Do Differently
```

The purpose is not merely to claim that "no solution exists."

Instead, the goal is to identify a genuine gap.

---

# 12. Core Platform Modules

## Module 1: Interactive Maharashtra Need Map

Features:

* Maharashtra map
* District selection
* Need/risk visualization
* District summary
* Latest available reporting date
* Data source information

The user should quickly understand:

> Where is help needed?

---

## Module 2: District Nutrition Risk Analysis

The platform will analyze available indicators such as:

* Stunting
* Underweight
* Wasting
* SAM
* MAM
* Growth monitoring coverage

The exact available indicators will depend on the final verified data source.

A transparent risk score may be calculated.

Conceptually:

```text
Nutrition Risk Score
        =
Normalized SAM Indicator
+
Normalized MAM Indicator
+
Normalized Underweight Indicator
+
Normalized Stunting Indicator
+
Trend Indicator
```

Weights and thresholds must be justified through research and should not be presented as official government classifications unless they actually are official.

The platform should clearly state:

> **Project-defined prioritization score**

if it uses its own methodology.

---

## Module 3: Trend Analysis

The platform should compare data across available reporting periods.

For example:

```text
January → February → March → April
```

It can identify:

```text
Improving
Stable
Worsening
Insufficient Data
```

This helps the platform move beyond displaying a single static number.

---

## Module 4: Food and Grain Recommendation Engine

The recommendation engine should help answer:

> What can I donate?

It must be based on:

1. Reliable nutrition information
2. Available nutrition-risk indicators
3. Official nutrition guidance where applicable
4. Food composition data
5. Local or submitted requirements

The research must find reliable food nutrition databases and official sources suitable for India.

Recommendations should preferably be framed as:

```text
Recommended Support Categories
```

rather than pretending to prescribe medical treatment.

Examples:

```text
Protein-rich food options
Iron-rich food options where valid evidence supports relevance
Diet-diverse food support
Supplementary nutrition support
Staple food requirements
Specific verified institutional requirements
```

---

# 13. Needs and Requirements Submission Module

A major feature of the project is that real local needs should supplement government-level data.

A user or institution can submit a requirement.

Suggested fields:

```text
Institution/User Name
Institution Type
Location
District
Address/Coordinates
Contact Information
Number of Beneficiaries
Beneficiary Category
Food Category Needed
Quantity Needed
Duration/Estimated Requirement
Urgency
Reason/Description
Supporting Details
```

This creates a second source of information:

```text
Government-Level Nutrition Information
              +
Ground-Level Submitted Requirements
              ↓
More Complete District Need Profile
```

---

# 14. Automated Verification and Trust System

The project should attempt to minimize manual intervention.

However:

> **No automated system should claim that it can perfectly prove every submitted request is genuine.**

Instead, the platform should implement an **Automated Trust/Confidence Score**.

---

## 14.1 Automated Checks

### Identity Verification

Possible checks:

* Email verification
* Phone OTP
* Institution details
* Publicly verifiable institutional identifier where available

---

### Location Validation

Check:

```text
Does the district exist?
Does the selected location match Maharashtra?
Does the submitted location match the stated district?
```

---

### Duplicate Detection

Detect:

* Identical submissions
* Repeated submissions
* Similar requests from the same institution
* Repeated requests within a short time

---

### Quantity Sanity Check

Example:

```text
Beneficiaries: 30
Requested Quantity: Extremely disproportionate amount
```

The platform can flag the request.

Sanity checks should consider:

* Number of beneficiaries
* Food category
* Estimated period of need

---

### Consistency Check

The system can compare:

```text
Submitted Need
        +
District-Level Risk Information
```

A request consistent with broader district conditions may receive a higher consistency score.

However:

> Consistency with district data does not prove that a request is genuine.

This distinction must be clearly maintained.

---

## 14.2 Trust Labels

Instead of displaying every request as simply "Verified," the platform should use transparent confidence labels.

For example:

```text
High Confidence
Multiple automated checks passed

Medium Confidence
Some checks passed; more information recommended

Low Confidence / Flagged
Potential inconsistency or insufficient verification
```

The exact terminology can be improved during UI design.

---

# 15. Role of AI

AI should be used where it provides genuine value.

AI should **not** be responsible for:

> Randomly deciding which district is in need.

Instead:

```text
Verified Data
      ↓
Rule-Based / Statistical Analysis
      ↓
Risk Score and Trends
      ↓
AI
      ↓
Human-Friendly Explanation
```

Possible AI uses:

* Explain complex district data in simple language
* Summarize why a district is prioritized
* Classify submitted requirements
* Detect suspiciously similar descriptions
* Assist duplicate detection
* Help users understand possible ways to contribute
* Generate data-backed summaries

---

# 16. RAG Requirement

If AI recommendations are included, research whether a **Retrieval-Augmented Generation (RAG)** approach is useful.

Trusted documents may include:

* Government nutrition guidelines
* Mission POSHAN 2.0 guidance
* ICDS/Supplementary Nutrition Programme information
* Official food and nutrition resources
* Reliable nutrition research

The objective is:

```text
District Data
       +
Retrieved Trusted Guidance
       ↓
AI Explanation
       ↓
Evidence-Based Response
```

The AI should not invent nutritional facts.

---

# 17. Recommended Technology Research

The project will be a web application.

Technologies currently known or partly known by the developer include:

* HTML
* CSS
* JavaScript
* React
* Tailwind CSS
* Node.js basics
* SQL
* PostgreSQL
* Git/GitHub

The developer is open to learning:

* Firebase Authentication
* APIs
* n8n
* AI/RAG

The research should recommend a stack that is:

```text
Fast to Build
Free or Low Cost
Suitable for a Student Project
Reliable
Simple Enough for a 2–3 Day MVP
Expandable Later
```

Potential architecture:

```text
React + Tailwind
        │
        ├── Firebase Authentication
        │
        ▼
Node.js / Express
        │
        ├── Nutrition Risk Engine
        ├── Food Recommendation Engine
        ├── Need Submission Module
        └── Optional AI/RAG
        │
        ▼
PostgreSQL
        ▲
        │
Automatic Data Ingestion
n8n / Scheduled Job
        ▲
        │
Verified Government Data Source
```

Firebase Authentication should be researched as an option for:

* Donor authentication
* Institution authentication
* Role-based access

---

# 18. Authentication and User Roles

Possible user roles:

## Donor

Can:

* Browse map
* View district needs
* View recommendations
* Explore verified/confidence-scored requirements

---

## Institution / Ashram Shala

Can:

* Create an account
* Submit requirements
* Update requirements
* View request status

---

## Normal User

Can:

* Explore data
* Potentially submit needs subject to automated checks

---

## Admin

For the MVP, manual administration should be minimized.

However, an administrative role may eventually be required for:

* Managing suspicious submissions
* Monitoring system issues
* Handling disputes

---

# 19. Data Automation Architecture

The final architecture should depend on the result of API research.

Preferred architecture:

```text
Verified Government API
        │
        ▼
Automated Fetcher
n8n / Cron / Backend Job
        │
        ▼
Validation & Normalization
        │
        ▼
PostgreSQL
        │
        ▼
Node.js Backend
        │
        ▼
React Web Application
```

If no suitable free official API exists:

```text
Official Periodically Updated Dataset
        │
        ▼
Automated Change Detection
        │
        ▼
Download / Parse
        │
        ▼
Validate
        │
        ▼
Database
```

The system should always record:

```text
Data Source
Source URL
Reporting Period
Date Fetched
Last Successful Sync
```

---

# 20. Important Data Transparency Requirement

Every district-level result should ideally display:

```text
Data Source
Latest Reporting Period
Last Synchronized Date
Data Availability Status
```

For example:

```text
Source: Government of India / Verified Dataset
Reporting Period: May 2026
Last Synced: August 18, 2026
```

The dates must be generated from actual system data, not hard-coded.

This allows the project to honestly claim:

> **Automatically updated using the latest available verified source data**

rather than falsely claiming "real-time data."

---

# 21. Real-Life Testing Plan

The research must create a detailed testing plan.

## Test Case 1: Donor Finds a High-Priority District

```text
Given:
A donor wants to help.

When:
The donor opens the Maharashtra map.

Then:
The donor can identify districts based on available need/risk information.
```

---

## Test Case 2: Donor Understands Why

```text
When:
The donor selects a district.

Then:
The platform explains the available indicators and/or submitted requirements in understandable language.
```

---

## Test Case 3: Donor Understands How to Help

```text
When:
The district details are displayed.

Then:
The donor receives actionable support categories or relevant verified requirements.
```

---

## Test Case 4: Institution Submits a Requirement

```text
Given:
An Ashram Shala needs food support.

When:
It submits its details.

Then:
The system validates identity/location/quantity and assigns an automated confidence status.
```

---

## Test Case 5: Duplicate Submission

```text
When:
The same requirement is submitted multiple times.

Then:
The system detects or flags possible duplicates.
```

---

## Test Case 6: Unrealistic Quantity

```text
Given:
A small institution reports a disproportionately large food requirement.

Then:
The automated sanity check flags the request.
```

---

## Test Case 7: Outdated Government Data

```text
Given:
No new government data is available.

Then:
The platform displays the latest available reporting period rather than pretending the data is current.
```

---

## Test Case 8: Data Source Failure

```text
Given:
The API or source cannot be reached.

Then:
The system should:
- Not delete existing data
- Keep the last known valid dataset
- Record synchronization failure
- Avoid falsely reporting a successful update
```

---

## Test Case 9: Missing District Data

```text
Given:
A district has missing values.

Then:
The platform should display:
"Insufficient data"
rather than calculate a misleading score.
```

---

## Test Case 10: Food Recommendation Safety

```text
Given:
Only general malnutrition indicators are available.

Then:
The platform must not claim a specific micronutrient deficiency without evidence.
```

---

# 22. Project Storyline

The project should be presented through a simple human-centered story.

## Proposed Story

> Imagine a person who wants to donate food. They have the willingness and resources to help, but one important question remains: **Where should I donate, and what should I donate?**
>
> Without information, the donor may choose a location randomly and send generic food that may not match the needs of that region.
>
> Our platform changes this process. The donor opens a map of Maharashtra and can explore different regions. The platform highlights areas based on the latest available nutrition-risk information and local requirements submitted by institutions.
>
> When the donor selects a location, the platform answers three questions: **Where is help needed? Why is help needed? And how can I help?**
>
> Instead of simply displaying complex government statistics, the system converts available information into understandable insights and suggests relevant ways to contribute, including appropriate food-support categories and verified local requirements.
>
> At the same time, institutions such as Ashram Shalas can submit their current needs. These submissions pass through automated validation and confidence checks before being presented appropriately to donors.
>
> The goal is simple: **make food donations more informed, targeted, transparent, and useful.**

---

# 23. Main Value Proposition

The platform combines two perspectives:

```text
TOP-DOWN VIEW
Government Nutrition Data
        +
BOTTOM-UP VIEW
Actual Local Requirements
        ↓
ACTIONABLE DONATION INTELLIGENCE
```

This is the project's core differentiator.

The platform should help transform:

```text
"I want to donate something."
```

into:

```text
"I understand where support is needed,
why it is needed,
and what kind of contribution may be most useful."
```

---

# 24. SDG Alignment

## Primary SDG 2: Zero Hunger

The project supports more targeted food and nutrition assistance by helping donors and organizations identify areas requiring greater support.

---

## Primary SDG 3: Good Health and Well-Being

The platform uses available nutrition and malnutrition indicators to improve awareness and support data-informed nutrition interventions.

---

## Supporting SDG 9: Industry, Innovation and Infrastructure

The platform creates digital infrastructure combining:

* Government data
* Automation
* Data analytics
* Interactive maps
* AI-assisted explanation

---

## Supporting SDG 10: Reduced Inequalities

The district-level approach can help highlight geographic differences and bring attention to regions with greater identified needs.

---

## Supporting SDG 17: Partnerships for the Goals

The platform can connect:

```text
Government Data
+
NGOs
+
Donors
+
Institutions
+
Technology
```

to support better coordination.

---

# 25. Success Criteria

The project will be considered successful if the MVP can demonstrate:

1. The website uses the latest available reliable data automatically where technically feasible.
2. Maharashtra district-level nutrition or need information is displayed.
3. Users can explore an interactive map.
4. A donor can identify **where help is needed**.
5. A donor can understand **why help is needed**.
6. A donor can understand **how they can help**.
7. The system provides useful and evidence-based food/grain support guidance.
8. Ashram Shalas/institutions can submit their needs.
9. Submitted needs receive automated validation/confidence checks.
10. The system handles missing, outdated, duplicate, and suspicious data safely.
11. The project can demonstrate realistic test cases.

---

# 26. Development Timeline

## Available Time

**2–3 days**

Therefore, the project must focus on a realistic MVP.

---

# 27. MVP Priority

## Must Build

```text
Interactive Maharashtra Map
District-Level Data Display
Reliable Nutrition/Need Dataset
Automated Data Update Mechanism Where Feasible
District Risk/Need Analysis
Food/Grain Recommendation Logic
Needs Submission Form
Automated Basic Trust Checks
Authentication
Real-Life Testing Plan
Strong User Story
```

---

## Nice to Have

```text
Advanced RAG
Complex AI Agents
Full Automated Donor Matching
Advanced Institution Registry Verification
Real-Time Notification System
Complex ML Models
Advanced Fraud Detection
```

These should not delay the MVP.

---

# 28. Key Research Questions to Answer

The final research must answer the following clearly.

### Data

1. What is the best available district-level nutrition data source for Maharashtra?
2. Is it government-owned?
3. How frequently is it updated?
4. Is there a free API?
5. Is the API officially documented?
6. Does it require an API key?
7. If no API exists, can updates still be automated legally using official downloadable data?
8. What exact indicators are available?

### Scientific Validity

9. Can available indicators support specific food recommendations?
10. Can the system identify micronutrient deficiencies directly?
11. If not, what claims must the platform avoid?
12. What scientifically defensible recommendation methodology should be used?

### Kaggle

13. Which recent and reliable Kaggle datasets are suitable?
14. What is their original source?
15. Are they static or dynamically updated?

### Existing Solutions

16. What similar platforms already exist?
17. What features do they offer?
18. What gap does this project fill?

### Technology

19. What is the fastest practical stack for a 2–3 day MVP?
20. Should Firebase Authentication be used?
21. Should n8n be used, or is a simpler scheduled backend job better?
22. Is AI/RAG genuinely useful for the MVP?

### User Experience

23. How does a donor discover a location?
24. How does the platform explain why help is needed?
25. How does the donor know what action to take?

### Trust and Safety

26. How can submitted requirements be checked automatically?
27. What can automation verify?
28. What cannot be reliably verified without stronger external validation?
29. How should confidence be communicated to donors?

---

# 29. Important Constraints

The research and solution should respect these constraints:

```text
Platform: Web Application

Timeline: 2–3 Days

Preferred Cost: Free or Free-Tier Tools

Primary Geography: Maharashtra

Primary Users:
NGOs
Donors
CSR Teams
Institutions
Ashram Shalas
Normal Users

Data Requirement:
Latest Available Reliable Data

Important:
Do Not Assume a Public API Exists Without Verification

Important:
Do Not Claim Real-Time Data If the Source Is Monthly or Periodic

Important:
Do Not Claim Specific Micronutrient Deficiencies Without Supporting Data

Important:
Minimize Manual Intervention

Important:
Clearly Distinguish Automated Confidence Checks from Genuine Proof of Legitimacy
```

---

# 30. Final Project Definition

> **The Dynamic Nutrition Needs & Donation Intelligence Platform is a web-based decision-support system for Maharashtra that combines the latest available reliable nutrition information with locally submitted institutional requirements. It helps NGOs and donors discover where support is needed, understand why it is needed, and identify practical ways to contribute through more targeted food and nutrition support.**
>
> **The platform uses an interactive map, transparent data sources, district-level risk/need analysis, evidence-based recommendation logic, and automated confidence checks for submitted requirements to make the donation process more informed and actionable.**

---

## Immediate Research Priority

Before committing to the final technical architecture, the **highest-priority task** is:

> **Find and verify a reliable, free, legally accessible source of Maharashtra district-level nutrition data that is updated periodically or dynamically, and determine whether it offers a genuinely usable public API.**

Official sources establish that POSHAN Tracker itself is dynamic and used for near-real-time nutrition monitoring, while identified OGD resources show that publicly available Maharashtra datasets can be historical snapshots with no source API listed. That exact distinction needs to drive the research rather than assuming the dashboard automatically provides a developer API. ([Data.gov.in][3])

[1]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2282421&lang=1&reg=1&utm_source=chatgpt.com "Press Release Page | Press Information Bureau"
[2]: https://www.pib.gov.in/FactsheetDetails.aspx?Id=150744&lang=1&reg=36&utm_source=chatgpt.com "Factsheet Details:Factsheet Details | PIB"
[3]: https://www.data.gov.in/resource/district-wise-details-nutritional-indicators-children-state-maharashtra-june-2024?utm_source=chatgpt.com "District-wise Details of Nutritional Indicators for Children in the State of Maharashtra as on June 2024 | Open Government Data (OGD) Platform India"
[4]: https://www.data.gov.in/catalog/performance-key-hmis-indicators-upto-district-level-all-indicators?utm_source=chatgpt.com "Performance of key HMIS Indicators (UpTo District Level) for All Indicators | Open Government Data (OGD) Platform India"
[5]: https://www.womenchild.maharashtra.gov.in/en/poshan-abhiyaan?utm_source=chatgpt.com "Poshan Abhiyaan | Women and Child Development Department, Government of Maharashtra"
