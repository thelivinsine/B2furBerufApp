# Genauly — German for the intermediate (B1–B2) plateau

Genauly helps adult learners break through the intermediate German plateau (B1–B2) and build
practical fluency for the situations that actually matter in real life: the **workplace**, plus
**everyday tasks** like bureaucracy (Behörde), banking, healthcare (Arzt), and housing. It also
supports direct preparation for the **telc Deutsch B2 Beruf** and **Goethe-Zertifikat B2** exams.
React + TypeScript + Vite SPA, deployed to GitHub Pages.

**Scope note (do not narrow this again):** the product was repositioned in session 21 (2026-06-12)
from "B2 Beruf speaking-exam prep" to the broader B1–B2 plateau framing above. The live landing page,
`/about`, the PWA manifest, and `docs/BUSINESS_PLAN.md` already reflect it. Exam prep is **one
pillar**, not the whole product; daily-life domains beyond the workplace are core, not optional.

## Stack
- **Vite 6** + **React 18** + **TypeScript 5.7** (strict, project references via `tsc -b`)
- **Tailwind 3** (config in `tailwind.config.ts`), **Radix UI** primitives, **framer-motion**, **lucide-react**, **recharts**
- **zustand** for state, **react-router-dom 6** for routing
- No test framework configured yet.

## Commands
**Package manager is `pnpm`** (pinned via the `packageManager` field; lockfile is `pnpm-lock.yaml`).
Do NOT use `npm`/`yarn` — there is no `package-lock.json`. Run `pnpm install` after pulling.
- `pnpm dev` — local dev server
- `pnpm build` — `tsc -b && vite build` (run this to verify before pushing)
- `pnpm typecheck` — `tsc -b --noEmit`
- `pnpm preview` — preview the production build
- `pnpm audit` — check for dependency vulnerabilities (CI/security gate)
- `pnpm lint:content` — validate the `src/data/*` content banks (CI gate, see below)

Notes: `.npmrc` sets `minimum-release-age` (24h supply-chain cooldown) and
`package-manager-strict`. pnpm blocks dependency build scripts by default (a supply-chain
protection); the build does NOT need any allowlisted scripts — keep it that way.

## Layout (`src/`)
- `data/` — content: `vocabulary.ts`, `redemittel.ts`, `dialogues.ts`, `examSets.ts`, `grammar.ts`, `themes.ts`
- `engine/` — logic: `dialogue.ts`, `scoring.ts`, `speech.ts`, `srs.ts` (spaced repetition)
- `store/` — zustand stores: `useProgressStore`, `useSessionStore`, `useSettingsStore`
- `lib/` — `hooks.ts`, `icons.ts`, `useTheme.ts`, `utils.ts`
- `types/index.ts` — shared types
- `router.tsx`, `App.tsx`, `main.tsx`

## Writing style (applies to ALL user-facing copy)
- **Avoid em dashes (`—`).** The founder dislikes them; they are an overused "AI" tell. Use them
  only when genuinely essential (and that is rare). For everything else, **rewrite or paraphrase**
  the sentence: split it into two with a period, or use a comma, colon, parentheses, or "so"/"and".
  Examples: "Build natural word order — a B2 marker." → "Build natural word order, a B2 marker.";
  "Noch keine Daten — reiche Text ein." → "Noch keine Daten. Reiche Text ein." This applies to
  every visible string: UI labels, onboarding/landing copy, content data (`src/data/*`), grammar
  explanations/glosses, toasts, and meta/manifest text. (The en dash `–` and bullet `·` are fine.)
- This rule is for all AI tools building this app. Prefer plain, natural punctuation over dashes.

