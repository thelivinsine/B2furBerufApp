# Project Status Archive — 2026-W28 (Jul 6–12)

_Sessions 69–71 (all 2026-07-06). Detailed logs for 69–70 plus the condensed "Resume here"
handoffs for 69–71. Split from `PROJECT_STATUS_ARCHIVE.md` by ISO week in s70._

## Session 69 (2026-07-06) — UX redesign Phase 4 Session B (Lesen/Hören authentic input)

**Phase 4 Session B COMPLETE: tasks 4.3 (Lesen/Hören text bank, PR #320 `f09da8e`) AND 4.4
(reading/listening composer block + renderer, PR #322 `98c4688`).** What 4.4 shipped:
- **New `kind: "reading"` `SessionBlock`** (`src/types/index.ts`): `textId` + a `listening` flag.
- **Composer** (`src/engine/session.ts`): Pool 6 emits **exactly one** reading block per session;
  prefers a text on the scoped/weak theme, else one in the active Mode lens, else any. A voicemail
  text plays as a **listening** variant when the caller reports TTS (new pure `listening` opt, player
  passes `ttsSupported()`); every other genre renders as readable text. `test:unit` gained 3 cases.
- **`ReadingBlock` renderer** (`src/features/session/ReadingBlock.tsx`, extracted so `SessionPlayer`
  stays under ~1000 lines): a two-stage full-screen focus block. Read/listen stage (genre + CEFR
  badges, tap-gloss title, `Übersetzung` toggle; listening = TTS play/replay with a `Text anzeigen`
  reveal fallback), then the 2–3 comprehension MCQs one at a time. `XP.readingCheck` (8) per correct
  check; the block registers ONE aggregate tally (majority-correct) at completion, so it never
  inflates correct/total, and it **never touches vocab FSRS**.
- **Gates:** all green; `check:bundle` main chunk **78.9 kB** (bank + renderer ride the lazy chunk).

---


**Handoff after session 69 (2026-07-06). UX redesign Phase 4 task 4.3 is SHIPPED ✅ (PR #320,
squash SHA `f09da8e`): the Lesen/Hören content bank, the first half of Session B (plan:
`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **`src/data/texts.ts` (new):** 10 authored authentic-style B1–B2 texts across 9 themes, in the five
  genres the plan names: Behörden letters (`tx_behoerde_anmeldung_brief` B1.2 meldewesen,
  `tx_behoerde_unterlagen_brief` B2.1 antrag), workplace emails (scheduling B1.2, customer/reklamation
  B2.1), memos (meetings/entscheidung B2.1, project B2.2), announcements (technology B1.2, safety B2.1),
  voicemail scripts (travel B1.2, logistics B2.1; these double as TTS listening input in 4.4). Each item:
  `id`/`kind`/`themeId`/`cefr`/`title`/`titleEn`/`de`/`en` + 2–3 MCQ `checks` (30 total, German
  questions, `explain` in English). All names/numbers/offices fictitious; no em dashes.
- **Types (`src/types/index.ts`):** `TextKind` (letter/email/memo/announcement/voicemail), `TextCheck`,
  `ReadingText`; `"text"` added to `ProvenanceContentType`.
- **Linter (`scripts/lint-content.mjs`):** `TEXT_KINDS` closed-enum mirror + `lintTexts` (kind/themeId/
  cefr enums, required fields, **checks length ≥ 2 is an error** (the 4.4 renderer contract), answer
  among options, globally unique check ids via a `texts/checks` sweep, `subThemeId` declared on the
  parent theme, `tx_` prefix warning). Bank loaded, counted (`texts`, `text checks`) and included in
  the provenance cross-check (one row per text; embedded checks ride on the text's row).
- **Provenance:** 10 authored/OWNED rows, `review_status: "draft"` for the founder pass; register now
  **1,121 rows** (1,096 draft / 25 verified). `/sources` (`features/legal/Sources.tsx`) got the required
  label + ordering entry for the new type.
- **Gates:** all green — `build`, `lint` (0 errors), `lint:content` (0 errors/warnings), `test:unit` 59,
  `check:bundle` main chunk **78.9 kB** (bank has no eager consumer; 4.4 must keep it in a lazy chunk).

**Next step:** **task 4.4** (Opus per the plan): `kind: "reading"` composer block (+ listening variant
via `engine/speech.ts` TTS), full-screen text card with tap-gloss + comprehension MCQ in `SessionPlayer`,
results feeding XP/theme progress (NOT vocab FSRS), ~1 block per composed session. Then short Session C
= 4.5 (progression chip) + 4.6 (docs/ship). The founder's pending priority call vs game-plan G1 stands.

---


**Handoff after session 69 (2026-07-06). UX redesign Phase 4 Session B is COMPLETE ✅: tasks 4.3
(Lesen/Hören text bank, PR #320 `f09da8e`) AND 4.4 (reading/listening composer block + renderer, PR #322
`98c4688`) shipped, so authentic reading/listening input is now live in the composed session (plan:
`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What 4.4 shipped:
- **New `kind: "reading"` `SessionBlock`** (`src/types/index.ts`): `textId` + a `listening` flag.
- **Composer** (`src/engine/session.ts`): Pool 6 emits **exactly one** reading block per session; prefers a
  text on the scoped/weak theme, else one in the active Mode lens, else any. A voicemail text plays as a
  **listening** variant when the caller reports TTS (new pure `listening` opt, player passes
  `ttsSupported()`); every other genre renders as readable text. `test:unit` gained 3 composer cases.
- **`ReadingBlock` renderer** (`src/features/session/ReadingBlock.tsx`, new — extracted so `SessionPlayer`
  stays under the ~1000-line line the plan flagged): a two-stage full-screen focus block. Read/listen stage
  (genre + CEFR badges, tap-gloss title, `Übersetzung` toggle; listening = TTS play/replay with a
  `Text anzeigen` reveal fallback), then the 2–3 comprehension MCQs one at a time (reuses the quiz MCQ
  styling + `explain`). `XP.readingCheck` (8) per correct check; the block registers ONE aggregate tally
  result (majority-correct) at completion, so it never inflates correct/total, and it **never touches vocab
  FSRS** (comprehension practice, not a graded SRS card — keeps 4.5's "no new state" invariant intact).
- **Gates:** all green — `build`, `typecheck`, `lint` (0 errors), `lint:content`, `test:unit` **62**,
  `check:bundle` main chunk **78.9 kB** (bank + renderer ride the lazy session-route chunk).

**Next step:** short Session C = **4.5** (visible per-theme progression chip on the Fortschritt theme grid
+ city-building tap, derived from existing FSRS/theme-mastery state, **no new state** — Sonnet) + **4.6**
(gates/docs wrap). OR the standing alternative: pivot to game plan G1 (`GAME_IMPLEMENTATION_PLAN.md`, still
PROPOSED), whose formCloze / dialogue-battle scenes now have the tolerant typed grading (4.1), the typed
block pattern (4.2), and the authentic-input block pattern (4.4) to build on.

---


## Session 70 (2026-07-06) — UX redesign Phase 4 Session C (progression chip + wrap)

**Phase 4 COMPLETE: tasks 4.5 (visible progression chip) + 4.6 (gates/docs wrap).** What 4.5 shipped:
- **`src/lib/phase.ts` (new):** `themePhase(ratio)` maps a theme's existing mastery ratio to a
  three-step **Aufbau → Festigen → Gemischt** label, reusing the app's two existing mastery bars
  (`< 0.4` = Aufbau, `< 0.8` = Festigen matching the city `LIT_THRESHOLD`/engine `masteryLabel` bands,
  `>= 0.8` = Gemischt matching the `mastery() >= 0.8` "mastered" bar). Pure derived function, no new
  state: both call sites already compute the ratio.
- **Fortschritt theme grid** (`features/analytics/Analytics.tsx`): each theme row shows a phase `Badge`.
- **City-building tap** (`components/city/CityStrip.tsx`): the aria-label/title include the phase.
- **Gates:** all green; `test:unit` 62, `test:srs` 323, `test:pronounce` 26, `check:bundle` 79.0 kB.

---


**Handoff after session 70 (2026-07-06). UX redesign Phase 4 is COMPLETE ✅: Session C shipped
tasks 4.5 (visible progression chip, PR TBD) and 4.6 (this gates/docs wrap), closing out Phase 4
(plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What 4.5 shipped:
- **`src/lib/phase.ts` (new):** `themePhase(ratio)` maps a theme's existing mastery ratio to a
  three-step **Aufbau → Festigen → Gemischt** label, reusing the app's two existing mastery bars
  (`< 0.4` = Aufbau, `< 0.8` = Festigen matching the city `LIT_THRESHOLD`/engine `masteryLabel`
  bands, `>= 0.8` = Gemischt matching the `mastery() >= 0.8` "mastered" bar). Pure derived function,
  **no new state**: both call sites already compute the ratio.
- **Fortschritt theme grid** (`features/analytics/Analytics.tsx`, "Beherrschung nach Thema" card):
  each theme row now shows a phase `Badge` (muted/accent/success per phase) next to the theme title.
- **City-building tap** (`components/city/CityStrip.tsx`): the accessible label and hover title on
  each lit building now include the phase (e.g. "Büro · Festigen"), alongside the existing percentage.
- **Gates (4.6):** all green — `build`, `typecheck`, `lint` (0 errors), `lint:content`, `test:unit`
  **62** (unchanged, no new test surface for a pure derived-label helper), `test:srs` 323 checks,
  `test:pronounce` 26 checks, `check:bundle` main chunk **79.0 kB**.

**Next step:** Phase 4 (typed recall + authentic input + progression visibility) is done. The
founder's standing priority call stands: pivot to the game plan G1 (`docs/plans/GAME_IMPLEMENTATION_PLAN.md`,
still PROPOSED), whose formCloze / dialogue-battle scenes build on 4.1's tolerant typed grading, 4.2's
typed-block pattern, and 4.4's authentic-input block pattern; or pick the next item off the founder
backlog in `docs/PROJECT_REFERENCE.md`.

---


**Handoff after session 71 (2026-07-06). UX redesign audit + gap analysis, plus two follow-up fixes.**
A code-level audit of redesign Phases 1–4 (report: `docs/plans/UX_AUDIT_2026-07-06.md`) verified every
task against the real code (not the docs) and re-ran all gates green. Verdict: faithfully implemented,
locked invariants intact (persist migration, FSRS latency, mobile bar + iOS fixes, eager-bundle budget,
no em dashes). Two gaps were found and fixed the same session:
- **Eager-bundle de-risk:** `src/features/dashboard/intentCards.ts` statically imported `filterVocab`
  from the 245 kB vocabulary bank, used only by dead `cardMeta`/`cefrRange` helpers (kept out of the
  main chunk by tree-shaking alone). Removed the dead helpers + imports so Heute's ~78 kB eager-path
  invariant is now structural, not accidental. Main chunk unchanged (79.1 kB).
- **Quest claim moment:** the plan promised a Can-Do "claim moment"; achievement was silently passive.
  Added persisted `claimedMilestones: string[]` + `claimMilestone(id)` to `useSettingsStore` (rides
  cloudSync via the settings jsonb blob, no version bump). Fortschritt now shows a reward-gold,
  spring-in "Quest geschafft · <Thema>" card with an "Einlösen" button for any achieved-but-unclaimed
  milestone, advancing to the next win; reduced-motion honored. New `claimMilestone` idempotency test.
- **Gates:** all green — `build`, `typecheck`, `lint` (0 errors), `lint:content`, `test:unit` **63**
  (+1), `check:bundle` main chunk **79.1 kB**. Non-blocking gaps left documented in the audit report
  (word-order quiz has no FSRS latency sample; `bank`/`wohnhaus` city buildings await content packs;
  onboarding defers name/exam-date to Settings, which covers them).

**Next step:** pivot to game plan G1 (`docs/plans/GAME_IMPLEMENTATION_PLAN.md`, still PROPOSED) or pick
the next founder-backlog item in `docs/PROJECT_REFERENCE.md`.

---


**Handoff after session 71 (2026-07-06). Frontend design/brand audit is DONE (doc-only, no code
changed): `docs/plans/DESIGN_AUDIT_2026-07-06.md`.** The founder asked for a thorough audit of the
frontend design, brand and visual assets with weaknesses + top 5 recommendations. Findings in short:
the token/component architecture is strong (keep it), but (A) there are **zero social link-preview
assets** (no `og:`/`twitter:` meta, no OG image, no canonical URL), (B) **five parallel accent
systems** (tokens, nav hexes, theme gradients, hub/intent gradients, building hexes; three
near-identical brand indigos `#5d52e0`/`#5b5be6`/`#6366f1`), (C) a **wrong-theme boot flash** for
light-mode users (`index.html` hardcodes `class="dark"` + dark-only `theme-color`, default themeMode
is `system`), (D) **unregulated Denglish** copy (CTA labels disagree, "a Arztbesuch", `lang="en"` vs
manifest `lang: "de"`), and (E) **contrast failures** (`text-warning` ~2.2:1 on light) plus
button-instead-of-link navigation on the landing page. The report's top-5 recommendations are ordered
by impact ÷ effort; #1 (OG/social meta + share image) is roughly an hour and the highest external
impact.

**Next step:** pick recommendations off the audit (start with #1 social meta, then #2 palette
consolidation), or continue the standing alternative: game plan G1 (`GAME_IMPLEMENTATION_PLAN.md`,
still PROPOSED). Phase 4 of the UX redesign is complete (session 70).


## Session 62 continued (2026-07-06) — condensed handoff: detailed game design drafted (v1-v3)

**Detailed game design DRAFTED: `docs/strategy/GAME_DESIGN.md`** (+ the founder-facing slide deck
`docs/strategy/GAME_DESIGN_DECK.html`), the design layer between `GAME_CONCEPT.md` (pillars) and
`GAME_IMPLEMENTATION_PLAN.md` (build). Contents: premise + character creation; the city "Neustadt"
and title "Neuland" (approved s72); the six-NPC recurring cast (Jonas, Frau Schmidt, Ayşe,
Hausmeister Krause, Frau Weber, Herr Nguyen); the core loop (map → bag loadout → scenes → loot →
FSRS recurrence); the interaction model (D/E on every line, tap→type→speak ladder, register-marked
choices, playable parody documents); conversation battles (Geduld vs Standing bars, Redemittel
moves, K-II crits, kind status effects); the bag item taxonomy; failure-is-content rules; and the
authored spine, revised to v3 the same day: **six chapters + a chosen ending / ~40 missions**
(K1 Ankommen · K2 Wohnen · K3 Geld & Papierkram · K4 Die Jobsuche · K5 Gesund & Sozial · K6 Mein
Ziel), with two founder directions of 2026-07-06: the **Im Büro office arc is the CAREER endgame
chain** in K6 (boss: der unbefristete Vertrag), not a spine chapter, and **Pfand is a real economy**
(bottles hide in scenes, the Leergutautomat return is a micro-review mini-game paying Pfandgeld for
Späti consumables; spec in `GAME_DESIGN.md` §6). Structural rule from founder review: **every
chapter ends on its boss**. Its open decisions were resolved across s72 (art + title) and s73
(chapter-1 mission list sign-off).
