# Project Status & Decision Log

_Last updated: 2026-06-24 (session 36). Branch: `claude/genauly-ai-strategy-8wrlcz`. Product name: **Genauly** (domain `genauly.de`)._

This file is the single place to re-orient when resuming work. For the full design, see
`docs/EXPANSION_PLAN.md`. For the original build plan, see `docs/IMPLEMENTATION_PLAN.md`.

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
- **Content (1C):** `src/data/collocations.ts` (**68** Nomen-Verb pairs, ~6–8/theme);
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
  `deploy.yml`/`gh-pages` fallback is gone). Develop on the active automation branch (currently
  `claude/vibrant-meitner-mfl9xk`; `main` is the source of truth); ship via
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
- `main` is production; merging triggers `pages.yml`. Develop on the active automation branch
  (currently `claude/vibrant-meitner-mfl9xk`); ship via squash-merge PR. **Always verify
  `pnpm build` green before merging.**
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
  Content counts all match (490 vocab, 120 collocations, 10 grammar topics/47 drills, 769 provenance
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

### Session 36 (2026-06-24) — Align dedicated Kollokationen cards to the Wortschatz tile design (SHIPPED ✅)
Founder asked to apply the Wortschatz → Kollokationen tile design to the standalone `/collocations`
(`CollocationsBrowser`) cards too. Confirmed via AskUserQuestion to **keep the extra content** the
browser carries (the example's English translation + its own audio button). Restyled `CollocationCard`
to match `CollocationsList`: truncating `font-semibold` phrase, muted (non-italic) English meaning, a
**`formell` badge** top-right (replacing the old indigo formal-card background tint), and a top-border
divider with the italic German example in „…" quotes. Kept the example EN line and the example audio
button (now always visible). Removed the hover-reveal speaker machinery (`hoverHalf` state +
`onMouseMove/onMouseLeave`) so the speakers are always visible like the Wortschatz tiles. `pnpm build`
green.

### Session 35 (2026-06-23) — Wortschatz tab overflow fix (SHIPPED ✅)
The Wortschatz (`VocabularyTrainer`) tab row has 4 tabs (Karteikarten, Quiz, Übersicht, Kollokationen);
the shared `TabsList` uses `overflow-x-auto` + `no-scrollbar`, so on narrow screens the rightmost tab
(**Kollokationen**) was clipped off the right edge with no visible scroll affordance. Fixed by adding
`flex-wrap` to that `TabsList` instance so the tabs wrap to a second row instead of clipping (all four
always visible). Local override only; the shared Tabs primitive is unchanged. `pnpm build` green.

### Session 34 (2026-06-23) — check:refs green confirmed + two strategy backlog items added
- **check:refs run #3 is GREEN.** After the two correction passes (143 dead refs re-pointed), all 491
  status-checkable references resolve. The "links are live and traceable" half of provenance
  verification is machine-confirmed. (Run history: #1 183 flagged → mostly false alarms + 117 real;
  #2 26 stragglers; #3 clean.)
- **Two new backlog items added** at the founder's request: **#22 comprehensive end-to-end data
  strategy** (a single `DATA_STRATEGY.md` umbrella over content + user + AI + analytics data,
  unifying `DATA_GOVERNANCE.md`/`EXPANSION_PLAN.md`/`PHASE2_SETUP.md`) and **#23 detailed
  visualization plan for all learning components** (`VISUALIZATION_PLAN.md`: per-component visual
  specs + progress/data-viz with `recharts`, consistent with the locked design system; ties into the
  Dashboard #1, mnemonics #4, simulations #3, Schreibtraining #6 backlog items). Both mapped in the
  model-guidance table. Neither scoped/started yet.
- Docs only this session (no code). `DATA_GOVERNANCE.md` already reflected the checker; PROJECT_STATUS
  session 33 updated with the run #3 green result.

### Session 33 (2026-06-23) — First check:refs run + reference corrections (audit-ready stream cont.) (SHIPPED ✅)
Founder ran the `check:refs` workflow; it reported 183 failures. Triaged from the Actions log: the
checker was too harsh, not 183 dead links. Causes: ~70 HTTP 429 (Wikimedia rate-limiting at
concurrency 5, valid pages), 33 HTTP 403 (Council of Europe blocks bots, page fine), and **117 genuine
404s** (B2-Beruf compound nouns with no Wiktionary entry, reflexive/particle verbs like "sich
abstimmen", headword bugs like gender pairs "X / die Y" and "(Pl.)"/"(PSA)", 2 collocation DWDS
prepositional-phrase lemmas, 1 wrong Wikipedia title). Two fixes:
- **Checker hardened** (`scripts/check-provenance-refs.mjs`): concurrency 5→2, `Retry-After` honoured,
  more retries; CEFR/coe.int treated as not-status-checkable; **429/403 now bucketed as "could not
  verify" and do NOT fail the run** (only true 404/dead links do). Removes the false-negative flood.
- **117 dead references re-pointed** (`scripts/fix-provenance-refs.mjs`): the verified-404 vocab/
  collocation ids → DWDS corpus search (`/r?q=`, resolves for any attested term, honest usage
  evidence); the Konnektoren grammar topic+drills → de.wikipedia "Konjunktion (Wortart)". Touches only
  the listed ids; review_status stays "draft".
Status-checkable set now 517 (was 629); 184 not-status-checkable (DWDS corpus + CEFR). `pnpm build` +
`pnpm lint:content` green.

**Second pass (same day):** run #2 came back with 26 genuine 404s (the stragglers that were masked as
429 in run #1, now caught because the gentler checker reported zero rate-limits). All vocab compounds/
verbs; re-pointed to DWDS corpus search via the same fix script. Total dead refs corrected across the
two passes: **143**. Status-checkable set now 491; 210 not-status-checkable.

**Run #3 (2026-06-23): GREEN ✅.** All 491 status-checkable references resolve; the "links are live and
traceable" half of verification is now machine-confirmed. The remaining open work in the audit-ready
stream is the human accuracy sign-off (draft → verified), Tatoeba example-sentence sourcing, and the
Article 6(3) profiling risk assessment.

### Session 32 (2026-06-23) — In-app "Sources & Licenses" page (audit-ready stream cont.) (SHIPPED ✅)
Founder asked where they (and the public) can see the data and its source links. Built the
auto-generated **"Sources & Licenses" page at `/sources`** (`src/features/legal/Sources.tsx`), the
Phase 2 attribution-surfacing item from `DATA_GOVERNANCE.md`. It renders entirely from the provenance
register (so it never drifts from the content): an "our approach" intro, the upstream references we
rely on (Wiktionary, DWDS, Wikipedia, CEFR) with licences + per-source counts, the licence breakdown of
our own content, and the **full itemised list of all 809 items with a link to each source**, grouped by
content type in collapsible sections (children render only when expanded, to stay light). Bilingual
DE/EN via the shared `LegalChrome`; linked from Settings and the landing footer. Already surfaces any
`attribution_required`/`attribution_text` rows, so Tatoeba CC-BY credit will appear automatically once
ingested. **Lazy-loaded** so the ~800-row register stays out of the main bundle (main chunk unchanged at
124 KB gzip; the register is a separate 24 KB-gzip chunk loaded only on `/sources`). `pnpm build` +
typecheck green. This is the human-readable answer to "where can I see the data and sources" the founder
wanted (the raw register also lives in `src/data/provenance.ts`).

### Session 31 (2026-06-23) — Reference URL checker (audit-ready stream cont.) (SHIPPED ✅)
Built the automated reference-URL validator the founder asked for, the highest-leverage first step of
the still-open verification work. `scripts/check-provenance-refs.mjs` (`pnpm check:refs`) fetches every
provenance `reference` and reports dead links, wrong Wiktionary headwords (404), missing Wikipedia
articles, and unknown DWDS entries. It dedups 809 rows → **701 unique URLs** (629 status-checkable;
72 DWDS corpus-search links flagged "not auto-checkable" rather than faked; 0 malformed) and exits
non-zero on any failure. Because this sandbox blocks outbound HTTPS (`host_not_allowed`), it ships with
a manual `workflow_dispatch` GitHub Action (`.github/workflows/check-refs.yml`) so the non-technical
founder can run it from the Actions tab where egress is open; also runnable locally via `pnpm check:refs`
(`--dry` parses without network). Verified the parse/dedup path here with `--dry`. **This attests to the
"link is live" half of verification only; content accuracy (correct sense, B2 quality) still needs human
sign-off.** Docs updated (DATA_GOVERNANCE.md automated-controls list).

### Session 30 (2026-06-20) — Data audit-ready stream: reference back-fill + EU AI Act Art. 50 (SHIPPED ✅)
Advanced the data-governance / audit-ready stream (backlog #7) on two fronts the founder approved together:
- **Provenance reference back-fill complete.** The bootstrap generator had only auto-filled references
  for vocabulary (Wiktionary) and collocations (DWDS), leaving ~162 authored rows (grammar, redemittel,
  dialogues, exam sets, writing prompts) with an empty `reference` (the linter back-fill queue). Added
  `scripts/backfill-provenance-refs.mjs`, which fills **only** empty references with a genuine,
  type-appropriate source: grammar topics/drills → the German Wikipedia article for the topic
  (grammar = facts), redemittel → DWDS corpus search for the phrase, dialogues/exam sets/writing
  prompts → the Council of Europe CEFR B2 descriptors. All **809 rows now carry a reference; the linter
  warning queue is empty.** References are machine-assigned starting points, not verified: every row
  stays `review_status: "draft"`. The four-eyes verification pass (draft → verified) is the next open
  governance step.
- **EU AI Act Article 50 transparency shipped** (ahead of the 2 Aug 2026 date). Confirmed the writing
  coach is the only generative-AI surface (speech = Web Speech API; simulations = scripted dialogue
  trees). It already marked output as "KI-generierte Rückmeldung" in the live result and history; added
  an explicit point-of-use disclosure on the writing editor ("Dein Text wird zur Auswertung an eine KI
  (Anthropic Claude) gesendet. Die Rückmeldung ist KI-generiert und kann Fehler enthalten.") linking to
  the privacy page.
- Verified: `pnpm lint:content` passes with **zero warnings** (was ~162), `pnpm build` + typecheck
  green. Docs updated (`DATA_GOVERNANCE.md` v0.4). **Still open in this stream:** human verification
  of the references, the Tatoeba example-sentence sourcing for vocab sentences, and the Article 6(3)
  profiling risk assessment.

### Session 28 (2026-06-17) — Selection "cloud" refinement: compact squircle + selected-only menu (SHIPPED ✅)
Founder feedback: the grey backdrop behind the active icon (the "cloud") was too big and the gradient
looked convex/protruding. Iterated via HTML mockups (raw.githack preview links, the same flow as the
icon previews) before touching live code:
- **Mockup 1 (`preview/nav-cloud-refined.html`):** current full-slot pill vs tighter options. Founder
  picked the **compact squircle**.
- **Mockup 2 (`preview/nav-cloud-gradients.html`):** six gradient studies of the squircle. Founder
  picked **G1 "flat & even"** (plain `from-muted to-border`, no highlight/shadow dome).
- **Implemented (PR #202, merge `69eee0c`):**
  - Bar active pill + Mehr pill → compact `h-11 w-11 rounded-2xl` squircle hugging the icon (was a
    slot-filling `rounded-xl` pill); underline moved to `bottom-[6px]` (`BottomTabBar`).
  - More sheet → compact `h-12 w-12` squircle tiles; the grey cloud now appears **only behind the
    selected section** in browse mode (every other tile is a bare icon on white). Edit mode keeps the
    squircle on all tiles as the draggable-tile affordance (`MoreSheet`).
  - Note: founder initially saw clouds on every browse tile after the deploy — that was the PWA
    service-worker serving the cached pre-#202 build; a full app close/reopen picked up the fix.
- Docs: CLAUDE.md gained the s28 rules (compact-squircle backdrop, flat & even gradient, More-sheet
  cloud only on the selected tile). `pnpm build` + `pnpm lint:content` green.

### Session 3 (2026-06-01) — auth polish + dark-mode readability (SHIPPED & LIVE)
- **Sign-up honesty fix (PR #19, merged):** sign-up no longer falsely reports success when email
  confirmation is pending. Paired with the founder disabling **"Confirm email"** in Supabase, so
  sign-up now logs in instantly and the SaveProgressBanner clears. Founder-verified.
- **Anonymous sign-ins confirmed ON and required** — guest flow, AI writing coach, and the
  progress-preserving guest→account upgrade all depend on it. Documented for the founder.
- **Dark-mode readability rework (PR #20, merged & live):** founder reported dark mode was
  effectively black and unreadable at night. Changes, all in `src/index.css` + `Sidebar.tsx`:
  - Background lifted from near-black (`240 16% 6%`) to a **deep navy/midnight blue** (`223 38% 11%`);
    `--surface`/`--elevated`/`--muted`/`--border`/`--input` stepped up in lightness on hue ~223 so
    cards separate from the background instead of merging into one black void.
  - `--muted-foreground` brightened (→ `220 20% 76%`) for legible secondary text.
  - Sidebar inactive nav labels: dim `text-muted-foreground` → near-white `text-foreground/80`.
  - Selected nav item: was low-contrast indigo-on-indigo (`text-primary` on `bg-primary/10`) →
    now bright semibold `text-foreground` on `bg-primary/20`. Light mode untouched.
- **Process lesson:** founder "saw no change" because the work was on the feature branch, not `main`.
  Going forward, **auto-ship**: open + squash-merge the PR once the build is green (see CLAUDE.md).
- **Flashcard rating colors (PR #22, merged & live):** the SRS rating buttons in
  `features/vocabulary/Flashcards.tsx` had the two middle options ("Schwer", "Gut") in grey, which
  read as disabled next to red "Nochmal" / green "Einfach". Added reusable **`warning` (amber)** and
  **`info` (teal)** variants to the shared `Button` (`components/ui/button.tsx`), using the existing
  `--warning` / `--accent` tokens (auto light/dark). Buttons now form a difficulty ramp:
  Nochmal=red → Schwer=amber → Gut=teal → Einfach=green. (QuickRevision's 2-button red/green scale
  was already fine.)

### Session 23 (2026-06-15) — Boot-splash flash fix + logo-redo backlog SHIPPED ✅
Branch `claude/app-refresh-text-flash-r6k69u`. Squash-merged to `main` (PRs #150–#151).

**Problem:** on every refresh the static `#root` fallback in `index.html` (the full plain-language
description, added in s22/PR #143 so Google's no-JS OAuth crawler can read the app's purpose) flashed
on screen before React mounted. It read like a glitch because it was a wall of marketing copy, not a
loading screen.

**Fix (CSP-safe, no inline JS):**
- First attempt (PR #150) added an inline `<script>` to set a `.js` class and hide the text via CSS.
  **It silently failed** because the page CSP is `script-src 'self'` with no `'unsafe-inline'` and no
  nonce/hash, so the inline script was blocked and the class never applied. Lesson for future work:
  **`index.html` cannot run inline scripts**; only external `/self` scripts (like `spa-redirect.js`)
  or `<style>`/`<noscript>` overlays (style-src allows `'unsafe-inline'`).
- Correct fix (PR #151): default the boot fallback to a minimal **branded splash** (`#boot-splash`:
  logo + tagline + spinner) for everyone, and use a `<noscript><style>` override to reveal the full
  description (`#boot-seo`) only when scripting is disabled. JS browsers now see an intentional-looking
  loading splash; no-JS crawlers / Google's OAuth reviewer still get the full description in the raw
  HTML. The spinner has a `prefers-reduced-motion` fallback. **Founder-verified: the flash is gone.**

**Also:** added **backlog #20** — redo the Genauly logo (founder noticed it looks too close to Canva).

### Session 23 cont. (2026-06-15) — Data governance v0.2/v0.3 + certification research SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. Docs only, squash-merged to `main` (PR #153 for v0.2; the
v0.3 + research bundle in a follow-up PR).

**1. Content strategy decision (v0.2): traceability over ownership.** Founder rejected leaning on "we
wrote it in-house, so we own it." New policy: every item traces to an authoritative reference or a
commercial-safe source. Much of today's library is AI-assisted drafting (legally safe, since AI text
has no rights holder, but a weak provenance answer), so AI drafting is now a *first step only* that
must be verified-and-cited or rewritten/discarded. Added the facts-vs-creative-text distinction (words/
genders/plurals are facts, not copyrightable: verify vs Wiktionary/DWDS rather than copying a protected
list), an approved open-source table (**Tatoeba CC-BY** for sentences), and a required `reference` field
on the register. Founder chose **re-verify + backfill existing content**, not a hard rebuild.

**2. Certification deep-research (#19) DONE → `docs/CERTIFICATION_RESEARCH.md` + governance v0.3.** Ran
the deep-research harness (5 cited passes). Conclusions: we are **most likely NOT high-risk** under the
EU AI Act (profiling + institutional-gating are the two flip risks); **Article 50 transparency** (tell
users they're interacting with AI / mark AI output) is a real obligation by **2 Aug 2026** → new
backlog **#21**; when certifying, sequence **ISO 27001 then ISO 42001** via TÜV NORD/SÜD (~$15K to
$60K/standard); SOC 2 is US-centric, defer. Still needs a lawyer's sign-off on the risk class (#15).

**Also:** documented that **Fable is temporarily unavailable** (US government restriction); use **Opus**
for Fable-recommended tasks until it returns (note in the Model-guidance section).

### Session 22 cont. (2026-06-14) — Data governance roadmap drafted 📋
Founder brainstormed making content ingestion **audit-ready** for eventual certification (TÜV
Rheinland / EY-style) and guaranteeing all content is under commercial-safe Creative Commons
licenses. Drivers: enterprise/gov edtech sales, legal/copyright safety, investor credibility, brand.

Key framing established: certification bodies certify the **process/management system**, not the data;
TÜV certifies against standards (**ISO/IEC 42001** for AI, ISO 27001), EY does **assurance** (SOC 2 /
ISAE 3000), and the concrete near-term legal driver is the **EU AI Act Article 10** (data governance +
provenance). The certificate is downstream of having the right system in place.

Shipped: **`docs/DATA_GOVERNANCE.md`** covering the provenance-register schema, a commercial-safe
license allowlist (SPDX, with the CC-BY-SA share-alike trap flagged), the four-eyes workflow, a planned
machine **license gate** (extend the new content linter so every content id must declare an allowlisted
license or the build fails), a risk register, a standards-mapping table, and a phased roadmap. **CTO
call: build Phases 1-3 now (cheap, mechanical, satisfies EU AI Act); defer paid certification (Phase 4)
until revenue or a customer demands it.** Backlog #7 cross-referenced to the doc; **new backlog #19**
added for a certification deep-research pass to validate the assumptions (cost, body, EU AI Act risk
class). No app code changed.

**Update (v0.2, 2026-06-15, founder decision): traceability over ownership.** The founder rejected
leaning on "we wrote it in-house, so we own it." New policy: every item must trace to an authoritative
reference or a commercial-safe source. Much of today's library is **AI-assisted drafting** (legally
safe to ship, since AI text has no rights holder, but a weak provenance answer), so AI drafting is now
a *first step only* that must be **verified against a free reference and cited** (or rewritten /
discarded). Added: a facts-vs-creative-text distinction (German words / genders / plurals are facts,
not copyrightable, so we verify them against Wiktionary / DWDS rather than copying a protected list);
an approved open-source table (**Tatoeba CC-BY** for example sentences, Wiktionary / DWDS as
references); a required `reference` field on the register; and a linter requirement that authored items
carry a reference. Existing content is **re-verified and provenance-tagged, not rebuilt from scratch**
(founder chose "re-verify + backfill" over a hard replace).

### Session 22 cont. (2026-06-14) — Content QC linter + CI gate SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. Backlog "Content QC pipeline" (mechanical half).

**New content linter `scripts/lint-content.mjs` (`pnpm lint:content`):** validates every `src/data/*`
bank. It loads the real `.ts` modules through Vite's `ssrLoadModule` (zero new dependencies, exact
project transform + `@/` alias) and checks:
- **Duplicate ids** within every dataset (vocab, collocations, grammar topics + drills globally,
  dialogues, exam sets, redemittel, practice areas, themes).
- **Dialogue node integrity:** `start` resolves, each node's `id` matches its Record key, every
  option `next` / node `next` points to a real node, option ids unique per node, no dead-end nodes
  (must have options, a `next`, or `end: true`), and no orphan/unreachable nodes (BFS from `start`).
- **Missing/empty required fields** per schema (e.g. vocab de/en/pron/examples, collocation
  full/en/example, grammar drill prompt/answer, exam rubric criteria).
- **Cross-references:** `themeId`, exam `scenarioId`, Redemittel categories, grammar groups,
  weakness categories, and `option.uses` all resolve to known values.
- **Em-dash sweep** (CLAUDE.md writing rule) recursively over all copy strings.
Errors fail the process; a small advisory warning channel exists but is currently empty.

**Wired as a CI gate (`.github/workflows/validate.yml`):** runs `pnpm lint:content` on every PR and
on pushes to `main`, actions SHA-pinned to match `pages.yml`. Blocks broken content from merging.

**Real bugs the linter caught and fixed (PR #148):**
- **8 duplicate vocabulary ids** (`v_nachhaltig`, `v_schutzausruestung`, `v_unterkunft`,
  `v_dienstreise`, `v_engpass`, `v_missverstaendnis`, `v_einigung`, `v_abnahme`) introduced by the
  session-16 bulk append. React silently rendered only the first of each, so 8 cards were dead data.
  Removed the redundant later copies (498 → **490** real entries).
- **4 plural-only nouns missing their article** (`v_stakeholder`, `v_zugriffsrechte`,
  `v_erneuerbare_energie`, `v_treibhausgasemissionen`); added `article: "die"`.
After fixes: linter green (0 errors, 0 warnings), `pnpm build` green. Documented in CLAUDE.md
(Commands + Content conventions). **The pedagogical/German-accuracy review half remains backlogged.**

### Session 22 (2026-06-14) — Google OAuth branding fix, tagline unification, icon/favicon overhaul SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. All items squash-merged to `main` (PRs #142–#146).

**PROJECT_STATUS.md updated for session 21 (PR #142):** standard end-of-session doc update covering
all session 21 work.

**Google OAuth branding: static pre-render fallback added to `index.html` (PR #143):**
Google's OAuth branding reviewer fetches raw HTML without executing JavaScript, so all React-rendered
content is invisible to it. The reviewer was seeing an empty `<div id="root"></div>`, triggering
"Your home page does not explain the purpose of your app." Fixed by embedding a full static pre-render
of the purpose text directly inside `#root` in `index.html`. `createRoot().render()` clears it on boot,
so real users never see it. The static fallback contains a plain-language description of what Genauly
is, who it is for, how Google sign-in data is used, links to About/Privacy/Terms, and the
"Die App wird geladen" loading notice. Also updated `<title>` to "Genauly: German for real life" and
`<meta name="description">` to match the B1-B2 real-life positioning.

**Tagline unified: "German for real life" across all surfaces (PR #145):**
The old tagline "German that clicks" was still present on several surfaces post-session-21. Updated all
remaining occurrences:
- `src/features/onboarding/Onboarding.tsx` (onboarding header)
- `src/features/landing/LandingPage.tsx` (footer)
- `package.json` (description)
- `vite.config.ts` (PWA manifest `name` and `description`)

**PWA manifest description also updated** from "Interactive prep platform for the Goethe / telc Deutsch
B2 Beruf speaking exam." to reflect the broader B1-B2 real-life positioning.

**Home-screen icons regenerated as full-bleed opaque (PR #146):**
The existing `apple-touch-icon.png` and `pwa-*.png` had transparent corners (alpha = 0 at corners)
inherited from the rounded-logo source. iOS fills transparent areas with black when applying the OS
rounding mask, producing dark corners on the home-screen icon. Fixed by regenerating all four files
using a Python/Pillow BFS flood-fill approach that extends the gradient from opaque edge pixels into
the transparent corners:
- `public/apple-touch-icon.png` (180x180, full-bleed opaque)
- `public/pwa-192x192.png` (192x192, full-bleed opaque)
- `public/pwa-512x512.png` (512x512, full-bleed opaque)
- `public/pwa-maskable-512x512.png` (512x512, full-bleed bg + logo centered in 80% safe zone)

**Favicon replaced with real logo PNGs (PR #146):**
`public/favicon.svg` rendered a plain system-font "G" via SVG `<text>`, not the actual styled logo.
Generated `public/favicon-32.png` and `public/favicon-16.png` from the canonical logo (with rounded
transparent corners, appropriate for the browser tab where transparency looks good). `public/favicon-48.png`
also generated. Updated `index.html` favicon links from SVG to the new PNGs:
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
```
The filename change also busts browser favicon cache (no hard-refresh needed on next visit).

**Google OAuth branding re-submission status:** the founder re-submitted verification via Google Cloud
Console → OAuth consent screen → "I have fixed the issues." The cached result still showed the old
failure ("issues found from previous verification attempt") but that is normal: Google caches the prior
result and the new review is asynchronous. Confirmed that the static pre-render fix is technically
correct and complete. The founder should wait for an email from Google's Trust and Safety team
(hours to days) rather than re-clicking, which may reset the queue.

**GitHub repo safety confirmed:** public repo confirmed clean. Supabase anon (publishable) key is
intentionally public per Supabase's design (RLS is the security layer). No other secrets in tracked
files or git history. Only exposure is business IP (code/content). Founder enabled GitHub secret
scanning + push protection.

**Hosting migration decision: Cloudflare Pages (deferred):**
Founder chose to migrate from GitHub Pages to Cloudflare Pages after OAuth branding is resolved.
Cloudflare Pages advantages over GitHub Pages: free private-repo deploys, native SPA routing (no
404.html hack needed), real HTTP headers (CSP via header rather than meta tag, `frame-ancestors`
works), superior cache purge control, and zero extra cost. Migration prep will happen in a future
session once Google OAuth verification clears.

### Session 21 (2026-06-12) — Broader B1-B2 positioning, About page, business plan, consent gating SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. All items squash-merged to `main` (PRs #140–#141).

**Broader app purpose repositioned (PR #140):** The founder confirmed Genauly's purpose is not
exam-prep-only: it is for anyone stuck at the intermediate plateau (roughly B1-B2), not just people
preparing for one specific exam. Two deliverables:

1. **Landing page re-copy** (`src/features/landing/LandingPage.tsx`): hero, badge, sub-label, feature
   cards, footer, and CTAs all updated to reflect the broader B1-B2 real-life framing. Highlights:
   badge = "German for real life · B1-B2"; hero = "Break through the plateau. German for the
   situations that actually matter."; feature cards describe real situations (Behörde, Arztbesuch,
   job interview); content counts removed from public copy. "Über uns" footer link added.

2. **New `/about` page** (`src/features/about/About.tsx`): bilingual (DE/EN) purpose page reusing
   `LegalChrome` + `Section`. Explains in plain language what Genauly is, who it is for, what you
   can do with it, and — critically for Google's OAuth branding review — exactly how Google sign-in
   data is used (account creation + cross-device progress sync only, no ads, no selling). Routed at
   `/about` (`src/router.tsx`). Both landing and /about were updated to correct exam naming:
   "telc Deutsch B2 Beruf" and "Goethe-Zertifikat B2" (no "Goethe-Zertifikat B2 Beruf" exists).

3. **Business plan `docs/BUSINESS_PLAN.md`** (v1.1): investor-grade plan covering market sizing
   (TAM/SAM/SOM from BAMF, Destatis, Goethe-Institut, Duolingo shareholder letters), competitive
   landscape, product differentiation, business model, unit economics, GTM, risks, pre-seed framing.
   Includes PURPOSE STATEMENTS section (EN + DE) for Google OAuth verification. v1.1 reflects the
   broader B1-B2 plateau positioning.

4. **Backlog #18 added**: "Reposition and redesign for the broader B1-B2 real-life purpose" —
   new scenario themes (Behörde, healthcare, job-hunting, social), nav/UI redesign, in-app copy
   alignment. Documented scope + recommended model guidance.

**Consent gating for sign-up (PR #141):** The "Weiter mit Google" button was available immediately
on sign-up, even before accepting the AGB + Datenschutz — defeating the consent requirement.
Moreover, `hasConsented()` was pre-checking the checkbox for anyone who had previously consented
(e.g. during onboarding), bypassing the requirement entirely. Two fixes in `AuthDialog.tsx`:
- `setConsent(hasConsented())` → `setConsent(false)`: sign-up ALWAYS starts unchecked,
  regardless of prior consent history.
- Consent checkbox moved from below the form to ABOVE the Google button so the "agree first"
  dependency is visually obvious to users.
- Login tab unchanged: no checkbox shown, Google button available immediately.
- `hasConsented` import removed (unused).

**Also corrected this session:** `CLAUDE.md` still uses the INCORRECT exam name "Goethe-Zertifikat
B2 Beruf" in the header. The existing telc exam names in the file body were already correct.
Note: in-app copy (authenticated app shell) still reflects the old "B2 Beruf exam prep" framing;
only public-facing copy (landing, /about) was updated. In-app copy alignment is part of backlog #18.

### Session 20 (2026-06-08) — Logo lock, Terms page, GDPR pass, writing-history record SHIPPED ✅
Branch `claude/admiring-galileo-9E0Fi`. All items squash-merged to `main` (PRs #120–#129).

**Logo (PRs #120–#122):** brief detour where the app logo was made full-bleed (#120) then reverted
(#121) because the founder prefers the rounded mark with transparent corners. Settled: the canonical
default logo is **`public/genauly-default-logo-transparent-corners.png`**, used in all 6 in-app spots;
`favicon.svg` + `pwa-*.png` keep their conventional names and render the same mark (#122). The
full-bleed square variant exists ONLY for Google's circular OAuth consent crop, NOT for the app. Rule
documented in `CLAUDE.md` → "Brand logo" so future sessions don't flip it again.

**Terms of Service + bilingual legal toggle (PR #123):** new `/terms` (AGB) page; both `/privacy` and
`/terms` now share `LegalChrome` with a **Deutsch/English toggle** (default German, German is binding).
Fixed em dashes in the privacy copy. Footer + Settings link to both.

**Legal review backlog (#15, PRs #124–#125):** recorded the need for a lawyer pass before paid
plans/marketing; decided (founder-confirmed) **no "under review" banner** on the live legal pages.

**GDPR pass (PR #126, the big one):** audit done (3-agent), then a robust first implementation.
Shipped: consent checkbox at sign-up (`AuthDialog`, incl. Google) + final onboarding step, recorded via
`recordConsent()`/`CONSENT_VERSION` (`src/lib/consent.ts`) into `profiles.settings` jsonb; in-app data
export (`src/lib/dataExport.ts`); in-app account deletion (`supabase/functions/delete-account` +
`useAuthStore.deleteAccount`, two-step + type-LÖSCHEN confirm); per-submission writing delete
(`deleteWritingEvaluation` + `writing_delete_own` RLS policy, migration `0003`); honest reset that also
clears cloud progress when signed in (`cloudSync.pushProgressNow`). **Decision: no cookie banner**
(functional-only storage is consent-exempt under GDPR/§25(2) TTDSG). **Founder did the two Supabase
steps live** (ran migration 0003, deployed delete-account), so deletion + per-item delete are active.

**Impressum (PRs created in #126, hidden in #127):** built a bilingual `/impressum`, then **temporarily
hid it** (route commented out, all links removed; file kept) because the founder doesn't want to publish
a home name/address yet. An Impressum is public by law (a GitHub secret can't hide it). Re-enable with a
business/service address ("ladungsfähige Anschrift", not a P.O. box) during the lawyer/launch pass.

**Writing history record + redesign (PRs #128–#129):** the Verlauf only showed the AI tip, with no record
of the task or the user's own text. Now each entry has an expandable section showing the **Aufgabe**
(from `writingPrompts[theme][length]`) and **Dein Text** (the submitted text, already stored in
`writing_evaluations.text`, now fetched). Then redesigned the entry for clear hierarchy: tip in a
highlighted box (Lightbulb + label + weakness badge), Aufgabe/Dein Text in labeled bordered boxes, a
proper "üben" button.

**Also confirmed live:** the Google OAuth consent screen branding (app name "Genauly" + logo, domain
verified via Namecheap DNS, app published) was completed by the founder this session.

### Session 19 (2026-06-07) — Sign-in dialog UX overhaul + brand identity unification SHIPPED ✅

**Dialog overlay redesign, iterated and locked (PRs #106–#109):** The founder felt the sign-in
dialog's backdrop blur looked stale/cached, and didn't like the flat black overlay underneath it.
Iterated through several rounds with rendered mockups approved before merging:
- PR #106 dropped the `backdrop-blur` entirely.
- PR #107 toned down the card's `shadow-elevated` halo by ~50% (new `shadow-elevated-soft` token
  in `tailwind.config.ts`, ~half the opacity/spread of the original).
- PR #108 replaced the flat `bg-black/50` overlay with a brand-tinted radial spotlight
  (`bg-dialog-overlay`, a `radial-gradient` using the `--shadow` HSL token, lighter behind the
  card and deepening toward the edges, dark-mode-aware). Generated a 5-variant comparison mockup,
  the founder picked this one ("looks perfect").
- PR #109 **locked this as the standard convention** for all popups/dialogs/sheets going forward
  ("remember this design choice... for future reference") — documented in `CLAUDE.md` as a new
  "UI conventions — modal / popup overlays" section and in "Decisions locked" below. Both tokens
  are already wired into the shared `DialogContent`/`DialogPrimitive.Overlay` in
  `src/components/ui/dialog.tsx`, so any dialog built on that primitive inherits this for free.

**Sign-in dialog UX fixes (PRs #113–#114):**
- PR #113 added a top **segmented toggle** ("Konto erstellen" / "Anmelden", `role="tablist"`)
  right under the dialog header. The founder pointed out that the "Anmelden" link for existing
  users was buried at the bottom and easy to miss; now both modes sit side by side at the top,
  with "Konto erstellen" as the default and "Anmelden" equally prominent. The old buried bottom
  toggle link was removed.
- PR #114 removed the "Wir nutzen deine E-Mail nur für die Anmeldung" microcopy line. The founder
  asked whether that was actually true; it wasn't (password reset/recovery already uses it, and
  future billing/marketing mail would break the promise outright) — so the line was deleted along
  with its now-unused `ShieldCheck` import rather than rewritten into something narrower.

**Brand identity unified: G-logo wordmark replaces the Sparkles brand mark everywhere (PRs
#116–#118):** The founder liked the gradient "Sparkles" icon used as the app's brand mark, but
asked to swap it for the actual "G" wordmark logo (`/favicon.svg` — gradient rounded square with
a white "G", already the favicon and PWA app icon) so the brand mark is consistent with the icon
users see on their home screen. Swapped in **all five** places the Sparkles-in-a-gradient-box
brand mark appeared:
- `AuthDialog.tsx` (sign-in dialog header, PR #116)
- `AppShell.tsx` (mobile header logo)
- `Sidebar.tsx` (desktop sidebar logo)
- `LandingPage.tsx` (landing page header logo)
- `Onboarding.tsx` (onboarding top brand mark)
- `PrivacyPolicy.tsx` (the **/privacy** page's back-to-home header logo, PR #118 — the one
  initially missed; caught on a careful final re-sweep after the founder asked "why isn't the
  logo changed here?" about the in-app header following the first round of swaps)

Each spot now renders `<img src="/favicon.svg" alt="" className="h-{n} w-{n} rounded-{lg|xl}
shadow-glow" />` at its existing size, keeping the `shadow-glow` halo. Sparkles remains as a
**content/decorative icon** (onboarding step headers, guest-progress notes) per the founder's
explicit "keep it for something else for later" — it was only removed from brand-mark usage, not
from the codebase or from non-brand UI. Verified with Playwright screenshots at every location
(desktop + mobile viewports, light + dark mode): the G mark renders crisply at every size with no
cropping/stretching and the `shadow-glow` halo intact.

**Founder backlog captured (PRs #110–#112, #115):** Recorded a Google sign-in branding to-do that
the founder attempted but couldn't finish in one sitting (PR #110, see "Founder action items"),
and a 14-item raw feature-idea backlog spanning product, monetization, growth, and GDPR
compliance (PRs #111–#112, #115) — see "Backlog — founder ideas" below for the full list.

### Session 18 (2026-06-06) — Security complete + streak bug fix SHIPPED ✅

**Streak display bug fixed (PR #90):** The streak counter was showing a stale persisted value
after missed days (e.g. showing "5 Tage Serie" after 2 missed days, then dropping to 1 on the
next activity — looked like a reset). Added `useEffectiveStreak()` hook that returns the stored
streak only when `lastActiveDay` is today or yesterday (still alive), and 0 when the streak has
actually been broken. Dashboard and Analytics both updated.

**Cloudflare Turnstile CAPTCHA — fully live (PRs #91–#92):**
- `TurnstileWidget` component: lazy-loads Cloudflare Turnstile script, auto-solves in <1 s for
  real users, no-op when `VITE_TURNSTILE_SITE_KEY` is unset (dev/CI unchanged).
- `useAuthStore`: all four auth calls (`signInAsGuest`, `signUp`, `signIn`, `signInWithGoogle`)
  now accept and pass `captchaToken` to Supabase.
- `AuthDialog` and `AccountPanel` render the widget and gate submission on a valid token.
- `pages.yml`: `VITE_TURNSTILE_SITE_KEY` secret piped into the build step.
- CSP extended for `challenges.cloudflare.com` (script + frame + connect).
- **Founder steps done:** Cloudflare widget created for `genauly.de` → site key added as GitHub
  Actions secret → Supabase Authentication → Attack Protection → Turnstile enabled with secret
  key. All sign-in flows (guest, sign-up, email login, Google OAuth) are now CAPTCHA-protected.

**CSP switched from report-only to enforcing (PR #93):**
- Discovered that `Content-Security-Policy-Report-Only` via `<meta>` tag is **rejected by all
  browsers** (HTTP-header-only; GitHub Pages cannot set headers). The policy was silently ignored
  since it was added. Switched to enforcing `Content-Security-Policy` which does work in meta
  tags. Founder confirmed the console is now clean — no CSP errors.

**Full security checklist is now 100% complete.** See `docs/SECURITY.md`.

**Stale SW chunk-fetch crash fixed, two rounds (PRs #95, #97):** Intermittent "Failed to fetch
dynamically imported module" errors on Windows desktop and Android. Round 1 (`lazyWithReload()`,
PR #95) just reloaded once on failure, insufficient: the Service Worker kept re-serving the same
stale cached `index.html`, so the reload hit the identical error with a new chunk hash. Round 2
(PR #97) added `src/lib/recover.ts` → `recoverFromStaleAssets()`, which explicitly clears all
`caches` and unregisters the service worker *before* reloading (rate-limited via `sessionStorage`
timestamp so genuine outages don't loop). Wired into `lazyWithReload()`, the global
`error`/`unhandledrejection` handlers, and the `RootErrorBoundary` in `main.tsx`. This is the
architecturally correct fix: a plain reload can't out-run a Service Worker that intercepts the
fetch and hands back the same cached HTML.

**Onboarding "Zurück" button fixed (PR #98):** On Step 1 ("Willkommen!") the back button was
`disabled={step === 0}`, a dead button that read as broken. Now it navigates to `/welcome`
(landing page) when there's no previous onboarding step.

**Em dashes removed app-wide + style rule documented (PR #99):** Founder dislikes `—` as an
overused "AI tell". Rewrote ~30 user-facing strings across `index.html`, `LandingPage`,
`Onboarding`, `QuickRevision`, `CollocationsBrowser`, `dashboard/recommend.ts`, `SimulationHub`,
`Analytics`, `redemittel.ts`, `grammar.ts`, and `package.json`'s tagline, replacing `—` with a
period, comma, colon, or "and"/"so" as natural. Code comments were left untouched (not
user-visible). **New "Writing style" section added to `CLAUDE.md`** so future AI sessions follow
this rule by default; the en dash `–` and bullet `·` remain fine.

**Real `/privacy` page shipped (PR #100):** Founder asked about the Google sign-in consent screen
showing the raw Supabase project domain instead of "Genauly", which requires Google brand
verification, which requires a Privacy Policy URL. Wrote `src/features/legal/PrivacyPolicy.tsx`,
a plain-language Datenschutzerklärung grounded in the actual schema/Edge Function/CSP (account
data, profile, learning progress sync, AI writing submissions and where they go, Turnstile,
hosting providers, retention, GDPR rights). Routed at `/privacy` (top-level, outside `AppShell`,
reachable signed-out), linked from the landing footer and Settings. Live at
`https://genauly.de/privacy` — ready to paste into the Google Cloud Console verification form.

**Clean URLs: migrated off hash routing (`/#/...` → `/...`):** The founder asked why URLs had a
`#` and whether "normal" clean URLs were possible. They are, via the well-known GitHub Pages SPA
redirect trick (https://github.com/rafgraph/spa-github-pages):
- `router.tsx`: `createHashRouter` → `createBrowserRouter`.
- `vite.config.ts`: `base: "./"` → `base: "/"` (required so asset URLs resolve correctly from any
  path, not just `/`; safe because the custom domain `genauly.de` serves from the root). PWA
  manifest `start_url`/`scope` updated to `"/"` to match. `index.html` icon `href`s made absolute.
- **New `public/404.html`**: GitHub Pages serves this for any unknown path (e.g. a direct visit to
  `/privacy`). It encodes the requested path/query/hash into `/?/privacy&...` and redirects to the
  app root.
- **New `public/spa-redirect.js`**: loaded as a classic (blocking, pre-module) `<script>` in
  `index.html`. Decodes that `/?/...` shape and calls `history.replaceState` to restore the exact
  original URL *before* React Router mounts, so the correct route renders on first load. Loaded
  via `<script src>` (not inline) to satisfy the `script-src 'self'` CSP.
- **`useAuthStore.signInWithGoogle`**: `redirectTo` simplified from
  `window.location.origin + window.location.pathname` to `window.location.origin + "/"` — always
  return to the root after OAuth regardless of where sign-in was opened, matching Supabase's
  redirect allowlist exactly and sidestepping the 404 dance mid-auth-flow. (Behaviorally identical
  to the old hash-router setup, where `pathname` was always `/` anyway.)
- **Verified locally** with a custom Python static server that mimics GitHub Pages' exact
  behavior (serves `404.html` with a 404 status for unknown paths) plus Playwright: confirmed the
  full chain — fresh visit to `/privacy?ref=test#section` → 404 → redirect → `history.replaceState`
  restore → React Router renders the right page — preserves query strings and hash fragments
  byte-for-byte, for both gated and ungated routes; confirmed reloads on deep routes are instant
  once the Service Worker's `navigateFallback` takes over; confirmed in-app `<Link>` clicks update
  the URL cleanly with no page reload. **Cannot test the live Google OAuth round-trip from the
  sandbox** — founder should verify "Sign in with Google" still works right after this deploys.

### Session 17 (2026-06-05) — Security audit + full hardening SHIPPED ✅ + sourcing research

**Security audit completed (no critical findings).** Full architectural review of all security
surfaces. The app is fundamentally well-built: secrets stay server-side, all tables have
owner-only RLS, no client-side secret exposure, no `dangerouslySetInnerHTML` or `eval`. The
service worker precaches only static build assets.

**Gaps found and a remediation plan created & approved:**
- 2 moderate npm vulns (react-router open redirect, fixed by bumping to `^6.30.4`).
- Edge Function CORS wide-open (`Access-Control-Allow-Origin: *`) — needs allowlist.
- No Content-Security-Policy header/meta anywhere.
- Third-party font from `rsms.me` (privacy + supply-chain risk) — needs self-hosting.
- AI function has no input *maximum* size cap — denial-of-wallet risk.
- No per-user monthly AI call cap — one account can exhaust the global budget.
- CI actions pinned to floating tags (`@v4`) rather than commit SHAs.
- npm → pnpm migration planned (supply-chain: content-addressable store + release-age cooldown).

**Plan document:** `docs/SECURITY_AUDIT_PLAN.pdf` (4-page PDF, on `main`).

**Implementation — all 4 PRs SHIPPED this session (PRs #85–#88, on `main`):**
- PR #85: npm → pnpm migration + react-router vuln fix + `.npmrc` supply-chain guardrails.
  `pnpm audit` 2 moderate → **0**. CI build verified green on `main` (pnpm + cache all pass).
- PR #86: Edge Function hardening — CORS allowlist, `MAX_TEXT_LEN`=3000, `USER_MONTHLY_LIMIT`=50,
  plus `docs/SECURITY.md`. **Founder redeployed the function (2026-06-05) → now live.**
- PR #87: report-only CSP meta + self-hosted Inter (`@fontsource-variable/inter`); removed rsms.me.
- PR #88: all 6 GitHub Actions pinned to commit SHAs (resolved via `git ls-remote`); CI verified.
- **Remaining:** (a) Turnstile **frontend** integration is required before CAPTCHA can be enabled
  (turning it on now would break sign-in — the app sends no captcha token); (b) flip CSP
  report-only → enforcing after the founder confirms a clean live console. See `docs/SECURITY.md`.

**Documentation updates (PRs #82–#83, live on `main`):**
- Added content QC & technical validation planning to-do.
- Expanded "Research findings" section with full open-licensed sourcing guide: licensing
  guardrails (CC0/BY/BY-SA = ok; NC/ND = blocked), table of 7 approved commercial-safe sources
  (Tatoeba, Wikibooks, Wikimedia Commons, Project Gutenberg, LibriVox, DWDS/Leipzig), and
  sources to avoid (DW, Goethe/Klett/Routledge). Also noted Anki/LARA open-source infra.

### Session 16 (2026-06-05) — Content expansion SHIPPED ✅ (10 scenarios · 10 exam sets · ~504 words)

Added 7 new branching scenarios (all remaining themes: meetings, logistics, travel, project,
homeoffice, conflict, safety) bringing the total to **10 scenarios across all 10 themes**.
Added 8 matching exam sets (total **10**, one per theme, 6–7 min, sharedRubric). Appended
~150 new vocabulary words across all themes (**354 → ~504**). Fixed 6 TypeScript errors where
dual-gender `article` values (`"der/die"`, `"die/der"`, `"das/die"`) violated the strict union
type — resolved by using the primary form's article. `npm run build` green; PR #80 squash-merged;
branch realigned to `origin/main`.

### Session 15 (2026-06-05) — Mobile bottom tab bar SHIPPED ✅ (Layer 2)

Replaced the hamburger drawer on mobile with a native-feeling bottom tab bar + "Mehr" sheet.
Files: `nav-items.ts` (shared nav), `BottomTabBar.tsx` (fixed bar, `lg:hidden`, safe-area aware),
`MoreSheet.tsx` (Radix bottom sheet, grab handle, 8 non-primary nav items), `AppShell.tsx`
(removes hamburger/drawer, mounts bar + sheet, `pb-nav` on main), `Toaster.tsx` (lifted above
bar on mobile), `index.css` (`.pb-safe` + `.pb-nav` utilities). Desktop sidebar untouched.
`npm run build` green, PR #76 squash-merged to `main`. Active branch: `claude/todo-inventory-BUHq0`.

### Session 14 (2026-06-05) — Mobile-app redesign plan expanded (Layer 2 + Point 3) 📋

Founder confirmed the home-screen app launches full-screen now (Layer 1 ✅) but still feels
desktop-sized with loose dimensions. Expanded **`docs/MOBILE_APP_PLAN.md`** into the full approved
plan: **Layer 2** (bottom tab bar + "Mehr" sheet) and **Point 3** (mobile density & fit — a
`sm:`-gated tightening of shared components `HubHero`/`SectionHeading`/`EmptyState`/`StatCard` +
page rhythm, plus targeted fixes to flashcard buttons, the Dashboard stat strip, the progress ring,
and exam/simulation timer headers). Plan was pressure-tested: found & documented a real Toaster vs
bottom-bar collision fix, guaranteed ≥44px touch targets, a `card.tsx` de-risk (leave it untouched —
all callers override padding), a multi-branch-hub scope guard, and a collision audit. Desktop stays
pixel-identical throughout. Also reconciled stale branch references for handoff: the active
automation branch has been `claude/genauly-blank-page-9biDi` since session 9
(`claude/loving-cray-lMLj3` was used through session 8); updated the forward-looking references in
`CLAUDE.md` + this doc's deploy reminders (historical session entries left as-is) and noted
**`main` is the source of truth** (branch may be reassigned per session). **No app code shipped
this session — documentation only.** Resume from Layer 2.

### Session 13 (2026-06-04) — iOS standalone fix: no more address bar ✅

Shipped **Step 1** of the mobile-app plan (`docs/MOBILE_APP_PLAN.md`) independently: added the iOS/
Android standalone meta tags to `index.html` so the home-screen icon launches **full-screen with no
Safari address bar**. iOS Safari ignores the manifest's `display: standalone` for home-screen
launch and requires `apple-mobile-web-app-capable` — that was the missing piece causing the "shows
browser version" symptom. Tags added: `apple-mobile-web-app-capable=yes`, `mobile-web-app-capable=yes`,
`apple-mobile-web-app-status-bar-style=black-translucent` (matches dark theme + viewport-fit=cover;
`.pt-safe` already compensates), `apple-mobile-web-app-title=Genauly`, `theme-color=#0f1729`.
`npm run build` green, no circular warning, all five tags verified in `dist/index.html`. The
bottom-tab-bar redesign (Steps 2–6) remains planned/deferred. **Founder must re-add the app to the
home screen** (iOS caches the old web-clip — delete the existing icon and Add-to-Home-Screen again
after the deploy) to pick up the change.

### Session 12 (2026-06-04) — Mobile-app redesign planned (deferred) 📋

Founder installed the PWA to their iPhone home screen — it works, but still shows Safari's
address bar and the UI feels like the website (desktop sidebar + hamburger drawer). Researched and
wrote a full, approved implementation plan to make it feel native: **`docs/MOBILE_APP_PLAN.md`**.
Scope = app chrome + navigation only (bottom tab bar Start · Wortschatz · Quiz · Fortschritt ·
Mehr; iOS standalone meta tags to launch full-screen; desktop stays pixel-identical). **Founder
chose to defer the build to a later session — no code shipped this session.** Resume from the plan
doc. Note: Step 1 (iOS meta tags) is an independent quick win that fixes the address bar on its own.

### Session 11 (2026-06-04) — Installable PWA ✅

Added full Progressive Web App support so Genauly can be installed to the home screen on any
device and launches app-like (full-screen, no browser chrome, offline-first).

**What was shipped:**
- `vite-plugin-pwa` (v1.3.0) added as a devDependency — generates a service worker via Workbox
  and injects the manifest automatically at build time; no hand-written SW code needed.
- **Web App Manifest** (`dist/manifest.webmanifest`): name, short_name, description, `display:
  standalone`, `theme_color: #6366f1`, `background_color: #0f1729`, `lang: de`,
  `orientation: portrait-primary`, `start_url: ./`, three icon sizes.
- **Service worker** (`dist/sw.js` + `dist/workbox-*.js`): precaches all 40 build artifacts
  (~1.57 MB); `navigateFallback: index.html` so hash-routes survive offline reload; `autoUpdate`
  strategy so returning users silently get the latest version in the background.
- **Icons** generated from `public/favicon.svg`:
  - `pwa-192x192.png` — standard PWA icon (Android Chrome)
  - `pwa-512x512.png` — full-res PWA icon / splash screen
  - `pwa-maskable-512x512.png` — maskable icon (safe zone = inner 80%) for adaptive icon shapes
  - `apple-touch-icon.png` (180×180) — iOS Safari "Add to Home Screen"
- `index.html` — added `<link rel="apple-touch-icon">` for iOS.
- **Works with the session-10 safe-area insets:** in standalone mode, `env(safe-area-inset-*)`
  is now non-zero, so the header and content bottom clearance are correct.

`npm run build` green · no circular-chunk warning · `npm run typecheck` green · 40 entries
precached. Founder to test "Add to Home Screen" on their phone once the Pages deploy completes.

### Session 10 (2026-06-04) — Mobile UX audit ✅

Code-level audit of every layout + interactive surface for mobile hazards (horizontal overflow,
sub-16px form fields → iOS zoom, fixed widths, tap targets, notch/home-indicator). **Verdict: the
app is already mobile-solid** — responsive grids throughout, `100dvh` dialogs, `overflow-x: clip`
on body, and the iOS input-zoom fix (form controls forced to 16px ≤640px) was already in place.

**One real gap found & fixed — safe-area insets.** `index.html` opts into `viewport-fit=cover`
(content extends under the notch / home indicator / side cutouts) but nothing consumed
`env(safe-area-inset-*)`, so on notched iPhones — especially landscape and home-screen/standalone —
the sticky header could sit under the status bar and the last controls could hide behind the home
indicator. Added `.pt-safe` / `.pb-safe-8` utilities (`src/index.css`) and applied them to the
`AppShell` header (top inset) and `<main>` (bottom inset). **Zero desktop risk:** `env()` insets
resolve to 0 on desktop and normal portrait Safari, so it's a no-op everywhere except notched/
standalone contexts. `npm run build` + `npm run typecheck` green.

**Natural follow-on (not done):** make the app an installable PWA (manifest + service worker) —
that's where safe-area insets fully pay off and where mobile users get an app-like, offline launch.

### Session 9 (2026-06-04) — Blank page bug ROOT-CAUSED & FIXED ✅

**Root cause (proven, not speculative): a circular ESM *chunk* dependency introduced by the
session-6 `manualChunks` config.**

- `react-router` / `react-router-dom` matched the `node_modules/react-router` rule → `vendor-react`.
- Their dependency **`@remix-run/router`** matched **no** rule → fell through to the catch-all
  `vendor-misc`.
- Result: `vendor-react` imported `@remix-run/router` **from** `vendor-misc`, while `vendor-misc`
  imported React **from** `vendor-react` → **`Circular chunk: vendor-misc -> vendor-react ->
  vendor-misc`** (this warning was printed on *every* build since session 6 but was ignored).
- With circular ES modules the browser can evaluate a binding while it is still in its **temporal
  dead zone**, throwing `ReferenceError: Cannot access 'X' before initialization` **synchronously
  during module evaluation — before `createRoot()` runs**. Because it's a `type="module"` script
  throwing *pre-React*, the `RootErrorBoundary` can't catch it and nothing renders → blank dark
  page. Worked in `vite dev` because dev serves unbundled modules in correct order. This matches
  every symptom and every previously ruled-out item.

**The fix (`vite.config.ts`):** add `node_modules/@remix-run/router` to the `vendor-react` rule so
the entire React + router graph lives in one chunk. After rebuild: the circular-chunk warning is
gone, `vendor-react` imports from **no** other chunk, and a pairwise scan of all emitted chunks
shows **zero** cycles. `npm run build` + `npm run typecheck` both green.

**Permanent safety net (`src/main.tsx`):** added a framework-free `paintFatal()` that writes the
error straight into `#root` via the DOM, plus `window.onerror` / `unhandledrejection` listeners and
a `try/catch` around `createRoot()`. Any *future* pre-React/module-level crash (TDZ, chunk 404,
unsupported browser API) is now visible on screen instead of a silent blank page — important since
the founder is usually on mobile and can't open a console. Kept as a permanent net.

**Verification done in sandbox:** built fresh, confirmed every chunk hash referenced by
`dist/index.html` exists on disk, confirmed no cross-chunk import cycle remains, typecheck clean.
The sandbox can't reach the live `*.github.io` site — founder confirms the live result.

### Session 8 (2026-06-04) — Blank page bug investigation (root cause was the circular chunk above)

**Symptom:** Site shows a completely black blank page (dark background from CSS, no React content). Reported by founder on mobile. Persists across multiple deploys.

**What was shipped in this session (PRs #64–#66, all merged to main):**
- PR #64: Analytics page enhancement (30-day XP chart, per-theme mastery, writing weaknesses panel)
- PR #65: Added `RootErrorBoundary` in `main.tsx` to catch and display render errors
- PR #66: Reverted `LandingPage` and `Dashboard` to static imports (removed `React.lazy` + `fallback={null}` which caused a blank-page window during chunk loading on slow mobile connections)

**Diagnosis so far:**
- Dark background shows HTML + CSS load correctly; only JavaScript fails to render
- `RootErrorBoundary` is deployed and would show an error message if React mounts — but page remains blank, suggesting React never mounts at all
- All CI builds pass; `npm run build` and `npm run typecheck` are both green
- No obvious crash-inducing code found via static analysis
- The issue may be: browser/CDN cache serving old `index.html` (referencing old chunk hashes that no longer exist) → JS fails to load → blank page. GitHub Pages CDN caches HTML for ~10 min.
- Founder was on mobile and couldn't check browser console (F12)

**Most likely next steps for the new session:**
1. **First thing:** Ask founder to open genauly.de on a desktop browser and check the Console tab (F12 → Console). The error message will be there even if React didn't mount.
2. **If blank on desktop too:** The issue is in the production JS. Console will show either a 404 for a chunk file, or a JS runtime error.
3. **If works on desktop:** It's a mobile-specific browser cache issue. Ask founder to clear site data in their mobile browser settings for genauly.de, or try incognito/private tab.
4. **Fallback:** If a specific error is found in the console, fix it directly. If it's a chunk 404, consider adding a version query string to force cache-busting or investigate if GitHub Pages is serving stale files.

**What NOT to try again:** Blind deploys without knowing the specific error. The error boundary is in place — the next session MUST get the actual console error first.

### Session 7 (2026-06-04) — Analytics screen enhancement (SHIPPED & LIVE)

- **Analytics page rewrite (`src/features/analytics/Analytics.tsx`):**
  - **30-day XP chart:** extended from 7 to 30 days; X-axis uses `interval={4}` to avoid label crowding.
  - **Per-theme mastery breakdown:** all 10 themes displayed in a card, sorted least-mastered first (most gaps at top). Each row shows theme name, mastered/total word count, percentage, and a progress bar.
  - **Writing weaknesses panel:** async-loads the last 60 writing evaluations via `getWritingHistory(60)`. Shows top 5 weakness categories with frequency bars (widths relative to most-frequent), and a "Jetzt üben" button linking to the relevant practice area for the top weakness. Skeleton loader shown while data is loading.
  - No new dependencies — reuses existing recharts, practiceAreas, writing lib, and shared components.

### Session 6 (2026-06-04) — Performance: vendor code-splitting (SHIPPED & LIVE, PR #62)

- **Bundle split (`vite.config.ts`):** added `manualChunks` separating all `node_modules` into
  six independently-cached vendor chunks: `vendor-react` (161 KB), `vendor-supabase` (204 KB),
  `vendor-motion` (109 KB), `vendor-ui` (68 KB), `vendor-charts` (303 KB), `vendor-misc` (237 KB).
- **Lazy-loaded `LandingPage` and `Dashboard`** in `router.tsx` to keep the bootstrap chunk lean.
- **Results:** main bundle 836 KB → **34 KB** (96% reduction); Analytics chunk 392 KB → **6 KB**;
  no chunk exceeds 500 KB; build warnings gone. Vendor chunks are cached separately — deploys
  only force re-download of changed app chunks, not the full vendor stack.

### Session 5 (2026-06-03) — Content expansion + Collocation card UX (SHIPPED & LIVE)

- **Collocation card spacing (PRs #57–#59, live):** iteratively fixed spacing hierarchy so
  lines 1→2 (phrase → translation) and 3→4 (example German → example English) are equally tight,
  with a clearly larger section break between them (final values: no added margin for 1→2, `mt-5`
  for 2→3, `space-y-0.5` for 3→4).
- **Hover-reveal speak buttons (PR #58, live):** on mouse/pointer devices (`@media(hover:hover)`)
  both speak buttons are hidden by default. Moving into the card's top half reveals the phrase
  button; bottom half reveals the example button. Always visible on touch devices. Implemented by
  extracting a `CollocationCard` component with per-card `hoverHalf` state and `onMouseMove`.
- **Content expansion — Collocations (PR #60, live):** added 22 new Nomen-Verb pairs, bringing
  all 10 themes from 9–11 entries to exactly 12 each. Total: **120 collocations**.
  New entries span all themes: tagesordnung festlegen, kapazitäten prüfen, urlaub beantragen,
  ware prüfen, versand vorbereiten, erwartungen erfüllen, feedback einholen, mediation einleiten,
  fehler eingestehen, meilenstein erreichen, budget einhalten, update einspielen,
  sicherheitslücke schließen, abrechnung einreichen, anschluss verpassen, aufenthalt verlängern,
  abfall trennen, nachhaltigkeit verankern, zertifizierung anstreben, schutzausrüstung tragen,
  sicherheitsbegehung durchführen, notfallplan erstellen.
- **Content expansion — Grammar drills (PR #60, live):** added 2 new drills per grammar topic
  across all 10 topics (27 → **47 total**). Topics previously with only 2 drills (Konjunktiv II,
  Modalverben, Passiv) now have 4; the rest have 5. New drills cover: dennoch/indem connectors,
  genitive relatives (dessen), dative plural (denen), da-/wo-words in context (daran, darauf),
  full TeKaMoLo word order, obwohl/wenn subordinate clauses, two-way preposition pairs
  (wohin/wo), Konjunktiv II direct forms (hätte/wäre), darf-nicht vs muss-nicht distinction,
  and Passiv Präteritum (wurde).
- **Vocabulary:** already at **354 words** (34–39 per theme, well-balanced) — no expansion needed.

### Session 4 (2026-06-03) — Writing History + Collocations Browser + UX polish (SHIPPED & LIVE)

- **Writing History (PRs #52–#53, live):** `src/features/writing/WritingHistory.tsx` — loads past
  AI evaluations from `writing_evaluations` Supabase table; shows weakness-frequency bar chart (top 5
  weaknesses, horizontal progress bars, "Jetzt üben" CTA for the top weakness) + chronological list of
  past entries with badges, insight text, and deep-link to practice. Wired into `WritingHub` as a
  tab-switched "Verlauf" view alongside the existing "Neuer Text" prompt picker. `src/lib/writing.ts`
  got `WritingHistoryEntry` type + `getWritingHistory(limit)` async query.
- **Collocations Browser (PR #51→#56, live):** dedicated `/collocations` route — `CollocationsBrowser`
  browsing all 98 Nomen-Verb pairs. Features: theme Select dropdown, text search with clear button,
  scrollable verb-chip row with ChevronLeft/Right + ChevronDown expand-all, "Alle Verben" default chip,
  register color-coding (indigo pastel for formal), neutral/formal legend, result count, quiz CTA when
  theme active. Linked from Sidebar (Combine icon) and from a GrammarHub banner.
- **Content fix:** `src/data/collocations.ts` had two duplicate IDs (`c_beschwerde_bearbeiten` ×2 and
  `c_daten_sichern` ×2) that caused React to silently drop cards. Renamed second occurrences `_2`.
  Total unique collocations: 98.
- **App-wide card polish:** removed `h-1.5` top-border accent stripe from ALL card styles across
  Dashboard, QuizHub, GrammarHub, WritingHub — it served no semantic purpose. Collocation cards refined
  iteratively: English translation closer to German (`-mt-2`), divider line removed, German example
  sentence bolded (`font-semibold`).
- **Stuck-card animation bug fixed (PR #54):** per-card `motion.div` with `delay: i * 0.025` caused
  cards to freeze at `opacity:0` when verb filters changed their list position. Fixed by removing per-
  card animation and keying a single grid-level `motion.div` on `${themeParam}__${verbFilter}` —
  forces a full grid remount + quick fade-in on every filter change.
- **TypeScript 6 compatibility fix:** environment had TS 6.0.2 vs expected 5.7. Added
  `"ignoreDeprecations": "5.0"` to both `tsconfig.app.json` + `tsconfig.node.json`, and installed
  `@types/node` as a dev dependency. Build now green.
- **Dev branch note:** session 4 work was developed on `claude/loving-cray-lMLj3` (previous branch
  `claude/loving-cray-lMLj3` became stale after PR history rewrite).

### Sessions 1–2 (initial build — dates not recorded)
The initial from-scratch build predates this session-logging convention, so there are no dedicated
entries and no reliable dates to backfill. Only trace: session 2 shipped two broken builds because a
build check was skipped (see the Deploy/workflow reminders above). Kept here so the numbering is
visibly complete.

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
      vocab, 132 collocations, 12 dialogues, 11 themes. This is the reference template for the
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

## Model guidance — which Claude model to set per session (added 2026-06-11)

> **Fable temporarily unavailable (2026-06-15):** Fable is restricted by the US government and cannot
> be selected right now. **Until it returns, use Opus for any task that recommends Fable** (design,
> strategy, legal nuance, research-heavy planning). The "Recommended model: Fable" notes throughout
> this doc stand as the long-term preference; read them as "Opus for now" while the restriction holds.
> Revert to Fable once it is available again.

We now have **Fable 5** as the frontier model alongside the Claude 4.X family. Claude Code does
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
| **Sonnet 4.6** | Standard build work: well-specified features, UI from an approved plan, structured content authoring, doc-following integrations | Medium |
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
| Dashboard redesign | **Opus** | Many components; Fable for design direction first |
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

## Resume here (next session)

**Handoff after session 26 (2026-06-16).** Everything noted ✅ is merged to `main`.
Active automation branch: `claude/context-bar-menu-animations-g9gfd3` (realign to `origin/main`
after each squash-merge — see CLAUDE.md). The branch name is reassigned per session; `main` is the
source of truth.

**Most recent work (sessions 27–28):** nav-icon polish — full-opacity icons, optical-size re-tune,
two-tone + neon marks for every route, and **grey-gradient icon backdrops** (s27); then the
**selection-cloud refinement (s28)**: the active backdrop is now a **compact rounded squircle** that
hugs the icon (flat "G1" `from-muted to-border` gradient, no protruding dome), and in the More sheet
the cloud appears **only behind the selected section** (others are bare icons on white), while edit
mode keeps the squircle as the draggable-tile handle. See the Session 27/28 logs above and the
CLAUDE.md "Mobile bottom tab bar" section (s27/s28 rules) for the locked behavior.

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

**Content counts (live, verified by `pnpm lint:content` 2026-06-14):**
- Vocabulary: **490 words** (was 498; 8 duplicate ids removed s22)
- Collocations: **120 Nomen-Verb pairs** (12/theme)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **10** (1 per theme)
- Exam sets: **10** (1 per theme · 6–7 min · sharedRubric)
- Redemittel: **72** entries

**Dev branch:** `claude/vibrant-meitner-mfl9xk` — realign to `origin/main` after each squash-merge.

### Session 24 (2026-06-16) — Mobile nav bar complete redesign + bug fixes (PRs #175–#176) ✅

This session completed a multi-iteration redesign of the mobile bottom tab bar and More sheet
that the founder drove across sessions 23–24. All changes are live on `main`.

**Feature set delivered (full list):**

- **Always-colored icons:** icons show their accent color at all times. Inactive = 38% opacity,
  active = 100%. Never grey/monochrome. The four hero icons (Dashboard, Vocabulary, Quiz,
  Analytics) use custom SVGs with the brand palette; all other routes use their lucide icon at
  the same opacity rule.

- **Larger, intentional nav bar:** icons 20% bigger (29px), taller context strip with a colored
  dot + semibold label, 62px icon rail. Spacing is even and deliberately sized.

- **More sheet grid:** additional routes shown in a 3-column icon grid with names below each tile,
  matching the visual language of the bar. No section headers.

- **iOS home-screen edit mode:**
  - Long-press anywhere on the bar OR the More sheet (600ms + haptic vibrate) opens edit mode.
  - Icons jiggle (framer-motion infinite rotate animation) and show a red X badge.
  - Drag icons left/right in the bar to reorder.
  - Tap X to remove an icon (hidden when at minimum 2 icons in bar).
  - No "Fertig" button. Tapping outside auto-saves and exits edit mode.
  - Home and Mehr are fixed; everything else is moveable between bar and sheet.

- **Adding icons to the bar (two gestures):**
  - Tap the green + badge on a sheet icon.
  - Drag the sheet icon downward ~72px (it scales to 1.18× near the threshold as visual feedback,
    then snaps back and the icon appears in the bar).
  - Both show a green checkmark flash as confirmation.

- **Max/min constraints:** max 4 icons + Mehr in bar; min 2 icons (X button hidden at minimum).

- **iOS context menu suppressed:** long-pressing `<a>` tags on iOS shows a "Copy link / Share"
  native popup. Fixed with `.no-callout` CSS class (in `index.css`) applying
  `-webkit-touch-callout: none !important` to the container AND its `*` children. Inline style
  does NOT cascade to NavLink's rendered `<a>` tags; only the CSS class selector does.

- **Bar stays interactive while sheet is open:** `modal={false}` on `DialogPrimitive.Root` in
  `MoreSheet.tsx`. Radix Dialog's default modal mode sets `pointer-events: none` on everything
  outside the sheet, which made the bar inert. `modal={false}` with a custom
  `onInteractOutside` guard (allows clicks on `#bottom-tab-bar`) is the correct fix.

- **GPU compositing fix for iOS Safari:** `transform: translateZ(0)` + `willChange: transform`
  on the `<nav>` element prevents iOS Safari from collapsing the bar under a `backdrop-filter`
  sibling.

**Bugs fixed in final PR #175:**

1. **Sync bug (icons added from sheet didn't appear in bar):** `BottomTabBar` had a `localOrder`
   buffer state with a `useEffect` that only synced from the store when `!editMode`, silently
   ignoring `setPinnedTabs` calls while the sheet was open. Fixed by removing `localOrder`
   entirely; the bar reads `pinnedTabs` from the zustand store directly — store is the single
   source of truth.

2. **Drag-to-reorder in bar not working:** `Reorder.Group` now writes every reorder back to the
   store. `flexGrow: moveablePaths.length` keeps all icon slots the same width regardless of count
   (previously `flex-1` caused all moveable icons to bunch into one slot).

3. **X button not firing:** action was in `onPointerDown` which framer-motion's drag consumed
   first. Fixed: action in `onClick`, guarded by `onPointerDownCapture` + `onPointerDown`
   stopPropagation so the drag gesture never sees the pointer.

**Founder preferences captured:**
- Edit mode must feel exactly like iOS/Android home screen app rearrangement.
- No extra buttons/chrome in edit mode; gestures drive everything.
- Icon colors must always be visible (never greyed out).
- More sheet is purely a navigation/edit surface — no section labels, no hierarchy.
- Feedback (checkmark flash, scale animation) is essential so the user knows their tap/drag worked.
- No native browser popup interrupting long-press on mobile links.

All changes shipped as PR #175 + docs PR #176, both squash-merged to `main`.

**Next (priority order):**
1. **Cloudflare Pages migration (decided s22, deferred until OAuth clears):** after Google confirms
   OAuth branding approval via email, migrate from GitHub Pages. Steps for the migration session:
   - Add a `_redirects` file for Cloudflare Pages SPA routing (replaces `public/404.html` + `spa-redirect.js`).
   - Connect GitHub repo to Cloudflare Pages (build: `pnpm build`, output: `dist`).
   - Move `genauly.de` DNS from Namecheap to Cloudflare nameservers.
   - Verify Google OAuth redirect URI still works post-DNS change.
   - Update `pages.yml` or remove it if GitHub Pages deploy is retired.
   - **Privacy bonus (decided s26):** making the repo private here is also how the founder wants the
     prompt/session logs (`docs/SESSION_PROMPT_LOG.md` + `docs/prompt-log-raw.jsonl`) and `CLAUDE.md`
     made private. The founder chose this over a separate private repo for the logs, so until this
     migration lands the repo (and new log entries) stay public. Switch the repo to **private** as
     part of this migration.
2. **GDPR follow-ups (from s20 pass):** fill the **Impressum** name/address (then re-enable the page
   per `CLAUDE.md`/`PHASE2_SETUP.md`) and the **data-location region** placeholder in the privacy
   policy; optionally enable the **pg_cron auto-retention** for writing text (SQL in `PHASE2_SETUP.md`).
3. **Lawyer review of `/privacy` + `/terms` (backlog #15)** before paid plans / marketing. Likely adds
   the real Impressum, Widerrufsrecht for paid plans, tighter liability.
4. **Content QC pipeline** — mechanical half **DONE (s22)**: `pnpm lint:content` + CI gate
   (`validate.yml`) for duplicate ids, broken dialogue nodes, missing fields, dangling cross-refs,
   em dashes. Remaining: the **pedagogical review process** for German accuracy and B2
   level-appropriateness (process/LLM-judgment, not code; recommended model **Fable**).
5. (Optional) Add Resend SMTP to fix email magic-link rate-limit.
6. (Optional) Monetization tier + paywall feature flags (the `tier` column already exists).
7. (Optional) More grammar drills (47 → ~80 target).
8. (Optional) More vocabulary content expansion (504 → ~600+ target).
9. **Founder ideas backlog (added 2026-06-07)** — 14 raw feature ideas spanning product (Dashboard
   redesign, gating Schreibtraining behind sign-in, animated scenario simulations, vocabulary
   visual mnemonics, domain/sector content filtering, Schreibtraining redesign, sourced/audit-ready
   content pipeline), monetization (pricing page + plans, payment gateway), growth (FAQ + landing
   copy expansion, SEO, marketing campaign), and compliance (full GDPR compliance beyond the
   `/privacy` page). None scoped yet — see "Backlog — founder ideas" above for the full list; a
   future session should help prioritize and break these into phases.

_(Layer 1 ✅ · Layer 2 ✅ · Layer 3 ✅ · Content: all 10 themes ✅ · Security: 100% complete ✅)_
