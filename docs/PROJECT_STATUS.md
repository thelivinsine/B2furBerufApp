# Project Status & Decision Log

_Last updated: 2026-05-30. Branch: `claude/determined-euler-xUDrh`._

This file is the single place to re-orient when resuming work. For the full design, see
`docs/EXPANSION_PLAN.md`. For the original build plan, see `docs/IMPLEMENTATION_PLAN.md`.

## Who I'm working with
- **Founder is non-technical.** Operate as a seasoned CTO: be decisive and opinionated, minimize
  the founder's operational burden, protect them from surprise costs, and aim for an award-worthy,
  genuinely useful product — not just feature parity.

## Where things stand

### Shipped & live (on `main`, deployed via `.github/workflows/pages.yml`)
- Full client-side SPA: onboarding, dashboard, vocabulary (flashcards/quiz/list), redemittel
  (browse + practice), branching simulations, timed exam mode, analytics, settings.
- Engines: SM-2 SRS (`engine/srs.ts`), XP/levels/tiers (`engine/scoring.ts`), Web Speech TTS/STT
  (`engine/speech.ts`), branching dialogue runner (`engine/dialogue.ts`).
- State: zustand stores persisted to localStorage (`b2beruf.progress.v1`, `b2beruf.settings.v1`).
- Content: **293 vocab**, **36 redemittel**, **5 grammar snippets** (NOT surfaced in any UI yet),
  **3 simulation scenarios**, **2 exam sets**, 10 workplace themes.

### Phase 1 — DONE (client-side, on `claude/determined-euler-xUDrh`, not yet merged to `main`)
- **Types (1A):** `GrammarTopic`/`GrammarDrill`/`GrammarGroup`, `Collocation`, leveled
  `QuizQuestion` union (`MCQQuestion`/`WordOrderQuestion`/`MatchingQuestion`), `PracticeArea`
  + `WeaknessCategory` — all in `src/types/index.ts`.
- **Engine (1B):** `src/engine/quiz.ts` `buildThemeQuiz(themeId, difficulty, count)` generates
  mixed sets from vocab/collocations/grammar banks; reuses SRS (`reviewVocab`) + scoring.
  Added `XP.quizEasy/quizMedium/quizHard/grammarDrill`.
- **Content (1C):** `src/data/collocations.ts` (**68** Nomen-Verb pairs, ~6–8/theme);
  `src/data/grammar.ts` rewritten to **11 `GrammarTopic`s** w/ drills (Konnektoren, Relativsätze,
  da-/wo-Wörter, Verbstellung/TeKaMoLo, Nebensätze, Kasus, Nomen-Verb, K-II, Modal, Passiv);
  `redemittel.ts` grown to **72**; **10 connectors** added to vocab (now **303** words);
  `src/data/practiceAreas.ts` weakness→deep-link registry.
- **UI (1D):** `/grammar` (`features/grammar/GrammarHub` + `GrammarDrillCard`) and `/quiz`
  (`features/quiz/QuizHub` + `QuizRunner`), both query-param driven (`?topic=`, `?theme=&level=`).
  Wired into Sidebar, router (guarded), and Dashboard daily-module tiles.
- **Verify:** `npm run build` green; no duplicate ids. Live verification (Pages) handed to founder.
- **Ship:** open squash-merge PR into `main` when ready (triggers `pages.yml`).

### Approved, NOT yet implemented
- **Phase 2** in `docs/EXPANSION_PLAN.md` (Supabase auth + cloud sync + AI writing eval).

## Decisions locked this session
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

## Content gaps Phase 1 must close
- **0 connectors** in vocab; **no noun-verb collocations** (Funktionsverbgefüge) as data.
- Grammar missing: **Relativsätze**, **Präpositionalpronomen (da-/wo-words)**, expanded Konnektoren,
  Verbstellung/Verbklammer, Kasus. Existing 5 snippets aren't shown in any UI.
- No quiz-by-theme/difficulty system; no writing practice; no auth/backend.

## Founder action items (Phase 2 only — nothing needed for Phase 1)
- [ ] Create a free Supabase project; share project URL + anon key.
- [ ] Provide Anthropic (Claude) API key; optionally Gemini + OpenAI keys.
- [ ] Get a hosted LanguageTool API key (free tier).
- [ ] Decide the monthly AI spend ceiling.
- [ ] Run the 2–3 `supabase` CLI commands I'll provide; confirm the live deploy.

## Deploy / workflow reminders
- `main` is production; merging to it triggers `pages.yml`. Develop on
  `claude/determined-euler-xUDrh`; ship via squash-merge PR. Verify with `npm run build`.
- Sandbox can't reach the live site or run Docker (so no local Supabase / no live verification
  here) — those steps are handed to the founder, same as the Pages deploy.

## Resume here (next session)
**Phase 1 is complete and builds green** on `claude/determined-euler-xUDrh`. Next options:
1. **Ship Phase 1:** open a squash-merge PR into `main` (only when the user asks for a PR).
2. **Start Phase 2** per `docs/EXPANSION_PLAN.md` §2A–2D (Supabase project + schema, auth + cloud
   sync, `/writing` route, evaluate-writing Edge Function). Founder action items above are Phase-2
   prerequisites. The `PracticeArea` registry (`src/data/practiceAreas.ts`) is ready for the
   writing-coach "Üben" deep-links.
3. **Polish Phase 1:** more collocations/theme, surface a Collocations browser tab, code-split to
   shrink the 1.18 MB JS bundle.
