# Genauly docs index

A map of everything in `docs/`, so a new session (or a new person) knows where to start and which
documents are live vs. historical. **Start with `PROJECT_STATUS.md` → its `## Resume here` section.**

_Last reviewed: 2026-07-06 (token-efficiency: split `PROJECT_STATUS.md` (had grown to 1,624 lines) into
the lean living status doc, a new `PROJECT_REFERENCE.md`, and the append-only archive). Prior 2026-07-05:
split `DECISIONS.md` out of `CLAUDE.md`, rotated the two big logs into `archive/`, moved four completed
plans to `archive/`._

## Folder structure

```
docs/
  README.md                 this index
  PROJECT_STATUS.md         live status + decisions + "Resume here" (start here)
  PROJECT_REFERENCE.md      stable reference: backlog, model guidance, research findings
  SESSION_PROMPT_LOG.md     append-only authorship trail

  strategy/    business, product, governance, and security research (advisory, current)
  plans/       engineering plans and runbooks (active + shipped design records)
  archive/     superseded / historical plans + the session-log archive (status-log/ + prompt-log/, both by ISO week)
  reference/   source material and binaries (playbook, decks, PDFs, raw logs)
```

The three files at the root are the ones you touch every session. Everything else is grouped by
purpose. **Note on old paths:** documents were flat until 2026-07-03. Historical entries in
`SESSION_PROMPT_LOG.md` and `archive/PROJECT_STATUS_ARCHIVE.md` still name the pre-reorg flat paths
(e.g. `docs/EXPANSION_PLAN.md`); those are left as written (append-only history). This index is the
authoritative current location of every file.

## Root — start here (live)

| File | What it is | Status |
|---|---|---|
| **`PROJECT_STATUS.md`** | The lean re-orientation point: current status, locked decisions, and the authoritative **"Resume here"** handoff (two most recent sessions). Split in s70; kept under ~250 lines. | 🟢 Live, read first |
| **`PROJECT_REFERENCE.md`** | Stable, low-churn reference consulted on demand: the founder backlog, product-evaluation findings, per-session model guidance, and reusable research findings. Split out of `PROJECT_STATUS.md` in s70. | 🟢 Live |
| `SESSION_PROMPT_LOG.md` | Append-only paper trail of every founder prompt + response (authorship record for a possible copyright filing). Live file holds session 50+ and rotates at ~1,200 lines; older entries archived by ISO week in `archive/prompt-log/`. | 🟢 Live; append every session |
| `DECISIONS.md` | The "why" behind locked decisions (UX-overhaul phase history, mobile-bar mechanism/mockup detail). Split out of `CLAUDE.md` so that file stays lean; read before undoing a "locked" rule. | 🟢 Live |
| `../CLAUDE.md` (repo root) | Developer/agent operating instructions, conventions, and locked designs. Authoritative for the mobile bottom bar and content conventions. | 🟢 Live |

## `strategy/` — business, product, governance (advisory, current)

