# Prüfung hub audit — 2026-08-05 (session 194)

Full audit of the Prüfung zone, front to back, at commit `c0befc4` (s193, "Sprechen: talk to an AI
partner"). Nothing in this report has been changed; it is a findings list.

**Scope.** `/anwenden` (the hub, both tabs), the Modelltest runner and its four Teile, the two free
trainers the hub feeds (`/writing`, `/simulation`), the engines behind them (`engine/exam.ts`,
`engine/speaking.ts`, `engine/conversation.ts`), the stores (`useExamStore`, the `mockExams`
collection in `useProgressStore`), the `converse` Edge Function and migration 0017, the nav/shell
integration, and how the zone's results surface on Fortschritt.

**Method.** Read every file in the zone; cross-checked the code against the founder laws in
`CLAUDE.md` and the area docs; measured the real content pools by running the composer against the
banks; ran the gates.

**Gate status (baseline, all green).** `typecheck` · `lint` 0 errors / 75 warnings (none in this
zone) · `test:unit` 592 passed · `build` · `check:bundle` 127.0 kB of a 400 kB budget.

---

## Verdict

The zone is well built and the recent sessions did real work: the s190 split of Modelltest runs from
module practice is correct, the s192 zone-aware nav is correct, the s193 speaking rebuild is a large
and genuine improvement, and the stage/height discipline holds. The problems are not architectural.
They are **seams** — places where a change landed on one side of a boundary and not the other.

Three patterns account for most of what follows:

1. **A retired feature left its readers behind.** The old branching exam runner stopped writing
   `examsDone`; Fortschritt still reads it, so the Prüfung card there is permanently blank (P2).
   The old self-assessment rubric is gone from the UI but the Anleitung still tells candidates they
   will grade themselves (P20), and the rubric data is still linter-required (P18).
2. **Ohne Zeit was bolted onto a flow built around a clock.** The clock used to be the thing that
   ended a part. Removing it removed the only exit from an incomplete MC part (P1) — and Ohne Zeit
   is the *resting* state of the hub.
3. **The server enforces what the client does not display.** The conversation turn ceiling, the
   daily allowances and the writing/speaking budgets are all correct server-side and invisible
   client-side, so the learner meets them as an unexplained failure mid-exam (P4, P8, P9).

Findings are ranked. Each carries file:line, why it matters, and the shape of a fix.

---

## Blocking

### P1 · An untimed Lesen or Hören module cannot be finished if one answer is left blank

`src/features/exam/McParts.tsx:298` — the submit button exists only when
`answeredCount === total && qIx === total - 1`. The only other completion path is
`useAutoFinish` (line 63), which is explicitly skipped for `run.untimed`.

So in Ohne Zeit — which is where a learner **lands** (founder s189) — skipping question 4 of 9 leaves
no way to finish the part. "Weiter" wraps around to question 1 forever. The only exit is the header
Zurück, which abandons the run and records nothing, so the work is lost.

The same defect exists in Mit Zeit, less severely: leave one blank and you must sit out the
remaining minutes to get a score.

**Fix.** Offer "Teil abschließen" on the last question regardless of completeness, with a confirm
naming the count ("3 Aufgaben unbeantwortet"). Untimed runs need it unconditionally.

### P2 · The Prüfung card on Fortschritt is permanently blank: nothing writes `examsDone` any more

`useProgressStore.completeExam` (`src/store/useProgressStore.ts:248`) has **zero callers** in `src/`.
The runner that called it was retired. Mock exams write `mockExams` instead
(`MockExamRunner.tsx:364`).

`src/features/analytics/Analytics.tsx` still reads `examsDone` in three places:

| Line | What the learner sees | What they will always see |
|---|---|---|
| 451, 617 | "letzte Simulation 74 %" | "noch keine Simulation" |
| 543 | "N Prüfungen" stat hint | "0 Prüfungen" |
| 929 | "Prüfungsverlauf" card | never renders |

A learner can sit ten Modelltests and Fortschritt will report zero. `cloudSync` still ships the empty
`exams_done` field both ways.

**Fix.** Point all three at `mockExams` (filtered to full runs, which `isFullRun` already defines),
then delete `completeExam` and retire `examsDone` from the sync payload.

### P3 · The exam clock is a tick counter, not a wall clock

`MockExamRunner.tsx:89-93` decrements `remainingSec` from a `setInterval(tick, 1000)`, and the value
is persisted as-is.

Two consequences, both on a *timed* exam:

- Browsers throttle background-tab timers to roughly one tick per minute. Switching tabs
  effectively pauses the exam.
- A reload resumes from the last persisted `remainingSec`, so closing the tab pauses it indefinitely.

**Fix.** Store an absolute deadline (`beginPart` records `Date.now() + durationSec * 1000`) and
derive the display from wall-clock time; keep the interval only to drive re-renders.

### P4 · The conversation turn ceiling is enforced only on the server, and the local transcript diverges from the graded one

`engine/conversation.ts` exports `canSpeak` and `MAX_LEARNER_TURNS`. **`ConversationRunner` uses
neither.** `TurnResult.turnsLeft` and `TurnResult.conversationOver` (`src/lib/speaking.ts:22-23`) are
typed on the client and never read.

`ConversationRunner.advance` (line 104) commits the learner's turn to local state *before* the
server round trip and leaves it there on failure (`failTurn`, line 113). Past 14 turns the server
refuses every turn (`converse/index.ts:550`), but the microphone stays enabled, so the learner keeps
speaking into a transcript that the debrief — which reads the **stored** row — has never seen.

The same divergence happens on any network failure: the bubble is on screen, the turn is not in the
record.

**Fix.** Gate the mic on `canSpeak(state)` and on `conversationOver`; show `turnsLeft` when it gets
low; roll the local turn back when the round trip fails.

### P5 · Teil Sprechen of the Modelltest offers "Nochmal", so a candidate can re-sit it until the score is good

`ConversationRunner.tsx:194` renders the retry button in every mode; `ConversationDebrief` has no
`exam` branch. Retry mints a fresh `conversationId`, so the exam part restarts from the brief and the
first score is discarded — and each retry also spends one of the learner's **2 daily conversations**.

**Fix.** Hide "Nochmal" when `brief.exam` is true.

### P6 · Every Modelltest Sprechen part is briefed and graded at B2.1, whatever Niveau was chosen

`src/engine/speaking.ts:106` — `examBrief` hardcodes `level: "B2.1"`. That string travels to the
server (`lib/speaking.ts:61`) and lands in **both** prompts:

- the partner's: "Sprich einfaches, natürliches Deutsch auf B2.1-Niveau" (`converse:142`)
- the grader's: "deine Prüfungsbewertung des Gesprächs auf B2.1-Niveau" (`converse:200`)

A B1 Modelltest's speaking part is therefore pitched and scored one band too high, and a C1 one a
band too low, while Lesen, Hören and Schreiben all honour the chosen level. `composeMockExam` already
knows the level; it just never reaches the brief.

**Fix.** Thread the run's level into `examBrief` (map `B1 → B1.2`, `B2 → B2.1`, `C1 → C1`, the same
shape `LEVEL_BY_DIFFICULTY` already uses).

