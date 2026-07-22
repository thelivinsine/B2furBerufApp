# Project Status

_Last updated: 2026-07-22 (session 148). **Auth bug fix: fresh-device OAuth login no longer bounces
existing accounts to the landing page (PR #644, merged).** Uninstalling the PWA wipes `localStorage`,
so on the fresh install the local `onboarded` flag defaults to `false`. After a Google login the app
returned to `/`, where the `RequireOnboarding` route guard read that local flag synchronously and
redirected to `/welcome` **before** cloud sync pulled the account's real `onboarded: true` from its
profile. Fix: a `syncHydrated` flag on `useAuthStore` (set when the first cloud-sync pull completes or
fails offline, reset on sign-out / at each sync start); `RequireOnboarding` now waits for auth
resolution + that first pull before redirecting a signed-in / guest user, so the cloud `onboarded`
flag is applied first. Prior: Schreibtraining Fokus "Satzlabor" (s147, backlog #6, PR #640). **Founder
action still open:** deploy the Fokus backend (migration 0009 + `check-sentence`/`transform-sentence`
Edge Functions, steps in `PHASE2_SETUP.md`) to make the new `/writing` Fokus mode live; until then it
degrades gracefully and Kurz/Lang keep working. Product name: **Genauly** (`genauly.de`)._

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
- [ ] **Deploy the Fokus "Satzlabor" backend (s147)** to make the new `/writing` Fokus mode live: run
      migration `0009_sentence_studio.sql` + `supabase functions deploy check-sentence transform-sentence`.
      Steps in `docs/plans/PHASE2_SETUP.md`. No new secrets required. Until then Fokus shows "momentan
      nicht verfügbar" and Kurz/Lang keep working.
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

**Handoff after session 147 (2026-07-22). Schreibtraining redesign: Fokus "Satzlabor", branch
`claude/schreibtraining-todo-review-afoegv`, PR #640 merged.** Backlog #6. A five-expert design panel
(LLM engine, frontend, German B2 pedagogy, backend cost/security, UX) produced
`docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md`; mockups in `preview/schreibtraining-redesign-mockups.html`.
What shipped:
- **`/writing` is now a mode router** (`WritingHub` rewritten): **Fokus · Kurz · Lang** via
  `WritingModeSwitcher` (sliding pill) + a Verlauf toggle. Kurz/Lang extracted verbatim into
  `GuidedWritingTrainer` (old length toggle folded into the mode; existing `evaluate-writing` backend).
- **Fokus "Satzlabor"** (`src/features/writing/fokus/`): single-sentence lab. `FokusTrainer` +
  tri-state `GrammarRail` (aktuell / target / selected; desktop rail + mobile chip row) +
  `useFokusMachine` (edit invalidates, transforms derive from the corrected base, in-memory cache).
  `grammarDimensions.ts` = the Aktiv/Vorgangspassiv × Präsens/Perfekt/Präteritum MVP grid (data-driven,
  Wave 2 extends the arrays). Client `lib/sentenceStudio.ts` degrades gracefully if the backend is
  undeployed.
- **Backend:** migration `0009_sentence_studio.sql` (`sentence_checks` owner-only, GLOBAL cross-user
  `sentence_transforms` cache, `sentence_ai_ops` paid-op ledger, `bump_transform_hit` RPC,
  `sentence_studio` kill-switch) + Edge Functions `check-sentence` (correct + detect, Haiku, cache-first)
  and `transform-sentence` (transform, cache-FIRST, abstains rather than hallucinate; burst/daily/monthly
  limits count only paid ops; `TRANSFORM_MODEL` env-switchable to Sonnet). Metered into the shared **$5
  fuse** so max spend is unchanged. Deploy steps in `docs/plans/PHASE2_SETUP.md`.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · test:unit **257/257** (new `tests/fokusGrammar.test.ts`) ·
  build ✓ · check:bundle **111.9 kB** (main unchanged; writing stays lazy) · lint:content ✓.
- **Open follow-ups:** (1) founder deploys 0009 + the two functions to make Fokus live; (2) decide
  Haiku vs Sonnet 5 for transforms (default Haiku, one env var); (3) Wave 2 axes (Zustandspassiv,
  Konjunktiv II, Sie↔du, clause order) + the ~50-triple eval harness the plan specifies. Fokus is
  MVP-scoped: no per-token diff highlight yet, single sentence only.

_(Session 146's /sources verification-refresh + human-review-reset + table-restructure handoff, and
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
