# Sprechen — the AI conversation partner

Current state only. History → `docs/DECISIONS.md`, blow-by-blow →
`docs/SESSION_PROMPT_LOG.md`. Read this before touching anything under
`src/features/sprechen/`, `src/engine/conversation.ts`, `src/engine/speaking.ts` or
`supabase/functions/converse/`.

## The one-sentence law

**Sprechen is Schreiben with a microphone:** an Aufgabe chooser, a brief, a conversation, the
*existing* correction card as the debrief, and a Verlauf. It is deliberately **not** an open
chatbot.

## The page (s196)

`/simulation` is Schreiben's frame, because the founder asked for exactly that ("it should somehow
look like Schreiben with a filter rail like Schreiben's Aufgabe wählen tile"):

- a two-segment sliding-pill switcher as the page header, **Üben | Verlauf** (no HubHero, no `h1`);
- **Üben** = the shared `ScopeRail` beside a grid of the Situationen the scope serves. The rail
  carries Niveau, Lebensbereich and Thema and nothing else: a Scenario carries no Branche and no
  Unterthema tags, and a dropdown that can only ever read 0 is dead chrome, not a filter. Niveau
  replaced the old Einsteiger/Mittelstufe/Fortgeschritten section headings, so the band moved onto
  each card as a badge. `SCENARIO_BAND` is the HUB's ladder (1→B1, 2→B2, 3→C1), deliberately not
  the finer band `engine/speaking.ts` pitches the brief at;
- **Verlauf** = `SprechenHistory`, reading `speaking_conversations` (see below).

Both live in the URL (`?tab=`, `?level=`, `?area=`, `?theme=`, `?sz=`), so a reload, a share and the
back button all land where the learner was.

## Why not a chatbot

An LLM will happily talk to a B1 learner forever: it adapts down to their level, never corrects
unless asked, has no task to complete and produces no assessment. The learner leaves fluent in the
conversation they just had and nowhere else. Three things make it an exercise instead:

1. **A brief** — a named partner with a role and a register, a situation, and 2-5 Leitpunkte. Same
   law Schreiben lives by: only a task carrying a full brief is served, because the AI grades
   against that brief.
2. **A conversation** — the partner stays in character, does **not** correct mid-flow (interrupting
   a learner is the most reliable way to stop them speaking) and does **not** volunteer the
   information the learner is meant to ask for.
3. **A debrief** — all correction lands at the end, in the card the learner already knows.

## The three layouts (founder s193)

The layout is a property of the **task**, never a learner setting. `ConversationRunner` is one
runner with three middles; everything else (brief, turn-taking, mic cluster, debrief, guards) is
shared.

| Stage | Where | What the learner sees while talking |
|---|---|---|
| `gespraech` | **All practice** | The scrolling transcript. The founder's reason: learners find keeping track of it useful. |
| `buehne` | Exam, default | One turn on a fixed stage, Aufgabe stays readable. For tasks that work **from** a written brief. |
| `anruf` | Exam, opt-in | No text at all. For tasks reading would **defeat** (listen-and-hold, Notiz machen). "Untertitel" is the escape hatch, resting off. |

`ExamSet.stage` picks between the two exam stages and defaults to `buehne`; `"gespraech"` is
rejected there by the content linter, because the transcript is a practice affordance.
`speakingBrief()` always returns `gespraech`.

**The exam RunBar frames every screen of a Teil** (s194), the brief and the debrief included, not
only the talking one.

**No exam set is `anruf` yet.** Every one of the 15 authored sets is a "discuss the aspects and
agree" task whose aspects must stay readable, so the Anruf layout is built, tested and unreached
until listen-and-hold speaking tasks are authored. That is the next content job, not a bug.

## Where the content comes from

Briefs are **derived, never authored twice** (`src/engine/speaking.ts`):

- practice → `speakingBrief(scenario)`; `partner` + `goals` are authored on the scenario, and
  fall back to a neutral partner and the task line so nothing is ever unservable.
- exam → `examBrief(set, scenario, EXAM_BAND[level])`; `aspects` **are** the Leitpunkte, and always
  were. **The level is the RUN's**, passed in: it was hard-coded to `B2.1` until s194, so every
  Modelltest's speaking part was pitched and graded at B2.1 while the other three Teile honoured the
  chosen Niveau. The content linter caps `aspects` at 5, the number the debrief can return verdicts
  for, so authoring a sixth is an error rather than a silent truncation.

