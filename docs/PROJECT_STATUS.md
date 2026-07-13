# Project Status

_Last updated: 2026-07-13 (session 105, demo-prep sweep, Opus 4.8). **SHIPPED:** nav renamed
"Heute"->**Praktisch** / "Bibliothek"->**Theorie**, **Anwenden hidden** from the nav; a subtle
**"Mit KI gebaut · Feedback"** pill on every page that emails the founder via a new `submit-feedback`
Edge Function (founder deploy + `RESEND_API_KEY` needed, see `PHASE2_SETUP.md`); the **Fortschritt page
was redesigned** into calm groups; and a **Theorie tiles/filter** round: flippable Karten tiles (EN on
the back), redundant tile tags removed, FilterRail rebuilt as a viewport-capped flex column with an
auto-hiding scrollbar, Mehr/Weniger on long facets, Grammatik Gruppe as a multi-select pill facet, and
a centered toolbar that slides open for search. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 105 (2026-07-13). Demo-prep sweep: nav rename + hide Anwenden, AI-disclaimer
feedback button (emails founder), Fortschritt redesign, flippable Bibliothek tiles, filter polish
(Opus 4.8).** A single long turn against many interleaved founder prompts (branch
`claude/demo-prep-feedback-rename-sl1jqq`, merged to `main`).
- **Nav (`nav-items.ts`, `BottomTabBar.tsx`, `LibrarySwitcher.tsx`, `route-icons.tsx`):** "Heute" →
  **"Praktisch"**, "Bibliothek" → **"Theorie"** (routes `/` and `/library` unchanged). **Anwenden is
  HIDDEN from the nav** (removed from `navItems`, `CONTENT`, `DEFAULT_PINNED_TABS`) but its route stays
  mounted so `/welt` + deep links still resolve; re-add the `navItems` entry to restore it. The
  Praktisch mark changed from a house to a **dumbbell** (`route-icons.tsx` "/" renderer + NORM box; the
  lucide fallback is now `Dumbbell`).
- **Feedback + AI disclaimer (`FeedbackButton.tsx` in AppShell, `lib/feedback.ts`,
  `supabase/functions/submit-feedback/`, migration `0006_feedback.sql`, `config.toml`):** a subtle
  fixed "Mit KI gebaut · Feedback" pill on every non-focus page (bottom-right desktop, above the nav +
  Üben bar on mobile). Opens a dialog (message + optional email); posts to the new `submit-feedback`
  Edge Function (`verify_jwt=false`, anonymous-OK), which **stores a `feedback` row AND emails the
  founder via Resend**. **Founder deploy step needed for emails** (see `docs/plans/PHASE2_SETUP.md`
  new section): run the migration, `supabase functions deploy submit-feedback`, set `RESEND_API_KEY`.
  Without it the UI still works and rows still store once deployed; email is best-effort.
- **Fortschritt redesign (`Analytics.tsx`):** the chaotic ~11-card stack became a calm grouped
  hierarchy: an **Überblick** card (goal ring + Level + XP bar) then a 2×2 lifetime stat grid; a
  **Dranbleiben** subsection with the weakness diagnose + next quest as a side-by-side pair (was two
  stacked full-width alert cards); **Was du schon kannst** (Can-Do); Meine Sammlung; and a **Details**
  collapsible that now also holds the writing-weakness + exam-history cards. New `Subheading` helper.
- **Bibliothek/Theorie tiles + filter (founder ran ~10 follow-ups):** (1) **Flippable Karten tiles**
  (`FlipCard.tsx`): Wörter/Kollokationen/Redemittel grid cards flip on click to show the **English on
  the back**; German front. Grammatik cards stay lesson-launchers (not flipped). (2) **Verbunden moved
  to the bottom-right** of Wörter cards. (3) **Redundant tags dropped** from tiles (Häufigkeit + Branche
  on Wörter, Register on Kollokationen, CEFR + Register on Redemittel, CEFR on Grammatik) since they
  duplicate filter facets; the live Lernstand badge stays. (4) **FilterRail rebuilt as a flex column**
  (`FilterRail.tsx`): fixed header + fixed Üben footer + ONE inner scroll region, so the tile is
  strictly viewport-capped and the auto-hiding `.scrollbar-hover` (new, in `index.css`) starts **below**
  the header separator; **pins hidden on the mobile panel**. (5) **"Mehr/Weniger anzeigen"** on facets
  with > 8 options (Redemittel Kategorie, Grammatik Gruppe). (6) **Grammatik Gruppe converted from a
  scope dropdown to a multi-select PILL facet** (`GROUP_FACET`) matching Redemittel Kategorie — both are
  multi-select. (7) **Toolbar row centered when search is closed; opens with a framer slide** (icon
  groups slide apart for the inline search field) across all four browse tabs. (8) The desktop-header
  XP line under the greeting was removed.
- **Gates + verification:** typecheck ✔, lint **0 errors** (42 pre-existing warnings), content-lint ✔,
  `test:unit` **130/130**, build + prerender ✔, `check:bundle` **75.8 kB**/400. Playwright-verified on
  the preview build (0 runtime errors on Praktisch/Theorie Wörter+Grammatik/Fortschritt, desktop +
  mobile): nav rename, dumbbell icon, feedback pill placement (clears the mobile Üben bar), flip-card
  fronts, dropped tags, grammar group pills + "Mehr anzeigen (8)", centered toolbar, Fortschritt groups.
- **Bibliothek follow-ups (same session, second turn):** (a) **all filter-duplicating tile tags
  removed** — the Lernstand/mastery badge off Wörter cards and the group-label subtitle off Grammatik
  cards (only plural + bookmark stay on Wörter); (b) **flip icon removed** from every tile (`FlipHint`
  kept in `FlipCard.tsx` but unused; tiles still flip on click); (c) **filter-rail white items smaller
  on desktop** (`lg:text-xs` + tighter padding on facet pills + scope triggers; mobile tap size kept);
  (d) **graph fit-to-screen now toggles** — first press fits, next press zooms into a random often-used
  word (weighted by wordfreq); (e) **tag audit**: all 1,113 vocab + 741 collocations have valid
  themeId + sectors (0 issues); the untagged majority is universal by design, so no content edits; (f)
  backlog #26 added (`PROJECT_REFERENCE.md`): **Verbs + Articles hubs** in Theorie.
- **NOT done / deferred:** the founder's "reorderable list" phrasing for the filter groups was read as
  the pill-list + Mehr/Weniger presentation; **drag-to-reorder of filter categories was NOT built**
  (no functional purpose for OR-filters, deferred). Standing content follow-ups + Üben map tappable
  stops + sector-audit review remain from prior sessions.

_(Sessions 85-103's handoffs, and the s104 Üben-map round, are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
