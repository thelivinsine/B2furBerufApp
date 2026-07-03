# Mobile-App Redesign Plan

_Status: **ALL THREE LAYERS SHIPPED ✅.** Layer 1 (iOS standalone meta tags) shipped 2026-06-04
(session 13); Layer 2 (bottom tab bar + "Mehr" sheet) and Layer 3 (mobile density) shipped across
sessions 24–28. The bottom tab bar is now **founder-locked** (see the "Mobile bottom tab bar" section
in `CLAUDE.md`, which is the authoritative spec). This doc is retained as the historical implementation
plan; do not change nav structure/mechanics from it without an explicit founder request._

## Why

The founder installed Genauly to their iPhone home screen. It launches, but felt like the desktop
website in a frame. We're fixing this in **three layers**:

1. **Layer 1 — full-screen launch (no address bar):** ✅ SHIPPED. iOS Safari ignored the manifest's
   `display: standalone` and needed the legacy `apple-mobile-web-app-capable` meta tag. Added.
2. **Layer 2 — native navigation ("Point 2"):** the nav is a desktop sidebar + hamburger drawer.
   Replace it on mobile with a **bottom tab bar** + a "Mehr" sheet (thumb-reachable, app-like).
3. **Layer 3 — mobile density & fit ("Point 3"):** the app still feels desktop-sized on a phone —
   loose vertical rhythm, big headings, cramped/truncated controls. Tighten spacing and fix the
   specific cramped spots.

## Confirmed decisions (with founder)

- **Bottom bar = Start · Wortschatz · Quiz · Fortschritt · Mehr.** "Mehr" opens a bottom sheet with
  the other 8 features.
- **Both Point 2 and Point 3 are in scope** (founder asked for both, 2026-06-05).
- **HARD CONSTRAINT: desktop stays pixel-identical.** Point 2 is gated behind `lg:hidden` (≥1024px
  untouched). Point 3 is `sm:`-gated (≥640px untouched) — tighter value as the BASE class, current
  value restored at `sm:`; only change classes where mobile currently equals desktop.
- **Recommended ship order:** Layer 2 (bottom bar) → Point 3 Phase A (shared density) → Point 3
  Phase B (targeted fixes). Each is independently shippable and verifiable.

---

## LAYER 1 — iOS standalone meta tags — `index.html` ✅ SHIPPED (session 13)
Added inside `<head>` (after `apple-touch-icon`):
```html
<meta name="theme-color" content="#0f1729" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Genauly" />
```
- `apple-mobile-web-app-capable=yes` is the fix for "shows browser version" (full-screen launch).
- `black-translucent` matches the dark theme + `viewport-fit=cover` (`.pt-safe` compensates).
- `theme-color #0f1729` matches the manifest `background_color`. **Do NOT** change `vite.config.ts`
  manifest (its `theme_color #6366f1` brand accent stays).
- ⚠️ iOS caches the home-screen web-clip — to pick up the change, delete the icon and re-add it.

---

## LAYER 2 / POINT 2 — Bottom tab bar (planned)

### 2.1 Shared nav module — NEW `src/components/layout/nav-items.ts`
Extract the 12-item nav array (inline in `Sidebar.tsx`) to a shared module exporting
`navItems: NavItem[]` (`{ to, label, icon, end? }`) + `PRIMARY_TAB_PATHS = ["/", "/vocabulary",
"/quiz", "/analytics"]`. Refactor `Sidebar.tsx` to import it (desktop sidebar renders identically).

### 2.2 Bottom tab bar — NEW `src/components/layout/BottomTabBar.tsx`
- `<nav>` fixed bottom, `z-30`, `lg:hidden`, `.glass` + `border-t border-border`, `.pb-safe`, row
  `h-16`, 5 slots: Start `/` (Home icon, `end`), Wortschatz `/vocabulary`, Quiz `/quiz`, Fortschritt
  `/analytics`, + "Mehr" `<button>` (LayoutGrid) calling `onMore()`.
