# Step 3 — Targeted documentation corrections completion report

**Status: COMPLETE** — both corrections applied and statically verified. Documentation-only
task; no schema, migration, database or application changes.

## Corrections attempted

1. **MIG-04 partial unique index inventory** in `DATABASE_VALIDATION_AND_TESTING.md`.
2. **U-1 database-vs-service enforcement clarification** in `LOGICAL_DATABASE_DESIGN.md`.

## Files modified

| Path                                                             | Change                                                                                                                                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/database/DATABASE_VALIDATION_AND_TESTING.md`               | MIG-04 updated to reference all eight indexes; new §3.1a partial unique index inventory; §12 acceptance wording corrected to distinguish `@@unique` vs scalar `@unique` |
| `docs/database/LOGICAL_DATABASE_DESIGN.md`                       | §3.5 U-1 bullet split into explicit database-enforced and application-service-enforced responsibilities                                                                 |
| `STEP_3_TARGETED_DOCUMENTATION_CORRECTIONS_COMPLETION_REPORT.md` | This report                                                                                                                                                             |

No other files were modified.

## Partial unique index inventory verified

Source of truth: companion SQL in `DATABASE_MIGRATION_AND_SEED_STRATEGY.md` §2.1 (8
`CREATE UNIQUE INDEX` statements, all with partial predicates). Cross-checked against
`schema.prisma`: **none of the eight is Prisma-expressible; all require companion SQL.** None
exists in PostgreSQL — no migration has been generated or applied.

| Index                                        | Table                        | Columns                            | Predicate               | Basis                |
| -------------------------------------------- | ---------------------------- | ---------------------------------- | ----------------------- | -------------------- |
| `membership_one_owner_per_business`          | `Membership`                 | `(businessId)`                     | `"isOwner" = true`      | Original Step 3 plan |
| `cashier_shift_one_open_per_terminal`        | `CashierShift`               | `(businessId, terminalId)`         | `"status" = 'OPEN'`     | Original Step 3 plan |
| `role_system_code_unique`                    | `Role`                       | `(code)`                           | `"businessId" IS NULL`  | Original Step 3 plan |
| `unit_global_code_unique`                    | `Unit`                       | `(code)`                           | `"businessId" IS NULL`  | Original Step 3 plan |
| `stocktake_line_unbatched_unique`            | `StocktakeLine`              | `(sessionId, variantId)`           | `"batchId" IS NULL`     | C-3 / F-003          |
| `idempotency_record_platform_unique`         | `IdempotencyRecord`          | `(scope, key)`                     | `"businessId" IS NULL`  | C-3 / F-003          |
| `goods_receipt_line_unbatched_unique`        | `GoodsReceiptLine`           | `(receiptId, purchaseOrderLineId)` | `"batchNumber" IS NULL` | C-3 / F-005          |
| `membership_branch_assignment_active_unique` | `MembershipBranchAssignment` | `(membershipId, branchId)`         | `"revokedAt" IS NULL`   | C-5 / F-010          |

**Discrepancies discovered:** MIG-04 listed only the original four indexes, omitting the four
added during C-3/C-5. No disagreement between companion SQL and schema was found — the SQL is
the sole carrier of these rules by design.

## Confirmed unique declaration counts

Independently recounted from `schema.prisma`: **274 `@@unique` declarations, 27 scalar `@unique`
fields, 301 combined.** §12 now reads "274 `@@unique` declarations (+27 scalar `@unique` = 301
combined)" instead of the ambiguous "274 unique criteria".

## U-1 enforcement responsibilities (as now documented)

**Database-enforced:** composite FK `GoodsReceipt(businessId, purchaseOrderId, branchId)` →
`PurchaseOrder(businessId, id, branchId)` guarantees branch equality at insert; `onUpdate:
NoAction` makes PostgreSQL reject a PO destination-branch update while any receipt references the
old key; receipt `branchId` values are never cascaded or rewritten.

**Application-service-enforced (Step 4, not implemented):** authorized Owner/Manager initiates or
approves the destination change (Business Admin cannot approve); change recorded as an authorized
`PurchaseOrderRevision` preserving previous branch, new branch, actor, timestamp, reason;
transactional application with `version`/`currentRevision` bookkeeping; `SELECT ... FOR UPDATE`
locking to serialize receipt creation against destination revision; after the first receipt the
destination cannot change (database-guaranteed regardless).

## Validation commands and actual results

| Check                                                | Result                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| Companion SQL index inventory vs §3.1a table         | 8/8 match — names, tables, columns, predicates verified         |
| `@@unique` / scalar `@unique` recount from schema    | 274 / 27 / 301 confirmed                                        |
| `npx prettier --write` on both modified docs         | Applied cleanly                                                 |
| Internal consistency (MIG-04 ↔ §3.1a ↔ strategy doc) | Consistent                                                      |
| PostgreSQL runtime verification                      | **NOT VERIFIED** — no database exists; explicitly still pending |

## Git status / changed-file summary

Working tree remains heavily uncommitted (pre-existing Step 2/3 state). This task touched only
the two authorized documentation files plus the new report. `docs/database/` remains untracked
as a whole, as before.

## Scope compliance

- `schema.prisma` modified: **NO** · Migrations generated/edited/applied: **NO**
- Database created/contacted: **NO** · Seeds: **NO** · Application/frontend code: **NO**
- Step 4 started: **NO** · Approved decisions changed: **NO**

**STOP** — awaiting independent review and authorization.
