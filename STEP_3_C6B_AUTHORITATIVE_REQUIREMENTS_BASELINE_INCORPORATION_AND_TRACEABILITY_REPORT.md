# Step 3 — C-6b Authoritative Requirements Baseline Incorporation and Traceability Report

**Date:** 22 November 2026
**Task:** Incorporate the owner-confirmed Master Project Requirements & Decision Document (MRDD)
as the authoritative requirements baseline and reconcile C-6b.
**Boundary:** Documentation/governance only. No schema, migration, database, seed, application or
Step 4 work.

---

## 1. Original C-6b finding

From `STEP_3_C6B_AUTHORITATIVE_REQUIREMENTS_SOURCE_INVESTIGATION_REPORT.md` (disposition Option D):
no approved Master Requirements document existed in the repository; `master-requirements.md` was
self-declared provisional; the entity catalog referenced requirement sections 4.1–4.12 that
existed in no repository document — proving the approved source lived outside the repo.
`decision-register.md` (D-001–D-015, foundation decisions) was restored byte-identically from Git
HEAD but does not contain business requirements.

## 2. Owner confirmation of the authoritative source

The project owner explicitly confirmed that the supplied document
`Adaptive_Retail_Platform_Master_Requirements_and_Decision_Document.docx` (found in the user's
Downloads folder) is the **finalized, authoritative Master Project Requirements & Decision
Document** — Version 1.0, requirements baseline 18 November 2026. It represents the completed
requirements-finalization process; later confirmed decisions supersede earlier choices.

## 3. Canonical document

**Path:** `docs/requirements/MASTER_PROJECT_REQUIREMENTS_AND_DECISION_DOCUMENT.md`

- Created in the existing `docs/requirements/` directory.
- Contains the **complete verbatim source text** (1,156 extracted lines): title, project name,
  document control, sections 1–30, numbered decision register (decisions 1–190 in five groups),
  grouped finalization decisions (§25), conflicts/supersessions (§26), unresolved technical
  decisions (§27), traceability to supporting documents (§28), change control (§29) and final
  project baseline (§30), ending with `END OF MASTER REQUIREMENTS AND DECISION DOCUMENT`.
- A short **document-control block** was prepended, clearly separated from the source text,
  recording status (owner-confirmed authoritative baseline), authority, scope, the
  Confirmed/Proposed distinction and precedence rules. No source content was summarized,
  rewritten or corrected.
- **Extraction note:** source `.docx` tables were flattened to one cell per line; wording,
  numbering and decisions are unchanged. One extraction artifact (a replacement glyph for an
  em dash in the version line) was rendered as `—`. No requirements were added, removed or
  reinterpreted.

## 4. Source incorporation verification

- All 30 numbered sections present and correctly numbered (§1 Executive Summary … §30 Final
  Project Baseline).
- Decision groups verified present: Decisions 1–31, 32–80, 81–120, 121–160, 161–190.
- Grouped finalizations (§25), supersessions (§26), open technical decisions (§27), supporting-
  document traceability (§28), change control (§29.1 revision history v1.0) and end marker all
  present.
- No U+FFFD/replacement characters remain in the canonical file (verified programmatically).

## 5. Authority and precedence rules (now documented)

1. The MRDD is the **top of the source-of-truth hierarchy** for business requirements and
   confirmed business decisions.
2. Later confirmed decisions supersede earlier choices (MRDD §26); open items in §27 are
   **not** approved.
3. Proposals/recommendations (e.g. §27.1 TDD technology baseline) are not mandatory technology
   decisions until frozen.
4. Architecture (Step 2/ADRs), database (Step 3) and implementation documents explain and
   implement requirements; they must not silently contradict the MRDD (MRDD §28–29).
5. A lower-level technical document cannot override an approved business requirement; changes
   require the §29 change-control process.
6. Subsequent owner decisions outside the MRDD (U-1 Option A, D-025) remain valid and are
   labelled as such in the traceability matrix — they refine, not contradict, the MRDD.

## 6. Legacy document disposition

- **`docs/requirements/master-requirements.md`** — retained in full (all original sections:
  Architecture, Data protection and access, Inventory and money, Intelligence, Offline POS,
  Implementation honesty). An authority banner was added identifying the MRDD as authoritative
  and demoting this file to a **legacy working reference**. Its "superseded when approved
  documents arrive" statement now points to the MRDD. It no longer claims provisional authority.
- **`docs/requirements/decision-register.md`** — **unmodified**. Verified byte-identical to Git
  HEAD blob `db97f416f9362611d111f38fe76ac3def5a924f9` (D-001–D-015 intact). It remains the
  technical/foundation decision register; business requirements were not merged into it.
- **`docs/product/scope-and-phases.md`** — phases remain labelled sequencing proposals; reference
  updated to cite the MRDD (§23) as the approved baseline.
- **`PROJECT_STRUCTURE.md`** — requirements tree updated to list the new canonical file and the
  traceability matrix.
- **`README.md`** — requirements link updated to point to the MRDD first.
- **`docs/architecture/SYSTEM_ARCHITECTURE.md`** — source-of-truth pointer updated to the MRDD.

## 7. Traceability matrix

**Location:** `docs/requirements/REQUIREMENTS_TRACEABILITY_MATRIX.md`

