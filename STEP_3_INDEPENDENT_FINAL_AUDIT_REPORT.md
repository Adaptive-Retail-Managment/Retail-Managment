# Step 3 — Independent Final Audit Report

**Date:** 2026-11-21
**Auditor role:** Independent Senior Database Architect / PostgreSQL 17 Specialist / Prisma ORM
Auditor / Multi-Tenant SaaS Security Auditor / QA Reviewer. This audit was performed by an agent
that did not author the Step 3 schema or documents.
**Subject:** Step 3 — Shared database design and schema establishment
(`apps/api/prisma/schema.prisma`, `docs/database/`, Step 3 completion report).
**Audit-only constraint honored:** No schema, documentation, migration, seed or application file
was modified. The only files created are this report and
[`STEP_3_FINAL_APPROVAL_CHECKLIST.md`](STEP_3_FINAL_APPROVAL_CHECKLIST.md).

---

## 1. Executive summary

Step 3 produced a large, internally consistent database foundation: **159 models, 94 enums** in a
single canonical Prisma schema, twelve design documents, a migration/seed strategy, an ownership
map, a validation strategy and a completion report. The schema is technically strong: tenant
isolation is expressed through composite candidate keys, money and quantities use `Decimal` with
no floating point, history is preserved through status transitions and append-only records, and
the offline reconciliation model matches approved decision **D-025** in the schema and in
`OFFLINE_AND_RECONCILIATION_DATA_MODEL.md`.

The audit found **no Critical defect**. The most serious finding is a **High** documentation
defect: the Step 3 completion report contains a rule that contradicts approved D-025 by leaving
partial fulfilment of offline shortfalls open (§H.2, §K.1), even though the schema and the
dedicated offline document correctly implement strict rejection. Several **Medium** findings
concern stale verification statistics in two documents, PostgreSQL NULL-uniqueness loopholes,
undocumented nullable `businessId` tables, missing line-level uniqueness on goods-receipt and
supplier-invoice lines, and the absence of verifiable four-member review evidence. The approved
numbered requirements document (4.1–4.12) is **absent from the repository**, so full
requirements traceability is partially NOT VERIFIED by construction, not by defect.

**Verdict: APPROVED WITH DOCUMENTED CONDITIONS** — see §18. Baseline migration is authorized
subject to the conditions listed there; none of them is a schema-critical defect, but two are
documentation corrections and one is a governance acceptance.

---

## 2. Audit scope and independence

Scope per assignment:

- All twelve `docs/database/` documents (existence, completeness, accuracy, consistency with the
  schema and with Step 2 decisions, cross-document consistency, link validity).
- The entire `apps/api/prisma/schema.prisma` (every model, enum, field, relation, index, unique
  constraint and deletion policy — inspected in full, not sampled).
- Step 2 architecture/decision documents (`SYSTEM_ARCHITECTURE`, `BACKEND_ARCHITECTURE`,
  `MODULE_DEPENDENCY_MAP`, `MULTI_TENANT_SECURITY_ARCHITECTURE`,
  `OFFLINE_SYNCHRONIZATION_ARCHITECTURE`, `ARCHITECTURE_DECISION_RECORDS`, API/frontend/desktop/
  integration/testing/team docs as needed).
- `STEP_2_FINAL_AMENDMENT_AND_APPROVAL_REPORT.md`,
  `STEP_3_DATABASE_DESIGN_AND_SCHEMA_COMPLETION_REPORT.md`, `README.md`,
  `docs/requirements/master-requirements.md`, `docs/product/scope-and-phases.md`.
- Git history and working-tree status (read-only).

Out of scope / not performed: migrations, database creation, seed execution, backend code, Step 4
work, any modification of existing files.

---

## 3. Repository and deliverable inventory

| Deliverable                                      | Path                                                     | Status                                             |
| ------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| Canonical Prisma schema                          | `apps/api/prisma/schema.prisma`                          | Present; 4,236 lines                               |
| Migrations directory                             | `apps/api/prisma/migrations/`                            | **Absent — by design** (§4.1)                      |
| 12 database documents                            | `docs/database/*.md`                                     | All present                                        |
| Step 3 completion report                         | `STEP_3_DATABASE_DESIGN_AND_SCHEMA_COMPLETION_REPORT.md` | Present; contains F-001                            |
| Step 2 approval report                           | `STEP_2_FINAL_AMENDMENT_AND_APPROVAL_REPORT.md`          | Present                                            |
| Approved numbered requirements (4.1–4.12 source) | —                                                        | **Absent from repository**                         |
| Binding constraints doc                          | `docs/requirements/master-requirements.md`               | Present; states approved docs were never committed |
| Module dependency map (21 modules)               | `docs/architecture/MODULE_DEPENDENCY_MAP.md`             | Present                                            |
| Ownership doc                                    | `docs/database/DATABASE_MODULE_OWNERSHIP.md`             | Present                                            |
| Member review reports                            | —                                                        | **None found**                                     |

Git state: exactly **one commit** (`a356aad chore: initialize project foundation`, single author).
All Step 2/Step 3 documents and the schema changes are **uncommitted** working-tree modifications.

---

## 4. Audit methodology

1. Full manual read of `schema.prisma` (all 159 models, 94 enums, ~4,200 lines).
2. Static scripts (read-only) to count models, enums, `businessId`/`branchId` carriers,
   composite tenant keys, `@@unique`/`@@index` declarations, `onDelete` modes, `Decimal`
   precisions, `Json` columns, relations lacking `businessId` in `fields`, plain `*UserId`
   scalars, and unique constraints containing nullable fields.
3. Cross-check of every database document against the actual schema, including field-level ERD
   attribute blocks.
4. Whole-repository text search for D-025 contradictions (`partial`, `negative`, `oversell`,
   `revalidat`, `fulfil`).
5. Safe Prisma CLI validation (see §5).
6. Git history/status inspection.
7. Link validation of all relative Markdown links under `docs/`.

Checks that could not be performed are marked **NOT VERIFIED**, never PASS.

---

## 5. Mechanical validation results

Commands executed from `apps/api` with a placeholder `DATABASE_URL`
(`postgresql://postgres:postgres@localhost:5432/adaptive_retail?schema=public`; no database was
contacted — validation is structural only):

| Command                                    | Result                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `npx prisma validate`                      | **PASS** — "The schema at prisma\schema.prisma is valid"                                                                                   |
| `npx prisma format --check`                | **PASS** — "All files are formatted correctly!"                                                                                            |
| `npx prisma generate`                      | **PASS** — Prisma Client 6.19.3 generated                                                                                                  |
| Float/Double search (`grep Float\|Double`) | **0 occurrences**                                                                                                                          |
| Decimal precision census                   | `Decimal(18,2)` ×60, `Decimal(18,3)` ×60, `Decimal(18,4)` ×16, `Decimal(18,6)` ×3, `Decimal(5,2)` ×8, `Decimal(5,4)` ×2, `Decimal(6,2)` ×2 |
| Relative Markdown link check (all `docs/`) | **0 broken links**                                                                                                                         |
| `git log --all --oneline`                  | 1 commit, 1 author                                                                                                                         |
| `git status --short`                       | Step 2/3 deliverables uncommitted                                                                                                          |

**Limitations:** Prisma validation proves schema syntax and relation integrity only. No
PostgreSQL instance was used; CHECK constraints, partial indexes and all runtime behavior are
unverified (they do not yet exist — no migration has been generated, by design).

---

## 6. Actual schema statistics (measured, authoritative)

