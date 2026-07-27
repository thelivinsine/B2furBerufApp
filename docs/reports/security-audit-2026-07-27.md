# Security audit — 2026-07-27 (session 174)

Full-surface review of the shipped app: the browser bundle, the five Supabase Edge Functions, the
twelve migrations (RLS policies, SECURITY DEFINER RPCs, grants), the CI workflows, the build
scripts, and the dependency tree. Supersedes `docs/reports/security-review-2026-07-14.md`, which
was a review of one PR's diff rather than of the whole system.

**Headline:** the architecture is sound. Secrets are server-side only, every user table is
owner-only RLS, there is no HTML-injection sink anywhere in `src/`, the CSP is enforcing, CI actions
are SHA-pinned, and the AI cost fuses are layered properly. Three fixes shipped with this audit.
The one item that genuinely needs founder action is **the admin gate: it trusts an email address
that Supabase may not have verified** (F1).

Severity uses the usual scale. "Conditional" means the exposure depends on a Supabase dashboard
setting this sandbox cannot read.

---

## Findings

| # | Severity | Area | Finding | State |
|---|---|---|---|---|
| F1 | High (conditional) | Auth / admin | Founder gate keyed on an unverified email claim | **Founder action** |
| F2 | High | Dependencies | 10 advisories; react-router 6.x has an open redirect → XSS with **no fix in the 6.x line** | **Founder decision** |
| F3 | Medium | Privacy | Writing drafts survived sign-out and account deletion on the device | ✅ Fixed here |
| F4 | Medium | Abuse / cost | Feedback endpoint could be flooded with rows (per-IP guard is header-spoofable) | ✅ Fixed here |
| F5 | Medium | GDPR | Data export omitted the learner's Satzlabor sentences | ✅ Fixed here |
| F6 | Medium | Abuse / cost | AI daily/monthly limits are check-then-act: parallel requests slip past them | Documented |
| F7 | Low | CORS | `*.github.io` is permanently allowlisted on every Edge Function | Documented |
| F8 | Low | Frontend | No clickjacking defence (`frame-ancestors` is ignored in a `<meta>` CSP) | Documented |
| F9 | Low | Abuse | `log_gdpr_event()` is executable by `anon` with no rate limit | Documented |
| F10 | Low | Integrity | `transform-sentence` gate on `checkId` is optional, contradicting migration 0009 | Documented |
| F11 | Low | Data minimisation | No retention policy on `writing_evaluations.text` / `sentence_checks.source_text` | Documented |
| F12 | Low | Hardening | `is_founder()` / `assert_founder()` have no `set search_path` | Documented |
| F13 | Info | Docs | `docs/strategy/SECURITY.md` claims "pnpm audit → 0 vulns" and "CSP report-only" | ✅ Fixed here |

---

### F1 — The admin gate trusts an email address, and nothing checks that Supabase verified it
**High, conditional. `supabase/migrations/0008_admin_center.sql:33`, `0007`, `src/lib/admin.ts`.**

Every admin boundary in the system resolves to one predicate:

```sql
create or replace function public.is_founder() returns boolean language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in
    ('thelivinsine@gmail.com', 'thesuhaspala@gmail.com');
$$;
```

