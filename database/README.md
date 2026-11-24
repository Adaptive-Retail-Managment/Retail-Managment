# Database assets

Prisma schema and migrations live in [`apps/api/prisma`](../apps/api/prisma) because Prisma
resolves its CLI and client relative to the schema directory
([decision D-015](../docs/architecture/ARCHITECTURE_DECISION_RECORDS.md), in the decision records).

This folder is reserved for artifacts that are not part of the API package:

- `seeds/` — reference and demo data (`PROJECT_STRUCTURE.md` layout)
- `diagrams/` — ERDs, tenancy/inventory-ledger diagrams

Nothing here yet; seeds and diagrams arrive with the vertical slices that need them.
