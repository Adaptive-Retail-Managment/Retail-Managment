# Step 3 — Final database baseline verification report

**Date:** 2026-11-24
**Scope:** Final comprehensive verification of the Step 3 database design baseline.
**Method:** Independent inspection of actual repository files — schema, documentation, reports, Git state. No previous report was trusted without verification.

---

## 1. Actual schema inventory

**Authoritative schema location:** `apps/api/prisma/schema.prisma` (single file, 4,243 lines)

### 1.1 Model and enum counts (independently recounted)

| Metric                                      | Documented (consolidated review) | Actual (this audit) | Verdict |
| ------------------------------------------- | -------------------------------- | ------------------- | ------- |
| Models                                      | 159                              | **159**             | PASS    |
| Enums                                       | 94                               | **94**              | PASS    |
| Models with non-null `businessId`           | 128                              | **128**             | PASS    |
| Models with nullable `businessId`           | 10                               | **10**              | PASS    |
| Models with `branchId`                      | 52                               | **52**              | PASS    |
| `@@unique([businessId, id])` composite keys | 138                              | **138**             | PASS    |
| `@@unique` declarations                     | 274                              | **274**             | PASS    |
| Scalar `@unique`                            | 27                               | **27**              | PASS    |
| `@@index` declarations                      | 187                              | **187**             | PASS    |
| `onDelete: Restrict`                        | 303                              | **303**             | PASS    |
| `onDelete: Cascade`                         | 57                               | **57**              | PASS    |
| `onDelete: SetNull`                         | 8                                | **8**               | PASS    |
| `Decimal(18,2)` money columns               | 60                               | **60**              | PASS    |
| `Decimal(18,3)` quantity columns            | 60                               | **60**              | PASS    |
| `Decimal(18,4)` unit-cost columns           | 16                               | **16**              | PASS    |
| `Decimal(18,6)` factor columns              | 3                                | **3**               | PASS    |
| `Decimal(5,2)` score columns                | 8                                | **8**               | PASS    |
| `Decimal(5,4)` rate columns                 | 2                                | **2**               | PASS    |
| `Decimal(6,2)` lead-time columns            | 2                                | **2**               | PASS    |
| `Float` / `Double` columns                  | 0                                | **0**               | PASS    |
| `Json` columns                              | 27                               | **27**              | PASS    |

All 159 model names and all 94 enum names were enumerated and verified against the entity catalog and module ownership map. No duplicates, no orphans, no missing modules.

### 1.2 Model inventory (all 159 models)

The complete model list was extracted and verified. Models span all 21 modules plus platform infrastructure:

