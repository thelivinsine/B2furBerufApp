# Project Status & Decision Log

_Last updated: 2026-07-08 (session 81: **G2 kicked off, founder gave the go. Ported chapter-1 missions
1.1 (Willkommen) + 1.2 (Fahrkarten-Automat) from the parked draft onto `main`; Neuland now has 3 missions.**
Prior, session 80: **top-value tasks + daily-life depth + SEO, 4 PRs to `main`**.
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

**Handoff after session 81 (2026-07-08). G2 kicked off: founder greenlit the game build (zero-spend,
incremental, playtest-first), and the first increment shipped.** After a Q&A on the game roadmap and the
G2 cost boundary (only paid items are optional pixel-art packs + Aseprite, ~30–60 EUR one-time; free path
exists), the founder said go. First increment: **ported chapter-1 missions 1.1 "Willkommen in Neuland"
(airport arrival, passport-control battle, station-announcement listening, meet Jonas) and 1.2 "Der
Fahrkarten-Automat" (ticket-machine battle, Zone-AB lesson) from the parked draft onto current `main`.**
- **Did NOT rebase the parked branch** `claude/neuland-g1-g2-feedback-wkf28n` (189 files, diverged since
  s74, almost all already on `main` via G1). Extracted only the two draft missions and re-authored them
  against the CURRENT schema.
- **Small contained schema extension:** added a `terminal` scene setting (airport/station; neutral stage +
  "Bahnhof" caption for now, real backdrop is a later art task) and an optional per-scene `label` (stage
  caption override). Mirrored `terminal` in `lint-content.mjs`, threaded `label` through the
  Cutscene/Listening/Battle renderers. Added NPCs `npc_beamter`/`npc_automat`, key items
  `ki_reisepass`/`ki_fahrschein`, 2 provenance rows (draft).
- **Both missions:** travel-theme, B1.1, cutscene → dialogue battle → payoff, each with a scaffolded-retry
  lose path (failure-as-content, no lockout). Neuland now has **3 missions** (1.1, 1.2, 1.6 boss).
- **Gates green:** `lint:content` (3 missions / 18 scenes / 8 NPCs / 6 key items / 1423 rows), `build`,
  `check:bundle` (83 kB, game stays lazy), `test:unit` (85), `lint` (0 errors).

**G2 next rungs (not yet built):** missions **1.3 (Die SIM-Karte)**, **1.4 (Der erste Einkauf** + Pfand
economy**)**, **1.5 (Ein Dach über dem Kopf** / Wohnungsgeberbestätigung**)** to complete Kapitel 1; then
recurring NPCs polish, FSRS-driven recurring-mission composer, failure-as-fetch-quest loop. **Prerequisite
for cloud-syncing game state:** the Supabase migration adding `missions_done`/`key_items` columns (an
unknown column fails the whole `progress` upsert; game state is local-only until then). Playtest gate
follows once Kapitel 1 is complete. Founder still verifies live and reviews the draft German.

---

**Handoff after session 80 (2026-07-07). Top-value tasks + daily-life depth + SEO, 4 PRs shipped to
`main` (branch `claude/top-value-tasks-842u60`).** PRs this session: **#360** (Art. 6(3) risk assessment +
SEO meta/OG/JSON-LD/robots/sitemap + landing FAQ + 4 reading texts), **#361** (5 daily-life exam sets),
**#362** (4 second daily-life dialogues), **#363** (1200×630 OG share image). The founder asked for the
top-3 value-add tasks from the docs, then "work on all three now", then kept going with "continue" /
"work on seo task". Delivered, all gates green:
1. **EU AI Act #21 fully closed.** The Art. 50 transparency *copy* was already live (WritingHub
   point-of-use notice + "KI-generierte Rückmeldung" label + PrivacyPolicy DE/EN AI section). The missing
   piece, the documented **Article 6(3) risk assessment**, is now on file:
   **`docs/strategy/AI_ACT_RISK_ASSESSMENT.md`** (v1.0). Assesses Genauly as **not high-risk /
   limited-risk**, relies on the Art. 6(3) narrow-task derogation, and flags **profiling** as the single
   point counsel must confirm (#15); lists the flip conditions (profiling creep, institutional gating,
   summative assessment) and maps our provenance work to Art. 10.
