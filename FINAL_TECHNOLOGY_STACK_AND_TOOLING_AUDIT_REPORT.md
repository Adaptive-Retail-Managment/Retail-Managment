# Final technology stack and tooling audit report

**Date:** 2026-11-24
**Project:** Adaptive Retail Intelligence Platform
**Scope:** Comprehensive audit of every technology, framework, language, database, ORM, package, library, tool, integration, and infrastructure component used or proposed in the project.

---

## 1. Complete technology inventory

### A. Programming languages

| Language   | Approved purpose                                                      | Actual state                                                                                                                          | Status                                  |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| TypeScript | Backend, frontend, desktop, shared config                             | Used in all apps — `apps/api/src/**/*.ts`, `apps/web/src/**/*.tsx`, `apps/desktop/electron/**/*.ts`, `packages/config/**/*.mjs`       | APPROVED AND VERIFIED                   |
| JavaScript | Config files (ESLint flat configs, Jest configs, Prettier JSON)       | `eslint.config.mjs`, `jest.config.cjs` files use JS as config format                                                                  | APPROVED AND VERIFIED                   |
| SQL        | Companion CHECK constraints and partial unique indexes for PostgreSQL | 19 CHECKs + 8 partial indexes in `DATABASE_MIGRATION_AND_SEED_STRATEGY.md` §2.1 — PostgreSQL-compatible DDL                           | APPROVED AND VERIFIED (not yet applied) |
| Python     | None — not an approved backend language                               | Zero Python files in repository. MRDD §27.1 mentions "optional Python/FastAPI AI service" as a rejected candidate from a previous TDD | NOT USED — correct                      |

### B. Backend technologies

| Technology        | Approved version                                      | Actual version                                                                                                                               | Status                |
| ----------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| NestJS            | 11.2.11                                               | `@nestjs/common`: 11.2.11, `@nestjs/core`: 11.2.11, `@nestjs/platform-express`: 11.2.11, `@nestjs/config`: 4.0.4, `@nestjs/testing`: 11.2.11 | APPROVED AND VERIFIED |
| Node.js           | >=22.12.0                                             | Engine constraint in root `package.json`: `>=22.12.0`; CI uses Node 22                                                                       | APPROVED AND VERIFIED |
| TypeScript        | 5.9.3                                                 | 5.9.3 in all package.json files                                                                                                              | APPROVED AND VERIFIED |
| Prisma ORM        | 6.19.3                                                | `prisma`: 6.19.3, `@prisma/client`: 6.19.3                                                                                                   | APPROVED AND VERIFIED |
| Express           | NestJS HTTP platform (via `@nestjs/platform-express`) | `@nestjs/platform-express` 11.2.11 — Express 5.2.1 as transitive dependency                                                                  | APPROVED AND VERIFIED |
| class-validator   | 0.15.1                                                | 0.15.1                                                                                                                                       | APPROVED AND VERIFIED |
| class-transformer | 0.5.1                                                 | 0.5.1                                                                                                                                        | APPROVED AND VERIFIED |
| zod               | Env validation                                        | 4.6.7                                                                                                                                        | APPROVED AND VERIFIED |
| helmet            | HTTP security headers                                 | 8.3.0                                                                                                                                        | APPROVED AND VERIFIED |
| reflect-metadata  | Decorator metadata                                    | 0.2.2                                                                                                                                        | APPROVED AND VERIFIED |
| rxjs              | NestJS reactive primitives                            | 7.8.2                                                                                                                                        | APPROVED AND VERIFIED |
| NestJS CLI        | Build tooling                                         | 11.0.24                                                                                                                                      | APPROVED AND VERIFIED |

**Missing dependencies (not yet installed — Step 4 scope):**

| Technology                                      | Purpose                              | Status                                                                      |
| ----------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| Authentication library (e.g., argon2, passport) | Password hashing, session management | DEFERRED — Step 4                                                           |
| Authorization library                           | Permission evaluation                | DEFERRED — Step 4                                                           |
| Logging library (structured)                    | Correlation IDs, structured logs     | DEFERRED — Step 4                                                           |
| File upload handling (multer)                   | Multipart uploads                    | DEFERRED — Step 4 (multer available as transitive dep via platform-express) |
| Background job scheduler                        | Outbox worker, scheduled tasks       | DEFERRED — Step 4                                                           |
| Chapa SDK / HTTP client                         | Subscription payments                | DEFERRED — Step 4                                                           |
| Email provider SDK                              | Transactional notifications          | DEFERRED — Step 4                                                           |
| SMS provider SDK                                | Transactional notifications          | DEFERRED — Step 4                                                           |
| Object storage SDK                              | File storage                         | DEFERRED — Step 4                                                           |