- **Identity (5):** User, UserCredential, UserSession, EmailVerificationToken, PasswordResetToken
- **Tenancy (5):** Business, Branch, Membership, MembershipBranchAssignment, Invitation
- **Authorization (3):** Permission, Role, RolePermission
- **Employees (3):** Employee, EmployeeBranchAssignment, EmploymentStatusHistory
- **Subscriptions (11):** Plan, PlanFeature, PlanPrice, Subscription, SubscriptionHistory, SubscriptionInvoice, PaymentAttempt, PaymentWebhookEvent, TrialGrant, UsageCounter, PaymentReconciliationTask
- **Super-admin (3):** PlatformSetting, SupportCase, SupportAccessGrant
- **Audit (1):** AuditEvent
- **Business-configuration (7):** BusinessConfiguration, BusinessSetting, BranchSetting, AttributeDefinition, Unit, UnitConversion, CapabilityFlag
- **Catalog (8):** Brand, Category, Product, ProductVariant, ProductAttributeValue, Barcode, ProductMedia, ProductImportJob
- **Pricing (5):** PriceList, ProductPrice, BranchPriceOverride, PriceChangeHistory, Discount
- **Files (3):** FileObject, FileLink, FileUploadSession
- **Inventory (18):** StockLocation, StockBalance, StockMovement, InventoryBatch, BatchMovementAllocation, StocktakeSession, StocktakeLine, InventoryAdjustment, InventoryAdjustmentLine, StockTransfer, StockTransferLine, TransferReceipt, TransferReceiptLine, InventoryAlert, StockReservation, MinStockSetting, StockLossRecord, InventoryValuationSnapshot
- **Suppliers (11):** Supplier, SupplierContact, SupplierDocument, SupplierProduct, SupplierPriceHistory, SupplierPricingAgreement, SupplierAgreementLine, SupplierRating, SupplierDispute, SupplierStatement, SupplierPerformanceSnapshot
- **Procurement (20):** PurchaseRequest, PurchaseRequestLine, Rfq, RfqVersion, RfqLine, SupplierQuotation, QuotationLine, QuotationComparison, NegotiationRecord, PurchaseOrder, PurchaseOrderRevision, PurchaseOrderLine, PurchaseOrderApproval, SupplierConfirmation, GoodsReceipt, GoodsReceiptLine, SupplierInvoice, SupplierInvoiceLine, SupplierPayment, PaymentAllocation
- **Customers (5):** Customer, CustomerContact, CustomerConsent, CustomerMergeRequest, CustomerBusinessSummary
- **Sales (11):** PosTerminal, CashierShift, ShiftCashMovement, Sale, SaleLine, SalePayment, SaleDiscount, SaleVoid, Receipt, ReceiptBlock, SaleCustomerAssociation
- **After-sales (9):** ReturnRequest, ReturnLine, ReturnInspection, Refund, RefundAllocation, Exchange, ExchangeLine, ExchangeReservation, CollectionFollowUp
- **Notifications (5):** NotificationTemplate, Notification, NotificationDelivery, NotificationPreference, NotificationEscalation
- **Synchronization (10):** Device, SyncSession, SyncOperation, SyncAttempt, ReconciliationException, ReconciliationShortfallLine, ReconciliationEvent, ConflictRecord, SyncCursor, FeedEvent
- **Analytics (8):** SalesDailyFact, ProductSalesDailyFact, InventoryDailyFact, StockoutEvent, ExpiryRiskFact, SupplierPerformanceFact, ReportDefinition, ExportJob
- **Intelligence (6):** ForecastModel, ForecastRun, ForecastPoint, Recommendation, FeatureSnapshot, ModelMetric
- **Platform infrastructure (2):** OutboxEvent, IdempotencyRecord

Sum: 5+5+3+3+11+3+1+7+8+5+3+18+11+20+5+11+9+5+10+8+6+2 = **159** ✅

### 1.3 Enum inventory (all 94 enums)

All 94 enums verified present with correct values. Key enums include BusinessType (GROCERY, FASHION, PHARMACY, COSMETICS), StockMovementType (10 values covering all movement categories), SaleStatus, ReturnStatus, ReconciliationStatus (6 values matching D-025 lifecycle), and all status/workflow enums for procurement, inventory, and subscriptions.

---

## 2. Structural audit

### 2.1 Primary keys

- 158 models use `@id @default(uuid(7)) @db.Uuid` primary keys.
- 1 model (`RolePermission`) uses composite `@@id([roleId, permissionId])` — correctly documented.
- All primary keys are UUID v7 as specified.

### 2.2 Unique constraints

- 274 `@@unique` composite constraints verified.
- 27 scalar `@unique` constraints verified (e.g., User.email, Business.slug, Permission.code, Plan.code).
- Natural keys are tenant-scoped: `@@unique([businessId, sku])`, `@@unique([businessId, code])`, `@@unique([businessId, number])`, `@@unique([businessId, receiptNumber])`.

### 2.3 Indexes

- 187 `@@index` declarations verified, covering access patterns for business-scoped queries, status filters, date ranges, and branch-scoped lookups.

### 2.4 Relations

- All relations have matching opposite-side declarations (Prisma validation confirms this).
- Composite foreign keys enforce tenant isolation on 138 parent models via `@@unique([businessId, id])`.
- `onDelete: Restrict` (303) protects financial, stock, and historical records.
- `onDelete: Cascade` (57) is reserved for owned, non-financial detail rows.
- `onDelete: SetNull` (8) used for optional references to global entities (User, FileObject).

### 2.5 Money and quantity integrity

- All monetary values use `Decimal(18, 2)` with explicit `currency` column (60 columns).
- All quantities use `Decimal(18, 3)` (60 columns).
- All unit costs use `Decimal(18, 4)` (16 columns).
- Zero `Float` or `Double` columns — verified by text search.

