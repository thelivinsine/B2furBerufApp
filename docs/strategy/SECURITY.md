# Security

This document summarises Genauly's security posture, the hardening work done, and the
**founder action items** that can only be completed in the Supabase dashboard.

The full audit and remediation plan is in `docs/reference/SECURITY_AUDIT_PLAN.pdf`.

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

## Hardening (security series, rolled out in 4 PRs + Turnstile)

| Area | Change | Status |
|---|---|---|
| Dependencies | Fixed react-router open redirect (GHSA-2j2x-hqr9-3h42). `pnpm audit` → 0 vulns. | ✅ shipped (PR 1) |
| Supply chain | Migrated to **pnpm** with `minimum-release-age` (24h cooldown), integrity verification, and a default-deny on dependency build scripts. | ✅ shipped (PR 1) |
| Edge Function CORS | Replaced `Access-Control-Allow-Origin: *` with an **allowlist** (genauly.de, localhost, `*.github.io`; override via `ALLOWED_ORIGINS`). | ✅ shipped (PR 2) |
| AI abuse | Added a **max input length** (`MAX_TEXT_LEN`, default 3000) and a **per-user monthly cap** (`USER_MONTHLY_LIMIT`, default 50). | ✅ shipped (PR 2) |
| Frontend | Content-Security-Policy (report-only first); self-hosted fonts (no third-party `rsms.me`). | ✅ shipped (PR 3) |
| CI | GitHub Actions pinned to commit SHAs; minimal workflow permissions. | ✅ shipped (PR 4) |
| Bot protection | Cloudflare Turnstile CAPTCHA on all auth flows (guest, sign-up, login, Google). | ✅ shipped (PR 5, 2026-06-06) |

_All hardening is complete and live. Remaining: flip CSP report-only → enforcing once the
live console is confirmed clean (one-line change in `index.html`)._

## Founder action items (Supabase dashboard — only you can do these)

1. **✅ DONE (2026-06-05) — Redeploy `evaluate-writing`.**
   The CORS allowlist, input cap, and per-user monthly cap are now **live**.

2. **✅ DONE (2026-06-06) — Cloudflare Turnstile CAPTCHA enabled.**
   - Cloudflare Turnstile widget created for `genauly.de`.
   - `VITE_TURNSTILE_SITE_KEY` GitHub Actions secret set → baked into the build.
   - Supabase Authentication → Attack Protection → Turnstile enabled with the secret key.
   - All sign-in flows (guest, sign-up, email login, Google OAuth) are now CAPTCHA-protected.

3. **(Optional) Set the Edge Function secrets** to override the safe defaults.
   Dashboard → **Edge Functions** → **evaluate-writing** → **Secrets**:
   - `ALLOWED_ORIGINS` — comma-separated live origins (defaults already cover genauly.de).
   - `MAX_TEXT_LEN` — max characters per submission (default `3000`).
   - `USER_MONTHLY_LIMIT` — max AI evaluations per user per month (default `50`).

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