## Content conventions
- **Themes**: ten **workplace** topics (meetings, scheduling, logistics, customer, conflict, project, technology, sustainability, safety, travel) plus the **first daily-life pack `behoerde`** (Behörden & Ämter, added 2026-06-20). The product scope is broader than the workplace (see the scope note at the top): the roadmap adds more **daily-life domains** like banking, healthcare/Arzt, and housing, not yet built. When adding a life-domain theme, extend the `ThemeId` union in `src/types/index.ts` **and** the `THEME_IDS` array in `scripts/lint-content.mjs` (kept in sync), register the lucide icon in `src/lib/icons.ts`, match the `ExamTheme` schema in `src/data/themes.ts` (including `domain` + `context`, and optionally `subThemes`; see the Taxonomy layer bullet below), add a writing prompt (one per theme is required), keep ids unique, and add matching vocab/collocations/dialogues + provenance rows. The `behoerde` pack is the reference template.
- **Taxonomy layer (faceted model, added s42; see `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`).** Above the 11 flat themes sits a shallow Domain → Theme → Sub-theme hierarchy plus orthogonal facets. **Domains** (`src/data/domains.ts`; 6: `beruf`, `arbeitswelt`, `alltag`, `gesundheit`, `bildung`, `pruefung`) group the themes, and each theme carries `domain` + `context` (`work`|`personal`|`both`). **Sub-themes** live on `ExamTheme.subThemes` (slug id like `behoerde.antrag`, bilingual title, optional `situationsIndex`); only `behoerde`, `customer` and `meetings` are split so far (3 of 11). **Facets** are optional content fields: `cefr` (`ContentCefr`: A2/B1.1/B1.2/B2.1/B2.2/C1) and `subThemeId` on vocab + collocations, plus `sector` (`care`/`office`) + `workSituation` (real tags as of s43: care/Pflege + office vocab) and forward-declared `frequency` (vocab + collocations) and `counterpart`/`taskType` (redemittel; `counterpart` still 0-tagged on purpose, redemittel are general-purpose). Every facet is **optional and rolls up**: untagged items still appear under the parent theme, so partial tagging never breaks the app. **`mode`** (`LearningMode` in `useSettingsStore`, default `both`) is a top-level lens chosen at onboarding and switchable via the header `ModeSwitcher`. It is persisted (rides cloudSync) and now has a **real content effect** (Phase 3, s43): it filters the dashboard intent cards and gates the Work-mode facets (`sector` "Branche" + `workSituation` "Situation") in the Vokabeltrainer. Broader mode/level re-weighting of the review queue is Phase 4. **Closed-enum rule:** when you add a union to `src/types/index.ts`, mirror it with a JS array + a validate-when-present check in `scripts/lint-content.mjs`. The linter already validates `DOMAIN_IDS`, `CONTEXT_TAGS`, `CEFR_LEVELS`, `FREQUENCIES`, `WORK_SECTORS`, `COUNTERPARTS`, `WORK_SITUATIONS`, `TASK_TYPES`, and cross-checks that every `subThemeId` is declared on its theme. Helpers: `filterVocab({theme, sub, cefr})`, `vocabBySubTheme`, `collocationsBySubTheme`. UI: a **shared faceted filter** (`src/features/shared/FacetSheet.tsx`, s43): a "Filter" chip opens a slide-up sheet (built on `dialog.tsx`, overridden to a bottom sheet) with multi-select option pills showing live counts and greyed zero-yield values (AND-across / OR-within; exports `matchesFacets`/`applyFacets`/`activeFacetCount`/`ActiveFilterChip`). Wired into the **Vokabeltrainer** (CEFR + Wortart, plus the Work-only `sector`/`workSituation` facets when `mode==="work"`; `?cefr=`/`?pos=`/`?sector=`/`?workSituation=`), the **Kollokationen** browser (CEFR + Register) and the **Redemittel** browse view (Register). The Vokabeltrainer also keeps the theme `Select` + `SubThemePicker` drill-down (`?sub=`); the quiz shows CEFR labels (B1 / B2.1 / B2.2·C1) derived from its internal `Difficulty 1|2|3`.
- **Vocabulary** (`src/data/vocabulary.ts`): each entry has `id`, article (nouns), plural (countable nouns), pronunciation hint, two example sentences, and related terms. Currently **528 words** (~49 per workplace theme, a ~25-word `behoerde` starter pack, plus a **13-word care/Pflege pack** added s43 and spread across existing themes so the `sector` facet cuts across topics; verified by `pnpm lint:content`), all tagged with a `cefr` facet (AI-drafted, human-verify pending), for the three split themes a `subThemeId`, and for the Pflege pack + a curated set of office words a `sector` (`care`/`office`, the first real `sector` tags). When adding words: match the existing schema, keep ids unique, source from standard Goethe-Zertifikat B2 Beruf / telc Deutsch B2+ Beruf word fields, and verify with `pnpm build` + `pnpm lint:content`.
- **Collocations** (`src/data/collocations.ts`): currently **396 Nomen-Verb pairs** (~36 per theme; tripled in s40). Schema: `id`, `noun`, `verb`, `full`, `en`, `register` (`neutral`|`formal`|`diplomatic`, unified with Redemittel in s43), `themeId`, `example {de, en}`, plus the optional facets `cefr` (all tagged) and `subThemeId` (the three split themes). Keep ids unique (`c_` prefix + snake_case).
- **Grammar** (`src/data/grammar.ts`): currently **10 topics / 47 drills**. Schema: `GrammarTopic` with `id`, `group`, `title`, `titleDe`, `purpose`, `explanation`, `pattern`, `examples`, `pitfalls`, `drills[]`. Drills have `id`, `prompt`, `answer`, `options?` (MCQ) or no options (word-order), `explain`, `gloss`.
- **Content linter (`pnpm lint:content`, gate added 2026-06-14, provenance checks added 2026-06-15):**
  `scripts/lint-content.mjs` loads every `src/data/*` bank through Vite's `ssrLoadModule` (no extra
  dependency) and checks for duplicate ids, broken dialogue branches (bad `next` targets, orphan/
  dead-end nodes, `start` integrity), missing/empty required fields, dangling cross-references
  (`themeId`, `scenarioId`, Redemittel/grammar/weakness categories), **taxonomy integrity** (domain
  registry completeness, theme `domain`/`context`, every closed-enum facet validated when present, and
  every `subThemeId` declared on its parent theme), em dashes in copy, and
  **provenance register integrity** (every content_id must have a register row; every row's license must
  be on the commercial-safe allowlist; authored/adapted items without a `reference` URL generate a
  warning). It runs in CI on every PR and on pushes to `main` (`.github/workflows/validate.yml`),
  failing the build on any error. **Run it after any content edit**, not just `pnpm build`
  (TypeScript does not catch duplicate ids, which silently drop React-keyed cards). Plural is
  intentionally NOT required on nouns (uncountable/plural-only).
