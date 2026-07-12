# Project Status

_Last updated: 2026-07-12 (session 102). **Branche filter overhaul IMPLEMENTED and shipped**
(the founder presents the app 2026-07-13 and named the Branche filter a core demo feature): `sectors[]`
multi-tag with untagged = universal, rail hierarchy Branche → Thema → Unterthema, 15 sectors (4 new,
full packs + Lager boost), 562-item retag audit, Branche chips, tests + E2E. Follows the same-day s101
ship of Üben-refinements item 1 (see its handoff below). Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 101 (2026-07-12). Üben-refinements Work item 1 SHIPPED (Opus 4.8).** The
founder said "go ahead with first point" against `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`. Two
things: Üben is now specific to where the learner is, and the speaking block can be skipped.
- **Üben relevance (engine + wiring):** new composer opt `grammarTopicId` (`engine/session.ts`) pins
  Pool 3 to a studied grammar topic with 4 drills instead of the random topic's 2, and a new exported
  pure helper **`libraryFocus({theme, sub, cefr[], sector[], category})`** translates a browse page's
  narrowed state into the existing mission-style `focus` (lead with those exact items, drop the random
  grammar/Redemittel), returning `undefined` when nothing narrows past the theme (bare-theme Üben is
  unchanged). Caps `FOCUS_VOCAB_CAP=8` / `FOCUS_REDE_CAP=4`. `Session.tsx` parses `?grammar=`/`?cat=`/
  `?sub=`/`?cefr=`/`?sector=` (priority mission > grammar > libraryFocus) and forwards `grammarTopicId`
  through a new `SessionPlayer` prop; the remount key now includes every tailoring param. Callers:
  Grammatik lesson → `?grammar=${topic.id}`, Redemittel → `?cat=` when a category is picked, Wörter +
  Kollokationen `startSession` build the URL from live theme/sub/cefr/sector (pos/srs/frequency stay
  browse-only). GrammarHub stays bare `/session` (browsing is not a location).
- **Speaking give-up:** the speaking block gained an "Anzeigen" ghost button (prompt + typed stages,
  `SessionPlayer.tsx`) that calls the existing `evaluate("")` → reveals the answer, grades FSRS 0
  (never a pass), unlocks Weiter. Mirrors the typed block; no listening-stage button (Fertig already
  routes back).
- **Tests + gates:** 5 new `tests/engine.test.ts` cases (grammar-pin honored, unknown-id fallback,
  `libraryFocus` undefined/sub/category). `pnpm typecheck` ✔, `test:unit` **121/121**, `lint` **0
  errors** (42 pre-existing warnings), `build` + prerender ✔, `check:bundle` **73.0 kB**/400.
- **Grammatik correctness pass (same session, follow-up prompt):** audited `src/data/grammar.ts` (24
  topics / 117 drills). Mechanical completeness clean (explanationDe/purposeDe/pitfalls/pitfallsDe
  present, `pitfalls`/`pitfallsDe` lengths matched for the EnPeek index-swap, every drill has
  explain+gloss, no em dashes, all MCQ answers valid). Read every topic for German correctness; fixed
  4 inaccuracies (a garbled relative-clause EN pitfall, a duplicated "dass" in the Nebensatz EN
  explanation, an awkward Futur `purposeDe`, and a non-idiomatic "discuss about" example gloss).
  `lint:content` ✔, build ✔.
- **NOT done:** Üben-plan Work items 2 (graph count), 3 (map beautify + tappable stops), 4+5
  (FilterRail desktop + count), 6 (Muster/explanation grid); the Branche-overhaul plan (s99); and the
  standing content follow-ups (human `verified` pass, jury Waves 1-2, Wave-2 tranche 2, Playwright
  grammar smoke). Browser E2E walk-through of the tailored sessions is left to the founder (sandbox
  can't reach the live site).

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

_(Sessions 85-100's handoffs are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
