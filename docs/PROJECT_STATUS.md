# Project Status & Decision Log

_Last updated: 2026-07-03 (docs audit; latest work is session 49). The working branch is reassigned every
session, so **`main` is always the source of truth** (this session: `claude/docs-audit-report-0xydsz`).
Product name: **Genauly** (domain `genauly.de`)._

This file is the single place to re-orient when resuming work. **The one authoritative "what to do next"
pointer is the `## Resume here (next session)` section near the end of this file** — start there. Older
detailed session logs (sessions 4–40 + 24) are archived in `docs/PROJECT_STATUS_ARCHIVE.md`. For the full
design, see `docs/EXPANSION_PLAN.md`; for the original build plan, `docs/IMPLEMENTATION_PLAN.md`.

## Who I'm working with
- **Founder is non-technical.** Operate as a seasoned CTO: be decisive and opinionated, minimize
  the founder's operational burden, protect them from surprise costs, and aim for an award-worthy,
  genuinely useful product — not just feature parity.

## Where things stand

### Original SPA — live (on `main`)
- Full client-side SPA: onboarding, dashboard, vocabulary (flashcards/quiz/list), redemittel
  (browse + practice), branching simulations, timed exam mode, analytics, settings.
- Engines: SM-2 SRS (`engine/srs.ts`), XP/levels/tiers (`engine/scoring.ts`), Web Speech TTS/STT
  (`engine/speech.ts`), branching dialogue runner (`engine/dialogue.ts`).
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

## Research findings to reuse (don't re-research)

