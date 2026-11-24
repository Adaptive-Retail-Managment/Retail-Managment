Adaptive Retail Intelligence Platform — Complete Project Structure
1. Recommended repository architecture
I recommend a monorepo with a modular monolithic backend.

Recommended architecture
 Modular Monolith

Repository
 Monorepo

The proposed technology stack is:
Component	Technology
Backend	NestJS + TypeScript
Database	PostgreSQL
ORM	Prisma
Web frontend	React + TypeScript + Vite
Desktop	Electron + React
Desktop offline database	SQLite
API	REST API
Testing	Jest/Vitest + Playwright
Deployment	Docker + Docker Compose
Package manager	pnpm workspaces

These are recommended stack choices from our earlier discussions, not yet confirmed final selections. The structure below assumes them so your IDE assistant has a concrete starting point.
2. Complete root folder structure
adaptive-retail-platform/
│
├── apps/
│   ├── api/
│   ├── web/
│   └── desktop/
│
├── packages/
│   ├── contracts/
│   ├── shared/
│   ├── ui/
│   ├── config/
│   └── offline-core/
│
├── database/
│   ├── prisma/
│   ├── seeds/
│   └── diagrams/
│
├── docs/
│   ├── product/
│   ├── requirements/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── ux/
│   ├── testing/
│   └── operations/
│
├── infra/
│   ├── docker/
│   ├── deployment/
│   ├── monitoring/
│   └── scripts/
│
├── tools/
│   ├── generators/
│   └── data/
│
├── .github/
│   └── workflows/
│
├── .editorconfig
├── .env.example
├── .gitignore
├── .npmrc
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
└── PROJECT_STRUCTURE.md


