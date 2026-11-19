# Modular monolith

## Shape

One NestJS application (`apps/api`), one PostgreSQL database, one React application reused by
browser and Electron. No microservices, no per-module databases, no network calls between
business modules.

## Module rules

1. A module owns its tables and exposes application services. Other modules never import its
   repositories, Prisma models or internal DTOs.
2. Dependencies point in one direction: presentation → application → domain → infrastructure of
   the **same** module. Shared code lives in narrow, dependency-free helpers.
3. Circular module dependencies are forbidden. When two modules genuinely interact, one side
   publishes an event or defines a port implemented by the other.
4. The Prisma client is injected from the global `DatabaseModule`; each module still scopes every
   query by business/branch itself until a tenant-aware access layer exists.
5. Heavy DDD structure (entities, value objects, policies) is used only for workflows involving
   stock, money, permissions or history. Small CRUD modules stay small.

## Placement

```
apps/api/src/
  config/         validated environment
  database/       PrismaService + database health (global)
  health/         liveness/readiness probes
  common/         guards, filters, interceptors (added when first needed)
  modules/<area>/ <sub-area>/ application | domain | infrastructure | dto | tests
```

`modules/` is intentionally absent in Phase 0. It appears with the first vertical slice.

## Runtime topology

```
Browser ─┐
         ├─ Vite/static host ── HTTP ── Nest API ── Prisma ── PostgreSQL
Electron ┘                              (one process)
```

The Electron main process never talks to PostgreSQL directly; offline storage will be a local
SQLite database owned by the desktop app and synchronized through the API.

## Enforcement status

- **Now:** single deployable, reviewed dependency direction, shared config; no cross-module imports
  exist yet.
- **Planned:** an automated boundary check (dependency-cruiser or eslint-plugin-boundaries) once the
  first two business modules exist, because a rule that is not checked is not enforced.

## Explicit non-goals

- Microservices, message brokers and per-module deployments.
- A shared "god" domain package; shared packages are limited to contracts, constants, UI tokens,
  offline primitives and configuration.