### Licensing guardrails for commercial use
Only use content under these licenses — anything else blocks monetization:
- **CC0** — public domain, no restrictions whatsoever.
- **CC BY** — free commercially; must credit the source.
- **CC BY-SA** — free commercially; modified versions must carry the same license.
- **CC BY 2.0 Fr** (Tatoeba's licence) — commercial-friendly; attribute the platform.
- ⚠️ **Never use CC BY-NC or CC BY-ND** — NC = non-commercial, ND = no derivatives; both block a paid app.

### Approved open-licensed sources (commercial-safe)
| Source | What it provides | Licence | Notes |
|---|---|---|---|
| **Tatoeba** | Hundreds of thousands of DE↔EN sentence pairs; community audio | CC BY 2.0 Fr | Best source for authentic example sentences; bulk download available |
| **Wiktionary / Wikidata** | Genders, plurals, inflections, definitions | CC BY-SA 4.0 | Good for vocab schema fields (article, plural) |
| **DWDS / Leipzig Wortschatz** | Word frequency, collocations, usage examples | Various (check per dataset) | APIs available; great for B2-level frequency filtering |
| **Wikibooks: German** | Structured grammar tables, vocabulary modules, A1→advanced | CC BY-SA 4.0 | Can integrate text into app; must keep project open-source under same licence if distributing modified version |
| **Wikimedia Commons** | Isolated German audio pronunciations by native speakers, illustrations | Mostly CC0 / CC BY / CC BY-SA (filter on-site) | Filter search to commercial-only before downloading any asset |
| **Project Gutenberg** | Original German texts (Kafka, Goethe, Brothers Grimm) | Public Domain | Copyright expired; freely slice, remix, sell as reading modules |
| **LibriVox** | Audiobook recordings of public-domain German texts | Public Domain | Volunteer-recorded; pairs with Gutenberg texts |

### Sources to avoid / handle with care
- **Goethe Wortlisten, Routledge Frequency Dictionary, all Klett books** (Netzwerk, Aspekte, Sicher!, Linie 1 Beruf) — fully copyrighted, no commercial reuse.
- **Deutsche Welle (DW)** — free for personal/educational use only; *not* universally CC-licensed for commercial redistribution. Check specific file metadata before using any DW asset; contact their distribution team if in doubt.

### Open-source infrastructure worth evaluating
- **AnkiDroid / AnkiCore ecosystem** — underlying SRS algorithm and app variants are open-source. Could inform future SRS improvements (the current `engine/srs.ts` implements SM-2 independently).
- **LARA (Learning and Reading Assistant)** — open-source platform for building interactive reading materials with audio + translation. Relevant if we add a reading-comprehension module later.

### Writing eval infrastructure
- LanguageTool (LGPL, hosted API w/ free tier) for error categories; RAG is overkill for a single-insight output.
- Supabase supports anonymous sign-in, pgvector (unused), Edge Functions for secret-safe LLM calls from a static GitHub Pages SPA.

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

## Deploy / ops notes (accumulated)
- `main` is production; merging triggers `pages.yml`. Develop on the automation branch assigned for
  the session (reassigned each session; `main` is always the source of truth); ship via squash-merge
  PR. **Always verify `pnpm build` green before merging.**
- Sandbox cannot reach `api.supabase.com` or `db.*.supabase.co:5432` — CLI migrations and function
  deploys must be done by the founder (dashboard SQL editor + dashboard function code editor work
  fine as alternatives).
- Edge Function deployment via dashboard: create function → dashboard pre-fills boilerplate →
  **select-all-delete first**, then paste code → Deploy.
- Email magic-links on Supabase free plan are rate-limited (~2/hour). Fix: add Resend (free tier)
  as custom SMTP in Auth → SMTP settings. Guest sign-in has no such limit and is the primary path.

### Email+password / Google auth (branch `claude/loving-cray-lMLj3`)
See the "REQUIRES two Supabase dashboard settings" note below — sign-up needs **"Confirm email"
OFF** to be instant, and the Google button needs the **Google provider** configured.

### Landing page + visible auth (branch `claude/loving-cray-lMLj3`)
- **Why:** auth was fully built but invisible (Settings-only, no login UI), so it "seemed not in
  place." Founder asked for a real marketing landing page with top-right Login / Sign-up, guest
  use still allowed, and an active nudge to save progress.
- **What shipped (all client-side, passwordless magic-link backend already live):**
  - `features/landing/LandingPage.tsx` — hero + feature grid + closing CTA; top-right
    `Anmelden` (login) and `Kostenlos starten`. Redirects onboarded users to `/`.
  - **Routing:** `/welcome` now = LandingPage; onboarding moved to `/start`. `RequireOnboarding`
    still redirects un-onboarded users to `/welcome`.
  - `features/auth/AuthDialog.tsx` — reusable sign-up/login modal (email magic-link; links email
    to an existing guest uid to preserve progress). Used by landing + nudge.
  - `features/auth/SaveProgressBanner.tsx` — dismissible in-app nudge (shown to guests /
    signed-out) inviting sign-in; wired into `AppShell` above the page outlet.
  - Existing `AccountPanel` in Settings reworked to reuse `AuthDialog` (email+password / Google).
  - **Auth method = classic email + password** (`signUp`/`signInWithPassword`) plus **Google OAuth**
    — chosen over magic-link because the founder disliked the email round-trip and the generic
    Supabase email. `AuthDialog` has email+password fields, a sign-up/login toggle, friendly German
    error copy, and a "Weiter mit Google" button. Guest→account upgrade uses `updateUser` to attach
    email+password to the same uid (progress preserved).
  - `npm run build` green.
  - **⚠️ REQUIRES two Supabase dashboard settings (founder, non-technical click-paths):**
    1. **Disable "Confirm email"** so sign-up logs in instantly with no email round-trip:
       Supabase dashboard → Authentication → Providers → **Email** → turn **"Confirm email" OFF** → Save.
       (Trade-off: users can sign up with an unverified email — fine for a free progress-sync app.)
    2. **(Optional, for the Google button) enable Google provider:** Authentication → Providers →
       **Google** → ON, paste a Google OAuth Client ID + Secret from Google Cloud Console
       (APIs & Services → Credentials → OAuth client → Web), with the Supabase callback URL as the
       authorized redirect. Until this is done the "Weiter mit Google" button will error.

### UX polish — Quiz answer-reflect flow (PR #14, pending merge)
- **Problem:** `VocabQuiz` and `RedemittelPractice` auto-advanced to the next question after
  selecting an answer (900ms / 700–1100ms timeouts), giving no time to reflect.
- **Fix (branch `claude/loving-cray-lMLj3`, PR #14):**
  - Removed all `setTimeout` auto-advances from both components.
  - After selecting an answer the question stays on screen with instant colour feedback.
  - A `Weiter` / `Quiz beenden` button appears, plus a "tap anywhere" affordance (taps on
    interactive controls are ignored to avoid double-advance).
  - `VocabQuiz` feedback panel also shows the word's translation and an example sentence.
  - `RedemittelPractice`: split `advance()` into `recordResult()` + `next()`; the parent
    now owns the single `Weiter` button for all three task types (choose / construct / respond);
    the `RespondTask` inner advance button was removed.
  - All other quiz surfaces (`QuizRunner`, grammar drills, flashcards, quick revision)
    already required explicit action — so the whole app is now consistent.
  - `npm run build` passes. Deploy pending founder squash-merge of PR #14.

### Session 25 (2026-06-16) — Unique per-section icon colours + custom branded icons everywhere
- **Unique colour per route:** each navigation route now owns ONE unique accent colour (no more
  duplicates: Wortschatz, Quiz, Prüfungsmodus, Schnellwiederholung, Fortschritt, Einstellungen all
  had shared hues before). Defined once in `src/components/layout/nav-items.ts` (`color` + `bg`).
- **One icon per route, used everywhere (new):** custom branded SVG marks now live in
  `src/components/layout/route-icons.tsx` (`RouteIcon` + `MoreIcon`) — one hand-drawn mark per
  route on a 20×20 grid, in the route's accent colour with lighter layers from its own opacity.
  This single registry is the source for the bottom tab bar, the More sheet, AND the desktop
  `Sidebar`, so a section shows the same icon AND colour on every surface. Replaced the old setup
  where the bottom bar had custom SVGs for only 4 "hero" routes while everything else used lucide.
- Dashboard + the "Mehr" menu keep the brand indigo `#5b5be6` as the app/chrome anchor.
- `nav-items.ts` still carries a lucide `icon` per route; `RouteIcon` falls back to it for any
  route without a custom mark. Reference sheet: `preview/route-icons-preview.svg`.
- **Home/Mehr icon swap + richer context strip:** Home is now a house glyph (was the 2×2 grid),
  and the "Mehr" menu took over the 2×2 grid (the classic apps/more glyph). The bottom-bar context
  strip now shows the section name PLUS a short German subtitle (`desc` per `NavItem`) for context
  instead of just the name. The strip is one line taller, so the More sheet overlay/padding were
  nudged to keep clearance.
- **More sheet overlap fix:** the sheet's bottom padding equalled the bar height, so the last icon
  row's labels overlapped the bar's context strip. Bumped padding so the grid lifts clear.
- **Uniform icon optical size:** each mark was drawn freehand on the 20×20 grid with a different
  inked area (filled Quiz disc ~17px vs speech bubble ~13px), so they looked like different sizes.
  Added a `NORM` map + `normTransform` in `route-icons.tsx` that scales each mark's bounding box to
  a centred 16-unit target with a per-mark weight (so heavy filled shapes don't read larger). Tune
  sizes via that map. CLAUDE.md "Icon color rule" updated to match the new all-custom-SVG setup.
- `pnpm build` + `pnpm typecheck` + `pnpm lint:content` green. Shipped via PRs #178–#182.

### Session 26 (2026-06-16) — Bottom-bar context strip removed + More-sheet reorder & animations
- **Context strip removed:** the label/subtitle row above the bottom-bar icons was redundant (every
  section already shows its own title at the top of the page), so the bar is now a single 62px icon
  rail. The More sheet overlay `bottom` (→ `3.875rem`), its bottom padding (→ `5.75rem`), and the
  `.pb-nav` utility were all resized for the shorter bar. `NavItem.desc` is kept for reuse but no
  longer rendered in the bar. `getContextMeta` deleted from `BottomTabBar.tsx`.
- **Mehr selection fixed:** the Mehr tab now shows its selected pill + underline while the More sheet
  is open, and the pinned tabs drop their highlight so the selection clearly sits on Mehr.
  `AppShell` passes a new `moreOpen` prop into `BottomTabBar`.
- **Reorder inside the More sheet (new):** the sheet's edit-mode grid is now drag-sortable via a
  custom 2D grid sort in `MoreSheet.tsx` (`reorderDuringDrag` finds the tile under the pointer and
  splices the dragged path into its slot; `layout` animates the rest). Order persists in a new
  `useSettingsStore.moreOrder: string[]` (full route ordering; empty = `nav-items` order), kept in
  sync so pinned routes hold their slots.
- **Add/remove movement animation (new):** bar and sheet icons use framer `layout` +
  `AnimatePresence` (spring) so adding/removing an icon slides the rest into place instead of
  snapping.
- **Gesture change:** the old "drag a sheet icon down ~72px to add it to the bar" gesture was
  removed (free drag now reorders the grid); the green **+ badge** is the single add affordance.
- **Follow-up fixes (same session):** (1) the More sheet stayed open when tapping a bar tab (e.g.
  Home) because the bar sits below the sheet overlay (`modal={false}`); `AppShell` now closes the
  sheet + exits edit mode on any `location.pathname` change. (2) Bar rail height 62px → 70px and
  icons 29px → 32px (matched to the More sheet, also bumped 28px → 32px); overlay `bottom`, sheet
  padding, and `.pb-nav` re-tuned for the taller bar.
- **Follow-up fixes round 2 (same session):** (1) removed the edit-mode "Ziehen zum Sortieren …"
  instruction sentence. (2) Enter/exit on bar + sheet edit tiles is now opacity-only (no `scale`):
  animating a transform on a `layout`/Reorder element fought framer's projection and was freezing
  the jiggle until the next re-render (the "icons only jiggle after an add/remove" bug), and the
  scale pop was also shifting icons on long-press. Positions now stay put and the jiggle starts
  immediately. (3) The Mehr tab now toggles: tapping it while the sheet is open closes it (and exits
  edit mode) via `toggleMore` in `AppShell`.
- **Follow-up fixes round 3 (same session):** (1) scaled the whole mobile bottom nav down ~10% after
  it felt too big: rail 70px → **63px**, icons 32px → **29px** in both the bar and the More sheet,
  with overlay `bottom`, sheet padding, and `.pb-nav` re-tuned to match (PR #191). (2) Fixed an
  intermittent "design glitch" where the whole mobile view got stuck **scrolled sideways** (header
  logo gone, "Vokabeltrainer" clipped to "kabeltrainer", card text cut off on the left). The guard
  against horizontal scroll only lived on `<body>`, but the real scroll container is `<html>`, and
  Radix portals (Select/Dialog) mount at the end of `<body>` and can momentarily push the document
  sideways before Floating UI positions them, which iOS leaves stuck. Added `overflow-x: clip` +
  `overscroll-behavior-x: none` to `html` in `src/index.css` (`clip`, not `hidden`, so no scroll
  container is created and the sticky header is untouched) (PR #192).
- `pnpm build` + `pnpm lint:content` green. Branch `claude/context-bar-menu-animations-g9gfd3`.

### Session 27 (2026-06-16) — Full app audit + targeted fixes
- **Audit headline: the app is healthy.** `pnpm build`, `pnpm typecheck`, and `pnpm lint:content`
  all pass with zero errors (only the known ~159 provenance back-fill warnings). No crashes, broken
  routes, duplicate IDs, broken dialogue branches, missing content, or em dashes in user copy.
  Content counts all match (490 vocab, 396 collocations, 10 grammar topics/47 drills, 1073 provenance
  rows); consent version matches the legal `LAST_UPDATED` date.
- **Fixes applied:**
  - `dataExport.ts`: added the missing `.eq("user_id", user.id)` to the `writing_evaluations` query
    so it matches its sibling queries (RLS already enforced it; this is consistency + defense-in-depth).
  - Both Edge Functions (`evaluate-writing`, `delete-account`): added `Access-Control-Max-Age: 86400`
    so browsers cache the CORS preflight (fewer OPTIONS round-trips).
  - `ExamRunner.tsx`: gave the free-text answer input an `aria-label`.
  - `QuickRevision.tsx`: made the flip card keyboard-accessible (`role="button"`, `tabIndex`, Enter/Space).
  - `Flashcards.tsx`: a lapsed card ("Again", grade < 3) no longer earns the full review XP (it earned
    more than an "Easy" recall before). Successful recalls still reward effort (Good 6 > Easy 4).
  - `srs.ts`: the SM-2 ease factor now decreases on a lapse (it was only updated on success), so a
    repeatedly failed card loses ease and resurfaces sooner.
  - Guest sign-in is now gated behind a captcha token **when Turnstile is configured**
    (`VITE_TURNSTILE_SITE_KEY`): `useAuthStore.signInAsGuest` refuses without a token, and the writing
    flow (`writing.ts`) routes signed-out users through the captcha-gated auth UI instead of a silent
    guest creation. Dormant (no behavior change) until a site key is set, then closes the
    anonymous-signup AI-budget abuse vector.
- **Verified non-issues (not changed):** the MoreSheet `5.75rem` padding is intentional; the
  flashcard Easy(4) < Good(6) ordering is correct (effort-based). Dropped a planned "scoring 70%
  baseline" change after confirming `examSets.ts` has zero quality-scored options: that 70% is the
  intended exam participation credit, and real dialogues always carry quality options, so the default
  is never hit for them. Changing it would have wrongly dropped every exam score by ~28 points.
- `pnpm build` + `pnpm typecheck` + `pnpm lint:content` green. Branch `claude/app-audit-testing-bqrdkj`.

### Session 27 cont. — Navigation icon polish (SHIPPED)
A run of founder-driven nav-icon refinements, all in `route-icons.tsx` / `nav-items.ts` plus the
three icon surfaces (`BottomTabBar`, `MoreSheet`, `Sidebar`):
- **Audit fixes** also included an a11y pass and the SRS/XP/captcha/CORS fixes above (PR #194).
- **Removed the "Leiste voll" helper line** from the More sheet edit mode (PR #195).
- **More sheet closes on re-tapping the active tab:** it only closed via the `location.pathname`
  effect, but re-tapping the active tab doesn't change the route. Added `onNavigate`/`closeMore` so
  any bar tap closes the sheet (PR #196).
- **Full opacity everywhere:** removed the 38% inactive dimming so icons no longer read as blurred;
  active is shown by the backdrop/underline, not opacity (PR #197).
- **Optical-size re-tune (~5%):** bumped most `NORM` weights to reduce empty space, boosted the small
  marks (grammar/exam/analytics), kept large ones restrained, left the pencil unchanged; later bumped
  the home icon another +5% (PRs #198, #200).
- **Two-tone book → two-tone + neon for all icons:** the Wortschatz book first became two-tone indigo
  `#5b5be6` + cyan `#10b7cf` to match the F2 "Per-section Color" preview (PR #199). The founder then
  approved extending the two-tone treatment to **every** icon, each with a brighter **neon** second
  tone (proposal sheet `preview/route-icons-two-tone-neon.svg`).
- **Grey-gradient icon boxes:** the rounded pill/tile behind icons now uses a neutral grey gradient
  (`from-muted to-border`) instead of the section colour at low opacity, across the bar, Mehr pill,
  More-sheet tiles, and the sidebar active row. The `nav-items.ts` `bg` tint field is no longer used
  for backdrops. CLAUDE.md "Icon color rule" updated to capture the two-tone+neon + grey-box design.
- `pnpm build` + `pnpm typecheck` green throughout.

### Session 44 (2026-06-28) — Session-43 review, app-wide dark-mode fix, filter-harmonization plan ✅
A review + bugfix + planning session on branch `claude/review-previous-session-69pxat`. Three PRs
squash-merged to `main` (#250–#252).
- **Reviewed session 43** end to end (taxonomy Phases 3–4): build/typecheck/`lint:content` green,
  every new view implemented as documented and responsive. Fixed one latent mobile bug, the
  `FacetSheet` bottom sheet inherited `overflow-y-auto` on the whole container, so on a short viewport
  the "Apply" button could scroll away. Constrained the grid (`grid-rows-[auto_auto_minmax(0,1fr)_auto]`)
  so only the facet list scrolls and the footer stays pinned (**PR #250**).
- **App-wide dark-mode fix (#251).** Founder reported the Kollokationen filter pills rendering bright
  white in dark mode. Root cause: **Tailwind's opacity scale only contains multiples of 5, so any
  color utility using `/8` or `/12` silently failed to compile** (verified in the production CSS, zero
  rules emitted). Effects: `bg-white dark:bg-white/8` pills lost their dark override and fell back to
  white; every `/12` tint (badges, stat cards, header streak/level pills, exam/simulation/onboarding
  icon boxes, RelatedPanel chips) rendered with no background at all. Bumped all `/8` and `/12`
  color-opacity utilities to `/10` (34 utilities across 16 files); audited the whole `src` tree, those
  were the only non-multiple-of-5 steps in use, and no hardcoded light-only colors lack a dark variant.
  **Lesson for future work: only use opacity steps that are multiples of 5** (e.g. `/10`, `/15`), the
  build does not warn on invalid ones.
- **Filter-harmonization plan (#252, docs-only).** Founder flagged the search bar / filter button /
  filter options / theme + branche controls as chaotic and inconsistent across Wortschatz,
  Kollokationen, Redemittel, etc. Researched the codebase + `docs/TAXONOMY_REDESIGN.md` + the uploaded
  learning-app playbook (`docs/Language Learning App Success Factors.docx`) and wrote
  **`docs/FILTER_HARMONIZATION_PLAN.md`**: one shared `Search + Theme + Filter` toolbar
  (`BrowseToolbar`) + the existing `FacetSheet` on every page, a single responsive panel for
  mobile+desktop, branded `HubHero` header everywhere, a shared `src/lib/cefr.ts` for consistent CEFR
  labels, and the verb-rail/legend decluttered into the sheet. Phased: Phase 1 = the 3 filtering pages,
  Phase 2 = the simpler hubs. **Implemented in session 45 (below).**
- **Historical pointer (as of session 46; superseded by the `## Resume here` section below) →** the
  **UX overhaul plan was fully approved and became the roadmap.** Start with Phase 0 (quick wins, Sonnet 5), then Phase 1 (session engine, Opus 4.8); see
  the phase/model table under "Model guidance". The older follow-ups (human-verify `cefr` tags, new
  life-domain themes) slot in after or alongside; new themes land best after Phase 3 (Bibliothek).

### Session 46 (2026-07-02) — Full app review + UX overhaul plan, APPROVED ✅ (docs-only)
Fable session. The founder asked for a critical review of the app and of the s44/s45 filter
harmonization, then a substantially better plan. **No app code changed; strategy + docs only.**
- **Full-app review:** all 13 routes screenshotted (mobile 390px + desktop 1280px) and read. Five
  headline problems: no composed session loop (the pieces exist but the learner must sequence them);
  home leads with a wall of choices instead of "continue"; redundant practice surfaces (3 flashcard/
  quiz experiences, 4 library nav slots); German UI carrying English content in load-bearing spots
  (all 11 theme blurbs, grammar purposes, "Quick Review"); progress reads as bookkeeping (four zero
  tiles on a new account, no Can-Do milestones). Sign-in banner sits on every screen.
- **Filter-plan critique (self-critical):** s45 harmonized the *reference* layer but polished the
  wrong layer; search stayed siloed per bank; scope (theme) resets per page; the relocated Verb facet
  became a 100+ pill soup; per-page facet wiring does not scale to the coming content packs.
- **`docs/UX_OVERHAUL_PLAN.md` (new, the roadmap):** session-first redesign. Four-tier filter
  architecture (Tier 0 personalized defaults / Tier 1 global search across all banks / Tier 2
  travelling Scope (Domain → Theme → Sub-theme) as app state / Tier 3 refinement facets from a
  central registry, ≤12-option rule, Verb facet dropped). Four-zone IA: Heute (session hero) ·
  Bibliothek (4 libraries merged, s45 toolbars reused) · Anwenden (Simulation/Schreiben/Prüfung) ·
  Fortschritt (Can-Do milestones + diagnosis). New `engine/session.ts` composer + SessionPlayer
  reusing the existing SRS/quiz/drill machinery. Six phases with a prioritization framework.
- **All four Part-H decisions recorded (founder):** (1) IA direction approved; (2) tab-bar default
  pins approved after a plain-language walkthrough, mechanics stay locked; (3) German-first copy
  confirmed, the founder's "EN peek button" idea parked as **backlog #25** (needs brainstorming;
  Phase 0 keeps EN as data, so it stays possible); (4) Can-Do statements AI-drafted + founder-
  reviewed, provenance recipe checked against `DATA_GOVERNANCE.md` (origin `authored`, license
  `OWNED`, `draft` → `verified`, reference = CoE CEFR descriptors, same as writing prompts).
- **Model guidance refreshed:** Fable available again (restriction lifted), Sonnet bumped to 5, and
  a per-phase model table added for the overhaul plan (Phase 0 Sonnet → Phase 1 Opus → …).

### Session 45 (2026-06-29) — Filter harmonization IMPLEMENTED (Phase 1 + Phase 2) ✅
Implemented the full `docs/FILTER_HARMONIZATION_PLAN.md` across both phases.
- **New shared pieces:**
  - **`src/lib/cefr.ts`** — single source of truth for the CEFR scale (`CEFR_ORDER`, `cefrLabel`,
    `difficultyToBand`). Replaced 4 duplicated `CEFR_ORDER` arrays (VocabularyTrainer,
    CollocationsBrowser, SubThemePicker, intentCards).
  - **`src/features/shared/BrowseToolbar.tsx`** — thin layout wrapper that fixes the position and
    styling of `[Search] [Primary Select] [FacetSheet trigger]` + active-chips row. Reuses the
    existing `FacetSheet` and `ActiveFilterChip`.
- **Phase 1 — three filtering pages:**
  - **VocabularyTrainer:** `SectionHeading` → `HubHero`, added free-text search (over de/en/related),
    theme dropdown + filter sheet via `BrowseToolbar`. SubThemePicker + tabs preserved below.
  - **CollocationsBrowser:** removed the verb-chip scroll/expand rail + the Neutral/Formal colour
    legend. **Verb filter moved into the FacetSheet** as a third facet (CEFR + Register + Verb), so it
    gains live counts, greyed dead-ends, and removable chips. Search persisted to URL (`?q=`). Quiz CTA
    moved to `BrowseToolbar` trailing slot.
  - **RedemittelTrainer:** `SectionHeading` → `HubHero`, added free-text search (over de/en), added
    **Kategorie primary dropdown** (`?cat=`) as the primary axis. Filter sheet kept (Register facet).
    Wendungen/Üben tabs preserved.
- **Phase 2 — non-filtering hubs:** QuizHub level labels now use `difficultyToBand()` from the shared
  module, producing consistent `B1 / B2.1 / B2.2·C1` labels. GrammarHub, ExamHub, SimulationHub already
  used `HubHero` and needed no changes.
- **Verification:** all three pages tested on mobile (390px) and desktop (1280px). Search narrows
  results and composes with facets. Filter sheets open with live counts. URL params round-trip. Dark mode
  correct (no new `bg-white` pills). `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green.

### Session 43 (2026-06-27) — Taxonomy redesign Phases 3–4 SHIPPED + dashboard restructure ✅
Completed the taxonomy redesign. All of Phase 3 and Phase 4 are live on `main` across nine squash-merged
PRs (#240–#248). The untagged-rolls-up invariant held throughout. Highlights (full detail in the taxonomy
section above):
- **Phase 3 — faceted browser, Work-mode facets, intent cards.** Mode-aware **intent cards** on the
  dashboard (#240); **register unification** + reusable **`FacetSheet`** (live counts, greyed dead-ends)
  wired into Kollokationen (#241); **care/Pflege sector back-fill** + first `office` tags, vocab 515→528
  (#242); FacetSheet in the Vokabeltrainer with CEFR + Wortart + Work-only **Branche** facet (#243);
  Redemittel **Register filter** (#245); **workSituation** tags + Work-only **Situation** facet (#246).
  `mode` now has a real content effect (filters intent cards, gates the Work facets).
- **Dashboard restructure (#244):** leads with the "Was möchtest du üben?" tiles; the big progress block
  collapsed to a compact strip (full stats already live on Fortschritt).
- **Phase 4 — cross-module linking + adaptive review.** Cross-module **"Verbunden" panel** on vocab words
  (#247); **mode/level-aware** Schnellwiederholung deck via pure `reviewWeight()` + weakest-CEFR-band
  detection, plus **filtered writing-coach deep-links** via `practiceRoute()` (#248).
- **Deliberate non-actions (documented):** `counterpart` left 0-tagged and Redemittel left without a
  `themeId` (both are general-purpose, so tags would be low-signal). `cefr` tags remain AI-draft pending
  human verification.
- `pnpm lint:content` + `pnpm build` green on every PR; branch realigned to `main` after each squash-merge.

### Session 42 (2026-06-27) — Taxonomy redesign Phases 0–2 IMPLEMENTED & SHIPPED ✅
First build session on the approved `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`. Phases 0, 1 and 2 are now
live on `main` across three squash-merged PRs. Untagged-rolls-up invariant held throughout, so nothing
regressed.
- **Phase 0 — foundations (PR #233, then completed in #234):** new faceted types in
  `src/types/index.ts` (`DomainId`, `LearningMode`, `ContextTag`, `ContentCefr`, `Frequency`,
  `WorkSector`, `Counterpart`, `WorkSituation`, `TaskType`, `SubThemeId`, `SubTheme`); `domains.ts`
  registry (6 domains) + `domainById`; all 11 themes given `domain` + `context`; `mode: LearningMode`
  (default `"both"`) added to `useSettingsStore` (rides cloudSync automatically). Optional facet fields
  added to `ExamTheme`/`VocabItem`/`Collocation`/`RedemittelPhrase` (all optional → existing content
  stays valid). Linter got mirror arrays + validate-when-present checks for every new enum. #234 closed
  the Phase-0 checklist tail: `ExamTheme.subThemes?`, `SubThemeId` alias, and wired
  `workSituation?`/`taskType?` as real validated facets (peers of `sector`/`counterpart`).
- **Phase 1 — levels + Mode picker (PR #233):** all **515 vocab + 396 collocations tagged with `cefr`**
  (AI-drafted; **human-verify still pending** via provenance `draft→verified`). Onboarding gained a
  **Mode step** (Beruf/Alltag/Beides, 4→5 steps). New **`ModeSwitcher`** pill in the app header
  (persists `mode`; currently a saved setting with no content effect yet — re-weighting is Phase 3).
  **CEFR Level filter** added to `VocabularyTrainer` (`?cefr=`, shareable). Quiz `Difficulty 1|2|3`
  relabelled to CEFR bands (B1 / B2.1 / B2.2·C1) in `QuizHub`/`QuizRunner` (numeric kept internally for
  question-type selection).
- **Phase 2 — sub-themes (PR #235, SHA `59b9e62`):** `behoerde` (4), `customer` (3) and `meetings` (3)
  split into sub-topics derived from their `situations[]`. **122 vocab + 105 collocations tagged with
  `subThemeId`**; cross-cutting items (soft-skill adjectives, connectors, generic "Behörde") left
  untagged on purpose. New **`SubThemePicker`** drill-down (per-sub count + CEFR span, plus a dashed
  "Gesamtes Thema" escape hatch that includes untagged items). `VocabularyTrainer` gained `?sub=` +
  breadcrumb + sub-aware filtering/counts; helpers `vocabBySubTheme`/`collocationsBySubTheme` and a `sub`
  option on `filterVocab`. Linter now cross-validates every `subThemeId` is declared on its theme. Counts
  reconcile: behoerde 24+1, customer 45+5, meetings 53+1.
- **Phase 3a — mode-aware intent cards (session 43):** the dashboard now opens with a **"Was möchtest
  du üben?" row of starting-point cards** (`src/features/dashboard/intentCards.ts` + `Dashboard.tsx`).
  Each card carries a pre-built filter bundle and deep-links into the matching browser view (e.g.
  `behoerde.meldewesen`, `meetings.beitrag`, `customer.beratung`, `/redemittel`, `/writing`).
  `intentCardsForMode(mode)` filters by the active lens (a `both` card or `both` mode always shows, so
  the screen never empties); word counts + CEFR ranges are computed live from `filterVocab`. **This is
  the first place `mode` actually changes what the learner sees.**
- **Phase 3b — register unification + faceted filter (session 43):** `Collocation.register` widened to
  `neutral|formal|diplomatic` (linter `COLLOCATION_REGISTERS` + card badge updated). New reusable
  **`src/features/shared/FacetSheet.tsx`**: a "Filter" chip opens a slide-up sheet (reusing `dialog.tsx`,
  overridden to a bottom sheet) whose multi-select option pills show **live counts** and **grey out
  zero-yield values**, so you can't tap into an empty screen (AND-across-facets / OR-within-facet;
  `matchesFacets`/`applyFacets`/`activeFacetCount` exported). Generic over item type. **Wired into the
  CollocationsBrowser first** (CEFR + Register facets, state in `?cefr=`/`?register=`, removable
  active-filter chips in the bar). Collocations had no level/register filtering before, so this is pure
  new capability and the lowest-risk proving ground.
- **Sector back-fill (session 43, PR #242):** authored a **13-word care/Pflege pack** (`die Schicht`,
  `die Übergabe`, `die Hygiene`, `der Angehörige`, `die Fallbesprechung`, `die Pflegedokumentation`, …)
  spread across existing themes (scheduling/safety/customer/conflict/meetings/technology) so the
  orthogonal `sector` facet genuinely cuts across topics, plus a curated set of `office` tags
  (Besprechung/Protokoll/Sitzung/Beschluss/Frist/Deadline/…). Vocab 515→528; matching provenance rows.
  This unblocked the Work-mode facets. Honest first pass, not exhaustive (sector rolls up).
- **Phase 3c — vocab faceted filter + Work-mode sector facet (session 43):** `FacetSheet` wired into the
  **VocabularyTrainer**, replacing the old standalone CEFR `Select`. Facets: **CEFR + Wortart** always,
  plus the **`sector` ("Branche") facet shown only when the Mode lens is `work`** (`facets` is derived
  from `learningMode`). State in `?cefr=`/`?pos=`/`?sector=` (multi-select), removable active-filter
  chips in the bar. The theme `Select` + sub-theme drill-down are untouched; facets apply on top of the
  theme/sub scope. So **switching to Work mode now reveals the Pflege/Büro sector filter** — the
  Work-mode facets are functional end to end.
- **Verification each phase:** `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green. Sandbox
  can't reach the live `*.github.io` site; founder confirms the deployed result.
- **Redemittel Register filter (session 43):** the Redemittel browse view gained a `FacetSheet` **Register
  filter** (neutral/formell/diplomatisch, present 38/29/5); categories with no matches are hidden. State
  in `?register=`.
- **Dashboard restructure (session 43, PR #244):** the dashboard now **leads with the "Was möchtest du
  üben?" intent tiles**. Removed the big focal hero + four-stat status strip + level bar (all already on
  the Fortschritt page) and replaced them with **one compact summary strip** below the tiles (streak ·
  today XP/goal · days-to-exam · recommended action · "Fortschritt" link). Mode pill untouched.
- **workSituation facet (session 43):** tagged a cross-cutting set of vocab (`shift-handover` for the
  care shift words, `instructions` for safety/hygiene, `meeting`, `customer-call`) and exposed it as a
  **2nd Work-mode facet "Situation"** in the Vokabeltrainer (next to "Branche"); both appear only in Work
  mode. `counterpart` left 0-tagged on purpose (redemittel are general-purpose → low-signal).
- **Phase 4 step 1 — cross-module "Verbunden" panel (session 43):** `src/features/vocabulary/RelatedPanel.tsx`.
  In the Vokabeltrainer **Übersicht** list, each word now expands ("Verbunden") to show matching content
  from the other banks via the shared `themeId`/`subThemeId` join key: a **Kollokation** (same sub-theme
  if available → `/collocations?theme=`), the theme's **Schreibtraining** prompt (→ `/writing?theme=`),
  and a **Dialog** (→ `/simulation`). No hand-kept id lists. Redemittel aren't linked (no `themeId`).
- **Phase 4 steps 2 + 3 (session 43):** **(2) mode/level-aware review** — `reviewWeight()` in
  `src/engine/srs.ts` (pure) + `QuickRevision` now build the Schnellwiederholung deck weighted by the Mode
  lens (theme `context`), card weakness, and the learner's weakest CEFR band (weighted selection, never a
  wall). **(3) writing-coach deep-links** — `practiceRoute()` in `practiceAreas.ts` folds the writing
  prompt's `theme` into the "Üben" deep-link so it opens a filtered drill set (theme-aware `/vocabulary`/
  `/collocations`/`/quiz`; formal Redemittel for the register weakness). **Phase 4 is complete.**
- **Historical pointer (as of session 43; see the `## Resume here` section below for current next steps) →**
  the **taxonomy redesign (Phases 0–4) is fully shipped.** Optional follow-ups: human-verify
  the AI-drafted `cefr` tags (provenance `draft→verified`), broaden `sector`/`workSituation` tagging, extend
  sub-themes past 3 of 11, and (if wanted) give Redemittel a `themeId`/`counterpart` pass to unlock more
  cross-links. Otherwise the next big rock is a **new life-domain theme** (banking / healthcare / housing)
  per the product scope.

### Session 41 (2026-06-26) — Taxonomy & filtering redesign: research deck + Mode layer + implementation plan (docs-only, MERGED ✅)
A research + strategy + planning session. **No app code changed; documentation/artifacts only.** Scopes
backlog **#5** (domain/sector-based filtering) plus the founder's new Work/Personal/Both idea.
- **Strategy deck authored** in two forms: `docs/TAXONOMY_REDESIGN.md` (detailed technical version) and
  `docs/TAXONOMY_REDESIGN.pptx` (**37-slide** plain-language deck for the non-technical founder, built
  programmatically with python-pptx). Recommends a **faceted model** (mix-and-match labels) over the
  current flat single-axis list, with a shallow **Domain → Theme → Sub-theme** hierarchy and orthogonal
  facets (cefr, register, pos, frequency, exam tag).
- **Diagnosis grounded in the codebase:** the app today runs three incompatible taxonomies (themes for
  vocab/collocations, communicative function for Redemittel, grammar groups for grammar), has **no
  CEFR/level field on any content** (only quiz `difficulty: 1|2|3`, unsurfaced), and filters via a
  single theme `Select` in `VocabularyTrainer.tsx`.
- **Work/Personal/Both "Mode" layer added** (founder's idea, session iteration): a top-level lens set at
  onboarding that scopes the tree and unlocks work-only facets (**sector, workplace situation,
  counterpart, task type**). Designed as a **lens, not a wall** (never hides content). Grounded in real
  web research: telc/BAMF *Rahmencurriculum für den Beruf* (fields of action + counterpart), **DeuFöV**
  state courses splitting job German by sector (care/technical/commercial), telc *Deutsch Pflege* exam,
  and Babbel/Duolingo goal-based onboarding. Sources listed on the deck's References slides.
- **8 UI mockups** built in `preview/taxonomy/` (HTML matching the app's brand tokens, screenshotted with
  the bundled Chromium): before/after vocab browser, sub-topic drill-down, goal-first home,
  connected-word detail, advanced filter sheet, **Mode picker**, **Work-mode browser**.
- **Approved implementation plan** written to `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`: Phases 0–4
  (0 = types + store `mode` + linter foundations, invisible; 1 = CEFR levels + onboarding Mode picker +
  header switch + Level filter = first shippable milestone; 2 = sub-themes; 3 = faceted browser +
  work-mode facets + goal cards; 4 = cross-module links + adaptive review). Reuses the existing settings
  store (`goal`/`level` already there, cloudSync auto-syncs new keys), the linter's mirror-array pattern,
  the onboarding `SelectRow`, and the provenance draft→verify workflow. **Decisions locked:** full
  5-phase plan; `mode` is a NEW axis separate from the existing `goal` (exam/work/fluency).
- **Shipped via PR #231** (squash-merged to `main`, merge SHA `6fe25c7`): all of the above docs +
  mockups. Post-merge realignment done (branch reset to `origin/main`, force-with-lease). **Nothing is
  implemented yet** — Phase 0–1 is the recommended next build step.


### Older session logs (archived)

Detailed session-by-session logs for **sessions 4–40** and **session 24** now live in
`docs/PROJECT_STATUS_ARCHIVE.md`, to keep this file navigable. The condensed handoff history is
still in the “Resume here” section below; git history and `docs/SESSION_PROMPT_LOG.md` remain the
authoritative full record.

## Backlog — founder ideas (not yet scoped, added 2026-06-07)
Raw list from the founder, for future planning sessions to scope, sequence, and break into
phases. None of these are started; treat as candidates for the next `EXPANSION_PLAN.md` revision.

1. **Redesign the Dashboard** (the home/progress screen).
2. **Gate Schreibtraining behind sign-in:** show the login/sign-up popup (`AuthDialog`) when a
   signed-out guest tries to use Schreibtraining, instead of letting them in freely.
3. **Animated-character scenario simulations:** visual, contextual practice — simulate real
   workplace scenarios with animated characters (beyond today's text-based branching dialogues).
4. **Visual mnemonics for vocabulary:** icons/illustrations per noun gender — e.g. man, woman,
   baby/neutral or non-living-thing — to aid visual memory of `der`/`die`/`das`.
5. **Domain-based filtering for Vocabulary, Collocations, and scenario-based learning:**
   split content into "Bürokratie / bureaucratic work" vs. "office work," and within office
   work, further filter by industry/sector.
   - **SCOPED 2026-06-26 (session 41).** This is now designed in `docs/TAXONOMY_REDESIGN.md`
     (+ `.pptx`) and planned in `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`: a faceted Domain → Theme →
     Sub-theme model with a Work/Personal/Both **Mode** lens and work-only **sector** facet (the
     industry/sector split the founder asked for). Not built yet; Phase 0–1 is the next build step.
6. **Redesign the Schreibtraining section.**
7. **Sourcing/audit infrastructure for content data:** build a data structure + pipeline to
   scrape from reliable open-licensed sources (see "Approved open-licensed sources" above), with
   a clear, audit-ready human-verification workflow. Every data point in the app should carry
   a clear source, verified status, and other metadata, tracked in an Excel/CSV in the project
   folder (not just inline in the TS files) so it's reviewable independent of the code.
   - **Now elaborated in `docs/DATA_GOVERNANCE.md` (v0.2, added 2026-06-14, revised 2026-06-15):** the
     full governance roadmap, provenance-register schema, commercial-safe license allowlist (SPDX) +
     planned machine gate, four-eyes workflow, and a phased path mapping to ISO/IEC 42001 + EU AI Act
     Article 10. **Founder policy (v0.2): traceability over ownership** — every item traces to an
     authoritative reference (Wiktionary / DWDS for word facts) or a commercial-safe source (Tatoeba
     CC-BY for example sentences); AI-assisted drafting must be verified and cited, not claimed as
     `OWNED`. Phase 1 (provenance register + reference/license gate in the linter + back-fill existing
     content) is the recommended next build step.
8. **Pricing page + plan design:** create a pricing page and design the various paid plans/tiers
   to offer (ties into the "monetize later" decision and the planned `tier` flag).
9. **Payment gateway integration:** add a payment provider so the plans in #8 can actually be
   purchased/billed.
10. **FAQ section on the landing page.**
11. **Expand landing page copy:** the landing page's body copy needs more substance/depth overall
    (beyond just adding an FAQ).
12. **SEO:** make the whole app + landing page SEO-friendly and take concrete measures so it
    surfaces in Google search results (meta tags, structured data, sitemap, performance, etc.).
13. **Marketing campaign:** plan and run a marketing campaign to drive signups/awareness.
14. **GDPR compliance (IN PROGRESS, s20 2026-06-08):** audit done + first robust pass shipped.
    Delivered: sign-up/onboarding consent checkbox with recorded consent (`CONSENT_VERSION`),
    in-app data export, in-app account deletion (`delete-account` Edge Function), per-submission
    writing delete (+ `writing_delete_own` RLS policy), honest reset that also clears cloud, a
    bilingual `/impressum` page, and privacy/terms copy updates (email usage, language-precedence,
    data-location, self-service rights). Decision: **no cookie banner** (functional-only storage is
    consent-exempt). Founder one-time steps in `docs/PHASE2_SETUP.md` (deploy function, run
    migration 0003, optionally enable pg_cron retention, fill Impressum + region placeholders).
    Still open: lawyer review (#15), real Impressum details, optional auto-retention, marketing
    opt-in UI once a campaign (#13) is built.
    - **Impressum TEMPORARILY HIDDEN (founder, 2026-06-08):** the founder prefers not to put a home
      name/address in the public Impressum yet (an Impressum is public by law; a GitHub secret can't
      hide it since the page renders it to everyone). So `/impressum` is built but unrouted and all
      links removed; `Impressum.tsx` stays in the repo. Re-enable with a business/service address
      (a "ladungsfähige Anschrift", not a P.O. box) during the lawyer/launch pass: uncomment the
      import + route in `router.tsx` and restore the footer/Settings/privacy/terms links.
    - **Email-usage note (2026-06-07):** when doing this, make the privacy policy explicitly
      cover *every* way email is used — auth/login, password reset + account recovery, and any
      future transactional mail (payment receipts/billing) and marketing mail — and add proper
      opt-in consent for anything marketing-related. Context: we removed the "Wir nutzen deine
      E-Mail nur für die Anmeldung" line from the sign-in dialog (PR #114) because that promise
      was already a stretch (reset/recovery) and would be broken outright once the marketing
      campaign (#13) and payment gateway (#9) ship. So the policy must not repeat that narrow
      "only for sign-in" claim.
16. **Business plan + case study (added 2026-06-11, v1.1 shipped 2026-06-12):** produce a
    well-researched business plan and case study for Genauly — covering market sizing, competitive
    landscape, product-led growth model, unit economics, and traction narrative. Delivered in
    `docs/BUSINESS_PLAN.md`. Updated in v1.1 to reflect the broader positioning (see #18).
    Intended as a foundation for investor conversations and pre-seed fundraising (#17). Recommended
    model: **Fable** (research-heavy strategy work).
17. **Pre-seed funding (added 2026-06-11):** plan and execute a pre-seed fundraising round.
    Scope includes identifying suitable investors (edtech / language-learning / EU-focused), preparing
    pitch materials (deck, one-pager, data room), and deciding on instrument (SAFE, convertible note,
    or priced round). Depends on #16 (business plan) being substantially complete. Recommended
    model: **Fable** for strategy/pitch drafting.
18. **Reposition and redesign for the broader B1-B2 real-life purpose (added 2026-06-12):**
    The founder confirmed that Genauly's purpose is broader than exam prep. The primary audience is
    anyone who has learned basic German (around B1) and is stuck at the intermediate plateau: they
    can manage simple exchanges but lack confidence in real-life situations. The app should help them
    practise the situations that actually matter — presentations at work, visits to the Behörde,
    doctor appointments, job interviews, difficult conversations with colleagues — not just the
    ten current workplace/meeting themes.

    **What this backlog item covers (to be scoped and phased):**
    - Content expansion: add new scenario themes beyond the current workplace focus.
      Priority candidates: Behörde/bureaucracy, healthcare/doctor, job-hunting/interviews,
      social/housing, and public-transport/daily-life. Each theme needs dialogues, vocabulary,
      collocations, Redemittel, grammar drills, and quizzes at three levels.
    - Navigation and UI redesign: the current topic structure ("Meetings", "Logistics", etc.)
      maps to the old workplace-only framing. Redesign the topic browser, Dashboard, and
      onboarding flow to present the app as a situation-based real-life German tool, with
      workplace as one of several life domains.
    - Branding and copy alignment: update app shell labels, onboarding copy, and in-app
      descriptions to match the "German for real life, B1-B2" positioning (not "B2 Beruf exam
      prep"). Public-facing copy (landing, /about) was updated in the 2026-06-12 session;
      in-app copy still reflects the old framing.
    - Exam prep preserved but repositioned: the telc B2 Beruf and Goethe B2 exam-prep value is
      real and should remain, positioned as one benefit of the broader real-life practice, not
      the primary hook.
    - Do NOT hard-code specific content counts (word counts, scenario counts) in UI copy or
      marketing; the library is growing and numbers will be outdated quickly.
    - Recommended model for the design/planning phase: **Fable** (creative + strategic).
      Implementation: **Opus** for cross-section rework, **Sonnet** for mechanical content work.
    - **PROGRESS (2026-06-20):** the **first daily-life content pack shipped**, theme `behoerde`
      (Behörden & Ämter): ~25 vocab, 12 collocations, 2 branching scenarios (levels 1–2), 1 writing
      prompt, provenance rows. It auto-surfaces in Quiz/Vocabulary/Collocations/Simulation (those
      map over `themes` / group scenarios by level), so no UI redesign was needed. Counts now: 515
      vocab, 396 collocations, 12 dialogues, 11 themes. This is the reference template for the
      remaining packs (banking, healthcare, housing). Still open under #18: the nav/Dashboard
      "situation-based" redesign and the Bürokratie-vs-Office domain grouping (backlog #5).
      Scoping doc: `docs/AI_PRODUCT_STRATEGY.md`.
15. **Legal review with a lawyer (founder, 2026-06-08):** the live `/privacy` and `/terms` (AGB)
    pages were written in plain language by the team, not a lawyer. Before any paid plans (#8/#9)
    or a marketing campaign (#13) launch, have a qualified lawyer review both for German/EU
    enforceability. Likely additions a lawyer will want: a proper **Impressum (§5 TMG)** with the
    operator's real name + address, a clause on **which language version prevails** if DE and EN
    differ, withdrawal/cancellation rights for paid plans (Widerrufsrecht), and tightened
    liability wording. Ties into the GDPR-compliance item (#14).
    - **Disclaimer-banner question (2026-06-08):** founder asked whether the live pages should say
      the terms are "in development / under review." Recommendation: **no.** Calling your own terms
      provisional weakens their enforceability and looks unfinished; the "Zuletzt aktualisiert" date
      already signals they evolve. Keep the internal "needs lawyer review" caveat in this backlog,
      not user-facing. **Founder confirmed 2026-06-08: no banner.** (Revisit only the
      language-precedence line + Impressum during the lawyer pass.)
19. **Certification landscape deep-research — DONE (2026-06-15).** Completed via the deep-research
    harness (5 parallel cited passes). Output: **`docs/CERTIFICATION_RESEARCH.md`** (full findings +
    sources), with conclusions folded into `DATA_GOVERNANCE.md` v0.3. Headlines: we are **most likely
    NOT high-risk** under the EU AI Act (Annex III(3) is institution-tied; formative feedback + the Art.
    6(3) carve-out likely keep us out), with **profiling** and **institutional gating** as the two flip
    risks; **Article 50 transparency** (tell users they're interacting with AI / mark AI output) is a
    real obligation by **2 Aug 2026**; when we certify, sequence **ISO 27001 then ISO 42001** via TÜV
    NORD/SÜD (~$15K to $60K per standard); SOC 2 is US-centric, defer. Cheap trust signals exist (MISSION
    KI, Art. 95 code, Comenius EduMedia, Fraunhofer KI-Prüfkatalog). **Still needs a lawyer's sign-off**
    on the risk class (ties into #15). Spawned a new action #21 (ship Art. 50 transparency).
20. **Redo the logo — too close to Canva (added 2026-06-15):** the founder noticed the current
    Genauly mark (rounded gradient square with a white "G") looks very close to the Canva logo and
    wants it redesigned into something distinctive. Scope when picked up:
    - Design a new brand mark that is clearly differentiated from Canva (and other rounded-gradient-
      square app icons). Keep it legible at favicon size and recognisable on a home screen.
    - Once approved, regenerate **every** asset that currently uses the mark, matching the existing
      treatment rules in `CLAUDE.md` → "Brand logo": the canonical in-app file
      `public/genauly-default-logo-transparent-corners.png` (rounded transparent corners, used in all
      in-app spots), the favicons (`favicon-32.png`/`favicon-16.png`, rounded transparent corners),
      and the **full-bleed opaque** OS icons (`apple-touch-icon.png`, `pwa-192x192.png`,
      `pwa-512x512.png`, `pwa-maskable-512x512.png`). Also refresh the full-bleed square variant used
      for Google's OAuth consent crop (not in the repo).
    - Recommended model: **Fable** for the design direction, then **Sonnet** for the mechanical
      asset regeneration + wiring.
21. **EU AI Act Article 50 transparency (added 2026-06-15, from the #19 research):** before **2 Aug
    2026**, add a clear disclosure wherever the app gives AI feedback that the feedback is AI-generated
    and that the user is interacting with an AI. Small UI/copy change (likely a one-line note on the
    Schreibtraining/feedback surfaces + a line in the privacy policy). Also write the documented
    **Article 6(3) risk assessment** (are we high-risk? answer the profiling question) so it exists on
    file. Detail and sources in `docs/CERTIFICATION_RESEARCH.md`. Confirm scope with the lawyer (#15).
    Recommended model: **Sonnet** (mechanical), legal nuance to **Opus**.
22. **Comprehensive end-to-end data strategy (added 2026-06-23):** produce a single coherent strategy
    document (e.g. `docs/DATA_STRATEGY.md`) covering the **full lifecycle of every kind of data in the
    app**, unifying threads currently spread across `DATA_GOVERNANCE.md`, `EXPANSION_PLAN.md`, and
    `PHASE2_SETUP.md`. Scope when picked up:
    - **Inventory by data class:** learning content (`src/data/*`), the provenance register, user
      progress + SRS state, writing submissions + AI feedback, settings + consent, and any analytics.
    - **Where each lives and how it flows:** localStorage (`b2beruf.*`), Supabase `profiles.settings`
      jsonb via `cloudSync`, the writing/delete-account Edge Functions, and AI-provider round-trips.
    - **Lifecycle:** acquisition/sourcing, validation (`lint:content`, `check:refs`), the four-eyes
      verification roadmap (draft → verified), Tatoeba example-sentence sourcing, retention/deletion
      (GDPR export + delete), and backup/migration.
    - **Governance & compliance:** how it satisfies EU AI Act Art. 10 / ISO 42001, the licence
      allowlist, and the audit-ready posture already built.
    - **A data model / ERD** and a roadmap of the gaps. This is the strategic umbrella over the
      audit-ready stream (#7). Recommended model: **Fable** (strategy; **Opus** while Fable is
      restricted).
23. **Detailed visualization plan for all learning components (added 2026-06-23):** produce a thorough
    design + data-viz plan (e.g. `docs/VISUALIZATION_PLAN.md`) for how **every learning component is
    visually presented** and how progress/data is visualized, consistent with the locked design system
    (bottom nav, dialog overlays, brand, two-tone icons). Scope when picked up:
    - **Component by component:** Vocabulary (flashcards, der/die/das gender colour-coding, visual
      mnemonics — ties #4), Collocations, Grammar drills, Redemittel, Dialogues/Simulations (ties #3),
      Exam mode, Quiz, and the Writing coach.
    - **Progress & data visualization:** the Dashboard (ties #1) and Analytics — SRS due/mastery
      views, XP/levels/streaks, per-theme and per-weakness breakdowns, using the existing `recharts`
      dependency. Define a consistent chart language.
    - **Cross-cutting:** a shared visual vocabulary, empty/loading/error states, motion
      (`framer-motion`) guidelines, dark-mode, and accessibility (contrast, reduced-motion).
    - Deliver mockups/specs per component and a build order. Ties into #1 (Dashboard redesign) and #6
      (Schreibtraining redesign). Recommended model: **Fable** (design direction; **Opus** for now),
      **Sonnet/Opus** for the build.
24. **Deep-dive source review + source strategy (added 2026-06-25):** properly review **every external
    source the content relies on**, confirm each one's **licence and commercial-use terms**, and write a
    coherent **source strategy** as a strand of the data strategy (#22). This is the qualitative "are
    these the right sources, and are we allowed to use them?" pass that complements the mechanical
    `check:refs` link-liveness gate. Scope when picked up:
    - **Audit the sources actually in use:** start from `SOURCE_META` in `src/features/legal/Sources.tsx`
      and the host breakdown the `/sources` page computes from `src/data/provenance.ts` (currently
      Wiktionary, DWDS, Wikipedia, Europarat/CEFR). For each: confirm the real licence + version, whether
      commercial use and our specific use (citing word facts vs. copying lists/sentences) is permitted,
      what attribution it requires, and stability/accessibility of the URL.
    - **Fix problem sources:** e.g. the founder flagged a **dwds.de** item whose reference "asks me to
      login" — find a freely-viewable, citable alternative (or a stable deep link). Generally prefer
      sources that are open without login and unambiguously commercial-safe.
    - **License hygiene:** reconcile what `SOURCE_META` claims against the commercial-safe SPDX allowlist
      the linter enforces and the `provenance.ts` `license` field; flag any mismatch (e.g. CC BY-SA
      share-alike implications for any adapted text, DWDS "reference" status).
    - **Define the strategy:** a ranked list of approved sources per content type (word facts, example
      sentences, grammar, level descriptors), the rule for when each may be used, the attribution
      pattern, and a fallback order. Capture it in `docs/DATA_GOVERNANCE.md` (or the planned
      `docs/DATA_STRATEGY.md` from #22) so future content authoring follows it.
    - Ties into **#7** (audit infrastructure) and **#22** (end-to-end data strategy); this is the
      "sources" chapter of that umbrella. Recommended model: **Fable** (research/strategy; **Opus** for
      now while Fable is restricted).
25. **"EN" peek/translate button (added 2026-07-02, founder idea, NEEDS BRAINSTORMING):** a button at
    the top of the app that translates the whole current screen to English at once, temporarily; the
    founder's sketch is "show EN for a few seconds, then it locks/reverts" so a learner gets a quick
    comprehension check without abandoning German immersion. **Deliberately parked**: the founder wants
    to brainstorm the interaction before anything is built. Notes for when picked up:
    - Pedagogically a "comprehension safety net" on top of the German-first copy policy (see
      `docs/UX_OVERHAUL_PLAN.md` Part H, decision 3). The playbook favours desirable difficulty, so a
      deliberate-friction reveal (e.g. press-and-hold to peek) may beat a free toggle.
    - **Prerequisite already planned:** the UX-overhaul Phase-0 German copy pass keeps every EN string
      as data (blurbs, purposes, etc.), which is exactly what a whole-screen EN layer needs. No conflict.
    - Open questions to brainstorm: what does "the whole screen" cover (UI chrome, learning content, or
      both)? Reveal per screen or per element? What does "locked" mean afterwards (cooldown, daily peek
      budget, nothing)? Accessibility (reduced motion, screen readers).
    - Recommended model: **Fable** for the interaction-design brainstorm, **Sonnet** for the build.

### Product-evaluation findings (added 2026-07-03, from `docs/PRODUCT_EVALUATION.md`)

The five items below (#26–#30) are the recommendations from scoring Genauly against the learning-science
playbook (`docs/LANGUAGE_LEARNING_SUCCESS_FACTORS.md`, Section 11). Each carries a **priority** on a
value·evidence ÷ effort basis (P1 = do first, P3 = nice-to-have) and names the evaluation dimension /
failure mode it closes. Suggested sequence: land the cheap wins that ride alongside other work (#26a
latency logging, #28, #30), then the two big rocks (#27 then #26b), with #29 paired to the AI roadmap.

> **SCOPED 2026-07-03 → `docs/LEARNING_ENGINE_PLAN.md` (approved, not yet implemented).** All five
> items now have a full file-level engineering plan there: Phase 0 = the quick wins (26a + #28 + #30,
> one PR, next build), Phase 1 = FSRS (26b), Phase 2 = the speaking block (#27), Phase 3 = the custom
> deck (#29), with per-item model recommendations, persistence/sync policy, verification recipes, and
> a risk register. Start any of these items from that doc, not from the summaries below.

26. **FSRS scheduler + response-latency capture — Priority P1 (High).** _Fixes eval dim 1; failure mode
    #1._ The playbook's single most-cited upgrade: replace the SM-2 scheduler (`src/engine/srs.ts`) with
    **FSRS** (stability / difficulty / retrievability), which the source reports cuts review volume ~23%
    at equal retention, and score reviews on **latency, not just correctness**. Split into two sub-steps:
    - **26a (quick win, do now):** start *recording* per-review response latency in the review flow and
      SRS card state, even before changing the algorithm, so the training data exists when FSRS lands.
      Small, low-risk, unblocks 26b. Effort: **S**.
    - **26b:** swap SM-2 → FSRS behind the existing `engine/srs.ts` interface (a drop-in the UX plan
      appendix already anticipates), keeping "mastered" cards in long-term rotation. Effort: **M–L**.
    - Recommended model: **Opus** (algorithm + engine correctness).
27. **Speech-first, latency-tracked production drill — Priority P1 (High).** _Fixes eval dim 5 (the
    lowest score, 3/5); failure mode #2._ The blueprint's top exercise recommendation: hands-free,
    time-pressured speech-recognition drills that build spoken fluency, which today's scripted
    option-selection speaking does not. **MVP:** a new `SessionPlayer` block that prompts the learner to
    *say* the target under a soft timer, captures it via the existing Web Speech STT (`src/engine/
    speech.ts`, already feature-detected), and scores accuracy + latency; graceful text fallback when STT
    is unavailable. Upgrade path to Azure/SpeechAce phoneme scoring behind a paid tier later. Effort:
    **M–L.** Recommended model: **Opus** (new session block + speech integration).
28. **Guess-before-reveal (errorful learning) — Priority P2 (Medium, quick win).** _Fixes eval dim 1;
    failure mode #3._ Prompt a quick guess before showing a translation/answer (anticipatory prediction
    error), a cheap, high-evidence technique the playbook calls out. **MVP:** an optional "guess first"
    step in the existing flashcard/quiz components; measure repeat-error rate. Effort: **S.** Recommended
    model: **Sonnet**.
29. **Hook "investment" surface: custom decks / word capture — Priority P2 (Medium).** _Fixes eval dim 3;
    failure mode #4._ Today users build little "stored value", so switching cost stays low. **MVP:** a
    "Zu meiner Liste" / save-word action and a personal list that feeds the SRS with the learner's own
    context; later, import a word/sentence from anywhere. Pairs naturally with the AI sentence-mining idea
    in `docs/AI_PRODUCT_STRATEGY.md` (idea 11). Effort: **M** (touches store + cloudSync + a new surface).
    Recommended model: **Opus** (store/sync wiring), **Sonnet** for the UI.
30. **Talker variability: multi-voice TTS + speed toggle — Priority P3 (Low, quick win).** _Fixes eval
    dim 1/2 (phonological transfer); failure mode #5._ A single TTS voice ties schemas to one sanitized
    speaker; the playbook flags multi-voice/speed exposure as a productive desirable difficulty. **MVP:**
    let `engine/speech.ts` rotate among available `speechSynthesis` voices per session block, plus a
    speed toggle in settings. Effort: **S.** Recommended model: **Sonnet**.

## Model guidance — which Claude model to set per session (added 2026-06-11)

> **Fable available again (2026-07-02):** the earlier restriction (noted 2026-06-15) is lifted; Fable
> is selectable and session 46's app review + UX overhaul plan ran on it. The "Opus for now"
> workaround no longer applies; "Recommended: Fable" rows mean Fable again.

We now have **Fable 5** as the frontier model alongside the Claude 4/5 families. Claude Code does
**not** auto-pick a model per task: whatever you set in `/model` runs the whole session, and the
assistant can't reassign itself mid-task. So set the model at the **start of each session** based
on the dominant work. (Subagents the assistant spawns can run on a cheaper model on their own, but
that's separate from the main session model.)

Rule of thumb: **design/decide with Fable, build with Opus/Sonnet, fill-in with Haiku.** Step up a
tier for ambiguous or high-stakes work (legal, payments). `opusplan` is a useful hybrid: Opus while
planning, then auto-switches to Sonnet for execution.

| Model | Best for | Cost |
| --- | --- | --- |
| **Fable 5** (frontier) | Architecture/system design, legal nuance, pricing/monetization strategy, persuasive marketing copy, research-heavy planning | Highest |
| **Opus 4.8** | Heavy cross-cutting implementation: multi-file features, careful refactors, security-sensitive integrations | High |
| **Sonnet 5** | Standard build work: well-specified features, UI from an approved plan, structured content authoring, doc-following integrations | Medium |
| **Haiku 4.5** | Mechanical, well-bounded edits: placeholder fills, config flips, single-file copy tweaks | Low |

Backlog items mapped to a recommended model (see "Backlog — founder ideas" and "Resume here"):

| Task | Recommended | Why |
| --- | --- | --- |
| Fill data-location placeholder (privacy DE/EN) | **Haiku** | One mirrored line, no judgment |
| Fill Impressum address + re-enable route/links | **Sonnet** | Mechanical but multi-file; must not break build |
| Enable pg_cron writing-text retention | **Sonnet** | Apply provided SQL with light care |
| Draft legal enforceability additions (Widerrufsrecht, liability, language-precedence) | **Fable** | German/EU legal reasoning, binding DE version |
| Content QC pipeline — CI lint (dup IDs, broken nodes) | **Sonnet** | Bounded script + CI wiring |
| Content QC — pedagogical / German accuracy review | **Fable** | B2-level correctness judgment |
| Grammar drills 47 → 80 | **Sonnet** | Follows established schema; Fable for a final accuracy pass |
| Vocabulary 504 → 600+ | **Sonnet** | Bulk schema-following content |
| FAQ section (landing) | **Sonnet** | Straightforward copy + UI |
| Expand landing copy | **Fable** | Persuasive, on-voice copy; Sonnet if budget-conscious |
| Visual mnemonics for vocab (der/die/das) | **Sonnet** | Asset wiring against existing schema |
| Dashboard redesign | **Opus** | Superseded by UX overhaul Phase 1 (see the phase table below) |
| Schreibtraining redesign | **Opus** | Cross-section rework |
| Animated-character scenarios | **Fable → Opus** | Design with Fable, implement with Opus |
| Legal review with a lawyer (#15) | **Fable** | Engage/brief a lawyer; German/EU legal judgment, not code |
| Resend SMTP / LanguageTool key | **Haiku** | Config-level, follow docs |
| Turnstile CAPTCHA on guest sign-in | **Sonnet** | Follows provider docs, some care |
| Google sign-in branding completion | **Sonnet** | Mostly console steps + guidance, little code |
| Gate Schreibtraining behind sign-in | **Sonnet** | Reuse existing `AuthDialog` |
| Pricing page + plan/tier design | **Fable → Sonnet** | Strategy with Fable, build page with Sonnet |
| End-to-end data strategy (#22) | **Fable** (Opus for now) | Cross-cutting strategy + data modelling, not code |
| Visualization plan for learning components (#23) | **Fable → Opus/Sonnet** | Design direction with Fable, build the views with Opus/Sonnet |
| Monetization tier + paywall feature flags | **Opus** | Backend + UI + careful gating logic |
| Payment gateway integration | **Opus** | Money-handling; Fable for architecture/security design |
| Domain-based content filtering (by sector) | **Fable → Opus** | Data-model design with Fable, implement with Opus |
| Content sourcing/audit pipeline | **Fable** | Research-heavy design + verification workflow |
| SEO optimization (meta, sitemap, structured data) | **Sonnet** | Largely mechanical |
| Marketing campaign | **Fable** | Planning + creative |
| Business plan + case study (#16) | **Fable** | Market sizing, competitive research, unit economics, traction narrative |
| Pre-seed fundraising (#17) | **Fable** | Investor targeting, pitch deck, data room, instrument strategy |
| Routine bugfixes (e.g. UI tweaks) | **Sonnet** | Step up to Opus only when a fix turns gnarly or spans many files |

### UX overhaul plan phases mapped to models (added s46; see `docs/UX_OVERHAUL_PLAN.md`)

The design/strategy work is already done (Fable, s46), so the phases below are **implementation**:
do not burn Fable on them. Fable reappears only where new pedagogical content gets authored.

| Phase | Scope | Recommended | Why |
| --- | --- | --- | --- |
| 0. Quick wins | Banner demotion, header slimming, German copy pass, cold-start state | **Sonnet 5** | Well-specified multi-file edits; founder reviews the German copy on the live site |
| 1. Session engine + Heute | `engine/session.ts`, SessionPlayer, end screen, Heute redesign | **Opus 4.8** | The big cross-cutting build: new engine + player + dashboard rework, regression-sensitive |
| 2. Global search + Tier-0 defaults | `searchAll()`, result sheet, band-default lists | **Sonnet 5** | Bounded: one pure function + one UI surface + list defaults |
| 3. Bibliothek + travelling scope | `/library` hub, segments, redirects, scope as app state | **Opus 4.8** | Routing/redirect/app-state work across four pages; easy to regress deep links |
| 4. Fortschritt + Can-Do | `canDo.ts` data + linter, milestone UI, diagnose card | **Fable → Sonnet 5** | Can-Do statements are pedagogical German content (Fable authors/reviews); UI build is standard |
| 5. Anwenden + nav re-map + facet registry | Anwenden hub, `DEFAULT_PINNED_TABS`, `lib/facets.ts` | **Opus 4.8** | Touches the locked nav store + pinned-tab migration; careful, not big |

## Resume here (next session)

**Handoff after session 49 (2026-07-02). Phase 5 is COMPLETE ✅ — the whole UX overhaul roadmap
(Phases 0–5) is now shipped.** The IA restructure (PR #262, `c317047`) is founder-verified live; the
Tier-3 tail then shipped in two more PRs: the **facet registry + Verb-facet drop** (PR #264, `1141cde`)
and the **Vokabeltrainer tab removal** (PR #265, `ae67862`). **All three PRs are deployed live** (the
`ae67862` Pages deploy went green on the first attempt, no flake this time). Recap of the four-zone nav: new
**Anwenden hub** (`/anwenden`), new **Bibliothek hub** (`/library?tab=…`) with the four old library
routes redirecting in, the founder-unlocked `DEFAULT_PINNED_TABS` four-zone default, and a settings-store
persist migration (`version: 1`) remapping existing users' pins/More-order. The s26–28 bottom-bar
mechanics stayed locked throughout. Branch `claude/next-step-kve6wf` (reassigned per session; `main` is
the source of truth).

**⚠️ Deploy note (recurring):** the `pages.yml` **deploy** job failed on the `c317047` merge with GitHub's
transient `##[error]Deployment failed, try again later` on the `actions/deploy-pages` step (the build +
artifact upload succeeded; it is a Pages-platform flake, not a code issue). The **same flake also hit the
Phase-4 merge `74ccd7c`.** Remedy: re-run the failed deploy job (GitHub Actions → the failed
"Deploy site to GitHub Pages" run → "Re-run failed jobs"); attempt 2 went green both times. It has now
recurred twice, so consider hardening `pages.yml` with an automatic retry on the deploy step if it keeps
happening.

**Phase-5 tail — DONE this session (session 49 cont.):**
1. **Facet registry** `src/lib/facets.ts` (PR #264, `1141cde`): facet defs declared once per content type
   (`vocabFacets`/`collocationFacets`/`redemittelFacets` + `*_FACET_IDS`), derived from the taxonomy
   enums; the three browse pages now consume it instead of hand-wiring. **Dropped the 100-option Verb
   facet** from Kollokationen (search covers verb lookup) and codified the **≤12-option rule**
   (`MAX_FACET_OPTIONS` + a dev-time warning in the `facet()` builder). No UI change (same `FacetDef` →
   same `FacetSheet`).
2. **Vokabeltrainer tab removal** (this session's final PR): the in-page Karteikarten + Quiz tabs are
   retired behind a reversible `SHOW_PRACTICE_TABS = false` flag in `VocabularyTrainer.tsx`, so the
   Vokabeltrainer is now the browse/inspect surface (word list) and focused practice flows through the
   toolbar's **Üben → composed session**. Hero copy updated to match. `Flashcards`/`VocabQuiz` stay in the
   repo (used by the session engine).
   - **`/quiz` decision:** the standalone hub is off the nav (its "retired" state) but kept as a live
     route, reachable via deep links (GrammarHub "Wissen im Quiz testen" + `practiceAreas`). A hard
     redirect was deliberately NOT added, so those deep-link intents keep working. Flip
     `SHOW_PRACTICE_TABS` back to `true` to restore the vocab tabs if the founder prefers them.

**Next big rocks (UX overhaul is fully complete):** the **learning-engine roadmap in
`docs/LEARNING_ENGINE_PLAN.md`** (approved 2026-07-03, backlog #26–#30; **Phase 0 quick wins = 26a
latency capture + #28 guess-first + #30 voice variety is the designated next build**, then FSRS /
speaking block / custom deck), the optional taxonomy follow-ups (human-verify the
AI-drafted `cefr` tags via provenance `draft→verified`; broaden `sector`/`workSituation` tagging; extend
sub-themes past 3 of 11), a new **life-domain theme** (banking / healthcare / housing) per the product
scope, and the recurring `pages.yml` deploy-flake hardening (see the deploy note above). Backlog #25 (the
"EN peek" whole-screen translate button) is still parked pending a brainstorm.

**Phase 3 scope decision (founder, 2026-07-02):** Phase 3 shipped as a **soft merge** (founder chose
this over full consolidation). The four library pages got the single-hub feel (segmented switcher +
travelling scope + Üben) *without* a route merge or nav change, so nothing the founder uses was
removed and the locked bottom bar was untouched. The **hard merge** deferred to **Phase 5** (the nav
re-map phase): the single `/library` URL + old-route redirects + retiring the standalone Quiz
section + removing the Vokabeltrainer's in-page Karteikarten/Quiz tabs (superseded by Üben →
session). Fold these into the Phase 5 work.

**Most recent work (session 49):**
- **s49 — UX overhaul Phase 5 IA restructure SHIPPED ✅ (Anwenden hub + Bibliothek hub + four-zone
  nav re-map):** the visible heart of Phase 5, delivered as a mostly-additive PR so no deep link or
  founder-used surface broke.
  - **Anwenden hub** (`src/features/anwenden/AnwendenHub.tsx`, route `/anwenden`): one hub with three
    big cards (Sprechen → `/simulation`, Schreiben → `/writing`, Prüfung → `/exam`), giving the transfer
    layer equal visual rank. `SimulationHub`'s title renamed **"Lösung finden" → "Sprechsimulation"**
    (the telc module name kept only in the description).
  - **Bibliothek hub** (`src/features/library/LibraryHub.tsx`, route `/library`): the deferred Phase-3
    **hard merge**. `/library?tab=woerter|kollokationen|redemittel|grammatik` lazy-mounts the existing
    Vokabeltrainer / Kollokationen / Redemittel / Grammatik surfaces (each still renders its own HubHero
    + `LibrarySwitcher`). `LibrarySwitcher` is now **tab-based** (switches `?tab=` under `/library`,
    carrying the travelling scope). The four old routes redirect in via a `LibraryRedirect` component
    that **preserves every query param** (theme/sub/cefr/q/cat…), so cross-module "Verbunden" jumps,
    `searchAll` deep links, intent cards and `practiceAreas` routes keep working untouched.
  - **Four-zone nav re-map** (`nav-items.ts`): navItems collapsed from 12 to **Heute · Bibliothek ·
    Anwenden · Fortschritt · Einstellungen**; `DEFAULT_PINNED_TABS = ["/", "/library", "/anwenden",
    "/analytics"]` (founder-unlocked, Part-H decision 2). Custom two-tone route marks added for
    `/library` (stacked books, blue + neon-cyan) and `/anwenden` (target, orange + neon-amber) in
    `route-icons.tsx` + `NORM`. **The s26–28 bar mechanics (edit mode, jiggle, drag-reorder, More sheet,
    icon rules/sizes) were NOT touched** — only the item list + default pins, exactly the approved scope.
  - **Settings-store migration** (`useSettingsStore`, now `persist` `version: 1`): a `migrate` +
    `ROUTE_SUCCESSOR` map remaps a pre-Phase-5 learner's saved `pinnedTabs`/`moreOrder` onto the new
    zones (`/vocabulary`,`/collocations`,`/redemittel`,`/grammar`,`/quiz` → `/library`;
    `/writing`,`/simulation`,`/exam` → `/anwenden`; `/revision` → `/`), de-duping and keeping Home first,
    so nobody's custom bar silently loses icons.
  - **Deliberately deferred** (documented in "Resume here"): the facet registry / Verb-facet drop and the
    plan's in-page removals (quiz retirement + Vokabeltrainer tab removal). Kept `/quiz` a working route
    (off the nav) and left the vocab Karteikarten/Quiz tabs in place to avoid a surprising feature
    removal inside the nav PR.
  - **Verified:** `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green. Headless-Chromium
    mobile smoke (390px) confirmed: the four-zone bottom bar renders (Heute · Bibliothek · Anwenden ·
    Fortschritt · Mehr); `/library` + all four `?tab=` segments render; `/anwenden` shows the three
    cards; `/vocabulary?theme=behoerde` redirects to `/library?theme=behoerde&tab=woerter`; the
    Simulation title reads "Sprechsimulation"; **and** a seeded pre-Phase-5 profile (`version: 0`, old
    pins `["/","/vocabulary","/quiz","/analytics"]`) migrates to `["/","/library","/analytics"]` with
    zero console errors.

**Most recent work (session 48):**
- **s48 — UX overhaul Phase 4 UI half (Fortschritt redesign) SHIPPED ✅:** built the three pieces
  from plan E5 on top of the session-47 Can-Do content. **Can-Do milestone section** in
  `Analytics.tsx`, now the page's lead: for each theme (sorted least-mastered-first, same order as
  the mastery grid) lists its `canDoByTheme(themeId)` statements, checked off when the theme's
  mastery ratio (already computed as `themeStats`) crosses the statement's `threshold`; a header
  badge shows the overall `achieved/total` count. **Diagnose card**: shows the current weakest CEFR
  band (`weakestBand`) or, for a fresh learner with no started cards, the weakest theme
  (`weakestTheme`, mode-aware, both pure exports of `engine/session.ts`), with a one-tap "Session
  dazu starten" button that navigates to `/session?theme=<weakTheme>`. **Relocated the theme mastery
  grid**: removed the "Deine Themen" browse grid from `Dashboard.tsx` (Heute) — it already lived on
  Fortschritt as "Beherrschung nach Thema" — and replaced it with a quiet "Alle Themen" card linking
  to `/vocabulary`; Heute is now hero + Situationen + status strip + that link. No new engine or data,
  UI assembly only. `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green; headless-Chromium
  mobile smoke pass confirmed the Can-Do section renders checked/unchecked milestones correctly against
  seeded `srs` progress, the diagnose button navigates to `/session?theme=...`, and the Heute theme grid
  is gone with "Alle Themen" in its place. Shipped in PR #260 (bundling the session-47 content
  commits), squash-merged to `main` as `74ccd7c` after `lint-content` CI passed.

**Most recent work (session 47):**
- **s47 — UX overhaul Phase 4 CONTENT half (Can-Do bank + linter) committed (merged in session 48
  via PR #260, together with the UI half):** new
  `src/data/canDo.ts` — **25 `CanDoStatement` Can-Do milestones**, 2–3 per theme across all 11 themes,
  pitched at ascending CEFR bands (B1.2 → B2.1 → B2.2) with ascending mastery `threshold`s. Each is a
  German "Ich kann …" statement written in our own words, **aligned to the Council of Europe CEFR
  self-assessment descriptors** (cited in provenance, never reproduced; Goethe "Kann-Beschreibungen"
  stay on the avoid list) — the exact Part-H-decision-4 recipe. New `CanDoStatement` type + `can_do`
  provenance content type (with the `/sources` page label + `TYPE_ORDER` entry); **25 provenance rows**
  (`origin: authored`, `license: OWNED`, reference = CoE self-assessment grid; **founder-reviewed and
  approved 2026-07-02 → all now `review_status: "verified"`**). New `lint:content` rules (`lintCanDo`): unique ids, valid
  `themeId`/`cefr`, "Ich kann" prefix, `threshold` in `(0,1]`, and every theme covered; the bank is
  loaded + counted (25 milestones · 1111 provenance rows). Helper `canDoByTheme`. `pnpm typecheck` +
  `pnpm lint:content` + `pnpm build` green. Committed as `93eb4b7`. This is the Fable-authored content
  step; the founder verifies the German. (The UI half followed in session 48, see above.)
- **s47 — UX overhaul Phase 3 (library soft-merge + travelling scope) shipped:** new
  `src/store/useLibraryScope.ts` (in-memory zustand) holds the **Tier-2 travelling scope** — the
  active library `{theme, sub}` as app state, so picking a theme once follows the learner across the
  theme-scoped segments until changed. New `src/features/library/LibrarySwitcher.tsx` renders a
  segmented control (Wörter | Kollokationen | Redemittel | Grammatik) on all four library pages, each
  link carrying the shared scope, plus a dismissible `ScopeChip` on the theme-scoped surfaces.
  Vokabeltrainer + Kollokationen **hydrate** their theme from the shared scope when arriving without
  an explicit `?theme=` (e.g. via the bottom bar) and **sync** their effective theme back into it
  (dropdown or deep link) via a `useEffect` on the effective theme — so scope travels both directions
  while URL params still override for shareable deep links. An **"Üben"** button on the Vokabeltrainer
  and Kollokationen toolbars launches a scoped composed session (`/session?theme=`), folding the
  quiz-launch entry point into the Phase 1 engine (Kollokationen's old "Quiz: theme" button was
  repointed). The redundant "durchsuchen" collocations shortcut on the Grammar hub was removed (the
  switcher supersedes it). **Nothing else was removed; the locked bottom bar + nav registry +
  `DEFAULT_PINNED_TABS` are untouched** (that consolidation is Phase 5). `pnpm typecheck` + `pnpm
  lint:content` + `pnpm build` green; verified in headless mobile + desktop smoke passes (scope
  travels Wörter→Kollokationen carrying `?theme=behoerde`; Üben → `/session?theme=behoerde` whose
  first card was a Behörde word; the switcher renders on all four pages; the chip dismiss returns to
  the unscoped list). **Bug caught + fixed mid-build:** a deep-link `?theme=` didn't populate the
  scope store (only the dropdown did), so scope didn't travel; fixed by syncing the effective theme
  into the store via effect rather than only on the dropdown handler.
- **s47 — UX overhaul Phase 2 (global search + Tier-0 defaults) shipped:** new `src/lib/search.ts`
  `searchAll(query)` — one query over vocabulary, collocations, Redemittel, grammar topics and
  dialogue scenarios together (linear scan, no index needed at ~1,000 items), returning grouped
  results that deep-link into each bank's home surface (`/vocabulary?theme=&sub=`,
  `/collocations?theme=&q=`, `/redemittel?cat=`, `/grammar?topic=`, `/simulation`). New
  `GlobalSearch.tsx` dialog (reuses the locked `Dialog`/`bg-dialog-overlay` primitive): a header
  icon on mobile, a Sidebar entry + ⌘K/Ctrl+K global shortcut on desktop, both wired through one
  controlled `open` state in `AppShell.tsx`. This replaces the three siloed per-page search boxes
  as the *primary* discovery path; the per-page boxes remain as scoped refiners (unchanged). New
  Tier-0 personalized defaults in `src/lib/cefr.ts` (`defaultVisibleBands`/`hiddenBandsLabel`,
  mapping the learner's stored coarse `CefrLevel` to the fine-grained `ContentCefr` band + one step
  up): Vokabeltrainer, Kollokationen and Redemittel now default their list to that band instead of
  an unfiltered pile, with a quiet "Auch B2.2 · C1 zeigen (n)" escape link (not a facet chip).
  **Found and fixed during verification:** the vocabulary bank is tagged only B1.2/B2.1/B2.2 (no
  A2/B1.1/C1 items exist), so the naive "level + 1 band" default rendered a **fully empty list** for
  an A2-level learner. Fixed with a non-empty guard (`bandNonEmpty` check) on all three pages: the
  default only activates when it would leave at least one result for the current scope, otherwise
  it's skipped entirely (no filtering, no escape pill) — the same "never let the learner tap into an
  empty screen" invariant the s45 FacetSheet already guarantees. `pnpm typecheck` + `pnpm
  lint:content` + `pnpm build` green; verified in headless mobile + desktop smoke passes (global
  search open via icon tap, text query, result click-through; ⌘K open on desktop; CEFR band default
  at B1 showing 477/528 with the escape pill, at A2 correctly falling back to the full list, at B2
  showing everything unfiltered since B2 is the app's target level).
- **s47 — UX overhaul Phase 1 (session engine + Heute) shipped (earlier in the session):** the core "one tap, one composed
  session" loop. New pure composer `src/engine/session.ts` (`buildSession` + deterministic
  `sessionPreview` + `weakestBand`/`weakestTheme`/`difficultyForLevel`) turns SRS state + Mode lens +
  a target length into an ordered, **interleaved** `SessionPlan` (new `SessionBlock`/`SessionPlan`
  types): due vocab flashcards (weighted via `reviewWeight`/`isDue`), leveled quiz questions from the
  weakest or scoped theme (via `buildThemeQuiz`), a grammar micro-drill, and a Redemittel recall,
  mixed not blocked. New `src/features/session/SessionPlayer.tsx` renders every block kind behind one
  progress bar + XP tally and an **end screen** (XP earned, "Stärker geworden" list, "Morgen: …
  festigen" forward hook); `Session.tsx` route wrapper reads `?theme=`/`?min=`. New `/session` route.
  **Heute** (`Dashboard.tsx`) now leads with a primary session CTA hero (composition preview from
  `sessionPreview`) + compact Situationen chips that launch scoped sessions (`/session?theme=`),
  replacing the browse-card wall; status strip keeps a "Schnelle Runde" secondary + Fortschritt link.
  **Schnellwiederholung** (`/revision`) is now the short (~5 min) preset of the same engine
  (`QuickRevision.tsx` is a thin wrapper). Reuse, not rewrite: the three quiz-question views were
  extracted to shared `src/features/quiz/QuestionViews.tsx` (used by both `QuizRunner` and
  `SessionPlayer`), and `GrammarDrillCard` gained optional `onResult`/`suppressXp` props (backwards
  compatible). `pnpm typecheck` + `pnpm lint:content` + `pnpm build` green; verified in a headless
  mobile smoke pass (Heute hero, a full 16-step session driven to the XP/stärker end screen, and the
  8-step `/revision` preset), no console errors.
- **s47 — UX overhaul Phase 0 (quick wins) shipped (earlier in the session):** sign-in banner now shows only on Heute
  (dashboard) and its dismissal persists (`signInBannerDismissed` in `useSettingsStore`, was
  session-only local state before); header slimmed from 5 to 4 mobile widgets (removed the
  redundant Level pill + XP ring, both already visible on Fortschritt; added an `aria-label` to
  the streak pill); added German `blurbDe` to all 11 theme cards and `purposeDe` to all 10 grammar
  topics (English `blurb`/`purpose` kept as a secondary field per the plan, for a future EN-UI
  mode), wired into `Dashboard.tsx`/`GrammarHub.tsx`; renamed the dashboard heading
  "Prüfungsthemen" → "Deine Themen" (matches the broader post-s21 scope, not exam-only) and
  "Quick Review" → "Schnelle Runde" in `QuickRevision.tsx`; Fortschritt (`Analytics.tsx`) now shows
  a "Dein Ziel" goal card (level + goal + minutes/day, sourced from existing onboarding settings,
  reusing `recommendedNext()` for the CTA) instead of four zero-value stat tiles when the learner
  has no XP/sessions yet. `types/index.ts` + `scripts/lint-content.mjs` updated for the two new
  required content fields (`blurbDe`, `purposeDe`). `pnpm typecheck` + `pnpm lint:content` +
  `pnpm build` green; verified live in a headless-Chromium mobile-viewport smoke pass (dashboard,
  grammar, revision, analytics screens).

**Most recent work (sessions 45–46):**
- **s46 — UX overhaul plan (docs-only, approved):** full app review, filter-plan critique, four-tier
  filter architecture + four-zone IA + session engine design, all Part-H decisions recorded, backlog
  #25 added (EN peek button, needs brainstorming). See the session 46 entry above.
- **s45 — Filter harmonization (Phase 1 + 2) implemented:** shared `BrowseToolbar` + `src/lib/cefr.ts`;
  identical `[Search] [Theme/Kategorie ▾] [Filter]` toolbar on the three browse pages; verb filter moved
  into the FacetSheet; QuizHub CEFR labels via `difficultyToBand`. See the session 45 entry above.

**Most recent work (sessions 35–40):**
- **s40** — **tripled the collocations bank** from 132 to 396 entries (+24/theme across all 11 themes).
  **Hid the English example translation** on `/collocations` cards (phrase gloss stays). **Hid the
  Kollokationen tab** inside Wortschatz (reversible, commented out). 264 provenance rows added (total
  1073). Added **Select dropdown scrim overlay** using the locked `bg-dialog-overlay` convention
  (PRs #227–#229); tracks open state via context so the scrim only shows while the dropdown is open.
  `pnpm lint:content` and `pnpm build` green.
- **s39** — fixed mobile **card grids overflowing off the right edge** (Kollokationen `formell` badge
  clipped). Root cause: responsive `grid-cols-N` with no base `grid-cols-1` falls back to an implicit
  max-content column on mobile. Added `grid-cols-1` across every affected grid (PR #219). Also
  **removed the `UserPromptSubmit` prompt-logging hook** (PR #221) at the founder's request; the prompt
  log is now **manual-only** (founder will ask when to log). `docs/prompt-log-raw.jsonl` kept as
  history, no longer written to. Noted but did not fix a **mismatched German quote** (`„…"` vs `„…"`)
  in the collocation example sentences. Added an **explicit Save button to the `/sources` admin
  overlay** (PR #223); founder ran **Supabase migration 0004** and confirmed source-review saving now
  works. Added **backlog #24** (deep-dive source review + source strategy, PR #224); the **dwds.de
  source swap is deferred** under that item.
- **s35** — Wortschatz tab overflow fix.
- **s36** — aligned the dedicated `/collocations` (Kollokationen menu) cards to the Wortschatz
  Kollokationen tile design (truncating semibold phrase, muted meaning, `formell` badge instead of an
  indigo background, divider + italic German example), keeping the browser's extra content (example
  English line + its audio button).
- **s37** — founder-only **source-verification overlay** on `/sources`: a Supabase-backed,
  admin-only (gated to `thelivinsine@gmail.com`) layer to mark provenance entries verified and add
  private comments. **Action still pending on the founder:** run `supabase/migrations/0004_provenance_reviews.sql`
  in the Supabase SQL Editor so the saves persist (see `docs/PHASE2_SETUP.md` → "Admin source review").
- **s38** — fixed the **sign-up button staying disabled when email/password are autofilled** (iOS
  Safari / password managers don't fire React's `onChange`; added a `:-webkit-autofill` animation hook
  in `index.css` that `AuthDialog` reads into state). Also investigated a "collocations tiles cut off"
  report and found **no bug** (the shared `.pb-nav` already clears the bottom bar by 24px; the
  screenshot was the top of the list mid-scroll). Awaiting founder confirmation at the true bottom of
  the list before any further change.

**Older nav handoff (sessions 26–28):** the bottom tab bar + More sheet are locked, see the
CLAUDE.md "Mobile bottom tab bar" section for the full rules. Highlights: removed context strip, 63px
rail, drag-reorderable bar + sheet, two-tone neon route marks, compact-squircle grey selection
backdrops, opacity-only enter/exit.

**Earlier nav work (sessions 23–26):** data-governance v0.2/v0.3 + boot-splash fix (s23), unique
per-route icon colours + all-custom branded SVG marks (s25), and the **mobile nav overhaul (s26)**:
removed the bottom-bar context strip, a 63px rail with 29px icons (matched in the More sheet),
Mehr tab shows selected state + toggles the sheet closed, the sheet closes on navigation, the More
sheet is now drag-reorderable (persisted in `useSettingsStore.moreOrder`), and add/remove use
`layout` + `AnimatePresence` movement animations (opacity-only enter/exit so the jiggle never
freezes). A late fix also stopped an intermittent horizontal-shift glitch by clipping `overflow-x`
on `<html>` (not just `<body>`) so a briefly-mispositioned Radix portal can't leave the page stuck
scrolled sideways. See the Session 26 log above for details and the CLAUDE.md "Mobile bottom tab
bar" section for the locked behavior.

**Earlier handoff (sessions 9–22, 2026-06-04 → 06-14):**

**Shipped & live (all on `main`):**
- **Blank-page bug FIXED (s9):** circular ESM chunk → pre-React TDZ crash + permanent crash painter.
- **Mobile UX safe-area insets (s10):** `.pt-safe`/`.pb-safe-8` for notched iPhones.
- **Installable PWA (s11):** service worker, web manifest, icons, offline-first.
- **iOS standalone / no address bar (s13):** `apple-mobile-web-app-capable` meta tags.
- **Mobile bottom tab bar (s15, PR #76):** native bottom nav. Desktop sidebar untouched.
- **Mobile density & fit (s15, PRs #77–#78):** `sm:`-gated tightening across all components/pages.
- **Content expansion (s16, PR #80):** 10 scenarios · 10 exam sets · ~504 vocabulary words.
- **Security hardening — ALL COMPLETE ✅ (s17–18, PRs #85–#93):**
  - pnpm migration + react-router vuln fix · Edge Function CORS/caps · self-hosted fonts ·
    CI SHA-pinning · Turnstile CAPTCHA (frontend + Cloudflare + Supabase) · CSP enforcing.
  - See `docs/SECURITY.md` for full details. No open security items remain.
- **Streak display bug fixed (s18, PR #90):** `useEffectiveStreak()` — no more stale values
  after missed days.
- **Stale SW chunk crash fixed for real (s18, PRs #95, #97):** `recoverFromStaleAssets()` in
  `src/lib/recover.ts` clears caches + unregisters the SW before reloading (round 1's
  reload-only fix wasn't enough, the SW kept re-serving stale `index.html`).
- **Onboarding Zurück button fixed (s18, PR #98):** navigates to `/welcome` on step 1 instead
  of being a dead disabled button.
- **Em dashes removed app-wide (s18, PR #99):** ~30 strings rewritten; rule documented in
  `CLAUDE.md` "Writing style" section for future AI sessions.
- **Real `/privacy` page shipped (s18, PR #100):** `https://genauly.de/privacy` — plain-language
  Datenschutzerklärung, linked from landing footer + Settings; gives the founder a URL for the
  Google OAuth brand-verification form.
- **Clean URLs shipped (s18 cont.):** migrated `/#/...` hash routing to real `/...` paths via
  `createBrowserRouter` + the GitHub Pages SPA redirect trick (`public/404.html` +
  `public/spa-redirect.js`). Verified locally end-to-end with a GitHub-Pages-accurate static
  server + Playwright. **Founder must verify Google sign-in still works live** (the one part
  that can't be tested from the sandbox — see Session 18 log for why).
- **Dialog overlay redesign locked (s19, PRs #106–#109):** dropped backdrop-blur, toned the card
  shadow down ~50% (`shadow-elevated-soft`), replaced the flat black overlay with a brand-tinted
  radial spotlight (`bg-dialog-overlay`) — now the **standard convention for all popups/dialogs**
  going forward (see "Decisions locked" and `CLAUDE.md` → "UI conventions — modal / popup overlays").
- **Sign-in dialog UX fixes (s19, PRs #113–#114):** added a top segmented "Konto erstellen /
  Anmelden" toggle (the old bottom link was easy to miss); removed the inaccurate "we only use
  your email for sign-in" microcopy line.
- **Brand identity unified (s19, PRs #116–#118):** the gradient-Sparkles brand mark was replaced
  app-wide with the actual G-wordmark logo (`/favicon.svg`, also the favicon/PWA icon) in all 6
  spots it appeared — sign-in dialog, mobile header, desktop sidebar, landing page, onboarding,
  and the `/privacy` page header. Sparkles remains as a content/decorative icon elsewhere
  (onboarding step headers, guest-progress notes) per the founder's "keep it for later".

- **Legal pages — bilingual + Terms added (s20, PR #123):** `/privacy` and a new `/terms`
  (Terms of Service / AGB) share a `LegalChrome` shell with a **Deutsch / English toggle** (default
  German, German is binding). Full DE + EN content; em dashes fixed. Footer + Settings link to both.
- **Default logo locked (s20, PRs #120–#122):** rounded gradient "G" with transparent corners,
  canonical file `public/genauly-default-logo-transparent-corners.png`, used in all 6 in-app spots.
  Full-bleed square is for Google's OAuth consent crop only, never the app. (`CLAUDE.md` → "Brand logo".)
- **GDPR pass shipped (s20, PR #126):** consent capture at sign-up + onboarding (`CONSENT_VERSION`),
  in-app data export, in-app account deletion (`delete-account` Edge Function), per-submission writing
  delete (`writing_delete_own` policy, migration 0003), honest reset (also clears cloud when signed in).
  Founder ran the migration + deployed the function live, so all are active. No cookie banner needed.
- **Impressum built but HIDDEN (s20, PR #127):** `/impressum` exists but is unrouted with all links
  removed until the founder provides a business/service address (it is public by law). Re-enable steps
  in `CLAUDE.md`, `docs/PHASE2_SETUP.md`.
- **Writing history records task + text (s20, PRs #128–#129):** the Verlauf now shows the Aufgabe and
  the learner's own submitted text in an expandable, well-structured entry (tip box + labeled sections).
- **Google OAuth consent branding DONE (s20):** founder completed the Google Cloud Console steps
  (app name "Genauly" + logo, domain `genauly.de` verified via Namecheap DNS TXT, app published).

- **Broader B1-B2 positioning (s21, PR #140):** landing page re-copied for "German for real life,
  B1-B2 plateau" framing (exam prep repositioned as secondary); new `/about` page with plain-language
  purpose + Google sign-in data explanation; business plan `docs/BUSINESS_PLAN.md` v1.1; backlog
  #18 documented. Exam naming corrected throughout public copy.
- **Consent gating fix (s21, PR #141):** sign-up always starts with consent unchecked (previous
  `hasConsented()` pre-check removed); checkbox moved above the Google button so the dependency
  is visually clear. Login tab unchanged.

- **Static pre-render fallback in `index.html` (s22, PR #143):** full purpose text embedded
  directly in `#root` so Google's OAuth branding reviewer (a no-JS HTML crawler) sees the app
  description. React clears it on boot; real users never see it.
- **Tagline unified: "German for real life" (s22, PR #145):** updated all six surfaces that still
  showed the old "German that clicks" tagline (onboarding, landing footer, `package.json`,
  `vite.config.ts` PWA manifest name + description).
- **Home-screen icons full-bleed opaque (s22, PR #146):** `apple-touch-icon.png` + `pwa-*.png`
  regenerated without transparent corners so iOS home-screen icon has no dark corner artifacts.
- **Favicon replaced with real logo PNGs (s22, PR #146):** `favicon-32.png` + `favicon-16.png`
  generated from the actual logo (replacing `favicon.svg` which used a plain system-font "G").
  `index.html` updated to link to the new PNGs; filename change busts browser favicon cache.
- **Google OAuth branding verification re-submitted (s22):** static pre-render fix is technically
  complete. Founder re-submitted via Google Cloud Console. Async review pending (email from Google
  expected; hours to days). Do NOT re-click "I have fixed the issues" again while waiting.
- **Cloudflare Pages migration decided (s22):** founder confirmed migration from GitHub Pages to
  Cloudflare Pages after OAuth branding clears. Migration prep will be done in a future session.

**Security — 100% complete. No open items.**

**Decisions locked:**
- Bottom tab bar = **Start · Wortschatz · Quiz · Fortschritt · Mehr** (Mehr-sheet = other 8).
- Mobile redesign = **Layer 2 ✅ · Layer 3 ✅ — DONE**.
- Keep `src/components/ui/card.tsx` **untouched**.
- Pre-React crash painter is a **permanent** safety net (do not remove).
- **Mobile bottom tab bar design (locked 2026-06-16, PRs #76–#175):** iOS home-screen style
  edit mode, always-colored icons (38% inactive / 100% active), no Fertig button, auto-save on
  outside tap, Home + Mehr fixed. Full spec in `CLAUDE.md` → "Mobile bottom tab bar".
- **Modal/popup overlay design (locked 2026-06-07, PR #108):** brand-tinted radial spotlight
  via `bg-dialog-overlay` + `shadow-elevated-soft` (no flat black, no backdrop-blur) — the
  standard for ALL popups/dialogs/sheets going forward. Already wired into the shared
  `DialogContent`/`DialogPrimitive.Overlay` in `src/components/ui/dialog.tsx`. Full spec in
  `CLAUDE.md` → "UI conventions — modal / popup overlays".
- **Default logo (locked 2026-06-08):** rounded "G" with transparent corners
  (`public/genauly-default-logo-transparent-corners.png`); never full-bleed in the app. `CLAUDE.md` → "Brand logo".
- **Legal/GDPR (locked 2026-06-08):** German is the binding legal-language version; **no cookie
  banner** (functional-only storage is consent-exempt); GDPR rights are in-app self-service. Keep
  `CONSENT_VERSION` (`src/lib/consent.ts`) in lockstep with the legal `LAST_UPDATED`. `CLAUDE.md` → "Legal pages & consent".

**Content counts (verified from `src/data/*` on 2026-07-03):**
- Vocabulary: **528 words**
- Collocations: **396 Nomen-Verb pairs** (~36/theme; tripled from 132 in s40)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **12** (incl. behoerde)
- Exam sets: **10** (1 per theme · 6–7 min · sharedRubric)
- Redemittel: **72** entries
- Can-Do milestones: **25** (all 11 themes; founder-verified provenance)
- Provenance rows: **1,111** (all with a `reference`; 1,086 `draft` / 25 `verified`)

**Dev branch:** reassigned each session; realign to `origin/main` after each squash-merge (`main` is
always the source of truth).

