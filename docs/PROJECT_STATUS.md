# Project Status

_Last updated: 2026-07-24 (session 152, complete). **Fokus "Satzlabor" Wave 2: Konjunktiv II +
Zustandspassiv** (from a grammar-dimensions brainstorm, `docs/plans/GRAMMAR_DIMENSIONS_BRAINSTORM.md`).
The Fokus grammar rail now has three combinable axes: **Genus Verbi** (Aktiv · Passiv · Zustandspassiv),
**Zeitform** (Präsens · Perfekt · Präteritum) and **Modus** (Indikativ · Konjunktiv II). `mood` was
promoted from the pinned `DEFAULT_MOOD` to a real axis; Zustandspassiv is its own Genus-Verbi pill (a
detected `passiv_zustand` maps straight to it; the copula-is-Aktiv safeguard stays in the check-sentence
prompt). The rail is data-driven, so both were data/wiring adds across `grammarDimensions.ts` /
`useFokusMachine.ts` / `GrammarRail.tsx` / `FokusTrainer.tsx`. The `transform-sentence` prompt gained
Konjunktiv-II rules (synthetic wäre/hätte/könnte vs würde, never würde in the wenn-clause, K-II
Vergangenheit) and Vorgang-vs-Zustand rules; **`PROMPT_VERSION` bumped 2 → 4** (cache invalidation). The
green-dot legend was simplified to "Grüner Punkt = dein Satz." Operation-style transforms (Register
Sie↔du, Satzbau HS↔NS) remain a later wave: they do NOT fit the voice/tense/mood tuple and need a new
edge-function operation contract. **Founder action: redeploy `transform-sentence`** (now
`PROMPT_VERSION=4`) so the improved K-II / Zustandspassiv output takes effect; the new pills already
work against the live function without it. Product name: **Genauly** (`genauly.de`)._

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
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
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

**Handoff after session 152 (2026-07-24). Fokus "Satzlabor" Wave 2 (Konjunktiv II + Zustandspassiv),
branch `claude/grammar-dimensions-transformations-l3ib3m`, PR #678 merged.** Started as a
grammar-dimensions brainstorm (four research agents) → `docs/plans/GRAMMAR_DIMENSIONS_BRAINSTORM.md`
(full dimension catalog, feasibility tiers, B2-marker ranking, guardrails, Now/Next/Later/Skip roadmap)
+ two previews (`preview/grammar-dimensions-satzlabor.html`, `-catalog.html`) + a combined claude.ai
artifact (daa4dbb6). Then built the "easy half":
- **Konjunktiv II** as a new **Modus** rail axis. `mood` promoted from the pinned `DEFAULT_MOOD` to a
  real, combinable axis: `grammarDimensions.ts` (AxisId + Modus values Indikativ/Konjunktiv II;
  `normalizeDetected` takes/returns `mood`, konjunktiv1/imperativ → null), `useFokusMachine.ts`
  (selection/detected/cache-key/target/base all carry mood), `GrammarRail.tsx` + `FokusTrainer.tsx`
  (detected prop, transform label, loading pill, reset). Rail is data-driven so the Modus section
  renders itself.
- **Zustandspassiv** as a third Genus-Verbi pill (data-only value add). Because `KNOWN.voice` derives
  from the axis, a detected `passiv_zustand` now maps to its own pill instead of `null`; this also
  fixed a phantom "Aktiv looks selected" quirk on a real Zustandspassiv sentence. The copula safeguard
  (misread "Ich bin krank" → aktiv) lives in the check-sentence prompt, unchanged.
- **Edge function.** `transform-sentence` prompt gained K-II formation rules + a Vorgang-vs-Zustand
  clarifier + two worked examples; `PROMPT_VERSION` 2 → 4 (global-cache invalidation). **The founder
  must redeploy `transform-sentence`** for the better output; the pills already work against the live
  function (its enums already accept konjunktiv2 / passiv_zustand as targets).
- **Copy.** Rail legend simplified to "Grüner Punkt = dein Satz." / "Tippe eine andere Form, um ihn
  umzuwandeln." (`GrammarRail.tsx`).
- **Held for later (operation-style, NOT the tuple → needs a new edge-function contract):** Register
  (Sie↔du), Satzbau (HS↔NS), Nominalstil, Relativ↔Partizip. Plusquamperfekt deferred (needs a
  temporal-anchor guardrail). See the brainstorm doc §6.1 roadmap.
- **Gates:** typecheck ✓ · test:unit **262/262** · lint 0 errors · build ✓ · check:bundle **112 kB** ·
  lint:content ✓. Edge function is Deno (not deployed from the sandbox).

