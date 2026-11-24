# Step 3 — Consolidated database design final readiness review

**Role:** independent senior database architect / PostgreSQL integrity auditor. All findings
below were re-derived from the current files; prior completion reports were treated as claims to
verify, not proof.

## Executive verdict

**CONDITIONALLY READY FOR STAGE A**

The schema and documentation are internally consistent, technically defensible and traceable to
the available requirements baseline. Every original audit finding is dispositioned; no unresolved
design defect blocks migration _preparation_. Two governance gates remain open by nature, not by
defect: C-6a (four-member contribution evidence — `git log` shows a single author) and C-6b
(authoritative requirements source — `master-requirements.md` is explicitly provisional and
`docs/requirements/decision-register.md` is deleted). All companion SQL and several service-layer
rules are **runtime-unverified** until an authorized PostgreSQL 17 stage.

## Files inspected

Present and inspected: `apps/api/prisma/schema.prisma`; all 12 files in `docs/database/`;
`docs/architecture/ARCHITECTURE_DECISION_RECORDS.md` (D-025 at line ~488);
`docs/requirements/master-requirements.md`; all nine `STEP_3_*`/`STEP_3`-adjacent reports.

Unavailable / notable: `docs/requirements/decision-register.md` — **deleted** in the working
tree (pre-existing, not from this review). `apps/api/prisma/migrations/` — does not exist
(correct: no migration generated). No companion `.sql` files exist outside the strategy
document — companion SQL lives inline in `DATABASE_MIGRATION_AND_SEED_STRATEGY.md` §2.1.

## A. Original findings F-001…F-017 disposition

| ID          | Original issue                                | Disposition                                                                                                                                                                                                                                                                                                                                                                      | Verdict                                              |
| ----------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| F-001       | Completion report contradicted strict D-025   | C-1 rewrote H.2/K.1; verified lines ~381–391, ~476–478 of the completion report; schema has `revalidationCount` + `originalPayload` + `INSUFFICIENT_STOCK` default                                                                                                                                                                                                               | **PASS**                                             |
| F-002       | Stale documentation statistics                | C-2/C-2b corrected; independently recounted (below)                                                                                                                                                                                                                                                                                                                              | **PASS**                                             |
| F-003       | Nullable fields in unique constraints         | Companion SQL: `stocktake_line_unbatched_unique`, `idempotency_record_platform_unique`, `product_attribute_value_exactly_one_owner` CHECK; accepted-NULL cases documented; Role/Unit globals covered                                                                                                                                                                             | **PARTIALLY RESOLVED** — runtime pending             |
| F-004       | Nullable `businessId` exceptions undocumented | C-4 §3.2 registers all 10 models with class/population/query rules                                                                                                                                                                                                                                                                                                               | **PASS** (docs)                                      |
| F-005       | Missing receipt/invoice line uniqueness       | `GoodsReceiptLine @@unique([receiptId, purchaseOrderLineId, batchNumber])` + unbatched partial index; `SupplierInvoiceLine @@unique([supplierInvoiceId, purchaseOrderLineId])`                                                                                                                                                                                                   | **PARTIALLY RESOLVED** — runtime pending             |
| F-006       | ERD field-name inaccuracies                   | C-2 fixes verified (`PriceList.name`, `damagedQuantity`, `Device.enrolledUserId`, valuation fields)                                                                                                                                                                                                                                                                              | **PASS**                                             |
| F-007       | Intra-tenant branch consistency               | Composite FKs on Sale/CashierShift/PosTerminal; `stock_transfer_distinct_branches` CHECK; returns/exchange documented as legitimate cross-branch; U-1 same-branch receiving                                                                                                                                                                                                      | **PARTIALLY RESOLVED** — service rules pending       |
| F-008       | No four-member contribution evidence          | `git log` shows a single author (Bruktawit); all Step 3 work uncommitted                                                                                                                                                                                                                                                                                                         | **OPEN** — governance gate C-6a                      |
| F-009       | Membership dual role relations                | Service contract documented (`roleBusinessId = tenant` for business roles; global `isSystem` via `role`); TEN-16 test specified                                                                                                                                                                                                                                                  | **PARTIALLY RESOLVED** — service enforcement pending |
| F-010       | Branch-assignment reassignment blocked        | Unconditional unique removed; `membership_branch_assignment_active_unique ... WHERE "revokedAt" IS NULL`                                                                                                                                                                                                                                                                         | **PARTIALLY RESOLVED** — runtime pending             |
| F-011       | ~44 actor UUIDs without User FK               | Accepted design; convention documented in schema guide §7                                                                                                                                                                                                                                                                                                                        | **PASS** (accepted intentional)                      |
| F-012       | Tenant-derived children undocumented          | C-4 §3.3 covers EmploymentStatusHistory, SyncAttempt, SyncCursor, ForecastPoint with parent-join rule; TEN-20/21 added                                                                                                                                                                                                                                                           | **PASS** — minor gap noted below                     |
| F-013       | `businessType` duplication                    | `Business.type` canonical; config copy sync rule documented                                                                                                                                                                                                                                                                                                                      | **PARTIALLY RESOLVED** — service enforcement pending |
| F-014/F-015 | Index/ERD/documentation drift                 | C-2b corrections verified against schema                                                                                                                                                                                                                                                                                                                                         | **PASS**                                             |
| F-016       | Authoritative requirements source absent      | `master-requirements.md` is a 43-line **provisional** baseline ("superseded when the approved documents are added"); `decision-register.md` deleted                                                                                                                                                                                                                              | **OPEN** — governance gate C-6b                      |
| F-017       | Invoice-line/PO-line consistency              | `SupplierInvoiceLine.purchaseOrderLine` widened to `[businessId, purchaseOrderId, purchaseOrderLineId, variantId]`; new `SupplierInvoicePoBinding` relation + `@@unique([businessId, supplierId, id, purchaseOrderId])` on `SupplierInvoice`; `supplier_invoice_line_po_link_complete` CHECK; `@@unique([supplierInvoiceId, purchaseOrderLineId])`; residual app rule documented | **PARTIALLY RESOLVED** — runtime + service pending   |

