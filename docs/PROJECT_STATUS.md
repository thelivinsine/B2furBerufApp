# Project Status

_Last updated: 2026-08-16 (session 215 set up the Resend custom-SMTP sender for auth emails, on the
founder's own dashboards, and testing it live surfaced three auth/onboarding bugs to fix next
session. Session 214 fixed a Windows-only build break from case-colliding graph filenames and
pinned pnpm back to the project's v10, on the founder's local machine.
Sessions 209-213 are archived in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`,
sessions 204-208 in the `W32` file beside it. All handoffs under their own "Resume here")._

**Session 215 (2026-08-16, no branch — dashboard-only work on Resend + Namecheap + Supabase): auth
emails now send from `hello@genauly.de` via Resend instead of Supabase's rate-limited built-in
sender.** Founder walked through `docs/reference/auth-emails/README.md` step 1 live, guided prompt
by prompt; no code changed.
- **Namecheap DNS:** added Resend's DKIM/SPF/return-path records under Advanced DNS, plus an MX
  record on host `send` (needed "Mail Settings" switched to **Custom MX** first before Namecheap's
  Advanced DNS "Add Record" Type dropdown even offered "MX Record" — not obvious from the UI).
  Founder also set up Namecheap Private Email (`hello@genauly.de` mailbox) on the already-purchased
  plan; confirmed no conflict since Private Email's MX lands on `@` and Resend's is on `send`.
- **Resend:** domain `genauly.de` verified (after DNS propagated — first check showed "Not started",
  resolved by re-running Verify once records had propagated). Created a **Sending**-scope API key
  (not Full access — least privilege, SMTP send is all this needs).
- **Supabase → Authentication → SMTP Settings:** Custom SMTP enabled with `smtp.resend.com:465`,
  username `resend`, password = the Resend API key, sender `hello@genauly.de` / `Genauly`. First
  live test failed with "Error sending confirmation email" because the Resend domain wasn't verified
  yet; retried after verification and it worked. **Confirmed live:** the confirmation email now
  arrives from `Genauly <hello@genauly.de>` with no Supabase branding.
- **Three bugs surfaced by that live test, NOT yet fixed (next session):**
  1. Clicking the email confirmation link asks the learner to log in again instead of completing
     sign-in automatically — `/auth/confirm` (`src/features/auth/ConfirmEmail.tsx`) should be
     completing the session from the link per the README's "What the app does with the link"
     section; needs checking why it isn't.
  2. After that manual login, the app dropped back to the landing page instead of entering the app,
     requiring a SECOND login to actually get in. Likely a race or a lost redirect target somewhere
     in the `/auth/confirm` → app-entry handoff; needs root-cause, not a retry-loop patch.
  3. Onboarding ("Wofür lernst du Deutsch?" screen) re-shows the AGB/Datenschutz consent checkbox
     (pre-checked) even though the learner already ticked and submitted it once at signup —
     redundant, should not ask twice.
  Founder asked to document these for next session rather than fix now.
- **Still open from the README:** step 2 (paste the branded `confirm-signup.html` /
  `reset-password.html` templates into Supabase → Authentication → Emails) and raising Supabase's
  "Emails per hour" rate limit now that a real sender is configured.
- **Artifacts:** Namecheap Advanced DNS (`genauly.de`) · Namecheap Private Email (`hello@genauly.de`
  mailbox) · Resend (domain + API key) · Supabase Auth SMTP Settings · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session 213 archived off) ·
  `docs/SESSION_PROMPT_LOG.md`.

**Session 214 (2026-08-16, branch `fix/windows-case-collision-graph-helpers`): the repo now builds
on the founder's Windows laptop.** No app behavior changed; this was local tooling + a
build-portability fix. Ran concurrently with session 213 (PR #859) in the same working tree, which
caused some branch/stash churn, all recovered.
- **pnpm pin restored.** The founder's machine has pnpm 11 installed globally and corepack was
  defaulting to it, so every `pnpm` run rewrote `packageManager` from `pnpm@10.33.0` to v11, and
  pnpm 11 then ignored the `pnpm.overrides` `react-router` pin and risked the `.npmrc` supply-chain
  guardrails. Reverted the file and ran `corepack install` so the project folder resolves to pinned
  v10 while the global v11 is untouched elsewhere. Upgrading to v11 is deferred: it needs a
  deliberate migration of `overrides` + guardrail settings to `pnpm-workspace.yaml`, its own tested
  PR. `pnpm install` and `pnpm build` then ran clean on v10.
- **Windows case-collision fix (the branch's actual change).** `tsc -b` failed on Windows because
  `WordGraph.tsx`/`wordGraph.ts` and `CollocationGraph.tsx`/`collocationGraph.ts` differ only by
  case. Case-sensitive Linux (CI, deploy) builds them fine, so the live site was never affected;
  Windows' case-insensitive FS makes the imports ambiguous. Renamed the two lowercase helper files
  to `wordGraphModel.ts` and `collocationGraphModel.ts` and updated the 5 importing lines (2
  components, 2 tests) plus 3 stale filename comments (incl. the `normalizeForm` mirror note in
  `scripts/lint-content.mjs`). No content ids touched, so the id-permanence law does not apply.
  After clearing a stale `node_modules/.vite` cache, `pnpm build` passes on Windows; graph unit
  tests pass. (`writingAufgabe.test.tsx` timed out once at the default 5s on the cold, loaded
  machine and passed cleanly at 30s, a timing flake, not a regression.)
- **Resume here:** nothing outstanding once this merges. The win is local: Windows builds now work;
  nothing to verify on the live site since the build was never broken there.

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
surfaced four auth/onboarding bugs that need fixing.** No branch, dashboard-only session (Namecheap
DNS + Private Email, Resend domain/API key, Supabase SMTP settings); nothing to merge.
Founder walked through `docs/reference/auth-emails/README.md` step 1 live, then tested a real
signup: "document these comments for now to address them in the next session."

- **Priority for next session — four bugs found testing the new SMTP live, all in the sign-up →
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
