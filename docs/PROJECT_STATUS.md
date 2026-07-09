# Project Status & Decision Log

_Last updated: 2026-07-09 (session 85: **Heute page reworked into an Üben/Spielen start page**
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

**Handoff after session 85 (2026-07-09). Heute page reworked into an Üben/Spielen start page, shipped
to `main` (branch `claude/genauly-start-page-preview-1ih2vi`).**

Founder shared a hand-drawn "Start page" sketch (Willkommen header + a Spielen/Üben toggle driving either
a Neuland carousel or a Last-Session + Fortschritt view). Iterated it as an HTML Artifact (Üben first +
default, minimal Spielen card), then implemented it **scoped to the Dashboard body only** (founder:
"keep the left sidebar and top row intact, only change the contents within the Heute page").
- **`src/features/dashboard/Dashboard.tsx`:** kept the greeting/orientation ring row; added an
  **Üben/Spielen** segmented toggle (Üben default). **Üben** = a session card reusing `/session`
  (sized from daily goal + `dueCount`, label toggles Weitermachen/Session starten off the existing
  `totalSessions` completion hook, **no new persisted state**) + a **four-ring Fortschritt row**
  (Tagesziel/Serie/Wörter/Fällig) derived purely from the progress store, no vocab-bank walk.
- **`src/features/dashboard/NeulandCarousel.tsx` (new, lazy):** minimal indigo mission carousel over the
  authored Neuland missions (arrows + dots), same `React.lazy` pattern as the old CityStrip so the
  mission bank stays off the eager path. "Spielen" → `navigate('/welt?mission=<id>')`.
- **`src/features/welt/Welt.tsx`:** reads an optional `?mission=` param to auto-open that mission
  (unchanged when absent; clears the param on exit).
- **Removed from Heute (founder-confirmed):** the `CityStrip` city strip and the 3 Situationen chips.
  Both components remain in the repo, just not rendered on Heute.
- Verified in the real app via Chromium (both tabs render, no page errors). Gates green: build,
  lint (0 errors), lint:content, test:unit (97), check:bundle (83.8 kB, budget 400). **Founder verifies
  the live site.** CLAUDE.md bundle note updated (NeulandCarousel is the new lazy Dashboard element).
- **Follow-up layout pass (same session):** the greeting + the little conic streak/goal ring moved OUT
  of the Heute body INTO the global top row (`AppShell` header: greeting left, ring right, replacing the
  old "Willkommen zurück" text + flat streak pill); the Üben/Spielen toggle is now centred; the
  "Sichere deinen Fortschritt" nudge (`SaveProgressBanner`, new `variant="sidebar"`) moved to the
  bottom-left of the desktop `Sidebar` (mobile keeps the Heute-top banner via `lg:hidden`); the sidebar's
  "Bereit für die Prüfung?" card was removed.
- **Heute Fortschritt redesign (founder chose "Option B" from a comparison Artifact):** the four
  identical Fortschritt rings were the problem (a count inside a meaningless ring). Replaced with the full
  Option B: a **Tagesziel hero bar** (gradient progress) + a **7-day activity heatmap** (shaded by each
  day's XP vs goal, today ringed) + a **3 icon-stat row** (Serie/Wörter/Fällig, told apart by icon +
  colour), all from the progress store (no bank walk). The header streak icon is now a **horizontal chip**
  (flame + number + "Tage" side by side, goal ring around the flame) instead of the flame-stacked-on-
  number ring.
- **Dedicated Fortschritt page (`/analytics`):** removed the **CityStrip icon tray** (the row of six
  domain-building icons) from the top, at the founder's request. The `CityStrip` component stays in the
  repo; it is just no longer rendered on `/analytics`. (An earlier note here mis-stated that the Heute
  icon-stat row was dropped; it was not, it is the /analytics city strip that was removed.)

**Prior handoff after session 84 (2026-07-09). Bibliothek categorization: audit delivered AND the full
implementation shipped to `main` (branch `claude/bibliothek-categorization-analysis-mtqo5o`).**

**Part 2 of the session (after the founder locked all five decisions): every planned unit shipped.**
- **Founder decisions (all locked, recorded in the implementation plan):** Branche parked (field stays,
  UI hidden until a sector has depth); Redemittel CEFR backfill yes; Häufigkeit badge + chart; Domain
  grouped under Mode ("Mode on top": Mode pre-selects which domains show); Amtssprache axis parked.
- **PR #379:** facet coverage floor in `lib/facets.ts` (`MIN_FACET_COVERAGE` 15% / `MIN_FACET_VALUES` 2;
  visibility follows coverage, never Mode), Büro deleted from `WorkSector` (+11 tags), `WorkSituation`
  retired entirely (+14 tags; linter errors on reintroduction).
