# Step 3 — Final remediation and change register

**Date:** 2026-11-24
**Scope:** Remediation of genuine Step 3 database-design defects identified during the final baseline verification.

---

## 1. Findings register

No genuine Step 3 database-design defects requiring remediation were identified during this final verification.

All findings from previous audits (F-001 through F-017) were rechecked and found to be either fully resolved or partially resolved with remaining work correctly classified as runtime verification (pending migration) or service-layer implementation (Step 4 scope).

### 1.1 Complete findings summary

| ID          | Severity | Finding                                                                                         | Status                             | Action required                                                   |
| ----------- | -------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| F-001       | High     | D-025 contradiction in completion report §H.2/K.1                                               | **RESOLVED** (previous correction) | None — verified corrected                                         |
| F-002       | Medium   | Stale documentation statistics                                                                  | **RESOLVED** (previous correction) | None — independently verified                                     |
| F-003       | Medium   | Nullable fields in unique constraints (StocktakeLine, IdempotencyRecord, ProductAttributeValue) | **PARTIALLY RESOLVED**             | Companion SQL specified; runtime verification pending migration   |
| F-004       | Medium   | Nullable businessId exceptions undocumented                                                     | **RESOLVED** (previous correction) | None — all 10 documented                                          |
| F-005       | Medium   | Missing receipt/invoice line uniqueness                                                         | **PARTIALLY RESOLVED**             | Companion SQL specified; runtime verification pending migration   |
| F-006       | Low      | ERD field-name inaccuracies                                                                     | **RESOLVED** (previous correction) | None                                                              |
| F-007       | Medium   | Intra-tenant branch consistency gaps                                                            | **PARTIALLY RESOLVED**             | U-1 enforced in schema; remaining gaps are service-layer (Step 4) |
| F-008       | Medium   | No four-member contribution evidence                                                            | **OPEN** (governance)              | Not a database design defect — governance gate C-6a               |
| F-009       | Medium   | Membership dual role relations ambiguity                                                        | **PARTIALLY RESOLVED**             | Service contract documented; implementation is Step 4             |
| F-010       | Medium   | Branch-assignment reassignment blocked                                                          | **PARTIALLY RESOLVED**             | Partial unique index specified; runtime pending migration         |
| F-011       | Low      | ~44 actor UUIDs without User FK                                                                 | **ACCEPTED**                       | Documented intentional design convention                          |
| F-012       | Low      | Tenant-derived children undocumented                                                            | **RESOLVED** (previous correction) | None                                                              |
| F-013       | Low      | businessType duplication                                                                        | **PARTIALLY RESOLVED**             | Service sync rule documented; implementation is Step 4            |
| F-014/F-015 | Low      | Index/ERD/documentation drift                                                                   | **RESOLVED** (previous correction) | None                                                              |
| F-016       | High     | Authoritative requirements source absent                                                        | **RESOLVED**                       | MRDD v1.0 present in repository                                   |
| F-017       | Medium   | Invoice-line/PO-line consistency                                                                | **PARTIALLY RESOLVED**             | Composite FK widened + CHECK specified; runtime pending migration |

### 1.2 Classification

- **CRITICAL:** 0
- **HIGH:** 0 (F-001 and F-016 previously High — both resolved)
- **MEDIUM:** 0 new (all previously identified Medium findings are resolved or partially resolved with remaining work correctly classified)
- **LOW:** 0 new
- **INFORMATIONAL:** 5 (by-design deferrals and governance items — see verification report §9)

---

## 2. Files modified

**No files were modified during this final verification.**

The schema, documentation, and companion SQL were inspected and verified. No genuine Step 3 database-design defects were found that required correction. All previously identified defects have already been corrected by prior remediation passes (C-1 through C-6b, U-1).

---

## 3. Verification evidence

### 3.1 Prisma validation

```
$ npx prisma validate  (with placeholder DATABASE_URL)
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀
```

### 3.2 Prisma client generation

```
$ npx prisma generate
Prisma schema loaded from prisma\schema.prisma
✔ Generated Prisma Client (v6.19.3)
```

### 3.3 Prisma format check

```
$ npx prisma format --check
Prisma schema loaded from prisma\schema.prisma
All files are formatted correctly!
```

### 3.4 Schema recount (Node.js script)

```
Models: 159
Enums: 94
@@unique: 274
@@index: 187
onDelete Restrict: 303
onDelete Cascade: 57
onDelete SetNull: 8
Decimal(18,2): 60
Decimal(18,3): 60
Decimal(18,4): 16
Float/Double: 0
Json columns: 27
Models with non-null businessId: 128
Models with nullable businessId: 10
Models with branchId: 52
@@unique([businessId, id]): 138
Scalar @unique: 27
```

All counts match the consolidated review (§C) and the completion report (§B.2).

### 3.5 U-1 verification

```
GoodsReceipt.purchaseOrder relation:
  fields: [businessId, purchaseOrderId, branchId]
  references: [businessId, id, branchId]
  onDelete: Restrict
  onUpdate: NoAction

PurchaseOrder @@unique([businessId, id, branchId]): present
```

Only `onUpdate` in the entire schema — confirmed by `grep onUpdate`.

### 3.6 Companion SQL verification

```
CHECK constraints (ADD CONSTRAINT): 19
Partial unique indexes (CREATE UNIQUE INDEX): 8
```

All constraint names reference actual schema table and column names. All predicates are PostgreSQL-compatible.

### 3.7 D-025 verification

Completion report §H.2 now states: "the server rejects the **entire** operation. Partial acceptance and partial fulfilment are prohibited." K.1 lists the item as "resolved, no longer open." Schema has `ReconciliationException` with `revalidationCount`, `originalPayload`, `INSUFFICIENT_STOCK` default, strict lifecycle states.

### 3.8 Git status

- Commit `a356aad` preserved.
- All existing modifications preserved.
- All untracked Step 2/Step 3 reports preserved.
- No commits or pushes performed.
- No files modified, deleted, or created (except the four final deliverable reports).

---

## 4. Unresolved issues

No unresolved database-design defects remain. The following items are by-design deferrals, not defects:

1. **Runtime verification of companion SQL** — 19 CHECKs and 8 partial indexes are specified but not applied. This is intentional: the baseline migration has not been generated. Verification requires a PostgreSQL 17 instance.

2. **Service-layer rules** — Role-tenant binding, businessType sync, branch consistency for shifts/terminals, refund ceiling, receiving ≤ ordered, reservation ≤ available. All are application-enforced per the documented enforcement-layer model. Implementation is Step 4 scope.

3. **Stock movement append-only enforcement** — Trigger or role revocation is deferred until runtime database roles exist. Code review and integration tests protect until then.

4. **C-6a governance** — Four-member contribution evidence remains open. This is a governance item, not a database design defect.

5. **§27 open items** — State machine freezes, customer uniqueness rules, landed-cost allocation, currency rules, retention policies. All are explicitly open technical decisions per MRDD §27, not requirements gaps.