| Metric                                           | Documented | **Actual (measured)**                   |
| ------------------------------------------------ | ---------- | --------------------------------------- |
| Models                                           | 159        | **159**                                 |
| Enums                                            | 88         | **94**                                  |
| Models with `businessId`                         | 140        | **142**                                 |
| Models with `branchId`                           | 46         | **52**                                  |
| `@@unique([businessId, id])` composite keys      | 138        | **138**                                 |
| `@@unique` declarations                          | 245        | **269**                                 |
| `@@index` declarations                           | 180        | **186**                                 |
| `onDelete: Restrict` relations                   | 250        | **302**                                 |
| `onDelete: Cascade` relations                    | 70         | **57**                                  |
| `onDelete: SetNull` relations                    | 19         | **8**                                   |
| `Decimal(18,2)` money columns                    | 59         | **60**                                  |
| `Decimal(18,3)` quantity columns                 | 59         | **60**                                  |
| `Decimal(18,4)` unit-cost columns                | 15         | **16**                                  |
| `Json` columns                                   | 27         | **27**                                  |
| Models with no `businessId`                      | —          | **17** (see §9/F-014)                   |
| Relations with `businessId` absent from `fields` | —          | **41** (mostly safe; see §7/F-009 area) |
| Plain `*UserId` scalar fields without FK         | —          | **44** (F-011)                          |

The documented counts in `DATABASE_VALIDATION_AND_TESTING.md` §2 and `PRISMA_SCHEMA_GUIDE.md` §2
are stale relative to the final schema — the schema was evidently amended after those counts were
recorded. See **F-002**.

---

## 7. Tenant isolation audit

### 7.1 What the schema enforces at the database level

- Every tenant-owned row carries `businessId` (142 models). Branch-scoped rows carry
  `businessId` + `branchId` (52 models).
- Tenant-scoped parents expose `@@unique([businessId, id])` (138 models; the four exceptions —
  `Business` root, `TrialGrant`, `BusinessConfiguration` with `businessId @unique`, and
  `IdempotencyRecord` with nullable tenant — are individually justified in the schema guide).
- Child relations use composite foreign keys
  `fields: [businessId, parentId] → references: [businessId, id]`, so a row **cannot reference a
  parent in another business** even if application code errs. Verified examples:
  `Sale → Branch`, `SaleLine → Sale(businessId,branchId,saleId)`, `ProductVariant → Product`,
  `PurchaseOrder → Supplier`, `GoodsReceipt → PurchaseOrder`, `PaymentAllocation →
SupplierPayment/SupplierInvoice` (both keyed `[businessId, supplierId, id]`, which also forces
  payment and invoice to share the supplier), `Refund → Sale/ReturnRequest`, `RefundAllocation →
Refund/SalePayment` (both carry `saleId`, forcing refund and payment onto the same sale),
  `ReturnLine → ReturnRequest/SaleLine` (composites carry `saleId`, forcing the return, the
  request and the original sale line onto one sale), `Exchange → ReturnRequest` (same `saleId`
  composite), `AuditEvent → Branch/Membership`, `ReconciliationException → SyncOperation/
Membership/StocktakeSession/Sale`, `Business.ownerMembership → Membership(businessId,id)`
  (one official owner structurally bound to the business), `TransferReceipt → StockTransfer`
  via `(businessId, transferId, branchId) → (businessId, id, toBranchId)` which forces the
  receipt's branch to be the transfer **destination**.
- `Membership @@unique([businessId, userId])` prevents duplicate memberships; one-owner-per-
  business is enforced by `Business.ownerMembershipId @unique` plus a **planned** partial unique
  index (`membership_one_owner_per_business`) in the migration SQL — correctly identified as not
  yet existing.
- Natural keys are tenant-scoped (`@@unique([businessId, sku])`, `[businessId, code]`,
  `[businessId, receiptNumber]`, `[businessId, number]`).

### 7.2 Cross-tenant reads vs cross-tenant references

The design correctly distinguishes the two: composite FKs prevent invalid cross-tenant
**references**; they do not prevent a query that omits `businessId` from **reading** another
tenant's rows. `MULTI_TENANT_DATABASE_DESIGN.md` §4 states this explicitly and mandates
backend tenant filtering, a `TenantScope` repository pattern and cross-tenant tests. RLS was
evaluated and deliberately deferred with written adoption criteria (§5 of that document). This
is an honest, defensible position at Step 3; it becomes a hard requirement in Step 4.

### 7.3 Nullable `businessId` models

Ten models have nullable `businessId`: `Role`, `Unit`, `FileObject`, `FileLink`,
`PaymentWebhookEvent` (the five documented exceptions in `MULTI_TENANT_DATABASE_DESIGN.md` §2),
**plus five undocumented ones**: `FileUploadSession`, `OutboxEvent`, `IdempotencyRecord`,
`AuditEvent`, `SupportCase` — see **F-004**.

### 7.4 Residual id-only relations

41 relations reference parents without `businessId` in `fields`. Classification:

| Class                                        | Relations                                                                                                                                                                                                                                                                                                         | Assessment                                                                                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Safe global parents                          | `User`, `Plan`, `Permission`, `ForecastModel` references (sessions, tokens, credentials, plan links, role permissions, forecast model/metric links, support-case user links, notification recipient/preference, device enrolment)                                                                                 | **Safe** — parents are platform-global                                                                                                                                   |
| Documented nullable-tenant exceptions        | `Membership.role`, `Invitation.role`, `Membership.scopedRole`, `Invitation.scopedRole` (Role); `Product.unit`, `ProductVariant.unit`, `AttributeDefinition.unit`, `Unit.baseUnit`, `UnitConversion.fromUnit/toUnit` (Unit); `FileLink.file`, `FileUploadSession.file` (FileObject); `PaymentWebhookEvent.attempt` | **Application-enforced** — explicitly listed in tenancy doc §3.1/TEN-16..19; each requires a service-layer scope check and a cross-tenant test                           |
| Tenant-derived children without `businessId` | `EmploymentStatusHistory.employeeId → Employee.id`, `SyncAttempt.syncOperationId → SyncOperation.id`, `SyncCursor.deviceId → Device.id`, `ForecastPoint.forecastRunId → ForecastRun.id`                                                                                                                           | **Unresolved-by-design** — the child row carries no tenant column; tenant filtering requires a join through the parent. Catalog labels these "Platform" scope. See F-014 |

The tenancy document claims "nineteen" residual id-only relations; the measured set is
consistent with that count depending on whether the nullable `scopedRole` composites are counted
separately. **Partially verified.**

### 7.5 Membership role integrity (F-009)

`Membership` carries **two parallel relations to `Role`**: `role` (`roleId → Role.id`, unconstrained
by tenant) and `scopedRole` (`[roleBusinessId, roleId] → Role[businessId, id]`). The composite
scoped relation guarantees the role's `businessId` equals the stored `roleBusinessId` value —
but **nothing constrains `roleBusinessId` to equal `membership.businessId`**, and the plain
`role` relation can point at any role row including another tenant's custom role or a global
system role. Consequence: at the database level a membership in business A can reference a role
owned by business B; correctness depends entirely on the authorization service. This is the
documented TEN-16 exception, but the dual-relation design adds ambiguity about which relation is
authoritative and permits the two to disagree. See findings register.

### 7.6 Branch-level (intra-tenant) consistency (F-007)

Composite FKs enforce same-**business** everywhere; same-**branch** is enforced only where a
composite carries `branchId` (e.g., `SaleLine.batch`, `TransferReceiptLine.batch`,
`StocktakeLine.session`, `InventoryBatch.location`). Gaps verified:

- `Sale.shiftId → CashierShift(businessId, id)` and `Sale.terminalId → PosTerminal(businessId, id)`
  are business-level only: a sale at branch X can reference a shift/terminal of branch Y in the
  same business.
- `CashierShift.branchId` and `PosTerminal.branchId` are likewise not tied to each other.
- `ReturnRequest.branchId`, `Refund.branchId`, `Exchange.branchId` are independent of
  `Sale.branchId` (return at a different branch may be legitimate business policy, but it is
  undocumented).
- `StockTransfer` does not prevent `fromBranchId = toBranchId` (self-transfer).
- `GoodsReceipt.branchId`/`GoodsReceiptLine.branchId` are tied to each other and to the PO via
  composite keys, but not to `PurchaseOrder.branchId` — receiving at a different branch than
  ordered is possible at the DB level.

