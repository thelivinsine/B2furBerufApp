# Project Status

_Last updated: 2026-07-13 (session 113). **Theorie tab-transition polish (Opus 4.8):** the Bibliothek
(Theorie) tab switch flashed blank on every toggle; replaced the enter-only CSS keyframe + `null`
Suspense fallback in `LibraryHub` with the Praktisch-style `AnimatePresence mode="wait"` directional
slide + a shaped skeleton, and bumped the Praktisch compass route mark's optical weight `0.95→1.05` so
it matches its nav neighbors (PR #506). All gates green. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 113 (2026-07-13). Theorie tab-transition + compass-icon polish (Opus 4.8), on
branch `claude/theory-toggle-transitions-hloi6s`, merged to `main` (PR #506).** Two small UX fixes,
no logic/data change.
- **Theorie tab slide (took two rounds):** switching Wörter/Kollokationen/Redemittel/Grammatik used to
  flash blank + reload. Round 1 swapped the enter-only CSS keyframe + `Suspense fallback={null}` for the
  Praktisch `AnimatePresence mode="wait"` directional `x`-slide + skeleton (removed the dead
  `.lib-slide-in-*` keyframes). Round 2 (the real fix): the `LibrarySwitcher` (tab bar) was rendered
  INSIDE each trainer, so it sat in the animated subtree and the tabs themselves reloaded on every
  toggle. **Hoisted the switcher into `LibraryHub` as one static element** (only the content slides now,
  true Praktisch parity; the shared-layout pill glides between tabs), removed `<LibrarySwitcher/>` from
  the 4 trainers + `GrammarTopicView` (else the lesson doubles the bar), and **preload all 4 tab chunks
  on mount** so a switch never hits the loading skeleton. Desktop tabs sit at content-column width (col 1
  of the same `[1fr,16rem]` grid). Verified in Chromium (1280×900 + 390×844): one bar per surface,
  static tabs + pill glide mid-transition, no skeleton flash. framer resolves the resting `x:0` to
  `transform:none`, so the sticky filter rail / Üben bar are not trapped.
- **Compass icon:** the Praktisch route mark is a thin outline ring that read smaller than its neighbors;
  bumped its optical weight `0.95→1.05` in `route-icons.tsx` `NORM` so it matches
  Theorie/Fortschritt/Einstellungen.
- **Files:** `src/features/library/LibraryHub.tsx` · `src/index.css` · `src/components/layout/route-icons.tsx`.
- **Gates:** build+prerender green; check:bundle 79.5 kB/400; no remaining `.lib-slide-in-*` refs.

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

_(Session 112's P2 content-accuracy handoff, session 111's handoff (demo-readiness plan authored + baseline verified) and sessions 85-110's
handoffs, plus the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