3. Backend structure — apps/api
This is the central application. All business rules, authorization, transactions, inventory operations, purchasing, sales, AI recommendations and integrations belong here.
apps/api/
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   │
│   ├── config/
│   │   ├── configuration.ts
│   │   ├── env.validation.ts
│   │   ├── database.config.ts
│   │   ├── mail.config.ts
│   │   ├── chapa.config.ts
│   │   └── storage.config.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── middleware/
│   │   ├── pagination/
│   │   ├── errors/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── database/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   ├── transaction.service.ts
│   │   └── database-health.service.ts
│   │
│   ├── infrastructure/
│   │   ├── email/
│   │   ├── sms/
│   │   ├── payments/
│   │   │   └── chapa/
│   │   ├── file-storage/
│   │   ├── exports/
│   │   │   ├── pdf/
│   │   │   └── spreadsheet/
│   │   ├── jobs/
│   │   ├── cache/
│   │   └── observability/
│   │
│   ├── modules/
│   │
│   │   ├── identity/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── sessions/
│   │   │   ├── verification/
│   │   │   └── password-recovery/
│   │
│   │   ├── tenancy/
│   │   │   ├── businesses/
│   │   │   ├── memberships/
│   │   │   ├── invitations/
│   │   │   ├── branches/
│   │   │   ├── business-settings/
│   │   │   └── ownership-transfer/
│   │
│   │   ├── authorization/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── role-assignments/
│   │   │   └── access-policies/
│   │
│   │   ├── employees/
│   │   │   ├── employee-profiles/
│   │   │   ├── branch-assignments/
│   │   │   └── employee-status/
│   │
│   │   ├── catalog/
│   │   │   ├── products/
│   │   │   ├── variants/
│   │   │   ├── categories/
│   │   │   ├── brands/
│   │   │   ├── attributes/
│   │   │   ├── units/
│   │   │   ├── barcodes/
│   │   │   ├── product-media/
│   │   │   ├── product-import/
│   │   │   └── industry-profiles/
│   │   │       ├── grocery/
│   │   │       ├── fashion/
│   │   │       ├── pharmacy/
│   │   │       └── cosmetics/
│   │
│   │   ├── inventory/
│   │   │   ├── stock-balances/
│   │   │   ├── stock-ledger/
│   │   │   ├── batches/
│   │   │   ├── expiry/
│   │   │   ├── stocktaking/
│   │   │   ├── adjustments/
│   │   │   ├── incidents/
│   │   │   ├── damage-and-wastage/
│   │   │   ├── quarantine/
│   │   │   ├── transfers/
│   │   │   ├── valuation/
│   │   │   ├── replenishment/
│   │   │   └── inventory-alerts/
│   │
│   │   ├── suppliers/
│   │   │   ├── supplier-profiles/
│   │   │   ├── contacts/
│   │   │   ├── supplier-products/
│   │   │   ├── price-history/
│   │   │   ├── ratings/
│   │   │   ├── performance/
│   │   │   ├── documents/
│   │   │   ├── disputes/
│   │   │   └── statements/
│   │
│   │   ├── procurement/
│   │   │   ├── rfqs/
│   │   │   ├── rfq-revisions/
│   │   │   ├── rfq-communications/
│   │   │   ├── quotations/
│   │   │   ├── quotation-comparison/
│   │   │   ├── negotiations/
│   │   │   ├── pricing-agreements/
│   │   │   ├── purchase-orders/
│   │   │   ├── purchase-order-revisions/
│   │   │   ├── receiving/
│   │   │   ├── supplier-invoices/
│   │   │   └── supplier-payments/
│   │
│   │   ├── point-of-sale/
│   │   │   ├── sales/
│   │   │   ├── sale-items/
│   │   │   ├── payments/
│   │   │   ├── discounts/
│   │   │   ├── receipts/
│   │   │   ├── cashier-shifts/
│   │   │   ├── cash-reconciliation/
│   │   │   └── batch-selection/
│   │
│   │   ├── customers/
│   │   │   ├── customer-profiles/
│   │   │   ├── customer-history/
│   │   │   └── customer-insights/
│   │
│   │   ├── after-sales/
│   │   │   ├── return-requests/
│   │   │   ├── return-inspections/
│   │   │   ├── refunds/
│   │   │   ├── exchanges/
│   │   │   ├── exchange-reservations/
│   │   │   └── collection-followups/
│   │
│   │   ├── pricing/
│   │   │   ├── selling-prices/
│   │   │   ├── branch-price-overrides/
│   │   │   └── price-history/
│   │
│   │   ├── analytics/
│   │   │   ├── dashboards/
│   │   │   ├── sales-reports/
│   │   │   ├── inventory-reports/
│   │   │   ├── supplier-reports/
│   │   │   ├── branch-comparisons/
│   │   │   └── exports/
│   │
│   │   ├── intelligence/
│   │   │   ├── demand-forecasting/
│   │   │   ├── recommendations/
│   │   │   ├── anomaly-detection/
│   │   │   ├── supplier-scoring/
│   │   │   ├── transfer-recommendations/
│   │   │   ├── model-registry/
│   │   │   └── explanations/
│   │
│   │   ├── notifications/
│   │   │   ├── in-app/
│   │   │   ├── email-notifications/
│   │   │   ├── sms-notifications/
│   │   │   ├── preferences/
│   │   │   ├── escalation/
│   │   │   └── delivery-history/
│   │
│   │   ├── subscriptions/
│   │   │   ├── plans/
│   │   │   ├── trials/
│   │   │   ├── subscriptions/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   ├── entitlements/
│   │   │   ├── usage-limits/
│   │   │   └── renewals/
│   │
│   │   ├── platform-admin/
│   │   │   ├── super-admins/
│   │   │   ├── platform-settings/
│   │   │   ├── business-support/
│   │   │   ├── platform-monitoring/
│   │   │   └── privileged-access/
│   │
│   │   ├── audit/
│   │   │   ├── audit-events/
│   │   │   ├── access-logs/
│   │   │   └── audit-query/
│   │
│   │   ├── integrations/
│   │   │   ├── email/
│   │   │   ├── sms/
│   │   │   ├── chapa/
│   │   │   └── webhooks/
│   │
│   │   └── synchronization/
│   │       ├── sync-sessions/
│   │       ├── sync-operations/
│   │       ├── conflict-resolution/
│   │       └── idempotency/
│   │
│   └── health/
│       ├── health.module.ts
│       ├── health.controller.ts
│       └── readiness.service.ts
│
├── test/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   └── helpers/
│
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json


Important backend design rule
Each major module should have its own responsibilities and internal structure. For example:
inventory/
├── stock-ledger/
│   ├── stock-ledger.module.ts
│   ├── stock-ledger.controller.ts
│   ├── application/
│   │   ├── commands/
│   │   ├── queries/
│   │   └── services/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── policies/
│   │   └── errors/
│   ├── infrastructure/
│   │   ├── repositories/
│   │   └── mappers/
│   ├── dto/
│   └── tests/


