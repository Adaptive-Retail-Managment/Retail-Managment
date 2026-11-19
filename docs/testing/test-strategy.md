# Test strategy

## Layers

| Layer          | Tool                     | Location                                             | Needs DB?                                          |
| -------------- | ------------------------ | ---------------------------------------------------- | -------------------------------------------------- |
| Unit (API)     | Jest + ts-jest           | `apps/api/src/**/*.spec.ts`                          | No                                                 |
| E2E (HTTP)     | Jest + Supertest         | `apps/api/test/e2e/**/*.e2e-spec.ts`                 | No (database health is stubbed at the DI boundary) |
| Integration    | Jest + real Prisma       | `apps/api/test/integration/**/*.integration-spec.ts` | Yes (`pnpm db:up`)                                 |
| Unit (web)     | Vitest + Testing Library | `apps/web/src/**/*.spec.tsx`                         | No                                                 |
| Unit (desktop) | Vitest                   | `apps/desktop/electron/**/*.spec.ts`                 | No                                                 |

## What the foundation tests prove

- Environment validation: defaults, coercion, origin splitting, rejection of missing/invalid
  `DATABASE_URL`, ports and URLs.
- Database health: success, failure without leaking details, timeout.
- Readiness: `ok`/`degraded` aggregation and version propagation.
- HTTP: liveness never touches the DB; readiness maps DB up/down to 200/503; probes stay outside
  `/api`.
- Web: healthy, degraded (503 readiness) and unreachable API states.
- Desktop: renderer target selection (dev server vs shared web build).

## What is not covered yet

- Authentication/authorization, tenancy isolation, inventory invariants, money arithmetic,
  offline sync idempotency — none of these modules exist.
- Browser-level end-to-end (Playwright) and visual regression.
- Electron runtime tests (the GUI is not launched in CI).

## Rules for future slices

- Every workflow that changes stock or money needs: unit tests for domain rules, an integration
  test against real PostgreSQL proving transaction/rollback behaviour, and an e2e test proving
  authorization and isolation failures.
- Tests must exercise the real database for constraints (no negative stock, unique acceptances,
  idempotency keys); mocks are not accepted as proof for those invariants.
- Offline sync needs duplicate-delivery, conflict and retry tests.
- Do not mark a slice complete on unit tests alone when the database is part of the contract.