Whoever holds a session whose JWT carries one of those two strings gets: the whole feedback inbox
(`admin_feedback_recent` returns every submitter's message, reply-to email and user id — the one
per-row personal-data exception in the design), write access to `app_config` (remote config that
every visitor's app consumes at startup), the launch checklist, and the provenance review table.

Two things have to hold for that to be safe, and only the founder can confirm them in the Supabase
dashboard:

1. **Both addresses must already be registered.** If `thesuhaspala@gmail.com` (or either) has never
   signed up, anyone can register it and become an admin. There is no second factor.
2. **Email confirmations must be ON.** `supabase/config.toml:29` has
   `enable_confirmations = false`. That file governs local dev, not the hosted project, but if the
   hosted project matches it then an *anonymous guest* can call
   `supabase.auth.updateUser({ email })` — which the app already does, in
   `src/store/useAuthStore.ts:121`, as the guest-upgrade path — and GoTrue applies the new address
   **immediately, with no proof of ownership**. Taking an address that already belongs to another
   account is rejected, so this is only exploitable against an *unregistered* founder address; but
   it means the entire admin boundary rests on "those two Gmail addresses are already taken."

The gate also never checks that the email is confirmed, so it would accept an unverified address
even where the platform allowed one.

**Recommended fix, in order of durability:**

1. Immediately: confirm in the dashboard that **both** addresses are registered accounts, and that
   Authentication → Sign In / Providers → Email → "Confirm email" is **on**.
2. Properly: stop deriving admin status from a mutable claim. Add an `admins(user_id uuid primary
   key)` table seeded with the two real user ids, and make `is_founder()` read it:

```sql
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;  -- no client policies: service-role only

-- Seed FIRST, verify the ids are right, and only then swap the function body:
--   insert into public.admins (user_id)
--   select id from auth.users where lower(email) in
--     ('thelivinsine@gmail.com','thesuhaspala@gmail.com');

create or replace function public.is_founder()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
```

A user id cannot be changed by its owner, so the gate stops depending on any auth setting. Because
this migration can lock the founder out if the seed is wrong, it is written here rather than
applied: seed and verify the `admins` rows first, then replace the function in the same session.
`src/lib/admin.ts` (the cosmetic client-side gate) and the `provenance_reviews` policy from 0007
should be pointed at the same source at that time; `tests/admin.test.ts` pins the two lists in
lockstep and will need updating with them.

---

### F2 — Ten dependency advisories, one with no upstream fix
**High. `pnpm audit`.**

`docs/strategy/SECURITY.md` records "pnpm audit → 0 vulns". That is no longer true; today it is
**7 high + 3 moderate**:

| Package | Path | Fix |
|---|---|---|
| `react-router-dom` 6.30.4 | direct dependency | **none in the 6.x line** (advisory lists `patched: <0.0.0`) |
| `react-router` 6.x | via `react-router-dom` | `>=7.18.0` |
| `postcss` ≤8.5.17 | direct devDependency | `>=8.5.18` |
| `brace-expansion` (×3) | via `eslint`, `vite-plugin-pwa` | `>=5.0.8` / `>=2.1.2` |
| `fast-uri` (×2) | via `vite-plugin-pwa` → `workbox-build` → `ajv` | `>=3.1.4` |

Only the react-router pair ships to the browser; everything else is build-time toolchain, where the
attacker would need to control the build input, so those are hygiene rather than exposure. The
react-router advisories are *Open redirect via backslash in `<Link>` / `useNavigate`* and *Open
redirect leading to XSS*. Exploiting them needs an attacker-controlled navigation target. I checked
every dynamic `navigate()` / `to={}` in the app: all of them build their target from internal ids
and constants (`/session?theme=…`, `/hilfe/${slug}`, `/welt?mission=…`), none from a query
parameter, hash or API response. So **the app is not currently reachable through these**, but it is
one careless `navigate(searchParams.get(...))` away from being so, and the 6.x line will never get
a patch.

**Recommendation:** run `pnpm update postcss eslint vite-plugin-pwa` to clear the toolchain six
(these are safe, semver-compatible bumps), and schedule the **react-router 6 → 7 migration** as its
own piece of work. Note `package.json` currently pins `overrides: { react-router: "^6.30.4" }`,
which has to come off for the upgrade. Until then, treat "never pass user-controlled strings to
`navigate()` / `<Link to>`" as a hard rule.

---

### F3 — Writing drafts outlived the account on the device ✅ fixed
**Medium. `src/features/writing/draftAutosave.ts`, `src/lib/cloudSync.ts`.**

The s173 autosave keeps one draft per mode (Fokus / Kurz / Lang) in `localStorage` under
`genauly.writing.autosave` for seven days, and the sign-in hand-off keeps one more under
`genauly.writing.resume`. Neither key was in any teardown path: `clearLocalAccountData()` reset the
zustand progress/settings stores and the sync-uid marker, and `deleteAccount()` additionally removed
`b2beruf.progress.v1` / `b2beruf.settings.v1` — but the drafts were untouched, and
`loadAutosavedDraft()` restores unconditionally, with no idea which account wrote the text.

Two consequences. On a shared device (the family laptop, a Volkshochschule machine — realistic for
this audience), learner A signs out, learner B opens Schreiben, and A's text is sitting in the
editor. Genauly's writing tasks are Beschwerden, Arzt-Mails and Anträge, so that text routinely
contains an address, an employer, or a health detail. And an Art. 17 erasure request deleted
everything server-side while leaving the learner's own words on the disk for another week.

**Fixed** by adding `clearAllAutosavedDrafts()` and calling it, plus `clearWritingDraft()`, from
`clearLocalAccountData()` (sign-out and account deletion), and calling
`clearAllAutosavedDrafts()` from the shared-device branch of `startCloudSync()` where a different
account starts syncing. The one-shot *resume* draft is deliberately preserved in that second branch:
it is also the "wrote something → hit the login wall → signed in" path, where the text in flight
belongs to the arriving learner and `WritingHub` consumes it immediately.

---

### F4 — The feedback endpoint could be flooded with rows ✅ fixed
**Medium. `supabase/functions/submit-feedback/index.ts`.**

This function is deliberately unauthenticated (`verify_jwt = false`, so signed-out visitors can
report problems), which is the right product call. Its per-IP burst limit derives the address from
`x-forwarded-for` and takes the **leftmost** entry — the one the caller supplies. A script hitting
the function directly can therefore put a fresh random address in that header on every request and
never share a bucket. The in-memory map is also per warm isolate, so it resets on cold start.

The founder's inbox was already protected: `GLOBAL_HOURLY_EMAIL_CAP` stops the Resend send at 60
rows/hour regardless of source. Row *insertion*, however, was unbounded — an attacker could not
reach the inbox but could grow `public.feedback` indefinitely, which costs storage and buries real
feedback in the admin inbox.

**Fixed** by promoting the hourly count that already gates email into a hard storage ceiling
(`GLOBAL_HOURLY_ROW_CAP`, default 300/hour, overridable via the `FEEDBACK_HOURLY_ROW_CAP` secret):
past it the request is refused with the existing friendly 429 instead of stored. One query serves
both guards, so this adds no latency. The threshold sits far above any plausible real hour.

I deliberately did **not** switch the IP parse to the rightmost `x-forwarded-for` entry. That is the
textbook fix, but if Supabase ever fronts the function with a second proxy the rightmost entry
becomes the proxy's own address, collapsing every visitor into one 5-per-10-minutes bucket and
silently breaking feedback for everyone. The global ceiling bounds the damage without that risk.

---

### F5 — The GDPR export was missing the Satzlabor sentences ✅ fixed
**Medium. `src/lib/dataExport.ts`.**

`buildExport()` gathered `profiles`, `progress` and `writing_evaluations`, but not
`sentence_checks` — the per-sentence table added in migration 0009, which stores every sentence a
learner submits to Fokus along with its correction. That is the learner's own writing, held under
their user id, and Art. 15/20 covers it. `sentence_ai_ops` (their paid-op ledger, which explains
why a limit was hit) was missing too.

**Fixed:** both tables are now read in the same parallel batch and exported as `sentenceChecks` /
`sentenceAiOps`. Owner-only RLS already permits exactly these reads, so no policy change was needed.
Erasure was already complete — both tables cascade from `auth.users`.

---

### F6 — The AI limits are check-then-act, so concurrency slips past them
**Medium (cost, not data). All three AI functions.**

Every limit follows the same shape: `SELECT count(*) … ; if (count >= LIMIT) reject; … INSERT`.
There is no lock and no atomic reservation, so *N* requests fired in parallel all read the same
pre-limit count and all proceed. A learner (or a bot-farmed guest) can get roughly as many free
model calls as they can open sockets, per window, on `evaluate-writing`, `check-sentence` and
`transform-sentence` alike. The same applies to the global monthly `$` fuse, which is read before
the call and bumped after it.

The exposure is bounded, which is why this is not higher: `MONTHLY_SPEND_CAP_USD` (default $5) still
catches the run within one billing month, Gemini leads the cascade at $0, and Turnstile gates
account creation. The realistic damage is one month's cap burned in an afternoon plus a stack of
rows, not an unbounded bill.

**If you want it closed**, the cheap fix is a `SECURITY DEFINER` reservation RPC that does the count
and the insert of a placeholder row in one statement, and returns whether the caller may proceed —
the same trick `bump_ai_usage` already uses for the counter. Worth doing before any paid launch;
not urgent while the fuse is $5.

---

### F7 — `*.github.io` is permanently allowlisted on every function
**Low. All four CORS blocks.**

```ts
if (u.protocol === "https:" && u.hostname.endsWith(".github.io")) return true;
```

Anyone can publish a GitHub Pages site, so this is effectively "any origin that bothers." It is a
leftover from before the custom domain. It does not enable session theft — a hostile origin cannot
read the Supabase session out of `genauly.de`'s `localStorage`, so it cannot forge an authenticated
call — and `submit-feedback` needs no token anyway. The real cost is that the allowlist no longer
means anything.

**Recommendation:** drop the wildcard branch and set the `ALLOWED_ORIGINS` secret to
`https://genauly.de,https://www.genauly.de` (plus the `*.github.io` preview URL only if you still
use one). This is four identical deletions plus one dashboard value; I left it out of this PR
because getting it wrong breaks the live app's AI features until a redeploy, and it should ship on
its own where the founder can verify immediately.

---

### F8 — Nothing prevents the app being framed
**Low. `index.html:16`.**

The CSP is otherwise good — `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`,
`form-action 'self'`, and Turnstile explicitly allowed. But `frame-ancestors` is an
HTTP-header-only directive and is ignored inside a `<meta>` tag, and GitHub Pages cannot set
headers. So a hostile page can iframe genauly.de and overlay it (clickjacking). What that buys an
attacker here is modest — tricking a signed-in learner into clicking "Konto löschen", say — since
there is no payment or permission surface.

**Options:** put Cloudflare (already in the stack for Turnstile) in front of the domain as a proxy
and add `frame-ancestors 'none'` / `X-Frame-Options: DENY` there, or add a small frame-buster to
`main.tsx` (`if (window.top !== window.self) window.top.location = window.self.location`), which is
bundled code and so passes `script-src 'self'`. The Cloudflare route also gets you HSTS.

---

### F9 — `log_gdpr_event()` is open to anonymous callers
**Low. `supabase/migrations/0010_gdpr_evidence.sql:44`.**

`grant execute on function public.log_gdpr_event(text) to anon, authenticated, service_role` —
deliberate, so a guest's data export is counted. But the anon key is public, the RPC takes no rate
limit, and each call inserts a row. Anyone can inflate the compliance-evidence counters shown on
the admin Launch screen and grow `gdpr_events` at will. Nothing personal is stored (kind +
timestamp), so the impact is a misleading admin number and some junk rows.

**Recommendation:** revoke from `anon` (a guest doing an export is on the `authenticated` role
anyway — anonymous sign-in issues a real session), and if you want it airtight, log the event from
inside the `delete-account` function and a small export RPC rather than from the browser.

---

### F10 — The transform gate is optional, and the migration says it isn't
**Low. `supabase/functions/transform-sentence/index.ts:416`, `supabase/migrations/0009:16`.**

Migration 0009 documents: "The transform path requires a check_id that resolves here, so no
un-checked text is transformed." The function actually does `if (body.checkId) { …verify ownership… }` —
a client that simply omits the field skips the check entirely and can send arbitrary text (≤300
chars) to the model. Ownership *is* verified when the field is present, so this is not an IDOR; it
is an unenforced invariant. The rate limits and the monthly fuse still apply, so the practical
effect is a cheap generic LLM endpoint for anyone with an account.

**Recommendation:** make `checkId` required (the client always sends it), or correct the comment.
Requiring it is a one-line change but it breaks any in-flight client that omits it, so it belongs in
a normal change, not a security patch.

---

### F11 — Learner text is kept indefinitely
**Low (compliance). `writing_evaluations.text`, `sentence_checks.source_text`.**

Already noted in `SECURITY.md` as accepted. Restating it because the surface grew since: it is now
two tables, the newer of which (`sentence_checks`) accumulates a row per corrected sentence
*including cache hits*, so it grows much faster than the essay table. Both are owner-only RLS, so
this is a data-minimisation question (Art. 5(1)(e)), not a confidentiality one. The
`admin_gdpr_evidence()` RPC already probes for a `pg_cron` retention job and reports
`retention_scheduled: false`, so the admin screen is telling you this too.

**Recommendation:** when you're ready, a `pg_cron` job deleting rows older than N months (12 is a
defensible choice for a learning history) closes it and turns that admin indicator green. Worth
pairing with a line in the Datenschutzerklärung stating the retention period.

