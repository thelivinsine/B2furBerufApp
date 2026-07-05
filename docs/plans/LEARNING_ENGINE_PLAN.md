# Learning Engine Plan: latency, FSRS, speaking drills, guess-first, custom decks

> Status: **Phase 0 (quick wins) SHIPPED ✅ 2026-07-04** (PR #271, squash SHA `92ab08b`),
> **Phase 3 (custom deck / "save word", #29) SHIPPED ✅ 2026-07-04** (PR #273, squash SHA `c730e76`;
> migration 0005 run by the founder; pulled forward out of order as a self-contained Opus 4.8 fit),
> and **Phase 1 (FSRS scheduler, 26b) SHIPPED ✅ 2026-07-04** (PR #275, squash SHA `c1dada8`; Fable 5
> high effort per §7, verified by a fresh-context subagent against py-fsrs reference vectors plus the
> new `pnpm test:srs` CI gate), and **Phase 2 (#27 speech-first block) SHIPPED ✅ 2026-07-05** (PR #284,
> squash SHA `6d1d8b4`; Fable 5 high effort per §7, verified by the new `pnpm test:pronounce` CI gate
> plus a Playwright smoke with a mocked SpeechRecognition). See `docs/PROJECT_STATUS.md` → "Resume
> here" for the shipped-scope recaps. **All five items are shipped, and the optional Phase 1.5
> latency plug-in ("correct but slow" demotes Good→Hard) shipped in session 57 (see §3). This plan
> is fully delivered.**
> Source: the five recommendations of `docs/strategy/PRODUCT_EVALUATION.md` (the playbook self-assessment),
> scoped as backlog items **#26 to #30** in `docs/PROJECT_STATUS.md`. Evidence base:
> `docs/reference/LANGUAGE_LEARNING_SUCCESS_FACTORS.md`.
>
> Design provenance: grounded in a code exploration pass of `engine/srs.ts`, `engine/session.ts`,
> `engine/speech.ts`, the review call sites, both zustand stores, and `lib/cloudSync.ts` on
> 2026-07-03; every file/line reference below was verified against that pass. Each phase is
> independently shippable as one squash-merged PR into `main` per the house workflow.
>
> Guardrails that apply to every phase: German user-facing copy with **no em dashes**; the locked
> bottom-bar mechanics and dialog overlay tokens stay untouched; verification gates are
> `pnpm typecheck` + `pnpm lint:content` + `pnpm build` before any push; content banks
> (`src/data/*`) are not touched by any phase, so there are no provenance/linter implications.

## 1. Why, and in what order

The evaluation found Genauly strong on curriculum/CEFR and the writing loop, weakest on
**production mechanics** (no speech-first exercise) and **scheduler intelligence** (SM-2,
correctness-only). The five fixes, and the reason for this sequence:

- **26a latency capture (Phase 0):** the FSRS upgrade wants a per-card speed signal ("correct but
  slow"). Shipping the recorder months before the scheduler swap means real training data exists
  when 26b lands. Cheap, invisible, zero-risk.
- **#28 guess-before-reveal (Phase 0):** anticipatory retrieval on MCQ questions, a high-evidence,
  low-effort technique. Converts recognition items into retrieval attempts.
- **#30 voice variety (Phase 0):** talker variability is a productive desirable difficulty for
  phonological transfer. The speech-rate slider and voice picker already exist; only rotation is
  missing.
- **26b FSRS (Phase 1):** the playbook's single most-cited upgrade (roughly 23% less review volume
  at equal retention). Needs care, not size: the scheduler is one pure function with one call site.
- **#27 speech-first block (Phase 2):** the biggest product gap (eval dimension 5, lowest score).
  The STT wrapper (`listen()` in `src/engine/speech.ts`) is fully built and has zero consumers
  today; this phase is its first.
- **#29 custom deck (Phase 3):** the Hook-model "investment" surface (stored value, switching
  cost). Last because it spans store, cloud schema, and UI, and pairs naturally with the
  sentence-mining idea in `docs/strategy/AI_PRODUCT_STRATEGY.md` (idea 11).

