# Security

This document summarises Genauly's security posture, the hardening work done, and the
**founder action items** that can only be completed in the Supabase dashboard.

The full audit and remediation plan is in `docs/SECURITY_AUDIT_PLAN.pdf`.

## Posture (what's already right)

- **Secrets are server-side only.** The Anthropic/OpenAI/Gemini keys and the Supabase
  service-role key live solely in Supabase Edge Function secrets — never in the repo or
  the browser. Only the **publishable/anon key** is committed
  (`src/lib/supabaseConfig.ts`), which is safe because every table has owner-only
  Row-Level Security (`supabase/migrations/0001_init.sql`).
- **Database access is owner-only.** All user tables enforce `auth.uid() = owner` RLS.
  The global `ai_usage` table has **no** client policies — only the service role can
  touch it.
- **No dangerous rendering.** No `dangerouslySetInnerHTML`, `eval`, or unsanitised DOM
  injection anywhere in the app.
- **Service worker** precaches only static build assets — it never caches authenticated
  API responses.
- **AI cost is guarded** by a per-user daily limit, a per-user monthly limit, a global
  monthly spend auto-shutoff, an input-size cap, and an input-hash cache.

## Hardening (security series, rolled out in 4 PRs)

| Area | Change | Status |
|---|---|---|
| Dependencies | Fixed react-router open redirect (GHSA-2j2x-hqr9-3h42). `pnpm audit` → 0 vulns. | ✅ shipped (PR 1) |
| Supply chain | Migrated to **pnpm** with `minimum-release-age` (24h cooldown), integrity verification, and a default-deny on dependency build scripts. | ✅ shipped (PR 1) |
| Edge Function CORS | Replaced `Access-Control-Allow-Origin: *` with an **allowlist** (genauly.de, localhost, `*.github.io`; override via `ALLOWED_ORIGINS`). | ✅ shipped (PR 2) |
| AI abuse | Added a **max input length** (`MAX_TEXT_LEN`, default 3000) and a **per-user monthly cap** (`USER_MONTHLY_LIMIT`, default 50). | ✅ shipped (PR 2) |
| Frontend | Content-Security-Policy (report-only first); self-hosted fonts (no third-party `rsms.me`). | PR 3 |
| CI | GitHub Actions pinned to commit SHAs; minimal workflow permissions. | PR 4 |

_Note: the Edge Function changes are live in this repo but take effect only after the
founder redeploys the function (see action item 3 below)._

## Founder action items (Supabase dashboard — only you can do these)

Do these **after** the Edge Function hardening PR is merged:

1. **Enable Turnstile CAPTCHA on sign-in.**
   Supabase dashboard → **Authentication** → **Settings** → **Bot & Abuse Protection** →
   enable **Turnstile**. This deters bots from farming anonymous guest accounts to drain
   the shared AI budget.

2. **(Optional) Set the Edge Function secrets** to override the safe defaults.
   Dashboard → **Edge Functions** → **evaluate-writing** → **Secrets**:
   - `ALLOWED_ORIGINS` — comma-separated list of your live origins (e.g.
     `https://genauly.de,https://www.genauly.de`). The function already defaults to these,
     so this is only needed if your domain changes.
   - `MAX_TEXT_LEN` — max characters per submission (default `3000`).
   - `USER_MONTHLY_LIMIT` — max AI evaluations per user per month (default `50`).

3. **Redeploy `evaluate-writing`.**
   Dashboard → **Edge Functions** → **evaluate-writing** → open the code editor →
   **select-all-delete**, paste the latest `supabase/functions/evaluate-writing/index.ts`
   from this repo → **Deploy**. (The sandbox can't reach `api.supabase.com`, so this step
   is manual.)

4. **(Optional, pre-existing) Add Resend SMTP** to fix the email magic-link rate limit:
   Authentication → SMTP settings.

## Known low-severity items (documented, not blocking)

- `writing_evaluations.text` retains user-submitted practice text indefinitely
  (RLS owner-only, so it stays private). A retention/auto-delete policy is a future
  decision, not a current vulnerability.

## Secret-handling rules (do not break)

- The Anthropic key lives **only** in Supabase Edge Function secrets as
  `ANTHROPIC_API_KEY` — never in the repo, the browser, or chat.
- The Supabase service-role key: **never** in the repo or browser.
- The Supabase publishable/anon key **is** safe to commit (owner-only RLS on every table).