---

### F12 — The founder helpers don't pin `search_path`
**Low, defence in depth. `0008_admin_center.sql:33,46`.**

Every `SECURITY DEFINER` RPC in the codebase correctly carries `set search_path = public` — except
`is_founder()` and `assert_founder()`, which are the two that decide access. They are not
`SECURITY DEFINER`, so they run as the caller and cannot be used to escalate directly; and
PostgreSQL 15 revoked `CREATE` on the `public` schema from `PUBLIC`, so an attacker cannot plant a
shadowing `lower()` today. Still, these two functions should be the most conservatively written in
the schema. Add `set search_path = pg_catalog, public` to both the next time that file is touched.

---

### F13 — The security doc had drifted ✅ fixed
`docs/strategy/SECURITY.md` stated "pnpm audit → 0 vulns" (now 10) and listed "flip CSP
report-only → enforcing" as outstanding (it has been enforcing in `index.html` for some time).
Both corrected, with a pointer to this report.

---

## What was checked and found clean

Worth recording, so the next audit knows what has already been ruled out.

- **Injection sinks.** No `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write` or
  `insertAdjacentHTML` in `src/`. The single `innerHTML = ""` in `main.tsx:38` clears prerendered
  markup. All LLM output and all feedback text reaches the DOM through React's escaping. The help
  prerenderer (`scripts/prerender-help.mjs`) escapes every interpolated value, including meta tags
  and JSON-LD.
