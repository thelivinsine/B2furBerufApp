# Project Status Archive — 2026-W30

Append-only session-handoff history for ISO week 2026-W30 (chunked per the s70 doc-hygiene
rule; index at `docs/archive/PROJECT_STATUS_ARCHIVE.md`). Newest at the top.

**Handoff after session 140 (2026-07-21). Light-theme recolor (two rounds + a 3-round preview
picker), branch `claude/session-f94z5m`, shipped to `main`.** Founder screenshot of `/library` on
mobile: the warm Papier tint (switcher tracks, tags, page ground) read as "butter yellow". What
shipped:
- **Round 1 (PR #619): neutral grey chrome + flat Himmelblau ground.** `--muted`/`--border`/
  `--input` moved from the warm 42/43-hue tans to neutral 220-hue greys; `--background` to a pale
  Himmelblau. Covers the LibrarySwitcher/ViewSwitcher tracks, `bg-muted` tag pills, the bottom-bar
  active `bg-border` squircle, and every border, app-wide by token.
- **Preview picker (3 rounds, committed to `preview/`):** `background-gradient-variations.html`
  (8 ground options A–H rendered in the real chrome), `…-r2-himmel-mint.html` (the founder liked
  Himmel → Mint; 4 intensity steps), `…-r3-invertiert.html` (the founder picked "Sehr dezent" but
  inverted; 3 mirrored takes). Screenshotted via the preinstalled headless Chromium; founder picked
  **I1** (very subtle mint → sky, 150° diagonal).
- **Round 2 (PR #620): the "I1" gradient ground + lighter greys.** New `--page-from/mid/to` tokens
  (light: mint `144 45% 98%` → `150 50% 98%` → sky `198 83% 98%`; dark: all three = the flat dark
  ground, so dark mode is a NO-OP) + a **`bg-page`** backgroundImage in `tailwind.config.ts` (the
  bg-mesh washes layered over the 150° linear). Applied on the five full-page shells (AppShell ×2,
  Onboarding, LegalChrome, HelpChrome); ExamHub/SimulationHub Cards keep plain `bg-mesh`. Flat
  `--background` became the near-white fallback `180 45% 98%` (sticky bars, inputs); light
  `theme-color` meta = the mint top stop `#F7FCF9`. Mid-round the founder also asked for lighter
  button greys: `--muted` 87% → **`220 10% 90%`**, `--border`/`--input` 83% → **`220 9% 86%`**.
- **Deliberately untouched:** dark theme; the semantic `--warning` Butter tokens; the brand-kit /
  logo scripts' `PAPIER` app-icon tile constant. CLAUDE.md brand section documents the new ground.
- **Gates (both rounds):** `check:contrast` all pairings ✓ · build ✓. PWA caveat: the shell is
  service-worker-cached; hard-refresh the live site to see the new colors.

**Handoff after session 139 (2026-07-20). Three small fixes, branch
`claude/app-icon-favicon-update-gympjq`, all shipped to `main` (PRs #616, #617).** Founder-reported
issues, handled one prompt at a time:
- **Icon-size preview correction (#616):** the founder thought the app icon/favicon still showed the
  old **Randnah** (5% margin) size. The shipped assets were in fact already **Größer** (12% margin)
  since s138 — verified by measuring every committed PNG (mark ≈ 73–75% of the tile = 12% margin;
  Randnah would be ≈ 90%). The confusion came from the saved preview
  `preview/branding/artifacts/genauly-logo-v2-previews.html`, which still highlighted Randnah as
  "empfohlen" and rendered the home-screen mockup row at the 5% margin. Fixed the preview to mark
  Größer as applied and render the OS row at 12%. **No shipped asset changed.** If the live
  tab/home-screen icon still looks old it is PWA/browser cache (hard-refresh; re-add the PWA).
- **Mission-exit toggle fix (#616):** exiting a mission launched from Heute → Spielen stripped the
  `?mission=` param and left the learner on the standalone `/welt` hub, which has no Lernen/Spielen
  toggle. Now `SpielenHub` tags the deep link `&from=heute`, `Welt.tsx` navigates back to
  `/?tab=spielen` on exit when it sees that marker, and `Dashboard.tsx` opens on the Spielen tab for
  `?tab=spielen` (clearing the param on a manual switch). Direct `/welt` visits are unchanged.
- **Kollokationen graph — tighter clusters (#617):** founder asked to pull the nodes closer so the
  theme islands look better; generated a 3-option preview
  (`preview/collocation-graph-tightness.html` + generator `preview/gen-collocation-graph-tightness.mjs`,
  rendering the REAL bank through the shipped d3-force layout) and the founder picked **"Am engsten"**.
  `CollocationGraph.tsx` force block now: centroid pull (forceX/Y) **0.72** (was 0.38), link **0.38**
  (0.22), charge **−34/max200** (−55/240), collision **r+1.5** (r+3), centroid ring **118+N·26**
  (140+N·35). Pure builder unchanged, so `tests/collocationGraph.test.ts` (11) still passes; CLAUDE.md
  layout-recipe note refreshed.
- **Gates (each PR):** typecheck ✓ · build ✓ · check:bundle 110.5 kB ✓ · test:unit 219/219 (#616) /
  collocationGraph 11/11 (#617) ✓. Post-merge branch realigned to `main` both times. PWA caveat: the
  graph + icons are service-worker-cached; hard-refresh the live site.

**Handoff after session 135 (2026-07-20). Game demo-readiness review + P0 batch + P1 cutscene pass
SHIPPED (PRs #601, #602 merged to `main`). Branch `claude/game-review-demo-readiness-8fdpid`.** The
founder asked for a comprehensive review of the current game (Neuland, G1 + G2 Kapitel 1) with
priority actions so the game can be presented in this week's demo, then greenlit the P0 batch and the
P1 cutscene pass in-session. Deliverables:
**`docs/plans/GAME_DEMO_READINESS_REVIEW.md`** (verdict, evidence, prioritized actions, a
3–4-minute game demo script, and the implementation record) plus the shipped fixes below. Key facts:
- **Evidence gathered:** `pnpm typecheck` ✓ · `test:unit` 219/219 ✓ · `lint:content` ✓, plus a
  scripted Playwright playthrough (mobile 390x844, dev build, fresh profile): hub light+dark, mission
  1.1 scenes + battle + bag ask flow (Reisepass hand-over, Wörterbuch), boss 1.6 reachable ungated,
  Heute → Spielen embed. **Zero console errors.**
- **P0.1 SHIPPED — Spielen-tile auto-center fix (`NeulandHub.tsx`):** the compact 3-row mission tile
  opened scrolled to max (hid the next mission + its play button) because the tile was not
  positioned, so the auto-center's `r.offsetTop` was document-relative. The tile is now `relative`
  (it becomes the rows' offsetParent). Verified scripted: fresh profile shows 1.1–1.3 (scrollTop 0),
  mid-chapter centers 1.4.
- **P0.2 SHIPPED — battle opponents have bodies (founder-caught; the review's first pass missed
  it):** `NPC_SPRITES` had only Frau Schmidt, so 4 of 5 dialogue battles ran against an invisible
  opponent. Four new code-authored 26x32 sprites in `welt_assets.py` (Grenzbeamte peaked cap+badge,
  Milo lanyard, Kassiererin apron, Herr Brandt balding+mustache+cardigan; blessed style, locked
  world scale), wired via `stage.tsx` `NPC_SPRITES`, `sprite:` on the 4 battle NPCs in
  `missions.ts`, and the linter's `GAME_SPRITES` mirror (`lint-content.mjs`, it errors on
  unregistered sprites). Shared battle anchor composite-checked on all four backdrops.
- **P1 art SHIPPED — Nachtblau asset regen:** `welt_assets.py` `INDIGO` `(91,91,230)`→`(61,116,237)`
  (`#3D74ED`), all assets regenerated (player backpack, backdrop accents, doc + Wörterbuch icons).
- **P1 SHIPPED — cutscene characters (`scenes.tsx` `CutsceneCast`):** all 19 cutscenes rendered as
  empty rooms (only hotspot placed the player). Now the player stands bottom-left on every
  backdropped cutscene (the `website` prop scene stays character-free) and the speaking NPC stands
  right (current line's speaker if sprited, else the scene's primary sprited NPC, so no flicker).
  Needed a new **Jonas sprite** (the recurring companion, 22 cutscene lines, was spriteless);
  registered like the others. Composite-checked on all 5 cutscene backdrops; verified in-app the
  player renders on the 1.1 arrivals cutscene. Listening/automat/form/loadout keep prop/device focus
  (no person) by design.
- **Still open before the demo:** founder tasks only — seed missions 1.1–1.3 on the exact demo
  device (game progress is LOCAL-ONLY) + dress rehearsal of 1.4 and the boss after the merge is live
  (hard-refresh, PWA autoUpdate).
- **By-design, don't "fix":** missions light-only (hub theme-aware), Kapitel 2+ locked teaser, dark
  surround below short scenes, no game cloud sync until the G2 migration.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · lint:content ✓ · test:unit 219/219 ✓ · build ✓ ·
  bundle 80.7 kB ✓.

**Handoff after session 136 (2026-07-20). Landing-page redesign, previews → full implementation,
branch `claude/landing-page-redesign-iqxlja`, shipped to `main`.** The founder asked for a
conversion-focused landing analysis + "billion-dollar edutech" previews, picked **Preview A "Der
Textmarker"** (warm highlighter editorial; Preview B "Die Nachtstadt" remains unbuilt in
`preview/landing-redesign/` as a future direction), then iterated: logo/wordmark optical alignment,
real page links in the nav, a filter→custom-Üben section, English-first copy, an EN/DE page toggle,
"Go to app" for logged-in visitors, and companion (not replacement) positioning.
- **`src/features/landing/LandingPage.tsx` rebuilt** (full rewrite, token-based so dark mode works):
  sticky nav (anchors + About/Help/Sources + LangToggle + auth-aware CTA) · hero (swiped "plateau."
  headline, flashcard collage with `Wesen` creatures + floating streak/XP pills) · scenario marquee ·
  plateau chart (`PlateauChart`, hand-drawn SVG with "Du bist hier") · bento features (session mock,
  der/die/das cells, FSRS bars, speaking wave, exam badges) · **filter rail mock + "Filter what you
  need. Practice exactly that."** · dark numbers band (honest counts + /sources link) · steps
  ("Your smart companion.") · the OAuth-required "What is Genauly?" purpose card (kept, bilingual) ·
  FAQ `details` · closing CTA · footer. All copy lives inline as `t(en, de)` pairs on a local `lang`
  state (default EN); German is reserved for obvious/brand terms per the founder's 10-20% rule.
- **New `.landing-*` CSS in `src/index.css`:** `landing-swipe` (the highlighter device; swiped text
  stays ink `#1c1a23` in BOTH themes since the swipe ground is always light Himmelblau; a
  `landing-swipe-reward` variant tints with `--reward-bg`) and `landing-marquee` (+ reduced-motion
  opt-out). **The hero collage float is framer-motion, NOT CSS** (the `float()` helper in
  `LandingPage.tsx`): a CSS-keyframe version shipped first but did not run on the founder's iPhone,
  and a CSS `transform` animation also overrides Tailwind translate/rotate on the same element, so
  the float animates an INNER wrapper via framer while the outer element keeps position/rotation.
  The closing card's white CTA carries **no shadow** (rendered as a heavy halo on device); the other
  CTAs keep `shadow-glow` (founder-specified). The published preview artifact is stored at
  `preview/landing-redesign/landing-a-artifact.html`.
- **Rules recorded:** logged-in CTA label is "Go to app"/"Zur App" (never "Dashboard"); no
  replacement-for-traditional-learning claims; hero eyebrow is "German for real life" (B1–B2
  removed at founder request; the footer keeps the full tagline).
- **Previews:** `preview/landing-redesign/` holds both mockups + README (analysis, revision log,
  implementation spec). Preview A includes a working JS EN/DE toggle; it was published as a claude.ai
  artifact for founder review across four feedback rounds.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · build ✓ · test:unit 219/219 ✓ · check:bundle 111 kB
  (landing is eagerly routed; +~30 kB static JSX, well under the 400 kB budget) ✓. Verified rendered
  output via `pnpm preview` + headless Chromium: light/dark, EN/DE, 390/1280, logged-in state.
  **PWA caveat:** the landing is service-worker-cached; hard-refresh the live site before judging.

**Handoff after session 137 (2026-07-20). Branding-refresh review + premium pass (fixes 1-7),
branch `claude/app-branding-refresh-review-bmrly2`, shipped to `main`.** The founder asked for a
review of the s133 rebrand ("doesn't look as premium as before"), first as a report only, then
greenlit fixes 1-7 of the ten-point list. What shipped:
- **Token-driven accent-gradient (fixes 1+2):** `--gradient-from: 226 83% 47%` / `--gradient-to:
  196 93% 38%` (light) and `226 90% 66%` / `198 90% 58%` (dark) in `index.css`;
  `tailwind.config.ts` renders `linear-gradient(135deg, from 0%, primary 45%, to 100%)`. Light mode
  now travels deep Nachtblau → vivid sky (ends brighter/more saturated, the s133 fixed end stop read
  muddy); dark mode stays light end-to-end so the near-black `primary-foreground` text passes (old:
  ~2.5:1, a real AA failure `check:contrast` could not see). Both stops are now gated
  (`primary-foreground` on from=CORE / on to=UI, both themes, 46/46 pass).
- **Gradient restored on the landing (fix 3):** the four `bg-primary` pill CTAs (nav + hero) and
  step chip 1 ride `bg-accent-gradient` again; all pills + the three step chips switched
  `text-white` → `text-primary-foreground` so they stay legible on the light dark-mode gradient.
- **Button default sheen (fix 4):** `bg-gradient-to-b from-white/12 to-transparent` over
  `bg-primary` in `button.tsx` (subtle dimensionality, hover behavior unchanged).
- **`.text-display` + `.text-eyebrow` (fixes 5+6)** in `index.css` `@layer components`; applied to
  SectionHeading + HubHero (all hub/Fortschritt/Settings headers), Lernpfad + Neuland H1s (parity
  kept, comments updated), GrammarTopicView, LegalChrome, HelpChrome, QuizHub, WritingHub, and the
  6 landing eyebrows. Page titles are now extrabold/tracking-tight like the s136 landing.
- **Indigo/violet purge (fix 7):** Neuland Boss tag → `bg-primary/10 text-primary`, game `Chip`
  tone `indigo` renamed `blue` (`bg-blue-50 text-blue-700`), QuizHub hero + intent cards
  `from-violet/indigo/purple-*` → brand families (`from-blue-600 to-sky-500`,
  `from-amber-500 to-orange-600`), Anwenden Prüfung card `to-purple-500` → `to-pink-500`, stale
  "brand indigo" comments reworded.
- **Second wave (items 8-10, greenlit in-session):** themes.ts accents + Sammlung/Anwenden hub
  tiles re-derived from the brand families (no more indigo/violet/purple/fuchsia); the dark theme
  re-hued 250 → **228 warm navy** across all surface/text tokens incl. the no-JS shells + manifest
  (`#131620`/`#e7e8ef`) and the brand-kit tokens/docs (regenerated); `bg-mesh` nudged to 0.10/0.09;
  the landing numbers band's stat values are gradient-clipped (fixed light Himmelblau stops, the one
  sanctioned text-gradient moment). **Hotfix ridealong:** PR #609's squash accidentally shipped an
  unresolved rebase-conflict marker in `LandingPage.tsx` (post-rebase gates were not re-run),
  breaking `main`'s build; resolved here (single-button `primaryCta` keeping main's simplification +
  the gradient classes) and all gates re-run. Item 10's "landing pills onto the shared Button"
  sub-idea was dropped as churn without visual payoff.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · test:unit 219/219 ✓ · build ✓ · bundle 110.9 kB ✓ ·
  check:contrast 46/46 ✓. Verified rendered output via `pnpm preview` + headless Chromium
  (landing light/dark, Anwenden hub, Fortschritt). **Deploy: the wave-1 Pages run failed (the #609
  conflict marker); the wave-2 run (`add6529`, PR #610) completed green, so BOTH waves went live
  together.** PWA caveat: hard-refresh the live site.

**Handoff after session 138 (2026-07-20). Logo v2 rework (logos ONLY, founder-scoped), branch
`claude/logo-blue-contrast-xsfk19`, shipped to `main`.** The founder found the logo's Himmelblau
swipe too harsh against black/white and iterated through 8 artifact preview rounds (v2→v8) to a
finalized design, then said "finalize these logos and Randnah favicon, apply everywhere, logos
only." What shipped:
- **Swipe color: Himmel Soft `#8CDBFB`** on every logo asset. (Initially the `--accent` token was
  deliberately left at Himmelblau `#52C6F9`; a same-session follow-up prompt then applied Himmel
  Soft app-wide: `--accent: 197 93% 77%` in BOTH themes in `index.css`, plus the two fixed
  `#53C7F9` hexes on the landing (numbers-band gradient stop, decorative doodle stroke). The darker
  `--accent-ink` text variant and the CTA `--gradient-*` stops are different blues and stayed.
  `check:contrast` green; brand kit regenerated.)
- **Icons re-centered ("Größer", `TILE_MARGIN = 0.12`):** `build-logo-assets.mjs` now measures the
  mark's true bbox in-browser and centers it at a 12% margin (favicons/apple-touch/pwa; maskable at
  14% since the OS crops it). This fixes the founder-screenshotted "empty band above the g" app icon.
  (Started at 5% "Randnah"; the founder found that too big live and picked Größer in a follow-up.)
  Never revert to raw-coordinate centering.
- **Two-tone dark logos:** on dark grounds, artwork on the swipe is ink, off the swipe is white —
  in practice only the g splits (ink bowl, white descender). Light grounds stay all ink.
- **New lowercase wordmark** (`public/genauly-wordmark.png`/`-dark.png`, 548×138): "genauly" in
  the app's own Inter (variable, wght 800, −0.02em, rendered via embedded `@fontsource-variable/
  inter` woff2), swipe under "genau" with the exact v2 band geometry (−0.16em/+0.10em overhangs,
  0.12em/0.10em em-box insets, −2° tilt). Dark wordmark: word white, "enau" solid ink on the
  swipe, ONLY the g dual-tone (clip = swipe ∪ an e..u rect, avoids white slivers on letter
  bottoms).
- **`Logo.tsx` gained `variant="mark" | "wordmark"`**; wordmark placed in Sidebar, AuthDialog,
  Onboarding, HelpChrome, LegalChrome, landing footer, **landing header at ALL sizes** (the
  founder wants a first-time visitor to see the app NAME, not just the mark; sized `h-7 w-auto
  sm:h-8`), and the dark no-JS shells (`index.html`, `prerender-help.mjs` — the adjacent "Genauly"
  text spans were removed, the image IS the name). Only the mobile in-app `AppShell` header keeps
  the compact mark (s86 rule). **Gotcha fixed in review:** responsive *display* utilities
  (block/hidden) must wrap `<Logo>` in a container, never be passed into it (they override the
  internal `dark:` image swap); *height* utilities are safe to pass in (they apply to both theme
  images), which is why the single responsive `h-7 sm:h-8` on the landing header works.
- **Brand kit + spec:** `build-brand-kit.mjs` reworked to the logo v2 (two-tone dark mark, Größer
  app-icon tile, the lowercase "genauly" wordmark as PNG copied from `public/`, PNG lockups; drops
  the `wordmark-data.mjs` capital-G dependency) and regenerated; `brand-kit/README.md`,
  `BRAND_SPEC.md` §3, and the CLAUDE.md brand section rewritten. The 8-round preview artifact is
  saved at `preview/branding/artifacts/genauly-logo-v2-previews.html`.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · test:unit 219/219 ✓ · build ✓ · bundle 110.5 kB ✓.
  Verified rendered output via `pnpm preview` + headless Chromium (landing light/dark/mobile,
  /hilfe dark) and the regenerated brand-kit contact sheet. PWA caveat: hard-refresh the live site;
  the home-screen icon may need re-adding to show the new size.
