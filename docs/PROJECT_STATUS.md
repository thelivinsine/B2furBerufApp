# Project Status

_Last updated: 2026-07-13 (session 110, **Bibliothek tab-switch slide animation**, Opus 4.8). Switching
between the four Theorie/Bibliothek tabs (Wörter · Kollokationen · Redemittel · Grammatik) popped in
abruptly. Added a direction-aware enter slide: `LibraryHub` tracks the tab-index direction and applies a
self-clearing `.lib-slide-in-right`/`-left` CSS keyframe (in `index.css`) keyed by `?tab=`, so the
incoming panel slides in ~220ms from the side tapped toward and fades up. Deliberately a keyframe with
`none` fill-mode, NOT a persistent transform wrapper, because a resting transform would establish a
containing block and trap the segments' sticky/fixed descendants (filter rail, mobile Üben bar,
scroll-top button). Global `overflow-x: clip` means no scrollbar; global reduced-motion rule neutralises
it. **SHIPPED: PR #495 squash-merged to `main` (`43761a3`).** Prior session (109, **two phone-screenshot
bug fixes**, Opus 4.8). **FIX 1:** the
ugly monospace "App failed to load" screen was a false crash. In airplane mode / on a transient network
blip, the background Service Worker update check (`reg.update()`, no `.catch()`) rejects with "Failed to
update a ServiceWorker …", and that unhandled rejection tripped the global handler over an app that runs
fine from the precache. Fix: swallow the SW-update rejection, make both global handlers ignore SW
registration/update failures (`isServiceWorkerError`), and repaint the genuine-fatal fallback as a calm
branded card (headline + Neu laden) with the stack behind a "Technische Details" expander. **FIX 2:** the
Wörter graph opened too zoomed-out (k 2.2); raised to k 3.4 and centered on an area-weighted frequent
node. **SHIPPED: PR #496 squash-merged to `main` (`b6998ee`).** Prior session (108, **critical account
data-isolation fix**, Opus 4.8): switching accounts on one device leaked one account's progress into
another (and pushed it up to the other's cloud row). Fix in `lib/cloudSync.ts`: a persisted
`b2beruf.syncUid` marker binds the local cache to one account; `startCloudSync` wipes the cache before
pulling when the incoming uid differs, and sign-out/delete now `clearLocalAccountData()`. Pinned by
`tests/cloudSync.test.ts`. **SHIPPED: PR #493 (`64df253`).** Prior session (107, demo-prep polish continued, Opus 4.8). **SHIPPED (PRs #486,
#488):** Praktisch nav icon → **compass**; the feedback button reworked into a store-controlled dialog
with three surfaces (desktop bottom-right pill, mobile action-bar icon left of Üben, full "Feedback
geben" in practice sessions), all on the **MessageSquareText** icon; **content-scoped Bibliothek Üben**
(each tab drills its own content type only, via `buildScopedSession`); mobile browse tabs+toolbar that
**collapse on scroll-down / restore on scroll-up** with a centered go-to-top button; the desktop
**at-rest white block beside the sticky tabs removed** (masking bg only paints when scrolled); the
Wörter **graph opens zoomed into a readable random node** with an interactive mobile legend; the "Üben"
label **centered with the icon floating left**; and the Praktisch toggle's left mode renamed **"Üben" →
Lernen** (blue + book icon) to stop clashing with the Theorie Üben button (Spielen stays orange). A
follow-up polish round (PRs #490, #491): compass recolored to the nav blue + thicker ring, the Üben-map
onward route dashes phase-locked to the street lane markings, the pin's pulse ring muted gray, and the
Lernen book given a subtle center gutter so its two open pages stay distinct when filled. Prior session
(106): Üben-map pin sizing/color + Heute toggle/heading layout-shift fix. Product name:
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

**Handoff after session 109 (2026-07-13). Two founder bug reports from phone screenshots: the ugly
"App failed to load" screen + the Wörter graph opening too zoomed-out (Opus 4.8), on branch
`claude/app-loading-screen-5av7dt`, shipped as PR #496 (squash-merged `b6998ee`).**
- **"App failed to load" screen (offline SW-update crash):** the reported screenshot was taken in
  **airplane mode**. On app resume, `lib/swUpdate.ts` calls `reg.update()` (no `.catch()`) to check for a
  new deploy; offline / on any transient network blip the browser can't fetch `sw.js`, so `update()`
  rejects with *"Failed to update a ServiceWorker … An unknown error occurred when fetching the script"*.
  That unhandled rejection tripped `main.tsx`'s global handler → the raw monospace `paintFatal` screen,
  **over a working app** (it runs from the precache). Fix: (1) `swUpdate.ts` swallows the best-effort
  `update()` rejection with `.catch()`; (2) new `isServiceWorkerError()` in `lib/recover.ts`, and both
  global `error`/`unhandledrejection` handlers in `main.tsx` now ignore SW registration/update failures
  (non-fatal); (3) `paintFatal` repainted as a calm branded card (headline + *Neu laden* button) with the
  raw error/stack behind a collapsed *Technische Details* expander (mobile-debug net preserved).
- **Wörter graph default zoom (`features/vocabulary/WordGraph.tsx`):** opened at `k=2.2` (max node radius
  is only 12 world units, so the biggest circle was ~26px). Raised the initial open zoom to `k=3.4` and
  centered the opening view on an **area-weighted (frequent)** node (r² ∝ wordfreq) so it lands among
  common, well-connected words instead of a lone rare word in an empty corner. The fit button's
  zoom-to-frequent-word target was matched to the same `k` (was 2.6).
- **Gates:** typecheck ✔, lint **0 errors** (43 pre-existing warnings), `pnpm build` + prerender ✔,
  `test:unit` **134/134**.
- **NOT done:** live verification on a real phone (offline crash no longer appears; graph zoom feel) is
  left to the founder (sandbox can't reach the deployed site). Standing content/Üben-map follow-ups remain.

_(Sessions 85-108's handoffs, and the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
