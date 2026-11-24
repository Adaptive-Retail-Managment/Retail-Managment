# Step 3 — C-3, C-4 and C-5 completion report

**Status:** correction task executed against the approved Step 3 baseline. No migration was
generated or applied, no database was contacted, and no application code was written.

Related: [Independent audit](STEP_3_INDEPENDENT_FINAL_AUDIT_REPORT.md),
[Approval checklist](STEP_3_FINAL_APPROVAL_CHECKLIST.md),
[Schema completion report](STEP_3_DATABASE_DESIGN_AND_SCHEMA_COMPLETION_REPORT.md).

## A. Executive summary

| Condition | Scope                                                                          | Result                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-3       | F-003 nullable uniqueness, F-005 line uniqueness, F-017 invoice/PO consistency | **PARTIALLY COMPLETE** — schema + companion SQL + docs done; runtime-unverified                                                                                 |
| C-4       | F-004 nullable-`businessId` exceptions, F-012 tenant-derived children          | **COMPLETE** (documentation; runtime tests still pending by design)                                                                                             |
| C-5       | F-007, F-009, F-010, F-011, F-013                                              | **PARTIALLY COMPLETE** at time of writing — all five findings dispositioned; F-007's U-1 was subsequently decided (Option A) and implemented in `STEP_3_U1_...` |

Owner decision **U-1** (goods-receipt branch policy) was subsequently approved as Option A —
same branch only — and implemented; see
`STEP_3_U1_IMPLEMENTATION_AND_DOCUMENTATION_COMPLETION_REPORT.md`.

## B. Baseline inspected

- Canonical schema: `apps/api/prisma/schema.prisma` — 159 models, 94 enums; prior state 269
  `@@unique`, 186 `@@index`, 27 scalar `@unique`.
- Audit findings register, integrity disposition and migration conditions in
  `STEP_3_INDEPENDENT_FINAL_AUDIT_REPORT.md`; condition definitions in
  `STEP_3_FINAL_APPROVAL_CHECKLIST.md`.
- Migration strategy and companion SQL: `docs/database/DATABASE_MIGRATION_AND_SEED_STRATEGY.md`.
- Tenancy design: `docs/database/MULTI_TENANT_DATABASE_DESIGN.md`.
- Working tree: heavily uncommitted Step 2/3 work; `schema.prisma` is tracked but its committed
  version is a 13-line placeholder, so `git diff` shows the entire Step 3 schema as added — this is
  pre-existing, not churn from this task.

## C. C-3 results

### F-003 — Nullable composite uniqueness

**Inspection.** Every audit-listed model was re-inspected against the live schema. Nullable fields
inside `@@unique`/`@unique` declarations behave as distinct in PostgreSQL, so each case was
classified as DB-enforced, SQL-enforced, app-enforced or intentionally unconstrained.

