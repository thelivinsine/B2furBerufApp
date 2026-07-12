# Project Status

_Last updated: 2026-07-12 (session 100). **Üben UI-refinements round PLANNED, not implemented:** six
founder requests (Üben relevance + speaking "Anzeigen", graph count placement, Üben-map beautification
+ tappable stops, FilterRail desktop redesign, count beside Üben when expanded, Muster/explanation
side by side) explored, designed, and founder-approved as
`docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md` with a per-chunk model map. Zero app-code changes. Detail
in the s100 handoff at the bottom. Product name: **Genauly** (`genauly.de`)._

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

**Content banks (as of 2026-07-12, session 95 — re-verify with `pnpm lint:content` before quoting):**
vocab **1,022** · collocations **701** · Redemittel **149** · grammar **24 topics / 117 drills** ·
Lese-/Hörtexte **26** (78 checks) · Can-Do **37** · provenance **2,132 rows** · themes **15** ·
exam sets **15** · dialogues **20**. All six top-level domains are populated. The `sector` (Branche)
facet is active on Wörter + Kollokationen (11 sectors). Standing governance debt: ~98% of provenance
rows are AI-drafted, not yet human-verified (see `strategy/DATA_GOVERNANCE.md`).

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

**Handoff after session 99 (2026-07-12). Branche filter overhaul PLANNED and approved, NOT
implemented (founder: "save it on the repo", implementation is a follow-up session).** Full plan:
**`docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md`**. The founder reported that common words (e.g.
das Projekt) look tied to a single Branche and demanded a root-cause fix plus missing industries.
- **Root cause diagnosed (verified in code):** `sector?: WorkSector` is single-valued and only
  ~406/1,022 words + 165/701 collocations are tagged; the facet filter is strict, so selecting any
  Branche hides EVERY untagged word (das Projekt has no tag at all) and pins tagged cross-industry
  words (die Wartung, das Werkzeug, der Schichtplan) to exactly one industry. Systemic, not
  per-word. There is also currently NO UI surface showing a word's Branche.
- **Approved design (see the plan for detail):** (1) `sectors?: WorkSector[]` with **untagged =
  universal** semantics (`matchesSector`: untagged shows under every Branche, tagged hides only
  under other Branchen), Branche moves out of the pill facets into a **scope dropdown**, rail
  hierarchy **Branche → Thema → Unterthema** (FilterRail generalized to an ordered `scopes[]`);
  (2) retag audit of all 571 tagged items (1–4 sectors typical, 5+ = untag) with a founder-review
  report `docs/reports/sector-audit-report.md`; (3) **4 new sectors** — `chemicals` (Chemie &
  Kunststoff), `pharma` (Pharma & Medizintechnik), `cleaning` (Reinigung), `security`
  (Sicherheitsdienste), 15 total — plus `transport` relabeled "Transport & Logistik" with a ~10-word
  Lager boost, each new sector with a full ~20-word + ~9-collocation starter pack (founder chose
  all options + full packs via AskUserQuestion); (4) Branche chips on Tabelle/Karten so
  applicability is inspectable; (5) new `tests/sectors.test.ts` + linter `sectors[]` validation +
  E2E checklist (das Projekt visible under IT AND Bau; Bauzaun only under Bau).
- **Freed constraints:** as a scope, Branche escapes the ≤12-option facet cap and the 15% coverage
  floor (which is what makes 15 sectors possible). The linter's frequency check only errors on
  STALE ids, so new words without a Häufigkeit bin don't block if `wordfreq` regen is unavailable.
- **NOT done:** all implementation. Carried over: human `verified` pass via `pnpm review:queue`,
  jury pass extension to Waves 1–2, Wave-2 tranche 2, Playwright grammar smoke.

**Handoff after session 100 (2026-07-12). Üben UI-refinements round: PLANNED AND APPROVED, deliberately
NOT implemented (founder instruction).** Six founder requests explored (3 parallel codebase passes),
designed, and written up as **`docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`**, which the founder approved
verbatim with "don't implement it now". Zero app-source or content changes this session; the plan doc
is the deliverable. Start the next session by picking a chunk from that plan.
- **The six requests (chunk → recommended model, full map in the plan):** (1a) Üben relevance:
  `?grammar=<topicId>` pins the session's grammar pool to the studied lesson, and a new pure
  `libraryFocus` helper translates Bibliothek facets (`?sub/?cefr/?sector`) and the Redemittel
  category (`?cat=`) into the existing mission-style `focus` opt → **Opus 4.8** (composer/SRS-adjacent);
  (1b) speaking block gets the typing block's "Anzeigen" give-up (grades wrong, unlocks Weiter) →
  **Sonnet 5**; (2) graph view: word count moves beside Üben like every view, only "n Verbindungen"
  stays under the canvas → **Sonnet 5**; (4+5) FilterRail desktop: restyle the grey `bg-border` slab
  as a standard `bg-surface shadow-soft` card (muted pills, eyebrow labels) and keep the count beside
  Üben in the footer even when expanded (reset icon moves into a restructured header) → **Sonnet 5**,
  escalate on taste rounds; (6) grammar lesson: Muster + explanation become a 2fr/3fr lg grid →
  **Sonnet 5**; (3) Üben city map: tappable building stops that slide the practice card via the
  existing `goTo` pager + a real beautification pass (two-tone building illustrations, gradient
  ground/parks, tree clusters, stronger route glow, both palettes, no reward-gold) → **Fable 5**
  first choice, **Opus 4.8** fallback.
- **Key code anchors verified this session:** TypingBlock already has "Anzeigen"
  (`SessionPlayer.tsx:846-853`), SpeakingBlock has none; the count jump lives in
  `FilterRail.tsx` L458-465 + the `!open` guard at L509; graph counts in `WordGraph.tsx:575-578`;
  the map stops are not tappable today (`UebenPath.tsx:246-263`, SVG `role="img"`).
- **Constraints folded into the plan:** mission-player/mat/s90 parity untouched, focus-mode
  semantics reused not re-invented, 400 kB bundle unaffected (all touched chunks lazy), all new
  copy em-dash-free.
- **NOT done:** all six chunks (the whole plan); plus the carried-over items: the founder's human
  `verified` pass, extending the AI-jury pass to Waves 1-2, Wave-2 tranche 2 (after the 2026-07-13
  classmate feedback), the Playwright grammar smoke.

_(Sessions 85-98's handoffs are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
