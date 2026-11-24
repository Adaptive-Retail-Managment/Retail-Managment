# Step 3 — Shared database design and schema completion report

**Date:** 2026-11-21
**Status:** Design and schema foundation complete; awaiting review before Step 4.
**Scope executed:** Requirements-to-entity traceability, conceptual and logical design, tenant
isolation, integrity rules, D-025 offline model, index plan, one complete Prisma schema, migration
and seed strategy, ownership map, validation strategy, and twelve canonical documents.

**Explicitly not executed:** database creation, migration application, seed execution, integration
tests, performance tests, backend services, API endpoints, authentication, POS, offline sync code,
and any Step 4 work.

---

## A. Repository inspection

### A.1 What existed before Step 3

| Area                   | State at inspection                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo               | pnpm workspace with `apps/api` (NestJS 11.2.11), `apps/web` (React/Vite), `apps/desktop` (Electron), `packages/*`                 |
| Prisma schema          | [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) contained only `generator` and `datasource`; no models, no enums |
| Migrations             | No `apps/api/prisma/migrations/` directory                                                                                        |
| Seed                   | No seed configuration or seed script                                                                                              |
| Database               | PostgreSQL 17 available only as a Docker Compose service definition; no running database was required or used                     |
| API database wiring    | `PrismaService`, `PrismaModule` and a database health service existed; no repositories or domain tables                           |
| Database documentation | Only [`database/README.md`](database/README.md); no `docs/database/` directory                                                    |
| Step 2 canon           | Thirteen approved architecture, security, offline, API, integration, testing, team and decision documents                         |

### A.2 Step 2 documents inspected

- [`docs/architecture/SYSTEM_ARCHITECTURE.md`](docs/architecture/SYSTEM_ARCHITECTURE.md)
- [`docs/architecture/BACKEND_ARCHITECTURE.md`](docs/architecture/BACKEND_ARCHITECTURE.md)
- [`docs/architecture/MULTI_TENANT_SECURITY_ARCHITECTURE.md`](docs/architecture/MULTI_TENANT_SECURITY_ARCHITECTURE.md)
- [`docs/architecture/OFFLINE_SYNCHRONIZATION_ARCHITECTURE.md`](docs/architecture/OFFLINE_SYNCHRONIZATION_ARCHITECTURE.md)
- [`docs/architecture/MODULE_DEPENDENCY_MAP.md`](docs/architecture/MODULE_DEPENDENCY_MAP.md)
- [`docs/architecture/ARCHITECTURE_DECISION_RECORDS.md`](docs/architecture/ARCHITECTURE_DECISION_RECORDS.md)
- [`docs/web/FRONTEND_ARCHITECTURE.md`](docs/web/FRONTEND_ARCHITECTURE.md)
- [`docs/desktop/DESKTOP_ARCHITECTURE.md`](docs/desktop/DESKTOP_ARCHITECTURE.md)
- [`docs/api/API_ARCHITECTURE.md`](docs/api/API_ARCHITECTURE.md)
- [`docs/integrations/INTEGRATION_ARCHITECTURE.md`](docs/integrations/INTEGRATION_ARCHITECTURE.md)
- [`docs/testing/TESTING_ARCHITECTURE.md`](docs/testing/TESTING_ARCHITECTURE.md)
- [`docs/team/TEAM_DEVELOPMENT_GUIDELINES.md`](docs/team/TEAM_DEVELOPMENT_GUIDELINES.md)
- [`STEP_2_FINAL_AMENDMENT_AND_APPROVAL_REPORT.md`](STEP_2_FINAL_AMENDMENT_AND_APPROVAL_REPORT.md)

The governing constraints retained from Step 2 are: one PostgreSQL database with a shared schema,
backend-enforced tenant isolation, one modular monolith, Prisma 6.19.3 on PostgreSQL 17, advisory-only
AI, strict offline stock protection (D-025), and the approved four-member module allocation (D-034).

### A.3 Deliverables created

Twelve documents in [`docs/database/`](docs/database/) plus one completed schema:

1. [`DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md`](docs/database/DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md)
2. [`CONCEPTUAL_DATA_MODEL.md`](docs/database/CONCEPTUAL_DATA_MODEL.md)
3. [`LOGICAL_DATABASE_DESIGN.md`](docs/database/LOGICAL_DATABASE_DESIGN.md)
4. [`ENTITY_RELATIONSHIP_DIAGRAM.md`](docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md)
5. [`MULTI_TENANT_DATABASE_DESIGN.md`](docs/database/MULTI_TENANT_DATABASE_DESIGN.md)
6. [`INVENTORY_AND_FINANCIAL_DATA_INTEGRITY.md`](docs/database/INVENTORY_AND_FINANCIAL_DATA_INTEGRITY.md)
7. [`OFFLINE_AND_RECONCILIATION_DATA_MODEL.md`](docs/database/OFFLINE_AND_RECONCILIATION_DATA_MODEL.md)
8. [`DATABASE_INDEXING_AND_PERFORMANCE.md`](docs/database/DATABASE_INDEXING_AND_PERFORMANCE.md)
9. [`PRISMA_SCHEMA_GUIDE.md`](docs/database/PRISMA_SCHEMA_GUIDE.md)
10. [`DATABASE_MIGRATION_AND_SEED_STRATEGY.md`](docs/database/DATABASE_MIGRATION_AND_SEED_STRATEGY.md)
11. [`DATABASE_MODULE_OWNERSHIP.md`](docs/database/DATABASE_MODULE_OWNERSHIP.md)
12. [`DATABASE_VALIDATION_AND_TESTING.md`](docs/database/DATABASE_VALIDATION_AND_TESTING.md)

The schema was extended in place at [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma);
no second schema and no per-member database was introduced.

---

## B. Database architecture

### B.1 Final strategy

| Choice                | Decision                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Database              | One PostgreSQL 17 database, one `public` schema shared by all 21 modules                                              |
| ORM                   | Prisma ORM 6.19.3, client generator `prisma-client-js`, single schema file                                            |
| Application shape     | Modular monolith; table ownership per module, imports only through public contracts                                   |
| Tenancy               | Shared-schema multi-tenancy with `businessId` on every tenant row and `branchId` on every branch-scoped row           |
| Isolation enforcement | Composite `(businessId, id)` foreign keys plus backend scope checks; RLS evaluated and deferred (§F)                  |
| Identity              | UUID v7 primary keys (`@default(uuid(7)) @db.Uuid`)                                                                   |
| Money                 | `Decimal(18, 2)` with an explicit `currency` column on every money-bearing table                                      |
| Quantities            | `Decimal(18, 3)`; unit costs `Decimal(18, 4)`; no `Float` or `Double` anywhere                                        |
| Time                  | `DateTime @db.Timestamptz(6)` for business and audit timestamps                                                       |
| Stock authority       | `StockBalance` is the only authoritative balance; `StockMovement` is append-only and every change references a source |
| History               | Financial and stock originals are never overwritten; void, return, refund and exchange are separate records           |
| Offline               | Every offline sale arrives as a `SyncOperation`; shortfalls create `ReconciliationException`, never accepted stock    |
| Schema boundary       | Prisma manages structure; CHECK constraints and partial unique indexes are added by hand-written migration SQL        |
| Migrations            | Forward-only, reviewed, baseline first; no destructive reset against existing data (§K)                               |

### B.2 Schema count summary

| Metric                                   | Value |
| ---------------------------------------- | ----- |
| Models (tables)                          | 159   |
| Enums                                    | 94    |
| Models carrying `businessId`             | 141   |
| Models carrying `branchId`               | 52    |
| Models with `@@unique([businessId, id])` | 138   |
| `@@unique` constraints                   | 269   |
| `@@index` declarations                   | 186   |
| Money columns `Decimal(18, 2)`           | 59    |
| Quantity columns `Decimal(18, 3)`        | 59    |
| Unit-cost columns `Decimal(18, 4)`       | 15    |
| `Float` / `Double` columns               | 0     |
| `Json` columns (each justified)          | 27    |
| `onDelete: Restrict`                     | 302   |
| `onDelete: Cascade`                      | 57    |
| `onDelete: SetNull`                      | 8     |

The counts above were produced by parsing the current schema, not copied from the design notes.

