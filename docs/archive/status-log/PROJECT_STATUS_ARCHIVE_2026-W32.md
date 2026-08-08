# Status-log archive, ISO week 2026-W32

Handoffs moved out of `docs/PROJECT_STATUS.md` once they aged past the two most recent.

**Handoff after session 199 (2026-08-07): the audit shipped, its top fix shipped, and P2 is the
next session's work (founder: "I'll continue with the p2 and others in next session").**
Founder prompts: "what's next in the task list?" → "go ahead" → "go with your recommendation reg
branche. I prefer to have Berufsleben and Alltag as the first filter and then themen and only then
Branchen filter as the heirarchy of the filter rail all across. When a user selects a thema where
there is no branche specific content, just show the options within Branche as locked." → "no need of
design preview for the above mention rail changes" → "the header and footer of the filter rail seems
to look like separate pieces attached to the main body. remove the separator lines and make all the
filter rail same shade to look like one piece." → "document the session."

**Shipped:** PR **#824** (the audit report) → **`66061c3`**; PR **#825** (three commits: `acb21f7`
Branche cleanup, `7f5c464` rails, `40176d1` docs) → **`bf9db0b`**. Validate content and Deploy site
to GitHub Pages green on `main` for both. **Deploy Supabase functions did not run on `bf9db0b`, and
that is correct**: it is path-filtered to `supabase/functions/**`, `supabase/migrations/**` and its
own file, none of which this session touched. Housekeeping done after both merges.

### START HERE next session: audit P2

The one where the app currently punishes a learner for doing exactly what the brief asked.
**Six C1 Stellungnahmen at a 200-word target carry only descriptive Leitpunkte**, while `level` is
what tells `evaluate-writing` to "bewerte streng auf C1-Niveau":
`wt_conflict_l01`, `wt_conflict_l05`, `wt_conflict_l15`, `wt_conflict_l17`, `wt_conflict_l25`,
`wt_bildung_l10`.
1. **REPLACE the weakest descriptive point with a justification one; never add a fifth.** Four
   Leitpunkte in 200 words is already the exam shape, and `wt_conflict_l05` shows the pattern:
   "Beschreiben Sie das Problem / Zeigen Sie Verständnis / Schlagen Sie eine Regel vor / Sagen Sie,
   wer beschließen soll" has no point that forces an argument.
2. Then sweep the wider set: **20 of 35 `beschwerde`** and **9 of 54 `stellungnahme`** tasks carry no
   justification point either.
3. Then **gate it**, so it cannot come back: a `stellungnahme`, `forumsbeitrag` or `widerspruch` at
   B2 or above must carry ≥1 justification Leitpunkt. Anchor the check on the same phrase-level
   classifier the audit used, and **read §9 of the report first**: an opening-verb classifier is
   WRONG for German, because a separable prefix carries the meaning ("**Legen** Sie dar, warum …"
   scored as unargumentative and is exactly the opposite). Getting this wrong cost a re-run in s199.
4. Load `/content` before editing `writingPrompts.ts`; ids are permanent, so this edits fields only.

**Then, in priority order (all AI-shippable):**
- **P3:** retire `exam` from the schema (nothing reads it: not the trainer, not the evaluator, not a
  filter; the shipped-ids law protects ids, not fields), or fix its 69 out-of-band tags. Either way
  correct the `words` doc comment, which claims the target follows the exam shape when it is fully
  determined by (Niveau, Länge).
- **P4:** add `source` to the 71 reaction tasks (54 Stellungnahmen, 17 Forumsbeiträge), AFTER P2,
  because a quoted position is what makes a justification Leitpunkt answerable. No schema change.
- **P5:** the 19-item tail. 5 Textsorte re-tags (`wt_meetings_s05`, `wt_meetings_l17`,
  `wt_logistics_s13`, `wt_bildung_l03`, `wt_wohnen_l05`) and 14 Adressat/register fixes where `du`
  meets "Frau <Nachname>". About an hour.

**Two things to know before touching the rails again:**
- **The rail order lives INSIDE the rails** (`FilterRail` reorders its own `scopes` array), never in
  a caller. That is what s184 centralised and s199 kept; do not re-introduce per-surface ordering.