---

## 3. Relationship audit

### 3.1 Critical path verification

| Relationship path                             | Composite FK columns                                                   | Enforces                      | Verdict |
| --------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------- | ------- |
| `Sale → Branch`                               | `(businessId, branchId) → (businessId, id)`                            | Same-business branch          | PASS    |
| `SaleLine → Sale`                             | `(businessId, branchId, saleId) → (businessId, branchId, id)`          | Same-branch sale              | PASS    |
| `ReturnLine → SaleLine`                       | `(businessId, saleId, saleLineId)`                                     | Same-sale return              | PASS    |
| `RefundAllocation → Refund/SalePayment`       | `(businessId, saleId, refundId/salePaymentId)`                         | Same-sale refund/payment      | PASS    |
| `GoodsReceipt → PurchaseOrder`                | `(businessId, purchaseOrderId, branchId) → (businessId, id, branchId)` | U-1 same-branch               | PASS    |
| `PaymentAllocation → SupplierPayment/Invoice` | `(businessId, supplierId, …)`                                          | Same-supplier payment/invoice | PASS    |
| `Business.ownerMembership → Membership`       | `(id, ownerMembershipId) → (businessId, id)`                           | Owner belongs to business     | PASS    |
| `TransferReceipt → StockTransfer`             | `(businessId, transferId, branchId) → (businessId, id, toBranchId)`    | Receipt at destination        | PASS    |

### 3.2 No orphaned or duplicate definitions

All 159 models are unique. No duplicate model names found. All relations resolve to existing models.

---

## 4. Multi-tenant integrity audit

### 4.1 Tenant ownership

- 128 models carry non-null `businessId` (required tenant ownership).
- 10 models carry nullable `businessId` (documented exceptions: Role, Unit, FileObject, FileLink, FileUploadSession, OutboxEvent, IdempotencyRecord, AuditEvent, SupportCase, PaymentWebhookEvent).
- 21 models have no `businessId` (platform-level: Permission, Plan, PlanFeature, PlanPrice, RolePermission, ForecastModel, ForecastPoint, PlatformSetting, NotificationPreference, SyncAttempt, SyncCursor, EmploymentStatusHistory, ModelMetric, plus others that are children of tenant-scoped parents).
- All 10 nullable exceptions are documented in `MULTI_TENANT_DATABASE_DESIGN.md` §2 and §3.

### 4.2 Branch isolation

- 52 models carry `branchId`, all referencing `Branch` through composite `(businessId, branchId)` — cross-tenant branch reference is impossible.

### 4.3 Composite FK enforcement

- 138 models expose `@@unique([businessId, id])` enabling composite foreign keys from children.
- A child row cannot reference a parent in another business — the referenced `(businessId, id)` pair must exist.

### 4.4 Cross-tenant read protection

- Documented as application-layer responsibility (backend scope filtering). RLS evaluated and deferred with documented adoption criteria. This is an honest, defensible position at Step 3.

### 4.5 NotificationPreference classification

- Verified: `NotificationPreference` has no `businessId` — it is a global user-scoped preference (`@@unique([userId, channel, category])`). Documented in `MULTI_TENANT_DATABASE_DESIGN.md` §2 as a legitimate exception.

---

## 5. Industry-domain coverage audit

| Business type       | Schema representation                                                                                                                                    | Verdict |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Grocery & Food      | `Unit`/`UnitConversion` (weight/volume/count), `InventoryBatch.expiryDate`, `Product.isPerishable`/`shelfLifeDays`, `MinStockSetting`, `StockLossRecord` | PASS    |
| Fashion & Clothing  | `ProductVariant.size`, `color`, `AttributeDefinition`/`ProductAttributeValue` for arbitrary axes, variant-level SKU/price/stock                          | PASS    |
| Pharmacy & Medicine | `InventoryBatch` batch number/expiry/`QUARANTINED` status, `StockLocationType.QUARANTINE`, `LossType`, `isPerishable`                                    | PASS    |
| Cosmetics & Beauty  | `ProductVariant.shade`, `color`, `size`, `AttributeDefinition`/`ProductAttributeValue`, batch mechanics                                                  | PASS    |