---

## C. Entity inventory

**159 tables across 21 modules plus platform infrastructure.** Distribution by accountable member
matches the approved allocation:

| Member | Domain                                  | Modules                                                                                                 | Tables |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| M1     | Platform and SaaS                       | identity, tenancy, authorization, employees, subscriptions, super-admin, audit, platform infrastructure | 33     |
| M2     | Configuration, products and files       | business-configuration, catalog, pricing, files                                                         | 23     |
| M3     | Inventory and purchasing                | inventory, suppliers, procurement                                                                       | 49     |
| M4     | Sales, intelligence and synchronization | customers, sales, after-sales, analytics, intelligence, synchronization, notifications                  | 54     |

Entity counts by module (from
[`DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md`](docs/database/DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md)):

| Module                 | Tables | Module          | Tables | Module         | Tables |
| ---------------------- | ------ | --------------- | ------ | -------------- | ------ |
| identity               | 5      | pricing         | 5      | sales          | 11     |
| tenancy                | 5      | files           | 3      | after-sales    | 9      |
| authorization          | 3      | inventory       | 18     | notifications  | 5      |
| employees              | 3      | suppliers       | 11     | analytics      | 8      |
| subscriptions          | 11     | procurement     | 20     | intelligence   | 6      |
| super-admin            | 3      | customers       | 5      | platform infra | 2      |
| audit                  | 1      | synchronization | 10     |                |        |
| business-configuration | 7      | catalog         | 8      |                |        |

### C.1 Four business types

Grocery, fashion, pharmacy and cosmetics share one catalog and inventory model. Their differences are
represented as data, not as separate product tables:

- **Grocery:** units, weight/volume attributes, batch and expiry fields on `InventoryBatch`.
- **Fashion:** size and colour attribute definitions and `ProductAttributeValue` rows.
- **Pharmacy:** batch, expiry, quarantine location, prescription-free stock only; no clinical data.
- **Cosmetics:** shade and size attribute values with the same variant and batch mechanics.

`BusinessConfiguration`, `AttributeDefinition`, `Unit`, `UnitConversion` and `CapabilityFlag` carry the
configurable differences. No business type owns a private table family.

### C.2 Traceability

Every requirement area 4.1–4.12 is mapped to primary entities, modules and an owner in the entity
catalog, plus cross-cutting `OutboxEvent` and `IdempotencyRecord`. Twenty-one of twenty-one modules and
four of four business types are covered. Deliberate exclusions (tax engine, e-invoicing, clinical
prescribing, executable AI, local SQLite schema) are documented in the catalog rather than silently
omitted.

---

## D. ER diagrams

Fourteen Mermaid diagrams across five documents:

| #   | Document                                                                                             | Diagram                                  | Type              |
| --- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| 1   | [`CONCEPTUAL_DATA_MODEL.md`](docs/database/CONCEPTUAL_DATA_MODEL.md)                                 | Platform overview                        | `erDiagram`       |
| 2   | [`CONCEPTUAL_DATA_MODEL.md`](docs/database/CONCEPTUAL_DATA_MODEL.md)                                 | Audit, notifications, delivery           | `erDiagram`       |
| 3   | [`CONCEPTUAL_DATA_MODEL.md`](docs/database/CONCEPTUAL_DATA_MODEL.md)                                 | Analytics, intelligence, forecasting     | `erDiagram`       |
| 4   | [`ENTITY_RELATIONSHIP_DIAGRAM.md`](docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md)                     | Identity and tenancy                     | `erDiagram`       |
| 5   | [`ENTITY_RELATIONSHIP_DIAGRAM.md`](docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md)                     | Business configuration, catalog, pricing | `erDiagram`       |
| 6   | [`ENTITY_RELATIONSHIP_DIAGRAM.md`](docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md)                     | Inventory, batches, movements, counts    | `erDiagram`       |
| 7   | [`ENTITY_RELATIONSHIP_DIAGRAM.md`](docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md)                     | Suppliers and procurement                | `erDiagram`       |
| 8   | [`ENTITY_RELATIONSHIP_DIAGRAM.md`](docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md)                     | POS, sales, payments, shifts             | `erDiagram`       |
| 9   | [`ENTITY_RELATIONSHIP_DIAGRAM.md`](docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md)                     | Returns, refunds, exchanges              | `erDiagram`       |
| 10  | [`LOGICAL_DATABASE_DESIGN.md`](docs/database/LOGICAL_DATABASE_DESIGN.md)                             | Subscriptions, invoices, payments        | `erDiagram`       |
| 11  | [`OFFLINE_AND_RECONCILIATION_DATA_MODEL.md`](docs/database/OFFLINE_AND_RECONCILIATION_DATA_MODEL.md) | Devices, sync, reconciliation            | `erDiagram`       |
| 12  | [`OFFLINE_AND_RECONCILIATION_DATA_MODEL.md`](docs/database/OFFLINE_AND_RECONCILIATION_DATA_MODEL.md) | Sync operation lifecycle                 | `stateDiagram-v2` |
| 13  | [`OFFLINE_AND_RECONCILIATION_DATA_MODEL.md`](docs/database/OFFLINE_AND_RECONCILIATION_DATA_MODEL.md) | Reconciliation lifecycle                 | `stateDiagram-v2` |
| 14  | [`DATABASE_MODULE_OWNERSHIP.md`](docs/database/DATABASE_MODULE_OWNERSHIP.md)                         | Module-to-table ownership                | `flowchart TB`    |

