# Project Status & Decision Log

_Last updated: 2026-07-06 (session 69: UX redesign **Phase 4 task 4.3 shipped** (Lesen/Hören text bank,
PR #320, `f09da8e`). New `src/data/texts.ts`: **10 authored authentic-style B1–B2 texts** across 9 themes
(2 Behörden letters, 2 workplace emails, 2 memos, 2 announcements, 2 voicemail scripts), each with a
German title + full text, an English gloss and 2–3 German MCQ comprehension checks (**30 checks** total;
voicemails double as TTS listening input in 4.4). New types `TextKind`/`TextCheck`/`ReadingText` +
`"text"` in `ProvenanceContentType`; `lint-content.mjs` gained the `TEXT_KINDS` mirror and a `lintTexts`
validator (enums, required fields, 2–3-checks contract, answer among options, globally unique check ids,
`subThemeId` cross-check) and the bank rides the provenance cross-check (one authored/OWNED `draft` row
per text, CoE level descriptors cited as CEFR calibration). `/sources` page labels the new type. No UI
yet: nothing eager imports the bank (main chunk 78.9 kB unchanged); the composer block + renderer are
task 4.4. Provenance register now **1,121 rows**.
Prior: session 68: UX redesign **Phase 4 task 4.2 shipped** (typed-recall block in
the loop). New `kind: "typing"` `SessionBlock`; the composer graduates due vocab from recognition
flashcards to typed forward recall once a card is established (`graduatedToTyping`: reps ≥ 2 AND FSRS
stability ≥ `TYPING_STABILITY_FLOOR` = 8 days, legacy cards fall back to `interval`), while new/young
cards stay on flashcards. New `TypingBlock` renderer in `SessionPlayer`: EN prompt display-size, typed
DE input graded by 4.1's `gradeTyped`, an "Anzeigen" reveal that grades as a miss, latency + verdict
into `reviewVocab`. The three-tier verdict maps onto the SRS Grade scale (correct → 4, almost → 3/Hard,
wrong → 0) so near-misses schedule gently instead of feeding false evidence; combo/XP reward only a
clean "correct". `captureLoot` now takes an explicit `Grade`. 3 new composer Vitest cases (`test:unit`
56 → 59); all gates green (build, lint 0 errors, `lint:content`, `check:bundle` main chunk 78.9 kB).
Session 62's game plan, `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, remains PROPOSED and sequences after
redesign Phases 1–3 (now all shipped). The working branch is reassigned every session, so **`main` is
always the source of truth**. Product name: **Genauly** (domain `genauly.de`)._

This file is the **lean, living** status doc: current state plus the two most recent session handoffs.
Start at the `## Resume here (next session)` section near the end. Companion files:
- **`docs/PROJECT_REFERENCE.md`** — stable reference that rarely changes: the founder backlog,
  the product-evaluation findings, per-session model guidance, and reusable research findings.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — the append-only history: older session handoffs
  (sessions 2–67) and accumulated deploy/ops notes.
- **`docs/DECISIONS.md`** — the "why" behind locked decisions. Full design: `docs/archive/EXPANSION_PLAN.md`.

**Doc-hygiene rule (keep this file lean):** when you append a new handoff to `## Resume here`, move any
handoff older than the two most recent into `docs/archive/PROJECT_STATUS_ARCHIVE.md`. Keep this file
under ~250 lines. This split was done in session 70 (the file had grown to 1,624 lines / 140 kB).

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

**Handoff after session 69 (2026-07-06). UX redesign Phase 4 task 4.3 is SHIPPED ✅ (PR #320,
squash SHA `f09da8e`): the Lesen/Hören content bank, the first half of Session B (plan:
`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **`src/data/texts.ts` (new):** 10 authored authentic-style B1–B2 texts across 9 themes, in the five
  genres the plan names: Behörden letters (`tx_behoerde_anmeldung_brief` B1.2 meldewesen,
  `tx_behoerde_unterlagen_brief` B2.1 antrag), workplace emails (scheduling B1.2, customer/reklamation
  B2.1), memos (meetings/entscheidung B2.1, project B2.2), announcements (technology B1.2, safety B2.1),
  voicemail scripts (travel B1.2, logistics B2.1; these double as TTS listening input in 4.4). Each item:
  `id`/`kind`/`themeId`/`cefr`/`title`/`titleEn`/`de`/`en` + 2–3 MCQ `checks` (30 total, German
  questions, `explain` in English). All names/numbers/offices fictitious; no em dashes.
- **Types (`src/types/index.ts`):** `TextKind` (letter/email/memo/announcement/voicemail), `TextCheck`,
  `ReadingText`; `"text"` added to `ProvenanceContentType`.
- **Linter (`scripts/lint-content.mjs`):** `TEXT_KINDS` closed-enum mirror + `lintTexts` (kind/themeId/
  cefr enums, required fields, **checks length ≥ 2 is an error** (the 4.4 renderer contract), answer
  among options, globally unique check ids via a `texts/checks` sweep, `subThemeId` declared on the
  parent theme, `tx_` prefix warning). Bank loaded, counted (`texts`, `text checks`) and included in
  the provenance cross-check (one row per text; embedded checks ride on the text's row).
- **Provenance:** 10 authored/OWNED rows, `review_status: "draft"` for the founder pass; register now
  **1,121 rows** (1,096 draft / 25 verified). `/sources` (`features/legal/Sources.tsx`) got the required
  label + ordering entry for the new type.
- **Gates:** all green — `build`, `lint` (0 errors), `lint:content` (0 errors/warnings), `test:unit` 59,
  `check:bundle` main chunk **78.9 kB** (bank has no eager consumer; 4.4 must keep it in a lazy chunk).

**Next step:** **task 4.4** (Opus per the plan): `kind: "reading"` composer block (+ listening variant
via `engine/speech.ts` TTS), full-screen text card with tap-gloss + comprehension MCQ in `SessionPlayer`,
results feeding XP/theme progress (NOT vocab FSRS), ~1 block per composed session. Then short Session C
= 4.5 (progression chip) + 4.6 (docs/ship). The founder's pending priority call vs game-plan G1 stands.

---

**Handoff after session 68 (2026-07-05). UX redesign Phase 4 Session A is COMPLETE ✅: task 4.2
(typed-recall block in the loop) shipped, so 4.1 + 4.2 together put tolerant typed forward recall into
the default session and feeding FSRS (plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **New `kind: "typing"` `SessionBlock`** (`src/types/index.ts`): vocab-only forward recall (EN → typed DE),
  same shape as `speaking` (sourceId/de/en/example).
- **Composer graduation rule** (`src/engine/session.ts`): `graduatedToTyping(card)` returns true when a
  due card is `reps >= 2` AND `(stability ?? interval) >= TYPING_STABILITY_FLOOR` (8 days). Pool 1 maps
  graduated due cards to `typing` blocks (`ty_` key), new/young cards stay recognition `flashcard`s. A
  single lucky first answer never jumps a brand-new word to typing.
- **`TypingBlock` renderer** (`SessionPlayer.tsx`): EN prompt display-size, a typed DE input graded by
  4.1's `gradeTyped`, an "Anzeigen" give-up that grades as a miss, three-tier feedback (success/warning/
  danger tones) with the correct answer + `SpeakButton` + example, latency captured mount→answer. The
  verdict maps onto the SRS `Grade` scale (correct → 4 Good, almost → 3 Hard, wrong → 0 Again); combo/XP
  reward only a clean "correct". `captureLoot` refactored to take an explicit `Grade` (all callers updated).
- **Gates:** all green — `build`, `typecheck`, `lint` (0 errors), `lint:content`, `test:unit` **59**
  (56 → 59: +3 composer cases for the graduation rule), `check:bundle` main chunk **78.9 kB**.

**Next step:** Phase 4 **Session B = 4.3 + 4.4** (Lesen/Hören content bank `src/data/texts.ts` + the
`reading`/`listening` composer block + renderer), then short Session C = 4.5 (progression chip) + 4.6
(docs/ship). OR pivot to game plan G1 (`GAME_IMPLEMENTATION_PLAN.md`), whose formCloze / dialogue-battle
scenes now have both the tolerant grading (4.1) and a typed-input block pattern (4.2) to build on.

---

_Older handoffs (sessions 2–67) live in `docs/archive/PROJECT_STATUS_ARCHIVE.md`._

**Content counts (verified from `src/data/*` on 2026-07-03):**
- Vocabulary: **528 words**
- Collocations: **396 Nomen-Verb pairs** (~36/theme; tripled from 132 in s40)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **12** (incl. behoerde)
- Exam sets: **10** (1 per theme · 6–7 min · sharedRubric)
- Redemittel: **72** entries
- Can-Do milestones: **25** (all 11 themes; founder-verified provenance)
- Lese-/Hörtexte: **10** texts / **30** comprehension checks (added s69; founder review pending)
- Provenance rows: **1,121** (all with a `reference`; 1,096 `draft` / 25 `verified`)

**Dev branch:** reassigned each session; realign to `origin/main` after each squash-merge (`main` is
always the source of truth).

