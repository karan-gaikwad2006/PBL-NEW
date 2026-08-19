# Artifact Review Checklist

Do not mark a feature or task complete until these checks are verified manually or with automated tests.

## Code Quality & Safety
- [ ] No `any` types used or strictly justified with `unknown` and type guards.
- [ ] Protected files and directories were not modified without permission.
- [ ] No existing unrelated tests were deleted or skipped.
- [ ] Components and functions respect architecture boundaries.

## Execution & Testing
- [ ] Application compiles without fatal errors.
- [ ] Linter passes.
- [ ] Type check passes.
- [ ] Related unit and integration tests pass.
- [ ] UI is responsive across desktop and mobile viewports.

## Security
- [ ] No hardcoded secrets, API keys, or tokens.
- [ ] `.env` and other secret files are gitignored and uncommitted.
- [ ] Dependencies audited; high-severity findings addressed or documented.
- [ ] User input is validated and sanitized at every boundary.
- [ ] Auth-protected routes and actions were tested while logged out.
- [ ] Rate limiting or equivalent abuse protection was considered for public endpoints.

## Artifact Handoff
- [ ] `MEMORY.md` records architectural decisions and current state.
- [ ] Obsolete specs are marked resolved or archived.
- [ ] Official nutrition indicators show source, reporting period, and synchronization details.
- [ ] Support cannot become fulfilled without both confirmations.
