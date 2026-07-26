# Session & Prompt Log

**Purpose.** A chronological, append-only record of every instruction the founder gives and the
assistant's response to it. This exists to create a clear, timestamped **paper trail of authorship
and creative direction** for the elements of this app, in case we register or defend copyright in
them. It complements (does not replace) the primary record, which is **git history** (timestamped,
authored commits) and the **merged pull requests**.

> Not legal advice. For an actual filing, a lawyer should advise on what evidence matters in the
> relevant jurisdiction (the product targets Germany/EU, where copyright protects human-authored
> creative expression; a log showing substantial human creative direction strengthens that claim).

## How this log is maintained (the rule)
- **Every founder prompt gets one entry**, appended in order, newest at the bottom. Entries are
  never edited or deleted after the fact (append-only); corrections go in a new entry.
- Each entry records the meta info below. Prompts are stored **verbatim** (they are the creative
  direction). If a prompt included an attachment (image, file), that is noted.
- The assistant writes the entry as part of handling the prompt. Keep the **response summary**
  concise but specific, and always tie it to the resulting **artifacts** (files, commit SHAs, PRs)
  so each instruction is traceable to the code that realized it.
- **Do not paste secrets** (keys, tokens, personal data) into this file; it is committed to the repo.
- This file is the detailed trail. `CLAUDE.md` only carries the short rule and points here, and
  `docs/PROJECT_STATUS.md` keeps the higher-level session narrative. Keep those lean; put the
  blow-by-blow here.
- **Append to the tail, don't re-read the whole log.** To add an entry you only need the last entry's
  number and the template above. Read the final ~30 lines, not the entire file, so logging stays cheap
  as history grows.

