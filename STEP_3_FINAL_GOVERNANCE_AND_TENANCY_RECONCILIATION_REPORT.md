# Step 3 — Final governance and tenancy documentation reconciliation report

**Scope:** documentation/governance reconciliation only. No schema, migration, database, seed or
application changes. Status per item below.

## 1. C-6a — Four-member contribution evidence: **OPEN** (prospective plan provided)

### Evidence inspected

- `git log --all`: exactly **one commit** (`a356aad chore: initialize project foundation`,
  author `Bruktawit <bruktawit874@gmail.com>`, 2026-11-19) on `main`; `origin/main` exists; no
  other branches, no stashes, no PRs accessible locally.
- `git status`: all Step 2/3 work (architecture docs, `docs/database/`, all `STEP_*` reports,
  the entire 4,243-line `schema.prisma`) is **uncommitted** in the working tree.
- No per-member authorship, review records, or contribution logs exist anywhere in the repo.

### Findings

- **Verified historical contributions:** only the foundation commit by one author. Nothing else
  is attributable.
- **Uncommitted work:** effectively the entire Step 2 + Step 3 deliverable — cannot be
  attributed to individual members from Git evidence.
- **Cannot yet be attributed:** all schema, documentation and report authorship.
- Per the agreed arrangement (M1/M2 on Computer 1, M3/M4 on Computer 2), shared working
  directories make retrospective attribution impossible without fabrication — which is
  prohibited and was not done.

### Prospective contribution-evidence plan (recommended, not executed)

1. Each member uses an **individual GitHub account**; no shared credentials.
2. Work proceeds on **individual branches** (`m1/platform`, `m2/catalog`, etc.) even when two
   members share a computer — separate clones or `git worktree` per member.
3. **Genuine commits** per module ownership (M1 platform/SaaS, M2 config/catalog, M3
   inventory/procurement, M4 sales/intelligence) — commit authorship is the evidence.
4. **Pull requests with peer review** for every module slice; reviews recorded on GitHub.
5. **Contribution record for shared-computer work:** a `CONTRIBUTIONS.md` (or PR description
   template) where each member lists the commits/PRs they authored; collaborative sessions are
   recorded as joint commits with both authors or split into per-member commits — never a single
   shared identity.
6. Step 3 retroactive attribution: members self-declare module ownership of specific files in a
   reviewed `docs/team/` contribution record, signed off by peers — honest labeling as
   _declared_ contribution, distinct from _verified_ Git authorship.

## 2. C-6b — Authoritative requirements source: **OPEN** (path to closure identified)

### `decision-register.md` Git-history findings

- The file **exists in HEAD** (`a356aad`) with verified content: foundation decisions
  **D-001 through D-015** (toolchain, modular monolith, AI-advisory, Prisma location, etc.).
- It is **deleted in the working tree** — an uncommitted deletion, almost certainly accidental
  (it was listed as `D` in `git status` before this task; no report records an intentional
  removal).
- It contains **no business requirements** — its own "Missing inputs" section states the approved
  requirements/role-boundary/business-type documents were absent when it was written.

### Source-of-truth hierarchy (recommended)

| Tier                       | Document                                                                    | Status                                                                                                               |
| -------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1 — Requirements authority | Approved Master Requirements and Decision Document (4.1–4.12)               | **ABSENT** — `master-requirements.md` is explicitly provisional ("superseded when the approved documents are added") |
| 2 — Architecture authority | `docs/architecture/*` incl. `ARCHITECTURE_DECISION_RECORDS.md` (D-025 etc.) | Present, uncommitted                                                                                                 |
| 3 — Foundation decisions   | `docs/requirements/decision-register.md` (D-001–D-015)                      | Present in HEAD; **deleted in working tree — recommend restore via `git checkout`**                                  |
| 4 — Database design        | `docs/database/*` + schema                                                  | Present, uncommitted                                                                                                 |

### Required outcome

- **Restore `decision-register.md`** from HEAD — safe, verified, preserves traceability. Not done
  here because file restoration was outside the authorized file list; owner authorization
  requested.
- The **approved Master Requirements and Decision Document remains missing** — C-6b cannot be
  marked complete until the owner supplies it or formally designates an alternative authority.
  `master-requirements.md` may serve as interim baseline but is self-declared provisional.

## 3. NotificationPreference — tenancy classification: **PASS**

### Schema inspection (`schema.prisma`)

```prisma
model NotificationPreference {
  id        String              @id @default(uuid(7)) @db.Uuid
  userId    String              @db.Uuid
  channel   NotificationChannel
  category  String              @db.VarChar(60)
  isEnabled Boolean             @default(true)
  user      User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, channel, category])
}
```

No `businessId`, no `branchId`, no tenant-derived parent. It is a **global user-scoped
preference**: channel/category opt-outs belong to the person across all their businesses.

### Documentation update

`MULTI_TENANT_DATABASE_DESIGN.md` §2 "Global tables" bullet rewritten: replaced the incomplete
example list (which wrongly included tenant-derived `ForecastPoint`) with three accurate groups —
platform catalogue, global user infrastructure, and user-owned cross-tenant preferences — with
`NotificationPreference` explicitly classified, its ownership/population/query rules stated, and
the conclusion that it is a legitimate exception, not a tenant-integrity concern. No schema
change made or needed.

## 4. Files modified

| Path                                                           | Change                                                                                              |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `docs/database/MULTI_TENANT_DATABASE_DESIGN.md`                | §2 global-tables classification corrected and completed (NotificationPreference + full enumeration) |
| `STEP_3_FINAL_GOVERNANCE_AND_TENANCY_RECONCILIATION_REPORT.md` | This report                                                                                         |

## 5. Validation results

- `decision-register.md` HEAD content verified via `git show` (D-001–D-015, 28 lines).
- Git history/branches/stash inspected — single commit, single author, no other refs.
- `NotificationPreference` model re-read from schema — classification matches fields/relations.
- Prettier applied to the modified doc; no other files touched.

## 6. Remaining OPEN / NOT VERIFIED items

- **C-6a: OPEN** — prospective plan documented; requires owner-mandated process going forward.
- **C-6b: OPEN** — `decision-register.md` restoration recommended (verified safe); approved Master
  Requirements and Decision Document still absent — owner must supply or designate authority.
- All Step 3 runtime validations remain pending (unchanged).

## 7. Disposition summary

| Item                                  | Status                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------- |
| NotificationPreference classification | **RESOLVED** — documented, verified against schema                         |
| C-6a contribution evidence            | **OPEN** — evidence insufficient; prospective plan provided                |
| C-6b requirements governance          | **OPEN** — restoration path identified; authoritative source still missing |

**STOP** — awaiting project-owner review.