- Active = `text-primary` (+ `stroke-[2.5]` icon); inactive = `text-muted-foreground`.
- "Mehr" active when `!PRIMARY_TAB_PATHS.includes(useLocation().pathname)`. Labels `text-[11px]`,
  icons `h-5 w-5`.

### 2.3 "Mehr" bottom sheet — NEW `src/components/layout/MoreSheet.tsx`
Reuse Radix `Dialog`/`DialogContent` (`src/components/ui/dialog.tsx`) overridden to a bottom sheet
(same technique the current left drawer uses):
`left-0 top-auto bottom-0 w-full max-w-none translate-x-0 translate-y-0 max-h-[80dvh] rounded-b-none
rounded-t-2xl border-x-0 border-b-0 pb-[calc(1rem+env(safe-area-inset-bottom))]
data-[state=open]:animate-slide-up`. List the 8 non-primary `navItems`
(`filter(i => !PRIMARY_TAB_PATHS.includes(i.to))`) as `NavLink`s styled like the sidebar rows
(`bg-primary/20`/`text-foreground/80`/`hover:bg-muted/60`); each `onClick` closes the sheet.
Optional grab-handle bar for polish.

### 2.4 AppShell wiring — `src/components/layout/AppShell.tsx`
- Remove the mobile hamburger `<Button>` + mobile drawer `<Dialog>` (bar + sheet replace them).
  Drop now-unused `Menu`/`Dialog`/`DialogContent`/`DialogTitle` imports. Keep the header intact.
- Reuse state (`mobileOpen`→`moreOpen`). Mount `<BottomTabBar onMore={() => setMoreOpen(true)} />`
  and `<MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />` in the root div.
- `<main>` `pb-safe-8` → `pb-nav sm:px-6 sm:pt-8 lg:pb-safe-8` (mobile clears the bar; desktop
  reverts to the exact original `pb-safe-8`).

### 2.5 CSS utilities — `src/index.css` (`@layer utilities`)
```css
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pb-nav  { padding-bottom: calc(4rem + env(safe-area-inset-bottom) + 2rem); } /* h-16 bar + inset + gap */
```

### 2.6 Toaster collision — `src/components/layout/Toaster.tsx` (REQUIRED)
Toasts are `fixed inset-x-0 bottom-6 z-50` → they'd land **on top of the bottom bar** on mobile.
Lift them above the bar below `lg` (line 26): `bottom-6` →
`bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)] lg:bottom-6`. Desktop unchanged.

> **Collision audit (done):** no runner/hub screen uses a `fixed`/`sticky` bottom action bar
> (ExamRunner, SimulationRunner, QuizRunner, RedemittelPractice, Onboarding all use in-flow
> buttons) — the bar collides with nothing but the Toaster (handled above). Landing (`/welcome`)
> and Onboarding (`/start`) render OUTSIDE AppShell → no bar there, as intended.

> **Bar visibility during immersive flows (decision):** keep the bar visible everywhere inside
> AppShell (incl. exam/simulation runners) as a consistent escape hatch. Navigating away
> mid-activity already discards in-progress state today, so this is not a regression. Auto-hiding
> the bar during a timed exam is a nice-to-have **follow-up** (would need the runner to signal
> AppShell), not part of this pass.

---

## LAYER 3 / POINT 3 — Mobile density & targeted fixes (planned)

> **Key de-risking finding (verified):** every `<CardContent>` call site passes its own padding
> (`p-5`/`p-4`/`p-6`/`p-5 sm:p-6`); `CardHeader`/`CardFooter` are unused. Editing the `card.tsx`
> primitive would be **invisible** (callers win via `cn`) yet still touch a shared file. **→ Do NOT
> change `src/components/ui/card.tsx`.** Tighten the real call sites instead.

### Phase A — shared-component density pass (fans out app-wide)

**A1. `src/components/shared/HubHero.tsx`** (Quiz/Writing/Grammar/Simulation/Exam hubs)
- line 25: `gap-4` → `gap-3 sm:gap-4`
- line 26: `flex items-start gap-4` → `flex items-start gap-3 sm:gap-4`
- line 29: icon tile `p-3` → `p-2.5 sm:p-3`
- Leave `Icon h-6 w-6`, title (`text-2xl ... sm:text-3xl` already mobile-smaller), description.

