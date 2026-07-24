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
- **Prompt 4 (verbatim, 2026-07-24 ~12:15 UTC):** `whenever, I ask for merging the working branch to main the message i get is there's no PR template. Is it necessary to have a template? would it help us to have a template?` →
  Answered: **not necessary, harmless message.** Every session checks for
  `.github/pull_request_template.md` before opening a PR and narrates "none found"; nothing fails.
  A template would help mildly: it guarantees every PR body answers the same questions (what
  changed / why / gates run / **founder action needed** / docs updated), which strengthens the
  audit/authorship paper trail and puts founder actions in one predictable slot, and it silences
  the recurring message. Recommended a minimal generic 6-heading template (nothing that duplicates
  CLAUDE.md, so it cannot drift); creation awaits founder go-ahead. (Entry re-inserted here after a
  parallel-session merge race; sessions 158-165 landed on main while this session was open.)
- **Prompt 5 (verbatim, 2026-07-24 ~12:30 UTC):** `is it merged to main?` →
  Confirmed: all four session-157 PRs are on main (#675, #676, #677 the maintenance pass +
  AGENTS.md, #704 the re-based prompt-4 entry after the parallel-session merge race). Branch reset
  clean on main. Still open: founder decision on adding the minimal PR template.
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
- **Prompt 10 (verbatim):** `how should I update the edge functions?` → gave the CLI path (`supabase functions deploy transform-sentence`) from `PHASE2_SETUP.md` §6.
- **Prompt 11 (verbatim):** `the project folder is in github though` → founder has no local clone. `transform-sentence` is a single self-contained file (only a remote esm.sh import), so gave the no-terminal path: copy the raw file from GitHub → paste into the Supabase dashboard Edge Functions code editor → Deploy. Also offered the GitHub↔Supabase auto-deploy integration as a permanent fix.
- **Prompt 12 (verbatim):** `done. document the session. we're done here` → founder confirmed the dashboard redeploy is live; marked the `transform-sentence` redeploy DONE in the status header + handoff and logged these follow-ups.
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

## Session 160 — 2026-07-24 — Fokus KI-Hinweis relocated level with the floating Feedback button (branch `claude/disclaimer-text-layout-5zq5g0`)
- **Prompt 1 (verbatim, 2026-07-24):** `can you move the line "Dein Satz wird von einer KI (Anthropic, Google oder OpenAI) geprüft und umgeformt. Die Rückmeldung ist KI-generiert und kann Fehler enthalten. Mehr im Datenschutz." to be horizontally in-line with feedback button for the computer view. Also, for mobile view, I want this line to be condensed as much as possible and reside below the auswerten button with the link to privacy policy with just "Mehr".` →
  Loaded the `design` skill, built `preview/fokus-disclaimer-inline.html` (real light-theme tokens),
  screenshot-verified in headless Chromium, and presented desktop text (full vs shortened) + mobile
  text (shortest vs provider-named) variants via `AskUserQuestion`. Founder picked full sentence
  (desktop) + shortest one-line (mobile).
- **Prompt 2 (verbatim, 2026-07-24):** `I see that in the desktop view the feedback button and the disclaimer are in a separate section but I like the floating button as before and the text should just be moved downwards to the horizontal level of the feedback button. For mobile view, I want you to bring the feedback button next to the auswerten button. Both the buttons should be floating not in a separate section along with the short text below the buttons` →
  Corrected the approach: NO bordered bottom bar. Desktop keeps the existing `FeedbackPill`
  (`fixed bottom-4`) untouched; `aiNoteDesktop` is now a `fixed inset-x-0 bottom-4` note mirroring
  the pill's `lg:pl-64` + `max-w-6xl` + `sm:px-6` offsets, `max-w-[calc(100%-18rem)]` so its right
  edge clears the pill, `pointer-events-none` wrapper with only the `/privacy` link clickable.
  Mobile action group lost its `border-t`/`bg-background/90`/`backdrop-blur` bar chrome: the
  `FeedbackIconButton` now floats beside the flex-1 Korrigieren button with the condensed
  "KI-geprüft, kann Fehler enthalten. Mehr" line centered beneath. Rebuilt `preview/*-inline.html`
  (r2) + re-screenshotted to confirm. `FokusTrainer.tsx` imports `FeedbackIconButton`. Note: the
  mobile note/buttons are pre-correction only (they own the same `m.status !== "corrected"` guard);
  the desktop fixed note always shows on the Fokus tab. Kurz/Lang disclaimer left as-is (founder
  quoted the Fokus string specifically). Gates: typecheck · build · lint (0 errors) ·
  check:bundle 116.9 kB, all green. Could not live-verify (unauth `/writing` redirects to landing);
  founder verifies live.
- **Artifacts (session 160):** `src/features/writing/fokus/FokusTrainer.tsx` ·
  `src/components/layout/FeedbackButton.tsx` (import target, unchanged) ·
  `preview/fokus-disclaimer-inline.html` · `docs/areas/SCHREIBEN.md` · `docs/PROJECT_STATUS.md` · this log
- **Prompt 3 (verbatim, 2026-07-24):** `kurz and lang should also have same design. Also, for the floating button "Mit KI gebaut · Feedback" - make it just "Feedback" with an icon. No need of mit ki gebaut. Do this across the app` →
  Applied the Fokus disclaimer treatment to Kurz/Lang (`GuidedWritingTrainer.tsx`): removed the
  inline disclaimer `<p>` from `content`, added its own fixed `aiNoteDesktop` (Kurz/Lang wording),
  and reworked the mobile action bar (dropped `border-t`/`bg-background/90`/`backdrop-blur`; the
  `FeedbackIconButton` now floats beside Auswerten, plus Neu schreiben after a result, with the
  condensed note beneath). Shortened the feedback label app-wide from "Mit KI gebaut · Feedback" to
  "Feedback": `FeedbackButton.tsx` (`FeedbackPill` default, `FeedbackFullButton` text,
  `FeedbackIconButton` aria/title) + the `AdminSteuerung` label placeholder; remote-config
  `feedback.label` still overrides the pill; icons unchanged. Preview refreshed to r3 (label +
  parity), screenshot-verified. Gates: typecheck · build · lint (0 errors) · check:bundle 116.8 kB,
  all green. Docs: `docs/areas/SCHREIBEN.md` + `docs/areas/PRAKTISCH-NAV.md` + PROJECT_STATUS s160
  handoff updated.
- **Artifacts (prompt 3):** `src/features/writing/GuidedWritingTrainer.tsx` ·
  `src/components/layout/FeedbackButton.tsx` · `src/features/admin/AdminSteuerung.tsx` ·
  `preview/fokus-disclaimer-inline.html` · `docs/areas/{SCHREIBEN,PRAKTISCH-NAV}.md` ·
  `docs/PROJECT_STATUS.md` · this log
- **Prompt 4 (verbatim, 2026-07-24):** `yes, open a PR into main` + mid-turn `and merge` →
  Checked for a PR template (none), opened **PR #688** into `main` and squash-merged it (merge
  commit `4cbf0fe`), triggering the Pages deploy. Post-merge housekeeping ran: `git fetch origin
  main` → `git reset --hard origin/main` → `git push --force-with-lease` on the branch; tree clean.
