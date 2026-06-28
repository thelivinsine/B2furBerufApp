# Harmonize the filter / search / header controls across browse pages

> Status: **PLANNED, not yet implemented** (drafted session 44, 2026-06-28). Approach approved by the
> founder. Implement Phase 1 first, ship, verify, then Phase 2. See `docs/TAXONOMY_REDESIGN.md` for
> the underlying faceted-model spec and `docs/Language Learning App Success Factors.docx` for the
> learning-app playbook this aligns with.

## Context

The content-browse pages grew their filter UIs independently, so today every page looks and
behaves differently. From the founder's screenshots and the code audit:

- **Headers** are split two ways: `SectionHeading` (Wortschatz, Redemittel) vs `HubHero` (Kollokationen, Quiz, Grammatik, Simulation, Pruefung).
- **Search** exists only on Kollokationen.
- **The Filter button sits in a different place on every page** (header-right on Wortschatz, mid-row on Kollokationen, below the tabs on Redemittel).
- **Bespoke secondary widgets** add noise: Kollokationen has a scroll/expand verb-chip rail **and** a redundant Neutral/Formal colour legend; Wortschatz has the `SubThemePicker`; Quiz has its own level cards.
- **CEFR is labelled inconsistently** (the facet sheet shows the sub-bands present in data, e.g. `B1.2 / B2.1 / B2.2`, while the Quiz picker shows `B1 / B2.1 / B2.2·C1`).

This violates both the project's own taxonomy spec and the uploaded learning-app playbook:

- `docs/TAXONOMY_REDESIGN.md` already prescribes the intended model (Slide 13–15): **Tier-1 core
  controls always visible, Tier-2/3 facets behind one "Filter" sheet, live counts, greyed
  zero-yield options, URL-encoded state, search scoped by the active facets, Mode as a lens that
  never gatekeeps**. It was simply never applied uniformly.