### C. Frontend technologies

| Technology                 | Approved version  | Actual version | Status                |
| -------------------------- | ----------------- | -------------- | --------------------- |
| React                      | 19.3.1            | 19.3.1         | APPROVED AND VERIFIED |
| React DOM                  | 19.3.1            | 19.3.1         | APPROVED AND VERIFIED |
| Vite                       | 7.3.8             | 7.3.8          | APPROVED AND VERIFIED |
| @vitejs/plugin-react       | 5.2.0             | 5.2.0          | APPROVED AND VERIFIED |
| react-router-dom           | 7.18.6            | 7.18.6         | APPROVED AND VERIFIED |
| TypeScript                 | 5.9.3             | 5.9.3          | APPROVED AND VERIFIED |
| Vitest                     | 4.1.12            | 4.1.12         | APPROVED AND VERIFIED |
| Testing Library (React)    | Component testing | 16.3.3         | APPROVED AND VERIFIED |
| Testing Library (jest-dom) | DOM assertions    | 8.0.0          | APPROVED AND VERIFIED |
| jsdom                      | Test environment  | 31.0.1         | APPROVED AND VERIFIED |

**Missing dependencies (not yet installed — Step 4 scope):**

| Technology                        | Purpose                        | Status                                         |
| --------------------------------- | ------------------------------ | ---------------------------------------------- |
| State management (TanStack Query) | Server-state coordination      | DEFERRED — documented in frontend architecture |
| Form handling library             | Form validation and submission | DEFERRED — Step 4                              |
| UI component library              | Design system                  | DEFERRED — Step 4                              |
| CSS framework / styling solution  | Styling                        | DEFERRED — Step 4                              |
| Data visualization                | Charts and dashboards          | DEFERRED — Step 4                              |
| Internationalization (i18n)       | Multi-language support         | DEFERRED — Step 4                              |
| MSW (Mock Service Worker)         | API mocking for tests          | DEFERRED — documented in testing architecture  |
| axe-core                          | Accessibility testing          | DEFERRED — documented in testing architecture  |

### D. Desktop technologies

| Technology        | Approved version     | Actual version                           | Status                |
| ----------------- | -------------------- | ---------------------------------------- | --------------------- |
| Electron          | 45.4.1               | 45.4.1                                   | APPROVED AND VERIFIED |
| esbuild           | Electron bundling    | 0.28.2                                   | APPROVED AND VERIFIED |
| TypeScript        | 5.9.3                | 5.9.3                                    | APPROVED AND VERIFIED |
| Vitest            | Main process testing | 4.1.12                                   | APPROVED AND VERIFIED |
| contextBridge     | Secure IPC           | Used in preload.ts                       | APPROVED AND VERIFIED |
| contextIsolation  | Security             | `true` in main.ts                        | APPROVED AND VERIFIED |
| sandbox           | Security             | `true` in main.ts                        | APPROVED AND VERIFIED |
| nodeIntegration   | Security (disabled)  | `false` in main.ts                       | APPROVED AND VERIFIED |
| Preload allowlist | Security             | `allowed-channels.ts` enforces allowlist | APPROVED AND VERIFIED |

**Missing dependencies (not yet installed — Step 4 scope):**

| Technology                              | Purpose                | Status                        |
| --------------------------------------- | ---------------------- | ----------------------------- |
| SQLite driver (native or Node built-in) | Offline local database | DEFERRED — D-017, not started |
| Electron builder / packaging            | Installer creation     | DEFERRED — not configured     |
| Code signing                            | Installer signing      | DEFERRED — CI secrets         |
| Auto-update                             | Update distribution    | DEFERRED — signed feed        |

### E. Database technologies

