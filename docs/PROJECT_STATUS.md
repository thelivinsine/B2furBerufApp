# Project Status

_Last updated: 2026-07-24 (session 156). **Admin control center completed to plan (chunks 1-12).**
Chunk 11 (Turnstile) finished: it was already largely built, and a half-configured state (Supabase
CAPTCHA on, GitHub `VITE_TURNSTILE_SITE_KEY` unset) was breaking guest/email sign-in; founder set the
secret, redeployed, and verified live sign-in. Chunk 12 (compliance pack) shipped (PR #672): §G2
consent-drift gate (`legalMeta.ts` + `consentInSync()` + a CI test + a red Launch warning), §G3 auditor
export (register CSV + Markdown summary, one Launch button, `auditExport.ts`), §G4 GDPR ops evidence
(migration 0010 content-free `gdpr_events` + `admin_gdpr_evidence()` RPC; deletions/exports logged; the
Launch panel shows counters + pg_cron retention status). Founder action for §G4: run migration 0010 +
redeploy `delete-account` (`PHASE2_SETUP.md` §5); G2/G3 work without it. Only admin Phase 3 (13-16)
remains, on demand. Prior s155: design-preferences distillation → the `/design` skill + the CLAUDE.md
restructure into `docs/areas/`. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 155 (2026-07-24). Design-preferences distillation → the `design` skill,
branch `claude/design-prefs-documentation-e1xmlc`.** The founder asked whether the recurring
bad-first-draft problem on new pages/sections is better fixed by a skill or by CLAUDE.md
preferences. Answer delivered: **both, in a hybrid** (CLAUDE.md is always-loaded and already ~1,070
lines, so detail there dilutes attention and costs tokens every session; a skill loads on demand but
triggers probabilistically, so it needs an always-on anchor).
- **New: `.claude/skills/design/SKILL.md`** (the `/design` skill), distilled by two research
  subagents from `SESSION_PROMPT_LOG.md` s133-154 + `DECISIONS.md` + `PROJECT_REFERENCE.md`:
  Rule zero (extend the system, Bibliothek is the reference language) · the 8-step process
  (report-first, previews-first with 2-4 named variants on real tokens, screenshot-verify,
  implement the exact pick, absorb every numbered feedback point, plain-language summaries) ·
  a pre-flight checklist ranked by actual rework frequency (1 redundancy, 2 wrong colors, 3
  oversizing, 4 dead controls, 5 corners, 6 placement, 7 motion) · the locked color language ·
  reusable building blocks · per-section anchors (Bibliothek/Schreiben/Praktisch; Verlauf marked
  as slated-for-rework, not reference) · the shipped-then-reverted landmine list.
- **CLAUDE.md anchor:** the "Founder design preferences" section now opens with a mandatory
  "load the `design` skill before ANY design/UI work" pointer, so sessions that skim CLAUDE.md
  still reach the full playbook. Founder can also force it deterministically by typing `/design`.
- **Maintenance rule (in the skill):** CLAUDE.md is newer law on conflict; update the skill in the
  same PR that changes a design rule.
- **Part 2 (same session): the CLAUDE.md restructure.** The founder then asked for best practice
  on the ~1,078-line / ~36k-token CLAUDE.md and approved the proposed split. CLAUDE.md is now
  **~180 lines of current law only** (identity, one-line command index, layout map, hard
  invariants, design-prefs summary, writing style, area index, deployment, workflow) with a
  maintenance rule at the top (replace rules, don't append history; history → DECISIONS.md).
  The detail moved, de-narrated to current-state-only with every rule and landmine preserved,
  into **`docs/areas/`**: COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN, PRAKTISCH-NAV,
  GAME, BRAND, LEGAL-ADMIN, COMPONENTS. A second skill **`/content`**
  (`.claude/skills/content/SKILL.md`) holds the add-content workflow (iron laws + gate order).
  `lint:content` gained a warn-only ratchet: it nags when CLAUDE.md exceeds ~350 lines.
  Saves ~28k tokens of always-on context per session. `pnpm lint:content` green after the change.
- **Next:** founder wants to rework Schreiben's Verlauf tab (excluded from the distillation on
  purpose); when that happens, run it through the new skill's preview-first process and then add
  Verlauf's picked design to the skill's Schreiben anchor + `docs/areas/SCHREIBEN.md`.

_(Session 154's app-wide-contrast-+-squircle handoff (PR #665),
session 153's Admin-Control-Center-chunks-4-10 + landing-Help-back-button handoff,
session 152's admin-control-center-nav-alignment handoff (PRs #656/#660), session 151's Fokus
"Satzlabor" grammar-bug fix + the Gemini→Sonnet→GPT-5 AI provider cascade
handoff, session 150's Fokus correction-card redesign + Umlaut-keys handoff (PRs #653/#654), session 149's
Schreiben-as-Bibliothek-extension handoff, session 148's PWA-auth-uninstall bug-fix handoff (fresh-device
OAuth `syncHydrated` gate, PR #644),
session 147's Schreibtraining-redesign handoff (Fokus Satzlabor + the Schreiben nav item + the first
Bibliothek harmonization, PRs #640/#642/#643/#646), session 146's /sources verification-refresh +
human-review-reset + table-restructure handoff, and
session 145's Admin Control Center chunk 3 handoff (the `/admin` shell + Übersicht cockpit,
`RequireFounder` gate, PR merged) are now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md`. Session 144's Admin Control Center chunks 1 + 2 handoff (backend foundation migration 0008 + the
`apply:reviews` keyless review loop-closer, PRs #631–#633), session 143's Admin Control Center scoping
handoff (the expert-panel report + build plan + 4 mockup screens, PR #626), session 142's Wörter quality-control handoff (the
`RETIRED_VOCAB_IDS`/`browsableVocabulary` retire-from-surface set + the vocab↔collocation overlap
lint gate, PR #624), session 141's
mobile-nav-item-labels handoff (labels under the active icon + the
Theorie→Bibliothek revert, PR #622), session 140's light-theme recolor handoff (neutral grey chrome + the "I1" mint→sky gradient
ground, 2 PRs + a 3-round preview picker), session 139's three-small-fixes handoff (icon-size
preview correction, mission-exit toggle fix, Kollokationen graph tighter clusters), session 138's
logo-v2 rework handoff, session 137's branding-refresh review + premium pass (fixes 1-7 + items 8-10) handoff, session 136's landing-page-redesign handoff and session 135's game demo-readiness review + P0/P1 batch handoff are now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md`. Session 134's Theorie (Wörter) card + mobile-filter polish handoff, session 133's brand-kit-modernization handoff (plan + all 4 PRs + the consolidated brand-kit/ + the tile-less logo), session 132's Bibliothek mobile-filter bug-fixes + graph two-area color/layout handoff, session 131's Üben exercise-variety plan + full-build handoff, session 130's data-architecture-review handoff (P0/P1 integrity fixes + the /sources redesign with the admin Daten-Werkbank) and session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
fused-doodle registry + batch 1, and the session/graph/flashcard reuse) is now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 128's gender-visuals research-panel + Artikel-Visuals implementation-plan handoff, session 127's brand-kit-catalogue handoff (Vol. IV–VII; the founder **finalized** Kit 1 · Nachtblau & Himmelblau + Koralle, locked spec at `docs/branding/BRAND_SPEC.md`, artifacts saved under `preview/branding/artifacts/`, NOT implemented — wire only on request; see the W29 archive), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
session 123's Theorie graph-view P2/P3 batch handoff, session 122's Theorie graph-view quality audit
+ P0/P1 fixes handoff, session 121's
arbeitswelt→beruf domain-merge handoff, session 120's content-coverage-deepening
handoff, session 119's account-dropdown z-index-fix handoff, session 118's Kollokationen-nodal-graph
handoff, session 117's Üben-navigation + Üben-button-copy handoff, session 116's branding-redesign-support
handoff (Cobalt & Butter previews + the AI mockup guide) and session 115's demo-readiness-sweep handoff
are now in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 113's brand-identity-exploration
handoff (the 20-direction catalogue) is also in W29. Session 114's Theorie pill-animation +
dark-mode contrast handoff, session 113's Theorie tab-transition/compass/feedback-pill polish handoff,
session 112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's handoffs, plus the s104
Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
