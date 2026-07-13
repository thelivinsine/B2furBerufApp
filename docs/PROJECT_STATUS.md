# Project Status

_Last updated: 2026-07-13 (session 112, **demo-readiness Chunks 2+3 (Opus 4.8)**). Regression review
of the s102–110 demo-prep rounds + abuse hardening for the shared demo link. Fixed stale "(Heute)"
copy (session eyebrow + the `erste-schritte` help article); verified the returning-user `pinnedTabs`
migration, the feedback surfaces, and `/session` junk-param handling are all safe. Added two
migration-free rate-limit guards to `submit-feedback` (per-IP burst + global hourly email ceiling),
re-checked RLS across migrations 0001–0006, and re-confirmed the `delete-account`/`evaluate-writing`
auth gates. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 112 (2026-07-13). Demo-readiness Chunks 2 + 3 shipped (Opus 4.8), on branch
`claude/predemo-opus-tasks-ek5qhz`.** The two Opus "Tonight A" chunks of `DEMO_READINESS_PLAN.md`:
regression review of the s102–110 demo-prep rounds + abuse hardening of the public feedback path.
- **Chunk 2 (regression review) — findings:** fixed the two stale "(Heute)" strings the rename left
  behind (`Session.tsx` session-empty-state eyebrow → "Praktisch"; the `hilfe/erste-schritte` help
  article DE+EN → "(Praktisch)", reprerendered). Verified SAFE with no change needed: (a) the
  returning-user `pinnedTabs`/`ROUTE_SUCCESSOR` migration — `BottomTabBar` filters pins to
  `CONTENT=["/library","/analytics"]` and `BarTab` returns null for unknown paths, and `Sidebar`
  renders `navItems` directly, so a stale `/anwenden` pin from a pre-s105 device can't break either
  bar; (b) the feedback surfaces (pill desktop-only + off `/` + off focus/missions, dialog mounted
  app-wide, graceful failure); (c) `/session` junk-param handling (`mission`/`grammar`/`theme`/`cefr`/
  `sector`/`cat`/`sub`/`min` all fall back, never crash).
- **Chunk 3 (abuse hardening) — shipped:** `submit-feedback` (`supabase/functions/submit-feedback/`)
  now has two **migration-free** guards: a per-IP burst limit (≤5 / 10 min, in-memory, hashed IP) and
  a DB-backed global hourly email ceiling (≤60/hr stops the email but still stores the row). Friendly
  German error preserved. RLS re-checked across 0001–0006 (all owner-scoped to `auth.uid()` or the
  founder-email gate; `feedback` + `ai_usage` service-role-only; no public SELECT). `delete-account` +
  `evaluate-writing` re-confirmed JWT-gated + CORS-allowlisted; evaluate-writing keeps its daily/
  monthly/per-user caps. Founder console steps added to `docs/plans/PHASE2_SETUP.md`.
- **⚠️ Founder action:** run `supabase functions deploy submit-feedback` for the rate limit to go live
  (no new migration or secret needed; optional `FEEDBACK_IP_SALT`).
- **Gates:** all green — typecheck ✔, lint 0 errors/44 warnings, lint:content ✔, test:unit 134/134,
  test:srs 323, test:pronounce 26, build+prerender ✔, check:bundle 79.5 kB/400.
- **Remaining plan chunks:** 1 Playwright smoke test (Sonnet 5), 4 UI polish (Sonnet 5), 5 demo runbook
  `docs/DEMO_RUNBOOK.md` (Sonnet 5), 6 perf sanity (Sonnet 5, P1). See `DEMO_READINESS_PLAN.md`.

**Handoff after session 111 (2026-07-13). Demo-readiness PLAN authored + baseline verified (Fable 5);
implementation intentionally NOT started.** The demo is **2026-07-14** (founder presents live, then
shares the link; both a seeded account and a clean profile are wanted). The founder is nearly out of
Fable for the week, so the plan routes every implementation chunk to Opus 4.8 / Sonnet 5 and defers
Fable-grade work to next week. **Start the next session by reading
`docs/plans/DEMO_READINESS_PLAN.md` and picking a chunk from its Session-packaging table (set the
model via `/model` first).**
- **Baseline verified on `main` (ae0c2fc) — do NOT redo:** all 9 gates green (typecheck; lint 0
  errors / 44 deliberate warnings; lint:content; test:unit 134/134; test:srs 323; test:pronounce 26;
  audit 0 vulnerabilities; build + prerender; bundle 79.5 kB/400). Security greps clean (no secrets,
  no XSS sinks, every `target="_blank"` carries `rel="noreferrer"`, only public keys reach the
  client). Confirmed: `public/404.html` SPA fallback exists; the PWA is `autoUpdate` (demo devices
  need a hard refresh after the final merge); `evaluate-writing` has daily + monthly cost caps.
- **Known gap found:** `submit-feedback` has NO rate limit (input caps + CORS allowlist only), so an
  audience member could spam the founder's inbox via Resend. Fix is plan Chunk 3 (Opus 4.8).
- **Plan chunks (P0):** 1 Playwright smoke test of the demo path (Sonnet 5) · 2 regression review of
  PRs #477–#500 incl. the `pinnedTabs`/`ROUTE_SUCCESSOR` migration for returning devices (Opus 4.8) ·
  3 abuse hardening (Opus 4.8) · 4 demo-visible UI polish (Sonnet 5) · 5 `docs/DEMO_RUNBOOK.md` +
  seeded/clean demo states (Sonnet 5). P1: 6 perf sanity (Sonnet 5). P2 next week: Fable content
  proofread + a full security-review session. Each chunk carries a non-technical founder summary.
- **NOT done:** all implementation chunks (deliberate; the founder runs them in fresh sessions on the
  recommended models). Standing content/Üben-map follow-ups unchanged from prior sessions.

_(Sessions 85-110's handoffs, and the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