---

## Serious

### P7 · The exam's Schreiben correction is computed, stored, and never shown

`SchreibenPart.tsx:69-74` puts `weakness`, `insight` **and `corrected`** on the part result.
`MockExamRunner.ReviewList` (line 537) renders only `insight`. `MockPartResult.corrected` has no
reader anywhere in the app.

So the Modelltest gives strictly *less* feedback than the free Schreibtrainer, whose correction card
is the whole point of the feature. s193 made the shared correction card speaking's fourth caller;
the exam's writing never became one, even though it has both sides of the diff (`run.essay` and
`corrected`) sitting in memory on the result screen.

**Fix.** Render `features/writing/correction.tsx` in the review list from `run.essay` + `corrected`.
It is the fifth caller, not a fifth copy.

### P8 · The brief card's allowance-aware disabled state is dead code

`ConversationBriefCard` declares `starting` and `disabledReason` (lines 31-38). Its only caller,
`ConversationRunner` (line 167), passes neither. The card already reads
`useDailyAllowance("sprechen")` and prints "Heute noch N von 2".

With 0 conversations left the button is fully enabled. The learner taps "Gespräch starten", the
partner never speaks, and the failure appears as a small grey caption under the microphone. In the
Modelltest that happens at Teil 4 of 4, after 45 minutes of work.

**Fix.** Pass `disabledReason` when `allowance.known && allowance.remaining === 0`, and `starting`
while the opening turn is in flight.

