# Project Status

_Last updated: 2026-07-13 (session 114). **Theorie pill animation robustness + dark-mode contrast
(Opus 4.8):** the tab bar and view switcher animated their active pill with framer's `layoutId`
mount/unmount crossfade, which stuttered against the trainer re-render; replaced it with a single
always-mounted pill measured to the active segment (new `useSlidingPill` hook) that glides on a pure
transform. Also lifted dark `--primary` `68%→74%` so purple eyebrows/tab labels/`text-primary` links
clear WCAG AA on the dark background. Pushed to `claude/theroie-toggle-animation-t5c86i` (not yet
merged). All gates green. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 114 (2026-07-13). Theorie pill animation robustness + dark-mode purple
contrast (Opus 4.8), on branch `claude/theroie-toggle-animation-t5c86i` — pushed, NOT yet merged
(commit `688bd0d`; asked the founder before opening a PR).** Follow-up to s113's tab-slide work,
fixing the *pill* jerk specifically (s113 fixed the content-panel slide; the pill glide was still
stuttering). No logic/data change.
- **Pill animation (the real fix):** both `LibrarySwitcher` (tab bar) and `ViewSwitcher` (Tabelle/
  Graph/Karten/Liste) animated their active pill with framer's `layoutId` **shared-layout crossfade** —
  the pill rendered ONLY on the active segment (`{active && <motion.span layoutId=…/>}`), so each switch
  unmounted the old pill + mounted a new one, forcing framer to re-measure both and cross-fade. On the
  library tabs the same click also renders a whole trainer (walks a content bank), so that measurement
  competed for the main thread and the pill stuttered. Replaced with new
  **`src/features/shared/useSlidingPill.ts`**: ONE always-mounted pill measured to the active segment
  from the live DOM (`offsetLeft`/`offsetWidth`, re-measured on active change + `ResizeObserver`,
  positioned pre-paint via `useLayoutEffect`), animating only `x`/`width` (compositor-friendly transform
  for the equal-width segments), decoupled from the rest of the frame. Robust to gaps/padding/responsive/
  unequal widths. If you touch either switcher, keep the single-pill pattern; do NOT reintroduce the
  per-segment `layoutId` crossfade.
- **Dark-mode purple contrast:** dark `--primary` was `245 80% 68%` (~4.3:1 on the dark bg, under the
  WCAG AA 4.5:1 floor for the small bold uppercase eyebrows / active-tab labels / `text-primary` links);
  lifted to `245 84% 74%` (~5.6:1), `--ring` matched. Primary-as-button-fill unaffected (its dark
  `primary-foreground` text only gains contrast).
- **Verified in Chromium** (playwright-core, seeded onboarded localStorage, light + dark at 900×700): pill
  lands pixel-accurately on both the first (Wörter) and far (Grammatik) tabs, ViewSwitcher pill correct,
  purple labels/links clearly legible in dark, no light-mode regression.
- **Files:** `src/features/shared/useSlidingPill.ts` (new) · `src/features/library/LibrarySwitcher.tsx` ·
  `src/features/shared/ViewSwitcher.tsx` · `src/index.css`.
- **Gates:** typecheck ✔; build+prerender ✔; test:unit 134/134; check:bundle 79.5 kB/400.

**Handoff after session 113 (2026-07-13). Theorie tab-transition + compass-icon + feedback-pill polish
(Opus 4.8), on branch `claude/theory-toggle-transitions-hloi6s`, merged to `main` across PRs
#506/#509/#511/#512.** UX-only, no logic/data change. (Session 114 later refined the tab *pill* glide on
top of this, see the handoff above.)
- **Theorie tab slide (four founder rounds):** switching Wörter/Kollokationen/Redemittel/Grammatik used
  to flash blank + reload. **R1** swapped the enter-only CSS keyframe + `Suspense fallback={null}` for the
  Praktisch `AnimatePresence` directional `x`-slide + skeleton (removed the dead `.lib-slide-in-*`
  keyframes). **R2 (the structural fix):** the `LibrarySwitcher` (tab bar) was rendered INSIDE each
  trainer, so it sat in the animated subtree and the tabs themselves reloaded on every toggle. **Hoisted
  the switcher into `LibraryHub` as one static element** (only the content slides now, true Praktisch
  parity), removed `<LibrarySwitcher/>` from the 4 trainers + `GrammarTopicView` (else the lesson doubles
  the bar), and **preload all 4 tab chunks on mount** so a switch never hits the loading skeleton. Desktop
  tabs sit at content-column width (col 1 of the same `[1fr,16rem]` grid). **R3 (feel):** `mode="wait"`
  felt slow and its blank fade-out gap read as heavy, so switched to **`mode="popLayout"`** (leaving panel
  popped out of flow, panels cross at once, no empty beat, no jump; presence wrapped in a `relative`
  container), duration 0.16→0.13, snappy ease `[0.22,1,0.36,1]`, slide carries the motion. **R4:** eased
  0.13→**0.15** (a touch too snappy). framer resolves the resting `x:0` to `transform:none`, so the sticky
  filter rail / Üben bar are not trapped. Verified in Chromium (1280/1600/390-wide): one bar per surface,
  static tabs, no skeleton flash, no horizontal scrollbar, no jump.
- **Compass icon:** the Praktisch route mark is a thin outline ring that read smaller than its neighbors;
  bumped its optical weight `0.95→1.05` in `route-icons.tsx` `NORM` so it matches
  Theorie/Fortschritt/Einstellungen.
- **Feedback pill (R4):** the desktop "Mit KI gebaut · Feedback" pill was anchored by its right EDGE at
  the FilterRail's center, so it hung half its width to the left. Added `lg:translate-x-1/2` in
  `FeedbackButton.tsx` so its center lands on the rail center (measured 0px diff at 1280 + 1600 wide).
- **Files:** `src/features/library/LibraryHub.tsx` · `src/index.css` · `route-icons.tsx` ·
  `src/features/{vocabulary,collocations,redemittel,grammar}/*` + `grammar/GrammarTopicView.tsx` (removed
  in-tree `LibrarySwitcher`) · `src/components/layout/FeedbackButton.tsx`.
- **Gates:** typecheck; lint 0 err/44 warn; test:unit 134/134; build+prerender; check:bundle 79.5 kB/400.

_(Session 112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's
handoffs, plus the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
