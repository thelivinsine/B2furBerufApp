# Project Status

_Last updated: 2026-07-12 (session 103). **Üben-refinements Work items 2, 4+5, 6 SHIPPED** (Sonnet 5):
graph word count moved beside Üben, FilterRail restyled as a standard content card with the count
always beside Üben, grammar lesson Muster/explanation side by side on desktop. Follows the same-day
s102 Branche filter overhaul ship (see its handoff below). Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 102 (2026-07-12). Branche filter overhaul IMPLEMENTED and shipped (plan
`docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md`, approved s99), Fable 5.** Context: the founder presents
the app to an audience 2026-07-13 and named the Branche filter a core demo feature, so the deferred
plan was executed same-day and merged to `main`.
- **Data model:** `sector?: WorkSector` → `sectors?: WorkSector[]` on VocabItem/Collocation/ReadingText
  (mechanical migration of all 575 tagged rows); `WorkSector` extended to **15** (`chemicals`, `pharma`,
  `cleaning`, `security`; `transport` relabeled "Transport & Logistik"); linter validates `sectors[]`
  (non-empty, unique, enum) and ERRORS on the retired singular `sector`. `vocabulary.ts` is now two
  concatenated literals (`vocabularyPart1/2`, TS2590 limit, same split as provenance s95).
- **Root-cause fix:** `matchesSector` in `lib/facets.ts` (untagged = universal: general words show
  under EVERY Branche; tagged hide only under other Branchen), applied as a scope cut in
  VocabularyTrainer + CollocationsBrowser with **sector-first ordering** (Fachwörter lead, general
  follow). Branche left the pill facets (no ≤12 cap, no coverage floor); `?sector=` is a single-value
  scope param (old comma-list URLs degrade to first value).
- **FilterRail** generalized from `primary`/`secondary` to an ordered **`scopes: RailPrimary[]`**
  (stable `pinId` per scope keeps saved pins); Wörter/Kollokationen pass [Branche, Thema, Unterthema?],
  Redemittel/Grammatik unchanged. Branche dropdown shows per-sector dedicated-content counts within
  the current Thema scope. **Branche chips** (`features/shared/SectorChips.tsx`) on Wörter
  Tabelle/Karten + Kollokationen Tabelle (sortable column; untagged shows nothing = general).
- **Retag audit of all 562 tagged items** (393 words, 165 collocations, 4 texts): **117 untagged**
  (shift vocabulary, PPE basics, everyday/general German: das Werkzeug, die Schicht, der Führerschein),
  **162 widened** to 2-4 sectors (die Wartung → production+trades+engineering+chemicals), **279
  confirmed**. Founder-review artifact: `docs/reports/sector-audit-report.md` (old → new + rationale
  per item, grouped by decision).
- **New content:** ~20-word packs for chemicals/pharma/cleaning/security + ~9 collocations each, a
  10-word + 4-pair Lager boost (5 existing warehouse words tagged transport). Banks now **1,113 words /
  741 collocations / 2,263 provenance rows** (all new rows `draft` with DWDS references).
- **Gates all green:** lint:content ✔, typecheck ✔, lint 0 errors, **test:unit 124/124** (new
  `tests/sectors.test.ts` pins matchesSector semantics, sector-first sort, and the v_projekt/v_bauzaun
  regression pair), build + prerender ✔, bundle **73.0 kB**/400, `build:oracles` + `verify:facts` **0
  two-oracle errors** (new nouns verified). **E2E in-browser (Playwright, dev server):** das Projekt
  visible under IT AND Bau, der Bauzaun only under Bau, new sectors list their packs, `?sector=`
  round-trips, mobile filter panel intact.
- **NOT done / follow-up:** `pnpm build:frequency-subset` + `build:frequency` for the ~91 new words
  (needs Python `wordfreq`; absent bins are fine, linter only errors on stale ids); founder review of
  `sector-audit-report.md`; the human `verified` pass via `pnpm review:queue`; jury-pass extension to
  Waves 1-2; Wave-2 tranche 2 after the 2026-07-13 classmate feedback; Playwright grammar smoke.

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

_(Sessions 85-101's handoffs are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
