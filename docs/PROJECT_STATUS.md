# Project Status

_Last updated: 2026-07-13 (session 104, two parallel work-streams). **Bibliothek pre-demo round
SHIPPED** (Opus 4.8): scope dropdowns (Branche/Thema/Unterthema/Kategorie/Gruppe) are now MULTI-select
checkbox popovers, the reset clears them, the filter tile is subtle grey with white controls, the rail
fills the viewport with a slim scrollbar, dropdown numbers show the option count, desktop search is
inline, Wörter facet order (Wortart up / Stufe last), Redemittel lost its card section headers for a
flat grid + Kategorie pills, and the Grammatik hub cards + drills were cleaned up. In parallel the
**Üben map was re-spaced + recolored** (Fable 5, Work item 3 partial: street grid moved off the edges,
MAP_LIGHT = brand-tinted "Stimmung 3", MAP_DARK = the bright "Klarer Abend"). Product name: **Genauly**
(`genauly.de`)._

This is the **lean, living** status doc: current state plus the two most recent session handoffs.
**Start at the `## Resume here (next session)` section at the end.** Companion files:
- **`docs/PROJECT_FOUNDATION.md`** — the stable technical baseline that rarely changes: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra, and completed founder
  action items. Read it when you need the "what's built and how" detail that used to sit here.
- **`docs/PROJECT_REFERENCE.md`** — stable reference: the founder backlog, product-evaluation
  findings, per-session model guidance, and reusable research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked UX decisions.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only session-log history,
  chunked by ISO week under `docs/archive/status-log/`.
- **`../CLAUDE.md`** — developer/agent operating instructions, content conventions, and locked designs.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Heute · Bibliothek · Anwenden · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1 complete),
Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `../CLAUDE.md`.