- **Provenance register (`src/data/provenance.ts`, added 2026-06-15):** one `ProvenanceEntry` row per
  content_id, tracking `origin` (authored/sourced/adapted), `reference` (Wiktionary/DWDS/Tatoeba URL),
  `license` (SPDX from the allowlist), `review_status` (draft/verified), and who added/verified it.
  All 769 existing items have stub rows (`review_status: "draft"`). The back-fill queue (items with empty
  `reference`) shows as linter warnings. **When adding new content:** add a corresponding row in
  `provenance.ts` at the same time — the linter errors if a content_id has no row. Use
  `pnpm generate:provenance` only to bootstrap a fresh register (it overwrites); add new rows manually
  for incremental additions. The `ProvenanceEntry` type lives in `src/types/index.ts`. See
  `docs/DATA_GOVERNANCE.md` for the full policy (traceability over ownership; Wiktionary/DWDS for word
  facts; Tatoeba CC-BY for example sentences).

## Mobile bottom tab bar (locked 2026-06-16; context strip removed s26)

The founder iterated extensively on the mobile nav bar through sessions 15 and 24. The design
below is locked. **Do not change structure, edit-mode behavior, or icon rules without an explicit
founder request.**

### Layout
- Fixed bottom bar with a single **icon rail** (63px tall; icons render at 29px, matching the More
  sheet). The old **context strip** (the label row above the icons that showed the section name +
  subtitle) was **removed in s26**: each section already renders its own title at the top of the
  page, so it was redundant. The `desc` field on `NavItem` stays for reuse (landing/marketing copy)
  but is no longer shown in the bar. The More sheet's overlay `bottom` (`3.9375rem`), its bottom
  padding (`5.75rem`), and the `.pb-nav` utility are all sized for the single-rail bar; keep them in
  sync if the rail height changes.
