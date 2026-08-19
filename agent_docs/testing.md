# Testing Strategy

## Frameworks
- **Unit Tests:** Test framework to be selected during scaffold; use the project's configured JavaScript/TypeScript unit runner.
- **E2E Tests:** Playwright is the recommended browser E2E tool once the app exists.
- **Integration:** Use the selected unit runner and an isolated test database or test fixtures for API contracts.

## Rules & Requirements
- **Coverage:** Aim for meaningful coverage of all critical paths, especially matching, validation, expiry, status transitions, support quantities, confidence, and fraud rules.
- **Before Commit:** Run `npm test`, `npm run lint`, and the available type-check command before declaring a task complete.
- **Failures:** Never skip tests or weaken assertions to pass. Fix the implementation or ask the human before changing test intent.
- Test after every feature, not only at the end.

## Required Test Areas
- Authentication: signup, login, logout, invalid credentials, public/protected routes, role authorization, and admin authorization.
- Security: unauthorized requests, invalid Firebase tokens, fake admin roles, SQL injection attempts, invalid input, oversized/unsupported uploads, CORS, rate limiting, and sensitive information exposure.
- Integration: requirement submission, fetching, support offers, partial support, both confirmations, and fulfillment.
- Browser journeys: landing -> location -> nutrition -> requirements -> login -> support; I HAVE FOOD matching; requester submission and validation.
- UI: navigation, forms, map, cards, dashboards, notifications, modals, tables, loading/error states, responsive desktop/mobile behavior, keyboard access, labels, focus states, and alt text.

## Execution
- Command to run all tests: `npm test`
- Command to run a single test file: use the test runner's file filter after it is selected and recorded in `package.json`.
- Browser verification: run the configured Playwright command against the local dev server.
- Build verification: `npm run build`; type checking should use the script added during scaffold, commonly `npm run typecheck`.