- **PR #380:** Grammatik joins `BrowseToolbar` (search + Gruppe dropdown with counts, no facet sheet);
  topics reordered by B2-marker priority; `FacetSheet` renders nothing at 0 groups.
- **PR #381 (polish):** `diplomatic` register folded into `formal`; Redemittel inner tabs dropped, ONE
  filter pipeline, Register as inline chips; Kollokationen got dropdown counts + `SubThemePicker`
  (`?sub=`); the silent CEFR band default is now a removable "Stufe: bis X" chip on all three list tabs;
  a11y/microcopy tidy (search aria-label, no "0" on disabled pills, ScopeChip removed).
- **PR #382 (Häufigkeit):** new `pnpm build:frequency` generates `src/data/frequency.ts` from the vendored
  wordfreq Zipf subset (1116/1182 binned core/häufig/Fachsprache; <1.5 Zipf incl. compounds honestly
  unbinned); Häufigkeit facet + card label on Wörter/Kollokationen; Fortschritt "Wortschatz nach
  Häufigkeit" chart (mastery-overlaid, tap deep-links). **Also fixed the pre-existing black-charts bug:**
  every Analytics chart referenced non-existent `var(--color-*)` vars, now `hsl(var(--*))`.
- **PR #383:** Domain-grouped theme dropdown on Wörter + Kollokationen (`lib/themeGroups.ts`, Mode
  pre-selects domains; `SelectGroup`/`SelectLabel` added to ui/select; `BrowseToolbar` takes grouped
  options) + the per-learner **Lernstand** facet (`?srs=`, neu/lernen/wiederholen/gemeistert mirroring
  the card badges).
- **Redemittel CEFR backfill (final PR):** all 72 phrases AI-draft-tagged (A2 3 · B1.1 19 · B1.2 27 ·
  B2.1 20 · B2.2 3); each card shows its level badge so the founder can review in the UI. **FOUNDER
  REVIEW PENDING** on these 72 draft tags. The level band default is now live on the tab (a B1 learner's
  default hides only the 3 B2.2 phrases, escapable via the Stufe chip).
- All PRs verified with Chromium smoke tests on the built app + full gates (build, lint:content,
  test:unit 97, lint 0 errors, bundle 83 kB). **Founder verifies the live site.**
- **P2 + P3 also shipped (PR #385, founder follow-up prompt):** `GrammarTopic.cefr` on all 10 topics
  (AI-drafted, founder verify pending; badge on cards + topic view; linter completeness check); the
  control-choice + axis rules codified in the `facets.ts` header and a locked `docs/DECISIONS.md`
  section; `counterpart`/`taskType` CUT (0-tagged, no plan, zero data lost; linter errors on
  reintroduction). **Nothing from the audit roadmap remains unshipped**; open items are founder
  reviews only (72 Redemittel + 10 grammar cefr drafts).

**Part 1 of the session (the audit itself):**

Founder asked for a thorough report on the Bibliothek's categorization/filters (define Thema vs Situation
vs Branche, audit the weak/wrong filters, judge his ideas, make it marketplace-ready). Delivered
**`docs/plans/BIBLIOTHEK_CATEGORIZATION_AUDIT_2026-07-09.md`** (full report + verbatim red-team appendix)
and a visual Artifact, from a codebase fact-audit + a 7-agent expert panel + red-team.