### P9 · A Modelltest silently spends half the learner's daily AI budget, and nothing warns them

- Teil Schreiben calls `evaluate-writing`, which counts one of **2 daily Lang** evaluations for
  B2/C1 (`evaluate-writing/index.ts:614-631`).
- Teil Sprechen calls `converse`, which counts one of **2 daily conversations**
  (`converse/index.ts:475`).

One full Modelltest therefore consumes half of each. Nothing on the run band, the Anleitung or the
module cards mentions this. A learner who wrote twice earlier gets an unscored Schreiben mid-exam;
the degradation is at least honest on the result screen ("Schreiben konnte diesmal nicht benotet
werden"), but by then the exam is over.

**Fix.** Show both allowances on the Modelltest run band, and warn before starting when either is 0.

### P10 · The Sprechtrainer has no way back to the Prüfung hub

s192 gave the Schreibtrainer `BackToPruefung` (`features/writing/bottomChrome.tsx:32`), used by both
writing trainers, on the founder's explicit instruction. `/simulation` (`SprechenHub.tsx`) has no
equivalent, and once a conversation is running there is no in-page exit at all until the debrief —
only the bottom nav.

The two trainers are supposed to be the same four modules without a clock. They should leave the
same way.

### P11 · The Niveau chosen in the hub is dropped when Ohne Zeit opens a trainer

`PruefungHub.openModule` (line 141) navigates to `/writing` and `/simulation` with no query params.
`WritingHub` already reads a `level` URL param (`WritingHub.tsx:53`); `SprechenHub` has no level
filter at all.

Pick B1, tap Schreiben, and you get whatever Niveau the trainer was last left on. The founder law is
that the clock is the *only* difference between practising a module and sitting it.

**Fix.** Pass `?level=` into `/writing`; give `/simulation` a level scope and pass it too.

### P12 · The Hören part can consume both plays and produce silence, with no fallback

`McParts.tsx:476-480` calls `registerPlay(text.id)` **before** `speak(...)`, and `speak`
(`engine/speech.ts`) returns silently when TTS is unsupported and falls back to a non-German voice
when no German one is installed.

Three failure modes:

- No TTS → both plays consumed, nothing heard, part scored 0, no explanation given.
- Double-tap on the play button → both plays gone instantly, because `speak` opens with
  `synth.cancel()` and the button is never disabled while playing.
- Moving to the next Ansage's questions does not stop the previous one; only unmount calls
  `stopSpeaking`.

**Fix.** Check `ttsSupported()` plus a German voice before arming the part (grey the module out with
an honest reason otherwise); count a play on successful start, not on click; disable the button
while speaking; stop playback when the active text changes.

### P13 · Speech recognition auto-ending discards what the learner already said

`useSpeechInput.start` (lines 63-68) resets `finals` and `finalsRef` unconditionally.

Recognition ends by itself after a silence, and mobile Chrome frequently ignores `continuous: true`
and ends after each utterance. `onEnd` sets `listening` false, so the cluster's button flips back to
"Sprechen" — and pressing it wipes the transcript instead of resuming it. The learner watches their
sentence disappear.

**Fix.** On `onEnd` while an utterance is still open, either auto-restart the recogniser or keep the
finals so the next `start()` appends rather than resets.

### P14 · Learner speech transcripts are missing from the GDPR data export

`src/lib/dataExport.ts:32-55` exports `profiles`, `progress`, `writing_evaluations`,
`sentence_checks` and `sentence_ai_ops`. It does **not** export `speaking_conversations`, which
holds the transcript, the AI's correction of it, the goals met and the exam score, and which carries
a select-own RLS policy precisely so a learner can read it.

Erasure is fine (the FK cascades on user delete) and the retention timer and privacy copy shipped
together in 0017. Only the Art. 15/20 access right is short. The file's own comment justifying the
inclusion of `sentence_checks` — "this is their own writing and belongs in an Art. 15/20 export just
as much as the long texts do" — applies word for word.

**Fix.** Add a fifth query to `buildExport`.

---

## Content and composition

### P15 · Durchsagen are served as Lesen texts

`engine/exam.ts:103-107` — `readingPool` excludes only `voicemail`, so every `announcement` is
eligible as a reading text, and `McParts.kindLabel` duly prints "Durchsage" on the reading card.

Measured against the bank:

| Level | Reading pool today | Of which Durchsagen |
|---|---|---|
| B1 | 12 | 3 (25%) |
| B2 | 26 | 10 (38%) |
| C1 | 6 | 1 (17%) |

A B2 Lesen part draws 3 texts from a pool where more than a third are listening material presented
silently. That is a different exercise from the one the module claims to be.

**Fix.** Exclude `AUDIO_KINDS` from `readingPool`. The pools stay servable: B1 → 9, B2 → 16, C1 → 5,
all comfortably above `READING_COUNT` (3).

### P16 · A C1 Hören is mostly B2.2, and can never include the Notizen task the Anleitung promises

Measured availability: `B1 { lesen 12, hoeren 5, schreiben 231, sprechen 8 }` ·
`B2 { 26, 14, 203, 5 }` · `C1 { 6, 3, 80, 2 }` · `A2 { 0, 0, 0, 0 }`.

C1's listening pool is 1 C1 announcement plus 2 B2.2 announcements (via the documented
`LISTENING_TOPUP`), so two of the three candidates are a band low and a C1 Hören is likely to be
entirely B2.2.