Risk: intra-tenant data inconsistency, not cross-tenant exposure. All are candidates for
service-layer rules; none blocks baseline migration if explicitly accepted. See findings.

---

## 8. Inventory integrity audit

| Requirement                     | Evidence                                                                                                                                                                                                                                                                                                                         | Status                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| One authoritative stock balance | `StockBalance @@unique([branchId, variantId])`; doc §1 of integrity doc states it is the only live balance                                                                                                                                                                                                                       | **Design PASS** (runtime unverified — no DB)                                                   |
| Complete movement history       | `StockMovement` append-only by policy; `quantityDelta` signed; `sourceKey` unique per business (`@@unique([businessId, sourceKey])`)                                                                                                                                                                                             | **Design PASS**; append-only enforcement deferred to privileges/triggers — honestly documented |
| Batch validity                  | `InventoryBatch` unique `(branchId, variantId, batchNumber)`; `StockMovement.batch`, `StocktakeLine.batch`, `SaleLine.batch`, `TransferReceiptLine.batch`, `StockLossRecord.batch`, `ExpiryRiskFact.batch` all use the 4-column composite `(businessId, branchId, variantId, batchId)` — batch must match branch **and** variant | **Design PASS**                                                                                |
| Batch↔receipt-line consistency  | `InventoryBatch.receiptLine` uses `(businessId, branchId, variantId, receiptLineId)` composite                                                                                                                                                                                                                                   | **Design PASS**                                                                                |
| Movement↔batch allocation       | `BatchMovementAllocation` composite to both `StockMovement` and `InventoryBatch` on the full tenant+branch+variant key                                                                                                                                                                                                           | **Design PASS**; sum-of-allocations = movement quantity is app-level                           |
| Goods receipt → stock           | Only `GoodsReceiptLine` links to `InventoryBatch`/`StockMovement` via `referenceType/referenceId`; `PurchaseOrder`, `SupplierConfirmation` have no stock relation                                                                                                                                                                | **Design PASS**                                                                                |
| GR line ↔ PO line               | `GoodsReceiptLine.purchaseOrderLine` uses 4-column composite incl. `variantId` — variant match enforced; over/under receipt quantities are app-level                                                                                                                                                                             | **Design PASS** (see F-005 for missing line uniqueness)                                        |
| Transfer validity               | `StockTransfer.fromBranch`/`toBranch` both composite to `Branch(businessId,id)` (same business); `TransferReceipt` forced to `toBranchId`; `TransferReceiptLine.transferLine` uses `(businessId, transferId, transferLineId, variantId)` composite                                                                               | **Design PASS**; `fromBranchId ≠ toBranchId` is app-level                                      |
| In-transit not sellable         | `StockBalance.quantityInTransit` separate column; `StockLocationType.IN_TRANSIT`; documented rule that in-transit never enters `quantityOnHand` until accepted                                                                                                                                                                   | **Design PASS** (app logic pending)                                                            |
| Negative stock                  | Planned CHECK constraints (`stock_balance_*`, reserved ≤ on-hand) in migration strategy §2.1; **not yet in any migration** — correctly disclosed everywhere                                                                                                                                                                      | **NOT YET ENFORCEABLE — by design; must ship with baseline migration**                         |
| Reserved ≤ on-hand              | Same planned CHECK                                                                                                                                                                                                                                                                                                               | Same status                                                                                    |
| Stocktake history               | `StocktakeSession`/`StocktakeLine` preserve counts, variances, counters; `InventoryAdjustment` has approve/apply workflow with `reconciliationExceptionId` link                                                                                                                                                                  | **Design PASS**; F-003 NULL-unique loophole on `StocktakeLine`                                 |
| Loss/damage evidence            | `StockLossRecord` with type, reason, requester/approver, optional `movementId` 1:1 link                                                                                                                                                                                                                                          | **Design PASS**                                                                                |
| FIFO vs WAC distinct            | `InventoryBatch` (FIFO physical) vs `InventoryValuationSnapshot.method` (WAC financial); documented as separate                                                                                                                                                                                                                  | **Design PASS**                                                                                |
| Atomicity                       | Documented transaction/locking requirements (SELECT FOR UPDATE, deterministic lock order, conditional UPDATE) — correctly labeled Step 4+ work                                                                                                                                                                                   | **NOT IMPLEMENTED — correctly disclosed**                                                      |

**Net:** the inventory model is the strongest area of the schema. The only schema-level gaps are
the `StocktakeLine` NULL-unique loophole (F-003) and the missing receipt-line uniqueness (F-005);
both are correctable in the baseline migration's companion SQL or a follow-up migration.

---

## 9. Sales and financial integrity audit

| Requirement                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                       | Status                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Sale history immutable      | `Sale`, `SaleLine`, `SalePayment` Restrict-deleted only; `SaleVoid` separate 1:1 record; status transitions not deletes                                                                                                                                                                                                                                                                        | **Design PASS**                                              |
| Price/cost snapshots        | `SaleLine.productNameSnapshot`, `skuSnapshot`, `unitPrice`, `unitCostSnapshot`, `batchId`                                                                                                                                                                                                                                                                                                      | **Design PASS**                                              |
| Return→original sale line   | `ReturnLine` composite `(businessId, saleId, returnId)` + `(businessId, saleId, saleLineId)` — return request, return line and original sale line provably share one sale                                                                                                                                                                                                                      | **Design PASS**                                              |
| Refund→correct sale/payment | `Refund` composite to `Sale` and `ReturnRequest` (both carry `saleId`); `RefundAllocation` composites carry `saleId` on both refund and payment sides — allocation cannot cross sales                                                                                                                                                                                                          | **Design PASS**                                              |
| Duplicate refunds           | `Refund @@unique([businessId, number])`, `@@unique([businessId, idempotencyKey])`                                                                                                                                                                                                                                                                                                              | **Design PASS** (idempotencyKey nullable → intentional)      |
| Refund ceiling              | Documented app rule; no DB constraint possible cross-row — honestly disclosed                                                                                                                                                                                                                                                                                                                  | **App-enforced**                                             |
| Return quantity ceiling     | `ReturnLine.quantityRequested/Approved/restockQuantity` + planned CHECKs; cumulative-vs-sold is app-level                                                                                                                                                                                                                                                                                      | **App-enforced**                                             |
| Supplier payment↔invoice    | `PaymentAllocation` both sides composite `[businessId, supplierId, …]` — cross-supplier and cross-tenant allocation impossible                                                                                                                                                                                                                                                                 | **Design PASS**                                              |
| PO↔invoice consistency      | `SupplierInvoice.purchaseOrder` composite `[businessId, supplierId, purchaseOrderId]` forces invoice supplier = PO supplier; **but** `SupplierInvoiceLine.purchaseOrderLine` references `(businessId, purchaseOrderId, id)` without supplier/variant binding — a line can reference a PO line of a different variant or even a different PO than the invoice header (same business). See F-017 | **Partial — finding**                                        |
| Historical supplier prices  | `SupplierPriceHistory`, `SupplierPricingAgreement`+lines, `PurchaseOrderRevision.snapshot`                                                                                                                                                                                                                                                                                                     | **Design PASS**                                              |
| Financial deletes           | All financial roots Restrict from `Business`; line Cascades only from headers that themselves Restrict                                                                                                                                                                                                                                                                                         | **Design PASS**                                              |
| Money types                 | All money `Decimal(18,2)` + explicit `currency` per record; no Float/Double; quantities `Decimal(18,3)`; unit costs `Decimal(18,4)`                                                                                                                                                                                                                                                            | **PASS (verified by census)**                                |
| Currency snapshots          | `currency` stored per monetary row incl. `Sale`, `SaleLine` inherits via sale (no per-line currency — acceptable since a sale is single-currency by construction; `SalePayment.currency` exists for split-tender edge cases)                                                                                                                                                                   | **Design PASS**                                              |
| Idempotency                 | `IdempotencyRecord @@unique([businessId, scope, key])`; `SyncOperation @@unique([businessId, deviceId, operationId])`; `Sale @@unique([businessId, offlineDeviceId, operationId])`; `StockMovement @@unique([businessId, sourceKey])`; `PaymentWebhookEvent @@unique([provider, providerEventId])`; `Refund @@unique([businessId, idempotencyKey])`                                            | **Design PASS**; see F-003/F-004 for nullable-tenant caveats |

