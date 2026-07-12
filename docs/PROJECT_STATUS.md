# Project Status

_Last updated: 2026-07-12 (session 97). **Review-queue tooling shipped:** `pnpm review:queue`
dumps `draft` provenance rows grouped by bank/sector/category/group for offline founder review
(`docs/reports/review-queue.md`); current headline is **25/2,132 rows verified (1.2%)**. No
content or app-source changes this session. Detail in the s97 handoff at the bottom. Product
name: **Genauly** (`genauly.de`)._

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

**Handoff after session 97 (2026-07-12). Review-queue tooling shipped (scale-up plan §7.6's
named next step).** `scripts/review-queue.mjs` + `pnpm review:queue`: a read-only dump of
`draft` provenance rows, grouped by content type then by sector (vocab/collocation/text) /
category (Redemittel) / group (grammar) / theme (Can-Do, dialogues, exam sets, writing prompts) /
chapter (missions), written to `docs/reports/review-queue.md`. Mechanical tooling (Haiku-tier per
the plan's model policy), no content or app-source changes.
- **Usage:** `pnpm review:queue` for the full draft queue; scope a session with
  `--type=vocabulary`, `--sector=it,engineering`, `--group=meetings`, or inspect what's already
  verified with `--status=verified|all`. `--dry` prints the console summary only, no report file.
  The headline summary (total rows, verified %) always covers the **whole register**, regardless
  of filters, so a scoped session never loses sight of the overall trust metric.
- **Current headline (unchanged by this session, now visible in one command):** **25 / 2,132 rows
  verified (1.2%)** — only the founder-approved Can-Do bank. Everything from Waves 1–4 (vocab,
  collocations, redemittel, grammar, texts, dialogues, exam sets, writing prompts, missions) is
  still `draft`.
- **Implementation note:** content_id → group lookup is built by cross-referencing the actual bank
  items (not the provenance `notes` free text, which isn't populated consistently across banks);
  grammar drills resolve to their parent topic's `group` field, missions to `chapter`.
- **Verification:** `lint:content` ✔ (unaffected, script is read-only); `typecheck` ✔; `eslint`
  0 errors (pre-existing hook warnings only); `test:unit` 116/116; full unfiltered run completes
  in ~2s and produces the counts matching the s95 handoff exactly (2,132 total / 25 verified /
  2,107 draft).
- **NOT done:** actually running a review pass with the tool (flipping any rows to `verified`) —
  this session shipped the tool only, per the plan's "Next step (first verification session)"
  wording; the review pass itself is the next session's work. Wave-2 tranche 2 and the Playwright
  grammar smoke (carried over from s95) are still open too.
- **Model for the review pass (decided end of s97, next session starts fresh):** this is judgment
  work on German correctness (article/plural, sense-match to the reference, register, CEFR
  plausibility), not mechanical wiring, so it sits in the plan's authoring tier alongside German
  writing, not the Haiku/Sonnet tier this session's tooling used. Recommended **Fable 5** first
  choice, **Opus 4.8** fallback; Fable 5 was unavailable, so the **next session runs on Opus 4.8**.

_(Sessions 85-94's handoffs are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