- **Prompt 5 (verbatim, 2026-07-24):** `document the session` →
  Most of the session had been documented inline across the prior prompts (PROJECT_STATUS s160
  handoff, this log, `docs/areas/SCHREIBEN.md` + `PRAKTISCH-NAV.md`). This pass closed the loop:
  recorded PR #688 + merge SHA in the handoff, appended a `docs/DECISIONS.md` entry (the Schreiben
  disclaimer now bottom-anchored, explicitly overriding the "centered in normal flow" guideline for
  the two trainers only; round-1 bordered bar rejected; "Feedback" label shortening), and added the
  Schreiben exception to the `design` skill §2.6 so a future session doesn't re-center it.
- **Artifacts (prompts 4-5):** PR #688 (merged, `4cbf0fe`) · `docs/DECISIONS.md` ·
  `.claude/skills/design/SKILL.md` · `docs/PROJECT_STATUS.md` · this log
- **Prompt 6 (verbatim, 2026-07-24, + screenshot of the Redemittel table):** `the speaker buttons are not aligned. Fix them by aligning all of the buttons to the right` →
  The first column of the three Bibliothek `DataTable`s put the `SpeakButton` right after the German
  text (`gap-1`), so it landed at a different x per row. Fixed all three sibling tables
  (`RedemittelViews.tsx` "Wendung", `CollocationViews.tsx` "Kollokation", `VocabViews.tsx` "Wort"):
  `min-w-0` on the text span + `ml-auto shrink-0` on the SpeakButton (and `shrink-0` on the Wesen
  gender glyph), so every speaker button aligns to the right edge of that column. Verified with a
  before/after mockup (`preview/speaker-align.html`, screenshot). Gates: typecheck · build · lint
  (0 errors) · check:bundle 116.8 kB, all green.