- **Mehr selection (s26):** the Mehr tab shows its selected state (indigo pill + underline) while
  the More sheet is open, and the pinned tabs drop their highlight so the selection clearly sits on
  Mehr. `BottomTabBar` takes a `moreOpen` prop from `AppShell` for this.
- **5 slots total:** Home (fixed, always slot 1) + up to 3 moveable icons + Mehr (fixed, always
  last). This gives max 4 content icons + Mehr.
- Minimum 2 icons in the bar (Home + at least one other); the X button hides when at the minimum.
- Icons not pinned to the bar live in the **More sheet** (grid of 3 columns with names below each icon).

### Icon color rule (updated 2026-06-17, s27)
- Icons are **always colored** (never grey/monochrome) and now render at **full opacity everywhere**
  (founder request s27: the old 38% inactive dimming read as blurred). The active tab is marked by
  its grey-gradient backdrop + underline (bar), highlight (More sheet), or row styling (sidebar), not
  by opacity. `RouteIcon`/`MoreIcon` still accept an `active` prop for call-site compatibility but it
  no longer changes opacity. Do not reintroduce inactive dimming.
- **Two-tone + neon marks (s27):** every route's mark is **two-tone**, its section base colour plus a
  brighter **neon** second tone (e.g. home indigo + neon-cyan body, Wortschatz indigo `#5b5be6` +
  cyan `#10b7cf`, Kollokationen amber + neon-yellow ring, Fortschritt sky → neon-cyan bars,
  Einstellungen slate gear + neon-blue centre). The base layer reads from the route accent (`c` in
  `route-icons.tsx`); the neon second tone is hard-coded per mark in the renderer. The proposal/
  reference sheet is `preview/route-icons-two-tone-neon.svg`. Do not flatten these back to a single
  accent with opacity layers.
- **Box backdrops are grey, not section-tinted (s27; flat fill since s29):** the rounded pill/tile
  behind an icon uses a neutral **flat light grey** (`bg-border`, adapts to dark mode), NOT the
  section colour at low opacity. This applies to the bar's active pill, the Mehr pill, the selected
  More-sheet tile, and the sidebar's active row. The old per-section `bg` tint field in
  `nav-items.ts` is no longer used for backdrops (kept in the data for possible reuse). Do not
  reintroduce colour-tinted icon boxes.
- **Flat fill, no gradient (updated 2026-06-18, s29):** the founder liked the grey selection circle
  but not the gradient, so the backdrop is now a single flat `bg-border` shade everywhere (was
  `bg-gradient-to-b from-muted to-border`). Do not reintroduce a gradient on these backdrops.
- **Compact-squircle backdrop (updated 2026-06-17, s28):** the backdrop is a **compact rounded
  squircle that hugs the icon** (`h-11 w-11 rounded-2xl` in the bar, `h-12 w-12 rounded-2xl` in the
  More sheet), NOT a pill that fills the whole tab slot or a full-width `h-16` tile. No inner
  highlight + drop-shadow recipe, which made the box read as a raised/protruding dome. Keep it flush.
- **More-sheet cloud only on the selected tile (s28):** in the normal (browse) sheet the grey
  squircle cloud appears **only behind the currently-selected section**; every other tile shows a
  bare icon (no backdrop, no ring). In **edit mode** all tiles keep the squircle cloud as the
  draggable-tile affordance (they jiggle and host the green + badge). Reference mockups:
  `preview/nav-cloud-refined.html` (size) and `preview/nav-cloud-gradients.html` (gradient studies,
  founder chose "G1 flat & even"). Do not put a cloud behind unselected browse tiles again.
