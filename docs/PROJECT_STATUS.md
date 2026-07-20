# Project Status

_Last updated: 2026-07-20 (session 138). **Logo v2 rework shipped to `main`** (logos only, founder
directive): the swipe is now **Himmel Soft `#8CDBFB`** (the original Himmelblau read too harsh
against black/white; the `--accent` token is unchanged), every icon centers the mark by its TRUE
bounding box ("Randnah", 5% margin — the app icon no longer floats small with an empty band on
top), dark-ground logos are **two-tone** (ink on the swipe, white off it; only the g splits), and a
new lowercase **wordmark** "genauly" (swipe under "genau") is the primary logo wherever there is
room (`Logo variant="wordmark"`; the mobile header keeps the compact g). Iterated across 8 preview
rounds in a claude.ai artifact. A same-session follow-up then applied Himmel Soft **app-wide as the
`--accent` token** (both themes, `197 93% 77%`; contrast gate green). Product name: **Genauly**
(`genauly.de`)._

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
- **Icons re-centered ("Randnah"):** `build-logo-assets.mjs` now measures the mark's true bbox
  in-browser and centers it at 5% margin (favicons/apple-touch/pwa; maskable keeps the 80% safe
  zone at 10%). This fixes the founder-screenshotted "empty band above the g" app icon. Never
  revert to raw-coordinate centering.
- **Two-tone dark logos:** on dark grounds, artwork on the swipe is ink, off the swipe is white —
  in practice only the g splits (ink bowl, white descender). Light grounds stay all ink.
- **New lowercase wordmark** (`public/genauly-wordmark.png`/`-dark.png`, 548×138): "genauly" in
  the app's own Inter (variable, wght 800, −0.02em, rendered via embedded `@fontsource-variable/
  inter` woff2), swipe under "genau" with the exact v2 band geometry (−0.16em/+0.10em overhangs,
  0.12em/0.10em em-box insets, −2° tilt). Dark wordmark: word white, "enau" solid ink on the
  swipe, ONLY the g dual-tone (clip = swipe ∪ an e..u rect, avoids white slivers on letter
  bottoms).
- **`Logo.tsx` gained `variant="mark" | "wordmark"`**; wordmark placed in Sidebar, AuthDialog,
  Onboarding, HelpChrome, LegalChrome, landing footer, landing header (`sm:`+; phones keep the
  mark), and the dark no-JS shells (`index.html`, `prerender-help.mjs` — the adjacent "Genauly"
  text spans were removed, the image IS the name). Mobile `AppShell` header keeps the compact
  mark (s86 rule). **Gotcha fixed in review:** responsive display utilities must wrap `<Logo>` in
  a container, never be passed into it (they override the internal `dark:` image swap — this
  briefly showed both theme images on the landing).
- **Brand kit + spec:** `build-brand-kit.mjs` swipe const updated + kit regenerated;
  `BRAND_SPEC.md` §3 + CLAUDE.md brand section rewritten. NOTE: the kit's lockups still use the
  outlined capital-G "Genauly" wordmark path (`wordmark-data.mjs`); outlining the new lowercase
  wordmark for the kit is an open follow-up.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · test:unit 219/219 ✓ · build ✓ · bundle 110.5 kB ✓.
  Verified rendered output via `pnpm preview` + headless Chromium (landing light/dark/mobile,
  /hilfe dark). PWA caveat: hard-refresh the live site; the home-screen icon may need re-adding
  to show the new Randnah size.

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

_(Session 136's landing-page-redesign handoff and session 135's game demo-readiness review + P0/P1 batch handoff are now in
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
