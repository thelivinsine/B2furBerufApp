# Session & Prompt Log — Archive 2026-W31 (2026-07-27 to 2026-08-02)

_Weekly archive slice of the append-only prompt log (ISO week 2026-W31). The maintenance rule and
entry template live in the live log `docs/SESSION_PROMPT_LOG.md`; the index of weekly files is
`docs/archive/prompt-log/README.md`. Left as written (append-only history)._

## Session 173 (2026-07-27) — branch `claude/app-refresh-data-loss-01xd0e`

- **Prompt 1 (verbatim, 2026-07-27):** `there's a frustrating bug in the app. Wheneevr the user is
  working on something like writing an email or practicing an ubung session, the updates takes place
  and the app refreshes! due to that the uben session progress or the writing draft is lost!!!!!!
  This should be fixed asap!!` → Traced it to the ONLY automatic reload in the app,
  `src/lib/swUpdate.ts`. With `registerType: "autoUpdate"` a new service worker takes control shortly
  after a deploy, and the watcher then reloaded unconditionally: immediately if within 30s of load,
  otherwise **at the next `visibilitychange` back to visible**, i.e. precisely when a learner returns
  to the app from checking something else, mid-draft. Fixed in two layers.
  - **Layer 1 (the actual bug): never reload over live work.** New `src/lib/liveWork.ts` holds a
    module-level claim registry (module state, not a store, because the reloaders run outside React)
    plus a `useLiveWork(active, label, flush)` hook. `hasLiveWork()` now gates both reload paths in
    `swUpdate.ts`; an update that cannot be applied stays queued and retries on each later resume,
    with the app running fine on the old bundle meanwhile. Claimed today by the Fokus / Kurz / Lang
    editors (non-empty text) and by a running Üben run.
  - **Layer 2: make an unavoidable reload recoverable.** The chunk-load self-heal
    (`lib/recover.ts`), a manual refresh, and iOS discarding a backgrounded tab all still reload, so:
    `src/features/writing/draftAutosave.ts` (localStorage, one draft per mode, 7-day TTL, debounced
    500ms + on unmount/pagehide, restores with the Aufgabe it was written against, deliberately a
    separate key from the `resumeDraft.ts` sign-in hand-off so it can never fire that redirect) and
    `src/features/session/sessionResume.ts` (sessionStorage keyed by a launch-param signature, 3h
    TTL; survives a tab reload, dies with the tab, so tomorrow's Üben press always composes fresh).
    The session snapshot points at the next **unanswered** block, since an answered one is already
    graded into FSRS/XP; it is cleared on finish, "Beenden" and "Neue Runde", each setting an
    `abandoned` ref first so the unmount flush cannot write it straight back.
    `installLiveWorkFlush()` in `main.tsx` flushes every claim on pagehide / beforeunload / hidden.
  - **Verification:** `tests/liveWork.test.ts` adds 18 cases (registry claim/release/flush incl. a
    throwing handler, per-mode draft isolation, blank + stale + corrupt storage, snapshot signature
    mismatch, out-of-range index, TTL). Gates: typecheck clean · lint 0 errors (77 warning lines vs
    78 on the untouched tree, so no new warnings) · test:unit **345/345** · build · check:bundle
    119.1 kB. Service-worker update behavior itself is not testable from the sandbox; the founder
    verifies on the live site.
  - **Shipped under the standing auto-ship approval** (the founder called the bug "asap" and a
    feature-branch push does not touch the live site): commit `fbd4ba1`, **PR #740** into `main`,
    squash-merged as `805fff0` once CI `lint-content` came back green, then the required post-merge
    housekeeping (`git fetch origin main` → `git reset --hard origin/main` →
    `git push --force-with-lease`), tree clean.
  - **One design choice worth recording:** no "a new version is available, reload?" banner. The
    complaint was interruption; a prompt is a second interruption. Deferring the update to the next
    safe resume ships the same deploy without asking the learner for anything.
- **Artifacts (prompt 1):** `src/lib/liveWork.ts` (new) · `src/features/writing/draftAutosave.ts`
  (new) · `src/features/session/sessionResume.ts` (new) · `tests/liveWork.test.ts` (new) ·
  `src/lib/swUpdate.ts` · `src/lib/recover.ts` · `src/main.tsx` ·
  `src/features/session/SessionPlayer.tsx` · `src/features/writing/GuidedWritingTrainer.tsx` ·
  `src/features/writing/fokus/FokusTrainer.tsx` · `CLAUDE.md` · `docs/areas/SESSION.md` ·
  `docs/areas/SCHREIBEN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · this log · commit `fbd4ba1` · PR #740 (`805fff0`)
- **Prompt 2 (verbatim, 2026-07-27):** `document the session?` → The area docs, the CLAUDE.md
  invariant and the s173 handoff had already shipped inside PR #740, but they were written **before**
  the merge, so they recorded no PR number and no outcome. Closed that gap: the status header and the
  s173 handoff now carry "Merged (PR #740, `805fff0`)" and the branch name; the handoff gained the
  hard-refresh caveat (a stale service worker can serve the pre-fix build for one launch), a
  "worth knowing for the next reload-ish change" note (claiming and persisting are each necessary,
  neither is sufficient alone) and the deliberate no-update-banner decision; and the prompt-1 entry
  above gained its ship record. No code changed.
- **Artifacts (prompt 2):** `docs/PROJECT_STATUS.md` · this log

## Session 174 — 2026-07-27 — branch `claude/app-security-audit-giuaqy`

- **Prompt 1 (verbatim, 2026-07-27):** `do a thorough and comprehensive security audit of the app`
- **Response summary:** Full-surface audit rather than a diff review: the browser bundle, all five
  Supabase Edge Functions, all twelve migrations (RLS policies, SECURITY DEFINER RPCs, grants), the
  five CI workflows, the build scripts, and the dependency tree. Report written to
  `docs/reports/security-audit-2026-07-27.md` (13 findings, plus a "checked and found clean" section
  so the next audit knows what has been ruled out).
  - **Clean:** RLS on every table with owner-only policies (`ai_usage`, `feedback`,
    `sentence_transforms`, `gdpr_events` have RLS on and NO policies, so service-role only); no
    `dangerouslySetInnerHTML` / `eval` / `new Function` anywhere in `src/`; the help prerenderer
    escapes every interpolation; CSP enforcing; no secrets committed (regex sweep for provider keys,
    JWTs, PEM blocks came back empty); `delete-account` takes the user id ONLY from the verified JWT;
    admin RPCs return aggregates with `assert_founder()` first and `revoke … from anon`; SW precaches
    static assets only; CI has no `pull_request_target`, minimal `permissions:`, SHA-pinned actions;
    build scripts shell out via `execFileSync`/`spawnSync` argument arrays; every `target="_blank"`
    carries `rel="noreferrer"`.
  - **Fixed in this pass (3).** F3: `genauly.writing.autosave` + `genauly.writing.resume` were in no
    teardown path, so on a shared device learner B opened Schreiben into learner A's text (7-day TTL,
    and these tasks are Beschwerden/Arzt-Mails/Anträge), and Art. 17 erasure left the learner's own
    words on disk. Added `clearAllAutosavedDrafts()`; called with `clearWritingDraft()` from
    `clearLocalAccountData()` (sign-out + deletion) and, autosave only, from the shared-device branch
    of `startCloudSync()` — the one-shot resume draft is deliberately kept there because that branch
    is ALSO the "hit the login wall, signed in" hand-off. F4: `submit-feedback` is unauthenticated by
    design and its per-IP burst guard reads the caller-supplied leftmost `x-forwarded-for`, so row
    insertion was unbounded (the inbox was already capped); the hourly count that gates email is now
    also a hard storage ceiling (`FEEDBACK_HOURLY_ROW_CAP`, default 300, one query serves both).
    Deliberately did NOT switch to the rightmost XFF entry: if a second proxy is ever added that
    collapses every visitor into one 5-per-10-min bucket. F5: the GDPR export omitted
    `sentence_checks` / `sentence_ai_ops`, i.e. every sentence written in Fokus.
  - **F1 (high, founder action, NOT applied).** `is_founder()` is
    `auth.jwt() ->> 'email' in (two Gmail addresses)` with no verified-email check, and
    `supabase/config.toml` carries `enable_confirmations = false`. If the hosted project matches,
    the existing guest-upgrade path (`updateUser({email})`, `useAuthStore.ts:121`) sets an address
    with no proof of ownership — so the whole admin boundary rests on both addresses already being
    registered. The report carries a drafted `admins(user_id)` migration; it is written but NOT
    applied, because a wrong seed locks the founder out of their own admin panel.
  - **F2 (high).** `pnpm audit` is no longer 0 as `SECURITY.md` claimed: 7 high + 3 moderate.
    react-router 6.x has an open-redirect→XSS advisory with **no fix in the 6.x line**. Verified the
    app is not reachable through it today (every dynamic `navigate()` / `to={}` builds its target
    from internal ids and constants, never from a query param, hash or API response), so this is a
    scheduling question, not an incident.
  - Documented-not-fixed: check-then-act AI rate limits (F6, bounded by the $5 monthly fuse),
    `*.github.io` CORS wildcard (F7), no clickjacking defence since `frame-ancestors` is ignored in a
    meta CSP (F8), `log_gdpr_event()` executable by `anon` (F9), the optional `checkId` gate
    contradicting migration 0009's comment (F10), no retention job on learner text (F11), missing
    `set search_path` on the two founder helpers (F12).
  - **Gates:** typecheck clean · lint 0 errors (75 warnings, unchanged from the untouched tree) ·
    test:unit **345/345** · build green · check:bundle 119.7 kB (budget 400).
  - No PR opened (none was asked for); pushed to the session branch.
- **Artifacts (prompt 1):** `docs/reports/security-audit-2026-07-27.md` (new) ·
  `src/features/writing/draftAutosave.ts` · `src/lib/cloudSync.ts` · `src/lib/dataExport.ts` ·
  `supabase/functions/submit-feedback/index.ts` · `docs/strategy/SECURITY.md` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` · this log
- **Prompt 2 (verbatim, 2026-07-27):** `1. what concrete action point do I have here?\n2.  You lost
  me - explain it in plain language?` → The audit was written for a reader who already knew the
  system; the founder is non-technical, so the report handed them a decision rather than a task.
  Fixed the substance, not just the wording: F1's remediation was "drafted, deliberately not applied
  because a wrong seed locks you out", which offloaded the risk onto the person least able to carry
  it. Made it safe to apply instead, so the highest finding became ONE copy-paste.
  - **`supabase/migrations/0013_admins_table.sql` (new).** Creates `public.admins` (RLS on, NO client
    policies, so not even an admin can grant admin from the browser); seeds it from the accounts
    holding the two founder addresses TODAY, reading `auth.users` server-side (the one moment the
    email is still trustworthy); a `do $$ … if v_n = 0 then raise exception` guard that REFUSES to
    swap the gate when the seed matched nobody, so a wrong address gives a readable error instead of
    an admin panel that admits no one; then replaces the `is_founder()` body with
    `exists (select 1 from public.admins where user_id = auth.uid())`. SECURITY DEFINER (the table
    has no policies) with `set search_path = pg_catalog, public`, which also closes F12. Every policy
    and RPC already routes through that one function, so all of them re-point at once; the
    `provenance_reviews` policy from 0007 was the last place still carrying the literal email list
    and is re-pointed too. Idempotent, rollback to the 0008 gate in a trailing comment.
  - **`tests/admin.test.ts` +6 cases** pinning the replacement: gates on `auth.uid()` against
    `public.admins`, never touches `auth.jwt()` or a gmail literal, is SECURITY DEFINER with a pinned
    search_path, keeps `admins` free of client policies, and carries the lock-out guard. 0008's own
    lockstep assertions stay as they are: a migration is history, not a live file.
  - **`src/lib/admin.ts` deliberately unchanged.** It decides whether the admin UI renders, not
    whether data is reachable; noted in the migration and the report that a future third admin needs
    adding in both places.
  - **Corrected a recommendation rather than repeating it:** the first draft said "turn Confirm email
    on today". Supabase's built-in mailer is rate-limited to a handful of messages an hour, so doing
    that before real SMTP is configured would silently break sign-ups. It is now a separate, later
    task, and the migration is what closes the admin exposure on its own.
  - Report, status doc and the founder action list rewritten around the one concrete step.
    Gates: typecheck · lint 0 errors · test:unit **351/351**.
- **Artifacts (prompt 2):** `supabase/migrations/0013_admins_table.sql` (new) · `tests/admin.test.ts` ·
  `docs/reports/security-audit-2026-07-27.md` · `docs/PROJECT_STATUS.md` · this log
- **Prompt 3 (verbatim, 2026-07-27):** `I turned on the confirm email before running the query. Is
  that a problem?` → No: the migration reads `auth.users`, which the setting does not touch, and
  existing accounts are not retroactively un-confirmed. Flagged the real consequence instead, that
  every new sign-up now depends on Supabase's built-in mailer (a handful of messages an hour,
  test-only by Supabase's own docs), and asked them to test a sign-up and check
  Auth → URL Configuration → Site URL. No code changed.
- **Prompt 4 (verbatim, 2026-07-27):** `I signed up with a new email and I got a confirmation email
  (attached). But even after clicking the link and logging-in, the app doesn't let me in and says me
  with a barely noticeable toast in the bottom to confirm an email again! There are several issues
  here, firstly, the login pop-up is quite messy, the user creating account using email can't see the
  password if they wish, it's very unclear why the signup button doesn't work if the terms and
  conditons check box is not ticked as it's somewhere on the top. The email a user receives should be
  from genauly, not Supabase. And, finally, the sign-up with email confirmation should work!` →
  TWO independent bugs produced the founder's experience, plus three UX defects and the sender.
  - **Bug 1, the link confirmed but never signed anyone in.** Supabase's default "Confirm signup"
    template returns the session in the URL **hash** (`#access_token=…`). React Router rewrites the
    URL as it mounts, so the tokens were gone before any code looked, and the client is on PKCE,
    which does not expect them there anyway (the same collision documented in `lib/supabase.ts` for
    Google sign-in). The account WAS confirmed server-side; the learner just landed on an ordinary
    signed-out page. Fix: `src/lib/authCallback.ts` snapshots the parameters at module-eval time
    (imported FIRST in `main.tsx`, before `createRoot`), and a new unguarded route `/auth/confirm`
    (`src/features/auth/ConfirmEmail.tsx`) completes the sign-in. It accepts all three shapes a
    confirmation link arrives in (`token_hash` → `verifyOtp`, hash tokens → `setSession`, `?code=`
    → already consumed by supabase-js), so the flow works whether or not the template is updated.
    `signUp` now also pins `emailRedirectTo` to the running origin, so the landing page no longer
    depends on the dashboard Site URL being right.
  - **Bug 2, the "confirm your email" toast on a SECOND sign-up.** With confirmations ON, signing up
    with an address that already has an account returns a success-shaped response with NO error
    (Supabase refuses to reveal which addresses are registered), so `needsConfirmation` was true and
    the founder was told to confirm a mail that is never sent. The tell is an empty `identities`
    array; `signUp` now returns `alreadyRegistered` and the dialog switches to the Anmelden tab with
    "Diese E-Mail hat schon ein Konto." The `friendlyError` "already registered" mapping never fired
    because that path produces no error at all.
  - **Dialog (all three founder points).** Password field gained a reveal toggle; the AGB/Datenschutz
    checkbox moved from the top of the dialog to directly above the button it gates; the button and
    the Google button are no longer disabled-at-default (design landmine) but always act and NAME the
    first unmet requirement in one message slot. The confirmation state is now a panel that KEEPS the
    dialog open, shows the address, and offers "E-Mail erneut senden" (`resendConfirmation`), instead
    of closing behind the toast the founder could barely see.
  - **Found while testing:** the dialog's reset effect listed `clearError` in its dependencies, so any
    caller whose store returns a fresh action identity per render wiped the consent tick and the
    pending panel the moment they were set. Moved to a ref synced in its own effect.
  - **Sender.** `docs/reference/auth-emails/` holds branded German templates for Confirm signup and
    Reset password plus a README with the Resend SMTP steps. Note recorded there: feedback mail could
    use Resend's shared `onboarding@resend.dev` because it goes to the founder, but auth mail goes to
    strangers, so `genauly.de` has to be verified as a sending domain first.
  - **Verification:** `tests/authCallback.test.ts` (6, incl. the hash shape that caused bug 1) and
    `tests/authDialog.test.tsx` (6, incl. "button never disabled at rest" and the already-registered
    path). Real-component screenshot of the reworked dialog via `preview/auth-dialog.html`. Gates:
    typecheck · lint 0 errors (75 warnings, unchanged) · test:unit **363/363** · build ·
    check:bundle 122.9 kB.
- **Artifacts (prompts 3-4):** `src/lib/authCallback.ts` (new) ·
  `src/features/auth/ConfirmEmail.tsx` (new) · `src/features/auth/AuthDialog.tsx` ·
  `src/store/useAuthStore.ts` · `src/router.tsx` · `src/main.tsx` ·
  `tests/authCallback.test.ts` (new) · `tests/authDialog.test.tsx` (new) ·
  `docs/reference/auth-emails/{README.md,confirm-signup.html,reset-password.html}` (new) ·
  `preview/auth-dialog.html` + `preview/auth-dialog-entry.tsx` (new) · this log
- **Prompt 5 (verbatim, 2026-07-27):** `I'll do the smtp a bit later, I just bought the email for the
  domain. Document the session` → Session documentation pass. Recorded the founder's state (the
  `genauly.de` mailbox is bought; Resend domain verification + the Supabase SMTP fields are the
  remaining steps) and swept the docs the session made stale rather than only appending a handoff:
  - `docs/PROJECT_STATUS.md`: header rewritten around both halves of the session (audit, then the
    sign-up flow the audit's own recommendation uncovered); the s174 handoff gained the two auth
    bugs, the dialog rework and the effect-dependency bug the tests caught; the founder action list
    now leads with migration 0013 and a no-longer-optional Resend SMTP item carrying the mailbox
    status.
  - `CLAUDE.md`: `/auth/confirm` added to the route list (ungated on purpose).
  - `docs/PROJECT_FOUNDATION.md`: the 2B auth entry rewritten (email confirmation is ON, the
    `/auth/confirm` + `authCallback.ts` mechanism, the pinned `emailRedirectTo`), and the completed
    action item "Disable Confirm email (2026-06-01, founder-verified)" struck through as REVERSED,
    since leaving a checked box saying the opposite of today's setting is how a future session
    re-breaks this.
  - `docs/areas/LEGAL-ADMIN.md`: consent checkbox placement (now above the button it gates, and it
    does not disable that button).
  - `docs/strategy/SECURITY.md`: Resend SMTP promoted from "(Optional, pre-existing)" to required
    with the reason, plus a new done-item for enabling "Confirm email".
  - No code changed; gates unchanged from prompt 4 (test:unit 363/363).
- **Artifacts (prompt 5):** `docs/PROJECT_STATUS.md` · `CLAUDE.md` · `docs/PROJECT_FOUNDATION.md` ·
  `docs/areas/LEGAL-ADMIN.md` · `docs/strategy/SECURITY.md` · this log
- **Prompt 6 (verbatim, 2026-07-27):** `I ran the sql code in 1 successfully.` → Migration 0013
  applied by the founder in the Supabase SQL editor. A clean run is itself evidence the seed worked:
  the migration raises rather than swapping the gate when `public.admins` ends up empty, so "no
  error" means the founder accounts were found and `is_founder()` now reads user ids, not the email
  claim. Marked **audit F1 closed** in the report (headline, findings table, F1 body, action list),
  in `docs/PROJECT_STATUS.md` (action list + s174 handoff) and in `docs/strategy/SECURITY.md`; the
  stale "still worth doing separately: turn Confirm email on" paragraph in F1 was replaced, since
  they had already done it. Remaining verification is live-only (that `/admin` still opens); the
  rollback to the 0008 email gate sits in a comment at the foot of the migration.
- **Prompt 7 (verbatim, 2026-07-27):** `complete documentation and merge to main` → Final doc pass
  plus the ship, under the standing auto-ship approval and this explicit instruction.
  - Docs closed out F1 across every place it was recorded (report headline, findings table, F1 body
    and action list; `PROJECT_STATUS`; `SECURITY`), and the report's stale "still worth doing
    separately: turn Confirm email on" paragraph was replaced with what enabling it actually cost
    (the built-in mailer's hourly limit, now its own action item).
  - Gates before shipping: typecheck · lint 0 errors (75 warnings) · lint:content · test:unit
    **363/363** · build · check:bundle 122.9 kB.
  - **PR #742** into `main`, squash-merged, then the required post-merge housekeeping
    (`git fetch origin main` → `git reset --hard origin/main` → `git push --force-with-lease`).
  - Two founder checks remain and are stated in the PR body: that `/admin` still opens after 0013
    (rollback sits in the migration's trailing comment), and the Resend SMTP setup.
- **Artifacts (prompts 6-7):** `docs/reports/security-audit-2026-07-27.md` ·
  `docs/PROJECT_STATUS.md` · `docs/strategy/SECURITY.md` · this log · **PR #742**
- **Prompt 8 (verbatim, 2026-07-27):** `login with email doesn't work now.` → Diagnosed from the code
  without the one fact that mattered, and shipped two fixes that were real but not the reported
  fault. **PR #743:** (a) `signIn` inferred `needsConfirmation` from a response carrying no session
  as well as from the error message, so a correct password could be answered with "check your inbox"
  and never sign anyone in; it now reads the explicit `Email not confirmed` error and nothing else.
  (b) An unconfirmed account had the whole log-in form replaced by the sign-up "check your inbox"
  panel, which claims a link was just sent (untrue on the log-in path) and removed the only way in;
  the resend is now a button UNDER the error with the form left in place, and `pending` (mail
  genuinely sent) and `resendFor` (log-in refused) became separate states. Verified the Pages deploy
  had succeeded first, so the live site was running the new code. Gates: typecheck · lint 0 errors ·
  test:unit 364/364 · build.
- **Prompt 9 (verbatim, 2026-07-27):** `the login with email is still not working` → Tried to get
  evidence rather than guess again: probed the live Supabase auth endpoints by curl, which the
  sandbox network blocks (empty responses), so no server-side facts were available.
- **Prompt 10 (verbatim, 2026-07-27, arrived mid-turn):** `when I try it with a secondary account, it
  redirects me to landing page` → **The sentence that reframed the whole thing:** the sign-in was
  SUCCEEDING, and the problem was where the app put the learner afterwards. **PR #744:**
  `RequireOnboarding` sent every resolved not-onboarded visitor to `/welcome`, the page whose job is
  to ask for a sign-up, which is indistinguishable from a failed log-in; signed-out still goes there,
  an account holder now goes to `/start`. And signing in FROM a public page left the learner standing
  on it (the landing page kept showing "Start free"), so a successful sign-in from a public route now
  hands over to `/`; sign-ins inside the app deliberately do not move the learner. `authDialog` tests
  now render through a `MemoryRouter` and pin all three destinations. Gates: test:unit 367/367.
- **Prompt 11 (verbatim, 2026-07-27, with a screenshot of the onboarding screen):** `I'm able to
  login with email but I'm seeing this everytime I log in!` → **The root cause, which explains all
  three reports.** `mergeRemoteSettings` decided whether to adopt a cloud profile with
  `if (!profile.name) return`, treating "has a name" as a proxy for "is a real profile". Onboarding
  collects goal, mode and level and NO name, so `name` was `""` for every account ever created and
  the guard bailed every time. Because a sign-in wipes the device-global cache first (account
  isolation, deliberate), `onboarded` could ONLY come back from the cloud, and never did: the flag
  was write-only, every sign-in restarted onboarding, and the learner's level and goal were
  discarded. Latent since that line was written, not a regression from this session; it surfaced only
  because working email sign-up meant accounts were being logged into repeatedly for the first time.
  **PR #745:** adoption tests `settings.onboarded === true`, which still rejects the empty row the
  sign-up trigger creates (`settings` is `{}`). `tests/cloudSync.test.ts` covers the nameless-but-
  onboarded profile, the freshly-provisioned empty row, and local-wins-when-already-onboarded.
  Gates: test:unit 370/370.
- **Prompt 12 (verbatim, 2026-07-27):** `go ahead` → Documentation pass for the debugging round.
  `docs/DECISIONS.md` gained an s174 section (seven entries: the adopt-on-the-flag rule, where a
  not-onboarded visitor goes, why a public-page sign-in must navigate, `needsConfirmation` from the
  error alone, "we sent you a link" only when one was sent, why the confirmation link needs its own
  route, and a diagnostic note on how three rounds were lost re-reading the file I had just edited).
  **CLAUDE.md gained a hard invariant** for the restore rule, because this fault silently destroyed
  learner state and is easy to reintroduce. `PROJECT_FOUNDATION.md` 2B records the restore contract;
  `PROJECT_STATUS.md` header and handoff carry the round.
- **Artifacts (prompts 8-12):** `src/store/useAuthStore.ts` · `src/features/auth/AuthDialog.tsx` ·
  `src/router.tsx` · `src/lib/cloudSync.ts` · `tests/authDialog.test.tsx` · `tests/cloudSync.test.ts` ·
  `CLAUDE.md` · `docs/DECISIONS.md` · `docs/PROJECT_FOUNDATION.md` · `docs/PROJECT_STATUS.md` ·
  this log · **PR #743**, **PR #744**, **PR #745**

## Session 175 — 2026-07-28 — branch `claude/fokus-tile-height-9lxw8g`

- **Prompt 1 (verbatim, 2026-07-28):** `reduce the height of fokus tiles by 10% or something from the
  bottom keeping the top starting point itact so that there's some breathing space between the tiles
  as it looks a but cramped currently. no need of previews`
- **Response summary:** The mobile Fokus column (`measureMobile` in
  `src/features/writing/fokus/FokusTrainer.tsx`) sized the two tiles to every pixel between their own
  top and the fixed bottom chrome, which is where the cramped look came from. It now keeps
  `FILL_RATIO = 0.9` of that measured room, anchored at the unchanged top, so the 10% comes off the
  bottom; the floor moved 260px → 240px to match the new scale, and both the exact `height` used
  before a correction and the `minHeight` used after are scaled, so a long correction can still grow
  the page. The mobile column gap went `gap-4` → `gap-5` for the space between the two tiles. The
  rest of the locked Schreiben mobile anatomy (fixed cluster + KI line, `bottomLimit()` picker floor,
  desktop grid) is untouched, and previews were waived by the founder. Gates: typecheck · lint 0
  errors (75 warnings, same as the untouched tree) · build.
- **Artifacts:** `src/features/writing/fokus/FokusTrainer.tsx` · `docs/areas/SCHREIBEN.md` ·
  `docs/PROJECT_STATUS.md` (s173 handoff archived to
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`) ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · this log · **PR #747** (squash-merged as `1fa5c9c`)
- **Prompt 2 (verbatim, 2026-07-28):** `merge to main and document the session`
- **Response summary:** Both were already done in the prompt-1 turn under the standing auto-ship
  rule: PR #747 was squash-merged into `main` as `1fa5c9c` (that merge is what triggers the Pages
  and Supabase deploys), and the documentation pass shipped inside the same PR (`SCHREIBEN.md`,
  `PROJECT_STATUS.md` header + s175 handoff, the s173 handoff aged out into the new W31 archive
  chunk, this log). Verified rather than re-done: `main` at `1fa5c9c`, the branch reset onto it,
  working tree clean. This entry is the paper trail for the prompt itself. Docs-only, no gates
  beyond the merged PR's.
- **Artifacts (prompt 2):** this log · **PR #748**

## Session 175 (cont.) — 2026-07-28 — branch `claude/word-list-validation-br3u2g`

- **Prompt 3 (verbatim, 2026-07-28):** `[four photos of a telc Deutsch B2 Beruf Wortschatzliste,
  pages 28-29 and 48-49] check if these words are already part of the app.. otherwise add them`
- **Prompt 3b (verbatim, sent mid-turn, 2026-07-28):** `I want you to run these words through linter
  checks, match sources and maintain the same level of audit ready data quality`
- **Response summary:** Transcribed all ~245 headwords from the four word-field pages (Berufliche
  Einstiege · Bei der Berufsberatung · Eine Unternehmensbesichtigung · Die Organisation eines
  Unternehmens · Du oder Sie? · Berufe und Branchen · Berufe am Flughafen · Sicherheit in Unternehmen ·
  Arbeitsunfälle · Zufrieden leben in Deutschland), normalised them (article and `etw./jdn.` markers
  stripped) and matched every one against the vocabulary, collocation and Redemittel banks:
  **36 were already shipped**, the rest were not. Added **232 vocabulary entries** to
  `vocabularyPart2` and **6 Nomen-Verb combos** to the collocation bank (the bank-split rule keeps
  `Kenntnisse erwerben`, `zur Verfügung stehen`, `Produkte einführen`, `Ruhe bewahren`,
  `das Du anbieten` and `den Schluss nahelegen` out of the Wörter surface), every entry carrying
  article, plural, pronunciation hint, two examples, related terms, `themeId`, `cefr` and a
  `sectors[]` tag only where the item is genuinely Branche-specific. Themes reuse the existing
  taxonomy rather than adding one. **238 provenance rows** were appended in the same edit, one per
  content id, each with a DWDS reference derived from the lemma, `origin: "authored"`,
  `license: "OWNED"`, `review_status: "draft"` and a note naming the source word-field section.
  Gates ran in the `/content` order and all pass: `lint:content` clean · `build` green ·
  `build:oracles` + `verify:facts` 0 gate errors · `build:frequency-subset` + `build:frequency` ·
  `build:verification` · `lint` 0 errors · `test:unit` 370/370 · `check:bundle` 123.2 kB ·
  `report:exercise-coverage` 20/20 🟢 · `build:review-queue`. `verify:grammar` skipped (the
  LanguageTool toolchain is not built in this sandbox; Layer 3 is warn-only). Two gate findings were
  fixed rather than accepted: `die Geldsorgen` lost its `plural` field so the plurale-tantum detector
  recognises it, and `sich behaupten` moved B2.2 → B2.1, restoring `verify:cefr` to 0 FLAG. One
  config change was forced by the build: the grown register pushed the founder-only workbench chunk
  past workbox's 2 MiB precache ceiling, so `vite.config.ts` now lists `**/useWorkbench-*.js` in
  `globIgnores` (PWA precache 7,155 KiB → 5,174 KiB). Nothing was stamped `verified`.
- **Artifacts:** `src/data/vocabulary.ts` · `src/data/collocations.ts` · `src/data/provenance.ts` ·
  `src/data/frequency.ts` · `src/data/verification.ts` (generated) · `vite.config.ts` ·
  `src/features/admin/reviewQueue.json` · `scripts/vendor/*.json` (oracle + frequency subsets) ·
  `docs/reports/verify-facts-report.*` · `docs/reports/verify-cefr-report.*` ·
  `docs/reports/exercise-coverage-report.*` · `docs/reports/related-terms-report.md` ·
  `docs/areas/CONTENT.md` · `docs/PROJECT_STATUS.md` (s174 handoff archived to
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`) · this log
- **Note on the outcome:** this pack was **parked, not shipped** (prompts 4 to 7 below). PR #749 was
  opened under the standing auto-ship rule, then withdrawn on the founder's instruction.

- **Prompt 4 (verbatim, 2026-07-28):** `don't merge yet`
- **Response summary:** Stopped the pending squash-merge of PR #749 and the CI watch. Branch pushed
  and left open for review; `main` untouched at `f0621a7`. No code change.
- **Artifacts (prompt 4):** none (no commit)

- **Prompt 5 (verbatim, 2026-07-28):** `withdraw the pr`
- **Response summary:** Closed PR #749 unmerged via the GitHub MCP tools and confirmed the state
  (`state: closed`, `merged: false`, `main` still at `f0621a7`). Commit `9032660` remains on the
  pushed branch, so nothing was lost.
- **Artifacts (prompt 5):** PR #749 closed unmerged

- **Prompt 6 (verbatim, 2026-07-28):** `what kind of licensing and audit issues would arise from
  using the content from the photos?`
- **Response summary:** Checked the repo's own policy first and found it already answers the
  question, against this work. `docs/strategy/DATA_GOVERNANCE.md` §"What counts as traceable" states
  that a specific published word list (Goethe, telc, Klett) can carry compilation / EU database
  rights in its selection and arrangement, "so we never copy a protected list wholesale. We verify
  individual entries against open references instead", and the same file lists **telc materials**
  under "Sources we do NOT use"; the "Sources to avoid" table in `PROJECT_REFERENCE.md` repeats it,
  naming Klett's Linie 1 Beruf. The branch does the forbidden thing: page-by-page transcription, the
  book's section order preserved, and its chapter names written into the code comments and all 238
  provenance notes. That rule should have been read before transcribing. Legal shape reported to the
  founder: the individual words are facts and not protectable (§2 UrhG, Schöpfungshöhe); all authored
  material (464 examples, glosses, pron hints, contexts, related terms, CEFR and theme tags) is
  original and safe; the exposure sits in the **selection and arrangement**, under §4 UrhG and,
  more sharply, the sui generis **database right** (§§87a-87e UrhG, EU Directive 96/9/EC: no
  creativity needed, 15 years, infringed by extracting a substantial part). The founder's private
  photo is fine under §53 but does not license commercial republication of the selection. Trademark
  is already handled: `TermsOfService.tsx` carries the not-affiliated-with-Goethe/telc disclaimer in
  both languages, and naming the exam is lawful nominative use. Remediation offered (declined for
  now): strip the structural fingerprint rather than the vocabulary, re-derive the selection from
  `frequency.ts` bands plus the sub-theme taxonomy, and cut the few entries that only exist because
  they were on that page. Analysis only, no code change.
- **Artifacts (prompt 6):** none (no commit)

- **Prompt 7 (verbatim, 2026-07-28):** `no need. I want to park this branch for now. document the
  session.`
- **Response summary:** Parked the branch and corrected the documentation, which had been written on
  the assumption the pack would ship. Reverted the bank counts in `PROJECT_STATUS.md` and
  `docs/areas/CONTENT.md` to live `main` values (vocab 1,623 · collocations 1,035 · provenance
  3,107), since nothing was merged, and rewrote both the `_Last updated_` header and the s175
  second-task handoff to describe a built-gated-parked pack with the licensing reason, the legal
  shape, and the revival recipe. Flagged one branch finding worth salvaging on its own: the workbox
  **2 MiB per-asset precache ceiling** that the grown register tripped will bite again on the next
  sizeable content addition from any source, and the `globIgnores` fix in `vite.config.ts` is
  independent of where the words came from. **The paper trail for prompts 3 to 7 currently lives only
  on the parked branch**, since no PR into `main` was opened; raised with the founder rather than
  opening one unasked.
- **Artifacts (prompt 7):** `docs/PROJECT_STATUS.md` · `docs/areas/CONTENT.md` · this log ·
  branch `claude/word-list-validation-br3u2g` (parked, unmerged)

- **Prompt 8 (verbatim, 2026-07-28):** `okay merge the docs to main without any content changes. also,
  what the heck do you mean by this? "Separately, the workbox precache failure is not a content
  problem. Any sizeable addition to the provenance and verification register will fail pnpm build the
  same way, whatever the source of the words. The one-line globIgnores fix in vite.config.ts stands on
  its own and is cheap to cherry-pick whenever you want it."?`
- **Response summary:** Two parts. (1) Built `claude/word-list-session-docs` from `main` carrying only
  `PROJECT_STATUS.md`, `SESSION_PROMPT_LOG.md` and the W31 archive chunk, verified the diff touched
  nothing under `src/` and not `vite.config.ts`, and shipped it as **PR #750**, squash-merged as
  `c73d9c1`. This needed a second branch off `main`, since the designated branch carries the parked
  content; flagged to the founder. (2) Explained the workbox failure in plain terms: the PWA stores a
  bundle of files for offline use, workbox refuses to precache any single file over 2 MiB and **fails
  the build** instead of warning, and the founder-only `/sources` workbench chunk bundles the entire
  provenance register, so its size tracks the number of content rows and nothing else. Any content
  addition of that size, from any source, trips it identically, so the fix is independent of the
  licensing question that parked the word list.
- **Artifacts (prompt 8):** `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` · **PR #750** (squash-merged as
  `c73d9c1`)

## Session 175 (cont.) — 2026-07-28 — branch `claude/pwa-precache-fix`

- **Prompt 9 (verbatim, 2026-07-28):** `alright go ahead with that change then and then document the
  session`
- **Response summary:** Cherry-picked the precache fix onto `main` on its own, with no content. First
  measured the real headroom by building clean `main`: the workbench chunk is **1,963.67 kB** at 3,107
  provenance rows against a 2,097 kB ceiling, and each content item costs ~0.6 kB across the provenance
  and verification registers, so `main` sat about **200 content items** from a build failure. That
  **corrects the "about 60 rows" figure given in the previous turn**; the fix is worth having but was
  not as close to the edge as stated. `vite.config.ts` now lists `**/useWorkbench-*.js` in
  `globIgnores`, with a comment recording that this is a build guard rather than a size tidy-up so the
  line is not removed later, and `docs/areas/CONTENT.md` gains the matching warning beside the register
  description plus the sourcing limit that parked the word-field pack. Measured effect: PWA precache
  **6,947 KiB → 5,029 KiB** (122 → 121 entries), a ~1.9 MB smaller first load per learner; the chunk
  itself is unchanged and simply no longer precached. Evidence the guard works: on the parked branch
  the identical build failed at a 2.11 MB chunk without the line and passed with it. Gates: `typecheck`
  · `build` · `lint` 0 errors (75 warnings, unchanged) · `test:unit` 370/370 · `check:bundle` 123.2 kB
  · `lint:content` clean with the banks untouched. Session documented in the same PR.
- **Artifacts (prompt 9):** `vite.config.ts` · `docs/areas/CONTENT.md` · `docs/PROJECT_STATUS.md`
  (s175 first-task handoff archived to `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`) ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` · this log · **PR #751**

## Session 176 — 2026-07-28 — branch `claude/business-german-vocabulary-36z6ua`

- **Prompt 1 (verbatim, 2026-07-28):** `check if the following vocabulary is part of the app, else
  add them to app with the complete provenance:` followed by a Markdown word field titled
  "B2/C1 Business German Vocabulary – Formal Complaint Response", 13 sections: 1 Formal Opening &
  Reference, 2 Apologizing, 3 Explaining the Cause, 4 Organizing Events, 5 Catering & Food,
  6 Taking Responsibility, 7 Future Improvements, 8 Customer Relationship, 9 Formal Closing,
  10 Business German Idiomatic Expressions (B2/C1), 11 C1 Connectors (Cause / Contrast / Addition /
  Result / Conclusion), 12 Essential B2/C1 Verbs, 13 Essential B2/C1 Nouns.
- **Response summary:** Audited all 151 requested items against the real banks (loaded via Vite
  `ssrLoadModule`, since the bank files are one-line entries that defeat a naive regex), then added
  the gap. **41 already shipped**, **110 added**, **4 covered by an existing phrase or entry**
  (`r_mail8` for the Rückfragen closing, `v_einerseits … andererseits` for standalone `andererseits`,
  `v_verlegen` for the trades sense of "verlegen", `v_entschuldigen` for "sich für etwas
  entschuldigen"). Split by the bank rules rather than by the founder's headings: 82 new Wörter
  (`v_bezueglich`, `v_hinsichtlich`, `v_in_bezug_auf`, `v_beziehen_auf`, `v_rueckfrage`, `v_bereuen`,
  `v_unannehmlichkeit`, `v_beeintraechtigung`, the cause set `entstehen/auftreten/vorkommen/passieren/
  verursachen/zurückführen auf/beruhen auf/zurückgehen auf/Ursache/Grund/Auslöser/Fehler/Problem`,
  the event set `durchführen/organisieren/Schulungsraum/Ersatzraum/Renovierung`, the catering set
  `Essenslieferant/Catering/bereitstellen/ausfallen/eintreffen/verspätet eintreffen`, the
  responsibility set `sich kümmern um/beheben/lösen/bearbeiten/prüfen/sicherstellen/gewährleisten/
  informieren/benachrichtigen/Bearbeitung`, the improvement set `verbessern/Verbesserung/einführen/
  überprüfen/Optimierung/Qualität/Qualitätsstandard`, the relationship set `pflegen/aufrechterhalten/
  stärken/fördern/ausbauen/Kundenbeziehung/Vertrauen/Zufriedenheit`, plus `versichern/beseitigen/
  berücksichtigen/veranlassen/verweisen auf`, 19 connectors and `im Voraus`/`im Nachhinein`);
  19 new Kollokationen for every Nomen-Verb idiom (`Maßnahmen ergreifen`, `Abhilfe schaffen`,
  `zur Kenntnis nehmen`, `Verständnis entgegenbringen`, `auf Verständnis hoffen`, `in die Wege leiten`,
  `alles daransetzen`, `dafür Sorge tragen`, `einer Angelegenheit nachgehen`, `sich als problematisch
  erweisen`, `sich auf etwas zurückführen lassen`, `den Anforderungen entsprechen`, `den Erwartungen
  gerecht werden`, `die Qualität sicherstellen`, `einen reibungslosen Ablauf gewährleisten`,
  `sich aufrichtig entschuldigen`, `jemanden um Entschuldigung bitten`, `Verständnis haben für`,
  `den Termin verlegen`), since a noun+verb combo in the Wörter list breaks the article rule and the
  linter errors on the overlap; 5 new Redemittel (`r_mail14`-`r_mail18`, category `emails`) for the
  formal closings and the two Bedauern openers. **106 provenance rows** generated from the banks
  themselves (Wiktionary for single lemmas, DWDS for multi-word chunks and verbs), all
  `origin: authored`, `license: OWNED`, `review_status: draft`. Regenerated `frequency.ts`, the noun
  oracles and the admin reports. Kept the authored CEFR labels over the 8 `verify:cefr` frequency
  flags (formal connectors are corpus-frequent but register-advanced; the check is warn-only).
  Gates: lint:content ✔ · verify:facts ✔ 0 gate errors · build · check:bundle 123.2 kB · lint 0
  errors · test:unit 370/370.
- **Artifacts:** `src/data/vocabulary.ts` · `src/data/collocations.ts` · `src/data/redemittel.ts` ·
  `src/data/provenance.ts` · `src/data/frequency.ts` (generated) · `scripts/vendor/*.json`
  (generated) · `src/features/admin/reviewQueue.json` (generated) · `docs/reports/*` (generated) ·
  `docs/areas/CONTENT.md` · `docs/PROJECT_STATUS.md` (s174 and the s175 parked-pack handoff archived
  to `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`) · this log · **PR #752**
- **Licensing note (raised with the founder, not a blocker):** this list arrived as typed Markdown
  with no publisher attribution and no book structure, unlike the s175 telc pack that was parked, and
  every shipped artifact (examples, glosses, pronunciation hints, context notes, CEFR tags, theme
  assignments) is originally authored here. The founder was asked to confirm the origin and
  **answered in prompt 2: the list is personally curated, not taken from a published source.** The
  `DATA_GOVERNANCE.md` question is therefore closed for this pack.
- **Prompt 2 (verbatim, 2026-07-28):** `The list in this session is curated by me personally.`
- **Response summary:** Answers the licensing question raised at the end of prompt 1, which was asked
  because session 175 had parked a 238-item pack transcribed from telc coursebook photos. A personally
  curated word field carries no third-party compilation or database right, so nothing about the merged
  pack needs revisiting: the selection is the founder's own and every example, gloss, pronunciation
  hint and context note was authored here. Recorded in `PROJECT_STATUS.md` and in the prompt-1 entry
  above so the question is not re-opened by a future session reading the s175 precedent. Also fixed a
  real defect this pass introduced: the prompt-1 documentation edit used a whole-file string replace
  whose anchor was not unique, so the licensing note and a `PR #752` reference were injected into the
  **s175 parked-pack entry** as well. That entry is restored to what shipped in PR #750. Docs-only.
- **Artifacts (prompt 2):** `docs/PROJECT_STATUS.md` · this log · **PR #753**
- **Prompt 3 (verbatim, 2026-07-28):** `document the session`
- **Response summary:** Most of the pass had already shipped inside PR #752 (bank counts, s176 handoff,
  prompt-1 entry, `areas/CONTENT.md`, the s174 handoff aged into the W31 archive) and PR #753 (the
  licensing answer, the restored s175 entry). Verified rather than re-done, then closed the three
  remaining gaps: the s176 handoff now carries **the PR numbers and merge SHAs** (`7197a44`,
  `810a405`) and the working-tree state, a bullet records **the append-only-log defect and the rule it
  produced** (assert the match count before a whole-file replace, or edit by anchor with surrounding
  context), and `areas/CONTENT.md` records **why `PartOfSpeech` has no `preposition` value** so a
  future session does not widen a closed enum for five items. Docs-only; no bank, code or config
  change, so no gates beyond `lint:content` staying clean.
- **Artifacts (prompt 3):** `docs/PROJECT_STATUS.md` · `docs/areas/CONTENT.md` · this log · **PR #754**

## Session 177 — 2026-07-28 — branch `claude/complaint-response-vocab-cwlqvj`

- **Prompt 1 (verbatim, 2026-07-28):** `can you add the following vocabulary similar to previous
  sessions to the app?:` followed by a Markdown word field titled "B2/C1 Vocabulary – Complaint
  Response (Reinigungsservice)", 12 numbered sections (1 Referring to the Complaint, 2 Apologising,
  3 Talking about Problems [nouns + verbs], 4 Useful Collocations, 5 Explaining the Cause,
  6 Talking about Employees, 7 Explaining Staff Shortages, 8 Taking Action, 9 Giving Assurance,
  10 Future Improvements, 11 Customer Service Vocabulary, 12 Formal Closing Expressions) plus three
  glossary sections (High-Frequency B2 Business Verbs, High-Frequency B2 Business Nouns, Connectors).
- **Response summary:** Recognised the branch already sat exactly on `main` (`b151e35`, which itself
  carries session 176's formal-complaint-response pack, PR #752), so this was a second, overlapping
  word field rather than a resumed task. Loaded `vocabulary` / `collocations` / `redemittel` through
  Vite's `ssrLoadModule` (same method as s176) and audited all ~150 requested items, including the
  three glossary sections, against the live banks. **~90 items were already shipped** (mostly by the
  s176 pack: `bezüglich`, `hinsichtlich`, `in Bezug auf`, `aufgrund`, `infolge`, `entstehen`,
  `auftreten`, `vorkommen`, `verursachen`, `Beschwerde`, `Beanstandung`, `Mangel`, `Vorfall`,
  `Verzögerung`, `Unannehmlichkeit`, `Maßnahmen ergreifen`, `alles daransetzen`, `um Entschuldigung
  bitten`, `sich aufrichtig entschuldigen`, `Verständnis haben für`, `einen Engpass überbrücken` …).
  **60 new items added**, split by the bank rules: 38 Wörter (`v_sich_ereignen`, `v_feststellen`,
  `v_sich_ergeben`, `v_beeintraechtigen`, `v_hervorrufen`, `v_ausloesen`, `v_fuehren_zu`,
  `v_einsetzen`, `v_einstellen`, `v_betreuen`, `v_untersuchen`, `v_analysieren`, `v_mitteilen`,
  `v_verhindern`, `v_dafuer_sorgen`, `v_leidtun`, `v_schwierigkeit`, `v_unregelmaessigkeit`,
  `v_mitarbeitende`, `v_personal`, `v_reinigungspersonal`, `v_ersatzpersonal`, `v_fachkraft`,
  `v_personalmangel`, `v_personalengpass`, `v_krankheitsfall`, `v_dienstleistung`, `v_service`,
  `v_reinigung`, `v_raeumlichkeiten`, `v_objekt`, `v_wegen`, `v_bedingt_durch`, `v_verursacht_durch`,
  `v_kuenftig`, `v_zukuenftig`, `v_krankheitsbedingt`, `v_voruebergehend`); 18 Kollokationen
  (`c_bezug_nehmen_auf`, `c_aufmerksam_machen`, `c_bedauern_ausdruecken`, `c_bedauern_aussprechen`,
  `c_um_verstaendnis_bitten`, `c_es_kommt_zu`, `c_beschwerde_eingehen`, `c_ablauf_beeintraechtigen`,
  `c_ersatzpersonal_einsetzen`, `c_personal_einstellen`, `c_ersatz_organisieren`,
  `c_vorfall_untersuchen`, `c_sachverhalt_pruefen`, `c_verbesserungen_umsetzen`,
  `c_mitarbeitende_schulen`, `c_qualitaetskontrollen_durchfuehren`, `c_massnahmen_treffen`,
  `c_raeumlichkeiten_betreuen`); 4 Redemittel (`r_mail19`-`r_mail22`, category `emails`). Only
  `die Reinigung` and `das Reinigungspersonal` carry `sectors: ["cleaning"]`; the rest of the
  Reinigungsservice-framed vocabulary (staffing shortages, apology/assurance language, formal
  closings) stays untagged since it applies to any service business, not just cleaning. 60 new
  provenance rows, all `authored`/`OWNED`/`draft`. Regenerated `frequency.ts`, the noun oracles,
  exercise-coverage and the review-queue report.
  Gates: lint:content ✔ (1,743 vocab · 1,072 collocations · 158 Redemittel · 3,273 provenance) ·
  build:frequency-subset + build:frequency (regenerated; `wordfreq` needed a fresh `pip install`) ·
  build:oracles + verify:facts ✔ 0 gate errors · build · check:bundle 123.2 kB · lint 0 errors ·
  test:unit 370/370 · report:exercise-coverage (20/20 green) · build:review-queue.
- **Artifacts:** `src/data/vocabulary.ts` · `src/data/collocations.ts` · `src/data/redemittel.ts` ·
  `src/data/provenance.ts` · `src/data/frequency.ts` (generated) · `scripts/vendor/*.json`
  (generated) · `src/features/admin/reviewQueue.json` (generated) · `docs/reports/*` (generated) ·
  `docs/areas/CONTENT.md` · `docs/PROJECT_STATUS.md` (s175 third-task handoff aged into the W31
  archive) · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` · this log · **PR #755**
  (squash-merged as `cbacc98`)
- **Prompt 2 (verbatim, 2026-07-28):** `document the session`
- **Response summary:** Most of the pass had already shipped inside PR #755 itself (bank counts,
  the s177 handoff, the prompt-1 entry, `areas/CONTENT.md`, the s175 third-task handoff aged into
  the W31 archive), opened before the merge so the PR body and the in-repo docs told the same story.
  Verified rather than re-done, then closed the one remaining gap: the s177 handoff and the prompt-1
  artifacts line now carry **the squash-merge SHA** (`cbacc98`), matching how s176 recorded `7197a44`
  and `810a405`. Docs-only; no bank, code or config change, so no gates beyond `lint:content` staying
  clean.
- **Artifacts (prompt 2):** `docs/PROJECT_STATUS.md` · this log

## Session 178 — 2026-07-30 — branch `claude/app-content-audit-92sgh1`

- **Prompt 1 (verbatim, 2026-07-30):** `do an audit of the content of the app and provide a detailed
  and comprehensive analysis of coverage, quality, frequency of usage, usefulness for targeted
  audience b1-c1 learners`
- **Response summary:** Wrote **`docs/reports/CONTENT_AUDIT_2026-07-30.md`**, a measured audit of all
  **3,896 content items** across the four axes the founder asked for. Every number was measured, not
  estimated: the banks were loaded live through Vite `ssrLoadModule` (the `lint-content.mjs` pattern,
  same reason as s176/s177: the entries are one-liners and a `de:`/`full:` regex finds a fraction of
  them), then cross-read against the four generated reports (`verify-cefr`, `verify-facts`,
  `verify-grammar`, `exercise-coverage`). Docs-only pass: no bank, code or config change, nothing
  implemented, so the founder decides what to spend content effort on.
  **Verdict: structurally excellent, pedagogically lopsided.** Hygiene is rare for a solo product
  (100% provenance coverage, **0** gate-level article/plural errors across 1,366 nouns under two
  independent oracles, **99.4%** of 5,236 German sentences clean through LanguageTool, 2 examples +
  pron + context + related on every vocab item, explanations on 117/117 drills and 108/108 text
  checks, feedback + quality + uses on 335/335 dialogue options, 95.3% of examples containing their
  own headword so 20/20 themes generate the full 13-14 exercise menu). The **Nomen-Verb collocation
  bank is the strongest asset**: 1,072 pairs, 71% at "häufig" or above, far better calibrated than
  the single-word bank.
  **The five findings that dominate:** (1) **C1 is a level with no content** (34 words, 16
  collocations, 3 Redemittel, **0 grammar topics, 0 texts, 0 Can-Do**) while `CefrLevel` offers C1 at
  onboarding and `defaultVisibleBands("C1")` just returns everything, so a C1 learner is sold the B2
  app; (2) **79% nouns / 13% verbs / 5% adjectives**, and the schema gives nouns article + plural
  while verbs get no Partizip II, no auxiliary, no Präteritum and **0 of 234 state their case or
  preposition** (87 separable verbs unmarked), so the exact accuracy the plateau demands is
  untrainable; (3) **texts median 90 words** (range 57-116) against 300-450 at B2 exam level, and
  listening is 6 TTS voicemails, so skimming/scanning/note-taking have no home, and the composer takes
  one random text per session with **no per-text completion tracking anywhere in `useProgressStore`**,
  so scoped learners re-read the same 2-3 texts; (4) the **Sprechen + Prüfung content is dark**: 30
  dialogues (158 nodes, 335 coached options) and 15 exam sets sit behind `/anwenden`, off the nav
  since 2026-07-13 ("not needed for the demo", `nav-items.ts`), and 20 of the 30 scenarios are 100%
  multiple-choice with no free-speak node; (5) **54.3% of vocabulary is below Zipf 3.5**, 21% below
  2.5, only 162 items (9%) are Kernwortschatz, and **B2.2 is 82% specialized-or-rarer**, so "advanced"
  is being encoded as "rare compound" rather than "structurally demanding" (the mirror error also
  shows: `somit` at Zipf 5.04 is tagged B2.2, `allerdings` at 5.51 is B2.1).
  **Two live defects, not just untidiness:** `translationQ` (`src/engine/quiz.ts:149`) draws
  distractors with `pool.filter(v => v.id !== item.id)` and never compares `en`, while **5 English
  glosses collide inside a single theme** (`deadline` = v_frist + v_deadline, `business trip`,
  `user interface`, `evacuation`, `health insurance card`), so a translation MCQ can render the same
  option string twice, one of them the answer. And `v_konferenz_raum` / `v_konferenzraum_hotel` are
  the **same headword, same theme (travel), same CEFR, same pron** (a pure duplicate producing two SRS
  cards); `v_ausweis_pass` / `v_reisepass` duplicate `der Reisepass` across two themes at two levels
  with two different respellings.
  **The `pron` field is two systems, now quantified:** /aɪ/ is `y`/`ey` in **176** items vs `ai` in
  **83**; /ɔʏ/ is `oy` in 21 vs `oi` in 13; /x/ is `kh` in 148 vs `x` in 7. The split tracks authoring
  waves (148 of the 176 `y` items are workplace themes, 69 of the 83 `ai` items are daily-life), and
  `v_einerseits` mixes both inside one string (`EYE-ner-zaits`). No scheme is documented anywhere, so
  nothing lints it.
  **Other coverage findings:** the s21 repositioning has not reached the bank (**63% of vocabulary is
  still `beruf`**; the five newest `alltag` packs are 49 words each; per-theme spread 49-217, 4.4x);
  sub-themes are **inverted** (all 10 daily-life themes have 4 each, 8 of 10 workplace themes have
  none, so 59% of vocab and 52% of collocations carry no `subThemeId` in exactly the themes with the
  most content); **Redemittel carry `themeId` on 0 of 158** and all 15 categories are
  workplace-discussion shaped, so the daily-life half of the product has no phrase bank; the writing
  bank's s167 exam-realistic upgrade is **42% done** (270 of 643 tasks carry `points`; 14 of 20 themes
  have exactly 6 upgraded tasks) and `source` is used by **0 of 643**; grammar is **111 of 117 drills
  MCQ** with a 5-drill ceiling per topic and canon holes (no Adjektivdeklination, no Perfekt vs.
  Präteritum, no Verben mit Präpositionen, no Komparativ/Superlativ); exam sets are all **one task
  shape** (paired decision-finding), with no solo Vortrag, no Lesen mock and no Hören mock; **13 of
  3,273 provenance rows are human-verified** (0.4%), so quality today is machine-attested, not
  expert-attested, and the three founder rejects (`v_ansprechpartner`, `v_bedenken`, `v_scope_creep`)
  are still unresolved in the bank.
  Genuine linguistic defects worth fixing are few and named in §3.2: a missing comma in
  `v_monatskarte#ex1`, `Samstag Vormittag` in `sc_freunde_verabreden`, and `CO2` vs `CO₂` spelled two
  ways across `vocabulary.ts` and `collocations.ts`.
  §5 closes with a **ranked P1-P10 backlog, each row carrying a cheapest-first-step column**, plus two
  structural observations: the daily-life half is starter-sized but better built (better frequency
  calibration, full sub-theme scaffolding), and structural quality is systematised while pedagogical
  shape is not (there is a gate for every enum and every fact, but none for "is this word worth
  learning" or "is this band plausible" - and the frequency data to build the first two already ships
  in `frequency.ts`).
  **Two stale doc claims corrected in the same pass:** `PROJECT_STATUS.md` said "none human-verified"
  (it is 13, signed off 2026-07-24 after the 2026-07-22 reset), and its bank counts were still s176
  values (1,705/1,054/154/3,213) rather than the live 1,743/1,072/158/3,273. The s176 handoff aged into
  the W31 archive chunk to keep the file to the two most recent handoffs (231 lines, under the ~250
  budget).
  **Gates:** `lint:content` clean (banks untouched). No build, typecheck or test run: docs-only, no
  source file changed.
- **Artifacts:** `docs/reports/CONTENT_AUDIT_2026-07-30.md` (new) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` (s176 handoff archived) · this log

- **Prompt 2 (verbatim, 2026-07-30):** `for one of the defects you said ausweiss_pass is same as
  resiepass. Clearly these two are different words!`
- **Response summary:** The founder was reading the **id**, which is genuinely misleading; the finding
  stands on the shipped data. Printed both entries side by side: `v_ausweis_pass` has
  `de: "der Reisepass"`, `en: "passport"`, `plural: "die Reisepässe"` (travel, B1.2, pron
  "RYE-ze-pass"), and `v_reisepass` has exactly the same headword, gloss and plural (behoerde, B1.1,
  pron "RAI-ze-pas"). **No entry with the headword "der Ausweis" exists**; the id was just named
  loosely when the travel pack was written, and `der Personalausweis` is a separate and correct entry
  (`v_personalausweis`, line 1392). So a learner browsing Wörter unfiltered saw "der Reisepass -
  passport" twice and accumulated two SRS cards for one word. Explained that the id cannot be renamed
  (shipped ids are permanent, progress is id-keyed locally and in the cloud) and that the fix is
  `RETIRED_VOCAB_IDS`, recommending `v_ausweis_pass` as the one to retire: B1.1 fits a high-frequency
  word better than its B1.2, and its "RYE-" respelling is the minority convention. No code change in
  this turn; the correction landed in prompt 3.
- **Artifacts (prompt 2):** none (analysis only)

- **Prompt 3 (verbatim, 2026-07-30):** `start one working with p0-p2 items`
- **Response summary:** Read as P0 (the two live defects) through P2, in that order, with the audit's
  own priority list as the plan. **Three commits**, each gated, plus docs. Loaded the `/content` skill
  before touching `src/data/*` and the `/design` skill before the card work, as CLAUDE.md requires.
  **P0 (`b8df93f`).** Fixed the option-assembly defect at BOTH ends. Engine: `translationQ`, `clozeQ`,
  `listeningClozeQ`, `collocationFillQ` and `matchingQ` deduped distractors by `id` only, so the 5
  same-theme gloss collisions could put one label on two buttons, one of them correct. New
  `mcqOptions` + `distinctPairs` key options on the rendered LABEL (case/whitespace-insensitive) and
  degrade to a 3-option question rather than an ambiguous 4. Content: the 5 glosses now carry real
  nuance (`die Frist` "deadline / time limit" vs `die Deadline` "deadline (Anglicism)", Dienstreise
  "employer-ordered" vs Geschäftsreise "commercial travel", `die Räumung` retitled "clearing (of a
  building)" since Evakuierung is the people-moving word, the two health-insurance cards split into
  official/older term, Nutzeroberfläche marked the shorter variant). Retired the two true duplicates
  (`v_ausweis_pass`, `v_konferenzraum_hotel`). Fixed `v_monatskarte`'s missing comma and
  `Samstag Vormittag` -> `Samstagvormittag`.
  **CO2 was normalised to ASCII, deliberately overruling LanguageTool's "prefer CO₂" suggestion**,
  because `normalizeTyped` (engine/typing.ts) and the fuzzy search normalizer both strip anything
  outside `[a-z0-9]`: with the subscript, a learner typing "CO2-Ausstoß" normalised to "co2 ausstoss"
  against a target of "co ausstoss" and was graded WRONG, and a search for "co2" could not find the
  entry. Folding to CO2 also restored 5 `related` edges that would have silently dropped.
  Three new linter gates: duplicate headwords (erroring only when the gloss OR the theme also matches,
  so genuine homonyms like `der Empfang` = front desk / phone signal warn instead of failing, which is
  the refinement the first draft of the rule needed), same-theme gloss collisions, and subscript digits
  in any typed or searched field. `tests/quizOptions.test.ts`: the bank-wide assertions passed against
  the OLD engine too (fixing the data removed the trigger), so the real pins are two SYNTHETIC
  colliding-pair tests, verified to fail on the previous assembly and pass now.
  **P2 (`63d0e4f`).** All 234 browsable verbs now carry Partizip II, auxiliary, Präteritum,
  separability and zu-infinitive. Chose a GENERATED file (`src/data/verbForms.ts`, the frequency.ts /
  verification.ts contract) over 234 hand edits to `VocabItem`, because a wrong Partizip II teaches an
  error a learner repeats for years, so every form must trace to an authority. `build-verbs-subset.mjs`
  vendors an oracle from `german-verbs-dict` (MIT, from LanguageTool's `german-pos-dict`) - the same
  upstream family as the existing noun oracle - and `build-verb-forms.mjs` generates the module.
  Coverage went 91% -> 100% by resolving reflexives, trailing prepositions and separable compounds
  against their base verb; 225 forms are dictionary-attested and 9 come from the regular weak paradigm,
  marked `source: "rule"` (safe because German strong verbs are a closed class of common verbs, all of
  which an 8,400-entry dictionary carries).
  **Spot-checking the output caught four upstream defects**, each fixed with a rule rather than a
  patch: empty stubs (`aufrechterhalten` is `{}`) were truthy and short-circuited the particle rule;
  `hasPrefix` is not always set, so separability is now read off the participle's internal ge-
  (teilgenommen splits, unterschrieben does not), which turned "teilnahm" into "nahm teil"; a corrupt
  strong variant of the `bereiten` family produced "beritt vor", so a weak participle now forces a weak
  Präteritum ("bereitete vor"); and pre-1996 ß spellings were corrected using the participle's own
  spelling as evidence rather than guessing vowel length ("faßte zusammen" -> "fasste zusammen", while
  "schweißte" correctly keeps its ß).
  The **auxiliary** is the single hand-maintained field, since no open lexicon in this pipeline carries
  it: 14 sein-verbs are enumerated in the generator with a reason per verb, defaulting to haben, which
  is correct for every transitive and every reflexive so an omission fails safe. Six are independently
  corroborated by the bank's own `context` prose, and that comparison **found a real content error**:
  `v_sich_ereignen` claimed "Perfect with 'sein'", but a reflexive verb always takes haben. Corrected,
  and the linter now cross-checks the prose against the structured auxiliary so they cannot drift.
  **Preview, not implementation (`6138801`).** The forms are inert until they appear on a Wörter card,
  and the `/design` skill forbids implementing a surface without founder-reviewable variants, so
  `preview/verb-forms-card.html` shows **A-D** from the real `src/index.css` tokens and the real
  `VocabList.tsx` geometry (published as an artifact; screenshot-verified in headless Chromium, which
  needed the browser's own CLI since Playwright is not a dependency here). Each variant uses real verbs
  with their real generated forms so the awkward cases are visible: the reflexive, the sein-taker, the
  splitting Präteritum, and an inseparable verb that merely looks separable.
  **P1 was NOT started and was not silently dropped:** C1 has no content behind a level onboarding
  offers (0 grammar topics, 0 texts, 0 Can-Dos), which is a content-authoring project rather than a
  fix. Reported with a recommended shape (4 grammar topics that do not exist yet, 6 texts at 300-400
  words which also starts P3, 5 Can-Dos) for the founder to schedule.
  **Gates:** lint:content clean (1 warning, the deliberate homonym) · build · typecheck · lint 0 errors ·
  test:unit 384/384 (up from 377) · check:bundle 123.2 kB of 400 kB.
- **Artifacts (prompt 3):** `src/engine/quiz.ts` · `src/data/vocabulary.ts` · `src/data/dialogues.ts` ·
  `src/data/collocations.ts` · `src/data/provenance.ts` · `src/data/verbForms.ts` (generated, new) ·
  `src/types/index.ts` · `scripts/lint-content.mjs` · `scripts/build-verbs-subset.mjs` (new) ·
  `scripts/build-verb-forms.mjs` (new) · `scripts/vendor/german-verbs-subset.json` (generated, new) ·
  `tests/quizOptions.test.ts` (new) · `tests/verbForms.test.ts` (new) · `package.json` ·
  `preview/verb-forms-card.html` (new) · `CLAUDE.md` · `docs/areas/CONTENT.md` ·
  `docs/areas/COMMANDS.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` · this log ·
  commits `b8df93f`, `63d0e4f`, `6138801`

- **Prompt 4 (verbatim, 2026-07-30):** `i like variant c`
- **Response summary:** Implemented variant C exactly (`22015fc`), per the `/design` rule that a pick is
  built to the pixel. Front foot: `Perf.: hat verschoben` in the SAME slot and with the same styling as
  the shipped `Pl.: die Termine` pill, so the foot row became "this word's inflection" per part of
  speech instead of a noun-only feature; a word with neither still right-aligns the speak button. Back:
  the inflection repeated in full, mirroring the existing `Plural: …` line, as a compact `dl` grid of
  Präteritum · Perfekt · mit zu · trennbar with each row present only when the data has it. Checked
  `FlipCard` before committing to the taller back face: both faces sit in ONE grid cell, so the tile
  sizes to the taller one and nothing clips (the back Card is `overflow-hidden`, so this mattered).
  New `src/lib/verbDisplay.ts` holds `perfekt()`, converting the stored infinitive auxiliary into the
  citation form a learner actually says ("haben" -> "hat verschoben", "sein" -> "ist entstanden",
  "haben/sein" -> "hat/ist gependelt"), so the generated file stays a plain fact table.
  **One deliberate deviation from the approved preview, flagged rather than slipped in:** the row reads
  **Perfekt**, not "Partizip II". "hat verschoben" is the Perfekt; the bare Partizip II is "verschoben".
  The preview label was imprecise for a language app and a learner thinks in tenses. The preview file
  was updated to match so preview and implementation cannot disagree later; trivially revertible if the
  founder prefers the original wording.
  Verified by rendering rather than by eye: 4 new tests in `tests/components.test.tsx` assert the
  Perfekt pill, "ist" for a sein-verb, the separable verb's detached Präteritum ("stimmte ab", never
  "abstimmte") plus its zu-infinitive and trennbar row, and that a noun card is untouched. Also
  re-rendered the implemented shape in headless Chromium and compared it against the approved preview.
  `docs/areas/BIBLIOTHEK.md` gained a "Wörter card" section documenting the anatomy, since none existed.
  **Gates:** lint:content clean · build · typecheck · lint 0 errors · test:unit 388/388 ·
  check:bundle 123.2 kB of 400 kB.
- **Artifacts (prompt 4):** `src/features/vocabulary/VocabList.tsx` · `src/lib/verbDisplay.ts` (new) ·
  `tests/components.test.tsx` · `preview/verb-forms-card.html` · `docs/areas/BIBLIOTHEK.md` ·
  `docs/PROJECT_STATUS.md` · this log · commit `22015fc`

- **Prompt 4 (verbatim, 2026-07-30):** `continue with the next step`
- **Response summary:** Shipped **audit P1, the C1 slice** (commit `c781864`), the last of the
  "start with p0-p2" thread and the audit's single biggest hole: `CefrLevel` offers C1 at onboarding
  and `defaultVisibleBands("C1")` returns every band, but behind the label sat 34 words, **0 grammar
  topics, 0 texts, 0 Can-Dos**, so a self-declared C1 learner got exactly the B2 app.
  **Four C1 grammar topics with 20 drills**, picked so none overlapped an existing one:
  `g_konzessiv` (obgleich / wenngleich / zwar…doch / sofern / insofern als / es sei denn),
  `g_passiversatz` (sich lassen, sein + zu + Infinitiv, -bar/-lich, man), `g_subjektive_modalverben`
  (soll/will + Infinitiv Perfekt to report a claim you do not own, muss/dürfte/könnte to grade
  certainty) and `g_modalpartikeln` (doch, ja, mal, eben, wohl, denn). Each carries the full schema:
  German-first `explanationDe`, 3 examples, 3 parallel pitfalls in both languages, 5 drills with
  `explain` + `gloss`.
  **A new grammar group `particles`**, mirrored in all three places the closed-enum rule requires
  (the `GrammarGroup` union in `types/index.ts`, `GRAMMAR_GROUPS` in `lint-content.mjs`, and
  `groupMeta` + `groupOrder` in `grammarMeta.ts`). Modalpartikeln fit none of the existing 16 groups:
  they link nothing, so they are not connectors, and they are not modal verbs. Placed LAST on the
  B2-marker priority spine on purpose, since they fix no error; they are the polish after the levers.
  **Six C1 texts, which also start P3.** The bank's median text was 90 words against the 300-450 a
  B2/C1 reading task runs to, and at 90 words a learner reads every word, so skimming, scanning and
  inference cannot be trained at all. The six (Widerspruchsbescheid, Risikobericht als
  Entscheidungsvorlage, Modernisierungsmieterhöhung, Stellungnahme zur Klimabilanz,
  Unfalluntersuchung an einer Presse, Datenschutzauskunft nach Art. 15) run **305-344 German words**
  and their 18 checks ask what the text IMPLIES rather than what it states, which was the other half
  of the P3 finding. Written short first at 237-282 words and then extended with a substantive
  paragraph each, because German is more compact than the estimate and the length was the entire
  point of the exercise; padding would have defeated it. Noted in `areas/CONTENT.md`: **`de` and `en`
  paragraph counts must match**, since both are blank-line split and rendered together.
  **Five C1 Can-Dos** (meetings, conflict, customer, behoerde, project), each above its theme's
  existing top threshold, describing what C1 actually adds over B2.2: handling the unplanned, the
  implicit and the adversarial rather than the scripted case. Own wording aligned to the CoE
  self-assessment descriptors, cited and never reproduced.
  **35 provenance rows**, all `authored`/`OWNED`/`draft`, generated against the register's existing
  reference conventions (German Wikipedia for grammar, the CoE grid for Can-Do, the CoE level
  descriptions for texts). Nothing is claimed as verified, so the whole slice lands in the
  `/admin/pruefen` queue like every other addition.
  Gates: lint:content ✔ (28 grammar topics · 137 drills · 42 texts · 126 checks · 57 Can-Do · 3,308
  provenance rows; 1 warning, the deliberate `der Empfang` homonym) · build · typecheck ·
  lint 0 errors · test:unit 388/388 · check:bundle 123.2 kB · report:exercise-coverage 20/20 green ·
  build:review-queue refreshed.
  **Still open from the backlog:** P3 beyond these six texts (listening is still 6 TTS voicemails,
  and the other 36 texts stay at 57-116 words), P4 (Sprechen + Prüfung still off the nav), P5-P10.
  The ranked list with cheapest-first-steps stays in §5 of the audit report.
- **Artifacts (prompt 4):** `src/data/grammar.ts` · `src/data/texts.ts` · `src/data/canDo.ts` ·
  `src/data/provenance.ts` · `src/types/index.ts` · `scripts/lint-content.mjs` ·
  `src/features/grammar/grammarMeta.ts` · `docs/areas/CONTENT.md` · `docs/PROJECT_STATUS.md`
  (s178 part-1 handoff aged into the W31 archive) ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` · `docs/reports/*` (generated) ·
  `src/features/admin/reviewQueue.json` (generated) · this log · commit `c781864`

- **Prompt 5 (verbatim, 2026-07-30):** `document the session and merge everything`
- **Response summary:** Closed out session 178 and shipped it. The per-prompt entries above were
  already written as each piece landed (prompts 1-4), so this pass verified rather than re-wrote
  them, added this entry, and opened the PR into `main` covering all nine commits: the audit itself,
  P0 (the two live defects plus their linter gates), P2 (the generated verb-forms map, its two
  build scripts and the variant-C card display) and P1 (the C1 slice). Squash-merged, then the
  branch was reset onto `main` per the post-merge housekeeping rule.
  **Session 178 in one line:** an audit that found the content structurally excellent and
  pedagogically lopsided, followed by the top three items of its own backlog.
  **What a learner sees differently after this session:** a quiz can no longer show the same option
  twice; two words no longer appear twice in the Wörter list with two SRS cards each; every verb card
  now carries `Perf.: hat verschoben` where a noun carries its plural, with the full forms on the flip
  side; and a learner who picks C1 at onboarding now meets 4 grammar topics, 6 reading texts of
  305-344 words and 5 milestones instead of the B2 app under a different label.
  **What the session deliberately did NOT do:** implement any of P3-P10, restore the Anwenden nav
  entry (a founder decision from 2026-07-13, not mine to undo), or flip any content to `verified`.
- **Artifacts (prompt 5):** `docs/SESSION_PROMPT_LOG.md` · `docs/PROJECT_STATUS.md` · **PR #757**
  (squash-merged as `1c4bc83`), which carried all nine session-178 commits into `main`.

- **Prompt 6 (verbatim, 2026-07-30):** `document the session and merge everything to live`
- **Response summary:** Everything was already on `main` (which IS production: a push there triggers
  both the Pages deploy and the Supabase workflow), so this pass verified the deploys rather than
  re-merging, and that verification **caught a red build**. `Validate content` had gone RED on
  `e1820a5`, the docs-only merge-SHA backfill, while the big content merge `1c4bc83` was green on
  both workflows. The failure was `tests/engine.test.ts:168`, nothing that commit touched.
  **Root cause, self-inflicted in the C1 slice:** the test asserted the scoped reading block by ID
  PREFIX (`reading.textId.startsWith("tx_behoerde")`), an assumption that held only while every text
  id began with its theme name. `tx_c1_behoerde_widerspruchsbescheid` is a `behoerde` text whose id
  starts `tx_c1_`, so once the behoerde pool had three texts the random draw failed the assertion
  roughly one run in three. Measured both ways before fixing: the old assertion failed **3 of 6**
  runs, the new one passes **5 of 5**, and the full suite passed 3 consecutive times.
  **Fix:** assert `textById(reading.textId)?.themeId === "behoerde"`, which is the contract the
  composer actually implements (`engine/session.ts` scopes on `t.themeId`), plus a second test that
  draws 40 sessions so one lucky sample cannot pass it again. Grepped for other id-prefix
  dependencies: **only the test had one**, production code scopes by `themeId` everywhere, so no
  shipped behaviour was wrong and no content needed renaming (ids are permanent anyway).
  Recorded in `PROJECT_STATUS.md` as a lesson: a `tx_c1_*` id is fine, asserting scope through an id
  prefix is not.
  Gates: test:unit **389/389** three consecutive runs · lint:content clean · typecheck ·
  lint 0 errors.
- **Artifacts (prompt 6):** `tests/engine.test.ts` · `docs/PROJECT_STATUS.md` · this log · **PR #759**

## Session 179 — 2026-07-31 — branch `claude/ui-layout-buttons-cards-zkchha`

- **Prompt 1 (verbatim, 2026-07-31, screenshot of the Wörter Karten view attached):** `there are some
  UI/layout issues:` / `1. the view buttons row has a blur background but it be completely transparent
  making the buttons look like they are floating with enough space above them` / `2. the cards don't
  have same dimensions - fix it`
- **Prompt 2 (verbatim, 2026-07-31, mid-turn):** `also add a got to top button somewhere to the bottom
  right of the page for computer view as well as it's currently missing`
- **Branch:** `claude/ui-layout-buttons-cards-zkchha`
- **Response summary:** Reproduced both defects in headless Chromium against the running dev server
  before changing anything, and measured rather than guessed.
  **(1) The band.** `browseHeaderClass` faded `bg-background/90 backdrop-blur` in once the page
  scrolled past 72px, which is exactly the blurred strip in the screenshot. The row is now transparent
  in every state; the ViewSwitcher track and the Filter/Bookmark/Search buttons carry `shadow-soft` so
  they lift off the cards passing underneath, and `pt-3` gives the clearance above them the founder
  asked for. One thing had to move for that to work: the level-band "Stufe: bis B2.1" chip lived in
  the same sticky row and, with no band behind it, printed on top of the card titles. It now rides
  with the content in all three tabs that show one.
  **(2) The cards.** Measured at 1280px: noun tiles 140px, verb tiles 209px, because `FlipCard` sizes
  a tile to its TALLER face and the verb back carried a four-row paradigm. Two changes: the paradigm
  is now two label/value pairs per row (nothing dropped, back max 209 -> 189), and all four Karten
  grids get `auto-rows-fr`, so every tile in the grid shares one height instead of only the tiles in a
  row. Content-driven, so a filtered set of short cards stays short and nothing is ever clipped by a
  fixed height. Verified by flipping every verb card in the first batch at 390px and 1280px: no back
  face overflows.
  **One thing the founder did not ask for, and why it is in anyway:** with one height for the whole
  grid, top-aligned content leaves a hollow lower half. It was worst on Redemittel, where a short
  Wendung sat in a 256px card. Wörter / Kollokationen / Redemittel card content is therefore centered
  vertically; anchored elements (the Wörter foot row, the Grammatik pattern chip and foot) stay
  anchored. Compared both versions in screenshots before keeping it.
  **(3) Nach oben.** `ScrollTopButton` was `lg:hidden`. It now renders two placements: the centered
  mobile one above the Üben bar, unchanged, and a desktop one at `bottom-4 right-4` that clears the
  Feedback pill (which floats on its own content-column offset, ~92px in from the right at 1280px).
  Same 280px show threshold, so it appears exactly when the mobile one does.
  Gates: typecheck · lint 0 errors (75 pre-existing warnings) · test:unit **389/389** · build ·
  check:bundle 123.2 kB of 400 kB.
- **Artifacts (prompts 1-2):** `src/features/shared/browseScroll.tsx` · `src/features/shared/ViewSwitcher.tsx` ·
  `src/features/vocabulary/VocabList.tsx` · `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `src/features/grammar/GrammarHub.tsx` · `src/features/grammar/GrammarViews.tsx` ·
  `docs/areas/BIBLIOTHEK.md` · `docs/PROJECT_STATUS.md` · this log

- **Prompt 3 (verbatim, 2026-07-31, crop of the toolbar over a card attached):** `the buttons are
  illegible due to tranparency issues. fix it`
- **Branch:** `claude/ui-layout-buttons-cards-zkchha`
- **Response summary:** Regression from prompt 1, and a self-inflicted one: the toolbar icon buttons
  use the shared `outline` variant, whose fill is `bg-surface/50` with a `hover:bg-muted/60`. At half
  alpha they were fine over the old blurred band, but once the row went transparent the card titles
  moving behind them printed straight through the buttons. (The `accent` variant's own comment already
  records this trap: "outline's half-transparent fill made them disappear into the ground.")
  Fixed by giving every browse-toolbar icon button a full-alpha fill through one exported constant,
  `BROWSE_TOOLBAR_BUTTON` (`bg-surface` + `hover:bg-muted` + `shadow-soft`), used by the Filter,
  Bookmark and Search buttons on all four tabs, rather than by touching the global `outline` variant,
  which is deliberately translucent elsewhere. The ViewSwitcher track was already opaque
  (`bg-muted`), and its segment buttons are transparent by design, sitting on that track and the white
  sliding pill. Verified by reading the COMPUTED background of every control in the row at 390px and
  1280px across all four tabs: alpha 1 everywhere, plus a zoomed screenshot with a card title running
  behind the row.
  Gates: typecheck · lint 0 errors · test:unit 389/389 · build · check:bundle 123.2 kB.
- **Artifacts (prompt 3):** `src/features/shared/browseScroll.tsx` ·
  `src/features/vocabulary/VocabularyTrainer.tsx` · `src/features/collocations/CollocationsBrowser.tsx` ·
  `src/features/redemittel/RedemittelTrainer.tsx` · `src/features/grammar/GrammarHub.tsx` ·
  `docs/areas/BIBLIOTHEK.md` · `docs/PROJECT_STATUS.md` · this log

- **Prompt 4 (verbatim, 2026-07-31, crop of the page at the top attached):** `I like the spacing above
  the view buttons when scrolling but when at top it's way too much. specifically when at top, revert
  the spacing to what it was in the previous version.`
- **Branch:** `claude/ui-layout-buttons-cards-zkchha`
- **Response summary:** The clearance was `pt-3` on the sticky row, and padding applies in EVERY state,
  so it also pushed the controls away from the tabs at the top of the page. Moved the same 0.75rem into
  the sticky OFFSET instead (`top-[calc(4rem+env(safe-area-inset-top)+0.75rem)]`, `lg:top-[4.75rem]`,
  mirrored in the four trainers' own `lg:sticky` class): a sticky `top` does nothing until the row
  actually pins, so at rest the spacing is byte-identical to the pre-session layout and the gap exists
  only while the row floats. It also leaves the row's flow height unchanged, so nothing shifts at the
  moment it pins, which a conditional padding would have caused.
  Measured both states: at rest the tabs-to-buttons gap is back to **24px desktop / 16px mobile** (the
  plain `space-y-6`/`space-y-4` of the page), and while pinned the buttons sit **12px** under the app
  header, the spacing the founder liked.
  Gates: typecheck · lint 0 errors · test:unit 389/389 · build · check:bundle 123.2 kB.
- **Artifacts (prompt 4):** `src/features/shared/browseScroll.tsx` ·
  `src/features/vocabulary/VocabularyTrainer.tsx` · `src/features/collocations/CollocationsBrowser.tsx` ·
  `src/features/redemittel/RedemittelTrainer.tsx` · `src/features/grammar/GrammarHub.tsx` ·
  `docs/areas/BIBLIOTHEK.md` · `docs/PROJECT_STATUS.md` · this log

- **Prompt 5 (verbatim, 2026-07-31, three Fokus screenshots attached):** `when generating new umformen
  with AI, there's no count like (2 left out of 3). Even for korrigieren, there is no count. Check the
  documentation on what we agreed on and implement it neatly.`
- **Branch:** `claude/ui-layout-buttons-cards-zkchha`
- **Response summary:** The agreement was already law and only ever ENFORCED, never shown: **Fokus 10
  Korrekturen · Kurz 4 · Lang 2 per day** (s167, sharpened by the 2026-07-25 prompt "1 correction +
  1 umformen counts as 1"), plus the 3 phrasings per target form the "Nochmal" cycle is capped at
  (`transform-sentence` clamps `variant` to 0..2). So the first a learner heard of any limit was
  "komm morgen wieder". Both counts are now on screen.
  **Daily allowance.** `Heute noch 7 von 10` sits beside the button that spends it: Fokus under the
  Korrigieren row on both breakpoints, Kurz/Lang under the umlaut keys sharing ONE line with the
  transient "Noch N Wörter" hint (hint left, allowance right), so the locked mobile caption slot keeps
  its Art. 50 note. The number is the server's: `check-sentence` and `evaluate-writing` now return
  `dailyLimit`/`dailyRemaining` on every response (success, cache hit and limit-reached alike), which
  means a limit the founder raises via a Supabase secret shows up in the UI by itself. Before the
  first call of the day `src/lib/aiAllowance.ts` counts the learner's own rows over the SAME tables
  and the SAME UTC day boundary the functions count (`sentence_checks`; `writing_evaluations` filtered
  by `length`, both select-own under RLS). Unknown (signed out, offline, query failed) renders NO
  number rather than a guess. A Kurz/Lang cache hit is free and correctly does not move the counter,
  while a Fokus cache hit does, because it still writes the row the limit counts.
  **Nochmal.** `2 von 3 übrig` on the button: the NEW phrasings still available for the CURRENT target
  form. Cycling back to an already-generated one is cached and free, so it does not count down, and a
  different target form starts a fresh 3; at 0 the button still works and its tooltip stops promising
  something new. Wording note: "noch 2 von 3" collided with the button's own "Nochmal", so the counter
  reads "übrig" instead of a "2/3" that could be read as "showing 2 of 3".
  **No founder action:** `supabase.yml` deploys both Edge Functions on merge to `main`, and until that
  run lands the UI falls back to the row count, which is already correct.
  Gates: typecheck · lint 0 errors · test:unit **396/396** (two new suites) · build · check:bundle
  123.2 kB.
- **Artifacts (prompt 5):** `src/lib/aiAllowance.ts` (new) · `src/features/writing/AllowanceNote.tsx`
  (new) · `src/features/writing/fokus/useFokusMachine.ts` · `src/features/writing/fokus/FokusTrainer.tsx` ·
  `src/features/writing/GuidedWritingTrainer.tsx` · `src/lib/sentenceStudio.ts` · `src/lib/writing.ts` ·
  `supabase/functions/check-sentence/index.ts` · `supabase/functions/evaluate-writing/index.ts` ·
  `tests/aiAllowance.test.ts` (new) · `tests/fokusVariants.test.tsx` (new) · `docs/areas/SCHREIBEN.md` ·
  `docs/PROJECT_STATUS.md` · this log

- **Prompt 6 (verbatim, 2026-07-31, Kurz result screenshot attached):** `here, there are couple of
  things to take note:` / `1. Not all the corrections chips are visible here. It says +6 but there's no
  way to expand upon it and see all the chips` / `2. Take a note of how the AI gives the feedback, the
  vocabulary used is way too advanced. It should be able to understand what is the user level and
  respond either matching the user's german level or lower levels like A2. Because the goal is to
  communicate clearly to german learners by keeping the instructions very very clear,and with an
  english toggle button even for this section. This applies to all other schreiben sections.`
- **Prompt 7 (verbatim, 2026-07-31, mid-turn, Kurz editor screenshot attached):** `when I pressed
  shuffle or looking for a new task, the text I initially wrote is still in the field - ideally it
  should be gone. Fix this too`
- **Branch:** `claude/ui-layout-buttons-cards-zkchha`
- **Response summary:**
  **(1) The "+6 weitere" dead end.** The cap (`MAX_FIX_TILES` = 6) exists so a long text cannot wall
  off the card, but the tail had no way back. It is a toggle now: press it and every correction shows,
  press "Weniger" and it folds. The cap only decides what the card OPENS with; no correction is hidden
  for good. New case in `tests/correction.test.tsx`.
  **(2) The feedback was written for a linguist.** Grading level and EXPLAINING level are two
  different things, and only the first was ever specified: the rubric graded at the task's CEFR band
  while the tip inherited whatever register the model felt like. Both prompts now demand the prose in
  simple A2 German (short main sentences, everyday words, a concrete example from the learner's own
  text) with an explicit ban on the jargon the founder saw ("Aufgabenerfüllung", "Inhaltspunkt",
  "Adressat", "Anredeform", "Konnektor", "Umformulierung", "Kohärenz", "Register"), PLUS the same
  sentence in equally simple English. Both caches were invalidated (`PROMPT_REV` s171.0 -> s179.0,
  `PROMPT_VERSION` 4 -> 5), or the old advanced prose would keep being served. The hand-written
  templated spelling verdict was rewritten to the same standard, and the jargon line sitting directly
  under the tip ("Alle Inhaltspunkte abdecken, den Adressaten und die Länge treffen") became plain
  German, since a simple tip framed by jargon is still jargon.
  **The English switch** is `FeedbackLang.tsx`, on the Kurz/Lang Tipp, every Verlauf row and the Fokus
  Hinweis. Deliberately STICKY rather than the app's hold-to-peek `EnPeek`: a tip is a paragraph of
  instruction, not a one-line gloss, and nobody reads a paragraph with a finger held down. `EnPeek`
  stays the pattern for LEARNING content (word cards, Grammatik lessons), so the two do not merge; the
  label flips EN/DE to say which language the press switches to. Fokus gave up its `EnPeek` for it, so
  one behaviour covers all AI feedback in Schreiben.
  **(3) Shuffle now clears the editor**, reversing the older "keeps typed text, a mis-tap must not
  destroy work" rule on the founder's instruction. The rail reset and the scope-change redraw already
  cleared, so all three paths agree now.
  **One founder action:** migration `0014_writing_insight_en.sql` (one `add column if not exists`)
  stores the English tip so Verlauf keeps it. CI deploys functions but skips migrations, so it is a
  paste into the SQL editor. Everything degrades gracefully until then: the read and the write both
  step down through the optional column and the chip simply does not render.
  Gates: typecheck · lint 0 errors · test:unit **398/398** · lint:content clean · build ·
  check:bundle 123.2 kB.
- **Artifacts (prompts 6-7):** `src/features/writing/correction.tsx` ·
  `src/features/writing/FeedbackLang.tsx` (new) · `src/features/writing/GuidedWritingTrainer.tsx` ·
  `src/features/writing/WritingHistory.tsx` · `src/features/writing/fokus/FokusTrainer.tsx` ·
  `src/lib/writing.ts` · `src/data/practiceAreas.ts` ·
  `supabase/functions/evaluate-writing/index.ts` · `supabase/functions/transform-sentence/index.ts` ·
  `supabase/migrations/0014_writing_insight_en.sql` (new) · `tests/feedbackLang.test.tsx` (new) ·
  `tests/correction.test.tsx` · `docs/areas/SCHREIBEN.md` · `docs/PROJECT_STATUS.md` · this log

- **Prompt 8 (verbatim, 2026-07-31):** `can you apply the migration in supabase yourself? I remember
  we setup something for this earlier`
- **Prompt 9 (verbatim, 2026-07-31):** `I did the option b setup`
- **Prompt 10 (verbatim, 2026-07-31, mid-turn):** `rename all the queries properly on supabase`
- **Branch:** `claude/ui-layout-buttons-cards-zkchha`
- **Response summary:** Half right: the pipeline from s167 deploys every Edge Function on merge and
  has always had a migration step, but that step was gated on `SUPABASE_DB_PASSWORD`, which was
  deliberately unset. Confirmed against the live run for `20df861` (functions deployed, migrations
  skipped). Offered (A) paste the one line, or (B) add the secret once and never paste SQL again; the
  founder chose B.
  **The first real `db push` then failed, and the failure was the valuable part.** The remote had
  **no migration history at all**: every migration to date was pasted into the SQL editor by hand,
  which never writes to `supabase_migrations`, so the CLI tried to replay 0001 against a database
  that already had everything and died on "policy profiles_select_own already exists". Because
  migrations run before functions, the function deploy was skipped with it.
  **Nothing was repaired on trust.** A repair marks a version applied and its SQL is then skipped
  FOREVER, so a dispatch-only **schema probe** (Management API query endpoint) was added first: it
  printed the live tables, the `progress`/`writing_evaluations` columns, every public function and
  every RLS policy. That proved 0001-0004, 0006-0009 and 0011-0013 were genuinely present, **and it
  found a hole nobody knew about: migration 0010 had never been applied.** No `gdpr_events` table, no
  `log_gdpr_event`, no `admin_gdpr_evidence`, so the GDPR evidence counters on the Launch screen had
  no store behind them.
  **The bridge, once:** `repair_applied` marked the eleven verified versions; `db push --include-all`
  then applied the three unrecorded ones (0005, idempotent and therefore a safe no-op either way;
  0010, genuinely missing; 0014, the new one). `--include-all` is permanent now, because a repaired
  history legitimately leaves an older file unrecorded below a newer applied one.
  **Verified after:** `migration list` reports Local = Remote for all 14 versions, and the probe shows
  `writing_evaluations.insight_en` and `gdpr_events` both present. From now on a merge to `main`
  applies pending migrations and then deploys the functions; the founder pastes nothing.
  Prompt 10 ("rename all the queries") was NOT actioned: it is ambiguous between the SQL-editor
  snippets in the dashboard (which the public Management API cannot rename, only list) and the
  migration files (already named), so it was put back to the founder rather than guessed at.
- **Artifacts (prompts 8-10):** `.github/workflows/supabase.yml` (schema probe, migration-status,
  history repair, `--include-all`) · `CLAUDE.md` · `docs/PROJECT_STATUS.md` · this log ·
  workflow runs 30656541869 (the diagnostic failure), 30657503526 (the push), 30657663298
  (verification)

- **Prompt 11 (verbatim, 2026-07-31, repeated):** `rename all the queries properly on supabase`
- **Branch:** `claude/ui-layout-buttons-cards-zkchha`
- **Response summary:** Asked once what "queries" meant (dashboard SQL-Editor snippets vs database
  objects vs migration filenames); the founder repeated the instruction verbatim instead, so the
  most likely reading was taken and TESTED rather than assumed: the saved queries in the dashboard
  SQL Editor, twelve of them, most still called "Untitled query" from pasting migrations by hand.
  **The answer is that they cannot be renamed from outside the dashboard.** The Management API
  exposes `GET /v1/snippets` and `GET /v1/snippets/{id}` and nothing more: a PATCH against all twelve
  returned `404 Cannot PATCH /v1/snippets/{id}`. Nothing was changed (a 404 is a no-op), and the
  workflow now records the finding so nobody re-tests it. What it CAN do is print the inventory (id,
  current name, first meaningful line of SQL), which is what makes renaming them by hand quick; the
  mapping of all twelve to what each one actually did went to the founder in chat.
  They are historical objects either way: migrations now live in `supabase/migrations` and apply
  themselves on merge, so deleting them is as valid as renaming them.
  **Two flakes caught in passing, both now handled:** `api.supabase.com` served a Cloudflare 502 HTML
  page mid-session (jq reported it as a parse error, which read as a broken script) so every
  Management API read checks its status and retries; and `esm.sh` returned 522 while bundling
  `delete-account`, failing an entire function deploy, so each deploy retries three times.
- **Artifacts (prompt 11):** `.github/workflows/supabase.yml` · this log · workflow runs 30658732751
  (inventory) and 30658934894 (the PATCH attempt that proved renaming is dashboard-only)

- **Prompt 12 (verbatim, 2026-07-31):** `is there any action left in this session?`
- **Response summary:** Verified rather than recalled: working tree clean, branch identical to `main`,
  no open PRs, seven PRs squash-merged (#760-#765, #767), and the Supabase state re-checked live (all
  14 migrations recorded both sides, `insight_en` and `gdpr_events` present). Confirmed the docs
  survived the collision with session 180: parts 1-3 of this session's handoff were archived into
  `PROJECT_STATUS_ARCHIVE_2026-W31.md` by that session, not lost. Nothing left on my side; the three
  open founder items (Resend SMTP, optional LanguageTool key, Google branding review) all predate this
  session. Flagged two optional follow-ups: renaming/deleting the twelve dashboard SQL snippets, and
  reverting the Redemittel card height if the uniform grid reads too airy.

- **Prompt 13 (verbatim, 2026-07-31):** `document the session`
- **Response summary:** Closing pass. The per-prompt entries above were written as each piece landed,
  so this pass went after what the session made STALE rather than re-narrating it:
  **`docs/DECISIONS.md` had no s179 section at all** and it was the doc most owed one, since three of
  this session's changes REVERSE earlier rules and one is an explicit exception to a standing law.
  Ten entries added, the load-bearing ones being: a transparent sticky row obliges every control in it
  to carry a full-alpha fill (the "illegible buttons" round is what that rule costs when skipped);
  clearance under a sticky header belongs in the offset, never in padding; a card grid has ONE height,
  which makes the tallest card everyone's problem; a cap is a starting view, never a dead end; grading
  level and EXPLAINING level are different things, and a prompt-wording change is a cache
  invalidation; the sticky DE/EN switch is a deliberate exception to "EnPeek, never sticky" (s93),
  scoped to feedback prose and kept visually distinct; Shuffle now clears the editor; a limit that is
  only enforced is a trap; and never repair a migration history on trust, since the evidence pass is
  what found 0010 missing from production.
  **`docs/plans/PHASE2_SETUP.md` still told the founder to paste SQL by hand** in three places,
  including the CLI section's "the supported route for a single new migration". Rewritten: the CLI is
  not needed at all, the per-migration paste instructions are explicitly marked HISTORY (how 0001-0013
  were applied, not what to do now), `SUPABASE_DB_PASSWORD` is recorded as set, and the hand-pasted
  history note is replaced by what actually happened when it was bridged.
  `docs/DECISIONS.md` §s171 item 12 also still said "CI skips migrations" as a present-tense fact;
  corrected to the real reason the insert steps down (a deploy still lands before its migration inside
  the same run) and extended to the new `insight_en` tier.
  Gates: lint:content clean · typecheck (docs-only otherwise).
- **Artifacts (prompts 12-13):** `docs/DECISIONS.md` (new §s179, §s171 item 12 corrected) ·
  `docs/plans/PHASE2_SETUP.md` · this log

- **Prompt 14 (verbatim, 2026-07-31):** `as long as nothing is missing from this session and
  everything is updated, we're done here.`
- **Response summary:** Final audit rather than a sign-off, since three sessions (180, 181, 182) had
  edited the same docs after this one. It found ONE genuine defect, in the file whose whole purpose is
  the paper trail: **there was no `## Session 179` heading**, so all 13 prompts of this session were
  filed under session 178's branch. Heading added; the 13 entries now sit under
  `claude/ui-layout-buttons-cards-zkchha` where they belong. Everything else verified present on
  `main` after the later sessions: `docs/DECISIONS.md` §s179 (10 entries, between s174 and s180), the
  `auto-rows-fr` + full-alpha-toolbar rules in `areas/BIBLIOTHEK.md`, the allowance/DE-EN/Nochmal
  rules in `areas/SCHREIBEN.md`, the migrations-are-automatic law in `CLAUDE.md`, and this session's
  part-4 handoff archived into `PROJECT_STATUS_ARCHIVE_2026-W31.md` by session 182 (not lost).
- **Artifacts (prompt 14):** this log

## Session 180 — 2026-07-31 — branch `claude/aufgabe-rail-bugs-1xdep2`

- **Prompt 1 (verbatim, 2026-07-31, three Schreiben Lang screenshots attached: "Alle Niveaus /
  Textsorte Forumsbeitrag" over a Beschwerde an eine Fluggesellschaft, and twice "B2 / Forumsbeitrag"
  over a Bericht):** `there's an issue with the aufgabe rail. I selected forumsbeitrag but the aufgabe
  doesn't relate to it. Do a thorough analysis and find all the bugs and necessary improvements with
  schreiben section's aufgabe feature.`
  **Response:** the report is real and the cause is one line of policy, not a slip. `eligibleTasks`
  narrowed Niveau and Textsorte with the Branche rule (prefer tagged, else untagged, else keep
  everything). 373 of the 643 tasks carry no `format`, so on every theme without a tagged task the
  fallback swallowed the filter. Measured on the shipped bank before the fix: "Alle Themen +
  Forumsbeitrag" drew from 85 tasks of which 71 were not Forumsbeiträge (84%), which is screenshot 1;
  adding B2 gave 50 of which 42 were wrong, which is screenshots 2 and 3. Every Textsorte was wrong
  between 66% and 100% of the time, while the rail printed the honest count (14) beside the option,
  because the rail counted with `countExact` and the trainer drew with the fallback. That is the same
  rail-vs-engine disagreement s167 fixed for Branche, reintroduced on the next axis.
  **The fix:** both axes filter HARD; filter order is Unterthema → Niveau → Textsorte → Branche (the
  soft axis last, so a preference cannot hide the only task matching a hard filter, and Branche still
  cannot empty a pool); `countExact` is deleted, so the rail count and the draw pool are one number;
  every dropdown greys its zero-yield options and keeps the count visible on them.
  **The consequence, handled rather than papered over:** a scope CAN now be empty. Inside the rail
  greying prevents it; a Kurz/Lang switch carrying a length-specific Textsorte and a stale deep link
  cannot be prevented, so those get an honest empty state naming the culprit ("Forumsbeitrag gibt es
  nur bei Lang.") and the one-tap escape `blockingAxis` picks. `randomTask` returns null for an empty
  list instead of the first task of the first theme, which was the bug in miniature.
  **The thorough pass found seven more.** (a) `bewerbung` was a dropdown option with 0 tasks at either
  length, dead since s167: the Textsorte list is derived from the bank now. (b) The option labelled
  "B2" matched the tag `B2.1` exactly, so the first `B2.2` task would have been silently unreachable;
  matching goes through `levelBand`, and old `?level=B2.1` links normalize. (c) The C1 option was
  labelled "C1.1", a band `lib/cefr.ts` does not have. (d) "Ziel 150–188 Wörter" printed `words x 1.25`
  raw; the upper bound rounds up to a full ten. (e) The card never named the Niveau, so under "Alle
  Niveaus" nothing said whether the Aufgabe was B1 or C1; the meta line is "B2 · Bericht · Ziel
  150–190 Wörter" now. (f) Every scope change pushed a history entry, so the phone back gesture undid
  filter taps one by one; scope changes replace, like the ViewSwitcher, and Fokus/Verlauf now drop
  `?level`/`?format` like they already dropped theme/sub/sector. (g) Signing in from the login wall
  with email and password LOST the draft: `initialText` is read once on mount and that path does not
  remount the trainer, so only the Google redirect restored it; and the hub wrote `?theme=` to carry
  the Aufgabe back, which pinned an "Alle Themen" learner to one Thema and fired the scope-change
  effect that clears the draft. The resume remounts the trainer and passes the theme as a prop.
  **Reported, not fixed (founder's call):** 373 of 643 tasks carry no `level`/`format`/`points`, so
  the default scope draws a bare one-line legacy Aufgabe 58% of the time and those degrade the AI to
  language-only feedback. Either tag the bank in waves or make the default draw prefer structured
  tasks; halving the reachable bank by default is a product decision, not a bug fix.
  Gates: typecheck · lint 0 errors · test:unit **407/407** · lint:content clean · build ·
  check:bundle 123.2 kB.
- **Artifacts (prompt 1):** `src/lib/writingScope.ts` · `src/features/writing/WritingRail.tsx` ·
  `src/features/writing/GuidedWritingTrainer.tsx` · `src/features/writing/WritingHub.tsx` ·
  `tests/writingScope.test.ts` · `tests/writingAufgabe.test.tsx` (new) · `docs/areas/SCHREIBEN.md` ·
  `docs/areas/CONTENT.md` · `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` · this log

- **Prompt 2 (verbatim, 2026-07-31):** `you need to explain to me briefly in plain language of the
  following task:` [quoting the "not fixed, founder's call" paragraph from the prompt-1 answer]
  **Response:** plain-language explanation of the two generations of writing task (270 exam-shaped
  vs 373 one-liners), why a bare one matters beyond looks (the AI is sent the Aufgabe so it can grade
  Aufgabenerfüllung; with no Leitpunkte the feedback silently drops to grammar and vocabulary), and
  the two options: upgrade the 373 in content waves, or serve only the 270. Recommended the second
  now with the first as the standing backlog, on the argument that at the Kurz 4 / Lang 2 allowance
  270 tasks is about two months of daily practice before anything repeats, so the smaller pool costs
  the learner nothing real while every session gets better feedback.
- **Prompt 3 (verbatim, 2026-07-31):** `continue with your recommendation`
- **Prompt 4 (verbatim, 2026-07-31, mid-turn, screenshot of `wt_safety_l12` attached: "Verfasse eine
  kurze Unterweisung für neue Mitarbeitende ...", one sentence, no Adressat, no Leitpunkte, no
  Niveau):** `this one has too little description of the task. Check for such instances and make sure
  they're well described`
  **Response:** the screenshot is one of the 373, and the change already in flight retires it. Only a
  task with Inhaltspunkte is served now (`isServable`); the full shape is instruction + Adressat +
  du/Sie + 2 to 5 Leitpunkte + Niveau + Textsorte + word target, and all 270 served tasks carry every
  field (checked: 0 exceptions). **Retired from the draw, never from the bank:** the 373 keep their
  permanent ids AND their pool positions, because a draft ref is `{theme, index}` and a Verlauf row is
  a task id, so old work still resolves; each returns the moment it is authored up to the full shape.
  `sub` became a hard filter in the same change: retiring the bare tasks empties 15 of the 46
  Unterthemen at each length, and the old fall-back-to-the-whole-Thema would have started firing in
  earnest, which is the substitution bug this session exists to remove.
  The rail's remaining zeros are deliberately visible, because they ARE the authoring to-do list:
  `bewerbung` (no task anywhere), 15 of 46 Unterthemen per length, `bericht` at C1 (one task). Every
  Thema and every Branche still yields tasks at both lengths (135 short + 135 long).
  Gates: typecheck · lint 0 errors · test:unit **410/410** · lint:content clean · build ·
  check:bundle 123.2 kB. Verified in headless Chromium: default draws on Kurz and Lang both render a
  full brief.
- **Artifacts (prompts 2-4):** `src/lib/writingScope.ts` · `src/data/writingPrompts.ts` (header
  contract only, no content changed) · `tests/writingScope.test.ts` · `tests/writingAufgabe.test.tsx` ·
  `docs/areas/SCHREIBEN.md` · `docs/areas/CONTENT.md` · `docs/DECISIONS.md` ·
  `docs/PROJECT_STATUS.md` · this log
- **Prompt 5 (verbatim, 2026-07-31):** `document the session and merge to main`
  **Response:** both code changes were already merged under the standing auto-ship rule (PR **#766**
  the filter fix, PR **#768** the fully-briefed-Aufgaben rule), each squash-merged with
  `Validate content` and `Deploy site to GitHub Pages` green on the merge commit (`3cc7d47`,
  `20bf593`). This prompt closed the documentation pass: **`CLAUDE.md`** gained the cross-cutting
  invariant the session established, "a filter filters, it never substitutes" (the hard/soft axis
  split, one counting function, honest zeros, empty state over substitution) plus the founder law
  that only a fully briefed task is served; **`docs/PROJECT_STATUS.md`** had its bank line corrected
  (643 authored, **270 served**) and the handoff finished with the PR numbers, the deploy result and
  the authoring list a next session would start from. Post-merge housekeeping ran after each merge
  (`fetch` → `reset --hard origin/main` → `push --force-with-lease`), and `origin/main` was merged
  into the branch twice mid-session as #765 and #767 landed, so nothing was written against a stale
  base.
- **Artifacts (prompt 5):** `CLAUDE.md` · `docs/PROJECT_STATUS.md` · this log

## Session 181 (2026-07-31) - branch `claude/latest-plan-steps-ydumbt`

- **Prompt 1 (verbatim, 2026-07-31):** `what's steps are to do in the latest plan?`
  **Response:** read the plan set and answered with the open items rather than a summary of finished
  work. The latest plan with anything left in it is `docs/plans/SCHREIBEN-OVERHAUL.md`: P0/P1/P2 and
  content wave 2 shipped in s167, leaving **wave 3** (Alltag formal apparatus, plus the per-genre
  Branche decision), **wave 4** (the five Beruf Themen without Branche variants, and B1 breadth),
  **P0 item 3** (obtain the Goethe/telc/BAMF source PDFs) and the **§12 verification items** (seven
  exam facts that may not be hard-coded from secondary sources). On top of it sits the s180 handoff's
  authoring backlog, which the "only fully briefed Aufgaben are served" decision made visible as the
  greyed zeros in the Aufgabe rail: `bewerbung` at zero everywhere, 15 of 46 Unterthemen empty at each
  length, `bericht` at C1 with one task.
- **Artifacts (prompt 1):** none (question answered from the repo)
- **Prompt 2 (verbatim, 2026-07-31):** `complete the full implementation of both these plans`
  **Follow-up in the same turn (verbatim):** `ask me questions if unclear on any important points`
  **Response:** measured the bank first (643 tasks, 270 servable, 373 bare; 30 of 92 Unterthema x
  Länge cells empty; 13 Niveau x Textsorte cells empty; `project`/`sustainability`/`travel` with no
  Branche variants at all), then asked three questions the plans genuinely left open and built to the
  answers: **Niveau mix** → B1-heavy, then B2, thin C1; **where `bewerbung` lives** → under Bildung,
  both sub-themes; **Alltag Branche** → tag every Alltag task (against the plan's own recommendation,
  so each tag was made to earn its place: the work context is the REASON the everyday task is hard,
  Schichtdienst gegen Behörden-Öffnungszeiten and so on, never a name-drop).
  Delivered waves 3 and 4 and the whole rail backlog in one pass: **all 373 bare tasks authored up to
  the exam shape in place** (same ids, same pool positions, so drafts and Verlauf still resolve),
  **74 new tasks**, **60 existing tasks tagged**, bank **643 → 717, every task servable**. Coverage
  now gated in `tests/writingScope.test.ts`: ≥2 tasks per Unterthema per length, all 15 Branchen on
  all 10 Beruf Themen AND all 10 Alltag Themen at both lengths, all 16 Textsorten live (`bewerbung`
  included). Niveau landed B1 307 / B2 302 / C1 108; the B1 share sits above the 35% target because
  Kurz tasks are genuinely B1 and were not retagged to hit a number. One deliberate zero remains,
  C1 + E-Mail (privat), which has no exam analogue. **Not done, and reported rather than worked
  around:** §12 and P0.3 need primary exam documents that cannot be acquired from a session, and telc
  material may not be copied at all under `strategy/DATA_GOVERNANCE.md`.
  Gates: typecheck · lint:content clean · test:unit **413/413** · build · check:bundle 123.2 kB.
- **Artifacts (prompt 2):** `src/data/writingPrompts.ts` (717 tasks) · `src/lib/writingScope.ts`
  (docstring) · `tests/writingScope.test.ts` · `CLAUDE.md` · `docs/areas/CONTENT.md` ·
  `docs/areas/SCHREIBEN.md` · `docs/plans/SCHREIBEN-OVERHAUL.md` · `docs/PROJECT_STATUS.md` · this log
- **Prompt 3 (verbatim, 2026-07-31):** `is everything done?`
  **Response:** confirmed done and live (PR **#770** squash-merged, `Validate content` and `Deploy
  site to GitHub Pages` both green on `6253ee7`), and restated the two things that are NOT done and
  why: the plan's §12 exam-verification items and P0.3 need primary exam documents no session can
  acquire (telc material may not be copied at all), and the Niveau mix landed B1 307 / B2 302 /
  C1 108 against a 35/50/15 target because the surplus is Kurz tasks that genuinely are B1 and were
  not retagged to hit a number.
- **Artifacts (prompt 3):** none (status answer)
- **Prompt 4 (verbatim, 2026-07-31):** `In schreiben, there seems to be some topics in the themen
  dropdown which are non-beruf but are not part of alltag - fix it. There has to be only two
  overarching categories similar to the nodal graphs in bibliothek. This has to be consistent across
  the app`
  **Response:** correct report. The Schreiben rail folded `gesundheit` into Alltag but not `bildung`,
  so "Bildung & Sprache" sat there as a third heading; the Bibliothek Thema dropdown grouped by the
  raw five domains (up to five headings); and only the graphs were already binary, under a different
  name ("Privatleben"). Three surfaces, three different answers.
  Introduced **`src/lib/lifeAreas.ts` as the ONE app-wide fold**: two areas, `beruf` is Berufsleben
  and every other domain is Alltag, with `themeGroupsByArea` as the single grouped-options builder.
  The Schreiben rail, `themeGroupsForMode` (Bibliothek Wörter + Kollokationen) and both graph legends
  now read from it; `graphPalette.ts` keeps only the colors and re-exports the areas. Asked the
  founder which naming wins, since the graphs and the dropdowns disagreed: **Berufsleben / Alltag**
  (their pick), so the graph legend's "Privatleben" is retired.
  The Mode lens still narrows WITHIN the two groups rather than adding headings, and the s104 rule
  that an actively selected theme never gets orphaned is kept. `tests/lifeAreas.test.ts` (6 tests)
  pins the law: two areas, every domain except `beruf` folds to Alltag, no dropdown returns a third
  group in any mode, and the Mode lens still filters.
  Verified in headless Chromium against the built app, not just the unit tests: the Schreiben Thema
  dropdown shows BERUFSLEBEN and ALLTAG, the Bibliothek dropdown the same two, and the Wörter graph
  legend now reads "Berufsleben · Alltag".
  Gates: typecheck · lint 0 errors · lint:content clean · test:unit **419/419** · build ·
  check:bundle 123.2 kB.
- **Artifacts (prompt 4):** `src/lib/lifeAreas.ts` (new) · `src/lib/themeGroups.ts` ·
  `src/lib/graphPalette.ts` · `src/features/writing/WritingRail.tsx` · `tests/lifeAreas.test.ts`
  (new) · `CLAUDE.md` · `docs/areas/BIBLIOTHEK.md` · `docs/areas/SCHREIBEN.md` ·
  `.claude/skills/design/SKILL.md` · `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` · this log
- **Prompt 5 (verbatim, 2026-07-31):** `keep the Niveau mix as it is but I want you to do a thorough
  analysis of the quality of these tasks and how they go with the filter - do the required research
  from reliable sources - this is one of the next todos for later so don't do it now, just document
  the session. park the exam source items with official documents task for later - it's not that
  important.`
  **Response:** documentation only, no analysis and no code (the founder explicitly deferred the
  audit). Three things recorded where a later session will actually find them:
  **(1) The Niveau mix is now a settled decision, not a deviation.** B1 307 / B2 302 / C1 108 is
  intended; the 35/50/15 target is retired and `docs/DECISIONS.md` says not to rebalance it. The rule
  that survives: promotion between bands follows what a task demands, never a distribution target.
  **(2) The quality + filter-fit audit is QUEUED with scope**, in `docs/PROJECT_REFERENCE.md`, so the
  next session does not have to re-derive it: Niveau accuracy, Leitpunkte answerability inside the
  word target, whether a task delivers what its Textsorte/Niveau/Unterthema/Branche tags promise,
  Branche honesty under the s181 Alltag rule, near-duplicate scenarios across waves, and du/Sie
  plausibility. It also names the sources that ARE usable now that the exam documents are parked
  (CEFR descriptors cited never reproduced, publicly published task-type descriptions, open corpora)
  and repeats the `strategy/DATA_GOVERNANCE.md` telc ban, so the next session does not walk into
  s167's dead end. Deliverable shape: a `docs/reports/` audit with a prioritised fix list, like s178.
  **(3) The exam-source items are marked PARKED, not blocked-and-waiting**, in the plan itself
  (§12 + P0 item 3 + the status header) and in the reference backlog, with the note that unparking
  needs a founder purchase rather than engineering, and that the quality audit does NOT depend on it.
  Also recorded the framing that matters for next time: s181 proved COVERAGE and gated it in tests;
  QUALITY is unproven, so a B1 tag on a task that reads as B2 is now a content bug, not a
  distribution one.
  Gates: docs-only (no code touched).
- **Artifacts (prompt 5):** `docs/PROJECT_REFERENCE.md` · `docs/PROJECT_STATUS.md` ·
  `docs/DECISIONS.md` · `docs/plans/SCHREIBEN-OVERHAUL.md` · this log

## Session 182 (2026-08-01) - branch `claude/next-steps-p3-analysis-7gx36m`

- **Prompt 1 (verbatim, 2026-08-01):** `i remember we did an analysis recently.. and did complete
  until p3 tasks. what are the next steps`
  **Response:** identified the analysis as the content audit
  (`docs/reports/CONTENT_AUDIT_2026-07-30.md`, session 178) and corrected the premise from the repo
  rather than accepting it: P0, P1 and P2 shipped in s178, P8 was closed by the s181 Schreiben work,
  P9 only half (the duplicates), and **P3 was started but not finished** (the six C1 texts at
  305-344 words; the rest of the bank is still ~90 words and listening is still 6 TTS voicemails).
  Verified the open items against the code instead of quoting the audit: `themeId` on **0 of 158**
  Redemittel, `/anwenden` still unlinked in `nav-items.ts`, no `audio` field on any text, 13 verified
  provenance rows. Recommended P6 first (cheapest real win, and it serves the half of the product the
  s21 repositioning made core), then P4 with a founder decision on the nav, then P5.
- **Artifacts (prompt 1):** none (question answered from the repo)
- **Prompt 2 (verbatim, 2026-08-01):** `continue with p6`
  **Response:** closed audit P6. Loaded `/content` first, then `/design` before the one UI change.
  **The gap:** every one of the 158 phrases was a workplace discussion function or a workplace
  channel, and `themeId` sat on zero of them, so the composer's mode filter was dead code and the
  Alltag half of the app had no phrase bank at all.
  **Shipped:** 62 new phrases in five packs (Amt 13, Arzt 13, Wohnen 13, Bank 11,
  Einkauf/Reklamation 12), each with note, example pair, CEFR and themeId, Widerspruch and
  Mängelanzeige formulas included, several carrying the s181 work-context reason. Three new
  categories (`appointments`, `formalities`, `complaints`) mirrored in all three closed-enum places.
  **The judgement call, reported rather than buried:** the audit said "tag the 158"; blanket tagging
  would make a sticker of every discussion function, so **49 situational phrases were tagged** and
  the other 109 stay **untagged = universal**, the same semantics Branche already uses. Wired the tag
  into the two places it earns its keep: a Thema scope dropdown on the Redemittel tab (`?theme=`,
  dedicated-content counts, zero-count Themen still selectable) and a theme-led Pool 4 in the session
  composer. Verified in the built app with headless Chromium: Thema = Behörde & Ämter yields 122
  Wendungen (13 dedicated + 109 universal) and the presentation openers are gone.
  Gates: typecheck · lint 0 errors · lint:content clean (220 redemittel, 3,370 provenance rows) ·
  test:unit **435/435** · build · check:bundle 123.2 kB · report:exercise-coverage 20/20 ·
  build:review-queue refreshed. `verify:grammar` could not run in the sandbox (LanguageTool needs
  `mvn` + Maven Central); it is warn-only, and this is stated rather than skipped silently.
- **Artifacts (prompt 2):** `src/data/redemittel.ts` · `src/data/provenance.ts` (62 rows) ·
  `src/types/index.ts` · `scripts/lint-content.mjs` · `src/lib/facets.ts` (`matchesThemeScope`) ·
  `src/lib/icons.ts` · `src/engine/session.ts` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `tests/redemittel.test.ts` (new, 16 tests) · `docs/areas/CONTENT.md` · `docs/areas/BIBLIOTHEK.md` ·
  `docs/areas/SESSION.md` · `docs/reports/CONTENT_AUDIT_2026-07-30.md` · `docs/PROJECT_STATUS.md` ·
  `src/features/admin/reviewQueue.json` · `docs/reports/exercise-coverage-report.md` · this log
- **Prompt 3 (verbatim, 2026-08-01):** `keep the categories filter as pills and go ahead with p4 and
  then p5`
  **Response:** left the Kategorie facet as pills (no change) and closed the two named audit items.
  **P4.** Measured first: 20 of 30 scenarios (every Alltag one) had NO free-speak node, so the
  speaking trainer only ever offered multiple choice, which is recognition. Authored a free-speak
  node with a model answer and two hints into all 20, spliced between the last choice node and the
  closing turn so it lies on every path, each one a situation the dialogue earns (report the Amt
  visit to your employer, call in sick after the doctor, relay the hotline's answer). Restored
  `/anwenden` to `navItems`, which puts Sprechen and Prüfung back on the desktop sidebar; did NOT
  touch the mobile bottom bar, whose five slots CLAUDE.md locks, and flagged that placement as the
  open founder decision. `tests/scenarios.test.ts` (32 tests) walks every branch of every scenario.
  **P5.** The B1 accuracy canon was absent: Adjektivdeklination, Perfekt vs. Präteritum, Verben mit
  Präpositionen, Komparativ/Superlativ shipped with full German-first lessons and 10 drills each,
  under a new `tenses` group ("Zeitformen") plus two group relabels that had been named after one
  member each. Then the monoculture: 131 of 137 drills were MCQ, so 18 productive (typed-answer)
  drills went into the six B1 topics that had none. Bank 28 topics/137 drills → **32/195**,
  productive 4% → 19%. `tests/grammar.test.ts` (24 tests) pins the canon, the ≥3-productive rule per
  B1 topic, the group registry and drill-id uniqueness.
  **One infrastructure fix on the way:** the 62 new provenance rows pushed `provenancePart2` past
  TypeScript's TS2590 union ceiling and `pnpm build` failed; provenance is four concatenated parts
  now (~1,300 rows each) and the `/content` skill records the rule.
  Reported honestly as NOT done: only 2 of 30 scenarios are level 3, and the 21 B2/C1 grammar topics
  keep their 5-drill MCQ-only cap.
  Gates: typecheck · lint 0 errors · lint:content clean · test:unit **491/491** · build ·
  check:bundle 123.3 kB · report:exercise-coverage 20/20 · build:review-queue refreshed. Verified in
  the built app with headless Chromium: the free-speak turn renders and grades, the Grammatik hub
  shows 32 topics under the new group labels, a typed drill is accepted.
- **Artifacts (prompt 3):** `src/data/dialogues.ts` (20 free-speak nodes) · `src/data/grammar.ts`
  (4 topics, 58 drills) · `src/data/provenance.ts` (62 rows + the part-3/part-4 split) ·
  `src/types/index.ts` · `scripts/lint-content.mjs` · `src/features/grammar/grammarMeta.ts` ·
  `src/components/layout/nav-items.ts` · `tests/scenarios.test.ts` (new) · `tests/grammar.test.ts`
  (new) · `.claude/skills/content/SKILL.md` · `CLAUDE.md` · `docs/areas/CONTENT.md` ·
  `docs/areas/BIBLIOTHEK.md` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/reports/CONTENT_AUDIT_2026-07-30.md` · `docs/PROJECT_STATUS.md` · this log
- **Prompt 4 (verbatim, 2026-08-01):** `document the session`
  **Response:** completed the session record. The per-prompt entries above and both s182 handoffs in
  `PROJECT_STATUS.md` were written as the work went, so what was missing was the SHIPPED half, which
  only existed after the merges: **PR #773 → `5b30acc`** (P6) and **PR #774 → `45ba695`** (P4 + P5),
  both squash-merged with `Validate content` and `Deploy site to GitHub Pages` green, post-merge
  housekeeping done both times (branch reset onto `main`, force-with-lease, clean tree). Also
  recorded the mid-session merge conflict and how it was resolved (main moved when #772 landed; both
  sides kept in the two append-only logs), and promoted the one open design call to
  **Open founder action items**: where Anwenden lives on MOBILE, since the bottom bar's five slots
  are locked and no code change is pending on it.
  Session totals for the record: three audit items closed (**P6, P4, P5**), **62 Redemittel**,
  **20 free-speak scenario nodes**, **4 grammar topics + 58 drills**, **124 provenance rows**, three
  new test files (`redemittel`, `scenarios`, `grammar`) taking the suite **419 → 491**, and one
  infrastructure fix (provenance split into four parts for the TS2590 ceiling).
  Gates: docs-only (no code touched).
- **Artifacts (prompt 4):** `docs/PROJECT_STATUS.md` · this log
- **Prompt 5 (verbatim, 2026-08-01):** `yes keep it in the bottom bar`
  **Follow-up mid-implementation (verbatim):** `actually.. just move schreiben to anwenden and
  rename anwenden as prufung`
  **Response:** built the six-slot version first and measured it in the real app before showing
  anything: at 320px the bar **overflowed**, because a flex slot without `min-w-0` cannot shrink
  below its longest label, so "Einstellungen" set a 73px floor and pushed the gear off screen. Fixed
  that properly (`min-w-0` on every slot, so the active label truncates instead of setting a width
  floor) and kept the fix, since it makes the five slots even too.
  Then took the founder's correction and shipped that instead: `/writing` lost the tab it had held
  since 2026-07-22 and is a card in the hub again; the hub label went from "Anwenden" to **Prüfung**,
  its hero from "Wissen anwenden" to "Prüfung vorbereiten", and the exam card from "Prüfung" to
  **Prüfungssimulation**, because a card cannot carry the name of the page it sits on. The bar reads
  Praktisch · Bibliothek · Prüfung · Fortschritt · Einstellungen, still five slots.
  Nothing about the writing trainer itself changed: same route, same mark, same deep links, same
  draft-resume redirect, and a pin saved while it was a tab remaps via `ROUTE_SUCCESSOR`. Flagged
  the one real cost: the writing coach is a tap deeper than before.
  `tests/nav.test.tsx` (5 tests) pins the slot order, the remap and the two registry facts.
  Gates: typecheck · lint 0 errors · test:unit **496/496** · build · check:bundle 123.3 kB. Verified
  in the built app at 320px and 390px and on desktop, including that the Schreiben card still opens
  the trainer.
- **Artifacts (prompt 5):** `src/components/layout/nav-items.ts` ·
  `src/components/layout/BottomTabBar.tsx` · `src/features/anwenden/AnwendenHub.tsx` ·
  `tests/nav.test.tsx` (new) · `CLAUDE.md` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/areas/SCHREIBEN.md` · `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` · this log
- **Prompt 6 (verbatim, 2026-08-01):** `document the session`
  **Response:** second documentation pass, covering the nav work that landed after the first one.
  Added the shipped record for **PR #778 → `3863c49`** (`Validate content` + `Deploy site to GitHub
  Pages` green, post-merge housekeeping done) and the second mid-session merge conflict with how it
  was resolved: #776 and #777 landed while the branch was open, so session 182's entry stayed at the
  tail of this log and session 179's late prompt 14 was filed under its own heading, where #777 had
  just moved the rest of that session. Put the nav outcome into the `_Last updated_` summary, since
  the fifth zone is a structural change a future session must not rediscover by surprise.
  Doc hygiene: the file had grown to 268 lines against a ~250 ceiling, so session 182's FIRST part
  (audit P6) was archived into `PROJECT_STATUS_ARCHIVE_2026-W31.md` with a pointer left behind; its
  law already lives in `docs/DECISIONS.md` §s182 and `docs/areas/CONTENT.md`, so nothing was lost.
  The two remaining blocks were renamed from "Same session" to explicit part-numbered handoffs, now
  that the block they used to follow sits in the archive.
  Session 182 final tally: **four PRs** (#773 P6, #774 P4+P5, #775 the record, #778 the nav), all
  squash-merged and deployed green; **three audit items closed**; test suite **419 → 496**.
  Gates: docs-only (no code touched).
- **Artifacts (prompt 6):** `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` · this log

## Session 183 (2026-08-02) - branch `claude/pruefung-icon-design-n9n3z8`

- **Prompt 1 (verbatim, 2026-08-02):** `reg. the latest changes made in the app, I have some
  comments: 1. I want the prufung icon in the bottom bar to match the aesthetics of other icons
  there. create mockups 2. what's the difference between sprechen and prufung simulation in the
  prufung section same? what's the difference? should we merge both? 3. I want to use the schreiben
  icon from menu bar in the prufung section schreiben tile, and a similar icon for sprechen.
  generate mockups`
  **Response:** mockup round only, no app code touched (previews-first rule). Diagnosis for 1: the
  bar's Prüfung mark is the only stroke-drawn icon (hollow target ring); every neighbour is a
  filled two-tone shape, which is why it reads thinner. Built `preview/pruefung-icons.html` with
  the real tokens and the exact route-icon SVGs: Teil 1 offers four filled orange+amber bar marks
  (A volle Zielscheibe, B Klemmbrett mit Haken, C Stoppuhr, D Absolventenhut) each rendered in a
  five-slot bar replica, light + dark, plus a 64px detail row; Teil 2 offers three tile treatments
  for the Prüfung hub (1 white marks on the existing gradients, 2 own-colour marks on tinted
  squircles, 3 own-colour marks on the grey bar squircle), each using the menu-bar pencil for
  Schreiben, the same-style microphone for Sprechen and the cap recoloured amber for the
  Prüfungssimulation. Screenshot-verified in headless Chromium and published as an artifact.
  For 2, reported in chat (no changes): Sprechen and Prüfungssimulation run on the SAME dialogue
  engine and scenario bank; Sprechen is untimed practice with hints across all 30 scenarios,
  Prüfungssimulation wraps one scenario in exam conditions (Aufgabenblatt briefing, countdown,
  rubric self-check, score). Recommendation: keep both cards, do not merge; the practice/exam split
  is the point of the zone, and merging would bury the timed run as a toggle.
  Gates: preview + docs only.
- **Artifacts (prompt 1):** `preview/pruefung-icons.html` (new) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` · this log
- **Prompt 2 (verbatim, 2026-08-02):** `D and 2` · **Prompt 3 (verbatim, same turn, 2026-08-02):**
  `keep them separate`
  **Response:** implemented exactly the picked variants. **D:** `route-icons.tsx` gained a shared
  `graduationCap` render used by BOTH `/anwenden` (the bar tab) and `/exam` (the hub card), orange
  `#f97316` cap over an amber `#fbbf24` base; `/anwenden`'s `NORM` box moved from the target circle
  to the cap's `[1.8, 2.8, 16.4, 11.9] @ 1.08`. **2:** `AnwendenHub.tsx` dropped its lucide icons and
  gradient tiles for `RouteIcon` on 48px tinted squircles, so the Schreiben card carries the nav's
  own pencil. Two things the implementation forced: `OFF_NAV_COLOR` (routes outside `navItems` had no
  accent, so all three marks would have drawn brand blue), and `rounded-xl` instead of `rounded-2xl`
  (`--radius + 10` = 24px = exactly half of a 48px tile, so the tiles, old gradient ones included,
  were rendering as full circles rather than the squircles the approved preview showed). Also
  lightened the `/simulation` teal `#5eead4` → `#2dd4bf`, which washed out on the tinted tile.
  Per "keep them separate", nothing was merged: Sprechen and Prüfungssimulation keep their own cards
  and runners, and that decision is now recorded as founder law.
  Verified in the BUILT app at 320 / 390 (light + dark) / desktop, including that all three cards
  still open their trainer.
  Gates: typecheck · lint 0 errors · test:unit 496/496 · build · check:bundle 123.2 kB.
- **Artifacts (prompts 2-3):** `src/components/layout/route-icons.tsx` ·
  `src/features/anwenden/AnwendenHub.tsx` · `docs/areas/PRAKTISCH-NAV.md` ·
  `docs/PROJECT_STATUS.md` · this log
- **Shipped (prompts 1-3, recorded after the merge):** PR **#780**, squash-merged as `797f65d`.
  The mockup round and the implementation went out as ONE PR: the preview commit was still unmerged
  when the founder picked, so D and 2 were added to the same branch. `Validate content` and `Deploy
  site to GitHub Pages` both green on the merge commit; post-merge housekeeping done (branch reset
  onto `main`, working tree clean).
- **Prompt 4 (verbatim, 2026-08-02):** `document the session`
  **Response:** documentation pass over what prompts 1-3 shipped, plus three gaps they left.
  (1) **`docs/DECISIONS.md` had no s183 section at all**, although the prompt-3 entry above claims
  the keep-them-separate call "is now recorded as founder law". It is now, in two sections: the
  Sprechen vs. Prüfungssimulation verdict (same engine and scenario bank, different framing; why a
  merge would bury the timed run, and that the real weakness is exam-set DEPTH, not duplication), and
  the Prüfung icon language with the two traps it exposed (`OFF_NAV_COLOR` for non-nav routes, and a
  radius at or above half the box side being a circle whatever the token is called).
  (2) **The `/design` skill gained that geometry rule** in its pre-flight Corners item, since it is
  reusable and cost a shipped-then-unnoticed bug: the hub tiles had been full circles.
  (3) **`docs/PROJECT_STATUS.md` carried three handoffs and sat at 264 lines** against a ~250
  ceiling. The superseded s183 "picks pending" mockup-round handoff was archived into
  `PROJECT_STATUS_ARCHIVE_2026-W31.md` (the final s183 handoff covers the same work end to end), and
  the shipped record for #780 was added to the surviving one. Back to 251 lines with the two most
  recent handoffs, per the doc-hygiene rule.
  `docs/areas/PRAKTISCH-NAV.md` needed nothing: prompt 2-3 already updated it in the same PR.
  The one founder question still open is unchanged and recorded in both files: the Prüfung page's
  `HubHero` still shows the lucide target, so the zone is a cap in the bar and the sidebar but a
  target at the top of its own page.
  Gates: docs-only (no code touched).
- **Artifacts (prompt 4):** `docs/DECISIONS.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md` ·
  `.claude/skills/design/SKILL.md` · this log

