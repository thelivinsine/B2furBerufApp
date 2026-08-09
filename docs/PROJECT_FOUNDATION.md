# Project Foundation — the stable technical baseline

_Split out of `docs/PROJECT_STATUS.md` in session 95 (2026-07-12) to keep the living status doc lean.
This file holds the parts that are **built, shipped, and rarely change**: the shipped architecture,
the locked product/architectural decisions, the backend/infra setup, and the completed founder
action items. It is consulted on demand, not on every resume. For current state and the "Resume
here" handoff, see `docs/PROJECT_STATUS.md`; for the "why" behind locked UX rules, `docs/DECISIONS.md`;
for backlog / model guidance / research, `docs/PROJECT_REFERENCE.md`._

## Who I'm working with
- **Founder is non-technical.** Operate as a seasoned CTO: be decisive and opinionated, minimize
  the founder's operational burden, protect them from surprise costs, and aim for an award-worthy,
  genuinely useful product — not just feature parity.

## What is built and live (on `main`)

### Original SPA
- Full client-side SPA: onboarding, dashboard, vocabulary (flashcards/quiz/list), redemittel
  (browse + practice), branching simulations, timed exam mode, analytics, settings.
- Engines: SRS (`engine/srs.ts`; SM-2 originally, swapped to FSRS-6 in s53 / PR #275), XP/levels/tiers
  (`engine/scoring.ts`), Web Speech TTS/STT (`engine/speech.ts`), branching dialogue runner
  (`engine/dialogue.ts`).
- State: zustand stores persisted to localStorage (`b2beruf.progress.v1`, `b2beruf.settings.v1`).

### Phase 1 — content, grammar, leveled quizzes ✅ (live 2026-05-30, founder-verified)
- **Types (1A):** `GrammarTopic`/`GrammarDrill`/`GrammarGroup`, `Collocation`, leveled
  `QuizQuestion` union (`MCQQuestion`/`WordOrderQuestion`/`MatchingQuestion`), `PracticeArea`
  + `WeaknessCategory` — all in `src/types/index.ts`.
- **Engine (1B):** `src/engine/quiz.ts` `buildThemeQuiz(themeId, difficulty, count)` generates
  mixed sets from vocab/collocations/grammar banks; reuses SRS (`reviewVocab`) + scoring.
- **Content (1C):** collocations, grammar topics, redemittel, connectors, and the
  `src/data/practiceAreas.ts` weakness→deep-link registry all shipped. (Current bank counts live
  in `PROJECT_STATUS.md` → "Where things stand", cited as of a date; do not re-type them here.)
- **UI (1D):** `/grammar` and `/quiz` shipped query-param driven, wired into nav/router/Dashboard.
  (Both have since been reworked: `/quiz` is retired-but-live, and Grammatik was rebuilt onto the
  Bibliothek browse skeleton in s93 — see `CLAUDE.md`.)

### Branding ✅ (live)
- App named **Genauly**, tagline **"German for real life"** across all surfaces. Custom domain
  **genauly.de** (CNAME shipped). Tagline updated from "German that clicks" in s22 (PR #145).
- **Default logo (locked 2026-06-08):** the **rounded gradient "G" with transparent corners**,
  canonical file `public/genauly-default-logo-transparent-corners.png`, used in every in-app spot.
  Favicon uses PNG files generated from the real logo. `public/pwa-*.png` + `apple-touch-icon.png`
  are **full-bleed opaque** (no transparent corners) so iOS home-screen icons don't show dark corners.
  - **Do NOT make the in-app logo full-bleed.** A full-bleed square variant exists **only** for
    Google's OAuth consent screen and is not committed. (Full-bleed-everywhere was shipped then
    reverted in PRs #120/#121.) Full detail of the logo rules is in `docs/areas/BRAND.md`.

### Phase 2 — Supabase auth + cloud sync + AI writing eval ✅ (live 2026-05-31, founder-verified)
- **Supabase project:** `stkfdavpjflpqoxjunnj`. Publishable key committed in
  `src/lib/supabaseConfig.ts` (safe — all tables owner-only RLS). Service-role and Anthropic keys
  live only in Supabase Edge Function secrets (never in the repo or browser).
- **2A schema:** `profiles`, `progress`, `writing_evaluations`, `ai_usage`, owner-only RLS,
  auto-provision trigger on auth.users, `bump_ai_usage` atomic RPC. `profiles.tier` flag present.
- **s186 added migration 0016:** `progress.mock_exams` (jsonb, the synced mock-exam runs, bounded
  client-side to the newest 100) and `writing_evaluations.exam_score` (smallint, the 0-100 score
  the evaluator returns in exam mode; null on every practice row and on any run the model could
  not score).
- **s204 added migration 0019: `ai_calls`,** the per-call AI usage ledger. One row per provider
  call holding what the provider ACTUALLY reported (feature, provider, model, input/output/cached
  tokens, cache hit) plus a cost derived from one shared rate table
  (`supabase/functions/_shared/aiUsage.ts`, overridable at runtime from `app_config.ai_rates`).
  Learner-readable for their own rows (select-own RLS), written only by the service role; the
  founder roll-up is `admin_ai_usage_breakdown(days)`, aggregates only. `ai_usage` is unchanged and
  still the monthly spend FUSE; this is the detail behind it, and the thing a future reconciliation
  against the providers' own usage/cost APIs gets compared to. Purged at 400 days
  (`purge_old_ai_calls`, `pg_cron`), matching the client's activity window. No learner text.
- **s205 added migration 0020: `provider_costs` + `provider_sync_state`,** the other side of the AI
  cost figure. `provider_costs` holds one row per provider per UTC day with the amount the PROVIDER
  reports (Anthropic's Cost Report API; its `amount` is cents-as-a-string, converted once at the
  edge). `provider_sync_state` holds the last successful and last attempted pull plus the last
  error, so a stale comparison can never render as a healthy one. Service-role only; read through
  `admin_ai_reconciliation(days)` (ours vs theirs per day, a provider day that has not been reported
  yet returns NULL rather than 0) and `admin_ai_sync_state()`. Fetched by the `reconcile-ai-cost`
  Edge Function, which is **founder-gated against `admins` and has no cron**: scheduling it from the
  database would mean storing a second copy of a credential in the database, so the admin screen
  refreshes it on open (at most hourly) and on demand instead. Needs the `ANTHROPIC_ADMIN_KEY`
  secret (`sk-ant-admin01-…`, full org admin rights, Console → Settings → Admin keys). Purged at
  400 days, matching `ai_calls`.
- **Full schema as of s185 (15 migrations).** Per-learner, owner-only RLS: `profiles`, `progress`,
  `writing_evaluations`, `sentence_checks`, `sentence_ai_ops`. Service-role only (no client
  policies at all): `ai_usage`, `feedback`, `admins`, `gdpr_events`, `sentence_transforms` (the one
  GLOBAL cross-user cache, the main AI cost lever). Founder-gated: `provenance_reviews`,
  `launch_checklist`, and `app_config` (world-readable, founder-writable). The admin gate is
  `is_founder()` against the service-role-only `admins` table (0013; never an email claim), and
  every admin RPC is SECURITY DEFINER returning AGGREGATES only, `feedback` rows being the single
  deliberate exception. **The shape is intentionally "linear":** the ~5,000-id content catalog lives
  in the repo, not the database, so almost nothing relates to anything but `auth.users`
  (`docs/reports/db-architecture-audit-2026-08-04.md` explains why that is the right trade and what
  it would cost to undo).
- **Bounded growth + sync health (s185, DB audit).** `dailyXp`/`activeDays` keep 400 days with the
  lifetime figure folded into `progress.active_days_folded`; three weekly `pg_cron` purges retire
  learner text (2 years), abandoned guests (90 days) and dead cache rows (60 days). Every cloud
  write reads its `{ error }` and surfaces a persistent failure as "Sync pausiert" in Settings.
  **Known and accepted:** between logins the sync is whole-row last-write-wins, and the admin
  analytics RPCs recompute from the JSONB blobs. Both are fixed by the one schema evolution still
  outstanding, splitting `srs` into a per-card `srs_cards` table, which should happen before serious
  growth rather than after it.
- **2B auth + sync:** `useAuthStore` (guest anon + email/password + Google); `cloudSync.ts`
  (offline-first: localStorage stays cache, pull+MERGE on login, debounced write-through).
  `AccountPanel` in Settings. Guest sign-in is the primary path.
  **Profile restore (s174):** a sign-in wipes the device-global cache first for account isolation,
  so the learner's `onboarded` flag, level and goal come back ONLY from `profiles.settings`.
  `mergeRemoteSettings` adopts a cloud profile on `settings.onboarded === true`; it must never gate
  on a display field (it gated on `profile.name`, which onboarding does not collect, so every
  sign-in restarted onboarding). `RequireOnboarding` waits for `syncHydrated` before deciding, then
  routes signed-out visitors to `/welcome` and account holders to `/start`.
  **Email confirmation is ON since s174** (founder enabled it in the dashboard), so a new
  email/password account is not signed in until the link is clicked. The link lands on
  **`/auth/confirm`** (`src/features/auth/ConfirmEmail.tsx`), which finishes the sign-in; the
  parameters it needs are snapshotted by `src/lib/authCallback.ts` at module-eval time, because
  Supabase's default template returns them in the URL hash and React Router wipes that on mount.
  `signUp` pins `emailRedirectTo` to the running origin, so the landing page never depends on the
  dashboard's Site URL. Mail still goes out through Supabase's built-in sender (rate-limited, a few
  per hour); Resend SMTP is the fix and is a pending founder action, with the steps and the branded
  templates in `docs/reference/auth-emails/`.
- **2C writing UI:** `/writing` route; short/long tasks per theme; one insight card + "Üben" deep-link.
- **2D edge function:** `evaluate-writing`. Monthly auto-shutoff ($5 cap) + input-hash cache +
  LanguageTool pre-check + a provider fallback chain. Per-MODE daily limits since s167
  (Kurz 4 / Lang 2, counted separately; Fokus is 10 in `check-sentence`) — the old shared 5/day is
  retired. Since s167 it also receives the Aufgabe and its Inhaltspunkte and grades content first
  (see `docs/areas/SCHREIBEN.md`).
- **Deployment:** since s167, `.github/workflows/supabase.yml` deploys every Edge Function on merge
  to `main`, so neither the CLI nor the dashboard editor is needed. If you ever do paste into the
  dashboard editor by hand, note it pre-fills a "Hello [name]!" boilerplate: select-all-delete
  first. **Migrations self-apply since s179** (`SUPABASE_DB_PASSWORD` is set), running BEFORE the
  function deploys in the same workflow, so nothing is pasted into the SQL editor any more and a
  broken migration blocks the whole backend deploy. That is what `pnpm lint:migrations` guards
  (s185): `db push --include-all` re-applies any file the remote history does not record, so every
  migration must survive running twice.
- **Anthropic key:** rotated by the founder; the live secret lives only in Supabase Edge Functions →
  Secrets → `ANTHROPIC_API_KEY`.
- Bundle carries supabase-js; the writing path is code-split.

## Locked architectural decisions
1. **Sequencing:** phase it, **content first**. Phase 1 = content + grammar + leveled quizzes
   (100% client-side, ships alone). Phase 2 = Supabase auth + cloud sync + AI writing eval.
2. **Business model:** free, guest-first, **monetize later**. A `tier` flag + usage counters +
   feature flags exist now so a paid tier drops in with no rewrite. No B2B/multi-tenant yet.
3. **AI cost posture:** shoestring. Claude **Haiku only** in production; Gemini Flash / gpt-4o-mini
   are fallbacks **only on hard failure**. Aggressive caching by input hash. ~3–5 reviews/user/day.
   Monthly spend cap with **auto-shutoff**. Target: low single-digit $/month at hundreds of users.
4. **Writing engine:** hybrid — hosted **LanguageTool** categorizes errors (often no LLM call
   needed); one LLM call only to prioritise/phrase the single biggest weakness.
5. **Auth/data:** **full cloud sync** — anonymous guest + email/OAuth; progress in Supabase Postgres;
   guest→account upgrade preserves data.
6. **Vocabulary architecture:** **NO RAG / no vector DB.** Curated static dataset, expanded only
   from open-licensed sources (Tatoeba CC-BY, Wiktionary/Wikidata CC-BY-SA, DWDS/Leipzig freq).
   Goethe Wortlisten, Routledge, and Klett textbooks are copyrighted → excluded.
7. **Infra ownership:** founder provides the Supabase project + Anthropic key (optional fallback
   keys) + hosted LanguageTool key + a monthly spend ceiling. Keys live in Supabase Edge Function
   secrets, never in the browser.

## Completed founder action items (historical record)
All of the following are DONE (the open/optional ones live in `PROJECT_STATUS.md`):
- [x] Create a Supabase project; share URL + publishable key. (`stkfdavpjflpqoxjunnj`, committed)
- [x] Provide Anthropic (Claude) API key. (set in Supabase secrets as `ANTHROPIC_API_KEY`)
- [x] Decide the monthly AI spend ceiling. (**$5/month**, enforced in the function)
- [x] Apply schema via SQL editor. (2026-05-31)
- [x] Enable Anonymous sign-in. (email also enabled — **must stay ON**: guest flow, AI writing coach,
      and guest→account upgrade all depend on it.)
- [x] ~~**Disable "Confirm email"** so sign-up logs in instantly. (2026-06-01)~~ **REVERSED
      2026-07-27 (s174):** the founder turned confirmation back ON, so nobody can register an
      address they do not own (security audit F1). Sign-up is now a two-step flow; see the 2B entry
      above for the `/auth/confirm` handling this required.
- [x] Set Site URL in Auth settings.
- [x] Deploy `evaluate-writing` function via dashboard code editor. (2026-05-31)
- [x] Smoke-test end-to-end. (spelling insight returned correctly)
- [x] **Rotate the Anthropic key** (the one pasted in chat) — new key set in Supabase secrets.
- [x] **Run migration 0007** (`provenance_reviews` RLS extended to both admin accounts for the
      /sources Daten-Werkbank). (2026-07-19, founder ran it in the SQL editor, "Success")
- [x] **Turnstile bot protection LIVE end-to-end** (2026-07-24, founder-verified via live guest/email
      sign-in). Needs BOTH sides: CAPTCHA enabled in Supabase Auth (Turnstile secret key) AND the
      `VITE_TURNSTILE_SITE_KEY` GitHub Actions secret (site key, baked in at build by `pages.yml`).
      Only one side = sign-in fails. The client widget + auth integration + feedback burst/hourly
      email caps predate this; the admin System/Launch reporting was wired to the real flag in PR #669.

## Deploy / infra guardrails (authoritative copy in `CLAUDE.md`)
The full deploy + post-merge housekeeping rules live in `CLAUDE.md` (→ "Deployment (GitHub Pages)"
and "Post-deploy GitHub housekeeping"). The load-bearing facts:
- **`main` is production.** Merging to it triggers `.github/workflows/pages.yml` (the only deploy
  path; `validate.yml` is the lint/test gate and never deploys). Feature-branch pushes do NOT go live.
- Develop on the automation branch assigned for the session (reassigned each session; **`main` is
  always the source of truth**); ship via squash-merge PR after `pnpm build` is green.
- After every squash-merge, realign the dev branch (`git fetch origin main` → `git reset --hard
  origin/main` → `git push --force-with-lease`) so it doesn't diverge and conflict on the next PR.
- The sandbox can't reach the live `*.github.io` site, the Actions tab, or run Docker — live
  verification (Pages deploy, Supabase) is handed to the founder.
- **`main` is protected by a GitHub branch ruleset (founder-created 2026-07-24, s162):** targets
  the default branch; restrict deletions + block force pushes; NO required PR approvals and no
  required status checks, so the approved auto-ship squash-merge flow is unaffected. Session
  branches are not targeted; force-with-lease pushes to them stay routine. Don't add required
  approvals without a founder decision (it would block self-merged PRs).
