# Prüfung — the exam zone

Current state only. History → `docs/DECISIONS.md`, blow-by-blow → `docs/SESSION_PROMPT_LOG.md`.
Read this before touching `src/features/pruefung/`, `src/features/exam/`, `src/engine/exam.ts`,
`src/store/useExamStore.ts` or the `mockExams` collection. Sprechen has its own file
(`SPRECHEN.md`); Schreiben has `SCHREIBEN.md`.

## The shape

**ONE page at `/anwenden`.** Below `lg` the switcher IS the page header (founder s189: no
HubHero, no in-page `h1`). From `lg` up (founder, s196) the switcher moved into the **AppShell
header** beside a big left-aligned **"Prüfung"** title, in the space every other route's generic
greeting ("Guten Morgen …") occupies; the page body then opens straight on the scope row
(Ohne Zeit/Mit Zeit + Niveau). `features/pruefung/hubSwitcher.tsx` holds the switcher, the `Tab`
type and `usePruefungTab` (a `?tab=` reader/writer) so both copies drive the SAME URL param and
never disagree; `AppShell` imports ONLY that tiny file, never `PruefungHub.tsx` itself, which
pulls in `engine/exam` and the content banks behind it (the keep-eager-code-light invariant would
break the moment AppShell — mounted on every route — imported a content bank).

| Tab | What it is |
|---|---|
| **Module üben** | the four exam modules as four identical cards, then a Stärkeprofil Verlauf |
| **Modelltest** | the complete run as a ticket band, then a Verlauf led by the last score |

Both tabs live in the same `max-w-4xl` centred column, so switching never changes the page's
width. Neither scrolls at rest: the page is `h-pruefung-stage`, which — unlike the shared
`h-page-stage` other trainers use — keeps a real height ceiling from `lg` up too, not just below
it (s196: a taller Verlauf card had made the hub scroll on real laptop heights, ~750-800px usable
under browser chrome, because `h-page-stage` goes `auto` on desktop on the assumption there is
"no shortage of room"). The elastic regions give up their room; what may grow is a Verlauf, and
only when the learner opens it (`useStagePanel`).

**The module cards are capped narrower than the column** (s196, founder: they "look empty"), so
each of the four reads closer to square instead of a wide, half-empty strip. Their top row is
icon-left (its size sets the row's height either way, so switching Mit Zeit/Ohne Zeit never moves
a card edge on its own) with the **minutes badge beside it** when timed, and the **arrow lives in
the card's bottom-right corner** (founder: swap their positions from the s191/s192 shape, where
the arrow sat top-right and the badge bottom-right).

**Mit Zeit / Ohne Zeit is one switch beside the Niveau**, resting on Ohne Zeit, and it is the only
way into the four choosers: `/lesen`, `/hoeren`, `/writing` and `/simulation` are what the SAME
four modules do without a clock, never a fifth block. **The exam FRAME is Mit Zeit's alone**
(founder s192): Ohne Zeit skips the Anleitung and opens the module's own page. Only the STAGE is
shared.

## The four Ohne-Zeit choosers (founder s196)

Founder s196, on the Sprechen list: "it should somehow look like Schreiben with a filter rail like
Schreiben's Aufgabe wählen tile. Same should apply for Lesen and Hören." So all four now wear ONE
frame and ONE rail.

- **The frame** is `features/pruefung/ModulePicker.tsx`: Schreiben's desktop grid (content column
  plus a sticky 16rem rail) and, on a phone, the same rail as a collapsible panel behind an
  **Aufgabe** toggle that rides in the module row the zone already carries (`ModuleHeader`), so the
  picker costs a phone no extra row.
- **The rail** is `features/shared/ScopeRail.tsx`, lifted out of `WritingRail` unchanged: the
  Himmelblau tile with no visible edge, the uppercase section eyebrows, the Bibliothek scope
  dropdowns with honest zero-yield counts, the always-active reset. Anything visual lives there
  now, so a change reaches all four modules at once.
- **Lesen and Hören** used to compose a random drill and open it directly, so the clock was their
  only difference from Mit Zeit and no text could be chosen. `/lesen` and `/hoeren` list what the
  scope serves (Niveau, Branche, Lebensbereich, Thema, Unterthema, Textsorte) and start the picked
  text as a single-text untimed run through the SAME `LesenPart`/`HoerenPart`, scored the same way
  and recorded in the same Module-üben Verlauf. The old behaviour survives as **Zufällige
  Auswahl**, which draws the module's full exam-shaped set from the current scope.
- **A picked id reaches the run** through `MockExamPicks` (`composeMockExam(level, parts, picks)`),
  filtered against the bank so a stale deep link cannot compose a run over a text that is gone.
