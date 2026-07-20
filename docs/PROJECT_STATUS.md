# Project Status

_Last updated: 2026-07-20 (session 137). **Brand premium pass shipped to `main`** (review of the
s133 rebrand, fixes 1-7 of a ten-point report): the `accent-gradient` is now token-driven
(`--gradient-from`/`--gradient-to` in `index.css`, deep Nachtblau → primary → vivid sky) so gradient
CTAs end brighter instead of muddier AND stay legible in dark mode (the old fixed end stop dropped
dark-mode text to ~2.5:1; both stops are now gated in `check-contrast.mjs`, 46/46 pass). Landing
hero/nav CTAs and step chip 1 are back on the gradient (flattened in s133/s136), the default Button
variant carries a subtle top sheen, and two shared text classes landed in `index.css`:
**`.text-display`** (extrabold, tracking-tight, balanced wrap; applied to every page H1 via
SectionHeading/HubHero + Lernpfad/Neuland/Grammar lesson/Legal/Help) and **`.text-eyebrow`** (the one
canonical overline recipe). Pre-rebrand indigo/violet remnants purged (Neuland Boss tag, game Chip
tone, QuizHub hero, intent cards, stale comments). Product name: **Genauly** (`genauly.de`)._

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
- **Deliberately NOT done (report items 8-10, founder has the list):** re-deriving ALL HubHero/
  themes.ts rainbow gradients from the brand family, re-hueing the violet (hue 250) dark theme
  toward warm navy, and migrating the landing's hand-rolled pills onto the shared Button.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · test:unit 219/219 ✓ · build ✓ · bundle 110.9 kB ✓ ·
  check:contrast 46/46 ✓. Verified rendered output via `pnpm preview` + headless Chromium
  (landing light/dark, Anwenden hub, Fortschritt). PWA caveat: hard-refresh the live site.

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

_(Session 135's game demo-readiness review + P0/P1 batch handoff is now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md`. Session 134's Theorie (Wörter) card + mobile-filter polish handoff, session 133's brand-kit-modernization handoff (plan + all 4 PRs + the consolidated brand-kit/ + the tile-less logo), session 132's Bibliothek mobile-filter bug-fixes + graph two-area color/layout handoff, session 131's Üben exercise-variety plan + full-build handoff, session 130's data-architecture-review handoff (P0/P1 integrity fixes + the /sources redesign with the admin Daten-Werkbank) and session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
fused-doodle registry + batch 1, and the session/graph/flashcard reuse) is now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 128's gender-visuals research-panel + Artikel-Visuals implementation-plan handoff, session 127's brand-kit-catalogue handoff (Vol. IV–VII; the founder **finalized** Kit 1 · Nachtblau & Himmelblau + Koralle, locked spec at `docs/branding/BRAND_SPEC.md`, artifacts saved under `preview/branding/artifacts/`, NOT implemented — wire only on request; see the W29 archive), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
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