| File | What it is | Status |
|---|---|---|
| `strategy/AI_PRODUCT_STRATEGY.md` | Research-backed AI feature playbook (rev 3, June 2026). Dated, cited, confidence-flagged. | 🟢 Current |
| `strategy/BUSINESS_PLAN.md` | Business case, market sizing, competitive landscape, unit economics. | 🟢 Current (v1.1) |
| `strategy/CERTIFICATION_RESEARCH.md` | EU AI Act risk-class + ISO/SOC-2 certification research (backlog #19). | 🟢 Current |
| `strategy/DATA_GOVERNANCE.md` | Content provenance & licensing policy (traceability-over-ownership, license allowlist, four-eyes). | 🟢 Current (v0.5) |
| `strategy/PRODUCT_EVALUATION.md` | Self-assessment of Genauly against the learning-science playbook (7-dimension scorecard + recommendations). | 🟢 Current (2026-07-03) |
| `strategy/SECURITY.md` | Security posture summary + founder action items. Full audit in `reference/SECURITY_AUDIT_PLAN.pdf`. | 🟢 Current |

## `plans/` — engineering plans & runbooks

| File | What it is | Status |
|---|---|---|
| `plans/LEARNING_ENGINE_PLAN.md` | Phased plan for backlog #26–#30 (latency capture, guess-first, voice variety, FSRS, speaking block, custom decks). Phases 0, 1, 3 shipped; Phase 2 (speaking block) + optional Phase 1.5 pending. | 🟡 Partially shipped (active) |
| `plans/PHASE2_SETUP.md` | Founder checklist/runbook to switch on the Supabase backend. | 🟢 Live runbook |

## `archive/` — historical / superseded

| File | What it is | Status |
|---|---|---|
| `archive/PROJECT_STATUS_ARCHIVE.md` | **Index only** (since s70): maps to the weekly chunks in `archive/status-log/`. | 🗄 Archive |
| `archive/status-log/` | Session logs chunked by **ISO week** (`PROJECT_STATUS_ARCHIVE_YYYY-Www.md`, sessions 1–71 across W23–W28) plus an `ops-notes` file for undated material, so a lookup loads only one week. Split from the flat archive in s70. | 🗄 Archive |
| `archive/prompt-log/` | Prompt-log entries 1–109 (sessions 26–49), split by **ISO week** (`SESSION_PROMPT_LOG_YYYY-Www.md` + a `README.md` index) so a lookup loads only one week. Append-only history; left as written. | 🗄 Archive |
| `archive/UX_OVERHAUL_PLAN.md` | Session-first redesign (s46). All phases 0–5 shipped. | ✅ Complete (archived s55) |
| `archive/TAXONOMY_REDESIGN.md` | Faceted taxonomy strategy deck, "what/why" (slides in `reference/TAXONOMY_REDESIGN.pptx`). | ✅ Implemented (archived s55) |
| `archive/TAXONOMY_IMPLEMENTATION_PLAN.md` | The staged "how" for the taxonomy. Phases 0–4 shipped. | ✅ Complete (archived s55) |
| `archive/FILTER_HARMONIZATION_PLAN.md` | Unified browse toolbar across pages (s45). | ✅ Implemented (archived s55) |
| `archive/EXPANSION_PLAN.md` | Original Phase 1 (content/grammar/quizzes) + Phase 2 (Supabase/AI) plan. Both shipped. | ✅ Historical |
| `archive/IMPLEMENTATION_PLAN.md` | The from-scratch build plan (repo was empty at the time). | ✅ Historical |
| `archive/MOBILE_APP_PLAN.md` | Mobile redesign (iOS meta tags + bottom bar + density). All 3 layers shipped; bar now locked in `CLAUDE.md`. | ✅ Historical |
| `archive/DESIGN_PREVIEWS.md` | Index of HTML nav mockups in `preview/`. The nav decision is resolved (locked s26–28). | ✅ Historical + how-to |

## `reference/` — source material & binaries

| File | What it is | Status |
|---|---|---|
| `reference/Language Learning App Success Factors.docx` | Uploaded learning-app playbook (the authoritative original); cited by the strategy/plans docs. Readable transcription alongside. | 📎 Reference (binary) |
| `reference/LANGUAGE_LEARNING_SUCCESS_FACTORS.md` | Readable text+table transcription of the `.docx` playbook (auto-extracted 2026-07-03). | 🟢 Reference |
| `reference/SECURITY_AUDIT_PLAN.pdf` | Full security audit + remediation plan behind `strategy/SECURITY.md`. | 📎 Reference (binary) |
| `reference/TAXONOMY_REDESIGN.pptx` | Slide version of the taxonomy deck. | 📎 Reference (binary) |
| `reference/prompt-log-raw.jsonl` | Raw prompt capture from the old `UserPromptSubmit` auto-logging hook (removed 2026-06-25). **Frozen/superseded** by `SESSION_PROMPT_LOG.md`; a historical raw artifact, not maintained. | 🧊 Frozen |

## Documentation best practices

Adopted 2026-07-03 from the docs audit. These are the rules that keep this folder trustworthy; every
failure the audit found traces back to one of them being skipped.

**1. One source per number; cite counts "as of <date>".** Every stale fact the audit found was a
hand-copied content count duplicated across files (769/809/1073 vs the real 1,111 provenance rows).
Content counts (words, collocations, redemittel, provenance rows, draft/verified split) drift fast:
re-verify against `src/data/*` (or `pnpm lint:content` output) before quoting them anywhere
load-bearing, and always date them. Better still, link to one canonical place instead of re-typing.
Candidate improvement (not yet built): have `lint:content` emit a generated `CONTENT_STATS.md` that
other docs link to, so counts cannot go stale.

**2. Shipping a plan includes flipping its header.** When a plan doc's work merges, the FIRST edit
is the status line at the top of the file, not just a phase bullet in the body. Four docs were
caught with "not yet implemented" headers over shipped work; a reader who trusts headers must never
be misled.

**3. `PROJECT_STATUS.md` has a size budget (tightened s70).** Keep only the **two most recent** session
handoffs in the live file; when you append a new one, move the now-third-oldest into the current ISO-week
chunk under `archive/status-log/` (create the week file + add a row to the index
`archive/PROJECT_STATUS_ARCHIVE.md` if the week doesn't exist yet). Target under ~250 lines. Stable reference material (backlog,
model guidance, research findings) belongs in `PROJECT_REFERENCE.md`, not the status file. Exactly ONE
"Resume here" section (at the end) is authoritative; never add a second inline resume pointer.

**4. The two logs have different jobs; don't duplicate.** `SESSION_PROMPT_LOG.md` is the
append-only authorship trail (verbatim prompts, never edited: it is the copyright evidence).
`PROJECT_STATUS.md` holds current state and decisions, with short session notes that may link into
the prompt log rather than re-narrating it.

**5. No session-branch names in durable prose.** Working branches are reassigned every session;
`main` is always the source of truth. Say that once; never write a `claude/...` branch name into a
doc as if it were permanent (three stale ones were found).

**6. The standing governance debt is draft → verified.** ~98% of provenance rows are AI-drafted,
not human-verified. The audit-ready and investor claims rest on the four-eyes pass, so chip at
`draft → verified` in per-theme batches whenever content work happens (see
`strategy/DATA_GOVERNANCE.md`).

**7. Keep the disciplines that already work.** The append-only prompt log, the content linter as a
CI gate, the no-em-dash writing rule (see `CLAUDE.md`), dated + confidence-flagged research docs,
and honest self-critique in plans. Do not lose these under growth pressure.

**8. Put new docs in the right folder, and update this index.** `strategy/` for business/product/
governance research, `plans/` for engineering plans and runbooks, `reference/` for binaries and
source material, `archive/` when a plan is fully superseded. Every new doc gets a row here with an
honest status emoji, and this file's "Last reviewed" line is bumped whenever the folder shape
changes.

Mechanical conventions:

- New plan docs follow the house shape: status header (with date), provenance line, guardrails
  note, phased sections, per-phase verification, and a model recommendation per phase.
- When you move or rename a doc, update the live references (CLAUDE.md, other live docs, any `src/`
  code comments) but leave append-only history (`SESSION_PROMPT_LOG.md`, `archive/`) as written.
