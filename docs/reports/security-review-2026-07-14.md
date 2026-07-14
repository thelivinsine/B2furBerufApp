# Security review — whole app (session 115, 2026-07-14)

_P2 item from `docs/plans/DEMO_READINESS_PLAN.md`: a full security pass over the whole app (not just a
diff), run on Opus 4.8. Scope: the three Supabase Edge Functions, all six RLS migrations, the client
Supabase config + auth/cloudSync, XSS/injection sinks, CSP, and supply-chain posture. `pnpm audit`
clean (0 vulnerabilities)._

## Verdict

**No critical or high-severity findings. The app is in strong security shape for a public shared link.**
Everything the s111 baseline and the s112 Chunk 2/3 pass claimed was re-verified against the source, and
the review went wider (client config, CSP, cloudSync isolation, supply chain). Only a handful of
low-severity / defense-in-depth observations remain, none demo- or launch-blocking.

## Verified strong (no action needed)

**Row-Level Security (migrations 0001–0006).** Every user table is owner-scoped to `auth.uid()`
(`profiles`, `progress`, `writing_evaluations` select+delete, `saved_words` via `progress`). `ai_usage`
and `feedback` have **RLS enabled with no client policies** — service-role only, so no client can read or
write them (no public SELECT anywhere). `provenance_reviews` is gated to the founder email via
`auth.jwt() ->> 'email'`. All `SECURITY DEFINER` functions (`handle_new_user`, `touch_updated_at`,
`bump_ai_usage`) pin `set search_path = public`, and `bump_ai_usage` is revoked from
`public/anon/authenticated`.

**Edge Functions.** All three share a strict CORS allowlist (`genauly.de`, `www.genauly.de`,
`localhost:5173`, plus `https://*.github.io`), reflecting the Origin only when allowlisted.
- `evaluate-writing` and `delete-account` are **JWT-gated** (401 when unauthenticated); the user id is
  always derived from the verified token, never from the request body.
- `delete-account` deletes only the caller's own auth user (cascade removes owned rows).
- `evaluate-writing` enforces a text-length cap plus **three cost guards** (per-user daily, per-user
  monthly, global monthly-$ auto-shutoff), caches by per-user input hash, and validates the LLM's
  `weakness` against a closed enum. Secrets (Anthropic/Gemini/OpenAI/service-role) are server-side only.
- `submit-feedback` is intentionally anonymous-OK but hardened with a **per-IP burst limit** (≤5/10 min,
  salted+hashed IP) and a **global hourly email ceiling** (≤60/hr stops the email but still stores the
  row). Inputs are length-capped and the email body is HTML-escaped.

**Client / browser.** Only the **publishable anon key + Supabase URL** reach the browser (safe under
RLS); no service-role or LLM keys anywhere in `src/`. `.env`/`.env.*` are gitignored (only `.env.example`
committed). Account isolation (s108) is correct: `startCloudSync` wipes local stores when the persisted
`b2beruf.syncUid` differs from the new uid **before** pulling, and all reads are uid-scoped on top of RLS.

**XSS / injection.** No `dangerouslySetInnerHTML`, `eval`, or `new Function` in `src/` (the lone
`innerHTML = ""` in `main.tsx` just clears prerender). React auto-escaping renders all user/LLM content as
text. A genuinely **strong enforcing CSP** ships as a meta tag (GitHub Pages can't set HTTP headers):
`default-src 'self'`, `script-src` **without** `unsafe-inline`/`unsafe-eval` (Turnstile the only extra
origin), `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. Every `target="_blank"` carries
`rel="noreferrer"` (no reverse-tabnabbing).

**Supply chain.** `.npmrc` sets `minimum-release-age=1440` (24h cooldown), `verify-store-integrity`, and
`package-manager-strict`; pnpm blocks dependency build scripts by default; `pnpm audit` reports 0
vulnerabilities.

## Low-severity observations (optional; none demo-blocking)

1. **Feedback table growth under distributed abuse.** Past the 60/hr email cap, rows are still stored, so
   a botnet across many IPs (each capped at 5/10 min) could inflate `public.feedback`. No founder-inbox
   or $ impact (email is hard-capped), only DB rows. If it ever matters, add a global hourly *store* cap
   or enable Turnstile on the feedback form. Fine as-is for the demo.
2. **`email` reply-to not format-validated** in `submit-feedback` (it is length-capped). Header injection
   is impossible (Resend JSON API, not raw SMTP), so worst case is a rejected send with the row still
   stored. A simple regex would be a cosmetic tightening.
3. **Turnstile is optional** (active only if `VITE_TURNSTILE_SITE_KEY` is set). Guest-account abuse of the
   LLM budget is already bounded by the per-user/global cost caps, so this is defense-in-depth. Enabling
   it before a public launch is already a tracked founder item.
4. **CSP `style-src 'unsafe-inline'`** is required by React/framer-motion/recharts inline styles. Low risk
   (styles cannot execute JS); removing it would need a significant refactor. Standard tradeoff, accepted.
5. **Prompt injection in `evaluate-writing`.** User text reaches the LLM, but the output is enum-constrained,
   React-escaped, and only ever shown back to the same user, so impact is negligible. No action.

## Recommended before a wider public launch (already in the backlog, not for demo day)

- Enable Cloudflare Turnstile on guest sign-in (site key env + console step).
- Add Resend SMTP for the auth magic-link rate-limit.

Both are the standing "Open founder action items" in `docs/PROJECT_STATUS.md`; neither blocks the demo.