**A2. `src/components/shared/misc.tsx`**
- `SectionHeading` (line 93): `mb-6 ... gap-4` → `mb-4 ... gap-4 sm:mb-6`
- `EmptyState` (line 57): `px-6 py-16` → `px-6 py-12 sm:py-16`
- `EmptyState` icon tile (line 59): `p-3` → `p-2.5 sm:p-3`

**A3. `src/components/shared/StatCard.tsx`**
- line 37: `card-hover h-full p-5` → `card-hover h-full p-4 sm:p-5`
- line 44: `rounded-lg p-2.5` → `rounded-lg p-2 sm:p-2.5`
- Leave `text-2xl` value + `h-5 w-5`.

**A4. Page vertical rhythm — top-level page wrappers only** (the biggest "airy/desktop" tell).
Pattern: `space-y-8` → `space-y-5 sm:space-y-8`; `space-y-6` → `space-y-4 sm:space-y-6`. Apply to
the OUTERMOST page container in: `dashboard/Dashboard.tsx:105`, `simulation/SimulationHub.tsx:36`,
`analytics/Analytics.tsx:175` (space-y-8); `quiz/QuizHub.tsx:125`, `vocabulary/VocabularyTrainer.tsx:33`,
`writing/WritingHub.tsx:51`, `grammar/GrammarHub.tsx:62`, `exam/ExamHub.tsx:25`,
`redemittel/RedemittelTrainer.tsx:23`, `revision/QuickRevision.tsx:105`, `settings/Settings.tsx:43`
(space-y-6).
- **Scope guard:** do NOT touch `space-y` inside `CardContent`/`TabsContent`; leave
  `ExamRunner.tsx`/`SimulationRunner.tsx` (already `space-y-4`).
