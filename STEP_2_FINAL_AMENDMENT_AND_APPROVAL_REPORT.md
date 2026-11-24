# Step 2 — Final Amendment and Approval Report

**Date:** 2026-11-21 · **Scope:** documentation and architecture consistency only. No database model,
migration, endpoint, authentication, offline code, UI or other Step 3 deliverable was created.

## A. Amendment A — Final approval of D-025

### Previous record

D-025 was **Provisional**. It treated a completed offline sale as an authoritative historical fact
that was always accepted, even when ingestion would drive stock below zero; a negative balance was
allowed and flagged with a reconciliation exception pending product-owner confirmation.

### Approved final decision

**D-025 — Strict stock protection for offline transactions — Status: Approved.**

- **Rule:** an offline transaction is a locally recorded transaction awaiting server validation. It
  is not permission to bypass authoritative inventory constraints.
- **Invariant:** no accepted stock movement may result in negative available inventory, online or
  offline.
- **Insufficient stock:** the server rejects the inventory commit and creates or reuses a
  reconciliation exception, committing no sale and no stock movement. The exception keeps the
  device, cashier, branch, operation ID, products, quantities, recorded prices, payments and
  timestamps, plus the rejection reason and shortfall.
- **Idempotency:** repeated submissions of the same `(deviceId, operationId)` never create a second
  sale, movement or exception.
- **Auditability:** original transaction, validation outcome, reconciliation and resolution history
  remain traceable; nothing is deleted, quantity-reduced or price-edited.
- **Resolution:** only an Owner or Manager with the reconciliation permission and branch scope, after
  physical verification where required. A corrective adjustment or stocktake is a separate audited
  workflow. An honoured transaction is explicitly released and revalidated once; a decision not to
  fulfil is recorded, and any customer or financial remedy not defined by approved requirements is
  an authorized business decision. No automatic approval or adjustment exists.

### Final behavior, end to end

1. Offline: the POS commits the sale, lines, payments, receipt number, advisory stock delta and
   outbox row in one SQLite transaction, then shows local success. Local success means "durably
   recorded", not "accepted by the server".
2. Sync: device and business/branch are authenticated, the operation ID is checked, product, price,
   payment and transaction constraints are validated, authoritative stock is checked, and stock
   plus sale plus payment commit atomically.
3. Sufficient stock: canonical sale and movements are created, the result is returned and the device
   marks the operation synced.
4. Insufficient stock: the commit aborts in full. A reconciliation exception is persisted and the
   operation is returned as `conflicted` with `INSUFFICIENT_STOCK`; it is not retried on a timer.
5. Resolution: authorized investigation and physical verification; a separate adjustment or
   stocktake if needed; explicit release for one revalidation, or a recorded decision not to fulfil.
   The same operation can never commit twice; a second failure records a new state, not an overwrite.

### Documents updated for Amendment A

| Document                                                                                               | Change                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`ARCHITECTURE_DECISION_RECORDS.md`](docs/architecture/ARCHITECTURE_DECISION_RECORDS.md)               | D-025 rewritten and marked Approved; D-022 consequences aligned; index updated                                                                                                                |
| [`OFFLINE_SYNCHRONIZATION_ARCHITECTURE.md`](docs/architecture/OFFLINE_SYNCHRONIZATION_ARCHITECTURE.md) | Goals, local commit, outbox states, sync sequence, validation order, conflict taxonomy, strict-stock section, resolution workflow and state diagram, observability, 13 blocking tests, owners |
| [`MULTI_TENANT_SECURITY_ARCHITECTURE.md`](docs/architecture/MULTI_TENANT_SECURITY_ARCHITECTURE.md)     | Offline binding wording, reconciliation permission row, threat #23                                                                                                                            |
| [`BACKEND_ARCHITECTURE.md`](docs/architecture/BACKEND_ARCHITECTURE.md)                                 | Inventory guard, offline ingest guarantee, synchronization ownership of exceptions and events                                                                                                 |
| [`MODULE_DEPENDENCY_MAP.md`](docs/architecture/MODULE_DEPENDENCY_MAP.md)                               | Inventory and offline-ingest contract guarantees; removed the negative-balance event; added reconciliation events                                                                             |
| [`../api/API_ARCHITECTURE.md`](docs/api/API_ARCHITECTURE.md)                                           | Adjustment and offline-sale semantics; sync shortfall result example                                                                                                                          |
| [`TESTING_ARCHITECTURE.md`](docs/testing/TESTING_ARCHITECTURE.md)                                      | Offline expectations, module test duties, T-16, new T-26/T-27, workflow scenario                                                                                                              |
| [`SYSTEM_ARCHITECTURE.md`](docs/architecture/SYSTEM_ARCHITECTURE.md)                                   | Offline-safety quality attribute                                                                                                                                                              |
| [`../team/TEAM_DEVELOPMENT_GUIDELINES.md`](docs/team/TEAM_DEVELOPMENT_GUIDELINES.md)                   | Inventory/sales/synchronization lifecycle duties reflect strict stock                                                                                                                         |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                                                                   | Non-negotiable rule 5 states the offline consequence                                                                                                                                          |

