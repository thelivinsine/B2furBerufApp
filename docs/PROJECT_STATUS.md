# Project Status

_Last updated: 2026-08-16 (session 219, no branch: found `genauly.de` fully offline — GitHub Pages
had silently disabled itself when session 216 made the repo private (Free-plan Pages needs a public
repo) — made the repo public again, re-enabled Pages, and prerendered a real `/privacy` page so
Google's OAuth consent-screen crawler (which doesn't run JS) gets a 200 instead of the SPA's
404-redirect trick. Session 217, branch `password-reset-flow`: built password reset + change, a gap
found while scoping a founder request about the Settings page.
Sessions 209-216 are archived in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`,
sessions 204-208 in the `W32` file beside it. All handoffs under their own "Resume here")._

**Session 219 (2026-08-16, no branch): `genauly.de` was completely down — 404 on every route —
because GitHub Pages silently disabled itself when session 216 made the repo private.** Founder
asked for the Google OAuth consent-screen logo-update link, then shared Google's verification
failure list (home page unresponsive, no privacy link, privacy URL unresponsive/same-as-home, app
name mismatch). All of those traced back to one cause: `GET /repos/.../pages` was 404'ing and the
last three "Deploy site to GitHub Pages" runs had failed with "Get Pages site failed" — Pages
requires a public repo on the Free plan, so it turned itself off the moment session 216 flipped
visibility (that session's docs entry wrongly assumed Pages survives on any plan; corrected in the
archive). Fix, done live with the founder across several steps: repo back to public → re-enable
Pages (Settings → Pages → Source: GitHub Actions) → re-ran the latest deploy workflow → set the
custom domain `genauly.de` in Settings → Pages (DNS was already pointed correctly from earlier
Namecheap work, so it verified immediately). `genauly.de` now returns 200.
That fixed the home page, but `/privacy` still 404'd: it's the standard `spa-github-pages`
redirect trick (a direct hit to any non-root path gets GitHub's real 404 response, which then
JS-redirects into the SPA) — fine for a browser, but Google's automated checker does a plain HTTP
GET and never runs the JS. Extended the existing `/hilfe` prerender step
(`scripts/prerender-help.mjs`, previously help-only) to also render `/privacy` as a real static
`dist/privacy/index.html` at build time: exported `PrivacyDe`/`PrivacyEn` from `PrivacyPolicy.tsx`
(no router/hook dependencies, so they render standalone) and used `react-dom/server`'s
`renderToStaticMarkup` on `PrivacyDe`, so the policy text has exactly one source, not a duplicated
copy for crawlers. Also, per founder request, swapped the placeholder contact address
(`thelivinsine@gmail.com`) for `hello@genauly.de` across `PrivacyPolicy.tsx`, `TermsOfService.tsx`,
and `Impressum.tsx`, and filled the two `[Vollständiger Name]`/`[Full name]` operator-name
placeholders in `Impressum.tsx` with "Suhas Pala" (the postal-address placeholders are still
unfilled — the Impressum is not §5-TMG-compliant until the founder supplies a real address).
**Founder re-submitted to Google and got a NEW, shorter failure list** (home page behind a login
page, home page does not explain its purpose, app name mismatch) — the unresponsive/duplicate-URL
items were gone, confirming the deploy fix worked, but these three were new information. Loaded
`https://genauly.de/` in a real browser: it renders a full public landing page (hero, FAQ, "Log
in"/"Start free", no gate) once React hydrates, contradicting "behind a login." Root cause was in
`index.html`: the static pre-render inside `#root` (added in an earlier session for exactly this
purpose) was hidden behind a `<noscript>` CSS toggle, so any JS-ENABLED crawler that snapshots
before the ~1.5 MB of vendor JS finishes downloading and hydrating sees only a bare spinner, no
text, no "Genauly" — reading as ungated-but-empty ("behind a login"), purposeless, and (since the
only visible brand text was in `<title>`/`<img alt>`, not body text) a name mismatch. Fix: removed
the `<noscript>` gate entirely so the explanatory content is visible by DEFAULT, for every client,
regardless of when a crawler renders; React still clears it on mount, so real users only see a
briefer flash of real content instead of a bare spinner (strict improvement, not a tradeoff).
Verified the rebuilt page renders identically post-hydration (`pnpm preview`, checked in-browser,
no console errors beyond an expected local-preview service-worker registration failure).
- **Resume here:** founder still needs to (1) re-submit the Google OAuth consent screen once this
  redeploys, and (2) supply a real postal address for `Impressum.tsx` (see the bracketed
  placeholders) — required for German legal compliance, separate from the Google issue.
