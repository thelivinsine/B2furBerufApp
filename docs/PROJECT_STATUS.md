# Project Status

_Last updated: 2026-07-20 (session 136). **Landing page fully redesigned ("Der Textmarker"),
shipped to `main`.** The founder picked Preview A from a two-preview round
(`preview/landing-redesign/`, analysis in its README) and iterated four rounds; `LandingPage.tsx`
was rebuilt from scratch: the brand highlighter swipe as the page-wide device (`.landing-*` CSS in
`index.css`), a hero flashcard collage with the real Artikel-Wesen, a scenario marquee, a "Du bist
hier" plateau chart, a bento feature grid, a dedicated **filter → custom Üben session** section,
an honest content-count band, steps ("Your smart companion.", never a replacement-for-courses
claim), the preserved OAuth "What is Genauly?" purpose block, FAQ, and a Nachtblau closing CTA.
Copy is **English-first with German seasoning (~10-20%)**, the whole page switches EN/DE via a nav
LangToggle, and logged-in visitors get **"Go to app" / "Zur App"** CTAs (never "Dashboard").
Earlier the same day the parallel **session 135 shipped the game demo-readiness review + P0/P1
batch** (battle-NPC sprites, cutscene cast, Spielen-tile fix, Nachtblau assets; handoff below).
Product name: **Genauly** (`genauly.de`)._

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

**Content banks (as of 2026-07-18, session 130, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** · collocations **1,033** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **~3,105
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
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

_(Session 134's Theorie (Wörter) card + mobile-filter polish handoff, session 133's brand-kit-modernization handoff (plan + all 4 PRs + the consolidated brand-kit/ + the tile-less logo), session 132's Bibliothek mobile-filter bug-fixes + graph two-area color/layout handoff, session 131's Üben exercise-variety plan + full-build handoff, session 130's data-architecture-review handoff (P0/P1 integrity fixes + the /sources redesign with the admin Daten-Werkbank) and session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
fused-doodle registry + batch 1, and the session/graph/flashcard reuse) is now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 128's gender-visuals research-panel + Artikel-Visuals implementation-plan handoff, session 127's brand-kit-catalogue handoff (Vol. IV–VIII; the founder **finalized** Kit 1 · Nachtblau & Himmelblau + Koralle, locked spec at `docs/branding/BRAND_SPEC.md`, artifacts saved under `preview/branding/artifacts/`, NOT implemented — wire only on request; see the W29 archive), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
session 123's Theorie graph-view P2/P3 batch handoff, session 122's Theorie graph-view quality audit
+ P0/P1 fixes handoff, session 121's
arbeitswelt→beruf domain-merge handoff, session 120's content-coverage-deepening
handoff, session 119's account-dropdown z-index-fix handoff, session 118's Kollokationen-nodal-graph
handoff, session 117's Üben-navigation + Üben-button-copy handoff, session 116's branding-redesign-support
handoff (Cobalt & Butter previews + the AI mockup guide) and session 115's demo-readiness-sweep handoff
are now in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 113's brand-identity-exploration
handoff (the 20-direction catalogue) is also in W29. Session 114's Theorie pill-animation +
dark-mode contrast handoff, session 113's Theorie tab-transition/compass/feedback-pill polish handoff,
session 112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's handoffs, plus the s104
Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
