# Project Status

_Last updated: 2026-08-05 (session 191). **Sprechen was rebuilt: the learner now actually speaks.**
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
separate mechanical change. Backend note: `converse` needs `ANTHROPIC_API_KEY` (already set) and
optionally `GEMINI_API_KEY` for the free leg; migration 0017 applies on the next merge to `main`.

Prior s190 (2026-08-05):
_(was: last updated session 190). **A defect session on the Bibliothek, all six items from
the founder's own screenshots, all measured in a browser rather than guessed.** Five of them trace
to one change: s189 moved the desktop scroll from the page into the content column.
**Go to top** was reading `window.scrollY`, which no longer moves on desktop, so the button never
appeared (mobile still worked, which is why it read as "missing"); `useScrollDirection(root)` now
reads whichever element actually scrolls, and the placement is the founder's s189 rule, measured:
button at the filter rail's left edge, Feedback pill at its right.
**The filter rail** stretched to its cap in every state, because a grid item defaults to
`align-self: stretch`, so a collapsed rail was 564 px of empty Himmelblau: `lg:self-start` plus a
stage-relative cap, open 655 px / collapsed **119 px**.
**The search and bookmark toggles** rendered white on white (`BROWSE_TOOLBAR_BUTTON` ends in
`bg-surface` and wins the tailwind-merge against the `default` variant's `bg-primary`), i.e. the
blank square in the founder's crop; new `BROWSE_TOOLBAR_BUTTON_ON` constant.
**"The background surrounding the cards"** was already transparent (measured `rgba(0,0,0,0)` on the
column and its parent); the real defect was the second half of that prompt, cards sliced by the
scroll container's edge, answered with `useEdgeFade` + `mask-fade-*` (a mask, not an overlay: the
ground is a gradient).
**The blue outlines** were the global `:focus-visible` ring firing after a click; `trackInputMode()`
marks `<html data-input="pointer|keyboard">` and the ring is now keyboard-only, which keeps
WCAG 2.4.7.
**Redemittel vs Kollokationen card height** was not the Wendung: `FlipCard` takes the taller face and
the unclamped BACK ran to 272 px against a 165 px front, so `auto-rows-fr` pushed all 193 cards to
272. Capped: **272 → 188 px**, against Kollokationen's 195.
The founder also asked for an audit of the previous session's feedback; every item was re-verified
live (Beispiel column, horizontal-scroll fades, internal scroll on all four tabs, the 30 px toolbar,
the Wörter three-column grid), and the only one still open was the card-height parity above.
Gates green: typecheck · lint 0 errors (77 warnings = the pre-change baseline) · 551 tests · build ·
check:bundle 126.6 kB · check:contrast.
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