- **Gates run clean:** `pnpm typecheck` · `pnpm lint:content` · `pnpm build` (prerender step
  confirmed writing `dist/privacy/index.html` with the new email baked in) · manual browser check of
  the rebuilt `index.html` via `pnpm preview`.
- **Artifacts:** `scripts/prerender-help.mjs` · `src/features/legal/PrivacyPolicy.tsx` ·
  `src/features/legal/TermsOfService.tsx` · `src/features/legal/Impressum.tsx` · `index.html` ·
  `.claude/launch.json` (new, `pnpm preview` config for local browser checks) ·
  `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session 216 archived off, corrected)
  · `docs/SESSION_PROMPT_LOG.md`.

**Session 217 (2026-08-16, branch `password-reset-flow`): learners can now reset a forgotten
password and signed-in learners can change (or, for Google-only accounts, set) one from Settings.**
Founder reported Settings has no "change password" option. Scoping it surfaced a bigger gap: the app
is fully password-based but had **no recovery path at all** — no `resetPasswordForEmail` call, no
"Passwort vergessen?" link, no set-password screen. A learner who forgot their password was
permanently locked out. Both gaps share one shared form, so both were built together.
- **`src/store/useAuthStore.ts`:** added `sendPasswordReset` (`resetPasswordForEmail`), `setPassword`
  (`updateUser({ password })`), a `passwordRecovery` flag set on the `PASSWORD_RECOVERY` auth event
  (the shape-independent recovery signal, works regardless of which of the three callback shapes the
  link arrives in), and an exported `hasPasswordIdentity(user)` helper (email-identity vs.
  Google-only), covered by `tests/authPassword.test.ts`.
- **`src/features/auth/NewPasswordForm.tsx` (new):** the one set-password form, shared by both entry
  points below.
- **`ConfirmEmail.tsx`** (`/auth/confirm`, already outside every route guard): a `type=recovery` link
  now renders the set-password form in place, instead of the old behaviour of dropping the learner
  into the app with a live recovery session and nowhere to set a password.
- **`AccountPanel.tsx`** (Settings → Konto & Cloud-Sync): new row, "Passwort ändern" for an
  email-identity account or "Passwort festlegen" for a Google-only one; inline progressive
  disclosure, matching Settings' existing row pattern (no dialogs anywhere in that page).
- **`AuthDialog.tsx`:** "Passwort vergessen?" link on the login tab, reusing the existing "check your
  inbox" panel shape with reset-specific, deliberately neutral copy ("Wenn es ein Konto mit dieser
  Adresse gibt, ist ein Link unterwegs.") — Supabase answers a known and an unknown address
  identically on purpose, so the UI must never confirm which.
- **Also fixed:** `SaveProgressBanner.tsx`'s stale "Kein Passwort nötig." copy (a magic-link-era
  leftover, factually wrong in a password-only app).
- **`docs/reference/auth-emails/reset-password.html` + its README:** the reset link now spells out
  `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery` instead of `{{ .ConfirmationURL }}`,
  so `type=recovery` always survives in the URL (the app also falls back to the `PASSWORD_RECOVERY`
  event, so the flow works even before this template is pasted into Supabase).
- **Gates run clean:** `pnpm typecheck` · `pnpm lint` (0 errors, only pre-existing warnings) ·
  `pnpm test:unit` (740 passed, incl. the new file) · `pnpm build` · `pnpm check:bundle`. Not
  exercised live (needs a real Supabase SMTP round-trip): a founder click-through of both flows on
  `genauly.de` after deploy is the real verification.
- **Resume here:** nothing outstanding once this merges beyond the founder's own verification pass
  (see "Open founder action items" below) and the still-unfixed session-215 bug list, unrelated to
  this change and carried forward below.
- **Artifacts:** `src/store/useAuthStore.ts` · `src/features/auth/NewPasswordForm.tsx` (new) ·
  `src/features/auth/ConfirmEmail.tsx` · `src/features/auth/AccountPanel.tsx` ·
  `src/features/auth/AuthDialog.tsx` · `src/features/auth/SaveProgressBanner.tsx` ·
  `src/lib/uiStrings.ts` · `docs/reference/auth-emails/reset-password.html` + `README.md` ·
  `tests/authPassword.test.ts` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session 215 archived off) ·
  `docs/SESSION_PROMPT_LOG.md`.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the five-slot nav
(Bibliothek · **Prüfung** · Fortschritt · Spielplatz, named Praktisch until s210 · Einstellungen,
s182: Schreiben moved into the Prüfung hub),
the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks — every number below is `pnpm lint:content` output measured on 2026-08-08 (s203).
Re-measure before quoting; do not carry these forward.** vocab **1,768** (**1,758 browsable**; 8
mis-filed noun+verb combos retired in s142 + 2 true duplicates retired in s178, ids kept; the mix is
**77.3 % noun / 13.7 % verb / 6.1 % adjective**) · collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **32 topics / 320 drills** (18 groups; 110 productive, i.e. no options) ·
Lese-/Hörtexte **52** (156 checks) ·
writing tasks **717**, every one servable (s181), in 40 theme×length pools ·
Can-Do **57** · Sprech-Szenarien **36** (214 nodes, 394 options; level mix 13 / 15 / 8; every
scenario ends in a free-speak turn since s182) · exam sets **21** (the 6 above the entry rung came in
s194) · missions **6** (35 scenes, 11 NPCs, 7 key items) ·
provenance **3,604 rows** (four concatenated parts since s182, TS2590; append to the LAST) ·
themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121); four of them carry themes,
`pruefung` carries none and never has. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,591 of 3,604 provenance rows are AI-drafted `draft`**; only **13** are
human-verified (13 vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset to restart the
review pass; see `strategy/DATA_GOVERNANCE.md`). The full picture of what the banks do and do not
cover is `docs/reports/CONTENT_AUDIT_2026-07-30.md` (session 178), whose backlog is **closed
except P10** since s198. The writing bank has its own quality audit since s199,
`docs/reports/writing-tasks-audit-2026-08-07.md`: the tasks read well, but a third of the Branche
tags were unearned and the Niveau tag scaled the word target without scaling the task. **P1, P2, P3
and P5 are shipped (s199, s200); P4 is marked WRONG in the report** and replaced by an optional
reply-task wave.

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`, and the ones that were ticked off
in this list live in `docs/archive/PROJECT_STATUS_ARCHIVE.md` with their dates. The s147 Satzlabor
redeploy is done (s150: all three AI functions deployed on the Gemini-primary cascade,
`GEMINI_API_KEY` set). Still open:
- [x] **Resend SMTP is live** (s215): `genauly.de` verified in Resend, custom SMTP enabled in
      Supabase, confirmation emails send from `hello@genauly.de`. Remaining from
      `docs/reference/auth-emails/README.md`: paste the two branded templates (step 2) and raise
      Supabase's "Emails per hour" rate limit now that a real sender is configured.
      `reset-password.html`'s link shape changed in session 217 (s217); paste the current version.
