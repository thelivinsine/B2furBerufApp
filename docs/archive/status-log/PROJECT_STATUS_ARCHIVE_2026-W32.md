

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