Don't force this complexity into every small CRUD feature. Use it for workflows where stock, money, permissions or history are involved.
4. Frontend structure — apps/web
The frontend should use one shared application, with different interfaces based on the user's role and selected business type.
apps/web/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── locales/
│
├── src/
│   ├── main.tsx
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers/
│   │   │   ├── query-provider.tsx
│   │   │   ├── auth-provider.tsx
│   │   │   ├── business-context-provider.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── layouts/
│   │   │   ├── public-layout/
│   │   │   ├── owner-layout/
│   │   │   ├── admin-layout/
│   │   │   ├── manager-layout/
│   │   │   ├── cashier-layout/
│   │   │   └── super-admin-layout/
│   │   ├── route-guards/
│   │   └── navigation/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── data-table/
│   │   ├── charts/
│   │   ├── feedback/
│   │   ├── dialogs/
│   │   └── business-context/
│   │
│   ├── features/
│   │   ├── authentication/
│   │   ├── onboarding/
│   │   ├── business-switcher/
│   │   ├── owner-dashboard/
│   │   ├── business-settings/
│   │   ├── branches/
│   │   ├── employees/
│   │   ├── roles-and-permissions/
│   │   ├── catalog/
│   │   ├── product-import/
│   │   ├── inventory/
│   │   ├── batches-and-expiry/
│   │   ├── stocktaking/
│   │   ├── stock-adjustments/
│   │   ├── transfers/
│   │   ├── suppliers/
│   │   ├── rfq-and-procurement/
│   │   ├── quotations/
│   │   ├── negotiations/
│   │   ├── purchase-orders/
│   │   ├── receiving/
│   │   ├── supplier-payments/
│   │   ├── pos/
│   │   ├── cashier-shifts/
│   │   ├── customers/
│   │   ├── returns-and-refunds/
│   │   ├── exchanges/
│   │   ├── reports/
│   │   ├── analytics/
│   │   ├── ai-insights/
│   │   ├── notifications/
│   │   ├── subscription-and-billing/
│   │   ├── platform-admin/
│   │   └── profile-and-security/
│   │
│   ├── business-types/
│   │   ├── registry.ts
│   │   ├── shared/
│   │   ├── grocery/
│   │   │   ├── product-fields.ts
│   │   │   ├── inventory-rules.ts
│   │   │   ├── dashboard-widgets.ts
│   │   │   └── labels.ts
│   │   ├── fashion/
│   │   │   ├── product-fields.ts
│   │   │   ├── variant-options.ts
│   │   │   ├── dashboard-widgets.ts
│   │   │   └── labels.ts
│   │   ├── pharmacy/
│   │   │   ├── product-fields.ts
│   │   │   ├── batch-expiry-rules.ts
│   │   │   ├── dashboard-widgets.ts
│   │   │   └── labels.ts
│   │   └── cosmetics/
│   │       ├── product-fields.ts
│   │       ├── variant-options.ts
│   │       ├── dashboard-widgets.ts
│   │       └── labels.ts
│   │
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── lib/
│   ├── utils/
│   ├── styles/
│   ├── i18n/
│   ├── types/
│   └── test/
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json


A typical frontend feature should follow:
feature-name/
├── api/
├── components/
├── pages/
├── forms/
├── schemas/
├── hooks/
├── types/
└── index.ts


5. Desktop structure — apps/desktop
The desktop app should reuse the React frontend rather than building a second independent frontend.
apps/desktop/
│
├── electron/
│   ├── main/
│   │   ├── main.ts
│   │   ├── windows/
│   │   ├── menus/
│   │   ├── lifecycle/
│   │   └── security/
│   │
│   ├── preload/
│   │   ├── preload.ts
│   │   └── allowed-channels.ts
│   │
│   ├── ipc/
│   │   ├── handlers/
│   │   └── contracts/
│   │
│   ├── local-database/
│   │   ├── connection.ts
│   │   ├── migrations/
│   │   ├── repositories/
│   │   └── encryption/
│   │
│   ├── sync/
│   │   ├── sync-engine.ts
│   │   ├── outbox/
│   │   ├── retry-policy.ts
│   │   ├── conflict-handlers/
│   │   └── sync-status.ts
│   │
│   ├── devices/
│   │   └── printer/
│   │
│   └── updates/
│
├── renderer/
├── build/
├── resources/
├── electron-builder.yml
├── tsconfig.json
└── package.json