38 requirement rows (TR-01–TR-38) covering every mandated area: multi-business SaaS tenancy,
registration/ownership, roles/permissions, branches, catalog/variants, inventory/stock
integrity, procurement/suppliers, sales/POS, returns/exchanges, offline POS, D-025, payment
verification/webhook idempotency, auditability/historical preservation, U-1 Option A,
reporting, AI advisory, notifications, security, Super Admin, files, and tenant isolation.
Each row records requirement ID, concise requirement, exact MRDD source section, database
entities, constraints, enforcement layer, status and gaps. Untraceable items are explicitly
classified (technical decision / requirement-derived / team decision) — none were silently
promoted to baseline requirements.

## 8. Obsolete-reference corrections

- `DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md` §1 method text and §2 traceability table:
  legacy `4.1`–`4.12` labels (which matched no real document) replaced with real MRDD section
  references (§3–4, §5, §6, §7–8, §9–11, §12, §13, §14–15, §16–17, §18 + D-025, cross-cutting).
- `SYSTEM_ARCHITECTURE.md`, `scope-and-phases.md`, `README.md`: "requirements absent/provisional"
  wording replaced with MRDD authority.
- No other database document contained stale requirements-source references (verified by
  repository-wide grep for `master-requirements`, `requirements/`, `4.x` section patterns).

## 9. D-025 and U-1 verification

- **D-025 strict offline rejection:** unchanged. MRDD §18 requires durable queue, idempotency,
  backend validation and no silent discard; D-025 (owner decision, documented in ADRs) adds
  strict rejection with no partial acceptance. Schema models `ReconciliationException`,
  `ReconciliationShortfallLine`, `ReconciliationEvent`, `ConflictRecord` preserve full payloads.
  No weakening introduced.
- **U-1 Option A:** unchanged and verified in schema — `GoodsReceipt.purchaseOrder` relation at
  `apps/api/prisma/schema.prisma:2917` uses composite FK
  `[businessId, purchaseOrderId, branchId]` → `[businessId, id, branchId]` with
  `onDelete: Restrict, onUpdate: NoAction`. Same-branch receiving is DB-enforced; PO destination
  changes require the documented authorized revision path.

## 10. Files modified and reasons

| File | Reason |
| ---- | ------ |
| `docs/requirements/MASTER_PROJECT_REQUIREMENTS_AND_DECISION_DOCUMENT.md` | **Created** — canonical authoritative baseline (verbatim source + separated control note) |
| `docs/requirements/master-requirements.md` | Authority banner + demotion to legacy reference; content preserved |
| `docs/requirements/REQUIREMENTS_TRACEABILITY_MATRIX.md` | **Created** — TR-01–TR-38 reconciliation matrix |
| `docs/database/DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md` | Obsolete 4.x references → real MRDD sections; authority preamble |
| `docs/architecture/SYSTEM_ARCHITECTURE.md` | Source-of-truth pointer → MRDD |
| `docs/product/scope-and-phases.md` | Approved-baseline reference → MRDD §23 |
| `README.md` | Requirements link → MRDD |
| `PROJECT_STRUCTURE.md` | Directory listing updated |

## 11. Files deliberately not modified

- `apps/api/prisma/schema.prisma` — no schema change needed; traceability confirmed existing
  design already implements the requirements.
- `docs/requirements/decision-register.md` — preserved byte-identical (verified hash).
- All companion SQL, migrations directory, application code (apps/api src, web, desktop) —
  untouched.
- ADRs (`ARCHITECTURE_DECISION_RECORDS.md`) — already consistent; U-1/D-025 remain owner
  decisions, not conflated with MRDD baseline.
- Other Step 3 reports — historical records left as-is; this report supersedes their C-6b status.

## 12. Git status preservation

- Initial status recorded before changes; all pre-existing uncommitted work (modified
  CONTRIBUTING.md, PROJECT_STRUCTURE.md, README.md, schema.prisma, database/README.md; deleted
  legacy docs; untracked Step 2/3 docs) preserved.
- No staging, no commits, no pushes, no history rewrites.
- `decision-register.md` shows `M` in status only due to stat/line-ending noise from the earlier
  restore — `git diff` is empty and `git hash-object` = HEAD blob.

## 13. Boundary verification

- No migration generated or applied; `prisma migrate` never run.
- No PostgreSQL/shadow database contacted; no tables created or modified.
- No seeds created; no application/frontend/backend code changed.
- No Step 4 / Stage A work begun.
- No approved business decisions reopened or changed; no requirements invented.
- Formatting: Prettier applied to the two new/edited working docs; the MRDD and
  `decision-register.md` intentionally left unformatted to preserve verbatim source fidelity
  (formatting is not evidence of correctness).

## 14. Final C-6b disposition: **RESOLVED**

All closure conditions met: complete authoritative source incorporated verbatim; authority
explicitly documented; provisional ambiguity removed; database references reconciled to real
MRDD sections; traceability review complete (TR-01–TR-38); no fabricated approvals or
requirements introduced.

**C-6a remains OPEN** — unchanged; still no genuine four-member contribution evidence (single
Git author, single commit, work uncommitted). The prospective contribution-evidence plan from
`STEP_3_FINAL_GOVERNANCE_AND_TENANCY_RECONCILIATION_REPORT.md` stands.

**Step 3 status:** with C-6b resolved, the only remaining open governance item is C-6a.
Stage A (migration preparation) still requires separate explicit owner authorization.