| Model                     | Nullable unique member                                                                     | Disposition                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StocktakeLine`           | `batchId` in `@@unique([sessionId, variantId, batchId])`                                   | Prisma unique covers batched rows; **companion partial index** `stocktake_line_unbatched_unique ON ("sessionId","variantId") WHERE "batchId" IS NULL` covers unbatched rows                                                                           |
| `ProductAttributeValue`   | `productId`, `variantId`                                                                   | Existing per-owner uniques already prevent duplicates; **companion CHECK** `product_attribute_value_exactly_one_owner` enforces exactly-one-owner (XOR). Single value per (owner, definition) is the design; multi-value attributes were not approved |
| `IdempotencyRecord`       | `businessId` in `@@unique([businessId, scope, key])`                                       | Prisma unique covers business rows; **companion partial index** `idempotency_record_platform_unique ON ("scope","key") WHERE "businessId" IS NULL` covers platform rows                                                                               |
| `PaymentAttempt`          | `providerReference` in `@@unique([provider, providerReference])`                           | **Accepted** — NULL means "not yet provider-referenced"; dedupe only applies once a reference exists                                                                                                                                                  |
| `Notification`            | `dedupeKey` in `@@unique([businessId, dedupeKey])`                                         | **Accepted** — NULL means "no dedupe requested"                                                                                                                                                                                                       |
| `Refund`                  | `idempotencyKey` in `@@unique([businessId, idempotencyKey])`                               | **Accepted** — NULL means non-idempotent creation; `(businessId, number)` still unique                                                                                                                                                                |
| `Sale`                    | `offlineDeviceId`, `operationId` in `@@unique([businessId, offlineDeviceId, operationId])` | **Accepted** — NULL correctly means "online sale", not dedupe                                                                                                                                                                                         |
| `SyncOperation`           | `saleId` in `@@unique([businessId, saleId])`                                               | **Accepted** — prevents double-linking a sale; NULL = unlinked                                                                                                                                                                                        |
| `ReconciliationException` | `committedSaleId @unique`, `syncOperationId @unique`                                       | **Accepted** — optional 1:1 links                                                                                                                                                                                                                     |
| `StockLossRecord`         | `movementId @unique`, `batchId`                                                            | **Accepted** — optional movement link                                                                                                                                                                                                                 |
| `Customer`                | `code` in `@@unique([businessId, code])`                                                   | **Accepted** — NULL = no customer code                                                                                                                                                                                                                |
| `Role`, `Unit`            | `businessId` in `@@unique([businessId, code])`                                             | Already covered by planned `role_system_code_unique` / `unit_global_code_unique` partial indexes                                                                                                                                                      |

**Schema changes:** none required for F-003 — all fixes are companion SQL (Prisma cannot express
partial indexes or CHECK XOR across nullable columns).

**Runtime status:** specified, **unverified** — no PostgreSQL instance was contacted.

### F-005 — Missing line-level uniqueness

- `GoodsReceiptLine`: split receipt lines per PO line are legitimate **only when they carry
  different `batchNumber`/`expiryDate`** (batch-traced receiving). Added Prisma
  `@@unique([receiptId, purchaseOrderLineId, batchNumber])` plus companion partial index
  `goods_receipt_line_unbatched_unique ... WHERE "batchNumber" IS NULL`. Together they permit
  distinct batches and forbid duplicate unbatched or same-batch lines.
- `SupplierInvoiceLine`: one invoice line per PO line. Added Prisma
  `@@unique([supplierInvoiceId, purchaseOrderLineId])` (NULL `purchaseOrderLineId` = free-text
  line, unaffected).
- Lower-risk review: `PurchaseRequestLine`, `RfqLine`, `QuotationLine`, `ExchangeLine` — repeated
  variants are legitimate in their workflows (consolidated requests, quote comparison, exchange
  of identical items); **no uniqueness imposed**, decision recorded.

### F-017 — SupplierInvoiceLine ↔ PO consistency

**Schema changes (all Prisma-validated):**

1. `SupplierInvoiceLine.purchaseOrderLine` relation widened to
   `fields: [businessId, purchaseOrderId, purchaseOrderLineId, variantId]` →
   `PurchaseOrderLine[businessId, purchaseOrderId, id, variantId]` — binds business, PO and
   variant in one FK (candidate key already existed).
2. New relation `poBindingInvoice` → `SupplierInvoice[businessId, supplierId, id,
purchaseOrderId]` with new candidate `@@unique([businessId, supplierId, id, purchaseOrderId])`
   on `SupplierInvoice` — binds the line's `purchaseOrderId` to the **invoice header's** PO.
   Existing `supplierInvoice` relation renamed `SupplierInvoiceComposition`; FK names mapped
   explicitly (`SupplierInvoiceLine_invoice_fkey`, `SupplierInvoiceLine_po_binding_fkey`).
3. Companion CHECK `supplier_invoice_line_po_link_complete`: `(purchaseOrderId IS NULL) =
(purchaseOrderLineId IS NULL)` and PO-linked lines must carry `variantId`.

**Remaining application rule (documented, not DB-enforceable):** when the invoice header has a
`purchaseOrderId`, every line must carry that same `purchaseOrderId` — a line with NULL bypasses
the binding FK. Enforced inside the invoice transaction with `SELECT ... FOR UPDATE` on PO lines,
plus invoiced-quantity-vs-ordered validation. Specified in the migration strategy notes and the
CON-38/CON-39 test rows.

**Runtime status:** FK/CHECK specified, **unverified**.

## D. C-4 results

### F-004 — Nullable `businessId` exceptions

`MULTI_TENANT_DATABASE_DESIGN.md` §2 and new §3.2 now register **all ten** nullable-`businessId`
models (verified by schema scan): `Role`, `Unit`, `FileObject`, `FileLink`, `FileUploadSession`,
`PaymentWebhookEvent`, `IdempotencyRecord`, `AuditEvent`, `SupportCase`, `OutboxEvent` — each with
class, nullability reason, population rule, owning service and query rule. `AuditEvent.branchId`
with NULL `businessId` is explicitly forbidden to carry a branch.

### F-012 — Tenant-derived children

New §3.3 registers `EmploymentStatusHistory` (→`Employee`), `SyncAttempt` (→`SyncOperation`),
`SyncCursor` (→`Device`), `ForecastPoint` (→`ForecastRun`) with parent FK, derivation path, branch
inheritance and the mandatory parent-join query rule. Catalog scope labels corrected from
"Platform" to "Business (derived)"; `OutboxEvent` marked "Business / platform". TEN-20/TEN-21 test
rows added.

## E. C-5 results — decision register

Full register appended to `LOGICAL_DATABASE_DESIGN.md` §7. Summary:

| Finding                          | Treatment                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Status                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| F-007 branch consistency         | DB: `(businessId, branchId, id)` composite FKs bind `Sale.terminal`, `Sale.shift`, `CashierShift.terminal`; CHECK forbids self-transfers; `GoodsReceipt.purchaseOrder` composite FK `(businessId, purchaseOrderId, branchId)` → `PurchaseOrder(businessId, id, branchId)` enforces U-1 same-branch receiving (decision approved post-report, implemented separately). SVC/doc: returns/refund/exchange branch = processing branch (legitimate cross-branch) | RESOLVED — U-1 decided and implemented |
| F-009 dual role relations        | `role` = storage, `scopedRole` = tenant binding; service must enforce `roleBusinessId = tenant` for business roles and require global `isSystem` roles otherwise. DB binding impossible without breaking global roles                                                                                                                                                                                                                                       | RESOLVED — service-enforced            |
| F-010 assignment reassignment    | Removed `@@unique([membershipId, branchId])`; companion partial unique on active rows (`revokedAt IS NULL`); history preserved                                                                                                                                                                                                                                                                                                                              | RESOLVED                               |
| F-011 actor UUIDs                | Accepted intentional design — UUID snapshots survive user lifecycle; convention documented; FKs kept only for required operational actors                                                                                                                                                                                                                                                                                                                   | ACCEPTED — documented                  |
| F-013 `businessType` duplication | `Business.type` canonical; `BusinessConfiguration.businessType` synchronized copy (field retained — API/web docs reference it); atomic-write + divergence-reject rule                                                                                                                                                                                                                                                                                       | RESOLVED — single source of truth      |

## F. File-change inventory

| Path                                                        | Why                                     | What                                                                                                       | Condition |
| ----------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------- |
| `apps/api/prisma/schema.prisma`                             | Integrity + branch + reassignment fixes | +4 net `@@unique` (273 total), +1 `@@index` (187), 2 new relations, 2 relation widenings, 1 unique removal | C-3, C-5  |
| `docs/database/DATABASE_MIGRATION_AND_SEED_STRATEGY.md`     | Companion SQL                           | 6 new SQL blocks (4 partial indexes, 3 CHECKs), notes on app-level rules, verification list                | C-3, C-5  |
| `docs/database/DATABASE_VALIDATION_AND_TESTING.md`          | Test specs                              | CON-25…CON-39, positive cases, TEN-20/21, count updates                                                    | C-3, C-4  |
| `docs/database/MULTI_TENANT_DATABASE_DESIGN.md`             | Exception register                      | §2 rewrite, new §3.2 (10 models), §3.3 (4 derived children + query rule)                                   | C-4       |
| `docs/database/DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md` | Accuracy                                | Uniqueness/scope cells for 11 entities; counts                                                             | C-3, C-4  |
| `docs/database/LOGICAL_DATABASE_DESIGN.md`                  | Decisions                               | Invoice-line binding note; §7 decision register                                                            | C-3, C-5  |
| `docs/database/PRISMA_SCHEMA_GUIDE.md`                      | Conventions                             | Nullable-unique policy, branch-consistent POS, actor-UUID, businessType conventions; counts                | C-3, C-5  |
| `docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md`              | ERD accuracy                            | `GoodsReceiptLine.purchaseOrderLineId FK` added                                                            | C-3       |
| `docs/database/DATABASE_INDEXING_AND_PERFORMANCE.md`        | Counts                                  | 187/273/300                                                                                                | C-3       |
| `STEP_3_C3_C4_C5_COMPLETION_REPORT.md`                      | This report                             | —                                                                                                          | —         |

## G. Validation evidence

- `npx prisma validate` (with dummy `DATABASE_URL`): **PASS** — schema valid.
- `npx prisma format` then `--check`: **PASS** — formatted.
- `npx prettier --write` on 7 touched docs: applied; `--check` clean for those files.
- Static recount: 159 models, 94 enums, 141 `businessId` models, 52 `branchId` models, 273
  `@@unique`, 27 scalar `@unique`, 187 `@@index`, decimals 59/59/15 (+3/8/2/2 of other widths), 0
  Float/Double.
- **Not performed:** Prisma Client generation not re-run (no new client-affecting need beyond
  validated schema; safe to run at next authorized stage); no live PostgreSQL — all partial
  indexes/CHECKs are **runtime-unverified**; markdown link check not run as a dedicated tool
  (no new relative links added beyond existing doc cross-references).

## H. Unresolved items

- **U-1:** resolved post-report — Option A (same branch only) approved and implemented via
  composite FK; runtime validation still pending. See the U-1 completion report.
- Runtime verification of all companion SQL (indexes, CHECKs, new FKs) against PostgreSQL 17.
- F-009/F-013/F-011 service-layer rules require implementation + tests in Step 4.
- `DATABASE_VALIDATION_AND_TESTING.md` CON/TEN rows are specifications, not executed tests.

## I. Scope compliance

- Migrations generated: **NO** · applied: **NO** · database contacted: **NO** · seeds: **NO**
- Backend/frontend implementation: **NO** · Step 4: **NO** · M1–M4: **NO**
- Unrelated files modified: **NO** (pre-existing working-tree changes preserved untouched).

## J. Final condition status

- **C-3: PARTIALLY COMPLETE** — design/schema/SQL/docs consistent; runtime-unverified; U-1 open.
- **C-4: COMPLETE** — every exception classified with enforceable query rules.
- **C-5: PARTIALLY COMPLETE** — F-009/F-010/F-011/F-013 resolved; F-007 resolved (U-1 decided and implemented post-report).

## K. Recommended next action

Project owner reviews the U-1 implementation report, then authorizes migration stage A
(generate baseline migration + companion SQL review) per the staged authorization already granted.
