# Session & Prompt Log — Archive 2026-W29 (2026-07-13 to 2026-07-19)

_Weekly archive slice of the append-only prompt log (ISO week 2026-W29). The maintenance rule and
entry template live in the live log `docs/SESSION_PROMPT_LOG.md`; the index of weekly files is
`docs/archive/prompt-log/README.md`. Left as written (append-only history)._

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
- **Follow-up prompt (verbatim):**
  > document the session
- **Follow-up response:** This documentation pass. The session was documented incrementally across the
  three PRs (#527 graph, #528 shape toggle, #532 drag+labels); this final pass verifies coherence and
  logs this prompt. Also refreshed `CLAUDE.md` (Kollokationen Graph paragraph: toggle, drag-pin,
  `focusNode`/`READABLE_K`, collision-culled label pills) and the session-118 `PROJECT_STATUS.md`
  handoff (graph + both follow-ups). NB two parallel same-day sessions (117 Üben-nav, 119
  account-dropdown) landed on `main` while this ran; each was rebased through and this session was
  renumbered 117→**118** to avoid the collision.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` · `docs/PROJECT_STATUS.md` · `CLAUDE.md`.

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

---

## Session 121 — 2026-07-14 — Merge the `arbeitswelt` domain into `beruf`

**Branch:** `claude/berufsleben-arbeitsumfeld-overlap-itmpeg` · **Model:** Opus 4.8 · **Attachments:** none

- **Prompt 1 (verbatim):**
  > what's the difference between berufsleben and arbeitsumfeld categories in the graph? they both seem
  > like they hve same color and are also redundant to a learner.
- **Response 1 (question, no code change):** Explained that these are two of the taxonomy **domains**
  (`src/data/domains.ts`), which the Bibliothek graph views color nodes by. `beruf` ("Berufsleben",
  indigo `#5b5be6`) grouped the 6 communication-heavy workplace themes (meetings, scheduling, logistics,
  customer, conflict, project); `arbeitswelt` ("Arbeitswelt & Umfeld", violet `#8b5cf6`) grouped the 4
  topical ones (technology, sustainability, safety, travel). Confirmed both founder observations: the
  two colors are ~30° apart and read as one on the dense graph, and the comms-vs-topics split is a
  taxonomist's cut invisible to learners (the German labels are near-synonyms). Offered merge vs.
  keep-but-differentiate; recommended merge given the branch name.
- **Prompt 2 (verbatim):**
  > merge
- **Response 2:** Merged `arbeitswelt` into `beruf` across 6 code sites + CLAUDE.md. Dropped the
  `arbeitswelt` entry from `domains.ts`; retagged technology/sustainability/safety/travel to
  `domain: "beruf"` in `themes.ts` (all 10 workplace themes now in `beruf`); removed the `arbeitswelt`
  color from `graphPalette.ts`; removed `"arbeitswelt"` from the `DomainId` union (`types/index.ts`) and
  `DOMAIN_IDS` (`lint-content.mjs`); set the Büro building rollup to `domains: ["beruf"]`
  (`domain-buildings.tsx`). `themeGroupsForMode` is data-driven, so the library primary dropdown
  re-groups with no code change. Gates: `lint:content` OK, `typecheck` OK, `build` OK, `test:unit`
  142/142. Opened PR #535, squash-merged to `main`, ran the post-merge branch realignment.
- **Artifacts:** `src/data/domains.ts` · `src/data/themes.ts` · `src/lib/graphPalette.ts` ·
  `src/types/index.ts` · `scripts/lint-content.mjs` · `src/components/city/domain-buildings.tsx` ·
  `CLAUDE.md` · PR #535 (`d4393da`).
- **Follow-up prompt (verbatim):**
  > document the session
- **Follow-up response:** Updated `docs/PROJECT_STATUS.md` (`_Last updated_` block + the content-banks
  domain count + a new session-121 handoff; aged session 119's z-index-fix handoff into the W29 archive
  per the doc-hygiene rule) and appended this prompt-log entry.
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md`.

---

## Session 122 — 2026-07-16 — Theorie graph-view quality audit + P0/P1 fixes

**Branch:** `claude/bibliothek-theorie-graphs-sk0dr3` · **Model:** Fable 5 · **Attachments:** none

- **Prompt 1 (verbatim):**
  > check the graphs in bibliothek/theorie. I think they have a lot of bugs and quality issues. Do a
  > comprehensive analysis and provide me a report with priority actions p0 to p3
- **Response 1 (analysis, no code change):** Read both graph views (`WordGraph.tsx`,
  `CollocationGraph.tsx`), both pure builders, palette, tests and the trainer mounting; ran the real
  builders + a d3-force benchmark against the live banks. Delivered a P0–P3 report in chat. P0: the
  synchronous sim warmup (`tick(120)`/`tick(160)`) freezes the main thread 951ms/1019ms (desktop-class
  CPU) per open and per filter change; a pinch starting on a node leaves `alphaTarget` hot forever
  (permanent jitter + battery drain, plus a permanently pinned node in Wörter). P1: a filtered-out
  selection ghosts the whole canvas (dead focus id dims everything, no card); the Kollokationen
  zoomed-out view renders zero labels below k=0.7 (fit-to-all is k≈0.21 phone / 0.55 laptop, the
  authored `hubBoost` was dead code); only 118/797 collocations resolve into Wörter-graph edges and
  494/2,514 `related` refs drop unresolved (content-authoring follow-up). P2: no label collision
  culling in Wörter, card covers the selected node in Wörter, wheel hijacks page scroll, legend count
  ignores filters, no resize refit, fit-button quirks, `konferenzraum` duplicate + 6 pair-form labels.
  P3: unused `register` plumbing, setState-in-updater in `toggleLayout`, `posRef` growth, stale palette
  comment, a11y, node seeding. Also noted what is healthy (tested pure builders, memoized items, lazy
  d3 chunks).
- **Prompt 2 (verbatim):**
  > add in the report, which actions should be done by which claude llm models
- **Response 2:** Added a per-action model map aligned with `docs/PROJECT_REFERENCE.md` routing: Opus
  4.8 for the warmup rework + pinch fix (and P1-3/P1-4 riding along, same files) and the P1-5 curation
  list; Sonnet 5 for the P2 ports/lifecycle fixes and content authoring; Haiku 4.5 for the mechanical
  batch. Suggested session batching (one session per tier) since Claude Code runs one model per session.
- **Prompt 3 (verbatim):**
  > can you explain why is Fable left out and what tasks are fable suitable for in simpler words?
- **Response 3 (explanation only):** Fable is the design/judgment tier; the fix list is already
  diagnosed and specified, so build tiers execute it better per euro. Fable earns its cost on
  "figure out what to build" work (e.g. rethinking the graphs as a learning surface), research-heavy or
  high-stakes judgment calls. Gave the rule of thumb: unknown-answer → Fable, tricky build → Opus,
  spec'd build → Sonnet, trivial → Haiku.
- **Prompt 4 (verbatim):**
  > alright go ahead with opus tasks
- **Response 4:** Implemented the four fixes in the two view components (pure builders + unit tests
  untouched): rAF-chunked sim warmup with a 10ms/frame budget and a 20-tick warm-restart fast path
  (>50% cached positions → draw immediately; cold start settles blank then reveals); pinch branch
  releases a half-started drag and `alphaTarget(0)` runs whenever the last pointer lifts; draw ignores
  focus ids absent from the current graph (dormant selection revives when the node returns; `fitView`
  ignores a dormant card); Kollokationen hub labels (degree ≥ 5) stay readable at any zoom with alpha
  ramping 0.4→0.9 by degree. Verified end-to-end with Playwright against the dev server (both views
  paint post-warmup with zero >200ms long tasks; tap opens card; no ghosting after filter change; hub
  labels screenshot-verified at fit-to-all; no page errors). Gates: typecheck clean, lint at the exact
  pre-change warning baseline, test:unit 147/147, build + check:bundle 79.6 kB. Opened PR #539,
  squash-merged to `main`, ran the post-merge branch realignment, and updated the docs (status handoff
  s122; s120 handoff aged into the W29 archive).
- **Artifacts:** `src/features/vocabulary/WordGraph.tsx` · `src/features/collocations/CollocationGraph.tsx` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md` · PR #539.
- **Follow-up prompt (verbatim):**
  > document the session and merge the changes to main