## B. C-1 — D-025 offline integrity: **PASS**

Verified in completion report §H.2/K.1 and schema: `ReconciliationException` carries
`originalPayload Json`, `payloadHash`, `failureCode` default `INSUFFICIENT_STOCK`,
`revalidationCount` (CHECK `BETWEEN 0 AND 1` in companion SQL), `committedSaleId`,
`correctiveStocktakeId`. Strict whole-sale rejection, no partial fulfilment, Manager/Owner
resolution, Business Admin view-only, one audited revalidation — all consistent with ADR D-025.

## C. C-2/C-2b — independently recounted schema statistics

| Statistic                         | Reported                            | Recounted | Verdict |
| --------------------------------- | ----------------------------------- | --------- | ------- |
| Models                            | 159                                 | 159       | PASS    |
| Enums                             | 94                                  | 94        | PASS    |
| Scalar `businessId` models        | 141                                 | 141       | PASS    |
| Nullable `businessId` models      | 10                                  | 10        | PASS    |
| `branchId` models                 | 52                                  | 52        | PASS    |
| `@@unique`                        | 274                                 | 274       | PASS    |
| Scalar `@unique`                  | 27                                  | 27        | PASS    |
| Combined unique                   | 301                                 | 301       | PASS    |
| `@@index`                         | 187                                 | 187       | PASS    |
| Decimal(18,2)/(18,3)/(18,4)       | 59/59/15                            | 59/59/15  | PASS    |
| Other decimals                    | 3×(18,6), 8×(5,2), 2×(6,2), 2×(5,4) | same      | PASS    |
| onDelete Restrict/Cascade/SetNull | 303/57/8                            | 303/57/8  | PASS    |
| JSON fields                       | 27                                  | 27        | PASS    |
| Float/Double                      | 0                                   | 0         | PASS    |

Note: `onDelete: Restrict` count rose 302→303 with the U-1/C-3 relation additions — consistent.

## D. C-3 — companion SQL inventory (verified against `DATABASE_MIGRATION_AND_SEED_STRATEGY.md`)

