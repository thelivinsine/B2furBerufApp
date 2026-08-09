# Prüfung — the exam zone

**Interface language (s205):** every chrome string on this surface goes through `useT()`; A2/B1 read it in English, B2/C1 in German, and the learning material stays German at every level. Rule + mechanism: `docs/areas/UI-LANGUAGE.md`.

Current state only. History → `docs/DECISIONS.md`, blow-by-blow → `docs/SESSION_PROMPT_LOG.md`.
Read this before touching `src/features/pruefung/`, `src/features/exam/`, `src/engine/exam.ts`,
`src/store/useExamStore.ts` or the `mockExams` collection. Sprechen has its own file
(`SPRECHEN.md`); Schreiben has `SCHREIBEN.md`.

## The shape

**ONE page at `/anwenden`.** The switcher IS the page header, at EVERY width (founder s189, and
founder pick C in s197: no HubHero, no in-page `h1`, no page title anywhere), with the scope row
(Ohne Zeit/Mit Zeit + Niveau) centred under it. The **AppShell header's greeting slot stays empty**
on this route, which is the part of s196 that survives: the founder had asked for the
"Guten Morgen …" space to carry a big page title instead.

**Why the s196 header title is gone.** It read "aligned to left vertically with the toggle buttons"
as the APP header's left gutter, which is a different left edge from every control it was meant to
line up with, and the page underneath it kept three separately centred widths (a `max-w-4xl` panel
column holding a `max-w-[30rem]` module grid holding a `max-w-[26rem]` Stärkeprofil). Nothing shared
an edge with anything. `features/pruefung/hubSwitcher.tsx` still holds the switcher, the `Tab` type
and `usePruefungTab` (a `?tab=` reader/writer); the hub is its only caller again, and the split
stands so that a future header copy can import THAT file and never `PruefungHub.tsx`, which pulls in
`engine/exam` and the content banks behind it (the keep-eager-code-light invariant would break the
moment AppShell — mounted on every route — imported a content bank).

| Tab | What it is |
|---|---|
| **Module üben** | the four exam modules as four identical cards, then a Stärkeprofil Verlauf |
| **Modelltest** | the complete run as a ticket band, then a Verlauf led by the last score |

Both tabs live in the same centred column, `HUB_COL` = **`max-w-[40rem]`** (founder pick "medium",
s197), so switching never changes the page's width. Neither scrolls at rest: the page is `h-pruefung-stage`, which — unlike the shared
`h-page-stage` other trainers use — keeps a real height ceiling from `lg` up too, not just below
it (s196: a taller Verlauf card had made the hub scroll on real laptop heights, ~750-800px usable
under browser chrome, because `h-page-stage` goes `auto` on desktop on the assumption there is
"no shortage of room"). The elastic regions give up their room; what may grow is a Verlauf, and
only when the learner opens it (`useStagePanel`).