The authored branching `nodes` are no longer read at runtime. They stay in the bank (ids are
permanent, the linter still validates them); retiring them is a separate mechanical change.

## Cost, and the guards that hold it

Pipeline: **browser transcribes → text to the server → text reply → browser speaks it.** Audio
never leaves the device, which is why the privacy policy can say so.

- ~2-4 cents per 12-turn conversation, and effectively 0 while the free Gemini Flash leg of the
  cascade absorbs the turns. Turns use `SPEAKING_TURN_MODEL` (cheap), the debrief
  `SPEAKING_DEBRIEF_MODEL`.
- **TWO daily budgets, counted separately** (founder s197, "it's very less"): **6 Übungsgespräche**
  (`DAILY_LIMIT_CONVERSATIONS`) and **3 Prüfungsgespräche** (`DAILY_LIMIT_EXAM_CONVERSATIONS`),
  split on `speaking_conversations.exam` so a day spent practising can never eat the exam allowance
  or the other way round. Mirrored client-side as the `sprechen` / `sprechenExam` modes in
  `lib/aiAllowance.ts`, which read the same flag. **For an EXISTING conversation the row's own
  `exam` decides which budget it spends, never the request body**, so a forged flag cannot move a
  running conversation onto the emptier meter. The per-learner monthly ceiling rose with them
  (`USER_MONTHLY_CONVERSATIONS` 40 → 120): at up to 9 a day, 40 would have bound within four days
  and made the daily numbers a fiction. (Was one shared budget of 2 from s193.)
- **The row is written when a conversation STARTS**, not when it finishes. The daily limit counts
  rows, so it counts what actually costs money; a learner cannot abandon conversations to farm
  free turns.
- **Turn count is read from the stored row**, never the request body, so a forged transcript
  cannot push a run past `MAX_LEARNER_TURNS` (14, mirrored in `engine/conversation.ts`) — and since
  s194 the CLIENT enforces it too, because a ceiling the learner cannot see is a ceiling they walk
  into. The mic closes at zero, the caption counts down from three, and a turn whose round trip
  FAILED is rolled back off the transcript (`dropLastLearnerTurn`): the debrief grades the stored
  transcript, so anything not in it must not be on screen either.
- **The daily allowance gates the START button**, not a caption after the fact: with nothing left,
  the brief card says so and cannot be started (s194).
- **A debrief is RETRYABLE and costs nothing extra** (s196). The allowance counts conversation
  ROWS, and the row already exists by the time the debrief is asked for, so "Erneut versuchen" on
  the failure screen re-asks the grader without touching the daily budget.
- **A conversation whose very first turn fails gives its unit back.** The row is still inserted
  before the model call, so an abandoned run cannot farm free turns, but a transient upstream
  failure no longer costs a unit for a conversation that never happened.
- **`cost_estimate` accumulates** across turns and the debrief; it used to be overwritten per turn.
- **An over-long utterance is refused, not silently clipped**, so the shown and the stored
  transcripts cannot disagree.
- Per-user monthly ceiling, plus the shared `MONTHLY_SPEND_CAP_USD` fuse every AI feature sits
  behind.

## The debrief, and what a failed one must never cost (s196)

The founder hit "the evaluation couldn't be done ... and the Verlauf isn't updated with this
progress, it's basically lost." Three separate things had to be true for that, and all three are
fixed:

1. **Token budget.** `converse` ran BOTH modes on 1400 output tokens. A debrief has to echo back
   every sentence the learner said, corrected, plus the German tip, its English twin and the
   verdict arrays, as one JSON object; a twelve-turn conversation truncates mid-JSON, the parse
   fails, and the learner reads "Die Rückmeldung konnte nicht gelesen werden" over a conversation
   that went fine. Turns now get `TURN_MAX_TOKENS` (500), the debrief `DEBRIEF_MAX_TOKENS` (4096),
   which is what every other Edge Function here already used.
2. **JSON mode, and a cascade that actually cascades.** The Gemini leg asked for free-form text, so
   a thinking model spent the budget before writing a character and wrapped what was left in prose.
   Worse, `cascade` took the FIRST leg that returned any text, so an unparsable Gemini answer was
   accepted and Claude was never asked. The debrief leg now sets `responseMimeType:
   "application/json"`, and `cascade` takes an `accept` predicate: **a leg whose output the caller
   cannot use is a leg that failed**, and the next model gets its turn.
