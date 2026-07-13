# Project Status

_Last updated: 2026-07-13 (session 111, **demo-readiness plan**, Fable 5). Verified all 9 CI gates
green on `main` (ae0c2fc) plus a clean security-grep pass, then authored
**`docs/plans/DEMO_READINESS_PLAN.md`**: the chunked pre-demo sweep (smoke test, regression review,
abuse hardening, UI polish, demo runbook) for the **2026-07-14 demo**, with a model recommendation per
chunk (implementation on Opus 4.8 / Sonnet 5; founder low on Fable this week). Docs-only session, no
app code changed. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 110 (2026-07-13). Bibliothek tab-switch slide animation (Opus 4.8), on branch
`claude/bibliothek-slide-animations-hdf738`.** Founder: switching between the four Bibliothek/Theorie
tabs loaded the content abruptly; wanted a snappy left/right slide. (Code shipped as PR #495 / `43761a3`,
which merged just before the session-109 fixes above; documented here as a distinct handoff.)
- **Change:** `LibraryHub` (`src/features/library/LibraryHub.tsx`) computes the tab-index direction
  (target vs. previous, via a `useRef`) and wraps the segment in `<div key={tab}>` with a
  `.lib-slide-in-right` / `.lib-slide-in-left` class. The four segments already remount per `?tab=`, so
  the mount-time keyframe replays each switch: the incoming panel slides in ~220ms from the side tapped
  toward (forward = from the right) and fades up (`cubic-bezier(0.22,1,0.36,1)`). Enter-only (the old
  panel is swapped out instantly), which keeps it snappy and avoids double-mounting two heavy lazy lists.
- **Why a CSS keyframe, not a framer transform wrapper:** the tab bar (`LibrarySwitcher`) lives INSIDE
  each segment, and the segments rely on `position: sticky`/`fixed` descendants (desktop filter rail,
  mobile sticky Üben action bar, fixed scroll-top button). A persistent `transform` at rest establishes a
  containing block and would trap all of those. The keyframe (`.lib-slide-in-*` in `index.css`) uses the
  **default `none` fill-mode**, so the transform exists only during the slide and reverts to none at rest.
  Global `html`/`body` `overflow-x: clip` means the 1.25rem offset adds no scrollbar; the existing global
  `prefers-reduced-motion` rule already neutralises it.
- **Gates:** typecheck ✔, `pnpm build` + prerender ✔, `check:bundle` **77.4 kB**/400, `test:unit`
  **134/134**. **Shipped:** PR #495 squash-merged to `main` (`43761a3`).
- **NOT done / consider next:** it is enter-only, not a full swipe (old panel doesn't slide out); a true
  swipe would need AnimatePresence keeping both segments mounted, which double-mounts the heavy lists and
  reintroduces the `library-tab-pill` layoutId collision, so it was deliberately skipped. The whole panel
  (incl. the tab bar, since the bar is inside each segment) slides subtly; offset kept small (~20px) so it
  reads as content, not a bar jump. Live visual confirm on the deployed site is the founder's.

_(Sessions 85-109's handoffs, and the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
