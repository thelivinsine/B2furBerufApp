# Session & Prompt Log — Archive 2026-W27 (2026-06-29 to 2026-07-05)

_Weekly archive slice of the append-only prompt log (ISO week 2026-W27). The maintenance rule and
entry template live in the live log `docs/SESSION_PROMPT_LOG.md`; the index of weekly files is
`docs/archive/prompt-log/README.md`. Left as written (append-only history)._

## Entry 89 — 2026-06-29 ~00:00 UTC
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > start implementing the filter harmonization plan
- **Response summary:** Implemented the full `docs/FILTER_HARMONIZATION_PLAN.md` across both phases.
  **Phase 1:** created `src/lib/cefr.ts` (shared CEFR scale, replacing 4 duplicated arrays) and
  `src/features/shared/BrowseToolbar.tsx` (unified toolbar layout). Updated three pages:
  VocabularyTrainer (SectionHeading to HubHero, added search, BrowseToolbar), CollocationsBrowser
  (removed verb-chip rail + legend, verb moved into FacetSheet, BrowseToolbar), RedemittelTrainer
  (SectionHeading to HubHero, added search + Kategorie dropdown, BrowseToolbar). Also updated
  SubThemePicker and intentCards to use the shared CEFR_ORDER import.
  **Phase 2:** QuizHub level labels now use `difficultyToBand()` from `src/lib/cefr.ts`.
  GrammarHub/ExamHub/SimulationHub needed no changes. Verified on mobile + desktop via Playwright
  screenshots. `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green.
  Updated docs: PROJECT_STATUS.md (session 45 entry + resume pointer), FILTER_HARMONIZATION_PLAN.md
  (status to IMPLEMENTED), CLAUDE.md (added cefr.ts to layout, updated taxonomy paragraph with
  harmonized toolbar info), SESSION_PROMPT_LOG.md (this entry).
- **Artifacts:** `src/lib/cefr.ts` (new), `src/features/shared/BrowseToolbar.tsx` (new),
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/collocations/CollocationsBrowser.tsx`,
  `src/features/redemittel/RedemittelTrainer.tsx`, `src/features/vocabulary/SubThemePicker.tsx`,
  `src/features/dashboard/intentCards.ts`, `src/features/quiz/QuizHub.tsx`,
  `docs/PROJECT_STATUS.md`, `docs/FILTER_HARMONIZATION_PLAN.md`, `CLAUDE.md`,
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 90 — 2026-06-29 (session 45, ship + housekeeping prompts)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompts (verbatim, batched housekeeping):** "continue where you left off" (×2), "is everything in main?", "continue"
- **Response summary:** Completed the s45 filter-harmonization implementation (Entry 89), opened
  **PR #254** and squash-merged it to `main` (merge `303414a`), realigned the dev branch, verified all
  three browse pages plus filter sheets and quiz labels via Playwright screenshots on mobile + desktop.
- **Artifacts:** PR #254; commits `c402b8e`…`9d0ffd1`; merge `303414a`.

## Entry 91 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > i recently made a filter harmonization plan but it's not very good. can review the app first and then the filter harmonization plan and suggest a new plan that massively improve the ui/ux of the app and make it exceptionally useful?
- **Response summary:** Reviewed every route (13 screens, mobile + desktop screenshots), read the key
  feature components, extracted the learning-app playbook docx, and drafted `docs/UX_OVERHAUL_PLAN.md`:
  session-first redesign with a four-tier filter architecture and four-zone IA. Follow-up prompt
  mid-review: "make sure your plan accomodates for all screens" → plan includes a per-screen findings
  table covering every route plus header, banner, tab bar, onboarding.
- **Artifacts:** `docs/UX_OVERHAUL_PLAN.md` (new); commit `ce2e925`.

## Entry 92 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (summary; long "senior product strategist" brief):** re-issued the review request with a
  sharper rubric: be highly critical, challenge assumptions, deliver key findings / major UX problems /
  recommended filter architecture / prioritization framework / implementation roadmap.
- **Response summary:** Rewrote the plan doc around that rubric, including a self-critical review of
  the s45 work (siloed search, non-travelling scope, 100+ pill Verb facet, per-page facet wiring that
  does not scale) and the four-tier filter architecture (defaults → global search → travelling scope →
  registry-driven facets with a ≤12-option rule).
- **Artifacts:** `docs/UX_OVERHAUL_PLAN.md` (rewritten in place, same commit line).

