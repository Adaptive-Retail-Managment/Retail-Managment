# Binding constraints (provisional baseline)

The approved master requirements, role-boundary, business-type and decision documents were
**not present in the repository** when the foundation was built. The only available document was
`PROJECT_STRUCTURE.md`. Rather than invent requirements, this file records the constraints
supplied directly with the project brief. It is superseded when the approved documents are added.

## Architecture

- Modular monolith. No microservices. Clear module boundaries, no circular dependencies.
- One shared platform configured for four business types; no duplicated applications.

## Data protection and access

- Business and branch isolation enforced in backend services and database queries.
- Permissions enforced on the backend, not only by hiding UI routes.
- Business Admin is a digital administration role: no physical operational permissions
  (receiving, stocktaking, shelf arrangement, physical inspection/negotiation/disposal).
- Historical and financial records are preserved; archive/deactivate instead of deleting.

## Inventory and money

- Inventory changes only through explicit workflows, recorded as movements with an audit trail.
- Negative inventory is never permitted.
- A purchase order does not increase stock; only accepted receiving does.
- Sales, receiving, payments, refunds and other financial operations use transactions and
  concurrency controls.

## Intelligence

- AI recommendations are advisory. They never approve or execute operational actions; an
  authorized human decides.

## Offline POS

- Save locally before reporting success.
- Synchronize idempotently with unique operation IDs; never create duplicate sales.
- Failed or conflicting offline transactions are surfaced for resolution, never silently dropped.

## Implementation honesty

- Do not claim a feature, test, migration or deployment works unless implemented and verified.
- Distinguish implemented, incomplete, simulated and planned work in reports and documentation.
