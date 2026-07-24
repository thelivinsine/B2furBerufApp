# Session engine & composed learning loop — current state

The session-first loop that replaced the old "drawer of 11 tools" (four zones: Praktisch ·
Bibliothek · Fortschritt + hidden Anwenden). History: `docs/DECISIONS.md`,
`docs/archive/UX_OVERHAUL_PLAN.md`.

## Composer & player
- `engine/session.ts` composer + `features/session/SessionPlayer` + `/session`;
  Schnellwiederholung is the ~5-min preset. Focused practice flows through the toolbar's
  **Üben → composed session**.
- Block kinds: recognition `flashcard` (vocab/Redemittel), `quiz`, `grammar`, `speaking` (mic
  opt-in behind `recognitionEnabled`), `typing` (typed forward recall), and `reading`
  (Lesen/Hören authentic input: Pool 6 emits ~1 per session,
  `features/session/ReadingBlock.tsx` renders a text + its comprehension MCQs, voicemails play
  via TTS when `ttsSupported()`; feeds XP + the session tally, **never vocab FSRS**).
- The speaking block has an "Anzeigen" give-up (calls `evaluate("")`: reveals the answer, grades
  FSRS 0, unlocks Weiter), mirroring the typed block.

## Bibliothek Üben sets are auto-varied
(`docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md`.) `buildScopedSession` (the Bibliothek tab's Üben)
does not stack flip-cards: it interleaves recall cards with exercises generated from the set's
own items, zero new content data — the pool-based `buildPoolQuiz` (generalized `buildThemeQuiz`,
behavior-identical for `/quiz` + composed Pool 2) plus `buildRedemittelQuiz`/
`buildListeningQuiz`/`buildOddOneOutQuiz`. Quiz kinds: `redemittelCloze`, `listeningCloze` (TTS,
gated on `ttsSupported() && speechEnabled`), `oddOneOut` (Ausreißer, no sourceId → XP only), the
noun↔verb match grid (kind `"matching"`), and a typed-cloze `typing` variant (`cloze` field,
graduated words only). **Rules to keep:** answers/sourceIds derive only from set items
(distractor STRINGS may come from the full bank); the FSRS write is guarded to ids that resolve
in the vocab bank (collocation/redemittel questions award XP + combo only, never SRS under
`c_*`/`r_*`); each item caps at 2 appearances (`capBySource`); `avoidRuns` breaks any 3-in-a-row
same-kind. Gauge variety with `pnpm report:exercise-coverage` (theme-level 20/20 🟢; residual is
word-level content polish).

## Üben is scoped to where the learner is
`Session.tsx` parses `?grammar=` (Grammatik lesson pins its topic via `grammarTopicId`, Pool 3
uses 4 drills of that topic), `?cat=` (Redemittel category), and the Bibliothek facets
`?sub=`/`?cefr=`/`?sector=` (the pure `libraryFocus` helper maps them onto the mission-style
`focus`, so the session leads with that narrowed slice; `undefined` when nothing narrows past the
theme). Priority: mission > grammar > libraryFocus; GrammarHub + bare theme stay generic.
Mission-focused sessions (`/session?mission=<id>`) lead with the mission's own vocab + Redemittel
(`missionContentIds` in `engine/mission.ts` → `buildSession`'s `focus`), then fill from the
mission's theme and drop the untethered grammar drill, so Üben mission N mirrors Spielen
mission N.

## Focus mode
`SessionPlayer` sets `useSessionStore.focusMode` while a block is on screen; `AppShell` hides all
chrome (header, bottom bar, sidebar) on `/session` + `/revision` so the session plays as a
full-screen stage; chrome returns on the end screen. The locked bottom-bar internals are
untouched (just not mounted). Reward tokens (`--reward`/`--reward-bg`, Koralle) are reserved for
loot / combo / streak moments only; the header streak pill + the Fortschritt "Aktuelle Serie"
StatCard ride them too (streak = celebration, not warning).

## SRS & engines
- `engine/srs.ts` — FSRS-6 spaced repetition (legacy SM-2 fields kept warm for rollback). Any
  edit → run `pnpm test:srs`.
- `engine/pronounce.ts` — tolerant spoken/typed answer matcher. Any edit → `pnpm test:pronounce`.
- `engine/collection.ts` — pure FSRS-stability→Lv 1-5 "collection level" mapping, the stable game
  contract for loot cards / Sammlung; unit-tested, do not drift the band boundaries.
- Artikel-Visuals reuse: the gender reveal effect fires on correct NOUN answers in the composed
  session (flashcard/typing/speaking grade paths, gender via `vocabById(sourceId)`; stage block
  content is `z-10` above the effect so the burst radiates from behind the opaque card).

## Fortschritt & Can-Do
`canDo.ts` (52 milestones) drives the Fortschritt lead section, a weakest-band diagnose card, and
the relocated theme-mastery grid. The daily-goal ring lives on Fortschritt (`/analytics`), not on
the dashboard.
