# Project Status Archive — 2026-W25 (Jun 15–21)

_Detailed session logs, sessions 23–30. Split from `PROJECT_STATUS_ARCHIVE.md` by ISO week in s70._

### Session 23 (2026-06-15) — Boot-splash flash fix + logo-redo backlog SHIPPED ✅
Branch `claude/app-refresh-text-flash-r6k69u`. Squash-merged to `main` (PRs #150–#151).

**Problem:** on every refresh the static `#root` fallback in `index.html` (the full plain-language
description, added in s22/PR #143 so Google's no-JS OAuth crawler can read the app's purpose) flashed
on screen before React mounted. It read like a glitch because it was a wall of marketing copy, not a
loading screen.

**Fix (CSP-safe, no inline JS):**
- First attempt (PR #150) added an inline `<script>` to set a `.js` class and hide the text via CSS.
  **It silently failed** because the page CSP is `script-src 'self'` with no `'unsafe-inline'` and no
  nonce/hash, so the inline script was blocked and the class never applied. Lesson for future work:
  **`index.html` cannot run inline scripts**; only external `/self` scripts (like `spa-redirect.js`)
  or `<style>`/`<noscript>` overlays (style-src allows `'unsafe-inline'`).
- Correct fix (PR #151): default the boot fallback to a minimal **branded splash** (`#boot-splash`:
  logo + tagline + spinner) for everyone, and use a `<noscript><style>` override to reveal the full
  description (`#boot-seo`) only when scripting is disabled. JS browsers now see an intentional-looking
  loading splash; no-JS crawlers / Google's OAuth reviewer still get the full description in the raw
  HTML. The spinner has a `prefers-reduced-motion` fallback. **Founder-verified: the flash is gone.**

**Also:** added **backlog #20** — redo the Genauly logo (founder noticed it looks too close to Canva).


### Session 23 cont. (2026-06-15) — Data governance v0.2/v0.3 + certification research SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. Docs only, squash-merged to `main` (PR #153 for v0.2; the
v0.3 + research bundle in a follow-up PR).

**1. Content strategy decision (v0.2): traceability over ownership.** Founder rejected leaning on "we
wrote it in-house, so we own it." New policy: every item traces to an authoritative reference or a
commercial-safe source. Much of today's library is AI-assisted drafting (legally safe, since AI text
has no rights holder, but a weak provenance answer), so AI drafting is now a *first step only* that
must be verified-and-cited or rewritten/discarded. Added the facts-vs-creative-text distinction (words/
genders/plurals are facts, not copyrightable: verify vs Wiktionary/DWDS rather than copying a protected
list), an approved open-source table (**Tatoeba CC-BY** for sentences), and a required `reference` field
on the register. Founder chose **re-verify + backfill existing content**, not a hard rebuild.

**2. Certification deep-research (#19) DONE → `docs/CERTIFICATION_RESEARCH.md` + governance v0.3.** Ran
the deep-research harness (5 cited passes). Conclusions: we are **most likely NOT high-risk** under the
EU AI Act (profiling + institutional-gating are the two flip risks); **Article 50 transparency** (tell
users they're interacting with AI / mark AI output) is a real obligation by **2 Aug 2026** → new
backlog **#21**; when certifying, sequence **ISO 27001 then ISO 42001** via TÜV NORD/SÜD (~$15K to
$60K/standard); SOC 2 is US-centric, defer. Still needs a lawyer's sign-off on the risk class (#15).

**Also:** documented that **Fable is temporarily unavailable** (US government restriction); use **Opus**
for Fable-recommended tasks until it returns (note in the Model-guidance section).


### Session 24 (2026-06-16) — Mobile nav bar complete redesign + bug fixes (PRs #175–#176) ✅

This session completed a multi-iteration redesign of the mobile bottom tab bar and More sheet
that the founder drove across sessions 23–24. All changes are live on `main`.

**Feature set delivered (full list):**

- **Always-colored icons:** icons show their accent color at all times. Inactive = 38% opacity,
  active = 100%. Never grey/monochrome. The four hero icons (Dashboard, Vocabulary, Quiz,
  Analytics) use custom SVGs with the brand palette; all other routes use their lucide icon at
  the same opacity rule.

- **Larger, intentional nav bar:** icons 20% bigger (29px), taller context strip with a colored
  dot + semibold label, 62px icon rail. Spacing is even and deliberately sized.

- **More sheet grid:** additional routes shown in a 3-column icon grid with names below each tile,
  matching the visual language of the bar. No section headers.

- **iOS home-screen edit mode:**
  - Long-press anywhere on the bar OR the More sheet (600ms + haptic vibrate) opens edit mode.
  - Icons jiggle (framer-motion infinite rotate animation) and show a red X badge.
  - Drag icons left/right in the bar to reorder.
  - Tap X to remove an icon (hidden when at minimum 2 icons in bar).
  - No "Fertig" button. Tapping outside auto-saves and exits edit mode.
  - Home and Mehr are fixed; everything else is moveable between bar and sheet.

- **Adding icons to the bar (two gestures):**
  - Tap the green + badge on a sheet icon.
  - Drag the sheet icon downward ~72px (it scales to 1.18× near the threshold as visual feedback,
    then snaps back and the icon appears in the bar).
  - Both show a green checkmark flash as confirmation.

- **Max/min constraints:** max 4 icons + Mehr in bar; min 2 icons (X button hidden at minimum).

- **iOS context menu suppressed:** long-pressing `<a>` tags on iOS shows a "Copy link / Share"
  native popup. Fixed with `.no-callout` CSS class (in `index.css`) applying
  `-webkit-touch-callout: none !important` to the container AND its `*` children. Inline style
  does NOT cascade to NavLink's rendered `<a>` tags; only the CSS class selector does.

- **Bar stays interactive while sheet is open:** `modal={false}` on `DialogPrimitive.Root` in
  `MoreSheet.tsx`. Radix Dialog's default modal mode sets `pointer-events: none` on everything
  outside the sheet, which made the bar inert. `modal={false}` with a custom
  `onInteractOutside` guard (allows clicks on `#bottom-tab-bar`) is the correct fix.

- **GPU compositing fix for iOS Safari:** `transform: translateZ(0)` + `willChange: transform`
  on the `<nav>` element prevents iOS Safari from collapsing the bar under a `backdrop-filter`
  sibling.

**Bugs fixed in final PR #175:**

1. **Sync bug (icons added from sheet didn't appear in bar):** `BottomTabBar` had a `localOrder`
   buffer state with a `useEffect` that only synced from the store when `!editMode`, silently
   ignoring `setPinnedTabs` calls while the sheet was open. Fixed by removing `localOrder`
   entirely; the bar reads `pinnedTabs` from the zustand store directly — store is the single
   source of truth.

2. **Drag-to-reorder in bar not working:** `Reorder.Group` now writes every reorder back to the
   store. `flexGrow: moveablePaths.length` keeps all icon slots the same width regardless of count
   (previously `flex-1` caused all moveable icons to bunch into one slot).

3. **X button not firing:** action was in `onPointerDown` which framer-motion's drag consumed
   first. Fixed: action in `onClick`, guarded by `onPointerDownCapture` + `onPointerDown`
   stopPropagation so the drag gesture never sees the pointer.

**Founder preferences captured:**
- Edit mode must feel exactly like iOS/Android home screen app rearrangement.
- No extra buttons/chrome in edit mode; gestures drive everything.
- Icon colors must always be visible (never greyed out).
- More sheet is purely a navigation/edit surface — no section labels, no hierarchy.
- Feedback (checkmark flash, scale animation) is essential so the user knows their tap/drag worked.
- No native browser popup interrupting long-press on mobile links.

All changes shipped as PR #175 + docs PR #176, both squash-merged to `main`.

**Next (priority order):**
1. **Cloudflare Pages migration (decided s22, deferred until OAuth clears):** after Google confirms
   OAuth branding approval via email, migrate from GitHub Pages. Steps for the migration session:
   - Add a `_redirects` file for Cloudflare Pages SPA routing (replaces `public/404.html` + `spa-redirect.js`).
   - Connect GitHub repo to Cloudflare Pages (build: `pnpm build`, output: `dist`).
   - Move `genauly.de` DNS from Namecheap to Cloudflare nameservers.
   - Verify Google OAuth redirect URI still works post-DNS change.
   - Update `pages.yml` or remove it if GitHub Pages deploy is retired.
   - **Privacy bonus (decided s26):** making the repo private here is also how the founder wants the
     prompt/session logs (`docs/SESSION_PROMPT_LOG.md` + `docs/prompt-log-raw.jsonl`) and `CLAUDE.md`
     made private. The founder chose this over a separate private repo for the logs, so until this
     migration lands the repo (and new log entries) stay public. Switch the repo to **private** as
     part of this migration.
2. **GDPR follow-ups (from s20 pass):** fill the **Impressum** name/address (then re-enable the page
   per `CLAUDE.md`/`PHASE2_SETUP.md`) and the **data-location region** placeholder in the privacy
   policy; optionally enable the **pg_cron auto-retention** for writing text (SQL in `PHASE2_SETUP.md`).
3. **Lawyer review of `/privacy` + `/terms` (backlog #15)** before paid plans / marketing. Likely adds
   the real Impressum, Widerrufsrecht for paid plans, tighter liability.
4. **Content QC pipeline** — mechanical half **DONE (s22)**: `pnpm lint:content` + CI gate
   (`validate.yml`) for duplicate ids, broken dialogue nodes, missing fields, dangling cross-refs,
   em dashes. Remaining: the **pedagogical review process** for German accuracy and B2
   level-appropriateness (process/LLM-judgment, not code; recommended model **Fable**).
5. (Optional) Add Resend SMTP to fix email magic-link rate-limit.
6. (Optional) Monetization tier + paywall feature flags (the `tier` column already exists).
7. (Optional) More grammar drills (47 → ~80 target).
8. (Optional) More vocabulary content expansion (504 → ~600+ target).
9. **Founder ideas backlog (added 2026-06-07)** — 14 raw feature ideas spanning product (Dashboard
   redesign, gating Schreibtraining behind sign-in, animated scenario simulations, vocabulary
   visual mnemonics, domain/sector content filtering, Schreibtraining redesign, sourced/audit-ready
   content pipeline), monetization (pricing page + plans, payment gateway), growth (FAQ + landing
   copy expansion, SEO, marketing campaign), and compliance (full GDPR compliance beyond the
   `/privacy` page). None scoped yet — see "Backlog — founder ideas" above for the full list; a
   future session should help prioritize and break these into phases.

_(Layer 1 ✅ · Layer 2 ✅ · Layer 3 ✅ · Content: all 10 themes ✅ · Security: 100% complete ✅)_

---


### Session 25 (2026-06-16) — Unique per-section icon colours + custom branded icons everywhere
- **Unique colour per route:** each navigation route now owns ONE unique accent colour (no more
  duplicates: Wortschatz, Quiz, Prüfungsmodus, Schnellwiederholung, Fortschritt, Einstellungen all
  had shared hues before). Defined once in `src/components/layout/nav-items.ts` (`color` + `bg`).
- **One icon per route, used everywhere (new):** custom branded SVG marks now live in
  `src/components/layout/route-icons.tsx` (`RouteIcon` + `MoreIcon`) — one hand-drawn mark per
  route on a 20×20 grid, in the route's accent colour with lighter layers from its own opacity.
  This single registry is the source for the bottom tab bar, the More sheet, AND the desktop
  `Sidebar`, so a section shows the same icon AND colour on every surface. Replaced the old setup
  where the bottom bar had custom SVGs for only 4 "hero" routes while everything else used lucide.
- Dashboard + the "Mehr" menu keep the brand indigo `#5b5be6` as the app/chrome anchor.
- `nav-items.ts` still carries a lucide `icon` per route; `RouteIcon` falls back to it for any
  route without a custom mark. Reference sheet: `preview/route-icons-preview.svg`.
- **Home/Mehr icon swap + richer context strip:** Home is now a house glyph (was the 2×2 grid),
  and the "Mehr" menu took over the 2×2 grid (the classic apps/more glyph). The bottom-bar context
  strip now shows the section name PLUS a short German subtitle (`desc` per `NavItem`) for context
  instead of just the name. The strip is one line taller, so the More sheet overlay/padding were
  nudged to keep clearance.
- **More sheet overlap fix:** the sheet's bottom padding equalled the bar height, so the last icon
  row's labels overlapped the bar's context strip. Bumped padding so the grid lifts clear.
- **Uniform icon optical size:** each mark was drawn freehand on the 20×20 grid with a different
  inked area (filled Quiz disc ~17px vs speech bubble ~13px), so they looked like different sizes.
  Added a `NORM` map + `normTransform` in `route-icons.tsx` that scales each mark's bounding box to
  a centred 16-unit target with a per-mark weight (so heavy filled shapes don't read larger). Tune
  sizes via that map. CLAUDE.md "Icon color rule" updated to match the new all-custom-SVG setup.
- `pnpm build` + `pnpm typecheck` + `pnpm lint:content` green. Shipped via PRs #178–#182.


### Session 26 (2026-06-16) — Bottom-bar context strip removed + More-sheet reorder & animations
- **Context strip removed:** the label/subtitle row above the bottom-bar icons was redundant (every
  section already shows its own title at the top of the page), so the bar is now a single 62px icon
  rail. The More sheet overlay `bottom` (→ `3.875rem`), its bottom padding (→ `5.75rem`), and the
  `.pb-nav` utility were all resized for the shorter bar. `NavItem.desc` is kept for reuse but no
  longer rendered in the bar. `getContextMeta` deleted from `BottomTabBar.tsx`.
- **Mehr selection fixed:** the Mehr tab now shows its selected pill + underline while the More sheet
  is open, and the pinned tabs drop their highlight so the selection clearly sits on Mehr.
  `AppShell` passes a new `moreOpen` prop into `BottomTabBar`.
- **Reorder inside the More sheet (new):** the sheet's edit-mode grid is now drag-sortable via a
  custom 2D grid sort in `MoreSheet.tsx` (`reorderDuringDrag` finds the tile under the pointer and
  splices the dragged path into its slot; `layout` animates the rest). Order persists in a new
  `useSettingsStore.moreOrder: string[]` (full route ordering; empty = `nav-items` order), kept in
  sync so pinned routes hold their slots.
- **Add/remove movement animation (new):** bar and sheet icons use framer `layout` +
  `AnimatePresence` (spring) so adding/removing an icon slides the rest into place instead of
  snapping.
- **Gesture change:** the old "drag a sheet icon down ~72px to add it to the bar" gesture was
  removed (free drag now reorders the grid); the green **+ badge** is the single add affordance.
- **Follow-up fixes (same session):** (1) the More sheet stayed open when tapping a bar tab (e.g.
  Home) because the bar sits below the sheet overlay (`modal={false}`); `AppShell` now closes the
  sheet + exits edit mode on any `location.pathname` change. (2) Bar rail height 62px → 70px and
  icons 29px → 32px (matched to the More sheet, also bumped 28px → 32px); overlay `bottom`, sheet
  padding, and `.pb-nav` re-tuned for the taller bar.
- **Follow-up fixes round 2 (same session):** (1) removed the edit-mode "Ziehen zum Sortieren …"
  instruction sentence. (2) Enter/exit on bar + sheet edit tiles is now opacity-only (no `scale`):
  animating a transform on a `layout`/Reorder element fought framer's projection and was freezing
  the jiggle until the next re-render (the "icons only jiggle after an add/remove" bug), and the
  scale pop was also shifting icons on long-press. Positions now stay put and the jiggle starts
  immediately. (3) The Mehr tab now toggles: tapping it while the sheet is open closes it (and exits
  edit mode) via `toggleMore` in `AppShell`.
- **Follow-up fixes round 3 (same session):** (1) scaled the whole mobile bottom nav down ~10% after
  it felt too big: rail 70px → **63px**, icons 32px → **29px** in both the bar and the More sheet,
  with overlay `bottom`, sheet padding, and `.pb-nav` re-tuned to match (PR #191). (2) Fixed an
  intermittent "design glitch" where the whole mobile view got stuck **scrolled sideways** (header
  logo gone, "Vokabeltrainer" clipped to "kabeltrainer", card text cut off on the left). The guard
  against horizontal scroll only lived on `<body>`, but the real scroll container is `<html>`, and
  Radix portals (Select/Dialog) mount at the end of `<body>` and can momentarily push the document
  sideways before Floating UI positions them, which iOS leaves stuck. Added `overflow-x: clip` +
  `overscroll-behavior-x: none` to `html` in `src/index.css` (`clip`, not `hidden`, so no scroll
  container is created and the sticky header is untouched) (PR #192).
- `pnpm build` + `pnpm lint:content` green. Branch `claude/context-bar-menu-animations-g9gfd3`.


### Session 27 (2026-06-16) — Full app audit + targeted fixes
- **Audit headline: the app is healthy.** `pnpm build`, `pnpm typecheck`, and `pnpm lint:content`
  all pass with zero errors (only the known ~159 provenance back-fill warnings). No crashes, broken
  routes, duplicate IDs, broken dialogue branches, missing content, or em dashes in user copy.
  Content counts all match (490 vocab, 396 collocations, 10 grammar topics/47 drills, 1073 provenance
  rows); consent version matches the legal `LAST_UPDATED` date.
- **Fixes applied:**
  - `dataExport.ts`: added the missing `.eq("user_id", user.id)` to the `writing_evaluations` query
    so it matches its sibling queries (RLS already enforced it; this is consistency + defense-in-depth).
  - Both Edge Functions (`evaluate-writing`, `delete-account`): added `Access-Control-Max-Age: 86400`
    so browsers cache the CORS preflight (fewer OPTIONS round-trips).
  - `ExamRunner.tsx`: gave the free-text answer input an `aria-label`.
  - `QuickRevision.tsx`: made the flip card keyboard-accessible (`role="button"`, `tabIndex`, Enter/Space).
  - `Flashcards.tsx`: a lapsed card ("Again", grade < 3) no longer earns the full review XP (it earned
    more than an "Easy" recall before). Successful recalls still reward effort (Good 6 > Easy 4).
  - `srs.ts`: the SM-2 ease factor now decreases on a lapse (it was only updated on success), so a
    repeatedly failed card loses ease and resurfaces sooner.
  - Guest sign-in is now gated behind a captcha token **when Turnstile is configured**
    (`VITE_TURNSTILE_SITE_KEY`): `useAuthStore.signInAsGuest` refuses without a token, and the writing
    flow (`writing.ts`) routes signed-out users through the captcha-gated auth UI instead of a silent
    guest creation. Dormant (no behavior change) until a site key is set, then closes the
    anonymous-signup AI-budget abuse vector.
- **Verified non-issues (not changed):** the MoreSheet `5.75rem` padding is intentional; the
  flashcard Easy(4) < Good(6) ordering is correct (effort-based). Dropped a planned "scoring 70%
  baseline" change after confirming `examSets.ts` has zero quality-scored options: that 70% is the
  intended exam participation credit, and real dialogues always carry quality options, so the default
  is never hit for them. Changing it would have wrongly dropped every exam score by ~28 points.
- `pnpm build` + `pnpm typecheck` + `pnpm lint:content` green. Branch `claude/app-audit-testing-bqrdkj`.


### Session 27 cont. — Navigation icon polish (SHIPPED)
A run of founder-driven nav-icon refinements, all in `route-icons.tsx` / `nav-items.ts` plus the
three icon surfaces (`BottomTabBar`, `MoreSheet`, `Sidebar`):
- **Audit fixes** also included an a11y pass and the SRS/XP/captcha/CORS fixes above (PR #194).
- **Removed the "Leiste voll" helper line** from the More sheet edit mode (PR #195).
- **More sheet closes on re-tapping the active tab:** it only closed via the `location.pathname`
  effect, but re-tapping the active tab doesn't change the route. Added `onNavigate`/`closeMore` so
  any bar tap closes the sheet (PR #196).
- **Full opacity everywhere:** removed the 38% inactive dimming so icons no longer read as blurred;
  active is shown by the backdrop/underline, not opacity (PR #197).
- **Optical-size re-tune (~5%):** bumped most `NORM` weights to reduce empty space, boosted the small
  marks (grammar/exam/analytics), kept large ones restrained, left the pencil unchanged; later bumped
  the home icon another +5% (PRs #198, #200).
- **Two-tone book → two-tone + neon for all icons:** the Wortschatz book first became two-tone indigo
  `#5b5be6` + cyan `#10b7cf` to match the F2 "Per-section Color" preview (PR #199). The founder then
  approved extending the two-tone treatment to **every** icon, each with a brighter **neon** second
  tone (proposal sheet `preview/route-icons-two-tone-neon.svg`).
- **Grey-gradient icon boxes:** the rounded pill/tile behind icons now uses a neutral grey gradient
  (`from-muted to-border`) instead of the section colour at low opacity, across the bar, Mehr pill,
  More-sheet tiles, and the sidebar active row. The `nav-items.ts` `bg` tint field is no longer used
  for backdrops. CLAUDE.md "Icon color rule" updated to capture the two-tone+neon + grey-box design.
- `pnpm build` + `pnpm typecheck` green throughout.


### Session 28 (2026-06-17) — Selection "cloud" refinement: compact squircle + selected-only menu (SHIPPED ✅)
Founder feedback: the grey backdrop behind the active icon (the "cloud") was too big and the gradient
looked convex/protruding. Iterated via HTML mockups (raw.githack preview links, the same flow as the
icon previews) before touching live code:
- **Mockup 1 (`preview/nav-cloud-refined.html`):** current full-slot pill vs tighter options. Founder
  picked the **compact squircle**.
- **Mockup 2 (`preview/nav-cloud-gradients.html`):** six gradient studies of the squircle. Founder
  picked **G1 "flat & even"** (plain `from-muted to-border`, no highlight/shadow dome).
- **Implemented (PR #202, merge `69eee0c`):**
  - Bar active pill + Mehr pill → compact `h-11 w-11 rounded-2xl` squircle hugging the icon (was a
    slot-filling `rounded-xl` pill); underline moved to `bottom-[6px]` (`BottomTabBar`).
  - More sheet → compact `h-12 w-12` squircle tiles; the grey cloud now appears **only behind the
    selected section** in browse mode (every other tile is a bare icon on white). Edit mode keeps the
    squircle on all tiles as the draggable-tile affordance (`MoreSheet`).
  - Note: founder initially saw clouds on every browse tile after the deploy — that was the PWA
    service-worker serving the cached pre-#202 build; a full app close/reopen picked up the fix.
- Docs: CLAUDE.md gained the s28 rules (compact-squircle backdrop, flat & even gradient, More-sheet
  cloud only on the selected tile). `pnpm build` + `pnpm lint:content` green.


### Session 30 (2026-06-20) — Data audit-ready stream: reference back-fill + EU AI Act Art. 50 (SHIPPED ✅)
Advanced the data-governance / audit-ready stream (backlog #7) on two fronts the founder approved together:
- **Provenance reference back-fill complete.** The bootstrap generator had only auto-filled references
  for vocabulary (Wiktionary) and collocations (DWDS), leaving ~162 authored rows (grammar, redemittel,
  dialogues, exam sets, writing prompts) with an empty `reference` (the linter back-fill queue). Added
  `scripts/backfill-provenance-refs.mjs`, which fills **only** empty references with a genuine,
  type-appropriate source: grammar topics/drills → the German Wikipedia article for the topic
  (grammar = facts), redemittel → DWDS corpus search for the phrase, dialogues/exam sets/writing
  prompts → the Council of Europe CEFR B2 descriptors. All **809 rows now carry a reference; the linter
  warning queue is empty.** References are machine-assigned starting points, not verified: every row
  stays `review_status: "draft"`. The four-eyes verification pass (draft → verified) is the next open
  governance step.
- **EU AI Act Article 50 transparency shipped** (ahead of the 2 Aug 2026 date). Confirmed the writing
  coach is the only generative-AI surface (speech = Web Speech API; simulations = scripted dialogue
  trees). It already marked output as "KI-generierte Rückmeldung" in the live result and history; added
  an explicit point-of-use disclosure on the writing editor ("Dein Text wird zur Auswertung an eine KI
  (Anthropic Claude) gesendet. Die Rückmeldung ist KI-generiert und kann Fehler enthalten.") linking to
  the privacy page.
- Verified: `pnpm lint:content` passes with **zero warnings** (was ~162), `pnpm build` + typecheck
  green. Docs updated (`DATA_GOVERNANCE.md` v0.4). **Still open in this stream:** human verification
  of the references, the Tatoeba example-sentence sourcing for vocab sentences, and the Article 6(3)
  profiling risk assessment.