- `docs/Language Learning App Success Factors.docx`: the **Coherence Principle** ("exclude all
  non-essential graphics... screen clutter competes for limited working memory"), **Friction
  Reduction** ("simplify the UI to direct immediate focus to the primary learning activity"), and
  **Discoverability / Intelligent Search** ("maintain an open, searchable content hub").

**Goal:** one shared, predictable control strip on every browse page (identical position, styling,
and behaviour), less on-screen clutter, search everywhere, and consistent CEFR labelling. Same data,
graduated complexity.

## Decisions locked (with the founder)

1. **Phased rollout.** Phase 1 = the 3 pages that actually filter (Wortschatz, Kollokationen,
   Redemittel); ship and let the founder verify. Phase 2 = align the simpler hubs (Quiz, Grammatik,
   Simulation, Pruefung) for visual + label consistency.
2. **One responsive panel.** Keep the single slide-up `FacetSheet` for both mobile and desktop (it
   already renders as a centered card on `sm+`). No separate desktop facet rail.
3. **Branded `HubHero` header everywhere.** Convert Wortschatz + Redemittel to `HubHero`.
4. **Inline toolbar = Search + Theme + Filter.** CEFR level and every other facet live inside the
   Filter sheet. Cleanest, lowest cognitive load.

## The unified pattern

Every filterable browse page renders, directly under the `HubHero`:

```
[ 🔍 Search ...................... ]  [ Primary ▾ ]  [ ⚙ Filter (n) ]   ← one row, identical everywhere
[ ✕ chip ] [ ✕ chip ] [ ✕ chip ] ...                                    ← active-filter chips (only when present)
```

- **Search** (left, `flex-1`): free text scoped by the active facets, per the doc. Searches the
  natural fields of each module (vocab: de/en/related; collocations: full/noun/verb/en; redemittel:
  de/en). Clear (✕) button when non-empty.
- **Primary ▾**: the module's primary axis as an inline `Select`, same slot on every page. Theme for
  Wortschatz + Kollokationen; **Kategorie/Funktion** for Redemittel (its primary axis per
  `TAXONOMY_REDESIGN.md` Slide 17). Keeps layout identical even though the axis differs.
- **Filter (n)**: the existing `FacetSheet` trigger, unchanged styling, with the active-count badge.
- **Active chips**: every selected facet value as a removable `ActiveFilterChip`, in one consistent
  row (reusing the existing component).

The sheet itself keeps its current proven behaviour (live counts, greyed dead-ends,
AND-across / OR-within, "Zuruecksetzen", apply button with the live result count, pinned footer).

## New shared pieces

- **`src/features/shared/BrowseToolbar.tsx`** (new). A thin layout wrapper that fixes the position
  and styling of `[search] [primary Select] [FacetSheet trigger]` + the active-chips row. Props:
  `search`, `onSearch`, `searchPlaceholder`; optional `primary` (`{ value, onChange, options:
  {value,label,count}[] }`) rendered with the existing `src/components/ui/select.tsx`; and the
  `FacetSheet` passthrough (`items`, `facets`, `selection`, `onChange`, `resultLabel`) plus a
  computed `activeChips` list. Reuses `FacetSheet`, `ActiveFilterChip` from
  `src/features/shared/FacetSheet.tsx`. No new filter logic, it only standardizes the chrome.
- **`src/lib/cefr.ts`** (new). Single source of truth for the CEFR scale: `CEFR_ORDER`
  (`A2,B1.1,B1.2,B2.1,B2.2,C1`), a label helper, and the Quiz `difficulty 1|2|3 → band` mapping
  (`1→B1`, `2→B2.1`, `3→B2.2·C1`). Replaces the duplicated `CEFR_ORDER` arrays currently copy-pasted
  in `VocabularyTrainer.tsx`, `CollocationsBrowser.tsx`, `SubThemePicker.tsx`,
  `dashboard/intentCards.ts`, and `quiz/QuizHub.tsx`, so labels can never drift again.
- **Optional, only if the verb list feels long:** add an in-sheet option search to `FacetSheet`
  (filter the option pills of one facet by a small text box). Used by the Kollokationen "Verb"
  facet. Skip if the wrapped/scrollable pill grid reads fine.

## Phase 1 — the three filtering pages

**`src/features/vocabulary/VocabularyTrainer.tsx`**
- Header `SectionHeading` → `HubHero` (reuse `src/components/shared/HubHero.tsx`; icon + accent).
- Replace the header `action` (theme `Select` + `FacetSheet`) with `BrowseToolbar`: **add Search**
  (over de/en/related), Theme dropdown, Filter. Wire search into the existing
  `filterVocab({theme, sub})` → `applyFacets` pipeline as an extra predicate.
- Keep the `SubThemePicker` drill-down + breadcrumb and the Karteikarten/Quiz/Uebersicht tabs; they
  now sit below the unified toolbar. Facets unchanged: CEFR + Wortart always, Branche + Situation in
  Work mode (`mode` gating preserved, it stays a lens).

**`src/features/collocations/CollocationsBrowser.tsx`**
- Keep `HubHero`. Replace the theme+search+facet row, **the verb-chip scroll/expand rail, and the
  Neutral/Formal legend** with `BrowseToolbar` (Search + Theme + Filter). Net declutter.
- **Move the verb filter into the Filter sheet** as a `Verb` facet (so it joins live-count + chip
  behaviour and the noisy arrow-scroller disappears). Drop the colour legend (the formell/
  diplomatisch badge on each card already conveys register).
- Keep the theme-scoped Quiz CTA, relocated to a small button in/next to the toolbar.
- Facets in sheet: CEFR + Register + Verb.

**`src/features/redemittel/RedemittelTrainer.tsx`**
- Header `SectionHeading` → `HubHero`. Keep the Wendungen/Ueben tabs.
- In the Wendungen tab use `BrowseToolbar`: **add Search** (over de/en) + primary dropdown =
  **Kategorie** (`redemittelCategories`, its primary axis) + Filter (Register facet). When a single
  category is picked, render just that category's cards; "Alle" keeps the current sectioned layout.

## Phase 2 — align the non-filtering hubs (consistency only)

- `quiz/QuizHub.tsx`, `simulation/SimulationHub.tsx`: relabel their CEFR/level chips through
  `src/lib/cefr.ts` so the bands read identically to the facet sheet. Quiz keeps its 3-tier level
  **picker** (it chooses difficulty for a generated quiz, not list filtering), just consistent labels.
- `grammar/GrammarHub.tsx`, `exam/ExamHub.tsx`: already `HubHero`; confirm header spacing matches the
  others. Optional later: a topic search box on Grammatik (playbook's searchable hub), not required now.

## Out of scope (explicitly deferred)

- No new desktop facet rail (decision 2).
- No data/tagging changes: no new `sector`/`workSituation` values, no Redemittel `themeId`, no
  sub-theme expansion past the current 3 of 11. The doc's "rolls up / never gatekeeps" invariants
  hold; untagged items keep appearing under their parent.
- The locked mobile bottom-tab bar, the dialog-overlay tokens, and the no-em-dash copy rule are
  respected, not touched.

## Verification

- `pnpm typecheck` + `pnpm lint:content` + `pnpm build` green after each page.
- Manual pass on **mobile width and desktop width** for each Phase-1 page:
  - toolbar is byte-for-byte the same shape (Search · Theme/Kategorie · Filter) and position;
  - Filter sheet opens, live counts + greyed dead-ends work, footer button pinned, chips removable;
  - search narrows results and composes with facets; URL params (`?theme=&sub=&cefr=&pos=&sector=&workSituation=&register=&verb=&q=`) round-trip and are shareable;
  - **dark mode** correct (watch for any new `bg-white` pills; reuse the existing `dark:` patterns);
  - Work-mode lens still reveals Branche/Situation only in Work mode.
- Ship Phase 1 as one squash-merged PR to `main`; founder verifies the live site; then Phase 2.

## Critical files

- New: `src/features/shared/BrowseToolbar.tsx`, `src/lib/cefr.ts`
- Reuse: `src/features/shared/FacetSheet.tsx`, `src/components/shared/HubHero.tsx`,
  `src/components/ui/select.tsx`, `src/data/{vocabulary,collocations,redemittel,themes}.ts`
- Modify (Phase 1): `VocabularyTrainer.tsx`, `collocations/CollocationsBrowser.tsx`,
  `redemittel/RedemittelTrainer.tsx`
- Modify (Phase 2): `quiz/QuizHub.tsx`, `simulation/SimulationHub.tsx`, `grammar/GrammarHub.tsx`,
  `exam/ExamHub.tsx`
- Docs to update on completion: `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, and the
  taxonomy/filter notes in `CLAUDE.md`.