## B. Amendment B — Rebalanced four-member ownership

### Approved ownership

| Member                                          | Modules                                                                                | Count |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | ----- |
| M1 — Platform and SaaS                          | identity, tenancy, authorization, employees, subscriptions, super-admin, audit         | 7     |
| M2 — Business configuration, products and files | business-configuration, catalog, pricing, files                                        | 4     |
| M3 — Inventory and procurement                  | inventory, suppliers, procurement                                                      | 3     |
| M4 — Sales, intelligence and synchronization    | customers, sales, after-sales, analytics, intelligence, synchronization, notifications | 7     |

One accountable owner per module. Moving a module needs a concrete dependency/workload reason and an
amended ADR.

### Workload estimation method and result

Method: relative effort points per module covering backend, frontend, database/migrations, API and
integrations, validation and permissions, tests, documentation and acceptance. Estimates are
judgment-based, not measured, and are re-checked at each phase gate (±2 points expected).

Module totals: M1 37, M2 20, M3 21, M4 41 (119). Supporting packages add 27: shared frontend
platform and business-type UI/import tooling to M2 (13); test infrastructure, hardware/packaging and
observability to M3 (12); dependency lint/contract harness to M1 (2). Peer support shifts 5 points
without changing ownership: analytics dashboard presentation to M2 (2), sales/offline test fixtures
to M3 (2), audit viewer shell to M2 (1).

| Member | Adjusted total | Share of 146 |
| ------ | -------------- | ------------ |
| M1     | 38             | ≈26.0%       |
| M2     | 36             | ≈24.7%       |
| M3     | 35             | ≈24.0%       |
| M4     | 37             | ≈25.3%       |

The residual spread is about two points. It is not claimed as measured equality; M4 still carries the
heaviest domain set, offset by explicit peer support that M2 and M3 must schedule. If measured
velocity diverges at a phase gate, supporting tasks move first; module boundaries stay intact.

### Full-lifecycle responsibilities

[`TEAM_DEVELOPMENT_GUIDELINES.md`](docs/team/TEAM_DEVELOPMENT_GUIDELINES.md) §1.3 defines, for every
one of the 21 modules: backend duties, database/migration duties, frontend duties, API and
integration duties, validation and permission duties, unit/integration test duties, documentation,
acceptance criteria and the owners it collaborates with. No member owns only documentation, tests,
integration or one layer.

### Two-computer collaboration

Computer 1 pairs M1 and M2; Computer 2 pairs M3 and M4. Each member uses a private OS/GitHub/Git
identity; branches carry the member label; the real author commits and the real reviewer approves.
Sessions are ordered, the keyboard rotates, no uncommitted work is left in the shared tree, and no
two dev servers share one local database. Shared contracts and migrations are announced, serialized
and reviewed by every affected owner; PII-free seeds replace database dumps; CI is the evidence.
No fake contributions or shared credentials are permitted.

### Documents updated for Amendment B

[`MODULE_DEPENDENCY_MAP.md`](docs/architecture/MODULE_DEPENDENCY_MAP.md) (graph subgraphs, owner
rows, phase plan), [`TEAM_DEVELOPMENT_GUIDELINES.md`](docs/team/TEAM_DEVELOPMENT_GUIDELINES.md)
(ownership, workload matrix, lifecycle tables, two-computer workflow),
[`ARCHITECTURE_DECISION_RECORDS.md`](docs/architecture/ARCHITECTURE_DECISION_RECORDS.md) (new D-034),
[`TESTING_ARCHITECTURE.md`](docs/testing/TESTING_ARCHITECTURE.md) (owner column),
[`../web/FRONTEND_ARCHITECTURE.md`](docs/web/FRONTEND_ARCHITECTURE.md) (feature ownership),
[`BACKEND_ARCHITECTURE.md`](docs/architecture/BACKEND_ARCHITECTURE.md) (full-lifecycle pointer),
[`SYSTEM_ARCHITECTURE.md`](docs/architecture/SYSTEM_ARCHITECTURE.md) (existing canonical pointer).

## C. Consistency audit

