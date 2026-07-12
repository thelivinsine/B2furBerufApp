# Üben UI refinements plan (founder round, 2026-07-12, s100)

**Status: APPROVED by the founder on 2026-07-12.** Planned in s100; implementation is chunked below
with a model recommendation per chunk. Line numbers are anchors and may drift; re-locate by the
quoted code, not the number.

**Progress:**
- ✅ **Work item 1 (Üben relevance + speaking "Anzeigen") — SHIPPED s101 (Opus 4.8).** `grammarTopicId`
  opt + `libraryFocus` helper in `engine/session.ts`, `Session.tsx` param parsing (`?grammar=`/`?cat=`/
  `?sub=`/`?cefr=`/`?sector=`), caller wiring (Grammatik lesson, Redemittel, Wörter, Kollokationen),
  the speaking-block give-up, and 5 new `tests/engine.test.ts` cases. Gates green (typecheck, test:unit
  121/121, lint 0 errors, build, bundle 73.0 kB).
- ⬜ Work items 2, 3, 4+5, 6 — not started.

## Context

Six founder requests from a review pass, all UI/UX refinements around the Üben flow and Bibliothek:

1. **Üben relevance:** Üben buttons should start a session tied to where the learner is. Today only
   the Heute mission CTA (`?mission=`) and theme-scoped entries are tailored; the Grammatik lesson,
   Redemittel, and Bibliothek facet filters all launch a generic session (which drills a *random*
   grammar topic and random Redemittel). Plus: **speaking blocks have no way to move on** if the
   learner doesn't know the answer (typing blocks already have "Anzeigen"; speaking has none, so the
   learner must type something wrong to proceed).
2. **Graph view counts:** the word count should sit beside Üben like every other view; the
   connections count stays at the bottom of the canvas.
3. **Üben city map:** beautify it (first thing users see; currently flat/average) and make the
   building tiles tappable so the bottom practice card slides to the corresponding module.
4. **FilterRail is ugly on desktop** (flat `bg-border` grey slab, invisible border, hard-white pills).
5. **Desktop:** the word count should stay beside the Üben button even when the rail is expanded
   (today it jumps to the top of the open panel).
6. **Grammar lesson:** Muster panel and explanation side by side on desktop.

## Model recommendations per chunk

Same tiering as `GAME_IMPLEMENTATION_PLAN.md` (Sonnet 5 = workhorse on fixed patterns, Opus 4.8 =
composer/SRS-adjacent or silent-regression territory, Fable 5 = high-taste design work, Haiku 4.5 =
mechanical gates/docs). Chunks are independent; they can ship as separate PRs in any order, though
1 → (2+5) → 4 → 6 → 3 is the suggested sequence (logic first, quick wins, then the big visual task).

