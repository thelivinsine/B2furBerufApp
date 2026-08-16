# Session & Prompt Log — Archive 2026-W32 (2026-08-03 to 2026-08-09)

_Weekly archive slice of the append-only prompt log (ISO week 2026-W32). The maintenance rule and
entry template live in the live log `docs/SESSION_PROMPT_LOG.md`; the index of weekly files is
`docs/archive/prompt-log/README.md`. Left as written (append-only history)._

## Session 184 (2026-08-03) - branch `claude/berufswelt-alltag-filter-pills-bpguv0`

- **Prompt 1 (verbatim, 2026-08-03):** `I want a clear Berufswelt and Alltag pills in each and every
  filter or aufgabe rail through out the app right below the Branchen filter. Implement it cleanly
  and make sure everything works coherently with this.`
  **Response:** asked ONE question first, because it was the founder's to make and it changed the
  scope: the app's locked word for the work side is **Berufsleben** (s181 pick, used by the graph
  legend, every Thema dropdown heading and the Schreiben rail), and the prompt said "Berufswelt".
  Keeping Berufsleben meant a purely additive change; renaming meant an app-wide rename in the same
  PR. Founder chose **keep "Berufsleben"**, so nothing was renamed.
  Then shipped the pills as ONE shared control, `src/features/shared/LifeAreaPills.tsx`, in four
  rails on both breakpoints: Wörter, Kollokationen, Redemittel (Bibliothek `FilterRail`, desktop rail
  + mobile panel) and the Schreiben Kurz/Lang "Aufgabe wählen" rail. **Grammatik is the one
  deliberate exception** and is flagged as such: grammar topics carry no `themeId`, so a life-area
  filter there would be dead chrome rather than a filter.
  Key decisions (full record in `docs/DECISIONS.md` §s184): the RAIL owns the slot (an `area` prop on
  `FilterRail`, inserted after the `sector` scope, or first on a tab with no Branche dropdown), so
  "right below the Branchen filter" cannot drift per surface; single-select that toggles off with no
  third "Alle" pill; picking an area narrows the Thema dropdown AND drops a Thema from the other
  area, so pill/dropdown/list can never disagree; counts are computed before Thema/search/facets so
  the other pill never goes dead the moment a Thema is picked; `area` became a HARD, coarsest axis in
  `lib/writingScope.ts` (the two areas partition the task pool exactly) with `blockingAxis` gaining
  `area` for the stale-deep-link case; Redemittel passes `disableZero: false` because untagged is
  universal there. The one visual correction during the round: an equal-width 2-column pill grid
  truncated "Berufsleben" against a four-digit count in the 16rem desktop rail, so the pills use the
  content-sized wrapping facet-pill layout the same tile already uses two sections below.
  Verified in a headless browser on both rails: picking Berufsleben over a selected `theme=arzt`
  rewrites the URL to `?area=professional` with the Thema back to "Alle Themen", the Thema dropdown
  then lists exactly one heading (BERUFSLEBEN), toggling the same pill returns to beides, the pin +
  collapse path keeps the pills visible, and both rails' reset icons clear `?area=`.
  Gates: `pnpm typecheck` · `pnpm lint` (0 errors) · `pnpm lint:content` · `pnpm test:unit`
  **506 passed** (10 new, in `tests/lifeAreas.test.ts` and `tests/writingScope.test.ts`) ·
  `pnpm build` · `pnpm check:bundle` (123.1 kB / 400 kB) all green.
- **Artifacts (prompt 1):** `src/features/shared/LifeAreaPills.tsx` (new) ·
  `src/features/shared/FilterRail.tsx` · `src/lib/lifeAreas.ts` · `src/lib/themeGroups.ts` ·
  `src/lib/writingScope.ts` · `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` ·
  `src/features/redemittel/RedemittelTrainer.tsx` · `src/features/writing/WritingRail.tsx` ·
  `src/features/writing/GuidedWritingTrainer.tsx` · `tests/lifeAreas.test.ts` ·
  `tests/writingScope.test.ts` · `CLAUDE.md` · `docs/areas/BIBLIOTHEK.md` ·
  `docs/areas/SCHREIBEN.md` · `docs/DECISIONS.md` · `.claude/skills/design/SKILL.md` ·
  `docs/PROJECT_STATUS.md` · this log
- **Prompt 2 (verbatim, 2026-08-03):** `document the session`
  **Response:** the bulk of the session record had already gone out INSIDE PR #782 (the doc rule is
  to update `CLAUDE.md` and the matching `docs/areas/*` in the same PR as the change), so this pass
  closed what only existed after the merge, plus one gap the first pass left.
  (1) **The s184 handoff had no shipped line**, because it was written before the PR existed. It now
  records PR **#782**, squash-merge `c612a5d`, both workflows green on the merge commit
  (`Validate content` and `Deploy site to GitHub Pages` run 788), and the completed post-merge
  housekeeping.
  (2) **The handoff now states what was deliberately NOT touched**, so the next session does not
  read those as misses: Grammatik (topics carry no `themeId`), Sammlung (a Lv 1-5 chip row, not a
  scope rail), the Fokus grammar dials (form controls, not a content scope), and `libraryFocus`.
  (3) **`docs/areas/SESSION.md` was the one stale doc the first pass missed.** It lists the params
  `libraryFocus` maps onto a session focus, so a reader would reasonably expect `?area=` to have
  joined them. It has not, and the file now says why: Bibliothek Üben hands the session its
  already-filtered ids (`?src=lib`), which outranks every tailoring path, so the Lebensbereich
  narrowing rides along by construction; `libraryFocus` only serves hand-built `/session?…` links,
  which no surface in the app writes.
  Also confirmed the Supabase workflow did not run on this merge (it is scoped to `supabase/**`, and
  nothing in that tree changed), so there is no backend deploy to report.
  Gates: docs-only (no app code touched).
- **Artifacts (prompt 2):** `docs/PROJECT_STATUS.md` · `docs/areas/SESSION.md` · this log. Shipped as PR **#783**, squash-merged `f3b4395`.
- **Prompt 3 (verbatim, 2026-08-03):** `document the session`
  **Response:** the same instruction a second time, so this pass looked for what the prompt-2 pass
  could not have covered rather than restating it. Two things, one of them a gap s184's own code
  created.
  (1) **`CLAUDE.md`'s layout index had gone stale in two places.** The `shared/` list did not name
  `LifeAreaPills`, although s184 had just made it a control on four surfaces, and the `lib/` list has
  never named `lifeAreas.ts` (added in s181 without being indexed) or `themeGroups.ts`. Both are
  listed now. The index is how a fresh session finds the module that owns a rule, so a law-bearing
  module missing from it is the kind of omission that gets the rule re-implemented somewhere else.
  (2) **The shipped lines for the documentation PRs themselves.** Prompt 2's entry was written before
  its PR existed, so it recorded no PR number; it now carries **#783** (`f3b4395`), and the s184
  handoff in `PROJECT_STATUS.md` names #783 and #784 alongside #782, so the session's three merges
  are traceable from the handoff alone.
  Re-audited the rest and found nothing further stale: `docs/PROJECT_FOUNDATION.md` describes
  architecture and infra, neither of which moved; `docs/areas/COMMANDS.md` gained no script;
  `docs/areas/CONTENT.md` saw no bank change (s184 shipped zero content edits); `PROJECT_REFERENCE.md`
  backlog is untouched, with the queued writing-task quality audit still the next TODO.
  Gates: docs-only (no app code touched).
- **Artifacts (prompt 3):** `CLAUDE.md` · `docs/PROJECT_STATUS.md` · this log

## Session 185a — the content-audit backlog, minus P10 (branch `claude/content-analysis-actions-jm55sw`)

_Ran in parallel with the database-architecture session below; both landed 2026-08-04._

- **Prompt 1 (verbatim, 2026-08-04):** `what's left in the content analysis actions?`
  **Response:** read `docs/reports/CONTENT_AUDIT_2026-07-30.md` §5 and reported the state of the
  11-item backlog: 5 closed (P0/P1/P2 in s178, P8 in s181, P6 in s182), 3 half-done (P3 texts, P4
  level-3 depth, P5 B2/C1 drills), 3 untouched (P7, P9, P10). Flagged that the audit's own text was
  stale on P4's mobile-entry half, which s182 had already settled. Recommended P5 then P7 as the best
  value per effort. No code touched.
- **Artifacts (prompt 1):** none (analysis in chat).

- **Prompt 2 (verbatim, 2026-08-04):** `go ahead with all the items except for the p10`
  **Response:** shipped P9, P7, P5 and P4 in full, and P3 except for one UI step that needs a founder
  pick. Five commits on the session branch:
  (1) **P9 — `c7408c4`.** Every noun now declares `plural` or `numerus` (`uncountable` /
  `pluralOnly`); 329 nouns had neither, so "unauthored" and "nothing to author" rendered identically.
  49 got a real plural, 257 a numerus, classified BY HAND because both oracles attest "Stresse",
  "Supporte", "Benzine" and "Konsense" and a generated backfill would have taught all four. The `pron`
  respelling was two schemes split by authoring wave (`der Reisepass` shipped both); standardised on
  the one that reads correctly in English, 135 strings converted, `checkPron` gates it. The duplicate
  and two-correct-MCQ halves of P9 were already closed in s178.
  (2) **P7 — `97ea3bf`.** 108 items re-levelled: 10 FLAG connectors off C1/B2.2, 98 of 105 WATCH down
  to B1. Bands A2 13 · B1.1 147 · B1.2 482 · B2.1 690 · B2.2 382 · C1 29; verify:cefr FLAG 10 → 0.
  The "freeze B2.2 compounds" half is a linter ratchet at 334, not a note.
  (3) **P5 — `6ef53c5`.** 125 drills: 107 across the 21 B2/C1 topics (which had ZERO productive
  drills between them) and 18 bringing the last 7 B1 topics to 10. Bank 195 → 320 drills, productive
  19% → 33%, gated per topic.
  (4) **P4 — `dca9f05`.** Six level-3 scenarios (customer, project, safety · behoerde, wohnen, arzt),
  so the ladder is 13/15/8 instead of 13/15/2 and the Alltag half has hard practice for the first
  time. Appended, not prepended, because "Empfohlen" is the first unfinished item in array order.
  (5) **P3 — `d9db84e`.** Eight exam-length B2 texts (288-333 words), chosen so every domain has at
  least two; gesundheit and bildung had none. All 6 voicemails carry `notes` fields for a Notizen
  task.
  **Deliberately not shipped, and why:** the Notizen STEP is a new UI section, and the design law is
  previews first with a founder pick, so three variants went to `preview/notizen-varianten.html`
  (artifact published) and the field is authored data until that pick lands. The 12 human-verified
  rows that P9's two new rules touch were left alone: editing one breaks the content fingerprint its
  `verified` stamp is tied to and only a human may re-verify, so the linter warns rather than errors
  on them. P7's "spend the next 200 items on core words" clause became a standing authoring rule.
  Gates: `pnpm lint:content` clean · `pnpm build` green · `pnpm test:unit` 533 passing ·
  `pnpm verify:facts` 0 gate errors · `pnpm check:bundle` 123 kB of 400 kB.
  One test fixture was rewritten rather than patched: the composer's listening test scoped to
  logistics because that theme's only text WAS a voicemail, which the new logistics text falsified.
  It now finds a voicemail's theme from the bank itself.
- **Artifacts (prompt 2):** `src/data/vocabulary.ts` · `src/data/grammar.ts` · `src/data/dialogues.ts`
  · `src/data/texts.ts` · `src/data/provenance.ts` · `src/types/index.ts` · `src/engine/quiz.ts` ·
  `src/features/vocabulary/pluralLabel.ts` (new) · `src/features/vocabulary/VocabList.tsx` ·
  `src/features/vocabulary/VocabViews.tsx` · `scripts/lint-content.mjs` · `scripts/verify-facts.mjs` ·
  `tests/grammar.test.ts` · `tests/engine.test.ts` · `preview/notizen-varianten.html` (new) ·
  `docs/areas/CONTENT.md` · `docs/reports/CONTENT_AUDIT_2026-07-30.md` · `docs/PROJECT_STATUS.md` ·
  this log. Commits `c7408c4`, `97ea3bf`, `6ef53c5`, `dca9f05`, `d9db84e`.

- **Prompt 3 (verbatim, 2026-08-04):** `i like variant a for notizen. implement it and merge everything to main`
  **Response:** implemented variant A in `ReadingBlock` (the Notizen sheet sits between the audio and
  the comprehension checks, and only while the text is actually being listened to, since noting a
  visible text is copying). Verified the LIVE component against the approved preview by rendering the
  real component and screenshotting it with the built CSS, rather than eyeballing a mockup.
- **Prompt 4 (verbatim, mid-turn, 2026-08-04):** `the fields to write are too small and the audio button tile is way too big. Also, it looks like there are way too many rectagles overall. update the design to adapt for these comments`
  **Response:** three points, three changes. (1) Write fields 36px boxed inputs → **44px ruled lines**
  with 15px text. (2) The play control was a 64px circle centred in a card of its own, ~250px tall for
  the screen's least content; it is a **40px button on the title row** and the card collapses to that
  row, ~72px. (3) Rectangle count went from ten (badge row, white card, accent rail, five input boxes,
  CTA) to **four**, because ruled lines removed five boxes at once and "Text anzeigen" became a quiet
  link instead of a ghost button.
- **Prompt 5 (verbatim, mid-turn, 2026-08-04):** `keep the buttons' position and the tile sizes intact before and after vergleichen. swap the colors of the tiles. do these changes and proceed to implement. rest all looks good.`
  **Response:** (1) Both states are now one 44px row (`min-h-11` + centred on the revealed side), so
  the sheet keeps its height and the button underneath does not move. The twelve note values that ran
  past one line were shortened to real note length ("Rückflug Do. gestrichen", not "Der Rückflug am
  Donnerstag wurde gestrichen"), which is both better content and what keeps the rows single-line.
  (2) Tile colours swapped: the message tile carries the Himmelblau fill, the Notizen sheet is white,
  and the play button became a white circle so it pops on the accent fill. Final render published from
  the real component: `preview/notizen-a-r2.html`.
  Gates: lint 0 errors · content lint clean · 533 tests · build green · bundle 123 kB of 400 kB.
- **Artifacts (prompts 3-5):** `src/features/session/ReadingBlock.tsx` · `src/data/texts.ts` ·
  `preview/notizen-a-r2.html` (new) · `docs/areas/CONTENT.md` · `docs/PROJECT_STATUS.md` ·
  `docs/reports/CONTENT_AUDIT_2026-07-30.md` · this log.
  **All six commits shipped as PR #785, squash-merged `863b7d4`** (`c7408c4` P9 · `97ea3bf` P7 ·
  `6ef53c5` P5 · `dca9f05` P4 · `d9db84e` P3 · `d2d833e` docs · `5ab1a97` the Notizen step ·
  `fea1d00` the merge of `main`).
  **The merge was not clean, and the reason matters.** PRs #786 and #787 (session 185b, the database
  architecture audit) landed on `main` while this branch's CI ran, so GitHub refused the merge. No
  code overlap: the three conflicts were `CLAUDE.md` (auto-merged), `PROJECT_STATUS.md` and this log.
  Both sessions' records were KEPT rather than one side taken, and since both branches had labelled
  themselves "session 185", the handoffs and log headings are disambiguated **185a** (this one) and
  **185b**. Gates were re-run on the merged tree, including the `lint:migrations` gate #786 added:
  542 tests across 47 files, bundle 124.7 kB of 400 kB.

- **Prompt 6 (verbatim, 2026-08-04):** `the other session is finished`
  **Response:** informational, so nothing was built. Confirmed `main` was settled with both sessions
  in and this one last (`863b7d4`), the branch clean and reset, and nothing outstanding. Noted that
  the 185a/185b split in the two records now describes two CLOSED sessions rather than one in
  flight, and restated what is left on the content side: P10 (0.4% verified, the audit's plan is the
  ~320 highest-traffic items first), the 12 verified nouns awaiting a `numerus` at their next
  review, and the writing-task quality audit still queued from s181.
- **Artifacts (prompt 6):** none (status check in chat).

- **Prompt 7 (verbatim, 2026-08-04):** `document the session`
  **Response:** audited what was actually missing rather than restating the entries already written
  during the session, and found four gaps.
  (1) **A stale count this session created.** `docs/areas/CONTENT.md` still described the text bank
  as "42 texts / 126 checks" and "the six `tx_c1_*` texts" as the only long band, which the eight
  new B2 texts had falsified. It reads 50 texts / 150 checks and **14 exam-length texts** now, and
  the file's freshness line moved from "counts as of s177" to s185, verified against
  `pnpm lint:content`.
  (2) **No paper trail on the PR itself.** The prompt-3-to-5 entry was written before the PR
  existed, so it recorded no number and no merged SHA. It now carries #785, `863b7d4`, all eight
  commit SHAs, and the conflict resolution, which is the part a future session would otherwise have
  to reconstruct from git.
  (3) **`docs/DECISIONS.md` had nothing from this session**, though it had the parallel session's
  retention entry. Two decisions belong there because both will look like bugs later: **a new
  content rule never edits a human-verified row** (so lint prints 12 warnings on a clean tree by
  design), and **the Notizen step's settled shape**, with the founder's wording for each of the five
  changes so it is not "improved" back.
  (4) **"Resume here" still led with the closed audit.** It leads with the queued writing-task
  quality audit now, with P10 and the 12 rows named as the smaller follow-ups.
  Re-audited the rest and found nothing further stale: `PROJECT_FOUNDATION.md` covers architecture
  and infra (neither moved on this branch), `docs/areas/COMMANDS.md` gained no script from this
  session, and `PROJECT_REFERENCE.md`'s backlog is unchanged.
  Gates: docs-only.
- **Artifacts (prompt 7):** `docs/areas/CONTENT.md` · `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md`
  · this log.

## Session 185b (2026-08-04) - branch `claude/database-architecture-audit-x4cdmu`

- **Prompt 1 (verbatim, 2026-08-04):** `the database architecture is concerningly linear.. can you
  do a thorough audit and provide your analysis with risks and recommendations?`
  **Response:** full audit of the Supabase layer (all 14 migrations, 5 Edge Functions, the
  cloudSync protocol, admin RPCs), written up as
  `docs/reports/db-architecture-audit-2026-08-04.md`. Verdict: the "linear" shape (few relations,
  everything hanging off `auth.users`) is deliberate and correct, because the ~5,000-id content
  catalog lives in the repo, not the database; the DB only holds per-learner state, ops tables and
  one global cache. The real risks are growth-shaped, not shape-shaped: (R1) the `progress` row is
  one ever-growing JSONB blob re-uploaded whole on a 1.5 s debounce, with `daily_xp`/`active_days`
  growing forever; (R2) between logins sync is whole-row last-write-wins across devices; (R3)
  `pushProgress`/`pushSettings` never read the supabase-js `{ error }` result, so a permanently
  failing sync is invisible to the learner; (R4) nothing is ever deleted (stale anonymous
  accounts, indefinite learner text retention = open audit F11, stranded transform-cache rows) and
  the pg_cron retention job the 0010 evidence probe expects was never scheduled; (R5) admin RPCs
  recompute analytics from the blobs, O(users x account-age); (R6) migration idempotency is an
  unchecked convention that can block the whole backend deploy chain. Recommended order: sync-error
  indicator, retention jobs, day-map caps, idempotency lint (all small, independent), then the one
  real schema evolution (split `srs` into a per-card table) before serious growth. Analysis only,
  no code changed, per the prompt.
- **Artifacts (prompt 1):** `docs/reports/db-architecture-audit-2026-08-04.md` ·
  `docs/PROJECT_STATUS.md` · this log
- **Prompt 2 (verbatim, 2026-08-04):** `a "richer" database would add cost and maintenance - how and why?`
  **Response:** plain-language follow-up to the audit's verdict, no code. Four reasons the
  repo-resident content catalog beats content-in-Postgres for this product: (1) the CI quality
  gates (lint:content, provenance, verify:facts, the writingScope coverage tests) block a broken
  edit before deploy and would have to be rebuilt as server-side tooling plus an editor UI,
  approval step and audit trail; (2) bundled content is served free by GitHub Pages and cached by
  the PWA for offline study, while DB-served content adds Supabase egress cost, latency and a
  hand-built offline sync layer; (3) a content shape change is a type-checked code edit with
  `git revert` as the undo, versus a live production migration with backup-restore as the undo;
  (4) more RLS/backup/delete surface around tables whose ids learner progress is keyed to. Also
  named when a content DB WOULD be right (daily non-technical editors, per-user content, a
  catalog too big to ship), none of which apply. Conclusion unchanged: keep content in the repo,
  spend the effort on the audit's learner-state fixes.
- **Artifacts (prompt 2):** this log
- **Prompt 3 (verbatim, 2026-08-04):** `do the four fixes`
  **Response:** all four audit fixes implemented, plus the one part that could not ship as
  described.
  **(1) R3, the silent sync** (`src/lib/cloudSync.ts`, `src/store/useAuthStore.ts`,
  `src/features/auth/AccountPanel.tsx`): the push helpers now read the supabase-js `{ error }` and
  return a boolean; `settle()` counts consecutive failures PER CHANNEL (progress/settings
  separately, so a healthy row cannot mask a stuck one) and schedules a backed-off retry
  (5 s · 20 s · 60 s · 5 min). Three consecutive failures set `useAuthStore.syncHealth = "failing"`
  and `lastSyncedAt` stamps every landing push. Settings shows a third badge state, amber
  "Sync pausiert", with one line of German, the last backup time and an always-live
  "Erneut versuchen" button (`retryCloudSync()`). `pushProgressNow()` collapsed into `pushProgress`
  now that both read their result. Also added an **unknown-column retry** (PGRST204/42703): the
  Pages deploy and the Supabase deploy are independent workflows, so a client can write a column
  minutes before the migration creates it, and an unknown column fails the WHOLE upsert.
  **(2) R4, retention** (`supabase/migrations/0015_retention.sql`): `purge_stale_guests(90)` and
  `purge_transform_cache(60)`, both scheduled on pg_cron Sundays off-peak, the whole block
  exception-wrapped so an unavailable extension warns rather than failing the migration step (which
  runs BEFORE the function deploys and would block them). Migration 0010's
  `admin_gdpr_evidence().retention_scheduled` finally reports true.
  **(3) R1, day-map caps** (`src/store/useProgressStore.ts`, `cloudSync`, `Analytics.tsx`):
  `RETAIN_DAYS = 400`, `trimDayMaps()` folds dropped ACTIVE days into the new `activeDaysFolded`
  (cloud column `progress.active_days_folded`), folding once per day in `touchStreak` rather than on
  the review hot path, and the activity calendar renders `activeDays.length + activeDaysFolded` so
  the learner-visible lifetime figure is unchanged. Merge-safe across devices via Math.max.
  **(4) R6, idempotency gate** (`scripts/lint-migrations.mjs`, `pnpm lint:migrations`,
  `validate.yml`): six rules, dollar-quoted bodies and literals stripped before parsing, files
  ≤ 0014 exempt as already-applied history. Verified in both directions (real tree passes; a scratch
  file with all six violations fails with all six named).
  **NOT DONE, on purpose:** auto-deleting learner writing (audit F11). The privacy policy promises
  the opposite in as many words, so `purge_old_learner_text()` ships unscheduled and the founder was
  asked whether writing should expire and after how long. The policy DID gain one paragraph, for the
  new 90-day guest-account rule, because a retention job and the copy documenting it ship together.
  Design: the `/design` skill was loaded before the UI work; the new state reuses the existing badge
  recipe with the warning token (no new visual language), previewed in `preview/sync-status.html`
  and screenshot-verified in headless Chromium.
  Gates: typecheck · lint 0 errors · lint:content · lint:migrations · test:unit **515/515** (9 new)
  · build · check:bundle 124.7 kB.
- **Artifacts (prompt 3):** `supabase/migrations/0015_retention.sql` · `scripts/lint-migrations.mjs`
  · `src/lib/cloudSync.ts` · `src/store/useAuthStore.ts` · `src/store/useProgressStore.ts` ·
  `src/features/auth/AccountPanel.tsx` · `src/features/analytics/Analytics.tsx` ·
  `src/features/legal/PrivacyPolicy.tsx` · `tests/retention.test.ts` · `tests/cloudSync.test.ts` ·
  `preview/sync-status.html` · `package.json` · `.github/workflows/validate.yml` · `CLAUDE.md` ·
  `docs/areas/COMMANDS.md` · `docs/DECISIONS.md` · `docs/reports/db-architecture-audit-2026-08-04.md`
  · `docs/PROJECT_STATUS.md` · this log
- **Prompt 4 (2026-08-04, answers to two questions asked via the picker):** merge decision =
  **"Merge it now"**; learner-text retention = **"Delete after 2 years"**.
  **Response:** both answers implemented before merging. Migration 0015 (still unmerged, so it
  carries the decision directly rather than needing a 0016) now schedules
  `purge_old_learner_text(730)` on Sundays 04:07 UTC alongside the guest and cache purges, and its
  §4 header changed from "BUILT, NOT SCHEDULED" to the founder decision and its reasoning. The
  privacy policy was rewritten in the SAME change: the sentence promising indefinite retention is
  gone, replaced by the 2-year rule plus what survives it (the evaluation stays in Verlauf, only the
  raw text and its correction are removed), which is exactly what the job does since it NULLs
  columns rather than deleting rows. **Security-audit finding F11 is closed.** The general rule was
  recorded in `docs/DECISIONS.md` §s185: a retention timer and the copy documenting it ship
  together, and a conflict between them is never resolved by quietly editing the copy.
  Gates re-run after the change: typecheck · lint 0 errors · lint:content · lint:migrations ·
  test:unit 515/515 · build · check:bundle.
- **Artifacts (prompt 4):** `supabase/migrations/0015_retention.sql` ·
  `src/features/legal/PrivacyPolicy.tsx` · `CLAUDE.md` · `docs/DECISIONS.md` ·
  `docs/reports/db-architecture-audit-2026-08-04.md` · `docs/PROJECT_STATUS.md` · this log.
  Shipped as PR **#786**.
- **Post-merge verification (2026-08-04, same session, no founder prompt):** all three workflows
  green on the merge commit `7fe00dd` (Validate content · Deploy site to GitHub Pages · Deploy
  Supabase functions), and the Supabase log shows `Applying migration 0015_retention.sql` followed
  by `Finished supabase db push`, so the migration applied to the live database.
  **One claim was walked back as an overclaim:** the handoff said
  `admin_gdpr_evidence().retention_scheduled` now reports true. That is not verified and cannot be
  from the deploy log, because `supabase db push` does not surface Postgres NOTICE/WARNING output
  and the pg_cron block warns instead of failing by design (so that a project without the extension
  cannot block the Edge Function deploys behind it). A green deploy therefore proves the migration
  applied, NOT that the three jobs were scheduled. `PROJECT_STATUS.md` and the audit report now say
  so and name the one place that distinguishes the two states, `/admin → Launch`, plus the recovery
  (enable pg_cron under Database → Extensions, re-run the workflow, which re-applies 0015
  idempotently).
- **Artifacts (post-merge):** `docs/PROJECT_STATUS.md` · `docs/reports/db-architecture-audit-2026-08-04.md` · this log
- **Prompt 5 (verbatim, 2026-08-04):** `document the session`
  **Response:** because every prompt in this session was already logged as it happened, this pass
  looked for what the session had made STALE rather than restating it, and the first thing it found
  was a bug in this session's own work.
  **(1) The legal-consent invariant had been broken by prompt 4.** The privacy policy was materially
  rewritten (2-year text retention, 90-day guest deletion, and the removal of the sentence promising
  indefinite retention) but `PRIVACY_LAST_UPDATED_ISO` and `CONSENT_VERSION` were left at
  `2026-06-08`. So the live page rendered new retention terms under the old date, and no stored
  consent version recorded that the terms had changed. **The §G2 drift check provably cannot catch
  this:** `consentInSync()` compares the two constants to EACH OTHER, so bumping neither passes
  green, and `tests/consent.test.ts` did pass. Both are now `2026-08-04`. Blast radius today is
  small (consent is recorded at signup/onboarding, and no live re-consent prompt exists yet), but
  the rendered date was wrong on a legal page.
  **(2) `docs/areas/LEGAL-ADMIN.md`** had no retention section at all, while §G4 described a pg_cron
  probe whose answer had just changed. It now documents all three purges, the exception-wrapped
  scheduling and why a green deploy does not prove the jobs are scheduled, and carries the rule the
  area must not lose (a retention timer and its copy ship together; the drift check will not save
  you).
  **(3) `docs/PROJECT_FOUNDATION.md`** was stale in two ways, one of them predating this session:
  the schema list still named only the four 2A tables (it now describes all 15 migrations' worth by
  RLS posture, and says why the "linear" shape is deliberate), and it still claimed migrations are
  applied by hand in the SQL editor, which stopped being true in s179.
  **(4) `docs/reports/security-audit-2026-07-27.md`** still listed F11 as open with a
  recommendation; F11 is now closed, and its founder-action item records the one confirmation still
  owed (`/admin → Launch`).
  **(5) `docs/PROJECT_REFERENCE.md`** gained a "DEFERRED BY DESIGN" section for the two database
  items the audit deliberately did NOT fix (the `srs_cards` split, the admin analytics rollup), each
  with its trigger condition, so neither is re-discovered from scratch later.
  Gates: typecheck · lint 0 errors · lint:content · lint:migrations · test:unit · build ·
  check:bundle.
- **Artifacts (prompt 5):** `src/lib/legalMeta.ts` · `src/lib/consent.ts` ·
  `docs/areas/LEGAL-ADMIN.md` · `docs/PROJECT_FOUNDATION.md` ·
  `docs/reports/security-audit-2026-07-27.md` · `docs/PROJECT_REFERENCE.md` ·
  `docs/PROJECT_STATUS.md` · this log
