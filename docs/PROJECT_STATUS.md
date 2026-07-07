# Project Status & Decision Log

_Last updated: 2026-07-07 (session 78: **data strategy Phase B + Phase C SHIPPED**. Phase B — Layer 3
linguistic engine: `pnpm verify:grammar` runs **LanguageTool 6.8** over all 2,315 German sentences (0
grammar errors, 98.8% clean, one real typo fixed); `pnpm verify:cefr` is a precision-first CEFR tripwire
(6 FLAG). Both warn-only scheduled reports, never a gate; LanguageTool (~69 MB) resolves pinned from Maven
Central. Phase C — the trust model: a `Verification` block on `ProvenanceEntry`, `pnpm build:verification`
composes Layer 2/3 results into the generated `src/data/verification.ts` (per-item tier + confidence),
surfaced as a badge on `/sources`; first sweep = 1,292 of 1,408 items machine-attested (25 human · 1,266
linguistic · 1 facts · 116 provenance). `DATA_STRATEGY.md` → v1.4. Prior, session 77: Phase A COMPLETED —
Layer 2 two-oracle fact gate (coverage 47% → 97%, 0 confirmed errors; v1.2). Prior, session 75:
**four daily-life content packs shipped** — Arzt &
Gesundheit (PR #349), Wohnen & Bank (PR #350), and Bildung & Sprache. Each is a full theme: ~28
vocab, ~36 collocations, 3 Can-Do, 2 reading texts, 1 dialogue, all provenance-rowed and
gate-green. Themes are now 15 (was 11), and **all six top-level domains are populated** (Bildung
filled the last empty one). **G2 remains HALTED on founder order ("Wait for my go")**: the G2 groundwork
draft (missions 1.1/1.2 + settings) sits PARKED UNMERGED on the old session branch
`claude/neuland-g1-g2-feedback-wkf28n` (commit `wip(G2, PARKED, DO NOT MERGE)`). The working
branch is reassigned every session, so **`main` is always the source of truth**. Product name:
**Genauly** (domain `genauly.de`)._

This file is the **lean, living** status doc: current state plus the two most recent session handoffs.
Start at the `## Resume here (next session)` section near the end. Companion files:
- **`docs/PROJECT_REFERENCE.md`** — stable reference that rarely changes: the founder backlog,
  the product-evaluation findings, per-session model guidance, and reusable research findings.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only history, chunked by ISO week
  under `docs/archive/status-log/` (sessions 1–72 + an `ops-notes` file).
- **`docs/DECISIONS.md`** — the "why" behind locked decisions. Full design: `docs/archive/EXPANSION_PLAN.md`.

**Doc-hygiene rule (keep this file lean):** when you append a new handoff to `## Resume here`, move any
handoff older than the two most recent into the current ISO-week chunk under `docs/archive/status-log/`
(see the index at `docs/archive/PROJECT_STATUS_ARCHIVE.md`). Keep this file under ~250 lines. This split
was done in session 70 (the file had grown to 1,624 lines / 140 kB).

## Who I'm working with
- **Founder is non-technical.** Operate as a seasoned CTO: be decisive and opinionated, minimize
  the founder's operational burden, protect them from surprise costs, and aim for an award-worthy,
  genuinely useful product — not just feature parity.

## Where things stand

### Original SPA — live (on `main`)
- Full client-side SPA: onboarding, dashboard, vocabulary (flashcards/quiz/list), redemittel
  (browse + practice), branching simulations, timed exam mode, analytics, settings.
- Engines: SRS (`engine/srs.ts`; SM-2 originally, swapped to FSRS-6 in s53 / PR #275), XP/levels/tiers
  (`engine/scoring.ts`), Web Speech TTS/STT (`engine/speech.ts`), branching dialogue runner
  (`engine/dialogue.ts`).
- State: zustand stores persisted to localStorage (`b2beruf.progress.v1`, `b2beruf.settings.v1`).

### Phase 1 — SHIPPED & LIVE ✅ (on `main` via `pages.yml`, founder-verified 2026-05-30)
- **Types (1A):** `GrammarTopic`/`GrammarDrill`/`GrammarGroup`, `Collocation`, leveled
  `QuizQuestion` union (`MCQQuestion`/`WordOrderQuestion`/`MatchingQuestion`), `PracticeArea`
  + `WeaknessCategory` — all in `src/types/index.ts`.
- **Engine (1B):** `src/engine/quiz.ts` `buildThemeQuiz(themeId, difficulty, count)` generates
  mixed sets from vocab/collocations/grammar banks; reuses SRS (`reviewVocab`) + scoring.
  Added `XP.quizEasy/quizMedium/quizHard/grammarDrill`.
- **Content (1C):** `src/data/collocations.ts` (**396** Nomen-Verb pairs, ~36/theme);
  `src/data/grammar.ts` rewritten to **11 `GrammarTopic`s** w/ drills (Konnektoren, Relativsätze,
  da-/wo-Wörter, Verbstellung/TeKaMoLo, Nebensätze, Kasus, Nomen-Verb, K-II, Modal, Passiv);
  `redemittel.ts` grown to **72**; **10 connectors** added to vocab (**304** words);
  `src/data/practiceAreas.ts` weakness→deep-link registry.
- **UI (1D):** `/grammar` (`features/grammar/GrammarHub` + `GrammarDrillCard`) and `/quiz`
  (`features/quiz/QuizHub` + `QuizRunner`), both query-param driven (`?topic=`, `?theme=&level=`).
  Wired into Sidebar, router (guarded), and Dashboard daily-module tiles.
- **Verified live:** Grammar topics + drills and the leveled theme quizzes work on the deployed
  Pages site; `npm run build` green; no duplicate ids.

### Branding — DONE (live)
- App named **Genauly**, tagline **"German for real life"** (header, sidebar, onboarding,
  `<title>`/meta, `package.json` description, PWA manifest). Custom domain **genauly.de** (CNAME shipped).
  Tagline was updated from the old "German that clicks" across all six surfaces in session 22 (PR #145).
- **Default logo (locked 2026-06-08):** the **rounded gradient "G" with transparent corners**.
  The canonical file is **`public/genauly-default-logo-transparent-corners.png`** and it is the
  default logo in every in-app spot (sign-in dialog, mobile header, desktop sidebar, landing,
  onboarding, `/privacy`). Favicon uses PNG files (`public/favicon-32.png`, `public/favicon-16.png`)
  generated from the real logo (replacing the old `favicon.svg` which rendered a plain system-font "G").
  `public/pwa-*.png` and `apple-touch-icon.png` are **full-bleed opaque** (no transparent corners)
  so iOS home-screen icons don't show dark corners on the OS rounding mask.
  - **Do NOT make the in-app logo full-bleed.** A full-bleed square variant exists **only** for
    Google's OAuth consent screen (its circular crop shows white through transparent corners). It
    is not committed to the repo and must not replace the app logo. (Full-bleed-everywhere was
    shipped then reverted in PRs #120/#121 — keep the app on the rounded transparent logo.)

### Phase 2 — SHIPPED & LIVE ✅ (squash-merged to `main` 2026-05-31, founder-verified)
- Supabase auth + cloud sync + AI writing eval fully deployed and smoke-tested by founder.
- **Supabase project:** `stkfdavpjflpqoxjunnj`. Publishable key committed in
  `src/lib/supabaseConfig.ts` (safe — all tables owner-only RLS). Service-role key and Anthropic
  key live only in Supabase Edge Function secrets (never in the repo or browser).
- **2A schema:** applied via Supabase dashboard SQL editor — `profiles`, `progress`,
  `writing_evaluations`, `ai_usage`, owner-only RLS, auto-provision trigger on auth.users,
  `bump_ai_usage` atomic RPC. `profiles.tier` flag present (monetization-ready).
- **2B auth + sync:** `useAuthStore` (guest anon sign-in + email magic-link); `cloudSync.ts`
  (offline-first: localStorage stays cache, pull+MERGE on login, debounced write-through).
  `AccountPanel` shown in Settings. **Guest sign-in works and is the primary path.**
  Email sign-in works when clicked through but has rate-limit issues on Supabase's free SMTP
  (fix: add Resend SMTP in Auth settings — deferred).
- **2C writing UI:** `/writing` route live; short/long tasks per theme; one insight card + "Üben"
  deep-link via `practiceAreas` registry. Added to Sidebar + Dashboard daily modules.
- **2D edge function:** `evaluate-writing` deployed via Supabase dashboard code editor (NOT CLI —
  sandbox network blocks `api.supabase.com`). Daily limit (5/day) + monthly auto-shutoff ($5 cap)
  + input-hash cache + LanguageTool pre-check (templated spelling path = no LLM cost) + one Haiku
  call fallback chain. **Verified working end-to-end** — founder test returned correct spelling
  insight with "Rechtschreibung üben" deep-link.
- **Known deployment quirk:** the Supabase dashboard pre-fills a "Hello [name]!" boilerplate when
  creating a function. Must select-all-delete before pasting the real code. Caught and fixed.
- **Anthropic key:** ✅ rotated by the founder (the original, once pasted in chat, is dead). The
  live secret lives only in Supabase Edge Functions → Secrets → `ANTHROPIC_API_KEY`.
- Bundle is now ~1.41 MB (supabase-js); code-splitting still deferred.

## Decisions locked
1. **Sequencing:** phase it, **content first**. Phase 1 = content + grammar + leveled quizzes
   (100% client-side, ships alone). Phase 2 = Supabase auth + cloud sync + AI writing eval.
2. **Business model:** free, guest-first, **monetize later**. Build a `tier` flag + usage counters
   + feature flags now so a paid tier drops in with no rewrite. No B2B/multi-tenant yet.
3. **AI cost posture:** shoestring. Claude **Haiku only** in production; Gemini Flash / gpt-4o-mini
   are fallbacks **only on hard failure**. Aggressive caching by input hash. ~3–5 reviews/user/day.
   Monthly spend cap with **auto-shutoff**. Target: low single-digit $/month at hundreds of users.
4. **Writing engine:** hybrid — hosted **LanguageTool** categorizes errors (often no LLM call
   needed); one LLM call only to prioritise/phrase the single biggest weakness.
5. **Auth/data:** **full cloud sync** — anonymous guest + email/OAuth; progress moves to Supabase
   Postgres; guest→account upgrade preserves data.
6. **Vocabulary architecture:** **NO RAG / no vector DB.** Curated static dataset, expanded only
   from open-licensed sources (Tatoeba CC-BY, Wiktionary/Wikidata CC-BY-SA, DWDS/Leipzig freq).
   Goethe Wortlisten, Routledge, and Klett textbooks are copyrighted → excluded.
7. **Infra ownership:** founder provides the Supabase project + Anthropic key (optional Gemini/
   OpenAI fallback keys) + hosted LanguageTool key + a monthly spend ceiling. Keys live in Supabase
   Edge Function secrets, never in the browser.


## Founder action items
- [x] Create a Supabase project; share URL + publishable key. (`stkfdavpjflpqoxjunnj`, committed)
- [x] Provide Anthropic (Claude) API key. (set in Supabase secrets as `ANTHROPIC_API_KEY`)
- [x] Decide the monthly AI spend ceiling. (**$5/month**, enforced in the function)
- [x] Apply schema via SQL editor. (done 2026-05-31)
- [x] Enable Anonymous sign-in. (done; email also enabled — **must stay ON**: guest flow, AI
      writing coach `lib/writing.ts`, and guest→account upgrade all depend on it.)
- [x] **Disable "Confirm email"** so sign-up logs in instantly. (done 2026-06-01 — banner now clears
      on sign-up, founder-verified.)
- [x] Set Site URL in Auth settings. (done)
- [x] Deploy `evaluate-writing` function via dashboard code editor. (done 2026-05-31)
- [x] Smoke-test end-to-end. (✅ working — spelling insight returned correctly)
- [x] **Rotate the Anthropic key** (the one pasted in chat) — done; new key set in Supabase Edge
      Functions → Secrets → `ANTHROPIC_API_KEY`.
- [ ] (Optional) Add Resend SMTP to fix email magic-link rate-limit. Auth → SMTP settings.
- [ ] (Optional) Enable Turnstile CAPTCHA on guest sign-in to deter bot abuse before public launch.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      The cached dialog still shows the old failure (that is the previous attempt's result, not a new
      evaluation). Google's async re-review takes hours to days; the founder should wait for an email
      from Google's Trust and Safety team. **Do NOT re-click "I have fixed the issues" again while
      waiting.** If the email says issues remain, escalate via the Google Developer forums or reply
      to the Trust and Safety email with the raw-HTML evidence (the static text is visible in
      `view-source:https://genauly.de`).

## Deploy / workflow reminders
- `main` is production; merging to it triggers `pages.yml` (the **only** workflow now — the old
  `deploy.yml`/`gh-pages` fallback is gone). Develop on the automation branch assigned for the session
  (reassigned each session; `main` is always the source of truth); ship via
  squash-merge PR. **Always verify `pnpm build` is green on the exact commit before merging**
  (a skipped check shipped two broken builds in session 2).
- **Feature-branch pushes are NOT live.** Only `main` deploys. In session 3 the founder reported
  "I don't see any change" because the dark-mode commits were pushed to the branch but never merged.
  **Auto-ship preference (founder approved 2026-06-01): when a change is done and the build is green,
  open + squash-merge the PR yourself without asking** — see CLAUDE.md.
- **REQUIRED post-deploy housekeeping (after every squash-merge):** realign the dev branch so it
  doesn't drift and conflict on the next PR — `git fetch origin main` → `git reset --hard origin/main`
  → `git push --force-with-lease origin claude/vibrant-meitner-mfl9xk`. (Forgetting this caused the
  PR #23 merge conflict.) Full checklist in CLAUDE.md → "Post-deploy GitHub housekeeping".
- Sandbox can't reach the live site or run Docker (so no local Supabase / no live verification
  here) — those steps are handed to the founder, same as the Pages deploy.


## Resume here (next session)

**Handoff after session 79 (2026-07-07). Data-strategy Q&A + backlog capture (no code).** The founder
asked how the data strategy handles three things and said "we'll come back to these tasks later." Answered
in chat and parked as backlog items (`docs/PROJECT_REFERENCE.md` #33–#35):
- **#33 — human-in-the-loop tracking + exception-queue tooling.** The reviewer loop from `DATA_STRATEGY.md`
  §3 Layers 4–5: generate the committed `docs/reports/verification-queue.md` from the machine sweeps and
  wire it to the founder-only `provenance_reviews` table (migration 0004) + `/sources` admin overlay so a
  reviewer clears the queue and flips `review_status → verified`. Builds on Phase A/B flags now; fully
  populated once Phase D (jury) lands.
- **#34 — auditor handoff package.** A repeatable one-pager/export that packages the reproducible per-item
  chain (source + license snapshot + fact/grammar/jury verdicts w/ tool+version+date + human sign-off) for
  an EU AI Act Art. 10 / ISO 42001 examiner; composes the existing `/sources` page, register CSV export,
  and `verify-*` reports. Doc-only, cheap.
- **#35 — scale-to-100x database plan.** Two planes: content stays CDN-cheap (files → Supabase content
  table only if the *library* grows 100x); the user plane is standard Postgres scaling (Supavisor pooling →
  indexed/index-friendly RLS → partition/archive `ai_usage`+writing → replicas) plus the real lever,
  **server-side metering/capping of AI-writing-coach token spend**, and clearing the `progress` fixed-column
  upsert debt (#32). Deliverable is a phased migration checklist.

Nothing shipped this session; the next rung on the built roadmap is still **Phase D (the AI jury, Layer 4)
+ golden set** (see the session-78 handoff below).

---

**Handoff after session 78 (2026-07-07). DATA STRATEGY Phase B + Phase C SHIPPED ✅** (Layer 3 linguistic
engine, then the per-item trust model). Two PRs. **Phase C (the trust model, PR to come):**
- **`Verification` block on `ProvenanceEntry`** (`src/types/index.ts`): `tier` (unverified → structural →
  provenance → facts → linguistic → jury → human), `checks[]`, `confidence`, `last_verified`, plus the
  `VerificationTier`/`Layer`/`Result` enums. Optional/additive.
- **`pnpm build:verification`** (`scripts/build-verification.mjs`) composes the Layer 2 fact verdicts +
  Layer 3 grammar (via a new `docs/reports/verify-grammar.json` sidecar) + CEFR results into the
  **generated** `src/data/verification.ts`, keyed by content_id. Every record shares one sweep-date const
  `D`, so a re-run only diffs items whose tier moved. To avoid re-running LanguageTool, it reads the
  grammar sidecar and recomputes facts/CEFR from the vendored subsets (the `verify-facts`/`verify-cefr`
  compute helpers are now exported + their `main()` guarded).
- **`/sources` surfaces it** (`src/features/legal/Sources.tsx`): a per-item **tier badge + confidence**
  and a tier-distribution summary section; an inline `verification` on a row wins over the generated map.
- **`lint:content`** validates the tier/layer/result enums (closed-enum rule) and prints the tier
  distribution (records, does not gate).
- **First sweep over 1,408 items: 25 human · 1,266 linguistic · 1 facts · 116 provenance** (1,292
  machine-attested for facts or language, up from 25 human-verified). `DATA_STRATEGY.md` → **v1.4**.
- **Only the one Phase-B typo touched content**; `verification.ts` is generated (404 KB, lazy `/sources`
  chunk; main chunk stays 79.5 kB). Gates green: `lint:content` (+ tier summary), `verify:facts`, `build`,
  `lint`, `test:unit/srs/pronounce`, `check:bundle`.
- **Next rung:** Phase D (the AI jury, Layer 4) + golden set — the first paid rung (LLM tokens + ~150
  human-labeled calibration items). It adds the `jury` tier on top of what Phase C now records.

---

**Phase B (Layer 3, the offline linguistic engine ✅, warn-only reports, not gates).** What happened:
- **Grammar/spelling over every sentence.** `pnpm verify:grammar` (`scripts/verify-grammar.mjs` + a
  Java runner `scripts/lt/LtCheck.java`) runs **LanguageTool 6.8 `language-de`** over **2,315 German
  sentences** — vocab examples, collocation examples, dialogue lines + option texts + model answers +
  prompts, reading-text bodies + comprehension questions, and redemittel phrases + examples. Findings
  bucket by LanguageTool's own issue type → `docs/reports/verify-grammar-report.md`. **Result: 0
  grammar/agreement errors, 98.8% of sentences clean.** It caught **one real typo** (headword
  `v_kulanzloesung` was "Kulanslösung", corrected to "Kulanzlösung" in all 3 places); the rest are
  domain proper nouns (fictitious names in texts) and idiomatic hits. Warn-only by design (LanguageTool
  over-flags idiomatic B2), so NOT a merge gate.
- **LanguageTool is fetched, not vendored.** It is ~69 MB across 88 jars, so `pnpm build:languagetool`
  (`scripts/build-languagetool.mjs`) resolves it **pinned (6.8) from Maven Central** — reachable through
  the network policy, unlike the LT download host / kaikki / de.wiktionary (all 403). It runs fully
  offline after resolve. `scripts/vendor/lt-lib/` is gitignored.
- **CEFR plausibility tripwire.** `pnpm verify:cefr` (`scripts/verify-cefr.mjs`) compares each item's
  claimed `cefr` to a measured difficulty from **word frequency** (`wordfreq` German Zipf, vendored
  `scripts/vendor/german-frequency-subset.json` built by `pnpm build:frequency-subset`) + **sentence
  complexity**. **Honest calibration:** German unigram frequency is a weak grader (compounds are
  elementary yet rare), so it flags only the reliable direction — a **common word carrying an advanced
  label** — and only for vocabulary. **Result: 6 FLAG + 72 WATCH of 1,182 items** (the 6 FLAGs are
  sustainability-theme words like *die Umwelt* / *vermeiden* tagged B2.2 despite B1 frequency, worth a
  glance); everything else is caveated info. Report: `docs/reports/verify-cefr-report.md`.
- **Scheduled, not gated.** `.github/workflows/verify-sentences.yml` (monthly + dispatch) regenerates
  both reports and uploads them as artifacts (no auto-commit → no deploy churn). `validate.yml` is
  untouched; no new per-PR gate.
- **Only content change:** the one typo fix (`vocabulary.ts`), so counts below are unchanged; oracle
  subsets regenerated (1 line) to keep the corrected word covered. All gates green: `pnpm lint:content`,
  `pnpm verify:facts` (0 gate errors), `pnpm build`, `pnpm lint`, `pnpm test:unit/srs/pronounce`,
  `pnpm check:bundle`. `DATA_STRATEGY.md` → **v1.3**.
- **Next rung:** Phase D (the AI jury, Layer 4) + golden set, and Phase C (the `verification` trust
  block on `ProvenanceEntry`, surfaced on `/sources`) if not folded into D.
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`.

---

_Older handoffs (sessions 1–77) are archived by ISO week under `docs/archive/status-log/`
(index: `docs/archive/PROJECT_STATUS_ARCHIVE.md`; sessions 69–77 are in the W28 file)._

**Content counts (verified from `src/data/*` on 2026-07-07):**
- Vocabulary: **642 words** (+28 each for Arzt, Wohnen, Bank, Bildung in s75)
- Collocations: **540 Nomen-Verb pairs** (~36/theme; +36 each for Arzt/Wohnen/Bank/Bildung in s75)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **16** (+Arztbesuch, +Wohnungsbesichtigung, +Kontoeröffnung, +Sprachkursberatung in s75)
- Exam sets: **10** (1 per workplace theme · 6–7 min · sharedRubric)
- Redemittel: **72** entries
- Can-Do milestones: **37** (all 15 themes; workplace/behoerde founder-verified, daily-life packs draft)
- Lese-/Hörtexte: **18** texts / **54** comprehension checks (+2 each for Arzt/Wohnen/Bank/Bildung in s75)
- Themes: **15** (10 workplace + `behoerde` + `arzt` + `wohnen` + `bank` + `bildung`; all six domains now populated)
- Game missions (Neuland): **1** (the chapter-1 Anmeldung boss, 9 scenes) · 6 NPCs · 4 key items
- Provenance rows: **1,408** (all with a `reference`; 1,383 `draft` / 25 `verified`)
- Verification tiers (Layer C, generated `src/data/verification.ts`): **25 human · 1,266 linguistic · 1 facts · 116 provenance** (1,292 machine-attested)

**Dev branch:** reassigned each session; realign to `origin/main` after each squash-merge (`main` is
always the source of truth).