**Handoff after session 151 (2026-07-23). Fokus "Satzlabor" grammar-bug fix + AI provider cascade
rework, branch `claude/ai-response-bug-xfsth9`.** Founder flagged (screenshots) that the Satzlabor gave
wrong, self-contradictory German feedback.
- **Bug.** For "Ich bin krank wegen Kälte und Husten" (a plain Aktiv copula, sein + adjective) the
  panel marked **Passiv** as the detected form, then refused Perfekt/Präteritum with "Der Satz steht
  schon in dieser Form" (Präsens treated as already past) and refused a passive it simultaneously
  claimed the sentence already was. Root cause: the cheap Haiku detector misread "sein + Adjektiv" as
  a Zustandspassiv, which `normalizeDetected` then collapsed onto the Vorgangspassiv pill.
- **Fix (server prompts).** `check-sentence`: explicit rule that sein/werden/bleiben + adjective/adverb
  is always Aktiv, only + Partizip II of a transitive verb is passive; worked examples; strict
  JSON-only. `transform-sentence`: `bereits_zielform` only when BOTH voice AND tense already match (a
  tense change is a real transform); same copula rule. `evaluate-writing`: JSON-only hardening.
- **Fix (client).** `grammarDimensions.ts` `normalizeDetected` no longer maps a detected
  `passiv_zustand` onto the Passiv pill; it returns null (no marker), so a misdetected copula can never
  surface a wrong Passiv dot. `tests/fokusGrammar.test.ts` updated to lock this in.
- **Provider cascade (all 3 AI functions).** Founder wanted Gemini primary everywhere + a combined
  budget. `check-sentence`/`transform-sentence`/`evaluate-writing` each now run **Gemini 2.5 Flash
  (free, recorded $0) → Claude Sonnet 5 → GPT-5**: Sonnet leads the paid backup until month-to-date
  Claude spend across **both** `sentence_ai_ops` + `writing_evaluations` reaches `CLAUDE_BUDGET_USD`
  ($2), then GPT-5 leads. The existing global `MONTHLY_SPEND_CAP_USD` ($5, shared via `ai_usage`)
  bounds all three combined. Anthropic calls drop `temperature` + disable thinking (Sonnet 5 family);
  Gemini forces JSON output + a generous token budget; GPT-5 uses `max_completion_tokens` +
  `reasoning_effort: minimal`. Every model id + the $2 threshold are env-overridable (`GEMINI_MODEL`,
  `CHECK_MODEL`/`TRANSFORM_MODEL`/`EVAL_MODEL`, `OPENAI_MODEL`, `CLAUDE_BUDGET_USD`). Caches
  invalidated so stale wrong answers are not re-served (check-sentence `CHECK_VERSION` salt,
  transform-sentence `PROMPT_VERSION` bump).
- **Transparency.** The two EU AI Act Art. 50 disclaimers (Satzlabor + writing coach) and the privacy
  policy (DE + EN) now name all three providers routing-neutrally. Judged non-material (processors +
  purpose unchanged, all already disclosed): `CONSENT_VERSION` NOT bumped, so no forced re-consent.
- **Fokus disclaimer consolidation (follow-up, same session).** The Fokus view's two AI notes (the
  send-to-AI line + the "KI-generierte Umformung" footer inside the transform box) were merged into
  ONE harmonized, centered note ("Dein Satz wird von einer KI … geprüft und umgeformt"), moved to the
  bottom of the content column (desktop: `min-h` column + `mt-auto` so it lands on the same horizontal
  line as the fixed "Mit KI gebaut · Feedback" pill). The `12rem` bottom offset is a tunable nudge.
- **Founder ops (done):** deployed all three functions, set `GEMINI_API_KEY` (primary) + provider keys.
- **Gates:** typecheck ✓ · test:unit **260/260** · build ✓. Edge functions are Deno (no local
  `deno check`/keys in the sandbox); every path is fail-safe (any provider → null → fall through →
  `{ ok: false }`). Watch the function logs on the first Gemini-primary calls.
- **Caveat carried forward:** Gemini Flash primary is the same cheap tier that caused the original bug;
  the hardened prompt carries it and Sonnet backstops, but if wrong grammar reappears, flip the primary
  back via `GEMINI_MODEL` (one env var, no code change).

_(Session 150's Fokus correction-card redesign + Umlaut-keys handoff (PRs #653/#654), session 149's
Schreiben-as-Bibliothek-extension handoff (the 4-segment mode switcher + writing-prompt pools, branch
`claude/schreiben-design-refinement-bw8rhh`), session 148's PWA-auth-uninstall bug-fix handoff
(fresh-device OAuth `syncHydrated` gate, PR #644),
session 147's Schreibtraining-redesign handoff (Fokus Satzlabor + the Schreiben nav item + the first
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