- **Prompt 7 (verbatim, 2026-08-04, with a screenshot of `/admin → Launch`):** `this is what I see`
  **Response:** the screenshot closes the one item s185b left owed. The Compliance block renders the
  green **"Aufbewahrungs-Job (pg_cron) ist geplant"**, so pg_cron WAS available on the project and
  all three weekly purges (guests 90 d · transform cache 60 d · learner text 730 d) are genuinely
  scheduled, not merely installed. This was worth checking rather than assuming: migration 0015
  wraps its scheduling in an exception handler on purpose (so a missing extension cannot fail the
  migration step and block the Edge Function deploys behind it), and `supabase db push` does not
  surface Postgres NOTICE/WARNING output, so a green deploy alone could not distinguish "scheduled"
  from "silently skipped". The same screenshot independently confirms the prompt-5 fix: the
  Consent-Version card is green and reads "Im Gleichschritt: CONSENT_VERSION 2026-08-04 =
  Rechtsseiten-Stand 2026-08-04".
  Recorded as verified in `PROJECT_STATUS.md` (the owed item removed), the DB audit report (its
  verification note closed) and the 2026-07-27 security audit (F11 + its founder-action item).
  **One interaction noted, not acted on:** the Launch checklist item "Supabase-Plan geprüft
  (Free-Tier pausiert nach 7 Tagen Inaktivität)" is still unticked and bears on this, since a paused
  project runs no scheduled jobs. Harmless while the app is in daily use (these are weekly hygiene
  tasks with no deadline), so it belongs to the pre-launch plan decision, not to this audit.
- **Artifacts (prompt 7):** `docs/PROJECT_STATUS.md` ·
  `docs/reports/db-architecture-audit-2026-08-04.md` ·
  `docs/reports/security-audit-2026-07-27.md` · this log

## Session 186 (2026-08-04) - branch `claude/prufung-simulation-rework-av72gq`

- **Prompt 1 (verbatim, 2026-08-04):** `prufung simulation should actually feel like an exam with
  all the lesen, hören, schreiben and sprechen modules with a timer and clear instructions. I want
  you to do a complete rework of this section.`
  **Response:** design round FIRST, per the locked preview-first process; no app code touched yet.
  The concept replaces the speaking-only "Prüfungssimulation" with a real four-part mock exam
  (telc B2 Beruf / Goethe B2 shape): Teil 1 Lesen (3 Texte, 9 MC-Aufgaben, 15 Min), Teil 2 Hören
  (2 Ansagen via TTS, max. 2x, Notizen + Aufgaben, 10 Min), Teil 3 Schreiben (1 voll gebriefte
  Aufgabe, KI-bewertet, 20 Min), Teil 4 Sprechen (bestehender Dialog-Runner, 7 Min); Anleitungs-
  Seite vor jedem Teil, Timer je Teil (amber unter 2 Min), Ergebnis mit Punkten pro Teil und
  Bestanden-Grenze 60 %. Every module draws from existing banks (texts.ts incl. the eight
  exam-length B2 texts and the six voicemails with `notes`, the 717 writing tasks, the 30 speaking
  scenarios), so the rework is engine + UI work, no new content wave. Three named variants in
  `preview/pruefungssimulation-rework.html` (screenshot-verified, published as a Claude artifact):
  **A "Prüfungstag"** (timeline hub, one start CTA, single parts below; runner with white top bar,
  Teil-Punkte, Timer-Pill; recommended), **B "Vier Module"** (four equal module cards, timer in the
  bottom action bar), **C "Antwortbogen"** (numbered answer-strip navigation, A's hub). Awaiting
  the founder's pick before implementation.
- **Artifacts (prompt 1):** `preview/pruefungssimulation-rework.html` · `docs/PROJECT_STATUS.md` ·
  this log
- **Prompt 2 (verbatim, 2026-08-04):** `I don't understand how to interpret the preview artifact.
  The explanation isn't clear and is in German. Fix it. keep it in English. only the app renders
  should be in German`
  **Response:** rewrote every explanatory layer of the preview page in plain English (intro, the
  "how to read this page" guidance, the structure table, all option notes, frame captions, page
  title) and made each note say explicitly what the left/right phone shows. The phone mockups
  themselves stay German, since they render the app as the learner sees it. Republished to the
  same artifact URL. Standing rule for future previews: review-page chrome in English, app
  renders in German.
- **Artifacts (prompt 2):** `preview/pruefungssimulation-rework.html` · this log
- **Prompt 3 (verbatim, 2026-08-04):** `I like option B for start page - add Niveau in the first
  row so that the user can select if they want to take B1 or b2 exam for example by pushing the
  current tiles downward. offer a2 until c1 levels.

  take option C for during the exam layout and keep the zuruck and weiter buttons from option a.
  However, the weiter button should also have same design as zuruck. The dark blue button should
  not take away focus from the task for the test taker. The dark blue button should only be there
  for submission of the module or something important to grab the attention of the test taker.

  wherever necessary add the expand to full screen button for better accessibility - for this
  refer to the button already implemented in the schreiben section earlier.`
  **Response:** implemented the full rework to those picks. New `engine/exam.ts` composer
  (level-aware draws from the existing banks, telc-style scoring, 60 % pass line) and persisted
  `useExamStore` run state (reload-safe mid-part; Sprechen restarts its dialogue). ExamHub: Option
  B with the Niveau row A2-C1 first (A2 honestly empty, zero content bank-wide; gap logged in
  PROJECT_REFERENCE with the C1-Hören single-audio-text gap), slim full-exam card, four module
  cards startable alone with per-level last scores. Runner: Option C numbered answer strip,
  Anleitung page per Teil, timer pill amber under 2 minutes, Zurück/Weiter both quiet outline,
  gradient reserved for "Teil abschließen"/"Abgeben"/starts; expand-to-fullscreen buttons
  (Schreiben pattern) on the Lesen text card and the Schreiben Aufgabe card. Hören: TTS max 2x +
  the s185 Notizen anatomy. Schreiben: scored by `evaluate-writing`'s new exam mode (0-100,
  telc-weighted, `exam_score` column, migration 0016), renormalised honestly when unscored.
  `progress.mock_exams` syncs runs (bounded 100, unknown-column retry). Ergebnis: per-Teil bars,
  weakest-part Üben, answer review. Embedded ExamRunner keeps the self-score rubric as the
  Sprechen grade. Gates green: typecheck · lint 0 errors · 551 unit tests (9 new in
  `tests/exam.test.ts`) · lint:migrations · build · bundle 125 kB. Live flow screenshot-verified
  against the approved preview (hub, Anleitung, Lesen with strip + timer, answered state).
- **Artifacts (prompt 3):** `src/engine/exam.ts` · `src/store/useExamStore.ts` ·
  `src/features/exam/*` (ExamHub, MockExamRunner, McParts, SchreibenPart, SprechenPart, partMeta,
  ExamRunner embedded mode) · `src/store/useProgressStore.ts` · `src/lib/cloudSync.ts` ·
  `src/lib/writing.ts` · `supabase/functions/evaluate-writing/index.ts` ·
  `supabase/migrations/0016_mock_exams.sql` · `tests/exam.test.ts` · `docs/PROJECT_STATUS.md` ·
  `docs/PROJECT_REFERENCE.md` · this log