## Entry 93 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > which claude model should I use for the above plan? there is a table in the to-do's with model suggestions. update it as well
- **Response summary:** Answered per phase (Phase 0 Sonnet 5 → Phase 1 Opus 4.8 → …; Fable only for
  Can-Do content authoring). Updated the "Model guidance" section: Fable-available-again note, Sonnet
  bumped to 5, new per-phase table for the overhaul plan, Dashboard-redesign row superseded.
- **Artifacts:** `docs/PROJECT_STATUS.md`; commit `8f06916`.

## Entry 94 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > for the four decisions from me, 1. approve, 2. I need more info on what this is, 3. add en button on the top of the app just in case the user wants to translate the whole screen at once for a few seconds and then the en gets locked - I need to brainstorm this idea - keep it as a to-do item that needs more thinking. 4. ai-drafted with review - check the data strategy so far for this
- **Response summary:** Recorded decisions 1/3/4 in Part H; added **backlog #25** (EN peek button,
  needs brainstorming); checked decision 4 against `DATA_GOVERNANCE.md` and wrote the provenance
  recipe for `canDo.ts` (origin authored, license OWNED, draft → verified, CoE CEFR descriptor
  references). Follow-up prompts: "you still did not explain me what is the point 2 of the decisions -
  explain it to me first" → plain-language explanation of the tab-bar default-pin change; then
  "okay, continue with this suggestion. I approve" → decision 2 recorded as approved, plan status
  set to FULLY APPROVED.
- **Artifacts:** `docs/UX_OVERHAUL_PLAN.md`, `docs/PROJECT_STATUS.md`; commits `25c8acc` +.

## Entry 95 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > do the necessary housekeeping and merge the plan to main. Do not implement the plan yet. I'll do it with other models as suggested in the table.
- **Response summary:** Session 46 documentation completed (status entry, resume pointer, this log),
  all docs squash-merged to `main`, branch realigned. **No implementation**, per instruction; the
  founder runs the phases in later sessions with the models from the phase table.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR + merge SHA recorded in git history.

## Entry 96 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > can you start working on the step 0 of ux overhaul plan?
- **Response summary:** Implemented `docs/UX_OVERHAUL_PLAN.md` Phase 0 (quick wins): gated the
  sign-in banner to the Heute/dashboard route with a persisted `signInBannerDismissed` setting;
  removed the redundant Level pill + XP ring from the mobile header (down to 4 widgets, both
  values still shown on Fortschritt) and labelled the streak pill; added `blurbDe`/`purposeDe`
  German fields to all 11 theme cards and 10 grammar topics (English kept as a secondary field);
  renamed "Prüfungsthemen" → "Deine Themen" and "Quick Review" → "Schnelle Runde"; replaced the
  four zero-value Fortschritt stat tiles with a goal card (sourced from existing onboarding
  settings) for learners with no XP/sessions yet. Verified with `pnpm typecheck`, `pnpm
  lint:content`, `pnpm build`, and a headless-Chromium mobile-viewport smoke pass (dashboard,
  grammar, revision, analytics).
- **Artifacts:** `scripts/lint-content.mjs`, `src/components/layout/AppShell.tsx`,
  `src/data/grammar.ts`, `src/data/themes.ts`, `src/features/analytics/Analytics.tsx`,
  `src/features/auth/SaveProgressBanner.tsx`, `src/features/dashboard/Dashboard.tsx`,
  `src/features/grammar/GrammarHub.tsx`, `src/features/revision/QuickRevision.tsx`,
  `src/store/useSettingsStore.ts`, `src/types/index.ts`, `docs/PROJECT_STATUS.md`; commit `b48abd7`,
  PR #256 (squash-merged).

## Entry 97 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > continue [after switching the session model to Opus 4.8]
- **Response summary:** Implemented `docs/UX_OVERHAUL_PLAN.md` Phase 1 (session engine + Heute), the
  core "one tap, one composed session" transformation. Built a pure composer `engine/session.ts`
  (`buildSession` interleaving due vocab + quiz + grammar + Redemittel; deterministic
  `sessionPreview`; `weakestBand`/`weakestTheme`/`difficultyForLevel`), a `SessionPlayer` that renders
  every block kind behind one progress bar + XP tally with an end screen (XP, "Stärker geworden"
  list, forward hook), and new `SessionBlock`/`SessionPlan` types. Reworked Heute to lead with a
  primary session CTA hero + Situationen chips launching scoped sessions; folded Schnellwiederholung
  into the short preset of the same engine. Reused existing renderers by extracting shared
  `QuestionViews.tsx` (QuizRunner + SessionPlayer) and adding backwards-compatible
  `onResult`/`suppressXp` props to `GrammarDrillCard`. New `/session` route. Verified with typecheck,
  lint:content, build, and a headless mobile smoke pass driving a full session to the end screen.
