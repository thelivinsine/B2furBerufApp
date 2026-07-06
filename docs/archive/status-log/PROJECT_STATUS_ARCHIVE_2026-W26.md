# Project Status Archive — 2026-W26 (Jun 22–28)

_Detailed session logs, sessions 31–44. Split from `PROJECT_STATUS_ARCHIVE.md` by ISO week in s70._

### Session 31 (2026-06-23) — Reference URL checker (audit-ready stream cont.) (SHIPPED ✅)
Built the automated reference-URL validator the founder asked for, the highest-leverage first step of
the still-open verification work. `scripts/check-provenance-refs.mjs` (`pnpm check:refs`) fetches every
provenance `reference` and reports dead links, wrong Wiktionary headwords (404), missing Wikipedia
articles, and unknown DWDS entries. It dedups 809 rows → **701 unique URLs** (629 status-checkable;
72 DWDS corpus-search links flagged "not auto-checkable" rather than faked; 0 malformed) and exits
non-zero on any failure. Because this sandbox blocks outbound HTTPS (`host_not_allowed`), it ships with
a manual `workflow_dispatch` GitHub Action (`.github/workflows/check-refs.yml`) so the non-technical
founder can run it from the Actions tab where egress is open; also runnable locally via `pnpm check:refs`
(`--dry` parses without network). Verified the parse/dedup path here with `--dry`. **This attests to the
"link is live" half of verification only; content accuracy (correct sense, B2 quality) still needs human
sign-off.** Docs updated (DATA_GOVERNANCE.md automated-controls list).


### Session 32 (2026-06-23) — In-app "Sources & Licenses" page (audit-ready stream cont.) (SHIPPED ✅)
Founder asked where they (and the public) can see the data and its source links. Built the
auto-generated **"Sources & Licenses" page at `/sources`** (`src/features/legal/Sources.tsx`), the
Phase 2 attribution-surfacing item from `DATA_GOVERNANCE.md`. It renders entirely from the provenance
register (so it never drifts from the content): an "our approach" intro, the upstream references we
rely on (Wiktionary, DWDS, Wikipedia, CEFR) with licences + per-source counts, the licence breakdown of
our own content, and the **full itemised list of all 809 items with a link to each source**, grouped by
content type in collapsible sections (children render only when expanded, to stay light). Bilingual
DE/EN via the shared `LegalChrome`; linked from Settings and the landing footer. Already surfaces any
`attribution_required`/`attribution_text` rows, so Tatoeba CC-BY credit will appear automatically once
ingested. **Lazy-loaded** so the ~800-row register stays out of the main bundle (main chunk unchanged at
124 KB gzip; the register is a separate 24 KB-gzip chunk loaded only on `/sources`). `pnpm build` +
typecheck green. This is the human-readable answer to "where can I see the data and sources" the founder
wanted (the raw register also lives in `src/data/provenance.ts`).


### Session 33 (2026-06-23) — First check:refs run + reference corrections (audit-ready stream cont.) (SHIPPED ✅)
Founder ran the `check:refs` workflow; it reported 183 failures. Triaged from the Actions log: the
checker was too harsh, not 183 dead links. Causes: ~70 HTTP 429 (Wikimedia rate-limiting at
concurrency 5, valid pages), 33 HTTP 403 (Council of Europe blocks bots, page fine), and **117 genuine
404s** (B2-Beruf compound nouns with no Wiktionary entry, reflexive/particle verbs like "sich
abstimmen", headword bugs like gender pairs "X / die Y" and "(Pl.)"/"(PSA)", 2 collocation DWDS
prepositional-phrase lemmas, 1 wrong Wikipedia title). Two fixes:
- **Checker hardened** (`scripts/check-provenance-refs.mjs`): concurrency 5→2, `Retry-After` honoured,
  more retries; CEFR/coe.int treated as not-status-checkable; **429/403 now bucketed as "could not
  verify" and do NOT fail the run** (only true 404/dead links do). Removes the false-negative flood.
- **117 dead references re-pointed** (`scripts/fix-provenance-refs.mjs`): the verified-404 vocab/
  collocation ids → DWDS corpus search (`/r?q=`, resolves for any attested term, honest usage
  evidence); the Konnektoren grammar topic+drills → de.wikipedia "Konjunktion (Wortart)". Touches only
  the listed ids; review_status stays "draft".