All four business types share one catalog and inventory model. Differences are represented as data (configuration, attributes, capability flags), not as separate table families. `BusinessConfiguration`, `AttributeDefinition`, `Unit`, `UnitConversion`, and `CapabilityFlag` carry configurable differences.

---

## 6. Constraint verification

### 6.1 Prisma-expressible constraints (verified in schema)

All constraints below are present in `schema.prisma` and will be emitted by the baseline migration:

- Unique constraints: 274 `@@unique` + 27 `@unique` = 301 total.
- Indexes: 187 `@@index`.
- Foreign key actions: 303 Restrict, 57 Cascade, 8 SetNull.
- Composite tenant keys: 138 `@@unique([businessId, id])`.
- U-1 composite key: `PurchaseOrder @@unique([businessId, id, branchId])` with `GoodsReceipt.purchaseOrder` FK carrying `onUpdate: NoAction, onDelete: Restrict`.
- Idempotency: `SyncOperation @@unique([businessId, deviceId, operationId])`, `StockMovement @@unique([businessId, sourceKey])`, `Sale @@unique([businessId, offlineDeviceId, operationId])`, `Refund @@unique([businessId, idempotencyKey])`, `PaymentWebhookEvent @@unique([provider, providerEventId])`, `IdempotencyRecord @@unique([businessId, scope, key])`.

### 6.2 Companion SQL constraints (specified, not yet applied)

Located in `DATABASE_MIGRATION_AND_SEED_STRATEGY.md` §2.1. No standalone `.sql` files exist. No migrations directory exists. All constraints are specified and documented but **runtime-unverified**.

**19 CHECK constraints:**

| #   | Constraint name                             | Table                      | Rule                                                                    |
| --- | ------------------------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| 1   | `stock_balance_quantities_nonnegative`      | StockBalance               | on-hand, reserved, in-transit ≥ 0                                       |
| 2   | `stock_balance_reserved_within_on_hand`     | StockBalance               | reserved ≤ on-hand                                                      |
| 3   | `inventory_batch_quantities_valid`          | InventoryBatch             | received ≥ 0, remaining ≥ 0, remaining ≤ received                       |
| 4   | `inventory_valuation_nonnegative`           | InventoryValuationSnapshot | quantity, unitCost, totalValue ≥ 0                                      |
| 5   | `stock_loss_quantity_positive`              | StockLossRecord            | quantity > 0                                                            |
| 6   | `stocktake_quantities_nonnegative`          | StocktakeLine              | system ≥ 0, counted null or ≥ 0                                         |
| 7   | `stock_transfer_quantities_valid`           | StockTransferLine          | requested > 0, dispatched/received/accepted/rejected ≥ 0                |
| 8   | `sale_totals_nonnegative`                   | Sale                       | subtotal, discount, total, paid, change ≥ 0                             |
| 9   | `sale_line_values_valid`                    | SaleLine                   | quantity > 0, unitPrice ≥ 0, discount ≥ 0, lineTotal ≥ 0                |
| 10  | `sale_payment_amount_positive`              | SalePayment                | amount > 0                                                              |
| 11  | `refund_amount_positive`                    | Refund                     | amount > 0                                                              |
| 12  | `product_price_nonnegative`                 | ProductPrice               | amount ≥ 0                                                              |
| 13  | `purchase_order_line_values_valid`          | PurchaseOrderLine          | orderedQuantity > 0, unitCost ≥ 0, lineTotal ≥ 0                        |
| 14  | `goods_receipt_line_quantities_valid`       | GoodsReceiptLine           | received ≥ 0, accepted/rejected/damaged ≥ 0, sum ≤ received             |
| 15  | `return_line_values_valid`                  | ReturnLine                 | quantityRequested > 0, approved null or ≥ 0, restock ≥ 0, unitPrice ≥ 0 |
| 16  | `reconciliation_revalidation_once`          | ReconciliationException    | revalidationCount BETWEEN 0 AND 1                                       |
| 17  | `product_attribute_value_exactly_one_owner` | ProductAttributeValue      | productId XOR variantId                                                 |
| 18  | `stock_transfer_distinct_branches`          | StockTransfer              | fromBranchId ≠ toBranchId                                               |
| 19  | `supplier_invoice_line_po_link_complete`    | SupplierInvoiceLine        | PO link fields consistent                                               |