- **Artifacts:** new `src/engine/session.ts`, `src/features/session/SessionPlayer.tsx`,
  `src/features/session/Session.tsx`, `src/features/quiz/QuestionViews.tsx`; modified
  `src/features/dashboard/Dashboard.tsx`, `src/features/quiz/QuizRunner.tsx`,
  `src/features/revision/QuickRevision.tsx`, `src/features/grammar/GrammarDrillCard.tsx`,
  `src/router.tsx`, `src/types/index.ts`, `docs/PROJECT_STATUS.md`; commit `fecc9d6`, PR #257
  (squash-merged).

## Entry 98 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > continue [after switching the session model to Sonnet 5]
- **Response summary:** Implemented `docs/UX_OVERHAUL_PLAN.md` Phase 2 (global search + Tier-0
  defaults). Built `src/lib/search.ts` `searchAll(query)` — one query over vocabulary, collocations,
  Redemittel, grammar topics and dialogue scenarios, returning grouped deep-linking results — and a
  `GlobalSearch` dialog wired into the mobile header icon, a new Sidebar entry, and a ⌘K/Ctrl+K
  shortcut. Added Tier-0 personalized CEFR-band defaults (`defaultVisibleBands`/`hiddenBandsLabel`
  in `src/lib/cefr.ts`) to Vokabeltrainer, Kollokationen and Redemittel, with a quiet "auch X zeigen"
  escape. During verification found that the vocabulary bank has no A2/B1.1/C1-tagged items, so the
  naive band default rendered an empty list for A2 learners; fixed with a non-empty guard so the
  default never activates unless it leaves at least one result. Verified with typecheck,
  lint:content, build, and headless mobile + desktop smoke passes.
- **Artifacts:** new `src/lib/search.ts`, `src/components/layout/GlobalSearch.tsx`; modified
  `src/lib/cefr.ts`, `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`,
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/collocations/CollocationsBrowser.tsx`,
  `src/features/redemittel/RedemittelTrainer.tsx`, `docs/PROJECT_STATUS.md`; commit `b99a5db`, PR #258
  (squash-merged).

## Entry 99 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > continue [after switching the session model to Opus 4.8]
- **Response summary:** Implemented `docs/UX_OVERHAUL_PLAN.md` Phase 3 (Bibliothek + travelling
  scope). Before building, used `AskUserQuestion` to resolve how aggressively to consolidate given the
  founder-locked bottom bar (nav re-map is reserved for Phase 5); founder chose the **soft merge**.
  Built `useLibraryScope` (in-memory travelling theme scope), a `LibrarySwitcher` segmented control +
  dismissible `ScopeChip` rendered on all four library pages, wired scope hydration + write-through
  into Vokabeltrainer and Kollokationen (theme travels both ways, URL still overrides), and added an
  "Üben" button on both toolbars launching a scoped `/session?theme=`. Nothing removed; the locked bar
  + nav registry untouched (hard merge deferred to Phase 5). Fixed a mid-build bug where deep-link
  `?theme=` didn't populate the scope store. Verified with typecheck, lint:content, build, and mobile
  + desktop smoke passes.
- **Artifacts:** new `src/store/useLibraryScope.ts`, `src/features/library/LibrarySwitcher.tsx`;
  modified `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`,
  `src/features/grammar/GrammarHub.tsx`, `docs/PROJECT_STATUS.md`; commit `432fde2`.

## Entry 100 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompts (verbatim, in order):**
  > continue phase 4 now [after switching the session model to Fable 5]

  > stop for phase 4 ui part as I need to change the model to sonet

  > continue the fable task of phase 4
- **Response summary:** Authored the **content half** of `docs/UX_OVERHAUL_PLAN.md` Phase 4 (the
  Fable-appropriate pedagogical-German step). Created `src/data/canDo.ts` — 25 CEFR-aligned "Ich kann …"
  Can-Do milestones (2–3 per theme, all 11 themes, ascending bands + mastery thresholds), written in our
  own German aligned to the Council of Europe CEFR self-assessment descriptors (cited, not reproduced),
  per Part-H decision 4. Added the `CanDoStatement` type, the `can_do` provenance content type (+ the
  `/sources` page label), 25 provenance rows (`origin: authored`, `license: OWNED`, `review_status:
  "draft"` awaiting founder review), and `lint:content` validation (`lintCanDo`: unique ids, theme/cefr
  enums, "Ich kann" prefix, threshold range, full theme coverage). Per the founder's mid-task interrupt,
  **stopped before the Fortschritt UI half** (to be built on Sonnet 5). Verified with typecheck,
  lint:content, build (all green).
- **Artifacts:** new `src/data/canDo.ts`; modified `src/types/index.ts`, `src/data/provenance.ts`,
  `scripts/lint-content.mjs`, `src/features/legal/Sources.tsx`; commit `93eb4b7` (NOT merged — Phase 4 is
  incomplete, PR opens once the UI half lands).

## Entry 101 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > update all the relevant documentation so far. I'll continue this in another session [after
  > switching the session model to Opus 4.8]
- **Response summary:** Brought the documentation in sync with the whole session (Phases 0–3 merged,
  Phase 4 content-half committed but unmerged). Updated `CLAUDE.md` (Layout section for the new
  session/library/search files + `canDo.ts`; a new "UX overhaul" status block listing the phase
  progress; the Can-Do content-bank + linter conventions; refreshed the stale active-branch references
  from `claude/vibrant-meitner-mfl9xk` to `claude/ux-overhaul-step-0-7mtsff`) and `docs/PROJECT_STATUS.md`
  (Resume-here rewritten for the Phase-4 UI-half handoff, with a ⚠️ note that the branch is AHEAD of
  `main` so the next session must NOT reset --hard; new session-47 Phase-4-content log entry). No code
  changes.
- **Artifacts:** `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; doc-only commit.

