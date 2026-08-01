# Bibliothek (`/library`) — current state

The four-tab content hub and THE reference design language for the whole app (see the `/design`
skill). History/why: `docs/DECISIONS.md`.

## Hub & routing
- Single `/library?tab=woerter|kollokationen|redemittel|grammatik`; old routes (`/vocabulary`,
  `/collocations`, `/redemittel`, `/grammar`) redirect in, query params preserved.
- `LibrarySwitcher` IS the page header (no HubHero/H1): a lifted `shadow-soft` bar, active tab
  bold + brand, quiet inactive, sliding white pill, `text-sm` on ALL breakpoints. Sliding-pill
  mechanism for BOTH switchers is the shared `src/features/shared/useSlidingPill.ts` hook: ONE
  always-mounted pill measured via `offsetLeft`/`offsetWidth` (pre-paint `useLayoutEffect` +
  `ResizeObserver`), animating only `x`/`width`. **Never reintroduce the per-segment framer
  `layoutId` crossfade** (it stuttered against the trainer re-render).
- Lists default to the learner's CEFR band + 1 (`defaultVisibleBands`).
- **Global search:** `lib/search.ts` `searchAll` + `GlobalSearch` (header icon on desktop /
  Sidebar / ⌘K; no mobile entry by founder choice). Reads `browsableVocabulary`.

## Views per tab
`features/shared/ViewSwitcher.tsx` (`?view=`, `karten` default kept out of the URL): Wörter =
Tabelle · Graph · Karten · Liste; Kollokationen = Tabelle · Graph · Karten · Liste; Redemittel =
Tabelle · Karten · Liste; Grammatik = Karten · Liste. Tabelle = generic sortable
`features/shared/DataTable.tsx` (German collation, missing values sink, paged rows; sort-header
buttons need their own `uppercase`, Tailwind preflight resets it on buttons) with per-tab columns
+ compact lists in `vocabulary/VocabViews.tsx` / `collocations/CollocationViews.tsx` /
`redemittel/RedemittelViews.tsx`. Branche chips show on Tabelle/Karten.

## Card grids (all four tabs' Karten views)
- **Every tile in a Karten grid is the SAME height, not just the ones sharing a row** (founder
  2026-07-31). The grids carry `auto-rows-fr`: `1fr` rows in an auto-height grid all resolve to the
  tallest row, so the height stays content-driven (a filtered set of short cards stays compact) and
  nothing is ever clipped by a fixed height. Applies to `vocabulary/VocabList.tsx`,
  `collocations/CollocationsBrowser.tsx`, `redemittel/RedemittelTrainer.tsx`,
  `grammar/GrammarViews.tsx`.
- **Card content is vertically centered** in Wörter / Kollokationen / Redemittel
  (`justify-center`, and on the Wörter front the example takes the slack via `flex-1 items-center`):
  with one height for the whole grid, top-aligned content leaves a hollow lower half. Elements that
  were already anchored stay anchored (the Wörter foot row, the Grammatik pattern chip + foot).

## Wörter card (Karten view; `vocabulary/VocabList.tsx`)
- Both faces are stacked in ONE grid cell by `FlipCard`, so the tile sizes to the TALLER face; the
  back can grow without clipping.
- **Front:** quiet headline (Wesen creature + word left, bookmark right), then the German example. NO
  filter facets on the tile (founder 2026-07-13: Häufigkeit, Branche and the mastery badge were all
  dropped as rail-redundant). Foot row: one grey pill left, speak button right.
- **The foot pill is the word's inflection**, and it is per part of speech: a noun shows
  `Pl.: die Termine`, a **verb shows `Perf.: hat verschoben`** (s178 audit P2, founder pick C from
  `preview/verb-forms-card.html`). Same slot, same styling; a word with neither just right-aligns the
  speak button.
- **Back:** "Englisch" eyebrow, the gloss, then the inflection repeated in full. For nouns that is the
  existing `Plural: …` line; for verbs a compact `dl` of Präteritum · Perfekt · mit zu · trennbar,
  each pair present only when the data has it, laid out **two label/value pairs per row** (2026-07-31:
  as a single column the paradigm ran four rows and made verb tiles the tallest card in the grid,
  which then set the height for every card once the grid was equalized). Values come from the generated `src/data/verbForms.ts`
  via `perfekt()` in `src/lib/verbDisplay.ts` (which turns the stored infinitive auxiliary into the
  citation form "hat"/"ist"). A verb the oracle does not cover shows nothing rather than a guess.
- The label is **Perfekt**, not "Partizip II": "hat verschoben" is the Perfekt, the bare participle is
  "verschoben", and a learner thinks in tenses. (The preview said Partizip II; corrected on implementation.)

