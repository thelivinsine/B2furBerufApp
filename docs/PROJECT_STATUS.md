# Project Status

_Last updated: 2026-07-13 (session 106, Üben-map pin polish + toggle/heading layout-shift fix, Sonnet
5). **SHIPPED:** the Üben-map "Du bist hier" pin's oversized pulse ring/chip were shrunk to match the
small pin glyph, and the pin recolored to a dedicated red (was route indigo); the Heute Üben/Spielen
toggle and each panel's own heading no longer jump vertically on desktop when switching tabs (a
`justify-center`d stack was reacting to the two panels' differing natural heights). Prior session
(105): nav renamed "Heute"->**Praktisch** / "Bibliothek"->**Theorie**, **Anwenden hidden** from the
nav; a subtle **"Mit KI gebaut · Feedback"** pill on every page that emails the founder via a new
`submit-feedback` Edge Function (founder deploy + `RESEND_API_KEY` needed, see `PHASE2_SETUP.md`); the
**Fortschritt page was redesigned** into calm groups; and a **Theorie tiles/filter** round: flippable
Karten tiles (EN on the back), redundant tile tags removed, FilterRail rebuilt as a viewport-capped
flex column with an auto-hiding scrollbar, Mehr/Weniger on long facets, Grammatik Gruppe as a
multi-select pill facet, and a centered toolbar that slides open for search. Product name: **Genauly**
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

**Handoff after session 106 (2026-07-13). Üben-map pin polish: sizing/color fix + a toggle/heading
layout-shift bug (Sonnet 5), shipped straight from two founder screenshots/reports on branch
`claude/pin-sizing-color-6lofhi`, merged to `main`.**
- **"Du bist hier" pin (`UebenPath.tsx`):** the pulse ring (r 12→8, stroke 2→1.5) and the chip
  (`px-3 py-1 text-[11px]` → `px-2 py-0.5 text-[9px]`) were oversized relative to the small pin glyph;
  both shrunk to hug it. The pin (and its pulse ring) switched from the route indigo to a dedicated
  red (`PIN_COLOR = "#e5484d"`) per founder request, so the live-location marker reads distinctly from
  the indigo journey line; the pin's white inner ring/dot are unchanged.
- **Heute toggle/heading layout-shift bug (`Dashboard.tsx`):** on desktop the Üben/Spielen toggle sits
  above the tab content inside a `justify-center`d flex column, and the two panels render at different
  natural heights (Üben ~581px, Spielen ~607px), so the whole stack's centered position — and thus the
  toggle's screen position — shifted on every Üben ↔ Spielen switch. Diagnosed with a headless
  Playwright probe against the dev server (bypassing onboarding via a seeded `b2beruf.settings.v1`
  localStorage key): the toggle moved ~13px and both panels' own `<h1>` moved with it on every switch
  (confirmed before/after with real bounding-box measurements, not just code reading). Fix: the sliding
  content wrapper now reserves the taller panel's height (`lg:min-h-[38rem]`, Spielen's ~607px) so the
  toggle+content stack's total height — and therefore its `justify-center`d position — stays constant
  regardless of which tab is active. Mobile was already unaffected (normal document flow, not
  flex-centered).
- **Gates:** typecheck ✔, lint 0 errors (pre-existing warnings only), `pnpm build` + prerender ✔,
  `check:bundle` **76.9 kB**/400. Browser-verified with Playwright against the dev server at mobile
  (390×844) and multiple desktop widths (1024–1920px): toggle and heading now sit at identical
  bounding-box coordinates before/after every tab switch.
- **Shipped:** PR opened and squash-merged into `main` (was previously only on the feature branch;
  per this repo's rule, feature-branch pushes never go live on their own).
- **NOT done:** no other follow-up requested this session; standing content/Üben-map follow-ups from
  prior sessions (human `verified` pass, jury Waves, sector-audit review) remain untouched.

_(Sessions 85-103's handoffs, and the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
