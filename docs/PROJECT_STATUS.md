# Project Status & Decision Log

_Last updated: 2026-07-06 (session 73: **game phase G1 SHIPPED**. The Neuland mission engine
(`src/types/game.ts` + `engine/mission.ts` + mission checks in `lint-content.mjs` + Vitest suite),
the six scene renderers under `src/features/welt/` styled to the blessed scene-7 reference, and the
founder-approved chapter-1 Anmeldung boss mission (`src/data/missions.ts`) are live behind the lazy
`/welt` route (Beta card on the Anwenden hub). Chapter-1 mission list founder-approved this session.
Prior updates same day: session 72 blessed the modern pixel art direction + the "Neuland" title.
The working branch is reassigned every session, so **`main` is always the source of truth**.
Product name: **Genauly** (domain `genauly.de`)._

This file is the **lean, living** status doc: current state plus the two most recent session handoffs.
Start at the `## Resume here (next session)` section near the end. Companion files:
- **`docs/PROJECT_REFERENCE.md`** — stable reference that rarely changes: the founder backlog,
  the product-evaluation findings, per-session model guidance, and reusable research findings.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only history, chunked by ISO week
  under `docs/archive/status-log/` (sessions 1–71 + an `ops-notes` file).
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

**Handoff after session 73 (2026-07-06). Game phase G1 SHIPPED ✅: the Neuland mission engine and
the Anmeldung vertical slice are live behind `/welt` (Beta).** What exists now:
- **Schema + runner:** `src/types/game.ts` (Mission/Scene closed unions: cutscene, websiteParody,
  loadout, listening, dialogueBattle, formCloze; NPC/key-item/chapter registries; every union
  mirrored in the linter) and `engine/mission.ts` (pure immutable runner emitting effects the
  player applies to the real stores: XP via `addXp`, retrieval grades via `reviewVocab` FSRS,
  Redemittel practice, key items). Game state (`missionsDone`, `keyItems`) lives in
  `useProgressStore`, **local-only for now**: cloudSync's `progress` table has a fixed column set,
  so syncing game state needs a G2 Supabase migration (backlog).
- **Lint gates:** `lint-content.mjs` now loads `src/data/missions.ts` and enforces mission graph
  integrity (routing resolves + reachable win, battle node graphs, content-bank id references,
  key-item obtainability, acyclic mission dependencies). `tests/mission.test.ts` covers the runner
  (win path, fetch-quest loss, bar drain, loadout grading).
- **Renderers:** `src/features/welt/` (stage atoms + 6 scene views + MissionPlayer + Welt hub),
  styled to the blessed scene-7 reference: light-theme-only game cards, pixel backdrops
  (code-authored placeholders in `src/features/welt/assets/`, generator
  `preview/game-pixel-mockups/welt_assets.py`; G2 buys packs), focus mode hides chrome on `/welt`.
  Entry: Anwenden hub "Neuland (Beta)" card + `/welt` deep link.
- **Content:** the chapter-1 boss mission `m_kap1_anmeldung` (9 scenes: booking parody → loadout →
  waiting room → Frau Schmidt battle → Anmeldeformular → victory; loses route through a scaffolded
  retry that grants the missing papers). Two vocab adds (`v_mietvertrag`,
  `v_wohnungsgeberbestaetigung`), provenance rows for all three new ids (1,124 total).
  **Chapter-1 mission list (1.1–1.6) founder-approved this session**; the Anmeldung German awaits
  the normal founder verify pass (provenance `draft`).
- Verified end-to-end in the sandbox browser (full mission playthrough, zero console errors); all
  gates green (typecheck, eslint, lint:content, 90+ unit tests, SRS/pronounce vectors, bundle
  79.5 kB main / game in its own ~53 kB lazy chunk).
- **Founder playtest feedback applied same-session, two rounds.** Round 1 ("image unclear, too
  much text"): where-am-I chips on every stage, big text cuts per scene. Round 2 ("not engaged
  enough, bar bug, more variety, finish should matter"): the loadout is now **walk-and-pick**
  (documents lie in the room, the player sprite walks to each, the bag is the exit), the battle
  bar bug is fixed (Geduld delta on Schmidt's card, Mut delta on the player's), Mut starts at
  60/100 so every move visibly moves both bars, the two Konjunktiv-II crits are **typed cloze
  challenges** (`BattleMove.cloze`), and a victory bonus scales with the remaining bars
  (`BATTLE_FINISH_BONUS`). Recorded for G2 in `GAME_DESIGN.md` §4/§10 + backlog #32a/#32b:
  **waiting-as-gameplay** and **Print-Prop-Quests** (Werbung/Anzeige/Flyer mini-exercises).
- The game schema is aligned to **design v3** (PR #336, merged from a parallel session mid-build:
  six-chapter spine, Im Büro inside the Mein Ziel career chain, Pfand economy): `ChapterId`, the
  `chapters` registry and the linter mirror all carry the six chapters. Kapitel 1 was untouched
  by v3, so the approved mission list stood. The Pfand economy + Jonas wild card are G2 systems.

**Next step: G2** (`GAME_IMPLEMENTATION_PLAN.md`): missions 1.1–1.5 against the approved list,
recurring NPCs, licensed pixel packs (select against scene 7), FSRS-driven recurrence, the
playtest gate. Also G2: Supabase migration to sync `missionsDone`/`keyItems`. **Exit criterion
for G1 stands: the founder plays the slice on their phone and it feels like a game.**

**Model for G2 (founder decision s73, saving Fable budget): run G2 on Opus 4.8 / Sonnet 5,
NOT Fable.** The Fable-tier work (schema architecture, art direction, chapter-1 narrative specs,
Anmeldung content) is done and locked; per the plan's model map, Opus 4.8 handles the
FSRS-recurrence engine work, Sonnet 5 drafts missions 1.1-1.5 against the `GAME_DESIGN.md`
scene-by-scene specs, Haiku ships. The mission linter + the 81-test runner suite are the safety
net. Optional Fable spend later: one tone/humor pass over the finished chapter-1 German.

---

**Handoff after session 72 (2026-07-06). Pre-G1 art blessing is COMPLETE ✅: the founder BLESSED
the modern pixel style and the game's art direction is now locked (no game code, zero spend).**
Eight mockup scenes of the Anmeldung vertical slice live in `preview/game-pixel-mockups/` (all
hand-authored in code because the sandbox blocks the free asset hosts; original + license-clean,
generators committed alongside the PNGs). Founder decisions, recorded in full in
`docs/DECISIONS.md` → "Game art direction (session 72)":
- **2D pixel form approved**; the GBA-authentic styling of scenes 1–6 **rejected** as dated
  ("reminds me of the 90's"). Those scenes stay as art-form proof, not style reference.
- **`scene7-modern-hell.png` is the blessed reference** ("i love this new mock up style!"):
  muted contemporary palette, modern Bürgeramt set, soft outlines, app-language UI (rounded
  floating cards, pills, bottom sheet, brand indigo accent), crisp half-size UI pixels over the
  chunky 240x160 world. G2 pack purchases must select against this reference.
- **In-game dark mode deferred** (liked, but "a bit of a stretch because of limited budget");
  tracked as backlog #31 in `docs/PROJECT_REFERENCE.md`. v1 game scenes are light-theme only.
Doc updates shipped with the blessing: `GAME_CONCEPT.md` Visuals pillar + open questions,
`GAME_IMPLEMENTATION_PLAN.md` guardrail + founder-decision list, the mockup folder README verdict.

Late-session addition: the founder also approved the game title **"Neuland"** from the
`GAME_DESIGN.md` proposals ("neuland is good"); city "Neustadt" + NPC cast stay unobjected
proposals, chapter-1 sign-off still open (recorded in `DECISIONS.md` and `GAME_DESIGN.md` §13).

**Next step:** start game plan G1 (`docs/plans/GAME_IMPLEMENTATION_PLAN.md`: Mission/Scene schema
+ `engine/mission.ts` + lint checks first, then scene renderers and the Anmeldung mission
content), building game UI surfaces to the scene-7 style. The narrative layer for G1 is the
drafted `docs/strategy/GAME_DESIGN.md` (see the next handoff below).

---

_Older handoffs (sessions 1–62 continued) are archived by ISO week under `docs/archive/status-log/`
(index: `docs/archive/PROJECT_STATUS_ARCHIVE.md`)._

**Content counts (verified from `src/data/*` on 2026-07-06):**
- Vocabulary: **530 words** (+2 Anmeldung documents in s73)
- Collocations: **396 Nomen-Verb pairs** (~36/theme; tripled from 132 in s40)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **12** (incl. behoerde)
- Exam sets: **10** (1 per theme · 6–7 min · sharedRubric)
- Redemittel: **72** entries
- Can-Do milestones: **25** (all 11 themes; founder-verified provenance)
- Lese-/Hörtexte: **10** texts / **30** comprehension checks (added s69; founder review pending)
- Game missions (Neuland): **1** (the chapter-1 Anmeldung boss, 9 scenes) · 6 NPCs · 4 key items
- Provenance rows: **1,124** (all with a `reference`; 1,099 `draft` / 25 `verified`)

**Dev branch:** reassigned each session; realign to `origin/main` after each squash-merge (`main` is
always the source of truth).

