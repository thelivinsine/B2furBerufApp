# Project Status

_Last updated: 2026-07-28 (session 175). **Fokus mobile tiles breathe.** The two mobile Fokus tiles
filled the room down to the fixed bottom chrome to the last pixel and read as cramped; they now keep
90% of it (`FILL_RATIO` in `FokusTrainer.tsx`), anchored at the same top, and sit `gap-5` apart, so
the freed strip sits under the lower tile. Prior s174: **Security audit + the sign-up flow it uncovered.**
`docs/reports/security-audit-2026-07-27.md` covers the bundle, the five Edge Functions, all twelve
migrations, CI and the dependency tree; the architecture held, and three findings were fixed in the
same pass. Acting on finding F1 the founder turned **"Confirm email" ON**, which exposed that
**email sign-up had never actually worked end to end**, and pulling that thread reached a latent
fault that had been quietly discarding learner profiles: `onboarded` was written to the cloud and
never read back, so every sign-in on a device restarted onboarding and lost the learner's level and
goal (#745). Sign-up, log-in, the confirmation link and the profile restore all work now; the auth
dialog was reworked along the way. Still open for the founder: Resend SMTP so mail comes from
Genauly (migration 0013 is applied). Prior s173: **a deploy can no longer refresh a learner's work away.**
The PWA's auto-update reload now waits while any surface holds unsaved work (`src/lib/liveWork.ts`),
and both kinds of work persist so even an unavoidable reload is recoverable: writing drafts autosave
per mode (`draftAutosave.ts`), and a running Üben session snapshots its plan + position
(`sessionResume.ts`). **Merged (PR #740).** Prior s172: the correction now appears in the Kurz/Lang trainer, rendered from
ONE shared module (`src/features/writing/correction.tsx`) with Fokus, Kurz/Lang and Verlauf
(PR #739). `docs/plans/SCHREIBEN-OVERHAUL.md` carries the writing-content roadmap.
`.github/workflows/supabase.yml` deploys Edge Functions on merge, so backend changes no longer need
a CLI. Product name: **Genauly** (`genauly.de`)._

This is the **lean, living** status doc: current state plus the two most recent session handoffs.
**Start at the `## Resume here (next session)` section at the end.** Companion files:
- **`docs/PROJECT_FOUNDATION.md`** — the stable technical baseline that rarely changes: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra, and completed founder
  action items. Read it when you need the "what's built and how" detail that used to sit here.
- **`docs/PROJECT_REFERENCE.md`** — stable reference: the founder backlog, product-evaluation
  findings, per-session model guidance, and reusable research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked UX decisions.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only session-log history,
  chunked by ISO week under `docs/archive/status-log/`.
- **`../CLAUDE.md`** — the lean always-on operating rules (restructured s155, ~180 lines); deep
  per-area detail lives in **`docs/areas/`** (COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN,
  PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN, COMPONENTS) + the `/design` and `/content` skills.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · Schreiben · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,107
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **all** provenance rows are AI-drafted and `draft`, none human-verified
(human verification was reset to zero on 2026-07-22 at founder request, to restart the review pass;
see `strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
- [x] ~~Paste `supabase/migrations/0013_admins_table.sql`.~~ **APPLIED 2026-07-27** by the founder in
      the SQL editor, without the lock-out guard firing (it raises rather than swapping the gate when
      the seed finds no account, so a clean run means `public.admins` is seeded). Audit F1 closed:
      the admin gate is now a user-id table, not an email claim. Live confirmation that `/admin`
      still opens is the founder's last check; the rollback to the 0008 email gate sits in a comment
      at the foot of the migration if it ever does not.
- [ ] **Add Resend SMTP** (Auth → SMTP settings). Was optional; now needed, because "Confirm email"
      is ON and Supabase's built-in sender only allows a few messages an hour. Founder bought the
      `genauly.de` mailbox 2026-07-27; next is verifying the domain in Resend, then the SMTP fields,
      then pasting the two branded templates. Full steps: `docs/reference/auth-emails/README.md`.
- [x] ~~Enable "Confirm email".~~ **DONE 2026-07-27**, closing half of audit F1 (nobody can register
      an address they do not own). Required the `/auth/confirm` work in the s174 handoff.
- [x] ~~Enable Turnstile CAPTCHA on guest sign-in.~~ **DONE 2026-07-24** (live sign-in verified; both
      Supabase Auth CAPTCHA and the `VITE_TURNSTILE_SITE_KEY` GitHub secret set). Details in
      `PROJECT_FOUNDATION.md`.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [x] ~~Redeploy `transform-sentence` to activate the "Nochmal" regenerate button (s163).~~
      **DONE 2026-07-24** (founder redeployed via the Supabase dashboard; the capped variant path is
      live).
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

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

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
