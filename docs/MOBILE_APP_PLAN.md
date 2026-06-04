# Mobile-App Redesign Plan (deferred — pick up here)

_Status: **PLANNED, not yet implemented.** Approved by founder 2026-06-04, deferred for a later
session. Branch when resuming: `claude/genauly-blank-page-9biDi`._

## Why

The founder added Genauly to their iPhone home screen. It launches, but (1) it still shows
Safari's browser chrome (address bar) and (2) the UI feels like the website in a frame — a
desktop left-sidebar with a hamburger drawer on mobile, which is a "web", not "app", model.

Two root causes, both fixable:

1. **Browser chrome still visible:** `index.html` is missing `apple-mobile-web-app-capable`.
   iOS Safari ignores the manifest's `display: standalone` for home-screen launch mode and
   requires that legacy Apple meta tag to launch chromeless. (Verified absent.)
2. **Doesn't feel native:** navigation is a desktop sidebar (`lg:block`) + a modal hamburger
   drawer (`lg:hidden`). The native pattern is a **bottom tab bar** within thumb reach.

## Confirmed decisions (with founder)

- **Scope = "app chrome + navigation" only.** No screen-by-screen redesign. **Desktop (≥1024px /
  `lg`) must stay pixel-identical** — every new mobile UI piece is gated behind `lg:hidden`, and
  desktop `<main>` padding is preserved via `lg:` overrides.
- **Bottom bar = Start · Wortschatz · Quiz · Fortschritt · Mehr.** "Mehr" opens a bottom sheet
  listing the other 8 features.

> **Quick win available independently:** Step 1 (the iOS meta tags) alone fixes the visible
> address bar and can ship on its own, ahead of the bottom-bar work, if desired.

## Approach

### 1. iOS standalone meta tags — `index.html`
Add inside `<head>` (after the existing `apple-touch-icon` link):
```html
<meta name="theme-color" content="#0f1729" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Genauly" />
```
- `apple-mobile-web-app-capable=yes` is the fix for "shows browser version" — iOS launches the
  home-screen icon full-screen/chromeless.
- `black-translucent` matches the dark theme + existing `viewport-fit=cover`: content draws under
  a transparent status bar, which the existing `.pt-safe` header padding already compensates for.
- `theme-color #0f1729` matches the manifest `background_color` (dark surface) for a seamless
  edge. **Do not** change `vite.config.ts` manifest (its `theme_color #6366f1` brand accent stays).

### 2. Shared nav module (de-dupe) — NEW `src/components/layout/nav-items.ts`
Extract the 12-item nav array currently inline in `Sidebar.tsx` into a shared module exporting
`navItems: NavItem[]` (`{ to, label, icon, end? }`) and
`PRIMARY_TAB_PATHS = ["/", "/vocabulary", "/quiz", "/analytics"]`.
Refactor `Sidebar.tsx` to import `navItems` (delete its inline array + now-unused icon imports).
Pure refactor — desktop sidebar renders identically.

### 3. Bottom tab bar — NEW `src/components/layout/BottomTabBar.tsx`
- `<nav>` fixed bottom, `z-30`, `lg:hidden`, `.glass` + `border-t border-border`, `.pb-safe`.
- Inner row `h-16`, 5 equal slots: 4 `NavLink`s (Start `/` with `Home` icon + `end`, Wortschatz
  `/vocabulary`, Quiz `/quiz`, Fortschritt `/analytics`) + a "Mehr" `<button>` (`LayoutGrid` icon)
  that calls `onMore()`.
- Active = `text-primary` (+ `stroke-[2.5]` icon); inactive = `text-muted-foreground`.
- "Mehr" active when `!PRIMARY_TAB_PATHS.includes(useLocation().pathname)`.
- Labels `text-[11px]`, icons `h-5 w-5`.

### 4. "Mehr" bottom sheet — NEW `src/components/layout/MoreSheet.tsx`
Reuse the existing Radix `Dialog`/`DialogContent` (`src/components/ui/dialog.tsx`), overriding the
centered modal into a bottom sheet — same className-override technique the current left drawer
already uses (proven). Key overrides on `DialogContent`:
`left-0 top-auto bottom-0 w-full max-w-none translate-x-0 translate-y-0 max-h-[80dvh]
rounded-b-none rounded-t-2xl border-x-0 border-b-0 pb-[calc(1rem+env(safe-area-inset-bottom))]
data-[state=open]:animate-slide-up`.
List the 8 non-primary `navItems` (`filter(i => !PRIMARY_TAB_PATHS.includes(i.to))`) as `NavLink`s
styled to match the sidebar rows (`bg-primary/20`/`text-foreground/80`/`hover:bg-muted/60`); each
`onClick` closes the sheet. Optional grab-handle bar for polish.

