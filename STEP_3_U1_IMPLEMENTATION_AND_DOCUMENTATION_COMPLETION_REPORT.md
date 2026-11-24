# Step 3 — U-1 implementation and documentation completion report

**Scope:** approved U-1 decision — Option A, same-branch-only goods receiving — plus related
documentation and static validation. No migration was generated or applied; no database was
contacted.

## A. Approved decision and exact business rule

**Option A — same branch only.** For every PO-backed `GoodsReceipt`:

```
GoodsReceipt.branchId = PurchaseOrder.branchId
```

where `PurchaseOrder.branchId` is the PO's _current authorized destination_. Applies to full,
partial and multiple receipts, all receiving employees, and every PO-backed workflow in the
schema. Branch access never overrides the PO destination. If the receiving branch must change,
the PO destination is formally revised — with preserved history, actor, timestamp, reason and
the existing Owner/Manager approval boundaries — **before the first `GoodsReceipt` is created**.
A destination change must never rewrite or invalidate existing receipts.

## B. Original U-1 gap

`GoodsReceipt.purchaseOrder` referenced `PurchaseOrder(businessId, id)` only, so a receipt could
name any branch inside the same business regardless of the PO's destination branch. No approved
receiving/transfer policy existed, so the invariant was undocumented and unenforced.

## C. Files inspected

- `apps/api/prisma/schema.prisma` — `PurchaseOrder`, `GoodsReceipt`, `GoodsReceiptLine`,
  `PurchaseOrderRevision`, `PurchaseOrderApproval`, `SupplierConfirmation`, `Branch`,
  `StockTransfer`, `ReturnRequest`, `Refund`, `Exchange`.
- `docs/database/DATABASE_MIGRATION_AND_SEED_STRATEGY.md`,
  `DATABASE_VALIDATION_AND_TESTING.md`, `DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md`,
  `LOGICAL_DATABASE_DESIGN.md`, `ENTITY_RELATIONSHIP_DIAGRAM.md`,
  `MULTI_TENANT_DATABASE_DESIGN.md`, `PRISMA_SCHEMA_GUIDE.md`,
  `STEP_3_C3_C4_C5_COMPLETION_REPORT.md`.

## D. Files modified

