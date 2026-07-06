# Project Status Archive — 2026-W27 (Jun 29 – Jul 5)

_Sessions 45–68. Detailed logs for 45–46; the rest are the condensed "Resume here" handoffs
moved out of `PROJECT_STATUS.md`. Split from `PROJECT_STATUS_ARCHIVE.md` by ISO week in s70._

## Detailed session logs (45–46)

### Session 45 (2026-06-29) — Filter harmonization IMPLEMENTED (Phase 1 + Phase 2) ✅
Implemented the full `docs/plans/FILTER_HARMONIZATION_PLAN.md` across both phases.
- **New shared pieces:**
  - **`src/lib/cefr.ts`** — single source of truth for the CEFR scale (`CEFR_ORDER`, `cefrLabel`,
    `difficultyToBand`). Replaced 4 duplicated `CEFR_ORDER` arrays (VocabularyTrainer,
    CollocationsBrowser, SubThemePicker, intentCards).
  - **`src/features/shared/BrowseToolbar.tsx`** — thin layout wrapper that fixes the position and
    styling of `[Search] [Primary Select] [FacetSheet trigger]` + active-chips row. Reuses the
    existing `FacetSheet` and `ActiveFilterChip`.
- **Phase 1 — three filtering pages:**
  - **VocabularyTrainer:** `SectionHeading` → `HubHero`, added free-text search (over de/en/related),
    theme dropdown + filter sheet via `BrowseToolbar`. SubThemePicker + tabs preserved below.
  - **CollocationsBrowser:** removed the verb-chip scroll/expand rail + the Neutral/Formal colour
    legend. **Verb filter moved into the FacetSheet** as a third facet (CEFR + Register + Verb), so it
    gains live counts, greyed dead-ends, and removable chips. Search persisted to URL (`?q=`). Quiz CTA
    moved to `BrowseToolbar` trailing slot.
  - **RedemittelTrainer:** `SectionHeading` → `HubHero`, added free-text search (over de/en), added
    **Kategorie primary dropdown** (`?cat=`) as the primary axis. Filter sheet kept (Register facet).
    Wendungen/Üben tabs preserved.
- **Phase 2 — non-filtering hubs:** QuizHub level labels now use `difficultyToBand()` from the shared
  module, producing consistent `B1 / B2.1 / B2.2·C1` labels. GrammarHub, ExamHub, SimulationHub already
  used `HubHero` and needed no changes.