### D.1 Render validation

Each diagram was extracted into a temporary page, rendered with the Mermaid 11 ESM build in a Chromium
browser, and inspected through the DOM. The temporary page and audit scripts were deleted afterwards.

| Check                            | Result                                                        |
| -------------------------------- | ------------------------------------------------------------- |
| Diagrams parsed and rendered     | 14 of 14 (`ok: true` for every diagram)                       |
| Mermaid error markers            | 0 (`.error-icon` absent in every SVG)                         |
| Non-empty SVG bounding boxes     | 14 of 14                                                      |
| Labels present                   | Every diagram, labels counted inside `foreignObject` content  |
| Label counts (in document order) | 75, 80, 70, 115, 121, 128, 126, 124, 114, 72, 160, 18, 16, 48 |

Because Mermaid 11 places edge labels in `foreignObject` HTML rather than `<text>` nodes, an SVG
`<text>` count is not a valid label test; the audit counted label elements inside `foreignObject`
instead. The browser viewport was small, so diagrams were structurally validated rather than
reviewed at pixel level. The documents also carry prose explanations, so a rendering defect would not
leave the model undefined.

---

## E. Prisma schema

### E.1 Location and configuration

- Path: [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) — the only Prisma schema in
  the repository.
- Generator: `prisma-client-js` (Prisma Client 6.19.3).
- Datasource: PostgreSQL via `env("DATABASE_URL")`.
- Formatting: `prisma format` passes.
- Validation: `prisma validate` passes with a placeholder `DATABASE_URL`; validation parses the schema
  and does not connect to a database.
- Generation: `prisma generate` passes and writes Prisma Client 6.19.3.

### E.2 Coverage

All 21 modules have models, enums, relations, indexes and uniqueness rules. The schema includes the
full sales and after-sales chain, inventory ledger and reconciliation, procurement and supplier
records, subscriptions and payment attempts, notifications, analytics facts, and intelligence
outputs. There are no placeholder or empty models.

### E.3 Conventions enforced in the schema

- Every model has an `id` primary key except `RolePermission`, which uses its documented composite
  primary key.
- Tenant parents expose `@@unique([businessId, id])` so children use composite foreign keys.
- Idempotency is expressed as real unique constraints: `IdempotencyRecord(scope, key)`,
  `SyncOperation(deviceId, operationId)`, `Sale(offlineDeviceId, operationId)`,
  `Refund(businessId, idempotencyKey)`, `PaymentWebhookEvent(provider, providerEventId)`, and
  `StockMovement(businessId, sourceKey)`.
- Money columns never use floating point; every money-bearing table carries `currency`.
- `Json` is limited to 27 justified columns (external payloads, flexible settings, forecast inputs).
- Composite relations never use `SetNull` when `businessId` is required; they use `Restrict`.
- History and financial child rows use `Restrict` on delete; cascade is reserved for owned,
  non-financial detail rows.