- **Prompt 4 (verbatim, 2026-08-04):** `are you done?`
  **Response:** status check, not a work request. The rework was merged (PR #791, squash `a65a522`)
  and the Pages deploy was green, but the **Supabase deploy had failed**: `esm.sh` returned 522 on
  all three bundling attempts, so `evaluate-writing` could not build. Not our code, an upstream CDN
  outage. Re-ran the failed job; it went green on attempt 2, so the exam-mode evaluator and
  migration 0016 are live. Reported the partial state honestly rather than claiming completion
  (the practical effect while it was red: an exam's Schreiben part would have shown "ohne
  Punktzahl" and the other three parts would still have counted).
- **Artifacts (prompt 4):** none (CI re-run only)
- **Prompt 5 (verbatim, 2026-08-04):** `for the mobile view, when a user starts the test, I want you
  to hide the navigation bottom bar selection at the bottom and the top bar should be intact but the
  streak and account settings should be replaced with a minimalistic exit button that should not
  grab attention but is available when the user looks for it.`
  **Response:** added **exam chrome**, a lighter sibling of focus mode. While a run is on screen:
  the mobile bottom bar is not rendered (and `pb-nav`'s reserved gap goes with it, so no dead space
  under the last control), and the header keeps its logo but replaces the streak pill + account
  menu with ONE muted X (`text-muted-foreground`, no fill, the same 36px box the account button
  used, `aria-label`/`title` "Prüfung verlassen"). The header, the logo and the desktop sidebar
  stay, since the founder scoped this to the mobile bottom bar and an exam still needs its top bar.
  **Redundancy removed with it:** the RunBar's X and the Anleitung page's "Prüfung abbrechen" link
  are gone, so there is exactly ONE exit. Mid-exam it confirms through the runner's own dialog
  ("Prüfung verlassen?" · Weiter üben / Verlassen) with a `danger` button, matching Settings'
  Konto löschen rather than the brand gradient, which stays the colour of submitting; on the result
  screen the run is already recorded, so the X closes without a confirm.
  **Architecture note:** the flag is `useSessionStore.examExit`, holding the runner's exit callback
  rather than a boolean, because eager `AppShell` must never import `useExamStore` (it reaches the
  content banks through the composer). Bundle 125.2 → **125.7 kB**, which is the proof nothing
  leaked. The effect keys on "is a run active", not the run object, so the header does not
  re-register once per timer tick.
  Gates: typecheck · lint 0 errors · 551 tests · build · check:bundle. Verified on a 400px mobile
  viewport in the real build: bottom nav absent from the DOM, the header's only button is
  "Prüfung verlassen", confirm dialog renders correctly.
- **Artifacts (prompt 5):** `src/store/useSessionStore.ts` · `src/components/layout/AppShell.tsx` ·
  `src/features/exam/MockExamRunner.tsx` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/PROJECT_STATUS.md` · this log
- **Prompt 6 (verbatim, 2026-08-04, with a screenshot of the exam's Schreiben part scrolling):**
  `there should not be any page scroll here. only internal scrolling` · follow-up mid-turn:
  `check for such instances across the prufung simulation screens`
  **Response:** the running exam is now a **stage** rather than a document. `main` gets
  `h-exam-stage` while exam chrome is on (`100dvh - 4rem - 1px - safe-top`; the 1px is the header's
  bottom border, and leaving it out overflowed by exactly 1px, which is still a scrollbar) and each
  part pins its RunBar, answer strip and action buttons around ONE `flex-1 min-h-0 overflow-y-auto`
  region. Lesen/Hören scroll text + question together (the text card's nested `max-h-[32dvh]` went,
  no nested scrollers), Schreiben caps the Aufgabe at 34 % with its own scroll and gives the field
  the rest (`resize-none`: a hand-dragged textarea would re-break the viewport), Sprechen scrolls
  the dialogue, Anleitung and Ergebnis scroll themselves (inner `min-h-full` wrapper so a tall
  Sprechen briefing is not clipped by `justify-center`). Height only, never `overflow:hidden`, so
  the mobile keyboard can still scroll the field into view. Registration moved to `useLayoutEffect`
  so the stage swap is paint-atomic instead of showing one frame of the scrolling layout.
  **Audited every screen at three phone sizes** (393x852, 375x667, 360x640) by driving the real
  build: hub, four Anleitung pages, four Teile, Ergebnis. All ten in-exam screens rest at **0 px**
  page overflow at every size (before: the exam Schreiben part overflowed on every phone).
  **The hub is the one screen still scrolling** (95-151 px on a 667 px phone). Left scrolling on
  purpose: it is a menu, not a Teil, and it is the LEAST scrolling hub in the app, measured at the
  same size against `/anwenden` 237 px, Praktisch 253 px, Fortschritt 5562 px, Bibliothek 11688 px.
  Two things did come off it, justified by the microcopy rules rather than by the pixels: the
  "Jeder Teil läuft mit eigenem Timer" filler line (the Anleitung already says it) and the module
  cards' second muted line (content and length now share one). That alone took the hub from 203 to
  151 px on an SE. Say the word if it should fit exactly; that means shrinking the Option B cards.
  Gates: typecheck · lint 0 errors · 551 tests · build · check:bundle 125.8 kB.
- **Artifacts (prompt 6):** `src/index.css` (`.h-exam-stage`) · `src/components/layout/AppShell.tsx` ·
  `src/features/exam/MockExamRunner.tsx` · `src/features/exam/McParts.tsx` ·
  `src/features/exam/SchreibenPart.tsx` · `src/features/exam/SprechenPart.tsx` ·
  `src/features/exam/ExamHub.tsx` · `CLAUDE.md` · `docs/areas/PRAKTISCH-NAV.md` · this log
- **Prompt 7 (verbatim, 2026-08-04, with a screenshot of Lesen showing only the text), four asks in
  one round:** `the question and options are not visible here. reduce the height of the text and
  keep the question and options tile fixed on the bottom of the text tile.` · `Teil abschliessen
  button is occupying valuable pixels to the bottom. It should not be there - the back and forth
  buttons should be in its place, and the Teil abschliessen should be only visible at the last
  question when all questions are answered.` · `The question number row should be center aligned.`
  · `The desktop view can be made better by using the space properly. The text and question with
  options could be side by side for better space utilization`
  **Response:** all four, plus two bugs the verification pass exposed.
  **(1) The question tile is no longer elastic.** s186's single scroll region let a long text bury
  the question. Now the TEXT (Lesen) and the Notizen sheet (Hören) shrink and scroll internally,
  and the question keeps its natural height, pinned under them.
  **(2) "Teil abschließen" left the permanent footer**: the row is Zurück/Weiter, and on the last
  question with everything answered the submit REPLACES Weiter (which has nowhere useful to go
  there) rather than adding a row back. That row was costing every screen ~52 px.
  **(3) The number strip is centred**, and `gap-1` so nine numbers hold ONE row at 360 px (the
  wrapped second row cost the text 44 px).
  **(4) Desktop lays the two tiles side by side** (`lg:flex-row`, 3/5 + 2/5; Schreiben mirrors it
  with the Aufgabe left), the stage widens to `lg:max-w-6xl`, and exam chrome now also hides the
  **desktop sidebar** and the **Feedback pill** (which overlapped the Weiter button, visible in the
  founder's screenshot) and drops `lg:pl-64`. With the sidebar gone the header mark became a plain
  `Logo` instead of a link: it would have been the only clickable thing on the left, and it
  navigates away, silently ending the run.
  **Two bugs found by measuring rather than looking:** the Lesen text pane collapsed to **0 px** on
  a 360 px phone, and on Hören the question tile **spilled below the stage** (invisible, and with
  no page scroll to reach it, which is worse than scrolling). Fixed by giving the text a floor,
  making the Notizen column the absorber, and removing the question card's "Aufgabe N von M"
  eyebrow, which the centred strip already states.
  **Verified by driving the real build over EVERY question** (9 Lesen + 6 Hören) at 393x852,
  375x667 and 360x640: question fully visible in all 45 states, page overflow 0 everywhere; desktop
  1440x900 side by side, 0 overflow, in dark mode. Honest limit: on 375/360-wide phones the reading
  pane can fall to ~2 lines for the tallest questions; it scrolls and the expand button reads the
  text full-screen.
  Gates: typecheck · lint 0 errors · 551 tests · build · check:bundle 125.8 kB.
- **Artifacts (prompt 7):** `src/features/exam/McParts.tsx` · `src/features/exam/SchreibenPart.tsx` ·
  `src/features/exam/MockExamRunner.tsx` · `src/components/layout/AppShell.tsx` ·
  `docs/areas/PRAKTISCH-NAV.md` · this log
- **Prompt 8 (verbatim, 2026-08-04):** `document the session`
  **Response:** the full documentation pass for s186, beyond the per-prompt entries above.
  **`PROJECT_STATUS.md`:** the `_Last updated_` block now names all four PRs (#791 the exam, #792
  exam chrome, #793 the stage, #794 the question layout) and the measured 0 px result; the s186
  handoff gained the #794 round (the question tile is never what shrinks, the three rules that make
  it fit, the desktop split, the accepted 2-line limit on 375/360-wide phones) and a **"next, if the
  founder does not redirect"** line: the queued writing-quality audit stays the oldest open item,
  with the A2 / C1-Hören content waves, then a Fortschritt tile over `progress.mock_exams` (synced
  but unplotted), then per-Teil history as the exam's own follow-ups. Nothing is half-built.
  The file was ALSO 270 lines with a `_Last updated_` block that had grown into the
  session-by-session narrative its own hygiene rule forbids: s183-and-older collapsed to a pointer
  at `docs/archive/status-log/`, back to **233 lines** and inside the ~250 cap. The two-handoff rule
  was already satisfied (s186 + s185b), so nothing needed archiving this time.
  **Stale docs the work created, now fixed:** `CLAUDE.md` layout gained `engine/exam.ts`,
  `useExamStore` and `features/exam/`, and the route list gained `/exam` (hub at rest, the running
  Teil takes the route over); `docs/PROJECT_FOUNDATION.md` gained migration 0016
  (`progress.mock_exams`, `writing_evaluations.exam_score`) against a schema section that still
  said "15 migrations". `CLAUDE.md`'s never-scrolls invariant and `docs/areas/PRAKTISCH-NAV.md`
  (exam chrome vs focus mode, the stage anatomy, the question-tile law) were updated in the PRs
  they shipped with, per the same-PR rule.
- **Artifacts (prompt 8):** `docs/PROJECT_STATUS.md` · `CLAUDE.md` · `docs/PROJECT_FOUNDATION.md` ·
  this log

## Session 187 — 2026-08-04 · branch `claude/question-tile-ui-polish-vv4t4c`

- **Prompt 1 (verbatim, 2026-08-04):** `I like this but there are still few polishing that could be
  done.\n\n1. The close the test button should be replaced with a exit the door with an arrow kind
  of button which should be in red color. In desktop view particularly, the button should also have
  a small note saying schliessen or something when hovered upon - see screenshot for reference.\n2.
  The question tile looks cramped and the text tile to the left has too much empty space. I want the
  screen to have harmonious spacing and sizes of the tiles, and if needed the user should be able to
  drag the text box vertically and horizontally to read more text if the text is too big\n3. when
  pressed next question the tiles should go back to the default sizes.\n4. The back and forth buttons
  are pushed way too down and the tiles doesn't have any breathing space vertically - it needs to be
  fixed by keeping enough space above and below these buttons\n5. The questions navigation row can be
  moved to below the question tile so that there won't be too much empty space there.\n6. Reduce the
  rounded corners slightly as it seems too rounded!\n\ngenerate a few previews with the above
  suggested changes. Do multiple checks keeping the design skill's high standards in consideration
  before providing the preview to me. I want finest quality possible.`
  Mid-prompt additions (verbatim): `There's not enough contrast between the tiles in the dark mode..
  also improve the contrast and include a section in the preview file for different contrast options`
  and `the contrast is not just about the question numbers navigation but for all the tiles`, then
  `provide preview file as an artifact. I will decide which variants to go ahead with. Don't make
  that decision yourself`.
  **Response:** ONE interactive preview, `preview/exam-question-tile-polish.html`, built from the
  real tokens (`src/index.css`) and the real geometry (`src/features/exam/*.tsx`), published as an
  artifact. Four sections. **1 Kontrast (dark):** the diagnosis is two-part, a card/ground ratio of
  1.34 AND answer rows that carry `bg-surface` inside a `bg-surface` card (ratio 1.00, they only
  exist as a border); three recipes (K1 hellere Karten, K2 tieferer Grund, K3 beides + Kante) all
  carrying one Ebenen rule (Grund → Karte → Zeile), with the measured ratios and a Bibliothek card
  per recipe because the tokens are app-wide. **2 Ecken:** one notch down (Karte 18 → 14, Zeile
  14 → 10, Nummer 10 → 9). **3 Ausgang:** X1 rotes LogOut-Icon + Tooltip (the app's real Radix
  recipe, 0.3 s delay), X2 Icon + Wort, X3 offene Tür. **4 Layouts A/B/C:** A gleiche Höhe (pair
  hugs the taller card, group centred), B je eigene Höhe, C ein Arbeitsblatt mit Haarlinie; all
  three carry the answers to points 3, 4, 5 (drag resets on every question change; 16 px above the
  number row, 12 px to the buttons, 16 px below; the number row moved into the bottom cluster) plus
  a capped, centred button pair on desktop. Toolbar switches Ansicht / Ecken / Text (lang vs kurz,
  the case that drives the whole leftover-room question) / Kontrast for the whole page.
  **No recommendation is marked anywhere**, per the founder's instruction.
  **Verified in headless Chromium:** drag (side 56 % → 42.1 %, vertical to the stage limit) and the
  reset on Weiter, stage overflow 0 after interactions, page h-overflow 0 at 1400 px AND 390 px,
  no console errors, light + dark.
- **Artifacts (prompt 1):** `preview/exam-question-tile-polish.html` ·
  artifact `https://claude.ai/code/artifact/dfcea42b-8258-464c-8e2c-d8084c665128` · this log
- **Prompt 2 (verbatim, 2026-08-04):** `The explanation text in the artifact is in German!!!! it
  should be in english as explained multiple times before. Save it as a rule in the documentation if
  helpful - I don't want to repeat myself on this`
  Mid-prompt additions (verbatim): `Attached are some apps in dark mode. I don't like too much usage
  of the blue hues and shades in the dark mode in the app at the moment. Take inspiration from the
  attached apps like claude, chatgpt, github and vs code. Apply similar contrast and colors` (with
  screenshots of Claude, ChatGPT, GitHub and VS Code in dark mode) · `The k2 contrast is quite close
  to what I would expect` · `the new reduced rounding is okay but I want it further reduced slightly
  - add the next option in the artifact`
  **Response:** three changes to the same preview + artifact URL.
  **(a) Language, now a written rule.** The whole review page is English: headings, option names,
  notes, tables, switch labels. The only German left is the copy that IS app copy inside the mocked
  screens (task text, Zurück/Weiter, the exit tooltip), and the page says so. Written into
  **`CLAUDE.md` §Writing style** ("Everything the FOUNDER reads is ENGLISH", chat, PRs, docs,
  `preview/*.html`, artifacts) and into **`.claude/skills/design/SKILL.md` §1** as process step 4,
  next to a new "never mark a recommendation unless asked" rule (founder, this session).
  **(b) Dark mode is no longer blue.** Diagnosis: the ground is a blue at **44 % saturation** with
  two blue radial glows on top of it, which is what reads as "too much blue". Section 1 became
  "Dark mode: colour and contrast" with five columns: Today, K2 (the contrast the founder confirmed,
  still blue) and three neutral palettes carrying **exactly K2's contrast relationship** (card 1.4:1
  off the ground, edge 3.1, row-in-card 1.2) with the hue taken out and the glows switched off:
  **N1 Graphite** (5 % sat, VS Code / ChatGPT), **N2 Warm grey** (7 %, Claude), **N3 Slate** (15 %,
  GitHub). Blue survives only where it acts (CTA, active number, selected answer), which is what all
  four reference apps do. Ratio table extended with a "saturation of the greys" row.
  **(c) A third corner step.** Today 18 px · New 14 px · **Tighter 10 px** (row 8, number 7), all
  three switchable page-wide, with the page opening on Tighter.
  **Verified again after every change:** drag + reset, 0 stage overflow, 0 page h-overflow at
  1400 px and 390 px, no console errors, light and dark.
- **Artifacts (prompt 2):** `preview/exam-question-tile-polish.html` · `CLAUDE.md` ·
  `.claude/skills/design/SKILL.md` · this log
- **Prompt 3 (verbatim, 2026-08-04):** `Dark palette - N3\nText - layout B looks good and keep it
  "long" but no surrounding tile for the question - the question and options can just float on the
  background\nExam exit icon - X1 for mobile, X2 for desktop view\nCorner - tighter\nThe numbers when
  answered doesn't look good if the text format is blue in color (see attached) - use another color
  from the pallette for better contrast - take your recommendation and go head without any preview
  for this.\n\nImplement the above comments now with exceptional quality`
  Mid-prompt addition (verbatim): `implement the dark mode palette selected above for the whole app`
  · then `document the session`
  **Response:** every pick implemented, verified against the real build, documented.
  **Palette N3 Slate (app-wide, `src/index.css` `.dark`):** ground `220 15% 4%`, surface
  `220 10% 17%`, elevated `220 9% 22%`, muted `220 9% 25%`, border `220 10% 38%`, foreground
  `220 12% 94%`, muted-foreground `220 8% 72%`, primary/ring `219 90% 74%`, accent-ink
  `198 72% 72%`, shadow `220 30% 2%`; the two coloured page radials are switched off in dark via new
  `--wash-a`/`--wash-b` tokens read by `bg-page`/`bg-mesh` in `tailwind.config.ts`. `check:contrast`
  green with every pairing.
  **Corners "tighter":** `--radius` 0.875rem → **0.5rem** and the borderRadius steps tightened to
  ±2/±4/+6, so card 10px, row 8px, pill 6px, `sm` 4px, `2xl` 14px (the old ±4/±10 would have
  collapsed `sm` to 0).
  **Exam (`McParts.tsx` rewritten around variant B):** the question renders with NO card, the ONE
  card on screen is the text / Notizen sheet, both blocks are content-tall and the pair is centred,
  the number strip moved into the bottom cluster (16 px above, 12 px to the buttons, `pb-safe-4`
  below), the cluster is capped `lg:max-w-xl` and centred, both scroll regions fade their last line,
  and a `role="separator"` drags the split sideways (desktop, 32-72 %) or up/down (phone, 24-64 %)
  with a grow handle on the card and arrow-key steps, all reset on every question change.
  **Exit (`AppShell`):** red `LogOut`, bare mark on a phone (X1), mark + "Verlassen" in a red
  outline from `sm` up (X2), no tooltip beside a visible label.
  **Answered number:** `text-foreground` on the Himmelblau tint instead of `text-accent-ink`
  (~3.9:1 → ~11:1). Green was rejected on purpose: green means correct, and answered is not correct.
  **One real bug found while verifying:** a percentage `max-height` only resolves against a parent
  with a definite height, so the auto-height wrapper made every `max-h-full` a no-op and a tall
  question pushed the stage 48 px past one viewport. Wrapper is `h-full` + `lg:items-center` now.
  **Verification:** a Playwright driver over the real build, **225 in-exam screens** (1440x900,
  1024x768, 393x852, 375x667, 360x640 × Lesen + Hören × 3 fresh draws): 0 px page overflow, question
  fully visible everywhere, no console errors, light + dark. Gates: typecheck · lint 0 errors ·
  551 tests · check:contrast · build · check:bundle 126.0 kB.
  **Documentation:** `PROJECT_STATUS.md` (`_Last updated_` rewritten to s187, new handoff, s185b
  archived to `docs/archive/status-log/…W32.md`, back under the 250-line cap), `CLAUDE.md`
  (dark-palette + corner law), `docs/areas/BRAND.md` (tokens + radius scale, s153 Option C replaced),
  `docs/areas/PRAKTISCH-NAV.md` (exam anatomy, resize, the geometry trap), `docs/DECISIONS.md`
  §s187, and the `/design` skill.
- **Artifacts (prompt 3):** `src/index.css` · `tailwind.config.ts` · `src/features/exam/McParts.tsx` ·
  `src/features/exam/MockExamRunner.tsx` · `src/components/layout/AppShell.tsx` ·
  `docs/PROJECT_STATUS.md` · `CLAUDE.md` · `docs/areas/BRAND.md` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/DECISIONS.md` · `.claude/skills/design/SKILL.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` · this log · **PR #807**,
  squash-merged as `78ad6b9`

## Session 188 — 2026-08-04 · branch `claude/page-redesign-7md2zi`

- **Prompt 1 (verbatim, 2026-08-04):** `re-do this page` (attached: a dark-mode screenshot of
  `/exam`, the Prüfungssimulation hub as it shipped in s186: HubHero, a "NIVEAU" label above four
  grey level buttons, the slim "Komplette Prüfung" card, and the four part cards, with the lower
  half of the screen empty).
  **Response:** design-skill process, so previews before code. ONE interactive preview,
  `preview/exam-hub-redesign.html`, published as an artifact
  (https://claude.ai/code/artifact/49f4ec01-73b4-42a3-85a4-47b339ca9d06), with **three named
  options** and three review switches (Theme dark/light · Learner has-practised/first-visit ·
  Niveau B2/A2), each option rendered at desktop width (1152 px content column) and at 390 px.
  Every screen is drawn from the real tokens (`src/index.css` s187 "N3 Slate" dark + light, the
  0.5rem corner scale, card/badge/button/switcher recipes) and the real data the hub already has
  (`MockExamRecord.parts`, `mockExamAvailability`, `settings.examDate`, `PASS_PCT`).
  **Findings put to the founder:** the page answers nothing (five identical "Starten" and no
  statement of where the learner stands), it stops at ~45 % of the screen while results already
  exist in the data and are shown nowhere, "4 Teile · 52 Min" repeats the four cards' own minutes,
  and the Niveau label + four floating buttons are loose chrome above the hero.
  **Shared across all three options:** Niveau becomes the shipped sliding-pill switcher
  (`useSlidingPill`) beside the title, the exam countdown appears on the page it belongs to, and a
  Verlauf block shows the last runs.
  **A "Stand zuerst"** leads with a status card (ring + four skill bars + the one CTA), parts drop
  to a quiet list. **B "Prüfungstag"** leads with a run band that visibly contains the four parts as
  a timeline (which is what removes the duplicated minutes), parts below as "Einzeln üben".
  **C "Vier Karten"** keeps today's skeleton and gives the four cards their last result as a bar.
  **Verification:** rendered in headless Chromium across dark, light, first-visit and A2 states;
  three defects found and fixed before showing (the desktop frames were rendering at tablet width,
  `.rname`/`.rsub` were scoped under `.row` so Option C's cards lost their type hierarchy, and the
  A2 state stated "no content" three times over). No app code touched: the founder picks first.
- **Artifacts (prompt 1):** `preview/exam-hub-redesign.html` · this log
- **Prompt 2 (verbatim, 2026-08-04):** `go with B but the previous test results should not show up
  in the first two tiles, they should only be in the verlauf section. Also, get rid of the icon and
  the shorter header "Prufung", just keep the main header as "Modell Test" in place of
  "Prufungssimulation".`
  **Response:** Option B implemented with both amendments (`src/features/exam/ExamHub.tsx`,
  rewritten). The run band carries no result any more and the "Einzeln üben" rows carry no per-Teil
  badge, so a past score exists in exactly one place: Verlauf. The HubHero (gradient icon tile +
  "Prüfung" eyebrow) is gone, leaving the `h1` and the Niveau sliding-pill switcher on one line.
  **Naming:** shipped as **"Modelltest"**, one word, since German writes the compound closed and a
  space would be a writing error inside a German-learning product; flagged to the founder as a
  one-line change if they want the two-word form. The `/anwenden` entry card and the nav zone
  description were renamed with it, so the page and its entry point carry ONE name; content ids and
  provenance labels were not touched.
  **Also in this change:** the exam countdown (`settings.examDate`) moved onto this page and
  retires itself once the date has passed; Verlauf shows the last 5 runs for the selected Niveau
  (date · four result segments · total badge) with a disclosure holding the four per-Teil
  percentages, and a single-part run honestly leaves three tracks empty; the A2 zero state states
  itself once per control instead of three times per screen; `partMeta.ts` gained a solid `bar`
  colour per Teil for the Verlauf segments.
  **Verification:** the real build driven through a CDP script (no Playwright in this repo) at
  1280x900, 390x844 and 360x640, light + dark, B2 and A2, Verlauf open and closed: 0 px horizontal
  overflow, no console errors, `h1` reads "Modelltest" on every screen. One defect caught and fixed
  mid-round: a JSX comment placed between `{expanded && (` and its element broke the build, and the
  disclosure's label-left/value-right rows were restacked as label-over-value because a wide column
  pulled the pair apart.
  **Gates:** typecheck · lint 0 errors (77 pre-existing warnings) · 551 tests · build ·
  check:bundle 126.0 kB · check:contrast.
  **Documentation:** `CLAUDE.md` (route name + the one-result-one-place law),
  `docs/areas/PRAKTISCH-NAV.md` (the hub anatomy), `docs/DECISIONS.md` §s188,
  `docs/PROJECT_STATUS.md` (`_Last updated_` rewritten to s188, new handoff, s186 handoff archived
  to `docs/archive/status-log/…W32.md`), and this log.
- **Artifacts (prompt 2):** `src/features/exam/ExamHub.tsx` · `src/features/exam/partMeta.ts` ·
  `src/features/anwenden/AnwendenHub.tsx` · `src/components/layout/nav-items.ts` · `CLAUDE.md` ·
  `docs/areas/PRAKTISCH-NAV.md` · `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` · this log · **PR #807**,
  squash-merged as `78ad6b9`
- **Prompt 3 (verbatim, 2026-08-04):** `document the session`
  **Response:** the documentation for prompts 1 and 2 had already shipped inside PR #797 (merged),
  so this pass was an audit for anything the rename left stale, plus this entry.
  **One real leftover found and fixed:** the Sprechen runner (`ExamRunner.tsx`, reached through the
  Modelltest Sprechen part) printed the exam set's raw title, and the bank titles carry a
  "Prüfungssimulation: " prefix from the old page name, so the retired name was still on screen in
  two places (the Aufgabenblatt header and the RunBar). The titles are CONTENT, with provenance rows
  and human-verified stamps, so they were NOT rewritten to follow a UI rename: `examSetTitle()` in
  `features/exam/partMeta.ts` strips the prefix at render, which `MockExamRunner` had been doing
  inline. It sits in `partMeta` rather than `engine/exam` on purpose, so importing one string helper
  cannot drag the content banks into a chunk. Verified by driving the real app into the Sprechen
  part: the header reads "Sicherheitsmängel beheben".
  Four code comments describing the CURRENT page were renamed with it (`route-icons`, `AppShell`,
  `AnwendenHub`, `useSessionStore`); comments that date the s186 rework keep the name that change
  shipped under, and `data/examSets.ts` + `data/provenance.ts` were left untouched.
  **Docs in this pass:** the `/design` skill gained a Modelltest anchor in §6 (the run leads, one
  place per result, no HubHero, one zero-state statement per control), `docs/DECISIONS.md` §s188
  gained the content-vs-UI rename note, `docs/PROJECT_STATUS.md`'s s188 handoff records the
  follow-up, and this log.
  **Gates:** typecheck · lint 0 errors · 551 tests · build · check:bundle 126.0 kB.
- **Artifacts (prompt 3):** `src/features/exam/partMeta.ts` · `src/features/exam/ExamRunner.tsx` ·
  `src/features/exam/MockExamRunner.tsx` · `src/components/layout/route-icons.tsx` ·
  `src/components/layout/AppShell.tsx` · `src/features/anwenden/AnwendenHub.tsx` ·
  `src/store/useSessionStore.ts` · `.claude/skills/design/SKILL.md` · `docs/DECISIONS.md` ·
  `docs/PROJECT_STATUS.md` · this log

## Session 189 · 2026-08-05 · branch `claude/module-practice-model-test-redesign-ppnkf9`

- **Prompt 1 (verbatim):** `[two screenshots: /anwenden and /exam] this page should be redone.
  insert a toggle in olace of the current header - similar to Bibliothek. the toggle should have
  Module wide practice and model test as the two options. within module wise practice, the user
  should see four modules to practice with time. the model test doesn't need to have einzeln uben
  section - just the complete test and verlauf should do. The current mode test page looks cheap
  and chaotic. I want you to redesign these two pages harmonious with the rest of the app and to
  have an exceptional quality that should resemble it's designed by senior design and front end
  experts from billion dollar tech apps which is highly intuitive, user friendly and minimalistic.`
  **Response:** design work, so previews first. Three named options (A "Kompakt", B
  "Bibliothek-treu", C "Prüfungstag") drawn from the real tokens, each on a phone and a desktop, in
  light and dark, published as an artifact and saved to `preview/pruefung-hub-redesign.html` (with
  its generator beside it). The review page also carried the one decision the brief did not settle:
  this hub is the ONLY entry point to the Schreib- and Sprechtrainer, and neither is a timed exam
  module, so they needed a home.
- **Prompt 2 (verbatim):** `there shouldn't be any page scroll by default in these pages. only when
  the learner clicks on verlauf the section should expand and then the scroll should be enabled if
  there's too much info within. by default the tiles or cards should fit within the screen and
  should not overflow beyond the screen size.`
- **Prompt 3 (verbatim):** `rename anwenden hub to prufung üben or something like that - I need
  recommendations`
  **Response to 2 + 3:** the preview's phone frames became the REAL content area a phone leaves
  (668 px) with scrolling switched off, so a screen that did not fit would visibly overflow the
  mockup; Verlauf became a closed disclosure. Four costed rename candidates were tabled, with the
  five-slot bottom bar as the length ceiling.
- **Prompt 4 (verbatim):** `I don't like the icons and their colors - redo them as well`
  **Response:** two glyph sets and three colour sets, switchable from the review bar so they could
  be judged in place. Named what was wrong with the shipped set: three of the four marks were
  rounded objects, and Schreiben's brand blue sat one hue from Sprechen's cyan.
- **Prompt 5 (verbatim):** `wait until i see the preview. I'll then prompt you to ask questions`
  **Response:** stopped; no code was written.
- **Prompt 6 (verbatim):** `go with A (but the verlauf when opened should be the default when
  closed. If the verlauf has more entries, it should show expand button at the bottom. Also, take
  the three KPI figures from Option C and put it in Option A), modern icons, receptive/productive
  colors. Keep the Prufung name. Also, I want to brainstorm how to merge the freies shcreibtrainer
  and sprechen within the sprechen and schreiben modules.`
- **Prompt 7 (verbatim):** `The horizontal line connecting the four modules in the complete test
  should not overlap the icons - fix it.`
  **Response to 6 + 7:** round 2 (`preview/pruefung-hub-r2.html`) locked the picks, rebuilt Verlauf
  as resting-open with the three figures and an expand button, redrew the connector as one segment
  per gap, and sketched four ways to merge the trainers into the modules with the cost of each.
- **Prompt 8 (verbatim):** `go with idea 3 for modul uben, build the whole thing.

  For the model test - the verlauf section needs a lot of polishing. The header in the preview is
  missing. And the expand button looks ugly. when there are many iems like 5-7 in verlauf, when
  clicked on expand, it should occupy bigger screen space by pushing the above tile upwards and if
  needed the whole sccreen with the borders of the tile always visible on the screen with internal
  and page scroll enabled. The user can either scroll within this tile or when reached to the top of
  the tile and further scrolls, the page scroll should be enabled. This should be the rule for the
  whole app across even for filters. ask me if you don't understand anything`
- **Prompt 9 (verbatim):** `for the module uben idea 3 - I want ohne zeit to be default view when
  opened`
- **Prompt 10 (verbatim):** `regarding polishing - see if you can center align few things like the
  niveau dropdown or the KPI figures, etc.`
  **Response to 8 + 9 + 10:** built. `src/features/pruefung/PruefungHub.tsx` replaces
  `features/anwenden/AnwendenHub.tsx` and `features/exam/ExamHub.tsx` (both deleted); `/exam`
  became a redirect and `AppShell`'s exam-chrome route gate was widened to `/anwenden`, without
  which the running exam would have lost its one-viewport stage. Idea 3 shipped as `Mit Zeit /
  Ohne Zeit` resting on Ohne Zeit, which needed `untimed` runs in `useExamStore` (no tick, no timer
  pill, no auto-hand-in) so Lesen and Hören have an untimed shape at all. The expand rule became
  two CSS utilities (`.h-page-stage`, `.max-h-panel-stage`) plus `useStagePanel`, documented as
  app-wide law in CLAUDE.md and `docs/areas/PRAKTISCH-NAV.md`. Niveau and the KPI figures are
  centred.
  **Verified on the real build over CDP at 393x852**, not only in the mockup: at rest
  `scrollHeight === innerHeight` on both tabs; with 20 runs, expanding Verlauf grows the page to
  1240 px, scrolls the tile to top 80 / bottom 772 (the tab bar starts at 789, so both borders are
  visible), caps it at 692 px, and its list scrolls 859/547 internally. The first attempt parked the
  tile's lower border under the tab bar, which is what `scroll-mt-20 scroll-mb-24` fixed.
  **Open question left for the founder, not assumed:** `FilterRail`'s mobile panel already scrolls
  internally under a `max-h-[45dvh]` cap; whether that cap should rise to the full
  `max-h-panel-stage` was not changed unilaterally.
  **Gates:** typecheck · lint 0 errors · 551 tests · build · check:bundle 125.8 kB · check:contrast.
- **Artifacts (session 189):** `src/features/pruefung/PruefungHub.tsx` (new) ·
  `src/features/shared/useStagePanel.ts` (new) · `src/index.css` ·
  `src/features/exam/partMeta.ts` · `src/features/exam/MockExamRunner.tsx` ·
  `src/features/exam/McParts.tsx` · `src/features/exam/SchreibenPart.tsx` ·
  `src/store/useExamStore.ts` · `src/components/layout/AppShell.tsx` ·
  `src/components/layout/nav-items.ts` · `src/router.tsx` ·
  `src/features/anwenden/AnwendenHub.tsx` (deleted) · `src/features/exam/ExamHub.tsx` (deleted) ·
  `preview/pruefung-hub-redesign.html` + `preview/gen-pruefung-hub-redesign.mjs` ·
  `preview/pruefung-hub-r2.html` + `preview/gen-pruefung-hub-r2.mjs` ·
  `preview/gen-pruefung-shared.mjs` · `CLAUDE.md` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` · this log
- **Prompt 11 (verbatim):** `for the modul uben - the desktop view should also have a heirarchy for
  the toggles similar to mobile view`
  **Response:** the header row split into two rows at every width, so the switcher leads and the
  scope controls (Mit Zeit / Ohne Zeit, Niveau) sit under it, trailing on a desktop. Sharing one
  line had given the two the same rank. One trap: inside the header column a flex item stretches, so
  the two-segment track spanned the whole page (the "switcher too big" shape rejected in s149);
  `lg:self-start` keeps it content-sized. Re-verified on the built app: 900/900 at 1280x900 on both
  tabs, 852/852 on the phone.
- **Artifacts (prompt 11):** `src/features/pruefung/PruefungHub.tsx` · `CLAUDE.md` ·
  `docs/areas/PRAKTISCH-NAV.md` · this log
- **Prompt 12 (verbatim):** `center align the toggles and buttons in desktop view as well!!!`
  **Response:** the header column became `items-center`, so on a desktop the switcher and the
  scope row sit on the page's own axis instead of one leading from the left and the other trailing
  right. The centring is also what keeps the two-segment track content-sized from `lg` up, so the
  `lg:self-start` added a moment earlier was removed as redundant. Re-verified: 900/900 desktop,
  852/852 phone.
- **Artifacts (prompt 12):** `src/features/pruefung/PruefungHub.tsx` · `CLAUDE.md` ·
  `docs/areas/PRAKTISCH-NAV.md` · this log
- **Prompt 13 (verbatim):** `the module uben desktop view looks awkward and cramped. Can you make
  the tile in 2x2 layout and spread them out a bit more so that it occupies the space well enough to
  look good.  In the modeltest view for desktop, keep the start test blue button centered and remove
  the line separating it from the rest of the tile`
  **Response:** the module grid is 2×2 at every width now, capped at `max-w-4xl` and centred on a
  desktop, with the cards growing their padding, mark (64px) and title rather than being stretched;
  measured 896px block with 436px cards against the old 230px ones. The run band's CTA is centred
  and the rule above it is gone. **One flexbox trap worth remembering:** `mx-auto` on a flex child
  makes it fall back to its CONTENT width, so the first attempt collapsed the grid to 411px inside a
  1024px column; `lg:w-full` gives the width back before `max-w` caps it. Re-verified: 900/900
  desktop, 852/852 phone on both tabs.
- **Artifacts (prompt 13):** `src/features/pruefung/PruefungHub.tsx` ·
  `docs/areas/PRAKTISCH-NAV.md` · this log
- **Prompt 14 (verbatim):** `create the PR into main and merge. document the session`
  **Response:** shipped as **PR #799** (squash-merged into `main`), which is the whole s189 redesign:
  commits `1cfe0f7` + `c1d5879` (the two preview rounds), `10c2dc8` (the build), `fc27d08`,
  `988beca`, `2ce64e3` (the three desktop-layout follow-ups) and this documentation pass.
  Merging `main` triggers the two deploy workflows; no migrations and no Edge Function changes are
  in this PR, so only the Pages deploy matters. The founder verifies the live result.
- **Artifacts (prompt 14):** PR #799 · `docs/PROJECT_STATUS.md` · this log
- **Prompt 15 (verbatim):** `preview the filterrail with the full-height cap`
  **Response:** `preview/filterrail-height.html` (+ generator), four caps tested on the REAL built
  rail over CDP at 393x852 with the measured geometry printed per frame, not mockups. The finding:
  the one-screen ceiling does not transfer. Verlauf can scroll to the top of the screen; the filter
  panel starts 205 px down and has a fixed Üben bar beneath it, so `max-h-panel-stage` put its bottom
  border 45 px below the viewport (option C), and adding scroll-into-view only recovered 45 px before
  the page ran out of scroll (option D). 45dvh shows 329 of 658 px of filter body, 58dvh shows 440,
  the full cap 638. **Founder picked option A, keep 45dvh.**
- **Prompt 16 (verbatim):** `the blue selection rectangle here is not necessary. get rid of it. Just
  the blinking cursor is enough to show selection. Implement direclty without any preview for this`
  **Response:** the ring came from the global `:focus-visible` rule in `index.css`, not from the
  field, which is why it appeared identically on every text surface. Text fields are now exempt
  (textarea, the caret-bearing input types, contenteditable) and the 13 components that also asked
  for the ring by hand had that utility removed. Buttons, links, toggles and check/radio inputs KEEP
  it: they have no caret, so the ring is their only focus indicator. Verified on the built app by
  keyboard-tabbing: a focused button still reports a ring shadow, the focused textarea reports
  `0px 0px 0px 0px`. (The first check looked like a failure until the service worker was cleared, it
  was serving the previous build.)
- **Artifacts (prompts 15-16):** `preview/filterrail-height.html` +
  `preview/gen-filterrail-height.mjs` · `src/index.css` · 10 feature files with hand-written focus
  rings on text fields · `docs/areas/PRAKTISCH-NAV.md` · this log
- **Prompt 17 (verbatim):** `The option a is fine for now. Can you apply the same blue shade from
  the shcreiben aufgabe wahlen rail to the filter rails and filter button? Also, the buttons on the
  bottom on mobile view should be in same positions and design as schreiben aufgabe walhen - they
  should float with no background and on same position with a disclaimer below the buttons.`
  **Response, parts 1 and 2 (shipped):** the filter cap stays at 45dvh, and both FilterRail layouts
  (desktop tile, mobile panel), their header and Üben footer strips and all four filter toggles now
  wear the Schreiben rail's Himmelblau fill, with dividers tinted `border-accent-ink/10` and the
  border in the fill's own colour. This SUPERSEDES the grey `bg-muted` tile of s104, which is now
  recorded as such in CLAUDE.md, the `/design` skill and `docs/areas/BIBLIOTHEK.md`; the surviving
  half of s104 is that the controls inside stay white. The toggle needed a separate class constant
  (`BROWSE_FILTER_BUTTON`) because `BROWSE_TOOLBAR_BUTTON` ends in `bg-surface`, which wins the
  tailwind-merge against the `accent` variant.
  **Part 3 (asked, not guessed):** the Schreiben cluster's lower line is the EU AI Act Art. 50
  disclaimer, and the Bibliothek has no AI on that screen, so "a disclaimer below the buttons" has no
  obvious content there. Put to the founder rather than invented.
- **Artifacts (prompt 17):** `src/features/shared/FilterRail.tsx` ·
  `src/features/shared/browseScroll.tsx` · `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/grammar/GrammarHub.tsx` · `src/features/collocations/CollocationsBrowser.tsx` ·
  `src/features/redemittel/RedemittelTrainer.tsx` · `CLAUDE.md` ·
  `.claude/skills/design/SKILL.md` · `docs/areas/BIBLIOTHEK.md` · `docs/DECISIONS.md` · this log
  **Part 3 (shipped after the founder answered "nothing, buttons only" + "all four Bibliothek
  tabs"):** the four hand-copied sticky bars are gone. `floatingCluster.ts` moved to
  `features/shared/floatingCluster.tsx` and gained `FloatingActionCluster`, the ONE geometry both
  zones now use: fixed above the nav at Schreiben's own offset, no bar chrome, each control on its
  opaque `floatingSlot` backing, portalled to `<body>`. That portal is not optional here either:
  `LibraryHub` slides its tab panels with an `x` transform, and a transformed ancestor becomes the
  containing block for a fixed descendant. Surfaces owe the flow `CLUSTER_CLEARANCE` now that the
  bar no longer occupies it. Verified live: the Bibliothek and the Schreiben clusters sit at the same
  height, and Schreiben still carries its Art. 50 line while the Bibliothek carries none.
- **Artifacts (prompt 17, part 3):** `src/features/shared/floatingCluster.tsx` (moved + extended) ·
  `src/features/writing/GuidedWritingTrainer.tsx` · `src/features/writing/fokus/FokusTrainer.tsx` ·
  the four Bibliothek tab files · `CLAUDE.md` · `.claude/skills/design/SKILL.md` ·
  `docs/areas/BIBLIOTHEK.md` · this log
- **Prompt 18 (verbatim):** `while you're at it, reduce the spacing by 30% above and below the view
  buttons row for desktop view specifically. Also, reduce the view buttons size by 25% for both
  desktop and mobile view. \nFor desktop view - these are my observations:\nThe words cards look
  empty and too has too much blank space. use the same three columns structure as kollokations for
  it. For redemittel keep the cards heights consistent with kollokations as the redemittel cards
  abruplty become bigger in height. IN the table view of redemittel, give a german example next to
  the english translation. show a horizontal scroll wherever applicable in the views all across the
  bibliothek to indicate there are more columns to the right for the users. finally, for all the
  places applicable, instead of a page scrooll in desktop view, keep internal scroll`
- **Prompt 19 (verbatim):** `move the feedback button to the bottom line with a hyperlink button
  "feedback geben" or something like this. Spread out the blue buttons and center them. the emoji
  should be treated as part of the text when center aligning them in the blue button.`
  **Response, PART of prompt 18 plus all of 19.** Shipped: the ViewSwitcher is 25% smaller
  (40 → 30 px track, 36 → 26 px buttons, 16 → 14 px marks) at both breakpoints; the desktop stack
  around the toolbar row is 30% tighter (`lg:space-y-[1.05rem]`, `lg:gap-y-[1.05rem]`, `lg:pb-2`);
  the Wörter card grid gained `xl:grid-cols-3` to match Kollokationen, and its headword now WRAPS
  instead of truncating, because the narrower card was cutting "die Besprechung" to "die Bespre…".
  From prompt 19: `UebenLabel` puts the bolt inside the centred group instead of hanging it outside
  the flow, `FeedbackTextLink` is a new plain-text control, and `FloatingActionCluster` grew an
  optional `note` slot so the Bibliothek's previously empty lower line carries "Feedback geben"
  while the CTA sits centred and alone on the button row.
  **NOT done in this pass, still open from prompt 18:** Redemittel card heights against
  Kollokationen; a German example beside the English one in the Redemittel table; the
  horizontal-scroll affordance across the Bibliothek views; and desktop internal scrolling instead
  of page scrolling. The last of those is a layout change on every browse surface, not a class
  tweak, and was left rather than half-done.
- **Artifacts (prompts 18-19):** `src/features/shared/ViewSwitcher.tsx` ·
  `src/features/shared/browseScroll.tsx` · `src/features/shared/floatingCluster.tsx` ·
  `src/components/layout/FeedbackButton.tsx` · `src/features/library/LibraryHub.tsx` ·
  `src/features/vocabulary/VocabList.tsx` · the four Bibliothek tab files · this log
- **Prompt 20 (verbatim):** `feedback geben should not be a button below the uben! it should be a
  texxt line with a hyperlinked word same like the KI gepruft and mehr lesen link!!`
  **Response:** corrected. `FeedbackNote` is now a muted sentence carrying ONE blue word,
  "Etwas verbessern? **Feedback geben**", with no icon and no chrome of its own, which is the exact
  shape of Schreiben's "KI-geprüft, kann Fehler enthalten. **Mehr**". The previous version kept the
  sparkles mark and made the whole label blue, and an icon plus a short blue label reads as a second
  button under the CTA.
- **Artifacts (prompt 20):** `src/components/layout/FeedbackButton.tsx` · the four Bibliothek tab
  files · this log
- **Prompt 21 (verbatim):** `in desktop view:\n\nthe worter cards look too long now. Shorten them and
  move the bookmark button to the bottom right. If the word is too big that it goes to the second
  line, make sure to keep the emoji and the article in the first line and the word to be followed
  from the left in the second line. \n\nThe feedback button can be right aligned vertically with the
  filter rail, and the move to top button to the left of the feedback button, aligneed to vertically
  to left with the filter rail.`
- **Prompt 22 (verbatim):** `Etwas verbessern? Feedback geben - this still looks like a chip with
  some frosted background. Apply same design as from the schreiben section`
  **Response:** the chip was the `floatingNote` plate. It is invisible on Schreiben because the page
  ground sits behind it, but the Bibliothek's line floats over WHITE cards, where the same
  `bg-background/90` reads as frosted glass. The cluster's note slot now renders plain text.
  Wörter cards: the example is capped at two lines, which is what actually shortens the grid because
  `auto-rows-fr` sizes every card to the tallest one; the bookmark moved from the headline to the
  foot's right edge beside the speak button; and the headline became three flex ITEMS (creature,
  article, noun) so a noun that does not fit beside its article drops to the next line at the card's
  left edge instead of hanging indented under the article.
  Feedback pill and the scroll-to-top button now share ONE wrapper that mirrors AppShell's `<main>`
  (sidebar allowance, `max-w-6xl`, same padding) with a 16rem block pinned right: the pill sits at
  that block's right edge and the scroll button at its left, i.e. exactly the filter rail's two
  edges, at every width. Restoring the pill's remote-config route suppression was part of the same
  edit; the first rewrite dropped it, which would have broken the `app_config` contract silently.
- **Artifacts (prompts 21-22):** `src/features/shared/floatingCluster.tsx` ·
  `src/features/vocabulary/VocabList.tsx` · `src/components/layout/FeedbackButton.tsx` ·
  `src/features/shared/browseScroll.tsx` · this log
- **Prompt 23 (verbatim):** `I see the view buttons were decreased in size but I meant all the
  buttons in the row to be redcued not just view buttons! decrease the size of other buttons in the
  row as well.` + `and then carry on with other open comments`
  **Response:** the whole toolbar row is 30px now (the size moved into
  `BROWSE_TOOLBAR_BUTTON`, so filter, bookmark and search shrink with the switcher) and the
  transient search field matches. Then the rest of prompt 18 closed out:
  Redemittel cards took the Kollokationen anatomy and a two-line clamp; the Redemittel table gained
  a **Beispiel** column beside Englisch; `HScrollArea` fades whichever edge of a scrolling table
  still has content behind it; and **desktop now scrolls internally**.
  The last one was the only structural change: the hub is one `h-browse-stage` tall, the tabs and
  toolbar hold their place and the content column scrolls. `usePagedList` had to become root-aware
  first, via `ScrollRootProvider`, because its IntersectionObserver measures against the viewport and
  a sentinel inside a scroll container is clipped, which would have killed auto-paging silently.
  Two things went wrong on the way and were caught by verification, not by review: a naive div-depth
  matcher swallowed the FilterRail (self-closing `<div />` counted as a nesting level), and
  `.h-page-stage` goes `auto` from lg up by design, so the first attempt constrained nothing.
  **Verified at 1280x900 on all four tabs:** page 900/900, the content column scrolling internally,
  and the card count going 60 → 120 on reaching its bottom.
- **Artifacts (prompt 23):** `src/lib/scrollRoot.tsx` (new) · `src/lib/usePagedList.ts` ·
  `src/index.css` · `src/features/library/LibraryHub.tsx` · `src/features/shared/browseScroll.tsx` ·
  `src/features/shared/DataTable.tsx` · `src/features/shared/SearchField.tsx` ·
  `src/features/redemittel/RedemittelViews.tsx` · the four Bibliothek tab files · this log
- **Prompt 24 (verbatim):** `create the PR and merge`
  **Response:** the post-#799 run shipped as **PR #800** (squash-merged into `main`): commits
  `d5699c0`, `dbf15af`, `bd982aa`, `407c91a`, `bee7f60`, `cc54f94`, `5f4aea0`, `90940ad`, plus this
  documentation pass. 36 files. No migrations and no Edge Function changes, so only the Pages deploy
  matters; the founder verifies the live result.
- **Artifacts (prompt 24):** PR #800 · `docs/PROJECT_STATUS.md` · this log

## Session 190 — 2026-08-05 — Bibliothek defects after the internal-scroll change

Branch: `claude/card-transparency-go-to-top-jygye9`. Seven founder prompts, all of them defect
reports against what PR #800 shipped the day before. No preview round: every item was a bug in an
already-approved surface, so each was reproduced in headless Chromium against the dev server,
measured, fixed, and re-measured.

- **Prompt 1 (verbatim, screenshot of the Wörter Karten view):** `the background of the cards
  doesn't look transparent, fix it! where is the go to top button? read my comment from previous
  session on where to put it.`
- **Prompt 2 (verbatim, mid-turn, screenshot of the collapsed filter rail):** `the filter button is
  buggy!! fix it`
- **Prompt 3 (verbatim, mid-turn, crop of the toolbar with an empty white square):** `search button
  is buggy`
- **Prompt 4 (verbatim, mid-turn, two crops):** `the collocations and redemittel cards are not of
  same height as doscussed in the previous session - fix it. Also, why are there blue outlines on
  toggle buttons and on filter button? it shouldn't be the case - fix it!`
- **Prompt 5 (verbatim, mid-turn):** `transparent cards? I meant the bacground surrounding the cards
  should be transparent meaning the background should be the page background. The area surrounding
  the worter cards look abruptly cut - this needs fixing`
- **Prompt 6 (verbatim, mid-turn):** `make sure all the comments are addressed well and tested from
  my feedback in previous section.`
- **Prompt 7 (verbatim, mid-turn):** `once done, push it live and document the session`

**Response summary.** Five of the six defects trace to ONE change: s189 moved the desktop scroll
from the page into the content column, and three separate things had been reading the window.

1. **The go-to-top button.** `useScrollDirection` listened to `window` only. On desktop the window
   never moves any more, so `scrolled` never flipped and the button never rendered; it still worked
   on mobile, which is why it looked "missing" rather than broken. The hook now takes the scroll
   container, reads whichever element actually scrolls (the column only counts while it overflows,
   which is false below `lg`), and listens to both. `ScrollTopButton` scrolls that same element.
   Its PLACEMENT is unchanged and is the founder's s189 rule, re-verified by measurement: the
   button's left edge sits at the filter rail's left edge (1000 px) and the Feedback pill's right
   edge at the rail's right edge (1256 px).
2. **The filter rail.** A grid item defaults to `align-self: stretch`, so the rail always grew to
   its `lg:max-h-[calc(100vh-21rem)]` cap: 564 px of Himmelblau whether it held filters or not, and
   collapsing it left the founder's screenshot, a header, the Üben button and ~450 px of empty
   fill. It is `lg:self-start` now, sized by content, capped against the stage
   (`lg:max-h-[calc(100%-3.5rem)]`) rather than a hard-coded viewport guess. Measured: open 655 px,
   collapsed **119 px**. The `3.5rem` reserve is deliberate: at `max-h-full` the rail's own Üben
   button overlapped the go-to-top button floating at its bottom-left corner.
3. **The search and bookmark buttons.** `BROWSE_TOOLBAR_BUTTON` (s189) ends in `bg-surface`, which
   wins the tailwind-merge against the Button `default` variant's `bg-primary` while
   `text-primary-foreground` survives. The ON state was therefore white-on-white: measured
   `bg rgb(255,255,255)` / `color rgb(255,255,255)`, i.e. the empty square in the founder's crop.
   New `BROWSE_TOOLBAR_BUTTON_ON` constant, appended after the base class so the fill wins; the ON
   state is now `bg rgb(40,102,235)` with a white mark. This is the third time this exact merge
   order has bitten (s189 needed `BROWSE_FILTER_BUTTON` for the same reason), so the constant
   carries the explanation.
4. **"The background of the cards doesn't look transparent."** Prompt 5 corrected the reading: the
   surrounding background, not the card fill. Measured first: the column AND its parent already
   paint `rgba(0,0,0,0)`, so nothing was covering the page ground. The real defect was the second
   half of the sentence, the abrupt cut: a scroll container slices whatever crosses its edge, so a
   card is chopped through the middle by a hard horizontal line. `useEdgeFade` + the
   `mask-fade-*` utilities fade the CONTENT at whichever edge still has content behind it, which is
   the vertical twin of `HScrollArea`'s existing fades. A mask, not a gradient overlay: an overlay
   needs one flat colour and the ground is a gradient, so it would band in light mode and grey out
   in dark. Desktop only (`lg:`), and never at an edge that is already at its end.
5. **The blue outlines.** The global `:focus-visible` ring. It could not be reproduced headless
   (Chromium reports `focusVisible: false` after a click), so it was fixed by mechanism rather than
   by chasing one browser's heuristic: `trackInputMode()` marks `<html data-input="pointer">` on
   pointerdown and `"keyboard"` on the keys that move or activate focus, and one CSS rule drops the
   ring while the pointer is in charge. Keyboard navigation keeps the ring untouched, so WCAG 2.4.7
   still holds. Verified: `pointer` after a click with no ring, `keyboard` after Tab.
6. **Card heights (Kollokationen vs Redemittel).** Not the Wendung, as it looked. `FlipCard` gives a
   tile its TALLER face, and the Redemittel BACK carried an unclamped translation, note and English
   example: front 165 px, back 272 px, and `auto-rows-fr` then pushed all 193 cards to 272. Every
   back part is capped at two lines and the front headline at three (the tallest headline the
   Kollokationen grid produces), each with a `title` so the full text stays on hover, and in Liste
   and Tabelle in full. Measured: Redemittel **272 → 188 px**, Kollokationen 195 px. The remaining
   7 px is anatomy, not padding: the Kollokationen example row carries a SpeakButton.

**Prompt 6 (audit of the previous session's feedback), re-measured in the browser rather than read
off the log.** Confirmed live: the Redemittel table's **Beispiel** column beside Englisch; the
horizontal-scroll fades; desktop internal scroll with the page not scrollable on all four tabs; the
30 px toolbar row; the Feedback/go-to-top docking to the rail's two edges; the Wörter three-column
grid. The one item still open from that list was the card-height parity above, now closed.

**Verification:** headless Chromium at 1280x900 (all four tabs, rail open + collapsed, search open,
mid-scroll) and 390x844 for the mobile fallback, where the page still scrolls, the button is still
centred above the Üben bar and no mask applies.
**Gates:** typecheck · lint 0 errors (77 warnings, identical to the pre-change baseline) ·
test:unit **551/551** · build · check:bundle 126.6 kB of 400 kB · check:contrast all pairings pass.
- **Artifacts (prompts 1-6):** `src/features/shared/browseScroll.tsx` · `src/lib/inputMode.ts` (new)
  · `src/main.tsx` · `src/index.css` · `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` ·
  `src/features/redemittel/RedemittelTrainer.tsx` · `src/features/grammar/GrammarHub.tsx` ·
  `CLAUDE.md` · `docs/areas/BIBLIOTHEK.md` · `docs/DECISIONS.md` · `.claude/skills/design/SKILL.md` ·
  `docs/PROJECT_STATUS.md` · this log


## Session 190 · 2026-08-05 · branch `claude/polish-ui-ux-design-92sbje`

- **Prompt 1 (verbatim):** `These pages are okay at the moment but they still look cheap or like MVP.
  I want them to look highly polished, excellent UI/UX, like a billion dollar edu tech app developed
  by some of the best experts in the world known for front end design. Do a thorough analysis of the
  current state and suggest improvements along with a few previews` (with two desktop screenshots of
  `/anwenden`: the Modelltest tab and the Module üben tab)
  **Response:** analysis first, no app code touched. Twelve findings across composition, content and
  craft, the load-bearing ones being that the two tabs do not share a page width (Module üben caps at
  896px, Modelltest runs the full 1152px column), that the desktop run band is a phone row stretched
  over ~430px of hairline per gap, that "Ohne Uhr" is printed four times under a switch that already
  says "Ohne Zeit", that the exam's total length is never stated, and that a first visit renders a
  KPI row of three dashes. Three options previewed, each with desktop + phone frames for both tabs
  and a light/dark and Ohne Zeit/Mit Zeit switch: **A "Verdichtet"** (mark, title and the affordance
  on one line, no foot row, the card loses a third of its height), **B "Prüfungstag"** (the band
  becomes a two-column ticket with the total as a display number and the four Teile as a ladder;
  Verlauf leads with a development strip against the pass line; module cards get a corner wash in
  their own hue) and **C "Bereit"** (a practice meter and a last-practised line per module card, a
  recency line under the CTA). Seven fixes are shared by all three. Awaiting the founder's pick.
- **Artifacts (prompt 1):** `preview/gen-pruefung-polish.mjs` · `preview/pruefung-polish.html` ·
  `preview/pruefung-polish-artifact.html` (artifact
  https://claude.ai/code/artifact/fd7d867c-39e0-4f7d-9525-3d64270b6e04) · this log
- **Prompt 2 (verbatim):** `I like option B overall but in the modul uben, the mit Zeit's badges should
  not affect the size of the cards, they should rather appear on the bottom right of the cards where
  there is empty space. Also, the verlauf section proposed in option B should be available in module
  uben - adapt and build it for modul uben if it requires additional stuff. In case of modelltest
  verlauf, I like the bester, letzter KPIs but it needs better visualization. By keeping this in mind,
  provie me new set of previews`
  **Response:** round 2 (`preview/pruefung-polish-r2.html`, artifact redeployed to the same URL). B is
  locked; only the three asks carry options. **The card:** the minutes badge is absolutely placed in
  the corner the colour wash already occupies and that corner is RESERVED in both clock states, so the
  card has one height whether the clock is on or off, and a two-line description on a phone can never
  run under the badge. **Modelltest Verlauf, three visualisations** (all keep Letzter/Bester/Bestanden,
  none uses the three flat cells): V1 "Im Diagramm" (the chart carries the labels), V2 "Zahl und Kurve"
  (display figure + delta, chart beside it), V3 "Ring und Punkte" (a gradient ring with the 60 % pass
  tick, a meter for Bester, one dot per run for Bestanden). Sample data changed so the best run (82 %)
  is not the last (78 %). **Module üben Verlauf, three shapes:** M1 "Vier Trends" (one row per module
  with a colour-coded spark and the last score), M2 "Chronik" (the Modelltest card's shape, bars
  coloured per module), M3 "Stärkeprofil" (four columns, pale = first attempt, solid = the gain since).
  The one data addition all three need is stated in the preview: a small local last-practised stamp per
  module written by all four surfaces, because the untimed trainers' results live in the cloud writing
  history the hub must not fetch. Every one of the nine V/M combinations was measured at exactly
  668 of the 668px a 393x852 phone leaves, in both clock states, so no combination scrolls at rest.
- **Artifacts (prompt 2):** `preview/gen-pruefung-polish-r2.mjs` · `preview/pruefung-polish-r2.html` ·
  `preview/pruefung-polish-artifact.html` (same artifact URL as round 1) · this log
- **Prompt 3 (verbatim):** `V2 and M3. while implementing take screenshots during the testing phase
  and optimize and polish the spacing based on my taste and how I suggested in previous design
  sessions. Make it as smooth, refined and finished as possible before finilising the design without
  any bugs. I want the implementation to look like a final product, not an mvp or intermediate stage.`
  **Response:** built V2 + M3 into `PruefungHub.tsx`, then drove the REAL app in headless Chromium
  (a small CDP driver, no new deps: seeds localStorage, sets the viewport, screenshots, and reports
  `scrollHeight` vs `innerHeight` so "rests at zero scroll" is measured rather than eyeballed).
  Fourteen states were shot and read: both tabs × {1280×900, 1440×900, 1024×820, 834×1112, 393×852}
  × {light, dark} plus Ohne Zeit / Mit Zeit, expanded, first visit, an unscored run and A2.
  **What the screenshots caught that the mockups could not:** the desktop Module tab scrolled at rest
  (930px of content against 780px of room) → the Module Verlauf splits into summary | rows from `lg`,
  which also stops the card wasting the width the profile does not use; the switcher stretched the
  full column on an 834px tablet → capped at `max-w-sm` between `sm` and `lg`; the run band was
  `flex-1` up to `lg` → on a 1112px-tall tablet it stretched one card to 800px, so filling the stage
  is a phone rule now; M3's dotted "first attempt" marker was invisible over a saturated fill → two
  stacked segments (pale = start, solid = gain); a "–" column rode 4px higher than a scored one →
  fixed line height; the profile columns did not centre against an expanded list → vertical centring;
  and a run with no score printed four empty tracks that read as a skeleton → "Nicht bewertet".
  Also shipped: one shared 896px frame for both tabs, a height-stable scope row, the Bibliothek's
  directional tab slide, in-family gradient mark tiles, the card corner wash + reserved badge corner,
  "52 Min gesamt" stated once per breakpoint, and the honest split of `mockExams` into full runs vs
  module practice (`tests/pruefungHub.test.ts`, 7 new tests). Gates green: build, typecheck,
  `lint` (0 errors), `test:unit` 558/558, `check:contrast`, `check:bundle` (125.8 kB of 400).
- **Artifacts (prompt 3):** `src/features/pruefung/PruefungHub.tsx` · `src/features/exam/partMeta.ts` ·
  `src/index.css` · `tests/pruefungHub.test.ts` · `docs/areas/PRAKTISCH-NAV.md` · `CLAUDE.md` ·
  `docs/DECISIONS.md` · this log
- **Prompt 4 (verbatim):** `once done, push it live and document the session`
  **Response:** opened and squash-merged the PR into `main` (auto-ship), which triggers the Pages
  deploy; no migrations and no Edge Function changes are in it, so only the site deploy matters. The
  founder verifies the live result. Documentation pass across `PROJECT_STATUS.md`, `DECISIONS.md`,
  `docs/areas/PRAKTISCH-NAV.md`, `CLAUDE.md` and this log.
- **Artifacts (prompt 4):** PR #801 · `docs/PROJECT_STATUS.md` · this log

## Session 191 — 2026-08-05 — branch `claude/remove-tile-gradient-4fcowe`

- **Prompt 1 (verbatim):** `[screenshot of /anwenden, Module üben] get rid of the colored gradient
  from the tiles here.`
  **Response:** the cards carried two coloured gradients from s190, and both are gone. The card's
  hue radial (`.mod-wash-*` in `index.css`, the span in `ModuleGrid`, the `wash` field on
  `PART_META`) is deleted outright, and `PART_META.tile` went from an in-family gradient to a flat
  tint per module (emerald / teal / primary / sky, `/15` light and `/20` dark), so the mark still
  carries the receptive-vs-productive colour fact without a gradient. The badge corner is still
  reserved by the card's bottom padding, so the Ohne Zeit / Mit Zeit switch cannot move a card edge.
- **Prompt 2 (verbatim):** `increse the space below the toggle buttons slightly to subtly
  differentiate the toggles and tiles sections.`
  **Response:** the hub's outer column went `gap-4 sm:gap-5` → `gap-6 sm:gap-7`. That gap is only
  between the header block (switcher + scope row) and the tab content, so the two sections separate
  while the gaps inside each block (grid ↔ Verlauf, switcher ↔ scope row) stay as they were.
  **Verification:** the s190 CDP driver was rebuilt in the session scratchpad (Node 22's built-in
  `WebSocket`, no new deps): seeds `b2beruf.settings.v1`, opens `/anwenden` in the built app and
  reports `scrollHeight` vs `innerHeight` plus every element inside `main` with a background-image.
  Zero page scroll at 360x640, 393x852 (light and dark) and 1280x900; the gradient list is empty.
  Gates green: build · typecheck · lint (0 errors, 77 warnings = the pre-change baseline) ·
  `test:unit` 558/558 · `check:bundle` 126.6 kB of 400 · `check:contrast`.
- **Artifacts (prompts 1-2):** `src/features/pruefung/PruefungHub.tsx` ·
  `src/features/exam/partMeta.ts` · `src/index.css` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` ·
  this log · **PR #803**, squash-merged as `f0fa0b7`
- **Prompt 3 (verbatim):** `document the session`
  **Response:** the documentation pass had already shipped inside PR #803 (`PROJECT_STATUS.md` with
  the s191 handoff and lead paragraph, the older s190 Bibliothek handoff moved into
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` to hold the ~250-line cap,
  `docs/areas/PRAKTISCH-NAV.md` for the no-gradient card rule and the section gap, and this log).
  This pass records the merge itself (PR number and squash SHA, which were not known when the entry
  was written) and logs this prompt. `CLAUDE.md` needed no edit: it states the reserved badge corner
  and the shared Prüfung frame, neither of which changed, and it never named the wash.
- **Artifacts (prompt 3):** `docs/SESSION_PROMPT_LOG.md` · `docs/PROJECT_STATUS.md`
- **Prompt 4 (verbatim):** `[screenshot of /anwenden, Mit Zeit] there seems to be a big with the
  time badges overlapping on the text. Can you just remove the text and just keep the badges in this
  page?`
  **Response:** confirmed as a real bug and fixed at the cause: the minutes badge is ~24px tall and
  is held 12px off the card's bottom edge, so it needs 36px, while the reserve added for it in s190
  was `pb-[1.75rem]` (28px). With the clock ON it therefore crossed the description line on all four
  cards. Per the founder's instruction the description is removed rather than the reserve grown:
  `ModuleGrid` renders mark, arrow, title and badge, `FREE_DESC` is deleted, and `PART_META.desc`
  stays because the Anleitung pages read it. The only line that can still appear is the empty state
  "Noch keine Inhalte", which renders only when the card has no badge, so the two can never collide.
  **Verification:** the CDP driver now clicks "Mit Zeit" and reports every badge/text rectangle
  intersection inside a card. Six states shot (Mit Zeit at 360x640, 393x852 light + dark, 1280x900;
  Ohne Zeit at 393x852 and 1280x900): zero intersections, zero page scroll everywhere, and the card
  edges are identical in both clock states, so the reserve still does its job.
- **Artifacts (prompt 4):** `src/features/pruefung/PruefungHub.tsx` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/PROJECT_STATUS.md` · this log · **PR #805**

- **Prompt 5 (verbatim):** `merge everything to main and document the session`
  **Response:** PR #805 was green (`lint-content` success) and is squash-merged into `main` as
  `68b500c`, after PR #803 (`f0fa0b7`) and the docs PR #804 (`14b2a20`) earlier in the session, so
  everything from s191 is on `main` and nothing is left on the branch. Post-merge housekeeping ran
  after each merge (`fetch origin main` → `reset --hard` → `push --force-with-lease`); the branch is
  clean at `68b500c`. Documentation for prompts 1-4 had shipped inside their own PRs; this pass adds
  the #805 merge SHA to the s191 handoff and logs this prompt.
- **Artifacts (prompt 5):** `docs/PROJECT_STATUS.md` · this log

## Session 192 — 2026-08-05 — branch `claude/prufung-ui-bottom-bar-u0fdwf`

- **Prompt 1 (verbatim):** `[screenshot of /writing, Fokus, on a phone] replace the feedback button
  with zuruck and the user should navigate back to the prufung hub. add feedback geben right next to
  KI geprüft, similar to Bibliothek section. the prufung bottom bar isn't selected here - check this
  for all the pages where the bottom bar is visible but not selected and fix it. fix any other bugs
  spotted`
  **Response:** three changes.
  (1) The mobile floating cluster's left slot is `BackToPruefung`, a new
  `src/features/writing/bottomChrome.tsx`: the retired Feedback button's exact geometry (44px,
  `rounded-xl`, quiet outline, opaque `bg-surface` because the cluster has no bar behind it) linking
  to `/anwenden`, not to history, since `/writing` is entered from the hub card, the dashboard
  recommendation and ⌘K. Fokus keeps its rule that the cluster disappears once a correction exists;
  the lit Prüfung tab is the way back in that state.
  (2) Feedback moved DOWN beside the KI note as the Bibliothek's own link:
  "KI-geprüft, kann Fehler enthalten. Mehr · Feedback geben". `FeedbackLink` is factored out of
  `FeedbackNote` so both surfaces share one definition, and `FeedbackIconButton` is deleted (it had
  no other call site). Both trainers now render ONE `MobileAiNote`, which is what stops the two
  copies of the locked bottom geometry from drifting apart. Measured in the real build: one line at
  360px AND at 320px, so it cannot grow into the buttons above it.
  (3) The bar bug: `NavLink` decided the active tab from the URL, so every page one level below a
  hub left the bar visible with nothing lit. `navZoneOf` (`nav-items.ts`) folds a route into the tab
  that owns it (`/writing`, `/simulation`, `/exam` → Prüfung; `/quiz` + the retired per-tool routes
  → Bibliothek; `/session`, `/revision`, `/welt` → Praktisch; `/sammlung` → Fortschritt), and the
  bar and the sidebar both read it. Both now render a plain `Link`: `NavLink` would re-decide the
  state AND it swallows `aria-current` (it treats that prop as "the value to use when I consider
  myself active"), so the lit tab announced nothing to a screen reader. That was the "other bug"
  worth fixing here. Verified by driving the built app: all twelve in-shell routes light their zone,
  `/session` and `/revision` have no bar (focus mode), none is blank.
- **Prompt 2 (verbatim):** `[screenshot of the Hören Anleitung, Ohne Zeit] I see such screens for
  hören and lesen for Ohne Zeit as well - the problem is that this screen mode represents exam mode.
  This should only be shown when a user is in mit zeit mode. Keep this consistent for all the
  modules`
  **Response:** the Anleitung is Mit Zeit's screen now. `useExamStore.start` opens an untimed module
  straight in `phase: "part"` (and `completePart` never routes a next part through an intro either),
  so Ohne Zeit lands on the first question, exactly as Schreiben and Sprechen ohne Zeit land in
  their trainer. The FRAME follows the same logic: the header's exit is a neutral **Zurück** arrow
  instead of the red Verlassen (the flag rides `useSessionStore.examUntimed`, because AppShell is
  eager code that may not import the exam store), leaving an untimed drill with nothing answered,
  noted or written asks no confirm at all, and the confirm it does show says "Übung verlassen?".
  What deliberately stays exam-shaped is the STAGE (one viewport, no bottom bar, internal scroll):
  it is what keeps a Teil at zero page scroll, and a visible tab bar would let a learner re-enter
  the persisted run in a loop. Flagged to the founder as an open question. `PartIntro` keeps its
  untimed wording for the one case that can still reach it, a run persisted mid-intro before this
  deploy. Verified in the real build: Ohne Zeit Lesen and Hören open on the question, Mit Zeit still
  opens on "PRÜFUNGSTEIL … der Timer läuft, sobald du startest".
- **Artifacts (prompts 1-2):** `src/features/writing/bottomChrome.tsx` (new) ·
  `src/features/writing/fokus/FokusTrainer.tsx` · `src/features/writing/GuidedWritingTrainer.tsx` ·
  `src/components/layout/FeedbackButton.tsx` · `src/components/layout/nav-items.ts` ·
  `src/components/layout/BottomTabBar.tsx` · `src/components/layout/Sidebar.tsx` ·
  `src/components/layout/AppShell.tsx` · `src/store/useSessionStore.ts` · `src/store/useExamStore.ts` ·
  `src/features/exam/MockExamRunner.tsx` · `CLAUDE.md` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/areas/SCHREIBEN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` · this log · **PR #807**,
  squash-merged as `78ad6b9`

## Session 193 · 2026-08-05 · branch `claude/sprechen-ai-speaking-redesign-oa9fu1`

- **Prompt 1 (verbatim):** `the sprechen part looks quite strange as the learner never get to speak.
  can you rethink the whole sprechen stuff and maybe determine how it would look like to insert a
  feature where the learner gets to speak with ai llm model like in chatgpt or gemini?`
  **Response:** analysis + preview only, no app code touched (design skill rule 1: report and preview
  before implementing). **The audit confirmed the founder's observation and found it is worse than it
  looks:** the Sprechtrainer (`features/simulation/`) is a branching script answered by tapping one of
  2-4 written options, its "free speaking" node offers a text box placeholder ("Tippe deine Antwort
  (optional)"), and `scoreDialogue` averages an author-assigned `quality` number, so it measures which
  option was picked, never the learner's German. The mock exam's **Teil Sprechen embeds that same
  runner and is graded by the learner ticking their own rubric checkboxes** (`ExamRunner` →
  `submitSelfScore`), so the speaking grade in the Modelltest is a self-assessment. The one genuine
  speaking drill in the app is the single-word STT block in the Üben session, which means
  `engine/speech.ts` already ships a working feature-detected `listen()` wrapper that the entire
  Sprechen area never calls.
  **Thesis proposed:** Sprechen is Schreiben with a microphone (brief → conversation → the EXISTING
  `features/writing/correction.tsx` card as the debrief), and explicitly NOT an open chatbot: an LLM
  adapts down to the learner, never corrects unless asked, and produces no assessment, so the brief
  (named partner, register, 2-4 Leitpunkte) is what makes it an exercise rather than small talk. The
  645 authored dialogue nodes become briefs (title/task/context/targetRedemittel are already the right
  fields); the branching trees retire; scenario ids stay.
  **Three voice pipelines costed** (grounded in current provider pricing, not memory): A browser
  STT + text LLM + browser TTS ≈ 2-4 cents per 12-turn conversation and ~0 while the existing free
  Gemini Flash tier absorbs the turns; B cloud STT/TTS ≈ 10-20 cents plus an audio-retention change to
  the privacy policy; C realtime speech-to-speech at 5-10 cents/min cached, 18-46 cents/min uncached,
  i.e. one six-minute conversation can exceed a fifth of the $5 monthly cap. Recommended A now,
  structured so B is a one-function swap, C reserved for a paid tier.
  **Three named layouts previewed** for the live conversation: **Gespräch** (chat thread),
  **Bühne** (one turn on a fixed stage), **Anruf** (no text at all, debrief is the reveal), plus the
  shared brief and debrief screens.
  **Verified in headless Chromium rather than eyeballed**, which caught three real bugs in the mockup:
  a flex column without `min-width: 0` sat 21px wider than the phone frame and dragged the transcript
  out of view; `flex: none` on the cards exposed that the debrief is genuinely taller than one screen
  (answered with the exam's stage treatment, pinned header/actions + ONE inner scroll region + a
  `mask-image` edge fade, per the s190 slicing rule); and a `.col` rule matching NESTED columns
  stretched the Bühne "Du" block and shoved the stage off-centre. Final state: all five phone frames
  rest at exactly 0 scroll with 0 overhang, light and dark.
  **Open for the founder:** the layout by name; the pipeline; the daily allowance (proposed 2
  conversations/day, alongside Lang); and whether Anruf's "Auflegen" may be red (drawn neutral, since
  danger red is reserved for errors).
- **Artifacts (prompt 1):** `preview/sprechen-ai-redesign.html` ·
  artifact `https://claude.ai/code/artifact/acf10478-7f26-4924-b451-fb620b56e15a` · this log
- **Prompt 2 (verbatim):** `use option a for practice sessions where user could find useful to keep
  track of the transcripts, and use option b and c for exams - decide which layout to use depending
  on the tasks, like notiz machen should take option c and other tasks may show the aufgabe on the
  screen with layout b. for all other asepcts, go ahead with your recommendations.`
  **Response:** built the whole feature. The founder's answer was a MAPPING rather than a pick, so
  the layout became **a property of the task, never a learner setting**: `ExamSet.stage` defaults to
  `buehne` (the Aufgabe stays readable, right for all 15 authored "discuss and agree" sets) and only
  a task that reading would defeat sets `anruf`; practice is always `gespraech`. The content linter
  rejects `"gespraech"` on an exam set, because the transcript is a practice affordance. The three
  layouts are three MIDDLES of one `ConversationRunner`, not three screens.
  **Shipped:** `engine/conversation.ts` (pure turn state machine, 14-turn cost ceiling, no scoring
  at all) · `engine/speaking.ts` (briefs DERIVED from scenarios and exam sets rather than authored
  twice; exam `aspects` were always the Leitpunkte) · `supabase/functions/converse` (two modes:
  cheap turns and one richer debrief; free Gemini Flash → Claude → OpenAI) · migration 0017 ·
  `lib/speaking.ts` · `features/sprechen/*` (runner + three stages, brief, debrief, mic cluster,
  speech hook) · rewritten `features/exam/SprechenPart.tsx` (self-scored checkboxes gone) ·
  `sprechen` added to `lib/aiAllowance.ts` at 2/day.
  **Cost guards worth keeping:** the conversation row is written when a conversation STARTS, not
  when it finishes, so the daily limit counts what actually costs money and a learner cannot abandon
  conversations to farm free turns; and the turn ceiling is measured against the STORED transcript,
  never the request body, so a forged body cannot extend a run past its cost ceiling.
  **Two things I got wrong first and fixed:** the debrief inferred "did you use this Redemittel?" by
  matching the category label against the transcript, which is theatre (nobody says "Vorschläge
  machen"), so the model is asked for it instead; and the exam part completed the moment the score
  arrived, which would have unmounted the runner before the learner read a word of their feedback,
  so it completes on EXIT carrying the score. A third, caught by the linter: an engine function
  named `useHint` read as a React Hook (`applyHint`).
  **Verified by driving the REAL built app** in headless Chromium at 393x852 and 1280x900, not by
  reading mockups: both rest at exactly 0 scroll, and it caught that the brief fallback made every
  situation read "Gesprächspartner:in" with the whole task sentence as its single goal. Partner + 3
  goals were then authored for **all 36 scenarios**.
  **Privacy shipped in the same change** (the repo's law: a retention timer and the copy describing
  it never ship apart): a microphone section in both languages stating that audio never leaves the
  device, the 730-day purge extended to transcripts, and `PRIVACY_LAST_UPDATED_ISO` +
  `CONSENT_VERSION` bumped together for the drift gate.
  **Retired:** `features/simulation/`, `features/exam/ExamRunner.tsx`, `engine/dialogue.ts`.
  `tests/scenarios.test.ts` was rewritten: it pinned an invariant of the branching era ("every
  scenario contains a free-speak node"), which this change makes meaningless because every turn is
  now production.
  **The one deliberate gap, reported not papered over:** "notiz machen" names a task SHAPE (`notiz`
  is a Hören `TextKind`), and no authored speaking set is listen-and-hold, so **Anruf is built,
  tested and unreached** until such tasks are authored. That is the next content job.
  Gates: typecheck · lint 0 errors (75 warnings, down from 77) · 592 tests · build ·
  check:bundle 126.6 kB · check:contrast · lint:content · lint:migrations.
- **Artifacts (prompt 2):** `src/engine/conversation.ts` · `src/engine/speaking.ts` ·
  `src/features/sprechen/*` · `src/features/exam/SprechenPart.tsx` · `src/lib/speaking.ts` ·
  `src/lib/aiAllowance.ts` · `src/data/dialogues.ts` (36 briefs) ·
  `supabase/functions/converse/index.ts` · `supabase/migrations/0017_speaking_conversations.sql` ·
  `src/features/legal/PrivacyPolicy.tsx` · `src/lib/legalMeta.ts` · `src/lib/consent.ts` ·
  `scripts/lint-content.mjs` · `tests/conversation.test.ts` · `tests/scenarios.test.ts` ·
  `docs/areas/SPRECHEN.md` · `CLAUDE.md` · `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` · this log


## Session 194 · 2026-08-05 · branch `claude/prufung-hub-audit-5nvdvo`

- **Prompt 1 (verbatim):** `i want you to do a thorough audit and analysis of the prufung hub to
  find all bugs, inconsistencies, gaps with all kinds of things, be it front end or back end and
  give me a detailed report`
  **Response:** audit only, no app code touched. Scope: `/anwenden` (both tabs), the Modelltest
  runner and its four Teile, the two free trainers the hub feeds (`/writing`, `/simulation`), the
  engines (`engine/exam.ts`, `engine/speaking.ts`, `engine/conversation.ts`), the stores
  (`useExamStore`, `mockExams` in `useProgressStore`), the `converse` Edge Function and migration
  0017, the nav/shell integration, and how the zone's results surface on Fortschritt. Content pools
  were measured by running the composer against the real banks rather than read off the docs.
  **35 findings, ranked.** Six blocking: an untimed Lesen/Hören module cannot be finished with one
  answer blank (Ohne Zeit is the resting state, so it is the default path); nothing has written
  `examsDone` since the old exam runner retired, so Fortschritt's Prüfung card reads "noch keine
  Simulation" and "0 Prüfungen" forever while `mockExams` fills up; the exam clock is a tick counter,
  so a background tab or a reload pauses it; the conversation turn ceiling is enforced server-side
  only and `canSpeak`/`turnsLeft`/`conversationOver` are all unread, so the local transcript diverges
  from the graded one; Teil Sprechen offers "Nochmal", so a candidate can re-sit it; and `examBrief`
  hardcodes `level: "B2.1"`, so every Modelltest speaking part is pitched and graded at B2.1 whatever
  Niveau was chosen. **Three patterns explain most of it:** a retired feature left its readers
  behind, Ohne Zeit was bolted onto a flow whose only exit was the clock, and the server enforces
  what the client never displays. **Content findings:** Durchsagen are eligible as Lesen texts (38%
  of the B2 reading pool); a C1 Hören is mostly B2.2 and can never carry the Notizen task its own
  Anleitung promises; and no Alltag speaking task exists above scenario level 1, so a B2 or C1
  Modelltest can only ever serve a workplace task. Also flagged: spoken transcripts are missing from
  the GDPR export, the exam's Schreiben correction is computed and never shown, the zone awards
  almost no XP, and opening the hub pulls ~825 kB of content banks and re-scans them unmemoised on
  every render. Gates re-run green as a baseline: typecheck · lint 0 errors / 75 warnings ·
  592 tests · build · check:bundle 127.0 kB.
- **Artifacts (prompt 1):** `docs/reports/pruefung-audit-2026-08-05.md` ·
  `docs/PROJECT_STATUS.md` · this log

- **Prompt 2 (verbatim):** `fix all the issue and open a pr and merge. once done document the
  session`
  **Response:** all 35 findings fixed, gates green, PR opened and squash-merged.
  **Blocking six.** P1 the untimed dead end: "Teil abschließen" is unconditional on the last
  question, blanks cost a confirm naming the count. P2 Fortschritt reads `mockExams` through a new
  bank-free `isFullMockRun` in the progress store (so a lazy route classifies runs without pulling
  ~500 kB of content banks behind it); `completeExam` deleted, `examsDone` RETIRED but kept and
  synced because it is real pre-s186 history. P3 the clock is a deadline (`endsAt`), ticked on
  mount and on `visibilitychange`, with a legacy fallback so a run persisted mid-part across the
  deploy still finishes. P4 the client enforces the 14-turn ceiling, counts down from three and
  ROLLS BACK a turn whose round trip failed (`dropLastLearnerTurn`), because the debrief grades the
  stored transcript. P5 no "Nochmal" in exam mode. P6 `examBrief` takes the run's band
  (`EXAM_BAND[plan.level]`) instead of a hard-coded "B2.1".
  **Gaps.** The exam's Schreiben correction renders (`correction.tsx`'s fifth caller, from
  `run.essay` + `corrected`); the brief card's `disabledReason` is wired to the daily allowance;
  the Modelltest band states what a run costs the daily writing AND speaking budget and warns when
  either is out; the Sprechtrainer got `BackToPruefung` and a `?level=`/`?sz=` URL scope (so ⌘K now
  deep-links a searched situation); Hören guards TTS, offers the text when the browser cannot speak,
  counts a play on a real start, cannot be double-tapped and stops when the Ansage changes;
  `useSpeechInput` re-opens across the recogniser's automatic end instead of wiping the transcript;
  `speaking_conversations` is in the GDPR export.
  **Content.** `readingPool` excludes audio kinds (Durchsagen were 38% of the B2 reading pool;
  pools stay 9/16/5). Two C1 audio texts authored, one carrying the first C1 Notizen sheet, so a C1
  Hören no longer tops up from B2.2 at all, plus the Anleitung now describes the DRAWN plan
  (`instructionsPlain` when there is no Notizen sheet). Six Alltag exam sets authored at B2 and C1
  over scenarios that already existed at those rungs (`ex_auslaenderbehoerde`, `ex_wohnungsmangel`,
  `ex_internetstoerung`, `ex_widerspruch`, `ex_mietminderung`, `ex_kostenuebernahme`), because every
  Alltag set hung off a level-1 scenario and a B2/C1 Modelltest could only serve a workplace task.
  The authored `rubric` is on screen again (the Sprechen Anleitung's "Bewertet wird" line) rather
  than being linter-required and rendered nowhere, and `lintExamSets` now caps `aspects` at the 5
  the debrief can grade.
  **Backend.** `converse` accumulates `cost_estimate` instead of overwriting it per turn (the
  debrief was not counted at all), refunds the daily unit when a conversation's very first turn
  fails, counts the day's rows once instead of on every turn, and REFUSES an over-long utterance
  rather than clipping it so the shown and stored transcripts cannot disagree.
  **XP.** A graded conversation pays `scenarioComplete` (defined since the branching era, awarded by
  nobody) and a single module sitting pays a new `moduleComplete`; both used to pay zero while
  counting for the streak.
  **A11y + perf.** The switcher is a real tablist (ids, `aria-controls`, roving tab stop, arrow
  keys), the Niveau listbox has arrow keys and returns focus, the Verlauf expander has
  `aria-controls`, the score chart and the run rows have text alternatives; availability is
  memoised per mount for every level instead of re-walking two banks on every render, and the
  Niveau list shows each level's honest count so A2 looks dead before it is picked.
  **Not taken further, on purpose:** the second half of P28. The per-render re-scan is fixed but the
  hub still LOADS the banks, because `engine/exam` imports them; the real fix is precomputing
  availability at build time like `frequency.ts`, which is a generator job rather than a bug fix.
  Gates: typecheck · lint 0 errors (75 warnings, unchanged) · 610 tests (up from 592) · build ·
  check:bundle 127.1 kB · check:contrast · lint:content · lint:migrations.
- **Artifacts (prompt 2):** `src/features/pruefung/PruefungHub.tsx` ·
  `src/features/exam/{MockExamRunner,McParts,SchreibenPart,SprechenPart,partMeta}` ·
  `src/features/sprechen/{ConversationRunner,ConversationBriefCard,ConversationDebrief,MicCluster,useSpeechInput,SprechenHub}` ·
  `src/engine/{exam,speaking,conversation,scoring,speech}.ts` · `src/store/{useExamStore,useProgressStore}.ts` ·
  `src/features/analytics/Analytics.tsx` · `src/features/dashboard/recommend.ts` ·
  `src/lib/{dataExport,search}.ts` · `src/data/{examSets,texts,provenance}.ts` ·
  `supabase/functions/converse/index.ts` · `scripts/lint-content.mjs` ·
  `tests/{exam,conversation,pruefungHub}.test.ts` · `docs/areas/PRUEFUNG.md` (new) ·
  `docs/areas/SPRECHEN.md` · `docs/reports/pruefung-audit-2026-08-05.md` · `CLAUDE.md` ·
  `docs/PROJECT_STATUS.md` · this log

## Session 195 · 2026-08-06 · branch `claude/prufung-hub-design-consistency-193qrh`

- **Prompt 1 (verbatim):** `or the prufung hub - the page layouts and design are all either
  inconsistent with different back buttons styles at different positions or with awkward empty
  spaces. There's no harmonious and coherent design language amongst these pages. review this and
  propose some ideas to fix this`
  **Response:** review and options only, no app code touched (the `/design` process rule: report
  first, previews next, implement after the pick). Scope: every screen the zone owns, read from the
  code rather than from the docs. `/anwenden` both tabs, the four exam Teile plus the Anleitung and
  the Ergebnis, the two free trainers (`/writing`, `/simulation`) and a running conversation, and
  the shell chrome that frames them (`AppShell`'s exam slot, `useSessionStore.examExit`).
  **Six findings.** (1) Four visual treatments for "leave this screen" in three positions: a red
  `Verlassen` in the app header (`AppShell.tsx:184`), a grey `Zurück` in the same slot when the run
  is untimed, a white pill bottom-left in the writing trainers (`bottomChrome.tsx:32`), the same
  pill top-right on the speaking list (`SprechenHub.tsx:136`). (2) On one screen two of them share
  the word: in a running Lesen/Hören the header exit says `Zurück` and the footer stepper says
  `Zurück` (`McParts.tsx:315`). (3) Two screens have no way out at all: the writing trainers hide
  theirs below `lg` (the cluster is `lg:hidden`, so desktop Schreiben has no back button), and a
  practice conversation has none at any width. (4) Four content widths in one zone: 896 hub, 1152
  trainer and speaking list, 672 conversation, 448 for the Anleitung and the Ergebnis, and those
  two sit inside the 1152 exam stage with the sidebar and tab bar hidden, which is where the worst
  empty space is. (5) Three header languages: the hub's sliding-pill switcher, the speaking list's
  left-aligned level pills with uppercase section headings, and the Anleitung's centred `h1` (the
  only one in a zone that deliberately has none). (6) Both hub tabs hold `h-page-stage` with
  nothing to fill it before the learner has a Verlauf.
  **Proposal:** a five-rule spine every option shares (one 896 column at rest with the wide stage
  reserved for a running Teil; one exit, one word, one slot; the question stepper stops saying
  `Zurück`; one Niveau control; every screen wears its module's `PART_META` mark), then three
  variants for where the one exit lives: **A Modulkopf** (a back+mark+clock row inside the page,
  the RunBar generalised to the trainers and the list), **B Ecke oben rechts** (the app-header slot
  the exam already uses, adopted by every screen in the zone, which partly undoes s192's thumb-row
  pick), **C Unten links** (s192's thumb row made the zone's law, with the exam's steppers moved up
  to flank the number strip so the footer is a quiet back plus one primary). Plus two independent
  answers to the empty space: **1 Natürliche Höhe** (drop the viewport lock where nothing fills it,
  widen Anleitung/Ergebnis to the zone column) and **2 Der leere Zustand ist Inhalt** (the Verlauf
  card ships in an empty state from the first visit; the Ergebnis becomes two columns on desktop).
  Every mock is drawn from the real tokens and screenshot-verified in headless Chromium, light and
  dark. **Awaiting one letter and one number before any implementation.**
- **Artifacts (prompt 1):** `preview/gen-pruefung-frame.mjs` (new) ·
  `preview/pruefung-frame.html` · `preview/pruefung-frame-artifact.html` ·
  artifact <https://claude.ai/code/artifact/b04df435-61f7-4d9c-ab82-ba28b50a385e> ·
  `docs/PROJECT_STATUS.md` · this log

- **Prompt 2 (verbatim):** `B for phone, C for desktop but the zuruck button for untimed exercises
  and verlassen (red) button for timed exercises indicating it is an exam should always be on the
  top right corner. The pop up should always appear when closing a test asking something like "do
  you want to leave the test" but it should only appear when the user has some unsaved progress and
  is going back with a message saying something like "your progress will not be saved, are you sure
  you want to leave". For the mobile view, can you put the aufgabe wahlen button and the toggle
  buttons on the same row by shortening it to just "Aufgabe"? Also, keep the header row from option
  A - this header row should consistently be there for all the screens in mobile view. Option 2
  looks good.`
  **Response:** implemented, verified in the real build, not in a mockup.
  **The exit.** `useSessionStore.zoneExit` (`{ run, tone }`) replaces `examExit`/`examUntimed` and
  is registered by every screen the zone owns: the runner, `WritingHub` and `SprechenHub`. AppShell
  renders it as the LAST control in the header on `/anwenden`, `/exam`, `/writing` and
  `/simulation`, so it sits in the corner itself at every width. `tone: "danger"` is the red
  Verlassen while a clock runs, `quiet` the grey Zurück everywhere else. `examStage` split off as
  its own flag, so stripping the sidebar/bottom bar/streak still belongs to a RUN and the trainers
  keep their nav. The pick's "B for phone, C for desktop" reduced to "B's position everywhere"
  under the founder's own override; what survives of C is its composition, which a phone has no
  room for (see the stepper below).
  **The confirm.** `hasProgress(run)` decides, for timed and untimed alike: any answer, note, essay
  text, recorded part result, or `partIx > 0` (Teil Sprechen leaves nothing in the first three, so
  without the last two a candidate would have been waved out of Teil 3 of 4 without a word). Body
  copy is the founder's: "Dein Fortschritt wird nicht gespeichert. Möchtest du wirklich zurück?".
  The Schreibtrainer asks NOTHING, deliberately: `draftAutosave` keeps the text of each mode, so
  that warning would be false there. A started conversation always asks, because it cannot be
  resumed (`ConversationRunner` reports `onBusyChange`).
  **Zurück belongs to the exit alone**, so the previous-question button is a chevron now. Desktop
  puts the pair beside the number strip (option C) and leaves ONE primary in the footer; a phone
  keeps the back step in the footer, because nine numbers plus two 34px buttons do not fit 360px.
  **The mobile rows.** New `features/pruefung/ModuleHeader.tsx` on every zone screen below `lg`
  (in a Teil that row IS the `RunBar`, which now wears the same `PART_META` mark), and
  `GuidedWritingTrainer` PORTALS its Aufgabe toggle, relabelled "Aufgabe" and stripped of its icon,
  into a slot `WritingHub` owns beside the switcher. The switcher's segments went `px-1
  text-[13px]` below `sm` so four labels plus the toggle fit 360.
  **Option 2** for the empty space: both Verlauf cards ship in an empty state from the first visit
  and take the room the tab has left (`VerlaufCard` grows when `rows` is empty), the Anleitung is a
  two-column ticket from `lg` up, the Ergebnis puts the score and bars beside what to do next, and
  the Sprechtrainer list moved into the zone's `max-w-4xl`. Shared rules that came with the pick:
  one Niveau control (`features/pruefung/LevelSelect.tsx`, adopted by the Sprechtrainer in place of
  its pill row) and the Sprechen mark on that page's cards.
  **Measured with a CDP driver over the built app**, three viewports, a clean store per screen: the
  exit is at the identical top-right coordinate on all seven zone screens at 360x640, 393x852 and
  1280x900; it reads "Prüfung verlassen" only in a timed run; it is absent on the hub, which is the
  zone's home. Zero resting page scroll and zero horizontal overflow everywhere except Kurz at
  360x640 (99px, down from 134px shipped: the field is at its `HARD_MIN` floor, the documented
  give-up case) and the Sprechtrainer LIST, which is a browse list. Gates: build · typecheck ·
  lint 0 errors (75 warnings, down from 77) · 610 tests · check:bundle 127.1 kB · check:contrast ·
  lint:content.
  **Two judgement calls flagged to the founder:** the module row is `lg:hidden` because they said
  "in mobile view", and Kurz at 360x640 rests ~99px scrolled, which would be 0 if that row were
  dropped on Kurz/Lang.
- **Artifacts (prompt 2):** `src/store/useSessionStore.ts` · `src/components/layout/AppShell.tsx` ·
  `src/features/pruefung/{PruefungHub,ModuleHeader,LevelSelect}.tsx` ·
  `src/features/exam/{MockExamRunner,McParts}.tsx` ·
  `src/features/writing/{WritingHub,GuidedWritingTrainer,WritingModeSwitcher,bottomChrome}.tsx` ·
  `src/features/writing/fokus/FokusTrainer.tsx` ·
  `src/features/sprechen/{SprechenHub,ConversationRunner}.tsx` · `CLAUDE.md` ·
  `docs/areas/{PRUEFUNG,SCHREIBEN,SPRECHEN}.md` · `docs/PROJECT_STATUS.md` · this log ·
  commits `2539162` (review) + `a722f5f` (implementation) · **PR #811**, squash-merged into `main`

## Session 196 · 2026-08-06 · branch `claude/prufung-hub-layout-ffco93`

- **Prompt 1 (verbatim):** `the previous session shipped an update in prufung hub but it resulted
  in page scroll. The bottom tile looks unnecessarily big. Reduce the height and make sure there is
  never a page scroll here in this page - keep it consistent for all screens. Another modification
  needed is that the tiles above look empty. reduce the width and make them somewhat squarer.
  invert the positions of the arrrow and time stamps. Instead of guten morgen greeting, use that
  space to show a big header like Prufung or Bibliothek aligned to left vertically with the toggle
  buttons` (followed mid-turn by a bare `continue`, resuming the same task after a tool-loading
  pause).
  **Response:** implemented directly (no preview round: these were four concrete corrections to
  already-shipped work, not a new design decision needing options), verified against the real dev
  build in headless Chromium, gates run, docs updated.
  **The scroll's root cause.** `h-page-stage` — the stage class most trainers already opt into for
  zero resting scroll — goes `height: auto` from `lg` up, on the assumption desktop has no shortage
  of room. True when it was written; false once this hub's Verlauf card grew tall enough to
  overflow a real laptop height (900px minus browser chrome is often only 750-800px usable, which
  is exactly where it reproduced). New `.h-pruefung-stage` (`src/index.css`) keeps `h-page-stage`'s
  mobile/`sm` formula and borrows `h-browse-stage`'s desktop formula for `lg` instead of `auto`.
  **The tiles.** `ModuleGrid`'s wrapper capped at `max-w-[26rem]`/`sm:max-w-[30rem]` (was the full
  column), closer to square. The minutes badge (Mit Zeit) moved beside the icon in the top row; the
  arrow moved to the bottom-right corner it vacated. This also DROPS the old clock-mode height
  reservation: the icon alone sets the top row's height in either state now, and the arrow shows
  whenever a module can open, in both states, so nothing needs reserving.
  **The Verlauf tile:** Stärkeprofil bars `h-24`→`h-16` (desktop), run chart `H=68`→`52`, display
  score `2.5rem`→`2rem`, several paddings tightened.
  **The header.** From `lg` up, `AppShell` shows a left-aligned "Prüfung" `h1` beside the Module
  üben/Modelltest switcher, replacing the generic greeting there; below `lg` the hub's own switcher
  is unchanged. Split the switcher into new `features/pruefung/hubSwitcher.tsx` (the `Tab` type,
  `TABS`, `tabId`/`panelId`, `TabSwitcher`, `usePruefungTab`) specifically so `AppShell` — mounted
  on every route — never has to import `PruefungHub.tsx` and, behind it, `engine/exam` and the
  content banks; that would have broken the keep-eager-code-light invariant for every page in the
  app, not just this one. Caught by checking `pnpm check:bundle` after wiring the header, not by
  reasoning about it up front.
  **Verified in the real dev build** (Playwright over the global Chromium, seeded localStorage, not
  a mockup): 1440×900, 1440×760, 1024×850, 1023×850 and 390×844, light and dark, empty/one-run/
  four-run history, both tabs; `scrollHeight` vs `clientHeight` read back at every size (all equal);
  clicked the header switcher's buttons and read the resulting `?tab=` URL to confirm it drives the
  same panel as the hub's own switcher; confirmed the Dashboard's "Hallo"/"Guten Morgen" greeting is
  unchanged on every other route.
  **Scope call, flagged rather than assumed:** the founder's two examples for the header title were
  "Prufung or Bibliothek". Read as illustrating the PATTERN (a route's own nav label replacing the
  greeting) rather than a request to retitle the Bibliothek page today, since the branch and the
  rest of the prompt are about the Prüfung hub only; `navItems` already carries every route's label
  if that reading is wrong.
- **Artifacts:** `src/index.css` · `src/components/layout/AppShell.tsx` ·
  `src/features/pruefung/PruefungHub.tsx` · `src/features/pruefung/hubSwitcher.tsx` (new) ·
  `CLAUDE.md` · `docs/areas/PRUEFUNG.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` · this log ·
  commit `bf2807d` · **PR #813**, squash-merged into `main`.
  Gates: typecheck · lint 0 errors (unchanged warning count) · 610 tests (unchanged) · build ·
  check:bundle 129.0 kB of 400 · check:contrast.
- **Prompt 2 (verbatim):** `there was another session ran in parallel that may have merged to main,
  checck for such instance` (typo kept verbatim), followed by `may be it happened due to that
  parallel session` after the first check landed.
  **Response:** the founder had just seen run #817 ("Deploy site to GitHub Pages") show red right
  after the merge and, reasonably, suspected a same-day parallel session (PR #812, "Ohne Zeit: one
  Aufgabe rail for all four modules...", branch `claude/sprechen-module-bugs-qjrdca`) had collided
  with it. Checked `list_pull_requests` and `git log origin/main`: PR #812 was still open and
  unmerged, and `main` carried no commit past this PR's own merge. Ruled out mechanically, not just
  asserted: `pages.yml` triggers only on a push to `main`, and there had been exactly one such push
  in the failure window. Reported this back, and separately flagged that #812 now shows
  `mergeable_state: "dirty"` against `main` (both PRs touched overlapping Prüfung-area docs) since
  that is a real, if unrelated, follow-up for whoever owns that PR.
- **Prompt 3 (verbatim):** `update me when it resolves`.
  **Response:** re-ran the failed `deploy` job (`actions_run_trigger` `rerun_failed_jobs`) and
  polled it via `ScheduleWakeup` rather than blocking or repeatedly reporting "still waiting":
  checked once at +4 min (still on its first internal attempt, rescheduled silently per the
  PR-notice convention of not messaging on no-news), then again at +14 min, where it had already
  succeeded (completed at 12:58, ~10 min into the second full run and ~47 min after the original
  push) on the FIRST of its 3 internal attempts, confirming the platform itself had recovered.
- **Prompt 4 (verbatim):** `it's deployed. document the session` (founder confirmed the live site
  directly). Documented here plus `docs/PROJECT_STATUS.md`'s s196 entries (both the top summary and
  the fuller "Resume here" handoff) with the deploy-stall timeline, the parallel-session ruling, and
  the PR #812 conflict flag. No code changes this round; `docs/areas/PRUEFUNG.md` and `CLAUDE.md`
  untouched, since none of this changed a product behavior or a design law.
- **Artifacts (prompts 2-4):** `docs/PROJECT_STATUS.md` · this log · no code changes.

---

## Session 196 — prompt 1 (2026-08-06)

**Branch:** `claude/sprechen-module-bugs-qjrdca`

**Prompt (verbatim):**

> there are some bugs or inconsistencies with sprechen module. sprechen ohne zeit page tiles are
> all a bunch tiles as list. but it should somehow look like shcreiben with a filter rail like
> schreiben aufgabe wahlen tile. Same should apply for lesen and horen ohne zeit modules. the bug I
> found with sprechen is that after I do the speaking exercise, the evaluation couldn't be done as
> there was some problem and the verlauf section isn't updated with this progress. it's basically
> lost. fix these things

**Response summary.**

**One rail for all four Ohne-Zeit modules.** `ScopeSelect` and the "Aufgabe wählen" tile moved out
of `WritingRail` into `features/shared/ScopeRail.tsx` unchanged (Himmelblau fill, no visible edge,
section eyebrows, honest zero-yield counts, always-active reset), and
`features/pruefung/ModulePicker.tsx` is the frame all four share: Schreiben's content-plus-16rem
sticky rail on desktop, the same rail as a panel behind an **Aufgabe** toggle in the mobile module
row. Schreiben re-renders through the extracted pieces with no visual change.

**Sprechen (`/simulation`)** is now Schreiben's page: an **Üben | Verlauf** sliding-pill switcher as
the header, the rail (Niveau, Lebensbereich, Thema — a Scenario carries no Branche or Unterthema, so
those dropdowns would be dead chrome), and the scenario grid. The three level SECTIONS were a Niveau
filter wearing a heading's clothes, so they are gone and the band is a card badge; the ladder is the
hub's (1→B1, 2→B2, 3→C1), not the finer one `engine/speaking.ts` pitches a brief at.

**Lesen and Hören had no Ohne-Zeit shape at all** — the card composed a random drill and opened it,
so no text could ever be chosen. `/lesen` and `/hoeren` list what the scope serves (Niveau, Branche,
Lebensbereich, Thema, Unterthema, Textsorte) and start the picked text as a single-text untimed run
through the SAME `LesenPart`/`HoerenPart`, scored the same way, recorded in the same Module-üben
Verlauf. `composeMockExam` takes `MockExamPicks` (filtered against the bank, so a stale link cannot
compose over a missing text). The old behaviour survives as **Zufällige Auswahl**.

**The evaluation bug had three layers, all fixed.** (1) `converse` ran BOTH modes on 1400 output
tokens; a debrief must echo every learner sentence corrected plus two tips and the verdict arrays as
one JSON object, so a twelve-turn conversation truncated mid-JSON and the parse failed. Turns get
500 now, the debrief 4096 — what every other Edge Function here already used. (2) `cascade` returned
the first leg producing ANY text, so a truncated Gemini answer was accepted and Claude was never
asked; the Gemini leg also lacked `responseMimeType: "application/json"` here alone, so a thinking
model spent the budget before writing a character. Both fixed, and `cascade` now takes an `accept`
predicate: a leg whose output the caller cannot use is a leg that failed. (3) `onFinished` fired
only on a SUCCESSFUL debrief, so an unreachable grader erased the scenario completion, the XP and
the streak day; it fires once per conversation either way, and the failure screen offers **Erneut
versuchen**, which costs no allowance because the allowance counts conversation rows and the row
already exists.

**The Verlauf really was missing.** `speaking_conversations` has recorded every conversation since
s193 and nothing ever read it back, so the free Sprechtrainer was the one trainer whose work
vanished on leaving the debrief. `getSpeakingHistory`/`deleteSpeakingConversation` +
`features/sprechen/SprechenHistory.tsx` are that half, built from Schreiben's row and
`features/writing/correction.tsx` rather than a new one. A conversation whose debrief never arrived
still appears, with its transcript and an "Ohne Bewertung" badge.

**Gates:** typecheck · lint 0 errors (76 warnings) · **624 tests** (up from 610, new
`tests/moduleScope.test.ts` gates the filter law and the picked-content override) · build ·
check:bundle 127.9 kB · lint:content · lint:migrations.

- **Artifacts:** `src/features/shared/ScopeRail.tsx` · `src/features/pruefung/{ModulePicker,TextModuleHub}.tsx` ·
  `src/lib/moduleScope.ts` · `src/features/sprechen/{SprechenHub,SprechenHistory,ConversationRunner}.tsx` ·
  `src/features/writing/WritingRail.tsx` · `src/features/pruefung/PruefungHub.tsx` ·
  `src/engine/exam.ts` · `src/store/useExamStore.ts` · `src/lib/speaking.ts` · `src/router.tsx` ·
  `src/components/layout/nav-items.ts` · `supabase/functions/converse/index.ts` ·
  `tests/moduleScope.test.ts` · `CLAUDE.md` · `docs/areas/{PRUEFUNG,SPRECHEN}.md` ·
  `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` · this log


---

## Session 196 — prompt 2 (2026-08-06)

**Branch:** `claude/sprechen-module-bugs-qjrdca`

**Prompt (verbatim):**

> is it possible to have a KI usage similar to how claude code shows wherever a feature uses ai is
> in the app?

**Response summary.** Answered as a question (no code written), then the founder ended the session
before the design round: "merge the changes to main and document the session. we can continue in
another session."

**The state of play, as reported.** Yes, and most of the plumbing exists. `src/lib/aiAllowance.ts`
is already a real usage layer: `useDailyAllowance(mode)` returns `{ limit, remaining, known }`,
takes the SERVER's number as authority (every Edge Function response carries
`dailyLimit`/`dailyRemaining` through `reportServerAllowance`) and falls back to counting the
learner's own rows; when it cannot know, it renders nothing rather than a guess. `AllowanceNote`
prints it as "Heute noch 7 von 10" in four places: Fokus, Kurz/Lang, the Sprechen brief card and the
Modelltest run band.

**The four gaps found.**
1. **You can only see the meter you are standing on.** No surface shows all of it; Settings has no
   AI section. Claude Code's whole trick is that the readout is always visible.
2. **Two AI features have NO readout at all.** `transform-sentence` (Fokus's "Nochmal" Umformung)
   has its own limits (`TRANSFORM_DAILY_LIMIT` 30, `TRANSFORM_BURST_LIMIT` 8) and is not in
   `AiMode`, so nothing counts it and a learner hits that wall with no warning.
3. **No "this will use AI" marker before the fact.** The KI-generiert line appears on RESULTS, after
   the unit is spent. And `Sparkles` is NOT an AI marker in this app (it is used for Quiz, empty
   states, onboarding), so there is no reserved AI icon to build on yet.
4. **The monthly ceilings are invisible** (50 evaluations, 40 conversations, 200 sentence checks,
   plus the global `MONTHLY_SPEND_CAP_USD` fuse).

**One thing pushed back on.** Claude Code shows cost and tokens because the user pays. Genauly's
learners do not, so a money figure would be alarming and meaningless; the learner-facing number
stays "how many free AI helps do I have left today". The founder-facing spend view already exists in
part (`AdminOverview` / `AdminSystem` "KI-Budget") and is the place to extend if that is what is
wanted.

**Founder decisions (via the question tool, both taken):**
- **Audience: learner-facing.** Not the admin spend view.
- **Scope: A + B.** (A) fill the missing counts so no AI feature is silent, the Umformung
  especially; (B) ONE reserved KI chip carrying its count on every entry point that spends a unit.
  The (C) "KI heute" overview panel in Settings was NOT taken.

**Not started.** B is new shared-component design, so it owes the founder the preview-first round
(2-4 named variants in English in `preview/`, artifact published, pick, then implement). The
`design` skill was loaded and the session ended there.

- **Artifacts (prompt 2):** none (analysis only) · two merges of `origin/main` into this branch,
  `b33f4da` (PR #813, five doc conflicts) and the PR #814 docs merge, both resolved by keeping BOTH
  sessions' facts rather than picking a side · **PR #812**, squash-merged into `main`


---

## Session 196 — prompts 3-6 (2026-08-06): the deploy round

**Branch:** `claude/sprechen-module-bugs-qjrdca`

- **Prompt 3 (verbatim):** `merge the changes to main and document the session. we can continue in
  another session`
  **Response:** merged PR #812. It took two `main` merges to get there, because a parallel session
  landed PRs #813 and #814 mid-work; every conflicted doc was resolved by keeping **both** sessions'
  facts rather than picking a side, and the append-only prompt log kept both sessions' entries in
  merge order. Post-merge housekeeping done (`fetch` → `reset --hard origin/main` →
  `push --force-with-lease`). Flagged honestly that GitHub stopped queuing CI runs for the later
  pushes, so only the first commit was verified by CI; the rest were verified locally with the full
  gate set.

- **Prompts 4 and 5 (screenshots, no text):** two screenshots of the Actions list showing **Deploy
  site to GitHub Pages** red on #818 (`7def4d2`) and #819 (`2c541e1`).
  **Response:** investigated rather than re-running blindly. This is where the session produced two
  WRONG diagnoses before the right one, all recorded in `docs/DECISIONS.md` §s196:
  1. First read (tail of the log only): "not flake, the workflow's own retry does it to itself."
     Overstated.
  2. Second read: "a Pages-side stall; the retry chain is structurally incapable of recovering,
     delete it." Confident, documented as law, and **wrong** — see prompt 7.

- **Prompt 6 (verbatim):** `can you do a new deploy then?`
  **Response:** triggered a fresh `workflow_dispatch` run of `pages.yml` against `main` (run #820)
  rather than re-running the failed one, since a fresh run rebuilds and re-creates the deployment
  from scratch. Build green in 54 s; the deploy step then ran far past the 600 s that had killed
  #819, which was the first sign the earlier diagnosis was off. Stopped the every-few-minutes
  polling partway through and said so, rather than keep spending the session on it.

---

## Session 196 — prompts 7-8 (2026-08-06): the correction, and closing out

**Branch:** `claude/sprechen-module-bugs-qjrdca`

- **Prompt 7 (verbatim):** `it's done` (founder confirmed the live site).
  **Response:** pulled the complete job log, which **disproved the diagnosis already written into
  `CLAUDE.md` and `DECISIONS.md`**, so the first action was to correct it, not to close out.
  What run #820 actually shows: the deployment sat at `deployment_in_progress` from 14:50:26 to
  15:00:30 without finishing, hit the 600 s timeout, cancelled itself — and then **attempt 2
  re-created the same deployment and reported `Reported success!` at 15:04:17**. The site went live
  BECAUSE of the retry chain this session had recommended deleting.
  **Root cause, finally:** a Pages deployment for this repo takes longer than the 600 s the action
  is given. Everything else (the self-cancel, the occasional leftover that refuses the next merge
  with "in progress deployment. Please cancel `<sha>` first") follows from that one fact.
  **The fix therefore flips:** RAISE `timeout` on `actions/deploy-pages` (~30 min) and KEEP the
  retry. The wrong claim is left visible in `DECISIONS.md` as an explicit correction rather than
  quietly overwritten, because generalising one run into a law is exactly how this area got
  misdiagnosed three sessions running. Then merged PR #815 and did the housekeeping.

- **Prompt 8 (verbatim):** `document the session`
  **Response:** this entry plus the `docs/PROJECT_STATUS.md` s196 handoff. Also checked run #821
  (the docs merge's own Pages deploy) rather than leaving it unobserved.

- **Artifacts (prompts 3-8):** `CLAUDE.md` · `docs/DECISIONS.md` §s196 · `docs/PROJECT_STATUS.md` ·
  this log · **PR #812** (the chooser + Sprechen work) and **PR #815** (the deploy diagnosis), both
  squash-merged into `main` · no `pages.yml` change (deliberately left for its own review)

---

## Session 197 (parallel A) — the mobile fade behind the Üben button

**Branch:** `claude/mobile-floating-text-readability-bs49dz`

- **Prompt 1 (verbatim):** `[screenshot of the dark-mode Bibliothek list fading at the bottom edge of
  the desktop scroll column] can you put similar effect even in the mobile view so that the floating
  text below the ueben button is more readable and visible? generate a couple of previews`
  **Response:** named the cause before designing anything. The screenshot is
  `lg:mask-fade-bottom` (`browseColumnClass`, s190): desktop scrolls INSIDE the content column, so
  the column masks its own bottom edge and the cards dissolve into the page ground. On a phone the
  PAGE scrolls, so there is no such edge, and the cards run at full strength behind the fixed
  `FloatingActionCluster` and its note line, which since s189 deliberately carries no
  `floatingNote` plate (the plate read as a frosted chip over white cards). Built
  `preview/mobile-cluster-fade.html` (+ the artifact copy): four phone mocks at the REAL cluster
  offsets (nav `3.9375rem`, buttons `+2rem`, note `+0.5rem`) and the real tokens, in both themes.
  Today (baseline, note printing over a card) · **A** short 7rem dissolve · **B** long 11rem
  dissolve, closest to the desktop edge · **C** dissolve plus a bottom-ramped blur. All three are a
  pointer-events-none veil in `--background` at `z-20`, under the cluster and over the cards: no
  border, no bar, so the s168 sticky-bar and s169 blurred-band rejects stay rejected (C is flagged
  in the preview as the one that flirts with the band). No app code touched: awaiting the pick.

- **Artifacts:** `preview/mobile-cluster-fade.html` · `preview/mobile-cluster-fade-artifact.html` ·
  artifact <https://claude.ai/code/artifact/8bbc7f2e-d581-4767-84ee-a024380d0604>

- **Prompt 2 (verbatim):** `insert short fade but soft blur but not above the blue button, it should
  be below the blue button behind the text.`
  **Response:** shipped variant A's 7rem scrim plus C's blur, cut down from a 9rem band to the
  2rem strip between the nav and the button's LOWER edge, so the frosting sits behind the note line
  and stops before the button. Two new utilities in `src/index.css` (`.cluster-scrim`,
  `.cluster-blur`), both rendered by `FloatingActionCluster`, `pointer-events-none`, border-free,
  `lg:hidden`; the note moved to `z-[25]` so it stays above them. One tuning pass came out of
  screenshotting the REAL app at 390x800 in both themes: the first scrim reached ~0.99 through the
  note strip, which made the frosted band invisible, so the ramp now holds ~0.85 there and the blur
  has something left to act on (still AA, because what shows through is a card within a few per
  cent of the ground). Only the four Bibliothek tabs mount this cluster, so no writing editor is
  dimmed. Gates: typecheck, lint, `check:contrast`, `test:unit` (624), `build`, `check:bundle` all
  green. Preview updated with a fifth "Shipped" phone so the mockup and the live surface agree.

- **Artifacts (prompt 2):** `src/index.css` · `src/features/shared/floatingCluster.tsx` ·
  `docs/areas/BIBLIOTHEK.md` · `.claude/skills/design/SKILL.md` · `preview/mobile-cluster-fade.html`

---

## Session 197 (parallel B) · 2026-08-06 · branch `claude/page-header-alignment-glqts5`

- **Prompt 1 (verbatim):** `in one of the previous sessions, I asked sonnet to replace the hello
  greeting with the page's name as a header. I wanted the header position to align vertically
  leftwards with the page components like toggle and verlauf. Butit created this funny looking
  page. Can you access that prompt and generate a couple of previews of how this page should look
  overall? It is looking ridiculous at the moment` (with a screenshot of the shipped `/anwenden`
  hub at desktop width, sidebar cropped).
  **Response:** found the prompt they meant (s196, prompt 1, quoted back in the preview page),
  diagnosed the shipped layout from the code, and shipped a preview round. **No app code touched**:
  this is design work, so it owes the preview-first process a pick first.
  **The diagnosis.** The s196 change answered "aligned to left with the toggle buttons" by putting
  the title in the APP header at the app's left gutter, which is a different left edge from every
  control it was supposed to line up with. Underneath it the page nests THREE separately centred
  widths: the tab panel column (`lg:max-w-4xl`, 896 px), the module grid (`max-w-[30rem]`, 480 px)
  and the Stärkeprofil grid (`max-w-[26rem]`, 416 px). So the tiles start ~220 px right of the
  title, a narrow tile island floats over a full-width Verlauf card, and at first visit four
  full-height grey bars at "–" fill half the widest card on the page.
  **The options** (`preview/pruefung-header-align.html`, generator
  `preview/gen-pruefung-header-align.mjs`, artifact published): **A** title back INSIDE the page
  (h1 left, tab switcher right of the same line, controls left-aligned under it, one column for
  everything); **B** keep the header title and move the PAGE to its left edge instead (needs the
  header row to sit in the same centred container as `main`, or the two drift apart as the window
  grows); **C** no title at all, the switcher IS the page header, centred, which is the
  Bibliothek/Schreiben law. All three collapse the three nested widths into ONE column, halve the
  empty Stärkeprofil, and leave the locked module-card anatomy untouched. The review page carries
  live Theme / Column width (512·640·768) / Alignment guides switches, a light and dark pass, a
  desktop and a phone frame per option, and the "today" frame drawn at the shipped measurements.
  **One locked rule flagged, not quietly overridden:** s196 locked "tile grid narrower than the
  column"; all three options narrow the COLUMN to the tiles instead, which keeps the reason for the
  lock (wide tiles read as empty) and drops its side effect (mismatched edges). Called out in the
  preview for the founder to accept or reject.
  **Verified in headless Chromium**, not by eye: every phone frame rests inside the 668 px a
  393×852 phone leaves between the app header and the tab bar (0 px overflow, all three), no
  horizontal overflow in any Verlauf split, and the three control switches read back on the root
  element.
- **Artifacts (prompt 1):** `preview/gen-pruefung-header-align.mjs` (new) ·
  `preview/pruefung-header-align.html` + `-artifact.html` (new) · this log · no `src/` change yet

- **Prompt 2 (verbatim):** `C, medium`
  **Response:** implemented option C at the 640px column, verified in the real built app, gates run,
  docs updated.
  **`AppShell`** no longer renders the "Prüfung" `h1` or the second switcher copy; the greeting slot
  stays EMPTY on `/anwenden` (the part of s196 that survives) and every other route keeps its
  greeting untouched. **`PruefungHub`** renders the switcher as its header at EVERY width (the
  `lg:hidden` is gone), and ONE new `HUB_COL` (`max-w-[40rem]`) carries the switcher row, the scope
  row, the module grid and the Verlauf card. The module grid and the Stärkeprofil grid lost their
  own `max-w-[30rem]`/`max-w-[26rem]` caps: the COLUMN was measured from the tiles instead, which
  keeps the shape s196 asked for ("the tiles look empty") without the cap that left four different
  left edges on one page. **`hubSwitcher.tsx` stays a separate module** (the hub is its only caller
  again) so a future header copy still has a bank-free file to import; `idPrefix` went with the
  second copy.
  **Three details the narrower card forced**, each found by measuring rather than by eye: the
  Verlauf split is proportional (`1.15fr / 1px / 1fr`) instead of a fixed 26rem half; the four
  profile labels put the mark ABOVE the name at every width, because side by side "Schreiben"
  pushed through the divider into the list; and `PracticeRow` uses one padding and one gap at every
  width, because at `sm:gap-4 lg:px-6` the row had exactly 0px spare (72+28+55+53 content, 48 gaps,
  40 padding, in 296px) so the score badge wrapped its "%" and the module name truncated to
  "Schre...". The empty Stärkeprofil is half height with a one-line caption.
  **Verified in the real built app**, not a mockup (Playwright over the global Chromium, seeded
  localStorage): at 1440×900, 1440×760, 1024×850, 1023×850, 390×844 and 360×640, both tabs, three
  history states, the panel / module grid / Verlauf card report the SAME left edge and width at
  every size. Zero resting page scroll and zero horizontal overflow everywhere except two bands that
  scroll on `main` too, measured BEFORE and AFTER against a build of `origin/main`: 1023×850 rests
  at 54px (unchanged) and 360×640 at 43px (63px before). Both come from the Verlauf card being
  `flex-none` at rest; fixing that means letting its collapsed list scroll inside the card, which
  touches the s195/s196 Verlauf behaviour, so it is reported rather than assumed.
  Gates: typecheck · lint 0 errors (77 warnings) · 624 tests · build · check:bundle 127.9 kB of 400
  (down from 129.0: AppShell dropped its `hubSwitcher` import) · check:contrast.
- **Artifacts (prompt 2):** `src/components/layout/AppShell.tsx` ·
  `src/features/pruefung/{PruefungHub,hubSwitcher}.tsx` · `CLAUDE.md` · `docs/areas/PRUEFUNG.md` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` (s195
  handoff archived) · this log

- **Prompt 3 (verbatim):** `document the session`
  **Response:** this entry, plus the s197 handoff in `docs/PROJECT_STATUS.md` and the "why" in
  `docs/DECISIONS.md` §s197 (written before the merge, not after).
  **How the merge went, since the CI story matters more than usual this time.** GitHub Actions
  scheduled NOTHING for this repository across the whole window: no check ever registered on PR
  #817, no `Validate content` run was created for the branch or the PR, and the `Validate content`
  run for the PREVIOUS merge (#816, on `main`) was cancelled after sitting 15 minutes without ever
  starting. So every gate `validate.yml` runs was run locally first, in its own order
  (`lint:content` · `lint:migrations` · `check:contrast` · `verify:facts` · `test:srs` ·
  `test:pronounce` · `lint` · `test:unit`), plus typecheck, build and `check:bundle`, and the merge
  went ahead on that evidence rather than on a green tick that was never going to appear.
  `verify:facts` rewrites `docs/reports/verify-facts-report.json` with today's date on every run;
  that timestamp-only diff was reverted rather than committed as noise.
  **The Pages deploy, third session running.** #816's deploy job self-cancelled at exactly 15
  minutes (`build` green in 60 s, `deploy` 16:24:20 → 16:39:26), which is the 600 s timeout already
  diagnosed in s196, and its leftover is the likeliest reason no deploy run was created for this
  merge at all. Used the documented workaround: dispatched `pages.yml` on `main` manually
  (`workflow_dispatch`), which built `a2ad467` and **succeeded** (run 31128920435), so the change is
  live without the founder having to do anything. The real fix (RAISE `timeout` to ~30 min, keep the
  retry) is still not taken, and it has now cost a third session; it is offered as its own small PR.
- **Artifacts (prompt 3):** `docs/PROJECT_STATUS.md` · `docs/DECISIONS.md` §s197 · this log ·
  merge commit `a2ad467` (**PR #817**, squash-merged into `main`) · Pages run 31128920435 green

---

## Session 197 (parallel A, continued) · 2026-08-06 · branch `claude/mobile-bibliothek-fade-*`

_Prompts 3-4 of the parallel A session. They landed under parallel B's header when that
session merged `main` in; the entries are theirs, unedited, and are re-headed here so the
two branches stay legible. Their prompt 3 says the s197 layout work was already good._

- **Prompt 3 (verbatim):** `what's shipped is good. document the session and merge everything live`
  **Response:** documented (`docs/PROJECT_STATUS.md` handoff, `docs/DECISIONS.md` §s197, this log)
  and merged. One thing worth carrying forward: a PARALLEL s197 branch
  (`claude/page-header-alignment-glqts5`, PR #817) landed on `main` first and restructured
  `PROJECT_STATUS.md`, so this branch merged `main` in and resolved three doc conflicts by keeping
  BOTH sessions' facts (their structure, this session's handoff added under "Resume here"; the
  prompt log now labels the two branches "parallel A/B"; their s195 archive text kept over this
  session's duplicate). Gates re-run after the merge: typecheck · 624 tests · build · check:bundle
  127.9 kB. **CI never fired for PR #818** at all: no check run was ever created, and the same
  window shows a `main` validate run the platform CANCELLED after 15 minutes, so this is GitHub's
  side, not the branch. Every gate `validate.yml` runs was therefore run locally before merging.

- **Prompt 4 (verbatim):** `also, the go to top button seems hidden behind the blue button.. move it
  upward and decrease its size slightly - no need of preview, implement it directly`
  **Response:** implemented directly, no preview. The mobile `ScrollTopButton` sat at
  `nav + 3.5rem` while the cluster puts the Üben CTA's top at `nav + 2rem + 2.75rem` (its own
  `h-11`), so the arrow was inside the CTA's box and hidden behind it at every scroll position, on
  every Bibliothek tab (it predates this session; it was visible as a ghost in the s197 verification
  screenshots). Now `nav + 5.25rem`, half a rem clear of the button, and a step smaller: `p-1.5`
  with an 18px glyph, 30px total instead of 36. Verified in the real app at 390x800 in both themes.
  Gates: typecheck · lint 0 errors · 624 tests · build · check:bundle 127.9 kB.

- **Prompt 4 (verbatim):** `go ahead`
  **Response:** took the `pages.yml` timeout fix that s196 wrote down and s197 kept paying for.
  Attempt 1 of `actions/deploy-pages` now runs with `timeout: 1800000` (30 min); attempts 2 and 3
  keep the 600000 default **on purpose**, because two different failures share that step. The
  timeout failure needs a LONGER deadline (a deploy here outruns 10 minutes, the action cancels
  itself, and the leftover can refuse the next merge); the transient "Deployment failed, try again
  later" fails FAST, so giving all three attempts 30 minutes would hold a genuinely broken deploy
  for ~90 minutes before it went red. One long attempt plus two fast retries caps the worst case at
  ~51 minutes and removes the self-cancel in the normal case. YAML parsed and the three steps'
  inputs read back before pushing; nothing else in the workflow moved (same pinned action SHAs, same
  retry chain, same hard-fail on attempt 3).
- **Artifacts (prompt 4):** `.github/workflows/pages.yml` · `CLAUDE.md` (the deploy bullet now
  states the fix, not the workaround) · `docs/DECISIONS.md` §s197 (why the three attempts differ,
  and what this does NOT fix) · this log

## Session 198 — 2026-08-07 — branch `claude/content-audit-plan-mbiout`

- **Prompt 1 (verbatim):** `what's next in the content audit plan?`
  **Response:** read `docs/reports/CONTENT_AUDIT_2026-07-30.md` and reported the state: P1–P9 all
  closed across s178/s181/s182/s185, **P10 (human verification) the only open item and
  founder-deferred**, and it is a founder task by law (only a human flips `review_status`, and a
  verified row is never edited by an AI). Flagged the two carried-over tails (12 verified rows the
  s185 rules WARN on, three s178 founder rejections still `draft`) and offered the AI-shippable
  alternative from the audit's §5 closing observation: the missing "is this word worth learning" and
  "does this theme have a balanced part-of-speech mix" gates, whose data already ships in
  `frequency.ts`.
  **Artifacts:** none (research answer).

- **Prompt 2 (verbatim):** `build the frequency and part-of-speech linter gates`
- **Prompt 3 (verbatim, mid-turn):** `except human review task, complete all the recommendations
  from this plan, push them live and document the session`
  **Response:** took the whole remaining audit except P10, in one session.
  1. **The 116 "words needing an example" were a matcher bug, not a content gap.** 25 of them start
     with an umlaut (JavaScript's `\b` is ASCII-only, so `\bÜberweisung` can never match) and 85 are
     verbs whose examples use a real verb form rather than the infinitive. Extracted the ONE blanking
     rule to `src/engine/blank.ts` (previously four copies: MCQ cloze, listening cloze, typed cloze,
     coverage report, all with the same two defects), now reading the Partizip II / Präteritum /
     zu-infinitive from `verbForms.ts` (which did not exist when the audit was written) plus plurals
     and multi-word headwords. The blank reports WHICH form it took so distractors match the gap's
     shape. 15 separable verbs kept a genuine gap and got one example rewritten; 67 words gained a
     related term that resolves. Both word-level residuals in the coverage report: **116 → 0** and
     **67 → 0**.
  2. **The three gates the audit asked for** live in `scripts/content-shape.mjs`, each anchored on
     the measured bank: worth-learning (rare share 53.87 %, no-corpus-evidence 100), CEFR
     plausibility (hard rule: no `core`-frequency word at B2.2/C1; beginner-rare ratchet 32),
     part-of-speech mix (≥3 verbs AND ≥3 adjectives per theme, noun share 77.59 %).
     `tests/contentShape.test.ts` asserts each in both directions.
  3. **25 everyday verbs and adjectives authored** to clear the part-of-speech floors (`digitales`
     had no verb and no adjective at all; `freizeit`, `behoerde`, `mobilitaet` had no adjective), all
     core-or-common frequency, which also serves P7's standing authoring rule. Bank shape
     78.7/13.5/5.1 → **77.6/13.6/6.1** noun/verb/adjective.
  4. **§2.2 "Reuse" closed:** `progress.textsDone` (migration 0018, synced and unioned like
     `scenariosDone`) makes the composer prefer a text the learner has not read, so a scoped learner
     stops seeing the same one alternate.
  Verified along the way that the four §3.2 LanguageTool defects are already fixed in the bank. The
  one finding deliberately left open besides P10 is §2.1's inverted sub-theme structure: it drags the
  writing-task invariant (≥2 tasks per Unterthema per length) behind it, so it is a session of its
  own.
  Gates: `lint:content` · `lint:migrations` · typecheck · lint (0 errors, 77 warnings) ·
  **647 tests** (21 new) · build · `check:bundle` 128.2 kB · `verify:facts` 0 errors ·
  `verify:cefr` FLAG 0 · regenerated `verbForms.ts`, `frequency.ts`, `verification.ts`, the review
  queue and the coverage report. `verify:grammar` skipped: the LanguageTool toolchain is not built in
  this sandbox (warn-only by design).
  **Artifacts:** `src/engine/blank.ts` (new) · `scripts/content-shape.mjs` (new) ·
  `tests/blank.test.ts` + `tests/contentShape.test.ts` (new) · `supabase/migrations/0018_texts_done.sql`
  (new) · `src/engine/quiz.ts` · `src/engine/session.ts` · `src/features/session/SessionPlayer.tsx` ·
  `src/store/useProgressStore.ts` · `src/lib/cloudSync.ts` · `src/lib/idRenames.ts` ·
  `src/data/vocabulary.ts` + `provenance.ts` (+25 items, 82 rows edited) ·
  `scripts/lint-content.mjs` · `scripts/report-exercise-coverage.mjs` · `tests/engine.test.ts` ·
  `CLAUDE.md` · `docs/areas/CONTENT.md` · `docs/areas/COMMANDS.md` · `docs/areas/SESSION.md` ·
  `docs/reports/CONTENT_AUDIT_2026-07-30.md` · `docs/DECISIONS.md` §s198 · `docs/PROJECT_STATUS.md` ·
  this log.
  **Shipped:** three commits (`752bfce` the blanking rule + the gates + the 25 words, `8006e2d`
  reading freshness, `fcea41d` docs) → **PR #822**, CI green (the single `lint-content` job runs
  every gate), squash-merged as **`03ea3dc`**. All three `main` workflows green on that commit:
  Validate content, Deploy site to GitHub Pages (**no self-cancel: the s197 timeout fix held on its
  first real run**) and Deploy Supabase functions, whose "Apply migrations" step ran and passed, so
  **migration 0018 is applied on the live database**. Post-merge housekeeping done (fetch → reset
  --hard origin/main → force-with-lease, tree clean).

- **Prompt 4 (verbatim):** `document the session`
  **Response:** the session documentation had already shipped inside PR #822 (`PROJECT_STATUS.md`
  session-198 log + handoff, this log, `DECISIONS.md` §s198, `CLAUDE.md`, three `docs/areas/*` files
  and the audit report's backlog status), so this pass added only what was not knowable before the
  merge: the shipping record above (PR number, the three commit SHAs, the squash SHA, the three
  green `main` workflows, migration 0018 applied) and the same facts in the status handoff, whose
  "resume" list no longer tells the next session to expect the migration on a future merge.
  **Artifacts:** `docs/SESSION_PROMPT_LOG.md` · `docs/PROJECT_STATUS.md`.

## Session 199 — 2026-08-07 — branch `claude/task-list-priorities-3f50ad`

- **Prompt 1 (verbatim):** `what's next in the task list?`
  **Response:** read `docs/PROJECT_STATUS.md` and the `PROJECT_REFERENCE.md` backlog and reported the
  state: nothing mid-flight (s198 shipped clean as `03ea3dc`, all three `main` workflows green,
  migration 0018 live), P10 the only open content-audit item and founder-owned, then the four queued
  items in priority order: the s181 writing-task **quality** audit, the s186 exam content gaps (A2
  has zero exam content, C1 Hören has one audio text), the §2.1 sub-theme restructure (deliberately
  unscheduled, it drags the writing-task invariant behind it), and the housekeeping tail (CLAUDE.md
  380 lines against a ~350 budget; `verify:grammar` skipped in s198). Recommended the writing-task
  quality audit as this session's work and asked whether to start.
  **Artifacts:** none (read-only).

- **Prompt 2 (verbatim):** `go ahead`
  **Response:** ran the s181-queued audit and shipped
  **`docs/reports/writing-tasks-audit-2026-08-07.md`**. Headline: **the tasks are well written, the
  tags on them are not.** What is healthy was measured first so the founder does not over-react: only
  **6** near-duplicate instruction pairs across all 256,686 comparisons (all same-theme, zero
  cross-theme), 2,355 distinct Leitpunkte of 2,691, **zero** Leitpunkte demanding a non-written act,
  5 within-task overlaps that are all deliberate parallel pairs, and a demand ladder that does rise
  (86% → 69% → 27% of tasks carry no justification Leitpunkt at B1 → B2 → C1). Five findings:
  1. **Branche is a coverage artifact.** All **40** theme×length pools carry exactly **15** distinct
     sectors, the exact size of the `WorkSector` enum, in pools as small as 11 tasks; the tags run in
     enum order down the pool index. **199 of 600** tagged tasks (33%) contain no marker of the
     sector they claim, and in Alltag ~65 briefs name no work-shaped constraint at all, against the
     founder's own s181 rule (`wt_freizeit_s08` [pharma] is "Sie haben auf einer Feier eine Bekannte
     wiedergetroffen"). Cause: `tests/moduleScope.test.ts` demands all 15 Branchen on every theme at
     both lengths, which 11-task Alltag pools cannot satisfy by authoring. Cheap to fix because
     Branche is SOFT: untagged = universal, so deleting a dishonest tag costs no availability.
  2. **The Niveau tag scales the word count and the grader's strictness, not the language.** `level`
     is what builds "Bewerte streng auf X-Niveau" in `evaluate-writing`, yet the brief's specialized
     vocabulary share runs 2.7% → 2.3% → **1.6%** (inverted), instruction length is flat at 14–16
     words in every band, and 81/307 B1 tasks outscore the C1 median. Marked SOFT on its own and
     deliberately not scheduled: the rubric must stay readable.
  3. **236 tasks are graded for argumentation their brief never asks for** (207 B2, 29 C1). Sharpest:
     **6 C1 Stellungnahmen at 200 words** whose Leitpunkte are purely descriptive.
  4. **`exam` is dead metadata that contradicts `words`.** `words` is fully determined by (level,
     length) though its doc says it follows the exam shape; 61 `goethe_b1`-shaped tasks carry a
     150-word target, 69 tasks sit outside their shape's band, and nothing reads the field.
  5. **`source` is unused on all 717 tasks**, so 54 Stellungnahmen and 17 Forumsbeiträge paraphrase
     the position they react to instead of quoting it.
  Plus a 19-item tail (5 Textsorte contradictions, 14 Adressat/register mismatches where `du` meets
  "Frau <Nachname>"). **Two heuristics were corrected mid-audit rather than published:** an
  opening-verb demand classifier scored 9 of 11 `widerspruch` tasks as unargumentative until hand-
  reading showed "**Legen** Sie dar, warum …" is exactly the argumentative move (corrected: 1 of 11),
  and a thin Branche lexicon returned 40% bare until it was widened with `QS`, `Baugruppe`,
  `Validierung` and similar (corrected: 33%, and generous by construction). Both corrections are
  recorded in the report's §9 Method so the next session does not re-make them. Prioritised fix list
  P1–P5 at the end, with the two `lint:content` checks worth keeping named in P1 and P2. **No content
  or code was changed:** the deliverable is the report, and P1 opens with a founder decision.
  **Artifacts:** `docs/reports/writing-tasks-audit-2026-08-07.md` (new) · `docs/PROJECT_STATUS.md` ·
  `docs/PROJECT_REFERENCE.md` · this log.

- **Prompt 3 (verbatim):** `go with your recommendation reg branche. I prefer to have Berufsleben and
  Alltag as the first filter and then themen and only then Branchen filter as the heirarchy of the
  filter rail all across. When a user selects a thema where there is no branche specific content,
  just show the options within Branche as locked.`
  **Response:** took P1 option (a) and then the two rail changes.
  1. **A Branche tag is EARNED or it is not there.** `scripts/sector-markers.mjs` is the ONE marker
     lexicon, read by `lint:content` AND `tests/writingScope.test.ts` so the gate and the test cannot
     drift. **331 unearned tag instances stripped, 220 tasks universal again**, no id changed, no pool
     renumbered, no task text touched. The two "every Thema serves every Branche" coverage tests are
     replaced by the property they proxied for, plus a floor keeping Berufsleben real (≥8 of 15
     sectors per pool) and a test asserting every Branche still draws everywhere, which is why the
     strip costs no reach. Measured after: Beruf 13.4 of 15 sectors earned on average, Alltag 3.0.
     A first cut of the lexicon withheld shared words like `charge`, `schicht` and `objekt` to be
     "strict" and wrongly stripped `wt_safety_s09` ("An Anlage 2 sitzt die Schutzabdeckung locker.
     Melden Sie das dem Schichtleiter.") from `production`; the shipped lexicon shares a marker
     wherever the word really is shared, and the mistake is recorded in the file so it is not remade.
  2. **The hierarchy inverts in all 8 rails:** Lebensbereich → Thema → Unterthema → Branche, then
     Niveau and Textsorte. Niveau was the one open question (it is not part of the stated hierarchy
     yet led every rail); "as the first filter" was read literally, so Lebensbereich leads and Niveau
     follows. The order is applied INSIDE the rails, never by a caller.
  3. **Branche LOCKS instead of greying**, via a second counting function
     (`countDedicatedTasks`/`countDedicatedTexts`): the old count could never be zero because the soft
     fallback serves the universal pool, so the rail printed a healthy number beside an option that
     changed nothing. A zero now renders a padlock, and when EVERY option is locked one line replaces
     the control (the normal state on Lesen/Hören, where 4 of 52 texts carry a tag). The engine's
     fallback is untouched, so nothing became unreachable and deep links still work.
  **Artifacts:** `scripts/sector-markers.mjs` (new) · `src/data/writingPrompts.ts` ·
  `scripts/lint-content.mjs` · `tests/writingScope.test.ts` · `src/lib/writingScope.ts` ·
  `src/lib/moduleScope.ts` · `src/features/shared/ScopeRail.tsx` · `src/features/shared/FilterRail.tsx` ·
  `src/features/writing/WritingRail.tsx` · `src/features/pruefung/TextModuleHub.tsx` ·
  `src/features/sprechen/SprechenHub.tsx` · `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx`. Commits `acb21f7`, `7f5c464`.

- **Prompt 4 (verbatim):** `no need of design preview for the above mention rail changes`
  **Response:** deleted the half-written `preview/filter-hierarchy.html` (two order variants plus
  three locked-state treatments) and implemented directly. The two sub-decisions the preview existed
  to settle were made in-session and written into `docs/DECISIONS.md` §s199 so they can be revisited:
  Niveau moves below the hierarchy, and "locked" is a padlocked row that collapses to one line when
  every option is locked. Noted in the handoff that the lock lives in ONE place, so restyling it later
  is a single-file change rather than an eight-rail one.

- **Prompt 5 (verbatim):** `while you're at it, the header and footer of the filter rail seems to look
  like separate pieces attached to the main body. remove the separator lines and make all the filter
  rail same shade to look like one piece`
  **Response:** the cause was compositing, not a colour choice: the tile wears `bg-accent/20` and the
  header and Üben footer each painted `bg-accent/20` AGAIN on top of it, so both strips resolved to
  roughly double the wash of the body between them, with a tinted `border-t` underlining each seam.
  The second fills existed to keep the fixed header/footer opaque while the middle scrolled, and were
  unnecessary: the rail is a flex column with `overflow-hidden` and the scroll region is `flex-1`, so
  it already clips its own content. The mobile `layout="panel"` variant had been built without them
  and was already seamless, which is the proof. Both fills and both rules removed, in `FilterRail` AND
  in `ScopeRail`, so the two rails stay identical as s189 established. This supersedes the s169 note
  that such a divider must be tinted rather than grey.
  **Verified in the real app** (headless Chromium over the built bundle, 1440x1100, light and dark):
  the new order, the locked line on Freizeit in both Schreiben and the Bibliothek, and no seams in
  either theme.
  Gates: lint:content 0 errors · typecheck · lint 0 errors (77 warnings) · 649 tests · build ·
  check:bundle 128.2 kB · check:contrast.
  **Artifacts:** `src/features/shared/FilterRail.tsx` · `src/features/shared/ScopeRail.tsx` ·
  `CLAUDE.md` · `docs/DECISIONS.md` §s199 (three entries) · `docs/areas/BIBLIOTHEK.md` ·
  `docs/areas/CONTENT.md` · `docs/areas/SCHREIBEN.md` · `docs/PROJECT_STATUS.md` · this log.

- **Prompt 6 (verbatim):** `document the session. I'll continue with the p2 and others in next session`
  **Response:** the substance had already shipped inside PR #825 (the session-199 log and handoff in
  `PROJECT_STATUS.md`, prompts 3-5 in this log, three `DECISIONS.md` §s199 entries, the three
  replaced `CLAUDE.md` rules, and the three area docs). This pass added only what was not knowable
  before the merge: the shipping record below, and a handoff rewritten around the founder taking P2
  themselves next session rather than around a decision they had already made.
  **How session 199 shipped, end to end:**
  - **PR #824** (the audit report) → squash-merged **`66061c3`**. Validate content and Deploy site to
    GitHub Pages both green.
  - **PR #825** (three commits: `acb21f7` the Branche tag cleanup, `7f5c464` the rail changes,
    `40176d1` the docs) → squash-merged **`bf9db0b`**. Validate content green on the PR head and
    again on `main`; Deploy site to GitHub Pages green on `main`, with no self-cancel, so the s197
    `timeout: 1800000` fix has now held on three consecutive Pages deploys.
  - **Deploy Supabase functions did NOT run on `bf9db0b`, and that is correct, not a failure**: it is
    path-filtered to `supabase/functions/**`, `supabase/migrations/**` and its own workflow file, and
    this session touched none of them. Checked rather than assumed, because "a workflow is missing
    from the commit" and "a workflow failed" look identical in a run list.
  - Post-merge housekeeping done after both merges (fetch → reset --hard origin/main →
    force-with-lease, tree clean).
  **The founder takes P2 next session**, so the handoff now leads with what a P2 session needs (the
  six task ids, the replace-don't-append rule for their Leitpunkte, and the gate to add afterwards)
  instead of the P1 decision that is now closed.
  **Artifacts:** `docs/PROJECT_STATUS.md` · this log.

## Session 200 (2026-08-07) · branch `claude/whats-next-q992fo`

- **Prompt 1 (verbatim):** `what's next?`
  **Response:** read the s199 handoff and reported the queue in plain language: audit **P2** (the six
  C1 Stellungnahmen that punish a learner for following the brief) as the next item, then P3
  (`exam`), P4 (`source`), P5 (the 19-item tail), with P10 human verification and the Resend/Google
  items flagged as founder-owned. Recommended running P2 through P5 in one session, since they touch
  one file and one gate run and P4 depends on P2 landing first.
  **Artifacts:** none (report only).

- **Prompt 2 (verbatim):** `go ahead`
  **Response:** shipped P2, P3 and P5; P4 stopped on the founder's challenge (prompt 3).
  - **P2 (commit `663f993`).** `scripts/justification-markers.mjs` is the ONE classifier, shared by
    `lint:content` and `tests/writingScope.test.ts` (the s199 `sector-markers.mjs` arrangement). A
    Leitpunkt counts when it forces a **reason, a consequence or a stance**; matching is phrase-level
    over the whole clause, never the opening verb. **30 tasks fixed**, each REPLACING its weakest
    descriptive point (22 Stellungnahmen, 11 Beschwerden, 3 Widersprüche, 1 Forumsbeitrag, including
    all six acute C1 cases). Gate: an argumentative Textsorte at B2+ must carry such a point; 110
    tasks gated, all passing, B1 exempt on purpose.
    - **A design mistake worth keeping:** the first cut demanded a STANCE marker specifically from
      every Stellungnahme, which failed `wt_safety_l04`, whose points are "Begründen Sie …", "Legen
      Sie dar …", "Entkräften Sie den Einwand …". A gate that fails the most argumentative task in
      the pool is measuring the wrong thing, so the two tiers collapsed into one demand.
  - **P3 (commit `a7dd57a`).** `exam` retired from all 717 tasks, from the `WritingTask` interface
    and from `src/types/index.ts`; `lint:content` now ERRORS if it reappears (the retired-`sector`
    guard pattern). The `words` comment states the real rule: the target follows (Niveau, Länge).
  - **P5 (commit `f9a1e78`).** Five Textsorte re-tags (the tag follows the requested OUTPUT, not the
    situation) and the 14 du/Sie hybrids, fixed on the Adressat side with first names, because all 14
    are informal messages and switching them to Sie would thin the bank's scarce du practice.
    `lint:content` now errors on register `du` with a title-plus-surname Adressat.
  - Gates on all three: lint:content 0 errors · typecheck · **651 tests** (+2).

- **Prompt 3 (verbatim):** `is Text zur Aufgabe really necessary? in my B2 für Beruf exam  they just gave the topic overview and asked to write a forumsbeitrag. The additional text wasn't provided. can you research what is more realistic and then report to me the findings with recommendations?`
  **Response:** stopped P4 before a single `source` text reached the bank, fetched the published
  material, and reported that **the founder is right and the audit's Finding 5 is wrong**:
  - **Goethe B2 Schreiben Teil 1** is a Forumsbeitrag from a topic sentence plus four Inhaltspunkte,
    no supplied text; Teil 2 (Nachricht to a supervisor) is the same shape.
  - **Deutsch-Test für den Beruf B2** has two writing parts: Teil 1 prints a forwarded customer
    complaint to answer, Teil 2 is a choice of two topics, one a Forumsbeitrag, nothing supplied.
  - **The supplied text belongs to a GENRE (answering incoming workplace mail), not to an exam.** The
    audit selected the 54 Stellungnahmen and 17 Forumsbeiträge, precisely the opinion tasks that get
    no text in either exam. The honest target is the **47 reply-shaped tasks** ("Ein Kunde beschwert
    sich … Antworten Sie ihm"), which is the DTB B2 Teil 1 shape.
  - Two further audit claims were false: `source` has **no rendering slot** (read by nothing, not the
    Aufgabe card, not the exam's Schreiben part, not `evaluate-writing`), so P4 was never a data-only
    edit. Recommended parking P4 and doing the reply wave as its own session.
  **Artifacts:** `docs/reports/writing-tasks-audit-2026-08-07.md` (correction blocks under §6 and
  §8-P4) · `preview/schreiben-source-text.html` + artifact (the A/B/C placement mockup, built before
  the research and kept for the reply wave) · `docs/PROJECT_STATUS.md` · this log.

- **Prompt 4 (verbatim):** `i agree with your assessment on p4 and a gap with Beschwerde. I'd go with your recommendation on this. document the session at this point, push everything live and we pick it up in a new session`
  **Response:** P4 is closed as "not a defect", the reply wave is queued as the next session's work,
  and the branch shipped to `main`. The handoff now opens with what that session needs in order: 47
  authored incoming texts, the rendering slot that does not exist yet (the Aufgabe card, the exam's
  `SchreibenPart` and the `evaluate-writing` payload all ignore `source`), the two height laws to
  respect while adding a block to a locked mobile anatomy, and the gate to add afterwards. The A/B/C
  placement mockup is built and unpicked, so that session starts by asking which one.
  **Artifacts:** `docs/PROJECT_STATUS.md` · this log · PR into `main` (see the shipping record).
  **How session 200 shipped:** PR **#828** → squash-merged **`df101d7`**; Validate content and Deploy
  site to GitHub Pages green on `main`; Deploy Supabase functions correctly did not run (path-filtered
  to `supabase/**`, untouched this session). Housekeeping done after the merge.

## Session 201 — 2026-08-07 — branch `claude/ui-polish-consistency-56ja1y`

_(Renumbered from 200: `claude/whats-next-q992fo` ran in parallel, took that number and reached
`main` first, so this session is 201 wherever it is cited, in the docs and in the code comments.)_

- **Prompt 1 (verbatim):** `[four phone screenshots: /lesen, /hoeren, /simulation, /writing]` `i want
  you to make these pages consistent and highly polished. Review the exit buttons, toggles, layouts,
  tile shapes, transition animations, etc - leave no stone unturned. Make it a finished product which
  is presentable to thousands of audience and investors. I want the highest quality possible like
  from senior experts of the industry developing billion dollar edutech app. some of the observed
  bugs:` `- the header bar shouldn't have the aufgabe button - place it somewhere else.` `- shuffle
  button has a bug where taping it again doesn't deactivate it instead it deactivates when tapped on
  empty spaces - fix it.` `also make sure to keep the design language consistent with the rest of the
  app and use the color palette from the brand kit wherever relevant.`
  **Response:** reproduced every screen in headless Chromium at 360x640 first, which turned the
  second reported bug into a much bigger finding: **Lesen and Hören were dead pages.** Starting a
  text or the random draw only wrote the run into `useExamStore`, and the Prüfung hub was the ONLY
  screen that rendered a run, so nothing happened on `/lesen` and `/hoeren`; what the founder saw as
  "the shuffle doesn't deactivate" was a stuck touch-`:hover` on a button whose tap led nowhere.
  Fixes, in the order they matter:
  1. **The two choosers work.** `TextModuleHub` renders `<MockExamRunner />` while a run exists (the
     hub's own pattern), `AppShell` gained `STAGE_ROUTES`, and the chooser's `zoneExit` steps aside
     while the runner owns the exit and only clears an exit that is still its own. Finishing a drill
     lands back on the list it was picked from. Verified end to end: pick → answer 3 → Teil
     abschließen → 100 % → Fertig → back on `/lesen`, run cleared, nav restored.
  2. **The zone's exit was missing on `/lesen` and `/hoeren`**: they were never in `ZONE_ROUTES`, so
     those two were the only screens in the zone with no way back in the header. Now all four have
     it, in the same corner.
  3. **The Aufgabe toggle left the module row** and sits at the right end of the chooser's own
     toolbar row, level with the count it changes and directly above the panel it opens.
  4. **Sticky touch-hover is gone app-wide:** `future.hoverOnlyWhenSupported` compiles every
     `hover:` into `@media (hover: hover)`, so a tapped control no longer stays lit until the next
     tap somewhere else. (Verified in the minified production CSS, not just in dev.)
  5. **One chooser, three modules:** `ModulePicker` now owns the toolbar row, `ChooserCard` is the
     one card anatomy (Sprechen had put the Niveau in the head, rendered a `div onClick` a keyboard
     could not reach, nested a "Starten" button inside its own click target and wore a
     `shadow-glow`, a landmine since s136), `ModuleTabs` is the one switcher, and both list
     animations share one 0.16s stagger. Sprechen's module row moved ABOVE its switcher, so all four
     pages read module row → switcher → content. Sprechen also gained the random draw the other two
     always had.
  **Artifacts:** `src/features/pruefung/{ModulePicker,ChooserCard,ModuleTabs,TextModuleHub}.tsx` ·
  `src/features/sprechen/SprechenHub.tsx` · `src/components/layout/AppShell.tsx` ·
  `tailwind.config.ts` · `CLAUDE.md` · `docs/areas/PRUEFUNG.md`.

- **Prompt 2 (verbatim):** `either keep verlauf in every module or remove it from all of the
  individual modules and just in the prufung hub page`
  **Prompt 3 (verbatim):** `go with verlauf on all four`
  **Response:** flagged the cost of the other option before building (removing them would delete the
  writing corrections and the spoken transcripts from the app, since nothing else renders either),
  then added the Verlauf tab to Lesen and Hören. The Verlauf card, chart, empty state and delta chip
  were EXTRACTED from `PruefungHub` into `features/pruefung/verlauf.tsx` rather than rebuilt, and the
  chooser must not import the hub: that would drag `mockExamAvailability` and the writing-prompt bank
  into the `/lesen` chunk. The new per-module history (`moduleRuns`) is the Modelltest Verlauf's
  composition at module scale (last score + delta, Bester, Bestanden, seven bars against the pass
  line), with the Niveau on each row instead of the module name the page already says, and a
  Modelltest is never listed there (`isFullMockRun`). The hub keeps the cross-module views only.
  `ModulePage` gives the Verlauf tab the same columns the Üben tab has, so switching tabs moves no
  edge sideways.
  **Artifacts:** `src/features/pruefung/verlauf.tsx` (new) · `PruefungHub.tsx` (now imports it) ·
  `TextModuleHub.tsx` · `SprechenHub.tsx` · `ModulePicker.tsx` · `tests/pruefungHub.test.ts` ·
  `docs/PROJECT_STATUS.md` · this log.

- **Prompt 4 (verbatim):** `continue`
  **Response:** re-verified the whole tree after the `origin/main` merge rather than trusting the
  pre-merge gates: typecheck, lint (0 errors), 652 tests, build, bundle 128.2 kB of a 400 kB budget,
  contrast, `lint:content`. Then walked all four pages again in headless Chromium at 360x640 and
  1280x860, light and dark: the drill loop end to end on `/lesen` (pick → answer → Teil abschließen →
  Ergebnis → Fertig → back on the list, run cleared, bottom bar restored), the Aufgabe panel opening
  under its own toggle, the empty scope hiding the draw and naming the one filter to drop, and the
  new module Verlauf both empty ("Noch kein Ergebnis") and with runs (last score + delta chip, Bester,
  Bestanden, bars against the pass line, rows, "Alle 4 anzeigen"). Every screen rests at 0 page
  scroll. Also trimmed `CLAUDE.md` from 391 to 383 lines: the merge had left this session's law and
  s199's stating the Modelltest-vs-practice rule twice, and the zone bullets carried detail that
  already lives in `docs/areas/PRUEFUNG.md`. The file is still over the ~350 budget it was over
  before this session (378 at `66061c3`), so the linter still warns; that debt is older than this
  work and wants a pass of its own.
  **Artifacts:** `CLAUDE.md` · `docs/PROJECT_STATUS.md` · this log.

- **Prompt 5 (verbatim):** `get rid of the streak and account settings wherever the exit or back
  button is shown`
  **Response:** one flag in `AppShell`, `quietHeader = exam || !!exit`, now hides the streak pill and
  the `AccountMenu` on every screen that carries the zone exit, which is what a running Teil had done
  since s186 while the trainers and choosers kept them. That was the inconsistency: the same corner
  held three controls on `/writing` and one inside a Teil. The Prüfung HUB is untouched, because it
  is a nav destination and registers no exit, so it keeps both. Nothing became unreachable: both are
  one tap away on every screen outside the zone, and the account also lives in Einstellungen. Law
  restated in `CLAUDE.md` (the one-frame bullet) and `docs/areas/PRUEFUNG.md`.
  **Artifacts:** `src/components/layout/AppShell.tsx` · `CLAUDE.md` · `docs/areas/PRUEFUNG.md` ·
  `docs/PROJECT_STATUS.md` · this log.

## Session 202 — 2026-08-08 — branch `claude/sprechen-filter-rail-practice-70gydw`

- **Prompt 1 (verbatim):** `for the sprechen part, I'd want you to add a filter rail kind of rail
  with useful redemittle even in the practice sessions.`
  **Response:** design work, so previews first (no app code touched). Established what is on screen
  today: a spoken task names its four Redemittel CATEGORIES on the brief card and ticks them in the
  debrief, and the phrases behind them (8 per category, 239 in the bank) live only in the
  Bibliothek, so the learner has category names but no language at the one moment they are speaking.
  Built `preview/sprechen-redemittel-rail.html` from the real tokens: today's desktop and phone
  screens, then three placements for the phrases during a practice conversation, each with a desktop
  and a phone frame and its cost. **A** a 256 px Redemittel rail beside the conversation in the
  ScopeRail tile (panel over the transcript on a phone), **B** a phrase strip above the microphone,
  **C** a second tab (Aufgabe | Redemittel) on the collapsed brief drawer. Three content switches
  ride the page in every option: 3 phrases per intent vs all 8, du/Sie matched to the partner vs
  everything, English inline vs hold-to-peek. Stated in the preview and in chat: practice only, not
  the Modelltest (handing a candidate the phrases would grade the reading), and reading a phrase is
  never a tick, because whether a Redemittel was used stays the model's judgement of what was said.
  Awaiting the founder's pick before implementing.
  **Artifacts:** `preview/gen-sprechen-redemittel-rail.mjs` · `preview/sprechen-redemittel-rail.html`
  · `preview/sprechen-redemittel-rail-artifact.html` (published) · this log.

- **Prompt 2 (verbatim):** `option a's layout for desktop and option c for mobile and also desktop's
  content`
  **Response:** built exactly that. `RedemittelHelp` is ONE content (intent dropdown with honest
  counts, the phrases as white cards, the other three intents as one-tap pills, one `EnPeek` chip for
  the whole list) rendered in two shells: the `ScopeRail` tile beside the conversation from `lg` up
  (the stage widens `max-w-2xl` → `lg:max-w-4xl`, so the conversation column keeps its width and the
  rail takes the space that was empty), and the second tab of the brief drawer below it, **Aufgabe |
  Redemittel**. One `useMediaQuery` decides, so the phrases can never be on screen twice, and the
  desktop brief row keeps its single-button form. **Practice only, structurally:** the runner takes
  the help as a PROP and `SprechenPart` passes nothing, so the Modelltest neither shows a candidate
  the phrases it grades them on nor carries the phrase bank in its chunk (checked in the build
  output: `MockExamRunner` has no `redemittel-*.js` import, `SprechenHub` does). The founder answered
  layout only, so the three content switches took stated defaults: all eight phrases of the chosen
  intent (curating three needs an authored order the bank has not got), the Anrede matched to the
  partner, English hold-to-peek. The Anrede is the one thing here that really filters, and
  `RedemittelPhrase.register` cannot answer it (it is formality, not Anrede), so `src/lib/anrede.ts`
  derives du/Sie from the phrase TEXT: one rule, one place, `tests/anrede.test.ts` gating both the
  rule and the promise that every scenario's four intents stay servable in both registers. It never
  empties a category. `ScopeRail.onReset` became optional for this rail, which browses rather than
  narrows, so a reset would be a dead control. Verified in a real browser (headless Chromium over
  CDP) at 1440x900, 1280x800 and 393x852, light and dark: rail beside the conversation on desktop,
  two-tab drawer on the phone with the intent pills still on screen, every screen at 0 page scroll.
  Gates: typecheck, lint (0 errors), 662 tests, build, bundle 128.3 kB of 400 kB.
  **Artifacts:** `src/lib/anrede.ts` (new) · `src/features/sprechen/RedemittelHelp.tsx` (new) ·
  `src/features/sprechen/ConversationRunner.tsx` · `src/features/sprechen/SprechenHub.tsx` ·
  `src/features/shared/ScopeRail.tsx` · `tests/anrede.test.ts` (new) · `CLAUDE.md` ·
  `docs/areas/SPRECHEN.md` · `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` · this log.

- **Prompt 3 (verbatim):** `if we're done here, document the session and merge everything`
  **Response:** the work itself was already shipped, with its documentation in the same PR: PR **#830**
  → squash-merged **`9c4ca3b`**, Validate content and Deploy site to GitHub Pages both green on
  `main` (Deploy Supabase functions correctly did not run: it is path-filtered and nothing under
  `supabase/` changed), branch reset to `main` and force-with-leased, tree clean. This entry and the
  shipped-line on the s202 handoff close the paper trail. Nothing is left unmerged.
  **Artifacts:** `docs/PROJECT_STATUS.md` · this log.

- **Prompt 4 (verbatim):** `[five phone screenshots of the shipped rail]` `for some reason.. the
  aufgabe text is being cut off.. it's better if that text is below the toggles. Also, the Redemittel
  pills at the bottom should be at the top of that tile and the selected pill should also be shown
  which is not the case at the moment. adapt the same heirarchy for Redemittel in desktop view as
  well.`
  **Response:** all three, one hierarchy in both shells. (1) The drawer bar is two lines now: tabs +
  chevron, then the task title and partner on their own full-width line, so "Projekt termingerecht
  abschließen · Daniel Krause" reads in full. Without tabs (desktop, the Modelltest) the bar stays
  the single row it always was. (2) The pills moved from under the phrase list ("Auch im Gespräch",
  which showed only the OTHER three) to the top of the tile, all four, with the current one lit in
  brand fill and its honest count. (3) The dropdown went with them: a lit pill states the selection,
  so keeping it would print the same fact twice, and four options is pill territory by the app's own
  rule. Same tile, same order, on desktop. Verified in a real browser at 393x852 and 1440x900, both
  drawer tabs, page scroll 0 everywhere. Shipped as PR **#834**, which merged `origin/main` first:
  session 203 had landed the documentation-maintenance pass (#832, #833) mid-flight, and its trim of
  `CLAUDE.md` had already condensed this session's Sprechen law, so the only conflict was this
  append-only file (prompt 4 belongs above the session 203 heading).
  **Artifacts:** `src/features/sprechen/RedemittelHelp.tsx` ·
  `src/features/sprechen/ConversationRunner.tsx` · `docs/areas/SPRECHEN.md` · `docs/DECISIONS.md` ·
  `docs/PROJECT_STATUS.md` · this log.

- **Prompt 5 (verbatim):** `id everything merged to main nd live?`
  **Response:** verified rather than asserted. `git log origin/main..HEAD` empty and the branch at
  the same commit as `origin/main` (`9e0b74e`), so nothing from this session sits unmerged; the four
  PRs are #830 → `9c4ca3b` (the rail), #831 → `e7f1c7f` (the paper trail), #834 → `9e0b74e` (the
  founder's second pass), with session 203's #832/#833 in between. Deploy site to GitHub Pages
  completed successfully on `9e0b74e`, which is the commit carrying both the rail and the
  corrections. Said plainly that the sandbox cannot reach genauly.de, so "live" here means the
  deploy went green, not that the page was opened. Also surfaced one open PR that is NOT this
  session's: **#808 "docs: record the s192 merge"** on `claude/prufung-ui-bottom-bar-u0fdwf`, stale
  and unrelated, awaiting a founder call on merge-or-close.
  **Artifacts:** none (verification only).

- **Prompt 6 (verbatim):** `document the session`
  **Response:** the session's substance was documented inside its own PRs (`CLAUDE.md`,
  `docs/areas/SPRECHEN.md`, `docs/DECISIONS.md` §s202 and the s202 follow-up, `PROJECT_STATUS.md`,
  this log through prompt 4). This entry closes the remaining gap: prompts 5 and 6, the merge SHA
  and deploy result for PR #834, and the stale #808 as an open item on the handoff. Also recorded
  the session-numbering collision for whoever reads this next: session 203 ran in PARALLEL and
  reached `main` first with the documentation-maintenance pass, so this session's work is s202
  throughout, even though two of its PRs merged after s203's.
  **Artifacts:** `docs/PROJECT_STATUS.md` · this log.

## Session 203 — 2026-08-08 — branch `claude/documentation-maintenance-0w4ywg`

- **Prompt 1 (verbatim):** `do the documentation maintenance`
  **Response:** a docs-only session; no app code touched. Two standing debts closed. **(1)
  `CLAUDE.md` back inside its budget, 399 → 349 lines.** The `lint:content` ratchet warns past ~350
  and had been warning since s198; s201 noted it and left it. The file was over because rules had
  accreted their own history, so the trim cut each bullet back to the RULE plus a pointer and moved
  the rest to where it already lived (`docs/areas/CONTENT.md` for the content measurements,
  `PRUEFUNG.md` for the zone mechanism, `PROJECT_FOUNDATION.md` for the retention timers,
  `SPRECHEN.md` for the conversation detail). **No law was dropped**, and the three that had no
  area-doc home were given one BEFORE the sentence was cut: the "`source` belongs to the reply genre"
  rule and the "match phrases over the whole clause, never the opening verb" trap went into
  `CONTENT.md` §Writing prompts, the module card's "no description line" into `PRUEFUNG.md`, and the
  touch-`:hover` law into the `/design` skill's landmine list as #12, beside the focus-ring law it
  mirrors. The maintenance rule at the top of `CLAUDE.md` now states what a law looks like, so the
  shape is written down rather than inferred. **(2) Every bank count in the docs re-measured against
  `pnpm lint:content`,** because most had drifted silently: grammar drills 195 → **320**, texts
  42 → **52** (126 → 156 checks), scenarios 30 → **36**, exam sets 15 → **21**, provenance
  3,457 → **3,604** rows and 3,444 → **3,591** draft, writing pools 20 → **40**. `CONTENT.md` still
  called the provenance register two array parts (it has been four since s182) and told authors to
  append to the second, which would have put new rows in the middle of the file; `SPRECHEN.md`
  counted 15 exam sets in its no-`anruf`-set-yet note. The taxonomy line also claimed 5 domains "all
  populated" when `pruefung` carries no themes and never has. Every number is now stamped with the
  date it was measured, and `CLAUDE.md` carries a new workflow rule: a count in a doc is MEASURED,
  never carried forward. Housekeeping: the s199 and s200 session logs and the s201 handoff moved into
  the 2026-W32 archive chunk, leaving `PROJECT_STATUS.md` at 187 lines of its ~250 budget. Gates:
  typecheck · lint · test:unit · build · lint:content (the CLAUDE.md warning is gone, 15 → 14
  warnings, the remaining 14 being the pre-existing noun/pron content warnings).
  **Artifacts:** `CLAUDE.md` · `docs/areas/CONTENT.md` · `docs/areas/PRUEFUNG.md` ·
  `docs/areas/SPRECHEN.md` · `.claude/skills/design/SKILL.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` · this log.

- **Shipped (same prompt):** PR **#832** → squash-merged **`48d250c`**. `origin/main` had moved
  mid-session (PR #831, the session 202 paper trail), so the branch merged `main` first and resolved
  one conflict in this file: #831's Prompt 3 entry belongs to the session 202 block, above the
  session 203 heading. Validate content and Deploy site to GitHub Pages both green on `48d250c`;
  Deploy Supabase functions correctly did not run, being path-filtered to `supabase/**` which this
  session did not touch. Post-merge housekeeping done (fetch → reset --hard → force-with-lease),
  tree clean. **Note for the next session: `CLAUDE.md` now has about one line of headroom**, so a
  new law costs an old line.
  **Artifacts:** `docs/PROJECT_STATUS.md` · this log.

- **Prompt 2 (verbatim):** `document the session`
  **Response:** most of it was already written, because this session's deliverable WAS documentation
  and it shipped with its own log: the session 203 entry above (Prompt 1 + the shipped note), the
  `PROJECT_STATUS.md` session log and handoff, and the area-doc corrections all went out in PR #832
  and PR #833. What this prompt adds is the paper trail that could not exist yet when those merged:
  **PR #833 → `8a45be9`** (recorded nowhere until now, having been written before its own merge),
  this entry, and the PR list on the s203 log and handoff (#832, #833, #837), so the session reads
  as three merges rather than one. Nothing else was stale on a re-read: `CLAUDE.md` holds at 349,
  `PROJECT_STATUS.md` at 199 of its ~250, and `lint:content` reports the same 14 pre-existing content
  warnings with no `[docs]` line. **Standing note carried forward:** `CLAUDE.md` has about one line
  of headroom, so the next law added to it costs an old line somewhere, and a count quoted in any doc
  is re-measured with `pnpm lint:content` rather than copied from the line above it.
  **Artifacts:** `docs/PROJECT_STATUS.md` · this log.
---

## Session 204 — prompt 1 (2026-08-06): the KI-usage task, part A

**Branch:** `claude/ki-usage-task-kg0vix`

**Prompt (verbatim):**

> continue with KI usage task

**Response summary.** Picked up s196's prompt-2 scope (founder-approved A + B) from the
"Resume here" note. **Shipped A, prepared B's preview round, did not build B.**

**A: the Umformung is no longer a silent AI feature.** `transform-sentence` enforces
`TRANSFORM_DAILY_LIMIT` (30/day) and was in no allowance at all, so that wall arrived unannounced.
`AiMode` gains `transform` (default 30), counted against the SAME ledger the function counts
(`sentence_ai_ops`, `kind = 'transform'`, paid ops only, so a cached Umformung is free on both
sides); the function returns `dailyLimit`/`dailyRemaining` on its success and limit-reached
responses; `transformSentence` reports them like every other AI client. The Umformung keeps its OWN
budget rather than joining Fokus, because it has never spent a Korrektur (s167) and one round can
spend three of it. Rendered with the existing `AllowanceNote`, no new component. Also fixed a stale
header comment in the function (it claimed a default of 40; the code says 30).

**B: previews built, not implemented.** `preview/ki-usage-chip.html` (artifact
<https://claude.ai/code/artifact/749b6ec2-d56d-4f48-bd5a-cfef4efeedb4>) shows four candidate chips
(A quiet line · B accent chip beside the button · C count on the button · D chip with a dot meter)
in the same three contexts, built from the real `src/index.css` tokens, with a light/dark switch and
a plenty / nearly-gone / used-up switch, plus three candidates for the AI mark itself (the sparkle
cannot be it: Quiz, empty states and onboarding already use it). Screenshot-verified in headless
Chromium at 1280px in both themes and all three states before publishing.

**Gates:** typecheck · lint 0 errors (77 warnings, unchanged — verified against a stashed baseline,
because the s196 note said 76) · **625 tests** (up from 624, new transform cases in
`tests/aiAllowance.test.ts`) · build · check:bundle 129.8 kB of 400.

- **Artifacts:** `src/lib/aiAllowance.ts` · `src/lib/sentenceStudio.ts` ·
  `src/features/writing/fokus/FokusTrainer.tsx` · `supabase/functions/transform-sentence/index.ts` ·
  `tests/aiAllowance.test.ts` · `preview/ki-usage-chip.html` · commits `457fcbd`, `1e9f3d7`
  (branch pushed, no PR yet)

---

## Session 204 — prompts 2-4 (2026-08-06): what "AI usage" should actually mean

**Branch:** `claude/ki-usage-task-kg0vix`

- **Prompt 2 (verbatim):** `this one shows just the count we arbitrarily determined. I want to show
  the actual usage of the AI`
  **Response (no code).** Dismissed the chip/mark question and answered the premise instead: the
  count is real (it counts actual calls), the LIMIT is invented (a cost guard we chose). What the
  app already records per call: the feature, the timestamp, which model answered, whether it was a
  free cache hit, and an estimated cost. What it does NOT record: tokens (read from the provider,
  turned into a cost, discarded). Offered three readings of "actual usage" — (1) count UP real
  consumption learner-facing, (2) extend the founder-facing spend view, (3) store real tokens like
  Claude Code — and asked which.

- **Prompt 3 (verbatim):** `whenever I use AI feature, I see some cost in the control center. Does
  that mean it's real money being used or just an arbitrary number? I'm confused because you
  mentioned in several cases that Gemini has a free tier that means no money should be used`
  **Response (no code).** Read the four functions and answered per provider: **Gemini books 0.00**
  (true while the key stays inside Google's free tier, and it is an assumption, not a measurement),
  **Claude** is computed from the token counts the API actually reports times the published
  per-million rates (real money, accurately estimated), **GPT-5 in `converse`** likewise, but
  **GPT-5 in `check-sentence`, `evaluate-writing` and `transform-sentence` is a hardcoded flat
  0.004 $ per call** — the one genuinely arbitrary number. So a non-zero figure in the control
  centre means Gemini did NOT answer that call. Also flagged that the rates are hardcoded in four
  places and drift when a provider repricies. Nobody bills the figure: `ai_usage.cost_estimate` is
  our own reconstruction and a fuse against `MONTHLY_SPEND_CAP_USD`.

- **Prompt 4 (verbatim):** `how do we make sure we see real usage and costs and not just estimates?`
  **Response (no code), and the recommendation this session ends on.** Three steps, cheapest first:
  **(1) measure tokens instead of assuming them** — one `ai_calls` table where every call writes
  what the provider reported (feature, provider, model, input/output/cached tokens, cache hit), and
  prices move out of four Edge Functions into one config row; **(2) reconcile against the
  providers** — Anthropic's Usage and Cost Admin API (`/v1/organizations/usage_report/messages` and
  `/v1/organizations/cost_report`, separate `sk-ant-admin01-` key, **organization account required,
  not an individual one**, data fresh within ~5 min) and OpenAI's equivalent organization
  usage/cost endpoints, pulled nightly so the control centre can show "ours 3.42 $ · Anthropic says
  3.51 $"; Gemini has no clean billing API, so free-tier consumption stays a self-measured count
  against the published limits and must SAY so; **(3) the learner-facing number stays counts, never
  money.** One accuracy check run against the live code: our hardcoded Claude rates ($3/$15 Sonnet,
  $1/$5 Haiku) match Anthropic's current published rates, so those rows are close to right today.
  Founder: "document the session along with your recommendation. We'll continue later."

- **Artifacts (prompts 2-4):** analysis only · `docs/PROJECT_STATUS.md` · `docs/DECISIONS.md` §s204 ·
  `docs/areas/SCHREIBEN.md` · this log


---

## Session 204 — prompt 5 (2026-08-06): step 1, and the Sprechen limits

**Branch:** `claude/ki-usage-task-kg0vix`

**Prompt (verbatim):**

> continue with step 1. also, I don't want to have the current limit for sprechen exercises. it's
> very less. increase the limit to 6 for üben and 3 for Prüfung.

**Response summary.** Both, shipped.

**Step 1: AI usage is measured, not assumed.** Migration `0018_ai_calls.sql` adds the per-call
ledger (feature, provider, model, input/output/cached tokens, cache hit, derived cost, rate
version), select-own RLS so a learner-facing readout needs no new endpoint, a founder roll-up
(`admin_ai_usage_breakdown`, aggregates only) and a 400-day `pg_cron` purge.
`supabase/functions/_shared/aiUsage.ts` is the one place that reads each provider's differently
named token block, prices it from ONE table (runtime-overridable via `app_config.ai_rates`, with the
empty-config-equals-today contract preserved) and writes the row. All four Edge Functions were
rewired to it: gone are the **flat $0.004-per-GPT-5-call guess** in three of them and the four
hand-copied Claude formulas. Cache hits are recorded as zero-cost calls so the hit rate is visible.
`ai_usage` is deliberately untouched: it stays the monthly spend fuse, and `ai_calls` is the detail
behind it.

**Sprechen: 6 Üben + 3 Prüfung per day**, replacing one shared budget of 2. Counted separately
against `speaking_conversations.exam` on both sides (server `DAILY_LIMIT_CONVERSATIONS` /
`DAILY_LIMIT_EXAM_CONVERSATIONS`, client `sprechen` / `sprechenExam`). **For an existing
conversation the ROW's own `exam` decides which budget it spends, never the request body**, so a
forged flag cannot move a running conversation onto the emptier meter. Two things had to move with
it: the per-learner monthly ceiling (40 → 120, because 40 against 9 possible a day would have bound
within four days), and the Modelltest's budget note, which now reads the exam meter rather than the
practice one.

**One judgement call worth the founder's attention.** `ai_calls` is a new per-user record, so both
language versions of the privacy policy's retention section now describe it (no text, counts only,
400 days, link dropped on account deletion) and `CONSENT_VERSION` / `PRIVACY_LAST_UPDATED_ISO` were
bumped in lockstep to `2026-08-06`. That **asks every signed-in learner to re-consent** on their next
visit. It follows the documented lockstep rule and errs toward disclosure; reverting is one line if
the founder would rather not interrupt learners for telemetry that holds no text.

**Gates:** typecheck · lint 0 errors (77 warnings, baseline) · **637 tests** (up from 626;
`tests/aiUsage.test.ts` pins the pricing arithmetic, the three providers' token shapes and the
never-free-unknown-model rule, and `tests/aiAllowance.test.ts` pins the two Sprechen budgets) ·
build · check:bundle 129.8 kB · check:contrast · lint:content · lint:migrations. The Edge Functions
are Deno and outside `tsc`, so they were syntax-checked with esbuild and read line by line instead.

- **Artifacts:** `supabase/migrations/0018_ai_calls.sql` · `supabase/functions/_shared/aiUsage.ts` ·
  all four `supabase/functions/*/index.ts` · `src/lib/aiAllowance.ts` · `src/lib/speaking.ts` ·
  `src/features/sprechen/{ConversationBriefCard,ConversationRunner}.tsx` ·
  `src/features/pruefung/PruefungHub.tsx` · `src/features/legal/PrivacyPolicy.tsx` ·
  `src/lib/{consent,legalMeta}.ts` · `tests/aiUsage.test.ts` · `tests/aiAllowance.test.ts` ·
  `CLAUDE.md` · `docs/PROJECT_FOUNDATION.md` · `docs/areas/{SPRECHEN,LEGAL-ADMIN}.md` ·
  `docs/DECISIONS.md` §s204 · `docs/PROJECT_STATUS.md` · this log


---

## Session 204 — prompt 6 (2026-08-08): ship it

**Branch:** `claude/ki-usage-task-kg0vix` → `main`

**Prompt (verbatim):**

> merge everything to main and live. document the session

**Response summary.** Opened **PR #835** with everything the session produced and squash-merged it
into `main` under the auto-ship rule, then did the post-merge housekeeping.

**One thing added under "and live" rather than left for later:** the `pages.yml` deploy timeout,
raised from the action's 600 s default to 30 minutes on all three attempts. s196 had already
established the diagnosis and the fix and left it untaken as its own review; since this prompt asked
for the change to go live, shipping the merge on top of the known-broken timeout would have invited
the same red deploy the founder has now seen three sessions running. The retry chain stays.

**What went live:** the Umformung's visible allowance; the `ai_calls` per-call usage ledger with one
shared rate table (migration 0018 applies before the Edge Functions deploy, which is the required
order here); the two Sprechen budgets (6 Üben, 3 Prüfung); the privacy-policy disclosure of the
usage log with the consent version bumped in lockstep; and the CI timeout fix. `preview/ki-usage-chip.html`
ships as a preview file only, nothing implemented from it.

**Flagged, not decided:** the consent bump re-prompts every signed-in learner on their next visit,
and reverting it is one line.

**How it actually shipped.** Two surprises, both handled before the merge rather than after:
1. **`main` had moved 20 commits** (sessions 197-203) while this branch was open, so the branch was
   merged with `main` twice (a second time when two more doc commits landed mid-merge) and every gate
   was re-run on the merged tree: typecheck · lint 0 errors · **675 tests** · build ·
   check:bundle 128.3 kB · check:contrast · lint:content · lint:migrations. Conflicts were resolved
   by keeping BOTH sessions' facts in the append-only logs, taking main's compressed CLAUDE.md (s203
   had just brought it back under budget) and paying for the new invariant by trimming elsewhere, and
   taking **main's** `pages.yml`, which had already raised the deploy timeout as #821 with a better
   split than this branch's own attempt. **This session is renumbered 204**: two parallel sessions
   had already used 197 while it was open.
2. **GitHub never queued a CI run for PR #835.** Other branches' runs were queuing normally
   throughout, so this is the same "no checks on this PR" behaviour s196 recorded, not an outage. The
   merge went ahead on the LOCAL gate run, said so in the merge commit, and `main`'s own push-triggered
   workflows then ran: **Deploy Supabase functions** (migration 0018 + the four Edge Functions) and
   **Deploy site to GitHub Pages**.

- **Artifacts:** **PR #835**, squash-merged as `ad8fead` · merge commits `3f31172` and `bcfb3f7` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`

**Post-merge: the backend deploy went red, and why.** `Deploy Supabase functions` failed on
`ad8fead` with `duplicate key value violates unique constraint "schema_migrations_pkey", Key
(version)=(0018)`. A parallel session had shipped `0018_texts_done.sql` in #822 while this branch
was open, and this branch's ledger migration was also numbered 0018. The remote records ONE row per
VERSION, so the second file could never be applied, and because migrations run BEFORE the Edge
Functions in that workflow, the collision took the whole backend deploy with it: no `ai_calls`
table, and none of the four rewired functions live.

Idempotency does not protect against this (the clash is in the migration ledger, not in the SQL), so
the fix is a renumber plus a gate: `0019_ai_calls.sql`, and `pnpm lint:migrations` now FAILS on two
files sharing a version prefix. Verified by planting a duplicate and watching it go red. Shipped as
**PR #839**.



---

## Session 205 — 2026-08-09 — branch `claude/ki-usage-task-kg0vix`

Step 2 of the AI-cost work, unblocked by the founder creating an organization and an admin key.

- **Prompt 1 (verbatim):** `what's next step from me? be as clear and consise as possible`
  **Response:** one instruction (create the org, then an Admin API key, then store it in Supabase),
  plus the two reversible calls from s204 (the consent bump, the Sprechen numbers).

- **Prompts 2-4 (three screenshots + `I'm a bit lost.. what should I select here` /
  `there's no settings option below analytics` / `what here?`):** navigation help through the
  Console. **This is where I sent the founder in circles twice**, first by reading "Organization
  credits" on the dashboard as proof of an organization, then by pointing at a Settings menu that
  does not exist on that account. The founder's `can you cross check your response with official
  website and sources before giving me wrong instructions?` was fair. Fetching the official docs
  produced the real answer: **the Admin API is unavailable for individual accounts**, and the org
  was literally named "Arya's Individual Org". Corrected the earlier claim explicitly rather than
  quietly, and recommended NOT converting, because monthly spend was $0.04 and reconciliation at
  four cents verifies a rounding error.

- **Prompt 5 (verbatim):** `I clicked on create team account to see if it's free or not and it seems
  free so I went ahead to create it and then admin key.`
  **Response:** flagged two things before they clicked Add: a 30-day expiry would stop the job
  silently, and a Console admin key has **no scopes**, so the "readonly" name is a white lie and the
  key carries full admin rights. Asked them to verify no subscription charge appeared, since I
  cannot see their billing.

- **Prompt 6 (verbatim):** `done with supabase secret. I selected 30 days for security reasons. I
  can do it again after sep 8 if needed.`
  **Response, and the build:** the right call, and it shaped the design. Because the key expiring is
  a PLANNED event, the failure had to be loud: a 401 becomes a German sentence in
  `provider_sync_state.last_error` that the admin card renders above the numbers.
  Shipped: migration `0020_provider_costs.sql` (`provider_costs`, `provider_sync_state`,
  `admin_ai_reconciliation`, `admin_ai_sync_state`, 400-day purge), the founder-gated
  `reconcile-ai-cost` Edge Function, `_shared/costReport.ts` with `tests/costReport.test.ts`, and
  `AiCostReconciliation.tsx` in the admin System screen.
  **Two design calls worth keeping:** no cron (scheduling from the database means storing a
  credential there, so the card refreshes on open at most hourly and on demand), and an unreported
  provider day renders "–" rather than 0, because "not yet known" and "cost nothing" are opposite
  facts that a zero makes identical. Why → `docs/DECISIONS.md` §s205.

- **Prompts 7-8 (verbatim, mid-turn):** `merge to main when done.` and `document the session at the
  end`
  **Response:** shipped as PR #840 and squash-merged; this entry and the status log are the
  documentation.

**Gates:** typecheck · lint 0 errors (78 warnings, one new, same async-setState class as the
existing ones) · **687 tests** (up from 675) · build · check:bundle · lint:content · lint:migrations.
Edge Functions are Deno and outside `tsc`, so they were syntax-checked with esbuild.

- **Artifacts:** `supabase/migrations/0020_provider_costs.sql` ·
  `supabase/functions/{reconcile-ai-cost/index.ts,_shared/costReport.ts}` ·
  `src/features/admin/{AiCostReconciliation,AdminSystem}.tsx` · `src/lib/adminApi.ts` ·
  `tests/costReport.test.ts` · `docs/{PROJECT_STATUS,PROJECT_FOUNDATION,DECISIONS}.md` ·
  `docs/areas/LEGAL-ADMIN.md` · this log

---

## Session 206 — 2026-08-09 — branch `claude/speaking-exercises-ai-error-xk6o7h`

_Ran in PARALLEL with session 205 (the cost reconciliation), which reached `main` first. This
session renumbered from 205 to 206 rather than reuse a taken number._

- **Prompt 1 (verbatim):** `there is an error with speaking exercies - the ai feature doesn't work`
  **Response:** read the whole `converse` path plus the two commits that had touched Sprechen last
  (s202's Redemittel rail, s204's usage ledger) and confirmed the backend deploy for both was green.
  **The sandbox cannot probe the live function** (the environment's network policy answers 403 to
  `stkfdavpjflpqoxjunnj.supabase.co`), so the four plausible branches could not be told apart from
  here. Asked the founder which of four German messages the screen showed, with each option naming
  the branch it would implicate.

- **Prompt 2 (verbatim, mid-turn):** `for the redemittel rail, display only 4-5 highly useful and
  frequently used redemittel phrases, not too many of them.. Also, the first redemittel is literally
  overshadowed due to unnecessary shadow effect below the toggle buttons and pills. fix it`
  **Response:** the "shadow" is `mask-fade-y`, applied unconditionally to the phrase list, so a list
  resting at its top faded its own first phrase out under the pills. Replaced with `useEdgeFade`
  (per edge, only where content continues, the rule the Bibliothek columns already run on). Capped
  the list at five, picked as the EASIEST that fit the Anrede by `CEFR_ORDER` and shown in the bank's
  authored order, and dropped the count from the intent pills: capped at five it printed the same
  digit four times, which is dead chrome, not honesty.

- **Prompt 3 (answer to the question):** `it says nothing.. I say something and submit but it loads
  and there's no response from ai`, then a screenshot: `this is what happens.. no response`
  **The screenshot solved it.** The caption under the microphone read **"Bitte melde dich an, um mit
  der KI zu sprechen."** Signed out with Turnstile on, `converse` cannot be called, and the refusal
  arrived after the learner had started the conversation, opened the mic and spoken a full sentence,
  in the same faint grey slot that otherwise says "Ich höre zu …", on a screen whose quiet header
  carries no account menu (s201). **Ask for the screen before theorising about the server.**
  Shipped: `speakingAuthBlock()` / `useSpeakingAuthBlock()` (one rule, two readers) with the gate on
  the brief card, Start becoming **Anmelden** and opening `AuthDialog`, `TurnResult.needsAuth`
  opening the same dialog when a session lapses mid-run, `MicCluster.captionTone` so a failure is
  never printed in the status grey, and the caption rendered at all in the typed fallback.
  **Two real defects found on the way:** no cascade leg in any Edge Function had a timeout
  (`AbortSignal.timeout`, 20 s turns / 60 s debrief), and the free Gemini turn leg had been returning
  nothing since s196, because `gemini-2.5-flash` reasons by default and Google bills thoughts as
  output, so a 500-token turn budget was spent thinking: every turn had been silently falling
  through to the paid model. Turns now send `thinkingBudget: 0`, and a losing leg logs its provider,
  HTTP status and error code.

- **Prompt 4 (verbatim, mid-turn):** `first merge the changes from this session and make it live.
  stop the documentation where you are. I'll prompt you later to do it`
  **Response:** stopped the documentation pass mid-file, shipped what was written, opened PR #841.
  The squash hit a conflict (session 205 had merged `main` meanwhile), so `origin/main` was merged
  in, the session renumbered to 206, and every gate re-run on the merged tree before merging.

- **Prompt 5 (verbatim, mid-turn):** `compelte the merge and also documentation`
  **Response:** merged as **`d4a4771`**, post-merge housekeeping done, then the documentation
  finished: `CLAUDE.md` carries the widened wall law and is back at **349 lines** (six existing
  bullets were compacted to pay for it, per the replace-don't-append rule), `docs/areas/SPRECHEN.md`
  carries both new mechanisms in full, and `PROJECT_STATUS.md` is down to **198 lines** with the
  201-203 logs and handoffs archived into the W32 chunk.

**Gates (on the merged tree):** typecheck · lint 0 errors (78 warnings, baseline) · **688 tests**
(the five-phrase cap is pinned in `tests/anrede.test.ts`) · build · check:bundle 129.3 kB ·
lint:content · lint:migrations. **Nothing was verified in a browser:** the conversation screen needs
the backend, which the sandbox cannot reach. The founder verifies live.

- **Artifacts:** PR **#841** → **`d4a4771`** · `src/lib/speaking.ts` ·
  `src/features/sprechen/{ConversationRunner,ConversationBriefCard,MicCluster,RedemittelHelp}.tsx` ·
  `supabase/functions/converse/index.ts` · `tests/anrede.test.ts` · `CLAUDE.md` ·
  `docs/areas/SPRECHEN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` · this log

---

## Session 207 — 2026-08-09 — branch `claude/remove-onboarding-practice-z7qfwu`

### Prompt 1 (2026-08-09)

> i want you to remove the onboarding practice session when a new user signs up. The users should
> finish the onboarding form and immediately shown the bibliothek. Keep bibliothek on the top, and
> the praktisch beside the settings. Praktisch should be labeled as beta.

- **Response summary:** Read the onboarding flow, the router and both nav surfaces first.
  `Onboarding.start()` now navigates to `/library` instead of the ~90s composed taster
  (`/session?min=1`); the setup card's footer line follows ("In unter einer Minute in deiner
  Bibliothek"). Reordered the ONE `navItems` list to Bibliothek · Prüfung · Fortschritt · Praktisch ·
  Einstellungen, which is what both the sidebar and the bottom bar draw. In `BottomTabBar` the fixed
  ends became `FIXED_FIRST = "/library"` and `FIXED_LAST_CONTENT = "/"` with `REORDERABLE =
  ["/anwenden", "/analytics"]`; the bar pins its own ends and only reads a saved order for the
  middle, so every pre-s205 pin list still renders five slots without a store migration. Added
  `NavItem.beta` (only Praktisch carries it): a neutral bordered chip in the sidebar, a lighter bold
  suffix inside the bar's label slot, because a bordered chip would grow that fixed 12px line and
  shift the icon rail. Added `NEVER_HIDEABLE` so remote config cannot empty one of the three fixed
  slots on one surface while the other keeps drawing it; `HIDEABLE` in admin Steuerung is Fortschritt
  alone now. Updated `tests/nav.test.tsx` (locked order, stale-pin case, the Beta mark) and
  `docs/areas/PRAKTISCH-NAV.md`. Verified in a real browser at 390px and 1280px.

### Prompt 2 (2026-08-09)

> also, the app's language should adapt to various levels of user language proficiency.. if the user
> logs A2 or B1 level, the app should show everything in English except the learning material which
> should obviously be in german.

- **Response summary:** Built the mechanism rather than a one-off: `src/lib/uiLang.ts` is the ONE
  fold (`uiLangFor(pref, level)`, `useT`, `useTx`, `useTitle`, `translateNow`) and
  `src/lib/uiStrings.ts` holds every English string keyed by the GERMAN source string, so a missing
  key renders exactly what that call site rendered before. Added `useSettingsStore.uiLang`
  ("auto" | "de" | "en", default auto, rides cloudSync in the settings blob) plus the Sprache control
  in Einstellungen → Profil, and `<html lang>` now follows the interface language. Converted the
  shell, onboarding (it reacts to the level chip being LOOKED at, so tapping A2 flips the card before
  anything is saved), Settings, the account surfaces and the Bibliothek tab row first, and reported
  the coverage honestly rather than implying the whole app was done.

### Prompt 3 (2026-08-09)

> in your screenshots except the toggle buttons and menu names, the buttons like üben or stufe b1.1
> and the hint on what the gender means are all still in german. they're also considered as app
> language and not german learning content. so, they should also be in English. check for other such
> overlooked items all across the app and fix them too. Think smart acc to what the goal is and apply
> your expertise and knowledge accordingly

### Prompt 4 (2026-08-09)

> if the user selects b2, then the app can have the current german wordings. For each level A2, B1,
> B2, C1, the app's language should adapt to the user's current level.

- **Response summary (prompts 3 + 4):** Confirmed prompt 4 is exactly the rule already shipped
  (B2/C1 keep today's German) and swept the rest of the app. The leverage came from translating at
  the SINKS: `FilterRail`, `ScopeRail`, `FacetSheet`, `DataTable`, `EmptyState`/`SectionHeading`,
  `ViewSwitcher`, `SearchField`, `BrowseToolbar` and `UebenLabel` take German strings as props from
  dozens of call sites, so one edit each covered them all ("Üben mit 171 Wörtern" → "Practise 171
  words", "Stufe: bis B1.1" → "Level: up to B1.1", the Artikel-Wesen hint, every facet and sector
  label). Taxonomy that already carries both languages in the bank (Themen, sub-themes, domains, life
  areas) goes through `useTitle()` instead of the dictionary, so 66 theme names are not duplicated
  into `uiStrings.ts`. Then the trainers themselves: all four Bibliothek tabs incl. the graphs and
  tables, the Prüfung zone and its exam runner, Schreiben (incl. Fokus), Sprechen, the session
  player, Fortschritt, Sammlung, the game chrome, the auth dialogs and the error/search surfaces.
  A scripted audit proved coverage: every key any component passes to the translator has an English
  entry (0 missing). **Four things stay German by decision, and are stated as such:** the Modelltest
  Anleitung (it reproduces the real telc instruction text), the grammar dial VALUES in Fokus
  (Aktiv/Passiv/Präsens/Perfekt are the forms being practised), the Neuland world's place and mission
  names, and the German grammar abbreviations on a word card. Also fixed a real bug the sweep
  surfaced: the AI disclaimer under both writing trainers was one sentence split across two JSX
  lines, so half of it was translated and the join lost its space; it is one key per trainer now.

- **Artifacts:** **PR #843**, squash-merged as `c334b65` · `src/lib/uiLang.ts` ·
  `src/lib/uiStrings.ts` · `docs/areas/UI-LANGUAGE.md` (new) · `tests/uiLang.test.ts` ·
  `tests/nav.test.tsx` · `docs/areas/PRAKTISCH-NAV.md` · `CLAUDE.md` (nav-order law,
  interface-language law, back under its line budget) · `docs/PROJECT_STATUS.md`

### Prompt 5 (2026-08-09)

> merge to main and document the session when done

- **Response summary:** Ran the full gate set locally, then found `origin/main` had moved under the
  branch while it was open (#840, #841, #842 — sessions 205 and 206 ran in PARALLEL with this one,
  which is why this session is numbered **207**). Merged `main` in and re-ran every gate on the
  MERGED tree: typecheck · **701 tests** · lint 0 errors · build · check:bundle 153.2 kB ·
  check:contrast · lint:content · lint:migrations. Every conflict was in the docs: `CLAUDE.md` took
  main's compressions of the shared laws PLUS this session's two new ones, `PROJECT_STATUS.md`
  interleaved the three session blocks under one header, and the two append-only logs kept both
  sides. Renumbered this session's own markers from s205 to s207 across source comments, tests and
  docs, since main had already used both numbers. Opened **PR #843**, waited for the CI run on the
  merge commit (`18a909f`, all 15 steps green), squash-merged as `c334b65`, then did the post-merge
  housekeeping (`fetch` → `reset --hard origin/main` → `push --force-with-lease`, clean).

### Prompt 6 (2026-08-09)

> document the session

- **Response summary:** Closed the paper trail the merge itself could not carry: the PR number
  (**#843**), the squash SHA (**`c334b65`**) and the CI-green merge commit are now in the
  `PROJECT_STATUS.md` header for session 207, and this entry records the merge round (the parallel
  sessions, the renumbering, the doc conflicts and how each was resolved) plus this prompt.

- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`

### Prompt 7 (2026-08-09)

> [screenshot of the sidebar caption "Deutsch im Beruf · B2"] shouldn't the caption be "german for
> real life"? why is it different here? change any such mistakes

- **Response summary:** It was a leftover from the PRE-repositioning product. The scope note in
  `CLAUDE.md` records that Genauly stopped being "B2 Beruf speaking-exam prep" in s21 and became the
  B1-B2 plateau (work AND everyday life, with exam prep as ONE pillar), and the landing hero,
  `index.html`, the OG tags and the PWA manifest were all updated then. Three surfaces were missed
  and still described the old product:
  1. **The sidebar caption** (the screenshot): now `"Deutsch fürs echte Leben · B1–B2"` /
     `"German for real life · B1–B2"`, which is the canonical tagline in both languages, and it
     follows the interface language like the rest of the shell. The level claim was wrong too: the
     product is B1-B2, not B2.
  2. **The AGB and the Datenschutzerklärung**, both languages, still opened by defining Genauly as
     "eine Prüfungsvorbereitungs-App für die mündliche Prüfung Goethe / telc Deutsch B2 Beruf" / "an
     exam-prep app for the … speaking exam". That is the service description in a legal document, so
     it now says what the app actually is: a German learning app for B1-B2, work and everyday life,
     including preparation for telc Deutsch B2 Beruf and Goethe-Zertifikat B2. The "Nutzung"/"Using"
     paragraph likewise named only workplace German for one exam and now names all eight practice
     surfaces.
  3. **`src/types/index.ts`**, whose file header still called this "the B2 Beruf speaking-prep
     platform".
  Plus one consistency fix: the landing footer said "Deutsch für das echte Leben" while the hero and
  the admin placeholder said "Deutsch fürs echte Leben". One wording now, the hero's.
- **`CONSENT_VERSION` was deliberately NOT bumped.** The rule ties it to
  `PRIVACY_LAST_UPDATED_ISO` for changes to what is collected, why, with whom it is shared or how
  long it is kept. This edit changes none of that, it corrects a description of the product, and
  bumping would ask every signed-in learner to re-consent for a wording fix. Say the word if you
  want it bumped anyway.
- Verified in a browser: the caption reads "Deutsch fürs echte Leben · B1–B2" at B2 and "German for
  real life · B1–B2" at A2. Gates: typecheck · 701 tests · lint 0 errors · build · check:bundle
  153.3 kB · lint:content.

### Prompt 8 (2026-08-09)

> document the session and merge everyhting live

- **Response summary:** Nothing was left unmerged: the session shipped in three PRs, each
  squash-merged to `main` and each followed by a green **Deploy site to GitHub Pages** run on
  attempt 1 — **#843** the change itself (`c334b65`, CI green on the merged tree `18a909f`),
  **#844** the paper trail (`fa3e97d`), **#845** the tagline correction (`c0e7b0f`). Verified each
  deploy by its workflow run rather than by claiming it, since the sandbox cannot reach the live
  site. Closed the documentation with this entry, and the `PROJECT_STATUS.md` session-207 header now
  names all three PRs, their SHAs and their deploys in one line instead of only the first.
- **Artifacts:** PRs **#843** (`c334b65`) · **#844** (`fa3e97d`) · **#845** (`c0e7b0f`) ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Note for the founder:** the app is a PWA, so an installed copy can serve the previous build from
  its service worker. A hard refresh settles it.

## Session 208 (branch `claude/filter-persistence-error-yr2716`)

### Prompt 1 (2026-08-09)

> [screenshot of the Wörter tab, "Level: up to B1.1" chip visible] there seems to be an error with
> the filter here. Even if I remove and refresh it's still appearing. Fix it

- **Response summary:** Found the "Level: up to …" `ActiveFilterChip` (the removable UI over the
  default CEFR-band cut, `defaultVisibleBands`, on Wörter/Kollokationen/Redemittel) tracked its
  dismissal in local `useState(false)` per trainer, so a full page refresh always remounted the
  component and reset the flag, bringing the chip back even right after dismissal. Moved the flag
  into `useSettingsStore` as a new persisted field `showAllCefrLevels` (default `false`), matching
  the existing dismiss-flag pattern (`artikelLegendDismissed`, `signInBannerDismissed`). Updated
  `VocabularyTrainer.tsx`, `CollocationsBrowser.tsx` and `RedemittelTrainer.tsx` to read/write that
  one store field instead of local state. Gates: typecheck · lint 0 errors (78 warnings, pre-existing
  baseline) · build. Opened PR **#847**, squash-merged to `main` as `de70c9b`, post-merge housekeeping
  done. Not verified in a browser here (sandbox network policy blocks the live Supabase project); the
  founder verifies live.
- **Artifacts:** PR **#847** (`de70c9b`) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` (sessions 204-206 archived off the
  main status file to stay under its line budget) · `docs/SESSION_PROMPT_LOG.md`