### Rotation policy (keep the live file bounded, added 2026-07-05)
This live file must not grow without limit. **Budget: keep the current session plus roughly the last 5
sessions here, and rotate whenever the live file passes ~1,200 lines.** To rotate, move the oldest
entries out of this file into the **ISO-week** archive under `docs/archive/prompt-log/` (one file per
week, `SESSION_PROMPT_LOG_YYYY-Www.md`; see that folder's `README.md` index). Append each moved entry to
the week file matching **its own date** (create the week file if it does not exist yet, with the same
short header the others use). Keep this header, the rule, and the entry template in the live file. The
week archives themselves are append-only history: never rewrite entries when moving them, and loading a
single week stays cheap because each week file is small.

### Automated raw capture (removed 2026-06-25)
There used to be a `UserPromptSubmit` hook (`.claude/hooks/log-prompt.sh`) that appended one JSON
line per prompt to **`docs/prompt-log-raw.jsonl`**. The founder asked for it to be removed on
2026-06-25, so the hook and its script are gone and `.claude/settings.json` no longer wires it. The
existing `docs/prompt-log-raw.jsonl` is kept as a historical record but is no longer appended to.
This curated Markdown file remains the prompt log, and entries are now added **manually**. The founder
directed (s42) that **any "update the documentation"-type request implies updating this log too**, even
when the prompt log is not named explicitly. So whenever you update `docs/PROJECT_STATUS.md` for a
session, append that session's prompts here as well and ship them together.

### Entry template
```
## Entry N — <YYYY-MM-DD HH:MM UTC>
- **Branch:** <git branch>
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** <none | description>
- **Prompt (verbatim):**
  > <the founder's message>
- **Response summary:** <what the assistant did / answered>
- **Artifacts:** <files changed · commit SHAs · PR #s · merge SHAs>
```

---

## Archived entries

Everything **through session 151 (2026-07-23)** is archived by ISO week under
**`docs/archive/prompt-log/`** (`SESSION_PROMPT_LOG_2026-W25/W26/W27/W28/W29/W30.md`; see that folder's
`README.md` index). This file holds **session 152 / 2026-07-23 onward** (s133–151 were rotated into the
W29/W30 chunks on 2026-07-24). Keep appending here, newest at the bottom, and rotate per the policy above.

## Session 152 — 2026-07-23 — Admin control-center nav aligned to the app sidebar (branch `claude/admin-page-access-ok8g52`)

_(Restored: this entry was dropped when the parallel session-153 branch merged over the append-only log; re-added from the branch history / PRs #656, #660, #661.)_

- **Prompt 1 (verbatim):** `how do I access the admin page? is there a button in the app for the admins?` →
  Answered from code: the account-menu dropdown shows a **"Kontrollzentrum"** link to `/admin` for
  founder accounts (`AccountMenu.tsx:162`), gated on the two `FOUNDER_EMAILS` in `src/lib/admin.ts`
  (client) + Supabase RLS (server). Also `/sources` + the founder-only `/sources/werkbank`.
- **Prompt 2 (verbatim, screenshot of the open account menu):** `I don't see it here` → pointed out the
  blue "Kontrollzentrum" link was already visible in the screenshot.
- **Prompt 3 (verbatim):** `It's working`
- **Prompt 4 (verbatim):** `can you compare the nagivation panel in the actual app vs the admin control center? The spacing can be adapted from the actual app as currently it looks cramped` →
  **PR #656:** admin sidebar column 224→256px, `p-3`→`p-4`, marks 16→18px, rows
  `px-2.5/gap-2.5`→`px-3/gap-3`.
- **Prompt 5 (verbatim):** `push changes live to main` → confirmed #656 already squash-merged.
- **Prompt 6 (verbatim, screenshot of the Übersicht cockpit):** `is this how it's supposed to look after your changes?` →
  Confirmed the running build contained the fix.
- **Prompt 7 (verbatim, app-sidebar screenshot):** `It doesn't look same as this` + mid-turn
  `check the logo size and the space below the logo as well. Also the navigation panel's width` →
  **PR #660:** active row → grey `bg-border` pill + bold text (was blue tint), inactive
  `text-foreground/80`; header rebuilt to the app pattern (wordmark `Logo` `h-7 w-auto` + subtitle +
  `mb-4`). Width already 256px.
- **Prompt 8 (verbatim):** `document the session` → PR #661 (status doc + this log; moved s150/s149 to
  the W30 archive).
- **Artifacts (session 152):** `src/features/admin/AdminShell.tsx` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` · this log · PRs #656, #660, #661

## Session 153 — 2026-07-23 — Admin Control Center chunks 4-10 + landing back-button fix (branch `claude/landing-back-button-routing-jyhwot`)

- **Prompt 1 (verbatim):** `> I found that the back button routing for the pages on the landing page
  is wrong or not working. Check all the routings alogn with the back button and fix those.`
- **Response 1:** Audited every page linked from the landing (`LegalChrome`: /about /privacy /terms
  /sources; `HelpChrome`: /hilfe + /hilfe/:slug). One real bug: `HelpChrome`'s Back button was hardcoded
  to `navigate("/hilfe")`, so on the Help hub (where the landing's Help link lands) Back looped to the
  same page. Fixed to the history-aware `handleBack` (navigate(-1), fallback `/welcome`) `LegalChrome`
  already uses; the article breadcrumb still links to the hub. Committed + pushed.
- **Artifacts (prompt 1):** `src/features/help/HelpChrome.tsx`
- **Prompt 2 (verbatim):** `> alright if it's fixed, continue with admin control center build plan
  next chunk and work until chunk 10`
- **Response 2:** Built + shipped Admin Control Center chunks 4-10 per
  `docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md`, each its own commit passing the full gate set. Chunk 4
  Review Cockpit (`review-score.mjs` + `build-review-queue.mjs` → `reviewQueue.json`, `Pruefmodus.tsx`,
  `tests/reviewScore.test.ts`). Chunk 5 Feedback-Inbox (`AdminFeedback.tsx`). Chunk 6 System health +
  Launch checklist (`AdminSystem.tsx`, `AdminLaunch.tsx`, `systemHealth.ts`). Chunk 7 Steuerung core
  (`src/lib/appConfig.ts` + `AdminSteuerung.tsx`, consumers H1/H2/H4/H5/H6/H8, `tests/appConfig.test.ts`
  pinning the empty==defaults invariant). Chunk 8 report sidecars (`report-sidecar.mjs` + 4 scripts,
  `reportStaleness.ts`). Chunk 9 content intelligence (`AdminInhalte.tsx`; coverage sidecar residual
  ids). Chunk 10 Steuerung wave 2 (H3 Impressum + confirm dialog, H7 streak pill, H10 landing copy, H12
  Demo-Modus). test:unit 275/275; main chunk ~112-116 kB.
- **Prompt 3 (verbatim):** `> merge to main .` (with a mid-turn `> document the session once done`)
- **Response 3:** Opened PR #664 and squash-merged into `main`. main had advanced through s147-152, so
  merged main into the branch and reconciled overlapping locked surfaces (nav-items/BottomTabBar/Sidebar
  from the Schreibtraining nav promotion, AppShell header, AdminShell/Overview from the admin-nav
  alignment #656/#660, router.tsx `/sources/werkbank` + `/impressum`); regenerated the report sidecars;
  renumbered this session's docs to 153 to avoid the s146 collision on main. Updated PROJECT_STATUS
  (s153 header + handoff, s151 rotated to the W30 archive), the build-plan status, the CLAUDE.md admin
  bullet, and this log.
- **Artifacts (prompt 2-3):** `scripts/{review-score,build-review-queue,report-sidecar,verify-facts,verify-cefr,review-queue,report-exercise-coverage}.mjs`
  · `src/features/admin/{Pruefmodus,reviewQueueData,AdminFeedback,AdminSystem,AdminLaunch,AdminSteuerung,AdminInhalte,systemHealth,reportStaleness,AdminApp,AdminOverview}.tsx/.ts`
  · `src/features/admin/reviewQueue.json` · `src/lib/appConfig.ts` · `src/App.tsx` ·
  `src/components/layout/{BottomTabBar,Sidebar,FeedbackButton,AppShell}.tsx` ·
  `src/features/vocabulary/{VocabList,VocabularyTrainer}.tsx` · `src/features/welt/NeulandHub.tsx` ·
  `src/features/dashboard/Dashboard.tsx` · `src/features/landing/LandingPage.tsx` · `src/router.tsx` ·
  `package.json` · `tsconfig.app.json` · `tests/{reviewScore,appConfig}.test.ts` · docs · PR #664

## Session 154 — 2026-07-24 — App-wide contrast + squircle pass (branch `claude/admin-page-access-ok8g52`)

- **Prompt 1 (verbatim):** `what's the next step in the admin control center build plan? why are many pages in control center empty?` →
  Explained from the build plan + `AdminApp.tsx`: only chunks 1-3 were live, the other 7 tabs rendered
  `AdminPlaceholder`; next = chunk 4 (Review Cockpit, Opus).
- **Prompt 2 (verbatim):** `are you sure that's the case? I think I already asked in one of the sessions to implement until chunk 10` →
  Verified via git history + prompt log: only chunks 1-3 were on `main` at that point; the s143 request
  was to WRITE the 12-chunk plan (which covers chunk 10), not implement it.
- **Prompt 3 (verbatim):** `I found the issue. The branch where the aork was done didn't merge with main. Now it did. Clone the latest main. I have some feedback` →
  Pulled latest `main` (PR #664, "Admin Control Center chunks 4-10", now merged as s153); the real
  admin screens are present. Reset the branch to latest main.
- **Prompt 4 (verbatim):** `there's a problem with the preview. The view buttons are not same as in the app. Also, there's very little differenxe between rhe dark mode options. Fix these two and provide a new version of the preview` (context: prompt 4-of-this-session actually followed a first preview) →
  (Design context) Founder reported low card/background AND button/card contrast in both themes + the
  page toggles/filter pills too round; asked for contrast previews using Wörter + Satzlabor as examples,
  changes app-wide. Built `preview/contrast-squircle-review.html` (3 contrast options × light/dark ×
  pill-vs-squircle), published as a claude.ai artifact. This prompt then fixed it: the view switcher now
  matches the app (icon-only 36px squares on a white sliding pill, Table2/Waypoints/LayoutGrid/List),
  and the dark options A/B/C were pushed clearly apart (A near-black ground, B bright lifted cards, C
  deep-blue ground + bluer cards + accent edge). Republished (same URL).
- **Prompt 5 (verbatim):** `go with option B for light mode and option C for dark mode. squircle looks good. Do a robust implementation with highest quality and standards.` →
  **PR #665.** Contrast in `src/index.css`: dark = Option C (deep-blue ground `226 44% 6%`, brighter
  bluer cards `224 26% 18%`, 12% surface↔bg gap, accent-tinted brighter border, brighter primary/ring),
  light = Option B (stronger shared `shadow-soft` in `tailwind.config.ts`, deeper `--muted`/`--border`;
  s140 ground + `--background` gate anchor untouched). Squircle: `rounded-full`→`rounded-lg`/`rounded-md`
  on `LibrarySwitcher` + `WritingModeSwitcher` + Fokus O/K toggle (`FokusTrainer.tsx`) + `FilterRail`
  facet pills + `GrammarRail` form pills. Gates: `check:contrast` (40+ pairings re-pass), build,
  check:bundle 116.5 kB, lint 0 errors, test:unit 284/284. Squash-merged, branch realigned.
- **Prompt 6 (verbatim):** `yes go ahead and document the session and save the preview files on repo` →
  Confirmed `preview/contrast-squircle-review.html` was already on `main` (rode in with #665's squash);
  documented as session 154 (PROJECT_STATUS header + handoff, moved the s152 handoff to the W30 archive,
  restored the s152 prompt-log entry that the parallel s153 merge had dropped, appended this entry,
  updated CLAUDE.md token facts).
- **Artifacts (session 154):** `src/index.css` · `tailwind.config.ts` ·
  `src/features/library/LibrarySwitcher.tsx` · `src/features/writing/WritingModeSwitcher.tsx` ·
  `src/features/writing/fokus/{FokusTrainer,GrammarRail}.tsx` · `src/features/shared/FilterRail.tsx` ·
  `preview/contrast-squircle-review.html` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` · `CLAUDE.md` · this log · PR #665

## Session 155 — 2026-07-24 — Design-preferences distillation → the `design` skill (branch `claude/design-prefs-documentation-e1xmlc`)

- **Prompt 1 (verbatim):** `You're a highly talented and skilled senior expert with decades of design and software engineering expertise who worked in billion and trillion dollar tech companies. can you read (by using subagents maybe) all the prompts in the logs regarding all the design, layout,  related changes, reworks, my preferences, expectations especially in Bibliothek section, Schreiben section (except the verlauf - I want to rework it), and Praktisch pages, and suggest me if writing a skill or saving preferences in claude.md is better? because everytime I ask Opus or Fable to create a new page or section, I get a very bad output and needs too much rework. How can I make this better?` →
  Two research subagents mined `SESSION_PROMPT_LOG.md` (s133-154), `DECISIONS.md`, `PROJECT_REFERENCE.md`
  and the `preview/` inventory for every design/layout preference, rework pattern, rejection, and
  process preference (Bibliothek, Schreiben minus Verlauf, Praktisch, global). Recommendation: a
  **hybrid**, detailed playbook as a project skill + a short mandatory pointer in CLAUDE.md (CLAUDE.md
  alone is always-loaded and already ~1,070 lines, so detail there costs tokens every session and gets
  diluted; a skill alone triggers probabilistically). Built `.claude/skills/design/SKILL.md`
  (`/design`): rule zero (extend the system; Bibliothek is the reference), the 8-step preview-first
  process, a pre-flight checklist ranked by actual past rework frequency (redundancy > color > size >
  dead controls > corners > placement > motion), the locked color language, reusable building blocks,
  per-section anchors, and the shipped-then-reverted landmine list. Added the mandatory load-the-skill
  anchor to CLAUDE.md's "Founder design preferences" section.
- **Artifacts (session 155):** `.claude/skills/design/SKILL.md` · `CLAUDE.md` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` · this log · PR #668
- **Prompt 2 (verbatim):** `can you also check claude.md and suggest best practice as it's quite huge at the moment?` →
  Report-first: measured CLAUDE.md at 1,078 lines / ~36k tokens loaded in EVERY session; diagnosed
  it as "a changelog wearing a rulebook's clothes" (supersession narratives instead of current law;
  the biggest sections: UX overhaul 336 lines, mobile bar 130, commands 117, brand 106). Proposed:
  shrink CLAUDE.md to ~300 lines of current law + one-line command index + hard invariants + area
  pointer index; move detail into on-demand `docs/areas/*` files rewritten current-state-only; add
  a `/content` skill for the authoring workflow; add a maintenance rule + a warn-only linter
  ratchet so it never regrows. Estimated ~28k tokens saved per session.
- **Prompt 3 (verbatim):** `yes go ahead` →
  **PR #671.** Executed the restructure: CLAUDE.md rewritten to ~180 lines (identity + maintenance
  rule + stack + command index + layout map + hard invariants + design-prefs summary + writing
  style + area index + deployment + workflow + roadmap pointers). New `docs/areas/` files
  (COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN, PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN,
  COMPONENTS), each de-narrated to current state with every rule and landmine preserved. New
  `.claude/skills/content/SKILL.md` (iron laws + gate order). `scripts/lint-content.mjs` warns
  when CLAUDE.md exceeds ~350 lines. Cross-references updated (design skill §8, PROJECT_STATUS).
  `pnpm lint:content` green.
- **Artifacts (session 155, part 2):** `CLAUDE.md` · `docs/areas/*.md` (10 files) ·
  `.claude/skills/content/SKILL.md` · `.claude/skills/design/SKILL.md` ·
  `scripts/lint-content.mjs` · `docs/PROJECT_STATUS.md` · this log · PR #671
- **Prompt 4 (verbatim):** `document the session ` →
  Confirmed the session was already documented incrementally (the s155 PROJECT_STATUS header +
  two-part handoff, the W30 archive move of the s153 handoff, prompt-log entries 1-3 with PR #668
  and #671); appended this closing entry and merged the documentation to `main`.
- **Session 155 summary:** two deliverables, both squash-merged. **PR #668**: the `/design` skill
  (`.claude/skills/design/SKILL.md`), distilled by research subagents from the s133-154 prompt log
  + DECISIONS.md, with the mandatory pointer in CLAUDE.md. **PR #671**: CLAUDE.md restructured
  from 1,078 lines (~36k tokens, always loaded) to ~180 lines of current law; detail moved
  current-state-only into `docs/areas/` (10 files); new `/content` skill; warn-only CLAUDE.md
  size ratchet in `scripts/lint-content.mjs`. `pnpm lint:content` green throughout.

## Session 156 — 2026-07-24 — Admin chunk 11 (Turnstile) completion + chunk 12 (compliance pack) (branch `claude/admin-page-access-ok8g52`)

- **Prompt 1 (verbatim):** `what's next in admin control center?` →
  Reported chunks 1-10 shipped; described chunk 11 (Turnstile + abuse meters) as next. (This first
  description was stale, corrected below.)
- **Prompt 2 (verbatim):** `didn't I already do the backend task which you're describing for chunk 11?` →
  Checked the code and corrected myself: most of chunk 11 already existed. The Turnstile widget +
  full `useAuthStore` `captchaToken` integration were built ~s136, and `submit-feedback` already had a
  per-IP burst limit + a global hourly email cap. The `AdminSystem` "Gast-Konten" tile just showed a
  hardcoded "still off (chunk 11)" label.
- **Prompt 3 (verbatim):** `did it only in supabase.` →
  Flagged the failure mode: `pages.yml` bakes `VITE_TURNSTILE_SITE_KEY` at build from a GitHub secret;
  with Supabase CAPTCHA on but that secret unset, the client sends no token and Supabase rejects
  guest/email sign-in (Google/OAuth is not captcha-gated, masking it). Gave the fix (set the GitHub
  secret + redeploy) or the fallback (disable Supabase CAPTCHA).
- **Prompt 4 (verbatim):** `i also did it in GitHub` →
  Noted GitHub secrets bake in at BUILD time, so a fresh deploy is needed. **PR #669:** the AdminSystem
  tile now reads the real `TURNSTILE_ENABLED` flag (active / warn), and the Launch note states both
  sides are required; merging triggered a fresh Pages build carrying the secret.
- **Prompt 5 (verbatim):** `the live signin works already` →
  Turnstile confirmed live end-to-end. **PR #670:** marked the Turnstile item done in
  `PROJECT_STATUS.md` + `PROJECT_FOUNDATION.md` (needs both sides; PR #669 wired the reporting).
- **Prompt 6 (verbatim):** `go ahead with chunk 12` →
  **PR #672 (compliance pack).** §G2 consent-drift gate (`src/lib/legalMeta.ts` canonical date +
  `consentInSync()` + `tests/consent.test.ts` + a red Launch warning). §G3 auditor export
  (`src/lib/auditExport.ts`: register CSV + Markdown summary, one Launch button, `csv.ts` `downloadText`,
  `tests/auditExport.test.ts`). §G4 GDPR ops evidence (`supabase/migrations/0010_gdpr_evidence.sql`:
  content-free `gdpr_events` + `log_gdpr_event()` + `admin_gdpr_evidence()` RPC; `delete-account` +
  `exportUserData` log events; Launch panel counters + pg_cron retention probe; fail-soft). Founder
  action: run migration 0010 + redeploy `delete-account` (`PHASE2_SETUP.md` §5). Gates: typecheck,
  build, check:bundle 116.8 kB, lint 0 errors, test:unit 289/289. Admin center chunks 1-12 all done.
- **Prompt 7 (verbatim):** `document the session` →
  Updated `PROJECT_STATUS.md` (header + s156 handoff; moved s154 to the W30 archive),
  `docs/areas/LEGAL-ADMIN.md` (chunks 1-12 live + the compliance-pack detail), and this log.
- **Artifacts (session 156):** `src/features/admin/{AdminSystem,AdminLaunch}.tsx` ·
  `src/lib/{legalMeta,consent,csv,auditExport,adminApi,dataExport}.ts` ·
  `src/features/legal/PrivacyPolicy.tsx` · `supabase/functions/delete-account/index.ts` ·
  `supabase/migrations/0010_gdpr_evidence.sql` · `tests/{consent,auditExport}.test.ts` ·
  `docs/plans/{PHASE2_SETUP,ADMIN_CONTROL_CENTER_BUILD_PLAN}.md` · `docs/areas/LEGAL-ADMIN.md` ·
  `docs/PROJECT_STATUS.md` · `docs/PROJECT_FOUNDATION.md` · this log · PRs #669, #670, #672

## Session 157 — 2026-07-24 — Documentation maintenance audit (branch `claude/docs-maintenance-audit-8pbhx3`)

- **Prompt 1 (verbatim, 2026-07-24 ~11:30 UTC):** `do a documentation maintenance audit and report any priority actions. You are allowed to also say it's currently very good and no actions needed if that's the case as some of the documents were recently optimized` →
  Read-only audit of the whole docs system against its own rules (line budgets, rotation policy,
  two-handoff rule, cross-references, COMMANDS.md vs `package.json`, archive integrity). Overall
  verdict: healthy; the s155 restructure and prior optimization passes are holding. Report delivered
  with 4 priority actions + 2 minor ones, no fixes applied (report-only request):
  P1 rotate `SESSION_PROMPT_LOG.md` (1,573 lines vs the ~1,200 budget; 24 sessions live vs
  "current + ~5"; needs a new W30 prompt-log archive file + index row). P2 `docs/README.md` missed
  the s155 restructure (no `docs/areas/` in the folder map or catalog, no `/design`+`/content`
  skills, outdated CLAUDE.md row description). P3 five stale pointers in live docs to CLAUDE.md
  sections that moved to `docs/areas/` (PROJECT_FOUNDATION.md "Brand logo", PROJECT_REFERENCE.md
  "Mobile bottom tab bar" + "Brand logo", DECISIONS.md Bibliothek section + "Schreiben hub").
  P4 `pnpm check:contrast` is a CI gate in `validate.yml` but absent from the CLAUDE.md command
  index and `docs/areas/COMMANDS.md`; `check:refs` also undocumented. Minor: the W30 row in
  `archive/PROJECT_STATUS_ARCHIVE.md` says "135, 138-143" but the chunk actually holds 135-154
  (verified complete, nothing lost); the archive-pointer paragraph at the end of
  `PROJECT_STATUS.md` duplicates the archive index and could shrink to a two-line pointer.
  Verified healthy: CLAUDE.md 178/~350 lines, PROJECT_STATUS.md 178/~250 with exactly the two
  most recent handoffs (s156+s155), dated content counts, append-only logs intact through s156.
- **Artifacts (session 157):** this log (audit report delivered in chat; fixes await founder go-ahead)
- **Prompt 2 (verbatim, 2026-07-24 ~11:45 UTC):** `I also want your opinion if we need a high-quality comprehensive agent.md file` →
  Opinion delivered: **no comprehensive AGENTS.md**. It would recreate the always-on-bloat problem
  s155 just solved and would drift against CLAUDE.md (violates the one-source-per-fact rule), and
  there is no consumer today: only Claude Code builds this app and it loads CLAUDE.md. Recommended
  instead: an optional **thin ~10-line router AGENTS.md** (no rules of its own, points other coding
  agents at CLAUDE.md → docs/areas/ → the two skills) as zero-drift insurance for any future
  non-Claude tool. Not created yet; awaiting founder go-ahead (can bundle with the six audit fixes
  from prompt 1).
- **Prompt 3 (verbatim, 2026-07-24 ~12:00 UTC):** `go ahead with your recommendations with 6 action items from above and a thin agent.md file` →
  Executed all seven items: (1) rotated this log (s133-134 → the W29 chunk, s135-151 → a new
  `archive/prompt-log/SESSION_PROMPT_LOG_2026-W30.md`, live file back to ~300 lines, archive README
  index updated); (2) `docs/README.md` refreshed for the s155 restructure (new `areas/` catalog +
  skills note + rewritten CLAUDE.md row + archive rows + AGENTS.md row); (3) fixed the five stale
  CLAUDE.md section pointers in `PROJECT_FOUNDATION.md`, `PROJECT_REFERENCE.md` (x2), `DECISIONS.md`
  (x2) to their `docs/areas/` homes; (4) documented `check:contrast` (CI gate) in
  `docs/areas/COMMANDS.md` + the CLAUDE.md CI-gates index, plus `check:refs` and the
  `build:dict-subset`/`build:nouns-subset` internals of `build:oracles`; (5) corrected the W30 row
  in `archive/PROJECT_STATUS_ARCHIVE.md` to sessions 135-154; (6) shrank the `PROJECT_STATUS.md`
  tail archive blob to a two-line pointer; (7) created the thin router `AGENTS.md` at the repo root
  (no rules of its own: CLAUDE.md → docs/areas/ → the skills). Session documented per the standing
  rules (s157 status header + handoff; the s155 handoff rotated to the W30 status archive).
- **Artifacts (session 157):** `AGENTS.md` · `CLAUDE.md` · `docs/README.md` ·
  `docs/SESSION_PROMPT_LOG.md` + `docs/archive/prompt-log/{README,SESSION_PROMPT_LOG_2026-W29,SESSION_PROMPT_LOG_2026-W30}.md` ·
  `docs/PROJECT_STATUS.md` · `docs/PROJECT_FOUNDATION.md` · `docs/PROJECT_REFERENCE.md` ·
  `docs/DECISIONS.md` · `docs/areas/COMMANDS.md` ·
  `docs/archive/{PROJECT_STATUS_ARCHIVE,status-log/PROJECT_STATUS_ARCHIVE_2026-W30}.md` · PR (this one)

## Session 158 — 2026-07-24 — Schreiben nav-icon harmony previews (branch `claude/schreiben-icon-design-cz21ts`)

- **Prompt 1 (verbatim, 2026-07-24 ~11:45 UTC):** `/design the schreiben icon isn't harmonious with other icons. Can you generate a couple of previews?` →
  Diagnosis: the Schreiben pencil (`route-icons.tsx` `/writing`) breaks the icon family three ways:
  it is the only thin diagonal mark in a row of upright chunky shapes, its second color `#fb7185` is
  nearly the same as the rose body `#f43f5e` (no two-tone pop like every sibling), and it reads
  fragile next to the filled geometric marks. Built `preview/schreiben-icon-harmony.html`
  (screenshot-verified in headless Chromium, published as a Claude artifact): current state as
  reference + 4 named variants, each rendered in the real bottom tab bar (light + dark, real tokens,
  29px icons in the 40px squircle pill) plus a magnified 5-icon strip.
  **A** Stift aufrecht (chunky vertical pencil, bright rose-pink `#fda4af` eraser cap) ·
  **B** Federspitze (pen nib, bright breather hole + slit) ·
  **C** Stift mit Schreiblinie (familiar diagonal, thicker, bright tip + written underline) ·
  **D** Zweifarbiger Stift (bold pencil split lengthwise rose/pink, like the split Grammatik
  bookmark). No implementation yet; awaiting the founder's pick by letter.
- **Artifacts (session 158):** `preview/schreiben-icon-harmony.html` · this log
- **Prompt 2 (verbatim, 2026-07-24 ~11:55 UTC):** `I like the option b but I want you to generate more such previews with feather/ink pens and similar colors as other icons not red.` →
  Round 2 built: `preview/schreiben-icon-harmony-r2.html` (screenshot-verified, republished to the
  same artifact URL). B's nib direction carried forward without red, in the cool family colors of
  the neighbor icons: **E** Federspitze Nachtblau (#3D74ED + Neon-Cyan #22d3ee, the compass/library
  color logic) · **F** Federspitze Teal (#14b8a6 + #5eead4, own hue in the cool family) ·
  **G** Schreibfeder/Kiel (feather quill split lengthwise blue/cyan + quill stem) ·
  **H** Füller aufrecht (vertical fountain pen, blue body + cyan nib). Round-1 B (rose) kept at the
  top as reference. Awaiting pick by letter (E-H); implementation would also retint the `/writing`
  accent in `nav-items.ts`.
- **Prompt 3 (verbatim, 2026-07-24 ~12:05 UTC):** `i like E. don't yet implement it. Can you provide better icon suggestions for praktisch section?` →
  **Schreiben decision recorded: variant E (Federspitze Nachtblau, #3D74ED + Neon-Cyan), explicitly
  NOT implemented yet.** New preview round for the Praktisch icon:
  `preview/praktisch-icon-vorschlaege.html` (screenshot-verified, published as its own artifact).
  All bars already show Schreiben as E so the future bar is judged. Current compass kept as
  reference + 4 proposals in Nachtblau/Neon-Cyan: **I** Wegweiser (two direction boards on a post) ·
  **J** Stadt (two buildings with lit windows, the miniature of the Üben city map) · **K** Zuhause
  (house with cyan door) · **L** Route (dashed way from cyan start dot to destination ring).
  Awaiting pick (I-L, or keep the compass). Nothing implemented in the app.
- **Prompt 4 (verbatim, 2026-07-24 ~12:20 UTC):** `I like wegweiser. within oraktisch section, rename the lernen to trainieren and use dumbbell used previously. Now, for the bibliothek section create a couple of icon previews now.` →
  Three parts. (1) **Praktisch nav-icon decision recorded: variant I (Wegweiser)**, implementation
  still held together with Schreiben E. (2) **Implemented the toggle rename** on the Praktisch
  dashboard: "Lernen" → "Trainieren" with the lucide Dumbbell icon restored (it was the toggle's
  icon before the s147 book); `Dashboard.tsx` (label, Dumbbell import, `LernenBook` component
  removed), `AdminSteuerung.tsx` H8 label ("Trainieren"/"Train"), `HelpHub.tsx` closing line,
  comment updates in `Welt.tsx`/`SpielenHub.tsx`, and `docs/areas/PRAKTISCH-NAV.md` refreshed
  (toggle spec + stale "route mark is a dumbbell" corrected to compass). `pnpm build` green.
  (3) **Bibliothek preview round**: `preview/bibliothek-icon-vorschlaege.html` (screenshot-verified,
  own artifact); bars already show Wegweiser + Feder E; current stack as reference + **M**
  Aufgeschlagenes Buch · **N** Bücherregal · **O** Bibliotheksgebäude · **P** Buch mit Lesezeichen,
  all Nachtblau/Neon-Cyan. Awaiting pick (M-P, or keep the stack).
- **Prompt 5 (verbatim, 2026-07-24 ~12:35 UTC):** `I like P. Now previews for the fortschritt` →
  **Bibliothek decision recorded: variant P (Buch mit Lesezeichen)**, implementation still held with
  the other picks. Fortschritt preview round built: `preview/fortschritt-icon-vorschlaege.html`
  (screenshot-verified; delivered as a rendered file after the founder declined the artifact
  publish). Bars already show all picks (Wegweiser I, Buch P, Feder E); current bar chart kept as
  reference + 4 proposals in Himmelblau/Neon-Cyan: **Q** Kurve (rising trend line + neon endpoint) ·
  **R** Gipfel (mountain + cyan summit flag) · **S** Ring (progress ring + neon endpoint) ·
  **T** Pokal (trophy + cyan base). Awaiting pick (Q-T, or keep the bars).

## Session 159 — 2026-07-24 — Grammar-dimensions brainstorm + Fokus Satzlabor Wave 2 (Konjunktiv II + Zustandspassiv) (branch `claude/grammar-dimensions-transformations-l3ib3m`)

- **Prompt 1 (verbatim):** `brainstorm all the grammar dimensions and transformation options. Spin up expert agents if needed for research and analysis. Generate a thorough report, recommendations and couple of previews with the recommendations`
- **Response 1:** Ran four parallel agents (existing Fokus-feature map, grammar data model, design tokens, B1–B2 transformation pedagogy) → `docs/plans/GRAMMAR_DIMENSIONS_BRAINSTORM.md` (15-dimension catalog, rule/hybrid/AI feasibility tiers, top-10 B2-marker ranking, guardrails, Formachsen-vs-Umformungen split, Now/Next/Later/Skip roadmap, 12 worked examples) + two previews on the real tokens.
- **Prompt 2 (verbatim):** `provide the previews as a html artifact here` → published a self-contained toggle artifact (daa4dbb6).
- **Prompt 3 (verbatim):** `do I need to adapt the edge functions in supabase if we apply the satzlabor updates?` → split: enum-exposure (K-II/Zustandspassiv) = prompt tune + `PROMPT_VERSION` bump; operation-style transforms (Register/Satzbau) = real contract change; deep-links = none.
- **Prompt 4 (verbatim):** `your response is too technical and long for me.` → plain 3-bullet version.
- **Prompt 5 (verbatim):** `There's a new version on the main live now. Can you review your answer against it?` → rebased, confirmed the answer held.
- **Prompt 6 (verbatim):** `go ahead with the easy half for schreiben Satzlabor. I also need more clarification on what the other toggle page named Dimension in the preview shows. Where does these go in the app and the whole preview looks chaotic with too much info and less visual heriarhy` → clarified the "Dimension" preview is a founder planning page (not an app screen), rebuilt it as a calm Now/Next/Later/Skip one-pager; built **Konjunktiv II** as the Modus rail axis (promoted `mood`; `PROMPT_VERSION` 2→3); opened PR #678.
- **Prompt 7 (verbatim):** `go ahead with the Zustandpassiv` → added **Zustandspassiv** as a third Genus-Verbi pill (`normalizeDetected` maps it to its own pill; copula safeguard stays in the check-sentence prompt); `transform-sentence` Vorgang-vs-Zustand clarifier, `PROMPT_VERSION` 3→4.
- **Prompt 8 (verbatim):** `document the session and merge`
- **Prompt 9 (verbatim, mid-documentation):** `a small and quick change I'd like to make is redo the explanation of green dot better.. say something like the Green pills mean your sentence. Keep it as simple as possible.` → rail legend simplified to "Grüner Punkt = dein Satz." / "Tippe eine andere Form, um ihn umzuwandeln." (`GrammarRail.tsx` + preview).
- **Response 8+9:** Documented the session (this entry renumbered 152→159 after `main` had advanced to s158; PROJECT_STATUS handoff, `docs/areas/SCHREIBEN.md` Wave-2 axes, brainstorm-doc roadmap). `main` had force-advanced 10 commits (CLAUDE.md restructure #671, prompt-log rotation #677, sessions 155–158); merged it in (code auto-merged: my mood/copy edits + main's cosmetic tweaks both intact; the four doc conflicts resolved to main's new structure, docs re-applied against it), gates green (typecheck · **289** unit tests · lint 0 errors · build · bundle 112 kB · lint:content), squash-merged PR #678.
- **Artifacts (session 159):** `docs/plans/GRAMMAR_DIMENSIONS_BRAINSTORM.md` · `preview/grammar-dimensions-satzlabor.html` · `preview/grammar-dimensions-catalog.html` · `src/features/writing/fokus/grammarDimensions.ts` · `useFokusMachine.ts` · `GrammarRail.tsx` · `FokusTrainer.tsx` · `supabase/functions/transform-sentence/index.ts` · `tests/fokusGrammar.test.ts` · `docs/areas/SCHREIBEN.md` · `docs/PROJECT_STATUS.md` · this log · PR #678 · artifact daa4dbb6
- **Prompt 6 (verbatim, 2026-07-24 ~12:50 UTC):** `publish it now` →
  Published the Fortschritt preview as artifact c4cbc515 (same content as the delivered file).
- **Prompt 7 (verbatim, 2026-07-24 ~12:55 UTC):** `I like option S with the ring.` →
  **Fortschritt decision recorded: variant S (Fortschrittsring).** That completed all four picks, so
  the announced one-pass implementation started: `route-icons.tsx` renderers + `NORM` boxes swapped
  to Wegweiser (/), Buch mit Lesezeichen (/library), Federspitze (/writing) and Ring (/analytics);
  `nav-items.ts` Schreiben accent rose #f43f5e → brand blue #3D74ED; `docs/areas/PRAKTISCH-NAV.md`
  updated. Gates: build · check:bundle 116.9 kB · test:unit green. Live-verified via vite preview +
  Playwright at 393px: all five tabs render the picked marks, matching the approved previews.
- **Prompt 8 (verbatim, 2026-07-24 ~13:00 UTC, mid-verification):** `also in addition, make sure the fortschritt button is always to the left of settings button for all the users by default` →
  `BottomTabBar.tsx`: Fortschritt pinned as `FIXED_LAST_CONTENT` directly left of Einstellungen for
  every user; only Bibliothek + Schreiben stay reorderable (`REORDERABLE`); older persisted orders
  normalise at read time; edit mode shows Fortschritt as a fixed tile; `handleReorder` persists the
  normalised order. `docs/areas/PRAKTISCH-NAV.md` bottom-bar section updated (locked-structure change
  on explicit founder request). Session documented: PROJECT_STATUS s158 handoff added (s157 handoff
  rotated to the W30 archive), header refreshed.
- **Artifacts (session 158):** `src/components/layout/{route-icons.tsx,nav-items.ts,BottomTabBar.tsx}` ·
  `src/features/dashboard/{Dashboard.tsx,SpielenHub.tsx}` · `src/features/{admin/AdminSteuerung.tsx,help/HelpHub.tsx,welt/Welt.tsx}` ·
  `preview/schreiben-icon-harmony{,-r2}.html` · `preview/{praktisch,bibliothek,fortschritt}-icon-vorschlaege.html` ·
  `docs/areas/PRAKTISCH-NAV.md` · `docs/PROJECT_STATUS.md` · this log · PRs #679, #680, #681, #682 + the final implementation PR
- **Prompt 9 (verbatim, 2026-07-24 ~13:20 UTC):** `document the session` →
  Most session-158 documentation had shipped with PR #683 (PROJECT_STATUS header + s158 handoff with
  the s157 handoff rotated to the W30 archive, prompt-log entries 1-8, `docs/areas/PRAKTISCH-NAV.md`).
  This pass closed the loop: appended the s158 decision record to `docs/DECISIONS.md` (all four icon
  picks with rejected alternates, the rose→blue Schreiben accent move, the Trainieren/Dumbbell
  toggle, the pinned-Fortschritt amendment to the locked bar structure, and the preview-method notes
  for future icon rounds), swept for stale references (none found: BRAND.md doesn't spec route marks;
  no compass/stack/pencil mentions left outside the updated PRAKTISCH-NAV.md), and logged this prompt.
- **Artifacts (prompt 9):** `docs/DECISIONS.md` · this log · PR (this one)

## Session 160 (2026-07-26) — branch `claude/selection-color-contrast-3upqkz`

- **Prompt 1 (verbatim, 2026-07-26, with a screenshot of the desktop sidebar):** `the selection here is too dark of gray. as much as the icon isn't clear. Use a much lighter shade than this but darker than the hover shade.` →
  `Sidebar.tsx`: the active nav row moved from `bg-border` (218 13% 84%) to `bg-muted` (220 13% 88%),
  which sits lighter than the old selection but still darker than the `bg-muted/60` hover, so the
  branded route mark reads clearly against it. Typecheck green.
- **Prompt 2 (verbatim, 2026-07-26):** `merge to main` →
  PR #685 opened and squash-merged (`fefa277`), branch reset to the new `main` with
  `--force-with-lease` (post-merge housekeeping). Noted the PWA hard-refresh caveat for live checking.
- **Prompt 3 (verbatim, 2026-07-26, via `/design`):** `I want to redesign verlauf section in shcreiben and fortschritt pages. Do a thorough analysis of the purpose of these pages, current state, how it can be improved and be clear on what value it brings. Use a panel of agents if needed. I need clear analysis and recommendations` →
  Report-only round (no code touched, per the design skill's rule 1). Four parallel agents: Verlauf
  code + data model, Fortschritt inventory, docs/founder-record sweep, learner-value critique.
  Delivered the findings in chat: the correction is never stored (only one tip sentence), Fokus leaves
  no trace in Verlauf, the Aufgabe is unrecoverable, no time dimension; Fortschritt shows vocabulary
  mastery four times while grammar/Redemittel/game show zero times, the exam countdown renders ONLY
  for zero-activity users, and the writing-weakness panel is duplicated (30 vs 60 entries, so the two
  pages could disagree). Recommended a phased rework (A/B/C) with the artifact/aggregate split:
  Verlauf owns artifacts, Fortschritt owns aggregates and direction.
- **Prompt 4 (verbatim, 2026-07-26):** `Generate a few previews based on your analysis and recommendations` (followed mid-turn by `use design skill`) →
  `preview/verlauf-fortschritt-redesign.html` + artifact c3df428e: 3 named Verlauf variants
  (A Korrekturkarten · B Archiv mit Filter-Rail · C Entwicklung zuerst) and 3 Fortschritt variants
  (1 Prüfungs-Cockpit · 2 Diagnose zuerst · 3 Kompetenzkurve), built from the real `src/index.css`
  tokens and real component geometry, screenshot-verified in headless Chromium before presenting.
- **Prompt 5 (verbatim, 2026-07-26):** `I like the concepts C and 3 for verlauf and fortschritt. Go ahead and execute a robust implementation of these concepts to the latest version of the app.` →
  Implemented both picks. `WritingHistory.tsx` rewritten to variant C (trend card + compact
  disclosure rows + Kurz/Lang switcher, with the >=2-texts-per-month comparison floor, "-" for months
  without texts, and a totals fallback). `Analytics.tsx` to variant 3 (Kompetenz curve as headline,
  Prüfung countdown card, writing-aware Diagnose, duplicated weakness panel deleted). New daily
  competence sampling in `useProgressStore` (`masteryHistory`, `canDoAchievedAt`, `recordCompetence`,
  `SEEDED_MILESTONE`) + `lib/competence.ts` called from SessionPlayer `finish`. `getWritingHistory`
  now returns `null` on failure so the error card is reachable. Verified by seeding a demo state and
  screenshotting the REAL pages (light + dark + expanded row), which caught two defects (trend arrow
  compared against a 1-text month; a two-line label pushed its arrow away) that were fixed before
  commit. Gates: typecheck · lint 0 errors · test:unit 289/289 · build · check:bundle 117.3 kB.
- **Artifacts (session 160):** `src/components/layout/Sidebar.tsx` ·
  `src/features/writing/WritingHistory.tsx` · `src/features/analytics/Analytics.tsx` ·
  `src/store/useProgressStore.ts` · `src/lib/competence.ts` · `src/lib/writing.ts` ·
  `src/features/session/SessionPlayer.tsx` · `preview/verlauf-fortschritt-redesign.html` ·
  `docs/areas/SCHREIBEN.md` · `docs/areas/SESSION.md` · `.claude/skills/design/SKILL.md` ·
  `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` · this log · PR #685 + this PR · artifacts
  c3df428e (previews)