---

## 10. Offline synchronization — D-025 audit

Approved rule (D-025, `ARCHITECTURE_DECISION_RECORDS.md` §D-025 and
`OFFLINE_SYNCHRONIZATION_ARCHITECTURE.md` §10.2): on stock shortfall the **entire** offline sale
is refused — no sale, no stock movement — the original payload is preserved in a
`ReconciliationException`, resolution requires Owner/Manager (never Business Admin for physical
outcomes), and exactly one audited revalidation may occur after authorized stock correction.

| D-025 element                       | Schema/doc evidence                                                                                                                                                                                    | Status                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| No partial acceptance               | `SyncOperationStatus` has no partial state; no partial-acceptance fields exist on `Sale`/`SaleLine`; `ReconciliationShortfallLine` stores per-variant shortfall for the **whole** operation            | **Schema consistent**                    |
| No sale on failure                  | `SyncOperation.saleId` nullable; `ReconciliationException` 1:1 with operation; `committedSaleId` only set on successful revalidation                                                                   | **Design PASS**                          |
| No movement on failure              | Movements are only written inside the commit transaction (documented §4 of integrity doc)                                                                                                              | **Design PASS (app-level)**              |
| Original payload preserved          | `ReconciliationException.originalPayload Json` + `payloadHash` + `recordedTotal` + `currency` + `occurredAt`/`receivedAt`; doc states immutability                                                     | **Design PASS**                          |
| Shortfall quantities preserved      | `ReconciliationShortfallLine(requestedQuantity, availableQuantity, shortfallQuantity, unitPrice)`                                                                                                      | **Design PASS**                          |
| Device/business ownership           | `ReconciliationException` composite FKs to `Device`, `Branch`, `SyncOperation`, both membership roles                                                                                                  | **Design PASS**                          |
| Idempotent operations               | `(businessId, deviceId, operationId)` unique on `SyncOperation`; `(businessId, saleId)` unique prevents double-linking; `SyncOperation → Sale` 0..1                                                    | **Design PASS**                          |
| Duplicate retries                   | `SyncAttempt @@unique([syncOperationId, attemptNumber])`; `DUPLICATE` status; doc test OFF-03                                                                                                          | **Design PASS**                          |
| Manager/Owner only; Admin view-only | `ReconciliationException.assignedToMembershipId/cashierMembershipId` composite to `Membership`; `Permission.isPhysical` flag; resolution authority is service-enforced (documented)                    | **App-enforced — correctly disclosed**   |
| One audited revalidation            | `revalidationCount Int` + **planned** `CHECK (revalidationCount BETWEEN 0 AND 1)` in migration SQL; `ReconciliationEventType` includes `REVALIDATION_PASSED/FAILED`; append-only `ReconciliationEvent` | **Design PASS; CHECK pending migration** |
| History never overwritten           | All reconciliation tables Restrict; events append-only                                                                                                                                                 | **Design PASS**                          |

**Contradiction search result:** `STEP_3_DATABASE_DESIGN_AND_SCHEMA_COMPLETION_REPORT.md`
§H.2 states _"The accepted portion is committed if the policy allows partial fulfilment;
otherwise the operation is rejected into reconciliation"_ and §K.1 lists _"Partial fulfilment
policy for offline shortfalls … must be confirmed"_ as an open question. This **contradicts the
approved D-025**, which permits no partial acceptance. The schema and
`OFFLINE_AND_RECONCILIATION_DATA_MODEL.md` are internally strict and correct; the defect is
confined to the completion report but it misrepresents an approved critical decision. See
**F-001 (High)**.

---

## 11. SaaS, membership and access-control audit

- **Business/owner consistency:** `Business.ownerMembership → Membership` via
  `(id, ownerMembershipId) → (businessId, id)` composite — the owner membership provably belongs
  to the business; `ownerMembershipId @unique` + planned partial index = one official owner.
  PASS (design).
- **Membership↔user:** `@@unique([businessId, userId])`; `User` global with unique email/phone.
  PASS.
- **Roles:** `Role.businessId` nullable supports global system templates; business roles
  tenant-scoped; `RolePermission` composite PK; `Permission.isPhysical` encodes the
  digital-vs-physical boundary required for Business Admin. Role↔membership tenant binding is
  the F-009 gap (documented exception).
- **Branch assignment:** `MembershipBranchAssignment` and `EmployeeBranchAssignment` use
  composite FKs on both sides (membership/employee **and** branch) — cross-tenant assignment
  impossible. F-010: `@@unique([membershipId, branchId])` is not revoked-aware — see findings.
- **Employees:** `Employee` separate from `User` (correct — employment ≠ login); status history
  table exists but lacks `businessId` (F-014).
- **Subscriptions:** `Subscription.businessId @unique` (one current sub per business),
  `SubscriptionHistory` composite to subscription, `SubscriptionInvoice`/`PaymentAttempt`
  composite to subscription+invoice, `TrialGrant.businessId @unique`, `UsageCounter` per
  business/feature/period, `PaymentReconciliationTask` for unverified payments. Chapa + manual
  providers modeled; webhook dedupe by `(provider, providerEventId)`. PASS (design).
- **Platform administration:** `PlatformSetting`, `SupportCase`, `SupportAccessGrant` — support
  grants are time-bound (`startsAt/expiresAt/revokedAt`), business-scoped, and Super Admin has
  no membership path (documented). `AuditEvent.actorType` includes `SUPER_ADMIN_SUPPORT`.
  PASS (design).
- **Deactivation/history:** `archivedAt`/`deactivatedAt`/status enums throughout; no destructive
  deletes on business data. PASS.

---

## 12. Four-business-type coverage

| Type                | Representation                                                                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grocery & Food      | `Unit`/`UnitConversion` (weight/volume/count), `InventoryBatch.expiryDate`, `isPerishable`/`shelfLifeDays` on `Product`, `MinStockSetting`, `StockLossRecord` (damage/expiry)                                                 |
| Fashion & Clothing  | `ProductVariant.size`, `color`, `AttributeDefinition`/`ProductAttributeValue` for arbitrary axes, variant-level SKU/price/stock                                                                                               |
| Pharmacy & Medicine | `InventoryBatch` batch number/expiry/`QUARANTINED` status, `StockLocationType.QUARANTINE`, `LossType`, `isPerishable`; "mandatory where config enables" is a `CapabilityFlag`/configuration concern — representation adequate |
| Cosmetics & Beauty  | `ProductVariant.shade`, `color`, `size`, `AttributeDefinition` options, batch/expiry where applicable                                                                                                                         |

One shared product/variant model with configurable attributes — matches the approved "no
separate applications" constraint. **Design PASS**; no industry workflow is claimed as
implemented (correctly).

---

## 13. Database constraints and referential integrity

- **Primary keys:** every model has `id @default(uuid(7)) @db.Uuid` except `RolePermission`
  (`@@id([roleId, permissionId])`) — verified.
- **Deletion policy:** 302 Restrict / 57 Cascade / 8 SetNull (measured). Cascade is confined to
  owned child lines, assignments, sessions/tokens/preferences and notification delivery —
  consistent with the documented policy. `SetNull` appears only on optional non-composite links
  (`Employee.user`, `PaymentWebhookEvent.business/attempt`, `ProductImportJob.file`,
  `FileUploadSession.file`, `TrialGrant` n/a, `SupplierStatement.file` is Restrict — verified
  list: Employee.user, PaymentWebhookEvent×2, FileUploadSession.file, ProductMedia? no—Restrict;
  actual SetNull sites are few and all optional). No `SetNull` on a required-`businessId`
  composite — consistent with guide §9.