**Verdict: the taxonomy is sound but *looks* broken; fix the tells, do not redesign.** The settled calls
(next session can implement the P0/P1 quick wins straight from the doc's §10 roadmap):
- **P0, no content, no risk:** add a **facet coverage floor** to `lib/facets.ts` `facet()` (hide any facet
  with <3 populated values / <15% coverage, not just empty options) and stop gating facets on
  `mode==='work'`. This instantly retires the two broken-looking filters (Branche 4%, Situation 2.2%).
- **P0:** delete the `office`/**Büro** value from the `WorkSector` union (+ `WORK_SECTORS` lint mirror),
  retag its 11 words. Büro is a category error (every industry has an office).
- **P0:** retire the `workSituation` facet (it duplicates Thema; `meeting` vs theme `meetings` is a naming
  clash). Situation = sub-theme, one topic spine Domain → Thema → Sub-theme.
- **P1:** Grammatik gets a search box + `group` dropdown + reorder-by-B2-priority (no facet sheet for 10
  items); add the Thema dropdown to Kollokationen (data already present); visual-bug batch.
- **P1 (the one net-new feature):** generated `frequency.ts` from the already-vendored
  `scripts/vendor/german-frequency-subset.json` → a `Häufigkeit` badge + facet + one honest Fortschritt
  composition chart. Never a "most-used words" leaderboard.
- **Free high-value axes nobody had proposed:** surface the existing **Domain** layer as the spine, and add
  an **SRS-state** filter ("fällig / lerne ich gerade / gemeistert") from FSRS data already on every card.
- **Open founder decisions (doc §11):** park vs cut Branche; backfill Redemittel CEFR or not (no themeId
  either way); frequency badge-only vs badge+chart; Domain-under-Mode layering; Amtssprache axis later/never.

---

_Older handoffs (sessions 1–83) are archived by ISO week under `docs/archive/status-log/`
(index: `docs/archive/PROJECT_STATUS_ARCHIVE.md`; sessions 69–83 are in the W28 file)._

**Content counts (verified from `src/data/*` on 2026-07-07):**
- Vocabulary: **642 words** (+28 each for Arzt, Wohnen, Bank, Bildung in s75)
- Collocations: **540 Nomen-Verb pairs** (~36/theme; +36 each for Arzt/Wohnen/Bank/Bildung in s75)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **20** (s75 daily-life set + s80 2nd daily-life scenarios: Apotheke/arzt, Wohnungsmangel/wohnen, Karte sperren/bank, Prüfungsanmeldung/bildung, all level 2)
- Exam sets: **15** (10 workplace + 5 daily-life: behoerde/arzt/wohnen/bank/bildung, added s80 · 6–7 min · sharedRubric)
- Redemittel: **72** entries
- Can-Do milestones: **37** (all 15 themes; workplace/behoerde founder-verified, daily-life packs draft)
- Lese-/Hörtexte: **22** texts / **66** comprehension checks (+2 each for Arzt/Wohnen/Bank/Bildung in s75; +1 each in s80 covering a new sub-theme per daily-life theme)
- Themes: **15** (10 workplace + `behoerde` + `arzt` + `wohnen` + `bank` + `bildung`; all six domains now populated)
- Game missions (Neuland): **6** = complete Kapitel 1 (1.1 Willkommen, 1.2 Fahrkarten-Automat, 1.3 SIM-Karte, 1.4 erster Einkauf, 1.5 Dach über dem Kopf, 1.6 Anmeldung boss; **35 scenes**; s83 added 2 `hotspot` + 2 `automat` re-skins, removed 2 now-unused cutscenes) · 11 NPCs · 7 key items · scene kinds: cutscene/websiteParody/loadout/listening/**hotspot**/**automat**/dialogueBattle/formCloze
- Provenance rows: **1,426** (all with a `reference`; 1,401 `draft` / 25 `verified`)
- Verification tiers (Layer C, generated `src/data/verification.ts`): **25 human · 1,266 linguistic · 1 facts · 116 provenance** (1,292 machine-attested)

**Dev branch:** reassigned each session; realign to `origin/main` after each squash-merge (`main` is
always the source of truth).