- **Multi-branch hubs:** QuizHub, GrammarHub, VocabularyTrainer, WritingHub, RedemittelTrainer
  return different sub-views from several `return (...)` branches, each with its own outermost
  `space-y-*`. Per file, grep `space-y-8|space-y-6` and update **each branch's top-level page
  `<div>`** (verify by indentation it's a route-view root, not nested in a Card/section).

### Phase B — targeted fixes (self-contained)

**B1. `src/features/vocabulary/Flashcards.tsx`**
- line 114: card `relative h-72 w-full ...` → `relative h-64 w-full ... sm:h-72` (frees ~32px on
  mobile).
- line 157: grade grid `grid grid-cols-4 gap-2` → `grid grid-cols-2 gap-2 sm:grid-cols-4` (2×2 on
  mobile; desktop back to 4-across).
- line 159 per-button: `flex-col gap-0 py-2 h-auto sm:h-10 sm:flex-row` → `flex-col gap-0 py-2
  min-h-[44px] h-auto sm:min-h-0 sm:h-10 sm:flex-row` (`py-2` alone is only ~36px; `min-h-[44px]`
  hits the iOS touch-target minimum on mobile, `sm:min-h-0`+`sm:h-10` keep desktop identical).

**B2. `src/features/dashboard/Dashboard.tsx`**
- StatItem (line 52): `flex items-center gap-3 px-4 py-3.5 sm:flex-1` → `flex items-center gap-2.5
  px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5 sm:flex-1` (reclaims room so labels like "Gemeistert"/"Tage
  bis Prüfung" stop truncating in the 2×2 mobile strip).
- ProgressRing (line 141): responsive size via existing `useMediaQuery` (`src/lib/hooks.ts`): add
  `const isSm = useMediaQuery("(min-width: 640px)");` and `size={isSm ? 128 : 104}`. Same 640px
  breakpoint as `sm:` → desktop bit-identical; hook reads `matchMedia` synchronously in `useState`
  init → no flash.

**B3. Timer/progress headers (long title + value on one `text-xs` row → wraps on mobile)**
- `exam/ExamRunner.tsx` (~250–253): wrap col `flex-1` → `flex-1 min-w-0`; row add `items-center
  gap-2`; title span add `truncate min-w-0`; time span add `shrink-0`.
- `simulation/SimulationRunner.tsx` (~254–257): same (`flex-1 min-w-0`, `items-center gap-2`, title
  `truncate min-w-0`, `{state.turns} Züge` span `shrink-0`).
- Additive safety classes — visually identical until text would otherwise overflow.

**B4 / B5 — NO CHANGE (deliberate):** VocabularyTrainer tabs already scroll
(`overflow-x-auto no-scrollbar`); Onboarding level grid is functional. Out of scope.

---

## Files

**Layer 2 — New:** `src/components/layout/nav-items.ts`, `BottomTabBar.tsx`, `MoreSheet.tsx`.
**Layer 2 — Edit:** `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Toaster.tsx`, `src/index.css`.
**Point 3 Phase A — Edit:** `src/components/shared/HubHero.tsx`, `misc.tsx`, `StatCard.tsx`, + the
~11 top-level page wrappers in A4.
**Point 3 Phase B — Edit:** `src/features/vocabulary/Flashcards.tsx`, `dashboard/Dashboard.tsx`,
`exam/ExamRunner.tsx`, `simulation/SimulationRunner.tsx`.
**Deliberately untouched:** `src/components/ui/card.tsx`.
**Reuse:** `useMediaQuery` (`src/lib/hooks.ts`), `cn` (`src/lib/utils`), `Dialog`
(`src/components/ui/dialog.tsx`), existing `.glass`/`.pt-safe`/`sm:` patterns.

## Risks
- **Z-index:** header `z-20`, desktop sidebar `aside z-30`, Dialog `z-50`. Bar at `z-30` is correct
  (above header/content, below the sheet); `lg:hidden` so it never coexists with the desktop sidebar.
- **Bottom-sheet override** must zero the centering transforms — `translate-x-0 translate-y-0
  left-0 top-auto bottom-0` (tailwind-merge lets later classes win; the existing drawer relies on
  the same mechanism).
- **Desktop regression (Point 3):** every transform restores its value at `sm:` (ProgressRing gates
  on the same 640px `matchMedia`). Cards that already override padding are NOT touched (we skip the
  primitive) → no double-tightening.
- **Touch targets:** B1's 2×2 grid + `min-h-[44px]` guarantees ≥44px on mobile; shrunk icon tiles
  in A1/A2 are decorative (non-interactive).
- **No chunking change / no circular-chunk regression:** only `.tsx` className strings + one
  `useMediaQuery` import in Dashboard; `vite.config.ts` untouched. Confirm the build log stays clean.

## Verification
1. `npm run typecheck` green (watch unused-import errors in AppShell); `npm run build` green with
   **no circular/chunk warning** (compare to a baseline build of `main`).
2. Dev responsive at **390px**: bottom bar present, tighter rhythm, no truncated stat labels, 2×2
   grade buttons, smaller ring, headers don't wrap, nothing hidden behind the bar. Trigger a toast
   (earn XP) → floats **above** the bar. Open "Mehr" → sheet covers the bar (z-50 > z-30); tapping
   an item navigates + closes; "Mehr" tab active on routes like `/grammar`.
3. **Desktop-unchanged proof:** at **≥641px** every `sm:` value renders identical to current `main`
   (toggle responsive 641px, or `git stash` + screenshot-diff at 640px). At **≥1024px** the bar is
   gone and the sidebar is unchanged.
4. `dist/index.html` still contains the 5 Layer-1 meta tags.
5. Device test (after deploy): iPhone Safari → Share → "Zum Home-Bildschirm" → label "Genauly" →
   launch → full-screen, no address bar, translucent status bar, notch/home-indicator respected,
   bottom bar above the home indicator.

## Ship (per phase)
Build green → commit on `claude/genauly-blank-page-9biDi` → PR into `main` → squash-merge → realign
dev branch to `origin/main` (`fetch` → `reset --hard` → `push --force-with-lease`) → mark the
shipped step ✅ here + add a `docs/PROJECT_STATUS.md` session entry. Founder verifies on device
(re-add to home screen; iOS caches the old web-clip). Sandbox can't reach the device/live site.
