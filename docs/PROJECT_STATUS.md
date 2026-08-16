# Project Status

_Last updated: 2026-08-17 (session 222, branch `writing-reply-source-texts`: shipped the reply-task
`source` wave, 47 tasks, closing the writing-audit P4 replacement that s200 called out as the honest
target. Session 221, branch `rls-migration-gate`: `lint:migrations` is now the access-control gate
too, after evaluating an external security skill and importing only the one rule it had that we
lacked. Session 220, branch `fix-signup-onboarding-bugs`: fixed all five sign-up → confirm →
onboarding bugs found in session 215's live SMTP test.
Sessions 209-219 are archived in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`,
sessions 204-208 in the `W32` file beside it. All handoffs under their own "Resume here")._

**Session 222 (2026-08-17, branch `writing-reply-source-texts`): shipped the reply-task `source`
wave — all 47 "Antworten Sie" tasks now carry the text the learner is replying to.** Founder asked
why their real B2 für Beruf exam gave only a topic + Leitpunkte, no source text, contradicting the
app's `preview/schreiben-source-text.html` framing; the answer was already on record (s200): a
source text belongs to the REPLY genre only (telc's "Antworten Sie" shape), never to a
Stellungnahme/Forumsbeitrag, and the founder's own exam was correctly the latter. Founder then
picked **variant A** ("text first, then the task") from that existing preview.
- **UI wiring** (`GuidedWritingTrainer.tsx`, `SchreibenPart.tsx`): a Himmelblau "Text zur Aufgabe"
  tile, no visible edge (matches the Aufgabe-rail fill language), renders BEFORE the prompt whenever
  a task carries a `source` — in the resting card, the expand-button pop-up, and the Modelltest's
  Schreiben Teil, from one shared `taskSource` block per surface so it can't drift. `evaluate-writing`
  now accepts `source`, bounds it (800 chars) same as every other learner-adjacent field, and feeds
  it into the grading prompt ahead of the Aufgabe so Aufgabenerfüllung can check the reply against
  what was actually said, not a paraphrase.
- **Content:** authored 47 short (2-4 sentence) German source texts, one per reply-shaped task
  across `customer`, `conflict`, `technology`, `behoerde`, `wohnen` and `freizeit`, each voiced as
  the task's own `addressee` and stating something concrete the existing Leitpunkte already answer
  (an order number, a missed appointment, a rejected claim). No new content ids and no new
  provenance rows needed: `source` is a field on an EXISTING task, and the whole theme pool already
  rides one `wp_<themeId>` provenance row (`docs/areas/CONTENT.md`) — verified all six rows already
  existed before touching the bank.
- **Gates run clean:** `pnpm lint:content` (0 errors, 14 pre-existing unrelated warnings) ·
  `pnpm typecheck` · `pnpm lint` (0 errors) · `pnpm build` · `pnpm check:bundle` ·
  `pnpm test:unit` (745 passed, unchanged — no test names `source`, none needed updating).
  Verified live in a real browser via `pnpm preview`: onboarded as guest, filtered Kurz to
  "Kundenkommunikation", and the first two draws (`wt_customer_s16`, `wt_customer_s02`) both
  rendered the tile exactly per the approved preview, at desktop AND mobile (375px) width.
- **Artifacts:** `src/data/writingPrompts.ts` · `src/features/writing/GuidedWritingTrainer.tsx` ·
  `src/features/exam/SchreibenPart.tsx` · `src/lib/writing.ts` ·
  `supabase/functions/evaluate-writing/index.ts` · `docs/areas/CONTENT.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.

**Session 221 (2026-08-17, branch `rls-migration-gate`): evaluated the external `vibe-security`
skill (github.com/raroque/vibe-security-skill, MIT) and declined the import; took its one real
finding as a CI gate instead.** Most of that skill is stack-mismatched (Expo, Firebase, Convex,
Stripe, Next.js) or already law here (AI keys server-side + per-user caps + `ai_calls` metering,
`.env` ignored, no `service_role` in `src/`, three legitimately-public `VITE_` vars), and it
duplicates the built-in `/security-review`. The gap it did name was RLS, so `lint:migrations` now
also fails a `create table` in `public` with no `enable row level security` in the same file, and a
policy `for insert`/`for update`/`for all` with no `with check` (owner-column reassignment). Probed
with a throwaway migration: both fire, `private.*` tables and `for select` correctly don't. The 21
existing migrations pass unchanged; the one `using (true)` (`app_config` select, 0008) is the
intentional public remote config. → `docs/areas/COMMANDS.md`.

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
and P5 are shipped (s199, s200); P4 is marked WRONG in the report** and replaced by the reply-task
`source` wave, shipped s222.

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

**Handoff after session 222 (2026-08-17, branch `writing-reply-source-texts`): the reply-task
`source` wave is shipped and merged — no founder action needed on it.** The writing-audit P4
replacement (47 "Antworten Sie" tasks, each now carrying a source text rendered before the prompt)
is done; nothing pending here.
- **Still open from session 220:** a founder click-through of a fresh sign-up → confirm (ideally in
  a different browser, the case the old email template couldn't handle) → onboarding on
  `genauly.de`. That's the only way to prove session 215's reports #1/#2/#5 against the real
  Supabase/Resend round-trip; unit tests and a local `pnpm preview` check covered as much as they
  can without one.
- Resend SMTP gotcha, still worth remembering: domain verification has to actually finish (watch for
  "Not started" → "Verified" in Resend → Domains) before Supabase's SMTP send will succeed. And for
  future Namecheap DNS work: an MX record option is HIDDEN from Advanced DNS's "Add Record" Type
  dropdown until "Mail Settings" (near the top of the same page) is switched to **Custom MX** first.
- **Still open from session 219:** a real postal address for `Impressum.tsx` (the bracketed
  placeholders) — required for German legal compliance. And the Google OAuth consent-screen review
  is still pending (see "Open founder action items" above); do not re-submit again without a Google
  email prompting it.