Separately: **only voicemails carry `notes`** (5 fields each); all 20 announcements carry none. C1's
pool contains no voicemails at all, so the Hören Anleitung's "Notieren Sie beim Hören die wichtigen
Angaben" (`partMeta.ts:64`) describes a task that can never appear at C1 — and appears only sometimes
at B1/B2.

**Fix (content).** Author C1 audio texts, and `notes` on announcements. Until then, condition the
Anleitung line on whether the drawn plan actually has a notes field.

### P17 · No Alltag speaking task exists above scenario level 1

All five Alltag exam sets — `ex_behoerde`, `ex_arzt`, `ex_wohnen`, `ex_bank`, `ex_bildung` — map to
level-1 scenarios. Every level-2 set (`ex_reklamation`, `ex_projektplanung`, `ex_homeoffice`,
`ex_sicherheit`, `ex_lieferproblem`) and both level-3 sets (`ex_nachhaltigkeit`, `ex_konflikt`) are
workplace tasks.

`SPEAKING_LEVEL` maps B2 → 2 and C1 → 3, so **a B2 or C1 Modelltest can only ever serve a Beruf
speaking task.** That contradicts the scope note at the top of `CLAUDE.md`: daily-life domains are
core, not optional.

**Fix (content).** Author level-2 and level-3 Alltag exam sets (Arzt, Behörde, Wohnen at B2 shape).

### P18 · `ExamSet.rubric` is dead content that a gate still requires

The five-criterion `sharedRubric` is authored on all 15 exam sets and required by
`scripts/lint-content.mjs:678`, but nothing has rendered it since s193 removed the self-assessment
checkboxes. Same category:

- `PART_META.desc` — removed from the cards in s191, still typed and authored.
- `engine/speaking.showsTextWhileSpeaking` — exported, never called (`AnrufStage` hardcodes it).
- `useProgressStore.completeExam` — see P2.

### P19 · The whole Prüfung zone awards almost no XP

- `MockExamRunner.tsx:373` awards `XP.examComplete` (120) **only when `parts.length > 1`**. A single
  module sitting — the everyday act, per founder s189 — awards **0 XP**, though it does call
  `registerSession()`, so it counts for the streak.
- `XP.scenarioComplete` (60) is defined in `engine/scoring.ts` and **never awarded anywhere**.
  `SprechenHub.onFinished` (line 45) calls `completeScenario` + `registerSession` and no `addXp`. A
  full AI conversation with a graded debrief is worth zero.

For scale: one flashcard is 6 XP; a reading check inside a Session is 8. The most demanding work in
the app pays nothing.

---

## Consistency and copy

### P20 · The Sprechen Anleitung still tells the candidate they will grade themselves

`partMeta.ts:87`: *"Am Ende bewerten Sie sich selbst anhand des Prüfungsrasters."*

s193 replaced self-assessment with an AI-graded debrief — that was the headline of the session. This
is the screen a candidate reads immediately before Teil Sprechen.

### P21 · "Noch 1 Tage bis zum …"

`PruefungHub.ExamCountdown:684` has no singular case. `Analytics.tsx:529` gets the same sentence
right.

### P22 · The zone is called three different things

