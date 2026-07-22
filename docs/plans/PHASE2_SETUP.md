# Phase 2 Setup — Supabase Auth, Cloud Sync & AI Writing Coach

This is the **founder checklist** to switch on the Phase 2 backend. The app
code is already written and committed; these are the few steps only you can do
(the sandbox can't run Docker or reach the live site). Budget ~20 minutes.

Everything client-side already works against the project
`stkfdavpjflpqoxjunnj` using the **public** publishable key (safe to ship —
Row-Level Security protects all data). What's left is: apply the database
schema, set the secret API keys, and deploy the Edge Function.

> 🔐 **Security first.** You pasted the Anthropic key into chat, so treat it as
> compromised: after the function works, **rotate it** at
> <https://console.anthropic.com> → API Keys, and re-run the `secrets set`
> step with the new key. Secrets only ever live in Supabase Edge Function
> secrets — never in the repo, the browser, or git history.

---

## 1. Install the Supabase CLI (one time)

macOS: `brew install supabase/tap/supabase`
Windows: `scoop install supabase` (or see <https://supabase.com/docs/guides/cli>)

Then log in:

```bash
supabase login
```

## 2. Link this repo to your project

From the repository root:

```bash
supabase link --project-ref stkfdavpjflpqoxjunnj
```

(It will ask for the database password — find it in the Supabase dashboard
under **Project Settings → Database**.)

## 3. Apply the database schema

This creates the `profiles`, `progress`, `writing_evaluations`, and `ai_usage`
tables with owner-only RLS, plus the usage-counter function:

```bash
supabase db push
```

Verify in the dashboard (**Table Editor**) that the four tables exist.

## 4. Enable guest sign-in + protect it

In the dashboard:

1. **Authentication → Providers → Email** — make sure it's enabled (magic-link
   sign-in; no passwords).
2. **Authentication → Providers → Anonymous Sign-ins** — turn **ON** (this is
   the "start as guest" button).
3. **Authentication → Settings → Bot and Abuse Protection** — turn on
   **CAPTCHA (Cloudflare Turnstile)**. This stops bots from creating guest
   accounts and running up the AI bill. (Recommended before you go public.)
4. **Authentication → URL Configuration** — set the **Site URL** to your live
   GitHub Pages URL and add it to the redirect allow-list, so magic-link emails
   return users to the right place.

## 5. Set the secret API keys

These are stored as Edge Function secrets and never reach the browser. Use the
**new, rotated** Anthropic key here:

```bash
# Required — the AI writing coach
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...your-rotated-key...

# Recommended — cheap grammar/spelling pre-check (free tier available)
# Sign up at https://languagetool.org → API. For the free public endpoint you
# can skip these; for the hosted plan set all three:
supabase secrets set LANGUAGETOOL_API_URL=https://api.languagetoolplus.com
supabase secrets set LANGUAGETOOL_USERNAME=you@example.com
supabase secrets set LANGUAGETOOL_API_KEY=...languagetool-key...

# Optional fallbacks — only used if Anthropic hard-fails (down/quota)
supabase secrets set GEMINI_API_KEY=...
supabase secrets set OPENAI_API_KEY=...

# Cost guardrails (these are the defaults; set them explicitly to be sure)
supabase secrets set MONTHLY_SPEND_CAP_USD=5
supabase secrets set DAILY_LIMIT=5
```

## 6. Deploy the Edge Function

```bash
supabase functions deploy evaluate-writing
```

## 7. Smoke-test

1. Open the live site → **Schreibtraining**, pick a theme, write a few
   sentences, hit **Auswerten**. You should get **one** insight and an "Üben"
   button that deep-links to the matching grammar/quiz section.
2. Submit the **same text again** → it should come back instantly tagged
   "aus dem Cache" (no AI cost).
3. Submit 6 different texts → the 6th should be blocked with a friendly
   "come back tomorrow" message (the `DAILY_LIMIT`).
4. In **Settings → Konto & Cloud-Sync**, add your email, click the magic link,
   then open the site in another browser and confirm your XP/streak synced.

---

## 8. Enable "Weiter mit Google" (one-click sign-in)

The Google button is **already built and turned on in the app**. It will only
work once Google + Supabase are connected. Two consoles, ~10 minutes. You need
nothing from a developer — just click through these.

**The two magic URLs you'll paste (copy them now):**

| What | Value |
|---|---|
| **Supabase callback** (goes into Google) | `https://stkfdavpjflpqoxjunnj.supabase.co/auth/v1/callback` |
| **Live app URL** (goes into Supabase redirect list) | `https://thelivinsine.github.io/B2furBerufApp/` |

### 8a. Create the Google OAuth client (Google Cloud Console)

1. Go to <https://console.cloud.google.com> and pick or create any project
   (name it e.g. "B2 Beruf App").
2. **APIs & Services → OAuth consent screen**: choose **External**, fill in app
   name ("Genauly"), your support email, and the developer email.
   Save. (You can leave it in "Testing" — add your own Google address under
   **Test users** — or click **Publish app** so anyone can sign in.)
3. **APIs & Services → Credentials → + Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized redirect URIs → Add URI**: paste the **Supabase callback**
     from the table above: `https://stkfdavpjflpqoxjunnj.supabase.co/auth/v1/callback`
   - Create. Copy the **Client ID** and **Client secret** it shows you.

### 8b. Turn on the Google provider (Supabase dashboard)

1. **Authentication → Providers → Google** → toggle **ON**.
2. Paste the **Client ID** and **Client secret** from step 8a. **Save**.
3. **Authentication → URL Configuration**: make sure the **Site URL** is
   `https://thelivinsine.github.io/B2furBerufApp/`, and under **Redirect URLs**
   add `https://thelivinsine.github.io/B2furBerufApp/**` (the `**` wildcard
   covers the hash routes). For local testing you can also add
   `http://localhost:5173/**`. **Save**.

### 8c. Tell Claude it's done

Reply "Google is configured" and the change deploys (one squash-merge). Then
smoke-test: open the live site → **Anmelden** → **Weiter mit Google** → it
should bounce to Google, then back, and land you signed in with your
guest progress preserved.

> If the button errors with "provider is not enabled", step 8b isn't saved yet.
> If Google shows "redirect_uri_mismatch", the URI in 8a doesn't exactly match
> the Supabase callback (check for a stray space or missing `https://`).

---

## How the cost guardrails work (so you sleep at night)

- **Claude Haiku only** in production (cheapest capable model). Gemini Flash /
  gpt-4o-mini are wired as automatic fallbacks **only on hard failure**.
- **LanguageTool pre-check**: if the dominant problem is spelling, the function
  returns a templated tip with **no LLM call at all** (free).
- **Per-input cache**: identical resubmissions return the stored insight free.
- **Daily limit**: `DAILY_LIMIT` (default 5) reviews per user per day.
- **Monthly auto-shutoff**: once the month's estimated spend hits
  `MONTHLY_SPEND_CAP_USD` (default **$5**), new AI calls are disabled with a
  graceful message until the next month. Tracked in the `ai_usage` table.

Target spend: low single-digit dollars per month even at hundreds of users.

## Where the secrets live (recap)

| Value | Where it lives | Public? |
|---|---|---|
| Supabase URL + publishable key | `src/lib/supabaseConfig.ts` (committed) | ✅ public, RLS-protected |
| Anthropic / Gemini / OpenAI keys | Supabase Edge Function secrets | ❌ secret |
| LanguageTool key | Supabase Edge Function secrets | ❌ secret |
| Service-role key | injected into the function by Supabase | ❌ secret |

## GDPR features: founder setup steps

The in-app GDPR features (data export, account deletion, per-submission delete,
honest reset) ship in the frontend, but three of them need a one-time action in
the Supabase dashboard. Do these once after the GDPR PR is live:

1. **Per-submission delete policy (required for the writing-history delete button).**
   Run the migration `supabase/migrations/0003_writing_delete_policy.sql` in the
   Supabase SQL editor. Without it the delete button fails loudly (it never
   silently pretends to work). Verify: the policy `writing_delete_own` appears
   under Authentication → Policies for `writing_evaluations`.

2. **Account-deletion Edge Function (required for the "Konto löschen" button).**
   Deploy it: `supabase functions deploy delete-account`. No new secrets are
   needed (`SUPABASE_SERVICE_ROLE_KEY` is injected automatically). If you set the
   `ALLOWED_ORIGINS` secret for `evaluate-writing`, it applies here too; make sure
   it includes `https://genauly.de`. The function only ever deletes the caller's
   own account (it derives the user id from their login token, never from the
   request), and the delete cascades to all of that user's rows.

3. **Optional: auto-retention for writing text.** Writing submissions are kept
   until the user deletes them (per-item or by deleting the account). If you also
   want an automatic time limit, enable `pg_cron` and schedule a daily purge in
   the SQL editor:
   ```sql
   create extension if not exists pg_cron;
   select cron.schedule(
     'purge-old-writing', '0 3 * * *',
     $$ delete from public.writing_evaluations where created_at < now() - interval '12 months' $$
   );
   ```
   Default suggestion: 12 months. If you enable this, make the retention wording
   in `PrivacyPolicy.tsx` match. To change the window: `select cron.unschedule('purge-old-writing');`
   then reschedule. Verify jobs with `select * from cron.job;`.

4. **Fill the placeholders.** Replace the `[...]` legal name + address in
   `src/features/legal/Impressum.tsx`, and the `[fill in region]` data-location
   note in `PrivacyPolicy.tsx` (both DE and EN), before public launch.
   - **Note (2026-06-08): the Impressum is currently HIDDEN** (route commented out
     in `router.tsx`, all links removed) because the real name/address aren't set
     yet. An Impressum is public by law, so use a business/service address (a
     "ladungsfähige Anschrift", not a P.O. box) rather than a home address. To
     re-enable: fill the placeholders, then uncomment the import + `/impressum`
     route in `router.tsx` and restore the footer/Settings/privacy/terms links.

## In-app feedback → your inbox: founder setup steps (session 105, 2026-07-13)

The subtle "Mit KI gebaut · Feedback" button on every page posts to the
`submit-feedback` Edge Function, which stores each message in a `feedback` table
**and** emails you. The button + storage work as soon as the function is
deployed; the email needs one API key. Do this once:

1. **Create the feedback table.** Run `supabase/migrations/0006_feedback.sql` in
   the Supabase SQL editor. It creates `public.feedback` (service-role only, like
   `ai_usage`), so nothing is ever lost even if email is down.
2. **Deploy the function.** `supabase functions deploy submit-feedback`. It is
   registered with `verify_jwt = false` (in `supabase/config.toml`) so anonymous
   visitors can send feedback; the function attaches the user id only when a
   valid login token is present. The shared `ALLOWED_ORIGINS` secret applies.
3. **Turn on the email (Resend, free tier, no domain setup needed).** Sign up at
   <https://resend.com>, create an API key, then:
   ```bash
   supabase secrets set RESEND_API_KEY=re_...your-key...
   ```
   By default the mail is sent **from** Resend's shared `onboarding@resend.dev`
   **to** `thelivinsine@gmail.com` — Resend delivers to the account owner's own
   verified email with no domain verification, so this works out of the box. To
   change the recipient or use your own domain later:
   ```bash
   supabase secrets set FEEDBACK_TO_EMAIL=you@example.com
   supabase secrets set "FEEDBACK_FROM_EMAIL=Genauly Feedback <feedback@genauly.de>"
   ```
   Without `RESEND_API_KEY` the feedback is still stored in the table (read it in
   the Supabase dashboard), it just isn't emailed.
4. **Redeploy after the rate-limit change (session 112, demo prep).** The
   `submit-feedback` function now has abuse protection for the public demo link:
   a per-IP burst limit (≤5 submissions per 10 minutes) and a global ceiling that
   stops the notification email once 60 messages arrive in an hour (rows are still
   stored, so nothing is lost). It needs **no new migration or secret** — just
   redeploy so the new code is live:
   ```bash
   supabase functions deploy submit-feedback
   ```
   Optional: `supabase secrets set FEEDBACK_IP_SALT=some-random-string` sets the
   salt used to hash IPs for the in-memory burst check (a sensible default is
   built in, so this is not required).

### Optional extra abuse protection for the shared demo link

Neither is required for the demo (the in-code feedback rate limit above is the
real fix), but both are one-click hardening if you want them:

- **Turnstile on guest sign-in** — see section 4 above. Enabling the Cloudflare
  Turnstile CAPTCHA stops bots from mass-creating guest accounts. Set the site
  key env for the client (`VITE_TURNSTILE_SITE_KEY`) and the secret in the
  Supabase Auth dashboard.
- **Resend SMTP for magic-link/auth email rate-limiting** — Supabase's built-in
  email sender has a low shared rate limit. Wiring your Resend account as the
  custom SMTP provider (Supabase dashboard → Auth → SMTP Settings) gives you a
  higher, dedicated limit for sign-in emails. Uses the same `RESEND_API_KEY`
  account you set above.

## Admin source review (provenance QC): founder setup step

The `/sources` page has a founder-only **data workbench** (redesigned s130): the
full content register as a searchable, filterable, sortable table with CSV
export, plus a live "geprüft" checkbox and note per item. It is gated to the two
admin accounts both in the UI and server-side. To turn it on, run the
migrations once:

1. **Create the review table.** Run `supabase/migrations/0004_provenance_reviews.sql`
   in the Supabase SQL editor. It creates `public.provenance_reviews` with an RLS
   policy that only allows the founder login email to read or write. No other
   user (and no anonymous visitor) can see the marks or notes. Verify: the policy
   `provenance_reviews_founder_all` appears under Authentication → Policies for
   `provenance_reviews`.
2. **Extend the gate to both admin accounts (s130).** Run
   `supabase/migrations/0007_provenance_reviews_admins.sql` in the SQL editor. It
   replaces the policy so BOTH `thelivinsine@gmail.com` and
   `thesuhaspala@gmail.com` can read/write review marks. Without it the second
   account sees the workbench but its saves silently fail server-side.
3. **Use it.** Sign in with either account and open `/sources`: the
   "Daten-Werkbank" appears at the top with search, type/tier/status filters, a
   CSV export of the filtered view, and per-row checkbox + note (saved
   immediately, shared between the two admin accounts). If you skip the
   migrations the page still works for everyone, the saves just silently no-op
   (best-effort, offline-first).
   - If the gating emails ever change, update them in BOTH the RLS policy (a new
     migration) and `FOUNDER_EMAILS` in `src/lib/admin.ts` (the
     `tests/admin.test.ts` expectation pins the list).

## Admin control center backend (migration 0008): founder setup step

The admin center (`/admin`, build plan chunk 1, session 144) needs one database
migration. It upgrades the review table to real decisions (approve / reject /
needs fix, with the safety hash), adds the feedback triage fields (status,
priority, note, link), creates the `app_config` table for the Steuerung
switches and the `launch_checklist` storage, and installs the founder-only
database functions that power the dashboard tiles. The functions return
aggregate numbers only (counts and day totals), never individual user data.

1. **Run the migration.** Open the Supabase dashboard SQL editor, paste the
   full contents of `supabase/migrations/0008_admin_center.sql`, and run it.
   It is safe to re-run if it was already applied.
2. **Verify it landed.** In the Table Editor you should now see two new tables,
   `app_config` and `launch_checklist`. Under Database → Functions you should
   see `admin_overview`, `admin_daily_series`, `admin_feedback_recent`,
   `admin_feedback_update`, `is_founder`, and `assert_founder`.
3. **Verify the gate (optional, 1 minute).** In the SQL editor run
   `select public.admin_overview();` It should return a JSON blob of counts
   (the dashboard runs with elevated rights, so this only proves the function
   works). The founder-only gate itself is enforced INSIDE each function: any
   session whose login email is not one of the two founder accounts gets
   "forbidden: founder account required". If your dashboard's SQL editor has
   the "Run as: anon/authenticated" impersonation dropdown, you can see that
   rejection live by re-running the same select impersonating `anon`. The
   email list is also pinned in CI (`tests/admin.test.ts`), so it cannot
   silently drift from the app's own founder list.
4. **Existing review marks are preserved.** Every item you already ticked in
   the Daten-Werkbank is carried over as an "approve" decision. Nothing needs
   re-clicking.

Nothing is visible in the app yet after this step; the `/admin` page itself
ships in a later chunk. This migration is the plumbing it stands on.
