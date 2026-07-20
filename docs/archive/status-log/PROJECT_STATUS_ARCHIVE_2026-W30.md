# Project Status Archive — 2026-W30

Append-only session-handoff history for ISO week 2026-W30 (chunked per the s70 doc-hygiene
rule; index at `docs/archive/PROJECT_STATUS_ARCHIVE.md`). Newest at the top.

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