2. **SEO + landing depth (#10/#11/#12).** `index.html` gained Open Graph + Twitter-card meta, canonical,
   keywords/author, and two **JSON-LD** graphs (WebApplication + FAQPage; both validated, CSP-safe as
   non-executable data blocks). Added **`public/robots.txt`** + **`public/sitemap.xml`** (5 public routes).
   The landing page gained a **"Wie funktioniert Genauly?"** 3-step strip and a **6-item FAQ**
   (`<details>` accordion mirroring the JSON-LD).
3. **Daily-life content deepened.** +4 `ReadingText`s (18→**22**, checks 54→**66**), one per newest
   daily-life theme, each covering a **new sub-theme** with a **new kind**: `tx_arzt_merkblatt_antibiotika`
   (announcement, arzt.behandlung), `tx_wohnen_aushang_heizung` (announcement, wohnen.probleme),
   `tx_bank_letter_lastschrift` (letter, bank.zahlung), `tx_bildung_voicemail_pruefung` (voicemail,
   bildung.pruefung). +4 provenance rows (all `draft`, founder review pending), 1408→**1412**.

**Gates green:** `lint:content` (22 texts / 66 checks / 1412 rows), `build`, `check:bundle` (83 kB),
`lint` (0 errors), `test:unit` (85 pass). **Follow-ups:** (a) the 4 new texts read as `unverified` tier
until the next `build:verification` sweep (needs the grammar sidecar; deferred, not a gate); (b) a proper
1200×630 OG image would beat the square PWA icon now referenced; (c) founder still verifies live SEO/FAQ
and reviews the draft German. `#21` marked closed in `PROJECT_REFERENCE.md`. **All merged live via PR #360.**

**Follow-on (same session 80, after the founder confirmed live and picked "deepen daily-life content"):**
added **5 exam sets** (`examSets` 10→**15**), one per daily-life theme (behoerde/arzt/wohnen/bank/bildung),
so **every life domain now has an exam-prep speaking simulation** (previously workplace-only). Each is a
telc-style **joint-planning** task referencing the theme's existing scenario (`ex_behoerde`→sc_anmeldung,
`ex_arzt`→sc_arztbesuch, `ex_wohnen`→sc_wohnungsbesichtigung, `ex_bank`→sc_kontoeroeffnung,
`ex_bildung`→sc_sprachkursberatung), reusing `sharedRubric`. +5 `exam_set` provenance rows (draft),
1412→**1417**. `ExamHub` maps over all sets with no theme filter, so they surface immediately. Gates green
again (`lint:content` 15 examSets / 1417 rows, `build`, `check:bundle` 83 kB, `test:unit` 85).

Then, continuing on the founder's "continue", added a **2nd branching dialogue per newest daily-life theme**
(`dialogues` 16→**20**, all level 2, covering a new situation than the L1 scenario): `sc_apotheke` (arzt,
Rezept in der Apotheke einlösen), `sc_wohnungsmangel` (wohnen, Heizungsmangel dem Vermieter melden),
`sc_kartesperren` (bank, verlorene Karte sperren lassen), `sc_pruefungsanmeldung` (bildung, zur
telc-Prüfung anmelden). Each is a 5-node graph (4 partner turns + narrator end, 3 scored options each)
matching the existing schema; lint's dialogue graph-integrity checks (start/next/reachability/no-orphans)
pass. +4 `dialogue` provenance rows (draft), 1417→**1421**. Dialogues load in the lazy `dialogues` chunk,
so the main chunk stays 83 kB. Gates green (`lint:content` 20 dialogues / 1421 rows, `build`,
`check:bundle`, `test:unit` 85). **Remaining daily-life depth:** clearing the draft Can-Do/text/exam/dialogue
review queue is founder sign-off work; further optional depth is more vocab/collocations per sub-theme.

Then, on "work on the seo task", closed the OG-image follow-up: added a real **1200×630 share card**
`public/og-image.png` (brand card: logo, "Break through the B1–B2 plateau", domain pills, genauly.de). It is
generated from `preview/og-image/make-og.mjs` (writes a self-contained HTML card, screenshotted with the
pre-installed Chromium, since the repo has no headless-render dep). `index.html` now points `og:image` +
`twitter:image` at it, adds `og:image:width/height/type`, and upgrades the card to
`twitter:card=summary_large_image` (was the square PWA icon + `summary`). Build green, image ships to
`dist/og-image.png`. **SEO/growth now covered:** meta/OG/Twitter/canonical/JSON-LD (WebApplication+FAQPage),
robots.txt, sitemap.xml, landing FAQ + how-it-works, and the share card. Remaining growth levers are
non-code (real product screenshots / testimonials for social proof) or a separate lane (pricing, Phase D).

---

_Older handoffs (sessions 1–79) are archived by ISO week under `docs/archive/status-log/`
(index: `docs/archive/PROJECT_STATUS_ARCHIVE.md`; sessions 69–79 are in the W28 file)._

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
- Game missions (Neuland): **3** (Kap-1: 1.1 Willkommen, 1.2 Fahrkarten-Automat, 1.6 Anmeldung boss; 18 scenes) · 8 NPCs · 6 key items
- Provenance rows: **1,423** (all with a `reference`; 1,398 `draft` / 25 `verified`)
- Verification tiers (Layer C, generated `src/data/verification.ts`): **25 human · 1,266 linguistic · 1 facts · 116 provenance** (1,292 machine-attested)

**Dev branch:** reassigned each session; realign to `origin/main` after each squash-merge (`main` is
always the source of truth).

