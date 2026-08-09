# Project Status

_Last updated: 2026-08-09 (session 205 reordered the nav, ended onboarding in the Bibliothek and
made the INTERFACE LANGUAGE follow the learner's level: A2/B1 English, B2/C1 German, learning
material German at every level. Session 204 made AI usage MEASURED per call and gave Sprechen 6 + 3
conversations a day. Both handoffs under "Resume here")._

**Session 205 (2026-08-09, branch `claude/remove-onboarding-practice-z7qfwu`): the nav order, the
onboarding hand-off, and the interface language.**

Founder, three prompts: *"remove the onboarding practice session when a new user signs up … finish
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
- Gates: typecheck · lint 0 errors (77 warnings, unchanged baseline) · **688 tests** (up from 685 on `main`,
  new `tests/uiLang.test.ts` pins the level rule, the German-fallback and the dictionary's shape) ·
  build · check:bundle 152.3 kB · check:contrast · lint:content (CLAUDE.md back under its budget).
  Verified in a real browser at 390px and 1280px, at A2 and at B2.

**Resume here (s205):** the language work is complete for chrome the learner meets, and the pattern
is documented in `docs/areas/UI-LANGUAGE.md`. What is left is deliberate, not missing: the four
items above stay German by decision, and any NEW surface must call `useT()` and add its pair to
`uiStrings.ts` (the area doc says how). Worth a founder look on the live site: the Prüfung module
names now read Reading/Listening/Writing/Speaking in English, which is a judgement call, and the
sidebar tagline still says "German for work · B2" for every level.

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