| Check                                                   | Result                                                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| All 12 required architecture documents exist            | 12/12                                                                                         |
| 21 backend modules accounted for                        | 21/21                                                                                         |
| Exactly one owner per module                            | 21/21; M1 7, M2 4, M3 3, M4 7; no duplicate                                                   |
| D-025 status                                            | Approved in ADR index and record, and referenced as approved in every affected document       |
| No document permits negative stock through offline sync | Verified by full-text search; all remaining "negative" text forbids or tests it               |
| Reconciliation permissions respect role boundaries      | Owner/Manager, branch scope; Business Admin view-only; threat and test added                  |
| ADR identifiers                                         | D-001…D-034 defined; 0 unresolved references                                                  |
| Circular dependencies                                   | No new edges; DAG remains acyclic                                                             |
| Mermaid diagrams                                        | 16/16 parsed and rendered, 0 errors (Mermaid 11, real browser)                                |
| Relative Markdown links                                 | 109 checked, 0 missing                                                                        |
| Prettier (docs, README, CONTRIBUTING, database README)  | Pass                                                                                          |
| Git diff scope                                          | Markdown only; no application source, Prisma schema, configuration or dependency file changed |
| Step 3 work                                             | None started                                                                                  |

## D. Changed files

### Created by this amendment

- `STEP_2_FINAL_AMENDMENT_AND_APPROVAL_REPORT.md` (this file)

### Modified by this amendment

- `CONTRIBUTING.md`
- `docs/architecture/ARCHITECTURE_DECISION_RECORDS.md`
- `docs/architecture/OFFLINE_SYNCHRONIZATION_ARCHITECTURE.md`
- `docs/architecture/MULTI_TENANT_SECURITY_ARCHITECTURE.md`
- `docs/architecture/BACKEND_ARCHITECTURE.md`
- `docs/architecture/MODULE_DEPENDENCY_MAP.md`
- `docs/architecture/SYSTEM_ARCHITECTURE.md`
- `docs/api/API_ARCHITECTURE.md`
- `docs/testing/TESTING_ARCHITECTURE.md`
- `docs/team/TEAM_DEVELOPMENT_GUIDELINES.md`
- `docs/web/FRONTEND_ARCHITECTURE.md`

### Removed by this amendment

None.

### Step 2 baseline (earlier in Step 2, unchanged by this amendment)

- Created: `SYSTEM_ARCHITECTURE.md`, `BACKEND_ARCHITECTURE.md`, `FRONTEND_ARCHITECTURE.md`,
  `DESKTOP_ARCHITECTURE.md`, `MULTI_TENANT_SECURITY_ARCHITECTURE.md`,
  `OFFLINE_SYNCHRONIZATION_ARCHITECTURE.md`, `API_ARCHITECTURE.md`, `INTEGRATION_ARCHITECTURE.md`,
  `TESTING_ARCHITECTURE.md`, `MODULE_DEPENDENCY_MAP.md`, `TEAM_DEVELOPMENT_GUIDELINES.md`,
  `ARCHITECTURE_DECISION_RECORDS.md`.
- Updated: `README.md`, `database/README.md`, `PROJECT_STRUCTURE.md`.
- Removed as superseded (D-030): `modular-monolith.md`, `tenant-and-branch-isolation.md`,
  `api-conventions.md`, `test-strategy.md`, `decision-register.md`.

## E. Remaining limitations

1. **Effort points are estimates, not measurements.** The 24–26% distribution is a planning
   judgment; phase-gate velocity must confirm or rebalance it.
2. **Reconciliation permission name is illustrative.** `inventory:reconciliation:resolve` and the
   adjustment thresholds must be finalized in the permission catalogue with step-up policy.
3. **Financial/customer remedy is intentionally undefined.** If a held offline sale is not honoured,
   the remedy requires an authorized business decision under approved requirements.
4. **Open operational questions remain:** offline credential validity window, receipt block
   exhaustion, whether shift close is allowed offline in every business type, local database driver
   and encryption library, reconciliation SLA.
5. **No application verification was run for this amendment.** No application code, schema or
   configuration changed; the last executed code results remain the Phase 0 foundation results
   (17 API unit, 4 API e2e, web/desktop unit, build, format/lint/typecheck). Integration tests remain
   blocked without Docker/PostgreSQL; Electron runtime launch remains unverified; Playwright is not
   installed. None of these is claimed as passing now.
6. **Temporary validation page.** The generated Mermaid validation page under the OS temp directory
   could not be deleted because the sandbox blocks deletion outside the workspace; it is inert and
   contains only documentation diagrams.
7. **Integration claims.** Chapa, email/SMS, storage, PDF and AI remain unconfigured and unverified.

## F. Final status

**Step 2 is fully approved and ready for Step 3.** Both product-owner amendments are documented,
the four-member ownership baseline is final, all 21 modules have one accountable owner, D-025 is
Approved everywhere, the architecture is internally consistent, and documentation validation
passed. **Step 3 has not started.**