Status-checkable set now 517 (was 629); 184 not-status-checkable (DWDS corpus + CEFR). `pnpm build` +
`pnpm lint:content` green.

**Second pass (same day):** run #2 came back with 26 genuine 404s (the stragglers that were masked as
429 in run #1, now caught because the gentler checker reported zero rate-limits). All vocab compounds/
verbs; re-pointed to DWDS corpus search via the same fix script. Total dead refs corrected across the
two passes: **143**. Status-checkable set now 491; 210 not-status-checkable.

**Run #3 (2026-06-23): GREEN ✅.** All 491 status-checkable references resolve; the "links are live and
traceable" half of verification is now machine-confirmed. The remaining open work in the audit-ready
stream is the human accuracy sign-off (draft → verified), Tatoeba example-sentence sourcing, and the
Article 6(3) profiling risk assessment.


### Session 34 (2026-06-23) — check:refs green confirmed + two strategy backlog items added
- **check:refs run #3 is GREEN.** After the two correction passes (143 dead refs re-pointed), all 491
  status-checkable references resolve. The "links are live and traceable" half of provenance
  verification is machine-confirmed. (Run history: #1 183 flagged → mostly false alarms + 117 real;
  #2 26 stragglers; #3 clean.)
- **Two new backlog items added** at the founder's request: **#22 comprehensive end-to-end data
  strategy** (a single `DATA_STRATEGY.md` umbrella over content + user + AI + analytics data,
  unifying `DATA_GOVERNANCE.md`/`EXPANSION_PLAN.md`/`PHASE2_SETUP.md`) and **#23 detailed
  visualization plan for all learning components** (`VISUALIZATION_PLAN.md`: per-component visual
  specs + progress/data-viz with `recharts`, consistent with the locked design system; ties into the
  Dashboard #1, mnemonics #4, simulations #3, Schreibtraining #6 backlog items). Both mapped in the
  model-guidance table. Neither scoped/started yet.
- Docs only this session (no code). `DATA_GOVERNANCE.md` already reflected the checker; PROJECT_STATUS
  session 33 updated with the run #3 green result.


### Session 35 (2026-06-23) — Wortschatz tab overflow fix (SHIPPED ✅)
The Wortschatz (`VocabularyTrainer`) tab row has 4 tabs (Karteikarten, Quiz, Übersicht, Kollokationen);
the shared `TabsList` uses `overflow-x-auto` + `no-scrollbar`, so on narrow screens the rightmost tab
(**Kollokationen**) was clipped off the right edge with no visible scroll affordance. Fixed by adding
`flex-wrap` to that `TabsList` instance so the tabs wrap to a second row instead of clipping (all four
always visible). Local override only; the shared Tabs primitive is unchanged. `pnpm build` green.


### Session 36 (2026-06-24) — Align dedicated Kollokationen cards to the Wortschatz tile design (SHIPPED ✅)
Founder asked to apply the Wortschatz → Kollokationen tile design to the standalone `/collocations`
(`CollocationsBrowser`) cards too. Confirmed via AskUserQuestion to **keep the extra content** the
browser carries (the example's English translation + its own audio button). Restyled `CollocationCard`
to match `CollocationsList`: truncating `font-semibold` phrase, muted (non-italic) English meaning, a
**`formell` badge** top-right (replacing the old indigo formal-card background tint), and a top-border
divider with the italic German example in „…" quotes. Kept the example EN line and the example audio
button (now always visible). Removed the hover-reveal speaker machinery (`hoverHalf` state +
`onMouseMove/onMouseLeave`) so the speakers are always visible like the Wortschatz tiles. `pnpm build`
green.


### Session 37 (2026-06-24) — Founder-only source-verification overlay on /sources (SHIPPED ✅)
Founder asked for a way to mark data sources as verified and add comments, restricted to one user.
Confirmed via AskUserQuestion: **Supabase persistence** (cross-device) and **everything private**
(admin-only, comments never public). Built:
- **Migration `0004_provenance_reviews.sql`** — new `provenance_reviews` table (`content_id` PK,
  `verified`, `comment`, `reviewed_by`, `updated_at`) with an RLS policy `provenance_reviews_founder_all`
  that only allows a session whose JWT email is the founder's to read/write. Server-side lock.
- **`src/lib/admin.ts`** — `FOUNDER_EMAIL` + `isFounder(user)` client gate (mirrors the RLS email).
- **`src/lib/provenanceReviews.ts`** — best-effort `fetchProvenanceReviews()` + `saveProvenanceReview()`.
- **`Sources.tsx`** — when the founder is signed in, a "Quellenprüfung" banner (live verified count +
  save status) renders at the top, and every item row in "Alle Inhalte und ihre Quellen" gets a
  "geprüft" checkbox + a "Notiz" field, saving automatically (optimistic, debounced via onBlur for
  notes). Group summaries show `verified/total ✓` in admin mode. Public page is unchanged for everyone
  else. Bilingual DE/EN.
- **Founder one-time step:** run migration 0004 in the Supabase SQL editor (documented in
  `docs/PHASE2_SETUP.md` → "Admin source review"). Until then saves silently no-op (offline-first).
`pnpm build` + `pnpm lint:content` green.


### Session 38 (2026-06-25) — Sign-up button stuck disabled on autofill + collocations tile-cutoff check (SHIPPED ✅)
Founder reported two things from mobile screenshots:
1. **Account-creation button never activated** even with email + password filled, captcha solved
   ("Success!"), and the consent box checked. Root cause: **iOS Safari / password-manager autofill
   does not fire React's `onChange`**, so the controlled `email`/`password` state stayed empty and
   `canSubmit` never became true (the rendered Turnstile widget proved the captcha was already
   solved, and consent was visibly checked, so the email/password state was the only remaining gate).
   Fix: a WebKit autofill hook. A no-op `@keyframes onAutoFillStart` is attached to
   `input:-webkit-autofill` in `index.css`; `AuthDialog` listens via `onAnimationStart` on the email
   and password inputs and copies the autofilled `ref.value` into state, so the button enables. Plain
   typing is unaffected. `pnpm build` green.
2. **Collocations tiles "cut off"** by the bottom tab bar. Investigated: no clipping bug. The shared
   `<main>` already carries `.pb-nav` (`63px bar + safe-area + 24px`), so the last row clears the bar
   by 24px. The screenshot showed the first two collocations with no filter (132 results), i.e. the
   top of the list mid-scroll, where the translucent fixed bar naturally overlaps a passing tile. No
   code change; flagged for founder confirmation at the true bottom of the list.


### Session 39 (2026-06-25) — Mobile card grids overflowing off the right edge (SHIPPED ✅)
Founder reported (mobile screenshots) that the Kollokationen tiles were cut off on the **right**, with
the `formell` badge clipped to "for". This is a different bug from the s38 "cut off by the bottom bar"
check (that one was vertical and was a non-bug); this is real **horizontal overflow**.
- **Root cause:** the card grids declared responsive `sm:`/`md:`/`lg:grid-cols-N` but **no base
  `grid-cols-1`**. Below the smallest breakpoint, CSS grid falls back to an implicit `auto`
  (max-content) single column, which stretches to the widest card's longest unwrapped line and pushes
  the cards past the right edge of the viewport. The Kollokationen example sentence (italic German in a
  flex row) made the max-content wide enough to trigger it first.
- **Fix:** added an explicit `grid-cols-1` base to every affected grid so the mobile column is
  constrained to `1fr` (container width) and content wraps. Swept the whole app:
  `CollocationsBrowser`, `ExamHub` (×2), `VocabList`, `GrammarDrillCard`, `GrammarHub` (×2),
  `LandingPage`, `QuizHub` (×2), `RedemittelTrainer`, `Settings`, `Dashboard` (hero + cards),
  `SimulationHub`, `WritingHub`, `Analytics`. Grids that already had a base count (`CollocationsList`,
  `Flashcards`) were left as-is.
- `pnpm build` green. Shipped via **PR #219** (squash-merged to `main`). Branch:
  `claude/bug-attached-picture-fxgv5j`.
- **Also this session:**
  - **Quote-mark finding (no fix requested):** the founder first asked what the bug in a screenshot
    was. Diagnosed the collocation example sentences using **mismatched German quotes**, opening with
    `„` (U+201E) but closing with a straight ASCII `"` instead of `"` (U+201C), at
    `CollocationsBrowser.tsx:58`. Left as-is (founder only asked to identify it); the same `„…"`
    pattern likely recurs in other card components if a future sweep is wanted.
  - **Removed the prompt-logging hook (PR #221):** deleted `.claude/hooks/log-prompt.sh`, set
    `.claude/settings.json` to `{}`, and updated the stale references in `CLAUDE.md` and
    `docs/SESSION_PROMPT_LOG.md`. The existing `docs/prompt-log-raw.jsonl` is **kept** as a historical
    record (no longer appended to); the founder confirmed there's no reason to delete it.
  - **Explicit Save button on the `/sources` admin overlay (PR #223):** the founder-only source-review
    controls (s37) auto-saved silently (verified on toggle, note on blur) with only a small global
    indicator, so it felt like there was "no option to save". Added a per-row **Save** button that
    commits the `verified` flag and the note **together**, disabled until there are unsaved changes,
    showing `Speichern` → `Speichern…` → `Gespeichert ✓` and a red `Nicht gespeichert` on failure
    (Enter in the note also saves). The local cache now updates **only on a successful write**, so a
    failed save no longer looks saved. Bilingual DE/EN. `src/features/legal/Sources.tsx` +
    `src/lib/provenanceReviews.ts` flow (the parent `onChange` now returns `Promise<boolean>`).
    **Founder then ran Supabase migration 0004 and confirmed saving works** (it had shown "Nicht
    gespeichert" beforehand precisely because the `provenance_reviews` table did not exist yet).
  - **Added backlog #24 (PR #224):** "Deep-dive source review + source strategy" — review every external
    source, confirm licences/commercial-use terms, fix problem sources (the founder flagged a **dwds.de**
    item that requires login), reconcile claims against the SPDX allowlist, and define a ranked source
    strategy per content type. Cross-linked to #7 (audit infra) and #22 (data strategy). The actual
    dwds.de source swap was intentionally **deferred** under this item at the founder's request.
- **Preferences recorded this session:**
  - The prompt log (`docs/SESSION_PROMPT_LOG.md`) is now updated **manually, only when the founder
    asks** — never automatically. The `UserPromptSubmit` auto-logging hook was removed accordingly.


### Session 40 (2026-06-26) — Triple collocations bank + hide example translations + Select dropdown overlay
- **Collocations bank tripled** from 132 to **396** Nomen-Verb pairs (264 new entries, +24 per theme
  across all 11 themes). High-frequency, exam-relevant B1-B2 pairs sourced from standard telc/Goethe
  word fields. `behoerde` theme leans on formal Amt/Antrag/Behörde register. PR #226.
- **English example translations hidden** on the dedicated `/collocations` cards. The phrase-level
  English gloss (`c.en`) remains visible; only the example sentence English (`c.example.en`) is hidden
  in the UI. Data and linter unchanged (field still required and populated).
- **Kollokationen tab hidden** inside Wortschatz (`/vocabulary`). Collocations are now only reachable
  via the dedicated `/collocations` menu item. Implemented as commented-out code (reversible).
- **264 provenance rows** added to `src/data/provenance.ts` (total: 1073). Each new collocation has a
  matching DWDS-referenced provenance entry.
- **Select dropdown scrim overlay** (PRs #227–#229): founder reported poor contrast between the
  dropdown menu and the page content behind it. Added a `bg-dialog-overlay` scrim (the same
  brand-tinted radial spotlight used by the login dialog, per the locked overlay convention) behind
  the Select dropdown via `createPortal`. The dropdown card uses `shadow-elevated-soft` + `rounded-xl`
  matching the dialog card styling. Open state is tracked via React context (`SelectOpenCtx`) so the
  scrim only renders while the dropdown is actually open and is removed when it closes.
- `pnpm lint:content` and `pnpm build` both pass clean.


### Session 41 (2026-06-26) — Taxonomy & filtering redesign: research deck + Mode layer + implementation plan (docs-only, MERGED ✅)
A research + strategy + planning session. **No app code changed; documentation/artifacts only.** Scopes
backlog **#5** (domain/sector-based filtering) plus the founder's new Work/Personal/Both idea.
- **Strategy deck authored** in two forms: `docs/plans/TAXONOMY_REDESIGN.md` (detailed technical version) and
  `docs/reference/TAXONOMY_REDESIGN.pptx` (**37-slide** plain-language deck for the non-technical founder, built
  programmatically with python-pptx). Recommends a **faceted model** (mix-and-match labels) over the
  current flat single-axis list, with a shallow **Domain → Theme → Sub-theme** hierarchy and orthogonal
  facets (cefr, register, pos, frequency, exam tag).
- **Diagnosis grounded in the codebase:** the app today runs three incompatible taxonomies (themes for
  vocab/collocations, communicative function for Redemittel, grammar groups for grammar), has **no
  CEFR/level field on any content** (only quiz `difficulty: 1|2|3`, unsurfaced), and filters via a
  single theme `Select` in `VocabularyTrainer.tsx`.
- **Work/Personal/Both "Mode" layer added** (founder's idea, session iteration): a top-level lens set at
  onboarding that scopes the tree and unlocks work-only facets (**sector, workplace situation,
  counterpart, task type**). Designed as a **lens, not a wall** (never hides content). Grounded in real
  web research: telc/BAMF *Rahmencurriculum für den Beruf* (fields of action + counterpart), **DeuFöV**
  state courses splitting job German by sector (care/technical/commercial), telc *Deutsch Pflege* exam,
  and Babbel/Duolingo goal-based onboarding. Sources listed on the deck's References slides.
- **8 UI mockups** built in `preview/taxonomy/` (HTML matching the app's brand tokens, screenshotted with
  the bundled Chromium): before/after vocab browser, sub-topic drill-down, goal-first home,
  connected-word detail, advanced filter sheet, **Mode picker**, **Work-mode browser**.
- **Approved implementation plan** written to `docs/plans/TAXONOMY_IMPLEMENTATION_PLAN.md`: Phases 0–4
  (0 = types + store `mode` + linter foundations, invisible; 1 = CEFR levels + onboarding Mode picker +
  header switch + Level filter = first shippable milestone; 2 = sub-themes; 3 = faceted browser +
  work-mode facets + goal cards; 4 = cross-module links + adaptive review). Reuses the existing settings
  store (`goal`/`level` already there, cloudSync auto-syncs new keys), the linter's mirror-array pattern,
  the onboarding `SelectRow`, and the provenance draft→verify workflow. **Decisions locked:** full
  5-phase plan; `mode` is a NEW axis separate from the existing `goal` (exam/work/fluency).
- **Shipped via PR #231** (squash-merged to `main`, merge SHA `6fe25c7`): all of the above docs +
  mockups. Post-merge realignment done (branch reset to `origin/main`, force-with-lease). **Nothing is
  implemented yet** — Phase 0–1 is the recommended next build step.

---


### Session 42 (2026-06-27) — Taxonomy redesign Phases 0–2 IMPLEMENTED & SHIPPED ✅
First build session on the approved `docs/plans/TAXONOMY_IMPLEMENTATION_PLAN.md`. Phases 0, 1 and 2 are now
live on `main` across three squash-merged PRs. Untagged-rolls-up invariant held throughout, so nothing
regressed.
- **Phase 0 — foundations (PR #233, then completed in #234):** new faceted types in
  `src/types/index.ts` (`DomainId`, `LearningMode`, `ContextTag`, `ContentCefr`, `Frequency`,
  `WorkSector`, `Counterpart`, `WorkSituation`, `TaskType`, `SubThemeId`, `SubTheme`); `domains.ts`
  registry (6 domains) + `domainById`; all 11 themes given `domain` + `context`; `mode: LearningMode`
  (default `"both"`) added to `useSettingsStore` (rides cloudSync automatically). Optional facet fields
  added to `ExamTheme`/`VocabItem`/`Collocation`/`RedemittelPhrase` (all optional → existing content
  stays valid). Linter got mirror arrays + validate-when-present checks for every new enum. #234 closed
  the Phase-0 checklist tail: `ExamTheme.subThemes?`, `SubThemeId` alias, and wired
  `workSituation?`/`taskType?` as real validated facets (peers of `sector`/`counterpart`).
- **Phase 1 — levels + Mode picker (PR #233):** all **515 vocab + 396 collocations tagged with `cefr`**
  (AI-drafted; **human-verify still pending** via provenance `draft→verified`). Onboarding gained a
  **Mode step** (Beruf/Alltag/Beides, 4→5 steps). New **`ModeSwitcher`** pill in the app header
  (persists `mode`; currently a saved setting with no content effect yet — re-weighting is Phase 3).
  **CEFR Level filter** added to `VocabularyTrainer` (`?cefr=`, shareable). Quiz `Difficulty 1|2|3`
  relabelled to CEFR bands (B1 / B2.1 / B2.2·C1) in `QuizHub`/`QuizRunner` (numeric kept internally for
  question-type selection).
- **Phase 2 — sub-themes (PR #235, SHA `59b9e62`):** `behoerde` (4), `customer` (3) and `meetings` (3)
  split into sub-topics derived from their `situations[]`. **122 vocab + 105 collocations tagged with
  `subThemeId`**; cross-cutting items (soft-skill adjectives, connectors, generic "Behörde") left
  untagged on purpose. New **`SubThemePicker`** drill-down (per-sub count + CEFR span, plus a dashed
  "Gesamtes Thema" escape hatch that includes untagged items). `VocabularyTrainer` gained `?sub=` +
  breadcrumb + sub-aware filtering/counts; helpers `vocabBySubTheme`/`collocationsBySubTheme` and a `sub`
  option on `filterVocab`. Linter now cross-validates every `subThemeId` is declared on its theme. Counts
  reconcile: behoerde 24+1, customer 45+5, meetings 53+1.
- **Phase 3a — mode-aware intent cards (session 43):** the dashboard now opens with a **"Was möchtest
  du üben?" row of starting-point cards** (`src/features/dashboard/intentCards.ts` + `Dashboard.tsx`).
  Each card carries a pre-built filter bundle and deep-links into the matching browser view (e.g.
  `behoerde.meldewesen`, `meetings.beitrag`, `customer.beratung`, `/redemittel`, `/writing`).
  `intentCardsForMode(mode)` filters by the active lens (a `both` card or `both` mode always shows, so
  the screen never empties); word counts + CEFR ranges are computed live from `filterVocab`. **This is
  the first place `mode` actually changes what the learner sees.**
- **Phase 3b — register unification + faceted filter (session 43):** `Collocation.register` widened to
  `neutral|formal|diplomatic` (linter `COLLOCATION_REGISTERS` + card badge updated). New reusable
  **`src/features/shared/FacetSheet.tsx`**: a "Filter" chip opens a slide-up sheet (reusing `dialog.tsx`,
  overridden to a bottom sheet) whose multi-select option pills show **live counts** and **grey out
  zero-yield values**, so you can't tap into an empty screen (AND-across-facets / OR-within-facet;
  `matchesFacets`/`applyFacets`/`activeFacetCount` exported). Generic over item type. **Wired into the
  CollocationsBrowser first** (CEFR + Register facets, state in `?cefr=`/`?register=`, removable
  active-filter chips in the bar). Collocations had no level/register filtering before, so this is pure
  new capability and the lowest-risk proving ground.
- **Sector back-fill (session 43, PR #242):** authored a **13-word care/Pflege pack** (`die Schicht`,
  `die Übergabe`, `die Hygiene`, `der Angehörige`, `die Fallbesprechung`, `die Pflegedokumentation`, …)
  spread across existing themes (scheduling/safety/customer/conflict/meetings/technology) so the
  orthogonal `sector` facet genuinely cuts across topics, plus a curated set of `office` tags
  (Besprechung/Protokoll/Sitzung/Beschluss/Frist/Deadline/…). Vocab 515→528; matching provenance rows.
  This unblocked the Work-mode facets. Honest first pass, not exhaustive (sector rolls up).
- **Phase 3c — vocab faceted filter + Work-mode sector facet (session 43):** `FacetSheet` wired into the
  **VocabularyTrainer**, replacing the old standalone CEFR `Select`. Facets: **CEFR + Wortart** always,
  plus the **`sector` ("Branche") facet shown only when the Mode lens is `work`** (`facets` is derived
  from `learningMode`). State in `?cefr=`/`?pos=`/`?sector=` (multi-select), removable active-filter
  chips in the bar. The theme `Select` + sub-theme drill-down are untouched; facets apply on top of the
  theme/sub scope. So **switching to Work mode now reveals the Pflege/Büro sector filter** — the
  Work-mode facets are functional end to end.
- **Verification each phase:** `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green. Sandbox
  can't reach the live `*.github.io` site; founder confirms the deployed result.
- **Redemittel Register filter (session 43):** the Redemittel browse view gained a `FacetSheet` **Register
  filter** (neutral/formell/diplomatisch, present 38/29/5); categories with no matches are hidden. State
  in `?register=`.
- **Dashboard restructure (session 43, PR #244):** the dashboard now **leads with the "Was möchtest du
  üben?" intent tiles**. Removed the big focal hero + four-stat status strip + level bar (all already on
  the Fortschritt page) and replaced them with **one compact summary strip** below the tiles (streak ·
  today XP/goal · days-to-exam · recommended action · "Fortschritt" link). Mode pill untouched.
- **workSituation facet (session 43):** tagged a cross-cutting set of vocab (`shift-handover` for the
  care shift words, `instructions` for safety/hygiene, `meeting`, `customer-call`) and exposed it as a
  **2nd Work-mode facet "Situation"** in the Vokabeltrainer (next to "Branche"); both appear only in Work
  mode. `counterpart` left 0-tagged on purpose (redemittel are general-purpose → low-signal).
- **Phase 4 step 1 — cross-module "Verbunden" panel (session 43):** `src/features/vocabulary/RelatedPanel.tsx`.
  In the Vokabeltrainer **Übersicht** list, each word now expands ("Verbunden") to show matching content
  from the other banks via the shared `themeId`/`subThemeId` join key: a **Kollokation** (same sub-theme
  if available → `/collocations?theme=`), the theme's **Schreibtraining** prompt (→ `/writing?theme=`),
  and a **Dialog** (→ `/simulation`). No hand-kept id lists. Redemittel aren't linked (no `themeId`).
- **Phase 4 steps 2 + 3 (session 43):** **(2) mode/level-aware review** — `reviewWeight()` in
  `src/engine/srs.ts` (pure) + `QuickRevision` now build the Schnellwiederholung deck weighted by the Mode
  lens (theme `context`), card weakness, and the learner's weakest CEFR band (weighted selection, never a
  wall). **(3) writing-coach deep-links** — `practiceRoute()` in `practiceAreas.ts` folds the writing
  prompt's `theme` into the "Üben" deep-link so it opens a filtered drill set (theme-aware `/vocabulary`/
  `/collocations`/`/quiz`; formal Redemittel for the register weakness). **Phase 4 is complete.**
- **Historical pointer (as of session 43; see the `## Resume here` section below for current next steps) →**
  the **taxonomy redesign (Phases 0–4) is fully shipped.** Optional follow-ups: human-verify
  the AI-drafted `cefr` tags (provenance `draft→verified`), broaden `sector`/`workSituation` tagging, extend
  sub-themes past 3 of 11, and (if wanted) give Redemittel a `themeId`/`counterpart` pass to unlock more
  cross-links. Otherwise the next big rock is a **new life-domain theme** (banking / healthcare / housing)
  per the product scope.


### Session 43 (2026-06-27) — Taxonomy redesign Phases 3–4 SHIPPED + dashboard restructure ✅
Completed the taxonomy redesign. All of Phase 3 and Phase 4 are live on `main` across nine squash-merged
PRs (#240–#248). The untagged-rolls-up invariant held throughout. Highlights (full detail in the taxonomy
section above):
- **Phase 3 — faceted browser, Work-mode facets, intent cards.** Mode-aware **intent cards** on the
  dashboard (#240); **register unification** + reusable **`FacetSheet`** (live counts, greyed dead-ends)
  wired into Kollokationen (#241); **care/Pflege sector back-fill** + first `office` tags, vocab 515→528
  (#242); FacetSheet in the Vokabeltrainer with CEFR + Wortart + Work-only **Branche** facet (#243);
  Redemittel **Register filter** (#245); **workSituation** tags + Work-only **Situation** facet (#246).
  `mode` now has a real content effect (filters intent cards, gates the Work facets).
- **Dashboard restructure (#244):** leads with the "Was möchtest du üben?" tiles; the big progress block
  collapsed to a compact strip (full stats already live on Fortschritt).
- **Phase 4 — cross-module linking + adaptive review.** Cross-module **"Verbunden" panel** on vocab words
  (#247); **mode/level-aware** Schnellwiederholung deck via pure `reviewWeight()` + weakest-CEFR-band
  detection, plus **filtered writing-coach deep-links** via `practiceRoute()` (#248).
- **Deliberate non-actions (documented):** `counterpart` left 0-tagged and Redemittel left without a
  `themeId` (both are general-purpose, so tags would be low-signal). `cefr` tags remain AI-draft pending
  human verification.
- `pnpm lint:content` + `pnpm build` green on every PR; branch realigned to `main` after each squash-merge.


### Session 44 (2026-06-28) — Session-43 review, app-wide dark-mode fix, filter-harmonization plan ✅
A review + bugfix + planning session on branch `claude/review-previous-session-69pxat`. Three PRs
squash-merged to `main` (#250–#252).
- **Reviewed session 43** end to end (taxonomy Phases 3–4): build/typecheck/`lint:content` green,
  every new view implemented as documented and responsive. Fixed one latent mobile bug, the
  `FacetSheet` bottom sheet inherited `overflow-y-auto` on the whole container, so on a short viewport
  the "Apply" button could scroll away. Constrained the grid (`grid-rows-[auto_auto_minmax(0,1fr)_auto]`)
  so only the facet list scrolls and the footer stays pinned (**PR #250**).
- **App-wide dark-mode fix (#251).** Founder reported the Kollokationen filter pills rendering bright
  white in dark mode. Root cause: **Tailwind's opacity scale only contains multiples of 5, so any
  color utility using `/8` or `/12` silently failed to compile** (verified in the production CSS, zero
  rules emitted). Effects: `bg-white dark:bg-white/8` pills lost their dark override and fell back to
  white; every `/12` tint (badges, stat cards, header streak/level pills, exam/simulation/onboarding
  icon boxes, RelatedPanel chips) rendered with no background at all. Bumped all `/8` and `/12`
  color-opacity utilities to `/10` (34 utilities across 16 files); audited the whole `src` tree, those
  were the only non-multiple-of-5 steps in use, and no hardcoded light-only colors lack a dark variant.
  **Lesson for future work: only use opacity steps that are multiples of 5** (e.g. `/10`, `/15`), the
  build does not warn on invalid ones.
- **Filter-harmonization plan (#252, docs-only).** Founder flagged the search bar / filter button /
  filter options / theme + branche controls as chaotic and inconsistent across Wortschatz,
  Kollokationen, Redemittel, etc. Researched the codebase + `docs/plans/TAXONOMY_REDESIGN.md` + the uploaded
  learning-app playbook (`docs/reference/Language Learning App Success Factors.docx`) and wrote
  **`docs/plans/FILTER_HARMONIZATION_PLAN.md`**: one shared `Search + Theme + Filter` toolbar
  (`BrowseToolbar`) + the existing `FacetSheet` on every page, a single responsive panel for
  mobile+desktop, branded `HubHero` header everywhere, a shared `src/lib/cefr.ts` for consistent CEFR
  labels, and the verb-rail/legend decluttered into the sheet. Phased: Phase 1 = the 3 filtering pages,
  Phase 2 = the simpler hubs. **Implemented in session 45 (below).**
- **Historical pointer (as of session 46; superseded by the `## Resume here` section below) →** the
  **UX overhaul plan was fully approved and became the roadmap.** Start with Phase 0 (quick wins, Sonnet 5), then Phase 1 (session engine, Opus 4.8); see
  the phase/model table under "Model guidance". The older follow-ups (human-verify `cefr` tags, new
  life-domain themes) slot in after or alongside; new themes land best after Phase 3 (Bibliothek).