| Technology        | Approved version                    | Actual version                                                 | Status                                         |
| ----------------- | ----------------------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| PostgreSQL        | 17                                  | Docker Compose: `postgres:17-alpine`; CI: `postgres:17-alpine` | APPROVED AND VERIFIED                          |
| Prisma ORM        | 6.19.3                              | 6.19.3                                                         | APPROVED AND VERIFIED                          |
| Prisma Client     | 6.19.3                              | Generated successfully                                         | APPROVED AND VERIFIED                          |
| Prisma schema     | Single file                         | `apps/api/prisma/schema.prisma` — 159 models, 94 enums         | APPROVED AND VERIFIED                          |
| Prisma migrations | Forward-only                        | No migration directory exists (by design)                      | APPROVED BUT NOT CONFIGURED (deferred)         |
| Companion SQL     | CHECK constraints + partial indexes | 19 CHECKs + 8 partial indexes in migration strategy            | APPROVED AND VERIFIED (specified, not applied) |
| SQLite (offline)  | Local offline store                 | Not installed — D-017, not started                             | APPROVED BUT NOT CONFIGURED (deferred)         |

### F. Testing technologies

| Technology                 | Purpose                       | Actual version | Status                                 |
| -------------------------- | ----------------------------- | -------------- | -------------------------------------- |
| Jest                       | API unit, e2e, integration    | 30.5.2         | APPROVED AND VERIFIED                  |
| ts-jest                    | TypeScript transform for Jest | 29.4.15        | APPROVED AND VERIFIED                  |
| Supertest                  | HTTP e2e testing              | 7.3.2          | APPROVED AND VERIFIED                  |
| Vitest                     | Web and desktop testing       | 4.1.12         | APPROVED AND VERIFIED                  |
| Testing Library (React)    | Component testing             | 16.3.3         | APPROVED AND VERIFIED                  |
| Testing Library (jest-dom) | DOM assertions                | 8.0.0          | APPROVED AND VERIFIED                  |
| jsdom                      | DOM environment               | 31.0.1         | APPROVED AND VERIFIED                  |
| Playwright                 | System e2e journeys           | Not installed  | APPROVED BUT NOT CONFIGURED (deferred) |
| MSW                        | API mocking                   | Not installed  | APPROVED BUT NOT CONFIGURED (deferred) |
| axe-core                   | Accessibility testing         | Not installed  | APPROVED BUT NOT CONFIGURED (deferred) |

### G. Development and collaboration tools

| Technology                | Approved version       | Actual version                                            | Status                |
| ------------------------- | ---------------------- | --------------------------------------------------------- | --------------------- |
| pnpm                      | 11.28.13               | Pinned in `packageManager` field                          | APPROVED AND VERIFIED |
| Git                       | Version control        | `.git` directory present                                  | APPROVED AND VERIFIED |
| GitHub                    | Remote repository      | Configured remote on `main`                               | APPROVED AND VERIFIED |
| ESLint                    | 9.x flat config        | 9.39.5 in all packages                                    | APPROVED AND VERIFIED |
| typescript-eslint         | TypeScript ESLint      | 8.73.0                                                    | APPROVED AND VERIFIED |
| eslint-config-prettier    | Prettier integration   | 10.1.8                                                    | APPROVED AND VERIFIED |
| eslint-plugin-react-hooks | React hooks linting    | 7.1.1                                                     | APPROVED AND VERIFIED |
| Prettier                  | Code formatting        | 3.10.1                                                    | APPROVED AND VERIFIED |
| Docker Compose            | Development PostgreSQL | `infra/docker/compose.dev.yml` — postgres:17-alpine       | APPROVED AND VERIFIED |
| GitHub Actions            | CI/CD                  | `.github/workflows/ci.yml` — lint, typecheck, test, build | APPROVED AND VERIFIED |

### H. AI and forecasting technologies

| Technology                | Purpose                                                 | Status                                                    |
| ------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| ForecastModelPort         | Abstraction for forecast model (in-process or external) | DEFERRED — Step 4, documented in integration architecture |
| No AI library installed   | Advisory-only AI; human approval required               | DEFERRED — correct per D-014, D-033                       |
| No Python/FastAPI service | MRDD §27.1 mentions it as rejected candidate            | NOT USED — correct                                        |

AI remains advisory (D-014). No AI library, service, or infrastructure is installed. The `ForecastModel` and `Recommendation` tables in the schema store proposals and human decisions. No autonomous write path exists.

### I. External integrations

