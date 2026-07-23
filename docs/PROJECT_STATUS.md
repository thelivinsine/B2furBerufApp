# Project Status

_Last updated: 2026-07-23 (session 151, complete). **Fokus "Satzlabor" grammar-bug fix + AI provider
cascade rework** (follows the same-day s150 Fokus correction redesign). The Satzlabor was teaching
wrong German (copula "Ich bin krank" mislabeled as Passiv; tense transforms wrongly refused as "Der Satz
steht schon in dieser Form"). Fixes: hardened German-grammar prompts (explicit copula-is-Aktiv rule,
stricter `bereits_zielform`, worked examples, strict JSON-only) and `normalizeDetected` no longer forces
a detected Zustandspassiv onto the Passiv pill. **All three AI Edge Functions (`check-sentence`,
`transform-sentence`, `evaluate-writing`) now share ONE provider cascade: Gemini 2.5 Flash (free, $0) →
Claude Sonnet 5 → GPT-5**, Sonnet leading the paid backup until month-to-date Claude spend across all AI
features hits $2 (then GPT-5), all bounded by the existing global $5/month fuse; models + budget are
env-overridable. The two AI disclaimers + the privacy policy (DE/EN) now name all three providers
routing-neutrally. Founder has deployed all three functions + set `GEMINI_API_KEY`. Product name:
**Genauly** (`genauly.de`)._

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
  ONE harmonized, centered note ("Dein Satz wird von einer KI … geprüft und umgeformt") in normal
  flow under the content. (A first pass pinned it to the bottom via `min-h` + `mt-auto` to line up
  with the "Mit KI gebaut · Feedback" pill; the founder found that detached band ugly, so it was
  reverted to a plain centered note.)
- **Founder ops (done):** deployed all three functions, set `GEMINI_API_KEY` (primary) + provider keys.
- **Gates:** typecheck ✓ · test:unit **260/260** · build ✓. Edge functions are Deno (no local
  `deno check`/keys in the sandbox); every path is fail-safe (any provider → null → fall through →
  `{ ok: false }`). Watch the function logs on the first Gemini-primary calls.
- **Caveat carried forward:** Gemini Flash primary is the same cheap tier that caused the original bug;
  the hardened prompt carries it and Sonnet backstops, but if wrong grammar reappears, flip the primary
  back via `GEMINI_MODEL` (one env var, no code change).

**Handoff after session 150 (2026-07-23). Fokus correction-card redesign + Umlaut keys, branch
`claude/diagonal-gradient-invert-odi99r`, PRs #653 + #654 merged.** Founder started from "invert the
background gradient diagonally" (PR #653: `tailwind.config.ts` `mesh`/`page` accent radial moved
top-right → bottom-left, linear angle 150°→120°), then pivoted to redesigning the Fokus corrected-state
card as "too noisy and redundant" and iterated across ~8 preview rounds before approving a combined
design and asking to implement + ship.
- **Design-review artifact.** A single consolidated gallery (`preview/schreiben-design-review.html`,
  published as a claude.ai artifact) with a version switcher (Final + Alle + every prior variant), an
  app light/dark toggle, and live interactions. All step previews are committed under `preview/`
  (`fokus-correction-redesign`, `-ac`, `-v4-himmel`, `-toggle`, `fokus-umlaut-keys`, `schreiben-design-review`).
- **Correction card (`FokusTrainer.tsx`).** Removed the struck-through original, the "· n Änderungen"
  counter, the in-place `<mark>` highlight, and the "Was ich geändert habe" list. New: eyebrow "Dein
  Satz" shares its row with an **Original/Korrigiert segmented toggle** (default Korrigiert; resets to
  Korrigiert on each new correction via a `view` state + effect on `m.corrected`). Original view marks
  the wrong words with `.fx-mark-coral` (`--reward`), Korrigiert marks the fixes with `.fx-mark-green`
  (`--success`) — both are calm underlines (`index.css` `@layer utilities`). Below: **Himmelblau fix
  tiles** (`bg-accent/30 border-accent/70` light, `dark:bg-accent/[0.18] dark:border-accent/[0.45]`),
  each = category eyebrow (`text-accent-ink`) + `old → new`. **Neuer Satz** is an outline button on the
  tiles row, `ml-auto self-end` (right + bottom aligned, wraps only if needed); removed from the mobile
  toolbar and the desktop `GrammarRail` (`onNewSentence` no longer passed) so it appears once.
- **Umlaut keys (`src/features/writing/UmlautKeys.tsx`).** Reusable bar, keys ä ö ü ß Ä Ö Ü at ~24px
  (h-6, min-w 1.6rem), neutral `bg-surface` at rest, Himmelblau on press; inserts at the caret
  (`onMouseDown` preventDefault keeps focus, `requestAnimationFrame` restores selection). Wired into the
  Fokus input footer (shares the desktop row with Korrigieren; mobile keeps the sticky Korrigieren bar)
  and the Kurz/Lang guided editor (`GuidedWritingTrainer.tsx`, in the word-count row).
- **Diff engine (`wordDiff.ts`).** `diffWords` now also returns `originalTokens` (flagged, so the
  Original view marks errors reliably) and a per-change `category` from the new exported
  `classifyChange` (umlaut fold + case/punct normalization + multi-word = Grammatik heuristic).
  Categories are heuristic — tune if a pattern mis-buckets. `tests/wordDiff.test.ts` extended.
- **Ops note.** The remote git proxy needs a credential helper (`username=local_proxy`, empty password)
  for `git push`/`fetch`; without it, pushes fall back to unauthenticated api.anthropic.com and fail.
  Set `git config credential.helper '!f() { echo username=local_proxy; echo password=; }; f'`.
- **Gates:** `pnpm build` ✓ · `pnpm lint` **0 errors** (pre-existing warnings only) · `pnpm test:unit`
  **262/262** · `check:bundle` unaffected (writing stays lazy). Sandbox can't reach the live site;
  founder confirms after the Pages deploy.
- **Open:** the s147 founder redeploy action below still stands; error categories are heuristic and can
  be refined once seen live.

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

_(Session 148's PWA-auth-uninstall bug-fix handoff (fresh-device OAuth `syncHydrated` gate, PR #644),
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