## Graphs
Both graphs are lazy chunks (d3-force rides ONLY there, shared `vendor-misc`; main chunk ~80 kB)
and are PWA-cached: if a change doesn't show after deploy, hard-refresh (stale service worker).
- **Wörter Graph** (`vocabulary/WordGraph.tsx` + pure builder `wordGraph.ts`, pinned by
  `tests/wordgraph.test.ts`): Obsidian-style force canvas of the CURRENTLY FILTERED list. Node
  radius = wordfreq Zipf (no corpus evidence = min radius, never a fake claim). **Color = TWO life
  areas** (Berufsleben = `beruf` domain, brand Nachtblau; Alltag = every other domain, teal;
  the areas come from `lib/lifeAreas.ts`, the app-wide fold, with the colors in
  `lib/graphPalette.ts`; legend + filter collapse to these two). The legend said "Privatleben" until
  s181; it says **Alltag** now, because the Thema dropdowns say Alltag and the founder asked for one
  wording across the app. Edges ONLY from authored sources (`related` terms resolved to bank entries;
  collocations whose noun AND verb both resolve; unresolvable related terms are dropped, by
  design). Noun nodes may carry gender marks (see Artikel-Visuals in `CLAUDE.md` layout notes).
- **Kollokationen Graph** (`collocations/CollocationGraph.tsx` + `collocationGraph.ts`, pinned by
  `tests/collocationGraph.test.ts`): bipartite noun ↔ verb canvas of the filtered list; every
  distinct noun/verb a node, every collocation an edge (hub verbs surface naturally). Node size =
  degree (frequency keyed by content_id, not surface form), color = the TWO life areas; nodes pull
  to per-topic centroids forming glowing islands tuned for the zoomed-out view (fit-to-all on
  open, cached radial glow sprites, curved gradient-tinted edges, vignette; nouns = solid discs,
  verbs = rings). **Layout is the founder-picked "Am engsten" recipe:** centroids on a ring
  (`118 + N*26`), forceX/Y `0.72`, link tension `0.38`, repulsion `-34` (distanceMax `200`),
  collision `r+1.5` — each topic contracts into a compact island. Picker artifact:
  `preview/collocation-graph-tightness.html`.
- **Selection / focus model (IDENTICAL in both graphs):** selecting a node animates its
  connections into a focused arrangement and frames it readable; deselecting animates every
  displaced node back to its stored home. Mechanism: `homePosRef` stores each moved node's true
  home; `focusRafRef` runs an easeOut tween pinning moved nodes (`fx/fy`); on rebuild/unmount the
  HOME positions are cached to `posRef`. Placement rules: connections keep their direction, but
  (1) `spreadAngles()` fans clustered angles toward even slots preserving circular order; (2) each
  lands on an ellipse sized to fill ~82% of the free area at `TARGET_FOCUS_K` (2.3), radial factor
  floored at 0.72; (3) `relaxLabels` (AABB, selected word immovable) separates nodes by label box
  and `frameFocus` pads bounds by label extents (no label clips); (4) while focused, labels are
  never culled. The fit button toggles fit-all ↔ zoom into a random well-connected node (weighted
  by area, excludes current selection); every fit-button switch animates
  (`computeFit`/`computeFitRect` tweened). When NOT focused, canvas labels are collision-culled
  onto translucent pills (selected-first, then by degree). Nodes are draggable and pin where
  dropped (`fx`/`fy` kept on release). All tweens respect `prefers-reduced-motion`.
- **Kollokationen selected-node card:** bipartite (tap noun → its verbs, tap verb → its nouns),
  with a shape toggle beside its close button: bottom bar (`horizontal`, default) or right panel
  (`vertical`); toggling re-fits the constellation into the free area (`fitToRect`/`freeRect`;
  `cardExtent` keeps fit math in lockstep with the card CSS). Card floats off the canvas edges by
  the same `bottom-3/left-3/right-3` gap as the Wörter card.
- Counts: the graph canvas legend shows only "m Verbindungen"; the word count sits beside Üben
  like every other view.

## FilterRail (both breakpoints; `features/shared/FilterRail.tsx`)
- **Desktop:** the browse tabs are an explicit 2-col × 2-row grid
  (`lg:grid-cols-[minmax(0,1fr)_16rem]`): tabs + view-switcher meta row in row 1 / col 1 at
  content-column width (NOT stretched over the rail column); content + the persistent rail share
  row 2, so the filter tile starts level with the first content card. The rail fills the viewport
  vertically (`lg:max-h-[calc(100vh-7rem)]`) with a slim visible scrollbar (`.slim-scrollbar`)
  once filters overflow; header `lg:sticky lg:top-0`, Üben footer `lg:sticky lg:bottom-0` (Üben
  stays on screen at every scroll position).
