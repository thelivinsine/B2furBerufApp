# Project Status

_Last updated: 2026-08-05 (session 194). **The Prüfung zone was audited end to end and every
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

_Prior s193: **Sprechen was rebuilt: the learner now actually speaks.**
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

Prior s192 (2026-08-05): **The Schreibtrainer got a way back, the nav bar learned
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

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · **Prüfung** · Fortschritt, s182: Schreiben moved into the Prüfung hub),
the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-08-01, session 182, measured against the live banks — re-verify with
`pnpm lint:content` before quoting):** vocab **1,743** (**1,733 browsable**; 8 mis-filed noun+verb combos
retired in s142 + 2 true duplicates retired in s178, ids kept) · collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **32 topics / 195 drills** (18 groups; 37 productive, s182) · Lese-/Hörtexte **42** (126 checks) ·
writing tasks **717**, every one servable (s181) in 20 pools ·
Can-Do **57** · dialogues **30** (178 nodes, 335 options; every scenario ends in a free-speak turn since s182) · exam sets **15** · missions **6** ·
provenance **3,432 rows** (four concatenated parts since s182, TS2590) · themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,419 of 3,432 provenance rows are AI-drafted `draft`**; only **13** are
human-verified (13 vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset to restart the
review pass; see `strategy/DATA_GOVERNANCE.md`). The full picture of what the banks do and do not
cover is `docs/reports/CONTENT_AUDIT_2026-07-30.md` (session 178).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`, and the ones that were ticked off
in this list live in `docs/archive/PROJECT_STATUS_ARCHIVE.md` with their dates. The s147 Satzlabor
redeploy is done (s150: all three AI functions deployed on the Gemini-primary cascade,
`GEMINI_API_KEY` set). Still open:
- [ ] **Add Resend SMTP** (Auth → SMTP settings). Was optional; now needed, because "Confirm email"
      is ON and Supabase's built-in sender only allows a few messages an hour. Founder bought the
      `genauly.de` mailbox 2026-07-27; next is verifying the domain in Resend, then the SMTP fields,
      then pasting the two branded templates. Full steps: `docs/reference/auth-emails/README.md`.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 192 (2026-08-05): the trainer's way back, and the exam frame confined to
Mit Zeit (branch `claude/prufung-ui-bottom-bar-u0fdwf`).**
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
**Gates green:** build · typecheck · lint 0 errors (77 warnings = baseline) · 558 tests ·
check:bundle 126.7 kB of 400 · check:contrast.
**Open question for the founder:** the untimed drill still hides the bottom tab bar and holds the
one-viewport stage. That is deliberate (the stage is what keeps a Teil at zero page scroll, and a
visible tab bar would let a learner re-enter the persisted run in a loop), but say the word and it
can go too.

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
