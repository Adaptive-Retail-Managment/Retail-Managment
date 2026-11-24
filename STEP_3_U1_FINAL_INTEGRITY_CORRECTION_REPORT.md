# Step 3 — U-1 final integrity correction report

**Scope:** explicit `onUpdate: NoAction` on `GoodsReceipt.purchaseOrder`, documentation
corrections, static validation. No migration generated or applied; no database contacted.

## 1. Exact schema change

`apps/api/prisma/schema.prisma`, `GoodsReceipt.purchaseOrder` (line ~2917):

```diff
- @relation(fields: [businessId, purchaseOrderId, branchId], references: [businessId, id, branchId], onDelete: Restrict)
+ @relation(fields: [businessId, purchaseOrderId, branchId], references: [businessId, id, branchId], onDelete: Restrict, onUpdate: NoAction)
```

Preserved: composite `fields`, composite `references`, `onDelete: Restrict`, the
`PurchaseOrder @@unique([businessId, id, branchId])` candidate key, and all tenant isolation.
No other relation was touched — this is the only `onUpdate` in the schema.

## 2. The Prisma default that was corrected

Prisma ORM's implicit `onUpdate` referential-action default is **`Cascade`**, not `NO ACTION`.
The original U-1 report incorrectly claimed that omitting `onUpdate` produced PostgreSQL
`NO ACTION`. Under the implicit default, updating a referenced `PurchaseOrder(businessId, id,
branchId)` key — i.e., a PO destination-branch change — would have **cascaded** the new
`branchId` into every referencing `GoodsReceipt`, silently rewriting historical receipt records.
That directly violated the approved rule that destination changes must be rejected after the
first receipt and must never rewrite receipt history.

With explicit `onUpdate: NoAction`, PostgreSQL rejects the PO destination update while any
`GoodsReceipt` references the old composite key; existing `GoodsReceipt.branchId` values cannot
be cascaded or modified through this relation. The only legal path remains an authorized,
audited `PurchaseOrderRevision` + `PurchaseOrderApproval` completed before the first receipt.

## 3. Files modified

| Path                                                              | Change                                                                                                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/prisma/schema.prisma`                                   | Added `onUpdate: NoAction` to `GoodsReceipt.purchaseOrder`                                                                            |
| `docs/database/ENTITY_RELATIONSHIP_DIAGRAM.md`                    | `PurchaseOrder` block gains `branchId FK`; relationship paragraph now states explicit `onUpdate: NoAction` semantics                  |
| `docs/database/DATABASE_MIGRATION_AND_SEED_STRATEGY.md`           | §2.1 U-1 note corrected: explicit `onUpdate: NoAction`, rejects update, never cascades                                                |
| `docs/database/LOGICAL_DATABASE_DESIGN.md`                        | Procurement note corrected to `onUpdate: NoAction` wording                                                                            |
| `docs/database/DATABASE_VALIDATION_AND_TESTING.md`                | CON-42 rewritten (see §5)                                                                                                             |
| `STEP_3_U1_IMPLEMENTATION_AND_DOCUMENTATION_COMPLETION_REPORT.md` | §D/§E corrected: explicit `onUpdate: NoAction`; wrong "Prisma emits no ON UPDATE clause" claim replaced with a pointer to this report |
| `STEP_3_U1_FINAL_INTEGRITY_CORRECTION_REPORT.md`                  | This report                                                                                                                           |

`STEP_3_C3_C4_C5_COMPLETION_REPORT.md` required no edit — its U-1 references already record the
approved Option A decision, schema correction and pending runtime status without repeating the
incorrect `NO ACTION`-by-omission claim.

## 4. Validation commands and actual results

| Command                                      | Result                                                            |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `grep onUpdate schema.prisma`                | `onUpdate: NoAction` present on `GoodsReceipt.purchaseOrder` only |
| `npx prisma validate` (dummy `DATABASE_URL`) | **PASS** — schema valid                                           |
| `npx prisma format --check`                  | **PASS** — all files formatted                                    |
| `npx prettier --write` on touched docs       | Applied; check clean                                              |

No migration was generated to inspect the change; `prisma validate` confirms the referential
action is schema-legal.

## 5. Updated CON-42 behavior

`DATABASE_VALIDATION_AND_TESTING.md` CON-42 now specifies: `UPDATE PurchaseOrder.branchId` after
a `GoodsReceipt` exists must fail with an FK violation (`onUpdate: NoAction`), **and** the test
must re-read the receipt rows and assert every `GoodsReceipt.branchId` is unchanged — proving
historical receipts are neither rejected retroactively nor cascaded. Runtime execution remains
**pending** (no PostgreSQL available).

## 6. Historical receipt protection

Confirmed by schema inspection: the only relation connecting `GoodsReceipt` to `PurchaseOrder`
declares `onUpdate: NoAction`. No other path can cascade a PO `branchId` change into receipt
rows. Combined with `onDelete: Restrict`, receipt history is structurally immutable against PO
key changes.

## 7. Remaining runtime limitations

- FK `onUpdate: NoAction` behavior is **runtime-unverified** until the authorized PostgreSQL 17
  stage executes CON-40/41/42.
- Service-layer contract (transaction, `FOR UPDATE` lock, revision-before-first-receipt) remains
  Step 4 documentation.

## 8. Status reconciliation

- U-1 decision: **APPROVED — Option A**
- Schema correction (incl. this `onUpdate` fix): **COMPLETE**
- Static validation: **COMPLETE** (commands above actually passed)
- PostgreSQL runtime verification: **PENDING**
- C-3/C-5 overall: unchanged — still **PARTIALLY COMPLETE** pending runtime validation; U-1's
  resolution does not mark them complete.

## 9. Scope compliance

- Migrations generated/applied: **NO** · Database contacted: **NO** · Seeds: **NO**
- Application code / Step 4 / M1–M4: **NO** · Unrelated files modified: **NO**

**Final status: COMPLETE** (statically). Stopping — awaiting authorization for the next stage.
