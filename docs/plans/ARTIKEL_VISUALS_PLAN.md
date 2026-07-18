# Artikel-Visuals Plan: Wesen gender marks, flip effects, fused doodles on the Theorie cards

> Status: **Phase 1 SHIPPED** (session 129, 2026-07-18, branch
> `claude/article-visuals-opus-tasks-rxurot`): tokens + Wesen marks + flip effects + legend live on
> the Theorie Wörter views, built in the intended two-model split (Opus 4.8 wiring commit, then
> Fable 5 art commit replacing the placeholder geometry/keyframes; a 200ms effect delay was added
> so the reveal stays visible after the ~225ms flip). **Phases 2–3 not started.**
> (Originally authored 2026-07-18, session 128, on branch
> `claude/visual-gender-indicators-gsox24`.) The founder reviewed two design-preview artifacts and
> picked **Preview B (Artikel-Wesen mascots), Preview C (fused per-word doodles), and Preview D
> (gender answer-reveal effects)** for the Theorie (Bibliothek) cards. Preview A (plain badge chips)
> was NOT picked; the Wesen serve as the gender mark instead. Implementation happens in a follow-up
> session; each phase below is one independently shippable PR into `main` per the house workflow.
>
> Evidence base: the three-expert research panel recorded under **backlog #4 in
> `docs/PROJECT_REFERENCE.md`** (SLA research, memory science, competitor/illustration scan, with
> citations). Read that before changing the design rationale here; do not re-research. Key results
> that shaped this plan: images fusing meaning+gender have the strongest evidence (Santos 2015);
> a consistent shape+color marker is a legitimate always-on category flag; the memorable moment
> belongs at retrieval (answer reveal), not at browse; human-persona imagery (moustache man) was
> dropped because grammatical gender is a property of the word, not the referent (das Mädchen,
> die Person, der Gast) and it teaches a false rule exactly there.
>
> Guardrails for every phase: German user-facing copy with **no em dashes**; light AND dark theme
> via tokens; `prefers-reduced-motion` respected on every animation; the gender palette must NOT
> reuse the six domain colors in `src/lib/graphPalette.ts` (graph ambiguity); color is never the
> only channel (shape carries the meaning too); main-chunk budget stays green (`pnpm check:bundle`);
> the founder's "no facet tags on card tiles" rule is not violated (gender is word knowledge like
> the plural, not a filter facet); all art is self-drawn SVG (no licensing/provenance implications,
> `lint:content` untouched). Verification gates per phase: `pnpm typecheck` + `pnpm lint` +
> `pnpm test:unit` + `pnpm build` + `pnpm check:bundle`.

## 1. What ships, in one paragraph

Every noun card in Theorie (`/library?tab=woerter`) gets a small **Artikel-Wesen** gender mark
(spiky blue creature = der, round rose = die, boxy green = das) next to the word; **flipping a noun
card plays a ~500ms gender effect** behind the English reveal (der bursts, die blooms, das
shatters); and a growing set of high-value nouns (starting with 20 words chosen for Kapitel-1
usefulness + frequency) get a **fused doodle** on the card back where the Wesen interacts with the
word's meaning. Non-noun cards and words without doodle art look exactly like today.

## 2. Design decisions (proposed defaults, founder can override in PR review)

1. **The Wesen mark sits BESIDE the full German word ("die Besprechung"), it does not replace the
   article text.** Learners must keep reading real articles; the mark is redundant encoding
   (shape + color + creature identity), not a substitute.
2. **The flip effect fires on every flip** (front→back only), not just the first. It is short,
   quiet, and reinforcement is the point. Reduced-motion users get a brief static color tint.
3. **Verbs/adjectives/phrases get no mark**, so the mark doubles as an at-a-glance "this is a
   noun" signal.
4. **A one-time legend teaches the system** (the research is explicit that unexplained cues do not
   transfer): a small dismissible hint card at the top of the Wörter tab on first visit after the
   feature ships ("Drei Wesen zeigen den Artikel: ..."), state in `useSettingsStore` (rides
   cloudSync), never shown again once dismissed.
5. **Gender palette** (new CSS tokens, light/dark): der blue `#2563eb` / `#7aa5f8`, die rose
   `#db2777` / `#f27bb8`, das green `#16a34a` / `#5fc98b` + matching `-bg` tints. Textbook
   convention (der=blue, die=red/rose, das=green), checked against `graphPalette.ts`: distinct
   from all six domain hues (gesundheit rose `#e11d48` is the closest neighbor to die-rose; the
   two never co-occur on the same element, domain colors are graph node fills, gender colors are
   marks/effects, but keep the hex values as specified so they stay tellable apart).

