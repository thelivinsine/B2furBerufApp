# Project Status

_Last updated: 2026-07-12 (session 95). **Bibliothek scale-up Waves 2–4 executed and MERGED (PR #463).**
Wave 2 deepened engineering/it/construction/production (~60 words + ~26 collocations each + one sector
reading text; `ReadingText.sector` added), Wave 3 grew Redemittel to **149** across 5 new speech-act
categories, Wave 4 completed the B1–B2 grammar canon to **24 topics / 117 drills**. Full pipeline green.
Detail in the s95 handoff at the bottom. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 94 (2026-07-12). Bibliothek scale-up Wave 1: the Branche (sector) axis is
ACTIVE.** The founder presents Genauly to German-course classmates from all major professional sectors
on 2026-07-13 and wants the Bibliothek to be their single source of truth after the course; this
**un-parks the sector facet** (founder decision 2026-07-12, superseding the 2026-07-09 audit's park;
recorded in `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §1 and `DECISIONS.md`).
- **Taxonomy:** `WorkSector` 5 → **11 values** (`+engineering`, `+construction`, `+production`,
  `+transport`, `+beauty`, `+sports`), mirrored in `lint-content.mjs`; labels in `facets.ts`
  (`SECTOR_OPTIONS`, care relabelled "Medizin & Pflege", hospitality "Gastronomie"); a sector facet was
  added to `COLLOCATION_FACETS` (vocab already had one). Rule kept: Branche = where you work, Thema =
  what you are doing; `transport` deliberately not named "Logistik" (theme-label clash).
- **Content Wave 1 (even spread, founder choice):** **+220 vocab** (20/sector, care extends the s43
  Pflege pack) and **+96 collocations** authored + 3 existing tagged, all with `cefr` + `sector` + full
  schema, spread across existing themes (care-pack pattern). Coverage cleared the 15% floor, so the
  **Branche facet renders on Wörter AND Kollokationen automatically** (11 pill options, `?sector=`).
  **+12 Redemittel** in the new sector-neutral `professionalIntro` category ("Über Beruf & Fachgebiet
  sprechen", Briefcase icon added to `lib/icons.ts`). **+328 provenance rows** (DWDS references, draft).
- **Verification (all green):** `lint:content` ✔; `build:oracles` refreshed → `verify:facts` **0
  two-oracle errors**; wordfreq installed → `build:frequency-subset` + `build:frequency` regenerated;
  LanguageTool resolved → `verify:grammar` **0 grammar flags**; `verify:cefr` + `build:verification`
  regenerated; typecheck, ESLint 0 errors, `test:unit` 116/116, build + prerender, `check:bundle`
  **73.0 kB**/400.
- **Strategy doc:** `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` — the 11-sector taxonomy, Waves 2–4,
  the per-wave quality gate, and the floor math.
- **NOT done / follow-up candidates:** all 328 new provenance rows are `draft` (founder/native review
  pass pending); sector `ReadingText`s were Wave 2; Wave 2 prioritization waits on classmate feedback
  after the 2026-07-13 presentation.

**Handoff after session 95 (2026-07-12). Scale-up Waves 2–4 EXECUTED and MERGED to `main`
(PR #463, squash; the founder reviewed the staged draft PR and gave the merge go-ahead).** One
wave per commit on the branch (b1c0766 W2, 8c0df08 W3, 2bfb57f W4 + docs commits). The approved plan
(with model policy: Fable 5 for German authoring, Sonnet 5 wiring, Haiku 4.5 mechanics) is folded into
`docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §0/§4–6.
- **Wave 2 (first tranche, feedback-driven default order):** engineering, it, construction,
  production each +40 vocab (to ~60), +17/16 collocations (to ~26), +1 sector `ReadingText`
  (Wartungsprotokoll memo · Sprint-Review email · Baustellenordnung announcement · Schichtplan
  voicemail, one per `kind`). Schema: **`ReadingText.sector`** added (validate-when-present).
  Banks: vocab 862 → **1,022**, collocations 636 → **701**, texts 22 → **26**.
- **Wave 3 (Redemittel phrasebook):** +5 sector-neutral categories (telephoning, emails,
  presentations, jobInterview, smallTalk; icons Phone/Mail/Presentation/UserCheck/Coffee),
  13 phrases each with cefr/register/example. Redemittel 84 → **149**.
- **Wave 4 (grammar canon):** +14 German-first topics on the B2-marker spine across **6 new
  groups** (nouns, attributes, reportedSpeech, wordFormation, infinitives, future): indirekte
  Rede, zweiteilige Konnektoren, Infinitivsätze, Finalsätze, Temporalsätze, Vergleichssätze,
  Partizipialattribute, Genitiv, n-Deklination, Nominalisierung, lassen, brauchen + zu,
  Futur I/II Vermutung, es-Konstruktionen. Grammar 10 → **24 topics / 117 drills**. The s93
  lesson page absorbed everything via `grammarMeta.ts` (`groupOrder` extended).
- **Provenance:** +378 rows (Waves 2–4), register 1,754 → **2,132**, all new rows `draft`.
  **`provenance.ts` is now two concatenated literals** (`provenancePart1/2`): a single 2,000+ row
  array literal exceeds TS2590; append to the second literal (script pattern unchanged).
- **Pipeline (all green):** lint:content clean; `build:oracles` → `verify:facts` **0 two-oracle
  errors** (781 noun lemmas); frequency subset + bins regenerated; `verify:grammar` **0
  grammar/agreement flags**; `verify:cefr` + `build:verification` (linguistic tier 1602 → **1,896**);
  typecheck, ESLint 0 errors, `test:unit` 116/116, build + prerender, `check:bundle` **73.0 kB**/400;
  floor smoke: Branche renders on Wörter AND Kollokationen, spine 24/24.
- **NOT done / follow-up:** the first verification session (build `scripts/review-queue.mjs` +
  `pnpm review:queue`, flip reviewed items draft → verified; all 2,107 non-Can-Do rows are still
  `draft`); Wave-2 tranche 2 (care, trades, retail, hospitality, transport, beauty, sports) after
  classmate feedback from the 2026-07-13 presentation; a Playwright smoke of one new grammar
  lesson in a real browser.

_(Sessions 85-93's handoffs are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
