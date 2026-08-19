# Product Requirements

## Product Summary
- **Product:** PoshanSetu
- **One-liner:** A Maharashtra-focused platform that combines official district nutrition context with current local food requirements so donors can find where and how to help.
- **Target users:** Public visitors, registered donors and requesters, institutions, NGOs, schools, Ashram Shalas, charitable organizations, and admins.

## Primary User Story
A donor who has food available can explore Maharashtra, understand why a district may need attention, find current local requirements, and offer relevant support to a requester.

## User Stories
- As a public user, I want to browse Maharashtra locations and district nutrition information so that I understand where attention may be needed.
- As a donor, I want to enter the food and quantity I have so that I can find compatible active requirements.
- As a requester or institution, I want to submit and manage a validated food requirement so that relevant donors can respond.
- As a donor, I want to offer partial or complete support and confirm it so that support history remains traceable.
- As an admin, I want to moderate requirements, institutions, flags, nutrition data, and audit records so that the platform remains trustworthy.

## Feature List (MoSCoW)
### Must Have (P0)
- [ ] Landing page and navigation
- [ ] Maharashtra location browsing and search
- [ ] District nutrition information
- [ ] Current local requirements
- [ ] WHERE -> WHY -> HOW journey
- [ ] Food categories and food information
- [ ] Food-to-need matching
- [ ] Firebase authentication and user registration
- [ ] Requirement submission and validation
- [ ] Donor response
- [ ] Basic donor/requester dashboards
- [ ] Requirement statuses and expiry
- [ ] Partial support and dual confirmation
- [ ] Basic notifications
- [ ] Admin dashboard
- [ ] Basic privacy/security
- [ ] Source transparency

### Should Have (P1)
- [ ] Institution profiles and verification
- [ ] Document upload and Cloudinary integration
- [ ] Automated verification
- [ ] Duplicate detection
- [ ] Multiple-account and nearby-location detection
- [ ] Fraud flags and administrative moderation
- [ ] Support history and requirement renewal
- [ ] Advanced dashboards and detailed notifications
- [ ] Audit logs
- [ ] Food knowledge base and detailed nutrition explanations
- [ ] Advanced filters, support tracking, and confidence levels

### Could Have (P2)
- [ ] RAG
- [ ] AI natural-language search
- [ ] Semantic matching
- [ ] Advanced duplicate detection and fraud analytics
- [ ] Predictive requirement analysis and demand forecasting
- [ ] Advanced analytics
- [ ] Pan-India expansion
- [ ] Advanced identity verification
- [ ] Email notifications and mobile OTP
- [ ] External registry integrations
- [ ] Advanced donor impact reports

### Won't Have in This Version
- Monetary donations, payment gateways, UPI, financial donations, bank transfers, or cryptocurrency
- Physical food transport, delivery, or logistics
- Medical diagnosis, disease claims, treatment prescriptions, or replacement of nutritionists and healthcare workers
- Guaranteed legitimacy of every requester

## Success Metrics
- A first-time visitor understands the primary purpose and modules within approximately 10 seconds.
- A donor reaches relevant requirements within approximately 3-5 meaningful interactions.
- A valid requirement completes Submission -> Validation -> Active -> Support -> Confirmation -> Fulfilled without manual database modification.
- 100% of displayed official nutrition indicators show source, reporting period, and last synchronization information.
- Protected API endpoints require authentication and authorization.
- Requirement and support history remains traceable.
- The MVP operates on free-tier infrastructure.

## UX and Constraints
Use readable typography, adequate contrast, keyboard navigation where practical, descriptive labels, accessible errors, meaningful buttons, semantic HTML, clean URLs, responsive desktop/tablet/mobile layouts, clear loading/error states, and a simple human-centered experience inspired by usability patterns but not copied branding. Do not combine official indicators and user needs into an arbitrary nutrition score.
