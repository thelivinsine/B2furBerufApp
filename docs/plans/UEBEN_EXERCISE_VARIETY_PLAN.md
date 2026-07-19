# Üben Exercise Variety Plan

_Created session 131 (2026-07-18). Status: **Phases 0–3 COMPLETE** (PRs 1–5, all s131): 0/1 (PR 1),
2a+2e (PR 2), 2b (PR 3), 2c (PR 4), 2d + Phase 3 variety guarantee (PR 5). **Phase 4 deferred** (the
only remaining work; do not start until template variety feels exhausted)._
_Founder ask: custom Üben sets (the Bibliothek "Üben" button on a filtered tab) should play as a
varied exercise session, not a stack of flip-cards. Constraint: no per-set content authoring, the
number of filter combinations is unbounded._

## 1. Problem

`buildScopedSession` (`src/engine/session.ts`) builds the session for every Bibliothek Üben launch
(`?src=lib` + the tab's filtered ids). Today it maps almost everything to recognition flashcards:

- vocab → `flashcard` (or `typing` once a card graduates)
- collocations → `flashcard`
- Redemittel → `flashcard`
- grammar → real drills (the only varied scope)

So a custom set IS "a bunch of Anki cards". Meanwhile the variety machinery already exists and is
simply not wired in: `src/engine/quiz.ts` **generates 10 exercise types from the existing banks with
zero authoring** (translation MCQ, article, plural, cloze from the word's own example sentence,
collocation fill, matching pairs, word-order rebuild, plus 3 theme-agnostic grammar mini-banks), and
`SessionPlayer` already renders every `QuizQuestion` kind inside a session (`QuestionView`, incl.
matching + wordOrder). The generator is just keyed by theme (`buildThemeQuiz(themeId, …)`), so scoped
sessions can't use it.

## 2. Design principle (the whole answer to the data-volume worry)

**A custom set is a filter over items; exercises are templates applied per item.** We author (or
generate) exercise *shapes*, never exercises *per set*. Any filter combination then gets variety
automatically. Authoring cost scales with the number of exercise kinds (~10 today), not with the
number of set combinations (infinite). Every phase below holds this line: **no new content data**
until Phase 4, which is explicitly deferred.

## 3. Phases

### Phase 0: pool-based generator refactor (no behavior change) — ✅ SHIPPED (PR 1, s131)

Extract the body of `buildThemeQuiz` into a pure

```
buildPoolQuiz(
  pool: { vocab: VocabItem[]; collocations: Collocation[] },
  difficulty: Difficulty,
  count: number,
  opts?: { includeGeneric?: boolean },  // connector/relative/daWord mini-banks, default false
): QuizQuestion[]
```

- `buildThemeQuiz(themeId, difficulty, count)` becomes a thin wrapper passing the theme's pools with
  `includeGeneric: true` (today's behavior, `/quiz` + composed-session Pool 2 untouched).
- **Distractor sourcing rule:** prefer the pool; when the pool has < 4 usable items, fall back to the
  full bank (small custom sets must still build 4-option MCQs). `translationQ`/`pluralQ`/`clozeQ`
  already take a separate distractor pool, so this is parameter plumbing.
- `includeGeneric: false` matters for scoped sessions: the founder's content-pure rule (2026-07-13)
  says a Bibliothek Üben practises exactly what the page shows, so the theme-agnostic grammar
  mini-banks stay out. (Distractor *strings* from the full bank are fine, they are not practiced
  content.)
- Tests: extend `tests/engine.test.ts` with the `buildPoolQuiz` contract: every answer/sourceId comes
  from the pool; distractor fallback kicks in for tiny pools; degenerate pools (1 item, no nouns, no
  plurals) never loop or throw (the existing guard counter covers this, assert it).

### Phase 1: wire variety into scoped sessions (the core ask) — ✅ SHIPPED (PR 1, s131)

`buildScopedSession` changes per scope:

- **vocab:** interleave two pools: (a) recall cards as today (flashcard/typing per
  `graduatedToTyping`), (b) generated exercises from the set via `buildPoolQuiz` (translation,
  article, plural, cloze, matching, and collocation fill/word order drawn from collocations whose
  noun resolves into the set, when any). Target mix ~50/50, exercises capped by eligibility.
- **collocation:** recall cards + `collocationFill` + `wordOrder` + the Phase 2a noun↔verb match
  grid once it lands.
- **redemittel:** unchanged in this phase (flashcards); the Redemittel cloze is Phase 2e.
- **grammar:** unchanged (already varied).

Mechanics:

- Add `difficulty` to `buildScopedSession` opts; `SessionPlayer` already computes
  `difficultyForLevel(level)` for the composed path, pass it here too.
- Order via the existing `interleave()` so kinds alternate instead of blocking; cap each set item at
  **2 appearances** (recognition card + one exercise is pedagogically fine, three is spam). The
  card/exercise pools are built from disjoint samples first, overlap only when the set is smaller
  than the block target.
- Preview line reflects the mix ("n Karten · m Übungen zum Üben").
- **FSRS guard (correctness item found while reading the code):** `SessionPlayer.captureLoot` calls
  `reviewVocab(sourceId, …)` for any quiz `sourceId`. Collocation-sourced questions
  (collocationFill/wordOrder) would write SRS cards under `c_*` ids. The collocation flashcard branch
  deliberately writes NO SRS ("collocations carry no spaced-repetition state", `types/index.ts`), and
  the composed session already has this latent inconsistency via Pool 2. Fix in this phase: guard the
  FSRS write to ids that resolve in the vocab bank (`vocabById`), collocation questions award XP +
  loot only. Pin with a test.
- Tests: new `tests/scopedSession.test.ts` (or extend `tests/engine.test.ts`): a 12-item vocab set
  yields ≥ 3 distinct block kinds; every quiz answer comes from the set; the 2-appearance cap holds;
  redemittel/grammar scopes unchanged; tiny sets (≤ 3 items) degrade to cards without throwing.

**Ship gate for Phase 1 = the founder ask is met:** Üben on a filtered Wörter tab with ≥ 8 items
plays ≥ 3 distinct exercise kinds, zero new content data.

### Phase 2: new template exercise kinds (independent, small rungs)

Each rung is a pure builder in `engine/quiz.ts` + (where noted) a renderer, its own PR, in this
order (fun-per-effort, founder may reorder):

- **2a. Collocation match grid (S) — ✅ SHIPPED (PR 2, s131):** `MatchingQuestion` with
  `pairs: {left: noun, right: verb}` from 4 set collocations, reusing the existing matching renderer.
  `collocationMatchQ` in `engine/quiz.ts` (kind stays `"matching"`, so no new renderer); a
  `distinctCols` dedupe on both noun AND verb is required because `MatchingView` keys the left column
  by `pair.left` and the right buttons by `pair.right` (a repeat on either side is ambiguous + a
  duplicate React key). Wired into `buildPoolQuiz` difficulty 1 + 2, so it reaches the collocation
  scope, composed Pool 2, AND `/quiz`. The renderer's sub-line now falls back through `q.hint`, so the
  grid reads "Wähle links ein Nomen, dann rechts das passende Verb" instead of "…die Übersetzung".
- **2b. Typed cloze (M) — ✅ SHIPPED (PR 3, s131):** production upgrade of the MCQ cloze: the blanked
  example sentence is the prompt, the learner TYPES the missing word. Implemented as a variant of the
  `typing` SessionBlock (new optional `cloze: { prompt; answers }` field) so the typing UI + grader
  are reused. `engine/typing.ts` gained `gradeTypedAny` (best verdict across targets): the blank
  accepts BOTH the exact surface form in the sentence AND the base headword when they differ (a
  sentence with "Anträge" accepts "Anträge" or "Antrag"), so neither inflection is marked wrong.
  `typedClozeData`/`clozeTypingBlock` (`engine/session.ts`) find an example containing the headword,
  blank the exact surface token, and store the full sentence for the reveal. Gated to graduated words
  (`graduatedToTyping`): in the vocab scope a graduated word has ~50% chance of the cloze variant
  instead of plain forward recall (never both), so a new word is never asked to be produced cold.
  Grades FSRS via the vocab sourceId like any typing block (fires the gender reveal on correct nouns).
  `TypingBlock` shows the blanked sentence + "Ergänze das fehlende Wort" / "Lücke" badge; the Anzeigen
  give-up is unchanged. Tests: `gradeTypedAny` in `tests/typing.test.ts`, the graduated-only gate +
  cloze shape in `tests/scopedSession.test.ts`.
- **2c. Listening word (M) — ✅ SHIPPED (PR 4, s131):** TTS speaks the full example sentence, the
  learner picks the blanked word from 4 options. New MCQ kind `listeningCloze` + an `audioPrompt` field
  on `QuizQuestionBase` (added to `QuizKind`/`MCQQuestion.kind`/`kindLabel` → "Hören");
  `listeningClozeQ` reuses the cloze blank + distractors but carries NO `hint` (an EN gloss would
  reveal the word by ear) and stores the full sentence in `audioPrompt`. `buildListeningQuiz` drives
  it; the Wörter scope emits it (~0.25 ratio) only when `buildScopedSession` gets `listening: true`,
  which `SessionPlayer` sets to `ttsSupported() && speechEnabled`. `MCQView` renders an "Anhören"
  play button (autoplay once per question, replay on tap; the session is opened by a tap, so the
  gesture requirement is met) + the gapped frame as supporting text. Grades FSRS via the vocab
  sourceId. NOT wired into `/quiz` or the composed session (that keeps its own reading-voicemail
  listening). Tested in `tests/scopedSession.test.ts` (shape, no-gloss, the TTS gate).
- **2e. Redemittel cloze (S/M) — ✅ SHIPPED (PR 2, s131):** new MCQ kind `redemittelCloze` (added to
  `QuizKind` + `MCQQuestion.kind` + `kindLabel` → "Redemittel-Lücke"). `redemittelClozeQ` blanks the
  longest content word (≥ 4 chars, not a small function-word set; modal/Konjunktiv-II verbs are
  deliberately kept as good targets) via an umlaut-safe whole-word regex; distractors come from the
  full Redemittel bank (so a small set still builds 4 options). `buildRedemittelQuiz` drives the
  Redemittel scope, which now interleaves cloze exercises (~0.35 ratio) with recall cards. The cloze
  carries the `r_*` sourceId only for the 2-appearance cap; the FSRS guard already skips it (no vocab
  match), so it awards XP + combo only, never SRS.
- **2d. Odd-one-out (M, last) — ✅ SHIPPED (PR 5, s131):** new MCQ kind `oddOneOut` ("Ausreißer"
  badge). `oddOneOutQ` anchors on a set word, resolves 2 of its authored `related` terms to bank
  entries (the word-graph `normalizeForm` logic is replicated in `engine/quiz.ts` so engine/ does not
  import features/; a `vocabResolver` map built once), and adds an outsider from a DIFFERENT theme; the
  answer is the outsider. NO sourceId (category discrimination, not recall of one card), so it awards
  XP + combo only, never FSRS. Returns null when < 2 related terms resolve or the 4 labels are not
  distinct. `buildOddOneOutQuiz` drives it in the Wörter scope (~0.2 ratio). Tested in
  `tests/scopedSession.test.ts` (4 distinct labels, answer in options, no sourceId).
- (Considered and parked: article bucket-sorting with the Artikel-Wesen creatures. The article MCQ
  already ships in Phase 1 and fires the existing gender reveal effect; a drag-sort UI is new
  interaction surface for little pedagogical delta. Revisit if the founder wants the spectacle.)

### Phase 3: polish + guarantees — ✅ SHIPPED (PR 5, s131)

- Variety guarantee: `avoidRuns` (`engine/session.ts`) greedily reorders the final block list so no
  block KIND runs 3-in-a-row when avoidable (a wall of flip-cards is the exact monotony this plan
  removes); preserves the block multiset, falls back for single-kind sessions (grammar). Pinned by a
  no-3-in-a-row test in `tests/scopedSession.test.ts`.
- Kind badge labels (`kindLabel`) cover every new kind (Redemittel-Lücke, Hören, Ausreißer); end
  screen unchanged.
- Gates: test:unit 219 · lint 0 errors · build · check:bundle 80.8 kB (main chunk unchanged, all
  engine code rides the lazy session chunk) · lint:content — all green.
- Reduced-motion + focus-mode behavior inherited from the existing block renderers, unchanged.

### Phase 4 (DEFERRED, do not start until template variety is exhausted)

- **Authored micro-exercise packs** keyed by theme/sub-theme (never by set): mini-dialogues with
  gaps, situational transformations. New `src/data/exercises.ts` bank + provenance rows + linter
  enums, pulled into any set whose items match the theme. Authoring scales with 20 themes.
- **Build-time AI-generated items** (e.g. a second cloze sentence or a transformation per vocab
  item), generated offline, pushed through the existing verification pipeline (LanguageTool +
  AI-jury sidecar + trust tiers), committed as a generated data file like `frequency.ts`. One-time
  batch cost per item, PWA/offline safe.
- **Rejected:** runtime LLM generation per session (cost, latency, unverifiable German, breaks
  offline). Only revisit for premium generative features (writing coach territory).

## 4. Per-item template eligibility (Phase 1 matrix)

| Exercise            | Needs                          | Source field(s)                  |
| ------------------- | ------------------------------ | -------------------------------- |
| translation MCQ     | any item + 3 distractors       | `de`/`en`                        |
| article MCQ         | noun with `article`            | `article`                        |
| plural MCQ          | countable noun with `plural`   | `plural`                         |
| cloze MCQ           | headword found in an example   | `examples[].de` (builder may return null, always fall back) |
| matching pairs      | ≥ 3 set items                  | `de`/`en`                        |
| collocation fill    | set collocation                | `noun`/`verb`                    |
| word order          | collocation example sentence   | `example.de`                     |

The block builder walks the set, collects eligible (item, template) pairs, and samples across
templates first (variety) then items, so one lopsided set (e.g. all verbs, no articles/plurals)
still fills its exercise half via translation/cloze/matching.

## 5. Risks

- **Collocation FSRS writes** (see Phase 1 guard). Real bug class: silent SRS state under non-vocab
  ids that Sammlung/collection code never expects.
- **Tiny sets** (1–3 items): degrade to cards; distractors fall back to the full bank; matching
  skipped below 3. Tested explicitly.
- **Cloze fragility:** regex headword blanking fails on inflection/compounds; `clozeQ` already
  returns null, the picker must always have a fallback template (translation MCQ).
- **Repeat exposure:** capped at 2 appearances per item per session.
- **Content-pure rule:** generated exercises must derive answers/sourceIds only from set items;
  distractor strings may come from the full bank. Pinned by test.
- **Bundle:** engine-only changes in the lazy session chunk; `check:bundle` is the gate.

## 6. PR slicing, effort & model recommendations

| PR | Content | Effort | Recommended model |
| -- | ------- | ------ | ----------------- |
| 1  | Phase 0 + Phase 1 (+ FSRS guard) + tests — ✅ SHIPPED (s131, Opus 4.8) | ~1 session | **Opus 4.8** |
| 2  | 2a match grid + 2e Redemittel cloze — ✅ SHIPPED (s131, Opus 4.8) | ~0.5 session | **Sonnet 5** |
| 3  | 2b typed cloze — ✅ SHIPPED (s131, Opus 4.8) | ~0.5 session | **Opus 4.8** |
| 4  | 2c listening word — ✅ SHIPPED (s131, Opus 4.8) | ~0.5 session | **Opus 4.8** |
| 5  | 2d odd-one-out + Phase 3 assertions — ✅ SHIPPED (s131, Opus 4.8) | ~0.5 session | **Sonnet 5** |

Why (same routing logic as the Artikel-Visuals and Game G2 plans: match the model to the risk in
the task, spend the big model only where judgment is the bottleneck):

- **PR 1 = Opus 4.8.** Cross-cutting engine surgery with correctness stakes (the pool refactor must
  not shift `/quiz` or composed-session behavior; the FSRS guard touches how learning history is
  written; the content-pure and 2-appearance invariants need well-designed tests). This is the one
  PR where a subtle mistake corrupts learner state, so it gets the strong model. Fable 5 is a fine
  upgrade here if the session budget allows, but the spec in this plan is deliberately detailed
  enough that Opus 4.8 can execute it.
- **PR 2 = Sonnet 5.** Mechanical: two pure builders that reuse existing question types and
  renderers (`MatchingQuestion` as-is; the Redemittel cloze mirrors the existing `clozeQ` pattern).
  Well-bounded, fully specced, cheap to verify with tests.
- **PR 3 = Opus 4.8.** Extends the typing block's UI and its tolerant-matcher grading path (edge
  cases: umlauts, article prefixes, the give-up flow) and must respect the graduation gate. More
  judgment than plumbing.
- **PR 4 = Opus 4.8.** New interaction affordance (audio prompt + play button) with capability
  gating (`ttsSupported()`), focus-mode and reduced-motion behavior to preserve; UI taste matters.
- **PR 5 = Sonnet 5.** The odd-one-out builder is data-plumbing against the already-solved related
  resolution approach (word graph), and the Phase 3 work is assertions + labels. If the related
  clusters prove messier than expected mid-PR, escalate that PR to Opus 4.8.
- **Phase 4 (when unfrozen): Fable 5** for anything that generates or drafts German learning
  content (authored micro-exercise packs, the build-time generation batch): content quality is the
  whole point there, and every generated item still passes the verification pipeline + founder
  review. **Haiku 4.5 is not recommended for any rung** (even the small PRs edit a live learning
  engine, not boilerplate).

Each PR ships gates-green and merges to `main` per the auto-ship rule; docs (this plan's status
line, `PROJECT_STATUS.md`, prompt log) update with each.

## 7. Success criteria

1. Üben from any filtered Bibliothek tab (≥ 8 items) plays ≥ 3 distinct block kinds.
2. Zero new rows in any `src/data/*` bank for Phases 0–3.
3. All existing gates green; no main-chunk growth; no FSRS writes under non-vocab ids.
4. The founder can no longer reproduce "just flipping cards" on a custom set.

## Appendix A: Options analysis (session 131, the founder ask)

The founder's question was: "make Üben not just Anki cards; add exercise variety per custom set,
but without authoring an immense amount of per-set data." The session's analysis of the engine
found the key fact: **the variety machinery already exists and is simply not wired to custom sets.**
`engine/quiz.ts` already generates ~10 exercise types from the existing banks with zero authoring,
and `SessionPlayer` already renders every one inside a session; the generator is just theme-keyed
while `buildScopedSession` maps custom-set items to flashcards. Five options were laid out, cheapest
first:

- **Option A — wire the existing generator into custom sets (RECOMMENDED first step, zero new
  content).** Refactor the theme-keyed generator to accept an arbitrary item pool, then have the
  scoped-session builder interleave recall cards with generated quiz questions drawn from the set's
  exact items. This is Phase 0 + Phase 1 of this plan. Effort: one session. New data: none.
- **Option B — add more template exercise kinds from fields already in the banks (still zero
  authoring).** Article bucket-sort, noun↔verb match grid, typed cloze, TTS listening, odd-one-out.
  Each is a pure function over existing data. This is Phase 2. Effort: ~half a day per kind.
- **Option C — bounded authored micro-exercises keyed by theme/sub-theme, never by set.** Richer
  hand-crafted items (mini-dialogues with gaps, transformations) authored per theme (20), pulled
  into any set whose items match. Authoring scales linearly with themes, never with combinations.
  This is half of Phase 4 (deferred).
- **Option D — build-time AI-generated exercises, verified by the existing pipeline.** Generate a
  second cloze / a transformation per item offline, run it through LanguageTool + the AI-jury
  sidecar, commit as a generated data file (like `frequency.ts`). One-time batch cost per item, not
  per set; stays offline/PWA-safe. The other half of Phase 4 (deferred).
- **Option E — runtime AI generation (LLM call per session). ADVISED AGAINST.** Per-session API
  cost, latency in the learning loop, no way to verify German correctness before the learner sees
  it, and it breaks offline use. Only revisit for premium generative features (writing-coach
  territory).

**Recommendation:** do A now, add B kinds incrementally (the match grid and article sort are the
highest fun-per-effort), defer C/D until template variety is exhausted, and do not do E. A+B turn
every custom Üben set into a varied session with zero new content data, because all the raw
material (articles, plurals, example sentences, collocation pairs, related terms) already sits in
the banks. This plan is that recommendation, phased.
