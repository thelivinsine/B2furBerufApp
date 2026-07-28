**Handoff after session 173 (2026-07-27).** _(Archived from `PROJECT_STATUS.md` in session 175.)_

**Handoff after session 173 (2026-07-27). The app no longer refreshes work away. Merged as PR #740
(`805fff0`), branch `claude/app-refresh-data-loss-01xd0e`.**
Founder bug report: "whenever the user is working on something like writing an email or practicing an
Übung session, the update takes place and the app refreshes", losing the draft or the session. Root
cause was `src/lib/swUpdate.ts`: when a new service worker took control it reloaded unconditionally,
either immediately (within 30s of load) or **at the next resume from the background**, which is
exactly the moment a learner returns to a half-written email. Fixed in two layers:
- **Layer 1, never reload over live work.** New `src/lib/liveWork.ts` is a tiny module-level registry
  (not a store: the reloaders run outside React). A surface holding unsaved in-memory work claims it
  via the `useLiveWork(active, label, flush)` hook; `hasLiveWork()` gates every automatic reload, so
  a queued deploy simply waits and retries on each later resume. The app runs fine on the old bundle
  meanwhile. Claimants today: the Fokus / Kurz / Lang editors (non-empty text) and a running Üben run.
- **Layer 2, make any unavoidable reload recoverable.** Some reloads must still happen (a chunk-load
  self-heal in `lib/recover.ts`, a manual refresh, iOS discarding the tab), so work now persists:
  - `src/features/writing/draftAutosave.ts` (localStorage, one draft PER mode, 7-day TTL) autosaves
    500ms after the last keystroke and on unmount/pagehide, and restores on mount. It is deliberately
    a **separate key and record** from `resumeDraft.ts`: that one is the sign-in hand-off with the
    `resume: true` flag AppShell redirects on, and an autosave must never trigger that redirect.
  - `src/features/session/sessionResume.ts` (**sessionStorage**, keyed by a signature of the launch
    params, 3h TTL) snapshots plan + index + tallies + loot. sessionStorage on purpose: it survives a
    reload of the tab but dies with it, so a learner who opens Üben tomorrow gets a fresh session,
    never a silent resume. The snapshot always points at the next **unanswered** block, since an
    answered one is already graded into FSRS/XP and replaying it would double-count. Cleared on
    finish, on "Beenden", and on "Neue Runde" (with an `abandoned` ref so the unmount flush cannot
    write it back).
- `installLiveWorkFlush()` in `main.tsx` flushes every claim on pagehide / beforeunload / hidden, so
  even a reload nobody asked for lands on the restore path.
- `tests/liveWork.test.ts` (18 cases) pins the registry, per-mode draft isolation, staleness, corrupt
  storage, and that a snapshot never resumes into a differently-scoped session.
- **Not verifiable from the sandbox:** service-worker update behavior needs the live site. What the
  founder should see after the deploy: backgrounding the app mid-draft and returning no longer wipes
  the editor, and a refresh restores both the text and its Aufgabe. Hard-refresh once first, since a
  stale service worker can still serve the pre-fix build for one launch.
