# Project Status & Decision Log

_Last updated: 2026-05-31. Branch: `claude/determined-euler-xUDrh`. Product name: **Sprechfit**._

This file is the single place to re-orient when resuming work. For the full design, see
`docs/EXPANSION_PLAN.md`. For the original build plan, see `docs/IMPLEMENTATION_PLAN.md`.

## Who I'm working with
- **Founder is non-technical.** Operate as a seasoned CTO: be decisive and opinionated, minimize
  the founder's operational burden, protect them from surprise costs, and aim for an award-worthy,
  genuinely useful product — not just feature parity.

## Where things stand

### Original SPA — live (on `main`)
- Full client-side SPA: onboarding, dashboard, vocabulary (flashcards/quiz/list), redemittel
  (browse + practice), branching simulations, timed exam mode, analytics, settings.
- Engines: SM-2 SRS (`engine/srs.ts`), XP/levels/tiers (`engine/scoring.ts`), Web Speech TTS/STT
  (`engine/speech.ts`), branching dialogue runner (`engine/dialogue.ts`).
- State: zustand stores persisted to localStorage (`b2beruf.progress.v1`, `b2beruf.settings.v1`).

### Phase 1 — SHIPPED & LIVE ✅ (on `main` via `pages.yml`, founder-verified 2026-05-30)
- **Types (1A):** `GrammarTopic`/`GrammarDrill`/`GrammarGroup`, `Collocation`, leveled
  `QuizQuestion` union (`MCQQuestion`/`WordOrderQuestion`/`MatchingQuestion`), `PracticeArea`
  + `WeaknessCategory` — all in `src/types/index.ts`.
- **Engine (1B):** `src/engine/quiz.ts` `buildThemeQuiz(themeId, difficulty, count)` generates
  mixed sets from vocab/collocations/grammar banks; reuses SRS (`reviewVocab`) + scoring.
  Added `XP.quizEasy/quizMedium/quizHard/grammarDrill`.
- **Content (1C):** `src/data/collocations.ts` (**68** Nomen-Verb pairs, ~6–8/theme);
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
- App renamed to **Sprechfit**, tagline **"Deutsch im Beruf · B2 Prüfung"** (sidebar, onboarding,
  `<title>`/meta, `package.json` name `sprechfit`).
- **Logo: reverted to placeholder** (Sparkles icon + original gradient speech-bubble favicon).
  A custom mark was tried and rolled back; founder will choose a logo later.

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
- **Anthropic key:** ⚠️ the original key was pasted in chat — founder should rotate it at
  console.anthropic.com and update the secret in Supabase Edge Functions → Secrets.
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

## Research findings to reuse (don't re-research)
- **Open/usable content sources:** Tatoeba (CC-BY, example sentences, bulk download), Wiktionary/
  Wikidata (CC-BY-SA, genders/inflections), DWDS + Leipzig Wortschatz (frequency, APIs).
- **Off-limits (copyright):** Goethe Wortlisten, Routledge Frequency Dictionary, all Klett books
  (Netzwerk, Aspekte, Sicher!, Linie 1 Beruf).
- **Writing eval:** LanguageTool (LGPL, hosted API w/ free tier) for error categories; RAG is
  overkill for a single-insight output. Supabase supports anonymous sign-in, pgvector (unused),
  Edge Functions for secret-safe LLM calls from a static GitHub Pages SPA.

## Founder action items
- [x] Create a Supabase project; share URL + publishable key. (`stkfdavpjflpqoxjunnj`, committed)
- [x] Provide Anthropic (Claude) API key. (set in Supabase secrets as `ANTHROPIC_API_KEY`)
- [x] Decide the monthly AI spend ceiling. (**$5/month**, enforced in the function)
- [x] Apply schema via SQL editor. (done 2026-05-31)
- [x] Enable Anonymous sign-in. (done; email also enabled)
- [x] Set Site URL in Auth settings. (done)
- [x] Deploy `evaluate-writing` function via dashboard code editor. (done 2026-05-31)
- [x] Smoke-test end-to-end. (✅ working — spelling insight returned correctly)
- [ ] **Rotate the Anthropic key** (was pasted in chat) — generate new key at console.anthropic.com,
      update in Supabase Edge Functions → Secrets → `ANTHROPIC_API_KEY`.
- [ ] (Optional) Add Resend SMTP to fix email magic-link rate-limit. Auth → SMTP settings.
- [ ] (Optional) Enable Turnstile CAPTCHA on guest sign-in to deter bot abuse before public launch.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.

## Deploy / workflow reminders
- `main` is production; merging to it triggers `pages.yml`. Develop on
  `claude/determined-euler-xUDrh`; ship via squash-merge PR. **Always verify `npm run build` is
  green on the exact commit before merging** (a skipped check shipped two broken builds this session).
- Sandbox can't reach the live site or run Docker (so no local Supabase / no live verification
  here) — those steps are handed to the founder, same as the Pages deploy.

## Deploy / ops notes (accumulated)
- `main` is production; merging triggers `pages.yml`. Develop on `claude/determined-euler-xUDrh`;
  ship via squash-merge PR. **Always verify `npm run build` green before merging.**
- Sandbox cannot reach `api.supabase.com` or `db.*.supabase.co:5432` — CLI migrations and function
  deploys must be done by the founder (dashboard SQL editor + dashboard function code editor work
  fine as alternatives).
- Edge Function deployment via dashboard: create function → dashboard pre-fills boilerplate →
  **select-all-delete first**, then paste code → Deploy.
- Email magic-links on Supabase free plan are rate-limited (~2/hour). Fix: add Resend (free tier)
  as custom SMTP in Auth → SMTP settings. Guest sign-in has no such limit and is the primary path.

## Resume here (next session)
**Both Phase 1 and Phase 2 are SHIPPED and LIVE on `main`.** The full platform is working:
vocabulary/grammar/quiz/simulation/exam (Phase 1) + guest auth + cloud sync + AI writing coach
(Phase 2). All founder-verified.

**Pending housekeeping (low urgency):**
- Rotate the Anthropic key (was pasted in chat) — 2 min at console.anthropic.com.
- Add Resend SMTP to fix email magic-link rate-limit.
- Enable Turnstile CAPTCHA before public launch.

**Candidate next features (pick one):**
- (a) **Writing history view** — surface past evaluations from `writing_evaluations` table; show
  streak of weaknesses so learner sees their improvement over time.
- (b) **Collocations browser tab** — dedicated browse/filter UI for the 68 Nomen-Verb pairs,
  accessible from Vocabulary or Grammar.
- (c) **Code-split the bundle** — dynamic imports for heavy routes (exam, simulation) to cut the
  ~1.41 MB initial load.
- (d) **More content** — expand collocations (~6→10/theme), add more grammar drills, grow vocab
  toward 350 words.
- (e) **Logo** — founder to decide; placeholder (Sparkles icon) still in use.
- (f) **Monetization tier** — `profiles.tier` flag is ready; wire a Pro gate around e.g. unlimited
  AI evaluations (currently 5/day free for all).
