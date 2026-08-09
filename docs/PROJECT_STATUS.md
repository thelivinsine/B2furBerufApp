# Project Status

_Last updated: 2026-08-08 (session 204 made AI usage MEASURED per call and gave Sprechen 6 + 3
conversations a day; session 203 was a documentation-maintenance pass: CLAUDE.md is back under
its line budget and every bank count in the docs is re-measured. Session 202 put the Redemittel a
learner needs on screen WHILE they speak. Both handoffs under "Resume here")._

**Session 204 (2026-08-06 → 08, branch `claude/ki-usage-task-kg0vix`): the KI-usage task.**
**Shipped as PR #835, squash-merged to `main` as `ad8fead`.**
_Started before sessions 197-203 and merged after them, which is why it is numbered here rather
than where its dates would put it. Two things to know about how it landed: the branch carries two
merges of `main` with every gate re-run on the merged tree, and **GitHub never queued a CI run for
the PR** (other branches were queuing normally), so the merge rests on the local gate run, which is
stated in the merge commit._
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
**Resume here:** step 2, the reconciliation. It needs one thing from the founder first: the
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

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · **Prüfung** · Fortschritt, s182: Schreiben moved into the Prüfung hub),
the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks — every number below is `pnpm lint:content` output measured on 2026-08-08 (s203).
Re-measure before quoting; do not carry these forward.** vocab **1,768** (**1,758 browsable**; 8
mis-filed noun+verb combos retired in s142 + 2 true duplicates retired in s178, ids kept; the mix is
**77.3 % noun / 13.7 % verb / 6.1 % adjective**) · collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **32 topics / 320 drills** (18 groups; 110 productive, i.e. no options) ·
Lese-/Hörtexte **52** (156 checks) ·
writing tasks **717**, every one servable (s181), in 40 theme×length pools ·
Can-Do **57** · Sprech-Szenarien **36** (214 nodes, 394 options; level mix 13 / 15 / 8; every
scenario ends in a free-speak turn since s182) · exam sets **21** (the 6 above the entry rung came in
s194) · missions **6** (35 scenes, 11 NPCs, 7 key items) ·
provenance **3,604 rows** (four concatenated parts since s182, TS2590; append to the LAST) ·
themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121); four of them carry themes,
`pruefung` carries none and never has. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,591 of 3,604 provenance rows are AI-drafted `draft`**; only **13** are
human-verified (13 vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset to restart the
review pass; see `strategy/DATA_GOVERNANCE.md`). The full picture of what the banks do and do not
cover is `docs/reports/CONTENT_AUDIT_2026-07-30.md` (session 178), whose backlog is **closed
except P10** since s198. The writing bank has its own quality audit since s199,
`docs/reports/writing-tasks-audit-2026-08-07.md`: the tasks read well, but a third of the Branche
tags were unearned and the Niveau tag scaled the word target without scaling the task. **P1, P2, P3
and P5 are shipped (s199, s200); P4 is marked WRONG in the report** and replaced by an optional
reply-task wave.

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

**Handoff after session 203 (2026-08-08): the docs are back inside their own rules.** Branch
`claude/documentation-maintenance-0w4ywg`, PRs **#832** → **`48d250c`** (the pass), **#833** →
**`8a45be9`** (its paper trail) and **#837** (this closing entry), each squash-merged. Validate
content and Deploy site to GitHub Pages green on `main`; Deploy Supabase functions correctly did
not run (path-filtered, nothing under `supabase/` changed). Post-merge housekeeping done after every
merge, tree clean.
Founder prompts: "do the documentation maintenance" → "document the session".
No app code was touched, so nothing needs live verification.

- **`CLAUDE.md` is 349 lines** (was 399; the linter warns past ~350). It now carries the RULE plus a
  pointer, and nothing else. **Write to that shape:** if a new bullet needs a measurement, a
  mechanism or a story, that part goes in the matching `docs/areas/*` file and the "why" in
  `DECISIONS.md`. There is ~1 line of headroom, so any new law costs an old line somewhere.
- **Counts are measured, not remembered.** Five bank counts in `PROJECT_STATUS` and three claims in
  the area docs had drifted, some by 60 %. Every number in "Where things stand" is now stamped
  2026-08-08 and comes from `pnpm lint:content`. Re-run it before quoting any of them.
- **Nothing was reworded away.** The three laws that had no area-doc home were given one first
  (`CONTENT.md` for the `source` reply-genre rule and the phrase-level argumentation classifier, the
  `/design` skill §7 #12 for the touch-`:hover` law), so the trim removed duplication only.
- **Still open, small** (unchanged from s201): the Sprechen/Schreiben Verlauf spinner has no timeout,
  so an unreachable Supabase hangs it forever.
- **The next content job** is still the reply-task wave (writing-audit P4 replacement): 47 authored
  `source` texts plus the rendering slot that does not exist yet. The brief is in
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`, and the founder has not yet picked a
  placement from `preview/schreiben-source-text.html`.

**Handoff after session 202 (2026-08-08): a practice conversation now carries its Redemittel while
the learner speaks.** Branch `claude/sprechen-filter-rail-practice-70gydw`. Three PRs: **#830** →
**`9c4ca3b`** (the rail), **#831** → **`e7f1c7f`** (the paper trail), **#834** → **`9e0b74e`** (the
founder's second pass on the tile). Validate content and Deploy site to GitHub Pages green on each;
Deploy Supabase functions correctly did not run (path-filtered, nothing under `supabase/` changed).
Post-merge housekeeping done after each, tree clean. **Session 203 ran in PARALLEL** and reached
`main` first, so #834 merged `origin/main` before shipping; this session stays s202 throughout.
Founder prompts: "for the sprechen part, I'd want you to add a filter rail kind of rail with useful
redemittle even in the practice sessions" → "option a's layout for desktop and option c for mobile
and also desktop's content" → "the aufgabe text is being cut off ... the Redemittel pills at the
bottom should be at the top of that tile and the selected pill should also be shown ... adapt the
same heirarchy for Redemittel in desktop view as well".

- **The tile's hierarchy is the founder's second pass** (same session, PR **#834**): intent pills at the TOP,
  all four, the current one lit, no dropdown (a lit pill states the selection, so a dropdown would
  say it twice), and the phone drawer's task title on its own line below the tabs instead of beside
  them, where it was cut off. Desktop and phone run the same order.
- **What to check first:** the founder answered layout only, so three content defaults are stated
  and one-line reversible (`docs/DECISIONS.md` §s202): all eight phrases per intent, Anrede matched
  to the partner, English hold-to-peek. Ask if they want any flipped.
- `RedemittelHelp` is one content in two shells; `ConversationRunner` takes it as `help`, which is
  what keeps it out of the Modelltest and out of the exam chunk. Never import it in the runner.
- `ScopeRail.onReset` is now optional, for the one rail that browses rather than narrows. Every
  other caller is unchanged.
- **Not done, deliberately:** no speak button on a phrase (it would fight the partner's voice) and
  no way to send a phrase into the conversation (reading is not saying, and the transcript is what
  the debrief grades).
- **Open, not this session's:** PR **#808** "docs: record the s192 merge"
  (`claude/prufung-ui-bottom-bar-u0fdwf`) is still open and stale. It needs a founder call, merge or
  close; nothing here depends on it.

Older handoffs and session logs (s201 and earlier) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
