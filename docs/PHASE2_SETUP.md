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
