# Project Status

_Last updated: 2026-07-13 (session 107, demo-prep polish continued, Opus 4.8). **SHIPPED (PRs #486,
#488):** Praktisch nav icon → **compass**; the feedback button reworked into a store-controlled dialog
with three surfaces (desktop bottom-right pill, mobile action-bar icon left of Üben, full "Feedback
geben" in practice sessions), all on the **MessageSquareText** icon; **content-scoped Bibliothek Üben**
(each tab drills its own content type only, via `buildScopedSession`); mobile browse tabs+toolbar that
**collapse on scroll-down / restore on scroll-up** with a centered go-to-top button; the desktop
**at-rest white block beside the sticky tabs removed** (masking bg only paints when scrolled); the
Wörter **graph opens zoomed into a readable random node** with an interactive mobile legend; the "Üben"
label **centered with the icon floating left**; and the Praktisch toggle's left mode renamed **"Üben" →
Lernen** (blue + book icon) to stop clashing with the Theorie Üben button (Spielen stays orange). Prior
session (106): Üben-map pin sizing/color + Heute toggle/heading layout-shift fix. Product name:
**Genauly** (`genauly.de`)._

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

**Handoff after session 106 (2026-07-13). Üben-map pin polish: sizing/color fix + a toggle/heading
layout-shift bug (Sonnet 5), shipped straight from two founder screenshots/reports on branch
`claude/pin-sizing-color-6lofhi`, merged to `main`.**
- **"Du bist hier" pin (`UebenPath.tsx`):** the pulse ring (r 12→8, stroke 2→1.5) and the chip
  (`px-3 py-1 text-[11px]` → `px-2 py-0.5 text-[9px]`) were oversized relative to the small pin glyph;
  both shrunk to hug it. The pin (and its pulse ring) switched from the route indigo to a dedicated
  red (`PIN_COLOR = "#e5484d"`) per founder request, so the live-location marker reads distinctly from
  the indigo journey line; the pin's white inner ring/dot are unchanged.
- **Heute toggle/heading layout-shift bug (`Dashboard.tsx`):** on desktop the Üben/Spielen toggle sits
  above the tab content inside a `justify-center`d flex column, and the two panels render at different
  natural heights (Üben ~581px, Spielen ~607px), so the whole stack's centered position — and thus the
  toggle's screen position — shifted on every Üben ↔ Spielen switch. Diagnosed with a headless
  Playwright probe against the dev server (bypassing onboarding via a seeded `b2beruf.settings.v1`
  localStorage key): the toggle moved ~13px and both panels' own `<h1>` moved with it on every switch
  (confirmed before/after with real bounding-box measurements, not just code reading). Fix: the sliding
  content wrapper now reserves the taller panel's height (`lg:min-h-[38rem]`, Spielen's ~607px) so the
  toggle+content stack's total height — and therefore its `justify-center`d position — stays constant
  regardless of which tab is active. Mobile was already unaffected (normal document flow, not
  flex-centered).
- **Gates:** typecheck ✔, lint 0 errors (pre-existing warnings only), `pnpm build` + prerender ✔,
  `check:bundle` **76.9 kB**/400. Browser-verified with Playwright against the dev server at mobile
  (390×844) and multiple desktop widths (1024–1920px): toggle and heading now sit at identical
  bounding-box coordinates before/after every tab switch.
- **Shipped:** PR opened and squash-merged into `main` (was previously only on the feature branch;
  per this repo's rule, feature-branch pushes never go live on their own).
- **NOT done:** no other follow-up requested this session; standing content/Üben-map follow-ups from
  prior sessions (human `verified` pass, jury Waves, sector-audit review) remain untouched.

**Handoff after session 107 (2026-07-13). Demo-prep polish continued: compass Praktisch icon, feedback
placement, content-scoped Üben, mobile scroll UX, graph zoom, centered Üben label, Lernen/Blau toggle,
desktop white-block fix (Opus 4.8).** Continuation of the s105 demo sweep on branch
`claude/demo-prep-feedback-rename-sl1jqq`, shipped as two squash-merged PRs (#486, #488).
- **Praktisch nav icon → compass** (`route-icons.tsx` "/" renderer + NORM box, `nav-items.ts` lucide
  fallback `Compass`), replacing the dumbbell; founder wanted a "real-life orientation" mark.
- **Feedback button reworked (`FeedbackButton.tsx`, store-controlled via `useSessionStore.feedbackOpen`):**
  one app-mounted `FeedbackDialog` + three trigger surfaces — desktop bottom-right pill (skips `/`),
  mobile action-bar **icon** left of Üben (no floating pill over content), and a full "Feedback geben"
  button inside practice sessions (`SessionPlayer`). All use the **MessageSquareText** icon so the
  affordance reads as feedback.
- **Content-scoped Bibliothek Üben (`engine/session.ts` `buildScopedSession` + `ContentScope`,
  `useSessionStore.librarySession`, `Session.tsx` `?src=lib`, `SessionPlayer` contentScope/libraryIds):**
  each browse tab hands its filtered ids to a content-PURE session, so Üben on Redemittel drills
  Redemittel only, a Grammatik group drills that group only, etc. (was leaking generic vocab before).
  `SessionBlock` flashcard source union gained `"collocation"` (XP-only grade, no vocab FSRS).
- **Mobile browse scroll UX (`features/shared/browseScroll.tsx`, new):** `useScrollDirection` collapses
  the tabs+toolbar on scroll-down / restores on scroll-up (mobile only via `max-lg:` guard) and drives a
  centered `ScrollTopButton` above the Üben bar. `browseHeaderClass(hidden, scrolled)` now applies the
  opaque masking background **only when scrolled**, on both breakpoints.
- **Desktop "white block" fix:** the sticky tabs+toolbar header used to paint an always-on
  `bg-background/90` rectangle, showing a hard-cornered white block beside the tabs (above the filter
  rail) at rest. Now transparent at rest, backdrop fades in on scroll to mask pinned-header content.
  Reproduced + verified fixed with Playwright at 1280×900.
- **Wörter graph (`WordGraph.tsx`):** opens **zoomed into a readable random node** (k≈2.2) instead of
  fit-to-all; the legend is visible by default on mobile and doubles as domain filters.
- **Centered Üben label (`UebenLabel` in browseScroll):** the word "Üben" is centered in the button with
  the bolt icon floating to its left (absolute, no layout space), across all four trainers.
- **Praktisch toggle rename + recolor (`Dashboard.tsx`):** left mode "Üben" → **Lernen** (blue
  `text-blue-600` + `BookOpen` icon) so it no longer clashes with the Theorie Üben button; "Lernen /
  Spielen" reads as a pair. Spielen stays orange. Founder picked Lernen + Blau from preview options.
- **Gates:** typecheck ✔, lint **0 errors** (43 warnings), content-lint ✔, `test:unit` **130/130**,
  build + prerender ✔, `check:bundle` **76.7 kB**/400. Playwright-verified: white-block gone at rest +
  masks on scroll, toggle Lernen/blue live.
- **NOT done:** standing content/Üben-map follow-ups (human `verified` pass, jury Waves, sector-audit
  review) remain; the s105 "reorderable filter list" is still read as pill-list + Mehr/Weniger (no
  drag-reorder).

_(Sessions 85-105's handoffs, and the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