- [ ] **Verify the session 217 password-reset/change flow live** on `genauly.de` once deployed: an
      "Anmelden" → "Passwort vergessen?" round-trip with a real email address, a Settings →
      "Passwort ändern" round-trip while signed in, and (if a Google account exists) "Passwort
      festlegen" from a Google-only sign-in.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — needs re-submitting (s219, round 2).** Round 1
      failed because `genauly.de` was completely offline (session 216 made the repo private, which
      silently disabled GitHub Pages) and `/privacy` 404'd even once the site came back (the SPA's
      GitHub Pages redirect trick returns a real 404 status to non-JS crawlers) — both fixed. Round 2
      came back with a NEW list (home page behind a login, doesn't explain its purpose, app name
      mismatch), root-caused to `index.html` hiding its crawler-facing static content behind a
      `<noscript>` gate, so a JS-enabled crawler that snapshots before the ~1.5 MB JS bundle
      hydrates saw a bare spinner. Fixed by making that content visible by default for every client
      (s219). Founder still needs to re-submit via Google Cloud Console → OAuth consent screen →
      "I have fixed the issues." **Do NOT re-click that button more than once per fix** — Google's
      async re-review takes hours to days; wait for their email before re-submitting again.

## Resume here (next session)

**Handoff after session 215 (2026-08-16): Resend SMTP is live for auth emails, but signing up
surfaced five auth/onboarding bugs that need fixing.** No branch, dashboard-only session (Namecheap
DNS + Private Email, Resend domain/API key, Supabase SMTP settings); nothing to merge.
Founder walked through `docs/reference/auth-emails/README.md` step 1 live, then tested a real
signup: "document these comments for now to address them in the next session."

