# Project Status

_Last updated: 2026-08-16 (session 217, branch `password-reset-flow`: built password reset + change,
a gap found while scoping a founder request about the Settings page. Session 216 made the GitHub
repo private, dashboard-only, no code changed.
Sessions 209-215 are archived in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`,
sessions 204-208 in the `W32` file beside it. All handoffs under their own "Resume here")._

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

**Session 216 (2026-08-16, no branch — GitHub repo settings only): the repo is now private.**
Founder asked whether flipping visibility carried any risk. Checked git history for committed
secrets (none: no `.env`/`.env.local` ever committed, Supabase credentials live only in GitHub
Actions secrets) and confirmed GitHub Pages still publishes from a private repo on any plan
(stopped being Pro-only in 2021), so `genauly.de` is unaffected. Founder flipped visibility to
private via GitHub Settings themselves. No code changed; nothing to merge.
- **Resume here:** nothing outstanding from this session. Next session should pick up the five
  auth/onboarding bugs from session 215's handoff below, still unfixed.

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
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

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
