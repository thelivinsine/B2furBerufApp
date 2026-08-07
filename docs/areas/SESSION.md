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
- **A reading block never repeats a text the learner has finished (s198).** Pool 6 draws from the
  texts NOT in `useProgressStore.textsDone` and falls back to the whole scoped pool once they are
  all read, so the block never disappears. `SessionPlayer` records the id when the block completes,
  passed or not, and the field syncs (migration 0018, unioned like `scenariosDone`). Before this the
  draw had no memory at all, and with a theme scope the pool is 1 to 3 texts, so the same text kept
  coming back (content audit §2.2 "Reuse").
- **A gap comes from `engine/blank.ts` (s198),** the one rule shared with the MCQ and listening
  clozes: it matches the headword, the verb forms in `verbForms.ts`, the plural or the content token
  of a multi-word headword, so a natural sentence no longer has to spell the bare infinitive. The
  typed cloze stays lenient about inflection only for a headword gap; a Partizip II or plural gap
  accepts just that form, because the sentence around it takes nothing else.
- The speaking block has an "Anzeigen" give-up (calls `evaluate("")`: reveals the answer, grades
  FSRS 0, unlocks Weiter), mirroring the typed block.
- **Pool 4 (Redemittel recall) is theme-aware since s182.** The bank now carries `themeId` on the
  situational phrases (untagged = universal), so the pool is: mode filter by the theme's context,
  then the scoped theme's own phrases lead and the universal ones fill the remaining slot. Before
  the tagging pass both rules were dead code, because `themeId` sat on 0 of 158 phrases.

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
**The Lebensbereich pills need no entry here** (s184): the Bibliothek Üben button hands over the
tab's already-filtered ids (`?src=lib` + `setLibrarySession`), which takes priority over every
tailoring path, so the area narrowing rides along by construction. `libraryFocus` deliberately does
NOT read `?area=`: it only serves hand-built `/session?…` deep links, which nothing in the app
generates, and adding a param there that no surface writes would be dead contract.
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

## A running session survives a reload (s172)
- `SessionPlayer` holds a **live-work claim** (`lib/liveWork.ts`) while a block is on screen, so the
  PWA's auto-update reload waits for the end screen instead of wiping the run mid-block. See the
  cross-cutting rule in `../../CLAUDE.md`.
- `features/session/sessionResume.ts` snapshots the run (plan, index, XP/correct/combo tallies, loot,
  the STT fallback flag) to **sessionStorage**, keyed by `sessionSignature()` of the launch params.
  sessionStorage on purpose: it survives a reload of the tab and dies with it, so tomorrow's Üben
  press always composes fresh, never silently resumes an abandoned run. 3h TTL as a backstop.
- The snapshot always points at the next **unanswered** block: an answered block has already been
  graded into FSRS and XP, so replaying it would double-count.
- Cleared on finish, on "Beenden" and on "Neue Runde". Those set an `abandoned` ref first, since the
  unmount that follows would otherwise flush the snapshot straight back.

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
`canDo.ts` (52 milestones) drives the Fortschritt lead section, the diagnose card, and the
relocated theme-mastery grid. The daily-goal ring lives on Fortschritt (`/analytics`), not on
the dashboard.

Page order (variant 3 "Kompetenzkurve", founder-picked s171; preview
`preview/verlauf-fortschritt-redesign.html`): Überblick (ring + level + 4 tiles, unchanged) →
**Kompetenz** → claim moment → **Dranbleiben** → Was du schon kannst → Sammlung → Details.
- **Kompetenz** = the headline chart: mastered words (or Can-Dos, via the small pill toggle) over
  time, with green dots marking the days a Can-Do was reached and a "Zuletzt erreicht" line. XP
  stays in Details: XP measures effort and dips in a quiet week, which reads as regression, while
  this curve only goes up. The card owns the DIRECTION only ("+16 Wörter diese Woche"); the
  absolute count belongs to the Vokabeln tile, so it is never printed twice.
- **Data comes from daily samples, not backfill.** FSRS keeps current card state only, so
  `useProgressStore.masteryHistory` (`{ [YYYY-MM-DD]: { w, c } }`) is sampled by `recordCompetence`
  from Analytics on view and from `lib/competence.ts` at session end. Never sample from eager code
  (it would pull a content bank into the main chunk). `canDoAchievedAt` stamps each milestone's
  first-seen day; milestones already achieved when sampling began carry `SEEDED_MILESTONE`, so a
  long-standing win is never drawn as "reached today". Under two samples the card shows the plain
  number plus "Die Kurve baut sich ab heute auf." Both fields are local-only for now, same as
  `missionsDone`/`keyItems` (the `progress` row has a fixed column set).
- **Dranbleiben** = Prüfung (only while `examDate` is still ahead: days-remaining ring over a
  90-day run-up, the date, the last simulation score, "Simulation starten" → `/exam`) + Diagnose +
  Nächste Quest (spans both columns when the Prüfung card is present).
- **Diagnose is writing-aware**: the weakness the AI flagged most often across the last 60
  evaluations, with its count, falling back to the weakest CEFR band / theme while the history
  loads or when nothing has been written. The duplicated writing-weakness panel that used to sit
  in Details is gone: one weakness ranking, one home.
