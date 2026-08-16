# Project Status

_Last updated: 2026-08-16 (session 220, branch `fix-signup-onboarding-bugs`: fixed all five sign-up
→ confirm → onboarding bugs found in session 215's live SMTP test. Session 219, no branch: found
`genauly.de` fully offline — GitHub Pages had silently disabled itself when session 216 made the repo
private (Free-plan Pages needs a public repo) — made the repo public again, re-enabled Pages, and
prerendered a real `/privacy` page so Google's OAuth consent-screen crawler (which doesn't run JS)
gets a 200 instead of the SPA's 404-redirect trick.
Sessions 209-217 are archived in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`,
sessions 204-208 in the `W32` file beside it. All handoffs under their own "Resume here")._

**Session 220 (2026-08-16, branch `fix-signup-onboarding-bugs`): fixed all five sign-up/onboarding
bugs found in session 215's live SMTP test (none had been fixed yet).** Tracing found three actual
root causes, not five independent bugs:
- **The confirmation email used a PKCE `?code=` link** (Supabase's default `{{ .ConfirmationURL }}`),
  which only exchanges for a session in the SAME BROWSER that started signup (the exchange needs a
  verifier that browser wrote to its own localStorage) — opening the link on a different device
  confirmed the account server-side but never signed the learner in. Fixed by switching
  `confirm-signup.html` to the same `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup` shape
  `reset-password.html` already used, which needs nothing from the originating browser
  (`verifyOtp()`). **Founder still needs to paste the updated template into Supabase → Authentication
  → Emails → Confirm signup for this fix to take effect** (`docs/reference/auth-emails/`).
  `ConfirmEmail.tsx` also now tells the learner "you're confirmed, please log in" instead of "link
  invalid" for the case where the old template is still live and a session didn't result.
- **`useAuthStore.init()` had two writers for auth `status`** (`getSession()` and
  `onAuthStateChange`, unguarded against staleness), so a late `getSession()` resolution could
  overwrite a live `SIGNED_IN` (from a just-redeemed confirmation link) with `signedOut` —
  `RequireOnboarding` (`router.tsx`) treated that as a resolved, genuine "not signed in" and bounced
  the learner to `/welcome`, the marketing page, needing a second manual login. Fixed by deleting the
  `getSession()` writer entirely: `onAuthStateChange` already fires `INITIAL_SESSION` with the same
  data on subscribe (verified against `@supabase/auth-js`'s source), so there is now exactly one
  writer and the race is gone, not just guarded. `ConfirmEmail.tsx` also now lands on `/library`
  (matching every other entry point) instead of `/`, which used to route through the Dashboard.
- **A device's local `onboarded: true` (from prior guest/offline use) was inherited by a brand-new
  account.** `startCloudSync`'s shared-device wipe only fires for a genuinely DIFFERENT previous
  account; a device that had never synced any account kept its local flag, so a fresh sign-up skipped
  onboarding entirely and landed on the dashboard. Founder decision: the cloud is always the
  authority on whether an account has onboarded. `mergeRemoteSettings` now takes
  `firstSyncOnDevice` and resets a locally-true flag when the cloud disagrees and this device has
  never synced before — the s174 fix (a returning account never loses `onboarded` to a momentarily
  stale cloud pull) is unaffected and has a regression test.
- **Two smaller, separately-caused bugs bundled in the same report:** the AGB/Datenschutz consent
  checkbox in `Onboarding.tsx` re-rendered (pre-checked) even when already recorded at signup — now
  hidden once `hasConsented()` is true at mount. And an uncaught `startCloudSync` rejection —
  triggerable by a DIFFERENT tab, since supabase-js broadcasts auth events across tabs on the same
  storage key — hit `main.tsx`'s hair-trigger global error handler, which treated ANY unhandled
  rejection anywhere in a session's lifetime as a fatal bootstrap failure and destructively wiped a
  perfectly working tab's DOM, with no logging anywhere. Founder decision: fix the cause and narrow
  the trigger. `startCloudSync` calls are now caught; its destructive local-wipe prefix moved inside
  a `try` (it was reaching zustand-persist's unguarded `localStorage.setItem`); `paintFatal` now logs
  to console + `sessionStorage`; and the global handlers only paint the destructive screen BEFORE the
  app has mounted (`RootErrorBoundary` + the router's `errorElement` are the right net once it has) —
  a stray post-mount error is logged, not fatal.
- **Gates run clean:** `pnpm typecheck` · `pnpm lint` (0 errors, only pre-existing warnings) ·
  `pnpm test:unit` (745 passed, incl. 2 new test cases in `cloudSync.test.ts`, 2 in
  `authCallback.test.ts`, and a new `onboarding.test.tsx`) · `pnpm build` · `pnpm check:bundle`.
  Verified live in a real browser via `pnpm preview`: a stray `Promise.reject` fired from the console
  after mount left the UI fully alive and stashed the error in `sessionStorage`; walked the onboarding
  flow through localStorage state changes and confirmed the checkbox disappears (submit stays
  enabled) once consent is already on record, and that completing onboarding lands on `/library`.
- **Resume here:** paste the updated `confirm-signup.html` into Supabase (see above) — without that,
  report #1 (link only works in the originating browser) is only half-fixed; the `ConfirmEmail.tsx`
  fallback copy is the safety net until then. Then a founder click-through of the full sign-up →
  confirm (in a DIFFERENT browser) → onboarding path on `genauly.de` is the real verification of
  reports #1/#2/#5; opening the confirm link in a new tab while watching the original tab verifies
  report #4 no longer crashes it.
- **Artifacts:** `docs/reference/auth-emails/confirm-signup.html` ·
  `docs/reference/auth-emails/reset-password.html` · `docs/reference/auth-emails/README.md` ·
  `src/lib/authCallback.ts` · `src/features/auth/ConfirmEmail.tsx` · `src/store/useAuthStore.ts` ·
  `src/lib/cloudSync.ts` · `src/features/onboarding/Onboarding.tsx` · `src/main.tsx` ·
  `tests/authCallback.test.ts` · `tests/cloudSync.test.ts` · `tests/onboarding.test.tsx` (new) ·
  `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session 217 archived off) ·
  `docs/SESSION_PROMPT_LOG.md`.

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
      Supabase, confirmation emails send from `hello@genauly.de`.
