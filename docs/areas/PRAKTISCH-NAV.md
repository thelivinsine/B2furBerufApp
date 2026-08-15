# Spielplatz dashboard, navigation & header — current state

Structure here is **locked**: do not change bar structure, edit-mode behavior, or icon rules
without an explicit founder request. Mechanism history + mockups: `docs/DECISIONS.md`. (This tab
was called "Praktisch" through s209; renamed "Spielplatz" s210 because "Simulation" and "Alltag"
were both already taken elsewhere in the app. The file keeps its old name, `PRAKTISCH-NAV.md`, as a
stable identifier every other doc links to.)

## Nav zones
Tabs, in the ONE order both surfaces draw (s205, founder: "keep bibliothek on the top, and the
praktisch beside the settings; praktisch should be labeled as beta"):
**Bibliothek** (`/library`, fixed FIRST slot), **Prüfung** (`/anwenden`, orange Absolventenhut),
**Fortschritt** (`/analytics`), **Spielplatz** (`/`, fixed directly left of Einstellungen, wearing a
**Beta** suffix), + **Einstellungen** (fixed last slot). Bibliothek took the opening slot because
onboarding now hands a new learner straight to it (no taster session), and Spielplatz moved to the
far end because that zone is still being built. `/` is unchanged as a route: still the Dashboard,
still the app root and the catch-all target, just not the first tab.

**A cold open of the bare root also lands on `/library`, not the Dashboard** (founder s212: "when
the app opens the user sees the library instead of the playground"). `lib/appEntry.ts` runs at
module-eval time, imported second in `main.tsx` right after `lib/authCallback.ts`: if
`window.location.pathname === "/"` it calls `history.replaceState` to `/library` (search and hash
preserved) BEFORE React Router ever sees the URL. A module evaluates exactly once per real page
load, never on a client-side route change, so this only ever fires on a genuine cold open (the
PWA's `start_url`, a bookmark of the bare domain, a hard reload) and never on an in-app navigation:
tapping the Spielplatz tab is a `<Link>` click, not a reload, so it still shows the Dashboard.
`/library` carries the same `RequireOnboarding` gate `/` did, so a not-yet-onboarded visitor still
lands on `/welcome`, one hop earlier than before. The preserved search/hash matters for the two
things that legitimately arrive on the bare root: Google's OAuth PKCE callback
(`redirectTo: origin + "/"` in `useAuthStore.ts`, a bare `?code=…` that `supabase-js` consumes
itself regardless of path) and a legacy Supabase "Confirm signup" link (`#access_token=…`, already
snapshotted by `authCallback.ts` before this runs). `public/spa-redirect.js` has already restored
any GitHub-Pages-mangled deep link (`/?/settings` → `/settings`) by the time this evaluates, so an
actual deep link never reaches here with pathname `"/"`. Gated by `tests/appEntry.test.ts`.
**The transfer zone came back and absorbed Schreiben in s182.** Audit P4 found the Sprechsimulation
reachable only from the dashboard recommendation and ⌘K (the hub had been off `navItems` since
2026-07-13, founder, for the demo). It returned to the desktop sidebar first; the founder then
settled the mobile question by RESHAPING rather than growing the bar: **"just move schreiben to
anwenden and rename anwenden as prufung"**. So `/writing` lost its tab (it had one from 2026-07-22),
the hub is labelled **Prüfung**, and it holds the three exam skills: Sprechen, Schreiben,
Prüfungssimulation. The bar is still FIVE slots. `/writing` keeps its route, its pencil mark and
every deep link, and a pin saved while it was a tab remaps through `ROUTE_SUCCESSOR`.
`BottomTabBar` `FIXED_FIRST = "/library"` + `REORDERABLE = ["/anwenden", "/analytics"]` +
`FIXED_LAST_CONTENT = "/"` (s205; before that the fixed ends were Home first and Fortschritt last,
founder s158). `DEFAULT_PINNED_TABS = ["/library", "/anwenden", "/analytics", "/"]`. The bar pins
its own ends and only READS a saved order for the reorderable middle, so every pre-s207 pin list
still renders the new five slots with no migration.
`NEVER_HIDEABLE = ["/library", "/", "/settings"]` (nav-items.ts) is the three fixed slots: remote
config may hide only a middle tab, and both the bar and the sidebar enforce it, so a stale
`hiddenTabs` entry can never empty a slot on one surface while the other keeps drawing it.
`HIDEABLE` in admin Steuerung is therefore Fortschritt alone. Every slot carries `min-w-0` so the name under the
active tab truncates instead of setting a width floor (s182: "Einstellungen" was forcing a 73px
slot). Route marks
(founder picks, s158; Bibliothek, Fortschritt + Schreiben swapped s170): Spielplatz = Wegweiser
signpost, Bibliothek = stack of three books, Prüfung = Absolventenhut (orange cap + amber base,
founder pick D s183; it replaced the target rings, the bar's ONLY outline mark among filled
two-tone shapes, which is why it read thinner than its neighbours), Fortschritt = Pokal
(trophy/cup); the pencil-on-the-diagonal Schreiben mark lives on inside the hub card.
The Prüfung hub itself lives at `/anwenden` and is ONE page with a two-segment header switcher
(s189, below). `/exam` redirects into it (`?tab=modelltest`) and is kept forever: it is in
learners' history, in the dashboard recommendation and in ⌘K.

**A tab is lit by its ZONE, not by its URL** (s192, founder: "the prufung bottom bar isn't selected
here", on `/writing`). A zone owns more routes than its own path, so `navZoneOf(pathname)`
(`nav-items.ts`) folds them: `/writing`, `/simulation`, `/exam` → Prüfung; `/quiz` and the retired
per-tool routes → Bibliothek; `/session`, `/revision`, `/welt` → Spielplatz; `/sammlung` →
Fortschritt; everything else (`/sources`, `/hilfe`, the legal pages, `/admin`) lights nothing. The
bar and the sidebar both read it, and both render a plain `Link`: `NavLink` would re-decide the
state from the URL and it also SWALLOWS `aria-current` (it reads that prop as "the value to use when
I consider myself active"), so the lit tab announced nothing to a screen reader. `NAV_ZONE_OF_ROUTE`
is the same fold as `ROUTE_SUCCESSOR` plus the routes that never were tabs; the two answer different
questions (pin migration vs. active state), so they stay separate.

### The Prüfung hub (`/anwenden`, redesign s189, polished s190)

Founder brief: "insert a toggle in place of the current header, similar to Bibliothek", with
**Module üben** and **Modelltest** as the two options. It folded two pages into one (the three-card
`/anwenden` hub and the `/exam` Modelltest page). Layout "A · Kompakt" from
`preview/pruefung-hub-redesign.html` + `preview/pruefung-hub-r2.html`.

- **Header:** the two-segment sliding-pill switcher IS the page header (`useSlidingPill`, one
  always-mounted pill). No HubHero, no `h1`. Full width on a phone, **capped at `max-w-sm`** from
  there (s190: at 834px the track stretched the full column, the shape rejected in s149), and
  content-sized from `lg` up. The scope row keeps a **fixed `h-9`** so hiding the clock switch on the
  Modelltest tab cannot shift the page (s190). Switching tabs plays the Bibliothek's own directional
  slide (`AnimatePresence mode="popLayout"`, 0.15s), because the same gesture should feel the same
  in both places.
- **ONE frame for both tabs** (s190): the header and both panels share `lg:max-w-4xl mx-auto`, so
  switching never changes the page's width. Before this the module grid capped at 896px while the
  band and Verlauf ran the full 1152px column.
- **Scope controls** sit BELOW the switcher at every width (founder s189): navigation first, then
  what it is scoped to. Sharing one line on a desktop gave the two the same rank. **Both rows are
  CENTRED at every width**, desktop included (founder), so the header reads as one stacked block on
  its own axis rather than two controls pushed to opposite edges. The header column is
  `items-center`, which is also what keeps the two-segment track sized to its labels from `lg` up
  instead of stretched across the page (the shape rejected in s149).
  Niveau is a compact `Niveau B2 ▾` button, NOT a second pill row: the switcher above already
  owns switcher rank, and two grey tracks stacked before any content read as a heavier header than
  the page they introduce. This replaced the s188 Niveau pill switcher.
- **Module üben:** the four modules as identical cards, **2×2 at every width** (founder s189:
  four across a 1152px column left them narrow and cramped against all that empty page). On a
  desktop the block caps at `max-w-4xl` and centres, and the cards grow their own padding, mark and
  title rather than being stretched. `lg:w-full` beside `lg:max-w-4xl` is load-bearing: the grid is
  a flex child, and auto cross-axis margins make a flex item fall back to its CONTENT width, which
  collapsed the block to 411px.
  **The card (s190, founder pick B "Prüfungstag"):** the mark top-left and a quiet arrow top-right
  (the card is a button and has to read like one), then the title. The badge corner is **RESERVED in
  both clock states** via the card's bottom padding, so the minutes badge appears and disappears with
  the switch without moving a single card edge. This is where "Einzeln üben" went.
  **There is NO description line** (founder s191, a screenshot of the badge sitting on the text): a
  24px badge held 12px off the bottom needs more room than the 28px reserve gave it, so with the
  clock on it overlapped the description on every card. The card names the module, the badge states
  the minutes, and nothing else has to fit. The ONE line that can still appear is the honest empty
  state ("Noch keine Inhalte"), which only shows on a card that has no badge, so the two can never
  collide. `FREE_DESC` went with it; `PART_META.desc` stays, because the Anleitung pages use it.
  **No gradient on the card and none on the mark** (founder s191, "get rid of the colored gradient
  from the tiles"): the s190 corner wash (`.mod-wash-*`) is deleted and `PART_META.tile` is a FLAT
  tint of the module's hue. The colour still carries the receptive/productive fact, it just carries
  it as one even wash on a white card. Do not reintroduce either.
  **The header and the tiles are two sections:** the gap between the header block (switcher + scope
  row) and the tab's content is deliberately wider than the gaps inside either one (`gap-6 sm:gap-7`
  against `gap-4 sm:gap-5`, founder s191), so the controls do not read as the first row of an evenly
  spaced stack.
- **Mit Zeit / Ohne Zeit** (founder pick "idea 3", s189) is ONE switch beside Niveau, and
  **Ohne Zeit is the resting state**. It is how the free trainers merged INTO the modules rather
  than sitting beside them: Schreiben ohne Zeit opens `/writing`, Sprechen ohne Zeit `/simulation`,
  and Lesen/Hören run the same drill with `untimed` set (no tick, no timer pill, never auto-handed
  in). The separate "Freies Üben" block the earlier rounds carried is gone with it, and those two
  trainers have no other entry point, so the switch is load-bearing.
  **The exam FRAME belongs to Mit Zeit alone** (founder s192: "this screen mode represents exam
  mode, this should only be shown when a user is in mit zeit mode, keep this consistent for all the
  modules"). Ohne Zeit therefore: skips the Anleitung and opens the drill directly
  (`useExamStore.start` sets `phase: "part"`, and `completePart` never hands the next part over
  through an intro either); calls the way out **Zurück**, a neutral arrow in the header instead of
  the red Verlassen (the flag rides `useSessionStore.examUntimed`, because AppShell may not import
  the exam store); leaves with NO confirm while nothing has been answered, noted or written; and
  names the confirm it does show "Übung verlassen?". What stays exam-shaped is the STAGE: one
  viewport, the bottom bar out, the drill scrolling internally. Mit Zeit keeps the Anleitung
  verbatim ("Prüfungsteil", the minutes, "der Timer läuft, sobald du startest").
- **Modelltest:** the run band and Verlauf, nothing else. Below `lg` the band is eyebrow +
  "52 Min gesamt" + countdown, the four modules as a timeline, then the CTA, **centred and with no
  rule above it** (founder s189: the divider cut the band in two, and the run is one thing). It takes
  the room the page leaves **on a phone only** (`flex-1 sm:flex-none`, s190: on a tablet the same
  rule stretched one card to 800px and left the timeline floating in the middle of it), so
  "Prüfung starten" still sits in the thumb's reach where that matters.
  **From `lg` the band is a two-column ticket** (s190): the total as a display figure, the sub-line,
  the countdown and the CTA on the left, the four Teile as a connected vertical ladder on the right.
  The total is stated ONCE per breakpoint, never twice.
- **The timeline connector is ONE SEGMENT PER GAP** (founder s189), drawn from the edge of one tile
  to the edge of the next. The single full-width line it replaced ran behind the marks and read as
  if it crossed them; do not restore it (and the `border-surface` ring that used to mask it is gone
  with it).
- **BOTH tabs end in a Verlauf** (s190), sharing one card shell: eyebrow + count, a summary, the
  newest rows, and one expand button. At rest a **phone shows the summary only** (a 2×2 grid plus a
  summary plus a list does not fit one phone screen); from `sm` up the newest three rows are listed.
- **Modelltest Verlauf = founder pick V2 "Zahl und Kurve"** (s190, replacing the three flat cells of
  s189): "Letzter Durchlauf" as a display figure with a delta chip against the run before it, Bester
  and Bestanden as two supporting stats, and the last seven totals as bars against a dashed 60 %
  pass line. The pass threshold is named in the caption, never labelled on the chart, where it sat on
  top of the early bars. A row is date · four result segments in exam order · total badge · chevron,
  and its disclosure holds the four per-module percentages. A run that produced NO score prints
  "Nicht bewertet" instead of four empty tracks, which read as a loading skeleton.
- **Module üben Verlauf = founder pick M3 "Stärkeprofil"** (s190): four columns on one scale, one per
  module, where the **pale** segment is the learner's first attempt and the **solid** cap on top is
  what they have gained since (a dotted marker line was tried first and vanished against a saturated
  fill). A module never practised shows "–" over a lighter track so it recedes instead of dominating.
  Under it the practice rows: date · mark · module · score.
  **From `lg` this card splits into two columns** (summary left, rows right): a 2×2 grid plus a
  four-column profile plus a list stacked come to 930px, which scrolls a 900px laptop on a page that
  is supposed to rest; side by side they come to 750px and the card stops wasting the 400px of width
  the profile does not use. The summary centres itself vertically, so an expanded list does not leave
  a void beside it.
- **The two lists are disjoint** (s190): a **Modelltest** is a `mockExams` record that sat all four
  parts, a **module practice** is one that sat a single part (`isFullRun` / `toPractice`, pinned in
  `tests/pruefungHub.test.ts`). Before the split a single Lesen drill counted as a Modelltest result
  and its percentage landed in "Bester". The profile therefore plots the score of a module SAT AS A
  MODULE; the untimed Schreib- and Sprechtrainer produce a correction, not a percentage, and keep
  their own Verlauf on their own pages.
- **Results appear ONLY in Verlauf** (founder s188): not on the band, not on the module cards.
- **Zero states:** an unservable Niveau (A2) states "Noch keine Inhalte" once per control and
  Verlauf simply isn't rendered. With runs but nothing scored, the summary says so in one line
  ("Noch keine Bewertung") instead of printing a row of dashes (s190: three "–" cells were the
  strongest MVP signal on the page).
- **Marks carry a soft in-family gradient** (`PART_META.tile`, s190), not a flat 10 % tint: premium
  in this system means a subtle gradient. Same four hues, same receptive/productive pairing.
- The countdown comes from `settings.examDate` and retires itself once the date has passed, so it
  can never sit at "0 Tage" forever.

### The expand rule (founder s189, app-wide)

Stated for Verlauf, meant for every tile that can grow, filters included:

1. **At rest a page does not scroll.** The page sizes itself with `.h-page-stage` (the room under
   the sticky header and above the bottom bar, `main` padding included) and its elastic regions give
   up their preferred size rather than push past one screen.
2. **The learner opens the tile, and only then may the page grow.** The page releases its height cap
   while a tile is expanded.
3. **An expanded tile is never taller than one screen** (`.max-h-panel-stage`), so its own top and
   bottom borders stay visible.
4. **It scrolls inside, and hands the scroll on at the top.** ONE inner region carries
   `min-h-0 flex-1 overflow-y-auto`; nothing in that path sets `overscroll-behavior`, so reaching
   its top chains to the page and brings back whatever sits above.
5. **It scrolls itself into view on expand** (`useStagePanel`), WITH `scroll-mt-*` / `scroll-mb-*`
   for the header and the bottom bar: `scrollIntoView` knows about neither, so without them the
   tile parks its lower border underneath the tab bar.

`FilterRail`'s mobile panel satisfies 3 and 4 with its own `max-h-[45dvh]` cap, and **keeps it**
(founder s189, after `preview/filterrail-height.html` tested four caps on the real rail). The
one-screen ceiling does NOT transfer there: Verlauf can scroll to the top of the screen, but the
filter panel starts 205 px down and has a fixed Üben bar under it, so `max-h-panel-stage` pushed its
bottom border 45 px BELOW the viewport. The lesson for any future adopter: the ceiling has to be the
room left from where the tile actually sits, not a constant screen height.

**Two states hide the bar, and they are NOT the same** (do not merge them):
- **Focus mode** (`useSessionStore.focusMode`, route-gated to `/session`, `/revision`, `/welt`):
  hides EVERYTHING, header and sidebar included; the composed session is a full-screen stage.
- **Exam chrome** (`useSessionStore.examExit`, route-gated to `/anwenden` + `/exam`, founder s186): a running
  Prüfungssimulation hides the bottom bar and swaps the header's streak pill + account menu for
  ONE exit in `--danger` red (founder s187, preview options X1 + X2): a phone gets the bare
  `LogOut` mark on the same 36px box the account button had, and from `sm` up it grows the word
  "Verlassen" in a quiet red outline. No tooltip beside a visible label; the phone keeps the
  `aria-label`/`title`. The header, the
  logo and the desktop sidebar STAY: an exam still needs its top bar, and the founder scoped this
  to the mobile bottom bar. `examExit` holds the runner's own exit handler rather than a boolean,
  because `AppShell` is eager code and must never import `useExamStore` (it reaches the content
  banks through the composer). That exit is the ONLY one: the in-exam RunBar and the Anleitung
  page deliberately carry no abort control, so the learner is never offered two ways out. The
  confirm dialog belongs to the runner (`danger` button, matching Settings' Konto löschen); on the
  result screen the run is already recorded, so the X just closes without a confirm.
  From `lg` up exam chrome ALSO hides the desktop sidebar and the Feedback pill and drops
  `lg:pl-64` (founder s186): the sidebar is the bottom bar's desktop counterpart, the pill parks
  exactly where a Teil puts its Weiter button, and the freed width is what the side-by-side layout
  below spends. With the sidebar gone the header mark is rendered as a plain `Logo`, NOT a link:
  it would be the only clickable thing left on the left, and navigating away would silently end
  the run.
  Exam chrome also switches `main` to the **exam stage**: `h-exam-stage` (`100dvh - 4rem - 1px -
  safe-top`, the 1px being the header's bottom border, which is exactly the overflow leaving it out
  caused) as a flex column. Every part then pins its RunBar, answer strip and action buttons and
  gives ONE region `flex-1 min-h-0 overflow-y-auto`: Lesen/Hören scroll text + question together,
  Schreiben caps the Aufgabe at 34 % with its own scroll and lets the field take the rest
  (`resize-none`, since a dragged textarea re-breaks the viewport), Sprechen scrolls the dialogue,
  and the Anleitung/Ergebnis screens scroll themselves. Measured at 393x852, 375x667 and 360x640:
  all ten in-exam screens rest at **0 px** page overflow.
  **The question is never the elastic one, and it carries no tile** (founder s186 + s187): the
  reading text (Lesen) and the Notizen sheet (Hören) live in the ONE card on screen, shrink and
  scroll; the question line and its answer rows sit straight on the page ground, so the screen is
  never a big card beside a small one. Each block is as tall as its own content and the pair sits
  CENTRED in the stage (preview variant "B"), so a short text leaves air around the card rather
  than inside it. Three rules from the 667px fit are load-bearing, not cosmetic: no
  "Aufgabe N von M" eyebrow (the number strip already says it), "Teil abschließen" appears only on
  the LAST question once everything is answered (a permanent submit row cost every screen ~52 px),
  and the strip is `gap-1` so nine numbers stay on ONE row at 360 px. The number strip moved DOWN
  into the bottom cluster (s187), directly above Zurück/Weiter, with 16 px above it, 12 px to the
  buttons and 16 px below (`pb-safe-4`); the cluster is capped at `lg:max-w-xl` and centred so a
  600px-wide button never spans half a desktop window.
  **The learner can resize** (s187): a separator between the two blocks drags sideways on desktop
  (32-72 %) and up/down on a phone (24-64 %), and the reading card has a grow handle that takes
  room from the air around it. Both are real `role="separator"` controls with arrow-key steps, and
  **every question change resets them** to the default 56/44. Watch the geometry when touching
  this: a percentage `max-height` only resolves against a parent with a DEFINITE height, so the
  wrapper holding the pair is `h-full` and `lg:items-center` does the centring. With an auto-height
  wrapper every `max-h-full` under it silently became a no-op and a tall question pushed the stage
  past one viewport.
  On the smallest phones the reading pane can still fall to ~2 lines for the tallest questions
  (its floor is `min-h-[6.5rem]`, `sm:min-h-[8.25rem]`); it scrolls, both scroll regions fade their
  last line while there is more below, and the expand button reads the text full-screen.
  **From `lg` up the two blocks sit side by side** (reading side 56 % by default, question the
  rest; Schreiben mirrors it with the Aufgabe at `basis-2/5`). Verified by driving the real build:
  225 in-exam screens across 1440x900, 1024x768, 393x852, 375x667 and 360x640, three fresh draws of
  Lesen and Hören each, all at **0 px** page overflow with the question fully visible. The hub is a
  menu, not a Teil, and scrolls
  like every other hub (95-151 px on a 667 px phone, against 237 px for `/anwenden` and 253 px for
  Spielplatz); it is deliberately NOT on the stage.
**Those cards wear the branded route marks, not lucide icons** (founder pick 2, s183): each card
renders `RouteIcon` for its own route on a 48px `rounded-xl` tile tinted in that mark's colour
(cyan / brand blue / orange at 10%, 15% in dark). So the Schreiben card carries the exact pencil
the nav does. `rounded-xl`, never `rounded-2xl`: `--radius + 10` is 24px, which on a 48px tile is a
full circle, and icon tiles are squircles. Routes that are not `navItems` entries take their accent
from `OFF_NAV_COLOR` in `route-icons.tsx` (`/writing` brand blue, `/simulation` cyan, `/exam`
orange), otherwise all three fall back to brand blue and stop telling each other apart.
**`/anwenden` and `/exam` share ONE mark** (`graduationCap`): the tab and the hub card
are the same thing at two depths. The page's `HubHero` still shows the lucide `Target`, which is
the one spot where the zone is not yet a cap.
Remote-config overrides (admin Steuerung H1/H2/H8) may relabel/hide nav items at runtime; defaults
match the above.

## Bottom tab bar (mobile)
- Fixed bar, single icon rail, **63px tall**, icons 29px. 5 slots (s207 order): Bibliothek
  (fixed slot 1) + 2 middle (Prüfung · Fortschritt) + Spielplatz + Einstellungen (both fixed last,
  plain links). The More sheet is retired (`MoreSheet.tsx` deleted); no add/remove — the middle
  sections are always visible and only Prüfung + Fortschritt REORDER via a hidden long-press easter
  egg (600ms, haptic; jiggle + drag; transparent full-screen layer = "tap anywhere to finish";
  navigating also ends it).
  Bibliothek, Spielplatz and Einstellungen never move.
- **Beta suffix:** `NavItem.beta` marks a zone as unfinished; only Spielplatz carries it today.
  The sidebar draws the neutral bordered chip (the Neuland heading's chip); the bar appends a
  lighter bold "Beta" INSIDE the label span, never a bordered chip, because the label slot is a
  fixed 12px line and a chip would grow it and shift the icon rail that slot exists to hold still.
  The bar's label shows on the selected tab only (locked anatomy), so the always-visible mark is
  the sidebar's; `aria-label` says "Spielplatz (Beta)" on both.
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

## Spielplatz dashboard (`/`)
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