- **RLS coverage.** Every table has RLS enabled. `profiles`, `progress`, `writing_evaluations`,
  `sentence_checks`, `sentence_ai_ops` are owner-only by `auth.uid()`. `ai_usage`, `feedback`,
  `sentence_transforms`, `gdpr_events` have RLS on and *no* policies, so only the service role
  reaches them. `app_config` is world-readable by design (the app boots from it) and
  founder-writable. No client can read another learner's row through any path I could construct.
- **Admin RPCs return aggregates.** `admin_overview`, `admin_daily_series` and
  `admin_gdpr_evidence` return only counts, sums and day series; `admin_feedback_recent` is the
  documented per-row exception (operational messages addressed to the founder) and clamps its limit
  to 500. All are `SECURITY DEFINER` with `set search_path` and `perform assert_founder()` as the
  first statement, and all are revoked from `anon`.
- **Secrets.** Nothing but the publishable anon key is committed; a regex sweep for provider keys,
  JWTs, service-role strings and PEM blocks over the whole repo (excluding the lockfile) came back
  empty. `.env*` is gitignored bar the example. Every provider key is read from `Deno.env` inside
  the functions and never echoed into a response; error paths return generic German copy.
- **Account deletion.** `delete-account` derives the user id **only** from the verified JWT and
  never from the body, so it cannot be aimed at another account, and the `on delete cascade` chain
  covers all five user tables.