- The schema guide documents the Prisma-versus-migration boundary, naming rules, relation rules and
  review checklist.

### E.4 Relation integrity

Prisma validation reports no missing opposite relations. Three nonstandard foreign-key names were
corrected during validation (`invitedByMembershipId`, `caseId`, `attributeDefinitionId`) so that the
composite relations point at real fields. Twenty-eight secondary relations were converted to full
composite tenant relations; the residual id-only references are enumerated in §F.3.

---

## F. Multi-tenant integrity

### F.1 Representation

| Level          | Rule                                                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business       | Every tenant-owned table carries a non-null `businessId`; global tables are limited to `Role`, `Unit`, `FileObject`, `FileLink` and `PaymentWebhookEvent` |
| Branch         | Branch-scoped tables carry `branchId` and reference `Branch` through `(businessId, branchId)`                                                             |
| Child rows     | Reference parents through `(businessId, parentId)` against the parent's `@@unique([businessId, id])`                                                      |
| Actor scope    | Membership and branch assignment are validated by the tenancy module before any write                                                                     |
| Platform scope | Super Admin is not a business member and gains access only through an audited support grant                                                               |

### F.2 What the database enforces

- A row cannot point at a parent in another business through a composite foreign key, because the
  referenced `(businessId, id)` pair must exist in the parent table.
- Deleting a business or branch is restricted while tenant rows reference it.
- A branch-scoped row cannot reference a branch that belongs to a different business, because the
  branch relation includes `businessId`.
- Application-level scope checks remain mandatory for query filtering; composite keys prevent
  cross-tenant references, not cross-tenant reads.

### F.3 Known residual references

Nineteen relations remain single-column because their parent is legitimately global or nullable:
`Membership.role`, `Invitation.role`, product and attribute-definition units, unit conversions,
`FileObject`/`FileLink` consumers, supplier and receipt attachments, `ExportJob.file`, and
`PaymentWebhookEvent.attempt`. Each is documented with its service-side mitigation in
[`MULTI_TENANT_DATABASE_DESIGN.md`](docs/database/MULTI_TENANT_DATABASE_DESIGN.md) §3.1. None of them
grants access to business data on its own; access still passes through a scoped parent.

### F.4 Row-level security

RLS was evaluated and not adopted in Step 3. The documented reasons are connection pooling with
Prisma (session variables do not follow a multiplexed connection reliably), migration and background
job complexity, and the risk of a false sense of safety when the application role owns the tables.
The primary control remains backend scope enforcement plus composite foreign keys. RLS is recorded as
an optional hardening step requiring a dedicated ADR, a non-owner application role, and pooled
connection handling.

### F.5 Threat coverage

The tenancy document maps threats to controls: cross-tenant reads (scope guard), cross-tenant writes
(composite keys plus guard), ID enumeration (opaque UUIDs), role escalation (permission evaluator and
scoped role resolution), support access (grant plus audit), and background job leakage (mandatory
`businessId` in job payloads).

---

## G. Inventory and financial integrity

### G.1 Stock authority

- `StockBalance` is the single authoritative row per `(branchId, variantId)` with on-hand, reserved and
  in-transit quantities.
- `StockMovement` is append-only and carries a source type, source id and idempotency `sourceKey`.
- `BatchMovementAllocation` links each movement to FIFO batches; `InventoryBatch.quantityRemaining`
  tracks batch depletion.
- `InventoryValuationSnapshot` records daily weighted-average-cost valuation.
- Transfers, counts, adjustments, losses and reservations are separate documents that produce
  movements; none edits a balance directly without a movement.

### G.2 Rules encoded or specified

