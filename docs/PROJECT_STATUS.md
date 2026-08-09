# Project Status

_Last updated: 2026-08-09 (session 206 fixed the Sprechen AI failure the founder reported: it was
the sign-in wall arriving as a grey caption, not a broken model. Session 205 gave the AI cost figure
a second opinion: Anthropic's own daily numbers beside ours in the control centre. Session 204 made AI usage MEASURED per call and gave
Sprechen 6 + 3 conversations a day; see "Resume here")._

**Session 205 (2026-08-09, branch `claude/ki-usage-task-kg0vix`): step 2, the reconciliation.**
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
**Resume here:** nothing is blocked. Two open items, both flagged rather than urgent: **the admin
key expires 2026-09-08** (the card will say so; create a new one and replace the secret), and the
reconciliation covers **Anthropic only** (OpenAI needs its own org key; Gemini has no billing API
and its $0 stays a labelled assumption). Also still unbuilt from s204: **part B, the reserved KI
chip**, previewed in `preview/ki-usage-chip.html` and awaiting a pick.

**Session 206 (2026-08-09, branch `claude/speaking-exercises-ai-error-xk6o7h`): ran in PARALLEL
with session 206, which reached `main` first, so this one renumbered rather than reuse 205.**
**(2026-08-09, branch `claude/speaking-exercises-ai-error-xk6o7h`): "the ai feature
doesn't work" in Sprechen, and the Redemittel rail's second pass.**
Founder prompts: "there is an error with speaking exercies - the ai feature doesn't work" → "for the
redemittel rail, display only 4-5 highly useful and frequently used redemittel phrases, not too many
of them.. Also, the first redemittel is literally overshadowed due to unnecessary shadow effect below
the toggle buttons and pills. fix it" → a screenshot: "this is what happens.. no response".
**The screenshot is what solved it. Nothing was broken upstream:** the caption under the microphone
read "Bitte melde dich an, um mit der KI zu sprechen." Signed out with Turnstile on, `converse`
cannot be called, and the refusal arrived after the learner had started the conversation, opened the
mic and spoken a sentence, in the same grey slot that otherwise says "Ich höre zu …", on a screen
whose quiet header has no account menu (s201). No error, no reply, no way to sign in: it reads as
the app doing nothing.
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
  so the next report is diagnosable from the logs without reproducing it.
- **Redemittel rail (founder's second prompt):** at most **five** phrases per intent, the easiest
  that fit the Anrede by `CEFR_ORDER`, shown in the bank's own order. The pills lost their count (a
  number that cannot vary is dead chrome). The "shadow" was the unconditional `mask-fade-y` fading
  the FIRST phrase out under the pills; it is `useEdgeFade` now, per edge and only where content
  actually continues, which with five phrases is usually nowhere.
- Gates: typecheck · lint 0 errors (77 warnings, baseline) · **676 tests** (up from 675, the cap is
  pinned in `tests/anrede.test.ts`) · build · check:bundle 128.3 kB.
- **Not verified in a browser:** the sandbox's network policy blocks the Supabase project, so the
  conversation screen cannot be reached here. The founder verifies live.

**Session 204 (2026-08-06 → 08, branch `claude/ki-usage-task-kg0vix`): the KI-usage task.**
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

**Its first four prompts** (2026-08-06) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`: the Umformung allowance, the KI-chip
preview the founder redirected, and the answer to "does that cost real money?".

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

**Handoff after session 206 (2026-08-09): the Sprechen "AI doesn't work" was the sign-in wall.**
Branch `claude/speaking-exercises-ai-error-xk6o7h`, PR **#841** → **`d4a4771`**, squash-merged.
Post-merge housekeeping done, tree clean. **Ran in PARALLEL with session 205** (the cost
reconciliation), which reached `main` first; this branch merged `origin/main` and re-ran every gate
on the merged tree (688 tests, bundle 129.3 kB, lint:migrations green).
Founder prompts: "there is an error with speaking exercies - the ai feature doesn't work" → "for the
redemittel rail, display only 4-5 highly useful and frequently used redemittel phrases ... the first
redemittel is literally overshadowed due to unnecessary shadow effect" → a screenshot, "this is what
happens.. no response" → "first merge the changes from this session and make it live" → "complete
the merge and also documentation".

- **The screenshot is what solved it, and it is worth repeating why.** The report said "it loads and
  there's no response from ai", which reads as a broken model, a hung request or a dead key. The
  caption under the microphone said **"Bitte melde dich an, um mit der KI zu sprechen."** The
  founder was signed out. Diagnosis by code review had four plausible branches and no way to choose
  between them from the sandbox (**the network policy blocks the Supabase project**, so the live
  function cannot be probed from here). **Ask for the screen before theorising about the server.**
- **Live verification is the founder's.** Nothing in this change was seen in a browser here: the
  conversation screen needs the backend. Worth a look on `genauly.de`: signed OUT, a scenario's
  brief card should show **Anmelden** instead of a dead "Gespräch starten"; signed IN, everything
  should behave as before.
- **Two real defects were found on the way and are fixed**, both invisible until now: no cascade leg
  in any Edge Function had a timeout, and the free Gemini turn leg had been returning nothing since
  s196 (thinking tokens eating a 500-token budget), so every turn was silently paid for by Claude.
  **If the Sprechen bill looks lower from here, that is why.** The same thinking-budget trap applies
  to any future short-output Gemini call.
- **Still open, small** (unchanged from s201/s203): the Sprechen/Schreiben Verlauf spinner has no
  timeout, so an unreachable Supabase hangs it forever. The leg timeouts shipped here do not cover
  it; it is a client-side fetch with no deadline.
- **The next content job** is unchanged: the reply-task wave (writing-audit P4), 47 authored
  `source` texts plus a rendering slot that does not exist yet, waiting on a founder placement pick
  from `preview/schreiben-source-text.html`.
