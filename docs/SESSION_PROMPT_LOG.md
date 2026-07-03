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

## Session 26 — 2026-06-16 — Mobile nav overhaul
Branch: `claude/context-bar-menu-animations-g9gfd3`. (Logging began at Entry 7; Entries 1–6 are
backfilled from the same session's transcript so the trail is complete.)

## Entry 1 — 2026-06-16 12:18 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > get rid of the context bar completely. it's redundant because each section has a title on the
  > top. Also, when clicked on the more icon, the selection isn't on the more icon - fix it. finally,
  > when organising the menu items in more section, when removed or added an icon, there is no
  > animation at the moment. it's confusing for the user how the icons move around. so add a nice
  > animation showing the movement of the apps from one position to another. finally, make sure
  > there's a feature to move around the icons within the menu bar, currently it's not possible to
  > move them around in the more menu. ask me if anything is unclear
- **Response summary:** Removed the bottom-bar context strip (`BottomTabBar.tsx`), resized the More
  sheet overlay/padding and `.pb-nav`. Added a `moreOpen` prop so the Mehr tab shows selected while
  the sheet is open and pinned tabs de-highlight. Added `layout` + `AnimatePresence` movement
  animations to the bar and sheet. Implemented custom 2D drag-reorder of the More sheet grid,
  persisted via a new `useSettingsStore.moreOrder`. Replaced the drag-down-to-add gesture with the
  green + badge. Updated CLAUDE.md + PROJECT_STATUS.md. `pnpm build` + `pnpm lint:content` green.
- **Artifacts:** `BottomTabBar.tsx`, `MoreSheet.tsx`, `AppShell.tsx`, `nav-items.ts`,
  `useSettingsStore.ts`, `index.css`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`. Shipped via PR #184
  (merge `4502a53`).

## Entry 2 — 2026-06-16 12:38 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > are the changes pushed to production?
- **Response summary:** Explained that production is `main` and the work was only on the feature
  branch, so the live site was unchanged; offered to open a PR and squash-merge to deploy. No code
  change.
- **Artifacts:** none.

## Entry 3 — 2026-06-16 12:38 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > if you don't push, how can I check the changes?
- **Response summary:** Opened PR #184 into `main` and squash-merged it to trigger the GitHub Pages
  deploy so the founder could view it live; then realigned the dev branch to `origin/main`.
- **Artifacts:** PR #184 (merge `4502a53`).

## Entry 4 — 2026-06-16 12:43 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot (mobile dashboard with the More sheet stuck open after tapping Home)
- **Prompt (verbatim):**
  > there's a bug with the following action: after pressing more icon, and then home, attached
  > picture shows the result. the more menu doesn't close, which should happen if other icons on
  > bottom bar are clicked. fix it. also, the bottom bar height is too small. increase the height by
  > a little and if there's too much empty spacez increase the size of the icons, and if increased in
  > the bottom bar, make sure to match the size in more menu as well.
- **Response summary:** Fixed the stuck sheet by closing `moreOpen` + `editMode` on every
  `location.pathname` change in `AppShell`. Increased the bar rail 62px → 70px and icons 29px → 32px,
  matched the More sheet icons (28px → 32px), and re-tuned the overlay bottom, sheet padding, and
  `.pb-nav`. `pnpm build` green.
- **Artifacts:** `AppShell.tsx`, `BottomTabBar.tsx`, `MoreSheet.tsx`, `index.css`,
  `docs/PROJECT_STATUS.md`. Shipped via PR #185 (merge `c4d8bf2`).

## Entry 5 — 2026-06-16 12:49 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > get rid of the explanation sentence when long pressed on the icons for rearranging. keep the
  > icons position intact before and after long pressing the icons. the plus icons and x buttons are
  > not moving by default when long pressed, they only move if any icon's plus button in pressed and
  > moved back to the more menu. lastly, the more menu doesn't close when click on it.
- **Response summary:** Removed the edit-mode instruction sentence. Diagnosed the frozen jiggle:
  animating `scale` on a `layout`/`Reorder` element fights framer-motion's projection, freezing the
  infinite rotate until a re-render and shifting icons on long-press. Switched bar + sheet edit-tile
  enter/exit to opacity-only (kept `layout` for the sibling slide), so positions stay put and the
  jiggle starts immediately; made it slightly more visible. Made the Mehr tab toggle the sheet closed
  (and exit edit mode). `pnpm build` green.
- **Artifacts:** `MoreSheet.tsx`, `BottomTabBar.tsx`, `AppShell.tsx`, `docs/PROJECT_STATUS.md`.
  Shipped via PR #186 (merge `df519c6`).

## Entry 6 — 2026-06-16 14:07 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > keep the documentation uptodate
- **Response summary:** Synced the docs to the shipped s26 work: documented the opacity-only
  enter/exit rule, the Mehr toggle-close, close-on-navigation, and removal of the instruction
  sentence in CLAUDE.md; updated the stale "Resume here" pointer in PROJECT_STATUS.md to session 26
  and the current branch. Docs-only.
- **Artifacts:** `CLAUDE.md`, `docs/PROJECT_STATUS.md`. Shipped via PR #187 (merge `bd50015`).

## Entry 7 — 2026-06-16 14:14 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I want you to add a rule in the workflow - from here on any prompt you receive from me should be
  > logged in a session and prompt log file in the docs folder with all the meta info including your
  > response to my prompt. I want to have a clear paper trail to the development work in case we apply
  > for a copy right of the elemts of this app. You can use this file to store some of the info from
  > the claude file to keep it lean and only refer to the details in the session and prompt file when
  > needed. If needed, suggest me better way to do this if I missed out on anything.
- **Response summary:** Created this `docs/SESSION_PROMPT_LOG.md` (purpose, append-only policy,
  entry template) and backfilled Entries 1–7 for this session. Added a short "Prompt & session log"
  rule to CLAUDE.md's Workflow notes that points here. Suggested an optional `UserPromptSubmit` hook
  for tamper-resistant raw-prompt capture and noted that git history + PRs remain the primary record.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (new), `CLAUDE.md`. Shipped via PR #188.

## Entry 8 — 2026-06-16 14:20 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes, wire up the hook, and yes, I want to keep the prompt log and claude.md too in a private
  > place if possible
- **Response summary:** Added the `UserPromptSubmit` hook: `.claude/hooks/log-prompt.sh` (appends a
  raw JSON line per prompt to `docs/prompt-log-raw.jsonl`, writes only to that file, never blocks)
  and `.claude/settings.json` wiring it for all sessions; pipe-tested it. Documented the raw capture
  in this file's header. For "private place": confirmed the repo is currently public and free GitHub
  Pages requires a public repo, so making the source private has a hosting tradeoff; asked the
  founder to choose between making the repo private (Cloudflare Pages migration, or GitHub Pro), or
  moving only the logs to a separate private repo.
- **Artifacts:** `.claude/settings.json` (new), `.claude/hooks/log-prompt.sh` (new),
  `docs/SESSION_PROMPT_LOG.md`, `CLAUDE.md`. Privacy approach pending founder decision.

## Entry 9 — 2026-06-16 14:36 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > anyway there is a backlog item to migrate the whole repo to cloudflare, is additional private
  > repo to store the log files necessary?
- **Response summary:** Confirmed a separate private repo is NOT needed. The founder picked "private
  repo + Cloudflare (free)", which matches the already-planned Cloudflare Pages migration (backlog,
  see PROJECT_STATUS "Resume here" item 1, decided s22): that migration takes the whole repo private,
  carrying CLAUDE.md + both logs with it. Cross-referenced this on the backlog item and noted the
  repo (and new log entries) stay public until the migration lands. Also refined the hook to skip
  empty/non-text submissions (tool results, question answers) so the trail only records real
  messages, and committed the first real raw-capture line.
- **Artifacts:** `.claude/hooks/log-prompt.sh`, `docs/prompt-log-raw.jsonl` (first commit),
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`. Shipped via PR #190.

## Entry 10 — 2026-06-16 17:21 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the icons and the navigation bar seem a bit too big now. can you decrease the size by 10% roughly?
- **Response summary:** Scaled the mobile bottom nav down ~10%: rail height 70px → 63px and icons
  29px in both the bar and the More sheet (down from 32px). Re-tuned the dependent clearances (More
  sheet overlay `bottom` 4.375rem → 3.9375rem, sheet padding 6.25rem → 5.75rem, `.pb-nav`
  4.375rem → 3.9375rem) and updated the CLAUDE.md measurements. `pnpm build` green. (Preceded by two
  "continue" prompts that just asked me to finish merging the in-flight PR #190, which I did.)
- **Artifacts:** `BottomTabBar.tsx`, `MoreSheet.tsx`, `index.css`, `CLAUDE.md`,
  `docs/SESSION_PROMPT_LOG.md`. Shipped via PR #191.

## Entry 11 — 2026-06-16 20:38 UTC
- **Branch:** `claude/context-bar-menu-animations-g9gfd3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** two screenshots of the Vokabeltrainer (Kollokationen tab). One shows the whole
  view shifted left and clipped (header logo gone, "Vokabeltrainer" rendered as "kabeltrainer",
  "WORTSCHATZ" as "ETSCHATZ", card text cut off on the left); the other shows the same screen
  rendering correctly.
- **Prompt (verbatim):**
  > there are sometimes design glitches like the ones attached. can you check for them and fix?
- **Response summary:** Diagnosed the intermittent glitch as a root-level horizontal-scroll offset:
  the whole document (header included) gets stuck scrolled sideways. The existing guard only clipped
  horizontal overflow on `body`, but the real scroll container is `<html>`, and Radix portals
  (Select/Dialog dropdowns) mount at the end of `<body>` and can momentarily push the page sideways
  before Floating UI positions them, which iOS leaves stuck. Added `overflow-x: clip` +
  `overscroll-behavior-x: none` to `html` in `src/index.css` (using `clip`, not `hidden`, so no
  scroll container is created and the sticky header is unaffected). `pnpm build` green.
- **Artifacts:** `src/index.css`, `docs/SESSION_PROMPT_LOG.md`. Shipped via PR (merge SHA in git
  history).

## Entry 12 — 2026-06-16 22:47 UTC
- **Branch:** `claude/app-audit-testing-bqrdkj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I want you to do a thorough audit of all the functionalities, front end and back end checks to
  > find out any inconsistencies. errorrs, glitches that are in the app. perform all necessary test
  > cases and apply the fixes.
- **Response summary:** Ran a full audit (build, typecheck, content lint, plus a deep read of the
  engine, stores, components, data banks, and Supabase layer). Headline: the app is healthy, no hard
  errors, lint/build/typecheck all green. Applied the genuine fixes the audit surfaced: (1) added the
  missing `.eq("user_id")` filter to the data-export `writing_evaluations` query for consistency with
  its siblings; (2) added `Access-Control-Max-Age` to both Edge Function CORS responses; (3) gave the
  exam free-text input an `aria-label`; (4) made the QuickRevision flip card keyboard-accessible
  (`role`/`tabIndex`/Enter+Space); (5) stopped flashcard XP from rewarding a failed "Again" with the
  full review XP; (6) corrected the SRS scheduler to lower the ease factor on a lapse (true SM-2);
  (8) gated guest sign-in behind a captcha token when Turnstile is configured, and routed the writing
  flow through the captcha-gated auth UI instead of a silent guest creation in that case. Dropped the
  planned "scoring 70% baseline" change after verifying `examSets.ts` has zero quality-scored options:
  the 70% is the intended exam participation credit, not a fabricated score, and real dialogues always
  carry quality options so the default is never hit for them. Documented several agent findings as
  verified non-issues (MoreSheet padding is intentional, flashcard Easy/Good ordering is correct).
  `pnpm build`, `pnpm typecheck`, and `pnpm lint:content` all green.
- **Artifacts:** `src/lib/dataExport.ts`, `supabase/functions/evaluate-writing/index.ts`,
  `supabase/functions/delete-account/index.ts`, `src/features/exam/ExamRunner.tsx`,
  `src/features/revision/QuickRevision.tsx`, `src/features/vocabulary/Flashcards.tsx`,
  `src/engine/srs.ts`, `src/store/useAuthStore.ts`, `src/lib/writing.ts`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Shipped via PR #194 (merge `8acbe73`).

## Entry 13 — 2026-06-17 06:22 UTC
- **Branch:** `claude/app-audit-testing-bqrdkj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > get rid of the line "leiste voll..." when editing the more menu
- **Response summary:** Removed the "Leiste voll (max. 4). Erst ein Icon entfernen." helper line that
  appeared at the bottom of the More sheet in edit mode when the bar already held its max icons
  (`MoreSheet.tsx`). The `atMax` flag is still used elsewhere (the + badge already hides when the bar
  is full), so the affordance still communicates the limit without the sentence. `pnpm build` green.
- **Artifacts:** `src/components/layout/MoreSheet.tsx`, `docs/SESSION_PROMPT_LOG.md`. Shipped via PR
  #195 (merge `95763bc`).

## Entry 14 — 2026-06-17 06:32 UTC
- **Branch:** `claude/app-audit-testing-bqrdkj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** one screenshot (mobile Schreibtraining with the More sheet stuck open over it).
- **Prompt (verbatim):**
  > there's a bug or something where when schreibtraining is open and then more icon is pressed, and
  > again schreibtraining is pressed, the more menu doesn't close. it happens when a bottom bar item
  > is open, more icon is pressed, and then again the particular bottom bar item which is open in the
  > background is pressed again, the more menu doesn't close. I want it to close even then. fix it
- **Response summary:** Root-caused it: the More sheet only closed via the `location.pathname`
  `useEffect` in `AppShell`, but tapping the tab that is already active navigates to the same route,
  so the pathname never changes and the effect never fires. Added a `closeMore()` handler in
  `AppShell`, passed it to `BottomTabBar` as `onNavigate`, and wired it to each normal-mode tab's
  `onClick`, so any bar-tap closes the sheet (and exits edit mode) regardless of whether the route
  changes. The pathname effect stays as a backstop for programmatic navigation. `pnpm build` green.
- **Artifacts:** `src/components/layout/AppShell.tsx`, `src/components/layout/BottomTabBar.tsx`,
  `docs/SESSION_PROMPT_LOG.md`. Shipped via PR #196 (merge `e75236b`).

## Entry 15 — 2026-06-17 06:36 UTC
- **Branch:** `claude/app-audit-testing-bqrdkj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > fix the opacity of the icons. they look blurred because of the reduced opacity. I want all icons
  > to have same opacity as the selected icon.
- **Response summary:** Removed the 38% inactive-icon dimming so every nav icon renders at full
  opacity, matching the selected icon. The dimming all flowed through `RouteIcon`/`MoreIcon` in
  `route-icons.tsx` (the More sheet already used full opacity); dropped the opacity style from both.
  Kept the `active` prop in the type for call-site compatibility (BottomTabBar/Sidebar still pass it)
  but it no longer affects opacity. The active tab is still marked by its background pill + underline
  (bar), highlight (More sheet), and row styling (sidebar). Updated the CLAUDE.md "Icon color rule"
  (a locked rule) per this founder request. `pnpm build` + `pnpm typecheck` green.
- **Artifacts:** `src/components/layout/route-icons.tsx`, `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`.
  Shipped via PR #197 (merge `f6bf010`).

## Entry 16 — 2026-06-17 06:45 UTC
- **Branch:** `claude/app-audit-testing-bqrdkj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** one screenshot (mobile dashboard with the More sheet open, showing the 3-column
  icon grid: Redemittel, Grammatik, Kollokationen, Quiz, Sprechsimulation, Prüfungsmodus,
  Fortschritt, Schnellwiederholung, Einstellungen, plus the bottom bar).
- **Prompt (verbatim):**
  > i want you to adjust the sizes of the icons because some of them look a bit too big and some of
  > them a bit too small. keep all other things constant like padding and selection cloud around the
  > icon. In general it looks like there's a bit too much empty space. try to increase the size by 5%
  > something to keep it compact. but note that not all icons need to be increased in size e.g. the
  > pencil icon. check the screenshot and adjust the sizes
- **Response summary:** Re-tuned the per-mark optical `weight` values in the `NORM` map in
  `route-icons.tsx` (final size ∝ weight) for a ~5% general increase to reduce empty space, with
  per-icon nudges: the visibly small marks got more (grammar bookmark, exam cap, analytics bars all
  1.0 → 1.08), the already-large marks stayed restrained (quiz disc 0.9 → 0.92, revision bolt kept at
  1.0), and the pencil (`/writing`) was left unchanged at 1.04 per the request. Also bumped the Mehr
  grid icon 0.95 → 1.0. Padding and the selection cloud/pill were untouched. `pnpm build` +
  `pnpm typecheck` green.
- **Artifacts:** `src/components/layout/route-icons.tsx`, `docs/SESSION_PROMPT_LOG.md`. Shipped via
  PR #198 (merge `fb8cd01`).

## Entries 17–19 — 2026-06-17 ~06:50–06:56 UTC (icon color thread)
- **Branch:** `claude/app-audit-testing-bqrdkj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** entry 19 included a screenshot of the F2 "Per-section Color" preview (two-tone
  indigo+cyan Wortschatz book).
- **Prompts (verbatim):**
  > the color of the vocab training icon isn't the same the one you showed in the preview f2, why is
  > that?
  > can you provide me the link to the preview html again?
  > the icon here has two shades of blue isn't it? the current icon in the app is clearly different.
  > why do you say it's not? I want the icon to be how it's in preview
- **Response summary:** First I compared against the wrong reference sheet (`route-icons-preview.svg`,
  single-hue book) and incorrectly said the colors matched. Provided raw.githack links to the
  `preview/*.html` mockups (they are not on the live site since `preview/` isn't part of the Vite
  build). The founder's screenshot then made it clear: the F2 "Per-section Color" book is **two-tone
  indigo + cyan**, whereas the app book was a single `#2563eb` at two opacities. Corrected it by
  converting the `/vocabulary` mark in `route-icons.tsx` to the two-tone book (indigo `#5b5be6` left
  page + cyan `#10b7cf` right page, white lines on both pages), reusing the existing book geometry so
  the optical sizing stays correct. Documented the two-tone exception in CLAUDE.md's icon rule.
  `pnpm build` + `pnpm typecheck` green.
- **Artifacts:** `src/components/layout/route-icons.tsx`, `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`.
  Shipped via PR #199 (merge `6e7610e`).

## Entry 20 — 2026-06-17 07:00 UTC
- **Branch:** `claude/app-audit-testing-bqrdkj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > in addition also see if there's a chance to make other icons two tone similar to the book icon
  > with one of the shades looking like a neon color
  > increase the size of the home icon by 5% as it's still looking a bit smaller.
- **Response summary:** (1) Bumped the home icon optical weight 1.02 → 1.07 (+5%) in the `NORM` map.
  (2) For the two-tone + neon idea across all icons (a subjective visual overhaul, and some marks like
  the gear/bolt don't split naturally), built a proposal preview sheet
  (`preview/route-icons-two-tone-neon.svg`) rather than overhauling the live icons blind: each mark
  keeps its section colour as the base and gains a brighter neon second tone (e.g. home indigo + neon
  cyan body, collocations amber + neon-yellow second ring, analytics neon-cyan bar gradient). Sent it
  to the founder for direction before applying to the app. `pnpm build` + `pnpm typecheck` green.
- **Artifacts:** `src/components/layout/route-icons.tsx` (home size),
  `preview/route-icons-two-tone-neon.svg` (new), `docs/SESSION_PROMPT_LOG.md`. Shipped via PR #200
  (merge `7a70709`).

## Entry 21 — 2026-06-17 07:29 UTC
- **Branch:** `claude/app-audit-testing-bqrdkj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > looks good. for the padding/rounded boxes around the icons, use only grey color with gradients
  > and not the same colored faded boxes for the icons. knce done, update the documentation
- **Response summary:** The founder approved the two-tone + neon icon proposal, so (1) applied the
  two-tone + neon treatment to every icon renderer in `route-icons.tsx` (base = section accent, plus
  a hard-coded neon second tone: home neon-cyan body, redemittel neon-magenta dots, grammar neon-lime
  half, kollokationen neon-yellow ring, quiz neon-yellow check, writing neon-pink tip, simulation
  neon-teal stand, exam neon-pink base, revision neon-yellow lower bolt, analytics neon-cyan bars,
  settings neon-blue gear centre). (2) Changed every icon backdrop box from the section colour at low
  opacity to a neutral **grey gradient** (`bg-gradient-to-b from-muted to-border`, dark-mode aware):
  the bar's active pill + Mehr pill (`BottomTabBar`), the edit + normal More-sheet tiles
  (`MoreSheet`), and the sidebar active row (`Sidebar`, was `bg-primary/20`). The `nav-items.ts` `bg`
  tint field is now unused for backdrops. (3) Updated docs: CLAUDE.md "Icon color rule" (two-tone+neon
  + grey-box design), PROJECT_STATUS.md (Session 27 cont.), and this log. `pnpm build` +
  `pnpm typecheck` green.
- **Artifacts:** `src/components/layout/route-icons.tsx`, `src/components/layout/BottomTabBar.tsx`,
  `src/components/layout/MoreSheet.tsx`, `src/components/layout/Sidebar.tsx`, `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`. Shipped via PR (merge SHA in git history).

## Entries 22–24 — 2026-06-17 (selection cloud thread)
- **Branch:** `claude/cloud-icon-bottom-bar-epi0dt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > the cloud surrounding the icon is too big. also the gradient of the cloud could be improved. can
  > you provide some mockups for the bottom bar and more menu as a html and provide the preview link
  > as done in previous sessions?
  > compact squircle looks good but the same compact squircle should be also applied for menu icons.
  > but I want you to generate some previews for the cloud's gradients as the current grey gradient
  > looks outward protruded. i want to see if there's a better design
  > select flat and even style. for the menu icons the cloud should only appear when selected.
- **Response summary:** The "cloud" is the grey gradient backdrop behind the active icon (and behind
  every More-sheet tile), which filled the whole tab slot. (1) Built `preview/nav-cloud-refined.html`
  (raw.githack link) showing the current full-slot pill vs two tighter options; founder picked the
  **compact squircle**. (2) Built `preview/nav-cloud-gradients.html` with six gradient studies of the
  squircle (convex/current, flat&even, inset, top-lit halo, hairline ring, cool diagonal); founder
  picked **G1 flat & even**. (3) Implemented: bar active pill + Mehr pill are now a compact `h-11 w-11
  rounded-2xl` squircle hugging the icon with the flat `from-muted to-border` gradient (no raised-dome
  shadow); the underline moved to `bottom-[6px]`. More sheet tiles are compact `h-12 w-12` squircles,
  and the cloud now appears **only behind the selected section** in browse mode (unselected = bare
  icon); edit mode keeps the squircle on all tiles as the draggable-tile affordance. Updated CLAUDE.md
  (s28 squircle + selected-only rules). `pnpm build` + `pnpm lint:content` green.
- **Artifacts:** `preview/nav-cloud-refined.html`, `preview/nav-cloud-gradients.html`,
  `src/components/layout/BottomTabBar.tsx`, `src/components/layout/MoreSheet.tsx`, `CLAUDE.md`,
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 25 — 2026-06-18 (selection backdrop: drop the gradient)
- **Branch:** `claude/bottom-nav-selection-style-nfo0dy`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i like the selection, grey circle, for the bottom navigation bar and the icons in more menu. but
  > I don't like the gradient. can you just get rid of the gradient and just keep a suitable light
  > grey shade
- **Response summary:** Replaced the grey gradient backdrop (`bg-gradient-to-b from-muted to-border`)
  with a single flat light-grey shade (`bg-border`) on all four selection backdrops: the bottom
  bar's active pill + Mehr pill (`BottomTabBar` `ACTIVE_BOX`), the More-sheet edit-mode tile and the
  selected browse tile (`MoreSheet`), and the desktop sidebar's active row (kept consistent).
  `bg-border` reads as a clear, even light grey in both light and dark mode (no protruding dome).
  Updated CLAUDE.md (s29 flat-fill rule). `pnpm build` green.
- **Artifacts:** `src/components/layout/BottomTabBar.tsx`, `src/components/layout/MoreSheet.tsx`,
  `src/components/layout/Sidebar.tsx`, `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 26 — 2026-06-20 (AI product strategy research)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Role: You are a senior AI product strategist, edtech consultant, and innovation researcher with
  > expertise in language learning products. Task: I am building a language learning app Genauly and
  > want to leverage modern AI tools effectively to generate, validate, prioritize, and implement new
  > product ideas that create measurable user value. [Full request: research-backed analysis covering
  > the AI opportunity landscape, AI tools/workflows, an idea-generation framework, a validation
  > framework, a prioritization system, and a practical roadmap; deliverables = executive summary,
  > cited findings, tools table, repeatable workflow, 10-20 feature ideas with validation methods, and
  > a prioritized action plan.]
- **Response summary:** Conducted web research across six evidence areas (retrieval practice/spaced
  repetition, Krashen input vs Swain output, Duolingo Max GPT-4 features, AI pronunciation/CALL
  assessment, GDPR + EU AI Act/DPIA, RICE/ICE prioritization) and wrote `docs/AI_PRODUCT_STRATEGY.md`:
  an executive summary, six cited findings, an 8-category opportunity map, build-time vs runtime AI
  tool tables, a 5-stage innovation workflow with prompt scaffolds, a validation framework, an adapted
  RICE scoring model with worked examples, 18 Genauly-specific feature ideas each with a validation
  method, a GDPR-safe phased roadmap (quick wins / medium / long term), and a next-steps action plan.
  Advisory doc only; no app behaviour changed; no build needed (no code). Pushed to the dev branch; no
  PR opened (strategy doc, founder can request merge).
- **Artifacts:** `docs/AI_PRODUCT_STRATEGY.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 27 — 2026-06-20 (broaden AI strategy to the full B1-B2 plateau scope)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > afrer skimming through the strategy document it's clear to me that your understanding of the app
  > is based on the earlier scope. You need to take into consideration the broadened scope of the app
  > which is to support learners who are stuck in rhe intermediate plateau b1-b2 and help them grow
  > their german in workplace and other important day-to-day tasks like bureaucracy or banking. first
  > identify areas in the code base which led you to fall back on the earlier scope and update those
  > parts of the documentation. Then, update the strategy document considering this broder scope
  > within the current pr.
- **Response summary:** Traced the narrow-scope framing to stale developer-facing docs: `CLAUDE.md`
  header still read "B2 Beruf Speaking Prep / prep platform for the Goethe / telc Deutsch B2 Beruf
  speaking exam" and its themes line said "ten workplace topics", and `EXPANSION_PLAN.md` was titled
  "B2 Beruf App". The broadened B1-B2 plateau positioning had already shipped in session 21 (live
  landing page, `/about`, PWA manifest, `BUSINESS_PLAN.md`) but never propagated to CLAUDE.md, which
  is read first and overrides. **Doc fixes:** rewrote the CLAUDE.md header to the B1-B2 plateau framing
  (workplace + daily-life domains: bureaucracy/Behörde, banking, healthcare, housing) with a "do not
  narrow this again" scope note; broadened the themes line to mark the ten workplace themes as the
  current set with life-domains on the roadmap; added a scope-correction banner to EXPANSION_PLAN.md.
  **Strategy doc reframe (`docs/AI_PRODUCT_STRATEGY.md`):** retitled/scope-noted; rewrote the executive
  summary around breaking the plateau across two pillars; reframed Finding 2 to the intermediate
  plateau (added a plateau research source) with input+output across real situations; broadened the
  opportunity map, the RICE wording + worked-example table (added Behörde decoder and daily-life
  scenario packs), and the roadmap + action plan to cover both pillars; broadened feature ideas and
  added two daily-life ideas (#19 Behörde & Document Decoder, #20 Daily-Life Scenario Packs).
  Advisory doc only; no app behaviour changed; updated within the current PR #205.
- **Artifacts:** `CLAUDE.md`, `docs/EXPANSION_PLAN.md`, `docs/AI_PRODUCT_STRATEGY.md`,
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 28 — 2026-06-20 (deep-research refresh of the AI strategy doc)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > is the strategy document grounded with deep research as the intial prompt asked in the session? if
  > not you need to conduct deep research referring to actual reliable latest sources online. I ask
  > this because your recommendations seem outdated e.g. chtgpt 4 when we already have 5.5 as the
  > latest. [follow-up:] not just the tool recos section, I need you to do a critical review of the
  > entire document, do a thorough research where necessary and update it.
- **Response summary:** Ran ~10 web searches for the June 2026 landscape and did a full critical
  review of `docs/AI_PRODUCT_STRATEGY.md` (now rev. 3). Corrected dated/incorrect claims: all model
  names + prices refreshed (Claude Opus 4.8 $5/$25, Sonnet 4.6 $3/$15, Haiku 4.5 $1/$5; OpenAI GPT-5.5
  $5/$30; Gemini 3.1 Pro $2/$12, 3.5 Flash $1.50/$9; `gpt-realtime` / Gemini Live for voice; Lovable/
  v0/Bolt/Figma Make for prototyping; Azure/SpeechAce/ELSA for pronunciation). Fixed a factual error:
  the EU AI Act high-risk deadline was deferred to **2 Dec 2027** (Digital Omnibus, May 2026), not Aug
  2026, and added the nuance that AI scoring exams/determining education access can be Annex III
  high-risk (so frame the examiner as practice feedback). Added three evidence-led findings: (F3) the
  2025 Harvard AI-tutoring RCT (effect 0.7–1.3 SD) plus Nigeria World Bank RCT and LearnLM trials;
  (F4) 2026 market data (~$24B → ~$51B by 2031, Duolingo premium-speaking willingness-to-pay, Speak
  ~$1B); (F6) the capability-up/cost-down picture; and a critical counterweight (F8) on
  "metacognitive laziness" → design for productive struggle. Reworked the executive summary, tools
  tables, roadmap, cross-references (§6→§7 fix, finding-number renumber), and a categorised Sources
  list with honest caveats. Direction unchanged; grounding much stronger. Updated within PR #205.
- **Artifacts:** `docs/AI_PRODUCT_STRATEGY.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 29 — 2026-06-20 (ship first daily-life content pack: Behörde)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead and scope the scenario pack module. include a non tech summary in the plan
  > [then, after plan approval:] continue where you left off
- **Response summary:** Scoped (plan-mode) then implemented the first daily-life content pack,
  the new `behoerde` theme (Behörden & Ämter), per the AI strategy doc's top-scored move and
  founder backlog #18. Shipped a **lean starter** as a **flat 11th theme** (both confirmed via
  AskUserQuestion): ~25 vocabulary items, 12 collocations, 2 branching scenarios (`sc_anmeldung`
  level 1, `sc_auslaenderbehoerde` level 2), 1 writing prompt, and provenance rows for all 40 new
  ids. Wiring: extended the `ThemeId` union (`src/types/index.ts`) and the synced `THEME_IDS` array
  (`scripts/lint-content.mjs`), registered the `Landmark` lucide icon (`src/lib/icons.ts`), and added
  the theme to `src/data/themes.ts`. The pack auto-surfaces in Quiz/Vocabulary/Collocations (they map
  over `themes`) and the SimulationHub (groups scenarios by level), so no UI redesign was needed.
  Fixed three colliding collocation ids (renamed to `c_behoerde*`). Verified: `pnpm lint:content`
  passes (11 themes, 515 vocab, 132 collocations, 12 dialogues, 809 provenance rows; only pre-existing
  advisory reference warnings), `pnpm typecheck` exit 0, `pnpm build` exit 0. Updated CLAUDE.md counts
  + the new-theme checklist, and PROJECT_STATUS #18 progress note. Out of scope (noted): domain-grouping
  UI (#5), nav/Dashboard redesign, exam set, runtime AI / Article 50.
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`, `src/lib/icons.ts`,
  `src/data/themes.ts`, `src/data/vocabulary.ts`, `src/data/collocations.ts`, `src/data/dialogues.ts`,
  `src/data/writingPrompts.ts`, `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 30 — 2026-06-20 (data audit-ready: reference back-fill + EU AI Act Art. 50)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > okay, meanwhile can you pull up latest info about making the app's data audit ready. What's the status and what's next in this stream?
  > [then:] go ahead with both of them
- **Response summary:** Reported the status of the data-governance / audit-ready stream (backlog #7),
  then shipped the two cheapest next steps the founder approved together. (1) **Provenance reference
  back-fill:** added `scripts/backfill-provenance-refs.mjs`, which fills only the ~162 empty-reference
  authored rows (grammar → German Wikipedia, redemittel → DWDS corpus search, dialogues/exam
  sets/writing prompts → CEFR B2 descriptors), leaving the already-referenced vocab/collocation rows
  untouched. All 809 rows now carry a reference; the linter's back-fill warning queue is empty. Rows
  stay `review_status: "draft"` (machine-assigned references, human verification still pending).
  (2) **EU AI Act Article 50 transparency:** confirmed the writing coach is the only generative-AI
  surface (speech = Web Speech API, simulations = scripted), which already marked output as
  "KI-generierte Rückmeldung"; added an explicit point-of-use AI disclosure on the writing editor
  linking to the privacy page. Verified: `pnpm lint:content` zero warnings (was ~162), `pnpm build`
  + typecheck green.
- **Artifacts:** `src/features/writing/WritingHub.tsx`, `src/data/provenance.ts`,
  `scripts/backfill-provenance-refs.mjs`, `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR # appended on push/merge.

## Entry 31 — 2026-06-23 (automated provenance reference-URL checker)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > what needs human verification?
  > [then:] yes
- **Response summary:** Explained the four-eyes verification gap (all 809 provenance rows are
  `review_status: "draft"`; the machine-assigned references are unchecked), then built the validator
  the founder approved. `scripts/check-provenance-refs.mjs` (`pnpm check:refs`) fetches every
  reference URL and flags dead links / wrong Wiktionary headwords (404) / missing Wikipedia articles /
  unknown DWDS entries; it dedups 809 rows → 701 unique URLs (629 status-checkable, 72 DWDS
  corpus-search flagged "not auto-checkable", 0 malformed) and exits non-zero on failure. This sandbox
  blocks outbound HTTPS (`x-deny-reason: host_not_allowed`), so it also ships a manual
  `workflow_dispatch` GitHub Action (`.github/workflows/check-refs.yml`) the founder can run from the
  Actions tab where egress is open. Verified the parse/dedup path locally with `--dry`. Honest scope:
  attests to "link is live", not "correct sense"; content accuracy still needs human review.
- **Artifacts:** `scripts/check-provenance-refs.mjs`, `.github/workflows/check-refs.yml`,
  `package.json` (check:refs alias), `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR # appended on push/merge.

## Entry 32 — 2026-06-23 (in-app Sources & Licenses page)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you explain me what the current setup is when it comes to data checks and audit readiness? where can I see the data and the corresponding links for sources?
- **Response summary:** Explained the two checks (the `lint:content` gate run automatically on every
  PR/push, and the on-demand `check:refs` link checker) and the four audit-readiness pillars, then
  pointed at where the data lives (`src/data/*.ts`, register in `src/data/provenance.ts`). Since those
  are code files, offered a readable view; founder chose the in-app page (via AskUserQuestion). Built
  the auto-generated **"Sources & Licenses" page at `/sources`** (`src/features/legal/Sources.tsx`),
  generated entirely from the provenance register: traceability intro, upstream references (Wiktionary,
  DWDS, Wikipedia, CEFR) with licences + counts, our content's licence breakdown, and the full
  itemised list of all 809 items with a source link each, grouped by type in collapsible sections.
  Bilingual DE/EN (shared `LegalChrome`); linked from Settings + landing footer; surfaces any required
  attribution automatically. Lazy-loaded so the register stays out of the main bundle (main chunk
  unchanged at 124 KB gzip; register is a separate 24 KB-gzip chunk). `pnpm build` + typecheck green.
- **Artifacts:** `src/features/legal/Sources.tsx`, `src/router.tsx`, `src/features/settings/Settings.tsx`,
  `src/features/landing/LandingPage.tsx`, `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR # appended on push/merge.

## Entry 33 — 2026-06-23 (first check:refs run + reference corrections)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the failed "Check provenance references" workflow run
- **Prompt (verbatim):**
  > this is what I get when I run the workflow [screenshot: step "Check provenance reference URLs" failed]
- **Response summary:** Pulled the Actions log via the GitHub MCP tools and triaged the 183 reported
  failures: the checker was too harsh, not 183 dead links. ~70 were HTTP 429 (Wikimedia rate-limiting
  at concurrency 5, valid pages), 33 were HTTP 403 (Council of Europe blocks bots), and 117 were
  genuine 404s (B2-Beruf compound nouns absent from Wiktionary, reflexive/particle verbs, headword bugs
  like gender pairs and "(Pl.)"/"(PSA)", 2 bad collocation DWDS lemmas, 1 wrong Wikipedia title). Fixed
  both: hardened the checker (concurrency 2, Retry-After, CEFR not-status-checkable, 429/403 → "could
  not verify" instead of failure) and re-pointed the 117 dead references via
  `scripts/fix-provenance-refs.mjs` (vocab/collocations → DWDS corpus search; Konnektoren grammar →
  de.wikipedia "Konjunktion (Wortart)"). Status-checkable set 629 → 517. `pnpm build` +
  `pnpm lint:content` green. Asked founder to re-run the workflow to confirm.
- **Artifacts:** `scripts/check-provenance-refs.mjs`, `scripts/fix-provenance-refs.mjs`,
  `src/data/provenance.ts`, `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR # appended on push/merge.

## Entry 34 — 2026-06-23 (check:refs second pass — clear the 26 stragglers)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I ran it again and still got an error
- **Response summary:** Pulled run #2's log: down to 26 failures (from 183), all genuine Wiktionary
  404s, the stragglers that were masked as HTTP 429 in run #1 and surfaced once the gentler checker
  stopped hitting rate limits (it reported zero 429s this time). Added the 26 vocab ids to the
  `fix-provenance-refs.mjs` DEAD_404 set and re-pointed them to DWDS corpus search. Total dead refs
  corrected across both passes: 143. Status-checkable set 517 → 491 (the remaining 491 all resolved
  cleanly in run #2, so the next run is expected green). `pnpm lint:content` + `pnpm build` green.
- **Artifacts:** `scripts/fix-provenance-refs.mjs`, `src/data/provenance.ts`,
  `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR #
  appended on push/merge.

## Entry 35 — 2026-06-23 (docs update + two strategy backlog items)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > now it's successful. Can you summarise what happened?
  > [then:] can you update documentation from this session and also add it to the tondo list the following items:
  > - a comprehensive end to end data strategy for the app
  > - a thorough and detailed visualization plan for all the learning components of the app
- **Response summary:** Confirmed `check:refs` run #3 is green (all 491 status-checkable references
  resolve; 143 dead refs corrected across runs #1–#2). Updated `docs/PROJECT_STATUS.md`: recorded the
  run #3 green result in the session 33 entry, added a session 34 entry, bumped the header to session
  34, and added two backlog items — **#22 comprehensive end-to-end data strategy** (`DATA_STRATEGY.md`
  umbrella over all data classes) and **#23 detailed visualization plan for all learning components**
  (`VISUALIZATION_PLAN.md`, per-component visual + data-viz specs) — plus mapped both in the
  model-guidance table. Docs-only change; no code.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Entry 36 — 2026-06-23 (fix Wortschatz Kollokationen tab cut off on the right)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the collocations section within wortschatz is cut off to the right fix it
- **Response summary:** Diagnosed the Wortschatz tab row (`VocabularyTrainer`, 4 tabs) overflowing on
  narrow screens — the shared `TabsList` uses `overflow-x-auto` + `no-scrollbar`, clipping the
  rightmost "Kollokationen" tab with no visible scrollbar. Fixed by adding `flex-wrap` to that
  `TabsList` instance so the tabs wrap to a second row and all four stay visible. Local override; shared
  primitive untouched. `pnpm build` green.
- **Artifacts:** `src/features/vocabulary/VocabularyTrainer.tsx`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Entry 37 — 2026-06-24 (fix collocation tiles overflowing right in Wortschatz)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the Wortschatz → Kollokationen tiles with the teal "formell" badge clipped at the right edge
- **Prompt (verbatim):**
  > I didn't ask about the tabs swtiches. I was talking about the tiles down below. see attached picture. fix it
- **Response summary:** Correct target this time: the collocation **tiles** (`CollocationsList`), not the
  tab row. Root cause: the tile grid was `grid gap-3 sm:grid-cols-2` — on mobile there is no explicit
  column count, so the grid used an implicit `auto` column sized by its widest content. The tile titles
  use `truncate` (`white-space: nowrap`) with no `min-w-0`, so the longest collocation phrase in the
  list forced the column wider than the viewport; every tile overflowed right and the rightmost element
  (the `formell` badge) was clipped at the screen edge. Fixed by (1) adding `grid-cols-1` so the mobile
  column uses `minmax(0,1fr)` and is capped to the container, and (2) adding `min-w-0`/`flex-1` down the
  tile's flex chain (grid item, text column, title row, title `<p>`) + `shrink-0` on the SpeakButton, so
  long titles truncate within the card instead of forcing width. The standalone `/collocations`
  (`CollocationsBrowser`) wraps its titles (no truncate) so it does not have this bug; left untouched.
  `pnpm build` green.
- **Artifacts:** `src/features/vocabulary/CollocationsList.tsx`, `docs/SESSION_PROMPT_LOG.md`. Commit
  SHA appended on push.

## Entry 38 — 2026-06-24 (match dedicated Kollokationen cards to the Wortschatz tile design)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you apply the same design as the tiles under the collocations within wortschatz menu to the collocations menu items as well?
- **Response summary:** Asked (AskUserQuestion) whether to match exactly or keep the browser's extra
  content; founder chose **keep extra content**. Restyled `CollocationsBrowser`'s `CollocationCard` to
  match `CollocationsList` (Wortschatz tab): truncating `font-semibold` phrase + always-visible
  speaker, muted non-italic English meaning, a `formell` badge top-right (replacing the indigo
  formal-card background), and a top-border divider with the italic German example in „…" quotes. Kept
  the example's English translation and its audio button (always visible). Removed the hover-reveal
  speaker state machinery. `pnpm build` green.
- **Artifacts:** `src/features/collocations/CollocationsBrowser.tsx`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Entry 39 — 2026-06-24 (founder-only "verify + comment" overlay for the data-sources page)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I want you to build an option to mark the data sources as verified and add any comments if necessary for the data sources pages - only to one user. is that possible?
- **Response summary:** Confirmed feasible. Asked (AskUserQuestion) about persistence + visibility;
  founder chose **Supabase** storage and **everything private** (admin-only). Built a founder-only
  review overlay on `/sources`: a new `provenance_reviews` table (migration 0004) locked by RLS to the
  founder's JWT email, a client gate (`src/lib/admin.ts` `isFounder`), a best-effort data layer
  (`src/lib/provenanceReviews.ts`), and admin UI in `Sources.tsx` (per-item "geprüft" checkbox + "Notiz"
  field, live verified count, save status, `verified/total ✓` group summaries). Public page unchanged.
  Documented the one-time migration step in `docs/PHASE2_SETUP.md`. `pnpm build` + `pnpm lint:content`
  green. **Requires founder to run migration 0004 in Supabase for saves to persist.**
- **Artifacts:** `supabase/migrations/0004_provenance_reviews.sql`, `src/lib/admin.ts`,
  `src/lib/provenanceReviews.ts`, `src/features/legal/Sources.tsx`, `docs/PHASE2_SETUP.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Entry 39 — 2026-06-25 (collocations tiles appear cut off)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot of /collocations (Kollokationen) with a tile meeting the bottom tab bar.
- **Prompt (verbatim):**
  > the tiles are being cut off. fix it
- **Response summary:** Investigated the bottom clearance. The shared AppShell `<main>` already
  applies `.pb-nav` (`calc(3.9375rem + env(safe-area-inset-bottom) + 1.5rem)` = 63px bar + safe-area +
  24px), so the last tile clears the fixed bar by 24px. The screenshot shows the first two
  collocations with no filter (132 results), i.e. the top of the list mid-scroll, where the
  translucent fixed bar overlaps a passing tile (normal, universal behaviour). No clipping bug found;
  no code change. Asked the founder to confirm at the true bottom of the list, and offered to widen
  the comfort gap if the last tile still reads as cut.
- **Artifacts:** none (investigation only).

## Entry 40 — 2026-06-25 (account-creation button stays disabled)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot of the "Konto erstellen" dialog: email + password filled,
  Turnstile "Success!", consent checked, but the submit button greyed out.
- **Prompt (verbatim):**
  > there seems to be a bug with account creation window. even after entering email and password the button below doesn't activate
  > check why is it and fix it.
- **Response summary:** Root cause was iOS Safari / password-manager **autofill not firing React's
  `onChange`**, leaving the controlled `email`/`password` state empty so `canSubmit` never became
  true. (The rendered Turnstile widget proved the captcha key is set and was solved; consent was
  visibly checked, so the credentials state was the only remaining gate.) Fix: a WebKit autofill hook
  via a no-op `@keyframes onAutoFillStart` on `input:-webkit-autofill` in `index.css`, with
  `AuthDialog` listening on `onAnimationStart` to copy the autofilled `ref.value` into state. Typing
  is unaffected. `pnpm build` green.
- **Artifacts:** `src/features/auth/AuthDialog.tsx`, `src/index.css`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Session 39 — 2026-06-25 — Mobile card-grid overflow + remove prompt-logging hook
Branch: `claude/bug-attached-picture-fxgv5j`.

## Entry 41 — 2026-06-25 (mismatched quotation marks on collocation cards)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot of /collocations (Kollokationen) example sentences.
- **Prompt (verbatim):**
  > there's a bug in the attached picture. check and tell me what it is
- **Response summary:** Diagnosed (no fix requested) the example sentences using **mismatched German
  quotes**: opening with `„` (U+201E) but closing with a straight ASCII `"` instead of the German
  closing `"` (U+201C), at `CollocationsBrowser.tsx:58` (`„{c.example.de}"`). Also confirmed the en
  dash `–` in the page subtitle is **not** a bug (the style guide bans only em dashes). Noted the same
  `„…"` pattern likely recurs in other card components and offered to sweep.
- **Artifacts:** none (diagnosis only).

## Entry 42 — 2026-06-25 (collocations tiles cut off on the right)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot of /collocations with cards bleeding off the right edge; the
  `formell` badge on "Protokoll führen" clipped to "for".
- **Prompt (verbatim):**
  > the collocations tiles are all being cut off to the right, do you see it?
- **Response summary:** Root cause: the card grid at `CollocationsBrowser.tsx:270` declared
  `sm:`/`lg:grid-cols-N` but **no base `grid-cols-1`**, so below the `sm` breakpoint CSS grid falls
  back to an implicit `auto` (max-content) single column that stretches to the widest card's longest
  unwrapped line and overflows the viewport. Added `grid-cols-1`. `pnpm build` green; committed to the
  branch.
- **Artifacts:** `src/features/collocations/CollocationsBrowser.tsx` (commit 41885c4).

## Entry 43 — 2026-06-25 (still happening → sweep the whole app)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot still showing the right-edge cutoff.
- **Prompt (verbatim):**
  > it's still happening
  >
  > (then, via AskUserQuestion → "Also sweep other pages", plus:)
  > check through the app and apply the fixes everywhere where this is the case
- **Response summary:** Explained the earlier fix was on the feature branch, not on `main`, so the
  live site (which serves `main`) was unchanged. Then swept every responsive card grid missing a base
  column and added `grid-cols-1`: `ExamHub` (×2), `VocabList`, `GrammarDrillCard`, `GrammarHub` (×2),
  `LandingPage`, `QuizHub` (×2), `RedemittelTrainer`, `Settings`, `Dashboard` (hero + cards),
  `SimulationHub`, `WritingHub`, `Analytics` (`CollocationsList` and `Flashcards` already had a base
  count). `pnpm build` green. Shipped via PR #219 (squash-merged to `main`).
- **Artifacts:** 12 feature files; PR #219 (merge SHA ce0c6e2); session log PR #220 (merge SHA b69b011).

## Entry 44 — 2026-06-25 (log it; manual prompt-logging from now on)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > yes log it. but don't automatically log the prompt log. I'll prompt you from now on when to log it.
- **Response summary:** Logged Session 39 (the grid fix) in `docs/PROJECT_STATUS.md` only (new session
  entry, header date/branch, "Resume here" pointer) and shipped it via PR #220. **Preference recorded:**
  the prompt log (`SESSION_PROMPT_LOG.md`) is now updated **manually only when the founder asks**, never
  automatically.
- **Artifacts:** `docs/PROJECT_STATUS.md`; PR #220 (merge SHA b69b011).

## Entry 45 — 2026-06-25 (remove the prompt-logging hook)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > get rid of the hook - that's what I'm talking about
- **Response summary:** Removed the `UserPromptSubmit` auto-logging hook: deleted
  `.claude/hooks/log-prompt.sh`, set `.claude/settings.json` to `{}`, and updated the now-stale
  references in `CLAUDE.md` and this file's header. Kept `docs/prompt-log-raw.jsonl` as a historical
  record (no longer appended to). Shipped via PR #221.
- **Artifacts:** `.claude/hooks/log-prompt.sh` (deleted), `.claude/settings.json`, `CLAUDE.md`,
  `docs/SESSION_PROMPT_LOG.md`; PR #221 (merge SHA 5ea364d).

## Entry 46 — 2026-06-25 (why delete the raw log?)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > why to delete it?
- **Response summary:** Clarified there is no good reason to delete `docs/prompt-log-raw.jsonl`; it is
  a harmless static file now that the hook is gone and it is the authorship paper trail. Recommended
  keeping it. No change made.
- **Artifacts:** none.

## Entry 47 — 2026-06-25 (document this session)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > document the developments, preferences, and important prompts in this session
- **Response summary:** Extended the Session 39 entry in `docs/PROJECT_STATUS.md` (grid fix + hook
  removal + recorded preferences) and backfilled Entries 41–47 in this prompt log.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 48 — 2026-06-25 (no save option on the source-review overlay)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > reg. the sources and the option to add notes and mark as verified, when I mark it verified and write something for a particular word, I have no option to save. Can you add the necessary features?
- **Response summary:** The s37 admin overlay auto-saved silently (verified on toggle, note on blur)
  with only a small global indicator, so it felt like there was no way to save. Added a per-row **Save**
  button (`src/features/legal/Sources.tsx`) that commits the `verified` flag + note together, disabled
  until dirty, showing `Speichern`/`Speichern…`/`Gespeichert ✓` and red `Nicht gespeichert` on failure;
  Enter in the note saves too. Made `AdminApi.onChange` return `Promise<boolean>` and only update the
  local cache on a successful write, so a failed save no longer looks saved. Bilingual DE/EN.
  `pnpm build` green.
- **Artifacts:** `src/features/legal/Sources.tsx`; PR #223 (merge SHA 014d44f).

## Entry 49 — 2026-06-25 (what is my action point?)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > explain me clearly what is the action point from my side
- **Response summary:** Explained the single action point: run the one-time Supabase migration
  `supabase/migrations/0004_provenance_reviews.sql` in the SQL editor (steps from
  `docs/PHASE2_SETUP.md` → "Admin source review"), because the saves write to the `provenance_reviews`
  table which must exist first. Gave step-by-step instructions and how to confirm it worked.
- **Artifacts:** none (explanation only).

## Entry 50 — 2026-06-25 ("Nicht gespeichert" — is it normal?)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of /sources admin rows showing red "Nicht gespeichert" next to Save, with
  a test note "it's asking me to login, should find a better source url" on a dwds.de item.
- **Prompt (verbatim):**
  > I'm getting something like "nicht gespeichert" Is it normal?
- **Response summary:** Clarified it is **not** OK: "Nicht gespeichert" means the save did not persist,
  the expected symptom when migration 0004 has not been run (the `provenance_reviews` table is missing).
  Asked whether the migration had been run and offered to paste the full SQL. Also noted the dwds.de
  login observation is a separate source-quality issue.
- **Artifacts:** none.

## Entry 51 — 2026-06-25 (Supabase task done, saving works)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > I did the supabase task and it's working well for me now
- **Response summary:** Confirmed the source-review feature is fully working now that migration 0004 is
  applied (marks persist to the founder's account, private, cross-device). Offered to log the session
  and to look into the flagged dwds.de source.
- **Artifacts:** none.

## Entry 52 — 2026-06-25 (add a task for source review + strategy)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > before doing the second item, can you add a task to deep-dive and properly review each of the sources used, their licenses and prepare a good source strategy as part of the data strategy?
- **Response summary:** Added **backlog #24** to `docs/PROJECT_STATUS.md`: deep-dive review of every
  external source, confirm licences/commercial-use terms, fix problem sources (incl. the dwds.de
  login item), reconcile against the SPDX allowlist, and define a ranked source strategy per content
  type. Cross-linked to #7 (audit infra) and #22 (data strategy). Deferred the actual dwds.de source
  swap under this item at the founder's request.
- **Artifacts:** `docs/PROJECT_STATUS.md`; PR #224 (merge SHA 04e9217).

## Entry 53 — 2026-06-25 (document this session before moving on)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > update necessary developments and prompts from this session in the relevant documentation files. I'll move on with a new session later.
- **Response summary:** Extended the Session 39 entry in `docs/PROJECT_STATUS.md` (Sources Save button +
  migration-0004 confirmation + backlog #24) and the "Resume here" pointer, and appended Entries 48–53
  to this prompt log.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Session 41 — 2026-06-26 — Taxonomy & filtering redesign (research, deck, Mode layer, implementation plan)
Branch: `claude/theme-taxonomy-filtering-redesign-7q0gco`. Docs-only session; shipped via PR #231
(squash-merged to `main`, merge SHA `6fe25c7`).

## Entry 54 — 2026-06-26 (taxonomy research brief)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim — long structured brief, reproduced in a fenced block for fidelity):**
~~~~
# Prompt: Research & Redesign Theme Categorization and Filtering System for Language Learning App

You are a senior product strategist, learning experience designer, and taxonomy architect specializing in language-learning platforms.

## Context
We are building a highly ambitious language-learning app with broad scope and deep coverage across multiple learning modules, including: Vocabulary (Wortschatz), Collocations, Redemittel (functional phrases / expressions), Schreibtraining (writing practice).

The current categorization system in the app is limited and may not adequately support long-term scalability, discoverability, personalization, and advanced learning pathways. We want to redesign the entire taxonomy and filtering framework for these modules from first principles.

## Objective
Conduct deep research and provide a comprehensive recommendation for redesigning how themes/topics should be categorized and filtered across the modules listed above. [Goal: intuitive, pedagogically sound, scalable, flexible across modules, suitable for adaptive learning/personalization, easy layered filtering.]

## Research Scope
1. Benchmark Research (Duolingo, Babbel, Busuu, Lingoda, Goethe, TELC, CEFR, publishers, LMS/EdTech).
2. Theme Categorization Framework (theme/topic, difficulty A1–C2, CEFR, use case, domain/industry, skill type, formality, communication purpose, frequency/usefulness, grammar dependency, linguistic complexity).
3. Multi-Layer Filtering System (Core / Contextual / Linguistic / Learning filters; essential vs optional vs advanced).
4. Theme Hierarchy Design (number of broad themes, sub-themes, deeper categories; ideal depth; Broad → Sub → Micro example).
5. Module-Specific Considerations (should all modules share one taxonomy? module-specific layers? standardization vs customization?).
6. Important Parameters We May Be Missing (learner motivation, intent-based navigation, progression pathways, search behavior, content tagging strategy, AI personalization, content expansion readiness, cross-module linking).

## Deliverables
Provide a detailed report in the format of a professional slide deck. [Slide 1 Executive Summary; 2–4 Benchmark Analysis; 5–7 Core Taxonomy Principles; 8–12 Proposed Theme Architecture; 13–16 Proposed Filtering System; 17–19 Module-Specific Recommendations; 20–22 Risks & Tradeoffs; 23–25 Final Recommendation.]

## Output Requirements
- Be extremely detailed and analytical; structured frameworks and tables; visual hierarchy examples; explain tradeoffs; recommendations backed by research; both learner UX and backend content architecture perspectives; prioritize long-term scalability and excellence. Challenge assumptions and propose better approaches where necessary.
~~~~
- **Response summary:** Audited the live taxonomy in code (11 flat themes on one shared `ThemeId`, three
  incompatible per-module taxonomies, no CEFR field, single-dropdown filter) and wrote a 25-slide
  research/strategy deck recommending a faceted model + shallow Domain→Theme→Sub-theme hierarchy +
  progressive faceted filtering, grounded in the current code.
- **Artifacts:** `docs/TAXONOMY_REDESIGN.md`; first commit on the branch.

## Entry 55 — 2026-06-26 (where to access the deck)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > are you done with all the tasks from the above promp? where can i access the slide deck?
- **Response summary:** Confirmed the research deliverable was complete; pointed to
  `docs/TAXONOMY_REDESIGN.md` on the branch (GitHub-rendered) and offered other formats. Was honest that
  it was delivered as a markdown "slide deck", not a real presentation file.
- **Artifacts:** none (existing `docs/TAXONOMY_REDESIGN.md`).

## Entry 56 — 2026-06-26 (too technical; review robustness; plain language; mockups)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > the content of the ppt is too technical and dry. First, review your work if the analysis is robust. And then, explain the slides better for a non-tech person? Also, generate previews and inlcude screenshots with several examples of how the app looks when implemented the ideas from the ppt.
- **Response summary:** (1) Stress-tested the analysis (re-verified core claims against the code; flagged
  the soft spots: benchmarks not freshly web-sourced, the "15,000 slices" combinatorics oversells given
  sparsity). (2) Rewrote the deck in plain language with a supermarket analogy. (3) Built 6 app mockups
  in `preview/taxonomy/` (HTML in the app's brand tokens, screenshotted with the bundled Chromium) and
  generated a real **.pptx** (python-pptx) embedding them. Fixed a real bug where multi-line callouts
  stored literal newlines that PowerPoint would collapse.
- **Artifacts:** `docs/TAXONOMY_REDESIGN.pptx`, `preview/taxonomy/*` (01–06 + app.css), updated
  `docs/TAXONOMY_REDESIGN.md`.

## Entry 57 — 2026-06-26 (link to ppt)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > give me the link to ppt
- **Response summary:** Gave the GitHub blob + raw download links for `docs/TAXONOMY_REDESIGN.pptx` on the
  branch (noting GitHub can't preview .pptx and the repo is private), and re-sent the file directly.
- **Artifacts:** none.

## Entry 58 — 2026-06-26 (add Work/Personal/Both Mode; deep research)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > I really like the analysis and suggestions. I want to add a further broader category/mode - Personal life vs Work vs Both. Once the user selects one of the modes, then all the category/filters with the recommended tree system and build the backbone. When work mode is chosen, the user should be able to select a wide range of categories like work sector, kind of tasks, typical work place situations, department specific, etc. I'm just blurting out my ideas. Can you do a deep research on how to integrate this idea into your analysis and update the ppt?
- **Response summary:** Ran real web research (telc/BAMF *Rahmencurriculum für den Beruf*, DeuFöV sector
  modules, telc *Deutsch Pflege*, Babbel/Duolingo onboarding) that validated the idea. Integrated a
  top-level **Work/Personal/Both Mode** lens (lens-not-wall) with work-only facets (sector, situation,
  counterpart, task type). Added a new Mode section to the deck (now 35 slides), two new mockups
  (onboarding Mode picker + Work-mode browser), and a full technical addendum to the markdown.
- **Artifacts:** updated `docs/TAXONOMY_REDESIGN.pptx` + `.md`, `preview/taxonomy/07-mode-onboarding.html`,
  `08-work-mode.html` + screenshots.

## Entry 59 — 2026-06-26 (add all research sources to the ppt)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you make sure to add all the sources from your research in the ppt?
- **Response summary:** Added two **References** slides (deck now 37 slides) listing the 10 research
  sources as clickable hyperlinks (primary telc/BAMF/DeuFöV + CEFR; secondary Babbel), with an honesty
  note distinguishing cited claims from general product knowledge. Mirrored the source list into the
  markdown addendum.
- **Artifacts:** updated `docs/TAXONOMY_REDESIGN.pptx` + `.md`.

## Entry 60 — 2026-06-26 (make an implementation plan)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > Make an implementation plan for the taxonomy redesign of genauly. Provide the plan with detailed instructions and an executive summary of each section of the plan.
- **Response summary:** Entered plan mode; read the settings store, content linter, onboarding flow and
  cloudSync to ground the plan in real integration points (found `goal`/`level` already in the store,
  cloudSync auto-syncs new keys, the linter's mirror-array pattern, the reusable onboarding `SelectRow`).
  Drafted a staged 5-phase implementation plan with an executive summary per phase.
- **Artifacts:** plan file (later written to `docs/TAXONOMY_IMPLEMENTATION_PLAN.md` in Entry 63).

## Entry 61 — 2026-06-26 (decisions 1A/2A + install plugins request)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > 1A, 2A. Before you provide with the plan, can you install fallow and ponytail agents/plugins and then provide the updated plan?
- **Response summary:** Recorded the decisions (full 5-phase plan; `mode` as a separate axis from
  `goal`). Was honest that I **cannot** install "fallow"/"ponytail": no install tool is available, they
  are not in the session's agent list, and I could not verify they exist; explained plugin install is
  founder-driven via the client's `/plugin` flow. Noted the plan already reflected 1A/2A.
- **Artifacts:** none.

## Entry 62 — 2026-06-26 (give me the questions)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > give me the questions
- **Response summary:** Re-presented the two clarifying questions in text (plan depth: full 5-phase vs
  first-milestone-only; and how `mode` relates to the existing `goal` field) after the interactive
  question tool had errored. Founder had already answered 1A/2A.
- **Artifacts:** none.

## Entry 63 — 2026-06-26 (write the plan to docs + merge to main)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you write the plan in the docs folder and merge to main along with the analysis ppt?
- **Response summary:** Wrote the approved plan to `docs/TAXONOMY_IMPLEMENTATION_PLAN.md` (with a doc
  header + cross-link from the redesign deck), committed it, opened **PR #231** and squash-merged the
  whole taxonomy effort (deck `.md` + `.pptx`, plan, `preview/taxonomy/` mockups) into `main`. Ran the
  post-merge realignment (reset branch to `origin/main`, force-with-lease). Docs-only; nothing built.
- **Artifacts:** `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/TAXONOMY_REDESIGN.md`; PR #231 (merge SHA
  `6fe25c7`).

## Entry 64 — 2026-06-26 (document this session)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > update the documentation for this session
- **Response summary:** Added the **Session 41** entry to `docs/PROJECT_STATUS.md` (research deck + Mode
  layer + implementation plan, all merged via PR #231), updated the `_Last updated_` header and tied the
  work into backlog #5 (domain/sector filtering, now scoped), and appended Entries 54–64 to this prompt
  log.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

---

## Session 42 — 2026-06-27 — Taxonomy redesign Phases 0–2 implemented & shipped
Branch: `claude/taxonomy-redesign-qp2euj`. First build session on the approved
`docs/TAXONOMY_IMPLEMENTATION_PLAN.md`. (Entries 65–66 were given before a context compaction and are
backfilled from the session summary so the trail is complete.)

## Entry 65 — 2026-06-27 (start implementing the taxonomy plan)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you start implementing the taxonomy redesign plan by referring relevant documentation?
- **Response summary:** Began Phase 0 + Phase 1 (the plan's recommended first milestone). Phase 0: added
  the faceted types (`DomainId`, `LearningMode`, `ContextTag`, `ContentCefr`, `Frequency`, `WorkSector`,
  `Counterpart`, `WorkSituation`, `TaskType`) and optional facet fields to `src/types/index.ts`, the
  `src/data/domains.ts` registry (6 domains), `domain`/`context` on all 11 themes, `mode` in
  `useSettingsStore`, and matching linter mirror-arrays/validations. Phase 1: tagged all 515 vocab + 396
  collocations with `cefr`, added the onboarding Mode step, the header `ModeSwitcher`, the CEFR Level
  filter in `VocabularyTrainer` (`filterVocab`), and the quiz CEFR relabel. Committed on the branch.
- **Artifacts:** `src/types/index.ts`, `src/data/domains.ts`, `src/data/themes.ts`,
  `src/store/useSettingsStore.ts`, `scripts/lint-content.mjs`, `src/data/vocabulary.ts`,
  `src/data/collocations.ts`, `src/features/onboarding/Onboarding.tsx`,
  `src/components/layout/ModeSwitcher.tsx` (new), `src/components/layout/AppShell.tsx`,
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/quiz/*`, `src/engine/quiz.ts`; later
  shipped via PR #233.

## Entry 66 — 2026-06-27 (also read CLAUDE.md for context)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > read relevant sections of claude.md as well for context
- **Response summary:** Read the content-conventions, writing-style (no em dashes) and workflow sections
  of `CLAUDE.md` and applied them to the Phase 0/1 work (linter mirror-array pattern, em-dash-free copy,
  auto-ship workflow). No separate artifact; informed Entry 65's implementation.
- **Artifacts:** none (context only).

## Entry 67 — 2026-06-27 (is it live?)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > is it live?
- **Response summary:** Explained that feature-branch work does not deploy until merged to `main`, then
  opened **PR #233** (Phase 0+1) and squash-merged it so the Pages deploy runs. Ran the post-merge
  realignment (reset branch to `origin/main`, force-with-lease).
- **Artifacts:** PR #233 (merge SHA `ebacbbd`).

## Entry 68 — 2026-06-27 (what changes should I see?)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > what changes am I supposed to see in the app
- **Response summary:** Listed the visible changes: the onboarding Mode step, the header Mode pill, the
  CEFR Level dropdown in the Vokabeltrainer, and the CEFR labels on the quiz level cards. Noted the
  taxonomy foundations are under the hood.
- **Artifacts:** none (answer only).

## Entry 69 — 2026-06-27 (I don't see the changes)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > I don't see any of these changes
- **Response summary:** Checked the GitHub Actions runs for `main` and confirmed the deploy for merge
  commit `ebacbbde` completed successfully, so the changes are live. Advised a hard refresh (PWA service
  worker cache) and noted onboarding only shows for new users.
- **Artifacts:** none (diagnosis only).

## Entry 70 — 2026-06-27 (gap analysis of Phase 0 & 1)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you do a gap analysis of what's in the plan vs what's implemented for phase 0 & 1?
- **Response summary:** Verified each plan item against the code and reported: Phase 0/1 functionally
  complete; three minor Phase-0 misses (`ExamTheme.subThemes?` field, `SubThemeId` alias, unvalidated
  `WorkSituation`/`TaskType`); two substantive carry-overs (CEFR tags AI-drafted not human-verified;
  `mode` persisted but no content effect yet).
- **Artifacts:** none (analysis only).

## Entry 71 — 2026-06-27 (close the Phase-0 misses)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > yes, go ahead and give your best
- **Response summary:** Closed the Phase-0 checklist tail: added the `SubThemeId` alias + `SubTheme`
  interface + `ExamTheme.subThemes?`, and wired `workSituation?`/`taskType?` as real validate-when-present
  facets (peers of `sector`/`counterpart`) with `WORK_SITUATIONS`/`TASK_TYPES` linter arrays + theme
  `subThemes` structural checks. Typecheck/lint/build green; shipped via **PR #234**.
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`; PR #234 (merge SHA `3c21360`).

## Entry 72 — 2026-06-27 (start Phase 2)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > yes, go ahead and do your best
- **Response summary:** Implemented Phase 2 (sub-themes). Added `subThemes` to `behoerde` (4),
  `customer` (3) and `meetings` (3); tagged 122 vocab + 105 collocations with `subThemeId` (cross-cutting
  items left to roll up); built the `SubThemePicker` drill-down with `?sub=` + breadcrumb in
  `VocabularyTrainer`; added `vocabBySubTheme`/`collocationsBySubTheme` + a `sub` option on `filterVocab`;
  and made the linter cross-validate every `subThemeId` against its theme. Shipped via **PR #235**, then
  logged **Session 42** in `docs/PROJECT_STATUS.md` (**PR #236**). Counts reconcile to each theme total.
- **Artifacts:** `src/data/themes.ts`, `src/data/vocabulary.ts`, `src/data/collocations.ts`,
  `src/features/vocabulary/SubThemePicker.tsx` (new), `src/features/vocabulary/VocabularyTrainer.tsx`,
  `scripts/lint-content.mjs`, `docs/PROJECT_STATUS.md`; PR #235 (merge SHA `59b9e62`), PR #236
  (merge SHA `1355ea0`).

## Entry 73 — 2026-06-27 (update the documentation so far)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > update the documentation so far
- **Response summary:** Brought the long-lived docs in line with Phases 0–2. Added a "Taxonomy layer"
  bullet to `CLAUDE.md` (domains, sub-themes, facets, `mode`, linter validations, filter helpers), fixed
  the stale collocations count (132 → 396) and added the facet fields to the schema notes; marked Phases
  0/1/2 SHIPPED and Phase 3 NEXT in `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`. Shipped via **PR #237**.
- **Artifacts:** `CLAUDE.md`, `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`; PR #237 (merge SHA `590794c`).

## Entry 74 — 2026-06-27 (is the prompt log updated?)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > is prompt log also updated?
- **Response summary:** It was not, so appended the **Session 42** block (Entries 65–74) to this log,
  covering every founder prompt of the session with its artifacts and merge SHAs, and shipped it.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`; PR #238.

## Entry 75 — 2026-06-27 (standing rule: docs updates include the prompt log)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > you should update prompt log as well when I say update documentation along with others. I may not be too explicit about it.
- **Response summary:** Encoded the standing preference so future sessions honour it without being told
  explicitly: amended the **Documentation** and **Prompt & session log** rules in `CLAUDE.md` to state
  that any "update the documentation"-type request implies updating `docs/SESSION_PROMPT_LOG.md` too (plus
  any stale plan/CLAUDE.md docs), and mirrored the rule in this log's "How this log is maintained" header.
- **Artifacts:** `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`; PR #239.

## Session 43 — 2026-06-27 (Taxonomy Phase 3a: mode-aware intent cards)

## Entry 76 — 2026-06-27 (continue with the taxonomy plan, next phase)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > continue with the taxxonomy review plan next phase
- **Response summary:** Started **Phase 3** of the taxonomy plan. Phase 3 is large and its Work-mode
  facets (sector/workSituation/counterpart) have **zero tagged content**, so I shipped the cleanest,
  highest-value slice first: **step 4, the mode-aware intent/goal cards**. Added
  `src/features/dashboard/intentCards.ts` (7 starting-point cards, each with a pre-built filter bundle +
  deep-link, `intentCardsForMode()` lens filter, and live `filterVocab`-based word-count/CEFR-range meta)
  and rendered them as a new "Was möchtest du üben?" section atop the dashboard. This gives `mode` its
  **first real content effect** (switching the header Mode pill now changes which cards show). `pnpm
  lint:content` + `pnpm build` green. Documented the remaining Phase 3b work (shared faceted filter,
  register unification, and the Work-facet content back-fill) in the plan + status doc.
- **Artifacts:** `src/features/dashboard/intentCards.ts` (new), `src/features/dashboard/Dashboard.tsx`,
  `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR #240.

## Entry 77 — 2026-06-27 (continue: Phase 3b)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > yes, continue
- **Response summary:** Shipped **Phase 3b**: register unification + the reusable faceted filter, first
  integration. Widened `Collocation.register` to `neutral|formal|diplomatic` (linter + card badge).
  Built **`src/features/shared/FacetSheet.tsx`**, a generic slide-up filter sheet (on `dialog.tsx`,
  overridden to a bottom sheet) with multi-select pills showing live counts and greyed zero-yield
  options (AND-across / OR-within; exports `matchesFacets`/`applyFacets`/`activeFacetCount`). Wired it
  into the **CollocationsBrowser** with CEFR + Register facets (`?cefr=`/`?register=`) and removable
  active-filter chips. Collocations had no level/register filtering before. `pnpm lint:content` +
  `pnpm build` green. Documented remaining 3c (vocab + redemittel integration, then the Work-facet
  back-fill).
- **Artifacts:** `src/features/shared/FacetSheet.tsx` (new), `src/features/collocations/CollocationsBrowser.tsx`,
  `src/types/index.ts`, `scripts/lint-content.mjs`, `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR #241.

## Entry 78 — 2026-06-27 (sector back-fill, then continue)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > start with sector back-fill and then continue with the plan
- **Response summary:** Flagged that the `sector` facet had no taggable content (existing vocab is
  generic office German) and asked how to populate it; founder chose **author a real Pflege pack**. Then
  (1) **sector back-fill (PR #242):** authored a 13-word care/Pflege vocab pack spread across existing
  themes so `sector` cuts across topics, tagged a curated set of `office` words, added 13 provenance
  rows (vocab 515→528); (2) **Phase 3c:** wired the `FacetSheet` into the VocabularyTrainer with CEFR +
  Wortart facets and the Work-mode **`sector` ("Branche") facet shown only when `mode === "work"`** (state
  in `?cefr=`/`?pos=`/`?sector=`, removable chips). So the Work-mode facets are now functional end to end.
  `pnpm lint:content` + `pnpm build` green throughout. Updated CLAUDE.md content counts + the plan/status
  docs; documented the remaining polish (redemittel faceting, workSituation/counterpart tagging).
- **Artifacts:** `src/data/vocabulary.ts`, `src/data/provenance.ts`, `src/features/vocabulary/VocabularyTrainer.tsx`,
  `CLAUDE.md`, `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`;
  PRs #242 (back-fill) + #243 (3c).

## Entry 79 — 2026-06-27 (dashboard: lead with intent tiles, slim the progress block)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** dashboard screenshot (focal "Zeit zum Wiederholen" hero + status strip).
- **Prompt (verbatim):**
  > I now understand what the dropdown on the top does - it changes the tiles in was moechtet du ueben. But the problem with the dashboard is that there is the attached progress section which is taking up too much space. My suggestion is that you move this all to Fortschritt section. You can just put a very small summarized section below the was moechtet du ueben tiles so that the user sees these tiles the first thing. It's okay to keep the position and promising of the dropdown pill intact. After this is done, go ahead with the plan.
- **Response summary:** Restructured the dashboard so the **"Was möchtest du üben?" intent tiles come first**.
  Removed the large focal hero block + the four-stat status strip + level progress bar (all of which is
  already on the Fortschritt/Analytics page, so nothing was lost). Replaced them with **one compact
  summary strip below the tiles** (streak · today XP/goal · days-to-exam · the recommended primary action
  + a "Fortschritt" link to the full breakdown). Mode pill placement/prominence left intact. `pnpm build`
  green. Then continued with the plan: shipped the dashboard restructure as **PR #244**, then wired a
  Register filter into the Redemittel browse view (**PR #245**).
- **Artifacts:** `src/features/dashboard/Dashboard.tsx` (PR #244); `src/features/redemittel/RedemittelTrainer.tsx`
  (PR #245); `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 80 — 2026-06-27 (continue: workSituation facet)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > continue with the plan now
- **Response summary:** Tagged **`workSituation`** on a cross-cutting set of vocab (`shift-handover` for
  the care shift words, `instructions` for safety/hygiene, `meeting`, `customer-call`) and exposed it as a
  **second Work-mode facet "Situation"** in the Vokabeltrainer next to "Branche" (both appear only when
  `mode==="work"`; state in `?workSituation=`). Made the honest call to **leave `counterpart` 0-tagged**
  (redemittel are general-purpose, so counterpart tags would be low-signal guesswork; documented to author
  counterpart-specific variants later if wanted). Refreshed the stale CLAUDE.md taxonomy + Vokabeltrainer
  UI notes. `pnpm lint:content` + `pnpm build` green. Phase 3 is effectively complete; **Phase 4** is next.
- **Artifacts:** `src/data/vocabulary.ts`, `src/features/vocabulary/VocabularyTrainer.tsx`, `CLAUDE.md`,
  `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR #246.

## Entry 81 — 2026-06-27 (continue: Phase 4 cross-module Related panel)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > continue with the next step.
- **Response summary:** Started **Phase 4** with step 1, the cross-module **"Verbunden" panel**
  (`src/features/vocabulary/RelatedPanel.tsx`). In the Vokabeltrainer Übersicht list each word now expands
  to show matching content from the other banks via the shared `themeId`/`subThemeId` join key: a
  Kollokation (same sub-theme if available, else theme), the theme's Schreibtraining prompt, and a Dialog,
  each deep-linking to the right browser. No hand-maintained id lists. Redemittel are not linked (they
  carry no `themeId`). `pnpm build` green. Documented remaining Phase 4 (mode/level-aware SRS review,
  writing-coach deep-links).
- **Artifacts:** `src/features/vocabulary/RelatedPanel.tsx` (new), `src/features/vocabulary/VocabList.tsx`,
  `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR #247.

## Entry 82 — 2026-06-27 (continue: Phase 4 steps 2 + 3)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > continue working with step 2 and 3
- **Response summary:** Finished **Phase 4**. **Step 2 (mode/level-aware review):** added a pure
  `reviewWeight()` to `src/engine/srs.ts` and rebuilt `QuickRevision`'s deck so the Schnellwiederholung is
  weighted by the Mode lens (theme `context`), card weakness (low mastery), and the learner's weakest CEFR
  band (computed from started cards). Weighted, not walled. **Step 3 (writing-coach deep-links):** added
  `practiceRoute()` to `practiceAreas.ts` and used it in `WritingHub` so the "Üben" button folds the
  prompt's `theme` into the deep-link (theme-aware `/vocabulary`/`/collocations`/`/quiz`; formal Redemittel
  for the register weakness). `pnpm build` green. **The taxonomy redesign (Phases 0–4) is now fully shipped.**
- **Artifacts:** `src/engine/srs.ts`, `src/features/revision/QuickRevision.tsx`, `src/data/practiceAreas.ts`,
  `src/features/writing/WritingHub.tsx`, `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`; PR #248.

## Entry 83 — 2026-06-27 (pause + update documentation)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > pause here. update documentation
- **Response summary:** Closing-pass on the docs for session 43. Fixed the leftover `PR #TBD` placeholders
  (Entries 79/81/82 → PRs #244/#247/#248), added a **Session 43** summary block to `docs/PROJECT_STATUS.md`
  (taxonomy Phases 3–4 + dashboard restructure, PRs #240–#248), and confirmed `CLAUDE.md`
  (counts/facets/UI) and `docs/TAXONOMY_IMPLEMENTATION_PLAN.md` are current. No app code changed.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Session 44 — 2026-06-28 — Session-43 review, dark-mode fix, filter-harmonization plan
Branch: `claude/review-previous-session-69pxat`.

## Entry 84 — 2026-06-28 16:57 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you make sure all the changes in the previous session are all well done as per the plan? fix any bugs you may find and make sure all the updates are both computer and mobile friendly.
- **Response summary:** Reviewed all of session 43 (taxonomy Phases 3–4, PRs #240–248) against the
  documented plan. Installed deps and confirmed `pnpm typecheck` + `pnpm build` + `pnpm lint:content`
  all green. Read every new/changed file (FacetSheet, intent cards, Dashboard, Work-mode facets,
  RelatedPanel, adaptive QuickRevision, `practiceRoute`, SubThemePicker) and verified each matches the
  plan and is responsive on mobile + desktop. Found and fixed one latent mobile bug: the `FacetSheet`
  bottom sheet inherited `overflow-y-auto` on the whole container, so on a short viewport the "Apply"
  button scrolled away. Constrained the grid to `[auto auto minmax(0,1fr) auto]` so only the facet list
  scrolls and the footer stays pinned.
- **Artifacts:** `src/features/shared/FacetSheet.tsx`; commit `0c3bd71` (pre-fix), PR #250; merge `0ed2190`.

## Entry 85 — 2026-06-28 17:25 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 screenshot (Kollokationen page in dark mode showing bright-white filter pills, verb chips and scroll arrows).
- **Prompt (verbatim):**
  > there's a problem with dark mode here. look for such bugs all across the app and fix and auto deploy
- **Response summary:** Diagnosed the root cause beyond the reported pills: **Tailwind's opacity scale
  only contains multiples of 5, so any color utility using `/8` or `/12` silently failed to compile**
  (confirmed via an isolated Tailwind run and by grepping the production CSS, zero rules emitted). Two
  effects in dark mode: `bg-white dark:bg-white/8` elements lost their dark override and fell back to
  bright white; every `/12` tint (badges, stat cards, header streak/level pills, exam/simulation/
  onboarding icon boxes, RelatedPanel chips) rendered with no background. Bumped all `/8` and `/12`
  color-opacity utilities to `/10` (34 utilities, 16 files). Audited the whole `src` tree: those were
  the only non-multiple-of-5 steps in use and no hardcoded light-only colors lack a dark variant.
  Verified the tints now appear in the emitted CSS; typecheck/build/lint green. Shipped and auto-merged.
- **Artifacts:** 16 files incl. `components/ui/badge.tsx`, `components/shared/StatCard.tsx`,
  `components/layout/AppShell.tsx`, `features/shared/FacetSheet.tsx`,
  `features/collocations/CollocationsBrowser.tsx`, `features/vocabulary/RelatedPanel.tsx`, exam/
  simulation/onboarding/redemittel/quiz files; commit `0c3bd71`, PR #251; merge `f6effee`.

## Entry 86 — 2026-06-28 17:45 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 4 screenshots (Vokabeltrainer + Redemittel + Kollokationen filter sheets and the Quiz level picker, showing the inconsistent header/search/filter controls).
- **Prompt (verbatim):**
  > the search bar, filter button, filter options, themes and branches available are all super chaotic and inconsistent across the menu items like wortschatz, collocations and other relevant items where these filters are applicable. check the taxonomy plan, and recently uploaded playbook for learning apps and prepare a plan for harmonizing these features, redesign the app to have smoothest UX/UI with least confusion and straightforward usage with highest value.
- **Response summary:** Entered plan mode. Read the uploaded playbook
  (`docs/Language Learning App Success Factors.docx`, extracted via python) and the taxonomy spec
  (`docs/TAXONOMY_REDESIGN.md`), and ran two Explore agents to map every browse page's
  header/search/filter structure and the intended faceted-filter UX. Confirmed the divergences
  (two header styles, search only on Kollokationen, Filter button placed differently per page, bespoke
  verb-rail + legend, inconsistent CEFR labels). Asked the founder four scoping questions; answers:
  phased rollout, one responsive panel, branded HubHero everywhere, inline `Search + Theme + Filter`.
  Wrote the plan (a shared `BrowseToolbar` + the existing `FacetSheet` on every page, a shared
  `src/lib/cefr.ts`, declutter the verb-rail/legend into the sheet). Plan approved.
- **Artifacts:** plan file `the-search-bar-filter-enumerated-stream.md` (later saved into the repo, see Entry 87). No app code changed.

## Entry 87 — 2026-06-28 17:55 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > save the plan in the main branch. I'll implement it later
- **Response summary:** Saved the approved plan into the repo as
  **`docs/FILTER_HARMONIZATION_PLAN.md`** (marked "PLANNED, not yet implemented"). Docs-only, no code.
  Shipped to `main` via PR and realigned the dev branch.
- **Artifacts:** `docs/FILTER_HARMONIZATION_PLAN.md` (new); commit `9f567f6`, PR #252; merge `619f812`.

## Entry 88 — 2026-06-28 18:02 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Added a **Session 44** block to `docs/PROJECT_STATUS.md` (review + dark-mode
  fix + filter-harmonization plan, PRs #250–#252, with the "only use opacity steps that are multiples
  of 5" lesson and the "resume here" pointer to the harmonization plan) and bumped its "Last updated"
  line. Appended Entries 84–88 here.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 89 — 2026-06-29 ~00:00 UTC
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > start implementing the filter harmonization plan
- **Response summary:** Implemented the full `docs/FILTER_HARMONIZATION_PLAN.md` across both phases.
  **Phase 1:** created `src/lib/cefr.ts` (shared CEFR scale, replacing 4 duplicated arrays) and
  `src/features/shared/BrowseToolbar.tsx` (unified toolbar layout). Updated three pages:
  VocabularyTrainer (SectionHeading to HubHero, added search, BrowseToolbar), CollocationsBrowser
  (removed verb-chip rail + legend, verb moved into FacetSheet, BrowseToolbar), RedemittelTrainer
  (SectionHeading to HubHero, added search + Kategorie dropdown, BrowseToolbar). Also updated
  SubThemePicker and intentCards to use the shared CEFR_ORDER import.
  **Phase 2:** QuizHub level labels now use `difficultyToBand()` from `src/lib/cefr.ts`.
  GrammarHub/ExamHub/SimulationHub needed no changes. Verified on mobile + desktop via Playwright
  screenshots. `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green.
  Updated docs: PROJECT_STATUS.md (session 45 entry + resume pointer), FILTER_HARMONIZATION_PLAN.md
  (status to IMPLEMENTED), CLAUDE.md (added cefr.ts to layout, updated taxonomy paragraph with
  harmonized toolbar info), SESSION_PROMPT_LOG.md (this entry).
- **Artifacts:** `src/lib/cefr.ts` (new), `src/features/shared/BrowseToolbar.tsx` (new),
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/collocations/CollocationsBrowser.tsx`,
  `src/features/redemittel/RedemittelTrainer.tsx`, `src/features/vocabulary/SubThemePicker.tsx`,
  `src/features/dashboard/intentCards.ts`, `src/features/quiz/QuizHub.tsx`,
  `docs/PROJECT_STATUS.md`, `docs/FILTER_HARMONIZATION_PLAN.md`, `CLAUDE.md`,
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 90 — 2026-06-29 (session 45, ship + housekeeping prompts)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompts (verbatim, batched housekeeping):** "continue where you left off" (×2), "is everything in main?", "continue"
- **Response summary:** Completed the s45 filter-harmonization implementation (Entry 89), opened
  **PR #254** and squash-merged it to `main` (merge `303414a`), realigned the dev branch, verified all
  three browse pages plus filter sheets and quiz labels via Playwright screenshots on mobile + desktop.
- **Artifacts:** PR #254; commits `c402b8e`…`9d0ffd1`; merge `303414a`.

## Entry 91 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > i recently made a filter harmonization plan but it's not very good. can review the app first and then the filter harmonization plan and suggest a new plan that massively improve the ui/ux of the app and make it exceptionally useful?
- **Response summary:** Reviewed every route (13 screens, mobile + desktop screenshots), read the key
  feature components, extracted the learning-app playbook docx, and drafted `docs/UX_OVERHAUL_PLAN.md`:
  session-first redesign with a four-tier filter architecture and four-zone IA. Follow-up prompt
  mid-review: "make sure your plan accomodates for all screens" → plan includes a per-screen findings
  table covering every route plus header, banner, tab bar, onboarding.
- **Artifacts:** `docs/UX_OVERHAUL_PLAN.md` (new); commit `ce2e925`.

## Entry 92 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (summary; long "senior product strategist" brief):** re-issued the review request with a
  sharper rubric: be highly critical, challenge assumptions, deliver key findings / major UX problems /
  recommended filter architecture / prioritization framework / implementation roadmap.
- **Response summary:** Rewrote the plan doc around that rubric, including a self-critical review of
  the s45 work (siloed search, non-travelling scope, 100+ pill Verb facet, per-page facet wiring that
  does not scale) and the four-tier filter architecture (defaults → global search → travelling scope →
  registry-driven facets with a ≤12-option rule).
- **Artifacts:** `docs/UX_OVERHAUL_PLAN.md` (rewritten in place, same commit line).

## Entry 93 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > which claude model should I use for the above plan? there is a table in the to-do's with model suggestions. update it as well
- **Response summary:** Answered per phase (Phase 0 Sonnet 5 → Phase 1 Opus 4.8 → …; Fable only for
  Can-Do content authoring). Updated the "Model guidance" section: Fable-available-again note, Sonnet
  bumped to 5, new per-phase table for the overhaul plan, Dashboard-redesign row superseded.
- **Artifacts:** `docs/PROJECT_STATUS.md`; commit `8f06916`.

## Entry 94 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > for the four decisions from me, 1. approve, 2. I need more info on what this is, 3. add en button on the top of the app just in case the user wants to translate the whole screen at once for a few seconds and then the en gets locked - I need to brainstorm this idea - keep it as a to-do item that needs more thinking. 4. ai-drafted with review - check the data strategy so far for this
- **Response summary:** Recorded decisions 1/3/4 in Part H; added **backlog #25** (EN peek button,
  needs brainstorming); checked decision 4 against `DATA_GOVERNANCE.md` and wrote the provenance
  recipe for `canDo.ts` (origin authored, license OWNED, draft → verified, CoE CEFR descriptor
  references). Follow-up prompts: "you still did not explain me what is the point 2 of the decisions -
  explain it to me first" → plain-language explanation of the tab-bar default-pin change; then
  "okay, continue with this suggestion. I approve" → decision 2 recorded as approved, plan status
  set to FULLY APPROVED.
- **Artifacts:** `docs/UX_OVERHAUL_PLAN.md`, `docs/PROJECT_STATUS.md`; commits `25c8acc` +.

## Entry 95 — 2026-07-02 (session 46)
- **Branch:** `claude/filter-harmonization-plan-0vzdgz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > do the necessary housekeeping and merge the plan to main. Do not implement the plan yet. I'll do it with other models as suggested in the table.
- **Response summary:** Session 46 documentation completed (status entry, resume pointer, this log),
  all docs squash-merged to `main`, branch realigned. **No implementation**, per instruction; the
  founder runs the phases in later sessions with the models from the phase table.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR + merge SHA recorded in git history.

## Entry 96 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > can you start working on the step 0 of ux overhaul plan?
- **Response summary:** Implemented `docs/UX_OVERHAUL_PLAN.md` Phase 0 (quick wins): gated the
  sign-in banner to the Heute/dashboard route with a persisted `signInBannerDismissed` setting;
  removed the redundant Level pill + XP ring from the mobile header (down to 4 widgets, both
  values still shown on Fortschritt) and labelled the streak pill; added `blurbDe`/`purposeDe`
  German fields to all 11 theme cards and 10 grammar topics (English kept as a secondary field);
  renamed "Prüfungsthemen" → "Deine Themen" and "Quick Review" → "Schnelle Runde"; replaced the
  four zero-value Fortschritt stat tiles with a goal card (sourced from existing onboarding
  settings) for learners with no XP/sessions yet. Verified with `pnpm typecheck`, `pnpm
  lint:content`, `pnpm build`, and a headless-Chromium mobile-viewport smoke pass (dashboard,
  grammar, revision, analytics).
- **Artifacts:** `scripts/lint-content.mjs`, `src/components/layout/AppShell.tsx`,
  `src/data/grammar.ts`, `src/data/themes.ts`, `src/features/analytics/Analytics.tsx`,
  `src/features/auth/SaveProgressBanner.tsx`, `src/features/dashboard/Dashboard.tsx`,
  `src/features/grammar/GrammarHub.tsx`, `src/features/revision/QuickRevision.tsx`,
  `src/store/useSettingsStore.ts`, `src/types/index.ts`, `docs/PROJECT_STATUS.md`; commit `b48abd7`,
  PR #256 (squash-merged).

## Entry 97 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > continue [after switching the session model to Opus 4.8]
- **Response summary:** Implemented `docs/UX_OVERHAUL_PLAN.md` Phase 1 (session engine + Heute), the
  core "one tap, one composed session" transformation. Built a pure composer `engine/session.ts`
  (`buildSession` interleaving due vocab + quiz + grammar + Redemittel; deterministic
  `sessionPreview`; `weakestBand`/`weakestTheme`/`difficultyForLevel`), a `SessionPlayer` that renders
  every block kind behind one progress bar + XP tally with an end screen (XP, "Stärker geworden"
  list, forward hook), and new `SessionBlock`/`SessionPlan` types. Reworked Heute to lead with a
  primary session CTA hero + Situationen chips launching scoped sessions; folded Schnellwiederholung
  into the short preset of the same engine. Reused existing renderers by extracting shared
  `QuestionViews.tsx` (QuizRunner + SessionPlayer) and adding backwards-compatible
  `onResult`/`suppressXp` props to `GrammarDrillCard`. New `/session` route. Verified with typecheck,
  lint:content, build, and a headless mobile smoke pass driving a full session to the end screen.
- **Artifacts:** new `src/engine/session.ts`, `src/features/session/SessionPlayer.tsx`,
  `src/features/session/Session.tsx`, `src/features/quiz/QuestionViews.tsx`; modified
  `src/features/dashboard/Dashboard.tsx`, `src/features/quiz/QuizRunner.tsx`,
  `src/features/revision/QuickRevision.tsx`, `src/features/grammar/GrammarDrillCard.tsx`,
  `src/router.tsx`, `src/types/index.ts`, `docs/PROJECT_STATUS.md`; commit `fecc9d6`, PR #257
  (squash-merged).

## Entry 98 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > continue [after switching the session model to Sonnet 5]
- **Response summary:** Implemented `docs/UX_OVERHAUL_PLAN.md` Phase 2 (global search + Tier-0
  defaults). Built `src/lib/search.ts` `searchAll(query)` — one query over vocabulary, collocations,
  Redemittel, grammar topics and dialogue scenarios, returning grouped deep-linking results — and a
  `GlobalSearch` dialog wired into the mobile header icon, a new Sidebar entry, and a ⌘K/Ctrl+K
  shortcut. Added Tier-0 personalized CEFR-band defaults (`defaultVisibleBands`/`hiddenBandsLabel`
  in `src/lib/cefr.ts`) to Vokabeltrainer, Kollokationen and Redemittel, with a quiet "auch X zeigen"
  escape. During verification found that the vocabulary bank has no A2/B1.1/C1-tagged items, so the
  naive band default rendered an empty list for A2 learners; fixed with a non-empty guard so the
  default never activates unless it leaves at least one result. Verified with typecheck,
  lint:content, build, and headless mobile + desktop smoke passes.
- **Artifacts:** new `src/lib/search.ts`, `src/components/layout/GlobalSearch.tsx`; modified
  `src/lib/cefr.ts`, `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`,
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/collocations/CollocationsBrowser.tsx`,
  `src/features/redemittel/RedemittelTrainer.tsx`, `docs/PROJECT_STATUS.md`; commit `b99a5db`, PR #258
  (squash-merged).

## Entry 99 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > continue [after switching the session model to Opus 4.8]
- **Response summary:** Implemented `docs/UX_OVERHAUL_PLAN.md` Phase 3 (Bibliothek + travelling
  scope). Before building, used `AskUserQuestion` to resolve how aggressively to consolidate given the
  founder-locked bottom bar (nav re-map is reserved for Phase 5); founder chose the **soft merge**.
  Built `useLibraryScope` (in-memory travelling theme scope), a `LibrarySwitcher` segmented control +
  dismissible `ScopeChip` rendered on all four library pages, wired scope hydration + write-through
  into Vokabeltrainer and Kollokationen (theme travels both ways, URL still overrides), and added an
  "Üben" button on both toolbars launching a scoped `/session?theme=`. Nothing removed; the locked bar
  + nav registry untouched (hard merge deferred to Phase 5). Fixed a mid-build bug where deep-link
  `?theme=` didn't populate the scope store. Verified with typecheck, lint:content, build, and mobile
  + desktop smoke passes.
- **Artifacts:** new `src/store/useLibraryScope.ts`, `src/features/library/LibrarySwitcher.tsx`;
  modified `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`,
  `src/features/grammar/GrammarHub.tsx`, `docs/PROJECT_STATUS.md`; commit `432fde2`.

## Entry 100 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompts (verbatim, in order):**
  > continue phase 4 now [after switching the session model to Fable 5]

  > stop for phase 4 ui part as I need to change the model to sonet

  > continue the fable task of phase 4
- **Response summary:** Authored the **content half** of `docs/UX_OVERHAUL_PLAN.md` Phase 4 (the
  Fable-appropriate pedagogical-German step). Created `src/data/canDo.ts` — 25 CEFR-aligned "Ich kann …"
  Can-Do milestones (2–3 per theme, all 11 themes, ascending bands + mastery thresholds), written in our
  own German aligned to the Council of Europe CEFR self-assessment descriptors (cited, not reproduced),
  per Part-H decision 4. Added the `CanDoStatement` type, the `can_do` provenance content type (+ the
  `/sources` page label), 25 provenance rows (`origin: authored`, `license: OWNED`, `review_status:
  "draft"` awaiting founder review), and `lint:content` validation (`lintCanDo`: unique ids, theme/cefr
  enums, "Ich kann" prefix, threshold range, full theme coverage). Per the founder's mid-task interrupt,
  **stopped before the Fortschritt UI half** (to be built on Sonnet 5). Verified with typecheck,
  lint:content, build (all green).
- **Artifacts:** new `src/data/canDo.ts`; modified `src/types/index.ts`, `src/data/provenance.ts`,
  `scripts/lint-content.mjs`, `src/features/legal/Sources.tsx`; commit `93eb4b7` (NOT merged — Phase 4 is
  incomplete, PR opens once the UI half lands).

## Entry 101 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > update all the relevant documentation so far. I'll continue this in another session [after
  > switching the session model to Opus 4.8]
- **Response summary:** Brought the documentation in sync with the whole session (Phases 0–3 merged,
  Phase 4 content-half committed but unmerged). Updated `CLAUDE.md` (Layout section for the new
  session/library/search files + `canDo.ts`; a new "UX overhaul" status block listing the phase
  progress; the Can-Do content-bank + linter conventions; refreshed the stale active-branch references
  from `claude/vibrant-meitner-mfl9xk` to `claude/ux-overhaul-step-0-7mtsff`) and `docs/PROJECT_STATUS.md`
  (Resume-here rewritten for the Phase-4 UI-half handoff, with a ⚠️ note that the branch is AHEAD of
  `main` so the next session must NOT reset --hard; new session-47 Phase-4-content log entry). No code
  changes.
- **Artifacts:** `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; doc-only commit.

## Entry 102 — 2026-07-02 (session 47)
- **Branch:** `claude/ux-overhaul-step-0-7mtsff`
- **Assistant:** Claude Code (Anthropic)
- **Prompt summary (not captured verbatim at the time; reconstructed from the commit record):** the
  founder reviewed the 25 Can-Do statements in `src/data/canDo.ts` (via the GitHub link) and approved
  them, completing the four-eyes review from Part-H decision 4.
- **Response summary:** Flipped all 25 `can_do` provenance rows in `src/data/provenance.ts` from
  `review_status: "draft"` to `"verified"` (`verified_by: "founder"`, `verified_date: "2026-07-02"`).
  Refreshed the `canDo.ts` file header and the `CLAUDE.md`/`PROJECT_STATUS.md` notes that previously
  said "review pending" to reflect the approval. `pnpm lint:content` now reports 25 provenance rows
  verified.
- **Artifacts:** `src/data/canDo.ts`, `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`;
  commit `72a67cf`.

## Entry 103 — 2026-07-02 (session 48)
- **Branch:** `claude/ux-overhaul-phase-4-ui-qh8si7`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim, task-runner instruction):**
  > Continue the UX overhaul, Phase 4 UI half, on branch `claude/ux-overhaul-step-0-7mtsff`. Read
  > `docs/UX_OVERHAUL_PLAN.md` (Part E5) and `docs/PROJECT_STATUS.md` "Resume here" first. Build three
  > things (mostly UI assembly over data/math that already exist): (1) a Can-Do milestone section in
  > `Analytics.tsx` as the Fortschritt headline, checked off via `canDoByTheme` + theme mastery ratio;
  > (2) a diagnose card reusing `weakestBand`/`weakestTheme` from `engine/session.ts` with a one-tap
  > "Session dazu starten"; (3) relocate the theme mastery grid from Heute to Fortschritt (already lives
  > there), replacing the Dashboard grid with a quiet "Alle Themen" link. Verify with typecheck +
  > lint:content + build + a headless-Chromium mobile smoke pass, then ship: commit, push, open one PR
  > into `main` bundling the already-committed Phase-4 content half, wait for CI, squash-merge, and do
  > the post-merge branch realignment. Update the documentation.
- **Response summary:** Discovered the session's designated branch (`claude/ux-overhaul-phase-4-ui-qh8si7`)
  had been created from `main` and did not carry the session-47 Phase-4 content commits, while the branch
  named in the task text (`claude/ux-overhaul-step-0-7mtsff`) did; reset the designated branch onto that
  content branch (no local work was lost — the designated branch was clean and identical to `main`) so
  both halves of Phase 4 could ship together. Built the **Can-Do milestone section** in `Analytics.tsx`
  (grouped by theme, least-mastered-first, checked off per statement `threshold` vs `themeStats.ratio`,
  with an overall achieved/total badge), the **diagnose card** (weakest CEFR band via `weakestBand`, or
  weakest theme via `weakestTheme` as a fresh-learner fallback, with a "Session dazu starten" button
  navigating to `/session?theme=`), and **removed the "Deine Themen" browse grid from `Dashboard.tsx`**
  (with its now-unused `iconByName`/`Progress`/`Badge`/`scenariosByTheme`/`vocabByTheme`/`mastery`/`pct`
  imports), replacing it with a quiet "Alle Themen" card linking to `/vocabulary`. Verified with
  `pnpm typecheck`, `pnpm lint:content`, `pnpm build` (all green), and a headless-Chromium mobile smoke
  pass seeding `srs`/settings into `localStorage`: confirmed the Can-Do section renders checked/unchecked
  milestones correctly, the diagnose button navigates to `/session?theme=...`, and Heute now ends in the
  hero + Situationen + status strip + "Alle Themen" link with no theme grid. Opened PR #260 into
  `main` bundling the session-47 content commits with this session's UI commit; waited for the
  `lint-content` CI check to pass, then squash-merged (`74ccd7c`) and realigned the dev branch to
  `origin/main` per the post-deploy housekeeping rule.
- **Artifacts:** modified `src/features/analytics/Analytics.tsx`, `src/features/dashboard/Dashboard.tsx`,
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/UX_OVERHAUL_PLAN.md`, `docs/SESSION_PROMPT_LOG.md`;
  PR #260, squash-merged as `74ccd7c`.

## Entry 104 — 2026-07-02 (session 49)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > go ahead with next step
- **Response summary:** Read `docs/PROJECT_STATUS.md` "Resume here", `CLAUDE.md`, and
  `docs/UX_OVERHAUL_PLAN.md` (Part E4/E6, Part G/H) to confirm the next step = **UX overhaul Phase 5**
  (Anwenden hub + nav re-map + facet registry, founder-approved). Scoped it to ship the high-value,
  founder-approved **IA restructure** as one mostly-additive PR, and deliberately deferred the low-value
  Tier-3 facet-registry/Verb-drop tail and the plan's in-page feature removals (quiz retirement + vocab
  tab removal) to a follow-up to avoid surprising removals in the nav PR. Built: **AnwendenHub**
  (`/anwenden`, 3 cards → Sprechen/Schreiben/Prüfung) + renamed the SimulationHub title to
  "Sprechsimulation"; **LibraryHub** (`/library?tab=…`) folding the four library surfaces into one URL
  with the old routes redirecting in (params preserved) via `LibraryRedirect`, and made `LibrarySwitcher`
  tab-based; **four-zone nav** in `nav-items.ts` (`DEFAULT_PINNED_TABS = ["/","/library","/anwenden",
  "/analytics"]`, navItems collapsed to the 5 zones, `ROUTE_SUCCESSOR` map) with custom `/library` +
  `/anwenden` marks in `route-icons.tsx`; and a **`useSettingsStore` persist migration** (`version: 1`)
  remapping existing users' pins/More-order onto the new zones. Verified `pnpm typecheck` +
  `pnpm lint:content` + `pnpm build` (all green) and a headless-Chromium mobile smoke pass (routing,
  redirects with preserved params, the four-zone bar, and the `version:0→1` pins migration, zero console
  errors). Updated `CLAUDE.md` (Phase 5 status + `DEFAULT_PINNED_TABS`/migration facts),
  `docs/PROJECT_STATUS.md` (session-49 log + "Resume here"), and this log.
- **Artifacts:** new `src/features/anwenden/AnwendenHub.tsx`, `src/features/library/LibraryHub.tsx`;
  modified `src/components/layout/nav-items.ts`, `src/components/layout/route-icons.tsx`,
  `src/store/useSettingsStore.ts`, `src/features/library/LibrarySwitcher.tsx`,
  `src/features/simulation/SimulationHub.tsx`, `src/features/dashboard/Dashboard.tsx`, `src/router.tsx`,
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; commit `6f373ee`, PR #262,
  squash-merged to `main` as `c317047`.

## Entry 105 — 2026-07-02 (session 49)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > What's left in the ux overhaul plan? is everything complete?
- **Response summary:** Reported that Phases 0–4 are merged and Phase 5's IA restructure just shipped, so
  the only remaining work is the **Phase-5 tail**: (1) the central facet registry (`src/lib/facets.ts`)
  + dropping the 100-option Verb facet + the ≤12-option rule, and (2) the plan's in-page removals
  (retire the standalone `/quiz` hub, remove the Vokabeltrainer Karteikarten/Quiz tabs). Noted the parked
  items (EN-peek backlog #25, the Appendix "later bets") are explicitly out of scope.
- **Artifacts:** none (informational).

## Entry 106 — 2026-07-02 (session 49)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > are the changes live?
- **Response summary:** Checked the `pages.yml` deploy run for the merge commit `c317047` via the GitHub
  Actions API. The **build job succeeded** (artifact uploaded) but the **deploy job failed** on GitHub's
  `actions/deploy-pages` step with `Deployment failed, try again later` — a transient GitHub Pages
  platform flake, not a code issue (the same failure had also hit the Phase-4 merge `74ccd7c`).
  Re-ran the failed deploy job; attempt 2 of the deploy went green (environment `https://genauly.de/`),
  so the changes went live. Flagged that this Pages flake has now recurred twice and offered to add an
  automatic retry to `pages.yml`.
- **Artifacts:** re-ran workflow run `28622060959` (deploy attempt 2, success). No code changes.

## Entry 107 — 2026-07-02 (session 49)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > yes, I see the changes. document the session
- **Response summary:** Founder confirmed the four-zone nav is live on the deployed site. Finalised the
  session documentation: filled the PR/merge references into the session-49 entries here, added entries
  105–107 for the follow-up prompts, and updated `docs/PROJECT_STATUS.md` ("Resume here" marked
  founder-verified live + PR #262/`c317047`, plus a new ops note recording the recurring `pages.yml`
  "Deployment failed, try again later" flake and the re-run remedy).
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`, `docs/PROJECT_STATUS.md`.

## Entry 108 — 2026-07-03 (session 49 cont.)
- **Branch:** `claude/next-step-kve6wf`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > continue with it
- **Prompt (verbatim, follow-up after a dropped AskUserQuestion):**
  > Continue from where you left off.
- **Response summary:** Completed the Phase-5 tail in two PRs. **PR #264 (`1141cde`) — facet registry:**
  new `src/lib/facets.ts` declaring each content type's facets once (`vocabFacets`/`collocationFacets`/
  `redemittelFacets` + `*_FACET_IDS`, derived from the taxonomy enums), consumed by VocabularyTrainer /
  CollocationsBrowser / RedemittelTrainer; **dropped the 100-option Verb facet** and codified the
  **≤12-option rule** (`MAX_FACET_OPTIONS` + a dev-time warning). No UI change. **Final PR — Vokabeltrainer
  tab removal:** retired the in-page Karteikarten + Quiz tabs behind a reversible `SHOW_PRACTICE_TABS =
  false` flag; the page is now the browse/inspect surface and practice flows through the toolbar's
  "Üben → composed session"; hero copy updated. Left the standalone `/quiz` hub as a live off-nav route
  reachable via deep links (no hard redirect, to preserve the GrammarHub/`practiceAreas` deep-link
  intents). Tried to confirm the visible removals via `AskUserQuestion` first, but the tool call failed
  (permission stream closed); given the two "continue" instructions I proceeded, doing the removal
  reversibly so the founder can veto it live. Verified each step with `pnpm typecheck` + `pnpm
  lint:content` + `pnpm build` (all green) and headless-Chromium mobile smokes (the three filter sheets
  render with no Verb facet; the vocab page shows the word list with no Karteikarten/Quiz tabs and
  "Üben" → `/session`, zero console errors). With this, **the whole UX overhaul roadmap (Phases 0–5) is
  complete.** Updated `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/UX_OVERHAUL_PLAN.md`, and this log.
- **Artifacts:** new `src/lib/facets.ts`; modified `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`,
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/UX_OVERHAUL_PLAN.md`, `docs/SESSION_PROMPT_LOG.md`;
  PR #264 (`1141cde`) + the final tab-removal PR.