| Rule                                                         | Where it lives                                            |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| Negative on-hand, reserved or in-transit quantity prohibited | CHECK constraints in the planned migration SQL            |
| Reserved quantity cannot exceed on-hand                      | CHECK constraint in the planned migration SQL             |
| Batch remaining cannot exceed received                       | CHECK constraint in the planned migration SQL             |
| Valuation total cannot be negative                           | CHECK constraint in the planned migration SQL             |
| One open shift per terminal                                  | Partial unique index in the planned migration SQL         |
| One owner membership per business                            | Partial unique index in the planned migration SQL         |
| One system role per code; one global unit per code           | Partial unique indexes in the planned migration SQL       |
| Duplicate stock movement per source                          | `@@unique([businessId, sourceKey])` on `StockMovement`    |
| A purchase order never increases stock                       | No stock movement is generated by `PurchaseOrder`         |
| Only accepted receiving increases stock                      | `GoodsReceiptLine` accepted quantity feeds the movement   |
| Business Admin is not a physical operator                    | Permission model: digital grants only, no physical grants |

Constraint names, rejection cases and test IDs are in
[`DATABASE_VALIDATION_AND_TESTING.md`](docs/database/DATABASE_VALIDATION_AND_TESTING.md) §3 and
[`DATABASE_MIGRATION_AND_SEED_STRATEGY.md`](docs/database/DATABASE_MIGRATION_AND_SEED_STRATEGY.md).
**These constraints are specified but not yet applied to a database.**

### G.3 Financial history

- `Sale` totals are immutable once posted; `SaleVoid`, `ReturnRequest`, `Refund` and `Exchange` are
  separate records linked to the original.
- `SaleLine` stores price and cost snapshots so later price changes cannot rewrite history.
- Purchase order revisions, supplier price history, price change history and valuation snapshots are
  append-only or status-versioned.
- Every money-bearing table has an explicit currency; all amounts are exact decimals.
- Payment attempts, supplier invoices, payments and allocations are distinct records with unique
  business references.
- Deletion is `Restrict` for financial and history rows; archival is represented by status and
  timestamps, not by deleting rows.

### G.4 Transaction and locking requirements (documented, not implemented)

The integrity document specifies the transaction boundary and lock order for stock-affecting
operations: lock the `StockBalance` rows in a deterministic order, verify availability inside the
transaction, append the movement and allocations, update the balance and batch remainders, write the
outbox event, and commit. It also specifies optimistic concurrency for mutable documents and the
idempotency check that must occur before lock acquisition. No locking code was written in Step 3.

---

## H. Offline data integrity (D-025)

### H.1 Representation

| Table                         | Role                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| `Device`                      | Enrolled desktop device and credential                                      |
| `SyncSession`                 | One upload batch from a device                                              |
| `SyncOperation`               | Idempotent offline operation envelope; unique per `(deviceId, operationId)` |
| `SyncAttempt`                 | Append-only per-attempt outcome                                             |
| `ReconciliationException`     | Server-side stock shortfall for an offline sale                             |
| `ReconciliationShortfallLine` | Original shortfall quantity per variant                                     |
| `ReconciliationEvent`         | Append-only resolution history                                              |
| `ConflictRecord`              | Non-stock conflict requiring manual resolution                              |
| `SyncCursor`, `FeedEvent`     | Feed position and ordered configuration/price/stock events                  |

### H.2 Rules encoded

- An offline transaction is never accepted merely because the device recorded it. Local recording
  creates a pending transaction awaiting server validation; it is not authoritative acceptance.
  The operation is ingested, validated and either committed in full or rejected in full into a
  reconciliation exception.
- If available stock is insufficient, the server rejects the **entire** operation. Partial
  acceptance and partial fulfilment are prohibited: no part of the rejected sale may be committed,
  no authoritative sale record or stock movement is created, and no negative balance is ever
  written — offline negative stock is not permitted under any circumstance.
- `ReconciliationException` preserves the complete original payload (products, quantities,
  recorded prices, payments and timestamps) plus the per-variant shortfall lines; resolution never
  overwrites the original transaction.
- Resolution requires an authorized Owner or Manager with the reconciliation permission;
  Business Admin is view-only for physical stock outcomes. After authorized stock correction the
  held operation may undergo exactly one audited revalidation (`revalidationCount` limited to
  `0..1` by a planned CHECK constraint) and can never be committed twice.
- Lifecycle is constrained to `OPEN → INVESTIGATING → STOCK_CORRECTED → RELEASED → COMMITTED` or
  `NOT_FULFILLED`.
