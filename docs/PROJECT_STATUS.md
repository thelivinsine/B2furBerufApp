# Project Status

_Last updated: 2026-08-06 (session 197: the Umformung's AI budget is visible, AI usage is now
MEASURED per call rather than assumed, and Sprechen went from 2 conversations a day to 6 practice +
3 Prüfung; see "Resume here")._

**Session 197 prompt 5: step 1 shipped, and the Sprechen limits raised.**
- **AI usage is measured now.** Migration 0018 adds `ai_calls`: one row per provider call holding
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

**Session 197 (2026-08-06, branch `claude/ki-usage-task-kg0vix`): the KI-usage task.** Four founder
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
  the learner-facing number stays counts, never money. Full reasoning in `docs/DECISIONS.md` §s197.
**Resume here:** step 2, the reconciliation. It needs one thing from the founder first: the
Anthropic account must be an ORGANIZATION (Console → Settings → Organization) before it can issue
the `sk-ant-admin01-` key the Usage and Cost API requires; OpenAI's organization usage/cost
endpoints need their own key. Then a nightly job pulls yesterday's real figures into a
`provider_costs` table and the control centre shows "ours vs theirs". Also unbuilt: the admin view
of `admin_ai_usage_breakdown` (the RPC exists, nothing renders it yet; it is founder-facing UI, so
it owes a preview round). Open alongside it: the branch has unmerged work and **no PR yet** (part A plus the preview file); part B
is previewed and awaiting a pick, superseded in priority but not cancelled (note for whoever builds
it: `Sparkles` is NOT available as the AI mark, Quiz/empty states/onboarding use it); and the
five-minute `pages.yml` `timeout` raise from s196 is still untaken; CLAUDE.md is now 380 lines
against its ~350 budget and the next docs pass should bring it down. Also still open from earlier
sessions: the Prüfung hub loads ~825 kB of content banks via `engine/exam`, no exam set is `anruf`
shaped, the authored dialogue `nodes` graphs are dead but not retired.

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

Older handoffs (s195 and earlier, including s193's Sprechen rebuild) are archived in
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

Older "Resume here" handoffs (s192 and earlier) are archived alongside their status-log entries in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
