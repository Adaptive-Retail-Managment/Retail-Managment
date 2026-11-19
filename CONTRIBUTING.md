# Contributing

## Architecture rules (non-negotiable)

1. Modular monolith. Do not introduce services, queues or separate databases for business modules.
2. No circular module dependencies. A module's repositories/Prisma access are private to it.
3. Enforce business and branch isolation in backend queries; never rely on the UI.
4. Enforce permissions on the backend. Business Admin is digital-only and gets no physical
   operational permissions.
5. Stock changes only through explicit workflows that write an audit-trail ledger. Never allow
   negative stock. A purchase order does not increase stock; accepted receiving does.
6. Wrap sales, receiving, payments, refunds and other money operations in transactions with
   concurrency control.
7. Preserve history: archive/deactivate, never delete financial or audit records.
8. AI output is advisory. It cannot approve or execute operational actions.
9. Offline transactions are stored locally before success is reported and synchronized
   idempotently. Never drop failed or conflicting transactions.
10. Build only what the current slice needs. Do not scaffold empty modules to fill the folder tree.

## Workflow

1. Start each slice with the files you intend to create/change and the invariants it enforces.
2. Backend first (domain → application → HTTP), then migration, then UI, then tests.
3. Every schema change is a committed Prisma migration; no `db push` against shared databases.
4. Update docs when behaviour, configuration or commands change.
5. Report: completed work, changed files, migrations, tests actually run, gaps, next slice.
   Never claim unverified results.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Small PRs per vertical slice; do not mix unrelated refactors.
- Backend: NestJS modules; typed DTOs validated by `ValidationPipe`; no business logic in
  controllers.
- Frontend: feature folders (`api/`, `components/`, `pages/`, `hooks/`); shared UI goes to
  `packages/ui` only after it has two real consumers.
- Money must use exact decimal types; never `number` for currency in persisted data.
- Errors are typed and mapped to stable HTTP codes; do not leak database errors.

## Checks before review

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:e2e
pnpm db:up && pnpm test:integration
pnpm build
```

CI runs the same sequence with a PostgreSQL service container.
