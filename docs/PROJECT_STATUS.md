# Project Status & Decision Log

_Last updated: 2026-05-30. Branch: `claude/determined-euler-xUDrh`. Product name: **Sprechfit**._

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

### Phase 2 — CODE COMPLETE, awaiting founder deploy steps ⏳ (on `claude/determined-euler-xUDrh`)
- Supabase auth + cloud sync + AI writing eval, per `docs/EXPANSION_PLAN.md` §2A–2D — all written,
  `npm run build` green. **Founder provided** the Supabase project (`stkfdavpjflpqoxjunnj`) +
  publishable key (committed in `src/lib/supabaseConfig.ts`, safe — RLS) and an Anthropic key
  (⚠️ pasted in chat → must be **rotated**; goes only into Supabase secrets, never the repo).
- **2A schema (`supabase/`):** `config.toml` + migrations `0001_init.sql` (profiles/progress/
  writing_evaluations/ai_usage, owner-only RLS, auto-provision trigger) and `0002_ai_usage_rpc.sql`
  (atomic monthly counter). `profiles.tier` flag present (monetization-ready).
- **2B auth + sync:** `@supabase/supabase-js` added; `src/lib/supabase.ts`, `useAuthStore`
  (guest anon + email magic-link, guest→account upgrade via `updateUser`), `src/lib/cloudSync.ts`
  (offline-first: localStorage stays cache, pull+MERGE on login, debounced write-through). Wired
  into `App.tsx`; `features/auth/AccountPanel` shown in Settings.
- **2C writing UI:** `/writing` route (`features/writing/WritingHub`), `data/writingPrompts.ts`
  (short/long per theme), `lib/writing.ts` client; result shows ONE insight + "Üben" deep-link via
  the `practiceAreas` registry. Added to Sidebar + Dashboard daily modules.
- **2D edge function:** `supabase/functions/evaluate-writing/` — daily limit + monthly auto-shutoff
  ($5 cap) + input-hash cache + LanguageTool pre-check (templated spelling path = no LLM) + ONE
  Haiku call (Gemini/OpenAI fallback on hard fail only). Secrets via `supabase secrets set`.
- **Remaining (founder, ~20 min):** run the CLI steps in **`docs/PHASE2_SETUP.md`** (link, db push,
  enable anon sign-in + Turnstile, set secrets with the ROTATED key, deploy function), then verify.
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

## Founder action items (Phase 2 deploy — full click-by-click in `docs/PHASE2_SETUP.md`)
- [x] Create a Supabase project; share URL + publishable key. (`stkfdavpjflpqoxjunnj`, committed)
- [x] Provide Anthropic (Claude) API key. (provided — ⚠️ **rotate it**, was pasted in chat)
- [x] Decide the monthly AI spend ceiling. (**$5/month**, default in the function)
- [ ] **Rotate the Anthropic key**, then `supabase secrets set ANTHROPIC_API_KEY=<new>`.
- [ ] Run `supabase link` + `supabase db push` to apply the schema.
- [ ] Enable Anonymous sign-in + Turnstile CAPTCHA; set the Site URL.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) + set it as a secret.
- [ ] `supabase functions deploy evaluate-writing`; smoke-test per the setup doc.

## Deploy / workflow reminders
- `main` is production; merging to it triggers `pages.yml`. Develop on
  `claude/determined-euler-xUDrh`; ship via squash-merge PR. **Always verify `npm run build` is
  green on the exact commit before merging** (a skipped check shipped two broken builds this session).
- Sandbox can't reach the live site or run Docker (so no local Supabase / no live verification
  here) — those steps are handed to the founder, same as the Pages deploy.

## Resume here (next session)
**Phase 2 is CODE COMPLETE on `claude/determined-euler-xUDrh`** (build green) and waiting on the
founder to run the deploy steps in **`docs/PHASE2_SETUP.md`** (link → db push → enable anon+CAPTCHA
→ set the ROTATED Anthropic key → deploy function → smoke-test). Nothing else is blocked on code.
Once the founder confirms the function works end-to-end, ship via squash-merge PR into `main`.
After that, candidate next work: (a) Turnstile token wiring on the client guest button if abuse
shows up, (b) writing history view from `writing_evaluations`, (c) code-split the ~1.41 MB bundle,
(d) more collocations/theme + a Collocations browser tab. Logo still TBD by founder.
