

## Session 204, its first four prompts

**Its first four prompts** (2026-08-06): four founder
prompts; one shipped change, three of analysis, and a redirect that matters more than the code.
- **Shipped (A): the Umformung is no longer a silent AI feature.** `transform-sentence` enforces its
  own 30/day cap and was in no allowance at all, so learners hit that wall unannounced. `AiMode`
  gains `transform`, counted against the SAME ledger the function counts (`sentence_ai_ops`,
  `kind = 'transform'`, paid ops only, so a cached Umformung is free on both sides), the function
  returns `dailyLimit`/`dailyRemaining` on the responses that spend a unit, and the existing
  `AllowanceNote` renders it in the Umformung card. It keeps its OWN budget: an Umformung has never
  cost a Korrektur, and one round can spend three. Gates: typecheck · lint 0 errors (77 warnings,
  baseline verified) · **625 tests** · build · check:bundle 129.8 kB. Commits `457fcbd`, `1e9f3d7`
  on the branch, **no PR opened yet**.
- **Previewed, not built (B): the one reserved KI chip.** `preview/ki-usage-chip.html` (artifact
  <https://claude.ai/code/artifact/749b6ec2-d56d-4f48-bd5a-cfef4efeedb4>): four chip variants in
  three real contexts, light/dark, three allowance states, plus three candidate AI marks. The
  founder dismissed the pick and redirected instead.
- **The redirect.** Founder: "this one shows just the count we arbitrarily determined. I want to
  show the actual usage of the AI", then "whenever I use AI feature, I see some cost in the control
  center. Does that mean it's real money?" **Answer, from the code:** the count is real, the LIMIT
  is ours. The control centre's figure is our own ledger, not a bill: **Gemini books 0.00** (true
  only while the key stays inside Google's free tier — an assumption, not a measurement), **Claude
  and GPT-5-in-`converse`** are real tokens times published rates (our hardcoded $3/$15 Sonnet and
  $1/$5 Haiku match Anthropic's current rates), and **GPT-5 in the other three functions is a
  hardcoded flat 0.004 $ per call**, which is the one genuinely arbitrary number. A non-zero cost
  therefore means Gemini did NOT answer that call.
- **The recommendation (documented, approved to record, not built).** Three steps, cheapest first:
  **(1)** an `ai_calls` table storing what each provider actually reports (tokens in/out/cached,
  model, cache hit) with prices moved into one config row — after this, usage is measured and only
  cost is derived; **(2)** reconcile nightly against the providers themselves (Anthropic's Usage and
  Cost Admin API — separate admin key, **organization account required, not individual**; OpenAI's
  organization usage/cost endpoints) and show "ours vs theirs" side by side; Gemini has no clean
  billing API, so its free-tier figure stays a self-measured count and the UI must say so; **(3)**
  the learner-facing number stays counts, never money. Full reasoning in `docs/DECISIONS.md` §s204.
**Resume here (s204, now DONE in s205 below the header):** step 2, the reconciliation. It needed one thing from the founder first: the
Anthropic account must be an ORGANIZATION (Console → Settings → Organization) before it can issue
the `sk-ant-admin01-` key the Usage and Cost API requires; OpenAI's organization usage/cost
endpoints need their own key. Then a nightly job pulls yesterday's real figures into a
`provider_costs` table and the control centre shows "ours vs theirs". Also unbuilt: the admin view
of `admin_ai_usage_breakdown` (the RPC exists, nothing renders it yet; it is founder-facing UI, so
it owes a preview round). Also open: **part B, the reserved KI chip**, previewed in
`preview/ki-usage-chip.html` and awaiting a pick, superseded in priority but not cancelled (note for
whoever builds it: `Sparkles` is NOT available as the AI mark, Quiz/empty states/onboarding use it).
**Two things this session expected to do and did not have to:** the `pages.yml` timeout raise had
already shipped on `main` as #821, and the CLAUDE.md budget was already fixed by s203, so the merge
took main's version of both. Also still open from earlier sessions: the Prüfung hub loads ~825 kB of
content banks via `engine/exam`, no exam set is `anruf` shaped, and the authored dialogue `nodes`
graphs are dead but not retired.

_Session 196 (2026-08-06) gave all four Ohne-Zeit modules ONE Aufgabe rail, fixed the
Sprechen debrief, and finally diagnosed the recurring red Pages deploy. Founder: "sprechen ohne zeit page tiles are all a bunch
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

**Handoff after session 200 (2026-08-07): P2, P3 and P5 shipped; P4 was stopped by the founder and
the audit finding behind it is now marked WRONG.**
Founder prompts: "what's next?" → "go ahead" → "is Text zur Aufgabe really necessary? in my B2 für
Beruf exam they just gave the topic overview and asked to write a forumsbeitrag ... can you research
what is more realistic".

- **P2, the one that mattered** (`663f993`). `level` tells `evaluate-writing` to mark strictly, and
  Aufgabenerfüllung is graded against the Leitpunkte, so an argumentative Textsorte whose points only
  describe marks a learner down for obeying the brief. **30 tasks fixed**, each REPLACING its weakest
  descriptive point (never a fifth), and gated: `scripts/justification-markers.mjs` is the ONE
  classifier, shared by `lint:content` and `tests/writingScope.test.ts`. **110 tasks gated, all
  passing.** A point counts when it forces a **reason, a consequence or a stance** (one demand, not
  two: a first cut demanded a stance specifically and failed `wt_safety_l04`, whose points are
  "Begründen Sie …/Legen Sie dar …/Entkräften Sie den Einwand …").
- **P3** (`a7dd57a`). `exam` retired from 717 tasks, the interface and `src/types/index.ts`;
  `lint:content` errors if it returns. `words` now documents the real rule, (Niveau, Länge).
- **P5** (`f9a1e78`). Five Textsorte re-tags (the tag follows the requested OUTPUT) and the 14
  du/Sie hybrids, fixed on the Adressat side with first names; gated in `lint:content`.
- Gates: lint:content 0 errors · typecheck · **651 tests** · (build/bundle/contrast not re-run after
  the docs-only commits).

**P4 is NOT a defect as the audit wrote it, and the report now says so.** The founder challenged it
from their own exam, and the published material agrees: **Goethe B2 Schreiben Teil 1** is a
Forumsbeitrag from a topic plus four Inhaltspunkte with nothing supplied, and **DTB B2** supplies a
text in Teil 1 (a forwarded customer complaint to answer) but not in Teil 2, which is a choice of two
topics, one a Forumsbeitrag. **The supplied text belongs to a GENRE, answering incoming workplace
mail, not to an exam.** The audit had selected the 54 Stellungnahmen and 17 Forumsbeiträge, exactly
the opinion tasks that never get one.
**Shipped:** PR **#828** (four commits: `663f993` P2, `a7dd57a` P3, `f9a1e78` P5, `74828a9` +
`c96c650` the P4 correction and docs) → squash-merged **`df101d7`**. Validate content and Deploy site
to GitHub Pages both green on `main`. **Deploy Supabase functions did not run, and that is correct**:
it is path-filtered to `supabase/functions/**`, `supabase/migrations/**` and its own file, none of
which this session touched. Post-merge housekeeping done, tree clean.

**START HERE next session: the reply wave** (founder: "i agree with your assessment on p4 and a gap
with Beschwerde. I'd go with your recommendation"). The **47 reply-shaped tasks** ("Ein Kunde
beschwert sich … Antworten Sie ihm") show nothing of what came in, which IS the DTB B2 Schreiben
Teil 1 shape, and it is the one place `source` earns its keep. What that session needs, in order:
1. **47 authored incoming texts** (customer mail, guest complaint, relative's message), each stating
   the facts the Leitpunkte answer: dates, order numbers, what was promised, what arrived. `/content`
   first; ids and instructions do not change, this is a new field only.
2. **A rendering slot, which does not exist yet.** The Aufgabe card (`GuidedWritingTrainer`), the
   exam's `SchreibenPart`, and the payload `evaluate-writing` grades against all ignore `source`
   today. The A/B/C placement mockup is already built and still applies:
   `preview/schreiben-source-text.html` (A text first / B task first / C folded behind one line);
   the founder has not picked yet, so start by asking.
3. **Watch the two height laws** while adding a block to that card: a freshly opened trainer never
   rests scrolled, and the Schreiben mobile anatomy is locked (`docs/areas/SCHREIBEN.md`). The card
   already caps and scrolls its task region internally, so the text is more content in that region,
   not new chrome.
4. **Gate it** the way s199 and s200 gated their rules: a reply-shaped brief without a `source` is
   the defect to catch, and the lexicon lives in `scripts/` shared by `lint:content` and the test.
2. **`source` has NO rendering slot** (read by nothing: not the Aufgabe card, not `SchreibenPart`,
   not `evaluate-writing`), so P4 was never the data-only edit the audit assumed. Either build it for
   the reply wave or retire the field like `exam`. Awaiting the founder's pick; nothing was changed.
3. The A/B/C placement mockup is built and still applies to the reply wave:
   `preview/schreiben-source-text.html`.

**Method note for the next audit:** §9 compared the bank against exam shapes from memory of the
format rather than against the published task descriptions, and that is what produced a wrong
finding. Where a claim turns on "this is what the exam does", fetch the Modellsatz.

## Session 199 log

_(moved out of `docs/PROJECT_STATUS.md` in session 203)_

Founder: "what's next in the task list?", then "go ahead".
**The writing-task quality audit is done, and its headline is: the tasks are well written, the tags
on them are not.** s181 closed the COVERAGE backlog (717 tasks, every Unterthema, Textsorte and
Branche represented); this audit asked whether the tags are EARNED.
- **The good news, measured first:** only 6 near-duplicate instruction pairs across 256,686
  comparisons (all same-theme, zero cross-theme), 2,355 distinct Leitpunkte of 2,691, zero Leitpunkte
  demanding a non-written act, and a demand ladder that genuinely rises with the Niveau tag.
- **Branche is a coverage artifact.** All 40 theme×length pools carry exactly 15 distinct sectors,
  the size of the `WorkSector` enum, assigned in enum order down the pool index, in pools as small as
  11 tasks. 199 of 600 tagged tasks (33%) carry no marker of the sector they claim.
  `tests/writingScope.test.ts` forced this and 11-task Alltag pools cannot satisfy it by authoring.
- **The Niveau tag scales the word target and the AI grader's strictness, but not the task**: 236
  tasks (207 B2, 29 C1) ask for no justification, sharpest in 6 C1 Stellungnahmen at 200 words.
- **`exam` is dead metadata** (read by nothing) that contradicts `words`, and **`source` is unused on
  all 717 tasks**.
Full detail and the P1–P5 fix list are in the report.

**Then the founder answered P1 and asked for two more things**, so the session shipped three commits:
- **P1, option (a): a Branche tag is EARNED or it is not there.** `scripts/sector-markers.mjs` is the
  ONE lexicon (shared by `lint:content` AND `tests/writingScope.test.ts`, so gate and test cannot
  drift); 331 unearned tag instances stripped, 220 tasks universal again, no id or task text touched.
  The all-15-Branchen floor is replaced by the property it only proxied for, plus a floor keeping
  Berufsleben real (≥8 of 15 sectors per pool). Nothing became unreachable: Branche is soft, and a
  test asserts every Branche still draws everywhere.
- **The filter hierarchy inverts, in all 8 rails:** Lebensbereich → Thema → Unterthema → Branche, then
  Niveau and Textsorte (founder: "Berufsleben and Alltag as the first filter ... all across"). Applied
  inside the rails, never by a caller.
- **Branche LOCKS instead of greying.** Its count is now the DEDICATED one, so a padlock means nothing
  is written for that industry on this Thema; when every option is locked, one line replaces the
  control. The engine keeps its untagged-=-universal fallback, so deep links still work.
- **The rails are one piece.** The header and footer were painting the accent wash on top of the
  tile's own, compositing darker, with a tinted rule under each seam. Both fills and both rules gone.

## Session 200 log

_(moved out of `docs/PROJECT_STATUS.md` in session 203)_

Founder: "what's next?" → "go ahead" → "is Text zur Aufgabe really necessary? in my B2 für Beruf exam
they just gave the topic overview and asked to write a forumsbeitrag ... can you research what is
more realistic".
- **P2, the fix that mattered.** An argumentative Textsorte at B2+ must now carry a Leitpunkt
  demanding a **reason, a consequence or a stance**, because `level` is what makes `evaluate-writing`
  mark strictly. **30 tasks fixed** (each REPLACING its weakest descriptive point), **110 gated**,
  one shared classifier for gate and test (`scripts/justification-markers.mjs`).
- **P3:** `exam` gone from 717 tasks, the interface and the types, with a guard against its return.
- **P5:** five Textsorte re-tags and the 14 du/Sie hybrids, both now gated.
- **P4 stopped, then closed.** The founder's own exam contradicted the audit, the published
  Modellsätze back the founder, and the report carries a correction. The supplied text belongs to the
  reply genre, so the honest target is the 47 "Antworten Sie" tasks, not the 71 opinion tasks.
  Nothing was changed, and the founder agreed: the reply wave is the next session's work.

## Handoff after session 201 (2026-08-07)

_(moved out of `docs/PROJECT_STATUS.md` in session 203)_

**The four Ohne-Zeit module pages are one product, and the two that did nothing work.**
Branch `claude/ui-polish-consistency-56ja1y`, PR #827.
Founder prompts: four phone screenshots + "make these pages consistent and highly polished ... leave
no stone unturned ... some of the observed bugs: the header bar shouldn't have the aufgabe button /
shuffle button ... deactivates when tapped on empty spaces" → "either keep verlauf in every module or
remove it from all of the individual modules" → "go with verlauf on all four".

- **The reported shuffle bug was a dead page.** `/lesen` and `/hoeren` wrote a run into
  `useExamStore` and nothing rendered it (only the hub did), so every card and the draw did nothing;
  the "stuck" button was a touch-`:hover` that never cleared. `TextModuleHub` renders
  `<MockExamRunner />` now, `AppShell` has `STAGE_ROUTES`, and the chooser's `zoneExit` steps aside
  while the runner owns the exit, clearing only an exit that is still its own.
- **`ZONE_ROUTES` never had those two routes**, so they were the only screens in the zone without
  the header exit. Fixed with the same one-line law.
- **One chooser for three modules:** `ModulePicker` (frame + toolbar row), `ChooserCard` (one card
  anatomy), `ModuleTabs` (one switcher), `verlauf.tsx` (the Verlauf card, extracted from the hub so
  a chooser never imports it and drags the writing-prompt bank into `/lesen`).
- **`future.hoverOnlyWhenSupported`** is app-wide: a `hover:` fill can no longer read as an ON state
  on a phone. Any new toggle states its ON state in its own class, never as a hover fill.
- Verified in a real browser at 360x640 and 1280x860, light and dark. Gates: typecheck · lint 0
  errors · 652 tests · build · bundle 128.2 kB · contrast · lint:content.
- **The header carries ONE control where there is a way out** (founder, same session): `quietHeader`
  drops the streak pill and the account menu wherever the zone exit shows, which the exam already
  did. The hub keeps both, because it is a nav destination and registers no exit.

## Session 196 handoff (archived from PROJECT_STATUS in s205)

_Session 196 (2026-08-06) gave all four Ohne-Zeit modules ONE Aufgabe rail, fixed the
Sprechen debrief, and finally diagnosed the recurring red Pages deploy. Founder: "sprechen ohne zeit page tiles are all a bunch
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

## Session 203 log

Founder: "do the documentation maintenance". No app code was touched.

**Two standing debts, both closed.**
- **`CLAUDE.md` is back inside its budget: 399 → 349 lines** (the `lint:content` ratchet warns past
  ~350 and had been warning since s198). It was over because rules had accreted their own history:
  measurements that live in `docs/areas/CONTENT.md`, mechanisms that live in `PRUEFUNG.md`, and the
  story of what went wrong, which belongs in `DECISIONS.md`. **No law was dropped.** Each bullet was
  cut back to the RULE plus a pointer, and the three details with no area-doc home were given one
  first: the `source`-belongs-to-the-reply-genre rule and the phrase-level (never opening-verb)
  argumentation classifier went into `CONTENT.md`, and the touch-`:hover` law went into the `/design`
  skill's landmine list as #12, beside the focus-ring law it mirrors. The maintenance rule at the top
  of the file now says what a law looks like, so the next session has a shape to write to.
- **Every bank count in the docs was re-measured**, and most had drifted silently. `PROJECT_STATUS`
  was quoting grammar drills at 195 (really **320**), texts at 42 (**52**), scenarios at 30 (**36**),
  exam sets at 15 (**21**) and provenance at 3,457 rows / 3,444 draft (**3,604 / 3,591**);
  `CONTENT.md` still described the provenance register as two array parts when it has been four since
  s182, and told authors to append to the second. `SPRECHEN.md` counted 15 exam sets in the
  no-`anruf`-set-yet note. All corrected against `pnpm lint:content` output and stamped with the date
  they were measured. **New rule in `CLAUDE.md`:** a count in a doc is MEASURED, never carried
  forward.
- Also corrected: the taxonomy line claimed 5 top-level domains "all populated"; `pruefung` carries
  no themes and never has.
- Housekeeping: the s199 and s200 session logs and the s201 handoff moved into
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`, per the two-most-recent rule.
- **Shipped in three PRs:** **#832** (the pass) → `48d250c`, **#833** (the paper trail) → `8a45be9`,
  **#837** (this line and the founder's "document the session") → see the handoff. `origin/main`
  moved mid-session (#831), so #832 merged it first; the one conflict was in
  `SESSION_PROMPT_LOG.md`, where #831's entry belongs to the session 202 block.

## Session 202 log

Founder: "for the sprechen part, I'd want you to add a filter rail kind of rail with useful
redemittle even in the practice sessions", then the pick: "option a's layout for desktop and option
c for mobile and also desktop's content" → "the aufgabe text is being cut off ... the Redemittel pills at the
bottom should be at the top of that tile and the selected pill should also be shown ... adapt the
same heirarchy for Redemittel in desktop view as well".

**The gap:** a spoken task named its four Redemittel CATEGORIES on the brief card and ticked them in
the debrief, while the eight phrases behind each name lived only in the Bibliothek. The learner had
the label ("Vorschläge machen") and never the language, at the one moment they were speaking, and
the debrief then graded whether they had reached for exactly those.
- **Previews first** (`preview/sprechen-redemittel-rail.html`, published as an artifact): today's
  screens plus three placements, each with desktop and phone frames and its cost.
- **Shipped the founder's pick:** ONE content (`RedemittelHelp`) in two shells. A 16rem `ScopeRail`
  tile beside the conversation from `lg` up (the stage widens `max-w-2xl` → `lg:max-w-4xl`, so the
  conversation column keeps its width), and the second tab of the brief drawer below it, **Aufgabe |
  Redemittel**. One `useMediaQuery` decides, so the phrases never print twice.
- **Practice only, structurally:** the runner takes the help as a PROP and the Modelltest passes
  nothing, so a candidate is never shown the phrases they are graded on and the exam chunk carries
  no phrase bank (`MockExamRunner` has no `redemittel-*.js` import in the build; `SprechenHub` does).
- **`src/lib/anrede.ts`, the ONE du/Sie rule.** The bank's `register` is formality, not Anrede, so
  the Anrede is derived from the phrase text, in one place, gated by `tests/anrede.test.ts` (which
  also asserts every scenario's four intents stay servable in both registers). It never empties a
  category.
- **Defaults taken where the founder answered layout only** (each one line to flip): all eight
  phrases of the chosen intent, Anrede matched to the partner, English hold-to-peek.
- Verified in a real browser at 1440x900, 1280x800 and 393x852, light and dark; every screen rests
  at 0 page scroll. Gates: typecheck · lint 0 errors · **662 tests** · build · bundle 128.3 kB.

## Session 201 log

Founder: four phone screenshots (`/lesen`, `/hoeren`, `/simulation`, `/writing`) with "make these
pages consistent and highly polished ... leave no stone unturned", two named bugs, then "go with
verlauf on all four".
**The headline is a bug the screenshots only hinted at: `/lesen` and `/hoeren` were dead pages.**
Tapping a text or "Zufällige Auswahl" wrote a run into `useExamStore`, and the Prüfung hub was the
only screen in the app that rendered a run, so nothing happened. What the founder reported as "the
shuffle button doesn't deactivate" was a stuck touch-`:hover` on a button whose tap led nowhere.
- **Both choosers work now.** `TextModuleHub` renders `<MockExamRunner />` while a run exists, the
  shell knows the two routes (`ZONE_ROUTES` + the new `STAGE_ROUTES`), and finishing or leaving a
  drill lands back on the list it was picked from. Verified end to end in a real browser.
- **The zone's ONE exit was missing on those same two pages** (they were never in `ZONE_ROUTES`),
  which is the visible difference in the founder's first two screenshots.
- **The Aufgabe toggle left the module row** for the chooser's own toolbar row (founder's bug 1).
- **Sticky touch-hover is gone app-wide:** `future.hoverOnlyWhenSupported` (founder's bug 2, the
  same law as s190's focus rings one input mode further).
- **One chooser for three modules:** `ModulePicker` owns the toolbar, `ChooserCard` is the one card,
  `ModuleTabs` the one switcher, and all four pages read module row → switcher → content.
- **A Verlauf on all four** (founder pick): the hub's Verlauf card was extracted to
  `features/pruefung/verlauf.tsx` and Lesen/Hören list their own sittings from it.
- **Re-verified after the `origin/main` merge**, not just before it: every gate green (652 tests,
  bundle 128.2 kB, contrast, content lint) and all four pages walked again at 360x640 and 1280x860,
  light and dark, including the full drill loop and both Verlauf states. `CLAUDE.md` came down 391 →
  383 lines (the merge had left one rule stated twice) but was still over its ~350 budget, which it
  had been since s198. (That debt was closed in s203; the file is 349 lines now.)

## Session 204 (2026-08-06 → 08, branch `claude/ki-usage-task-kg0vix`): the KI-usage task, shipped

**Shipped as PR #835, squash-merged to `main` as `ad8fead`, with the migration renumbered by #839.**
_Started before sessions 197-203 and merged after them, which is why it is numbered here rather
than where its dates would put it. Two things to know about how it landed: the branch carries two
merges of `main` with every gate re-run on the merged tree, and **GitHub never queued a CI run for
the PR** (other branches were queuing normally), so the merge rests on the local gate run, which is
stated in the merge commit._
- **AI usage is measured now.** Migration 0019 adds `ai_calls` (**it shipped as 0018 and had to be
  renumbered**: a parallel session had taken that version in #822, the remote keeps one row per
  version, and the clash killed the whole backend deploy because migrations run before the functions.
  `pnpm lint:migrations` now fails on a duplicate version, so it cannot recur): one row per provider call holding
  the token counts the provider ACTUALLY reported (feature, provider, model, input/output/cached
  tokens, cache hit), priced from ONE rate table in `supabase/functions/_shared/aiUsage.ts` that
  `app_config.ai_rates` can override at runtime. All four Edge Functions were rewired to it, which
  kills the hardcoded flat $0.004-per-GPT-5-call guess in three of them and the four copies of the
  Claude price arithmetic. Cache hits are recorded as zero-cost calls, so the cache-hit rate is
  visible instead of inferred. `ai_usage` is untouched and still the monthly spend fuse; `ai_calls`
  is the detail behind it, and the thing step 2 compares against the providers' own bills.
  Founder roll-up: `admin_ai_usage_breakdown(days)`, aggregates only. Purged at 400 days.
- **Sprechen: 6 Übungsgespräche + 3 Prüfungsgespräche per day** (was one shared budget of 2),
  counted separately on `speaking_conversations.exam` so neither can eat the other. For an existing
  conversation the ROW's flag decides which budget it spends, never the request body. The monthly
  ceiling rose with them (40 → 120): at up to 9 a day, 40 would have bound within four days.
- **A privacy-policy change rode along, deliberately.** `ai_calls` is a new per-user record, so both
  language versions of the retention section now describe it (no text, counts only, 400 days, link
  dropped on account deletion) and `CONSENT_VERSION` / `PRIVACY_LAST_UPDATED_ISO` were bumped in
  lockstep to `2026-08-06`. **That bump asks every signed-in learner to re-consent on their next
  visit.** It follows the documented rule; say the word and it reverts to `2026-08-05` in one line.
- Gates: typecheck · lint 0 errors (77 warnings, baseline) · **637 tests** (up from 626, new
  `tests/aiUsage.test.ts` pins the pricing arithmetic and the three providers' token shapes) ·
  build · check:bundle 129.8 kB · check:contrast · lint:content · lint:migrations.

## Session 205 (2026-08-09, branch `claude/ki-usage-task-kg0vix`): step 2, the reconciliation

The founder created a Console team organization and an Admin API key (30-day expiry, by choice) and
stored it as `ANTHROPIC_ADMIN_KEY`, which unblocked the step s204 could only recommend.
- **Migration 0020** adds `provider_costs` (one row per provider per UTC day, the amount the
  PROVIDER reports) and `provider_sync_state` (last success, last attempt, last error), plus
  `admin_ai_reconciliation(days)` and `admin_ai_sync_state()`.
- **`reconcile-ai-cost` Edge Function** pulls Anthropic's Cost Report, converts its cents-as-string
  amounts once, and upserts by day. Founder-gated against `admins`. **No cron on purpose**: a
  scheduled pull would need a credential stored inside the database, so the admin screen refreshes
  on open (hourly at most) and on demand.
- **A card in `/admin` System** shows our derived figure, Anthropic's, and the difference over 14
  days. An unreported day reads "–", never 0; sync errors render above the numbers; Gemini and
  OpenAI are named as unreconciled rather than shown as agreeing.
- **The expiry is handled, not ignored.** The key dies on 8 September; a 401 is turned into "der
  Schlüssel ist abgelaufen" in `provider_sync_state.last_error` and shown on the card, so the
  comparison cannot go quietly stale.
- Gates: typecheck · lint 0 errors (78 warnings, one new and of the same async-setState class as
  the existing ones) · **687 tests** (up from 675; `tests/costReport.test.ts` pins the cents→dollars
  conversion and the sum-every-row rule, both wrong in ways that survive a glance) · build ·
  check:bundle · lint:content · lint:migrations.
- Two open items, both flagged rather than urgent, closed by later sessions or still open: **the
  admin key expires 2026-09-08** (create a new one and replace the secret), and the reconciliation
  covers **Anthropic only** (OpenAI needs its own org key; Gemini has no billing API and its $0
  stays a labelled assumption). Also still unbuilt from s204: **part B, the reserved KI chip**,
  previewed in `preview/ki-usage-chip.html` and awaiting a pick.

## Session 206 (2026-08-09, branch `claude/speaking-exercises-ai-error-xk6o7h`): Sprechen "AI doesn't work", the sign-in wall

**Ran in PARALLEL with session 205, which reached `main` first, so this one renumbered rather than
reuse 205.** Shipped as PR **#841** → **`d4a4771`**, squash-merged.
Founder prompts: "there is an error with speaking exercies - the ai feature doesn't work" → "for the
redemittel rail, display only 4-5 highly useful and frequently used redemittel phrases, not too many
of them.. Also, the first redemittel is literally overshadowed due to unnecessary shadow effect below
the toggle buttons and pills. fix it" → a screenshot: "this is what happens.. no response" → "first
merge the changes from this session and make it live" → "complete the merge and also documentation".
**The screenshot is what solved it. Nothing was broken upstream:** the caption under the microphone
read "Bitte melde dich an, um mit der KI zu sprechen." Signed out with Turnstile on, `converse`
cannot be called, and the refusal arrived after the learner had started the conversation, opened the
mic and spoken a sentence, in the same grey slot that otherwise says "Ich höre zu …", on a screen
whose quiet header has no account menu (s201). No error, no reply, no way to sign in: it reads as
the app doing nothing. **The report said "it loads and there's no response from ai", which reads as
a broken model, a hung request or a dead key — diagnosis by code review had four plausible branches
and no way to choose between them from the sandbox (the network policy blocks the Supabase project,
so the live function cannot be probed from here). Ask for the screen before theorising about the
server.**
- **The sign-in wall moved to the brief card** (`speakingAuthBlock` / `useSpeakingAuthBlock`, ONE
  rule, two readers), the same law the daily allowance follows: stated BEFORE the commitment. Start
  becomes **Anmelden** and opens `AuthDialog`, because a wall with a remedy gets the remedy as its
  button. A session that lapses mid-run opens the same dialog (`needsAuth`).
- **A failure is no longer printed in the status grey** (`MicCluster.captionTone`), and the typed
  fallback prints the caption at all now: in Firefox a refused turn showed literally nothing.
- **Every cascade leg has a deadline** (`AbortSignal.timeout`, 20 s turns / 60 s debrief). There was
  none anywhere in any function, so a hung provider held the request open forever, which on the one
  surface a learner waits at synchronously is the same thing as a dead app.
- **The free Gemini leg was dead, not free.** `gemini-2.5-flash` reasons by default and Google bills
  thoughts as output, so the 500-token turn budget was spent thinking: no text part, leg discarded,
  and EVERY turn silently fell through to the paid model at the cost of an extra round trip. Turns
  now send `thinkingBudget: 0`. Losing legs log provider + HTTP status + the provider's error code,
  so the next report is diagnosable from the logs without reproducing it. **If the Sprechen bill
  looks lower from here, that is why**, and the same thinking-budget trap applies to any future
  short-output Gemini call.
- **Redemittel rail (founder's second prompt):** at most **five** phrases per intent, the easiest
  that fit the Anrede by `CEFR_ORDER`, shown in the bank's own order. The pills lost their count (a
  number that cannot vary is dead chrome). The "shadow" was the unconditional `mask-fade-y` fading
  the FIRST phrase out under the pills; it is `useEdgeFade` now, per edge and only where content
  actually continues, which with five phrases is usually nowhere.
- **Ran in PARALLEL with session 205** (the cost reconciliation), which reached `main` first; this
  branch merged `origin/main` and re-ran every gate on the merged tree (688 tests, bundle 129.3 kB,
  lint:migrations green).
- Gates: typecheck · lint 0 errors (77 warnings, baseline) · **676 tests** (up from 675, the cap is
  pinned in `tests/anrede.test.ts`) · build · check:bundle 128.3 kB.
- **Not verified in a browser from the sandbox**: the network policy blocks the Supabase project.
  The founder verified live.
- **Left open at handoff, both since resolved or still open:** the Sprechen/Schreiben Verlauf
  spinner has no timeout on an unreachable Supabase (client-side fetch, no deadline); the next
  content job is the reply-task wave (writing-audit P4), 47 authored `source` texts plus a rendering
  slot that does not exist yet, awaiting a founder placement pick from
  `preview/schreiben-source-text.html`.

---

## Session 207 (archived from PROJECT_STATUS.md by session 209)

**Session 207 (2026-08-09, branch `claude/remove-onboarding-practice-z7qfwu`): the nav order, the
onboarding hand-off, and the interface language.**
**Shipped in three PRs, all squash-merged to `main` and all deployed green:** **#843** the change
itself (`c334b65`, CI green on the merged tree `18a909f`), **#844** the paper trail (`fa3e97d`),
**#845** the tagline correction (`c0e7b0f`). Each merge's Pages deploy succeeded on attempt 1, so
everything below is live; a PWA hard-refresh may be needed to see it on a device that has the app
installed.

Founder, four prompts: *"remove the onboarding practice session when a new user signs up … finish
the onboarding form and immediately shown the bibliothek. Keep bibliothek on the top, and the
praktisch beside the settings. Praktisch should be labeled as beta."* → *"the app's language should
adapt to various levels of user language proficiency … if the user logs A2 or B1 level, the app
should show everything in English except the learning material which should obviously be in
german."* → *"the buttons like üben or stufe b1.1 and the hint on what the gender means are all
still in german. they're also considered as app language … check for other such overlooked items
all across the app."* → *"if the user selects b2, then the app can have the current german
wordings."*

- **Onboarding ends in the Bibliothek.** `completeOnboarding` used to hand straight over to a ~90s
  composed taster (`/session?min=1`), which decided a new learner's first minute for them. It now
  goes to `/library`. Nothing else about setup changed (one card, consent recorded before any
  progress is stored).
- **The nav runs ONE new order, on both surfaces:** Bibliothek · Prüfung · Fortschritt · Praktisch
  (**Beta**) · Einstellungen. Bibliothek opens the rail (it is what setup hands over to now),
  Praktisch sits directly left of Einstellungen because that zone is still being built, and it
  carries a Beta mark: a neutral bordered chip in the sidebar, a lighter bold suffix inside the bar's
  label slot (a chip there would grow the fixed 12px line and shift the icon rail). `/` is unchanged
  as a route: still the Dashboard, still the app root. The bar pins its own ends and only READS a
  saved order for the reorderable middle, so every pre-s205 pin list still renders five slots with no
  migration. `NEVER_HIDEABLE` makes the three fixed slots un-hideable on BOTH surfaces, so remote
  config cannot empty a slot on one and leave it drawn on the other.
- **The interface language follows the LEVEL** (`src/lib/uiLang.ts`, the one fold): A2/B1 read the
  interface in English, B2/C1 keep today's German, and **the learning material is German at every
  level** (a word, its example, a Redemittel, a grammar drill, an exam text, a writing brief, the
  game's German world). `useSettingsStore.uiLang` ("auto" | "de" | "en", default auto) overrides it
  from Einstellungen → Profil → Sprache and rides cloudSync in the settings blob. `<html lang>`
  follows. Onboarding reacts to the level chip the learner is LOOKING at, so tapping A2 flips that
  card to English before anything is saved.
- **How it is built, and why that shape:** the app is German-first, so **the German string is the
  key**. `t("Wörter")` looks up `src/lib/uiStrings.ts`, and a missing key renders the German, which
  is exactly what that call site rendered before. That is what let coverage grow surface by surface
  with no half-broken state, and it puts every English string in ONE file the founder can read as a
  document. Shared components translate at the SINK (FilterRail, ScopeRail, FacetSheet, DataTable,
  EmptyState/SectionHeading, ViewSwitcher, SearchField, UebenLabel), so one edit covered dozens of
  call sites. Taxonomy that already carries both languages in the bank (Themen, sub-themes, domains,
  life areas) goes through `useTitle()` instead of the dictionary, so 66 theme names are not
  duplicated. **~700 chrome strings across ~60 components** are converted: the shell, onboarding,
  Settings, all four Bibliothek tabs and their rails/graphs/tables, the Prüfung zone and its exam
  runner, Schreiben, Sprechen, the session player, Fortschritt, Sammlung and the game chrome.
- **Deliberately still German** (stated, not overlooked): the Modelltest's Anleitung, which
  reproduces the real telc instruction text; the grammar dial VALUES in Fokus (Aktiv/Passiv/Präsens/
  Perfekt are the forms being practised); the Neuland world's place and mission names; and the
  German grammar abbreviations on a word card (Pl./Perf.).
- **`main` moved under this branch** (#840, #841, #842, sessions 205 and 206 in parallel), so it was
  merged in and every gate re-run on the merged tree. The conflicts were all in the docs: CLAUDE.md
  took main's compressions plus this session's two new laws, and the append-only logs kept both sides.
- Gates on the MERGED tree: typecheck · lint 0 errors (77 warnings, unchanged baseline) · **701
  tests** (687 on `main`; `tests/uiLang.test.ts` pins the level rule, the German fallback and the
  dictionary's shape, and two nav cases join) · build · check:bundle 153.2 kB · check:contrast ·
  lint:content (CLAUDE.md back under its budget) · lint:migrations. Verified in a real browser at
  390px and 1280px, at A2 and at B2.

- **The tagline drift, found by the founder in a screenshot.** The sidebar caption still read
  "Deutsch im Beruf · B2", the line from before the s21 repositioning. It is
  "Deutsch fürs echte Leben · B1–B2" / "German for real life · B1–B2" now, the same tagline the
  landing hero, `index.html`, the OG tags and the PWA manifest already used. The same stale scope
  was still in the AGB and the Datenschutzerklärung (both languages opened by calling Genauly an
  exam-prep app for the B2-Beruf SPEAKING exam) and in the `types/index.ts` header; all corrected to
  what the app is. **`CONSENT_VERSION` was deliberately not bumped**: the edit changes no data
  practice, and a bump would ask every signed-in learner to re-consent for a wording fix.

Session 207's language-work summary: complete for chrome the learner meets, documented in
`docs/areas/UI-LANGUAGE.md`. Four items stay German by decision (Modelltest Anleitung, grammar dial
values, Neuland place/mission names, Pl./Perf. abbreviations); any NEW surface must call `useT()`.

Sessions 204-206 (the KI-usage measurement + reconciliation, and the Sprechen "AI doesn't work" fix)
are archived in full in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.

---

## Session 208 (archived from PROJECT_STATUS.md by session 210)

**Session 208 (2026-08-09, branch `claude/filter-persistence-error-yr2716`): the CEFR level-band
chip kept coming back.** Shipped as PR **#847** → **`de70c9b`**, squash-merged.
Founder report, with a screenshot of the Wörter tab: "there seems to be an error with the filter
here. Even if I remove and refresh it's still appearing. Fix it."
- **Root cause:** the "Level: up to …" `ActiveFilterChip` (the removable UI for the default
  CEFR-band cut on Wörter/Kollokationen/Redemittel, `defaultVisibleBands`) tracked its dismissal in
  a plain `useState(false)` per trainer. A full page refresh always remounts the component, so the
  flag reset to `false` and the chip reappeared even immediately after being dismissed.
- **Fix:** moved the flag into `useSettingsStore` as a new persisted field, `showAllCefrLevels`
  (default `false`), the same pattern already used for `artikelLegendDismissed` and
  `signInBannerDismissed`. All three trainers (`VocabularyTrainer.tsx`, `CollocationsBrowser.tsx`,
  `RedemittelTrainer.tsx`) now read/write that one store field instead of local state, so dismissing
  the chip on any of the three tabs sticks across refreshes and rides cloudSync like the other
  settings-store flags.
- Gates: typecheck · lint 0 errors (78 warnings, pre-existing baseline, unrelated to this change) ·
  build. No new test added (no test framework covers this UI interaction path today); verification
  was a targeted code read of the three call sites plus the settings-store persistence contract.
- **Not verified in a browser from the sandbox**: same network-policy limits as prior sessions.
  Worth a founder check on the live site: open Wörter, dismiss the "Level: up to …" chip, hard-refresh
  the page, confirm the chip stays gone.

**Handoff after session 208 (2026-08-09): the CEFR level-band chip now stays dismissed.**
Branch `claude/filter-persistence-error-yr2716`, PR **#847** → **`de70c9b`**, squash-merged.
Post-merge housekeeping done, tree clean.
Founder report, with a screenshot: "there seems to be an error with the filter here. Even if I
remove and refresh it's still appearing. Fix it."

- **The fix is small and the pattern is worth remembering.** `showAllLevels` was local `useState`
  in three trainers, so every dismiss of the "Level: up to …" chip was wiped by the next page load.
  It now lives in `useSettingsStore.showAllCefrLevels`, persisted like `artikelLegendDismissed` and
  `signInBannerDismissed`. **Any future "dismiss this and remember it" UI should go straight into
  the settings store**, never local `useState`, or it will resurface the same bug.
- **Not verified in a browser from the sandbox** (same network-policy limits as prior sessions).
  Worth a founder check on the live site: open Wörter, dismiss the "Level: up to …" chip, hard-
  refresh, confirm it stays gone; repeat on Kollokationen and Redemittel.
- **Still open, unchanged from prior sessions:** the Sprechen/Schreiben Verlauf spinner has no
  timeout on an unreachable Supabase (client-side fetch, no deadline); the next content job is the
  reply-task wave (writing-audit P4), 47 authored `source` texts plus a rendering slot that does not
  exist yet, waiting on a founder placement pick from `preview/schreiben-source-text.html`.