| Integration    | Approved decision                           | Actual state                                               | Status                                 |
| -------------- | ------------------------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| Chapa payment  | Hosted checkout + verified webhooks (D-032) | Not implemented — documented in integration architecture   | APPROVED BUT NOT CONFIGURED (deferred) |
| Email          | Transactional, outbox-queued                | Not implemented — port defined in integration architecture | APPROVED BUT NOT CONFIGURED (deferred) |
| SMS            | Essential-only notifications                | Not implemented — port defined in integration architecture | APPROVED BUT NOT CONFIGURED (deferred) |
| Object storage | S3-compatible, signed URLs                  | Not implemented — port defined in integration architecture | APPROVED BUT NOT CONFIGURED (deferred) |
| Bank transfer  | Recorded, not auto-processed                | Not implemented — documented                               | APPROVED BUT NOT CONFIGURED (deferred) |
| WhatsApp       | Not approved                                | Not implemented                                            | NOT USED — correct                     |

### J. Deployment and infrastructure

| Component              | Status                                                          |
| ---------------------- | --------------------------------------------------------------- |
| PostgreSQL 17 hosting  | Development: Docker Compose; Production: planned (not deployed) |
| API deployment         | Container planned (not deployed)                                |
| Frontend deployment    | Static build served by reverse proxy (planned)                  |
| Desktop distribution   | Electron packaging not configured (deferred)                    |
| Environment separation | Development + CI configured; staging/production planned         |
| Database backups       | Not configured (production concern)                             |
| Monitoring             | Not configured (production concern)                             |

---

## 2. Database and ORM verification (highest priority)

### 2.1 Prisma datasource

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- **Provider:** `postgresql` — confirmed PostgreSQL. Not MySQL, not MongoDB, not SQLite.
- **URL:** `env("DATABASE_URL")` — validated by zod schema to start with `postgresql://` or `postgres://`.
- **Generator:** `prisma-client-js` — standard Prisma Client generator.

### 2.2 Prisma Client integration

`apps/api/src/database/prisma.service.ts`:

- `PrismaService extends PrismaClient` — standard NestJS + Prisma pattern.
- Uses `ConfigService` to read `DATABASE_URL` — no hardcoded connection strings.
- Lazy connection — API boots without PostgreSQL (D-011).
- `@Global()` module — PrismaService available across all modules.

### 2.3 Environment validation

`apps/api/src/config/env.validation.ts`:

- `DATABASE_URL` must start with `postgresql://` or `postgres://` — **rejects MySQL and other databases**.
- Unit test (`env.validation.spec.ts`) explicitly verifies MySQL URLs are rejected.

### 2.4 Forbidden technology substitution check

| Forbidden technology       | Search result                                                                                                          | Classification                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| SQLAlchemy                 | Zero matches in repository                                                                                             | NOT PRESENT — correct                                           |
| TypeORM                    | Zero matches in repository                                                                                             | NOT PRESENT — correct                                           |
| Sequelize                  | Zero matches in repository                                                                                             | NOT PRESENT — correct                                           |
| Drizzle ORM                | Zero matches in repository                                                                                             | NOT PRESENT — correct                                           |
| Django ORM                 | Zero matches in repository                                                                                             | NOT PRESENT — correct                                           |
| MongoDB                    | 2 matches: ADR D-016 (rejected alternative), MRDD §27 (historical discussion)                                          | HISTORICAL REFERENCE — correctly listed as rejected alternative |
| MySQL                      | 2 matches: ADR D-016 (rejected alternative), MRDD §27 (historical discussion), env.validation.spec.ts (rejection test) | HISTORICAL REFERENCE — correctly listed as rejected alternative |
| SQLite as primary database | Multiple matches — all classify it as the planned offline desktop store (D-017), not the primary database              | APPROVED — offline store only, not primary database             |
| Python/FastAPI as backend  | 2 matches: MRDD §27.1 (rejected candidate from previous TDD)                                                           | HISTORICAL REFERENCE — correctly listed as rejected candidate   |

**No active implementation instructions reference any forbidden technology.** All mentions of MongoDB, MySQL, Python/FastAPI, and SQLite (as primary) are in rejected-alternatives sections, historical discussion, or the env validation rejection test.

### 2.5 Docker Compose verification

```yaml
services:
  postgres:
    image: postgres:17-alpine
```

PostgreSQL 17 Alpine image — matches approved decision (D-016). CI workflow uses the same image.

### 2.6 Migration workflow

