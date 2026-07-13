# Project Status

_Last updated: 2026-07-13 (session 108, **critical account data-isolation fix**, Opus 4.8). **FIX:**
switching accounts on one device leaked one account's progress into another (and pushed it up to the
other's cloud row). Root cause: the device-global localStorage caches were **merged** into every account
on login and never cleared on sign-out. Fix in `lib/cloudSync.ts`: a persisted `b2beruf.syncUid` marker
binds the local cache to one account; `startCloudSync` wipes the cache before pulling when the incoming
uid differs, and sign-out/delete now `clearLocalAccountData()`, so **logging out resets the on-device
progress + settings** (after flushing pending changes to the cloud first). Guest-upgrade (same uid) and
first/offline sync are preserved. Pinned by `tests/cloudSync.test.ts` (4 cases). **SHIPPED: PR #493
squash-merged to `main` (`64df253`).** Prior session (107, demo-prep polish continued, Opus 4.8). **SHIPPED (PRs #486,
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
- **Post-ship follow-ups (same session, PRs #490, #491):** (a) the **compass** route accent moved to the
  nav blue `#2563eb` (so the ring AND the active-tab underline match the other nav marks) with a
  **thicker ring** (r8/stroke 2.7); (b) the **Üben-map onward route** is drawn per straight run with its
  dash pattern **phase-locked to the street lane dashes** (opaque, "7 9" period, offset = start-coord mod
  16, in `SEG_RUNS`) so route dashes land exactly on the lane markings instead of scattering as dots;
  (c) the pin's **pulse ring is a muted theme-aware gray** (`pulseRing`, was red) while the pin stays red;
  (d) the **Lernen toggle book fills when active** and, per a follow-up, uses a **custom open-book mark
  (`LernenBook`) with a ~2px transparent center gutter** so the two pages stay distinct when filled
  (lucide `BookOpen` dropped from the toggle). All Playwright-verified; gates green each ship.
- **Gates:** typecheck ✔, lint **0 errors** (43 warnings), content-lint ✔, `test:unit` **130/130**,
  build + prerender ✔, `check:bundle` **~77 kB**/400. Playwright-verified: white-block gone at rest +
  masks on scroll, toggle Lernen/blue live, compass blue, map dashes aligned, gray pulse ring, filled
  book with center gutter.
- **NOT done:** standing content/Üben-map follow-ups (human `verified` pass, jury Waves, sector-audit
  review) remain; the s105 "reorderable filter list" is still read as pill-list + Mehr/Weniger (no
  drag-reorder).

_(Sessions 85-105's handoffs, and the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
