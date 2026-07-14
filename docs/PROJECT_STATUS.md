# Project Status

_Last updated: 2026-07-14 (session 116). **Demo dress-rehearsal verification (Opus 4.8):** confirmed
`docs/plans/DEMO_READINESS_PLAN.md` is already fully executed on `main` (all P0/P1 chunks + the two
actionable P2 items merged through PR #522). Re-ran the full 9-gate set from a clean `pnpm install` as
the plan's final dress-rehearsal step, all green (typecheck · lint 0 err/44 warn · lint:content ·
test:unit 134/134 · test:srs 323 · test:pronounce 26 · audit 0 vulns · build+prerender ·
check:bundle 79.5 kB/400). No source, plan, or checkbox changes (nothing left to fix); discarded a
`tsconfig.app.tsbuildinfo` build-cache churn. Only remaining plan items are founder-console ops
(Turnstile, Resend SMTP) and post-demo feedback triage. Doc-only session. Product name: **Genauly**
(`genauly.de`)._

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
- **`../CLAUDE.md`** — developer/agent operating instructions, content conventions, and locked designs.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Heute · Bibliothek · Anwenden · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1 complete),
Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `../CLAUDE.md`.

**Content banks (as of 2026-07-12, session 102 — re-verify with `pnpm lint:content` before quoting):**
vocab **1,113** · collocations **741** · Redemittel **149** · grammar **24 topics / 117 drills** ·
Lese-/Hörtexte **26** (78 checks) · Can-Do **37** · provenance **2,263 rows** · themes **15** ·
exam sets **15** · dialogues **20**. All six top-level domains are populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: ~98% of provenance rows are AI-drafted, not yet human-verified (see
`strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
- [ ] (Optional) Enable Turnstile CAPTCHA on guest sign-in to deter bot abuse before public launch.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 116 (2026-07-14). Demo dress-rehearsal verification (Opus 4.8), on branch
`claude/predemo-plan-steps-3gc981`. No changes to ship — verification-only.** The prompt was "complete
as many steps from the predemo plan as possible". Finding: `docs/plans/DEMO_READINESS_PLAN.md` was
**already fully executed and merged to `main`** (HEAD = `0513dd4` / PR #522) — every P0/P1 chunk (1–6)
plus both actionable P2 items (content-accuracy s112, security-review s115) checked off. The only
genuinely actionable step left was the plan's own closing line, "re-run the full gate set as the demo
dress rehearsal", so that is what this session did.
- **Ran all 9 gates from a fresh `pnpm install`, all green:** `pnpm typecheck` ✔ · `pnpm lint` 0
  errors / 44 deliberate react-hooks warnings ✔ · `pnpm lint:content` ✔ (tiers 25 human / 188 jury /
  1837 linguistic / 82 facts / 131 provenance) · `pnpm test:unit` 134/134 ✔ · `pnpm test:srs` 323 ✔ ·
  `pnpm test:pronounce` 26 ✔ · `pnpm audit` 0 vulns ✔ · `pnpm build` ✔ (7 prerendered help pages +
  sitemap, PWA precache 97 entries) · `pnpm check:bundle` 79.5 kB / 400 kB ✔. Matches the s111 baseline
  exactly.
- **No source / plan / checkbox changes** (nothing was broken or unfinished). The only working-tree
  diff was `tsconfig.app.tsbuildinfo` (a tracked TS build-cache file rewritten by running the gates);
  discarded it rather than commit artifact churn. This session touches docs only (status + prompt log).
- **Remaining (all outside what an automation session can do):** Turnstile enablement + Resend SMTP
  (standing pre-public-launch founder-console items) and post-demo feedback triage from the
  `public.feedback` table. Both next-week, neither demo-blocking. The app is demo-ready; the founder's
  live-site verification (hard-refresh + one runbook tour on the demo device) is the last step the
  sandbox cannot do.

**Handoff after session 115 (2026-07-14). Demo-readiness sweep finished (Opus 4.8), on branch
`claude/predemo-sweep-tasks-25oejy`.** Closed the remaining open chunks of
`docs/plans/DEMO_READINESS_PLAN.md`: P0 Chunk 1 (smoke test), Chunk 4 (UI polish), Chunk 5 (runbook),
and P1 Chunk 6 (perf). Chunks 2+3 were already done s112. **The whole P0+P1 plan is now complete.**
- **Chunk 1 — smoke test (clean sweep):** Playwright over `pnpm preview`, 4 combos (390×844 mobile +
  1440×900 desktop) × (light + dark), 28 routes each + cold-start onboarding + a core-interaction pass
  (session blocks, mission scenes, filter-rail facet+reset, Graph view, Grammatik lesson). Zero
  console errors, zero error boundaries, zero blank pages, zero dead routes, zero horizontal overflow.
  Redirects preserve params; `/anwenden`+`/welt` resolve; junk `?`-params fall back. Scripts in the
  session scratchpad, not the repo.
- **Chunk 4 — UI polish:** reviewed screenshots of every demo-visible screen (light+dark, mobile+
  desktop). No blemishes: consistent nav labels, no em dashes, dark mode solid (missions light-only +
  hub theme-aware both by design), clean empty states, no overflow. **No code changes needed.**
- **Chunk 5 — runbook:** wrote `docs/DEMO_RUNBOOK.md` (device prep, two demo states, tour order,
  failure fallbacks, founder console checklist). The s112 feedback function + rate-limit are **already
  deployed and live** (founder confirmed), so no deploy step is pending for the demo.
- **Chunk 6 — perf:** main chunk 79.5 kB/400; throttled (1.6 Mbps/4× CPU) first paint ~3.3–3.5s on
  `/`, `/library`, Graph, `/welt`, `/sammlung`; lazy chunks load without an error flash.
- **Also ran the P2 whole-app security review** (Opus 4.8): manual audit of the 3 Edge Functions, all
  6 RLS migrations, client config, cloudSync isolation, XSS/CSP, and supply chain. **No critical/high
  findings** — RLS owner-scoped everywhere, service-role-only `ai_usage`/`feedback`, JWT-gated
  functions with ids from the token, rate-limited feedback, only the publishable anon key client-side,
  strong CSP (no `unsafe-inline`/`unsafe-eval` on `script-src`), `pnpm audit` 0 vulns. A few
  low-severity defense-in-depth notes documented, none demo/launch-blocking. Report:
  `docs/reports/security-review-2026-07-14.md`.
- **Only doc changes** this session (`DEMO_READINESS_PLAN.md` checkboxes + findings, new
  `DEMO_RUNBOOK.md` + security-review report, this status + the prompt log). No source touched.
  All 9 gates green.
- **Remaining (P2):** Turnstile enablement + Resend SMTP (standing pre-public-launch founder items),
  and post-demo feedback triage from the `public.feedback` table. Both next-week, not demo-blocking.

_(Session 113's brand-identity exploration handoff, session 114's Theorie pill-animation + dark-mode
contrast handoff, session 113's Theorie tab-transition/compass/feedback-pill polish handoff, session
112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's
handoffs, plus the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