| Where | Word used |
|---|---|
| Nav, hub header | **Prüfung** ✓ |
| `SprechenHub` HubHero (line 60) | eyebrow "Anwenden", title "Sprechen" |
| `Analytics.tsx:617, 630` | "letzte Simulation", "Simulation starten" |
| `recommend.ts:69` | "Sprechsimulation starten" |

"Anwenden" was renamed to Prüfung in s182; "Prüfungssimulation" became "Modelltest" in s186. Also
note that `SprechenHub` carries a `HubHero` at all, which the s189 law for this zone forbids
("No HubHero, no `h1`").

### P23 · A2 is an option that can never do anything, with no honest count

`HUB_LEVELS` includes A2; `mockExamAvailability("A2")` hard-codes zeros. In the Niveau dropdown A2
looks identical to B1/B2/C1 — no grey-out, no count. Selecting it kills the entire page.

This is the direct opposite of the founder law: *"zero-yield options grey out with their honest
count."* Related: the module cards never show counts at all, only "Noch keine Inhalte" — so the
learner is never told how much content is behind a module.

### P24 · The Modelltest's Sprechen minutes disagree with themselves

The hub card, `PartTrack`, `PartLadder` and `TOTAL_MINUTES` all use `PART_MINUTES.sprechen = 7`, so
the band advertises **52 Min gesamt**. The Anleitung and the armed clock use `examSet.totalMinutes`
(`MockExamRunner.tsx:272`), which is **6 for 11 of the 15 sets**. The exam is usually 51 minutes,
not 52.

### P25 · The exam RunBar disappears during Teil Sprechen's brief and debrief

`SprechenPart` passes `header` to `ConversationRunner`, which renders it **only** in the running
branch (line 217). The brief screen (line 167) and the debrief (line 191) drop it, so "Teil 4 von 4"
and the progress dots vanish on two of the three screens of that Teil.

That brief screen is also a second copy of the Anleitung the learner just read: `PartIntro` already
showed the same `taskSheet` and the same `aspects` (`MockExamRunner.tsx:309-318`). Two consecutive
full-screen gates saying the same thing, against the no-redundancy law.

### P26 · Hub state that should survive a reload does not

`tab` lives in the URL (`?tab=modelltest`); **`level` and the clock mode are component state**. A
reload resets Niveau to the settings level and the clock to Ohne Zeit, and neither is shareable.

Related: because the runner takes `/anwenden` over without changing the URL, the Android back button
during a running exam leaves the zone without the exit confirm. The run is persisted, so nothing is
lost — but the confirm is bypassable, which is the one thing it exists to prevent.

---

## Accessibility

### P27 · The tab switcher announces itself as a tablist it cannot behave like

`PruefungHub.TabSwitcher` (line 254) sets `role="tablist"`, `role="tab"` and `aria-selected`, but
there is no `role="tabpanel"`, no `aria-controls`/`id` pairing, and no roving `tabIndex` with
arrow-key handling. A screen-reader user is told there are two tabs and then cannot operate them the
way the announcement promises.

Smaller ones in the same file:

- `LevelSelect` (line 360): `role="listbox"` / `role="option"` with no arrow keys, no
  `aria-activedescendant`, and no focus return to the trigger on close.
- `VerlaufCard`'s expander (line 772): `aria-expanded` with no `aria-controls`.
- `ScoreChart` (line 884) and `RunRow`'s four segment tracks (line 955) have no text alternative;
  the chart's only accessible content is the caption "bestanden ab 60 %".

---

## Performance

### P28 · Opening the hub pulls ~825 kB of content banks and re-scans them on every render

`PruefungHub` is a 52.6 kB chunk, but it statically imports `engine/exam`, which imports:

| Bank | Built size |
|---|---|
| `texts` | 174.8 kB |
| `dialogues` + `examSets` | 189.2 kB |
| `writingPrompts` (via `writingScope`) | 330.8 kB |
| `redemittel` (via `ConversationRunner`) | 78.5 kB |

All of it loads to render four cards, a run band and a Verlauf.

Worse: `const avail = mockExamAvailability(level)` (`PruefungHub.tsx:117`) is **not memoised**. Every
render — tab switch, clock switch, Verlauf toggle, level change — walks the text bank twice and runs
`eligibleTasks` across all ~30 themes of the 717-task writing bank.

**Fix.** `useMemo` on `level` is the one-line half. The real fix is to precompute the availability
counts at build time, the way `frequency.ts` and `verification.ts` already are, so the hub needs no
bank at all until a run actually starts.

