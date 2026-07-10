# Project Status & Decision Log

_Last updated: 2026-07-10 (session 87: **Heute → Spielen now shows the full Neuland world hub** (shared
`NeulandHub` extracted from `/welt`, replacing the mission carousel; play still deep-links to `/welt`), and
the **Neuland game tile was removed from the Anwenden hub**. Prior, session 86: **Heute redesign + header/bottom-bar cleanup** — header slimmed to logo/streak/account (Search/Theme/Mode removed; Theme→account menu; Modus→Einstellungen), bottom bar Mehr→Einstellungen with the More sheet retired and a reorder-only easter egg, and the **Heute Üben tab rebuilt as a pixel Neuland city-map learning path** (the daily-goal ring moved to Fortschritt). Prior, session 85: **Heute page reworked into an Üben/Spielen start page**
(from the founder's start-page sketch): a new segmented toggle where **Üben** (default) reuses the
existing composed-session feature plus a store-only four-ring Fortschritt row, and **Spielen** is a
lazy-loaded Neuland mission carousel deep-linking into `/welt?mission=<id>`. The sidebar + top row are
untouched; the city strip and Situationen chips were removed from Heute (components kept in the repo).
Prior, session 84: **Bibliothek categorization audit + FULL implementation
shipped.** Audit doc + visual Artifact, then all five decisions locked with the founder and every planned
unit built and merged the same session (PRs #379–#383 + the Redemittel CEFR backfill): facet coverage
floor (Branche/Situation retired from UI, Büro deleted), Grammatik toolbar + B2-priority order, polish
batch (register fold, Redemittel restructure, Kollokationen parity, visible level chip), the generated
Häufigkeit signal (facet/badge/chart + the black-charts CSS-var fix), Domain-grouped theme dropdown +
Lernstand (SRS) filter, and 72 AI-drafted Redemittel CEFR tags pending founder review. See the "Resume
here" block. Prior: session 83: **G2 variety rungs 1–2 shipped.** Rung 1 (PR #374): the `hotspot`
scene kind, one generic tappable-stage layer (catalog #2/#7/#18) where the player proves comprehension by
TAPPING the right place on the pixel stage, used in 1.1 (departure board) + 1.4 (shelf search). Rung 2
(PR #375): the `automat` (Keypad) scene kind (catalog #8), a step-by-step rendered machine with a
wrong-key buzz and no bars; **re-skinned mission 1.2 (ticket machine) and the 1.4 Leergut beat off the
dialogueBattle**, so a machine feels like a machine and there is one fewer battle. Both kinds: closed-union
member + pure runner + pixel renderer + linter + runner tests. Then a polish fix (PR #376): hotspot targets
restyled from floating translucent bubbles to solid pixel sign-plates after founder feedback. Finally, on
a founder "the story/missions are weak" prompt, shipped four Neuland story-research docs (PR #377):
`NEULAND_PRIMER.md`, `BRAINSTORM_TOOLKIT.md`, `STORY_MISSION_BRAINSTORM.md`, `LANGUAGE_RPG_RESEARCH.md`.**
Prior, session 82: **Neuland game-visuals fix + two G2 direction decisions.** The
blank `terminal`/`laden` stages (16 of Kapitel 1's scenes) got code-authored placeholder backdrops,
transit hall + shop in `welt_assets.py`, wired into `SETTING_ART` (PR #368). The founder then
**re-sequenced G2, scene variety before plumbing** (hotspot layer → Keypad/Automat kind + 1.2 re-skin →
type-under-timer, then composer/fetch-quest/Supabase migration; PR #370) and **moved the external
playtest to the END of the full build** (G2 + Kapitel 2–6 + G3 city; the playtest crowd is B2 learners
and Kapitel 1 is B1.1–B1.2; founder stays the per-chapter internal tester; a chapter-select entry joined
the build list; PR #371). The plan's model map now covers the new work (PR #372).
Prior, session 81: **G2 kicked off, founder gave the go. Authored
the rest of Neuland Kapitel 1 (missions 1.1–1.5); Chapter 1 now complete end-to-end (6 missions, 1.1→1.6 boss).**
Earlier, session 80: **top-value tasks + daily-life depth + SEO, 4 PRs to `main`**.
**#360** closed EU AI Act #21 (documented Art. 6(3) risk assessment `docs/strategy/AI_ACT_RISK_ASSESSMENT.md`;
not-high-risk/limited-risk) and shipped the full SEO surface (Open Graph + Twitter + canonical + JSON-LD
WebApplication/FAQPage in `index.html`, `robots.txt`, `sitemap.xml`, landing FAQ + how-it-works) plus 4
daily-life reading texts. **#361** added 5 daily-life exam sets (exam-prep parity across all life domains).
**#362** added a 2nd branching dialogue per newest daily-life theme (dialogues 16→20). **#363** added a
real 1200×630 OG share image (`public/og-image.png`, generator `preview/og-image/make-og.mjs`). Counts now:
642 vocab · 540 collocations · 22 texts/66 checks · 15 exam sets · 20 dialogues · 1,421 provenance rows.
Prior, session 78: **data strategy Phase B + Phase C SHIPPED** (Layer 3 linguistic engine `verify:grammar`
+ `verify:cefr`, warn-only; Phase C trust model → generated `src/data/verification.ts`, `/sources` tier
badge; `DATA_STRATEGY.md` → v1.4). Prior, session 75: **four daily-life content packs shipped** (Arzt,
Wohnen, Bank, Bildung), themes now 15 (was 11), **all six top-level domains populated**.
**G2 is GO (founder greenlit 2026-07-08, session 81)**: zero-spend, incremental, playtest-first. The
parked groundwork branch `claude/neuland-g1-g2-feedback-wkf28n` was NOT rebased (189 files, badly diverged
since s74); instead the two draft missions (1.1/1.2) were extracted and re-authored against current `main`.
The working branch is reassigned every session, so **`main` is always the source of truth**. Product name:
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

**Handoff after session 87 (2026-07-10). Heute → Spielen now shows the full Neuland world hub; game
tile removed from Anwenden (branch `claude/game-tile-removal-nav-hi37z5`).**

Founder: the `/welt`-style Kapitel/mission list should open under **Spielen** in Heute (not the minimal
carousel), and the **Neuland game tile should be removed from the Anwenden hub**. Implemented:
- **Extracted the shared `src/features/welt/NeulandHub.tsx`** (the presentational chapter-section +
  mission-list + Schlüssel-Dokumente view, taking an `onPlay(mission)` callback). `Welt.tsx` now renders
  it with `onPlay={setActive}` (inline full-screen `MissionPlayer`, focus mode) and is much smaller.
- **`src/features/dashboard/SpielenHub.tsx` (new, lazy)** replaces `NeulandCarousel.tsx` (deleted): the
  Spielen tab renders `NeulandHub` with `onPlay` = `navigate('/welt?mission=<id>')`, so play still happens
  on the `/welt` route where the full-screen player + focus mode are wired (no chrome/z-index regression).
  Deep-link auto-open in `Welt.tsx` is unchanged. Kept lazy so the mission bank stays off Heute's eager path.
- **`src/features/anwenden/AnwendenHub.tsx`:** removed the "Neuland" (`/welt`) card + its `Gamepad2`
  import; grid went `lg:grid-cols-4` → `lg:grid-cols-3` for the remaining 3 cards (Sprechen/Schreiben/Prüfung).
- **`src/features/dashboard/UebenPath.tsx` (follow-up):** the Üben tab's "Als Nächstes" tile button used to
  enter the game (`/welt?mission=<id>`). Founder: the Üben tab should let you **practise a mission's content,
  not play it**. Button relabelled **"Üben"** and now opens a composed practice session scoped to the next
  mission's theme (`/session?theme=<mission.themeId>`), reusing the existing session composer's theme scope
  (biases the vocab/quiz/reading pools). Game entry stays under Heute → Spielen and `/welt`.
- **Dark mode for the Neuland Heute surfaces (founder chose "Map + Heute tiles"):** in dark mode the Üben
  city map and the Spielen tiles/backdrop used to render as bright light surfaces against the dark app.
  Now theme-aware:
  - **Üben map** (`UebenPath.tsx`): the `<canvas>` `drawCity` takes an `isDark` flag and picks `DARK_PAL`
    vs `LIGHT_PAL` (deep muted grass/roads/pavement/water/background-buildings); the glowing cyan route and
    the colour-coded landmark buildings stay vivid (a dark-map style). Theme read via a new reactive
    `useIsDark()` hook in `lib/useTheme.ts`; redraws on theme change.
  - **Spielen tiles** (`NeulandHub.tsx`): the mission cards were re-styled from the pixel `GameCard` to the
    **same app-tile language as the Üben "Als Nächstes" tile** (`rounded-[20px] border-border bg-surface` +
    the shared soft shadow, gradient play button, theme-aware Boss/Beta badges), so they're dark in dark
    mode and consistent across both tabs. `PixelStage` gained an opt-in `themed` prop (hub only) that dims
    the bright daytime backdrop art in dark mode.
  - In-mission `MissionPlayer` scenes remain light-only (locked, backlog #31): the pixel atoms in
    `stage.tsx` default to fixed light; only `NeulandHub` passes `themed`. Verified light + dark for both
    tabs via headless Chromium screenshots before shipping.
- Gates green: build, typecheck, lint (0 errors), check:bundle **71.7 kB** / 400. Docs updated: CLAUDE.md
  (bundle note + the locked mobile-bar Spielen + Üben-tile lines + the game-art hub-theming note), this
  handoff, s85 handoff archived to W28, prompt log 265–267.
- **Ship status:** on the branch, gates green. **Founder verifies the live site after merge.**

**Prior handoff after session 86 (2026-07-10). Heute page polished + header/bottom-bar cleanup (branch
`claude/page-polish-icon-review-dbmp0v`).**

Founder ran a "panel of experts" brainstorm on the Heute screen, chose **Option B** from a 3-mockup HTML
Artifact, and locked the top-row icon cleanup. Implemented across the app (gates green: typecheck, lint 0
errors, test:unit 97, build, check:bundle **74.9 kB** / 400):
- **Header (`AppShell.tsx`):** now only **logo · streak · account**. Removed the Search icon (⌘K +
  desktop Sidebar search remain; mobile has no global-search entry, founder choice); removed `ThemeToggle`
  (moved into the `AccountMenu` dropdown as a Hell/System/Dunkel row); removed `ModeSwitcher` (Modus moved to
  **Einstellungen → Lernen**); dropped the "Genauly" wordmark on mobile. The streak pill lost its
  goal-gauge ring (goal now lives on the dashboard ring).
- **Bottom bar (`BottomTabBar.tsx`):** **Einstellungen replaced "Mehr"** as the fixed last slot (plain
  NavLink to `/settings`); the **More sheet was retired** (`MoreSheet.tsx` deleted). The three content
  sections are always visible and reorder via a **long-press easter egg** (jiggle + drag, no +/X badges; a
  transparent layer means "tap anywhere to finish"). Home + Einstellungen fixed. `moreOrder` is now
  legacy/unused.
- **Heute Üben tab = Neuland city-map path** (`features/dashboard/UebenPath.tsx`, new, **lazy**). After a
  round of HTML previews the founder chose a bird's-eye **pixel Neuland city map** as the Üben tab (progress
  already lives in the header + Fortschritt, so Üben orients instead of repeating it). A low-res canvas
  (176×132) upscaled crisp draws a street grid, background buildings, a park and pond, and four Kapitel-1
  focus buildings (Bahnhof/Laden/Zuhause/Amt) bound to real mission ids; **stop state comes from
  `missionsDone`** (done ✓ / current "Du bist hier" pin / locked). One glowing cyan route runs to the current
  stop, the rest is a dotted upcoming leg (no fog, per founder). A **centered legend** names the stops, and
  an **"Als Nächstes" tile** (Kapitel left, green status right, no subtitle) sends the next mission →
  `/welt?mission=<id>`. `Dashboard.tsx` is now tiny (toggle + two lazy tabs); the **goal-ring moved to
  Fortschritt** (`Analytics.tsx` Tagesziel card). Option B (goal-ring/heatmap/stat-tiles on Heute) was the
  intermediate step and is gone.
  - **Polish pass (same session, founder "looks unfinished/cheap"):** stood up headless-Chromium
    screenshotting (`/opt/pw-browsers`, see the harnesses in scratchpad) to iterate on the real render.
    The map was **simplified** (removed on-map flags/lock seals; state lives in the legend), the stops were
    re-laid as a **tour (Bahnhof→Laden→Zuhause→Amt)** so none is stacked under another (fixed a
    banner-collision bug in the fresh-user state), the pill legend became a proper **stepper** (connected
    dots, done/current/locked), the tile was refined (green tag, no subtitle, bigger button), and the map
    was made **taller** so the hero fills the screen. Verified mid + fresh states before porting. The
    reviewed design previews are committed under **`preview/heute-redesign/`** (Option B, the 3 Üben
    concepts, Concept C, and the final Üben-tab page).
- **`Settings.tsx`:** added the Lernmodus selector to the Lernen card; removed the obsolete "Navigation
  anpassen" pin-picker card (the new bar has no add/remove).
- **Deleted:** `MoreSheet.tsx`, `ThemeToggle.tsx`, `ModeSwitcher.tsx`. Docs updated: CLAUDE.md (the locked
  mobile-bar section + Modus line + bundle note), this handoff, `DECISIONS.md`, prompt-log 254–258.
- **Ship status:** on the branch, gates green. **Founder verifies the live site after merge.**

_(Session 85's handoff moved to `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`.)_