**19 CHECK constraints** (stock/inventory 7, sales/money/procurement 9, reconciliation 1,
C-3 additions 3: `product_attribute_value_exactly_one_owner`,
`stock_transfer_distinct_branches`, `supplier_invoice_line_po_link_complete`) and
**8 partial unique indexes** (verified in the targeted-correction review). All Prisma-expressible
rules are in `schema.prisma`; all partial-index/CHECK rules are companion-SQL-only and
runtime-unverified.

## E. C-4 — tenant exceptions: **PASS**

10 nullable-`businessId` models and 4 tenant-derived children fully registered with query rules.
**Minor defect (documentation):** `NotificationPreference` has no `businessId` and is neither in
the §2 "global tables" example list nor §3.3 — it is user-scoped (unique per
`userId/channel/category`), which is legitimate, but the tenancy doc's global-table enumeration
is incomplete. Not a schema defect; recommend a one-line doc note in a future correction.

## F. C-5 — branch/relation integrity

- Sale↔shift↔terminal branch binding: composite FKs `(businessId, branchId, id)` — DB-enforced.
- Self-transfer: `stock_transfer_distinct_branches` CHECK — companion SQL.
- Cross-branch returns/exchanges: documented as legitimate (processing branch) — accepted design.
- Role binding (F-009), businessType sync (F-013): service contracts documented, implementation
  pending Step 4.
- Assignment reassignment (F-010): partial unique — companion SQL.
- Actor UUIDs (F-011): documented convention.

## G. U-1 verification: **PASS**

`schema.prisma:2829` `PurchaseOrder @@unique([businessId, id, branchId])`; `:2917`
`GoodsReceipt.purchaseOrder` composite FK with `onDelete: Restrict, onUpdate: NoAction` (only
`onUpdate` in schema). Same-branch-only enforced at insert; post-receipt destination change
rejected; no cascade into receipt history. Service-layer responsibilities (Owner/Manager approval,
revision audit, transactional update, `FOR UPDATE` locking) correctly documented as **not yet
implemented** in `LOGICAL_DATABASE_DESIGN.md` §3.5 and the U-1 reports.

## H. Cross-document consistency

No contradictions found. All documents agree on: strict D-025, U-1 Option A, count values,
companion-SQL inventory, enforcement layering. The only inconsistency is the
`NotificationPreference` classification gap (§E above) and the deleted
`decision-register.md` (governance, not a doc contradiction).

## I. Requirements traceability

Traceable to: `master-requirements.md` (provisional baseline — tenant isolation, no negative
stock, PO≠stock, transactionality, Business Admin digital-only), architecture ADRs (D-025, U-1
Option A recorded in completion reports), Step 2 architecture docs. **R-23 equivalent remains
NOT VERIFIED**: the approved 4.1–4.12 requirements source is still absent — traceability is to a
provisional baseline, which is the honest state.

## J. C-6a / C-6b governance

- **C-6a (four-member contribution evidence): OPEN.** `git log` shows one author; Step 3 work is
  uncommitted. No fabricated evidence exists or was created.
- **C-6b (authoritative requirements source): OPEN.** Provisional baseline only; decision
  register deleted.

## K. Remaining defects and risks

1. NotificationPreference tenancy classification undocumented (minor).
2. All 19 CHECKs + 8 partial indexes + new composite FKs runtime-unverified.
3. Service-layer rules (F-009, F-013, U-1 workflow, returns branch policy) await Step 4.
4. C-6a/C-6b governance gates open.

## L. Migration-readiness assessment (Stage A = preparation only)

Schema coherent ✅ · companion SQL complete and documented ✅ · tenant/branch integrity designed ✅
· uniqueness/CHECK coverage accounted ✅ · app-layer responsibilities documented ✅ ·
runtime-only uncertainties explicitly identified ✅ · **no unresolved design defect blocks
preparation** ✅

## M. Decision: **CONDITIONALLY READY FOR STAGE A**

Rationale: technically ready for migration _preparation_ (authoring + review of baseline SQL);
conditional on (a) owner awareness that runtime verification is pending by definition, and
(b) C-6a/C-6b remaining open governance items that gate final approval, not preparation.

## N. Recommended next action

Project owner explicitly authorizes **Stage A**: generate the baseline migration with
`--create-only`, append the documented companion SQL, and review — without applying it to any
database.

**STOP** — audit complete; no files modified; no migration prepared; Step 4 not started.