The approved Prisma migration workflow is documented in `DATABASE_MIGRATION_AND_SEED_STRATEGY.md`:

1. `prisma migrate dev --create-only` — generate baseline migration.
2. Append companion SQL (19 CHECKs + 8 partial indexes).
3. `prisma migrate dev` — apply.
4. `prisma migrate deploy` for CI/staging/production.

No migration directory exists yet — this is by design (Step 3 was database design, not migration execution).

---

## 3. Version verification

### 3.1 Actual framework and dependency versions (verified from package.json files)

| Technology           | Expected | Actual                    | Match |
| -------------------- | -------- | ------------------------- | ----- |
| NestJS               | 11.2.11  | 11.2.11                   | ✅    |
| Prisma ORM           | 6.19.3   | 6.19.3                    | ✅    |
| Prisma Client        | 6.19.3   | 6.19.3                    | ✅    |
| React                | 19.3.1   | 19.3.1                    | ✅    |
| React DOM            | 19.3.1   | 19.3.1                    | ✅    |
| Vite                 | 7.3.8    | 7.3.8                     | ✅    |
| @vitejs/plugin-react | 5.x      | 5.2.0                     | ✅    |
| Electron             | 45.4.1   | 45.4.1                    | ✅    |
| TypeScript           | 5.9.3    | 5.9.3                     | ✅    |
| pnpm                 | 11.28.13 | 11.28.13 (packageManager) | ✅    |
| Jest                 | 30.x     | 30.5.2                    | ✅    |
| Vitest               | 4.x      | 4.1.12                    | ✅    |
| ESLint               | 9.x      | 9.39.5                    | ✅    |
| Prettier             | 3.x      | 3.10.1                    | ✅    |
| ts-jest              | 29.x     | 29.4.15                   | ✅    |
| Supertest            | 7.x      | 7.3.2                     | ✅    |
| helmet               | 8.x      | 8.3.0                     | ✅    |
| zod                  | 4.x      | 4.6.7                     | ✅    |
| class-validator      | 0.15.x   | 0.15.1                    | ✅    |
| class-transformer    | 0.5.x    | 0.5.1                     | ✅    |
| reflect-metadata     | 0.2.x    | 0.2.2                     | ✅    |
| rxjs                 | 7.x      | 7.8.2                     | ✅    |
| esbuild              | 0.28.x   | 0.28.2                    | ✅    |
| react-router-dom     | 7.x      | 7.18.6                    | ✅    |

All 24 verified technologies match their expected versions exactly. No version mismatches found.

---

## 4. Compatibility findings

| Compatibility pair                         | Verification                                                     | Result |
| ------------------------------------------ | ---------------------------------------------------------------- | ------ |
| Node.js 22 + pnpm 11.28.13                 | packageManager pinned; corepack compatible (D-003)               | PASS   |
| NestJS 11 + TypeScript 5.9.3               | CommonJS build; ts-jest 29 compatible (D-004, D-006)             | PASS   |
| NestJS 11 + Prisma 6.19.3                  | PrismaService extends PrismaClient; validated (D-005)            | PASS   |
| Prisma 6.19.3 + PostgreSQL 17              | `provider = "postgresql"`; schema validated; client generated    | PASS   |
| React 19 + Vite 7                          | @vitejs/plugin-react 5 stable (D-008)                            | PASS   |
| Electron 45 + React 19                     | Shared renderer loaded via URL; security hardened (D-009, D-029) | PASS   |
| Electron 45 + esbuild 0.28.2               | Main process bundled with esbuild; CJS output for Node 22        | PASS   |
| TypeScript 5.9.3 across all apps           | Shared base config in packages/config (D-006)                    | PASS   |
| Jest 30 + ts-jest 29                       | API test transform configured (D-007)                            | PASS   |
| Vitest 4 + Vite 7                          | Shared transform pipeline (D-007)                                | PASS   |
| ESLint 9 flat config + typescript-eslint 8 | Shared config in packages/config                                 | PASS   |
| Docker Compose + PostgreSQL 17             | `postgres:17-alpine` in compose.dev.yml and CI                   | PASS   |

No duplicate dependencies with overlapping responsibilities found. No conflicting versions across workspace packages. All dependencies use the same TypeScript, ESLint, and Prettier versions via the shared `@arp/config` package.

---

## 5. Security and configuration audit