## Entry 102 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt summary (not captured verbatim at the time; reconstructed from the commit record):** the
  founder reviewed the 25 Can-Do statements in `src/data/canDo.ts` (via the GitHub link) and approved
  them, completing the four-eyes review from Part-H decision 4.
- **Response summary:** Flipped all 25 `can_do` provenance rows in `src/data/provenance.ts` from
  `review_status: "draft"` to `"verified"` (`verified_by: "founder"`, `verified_date: "2026-07-02"`).
  Refreshed the `canDo.ts` file header and the `CLAUDE.md`/`PROJECT_STATUS.md` notes that previously
  said "review pending" to reflect the approval. `pnpm lint:content` now reports 25 provenance rows
  verified.
- **Artifacts:** `src/data/canDo.ts`, `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`;
  commit `72a67cf`.

## Entry 103 — 2026-07-02 (session 48)
- **Branch:** `claude/ux-overhaul-phase-4-ui-qh8si7`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim, task-runner instruction):**
  > Continue the UX overhaul, Phase 4 UI half, on branch `claude/ux-overhaul-step-0-7mtsff`. Read
  > `docs/UX_OVERHAUL_PLAN.md` (Part E5) and `docs/PROJECT_STATUS.md` "Resume here" first. Build three
  > things (mostly UI assembly over data/math that already exist): (1) a Can-Do milestone section in
  > `Analytics.tsx` as the Fortschritt headline, checked off via `canDoByTheme` + theme mastery ratio;
  > (2) a diagnose card reusing `weakestBand`/`weakestTheme` from `engine/session.ts` with a one-tap
  > "Session dazu starten"; (3) relocate the theme mastery grid from Heute to Fortschritt (already lives
  > there), replacing the Dashboard grid with a quiet "Alle Themen" link. Verify with typecheck +
  > lint:content + build + a headless-Chromium mobile smoke pass, then ship: commit, push, open one PR
  > into `main` bundling the already-committed Phase-4 content half, wait for CI, squash-merge, and do
  > the post-merge branch realignment. Update the documentation.