- **CHECK/partial constraints:** none exist yet — they are specified in
  `DATABASE_MIGRATION_AND_SEED_STRATEGY.md` §2.1 (stock non-negativity, reserved ≤ on-hand,
  batch/receipt/sale/PO/refund quantity checks, `revalidationCount BETWEEN 0 AND 1`, one-owner and
  one-open-shift partial uniques, system-role/global-unit code uniques for the NULL-tenant
  tables). Correctly disclosed as pending.
- **NULL-uniqueness loopholes (F-003):** verified cases where a nullable column inside
  `@@unique` permits duplicates in PostgreSQL (NULLs are distinct):
  - `StocktakeLine @@unique([sessionId, variantId, batchId])` — `batchId` nullable; two count
    lines for the same variant with `batchId = NULL` in one session are **both allowed**.
  - `ProductAttributeValue @@unique([productId, attributeDefinitionId])` /
    `[variantId, attributeDefinitionId]` — rows with both `productId` and `variantId` NULL escape
    both uniques; also no CHECK enforcing exactly-one-of product/variant.
  - `IdempotencyRecord @@unique([businessId, scope, key])` — `businessId` nullable; platform-
    scope (NULL) keys can duplicate.
  - `PaymentAttempt @@unique([provider, providerReference])` — `providerReference` nullable;
    duplicate NULLs allowed (probably benign: reference assigned post-payment).
  - `Notification @@unique([businessId, dedupeKey])`, `Refund @@unique([businessId,
idempotencyKey])`, `Sale @@unique([businessId, offlineDeviceId, operationId])`,
    `SyncOperation @@unique([businessId, saleId])`, `ReconciliationException @@unique([businessId,
committedSaleId])`, `StockLossRecord @@unique([businessId, movementId])`, `Customer
@@unique([businessId, code])` — nullable members; duplicates-with-NULL are either intended
    (optional keys) or low-risk; reviewed and classified.
  - `Role @@unique([businessId, code])`, `Unit @@unique([businessId, code])` — NULL-tenant
    duplicates **already covered** by planned partial unique indexes in migration SQL (good
    catch by the authors).
- **Missing uniqueness (F-005):** `GoodsReceiptLine` has no `@@unique([receiptId,
purchaseOrderLineId])` — two lines in one receipt can reference the same PO line;
  `SupplierInvoiceLine` similarly lacks `(supplierInvoiceId, purchaseOrderLineId)` uniqueness;
  `SupplierInvoiceLine.purchaseOrderLine` composite omits `variantId`/`supplierId` binding
  (F-017; see §9). `PurchaseRequestLine`, `RfqLine`, `QuotationLine`, `ExchangeLine` also lack
  per-header variant uniqueness (lower risk — lines may legitimately repeat variants? design
  question).
- **JSON usage:** 27 columns, all in the four justified groups documented in the schema guide
  (external payloads, flexible config, audit evidence, quotation/forecast snapshots). No
  constrained value stored in JSON. PASS.
- **Indexes:** 186 `@@index` + unique-backing indexes; tenant-first ordering
  (`businessId` prefix) is consistent; write-heavy tables (`Sale`, `StockMovement`) have narrow
  purposeful indexes. The indexing document's per-table descriptions contain several stale
  details (F-016). No performance claims are made — correct.

---

## 14. Documentation accuracy audit

