# Implementation Plan — Genauly Taxonomy & Filtering Redesign

> Approved 2026-06-26. This is the implementation companion to the strategy/research deck
> in `docs/TAXONOMY_REDESIGN.md` (+ `docs/TAXONOMY_REDESIGN.pptx`). The deck explains *what*
> and *why*; this document is the staged, linter-gated *how*. UI mockups referenced below
> live in `preview/taxonomy/`. Nothing here is implemented yet — Phase 0–1 is the recommended
> first milestone.

## Context

Today Genauly sorts **all** learning content (Wortschatz, Kollokationen, Redemittel,
Schreibtraining) on a **single flat list of 11 themes**, surfaced through **one dropdown**
in `VocabularyTrainer.tsx`. There is **no language-level field on any content**, no
sub-topics, no "what's left to practise", and no sense of whether a learner is here for
**work or daily life**. This works at 11 themes and breaks well before 100.

The approved redesign (see `docs/TAXONOMY_REDESIGN.md` + `docs/TAXONOMY_REDESIGN.pptx`)
moves to a **faceted model with a shallow hierarchy and a top-level Mode lens**:

```
MODE (lens: work | personal | both)   ← set at onboarding, switchable, persisted
  ▸ FIELD (domain) → THEME → SUB-THEME   ← 3 visible folder levels
  + FACETS (orthogonal labels): cefr · register · pos · frequency · examTag
  + WORK-ONLY FACETS: sector · workSituation · counterpart · taskType
```

This plan turns that into staged, independently-shippable, linter-gated work. The intended
outcome: a learner can express *"formal B2 care-sector phrases I haven't mastered"* in a few
taps and get a correct, non-empty result; adding a new sector or life area becomes filling a
template, not reshaping the app.

### Decisions taken (defaults — adjustable)
1. **Scope:** full 5-phase plan; **Phase 0–1 is the recommended first milestone** (it closes
   the visible level gap and lands the Mode picker).
2. **`mode` is a NEW, separate axis** from the existing `goal` (`exam|work|fluency`). They
   answer different questions (`goal` = why/intensity; `mode` = life-domain lens). Onboarding
   keeps both. (Alternative considered: replace/derive — rejected to avoid touching
   goal-dependent code and to keep a real Personal mode.)

### Invariants / guardrails (do NOT touch)
- The **locked mobile bottom nav** (structure, edit-mode, icon rules) — this redesign adds a
  small **Mode pill in the app header**, not the nav rail.
- The **dialog/overlay tokens** (`src/components/ui/dialog.tsx`) — the new filter sheet
  **reuses** `DialogContent`/overlay, no hand-rolled overlay.
- The **provenance governance** workflow and **no-em-dash** writing rule.
- **Stable content IDs**: never rename a `themeId`/`id`; only change display labels.
- All new facets are **optional with a rollup default** so existing content stays valid and
  nothing ships in a broken state.

---

## Cross-cutting: the linter contract (`scripts/lint-content.mjs`)

Every closed axis follows the existing **mirror-array + per-dataset-validator** pattern
(`THEME_IDS`, `POS`, `REDEMITTEL_REGISTERS` … at the top of the file, validated inside
`lintVocabulary`/`lintCollocations`/etc.). For each new union added to `src/types/index.ts`,
add a matching JS array to the linter and a validation line. New data files
(`domains.ts`, `subThemes.ts`) must be added to the `ssrLoadModule` batch in `main()`.

**Run `pnpm lint:content` AND `pnpm build` after every content/type change** (the linter
catches duplicate ids and bad cross-refs that `tsc` cannot). Keep all new validations as
**errors** for closed enums and **warnings** for back-fill gaps (mirrors the provenance
`reference` warning at line ~319).

---

## Phase 0 — Foundations (types, store Mode, linter scaffolding)

**Executive summary:** Lay the entire data-model backbone with **zero user-visible change and
zero content moves**. Add the new types, the `mode` store field, the Domain/Sub-theme
registries, and the linter validations. Everything defaults to `both`/rolls up to its theme,
so the app behaves exactly as today. This is the cheap, invisible groundwork everything else
builds on.

