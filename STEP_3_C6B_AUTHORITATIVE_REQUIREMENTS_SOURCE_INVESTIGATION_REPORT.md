# Step 3 — C-6b authoritative master requirements source investigation report

**Scope:** read-only investigation. No files modified except this report. Git history inspected;
nothing restored, renamed or overwritten.

## Executive conclusion

**Disposition: Option D — No suitable authoritative source found. C-6b remains OPEN.**

The repository contains **no approved Master Requirements and Decision Document**. The only
requirements-bearing documents are self-declared provisional or explicitly non-authoritative.
Git history cannot help: the repository has exactly **one commit** (`a356aad`, foundation) and
no other branches, tags or stashes — there is no historical version of an approved requirements
document to recover.

## Candidate requirements documents discovered

| Path                                                        | Title/purpose                                            | Approval status                                                                     | Completeness                                        | Verdict                                               |
| ----------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| `docs/requirements/master-requirements.md`                  | "Binding constraints (provisional baseline)"             | **Self-declared provisional** — "superseded when the approved documents are added"  | ~15 constraint bullets; no 4.1–4.12 functional spec | **B — working baseline, not approved**                |
| `docs/product/scope-and-phases.md`                          | Product shape + phase sequencing                         | Explicitly "sequencing proposals, not approved requirements"                        | High-level scope only                               | **D-adjacent — proposal, not baseline**               |
| `docs/requirements/decision-register.md`                    | Foundation decisions D-001–D-015                         | Restored from HEAD; governs toolchain/architecture foundation only                  | No business requirements                            | **C — technical decision register**                   |
| `docs/architecture/ARCHITECTURE_DECISION_RECORDS.md`        | ADRs D-001–D-034 (incl. D-016–D-034 Step 2 architecture) | Mix of Constrained/Accepted/Approved/Provisional                                    | Architecture decisions, not requirements            | **C — design authority, not requirements**            |
| `PROJECT_STRUCTURE.md`, `README.md`                         | Folder/design overview                                   | Foundation docs                                                                     | No requirements detail                              | Not candidates                                        |
| `docs/database/DATABASE_REQUIREMENTS_AND_ENTITY_CATALOG.md` | Entity catalog mapped to "4.1–4.12"                      | References a requirements numbering **that does not exist in any present document** | Traceability target absent                          | Evidence the approved source existed outside the repo |

## Git history findings

- `git log --all`: single commit `a356aad chore: initialize project foundation`
  (author Bruktawit, 2026-11-19). `git branch -a`: only `main` + `origin/main`. No tags, no
  stashes.
- `git ls-tree -r HEAD`: under `docs/requirements/` only `decision-register.md` existed at
  foundation; `master-requirements.md` and all Step 2/3 docs are **untracked** — authored
  locally after the foundation commit.
- Conclusion: **no historical requirements document exists in Git.** Nothing recoverable.

## Approval evidence

None found for any requirements document. No advisor sign-off, approval date, version stamp or
approving-authority record exists in any inspected file. The catalog's "4.1–4.12" section
numbering implies an external approved requirements document (sections 4.1–4.12) that was never
committed to this repository.

## Requirements completeness assessment (against investigation categories)

Coverage exists only via **technical decisions**, not an approved requirements baseline:
multi-tenant SaaS (D-019), roles/Admin-digital-only (D-027), offline/D-025, AI-advisory
(D-014/D-033), REST (D-018), Chapa payments (D-032 provisional). Functional detail for catalog,
procurement, POS, returns, subscriptions, reporting, NFRs is **not verifiable** against an
approved source — the schema encodes a best-faith interpretation recorded in
`master-requirements.md`.

## D-025 and U-1 traceability

- **D-025** (strict offline stock protection): `ARCHITECTURE_DECISION_RECORDS.md` marks it
  **Approved** — a subsequent owner/architecture decision, traceable as such.
- **U-1 Option A** (same-branch receiving): approved owner decision recorded in the U-1 reports
  and `LOGICAL_DATABASE_DESIGN.md` §7 — again a subsequent owner decision, not a baseline
  requirement.
- Both are legitimately traceable **as owner decisions**; they do not substitute for the missing
  requirements baseline.

## D-001–D-015 register relationship

`decision-register.md` governs **foundation/toolchain decisions** (pnpm, NestJS, Prisma, Jest,
Electron, schema location, etc.). It contains no business requirements and does not conflict with
`ARCHITECTURE_DECISION_RECORDS.md` (which extends the same numbering D-016+). It should remain a
**separate technical decision register** — business requirements and technical decisions must not
be merged.

## Recommended source-of-truth hierarchy (subject to owner approval)

1. **Approved Master Requirements and Decision Document** — business baseline (MISSING)
2. **Owner decisions / amendments** — D-025, U-1 Option A, C-series dispositions
3. **Architecture & ADRs** — `docs/architecture/*`
4. **Database design** — `docs/database/*` + `schema.prisma`
5. **Implementation specs/tests** — module docs, validation matrices
6. **Completion/verification reports** — `STEP_*` files

Conflict rule: a lower tier never silently overrides tier 1–2; conflicts escalate to the owner.

## Exact unresolved issues / owner action required

1. **Owner must supply the approved Master Requirements and Decision Document** (the source of
   the 4.1–4.12 numbering) — as a file in the repo or an referenced external baseline.
2. Until then, `master-requirements.md` remains the _interim_ baseline and every requirement
   claim stays "provisional".
3. Optionally: formally designate `master-requirements.md` as interim authority via owner note.

## Can C-6b legitimately be closed?

**No.** No verified authoritative source exists and no approval evidence is present. C-6b stays
**OPEN** until the owner provides or designates the requirements baseline.

**STOP** — awaiting project-owner review.
