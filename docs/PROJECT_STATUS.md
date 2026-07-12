# Project Status

_Last updated: 2026-07-12 (session 99). **Branche filter overhaul PLANNED, not implemented:**
founder-approved plan saved to `docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md` (root-cause fix for
common words vanishing under Branche filters via `sectors[]` multi-tagging with untagged =
universal, dropdown hierarchy Branche → Thema → Unterthema, 4 new sectors + Logistik boost with
full starter packs, retag audit + verification). Plan-only session, no code/content changes.
Detail in the s99 handoff at the bottom. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 98 (2026-07-12). First AI-jury review pass EXECUTED (scale-up plan §7),
Opus 4.8.** The founder chose (via AskUserQuestion) to record the review as the honest machine-layer
**`jury` tier**, NOT to flip `review_status` (on `/sources`, `review_status: "verified"` reads as
"menschlich geprüft / human-verified", so an AI must not set it). Scope: Wave 3 Redemittel + Wave 4
grammar.
- **Reviewed 149 ids for German correctness** (grammar, spelling, article/plural, sense-match to the
  English gloss, register + CEFR plausibility): 65 Redemittel (telephoning/emails/presentations/
  jobInterview/smallTalk) + 14 grammar topics + 70 drills. Redemittel were **65/65 clean**; grammar
  had **4 real defects, all fixed** in `src/data/grammar.ts`: (1) Genitiv pitfalls contained literal
  `**s**` markdown that renders as visible asterisks (pitfalls are plain-text `<span>`, no markdown);
  (2) Infinitivsätze pitfall #3 EN was about modals while the German was about commas — the `EnPeek`
  swaps the list DE↔EN by index, so they must match; (3) Vergleichssätze drill d5 modeled `als ob` +
  indicative, contradicting the topic's own Konjunktiv-II rule; (4) brauchen+zu drill d5 had a doubled
  "nur" (the explain even apologized for it).
- **Mechanism (new, honest, reproducible):** a committed sidecar `docs/reports/jury-review.json`
  (`{ promptVersion, reviewer, pass: [content_id…] }`) lists the passed ids; `scripts/build-verification.mjs`
  reads it and elevates each (no failing check, not already `human`) to the **`jury`** tier
  (confidence 0.9, "KI-Jury/AI jury" badge on `/sources`, above `linguistic`, below `human`).
  `verification.ts` stays fully generated (never hand-edited); append ids + regenerate for later waves.
  `Sources.tsx` tier-summary list got `"jury"` added so the 149 show in the breakdown.
- **Pipeline (all green):** `build:verification` → tiers **human 25 · jury 149 · linguistic 1831 ·
  facts 1 · provenance 126**; `lint:content` ✔ (validates jury enum + prints distribution);
  `verify:facts` **0 two-oracle errors**; `typecheck` ✔; `test:unit` **116/116**; `build` + prerender
  ✔; `check:bundle` **73.0 kB**/400. No content-bank counts changed (edits were fixes, not additions);
  `review_status` unchanged, so headline **verified % stays 25/2,132 = 1.2%** (the human loop is still
  the founder's to run).
- **NOT done / follow-up:** the human `verified` pass (founder flips real rows via `pnpm review:queue`);
  extend the jury pass to Waves 1–2 vocab/collocations + texts (append to the sidecar); Wave-2 tranche 2
  (care/trades/retail/hospitality/transport/beauty/sports) after 2026-07-13 classmate feedback; the
  Playwright grammar-lesson smoke (carried over).

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

_(Sessions 85-97's handoffs are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