**The module cards fill the column; the COLUMN is what was narrowed** (s197). s196 answered "the
tiles look empty" by capping the GRID at `max-w-[30rem]` inside a `max-w-4xl` column, which is what
left a narrow tile island floating over a full-width Verlauf card. `HUB_COL` is picked from the
tiles instead, so they keep that shape with no cap of their own and every block on the page shares
one left and one right edge. Same for the Stärkeprofil grid, which had its own `max-w-[26rem]`.
Their top row is
icon-left (its size sets the row's height either way, so switching Mit Zeit/Ohne Zeit never moves
a card edge on its own) with the **minutes badge beside it** when timed, and the **arrow lives in
the card's bottom-right corner** (founder: swap their positions from the s191/s192 shape, where
the arrow sat top-right and the badge bottom-right). **There is NO description line on a module
card** (founder s191): the title carries the module, and a sentence under it is what the minutes
badge used to sit on top of. The whole anatomy is locked; change it only on a founder request.

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
  **Aufgabe** toggle. Since s201 that toggle sits at the right end of the chooser's own TOOLBAR row,
  not in the module row (founder: "the header bar shouldn't have the aufgabe button, place it
  somewhere else"): the module row names the module and carries nothing else, and the toggle sits
  level with the count it changes, directly above the panel it opens. `ModulePage` is the same frame
  minus the rail, for the Verlauf tab, so switching tabs moves no edge sideways.
- **The toolbar row** is part of the frame, not of each module: count badge left (plus a
  desktop-only "<Modul> üben" eyebrow, which a phone does not need because the module row is two
  lines up), then **Aufgabe** and **Zufällige Auswahl**, both 32px, `rounded-lg`, 13px, the geometry
  the Schreiben toggle wears. The draw is HIDDEN, never disabled, while the scope serves nothing.
- **The cards** are `features/pruefung/ChooserCard.tsx`, one anatomy for all three lists: module
  mark, title, one grey context line, chevron; the task line where a module has one (Sprechen,
  clamped to two lines); then a foot row pinned to the bottom edge (`mt-auto`, so neighbours line
  up) with Niveau first, the facts next and a state chip ("Empfohlen"/"Erledigt") last. Before s201
  Sprechen put the Niveau in the head, rendered a `div onClick` a keyboard could not reach, nested a
  "Starten" button inside its own click target and wore a `shadow-glow` (a landmine since s136).
- **The switcher** is `features/pruefung/ModuleTabs.tsx` (Üben | Verlauf), the app's sliding-pill
  mechanism, on every module page and always the SECOND row, under the module row.
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
- **The drill RUNS on the chooser's route** (s201). Until then `/lesen` and `/hoeren` only wrote the
  run into `useExamStore` and the Prüfung hub was the only screen that rendered one, so every card
  and the random draw did visibly nothing: both pages were dead. `TextModuleHub` now returns
  `<MockExamRunner />` while a run exists (the hub's own pattern), `AppShell` lists the two routes in
  `ZONE_ROUTES` and `STAGE_ROUTES`, and the chooser's `zoneExit` registration steps aside while the
  runner owns the exit (it only clears an exit that is still its own, because the runner registers in
  a layout effect and this cleanup runs after it). Finishing or leaving a drill lands back on the
  list it was picked from.
- **A picked id reaches the run** through `MockExamPicks` (`composeMockExam(level, parts, picks)`),
  filtered against the bank so a stale deep link cannot compose a run over a text that is gone.
- Niveau on a chooser is the RAIL's, which is the zone's one-Niveau-control rule applied per
  screen; the hub's `LevelSelect` hands its band over as `?level=` and the chooser honours it.

## One frame for the whole zone (founder s195)

The zone had four different back buttons in three positions, two screens with none at all, and
five content widths. One law now covers all eight screens.

- **ONE exit, top right, always.** `useSessionStore.zoneExit` holds `{ run, tone }`; `AppShell`
  renders it as the LAST control in the header on `/anwenden`, `/exam`, `/writing`, `/simulation`,
  `/lesen` and `/hoeren` (`ZONE_ROUTES`), and nowhere else. `tone: "danger"` is the red
  **Verlassen** while a clock is running; `tone: "quiet"` is the grey **Zurück** everywhere else,
  trainers included. It is a callback because the exam owns its confirm and because `AppShell` may
  not import `useExamStore` (the keep-eager-code-light invariant). `examStage` is a SEPARATE flag:
  it strips the sidebar and the bottom bar, and only a run sets it.
- **Where the exit shows, it is the only control on that side** (founder s201: "get rid of the
  streak and account settings wherever the exit or back button is shown"). `quietHeader = exam ||
  !!exit` in `AppShell` hides the streak pill and the `AccountMenu`, which a running Teil had
  hidden since s186 while the trainers and choosers kept them, so the same corner carried three
  controls on one screen of the zone and one on the next. Both are one tap away on every screen
  outside the zone, and the account also lives in Einstellungen, so nothing became unreachable.
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
- **One width at rest:** `max-w-4xl` across the zone, the Sprechtrainer list included; the HUB
  itself is narrower since s197 (`HUB_COL`, `max-w-[40rem]`), because its column is measured from
  the module tiles. The wide `lg:max-w-6xl`
  stage is a RUNNING Teil's alone, and the two screens that sat 448px wide inside it are
  compositions for that width now: the Anleitung is a two-column ticket and the Ergebnis puts the
  score and the bars beside what to do next.
- **The Verlauf card is on the page from the first visit** (founder pick 2). Empty it shows the
  shape of what is coming and takes the room the tab has left, because both tabs hold a
  one-viewport frame whose lower half was otherwise blank until a learner had history. **Its
  Stärkeprofil columns are HALF height while empty** (`h-6 sm:h-8` against `h-10 sm:h-16`, s197):
  at full height, four grey slabs at "–" read as a chart that failed to render rather than as a
  promise, and the caption is one line.

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
- **Every module page carries a Verlauf tab** (founder s201: "either keep verlauf in every module or
  remove it from all of the individual modules and just in the prüfung hub page ... go with verlauf
  on all four"). Schreiben's and Sprechen's are corrections and transcripts, which nothing else in
  the app renders; Lesen's and Hören's list that module's OWN sittings (`moduleRuns`) led by the
  same "last score + delta + bars" composition the Modelltest Verlauf uses (founder pick V2), with
  the Niveau on each row instead of the module name, which the page already says. The hub keeps the
  cross-module views only: full runs, and the four-column profile.
- **The Verlauf card itself is `features/pruefung/verlauf.tsx`**, extracted from the hub in s201 the
  moment a second page needed it (`VerlaufCard`, `ScoreChart`, `NoScoreYet`, `DeltaChip`,
  `ModuleVerlaufCard`). A chooser must NOT import `PruefungHub` for it: the hub pulls
  `mockExamAvailability` and, behind it, the writing-prompt bank into the chooser's chunk.
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
- **If `AppShell` ever needs the switcher again it imports `hubSwitcher.tsx`, never
  `PruefungHub.tsx`.** The hub pulls in `engine/exam` and, behind it, the text/dialogue/writing
  content banks; AppShell is mounted on every route, so a static import of the hub there would drag
  those banks into the eager bundle for every page in the app, not just this one. (It imports
  neither today, since s197 took the header copy back out.)
- **One column, one width.** Anything added to the hub takes `HUB_COL`; a block with its own
  `max-w-*` is how the page ended up with four different left edges in s196.

## Files

| File | What it holds |
|---|---|
| `features/pruefung/PruefungHub.tsx` | the one page: `HUB_COL`, switcher, scope row, module grid, run band, both Verläufe |
| `features/pruefung/hubSwitcher.tsx` | the Tab switcher + `usePruefungTab`; imported by `PruefungHub` alone since s197, and kept free of content-bank deps so a header copy stays possible |
| `features/pruefung/ModulePicker.tsx` | the chooser frame all four Ohne-Zeit modules share: module row, switcher slot, toolbar row, rail grid (`ModulePage` = the same frame without the rail) |
| `features/pruefung/ChooserCard.tsx` | the ONE card + grid the three list choosers use |
| `features/pruefung/ModuleTabs.tsx` | the Üben/Verlauf sliding-pill switcher every module page wears |
| `features/pruefung/verlauf.tsx` | the shared Verlauf card, chart and per-module history (`moduleRuns`) |
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
