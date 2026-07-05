# UX/UI Redesign — Phase-wise Implementation Plan (with Claude model recommendations)

_Status: **IN PROGRESS**, session 66 (2026-07-05). **Phase 1 "The Diet" shipped** (PR #305),
**Phase 2 "The Stage" shipped** (PR #307), and **Phase 3 "The World Seed" shipped in full**
(tasks 3.1–3.6): the six domain-building SVGs (`src/components/city/domain-buildings.tsx`), the lazy
city strip on Heute (`CityStrip.tsx` + `mastery.ts`), Fortschritt rebuilt as a quest board (city strip +
next-Can-Do quest card + "Meine Sammlung" entry, charts/calendar/mastery grid collapsed under a
persisted "Details" toggle), the „Meine Sammlung" bag view (`features/collection/Sammlung.tsx`,
`/sammlung`), and a Bibliothek styling pass (German word leads each row, meta demoted to one line).
**Phase 4 "The Depth" is underway** (typed forward-recall, authentic Lesen/Hören): the task
breakdown was drafted in session 67 (see the Phase 4 section) and **Session A (4.1 grading engine +
4.2 typed-recall block in the loop) is shipped**; 4.3–4.6 await the founder's priority call against the
still-PROPOSED `GAME_IMPLEMENTATION_PLAN.md`. This doc merges the two redesign reports into one
executable plan:_

1. **`docs/reference/GENAULY_UX_UI_ANALYSIS.md`** (PR #300): the 7-dimension UX audit. Headline
   findings: the FSRS engine is world-class but the default experience is recognition-heavy; the
   best pedagogy (speaking, voice variety) is hidden behind default-off switches; authentic input
   is thin; there is no stored-value loop; progression is invisible.
2. **`docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`** (PR #301): the "lean surface, deep drawer"
   strategy with the 4-phase skeleton (Diet → Stage → World Seed → Depth), screen-by-screen specs,
   and the unified-world game contract. Read it for the full screen specs; this doc is the
   execution layer on top.

---

## Design north star (every phase is judged against this)

1. **One job per screen.** Exactly one visually dominant primary action.
2. **Show state, don't describe it.** Ring not XP sentence, lit building not mastery table.
3. **German is the content, not the chrome.** Display-size German inside exercises, minimal
   interface copy, D/E tap-gloss everywhere.
4. **Reward with the world, not with text.** Loot cards, city, quests; XP/streak stop being the
   only feedback.
5. **Production over recognition.** Every phase should raise the ratio of typed/spoken retrieval
   to tap-recognition, because that is what the FSRS engine is built to consume.

Sequencing rationale: **calm the surface first (P1–P2), then give it a world (P3), then deepen
the pedagogy (P4)**. Depth work lands better on a surface users already enjoy, and the Phase 2
collection-level helper is a hard dependency of Phase 3's bag view.

---

## Claude model recommendations (how to run each session)

The founder runs each phase in Claude Code and picks the model per session/task:

| Model | Use for | Cost posture |
|---|---|---|
| **Haiku 4.5** | Mechanical, low-ambiguity edits: copy deletion, string swaps, styling passes, running gates | Cheapest, fastest |
| **Sonnet 5** | Standard component work: new UI components, store wiring, well-specified refactors | Default workhorse |
| **Opus 4.8** | Multi-file refactors near locked constraints, engine helpers + unit tests, persisted-store migrations | When a subtle regression is expensive |
| **Fable 5** | Design-ambiguous or pedagogy-critical work: SVG illustration, exercise-type design, final design QA | Highest capability, use sparingly |

Working pattern per phase: **open the session on the phase's strongest-model task, then
downshift** for the mechanical remainder. Before each phase's PR, run a `/code-review` pass:
cheap insurance on locked-constraint regressions.

---

## Phase 1 — The Diet (defaults, decluttering, onboarding) — 1 session

**In plain words:** Make the app instantly welcoming. A new user answers one question and is
inside a real exercise within about a minute (today it takes 3 to 5 minutes of forms). The home
screen shrinks from six text blocks to three clear elements: a progress ring, one big Start
button, and situation shortcuts. Every German line gets a tap-to-translate gloss so nobody feels
lost. And two proven learning features that already exist but are switched off (varied voices,
speaking practice) get switched on for everyone.

| # | Task | Files | Model | Why this model |
|---|---|---|---|---|
| 1.1 | Flip pedagogy defaults: `voiceVariety: true`, `recognitionEnabled: true` where STT is supported (typed fallback stays). **Requires a persisted-store migration** (version bump in the `useSettingsStore` persist config) so existing users who never touched the switches also get the new defaults, without clobbering explicit opt-outs. | `src/store/useSettingsStore.ts` | **Opus 4.8** | Persist migrations are the classic silent-breakage spot (precedent: settings-store `version: 1` + `ROUTE_SUCCESSOR`). Wrong logic wipes user settings. |
| 1.2 | Heute to 3 elements: pure CSS/SVG conic **streak ring** fusing greeting + streak flame + daily-goal % (no recharts on the eager path); single gradient **Start button** with "~N Min · X fällig" subtitle (the ONLY gradient element on the screen, per the new gradient rule); icon-first **Situationen chip row** with no header and no description sentences. Delete the section heading block, the stats strip card, and the Bibliothek link card. Keep the eager path light (`sessionPreview.ts` only, never `engine/session.ts`). | `src/features/dashboard/Dashboard.tsx`, `intentCards.ts` (rendering only) | **Sonnet 5** | Precisely specified component restructure. |
| 1.3 | Onboarding 5 steps → 1 setup screen + taster: "Wofür lernst du Deutsch?" as big visual tiles (Beruf / Alltag / Prüfung / Beides → `LearningGoal` + `mode`), one CEFR chip row, consent checkbox (consent stays BEFORE any stored progress; `CONSENT_VERSION` untouched), then straight into a ~90s composed taster session (5 blocks, existing composer). Name, exam date and rhythm are collected contextually later (first end screen / Einstellungen / Prüfung surface). `completeOnboarding` keeps its signature; missing fields use current defaults. | `src/features/onboarding/Onboarding.tsx` | **Opus 4.8** | The legal consent flow and the composer handoff intersect here; both are locked or load-bearing. |
| 1.4 | `<Gloss>` shared component: tap toggles German ↔ English on any content line; per-tap state (no persistence), instant, no layout shift. Wire into all session block renderers. Rendering only, the banks are already bilingual. | new component in `src/features/shared/`, `SessionPlayer.tsx` block renderers | **Sonnet 5** | Small, well-bounded component + wiring. |
| 1.5 | Microcopy budget app-wide: eyebrow ≤ 2 words, title ≤ 5 words, section description sentences **deleted, not shortened**. No em dashes. Add the budget as a CLAUDE.md rule when shipped. | sweep across `src/features/*` | **Haiku 4.5** | Pure copy deletion against explicit rules; verify with `pnpm lint:content`. |
| 1.6 | Gates + ship: `pnpm build`, `lint`, `test:unit`, `check:bundle`; PR → `main` → squash-merge → branch realign. | — | **Haiku 4.5** | Mechanical. |

**Acceptance criteria:** Heute renders < 40 interface words; install → first exercise < 60s on a
fresh profile; existing users keep their explicit settings; all gates green.
**Risks:** task 1.1 migration correctness; task 1.2 must not regress the locked bottom bar or the
eager-bundle rule.

---

## Phase 2 — The Stage (session focus mode + reward feel) — 1–2 sessions

**In plain words:** The learning session becomes a full-screen, distraction-free stage, like a
game level: no header, no tab bar, one exercise at a time, a thin progress bar on top. Answering
correctly several times in a row builds a visible gold combo pulse. Finishing a session feels
like opening a reward: the daily ring fills up, and the words you practiced appear as collectible
cards whose levels reflect how well you actually know them.

| # | Task | Files | Model | Why this model |
|---|---|---|---|---|
| 2.1 | Focus mode: hide header + bottom bar on `/session` only, at render level in `AppShell` (bar mechanics/store untouched, locked s26–29; the iOS `translateZ`/`no-callout` fixes must survive). Chrome returns on the end screen. | `src/components/layout/AppShell.tsx` | **Opus 4.8** | Adjacent to the most heavily locked code in the repo; a subtle iOS regression is expensive to detect from the sandbox. |
| 2.2 | One block per screen, slide transitions (framer-motion), display-size German (largest element on screen, per the type rule), large tap targets, ✕ exit with confirm. Honor `MotionConfig` reduced-motion (s58). Motion budget: feedback moments only (answer tick, ring advance, combo pulse, loot spring); no ambient browse animation. | `src/features/session/SessionPlayer.tsx` | **Opus 4.8** | The largest refactor of the redesign; every block renderer and the FSRS `latencyMs` capture thread through this file. |
| 2.3 | Combo counter: consecutive-correct count, gold pulse at 3+, resets on miss. Add the **reward-gold token pair** (light `#d98a06` on `#fdf3e0`, dark `#e8a33d` on `#302512`, as HSL tokens), used exclusively for loot/combo/lit buildings. Visual only; `engine/scoring.ts` untouched. | `SessionPlayer.tsx`, `src/index.css`, `tailwind.config.ts` | **Sonnet 5** | Self-contained visual feature with an exact spec. |
| 2.4 | Loot-drop end screen: ring-fill animation, reviewed words as collectible cards, "Lv n ↑" on cards that leveled this session. New pure helper **`src/engine/collection.ts`** mapping FSRS stability/interval bands → Lv 1–5, **with a Vitest unit test** for the band mapping (extend `tests/`). Keep the "Morgen: X festigen" forward hook. | `SessionPlayer.tsx` end screen, new `engine/collection.ts`, `tests/` | **Opus 4.8** | This mapping is the stable **game contract** (unified-world bridge); it must be right first time and stay stable. |
| 2.5 | Gates + ship (as 1.6) + `/code-review` pass before the PR. | — | **Haiku 4.5** | Mechanical. |

**Acceptance criteria:** full session run-through on a mobile viewport with chrome hidden and
restored correctly; combo and loot animations honor reduced-motion; `pnpm test:unit` covers the
Lv band mapping; latency still reaches `reviewVocab` (spot-check in code review).
**Risks:** AppShell chrome-hiding vs the iOS fixes; the SessionPlayer refactor dropping the
latency signal.

---

## Phase 3 — The World Seed (city, quests, collection) — ~2 sessions

**In plain words:** The app starts to look like the future game. Six small flat illustrations of
city buildings (Bürgeramt, Bank, Arztpraxis, Büro, Wohnhaus, Prüfungshalle) represent the areas
of life you're learning German for, and they light up as you master each one. The progress page
becomes a quest board: the next "Ich kann …" goal shows as a quest card you can complete and
claim. Words you save or master collect into "Meine Sammlung", a personal bag that makes the app
more yours the longer you use it.

| # | Task | Files | Model | Why this model |
|---|---|---|---|---|
| ✅ | *All of 3.1–3.6 shipped session 65–66.* | | | |
| 3.1 | Six flat SVG **domain buildings** in the established two-tone + neon mark style (`route-icons.tsx` conventions: base tone from accent, hard-coded neon second tone, NORM optical sizing). Lit (reward-gold accents) and unlit states. Deliberately the seed of the game's city map; no pixel art (awaits founder blessing per `GAME_CONCEPT.md`). | new SVG module patterned on `src/components/layout/route-icons.tsx` | **Fable 5** | Original illustration inside a locked visual language is where cheaper models are weakest; these assets are reused everywhere (Heute, Fortschritt, future game), so one Fable session pays for itself. |
| 3.2 | City strip on Heute: buildings with lit/unlit state from theme/domain mastery (existing `useProgressStore` data). Keep the eager path light; lazy-load if it threatens the budget. | `Dashboard.tsx`, `useProgressStore` selectors | **Sonnet 5** | Presentational wiring over existing data. |
| 3.3 | Fortschritt led by the city view + the next Can-Do milestone as a **quest card** ("Ich kann …", progress bar, claim moment via `canDo.ts` thresholds); charts/calendar/mastery grid collapse under an expandable "Details" section (expanded flag persisted in `useSettingsStore`). | `src/features/analytics/Analytics.tsx` | **Sonnet 5** | Rearrangement of existing sections; recharts stays lazy. |
| 3.4 | „Meine Sammlung" bag view: `savedWords` + mastered items as a browsable collection using the Phase 2 `engine/collection.ts` levels. This is the **stored-value investment loop** (audit rec #4). | new view under `src/features/`, reachable from Fortschritt | **Sonnet 5** | Conventional list UI reusing the existing paged-list/browse patterns. |
| 3.5 | Bibliothek presentation pass: the German word leads each row at higher weight; meta demoted to one quiet line. Structure, facets and search **unchanged** (the diver's home). | `src/features/library/*` row renderers | **Haiku 4.5** | Styling-only pass with an explicit rule. |
| 3.6 | Gates + ship; **watch `check:bundle`** (SVGs + new views respect the 400 kB budget or lazy-load). | — | **Haiku 4.5** | Mechanical. |

**Acceptance criteria:** city renders on Heute and Fortschritt with correct lit states; quest-card
claims fire at `canDo.ts` thresholds; Sammlung browsable; bundle under budget; gates green.
**Risks:** bundle budget; SVG quality (mitigated by Fable on 3.1).

---

## Phase 4 — The Depth (production + authentic input) — 2–3 sessions

_Task breakdown drafted session 67 (2026-07-05). **Session A (tasks 4.1 + 4.2) is EXECUTED ✅**: 4.1
grading engine (s67, `engine/typing.ts`) and 4.2 typed-recall block in the loop (s68, `kind: "typing"`
composer block + `TypingBlock` renderer + `graduatedToTyping` graduation rule). Tasks 4.3–4.6 remain
pending the founder's priority call against `docs/plans/GAME_IMPLEMENTATION_PLAN.md` (still PROPOSED; its
G0 prerequisite, redesign Phases 1–3, is now fully shipped, so G1 is also eligible)._

**In plain words:** This phase upgrades what learning science says matters most. First, instead
of only tapping multiple-choice answers, learners type the German word from memory (with
forgiving spelling matching), which research shows builds far stronger recall than recognizing it
in a list. Second, short authentic reading and listening moments join the daily session, because
real-world texts are what actually break the intermediate plateau this product exists to solve.

| # | Task | Files | Model | Why this model |
|---|---|---|---|---|
| 4.1 ✅ | **Typed-recall grading engine** (audit rec #1, "if only one thing ships"): pure `gradeTyped(expected, typed)` helper with tolerant matching in the `engine/pronounce.ts` spirit: case/whitespace normalisation, alternate umlaut spellings (ae/oe/ue/ss), article graded separately for nouns (wrong/missing article is a "partial", not a fail), and a small length-scaled edit-distance tolerance for typos. Three-tier verdict (correct / almost / wrong) so near-misses grade as FSRS "Hard", not "Again". **Vitest suite for the grading bands** (new `tests/typing.test.ts`); run `pnpm test:pronounce` if the shared matcher is touched. | new `src/engine/typing.ts` (+ maybe shared normalisation in `engine/pronounce.ts`), `tests/typing.test.ts` | **Fable 5** | Grading-tolerance design directly shapes the data the FSRS scheduler learns from; a too-strict or too-lax matcher silently corrupts scheduling for every user. |
| 4.2 ✅ | **Typed-recall block in the loop:** new `kind: "typing"` `SessionBlock` in the composer with a graduation rule (cards above a stability floor get typed forward-recall; new/young cards stay on recognition flashcards), renderer in `SessionPlayer` (EN prompt display-size, typed DE input, "Anzeigen" reveal fallback that grades as a miss, latency + verdict feed `reviewVocab`, combo/loot untouched). Extend the session-composer Vitest pins. | `engine/session.ts`, `features/session/SessionPlayer.tsx`, `tests/` | **Opus 4.8** | Integration threads through the composer pools and the FSRS `latencyMs` capture path; a dropped signal here is the Phase 2 risk all over again. |
| 4.3 | **Lesen/Hören content bank** (audit rec #3): new `src/data/texts.ts` with ~8–12 short authentic-style B1–B2 texts (Behörden letter, workplace email, memo, announcement, voicemail script) each with `themeId`, `cefr`, DE text + EN gloss, and 2–3 comprehension checks. Closed enums mirrored in `scripts/lint-content.mjs`; one provenance row per item (`review_status: "draft"` for the founder pass). | new `src/data/texts.ts`, `src/types/index.ts`, `src/data/provenance.ts`, `scripts/lint-content.mjs` | **Fable 5** | Original German content at a calibrated CEFR band is authored work, and the bank's schema is a new content contract the linter must be able to police. |
| 4.4 | **Lesen/Hören composer block + renderer:** `kind: "reading"` block (plus a listening variant that plays the same text via `engine/speech.ts` TTS when available), full-screen text card with tap-gloss, comprehension MCQ, results feed XP/theme progress (NOT vocab FSRS), weighted ~1 block per composed session. | `engine/session.ts`, `SessionPlayer.tsx` | **Opus 4.8** | A new first-class block kind touches session weighting and the focus-mode stage; content-governance rules apply. |
| 4.5 | **Visible progression chip** (audit rec #5a): small per-theme phase label (e.g. Aufbau → Festigen → Gemischt) derived from existing FSRS/theme-mastery state, shown on the Fortschritt theme grid and as the subtitle of a city-building tap. | `features/analytics/Analytics.tsx`, `components/city/`, `src/lib/` | **Sonnet 5** | Small derived-state UI once 4.1/4.2 land; no new state. |
| 4.6 | Gates + ship + docs: all gates including `test:srs`/`test:pronounce`, CLAUDE.md content counts (texts bank), `PROJECT_STATUS.md` + `SESSION_PROMPT_LOG.md`, PR → `main` → squash-merge → branch realign. | — | **Haiku 4.5** | Mechanical. |

**Suggested session split (matches the M–L, 2–3 session estimate):**
- **Session A — typed recall (4.1 + 4.2 + gates).** Ships standalone; this is the audit's
  "if only one thing ships" item and the half of Phase 4 the game plan also reuses (G1's
  formCloze / dialogue-battle scenes need exactly this tolerant typed grading).
- **Session B — authentic input (4.3 + 4.4 + gates).** Content authoring + the new block kind.
- **Session C (short) — 4.5 + 4.6** wrap-up, or fold 4.5 into B if it runs light.

**Acceptance criteria:** typed recall live in the default loop and feeding FSRS; at least one
authentic-input block kind in the composer; grading covered by unit tests; gates green.
**Risks:** feeding bad grading signals into FSRS (mitigated by the 4.1 test suite); provenance
discipline on new texts; SessionPlayer growth (793 lines pre-Phase-4; consider extracting block
renderers if 4.2/4.4 push it past ~1000).

---

## Phase 5 (optional backlog) — remaining audit items

Not scheduled; kept so nothing from the audit is lost: grammar **Übersicht** concept visuals
(audit rec #5b; **Fable 5** for the diagrams), variable-reward experiments beyond combo/loot
(Dimension 7), and a negotiation-of-meaning "rephrase" feedback ladder (Dimension 2). Revisit
after Phase 4's effect on the locally visible success measures.

---

## Cross-phase rules (every phase)

- Gates: `pnpm build`, `pnpm lint`, `pnpm lint:content`, `pnpm test:unit`, `pnpm check:bundle`
  (+ `test:srs` / `test:pronounce` when those engines are touched).
- Locked, do not violate: bottom-bar mechanics (s26–29), dialog/overlay tokens, brand-logo rules,
  no em dashes in user-facing copy, no new dependencies, the 400 kB main-chunk budget, the
  consent/legal flow.
- Ship path per phase: PR → `main` → squash-merge → post-merge branch realign. The founder
  verifies the live result.
- Docs per phase: `PROJECT_STATUS.md` + `SESSION_PROMPT_LOG.md` + any stale CLAUDE.md facts
  (e.g. the microcopy budget becomes a CLAUDE.md rule when Phase 1 ships).
- Success measures (from the redesign plan): Heute interface words < 40; install → first
  exercise < 60s; session completion > 80% (locally visible); next-day return trend in
  `activeDays`. No analytics/tracking; all computed from on-device data.