| Chunk | Work | Model | Why |
|---|---|---|---|
| 1a | Session engine: `grammarTopicId` opt + `libraryFocus` helper + `Session.tsx` param parsing + caller wiring | **Opus 4.8** | Composer/SRS-adjacent logic; a subtle weighting or focus bug silently degrades sessions (matches the game plan's tiering for composer work) |
| 1b | Speaking block "Anzeigen" give-up | **Sonnet 5** | Mirrors the existing TypingBlock pattern in the same file; `evaluate("")` already does the heavy lifting |
| 1c | Unit tests for 1a (`tests/engine.test.ts`) | **Sonnet 5** | Bounded test work against a fixed contract |
| 2 | Graph word-count placement | **Sonnet 5** | Small mechanical relocation, fully specified below |
| 4+5 | FilterRail desktop redesign + count beside Üben | **Sonnet 5**, escalate to **Opus 4.8** if the founder iterates on taste | The recipe below is fully specified; the risk is only visual-taste iteration rounds (s91/s92 history shows the founder refines this surface) |
| 6 | Grammar lesson Muster/explanation side by side | **Sonnet 5** | One CardContent grid change |
| 3 | Üben map beautification + tappable stops | **Fable 5** first choice, **Opus 4.8** fallback | Hand-authored SVG illustration quality is the founder's headline ask ("the most beautiful design, first thing a user sees"); same tier as the game plan reserves for design/arc work |
| — | Docs + gates after each chunk | **Haiku 4.5** | Mechanical |

---

## Work item 1 — Üben relevance + speaking "Anzeigen"

**Approach:** `Session.tsx` stays the URL adapter; the only engine extension is `grammarTopicId`.
Reuse the existing `focus` opt (leads with exact ids, drops the random grammar drill + random
Redemittel, which is exactly "specific and relevant") for Bibliothek facets and Redemittel category.

### 1a. Engine (`src/engine/session.ts`)
- Add `grammarTopicId?: string` to `BuildSessionOpts`. In Pool 3 (~line 224): if set and found, pin
  the grammar topic and sample up to **4** drills (instead of the random topic's 2). `plan.focus`
  already labels the session with `grammarTopic.titleDe` for free.
- Add an exported pure helper `libraryFocus({theme, sub, cefr[], sector[], category})` returning
  `{vocabIds, redemittelIds} | undefined`:
  - `category` set: sample up to 4 matching Redemittel ids (`redemittelIds` only, empty `vocabIds`).
  - Otherwise: `undefined` unless sub/cefr/sector actually narrow beyond the theme (a bare theme
    keeps today's scope-only behavior). Filter the vocabulary bank manually (`filterVocab` takes a
    single cefr string and no sector, so don't reuse it), sample up to 8 ids. Export the caps as
    `FOCUS_VOCAB_CAP = 8`, `FOCUS_REDE_CAP = 4`.

### 1b. Route wrapper (`src/features/session/Session.tsx`)
- Parse `?grammar=`, `?cat=`, `?sub=`, `?cefr=` (comma list), `?sector=` (comma list). Priority:
  `mission` wins, then `libraryFocus`. Pass `grammarTopicId` through a new optional `SessionPlayer`
  prop (props at `SessionPlayer.tsx:51-58`; forward into the `buildSession` call at ~line 102 next
  to `scope`/`focus`).
- Extend the remount key with the new params (the comment at lines 38-40 explains why).

### 1c. Callers
- `src/features/grammar/GrammarTopicView.tsx:344,353` (desktop inline + mobile sticky Üben):
  `/session?grammar=${topic.id}`.
- `src/features/redemittel/RedemittelTrainer.tsx:146,324`: `/session?cat=${category}` when a
  category is selected, else bare.
- `src/features/vocabulary/VocabularyTrainer.tsx:234` `startSession`: build URLSearchParams from
  live state: theme (if not "all"), sub, `selection.cefr`, `selection.sector`. Deliberately NOT
  pos/srs/frequency (browse lenses, not learning scopes; comment this).
- `src/features/collocations/CollocationsBrowser.tsx:202`: same pattern.
- `GrammarHub` stays bare `/session` (browsing the grid is not a specific location).

### 1d. Speaking give-up (`SessionPlayer.tsx` SpeakingBlock, L516-734)
- Add a ghost "Anzeigen" button (mirroring TypingBlock L846-853) in the **prompt** stage (after
  "Lieber tippen") and the **typed** stage (after the input row). It calls `evaluate("")`: the
  one-shot guard, mic stop, wrong grade (FSRS 0), and outcome panel with the answer all already
  work; empty `heard` means no "Deine Antwort" line renders. Not in the listening stage ("Fertig"
  already routes back to prompt). Update the doc comment (a give-up must not feed the scheduler a
  pass).

### 1e. Tests (`tests/engine.test.ts`, `pnpm test:unit`)
- `grammarTopicId` pins Pool 3 (drills within the topic, groupLabel = titleDe, count >= 2); an
  unknown id falls back to a random topic.
- `libraryFocus`: theme-only returns undefined; a sub filter returns only matching ids; caps
  respected; category returns a Redemittel-only focus.

---

## Work item 2 — Graph word count placement

- `src/features/vocabulary/WordGraph.tsx:575-578`: the legend span keeps ONLY "m Verbindungen"
  (word count removed). Nodes equal the filtered items, so the rail count agrees with the graph.
- `src/features/vocabulary/VocabularyTrainer.tsx:339-342`: pass `count` unconditionally (drop the
  graph exception); L502: drop the `view !== "graph"` guard on the mobile sticky-bar count.
- `FilterRail.tsx` `count` docstring: drop the graph-exception mention.

---

## Work items 4 + 5 — FilterRail desktop redesign + count beside Üben

All in `src/features/shared/FilterRail.tsx` (centralizes across all four Bibliothek tabs).

### Count beside Üben always (request 5)
- Footer L509: `{!open && countStack}` becomes `{countStack}`.
- Delete the expanded first row (L458-465, count + reset).
- Restructure the desktop header (L432-449) from a single `<button>` into a `<div>` wrapping the
  expand/collapse button (flex-1, keeps icon + "Filter" + badge + chevron) plus the reset icon
  button beside it (nesting reset inside the old button would be invalid HTML). Mirrors the mobile
  panel header: label left, icons right.

### Desktop visual redesign (request 4)
Restyle the tile as a standard content card (both rail and mobile panel, one recipe):
- `aside` (L423) and panel wrapper (L392): `border-border bg-border` becomes
  `border-border bg-surface shadow-soft`.
- Header + footer sticky backgrounds: `bg-border` becomes `bg-surface` (opaque, sticky-safe).
- Dividers `border-muted-foreground/10` become `border-border` (visible on white).
- Unselected facet pills: hard `bg-white` becomes
  `border-border bg-muted hover:bg-muted/70 hover:border-primary/40` (+ existing dark overrides);
  disabled pills `bg-transparent`.
- Scope section labels (Thema/Unterthema/Kategorie) switch to the same uppercase eyebrow style as
  the facet labels (pass `eyebrow` to `SectionHeader`) for one label voice down the tile.
- Selected pill, brand "Filter" label, countStack: unchanged.
- Fallback if the founder wants more separation: tint only the header row `bg-muted`. Verify both
  themes. (History: s92 chose the grey `bg-border` tile because `bg-muted` "barely read"; the
  founder now calls the slab ugly, so the card recipe, visible border + shadow-soft like every
  other content tile, is the sanctioned redesign.)

---

## Work item 6 — Grammar lesson: Muster beside explanation (desktop)

`src/features/grammar/GrammarTopicView.tsx` L135-190:
- `CardContent`: `"space-y-3 p-5"` gains
  `lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch lg:gap-5 lg:space-y-0`.
- Col 1: the Muster panel div plus `lg:h-full`.
- Col 2: wrap the explanation flex block (L156-169) AND the "Mehr anzeigen" expander (L171-189) in
  one `<div className="space-y-3 lg:min-w-0">`.
- Mobile stacking (Muster first, founder-locked s93) untouched. Check the longest `pattern` in the
  bank wraps acceptably at 1024/1280px.

---

## Work item 3 — Üben map: tappable buildings + beautification

All in `src/features/dashboard/UebenPath.tsx` (lazy chunk; SVG growth is bundle-safe). Constraints:
keep the 360x240 viewBox in the `bg-surface p-2 border-border` mat (s90 position parity with the
Spielen hero; do NOT touch the mat or root layout), theme-aware `MAP_LIGHT`/`MAP_DARK`, no
reward-gold, reduced-motion-safe.

### Tappable stops that sync the card
- Helper: `stopTarget(stop)` = index in `kap1` of the stop's first unplayed mission, else its first
  mission.
- Wrap each stop's tile+label group (L247-263) in
  `<g role="button" tabIndex={0} aria-label={...} className="ueben-stop cursor-pointer" onClick={() => goTo(stopTarget(s))} onKeyDown={Enter/Space}>`.
  `goTo` already sets `slideDir` + `selectedIdx`, so the bottom card slides with the existing
  animation; the pin never moves (progress truth).
- Root `<svg>`: replace `role="img"` (it now contains buttons); mark decorative layers
  `aria-hidden`.
- CSS in the existing `<style>` block: `.ueben-stop` scale-on-hover/focus
  (`transform-box: fill-box`), `:focus-visible` primary outline, `prefers-reduced-motion` guard.
  If SVG `<g>` outline proves flaky cross-browser, add an invisible per-stop hit rect (~44px,
  doubles as a bigger tap target) and stroke it on focus.

### Beautification
- **Defs:** `linearGradient#ueben-ground` (`groundHi` to `ground`, soft vertical wash) and
  `#ueben-park` (`park` to `parkDeep`).
- **Palettes (L48-59):** add `groundHi` (light `#f4f6ef`, dark `#222a37`) + `treeTrunk` (light
  `#b99a6b`, dark `#4a4034`); enrich light `park`/`parkDeep` slightly (`#d6e7c6`/`#bcd8a6`).
- **Buildings:** replace the flat 34x34 rect + white glyph with small two-tone illustrations in the
  `domain-buildings.tsx` language (soft rx corners, facade in the stop color + darker roof band,
  bright WHITE windows, round-join strokes). Add a `shade` hex per stop in `STOPS` (bahnhof
  `#4747c4`, laden `#d05a4a`, zuhause `#d88a2d`, amt `#268b84`); keep the `#ueben-lm-shadow` drop
  shadow on the base shape. Per stop (~40x36 footprint centered on `tile`):
  - Bahnhof: wide facade + roof band, arched entrance, white clock dot, two white windows.
  - Laden: facade + striped awning (white/shade), white door + wide shop window.
  - Zuhause: house body + pitched roof + chimney, lit white window + door.
  - Amt: pediment triangle over facade, three white columns, base step.
  - Nudge labels down 2-3px if needed; verify no label lands on a street.
- **Ground/parks:** base rect takes the ground gradient; park rects take the park gradient; upgrade
  the bare circles to tree clusters (canopy + offset highlight + tiny trunk) via a small `Tree`
  component in-file. Optional crosswalk ticks at the two route turns (cut first if it gets busy).
- **Route:** widen the done-leg glow (strokeWidth 12 to 14, opacity 0.14 to 0.18) so the travelled
  path stays the map's hero line.

---

## Verification (per chunk, and end-to-end before merge)

1. `pnpm lint && pnpm typecheck && pnpm test:unit` (engine tests extended in chunk 1; check
   `tests/components.test.tsx` for FilterRail/graph assumptions).
2. `pnpm build && pnpm check:bundle` (400 kB budget; no eager-chunk growth expected: Session/engine
   ride the lazy session chunk, UebenPath/WordGraph are lazy).
3. `pnpm dev` + browser walk-through:
   - Grammatik lesson Üben drills THAT topic (session header label = topic title). Redemittel with
     a category leads with that category's Redemittel. Wörter with sub/CEFR/sector filters leads
     with matching words.
   - Speaking block: "Anzeigen" reveals the answer, grades wrong, "Weiter" appears.
   - Wörter Graph view: word count beside Üben (desktop rail + mobile bar), "n Verbindungen" alone
     under the canvas.
   - FilterRail desktop (all four tabs, light + dark): card look, reset in header, count beside
     Üben expanded AND collapsed; mobile panel behavior unchanged.
   - Heute Üben map: tap each building and the card slides to that stop's module
     (direction-aware); the pin stays put; keyboard focus + Enter works; both themes look right.
   - Grammar lesson at >=1024px: Muster left, explanation right; mobile stacked.
4. Docs in the same PR as each chunk: update the stale CLAUDE.md facts the chunk changes (graph
   counts sentence, FilterRail grey-tile sentence, map tappable stops), `docs/DECISIONS.md`,
   `docs/PROJECT_STATUS.md` handoff + `docs/SESSION_PROMPT_LOG.md`.
5. PR into `main`, squash-merge (auto-ship), post-merge realignment.

## Notes / accepted trade-offs
- Library-focus sessions drop the random grammar drill + random Redemittel (that is the point). A
  `?cat=` session's header labels with the weakest theme's title, not the category (follow-up
  `focusLabel` opt if the founder notices).
- All new copy em-dash-free ("Anzeigen", short aria-labels), within the microcopy budget.