Offline POS must save transactions locally before reporting success. Sync must use unique operation IDs and prevent duplicate sales.
6. Shared packages — packages/
packages/
│
├── contracts/
│   └── src/
│       ├── auth/
│       ├── businesses/
│       ├── branches/
│       ├── catalog/
│       ├── inventory/
│       ├── procurement/
│       ├── pos/
│       ├── after-sales/
│       ├── subscriptions/
│       ├── notifications/
│       └── index.ts
│
├── shared/
│   └── src/
│       ├── constants/
│       ├── enums/
│       ├── money/
│       ├── dates/
│       ├── permissions/
│       ├── business-types/
│       ├── errors/
│       └── index.ts
│
├── ui/
│   └── src/
│       ├── components/
│       ├── tokens/
│       ├── themes/
│       └── index.ts
│
├── config/
│   ├── eslint/
│   ├── typescript/
│   └── prettier/
│
└── offline-core/
    └── src/
        ├── operation-envelope/
        ├── idempotency/
        ├── sync-contracts/
        ├── conflict-types/
        └── index.ts


7. Database structure
database/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── seeds/
│   ├── reference/
│   │   ├── business-types.seed.ts
│   │   ├── permissions.seed.ts
│   │   ├── units.seed.ts
│   │   ├── categories.seed.ts
│   │   └── subscription-plans.seed.ts
│   │
│   ├── demo/
│   │   ├── grocery-demo.seed.ts
│   │   ├── fashion-demo.seed.ts
│   │   ├── pharmacy-demo.seed.ts
│   │   └── cosmetics-demo.seed.ts
│   │
│   └── development/
│
└── diagrams/
    ├── erd/
    ├── tenancy/
    ├── inventory-ledger/
    ├── procurement/
    ├── sales-and-after-sales/
    └── offline-sync/


8. Documentation structure

> The tree below was the original planning target. The delivered Step 2 set consolidates several
> of these files by concern (see ADR D-030); the canonical, current document map is the index in
> `docs/architecture/SYSTEM_ARCHITECTURE.md`. Remaining files in this tree are still planned.

docs/
│
├── product/
│   ├── project-overview.md
│   ├── product-vision.md
│   ├── scope-and-phases.md
│   └── acceptance-criteria.md
│
├── requirements/
│   ├── MASTER_PROJECT_REQUIREMENTS_AND_DECISION_DOCUMENT.md
│   ├── master-requirements.md
│   ├── role-boundaries.md
│   ├── business-type-requirements.md
│   ├── decision-register.md
│   └── REQUIREMENTS_TRACEABILITY_MATRIX.md
│
├── architecture/
│   ├── system-context.md
│   ├── modular-monolith.md
│   ├── module-dependencies.md
│   ├── authorization-model.md
│   ├── tenant-and-branch-isolation.md
│   ├── offline-architecture.md
│   └── adr/
│
├── database/
│   ├── data-dictionary.md
│   ├── erd.md
│   ├── inventory-ledger.md
│   └── migration-policy.md
│
├── api/
│   ├── api-conventions.md
│   ├── endpoint-catalog.md
│   └── openapi/
│
├── ux/
│   ├── navigation-map.md
│   ├── role-based-flows.md
│   ├── design-system.md
│   └── business-type-adaptation.md
│
├── testing/
│   ├── test-strategy.md
│   ├── acceptance-test-cases.md
│   ├── security-test-cases.md
│   └── performance-test-plan.md
│
└── operations/
    ├── local-development.md
    ├── environment-configuration.md
    ├── deployment-runbook.md
    ├── backup-and-restore.md
    ├── monitoring.md
    ├── troubleshooting.md
    ├── release-process.md
    └── handover.md


9. Important architecture rules your IDE assistant must follow
These are more important than the number of folders.
1. One platform, four business types. Grocery, Fashion, Pharmacy and Cosmetics must share the same core modules. Do not create four separate applications.
2. Business isolation. Every business-owned record must be scoped to the correct business. Branch operations must also enforce branch access.
3. Backend authorization. Never rely only on frontend route hiding.
4. Business Admin boundaries. Business Admin handles digital records and software administration only. No physical inspection, receiving, stocktaking, shelf arrangement, physical negotiation or physical disposal.
5. Inventory ledger. Stock changes must be recorded as movements with an audit trail.
6. Financial correctness. Use transactions for sales, receiving, payments, refunds and other money-related operations.
7. AI is advisory. It recommends; authorized humans decide and approve.
8. Offline integrity. Never silently discard offline sales or create duplicate sales during synchronization.
9. Historical preservation. Archive/deactivate records rather than deleting transaction history.
10. No false implementation claims. The IDE assistant must distinguish implemented, incomplete, simulated and planned features.