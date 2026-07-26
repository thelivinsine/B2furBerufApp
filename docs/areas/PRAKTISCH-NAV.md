# Praktisch dashboard, navigation & header — current state

Structure here is **locked**: do not change bar structure, edit-mode behavior, or icon rules
without an explicit founder request. Mechanism history + mockups: `docs/DECISIONS.md`.

## Nav zones
Tabs: **Praktisch** (`/`), **Bibliothek** (`/library`), **Schreiben** (`/writing`, brand-blue
accent, nib mark), **Fortschritt** (`/analytics`), + **Einstellungen** (fixed last slot).
**Anwenden is HIDDEN from the nav** (founder, demo): removed from `navItems`, but `/anwenden`
stays mounted in `router.tsx` so `/welt` + deep links resolve — re-add the `navItems` row to
restore it. `BottomTabBar` `REORDERABLE = ["/library", "/writing"]` + `FIXED_LAST_CONTENT =
"/analytics"` (Fortschritt is pinned directly left of Einstellungen for every user since s158,
founder request; older persisted orders are normalised at read time);
`DEFAULT_PINNED_TABS = ["/", "/library", "/writing", "/analytics"]` (Home + 3 middle + fixed
Einstellungen = the 5 locked slots). Route marks (founder picks, s158; Bibliothek + Fortschritt
swapped s170): Praktisch = Wegweiser signpost, Bibliothek = stack of three books, Schreiben =
fountain-pen nib (accent moved rose → brand blue), Fortschritt = Pokal (trophy/cup). The Anwenden hub
itself (`/anwenden`) is 3 cards → Sprechen/Schreiben/Prüfung. Remote-config overrides (admin
Steuerung H1/H2/H8) may relabel/hide nav items at runtime; defaults match the above.

## Bottom tab bar (mobile)
- Fixed bar, single icon rail, **63px tall**, icons 29px. 5 slots: Home (fixed slot 1) + 3
  middle + Einstellungen (fixed last, plain NavLink to `/settings`). The More sheet is retired
  (`MoreSheet.tsx` deleted); no add/remove — the middle sections are always visible and only
  Bibliothek + Schreiben REORDER via a hidden long-press easter egg (600ms, haptic; jiggle +
  drag; transparent full-screen layer = "tap anywhere to finish"; navigating also ends it).
  Home, Fortschritt and Einstellungen never move (Fortschritt pinned s158).
- **Active-tab labels:** each tab shows its section name under the icon, visible ONLY on the
  selected tab. The label slot is a reserved fixed-height row on every tab (selection never
  shifts the icon rail); the label is neutral theme-aware dark grey
  (`text-slate-600 dark:text-slate-300`), NOT the section accent ("blue not premium"). The active
  squircle is `h-10 w-10` (a founder-approved exception to the earlier `h-11` lock, to fit the
  label inside the 63px bar). No active underline.
- **Icon rules:** icons are always colored, full opacity everywhere (never grey/mono, never
  inactive dimming — it read as blurred). Every route has ONE custom branded SVG mark + ONE
  unique accent base colour, defined once in `components/layout/route-icons.tsx` (`RouteIcon`) +
  `nav-items.ts` (`color`); marks are **two-tone** (section base + a brighter neon second tone,
  hard-coded per mark). Same mark/colours on every surface (bar, desktop Sidebar). Marks are
  normalised to a common optical size (`NORM` map + `normTransform`). The `desc` field on
  `NavItem` is kept for reuse but not shown. Reference sheet: `preview/route-icons-preview.svg`.
- **Backdrops:** the active-tab backdrop is a compact flat neutral squircle (`bg-border`,
  `rounded-2xl`) hugging the icon — never section-tinted, never a gradient, never a full-slot
  pill or raised dome. Sidebar active row same neutral treatment.
- **Edit mode:** jiggle via framer `rotate` keyframes; bar icons reorder via `Reorder.Group`
  (horizontal, `flexGrow: moveablePaths.length` so slot widths stay stable). Enter/exit is
  **opacity-only, never scale** (scale fights framer's layout projection — froze the jiggle,
  shifted icons). No "Fertig" button: edit mode ends on outside tap (auto-save). X-button
  `onClick` is guarded with `onPointerDownCapture` + `onPointerDown` stopPropagation so the drag
  gesture doesn't consume the click.
