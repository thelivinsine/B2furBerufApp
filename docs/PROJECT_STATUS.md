# Project Status & Decision Log

_Last updated: 2026-07-06 (session 62 continued: **detailed game design DRAFTED** in
`docs/strategy/GAME_DESIGN.md` + a founder slide deck, awaiting review; see the top "Resume here"
handoff. Prior update, session 71: two parallel audits. **(1) UX redesign audit + gap analysis**
(report: `docs/plans/UX_AUDIT_2026-07-06.md`) confirmed redesign Phases 1–4 are faithfully implemented,
all gates green; two gaps were found and fixed the same session: a latent eager-bundle landmine (dead
`cardMeta`/`cefrRange` + `filterVocab` import removed from `intentCards.ts`) and the missing quest
"claim moment" (new persisted `claimedMilestones` + a reward-gold "Einlösen" card on Fortschritt).
**(2) Frontend design/brand audit** (`docs/plans/DESIGN_AUDIT_2026-07-06.md`, doc-only) flagged missing
social-preview meta, five parallel accent systems, a light-mode boot flash, Denglish copy, and contrast
failures. Session 62's game plan, `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, remains PROPOSED. The working
branch is reassigned every session, so **`main` is always the source of truth**. Product name:
**Genauly** (domain `genauly.de`)._

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

**Handoff after session 62 continued (2026-07-06). Detailed game design DRAFTED, awaiting founder
review: `docs/strategy/GAME_DESIGN.md`.** The founder asked for a detailed gameplan with storyline,
per-mission descriptions, game elements and player interaction, delivered as a slide deck. The deck
(21 slides) was delivered as a Claude Artifact AND committed as
**`docs/strategy/GAME_DESIGN_DECK.html`** (self-contained, open in any browser; added after the
Artifact link failed for the founder); the durable source of truth is the new
**`docs/strategy/GAME_DESIGN.md`**, the design layer between `GAME_CONCEPT.md` (pillars) and
`GAME_IMPLEMENTATION_PLAN.md` (build). Contents: premise + character creation (you arrive with two
suitcases and a reason; no villain, everyday Germany is the antagonist); the city **"Neustadt"** and
game working title **"Neuland"** (both proposals); a six-NPC recurring cast (Jonas the wild-card
friend, Frau Schmidt vom Bürgeramt, Ayşe the WG flatmate, Hausmeister Krause, Chefin Frau Weber,
Späti-owner Herr Nguyen); the core loop (map → bag loadout → scenes → loot → FSRS recurrence); the
interaction model (D/E on every line, tap→type→speak input ladder, register-marked choices, playable
parody documents); conversation battles (Geduld vs Standing bars, Redemittel moves, K-II crits, kind
status effects); the bag item taxonomy (Wortkarten Lv1–5, Redemittel moves, Grammatik-Kräfte,
Schlüssel-Dokumente, consumables, Fundstücke); failure-is-content rules restated; and the full
authored spine: **seven chapters / ~40 described missions** (K1 Ankommen 6 incl. the Anmeldung boss
= the vertical slice, K2 Wohnen 6, K3 Geld & Papierkram 5, K4 Die Jobsuche 7 ending on the
Vorstellungsgespräch boss, K5 Im Büro 5 mapping the workplace themes with the Dienstreise boss, K6
Gesund & Sozial 6, K7 Mein Ziel with 5 player-chosen endgame chains where the exam is one optional
path per the scope guardrail; **structural rule from founder review: every chapter ends on its
boss**), plus real-world side quests and tone/art rules (pixel
direction still awaiting blessing). **Next step: founder reviews the deck and answers the three
open decisions (art-blessing mockups, names, chapter-1 sign-off); then game G1 can start per
`GAME_IMPLEMENTATION_PLAN.md`.**

---

**Handoff after session 71 (2026-07-06). Frontend design/brand audit is DONE (doc-only, no code
changed): `docs/plans/DESIGN_AUDIT_2026-07-06.md`.** The founder asked for a thorough audit of the
frontend design, brand and visual assets with weaknesses + top 5 recommendations. Findings in short:
the token/component architecture is strong (keep it), but (A) there are **zero social link-preview
assets** (no `og:`/`twitter:` meta, no OG image, no canonical URL), (B) **five parallel accent
systems** (tokens, nav hexes, theme gradients, hub/intent gradients, building hexes; three
near-identical brand indigos `#5d52e0`/`#5b5be6`/`#6366f1`), (C) a **wrong-theme boot flash** for
light-mode users (`index.html` hardcodes `class="dark"` + dark-only `theme-color`, default themeMode
is `system`), (D) **unregulated Denglish** copy (CTA labels disagree, "a Arztbesuch", `lang="en"` vs
manifest `lang: "de"`), and (E) **contrast failures** (`text-warning` ~2.2:1 on light) plus
button-instead-of-link navigation on the landing page. The report's top-5 recommendations are ordered
by impact ÷ effort; #1 (OG/social meta + share image) is roughly an hour and the highest external
impact.

**Next step:** pick recommendations off the audit (start with #1 social meta, then #2 palette
consolidation), or continue the standing alternative: game plan G1 (`GAME_IMPLEMENTATION_PLAN.md`,
still PROPOSED). Phase 4 of the UX redesign is complete (session 70).

---

_Older handoffs (sessions 2–71) live in `docs/archive/PROJECT_STATUS_ARCHIVE.md`._

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