- Business Admin can view reconciliation but cannot approve physical stock corrections.
- Duplicate operations are prevented by `(deviceId, operationId)` and by receipt-number block
  ownership (`ReceiptBlock`).

The full model, including the two lifecycle diagrams and ten test specifications, is in
[`OFFLINE_AND_RECONCILIATION_DATA_MODEL.md`](docs/database/OFFLINE_AND_RECONCILIATION_DATA_MODEL.md).

---

## I. Four-member ownership

| Member | Modules (accountable database-design owner)                                                             | Tables |
| ------ | ------------------------------------------------------------------------------------------------------- | ------ |
| M1     | identity, tenancy, authorization, employees, subscriptions, super-admin, audit, platform infrastructure | 33     |
| M2     | business-configuration, catalog, pricing, files                                                         | 23     |
| M3     | inventory, suppliers, procurement                                                                       | 49     |
| M4     | customers, sales, after-sales, analytics, intelligence, synchronization, notifications                  | 54     |

All 21 modules are assigned exactly once; the sum is 159 tables. Shared and cross-cutting tables
(`OutboxEvent`, `IdempotencyRecord`, `AuditEvent`, notifications) follow the review rules in
[`DATABASE_MODULE_OWNERSHIP.md`](docs/database/DATABASE_MODULE_OWNERSHIP.md), which also lists every
table per owner and the change-review checklist. The ownership map is consistent with
[`MODULE_DEPENDENCY_MAP.md`](docs/architecture/MODULE_DEPENDENCY_MAP.md) §3.

No module is designed twice and no table has two owners. Cross-module reads go through public
contracts; no module is permitted to query another module's tables directly.

---

## J. Validation

### J.1 Checks actually executed

| #   | Check                      | Command / method                                                              | Result                                                           |
| --- | -------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | Prisma formatting          | `prisma format --schema apps/api/prisma/schema.prisma`                        | Passed                                                           |
| 2   | Prisma validation          | `prisma validate --schema apps/api/prisma/schema.prisma` with placeholder URL | Passed: “The schema ... is valid”                                |
| 3   | Prisma client generation   | `prisma generate --schema apps/api/prisma/schema.prisma`                      | Passed: Prisma Client 6.19.3 generated                           |
| 4   | Model count                | Parse `^model`                                                                | 159                                                              |
| 5   | Enum count                 | Parse `^enum`                                                                 | 94                                                               |
| 6   | Tenant columns             | Count `businessId` / `branchId` fields                                        | 141 / 52                                                         |
| 7   | Composite tenant keys      | Count `@@unique([businessId, id])`                                            | 138                                                              |
| 8   | Unique and index inventory | Count `@@unique` / `@@index`                                                  | 269 / 186                                                        |
| 9   | Money and quantity types   | Count decimal scales; search `Float`/`Double`                                 | 59 / 59 / 15; 0 floats                                           |
| 10  | JSON justification         | Count `Json` columns                                                          | 27, all listed in the schema guide                               |
| 11  | Delete behaviour           | Count `onDelete` modes                                                        | 302 Restrict / 57 Cascade / 8 SetNull                            |
| 12  | Composite `SetNull` guard  | Search for `SetNull` on relations with required `businessId`                  | None                                                             |
| 13  | Tenant relation audit      | Script comparing tenant parents against relation fields                       | 19 id-only references, all documented exceptions                 |
| 14  | Opposite relations         | Prisma validation                                                             | No missing opposite relation                                     |
| 15  | Diagram rendering          | Mermaid 11 in Chromium; DOM audit                                             | 14/14 rendered, 0 error icons, 14 non-empty SVGs                 |
| 16  | Documentation links        | Script resolving relative links across `docs/database/`                       | 12 files checked, 0 missing, 0 external                          |
| 17  | Documentation formatting   | `prettier --check "docs/database/**/*.md"`                                    | All files use Prettier style                                     |
| 18  | Ownership consistency      | Sum module table counts; compare with model count                             | 33 + 23 + 49 + 54 = 159; 21 modules, one owner each              |
| 19  | Traceability coverage      | Compare requirement areas 4.1–4.12 with catalog                               | All 12 areas mapped; all 21 modules and 4 business types covered |
| 20  | Schema location            | Repository search                                                             | One `schema.prisma`; no second database or per-member schema     |

