# Project Status Archive — 2026-W23 (Jun 1–7)

_Detailed session logs, sessions 1–19. Split from `PROJECT_STATUS_ARCHIVE.md` by ISO week in s70._

### Sessions 1–2 (initial build — dates not recorded)
The initial from-scratch build predates this session-logging convention, so there are no dedicated
entries and no reliable dates to backfill. Only trace: session 2 shipped two broken builds because a
build check was skipped (see the Deploy/workflow reminders above). Kept here so the numbering is
visibly complete.


---


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


### Session 6 (2026-06-04) — Performance: vendor code-splitting (SHIPPED & LIVE, PR #62)

- **Bundle split (`vite.config.ts`):** added `manualChunks` separating all `node_modules` into
  six independently-cached vendor chunks: `vendor-react` (161 KB), `vendor-supabase` (204 KB),
  `vendor-motion` (109 KB), `vendor-ui` (68 KB), `vendor-charts` (303 KB), `vendor-misc` (237 KB).
- **Lazy-loaded `LandingPage` and `Dashboard`** in `router.tsx` to keep the bootstrap chunk lean.
- **Results:** main bundle 836 KB → **34 KB** (96% reduction); Analytics chunk 392 KB → **6 KB**;
  no chunk exceeds 500 KB; build warnings gone. Vendor chunks are cached separately — deploys
  only force re-download of changed app chunks, not the full vendor stack.


### Session 7 (2026-06-04) — Analytics screen enhancement (SHIPPED & LIVE)

- **Analytics page rewrite (`src/features/analytics/Analytics.tsx`):**
  - **30-day XP chart:** extended from 7 to 30 days; X-axis uses `interval={4}` to avoid label crowding.
  - **Per-theme mastery breakdown:** all 10 themes displayed in a card, sorted least-mastered first (most gaps at top). Each row shows theme name, mastered/total word count, percentage, and a progress bar.
  - **Writing weaknesses panel:** async-loads the last 60 writing evaluations via `getWritingHistory(60)`. Shows top 5 weakness categories with frequency bars (widths relative to most-frequent), and a "Jetzt üben" button linking to the relevant practice area for the top weakness. Skeleton loader shown while data is loading.
  - No new dependencies — reuses existing recharts, practiceAreas, writing lib, and shared components.


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


### Session 12 (2026-06-04) — Mobile-app redesign planned (deferred) 📋

Founder installed the PWA to their iPhone home screen — it works, but still shows Safari's
address bar and the UI feels like the website (desktop sidebar + hamburger drawer). Researched and
wrote a full, approved implementation plan to make it feel native: **`docs/MOBILE_APP_PLAN.md`**.
Scope = app chrome + navigation only (bottom tab bar Start · Wortschatz · Quiz · Fortschritt ·
Mehr; iOS standalone meta tags to launch full-screen; desktop stays pixel-identical). **Founder
chose to defer the build to a later session — no code shipped this session.** Resume from the plan
doc. Note: Step 1 (iOS meta tags) is an independent quick win that fixes the address bar on its own.


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


### Session 15 (2026-06-05) — Mobile bottom tab bar SHIPPED ✅ (Layer 2)

Replaced the hamburger drawer on mobile with a native-feeling bottom tab bar + "Mehr" sheet.
Files: `nav-items.ts` (shared nav), `BottomTabBar.tsx` (fixed bar, `lg:hidden`, safe-area aware),
`MoreSheet.tsx` (Radix bottom sheet, grab handle, 8 non-primary nav items), `AppShell.tsx`
(removes hamburger/drawer, mounts bar + sheet, `pb-nav` on main), `Toaster.tsx` (lifted above
bar on mobile), `index.css` (`.pb-safe` + `.pb-nav` utilities). Desktop sidebar untouched.
`npm run build` green, PR #76 squash-merged to `main`. Active branch: `claude/todo-inventory-BUHq0`.


### Session 16 (2026-06-05) — Content expansion SHIPPED ✅ (10 scenarios · 10 exam sets · ~504 words)

Added 7 new branching scenarios (all remaining themes: meetings, logistics, travel, project,
homeoffice, conflict, safety) bringing the total to **10 scenarios across all 10 themes**.
Added 8 matching exam sets (total **10**, one per theme, 6–7 min, sharedRubric). Appended
~150 new vocabulary words across all themes (**354 → ~504**). Fixed 6 TypeScript errors where
dual-gender `article` values (`"der/die"`, `"die/der"`, `"das/die"`) violated the strict union
type — resolved by using the primary form's article. `npm run build` green; PR #80 squash-merged;
branch realigned to `origin/main`.


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