---

## Minor and latent

- **P29 · `cost_estimate` is overwritten per turn, not accumulated.** `converse:584` sets
  `cost_estimate: out.cost` on each turn update, and the debrief update (line 665) omits it
  entirely, so a conversation row reports the cost of one turn. The global spend fuse is unaffected
  (`bump_ai_usage` accumulates correctly); only per-conversation reporting is wrong.
- **P30 · A conversation whose first turn fails still burns a daily conversation.** The row is
  inserted before the model call (`converse:502`); if the cascade returns null (line 568) the row
  survives. With `DAILY_LIMIT = 2`, one transient upstream failure costs half the day's speaking.
- **P31 · An extra `count(*)` per turn.** `converse:528-538` re-counts the day's conversations on
  every turn to report `dailyRemaining`, which cannot change mid-conversation. Compute it once.
- **P32 · `toPractice` silently drops parts from a 2-3 part run.** `PruefungHub.tsx:89` returns the
  first matching part only. No UI creates such a run today (the hub starts 1 or 4), so this is
  latent — but a "practise Lesen + Hören" would lose a score.
- **P33 · `examBrief` truncates aspects to 5 with no gate.** `engine/speaking.ts:104`. Scenarios are
  linted to ≤5 goals; exam sets are only checked non-empty (`lintExamSets`). All 15 sets have 4
  today, so nothing truncates — but a 6-aspect set would show 6 on the Anleitung and be graded on 5.
- **P34 · Utterances are clipped to 800 characters server-side** (`converse:79, 543`) while the
  client thread shows the full text. The stored and graded transcripts diverge silently. Rare in
  speech, but silent.
- **P35 · There is no `docs/areas/PRUEFUNG.md`.** Every other major zone has one and `CLAUDE.md`
  tells the next session to read the matching area file first. This zone's law is currently spread
  across `CLAUDE.md` bullets, `SCHREIBEN.md`, `SPRECHEN.md` and file docstrings — which is a large
  part of why the seams above opened.

---

## What is healthy (verified, keep as is)

- **The s190 run/practice split is right and tested.** `isFullRun` / `toPractice` cleanly separate a
  four-part Modelltest from a single-module sitting, `tests/pruefungHub.test.ts` pins the behaviour,
  and the two Verlauf lists never mix.
- **The composer is honest.** `mockExamAvailability` reports what a level can really serve, reading
  and listening never draw the same text in one run, the writing task is drawn from the level's own
  band with the full-brief law enforced, and `tests/exam.test.ts` gates all of it.
- **Scoring never invents a number.** `totalScore` renormalises over the parts that produced a
  score rather than counting an ungraded Schreiben as zero, and the result screen says so.
- **The exam stage discipline holds.** `h-exam-stage`, the pinned RunBar/strip/actions and one
  scrolling inner region give all ten in-exam screens zero page scroll; the resize handles are real
  separators with keyboard support.
- **The recording path is idempotent.** `Ergebnis` keys the record on the run's start timestamp and
  checks the store, so a reload on the result screen cannot double-count.
- **The `converse` guards are correctly layered.** Global monthly fuse, per-user monthly ceiling,
  per-user daily limit counted from a row written at conversation *start*, turn ceiling measured
  against the *stored* transcript, every brief field clipped before it reaches a prompt, and RLS
  with no insert policy so a client cannot mint itself allowance. The design is sound; P4/P8/P9 are
  about the client never showing any of it.
- **Persistence is right.** The run is written through on every change, live work is claimed so the
  PWA cannot reload over it, and a resumed Lesen/Hören jumps to the first unanswered question.

---

## Suggested order of work

1. **P1** — a default-path dead end that loses work. One button condition.
2. **P2, P20, P21, P24** — the stale-copy and dead-reader cluster. Small, entirely safe, and P2 is
   the most visible wrong thing in the app right now.
3. **P6, P5, P4** — exam integrity: right level, no re-sits, no phantom turns.
4. **P3** — the wall-clock timer.
5. **P7, P8, P9** — close the feedback and allowance gaps around the AI parts.
6. **P28** — memoise now, precompute the counts when convenient.
7. **P15, P16, P17** — content composition; P17 is an authoring job, not a code fix.
8. **P27, P10, P11, P22, P23, P25, P26** — the polish tier.
9. **P35** — write the area doc, and fold the surviving findings into it as current law.