Temporary audit scripts and render pages were removed from the repository after use.

### J.2 Checks not executed

| Check                                              | Status   | Reason                                                       |
| -------------------------------------------------- | -------- | ------------------------------------------------------------ |
| PostgreSQL database creation                       | Not run  | No database was required for schema design; no local server  |
| Baseline migration generation and application      | Not run  | Deliberately deferred to the first reviewed migration        |
| CHECK constraints and partial indexes in a live DB | Not run  | They ship as companion SQL with the baseline migration       |
| `prisma db seed`                                   | Not run  | No seed runner or seed config exists yet                     |
| Tenant isolation integration tests                 | Not run  | Requires a migrated test database                            |
| Stock, reconciliation, subscription integration    | Not run  | Requires repositories and a test database                    |
| Query-plan and index performance tests             | Not run  | Requires fixtures and a populated database                   |
| Pixel-level visual review of diagrams              | Not done | Small automated viewport; structural validation used instead |

No migration, seed or integration test is claimed as passing.

---

## K. Remaining limitations

### K.1 Design questions still open

1. **Partial fulfilment policy for offline shortfalls — resolved, no longer open.** Approved
   decision D-025 fixes the rule: a stock-insufficient offline sale is rejected in its entirety,
   with no partial acceptance or partial fulfilment, no authoritative sale or stock movement, and
   the complete original payload preserved as a reconciliation exception resolved by an authorized
   Owner or Manager (Business Admin view-only) followed by at most one audited revalidation. The
   schema and [`OFFLINE_AND_RECONCILIATION_DATA_MODEL.md`](docs/database/OFFLINE_AND_RECONCILIATION_DATA_MODEL.md)
   already encode this strict behaviour; no design question remains.
2. **Batch selection policy.** FIFO is documented as the default; whether pharmacy or grocery need a
   configurable FEFO override per business type is unresolved.
3. **Reconciliation ownership.** The exception records an assigned membership, but the operational SLA
   and escalation path belong to a later workflow decision.
4. **Retention windows.** Audit, analytics facts, sync attempts and export artefacts have no approved
   retention duration; the schema keeps them append-only until a policy is set.
5. **RLS adoption.** Deferred with a written rationale; adopting it later requires an ADR and a
   non-owner database role.

### K.2 Environment limitations

- No PostgreSQL instance was started, so migration SQL has not been parsed by PostgreSQL 17 and the
  CHECK constraints remain unverified in a live engine.
- Prisma validation used a placeholder `DATABASE_URL`; it confirms schema structure, not connectivity.
- Diagram validation used an automated browser viewport, not a design review at full size.
- No CI job yet runs the schema checks; the validation document defines the intended CI stages.

### K.3 Implementation intentionally postponed

- Baseline migration files, companion constraint SQL and partial indexes.
- Seed runner, seed configuration and seed data.
- NestJS repositories, services, guards and API endpoints.
- Authentication, authorization enforcement code and session handling.
- Frontend, desktop, POS, procurement, payment, analytics, forecasting and offline sync code.
- All integration and performance tests.

---

## L. Step 4 readiness

The database foundation is complete and internally consistent:

- One PostgreSQL 17 database strategy and one Prisma schema.
- All 21 modules and all four business types represented, with no module left to a later owner.
- Tenant and branch isolation expressed through columns, composite keys and documented exceptions.
- Stock, financial and offline rules expressed as schema constraints or specified migration SQL.
- Indexes, idempotency keys and history rules defined.
- Ownership, migration, seed, validation and documentation deliverables in place.

Step 4 can begin with review of this foundation and, once approved, the first migration slice:
generate the baseline migration on an ephemeral PostgreSQL 17 instance, apply the companion CHECK and
partial-index SQL, run the MIG/CON/TEN tests, add the seed runner, and only then start the first
module's repositories and services.

**No Step 4 work has started.** Per the Step 3 stop condition, this report ends the design and schema
stage. Backend services, API endpoints, authentication, frontend, POS, inventory workflows,
purchasing, payment integration, AI forecasting and offline synchronization remain out of scope until
the shared database design and schema are reviewed and validated.