**Content banks (as of 2026-07-12, session 102 — re-verify with `pnpm lint:content` before quoting):**
vocab **1,113** · collocations **741** · Redemittel **149** · grammar **24 topics / 117 drills** ·
Lese-/Hörtexte **26** (78 checks) · Can-Do **37** · provenance **2,263 rows** · themes **15** ·
exam sets **15** · dialogues **20**. All six top-level domains are populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: ~98% of provenance rows are AI-drafted, not yet human-verified (see
`strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
- [ ] (Optional) Enable Turnstile CAPTCHA on guest sign-in to deter bot abuse before public launch.
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

**Handoff after session 103 (2026-07-12). Üben-refinements Work items 2, 4+5, 6 SHIPPED (Sonnet 5).**
The founder said "go ahead with sonnet 5 items in the ui refinement plan" against
`docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`; work item 1 was already shipped (s101, Opus 4.8), item 3
(map beautification) stays for Fable 5 / Opus 4.8.
- **Item 2 (graph word count):** `WordGraph.tsx` canvas legend now shows only "m Verbindungen"; the
  word count moved to the shared `count` prop, so it sits beside Üben in the rail (desktop) and the
  sticky mobile action bar in `VocabularyTrainer.tsx`, exactly like every other Wörter view. Dropped
  the `view !== "graph"` guards that used to hide it there.
- **Items 4+5 (FilterRail desktop redesign + count always beside Üben), `FilterRail.tsx`:** restyled
  both the desktop rail and the mobile panel as a standard content card (`bg-surface` + visible
  `border-border` + `shadow-soft`, replacing the flat `bg-border` slab the founder called ugly);
  dividers moved from `border-muted-foreground/10` to `border-border`; unselected facet pills went
  from hard `bg-white` to `bg-muted` (with a `hover:bg-muted/70` + `hover:border-primary/40`); scope
  section labels (Branche/Thema/Unterthema/Kategorie/Gruppe) now use the same uppercase eyebrow style
  as the facet labels. The header changed from a single full-width button into a flex row: the
  expand/collapse toggle (flex-1) plus a permanent reset icon beside it (previously the reset only
  showed in an expanded-only first row, which is now deleted). The result count sits beside the Üben
  button in **every** state (open, collapsed, mobile), not just collapsed.
- **Item 6 (grammar lesson Muster/explanation side by side), `GrammarTopicView.tsx`:** the lesson
  Card's `CardContent` gains `lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch
  lg:gap-5 lg:space-y-0` at ≥1024px, splitting the emerald Muster panel (left, `lg:h-full`) from the
  explanation + "Mehr anzeigen" expander (right, wrapped in one `space-y-3 lg:min-w-0` div). Mobile
  keeps the s93-locked stacked order (Muster first) untouched.
- **Gates + verification:** `pnpm typecheck` ✔, `lint` **0 errors** (42 pre-existing warnings),
  `test:unit` **129/129**, `build` + prerender ✔, `check:bundle` **73.0 kB**/400 (unchanged, all
  touched files ride lazy chunks). Browser-verified with Playwright against the local dev server in
  both themes: Wörter graph (word count beside Üben, only "n Verbindungen" under the canvas), Wörter
  Tabelle FilterRail open/collapsed (card look, header reset icon, count beside Üben in both states,
  dark mode), and the Konnektoren grammar lesson at 1280px (Muster left / explanation right) and
  390px (stacked, unchanged).
- **NOT done:** Üben-plan Work item 3 (map beautification + tappable stops, reserved for Fable 5 /
  Opus 4.8); the standing content follow-ups (human `verified` pass, jury Waves 1-2, Wave-2 tranche 2,
  Playwright grammar smoke); founder review of `sector-audit-report.md`.

**Handoff after session 104 (2026-07-12, parallel to s103 and rebased onto it). Üben map re-spaced +
recolored via mockup rounds (Fable 5, Üben-refinements Work item 3 partial).** The founder asked for
map mock-ups, iterated three rounds, and picked a direction that was then shipped to `main`.
- **Mockup rounds (preview sheet `preview/ueben-map-mockups.html`, delivered as a claude.ai artifact
  link):** R1 = the plan's illustrated-buildings recipe in 3 variants (rejected: "doesn't look good");
  a pixel-art village round against founder-shared Zelda/Pokemon-style references was **abandoned
  mid-review by founder choice** ("let's not waste resources"; never committed); R2 = the live map
  re-spaced + 4 color moods (`-r2-farbstimmungen.html`); R3 = founder picked Stimmung 3 (Brand-Ton)
  but its dark was too dark → 4 brighter dark variants (final sheet). **Founder picks: Stimmung 3
  light + "Dunkel D: Klarer Abend" dark.** R1/R2 are archived beside the final sheet
  (`preview/ueben-map-mockups-r1-beautify.html`, `-r2-farbstimmungen.html`). The pixel-art reference
  images were shared inline in chat and could not be exported to files; drop them into
  `preview/references/` if they should be kept.
- **Shipped in `UebenPath.tsx`:** street grid re-spaced (H y=88/170, V x=76/176/276; tiles Bahnhof
  [44,48], Laden [120,48], Zuhause [310,128], Amt [216,205]) so **no landmark tile hugs a map edge**
  (Bahnhof was 13 px, Amt 10 px from the edge); SEG_PATHS + parks/lots re-laid to the new blocks.
  **MAP_LIGHT = Brand-Ton** (indigo-tinted ground `#eef0f7` + lavender lots, green parks stay the
  contrast), **MAP_DARK = Klarer Abend** (deliberately bright blue-grey ground `#2e3450`, near-white
  labels `#dde1f2`; the old night palette was rejected as too dark/low contrast). New palette field
  **`route`**: the journey line/pin now use `P.route` instead of `hsl(var(--primary))` because the
  dark map needs a brighter indigo (`#a6a6fd`) than the dark `--primary` token on the lifted ground.
- **Gates:** typecheck ✔, lint 0 errors, test:unit **129/129**, build + prerender ✔, bundle **73.0
  kB**/400. **Verified in the real app** (vite preview + Playwright, 390x844): light + dark dashboards
  render the picked palettes exactly as mocked.
- **NOT done:** the rest of Work item 3 (tappable stops that slide the practice card, and any further
  in-tile illustration work; the founder chose re-space + recolor over the plan's illustrated-buildings
  recipe, so re-scope item 3 before building more); the standing content follow-ups (frequency subset
  for ~91 new words, founder review of `sector-audit-report.md`, human `verified` pass, jury Waves
  1-2, Playwright grammar smoke). With s103's items 2/4+5/6 shipped in parallel, the Üben plan is now
  fully shipped except item 3's tappable stops.

