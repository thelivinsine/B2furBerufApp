# Project Status

_Last updated: 2026-07-13 (session 109, **two phone-screenshot bug fixes**, Opus 4.8). **FIX 1:** the
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

**Handoff after session 108 (2026-07-13). CRITICAL account data-isolation bug (Opus 4.8), on branch
`claude/account-data-isolation-bug-s517d1`.** Founder report: on a phone, switching between accounts
showed one account's progress under another.
- **Root cause:** `useProgressStore`/`useSettingsStore` persist to **device-global** localStorage keys
  (`b2beruf.progress.v1` / `.settings.v1`) shared by every account on the device. `startCloudSync(uid)`
  **merges** the incoming account's cloud row into whatever local cache is left from the previous account
  (`Math.max` / union / `mergeSrs`), then in step 2 **pushes that merged result up to the new account's
  cloud row**. Nothing cleared the cache on sign-out or account switch. So account A's XP/streak/SRS/saved
  words leaked into account B's view **and were written into B's cloud row**, propagating to all of B's
  devices. Settings leaked too (`mergeRemoteSettings` bails out when `local.onboarded` is already true, so
  B kept A's name/level).
- **Fix (`lib/cloudSync.ts`):** a persisted `b2beruf.syncUid` marker records which account owns the local
  cache. `startCloudSync` reads it first; if the incoming uid differs, it `resetLocalStores()` (wipes
  progress + settings back to defaults) **before** the pull/merge/push, so nothing cross-account can merge
  or upload. The marker is (re)written on every sync. A missing marker (first-ever sync, or an install
  predating this build) is treated as "same owner" so genuine offline/guest progress is preserved, and the
  guest→account upgrade keeps the same uid so it never hits the wipe branch. New exported
  `clearLocalAccountData()` (reset stores + forget the marker) is called from `useAuthStore.signOut` and
  `deleteAccount`, so the sign-in screen and the next account on a shared device never see stale data.
- **Tests:** `tests/cloudSync.test.ts` (new, mocks `@/lib/supabase`) pins four invariants: a different
  account wipes the previous cache before syncing and never pushes the old data up; the first/guest sync
  preserves local progress (merge, not wipe); the same account re-syncing does not wipe; and
  `clearLocalAccountData` zeroes both stores + the marker.
- **Gates:** typecheck ✔, lint **0 errors** (43 pre-existing warnings), `test:unit` **134/134**, `pnpm
  build` + prerender ✔, `check:bundle` **77.4 kB**/400, `lint:content` ✔.
- **NOT done / consider next:** the local cache is still a single device-global key that is wiped-and-
  reloaded on switch (correct + robust, but a future hardening could namespace the persist key per uid to
  avoid any wipe entirely). Live verification on a real phone with two accounts is left to the founder
  (sandbox can't reach the deployed site). Standing content/Üben-map follow-ups remain untouched.

_(Sessions 85-107's handoffs, and the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
