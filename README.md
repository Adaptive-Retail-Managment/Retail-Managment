# Adaptive Retail Intelligence Platform

One modular-monolith platform for four business types — **grocery & food**,
**fashion & clothing**, **pharmacy & medicine** and **cosmetics & beauty** — delivered as a
single backend, a shared React web app and an Electron desktop shell.

> **Current stage: foundation only.** There is no domain schema, no authentication and no
> inventory/sales/procurement behaviour yet. Business types are not implemented; they will be
> configurations of the shared core, never separate applications. See
> [`docs/product/scope-and-phases.md`](docs/product/scope-and-phases.md).

## Stack

| Area     | Choice                                             |
| -------- | -------------------------------------------------- |
| Backend  | NestJS 11 (Express), modular monolith              |
| Database | PostgreSQL 17, Prisma 6.19                         |
| Web      | React 19 + TypeScript + Vite 7                     |
| Desktop  | Electron 45 shell loading the shared web app       |
| Tests    | Jest (API), Vitest (web/desktop), Supertest (e2e)  |
| Tooling  | pnpm 11 workspaces, ESLint 9 flat config, Prettier |

Rationale for pinned versions is in
[`docs/requirements/decision-register.md`](docs/requirements/decision-register.md).

## Prerequisites

- Node.js **>= 22.12**
- pnpm **11.28.13** — pinned via `packageManager`; enable with `corepack enable`, or prefix
  every command with `corepack pnpm`
- Docker (for the development PostgreSQL instance)

## Quick start

```bash
cp .env.example .env          # local only; .env is git-ignored
pnpm install
pnpm db:up                    # PostgreSQL 17 on localhost:5432
pnpm prisma:generate
pnpm dev                      # API on :4000, web on :5173
```

Open http://localhost:5173 — the status page calls `GET /health` and `GET /ready` through the
Vite proxy and reports whether the API and database are reachable.

Probe endpoints (outside the `/api` prefix):

- `GET /health` — liveness, always `200` while the process is alive
- `GET /ready` — readiness, `200` when PostgreSQL answers, `503` otherwise

## Commands

| Command                  | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `pnpm dev`               | API (watch) + web dev server in parallel                        |
| `pnpm dev:desktop`       | Electron shell (start `pnpm dev` first; loads `:5173`)          |
| `pnpm build`             | Build web, desktop bundle and API                               |
| `pnpm lint`              | ESLint across all workspaces                                    |
| `pnpm typecheck`         | `tsc --noEmit` across all workspaces                            |
| `pnpm format`            | Prettier write                                                  |
| `pnpm test:unit`         | API + web + desktop unit tests (no database needed)             |
| `pnpm test:e2e`          | API HTTP e2e with stubbed database health                       |
| `pnpm test:integration`  | Real PostgreSQL integration tests (`pnpm db:up` first)          |
| `pnpm db:up` / `db:down` | Start/stop the dev database (`infra/docker/compose.dev.yml`)    |
| `pnpm prisma:generate`   | Generate the Prisma client from `apps/api/prisma/schema.prisma` |
| `pnpm prisma:validate`   | Validate the Prisma schema                                      |

## Layout

```
apps/api          NestJS modular monolith (health, config, database access)
apps/api/prisma   Prisma schema and (later) migrations
apps/web          React/Vite application (shared by browser and desktop)
apps/desktop      Electron shell with hardened preload + IPC allowlist
packages/config   Shared TypeScript, ESLint and Prettier configuration
database/         Planned seed data and ERD/ledger diagrams
infra/docker      Development database
docs/             Product, requirements, architecture, API, operations, testing
```

Folders listed in [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) that have no code yet are
intentionally absent. Modules are created when their vertical slice starts, not as placeholders.

## Known gaps (deliberately not built yet)

- No domain models or migrations; `apps/api/prisma/schema.prisma` contains only the datasource.
- No authentication, authorization, tenancy or audit modules.
- Business Admin role boundaries exist as requirements only.
- Offline POS, local SQLite store, sync engine and idempotency are not implemented.
- Electron packaging/installers (`electron-builder.yml`) are not configured.
- No Playwright suite yet.
- The repository is not initialised as a git repository in this workspace; CI activates once it is.

## Documentation

- [Scope and phases](docs/product/scope-and-phases.md)
- [Decision register](docs/requirements/decision-register.md)
- [Binding constraints](docs/requirements/master-requirements.md)
- [Modular monolith](docs/architecture/modular-monolith.md)
- [Tenant and branch isolation](docs/architecture/tenant-and-branch-isolation.md)
- [Local development](docs/operations/local-development.md)
- [Environment configuration](docs/operations/environment-configuration.md)
- [API conventions](docs/api/api-conventions.md)
- [Test strategy](docs/testing/test-strategy.md)