### 5. AppShell wiring — `src/components/layout/AppShell.tsx`
- Remove the mobile hamburger `<Button>` and the mobile drawer `<Dialog>` block (the bar + sheet
  replace them). Drop now-unused `Menu`/`Dialog`/`DialogContent`/`DialogTitle` imports. Keep the
  header intact (mobile logo, streak, level, XP ring, theme toggle, account menu).
- Reuse the state (rename `mobileOpen`→`moreOpen`). Mount
  `<BottomTabBar onMore={() => setMoreOpen(true)} />` and
  `<MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />` inside the root div (placement
  irrelevant — bar is `position: fixed`).
- Main bottom padding: change `<main>` `pb-safe-8` → `pb-nav sm:px-6 sm:pt-8 lg:pb-safe-8` so
  mobile clears the fixed bar and **desktop reverts to the exact original `pb-safe-8`**.

### 6. CSS utilities — `src/index.css` (`@layer utilities`)
```css
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pb-nav  { padding-bottom: calc(4rem + env(safe-area-inset-bottom) + 2rem); } /* h-16 bar + inset + 2rem gap */
```

### Out of scope (future follow-ups)
- Screen-by-screen mobile polish (flashcard sizing, 2-col grade buttons, more bottom sheets).
- `useMediaQuery("(display-mode: standalone)")` branching — only if the LandingPage later needs to
  suppress install CTAs in standalone.

## Files
**New:** `src/components/layout/nav-items.ts`, `src/components/layout/BottomTabBar.tsx`,
`src/components/layout/MoreSheet.tsx`
**Edit:** `index.html`, `src/components/layout/AppShell.tsx`,
`src/components/layout/Sidebar.tsx`, `src/index.css`
**Reuse:** `src/components/ui/dialog.tsx`, `useMediaQuery` (`src/lib/hooks.ts`), `cn`
(`src/lib/utils`), existing `.glass`/`.pt-safe` utilities and design tokens.

## Risks
- **Z-index:** header `z-20`, desktop sidebar `aside z-30`, Dialog `z-50`. Bar at `z-30` is
  correct (above header/content, below the sheet). Bar is `lg:hidden` so it never coexists with
  the `z-30` desktop sidebar.
- **Bottom-sheet override** must zero the centering transforms — handled by
  `translate-x-0 translate-y-0 left-0 top-auto bottom-0` (tailwind-merge lets later classes win;
  the existing drawer relies on the same mechanism).
- **Unused imports** after removing the drawer — typecheck will catch.
- **Circular-chunk warning must not return:** none of these changes touch the
  `react-router`/`@remix-run/router` chunking in `vite.config.ts`; new files import only existing
  modules + `lucide-react`. Confirm the build log stays clean.

## Verification
1. `npm run typecheck` green (watch for unused-import errors in AppShell).
2. `npm run build` green AND no `circular` warning; same vendor chunk names as before.
3. `npm run dev`, responsive devtools: <1024px shows bottom bar, no sidebar/hamburger; ≥1024px
   hides bar, desktop sidebar unchanged. Toggle across the 1024px boundary.
4. "Mehr" → sheet slides up, lists the 8 non-primary features, tap navigates + closes; "Mehr"
   tab active on routes like `/grammar`, primaries active on their routes.
5. Long page (`/vocabulary`) on mobile: last content clears the fixed bar; desktop bottom spacing
   identical to before.
6. `dist/index.html` contains the 5 new meta tags verbatim.
7. Device test (after deploy): iPhone Safari → Share → "Zum Home-Bildschirm" → label "Genauly" →
   launch icon → **full-screen, no address bar**, translucent status bar over the dark header,
   notch/home-indicator respected, bottom bar above the home indicator.

## Ship (when implemented)
Build green → commit on `claude/genauly-blank-page-9biDi` → PR into `main` → squash-merge →
realign dev branch to `origin/main` → update `docs/PROJECT_STATUS.md`. Founder verifies the live
Add-to-Home-Screen result (sandbox can't reach the device or live site).
