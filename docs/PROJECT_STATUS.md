# Project Status

_Last updated: 2026-07-14 (session 119). **Account-dropdown z-index bug fixed (Opus 4.8), shipped to
`main` (PR #529).** On the Bibliothek browse pages the account menu dropdown had the page's sticky
browse toolbar (ViewSwitcher icons + search) bleeding through its DESIGN row. Root cause: the app
header and that toolbar (`browseHeaderClass`) were both `z-20` stacking contexts, and the toolbar
paints later in DOM order, so it beat the dropdown (whose `z-50` is scoped inside the header context).
Fix: raise the header to `z-30` (one-line className change in `AppShell.tsx`), still below FeedbackPill
`z-40` / Toaster `z-50` / bottom nav `z-[55]/[60]` and non-overlapping with the desktop sidebar `z-30`.
`pnpm build` green. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 119 (2026-07-14). Account-dropdown z-index bug fix (Opus 4.8), on branch
`claude/account-settings-dropdown-icons-b8feg6`, shipped to `main` (PR #529, squash-merged).** A
one-line founder bug fix.
- **Symptom (founder screenshot):** on a Bibliothek browse page (e.g. Kollokationen), opening the
  account menu showed the page's toolbar (the `ViewSwitcher` icons + the search magnifier) painting on
  top of the dropdown's **DESIGN** theme-toggle row. The dropdown background is opaque, so it was not a
  transparency issue.
- **Root cause:** the app header (`AppShell.tsx`, `sticky top-0 z-20`, a stacking context via its
  `backdrop-blur`) and the sticky Bibliothek browse toolbar (`browseHeaderClass` in
  `src/features/shared/browseScroll.tsx`, `sticky ... z-20`) were **both `z-20`**. Equal z-index →
  paint order decides, and the toolbar comes later in DOM order, so it painted over the account
  dropdown wherever the dropdown overflows below the header. The dropdown's own `z-50` only applies
  inside the header's stacking context, so it could not beat the sibling toolbar.
- **Fix:** header `z-20` → `z-30` (`src/components/layout/AppShell.tsx`). Layer order stays correct:
  header/dropdown now above the browse toolbar (`z-20`) but still below FeedbackPill (`z-40`), Toaster
  (`z-50`), and the mobile bottom nav (`z-[55]`/`z-[60]`); the desktop sidebar (also `z-30`) never
  overlaps the header spatially (header lives inside `lg:pl-64`). Bonus: makes the intended "toolbar
  slides under the header on scroll" behavior a real z-order instead of a DOM-order coincidence.
- **Gates:** `pnpm build` green (only gate relevant to a className change; no content/engine/type
  impact). Live verification (Actions tab + `*.github.io`) is the founder's, per the usual note.

**Handoff after session 118 (2026-07-14). Kollokationen nodal graph (Opus 4.8), on branch
`claude/kollokations-nodal-graph-080jt7`.** Shipped a Graph view for the Bibliothek **Kollokationen**
tab, matching the Wörter graph's slot but purpose-built for collocations.
- **Model (founder-confirmed before building):** a **bipartite noun ↔ verb** graph. Every distinct noun
  and verb is a node; every collocation is an edge. Tap a verb → its nouns; tap a noun → its verbs. Hub
  verbs (machen/treffen) surface naturally. Edges are the authored collocations, nothing inferred.
- **Layout (founder-confirmed):** **theme islands** — nodes are pulled to per-theme centroids
  (`forceX/forceY`) so themes form glowing clusters, shared verbs bridge between them.
- **"Stunning zoomed out" finesse:** opens **fit-to-all** (not zoomed into a hub like Wörter); cached
  radial **glow sprites** (additive in dark) instead of per-frame shadowBlur; **curved** quadratic
  edges tinted by source domain; a **vignette** background; **nouns = solid discs, verbs = rings**
  (annuli) so the bipartite structure reads without a legend; labels fade in with zoom, hubs a touch
  earlier. Node size = **degree** (frequency.ts is keyed by content_id, not surface form, so degree is
  both available and more meaningful). Domain color = the node's majority theme's domain.
- **Files:** `src/lib/graphPalette.ts` (shared `DOMAIN_COLORS`/`domainColor`, lifted out of
  `WordGraph.tsx`, which now imports it — behavior unchanged); `src/features/collocations/collocationGraph.ts`
  (pure builder) + `tests/collocationGraph.test.ts` (8 tests); `src/features/collocations/CollocationGraph.tsx`
  (lazy canvas renderer, mirrors WordGraph's interaction/camera); wired into `CollocationsBrowser.tsx`
  (`KOLLOKATION_VIEWS` gained `graph`, `React.lazy` + Suspense, passes the `filtered` list). The
  bipartite selected-node card lists partner chips (clickable) + one example + SpeakButton; the legend
  doubles as a Nomen/Verben + domain filter.
- **Wörter graph untouched** except the one-line palette import swap. d3-force stays in the shared
  `vendor-misc` chunk (both graph chunks import it), so the main chunk is unaffected (79.5 kB/400).
- **Gates:** typecheck clean, lint 0 errors (pre-existing warnings only), `test:unit` 142/142, `build`
  green, `check:bundle` pass. Browser-verified via Playwright over `pnpm preview`: fit-to-all opens on
  the constellation, node selection dims + shows the partner card, zoom/pan/legend-filters work, light
  + dark + mobile all coherent, zero console errors. Screenshots in the session scratchpad.
- **Not yet shipped to `main`:** committed + pushed to the branch; PR/merge left for the founder to
  review the visuals first (per the "no PR unless asked" harness rule).
- **Shipped (PR #527, `b71617a`), then a follow-up:** added a **card shape toggle** (button beside the
  card's close): the selected-node card is either a full-width bottom bar (`horizontal`, default) or a
  full-height right panel (`vertical`), and toggling **re-fits the constellation into the free area**
  (`fitToRect`/`freeRect`/`cardExtent` in `CollocationGraph.tsx`). Verified headless (both shapes,
  re-center on toggle, light+dark, desktop+mobile); gates green.
- **Possible follow-ups if the founder wants:** stronger island separation (raise centroid strength /
  ring radius), a "focus a theme" tap on the domain legend that recenters, or an Üben hook from the card.

_(Session 117's Üben-navigation + Üben-button-copy handoff, session 116's branding-redesign-support
handoff (Cobalt & Butter previews + the AI mockup guide) and session 115's demo-readiness-sweep handoff
are now in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 113's brand-identity-exploration
handoff (the 20-direction catalogue) is also in W29. Session 114's Theorie pill-animation +
dark-mode contrast handoff, session 113's Theorie tab-transition/compass/feedback-pill polish handoff,
session 112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's handoffs, plus the s104
Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
