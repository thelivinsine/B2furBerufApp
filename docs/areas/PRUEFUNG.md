# Prüfung — the exam zone

Current state only. History → `docs/DECISIONS.md`, blow-by-blow → `docs/SESSION_PROMPT_LOG.md`.
Read this before touching `src/features/pruefung/`, `src/features/exam/`, `src/engine/exam.ts`,
`src/store/useExamStore.ts` or the `mockExams` collection. Sprechen has its own file
(`SPRECHEN.md`); Schreiben has `SCHREIBEN.md`.

## The shape

**ONE page at `/anwenden`, with a switcher as its header** (founder s189). No HubHero, no `h1`.

| Tab | What it is |
|---|---|
| **Module üben** | the four exam modules as four identical cards, then a Stärkeprofil Verlauf |
| **Modelltest** | the complete run as a ticket band, then a Verlauf led by the last score |

Both tabs live in the same `max-w-4xl` centred column, so switching never changes the page's
width. Neither scrolls at rest: the page is `h-page-stage` and the elastic regions give up their
room. What may grow is a Verlauf, and only when the learner opens it (`useStagePanel`).

**Mit Zeit / Ohne Zeit is one switch beside the Niveau**, resting on Ohne Zeit, and it is the only
way into the free trainers: `/writing` and `/simulation` are what the SAME four modules do without
a clock, never a fifth block. **The exam FRAME is Mit Zeit's alone** (founder s192): Ohne Zeit
skips the Anleitung and opens the drill. Only the STAGE is shared.

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

## Files

| File | What it holds |
|---|---|
| `features/pruefung/PruefungHub.tsx` | the one page: switchers, module grid, run band, both Verläufe |
| `engine/exam.ts` | the composer, the pools, availability, scoring, `EXAM_BAND` |
| `store/useExamStore.ts` | the one running exam, persisted; the deadline clock |
| `features/exam/MockExamRunner.tsx` | the flow shell, Anleitung, RunBar, Ergebnis, answer review |
| `features/exam/McParts.tsx` | Lesen + Hören: the split shell, the answer strip, the audio guards |
| `features/exam/SchreibenPart.tsx` | Teil Schreiben against the writing evaluator |
| `features/exam/SprechenPart.tsx` | Teil Sprechen over `ConversationRunner` (see `SPRECHEN.md`) |
| `features/exam/partMeta.ts` | the four modules' marks, colours and Anleitung copy |
| `store/useProgressStore.ts` | `mockExams`, `isFullMockRun`, the retired `examsDone` |
| `tests/exam.test.ts` · `tests/pruefungHub.test.ts` | the composer and the run/practice split |
