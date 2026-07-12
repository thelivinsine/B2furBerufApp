# Project Status & Decision Log

_Last updated: 2026-07-12 (session 94: **Bibliothek scale-up Wave 1 — the Branche (sector) axis is
ACTIVE.** Founder decision un-parking the sector facet (supersedes the 2026-07-09 audit's park; plan in
`docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md`): `WorkSector` grew 5 → **11 values** (engineering,
construction, production, transport, beauty, sports added) and every sector got a starter pack, so the
**Branche filter now renders automatically on Wörter AND Kollokationen** (coverage floor cleared). Counts:
vocab 642 → **862** (+220, 20/sector), collocations 540 → **636** (+96 authored, 3 existing tagged),
Redemittel 72 → **84** (new sector-neutral `professionalIntro` category "Über Beruf & Fachgebiet
sprechen"), provenance 1,426 → **1,754 rows** (all new rows draft). Full pipeline re-run and green:
verify:facts 0 two-oracle errors, frequency subset + bins regenerated, verify:grammar 0 grammar flags,
verification tiers rebuilt, 116/116 tests, main chunk 73.0 kB. Waves 2–4 (sector depth, Redemittel
phrasebook, grammar canon) specced in the plan. Detail in the s94 handoff below.**
Prior, session 93: **Grammatik tab redesigned onto the shared Bibliothek browse
skeleton (PR #457).** The fourth Bibliothek tab now matches the other three at the structural level
(LibrarySwitcher header → toolbar with mobile filter toggle + Karten/Liste view switcher + transient fuzzy
search → content → Üben in the FilterRail footer / sticky mobile bar), with **Gruppe** as the primary
dropdown and **Stufe (CEFR)** as a facet (`grammarFacets()` in `lib/facets.ts`). Topic cards were redesigned
(emerald group tile, priority-rank chip, mono pattern strip, "Lernen →"), a compact Liste view added, and
the topic page became a focused **lesson**: hero, emerald Muster formula panel, Beispiele, Typische Fehler,
numbered Übungen with a live progress bar, a completion panel that hands over the next topic, and prev/next
navigation along the B2-marker priority spine ("Thema n von 10"). Browser-verified both breakpoints incl.
the full drill loop; gates green, main chunk 73.0 kB. Detail in the s93 handoff below.**
Prior, session 92: **Bibliothek browse pages — 14 founder UI-refinement rounds
(PRs #442–#455), all squash-merged.** The three browse tabs (Wörter/Kollokationen/Redemittel) were reworked
from the founder's phone screenshots: **search moved OUT of the filter panel** into a transient toggle (icon
by the bookmark) backed by a new forgiving matcher (`src/lib/fuzzy.ts`, Damerau edit-1 + umlaut/token
tolerant; Wörter search also surfaces a word's authored connections); the **HubHero page headers were
dropped** so the **LibrarySwitcher doubles as the page header** (lifted `shadow-soft` bar, active tab
bold+brand like a title, framer `layoutId` sliding pill — same on the ViewSwitcher); the full-page
SubThemePicker was replaced by an **"Unterthema" dropdown in the filter** (`FilterRail` `secondary` scope);
the filter tile gained **icon reset + close** controls (the word "Zurücksetzen" button removed) plus a
body-only `layout="panel"` mode; and on mobile the toolbar is a full-width `justify-between` row
[Filter · views · bookmark/search] with **Üben + word count in a sticky bottom action bar** so the list
scrolls above them. `src/lib/fuzzy.ts` + `tests/fuzzy.test.ts` added; `SubThemePicker` now unused (kept in
repo). Main chunk unchanged (~73 kB); `test:unit` 116/116. Per-round detail in the s92 handoff below.**
Prior, session 91: **Bibliothek views: desktop filter rail + view switcher + word
graph, then 9 founder refinement rounds.** From the founder's hand-drawn mockup: the three browse tabs
(Wörter/Kollokationen/Redemittel) got a URL-persisted view switcher (`?view=` Tabelle · Graph · Karten ·
Liste; Karten default), a generic sortable `DataTable` + compact list views per tab, an **Obsidian-style
force-directed word graph** on Wörter (canvas, d3-force in a lazy chunk; node size = wordfreq Zipf, color =
domain, edges = authored `related` terms + collocation noun/verb pairs; pan/pinch/zoom, tap-to-select with
neighbor highlighting), and a **grey collapsible filter tile** — the single filter surface on both
breakpoints (Suche + Thema/Kategorie `Select` dropdown + always-visible facet pill groups with live counts +
pinnable sections + an always-visible Üben footer). Main chunk unchanged (~73 kB). Shipped across **PRs
#431–#440**, all squash-merged to `main`; the per-round detail is in the "Resume here" handoff below.**
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

**Handoff after session 93 (2026-07-12). Grammatik tab redesigned onto the shared Bibliothek skeleton
(branch `claude/grammatik-section-redesign-v3gmv7`, PR #457).** Founder asked for a "complete
re-imagination" of Grammatik: follow the other three tabs' high-level concept (filters → content → Üben)
but with design freedom, and make it highly useful and intuitive for adult learners and job holders.
- **Hub = the s92 skeleton, exactly:** LibrarySwitcher page header, toolbar row `[Filter icon (mobile) ·
  ViewSwitcher · Suche icon]`, transient full-width fuzzy `SearchField` (over titleDe/title/purposeDe/
  pattern/group label), `FilterRail` on both breakpoints from ONE `filterRailProps` (desktop sticky rail,
  mobile AnimatePresence slide panel), sticky mobile bottom bar with Üben + "n Themen". **Gruppe** is the
  primary dropdown (control-choice rule: it's the "where am I" cut) and **Stufe (CEFR)** the facet, added
  as `grammarFacets()`/`GRAMMAR_FACET_IDS` in `lib/facets.ts` (100% coverage, cefr required since s84).
  Params `?group=`/`?cefr=`/`?view=`/`?topic=` are URL-persisted; `/grammar?topic=` deep links (search)
  still resolve.
- **Views (new `grammar/GrammarViews.tsx`):** Karten (default) = redesigned topic cards (emerald group
  icon tile, **priority-rank chip**, CEFR badge, purpose, truncated mono pattern strip, "n Übungen" +
  "Lernen →" affordance); Liste = numbered compact rows. No Tabelle (a lesson is not a row of atomic
  facts). Shared metadata moved to `grammar/grammarMeta.ts`: `groupMeta`, the B2-marker `groupOrder`,
  `orderedGrammar` (the flattened priority spine) and `topicRank`.
- **Lesson page (new `grammar/GrammarTopicView.tsx`):** hero (group tile, English eyebrow, titleDe,
  purpose, badges) → explanation card with an emerald **Muster** formula panel → Beispiele (speakable) →
  Typische Fehler (warning list) → **numbered Übungen with a live progress bar** (first-answer results,
  local state remounted per topic) → a **completion panel** ("Thema abgeschlossen · k von n richtig" +
  one-tap "Weiter: <next topic>") → prev/next cards along the spine + the kept "Wissen im Quiz testen"
  `/quiz` CTA. "Thema n von 10" in the top row; lesson scrolls to top on open. Rationale for the rank/
  spine emphasis: the audience is time-poor working adults, so the section answers "where do I start,
  what's next" without them deciding (top of the list = biggest B2 lever).
- **Verified in a real browser** (Playwright + the preinstalled Chromium against `pnpm dev`): hub Karten/
  Liste on desktop + mobile, filter rail counts, lesson desktop + mobile, and the full drill loop (5/5
  answered → XP in header → completion panel → "Weiter: Konjunktiv II" navigates). Gates green:
  typecheck, ESLint 0 errors, `test:unit` 116/116, build + prerender, `check:bundle` **73.0 kB**/400.
- **Founder follow-up round (same session, PR #458, from a live phone screenshot):** three lesson fixes.
  (1) No navigation → the **LibrarySwitcher tabs now render on top of the lesson** too (tapping
  Grammatik doubles as back-to-overview). (2) No Üben → **Üben added to the lesson** (inline gradient
  button on desktop, sticky bottom action bar above the nav on mobile), replacing the "Wissen im Quiz
  testen" `/quiz` CTA (`/quiz` stays reachable via practiceAreas). (3) Too much text → the English
  all-caps eyebrow was dropped from the hero, and the **Muster panel now leads** the card with the
  explanation **clamped to three lines** behind a "Mehr anzeigen"/"Weniger anzeigen" expander.
  Re-verified on the 390px viewport (tabs navigate out, Üben bar sticks while scrolling, expander
  toggles); all gates green again.
- **Founder follow-up round 2 (same session, PR #459):** the lesson hero still described the topic twice
  (German `purposeDe` in the hero + the English explanation in the card below) and carried a meta badge
  row (CEFR + group + "n Übungen"). Both removed: the hero is now **group tile + German title only**;
  the topic is described ONCE (the clamped explanation card) and the drill count already shows in the
  Übungen progress. CEFR/purpose remain on the hub topic cards, where they inform the choice.
- **Founder follow-up round 3 (same session, PR #460):** the Muster read as one mush (multiple pattern
  variants wrapping into each other) and the explanation as one paragraph chunk. Both are now split at
  RENDER time, no content-bank change: `pattern` splits on the authored `" · "` separator into **one
  variant per row** (emerald dot markers when >1; verified against all 10 patterns, e.g. Relativsätze
  becomes a 4-row Nom/Akk/Dat/Gen list), and `explanation` splits into **sentence bullets** with the
  first point shown and the rest behind the "Mehr anzeigen" expander (regex fallback keeps unsplittable
  text as one line). If future explanations use dotted abbreviations, revisit the sentence split.
- **Founder follow-up round 4 (same session, PR #461): German-first lesson + hold-to-peek EN.** The
  lesson text is now German by default with English as a press-and-hold peek, across the section:
  (1) new bank fields **`explanationDe` + `pitfallsDe`** on all 10 topics (AI-drafted German, EN
  originals kept parallel in order/length; **founder verify pending**, flagged in the type comments);
  (2) new **`grammar/EnPeek.tsx`** chip (pointer-capture hold, Space/Enter hold on keyboard, never a
  sticky toggle) placed top-right of the explanation paragraph (NOT the tile), on the pitfalls header,
  per example card (beside the SpeakButton, gloss hidden until held), and on each drill via a new
  `glossPeek` prop on GrammarDrillCard (**lesson only; the composed session keeps always-visible
  glosses**); (3) the "Mehr anzeigen"/"Weniger anzeigen" expander moved to the **bottom-right corner of
  the tile**. Peek verified in-browser (hold shows EN, release reverts to German); `lint:content` clean
  (no em dashes in the new German); all gates green. Drill `explain` feedback stays English (open
  question for the founder: author `explainDe` for 47 drills?).
- **NOT done / follow-up candidates:** per-topic drill progress is session-local only (persisting
  "topic mastered" would need progress-store/cloudSync thought); `BrowseToolbar` lost its last consumer
  (kept in repo like `FacetSheet`/`SubThemePicker`); Grammatik group icons could get bespoke marks later.

**Handoff after session 94 (2026-07-12). Bibliothek scale-up Wave 1: the Branche (sector) axis is
ACTIVE (branch `claude/bibliothek-scaleup-german-pros-slcnh5`).** The founder presents Genauly to
German-course classmates from all major professional sectors on 2026-07-13 and wants the Bibliothek to
be their single source of truth after the course; this **un-parks the sector facet** (founder decision
2026-07-12, superseding the 2026-07-09 audit's park; recorded in `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md`
§1 and `DECISIONS.md`).
- **Taxonomy:** `WorkSector` 5 → **11 values** (`+engineering`, `+construction`, `+production`,
  `+transport`, `+beauty`, `+sports`), mirrored in `lint-content.mjs`; labels in `facets.ts`
  (`SECTOR_OPTIONS`, care relabelled "Medizin & Pflege", hospitality "Gastronomie"); a sector facet was
  added to `COLLOCATION_FACETS` (vocab already had one). Rule kept: Branche = where you work, Thema =
  what you are doing; `transport` deliberately not named "Logistik" (theme-label clash).
- **Content Wave 1 (even spread, founder choice):** **+220 vocab** (20/sector, care extends the s43
  Pflege pack; bank 642 → **862**) and **+96 collocations** authored + 3 existing tagged
  (`c_sicherheitsluecke_schliessen`/`c_backup_erstellen` → it, `c_bestand_pruefen` → retail; bank
  540 → **636**), all with `cefr` + `sector` + full schema, spread across existing themes (care-pack
  pattern). Coverage: vocab 235/862 = 27%, collocations 99/636 = 15.6% — both clear the 15% floor, so
  the **Branche facet renders on Wörter AND Kollokationen automatically** (11 pill options, `?sector=`).
  **+12 Redemittel** in the new sector-neutral `professionalIntro` category ("Über Beruf & Fachgebiet
  sprechen", Briefcase icon added to `lib/icons.ts`), Redemittel 72 → **84**. **+328 provenance rows**
  (DWDS corpus-search references, draft) → **1,754 rows** total.
- **Verification (all green):** `lint:content` ✔; `build:oracles` refreshed → `verify:facts` **0
  two-oracle errors** (654 nouns, 98% coverage; the 6 review signals are pre-existing dual-gender
  headwords); wordfreq installed → `build:frequency-subset` + `build:frequency` regenerated (1429/1498
  binned); LanguageTool resolved → `verify:grammar` **0 grammar flags** (no warn signal touches the new
  items); `verify:cefr` + `build:verification` regenerated (linguistic tier 1266 → 1602); typecheck,
  ESLint 0 errors, `test:unit` 116/116, build + prerender, `check:bundle` **73.0 kB**/400.
- **Strategy doc:** `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` — the 11-sector taxonomy, Wave 2
  (deepen used sectors to 60–80 words + sector reading texts), Wave 3 (Redemittel 84 → ~150 via new
  speech-act categories: telephoning, emails, presentations, jobInterview, smallTalk), Wave 4 (grammar
  10 → ~24 topics, the missing B1–B2 canon list), the per-wave quality gate, and the floor math.
- **NOT done / follow-up candidates:** all 328 new provenance rows are `draft` (founder/native review
  pass pending); sector `ReadingText`s are Wave 2 (needs a `sector` field on the text schema + linter
  mirror when the first one lands); Wave 2 prioritization waits on classmate feedback after the
  2026-07-13 presentation.

_(Sessions 85-92's handoffs moved to `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`.)_
