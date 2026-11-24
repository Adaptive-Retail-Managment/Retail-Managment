# Authoritative project technology baseline

**Date:** 2026-11-24
**Project:** Adaptive Retail Intelligence Platform
**Full title:** Design and Development of an Adaptive Multi-Business Retail Management and Intelligence Platform with AI-Based Demand Forecasting and Subscription-Based SaaS Access.
**Status:** FROZEN — this is the single authoritative technology reference for the four-member development team.

---

## 1. Approved languages

| Language | Purpose | Decision |
| --- | --- | --- |
| **TypeScript** | Primary language for backend, frontend, desktop, and shared configuration | D-006 (5.9.3, pinned across all workspaces) |
| **JavaScript** | Configuration files only (ESLint flat configs, Jest configs) | Implicit — config format, not application code |
| **SQL** | Companion CHECK constraints and partial unique indexes for PostgreSQL | Step 3 database design — PostgreSQL-compatible DDL |

**No other language is approved for application development.** Python is not used for backend, AI, or any other purpose. MRDD §27.1 mentions it as a rejected candidate from a previous TDD.

---

## 2. Backend

| Component | Technology | Version | Decision |
| --- | --- | --- | --- |
| Framework | **NestJS** | 11.2.11 | D-004 (Provisional — revisit with ESM migration) |
| HTTP platform | **@nestjs/platform-express** | 11.2.11 | D-004 (Express as NestJS adapter, not standalone) |
| Runtime | **Node.js** | >=22.12.0 | Engine constraint |
| Language | **TypeScript** | 5.9.3 | D-006 |
| ORM | **Prisma** | 6.19.3 | D-005 (Provisional — re-evaluate before first domain migration) |
| Validation | **class-validator** + **class-transformer** | 0.15.1 / 0.5.1 | Global ValidationPipe (whitelist, forbidNonWhitelisted, transform) |
| Env validation | **zod** | 4.6.7 | Fail-fast env validation |
| Security headers | **helmet** | 8.3.0 | Applied in main.ts |
| Reactive primitives | **rxjs** | 7.8.2 | NestJS dependency |
| Decorator metadata | **reflect-metadata** | 0.2.2 | Required for NestJS decorators |
| Build | **NestJS CLI** + **ts-jest** | 11.0.24 / 29.4.15 | `nest build` for production; ts-jest for tests |
| Architecture | **Modular monolith** | — | D-001 (Constrained — one deployable API) |

---

## 3. Frontend

| Component | Technology | Version | Decision |
| --- | --- | --- | --- |
| Framework | **React** | 19.3.1 | D-008 |
| Build tool | **Vite** | 7.3.8 | D-008 |
| React plugin | **@vitejs/plugin-react** | 5.2.0 | D-008 |
| Routing | **react-router-dom** | 7.18.6 | D-008 |
| Language | **TypeScript** | 5.9.3 | D-006 |
| Architecture | **Feature-based modules** | — | D-020 |
| Renderer sharing | **One shared renderer** for web and desktop | — | D-029 (Constrained) |

---

## 4. Desktop

| Component | Technology | Version | Decision |
| --- | --- | --- | --- |
| Framework | **Electron** | 45.4.1 | D-009 (Provisional) |
| Bundler | **esbuild** | 0.28.2 | CJS bundle for Node 22 |
| Renderer | **Same React web app** | — | D-029 (Constrained) |
| Security | contextIsolation, sandbox, no nodeIntegration, allowlisted preload | — | D-009 |
| IPC | **contextBridge** with frozen, typed API surface | — | Implemented in preload.ts |
| Local database | **SQLite** (planned) | — | D-017 (Provisional — not started) |
| Offline outbox | Durable local sale queue with client-generated operation IDs | — | D-022 (Constrained — not started) |
| Packaging | Not yet selected | — | DEFERRED |

---

## 5. Database

| Component | Technology | Version | Decision |
| --- | --- | --- | --- |
| Primary database | **PostgreSQL** | 17 | D-016 (Constrained) |
| ORM | **Prisma** | 6.19.3 | D-005 (Provisional) |
| Schema location | `apps/api/prisma/schema.prisma` | — | D-015 |
| Offline database | **SQLite** (desktop main process only) | — | D-017 (Provisional — not started) |
| Tenancy | Shared-schema multi-tenancy | — | D-019 |
| Money | Decimal(18,2) + explicit currency | — | No floats |
| Quantities | Decimal(18,3) | — | No floats |
| Unit costs | Decimal(18,4) | — | No floats |
| Companion SQL | 19 CHECK constraints + 8 partial unique indexes | — | PostgreSQL-compatible DDL in migration strategy |

