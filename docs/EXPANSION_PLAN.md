# B2 Beruf App — Feature Expansion Plan (Grammar, Quizzes, Auth + AI Writing)

> Status: **FULLY SHIPPED** — Phase 1 live 2026-05-30, Phase 2 live 2026-05-31, both founder-verified.
> Working branch: `claude/determined-euler-xUDrh`. See `docs/PROJECT_STATUS.md` for live status and next steps.

## Context
The original app shipped and is live: a polished client-side SPA (onboarding, dashboard,
vocabulary flashcards/quiz/list, redemittel browse+practice, branching simulations, timed exam
mode, analytics, settings) backed by an SM-2 SRS engine, XP/level scoring, and zustand stores
persisted to `localStorage`. Content today: 293 vocab words, 36 redemittel, 5 grammar snippets
(not surfaced in any UI), 3 simulation scenarios, 2 exam sets.

The user wants to grow this into a complete revision platform:
1. **Richer learning content** — keep vocab practice, expand redemittel and "frequently used
   sentences", add **noun-verb combinations** (Funktionsverbgefüge), and a real **grammar**
   section covering connectors, **prepositional pronouns (da-/wo-words)**, **relative clauses**,
   verb position, cases, etc., so learners can revise these concepts.
2. **Leveled quizzes** — every theme gets a quiz with varying difficulty (easy/medium/hard).
3. **AI writing practice** — choose short or long, write German, submit; the AI returns **ONE**
   prioritized insight (the single biggest weakness, e.g. "verb position" or "vocabulary range")
   and a button that deep-links to the relevant practice section.
4. **Auth with guest login** + **full cloud sync** of progress, via Supabase.

### Operating model (CTO framing for a non-technical founder)
- **The wedge / what makes this award-worthy:** most apps grade grammar; ours tells the learner
  their **single biggest weakness** and gives a **one-tap path to practise exactly that**. That
  loop — write → one insight → targeted drill → measurable improvement — is the differentiator.
  Content and quizzes exist to make that loop land and give the deep-links somewhere great to go.
- **Minimal ops:** lean entirely on **managed services** (Supabase hosted Postgres+Auth+Edge
  Functions; hosted LLM + hosted LanguageTool API). Nothing for the founder to run or patch.
- **Cost capped by design** (guardrails below) so a traffic spike can never produce a surprise bill.
- **Monetization-ready, not monetized:** free + guest-first now, but structure data (per-user
  tier flag, usage counters, feature flags) so a paid tier switches on later with no rewrite.

### Decisions locked with the user
- **Sequencing:** *Phase it, content first.* **Phase 1** (content + grammar + leveled quizzes)
  is fully client-side and ships on its own. **Phase 2** (Supabase auth + cloud sync + AI
  writing eval) builds on top.
- **Business model:** **free, guest-first, monetize later.** No billing now; schema + feature
  flags designed so a paid tier drops in without rework. No B2B/multi-tenant machinery yet.
- **AI cost posture:** **shoestring — protect the founder from bills.** (a) **Claude Haiku only**
  in production; Gemini Flash / gpt-4o-mini wired as automatic fallbacks **only on hard failure**
  (primary down/quota), never as a quality upgrade. (b) **Aggressive caching:** hash the
  normalized submission; identical/near-identical text returns the cached insight for free.
  (c) **~3–5 reviews per user per day** hard limit. (d) **Monthly spend cap with auto-shutoff:** a
  global usage counter disables new AI calls (graceful "back tomorrow" message) once a
  configurable ceiling is hit. Target: low single-digit $/month even at hundreds of users.
- **Writing engine:** **hybrid** — hosted **LanguageTool** detects German error categories cheaply
  (often resolving the insight with **no LLM call at all**); the **one LLM call** runs only when
  needed to prioritise/phrase the #1 weakness. The hybrid split is itself a cost lever.
- **LLM keys + Supabase project:** provided by the founder, stored as Edge Function secrets (never
  shipped to the browser).
- **Auth/data:** **Full cloud sync** — auth (anonymous guest + email/OAuth) and progress migrated
  into Supabase Postgres, syncing across devices; guest data upgrades into a permanent account.
