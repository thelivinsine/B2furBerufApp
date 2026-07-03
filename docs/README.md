# Genauly docs index

A map of everything in `docs/`, so a new session (or a new person) knows where to start and which
documents are live vs. historical. **Start with `PROJECT_STATUS.md` → its `## Resume here` section.**

_Last reviewed: 2026-07-03 (docs audit)._

## Start here (live status & policy)

| Doc | What it is | Status |
|---|---|---|
| **`PROJECT_STATUS.md`** | The single re-orientation point: current status, locked decisions, backlog, model guidance, and the authoritative **"Resume here"** handoff. | 🟢 Live, read first |
| `PROJECT_STATUS_ARCHIVE.md` | Detailed session-by-session logs for sessions 4–40 + 24, split out of the status file to keep it navigable. | 🟢 Live archive |
| `SESSION_PROMPT_LOG.md` | Append-only paper trail of every founder prompt + response (authorship record for a possible copyright filing). | 🟢 Live; append every session |
| `../CLAUDE.md` (repo root) | Developer/agent operating instructions, conventions, and locked designs. Authoritative for the mobile bottom bar and content conventions. | 🟢 Live |

## Strategy & research (advisory, evergreen)

| Doc | What it is | Status |
|---|---|---|
| `AI_PRODUCT_STRATEGY.md` | Research-backed AI feature playbook (rev 3, June 2026). Dated, cited, confidence-flagged. | 🟢 Current |
| `BUSINESS_PLAN.md` | Business case, market sizing, competitive landscape, unit economics. | 🟢 Current (v1.1) |
| `CERTIFICATION_RESEARCH.md` | EU AI Act risk-class + ISO/SOC-2 certification research (backlog #19). | 🟢 Current |
| `DATA_GOVERNANCE.md` | Content provenance & licensing policy (traceability-over-ownership, license allowlist, four-eyes). | 🟢 Current (v0.5) |
| `SECURITY.md` | Security posture summary + founder action items. Full audit in `SECURITY_AUDIT_PLAN.pdf`. | 🟢 Current |

## Plans (mostly shipped, kept as the design record)

| Doc | What it is | Status |
|---|---|---|
| `UX_OVERHAUL_PLAN.md` | Session-first redesign (s46). All phases 0–5 shipped. | ✅ Complete |
| `TAXONOMY_REDESIGN.md` (+ `.pptx`) | Faceted taxonomy strategy deck (the "what/why"). | ✅ Implemented |
| `TAXONOMY_IMPLEMENTATION_PLAN.md` | The staged "how" for the taxonomy. Phases 0–4 shipped. | ✅ Complete |
| `FILTER_HARMONIZATION_PLAN.md` | Unified browse toolbar across pages (s45). | ✅ Implemented |
| `MOBILE_APP_PLAN.md` | Mobile redesign (iOS meta tags + bottom bar + density). All 3 layers shipped; bar now locked in `CLAUDE.md`. | ✅ Historical |
| `EXPANSION_PLAN.md` | Original Phase 1 (content/grammar/quizzes) + Phase 2 (Supabase/AI) plan. Both live. | ✅ Historical |
| `IMPLEMENTATION_PLAN.md` | The from-scratch build plan (repo was empty at the time). | ✅ Historical archive |
| `PHASE2_SETUP.md` | Founder checklist/runbook to switch on the Supabase backend. | 🟢 Live runbook |
| `DESIGN_PREVIEWS.md` | Index of HTML nav mockups in `preview/`. The nav decision is resolved (locked s26–28). | ✅ Historical + how-to |

## Reference material / raw artifacts

| File | What it is | Status |
|---|---|---|
| `Language Learning App Success Factors.docx` | Uploaded learning-app playbook; cited by the UX/AI/filter docs. | 📎 Reference (binary) |
| `SECURITY_AUDIT_PLAN.pdf` | Full security audit + remediation plan behind `SECURITY.md`. | 📎 Reference (binary) |
| `TAXONOMY_REDESIGN.pptx` | Slide version of the taxonomy deck. | 📎 Reference (binary) |
| `prompt-log-raw.jsonl` | Raw prompt capture from the old `UserPromptSubmit` auto-logging hook (removed 2026-06-25). **Frozen/superseded** by the curated `SESSION_PROMPT_LOG.md`; retained only as a historical raw artifact; do not treat as maintained. | 🧊 Frozen |

## Conventions when editing docs

- Keep `PROJECT_STATUS.md` current; archive old detailed session logs into `PROJECT_STATUS_ARCHIVE.md`
  rather than letting the live file grow unbounded.
- When a plan ships, flip its **top-of-file status line** to ✅ (don't only patch the body).
- Content counts (words/collocations/redemittel/provenance rows) drift fast, so cite them "as of <date>"
  and re-verify against `src/data/*` before quoting them anywhere load-bearing.
- Follow the house **no-em-dash** writing rule (see `CLAUDE.md`).