**PostgreSQL is the only primary database.** SQLite is approved for offline desktop storage only (D-017), not as a primary database. No other database is approved.

---

## 6. ORM

| Component | Technology | Version | Decision |
| --- | --- | --- | --- |
| ORM | **Prisma** | 6.19.3 | D-005 |
| Client | **@prisma/client** | 6.19.3 | Generated from schema |
| Integration | **PrismaService extends PrismaClient** | — | NestJS global module |
| Migrations | **Prisma migrate** (forward-only) | — | Documented in migration strategy; no migration generated yet |
| Connection | Lazy via `datasourceUrl` from `DATABASE_URL` | — | D-011 (API boots without DB) |

**Prisma is the only ORM.** No other ORM (TypeORM, Sequelize, Drizzle, SQLAlchemy) is present or approved.

---

## 7. Package manager

| Component | Technology | Version | Decision |
| --- | --- | --- | --- |
| Package manager | **pnpm** | 11.28.13 | D-003 (pinned via `packageManager` field) |
| Workspace | **pnpm workspaces** | — | D-002 (Constrained) |
| Lockfile | `pnpm-lock.yaml` | Present | Single lockfile for all workspaces |
| Engine constraints | Node >=22.12.0, pnpm >=11 | — | `engines` in root package.json |

**pnpm is the only package manager.** No `yarn.lock`, no `package-lock.json`. CI uses `pnpm/action-setup@v4` with version 11.28.13.

---

## 8. Build tools

| Tool | Purpose | Version |
| --- | --- | --- |
| NestJS CLI | API build (`nest build`) | 11.0.24 |
| Vite | Web build | 7.3.8 |
| esbuild | Electron main/preload bundling | 0.28.2 |
| TypeScript compiler | Type checking (`tsc --noEmit`) | 5.9.3 |
| Prettier | Code formatting | 3.10.1 |
| ESLint | Code linting | 9.39.5 |
| ts-jest | TypeScript transform for Jest | 29.4.15 |

---

## 9. Testing strategy

| Tier | Tool | Status |
| --- | --- | --- |
| API unit | Jest 30 + ts-jest 29 | Implemented |
| API e2e | Jest + Supertest | Implemented |
| API integration | Jest + real PostgreSQL | Implemented (blocked without Docker) |
| Web component | Vitest + Testing Library + jsdom | Implemented |
| Desktop main | Vitest | Implemented |
| System e2e | Playwright | DEFERRED — documented, not installed |
| API mocking | MSW | DEFERRED — documented, not installed |
| Accessibility | axe-core | DEFERRED — documented, not installed |
| Contract/sandbox | Jest against sandbox/emulator | DEFERRED — Step 4 |
| Database testing | Real PostgreSQL, never mocked | Implemented (integration tier) |

---

## 10. AI technology direction

| Aspect | Decision |
| --- | --- |
| AI role | Advisory only — proposals, not autonomous writes (D-014, Constrained) |
| Architecture | `ForecastModelPort` abstraction — in-process baseline or external service (reversible) |
| Model selection | DEFERRED — MRDD §27 open item |
| Implementation | Step 4 scope |
| Approved libraries | None installed — correct |
| Rejected approaches | Python/FastAPI microservice (MRDD §27.1 — candidate only, not approved) |
| Schema support | `ForecastModel`, `ForecastRun`, `ForecastPoint`, `Recommendation` tables in Prisma schema |

AI recommendations must remain decision support. Human approval is required for all operational actions. No AI path can approve receiving, change stock, set prices, or issue refunds.

---

## 11. External integrations

| Integration | Decision | Status |
| --- | --- | --- |
| **Chapa** | Hosted checkout + verified webhooks (D-032, Provisional) | Planned — not implemented |
| **Email** | Transactional, outbox-queued | Planned — port defined |
| **SMS** | Essential-only notifications | Planned — port defined |
| **Object storage** | S3-compatible, signed URLs | Planned — port defined |
| **Bank transfer** | Recorded, not auto-processed | Planned |
| **WhatsApp** | NOT approved | Not used — correct |
| **Supplier portal** | NOT approved (MVP) | Not used — correct |
| **Currency** | ETB only for first release | Documented |
| **Subscription renewal** | Manual (no auto-recurring billing) | Documented |

---

## 12. Development environment