- **Vocabulary sourcing ("RAG or something else?"):** **No RAG / no vector DB.** A curated,
  version-controlled static dataset bundled with the app is the right architecture. Expand it
  using *openly-licensed* sources only — **Tatoeba** (CC-BY example sentences), **Wiktionary/
  Wikidata** (CC-BY-SA inflections/genders), **DWDS/Leipzig** frequency data. The Goethe
  Wortlisten, Routledge dictionary, and Klett textbooks (Netzwerk/Aspekte/Linie 1 Beruf) are
  copyrighted and must NOT be ingested. pgvector/RAG can be revisited only if semantic search is
  added later.

### Sandbox constraints (verification handed to user, like the Pages deploy)
- Supabase local dev needs Docker (unavailable here) and the live site is unreachable from the
  sandbox. Phase 2 backend/migrations/Edge Functions will be built and documented; the user runs
  the `supabase` CLI and verifies the deploy.

---

## PHASE 1 — Content + Grammar + Leveled Quizzes (client-side, ships independently)

### 1A. Type extensions (`src/types/index.ts`)
- Extend `GrammarSnippet` into a richer **`GrammarTopic`**: `id`, `group` (see below), `title`,
  `titleDe`, `purpose`, `explanation` (short prose), `pattern`, `examples: {de,en}[]`,
  `pitfalls?: string[]`, and `drills: GrammarDrill[]` (inline practice items).
  - `group`: `"connectors" | "relativeClauses" | "prepositionalPronouns" | "collocations" |`
    `"verbPosition" | "konjunktiv2" | "modals" | "passive" | "subordinate" | "cases"`.
- Add **`Collocation`** (Nomen-Verb-Verbindungen): `{ id, noun, verb, full, en, register?, themeId?,`
  `example: {de,en} }` (e.g. `eine Entscheidung treffen`, `Maßnahmen ergreifen`).
- Add a leveled **`QuizQuestion`** discriminated union with `kind`, `difficulty: 1|2|3`,
  `themeId`, `prompt`, `answer`, `options?`, and a `sourceId?` (vocab/collocation id) so correct
  answers can feed SRS. Kinds: `translation`, `article`, `plural`, `cloze`, `wordOrder`,
  `matching`, `collocationFill`, `connectorChoice`, `relativePronoun`, `daWord`.
- Add a **`PracticeArea`** registry type mapping a weakness category → an in-app route+query
  (consumed by the Phase-2 writing deep-links, but defined now).

### 1B. New quiz engine (`src/engine/quiz.ts`) — reuses existing patterns
- `buildThemeQuiz(themeId, difficulty, count)` **generates** a mixed question set from existing
  data (vocab via `vocabByTheme`, new collocations, grammar drills) — no hand-authoring per
  theme, so all 10 themes × 3 levels are covered automatically.
  - **Level 1 (Leicht / recognition):** `translation` (de→en MCQ), `article`, `matching`.
  - **Level 2 (Mittel / production-lite):** `plural`, `cloze` (blank in a vocab example),
    `collocationFill`, `connectorChoice`.
  - **Level 3 (Schwer / application):** `wordOrder`, `relativePronoun`, `daWord`, build-a-sentence
    with a given collocation.
