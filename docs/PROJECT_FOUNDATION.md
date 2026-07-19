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
    reverted in PRs #120/#121.) Full detail of the logo rules is in `CLAUDE.md` → "Brand logo".

### Phase 2 — Supabase auth + cloud sync + AI writing eval ✅ (live 2026-05-31, founder-verified)
- **Supabase project:** `stkfdavpjflpqoxjunnj`. Publishable key committed in
  `src/lib/supabaseConfig.ts` (safe — all tables owner-only RLS). Service-role and Anthropic keys
  live only in Supabase Edge Function secrets (never in the repo or browser).
- **2A schema:** `profiles`, `progress`, `writing_evaluations`, `ai_usage`, owner-only RLS,
  auto-provision trigger on auth.users, `bump_ai_usage` atomic RPC. `profiles.tier` flag present.
- **2B auth + sync:** `useAuthStore` (guest anon + email magic-link); `cloudSync.ts` (offline-first:
  localStorage stays cache, pull+MERGE on login, debounced write-through). `AccountPanel` in Settings.
  Guest sign-in is the primary path. Email sign-in works but hits Supabase free-SMTP rate limits
  (fix: add Resend SMTP — deferred, see action items).
- **2C writing UI:** `/writing` route; short/long tasks per theme; one insight card + "Üben" deep-link.
- **2D edge function:** `evaluate-writing` deployed via the Supabase dashboard code editor (NOT CLI —
  sandbox network blocks `api.supabase.com`). Daily limit (5/day) + monthly auto-shutoff ($5 cap) +
  input-hash cache + LanguageTool pre-check + one Haiku call fallback chain. Verified end-to-end.
- **Deployment quirk:** the dashboard pre-fills a "Hello [name]!" boilerplate when creating a
  function — select-all-delete before pasting real code.
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
- [x] **Disable "Confirm email"** so sign-up logs in instantly. (2026-06-01, founder-verified)
- [x] Set Site URL in Auth settings.
- [x] Deploy `evaluate-writing` function via dashboard code editor. (2026-05-31)
- [x] Smoke-test end-to-end. (spelling insight returned correctly)
- [x] **Rotate the Anthropic key** (the one pasted in chat) — new key set in Supabase secrets.
- [x] **Run migration 0007** (`provenance_reviews` RLS extended to both admin accounts for the
      /sources Daten-Werkbank). (2026-07-19, founder ran it in the SQL editor, "Success")

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