| Path                                                                           | Change                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/prisma/schema.prisma`                                                | Added `PurchaseOrder @@unique([businessId, id, branchId])`; widened `GoodsReceipt.purchaseOrder` to `fields: [businessId, purchaseOrderId, branchId]` → `references: [businessId, id, branchId]` with `onDelete: Restrict, onUpdate: NoAction` |
| `docs/database/LOGICAL_DATABASE_DESIGN.md`                                     | F-007 register row → RESOLVED with U-1 rule; procurement section U-1 note; unresolved-decisions footer updated                                                                                                                                 |
| `docs/database/DATABASE_MIGRATION_AND_SEED_STRATEGY.md`                        | §2.1 note: U-1 is Prisma-enforced, no companion SQL; documents the deliberate `onUpdate: NoAction` block on post-receipt destination changes                                                                                                   |
| `docs/database/DATABASE_VALIDATION_AND_TESTING.md`                             | CON-40/41/42 (DB-level) + §3.5 U1-APP-01…12 (service contract)                                                                                                                                                                                 |
| `docs/database/DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md`                    | `PurchaseOrder`/`GoodsReceipt` uniqueness cells updated                                                                                                                                                                                        |
| `docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md`                                 | `GoodsReceipt` block gains `branchId FK`; procurement rule paragraph documents the composite binding                                                                                                                                           |
| `docs/database/DATABASE_INDEXING_AND_PERFORMANCE.md`, `PRISMA_SCHEMA_GUIDE.md` | Counts: 274 `@@unique` / 187 `@@index` / 301 combined                                                                                                                                                                                          |
| `STEP_3_C3_C4_C5_COMPLETION_REPORT.md`                                         | F-007/U-1 disposition updated to reflect the approved decision and implementation                                                                                                                                                              |
| `STEP_3_U1_IMPLEMENTATION_AND_DOCUMENTATION_COMPLETION_REPORT.md`              | This report                                                                                                                                                                                                                                    |

`MULTI_TENANT_DATABASE_DESIGN.md` and `PRISMA_SCHEMA_GUIDE.md` conventions needed no U-1-specific
text beyond count updates (the rule is intra-tenant, not a tenancy exception).

## E. Schema changes and integrity constraints

Two changes, both Prisma-expressible — **no companion SQL required**:

1. `PurchaseOrder @@unique([businessId, id, branchId])` — new candidate key.
2. `GoodsReceipt.purchaseOrder` — composite FK `(businessId, purchaseOrderId, branchId)` →
   `PurchaseOrder(businessId, id, branchId)` with `onDelete: Restrict` and explicit
   `onUpdate: NoAction` (added in the final integrity correction; see
   `STEP_3_U1_FINAL_INTEGRITY_CORRECTION_REPORT.md`).

Effects:

- A receipt whose `branchId` differs from the PO's `branchId` cannot be inserted — the FK finds
  no matching `(businessId, id, branchId)` triple. Tenant isolation is preserved (the key still
  leads with `businessId`).
- Partial and multiple receipts are unaffected: the FK constrains branch equality only.
- `GoodsReceipt.branch` → `Branch(businessId, id)` still validates the branch belongs to the
  business.
- `GoodsReceiptLine.receipt` → `GoodsReceipt(businessId, purchaseOrderId, branchId, id)` is
  unchanged and remains consistent.
- **History protection (deliberate, corrected):** receipts reference the PO's
  `(businessId, id, branchId)` key and the relation now declares `onUpdate: NoAction` explicitly.
  (Correction: Prisma's implicit `onUpdate` default is `Cascade`, not `NO ACTION` — the original
  text wrongly assumed omission produced `NO ACTION`. See
  `STEP_3_U1_FINAL_INTEGRITY_CORRECTION_REPORT.md`.) PostgreSQL rejects any
  `PurchaseOrder.branchId` update while a receipt references it and never cascades or rewrites
  `GoodsReceipt.branchId` — a destination change after the first receipt is impossible at the
  database level, exactly matching the approved rule.

## F. Companion SQL requirements

None. All enforcement is in the Prisma schema and will be emitted by the baseline migration.

## G. Application-level enforcement contract

Documented for Step 4 implementation (no application code written — out of scope):

1. In one transaction, load the PO with `SELECT ... FOR UPDATE` (row lock).
2. Verify PO belongs to the caller's `businessId`; verify `receipt.branchId = po.branchId`;
   reject with a branch-mismatch error — never rewrite the request's branch.
3. Verify PO status is receivable (`SENT`/`CONFIRMED`/`PARTIALLY_RECEIVED` per lifecycle) and the
   actor's membership/branch assignment permits receiving at that branch.
4. The lock serializes against a concurrent destination revision: whichever transaction commits
   first wins; the loser re-reads and re-validates.
5. Insert `GoodsReceipt` (+ lines) in the same transaction; the composite FK is the final guard
   against any path that bypasses the service.

## H. PO destination revision and audit behavior

Existing schema support is adequate:

- `PurchaseOrderRevision` (`revisionNumber`, `reason`, `snapshot` JSON, `createdByUserId`,
  `createdAt`) preserves history; `PurchaseOrder.currentRevision` tracks the head.
- `PurchaseOrderApproval` records APPROVED/REJECTED decisions with `approvedByUserId`/`decidedAt`.
- `PurchaseOrder.branchId`/`approvedByUserId`/`approvedAt`/`version` support the state transition.

**Required contract (service layer):** a destination revision creates a `PurchaseOrderRevision`
whose `snapshot` MUST contain the previous and new `branchId` (e.g.
`{"branch": {"from": "...", "to": "..."}}`), sets `reason`, is created by an authorized actor,
and — for an approved PO — is accompanied by a `PurchaseOrderApproval` decision within the
existing Owner/Manager approval boundaries (Business Admin may prepare but never approves or
authorizes physical receiving outcomes). The PO's `branchId`, `currentRevision` and `version`
update in the same transaction, only while no `GoodsReceipt` exists (the DB enforces this
regardless). An `AuditEvent` records the action.

**Documented gap:** revision contents are JSON, so old/new branch values are not typed columns.
Smallest compatible hardening (proposed, not implemented): add nullable
`fromBranchId`/`toBranchId` columns to `PurchaseOrderRevision` if audit queries later need them
typed. The JSON contract above is sufficient for the approved rule today.

## I. Documentation updates

See §D. All documents now state the same rule: same-branch receiving enforced by composite FK;
destination change = authorized audited revision before first receipt; partial/multiple receipts
preserved; post-receipt destination change rejected by the database.

## J. Test scenarios and execution status

- **CON-40/41/42** — DB constraint tests (specified in `DATABASE_VALIDATION_AND_TESTING.md`,
  §3.2): branch-mismatch receipt, cross-tenant receipt, post-receipt PO branch update. **Not
  executed** — no PostgreSQL available; runtime-unverified.
- **U1-APP-01…12** — service integration scenarios covering every case in the task table
  (same/different branch, partial/multiple receipts, cross-tenant, unauthorized revision,
  authorized revision then receipt, history rewrite, concurrency, eligibility). **Specified,
  not executed** — application code does not exist yet.
- **Static/schema-inspection:** the composite FK and candidate key verified present in
  `schema.prisma`; `prisma validate` passes.

## K. Validation commands and actual results

| Command                                        | Result                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `npx prisma validate` (dummy `DATABASE_URL`)   | PASS — schema valid                                                      |
| `npx prisma format` + `--check`                | PASS — formatted                                                         |
| `npx prettier --write/--check` on touched docs | Applied; clean                                                           |
| Schema recount                                 | 159 models, 94 enums, 274 `@@unique`, 187 `@@index`, 301 combined unique |

## L. Remaining limitations and unresolved technical issues

- All FK/CHECK behavior is **runtime-unverified** until the authorized PostgreSQL 17 stage.
- Service-layer contract (§G/§H) is documentation only; implementation is Step 4 scope.
- `PurchaseOrderRevision.snapshot` is JSON — old/new branch values are contract-enforced, not
  typed (hardening option documented in §H).
- Non-PO `GoodsReceipt` workflows do not exist in the schema (`purchaseOrderId` is required), so
  no exception path needed documenting.

## M. Scope compliance

- Migrations generated/applied: **NO** · Database contacted: **NO** · Seeds: **NO**
- Step 4 / M1–M4 / application code: **NO** · Unrelated files modified: **NO**

## N. Final U-1 status

**COMPLETE** — decision implemented in schema and documentation, statically validated.
PostgreSQL runtime validation remains pending the authorized migration/test stage.
