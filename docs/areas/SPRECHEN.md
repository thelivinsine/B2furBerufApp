# Sprechen — the AI conversation partner

**Interface language (s207):** every chrome string on this surface goes through `useT()`; A2/B1 read it in English, B2/C1 in German, and the learning material stays German at every level. Rule + mechanism: `docs/areas/UI-LANGUAGE.md`.

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

## The Redemittel rail (s202)

A practice conversation carries the phrases for its own Redemittel categories while the learner is
speaking. Before this, the four category NAMES were on the brief card and in the debrief, and the
phrases behind them were only in the Bibliothek, so the learner had the label and never the language
at the moment they needed a sentence.

Founder pick: **Option A's layout on desktop, Option C's on a phone, Option A's content in both.**

- **`lg` and up:** `RedemittelHelp` as a 16rem `ScopeRail` tile beside the conversation. The stage
  widens from `max-w-2xl` to `lg:max-w-4xl`, so the conversation column keeps its width and the rail
  takes the space that was empty beside it. The brief row stays the single button it has always been.
- **Below `lg`:** the same content as the second tab of the brief drawer, **Aufgabe | Redemittel**. A
  phone has no column for a rail, and a second control row would be a second thing to find.
- **ONE measurement decides** (`useMediaQuery("(min-width: 1024px)")`), so the phrases can never be
  on screen twice.