3. **The practice is credited for SPEAKING, not for being graded.** `onFinished` used to fire only
   on a successful debrief, so an unreachable grader also erased the scenario completion, the XP
   and the streak day. It now fires once per conversation either way, and the failure screen says
   the conversation is stored and offers the retry instead of one lone "Zurück".

## The Verlauf (s196)

`speaking_conversations` had recorded every conversation since s193 and **nothing read it back**,
so the free Sprechtrainer was the only trainer whose work vanished when the learner left the
debrief. `getSpeakingHistory` + `SprechenHistory` are the missing half.

It is deliberately Schreiben's Verlauf row, not a new one: the same compact disclosure, the same
`features/writing/correction.tsx` Original/Korrigiert card, the same tip block with its DE/EN chip.
A conversation whose debrief never arrived **still appears**, with its transcript and an "Ohne
Bewertung" badge. That is the point: the work is on record even when the grader was not reachable.
Deletion is per row (`speaking_delete_own`, GDPR per-item erasure).

## Rules that are easy to break

- **The debrief is `features/writing/correction.tsx`.** Speaking is its fourth caller. A correction
  looks identical whichever trainer produced it (s172); never hand-build a fifth copy.
- **No score on the debrief screen**, even in exam mode. A result is shown in ONE place per page
  (founder s188) and that place is the Verlauf.
- **No "Nochmal" in exam mode** (s194). A Teil is sat once; the retry restarted the part from its
  brief and discarded the first score, so a candidate could re-sit until the number looked good.
- **An automatic end of the recogniser does not end the utterance.** Chrome stops after a silence
  and mobile Chrome ignores `continuous`; `useSpeechInput` re-opens and keeps the finals, because
  the old behaviour reset the transcript on the learner's next press.
- **Whether a Redemittel was used is asked of the model**, not matched against the transcript: a
  learner making a suggestion does not say the words "Vorschläge machen".
- **The exam part completes on EXIT, carrying the score**, not when the debrief arrives. Firing on
  arrival unmounts the runner before the learner reads a word of it.
- **`Auflegen` is neutral, not red.** Danger red is reserved for errors; the founder kept the
  colour law over the phone convention (s193).
- **The typed fallback is not a degraded mode to apologise for.** Firefox has no speech
  recognition, so `supported` is false and the learner types. That is exactly what Sprechen did
  before this feature existed, so nobody is worse off.
- A running conversation claims `useLiveWork`, so the PWA cannot reload over it.
- **The transcript is in the GDPR export.** `speaking_conversations` is the learner's own speech;
  `lib/dataExport.ts` ships it beside their writing (s194).

## Files

| File | What it holds |
|---|---|
| `engine/conversation.ts` | Pure turn state machine + the cost ceiling. No scoring. |
| `engine/speaking.ts` | Brief derivation, the stage rules. |
| `features/sprechen/ConversationRunner.tsx` | The one runner + the three stage views. |
| `features/sprechen/ConversationBriefCard.tsx` | The pre-conversation brief. |
| `features/sprechen/ConversationDebrief.tsx` | Goals, correction card, Redemittel. |
| `features/sprechen/MicCluster.tsx` | The shared control cluster + typed fallback. |
| `features/sprechen/useSpeechInput.ts` | The microphone, over `engine/speech.ts`. |
| `features/sprechen/SprechenHub.tsx` | `/simulation`, the free trainer. Üben \| Verlauf switcher, the shared `ScopeRail` in Schreiben's frame (s196), the scenario grid. Registers the zone's ONE exit (s195): from the list it leaves for the hub, from a started conversation it asks first, because a conversation cannot be resumed. |
| `features/sprechen/SprechenHistory.tsx` | The Verlauf: recorded conversations, correction card, goals met, delete. |
| `features/shared/ScopeRail.tsx` | The ONE "Aufgabe wählen" rail + `ScopeSelect`, shared with Schreiben, Lesen and Hören. |
| `features/pruefung/ModulePicker.tsx` | The chooser frame all four Ohne-Zeit modules share. |
| `lib/moduleScope.ts` | Scope selectors + counters for the Sprechen and the receptive choosers. |
| `features/exam/SprechenPart.tsx` | Teil Sprechen of the Modelltest. |
| `lib/speaking.ts` | Edge Function client. |
| `supabase/functions/converse/` | Turns + debrief, all secrets, all guards. |
| `supabase/migrations/0017_speaking_conversations.sql` | The row, RLS, retention. |