- [x] **Session 217's password-reset/change flow confirmed working live** by the founder (s220).
- [x] **Both updated email templates pasted into Supabase → Authentication → Emails** (s220): the
      `token_hash` link shape (s217 for reset, s220 for confirm-signup) is now live, so a confirmation
      link works from any browser/device, not only the one that signed up (closes session 215's bug
      #1 for real, not just `ConfirmEmail.tsx`'s fallback message). Still open: raise Supabase's
      "Emails per hour" rate limit now that a real sender is configured.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting Google's async re-review (s219, submitted
      round 3).** Round 1 failed because `genauly.de` was completely offline (session 216 made the
      repo private, which silently disabled GitHub Pages) and `/privacy` 404'd even once the site
      came back (the SPA's GitHub Pages redirect trick returns a real 404 status to non-JS
      crawlers) — both fixed. Round 2 came back with a NEW list (home page behind a login, doesn't
      explain its purpose, app name mismatch), root-caused to `index.html` hiding its crawler-facing
      static content behind a `<noscript>` gate, so a JS-enabled crawler that snapshots before the
      ~1.5 MB JS bundle hydrates saw a bare spinner. Fixed by making that content visible by default
      for every client. Founder clicked "I have fixed the issues" → Proceed for round 3, but the
      dialog immediately re-showed round 2's list: **this is expected, not a new failure** —
      Proceed only submits the request, it does not run a live check inline, so the dialog shown
      right after still reflects the last COMPLETED review until Google's Trust and Safety team
      actually re-processes it (their own docs say hours to days). Confirmed independently that the
      live page is correct (spoofed-Googlebot-UA curl, byte-identical to normal fetch, no
      `robots.txt`/meta-robots block, fresh non-cached response). **Founder decided (s219) to keep
      waiting on Google's review rather than drop Google Sign-In** — that was offered as an
      alternative (email/password + guest already work with zero Google dependency) but declined for
      now. **Do NOT re-click "I have fixed the issues" again** until an email arrives from Google, or
      use Search Console's URL Inspection → "Test Live URL" for an independent look at what
      Googlebot's renderer actually sees without waiting on the OAuth review queue.

## Resume here (next session)

**Handoff after session 220 (2026-08-16, branch `fix-signup-onboarding-bugs`): all five session-215
sign-up/onboarding bugs are fixed and merged, and the founder has pasted both updated email templates
into Supabase (full detail in the session 220 log entry above).**
- **Real verification still needed:** a founder click-through of a fresh sign-up → confirm (ideally
  in a different browser, the case the old template couldn't handle) → onboarding on `genauly.de`.
  That's the only way to prove reports #1/#2/#5 against the real Supabase/Resend round-trip; unit
  tests and a local `pnpm preview` check covered as much as they can without one.
- Resend SMTP gotcha, still worth remembering: domain verification has to actually finish (watch for
  "Not started" → "Verified" in Resend → Domains) before Supabase's SMTP send will succeed. And for
  future Namecheap DNS work: an MX record option is HIDDEN from Advanced DNS's "Add Record" Type
  dropdown until "Mail Settings" (near the top of the same page) is switched to **Custom MX** first.
- **Still open, unchanged:** the next content job is the reply-task wave (writing-audit P4), 47
  authored `source` texts plus a rendering slot that does not exist yet, waiting on a founder
  placement pick from `preview/schreiben-source-text.html`.