**One hierarchy, both shells** (founder, s202 follow-up): the section label with its `EnPeek` chip,
then the intent **pills at the top of the tile** (all four, the current one LIT), then that intent's
phrases as white cards, **at most five of them** (founder s206: "display only 4-5 highly useful and
frequently used redemittel phrases, not too many of them"). The rail is read mid-conversation with a
partner waiting, so it is a prompt, not the Bibliothek, and some categories carry 24 phrases.
`MAX_HELP_PHRASES` picks the EASIEST that fit the Anrede, ranked by `CEFR_ORDER` (the one CEFR
source) with the bank's authored order inside a band, and shows them in that authored order, so the
list never rearranges itself between two glances. **The pills carry no count since s206:** capped at
five, every intent printed the same digit, and a number that cannot vary is dead chrome rather than
honesty. There is no dropdown: a lit pill states the selection, so a
dropdown above it would print the same fact twice, and four options is pill territory. The pills do
NOT toggle off, unlike `LifeAreaPills`: a conversation always has one intent in view. **No reset**
(`ScopeRail.onReset` is optional since s202): this rail browses, it does not narrow a list, so a
reset would be a dead control.

**The phone drawer's bar is two lines**: the tabs plus the chevron on the first, the task title and
partner on their own full-width line below. Beside the tabs the title had a third of the row and was
cut off after four words. Without tabs (desktop, and the whole Modelltest) the bar stays the one row
it always was.

Rules:

- **Practice only, structurally.** `ConversationRunner` takes `help` as a PROP and the Modelltest
  passes nothing, so a candidate is never shown the phrases they are graded on and the exam chunk
  does not carry the phrase bank.
- **Nothing sends a phrase into the conversation.** Reading is not saying, and the debrief grades
  what was actually said.
- **The Anrede matches the partner** (`src/lib/anrede.ts`, the ONE du/Sie rule, derived from the
  phrase TEXT because `RedemittelPhrase.register` is formality, not Anrede). A category with no
  fitting phrase serves its full set rather than emptying. Gated by `tests/anrede.test.ts`, which
  also asserts every scenario's four intents stay servable in both registers.
- **The list is the one elastic element** in both shells: bounded in the rail, and in the drawer it
  takes what the `50dvh` cap leaves, so the intent pills below it stay on screen and the running
  screen still rests at zero page scroll.
- **The edge fade is per edge and conditional** (`useEdgeFade`, s206), never the unconditional
  `mask-fade-y` it shipped as. A list resting at its top faded its own FIRST phrase out under the
  pills, which reads as a shadow cast by them (founder: "the first redemittel is literally
  overshadowed"). A fade means "content continues past here"; with five phrases there is usually
  nothing to continue, so there is usually no fade.

**No exam set is `anruf` yet.** Every one of the 21 authored sets (measured 2026-08-08) is a "discuss
the aspects and agree" task whose aspects must stay readable, so the Anruf layout is built, tested and
unreached until listen-and-hold speaking tasks are authored. That is the next content job, not a bug.

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
- **TWO daily budgets, counted separately** (founder s204, "it's very less"): **6 Übungsgespräche**
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

## Signing in is a WALL, not a caption (s206)

The founder: "there is an error with speaking exercises, the ai feature doesn't work ... I say
something and submit but it loads and there's no response". The screenshot settled it: the caption
under the microphone read **"Bitte melde dich an, um mit der KI zu sprechen."** Nothing was broken
upstream. Signed out with Turnstile on, `converse` cannot be called (it needs a user and a guest
cannot be minted without a captcha token), and the refusal arrived AFTER the learner had opened the
conversation, opened the microphone and spoken a full sentence, in the same faint grey slot that
otherwise says "Ich höre zu …". There was no way to sign in from that screen either: the zone's quiet
header drops the account menu (s201). It reads as the app doing nothing.

- **`speakingAuthBlock()` / `useSpeakingAuthBlock()`** (`lib/speaking.ts`) are ONE rule with two
  readers, imperative for the API client and subscribed for the screen, so the guard and the gate
  cannot disagree. A guest counts as signed in; only `signedOut` is a wall.
- **The gate is on the brief card**, the same law the daily allowance already follows (s194): a wall
  is stated BEFORE the commitment. The wall with a remedy gets the remedy as its button, so Start
  becomes **Anmelden** and opens `AuthDialog` rather than sitting there disabled with a note under
  it. The sign-in wall is stated before the allowance one, being absolute.
- **A session that lapses mid-conversation opens the dialog** (`TurnResult.needsAuth`).
- **A failed caption is never printed in the status grey** (`MicCluster.captionTone`), and the typed
  fallback prints the caption at all now: on a browser with no speech recognition a refused turn
  showed the learner literally nothing.

## Every leg of the cascade has a deadline (s206)

There was no timeout on any provider call, in any Edge Function here. A provider that answers slowly
or hangs therefore held the whole request open, which on the one AI surface a learner waits at
SYNCHRONOUSLY is indistinguishable from the app being dead. `TURN_TIMEOUT_MS` (20 s) and
`DEBRIEF_TIMEOUT_MS` (60 s) are `AbortSignal.timeout`s per leg, so a hung leg ENDS and the next model
gets its turn.

**The free leg was dead, not free.** `gemini-2.5-flash` reasons by default and Google bills thoughts
as OUTPUT, so a 500-token turn budget was spent thinking about a two-sentence reply: the response
came back `finishReason: "MAX_TOKENS"` with no text part, `converse` discarded it, and EVERY turn of
every conversation fell through to the paid model behind it, at the cost of a whole extra round trip.
Turns now send `thinkingConfig: { thinkingBudget: 0 }`. The other functions never hit this because
they give Gemini 4096 tokens, where the thoughts fit; Sprechen is the one place a model is asked for
two sentences. A losing leg now also LOGS its provider, HTTP status and the provider's own error
code, so "the AI doesn't work" is diagnosable from the function logs without reproducing it.

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
- **A transcript is ASSIGNED, never appended** (s209). `listen()` rebuilds the whole transcript
  from the full `results` list on every event and reports THAT, so a result the browser sends again
  overwrites itself. Appending each event is what printed a sentence back word by word on iOS
  ("hallo hallo hallo Petra hallo Petra ich finde …"): Safari re-delivers a growing utterance as a
  longer version of itself AND flags interim results as final, so `resultIndex` plus `isFinal`
  cannot be trusted to mark new text. `joinTranscript` drops a segment that merely restates the one
  before it, and the hook accumulates in exactly ONE place: a recogniser session that has ENDED and
  therefore cannot change. Gated by `tests/speech.test.ts`.
- **The task travels with the learner** (founder s209). `brief.situation` is stated on the brief
  card (under the partner row) and again at the top of the running Aufgabe panel, above the
  Leitpunkte. It was in the brief object from the start, read by the AI partner and by nobody else:
  the chooser card explained the task in two lines and every screen after it dropped that
  explanation. One statement per screen, muted, no second "Situation" label (the brief card's head
  already carries the eyebrow). Gated by `tests/sprechenBrief.test.tsx`.
- **An edge fade marks content that CONTINUES, never a region resting at its edge** (founder s206,
  again s209). `ThreadStage` and `ConversationDebrief` hardcoded `mask-fade-y`, so a conversation at
  its top faded its first line out under the Aufgabe tile and read as a shadow the tile was casting.
  Both now apply the fade per edge through `useEdgeFade`, like the Redemittel list and the
  Bibliothek columns. Never hardcode `mask-fade-*` on a scroll region.
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
| `features/sprechen/RedemittelHelp.tsx` | The phrases while speaking (s202): the rail tile and the drawer body, one content. Practice only, passed to the runner as `help`. Caps at five and fades only where content continues (s206). |
| `lib/anrede.ts` | The ONE du/Sie rule, derived from phrase text. |
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