- Niveau on a chooser is the RAIL's, which is the zone's one-Niveau-control rule applied per
  screen; the hub's `LevelSelect` hands its band over as `?level=` and the chooser honours it.

## One frame for the whole zone (founder s195)

The zone had four different back buttons in three positions, two screens with none at all, and
five content widths. One law now covers all eight screens.

- **ONE exit, top right, always.** `useSessionStore.zoneExit` holds `{ run, tone }`; `AppShell`
  renders it as the LAST control in the header on `/anwenden`, `/exam`, `/writing` and
  `/simulation`, and nowhere else. `tone: "danger"` is the red **Verlassen** while a clock is
  running; `tone: "quiet"` is the grey **Zurück** everywhere else, trainers included. It is a
  callback because the exam owns its confirm and because `AppShell` may not import `useExamStore`
  (the keep-eager-code-light invariant). `examStage` is a SEPARATE flag: it strips the sidebar,
  the bottom bar and the streak, and only a run sets it.
- **The confirm is about losing work, not about the clock.** `hasProgress(run)` decides: any
  answer, note, essay text, recorded part result, or having advanced past Teil 1. With nothing to
  lose the exit just leaves, timed or not; with something to lose it asks "Dein Fortschritt wird
  nicht gespeichert. Möchtest du wirklich zurück?". The Schreibtrainer never asks, because
  `draftAutosave` keeps its text (a warning there would be false); a started conversation always
  does, because it cannot be resumed.
- **The word Zurück belongs to that exit alone.** The previous-question control in Lesen/Hören is
  a chevron now: on a desktop the pair flanks the number strip (founder pick C) and the footer is
  ONE primary button; on a phone there is no room for that pair, so the back step stays in the
  footer as an icon beside the primary.
- **Mobile carries the module row on every screen** (`features/pruefung/ModuleHeader.tsx`, founder
  pick A). In a Teil that row IS the `RunBar`, which now wears the same `PART_META` mark. It holds
  no back button and is `lg:hidden`: on a desktop the room belongs to the task.
- **ONE Niveau control** (`features/pruefung/LevelSelect.tsx`), shared by the hub and the
  Sprechtrainer, which used a row of level pills before.
- **One width at rest:** `max-w-4xl`, the Sprechtrainer list included. The wide `lg:max-w-6xl`
  stage is a RUNNING Teil's alone, and the two screens that sat 448px wide inside it are
  compositions for that width now: the Anleitung is a two-column ticket and the Ergebnis puts the
  score and the bars beside what to do next.
- **The Verlauf card is on the page from the first visit** (founder pick 2). Empty it shows the
  shape of what is coming and takes the room the tab has left, because both tabs hold a
  one-viewport frame whose lower half was otherwise blank until a learner had history.

**The scope lives in the URL** (s194): `?tab=`, `?level=`, `?zeit=mit`. A reload, a share and the
browser's back button all land where the learner was, and the Niveau travels into a trainer with
them (`/writing?level=B2`).

## The run

`useExamStore` holds the ONE running exam, persisted. A run takes the `/anwenden` route over, so a
reload lands back inside it.

- **The clock is a deadline, not a counter** (s194). `beginPart` records `endsAt`; `tick` derives
  `remainingSec` from `Date.now()` and the runner also ticks on mount and on `visibilitychange`.
  A decrementing counter let a learner pause a timed exam by backgrounding the tab (throttled to
  ~1 tick/minute) or by reloading. A run persisted before s194 has no `endsAt` and falls back to
  the old decrement so it can still finish.
- **Sprechen carries no clock.** The dialogue keeps its own pace, so the timer pill is hidden and
  the interval skips it. **Its minutes come from `PART_MINUTES`, never from the drawn set's
  `totalMinutes`** (s194): the hub advertises the sum, so the parts have to agree with it.
- **A part can always be handed in.** "Teil abschließen" is on the last question unconditionally;
  leaving answers blank costs a confirm naming the count, never the ability to finish. Requiring
  every answer left an untimed drill with no completion path at all, and Ohne Zeit is where a
  learner lands.
- **A run is recorded exactly once**, keyed by its start timestamp, so a reload on the result
  screen cannot double-count. XP: `examComplete` for all four parts, `moduleComplete` for one.

## What a level can serve

`mockExamAvailability(level)` reports it, and the hub greys out what it cannot. It is computed
**once per mount for every level** (`useMemo`): it walks the text bank twice and runs
`eligibleTasks` over the whole writing bank, and it used to run on every render.

- **A2 is visible and unservable.** The Niveau list shows every level's honest count
  ("3/4 Module", "keine Inhalte"), so a dead level looks dead before it is picked.