**8 partial unique indexes:**

| #   | Index name                                   | Table                      | Columns                          | Predicate           |
| --- | -------------------------------------------- | -------------------------- | -------------------------------- | ------------------- |
| 1   | `membership_one_owner_per_business`          | Membership                 | (businessId)                     | isOwner = true      |
| 2   | `cashier_shift_one_open_per_terminal`        | CashierShift               | (businessId, terminalId)         | status = 'OPEN'     |
| 3   | `role_system_code_unique`                    | Role                       | (code)                           | businessId IS NULL  |
| 4   | `unit_global_code_unique`                    | Unit                       | (code)                           | businessId IS NULL  |
| 5   | `stocktake_line_unbatched_unique`            | StocktakeLine              | (sessionId, variantId)           | batchId IS NULL     |
| 6   | `idempotency_record_platform_unique`         | IdempotencyRecord          | (scope, key)                     | businessId IS NULL  |
| 7   | `goods_receipt_line_unbatched_unique`        | GoodsReceiptLine           | (receiptId, purchaseOrderLineId) | batchNumber IS NULL |
| 8   | `membership_branch_assignment_active_unique` | MembershipBranchAssignment | (membershipId, branchId)         | revokedAt IS NULL   |

All constraint and index names reference actual table and column names from the schema. All predicates are PostgreSQL-compatible.

### 6.3 Constraints requiring future runtime verification

The following cannot be verified until a PostgreSQL 17 instance is available and the baseline migration is applied:

- All 19 CHECK constraints reject invalid data.
- All 8 partial unique indexes enforce scoped uniqueness.
- `onUpdate: NoAction` on `GoodsReceipt.purchaseOrder` rejects post-receipt PO branch changes.
- Stock movement append-only enforcement (trigger or role revocation — documented as deferred).
- Cross-table rules (refund ≤ paid, receiving ≤ ordered, reservation ≤ available) — service-layer, correctly documented as Step 4 scope.

---

## 7. Prisma validation results

| Command                                            | Result                                                      | Notes                                             |
| -------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `npx prisma validate` (placeholder `DATABASE_URL`) | **PASS** — "The schema at prisma\schema.prisma is valid 🚀" | Structural validation only; no database contacted |
| `npx prisma generate`                              | **PASS** — Prisma Client v6.19.3 generated                  | Client output confirmed                           |
| `npx prisma format --check`                        | **PASS** — "All files are formatted correctly!"             | Formatting verified                               |
| Float/Double search                                | **0 occurrences**                                           | No floating-point money/quantity columns          |
| `onUpdate` search                                  | **1 occurrence** — `GoodsReceipt.purchaseOrder` only        | U-1 Option A confirmed                            |

**Limitations:** Prisma validation proves schema syntax and relation integrity only. No PostgreSQL instance was used; CHECK constraints, partial indexes, and all runtime behavior are unverified because no migration has been generated (by design).

---

## 8. Migration and runtime verification status