- **Verification:** all three pages tested on mobile (390px) and desktop (1280px). Search narrows
  results and composes with facets. Filter sheets open with live counts. URL params round-trip. Dark mode
  correct (no new `bg-white` pills). `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green.


### Session 46 (2026-07-02) — Full app review + UX overhaul plan, APPROVED ✅ (docs-only)
Fable session. The founder asked for a critical review of the app and of the s44/s45 filter
harmonization, then a substantially better plan. **No app code changed; strategy + docs only.**
- **Full-app review:** all 13 routes screenshotted (mobile 390px + desktop 1280px) and read. Five
  headline problems: no composed session loop (the pieces exist but the learner must sequence them);
  home leads with a wall of choices instead of "continue"; redundant practice surfaces (3 flashcard/
  quiz experiences, 4 library nav slots); German UI carrying English content in load-bearing spots
  (all 11 theme blurbs, grammar purposes, "Quick Review"); progress reads as bookkeeping (four zero
  tiles on a new account, no Can-Do milestones). Sign-in banner sits on every screen.
- **Filter-plan critique (self-critical):** s45 harmonized the *reference* layer but polished the
  wrong layer; search stayed siloed per bank; scope (theme) resets per page; the relocated Verb facet
  became a 100+ pill soup; per-page facet wiring does not scale to the coming content packs.
- **`docs/plans/UX_OVERHAUL_PLAN.md` (new, the roadmap):** session-first redesign. Four-tier filter
  architecture (Tier 0 personalized defaults / Tier 1 global search across all banks / Tier 2
  travelling Scope (Domain → Theme → Sub-theme) as app state / Tier 3 refinement facets from a
  central registry, ≤12-option rule, Verb facet dropped). Four-zone IA: Heute (session hero) ·
  Bibliothek (4 libraries merged, s45 toolbars reused) · Anwenden (Simulation/Schreiben/Prüfung) ·
  Fortschritt (Can-Do milestones + diagnosis). New `engine/session.ts` composer + SessionPlayer
  reusing the existing SRS/quiz/drill machinery. Six phases with a prioritization framework.
- **All four Part-H decisions recorded (founder):** (1) IA direction approved; (2) tab-bar default
  pins approved after a plain-language walkthrough, mechanics stay locked; (3) German-first copy
  confirmed, the founder's "EN peek button" idea parked as **backlog #25** (needs brainstorming;
  Phase 0 keeps EN as data, so it stays possible); (4) Can-Do statements AI-drafted + founder-
  reviewed, provenance recipe checked against `DATA_GOVERNANCE.md` (origin `authored`, license
  `OWNED`, `draft` → `verified`, reference = CoE CEFR descriptors, same as writing prompts).
- **Model guidance refreshed:** Fable available again (restriction lifted), Sonnet bumped to 5, and
  a per-phase model table added for the overhaul plan (Phase 0 Sonnet → Phase 1 Opus → …).


## Condensed handoffs (49–68)

**Earlier handoff (session 49, 2026-07-02): Phase 5 of the UX overhaul is COMPLETE ✅** — the whole
UX overhaul roadmap (Phases 0–5) shipped. The IA restructure (PR #262, `c317047`) is founder-verified
live; the Tier-3 tail then shipped in two more PRs: the **facet registry + Verb-facet drop** (PR #264,
`1141cde`) and the **Vokabeltrainer tab removal** (PR #265, `ae67862`). Recap of the four-zone nav: new
**Anwenden hub** (`/anwenden`), new **Bibliothek hub** (`/library?tab=…`) with the four old library
routes redirecting in, the founder-unlocked `DEFAULT_PINNED_TABS` four-zone default, and a settings-store
persist migration (`version: 1`) remapping existing users' pins/More-order. The s26–28 bottom-bar
mechanics stayed locked throughout.

**✅ Deploy note (recurring flake, now auto-retried since s53):** the `pages.yml` **deploy** job
intermittently failed with GitHub's transient `##[error]Deployment failed, try again later` on the
`actions/deploy-pages` step (the build + artifact upload succeed; it is a Pages-platform flake, not a
code issue). It hit `c317047`, `74ccd7c`, and both session-53 merges (`c1dada8`/`9ba8be4`), where the
Pages service was briefly degraded and even a **manual re-run failed** until it recovered. **Fixed in
session 53 (PR #277, squash SHA `c00341a`):** the deploy job now runs up to **three attempts** of the
same pinned `actions/deploy-pages` action in-job (attempts 1–2 fail soft with 15s/60s pauses; attempt 3
fails hard so a genuine outage still surfaces), with the `environment.url` falling back across the
attempts. First real-world test was rough but instructive: run #284 (PR #277's own merge) exhausted all
3 attempts because the Pages incident was still active, then the next merge's run **#285 went green in
2m 20s** (vs a clean ~22s), showing the retry engaged and rescued a later attempt once the service
recovered. So a single-blip flake now self-heals; only a multi-minute GitHub Pages outage (like the one
on 2026-07-04) would still fail all attempts and need re-running after the service recovers. **Old
manual remedy (if all three attempts ever fail):** GitHub Actions → the failed "Deploy site to GitHub
Pages" run → "Re-run failed jobs".

**Phase-5 tail (session 49 cont.):**
1. **Facet registry** `src/lib/facets.ts` (PR #264, `1141cde`): facet defs declared once per content type
   (`vocabFacets`/`collocationFacets`/`redemittelFacets` + `*_FACET_IDS`), derived from the taxonomy
   enums; the three browse pages now consume it instead of hand-wiring. **Dropped the 100-option Verb
   facet** from Kollokationen (search covers verb lookup) and codified the **≤12-option rule**
   (`MAX_FACET_OPTIONS` + a dev-time warning in the `facet()` builder). No UI change (same `FacetDef` →
   same `FacetSheet`).
2. **Vokabeltrainer tab removal** (session 49's final PR): the in-page Karteikarten + Quiz tabs are
   retired behind a reversible `SHOW_PRACTICE_TABS = false` flag in `VocabularyTrainer.tsx`, so the
   Vokabeltrainer is now the browse/inspect surface (word list) and focused practice flows through the
   toolbar's **Üben → composed session**. Hero copy updated to match. `Flashcards`/`VocabQuiz` stay in the
   repo (used by the session engine).
   - **`/quiz` decision:** the standalone hub is off the nav (its "retired" state) but kept as a live
     route, reachable via deep links (GrammarHub "Wissen im Quiz testen" + `practiceAreas`). A hard
     redirect was deliberately NOT added, so those deep-link intents keep working. Flip
     `SHOW_PRACTICE_TABS` back to `true` to restore the vocab tabs if the founder prefers them.

**Phase 3 scope decision (founder, 2026-07-02):** Phase 3 shipped as a **soft merge** (founder chose
this over full consolidation). The four library pages got the single-hub feel (segmented switcher +
travelling scope + Üben) *without* a route merge or nav change, so nothing the founder uses was
removed and the locked bottom bar was untouched. The **hard merge** deferred to **Phase 5** (the nav
re-map phase): the single `/library` URL + old-route redirects + retiring the standalone Quiz
section + removing the Vokabeltrainer's in-page Karteikarten/Quiz tabs (superseded by Üben →
session). Fold these into the Phase 5 work.

**Earlier work (session 50, 2026-07-03, docs-focused, shipped across PRs #267–#269):** full docs audit
(stale counts reconciled to 1,111 provenance rows; five shipped-plan headers flipped; PROJECT_STATUS
slimmed with sessions 4–40 + 24 archived to `docs/archive/PROJECT_STATUS_ARCHIVE.md`; new
`docs/README.md` index + best-practices section); readable transcription of the learning-app playbook
(`docs/reference/LANGUAGE_LEARNING_SUCCESS_FACTORS.md`); Genauly scored against it
(`docs/strategy/PRODUCT_EVALUATION.md`, seven dimensions); the five recommendations scoped as backlog
**#26–#30**; and the founder-approved **`docs/plans/LEARNING_ENGINE_PLAN.md`** (Phase 0 quick wins =
next build; then FSRS, speaking block, custom deck). Then the docs folder was reorganized into
`strategy/`, `plans/`, `archive/`, and `reference/` subfolders (see `docs/README.md`), the only change
touching `src/` (three code comments repointed at moved docs; CI `lint-content` green). All merged to
`main` (PRs #267, #268, #269). Prompt log entries 110–118. **Session fully documented.**

**Earlier work (session 49):**
- **s49 — UX overhaul Phase 5 IA restructure SHIPPED ✅ (Anwenden hub + Bibliothek hub + four-zone
  nav re-map):** the visible heart of Phase 5, delivered as a mostly-additive PR so no deep link or
  founder-used surface broke.
  - **Anwenden hub** (`src/features/anwenden/AnwendenHub.tsx`, route `/anwenden`): one hub with three
    big cards (Sprechen → `/simulation`, Schreiben → `/writing`, Prüfung → `/exam`), giving the transfer
    layer equal visual rank. `SimulationHub`'s title renamed **"Lösung finden" → "Sprechsimulation"**
    (the telc module name kept only in the description).
  - **Bibliothek hub** (`src/features/library/LibraryHub.tsx`, route `/library`): the deferred Phase-3
    **hard merge**. `/library?tab=woerter|kollokationen|redemittel|grammatik` lazy-mounts the existing
    Vokabeltrainer / Kollokationen / Redemittel / Grammatik surfaces (each still renders its own HubHero
    + `LibrarySwitcher`). `LibrarySwitcher` is now **tab-based** (switches `?tab=` under `/library`,
    carrying the travelling scope). The four old routes redirect in via a `LibraryRedirect` component
    that **preserves every query param** (theme/sub/cefr/q/cat…), so cross-module "Verbunden" jumps,
    `searchAll` deep links, intent cards and `practiceAreas` routes keep working untouched.
  - **Four-zone nav re-map** (`nav-items.ts`): navItems collapsed from 12 to **Heute · Bibliothek ·
    Anwenden · Fortschritt · Einstellungen**; `DEFAULT_PINNED_TABS = ["/", "/library", "/anwenden",
    "/analytics"]` (founder-unlocked, Part-H decision 2). Custom two-tone route marks added for
    `/library` (stacked books, blue + neon-cyan) and `/anwenden` (target, orange + neon-amber) in
    `route-icons.tsx` + `NORM`. **The s26–28 bar mechanics (edit mode, jiggle, drag-reorder, More sheet,
    icon rules/sizes) were NOT touched** — only the item list + default pins, exactly the approved scope.
  - **Settings-store migration** (`useSettingsStore`, now `persist` `version: 1`): a `migrate` +
    `ROUTE_SUCCESSOR` map remaps a pre-Phase-5 learner's saved `pinnedTabs`/`moreOrder` onto the new
    zones (`/vocabulary`,`/collocations`,`/redemittel`,`/grammar`,`/quiz` → `/library`;
    `/writing`,`/simulation`,`/exam` → `/anwenden`; `/revision` → `/`), de-duping and keeping Home first,
    so nobody's custom bar silently loses icons.
  - **Deliberately deferred** (documented in "Resume here"): the facet registry / Verb-facet drop and the
    plan's in-page removals (quiz retirement + Vokabeltrainer tab removal). Kept `/quiz` a working route
    (off the nav) and left the vocab Karteikarten/Quiz tabs in place to avoid a surprising feature
    removal inside the nav PR.
  - **Verified:** `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green. Headless-Chromium
    mobile smoke (390px) confirmed: the four-zone bottom bar renders (Heute · Bibliothek · Anwenden ·
    Fortschritt · Mehr); `/library` + all four `?tab=` segments render; `/anwenden` shows the three
    cards; `/vocabulary?theme=behoerde` redirects to `/library?theme=behoerde&tab=woerter`; the
    Simulation title reads "Sprechsimulation"; **and** a seeded pre-Phase-5 profile (`version: 0`, old
    pins `["/","/vocabulary","/quiz","/analytics"]`) migrates to `["/","/library","/analytics"]` with
    zero console errors.

**Most recent work (session 48):**
- **s48 — UX overhaul Phase 4 UI half (Fortschritt redesign) SHIPPED ✅:** built the three pieces
  from plan E5 on top of the session-47 Can-Do content. **Can-Do milestone section** in
  `Analytics.tsx`, now the page's lead: for each theme (sorted least-mastered-first, same order as
  the mastery grid) lists its `canDoByTheme(themeId)` statements, checked off when the theme's
  mastery ratio (already computed as `themeStats`) crosses the statement's `threshold`; a header
  badge shows the overall `achieved/total` count. **Diagnose card**: shows the current weakest CEFR
  band (`weakestBand`) or, for a fresh learner with no started cards, the weakest theme
  (`weakestTheme`, mode-aware, both pure exports of `engine/session.ts`), with a one-tap "Session
  dazu starten" button that navigates to `/session?theme=<weakTheme>`. **Relocated the theme mastery
  grid**: removed the "Deine Themen" browse grid from `Dashboard.tsx` (Heute) — it already lived on
  Fortschritt as "Beherrschung nach Thema" — and replaced it with a quiet "Alle Themen" card linking
  to `/vocabulary`; Heute is now hero + Situationen + status strip + that link. No new engine or data,
  UI assembly only. `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green; headless-Chromium
  mobile smoke pass confirmed the Can-Do section renders checked/unchecked milestones correctly against
  seeded `srs` progress, the diagnose button navigates to `/session?theme=...`, and the Heute theme grid
  is gone with "Alle Themen" in its place. Shipped in PR #260 (bundling the session-47 content
  commits), squash-merged to `main` as `74ccd7c` after `lint-content` CI passed.

**Most recent work (session 47):**
- **s47 — UX overhaul Phase 4 CONTENT half (Can-Do bank + linter) committed (merged in session 48
  via PR #260, together with the UI half):** new
  `src/data/canDo.ts` — **25 `CanDoStatement` Can-Do milestones**, 2–3 per theme across all 11 themes,
  pitched at ascending CEFR bands (B1.2 → B2.1 → B2.2) with ascending mastery `threshold`s. Each is a
  German "Ich kann …" statement written in our own words, **aligned to the Council of Europe CEFR
  self-assessment descriptors** (cited in provenance, never reproduced; Goethe "Kann-Beschreibungen"
  stay on the avoid list) — the exact Part-H-decision-4 recipe. New `CanDoStatement` type + `can_do`
  provenance content type (with the `/sources` page label + `TYPE_ORDER` entry); **25 provenance rows**
  (`origin: authored`, `license: OWNED`, reference = CoE self-assessment grid; **founder-reviewed and
  approved 2026-07-02 → all now `review_status: "verified"`**). New `lint:content` rules (`lintCanDo`): unique ids, valid
  `themeId`/`cefr`, "Ich kann" prefix, `threshold` in `(0,1]`, and every theme covered; the bank is
  loaded + counted (25 milestones · 1111 provenance rows). Helper `canDoByTheme`. `pnpm typecheck` +
  `pnpm lint:content` + `pnpm build` green. Committed as `93eb4b7`. This is the Fable-authored content
  step; the founder verifies the German. (The UI half followed in session 48, see above.)
- **s47 — UX overhaul Phase 3 (library soft-merge + travelling scope) shipped:** new
  `src/store/useLibraryScope.ts` (in-memory zustand) holds the **Tier-2 travelling scope** — the
  active library `{theme, sub}` as app state, so picking a theme once follows the learner across the
  theme-scoped segments until changed. New `src/features/library/LibrarySwitcher.tsx` renders a
  segmented control (Wörter | Kollokationen | Redemittel | Grammatik) on all four library pages, each
  link carrying the shared scope, plus a dismissible `ScopeChip` on the theme-scoped surfaces.
  Vokabeltrainer + Kollokationen **hydrate** their theme from the shared scope when arriving without
  an explicit `?theme=` (e.g. via the bottom bar) and **sync** their effective theme back into it
  (dropdown or deep link) via a `useEffect` on the effective theme — so scope travels both directions
  while URL params still override for shareable deep links. An **"Üben"** button on the Vokabeltrainer
  and Kollokationen toolbars launches a scoped composed session (`/session?theme=`), folding the
  quiz-launch entry point into the Phase 1 engine (Kollokationen's old "Quiz: theme" button was
  repointed). The redundant "durchsuchen" collocations shortcut on the Grammar hub was removed (the
  switcher supersedes it). **Nothing else was removed; the locked bottom bar + nav registry +
  `DEFAULT_PINNED_TABS` are untouched** (that consolidation is Phase 5). `pnpm typecheck` + `pnpm
  lint:content` + `pnpm build` green; verified in headless mobile + desktop smoke passes (scope
  travels Wörter→Kollokationen carrying `?theme=behoerde`; Üben → `/session?theme=behoerde` whose
  first card was a Behörde word; the switcher renders on all four pages; the chip dismiss returns to
  the unscoped list). **Bug caught + fixed mid-build:** a deep-link `?theme=` didn't populate the
  scope store (only the dropdown did), so scope didn't travel; fixed by syncing the effective theme
  into the store via effect rather than only on the dropdown handler.
- **s47 — UX overhaul Phase 2 (global search + Tier-0 defaults) shipped:** new `src/lib/search.ts`
  `searchAll(query)` — one query over vocabulary, collocations, Redemittel, grammar topics and
  dialogue scenarios together (linear scan, no index needed at ~1,000 items), returning grouped
  results that deep-link into each bank's home surface (`/vocabulary?theme=&sub=`,
  `/collocations?theme=&q=`, `/redemittel?cat=`, `/grammar?topic=`, `/simulation`). New
  `GlobalSearch.tsx` dialog (reuses the locked `Dialog`/`bg-dialog-overlay` primitive): a header
  icon on mobile, a Sidebar entry + ⌘K/Ctrl+K global shortcut on desktop, both wired through one
  controlled `open` state in `AppShell.tsx`. This replaces the three siloed per-page search boxes
  as the *primary* discovery path; the per-page boxes remain as scoped refiners (unchanged). New
  Tier-0 personalized defaults in `src/lib/cefr.ts` (`defaultVisibleBands`/`hiddenBandsLabel`,
  mapping the learner's stored coarse `CefrLevel` to the fine-grained `ContentCefr` band + one step
  up): Vokabeltrainer, Kollokationen and Redemittel now default their list to that band instead of
  an unfiltered pile, with a quiet "Auch B2.2 · C1 zeigen (n)" escape link (not a facet chip).
  **Found and fixed during verification:** the vocabulary bank is tagged only B1.2/B2.1/B2.2 (no
  A2/B1.1/C1 items exist), so the naive "level + 1 band" default rendered a **fully empty list** for
  an A2-level learner. Fixed with a non-empty guard (`bandNonEmpty` check) on all three pages: the
  default only activates when it would leave at least one result for the current scope, otherwise
  it's skipped entirely (no filtering, no escape pill) — the same "never let the learner tap into an
  empty screen" invariant the s45 FacetSheet already guarantees. `pnpm typecheck` + `pnpm
  lint:content` + `pnpm build` green; verified in headless mobile + desktop smoke passes (global
  search open via icon tap, text query, result click-through; ⌘K open on desktop; CEFR band default
  at B1 showing 477/528 with the escape pill, at A2 correctly falling back to the full list, at B2
  showing everything unfiltered since B2 is the app's target level).
- **s47 — UX overhaul Phase 1 (session engine + Heute) shipped (earlier in the session):** the core "one tap, one composed
  session" loop. New pure composer `src/engine/session.ts` (`buildSession` + deterministic
  `sessionPreview` + `weakestBand`/`weakestTheme`/`difficultyForLevel`) turns SRS state + Mode lens +
  a target length into an ordered, **interleaved** `SessionPlan` (new `SessionBlock`/`SessionPlan`
  types): due vocab flashcards (weighted via `reviewWeight`/`isDue`), leveled quiz questions from the
  weakest or scoped theme (via `buildThemeQuiz`), a grammar micro-drill, and a Redemittel recall,
  mixed not blocked. New `src/features/session/SessionPlayer.tsx` renders every block kind behind one
  progress bar + XP tally and an **end screen** (XP earned, "Stärker geworden" list, "Morgen: …
  festigen" forward hook); `Session.tsx` route wrapper reads `?theme=`/`?min=`. New `/session` route.
  **Heute** (`Dashboard.tsx`) now leads with a primary session CTA hero (composition preview from
  `sessionPreview`) + compact Situationen chips that launch scoped sessions (`/session?theme=`),
  replacing the browse-card wall; status strip keeps a "Schnelle Runde" secondary + Fortschritt link.
  **Schnellwiederholung** (`/revision`) is now the short (~5 min) preset of the same engine
  (`QuickRevision.tsx` is a thin wrapper). Reuse, not rewrite: the three quiz-question views were
  extracted to shared `src/features/quiz/QuestionViews.tsx` (used by both `QuizRunner` and
  `SessionPlayer`), and `GrammarDrillCard` gained optional `onResult`/`suppressXp` props (backwards
  compatible). `pnpm typecheck` + `pnpm lint:content` + `pnpm build` green; verified in a headless
  mobile smoke pass (Heute hero, a full 16-step session driven to the XP/stärker end screen, and the
  8-step `/revision` preset), no console errors.
- **s47 — UX overhaul Phase 0 (quick wins) shipped (earlier in the session):** sign-in banner now shows only on Heute
  (dashboard) and its dismissal persists (`signInBannerDismissed` in `useSettingsStore`, was
  session-only local state before); header slimmed from 5 to 4 mobile widgets (removed the
  redundant Level pill + XP ring, both already visible on Fortschritt; added an `aria-label` to
  the streak pill); added German `blurbDe` to all 11 theme cards and `purposeDe` to all 10 grammar
  topics (English `blurb`/`purpose` kept as a secondary field per the plan, for a future EN-UI
  mode), wired into `Dashboard.tsx`/`GrammarHub.tsx`; renamed the dashboard heading
  "Prüfungsthemen" → "Deine Themen" (matches the broader post-s21 scope, not exam-only) and
  "Quick Review" → "Schnelle Runde" in `QuickRevision.tsx`; Fortschritt (`Analytics.tsx`) now shows
  a "Dein Ziel" goal card (level + goal + minutes/day, sourced from existing onboarding settings,
  reusing `recommendedNext()` for the CTA) instead of four zero-value stat tiles when the learner
  has no XP/sessions yet. `types/index.ts` + `scripts/lint-content.mjs` updated for the two new
  required content fields (`blurbDe`, `purposeDe`). `pnpm typecheck` + `pnpm lint:content` +
  `pnpm build` green; verified live in a headless-Chromium mobile-viewport smoke pass (dashboard,
  grammar, revision, analytics screens).

**Most recent work (sessions 45–46):**
- **s46 — UX overhaul plan (docs-only, approved):** full app review, filter-plan critique, four-tier
  filter architecture + four-zone IA + session engine design, all Part-H decisions recorded, backlog
  #25 added (EN peek button, needs brainstorming). See the session 46 entry above.
- **s45 — Filter harmonization (Phase 1 + 2) implemented:** shared `BrowseToolbar` + `src/lib/cefr.ts`;
  identical `[Search] [Theme/Kategorie ▾] [Filter]` toolbar on the three browse pages; verb filter moved
  into the FacetSheet; QuizHub CEFR labels via `difficultyToBand`. See the session 45 entry above.

**Most recent work (sessions 35–40):**
- **s40** — **tripled the collocations bank** from 132 to 396 entries (+24/theme across all 11 themes).
  **Hid the English example translation** on `/collocations` cards (phrase gloss stays). **Hid the
  Kollokationen tab** inside Wortschatz (reversible, commented out). 264 provenance rows added (total
  1073). Added **Select dropdown scrim overlay** using the locked `bg-dialog-overlay` convention
  (PRs #227–#229); tracks open state via context so the scrim only shows while the dropdown is open.
  `pnpm lint:content` and `pnpm build` green.
- **s39** — fixed mobile **card grids overflowing off the right edge** (Kollokationen `formell` badge
  clipped). Root cause: responsive `grid-cols-N` with no base `grid-cols-1` falls back to an implicit
  max-content column on mobile. Added `grid-cols-1` across every affected grid (PR #219). Also
  **removed the `UserPromptSubmit` prompt-logging hook** (PR #221) at the founder's request; the prompt
  log is now **manual-only** (founder will ask when to log). `docs/reference/prompt-log-raw.jsonl` kept as
  history, no longer written to. Noted but did not fix a **mismatched German quote** (`„…"` vs `„…"`)
  in the collocation example sentences. Added an **explicit Save button to the `/sources` admin
  overlay** (PR #223); founder ran **Supabase migration 0004** and confirmed source-review saving now
  works. Added **backlog #24** (deep-dive source review + source strategy, PR #224); the **dwds.de
  source swap is deferred** under that item.
- **s35** — Wortschatz tab overflow fix.
- **s36** — aligned the dedicated `/collocations` (Kollokationen menu) cards to the Wortschatz
  Kollokationen tile design (truncating semibold phrase, muted meaning, `formell` badge instead of an
  indigo background, divider + italic German example), keeping the browser's extra content (example
  English line + its audio button).
- **s37** — founder-only **source-verification overlay** on `/sources`: a Supabase-backed,
  admin-only (gated to `thelivinsine@gmail.com`) layer to mark provenance entries verified and add
  private comments. **Action still pending on the founder:** run `supabase/migrations/0004_provenance_reviews.sql`
  in the Supabase SQL Editor so the saves persist (see `docs/plans/PHASE2_SETUP.md` → "Admin source review").
- **s38** — fixed the **sign-up button staying disabled when email/password are autofilled** (iOS
  Safari / password managers don't fire React's `onChange`; added a `:-webkit-autofill` animation hook
  in `index.css` that `AuthDialog` reads into state). Also investigated a "collocations tiles cut off"
  report and found **no bug** (the shared `.pb-nav` already clears the bottom bar by 24px; the
  screenshot was the top of the list mid-scroll). Awaiting founder confirmation at the true bottom of
  the list before any further change.


**Earlier handoff (session 51, 2026-07-04). Learning Engine Phase 0 (quick wins) is COMPLETE ✅ and
merged to `main`** as PR #271 (squash SHA `92ab08b`): **26a response-latency capture** (`SrsCard`
gained optional `lastMs`/`emaMs`, write-only training data for the coming FSRS scheduler, no scheduling
behavior change), **#28 guess-before-reveal** (`guessFirst` setting, default on; MCQ questions hide
their options behind a "think first" gate in both `MCQView` and `VocabQuiz`), and **#30 voice variety**
(`voiceVariety` setting, default off; `nextGermanVoiceURI()` round-robins the German voice list, wired
into `SpeakButton`/`SimulationRunner`/`ExamRunner` with mutual exclusion against a pinned voice). Shipped
as three independently-revertable commits, each verified in isolation (`pnpm typecheck`/`lint:content`/
`build` plus targeted unit tests and Playwright smoke against a live dev server). No persist/Supabase
migrations needed, all new fields are optional and ride inside existing jsonb blobs. Branch
`claude/whats-next-esga9u` (reassigned per session; `main` is the source of truth), realigned to `main`
post-merge per the standard housekeeping.

**Next up: the Learning Engine plan is fully shipped, including the optional Phase 1.5 tail
(26a/#28/#30 s51, #29 s52, 26b s53, #27 s56, Phase 1.5 latency plug-in s57).** Open candidates, in
rough order of product value:
- A new **life-domain theme** (banking / healthcare/Arzt / housing) per the product scope; the
  `behoerde` pack is the reference template. Content-heavy, founder may want to pick the domain.
- The optional taxonomy follow-ups (human-verify the AI-drafted `cefr` tags via provenance
  `draft→verified`; broaden `sector`/`workSituation` tagging; extend sub-themes past 3 of 11).
- The **game concept** (`docs/strategy/GAME_CONCEPT.md`, s54): waiting on founder decisions (brand,
  pixel-art direction) before any build work is scoped.
- Backlog #25 (the "EN peek" whole-screen translate button) is still parked pending a brainstorm.

**Most recent work (session 51, 2026-07-04, shipped as PR #271):**
- **26a response-latency capture:** `SrsCard` gained optional `lastMs` (clamped to 60s) and `emaMs`
  (EMA, α=0.3); `review()`/`reviewVocab()` take an optional `latencyMs`, carrying prior samples forward
  unchanged when it's absent so nothing wipes history. New `useAnswerTimer(key)` hook (`lib/hooks.ts`):
  a sub-second `performance.now()` timer that resets in the render phase when the per-prompt key
  changes. Captured at 4 sites: `Flashcards` + `SessionPlayer`'s flashcard block (front render to first
  flip), `VocabQuiz` + `MCQView` (prompt render to option tap, shared by `QuizRunner` + `SessionPlayer`).
  Word-order/matching stay unmeasured (not retrieval-latency signals); the Redemittel recall branch has
  no SRS card so its sample is dropped. Write-only: no scheduling behavior changed. Verified with 14
  hand-written assertions against the real `engine/srs.ts` (EMA math, clamping, carry-forward,
  invalid-input rejection, old-format tolerance, rounding).
- **#28 guess-before-reveal:** new `guessFirst` setting (default **true**). `MCQView` and `VocabQuiz`
  hide the options grid behind a "think first" gate ("Überlege zuerst: Wie heißt die Antwort? Dann
  vergleiche." → "Optionen zeigen") until tapped. `MCQView` resets for free via its existing per-question
  remount key; `VocabQuiz` isn't remount-keyed, so it gets explicit reset points in `next()`/`restart()`
  (re-reading the live flag, so a mid-quiz settings change applies from the next question). Latency
  (26a) is deliberately NOT reset on reveal, so it spans the think stage, the retrieval-latency signal
  wanted. New "Lernen" settings card (between Profil and Darstellung). WordOrder/Matching untouched
  (already constructive).
- **#30 voice variety:** new `voiceVariety` setting (default **false**, opt-in). `nextGermanVoiceURI()`
  in `engine/speech.ts` round-robins the German voice list (not random, so consecutive utterances always
  differ), degrading to `undefined` under 2 voices; precedence resolved inside `speak()` (pinned
  `voiceURI` wins, else variety rotation, else `voices[0]`). Wired into `SpeakButton` (~11 surfaces),
  `SimulationRunner`, `ExamRunner`. Settings UI: a "Stimmen abwechseln" switch under the voice picker,
  shown only with 2+ German voices, with **mutual exclusion** (enabling variety unpins the voice; picking
  a voice in the Select turns variety back off).
- **Process:** the three items shipped as three independently-revertable commits (split cleanly even
  though `useSettingsStore.ts` and `Settings.tsx` are shared between #28 and #30, by temporarily
  stripping/restoring the #30 additions before each commit). `pnpm typecheck`/`lint:content`/`build`
  green on every commit in isolation and on the final tree; Playwright smoke tests against a live dev
  server covered the MCQ gate reveal flow, `guessFirst=false` bypass, and the voice-variety mutual
  exclusion in both directions. Shipped via PR #271, squash-merged as `92ab08b`; no persist/Supabase
  migrations needed (all new fields optional, ride inside existing jsonb blobs). Prompt log entries
  119–124. **Session fully documented.**


**Earlier handoff (session 52, 2026-07-04). Learning Engine #29 (custom deck / "save word") is
COMPLETE ✅ and merged to `main`** as PR #273 (squash SHA `c730e76`). What shipped: a per-learner **saved-words deck** on the progress
store (`savedWords: string[]` + `toggleSavedWord(id)`, cleared by `resetProgress`), wired into
cloudSync (`progressRow` writes `saved_words`, `mergeRemoteProgress` unions across devices) with a new
**`supabase/migrations/0005_saved_words.sql`** that the founder must run once in the SQL editor (adds
the `progress.saved_words` jsonb column, default `'[]'`, no backfill). UI: a **bookmark toggle on each
Vokabeltrainer word card** (`VocabList.tsx`, stopPropagation like SpeakButton) and a **"Gespeichert"
toolbar filter** (`?saved=1`; kept a per-learner toggle rather than a content facet, since "saved"
isn't a static content field) with an empty state, plus a saved-count row in the Settings "Lernen"
card. Engine: `reviewWeight` gained a **`saved` boost (+1)** threaded through session Pool 1
(`buildSession` takes `savedWords`), so bookmarked words surface sooner in composed sessions. Verified:
`pnpm typecheck`/`lint:content`/`build` green + a Playwright smoke test (toggle, persistence, filter
narrowing, empty state) with zero console errors. **Migration 0005 was run by the founder in the
Supabase SQL editor 2026-07-04**, so `progress.saved_words` exists and saved words sync across devices.
Post-merge housekeeping done (branch reset to `origin/main`, force-with-lease). Prompt-log entries
127–129.


**Earlier handoff (session 53, 2026-07-04). Learning Engine Phase 1, the FSRS scheduler (26b), is
COMPLETE ✅ and merged to `main`** as PR #275 (squash SHA `c1dada8`). `src/engine/srs.ts` now runs a
compact hand-rolled **FSRS-6** scheduler (21 default weights, desired retention 0.9, no fuzzing,
day-granular with no sub-day learning steps) behind the **unchanged** export surface, so no call
sites changed. `SrsCard` gained optional `stability`/`difficulty` (they ride inside the `srs` jsonb
blob; no persist or Supabase migration). Legacy SM-2 cards seed lazily on their next review
(stability from `interval`, difficulty inversely from `ease`); untouched cards keep identical
`mastery()` scores, so the theme grid and Can-Do milestones don't shift. `reps` is now a
total-review counter that never resets (keeps cloudSync's higher-reps-wins merge valid), and `ease`
keeps updating by the SM-2 rule, so reverting the one engine file would restore the old scheduling
with no data repair. **New CI gate: `pnpm test:srs`** (`scripts/test-srs.mjs`, added to
`validate.yml` next to `lint:content`): 310 assertions against golden vectors generated from
**py-fsrs 6.3.1**, the open-spaced-repetition FSRS-6 reference (grade sequences, same-day/late/
early reviews, legacy seeding, the 26a latency regression, contract invariants). Verified per plan
§7: all four gates green, a fresh-context verification subagent independently re-derived the
formulas and golden vectors (verdict PASS), and a Playwright smoke against a live dev server showed
a composed-session flashcard review persisting exactly the FSRS first-rating reference values
(`stability 2.3065, difficulty 2.1181, interval 2`) with zero console errors. The "correct but
slow" latency grading stays deferred (plan Phase 1.5; needs 3+ samples per card). Post-merge
housekeeping done (branch `claude/26b-task-n3tl75` reset to `origin/main`, force-with-lease).
**Also shipped this session (PR #277, squash SHA `c00341a`):** the long-standing `pages.yml` deploy
flake is now **auto-retried** (up to 3 in-job attempts of `actions/deploy-pages`; see the "Deploy note"
lower down). This came up because the flake hit both session-53 merges and a manual re-run failed until
the Pages service recovered (a genuine short GitHub Pages incident, not the code). The incident ran long
enough that deploy runs #282/#283/#284 all failed (#284 exhausted all 3 retry attempts while Pages was
still degraded); the next merge's deploy, **run #285 (`ab6278e`, tip of `main`), went green after the
retry rescued a later attempt** (2m 20s vs a clean ~22s, so the retry visibly engaged). Because each
Pages deploy publishes the whole site from the current commit, #285's success means the FSRS change and
all prior work are live. Takeaway confirmed: the retry self-heals a single-blip flake but cannot beat a
multi-minute outage. Prompt-log entries 130–131.


**Earlier handoff (session 54, 2026-07-05, docs only, nothing built).** The founder brought a rough
idea for a **story-driven 2D German life RPG** (hero's journey, Pokémon-like; items = language;
missions = real-life scenarios like the Anmeldung; battles = conversations; real-world photo/
voice side quests; D/E translation buttons on every line) and we brainstormed it into a concept.
The full concept, including the founder's verbatim core philosophy (personal involvement, cultural
insight + visuals + emotion, incremental scene-on-scene learning, ambition of hundreds of missions
and thousands of scenes), the failure-is-content design, the chapter skeleton, and the **Anmeldung
vertical slice** chosen as the first prototype target, is captured in
**`docs/strategy/GAME_CONCEPT.md`**. **Scope guardrail (founder correction, do not regress):** the
game targets a BROAD audience; exam prep is at most one optional side path, never the spine or
default endgame. Open questions for the founder: own brand vs. Genauly name, and final blessing on
the retro pixel-art direction. No build work is scoped yet; treat the concept doc as the reference
when the founder wants to take the next step. Prompt-log entry 132.


**Earlier handoff (session 55, 2026-07-05, docs only, nothing built).** Token-efficiency housekeeping in
response to a founder review of a Perplexity "agent tax" analysis. Trimmed the context that loads every
session: rotated the append-only prompt log (entries 1–109 archived, live file now session 50+),
relocated the PROJECT_STATUS session-25–46 detail into
`docs/archive/PROJECT_STATUS_ARCHIVE.md`, and split the "why" behind locked decisions out of `CLAUDE.md`
into the new **`docs/DECISIONS.md`** (UX-overhaul phase history + mobile-bar mechanism/mockup detail).
Added a "Working efficiently (token/context discipline)" rule to `CLAUDE.md`. **Every operative
do/don't rule was preserved; only narrative/rationale moved.** Net effect: the files normally read per
session dropped ~4110 → ~1973 lines (~52%). Then a **thorough docs audit** (founder request): moved the
four fully-completed plans (`UX_OVERHAUL_PLAN`, `FILTER_HARMONIZATION_PLAN`, `TAXONOMY_IMPLEMENTATION_PLAN`,
`TAXONOMY_REDESIGN`) from `docs/plans/` into `docs/archive/` and rewired every live reference; fixed the
stale `LEARNING_ENGINE_PLAN` status in the index (Phases 0/1/3 shipped, not "not yet implemented"); removed
the stale hardcoded session-branch name from `CLAUDE.md` (docs best-practice #5); refreshed `docs/README.md`
(new `DECISIONS.md` + prompt-log-archive rows). Content counts spot-checked against `src/data` (provenance
1,111 + Can-Do 25 match, not stale). `plans/` now holds only active work (`LEARNING_ENGINE_PLAN`,
`PHASE2_SETUP`). No app code touched, no build needed. Finally, **codified a prompt-log rotation policy
and split the prompt-log archive by ISO week** (founder request): the archived entries now live in
`docs/archive/prompt-log/SESSION_PROMPT_LOG_YYYY-Www.md` (one file per week + a `README.md` index) so a
lookup loads only one week; the live log's header now carries the standing rule (append to the tail;
rotate at ~1,200 lines into the matching week file). Prompt-log entries 133–135.


**Earlier handoff after session 56 (2026-07-05). Learning Engine Phase 2, the #27 speech-first production
block, is COMPLETE ✅ and merged to `main`** as PR #284 (squash SHA `6d1d8b4`). That was the LAST
Learning Engine phase: all five items (26a, 26b, #27, #28, #29, #30) are now shipped. What shipped:
a new **`"speaking"` session block**, the first consumer of the `listen()` STT wrapper in
`engine/speech.ts`. Behind the `recognitionEnabled` opt-in (now no longer inert; Settings copy
updated) plus `recognitionSupported()`, the composer (`engine/session.ts`, new `speaking?: boolean`
on `BuildSessionOpts`, engine stays pure) adds up to 2 production blocks per session from the
top-weighted due vocab, showing the EN meaning + EN example (the DE sentence would reveal the
answer). The learner taps the mic (user gesture required by webkit STT), an 8s soft countdown caps
the window, partials stream, and the final transcript is matched by the new pure
**`src/engine/pronounce.ts`** (strip punctuation + leading der/die/das/ein/eine/`sich`, ß→ss;
exact / word-boundary containment / length-scaled Levenshtein). Grades 4/0 → `reviewVocab` with 26a
latency spanning the think stage; +12 XP (`XP.speakingDrill`). **Fallback ladder:** hard STT error
or no ctor flips the block to a typed input graded by the same matcher (after 2 hard errors the
remaining speaking blocks start typed); `no-speech` returns to the prompt; a voluntary "Lieber
tippen" path always exists. **New CI gate `pnpm test:pronounce`** (26 checks, `validate.yml` next to
`test:srs`) pins the matcher contract. Verified: all five gates green plus a 21-check Playwright
smoke against a live dev server with a mocked SpeechRecognition (STT happy path with exactly +12 XP
and persisted `lastMs`, voluntary typed path, mic-error fallback, recognition-off full session never
shows the block), zero console errors. Two real-browser guards worth knowing: STT `onerror` is
always followed by `onend` (the end handler checks the live handle so it can't drag the UI back to
the prompt), and StrictMode's dev double-invoke re-arms the unmount evaluation guard. Post-merge
housekeeping done (branch reset to `origin/main`, force-with-lease). Prompt-log entry 136.


**Earlier handoff after session 57 (2026-07-05). The optional Learning Engine Phase 1.5 latency plug-in is
COMPLETE ✅ and merged to `main`** as PR #287 (squash SHA `8835b52`). This closes the
`docs/plans/LEARNING_ENGINE_PLAN.md` roadmap entirely: nothing in it remains. What shipped: a
**"correct but slow" demotion** in `src/engine/srs.ts`. When enabled, a Good rating (grade 4) whose
clamped response latency exceeds **1.5×** the card's own `emaMs` is graded as **Hard** instead, so a
laboured recall schedules sooner. It is deliberately conservative and self-relative: gated on **≥3
prior latency samples** (new optional `SrsCard.msCount`) so the per-card EMA is trustworthy, keyed
purely to the card's own EMA (never an absolute cross-format threshold, since flashcard-flip and
MCQ-select latencies share one card's EMA), and a **2000ms floor** that only *blocks* demotion of a
sub-2s confident recall (never causes one). The demotion is scheduling-only: `lastGrade` still
records the learner's honest button press and the latency sample is still captured. Wiring:
`review()` gained an `opts.latencyGrading` flag (engine default **off**, so `test:srs` golden
sequences and any other pure caller never demote); `useProgressStore.reviewVocab` reads the new
`latencyGrading` setting (default **on**, opt-out toggle in the Settings "Lernen" card) via
`useSettingsStore.getState()` and passes it through. No persist/Supabase migration (both new fields
ride inside the existing `srs` jsonb blob and the settings jsonb sweep). Verified: all four gates
green (**`pnpm test:srs` now 323 checks**, +13 new Phase-1.5 assertions that prove a demoted Good
equals a real Hard on the same card state, and that fast / flag-off / <3-samples / floor-guarded
cases all skip the demotion), plus `typecheck` + `lint:content` + `build`. Post-merge housekeeping
done (branch reset to `origin/main`, force-with-lease). Prompt-log entries 138–139.


**Earlier handoff after session 58 (2026-07-05). Full performance/bug/robustness audit EXECUTED ✅, six PRs
merged to `main`** (#289–#294 + the Phase-6 polish PR, see below). The founder reported the app
"buggy, laggy and unresponsive"; the audit report + fix plan lives in
**`docs/plans/APP_AUDIT_2026-07-05.md`** (committed with PR #289) and every phase in it is now
shipped. What changed, by phase: **(1, #289)** header streak uses `useEffectiveStreak` (no more
stale flame after a missed day); `/session` remounts on `?theme=`/`?min=` change and "Neue Runde"
rebuilds in place instead of `window.location.reload()`; the Settings "Animationen reduzieren"
toggle is real now (`MotionConfig` in `App.tsx`, also honours OS `prefers-reduced-motion`);
`.card-hover` transitions only transform+shadow. **(2, #290)** `BrowseToolbar` debounces search
(180 ms; also keeps `history.replaceState` off the keystroke path, which Safari rate-limits);
`VocabList` cards are memoized with per-card store selectors and stream in 60-at-a-time via the new
**`src/lib/usePagedList.ts`** (IntersectionObserver sentinel + "Mehr anzeigen" fallback);
Kollokationen got the same treatment (plus: search term removed from the grid remount key);
Redemittel dropped per-card stagger wrappers; `lib/search.ts` builds a pre-normalised lazy index
and `GlobalSearch` defers the query. **(3, #291)** main bundle **606 kB → ~322 kB** (174 → 96 kB
gzip): `GlobalSearch` imports `lib/search` dynamically (dialogues/collocations leave the eager
path); new **`src/engine/sessionPreview.ts`** carries the light preview half for the eager
Dashboard (`engine/session.ts` re-exports it; import sessionPreview from the light module in eager
code, NEVER from engine/session); `/privacy`, `/terms`, `/about` are lazy routes. **(4, #292)**
new `flushCloudSync()` pushes debounce-pending progress on `visibilitychange=hidden` and is awaited
in `signOut` (closing the PWA right after a session no longer strands the last reviews). **(5a,
#293)** per-route `errorElement` (`RouteError`) so a page crash keeps the shell alive; progress
store persist now has an explicit `version: 0` + migrate hook. **(5b, #294)** CI guardrails in
`validate.yml`: **`pnpm lint`** (new ESLint flat config; rules-of-hooks etc. block, compiler-era
react-hooks rules are warnings = visible debt, ~31 currently), **`pnpm test:unit`** (new Vitest
suite, 23 tests in `tests/`), **`pnpm build`** (PRs previously merged without a build!), and
**`pnpm check:bundle`** (`scripts/check-bundle-size.mjs`, main-chunk budget 400 kB). The linter
caught real bugs, fixed in #294: dead else-if in `engine/quiz.ts` (tiny-pool fallback never ran),
stray `\"` in the plural prompt, `engine/dialogue.ts` `useHint` renamed **`applyHint`**. **(6)**
mobile-only blur reduction on the sticky header + bottom bar (`backdrop-blur-md`, more opaque
surface; desktop unchanged) — this is the one **visual** change of the series; founder can veto
after seeing it live. Verified throughout with an 11-check Playwright smoke against the production
preview + all seven gates green. **Next candidates:** founder live-verification of feel on a real
phone; burn down the 31 lint warnings; consider `useDeferredValue` on the Vokabeltrainer filter
memos if very old devices still stutter; the B3 full option (solid mobile surfaces) if jank
persists.


**Earlier handoff after session 59 (2026-07-05). Bibliothek Grammatik bug FIXED ✅ and merged to `main`.**
The founder reported that tapping any Grammatik tile in the Bibliothek (Konnektoren etc.) bounced
them to the Wörter tab. Root cause: `GrammarHub` opened a topic with `setParams({ topic: id })`,
which replaces the whole query string and drops `tab=grammatik`; `LibraryHub` then saw no `tab` and
fell back to `DEFAULT_LIBRARY_TAB` ("woerter"). A Phase-5 regression: harmless when GrammarHub lived
at standalone `/grammar`, breaking once it became a `?tab=` segment of `/library`. The back button
(`setParams({})`) had the same flaw. Fix in `src/features/grammar/GrammarHub.tsx`: both `open` and
the new `close` clone the current params (`new URLSearchParams(params)`) and only set/delete
`topic`, the same idiom the other three library surfaces already use. Verified with a Playwright
check against the production preview (tile click keeps `tab=grammatik&topic=...`, topic view
renders, back returns to the grammar grid) plus `pnpm build`. A follow-up **app-wide sweep for the
same bug class found no other instances**: all nine `useSearchParams` writers audited (the other
three library surfaces clone params; WritingHub/QuizHub replace them on standalone routes where
that is the intended reset), every deep link into library content routes through `LibraryRedirect`
(params preserved, correct tab added), and `LibrarySwitcher` rebuilds params deliberately (it
carries the travelling scope). Confirmed at runtime with a 7-check Playwright smoke: saved-toggle /
search / facet params keep their tab, the switcher carries theme scope, old `/grammar?topic=` deep
links land on the topic, and browser Back from a topic returns to the grammar grid. No code change
needed beyond the PR #297 fix.


**Follow-up in the same session: PWA auto-update watcher (`src/lib/swUpdate.ts`).** The founder
reported the grammar fix "isn't solved yet" after it was already deployed (Pages runs 304–305
green). Root cause was the update path, not the fix: the service worker (`registerType:
"autoUpdate"`) serves the OLD precached app on launch and only swaps in a new deploy on the *next*
relaunch, so an installed home-screen app needs two full relaunches to show any deploy. New
`watchSwUpdates()` (called from `main.tsx`): reloads once when the new worker takes control within
30s of load (the update-on-launch case); if a deploy lands mid-session it defers the reload to the
next app resume so an in-progress exercise is never interrupted; on every resume it also asks the
browser to re-check `sw.js` (throttled to 1/min) because iOS PWAs are resumed, not relaunched.
First-install `clientsClaim` is guarded (no spurious reload). Complements the existing reactive
`lib/recover.ts` (which only heals after a chunk-load crash). Verified with a Playwright
end-to-end SW test against the production preview: no reload on first install, auto-reload after a
simulated deploy (bumped `sw.js` revision), grammar tiles still work after the reload; `pnpm
build`/`lint`/`test:unit`/`check:bundle` green. Note: the founder's device adopts THIS change only
after one more manual close-and-reopen cycle (the old code without the watcher is what's cached);
every deploy after that self-adopts. **Next candidates** carry over from
session 58: founder live-verification of app feel on a real phone; burn down the ~31 lint warnings;
`useDeferredValue` on the Vokabeltrainer filter memos if old devices still stutter.


**Earlier handoff after session 61 (2026-07-05). Minimal, game-ready redesign strategy PROPOSED, not yet
implemented.** The founder asked how to redesign the front end to be minimal, extremely user
friendly, intuitive and engaging for two audiences (short-attention busy professionals/students
AND hardcore exam preppers), with less German interface text, and with exercise progress feeding
the future game as a unified world. Deliverables: a visual strategy report (Artifact, with
before/after mockups of Heute, focus-mode session, loot-drop end screen and the city strip) plus
the engineering plan **`docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`**. Core strategy: "lean surface,
deep drawer" (skimmer gets a 3-element Heute, 1-screen onboarding + 90-second taster, full-screen
focus-mode sessions; the diver keeps Bibliothek/Prüfung/Fortschritt depth one tap deeper),
a microcopy budget (no section-description sentences; German is content, not chrome; D/E gloss
component shipped early from the game concept), gradients restricted to Start + reward moments,
one new reward-gold token, and a game-contract layer: FSRS state renders as collection-card
levels (loot), theme mastery as six SVG domain buildings (the city strip, seed of the RPG world
map), Can-Do milestones as quest cards. Four phases (1 diet · 2 stage · 3 world seed · 4 depth,
detail in the plan doc); Phase 1 also flips the two research-backed defaults from
`docs/reference/GENAULY_UX_UI_ANALYSIS.md` (voiceVariety on, speaking on where supported). Locked
constraints restated in the plan (bottom bar, overlays, bundle budget, consent flow, no em
dashes, no new deps, no tracking). **Next step: founder reviews the report; on go-ahead, execute
Phase 1 on the session branch.**


**Earlier handoff after session 62 (2026-07-05). Game implementation strategy PROPOSED, not yet
implemented.** The founder asked how to implement the game idea (approach, tools, strategy).
Deliverable: **`docs/plans/GAME_IMPLEMENTATION_PLAN.md`**, the engineering companion to
`docs/strategy/GAME_CONCEPT.md`, closing the tech-approach question that the concept doc had
left open. Four decisions recommended: (1) build inside Genauly as a lazy-loaded `/welt` route,
not a separate app (one progression state, one deploy, extractable later); (2) React renders
all mission scenes (battles are conversations, missions are forms/websites, all UI-shaped);
a game engine (Phaser, MIT, lazy chunk) arrives ONLY for the later walkable pixel city, and
Godot/Unity are rejected for web-export weight and a foreign codebase; (3) missions are a data
bank (`data/missions.ts` + `engine/mission.ts` runner, closed scene-type union, lint:content
graph checks) so hundreds of missions become a content routine, with "mission #2 touches only
data files" as the pipeline metric; (4) FSRS stays the single memory model and acts as the
dungeon master for mission recurrence (game grades flow through `reviewVocab`). Tooling/cost
map: itch.io modern-city pixel packs (~10–40 EUR), Aseprite, kenney.nl CC0 audio, Tiled + Phaser
free, everything else already in the repo. Phases: G0 = execute the session-61 redesign Phases
1–3 first (they seed the game world), G1 = mission engine + Anmeldung vertical slice in React,
G2 = Chapter 1 "Ankommen" + a real-user playtest gate, G3 = Phaser walkable world, G4 = content
scale. Risks named: engine-first trap, content-scale trap, forked-progress trap, pending
pixel-art blessing (no asset purchases before mockup approval). **Next step: founder picks the
order (recommended: redesign Phase 1 next, then G1) and approves producing 2–3 pixel mockup
scenes for the art blessing.**


**Earlier handoff after session 63 (2026-07-05). Phase-wise implementation plan for the UX redesign
WRITTEN and shipped: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`.** The founder asked for a
robust phase-wise plan built from the two latest redesign reports
(`docs/reference/GENAULY_UX_UI_ANALYSIS.md`, PR #300, and
`docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`, PR #301), with a Claude model recommendation for each
task and a brief non-technical summary per phase. The new doc is the execution layer on top of the
session-61 design spec: a 5-point design north star, a model legend (Haiku 4.5 for mechanical
sweeps, Sonnet 5 as the workhorse, Opus 4.8 near locked constraints / persisted-store migrations /
engine helpers, Fable 5 for illustration and grading-design work), and four phases with per-task
tables (task, files, model, rationale), acceptance criteria and risks: **Phase 1 diet** (defaults
flip incl. settings-store persist migration, 3-element Heute, 1-screen onboarding + taster, Gloss
component, microcopy budget), **Phase 2 stage** (focus-mode `/session`, combo counter +
reward-gold tokens, loot end screen + `engine/collection.ts` Lv mapping with unit test), **Phase 3
world seed** (six Fable-designed SVG domain buildings, city strip, quest cards, Meine Sammlung),
**Phase 4 depth** (typed forward-recall block, authentic Lesen/Hören block, visible progression),
plus a Phase 5 backlog (grammar Übersicht visuals, variable rewards, rephrase ladder). This dovetails
with session 62's game plan: its G0 phase IS redesign Phases 1–3. No app code changed. **Next
step: execute redesign Phase 1 on the session branch, starting with task 1.1 (the
`useSettingsStore` defaults flip + persist migration, Opus-tier care).**


**Earlier handoff after session 64 (2026-07-05, part 1). UX redesign Phase 1 "The Diet" is EXECUTED ✅ and
merged to `main` (PR #305, squash `3a044a5`; plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **1.1 Pedagogy defaults ON (`src/store/useSettingsStore.ts`).** `voiceVariety` and
  `recognitionEnabled` now default `true`. Persist config bumped **v1 → v2** with a migrate that flips
  a persisted `false → true` for existing users (both switches were default-off and effectively inert,
  so `false` was the old default, not an opt-out; a value already `true` is never touched). STT support
  stays enforced downstream by `recognitionEnabled && recognitionSupported()` with a typed fallback, so
  the store default is safe on unsupported browsers.
- **1.2 Heute slimmed to 3 elements (`src/features/dashboard/Dashboard.tsx`).** A pure CSS conic
  **goal ring** (streak flame + count in the center, greeting + XP/% beside it), one **gradient Start
  button** ("~N Min · X fällig", the only gradient on the screen), and an **icon-first Situationen chip
  row** (no header, no description). The old stats-strip card and Bibliothek link card are gone; the
  eager path is lighter (dropped the `sessionPreview` import). `/revision` lost its only UI link but
  stays a live route.
- **1.3 Onboarding → one screen + taster (`src/features/onboarding/Onboarding.tsx`).** Five steps
  collapsed to a single setup card: a 2×2 "Wofür lernst du Deutsch?" tile (Beruf/Alltag/Prüfung/Beides,
  each sets goal **and** mode), a CEFR chip row, the consent checkbox (recorded via `recordConsent()`
  **before** `completeOnboarding`, `CONSENT_VERSION` untouched), then a straight `navigate("/session?min=1")`
  into a ~90s composed taster (the composer clamps to a 6-block minimum). Name/exam-date/rhythm are
  dropped from onboarding and default in the store, to be collected contextually later.
- **1.4 `<Gloss>` component (`src/features/shared/Gloss.tsx`).** Tap toggles DE↔EN per tap (no
  persistence), dotted-underline affordance, `stopPropagation` so it works inside the tappable
  flashcard. Wired into the two SessionPlayer renderers with a real DE/EN pair: the flashcard reveal
  (`initial="en"`) and the speaking answer. Quiz/grammar prompts are deliberately NOT glossed (that
  would defeat the exercise).
- **1.5 Microcopy sweep + CLAUDE.md rule.** Deleted the section-description sentence on 11 hub/page
  headers (Analytics, Writing, Simulation, Settings, Redemittel, Quiz, Kollokationen, Grammatik,
  Anwenden, Vokabeltrainer, Prüfung); `EmptyState`/form/session-preview strings kept. Added the
  **microcopy budget** rule to `CLAUDE.md` (eyebrow ≤ 2 words, title ≤ 5 words, no header subtitle).
- **1.6 Gates.** All green: `pnpm build`, `typecheck`, `lint:content`, `test:unit` (23), `check:bundle`
  (main chunk **77.9 kB**, budget 400), `lint` (0 errors, 31 baseline warnings). Self-review found no
  correctness bugs; no locked files touched (bottom bar, dialog tokens, consent flow all intact).

**Next step: redesign Phase 2 "The Stage"** (focus-mode `/session`, combo counter + reward-gold
tokens, loot-drop end screen + `engine/collection.ts` Lv mapping with a unit test). Opus-tier for the
AppShell chrome-hiding (adjacent to the locked bottom bar) and the SessionPlayer refactor.

---


**Earlier handoff after session 64 (2026-07-05, part 2). UX redesign Phase 2 "The Stage" is EXECUTED ✅ on the
session branch (plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **2.1 Focus mode (`AppShell.tsx` + `useSessionStore`).** New transient `focusMode` flag: the
  SessionPlayer sets it true while a block is on screen (via `useLayoutEffect`, so no chrome flash) and
  false on the end/empty screen and on unmount. AppShell hides the header, bottom bar and sidebar when
  `focusMode && pathname ∈ {/session, /revision}`, so the session plays full-screen. The locked bottom-bar
  internals (s26-29, iOS `translateZ`/`no-callout` fixes) are untouched, just not mounted in focus mode.
- **2.2 SessionPlayer focus refactor.** One block per screen on a min-h-screen stage: a top rail (✕ exit
  with a confirm overlay using the locked `bg-dialog-overlay` token, thin progress bar, combo/XP),
  centered block with horizontal slide transitions, display-size German (flashcard/speaking bumped to
  `text-3xl sm:text-4xl`). The 26a latency signal is preserved: `captureLoot` still threads `latencyMs`
  into `reviewVocab` for flashcard/quiz/speaking.
- **2.3 Combo counter + reward-gold tokens.** Consecutive-correct `combo` (resets on a miss); a gold pulse
  pill appears at ≥3 (framer `key={combo}` spring). New `--reward`/`--reward-bg` HSL tokens (index.css,
  both themes) + Tailwind `reward`/`reward-bg`, reserved for loot / combo / lit buildings.
- **2.4 `engine/collection.ts` + unit test.** Pure `cardLevel(card)` maps FSRS stability (legacy interval
  fallback) to Lv 0-5 via fixed day bands [1,7,21,60]; `leveledUp(before, after)` compares. 5 new Vitest
  cases in `tests/collection.test.ts` pin the boundaries. This is the **stable game contract**; do not drift
  the bands.
- **2.5 Loot-drop end screen.** A `RewardRing` (animated gold conic-equivalent SVG ring filling to the daily
  goal %), reviewed words as `LootCard`s showing `Lv n` and an ↑ on cards that leveled this session
  (captured via before/after `cardLevel` around each synchronous `reviewVocab`), and the kept "Morgen: X
  festigen" forward hook. Chrome returns here (focus flag cleared).
- **Gates.** All green: `build`, `typecheck`, `lint` (0 errors / 31 baseline warnings), `lint:content`,
  `test:unit` (**28**, +5 collection), `check:bundle` (main chunk **78.2 kB**), `test:srs` (323). Self-review
  clean; no locked files' internals touched.

**Next step: redesign Phase 3 "The World Seed"** (six Fable-designed SVG domain buildings, city strip on
Heute, Fortschritt quest cards, „Meine Sammlung" bag view reusing `engine/collection.ts`). Task 3.1 (the SVG
buildings) is the Fable-tier illustration task; the rest is Sonnet-tier presentational wiring. Watch
`check:bundle` as SVGs + new views land.

---


**Earlier handoff after session 65 (2026-07-05). UX redesign Phase 3 task 3.1 is EXECUTED ✅ (plan:
`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **3.1 Domain buildings (`src/components/city/domain-buildings.tsx`, new).** Six flat SVG buildings in
  the established two-tone + neon mark style (base accent + hard-coded neon second tone, 20×20 grid):
  Büro (indigo tower, cyan annex), Bürgeramt (slate colonnade, amber pediment), Bank (sky block, cyan
  cornice, coin-ring emblem), Arztpraxis (rose clinic, glowing cross sign), Wohnhaus (teal house, neon
  roof), Prüfungshalle (fuchsia dome hall, neon entablature). Each mark has a **lit** state (bright
  white windows/emblems) and an **unlit** state (the same openings as dark shades, "lights off").
  The founder tried and REJECTED gold windows, so **no reward-gold in these marks**; the reward tokens
  stay reserved for loot/combo moments. Marks are
  normalised like route icons but to a **common ground line** (`groundTransform`), so a city strip gets
  a shared street level with a varied skyline (deliberate). After founder review, a **soft-corner pass**
  landed: every rect carries an `rx` and the pointed shapes (pediment, roofs, dome base) are rounded via
  a same-color stroke with `strokeLinejoin="round"`; don't add sharp-cornered shapes to these marks.
- **Registry for 3.2.** `DOMAIN_BUILDINGS` carries per building: German `label`, base `color`, and the
  mastery sources that will light it: `domains` (buero → beruf+arbeitswelt, arztpraxis → gesundheit,
  pruefungshalle → pruefung+bildung) and/or `themeIds` (buergeramt → behoerde, more precise than the
  whole alltag domain). **bank and wohnhaus are intentionally empty**: they are the future banking and
  housing packs and stay unlit until that content exists. A unit test pins that no domain or theme
  lights two buildings.
- **Tests + review sheet.** `tests/domain-buildings.test.tsx` (registry integrity, 20-unit grid render,
  reward gold appears only when lit; test:unit now 33). Founder review sheet:
  `preview/domain-buildings-preview.svg` (light/dark × unlit/lit), regenerate via
  `node preview/gen-domain-buildings-preview.mjs`; the TSX is the geometry source of truth.
- **Gates.** All green: `build`, `typecheck`, `lint` (0 errors / 31 baseline warnings), `lint:content`,
  `test:unit` (33), `check:bundle` (78.2 kB, module not yet on the eager path since nothing imports it
  until 3.2).

**Update (same session, part 2): task 3.2 city strip is EXECUTED ✅ and the 3.1 marks were
founder-tuned twice.** What changed on top of the part-1 handoff below:
- **Founder round 1 (soft corners):** every rect in the building marks carries an `rx`; pointed shapes
  (pediment, roofs, dome base) are rounded via same-color strokes with `strokeLinejoin="round"`;
  bodies tuck under wider bands so rounded corners leave no seam notches. Rule in the module header:
  soft corners only, no new sharp shapes.
- **Founder round 2 (NO gold windows):** the gold-window lit state was REJECTED. Lit = the bright
  white-window look; unlit = the same openings as dark shades (`#0c1222`, "lights off"). Reward-gold
  is fully out of the building marks; the token reservation comments in `index.css`,
  `tailwind.config.ts` and CLAUDE.md now read "loot / combo moments" and note the rejection. The unit
  test pins: dark openings only when unlit, no reward token in either state.
- **3.2 City strip on Heute.** New `src/components/city/mastery.ts`: pure `cityProgress(srs)` resolves
  each building's themes (explicit `themeIds` claim first, then domain rollup, no double counting),
  counts mastered words (same ≥0.8 bar as Analytics/composer), and lights a building at
  `LIT_THRESHOLD = 0.4` mastered share. `weakestTheme` per building = its least-mastered theme. New
  `CityStrip.tsx` renders the six buildings ground-aligned on a street line (border-b) in a `bg-surface`
  card as Heute element 4 (no header, no copy; aria-labels only); tapping a building with content starts
  `/session?theme=<weakestTheme>`; the future packs (bank, wohnhaus) stay unlit and inert.
  **Bundle lesson:** a static import chain Dashboard → mastery → vocabulary ballooned the main chunk
  78 → 330 kB (Phase 1 had removed vocabulary from the eager path). Fix: `CityStrip` is `React.lazy`
  behind a fixed-height Suspense fallback; main chunk back to **78.6 kB**, strip in its own ~7 kB chunk.
  CLAUDE.md's eager-path rule was rewritten to match reality (Dashboard imports NO content bank; new
  bank-dependent Dashboard elements go in lazy chunks). 5 new Vitest cases in `tests/city-mastery.test.ts`
  (fresh profile unlit, no double counting, future packs inert, behoerde lights Bürgeramt at threshold
  without leaking, weakest-theme pick); test:unit **38**. Verified on the dev server (seeded profile,
  headless Chromium screenshots at mobile width).

**Next step: redesign Phase 3 tasks 3.3–3.6** (Sonnet/Haiku tier): Fortschritt led by the city view +
Can-Do quest card with charts behind "Details" (3.3), „Meine Sammlung" bag view on
`engine/collection.ts` (3.4), Bibliothek presentation pass (3.5), gates + ship watching `check:bundle`
(3.6).

---


**Handoff after session 66 (2026-07-05). UX redesign Phase 3 "The World Seed" is COMPLETE ✅
(tasks 3.3–3.6, plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **3.3 Fortschritt quest board (`src/features/analytics/Analytics.tsx`).** New headline order:
  `<CityStrip/>` (reused directly, no re-lazy-loading — Analytics is already a lazy route per the
  CLAUDE.md exception), a **next-quest card** (the not-yet-achieved `canDo.ts` milestone with the
  smallest `threshold - ratio` gap, so it always points at the nearest win; a progress bar + "Quest
  üben" CTA into `/session?theme=<theme>`; an all-done state once every milestone is achieved), and a
  **"Meine Sammlung" entry card** (collected-word count, navigates to `/sammlung`). The full Can-Do
  checklist, the weakest-spot diagnose card, top stats, XP/level bar, writing weaknesses and exam
  history stay visible below. The XP 30-day chart, per-theme mastery grid, vocab-mastery distribution
  chart and the activity calendar are collapsed into a single "Details" disclosure (plain button +
  `ChevronDown`, no new dependency) gated on a new **`useSettingsStore.progressDetailsExpanded`**
  boolean (default `false`, persisted, no version bump needed since it's an additive key).
- **3.4 „Meine Sammlung" (`src/features/collection/Sammlung.tsx`, new; route `/sammlung`).** The bag
  view of the stored-value loop: every vocabulary word that is either bookmarked (`savedWords`) or has
  `cardLevel(srs[id]) >= 1` (`engine/collection.ts`, unchanged) shows as a card with a `Lv n` badge
  (levels 1–5) and the existing bookmark toggle; a level filter (Alle/Lv5…Lv1) plus `usePagedList`
  windowing reused from the Vokabeltrainer pattern. Off the nav — reached only via the Fortschritt
  entry card, the same "deep link only" pattern as the retired `/quiz` — so the locked bottom-bar
  nav (`nav-items.ts`, pinned tabs, More sheet) was **not touched**. Lazy route (walks the vocabulary
  bank, matching every other content-bank consumer).
- **3.5 Bibliothek presentation pass (styling only).** In `VocabList.tsx`, `CollocationsBrowser.tsx`
  and `RedemittelTrainer.tsx`'s row cards: the lead German word/phrase (`v.de`/`c.full`/`p.de`) bumped
  from a bare `font-semibold` to `text-base font-semibold sm:text-lg`; the English gloss (plus plural,
  or plus the Redemittel `note`) demoted from two separate lines to one quiet `text-xs
  text-muted-foreground` line. Structure, facets, search and the toolbar are byte-for-byte unchanged.
- **Gates.** All green: `build`, `typecheck`, `lint` (0 errors / 31 baseline warnings, unchanged),
  `lint:content`, `test:unit` (38, unchanged — no new engine logic to pin), `test:srs` (323),
  `check:bundle` (main chunk **78.9 kB**; `Sammlung` and `Analytics` both land in their own lazy
  chunks, ~3.2 kB and ~22 kB respectively).

**Next step: Phase 4 "The Depth"** (typed forward-recall, authentic Lesen/Hören) is not yet scoped
into tasks — the next planning session should turn `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`'s Phase 4
sketch into a task table like Phase 3's, or re-check with the founder on priority against the
`docs/plans/GAME_IMPLEMENTATION_PLAN.md` (still PROPOSED, sequenced after redesign Phases 1–3, now all
shipped).

---


**Handoff after session 67 (2026-07-05). UX redesign Phase 4 "The Depth" is SCOPED and task 4.1 is
SHIPPED ✅ (plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What happened:
- **Phase 4 task table drafted** at Phase-3 granularity (6 tasks): 4.1 typed-recall grading engine
  (Fable), 4.2 typing block wired into the composer + SessionPlayer (Opus), 4.3 Lesen/Hören content
  bank `src/data/texts.ts` (Fable), 4.4 reading/listening composer block + renderer (Opus), 4.5
  per-theme progression chip (Sonnet), 4.6 gates/ship (Haiku). Suggested split: **Session A = 4.1+4.2**
  (ships standalone; the audit's "if only one thing ships" item and reused by game-plan G1), **Session
  B = 4.3+4.4**, **short Session C = 4.5+4.6**.
- **Task 4.1 executed and merged (PR #316, `8bbe1d6`).** New pure `src/engine/typing.ts`:
  `gradeTyped(typed, expected)` → `{ verdict: "correct"|"almost"|"wrong", reason? }`. Design (all in the
  module header): three tiers map onto the FSRS `Grade` scale for 4.2 (correct→Good, almost→Hard,
  wrong→Again, so near-misses stop feeding the scheduler false evidence); alternate umlaut/ß spellings
  fold to digraphs on BOTH sides (fully correct, but Bär/Bar stay distinct); spacing + hyphenation
  interchangeable; article and reflexive "sich" graded **separately** from the head word (wrong/missing
  lead with a correct head is "almost", carrying `reason: "article"|"reflexive"`, never a pass or a
  fail); typo tolerance tighter than the spoken matcher (0 edits ≤3 letters, 1 to 9, 2 from 10) and a
  within-tolerance slip is "almost" not "correct"; **no containment credit** (unlike `matchesSpoken`).
  `engine/pronounce.ts` exports `levenshtein` for reuse (behavior unchanged). 18 new cases in
  `tests/typing.test.ts` including a contrast test vs `matchesSpoken` containment.
- **Gates:** all green — `build`, `typecheck`, `lint` (0 errors / 31 baseline warnings), `lint:content`,
  `test:unit` **56**, `test:pronounce` 26, `check:bundle` main chunk **78.9 kB** (`typing.ts` has NO
  consumer yet, so it is not on any import path; wiring is task 4.2).

**Next step (founder decision pending):** continue **Phase 4 Session A** by executing **task 4.2**
(new `kind: "typing"` composer block + SessionPlayer renderer, graduation rule so only stable cards get
typed recall, latency + verdict into `reviewVocab`), OR pivot to **game plan G1** (`GAME_IMPLEMENTATION_PLAN.md`,
still PROPOSED; its G0 prerequisite — redesign Phases 1–3 — is now fully shipped, and 4.1's tolerant
grading is exactly what G1's formCloze / dialogue-battle scenes need). The recommendation stands: finish
4.2 first so typed recall reaches the default loop and de-risks G1.

---


**Handoff after session 68 (2026-07-05). UX redesign Phase 4 Session A is COMPLETE ✅: task 4.2
(typed-recall block in the loop) shipped, so 4.1 + 4.2 together put tolerant typed forward recall into
the default session and feeding FSRS (plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **New `kind: "typing"` `SessionBlock`** (`src/types/index.ts`): vocab-only forward recall (EN → typed DE),
  same shape as `speaking` (sourceId/de/en/example).
- **Composer graduation rule** (`src/engine/session.ts`): `graduatedToTyping(card)` returns true when a
  due card is `reps >= 2` AND `(stability ?? interval) >= TYPING_STABILITY_FLOOR` (8 days). Pool 1 maps
  graduated due cards to `typing` blocks (`ty_` key), new/young cards stay recognition `flashcard`s. A
  single lucky first answer never jumps a brand-new word to typing.
- **`TypingBlock` renderer** (`SessionPlayer.tsx`): EN prompt display-size, a typed DE input graded by
  4.1's `gradeTyped`, an "Anzeigen" give-up that grades as a miss, three-tier feedback (success/warning/
  danger tones) with the correct answer + `SpeakButton` + example, latency captured mount→answer. The
  verdict maps onto the SRS `Grade` scale (correct → 4 Good, almost → 3 Hard, wrong → 0 Again); combo/XP
  reward only a clean "correct". `captureLoot` refactored to take an explicit `Grade` (all callers updated).
- **Gates:** all green — `build`, `typecheck`, `lint` (0 errors), `lint:content`, `test:unit` **59**
  (56 → 59: +3 composer cases for the graduation rule), `check:bundle` main chunk **78.9 kB**.

**Next step:** Phase 4 **Session B = 4.3 + 4.4** (Lesen/Hören content bank `src/data/texts.ts` + the
`reading`/`listening` composer block + renderer), then short Session C = 4.5 (progression chip) + 4.6
(docs/ship). OR pivot to game plan G1 (`GAME_IMPLEMENTATION_PLAN.md`), whose formCloze / dialogue-battle
scenes now have both the tolerant grading (4.1) and a typed-input block pattern (4.2) to build on.


---