- **Worth knowing for the next reload-ish change:** the rule is now a CLAUDE.md hard invariant, so any
  new surface that holds in-memory work must both claim `useLiveWork` AND persist itself. Persisting
  alone is not enough (the reload still throws away the on-screen state around the draft), and
  claiming alone is not enough (a chunk-load self-heal ignores no-one's convenience).
- **Deliberately NOT done:** no "a new version is available, reload?" toast. The founder's report was
  about interruption, and a banner is a second interruption; the queued-update-on-next-safe-resume
  path ships the same deploy without asking anything of the learner. Revisit only if a deploy ever
  needs to be forced out mid-session (e.g. a broken backend contract).


---

**Handoff after session 174 (2026-07-27).** _(Archived from `PROJECT_STATUS.md` in session 175.)_

**Handoff after session 174 (2026-07-27). Full security audit:
`docs/reports/security-audit-2026-07-27.md`.**
Full-surface review (bundle · five Edge Functions · twelve migrations · CI · dependency tree), not a
diff review. The architecture held up: RLS covers every table, no injection sink exists in `src/`,
the CSP is enforcing, CI actions are SHA-pinned, secrets are server-side only, and `delete-account`
derives its user id from the JWT alone. Thirteen findings; three fixed in this pass.
- **Fixed here.** (1) Writing drafts (`genauly.writing.autosave` / `.resume`) were in no teardown
  path, so on a shared device the next learner opened Schreiben into the previous one's text, and an
  erasure request left it on disk for a week. Now cleared from `clearLocalAccountData()` (sign-out +
  deletion) and, autosave only, from the shared-device branch of `startCloudSync()` (the resume draft
  is kept there on purpose: that branch is also the login-wall hand-off). (2) `submit-feedback` is
  unauthenticated by design and its per-IP guard reads the caller-supplied `x-forwarded-for`, so row
  insertion was unbounded; the hourly count that already gates email is now also a hard storage
  ceiling (`FEEDBACK_HOURLY_ROW_CAP`, default 300). (3) The GDPR export omitted `sentence_checks` /
  `sentence_ai_ops`, i.e. every sentence the learner wrote in Fokus.
- **The one item that needs the founder (F1, high).** Admin access is `auth.jwt() ->> 'email' in
  (two Gmail addresses)`, with no check that the address was ever verified, and
  `config.toml` has `enable_confirmations = false`. If the hosted project matches that, and if
  either address is not already registered, anyone can claim it via the guest-upgrade path
  (`updateUser({email})`, `useAuthStore.ts:121`) and get the feedback inbox plus `app_config` write.
  **`supabase/migrations/0013_admins_table.sql` fixes it, and the founder applied it on 2026-07-27**:
  it moves
  the gate onto an `admins(user_id)` table (service-role only, no client policies), seeds it from the
  accounts holding those addresses today, and REFUSES to swap `is_founder()` if the seed matched
  nobody, so a wrong address errors out instead of locking everyone out. It also re-points the last
  hard-coded email policy (`provenance_reviews`, from 0007) at `is_founder()` and pins `search_path`
  on both helpers (F12). Idempotent, rollback in a trailing comment, pinned by `tests/admin.test.ts`.
  Turning "Confirm email" on is a SEPARATE, later task: Supabase's built-in mailer is rate-limited to
  a few messages an hour, so it needs real SMTP first or sign-ups start failing.
- **Also open:** `pnpm audit` is no longer 0 (7 high + 3 moderate); react-router 6.x has an open
  redirect with **no fix in the 6.x line**, so a 6→7 migration needs scheduling (the app is not
  reachable through it today — every `navigate()` target is built from internal ids, and that is now
  a rule worth keeping). Lower: `*.github.io` is still wildcard-allowlisted on every function; the AI
  daily/monthly limits are check-then-act so parallel requests slip past them (bounded by the $5
  fuse); `log_gdpr_event()` is callable by `anon`; no retention job on learner text.
- **Then the audit's own recommendation broke sign-up, which turned out to be a good thing.** The
  founder switched "Confirm email" ON, and email sign-up stopped working: clicking the link
  confirmed the account server-side but never signed anyone in, and coming back to the (default)
  "Konto erstellen" tab produced a "confirm your email" toast that would never come true. TWO
  independent bugs, neither introduced by the audit, both live since email sign-up existed:
  - **The link could not deliver a session.** Supabase's default template returns it in the URL
    HASH; React Router rewrites the URL as it mounts, so the tokens were gone before any code read
    them, and the client runs PKCE, which does not look there anyway (the same collision
    `lib/supabase.ts` documents for Google). `src/lib/authCallback.ts` now snapshots the parameters
    at module-eval time (imported FIRST in `main.tsx`, before `createRoot`), and the new ungated
    route **`/auth/confirm`** (`features/auth/ConfirmEmail.tsx`) completes the sign-in. It accepts
    all three shapes (`token_hash` → `verifyOtp`, hash tokens → `setSession`, `?code=` already
    consumed by supabase-js), so it works with or without the branded template. `signUp` pins
    `emailRedirectTo` to the running origin, so a wrong Site URL can no longer strand a learner.
  - **A second sign-up with the same address looked like a fresh one.** With confirmations ON,
    Supabase answers an already-registered address with a success-shaped response and NO error (it
    will not reveal which addresses exist), so `needsConfirmation` was true. The tell is an empty
    `identities` array: `signUp` now returns `alreadyRegistered` and the dialog switches to Anmelden
    with the address kept. The existing `friendlyError` "already registered" mapping never fired
    because that path produces no error to map.
- **Auth dialog reworked** (all three founder complaints): password reveal toggle; the AGB checkbox
  moved from the top of the dialog to directly above the button it gates; the primary and Google
  buttons no longer sit disabled-at-default but always act and NAME the first unmet requirement in
  one message slot; and the confirmation state became a panel that keeps the dialog open, shows the
  address and offers "E-Mail erneut senden". Screenshot from the real component:
  `preview/auth-dialog.html` (open it with `pnpm dev`).
- **Caught by the new tests:** the dialog's reset effect listed `clearError` in its dependencies, so
  any store handing back a fresh action identity per render wiped the consent tick and the pending
  panel the instant they were set. Now a ref synced in its own effect.
- **Gates:** typecheck · lint 0 errors (75 warnings, same as the untouched tree) · test:unit
  **363/363** · build · check:bundle 122.9 kB.
- **Then four rounds of live debugging (#743, #744, #745), all from one founder report that started
  as "login with email doesn't work now".** Worth reading before touching auth or sync: the report
  was accurate, my first two diagnoses were not, and the fault was nowhere near where I was looking.
  - **#743, two real defects on the log-in path, neither the reported one.** `signIn` inferred
    `needsConfirmation` from a response carrying no session as well as from the error, so a correct
    password could be answered with "check your inbox"; and an unconfirmed account had the whole
    log-in form replaced by the sign-up "check your inbox" panel, which claims a link was just sent
    (untrue there) and removed the only way in. `pending` and `resendFor` are now separate states.
  - **#744, after the founder added "with a secondary account, it redirects me to landing page".**
    That sentence reframed everything: the sign-in was SUCCEEDING. `RequireOnboarding` sent every
    resolved not-onboarded visitor to `/welcome`, i.e. the page that asks you to sign up, which is
    indistinguishable from a failed log-in. Signed-out still goes there; an account holder now goes
    to `/start`. A successful sign-in FROM a public page also now hands over to `/`, because the
    dialog closing left the learner on a landing page still showing "Start free".
  - **#745, the root cause, and it explains all three symptoms.** `mergeRemoteSettings` decided
    whether to adopt a cloud profile with `if (!profile.name) return`. Onboarding collects goal,
    mode and level and NO name, so `name` was `""` for every account ever created and the guard
    bailed every time. Since a sign-in wipes the local cache first (account isolation, deliberate),
    `onboarded` could only return from the cloud, and never did. Latent since that line was written:
    any learner signing in on a second device silently lost their level and goal. Adoption now tests
    `settings.onboarded`, which still rejects the empty row the sign-up trigger creates.
  - **The rule that came out of it, now a CLAUDE.md invariant:** when a check needs to know whether
    state exists, ask the flag that means that, never a field that usually accompanies it. A proxy
    that is right most of the time fails silently and permanently when it is wrong.
- **Gates across the round:** typecheck · lint 0 errors (75 warnings) · test:unit **370/370**
  (+7 over the audit PR: `authDialog` router destinations, `cloudSync` profile adoption) · build ·
  check:bundle within budget.
- **Next:** Resend SMTP is the one open founder action (`docs/reference/auth-emails/README.md`).
  Then, when scheduled, the react-router 6 → 7 migration from audit F2. **The founder should expect
  onboarding ONCE more per account** after #745: that run is what finally writes a flag the app can
  read back.


---

**Handoff after session 175 (2026-07-28), first task.** _(Archived from `PROJECT_STATUS.md` in session 175.)_

**Handoff after session 175 (2026-07-28). Fokus mobile tiles: 10% shorter from the bottom.**
Branch `claude/fokus-tile-height-9lxw8g`.
Founder: the two mobile Fokus tiles looked cramped. They filled the room between their top and the
fixed bottom chrome exactly, so the sentence card and the Grammatik dial tile ran right into the
Korrigieren cluster.
- `measureMobile` in `src/features/writing/fokus/FokusTrainer.tsx` now keeps `FILL_RATIO = 0.9` of
  the measured room (floor 240px, was 260px unscaled). The top of the column is unchanged, so the
  10% comes off the BOTTOM and the tiles stop short of the chrome. Both the exact `height` used
  before a correction and the `minHeight` used after are scaled, so a long correction still grows
  the page as before.
- The mobile column gap went `gap-4` → `gap-5`, which is the "breathing space between the tiles"
  half of the request; the tiles keep their `grow-[1.15]` / `grow` ratio, so both shrink evenly.
- Nothing else in the locked Schreiben mobile anatomy moved: the fixed cluster and KI line, the
  `bottomLimit()` picker floor and the desktop layout are untouched. `docs/areas/SCHREIBEN.md`
  records the 90% rule.
- **Gates:** typecheck · lint 0 errors (75 warnings, unchanged) · build. Phone verification is the
  founder's, as usual.