- **Follow-up response:** Both were already done in the prior turn (the s122 docs shipped inside
  PR #539 itself, squash-merged as `6486a32`; branch realigned). Verified main contains the code fixes
  + `PROJECT_STATUS.md` + this log, then appended this follow-up entry and merged it (PR #540).
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` · PR #540.

## Session 123 — 2026-07-16 — Theorie graph-view P2/P3 batch (the rest of the session-122 audit)

**Branch:** `claude/graphs-troubleshooting-plan-2f6p4s` · **Model:** Sonnet 5 · **Attachments:** none

- **Prompt 1 (verbatim):**
  > finish off the remaining tasks in graphs troubleshooting plan
- **Response 1:** No plan file exists under this name; the actual "remaining tasks" pointer is the
  `docs/PROJECT_STATUS.md` s122 handoff's "Remaining P2/P3 batch... is scoped in the session-122
  prompt-log entry" line (Entry — session 122 above), so read that report's P2/P3 list (label-culling +
  card-refit ports to Wörter, wheel scroll-trap, count-vs-filter mismatch, resize refit, fit-button
  quirks, data nits, hygiene) and implemented it. Data nits (`konferenzraum` duplicate + pair-form
  labels) were already fixed by the intervening PR #538, so skipped. Implemented, in
  `src/features/vocabulary/WordGraph.tsx` + `src/features/collocations/CollocationGraph.tsx` (+
  `collocationGraph.ts`, `graphPalette.ts`, `tests/collocationGraph.test.ts`): (1) collision-culled
  label placement ported into the Wörter draw loop; (2) a card-covers-node pan-into-view effect for
  Wörter (Kollokationen already had this via its card-aware `focusNode`); (3) wheel now only zooms with
  ctrl/cmd held on both graphs (was hijacking page scroll on every tick); (4) the legend connection count
  now reflects the active domain/kind filter on both graphs instead of the raw total; (5) a resize
  handler that keeps the visual center anchored on both graphs instead of leaving the view off-center;
  (6) the fit button's random-word/hub-jump now only picks among filter-passing nodes on both graphs.
  P3 hygiene: dropped the dead `register` field from the Kollokationen graph link plumbing (builder,
  component, and the now-pointless test); moved `toggleLayout`'s side effects out of the `setCardLayout`
  functional updater (must stay pure); capped `posRef` position-cache growth at 4000 entries; fixed a
  stale "6-domain" palette comment (5 since the s121 merge); added `role="img"` + `aria-label` to both
  canvases. Left "node seeding" alone (Kollokationen's centroid seeding is deliberate island-forming
  behavior; porting it to Wörter would fight that graph's intentionally different "cloud" layout).
  Left the P1-5 content-curation item (494/2,514 unresolved `related` refs) as an explicitly separate,
  still-open follow-up, not a graph-code bug.
  Verified end-to-end with Playwright against `pnpm dev` (onboarding seeded via localStorage): plain
  wheel scrolls the page instead of zooming (`scrollY` 0→95/0→131), ctrl+wheel still zooms with
  non-overlapping culled labels; a tap near the bottom edge of the Wörter canvas pans the selected node
  clear of the card; the Kollokationen legend count went 786→0 under a Nomen-only filter (correct
  bipartite math) and the Wörter count went 1712→1281 under a Berufsleben-only filter; the fit button's
  hub-jump under a Verben-only filter landed on a verb ("beantragen"); the Kollokationen layout toggle
  still refits correctly after the purity fix; zero console errors. Gates: `typecheck` clean, `lint` at
  the exact pre-change 53-warning baseline, `test:unit` 146/146 (147 minus the deleted dead test),
  `lint:content` clean, `build` + `check:bundle` 79.6 kB. Updated `docs/PROJECT_STATUS.md` (new s123
  handoff, s121's handoff aged into the W29 archive) and this log.
- **Artifacts:** `src/features/vocabulary/WordGraph.tsx` · `src/features/collocations/CollocationGraph.tsx` ·
  `src/features/collocations/collocationGraph.ts` · `src/lib/graphPalette.ts` ·
  `tests/collocationGraph.test.ts` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md`.

## Session 124 — 2026-07-16 — Kollokationen Karten card text-cutoff + speak-button alignment fix

**Branch:** `claude/card-text-alignment-fixes-cc3k0r` · **Model:** Sonnet 5 · **Attachments:** 1
screenshot (Bibliothek/Theorie Kollokationen Karten grid, titles cut off mid-word with a trailing
ellipsis, e.g. "die Aufgaben vertei...")

- **Prompt 1 (verbatim, with the attached screenshot):**
  > sometimes the words are being cut-off due to spacing issue. Adjust the cards' dimensons or the
  > space within the cards so that no text is cut-off. Also, the speak out loud buttons are not
  > algined properly in some cards. Fix that such that they are perfeclty aligned to the right.
- **Response 1:** Identified the exact view from the screenshot's Nomen-Verb phrases (e.g. "eine
  Frist einhalten", "einen Termin absagen") as the Bibliothek → Theorie → Kollokationen tab's
  "Karten" grid, `CollocationCard` in `src/features/collocations/CollocationsBrowser.tsx`. Root
  cause: the title row was `flex items-center` with the title `<p>` carrying `truncate` and no
  `flex-1`, so a long title filled the row via flex-shrink and got ellipsis-truncated, while a short
  title (e.g. "Zeit sparen") left the `SpeakButton` sitting immediately after the text instead of
  anchored to the card's right edge. The example-sentence row directly below already used the correct
  pattern (`min-w-0 flex-1`, no truncate) and never had this bug. Fix: changed the title row to
  `flex items-start gap-1.5` and the title `<p>` to `min-w-0 flex-1 ... leading-snug` (dropped
  `truncate`/`items-center`), mirroring the example row, so titles wrap instead of truncating and the
  speak icon always sits flush right. Verified `pnpm typecheck` clean, `pnpm lint` clean, `pnpm build`
  + `pnpm check:bundle` green (79.6 kB), then built + served `pnpm preview`, seeded
  `b2beruf.settings.v1` in localStorage to skip onboarding, and took a Playwright screenshot of
  `/library?tab=kollokationen&view=karten` confirming every previously-truncated title (e.g. "etwas
  zur Sprache bringen") now renders in full and every speak button (including on "Zeit sparen") sits
  flush right. Committed and pushed to the branch.
- **Prompt 2 (verbatim):**
  > go ahead and open a pr then merge
- **Response 2:** Opened PR #545 into `main`. Interrupted mid-turn by a follow-up "document the
  session" prompt, so wrote this log entry plus the `docs/PROJECT_STATUS.md` handoff (aging session
  122's handoff out to the W29 archive) before merging, so both land in the same squash-merge.
- **Artifacts:** `src/features/collocations/CollocationsBrowser.tsx` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md` · PR #545.

## Session 125 — 2026-07-16 — Theorie graph word-selection distribution + focus polish

**Branch:** `claude/graph-word-selection-distribution-5av8xk` · **Model:** Opus 4.8 · **Attachments:**
7 phone screenshots across the thread (Kollokationen/Wörter graph selections). A long single-branch
thread iterating on how the Wörter (`WordGraph.tsx`) and Kollokationen (`CollocationGraph.tsx`) graph
views behave when a word is selected. Nine squash-merges to `main` (PRs #542, #543, #544, #546, #547,
#548, #549, #550).

- **Prompt 1 (verbatim):**
  > can you make sure that whenever a word is selected on the graph, all the other selections are also
  > equally distributed in the open space in the graph no matter their initial position. Do it with
  > satisfying animations. And when they are unselected by clicking or tapping in background space, they
  > should go back to their original positions. Also, check that sometimes, in different selecctions, the
  > words are too zoomed out - fix it
- **Response 1:** Built the focus layout in `WordGraph.tsx`: on select, a word's neighbors animate into
  an arrangement and the view frames at a readable zoom (clamped, fixing "too zoomed out"); on deselect
  they animate back to stored home positions. `homePosRef` + `focusRafRef` easeOut tween pinning `fx/fy`;
  prefers-reduced-motion respected. Verified with a Playwright smoke test on the built preview. Shipped
  PR #542 and merged.
- **Prompt 2 (verbatim):** `> merge it to main`
- **Response 2:** Confirmed PR #542 was already squash-merged; showed the merged state.
- **Prompt 3 (verbatim, with a `beantragen` Kollokationen screenshot):**
  > when I click on the fit to screen button, this is what I see. doesn't look like what I asked was done
  > here
- **Response 3:** Identified the screenshot as the **Kollokationen** graph (separate component), which
  didn't have the behavior yet. Ported the focus fan-out + restore + readable framing to
  `CollocationGraph.tsx`. PR #543, merged.
- **Prompt 4 (verbatim, with before/after `die Cloud` Wörter screenshots; plus a mid-turn follow-up):**
  > Here's another example of a word in Worter graph. Attached are the before and after clicking
  > screenshots. I feel like too much of rearranging is happening when clicked which isn't necessary. the
  > position from which each connecting word come need not be altered too much. I just want all of them to
  > be visible on the screen by pulling the connecting words closer when clicked on a word and still seem
  > like the words are part of a bigger nodal graph.
  > the space between the pop up winow and graph wondow borders in kollokations graph should be same as in
  > the worter graph.
- **Response 4:** Replaced the even-ring rebuild with a **direction-preserving pull-in** (keep each
  connection's angle, only contract over-long spokes) in both graphs; also floated the Kollokationen
  selected-node card off the canvas edges by the same `bottom-3/left-3/right-3` gap the Wörter card uses.
  PR #544, merged.
- **Prompt 5 (verbatim; plus a mid-turn follow-up):**
  > make sure to use the 70-80% of the space of the window so that there's not too much background space
  > left out and doesn't invoke the need for suer to zoom in again.
  > when the dimesnipns of the pop up window is toggled, the graph has to adapt in such a way that again
  > all of the selected nodes are all visible.
- **Response 5:** Changed the placement to scale the arrangement to fill ~82% of the free area at the
  target zoom (per-axis) so small selections aren't left in empty space; card-shape toggle re-fits since
  the sizing keys off the free area. PR #546, merged.
- **Prompt 6 (verbatim, with a self-correction):**
  > * the fit to screen button should work the same way in kollokation as in worter.
  > * make sure when the views are switching when pressing the fit to screen button, there's always
  > animations.
- **Response 6:** Made the Kollokationen fit button pick a **random well-connected node** (like Wörter,
  not the fixed biggest hub) and made every fit-button view switch animate (fit-all tweens the camera;
  word-jump animates via the focus effect). `fitToNodes`/`fitToRect` refactored to return the transform.
  Verified different words on repeated presses + a mid-animation frame differing from the settled frame.
  PR #547, merged.
- **Prompt 7 (verbatim):**
  > be sure that the distribution of the nodes are such that the words are clearly legible, if not move
  > them around a little until they're readable.
- **Response 7:** Root cause: the layout only separated the node dots, not the wider text labels, so
  overlapping labels got culled by the draw pass. Added label-box-aware spacing (`relaxLabels` AABB pass
  with the selected word immovable), expanded `frameFocus` bounds by label extents, and disabled label
  culling while focused so no connection word can vanish. Verified 1-, 2-, 8-, 13-connection selections.
  PR #548, merged.
- **Prompt 8 (verbatim, with 4 dark-mode phone screenshots):**
  > some of the words are still not appearing. also, for the smaller connections with 2-3 words, they are
  > not enough spread out to occupy the space around and instead looking cramped to the center
- **Response 8:** Reworked placement to put each connection on an **ellipse sized to fill the space**
  (direction preserved, radial factor floored at 0.72) so even a single connection spreads out. Verified
  the missing labels were already fixed in code (`der Termin`'s 9 all render) — the screenshots were a
  cached PWA build. PR #549, merged. Flagged the service-worker caching caveat to the founder.
- **Prompt 9 (verbatim, with a `beantragen` screenshot):**
  > in this case for example, why isn't the space to the left snd right not being used properly? it's
  > still cramped
- **Response 9:** Cause: preserving original angles kept a hub whose connections all pointed one way
  bunched in a central column. Added `spreadAngles()` (blend each angle toward an even slot, preserving
  circular order) so clustered connections fan across the whole ellipse and use the left/right space.
  Verified numerically (16 angles in ~80° → ~260° arc) and visually (`stellen` × 5 reaches all
  directions). PR #550, merged.
- **Prompt 10 (verbatim):** `> document the session`
- **Response 10:** Wrote this log entry, added the session-125 handoff to `docs/PROJECT_STATUS.md`
  (aging session 123's handoff out to the W29 archive), and refreshed the Wörter/Kollokationen graph
  descriptions in `CLAUDE.md` with the selection/focus model.
- **Artifacts:** `src/features/vocabulary/WordGraph.tsx` · `src/features/collocations/CollocationGraph.tsx`
  · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md` · `../CLAUDE.md` · PRs #542, #543, #544, #546, #547, #548, #549, #550.
- **Maintenance note:** this live prompt-log file has passed the ~1,200-line rotation budget; a future
  session should rotate the oldest entries into `docs/archive/prompt-log/` per the rotation policy.

## Session 125 (cont.) — 2026-07-16 — Documentation + prompt-log rotation

**Branch:** `claude/graph-word-selection-distribution-5av8xk` · **Model:** Opus 4.8 · **Attachments:**
none. Same conversation as session 125; a follow-up maintenance instruction (append-only, so recorded
as a continuation entry rather than editing the session-125 entry above).

- **Prompt (verbatim):**
  > document the session. fix the prompt log rotation.
- **Response:** Session 125 was already documented in the prior turn (status handoff + prompt-log entry
  + `CLAUDE.md` graph-model update). This turn performed the overdue **prompt-log rotation** flagged in
  the session-125 maintenance note: the live `docs/SESSION_PROMPT_LOG.md` had passed the ~1,200-line
  budget (1,317 lines). Moved **entries 365–391 (sessions 104–119, all dated 2026-07-13/14 → ISO week
  W29)** out of the live file into a new week archive
  `docs/archive/prompt-log/SESSION_PROMPT_LOG_2026-W29.md` (created with the standard weekly header),
  keeping the current session plus the last five (**sessions 120–125**) in the live file per the
  rotation policy. Updated the live file's "Archived entries" note (now "entries 1–391 / session 120
  onward") and added the W29 row to `docs/archive/prompt-log/README.md` (plus a note that session 120+
  uses `## Session N` headers vs the older `## Entry N`-per-prompt style). Verified continuity (archive
  ends at entry 391 / session 119, live starts at session 120) and no lost content; live file down to
  368 lines.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` · `docs/archive/prompt-log/SESSION_PROMPT_LOG_2026-W29.md`
  (new) · `docs/archive/prompt-log/README.md`.

## Session 126 — 2026-07-17 — Daily-life content scale-up (Phase A)

**Branch:** `claude/scale-words-domains-qjv9x4` · **Model:** Opus 4.8 · **Attachments:** none.

- **Prompt 1 (verbatim):**
  > currently the app has mainly berufsleben words. Can you scope a task to scale up words from other domains?
- **Prompt 2 (verbatim, answering a direction question):**
  > i chose both phase a and b
- **Prompt 3 (verbatim):**
  > go ahead with the plan
- **Prompt 4 (verbatim):**
  > yes go ahead with phase b
- **Response:** Analysed the content distribution (workplace = ~78% of the then-1,246-word bank; the five
  daily-life themes were ~half the depth of workplace themes, and the `alltag` domain covered only
  bureaucracy). Scoped a two-phase plan `docs/plans/DAILY_LIFE_SCALEUP_PLAN.md` and executed the whole
  thing. **Phase A** (PR #553) deepened the five original daily-life themes in four theme commits: bank
  (43→81 vocab, +12 colloc), bildung (46→80, +11), behoerde (49→80, +8), wohnen (57→80, +5) and a 6-word
  arzt top-up to 80 (+132 vocab / +36 collocations total). **Phase B** added five NEW everyday-life
  `alltag` themes, one PR each: `einkaufen` (#554), `essen` (#555), `mobilitaet` (#556), `freizeit`
  (#557), `digitales` (#558) — each a full `behoerde`-shape pack (49 vocab / 40 collocations / 2 dialogues
  / 2 texts / 3 Can-Do / 1 writing prompt / ~97 provenance rows, plus `ThemeId` + `THEME_IDS` + a new
  lucide icon + `themes.ts` record + `writingPrompts` entry). New alltag themes fold into the Wohnhaus city
  building via an added `alltag` domain rollup (`domain-buildings.tsx`), with `tests/city-mastery.test.ts`
  updated for the full-coverage invariant. **New bank totals: 1,623 vocabulary / 1,011 collocations /
  3,105 provenance rows / 20 themes.** Every theme/PR passed lint:content, verify:facts (0
  two-oracle-confirmed errors), build, test:unit 146/146, check:bundle 79.6 kB, eslint 0 errors, and was
  squash-merged to `main` with the branch realigned after each.
- **Artifacts:** `docs/plans/DAILY_LIFE_SCALEUP_PLAN.md` (new) · `src/data/{vocabulary,collocations,
  provenance,themes,canDo,writingPrompts,dialogues,texts,frequency}.ts` · `src/types/index.ts` ·
  `scripts/lint-content.mjs` · `src/lib/icons.ts` · `src/components/city/domain-buildings.tsx` ·
  `tests/city-mastery.test.ts` · `docs/reports/verify-facts-report.md` (generated) · `CLAUDE.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`. PRs #553–#558 (all squash-merged to `main`).

## Session 127 — 2026-07-17 — Brand kit catalogue Vol. IV

**Branch:** `claude/epic-ramanujan-p049i8` · **Attachments:** none.

- **Prompt 1 (verbatim):**
  > previously I asked opus to generate a few mock ups for logo and brand kit, but I didn't like any of them. Can you as Fable give it a go and provide me with 5-10 brand kits ideas? Remember my preferences from previous sessions for this task.
- **Prompt 2 (verbatim, mid-work):**
  > are you done? you seem to be working for a while now
- **Prompt 3 (verbatim, after an accidental tool rejection):**
  > I didn;t decline
- **Response:** Researched the recorded branding history first: session 113's 20-direction catalogue
  (Vol. I–III, none chosen) and session 116's rejected Cobalt & Butter previews with the founder's
  verbatim constraints ("don't use gradient so much - not in logo. not on buttons!", "use variety of
  colors ... fun looking variations with colorful accents", plus "I put a lot of time into designing
  various pages, menus and icons"). Authored `preview/branding/genauly-identity-vol4.html`: **eight new
  kits** (Textmarker, Haken dran, Sticker-Klub, Linie B2, Zwei Stimmen, Bauhaus Pause, Neonschild,
  Der Dachs), each a live SVG mark + wordmark + 64/40/20 px app icon + hex palette + free Google-Fonts
  type pairing + flat UI probe + a "Passt zum Bestand" mapping note. Deliberately no retreads of the 20
  rejected directions; every kit flat, multi-accent, and compatible with the existing app design.
  Verified visually via headless-Chromium screenshots. Delivered as a file + a private Claude artifact
  (`b4bd024b`); updated `preview/branding/README.md` with a Vol. IV index. Docs + preview only, no
  `src/` change, no gates run.
- **Artifacts:** `preview/branding/genauly-identity-vol4.html` (new) · `preview/branding/README.md` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 4 (verbatim):**
  > can you generate a preview of some screenshots of the app using kit 1 and 6? Can you create more mockups with similar philosophy of kit 6, and also previews of those with app's screenshots?
- **Response:** Reused the s116-proven method (real app headless via Playwright + `pnpm dev`, seeded
  onboarding, `:root` token-override style tag, flattened gradients, header logo swapped to a data-URI
  mark; NO hand-drawn mockups, layouts untouched). Shot Praktisch/Theorie/Fortschritt at 390x844 light
  for Kit 1, Kit 6, and four NEW Bauhaus-family kits designed for this round: **6A Bauklötze** (Fröbel
  blocks), **6B Ulm** (HfG-Ulm systematic), **6C Plakat** (Sachplakat red), **6D Neubau** (contemporary
  violet/rosé/grass), plus an unmodified "Aktuell" reference. Composited seven labeled strips to
  `preview/branding/vol5-screens/` and authored `preview/branding/genauly-identity-vol5.html` (full kit
  specs + embedded strips + per-kit "Gegenüber Kit 6" notes). Sent all strips to the founder; updated
  the branding README with the Vol. V index + the reusable preview method.
- **Artifacts (prompt 4):** `preview/branding/genauly-identity-vol5.html` (new) ·
  `preview/branding/vol5-screens/*.png` (7 strips, new) · `preview/branding/README.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 5 (verbatim):**
  > can you publish the html as an artifact so that I can view it here?
- **Prompt 6 (verbatim):**
  > why does 6a, 6b, and 6c logos looking like random pieces of grometric blocks without any alphabet G?
- **Response:** (5) Published Vol. V as a Claude artifact (`c34244cd`); artifacts are self-contained, so
  the strips were inlined as 1400px JPEG data URIs (canvas re-encode, ~1.5 MB page). (6) Valid critique:
  the 6A/6B/6D marks were G-less abstract compositions and 6C's G was a typed font glyph. Redesigned all
  four as geometric G letterforms (iterated via test renders at 150px + 32px): 6A = one continuous blue
  toy-track G with a gable + block resting on it, 6B = modular right-angled G with the signal-orange
  crossbar, 6C = heavy poster "G." drawn as paths (no font), 6D = open violet ring-G with a rosé wedge
  crossbar + acid dot. Updated the vol5 symbols + copy, the header-logo data URIs, re-shot the 12 app
  screenshots, rebuilt the strips, republished the artifact at the same URL.
- **Artifacts (prompts 5-6):** `preview/branding/genauly-identity-vol5.html` ·
  `preview/branding/vol5-screens/kit6[a-d]-*.png` (re-rendered) · artifact `c34244cd` ·
  `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 7 (verbatim):**
  > let's lean more into kit 1 and 6. Provide more variations by being creative and playing around with the things like colors but keeping the core idea intact.
- **Prompt 8 (verbatim, sharpening the brief):**
  > The idea is to hve a visually stunning and beautiful looking app that should build trust and should feel highly premium
- **Response (model switched to Opus 4.8 for this round):** Built **Vol. VI**, eight premium color
  variations of the two favorites with the core marks intact, all previewed on the real app. Kit 1
  family: Kobalt & Butter (refined), Tinte & Messing (ink + brass), Aubergine & Aprikose, Marine &
  Koralle. Kit 6 family: Bauhaus (refined), Graphit & Messing (Braun/Vitra), Bordeaux & Marine, and
  **Mitternacht** (a dark-mode variant driving the app's real `.dark` class, sapphire + gold on
  midnight). Refactored the preview harness to define each kit once as hex-per-token-role with a
  hex→HSL helper (`vol6-kits.mjs`) and to toggle dark mode headlessly. Authored
  `preview/branding/genauly-identity-vol6.html` (Fraunces/Inter premium spec sheet, grouped by family,
  palette swatches + embedded strips), composited nine strips to `preview/branding/vol6-screens/`, sent
  the eight kit strips, and published a self-contained artifact (`dfcad5f6`). Updated the branding
  README. No `src/` change.
- **Artifacts (prompts 7-8):** `preview/branding/genauly-identity-vol6.html` (new) ·
  `preview/branding/vol6-screens/*.png` (9 strips, new) · `preview/branding/README.md` · artifact
  `dfcad5f6` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 9 (verbatim):**
  > For the 1 - Kobalt & Butter, can you replace Kobalt with the dark blue color in the bottom navigation icons? Also, add another color to the palette - the light blue in the bottom navigation panel and replace the butter yellow in the logo with this light blue. Now provide a preview
- **Response:** Pulled the exact nav colors from source (`route-icons.tsx` / `nav-items.ts`): dark blue
  `#2563EB` (Praktisch/Theorie base), and two candidate light blues (sky `#38BDF8` = gear-center dot;
  cyan `#22D3EE` = compass needle + chart). Built **Vol. VII**: Kit 1 with `#2563EB` as primary, the
  light blue added to the palette AND used as the logo highlighter swipe (replacing butter) AND mapped
  to `--accent` so app chips/badges show it. Rendered two readings on the real app (Himmelblau
  recommended, Cyan alternate) + the original for reference. Authored
  `preview/branding/genauly-identity-vol7.html`, 3 strips in `preview/branding/vol7-screens/`, sent the
  two option strips, published artifact `a4b80dcf`. Asked the founder to confirm which light blue. No
  `src/` change.
- **Artifacts (prompt 9):** `preview/branding/genauly-identity-vol7.html` (new) ·
  `preview/branding/vol7-screens/*.png` (3 strips, new) · `preview/branding/README.md` · artifact
  `a4b80dcf` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 10 (verbatim):**
  > I like your recommendation but I want both the suggested blues to be a little lighter.. loke 10-15%. Also add an additional color coral to the palette and generate a preview with this setup
- **Prompt 11 (verbatim, same turn):**
  > also, for the logo, the highlight seems to be slightly short and doesn't filly cover the closed circle part of the g. maybe extend the blue highlight by 1-2 pixels on the bottom and tht should fix it.
- **Response:** Built **Vol. VIII**, a single refined Kit 1: both blues lightened ~10–15% (Nachtblau
  `#2563EB→#3D74ED`, Himmelblau `#38BDF8→#52C6F9`), coral `#F0603F` added to the palette and mapped to
  the `--reward` token so it shows in-app (streak/reward), and the logo swipe path extended at the bottom
  (`L 54 40 L 13 44 Q 9 40 10 32` → `L 54 45 L 13 49 Q 9 45 10 34`) so it fully covers the g's closed
  bowl (tested at 200px + 44px, before/after in the sheet). Authored
  `preview/branding/genauly-identity-vol8.html` (logo before/after + palette + coral component demo +
  real-app strip), strip in `preview/branding/vol8-screens/`, sent it, published artifact `0b98120a`.
  Flagged this as the likely spec to wire for real next.
- **Artifacts (prompts 10-11):** `preview/branding/genauly-identity-vol8.html` (new) ·
  `preview/branding/vol8-screens/k1-final.png` (new) · `preview/branding/README.md` · artifact
  `0b98120a` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 12 (verbatim):**
  > provide the artifact again here in the chat
- **Response:** Republished the Vol. VIII artifact at the same URL (`0b98120a`) to re-surface it.
- **Prompt 13 (verbatim):**
  > finalize this version but don't implement the changes yet. Document the session along with saving all the artifacts to the repo.
- **Response:** Finalized Vol. VIII as the chosen brand **without any `src/` change**. Wrote the
  implementation-ready spec `docs/branding/BRAND_SPEC.md` (exact token→HSL map for all 14 tokens,
  dark-mode starting point, the logo swipe path + "outline the g" production note, and a step-by-step
  implementation checklist), saved the canonical logo reference `preview/branding/genauly-logo-final.svg`,
  and saved every published artifact self-contained under `preview/branding/artifacts/`
  (`genauly-vol[5-8]-artifact.html`; Vol. IV already self-contained). Updated the branding README (a
  FINALIZED banner), the `PROJECT_STATUS.md` `_Last updated_` block + the aged-out session-127 reference,
  the W29 archive branding handoff (finalization + Next-on-go), and this log. Shipped the docs to `main`.
- **Artifacts (prompts 12-13):** `docs/branding/BRAND_SPEC.md` (new) ·
  `preview/branding/genauly-logo-final.svg` (new) · `preview/branding/artifacts/genauly-vol[5-8]-artifact.html`
  (new) · `preview/branding/README.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · `docs/SESSION_PROMPT_LOG.md` · `CLAUDE.md`.

## Session 128 — 2026-07-18 — Gender-visuals research panel + Artikel-Visuals implementation plan

**Branch:** `claude/visual-gender-indicators-gsox24` · **Model:** Opus 4.8 (switched to Fable 5 for
the final planning turns) · **Attachments:** none. Docs/preview-only session; nothing shipped to the
app. Two design-preview pages were published as private claude.ai artifacts during the session and
are committed to the repo under `preview/artikel-visuals/`. (Numbering note: this session started
before the parallel sessions 126/127 merged; its docs were rebased onto their `main` and renumbered
from 126 to 128.)

- **Prompt 1 (verbatim):**
  > how best can we add visuals to words to show the gender of a word and some more context so that the user can also learn visually. generate a few ideas
- **Response 1:** Surveyed the current rendering (article is plain text on flashcards, part of the
  bold string in the Bibliothek views, zero gender encoding anywhere) and proposed 7 ideas:
  ArticleBadge color chips, shape triple-encoding, plural-morphology highlighting, graph gender
  rings, suffix-rule hints ("-ung ist immer die"), a gender-sort Neuland scene, and sub-theme icon
  watermarks, with a recommended ship order.
- **Prompt 2 (verbatim):**
  > can you show previews of all these ideas in a html?
- **Response 2:** Built a preview page of all 7 ideas mocked in the app's real design tokens (light +
  dark) with real bank words; the artifact publish was initially rejected in the tool UI.
- **Prompt 3 (verbatim):** `> are you done?`
- **Response 3:** Confirmed done; sent the HTML file directly instead.
- **Prompt 4 (verbatim):** `> i didn't decline it. I approved ot`
- **Response 4:** Re-published the page as an artifact (UI hiccup on the first attempt).
- **Prompt 5 (verbatim):**
  > I like some of the above ideas but before fina,ising them, I want to explore if it is possible to add minimalistic icons/doodles which should be easy to create but would leave an impact on the learners like male sticky figure with a huge moustache to represent masculine words? It's just an idea. Brainstorm with a panel of experts on what kind of illustrations are the best and would leave a lasting impact on users based on actual evidence, and based on their report generate preview of some of those ideas as a html artifact.
- **Response 5:** Ran a three-expert research panel as parallel agents (SLA literature, memory
  science, competitor/illustration practice; key sources: Santos 2015, Arzt & Kost 2016, Desrochers
  1989/1991, Bertsch 2007, Sundararajan & Adesope 2020, McDaniel & Einstein, Watkins, Boroditsky).
  Synthesized the verdict (imagery for gender: yes; repeated bizarre human personas: no, false rule
  on Mädchen/Person/Gast + contrast collapse) and built a second artifact: findings, evidence
  scoreboard, the moustache tested honestly, and previews A–E (Artikel-Marken, Artikel-Wesen
  mascots, fused doodles, answer-reveal effects, Eselsbrücke + Artikel-Sprint).
- **Prompt 6 (verbatim):**
  > I didn't understand how does the 8th point work in the report, can you clarify it?
- **Response 6:** Explained Preview E's two halves: the "Meine Eselsbrücke" self-made association
  slot (generation effect) and the Artikel-Sprint retrieval drill, and why they are grouped.
- **Prompt 7 (verbatim):**
  > what do you mean by this?: Optional and off to the side. Most learners skip it; the keen ones who use it get the biggest durable gain in the whole system.
- **Response 7:** Clarified the reach-vs-effect-per-use distinction: optional by design, low
  adoption expected, outsized benefit for motivated learners; don't force it or measure by usage %.
- **Prompt 8 (verbatim):**
  > the self-made memory hook is a great exercise for quiz. Add it along with all the research findings in the already available variety of exercies for quiz in the docs.
- **Response 8:** Recorded the full panel findings + the two proposed quiz exercises (Eselsbrücke,
  Artikel-Sprint) under backlog #4 in `docs/PROJECT_REFERENCE.md` with a cross-reference in
  "Research findings to reuse"; committed and pushed.
- **Prompt 9 (verbatim):**
  > I like preivew B, C and D from the above html report. How best can we implement it to the theorie cards?
- **Response 9:** Mapped the three picks onto the actual Theorie card code (`VocabCard` FlipCard in
  `VocabList.tsx`): Wesen as the gender mark on the card front, the gender effect on card flip
  (the browse-side answer-reveal moment), fused doodles on the card back for registered words only;
  proposed 3 phased PRs and two defaults (mark beside the full article text; effect on every flip).
- **Prompt 10 (verbatim, interrupted mid-response and completed by Prompt 11):**
  > write a robust implementation plan to implement these features along with model recommendations and save it to the repo. Also document the session - Then I'll implement the plan in a new session.
- **Prompt 11 (verbatim):**
  > When selecting the first 20 words for fused doodles, take the words which are of high frequency and also highly useful for kapital 1 in the game.
- **Response 10/11:** Authored **`docs/plans/ARTIKEL_VISUALS_PLAN.md`** (3 phased PRs, per-phase
  model recommendations, acceptance criteria, guardrails, risks) with the founder's batch-1
  selection rule encoded: the 10 nouns Kapitel-1 missions directly reference (verified against
  `src/data/missions.ts`: 6 die / 4 der / 0 das) + 10 top-Zipf nouns from the Kapitel-1 mission
  themes with a das-balance override (>= 4 das-words), selection snippet included. Committed both
  preview pages to `preview/artikel-visuals/`, added the SCOPED pointer to backlog #4. First PR
  attempt (#564) conflicted: `main` had moved (parallel sessions 126/127, PRs #551–#563), so the
  branch was rebuilt on the new `main`, the session renumbered 126 → 128, and the docs re-applied:
  session-128 handoff in `docs/PROJECT_STATUS.md` (aging the s126 daily-life handoff into the W29
  archive, repairing the missing s124 archive entry, refreshing the stale content-bank counts to the
  post-scale-up totals), and this log entry appended after the parallel sessions' entries.
- **Artifacts:** `docs/plans/ARTIKEL_VISUALS_PLAN.md` (new) ·
  `preview/artikel-visuals/gender-visuals-preview.html` + `gender-doodles-panel.html` (new) ·
  `docs/PROJECT_REFERENCE.md` (backlog #4 research + SCOPED note, cross-reference section) ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md` · PR #564.

---

## Session 129 — 2026-07-18 — Artikel-Visuals PR 1: Wesen marks + flip effects (Opus wiring + Fable art)

- **Branch:** `claude/article-visuals-opus-tasks-rxurot`
- **Prompt 1 (verbatim):**
  > I want to implement article visuals plan's opus tasks. Which effort should I set it to? read the plan and let me knpw
- **Response 1:** Read `docs/plans/ARTIKEL_VISUALS_PLAN.md` §6: the only Opus 4.8 task is the PR 1
  tokens + card wiring at **medium** effort; the Wesen/effect art is assigned Fable 5 high and the
  registry/reuse work Sonnet 5. Flagged the split and asked whether to keep the art on Fable.
- **Prompt 2 (verbatim):**
  > for now, start working on opus tasks, let me know once done, I'll switch to fable and then it can proceed.
- **Response 2 (Opus 4.8):** Implemented the PR 1 wiring half: `--der/--die/--das` (+`-bg`) tokens in
  `src/index.css` light + dark, exposed in `tailwind.config.ts`; new `src/components/artikel/`
  (`gender.ts` pure `genderOf`, `Wesen.tsx`, `ArtikelEffect.tsx`, `ArtikelLegend.tsx`, the latter
  three with deliberately placeholder art behind locked prop/class interfaces); `FlipCard` `onFlip`
  callback; marks wired into `VocabList` (card front + back-face effect), `VocabViews`
  Tabelle/Liste (16px tier), the one-time legend on the Wörter tab
  (`artikelLegendDismissed` in `useSettingsStore`); `tests/gender.test.ts`. All gates green;
  committed and pushed with a boxed handoff comment marking exactly what the art pass replaces.
- **Prompt 3 (verbatim, after switching the session model to Fable 5):**
  > I implemented part of the articles visuals plan by opus. Review it and make any necessary corrections/improvements and then continue with all fable related tasks in pr1
- **Response 3 (Fable 5):** Review found the wiring sound plus one real timing bug: the effect
  fired at flip START but the back face is only visible ~225ms into the 450ms rotation, so half the
  animation played hidden (fixed with a 200ms animation delay + base opacity 0). Then authored the
  real art from the founder-picked Preview B/D in
  `preview/artikel-visuals/gender-doodles-panel.html`: the three Wesen redrawn at the 24-unit
  viewBox (tinted bodies, dot eyes, one imperfection each: der sprout / die unclosed outline +
  eyelash / das stray hairs; solid small tier under 24px) and the per-element reveal effects
  (der 8-ray burst, die 3 staggered bloom rings, das 6 spinning shards; reduced motion = fading
  tint, opacity only). Verified visually with headless-Chromium screenshots (creatures at
  56/28/24/16px light + dark; effects freeze-framed at 120/300/450ms via paused negative
  animation-delay). Gates green (typecheck, lint 0 errors, test:unit 149, build, bundle 79.6 kB);
  shipped PR 1 into `main` per the auto-ship rule and updated the docs (this entry,
  `PROJECT_STATUS.md` s129 handoff, plan status header).
- **Prompt 4 (verbatim):**
  > okay, proceed with phase 2
- **Response 4 (Fable 5):** Shipped plan Phase 2 (PR 2). Ran the plan §4 selection snippet verbatim
  against the real banks (10 fixed mission nouns + das-override picks programm/hotel/verfahren/
  geraet + top-Zipf it_sicherheit/daten/verbindung/version/funktion/anschluss; tally 5 der / 11 die
  / 4 das, recorded in the plan). Built `src/features/vocabulary/doodles/` (eager `index.ts`
  registry + lazy `art.tsx` with all 20 fused scenes; referents in the new `--ink` token, creature
  via the newly exported `WesenBody`), wired `VocabCard` to load the art chunk on a registered
  card's first flip and show the doodle above the English, and added `tests/doodles.test.ts`
  (registry/bank/gender integrity + a rendered-markup check that each scene uses only its own
  gender tokens). Reviewed all 20 scenes via SSR screenshot sheets in light + dark and fixed three
  compositions (Vollmacht hand, Hotel overlap, Beratung bubble tail). Gates green (test:unit 174,
  bundle 79.6 kB unchanged, art chunk ~11.8 kB lazy); squash-merged into `main` per the auto-ship
  rule with the doc updates.
- **Artifacts:** `src/components/artikel/` (new: `gender.ts` · `Wesen.tsx` · `ArtikelEffect.tsx` ·
  `ArtikelLegend.tsx`) · `src/features/vocabulary/doodles/` (new: `index.ts` · `art.tsx`) ·
  `src/index.css` · `tailwind.config.ts` · `src/features/shared/FlipCard.tsx` ·
  `src/features/vocabulary/VocabList.tsx` + `VocabViews.tsx` + `VocabularyTrainer.tsx` ·
  `src/store/useSettingsStore.ts` · `tests/gender.test.ts` · `tests/doodles.test.ts` ·
  `docs/plans/ARTIKEL_VISUALS_PLAN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · `docs/SESSION_PROMPT_LOG.md` ·
  PR #566 (Phase 1) · PR #567 (Phase 2)
- **Prompt 5 (verbatim, after switching the session model back to Opus 4.8):**
  > alright, finish the plan
- **Response 5 (Opus 4.8):** Shipped plan Phase 3 (PR 3), the reuse pass. In `SessionPlayer` the
  gender reveal effect now fires on a CORRECT noun answer in the flashcard/typing/speaking grade
  paths (`fireGenderEffect` looks the article up via `vocabById(sourceId)`, no-ops for non-nouns +
  Redemittel/collocation cards, never blocks Weiter); the effect overlays the stage with the block
  content pinned `z-10` above it (a screenshot review showed a bloom ring crossing the card text, so
  the content sits above and the burst radiates from behind the opaque card). Added the Wesen mark to
  the Wörter-graph selected-node card (`WordGraph.tsx`) and the legacy `Flashcards.tsx` front. Gates
  green (test:unit 174, bundle 79.6 kB); squash-merged into `main` per the auto-ship rule with the
  doc updates (plan status -> all 3 phases shipped, status handoff, CLAUDE.md).
- **Artifacts (PR 3):** `src/features/session/SessionPlayer.tsx` · `src/features/vocabulary/WordGraph.tsx` ·
  `src/features/vocabulary/Flashcards.tsx` · `docs/plans/ARTIKEL_VISUALS_PLAN.md` ·
  `docs/PROJECT_STATUS.md` · `CLAUDE.md` · `docs/SESSION_PROMPT_LOG.md` · PR #568
- **Prompt 6 (verbatim):**
  > is everything merged to main? if not do it, and also document the session
- **Response 6 (Opus 4.8):** Verified all three Artikel-Visuals PRs (#566/#567/#568) are squash-merged
  into `main` (HEAD == origin/main, every new file present); nothing was left unmerged, so no extra
  merge was needed. Appended this prompt to close out the session's paper trail and pushed the
  docs-only update to `main`.
- **Artifacts (Prompt 6):** `docs/SESSION_PROMPT_LOG.md` (+ this entry)
## Session 130 — 2026-07-18 — Data-architecture review + P0/P1 integrity fixes

- **Branch:** `claude/app-data-management-guide-tcmz3j` · **Model:** Fable 5
- **Prompt 1 (verbatim):**
  > I had been trying to understand how the data/content of the app is managed but I still am not fully sure how it works. If I don't understand how can I present it to a crowd or audience? I want you to explain it me clearly, and I want to access the data in the repository direclty - so tell me which files to look at and where they are located at. I'm a non tech founder so be as clear as possible but don't dumb it down too much - I understand a few things about tech as I worked as a consultant and analyst, but not as much as a softweare engineer.
- **Response 1:** Explained the content-as-code architecture end to end: the `src/data/` banks (with
  live line/size numbers and a real `vocabulary.ts` entry), the domain→theme→sub-theme hierarchy,
  the five-layer quality pipeline (structural linter, two-oracle fact check, grammar/CEFR checks,
  trust tiers, human review loop), the ship path, how to browse the files on GitHub, and a
  three-sentence version for presenting to an audience.
- **Prompt 2 (verbatim):** `> Yes, create the visual diagram of the content pipeline`
- **Response 2:** Published a private Claude artifact "Genauly Content Pipeline": a one-page
  five-stage diagram (content banks → structural gate → linguistic verification → trust tiers →
  ship) in brand indigo with a stats strip, light + dark themed.
- **Prompt 3 (verbatim):**
  > what's your expert opinion on the data architecture? should there be any improvements/corrections? are there any loop-holes or missed opportunities to improve it? Do a detailed analysis and provide p0-p3 recommendations
- **Response 3:** Inspected the linter, types, sync layer, and generated-file wiring, then delivered
  a prioritized review. P0: verified items are not fingerprinted, so a post-review edit silently
  keeps "verified" status. P1: id renames orphan learner FSRS history; global id uniqueness across
  banks unenforced (prefixes only warnings); unresolvable `related` terms rot invisibly. P2:
  authoring-workflow scaling (TS2590 splits), the ~2 MB `/sources` chunk, hand-rolled linter vs
  schema library, game-state sync. P3: oracle-coverage warning for new nouns, learner-performance
  feedback loop, unused review-status rungs.
- **Prompt 4 (verbatim):** `> go ahead with the fixes/improvements`
- **Response 4:** Implemented P0 + P1: (1) `pnpm stamp:verified` + `scripts/content-hash.mjs` +
  the `docs/reports/verified-hashes.json` sidecar (25 Can-Do rows stamped) with a lint gate that
  fails on post-verification edits (tamper-tested); (2) `src/lib/idRenames.ts` (`ID_RENAMES` +
  remap helpers) applied in the progress store's persist v1 migrate and on cloudSync remote rows,
  pinned by `tests/idRenames.test.ts`; (3) global id uniqueness + per-bank prefixes as lint errors;
  (4) the related-terms drop audit (`docs/reports/related-terms-report.md`, 495/3,268 unresolved).
  Gates: lint:content 0 errors, test:unit 184/184 after rebasing onto the parallel s129 Artikel-Visuals PRs, build green, bundle 80.7 kB. Docs updated
  (CLAUDE.md commands + conventions, PROJECT_STATUS.md s130 handoff, collocation count 1,011→1,033).
- **Artifacts:** `scripts/content-hash.mjs`, `scripts/stamp-verified-hashes.mjs`,
  `src/lib/idRenames.ts`, `tests/idRenames.test.ts`, `docs/reports/verified-hashes.json`,
  `docs/reports/related-terms-report.md` (all new) · `scripts/lint-content.mjs`,
  `src/store/useProgressStore.ts`, `src/lib/cloudSync.ts`, `package.json`, `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` (edited) ·
  private artifact "Genauly Content Pipeline".
- **Prompt 5 (verbatim):**
  > I need you to redesign the sources page so that it's easily understandable for anyone looking to understand the data architechture and the sources used. Keep it visual where needed. Also for the admin inputs, make it as user firendly as possible to work with the data/content table - add all necessary views, export as csv button, and other functionalities that are useful and necessary but I may have forgotten. Needless to say, these additional features should only be available for admin/founder - thesuhaspala@gmail.com and thelivinsine@gmail.com.
- **Response 5:** Redesigned `/sources` ("Quellen & Datenqualität"): public visitors get the visual
  data-architecture story (stat tiles, five-step pipeline graphic, stacked tier-distribution bar
  with legend, per-bank count tiles; sources/licenses/browse kept). Built the founder-only
  `AdminWorkbench` (`features/legal/AdminWorkbench.tsx`): full register as a sortable DataTable
  with fuzzy search, Typ/Stufe/Status filters, CSV export of the filtered view (`src/lib/csv.ts`),
  copy-id chips, per-row verified checkbox + note (immediate Supabase save), progress bar. Admin
  gate widened to BOTH founder emails (`FOUNDER_EMAILS` in `src/lib/admin.ts`) with matching RLS
  migration `0007_provenance_reviews_admins.sql` (founder must run it once; step added to
  `PHASE2_SETUP.md` + an open action item). Verified with headless-Chromium screenshots (public
  light/dark/mobile + workbench desktop incl. live search). 14 new tests; 198/198, build green,
  bundle 80.8 kB.
- **Artifacts (prompt 5):** `src/features/legal/Sources.tsx` (redesigned) ·
  `src/features/legal/AdminWorkbench.tsx`, `src/lib/csv.ts`,
  `supabase/migrations/0007_provenance_reviews_admins.sql`, `tests/csv.test.ts`,
  `tests/admin.test.ts`, `tests/adminWorkbench.test.tsx` (new) · `src/lib/admin.ts`,
  `docs/plans/PHASE2_SETUP.md`, `docs/PROJECT_STATUS.md` (edited).

## Session 131 — 2026-07-18 — Üben exercise-variety options + plan

- **Branch:** `claude/ueben-exercise-variety-i59ry0` · **Model:** Fable 5
- **Prompt 1 (verbatim):**
  > I'd like to make the ueben not just a bunch of anki cards where the learner just keeps flipping them but also add a variety of exercises for each custom ueben set. But I also understand it would be an immense amount of data to create custom ueben exercieses for each set combination. So, I'd like you to provide which options do we have to make this happen?
- **Response 1:** Analysis of the current engine showed the "immense data" problem mostly does not
  exist: `engine/quiz.ts` already auto-generates 10 exercise types from the existing banks (zero
  authoring) and `SessionPlayer` renders all of them, but the generator is theme-keyed while
  `buildScopedSession` (the Bibliothek Üben path) maps vocab/collocations/Redemittel to flashcards
  only. Laid out five options: (A) wire the existing generator into custom sets via an item-pool
  refactor, recommended; (B) more template exercise kinds from existing fields (article sorting,
  noun-verb match grid, typed cloze, TTS listening, odd-one-out), zero authoring; (C) bounded
  authored micro-exercises keyed per theme, never per set; (D) build-time AI-generated items pushed
  through the existing verification pipeline; (E) runtime LLM generation, advised against (cost,
  latency, unverifiable German, breaks offline). Core principle: sets are filters, exercises are
  per-item templates, so authoring scales with exercise kinds, not set combinations.
- **Prompt 2 (verbatim):**
  > alright, create a robust plan for this
- **Response 2:** Authored `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md`: Phase 0 (pool-based
  `buildPoolQuiz` refactor, distractor fallback for small sets, generic mini-banks kept out of
  scoped sessions per the content-pure rule), Phase 1 (a ~50/50 card/exercise mix in
  `buildScopedSession`, 2-appearances cap, difficulty plumbing, and an FSRS guard because quiz
  `sourceId`s currently write SRS under collocation ids), Phase 2 (five independent new template
  kinds: match grid, typed cloze, listening word, Redemittel cloze, odd-one-out), Phase 3
  (variety guarantees + gates), Phase 4 deferred (authored per-theme packs, build-time AI bank;
  runtime generation rejected), plus the eligibility matrix, risk register, PR slicing, and
  success criteria. Docs-only session: plan + status handoff + this log; no engine code touched.
- **Artifacts:** `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` (new) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 3 (verbatim):**
  > did you specify the claude model recommendations for the tasks in the plan? if not, do it and document the session and merge everything to main
- **Response 3:** The plan had no model map, so §6 became "PR slicing, effort & model
  recommendations": PR 1 (engine surgery + FSRS guard) = Opus 4.8, PR 2 (match grid + Redemittel
  cloze, mechanical builders) = Sonnet 5, PR 3 (typed cloze, grading edge cases) = Opus 4.8, PR 4
  (listening word, new interaction + gating) = Opus 4.8, PR 5 (odd-one-out + assertions) = Sonnet 5
  with an escalate-to-Opus note, Phase 4 content drafting = Fable 5, Haiku not recommended for any
  rung. Same risk-based routing logic as the Artikel-Visuals / Game G2 plans, with a per-PR
  rationale. Updated the s131 status handoff to point at the map, merged to `main`, realigned the
  branch.
- **Artifacts (Prompt 3):** `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` §6 · `docs/PROJECT_STATUS.md`
  · `docs/SESSION_PROMPT_LOG.md` (+ this entry)
- **Prompt 4 (verbatim, after switching the session model to Opus 4.8):**
  > make sure to also capture the ueben analysis done in the session earlier and the recommendations. Then proceed with implementation of the plan with opus tasks of phase 1
- **Response 4 (Opus 4.8):** (1) Captured the earlier five-option analysis + recommendation durably
  in the plan as Appendix A (it had only lived in this log). (2) Implemented PR 1 = Phase 0 + Phase 1.
  Phase 0: generalized `engine/quiz.ts`'s `buildThemeQuiz` into a pool-based `buildPoolQuiz(pool,
  difficulty, count, opts)` with `buildThemeQuiz` as a behavior-identical wrapper; new opts
  `includeGeneric` (theme-agnostic banks off for scoped sessions), `vocabDistractors`/
  `collocationDistractors` (pool if ≥ 4 else full bank), `themeId`, + a shared `anyContent()`
  fallback. Phase 1: `buildScopedSession` (`engine/session.ts`) now interleaves recall cards with
  generated exercises for the Wörter + Kollokationen scopes, capped at 2 appearances/item
  (`capBySource`), with vocab sets also pulling collocation fill/word-order via `headword`
  resolution; `difficulty` flows from the learner's level. FSRS guard: `SessionPlayer.onQuizResult`
  only grades FSRS/loot when the question sourceId resolves in the vocab bank, so collocation
  questions (`c_*`) award XP + combo only (also fixes the latent Pool 2 bug). Added
  `tests/scopedSession.test.ts`. Gates: typecheck, test:unit 209, lint 0 errors, build,
  check:bundle 80.8 kB, lint:content all green. Squash-merged to `main` per the auto-ship rule with
  the plan status + PROJECT_STATUS handoff updates.
- **Artifacts (Prompt 4):** `src/engine/quiz.ts` · `src/engine/session.ts` ·
  `src/features/session/SessionPlayer.tsx` · `tests/scopedSession.test.ts` (new) ·
  `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` (Appendix A + Phase 0/1 shipped markers) ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 5 (verbatim):**
  > go ahead with pr2 tasks
- **Response 5 (Opus 4.8; plan recommended Sonnet 5, founder chose to continue on Opus):** Shipped
  PR 2 = Phase 2a + 2e. **2a noun→verb match grid:** `collocationMatchQ` in `engine/quiz.ts` reuses
  the `MatchingQuestion` renderer (kind stays `"matching"`), with a `distinctCols` dedupe on both
  noun and verb (MatchingView keys left by `pair.left`, right buttons by `pair.right`, so a repeat
  either side is ambiguous + a duplicate React key); wired into `buildPoolQuiz` difficulty 1 + 2
  (reaches the Kollokationen scope, composed Pool 2, and `/quiz`); the MatchingView sub-line now
  falls back through `q.hint` so the grid reads "Wähle links ein Nomen …". **2e Redemittel cloze:**
  new MCQ kind `redemittelCloze` (added to `QuizKind` + `MCQQuestion.kind` + `kindLabel`);
  `redemittelClozeQ` blanks the longest content word via an umlaut-safe whole-word regex (small
  function-word stoplist, modal/Konjunktiv verbs kept as targets), distractors from the full
  Redemittel bank; `buildRedemittelQuiz` drives the Redemittel scope, now interleaving cloze (~0.35)
  with cards; the FSRS guard already skips the `r_*` sourceId so it awards XP + combo only. Extended
  `tests/scopedSession.test.ts` (grid shape/distinctness, cloze shape, redemittel scope mixes quiz).
  Spot-checked the generated German (clozes + grids) for correctness before shipping. Gates:
  typecheck, test:unit 211, lint 0 errors, build, check:bundle 80.8 kB, lint:content all green.
  Squash-merged to `main` per the auto-ship rule with the plan + status doc updates.
- **Artifacts (Prompt 5):** `src/types/index.ts` · `src/engine/quiz.ts` · `src/engine/session.ts` ·
  `src/features/quiz/QuestionViews.tsx` · `tests/scopedSession.test.ts` ·
  `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 6 (verbatim):**
  > what is the model recommendations for pr3?
- **Response 6 (Opus 4.8):** Answered from the plan §6 map: PR 3 (Phase 2b typed cloze) is
  recommended on **Opus 4.8**, because it extends the typing block UI + the tolerant-matcher grading
  path (umlauts, article prefixes, give-up) and must respect the graduation gate, more judgment than
  the mechanical Sonnet-5 rungs.
- **Prompt 7 (verbatim):**
  > yes
- **Response 7 (Opus 4.8):** Shipped PR 3 = Phase 2b typed cloze. The `typing` SessionBlock gained an
  optional `cloze: { prompt; answers }`; `TypingBlock` renders the blanked example sentence
  ("Ergänze das fehlende Wort", "Lücke" badge) and grades the typed answer via the new
  `gradeTypedAny` (`engine/typing.ts`, best verdict across targets so the blank accepts the exact
  surface form OR the base headword). `typedClozeData`/`clozeTypingBlock` (`engine/session.ts`) build
  the cloze from an example containing the headword; it is gated to `graduatedToTyping` words (in the
  Wörter scope a graduated word has ~50% chance of the cloze variant vs plain forward recall, never
  both), so a new word is never typed cold. Grades FSRS via the vocab sourceId (fires the gender
  reveal on correct nouns). Extended `tests/typing.test.ts` (gradeTypedAny) +
  `tests/scopedSession.test.ts` (graduated-only gate, cloze shape). Spot-checked the generated German
  before shipping. Gates: typecheck, test:unit 215, lint 0 errors, build, check:bundle 80.8 kB,
  lint:content all green. Squash-merged to `main` per the auto-ship rule with the plan + status
  updates.
- **Artifacts (Prompts 6–7):** `src/types/index.ts` · `src/engine/typing.ts` · `src/engine/session.ts`
  · `src/features/session/SessionPlayer.tsx` · `tests/typing.test.ts` · `tests/scopedSession.test.ts`
  · `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 8 (verbatim):**
  > go ahead with pr4
- **Response 8 (Opus 4.8):** Shipped PR 4 = Phase 2c listening word. New MCQ kind `listeningCloze` +
  an `audioPrompt` field on `QuizQuestionBase` (added to `QuizKind`/`MCQQuestion.kind`/`kindLabel` →
  "Hören"). `listeningClozeQ` (`engine/quiz.ts`) reuses the cloze blank + distractors, carries NO
  hint (an EN gloss would reveal the heard word), and stores the full sentence in `audioPrompt`;
  `buildListeningQuiz` drives it. The Wörter scope emits listening blocks (~0.25 ratio) only when
  `buildScopedSession` receives `listening: true`, which `SessionPlayer` sets to
  `ttsSupported() && speechEnabled`. `MCQView` gained an audio branch: an "Anhören" play button that
  autoplays once per question (useEffect on q.id; the session is opened by a tap, so the gesture
  requirement is satisfied) plus the gapped frame as supporting text. Grades FSRS via the vocab
  sourceId. NOT wired into `/quiz` or the composed session (that keeps its own reading-voicemail
  listening). Extended `tests/scopedSession.test.ts` (shape, no-gloss, the TTS gate). Spot-checked the
  generated data before shipping. Gates: typecheck, test:unit 217, lint 0 errors, build,
  check:bundle 80.8 kB, lint:content all green. Squash-merged to `main` per the auto-ship rule with the
  plan + status updates.
- **Artifacts (Prompt 8):** `src/types/index.ts` · `src/engine/quiz.ts` · `src/engine/session.ts` ·
  `src/features/session/SessionPlayer.tsx` · `src/features/quiz/QuestionViews.tsx` ·
  `tests/scopedSession.test.ts` · `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md`
  · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 9 (verbatim):**
  > continue with opus now for pr5
- **Response 9 (Opus 4.8; plan recommended Sonnet 5, founder chose to continue on Opus):** Shipped
  PR 5 = Phase 2d odd-one-out + Phase 3 variety guarantee, completing Phases 0–3. **2d:** new MCQ
  kind `oddOneOut` ("Ausreißer" badge); `oddOneOutQ` (`engine/quiz.ts`) anchors on a set word,
  resolves 2 of its authored `related` terms to bank entries via a replicated `normalizeForm` +
  once-built `vocabResolver` (so engine/ does not import features/), and adds an outsider from a
  DIFFERENT theme as the answer; NO sourceId, so XP + combo only, never FSRS. `buildOddOneOutQuiz`
  drives it in the Wörter scope (~0.2 ratio). **Phase 3:** `avoidRuns` (`engine/session.ts`) greedily
  reorders the final block list so no block kind runs 3-in-a-row when avoidable (kills the
  wall-of-flip-cards feel), applied to every scope; `kindLabel` now covers every new kind. Extended
  `tests/scopedSession.test.ts` (odd-one-out shape + no-sourceId, the no-3-in-a-row assertion).
  Spot-checked the generated clusters before shipping. Gates: typecheck, test:unit 219, lint 0 errors,
  build, check:bundle 80.8 kB, lint:content all green. Squash-merged to `main` per the auto-ship rule
  with the plan + status updates. Plan Phases 0–3 now COMPLETE; only Phase 4 (deferred) remains.
- **Artifacts (Prompt 9):** `src/types/index.ts` · `src/engine/quiz.ts` · `src/engine/session.ts` ·
  `src/features/quiz/QuestionViews.tsx` · `tests/scopedSession.test.ts` ·
  `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 10 (verbatim):**
  > how do we identify the current variety is exhausted?
- **Response 10 (Opus 4.8):** Explained (no code) that "exhausted" is per-axis, not global, and laid
  out the signals: coverage/eligibility gaps (measurable from the banks today), repetition/determinism
  (the real template ceiling), skill gaps (not templatable → Phase 4), and learner signal (needs
  telemetry). Gave a two-part decision rule and proposed a cheap offline "exercise-coverage report" as
  the concrete instrument.
- **Prompt 11 (verbatim):**
  > where will that report live and who should read it and how is it useful? explain it briefly in plain language
- **Response 11 (Opus 4.8):** Plain-language answer: lives at `docs/reports/exercise-coverage-report.md`,
  generated on demand by a `pnpm` command (a repo document, not an in-app dashboard); read by the
  founder (where to spend content effort) and whoever builds next; useful because it turns "does this
  feel samey?" into a named list of topics with a cheap-or-expensive tag.
- **Prompt 12 (verbatim):**
  > yes build it, but it should be easily understandable without too much jargon and should be visual with clear explanations wherever needed
- **Response 12 (Opus 4.8):** Built `scripts/report-exercise-coverage.mjs` + `pnpm
  report:exercise-coverage`. It runs the REAL session builder (no drift) across every theme, unioned
  over all CEFR levels (difficulty 1/2/3) and new+mature decks, with a seeded RNG so output is
  deterministic (verified identical across runs). Writes a visual German report to
  `docs/reports/exercise-coverage-report.md`: a plain "what is this" intro, a 🟢/🟡/🔴 legend, a
  per-type glossary, a per-theme variety bar chart, a folded full topic×type matrix, a Kollokationen/
  Redemittel/Grammatik section, and a "when is variety exhausted?" footer. Caught + fixed two
  methodology flaws during review (all-graduated deck hid the flip-card → union fresh+mature;
  collocationMatch mislabeled as vocab-matching → distinguish by prompt) and reframed the residual as
  word-level once theme-level came out fully 🟢 (20/20). Result: theme-level variety is exhausted; the
  report ranks the cheap word-level residual (85 words without a self-example, 74 without resolvable
  related). Wired the command into CLAUDE.md commands + the plan's new "Deciding when to start Phase 4"
  section. Squash-merged to `main` with the doc updates.
- **Artifacts (Prompts 10–12):** `scripts/report-exercise-coverage.mjs` (new) ·
  `docs/reports/exercise-coverage-report.md` (new, generated) · `package.json` · `CLAUDE.md` ·
  `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 13 (verbatim):**
  > document the session
- **Response 13 (Opus 4.8):** Session-close documentation pass. Verified both `PROJECT_STATUS.md` and
  this log are complete/consistent (all 12 prior prompts captured with responses + artifacts; two
  handoffs held per the doc-hygiene rule, s129 already archived to W29). Fixed the one stale spot the
  variety work left: added a concise "Bibliothek Üben sets are auto-varied (s131)" note to the
  `CLAUDE.md` session-engine section (the new builders, the FSRS guard, the 2-appearance cap,
  `avoidRuns`, and the `pnpm report:exercise-coverage` gauge) so future sessions discover it. Condensed
  the s131 status handoff (it had grown to the 250-line ceiling from live per-PR appends) into a tight
  summary pointing at the plan + this log for detail, bringing the file to 165 lines. No code touched.
- **Artifacts (Prompt 13):** `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`

## Session 132 — 2026-07-19 — Bibliothek mobile-filter fixes + graph two-area color & layout

Branch `claude/filter-scroll-badge-bugs-y75thb`. All work squash-merged to `main` (PRs #581, #582, #583).

- **Prompt 1 (verbatim, + 1 screenshot of the Wörter tab with a large empty gap above the cards):**
  > when filter is opened and being scrolled, there seems to be a bug - see the screenshot. Also, when things from dropdowns in the filter are selected, the filter badges doesn't appear with filter count - which is wrong, the filter count with badges should apply to dropdown items as well. fix these two issues
- **Response 1 (Opus 4.8):** Two fixes. (1) Empty-gap: the sticky/collapsing browse header contained the
  open filter panel; collapsing the tall block on scroll left its reserved flow space as a blank gap.
  Interim fix: stop the header collapsing while `filtersOpen` (`headerHidden && !filtersOpen`) in all
  four browse tabs. (2) Badge: the mobile Filter-button badge counted only `activeFacetCount(selection)`;
  added `scopeActiveCount` (sectors + themes + subs) on Wörter + Kollokationen (Redemittel/Grammatik use
  facets only). typecheck + build green; committed + pushed.
- **Prompt 2 (verbatim, + 1 screenshot of the Kollokationen graph, dense grey tangle):**
  > the lines are too noisy here. can you make them thinner so that the graph looks better?
- **Response 2 (Opus 4.8):** Thinned the Kollokationen graph edges: non-lit stroke width `1 → 0.55`,
  lit `1.8 → 1.6`, resting opacity `0.14 → 0.10` (light) / `0.16 → 0.13` (dark). Built, committed, pushed.
- **Prompt 3 (verbatim):**
  > yes merge to main
- **Response 3 (Opus 4.8):** Opened PR #581 (empty-gap + badge + thin edges), squash-merged to `main`,
  ran the post-merge realign (reset dev branch to `origin/main`, force-with-lease).
- **Prompt 4 (verbatim):**
  > what's the purpose of splitting the non-arbeitswelt categories as three in the graphs? also, the island clusters are not very clearly visible in kollokations graph.
- **Response 4 (Opus 4.8):** Explained (no code) that the graph colors by the app's 5-domain taxonomy, so
  the non-work content shows as three real domains (Alltag/Gesundheit/Bildung); the imbalance is because
  s121 merged the two work domains into one `beruf`. Root-caused the blurry islands: clustering is
  per-theme (20) but color is per-domain (4), so 10 blue work-islands fuse; plus weak centroid pull and
  hub-verb bridges. Ranked betterments (cluster by domain, tighter pull, tame hubs, two-level layout).
- **Prompt 5 (verbatim, two quick messages):**
  > suggest betterments and reasoning
  > don't make any changes yet
- **Response 5 (Opus 4.8):** Gave the ranked recommendations with reasoning, grounded in the real force
  params (`forceX/Y 0.13`, ring `140+N*30`, charge `-42`, link `0.18`). Recommended domain-clustering +
  firmer pull; asked the founder to pick clustering by domain vs theme before implementing.
- **Prompt 6 (verbatim):**
  > can you generate some previews with various degrees of the above recommendations applied?
- **Response 6 (Opus 4.8):** Built a self-contained interactive comparison artifact on the REAL graph
  (extracted 1,243 nodes / 1,014 links via the actual builder; inlined d3-force + its 3 UMD deps,
  verified the bundle exposes the force API in a browser-like vm). Five animated force presets
  (Current, By life area, By life area + tighter [recommended], Two levels, By topic + tighter) with a
  live parameter panel. Published as a claude.ai artifact. Confirmed the data: beruf 733 vs alltag 389 /
  gesundheit 62 / bildung 59.
- **Prompt 7 (verbatim, + 3 screenshots of the open filter panel filling the screen):**
  > here's the filter.. when opened it stays open even after scrolling.. it's stuck! fix the bug
- **Response 7 (Opus 4.8):** Diagnosed this as a side effect of the Prompt-1 interim guard: freezing the
  header kept the tall panel pinned. Proper fix: moved the mobile filter panel into normal document flow
  OUTSIDE the sticky header (only the compact toolbar stays sticky and collapses), and reverted the
  `&& !filtersOpen` guard, across all four tabs. typecheck + build + PR #582 → merged → realigned.
- **Prompt 8 (verbatim, mid-turn during Response 7):**
  > can you translate the stuff in the html artifact for the previw in English?
- **Response 8 (Opus 4.8):** Regenerated the comparison artifact fully in English (also swapped in the
  real German word labels, dropping the earlier id-guessing), republished to the same URL.
- **Prompt 9 (verbatim):**
  > for the artifact, include enough non tech summary so that I understand what is what
- **Response 9 (Opus 4.8):** Added a plain-language "How to read this graph" explainer (dot = noun, ring
  = verb, line = collocation, color = life area, islands = clumps) and de-jargoned the settings panel
  (e.g. "Pull to center: firm" with the raw number secondary). Republished to the same URL.
- **Prompt 10 (verbatim):**
  > keep the color coding to only two main areas - professional and personal life - if needed reword the Arbeitswelt to something like Professional or suitable german word. and the graph I like it by topic + tighter.
- **Response 10 (Opus 4.8):** Implemented both. Added `lifeAreaOf`/`lifeAreaColor`/`LIFE_AREAS`/
  `LIFE_AREA_COLORS` to `graphPalette.ts` (professional = `beruf` = brand indigo; personal = every other
  domain = teal; labels Berufsleben / Privatleben). Switched BOTH graphs' node color, glow, lit edges,
  legend chips and the legend domain-filter to the two areas (clustering unchanged). Applied the
  founder-picked "by topic + tighter" force recipe to the Kollokationen graph: forceX/Y `0.13→0.28`,
  link `0.18→0.11`, collide `r+3→r+5`, ring `N*30→N*35`. Removed now-unused imports. Gates: typecheck,
  test:unit 219, lint 0 errors, build all green.
- **Prompt 11 (verbatim, mid-turn during Response 10):**
  > once done, document the session and push everything to main
- **Response 11 (Opus 4.8):** This documentation pass (PROJECT_STATUS.md handoff + _Last updated_,
  this log, and the CLAUDE.md graph-color/layout facts), then PR #583 → squash-merge to `main` → realign.
- **Artifacts (session 132):** `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `src/features/grammar/GrammarHub.tsx` · `src/lib/graphPalette.ts` ·
  `src/features/collocations/CollocationGraph.tsx` · `src/features/vocabulary/WordGraph.tsx` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · PRs #581 / #582 / #583 ·
  comparison-preview artifact (scratchpad HTML, not committed)
- **Prompt 12 (verbatim):**
  > is everything live?
- **Response 12 (Opus 4.8):** Checked the actual GitHub Pages deploy runs (not just the merges). PRs
  #581/#582 confirmed live (green); #583 had merged but its Pages run hadn't appeared yet, reported it as
  still deploying.
- **Prompt 13 (verbatim, + 1 screenshot of the GitHub mobile commits list showing no check on the latest
  commit):**
  > the latest commit isn't live
- **Response 13 (Opus 4.8):** Diagnosed the real cause: GitHub never fired the `push` event for the #583
  squash-merge (`32dcb50`), so NEITHER the deploy nor the validate workflow ran (a one-off GitHub webhook
  miss; the earlier merges fired fine). Manually dispatched `pages.yml` against `main` (it has
  `workflow_dispatch`), watched run #590 build `32dcb50` and finish `success`, confirming the graph change
  is live. Noted the validate gate also didn't run but its checks already passed pre-merge on the branch.
- **Prompt 14 (verbatim, + 1 screenshot of the live two-color Kollokationen graph):**
  > can you increase the tension of the lines so that the clusters are more tighter together?
- **Response 14 (Opus 4.8):** Tightened the Kollokationen force layout: link tension `0.11 → 0.22` (the
  lever the founder named), centroid pull `forceX/Y 0.28 → 0.38`, collision `r+5 → r+3`. typecheck +
  build green; PR #584 → squash-merge → realign. This time the push webhook fired on its own (verified the
  `7c9182f` Pages run went `success`); the late #583 webhook also finally fired but was harmless (already
  deployed via the manual run). Updated the CLAUDE.md graph-layout values to match.
- **Prompt 15 (verbatim):**
  > document the session and merge everything to main
- **Response 15 (Opus 4.8):** This documentation pass (appended prompts 12–15 here, refreshed the
  PROJECT_STATUS.md s132 handoff with the cluster-tightening + the deploy-webhook-miss learning), then
  shipped the doc update to `main`.
- **Artifacts (Prompts 12–15):** `src/features/collocations/CollocationGraph.tsx` · `CLAUDE.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · PR #584 · manual Pages deploy run #590

## Session 130 (cont.) — 2026-07-19 — Migration 0007 confirmed

- **Prompt 6 (verbatim):** `> give me clear instructions on what's my action point`
- **Response 6:** Step-by-step Supabase instructions for running migration 0007 (SQL editor, the
  exact SQL pasted inline, expected "Success. No rows returned", in-app verification steps, and the
  fallback if migration 0004 were missing).
- **Prompt 7 (verbatim):** `> it says success`
- **Response 7:** Confirmed the migration applied; both admin accounts can now save review marks in
  the /sources Daten-Werkbank. Moved the action item from `PROJECT_STATUS.md` open items to
  `PROJECT_FOUNDATION.md` completed founder items and shipped the doc update.
- **Prompt 8 (verbatim):** `> document the session `
- **Response 8:** Final documentation sweep. The session was documented incrementally throughout
  (s130 handoff with both tasks in `PROJECT_STATUS.md`, CLAUDE.md command/convention updates,
  `PHASE2_SETUP.md` migration steps, prompt-log entries 1-7), so the close-out applied the
  doc-hygiene rule: aged the session-130 handoff (with a migration-0007 closure note) out of
  `PROJECT_STATUS.md` into the W29 archive, restoring the two-most-recent-handoffs shape
  (s132 + s131 remain), and appended this entry. Session totals: PRs #570 (P0/P1 data-integrity
  fixes), #572 (/sources redesign + Daten-Werkbank), #586 (migration-0007 close-out), all
  squash-merged to `main`; three rebases over the parallel sessions 129/131/132.
- **Prompt 16 (verbatim):**
  > there's one more suggestion to the filter rail when expanded on the mobile view. It should occupy only 40-60% of the screen space and internal sroll should be enabled. in addition to that, the go to top button is not center aligned.. check the screenshots and fix it.
- **Response 16 (Opus 4.8):** Two mobile fixes (no screenshots actually arrived this turn; diagnosed both
  from code). (1) Capped the `layout="panel"` FilterRail at `max-h-[55dvh]` as a flex column with a fixed
  header and one internal `overflow-y-auto` scroll region, so the expanded panel stays ~55% of the screen
  and the filters scroll inside it. (2) Fixed the off-center `ScrollTopButton`: it is a `motion.button`,
  and framer-motion's inline `transform` (driving the `y` slide) overrode the Tailwind `-translate-x-1/2`
  centering class; animated `x: "-50%"` across the keyframes and dropped the class. Both live on all four
  browse tabs via the shared `FilterRail` + `browseScroll`. typecheck + build green; PR #589 → squash-merge
  → realign; deploy fired on push.
- **Prompt 17 (verbatim):**
  > do the documentation drill and maintenance if needed and merge everything to main
- **Response 17 (Opus 4.8):** This documentation pass. Folded PR #589 into the session 132 handoff (new
  bullet + PR list), refreshed the `_Last updated_` block, appended prompts 16–17 here, and added a
  one-line note to the CLAUDE.md FilterRail mobile-panel description (55dvh cap + internal scroll). Doc
  hygiene checked: `PROJECT_STATUS.md` holds the two most recent handoffs (s132 + s131) and is well under
  the 250-line cap; nothing to archive. Shipped to `main`.
- **Artifacts (Prompts 16–17):** `src/features/shared/FilterRail.tsx` · `src/features/shared/browseScroll.tsx` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · PR #589