| Check                      | Verification                                                                     | Result       |
| -------------------------- | -------------------------------------------------------------------------------- | ------------ |
| Environment variables      | `.env.example` documents all required vars; `.env` is git-ignored                | PASS         |
| Secret handling            | No secrets in code; `DATABASE_URL` from env; zod validation enforces PostgreSQL  | PASS         |
| DATABASE_URL validation    | zod schema rejects non-PostgreSQL URLs; unit test confirms                       | PASS         |
| Electron security          | contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true | PASS         |
| Preload security           | Frozen API surface via contextBridge; no raw ipcRenderer exposed                 | PASS         |
| CORS configuration         | `enableCors` with `CORS_ORIGINS` from env; credentials: true                     | PASS         |
| Helmet                     | HTTP security headers applied                                                    | PASS         |
| Password hashing           | Not yet implemented (Step 4) — no plaintext passwords in codebase                | DEFERRED     |
| Token handling             | Not yet implemented (Step 4)                                                     | DEFERRED     |
| File upload restrictions   | Not yet implemented (Step 4)                                                     | DEFERRED     |
| Dependency vulnerabilities | Not scanned in this audit (no `pnpm audit` run)                                  | NOT VERIFIED |

No credentials or secrets are exposed in any file. The `.env.example` contains only development defaults with clearly labeled placeholder passwords.

---

## 6. Documentation-wide consistency audit

| Document                         | Technology claims                                                                                                                                                                                   | Consistency                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| README.md                        | Stack table: NestJS 11 (Express), PostgreSQL 17, Prisma 6.19, React 19, Vite 7, Electron 45, Jest/Vitest, pnpm 11                                                                                   | CONSISTENT                                                      |
| PROJECT_STRUCTURE.md             | Lists recommended stack from "earlier discussions, not yet confirmed final selections" — NestJS, PostgreSQL, Prisma, React, Vite, Electron, SQLite (offline), Jest/Vitest, Playwright, Docker, pnpm | CONSISTENT — labeled as recommendations, matches actual choices |
| ARCHITECTURE_DECISION_RECORDS.md | D-001 through D-034 — all technology decisions documented with rationale and alternatives                                                                                                           | CONSISTENT                                                      |
| .env.example                     | PostgreSQL connection string, CORS origins, Node env vars                                                                                                                                           | CONSISTENT                                                      |
| Docker Compose                   | postgres:17-alpine                                                                                                                                                                                  | CONSISTENT                                                      |
| CI workflow                      | pnpm 11.28.13, Node 22, PostgreSQL 17, Prisma generate/validate                                                                                                                                     | CONSISTENT                                                      |
| Integration architecture         | Chapa, email, SMS, storage — all planned, none implemented                                                                                                                                          | CONSISTENT                                                      |
| Testing architecture             | Jest/Vitest/Supertest implemented; Playwright/MSW/axe deferred                                                                                                                                      | CONSISTENT                                                      |
| Database documentation           | PostgreSQL + Prisma throughout; companion SQL for PostgreSQL                                                                                                                                        | CONSISTENT                                                      |
| MRDD §27                         | Historical technology candidates (Python/FastAPI, MySQL) correctly marked as rejected/proposed                                                                                                      | CONSISTENT — historical reference                               |

**No active implementation instructions reference any unapproved technology.** All conflicting references (MongoDB, MySQL, Python/FastAPI, SQLAlchemy) appear only in rejected-alternatives sections or historical discussion.

---

## 7. Final recommendations

1. **No technology changes needed.** The approved stack is consistently configured across all package.json files, documentation, and infrastructure.

2. **Missing dependencies are correctly deferred.** Authentication, authorization, logging, Chapa, email, SMS, storage, Playwright, MSW, and UI libraries are all documented as Step 4 scope. They should be added when their owning module starts implementation.

3. **Playwright should be installed when the first system e2e test is needed.** It is documented in the testing architecture but not yet installed. This is correct — installing it before it is used would add unnecessary weight.

4. **SQLite driver should be selected during desktop implementation planning.** D-017 records the decision; the driver choice (native module vs Node built-in) is a Step 4 decision.

5. **No version upgrades are needed.** All versions are pinned and compatible. The ADRs document the rationale for each version pin.

6. **`pnpm audit` should be run periodically** to check for known vulnerabilities in dependencies. This is an operational practice, not a technology-stack defect.
