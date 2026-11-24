# Final technology conflict and remediation register

**Date:** 2026-11-24
**Project:** Adaptive Retail Intelligence Platform

---

## 1. Conflicts discovered

| ID     | Severity      | Technology                      | Location                                                                                                                                                          | Conflict type                                     | Approved decision                                                                                     | Actual state                                                                                              | Correction                                                 |
| ------ | ------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| TC-001 | Informational | MongoDB                         | `docs/architecture/ARCHITECTURE_DECISION_RECORDS.md` D-016 (line ~334)                                                                                            | Historical reference / rejected alternative       | PostgreSQL (D-016)                                                                                    | Listed as rejected alternative in ADR — no active use                                                     | None required — correctly classified as rejected           |
| TC-002 | Informational | MySQL                           | `docs/architecture/ARCHITECTURE_DECISION_RECORDS.md` D-016 (line ~334); `docs/requirements/MASTER_PROJECT_REQUIREMENTS_AND_DECISION_DOCUMENT.md` §27 (line ~1104) | Historical reference / rejected alternative       | PostgreSQL (D-016)                                                                                    | Listed as rejected alternative in ADR and as historical candidate in MRDD §27 — no active use             | None required — correctly classified as rejected           |
| TC-003 | Informational | MySQL (rejection test)          | `apps/api/src/config/env.validation.spec.ts` (line ~35)                                                                                                           | Test assertion — correctly rejects MySQL          | PostgreSQL only (env validation)                                                                      | Test verifies that `mysql://` DATABASE_URL is rejected                                                    | None required — this is correct behavior                   |
| TC-004 | Informational | Python/FastAPI                  | `docs/requirements/MASTER_PROJECT_REQUIREMENTS_AND_DECISION_DOCUMENT.md` §27.1 (line ~1139)                                                                       | Historical reference / rejected candidate         | NestJS/TypeScript backend (D-004)                                                                     | Listed as candidate from previous TDD, not approved — no Python files in repo                             | None required — correctly classified as rejected candidate |
| TC-005 | Informational | SQLite (as primary database)    | Multiple docs — all classify as offline desktop store only                                                                                                        | Approved for offline only (D-017)                 | All references correctly classify SQLite as the local offline store, not the primary database         | None required — correctly scoped                                                                          |
| TC-006 | Informational | Express (as standalone backend) | README.md, pnpm-lock.yaml                                                                                                                                         | NestJS platform adapter, not standalone framework | NestJS uses `@nestjs/platform-express` as HTTP adapter — Express 5.2.1 is a transitive dependency     | None required — Express is used correctly as NestJS's HTTP platform, not as a separately selected backend |
| TC-007 | Informational | Angular (devkit)                | pnpm-lock.yaml                                                                                                                                                    | Transitive dependency of NestJS CLI               | NestJS CLI uses @angular-devkit/schematics for code generation                                        | None required — this is a NestJS CLI internal dependency, not Angular framework usage                     |
| TC-008 | Informational | Playwright                      | Multiple docs, .gitignore, pnpm-lock.yaml (as Vitest optional dep)                                                                                                | Approved but not installed                        | Documented as planned in testing architecture; not installed                                          | None required — deferred per documented plan                                                              |
| TC-009 | Informational | yarn / npm                      | pnpm-lock.yaml (engine constraints of transitive deps)                                                                                                            | pnpm is the approved package manager (D-003)      | `yarn` appears only in engine constraint strings of transitive dependencies; no yarn.lock file exists | None required — pnpm is correctly used throughout                                                         |

---

## 2. Severity classification

- **CRITICAL:** 0 — No technology is actively configured that contradicts an approved decision.
- **HIGH:** 0 — No active implementation instruction references a forbidden technology.
- **MEDIUM:** 0 — No package.json contains an unapproved dependency.
- **LOW:** 0 — No documentation presents a rejected technology as the active choice.
- **INFORMATIONAL:** 9 — All conflicts are historical references, rejected alternatives, transitive dependencies, or correctly deferred tools.

---

## 3. Corrections performed

**No files were modified.** No correction was needed. All 9 findings are informational — they represent correctly classified historical references, rejected alternatives, transitive dependencies, or deferred tools. No active implementation instruction, package.json dependency, or configuration file references an unapproved technology as the project's choice.

---

## 4. Verification evidence

### 4.1 Forbidden ORM search results

| Search term | Files matched | Active instructions | Classification       |
| ----------- | ------------- | ------------------- | -------------------- |
| SQLAlchemy  | 0             | 0                   | Not present anywhere |
| TypeORM     | 0             | 0                   | Not present anywhere |
| Sequelize   | 0             | 0                   | Not present anywhere |
| Drizzle     | 0             | 0                   | Not present anywhere |
| Django      | 0             | 0                   | Not present anywhere |

### 4.2 Database provider verification

| Check                               | Result                                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| `schema.prisma` datasource provider | `postgresql`                                                |
| `DATABASE_URL` validation           | zod schema requires `postgresql://` or `postgres://` prefix |
| Docker Compose image                | `postgres:17-alpine`                                        |
| CI workflow database                | `postgres:17-alpine`                                        |
| Env validation unit test            | MySQL URL explicitly rejected                               |

### 4.3 Package.json verification

| Package.json    | Backend framework | Database/ORM                         | Frontend                 | Desktop         | Package manager |
| --------------- | ----------------- | ------------------------------------ | ------------------------ | --------------- | --------------- |
| Root            | —                 | —                                    | —                        | —               | pnpm@11.28.13   |
| apps/api        | @nestjs/* 11.2.11 | prisma 6.19.3, @prisma/client 6.19.3 | —                        | —               | —               |
| apps/web        | —                 | —                                    | react 19.3.1, vite 7.3.8 | —               | —               |
| apps/desktop    | —                 | —                                    | —                        | electron 45.4.1 | —               |
| packages/config | —                 | —                                    | —                        | —               | —               |

All package.json files contain only approved technologies at approved versions. No unapproved dependencies found.

### 4.4 Documentation consistency

All documentation files that mention alternative technologies do so in one of these contexts:

- "Alternatives" sections in ADRs (explicitly rejected with rationale)
- "Historical" or "proposed" context in MRDD §27 (explicitly labeled as not approved)
- Rejection test in env validation spec (verifying the approved technology is enforced)

No documentation file presents an unapproved technology as the active or recommended choice.

---

## 5. Unresolved issues

No unresolved technology conflicts exist. All 9 findings are informational and require no correction. The technology stack is consistent across all package.json files, configuration, documentation, and infrastructure.