- **Artifacts (prompt 6):** `src/features/redemittel/RedemittelViews.tsx` ·
  `src/features/collocations/CollocationViews.tsx` · `src/features/vocabulary/VocabViews.tsx` ·
  `preview/speaker-align.html` · this log
- **Prompt 7 (verbatim, 2026-07-24, + screenshot of the desktop KI-Hinweis):** `the text isn't center aligned with the box above like before.. fix it. Keep the hozixontall alignment intact` →
  When the disclaimer moved to the fixed bottom line (s160) it lost the `text-center` the original
  in-flow note had, so it read left-aligned. Restored `text-center` on the `aiNoteDesktop` `<p>` in
  both `FokusTrainer.tsx` and `GuidedWritingTrainer.tsx`. The p already spans the content-column
  width (`max-w-[calc(100%-18rem)]`, left-anchored, = the box above), so centering the text lines it
  up under the box while the fixed `bottom-4` position (the horizontal line with the Feedback pill)
  is untouched. Preview `preview/fokus-disclaimer-inline.html` updated + screenshot-verified. Gates:
  typecheck · build · lint (0 errors) · check:bundle 116.8 kB, all green.
- **Artifacts (prompt 7):** `src/features/writing/fokus/FokusTrainer.tsx` ·
  `src/features/writing/GuidedWritingTrainer.tsx` · `preview/fokus-disclaimer-inline.html` · this log
