# Project Status & Decision Log

_Last updated: 2026-06-05 (session 17). Branch: `claude/todo-inventory-BUHq0`. Product name: **Genauly** (domain `genauly.de`)._

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
- App named **Genauly**, tagline **"German that clicks"** (header, sidebar, onboarding,
  `<title>`/meta, `package.json` name `genauly`). Custom domain **genauly.de** (CNAME shipped).
- **Logo: reverted to placeholder** (Sparkles icon + original gradient speech-bubble favicon).
  A custom mark was tried and rolled back; founder will choose a logo later.

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

## Deploy / workflow reminders
- `main` is production; merging to it triggers `pages.yml` (the **only** workflow now — the old
  `deploy.yml`/`gh-pages` fallback is gone). Develop on the active automation branch (currently
  `claude/genauly-blank-page-9biDi`; `main` is the source of truth); ship via
  squash-merge PR. **Always verify `npm run build` is green on the exact commit before merging**
  (a skipped check shipped two broken builds in session 2).
- **Feature-branch pushes are NOT live.** Only `main` deploys. In session 3 the founder reported
  "I don't see any change" because the dark-mode commits were pushed to the branch but never merged.
  **Auto-ship preference (founder approved 2026-06-01): when a change is done and the build is green,
  open + squash-merge the PR yourself without asking** — see CLAUDE.md.
- **REQUIRED post-deploy housekeeping (after every squash-merge):** realign the dev branch so it
  doesn't drift and conflict on the next PR — `git fetch origin main` → `git reset --hard origin/main`
  → `git push --force-with-lease origin claude/genauly-blank-page-9biDi`. (Forgetting this caused the
  PR #23 merge conflict.) Full checklist in CLAUDE.md → "Post-deploy GitHub housekeeping".
- Sandbox can't reach the live site or run Docker (so no local Supabase / no live verification
  here) — those steps are handed to the founder, same as the Pages deploy.

## Deploy / ops notes (accumulated)
- `main` is production; merging triggers `pages.yml`. Develop on the active automation branch
  (currently `claude/genauly-blank-page-9biDi`); ship via squash-merge PR. **Always verify
  `npm run build` green before merging.**
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

### Session 17 (2026-06-05) — Security audit, documentation, and sourcing research

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

**Plan document:** `docs/SECURITY_AUDIT_PLAN.pdf` (4-page PDF, committed to dev branch).
Implementation will be rolled out in 4 PRs (pnpm migration → Edge Function hardening →
Frontend hardening / CSP → CI SHA-pinning). CSP ships in report-only mode first.

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

## Resume here (next session)

**Handoff after sessions 9–17 (2026-06-04 → 06-05).** Everything noted ✅ is merged to `main`.
Active automation branch: `claude/todo-inventory-BUHq0` (realign to `origin/main` after each
squash-merge — see CLAUDE.md).

**Shipped & live (all on `main`):**
- **Blank-page bug FIXED (s9):** circular ESM chunk → pre-React TDZ crash + permanent crash painter.
- **Mobile UX safe-area insets (s10):** `.pt-safe`/`.pb-safe-8` for notched iPhones.
- **Installable PWA (s11):** service worker, web manifest, icons, offline-first.
- **iOS standalone / no address bar (s13):** `apple-mobile-web-app-capable` meta tags.
- **Mobile bottom tab bar (s15, PR #76):** native bottom nav. Desktop sidebar untouched.
- **Mobile density & fit (s15, PRs #77–#78):** `sm:`-gated tightening across all components/pages.
- **Content expansion (s16, PR #80):** 10 scenarios · 10 exam sets · ~504 vocabulary words.
- **Docs: content QC & sourcing research (s17, PRs #82–#83):** to-do + licensing guide in status doc.
- **Security hardening — 4 PRs SHIPPED ✅ (s17, PRs #85–#88):**
  1. **PR #85 — pnpm migration + vuln fix:** `react-router-dom ^6.30.4`; pnpm lockfile; `.npmrc`
     supply-chain guardrails. `pnpm audit` 2 moderate → **0**. CI build verified green on `main`.
  2. **PR #86 — Edge Function hardening:** CORS allowlist (replaced `*`); max input cap
     (`MAX_TEXT_LEN`=3000); per-user monthly cap (`USER_MONTHLY_LIMIT`=50); `docs/SECURITY.md`.
     ⚠️ Takes effect only after the founder **redeploys the function** (see checklist below).
  3. **PR #87 — Frontend hardening:** CSP **report-only** meta in `index.html`; self-hosted Inter
     via `@fontsource-variable/inter` (removed third-party rsms.me). Build-verified: dist has no
     rsms.me refs, fonts self-hosted, both scripts external same-origin (CSP-clean).
  4. **PR #88 — CI SHA-pinning:** all GitHub Actions pinned to commit SHAs (tag-hijack defense).
  - Full plan: `docs/SECURITY_AUDIT_PLAN.pdf`; details in `docs/SECURITY.md`.

**In-progress / planned (not yet on `main`):**
- **CSP enforce flip** — once the founder confirms the live site loads with no CSP violations in
  the browser console (report-only logs them, blocks nothing), a follow-up PR changes
  `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in `index.html` to enforce.

**Founder dashboard checklist (security — do now that PRs are merged):**
1. Supabase → Authentication → Bot & Abuse Protection → **enable Turnstile CAPTCHA**.
2. Edge Functions → evaluate-writing → Secrets → optionally set `ALLOWED_ORIGINS`,
   `MAX_TEXT_LEN`, `USER_MONTHLY_LIMIT` (safe defaults already baked in).
3. **Redeploy `evaluate-writing`** via dashboard code editor (paste updated `index.ts`) — the
   CORS + cap changes only go live after this.
4. Open genauly.de → F12 → Console; if no red CSP violation messages, tell me and I'll flip CSP
   to enforcing.

**Decisions locked:**
- Bottom tab bar = **Start · Wortschatz · Quiz · Fortschritt · Mehr** (Mehr-sheet = other 8).
- Mobile redesign = **Layer 2 ✅ · Layer 3 ✅ — DONE**.
- Keep `src/components/ui/card.tsx` **untouched**.
- Pre-React crash painter is a **permanent** safety net (do not remove).
- CSP ships **report-only first**; founder confirms live site clean before enforcing.

**Content counts (live):**
- Vocabulary: **~504 words** (~50/theme · 10 themes)
- Collocations: **120 Nomen-Verb pairs** (12/theme)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **10** (1 per theme)
- Exam sets: **10** (1 per theme · 6–7 min · sharedRubric)
- Redemittel: **72** entries

**Dev branch:** `claude/todo-inventory-BUHq0` — realign to `origin/main` after each squash-merge.

**Next (priority order):**
1. **Founder security steps** — Turnstile CAPTCHA, redeploy the Edge Function, confirm CSP-clean
   console (see checklist above). Then I flip CSP report-only → enforcing.
2. **Content QC pipeline** — CI lint script for duplicate IDs, broken dialogue nodes, missing fields;
   plus a pedagogical review process for German accuracy and B2 level-appropriateness.
3. (Optional) Add Resend SMTP to fix email magic-link rate-limit.
4. (Optional) Logo / branding for app icon.
5. (Optional) Monetization tier + paywall feature flags.
6. (Optional) More grammar drills (47 → ~80 target).

_(Layer 1 ✅ · Layer 2 ✅ · Layer 3 ✅ · Content: all 10 themes ✅ · Security: 4 PRs shipped, CSP-enforce + founder steps pending)_
