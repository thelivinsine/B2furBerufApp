# Project Status Archive — evergreen ops notes & condensed recaps

_Undated deploy/ops notes, early auth/landing branch notes, and the cross-week condensed recaps
(sessions 9–28) that don't belong to a single ISO week. Split from `PROJECT_STATUS_ARCHIVE.md` in s70._

### Deploy / ops notes (accumulated)

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




### Older session logs (archived)

Detailed session-by-session logs for **sessions 4–46** now live in
`docs/archive/PROJECT_STATUS_ARCHIVE.md`, to keep this file navigable. The condensed handoff history is
still in the “Resume here” section below; git history and `docs/SESSION_PROMPT_LOG.md` remain the
authoritative full record.



## Condensed multi-session recaps (sessions 9–28)

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
  - See `docs/strategy/SECURITY.md` for full details. No open security items remain.
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
  in `CLAUDE.md`, `docs/plans/PHASE2_SETUP.md`.
- **Writing history records task + text (s20, PRs #128–#129):** the Verlauf now shows the Aufgabe and
  the learner's own submitted text in an expandable, well-structured entry (tip box + labeled sections).
- **Google OAuth consent branding DONE (s20):** founder completed the Google Cloud Console steps
  (app name "Genauly" + logo, domain `genauly.de` verified via Namecheap DNS TXT, app published).

- **Broader B1-B2 positioning (s21, PR #140):** landing page re-copied for "German for real life,
  B1-B2 plateau" framing (exam prep repositioned as secondary); new `/about` page with plain-language
  purpose + Google sign-in data explanation; business plan `docs/strategy/BUSINESS_PLAN.md` v1.1; backlog
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

---