- **Every route has ONE custom branded SVG mark and ONE unique accent base colour**, both defined
  once in `src/components/layout/route-icons.tsx` (`RouteIcon`) + `nav-items.ts` (`color`). The same
  mark and colours render on every surface: bottom tab bar, More sheet, and desktop `Sidebar`.
  (This replaced the old split where only four "hero" routes had custom SVGs and the rest used
  lucide.) `nav-items.ts` still carries a lucide `icon` per route purely as a `RouteIcon` fallback.
- Marks are normalised to a common **optical size** (`NORM` map + `normTransform` in
  `route-icons.tsx`): each mark's bounding box is scaled to a centred 16-unit target with a
  per-mark weight, so a filled disc doesn't read larger than an airy glyph. Re-tune via that map.
- Dashboard = a house glyph; the **Mehr** menu = the 2×2 grid (the apps/more glyph), `MoreIcon`.
  Both keep the brand indigo `#5b5be6`. Reference sheet: `preview/route-icons-preview.svg`.

### Edit mode (iOS home-screen style)
- Triggered by **long-pressing anywhere** on the tab bar OR anywhere on the More sheet (600ms, with
  haptic vibrate). Both surfaces open edit mode simultaneously.
- In edit mode: icons **jiggle** (framer-motion `rotate` keyframes, infinite) and show a badge (red
  X in the bar, green + in the sheet). Dragging icons left/right reorders them in the bar. Tapping X
  removes a bar icon. There is **no instruction sentence** in the sheet (removed s26).
- **Both the bar AND the More sheet are reorderable (s26).** Bar icons reorder via framer
  `Reorder.Group` (horizontal). Sheet icons reorder via a **custom 2D grid drag-sort** in
  `MoreSheet.tsx`: each tile is a `motion.div` with `layout` + `drag`; `reorderDuringDrag` finds the
  tile the pointer is over (by `getBoundingClientRect`) and splices the dragged path into that slot,
  and `layout` animates the rest. The sheet order persists in `useSettingsStore.moreOrder` (a full
  ordering of every route path; empty = `nav-items` order). `setMoreOrder` keeps pinned routes in
  their slots and only rearranges the non-pinned ones.
- **Add/remove movement animation (s26):** bar and sheet items use `layout` + `AnimatePresence` so
  adding/removing an icon slides the others into their new positions instead of snapping.
- **Enter/exit is opacity-only, never `scale` (s26, locked):** animating a transform (scale) on a
  `layout`/`Reorder` element fights framer-motion's layout projection. That froze the infinite
  jiggle until the next re-render (icons only jiggled after an add/remove) and shifted icon
  positions on long-press. Keep tile enter/exit on `opacity` so positions stay put and the jiggle
  starts immediately. Do not reintroduce a scale pop on these elements.
- **No "Fertig" / "Done" button.** Edit mode ends automatically when the user taps anywhere outside
  the sheet (auto-save). The sheet also has a grab handle; tapping the dimmed overlay above closes it.
- Home and Mehr are **fixed** and not draggable or removeable.

### Opening / closing the More sheet (s26)
- The **Mehr** tab toggles the sheet: tapping it opens the sheet, or closes it (and exits edit mode)
  if already open. `AppShell.toggleMore` drives this; `BottomTabBar` gets `onMore={toggleMore}`.
- **Navigating to any route closes the sheet.** Because the bar sits below the sheet overlay
  (`modal={false}`), tapping a bar tab (e.g. Home) navigates without Radix closing the sheet, so
  `AppShell` closes `moreOpen` + `editMode` on every `location.pathname` change.

### Adding icons to the bar
While the More sheet is open in edit mode, **tap the green + badge** on a sheet icon to add it to the
bar. (The earlier "drag the icon downward ~72px to add" gesture was removed in s26 because free
drag now reorders the sheet grid; the + badge is the single, unambiguous add affordance.)