## 3. Phase 1 (PR 1): tokens + Wesen marks + flip effect on the Theorie cards

**New files:**
- `src/components/artikel/gender.ts`: `type Gender = "der" | "die" | "das"`,
  `genderOf(v: VocabItem): Gender | null` (from the existing `article` field; null for non-nouns).
  Pure, unit-tested.
- `src/components/artikel/Wesen.tsx`: the three code-authored SVG creatures (one component,
  `<Wesen gender size />`), following the `route-icons.tsx` pattern (shared geometry source,
  optical sizing). Two rendering tiers: full creature (eyes/mouth) at >= 24px, simplified solid
  shape below that. Colors via the new tokens so dark mode is automatic. Reference geometry:
  **`preview/artikel-visuals/gender-doodles-panel.html`** (open in a browser; Preview B has the three
  creatures, Preview C the fused-doodle style, Preview D the three effects, all in the app's real
  tokens; `gender-visuals-preview.html` beside it is the earlier chip/graph-ring survey). Wobbly
  triangle / circle / square bodies, one deliberate imperfection each, 2px round-cap strokes.
- `src/components/artikel/ArtikelEffect.tsx`: the three CSS-keyframe effects (burst / bloom /
  shatter), a `play` trigger prop, `useReducedMotion`-guarded (static tint fallback). No JS
  animation loop; compositor-friendly transforms only.

**Token wiring:** add `--der/--die/--das` (+ `-bg` tints) to `src/index.css` (`:root` + `.dark`)
and expose them in `tailwind.config.ts` like the existing `reward` tokens.

**Card wiring (`src/features/vocabulary/`):**
- `VocabList.tsx` (`VocabCard`): Wesen mark (~24px) left of `v.de` on the FlipCard front; the
  flip handler triggers `ArtikelEffect` on the back face. Preserve the memoized per-card store
  subscription pattern exactly (no new top-level subscriptions).
- `VocabViews.tsx`: Tabelle rows + Liste rows get the small-tier mark (16px solid shape) before
  the word. No layout shifts; the mark is inline-flex with a fixed box.
- First-visit legend hint card in `VocabularyTrainer.tsx` (dismiss state in settings store).

**Out of scope for PR 1:** sessions/flashcards, the graph card, Kollokationen (nouns there come
from the vocab bank; a later phase can mark them via the same helper).

**Acceptance:** marks render correctly for all three genders in Karten/Tabelle/Liste, light+dark;
non-nouns unaffected; flip plays the correct effect; reduced-motion shows the tint; legend shows
once; `tests/` gains a `genderOf` unit test; all gates green; main chunk delta < 3 kB (the Wesen
ride in the lazy library chunk, verify with `pnpm check:bundle`).

## 4. Phase 2 (PR 2): fused-doodle registry + batch 1 (20 words)

**Registry:** `src/features/vocabulary/doodles/` with `index.ts` exporting
`loadDoodle(contentId): Promise<Component | null>` via dynamic `import()` so doodle SVG never
enters an eager chunk. Each doodle is a small self-drawn SVG component (Wesen interacting with the
referent, ~120x96 viewBox, gender tokens + `--ink` neutral). `VocabCard`'s back face renders the
doodle above the English when the registry has one; cards without art are unchanged (no empty
slot, no "missing" look).

**Batch-1 word selection (founder rule, 2026-07-18): high frequency AND highly useful for
Kapitel 1 of the Neuland game.** Concretely:

1. **The 10 nouns Kapitel-1 missions reference directly** (from `src/data/missions.ts`, all are
   `battle`/`scene` content ids, verified 2026-07-18): `v_beratung` (die), `v_bescheid` (der),
   `v_fahrkarte` (die), `v_gebuehr` (die), `v_kunde` (der), `v_mietvertrag` (der),
   `v_personalausweis` (der), `v_rechnung` (die), `v_vollmacht` (die),
   `v_wohnungsgeberbestaetigung` (die). These are in regardless of frequency bin: Üben mission N
   mirrors Spielen mission N, so these doodles surface in both loops.
2. **The other 10: highest-Zipf nouns from the Kapitel-1 mission themes** (`travel`,
   `technology`, `sustainability`, `wohnen`, `behoerde`, the `themeId`s carried by missions
   1.1–1.6), read from the generated `src/data/frequency.ts` (`core` bin first, then `common`),
   nouns only (`article` present), excluding the 10 above.