- **Response summary:** Discovered the session's designated branch (`claude/ux-overhaul-phase-4-ui-qh8si7`)
  had been created from `main` and did not carry the session-47 Phase-4 content commits, while the branch
  named in the task text (`claude/ux-overhaul-step-0-7mtsff`) did; reset the designated branch onto that
  content branch (no local work was lost — the designated branch was clean and identical to `main`) so
  both halves of Phase 4 could ship together. Built the **Can-Do milestone section** in `Analytics.tsx`
  (grouped by theme, least-mastered-first, checked off per statement `threshold` vs `themeStats.ratio`,
  with an overall achieved/total badge), the **diagnose card** (weakest CEFR band via `weakestBand`, or
  weakest theme via `weakestTheme` as a fresh-learner fallback, with a "Session dazu starten" button
  navigating to `/session?theme=`), and **removed the "Deine Themen" browse grid from `Dashboard.tsx`**
  (with its now-unused `iconByName`/`Progress`/`Badge`/`scenariosByTheme`/`vocabByTheme`/`mastery`/`pct`
  imports), replacing it with a quiet "Alle Themen" card linking to `/vocabulary`. Verified with
  `pnpm typecheck`, `pnpm lint:content`, `pnpm build` (all green), and a headless-Chromium mobile smoke
  pass seeding `srs`/settings into `localStorage`: confirmed the Can-Do section renders checked/unchecked
  milestones correctly, the diagnose button navigates to `/session?theme=...`, and Heute now ends in the
  hero + Situationen + status strip + "Alle Themen" link with no theme grid. Opened PR #260 into
  `main` bundling the session-47 content commits with this session's UI commit; waited for the
  `lint-content` CI check to pass, then squash-merged (`74ccd7c`) and realigned the dev branch to
  `origin/main` per the post-deploy housekeeping rule.
- **Artifacts:** modified `src/features/analytics/Analytics.tsx`, `src/features/dashboard/Dashboard.tsx`,
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/UX_OVERHAUL_PLAN.md`, `docs/SESSION_PROMPT_LOG.md`;
  PR #260, squash-merged as `74ccd7c`.

## Entry 104 — 2026-07-02 (session 49)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > go ahead with next step
- **Response summary:** Read `docs/PROJECT_STATUS.md` "Resume here", `CLAUDE.md`, and
  `docs/UX_OVERHAUL_PLAN.md` (Part E4/E6, Part G/H) to confirm the next step = **UX overhaul Phase 5**
  (Anwenden hub + nav re-map + facet registry, founder-approved). Scoped it to ship the high-value,
  founder-approved **IA restructure** as one mostly-additive PR, and deliberately deferred the low-value
  Tier-3 facet-registry/Verb-drop tail and the plan's in-page feature removals (quiz retirement + vocab
  tab removal) to a follow-up to avoid surprising removals in the nav PR. Built: **AnwendenHub**
  (`/anwenden`, 3 cards → Sprechen/Schreiben/Prüfung) + renamed the SimulationHub title to
  "Sprechsimulation"; **LibraryHub** (`/library?tab=…`) folding the four library surfaces into one URL
  with the old routes redirecting in (params preserved) via `LibraryRedirect`, and made `LibrarySwitcher`
  tab-based; **four-zone nav** in `nav-items.ts` (`DEFAULT_PINNED_TABS = ["/","/library","/anwenden",
  "/analytics"]`, navItems collapsed to the 5 zones, `ROUTE_SUCCESSOR` map) with custom `/library` +
  `/anwenden` marks in `route-icons.tsx`; and a **`useSettingsStore` persist migration** (`version: 1`)
  remapping existing users' pins/More-order onto the new zones. Verified `pnpm typecheck` +
  `pnpm lint:content` + `pnpm build` (all green) and a headless-Chromium mobile smoke pass (routing,
  redirects with preserved params, the four-zone bar, and the `version:0→1` pins migration, zero console
  errors). Updated `CLAUDE.md` (Phase 5 status + `DEFAULT_PINNED_TABS`/migration facts),
  `docs/PROJECT_STATUS.md` (session-49 log + "Resume here"), and this log.
- **Artifacts:** new `src/features/anwenden/AnwendenHub.tsx`, `src/features/library/LibraryHub.tsx`;
  modified `src/components/layout/nav-items.ts`, `src/components/layout/route-icons.tsx`,
  `src/store/useSettingsStore.ts`, `src/features/library/LibrarySwitcher.tsx`,
  `src/features/simulation/SimulationHub.tsx`, `src/features/dashboard/Dashboard.tsx`, `src/router.tsx`,
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; commit `6f373ee`, PR #262,
  squash-merged to `main` as `c317047`.

## Entry 105 — 2026-07-02 (session 49)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > What's left in the ux overhaul plan? is everything complete?
- **Response summary:** Reported that Phases 0–4 are merged and Phase 5's IA restructure just shipped, so
  the only remaining work is the **Phase-5 tail**: (1) the central facet registry (`src/lib/facets.ts`)
  + dropping the 100-option Verb facet + the ≤12-option rule, and (2) the plan's in-page removals
  (retire the standalone `/quiz` hub, remove the Vokabeltrainer Karteikarten/Quiz tabs). Noted the parked
  items (EN-peek backlog #25, the Appendix "later bets") are explicitly out of scope.
- **Artifacts:** none (informational).

## Entry 106 — 2026-07-02 (session 49)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > are the changes live?
- **Response summary:** Checked the `pages.yml` deploy run for the merge commit `c317047` via the GitHub
  Actions API. The **build job succeeded** (artifact uploaded) but the **deploy job failed** on GitHub's
  `actions/deploy-pages` step with `Deployment failed, try again later` — a transient GitHub Pages
  platform flake, not a code issue (the same failure had also hit the Phase-4 merge `74ccd7c`).
  Re-ran the failed deploy job; attempt 2 of the deploy went green (environment `https://genauly.de/`),
  so the changes went live. Flagged that this Pages flake has now recurred twice and offered to add an
  automatic retry to `pages.yml`.