- Reuse the distractor/sampling approach already in `VocabQuiz`'s `buildQuiz`; reuse `engine/
  srs.ts` `review()` to grade `sourceId`-backed questions, and `engine/scoring.ts` for XP.
- Add difficulty-scaled XP to `scoring.ts` `XP` map: `quizEasy: 8, quizMedium: 12, quizHard: 16`.

### 1C. New content data (`src/data/`)
- **`collocations.ts`** (new): ~10–15 Funktionsverbgefüge / noun-verb pairs per theme (~100–150
  total), each with example + theme link. Original authoring, cross-checked against open lists.
- **`grammar.ts`** (rewrite to `GrammarTopic[]`): keep the 5 existing topics; **add** Relativsätze
  (relative pronouns + cases), Präpositionalpronomen (da-/wo-compounds: *darauf, damit, worüber*),
  expanded Konnektoren (kausal/konzessiv/temporal/final/konsekutiv), Verbstellung/Verbklammer
  (TeKaMoLo), Nomen-Verb-Verbindungen explainer, Kasus + Wechselpräpositionen. Each with 2–4
  inline `drills`.
- **`redemittel.ts`** (expand): grow each of the 9 categories to ~8–10 phrases (~80+ total); add
  "frequently used sentences" coverage (asking opinion, structuring/transitions, summarising).
  Augment examples with Tatoeba CC-BY sentences where useful (with an attribution note in repo).
- **`vocabulary.ts`** (augment): add **connector** entries (`pos: "connector"`, currently 0) and a
  few collocation-linked terms; keep schema + `npm run build` verification.

### 1D. New / updated UI (reuses existing shared components, AppShell, PageTransition)
- **Grammar section** — new route `/grammar` (`features/grammar/GrammarHub.tsx` +
  `GrammarTopic.tsx`): browse topics grouped by `group`, read explanation/pattern/examples/
  pitfalls, run inline drills (instant feedback + XP + TTS via `engine/speech.ts`). This surfaces
  grammar for the first time. Add a Collocations browser here (or as a Vocabulary tab).
- **Quiz experience** — new route `/quiz` (`features/quiz/QuizHub.tsx` + `QuizRunner.tsx`): pick
  theme → pick level (Leicht/Mittel/Schwer) → run generated quiz → results screen with score, XP,
  per-question review, and a weak-area summary. Add a "Quiz" affordance on the Dashboard theme
  cards and a Vocabulary→Quiz cross-link.
- **Nav wiring:** add Grammar + Quiz to the sidebar (`components/layout`) and `src/router.tsx`
  (guarded by `RequireOnboarding` like the rest); add Dashboard daily-module tiles.
- **Deep-link infrastructure:** implement query-param handling (e.g. `/grammar?topic=…`,
  `/quiz?theme=…&level=…`) and the `PracticeArea` registry now, so Phase 2 just maps a weakness to
  an existing link.

### Phase 1 verification
- `npm run build` (= `tsc -b && vite build`) is green; no duplicate ids in new data.
- `npm run dev`: Grammar topics render + drills grade; Quiz runs for **every** theme at all three
  levels with correct XP and SRS updates; deep-links resolve; reduced-motion + keyboard nav hold.
- Ship Phase 1 via squash-merge PR into `main` (triggers `pages.yml`); user verifies live.

---

## PHASE 2 — Supabase Auth + Cloud Sync + AI Writing Evaluation

### 2A. Supabase project & schema (`supabase/` via CLI, committed migrations)
- `supabase init`; migrations under `supabase/migrations/`. Tables (all RLS: owner-only):
  - `profiles` (id=auth uid, name, level, goal, exam_date, daily_goal_xp, settings jsonb,
    **`tier` ('free'|'pro') default 'free'`** — the monetization-ready flag, unused for now).
  - `progress` (user_id, xp, daily_xp jsonb, streak, longest_streak, last_active_day,
    active_days, srs jsonb, redemittel_seen jsonb, scenarios_done, exams_done jsonb,
    total_sessions, updated_at).
  - `writing_evaluations` (id, user_id, created_at, theme, length, weakness, insight,
    **`input_hash`, `cached` bool, `model` text, `cost_estimate`**) — source of truth for the
    **per-user daily limit** and the cache.
  - `ai_usage` (month, calls, cost_estimate) — global counter backing the **monthly auto-shutoff**.
- Enable **anonymous sign-in** (guest) + email/OAuth; **Turnstile/CAPTCHA on guest sign-up** to
  stop bot abuse inflating the AI bill.

### 2B. Auth + cloud sync (client)
- Add `@supabase/supabase-js`; `src/lib/supabase.ts` (URL + anon key from build env — safe with
  RLS). New `features/auth/` (guest button + sign-in/up) and a session guard alongside
  `RequireOnboarding`.
- Refactor `useProgressStore` + `useSettingsStore` to **offline-first cloud sync**: localStorage
  remains the local cache; on login, load from Supabase and merge; write-through on changes
  (debounced). Guest→account upgrade carries the same uid (`linkIdentity`) so progress survives.