### iOS-specific fixes (do not revert)
- **No native link popup on long-press:** `.no-callout` CSS class (in `src/index.css`) with
  `-webkit-touch-callout: none !important` applied to the container AND its `*` children. Inline
  style does NOT cascade to NavLink's `<a>` tags — only the CSS class selector does.
- **`modal={false}`** on `DialogPrimitive.Root` in `MoreSheet.tsx`: Radix Dialog defaults to modal,
  which sets `pointer-events: none` on all elements outside the sheet. This makes the tab bar inert
  while the sheet is open. `modal={false}` prevents this.
- **`transform: translateZ(0)` + `willChange: transform`** on the `<nav>` in `BottomTabBar.tsx`:
  forces a GPU compositing layer, preventing iOS Safari from collapsing the bar under a
  `backdrop-filter` sibling and making it invisible.

### Store architecture
- Pinned tabs stored in `useSettingsStore` as `pinnedTabs: string[]` (array of route paths).
- More-sheet order stored in `useSettingsStore` as `moreOrder: string[]` (full ordering of every
  route path; empty array = fall back to `nav-items` order). Rides into `profiles.settings` jsonb
  via cloudSync like the other settings.
- `DEFAULT_PINNED_TABS = ["/", "/vocabulary", "/quiz", "/analytics"]` in `nav-items.ts`.
- `BottomTabBar` reads the store **directly** (no local buffer state). Any external write
  (e.g. MoreSheet adding a tab) is reflected immediately. Never add a `localOrder` cache or
  `useEffect` sync layer — that was the root cause of the "icon added but didn't appear" bug.
- `Reorder.Group` uses `flexGrow: moveablePaths.length` so all icon slots stay the same width
  when the icon count changes in edit mode.
- X-button `onClick` is guarded with `onPointerDownCapture` + `onPointerDown` stopPropagation so
  framer-motion's drag gesture doesn't consume the pointer before the click fires.

## UI conventions — modal / popup overlays (locked 2026-06-07)
The founder reviewed the sign-in dialog's backdrop and **locked this as the standard look for
all popups/modals/dialogs** going forward (don't reintroduce flat `bg-black/*` or heavy
`backdrop-blur` on new overlays):
- **Backdrop**: `bg-dialog-overlay` (defined in `tailwind.config.ts` → `backgroundImage`), a
  brand-tinted radial spotlight using the cool-slate `--shadow` token — lighter directly behind
  the card (`hsl(var(--shadow)/0.30)`), deepening toward the screen edges (`hsl(var(--shadow)/0.62)`).
  Adapts to dark mode automatically via the token. **No `backdrop-blur`.**
- **Card shadow**: `shadow-elevated-soft` (in `tailwind.config.ts` → `boxShadow`), a ~50%-strength
  version of `shadow-elevated` so the halo around the card stays gentle and doesn't bleed far
  past the border.