- **Mobile:** a toolbar Filter icon toggles a body-only `layout="panel"` tile that slides open via
  AnimatePresence (height/opacity), sits in normal flow (scrolls away, does not stick), capped
  `max-h-[45dvh]` as a flex column (fixed header + one internal scroll region). Üben + word count
  are a sticky bottom action bar (full-bleed, `sticky bottom-[nav]`, backdrop-blur, after the
  content).
- **Tile look:** subtle grey `bg-muted` (the ViewSwitcher-track shade), controls INSIDE white
  (`bg-surface` dropdown triggers; unselected facet pills `bg-surface`). This grey-tile/
  white-controls split is the settled answer after multiple flip-flops — do not re-litigate
  (white-on-white was too low contrast; a flat `bg-border` slab read ugly).
- **Header:** "Filter" label (brand accent) + active-count badge + chevron toggle, plus a
  permanent reset icon (RotateCcw) and a close X (mobile panel only). Reset clears facets AND
  scope dropdowns; the badge counts both. The result count sits beside Üben in EVERY state.
- **Scopes:** primary dropdowns in the hierarchy Branche → Thema → Unterthema (Kategorie on
  Grammatik = Gruppe). **Scope dropdowns are MULTI-select** via the hand-built checkbox popover
  `ScopeMultiSelect` (Radix Select is single-value only); each rides a comma-list URL param
  (empty = everything), OR-within. "Alle X" shows the OPTION count in the muted pill-number
  format. Sub-theme drill-down + the travelling `useLibraryScope` apply only when EXACTLY ONE
  Thema is active; `startSession` collapses multi-Thema/Unterthema to the first value but forwards
  every Branche. Sub-themes are a filter dropdown ("Unterthema", per-sub-theme counts + "Gesamtes
  Thema"), never an interstitial page (`SubThemePicker` is unused, kept in repo).
- **Facets:** always-visible pills with live counts, immediate commit (no draft/apply); zero-yield
  values greyed with honest counts. Section labels share the uppercase eyebrow style. Each section
  has a Pin (visible both breakpoints); pinned sections stay visible while collapsed; pins persist
  per tab in localStorage (`b2beruf.railPins`, `pinScope` prop; deliberately NOT synced). Wörter
  facet order: Wortart right after Thema/Unterthema, Stufe (CEFR) LAST. Redemittel: Kategorie is a
  multi-select PILL facet (`CATEGORY_FACET`), Register a rail facet; `?cat=`/`?register=` ride the
  facet selection; the per-category card section headers were removed (flat card grid).
- **Redemittel carries ONE scope dropdown, Thema** (audit P6, s182), on the same `?theme=` param as
  the sibling tabs so a scope travels between them. Its semantics are the Branche ones, not the
  Wörter ones: an untagged phrase is universal and shows under every Thema (`matchesThemeScope`),
  so the count beside each Thema is its DEDICATED phrase count and a zero stays selectable. There is
  no Branche and no Unterthema dropdown here (the bank tags neither).
- One `filterRailProps` object feeds the two `<FilterRail>` instances (desktop rail
  default-open, mobile panel `defaultOpen={false}`).
- Facet pills are `rounded-md` squircle (not `rounded-full`).

## Search (transient, outside the filter tile)
The toolbar row itself is sticky under the app header and **always fully transparent** (founder
2026-07-31, `browseHeaderClass` in `features/shared/browseScroll.tsx`): the earlier version faded a
`bg-background/90 backdrop-blur` mask in once the page scrolled, which read as a blurred band across
the page. The controls carry their own opaque fill plus `shadow-soft`, so they float over the cards passing
underneath. **The 0.75rem clearance under the app header lives in the sticky OFFSET
(`top-[calc(4rem+env(safe-area-inset-top)+0.75rem)]` / `lg:top-[4.75rem]`), never in padding**
(founder 2026-07-31): padding applies at rest too and pushed the controls away from the tabs at the
top of the page, while a sticky `top` does nothing until the row pins. It also keeps the flow height
constant, so nothing shifts at the moment it pins. The four trainers repeat the same offset in their
own `lg:sticky` class, so change both together. **Opaque is load-bearing:** the toolbar icon
buttons all wear `BROWSE_TOOLBAR_BUTTON` (exported from `browseScroll.tsx`), because the `outline`
variant fills with `bg-surface/50` and hovers to `bg-muted/60`, and at half alpha the card titles
scrolling behind printed straight through the buttons (founder 2026-07-31, "the buttons are
illegible"). Any control added to this row needs a full-alpha fill. Nothing else may be pinned in that row: the
level-band `ActiveFilterChip` moved into the content column, since a chip with no band behind it
lands on top of the card titles.

**"Nach oben"** (`ScrollTopButton`, shown once the page is past 280px) has one placement per
breakpoint: centered above the mobile Üben bar, and the bottom-right corner on desktop (added
2026-07-31; it was mobile-only). The desktop one sits at `bottom-4 right-4` and clears the Feedback
pill, which floats on its own content-column offset further left.

A search icon on the toolbar toggles a transient full-width `SearchField` (autofocus); opening/
closing never touches filter state; closing clears. Desktop grows inline in the toolbar row
(`lg:flex-1`); mobile gets its own second row. Backed by `src/lib/fuzzy.ts`
(`fuzzyMatch`/`foldText`: umlaut/case-insensitive, token-order-independent, Damerau edit-1 for 4+
char tokens), pinned by `tests/fuzzy.test.ts`. Wörter search also appends a match's connections
(its `related` terms that resolve in scope). Mobile toolbar is a full-width `justify-between` row
`[Filter icon · ViewSwitcher · bookmark/search]`.

## Facet registry
`src/lib/facets.ts` (`vocab`/`collocation`/`redemittel`/`grammar` facets + `*_FACET_IDS`) is the
single source; the ≤12-option rule (`MAX_FACET_OPTIONS`) and the coverage floor
(`MIN_FACET_COVERAGE`/`MIN_FACET_VALUES`) are codified there. `src/lib/cefr.ts` is the single
source for the CEFR scale (`CEFR_ORDER`, `cefrLabel`, `difficultyToBand`).

## Grammatik tab
Shares the same skeleton (toolbar with mobile filter toggle + Karten/Liste ViewSwitcher +
transient fuzzy search; FilterRail with **Gruppe** as primary dropdown and **Stufe** as facet,
`grammarFacets()`; Üben in the rail footer / sticky mobile bar; `?group=`/`?cefr=`/`?view=`/
`?topic=` URL-persisted). Feature split: `grammar/grammarMeta.ts` (group labels/icons, B2-marker
`groupOrder`, `orderedGrammar` spine, `topicRank`), `grammar/GrammarViews.tsx` (Karten with
emerald group tile + priority-rank chip + ONE pattern variant (`pattern.split(" · ")[0]`) in the
Muster tint; compact Liste rows), and `grammar/GrammarTopicView.tsx`, the lesson page:
- LibrarySwitcher tabs stay on top; minimal hero (group tile + German title ONLY — no English
  eyebrow, no purpose line, no meta badges: described once, in the card below).
- The emerald **Muster** formula panel FIRST: authored " · "-separated `pattern` variants render
  ONE PER ROW with dot markers, never one wrapped line; explanation as sentence bullets, first
  point up front, rest behind a "Mehr anzeigen" expander pinned bottom-right. Desktop: Muster and
  explanation side by side (`lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`); mobile stacked.
- **German-first with hold-to-peek English:** `explanationDe`/`pitfallsDe` show by default; a
  small EN chip (`grammar/EnPeek.tsx`, top-right of the paragraph, NOT the tile) reveals English
  only while pressed (pointer or Space/Enter held; never a sticky toggle). Same peek for example
  glosses (per-card chip beside the SpeakButton) and drill glosses (`glossPeek` on
  GrammarDrillCard, lesson only).
- Then Beispiele, Typische Fehler, numbered Übungen with a live progress bar, a completion panel
  ("Thema abgeschlossen · k von n richtig" + "Weiter: <next>") and prev/next cards along the
  priority spine ("Thema n von 10"). Üben on the lesson too (inline gradient button desktop,
  sticky bottom bar mobile). Drill options (`GrammarDrillCard.tsx`) have a `bg-muted/50` idle fill
  so they read as tappable. Emerald stays the quiet Grammatik accent (icon tiles/Muster only);
  brand Nachtblau stays the action color.

## Related pages
- **Sammlung** (`features/collection/Sammlung.tsx`): every bookmarked word plus every word with
  `cardLevel >= 1` (`engine/collection.ts`) as a level-filterable card grid. Off the nav; reached
  via the Fortschritt entry card and the `/sammlung` deep link. Lazy route.
- **Vokabeltrainer practice tabs** are hidden behind the reversible `SHOW_PRACTICE_TABS = false`
  flag; `Flashcards`/`VocabQuiz` stay in the repo (used by the session engine). The standalone
  `/quiz` is off the nav but a live route (practiceAreas deep link); no hard redirect on purpose.
- `BrowseToolbar`/`FacetSheet`/`SubThemePicker` remain in the repo but are no longer used by the
  browse tabs.
