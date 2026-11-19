# Business and branch isolation

**Status: not implemented.** This records the required design so the foundation does not
accidentally make isolation harder.

## Rules

- Every business-owned row carries a business identifier. Operational rows also carry a branch
  identifier where the domain is branch-scoped.
- The authenticated principal resolves to one or more business memberships and branch assignments.
- Backend services build queries from the authenticated scope. Client-supplied business/branch
  identifiers are never trusted by themselves.
- Cross-business or cross-branch access returns 404-style "not found" or 403 consistently, without
  leaking whether the record exists.
- Permission checks run on the backend for every workflow transition, not only on reads.

## Planned enforcement points

1. An authentication guard that establishes a request-scoped principal.
2. A business/branch context guard that validates the selected business and branch against the
   principal's memberships.
3. Repository/service helpers that require the scope object rather than a bare `businessId`.
4. Database-level guardrails for critical append-only tables (composite foreign keys including
   business id) where practical.
5. Integration tests that attempt cross-business and cross-branch reads/writes for each slice.

Until these exist, no business tables should be added, so there is nothing to leak yet.
