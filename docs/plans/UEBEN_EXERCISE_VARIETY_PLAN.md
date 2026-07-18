# Üben Exercise Variety Plan

_Created session 131 (2026-07-18). Status: **approved plan, not yet built**._
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

### Phase 0: pool-based generator refactor (no behavior change)

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

### Phase 1: wire variety into scoped sessions (the core ask)

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

- **2a. Collocation match grid (S):** `MatchingQuestion` with `pairs: {left: noun, right: verb}`
  from 4 set collocations. Reuses the existing matching renderer as-is. Wire into collocation scope
  + composed Pool 2.
- **2b. Typed cloze (M):** production upgrade of the MCQ cloze: the blanked example sentence is the
  prompt, the learner TYPES the headword. Implement as a variant of the existing `typing` block
  (optional `clozePrompt` field) so the tolerant matcher (`engine/pronounce.ts`) + typing UI are
  reused; grades FSRS like typing does. Gate to graduated cards (same
  `TYPING_STABILITY_FLOOR` logic) so new words are never asked cold. Extend `tests/typing.test.ts`.
- **2c. Listening word (M):** TTS speaks the example sentence (`engine/speech.ts`), the learner
  picks the missing/heard word from 4 options. MCQ with an `audioPrompt` flag + a play button in
  `QuestionViews`; composer emits it only when the caller reports `ttsSupported()` (same pattern as
  the reading voicemail). Turns any set into listening practice for free.
- **2e. Redemittel cloze (S/M):** blank one content word (≥ 4 chars, not a function word) of a
  Redemittel phrase, distractors sampled from other Redemittel. Brings variety to the Redemittel
  scope, which Phase 1 leaves card-only.
- **2d. Odd-one-out (M, last):** 3 words from one resolvable `related` cluster + 1 outsider,
  "Welches Wort passt nicht dazu?". Reuse the word-graph resolution approach; only use clusters that
  fully resolve (495/3,268 `related` terms don't, see `docs/reports/related-terms-report.md`).
- (Considered and parked: article bucket-sorting with the Artikel-Wesen creatures. The article MCQ
  already ships in Phase 1 and fires the existing gender reveal effect; a drag-sort UI is new
  interaction surface for little pedagogical delta. Revisit if the founder wants the spectacle.)

### Phase 3: polish + guarantees

- Variety guarantee: no 3 consecutive blocks of the same kind for sets ≥ 6 items (interleave order
  assertion in tests).
- Kind badge labels (`kindLabel`) cover every new kind; end screen unchanged.
- Gates: `pnpm test:unit`, `pnpm lint`, `pnpm build`, `pnpm check:bundle` (all engine code rides the
  lazy session chunk; main-chunk budget must not move).
- Reduced-motion + focus-mode behavior inherited from existing blocks, verify nothing regressed.

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

## 6. PR slicing & effort

| PR | Content | Effort |
| -- | ------- | ------ |
| 1  | Phase 0 + Phase 1 (+ FSRS guard) + tests | ~1 session |
| 2  | 2a match grid + 2e Redemittel cloze | ~0.5 session |
| 3  | 2b typed cloze | ~0.5 session |
| 4  | 2c listening word | ~0.5 session |
| 5  | 2d odd-one-out + Phase 3 assertions | ~0.5 session |

Each PR ships gates-green and merges to `main` per the auto-ship rule; docs (this plan's status
line, `PROJECT_STATUS.md`, prompt log) update with each.

## 7. Success criteria

1. Üben from any filtered Bibliothek tab (≥ 8 items) plays ≥ 3 distinct block kinds.
2. Zero new rows in any `src/data/*` bank for Phases 0–3.
3. All existing gates green; no main-chunk growth; no FSRS writes under non-vocab ids.
4. The founder can no longer reproduce "just flipping cards" on a custom set.