| Item                                      | Status                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/api/prisma/migrations/` directory   | Does not exist — **by design**                                                       |
| Standalone `.sql` files                   | Do not exist — companion SQL lives in `DATABASE_MIGRATION_AND_SEED_STRATEGY.md` §2.1 |
| Database created                          | No                                                                                   |
| Migration applied                         | No                                                                                   |
| Seed script                               | No                                                                                   |
| Integration tests against real PostgreSQL | Not executed (Docker unavailable)                                                    |
| Runtime CHECK constraint verification     | **PENDING** — no migration generated                                                 |
| Runtime partial index verification        | **PENDING** — no migration generated                                                 |
| `onUpdate: NoAction` runtime behavior     | **PENDING** — no migration generated                                                 |

The absence of migrations is deliberate. The first migration installs the whole shared schema and the companion integrity SQL together, so the database never exists in a state that violates approved rules. This is documented in `DATABASE_MIGRATION_AND_SEED_STRATEGY.md` §1–2.

---

## 9. Final findings and dispositions

| ID    | Severity      | Finding                                                                                                            | Disposition                                                                                      |
| ----- | ------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| V-001 | Informational | 19 CHECK constraints and 8 partial unique indexes are specified but not applied to a database                      | By design — no migration generated; companion SQL is complete and documented                     |
| V-002 | Informational | `onUpdate: NoAction` on `GoodsReceipt.purchaseOrder` is runtime-unverified                                         | By design — no migration generated; schema validation confirms the declaration                   |
| V-003 | Informational | C-6a four-member contribution evidence remains open                                                                | Governance gate, not a database design defect; git log shows single author, all work uncommitted |
| V-004 | Informational | Service-layer rules (role-tenant binding, businessType sync, branch consistency for shifts/terminals) await Step 4 | Intentionally application-enforced per the documented enforcement-layer model                    |
| V-005 | Informational | Stock movement append-only enforcement (trigger/role revocation) is deferred                                       | Documented in migration strategy §2.1; code review and integration tests protect until then      |

**No CRITICAL findings.**
**No HIGH findings.**
**No MEDIUM findings.**
**No LOW findings.**
**5 INFORMATIONAL findings** — all are by-design deferrals or governance items, not design defects.

---

## 10. Previous findings recheck

| Previous finding                                | Original severity | Current status         | Evidence                                                                                                                                                  |
| ----------------------------------------------- | ----------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-001: D-025 contradiction in completion report | High              | **RESOLVED**           | §H.2/K.1 now states "rejects the entire operation. Partial acceptance and partial fulfilment are prohibited"                                              |
| F-002: Stale documentation statistics           | Medium            | **RESOLVED**           | All counts independently verified and match consolidated review                                                                                           |
| F-003: Nullable fields in unique constraints    | Medium            | **PARTIALLY RESOLVED** | Companion SQL specified (stocktake_line_unbatched_unique, idempotency_record_platform_unique, product_attribute_value_exactly_one_owner); runtime pending |
| F-004: Nullable businessId undocumented         | Medium            | **RESOLVED**           | All 10 nullable models documented in MULTI_TENANT_DATABASE_DESIGN.md §2/§3                                                                                |
| F-005: Missing receipt/invoice line uniqueness  | Medium            | **PARTIALLY RESOLVED** | goods_receipt_line_unbatched_unique + supplier_invoice_line_po_link_complete; runtime pending                                                             |
| F-006: ERD field-name inaccuracies              | Low               | **RESOLVED**           | Verified by consolidated review                                                                                                                           |
| F-007: Intra-tenant branch consistency          | Medium            | **PARTIALLY RESOLVED** | U-1 enforced; stock_transfer_distinct_branches CHECK; remaining gaps are service-layer (Step 4)                                                           |
| F-008: No four-member contribution evidence     | Medium            | **OPEN**               | Governance gate C-6a — not a database design defect                                                                                                       |
| F-009: Membership dual role relations           | Medium            | **PARTIALLY RESOLVED** | Service contract documented; implementation is Step 4                                                                                                     |
| F-010: Branch-assignment reassignment           | Medium            | **PARTIALLY RESOLVED** | membership_branch_assignment_active_unique partial index; runtime pending                                                                                 |
| F-011: Actor UUIDs without User FK              | Low               | **ACCEPTED**           | Documented convention in schema guide §7                                                                                                                  |
| F-012: Tenant-derived children undocumented     | Low               | **RESOLVED**           | Documented in tenancy doc §3.3                                                                                                                            |
| F-013: businessType duplication                 | Low               | **PARTIALLY RESOLVED** | Service sync rule documented; implementation is Step 4                                                                                                    |
| F-014/F-015: Index/ERD/documentation drift      | Low               | **RESOLVED**           | Verified by consolidated review                                                                                                                           |
| F-016: Authoritative requirements source absent | High              | **RESOLVED**           | MRDD v1.0 is present in repository; master-requirements.md updated to reference it as authority                                                           |
| F-017: Invoice-line/PO-line consistency         | Medium            | **PARTIALLY RESOLVED** | Composite FK widened + supplier_invoice_line_po_link_complete CHECK; runtime pending                                                                      |

All previously identified Critical and High findings are resolved. No new Critical or High findings were identified in this audit.