- **Store:** `useSettingsStore.pinnedTabs: string[]` (persisted `version: 1`; `migrate` remaps
  removed routes via `ROUTE_SUCCESSOR` in `nav-items.ts`). `moreOrder`/`setMoreOrder` are
  legacy/unused (kept so old persisted settings don't break). **`BottomTabBar` reads the store
  DIRECTLY — never add a `localOrder` cache or `useEffect` sync layer** (root cause of the "icon
  added but didn't appear" bug). `BottomTabBar` owns its own `editMode`.
- **iOS fixes (do not revert):** `.no-callout` class (container AND `*` children;
  `-webkit-touch-callout: none !important` — inline style does not cascade to NavLink's `<a>`);
  `transform: translateZ(0)` + `willChange: transform` on the `<nav>` (forces a GPU layer so iOS
  Safari doesn't collapse the bar under a `backdrop-filter` sibling). The `.pb-nav` utility is
  sized for the single-rail bar; keep in sync if the rail height changes.

## Header
Carries only **logo · streak · account**. Theme toggle lives in the `AccountMenu` dropdown
(Hell/System/Dunkel row); Modus lives in Einstellungen → Lernen; no mobile global-search entry;
the wordmark drops on mobile (g mark stays); the streak pill has no goal-gauge ring and rides
the Koralle reward tokens (streak = celebration).

## Praktisch dashboard (`/`)
One column on ALL sizes (two-column desktop was rejected). Heute → **Trainieren/Spielen toggle**
(`Dashboard.tsx`; "Üben" → "Lernen" s105, → "Trainieren" with the dumbbell restored s158, both
founder requests): since s170 it shares the squircle-track + sliding-pill language with
`LibrarySwitcher`/`WritingModeSwitcher` (`rounded-lg` track, `rounded-md` pill, `useSlidingPill`
measuring the active segment), content-sized (`w-fit`, centered) rather than full width since it is
only two segments. Active tab keeps its subtle section tint on the sliding white pill (Trainieren
`text-blue-600` + lucide Dumbbell icon; Spielen `text-orange-500` + Play icon; both active icons
fill via `fill-current`). Tab switch is a directional horizontal slide (right→left to Spielen,
~0.16s easeOut, reduced-motion safe).

### Üben tab (`features/dashboard/UebenPath.tsx`, lazy — imports the mission bank, Heute stays bank-free)
- A **soft illustrated SVG city map** with the Kapitel-1 stops (Bahnhof/Laden/Zuhause/Amt) as
  colored landmark tiles inside their blocks, never on a street; state from `missionsDone`: route
  solid to the current stop and dotted onward, completed stops get a white route dot, a location
  pin + "Du bist hier" chip marks the current stop (no player figure, no stepper). Centered
  "Lernpfad" title mirrors Spielen's "Neuland" header.
- The map is a native 3:2 block (360×240 viewBox) inside a **white `bg-surface p-2` mat** with a
  neutral grey `border-border` — the SAME mat frames the Spielen chapter hero, so both tiles
  share dimensions AND screen position (header+map pinned top with fixed `gap-4`, pager pushed
  down with `mt-auto`; measured parity at 390×844). Founder explicitly wants the white mat and
  the neutral border (per-section colored borders read poorly; section color lives on the toggle
  only).
- Palettes: `MAP_LIGHT` = brand-tinted "Stimmung 3" (indigo-tinted ground/lots, green parks),
  `MAP_DARK` = the deliberately BRIGHT "Klarer Abend" (blue-grey ground, near-white labels; do
  not darken it back). Route/pin color rides the palette (`P.route`; dark uses a brighter indigo
  than the dark `--primary` token, don't revert). Street grid keeps landmark tiles off the map
  edges.
- **Labels + the "Du bist hier" chip are collision-authored per stop** (`labelPos`/`chipPos` in
  STOPS): top-row stops label ABOVE the tile and put the chip RIGHT of the pin (below-label/
  above-chip lands under the pin + pulse ring); keep this rule when adding stops.
- **Landmark tiles are tappable:** each stop is a `role="button"` SVG group (44px hit rect,
  hover/focus scale, Enter/Space) whose tap slides the practice card to that stop's first
  unplayed mission (`stopTarget` → `goTo`); the pin never moves (progress truth) and renders at
  70% scale about its tip.
- Below the map: the **practice-module card** — "n / 6" progress badge in accent (green reserved
  for done), a "1.x" number + "Als Nächstes" chip in the meta row, an "Erledigt" green badge on
  the title line for a completed module, and ONE state-aware CTA: "Jetzt üben" on
  `bg-accent-gradient` + `shadow-glow` for a new module, "Wiederholen" on plain `bg-muted` grey
  for a completed one — BOTH open the same mission-focused session (`/session?mission=<id>`, NOT
  the game; playing missions lives under Spielen and `/welt`). No separate `/revision` entry on
  the card (merged by founder, don't re-add). The module block slides horizontally via
  framer-motion on pager change (~0.13s, `useReducedMotion`-guarded).
- Bottom: **module pager** — per-mission dots (active = primary pill, done = success) with 32px
  tap targets; chevrons are desktop-only (`hidden sm:grid`); on mobile the dots + a horizontal
  swipe on the card navigate. Paging never moves the map pin.
- Root layout: `flex min-h-[calc(100dvh-15rem)] flex-col gap-4`, header + map pinned TOP, card +
  pager grouped and vertically centered below (`my-auto` + `space-y-3`). The tab fits a phone
  viewport without scrolling (min-height tuned under the bottom nav; compact paddings; Dashboard
  wrapper `space-y-4`); keep it that way.
- Desktop: the Dashboard root becomes
  `lg:flex lg:min-h-[calc(100vh-8.5rem)] lg:flex-col lg:justify-center` (vertical centering);
  the column is `lg:max-w-[26rem]` (mobile `max-w-md`), toggle→content gap `lg:space-y-3`. Üben
  is scroll-free down to a 768px viewport, Spielen to ~800px. `UebenPath` takes natural height on
  desktop (`lg:min-h-0`, card/pager `lg:my-0`).

### Spielen tab (`features/dashboard/SpielenHub.tsx`, lazy)
Renders the shared `features/welt/NeulandHub` (see `docs/areas/GAME.md` for the hub spec) with
the `compact` prop and deep-links `/welt?mission=<id>` to play full-screen. Exiting a mission
deep-linked from here routes back to `/?tab=spielen` so the toggle is present.

## Feedback pill
`components/layout/FeedbackButton.tsx`: a subtle fixed "Feedback" pill (label shortened from
"Mit KI gebaut · Feedback" app-wide, s160; remote-config `feedback.label` still overrides) on every
non-focus page (mounted in `AppShell`). Opens a dialog → `lib/feedback.ts` `submitFeedback` →
the `submit-feedback` Edge Function (`verify_jwt=false`, anonymous-OK) which stores a
`public.feedback` row AND emails the founder via Resend.