- **Cross-account contamination.** `cloudSync` persists which uid owns the local cache and wipes the
  stores before pull/merge/push when a different account signs in, so one learner's progress cannot
  be merged into or uploaded to another's row. (F3 was the one thing that path did not cover.)
- **Service worker.** Precaches only static build output; `globPatterns` covers no API response and
  there is no `runtimeCaching`, so no authenticated payload is ever written to the cache.
- **CI.** No `pull_request_target`. Every action pinned to a commit SHA except
  `supabase/setup-cli@v1`, which carries a documented reason and a re-pin TODO. `permissions:` is
  declared and minimal in all five workflows. Secrets are passed as `env:` to single steps, never
  interpolated into a `run:` body where they could leak into logs.
- **Build scripts.** All shell-outs use `execFileSync` / `spawnSync` with argument arrays; no string
  interpolation into a shell.
- **Supply chain.** `.npmrc` keeps the 24-hour `minimum-release-age` cooldown, store integrity
  verification and the default-deny on dependency build scripts. Lockfile committed, CI installs
  `--frozen-lockfile`.
- **External links.** Every `target="_blank"` carries `rel="noreferrer"`.
- **Password policy.** The UI enforces 6 characters (`AuthDialog.tsx:83`), matching the Supabase
  default. Low for this product — no payment data, and Turnstile gates the login form against
  spraying — but Supabase now offers a minimum length and a leaked-password check (HIBP) under
  Authentication → Policies, and both are free to turn on.

## Founder action list

1. **Verify both admin addresses are registered accounts, and turn "Confirm email" on** in Supabase
   Auth. (F1 — the one item that can hand someone else the admin panel.)
2. Decide on the react-router 6 → 7 migration; run the safe toolchain updates meanwhile. (F2)
3. Optional, cheap, do-anytime: set `ALLOWED_ORIGINS` to the real domains (F7); revoke
   `log_gdpr_event` from `anon` (F9); enable the leaked-password check (above).
4. Before a paid launch: close the limit race (F6) and schedule the retention job (F11).
