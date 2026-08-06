# Project Status

_Last updated: 2026-08-06 (session 196 fixed a desktop page-scroll regression in the Prüfung hub
and gave it a real page header; see "Resume here"). **Four founder-reported problems in the hub
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
**Resume here:** nothing is open. The greeting-to-title swap is scoped to `/anwenden` only, per the
founder's examples ("Prüfung or Bibliothek") reading as illustrative rather than a request to
retitle every route today; say the word and the same pattern (via `navItems` labels) generalises
easily.

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

Older handoffs (s192 and earlier, including s193's Sprechen rebuild) are archived in
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
**Resume here:** nothing is open. The greeting→title swap is scoped to `/anwenden` only; the
founder's other example ("Bibliothek") read as illustrative of the pattern rather than a request
to retitle that page today. `navItems` already carries every route's label if that changes.

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

Older "Resume here" handoffs (s192 and earlier) are archived alongside their status-log entries in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