- **Priority for next session — five bugs found testing the new SMTP live, all in the sign-up →
  confirm → onboarding path, none fixed yet:**
  1. Clicking the confirmation email link does not sign the learner in automatically; they're asked
     to log in again. Start at `/auth/confirm` (`src/features/auth/ConfirmEmail.tsx`) and the
     `emailRedirectTo`/session-completion logic in `src/store/useAuthStore.ts` — per the README this
     link is supposed to complete sign-in on its own.
  2. After that manual login, the app dropped back to the LANDING page instead of into the app,
     needing a second login to actually get in. This is the more serious of the three (a real
     new-signup drop-off risk) — trace the redirect target through the whole confirm→login handoff
     rather than patching the symptom.
  3. Onboarding's "Wofür lernst du Deutsch?" screen re-shows the AGB/Datenschutz consent checkbox
     (pre-checked) even though it was already ticked once at signup. Cosmetic but redundant; find
     where onboarding re-renders that checkbox and drop it if consent is already recorded.
  4. **The ORIGINAL tab (where signup was started) hard-crashes to the "Kurz nicht erreichbar"
     fatal-error screen** once the confirmation link is clicked in a NEW tab (email links open in a
     new tab by default). This is `RootErrorBoundary`'s fallback (`src/main.tsx:164`) or the even
     earlier `paintFatal()` module-eval crash net (`src/main.tsx:43`) — founder did not capture the
     "Technische Details" text, so next session should reproduce this first (open signup, click the
     confirm link in a separate tab, watch the original tab) to get the real error/stack before
     guessing a fix. Prime suspects given what's nearby: a stale-session/auth-state conflict between
     tabs, or the service-worker update-reload (`src/lib/swUpdate.ts`) firing on the original tab
     mid-flow.
  5. **A freshly confirmed account skips onboarding entirely and lands straight on the Spielplatz
     dashboard**, never asking "Wofür lernst du Deutsch?" (Beruf/Alltag/Prüfung/Beides) or the
     Niveau question. The `RequireOnboarding` gate (see s212, `/library`'s cold-open redirect logic
     in `src/lib/appEntry.ts`) is supposed to route a not-yet-onboarded learner to `/welcome`
     first — something in the confirm-link → new-tab → session-established path is setting or
     reading `onboarded` as already true, or bypassing the gate outright. Given bugs 1/2 above are
     also in this exact handoff, likely the same root cause: whatever completes the session on the
     confirm link is not going through the normal sign-in path that the onboarding gate expects.
     Worth checking together with bug 3 (the onboarding screen that DOES still show the AGB
     checkbox in other paths) once the real flow is traced.
- **Resend SMTP setup itself worked and is confirmed live:** signup mail now arrives from
  `Genauly <hello@genauly.de>` with no Supabase branding. The one gotcha worth remembering: Resend
  domain verification has to actually finish (watch for "Not started" → "Verified" in Resend →
  Domains) before Supabase's SMTP send will succeed — the first live test failed with "Error sending
  confirmation email" purely because of that timing, not a config mistake.
  Also worth remembering for future Namecheap DNS work: an MX record option is HIDDEN from Advanced
  DNS's "Add Record" Type dropdown until "Mail Settings" (near the top of the same page) is switched
  to **Custom MX** first.
- **Still open from the README:** paste the two branded templates
  (`docs/reference/auth-emails/confirm-signup.html`, `reset-password.html`) into Supabase →
  Authentication → Emails, and raise Supabase's "Emails per hour" rate limit.
- **Still open, unchanged:** the next content job is the reply-task wave (writing-audit P4), 47
  authored `source` texts plus a rendering slot that does not exist yet, waiting on a founder
  placement pick from `preview/schreiben-source-text.html`.
