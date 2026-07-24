# Project Status

_Last updated: 2026-07-24 (session 157). **Documentation maintenance pass.** Audit of the whole
docs system (report-only prompt 1, fixes approved prompt 3): rotated the prompt log (s133-151 →
the W29/W30 chunks under `docs/archive/prompt-log/`, live file back under budget), refreshed
`docs/README.md` for the s155 `docs/areas/` restructure, fixed five stale CLAUDE.md section
pointers in live docs, documented `check:contrast` (CI gate) + `check:refs` + the oracle-subset
scripts in `docs/areas/COMMANDS.md` and the CLAUDE.md index, corrected the W30 status-archive
index row (135-154), shrank this file's tail archive blob to a two-line pointer, and added a thin
router `AGENTS.md` (no rules of its own; points other coding agents at CLAUDE.md → docs/areas/ →
the skills). Prior s156: admin control center completed to plan (chunks 1-12); only Phase 3
(13-16) remains, on demand. Founder action from s156 still open: run migration 0010 + redeploy
`delete-account` (`PHASE2_SETUP.md` §5). Product name: **Genauly** (`genauly.de`)._

This is the **lean, living** status doc: current state plus the two most recent session handoffs.
**Start at the `## Resume here (next session)` section at the end.** Companion files:
- **`docs/PROJECT_FOUNDATION.md`** — the stable technical baseline that rarely changes: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra, and completed founder
  action items. Read it when you need the "what's built and how" detail that used to sit here.
- **`docs/PROJECT_REFERENCE.md`** — stable reference: the founder backlog, product-evaluation
  findings, per-session model guidance, and reusable research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked UX decisions.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only session-log history,
  chunked by ISO week under `docs/archive/status-log/`.
- **`../CLAUDE.md`** — the lean always-on operating rules (restructured s155, ~180 lines); deep
  per-area detail lives in **`docs/areas/`** (COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN,
  PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN, COMPONENTS) + the `/design` and `/content` skills.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · Schreiben · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,107
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **all** provenance rows are AI-drafted and `draft`, none human-verified
(human verification was reset to zero on 2026-07-22 at founder request, to restart the review pass;
see `strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
- [x] ~~Enable Turnstile CAPTCHA on guest sign-in.~~ **DONE 2026-07-24** (live sign-in verified; both
      Supabase Auth CAPTCHA and the `VITE_TURNSTILE_SITE_KEY` GitHub secret set). Details in
      `PROJECT_FOUNDATION.md`.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 156 (2026-07-24). Admin chunk 11 (Turnstile) completion + chunk 12
(compliance pack), branch `claude/admin-page-access-ok8g52`.** Continued the admin control center to
the end of its plan. Two parts:
- **Chunk 11 · Turnstile (PRs #669/#670).** Most of chunk 11 already existed (the widget +
  auth-store `captchaToken` integration + the feedback burst/hourly email caps). Diagnosed a
  half-configured state: CAPTCHA was on in Supabase Auth but the `VITE_TURNSTILE_SITE_KEY` GitHub
  secret was unset, so the client sent no token and Supabase rejected guest/email sign-in (Google/OAuth
  is not captcha-gated, which masked it). Founder set the GitHub secret; a fresh deploy made it live;
  founder verified live sign-in. Code: the `AdminSystem` "Gast-Konten" tile now reads the real
  `TURNSTILE_ENABLED` flag (was a hardcoded "still off (chunk 11)" label) and the Launch note states
  both sides are required. Docs: Turnstile marked done in `PROJECT_FOUNDATION.md` completed-setup.
- **Chunk 12 · Compliance pack (PR #672).** §G2 consent-drift gate: one canonical legal date in
  `src/lib/legalMeta.ts` (rendered by PrivacyPolicy, compared to `CONSENT_VERSION`); `consentInSync()`
  + `tests/consent.test.ts` fail CI on drift; the Launch screen shows a red warning instead of the old
  static note. §G3 auditor export: `src/lib/auditExport.ts` builds the provenance register CSV + a
  Markdown summary (tiers, review status, licences, verification links, sampling guide) behind one
  Launch button; reuses `csv.ts` (+ `downloadText`); no new eager weight; pinned by
  `tests/auditExport.test.ts`. §G4 GDPR ops evidence: **migration 0010** adds a content-free
  `gdpr_events` table (kind + timestamp, no user id) + `log_gdpr_event()` + founder-only
  `admin_gdpr_evidence()` RPC (counts + last timestamps + pg_cron retention probe); `delete-account`
  logs erasures, `exportUserData` logs exports; the Launch panel shows counters, fail-soft to
  "run migration 0010".
- **Founder action (chunk 12 §G4 only):** run `supabase/migrations/0010_gdpr_evidence.sql` +
  `supabase functions deploy delete-account` (`PHASE2_SETUP.md` §5). G2/G3 work without it.
- **Admin center status:** chunks **1-12 done** (whole MVP + Phase 2). Only Phase 3 (13-16) remains,
  on demand. Gates for chunk 12: typecheck · build · check:bundle 116.8 kB · lint 0 errors ·
  test:unit **289/289**.

**Handoff after session 157 (2026-07-24). Documentation maintenance audit + fixes + AGENTS.md,
branch `claude/docs-maintenance-audit-8pbhx3`.** Read-only audit first (report delivered, verdict:
healthy, the s155 restructure is holding), then the approved fix pass:
- **Prompt-log rotation:** s133-134 → the W29 chunk, s135-151 → a new
  `archive/prompt-log/SESSION_PROMPT_LOG_2026-W30.md`; live log now holds s152+ (~300 lines vs the
  ~1,200-line budget); index rows updated in `archive/prompt-log/README.md`.
- **`docs/README.md`:** added the `areas/` folder + 10-row catalog and the `/design`+`/content`
  skills note (all missing since the s155 restructure), rewrote the CLAUDE.md row, added an
  AGENTS.md row, refreshed the two archive rows.
- **Stale pointers fixed (5):** `PROJECT_FOUNDATION.md` + `PROJECT_REFERENCE.md` ×2 +
  `DECISIONS.md` ×2 now point at `docs/areas/{BRAND,PRAKTISCH-NAV,BIBLIOTHEK,SCHREIBEN}.md` instead
  of CLAUDE.md sections that moved in s155.
- **Command docs:** `check:contrast` (a `validate.yml` CI gate) documented in
  `docs/areas/COMMANDS.md` + added to the CLAUDE.md CI-gates index; `check:refs` and the
  `build:dict-subset`/`build:nouns-subset` internals of `build:oracles` documented too.
- **Archive index:** the W30 row in `archive/PROJECT_STATUS_ARCHIVE.md` corrected to sessions
  135-154 (the chunk was verified complete; only the index row was stale).
- **New `AGENTS.md` (repo root):** a thin router with no rules of its own (CLAUDE.md →
  `docs/areas/` → the skills), so any future non-Claude coding tool lands on the same law.
  Deliberately NOT comprehensive: a second rulebook would drift against CLAUDE.md.
- **Next:** nothing pending from this session. The standing doc jobs continue as usual: rotate the
  prompt log past ~1,200 lines, keep two handoffs here, bump `docs/README.md` when the folder
  shape changes.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
