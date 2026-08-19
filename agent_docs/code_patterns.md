# Code Patterns

## Architecture Pattern
- **Primary pattern:** layered
- **Flow:** route -> controller -> validation -> service -> repository -> PostgreSQL
- Keep domain logic separate from transport and UI concerns.
- The frontend must never access PostgreSQL, Cloudinary secrets, or Firebase Admin SDK.

## Data Fetching
- **Primary approach:** REST/JSON calls from the React client to the Express API.
- Keep fetch logic in feature data modules or hooks, not render functions.
- Public nutrition data and food catalogues may be cached; never publicly cache personalized or sensitive data.
- Paginate requirements and debounce search where appropriate.

## State Management
- **Server state:** local typed fetch modules and React state; add a query library only when a demonstrated need exists.
- **Client state:** React built-in state and context for auth/session UI; do not add a state library by default.
- **Forms:** controlled React forms with boundary validation; use the project's selected runtime schema validator once chosen.
- Prefer the simplest working approach for MVP scope.

## Error Handling
- Normalize errors at service and API boundaries.
- Never swallow errors silently.
- Return user-safe messages and log developer context server-side.
- Use one consistent error shape across API responses.

## Validation
- Validate forms, API payloads, URL parameters, environment variables, quantities, beneficiaries, expiry dates, approved food items, file types, and file sizes.
- Keep rules close to the relevant contract.

## File and Naming Conventions
- **Files:** kebab-case for routes, features, and utilities; use framework-required names where applicable.
- **Components/classes:** PascalCase.
- **Functions/variables:** camelCase.
- **Constants/environment variables:** UPPER_SNAKE_CASE.
- Prefer feature folders and colocated tests.

## Testing Pattern
- Unit-test matching, validation, expiry, status transitions, quantity calculations, confidence calculations, and fraud rules.
- Integration-test frontend -> backend -> database flows, including requirement creation, support, partial fulfillment, and dual confirmation.
- E2E-test the donor, I HAVE FOOD, and requester journeys.
- Test authentication, authorization, uploads, CORS, rate limiting, responsive UI, and accessibility.

## Change Discipline
- Make focused edits and preserve migrations, infrastructure, auth, and third-party configuration.
- Do not introduce dependencies without checking the stack first.
- Implement one feature at a time and checkpoint after each stable milestone.