- **Artifacts:** re-ran workflow run `28622060959` (deploy attempt 2, success). No code changes.

## Entry 107 — 2026-07-02 (session 49)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > yes, I see the changes. document the session
- **Response summary:** Founder confirmed the four-zone nav is live on the deployed site. Finalised the
  session documentation: filled the PR/merge references into the session-49 entries here, added entries
  105–107 for the follow-up prompts, and updated `docs/PROJECT_STATUS.md` ("Resume here" marked
  founder-verified live + PR #262/`c317047`, plus a new ops note recording the recurring `pages.yml`
  "Deployment failed, try again later" flake and the re-run remedy).
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`, `docs/PROJECT_STATUS.md`.

## Entry 108 — 2026-07-03 (session 49 cont.)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > continue with it
- **Prompt (verbatim, follow-up after a dropped AskUserQuestion):**
  > Continue from where you left off.
- **Response summary:** Completed the Phase-5 tail in two PRs. **PR #264 (`1141cde`) — facet registry:**
  new `src/lib/facets.ts` declaring each content type's facets once (`vocabFacets`/`collocationFacets`/
  `redemittelFacets` + `*_FACET_IDS`, derived from the taxonomy enums), consumed by VocabularyTrainer /
  CollocationsBrowser / RedemittelTrainer; **dropped the 100-option Verb facet** and codified the
  **≤12-option rule** (`MAX_FACET_OPTIONS` + a dev-time warning). No UI change. **Final PR — Vokabeltrainer
  tab removal:** retired the in-page Karteikarten + Quiz tabs behind a reversible `SHOW_PRACTICE_TABS =
  false` flag; the page is now the browse/inspect surface and practice flows through the toolbar's
  "Üben → composed session"; hero copy updated. Left the standalone `/quiz` hub as a live off-nav route
  reachable via deep links (no hard redirect, to preserve the GrammarHub/`practiceAreas` deep-link
  intents). Tried to confirm the visible removals via `AskUserQuestion` first, but the tool call failed
  (permission stream closed); given the two "continue" instructions I proceeded, doing the removal
  reversibly so the founder can veto it live. Verified each step with `pnpm typecheck` + `pnpm
  lint:content` + `pnpm build` (all green) and headless-Chromium mobile smokes (the three filter sheets
  render with no Verb facet; the vocab page shows the word list with no Karteikarten/Quiz tabs and
  "Üben" → `/session`, zero console errors). With this, **the whole UX overhaul roadmap (Phases 0–5) is
  complete.** Updated `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/UX_OVERHAUL_PLAN.md`, and this log.
- **Artifacts:** new `src/lib/facets.ts`; modified `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`,
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/UX_OVERHAUL_PLAN.md`, `docs/SESSION_PROMPT_LOG.md`;
  PR #264 (`1141cde`) + the final tab-removal PR.

## Entry 109 — 2026-07-03 (session 49 cont.)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Final documentation pass after the Phase-5 tail shipped. Confirmed the tail is
  deployed live: the facet-registry deploy (`1141cde`) and the Vokabeltrainer-tab-removal deploy
  (`ae67862`, PR #265) both went green, with `ae67862` succeeding on the **first** Pages attempt (no
  recurrence of the "Deployment failed, try again later" flake this time). Updated
  `docs/PROJECT_STATUS.md` "Resume here" to record that all three Phase-5 PRs (#262/#264/#265) are live,
  and added this log entry. With this, session 49 is fully documented and the whole UX overhaul roadmap
  (Phases 0–5) is complete and deployed.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