| Document                                      | Verdict                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md` | Complete; 159-model inventory matches schema; traceability table uses 4.1–4.12 labels whose authoritative source is absent (F-016); `EmploymentStatusHistory` labeled "Platform" scope (F-012)                                                                                                                                                                                                   |
| `CONCEPTUAL_DATA_MODEL.md`                    | Sound; Mermaid diagrams consistent with schema at relationship level                                                                                                                                                                                                                                                                                                                             |
| `LOGICAL_DATABASE_DESIGN.md`                  | Mostly accurate; §2.4 idempotency keys stale (`IdempotencyRecord @@unique([scope,key])` → actual `[businessId,scope,key]`; `SyncOperation @@unique([deviceId,operationId])` → actual `[businessId,deviceId,operationId]`; `Sale @@unique([offlineDeviceId,operationId])` → actual `[businessId,offlineDeviceId,operationId]`) — F-002 family                                                     |
| `ENTITY_RELATIONSHIP_DIAGRAM.md`              | Relationship structure accurate; **field-block errors**: `PriceList.code` (actual `name`), `SupplierConfirmation.status` (no such field), `GoodsReceiptLine.quantityDamaged` (actual `damagedQuantity`), `InventoryValuationSnapshot.quantityOnHand/inventoryValue` (actual `quantity`/`totalValue`) — F-006                                                                                     |
| `MULTI_TENANT_DATABASE_DESIGN.md`             | Strong; §2's "five tables" null-tenant claim is incomplete (F-004); §3.1 exception table accurate for what it lists                                                                                                                                                                                                                                                                              |
| `INVENTORY_AND_FINANCIAL_DATA_INTEGRITY.md`   | Accurate; honestly separates DB constraints from transaction logic; test specs labeled as specs                                                                                                                                                                                                                                                                                                  |
| `OFFLINE_AND_RECONCILIATION_DATA_MODEL.md`    | Accurate and strict on D-025; minor: Mermaid shows `correctiveAdjustmentId` (schema has `correctiveStocktakeId` + adjustment link via `InventoryAdjustment.reconciliationExceptionId`); idempotency table omits `businessId` from unique keys (same staleness as F-002); lifecycle diagram shows `CONFLICTED → REJECTED` for non-fulfilment while exception status is `NOT_FULFILLED` — cosmetic |
| `DATABASE_INDEXING_AND_PERFORMANCE.md`        | Index groups reasonable; several constraint descriptions stale (`BranchPriceOverride @@unique([branchId,variantId])` → actual includes `effectiveFrom`; `SalePayment` described indexes don't match actual `(businessId,saleId)`/`(businessId,reference)`; `PlanPrice(planId,billingCycle)` → actual includes `currency`; `SyncOperation` unique omits `businessId`); counts stale — F-002/F-016 |
| `PRISMA_SCHEMA_GUIDE.md`                      | Conventions accurate; §2 inventory counts stale (88 enums etc.); §7 idempotency table stale as above; §4 decimal counts stale (59/59/15 → 60/60/16) — F-002                                                                                                                                                                                                                                      |
| `DATABASE_MIGRATION_AND_SEED_STRATEGY.md`     | Excellent; companion SQL complete and honest about what Prisma can't express; correctly states nothing is applied                                                                                                                                                                                                                                                                                |
| `DATABASE_MODULE_OWNERSHIP.md`                | 21 modules, 4 owners, table counts sum correctly (33+23+49+54=159); hotspot review table sensible; **no member review evidence exists** (F-008)                                                                                                                                                                                                                                                  |
| `DATABASE_VALIDATION_AND_TESTING.md`          | Honest L1–L7 layering; executed-checks table contains the stale counts (F-002); L3–L7 correctly marked not executed                                                                                                                                                                                                                                                                              |

Cross-document consistency: good overall; the recurring defect class is **stale counts and
stale unique-key descriptions** after late schema edits (F-002, F-016).

---

## 15. Requirements traceability matrix

**Critical disclosure:** the approved numbered requirements document covering areas "4.1–4.12"
is **not present in the repository**. `docs/requirements/master-requirements.md` states the
approved master-requirements/role-boundary/business-type/decision documents "were not present in
the repository when the foundation was built" and lists only the binding constraints supplied
with the project brief. The 4.1–4.12 labels appear only inside the Step 3 entity catalog's own
traceability table; they cannot be checked against an authoritative source. Per audit rules,
those rows are **NOT VERIFIED — SOURCE DOCUMENT MISSING**, not failed.

What _can_ be verified against available sources (Step 2 docs, ADRs, module map, catalog):

| Ref  | Requirement (as evidenced by available docs)                                                                                 | Related models                                                                                                                     | Status                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| R-01 | Multi-business tenancy, shared schema                                                                                        | `Business`, `Branch`, `Membership`, composite keys throughout                                                                      | VERIFIED — PASS (design)                                            |
| R-02 | Multiple branches per business                                                                                               | `Branch @@unique([businessId, code])`, branch-scoped composites                                                                    | VERIFIED — PASS                                                     |
| R-03 | Memberships, roles, invitations, branch assignment                                                                           | `Membership`, `Role`, `RolePermission`, `Invitation`, `MembershipBranchAssignment`, `EmployeeBranchAssignment`                     | VERIFIED — FINDING (F-009, F-010)                                   |
| R-04 | Subscriptions, trials, plans, verified payments                                                                              | `Plan*`, `Subscription*`, `PaymentAttempt`, `PaymentWebhookEvent`, `TrialGrant`, `UsageCounter`, `PaymentReconciliationTask`       | VERIFIED — PASS (design)                                            |
| R-05 | Business-type configuration, settings, attributes, units                                                                     | `BusinessConfiguration`, `BusinessSetting`, `BranchSetting`, `AttributeDefinition`, `Unit`, `UnitConversion`, `CapabilityFlag`     | VERIFIED — PASS                                                     |
| R-06 | Product catalog, variants, barcodes, media, imports                                                                          | `Product`, `ProductVariant`, `Barcode`, `ProductMedia`, `ProductImportJob`, `Brand`, `Category`                                    | VERIFIED — PASS                                                     |
| R-07 | Pricing, overrides, discounts, price history                                                                                 | `PriceList`, `ProductPrice`, `BranchPriceOverride`, `PriceChangeHistory`, `Discount`                                               | VERIFIED — PASS                                                     |
| R-08 | Files and documents                                                                                                          | `FileObject`, `FileLink`, `FileUploadSession` + composite file refs in consumers                                                   | VERIFIED — FINDING (F-004)                                          |
| R-09 | Inventory: balances, movements, batches, stocktakes, adjustments, transfers, reservations, valuation, loss                   | All inventory models (§8)                                                                                                          | VERIFIED — FINDING (F-003, F-005, F-007)                            |
| R-10 | Suppliers and procurement: agreements, RFQ, quotations, PO, revisions, approvals, receiving, invoices, payments, allocations | All suppliers/procurement models                                                                                                   | VERIFIED — FINDING (F-005)                                          |
| R-11 | POS, sales, payments, shifts, receipts, receipt blocks                                                                       | `PosTerminal`, `CashierShift`, `ShiftCashMovement`, `Sale*`, `Receipt*`, `SaleVoid`                                                | VERIFIED — FINDING (F-007)                                          |
| R-12 | Customers, consents, merges, summaries                                                                                       | `Customer*`                                                                                                                        | VERIFIED — PASS                                                     |
| R-13 | Returns, inspections, refunds, exchanges, follow-ups                                                                         | `Return*`, `Refund*`, `Exchange*`, `CollectionFollowUp`                                                                            | VERIFIED — PASS (design)                                            |
| R-14 | Offline sync, devices, sessions, operations, cursors, feeds                                                                  | `Device`, `Sync*`, `FeedEvent`, `SyncCursor`                                                                                       | VERIFIED — FINDING (F-014, F-003-adjacent)                          |
| R-15 | D-025 strict stock protection + reconciliation                                                                               | `ReconciliationException`, `ReconciliationShortfallLine`, `ReconciliationEvent`, `ConflictRecord`                                  | VERIFIED — FINDING (F-001 report contradiction; schema itself PASS) |
| R-16 | Analytics facts and reporting                                                                                                | `*DailyFact`, `StockoutEvent`, `ExpiryRiskFact`, `SupplierPerformanceFact`, `ReportDefinition`, `ExportJob`                        | VERIFIED — PASS (design)                                            |
| R-17 | AI/forecasting advisory only                                                                                                 | `ForecastModel`, `ForecastRun`, `ForecastPoint`, `Recommendation`, `FeatureSnapshot`, `ModelMetric` — no write path to stock/money | VERIFIED — PASS                                                     |
| R-18 | Notifications and delivery                                                                                                   | `Notification*`                                                                                                                    | VERIFIED — PASS                                                     |
| R-19 | Audit trail                                                                                                                  | `AuditEvent` (append-only by policy, Restrict)                                                                                     | VERIFIED — PASS                                                     |
| R-20 | Platform administration / support access                                                                                     | `PlatformSetting`, `SupportCase`, `SupportAccessGrant`                                                                             | VERIFIED — PASS (design)                                            |
| R-21 | Outbox/idempotency infrastructure                                                                                            | `OutboxEvent`, `IdempotencyRecord`                                                                                                 | VERIFIED — FINDING (F-004 nullable tenant)                          |
| R-22 | Four business types on one schema                                                                                            | §12                                                                                                                                | VERIFIED — PASS (representation)                                    |
| R-23 | Requirements 4.1–4.12 authoritative text                                                                                     | —                                                                                                                                  | **NOT VERIFIED — SOURCE DOCUMENT MISSING**                          |

**Counts (recounted from the displayed matrix):** 23 rows assessed (R-01…R-23) →
**22 VERIFIED** = 14 `VERIFIED — PASS` + 8 `VERIFIED — FINDING`; **1 NOT VERIFIED — SOURCE
DOCUMENT MISSING** (R-23, authoritative 4.1–4.12 text absent). No requirement was marked FAILED;
no row was excluded — every displayed row is counted exactly once.

---

## 16. Git and four-member contribution evidence

- `git log --all --oneline` → **1 commit** (`a356aad`, single author identity).
- `git status` → all Step 2/Step 3 deliverables are uncommitted working-tree changes.
- No member review reports, sign-off records or per-member branches exist in the repository.
- `DATABASE_MODULE_OWNERSHIP.md` correctly assigns each of the 21 modules exactly once
  (M1: identity/tenancy/authorization/employees/subscriptions/super-admin/audit/platform-
  infrastructure = 33 tables; M2: business-configuration/catalog/pricing/files = 23; M3:
  inventory/suppliers/procurement = 49; M4: customers/synchronization/sales/after-sales/
  analytics/intelligence/notifications = 54; total 159 — verified against the schema).

**Statement (required):** _Four-member contribution and independent review are NOT VERIFIED by
the available Git evidence._ This does not prove the other members did not contribute; it proves
only that the repository contains no attributable evidence of it. Recommend: genuine per-member
commits, recorded review approvals per module, and commit/PR evidence before the ownership claim
is treated as demonstrated rather than assigned.

---

## 17. Complete findings register

Severity scale: Critical / High / Medium / Low / Informational.

| ID    | Title                                                                                                                                                             | Severity | Class                                        | Affected                                                                                                                                                                                     | Blocks migration?                                                                                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| F-001 | Completion report contradicts approved D-025 (partial fulfilment left open)                                                                                       | **High** | Documentation defect                         | `STEP_3_DATABASE_DESIGN_AND_SCHEMA_COMPLETION_REPORT.md` §H.2, §K.1                                                                                                                          | No — must be corrected before approval is clean; does not affect schema                                |
| F-002 | Stale verification statistics in two documents                                                                                                                    | Medium   | Documentation defect                         | `DATABASE_VALIDATION_AND_TESTING.md` §2; `PRISMA_SCHEMA_GUIDE.md` §2 (counts table, §4 decimals, §7 idempotency keys); also `LOGICAL_DATABASE_DESIGN.md` §2.4                                | No                                                                                                     |
| F-003 | Nullable columns inside `@@unique` permit duplicate rows (PostgreSQL NULLs distinct)                                                                              | Medium   | Schema design concern                        | `StocktakeLine`, `ProductAttributeValue`, `IdempotencyRecord`, `PaymentAttempt`, `Notification`, `Sale`, `SyncOperation`, `ReconciliationException`, `StockLossRecord`, `Customer` (see §13) | No — fix via companion SQL (partial uniques / `NULLS NOT DISTINCT`) in baseline or follow-up migration |
| F-004 | Five nullable-`businessId` models undocumented as tenant exceptions                                                                                               | Medium   | Documentation defect + minor design gap      | `FileUploadSession`, `OutboxEvent`, `IdempotencyRecord`, `AuditEvent`, `SupportCase` vs `MULTI_TENANT_DATABASE_DESIGN.md` §2 "five tables" claim                                             | No                                                                                                     |
| F-005 | Missing line-level uniqueness on `GoodsReceiptLine`/`SupplierInvoiceLine` (and weaker cases on request/RFQ/quotation/exchange lines)                              | Medium   | Schema design concern                        | `GoodsReceiptLine`, `SupplierInvoiceLine`, `PurchaseRequestLine`/`RfqLine`/`QuotationLine`/`ExchangeLine` (weaker)                                                                           | No                                                                                                     |
| F-006 | ERD field-block errors                                                                                                                                            | Low      | Documentation defect                         | `ENTITY_RELATIONSHIP_DIAGRAM.md` §2 (`PriceList.code`→`name`), §4 (`SupplierConfirmation.status`, `quantityDamaged`→`damagedQuantity`, valuation `quantity`/`totalValue`)                    | No                                                                                                     |
| F-007 | Intra-tenant branch consistency not DB-enforced (sale↔shift↔terminal↔branch; return/refund/exchange branch vs sale branch; self-transfer; GR branch vs PO branch) | Low      | Design concern                               | `Sale`, `CashierShift`, `PosTerminal`, `ReturnRequest`, `Refund`, `Exchange`, `StockTransfer`, `GoodsReceipt`                                                                                | No — accept as service-enforced or document intent                                                     |
| F-008 | No verifiable four-member contribution/review evidence                                                                                                            | Medium   | Evidence gap / governance                    | Git history, absence of review reports                                                                                                                                                       | No for migration; yes for governance claims                                                            |
| F-009 | `Membership` dual role relations; `roleBusinessId` not bound to `membership.businessId`; plain `role` FK can reference another tenant's role                      | Low      | Schema design concern (documented exception) | `Membership`, `Invitation`, `Role`                                                                                                                                                           | No — documented TEN-16; recommend clarifying authoritative relation                                    |
| F-010 | `MembershipBranchAssignment @@unique([membershipId, branchId])` blocks re-assignment after `revokedAt`                                                            | Medium   | Schema design concern                        | `MembershipBranchAssignment`                                                                                                                                                                 | No — confirm intended semantics or add partial unique                                                  |
| F-011 | 44 plain `*UserId` actor scalars without FK to `User`                                                                                                             | Low      | Design concern                               | e.g., `AuditEvent.actorUserId`, `StocktakeSession.*ByUserId`, `PurchaseOrder.*ByUserId`, `Refund.approvedByUserId`, etc. (full list in audit working notes)                                  | No — audit-actor references; consider documenting convention or FK where appropriate                   |
| F-012 | Tenant-derived child tables without `businessId` (`EmploymentStatusHistory`, `SyncAttempt`, `SyncCursor`, `ForecastPoint`) labeled "Platform" scope               | Low      | Design concern / doc classification          | Those 4 models                                                                                                                                                                               | No — tenant filtering requires parent join; document query rule                                        |
| F-013 | `BusinessConfiguration.businessType` duplicates `Business.type`                                                                                                   | Low      | Design concern                               | `BusinessConfiguration`, `Business`                                                                                                                                                          | No — drift risk; pick one source of truth                                                              |
| F-014 | Indexing doc constraint descriptions stale                                                                                                                        | Low      | Documentation defect                         | `DATABASE_INDEXING_AND_PERFORMANCE.md` §2.2/2.3/2.5/2.6/2.7                                                                                                                                  | No                                                                                                     |
| F-015 | Offline doc Mermaid `correctiveAdjustmentId` vs actual `correctiveStocktakeId` linkage; idempotency keys omit `businessId`                                        | Low      | Documentation defect                         | `OFFLINE_AND_RECONCILIATION_DATA_MODEL.md` §2, §6                                                                                                                                            | No                                                                                                     |
| F-016 | Approved requirements source (4.1–4.12) absent; traceability partially unverifiable                                                                               | Medium   | Verification gap                             | `docs/requirements/master-requirements.md` disclosure; entity catalog labels                                                                                                                 | No — limitation, not defect                                                                            |
| F-017 | `SupplierInvoiceLine` can reference a PO line inconsistent with invoice header (different variant/PO within same business)                                        | Medium   | Schema design concern                        | `SupplierInvoiceLine.purchaseOrderLine` (no variantId in composite; `purchaseOrderId` on line independent of `SupplierInvoice.purchaseOrderId`)                                              | No — tighten composite or app rule                                                                     |

**Totals:** Critical 0 · High 1 (F-001) · Medium 8 (F-002, F-003, F-004, F-005, F-008, F-010,
F-016, F-017) · Low 8 (F-006, F-007, F-009, F-011, F-012, F-013, F-014, F-015). Informational
observations are folded into §7–§13 rather than listed as separate findings.

### 17.1 Integrity disposition for F-003, F-005, F-017

For each integrity finding, enforcement is classified as **DB-enforced** (PostgreSQL constraint
already in the Prisma schema), **planned SQL** (specified in
`DATABASE_MIGRATION_AND_SEED_STRATEGY.md` but not yet applied), **app-enforced** (service-layer
rule, Step 4+), or **unverified** (no runtime evidence exists).

| Finding                             | Rule that must hold                                                                                                                                                                                                                                          | DB-enforced today                                 | Planned migration SQL                                                                                            | App-enforced (required)                                                                                             | Unverified runtime                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| F-003 (nullable `@@unique` members) | One `StocktakeLine` per `(sessionId, variantId)` when `batchId IS NULL`; one `ProductAttributeValue` per definition per product/variant with exactly one of product/variant set; one `IdempotencyRecord` per `(businessId, scope, key)` incl. platform scope | **No** — NULLs distinct permits duplicates        | Partial uniques / `NULLS NOT DISTINCT` candidates (see C-3)                                                      | Application must also treat NULL-keyed rows correctly in upsert logic                                               | **Yes** — no database exists; duplicate acceptance untested |
| F-005 (missing line uniques)        | One `GoodsReceiptLine` per `(receiptId, purchaseOrderLineId)`; one `SupplierInvoiceLine` per `(supplierInvoiceId, purchaseOrderLineId)` unless split lines are an approved business rule                                                                     | **No**                                            | Not currently in companion SQL — must be added if DB treatment chosen                                            | Three-way-match quantity accumulation must be computed inside the receipt/invoice commit transaction with row locks | **Yes**                                                     |
| F-017 (invoice-line PO binding)     | `SupplierInvoiceLine.purchaseOrderLine` must reference a PO line of the same variant (and same supplier/PO as the invoice header)                                                                                                                            | **No** — composite lacks `variantId`/`supplierId` | Could be enforced by widening the composite FK to include `variantId` (and supplier via PO) in a schema revision | Invoice commit must validate header↔line PO consistency transactionally                                             | **Yes**                                                     |

**Important:** "app-enforced" is **not** automatically safe. For F-005/F-017 the service must
(a) perform validation and quantity accumulation inside a single transaction, (b) take
appropriate row locks (`SELECT … FOR UPDATE` on the PO line / balance rows) to prevent
concurrent double-receipt or double-invoice, and (c) be covered by the CON/TEN test matrix plus
dedicated duplicate-line and concurrent-receipt tests before the baseline is declared
validated. Until then these rules are **unverified**, not proven.

---

## 18. Migration blockers, conditions and recommendations

### Migration blockers

**None.** No Critical finding; no defect that would produce cross-tenant exposure, financial
corruption or inventory corruption at the schema level. The companion CHECK/partial-index SQL is
specified but unapplied — that is the expected Step 3 end-state, not a blocker.

### Conditions for approval (must be accepted by the project owner)

1. **C-1 (F-001):** Correct `STEP_3_DATABASE_DESIGN_AND_SCHEMA_COMPLETION_REPORT.md` §H.2/§K.1 to
   state strict D-025 rejection with no partial fulfilment, matching the approved decision.
   _Owner: Step 3 author / project owner._
2. **C-2 (F-002, F-014, F-015, F-006):** Refresh stale counts and constraint descriptions in
   `DATABASE_VALIDATION_AND_TESTING.md`, `PRISMA_SCHEMA_GUIDE.md`, `LOGICAL_DATABASE_DESIGN.md`,
   `DATABASE_INDEXING_AND_PERFORMANCE.md`, `OFFLINE_AND_RECONCILIATION_DATA_MODEL.md` and the
   ERD field blocks. _Owner: documentation owner._
3. **C-3 (F-003, F-005, F-017):** Decide and record treatment for the NULL-uniqueness loopholes
   and missing line uniques — recommended: extend the baseline companion SQL with partial unique
   indexes (or `NULLS NOT DISTINCT` where appropriate) covering `StocktakeLine(sessionId,
variantId) WHERE batchId IS NULL`, `ProductAttributeValue`, `IdempotencyRecord`, and
   `(receiptId, purchaseOrderLineId)` / `(supplierInvoiceId, purchaseOrderLineId)` uniqueness —
   or explicitly accept app-level enforcement. _Owner: M1/M3 schema owners + project owner._
4. **C-4 (F-004, F-012):** Document the remaining nullable-`businessId` and no-`businessId`
   tenant-derived tables in the tenancy doc's exception list, with the query rule (join through
   parent). _Owner: M1._
5. **C-5 (F-007, F-009, F-010, F-011, F-013):** Record explicit acceptance (or intended fix) for
   intra-tenant branch consistency, membership role binding, branch-assignment re-assignment
   semantics, actor-UUID convention and `businessType` duplication. _Owner: project owner +
   affected module owners._
6. **C-6a (F-008) — team-contribution evidence:** Before **claiming** four-member delivery or
   independent review, produce attributable member commits and recorded per-module review
   approvals. This is **not** a prerequisite for migration preparation; it gates the governance
   claim only. _Owner: project owner / team lead._
7. **C-6b (F-016) — requirements source:** Before **final requirements-compliance approval**
   (and before closing Step 3 sign-off against requirements 4.1–4.12), obtain or commit the
   approved master-requirements / role-boundary / business-type / decision documents and
   complete the traceability matrix. This is **not** a prerequisite for preparing or applying
   the baseline migration to a development database, because the schema was built against the
   available Step 2 authorities; it is required before compliance can be declared. _Owner:
   project owner._

### Recommendations (non-blocking)

- When the baseline migration is generated, run the MIG/CON/TEN test matrix in
  `DATABASE_VALIDATION_AND_TESTING.md` against ephemeral PostgreSQL 17 before merge.
- Add the missing CI drift check (`migrate diff --exit-code`) with the first migration PR.
- Consider `NULLS NOT DISTINCT` (PostgreSQL 15+) evaluation for the flagged uniques during the
  baseline migration design.
- Re-run this audit's counting script after any schema amendment and refresh the documented
  statistics in the same PR (the project already mandates this; it was not followed for the
  last schema edits).

---

## 19. Audit limitations

- No live PostgreSQL: all constraint, index and cascade behavior is verified **statically**
  only. Nothing in this report claims runtime enforcement.
- The approved requirements source for areas "4.1–4.12" is absent; traceability to it is
  NOT VERIFIED by construction.
- Mermaid diagrams were assessed for structural fidelity to the schema, not rendered pixel-by-
  pixel; syntax follows valid `erDiagram`/`stateDiagram-v2`/`flowchart` usage.
- Git evidence covers only the local repository; work performed on other machines without
  commits cannot be assessed.
- The "19 residual id-only relations" figure in the tenancy doc is approximately consistent
  with the measured 41 non-`businessId` relations after excluding safe global parents; exact
  parity was not achievable without the authors' counting rule — treated as Low/documentation.

---

## 20. Final approval verdict

# APPROVED WITH DOCUMENTED CONDITIONS

No Critical defect and no migration-blocking defect was found. The schema is structurally sound,
technically validated, and faithful to the approved architecture including strict D-025. The
conditions in §18 must be satisfied or explicitly accepted by the project owner. This audit's
approval is **conditional and does not itself grant project-owner approval**; the following
stages are distinguished:

- **Stage A — prepare baseline migration:** permitted once C-1, C-2, C-3, C-4 and C-5 are
  dispositioned (documentation corrected, integrity treatments decided, design gaps accepted).
  C-6a/C-6b do not gate this stage.
- **Stage B — apply to a development PostgreSQL 17 database:** permitted after Stage A on an
  ephemeral/dev database only; never against shared/production data.
- **Stage C — MIG/CON/TEN integrity validation:** must pass on that dev database, including the
  F-003/F-005/F-017 disposition tests, before any further claim of correctness.
- **Stage D — declare baseline validated / proceed to next stage:** requires Stage C success,
  C-6a evidence if team contribution is to be claimed, and C-6b plus completed 4.1–4.12
  traceability before requirements-compliance sign-off.

This audit authorizes **Stages A–C conditionally**; **Stage D remains subject to project-owner
approval**.

---

## 21. Explicit stop statement

This audit is complete. No defects were fixed, no migrations were generated or applied, no
seeds were run, no Step 4 work was started, and no existing file was modified. The two audit
reports are the only artifacts created. Step 3 now awaits explicit project-owner review and
approval.

---

## 22. Final consistency-review section

A read-only consistency review of this report against
`STEP_3_FINAL_APPROVAL_CHECKLIST.md` was performed after initial delivery. Corrections applied
(only to the two audit reports; no project file was touched):

1. **Traceability arithmetic** — the matrix displays R-01…R-23 (23 rows); the earlier summary
   said "22 rows / 16 verified". Corrected to **23 rows → 22 VERIFIED (14 PASS + 8 FINDING) +
   1 NOT VERIFIED (R-23)**. No rows were added, removed or reclassified.
2. **Finding-ID consistency** — fixed three mis-references: entity-catalog row now cites F-016
   (not F-017) for the missing requirements source and F-012 (not F-014) for the Platform-scope
   label; §9 now cites F-017 for the invoice-line PO-binding issue; F-005's register title was
   narrowed to missing uniqueness only so it no longer overlaps F-017. All other F-IDs verified
   consistent across §9, §13, §14, §15, §17, §18 and the checklist.
3. **Integrity disposition** — added §17.1 distinguishing DB-enforced / planned-SQL /
   app-enforced / unverified for F-003, F-005, F-017, with explicit transaction, locking and
   test requirements for app-level enforcement.
4. **Governance vs traceability** — split C-6 into **C-6a** (member contribution/review evidence;
   gates the team claim, not migration) and **C-6b** (authoritative requirements source; gates
   requirements-compliance sign-off, not migration preparation).
5. **Migration stages** — §20 now defines Stages A (prepare), B (apply to dev PG17), C
   (MIG/CON/TEN validation), D (declare validated / proceed), with prerequisites and an explicit
   statement that this audit does not itself grant project-owner approval.
6. **Cross-report check** — verdict, finding counts (0C/1H/8M/8L), finding IDs, condition IDs
   (C-1…C-5, C-6a, C-6b), traceability totals and unverified items were made identical in both
   reports; no live-PostgreSQL claim and no four-member-contribution claim exists in either.
