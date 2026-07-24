# Project Status

_Last updated: 2026-07-24 (session 155). **Design-preferences distillation → the `design` project
skill.** Two research subagents mined `SESSION_PROMPT_LOG.md` (s133-154) + `DECISIONS.md` +
`PROJECT_REFERENCE.md` for every founder design/layout preference, rework pattern, and
rejected-then-reverted decision (Bibliothek, Schreiben minus Verlauf, Praktisch, global). The
distillate now lives as `.claude/skills/design/SKILL.md` (loads on demand in any session doing UI
work; also invocable as `/design`): process rules (previews-first, named variants, screenshot-verify),
a pre-flight checklist ranked by past rework frequency (redundancy > color > size > dead controls >
corners > placement > motion), the locked color language, reusable building blocks, per-section
anchors, and the landmine list. CLAUDE.md's "Founder design preferences" section now points at it as
mandatory pre-work. Prior: s154 app-wide contrast + squircle pass (light Option B / dark Option C,
`rounded-full`→`rounded-lg`/`rounded-md`, PR #665). Product name: **Genauly** (`genauly.de`)._

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
- **`../CLAUDE.md`** — developer/agent operating instructions, content conventions, and locked designs.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Heute · Bibliothek · Anwenden · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1 complete),
Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `../CLAUDE.md`.

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
- [ ] (Optional) Enable Turnstile CAPTCHA on guest sign-in to deter bot abuse before public launch.
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
- **Next:** founder wants to rework Schreiben's Verlauf tab (excluded from the distillation on
  purpose); when that happens, run it through the new skill's preview-first process and then add
  Verlauf's picked design to the skill's Schreiben anchor.

**Handoff after session 154 (2026-07-24). App-wide contrast + squircle pass, branch
`claude/admin-page-access-ok8g52`, PR #665 merged.** Founder: the admin center (and the app generally)
had too little contrast between cards and background AND between buttons and cards, in BOTH themes, and
the page toggles / filter pills were too round. Worked previews-first: `preview/contrast-squircle-review.html`
(interactive, published as a claude.ai artifact) offered three contrast options × light/dark × a
pill-vs-squircle toggle, over faithful Wörter + Satzlabor mockups. Founder picked **light = Option B,
dark = Option C, squircle yes**.
- **Dark = Option C (`src/index.css`):** the flat `24%/10%` ground left `--surface` only 4% above the
  background. Now a deep-blue ground (`--background`/`--page-*` = `226 44% 6%`) carries brighter, bluer
  cards (`--surface 224 26% 18%`, was `228 20% 14%`) → a **12% surface↔bg gap**, plus an accent-tinted
  brighter border (`216 28% 36%`), lifted `--muted`/`--muted-foreground`/`--input`, and a brighter
  primary/ring (`219 96% 76%`). Foreground-on-surface went 10:1 → **12.6:1**.
- **Light = Option B:** the card lift is carried by a stronger shared `shadow-soft`
  (`tailwind.config.ts`; `--shadow` is near-black + low-opacity in dark, so it is a light-only effect),
  plus slightly deeper `--muted`/`--border` (`88%/84%`) for switcher/pill definition. **The s140-locked
  mint→sky ground and the `--background` contrast-gate anchor were deliberately left unchanged**, so
  `check-contrast.mjs` stays honest. (If the founder wants white cards to pop more, deepen `--page-*`
  next — noted, not done.)
- **Squircle (`rounded-full`→`rounded-lg` track / `rounded-md` pill):** `LibrarySwitcher` +
  `WritingModeSwitcher` page toggles, the Fokus Original/Korrigiert toggle (`FokusTrainer.tsx`),
  `FilterRail` facet pills, `GrammarRail` form pills. Because these are shared, every Bibliothek tab +
  all of Schreiben change at once. Left round on purpose: status dots, meters, count badges, avatars,
  circular icon buttons, and the marketing landing page.
- **Gates:** `check:contrast` (all 40+ pairings re-pass) · `build` · `check:bundle` 116.5 kB · `lint`
  0 errors · `test:unit` **284/284**. No live screenshot (onboarding/auth gate makes headless capture
  unreliable; sandbox can't reach the deployed site) — founder confirms live (hard-refresh, PWA-cached).

_(Session 153's Admin-Control-Center-chunks-4-10 + landing-Help-back-button handoff,
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