- **Prompt 8 (verbatim, 2026-07-24):** `document the session` (second documentation pass, after the
  speaker-alignment #690 and re-centering #692 follow-ups) →
  Extended the PROJECT_STATUS s160 handoff with the two later follow-ups (speaker-button right-align
  in the three Bibliothek tables → #690 `e30395f`; disclaimer re-centered under the box → #692
  `894af07`) and updated the shipped-PR list. Logged this prompt. No stale docs found from these two
  micro-fixes (`docs/areas/SCHREIBEN.md` already describes the bottom-anchored note; the table
  column alignment is an implementation detail not spec'd in BIBLIOTHEK.md).
- **Artifacts (prompt 8):** `docs/PROJECT_STATUS.md` · this log

## Session 161 — 2026-07-24 — Quiz-quality pass on the composed session (branch `claude/word-verification-nl4m26`)

Founder reviewed individual session cards from screenshots; each turn diagnosed one exercise type and fixed it.

- **Prompt 1 (verbatim):** `is this a real word?` (screenshot: Vokabel card, EN gloss "target-actual comparison" for "der Soll-Ist-Vergleich") → explained it is a real controlling term but a stiff literal rendering; suggested "target vs. actual" / "plan vs. actual".
- **Prompt 2 (verbatim):** `target/planned vs. actual sounds more natural to me.` → reworded `v_soll_ist_vergleich` EN gloss to "target/planned vs. actual comparison" + the first example gloss; lint:content + build green.
- **Prompt 3 (verbatim):** `how is the user supposed to answer this? am I missing something?` (screenshot: typed-cloze "Lücke", "Regelmäßige ___ sind wichtig.") → confirmed the card was under-specified (only the blanked sentence, no cue for which word); diagnosed via `SessionPlayer` TypingBlock + `engine/session.ts` typedClozeData.
- **Prompt 4 (verbatim):** `yes` → added a muted "Hinweis: <EN meaning>" line under the cloze sentence (always-visible, matches the plain Tippen variant). Preview `cloze-hint-preview.html`.
- **Prompt 5 (verbatim):** `yes merge` → PR #687 (Soll-Ist gloss + cloze hint) squash-merged into `main`; branch reset to main.
- **Prompt 6 (verbatim):** `don't you think this kind of questions are more like A1 level?` (screenshot: plural MCQ "Plural von die Praxis?", distractors die Pausen/die Lager/die Rechnungen) → analysis: the topic (German plurals) is B1-B2, but the FORMAT was A1 because distractors were unrelated nouns, so the learner picks by stem recognition. Offered 3 fixes (same-stem distractors / typed / irregular-only).
- **Prompt 7 (verbatim):** `yes build 1 + 2` — mid-turn additions: `once the user has demonstrated enough competency then the third recommendation could be applied to questions type 1 and 2` and (screenshot: Ausreißer "abdichten" vs Presse/Gehörschutz/Blech) `questions like these are tricky because, abdichten means seal ... what's the main idea behind such questions and how can we reduce ambiguity?` → built plural: `sameStemPluralForms` distractors, new `pluralType` typed `QuizQuestion` kind + `TypedView`, `isTrickyPlural` competency gate at difficulty 3 (plural also added to the d3 branch). Answered the Ausreißer question (main idea = topic membership; ambiguity from mixed POS + weak semantic distance) with 3 reduction options. Previews `plural-variants-preview.html`. Gates: typecheck / lint 0 / test:unit 289 / build.
- **Prompt 8 (verbatim):** `red colored cards here reads like as if these were all mistakes. Chose a different color shade to show progress` (screenshot: round-summary GESAMMELT loot grid, coral wash) → 4-shade preview (`loot-shade-preview.html`); founder picked **Option C** (white cards + Himmelblau "Lv ↑" pill). Implemented in `LootCard`; eyebrow coral → brand blue; trophy ring stays coral.
- **Prompt 9 (verbatim):** `for reducing the abmiguity, referring to the points on how to reduce ambiguity, implement 1 but also mix them up by keep questions which are of a mix like now with different parts of speech but as mentioned in point 2.` → `oddOneOutQ`: added a POS-matched flavour mixed ~50/50 with mixed-POS, and an "genuinely unrelated" outsider guard (different theme + no shared `related` link either direction). Probe over 1,200 questions: 64% fully POS-matched, 0 linked outsiders.
- **Prompt 10 (verbatim):** `yes` → documented the session (this entry, PROJECT_STATUS s161 handoff with s159 rotated to the W30 archive, header refreshed) and opened + squash-merged PR #691 (engine/loot) into `main`.
- **Artifacts (session 161):** `src/data/vocabulary.ts` · `src/features/session/SessionPlayer.tsx` · `src/engine/quiz.ts` · `src/features/quiz/QuestionViews.tsx` · `src/types/index.ts` · `preview/{cloze-hint,plural-variants,loot-shade}-preview.html` · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` · this log · PR #687 (content) + PR #691 (engine/loot)

## Session 162 — 2026-07-24 — GitHub "protect main" banner question (branch `claude/popup-main-branch-safety-d46p9o`)

- **Prompt 1 (verbatim, + screenshot of the GitHub repo banner):** `why is this pop up coming up. is my main branch unsafe?` →
  Explained the banner is GitHub's standard nudge shown on every repo whose default branch has no
  branch-protection rule; it is a suggestion, not an alert that something happened. main is not
  unsafe: "Public" only grants read access, write access stays with the founder account (and the
  sessions it authorizes), and the shipping workflow only touches main via squash-merged PRs
  (force pushes only ever hit session branches, never main). Recommended either dismissing the
  banner or adding a minimal ruleset (block force pushes + restrict deletions on main, with NO
  required PR approvals so the founder-approved auto-ship squash-merge keeps working). Docs-only
  turn, no code changes.
- **Artifacts (prompt 1):** this log
- **Prompt 2 (verbatim, + 2 screenshots of the new-ruleset form):** `this is config correct?` →
  Two blockers spotted: Enforcement status was "Disabled" (ruleset would be ignored) and Target
  branches was empty (name "main" is only a label). Told the founder to set status to Active, add
  target "Include default branch", keep "Block force pushes" ticked, verify "Restrict deletions"
  is ticked, leave "Require a pull request before merging" and all scanning/quality/coverage/
  Copilot options off, then Create. Docs-only turn, no code changes.
- **Artifacts (prompt 2):** this log
- **Prompt 3 (verbatim, + screenshot of the Add target dropdown):** `I'm selecting the default branch then` →
  Confirmed "Include default branch" is correct (main is the default; the rule follows a future
  rename automatically) and warned against "Include all branches", which would also lock the
  session branches where force-with-lease is routine. Reminder: set Enforcement to Active, then
  Create. Docs-only turn, no code changes.
- **Artifacts (prompt 3):** this log
- **Prompt 4 (verbatim):** `okay, it's done now` →
  Founder confirmed the ruleset is created (Active, default branch targeted, restrict deletions +
  block force pushes, nothing else). Recorded the new protection as a standing infra fact in
  `PROJECT_FOUNDATION.md` (Deploy / infra guardrails) and refreshed the `PROJECT_STATUS.md` header
  to s162 (docs-only session, no product changes, so no new Resume-here handoff was added; s160/
  s161 handoffs kept). Wrapped the session: docs PR #694 opened + squash-merged into `main`, branch
  realigned. First merge under the new ruleset doubles as the proof it doesn't block auto-ship.
- **Artifacts (session 162):** `docs/PROJECT_FOUNDATION.md` · `docs/PROJECT_STATUS.md` · this log

## Session 163 — 2026-07-24 — Fokus correction: collapse moved words; Genus-Verbi wrap explained (branch `claude/disclaimer-text-layout-5zq5g0`)
_(Numbered 163 to avoid colliding with the concurrent branch-protection session that also used 162.)_
- **Prompt 1 (verbatim, + screenshot of the Grammatik rail):** `why is zustandpassiv pill in a new line and not next to passiv pill? looks like there's enough space there.` →
  Reproduced the exact pill markup at real widths (`preview/genus-verbi-wrap.html`, screenshot):
  the pills are a plain `flex flex-wrap` row (`GrammarRail.tsx`), so it's a genuine width wrap. On
  the 256px desktop rail the three compact pills are slightly too wide, so "Zustandspassiv" drops to
  line 2 (the gap after "Passiv" is ~135px; the pill needs ~160px). Fits on one line from ~360px
  phones up. Founder chose to LEAVE it (honest wrapping, not a bug).
- **Prompt 2 (verbatim, + screenshot of a correction showing "heute" removed AND added):** `here's a mistake by ai` →
  Traced it: NOT an AI error. The corrected sentence is right; the fix tiles are computed
  client-side by `wordDiff.ts` (LCS), which represents a MOVED word ("heute") as a pure deletion in
  its old slot + a pure insertion in its new slot, reading as a contradictory remove+add. Fixed:
  `collapseMoves()` pairs a same-word deletion/insertion into ONE `{category:"Wortstellung", moved:true}`
  change at the earlier slot; `FokusTrainer` renders a `moved` change as the word once (green, no
  strike/arrow) under the WORTSTELLUNG eyebrow. Added two `wordDiff.test.ts` cases (move collapses;
  a real del+ins of different words does not). Gates: typecheck · build · lint (0 errors) ·
  test:unit (wordDiff + fokusGrammar green). Shipped in PR #695.
- **Prompt 3 (verbatim):** `For the ai generated box, can you include a nochmal/wieder probieren button so that the user can regenerate a response from AI for the same selected grammar elements in the grammar rail?` →
  Reported back before building: transforms are GLOBALLY cached in the `transform-sentence` edge
  function (keyed on source|tuple|prompt_version|model) by deliberate cost-first design, so a client
  regenerate would return the identical cached sentence (button looks broken). A real regenerate
  needs an edge-function change (bypass cache + add variation) + a founder redeploy + accepting a
  small paid AI call per click. Surfaced the tradeoff for a decision (see chat).
- **Prompt 4 (verbatim):** `merge to main when done` + two `AskUserQuestion` picks (cheaper/capped
  variant; cap = **2 alternatives**) → Built the capped "Nochmal" regenerate:
  - **Edge fn `transform-sentence`:** new optional `variant` (server-clamped 0..2); variant 0 keeps
    the original cache key byte-for-byte, variants 1..2 get their own keys (`…\x1fv{n}`) so each
    alternative caches independently + globally; `userMsg` gains an "alternative phrasing" instruction
    for variant ≥ 1; Gemini gets `temperature: 0.9` for variants only (variant-0 output never drifts).
    **Needs a founder redeploy** (self-contained file, Supabase dashboard) to take effect.
  - **Client:** `transformSentence` passes `variant`; `useFokusMachine` caches per `tuple|variant`,
    tracks the current variant per tuple, and `regenerate()` cycles 0→1→2→0 (new variants generate
    once, then cycling is free); `FokusTrainer` adds a "Nochmal" button (RefreshCw) in the transform
    box header beside the speaker. Cost cap: ≤ 2 paid generations per sentence+selection, ever.
  - Gates: typecheck · build · lint (0 errors) · check:bundle 116.9 kB · fokusGrammar green.
- **Artifacts (session 163):** `src/lib/wordDiff.ts` · `src/features/writing/fokus/FokusTrainer.tsx` ·
  `src/features/writing/fokus/useFokusMachine.ts` · `src/lib/sentenceStudio.ts` ·
  `supabase/functions/transform-sentence/index.ts` · `tests/wordDiff.test.ts` ·
  `preview/genus-verbi-wrap.html` · `docs/PROJECT_STATUS.md` · this log · PRs #695 + (regenerate PR)
- **Prompt 5 (verbatim):** `that's deployed` →
  Founder redeployed `transform-sentence` via the Supabase dashboard, so the capped "Nochmal"
  regenerate (variant 0..2) is now live. Marked the redeploy action item done + flipped the s163
  handoff note to LIVE in `PROJECT_STATUS.md`; logged this. Docs-only follow-up.
- **Artifacts (prompt 5):** `docs/PROJECT_STATUS.md` · this log
- **Prompt 6 (verbatim):** `document the session` →
  Session was already logged prompt-by-prompt (this entry) with the s163 PROJECT_STATUS handoff. This
  pass finalized the area guide: added the "Nochmal" regenerate button + the `variant` cache/cap and
  the `collapseMoves`/"Wortstellung" collapse to `docs/areas/SCHREIBEN.md` (current-state law), and
  logged this. Note: session numbered 163; concurrent sessions took 162 (branch protection) and 164
  (Control Center review harmonisation), resolved via append-merges in this log + PROJECT_STATUS.
- **Artifacts (prompt 6):** `docs/areas/SCHREIBEN.md` · `docs/PROJECT_STATUS.md` · this log

## Session 164 — 2026-07-24 — Review harmonised into the Control Center + note/approve save-race fix + apply:reviews (branch `claude/apply-review-decisions-lw5azm`)
_(Branched off `main` at s160; s161–163 landed on `main` from parallel sessions while this was open, so this session is logged as 164.)_
- **Prompt 1 (verbatim, 2026-07-24):** `Wende die anstehenden Review-Entscheidungen auf das Repo an.` (handoff: run `pnpm apply:reviews` keyless with the 14 expected approvals), then before running: `In the control center, if I write a comment and then reject or approve, are the comments being saved? it's unclear` → then `do both` →
  Answered the diagnostic: the `/sources/werkbank` row had only a verified checkbox (= `approve`) + a
  Notiz field (no reject control), and `useWorkbench.onChange` read its base row from a stale memo
  snapshot then `upsert`ed the whole row, so typing a note then approving wrote the row twice off the
  same base and the approve write (empty comment) clobbered the note. **Fix:** `onChange` merges from an
  always-latest `reviewsRef` and serialises writes per `content_id` (`writeChains`). `pnpm apply:reviews`
  could not run yet (no browser export / service key in the env). Commit `85b2586`.
- **Prompt 2 (verbatim, 2026-07-24, + the founder's decision export `genaulyreviewdecisions20260724.json`):** `Can you merge and harmonize the source list with checkboxes page in sources page by bringing it to control center? Integrate all the features from the source list page to the existing review page in control center. Aim for the highest quality` → then `refer to the design skill` →
  Ran `pnpm apply:reviews --from` on the export: 13 hash-matched approvals flipped draft→verified +
  stamped + lint green (commit `5188af2`); 3 rejects → `docs/reports/review-defects.md`; 1
  (`v_besprechung`, null fingerprint) held for re-review. Then, per the design skill, mapped the two
  review surfaces, built a real-token preview (`preview/control-center-review.html`, published as an
  artifact) with two integration variants, screenshot-verified both, and asked the founder to pick.
- **Prompt 3 (verbatim, 2026-07-24):** `Can you add a save button for the Notes field - increase the notes field width if needed` →
  Folded into the harmonised table cell: the note field widened + an explicit **Save button** (appears
  once the note differs from what is stored; still saves on blur/Enter).
- **Prompt 4 (verbatim, 2026-07-24):** `Make sure there's no redundancy in the review mode/prufmodus/warteschlange page. No need of previews anymore. Implement the design directly and merge to main` (founder picked **Variant A** via the question chip) →
  Implemented Variant A directly. Extracted+extended `useWorkbench` into
  `src/features/legal/useWorkbench.ts` (one shared, serialised, decision-centric review store);
  `/admin/pruefen` heads with a Warteschlange / Alle Inhalte sliding-pill switcher (`useSlidingPill`),
  cockpit + `AdminWorkbench` table sharing that store; the table cell gained a segmented
  Freigeben/Ablehnen control (reject was impossible in the table before) + the note Save button;
  `/sources/werkbank` retired (route + `SourcesWorkbench` removed), `/sources` links into the Control
  Center. Removed redundant queue header/status copy. Gates: typecheck · lint (0 errors) ·
  test:unit 291/291 · build · check:bundle 116.6 kB · lint:content. Commit `8d33612`.
- **Prompt 5 (verbatim, 2026-07-24):** `is everything merged to main?` →
  Verified two ways: `origin/main` at `24aa20b` = branch HEAD (0 ahead / 0 behind, clean tree), and
  PR #697 `merged: true`, closed 17:21. Confirmed all four commits (harmonisation + save-race fix +
  apply:reviews) are on `main`; Pages deploy triggered.
- **Prompt 6 (verbatim, 2026-07-24):** `document the session` →
  The session was already documented inline across prompts 1-4 (PROJECT_STATUS s164 handoff +
  `_Last updated_`, this Session-164 log block, `docs/DECISIONS.md`, `docs/areas/LEGAL-ADMIN.md`,
  `CLAUDE.md` route list), all shipped in PR #697. This pass logged prompts 5-6 and confirmed the docs
  are current against `main` (which had advanced to 5bc97da via parallel doc PRs #698/#699). Shipped as
  a small follow-up PR (the s164 branch restarted from latest `main` since #697 was already merged).
- **Prompt 7 (verbatim, 2026-07-24):** `Move the admin control button to the navigation panel` →
  Moved the founder "Kontrollzentrum" link out of the account-menu dropdown into the desktop **Sidebar**
  nav panel, styled like the sibling nav rows (neutral text + `bg-muted` active, ShieldCheck mark, NOT
  accent-blue — avoids the s141 nav-label landmine), founder-gated via `isFounder`. Because the sidebar
  is desktop-only (`lg:block`) and the mobile bottom bar is locked at 5 slots, the account-menu entry is
  kept as a **mobile-only** (`lg:hidden`) fallback so phone founders don't lose access. Verified the row
  against a real-token sidebar mock (screenshot). Gates: typecheck · lint (0 errors) · build ·
  check:bundle 117.0 kB.
- **Prompt 8 (verbatim, 2026-07-24):** `document the session` →
  Prompt 7 (the admin-nav move) was already documented inline (Session-164 log entry +
  `docs/areas/LEGAL-ADMIN.md` shell note) and shipped in PR #701. This pass logged prompt 8, completed
  the artifacts list with the follow-up PRs (#700 docs, #701 nav move), and added the nav move to the
  PROJECT_STATUS s164 handoff. Shipped as a small follow-up PR (branch restarted from latest `main`).
- **Artifacts (session 164):** `src/features/legal/useWorkbench.ts` (new) · `src/features/legal/AdminWorkbench.tsx` ·
  `src/features/admin/Pruefmodus.tsx` · `src/features/legal/Sources.tsx` · `src/router.tsx` ·
  `tests/adminWorkbench.test.tsx` · `src/data/provenance.ts` + `docs/reports/verified-hashes.json` +
  `docs/reports/review-defects.*` · `preview/control-center-review.html` · `src/components/layout/Sidebar.tsx` ·
  `src/features/auth/AccountMenu.tsx` · `docs/DECISIONS.md` · `docs/areas/LEGAL-ADMIN.md` · `CLAUDE.md` ·
  `docs/PROJECT_STATUS.md` · this log · commits `85b2586`, `5188af2`, `8d33612` · PRs #697 (merged `24aa20b`),
  #700 (docs, merged `7792de2`), #701 (nav move, merged `a25c115`)

## Session 165 — 2026-07-24 — Control Center layout aligned to the app + prominent top back-button (branch `claude/control-center-layout-margins-yn6nvd`)

- **Prompt 1 (verbatim, 2026-07-24):** `why are the layouts/margins drastically changing when moved to control center? see the attached screenshots` →
  Diagnosed in chat (report-before-edits). Root cause: the Control Center (`AdminShell`) renders outside
  the app's `AppShell` and had drifted on three layout choices. (1) The `max-width` cap wrapped the WHOLE
  shell (`mx-auto max-w-[1240px]` grid of `256px 1fr`) instead of only the content; (2) the content column
  had no inner `max-w`/`mx-auto`, filling ~984px left-aligned; (3) the sidebar was a centered grid column,
  not pinned to the viewport edge like the app's `fixed left-0 w-64` rail. Net: wider, differently-anchored
  content vs the app's `max-w-6xl` centered column beside an edge-pinned rail.
- **Prompt 2 (verbatim, 2026-07-24):** `also, keep the back to app button somewhere on the top in the navigation panel and make it easy to spot.`
- **Prompt 3 (verbatim, 2026-07-24):** `Do you want me to bring the Control Center's margins into line with the app? - yes`
- **Prompt 4 (verbatim, 2026-07-24):** `no need of preview to bring the control center layout inline with the app.` →
  Implemented directly (founder waived the preview round). `AdminShell` now mirrors `AppShell` exactly:
  desktop sidebar is a `fixed inset-y-0 left-0 z-30 hidden w-64 ... lg:block` rail, content wrapper is
  `lg:pl-64`, and `<main>` is `mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8` (same width, centering,
  and gutters as the app). Below `lg` the rail becomes a top nav bar (no admin bottom tab bar). The
  **Back-to-app** link moved from a small muted bottom link to the TOP of the nav panel, styled as a
  Himmelblau accent tile (`border-accent/40 bg-accent/15 text-accent-ink`, dark `/25` `/10`) with an
  ArrowLeft, so it pops against the neutral nav rows; a compact "App" copy sits top-right on the mobile bar.
  Gates: typecheck · build (green).
- **Artifacts (session 165):** `src/features/admin/AdminShell.tsx` · `docs/PROJECT_STATUS.md` · this log