- Both are already wired into the shared `DialogContent`/`DialogPrimitive.Overlay` in
  `src/components/ui/dialog.tsx`, so any new dialog built on that primitive inherits this for
  free. Reuse those tokens (don't hand-roll a new overlay style) for sheets, drawers, and other
  popups too, adjusting only the radial center/stops if a different focal point is needed.

## Brand logo (locked 2026-06-08)
- The **default logo is the rounded gradient "G" with transparent corners.** The canonical asset
  is **`public/genauly-default-logo-transparent-corners.png`**; every in-app logo `<img>` points
  at it (sign-in dialog, mobile header `AppShell`, desktop `Sidebar`, landing, onboarding,
  `/privacy`). When adding a new logo spot, reuse this file (keep the CSS `rounded-lg`/`rounded-xl`
  + `shadow-glow` styling).
- **Browser-tab favicon (updated 2026-06-14, s22):** `public/favicon-32.png` + `public/favicon-16.png`,
  generated from the canonical logo with **rounded transparent corners** (transparency looks right in a
  browser tab). `index.html` links these PNGs. They replaced the old `public/favicon.svg`, which drew a
  plain system-font "G" rather than the real mark (`favicon.svg` may still exist in the repo but is no
  longer referenced; don't reintroduce it as the favicon).
- **Home-screen / PWA icons are intentionally FULL-BLEED OPAQUE (updated 2026-06-14, s22):**
  `public/apple-touch-icon.png` and `public/pwa-192x192.png` / `pwa-512x512.png` are full-bleed with
  **no transparent corners** (corner alpha 255). iOS fills transparent areas with black when it applies
  its own rounding mask, so transparent corners showed up as dark corners on the home screen. The
  maskable `pwa-maskable-512x512.png` keeps the logo within the inner 80% safe zone on a full-bleed
  background. **Do not "fix" these back to transparent corners.** This full-bleed treatment is correct
  and required for OS-masked icons, and is the one exception to the rounded-transparent rule below.
- **The in-app `<img>` logo is NEVER full-bleed.** Every in-app logo spot uses the rounded
  transparent-corner asset. A full-bleed square variant also exists **only** for Google's OAuth consent
  screen (its circular crop reveals white through transparent corners); that one is not in the repo.
  Full-bleed-everywhere across the in-app UI was shipped then reverted (PRs #120/#121); keep in-app
  logos on the rounded transparent mark. (This is distinct from the OS home-screen icons above, which
  are correctly full-bleed.)

## Legal pages & consent (GDPR)
- `/privacy` and `/terms` are bilingual (DE/EN) via the shared `LegalChrome` + `Section` in
  `src/features/legal/`. **German is the legally binding version** (English is a convenience
  translation, stated on each page). Every legal-copy edit MUST be mirrored in BOTH the `*De` and
  `*En` bodies, and follow the no-em-dash writing rule.
- **`/impressum` is built but TEMPORARILY HIDDEN** (`src/features/legal/Impressum.tsx` exists, but
  the route in `router.tsx` is commented out and all links, footer/Settings/privacy/terms, are
  removed) because the founder hasn't filled the real name/address yet and prefers not to. Re-enable
  once a business/service address is ready: uncomment the import + route, and restore the footer +
  Settings + privacy/terms Impressum links. A commercial public launch legally needs this live.
- Sign-up (`AuthDialog`) and the final onboarding step require an "I agree to AGB + Datenschutz"
  checkbox; consent is recorded via `recordConsent()` (`src/lib/consent.ts`) into the settings
  store, which rides into `profiles.settings` jsonb through `cloudSync`. **Keep `CONSENT_VERSION`
  in `src/lib/consent.ts` in lockstep with the `LAST_UPDATED` date on the legal pages**: when you
  materially change Terms/Privacy, bump both so a future re-consent prompt can detect the change.
- GDPR self-service lives in Settings: data export (`src/lib/dataExport.ts`), account deletion
  (`delete-account` Edge Function + `useAuthStore.deleteAccount`), per-submission delete
  (`WritingHistory` + `writing_delete_own` RLS policy, migration 0003). See `docs/PHASE2_SETUP.md`
  for the founder's one-time Supabase steps (deploy the function, run the migration, fill the
  Impressum + data-location placeholders).
- **No cookie-consent banner**: storage is functional-only (auth session + `b2beruf.*` settings/
  progress + PWA cache), which is consent-exempt under GDPR/§25(2) TTDSG. Only revisit if
  analytics/marketing storage is ever added.

## Deployment (GitHub Pages)
- **`main` is production.** Pushing/merging to `main` triggers `.github/workflows/pages.yml` (official Actions Pages deploy → builds `dist/` and publishes). This is the **only** deploy path — `pages.yml` is the sole workflow in `.github/workflows/`. (The old `deploy.yml`/`gh-pages` fallback no longer exists.)
- **Feature-branch pushes do NOT update the live site.** Work only goes live once merged to `main`. If the founder says "I don't see the change," the most likely cause is unmerged work on the active automation branch (currently `claude/vibrant-meitner-mfl9xk`).
- The remote sandbox cannot reach the live `*.github.io` site — verifying the deploy (Actions tab green + live site) is left to the user.

## Workflow notes
- Development branch for this work: **`claude/vibrant-meitner-mfl9xk`** (active as of session 24).
  The branch name is reassigned per session — **`main` is always the source of truth**; whatever
  branch a session is assigned, ship to production by opening a PR into `main` and merging (squash).
- **Auto-ship preference (founder approved 2026-06-01):** the founder wants changes live, not parked on the branch. When a change is complete and `pnpm build` is green, **open a PR into `main` and squash-merge it yourself** (no need to ask each time) so it deploys. Use the GitHub MCP tools. The founder remains the one who confirms the live result.
- **Documentation (REQUIRED after every significant task or series of tasks):** after shipping a feature, a content expansion, or a batch of UX fixes, update `docs/PROJECT_STATUS.md` — the session log, content counts, and "Resume here" section. Commit and push the doc update on the dev branch, then merge it to `main` like any other change. This keeps the status doc accurate for future sessions. **"Update the documentation" (or "document this session", or any similar request) means BOTH `docs/PROJECT_STATUS.md` AND `docs/SESSION_PROMPT_LOG.md` (and any plan/CLAUDE.md docs the work made stale), not just the status doc.** The founder will not always name the prompt log explicitly; treat it as implied. Also refresh stale facts in this `CLAUDE.md` (e.g. content counts, conventions) when the work changed them.
- **Prompt & session log (REQUIRED for every founder prompt, added 2026-06-16):** append one entry per founder prompt to `docs/SESSION_PROMPT_LOG.md` (append-only, newest at the bottom) capturing the verbatim prompt, timestamp, branch, any attachments, a response summary, and the artifacts (files · commit SHAs · PR #s). This is the **authorship paper trail** for a possible copyright filing. Keep the detail there, not in this file. Do NOT paste secrets, and do NOT write the assistant's internal model identifier into the log (it is a committed artifact). Git history + merged PRs remain the primary record; the log is the human-readable supplement. See the `SESSION_PROMPT_LOG.md` header for the full policy and entry template. (The old `UserPromptSubmit` auto-logging hook was removed at the founder's request on 2026-06-25; prompt-log entries are now made manually.) **Any "update the documentation"-type request implies appending the session's prompts here too** (founder direction, s42): don't wait to be told the prompt log by name. When you log, cover every founder prompt of the session, newest at the bottom, and ship it with the other doc updates.

### Post-deploy GitHub housekeeping (REQUIRED after every squash-merge)
Squash-merging rewrites history: `main` gets one new commit while the long-lived dev branch still holds the original unsquashed commits, so they diverge and the **next** PR conflicts (this bit us on PR #23). Run this realignment **every time** right after a merge:
1. `git fetch origin main`
2. `git reset --hard origin/main` — make the dev branch identical to production.
3. `git push --force-with-lease origin <current-branch>` — `--force-with-lease` (never plain `--force`); safe because this is the sole dedicated automation branch with no other contributors.
4. Confirm `git status` shows the branch level with `origin/main` and the working tree clean.

Also: don't pre-write the next PR's `_Last updated`/log entry against a stale branch — realign first, then make new edits. The founder still verifies the live result; the sandbox can't reach the `*.github.io` site or the Actions tab.

## Roadmap & status (read these when resuming)
- **`docs/PROJECT_STATUS.md`** — current status, all locked decisions, research findings, and the
  "resume here" pointer. Start here.
- **`docs/EXPANSION_PLAN.md`** — approved phased plan (Phase 1: grammar/collocations/leveled
  quizzes, client-side; Phase 2: Supabase auth + cloud sync + AI writing coach). Next work = Phase 1.
- **`docs/IMPLEMENTATION_PLAN.md`** — original from-scratch build plan (historical reference).
- **`docs/SESSION_PROMPT_LOG.md`** — append-only paper trail of every founder prompt + response
  (authorship record for a possible copyright filing). Append an entry for each prompt; see the
  "Prompt & session log" rule under "Workflow notes".
- Founder is **non-technical**; act as a decisive CTO who minimizes their ops burden and caps costs.