| Requirement | Specification |
| --- | --- |
| Node.js | >=22.12.0 |
| pnpm | 11.28.13 (via corepack: `corepack enable`) |
| Docker | Required for development PostgreSQL |
| PostgreSQL | 17 (via `pnpm db:up`) |
| Editor | Any TypeScript-aware editor |
| OS | Cross-platform (Windows, macOS, Linux) |

### Setup commands

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm prisma:generate
pnpm dev              # API on :4000, web on :5173
```

### Development scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | API (watch) + web dev server in parallel |
| `pnpm dev:desktop` | Electron shell (start `pnpm dev` first) |
| `pnpm build` | Build web, desktop bundle, and API |
| `pnpm lint` | ESLint across all workspaces |
| `pnpm typecheck` | tsc --noEmit across all workspaces |
| `pnpm format` | Prettier write |
| `pnpm test:unit` | API + web + desktop unit tests |
| `pnpm test:e2e` | API HTTP e2e with Supertest |
| `pnpm test:integration` | Real PostgreSQL integration tests |
| `pnpm db:up` / `db:down` | Start/stop development PostgreSQL |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:validate` | Validate Prisma schema |

---

## 13. Version requirements summary

| Technology | Pinned version | Rationale |
| --- | --- | --- |
| pnpm | 11.28.13 | D-003 — pnpm 12 incompatible with corepack |
| NestJS | 11.2.11 | D-004 — NestJS 12 is ESM-only, breaks CommonJS + Jest |
| Prisma | 6.19.3 | D-005 — Prisma 7 changes generator model; 8 is RC |
| TypeScript | 5.9.3 | D-006 — TS 7 native compiler not supported by test toolchain |
| React | 19.3.1 | D-008 |
| Vite | 7.3.8 | D-008 — Vite 8 plugin not stable at decision time |
| Electron | 45.4.1 | D-009 |
| Jest | 30.5.2 | D-007 |
| Vitest | 4.1.12 | D-007 |
| ESLint | 9.39.5 | Flat config |
| Prettier | 3.10.1 | Formatting |
| Node.js | >=22.12.0 | Engine constraint |

---

## 14. Deferred technology decisions

| Technology | Decision needed | When | Owner |
| --- | --- | --- | --- |
| SQLite driver | Native module vs Node built-in | Desktop implementation planning | Desktop owner (M3/M4) |
| Electron packaging tool | electron-builder vs alternative | Desktop implementation planning | Desktop owner |
| Playwright | Install when first e2e test needed | Step 4 testing phase | Testing lead |
| MSW | Install for web component testing | Step 4 testing phase | M2/M4 |
| axe-core | Install for accessibility testing | Step 4 testing phase | M2/M4 |
| Authentication library | argon2, passport, or alternative | Step 4 identity module | M1 |
| Chapa SDK | HTTP client or SDK | Step 4 subscriptions module | M1 |
| Email provider SDK | Provider selection + SDK | Step 4 notifications module | M4 |
| SMS provider SDK | Provider selection + SDK | Step 4 notifications module | M4 |
| Object storage SDK | S3-compatible SDK | Step 4 files module | M2 |
| State management (web) | TanStack Query or alternative | Step 4 frontend | M2/M4 |
| UI component library | Selection | Step 4 frontend | M2 |
| AI forecasting model | Baseline model selection | Step 4 intelligence module | M4 |
| Production DB roles | Migration role + least-privilege app role | Pre-production | Operations |

---

## 15. Confirmed decisions vs recommendations vs future possibilities

### Confirmed and implemented

pnpm 11.28.13, NestJS 11.2.11, Prisma 6.19.3, PostgreSQL 17, TypeScript 5.9.3, React 19.3.1, Vite 7.3.8, Electron 45.4.1, Jest 30, Vitest 4, ESLint 9, Prettier 3, class-validator, class-transformer, zod, helmet, esbuild, Docker Compose, GitHub Actions.

### Confirmed but not yet implemented

SQLite (D-017, offline desktop), Playwright (system e2e), MSW (API mocking), Chapa (D-032, payments), Email/SMS (notifications), Object storage, AI forecasting (D-033).

### Recommendations (not approved decisions)

TanStack Query for server-state, axe-core for accessibility, MinIO for storage testing, electron-builder for packaging. These are documented in architecture docs as planned choices but have not been through an ADR approval process.

### Future possibilities (not decisions)

RLS (deferred hardening), production DB roles, PgBouncer connection pooling, staged desktop rollout. These are documented as future options requiring an ADR before adoption.

---

*This document is the single authoritative technology reference. All team members must use these technologies and versions. Changes require an ADR and team review.*