3. **Gender balance override:** the mission set is 6 die / 4 der / 0 das, so when ranking step-2
   candidates, prefer das-nouns until the batch has **at least 4 das-words** (the learner must
   meet all three Wesen in the first batch, and das-nouns are the rarest gender in German anyway).
   Selection snippet for the implementing session (adapt as needed):

   ```js
   // node --experimental-strip-types or paste into a scratch script
   import { vocabulary } from "../src/data/vocabulary.ts";
   import { frequency } from "../src/data/frequency.ts";
   const K1_THEMES = new Set(["travel", "technology", "sustainability", "wohnen", "behoerde"]);
   const FIXED = new Set(["v_beratung","v_bescheid","v_fahrkarte","v_gebuehr","v_kunde",
     "v_mietvertrag","v_personalausweis","v_rechnung","v_vollmacht","v_wohnungsgeberbestaetigung"]);
   const cands = vocabulary
     .filter(v => v.article && K1_THEMES.has(v.themeId) && !FIXED.has(v.id) && frequency[v.id])
     .sort((a, b) => frequency[b.id].zipf - frequency[a.id].zipf);
   // take das-nouns first until >= 4 das overall, then top Zipf regardless of gender, to 10 total
   ```

   Record the final 20 ids + articles in this file when the batch ships.

**Acceptance:** 20 doodles render on their card backs at Karten size, light+dark; every doodle
uses the correct Wesen for its article (cross-check against `article`, this is the one place a
wrong-gender doodle would actively teach an error, so verify each one); main chunk unchanged;
doodle chunk lazy-loaded only when a registered card flips; all gates green.

**Growth path:** later batches extend toward the top ~100 (next: Kapitel-2 content when authored,
then highest-Zipf nouns bank-wide). Authoring stays data+SVG only; no engine changes.

## 5. Phase 3 (PR 3): reuse beyond the Theorie cards

- **Session player:** play `ArtikelEffect` on correct answers for noun items in `flashcard`,
  `typing`, and `speaking` blocks (`SessionPlayer.tsx` grade path). This is where the evidence
  says the moment matters most (retrieval), so do not skip it for long.
- **Wörter graph selected-node card:** the Wesen mark beside the selected word
  (`WordGraph.tsx` card only; node rings on canvas remain a separate, unscoped idea).
- **Flashcards in `Flashcards.tsx`** (the legacy component the session engine reuses): same mark
  on the card face.
- **Neuland tie-in (unscoped here, park in backlog):** the three Wesen as game characters who
  "collect" words of their article; an Artikel-Sprint der/die/das rapid-fire block for the session
  composer + the "Meine Eselsbrücke" learner-association slot (both documented under backlog #4;
  the Eselsbrücke needs a store field + sync consideration, so scope it separately).

**Acceptance:** effect fires only on correct noun answers, never blocks the Weiter flow; graph
card mark themed correctly; gates green.

## 6. Model recommendations (per the house model-guidance table in `docs/PROJECT_REFERENCE.md`)

| Phase | Model | Effort | Why |
|---|---|---|---|
| PR 1 tokens + wiring | **Opus 4.8** | medium | Cross-cutting UI wiring across 4+ files, locked-pattern preservation (memoized cards, FlipCard), but no new engine logic. |
| PR 1 Wesen + effect SVG/CSS authoring | **Fable 5** | high | Creative asset authoring where charm and consistency are the point; same tier that did the app's route marks. Can be the same session as the wiring (author art first, then wire). |
| PR 2 doodle batch (20 fused SVGs) | **Fable 5** | high | Sustained-style illustration across 20 scenes with per-word visual ideas; consistency drift is the main risk, so keep it in ONE session and re-verify each doodle's gender against `article`. |
| PR 2 registry plumbing | **Sonnet 5** | medium | Mechanical dynamic-import registry + card-back slot; fine to fold into the Fable session instead. |
| PR 3 reuse pass | **Sonnet 5** | medium | Mechanical reuse of shipped components at known call sites. |

## 7. Risks and their mitigations

- **Wrong-gender doodle = actively teaching an error.** Mitigation: the Phase 2 acceptance step
  cross-checks every doodle against the bank's `article`; add a tiny unit test asserting every
  registry id exists in the vocab bank and is a noun.
- **Decoration fatigue / seductive-details.** The marks are small and functional, the effect is
  short and only on flip/correct-answer; do NOT add always-on animation, background tints behind
  card text, or gender-colored card borders (the panel's evidence is explicit that decorative
  loudness hurts).
- **Bundle creep.** Doodles are lazy; the Wesen are ~2 kB. `check:bundle` gates every PR.
- **PWA cache.** The Bibliothek is a service-worker-cached surface; after deploy, a stale build
  can hide the marks. Hard-refresh before concluding anything is broken (same caveat as the
  graphs, see s125 handoff).