- **Lesen never draws audio kinds**; Durchsagen and Mailbox-Texte belong to Hören.
- **Hören draws only the level's own band.** `LISTENING_TOPUP` still exists but no level needs it.
- **The Anleitung describes the DRAWN plan**, not the module in the abstract: a Hören with no
  Notizen sheet gets `instructionsPlain` instead of promising a note-taking task.

## The AI parts, and what they cost the learner

Teil Schreiben spends one of the day's Kurz (B1) or Lang (B2/C1) evaluations; Teil Sprechen spends
one of the day's conversations. **One Modelltest therefore takes half of each daily allowance**, so
the run band states it up front (`AiBudgetNote`) and warns when either is spent. It never blocks
the run: Lesen and Hören are unaffected, and a part that cannot be graded finishes without a number
rather than as a zero.

- **Schreiben's correction is shown**, in `features/writing/correction.tsx` like everywhere else
  (its fifth caller). The evaluator's `corrected` was captured and thrown away until s194, so the
  exam gave less feedback than the free trainer.
- **Sprechen is graded at the run's Niveau** (`EXAM_BAND[plan.level]` into `examBrief`), and a Teil
  is sat ONCE: no "Nochmal" in exam mode.
- **The exam RunBar frames every screen of a Teil**, the brief and the debrief included.

## Where a result is shown

**Once per page** (founder s188), and the two lists never mix:

- **A Modelltest is a run that sat all four parts; a run that sat one is module practice.** The
  rule is `isFullMockRun` in `useProgressStore` — bank-free on purpose, so Fortschritt can apply
  the same rule without pulling the content banks in behind it.
- Modelltest's Verlauf leads with the last score plus its delta; Module üben's is a Stärkeprofil
  (pale = first attempt, solid = the gain since).
- Fortschritt reads **`mockExams`**. `examsDone` is RETIRED: the branching runner that wrote it was
  replaced in s186, and Fortschritt kept reading it until s194, reporting "noch keine Simulation"
  forever. The field stays, and stays synced, because it is real pre-s186 history.

## Rules that are easy to break

- **Never derive a timer by decrementing.** See above.
- **Never let a part end only on the clock.** Ohne Zeit has no clock.
- **A percentage the app computes must be reachable by the learner.** Every score the exam
  produces has a home in a Verlauf, and every correction it produces is rendered.
- **`toPractices` returns one row per module a run sat**, not the first one it finds.
- **The counts the hub shows come from one place.** Adding a second availability computation is how
  the Niveau list and the module cards start disagreeing.
- **`AppShell` may import `hubSwitcher.tsx`, never `PruefungHub.tsx`.** The hub pulls in
  `engine/exam` and, behind it, the text/dialogue/writing content banks; AppShell is mounted on
  every route, so a static import of the hub there would drag those banks into the eager bundle
  for every page in the app, not just this one.

## Files

| File | What it holds |
|---|---|
| `features/pruefung/PruefungHub.tsx` | the one page: mobile switcher, scope row, module grid, run band, both Verläufe |
| `features/pruefung/hubSwitcher.tsx` | the Tab switcher + `usePruefungTab`; imported by `PruefungHub` AND by `AppShell`'s desktop header, so it may only carry light, route-agnostic deps |
| `features/pruefung/ModulePicker.tsx` | the chooser frame all four Ohne-Zeit modules share |
| `features/pruefung/TextModuleHub.tsx` | `/lesen` + `/hoeren`: the rail, the list, the single-text run |
| `features/shared/ScopeRail.tsx` | the ONE "Aufgabe wählen" rail + `ScopeSelect` |
| `lib/moduleScope.ts` | the choosers' scope selectors and counters |
| `engine/exam.ts` | the composer, the pools, availability, scoring, `EXAM_BAND` |
| `store/useExamStore.ts` | the one running exam, persisted; the deadline clock |
| `features/exam/MockExamRunner.tsx` | the flow shell, Anleitung, RunBar, Ergebnis, answer review |
| `features/exam/McParts.tsx` | Lesen + Hören: the split shell, the answer strip, the audio guards |
| `features/exam/SchreibenPart.tsx` | Teil Schreiben against the writing evaluator |
| `features/exam/SprechenPart.tsx` | Teil Sprechen over `ConversationRunner` (see `SPRECHEN.md`) |
| `features/exam/partMeta.ts` | the four modules' marks, colours and Anleitung copy |
| `store/useProgressStore.ts` | `mockExams`, `isFullMockRun`, the retired `examsDone` |
| `tests/exam.test.ts` · `tests/pruefungHub.test.ts` | the composer and the run/practice split |
| `tests/moduleScope.test.ts` | the choosers' filter law and the picked-content override |