**Detailed steps:**
1. **Types** (`src/types/index.ts`): add unions
   - `LearningMode = "work" | "personal" | "both"`
   - `ContextTag = "work" | "personal" | "both"` (per-theme/item relevance)
   - `ContentCefr = "A2" | "B1.1" | "B1.2" | "B2.1" | "B2.2" | "C1"` (content level; distinct
     from the learner's coarse `CefrLevel` in the store)
   - `DomainId`, `SubThemeId` (string slugs), `WorkSector`, `Counterpart`, `WorkSituation`,
     `TaskType`, `Frequency = "core" | "common" | "specialized"`
   - Extend interfaces with **optional** fields: `ExamTheme` gains `domain: DomainId`,
     `context: ContextTag`, `subThemes?: {id; title; titleDe; situationsIndex?}[]`;
     `VocabItem`/`Collocation` gain `cefr?`, `subThemeId?`, `frequency?`, `sector?`;
     `RedemittelPhrase` gains `cefr?`, `themeId?`, `counterpart?`.
2. **Domain registry** (`src/data/domains.ts`, new): `domains: {id: DomainId; title; titleDe;
   context: ContextTag}[]` for the ~6 fields (working-life, work-environment, everyday,
   health-social, education, exam-view). Add a `domainById` helper mirroring `themeById`.
3. **Theme parenting** (`src/data/themes.ts`): add `domain` + `context` to each of the 11
   themes (no ids change). `behoerde` → `everyday`/`personal`; the 10 work themes →
   `working-life`/`work-environment`, `context: "work"`; mark cross-use themes `both`.
4. **Store** (`src/store/useSettingsStore.ts`): add `mode: LearningMode` (default `"both"`)
   to the `SettingsState` interface + `defaults`. **No sync wiring needed** — cloudSync's
   `profileRow` already serializes every settings key into `profiles.settings` jsonb
   (`src/lib/cloudSync.ts:~139`), exactly like `pinnedTabs`/`moreOrder`.
5. **Linter** (`scripts/lint-content.mjs`): add `DOMAIN_IDS`, `CONTEXT_TAGS`, `CEFR_LEVELS`,
   `WORK_SECTORS`, `COUNTERPARTS`, `FREQUENCIES` arrays; load `domains.ts`; in `lintThemes`
   validate `domain ∈ DOMAIN_IDS` and `context ∈ CONTEXT_TAGS`; in `lintVocabulary`/
   `lintCollocations` validate the optional facets **only when present**
   (`if (v.cefr !== undefined && !CEFR_LEVELS.includes(v.cefr)) error(...)`).

**Files:** `src/types/index.ts`, `src/data/domains.ts` (new), `src/data/themes.ts`,
`src/store/useSettingsStore.ts`, `scripts/lint-content.mjs`.

**Verification:** `pnpm typecheck` clean; `pnpm lint:content` passes (counts unchanged);
`pnpm build` green; app runs identically (mode defaults to `both`, nothing filters yet).

---

## Phase 1 — Levels + the Mode picker (FIRST SHIPPABLE MILESTONE)

**Executive summary:** Deliver the first visible wins: every word/collocation shows a
**CEFR level**, the vocab browser gets a **Level filter**, and onboarding gains a **Mode
picker** with an always-present **header switch**. Also fold the quiz's private
`difficulty: 1|2|3` onto the one real CEFR scale so level means one thing everywhere.

**Detailed steps:**
1. **Tag levels** (data): populate `cefr` on `vocabulary.ts` + `collocations.ts`
   (AI-drafted, human-verified — see Back-fill section). Items left untagged render as
   "unleveled" and are simply not constrained by the Level filter.
2. **Quiz level unification** (`src/types/index.ts` + quiz data + `QuizRunner.tsx`/
   `VocabQuiz.tsx`): map the existing `Difficulty = 1|2|3` to `ContentCefr` bands (or keep the
   numeric field but derive it from `cefr`); surface no second scale to the learner.
3. **Mode picker in onboarding** (`src/features/onboarding/Onboarding.tsx`): bump `TOTAL` 4→5,
   add a Mode step **mirroring the existing goal step** — reuse the `SelectRow` component and
   the `goals`-style array (`work`/`personal`/`both` with `Briefcase`/`Home`/`Sparkles`
   icons). Add `mode` to local state and to the `completeOnboarding({...})` payload. (Pattern
   is already there at `Onboarding.tsx:138-154`.)
4. **Header Mode switch** (`AppShell`): a small pill (e.g. "💼 Beruf ▾") that opens a
   3-option popover writing `setSettings({ mode })`. Reuse `useSettingsStore`. Must be a
   **lens, not a wall** — switching only re-weights defaults; never hides content.
5. **Level filter in the browser** (`src/features/vocabulary/VocabularyTrainer.tsx`): add a
   second control next to the theme `Select`, reading/writing `?cefr=` via the existing
   `useSearchParams` pattern already used for `?theme=`. Add a `filterVocab({theme, cefr})`
   helper in `vocabulary.ts` beside `vocabByTheme` (vocabulary.ts:1341).

**Files:** `src/data/vocabulary.ts`, `src/data/collocations.ts`,
`src/features/onboarding/Onboarding.tsx`, `src/components/layout/AppShell*`,
`src/features/vocabulary/VocabularyTrainer.tsx`, quiz data + runners, `src/types/index.ts`.

**Verification:** onboarding flows through 5 steps and persists `mode` (check
`localStorage["b2beruf.settings.v1"]` and, when logged in, `profiles.settings`); header pill
switches mode and survives reload; Level filter narrows the list and the URL is
shareable/bookmarkable; `pnpm lint:content` + `pnpm build` green. Manual check via `pnpm dev`.

---

## Phase 2 — Sub-themes (the missing middle layer)

**Executive summary:** Split the densest themes into a few **sub-topics** so a topic stops
being one undifferentiated pile. The source already exists: each theme's `situations[]`
array becomes its sub-themes almost directly. Rollout is risk-free — untagged items roll up
to the theme exactly as today.

**Detailed steps:**
1. Promote `situations[]` → real `subThemes` on `themes.ts` for the 2–3 densest themes first
   (`behoerde`, `customer`, `meetings`). Give each a stable slug id (`behoerde.antrag`).
2. Tag the relevant vocab/collocations with `subThemeId` (back-fill, theme by theme).
3. **Drill-down UI**: when a theme is selected, show a sub-theme picker (mirrors the mockup
   `preview/taxonomy/03-subtheme.html`) before the card list; `?sub=` in the URL. "Theme view"
   = union of its sub-themes (no regression for untagged items).

**Files:** `src/data/themes.ts`, `src/data/vocabulary.ts`, `src/data/collocations.ts`,
`src/features/vocabulary/*` (new `SubThemePicker`), `scripts/lint-content.mjs` (validate
`subThemeId` belongs to its theme).

**Verification:** selecting a sub-theme narrows correctly; a theme with no sub-themes behaves
as before; counts add up to the theme total; lint + build green.

---

## Phase 3 — Faceted browser + Work-mode facets + goal cards

**Executive summary:** Ship the real multi-facet experience: a filter bar with a **slide-up
filter sheet** (live counts, greyed dead-ends, never an empty screen), the **Work-mode
facets** (sector / workplace situation / counterpart), and **goal/intent cards** on the
dashboard tuned to the learner's Mode. Unify the `register` enum so a cross-module "formal"
filter is meaningful.

**Detailed steps:**
1. **Shared filter component** driving AND-across-facets / OR-within-facet, live counts, and
   disabled zero-yield values; state encoded in `useSearchParams`. Mobile = chip bar + sheet
   built on `dialog.tsx`; desktop = left facet rail.
2. **Work-mode facets**: expose `sector`, `workSituation`, `counterpart` **only when
   `mode === "work"`** (conditional facets). Start with **2–3 real sectors** that have content
   (e.g. `care`, `office`) — never show an empty sector.
3. **Register unification**: widen `Collocation.register` to the Redemittel superset
   (`neutral|formal|diplomatic`); update `COLLOCATION_REGISTERS` in the linter.
4. **Goal/intent cards** (`src/features/dashboard/Dashboard.tsx`): starting-point cards that
   set a filter bundle, filtered by Mode (mockups `04-intent.html`, `07/08`).

**Files:** new `src/features/shared/FacetFilter*`, `VocabularyTrainer.tsx`,
`CollocationsBrowser.tsx`, `RedemittelPractice.tsx`, `Dashboard.tsx`, data files for
sector/situation/counterpart tags, `scripts/lint-content.mjs`.

**Verification:** filter combos show correct counts; impossible combos greyed, never blank
(show "nearest match"); Work facets appear only in Work mode; search ignores Mode; lint +
build green.

---

## Phase 4 — Cross-module linking + adaptive review

**Executive summary:** Turn four parallel banks into one connected graph and let the
SRS/writing-coach compose sessions as facet queries. This is the AI/personalization payoff;
it only becomes possible once the labels from Phases 0–3 exist.

**Detailed steps:**
1. **"Related" panel** on a vocab/word detail: query the shared `subThemeId`+`cefr` to pull
   matching collocation, Redemittel phrase, writing prompt and dialogue (mockup
   `05-cross-module.html`). No hand-maintained id lists.
2. **Mode/level-aware review** (`src/engine/srs.ts`): weight the daily queue by `mode`,
   `sector`, weak `cefr` band and `WeaknessCategory`.
3. **Writing-coach deep-links**: extend the existing `PracticeArea` routes
   (`src/data/practiceAreas.ts`) to open **filtered** drill sets (`weakness × cefr × theme`).

**Files:** `src/engine/srs.ts`, `src/features/vocabulary/*` (related panel),
`src/data/practiceAreas.ts`, writing-coach wiring.

**Verification:** a word shows correct cross-module links; review queue reflects mode/level;
"Üben" deep-links land on a pre-filtered set; lint + build green.

---

## Data back-fill strategy (applies to Phases 1–3)

- **AI-draft → human-verify**, reusing the provenance `review_status: draft → verified`
  workflow already in `src/data/provenance.ts`. An LLM proposes `cefr`/`subThemeId`/`sector`;
  the linter warns on gaps; a human confirms. Authority = Goethe/telc/DeuFöV word lists.
- **Per-theme batches**, never a big-bang re-tag. Untagged items always roll up.
- **Provenance is unaffected in Phase 0–2** because no content ids change and no items are
  added — only optional fields are set. If new sector content is authored later, add
  matching `provenance.ts` rows at the same time (linter errors otherwise).

---

## Overall verification gates (every phase)

1. `pnpm typecheck` — clean.
2. `pnpm lint:content` — passes (closed-enum errors = 0; back-fill warnings acceptable).
3. `pnpm build` (`tsc -b && vite build`) — green before any push.
4. `pnpm dev` — manual smoke test of the phase's user-visible change.
5. Settings persistence: confirm `mode` in `localStorage["b2beruf.settings.v1"]` and, logged
   in, in `profiles.settings` jsonb.
6. Locked-surface check: bottom nav, dialog overlay, no em dashes, no renamed ids.

The remote sandbox cannot reach the live `*.github.io` site or the Actions tab — final live
verification (and squash-merge to `main` per the project's auto-ship workflow) is the
founder's confirmation step.

---

## Recommended sequencing

- **Milestone 1 (ship first): Phase 0 + Phase 1.** Backbone + visible Level filter + Mode
  picker. Highest leverage, lowest risk.
- **Milestone 2: Phase 2 + Phase 3** as content density grows (sub-themes, faceted browser,
  Work facets, goal cards).
- **Milestone 3: Phase 4** (cross-module + adaptive) once labels are broadly populated.

Each phase is a self-contained PR into `main` (per the auto-ship workflow in CLAUDE.md), and
each updates `docs/PROJECT_STATUS.md` + `docs/SESSION_PROMPT_LOG.md`.