Load-bearing facts the whole plan leans on:

- `review()` (`src/engine/srs.ts:13`) has **one** call site: `useProgressStore.reviewVocab`
  (`src/store/useProgressStore.ts:78-82`). `Grade = 0|3|4|5` maps 1:1 onto FSRS
  Again/Hard/Good/Easy. Full grade granularity survives only in `Flashcards.tsx`; every quiz path
  collapses to `correct ? 4 : 0`.
- The progress store persists with **no version/migrate** (`b2beruf.progress.v1`), so additive
  optional `SrsCard` fields are safe: old cards simply lack them, and `cloudSync.mergeSrs`
  (`src/lib/cloudSync.ts:35-48`) carries whole card objects.
- The `progress` DB table has **no catch-all jsonb** (each store field is a named column in
  `supabase/migrations/0001_init.sql`), so new progress-store fields need a column + explicit
  wiring. Settings-store fields sync free: `profileRow()` sweeps them all into `profiles.settings`
  jsonb.
- Session Pool 1 (`src/engine/session.ts:135-160`) iterates **all** vocabulary and `isDue`
  treats never-studied as due, so any word can enter a session; biasing needs only a
  `reviewWeight` input.
- MCQ views remount per question via `key={q.id}` (`QuizRunner.tsx:180`) and `key={block.key}`
  (`SessionPlayer.tsx:225`). Phase 0 makes these keys load-bearing; each gets a guard comment.
- No test framework exists. Verification follows the `scripts/*.mjs` + package script + CI gate
  pattern established by `lint-content`.

## 2. Phase 0: quick wins (26a + #28 + #30) — SHIPPED ✅ 2026-07-04 (PR #271, `92ab08b`)

One PR, one commit per item so each is independently revertable. Ship the code on a fresh branch
(not stacked on unmerged docs work; if it must stack, rebase onto `main` after the docs PR
squash-merges, since squash rewrites history).

### 2.1 · 26a: response-latency capture

**Empfohlenes Modell: Opus 4.8.** It touches the SRS engine signature and the store; correctness
matters more than the small diff suggests.

Write-only training data for Phase 1. No scheduling behavior changes.

- **`src/types/index.ts` (SrsCard, lines 439-450):** add optional `lastMs?: number` (latency of the
  most recent review, ms, clamped) and `emaMs?: number` (exponential moving average, alpha 0.3).
  Doc-comment both: measured from prompt render to the first committing tap; samples are clamped to
  a 60s ceiling (clamped, not discarded, so an idle tab reads "slow" rather than "14 minutes").
- **`src/engine/srs.ts`:** widen the signature to
  `review(card, grade, on: Date = new Date(), latencyMs?: number)`. When `latencyMs` is a finite
  number above 0: `ms = min(round(latencyMs), 60000)`; `lastMs = ms`;
  `emaMs = card.emaMs == null ? ms : round(0.3 * ms + 0.7 * card.emaMs)`. When absent, carry the
  previous `lastMs`/`emaMs` forward unchanged (a latency-less call site must not wipe history).
  `freshCard`, `isDue`, `mastery`, `reviewWeight`, `dueCount` untouched.
- **`src/store/useProgressStore.ts`:** `reviewVocab(vocabId, grade, latencyMs?)` (interface line
  24, implementation lines 78-82) passing `review(card, grade, new Date(), latencyMs)`.