- **The lock lives in ONE place** (`ScopeSelect`'s row renderer + `ScopeLocked` in `ScopeRail.tsx`,
  plus `lockZero` on the Bibliothek's `ScopeMultiSelect`). It shipped WITHOUT a preview round at the
  founder's explicit waiver, so if they dislike the look it is a single-file change, not an
  eight-rail one. **Niveau moved below the hierarchy** on a literal reading of "Berufsleben and
  Alltag as the first filter"; flipping it back is one move per rail.

**Standing debt, unchanged:** P10 human content verification is still the only open s178 audit item
and is founder-owned (`pnpm review:queue` → decisions → `pnpm apply:reviews` → `pnpm stamp:verified`).
`verify:grammar` has still never run over the s198 sentences (no LanguageTool toolchain in this
sandbox). CLAUDE.md is **378 lines** against its ~350 budget, down from 380 despite three new rules;
the compression pass is worth finishing.

Gates on the merged work: lint:content 0 errors · typecheck · lint 0 errors (77 warnings) ·
**649 tests** · build · check:bundle 128.2 kB · check:contrast.

**Handoff after session 195 (2026-08-06):** 2026-08-06 (session 195 gave the Prüfung zone ONE frame: one exit, one Niveau
control, one width at rest; see "Resume here"). **The Prüfung zone was audited end to end and every
finding was fixed.** Founder: "do a thorough audit and analysis of the prufung hub", then "fix all
the issue". The report (`docs/reports/pruefung-audit-2026-08-05.md`, 35 ranked findings) is kept in
full as the record; `docs/areas/PRUEFUNG.md` is the new current-state law for the zone.
**Three patterns explained almost all of it:** a retired feature left its readers behind, Ohne Zeit
was bolted onto a flow whose only exit was the clock, and the server enforced limits the client
never displayed.
**The six blocking ones.** An untimed Lesen or Hören module could not be finished with a single
answer blank, and Ohne Zeit is where a learner lands, so the default path dead-ended and abandoning
lost the work; "Teil abschließen" is now unconditional on the last question and blanks cost a
confirm naming the count. Nothing had written `examsDone` since the branching runner retired in
s186, so Fortschritt reported "noch keine Simulation" and "0 Prüfungen" however many Modelltests a
learner sat; it reads `mockExams` now through a bank-free `isFullMockRun`, and `examsDone` is
retired (kept and synced, because it is real pre-s186 history). The exam clock counted ticks, so a
background tab or a reload paused it; it measures a DEADLINE now and re-syncs on
`visibilitychange`. The 14-turn speaking ceiling was enforced only server-side while
`canSpeak`/`turnsLeft`/`conversationOver` sat unread, so a learner could talk into turns the grader
never saw; the client enforces it, counts down from three, and rolls a failed turn back off the
transcript. Teil Sprechen offered "Nochmal", so a candidate could re-sit it (gone in exam mode).
And `examBrief` hard-coded `level: "B2.1"`, so every Modelltest's speaking part was pitched and
graded at B2.1 whatever Niveau was chosen; it takes `EXAM_BAND[plan.level]` now.
**Feature gaps closed:** the exam's Schreiben correction was computed and never rendered (it is
`correction.tsx`'s fifth caller now); the brief card's allowance-aware disabled state was dead code
(wired); one Modelltest silently spends half the daily writing AND speaking budget (the run band
says so and warns when either is out); the Sprechtrainer had no way back to the hub and dropped the
Niveau on the way in (both fixed, and its scope lives in the URL); Hören could consume both plays
and produce silence (TTS guard, a text fallback, no double-tap, playback stops when the Ansage
changes); the recogniser ending on its own wiped the transcript (it re-opens and keeps it); and
spoken transcripts were missing from the GDPR export.
**Content, not just code:** Durchsagen were 38% of the B2 *reading* pool (excluded now, pools stay
9/16/5); a C1 Hören was mostly B2.2 and could never carry the Notizen task its own Anleitung
promised (two C1 audio texts authored, one with the first C1 Notizen sheet, so C1 no longer tops up
at all); and every Alltag exam set hung off a level-1 scenario, so a B2 or C1 Modelltest could only
ever serve a WORKPLACE speaking task (six authored across Behörde, Wohnen, Arzt and Digitales,
three at B2 and three at C1). The zone also awarded almost no XP: a graded conversation and a
single module sitting both paid zero. Both pay now.
Gates: typecheck · lint 0 errors (75 warnings, unchanged) · **610 tests** (up from 592) · build ·
check:bundle 127.1 kB · check:contrast · lint:content · lint:migrations.
**Resume here:** nothing from the audit is left open. The one item deliberately NOT taken further is
the second half of P28: the hub still loads ~825 kB of content banks because `engine/exam` imports
them, and the per-render re-scan is fixed (`useMemo`) but the load is not. The real fix is
precomputing availability at build time like `frequency.ts`, which is a generator job. Still open
from s193: no exam set is `anruf` shaped, and the authored `nodes` graphs are dead but not retired._

**Handoff after session 192 (2026-08-05):** **The Schreibtrainer got a way back, the nav bar learned
which zone a page belongs to, and the exam frame was confined to Mit Zeit.** Three founder prompts
from phone screenshots. The mobile action cluster's left slot is **Zurück** (to `/anwenden`) instead
of Feedback, and Feedback moved into the caption line in the Bibliothek's shape
("KI-geprüft, kann Fehler enthalten. Mehr · Feedback geben"), measured as one line down to 320px.
A bottom-bar tab is now lit by its ZONE (`navZoneOf`), so `/writing` marks Prüfung, `/session`
marks Praktisch and `/sammlung` marks Fortschritt; both rails render plain `Link`s, because
`NavLink` swallows the `aria-current` we set. And **Ohne Zeit no longer opens the Anleitung**: an
untimed module starts on its first question, its exit is a neutral Zurück rather than the red
Verlassen, and an untouched drill closes with no confirm. Prior s191: **the Prüfung module tiles
lost their gradients** (a flat tint of the same hue, a wider gap under the header block, and the
minutes badge replacing the description line it used to overlap), all measured in headless Chromium
in both clock states.
**The same day, a parallel branch polished the Prüfung zone to a finished product.**
Founder: the two tabs "still look cheap or like MVP", make them read like "a billion dollar edu tech
app". Analysis first (twelve findings), three options previewed, then a second round on the pick:
the founder took **B "Prüfungstag"**, **V2 "Zahl und Kurve"** for the Modelltest Verlauf and
**M3 "Stärkeprofil"** for a NEW Module üben Verlauf.
**What shipped.** ONE 896px frame for both tabs (they had different widths, so the page jumped on
every switch), a height-stable scope row, the Bibliothek's directional tab slide, in-family gradient
mark tiles, and a module card that reads as a button: mark top-left, arrow top-right, the module's
hue washed into the bottom-right corner, and **that corner RESERVED in both clock states**, so the
Mit Zeit badge appears without moving a card edge (the founder's first amendment). The Modelltest
band becomes a two-column ticket from `lg` (52 Min as a display figure, countdown and CTA left, the
four Teile as a ladder right) and states the total once per breakpoint. Modelltest's Verlauf now
leads with the last score and its delta, with Bester/Bestanden as supporting stats and the last seven
runs as bars against the 60 % pass line; Module üben's is a Stärkeprofil where the pale segment is
the first attempt and the solid cap the gain since. **A Modelltest is a run that sat all four parts;
a run that sat one is module practice** (`isFullRun`/`toPractice`, 7 new tests) — before this a
single Lesen drill counted as a Modelltest result and its score landed in "Bester". Dash tables are
gone: an unscored run says "Noch keine Bewertung" and its row says "Nicht bewertet".
**Verified by driving the real build over CDP**, not by reading mockups: 14 states across
1280×900 / 1440×900 / 1024×820 / 834×1112 / 393×852, light + dark, both clock states, expanded,
first visit, unscored and A2, each reporting `scrollHeight` vs `innerHeight`. That is what caught the
four bugs the mockups could not: the desktop Module tab scrolled at rest (930px against 780px of
room, fixed by splitting that Verlauf into summary | rows from `lg`), the switcher stretched the full
column on an 834px tablet, the run band stretched to 800px on a tall tablet (filling the stage is a
PHONE rule now), and M3's dotted "first attempt" marker was invisible over a saturated fill.
Gates green: build · typecheck · lint 0 errors · 558 tests · check:bundle 125.8 kB · check:contrast.
Shipped as **PR #801**, squash-merged into `main`.
**Resume here:** nothing is open in the Prüfung zone. The one deliberate open question from s189
still stands (below).
Older handoffs (s189 and earlier) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.

**Handoff after session 193 (2026-08-06):** **Sprechen was rebuilt: the learner now actually speaks.**
Founder: "the sprechen part looks quite strange as the learner never get to speak."
They were right and it was worse than it looked. The Sprechtrainer replayed a hand-authored
branching tree answered by **tapping one of 2-4 written options** (its "free speaking" node offered
a text box placeholder, "Tippe deine Antwort (optional)"), and `scoreDialogue` averaged an
author-assigned quality number per chosen option, so the score measured which button was pressed,
never the learner's German. The Modelltest's **Teil Sprechen embedded that same runner and was
graded by the learner ticking their own rubric checkboxes** — the speaking grade in a mock exam was
a self-assessment. The only real speaking drill in the app was the single-word STT block in the Üben
session, which meant `engine/speech.ts` had shipped a working recognition wrapper all along that the
Sprechen surface never called.
**The thesis: Sprechen is Schreiben with a microphone** — a brief, a conversation, then the EXISTING
`features/writing/correction.tsx` card as the debrief (speaking is its fourth caller). Explicitly not
an open chatbot: an LLM adapts down to a B1 learner, never corrects unless asked and produces no
assessment, so the brief (named partner, register, 2-5 Leitpunkte) is what makes it an exercise, and
the partner is instructed never to correct mid-flow.
**Three layouts were previewed** (`preview/sprechen-ai-redesign.html`, artifact published) and the
founder answered with a **mapping** rather than a pick: practice gets the chat thread ("useful to
keep track of the transcripts"), exams get Bühne or Anruf **decided by the task**. So the layout is a
property of the TASK, never a setting: `ExamSet.stage` defaults to `buehne` (Aufgabe stays readable)
and only a task reading would defeat sets `anruf`. One runner, three middles.
**Cost was the real decision** (the app runs under a $5/month AI cap): browser transcription + text
LLM + browser TTS is ~2-4 cents per 12-turn conversation and ~0 while the free Gemini Flash leg
absorbs turns, against 5-46 cents *per minute* for real-time speech-to-speech. Pipeline A shipped,
structured so cloud STT/TTS is a one-function swap. Founder took the recommendation and 2
conversations/day.
**Guards:** the conversation row is written when a conversation STARTS, so the daily limit counts what
costs money and abandoned runs cannot farm free turns; the 14-turn ceiling is measured against the
STORED transcript, never the request body.
**Two honesty fixes during the build:** the debrief first *guessed* whether a target Redemittel was
used by matching its label against the transcript (theatre — nobody says "Vorschläge machen"), now
the model is asked; and the exam part first completed when the score arrived, which would have
unmounted the runner before the learner read their feedback, now it completes on exit carrying the
score.
**Content:** partner + 3 goals authored for all 36 scenarios. Verified by driving the REAL built app
in headless Chromium, which is what caught that the fallback made every brief read
"Gesprächspartner:in" with the whole task sentence as its single goal.
**Privacy:** new microphone section in both languages (audio never leaves the device; only text is
sent), the 730-day retention job extended to transcripts, and `PRIVACY_LAST_UPDATED_ISO` +
`CONSENT_VERSION` bumped together as the drift gate requires.
**Retired:** `features/simulation/`, `features/exam/ExamRunner.tsx`, `engine/dialogue.ts`.
Gates green: typecheck · lint 0 errors (75 warnings, down from 77 with the dead code) ·
592 tests · build · check:bundle 126.6 kB · check:contrast · lint:content · lint:migrations.
**Resume here:** the one deliberate gap is that **no exam set is `anruf` shaped yet** — all 15
authored sets are "discuss the aspects and agree" tasks, so the Anruf layout is built, tested and
unreached until listen-and-hold speaking tasks are authored. That is the next content job. Also open:
the authored `nodes` graphs stay in the bank but are no longer read at runtime; retiring them is a
separate mechanical change. Backend note: `converse` needs no new secrets. `ANTHROPIC_API_KEY` and
`GEMINI_API_KEY` have both been set since s150 ("all three AI functions deployed on the
Gemini-primary cascade"), so the free Gemini leg is live and the ~2-4 cents per conversation figure
holds rather than every turn falling through to Claude. Migration 0017 applies on the merge to
`main`; the same merge deploys the new `converse` function._


**Handoff after session 193: Sprechen was rebuilt: the learner now actually speaks.**
Founder: "the sprechen part looks quite strange as the learner never get to speak."
They were right and it was worse than it looked. The Sprechtrainer replayed a hand-authored
branching tree answered by **tapping one of 2-4 written options** (its "free speaking" node offered
a text box placeholder, "Tippe deine Antwort (optional)"), and `scoreDialogue` averaged an
author-assigned quality number per chosen option, so the score measured which button was pressed,
never the learner's German. The Modelltest's **Teil Sprechen embedded that same runner and was
graded by the learner ticking their own rubric checkboxes** — the speaking grade in a mock exam was
a self-assessment. The only real speaking drill in the app was the single-word STT block in the Üben
session, which meant `engine/speech.ts` had shipped a working recognition wrapper all along that the
Sprechen surface never called.
**The thesis: Sprechen is Schreiben with a microphone** — a brief, a conversation, then the EXISTING
`features/writing/correction.tsx` card as the debrief (speaking is its fourth caller). Explicitly not
an open chatbot: an LLM adapts down to a B1 learner, never corrects unless asked and produces no
assessment, so the brief (named partner, register, 2-5 Leitpunkte) is what makes it an exercise, and
the partner is instructed never to correct mid-flow.
**Three layouts were previewed** (`preview/sprechen-ai-redesign.html`, artifact published) and the
founder answered with a **mapping** rather than a pick: practice gets the chat thread ("useful to
keep track of the transcripts"), exams get Bühne or Anruf **decided by the task**. So the layout is a
property of the TASK, never a setting: `ExamSet.stage` defaults to `buehne` (Aufgabe stays readable)
and only a task reading would defeat sets `anruf`. One runner, three middles.
**Cost was the real decision** (the app runs under a $5/month AI cap): browser transcription + text
LLM + browser TTS is ~2-4 cents per 12-turn conversation and ~0 while the free Gemini Flash leg
absorbs turns, against 5-46 cents *per minute* for real-time speech-to-speech. Pipeline A shipped,
structured so cloud STT/TTS is a one-function swap. Founder took the recommendation and 2
conversations/day.
**Guards:** the conversation row is written when a conversation STARTS, so the daily limit counts what
costs money and abandoned runs cannot farm free turns; the 14-turn ceiling is measured against the
STORED transcript, never the request body.
**Two honesty fixes during the build:** the debrief first *guessed* whether a target Redemittel was
used by matching its label against the transcript (theatre — nobody says "Vorschläge machen"), now
the model is asked; and the exam part first completed when the score arrived, which would have
unmounted the runner before the learner read their feedback, now it completes on exit carrying the
score.
**Content:** partner + 3 goals authored for all 36 scenarios. Verified by driving the REAL built app
in headless Chromium, which is what caught that the fallback made every brief read
"Gesprächspartner:in" with the whole task sentence as its single goal.
**Privacy:** new microphone section in both languages (audio never leaves the device; only text is
sent), the 730-day retention job extended to transcripts, and `PRIVACY_LAST_UPDATED_ISO` +
`CONSENT_VERSION` bumped together as the drift gate requires.
**Retired:** `features/simulation/`, `features/exam/ExamRunner.tsx`, `engine/dialogue.ts`.
Gates green: typecheck · lint 0 errors (75 warnings, down from 77 with the dead code) ·
592 tests · build · check:bundle 126.6 kB · check:contrast · lint:content · lint:migrations.
**Resume here (at the time):** the one deliberate gap is that **no exam set is `anruf` shaped yet** —
all 15 authored sets are "discuss the aspects and agree" tasks, so the Anruf layout is built, tested
and unreached until listen-and-hold speaking tasks are authored. Also open: the authored `nodes`
graphs stay in the bank but are no longer read at runtime; retiring them is a separate mechanical
change. Migration 0017 applies on the merge to `main`; the same merge deploys the new `converse`
function.


**Handoff after session 192 (2026-08-05): the Schreibtrainer got a way back, the nav bar learned
which zone a page belongs to, and the exam frame was confined to Mit Zeit.** Three founder prompts
from phone screenshots. The mobile action cluster's left slot is **Zurück** (to `/anwenden`) instead
of Feedback, and Feedback moved into the caption line in the Bibliothek's shape
("KI-geprüft, kann Fehler enthalten. Mehr · Feedback geben"), measured as one line down to 320px.
A bottom-bar tab is now lit by its ZONE (`navZoneOf`), so `/writing` marks Prüfung, `/session`
marks Praktisch and `/sammlung` marks Fortschritt; both rails render plain `Link`s, because
`NavLink` swallows the `aria-current` we set. And **Ohne Zeit no longer opens the Anleitung**: an
untimed module starts on its first question, its exit is a neutral Zurück rather than the red
Verlassen, and an untouched drill closes with no confirm. Prior s191: **the Prüfung module tiles
lost their gradients** (a flat tint of the same hue, a wider gap under the header block, and the
minutes badge replacing the description line it used to overlap), all measured in headless Chromium
in both clock states.
**The same day, a parallel branch polished the Prüfung zone to a finished product.**
Founder: the two tabs "still look cheap or like MVP", make them read like "a billion dollar edu tech
app". Analysis first (twelve findings), three options previewed, then a second round on the pick:
the founder took **B "Prüfungstag"**, **V2 "Zahl und Kurve"** for the Modelltest Verlauf and
**M3 "Stärkeprofil"** for a NEW Module üben Verlauf.
**What shipped.** ONE 896px frame for both tabs (they had different widths, so the page jumped on
every switch), a height-stable scope row, the Bibliothek's directional tab slide, in-family gradient
mark tiles, and a module card that reads as a button: mark top-left, arrow top-right, the module's
hue washed into the bottom-right corner, and **that corner RESERVED in both clock states**, so the
Mit Zeit badge appears without moving a card edge (the founder's first amendment). The Modelltest
band becomes a two-column ticket from `lg` (52 Min as a display figure, countdown and CTA left, the
four Teile as a ladder right) and states the total once per breakpoint. Modelltest's Verlauf now
leads with the last score and its delta, with Bester/Bestanden as supporting stats and the last seven
runs as bars against the 60 % pass line; Module üben's is a Stärkeprofil where the pale segment is
the first attempt and the solid cap the gain since. **A Modelltest is a run that sat all four parts;
a run that sat one is module practice** (`isFullRun`/`toPractice`, 7 new tests) — before this a
single Lesen drill counted as a Modelltest result and its score landed in "Bester". Dash tables are
gone: an unscored run says "Noch keine Bewertung" and its row says "Nicht bewertet".
**Verified by driving the real build over CDP**, not by reading mockups: 14 states across
1280×900 / 1440×900 / 1024×820 / 834×1112 / 393×852, light + dark, both clock states, expanded,
first visit, unscored and A2, each reporting `scrollHeight` vs `innerHeight`. That is what caught the
four bugs the mockups could not: the desktop Module tab scrolled at rest (930px against 780px of
room, fixed by splitting that Verlauf into summary | rows from `lg`), the switcher stretched the full
column on an 834px tablet, the run band stretched to 800px on a tall tablet (filling the stage is a
PHONE rule now), and M3's dotted "first attempt" marker was invisible over a saturated fill.
Gates green: build · typecheck · lint 0 errors · 558 tests · check:bundle 125.8 kB · check:contrast.
Shipped as **PR #801**, squash-merged into `main`.
**Resume here (at the time):** nothing was open in the Prüfung zone. The one deliberate open
question from s189 stood until s195 (below).

**The same session, fuller technical detail (branch `claude/prufung-ui-bottom-bar-u0fdwf`):**
Two founder prompts, both from phone screenshots.
- **"Replace the feedback button with zurück ... add feedback geben right next to KI geprüft,
  similar to Bibliothek."** The mobile floating cluster's left slot is now `BackToPruefung`
  (`src/features/writing/bottomChrome.tsx`): the same 44px squircle geometry the Feedback button
  had, linking to `/anwenden` rather than to history, because `/writing` is entered from three
  places. Feedback moved down into the caption line as the Bibliothek's own `FeedbackLink`:
  "KI-geprüft, kann Fehler enthalten. Mehr · Feedback geben", measured as ONE line down to 320px.
  Both trainers now render the same `MobileAiNote`, so the two hand-kept copies cannot drift.
  `FeedbackIconButton` is deleted; `FeedbackNote` is built from `FeedbackLink`.
- **"The prufung bottom bar isn't selected here, check this for all the pages."** A tab is lit by
  its ZONE now (`navZoneOf` in `nav-items.ts`), not by the URL: `/writing`, `/simulation`, `/exam`
  light Prüfung; `/quiz` and the retired per-tool routes light Bibliothek; `/session`, `/revision`,
  `/welt` light Praktisch; `/sammlung` lights Fortschritt. The bar and the sidebar render plain
  `Link`s, because `NavLink` re-decides the state and also SWALLOWS `aria-current` (it reads that
  prop as the value to use when it considers itself active), so the lit tab announced nothing.
  Measured across all twelve in-shell routes: every one lights its zone, `/session` and `/revision`
  have no bar (focus mode), none is blank.
- **"Such screens for hören and lesen for Ohne Zeit ... this screen mode represents exam mode. This
  should only be shown when a user is in mit zeit mode."** The Anleitung is Mit Zeit's screen now:
  `useExamStore.start` opens an untimed module straight in `phase: "part"` (and `completePart` never
  routes the next part through an intro either). The frame follows: the header's exit is a neutral
  **Zurück** arrow instead of the red Verlassen (`useSessionStore.examUntimed`, since AppShell may
  not import the exam store), leaving an untouched untimed drill asks nothing at all, and the
  confirm it does show reads "Übung verlassen?". The STAGE is unchanged: one viewport, no bottom
  bar, the drill scrolling internally. Verified in the real build: Ohne Zeit Lesen and Hören open on
  the question, Mit Zeit still opens on "PRÜFUNGSTEIL ... der Timer läuft, sobald du startest".
Gates green: build · typecheck · lint 0 errors (77 warnings = baseline) · 558 tests ·
check:bundle 126.7 kB of 400 · check:contrast.


**Handoff after session 190 (2026-08-05): the Prüfung polish round (branch
`claude/polish-ui-ux-design-92sbje`).**
Founder: "still look cheap or like MVP ... I want them to look highly polished, excellent UI/UX, like
a billion dollar edu tech app", then "V2 and M3 ... take screenshots during the testing phase and
optimize and polish the spacing ... without any bugs".
**Process:** analysis in chat first (no code touched), three named options previewed
(`preview/pruefung-polish.html`), a second round on the pick (`preview/pruefung-polish-r2.html`,
artifact https://claude.ai/code/artifact/fd7d867c-39e0-4f7d-9525-3d64270b6e04, redeployed to the same
URL), then implementation verified against the REAL app.
**What shipped** (`src/features/pruefung/PruefungHub.tsx` rewritten; `partMeta.ts` gained
`wash`/`fillPale`/`fillSolid` and gradient `tile`s; `index.css` gained `.mod-wash-*` + `.mod-go`):
- One 896px frame for both tabs, a fixed-height scope row, the Bibliothek's `popLayout` tab slide.
- The module card: mark + arrow row, title, description, the hue wash in the bottom-right corner and
  that corner reserved by the card's bottom padding, so Ohne Zeit / Mit Zeit never resizes anything.
- The run band: a two-column ticket from `lg`, today's stacked band below it, `flex-1` on phones only.
- Modelltest Verlauf **V2**: display figure + delta chip, Bester/Bestanden as stats, seven bars
  against the pass line (named in the caption, never on the chart).
- Module üben Verlauf **M3**: four columns on one scale, pale = first attempt, solid = the gain;
  split into summary | rows from `lg`, which is what keeps a 1280×900 laptop at zero scroll.
- The `mockExams` split into full runs vs single-module practice (`tests/pruefungHub.test.ts`).
**Verification tooling** lives in the session scratchpad, not the repo: a ~60-line CDP driver
(Node 22's built-in WebSocket, no new deps) that seeds localStorage, sets a viewport, clicks by
button text, screenshots, and prints `scrollHeight`/`innerHeight`. Worth rebuilding next time a
surface has to be checked in the real app rather than in a mockup.
**Nothing is left open in this zone.**


**Handoff after session 183 (2026-08-02): the Prüfung icons, and the merge question answered.**
Founder: "D and 2", then "keep them separate".
- **Bar mark: the orange Absolventenhut** (`graduationCap` in `route-icons.tsx`). The target rings
  it replaced were the bar's only OUTLINE mark among filled two-tone shapes, which is the whole
  reason it read thinner than its neighbours. `/anwenden` and `/exam` now share that one mark on
  purpose: the tab and the hub card are the same thing at two depths.
- **Hub tiles: the branded route marks on tinted squircles** (`AnwendenHub.tsx`). Each card renders
  `RouteIcon` for its own route, so the Schreiben card carries the exact pencil the nav does, the
  microphone matches it in style, and the cap ties the exam card to the zone. The white-on-gradient
  tiles this replaced turned every mark into the same white silhouette.
- **Two fixes the implementation forced.** (1) Routes that are not `navItems` entries had no accent
  colour, so all three marks would have drawn brand blue: `OFF_NAV_COLOR` now supplies cyan for
  `/simulation` and orange for `/exam`. (2) The tiles were `rounded-2xl`, and `--radius + 10` is
  24px, exactly half of a 48px tile, so they were rendering as full CIRCLES (already true of the old
  gradient tiles). Now `rounded-xl`, matching the approved preview and the squircle law.
  The `/simulation` teal also went from `#5eead4` to `#2dd4bf`, which washed out on the tinted tile.
- **Sprechen vs. Prüfungssimulation: KEEP BOTH, founder decision.** Same dialogue engine and
  scenario bank; Sprechen is untimed practice with hints across all 30 scenarios, Prüfungssimulation
  wraps one scenario in exam conditions (Aufgabenblatt, 6-minute countdown, rubric self-check,
  score). Nothing was merged and nothing changed in either runner.
- **Gates:** typecheck · lint 0 errors · test:unit **496/496** · build · check:bundle 123.2 kB.
  Verified in the BUILT app at 320px, 390px (light + dark) and desktop: five even bar slots with the
  cap active, the three tiles read apart at a glance, and all three cards still open their trainer.
- **Approved mockups:** `preview/pruefung-icons.html` (variants A-D and 1-3 as shown to the founder).
- **Shipped:** PR **#780**, squash-merged as `797f65d`. `Validate content` and `Deploy site to
  GitHub Pages` both green on the merge commit, so this is live on genauly.de. Post-merge
  housekeeping done: branch reset onto `main`, working tree clean. (The mockup round and the
  implementation went out as ONE PR: the preview commit was still unmerged when the founder picked,
  so the picks were added to the same branch.)
- **One open one-liner for the founder:** the page's `HubHero` still shows the lucide target, so the
  zone is a cap in the bar and the sidebar but a target at the top of its own page. Swapping it
  would put two caps on that page (hero + Prüfungssimulation card), which is why it was left alone.

**Session 182 is fully archived** in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`:
part 1 (audit P6, the Redemittel phrase bank) and, aged out by this session, part 4 (the five-slot
Prüfung nav zone, PR #778). Their law lives on in `docs/DECISIONS.md` §s182,
`docs/areas/CONTENT.md` and `docs/areas/PRAKTISCH-NAV.md`. (Part 4 had been sitting in this file
TWICE, once above the s183 handoff and once below it; the duplicate went with the archive move.)

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_

**Handoff after session 184 (2026-08-03): the Lebensbereich pills, in every rail.** Founder: "I want
a clear Berufswelt and Alltag pills in each and every filter or aufgabe rail through out the app
right below the Branchen filter."
- **Naming was asked BEFORE building**, because it was the only part that changed the scope: the
  prompt said "Berufswelt", the app's locked word is **Berufsleben** (s181), and one surface saying
  something different is the exact drift `lib/lifeAreas.ts` exists to stop. Founder kept
  **Berufsleben**, so nothing was renamed and the change stayed additive.
- **One shared control, `src/features/shared/LifeAreaPills.tsx`**, now in Wörter, Kollokationen,
  Redemittel and the Schreiben Kurz/Lang Aufgabe rail, on desktop rails and mobile panels alike.
  **Grammatik is the one deliberate exception:** grammar topics carry no `themeId`, so a life-area
  filter there would be dead chrome, not a filter.
- **The rail owns the slot, not the caller** (`area` prop on `FilterRail`, inserted after the
  `sector` scope, or first on a tab with no Branche dropdown), so "right below the Branchen filter"
  cannot drift per surface. Single-select that toggles off, `?area=`, pinnable, counted by the badge,
  cleared by both rails' reset.
- **Coherence is enforced, not hoped for:** picking an area narrows the Thema dropdown to that area
  AND drops a Thema from the other one, so pill, dropdown and list can never contradict each other.
  Pill counts are computed before Thema/search/facets, so the other pill never goes dead at exactly
  the moment you want to switch. In Schreiben `area` became a HARD, coarsest axis, so the two areas
  partition the 717-task pool exactly, with `blockingAxis` gaining `area` for the stale-deep-link case.
- **One visual correction during the round:** an equal-width 2-column pill grid truncated
  "Berufsleben" against a four-digit count in the 16rem desktop rail, so the pills use the
  content-sized wrapping facet-pill layout the same tile already uses two sections below.
- **Gates:** typecheck · lint 0 errors · lint:content · test:unit **506/506** (10 new) · build ·
  check:bundle 123.1 kB. Verified in a headless browser on both rails: `theme=arzt` + tap Berufsleben
  → `?area=professional` with Thema back to "Alle Themen", the Thema dropdown then listing exactly
  one heading; toggle-off, pin+collapse and reset all behave.
- **Shipped:** PR **#782**, squash-merged as `c612a5d`; `Validate content` and `Deploy site to
  GitHub Pages` both green on the merge commit, so this is live on genauly.de. The session record
  followed in PR **#783** (`f3b4395`) and the layout-index gaps it exposed in PR **#784**. Post-merge
  housekeeping done after each: branch reset onto `main`, working tree clean.
- **Not touched, on purpose:** Grammatik (no `themeId` on its topics), Sammlung (a Lv 1-5 chip row,
  not a scope rail), the Fokus grammar dials (form controls, not a content scope), and
  `libraryFocus` in `engine/session.ts` (Bibliothek Üben hands over already-filtered ids, so the
  area rides along; only hand-built `/session?…` links would need the param, and nothing writes them).
- **Worth the founder's eye on the live site:** whether "Lebensbereich" is the right section label
  (one word, matches the two pills under it), and whether Grammatik should carry the pills anyway.
  Both are small changes.


**Sessions 182 and 183 are fully archived** in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`: s182 parts 1 and 4, and, aged out by
this session, the full s183 handoff (the Prüfung icon language, PR #780). Their law lives on in
`docs/DECISIONS.md` §s182/§s183, `docs/areas/CONTENT.md`, `docs/areas/PRAKTISCH-NAV.md` and
`docs/areas/BRAND.md`.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_

**Handoff after session 185a (2026-08-04): the content-audit backlog, minus P10.** Founder, after
being shown what was left: "go ahead with all the items except for the p10." Shipped as PR **#785**,
squash-merged `863b7d4`, after resolving a docs-only conflict with the parallel 185b branch.
- **Closed outright: P9, P7, P5, P4.** P9 gave every noun a `plural` or a `numerus` and folded the
  two `pron` schemes into one documented, linted scheme. P7 re-levelled 108 items off the advanced
  bands and froze the rare-compound count with a linter ratchet. P5 took EVERY grammar topic to 10
  drills with ≥3 productive (the 21 B2/C1 topics had zero productive between them). P4 added six
  level-3 scenarios, three of them Alltag.
- **P3 is done.** Eight exam-length B2 texts shipped, all six voicemails carry `notes` fields, and
  the Notizen step itself shipped as **variante A**, which the founder picked from
  `preview/notizen-varianten.html` and then refined over three rounds. The settled shape is in
  `docs/areas/CONTENT.md` and should be treated as locked: Himmelblau message tile above a WHITE
  Notizen sheet (colours swapped on request), ruled lines rather than boxed inputs, a 40px play
  button on the title row, and identical row heights before and after "Notizen vergleichen" so the
  button underneath never moves. Final render: `preview/notizen-a-r2.html`.
- **Three things were deliberately left alone, and each is a rule, not a shortcut.** (1) The 12
  human-verified rows that P9's new checks touch: editing one breaks the content fingerprint its
  `verified` stamp is tied to, so the linter warns and they queue for the next human review. (2)
  P7's "spend the next 200 items on core verbs, adjectives and connectors" is a standing authoring
  rule in `docs/areas/CONTENT.md`, not a shippable change. (3) P10 itself, per the founder.
- **Two rules are gates now, so they cannot rot:** `tests/grammar.test.ts` asserts 10 drills + 3
  productive per topic, and `lint-content.mjs` gates noun numerus, the pron scheme and the
  rare-compound ceiling. A future pack cannot quietly re-open any of them.
- **One test fixture was rewritten, not patched.** The composer's listening test scoped to logistics
  because that theme's only text WAS a voicemail; the new logistics text falsified that. It now
  derives the theme from the bank, so adding a text anywhere cannot make it stale again.

**Handoff after session 185b (2026-08-04, parallel branch): the database architecture audit.**
Founder: "the database architecture is concerningly linear.. can you do a thorough audit and provide
your analysis with risks and recommendations?"
- **The report is `docs/reports/db-architecture-audit-2026-08-04.md`** (all 15 migrations, the 5 Edge
  Functions, `cloudSync.ts`, the admin RPCs; findings R1-R8 with per-finding status). **Verdict:**
  the "linear" schema is the correct consequence of keeping the ~5,000-id content catalog in the
  repo; the real risks were growth-shaped, not shape-shaped. Read the report for the reasoning; this
  handoff records only what changed and what is still owed.
- **The founder then said "do the four fixes", and all four shipped:**
  1. **R3, the silent sync.** The push helpers ignored the supabase-js `{ error }`, so a permanently
     failing sync was indistinguishable from a working one. They now read it, retry with backoff,
     and after 3 consecutive failures Settings shows an amber **"Sync pausiert"** with the last
     backup time and a live retry. Also added an **unknown-column retry**: the site and migration
     deploys are separate workflows, and an unknown column fails the whole upsert.
  2. **R4, retention** (`0015_retention.sql`): three weekly `pg_cron` purges, guests 90 d, dead
     transform-cache rows 60 d, learner text 730 d. Block exception-wrapped so a missing extension
     warns instead of failing the migration step and blocking the function deploys behind it.
  3. **R1, day-map caps:** `RETAIN_DAYS = 400`, dropped active days folded into `activeDaysFolded`
     (+ cloud column) so the lifetime "N aktive Tage" figure is unchanged.
  4. **R6, the idempotency gate:** `pnpm lint:migrations` + a `validate.yml` step, six rules, files
     ≤ 0014 exempt as already-applied history. Verified in both directions.
- **The one question the code could not answer went to the founder: learner text expires after
  2 years** (audit F11, now CLOSED). The job NULLs the text columns rather than deleting rows, so AI
  limits and aggregates keep working and Verlauf keeps the evaluation: the learner loses old raw
  text, never their progress record. The privacy policy was rewritten in the same change (also
  documenting the new 90-day guest rule, and dropping the sentence that had promised indefinite
  retention). Standing rule in `docs/DECISIONS.md` §s185.
- **The documentation pass then caught a real miss in that policy change and fixed it.** The rewrite
  had shipped WITHOUT bumping `PRIVACY_LAST_UPDATED_ISO` and `CONSENT_VERSION`, so a legal page
  rendered materially new retention terms under the old date. **The §G2 drift check provably cannot
  catch this:** `consentInSync()` compares the two constants to each other, so forgetting BOTH stays
  green. Both are now `2026-08-04`; the rule is written into `docs/areas/LEGAL-ADMIN.md`.
- **Still owed (see "Resume here"):** confirm `/admin → Launch` reads `retention_scheduled: true`.
- **Design:** `preview/sync-status.html`, screenshot-verified. The new state reuses the existing
  badge recipe with the warning token, so no new visual language was introduced.
- **Gates:** typecheck · lint 0 errors · lint:content · lint:migrations · test:unit **515/515**
  (9 new) · build · check:bundle 124.7 kB. **Shipped:** PR **#786** (`7fe00dd`) and **#787**
  (`f738544`), both squash-merged, all three workflows green, migration 0015 applied to the live
  database.

**Handoff after session 186 (2026-08-04): the Prüfungssimulation rework, in four merged PRs.**
Founder: the simulation "should actually feel like an exam with all the lesen, hören, schreiben and
sprechen modules with a timer and clear instructions"; picks after a preview round
(`preview/pruefungssimulation-rework.html`): **Option B start page + a Niveau row (A2 to C1),
Option C answer-sheet runner, quiet outline Zurück/Weiter (dark blue only on submission moments),
and the Schreiben expand button where useful.**
**PRs: #791** (the exam) · **#792** (exam chrome) · **#793** (the stage, no page scroll) ·
**#794** (question always visible, desktop side by side). All squash-merged; deploys green (one
Supabase run needed a re-run after an `esm.sh` 522 outage, unrelated to the code).
- **What shipped:** `engine/exam.ts` (level-aware composer + scoring; 3 Texte, 2 Ansagen max 2x,
  1 voll gebriefte Schreibaufgabe, 1 Sprechen-Szenario über die 1-3-Leiter; Bestanden ab 60 %),
  `useExamStore` (persisted run: plan ids, answers, Notizen, essay, remaining seconds; a reload
  resumes mid-part; Sprechen restarts its dialogue with full time, documented), the reworked
  `ExamHub` (Niveau row, slim full-exam card, four module cards, each startable alone, honest
  zero states), `MockExamRunner` + parts (Anleitung pages, runbar with amber-under-2-min timer,
  numbered answer strip, Hören with TTS + Notizen lines, Schreiben with fullscreen dialog +
  UmlautKeys, embedded Sprechen), and the Ergebnis screen (per-Teil bars, weakest-part Üben CTA,
  answer review). Writing is scored by `evaluate-writing`'s new **exam mode** (0-100, telc-weighted;
  `exam_score` persisted, migration 0016) and the result renormalises honestly when no score came
  back. `progress.mock_exams` syncs the runs (bounded at 100, unknown-column retry covers the
  deploy window). Tests: `tests/exam.test.ts` (9) + the full suite green; bundle 125 kB.
- **Exam chrome (founder follow-up, same session):** while a run is on screen the mobile bottom
  bar is hidden and the header's streak pill + account menu become ONE quiet muted X. It is the
  only exit (the RunBar X and the Anleitung abort link were removed with it), it confirms through
  a `danger` dialog mid-exam and closes without one on the result screen. The flag is
  `useSessionStore.examExit`, a callback rather than a boolean so eager `AppShell` never imports
  the exam store (bundle held at 125.7 kB). Not the same thing as focus mode, which hides the
  header too; both are documented in `docs/areas/PRAKTISCH-NAV.md`.
- **No page scroll inside the exam (founder follow-up):** a running Teil is a STAGE, not a
  document. `main` becomes `h-exam-stage` tall and every part pins its RunBar, answer strip and
  actions around one internally scrolling region. Audited by driving the real build at 393x852,
  375x667 and 360x640: all ten in-exam screens (hub-to-Ergebnis) rest at **0 px** page overflow.
  The hub itself still scrolls ~150 px on a 667 px phone and is meant to: it is a menu, and the
  least-scrolling hub in the app (`/anwenden` 237 px, Praktisch 253 px at the same size).
- **The question tile is never what shrinks (founder follow-up, #794).** Sharing one scroll region
  buried it under a long text. Now the text (Lesen) and the Notizen sheet (Hören) are the elastic
  tiles and the question keeps its natural height, verified fully visible for **every** question
  (9 Lesen + 6 Hören) at all three phone sizes. Three rules make it fit and are load-bearing: no
  "Aufgabe N von M" eyebrow on the question card (the centred number strip says it), "Teil
  abschließen" only on the LAST question once everything is answered (it replaces Weiter; the
  permanent submit row cost every screen ~52 px), and a `gap-1` strip so nine numbers hold one row
  at 360 px. **Desktop lays the two tiles side by side** (3/5 + 2/5, Schreiben mirrored) and exam
  chrome additionally hides the sidebar and the Feedback pill there, which overlapped the Weiter
  button; the header mark becomes a non-clickable `Logo`, since navigating away would end the run.
  Known limit, accepted: on 375/360-wide phones the reading pane can fall to ~2 lines for the
  tallest questions (it scrolls; the expand button reads full-screen). Giving it more would mean
  shrinking the question tile, which is the thing this guarantees.
- **Content gaps this exposed (PROJECT_REFERENCE backlog):** A2 has NO exam content anywhere (the
  A2 Niveau pill shows an honest empty state), and C1 Hören has a single audio text, so it tops up
  from B2.2. Both need an authoring wave before those levels feel native.
- **Verify live after merge:** run one full B2 exam end to end (Hören audio is device TTS; the
  Schreiben score needs the deployed function + migration).
- **Next, if the founder does not redirect:** the **queued writing-task quality audit** below is
  still the oldest open item. The exam's own next steps, in the order they would pay off: the A2
  and C1-Hören content waves (`PROJECT_REFERENCE` → CONTENT GAPS), then a Fortschritt tile reading
  `progress.mock_exams` (the data is synced but nothing plots it yet), then per-Teil exam history.
  Nothing is half-built: every part of the exam ships complete.


**Handoff after session 187 (2026-08-04): the exam polish round + the app-wide dark palette.**
Founder feedback on the shipped Prüfungsteil (7 numbered points across the session), answered with
ONE interactive preview and then implemented from their picks. **What shipped:**
- **Dark palette "N3 Slate", app-wide** (`src/index.css` `.dark` + `--wash-a`/`--wash-b` read by
  `bg-page`/`bg-mesh`): near-neutral greys, no coloured page radials in dark, blue only where it
  acts. Contrast steps are the founder-confirmed "K2" relationships (card/ground 1.38:1,
  edge/ground 3.03:1, nested-in-card 1.20:1). `pnpm check:contrast` green.
- **Corner scale "tighter"**: `--radius: 0.5rem` + tightened ± steps in `tailwind.config.ts`
  (card 10px, row 8px, pill 6px, `2xl` 14px). Affects every surface, on purpose.
- **The exam screen** (`src/features/exam/McParts.tsx`, rewritten): the question has no tile, one
  card per screen, content-tall blocks centred in the stage, the number strip in the bottom cluster
  with 16/12/16 px of air, drag-resize on both axes with arrow-key steps and a reset on every
  question change, fade-out on both scroll regions, `pb-safe-4`.
- **The exit** (`AppShell`): red `LogOut`, icon-only on a phone, icon + "Verlassen" from `sm` up.
- **The answered number** (`AnswerStrip`): `text-foreground` on the Himmelblau tint, not
  `text-accent-ink`.
**Verification:** a Playwright driver walked the real build over 225 in-exam screens (1440x900,
1024x768, 393x852, 375x667, 360x640 × Lesen + Hören × three fresh draws): 0 px page overflow
everywhere, question fully visible on every screen, no console errors, light and dark.
**Docs updated in the same PR:** CLAUDE.md (dark palette + corner law, and the English rule),
`docs/areas/BRAND.md` (tokens, radius scale), `docs/areas/PRAKTISCH-NAV.md` (exam anatomy, the
`max-h-full` geometry trap), `docs/DECISIONS.md` §s187, the `/design` skill (English previews, never
mark a recommendation, the new palette + corners).
**Next, if the founder does not redirect:** the queued writing-quality audit is still the oldest
open item, then the A2 / C1-Hören content waves, then a Fortschritt tile over `progress.mock_exams`
(synced but unplotted) and per-Teil exam history. Nothing from this session is half-built.

**Nothing is owed from s185b any more.** The founder verified `/admin → Launch` on 2026-08-04: it
shows the green **"Aufbewahrungs-Job (pg_cron) ist geplant"**, so pg_cron was available and all three
weekly purges (guests 90 d · transform cache 60 d · learner text 730 d) really are scheduled, not
merely installed. The same screenshot confirms the Consent-Version card green and **im Gleichschritt
at 2026-08-04**, so the legal-date fix is live too.

**The content audit is closed except P10.** s185a shipped P9, P7, P5, P4 and P3; the per-item record
is in `docs/reports/CONTENT_AUDIT_2026-07-30.md` §5. Three smaller follow-ups sit behind it:
**P10** itself (0.4% human-verified; the audit's plan is the ~320 highest-traffic items first), the
**12 verified nouns** that need a `numerus` at their next review (`pnpm lint:content` names them
every run, by design, see `docs/DECISIONS.md` §s185), and a live check of the **Notizen step** in a
real listening exercise, which is the one thing that could only be verified by rendering.

**Then start with the queued quality audit (founder, s181, not started):** a thorough analysis of
**writing-task quality and filter fit**, with research from reliable sources. s181 proved COVERAGE
(717 tasks, gated); nobody has verified that a task tagged B1 reads as B1, that its Leitpunkte are
answerable in the word target, or that the Branche framing convinces someone who works in that
industry. Deliverable: a report in `docs/reports/` with a prioritised fix list, like the s178 content
audit. **Full scope, the parked exam-source items, and the locked Niveau mix (B1 307 / B2 302 /
C1 108, do not rebalance) are all in `docs/PROJECT_REFERENCE.md` → "QUEUED (founder, s181)".**

**Handoff after session 188 (2026-08-04): the Modelltest hub (branch `claude/page-redesign-7md2zi`).**
Founder: "re-do this page" (a dark screenshot of `/exam`), then "go with B" plus two amendments.
**What shipped** (`src/features/exam/ExamHub.tsx`, rewritten; `partMeta.ts` gained a solid `bar`
colour per Teil):
- **The run leads.** One band: eyebrow + countdown, the four Teile as a connected timeline (one
  absolutely-positioned line inset to the first and last tile centre, masked by a `border-surface`
  ring), then the CTA on its own divided row. This is what removes the s186 duplication of
  "4 Teile · 52 Min" above four cards each printing their own minutes.
- **Results live only in Verlauf** (founder amendment): the last 5 runs for the selected Niveau, a
  row being date · four result segments in exam order · total badge · chevron, whose disclosure
  holds the four per-Teil percentages. A single-part run leaves three tracks empty and prints "–".
- **"Modelltest"** replaces "Prüfungssimulation" as the page name (founder amendment), one word,
  and the `/anwenden` entry card + the nav zone description were renamed with it. Content ids and
  provenance labels are untouched.
- **No HubHero** (founder amendment): `h1` + the Niveau sliding-pill switcher (`useSlidingPill`) on
  one line, full width on a phone.
- **The countdown** (`settings.examDate`) moved onto this page and retires itself once the date has
  passed. The A2 zero state states itself once per control; the page-level sentence was dropped.
**Verification:** the real build driven over a CDP script (no Playwright in this repo) at 1280x900,
390x844 and 360x640, light + dark, A2 and B2, Verlauf open and closed: 0 px horizontal overflow, no
console errors, the hub scrolls ~220 px on a phone, which is what a menu does.
**Follow-up in the documentation pass:** the rename had one leftover the redesign did not touch.
The Sprechen bank's exam sets are titled "Prüfungssimulation: <Aufgabe>" and are CONTENT (provenance
rows, human-verified stamps), so they were not rewritten; `examSetTitle()` in
`features/exam/partMeta.ts` strips the prefix at every render instead, which the mock-exam runner
had been doing inline and the Sprechen runner had not been doing at all. Verified in the real app:
the runner header now reads "Sicherheitsmängel beheben".
**Docs updated:** CLAUDE.md (route name + the one-place-per-result law),
`docs/areas/PRAKTISCH-NAV.md` (the hub anatomy), `docs/DECISIONS.md` §s188, the `/design` skill (the
Modelltest anchor), this file and the prompt log. The preview stays in
`preview/exam-hub-redesign.html` as the record of the round.
**Next, if the founder does not redirect:** unchanged from s187 (the queued writing-quality audit,
then the A2 / C1-Hören content waves, then a Fortschritt tile over `progress.mock_exams`). One item
this session made cheaper: per-Teil exam history now has a real surface to grow into.

**Nothing is owed from s185b any more.** The founder verified `/admin → Launch` on 2026-08-04: it
shows the green **"Aufbewahrungs-Job (pg_cron) ist geplant"**, so pg_cron was available and all three
weekly purges (guests 90 d · transform cache 60 d · learner text 730 d) really are scheduled, not
merely installed. The same screenshot confirms the Consent-Version card green and **im Gleichschritt
at 2026-08-04**, so the legal-date fix is live too.

**The content audit is closed except P10.** s185a shipped P9, P7, P5, P4 and P3; the per-item record
is in `docs/reports/CONTENT_AUDIT_2026-07-30.md` §5. Three smaller follow-ups sit behind it:
**P10** itself (0.4% human-verified; the audit's plan is the ~320 highest-traffic items first), the
**12 verified nouns** that need a `numerus` at their next review (`pnpm lint:content` names them
every run, by design, see `docs/DECISIONS.md` §s185), and a live check of the **Notizen step** in a
real listening exercise, which is the one thing that could only be verified by rendering.

**Then start with the queued quality audit (founder, s181, not started):** a thorough analysis of
**writing-task quality and filter fit**, with research from reliable sources. s181 proved COVERAGE
(717 tasks, gated); nobody has verified that a task tagged B1 reads as B1, that its Leitpunkte are
answerable in the word target, or that the Branche framing convinces someone who works in that
industry. Deliverable: a report in `docs/reports/` with a prioritised fix list, like the s178 content
audit. **Full scope, the parked exam-source items, and the locked Niveau mix (B1 307 / B2 302 /
C1 108, do not rebalance) are all in `docs/PROJECT_REFERENCE.md` → "QUEUED (founder, s181)".**


**Handoff after session 190 (2026-08-05): six Bibliothek defects after the internal-scroll change
(branch `claude/card-transparency-go-to-top-jygye9`).**
Seven founder prompts, every one a defect report with a screenshot, against what PR #800 shipped the
day before. No preview round: these were bugs in an already-approved surface, so each was reproduced
in headless Chromium against the dev server, measured, fixed and re-measured.
**What shipped:**
- **`useScrollDirection(root)` + `ScrollTopButton root=`** (`features/shared/browseScroll.tsx`): the
  hook reads whichever element actually scrolls, and the column only counts while it overflows,
  which is false below `lg`. This is what brings the desktop go-to-top button back. Placement
  unchanged and re-measured against the founder's s189 rule: button left edge 1000 px = the rail's
  left edge, Feedback pill right edge 1256 px = the rail's right edge.
- **`useEdgeFade` + `.mask-fade-y|-top|-bottom`**: the scroll column fades at whichever vertical edge
  still has content, instead of slicing a card in half. A mask rather than an overlay, because the
  page ground is a gradient and a flat overlay would band in light and grey out in dark.
- **`BROWSE_TOOLBAR_BUTTON_ON`**: the ON state for the search and bookmark toggles, applied after
  the base class so the fill wins the tailwind-merge. They were white-on-white, i.e. invisible.
- **`lg:self-start` + `lg:max-h-[calc(100%-3.5rem)]` on all four rails**: content-sized, capped
  against the stage, and clear of the floating bottom line.
- **`src/lib/inputMode.ts` (new) + one rule in `index.css`**: the focus ring is keyboard-only.
- **Redemittel card parity**: front headline capped at 3 lines, every BACK part at 2, each with a
  `title`. 272 → 188 px against Kollokationen's 195.
**Audit the founder asked for (prompt 6):** every s189 feedback item re-verified in the browser, not
read off the log. Live and correct: the Redemittel **Beispiel** column, the horizontal-scroll fades,
internal scroll with the page unscrollable on all four tabs, the 30 px toolbar row, the
Feedback/go-to-top docking, the Wörter three-column grid. The only item still open from that list
was the card-height parity, now closed.
**Verification:** 1280x900 across all four tabs (rail open + collapsed, search open, mid-scroll) and
390x844 for the mobile fallback, where the page still scrolls, the button stays centred above the
Üben bar and no mask applies.
**Next, if the founder does not redirect:** unchanged from s188 below. One thing to watch: the
`3.5rem` reserve on the rail is tied to the floating bottom line's geometry, so if that cluster ever
moves, the reserve moves with it.

## Archived from PROJECT_STATUS.md in session 193 (2026-08-05)

Prior s189 (2026-08-05): **the Prüfung zone became ONE page.** Founder prompt:
"this page should be redone. insert a toggle in place of the current header, similar to Bibliothek
... Module wide practice and model test as the two options". The three-card `/anwenden` hub and the
`/exam` Modelltest page folded into a single page whose header IS a two-segment sliding-pill
switcher: **Module üben** | **Modelltest**. `/exam` redirects into it.
Two preview rounds settled it (`preview/pruefung-hub-redesign.html`, `-r2`); the founder picked
layout **A "Kompakt"**, the **Modern** module marks in **Rezeptiv / Produktiv** colours, and kept
the zone name **Prüfung**.
**Module üben** is the four modules as identical cards, and the free Schreib- and Sprechtrainer
merged INTO them (founder pick "idea 3"): **Mit Zeit / Ohne Zeit** is one switch beside Niveau,
**resting on Ohne Zeit**, so Schreiben ohne Zeit opens `/writing`, Sprechen ohne Zeit
`/simulation`, and Lesen/Hören run the same drill `untimed` (no tick, no timer pill, never
auto-handed in). The separate "Freies Üben" block is gone with it. "Einzeln üben" is gone from the
Modelltest tab: it IS this tab now.
**Modelltest** is the run band plus Verlauf and nothing else. Verlauf rests OPEN, leading with three
centred figures (Letzter · Bester · Bestanden), and the timeline connector is now one segment per
gap drawn BETWEEN the tiles (founder: "should not overlap the icons").
**The session also set an app-wide law: the expand rule.** A page rests at zero scroll
(`.h-page-stage`); expanding a tile releases that cap; the expanded tile is never taller than one
screen (`.max-h-panel-stage`) so its own borders stay visible; ONE inner region scrolls and hands
the scroll on to the page at its top; and `useStagePanel` scrolls it into view with scroll margins
for the header and bottom bar. Verified by driving the real build over CDP at 393x852: at rest
`scrollHeight === innerHeight`; with 20 runs expanded the tile measures 692 px inside an 852 px
viewport, top 80 / bottom 772 (the bar starts at 789), and its list scrolls 859/547 internally.
Gates green: typecheck · lint 0 errors · 551 tests · build · check:bundle 125.8 kB · check:contrast.
Shipped as **PR #799**, squash-merged into `main`, then **PR #800** carried the follow-up run:
the filter rails took the Schreiben rail's Himmelblau fill (superseding the grey tile of s104), the
four hand-copied Bibliothek action bars became ONE shared `FloatingActionCluster` with Schreiben,
text fields lost the global focus ring (the caret is the indicator; buttons keep theirs), and the
Bibliothek desktop scrolls INSIDE its content column instead of scrolling the page, which needed
`usePagedList` made root-aware first.
One question is deliberately open from that session: `FilterRail`'s mobile panel keeps its own
`max-h-[45dvh]` cap instead of the new one-screen `max-h-panel-stage`; ask the founder before
changing an approved surface.
Prior s188: the Prüfungssimulation hub was re-done and renamed **Modelltest** (founder pick
"Prüfungstag"): the page led with the run band, then "Einzeln üben", then Verlauf as the one place
a result is shown. s189 kept the band, the one-place rule and the countdown, and moved the rest.
Prior s187: dark mode became near-neutral ("N3 Slate", ground `220 15% 4%`, cards `220 10% 17%`,
page radials off in dark), the corner scale tightened (`--radius` 0.5rem → card 10px, row 8px,
pill 6px), and the running Prüfungsteil got its polish round (no tile on the question, drag-resizable
blocks, the number strip beside Zurück/Weiter, a red exit), verified over 225 in-exam screens.
Prior s186: the Prüfungssimulation became a real four-part mock exam (Lesen, Hören, Schreiben,
Sprechen) in four PRs (#791-#794), with per-Teil timers, an answer-sheet strip, the one-viewport
exam stage and a result screen with a 60 % pass line.
Prior s185: **the content-audit backlog closed except P10** (P9 noun facts, P7 re-levelling, P5
grammar drills, P4 scenarios, P3 exam-length texts + the Notizen step), and a parallel **database
architecture audit** shipped four fixes (#786, #787): no silent cloud write, pg_cron retention,
400-day day maps, `pnpm lint:migrations`. Detail in `docs/reports/CONTENT_AUDIT_2026-07-30.md` §5
and `docs/reports/db-architecture-audit-2026-08-04.md`; the still-open items are listed under
"Resume here" below.
Prior s184: **Every filter and Aufgabe rail now carries the
Lebensbereich pills, Berufsleben · Alltag, directly below Branche** (Wörter, Kollokationen,
Redemittel, Schreiben Kurz/Lang; Grammatik is excluded on purpose, its topics carry no Thema). One
shared `LifeAreaPills` control, `?area=` in the URL, and the pill narrows the Thema dropdown and
drops a Thema from the other area so the three controls can never disagree.
Prior s183 and older (Prüfung icon language, the s182 audit items and the five-slot nav, the
Schreiben Aufgabe backlog, hard filters, the security audit, liveWork): condensed away on purpose,
per the doc-hygiene rule below. Read them in `docs/archive/status-log/` by ISO week.
`docs/plans/SCHREIBEN-OVERHAUL.md` carries the writing-content roadmap.
`.github/workflows/supabase.yml` deploys Edge Functions on merge, so backend changes no longer need
a CLI. Product name: **Genauly** (`genauly.de`)._

This is the **lean, living** status doc: current state plus the two most recent session handoffs.
**Start at the `## Resume here (next session)` section at the end.** Companion files:
- **`docs/PROJECT_FOUNDATION.md`** — the stable technical baseline that rarely changes: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra, and completed founder
  action items. Read it when you need the "what's built and how" detail that used to sit here.
- **`docs/PROJECT_REFERENCE.md`** — stable reference: the founder backlog, product-evaluation
  findings, per-session model guidance, and reusable research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked UX decisions.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only session-log history,
  chunked by ISO week under `docs/archive/status-log/`.
- **`../CLAUDE.md`** — the lean always-on operating rules (restructured s155, ~180 lines); deep
  per-area detail lives in **`docs/areas/`** (COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN,
  PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN, COMPONENTS) + the `/design` and `/content` skills.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

**Handoff after session 191 (2026-08-05): the Prüfung module tiles went flat (branch
`claude/remove-tile-gradient-4fcowe`).**
Two founder prompts against a screenshot of `/anwenden`, Module üben.
- **"Get rid of the colored gradient from the tiles here."** The cards carried TWO coloured
  gradients from s190: the hue radial across the whole card (`.mod-wash-*`) and a gradient fill on
  the mark tile. Both are gone. The wash span, the `wash` field on `PART_META` and the entire
  `.mod-wash-*` block in `index.css` are deleted, and `tile` is now a flat tint
  (`bg-emerald-500/15 dark:bg-emerald-400/20`, and the teal / primary / sky pairs). The colour still
  carries the receptive-vs-productive fact, it just carries it evenly. The badge corner stays
  reserved by the card's bottom padding, so the clock switch still cannot move a card edge.
- **"Increase the space below the toggle buttons slightly."** The hub's outer column went
  `gap-4 sm:gap-5` → `gap-6 sm:gap-7`. That gap sits ONLY between the header block (switcher + scope
  row) and the tab content, so the toggles and the tiles now read as two sections while the gaps
  inside each block are untouched.
**Verified in the real build**, not in a mockup: a rebuilt CDP driver (Node 22's built-in
`WebSocket`, no new deps) reports zero page scroll, zero badge/text overlap and no `background-image`
inside `main` at 360x640, 393x852 light and dark, and 1280x900, in BOTH clock states. Gates green:
build · typecheck · lint 0 errors (77 warnings = baseline) · 558 tests · check:bundle · contrast.
- **"The time badges [are] overlapping on the text ... just remove the text and just keep the
  badges."** A real bug, and the reserve was the cause: the badge is 24px tall and sits 12px off the
  bottom, i.e. 36px, against a 28px `pb-[1.75rem]` reserve, so with the clock ON it sat across the
  description on all four cards. The description line is gone (`FREE_DESC` with it; `PART_META.desc`
  stays for the Anleitung pages). What remains is mark, arrow, title, badge. The one line that can
  still appear is the honest empty state, and it only shows on a card that has no badge.
Shipped as **PR #803** (`f0fa0b7`, the first two) and **PR #805** (`68b500c`, the badge overlap),
both squash-merged into `main`; the founder verifies the live result.
**Nothing is left open in this zone.** The CDP driver lives in the session scratchpad, not the repo,
so it is rebuilt each time a surface has to be checked in the real app rather than in a mockup.

**Handoff after session 195 (2026-08-06): the Prüfung zone got ONE frame
(branch `claude/prufung-hub-design-consistency-193qrh`).**
Two founder prompts. The first asked for a review of the zone's inconsistent back buttons and empty
space; the second picked from the options it produced.
- **Prompt 1, the review.** Six findings, all read from the code: FOUR back-button treatments in
  THREE positions, the word `Zurück` on two controls of one screen, two screens with no exit at
  all (desktop Schreiben, a running practice conversation), FOUR content widths, three header
  languages, and both hub tabs holding a full-viewport frame with nothing to fill it. Delivered as
  `preview/pruefung-frame.html` (artifact
  <https://claude.ai/code/artifact/b04df435-61f7-4d9c-ab82-ba28b50a385e>) with a five-rule spine
  plus A/B/C for the exit and 1/2 for the empty space.
- **Prompt 2, the pick, and it is now law.** "B for phone, C for desktop, but Zurück (untimed) and
  the red Verlassen (timed) should ALWAYS be top right"; the confirm should appear only when there
  is unsaved progress; the mobile Aufgabe toggle should share the switcher's row as just "Aufgabe";
  option A's header row should be on every mobile screen; option 2 for the empty space.
  **Built exactly that.** `useSessionStore.zoneExit` replaces `examExit`/`examUntimed` and covers
  `/anwenden`, `/exam`, `/writing` and `/simulation`; `examStage` is now a separate flag so the
  trainers keep their nav. `hasProgress(run)` gates the confirm (it counts a completed part and
  `partIx > 0` too, because Teil Sprechen leaves nothing in `answers`), the Schreibtrainer asks
  nothing because `draftAutosave` keeps its text, and a started conversation always asks. The
  question stepper is a chevron now: desktop puts the pair beside the number strip (option C) and
  keeps ONE primary in the footer, a phone keeps the back step in the footer because nine numbers
  plus two buttons do not fit 360px. New `features/pruefung/ModuleHeader.tsx` (mobile module row,
  and the `RunBar` wears the same mark) and `features/pruefung/LevelSelect.tsx` (the one Niveau
  control, adopted by the Sprechtrainer in place of its pill row). `GuidedWritingTrainer` portals
  its "Aufgabe" toggle into a slot `WritingHub` owns. The Anleitung is a two-column ticket, the
  Ergebnis is two columns, the Sprechtrainer list moved to the zone's `max-w-4xl`, and both hub
  Verlauf cards ship in an empty state that fills the frame.
**Verified in the real build, not in a mockup** (CDP driver, three viewports, clean store per
screen): the exit sits at the identical top-right coordinate on all 7 zone screens at 360x640,
393x852 and 1280x900, reads "Prüfung verlassen" only in a timed run, and is absent on the hub,
which is the zone's home. Zero page scroll and zero horizontal overflow everywhere except
Kurz at 360x640, which rests at 99px (down from 134px shipped; the field is at its `HARD_MIN`
floor there, the documented give-up case) and the Sprechtrainer LIST, which is a browse list.
Gates green: build · typecheck · lint 0 errors (75 warnings, down from 77) · 610 tests ·
check:bundle 127.1 kB of 400 · check:contrast · lint:content.
Shipped as **PR #811**, squash-merged into `main`; the founder verifies the live result.
**Resume here:** nothing is open. Two judgement calls to confirm if the founder disagrees: the
module row is `lg:hidden` (they said "in mobile view"), and Kurz at 360x640 still rests ~99px
scrolled, which drops to 0 if that row goes on Kurz/Lang.

## Session 196 log

Founder: "sprechen ohne zeit page tiles are all a bunch
tiles as list ... it should somehow look like schreiben with a filter rail ... same should apply for
lesen and horen ... the evaluation couldn't be done ... and the verlauf section isn't updated with
this progress. it's basically lost."
**One rail, not four.** `ScopeSelect` and the "Aufgabe wählen" tile moved out of `WritingRail` into
`features/shared/ScopeRail.tsx` verbatim, and `features/pruefung/ModulePicker.tsx` is the frame all
four modules share (desktop content column plus a sticky 16rem rail; on a phone the same rail behind
an **Aufgabe** toggle in the module row). Schreiben renders through the extracted pieces unchanged.
**Sprechen** is now that page: an **Üben | Verlauf** switcher as the header, a rail carrying Niveau,
Lebensbereich and Thema (a Scenario carries no Branche or Unterthema, so those would be dead chrome),
and the scenario grid. The Einsteiger/Mittelstufe/Fortgeschritten SECTIONS were a Niveau filter in a
heading's clothes, so the band moved onto each card as a badge.
**Lesen and Hören had no Ohne-Zeit shape at all**: the card composed a random drill and opened it, so
the clock was the only difference from Mit Zeit and no text could ever be chosen. `/lesen` and
`/hoeren` list what the scope serves and start the picked text as a single-text untimed run through
the SAME `LesenPart`/`HoerenPart` (`composeMockExam` takes `MockExamPicks`, filtered against the
bank), scored the same way and recorded in the same Module-üben Verlauf. The old draw survives as
**Zufällige Auswahl**.
**The evaluation bug had three layers.** `converse` ran BOTH modes on 1400 output tokens, and a
debrief has to echo back every learner sentence corrected plus two tips and the verdict arrays as one
JSON object, so a twelve-turn conversation truncated mid-JSON and the parse failed (turns get 500
now, the debrief 4096, which is what every other Edge Function here already used). `cascade` returned
the first leg producing ANY text, so a truncated Gemini answer was accepted and Claude was never
asked, and the Gemini leg lacked `responseMimeType: "application/json"` here alone; `cascade` now
takes an `accept` predicate, so a leg whose output the caller cannot use is a leg that FAILED. And
`onFinished` fired only on a successful debrief, so an unreachable grader also erased the scenario
completion, the XP and the streak day; it fires once per conversation either way, and the failure
screen offers **Erneut versuchen**, which costs no allowance (the allowance counts conversation ROWS
and the row already exists).
**The Verlauf really was missing.** `speaking_conversations` has recorded every conversation since
s193 and nothing ever read it back, so the free Sprechtrainer was the one trainer whose work vanished
on leaving the debrief. `SprechenHistory` is that half, built from Schreiben's row and
`correction.tsx` rather than a new one; a conversation whose debrief never arrived still appears,
with its transcript and an "Ohne Bewertung" badge.
Gates: typecheck · lint 0 errors (76 warnings) · **624 tests** (up from 610) · build ·
check:bundle 127.9 kB · lint:content · lint:migrations.
**Prompt 2 answered, not built: a learner-facing KI-usage indicator.** Founder: "is it possible to
have a KI usage similar to how claude code shows wherever a feature uses ai is in the app?" Yes, and
`lib/aiAllowance.ts` already does the hard half (server-authoritative `{limit, remaining, known}`,
rendered as "Heute noch 7 von 10" in four places). Four gaps: nothing shows all of it at once
(Settings has no AI section); `transform-sentence` (Fokus's Umformung, limits 30/day and 8 burst) is
not in `AiMode` at all, so that wall arrives unannounced; the KI marker appears on RESULTS, after the
unit is spent, and `Sparkles` is not reserved for AI (Quiz, empty states and onboarding use it), so
there is no AI icon to build on; and the monthly ceilings are invisible. Pushed back on showing
money: Claude Code shows cost because the user pays, Genauly's learners do not.
**Founder picked: learner-facing, scope A + B.** (A) fill the missing counts so no AI feature is
silent, the Umformung especially. (B) ONE reserved KI chip with its count on every entry point that
spends a unit. The (C) "KI heute" overview panel in Settings was NOT taken. The founder-facing spend
view already part-exists in `AdminOverview`/`AdminSystem` ("KI-Budget") if that is ever wanted
instead.
**The deploy round.** The merge shipped the Edge Functions fine (`converse` live at once) but
**Deploy site to GitHub Pages** went red on #818 and #819, so the frontend lagged ~2 h. Root cause,
finally established from run #820's full log: **a Pages deployment here takes longer than the 600 s
the action allows**, so it self-cancels on timeout, and the leftover occasionally refuses the next
merge. The retry chain is what rescued it (attempt 2 succeeded), so the fix is to **raise `timeout`
(~30 min) and KEEP the retry**. This session wrote down two confident WRONG diagnoses first; both
are left visible in `DECISIONS.md` §s196 as corrections, because generalising one run into a law is
how this got misdiagnosed three sessions running.
**Resume here:** start prompt 2's scope A + B. B is a new shared component, so it owes the
preview-first round (2-4 named variants, English, `preview/`, artifact, pick, then implement); the
`design` skill was loaded and the session ended before the previews. A is mechanical: add
`transform` to `AiMode` in `lib/aiAllowance.ts` (count whatever `transform-sentence` writes) and
wire `AllowanceNote` where it is missing. **Also a five-minute win with its rationale already
written: raise the `timeout` input on `actions/deploy-pages` in `pages.yml`** (it is a CI change, so
it was deliberately left for its own review rather than riding along with a docs correction). Also
open, from earlier sessions and untouched here: the Prüfung hub still loads ~825 kB of content banks
because `engine/exam` imports them (the real fix is precomputing availability at build time like
`frequency.ts`); no exam set is `anruf` shaped; the authored dialogue `nodes` graphs are dead but not
retired; and CLAUDE.md sits at ~372 lines against its ~350 budget, which the next docs pass should
bring down._

_Also in s196, from a parallel session (merged first, PR #813): **the Prüfung hub's desktop
page-scroll regression and its page header.** **Four founder-reported problems in the hub
shipped by s195, all fixed in one pass.** Founder: a screenshot of `/anwenden` on desktop showing
the Verlauf tile scrolled past the fold, the four module cards reading as "empty" wide strips, the
arrow and minutes badge in the wrong corners, and the generic "Guten Morgen" greeting sitting
where a page title belongs.
**Root cause of the scroll:** `h-page-stage` (the shared stage class every trainer that wants zero
page scroll opts into) goes `height: auto` from `lg` up on the assumption desktop has "no shortage
of room" — true when it was written, false once this hub's Verlauf card grew tall enough to
overflow a real laptop height (900px minus browser chrome is often 750-800px usable). New
`.h-pruefung-stage` keeps a real ceiling at every width (mobile/sm unchanged, `lg` borrows
`h-browse-stage`'s desktop formula); verified scroll-free at 1440×760, 1440×900, 1024×850 and
390×844, both tabs, light and dark.
**The rest:** the module grid is now capped narrower (`max-w-[26rem]`/`[30rem]`) so each card reads
closer to square; the minutes badge moved beside the icon (its presence never changes the row's
height either way) and the arrow moved to the bottom-right corner it vacated; the Verlauf card's
bars/chart/padding were trimmed down (the "unnecessarily big" tile). **The header title**: from
`lg` up, `AppShell` now shows a big left-aligned "Prüfung" next to the Module üben/Modelltest
switcher in the slot the generic greeting used to fill; below `lg` the hub keeps its own switcher,
unchanged. The switcher was split into `features/pruefung/hubSwitcher.tsx` so `AppShell` (mounted
on every route) never has to import `PruefungHub.tsx` and, behind it, the exam engine's content
banks — the eager-bundle invariant would break otherwise. `usePruefungTab` reads/writes the same
`?tab=` param both switcher copies share, so they can never disagree.
Gates: typecheck · lint 0 errors (unchanged warning count) · 610 tests (unchanged) · build ·
check:bundle 129.0 kB of 400 · check:contrast.
**The deploy itself hit a genuine GitHub Pages platform stall after the merge**, unrelated to the
code: `pages.yml`'s three built-in retries each sat in the Pages API's own `deployment_queued`
state for its full 10-minute timeout and all three failed the same way, so run #817 concluded
`failure` even though the `build` job (typecheck/build/artifact upload) had already succeeded.
A manual re-run of just the failed `deploy` job succeeded on its first internal attempt ~47 minutes
later once the platform recovered; nothing about the app or the workflow needed changing. Founder
also asked whether a same-day parallel session (PR #812, still open, unmerged) could have caused
it: ruled out, since `pages.yml` only fires on a push to `main` and there was exactly one such push
in that window (this PR's). Worth a flag for whoever picks up PR #812 next: because this PR merged
first, #812 showed `mergeable_state: "dirty"` against `main` (both touched overlapping
Prüfung-area docs). RESOLVED in the #812 session by merging `main` in twice and keeping BOTH
sessions' facts in every conflicted doc rather than picking a side.
**Resume here:** nothing is open. The greeting-to-title swap is scoped to `/anwenden` only, per the
founder's examples ("Prüfung or Bibliothek") reading as illustrative rather than a request to
retitle every route today; say the word and the same pattern (via `navItems` labels) generalises
easily. Site confirmed live and verified by the founder at `genauly.de`.

Prior s195 (2026-08-06): **The Prüfung zone was audited end to end and every

finding was fixed.** Founder: "do a thorough audit and analysis of the prufung hub", then "fix all
the issue". The report (`docs/reports/pruefung-audit-2026-08-05.md`, 35 ranked findings) is kept in
full as the record; `docs/areas/PRUEFUNG.md` is the new current-state law for the zone.
**Three patterns explained almost all of it:** a retired feature left its readers behind, Ohne Zeit
was bolted onto a flow whose only exit was the clock, and the server enforced limits the client
never displayed.
**The six blocking ones.** An untimed Lesen or Hören module could not be finished with a single
answer blank, and Ohne Zeit is where a learner lands, so the default path dead-ended and abandoning
lost the work; "Teil abschließen" is now unconditional on the last question and blanks cost a
confirm naming the count. Nothing had written `examsDone` since the branching runner retired in
s186, so Fortschritt reported "noch keine Simulation" and "0 Prüfungen" however many Modelltests a
learner sat; it reads `mockExams` now through a bank-free `isFullMockRun`, and `examsDone` is
retired (kept and synced, because it is real pre-s186 history). The exam clock counted ticks, so a
background tab or a reload paused it; it measures a DEADLINE now and re-syncs on
`visibilitychange`. The 14-turn speaking ceiling was enforced only server-side while
`canSpeak`/`turnsLeft`/`conversationOver` sat unread, so a learner could talk into turns the grader
never saw; the client enforces it, counts down from three, and rolls a failed turn back off the
transcript. Teil Sprechen offered "Nochmal", so a candidate could re-sit it (gone in exam mode).
And `examBrief` hard-coded `level: "B2.1"`, so every Modelltest's speaking part was pitched and
graded at B2.1 whatever Niveau was chosen; it takes `EXAM_BAND[plan.level]` now.
**Feature gaps closed:** the exam's Schreiben correction was computed and never rendered (it is
`correction.tsx`'s fifth caller now); the brief card's allowance-aware disabled state was dead code
(wired); one Modelltest silently spends half the daily writing AND speaking budget (the run band
says so and warns when either is out); the Sprechtrainer had no way back to the hub and dropped the
Niveau on the way in (both fixed, and its scope lives in the URL); Hören could consume both plays
and produce silence (TTS guard, a text fallback, no double-tap, playback stops when the Ansage
changes); the recogniser ending on its own wiped the transcript (it re-opens and keeps it); and
spoken transcripts were missing from the GDPR export.
**Content, not just code:** Durchsagen were 38% of the B2 *reading* pool (excluded now, pools stay
9/16/5); a C1 Hören was mostly B2.2 and could never carry the Notizen task its own Anleitung
promised (two C1 audio texts authored, one with the first C1 Notizen sheet, so C1 no longer tops up
at all); and every Alltag exam set hung off a level-1 scenario, so a B2 or C1 Modelltest could only
ever serve a WORKPLACE speaking task (six authored across Behörde, Wohnen, Arzt and Digitales,
three at B2 and three at C1). The zone also awarded almost no XP: a graded conversation and a
single module sitting both paid zero. Both pay now.
Gates: typecheck · lint 0 errors (75 warnings, unchanged) · **610 tests** (up from 592) · build ·
check:bundle 127.1 kB · check:contrast · lint:content · lint:migrations.
**Resume here:** nothing from the audit is left open. The one item deliberately NOT taken further is
the second half of P28: the hub still loads ~825 kB of content banks because `engine/exam` imports
them, and the per-render re-scan is fixed (`useMemo`) but the load is not. The real fix is
precomputing availability at build time like `frequency.ts`, which is a generator job. Still open
from s193: no exam set is `anruf` shaped, and the authored `nodes` graphs are dead but not retired._

**Handoff after session 197 (2026-08-06): the Prüfung hub got ONE column and lost the s196
header title (branch `claude/page-header-alignment-glqts5`).**
Founder, with the same `/anwenden` screenshot: the s196 change "created this funny looking page ...
It is looking ridiculous at the moment", and asked for previews of how the page should look overall
before anything was built.
- **The diagnosis.** s196 read their "aligned to left vertically with the toggle buttons" as the APP
  header's left gutter, which is a different left edge from every control it was meant to line up
  with. Underneath, the page nested THREE separately centred widths (`lg:max-w-4xl` panel column,
  `max-w-[30rem]` module grid, `max-w-[26rem]` Stärkeprofil), so the tiles started ~220px right of
  the title and a narrow tile island floated over a full-width Verlauf card.
- **Round 1, previews only** (`preview/pruefung-header-align.html`, generator beside it, artifact
  <https://claude.ai/code/artifact/77b2bdcf-aa2d-431d-a45a-cd6ea9d16c49>): the diagnosis at today's
  real measurements, then A (title inside the page), B (title stays in the header, the page moves to
  its left edge) and C (no title, the switcher as the page header). Live Theme / Column width /
  Alignment-guide switches, light and dark, a desktop and a phone frame each.
- **Founder picked "C, medium".** Built exactly that: `AppShell` no longer renders a title or a
  second switcher copy (its greeting slot stays EMPTY on this route, which is the part of s196 that
  survives), the hub's switcher is its header at every width, and ONE `HUB_COL` (`max-w-[40rem]`)
  carries the switcher row, the scope row, the module grid and the Verlauf card. The grid and the
  Stärkeprofil lost their own caps: the column was measured from the TILES instead, so they keep the
  shape s196 asked for without a cap that breaks the page's edges.
- **Three details the narrower card forced:** the Verlauf's split is proportional now
  (`1.15fr / 1px / 1fr`, not a fixed 26rem half); its four profile labels put the mark ABOVE the
  name at every width (side by side, "Schreiben" pushed through the divider into the list); and the
  practice row uses one padding and one gap at every width, because at `sm:gap-4 lg:px-6` it had
  exactly 0px spare and the score badge wrapped its "%" while the module name truncated.
- **Empty Verlauf.** The Stärkeprofil columns are half height while empty (`h-6 sm:h-8`), with a
  one-line caption: at full height four grey slabs at "–" read as a failed render.
**Verified in the real built app** (Playwright over the global Chromium, seeded store, not a
mockup): at 1440×900, 1440×760, 1024×850, 1023×850, 390×844 and 360×640, both tabs, empty / practice
/ full history, the panel, the module grid and the Verlauf card report the SAME left edge and the
same width at every size. Zero resting page scroll and zero horizontal overflow, except two bands
that scroll on `main` too and were measured before and after: 1023×850 rests at 54px (unchanged) and
360×640 at 43px (63px before this change).
Gates: typecheck · lint 0 errors (77 warnings) · 624 tests · build · check:bundle 127.9 kB of 400
(down from 129.0: AppShell dropped its `hubSwitcher` import) · check:contrast.
Shipped as **PR #817**, squash-merged into `main` as `a2ad467`.
- **CI never ran, so every gate was run locally instead.** GitHub Actions scheduled nothing for this
  repo across the whole window: no check registered on PR #817, no `Validate content` run was
  created for the branch, and the `Validate content` run for the previous merge (#816, on `main`)
  was **cancelled after 15 minutes without ever starting**. Before merging, `validate.yml`'s full
  list was run here in its own order (`lint:content` · `lint:migrations` · `check:contrast` ·
  `verify:facts` · `test:srs` · `test:pronounce` · `lint` · `test:unit`), all green. Note
  `verify:facts` rewrites `docs/reports/verify-facts-report.json` with today's date every run; that
  timestamp-only diff was reverted, not committed.
- **The Pages deploy needed the documented workaround.** #816's deploy job self-cancelled at exactly
  15 minutes (`build` green in 60 s, `deploy` 16:24:20 → 16:39:26) — the 600 s timeout diagnosed in
  s196 — and its leftover is the likeliest reason no deploy run was created for this merge at all.
  Dispatched `pages.yml` on `main` manually; it built `a2ad467` and **succeeded** (run
  31128920435), so the change is live.
**Resume here:** three known-open things, none of them blocking.
1. The two pre-existing resting scrolls above (1023×850 at 54px, 360×640 at 43px). Both come from
   the Verlauf card being `flex-none` at rest, so it cannot give room back when the stage is short;
   fixing it means letting the collapsed list scroll inside the card, which touches the s195/s196
   Verlauf behaviour and was left for the founder to ask for rather than assumed.
2. The Modelltest tab's EMPTY Verlauf is a tall card with a small empty state in it (the s195 "fills
   the frame" rule), and the narrower s197 column makes that more visible. Offered, not changed.
3. **`pages.yml`'s `timeout` is still 600 s** and has now cost three sessions. The fix agreed in
   s196 (raise to ~30 min, keep the 3-attempt retry) is a one-line change waiting for a go-ahead.

**Handoff after session 196 (2026-08-06): fixed a desktop scroll regression in the Prüfung hub
and gave it a real page header (branch `claude/prufung-hub-layout-ffco93`).**
Founder, from a desktop screenshot of `/anwenden`: the page scrolled, the bottom Verlauf tile
"looks unnecessarily big", the four module tiles "look empty" (too wide), the arrow and minutes
badge should swap corners, and the "Guten Morgen" greeting space should become a big left-aligned
header like the zone's own nav label, sitting next to the toggle buttons.
- **The scroll.** `h-page-stage` (every trainer's shared zero-scroll stage class) goes
  `height: auto` from `lg` up, on the assumption desktop has no shortage of room. This hub's
  Verlauf card had grown past that assumption: at a real laptop height (900px minus browser chrome
  is often 750-800px usable) the page overflowed. New `.h-pruefung-stage` (`src/index.css`) keeps
  the mobile/`sm` formula `h-page-stage` already had and borrows `h-browse-stage`'s desktop formula
  for `lg` instead of `auto`. Verified scroll-free at 1440×760, 1440×900, 1024×850 and 390×844,
  both tabs, light and dark, with and without run history.
- **The tiles.** `ModuleGrid`'s wrapper is now capped at `max-w-[26rem]`/`sm:max-w-[30rem]` instead
  of stretching to the column, so the four cards read closer to square. The minutes badge (Mit
  Zeit only) moved from the bottom-right corner to beside the icon in the top row; the arrow moved
  from beside the icon to the bottom-right corner it vacated. Card height no longer needs a
  clock-mode-driven reservation: the icon alone sets the top row's height either way, and the arrow
  shows whenever the module can open, in both clock states.
- **The Verlauf tile.** Trimmed the elements that carried most of its height for little
  information: the Stärkeprofil bars (`h-24`→`h-16` desktop), the run chart (`H=68`→`52`), the
  display score (`2.5rem`→`2rem`), and several paddings.
- **The header.** From `lg` up, `AppShell` shows a big left-aligned "Prüfung" `h1` beside the
  Module üben/Modelltest switcher, in the slot the generic greeting used to fill; below `lg` the
  hub keeps its own switcher unchanged. New `features/pruefung/hubSwitcher.tsx` holds the switcher,
  the `Tab` type and `usePruefungTab` (a `?tab=` reader/writer), so both switcher copies drive the
  same URL param and `AppShell` never has to import `PruefungHub.tsx` itself — that file pulls in
  `engine/exam` and the content banks behind it, which would break the keep-eager-code-light
  invariant (AppShell mounts on every route). Confirmed by clicking the header copy's tab buttons
  over CDP and reading the resulting URL/panel.
Gates: typecheck · lint 0 errors (unchanged warning count) · 610 tests (unchanged) · build ·
check:bundle 129.0 kB of 400 · check:contrast.
Shipped as **PR #813**, squash-merged into `main`.
- **Post-merge: the Pages deploy failed, twice looked like the code but wasn't.** Founder saw a red
  "Deploy site to GitHub Pages" run right after the merge and asked to check it. The `build` job
  (typecheck, `pnpm build`, artifact upload) was green; only the `deploy` job's calls into GitHub's
  Pages API failed, each of the workflow's 3 built-in retries independently stuck in
  `deployment_queued` for the full 10-minute timeout before aborting. A platform-side stall, the same
  class of issue this repo hit once before (2026-07-04, noted in `pages.yml`'s own comments).
  Founder asked whether a same-day parallel session (PR #812, open, unmerged) could be the cause;
  ruled out by checking `git log origin/main` (unchanged since this PR's merge) and confirming
  `pages.yml` only triggers on a push to `main`, of which there was exactly one in the window.
  Re-ran the failed `deploy` job (`rerun_failed_jobs`); it succeeded on its first internal attempt
  ~47 minutes after the original push, once the platform recovered. **Founder confirmed the site
  live at `genauly.de`.** Nothing in the app or the workflow needed changing.
  **One real, unrelated finding surfaced along the way:** because this PR merged first, PR #812
  showed `mergeable_state: "dirty"` against `main` (both sessions touched overlapping Prüfung-area
  docs). Correctly flagged rather than fixed here; the #812 session then resolved it by merging
  `main` in and keeping both sessions' facts in every conflicted doc.
**Resume here:** nothing is open. The greeting→title swap is scoped to `/anwenden` only; the
founder's other example ("Bibliothek") read as illustrative of the pattern rather than a request
to retitle that page today. `navItems` already carries every route's label if that changes.

Older "Resume here" handoffs (s195 and earlier) are archived alongside their status-log entries in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.

---

**Handoff after session 197 (2026-08-06): the mobile Bibliothek list dissolves behind the Üben
button (branch `claude/mobile-floating-text-readability-bs49dz`).**
Founder, with a screenshot of the dark desktop list fading at its bottom edge: "can you put similar
effect even in the mobile view so that the floating text below the ueben button is more readable and
visible? generate a couple of previews", then "insert short fade but soft blur but not above the
blue button, it should be below the blue button behind the text."
- **The diagnosis.** That screenshot is a DESKTOP-only effect. Since s189 the browse list scrolls
  inside the content column, so `browseColumnClass` masks the column's bottom edge
  (`mask-fade-bottom`) and the cards dissolve into the page ground. A phone scrolls the PAGE, so
  there is no edge to mask: the cards ran at full strength behind the floating Üben button and the
  "Etwas verbessern? Feedback geben" line, which since s189 deliberately carries no plate of its own
  (a plate read as a frosted chip over white cards). The missing edge IS the unreadable text.
- **Round 1, previews only** (`preview/mobile-cluster-fade.html`, artifact
  <https://claude.ai/code/artifact/8bbc7f2e-d581-4767-84ee-a024380d0604>): four phone frames at the
  REAL cluster offsets and tokens, in both themes: today's baseline, a short fade, a long fade, and
  a fade plus blur, each with its cost stated.
- **Founder took the short fade AND the blur, with the blur kept below the button.** Two utilities
  in `src/index.css` (`.cluster-scrim`, a 7rem page-ground ramp; `.cluster-blur`, a 2rem frosted
  band masked at its own top), both rendered by `FloatingActionCluster`, `pointer-events-none`,
  border-free, `lg:hidden`, with the note raised to `z-[25]` above them. The band is exactly the gap
  between the nav and the button's lower edge, so it frosts the note strip and STOPS at the button.
  Neither reject comes back: no bar (s168), no band across the page (s169).
- **One tuning pass, from the real app** (Playwright over the global Chromium at 390x800, seeded
  store, both themes): the first ramp reached ~0.99 through the note strip and made the frosted band
  invisible, so it holds ~0.85 there instead, which is still AA because what shows through is a card
  within a few per cent of the ground. Only the four Bibliothek tabs mount this cluster, so no
  writing editor is dimmed. The preview gained a fifth "Shipped" phone so mockup and live agree.
Gates: typecheck · lint 0 errors (77 warnings) · 624 tests · build · check:bundle 129.8 kB ·
check:contrast · lint:content.
**Resume here:** nothing is open from this change. **CI never fired for PR #818** (no check run was
created minutes after opening, and the 16:22 `main` validate run was cancelled by the platform), so
every gate validate.yml runs was run locally instead; worth a glance at the post-merge run.

---

## Session 197 log

Founder: "in one of the previous sessions, I asked sonnet to replace the hello greeting with the
page's name as a header ... But it created this funny looking page ... It is looking ridiculous at
the moment", then "C, medium".
**The Prüfung hub has ONE column now and no page title.** s196 had read "aligned to left vertically
with the toggle buttons" as the APP header's left gutter, which is a different left edge from every
control it was meant to line up with; the page under it nested three separately centred widths, so
nothing shared an edge with anything. A preview round
(`preview/pruefung-header-align.html`, artifact
<https://claude.ai/code/artifact/77b2bdcf-aa2d-431d-a45a-cd6ea9d16c49>) offered A (title in the
page), B (title in the header, page moves to its edge) and C (no title, the switcher IS the page
header, as in the Bibliothek). The founder picked **C at 640px**: the app header's greeting slot
stays empty on this route, and one `HUB_COL` (`max-w-[40rem]`) carries the switcher row, the scope
row, the module grid and the Verlauf card. The tile grid and the Stärkeprofil dropped their own
caps, because the column was measured from the TILES rather than the page.
**Full detail in "Resume here" below**, including the two resting scrolls this deliberately did not
fix and the CI/Pages situation around the merge. The "why" is in `docs/DECISIONS.md` §s197.

**A PARALLEL s197 branch ran at the same time** and shipped the mobile Bibliothek's soft bottom edge
plus the "Nach oben" button that was sitting behind the Üben CTA (PRs #818 and #820). Its handoff is
the first block under "Resume here"; the two branches touched no common source file, only the shared
docs, and every conflict was resolved by keeping BOTH sessions' facts. The prompt log labels them
**parallel A** (Bibliothek) and **parallel B** (Prüfung).

---

**Handoff after session 198 (2026-08-07): the content audit is closed except P10
(branch `claude/content-audit-plan-mbiout`).**
Founder: "what's next in the content audit plan?", then "build the frequency and part-of-speech
linter gates", then "except human review task, complete all the recommendations from this plan, push
them live and document the session".

- **What was actually open.** P1–P9 were closed across s178/s181/s182/s185. What remained was P10
  (human verification, founder-gated and deferred), the §4 word-level residuals (116 words that
  could never produce a cloze/typed gap/listening item, 67 with no resolving related term), the §5
  closing observation that pedagogical shape has no gates, and §2.2's "Reuse" defect. The four §3.2
  LanguageTool defects were checked and are already fixed in the bank.
- **The 116 were a regex bug, and fixing the content would have been the wrong fix.** 25 of them
  start with an umlaut and JavaScript's `\b` is defined on ASCII `\w`, so `\bÜberweisung` can never
  match; 85 are verbs whose examples use a Perfekt or a finite form rather than the infinitive.
  Bending 85 natural German sentences into infinitives to satisfy a broken search would have made
  the content worse to make a report greener. `src/engine/blank.ts` is now the ONE rule (previously
  four copies: MCQ cloze, listening cloze, typed cloze, coverage report, every one carrying both
  defects) and it looks for the forms the sentences actually use, including the Partizip II /
  Präteritum / zu-infinitive from `verbForms.ts`. The blank REPORTS which form it took, so
  distractors are drawn in that same form ("gebucht" against "verschoben"/"abgesagt", never against
  a list of infinitives that gives the answer away). Only 15 separable verbs kept a genuine gap and
  got one example rewritten into a Perfekt or modal construction.
- **The three gates** (`scripts/content-shape.mjs`, run from `lint:content`): worth-learning (rare
  share **53.87 %**, no-corpus-evidence **100**), CEFR plausibility (hard: no `core`-frequency word
  at B2.2/C1; beginner-rare ratchet **32**), part-of-speech mix (**≥3 verbs AND ≥3 adjectives** per
  theme, noun share **77.59 %**). Every number is the measured bank on the day it landed, so nothing
  shipped is retroactively illegal, and raising one is a deliberate edit there with a reason.
  `tests/contentShape.test.ts` asserts each in both directions.
- **25 authored items** cleared the floors (digitales had 0 verbs and 0 adjectives; freizeit,
  behoerde, mobilitaet had 0 adjectives), all core-or-common frequency, which also serves P7's
  standing authoring rule. `verbForms.ts` and `frequency.ts` were regenerated for them
  (`build:verbs-subset` needs the npm registry, `build:frequency-subset` needs `pip install wordfreq`).
- **Reading freshness:** `progress.textsDone` + migration **0018**, unioned across devices like
  `scenariosDone`; the composer draws from unread texts and falls back to the full pool when all are
  read, so the block never disappears.
Gates: lint:content · lint:migrations · typecheck · lint 0 errors (77 warnings) · **647 tests** ·
build · check:bundle 128.2 kB · verify:facts 0 errors · verify:cefr FLAG 0.
`verify:grammar` was SKIPPED (the LanguageTool toolchain is not built in this sandbox; warn-only by
design), so the 40 new/edited German sentences have not been through Layer 3. Worth a run in a
session that has `pnpm build:languagetool` available.

**Shipped:** PR **#822**, squash-merged as **`03ea3dc`**. All three `main` workflows green on that
commit: Validate content, Deploy site to GitHub Pages and Deploy Supabase functions, whose "Apply
migrations" step ran and passed, so **migration 0018 is live on the database**. The Pages deploy did
NOT self-cancel, which is the s197 `timeout: 1800000` fix holding on its first real run.

**Resume here:**
1. **P10 is the only open audit item** and it is the founder's: `pnpm review:queue` →
   decisions → `pnpm apply:reviews` → `pnpm stamp:verified`. Start with the ~166 core-frequency
   words and the Redemittel bank, the high-traffic surface.
2. **Not scheduled, deliberately:** §2.1's inverted sub-theme structure (eight workplace themes have
   no sub-themes, 59 % of words carry no `subThemeId`). Every new Unterthema drags the writing-task
   invariant behind it (≥2 tasks per Unterthema per length), so it is a session of its own.
3. CLAUDE.md is **380 lines** by the linter's count, still over its ~350 budget (377 before this
   session; two invariants in, four history paragraphs compressed out).
