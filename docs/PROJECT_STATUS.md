# Project Status

_Last updated: 2026-07-12 (session 98). **First AI-jury review pass (scale-up plan §7):** 149 ids
(Wave 3 Redemittel + Wave 4 grammar) reviewed for German correctness and elevated to the honest
machine-layer **`jury` tier** ("KI-Jury" badge on `/sources`) via the new committed sidecar
`docs/reports/jury-review.json`; 4 grammar defects found and fixed. `review_status` untouched, so
human-verified headline stays **25/2,132 = 1.2%**. Detail in the s98 handoff at the bottom. Product
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

_(Sessions 85-95's handoffs are in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The
shipped-architecture, locked-decisions, and completed-setup sections that used to live here moved to
`docs/PROJECT_FOUNDATION.md` in s95.)_