- **`src/lib/hooks.ts`:** new `useAnswerTimer(key: unknown): () => number`. A
  `useRef(performance.now())` with a render-phase reset when `key` changes (captures "first render
  of the new prompt" before paint; ref writes are idempotent under StrictMode), returning a stable
  callback `() => Math.round(performance.now() - startRef.current)`. No millisecond timer exists in
  the codebase today (`useCountdown`/`useStopwatch` are second-granular).
- **Call sites (4):**
  1. `src/features/vocabulary/Flashcards.tsx`: latency = front render to **first** flip.
     `useAnswerTimer(card.id)` plus a `latencyRef` reset when `card.id` changes; both flip paths
     record it (card tap at :105, "Antwort zeigen" at :158); flipping back and forth does not
     overwrite. `grade(g)` (:75) passes `latencyRef.current ?? undefined`. Known noise: after
     "Neue Runde", round 2 starting on the same card id continues the old timer; reset explicitly
     in the restart handler or accept the noise (note in code).
  2. `src/features/vocabulary/VocabQuiz.tsx`: latency = prompt render to option tap.
     `useAnswerTimer(index)`; capture in `choose()` (:73) before `reviewVocab`.
  3. `src/features/quiz/QuestionViews.tsx` (`MCQView`): `useAnswerTimer(q.id)`; widen the callback
     to `onResult(correct: boolean, latencyMs?: number)` on `MCQView` and the `QuestionView`
     dispatcher. `WordOrderView`/`MatchingView` keep calling `onResult(correct)`: constructive
     multi-tap interactions are not a retrieval-latency signal. Thread the new arg through
     `QuizRunner.recordAndNext` (:64-68) and `SessionPlayer.onQuizResult` (:104-108) into
     `reviewVocab` inside the existing `sourceId && kind !== "matching"` guards.
  4. `SessionPlayer.FlashcardBlock` (SessionPlayer.tsx:265-334): mount-time ref (the block remounts
     per `block.key`); capture on first flip via all three paths (card tap :285, keyboard :286,
     "Antwort zeigen" :315); widen `onGrade(correct, latencyMs?)`; parent threads it at :129
     (vocab branch only; the Redemittel branch has no SRS card).
- **Explicitly not done:** no persist migration (both fields optional; adding a version would force
  a no-op migrate), no supabase migration (`progressRow()` pushes `srs` as one jsonb blob, so the
  fields ride along), no `reviewWeight`/`mastery` change, no UI display of latency, no latency on
  grammar drills (no SRS card) or matching (no per-word attribution).

### 2.2 · #28: guess-before-reveal (MCQ retrieval gate)

**Empfohlenes Modell: Sonnet 5.** A well-specified UI state machine, two components + one setting.

- **`src/store/useSettingsStore.ts`:** `guessFirst: boolean`, default **true** (the technique is
  the point; opt-out preserved). No migration needed: zustand shallow-merges defaults under missing
  keys, and the field auto-syncs via the `profiles.settings` jsonb sweep. `mergeRemoteSettings`
  spreads only keys present in the remote blob, so old cloud profiles cannot clobber the default.
- **`src/features/quiz/QuestionViews.tsx` (MCQView only):** read the flag directly from the store
  (avoids threading a prop through both consumers). `const [revealed, setRevealed] =
  useState(!guessFirst)`, correct-by-mount thanks to the per-question remount keys. When
  `!revealed`: prompt card renders as today (with its SpeakButton: audio is part of the prompt),
  and the options grid is replaced by a hint line + one full-width outline button. When `revealed`:
  options as today. WordOrder/Matching untouched (already constructive).
- **`src/features/vocabulary/VocabQuiz.tsx`:** same pattern with explicit reset points: `next()`
  (:84) and `restart()` (:46) set `revealed = !guessFirst` (re-reading the live flag, so a mid-quiz
  settings change applies from the next question). `choose()` is unreachable pre-reveal (buttons
  not rendered) and the tap-anywhere advance is already guarded by `picked`, so the gate cannot
  double-fire.
- **26a interaction (deliberate):** latency is measured from prompt render and is NOT reset on
  reveal; it spans the think stage. That is the retrieval-latency signal we want. One comment at
  the gate button records this.
- **Settings UI (`src/features/settings/Settings.tsx`):** a new small **"Lernen"** card between
  Profil and Darstellung (Phase 3 adds rows there too), one Switch row mirroring the "Reduzierte
  Animation" row shape.
- **Copy (German, no em dashes):**
  - Gate hint: "Überlege zuerst: Wie heißt die Antwort? Dann vergleiche."
  - Gate button: "Optionen zeigen"
  - Settings row: "Erst überlegen, dann Optionen" with description "Bei Auswahlfragen kurz selbst
    antworten, bevor die Optionen erscheinen. Das stärkt den Abruf."

### 2.3 · #30: talker variability (voice rotation)

**Empfohlenes Modell: Sonnet 5.** Small, centralized, fully specified; the tricky part (precedence
and mutual exclusion) is already decided here.

- **`src/engine/speech.ts`:** module-level round-robin `nextGermanVoiceURI(): string | undefined`
  over `getGermanVoices()` (returns `undefined` under 2 voices, degrading to the existing
  `voices[0]` fallback). Round-robin, not random, so consecutive utterances always differ. Extend
  `SpeakOptions` with `variety?: boolean` and resolve precedence **inside `speak()`** (line 43):
  pinned `voiceURI` match, else `variety` rotation, else `voices[0]`. Call sites stay dumb.
- **`src/store/useSettingsStore.ts`:** `voiceVariety: boolean`, default **false** (opt-in,
  founder-safe). Syncs free via the settings jsonb sweep.
- **Call sites (3):** `src/components/shared/SpeakButton.tsx:43` (one store read + pass `variety`;
  covers roughly 11 surfaces), `src/features/simulation/SimulationRunner.tsx:98`,
  `src/features/exam/ExamRunner.tsx:104`. Design note: within one simulated dialogue the voice can
  change per utterance; acceptable for v1 (arguably the feature's point). If the founder objects,
  pin one rotated voice per Runner mount as a refinement.
- **Settings UI:** in the Sprachausgabe card, under the voice Select (after :342), rendered only
  when more than one German voice exists. Copy: "Stimmen abwechseln" with description "Wechselt bei
  jeder Wiedergabe zwischen den verfügbaren deutschen Stimmen." **Mutual exclusion:** enabling the
  switch also sets `voiceURI: null` (unpin); picking a voice in the Select sets
  `voiceVariety: false`. Without this, a pinned voice silently wins and the switch looks broken.
  (Display wrinkle, pre-existing: the Select shows `voices[0]` even when unpinned; the
  mutual-exclusion writes keep actual state consistent.)

### 2.4 · Phase 0 verification recipe

1. `pnpm install` first (this sandbox may lack `node_modules`; if install fails, stop, nothing in
   this plan expires). Then the three gates: `pnpm typecheck`, `pnpm lint:content`, `pnpm build`.
2. **26a smoke (pnpm dev):** run a composed session; on a flashcard block wait ~3s, flip, grade.
   Answer an MCQ via a QuizRunner deep link. Then DevTools → Local Storage →
   `b2beruf.progress.v1` → `state.srs[<vocabId>]` shows `lastMs` roughly matching the wait and
   `emaMs === lastMs` on the first sample; a second review of the same word moves `emaMs` toward
   the new sample rather than equal to it. Hand-delete the two fields from one card and reload:
   reviews still work (old-format tolerance).
3. **#28 smoke:** default settings: MCQ prompt renders without options; "Optionen zeigen" reveals;
   wait 5s before revealing and ~1s after: `lastMs` ≈ 6000 (gate time included). Toggle the
   setting off: options render immediately. WordOrder/Matching unchanged. VocabQuiz tap-anywhere
   still fires only post-answer.
4. **#30 smoke (Chrome, multiple de-* voices):** switch appears; enabling unpins the voice;
   repeated SpeakButton taps rotate audibly; pinning a voice in the Select flips the switch off;
   the switch hides with 0 or 1 German voices. Simulation and Exam audio still play.

## 3. Phase 1: FSRS scheduler (26b) — SHIPPED ✅ 2026-07-04 (PR #275, `c1dada8`)

**Empfohlenes Modell: Fable 5, high effort.** Subtle scheduler math that silently degrades learning
if wrong. Run a fresh-context verification subagent against the FSRS reference vectors before
merging (see §7). Opus 4.8 is the fallback model.

> **As shipped (session 53):** implemented as specified below, hand-rolled (the `ts-fsrs` fallback
> dependency was not needed). Chosen algorithm revision: **FSRS-6** (21 default weights,
> trainable-decay retrievability), matched against **py-fsrs 6.3.1** configured for this app's
> semantics (no sub-day learning/relearning steps, no fuzzing, desired retention 0.9, max interval
> 36500 days). Elapsed time since the last review is reconstructed as `due - interval` (both
> day-granular), and same-day repeats take FSRS's short-term stability path. One deliberate reading
> of the seed spec was verified in-session: the ease→difficulty map is linear through ease 2.5 → D 3
> and keeps falling toward the clamp at 1 for higher ease, so an often-rated-Easy card seeds easy
> (consistent with FSRS's own difficulty floor). The verification recipe became `scripts/test-srs.mjs`
> + `pnpm test:srs` + a validate.yml step: 310 assertions against golden vectors generated from
> py-fsrs (grade sequences including the library's published happy path, same-day/late/early reviews,
> legacy seeding, the 26a latency regression, contract invariants), all passing at 1e-9 tolerance.
> A fresh-context verification subagent independently re-derived the formulas and vectors (verdict
> PASS), and a Playwright smoke confirmed a live composed-session review persists the exact FSRS
> first-rating reference values. The latency plug-in below stays Phase 1.5 (not shipped).

Replace SM-2 inside `review()` with a hand-rolled compact FSRS, behind the **unchanged** export
surface of `src/engine/srs.ts` (`review`, `freshCard`, `isDue`, `mastery`, `masteryLabel`,
`reviewWeight`, `dueCount`). Hand-rolled matches the house ethos (the SM-2 is hand-rolled, minimal
deps, pnpm 24h supply-chain cooldown); the scheduler with published default weights is compact,
and the hard part (the parameter optimizer) is not needed client-side.

- **State:** `SrsCard` gains optional `stability?: number` and `difficulty?: number`. Legacy fields
  (`ease`, `interval`, `reps`, `due`) are retained and keep updating:
  - `reps` keeps incrementing so `cloudSync.mergeSrs` (higher-`reps`-wins, tie-break later `due`)
    stays valid **unchanged**.
  - `due` stays a day-granular `YYYY-MM-DD` string: `interval = max(1, round(fsrsIntervalDays))`,
    then `todayKey(next)` as today. FSRS tolerates day granularity fine at this scale.
- **Lazy migration:** on the first `review()` of a card with `stability === undefined`, seed from
  legacy state. Proposed seeds (verify against reference behavior in-session): initial stability
  from the current interval (`max(0.5, interval)`), initial difficulty mapped inversely from ease
  (`ease 1.3 → D≈10`, `ease 2.5+ → D≈3`, linear in between, clamped to [1, 10]). Never bulk-migrate
  the store; untouched cards stay legacy until reviewed.
- **Grades:** `0|3|4|5` map to FSRS Again/Hard/Good/Easy. Note the honest limitation recorded in
  the eval: only Flashcards emits Hard/Easy today; quiz paths emit Good/Again. FSRS still works on
  a two-grade diet, just with less signal.
- **`mastery()`** reformulated from stability (e.g. saturating `stability / 30`, blended with reps
  as today) keeping the same 0..1 contract so `masteryLabel`, the theme grid, Can-Do thresholds,
  and `reviewWeight` are untouched.
- **Latency plug-in (Phase 1.5) — SHIPPED ✅ session 57.** "Correct but slow" demotes Good→Hard
  when the review's clamped latency exceeds `LATENCY_SLOW_FACTOR` (1.5×) of the card's own `emaMs`,
  gated on `LATENCY_MIN_SAMPLES` (3) prior samples so the EMA is trustworthy, and purely relative
  to that per-card EMA (never an absolute cross-format threshold). A `LATENCY_SLOW_FLOOR_MS` (2000)
  guard only *blocks* demotion of a sub-2s, obviously-confident recall; it never causes one. New
  `SrsCard.msCount` counts samples; `review()` gained an `opts.latencyGrading` flag (engine default
  off, so pure/test calls never demote), fed by the new `latencyGrading` setting (default **on**,
  toggle in the Settings "Lernen" card). The demotion is scheduling-only: `lastGrade` keeps the
  learner's honest button press and latency is still recorded. 13 new `pnpm test:srs` assertions pin
  it (demoted Good == a real Hard on the same card state; fast/off/<3-samples/floor all skip).
- **Verification without a test framework:** new `scripts/test-srs.mjs` + a `test:srs` package
  script + a step in `.github/workflows/validate.yml` (the `lint-content` pattern). Assert the
  scheduler against published FSRS reference vectors (the open-spaced-repetition project publishes
  test suites for ts-fsrs/py-fsrs and the algorithm wiki). **Fallback:** if the hand-rolled
  scheduler cannot match the vectors, take `ts-fsrs` as a dependency (pure TS, no build scripts;
  respect the pnpm minimum-release-age cooldown) and keep `srs.ts` as the adapter.
- **Rollback story:** legacy fields are retained and kept warm, so reverting the engine file
  reverts scheduling behavior with no data repair.

## 4. Phase 2: speech-first production block (#27) — SHIPPED ✅ 2026-07-05 (PR #284, `6d1d8b4`)

**Empfohlenes Modell: Fable 5, high effort.** A new block kind end to end, the first STT consumer,
fuzzy matching, and flaky browser speech APIs; verify in a real browser, not just the build.

> **As shipped (session 56):** implemented as specified below, with the matcher in its own pure
> `src/engine/pronounce.ts` (leading `sich` treated like an article so bare verb forms count;
> ß→ss). One deliberate reading of the fallback ladder: "repeated STT failure → skip remaining
> speaking blocks" was implemented as *remaining speaking blocks start directly in the typed
> fallback* (after 2 hard errors), which preserves the session's block count and keeps the
> production practice. `no-speech` returns to the prompt for a retry instead of counting as a hard
> failure. An 8s soft countdown caps the mic window and grades the best partial when no final
> transcript arrives. Two real-browser findings are guarded in code: `onerror` is always followed
> by `onend` (the end handler must not drag the UI back after an error routed to typing), and
> StrictMode's dev double-invoke would latch the unmount guard (the effect body re-arms it). New CI
> gate `pnpm test:pronounce` (26 checks) pins the matcher contract in `validate.yml`. Verified by a
> 21-check Playwright smoke with a mocked SpeechRecognition (STT happy path with +12 XP and
> persisted latency, voluntary typed path, mic-error fallback, recognition-off session shows no
> speaking block), zero console errors.

- **`src/types/index.ts`:** new `SessionBlock` union member
  `{ kind: "speaking"; key: string; sourceId: string; de: string; en: string; example?: string }`.
- **`src/engine/session.ts`:** a fifth pool added to the `interleave([...])` call (:198), built
  from due vocab (reuse Pool 1's weighting; up to ~2 speaking blocks per session). The engine stays
  pure: `BuildSessionOpts` gains a `speaking?: boolean` flag; the caller (SessionPlayer) computes
  it as `recognitionEnabled && recognitionSupported()`. The pool is empty when the flag is off, so
  learners without mic/STT/opt-in never see the block type.
- **`src/features/session/SessionPlayer.tsx`:** new `SpeakingBlock` component + a
  `block.kind === "speaking"` branch + an `onSpeakingResult` handler. Loop: show the EN meaning
  (plus optional example) → soft countdown (existing `useCountdown` from `lib/hooks.ts`) →
  `listen()` from `engine/speech.ts` (its first call site) streams partials → normalize + match
  the final transcript against `de` → instant feedback → grade `4 | 0` with 26a latency (countdown
  start to final transcript) → `reviewVocab`. Advance via the existing Weiter pattern.
- **Matching helper:** new pure `src/engine/pronounce.ts` (or a function in `speech.ts`):
  lowercase, strip punctuation and leading articles (der/die/das/ein/eine), collapse whitespace,
  then tolerant compare (small Levenshtein distance scaled by length, or containment for
  multi-word targets). Pure and unit-checkable by the same `scripts/test-srs.mjs`-style script if
  wanted.
- **`src/engine/scoring.ts`:** add `speakingDrill` to the `XP` map (suggest 12, between quiz and
  redemittel).
- **Fallback ladder:** mic permission denied or `onError` mid-block → the block flips to an inline
  text input ("Tippe, was du sagen wolltest") and grades by the same matcher; repeated STT failure
  → skip remaining speaking blocks this session. `listen()` already returns `null` when
  unsupported.
- **Browser caveats section (write into the PR):** webkitSpeechRecognition needs a user gesture and
  HTTPS; `continuous` mode restarts unpredictably on Android; iOS Safari support is partial; the
  existing `recognitionEnabled` setting (currently inert, default false) becomes the opt-in and
  should get a one-line description update in Settings.
- **Copy sketch (German, no em dashes):** block eyebrow "Sprechen"; prompt "Sag es auf Deutsch:";
  listening state "Ich höre zu …"; success "Gut gesagt!"; fallback prompt "Mikrofon nicht
  verfügbar. Tippe deine Antwort."

## 5. Phase 3: custom deck / "save word" (#29) — SHIPPED ✅ (session 52, PR #273, `c730e76`)

Shipped as described below, with one deliberate deviation: the "Gespeichert" filter was implemented as
a per-learner **toolbar toggle** (`?saved=1` in `VocabularyTrainer`) rather than a facet in the central
registry, because "saved" is learner state, not a static content field, so it fought the facet option
model exactly as the fallback in this section anticipated. Migration 0005 was run by the founder.

**Empfohlenes Modell: Opus 4.8.** The risk sits in store/cloudSync/DB-migration wiring; the UI half
is Sonnet-grade, so a single Opus session covers both cleanly.

- **Store (`src/store/useProgressStore.ts`):** `savedWords: string[]` (vocab ids) +
  `toggleSavedWord(id)`. It is learning data, so it belongs on the progress store, NOT the
  settings store (the settings cloud merge only adopts remote pre-onboarding, which would lose
  saved words across devices).
- **Cloud (`src/lib/cloudSync.ts` + migration):** unlike settings, progress fields need explicit
  wiring in three places: `progressRow()` gains `saved_words: s.savedWords`,
  `mergeRemoteProgress()` merges with the existing `unionStrings`, and a new migration
  `supabase/migrations/0005_saved_words.sql`:
  `alter table public.progress add column if not exists saved_words jsonb not null default '[]'::jsonb;`
  The founder runs it once in the dashboard SQL editor (same runbook pattern as
  `docs/plans/PHASE2_SETUP.md`); the column default covers all existing rows, no backfill needed.
- **UI:** a bookmark icon-button in the `src/features/vocabulary/VocabList.tsx` header row (next to
  the SpeakButton, lines 42-44; remember `stopPropagation` like SpeakButton). A "Gespeichert"
  filter on the Bibliothek Wörter tab via the central facet registry (`src/lib/facets.ts`), or a
  simple toolbar chip if a boolean facet fights the registry's option model. Optional: a saved
  count in the "Lernen" settings card from Phase 0.
- **Engine:** `reviewWeight(card, opts)` (`src/engine/srs.ts:65-74`) gains an optional
  `saved?: boolean` boost (suggest +1, same magnitude as `modeMatch`), threaded from session
  Pool 1 (`session.ts:135-160`) by checking membership in `savedWords`.
- **Upgrade path:** pairs with `docs/strategy/AI_PRODUCT_STRATEGY.md` idea 11 (AI sentence mining):
  saved words are the natural seed list for personalized example sentences.
- **Copy sketch:** icon aria-label "Wort speichern" / "Gespeichert", filter chip "Gespeichert",
  empty state "Noch keine gespeicherten Wörter. Tippe das Lesezeichen an einem Wort."

## 6. Cross-phase concerns

**Persistence and sync policy (decided once, reused per phase):**

| Data | Store | Persist migration? | Cloud path |
|---|---|---|---|
| `lastMs`/`emaMs` (26a) | progress → `srs` record | No (optional fields) | Rides inside the `srs` jsonb blob, zero wiring |
| `guessFirst`, `voiceVariety` (#28/#30) | settings | No (defaults merge) | Auto via `profiles.settings` jsonb sweep |
| `stability`/`difficulty` (26b) | progress → `srs` record | No (lazy per-card seed) | Rides inside `srs`; `mergeSrs` unchanged (reps kept) |
| `savedWords` (#29) | progress (new field) | No (new key defaults) | Needs `progressRow` + `mergeRemoteProgress` + DB column (migration 0005) |

**Risk register (from the design pass):**

- The per-question remount keys (`QuizRunner.tsx:180`, `SessionPlayer.tsx:225`) become load-bearing
  for the gate and timers in Phase 0. Add a one-line guard comment at each key.
- `speechSynthesis.getVoices()` can be empty until a voiceschanged event or first utterance
  (notably iOS); the voice-variety switch may appear only after a re-render. Same pre-existing
  behavior as the voice Select; `nextGermanVoiceURI()` degrades safely to the default voice.
- `resetSettings`/`resetProgress` restore the new defaults (`guessFirst: true`,
  `voiceVariety: false`, empty `savedWords`); expected, but pre-existing reset behavior now covers
  more surface.
- EMA first-sample bias: 26b's latency grading must require at least 3 samples per card.
- Latency semantics differ per surface (flashcard time-to-flip vs MCQ time-to-select); compare only
  within a card's own history, never across formats with absolute thresholds.
- The voice-rotation cursor advances even for utterances cancelled by `synth.cancel()` (rapid
  taps); cosmetic, no fix needed.
- Stacked-branch hazard: if code branches stack on unmerged docs branches, rebase onto `main` after
  the docs PR squash-merges.

**Per-phase gates:** `pnpm typecheck` + `pnpm lint:content` + `pnpm build` green before push; the
manual smoke steps of the phase; squash-merge PR into `main`; post-merge branch realignment per
CLAUDE.md; `docs/PROJECT_STATUS.md` + `docs/SESSION_PROMPT_LOG.md` updated with the shipped phase.

## 7. Execution notes for future sessions (Claude Fable 5 guidelines)

Per founder request, these follow the published guidance in
[Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5).

**Model and effort per item** (mirrors the per-phase "Empfohlenes Modell" lines):

| Item | Model | Effort | Why |
|---|---|---|---|
| 26a latency capture | Opus 4.8 | default | Engine + store signatures; small but correctness-sensitive |
| #28 guess-first | Sonnet 5 | medium | Fully specified UI state machine |
| #30 voice variety | Sonnet 5 | medium | Small, centralized, decisions pre-made |
| 26b FSRS | Fable 5 | high | Subtle math; silent failure mode is degraded learning |
| #27 speaking block | Fable 5 | high | New block kind, first STT consumer, flaky browser APIs |
| #29 custom deck | Opus 4.8 | default | Store/cloud/migration wiring is the risk center |

**Working style (from the guidelines, applied to this plan):**

- **Act on this plan; do not re-derive it.** The exploration facts above were verified 2026-07-03.
  When you have enough information to act, act; give a recommendation, not a survey, if a choice
  genuinely remains.
- **Verify with a fresh-context subagent** for the FSRS work: after implementing the scheduler,
  spawn a verifier that checks the implementation against the published reference vectors without
  seeing the implementation session's assumptions. Separate verifiers outperform self-critique.
- **Ground progress claims in tool results.** Only report a gate as green if the command output in
  the session shows it; if `pnpm install` fails in the sandbox, say so and stop rather than
  committing unverified code.
- **Stay in scope.** No refactors beyond the phase (in particular: do NOT introduce a block-type
  registry in SessionPlayer while adding the speaking block; the inline dispatch is fine until a
  second new kind exists, and premature abstraction is explicitly out).
- **Pause only where the work genuinely needs the founder:** the #29 SQL migration (only they can
  run it) and any change that would touch locked surfaces. Everything else in this plan is
  pre-approved scope.
