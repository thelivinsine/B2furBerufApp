# Commands — full reference

Read this when you need the detail behind a command; `CLAUDE.md` holds the one-line index.
Package manager is **pnpm** (pinned via `packageManager`; lockfile `pnpm-lock.yaml`). Never use
npm/yarn. Run `pnpm install` after pulling.

## Build & dev
- `pnpm dev` — local dev server.
- `pnpm build` — `tsc -b && vite build && node scripts/prerender-help.mjs`. Run before pushing.
  The prerender step emits static HTML for the public help section (`src/features/help/`) under
  `dist/hilfe/` and regenerates `dist/sitemap.xml`; it needs `dist/index.html`, so it runs after
  `vite build`. `pnpm prerender:help` runs just that step against an existing `dist/`.
- `pnpm typecheck` — `tsc -b --noEmit`.
- `pnpm preview` — preview the production build.
- `pnpm audit` — dependency vulnerabilities (CI/security gate).

## Content gates (CI)
- `pnpm lint:content` — validates every `src/data/*` bank; full checklist in
  `docs/areas/CONTENT.md` §Linter. Run after ANY content edit (TypeScript does not catch
  duplicate ids, which silently drop React-keyed cards). Errors block CI
  (`.github/workflows/validate.yml`). Since s198 it also runs the three **pedagogical-shape
  gates** in `scripts/content-shape.mjs` (worth-learning, CEFR plausibility, part-of-speech mix);
  each is a ratchet anchored on the measured bank, so raising a ceiling is a deliberate edit there
  with a reason, never a way to land content. Detail + the numbers: `CONTENT.md` §The three
  pedagogical-shape gates.
- `pnpm verify:facts` — Layer 2 fact gate: every noun's der/die/das + plural against two
  independent morphology oracles (LanguageTool + German Wiktionary); fails CI only when BOTH agree
  a form is wrong. Runs offline against the committed subsets in `scripts/vendor/`. **After adding
  nouns, run `pnpm build:oracles`** (fetches npm + PyPI) to refresh those subsets, then
  `pnpm verify:facts`. See `docs/strategy/DATA_STRATEGY.md` §3 +
  `docs/reports/verify-facts-report.md`.
- `pnpm verify:grammar` — Layer 3 grammar/spelling: LanguageTool 6.8 over every German sentence in
  the banks, bucketed report → `docs/reports/verify-grammar-report.md`. **Warn-only, NOT a gate**
  (LT over-flags idiomatic B2). LT is ~69 MB (not vendored); run `pnpm build:languagetool` first
  (pinned from Maven Central, then offline). Scheduled monthly via `verify-sentences.yml`.
- `pnpm verify:cefr` — Layer 3 CEFR plausibility heuristic: flags items whose word frequency
  (`wordfreq` Zipf) + sentence complexity are far from the claimed `cefr` facet. Precision-first
  (flags only common-word/advanced-label, vocab only), report →
  `docs/reports/verify-cefr-report.md`. Offline against `scripts/vendor/german-frequency-subset.json`;
  regenerate with `pnpm build:frequency-subset` (needs Python `wordfreq`) after adding
  vocab/collocations. Warn-only. `pnpm verify:sentences` runs grammar + cefr together.