### 2C. Writing practice (client) — new route `/writing` (`features/writing/`)
- Choose **short** (~40–60 words) or **long** (~120–150 words); theme-linked prompt; textarea +
  word counter; submit → calls the Edge Function; shows the **single** insight + an **"Üben"**
  button deep-linking via the `PracticeArea` registry from Phase 1 (e.g. verb position →
  `/grammar?topic=verb-position`, vocab range → `/quiz?theme=…`, cohesion → `/grammar?topic=
  connectors`, register → `/redemittel`).

### 2D. Evaluation Edge Function (`supabase/functions/evaluate-writing/`) — cost-guarded
- Steps: (1) auth + **per-user daily-limit check** (~3–5/day) against `writing_evaluations`, and
  **monthly auto-shutoff check** against `ai_usage` → graceful "back tomorrow" if exceeded;
  (2) **cache lookup** by `input_hash` of normalized text → return cached insight for free on hit;
  (3) call **hosted LanguageTool API** → error categories with counts; (4) aggregate into weakness
  buckets (verb position/Verbklammer, case/article, vocabulary range, cohesion/connectors,
  relative clauses, da-words, collocations, register, spelling) — **if one bucket clearly
  dominates, skip the LLM and return a templated insight** (free path); (5) otherwise **one
  Claude Haiku call** (fallback to Gemini Flash → gpt-4o-mini only on hard error/quota) with a
  structured prompt returning `{ weakness, insight, practiceArea }`; (6) persist the row, bump
  `ai_usage`, return JSON. Keys/secrets via `supabase secrets set`; never shipped to the client.

### Phase 2 verification (user-run, Docker/live needed)
- `supabase start` + `supabase db reset` apply migrations; RLS denies cross-user reads.
- Guest login works with no credentials; progress syncs across two browsers; guest→account
  upgrade preserves data.
- Writing submission returns exactly one insight; the "Üben" button lands on the correct section;
  the daily limit blocks the N+1th submission; resubmitting identical text hits the **cache** (no
  AI cost); the monthly **auto-shutoff** trips when the ceiling is reached; LLM fallback path works
  when the primary key fails.

---

## What I need from you (founder) — the only non-code steps
These are the handful of things only you can do; I'll provide exact click-by-click instructions
and do everything else. **None of this is needed for Phase 1 — it ships without any of it.**
- **Phase 2 only:** create a free **Supabase** project (I'll give the steps); paste me the project
  URL + anon key (safe to expose) so I can wire the client.
- Provide an **Anthropic (Claude) API key**, and optionally Gemini + OpenAI keys for fallback — I
  store them as Supabase secrets; they never touch the browser.
- Sign up for a **hosted LanguageTool** API key (free tier exists).
- Set the **monthly spend ceiling** number you're comfortable with; I wire the auto-shutoff to it.
- Run two or three copy-paste `supabase` CLI commands to apply migrations + deploy the function
  (sandbox can't run them), and confirm the live site — same hand-off as the existing Pages deploy.

---

## Key reuse (avoid rebuilding)
- `engine/srs.ts` (`review`, `isDue`, `mastery`) — grade quiz/grammar drill answers.
- `engine/scoring.ts` (`XP`, `levelFromXp`, `tierForLevel`) — extend `XP`, reuse everything else.
- `engine/speech.ts` — TTS for grammar examples/quiz items.
- Data helpers in `data/themes.ts` (`vocabByTheme`, `themeById`, `redemittelByCategory`).
- Shared UI (`components/shared/*`, `layout/AppShell`, `PageTransition`) and Radix/Tailwind
  patterns already used across features.
- `useProgressStore` actions (`addXp`, `reviewVocab`, `registerSession`) for new surfaces.

## Constraints / notes
- Work on branch `claude/determined-euler-xUDrh`; commit in logical chunks; **no PR unless asked**.
- Phase 1 stays 100% client-side (no secrets) so it can ship to GitHub Pages unchanged.
- All authored content original; only CC-/open-licensed external data (with attribution) ingested.
