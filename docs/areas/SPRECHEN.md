# Sprechen — the AI conversation partner

Current state only. History → `docs/DECISIONS.md`, blow-by-blow →
`docs/SESSION_PROMPT_LOG.md`. Read this before touching anything under
`src/features/sprechen/`, `src/engine/conversation.ts`, `src/engine/speaking.ts` or
`supabase/functions/converse/`.

## The one-sentence law

**Sprechen is Schreiben with a microphone:** a brief, a conversation, and then the *existing*
correction card as the debrief. It is deliberately **not** an open chatbot.

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
- **2 conversations per learner per day** (`DAILY_LIMIT_CONVERSATIONS`), beside Lang in
  `lib/aiAllowance.ts`.
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
- **A conversation whose very first turn fails gives its unit back.** The row is still inserted
  before the model call, so an abandoned run cannot farm free turns, but a transient upstream
  failure no longer costs half of a two-per-day allowance for a conversation that never happened.
- **`cost_estimate` accumulates** across turns and the debrief; it used to be overwritten per turn.
- **An over-long utterance is refused, not silently clipped**, so the shown and the stored
  transcripts cannot disagree.
- Per-user monthly ceiling, plus the shared `MONTHLY_SPEND_CAP_USD` fuse every AI feature sits
  behind.

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
| `features/sprechen/SprechenHub.tsx` | `/simulation`, the free trainer. Reads `?level=` and `?sz=`, and carries the same Zurück to the Prüfung hub the Schreibtrainer has. |
| `features/exam/SprechenPart.tsx` | Teil Sprechen of the Modelltest. |
| `lib/speaking.ts` | Edge Function client. |
| `supabase/functions/converse/` | Turns + debrief, all secrets, all guards. |
| `supabase/migrations/0017_speaking_conversations.sql` | The row, RLS, retention. |