## Generated data
- `pnpm build:verbs-subset` — refreshes `scripts/vendor/german-verbs-subset.json` from the
  `german-verbs-dict` npm package (MIT, from LanguageTool's `german-pos-dict`, CC-BY-SA-4.0). Needs
  the network (npm registry, the one allowed host); the 5.5 MB upstream is never committed, only the
  small subset. Re-run after adding verbs. Prints how many verbs are dictionary-attested vs derived by
  the regular weak paradigm, and any it cannot cover.
- `pnpm build:verb-forms` — regenerates the **generated** `src/data/verbForms.ts` from that subset
  (offline): Partizip II, auxiliary, Präteritum, `separable`, zu-infinitive per vocab id. Verbs get
  their forms from an oracle rather than by hand because a wrong Partizip II teaches a lasting error;
  `source` marks the ones the weak rule produced. The **auxiliary** (haben/sein) is the single
  hand-maintained field, listed with a reason per verb inside the script. `pnpm lint:content` gates
  coverage, so run both after adding a verb.
- `pnpm build:frequency` — regenerates the **generated** `src/data/frequency.ts`: per-item
  Häufigkeit bins (core/common/specialized) from the vendored wordfreq Zipf subset, behind the
  Häufigkeit facet/badge (Wörter + Kollokationen) and the Fortschritt frequency chart. Items with
  Zipf < 1.5 (incl. out-of-corpus compounds) get NO bin on purpose; never label absence of corpus
  evidence "Fachsprache". Run after adding vocab/collocations (after `pnpm build:frequency-subset`);
  `lint:content` errors on stale ids.
- `pnpm build:verification` — Layer C trust model: composes the Layer 2 fact + Layer 3 grammar/CEFR
  results into the **generated** `src/data/verification.ts` (per-item `tier`/`checks`/`confidence`
  keyed by content_id). Reads the `docs/reports/verify-grammar.json` sidecar (run
  `pnpm verify:grammar` first) and recomputes facts/CEFR from the vendored subsets. `/sources`
  shows a tier badge per item; `lint:content` validates the enums + prints the tier distribution.
  Regenerate after re-running the `verify:*` checks. See `docs/strategy/DATA_STRATEGY.md` §4.
  **AI-jury tier:** the `jury` rung ("KI-Jury", confidence 0.9, above `linguistic`, below `human`)
  is fed by the committed sidecar `docs/reports/jury-review.json`, a
  `{ promptVersion, reviewer, pass: [content_id, …] }` record of an AI review pass for German
  correctness. Any listed id with no failing check is elevated to `jury` (unless
  `review_status: "verified"`, which stays `human`). This is an honest **machine** tier and does
  NOT touch `review_status`; only a human flips that (two-loop model in
  `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §7). Append ids as later waves are reviewed, then
  regenerate. Sidecar absent → no item is jury (non-breaking).

## Reports & review loop
- `pnpm report:exercise-coverage` — the Üben exercise-variety gauge. Runs the REAL session builder
  across every theme (all CEFR levels × new/mature decks) and writes a plain-language
  `docs/reports/exercise-coverage-report.md`: distinct exercise types per topic plus the word-level
  residual (words with no self-example → no cloze/typing/listening; no resolvable `related` → no
  odd-one-out). Deterministic (seeded RNG), no gate. Theme-level variety is exhausted when every
  theme is 🟢; the word-level gaps are the remaining CHEAP content polish; the expensive Phase 4
  starts only once those are closed AND learner-repetition/plateau telemetry appears. Re-run after
  content edits.
- `pnpm review:queue` — read-only dump of `draft` provenance rows grouped by bank → sector/
  category/group/theme/chapter, written to `docs/reports/review-queue.md`, for offline founder
  passes (scale-up plan §7.6). Scope with `--type=`, `--sector=`, `--group=` (comma lists) and
  `--status=verified|all`; the headline verified % always covers the whole register. Flips nothing:
  a reviewer edits `review_status: "draft" → "verified"` by hand in `src/data/provenance.ts` after
  checking a row against its `reference`.
- `pnpm stamp:verified` — content-fingerprint gate for human verification: writes a canonical-JSON
  sha256 per `review_status: "verified"` provenance row to `docs/reports/verified-hashes.json`
  (`scripts/stamp-verified-hashes.mjs`; hash helpers shared with the linter in
  `scripts/content-hash.mjs`). `lint:content` FAILS when a verified item's current content no
  longer matches its stamp. **Run right after flipping rows to `verified`** (commit the sidecar
  with the flip); re-stamping is only legitimate after an actual re-review.
- `pnpm apply:reviews` — the review LOOP-CLOSER: applies the founder's review decisions back to the
  repo. **Two input modes.** KEYLESS (the supported path): the founder clicks "Entscheidungen" in
  the /sources workbench to download a decisions file (`buildDecisionExport`/`downloadDecisions` in
  `src/lib/reviewExport.ts`), and a session runs `pnpm apply:reviews --from <file>`
  (`parseDecisionFile`; NO Supabase, NO service-role key). DIRECT-DB (optional, secure local shell
  only): with `SUPABASE_SERVICE_ROLE_KEY` in env it fetches `provenance_reviews` rows with a
  `decision` and null `applied_at` itself. Either way it maps ids through `ID_RENAMES`, recomputes
  each item's fingerprint and compares it with the hash stored AT DECISION TIME (the workbench
  writes it via `src/lib/contentHash.ts` + `src/lib/contentIndex.ts`, byte-compatible with
  `scripts/content-hash.mjs`, pinned by `tests/contentHash.test.ts`), codemods matching approvals
  to `review_status: "verified"` (+ `verified_by`/`verified_date`), then runs `stamp:verified` +
  `lint:content` so flip and stamp land in the SAME commit. Reject/needs_fix rows export to
  `docs/reports/review-defects.md`/`.json` (the AI repair queue). KEYLESS mode has no DB
  write-back: applied state reconciles from the deployed bundle. DIRECT-DB write-back is a
  RECONCILE pass that only marks rows whose verified flip is committed at a clean HEAD: run
  `pnpm apply:reviews --mark-applied` after merging (any later full run also self-heals).
  `--dry-run` classifies + prints, writes nothing. **Integrity rules (do not weaken): a null or
  mismatched decision hash is re-review, never a flip; already-verified repo rows are only ever
  marked applied; never re-stamp to silence a mismatch.** Pinned by `tests/applyReviews.test.ts` +
  `tests/reviewExport.test.ts`.
- `pnpm build:review-queue` — regenerates the admin Review Cockpit's compact
  `src/features/admin/reviewQueue.json` (scoring in `scripts/review-score.mjs`, pinned by
  `tests/reviewScore.test.ts`). Regenerate after content edits.
- `pnpm generate:provenance` — bootstrap a FRESH provenance register only (it overwrites). Add new
  rows manually for incremental additions.
- `pnpm check:refs` — on-demand (no gate): checks that every `reference` URL in
  `src/data/provenance.ts` actually resolves, so "the link is live" claims stay honest
  (`scripts/check-provenance-refs.mjs`). Needs network; run before audits or verification waves.
- `pnpm build:dict-subset` / `pnpm build:nouns-subset` — internals of `pnpm build:oracles` (the
  LanguageTool + Wiktionary morphology subsets under `scripts/vendor/`); run via `build:oracles`,
  not directly.

## Code gates (CI)
- `pnpm test:srs` — asserts `engine/srs.ts` against FSRS golden vectors from py-fsrs. **Run after
  any `engine/srs.ts` edit.** Vector provenance in the `scripts/test-srs.mjs` header.
- `pnpm test:pronounce` — asserts the `engine/pronounce.ts` spoken/typed answer matcher. **Run
  after any `engine/pronounce.ts` edit.**
- `pnpm lint` — ESLint. Errors block; the compiler-era react-hooks rules are deliberate warnings
  (visible debt), don't silence them wholesale.
- `pnpm test:unit` — Vitest smoke suite in `tests/`: stores, session composer, search, paged-list +
  debounce contracts, and the per-feature pins referenced throughout the area docs. Extend it when
  touching those areas.
- `pnpm lint:migrations` — idempotency gate for `supabase/migrations/*.sql` (DB audit R6, s185).
  `supabase.yml` applies migrations with `db push --include-all`, so any file the remote history
  does not record is re-applied wherever its number sits. The script parses each statement (after
  stripping comments, string literals and dollar-quoted function bodies) and fails on `create
  table/index/extension/sequence` without `if not exists`, `add column` without `if not exists`,
  `create function` without `or replace`, a `create policy`/`create trigger` with no matching
  `drop … if exists` earlier in the same file, and `insert` without `on conflict`. Files numbered
  ≤ `LEGACY_THROUGH` (0014) predate the gate and are already recorded remotely, so they are exempt.
  **Never raise that baseline to silence a new file; fix the file.** The cost of a miss is high:
  the migration step runs BEFORE the Edge Function deploys in the same workflow, so one bad
  statement blocks every backend deploy behind it.
- `pnpm check:contrast` — WCAG contrast gate for the brand token system: parses the `:root` and
  `.dark` HSL custom properties out of `src/index.css` and fails CI on contrast regressions
  (`scripts/check-contrast.mjs`). **Run after any change to the theme tokens in `src/index.css`.**
- `pnpm check:bundle` — main-chunk size budget, 400 kB (run after `pnpm build`). If a feature
  legitimately needs more, raise the budget in `scripts/check-bundle-size.mjs` in the same PR and
  say why. **Keep eager code light:** the Dashboard imports NO content bank (main chunk ~75 kB);
  its Spielen tab lazy-loads `SpielenHub`, `GlobalSearch` imports `lib/search` dynamically. Never
  re-introduce a static import chain from eager code to any content bank; a new Dashboard element
  needing bank data belongs in a lazy chunk (SpielenHub, UebenPath).

## Supply chain
`.npmrc` sets `minimum-release-age` (24h cooldown) and `package-manager-strict`. pnpm blocks
dependency build scripts by default; the build does NOT need any allowlisted scripts — keep it
that way.
