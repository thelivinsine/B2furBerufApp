# Project Status & Decision Log

_Last updated: 2026-07-11 (session 91: **Bibliothek views: desktop filter rail + view switcher + word
graph.** From the founder's hand-drawn mockup: the three browse tabs (Wörter/Kollokationen/Redemittel) got
a persistent desktop (lg+) filter rail (Suche + Domain-grouped Thema/Kategorie rows + always-visible facet
pill groups with live counts; mobile keeps the locked toolbar + sheet), a URL-persisted view switcher
(`?view=` Tabelle · Graph · Karten · Liste; Karten stays default), a generic sortable `DataTable` + compact
list views per tab, and an **Obsidian-style force-directed word graph** on Wörter (canvas, d3-force in a
lazy chunk; node size = wordfreq Zipf, color = domain, edges = authored `related` terms + collocation
noun/verb pairs; pan/pinch/zoom, tap-to-select with neighbor highlighting). Main chunk unchanged at
72.8 kB. Shipped as PR #431, squash-merged to `main`.**
Prior, session 90: **Heute Üben/Spielen tile parity + subtle section color.** The Üben
map tile and the Spielen chapter-hero tile now share the exact same dimensions AND screen position (both
353px from top, 245×358px measured), so toggling tabs no longer shifts the tile: Üben's header + map are
pinned to the top with a fixed 1rem gap and the module pager is pushed to the bottom (`mt-auto`), keeping
the no-scroll phone fit. Added a subtle per-section color theme on the toggle only (**Üben = teal/accent +
a dumbbell icon, Spielen = orange + a play icon**; the tile mats keep a shared neutral gray `border-border`
after the founder found colored borders read poorly). Shipped across PRs #413/#414/#415, squash-merged to
`main`.**
Prior, session 89: **Public help/blog section `/hilfe` with SEO prerendering.** A login-free, bilingual
(DE/EN) help section explaining Üben and Spielen (a `/hilfe` hub + 6 lazy articles), genuinely SEO-friendly
via a build-time prerender (`scripts/prerender-help.mjs`, chained into `pnpm build`) emitting static HTML
per page (unique meta + Article/BreadcrumbList/FAQPage JSON-LD + full text in `#root`) and a regenerated
`sitemap.xml`. Shipped as PR #411, squash-merged to `main`.
Prior, session 88: **Heute design review + iterative polish, PRs #401–#409.** A
4-reviewer design panel + an iterated mockup Artifact set the founder's direction, then ~9 founder rounds
refined it. **Üben** tab: pixel canvas + stepper replaced by a **soft illustrated SVG city map** (route
solid to the current stop, white dots on completed stops, location pin + "Du bist hier"), a centered
"Lernpfad" title, the map as a native 3:2 block matching the Spielen hero (both in a white surface mat), one
state-aware CTA ("Jetzt üben" gradient / "Wiederholen" grey) with a slide transition, a mobile module pager
(dots + card swipe, desktop chevrons), and the four blocks distributed evenly with no page scroll.
**Spielen** hub (`NeulandHub`, shared with `/welt`): centered header + chapter hero with scrim-overlay CTA,
a dense mission checklist that in the Heute embed is a **fixed 3-row scroll tile** (scrollbar hidden,
next mission auto-centered on open), Kapitel-2 teaser, and the Schlüssel-Dokumente shelf removed. Plus
AccountMenu alignment/overflow polish. All behind founder-verified light+dark Playwright checks.
Prior, session 87: **Heute → Spielen now shows the full Neuland world hub** (shared
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

**Handoff after session 91 (2026-07-11). Bibliothek views: desktop filter rail + view switcher + word graph
(branch `claude/bibliothek-mockup-review-rcghlq`, PR #431).**

Founder shared a hand-drawn Bibliothek mockup (desktop: tab row, a 4-icon view switcher, card grid, right-hand
search + filter rail) and confirmed the intent in Q&A: (1) the four views are Tabelle / **nodal graph like
Obsidian** (all words, connections = which words go well together, node size = real-life usage) / Karten
(current) / Liste; (2) desktop-first but adapted to mobile; (3) the Thema/Kategorie filter belongs IN the
rail. Then "go ahead full speed." All three phases built, verified in a real browser (Playwright, desktop +
mobile, zero console errors), and shipped:
- **`features/shared/FilterRail.tsx`:** persistent right rail on lg+ for Wörter/Kollokationen/Redemittel
  inside a new two-column page grid (`lg:grid-cols-[minmax(0,1fr)_16rem]`, rail sticky with internal
  scroll). Suche on top (shared debounced `SearchField.tsx`, extracted from BrowseToolbar), then the primary
  scope as a row list (Domain-grouped Thema via `themeGroupsForMode`; Kategorie on Redemittel; capped
  `max-h-72` box so facets below stay discoverable), then every facet as always-visible pills with live
  what-a-tap-yields counts + zero-yield greying (same semantics as FacetSheet, but immediate commit, no
  draft/apply). Same URL params as mobile. **Mobile keeps the locked BrowseToolbar + FacetSheet untouched**
  (`lg:hidden` wrapper); the toolbar's trailing actions (Gespeichert/Üben) render in the meta row on desktop.
- **`features/shared/ViewSwitcher.tsx` (`?view=`, whitelist per tab, `karten` default + kept out of the
  URL):** Wörter = tabelle/graph/karten/liste; Kollokationen + Redemittel = tabelle/karten/liste; Grammatik
  untouched. **`features/shared/DataTable.tsx`** is the generic sortable table (asc→desc→bank-order cycling,
  German `Intl.Collator`, missing values sink, `usePagedList` incremental rows, own `overflow-x-auto` box;
  note: sort-header buttons need their own `uppercase` because Tailwind preflight resets it on buttons).
  Column defs + compact lists per tab: `vocabulary/VocabViews.tsx` (exports `SaveButton`),
  `collocations/CollocationViews.tsx`, `redemittel/RedemittelViews.tsx`. Vocab table sorts Häufigkeit by raw
  Zipf and strips articles for the Wort sort key.
- **The word graph (`vocabulary/WordGraph.tsx` + pure builder `vocabulary/wordGraph.ts`, pinned by
  `tests/wordgraph.test.ts`, 110 unit tests green):** graph of the CURRENTLY FILTERED vocab list. Edges from
  two authored sources only (no inference): `related` strings resolved to bank entries (normalizer strips
  der/die/das + ein-forms + "sich" + bracketed hints; unresolvable related terms are dropped, founder-confirmed)
  and collocations whose noun AND verb both resolve. Node radius = wordfreq Zipf (`frequency.ts`; no corpus
  evidence = min radius, never a fake claim), color = the 6 domains (legend under the canvas + n Wörter · m
  Verbindungen). Canvas-rendered (642 nodes smooth), d3-force (**new dep, 3.0.0**) with weak x/y centering so
  unlinked words stay in the cloud; sim pre-ticks 120 steps then settles gently; positions survive filter
  changes. Pan/pinch/wheel-zoom/node-drag; zoom-fades labels; tap selects a word → neighbors highlight,
  rest dims, and a detail card shows (word + SpeakButton + bookmark + CEFR/Häufigkeit/degree badges +
  example). Zoom +/−/fit buttons. **Lazy chunk** (`React.lazy` inside VocabularyTrainer, ~12 kB incl.
  d3-force); main chunk unchanged at **72.8 kB** / 400.
- Also fixed German: "n Worte" → "n Wörter" (meta row + FacetSheet apply label).
- Gates green: build + prerender, typecheck, ESLint 0 errors, `lint:content` pass, `test:unit` **110/110**,
  `check:bundle` 72.8 kB. Browser-verified: rail pill writes `?cefr=`, Thema row writes `?theme=`, all four
  views render desktop + mobile, graph click-select works, zero console errors.
- **Ship status:** shipped as **PR #431**, squash-merged to `main`; branch realigned after the merge.
  **Founder verifies the live site.**
- **Founder follow-up round (same session, PR #432):** the rail is now a **collapsible tile** (brand-tinted
  `bg-primary/10` header with "Filter" + active-count badge + chevron; whole panel expands/collapses), the
  **LibrarySwitcher moved into the left column** so the tab pills sit beside the filter tile on desktop,
  the **meta row + graph legend are centered on mobile**, and the duplicated word count was removed (the
  graph legend now shows only "n Verbindungen"; the word count lives in the meta row alone).
- **Founder follow-up round 2 (same session, PR #433):** the **Üben button moved to the bottom of the
  filter tile** as an always-visible `footer` slot (shows in collapsed state too; mobile keeps Üben in the
  toolbar, the desktop meta row keeps only Gespeichert on Wörter), and **every rail section got a pin**:
  the pin icon in a section header keeps that section (Thema/Kategorie or any facet group) visible while
  the panel is collapsed. Pins persist per tab in localStorage (`b2beruf.railPins`), verified across
  reload via Playwright.
- **Founder follow-up round 3 (same session, PR #434):** in the **graph view** the word count moved out of
  the top meta row and sits with the connection count at the bottom of the canvas ("586 Wörter · 673
  Verbindungen"); the meta row keeps only the view switcher + Gespeichert there. Other views (Tabelle/
  Karten/Liste) keep the word count in the meta row as before.
- **Founder follow-up round 4 (same session, PR #435):** the desktop filter tile was **too high** (it
  aligned with the tab row). Restructured all three browse pages so the **LibrarySwitcher tabs + the
  view-switcher meta row span the full width at the top**, and only the content + rail share the
  two-column grid below them, so the **filter tile now starts level with the first content card** (measured
  rail-top = card-top = 353px). This also matches the founder's original mockup (tabs across the top, filter
  panel beside the content).
- **NOT done / follow-up candidates:** graph for Kollokationen (decide after founder feedback); graph
  dark-canvas is theme-aware but in-graph label contrast could get a pass; `related` terms not in the bank
  could later render as satellite nodes; table column set per founder taste.

**Prior handoff after session 90 (2026-07-10). Heute Üben/Spielen tile parity + subtle section color theme
(branch `claude/ueben-spielen-layout-styling-h7fsvm`, PR #413).**

Founder: "keep the map/photo tile in üben/spielen same dimensions and fix them both in same position on the
screen. Also add a subtle color theme for the toggle buttons and the border padding." Then two follow-ups:
"use some other color instead of violet for üben" and "fill the üben icon when selected similar to spielen."
- **Tile parity (the core ask):** the tiles were already the same size (both 3:2 in a `p-2` surface mat,
  both inside the Dashboard `mx-auto max-w-md` wrapper), but their **screen position differed**: `UebenPath`
  used `flex … justify-between` (which pushed the map down) while the compact `NeulandHub` was top-aligned.
  Fix: Üben's header + map are **pinned to the top with a fixed `gap-4` (1rem)** matching Spielen (the s88
  "distribute evenly" rule is superseded by this explicit position request). Measured in a headless browser:
  **both tiles sit at the same top + `245×358px` below identically-positioned, page-centered titles** in
  both tabs. No jump on toggle. (A later founder round replaced the pager's `mt-auto` bottom-pin with a
  **`my-auto`-centered {card + pager} group + tight `space-y-3`** so the card drops down and the dots rise
  to sit just below it, killing the stranded card↔dots gap; header + map stay pinned, parity intact.)
- **Heading formatting (later founder round):** "Neuland" is now centered on the page **exactly like Üben's
  "Lernpfad"** (same `text-2xl`/`font-bold`; measured horizontal center = viewport center for both). The
  "Beta" chip is a **suffix, not part of the heading** — absolutely positioned off the h1's right edge and
  out of flow, so it no longer shifts "Neuland" off-center.
- **Subtle section color theme (final state after several founder rounds):** the active toggle button
  (`Dashboard.tsx`) lifts on the white pill and picks up a per-section tint. **Üben = teal/accent
  (`text-accent`) + a `Dumbbell` icon; Spielen = orange (`text-orange-500`) + a `Play` icon.** (History
  this session: first shipped Üben=indigo/Spielen=teal, then Üben recolored to orange on the founder's "not
  violet" note, then the two **swapped** to the final teal/orange, and Üben's `Zap` bolt replaced by the
  dumbbell.) Both active icons fill (`fillActive` flag): the Play triangle and the dumbbell's weight
  plates (a later founder round turned the dumbbell fill on; it reads fine at 16px).
- **Tile-mat border is neutral gray:** the s90 experiment with per-section colored mat borders was
  reverted at the founder's request ("colored borders don't look good"); both the Üben map mat and the
  Spielen hero mat use the shared muted **`border-border`**. The white `bg-surface` mat is preserved; the
  section color lives on the toggle only.
- **Filled active icon:** both active toggle icons fill (`fillActive`) — Spielen's `Play` triangle and,
  after a founder round, the Üben dumbbell's weight plates too (it reads fine filled at 16px).
- **Desktop adaptation (later founder rounds, PRs #423 then #425):** on desktop the start page was a narrow
  phone-width column stranded center-screen with big empty side margins. First shipped a **two-column** `lg`
  layout (#423, tile | practice·missions), but the **founder rejected it**. Reverted to **one column on all
  sizes** and adapted to desktop by **vertically centering** the whole start page instead (#425): the
  `Dashboard` root is `lg:flex lg:min-h-[calc(100vh-8.5rem)] lg:flex-col lg:justify-center`, so the focused
  column sits centered in the viewport rather than top-stranded. `UebenPath` takes natural height on desktop
  (`lg:min-h-0`, card/pager `lg:my-0`) so the Dashboard can center it. Mobile and `/welt` unchanged.
- **Desktop scrollbar fix + snappier motion (PR #427):** the single-column stack at `max-w-md` was ~801px
  tall on desktop, just over common laptop viewports, so the root `min-h-screen` forced a scrollbar.
  Narrowed the **desktop** column (mobile stays `max-w-md`) and made transitions snappier.
- **Size restore + directional tab slide (PR #429, later founder round):** the 22rem column from #427 read
  as too small ("components got reduced"). Restored the desktop column to **`lg:max-w-[26rem]`** (near
  mobile's `max-w-md`) and tightened the desktop toggle→content gap (`lg:space-y-3`) so the full-size stack
  still fits: **Üben scroll-free ≥768px, Spielen ≥~800px** (bigger components need more room, so below that
  Spielen can still scroll a little; inherent). Replaced the vertical fade on tab switch with a
  **directional horizontal slide** (right→left to Spielen, left→right to Üben) via `AnimatePresence`
  custom-direction + variants (~0.16s, reduced-motion safe). Verified both tabs at 768/800/832/900 + no page
  errors on switching, mobile unchanged.
- Gates green: build, lint 0 errors, `test:unit` 99/99, `check:bundle` **73.1 kB** / 400. Verified via
  Playwright (screenshots + measured scroll/bounding-box).
- **Ship status:** shipped across **PRs #413 (core), #414/#416/#417/#420/#424/#426/#428 (docs), #415 (color
  swap + neutral borders + dumbbell), #418 (center Neuland + tighten card/pager gap), #421 (fill dumbbell),
  #423 (desktop two-column, later reverted), #425 (revert to single column + desktop vertical centering),
  #427 (desktop scrollbar fix + snappier motion), #429 (restore desktop tile size + directional tab
  slide)**, all squash-merged to `main` (branch realigned after each). **Founder verifies the live site**
  (Pages deploys on merge; sandbox can't reach `*.github.io`; deploy runs confirmed green via the Actions
  API this session).

_(Sessions 85-89's handoffs moved to `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`.)_