**Handoff after session 104 (2026-07-13). Bibliothek pre-demo round SHIPPED (Opus 4.8, mid-session
model switch from Sonnet 5).** A same-day founder round the day of the presentation, in two batches.
Batch 1 (two founder lines): scope dropdowns must be multi-select, and the reset must clear them.
Batch 2 (one long mid-turn message): a grab-bag of visual/UX fixes. All shipped together.
- **Multi-select scope dropdowns (reverses the s84 single-select lock; `AskUserQuestion` → "All scope
  dropdowns"):** `FilterRail.tsx` grew a hand-built checkbox popover `ScopeMultiSelect` (Radix `Select`
  is single-value); `RailPrimary` moved from `value`/`onChange(v)` to `values: string[]`/
  `onChange(values)`. `matchesSector`/`sectorFirst` (`lib/facets.ts`) + `themeGroupsForMode`
  (`lib/themeGroups.ts`) now take arrays (OR-within). Every browse page
  (Wörter/Kollokationen/Redemittel/Grammatik) reads its scope params as comma-lists. Sub-theme
  drill-down + travelling `useLibraryScope` engage only with exactly one active Thema; `startSession`
  collapses multi-Thema/Unterthema to the first value (composer biases one theme) but forwards every
  Branche. `tests/sectors.test.ts` updated to the array API + an OR-within case (130/130).
- **Reset clears scopes too** (was `onChange({})` only) and the active-count badge counts scopes +
  facets.
- **Filter tile is subtle grey again** (`bg-muted`, reversing s103's `bg-surface`): the founder found
  white-on-white too low-contrast. Controls inside stay white (`bg-surface` scope triggers + unselected
  facet pills) so they pop. See DECISIONS.md s104 for the s92→s103→s104 contrast arc.
- **Rail fills the viewport** (`lg:max-h-[calc(100vh-7rem)]`, was `-22rem`) with a **slim visible
  scrollbar** (`.slim-scrollbar` in `index.css`, replaced `no-scrollbar`).
- **Dropdown "Alle X" numbers show the option count** (15 Branchen / 15 Themen), not the item total,
  in the muted pill-number format; per-option counts unchanged.
- **Desktop search grows inline in the toolbar row** (`hidden lg:block lg:flex-1`); mobile keeps its
  own second row.
- **Wörter facet order:** Wortart moved up (after Thema/Unterthema), Stufe (CEFR) moved to the end.
- **Redemittel:** per-category card section headers removed → flat card grid; **Kategorie is now a
  16-pill multi-select facet** in the filter (`CATEGORY_FACET`), not a scope dropdown; `?cat=`/
  `?register=` both ride the facet selection; facets apply last over the full bank.
- **Grammatik hub cards** show ONE clean pattern (`pattern.split(" · ")[0]`) in the emerald Muster tint
  (was a truncated " · " fragment) + a bigger icon tile; **drill options** (`GrammarDrillCard.tsx`) got
  a `bg-muted/50` idle fill so they read as tappable answers, not disabled fields. (The lesson layout
  itself was already solid post-s93/s103; this was the "pre-demo sweep".)
- **Gates:** typecheck ✔, lint **0 errors** (42 pre-existing warnings), test:unit **130/130**, build +
  prerender ✔, bundle **73.0 kB**/400. Browser-verified (Playwright, dev server): grey tile + white
  pills/dropdowns, Branche multi-select checkbox popover with per-option counts, "15" option counts,
  inline desktop search, gray mobile filter panel, Grammatik cards. Founder verifies the live result.
- **NOT done:** Üben-plan Work item 3's **tappable stops** (the map re-space/recolor shipped in the
  parallel s104 handoff above; only the tap-to-slide-card sub-task remains); the standing content
  follow-ups (human `verified` pass, jury Waves 1-2, Wave-2 tranche 2, Playwright grammar smoke);
  founder review of `sector-audit-report.md`. Note: 16 Kategorie pills exceeds the ≤12 facet-hygiene
  guideline (a dev-only warning), accepted because the founder explicitly wanted the group names as
  pills.

_(Sessions 85-102's handoffs are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
