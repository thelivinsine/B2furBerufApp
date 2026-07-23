# Project Status

_Last updated: 2026-07-23 (session 149, complete). **Schreiben is a full Bibliothek extension**
(5 founder rounds, PRs #648-#651, all merged): the 4-segment sliding-pill switcher **Fokus · Kurz ·
Lang · Verlauf** IS the page header, the "Aufgabe wählen" rail is a Himmelblau tile with the
Bibliothek scope hierarchy **Branche → Thema → Unterthema** as grouped dropdowns (live counts,
zero-yield greyed, Gesundheit folds into Alltag), the Fokus Grammatik rail shares the same tile
(green dot = detected form), and writing tasks are RANDOM POOLS of tagged task objects: **373
tasks**, every theme ≥8 short + ≥8 long, every sub-theme ≥2+2, **all 15 Branchen** with
sector-specific tasks (untagged = universal). Reset is always-active (clears scopes + draws a
fresh task); directional tab slides + one micro-motion timing family. **Founder design
preferences distilled into CLAUDE.md + DECISIONS.md (s149).** Next content wave: pools toward
15-20 per theme/length (append-only). Founder action open (from s147): redeploy
`check-sentence`/`transform-sentence` + confirm `GEMINI_API_KEY`.
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

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,107
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **all** provenance rows are AI-drafted and `draft`, none human-verified
(human verification was reset to zero on 2026-07-22 at founder request, to restart the review pass;
see `strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. Still open:
- [ ] **Redeploy the Fokus "Satzlabor" functions (s147)** to pick up the diagnostic logging + Anthropic
      retry fix: `check-sentence` + `transform-sentence` (migration 0009 + the initial deploy are already
      done). Also confirm `GEMINI_API_KEY` is set as a Supabase project secret so the fallback is active.
      Steps in `docs/plans/PHASE2_SETUP.md`.
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

**Handoff after session 149 (2026-07-23). Schreiben restyled as a Bibliothek extension, branch
`claude/schreiben-design-refinement-bw8rhh`.** Founder: "make the schreiben section look like it's an
extension of bibliothek". Two preview rounds (`preview/schreiben-bibliothek-extension.html` = variants
A/B, `-r2.html` = variant A + the founder's 7 changes), then implemented on founder go-ahead.
- **Chrome:** `WritingModeSwitcher` is now the full-width LibrarySwitcher-geometry page header with
  FOUR segments (Fokus · Kurz · Lang · Verlauf); the eyebrow/H1 and the separate Verlauf toggle are
  gone (`WritingHub` routes `?mode=verlauf`). Header sits at content-column width over the
  `[minmax(0,1fr)_16rem]` grid (was 18rem).
- **Guided (Kurz/Lang):** Aufgabe card has no icon tile; eyebrow "Aufgabe: <Thema>", one "Ziel n–m
  Wörter" line, a dice button that re-rolls a random task. **`writingPrompts.ts` restructured into
  pools** (`short`/`long` are `string[]`, 5 each × 20 themes = 200 prompts; wave 1 of the founder's
  15-20 target; the pool rides the theme's single `wp_<themeId>` provenance row, mission-style).
  Theme pick draws a random prompt; drafts carry `promptIndex` so OAuth resume restores the exact
  task. `WritingRail` = the "Aufgabe wählen" FilterRail tile (brand header + Target icon, Domain-
  grouped white pills, selected solid primary; the founder asked for "the same categorization as
  Bibliothek": prompts are keyed per THEME, so the rail mirrors the Thema dropdown's domain grouping;
  Branche/Unterthema don't exist on prompts). Mobile: toolbar button + collapsible panel (chips
  removed) + sticky bottom Auswerten bar; desktop actions stay in the editor card.
- **Fokus:** `GrammarRail` restyled to the same tile; detected = white pill + green `bg-success`
  dot, target = solid primary, pre-correction everything idle; no count/reset, footer = "Neuer
  Satz" only. Mobile pairs the Grammatik panel button with Neuer Satz in one row. `WritingHistory`
  shows only the learner's text now (the exact prompt behind an old entry is not recoverable);
  `RelatedPanel` links `/writing?mode=kurz&theme=…` with `wp.short[0]`.
- **Round 3 (same session, 13 founder fixes):** the Thema selection is a Bibliothek-style
  **dropdown** (grouped listbox popover, internal scroll), NOT pills; **gesundheit folds into
  Alltag** in its grouping (founder rule); the "Aufgabe wählen" tile is a light **Himmelblau**
  `bg-accent/20` wash with a header reset icon; the header switcher is capped `lg:max-w-xl` +
  centered (measured pixel-identical to Bibliothek's 816×44 before, but four short labels at full
  width read oversized); the Ziel range shows only on the Aufgabe card; the AI disclaimer is a
  standalone line below the editor/sentence card; the Aufgabe eyebrow is brand-colored; the Fokus
  transform box is a white card with a bold "Hinweis:" label (no i icon) and a centered
  "KI-generierte Umformung" footer; the Grammatik rail got a reset icon and a two-line hint. The
  mobile Aufgabe panel animates via fade/slide because a height collapse would clip the dropdown.
- **Harmonization round (same session, founder-approved P0+P1 list):** the Aufgabe-wählen rail
  now carries the FULL Bibliothek scope hierarchy **Branche → Thema → Unterthema** as grouped
  dropdowns (live counts, zero-yield greyed). `writingPrompts.ts` moved to task objects
  `{ text, sub?, sectors? }`: all tasks tagged, ~86 new sub-theme tasks authored (every sub-theme
  ≥2 short + ≥2 long) plus a 5-Branche starter wave (it/care/construction/transport/hospitality,
  6 each, untagged = universal so a Branche never empties a pool). Bank: **316 tasks**. P1: Fokus
  Grammatik rail Himmelblau like the Aufgabe rail (+ dark-mode alphas for both), Verlauf constrained
  to the content grid + empty-state CTA, unified eyebrow rule (card titles bold primary), 40px
  spinning dice, duplicate Fokus hint removed, Fokus mobile sticky Korrigieren bar.
- **P2 round (same session, founder go + reset-bug report):** the Aufgabe-wählen **reset is now
  always active** and does a full reset (clears every scope AND draws a fresh random task; it used
  to be disabled at the default state, which read as broken). Micro-motion pass: directional tab
  slide (LibraryHub popLayout pattern), 0.12s popover fade, shared 0.18s panel timing. Content:
  every theme now ≥8 short + ≥8 long, and **Branche wave 2 covers all 15 sectors** (4 tasks each
  for the 10 new ones). Bank: **373 tasks**. Remaining content waves: pools toward the founder's
  15-20 per theme/length (append-only authoring).
- **Gates:** typecheck ✓ · lint 0 errors · lint:content ✓ (pool schema validated) · test:unit
  **260/260** · build ✓ · check:bundle **112.3 kB** (writingPrompts stays a lazy chunk) · Playwright
  screenshots of desktop + mobile, both modes (incl. the open dropdown), verified against the
  approved mockups.
- **Open:** grow the pools toward 15-20 prompts per theme/length in content waves (append to the
  arrays in `writingPrompts.ts`, no schema work needed); the s147 founder redeploy action below still
  stands.

**Handoff after session 148 (2026-07-22). Auth bug fix: fresh-device OAuth login threw existing
accounts out to the landing page. Branch `claude/pwa-auth-uninstall-bug-hrafrw`, PR #644 merged.**
The founder reported: after uninstalling the PWA and logging into an admin account with Google, the
app redirects to the landing page right after login and throws them out.
- **Root cause.** Uninstalling the PWA wipes `localStorage`, so on the fresh install the local
  `onboarded` flag defaults to `false`. Google OAuth (`signInWithGoogle`) returns to `/`, where the
  `RequireOnboarding` guard (`router.tsx`) read the **local** `onboarded` flag *synchronously* and
  immediately `<Navigate to="/welcome">` — before `startCloudSync` (async) pulled the account's real
  `onboarded: true` from its Supabase profile. Any existing account on a fresh device got bounced.
  Not admin-specific; admins just hit it because they test on multiple devices. `RequireFounder` was
  never in the redirect path (OAuth returns to `/`, not `/admin`) and reads `user.email` which is
  available immediately, so it needed no change.
- **Fix (3 files, +37 lines).** New `syncHydrated: boolean` on `useAuthStore` (default false).
  `cloudSync.ts` sets it `false` at the start of each `startCloudSync` and in `stopCloudSync`
  (sign-out), and `true` in a `finally` **after** the first pull's profile merge (so the cloud
  `onboarded` is already applied when it flips; also covers the offline-catch path).
  `RequireOnboarding` now: (1) lets already-onboarded devices straight in; (2) renders `null` while
  `status === "loading"` (OAuth handshake in flight); (3) for a signed-in / guest user, renders
  `null` until `syncHydrated`; (4) only a genuinely signed-out visitor (or one whose pull finished
  still-not-onboarded) goes to `/welcome`. Circular import (`cloudSync` ↔ `useAuthStore`) is safe:
  both only touch each other inside function bodies, never at module eval.
- **Gates:** `typecheck` ✓ · `lint` (0 errors; pre-existing warnings only) · `test:unit` **257/257** ·
  `build` ✓ · `check:bundle` **112.3 kB** (main chunk unchanged). Sandbox can't reach the live
  `*.github.io` site, so the founder confirms the reinstall-and-login result after the Pages deploy.

_(Session 147's Schreibtraining-redesign handoff (Fokus Satzlabor + the Schreiben nav item + the first
Bibliothek harmonization, PRs #640/#642/#643/#646), session 146's /sources verification-refresh +
human-review-reset + table-restructure handoff, and
session 145's Admin Control Center chunk 3 handoff (the `/admin` shell + Übersicht cockpit,
`RequireFounder` gate, PR merged) are now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md`. Session 144's Admin Control Center chunks 1 + 2 handoff (backend foundation migration 0008 + the
`apply:reviews` keyless review loop-closer, PRs #631–#633), session 143's Admin Control Center scoping
handoff (the expert-panel report + build plan + 4 mockup screens, PR #626), session 142's Wörter quality-control handoff (the
`RETIRED_VOCAB_IDS`/`browsableVocabulary` retire-from-surface set + the vocab↔collocation overlap
lint gate, PR #624), session 141's
mobile-nav-item-labels handoff (labels under the active icon + the
Theorie→Bibliothek revert, PR #622), session 140's light-theme recolor handoff (neutral grey chrome + the "I1" mint→sky gradient
ground, 2 PRs + a 3-round preview picker), session 139's three-small-fixes handoff (icon-size
preview correction, mission-exit toggle fix, Kollokationen graph tighter clusters), session 138's
logo-v2 rework handoff, session 137's branding-refresh review + premium pass (fixes 1-7 + items 8-10) handoff, session 136's landing-page-redesign handoff and session 135's game demo-readiness review + P0/P1 batch handoff are now in
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
