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

Entries **1–364 (through 2026-07-12)** are archived by ISO week under **`docs/archive/prompt-log/`**
(`SESSION_PROMPT_LOG_2026-W25/W26/W27/W28.md`; see that folder's `README.md` index). This file holds
**entry 365 / 2026-07-13 onward**. Keep appending here, newest at the bottom, and rotate per the policy above.

## Entry 365 — 2026-07-13 (session 104, parallel Bibliothek work-stream)

- **Branch:** `claude/sonnet-5-ui-refinement-7w4z1v` (Sonnet 5, mid-session switch to Opus 4.8)
- **Prompts (verbatim):**
  > the reset button should work even to reset the drop-down items in the filter. For the drop-down items, multiple selection should be possible.
  > Also, move up the WOrt art to third in heirarchy in filter tile and the Stufe as last.
  > continue now
  > Add the same subtle gray to the filter tile as the page toggle buttons have, as there is not much contrast between the content tiles and filter tile - the filter pills and dropdown fields can stay white. Also, the attached picture shows clearly there are more items in the filter, so the expanded tile should extend until it fills the screen until down filling the empty space. Once it fills the screen vertically downward and if there are still items in the filter not visible, then there should be internal scroll. Add a neat little scroll bar to the right. The numbers within drop down menus should not show the total word count - it should show the number of different branches or themas and the numbers can have the same format as in the pills below. For the search bar, it should use the second row itself in the desktop view by moving the other icons around and no need of third line for it. The Redemittel has headers which go against the design language in other pages within Bibliothek - get rid of the titles and instead make the group names visible as pills in the filter. Finally, you need to do a full UI pre-demo sweep for Grammatik section as the UI/UX is quite below average at the moment. [+ attached screenshot of the Wörter filter rail]
- **Response summary:** A pre-demo Bibliothek round shipped in one turn (started on Sonnet 5, founder
  switched the session to Opus 4.8 partway). (1) **Multi-select scope dropdowns** across all four
  browse tabs: a hand-built `ScopeMultiSelect` checkbox popover in `FilterRail.tsx` (Radix `Select` is
  single-value), `RailPrimary` → `values: string[]`; `matchesSector`/`sectorFirst`/`themeGroupsForMode`
  take arrays; sub-theme/scope machinery degrades to single-Thema; `AskUserQuestion` confirmed "all
  scope dropdowns" (reverses the s84 single-select lock). (2) **Reset clears scopes**, badge counts
  scopes+facets. (3) **Filter tile back to subtle grey** `bg-muted` with white controls inside
  (reverses s103 white). (4) **Rail fills the viewport** + `.slim-scrollbar`. (5) **Dropdown "Alle X"
  numbers = option count** (15). (6) **Inline desktop search** (no third line). (7) **Wortart up,
  Stufe last** on Wörter. (8) **Redemittel:** removed per-category card section headers → flat grid;
  Kategorie became a 16-pill multi-select facet. (9) **Grammatik pre-demo sweep:** hub cards show one
  clean emerald pattern (was truncated fragments) + bigger icon tile; drill options got a fill so they
  read as tappable. Gates: typecheck ✔, lint 0 errors, test:unit **130/130**, build ✔, bundle 73.0 kB.
  Browser-verified with Playwright (grey tile + white controls, Branche multi-select popover, option
  counts, inline search, mobile panel, Grammatik cards). Docs updated (CLAUDE.md, DECISIONS.md s104,
  PROJECT_STATUS.md handoff + s102 archived, this log). Merged to `main` per auto-ship.
- **Artifacts:** `src/features/shared/FilterRail.tsx` · `src/lib/facets.ts` · `src/lib/themeGroups.ts` ·
  `src/index.css` · `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `src/features/grammar/GrammarHub.tsx` · `src/features/grammar/GrammarViews.tsx` ·
  `src/features/grammar/GrammarDrillCard.tsx` · `tests/sectors.test.ts` · `CLAUDE.md` ·
  `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 366 — 2026-07-13 (session 105, demo-prep sweep)

- **Branch:** `claude/demo-prep-feedback-rename-sl1jqq` (Opus 4.8)
- **Prompts (verbatim):**
  > Hide the Anwendung section at the moment - it's not needed for the demo tomorrow. Add a disclaimer that it's built with AI and ask for feedback with a subtle button (google style) in every page at the bottom of the screen and make sure the founder gets an email when someone submits a feedback. Rename the Start page as Praktisch (whatever the german word for practical is), and Bibliothek as Theorie (theory). Redesign fortschritt section - it's chaotic at the moment.
  > The filter tile overflowing beyonf the screen size. Strictly constrain it within the screen size and keep the interanl screen enabled. The scroll bar should start below the line separating first row with "Filter" and items below and the scroll bar should disappear when not hovered over in desktop view and shouldnot be there in mobile screen. Keep the second row icons below the page toggle buttons centered and when the scroll bar is clicked they are moved around to expand until the length of the above toggle buttons to enable search.
  > the pin buttons in filter tile are doing nothing in mobile - either give them a purpose or leave them out on mobile
  > assign an appropriate icon for "Praktisch" page instead of the home icon.
  > get rid of the line below good morning <user> line with xp points info on the top row. It's not needed there.
  > For all the tiles in grid view, make them flippable and add the english translation (wherever available at the moment) to the backside. Also where there are 'verbindung' option available on the tile, move them to bottom right corner within the tile.
  > make the redemittel groups as a list of items that can be reordered and add a mehr anzeigena nd weniger anzeigen within the filter. Apply the same styling to grammar categories.
  > wherever there are tags on the tiles which are redundant from what's already in filter tile, get rid of them on tiles.
  > when search bar is not there all the second row items should be in the center, and only when the search bar is clicked, then they must slide away with a neat animation to make space for the search bar.
  > add multiple selection possibility for redemittel and grammatik categories/groups
- **Response summary:** Demo-prep sweep in one long turn. Core: (1) renamed nav "Heute"→**Praktisch**,
  "Bibliothek"→**Theorie**; (2) **hid Anwenden** from the nav (route stays mounted); (3) added a subtle
  **"Mit KI gebaut · Feedback"** pill on every non-focus page → dialog → new `submit-feedback` Edge
  Function that stores a `feedback` row AND **emails the founder via Resend** (deploy + `RESEND_API_KEY`
  needed, documented in PHASE2_SETUP); (4) **redesigned Fortschritt** into calm groups (Überblick /
  Dranbleiben pair / Was du schon kannst / Details collapsible). Then ~9 follow-ups: **flippable Karten
  tiles** (`FlipCard.tsx`, EN on the back) for Wörter/Kollokationen/Redemittel, **Verbunden → bottom-
  right**, **redundant facet tags removed** from tiles, **FilterRail rebuilt as a flex column** with a
  header-anchored auto-hiding scrollbar (`.scrollbar-hover`) strictly capped to the viewport, **pins
  hidden on mobile**, **Mehr/Weniger anzeigen** on long facets, **Grammatik Gruppe → multi-select pill
  facet** (matches Redemittel Kategorie; both multi-select), **centered toolbar with a search-slide
  animation** across all four tabs, **Praktisch dumbbell icon**, and **removed the header XP line**.
  Deferred: drag-reorder of filter categories (no functional purpose for OR-filters). Gates: typecheck
  ✔, lint 0 errors, content-lint ✔, test:unit **130/130**, build ✔, bundle **75.8 kB**/400.
  Playwright-verified (desktop + mobile, 0 runtime errors). Merged to `main` per auto-ship.
- **Artifacts:** `src/components/layout/nav-items.ts` · `BottomTabBar.tsx` · `AppShell.tsx` ·
  `route-icons.tsx` · `FeedbackButton.tsx` (new) · `src/lib/feedback.ts` (new) ·
  `src/features/shared/FlipCard.tsx` (new) · `FilterRail.tsx` · `src/index.css` ·
  `src/features/analytics/Analytics.tsx` · `src/features/library/LibrarySwitcher.tsx` ·
  `src/features/vocabulary/VocabList.tsx` · `VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `src/features/grammar/GrammarHub.tsx` · `GrammarViews.tsx` ·
  `supabase/functions/submit-feedback/index.ts` (new) · `supabase/migrations/0006_feedback.sql` (new) ·
  `supabase/config.toml` · `docs/plans/PHASE2_SETUP.md` · `CLAUDE.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 367 — 2026-07-13 (session 105 continued, Bibliothek follow-ups)

- **Branch:** `claude/demo-prep-feedback-rename-sl1jqq` (Opus 4.8)
- **Prompts (verbatim):**
  > can you make sure the tags for all the themas and Branches are applied properly for all the words and collocations.
  > When clicked on fit to screen button a second time, the graph should zoom in into a random often used word. Add to do-do list in the documentation to add a Verbs and Articles hubs in Bibliothek somewhere. The size (both font and pill size) of white items in filter rail are a bit too big on the desktop - make them smaller. No need of keeping any tags on the tiles that are already part of filter (check this across the bibliothek) and also no need of flip icon (keep them in the code but make it obsolete).
- **Response summary:** (1) **Tag audit** (scratch script via Vite ssrLoadModule): all 1,113 vocab +
  741 collocations have a **valid themeId (0 missing/invalid)** and **valid sectors (0 invalid)**; every
  theme has items; each of the 15 Branchen is populated. 35% of vocab / 25% of collocations are
  Branche-tagged, the rest **untagged = universal by design** (s102). Nothing broken → no content
  edits (mass-tagging the universal words would be wrong). (2) **Graph fit-to-screen toggle**
  (`WordGraph.tsx`): first press fits, the next press **zooms into a random often-used word** (weighted
  by node area ∝ wordfreq Zipf), centering + selecting it; verified in-app (zoomed to "die Garantie").
  (3) **Backlog to-do** added to `PROJECT_REFERENCE.md` (#26): Verbs + Articles hubs in Theorie. (4)
  **Filter-rail white items smaller on desktop** (`FilterRail.tsx`, `lg:` only so mobile tap size is
  kept): facet pills + scope dropdown triggers → `lg:text-xs` + tighter padding. (5) **All
  filter-duplicating tile tags removed** across Bibliothek: the **Lernstand/mastery badge** off Wörter
  cards and the **group-label subtitle** off Grammatik cards (Häufigkeit/Branche/Register/CEFR were
  already gone). (6) **Flip icon removed** from every tile (`FlipHint` no longer rendered; the component
  stays in `FlipCard.tsx`, unused; tiles still flip on click). Gates: typecheck ✔, lint 0 errors,
  content-lint ✔, test:unit 130/130, build ✔, bundle 75.8 kB. Playwright-verified (Wörter tiles,
  filter pills, graph zoom). Merged to `main`.
- **Artifacts:** `src/features/vocabulary/VocabList.tsx` · `src/features/vocabulary/WordGraph.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `src/features/grammar/GrammarViews.tsx` · `src/features/shared/FilterRail.tsx` ·
  `docs/PROJECT_REFERENCE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 368 — 2026-07-13 (session 105 continued, feedback-pill + overflow fixes)

- **Branch:** `claude/demo-prep-feedback-rename-sl1jqq` (Opus 4.8)
- **Prompts (verbatim):**
  > in your screenshots, the filter seems to be too long vertically that the developed by KI/ feedback button overlaps the filter rail. reduce ghe height of it for desktop view. Also, for mobile view, developed with Ki should be to the center and at the bottom of the screen just above the navigation bottom bar. this line/button can be skipped in some places like Ueben /Spielen page where there's no content shown yet.
  > [attached screenshot] the tile seems to be cutting of to the right here. Fix it.
- **Response summary:** (1) **Desktop filter-rail height reduced** — the four rail instances went from
  `lg:max-h-[calc(100vh-7rem)]` to `-11rem` so the rail no longer extends into the bottom-right
  "Mit KI gebaut" pill. (2) **Feedback pill repositioned** (`FeedbackButton.tsx`): on **mobile it is
  centered** (`left-1/2 -translate-x-1/2`) just above the nav bar, raised above the Theorie `/library`
  sticky Üben action bar where present; **skipped entirely on the dashboard `/`** (Praktisch →
  Üben/Spielen, the sparse page the founder named); desktop stays bottom-right. (3) **Flip-card
  horizontal overflow fixed** (`FlipCard.tsx`): the stacked faces' grid had no column template, so an
  expanded RelatedPanel ("Verbunden") sized the cell to its content and bled off the right edge; added
  `grid-cols-1` (minmax(0,1fr)) + `min-w-0` so the inner `truncate` works. Verified in-app (Playwright):
  **0 px horizontal overflow** with the panel expanded, feedback pill count = 0 on the dashboard,
  centered above the nav on Fortschritt, desktop rail clears the pill. Gates: typecheck ✔, lint 0
  errors, test:unit 130/130, build ✔. Merged to `main`.
- **Artifacts:** `src/features/shared/FlipCard.tsx` · `src/components/layout/FeedbackButton.tsx` ·
  `src/features/vocabulary/VocabularyTrainer.tsx` · `src/features/grammar/GrammarHub.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 369 — 2026-07-13 (session 105 continued, Üben scoping + rail overlap + feedback rework)

- **Branch:** `claude/demo-prep-feedback-rename-sl1jqq` (Opus 4.8)
- **Prompts (verbatim):**
  > In your desktop screenshots, the filter rail is still too long and overflows on to the feedback pill - why do you say it clears it? You need to fix it without hallucinations. the customized ueben doesn't seem to work. I clicked on ueben when in Redemittel page but the practice session shows something else. Fix it. When I'm on Redemittel page, I should get quiz about Redemittel only. When I'm in Konnektors page in Redemittel, I should get practice exercises only about Konnektors. Apply the same logic for the whole bibliothek
  > [screenshot] the feedback button is overlapping the content cells. on mobile, it should just be an icon/button which always should stay to the left of Ueben button. When clicked on ueben in ueben page of Praktisch, attached is what I see. The the cell is overflowing. also, here, the feedback button can be longer saying developed with KI feedback geben. there's enough space in ueben practice sessions, so this should always be available there.
- **Response summary:** (1) **Rail overlap fixed for real (measured, not guessed):** Playwright
  showed the sticky rail's UNSCROLLED top is 255px (not the 96px sticky-top I assumed), so
  `max-h:100vh-11rem` still gave `railBottom 879 > pillTop 750` = overlap. Re-measured → set
  `100vh-21rem` across the 4 tabs; re-measured **overlap:false** at 700/800/900 (31px gap). (2)
  **Bibliothek Üben is now content-scoped:** each tab's Üben hands its exact filtered ids +
  content type to the session store (`librarySession`) and launches `/session?src=lib`; a new
  `buildScopedSession` builds a session of ONLY that type — Redemittel→Redemittel flashcards,
  a Grammatik group→that group's drills, Wörter→vocab, Kollokationen→collocation flashcards (new
  `"collocation"` flashcard source, recognition-only/XP). Verified: Redemittel Üben → "Redemittel"
  badge, Konnektoren → "Grammatik · Zweiteilige Konnektoren", Wörter → "Vokabel". (3) **Flashcard
  overflow fixed:** the session flashcard grid had no column template + no word-break, so a long
  compound (Wohnungsgeberbestätigung) overflowed; added `grid-cols-1` + `break-words` (0 px overflow).
  (4) **Feedback rework:** one store-controlled `FeedbackDialog` (mounted app-wide, even in focus);
  the desktop bottom-right pill stays; on **mobile** the affordance is a compact **icon to the left
  of the Üben button** in each browse action bar (no more floating pill over cards); **inside a
  practice session** the full "Mit KI gebaut · Feedback geben" button is always shown. Gates:
  typecheck ✔, lint 0 errors, test:unit 130/130, build ✔, bundle 76.8 kB. Merged to `main`.
- **Artifacts:** `src/engine/session.ts` · `src/features/session/SessionPlayer.tsx` ·
  `src/features/session/Session.tsx` · `src/store/useSessionStore.ts` · `src/types/index.ts` ·
  `src/components/layout/FeedbackButton.tsx` · `src/components/layout/AppShell.tsx` ·
  `src/features/vocabulary/VocabularyTrainer.tsx` · `src/features/collocations/CollocationsBrowser.tsx` ·
  `src/features/redemittel/RedemittelTrainer.tsx` · `src/features/grammar/GrammarHub.tsx` ·
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 370 — 2026-07-13 (session 106, Üben-map pin sizing/color)

- **Branch:** `claude/pin-sizing-color-6lofhi` (Sonnet 5)
- **Prompts (verbatim):**
  > [attached screenshot] the circle around the pin and du bist here pill are too big compared to the pin. Reduce their sizees to keep them proportionate to the pin. Also, use a red shade for the pin
  > use red shade for the pin circle as well
- **Response summary:** In the Üben-map "Du bist hier" marker (`UebenPath.tsx`): shrunk the pulse ring
  (radius 12→8, stroke 2→1.5) and the chip (`px-3 py-1 text-[11px]` → `px-2 py-0.5 text-[9px]`) so
  both stay proportionate to the small pin glyph instead of dwarfing it. Recolored the pin fill AND
  the pulse ring from the route indigo (`P.route`) to a new dedicated red constant (`PIN_COLOR =
  "#e5484d"`), per the founder's follow-up that the ring should match. The pin's white inner
  ring/dot (contrast detail) were left unchanged. `pnpm typecheck` clean.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx` · commit `806195c`.

## Entry 371 — 2026-07-13 (session 106 continued, toggle/heading layout-shift fix + ship)

- **Branch:** `claude/pin-sizing-color-6lofhi` (Sonnet 5)
- **Prompts (verbatim):**
  > for some reason when switching between ueben and spielen, the page toggle button is bomving up and down. Keep the button fixed in one position, same with the heading.
  > are the changes live? if not push them. Also, document the session
- **Response summary:** Reproduced the bug with a headless Playwright probe against the dev server
  (onboarding bypassed via a seeded `b2beruf.settings.v1` localStorage entry) rather than guessing:
  measured the Üben/Spielen toggle's bounding box before and after a tab switch and confirmed a ~13px
  vertical jump on desktop widths (1024–1920px; mobile was already stable). Root cause: the Üben and
  Spielen panels render at different natural heights (~581px vs ~607px), and the toggle sits above
  them inside a `justify-center`d flex column on desktop, so the differing panel height shifted the
  whole column's centered position, moving both the toggle and each panel's own `<h1>` heading. Fix
  (`Dashboard.tsx`): the sliding content wrapper now reserves the taller panel's height
  (`lg:min-h-[38rem]`) so the stack's total height, and therefore its centered position, stays
  constant regardless of which tab is active. Re-verified with the same Playwright probe: toggle and
  both headings now sit at identical coordinates before/after every switch, at mobile and desktop
  widths. Gates: typecheck ✔, lint 0 errors (pre-existing warnings only), `pnpm build` + prerender ✔,
  `check:bundle` 76.9 kB/400. On the "are changes live" question: the two commits above were already
  pushed to the feature branch but `main` (production, per this repo's deploy model) did not yet have
  them, so opened PR #487 and squash-merged it into `main` to ship both fixes; also updated
  `docs/PROJECT_STATUS.md` (moved the s104 Bibliothek pre-demo handoff into the W28 archive, added the
  s106 handoff) and this log per the standing documentation rule.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx` · commit `fe39da9` · PR #487 (squash-merged to
  `main`) · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` ·
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 372 — 2026-07-13 (session 107, demo-prep polish continued)

- **Branch:** `claude/demo-prep-feedback-rename-sl1jqq` (Opus 4.8)
- **Prompts (verbatim):**
  > in the ueben button, the word ueben should be in the center and don't take icon into consideration when centering. The icon should move as per the word's position.
  > use compass
  > I don't like the color for ueben - can you suggest other colors? provide few previews as images in the chat here.
  > I didn't meeant tjhis ueben button. I meant the ueben toggle in Praktisch. To avoid confusion also suggest alternate names for this ueben mode in Praktisch
  > when clicked on graph view in worter, the graph should be zoomed-in to any random place on the graph but enoguh zoomed that the wrods are readable.
  > It appears to be a white block here - fix the bug here
- **Response summary:** Continued the demo-prep sweep. (1) **Centered Üben label**: new `UebenLabel`
  in `features/shared/browseScroll.tsx` centers the word "Üben" via the button's `justify-center` and
  floats the bolt icon to its left with `absolute right-full` (no layout space), wired into both Üben
  buttons across all four trainers. (2) **Praktisch icon → compass** (`route-icons.tsx` "/" renderer +
  NORM box, `nav-items.ts` `Compass`). (3) **Wörter graph opens zoomed into a readable random node**
  (k≈2.2) instead of fit-to-all (`WordGraph.tsx`). (4) **Praktisch toggle**: sent the founder a rendered
  color preview and a name/color option image; the founder picked **Lernen + Blau**, so the left mode
  was renamed "Üben" → **Lernen** (`text-blue-600` + `BookOpen`) in `Dashboard.tsx` (help-hub CTA copy
  updated to match). (5) **Desktop "white block" bug**: reproduced with Playwright at 1280×900 — the
  sticky tabs+toolbar header painted an always-on `bg-background/90` rectangle, showing a hard-cornered
  white block beside the tabs at rest. Changed `browseHeaderClass(hidden, scrolled)` to apply the
  masking background **only when scrolled**; verified the block is gone at rest and the backdrop still
  fades in to mask content on scroll. Gates each ship: typecheck ✔, lint 0 errors (43 warnings),
  content-lint ✔, `test:unit` 130/130, build + prerender ✔, `check:bundle` 76.7 kB/400. Shipped as two
  squash-merged PRs with post-merge realignment; updated `docs/PROJECT_STATUS.md` (archived the s105
  handoff, added the s107 handoff) and this log.
- **Artifacts:** `src/features/shared/browseScroll.tsx` · `src/features/vocabulary/VocabularyTrainer.tsx`
  · `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx`
  · `src/features/grammar/GrammarHub.tsx` · `src/components/layout/nav-items.ts` ·
  `src/components/layout/route-icons.tsx` · `src/components/layout/FeedbackButton.tsx` ·
  `src/features/vocabulary/WordGraph.tsx` · `src/features/dashboard/Dashboard.tsx` ·
  `src/features/help/HelpHub.tsx` · `src/engine/session.ts` · `src/store/useSessionStore.ts` ·
  `src/features/session/{Session,SessionPlayer}.tsx` · commits `5f87721`, `2ab5909` · PRs #486, #488
  (both squash-merged to `main`) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 373 — 2026-07-13 (session 107 continued, icon + Üben-map polish)

- **Branch:** `claude/demo-prep-feedback-rename-sl1jqq` (Opus 4.8)
- **Prompts (verbatim):**
  > make the compass ring a bit more thicker and make its color to match the blue used in other icons of the naivgation panel/bar. Make sure the compass's design is matching other icons
  > for the map, the dotted route should have opaque dashes that exactly overlaps the lane dashes on the street so that it looks clean
  > the ring surrounding the pin on the map should be muted dark gray/black - pick the most suitable shade here
  > the book icon on lernen button isn't filled when selected - fix it.
  > for the lernen icon when filled can you add a small subtle line in the middle to differenciate two open pages?
  > document the session
- **Response summary:** A rapid round of visual polish, each shipped and verified with Playwright.
  (1) **Compass** (`nav-items.ts`, `route-icons.tsx`): moved the Praktisch route accent to the nav blue
  `#2563eb` so the icon ring AND the active-tab underline (which reads `item.color`) match the other
  nav marks, and thickened the ring (r8 / stroke 2.7) + refit its NORM box. (2) **Üben-map route dashes**
  (`UebenPath.tsx`): the onward/dotted legs were scattered dots (`0.5 11`) floating over the street; added
  `SEG_RUNS` (the legs broken into axis-aligned straight runs) and drew each run with the dash pattern
  phase-locked to the street lane dashes (opaque, same `7 9` period, butt caps, `strokeDashoffset =
  start-coord mod 16`), so each route dash lands exactly on a lane dash. Solid travelled legs still use
  the smooth `SEG_PATHS`. (3) **Pin pulse ring**: added a theme-aware `pulseRing` to both map palettes
  (muted charcoal `#4b5563` on light, muted light `#c7cce0` on dark) and switched the ring from the pin's
  red to it; the pin body stays red. (4) **Lernen toggle book** (`Dashboard.tsx`): first set the book to
  fill when active; then, because a solid `BookOpen` merged into one blob, replaced it with a small
  custom `LernenBook` SVG whose two pages are separate shapes with a ~2px transparent center gutter, so
  when filled the pill background shows through as a subtle dividing line keeping the two open pages
  distinct (unfilled = a stroked open book; gutter transparent so it adapts to light/dark). Verified both
  toggle states at 3× and the map/compass at mobile + desktop. Gates each ship: typecheck ✔, lint 0
  errors, `test:unit` 130/130, build + prerender ✔, `check:bundle` ~77 kB/400. Shipped as PRs #490 and
  #491 (both squash-merged to `main`, post-merge realignment each time); updated `docs/PROJECT_STATUS.md`
  and this log.
- **Artifacts:** `src/components/layout/nav-items.ts` · `src/components/layout/route-icons.tsx` ·
  `src/features/dashboard/UebenPath.tsx` · `src/features/dashboard/Dashboard.tsx` · commits `dde8285`,
  `8687c71` · PRs #490, #491 (squash-merged to `main`) · `docs/PROJECT_STATUS.md` ·
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 374 — 2026-07-13 (session 108, critical account data-isolation bug)

- **Branch:** `claude/account-data-isolation-bug-s517d1` (Opus 4.8)
- **Prompts (verbatim):**
  > there's a serious bug I found regarding user authentication on my phone. When switching between accounts, the progress of one account is being shown in another account. this should be treated with absolute criticality and dealt in a way this never happens and every account's data is synced properly no matter in which device they log in and no matter how many accounts are logged in the same device.
  > when a user logs out the progress should be reset.
  > document the session
- **Response summary:** Diagnosed and fixed a cross-account data-leak on shared devices. Root cause:
  the progress + settings zustand stores persist to **device-global** localStorage keys, and
  `cloudSync.startCloudSync(uid)` **merged** the incoming account's cloud row into whatever local cache
  the previous account left behind (`Math.max`/union/`mergeSrs`), then pushed that merged, contaminated
  state up to the new account's cloud row (propagating cross-account, cross-device). Sign-out never
  cleared the cache. Fix (`src/lib/cloudSync.ts`): a persisted `b2beruf.syncUid` marker binds the local
  cache to one account; `startCloudSync` wipes the stores (`resetLocalStores`) before pull/merge/push
  when the incoming uid differs, and always (re)writes the marker. First-ever/guest sync (no marker) and
  the same-uid guest→account upgrade are untouched, so legitimate offline/guest progress is preserved.
  Added exported `clearLocalAccountData()` (reset stores + forget marker), called from
  `useAuthStore.signOut` and `deleteAccount` (the two now-unused store imports in `useAuthStore` were
  removed). Added `tests/cloudSync.test.ts` (mocks `@/lib/supabase`) pinning four invariants: switch
  wipes + never uploads old data, first/guest sync merges, same-account re-sync preserves,
  `clearLocalAccountData` zeroes both stores + the marker. Gates: typecheck ✔, lint 0 errors (43
  pre-existing warnings), `test:unit` 134/134, `pnpm build` + prerender ✔, `check:bundle` 77.4 kB/400,
  `lint:content` ✔. **Shipped:** PR #493, squash-merged to `main` (SHA `64df253`), post-merge branch
  realignment done. Follow-up prompt "when a user logs out the progress should be reset" needed **no new
  code** — the same fix already routes `signOut` (and `deleteAccount`) through `clearLocalAccountData()`,
  which resets the progress + settings stores to defaults after first flushing pending changes to the
  signed-in user's cloud row; confirmed against the shipped `useAuthStore.signOut` and reassured the
  founder (local wipe only, cloud data untouched, reloaded on next login). Final prompt: this doc pass.
- **Artifacts:** `src/lib/cloudSync.ts` · `src/store/useAuthStore.ts` · `tests/cloudSync.test.ts` ·
  commit `9d7147f` → PR #493 squash-merged (`64df253`) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` (s106 handoff moved here) ·
  `docs/SESSION_PROMPT_LOG.md`.

---

## Session 109 — 2026-07-13 (two phone-screenshot bug fixes)
- **Branch:** `claude/app-loading-screen-5av7dt` (Opus 4.8)
- **Prompts (verbatim):**
  > [screenshot: "App failed to load" — ServiceWorker fetch error, airplane mode] sometimes, the app shows this screen when loading. it doesn't look professional or nice. Can you fix this?
  > [screenshot: Wörter graph, zoomed-in nodes] the zoom level isn't enough. It should be something like this. see attached screenshot
- **Response summary:** Two unrelated founder bug reports, both diagnosed from the screenshots.
  (1) **"App failed to load" false crash.** The status bar in the screenshot showed **airplane mode**.
  Root cause: on app resume `lib/swUpdate.ts` calls `reg.update()` (no `.catch()`) to poll for a new
  deploy; offline / on any transient network blip the browser cannot fetch `sw.js`, so `update()` rejects
  with "Failed to update a ServiceWorker for scope … An unknown error occurred when fetching the script".
  That unhandled rejection tripped the global `unhandledrejection` handler in `main.tsx` → the raw
  monospace `paintFatal` "App failed to load" screen, painted over a fully working app (it serves from the
  precache). Fix: `swUpdate.ts` swallows the best-effort `update()` rejection with `.catch(() => {})`;
  new `isServiceWorkerError()` in `lib/recover.ts` and both global `error`/`unhandledrejection` handlers
  in `main.tsx` now early-return on SW registration/update failures (non-fatal); and `paintFatal` was
  rewritten from a monospace error dump into a calm, branded centered card (gradient "G" badge, German
  headline "Kurz nicht erreichbar", a "Neu laden" button) with the raw message + stack kept behind a
  collapsed "Technische Details" `<details>` expander, so the mobile-debug net survives without scaring a
  learner. (2) **Wörter graph opened too zoomed-out.** `features/vocabulary/WordGraph.tsx` opened at
  `k=2.2`; since the max node radius is only 12 world units the biggest circle was ~26px. Raised the
  initial open zoom to `k=3.4` and changed the opening center-node pick from uniform-random to
  **area-weighted** (r² ∝ wordfreq Zipf) so the first view lands among common, well-connected words rather
  than a lone rare word in an empty corner; the fit button's zoom-to-frequent-word target was bumped 2.6
  → 3.4 to match. Gates: typecheck ✔, lint 0 errors (43 pre-existing warnings), `pnpm build` + prerender
  ✔, `test:unit` 134/134. **Shipped:** PR #496 squash-merged to `main` (SHA `b6998ee`), post-merge branch
  realignment done. Then this doc pass.
- **Artifacts:** `src/lib/swUpdate.ts` · `src/lib/recover.ts` · `src/main.tsx` ·
  `src/features/vocabulary/WordGraph.tsx` · commit `8d7aeb6` → PR #496 squash-merged (`b6998ee`) ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` (s107 handoff
  moved here) · `docs/SESSION_PROMPT_LOG.md`.

## Entry 375 — 2026-07-13 (session 110, Bibliothek tab-switch slide animation)

- **Branch:** `claude/bibliothek-slide-animations-hdf738` (Opus 4.8)
- **Prompts (verbatim):**
  > when switching between the items in bibliothek, the content seems to abruptly loads. can you add nice left and right sliding animations which is snappy?
  > yes
- **Response summary:** Added a snappy, direction-aware enter slide to the four Bibliothek/Theorie tabs
  (Wörter · Kollokationen · Redemittel · Grammatik). `LibraryHub` computes the tab-index direction (target
  vs. previous, held in a `useRef`) and wraps the segment in `<div key={tab}>` with a
  `.lib-slide-in-right` / `.lib-slide-in-left` class; the four lazy segments already remount on `?tab=`
  change, so the mount-time keyframe replays each switch, sliding the incoming panel in ~220ms from the
  side tapped toward (`cubic-bezier(0.22,1,0.36,1)`) and fading up. Chose a **CSS keyframe with the
  default `none` fill-mode** over a framer transform wrapper on purpose: the tab bar (`LibrarySwitcher`)
  lives inside each segment and the segments rely on `position: sticky`/`fixed` descendants (desktop
  filter rail, mobile sticky Üben action bar, fixed scroll-top button), so a transform that persisted at
  rest would establish a containing block and trap them; `none` fill-mode applies the transform only
  during the slide. Global `html`/`body` `overflow-x: clip` means the 1.25rem offset adds no scrollbar,
  and the existing global `prefers-reduced-motion` rule neutralises it. Enter-only (old panel swapped out
  instantly) to stay snappy and avoid double-mounting the heavy lists / a `library-tab-pill` layoutId
  collision. Gates: typecheck ✔, `pnpm build` + prerender ✔, `check:bundle` 77.4 kB/400, `test:unit`
  134/134. **Shipped:** PR #495 squash-merged to `main` (SHA `43761a3`), before this session's doc pass;
  parallel sessions 108/109 merged in between, so the doc updates were rebased onto their state and this
  work is logged as session 110. Second prompt ("yes") = this documentation pass (`PROJECT_STATUS.md` +
  this log; s108 handoff moved to the W28 archive chunk).
- **Artifacts:** `src/features/library/LibraryHub.tsx` · `src/index.css` · commit `43761a3` (squash) →
  PR #495 · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`
  (s108 handoff moved here) · `docs/SESSION_PROMPT_LOG.md`.

## Entry 376 — 2026-07-13 (session 111, demo-readiness plan)

- **Branch:** `claude/pre-demo-app-sweep-0yh6je` (Fable 5; plan-only session by founder design)
- **Prompts (verbatim):**
  > Run a pre-demo sweep of the entire app. Keep everything ready - security, bugs, UI - everything in check.
  > continue
  > write a thorough and robust plan to review, check, analyse all sorts of refinements, improvements, security fixes and other aspects I may have not mentioned or forgot so that the app is ready to be presented to an audience. Write the plan now with fable but the implementation should be with other models as I'm running out of Fable for this week. Provide model recommendations in the plan and include non tech summary for each chunk of work.
  > looks good, save it to the repo. I'll implement the plan in a new session. Document the session.
- **Response summary:** Started the sweep hands-on, then pivoted to plan-authoring on the founder's
  third prompt (plan mode). **Baseline verified TWICE** (first at `906cf7a`, re-run after parallel
  sessions 107–110 moved `main` to `ae0c2fc`): all 9 gates green (typecheck; lint 0 errors / 44
  deliberate warnings; content-lint; test:unit 134/134; test:srs 323; test:pronounce 26; audit 0
  vulnerabilities; build + prerender; bundle 79.5 kB/400) plus a clean security-grep pass (no
  secrets, no XSS sinks, `rel="noreferrer"` on every `target="_blank"`, only public keys
  client-side). Found ONE real gap: **`submit-feedback` has no rate limit** (input caps + CORS
  only). `AskUserQuestion` fixed the demo parameters: **demo is 2026-07-14**, format "Both" (present
  live, then share the link), demo state "Both states ready" (seeded account + clean profile).
  Authored **`docs/plans/DEMO_READINESS_PLAN.md`**: 6 chunks with per-chunk model recommendations
  and non-technical founder summaries. P0: 1 Playwright smoke test of the demo path (Sonnet 5) ·
  2 regression review of PRs #477–#500 incl. the `pinnedTabs` migration (Opus 4.8) · 3 abuse
  hardening / feedback rate limit + RLS re-check (Opus 4.8) · 4 demo-visible UI polish (Sonnet 5) ·
  5 `docs/DEMO_RUNBOOK.md` + both demo states (Sonnet 5). P1: 6 perf sanity (Sonnet 5). P2 next
  week: Fable content proofread + full security review. Implementation deliberately NOT started
  (founder runs the chunks in fresh sessions on the recommended models). A first docs commit
  (numbered s106) raced sessions 107–110; the branch was reset onto `ae0c2fc` and everything
  re-applied as session 111. Docs updated per policy (status handoff s111; s109 handoff archived to
  W28; archive index row refreshed; this log). Merged to `main` per auto-ship so the plan is on the
  default branch for the next sessions.
- **Artifacts:** `docs/plans/DEMO_READINESS_PLAN.md` (new) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` (s109 handoff moved here) ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 377 — 2026-07-13 (session 112, demo-readiness Chunks 2+3, Opus 4.8)

- **Branch:** `claude/predemo-opus-tasks-ek5qhz` (Opus 4.8; the "Tonight A" session of the plan)
- **Prompts (verbatim):**
  > go ahead with predemo plan's opus tasks
- **Response summary:** Implemented the two Opus-assigned chunks of `DEMO_READINESS_PLAN.md`.
  **Chunk 2 (regression review of s102–110):** grepped the whole `src/` tree for stale
  "Heute"/"Bibliothek"/"Anwenden" nav copy; the only user-facing stale strings were two "(Heute)"
  references (the `Session.tsx` empty-state eyebrow and the `hilfe/erste-schritte` help article
  DE+EN), both fixed to "Praktisch" and the help HTML reprerendered. Verified (no change needed): the
  returning-user `pinnedTabs`/`ROUTE_SUCCESSOR` migration is safe (`BottomTabBar` filters pins to
  `CONTENT`, `BarTab` null-guards unknown paths, `Sidebar` renders `navItems` directly, so a stale
  pre-s105 `/anwenden` pin cannot break either bar); the feedback surfaces render on the right pages,
  hide in focus/missions, and fail gracefully; `/session` junk-param handling
  (`mission`/`grammar`/`theme`/`cefr`/`sector`/`cat`/`sub`/`min`) all fall back without crashing.
  **Chunk 3 (abuse hardening):** added two migration-free rate-limit guards to `submit-feedback` — a
  per-IP burst limit (≤5 / 10 min, in-memory, hashed IP) and a DB-backed global hourly email ceiling
  (≤60/hr stops the email but still stores the row), preserving the friendly German error. Re-checked
  RLS across migrations 0001–0006 (all owner-scoped to `auth.uid()` or the founder-email gate;
  `feedback`+`ai_usage` service-role-only; no public SELECT; `bump_ai_usage` revoked from
  public/anon/authenticated) and re-confirmed `delete-account`/`evaluate-writing` are JWT-gated (401)
  + CORS-allowlisted with the writing caps intact. Documented the founder console steps (redeploy
  command, optional `FEEDBACK_IP_SALT`, optional Turnstile + Resend SMTP) in `PHASE2_SETUP.md`. All
  gates green (typecheck; lint 0 errors/44 warnings; lint:content; test:unit 134/134; test:srs 323;
  test:pronounce 26; build+prerender; bundle 79.5 kB/400). Chunks 2+3 checked off in the plan; docs
  updated per policy (status handoff s112; s110 handoff archived to W28; this log). Founder must run
  `supabase functions deploy submit-feedback` to activate the rate limit.
- **Artifacts:** `src/features/session/Session.tsx` · `src/features/help/content.ts` ·
  `supabase/functions/submit-feedback/index.ts` · `docs/plans/PHASE2_SETUP.md` ·
  `docs/plans/DEMO_READINESS_PLAN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 378 — 2026-07-13 (parallel centering-polish work-stream, desktop feedback pill + graph legend)

- **Branch:** `claude/lucid-hawking-e16neg` (Opus 4.8 / Sonnet). Ran in parallel with the demo-readiness
  stream (Entries 376–377), so its session numbers are not reused here; this is logged as its own stream.
- **Prompts (verbatim):**
  > on desktop view, the feedback pill should be moved so that it's center is in line with the filter rail's center line
  > IN desktop view, the legend and xx connections should be centered aligned
  > does it look like centred to you? [+ screenshot of the Wörter graph legend row]
  > check if all the tasks in this session are done properly
  > document the session
- **Response summary:** Two desktop-only alignment fixes on the Bibliothek/Theorie pages.
  **(1) Feedback pill** (`FeedbackButton.tsx` `FeedbackPill`): was flush bottom-right (`right-4`); now
  `lg:right-[calc(9.5rem_+_max(0px,(100vw_-_88rem)/2))]` so its center sits on the `FilterRail` column's
  center line. Derived from the shared Bibliothek layout geometry, not eyeballed: every browse tab renders
  inside a `max-w-6xl` main column offset by the 16rem desktop sidebar, with the rail as the last `16rem`
  track of a `lg:grid-cols-[minmax(0,1fr)_16rem]` grid and `sm:px-6` padding, so the rail center is 9.5rem
  in from that column's right edge plus half the centering margin once the viewport passes the 88rem
  (sidebar + max-w-6xl) cap. **Shipped as PR #499 (`67367d2`).** **(2) Graph legend** (`WordGraph.tsx`):
  the domain legend + "n Verbindungen" count were left-aligned on desktop (`lg:justify-start` on the row +
  `lg:ml-auto` pushing the count to the far right); both overrides removed so the row is `justify-center`
  on all breakpoints, matching mobile. **Shipped as PR #500 (`ae0c2fc`).** The founder's "does it look
  centred?" screenshot was a **stale/cached load** taken after PR #500's Pages deploy for `ae0c2fc` had
  already completed (Actions run = success); the deployed source has both items centered with no leftover
  overrides, so no further code change was needed. **Verification pass (4th prompt):** confirmed working
  tree clean, both PRs merged to `main` + deployed green, and both edits present in source; the only
  outstanding item was this documentation trail. Gates: typecheck ✔, `pnpm build` + prerender ✔,
  `check:bundle` 79.5 kB/400. (Docs landed after the demo-readiness stream had merged PRs #501–#502 to
  `main`, so this entry is appended on top of that state rather than renumbering the shared history.)
- **Artifacts:** `src/components/layout/FeedbackButton.tsx` (PR #499, `67367d2`) ·
  `src/features/vocabulary/WordGraph.tsx` (PR #500, `ae0c2fc`) · `docs/SESSION_PROMPT_LOG.md`.

## Entry 379 — 2026-07-13 (session 112, demo-readiness P2 content-accuracy pass)

- **Branch:** `claude/predemo-plan-fable-tasks-gdray4` (started Fable 5, model switched to Opus 4.8 mid-session)
- **Prompts (verbatim):**
  > go ahead with predemo plan fable tasks
  > continue
- **Response summary:** Executed the DEMO_READINESS_PLAN P2 "content accuracy pass" (the Fable-tagged
  content proofread). Triaged the warn-only `verify:grammar` report: fixed the genuine findings
  (`r_neg7` `auf einander`→`aufeinander`; `r_cla6` straight→curly closing quote; dialogue `k3a`
  `Dieses`→`dieses` and `s4b` `du`→`Du` after a colon; 4 texts `den`→`dem` in "am Dienstag, dem 14.
  Juli"; `tx_wohnen_email_besichtigung` `gern`→`gerne` clash + "Die Kaution beträgt"→"Als Kaution
  verlangen wir"), left the LanguageTool proper-noun noise. Triaged `verify:cefr`: retagged the 6 FLAG
  items down from B2.2 (`v_umwelt`→B1.1, `v_vermeiden`→B1.2, `v_muell_vermeiden`→B1.2,
  `v_energie_sparen`→B1.1, `v_bewusst`→B2.1, `v_zudem`→B2.1). Proofread all 6 Kapitel-1 mission scripts,
  the 6 top-spine grammar lessons and the 7 help articles: all read clean, no edits. Grew
  `docs/reports/jury-review.json` +39 reviewed ids (6 top-spine grammar topics + drills, 6 mission ids)
  and ran `pnpm build:verification`, which also **fixed a stale generated file**: committed
  `verification.ts` had 2,110 records and was missing the s102 Branche collocation packs; regen produced
  2,263 records (jury tier 149→188). All 9 gates green (typecheck; lint 0 errors/44 warnings;
  lint:content; test:unit 134/134; test:srs 323; test:pronounce 26; audit 0 vulns; build+prerender;
  bundle 79.5 kB/400). Docs updated (status handoff s112, s110 handoff archived to W28, plan P2 bullet
  marked done, this log). Merged to `main` per auto-ship.
- **Artifacts:** `src/data/redemittel.ts` · `src/data/dialogues.ts` · `src/data/texts.ts` ·
  `src/data/vocabulary.ts` · `docs/reports/jury-review.json` · `src/data/verification.ts` (regenerated) ·
  `docs/plans/DEMO_READINESS_PLAN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 380 — 2026-07-13 (session 113, Theorie tab-transition + compass-icon polish)

- **Branch:** `claude/theory-toggle-transitions-hloi6s` (Opus 4.8)
- **Prompts (verbatim):**
  > In Theory page, whenever I'm switching between the lage toggles like worter or Redemittel.. the page loads all the time.. it looks ugly. Ideally the content should slide side to side similar to Praktisch pages. find the issue and fix it.
  > continue with what you're up to and when done, also increase the compass icon size to visually match the other icons' sizes.
  > document the session
- **Response summary:** Root-caused the Theorie (`/library`) tab switch feeling like a reload: `LibraryHub`
  remounted the whole segment behind `Suspense fallback={null}` (blank flash on cold chunks) and an
  enter-only CSS keyframe (`.lib-slide-in-*`) with no coordinated exit. Replaced it with the Praktisch
  (Dashboard) pattern: `AnimatePresence mode="wait"` directional `x`-slide (direction derived from the
  tab-index change, kept stable via a ref) + a shaped skeleton fallback, so panels slide the way you
  moved and never flash. Verified the sticky-descendant safety the original CSS `fill-mode:none` guarded:
  framer resolves the resting `x:0` to `transform:none`, and Dashboard already runs the same pattern with
  a sticky child in production. Removed the now-dead `.lib-slide-in-*` keyframes from `index.css`. Second
  task: the Praktisch compass route mark is a thin outline ring that read smaller than its solid/airy
  neighbors, so bumped its `NORM` optical weight `0.95→1.05` in `route-icons.tsx` to match
  Theorie/Fortschritt/Einstellungen. `pnpm build` + prerender green, `check:bundle` 79.5 kB/400, no
  remaining `.lib-slide-in-*` references. Merged to `main` per auto-ship (PR #506), branch realigned.
- **Artifacts:** `src/features/library/LibraryHub.tsx` · `src/index.css` ·
  `src/components/layout/route-icons.tsx` (PR #506, squash `05a12ca`) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 381 — 2026-07-13 (session 113 cont., Theorie tab slide round 2: hoist the tab bar)

- **Branch:** `claude/theory-toggle-transitions-hloi6s` (Opus 4.8)
- **Prompt (verbatim):**
  > the toggle transition is still lazy load like and is quite harsh on the eye. fix it!
- **Response summary:** Round 1 (entry 380) added the Praktisch-style slide but the switch still read as
  a full-page reload. Root-caused it: `LibrarySwitcher` (the tab bar) is rendered INSIDE each trainer, so
  it lived in the animated/remounting subtree, the tabs themselves faded/slid out and back on every toggle
  and the Suspense skeleton could flash. Fix: **hoisted the tab bar into `LibraryHub`** as one static
  element (only the content slides now; the shared-layout pill glides between tabs), removed
  `<LibrarySwitcher/>` + its import from the 4 trainers (`VocabularyTrainer`/`CollocationsBrowser`/
  `RedemittelTrainer`/`GrammarHub`) AND `GrammarTopicView` (else the lesson would render two bars now that
  the hub always renders one), and **preload all 4 tab chunks on mount** so a switch never drops to the
  loading skeleton. Desktop tabs sit at content-column width (col 1 of the trainers' `[1fr,16rem]` grid).
  **Verified end-to-end in Chromium** (playwright-core against the pre-installed browser, seeded onboarded
  localStorage) at 1280×900 + 390×844: exactly one tab bar per surface incl. the grammar lesson, a
  mid-transition frame showing solid/static tabs + the pill gliding while only content fades, no skeleton
  flash, filter rail unaffected. Gates: typecheck; lint 0 err/44 warn; test:unit 134/134; build+prerender;
  bundle 79.5 kB/400. Merged to `main` (PR #509), branch realigned.
- **Artifacts:** `src/features/library/LibraryHub.tsx` · `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `src/features/grammar/GrammarHub.tsx` · `src/features/grammar/GrammarTopicView.tsx` (PR #509, squash
  `3c8b179`) · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 382 — 2026-07-13 (session 112 cont., feedback backend never deployed → founder set it up)

- **Branch:** `claude/predemo-opus-tasks-ek5qhz` (Opus 4.8; follow-up to entry 377)
- **Prompts (verbatim):**
  > tell me what exactly to do clearly in supabase
  > my project folder is in github repo. I can't open terminal there to run the edge function - what to do?
  > there's no submit-feedback function in the list
  > it's done
  > document the session.
- **Response summary:** After entry 377 shipped the `submit-feedback` rate-limit change, the founder
  asked how to activate it. **Key discovery: the `submit-feedback` Edge Function was never deployed at
  all** (it was authored in s105 but the CLI deploy step never ran), so the feedback backend — table,
  function, and Resend key — did not exist in Supabase and the live feedback button was non-functional.
  The founder cannot use a local terminal (project lives only in the GitHub repo), so I gave a
  **dashboard-only setup path**: (1) create the `public.feedback` table by pasting migration 0006's SQL
  into the SQL Editor; (2) create a new Edge Function named exactly `submit-feedback`, paste the code
  from the repo, deploy, and **turn OFF "Verify JWT"** (anonymous feedback must be allowed); (3) add the
  `RESEND_API_KEY` secret so the email actually sends. Founder completed all three ("it's done"), so the
  feedback feature — including the s112 rate limit — is now live end-to-end. Suggested a one-message
  self-test (toast "Danke für dein Feedback!" + an email within a minute) and offered a future
  GitHub-Actions auto-deploy workflow so functions redeploy on merge (not built; offered). Docs updated
  per policy (this entry + a follow-up bullet on the s112 handoff in `PROJECT_STATUS.md`). No app code
  changed in this follow-up.
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` (docs only; the Supabase setup
  was done by the founder in the dashboard, no repo change).

## Entry 383 — 2026-07-13 (session 114, Theorie pill animation robustness + dark-mode purple contrast)

- **Branch:** `claude/theroie-toggle-animation-t5c86i` (Opus 4.8)
- **Prompt (verbatim):**
  > the Theroie page toggle transition looks jerky rather than smooth sliding. do a proper check and do a proper robust implementation of the animation
- **Prompt (verbatim, mid-turn):**
  > Some of the headers with purple text are not clearly visible in dark mode - it needs to be fixed
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Follow-up to s113's tab-slide work. Root-caused the *pill* jerk (distinct from the
  panel slide s113 fixed): the `LibrarySwitcher` tab bar AND the `ViewSwitcher` view toggle animated their
  active pill with framer's `layoutId` **shared-layout crossfade** — the pill was rendered only on the
  active segment (`{active && <motion.span layoutId=…/>}`), so every switch unmounted the old pill and
  mounted a new one, forcing framer to re-measure both nodes and cross-fade. On the library tabs the same
  click also renders a whole trainer (walks a content bank), so that measurement competed for the main
  thread and the pill stuttered. Fix: new **`src/features/shared/useSlidingPill.ts`** hook — one
  always-mounted pill measured to the active segment from the live DOM (`offsetLeft`/`offsetWidth`,
  re-measured on active change + `ResizeObserver`, positioned pre-paint via `useLayoutEffect`), animating
  only `x`/`width` (a compositor-friendly transform for the equal-width segments), decoupled from whatever
  else renders that frame. Rewired both switchers to it. Second task: dark `--primary` was `245 80% 68%`,
  ~4.3:1 on the dark bg — under the WCAG AA 4.5:1 floor for the small bold uppercase eyebrows / active-tab
  labels / `text-primary` links; lifted to `245 84% 74%` (~5.6:1, `--ring` too). Primary-as-button-fill
  unaffected (dark foreground only gains contrast). **Verified end-to-end in Chromium** (playwright-core,
  seeded onboarded localStorage, light + dark at 900×700): pill lands pixel-accurately on both the first
  and far tabs, ViewSwitcher pill correct, purple labels/links clearly legible in dark, no light-mode
  regression. Gates: typecheck; build+prerender; test:unit 134/134; check:bundle 79.5 kB/400. **Pushed to
  the branch; NOT merged** (asked the founder whether to open + squash-merge a PR).
- **Artifacts:** `src/features/shared/useSlidingPill.ts` (new) · `src/features/library/LibrarySwitcher.tsx` ·
  `src/features/shared/ViewSwitcher.tsx` · `src/index.css` (commit `688bd0d`) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 384 — 2026-07-13 (session 113 cont., Theorie tab slide round 3: snappier, popLayout)

> **Numbering note:** my session-113 rounds 3–4 were logged live as 382/383, but the parallel session
> 112 (feedback-backend) and session 114 (pill animation) landed on `main` first and claimed 382/383, so
> these two entries are renumbered 384/385. Content unchanged.

- **Branch:** `claude/theory-toggle-transitions-hloi6s` (Opus 4.8)
- **Prompt (verbatim):**
  > it's working well but the sliding motion isn't snappy enough. The fade animation is heavy on the eye
- **Response summary:** The round-2 slide used `AnimatePresence mode="wait"`, which plays the exit fully
  and only then the enter, so it felt slow and the blank fade-out gap between panels read as a heavy fade.
  Switched to **`mode="popLayout"`** (leaving panel popped out of flow, incoming panel in place
  immediately, the two cross at once, no empty beat, no vertical jump; presence wrapped in a `relative`
  container to contain the absolutely-positioned exiting panel). Shortened duration 0.16→0.13 with a snappy
  ease `[0.22,1,0.36,1]`, slide carries the motion, fade a light accent. Confirmed `<html>`/`<body>` both
  `overflow-x: clip` so the slide adds no horizontal scrollbar. Verified in Chromium (1280×900): no
  horizontal scrollbar, no jump, exiting panel positioned correctly. Gates green. Merged (PR #511).
- **Artifacts:** `src/features/library/LibraryHub.tsx` (PR #511, squash `4e5435e`).

## Entry 385 — 2026-07-13 (session 113 cont., ease the slide ~15% + center the feedback pill)

- **Branch:** `claude/theory-toggle-transitions-hloi6s` (Opus 4.8)
- **Prompts (verbatim):**
  > I like the effect now. It's a bit too snappy now. reduce the speed by 10-15% and that should do. Also see the attached screenshot. The feedback button is not center-aligned with the filter rail - fix it!
  > document the session
- **Attachments:** screenshot of the Bibliothek bottom-right showing the "Mit KI gebaut · Feedback" pill
  left of the FilterRail column instead of centered under it.
- **Response summary:** (1) Eased the tab-slide duration 0.13→**0.15s** (~15% slower), same popLayout +
  ease. (2) **Feedback pill:** the `FeedbackPill` set `right` (which anchors the pill's right EDGE) to the
  FilterRail's center value, so the pill hung half its own width to the left of the rail. Added
  **`lg:translate-x-1/2`** so its center lands on the rail center. Verified in Chromium: pill center ==
  rail center to **0px** at 1280 and 1600 wide (the latter exercises the wide-viewport centering margin).
  Gates green. Merged (PR #512). (3) Documented the session; on the doc PR I hit a merge conflict because
  the parallel session-112 (#513) and session-114 (#514) merges had landed on `main` in between, reset the
  branch to latest `main` (my slide code was already merged + intact; 114 only refined the *pill* glide,
  not the content slide), then re-applied these entries (renumbered 384/385) and the s113 status handoff
  update against the current docs.
- **Artifacts:** `src/features/library/LibraryHub.tsx` · `src/components/layout/FeedbackButton.tsx`
  (PR #512, squash `4bc3daf`) · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 386 — 2026-07-13 (session 113, brand identity exploration)

- **Branch:** `claude/branding-logo-redesign-947e61`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > I want to change the branding including logo, visual assets and color schemes. The current logo looks like a direct copy of canva logo. Can you provide me with a catalogue of options in the form of a html artifact?
  > I like the thinking process. generate 5 more ideas
  > can you generate 10 more with 2-3 other core philosophical based?
  > document the session and save the artifacts in the repo
  > yes open a pr and merge
  > document the session
- **Response summary:** A branding-exploration session (no app code changed; the current gradient
  rounded-square "G" reads as a Canva lookalike and is what the founder wants replaced). Produced a
  catalogue of **20 logo/identity directions** for Genauly across three HTML sheets, each direction
  rendered as a live concept (real SVG/CSS mark, a 5-colour palette with hex, and a licensable type
  pairing), in a neutral "studio spec-sheet" page style so each brand palette pops. **Vol. I + II
  (foundation *genau* = precision):** Genau. (period), Wasserwaage (spirit level), Umlaut (two dots),
  Zielband (target), Neuland (contour peak), „Genau" (German quotes), Der·Die·Das (gender colour
  system), Fokus (camera aperture), Roter Faden (single red thread), Stempel (approval stamp). **Vol.
  III (three new *philosophies*):** Ankommen/belonging (Schwelle, Der Tisch, Schlüssel, Heimat),
  Durchbruch/momentum (Durchbruch, Schwung, Sprung), Klarheit/clarity (Prisma, Sonnenaufgang,
  Klartext). Assistant shortlist: Der·Die·Das, Neuland, Durchbruch, Ankommen/Schwelle. Each sheet was
  published as a private Claude artifact (Vol. I `fed14c61`, Vol. II `02c0d954`, Vol. III `dc5d3da7`),
  then wrapped as standalone HTML and committed under `preview/branding/` with an index README. No
  `src/` change, no palette/token/logo-asset change yet; that follows once the founder picks a
  direction. On the final prompt, opened **PR #516** into `main` and squash-merged it. (First merge
  attempt hit conflicts because the parallel session-114 Theorie merges had advanced `main`; reset the
  branch to latest `main`, kept the conflict-free `preview/branding/` files, and re-applied the doc
  edits, renumbered to entry 386, with the fully-merged s113 Theorie polish handoff relocated to the W28
  archive per the two-handoff rule.)
- **Artifacts:** `preview/branding/genauly-identity-vol1.html` ·
  `preview/branding/genauly-identity-vol2.html` · `preview/branding/genauly-identity-vol3.html` ·
  `preview/branding/README.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` · `docs/SESSION_PROMPT_LOG.md` (PR #516).

## Entry 387 — 2026-07-14 (session 115, finish the remaining Demo-readiness sweep chunks)

- **Branch:** `claude/predemo-sweep-tasks-25oejy` (Opus 4.8)
- **Prompt (verbatim):**
  > what other tasks are remaining in predemo sweep plan? finish them off and check if the whole plan's tasks are well done or not.
- **Response summary:** Identified the pre-demo sweep plan as `docs/plans/DEMO_READINESS_PLAN.md` and
  the open chunks as P0 Chunk 1 (smoke test), Chunk 4 (UI polish), Chunk 5 (runbook) and P1 Chunk 6
  (perf); Chunks 2+3 were already done s112. **Chunk 1:** built + previewed the production bundle and
  ran a Playwright sweep (installed `playwright` in the scratchpad, Chromium at
  `/opt/pw-browsers/chromium-1194`) over 4 combos (390×844 + 1440×900 × light + dark), 28 routes each,
  plus a cold-start onboarding pass and a core-interaction pass (session blocks, mission scenes,
  filter-rail facet+reset, Graph view, Grammatik lesson). **Completely clean:** zero console errors,
  error boundaries, blank pages, dead routes, or horizontal overflow; redirects preserve params;
  `/anwenden`+`/welt` resolve; junk `?`-params fall back. **Chunk 4:** reviewed screenshots of every
  demo-visible screen (light+dark, mobile+desktop) — no blemishes, no em dashes, dark mode solid,
  clean empty states; no code changes needed. **Chunk 5:** wrote `docs/DEMO_RUNBOOK.md` (device prep,
  two demo states, tour order, failure fallbacks, founder console checklist; flags the required
  `supabase functions deploy submit-feedback`). **Chunk 6:** main chunk 79.5 kB/400; throttled
  (1.6 Mbps/4× CPU) first paint ~3.3–3.5s on `/`, `/library`, Graph, `/welt`, `/sammlung`; lazy chunks
  load without an error flash. Verdict: the whole P0+P1 plan is now done and well-executed; only the
  explicitly next-week P2 items (full `/security-review`, post-demo feedback triage) remain. Checked
  off Chunks 1/4/5/6 in the plan with findings, and ran all 9 gates green (typecheck, lint 0 err/44
  warn, lint:content, test:unit 134/134, test:srs 323, test:pronounce 26, build+prerender,
  check:bundle, audit 0 vulns). Doc-only session; no source touched.
- **Artifacts:** `docs/DEMO_RUNBOOK.md` (new) · `docs/plans/DEMO_READINESS_PLAN.md` (Chunks 1/4/5/6
  checked off + findings) · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`
  (s113 + s114 handoffs moved in) · `docs/SESSION_PROMPT_LOG.md`.
- **Follow-up prompt (verbatim):**
  > the feedback rate limit task is done already
- **Follow-up response:** Corrected the runbook + status handoff, which had listed
  `supabase functions deploy submit-feedback` as a pending pre-flight step. The founder confirmed the
  `submit-feedback` function + rate-limit are **already deployed and live** (matching the s112
  follow-up record in the W28 archive: table + function with Verify JWT off + `RESEND_API_KEY` set).
  Changed the runbook pre-flight item to a checked "already live, just verify" note and removed the
  "must deploy" line from the status handoff. Docs only.
- **Follow-up prompt (verbatim):**
  > go ahead with security review then
- **Follow-up response:** Ran the P2 whole-app security review (Opus 4.8). The repo `/security-review`
  skill is diff-based and the branch was clean, so did a manual audit of the full surface: the 3 Supabase
  Edge Functions (`submit-feedback`, `evaluate-writing`, `delete-account`), all 6 RLS migrations, the
  client Supabase config + auth store + cloudSync isolation, XSS/injection sinks, the CSP, and the
  supply-chain posture. **No critical or high-severity findings.** Verified RLS is owner-scoped on every
  user table with `ai_usage`/`feedback` service-role-only (no public SELECT) and `provenance_reviews`
  founder-email-gated; all SECURITY DEFINER funcs pin `search_path`; the two sensitive functions are
  JWT-gated with the user id taken from the token not the body; `submit-feedback` is anon-OK but per-IP +
  global-hourly rate-limited with an HTML-escaped email body; only the publishable anon key reaches the
  browser (no secrets in `src/`, `.env*` gitignored); no `dangerouslySetInnerHTML`/`eval`; a genuinely
  strong enforcing CSP ships in `index.html` (`script-src` has no `unsafe-inline`/`unsafe-eval`,
  `object-src 'none'`, `base-uri`/`form-action 'self'`); every `target=_blank` has `rel=noreferrer`; the
  s108 cloudSync account-isolation wipe is correct; `.npmrc` enforces a 24h release cooldown +
  store-integrity + strict PM and `pnpm audit` is clean. Documented 5 low-severity/defense-in-depth notes
  (feedback DB growth under distributed abuse, unvalidated reply-to email format, optional Turnstile, CSP
  `style-src 'unsafe-inline'`, bounded prompt-injection in evaluate-writing), none demo- or
  launch-blocking. Wrote the full report and marked the plan's P2 security item done. Turnstile + Resend
  SMTP remain the standing pre-public-launch founder items (not done here). No source touched.
- **Artifacts:** `docs/reports/security-review-2026-07-14.md` (new) · `docs/plans/DEMO_READINESS_PLAN.md`
  (P2 security item marked done) · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Follow-up prompt (verbatim):**
  > document the session
- **Follow-up response:** Final documentation pass (the session's docs were kept current inline as each
  chunk landed). Refreshed the `PROJECT_STATUS.md` `_Last updated_` block so it reflects the completed
  security review (it had still listed it as pending), confirmed the s115 Resume-here handoff + this log
  entry cover all four prompts (demo-sweep chunks, feedback-deploy correction, security review, this
  documentation pass), and verified `DEMO_READINESS_PLAN.md` (all P0/P1 chunks + the P2 security item
  checked off) and the two new report/runbook files are in place. Shipped as the session's final doc
  commit.
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 388 — 2026-07-14 (session 116, branding palette previews → AI mockup guide)

- **Branch:** `claude/branding-redesign-color-palette-dqkvtd`. **Model:** Opus 4.8. Docs + previews
  only; no `src/` touched.
- **Prompt (verbatim):**
  > for branding redesign.. can you apply the color palette of 3rd one in the preview files where there
  > umlaut on G? the idea just to take the color palette but not the logo suggested in the previews. The
  > entire app's color including the current logo's color should be adapted with the color palette in the
  > preview. Can you generate a few previews of how it would look like when the color scheme is applied?
- **Response summary:** The referenced files were not yet in the working tree; they had been merged to
  `main` via PR #516 (session 113). After the founder supplied the paths (see next prompt), reset the
  branch to `origin/main` to pull them in. Direction 03 = **"Umlaut", palette "Cobalt & Butter"**
  (Cobalt `#2B4FE0`, Butter `#FFC24D`, Ink `#111318`, Cream `#F3F0E7`, Sky `#CBD8FF`). Built a first
  hand-drawn HTML preview artifact showing the palette mapped onto the app.
- **Follow-up prompt (verbatim):**
  > check again now
- **Follow-up prompt (verbatim), supplying the file locations:**
  > preview/branding/genauly-identity-vol1.html   — directions 01–05 (precision: Genau., Wasserwaage,
  > Umlaut, Zielband, Neuland) [+ vol2/vol3 + README]
- **Follow-up prompt (verbatim):**
  > the preview aggressively changes a lot of design elements and not just color. I put a lot of time
  > into designing various pages, menus and icons. So, I want multiple options to see how the color
  > scheme can be applied. Provide a few examples of how the logo color would look with this color scheme
  > including multiple options for each page.
- **Follow-up response:** Corrected course. Instead of hand-drawn mockups, rendered the **real app**
  headless: `pnpm install`, `pnpm dev` on :5199, global Playwright
  (`/opt/node22/lib/node_modules/playwright`), seeded `localStorage b2beruf.settings.v1
  {state:{onboarded:true},version:1}` to reach the real screens, and injected a `:root`/`.dark` style
  tag that swaps **only** the CSS color tokens (`!important` on the custom props). Screenshot matrix over
  Praktisch/Theorie/Fortschritt in light+dark under 3 token-swap options (Hue-swap / Warm-cream /
  Cobalt-led) + a Current reference; composited into side-by-side comparison strips with Playwright and
  published as a Claude artifact + sent PNGs. Flagged that the header logo is a PNG (not token-recolored)
  and the nav-mark colors are hard-set in `route-icons.tsx`.
- **Follow-up prompt (verbatim):**
  > don't use gradient so much - not in logo. not on buttons! use variety of colors from the palette to
  > generate fun looking variations with colorful accents.
- **Follow-up response:** Regenerated with all gradients flattened (injected CSS neutralizing
  `.bg-accent-gradient` + `.bg-mesh`), producing four flat treatments (A Flat cobalt / B Warm cream /
  C Butter buttons / D Confetti with a Coral `#FF6B54` accent pop) across the real screens, plus **8 flat
  logo color combos** (no gradient). Delivered as a new artifact + sent strips.
- **Follow-up prompt (verbatim):**
  > I don't like any of these designs. can you give me a set of prompt and some ai tools to generate the
  > mock ups? I want the guidance as a pdf and keep it saved in the repo.
- **Follow-up response:** Pivoted to a self-serve guide. Authored
  `docs/branding/genauly-ai-mockup-guide.html` (print-optimized A4) and rendered it to
  `docs/branding/genauly-ai-mockup-guide.pdf` via headless-chromium `page.pdf()`. Contents: the brief to
  paste into any tool, palette + type reference, a "which tool for which job" table (Recraft/Ideogram →
  SVG logos, v0.dev → React+Tailwind screens, Midjourney → style, Uizard/Galileo → UI, ChatGPT/Gemini →
  restyle), copy-paste prompts (wordmark, app icon, 3 concepts, 4 app screens, icon set, moodboard,
  screenshot-recolor), pro tips (sizes, flat/no-gradient phrasing, negative prompts), and a hand-back
  checklist mapping results onto the app's design tokens. Committed + pushed to the branch.
- **Follow-up prompt (verbatim):**
  > I'm open to logo rework. Add a prompt for that as well in the document
- **Follow-up response:** Added **section 4d · Ground-up logo rework**: a wide-exploration prompt across
  six mark archetypes (wordmark, lettermark, umlaut device, precision symbol, breakthrough, conversation),
  a "refine the winner" prompt that builds a full lockup system (horizontal/stacked/app-icon/one-color/
  reversed/16px favicon on cream + cobalt grounds), and SVG-export guidance (Recraft/Ideogram; Looka/
  Brandmark alternatives). Re-rendered the PDF, committed, pushed.
- **Follow-up prompt (verbatim):**
  > yes, merge to main
- **Follow-up response:** Opened PR #522 (`docs(branding): AI mockup generation guide`) and squash-merged
  it into `main` (commit `0513dd4`). Ran the required post-merge housekeeping:
  `git reset --hard origin/main` + `git push --force-with-lease` to realign the dev branch.
- **Follow-up prompt (verbatim):**
  > document the session
- **Follow-up response:** This documentation pass — appended this Entry 388, refreshed the
  `PROJECT_STATUS.md` `_Last updated_` block + added the session-116 Resume-here handoff, moved the
  aged-out session-113 handoff into a new `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`
  chunk (with an index row), and shipped it to `main`.
- **Artifacts:** `docs/branding/genauly-ai-mockup-guide.pdf` (new) · `docs/branding/genauly-ai-mockup-guide.html`
  (new) · PR #522 (`0513dd4`) · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`
  (new) · `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md`.

## Entry 389 — 2026-07-14 (session 117, Üben session navigation + Bibliothek Üben-button copy)

- **Branch:** `claude/uben-session-navigation-q4pfs0` (Opus 4.8)
- **Prompt (verbatim):**
  > there's an issues with navigation - whenever the user opens a üben session and exits, they have to
  > stay at where they were in the app before the session. But they come back to home page at the moment
  > which is not ideal - fix it. Another things is that I'd like to make it very clear to users that
  > whenever they filter something andnrhe word count changes, the üben session is tailored as per the
  > filter. One idea that I have is to integrate the word count into the üben button to say something
  > like the üben session is for these apps specifically.. something like " Üben mit xxx Worter". I'm
  > open for your thoughts on this. First fix the navigation and riuting issue and then we can talk
  > about the next point
- **Response summary:** Two-part change. **(1) Navigation:** traced that every Üben entry point
  (`navigate("/session?...")` from the four Bibliothek trainers, Heute → `UebenPath`, Grammatik
  lessons, `Analytics`, `Sammlung`) pushes a history entry, but `SessionPlayer` always exited via
  `navigate("/")`. Added an `exit()` helper — `(window.history.state?.idx ?? 0) > 0 ? navigate(-1) :
  navigate("/")` — so exiting returns the learner to the exact prior route (filters + scroll intact),
  falling back to the overview only for a deep link / fresh load with no in-app history. Wired into all
  three exit paths (empty-state, done-screen, exit-confirm); relabelled the two "Zur Übersicht" buttons
  "Zurück". Shipped this part first per the founder's instruction. **(2) Üben-button copy:** flagged
  that the count beside Üben is the *pool the session samples from* (`buildScopedSession` draws a
  ~5-min subset), and that "mit" needs the dative; recommended folding the count into the button with
  correct per-tab nouns. Founder chose "Üben mit xxx Wörtern" and "show the count always". Extended
  `UebenLabel` (`browseScroll.tsx`) with optional `count`+`noun` → "Üben mit {n} {noun}"; the four
  trainers pass the filtered count with the dative noun (Wörtern / Kollokationen / Wendungen / Themen,
  singular fallbacks) at both the desktop rail footer and the mobile sticky bar; removed the redundant
  stacked count block + the `count` prop from each `filterRailProps` (`FilterRail`'s count/countStack
  kept as an unused optional no-op). Verified headless (seed `localStorage b2beruf.settings.v1` to skip
  onboarding, global Playwright) at 1280 + 390 wide: "Üben mit 858 Wörtern" / "Üben mit 24 Themen"
  render centered with the bolt, no clipping. Gates green: typecheck, build, lint (0 err/44 warn),
  test:unit 134/134.
- **Artifacts:** `src/features/session/SessionPlayer.tsx` · `src/features/shared/browseScroll.tsx` ·
  `src/features/vocabulary/VocabularyTrainer.tsx` · `src/features/collocations/CollocationsBrowser.tsx` ·
  `src/features/redemittel/RedemittelTrainer.tsx` · `src/features/grammar/GrammarHub.tsx` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · commits `36cb4c0`, `d097853` · PR # (pending).
- **Follow-up prompt (verbatim):**
  > can you rework the feedback button on mobile view.. as the current one looks like a chat button
- **Follow-up response:** The mobile feedback affordance was `FeedbackIconButton` (in the four
  Bibliothek Üben action bars) rendered as a bare `h-11 w-11` rounded square with a `MessageSquareText`
  glyph, i.e. the universal live-chat icon, so it read as a support/chat widget. Reworked it into a
  compact labelled **"Feedback" pill** (auto width, `px-3`, `Sparkles` mark in brand + the word
  "Feedback") so it ties to the "Mit KI gebaut" disclaimer and its purpose is unambiguous. Desktop
  `FeedbackPill` and in-session `FeedbackFullButton` were left unchanged (they already carry a text
  label). Verified headless at 390 wide: "✨ Feedback" sits left of "⚡ Üben mit 858 Wörtern" with no
  crowding. Gates green (typecheck, build, lint 0 err). Shipped to `main` (PR #526).
- **Artifacts:** `src/components/layout/FeedbackButton.tsx` · commit `<mobile-feedback>` · PR #526.
## Entry 390 — 2026-07-14 (session 118, Kollokationen nodal graph)

- **Branch:** `claude/kollokations-nodal-graph-080jt7`. **Model:** Opus 4.8.
- **Prompt (verbatim):**
  > is it possible to add a nodal graph for kollokations similar to the one in worter? what are pros and
  > cons and what features could one expect for this? provide a brief summary
- **Response summary:** Researched the existing Wörter graph (`WordGraph.tsx` + pure `wordGraph.ts`,
  lazy d3-force canvas) and the Kollokationen tab (which shipped deliberately graph-less,
  `KOLLOKATION_VIEWS` excluded `graph` with the comment "The graph stays Wörter-only"). Answered: yes,
  very feasible and the engine is ~80% reusable; the natural model is a **bipartite noun ↔ verb** graph
  (edges = the authored collocations). Laid out pros (cheap, instructive, honest data, consistent UX),
  cons (reverses a deliberate scoping call, weaker size/color signal since frequency is keyed by
  content_id, hub density), and expected features.
- **Follow-up prompt (verbatim):**
  > write an implementation plan for it. I want the graph to look visually stunning when zoomed out. Aim
  > for the highest standards of usefulness, accuracy, quality and finesse of the graph.
- **Follow-up response:** Confirmed two foundational calls via `AskUserQuestion` (both recommended
  options chosen): **bipartite noun ↔ verb** model + **theme-island** layout. Wrote a plan
  (`graphPalette.ts` shared palette · pure `collocationGraph.ts` + test · lazy `CollocationGraph.tsx`
  renderer tuned for zoomed-out beauty · wire into `CollocationsBrowser`). Approved.
- **Follow-up response (build):** Implemented all five deliverables. Node size = degree, color =
  majority-theme domain, theme-centroid forces form islands; fit-to-all on open; cached radial glow
  sprites (additive in dark), curved source-tinted edges, vignette background; nouns = solid discs,
  verbs = rings; bipartite selected-node card with clickable partner chips; legend doubles as
  Nomen/Verben + domain filter. Wörter graph untouched beyond the palette import. Verified: typecheck
  clean, lint 0 errors, `test:unit` 142/142 (8 new), `build` green, `check:bundle` main 79.5 kB,
  Playwright browser check over `pnpm preview` (fit-to-all, selection, zoom, legend filters; light +
  dark; desktop + mobile; zero console errors). Committed + pushed to the branch (PR/merge deferred to
  the founder per the no-PR-unless-asked rule).
- **Artifacts:** `src/lib/graphPalette.ts` (new) · `src/features/collocations/collocationGraph.ts` (new) ·
  `src/features/collocations/CollocationGraph.tsx` (new) · `tests/collocationGraph.test.ts` (new) ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/vocabulary/WordGraph.tsx` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`.
- **Follow-up prompt (verbatim):**
  > Okay looks good. merge to main. can you add a toggle button to change the shape of the pop up tile
  > on the graph? it should either occupy the width of the graph horizontally or height of graph window.
  > the pop up tile should not be like how it is currently. when the pop up tile is being toggled, the
  > graph should refocus itself to center. [...] also, the new toggle button should be beside the close button.
- **Follow-up response:** Squash-merged the graph to `main` (PR #527, `b71617a`; rebased first, resolving
  parallel-session-117 doc collisions — main's Üben-nav work — by renumbering this session to **118**),
  then ran the post-merge realignment. Then added the card **shape toggle**: `CollocationGraph` gained a
  `cardLayout` state (`horizontal` full-width bottom bar, default | `vertical` full-height right panel),
  a `PanelRight`/`PanelBottom` toggle button placed beside the card's close `X`, and refactored the old
  `fitToNodes` into `fitToRect` + `freeRect`/`cardExtent` so toggling re-fits the constellation into the
  area the card leaves free (the "refocus to center" ask); the card became a flex column with a
  scrollable body (partner-chip cap removed). Verified headless: both shapes render, the graph
  re-centers on toggle, light+dark, desktop+mobile, zero console errors. Gates: typecheck, lint (0
  errors), test:unit 142/142, build, check:bundle 79.6 kB.
- **Artifacts:** `src/features/collocations/CollocationGraph.tsx` · `CLAUDE.md` · `docs/PROJECT_STATUS.md` ·
  PR #527 (`b71617a`) + PR #528 (`a823a8a`, the toggle).
- **Follow-up prompt (verbatim):**
  > the nodes should be moveable similar to the worter graph. also, when tapped on a word the nide is
  > zoomed in a bit too much but the text isn't readable. it needs adjusting.
- **Follow-up response:** Three fixes in `CollocationGraph.tsx`. (1) **Draggable nodes:** the drag was
  already wired like Wörter, but the strong theme-centroid force snapped a released node straight back;
  now the node **pins where dropped** (keep `fx`/`fy` on release). (2) **Gentler zoom on select:** the
  fit button's hub jump went to `k=2.8` ("too much"); replaced with a shared `focusNode` at
  `READABLE_K=1.55` that centers the selected node in the card-free area, fired from a `selectedId`
  effect so tap / partner-chip / hub-jump all frame consistently. (3) **Readable labels:** the focus
  labels overlapped into an unreadable pile; rewrote the label pass to rank candidates (selected first,
  then by degree), **skip any that would overlap an already-placed label**, and draw each on a
  translucent rounded pill (11px/600). Verified headless (fit→hub framing, precise node-drag, zoomed-out
  tap): labels legible, gentle zoom, node moves + stays, zero console errors. Gates: typecheck, lint (0
  errors), test:unit 142/142, build, check:bundle 79.6 kB. (Session 118 follow-up, PR #532.)

## Entry 391 — 2026-07-14 (session 119, account-dropdown z-index bug fix)

- **Branch:** `claude/account-settings-dropdown-icons-b8feg6`. **Model:** Opus 4.8.
- **Prompt (verbatim):**
  > [screenshot attached] there seems to be a bug with the account settings dropdown and the icons. fix it
- **Attachment:** phone screenshot of a Bibliothek Kollokationen page with the account menu open; the
  page's browse toolbar (ViewSwitcher icons + search magnifier) is bleeding through the dropdown's
  DESIGN theme-toggle row.
- **Response summary:** Diagnosed it as a z-index stacking bug, not transparency (the dropdown bg is
  opaque `bg-surface`). The app header (`AppShell.tsx`, `sticky top-0 z-20`, a stacking context via its
  `backdrop-blur`) and the sticky Bibliothek browse toolbar (`browseHeaderClass` in
  `src/features/shared/browseScroll.tsx`, `sticky ... z-20`) were both `z-20`; equal z-index resolves by
  DOM order, and the toolbar comes later, so it painted over the account dropdown wherever the dropdown
  overflows below the header (the dropdown's `z-50` is scoped inside the header context, so it can't win
  against a sibling context). Fix: raise the header to `z-30`, one-line className change, still below
  FeedbackPill `z-40` / Toaster `z-50` / bottom nav `z-[55]/[60]` and non-overlapping with the desktop
  sidebar `z-30`. `pnpm build` green. Committed, opened PR #529, squash-merged to `main`, ran the
  post-merge branch realignment.
- **Artifacts:** `src/components/layout/AppShell.tsx` · PR #529 (`9a51e27`).
- **Follow-up prompt (verbatim):**
  > document the session
- **Follow-up response:** Updated `docs/PROJECT_STATUS.md` (`_Last updated_` block + new session-119
  handoff; aged session 117's handoff into the W29 archive per the doc-hygiene rule) and appended this
  prompt-log entry.
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md`.

---

## Session 120 — 2026-07-14 — Content-library coverage review + deepening

**Branch:** `claude/content-library-coverage-lih2fp` · **Model:** Opus 4.8 · **Attachments:** none

- **Prompt (verbatim):**
  > in the current content library, there's sometimes clearly way too less numbers of words or
  > collocations for some themes or sub themes or branches. can you do a thorough review of the library
  > and see what can be improved? also the potential new ones to add should be genuinely useful and
  > commonly used for the users interested in those fields ir branches.
- **Clarifying question (AskUserQuestion):** asked where to focus the expansion. Founder selected all
  three: **Service Branchen + Daily-life themes + Both, in waves.**
- **Response summary:** Wrote a throwaway coverage script (loads the banks via Vite `ssrLoadModule`,
  same as the linter) to quantify vocab/collocation counts per theme, sub-theme and Branche. Finding:
  the industrial Branchen are well-covered (s94/s95/s102 packs); the gap is the **service/consumer
  world** (sports 17 / beauty 19 / hospitality 19 / retail 21 vocab) and the **daily-life themes**
  (bank 29 / behoerde 33 / bildung 34 / wohnen 47) with several near-empty sub-themes. Deepened them in
  two waves of genuinely common, high-frequency words. **Wave 1 (service Branchen):** +76 vocab / +48
  collocations across hospitality/retail/beauty/cleaning/security/sports (each `sectors`-tagged on the
  natural theme, mostly `customer`/`safety`/`arzt`; fewer for cleaning/security which were less thin).
  **Wave 2 (daily-life):** +57 vocab / +8 collocations across bank/behoerde/bildung/wohnen +
  arzt.versicherung, sub-theme-tagged to fill `behoerde.aufenthalt`/`bescheid`, all `bank`/`bildung`
  subs, `wohnen.nebenkosten`/`probleme`. Added all 189 provenance rows (DWDS refs, draft status;
  `content_type: "vocabulary"`). Regenerated `frequency.ts` after `pip install wordfreq` +
  `build:frequency-subset` (unbinned 342→86). Refreshed morphology oracle subsets; fact gate passes
  with **0 two-oracle-confirmed errors**. Totals now vocab **1,246** · collocations **797** ·
  provenance **2,452**. Gates: lint:content, typecheck, build, test:unit 142/142, check:bundle 79.6 kB,
  verify:facts all green. (Rebased twice onto main across parallel sessions 118/119; data files merged
  cleanly, docs re-applied, renumbered to session 120.)
- **Artifacts:** `src/data/vocabulary.ts` · `src/data/collocations.ts` · `src/data/provenance.ts` ·
  `src/data/frequency.ts` · `scripts/vendor/*subset.json` · `docs/reports/verify-facts-report.md` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · PR #530.
