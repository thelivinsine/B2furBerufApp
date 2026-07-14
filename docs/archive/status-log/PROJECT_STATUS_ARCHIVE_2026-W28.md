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
**Handoff after session 72 (2026-07-06). Pre-G1 art blessing is COMPLETE ✅: the founder BLESSED
the modern pixel style and the game's art direction is now locked (no game code, zero spend).**
Eight mockup scenes of the Anmeldung vertical slice live in `preview/game-pixel-mockups/` (all
hand-authored in code because the sandbox blocks the free asset hosts; original + license-clean,
generators committed alongside the PNGs). Founder decisions, recorded in full in
`docs/DECISIONS.md` → "Game art direction (session 72)":
- **2D pixel form approved**; the GBA-authentic styling of scenes 1–6 **rejected** as dated
  ("reminds me of the 90's"). Those scenes stay as art-form proof, not style reference.
- **`scene7-modern-hell.png` is the blessed reference** ("i love this new mock up style!"):
  muted contemporary palette, modern Bürgeramt set, soft outlines, app-language UI (rounded
  floating cards, pills, bottom sheet, brand indigo accent), crisp half-size UI pixels over the
  chunky 240x160 world. G2 pack purchases must select against this reference.
- **In-game dark mode deferred** (liked, but "a bit of a stretch because of limited budget");
  tracked as backlog #31 in `docs/PROJECT_REFERENCE.md`. v1 game scenes are light-theme only.
Doc updates shipped with the blessing: `GAME_CONCEPT.md` Visuals pillar + open questions,
`GAME_IMPLEMENTATION_PLAN.md` guardrail + founder-decision list, the mockup folder README verdict.

Late-session addition: the founder also approved the game title **"Neuland"** from the
`GAME_DESIGN.md` proposals ("neuland is good"); city "Neustadt" + NPC cast stay unobjected
proposals, chapter-1 sign-off still open (recorded in `DECISIONS.md` and `GAME_DESIGN.md` §13).

**Next step:** start game plan G1 (`docs/plans/GAME_IMPLEMENTATION_PLAN.md`: Mission/Scene schema
+ `engine/mission.ts` + lint checks first, then scene renderers and the Anmeldung mission
content), building game UI surfaces to the scene-7 style. The narrative layer for G1 is the
drafted `docs/strategy/GAME_DESIGN.md` (see the next handoff below).

---

## Session 73 (2026-07-06) — Game phase G1 handoff (archived from PROJECT_STATUS in s75)

**Handoff after session 73 (2026-07-06). Game phase G1 SHIPPED ✅: the Neuland mission engine and
the Anmeldung vertical slice are live behind `/welt` (Beta).** What exists now:
- **Schema + runner:** `src/types/game.ts` (Mission/Scene closed unions: cutscene, websiteParody,
  loadout, listening, dialogueBattle, formCloze; NPC/key-item/chapter registries; every union
  mirrored in the linter) and `engine/mission.ts` (pure immutable runner emitting effects the
  player applies to the real stores: XP via `addXp`, retrieval grades via `reviewVocab` FSRS,
  Redemittel practice, key items). Game state (`missionsDone`, `keyItems`) lives in
  `useProgressStore`, **local-only for now**: cloudSync's `progress` table has a fixed column set,
  so syncing game state needs a G2 Supabase migration (backlog).
- **Lint gates:** `lint-content.mjs` now loads `src/data/missions.ts` and enforces mission graph
  integrity (routing resolves + reachable win, battle node graphs, content-bank id references,
  key-item obtainability, acyclic mission dependencies). `tests/mission.test.ts` covers the runner
  (win path, fetch-quest loss, bar drain, loadout grading).
- **Renderers:** `src/features/welt/` (stage atoms + 6 scene views + MissionPlayer + Welt hub),
  styled to the blessed scene-7 reference: light-theme-only game cards, pixel backdrops
  (code-authored placeholders in `src/features/welt/assets/`, generator
  `preview/game-pixel-mockups/welt_assets.py`; G2 buys packs), focus mode hides chrome on `/welt`.
  Entry: Anwenden hub "Neuland (Beta)" card + `/welt` deep link.
- **Content:** the chapter-1 boss mission `m_kap1_anmeldung` (9 scenes: booking parody → loadout →
  waiting room → Frau Schmidt battle → Anmeldeformular → victory; loses route through a scaffolded
  retry that grants the missing papers). Two vocab adds (`v_mietvertrag`,
  `v_wohnungsgeberbestaetigung`), provenance rows for all three new ids (1,124 total).
  **Chapter-1 mission list (1.1–1.6) founder-approved this session**; the Anmeldung German awaits
  the normal founder verify pass (provenance `draft`).
- Verified end-to-end in the sandbox browser (full mission playthrough, zero console errors); all
  gates green (typecheck, eslint, lint:content, 90+ unit tests, SRS/pronounce vectors, bundle
  79.5 kB main / game in its own ~53 kB lazy chunk).
- **Founder playtest feedback applied same-session, two rounds.** Round 1 ("image unclear, too
  much text"): where-am-I chips on every stage, big text cuts per scene. Round 2 ("not engaged
  enough, bar bug, more variety, finish should matter"): the loadout is now **walk-and-pick**
  (documents lie in the room, the player sprite walks to each, the bag is the exit), the battle
  bar bug is fixed (Geduld delta on Schmidt's card, Mut delta on the player's), Mut starts at
  60/100 so every move visibly moves both bars, the two Konjunktiv-II crits are **typed cloze
  challenges** (`BattleMove.cloze`), and a victory bonus scales with the remaining bars
  (`BATTLE_FINISH_BONUS`). Recorded for G2 in `GAME_DESIGN.md` §4/§10 + backlog #32a/#32b:
  **waiting-as-gameplay** and **Print-Prop-Quests** (Werbung/Anzeige/Flyer mini-exercises).
- The game schema is aligned to **design v3** (PR #336, merged from a parallel session mid-build:
  six-chapter spine, Im Büro inside the Mein Ziel career chain, Pfand economy): `ChapterId`, the
  `chapters` registry and the linter mirror all carry the six chapters. Kapitel 1 was untouched
  by v3, so the approved mission list stood. The Pfand economy + Jonas wild card are G2 systems.

**Model for G2 (founder decision s73, saving Fable budget): run G2 on Opus 4.8 / Sonnet 5,
NOT Fable.** The Fable-tier work (schema architecture, art direction, chapter-1 narrative specs,
Anmeldung content) is done and locked; per the plan's model map, Opus 4.8 handles the
FSRS-recurrence engine work, Sonnet 5 drafts missions 1.1-1.5 against the `GAME_DESIGN.md`
scene-by-scene specs, Haiku ships. The mission linter + the 81-test runner suite are the safety
net. Optional Fable spend later: one tone/humor pass over the finished chapter-1 German.


**Handoff after session 74 (2026-07-06). Playtest round 3 + activity research SHIPPED ✅;
G2 is HALTED awaiting the founder's explicit go.** What happened:
- **Founder feedback round 3 applied to the G1 slice** (PR #343, plus live hotfixes #344/#345):
  1. **The bag** is with the player at all times (HUD slot with count, pulses on demands; popup
     drawn as the backpack: handle, leather dome, zip band). 2. **English is a game resource**:
  the always-on E toggle is gone; the Wörterbuch bag item has 3 charges/mission, one charge
  reveals English for the current scene (`dictUses`/`useDictionary`). 3. **Bag-answered
  demands**: battle `ask` nodes (engine `handItem`/`admitMissing`; wrong item = Geduld cost +
  deadpan line; conceding = fetch-quest branch); both Schmidt document demands converted, the
  remaining option lists differentiated (visible costs, reaction lines, a bluff path, no crit
  telegraphing). 5. **World scale locked** in `welt_assets.py` (adult 28-32 px, chair ~19 px;
  taller player sprite, `proportions-check.png`). 6. **Full-screen pixel UI**: fixed game layer,
  edge-to-edge stage, all surfaces pixel-styled (outlined panels, hard shadows, name plates).
  Battle composition rule (founder, #344/#345): opponent + bar top band, player + Mut bar bottom
  band, ONE human scale (no foreground zoom). All in `DECISIONS.md` "Game interaction &
  pixel-UI rules"; linter knows `ask`/`dictUses`; 85 unit tests; playthrough-verified.
- **Feedback item 4, the multi-agent research, is DONE** (PR #346): four expert personas ran in
  parallel as subagents (DaF-Didaktikerin/examiner, veteran game designer, German culture
  expert, market researcher with a live web sweep of 11 shipped language games), two on Opus 4.8
  and two on Sonnet 5 per the s73 budget decision, synthesized into
  **`docs/strategy/MISSION_ACTIVITY_RESEARCH.md`** (20-entry activity catalog with engine fit,
  six meaningful-choice levers, error-handling rules, market evidence, ranked G2 adoption order)
  and **`docs/strategy/CHAPTER1_GAMEPLAY_DECK.html`** (two-part founder deck: research outcomes
  + complete chapter-1 scripts: opening, character creation with language-level selection, cast,
  help systems, missions 1.1-1.6 scene by scene, environments, ramp). Also delivered as an
  Artifact. The COMPLETE verbatim persona briefs + reports are archived in
  **`docs/strategy/MISSION_ACTIVITY_IDEATION_TRANSCRIPTS.md`** (founder request).
  **New mission exercises must draft against the research catalog.**
- **G2 STATUS: HALTED by the founder ("stop before proceeding with g2. Wait for my go").** G2
  authoring had just begun when the stop arrived; the partial draft is PARKED as the **tip commit
  of the session branch** `claude/neuland-g1-g2-feedback-wkf28n` (message prefix `wip(G2, PARKED,
  DO NOT MERGE)`; UNMERGED, deliberately NOT on `main`). To resume after the founder's go:
  `git checkout claude/neuland-g1-g2-feedback-wkf28n` and continue from that commit (or a fresh
  branch cherry-picking it). It contains: three new scene settings (terminal/laden/supermarkt)
  with a backdrop generator, scene `label` override, `doc-pass.png`, four chapter-1 NPCs, three
  key items (ki_reisepass/ki_fahrschein/ki_sim_vertrag), and draft mission data for 1.1 + 1.2.
  Still open when resumed: missions 1.3-1.5, provenance rows, boss `requiresMissions` gating +
  replay-unlock in Welt.tsx (drafted), asset regeneration (`python3 welt_assets.py`), test
  updates, all gates, a playthrough. **Do not merge or continue the WIP without the founder's go.**
- **Plan position** (`GAME_IMPLEMENTATION_PLAN.md`): G0 ✅ (s63-66) · G1 ✅ shipped s73 with
  three playtest rounds applied (s73 x2, s74 x1 + hotfixes) · s74 research ✅ (feeds G2) ·
  **G2 ⏸ awaiting founder go** (scope when resumed: missions 1.1-1.5 per the deck scripts,
  recurring NPCs, licensed pixel packs vs scene 7 + scale table, FSRS-driven recurrence,
  Supabase migration for game-state sync, then the 5-10-learner playtest gate) · G3/G4 not
  started. Model guidance for G2 stands: Opus 4.8 / Sonnet 5 / Haiku, not Fable.

---

**Handoff after session 75 (2026-07-07). FOUR daily-life content packs SHIPPED ✅ (Arzt PR #349,
Wohnen+Bank PR #350, Bildung to follow); all six domains now populated; G2 still HALTED awaiting
the founder's explicit go.** What happened:
- The founder chose **content expansion** over resuming/tweaking the game, then approved building
  the roadmap daily-life packs plus filling the last empty domain: **`arzt` (Arzt & Gesundheit)**,
  **`wohnen` (Wohnen & Zuhause)**, **`bank` (Bank & Finanzen)**, and **`bildung` (Bildung &
  Sprache)**. Each is a full theme built on the `behoerde`/`arzt` template. Themes went 11 → 15,
  and `bildung` fills the previously-empty `bildung` domain (rolls into the `pruefungshalle` city
  building via domain rollup, so no building-registry change was needed for it).
- **Per-pack contents (each):** `ThemeId` + linter `THEME_IDS`; a lucide icon (Stethoscope / Home
  / Banknote); an ExamTheme with 4 sub-themes; a writing prompt; **~28 vocab**, **~36
  collocations**, **3 Can-Do milestones**, **2 reading texts** (6 checks), **1 branching
  dialogue**, and full provenance rows (all `draft`, founder review pending). No em dashes.
  Sub-themes: arzt = termin/symptome/behandlung/versicherung; wohnen = suche/vertrag/nebenkosten/
  probleme; bank = konto/zahlung/karte/finanzen; bildung = sprachkurs/anerkennung/pruefung/
  weiterbildung. Domains: arzt → `gesundheit`, wohnen+bank → `alltag` (alongside behoerde),
  bildung → `bildung`. All six domains are now populated.
- **City strip wired (`components/city/mastery.ts` + `domain-buildings.tsx`):** the placeholder
  `bank` and `wohnhaus` domain buildings now own the `bank` and `wohnen` themes (`themeIds`); arzt
  rolls into `arztpraxis` via the `gesundheit` domain. `tests/city-mastery.test.ts` updated (the
  old "future packs empty" assertion became a "packs wired" assertion). Every vocab word still maps
  to exactly one building.
- **Gates all green (final):** `pnpm lint:content` (15 themes, 642 vocab, 540 collocations, 37
  can-do, 18 texts, 1,408 provenance), `pnpm build`, `pnpm check:bundle` (main 79.5 kB / 400 kB),
  `pnpm test:unit` (85 passed), `pnpm lint` (0 errors, the usual 32 react-hooks warnings). Themes
  surface automatically everywhere that iterates the `themes` registry.
- **Status:** Arzt shipped via **PR #349**; Wohnen + Bank via **PR #350** (both squash-merged).
  Bildung built on `claude/whats-next-l61ca3` and ready to ship in a third PR.
- **Obvious next content moves:** with all six domains populated, the remaining depth work is
  per-theme (exam sets for the daily-life themes, more dialogues/texts, sub-theme splits on the
  remaining flat themes) or the founder verify pass on all the new `draft` German (arzt/wohnen/
  bank/bildung vocab, collocations, texts, dialogues, can-do).

---

**Handoff after session 76 (2026-07-07). DATA STRATEGY authored + Layer 2 fact-check spike SHIPPED ✅.**
What happened:
- **`docs/strategy/DATA_STRATEGY.md` (new, v1.0)** answers the founder's ask: keep content
  source-verified, audit-ready, and automated *without a native-speaker reviewer*. Centerpiece is a
  six-layer **verification ladder** (structural → provenance → factual-match → linguistic → AI jury →
  rationed human audit) that replaces one native reviewer with a panel of independent sources + models
  (agreement = confidence, disagreement = the only thing a human sees). Adds a per-item `verification`
  trust model extending `ProvenanceEntry`, a CI-vs-scheduled automation split, a cost envelope, a
  decay/re-verification cadence, an EU AI Act Article 10 mapping, and a "scope: existing backlog +
  future content" section. Cross-links `DATA_GOVERNANCE.md` (the legal/licensing layer) both ways.
  Shipped via **PR #352** (squash-merged) plus a scope-clarification commit.
- **Layer 2 fact-check spike SHIPPED** (the highest-ROI rung, built as a validation spike):
  - `pnpm build:dict-subset` (`scripts/build-dict-subset.mjs`) fetches the German morphology lexicon
    **`german-words-dict`** (Apache-2.0, derived from LanguageTool's `german-pos-dict`, CC-BY-SA-4.0 —
    already on our allowlist) from npm, filters to our noun lemmas, writes a 12 KB committed subset
    (`scripts/vendor/german-words-subset.json`). Fully offline thereafter.
  - `pnpm verify:facts` (`scripts/verify-facts.mjs`) checks every noun's der/die/das + plural against
    the lexicon; bucketed report → `docs/reports/verify-facts-report.md`. **Report tool, NOT a CI gate.**
  - **Result over 489 nouns:** 224 genders + 174 plurals machine-verified with zero human effort; 3
    plurale-tantum headwords auto-detected/skipped; **47% coverage** (compounds absent from the base
    lexicon).
  - **Key finding: a single lexicon cannot gate.** All 4 remaining disagreements were hand-checked as
    lexicon-side issues (`der Husten` is correct; `Risiken`/`Visa` are the standard plurals), so
    disagreements are *review signals*, not proven bugs. This validated the strategy's multi-source
    thesis.
  - **Next step (scoped, not built):** add a **second oracle** (Wiktionary/kaikki, runs in CI where
    network is open) so agreement gates and coverage rises past 47%, plus a compound head-noun gender
    rule. Wiktionary/kaikki are blocked by this environment's network policy (npm registry is the only
    allowed host), so the richer oracle must run in CI / an unrestricted machine.
- **No content added**, so the content counts were unchanged. `pnpm lint:content` green.
- **Branch:** `claude/app-data-strategy-oshuhs`. Shipped via PR #352 (strategy) + the fact-check spike PR.

---

**Handoff after session 77 (2026-07-07). DATA STRATEGY Phase A COMPLETED: Layer 2 is now a real
two-oracle CI gate ✅.** This finishes the v1.1 spike's open item (a second oracle so agreement can
gate). What happened:
- **Second oracle added.** `pnpm build:nouns-subset` (`scripts/build-nouns-subset.mjs`) fetches
  **`german-nouns`** from **PyPI** (~100k nouns compiled from German Wiktionary, CC-BY-SA-4.0 — already
  allowlisted), filters to our lemmas, writes a 25 KB committed subset
  (`scripts/vendor/german-nouns-subset.json`). This is the "Wiktionary route" the strategy wanted,
  routed through an allowed host (kaikki/de.wiktionary are still 403-blocked by the network policy).
  It is an *independent* lineage from oracle A (LanguageTool) and is multi-variant aware. Convenience:
  `pnpm build:oracles` builds both.
- **`verify:facts` rewritten to two-oracle voting + a real gate.** An error is reported **only when
  both oracles cover a fact directly, both reject our value, AND agree on the same correction** (the
  `GATE` bucket → fails CI). A lone or self-conflicting disagreement is a `REVIEW` signal, never a
  build failure. Added a compound **head-noun gender fallback** ("der Behördentermin" ← "der Termin";
  gender only, head votes are gate-excluded as heuristic).
- **Result over 489 nouns: coverage 47% → 97%** (474/489), **458 articles + 260 plurals verified**
  (221/167 by *both* oracles), **10** plurale-tantum auto-skipped, **0 two-oracle-confirmed errors**.
  The 6 remaining review signals were all hand-checked as valid variants or the head-heuristic hitting
  a paired feminine form (Ansprechpartner**in**), not bugs. The old 4 "disagreements" (Husten, Rollout,
  Risiko, Visum) are all resolved: oracle B attests our forms.
- **Wired into CI.** `pnpm verify:facts` now runs in `validate.yml` as an **offline gate** (reads the
  committed vendored subsets; no network in CI). Regenerate subsets with `pnpm build:oracles` when the
  vocab bank gains nouns.
- **Docs:** `DATA_STRATEGY.md` → **v1.2** (changelog + Layer 2 "SHIPPED" note),
  `docs/reports/verify-facts-report.md` regenerated. **No content/src changed**; counts below unchanged.
  `pnpm lint:content` + `pnpm verify:facts` green.
- **Next Layer-2 polish (optional):** 15 lemmas are covered by neither oracle (rare compounds/acronyms)
  and 43 more have a gender but no oracle plural to compare; a third source or manual pass could close
  them. Otherwise the ladder's next rung is **Phase B (Layer 3,
  LanguageTool sentence grammar)** and **Phase C (the `verification` trust block on `ProvenanceEntry`)**.
- **Branch:** `claude/data-strategy-plan-78r0jq`.

## Session 78 (2026-07-07) — DATA STRATEGY Phase B + Phase C SHIPPED ✅

(Layer 3 linguistic engine, then the per-item trust model). Two PRs. **Phase C (the trust model):**
- **`Verification` block on `ProvenanceEntry`** (`src/types/index.ts`): `tier` (unverified → structural →
  provenance → facts → linguistic → jury → human), `checks[]`, `confidence`, `last_verified`, plus the
  `VerificationTier`/`Layer`/`Result` enums. Optional/additive.
- **`pnpm build:verification`** (`scripts/build-verification.mjs`) composes the Layer 2 fact verdicts +
  Layer 3 grammar (via a new `docs/reports/verify-grammar.json` sidecar) + CEFR results into the
  **generated** `src/data/verification.ts`, keyed by content_id. Every record shares one sweep-date const
  `D`, so a re-run only diffs items whose tier moved. To avoid re-running LanguageTool, it reads the
  grammar sidecar and recomputes facts/CEFR from the vendored subsets (the `verify-facts`/`verify-cefr`
  compute helpers are now exported + their `main()` guarded).
- **`/sources` surfaces it** (`src/features/legal/Sources.tsx`): a per-item **tier badge + confidence**
  and a tier-distribution summary section; an inline `verification` on a row wins over the generated map.
- **`lint:content`** validates the tier/layer/result enums (closed-enum rule) and prints the tier
  distribution (records, does not gate).
- **First sweep over 1,408 items: 25 human · 1,266 linguistic · 1 facts · 116 provenance** (1,292
  machine-attested for facts or language, up from 25 human-verified). `DATA_STRATEGY.md` → **v1.4**.
- **Only the one Phase-B typo touched content**; `verification.ts` is generated (404 KB, lazy `/sources`
  chunk; main chunk stays 79.5 kB). Gates green: `lint:content` (+ tier summary), `verify:facts`, `build`,
  `lint`, `test:unit/srs/pronounce`, `check:bundle`.
- **Next rung:** Phase D (the AI jury, Layer 4) + golden set — the first paid rung (LLM tokens + ~150
  human-labeled calibration items). It adds the `jury` tier on top of what Phase C now records.

**Phase B (Layer 3, the offline linguistic engine ✅, warn-only reports, not gates).** What happened:
- **Grammar/spelling over every sentence.** `pnpm verify:grammar` (`scripts/verify-grammar.mjs` + a
  Java runner `scripts/lt/LtCheck.java`) runs **LanguageTool 6.8 `language-de`** over **2,315 German
  sentences** — vocab examples, collocation examples, dialogue lines + option texts + model answers +
  prompts, reading-text bodies + comprehension questions, and redemittel phrases + examples. Findings
  bucket by LanguageTool's own issue type → `docs/reports/verify-grammar-report.md`. **Result: 0
  grammar/agreement errors, 98.8% of sentences clean.** It caught **one real typo** (headword
  `v_kulanzloesung` was "Kulanslösung", corrected to "Kulanzlösung" in all 3 places); the rest are
  domain proper nouns (fictitious names in texts) and idiomatic hits. Warn-only by design (LanguageTool
  over-flags idiomatic B2), so NOT a merge gate.
- **LanguageTool is fetched, not vendored.** It is ~69 MB across 88 jars, so `pnpm build:languagetool`
  (`scripts/build-languagetool.mjs`) resolves it **pinned (6.8) from Maven Central** — reachable through
  the network policy, unlike the LT download host / kaikki / de.wiktionary (all 403). It runs fully
  offline after resolve. `scripts/vendor/lt-lib/` is gitignored.
- **CEFR plausibility tripwire.** `pnpm verify:cefr` (`scripts/verify-cefr.mjs`) compares each item's
  claimed `cefr` to a measured difficulty from **word frequency** (`wordfreq` German Zipf, vendored
  `scripts/vendor/german-frequency-subset.json` built by `pnpm build:frequency-subset`) + **sentence
  complexity**. **Honest calibration:** German unigram frequency is a weak grader (compounds are
  elementary yet rare), so it flags only the reliable direction — a **common word carrying an advanced
  label** — and only for vocabulary. **Result: 6 FLAG + 72 WATCH of 1,182 items** (the 6 FLAGs are
  sustainability-theme words like *die Umwelt* / *vermeiden* tagged B2.2 despite B1 frequency, worth a
  glance); everything else is caveated info. Report: `docs/reports/verify-cefr-report.md`.
- **Scheduled, not gated.** `.github/workflows/verify-sentences.yml` (monthly + dispatch) regenerates
  both reports and uploads them as artifacts (no auto-commit → no deploy churn). `validate.yml` is
  untouched; no new per-PR gate. `DATA_STRATEGY.md` → **v1.3**. **Branch:** `claude/data-strategy-phase-b-wiw3mu`.

---

**Handoff after session 79 (2026-07-07). Data-strategy Q&A + backlog capture (no code).** The founder
asked how the data strategy handles three things and said "we'll come back to these tasks later." Answered
in chat and parked as backlog items (`docs/PROJECT_REFERENCE.md` #33–#35):
- **#33 — human-in-the-loop tracking + exception-queue tooling.** The reviewer loop from `DATA_STRATEGY.md`
  §3 Layers 4–5: generate the committed `docs/reports/verification-queue.md` from the machine sweeps and
  wire it to the founder-only `provenance_reviews` table (migration 0004) + `/sources` admin overlay so a
  reviewer clears the queue and flips `review_status → verified`. Builds on Phase A/B flags now; fully
  populated once Phase D (jury) lands.
- **#34 — auditor handoff package.** A repeatable one-pager/export that packages the reproducible per-item
  chain (source + license snapshot + fact/grammar/jury verdicts w/ tool+version+date + human sign-off) for
  an EU AI Act Art. 10 / ISO 42001 examiner; composes the existing `/sources` page, register CSV export,
  and `verify-*` reports. Doc-only, cheap.
- **#35 — scale-to-100x database plan.** Two planes: content stays CDN-cheap (files → Supabase content
  table only if the *library* grows 100x); the user plane is standard Postgres scaling (Supavisor pooling →
  indexed/index-friendly RLS → partition/archive `ai_usage`+writing → replicas) plus the real lever,
  **server-side metering/capping of AI-writing-coach token spend**, and clearing the `progress` fixed-column
  upsert debt (#32). Deliverable is a phased migration checklist.

Nothing shipped that session; the next rung on the built roadmap is still **Phase D (the AI jury, Layer 4)
+ golden set**.

---

**Handoff after session 80 (2026-07-07). Top-value tasks + daily-life depth + SEO, 4 PRs shipped to
`main` (branch `claude/top-value-tasks-842u60`).** PRs this session: **#360** (Art. 6(3) risk assessment +
SEO meta/OG/JSON-LD/robots/sitemap + landing FAQ + 4 reading texts), **#361** (5 daily-life exam sets),
**#362** (4 second daily-life dialogues), **#363** (1200×630 OG share image). The founder asked for the
top-3 value-add tasks from the docs, then "work on all three now", then kept going with "continue" /
"work on seo task". Delivered, all gates green:
1. **EU AI Act #21 fully closed.** The Art. 50 transparency *copy* was already live (WritingHub
   point-of-use notice + "KI-generierte Rückmeldung" label + PrivacyPolicy DE/EN AI section). The missing
   piece, the documented **Article 6(3) risk assessment**, is now on file:
   **`docs/strategy/AI_ACT_RISK_ASSESSMENT.md`** (v1.0). Assesses Genauly as **not high-risk /
   limited-risk**, relies on the Art. 6(3) narrow-task derogation, and flags **profiling** as the single
   point counsel must confirm (#15); lists the flip conditions (profiling creep, institutional gating,
   summative assessment) and maps our provenance work to Art. 10.
2. **SEO + landing depth (#10/#11/#12).** `index.html` gained Open Graph + Twitter-card meta, canonical,
   keywords/author, and two **JSON-LD** graphs (WebApplication + FAQPage; both validated, CSP-safe as
   non-executable data blocks). Added **`public/robots.txt`** + **`public/sitemap.xml`** (5 public routes).
   The landing page gained a **"Wie funktioniert Genauly?"** 3-step strip and a **6-item FAQ**
   (`<details>` accordion mirroring the JSON-LD).
3. **Daily-life content deepened.** +4 `ReadingText`s (18→**22**, checks 54→**66**), one per newest
   daily-life theme, each covering a **new sub-theme** with a **new kind**: `tx_arzt_merkblatt_antibiotika`
   (announcement, arzt.behandlung), `tx_wohnen_aushang_heizung` (announcement, wohnen.probleme),
   `tx_bank_letter_lastschrift` (letter, bank.zahlung), `tx_bildung_voicemail_pruefung` (voicemail,
   bildung.pruefung). +4 provenance rows (all `draft`, founder review pending), 1408→**1412**.

**Gates green:** `lint:content` (22 texts / 66 checks / 1412 rows), `build`, `check:bundle` (83 kB),
`lint` (0 errors), `test:unit` (85 pass). **Follow-ups:** (a) the 4 new texts read as `unverified` tier
until the next `build:verification` sweep (needs the grammar sidecar; deferred, not a gate); (b) a proper
1200×630 OG image would beat the square PWA icon now referenced; (c) founder still verifies live SEO/FAQ
and reviews the draft German. `#21` marked closed in `PROJECT_REFERENCE.md`. **All merged live via PR #360.**

**Follow-on (same session 80, after the founder confirmed live and picked "deepen daily-life content"):**
added **5 exam sets** (`examSets` 10→**15**), one per daily-life theme (behoerde/arzt/wohnen/bank/bildung),
so **every life domain now has an exam-prep speaking simulation** (previously workplace-only). Each is a
telc-style **joint-planning** task referencing the theme's existing scenario (`ex_behoerde`→sc_anmeldung,
`ex_arzt`→sc_arztbesuch, `ex_wohnen`→sc_wohnungsbesichtigung, `ex_bank`→sc_kontoeroeffnung,
`ex_bildung`→sc_sprachkursberatung), reusing `sharedRubric`. +5 `exam_set` provenance rows (draft),
1412→**1417**. `ExamHub` maps over all sets with no theme filter, so they surface immediately. Gates green
again (`lint:content` 15 examSets / 1417 rows, `build`, `check:bundle` 83 kB, `test:unit` 85).

Then, continuing on the founder's "continue", added a **2nd branching dialogue per newest daily-life theme**
(`dialogues` 16→**20**, all level 2, covering a new situation than the L1 scenario): `sc_apotheke` (arzt,
Rezept in der Apotheke einlösen), `sc_wohnungsmangel` (wohnen, Heizungsmangel dem Vermieter melden),
`sc_kartesperren` (bank, verlorene Karte sperren lassen), `sc_pruefungsanmeldung` (bildung, zur
telc-Prüfung anmelden). Each is a 5-node graph (4 partner turns + narrator end, 3 scored options each)
matching the existing schema; lint's dialogue graph-integrity checks (start/next/reachability/no-orphans)
pass. +4 `dialogue` provenance rows (draft), 1417→**1421**. Dialogues load in the lazy `dialogues` chunk,
so the main chunk stays 83 kB. Gates green (`lint:content` 20 dialogues / 1421 rows, `build`,
`check:bundle`, `test:unit` 85). **Remaining daily-life depth:** clearing the draft Can-Do/text/exam/dialogue
review queue is founder sign-off work; further optional depth is more vocab/collocations per sub-theme.

Then, on "work on the seo task", closed the OG-image follow-up: added a real **1200×630 share card**
`public/og-image.png` (brand card: logo, "Break through the B1–B2 plateau", domain pills, genauly.de). It is
generated from `preview/og-image/make-og.mjs` (writes a self-contained HTML card, screenshotted with the
pre-installed Chromium, since the repo has no headless-render dep). `index.html` now points `og:image` +
`twitter:image` at it, adds `og:image:width/height/type`, and upgrades the card to
`twitter:card=summary_large_image` (was the square PWA icon + `summary`). Build green, image ships to
`dist/og-image.png`. **SEO/growth now covered:** meta/OG/Twitter/canonical/JSON-LD (WebApplication+FAQPage),
robots.txt, sitemap.xml, landing FAQ + how-it-works, and the share card. Remaining growth levers are
non-code (real product screenshots / testimonials for social proof) or a separate lane (pricing, Phase D).

---

**Handoff after session 81 (2026-07-08). G2 kicked off: founder greenlit the game build (zero-spend,
incremental, playtest-first), and Neuland Kapitel 1 is now COMPLETE end-to-end.** After a Q&A on the game
roadmap and the G2 cost boundary (only paid items are optional pixel-art packs + Aseprite, ~30–60 EUR
one-time; free path exists), the founder said go, then "go ahead with 1.3 to 1.5". Shipped in two PRs:
- **PR #365 (increment 1):** ported the parked drafts **1.1 "Willkommen in Neuland"** (airport arrival,
  passport-control battle, station-announcement listening, meet Jonas) and **1.2 "Der Fahrkarten-Automat"**
  (ticket-machine battle, Zone-AB lesson) onto current `main`. Did NOT rebase the parked branch
  `claude/neuland-g1-g2-feedback-wkf28n` (189 files, badly diverged since s74); extracted only the two
  missions and re-authored against the current schema.
- **Increment 2:** authored fresh **1.3 "Die SIM-Karte"** (phone-shop upsell battle vs Milo, resist the
  Vertrag, tariff-page parody, `ki_sim_vertrag`), **1.4 "Der erste Einkauf"** (Leergutautomat/Pfand parody
  + the legendary checkout-speed battle vs the Kassiererin, `sustainability`-theme via the recycling angle),
  and **1.5 "Ein Dach über dem Kopf"** (landlord Herr Brandt polite-register battle + the Wohnungsgeberbestätigung
  form-cloze, grants `ki_wohnungsgeberbestaetigung`, sets up the boss's document chain).
- **Schema:** two small contained additions across the session, a `terminal` setting (airport/station) and a
  `laden` setting (shop), plus an optional per-scene `label` caption override, all mirrored in
  `lint-content.mjs` + threaded through the renderers. Missions themselves stay pure data. Added NPCs
  `npc_beamter`/`npc_automat`/`npc_milo`/`npc_kassiererin`/`npc_herr_brandt`, key items
  `ki_reisepass`/`ki_fahrschein`/`ki_sim_vertrag`, 5 provenance rows (draft).
- **1.1–1.5 chain** via `requiresMissions` (1.2→1.3→1.4→1.5). The **boss (1.6) is deliberately left
  ungated** so the founder can jump straight to it for playtesting (a `tests/mission.test.ts` fixture pins
  this; do not gate the boss). Every mission has a scaffolded-retry lose path (failure-as-content, no lockout).
- **Gates green:** `lint:content` (6 missions / 35 scenes / 11 NPCs / 7 key items / 1426 rows), `build`,
  `check:bundle` (83 kB, game stays lazy), `test:unit` (85), `lint` (0 errors).

## Session 82 (2026-07-08) — condensed handoff

**Handoff after session 82 (2026-07-08). Neuland game-visuals fix (branch `claude/missing-game-visuals-qcmde6`).**
The founder sent screenshots of the game (`/welt`) showing "no game visuals": the Willkommen passport battle
and the Fahrkarten-Automat cutscene rendered over a blank beige stage. **Root cause:** `SETTING_ART` in
`src/features/welt/stage.tsx` mapped `terminal` and `laden` to `null`, so the two most-used Chapter-1
settings (8 scenes each, 16 total) had no backdrop. G2's licensed pixel-art packs were still pending, and
the interim left those stages blank rather than placeholder-filled.
- **Fix (PR #368, squash-merged):** authored two backdrops in `preview/game-pixel-mockups/welt_assets.py`
  in the blessed scene-7 pixel language, a new polished-tile floor helper for public spaces: **`terminal`**
  (transit hall: split-flap departure board, passport/service counter under the battle-opponent spot,
  self-service ticket machine, direction sign) and **`laden`** (shop: stocked product shelves, checkout
  counter with register + card terminal, sale poster). Regenerated `terminal.png`/`laden.png`, wired both
  into `SETTING_ART`. `website` stays `null` on purpose (`WebsiteView` draws its own browser chrome).
- **Gates green:** `pnpm build`, `check:bundle` (83 kB, game stays lazy). Founder confirmed the deploy
  rendered correctly (screenshot of the Fahrkarten-Automat with the transit-hall backdrop).
- **Follow-up Q&A (no code):** clarified the roadmap, walking is G3 (Phaser overworld, playtest-gated), the
  battle scenes are staged React tableaux by design (not walkable); only the loadout scene walks today. G2
  is **in progress**, not complete.
- **Founder decision, G2 build order reshuffled (variety before plumbing):** the founder flagged that every
  mission plays as cutscene → battle → cutscene (all 6 missions have exactly one dialogueBattle, so the
  Geduld/Mut bars appear every time and the boss stops feeling special). Approved re-sequencing the
  remaining G2 rungs so playtesters see a varied chapter: **(1) hotspot tappable-stage layer, (2)
  Keypad/Automat scene kind + re-skin mission 1.2 (and the 1.4 Leergut beat), (3) type-under-timer for the
  1.4 checkout, then (4) recurring-mission composer, (5) fetch-quest loop, (6) Supabase game-state
  migration.** Nothing cut, same total work. Full rationale + catalog references recorded in
  `GAME_IMPLEMENTATION_PLAN.md` (G2 status block). **Next session starts at rung 1** (plan-first; the
  activity specs are in `MISSION_ACTIVITY_RESEARCH.md` §2).
- **Founder decision, playtest gate moved to the END of the full build:** the founder's playtest crowd is
  B2 learners, and Kapitel 1 is B1.1–B1.2; an early external test would bore them on the easiest content.
  Decision (assistant recommended a middle path, founder chose the full build knowingly): **complete G2 +
  author Kapitel 2–6 + build the G3 walkable city BEFORE the 5–10-learner external playtest.** Risk
  management: founder stays the internal per-chapter tester (each chapter played on their phone before the
  next is authored), content before engine (all chapters before the Phaser city), zero-spend rule holds,
  and a **chapter-select / start-at-your-level entry** joins the build list so B2 testers can skip the easy
  opening. Both decisions recorded in `GAME_IMPLEMENTATION_PLAN.md` (G2 status block + G3 gating note).
  **The long road, in order:** G2 variety rungs 1–3 → Kapitel 2 (Wohnen) → Kapitel 3–6 (each
  founder-tested) → G2 plumbing (composer, fetch-quest, Supabase migration) interleaved as needed →
  chapter-select entry → G3 city → external B2 playtest.

---

## Session 83 handoff (2026-07-08) — G2 variety rungs 1–2 SHIPPED (branch `claude/g2-variety-work-0t6c9a`)

**Rung 2 (PR #375): the `automat` (Keypad/Automat) scene kind (activity catalog #8).** A step-by-step
rendered machine: the player reads the screen and presses the right key; a correct key advances the
machine, a wrong key only buzzes (infinite patience, no bar to drain, no lockout). A machine finally
feels like a machine instead of a conversation with a face.
- **Missions stay data, not code.** `types/game.ts`: `AutomatKey`/`AutomatStep`/`AutomatScene` in the
  closed union. `engine/mission.ts`: pure `pressKey`/`currentAutomatStep`/`automatDone` with a per-step
  first-try grade (Good clean, Hard after a fumble) into FSRS + XP, and an `AutomatRuntime` on MissionRun
  (init on scene entry, cleared on win). `features/welt/scenes.tsx`: `AutomatView` (device plate + LCD
  screen + keypad) in the pixel-UI language, wired into `MissionPlayer`. `lint-content.mjs`: validates the
  step graph (unique ids, ≥1 correct key per non-terminal step, `next` resolves, a reachable `done`).
  `tests/mission.test.ts`: 6 runner tests over an inline fixture.
- **Re-skinned off the dialogueBattle (founder's s82 reorder):** **1.2 Fahrkarten-Automat** (the ticket
  machine becomes a real machine: Einzelfahrt → Zone AB → pay → ticket; the battle lose/retry scaffolding
  `neustart` is gone, so there is one fewer battle and the boss stands out) and the **1.4 Leergut beat**
  (the Pfand websiteParody becomes the Leergutautomat: feed two deposit bottles, print the Bon; the
  `vergessen` branch is gone). `npc_automat` is now unused but left in the registry (harmless).
- **Gates green:** `lint:content` (6 missions / 35 scenes), `test:unit` (97, +6), `build`, `check:bundle`
  (83 kB), `lint` (0 errors).

**Rung 1 (PR #374): the `hotspot` scene kind.** Added **`hotspot`**, one generic tappable-stage layer (activity catalog #2 "Hotspot
antippen"; also carries #7 "Aufruf abfangen" and #18 "Listen-and-act" via an optional TTS `audio` line):
the player proves comprehension by TAPPING the right place on the pixel stage instead of picking a
sentence. Wrong taps earn only a deadpan reaction (failure is content); the scene clears once every
`correct` spot is found.
- **Missions stay data, not code.** `types/game.ts`: `Hotspot` + `HotspotScene` in the closed
  `MissionScene` union. `engine/mission.ts`: pure `tapHotspot`/`hotspotSolved` with scene-scoped
  first-try grading (Good clean, Hard after a fumble) into FSRS + XP, plus two run-state maps.
  `features/welt/scenes.tsx`: `HotspotView` renderer in the blessed pixel-UI language, wired into
  `MissionPlayer`. `lint-content.mjs`: mirrors the kind + validates spots (unique ids, 0..100 percents,
  ≥1 correct, vocab ids resolve). `tests/mission.test.ts`: 6 runner tests over an inline fixture.
- **Used in the two earliest-played missions** so the variety is visible: **1.1** gains a listen-and-act
  departure board (tap Gleis 4), **1.4** gains the shelf search (tap Milch/Brot/Äpfel among distractors).
  Hotspots are authored vocab-free (they train Hören/Lesen, XP-only), which is pedagogically honest and
  avoids forcing unnatural vocab tags.

**Also this session (after rungs 1–2):**
- **Hotspot polish (PR #376).** Founder screenshot of the 1.1 departure board: the labeled hotspot
  targets rendered as big translucent circles that read as floating soap bubbles. Restyled labeled targets
  as solid pixel sign-plates (opaque, bordered, hard shadow, idle bob); label-less spots keep the pulsing
  ring. Tidied the 1.1 platform signs into a row and the 1.4 shelf tags into two rows.
- **Neuland story research + brainstorm toolkit (PR #377, docs-only).** Four `docs/strategy/` docs:
  `NEULAND_PRIMER.md`, `BRAINSTORM_TOOLKIT.md`, `STORY_MISSION_BRAINSTORM.md`, `LANGUAGE_RPG_RESEARCH.md`.
  Founder is taking these to other LLMs; the keystone decision is the player WANT. No story/mission content
  changed yet.

## Handoff after session 84 (2026-07-09). Bibliothek categorization: audit delivered AND the full
implementation shipped to `main` (branch `claude/bibliothek-categorization-analysis-mtqo5o`).**

**Part 2 of the session (after the founder locked all five decisions): every planned unit shipped.**
- **Founder decisions (all locked, recorded in the implementation plan):** Branche parked (field stays,
  UI hidden until a sector has depth); Redemittel CEFR backfill yes; Häufigkeit badge + chart; Domain
  grouped under Mode ("Mode on top": Mode pre-selects which domains show); Amtssprache axis parked.
- **PR #379:** facet coverage floor in `lib/facets.ts` (`MIN_FACET_COVERAGE` 15% / `MIN_FACET_VALUES` 2;
  visibility follows coverage, never Mode), Büro deleted from `WorkSector` (+11 tags), `WorkSituation`
  retired entirely (+14 tags; linter errors on reintroduction).
- **PR #380:** Grammatik joins `BrowseToolbar` (search + Gruppe dropdown with counts, no facet sheet);
  topics reordered by B2-marker priority; `FacetSheet` renders nothing at 0 groups.
- **PR #381 (polish):** `diplomatic` register folded into `formal`; Redemittel inner tabs dropped, ONE
  filter pipeline, Register as inline chips; Kollokationen got dropdown counts + `SubThemePicker`
  (`?sub=`); the silent CEFR band default is now a removable "Stufe: bis X" chip on all three list tabs;
  a11y/microcopy tidy (search aria-label, no "0" on disabled pills, ScopeChip removed).
- **PR #382 (Häufigkeit):** new `pnpm build:frequency` generates `src/data/frequency.ts` from the vendored
  wordfreq Zipf subset (1116/1182 binned core/häufig/Fachsprache; <1.5 Zipf incl. compounds honestly
  unbinned); Häufigkeit facet + card label on Wörter/Kollokationen; Fortschritt "Wortschatz nach
  Häufigkeit" chart (mastery-overlaid, tap deep-links). **Also fixed the pre-existing black-charts bug:**
  every Analytics chart referenced non-existent `var(--color-*)` vars, now `hsl(var(--*))`.
- **PR #383:** Domain-grouped theme dropdown on Wörter + Kollokationen (`lib/themeGroups.ts`, Mode
  pre-selects domains; `SelectGroup`/`SelectLabel` added to ui/select; `BrowseToolbar` takes grouped
  options) + the per-learner **Lernstand** facet (`?srs=`, neu/lernen/wiederholen/gemeistert mirroring
  the card badges).
- **Redemittel CEFR backfill (final PR):** all 72 phrases AI-draft-tagged (A2 3 · B1.1 19 · B1.2 27 ·
  B2.1 20 · B2.2 3); each card shows its level badge so the founder can review in the UI. **FOUNDER
  REVIEW PENDING** on these 72 draft tags. The level band default is now live on the tab (a B1 learner's
  default hides only the 3 B2.2 phrases, escapable via the Stufe chip).
- All PRs verified with Chromium smoke tests on the built app + full gates (build, lint:content,
  test:unit 97, lint 0 errors, bundle 83 kB). **Founder verifies the live site.**
- **P2 + P3 also shipped (PR #385, founder follow-up prompt):** `GrammarTopic.cefr` on all 10 topics
  (AI-drafted, founder verify pending; badge on cards + topic view; linter completeness check); the
  control-choice + axis rules codified in the `facets.ts` header and a locked `docs/DECISIONS.md`
  section; `counterpart`/`taskType` CUT (0-tagged, no plan, zero data lost; linter errors on
  reintroduction). **Nothing from the audit roadmap remains unshipped**; open items are founder
  reviews only (72 Redemittel + 10 grammar cefr drafts).

**Part 1 of the session (the audit itself):**

Founder asked for a thorough report on the Bibliothek's categorization/filters (define Thema vs Situation
vs Branche, audit the weak/wrong filters, judge his ideas, make it marketplace-ready). Delivered
**`docs/plans/BIBLIOTHEK_CATEGORIZATION_AUDIT_2026-07-09.md`** (full report + verbatim red-team appendix)
and a visual Artifact, from a codebase fact-audit + a 7-agent expert panel + red-team.

**Verdict: the taxonomy is sound but *looks* broken; fix the tells, do not redesign.** The settled calls
(next session can implement the P0/P1 quick wins straight from the doc's §10 roadmap):
- **P0, no content, no risk:** add a **facet coverage floor** to `lib/facets.ts` `facet()` (hide any facet
  with <3 populated values / <15% coverage, not just empty options) and stop gating facets on
  `mode==='work'`. This instantly retires the two broken-looking filters (Branche 4%, Situation 2.2%).
- **P0:** delete the `office`/**Büro** value from the `WorkSector` union (+ `WORK_SECTORS` lint mirror),
  retag its 11 words. Büro is a category error (every industry has an office).
- **P0:** retire the `workSituation` facet (it duplicates Thema; `meeting` vs theme `meetings` is a naming
  clash). Situation = sub-theme, one topic spine Domain → Thema → Sub-theme.
- **P1:** Grammatik gets a search box + `group` dropdown + reorder-by-B2-priority (no facet sheet for 10
  items); add the Thema dropdown to Kollokationen (data already present); visual-bug batch.
- **P1 (the one net-new feature):** generated `frequency.ts` from the already-vendored
  `scripts/vendor/german-frequency-subset.json` → a `Häufigkeit` badge + facet + one honest Fortschritt
  composition chart. Never a "most-used words" leaderboard.
- **Free high-value axes nobody had proposed:** surface the existing **Domain** layer as the spine, and add
  an **SRS-state** filter ("fällig / lerne ich gerade / gemeistert") from FSRS data already on every card.
- **Open founder decisions (doc §11):** park vs cut Branche; backfill Redemittel CEFR or not (no themeId
  either way); frequency badge-only vs badge+chart; Domain-under-Mode layering; Amtssprache axis later/never.

---

_Older handoffs (sessions 1–83) are archived by ISO week under `docs/archive/status-log/`
(index: `docs/archive/PROJECT_STATUS_ARCHIVE.md`; sessions 69–83 are in the W28 file)._

**Content counts (verified from `src/data/*` on 2026-07-07):**
- Vocabulary: **642 words** (+28 each for Arzt, Wohnen, Bank, Bildung in s75)
- Collocations: **540 Nomen-Verb pairs** (~36/theme; +36 each for Arzt/Wohnen/Bank/Bildung in s75)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **20** (s75 daily-life set + s80 2nd daily-life scenarios: Apotheke/arzt, Wohnungsmangel/wohnen, Karte sperren/bank, Prüfungsanmeldung/bildung, all level 2)
- Exam sets: **15** (10 workplace + 5 daily-life: behoerde/arzt/wohnen/bank/bildung, added s80 · 6–7 min · sharedRubric)
- Redemittel: **72** entries
- Can-Do milestones: **37** (all 15 themes; workplace/behoerde founder-verified, daily-life packs draft)
- Lese-/Hörtexte: **22** texts / **66** comprehension checks (+2 each for Arzt/Wohnen/Bank/Bildung in s75; +1 each in s80 covering a new sub-theme per daily-life theme)
- Themes: **15** (10 workplace + `behoerde` + `arzt` + `wohnen` + `bank` + `bildung`; all six domains now populated)
- Game missions (Neuland): **6** = complete Kapitel 1 (1.1 Willkommen, 1.2 Fahrkarten-Automat, 1.3 SIM-Karte, 1.4 erster Einkauf, 1.5 Dach über dem Kopf, 1.6 Anmeldung boss; **35 scenes**; s83 added 2 `hotspot` + 2 `automat` re-skins, removed 2 now-unused cutscenes) · 11 NPCs · 7 key items · scene kinds: cutscene/websiteParody/loadout/listening/**hotspot**/**automat**/dialogueBattle/formCloze
- Provenance rows: **1,426** (all with a `reference`; 1,401 `draft` / 25 `verified`)
- Verification tiers (Layer C, generated `src/data/verification.ts`): **25 human · 1,266 linguistic · 1 facts · 116 provenance** (1,292 machine-attested)

**Dev branch:** reassigned each session; realign to `origin/main` after each squash-merge (`main` is
always the source of truth).

## Session 85 (2026-07-09) — Heute page reworked into an Üben/Spielen start page

**Handoff (shipped to `main`, branch `claude/genauly-start-page-preview-1ih2vi`).**

Founder shared a hand-drawn "Start page" sketch (Willkommen header + a Spielen/Üben toggle driving either
a Neuland carousel or a Last-Session + Fortschritt view). Iterated it as an HTML Artifact (Üben first +
default, minimal Spielen card), then implemented it **scoped to the Dashboard body only** (founder:
"keep the left sidebar and top row intact, only change the contents within the Heute page").
- **`src/features/dashboard/Dashboard.tsx`:** added an **Üben/Spielen** segmented toggle (Üben default).
  **Üben** = a session card reusing `/session` (sized from daily goal + `dueCount`, label toggles
  Weitermachen/Session starten off the existing `totalSessions` completion hook, **no new persisted
  state**) + a Fortschritt block. (Two things in this bullet changed in the follow-up passes below: the
  greeting/orientation ring was initially kept here, then moved to the top row; and the Fortschritt block
  started as four rings, then became the Option B hero-bar layout.)
- **`src/features/dashboard/NeulandCarousel.tsx` (new, lazy):** minimal indigo mission carousel over the
  authored Neuland missions (arrows + dots), same `React.lazy` pattern as the old CityStrip so the
  mission bank stays off the eager path. "Spielen" → `navigate('/welt?mission=<id>')`. (Superseded s87:
  replaced by `SpielenHub` rendering the shared `NeulandHub` mission list; `NeulandCarousel.tsx` deleted.)
- **`src/features/welt/Welt.tsx`:** reads an optional `?mission=` param to auto-open that mission
  (unchanged when absent; clears the param on exit).
- **Removed from Heute (founder-confirmed):** the `CityStrip` city strip and the 3 Situationen chips.
  Both components remain in the repo, just not rendered on Heute.
- Verified in the real app via Chromium (both tabs render, no page errors). Gates green: build,
  lint (0 errors), lint:content, test:unit (97), check:bundle (83.8 kB, budget 400). **Founder verifies
  the live site.** CLAUDE.md bundle note updated (NeulandCarousel is the new lazy Dashboard element).
- **Follow-up layout pass (same session):** the greeting + the little conic streak/goal ring moved OUT
  of the Heute body INTO the global top row (`AppShell` header: greeting left, ring right, replacing the
  old "Willkommen zurück" text + flat streak pill); the Üben/Spielen toggle is now centred; the
  "Sichere deinen Fortschritt" nudge (`SaveProgressBanner`, new `variant="sidebar"`) moved to the
  bottom-left of the desktop `Sidebar` (mobile keeps the Heute-top banner via `lg:hidden`); the sidebar's
  "Bereit für die Prüfung?" card was removed.
- **Heute Fortschritt redesign (founder chose "Option B" from a comparison Artifact):** the four
  identical Fortschritt rings were the problem (a count inside a meaningless ring). Replaced with the full
  Option B: a **Tagesziel hero bar** (gradient progress) + a **7-day activity heatmap** (shaded by each
  day's XP vs goal, today ringed) + a **3 icon-stat row** (Serie/Wörter/Fällig, told apart by icon +
  colour), all from the progress store (no bank walk). The header streak icon is now a **horizontal chip**
  (flame + number + "Tage" side by side, goal ring around the flame) instead of the flame-stacked-on-
  number ring.
- **Dedicated Fortschritt page (`/analytics`):** removed the **CityStrip icon tray** (the row of six
  domain-building icons) from the top, at the founder's request. The `CityStrip` component stays in the
  repo; it is just no longer rendered on `/analytics`. (An earlier note here mis-stated that the Heute
  icon-stat row was dropped; it was not, it is the /analytics city strip that was removed.)

**Handoff after session 86 (2026-07-10). Heute page polished + header/bottom-bar cleanup (branch
`claude/page-polish-icon-review-dbmp0v`).**

Founder ran a "panel of experts" brainstorm on the Heute screen, chose **Option B** from a 3-mockup HTML
Artifact, and locked the top-row icon cleanup. Implemented across the app (gates green: typecheck, lint 0
errors, test:unit 97, build, check:bundle **74.9 kB** / 400):
- **Header (`AppShell.tsx`):** now only **logo · streak · account**. Removed the Search icon (⌘K +
  desktop Sidebar search remain; mobile has no global-search entry, founder choice); removed `ThemeToggle`
  (moved into the `AccountMenu` dropdown as a Hell/System/Dunkel row); removed `ModeSwitcher` (Modus moved to
  **Einstellungen → Lernen**); dropped the "Genauly" wordmark on mobile. The streak pill lost its
  goal-gauge ring (goal now lives on the dashboard ring).
- **Bottom bar (`BottomTabBar.tsx`):** **Einstellungen replaced "Mehr"** as the fixed last slot (plain
  NavLink to `/settings`); the **More sheet was retired** (`MoreSheet.tsx` deleted). The three content
  sections are always visible and reorder via a **long-press easter egg** (jiggle + drag, no +/X badges; a
  transparent layer means "tap anywhere to finish"). Home + Einstellungen fixed. `moreOrder` is now
  legacy/unused.
- **Heute Üben tab = Neuland city-map path** (`features/dashboard/UebenPath.tsx`, new, **lazy**). After a
  round of HTML previews the founder chose a bird's-eye **pixel Neuland city map** as the Üben tab (progress
  already lives in the header + Fortschritt, so Üben orients instead of repeating it). A low-res canvas
  (176×132) upscaled crisp draws a street grid, background buildings, a park and pond, and four Kapitel-1
  focus buildings (Bahnhof/Laden/Zuhause/Amt) bound to real mission ids; **stop state comes from
  `missionsDone`** (done ✓ / current "Du bist hier" pin / locked). One glowing cyan route runs to the current
  stop, the rest is a dotted upcoming leg (no fog, per founder). A **centered legend** names the stops, and
  an **"Als Nächstes" tile** (Kapitel left, green status right, no subtitle) sends the next mission →
  `/welt?mission=<id>`. `Dashboard.tsx` is now tiny (toggle + two lazy tabs); the **goal-ring moved to
  Fortschritt** (`Analytics.tsx` Tagesziel card). Option B (goal-ring/heatmap/stat-tiles on Heute) was the
  intermediate step and is gone.
  - **Polish pass (same session, founder "looks unfinished/cheap"):** stood up headless-Chromium
    screenshotting (`/opt/pw-browsers`, see the harnesses in scratchpad) to iterate on the real render.
    The map was **simplified** (removed on-map flags/lock seals; state lives in the legend), the stops were
    re-laid as a **tour (Bahnhof→Laden→Zuhause→Amt)** so none is stacked under another (fixed a
    banner-collision bug in the fresh-user state), the pill legend became a proper **stepper** (connected
    dots, done/current/locked), the tile was refined (green tag, no subtitle, bigger button), and the map
    was made **taller** so the hero fills the screen. Verified mid + fresh states before porting. The
    reviewed design previews are committed under **`preview/heute-redesign/`** (Option B, the 3 Üben
    concepts, Concept C, and the final Üben-tab page).
- **`Settings.tsx`:** added the Lernmodus selector to the Lernen card; removed the obsolete "Navigation
  anpassen" pin-picker card (the new bar has no add/remove).
- **Deleted:** `MoreSheet.tsx`, `ThemeToggle.tsx`, `ModeSwitcher.tsx`. Docs updated: CLAUDE.md (the locked
  mobile-bar section + Modus line + bundle note), this handoff, `DECISIONS.md`, prompt-log 254–258.
- **Ship status:** on the branch, gates green. **Founder verifies the live site after merge.**



---

**Prior handoff after session 87 (2026-07-10). Heute → Spielen now shows the full Neuland world hub; game
tile removed from Anwenden (branch `claude/game-tile-removal-nav-hi37z5`).**

Founder: the `/welt`-style Kapitel/mission list should open under **Spielen** in Heute (not the minimal
carousel), and the **Neuland game tile should be removed from the Anwenden hub**. Implemented:
- **Extracted the shared `src/features/welt/NeulandHub.tsx`** (the presentational chapter-section +
  mission-list + Schlüssel-Dokumente view, taking an `onPlay(mission)` callback). `Welt.tsx` now renders
  it with `onPlay={setActive}` (inline full-screen `MissionPlayer`, focus mode) and is much smaller.
- **`src/features/dashboard/SpielenHub.tsx` (new, lazy)** replaces `NeulandCarousel.tsx` (deleted): the
  Spielen tab renders `NeulandHub` with `onPlay` = `navigate('/welt?mission=<id>')`, so play still happens
  on the `/welt` route where the full-screen player + focus mode are wired (no chrome/z-index regression).
  Deep-link auto-open in `Welt.tsx` is unchanged. Kept lazy so the mission bank stays off Heute's eager path.
- **`src/features/anwenden/AnwendenHub.tsx`:** removed the "Neuland" (`/welt`) card + its `Gamepad2`
  import; grid went `lg:grid-cols-4` → `lg:grid-cols-3` for the remaining 3 cards (Sprechen/Schreiben/Prüfung).
- **`src/features/dashboard/UebenPath.tsx` (follow-up):** the Üben tab's "Als Nächstes" tile button used to
  enter the game (`/welt?mission=<id>`). Founder: the Üben tab should let you **practise a mission's content,
  not play it**. Button relabelled **"Üben"** and opens a composed practice session for the next mission
  (`/session?mission=<id>`). Game entry stays under Heute → Spielen and `/welt`.
- **Mission-focused sessions (founder rule: Üben mission N must mirror Spielen mission N):** an early pass
  only scoped the session to the mission's *theme*, so the words/drills were unrelated to the mission's
  actual game content. Now `engine/mission.ts` `missionContentIds(mission)` extracts the exact vocab +
  Redemittel ids the mission's scenes reference (loadout slots, battle moves, item demands, hotspots,
  automat keys), and `buildSession` gained a `focus` opt: those items are practised **first, regardless of
  SRS due state**, the random grammar drill is **dropped**, and the rest fills from the mission's theme
  (quiz/due vocab/reading). `Session.tsx` resolves `?mission=<id>` → `focus` + theme scope; `SessionPlayer`
  threads it through. Verified in the app: `/session?mission=m_kap1_dach` leads with
  "die Wohnungsgeberbestätigung" (the word that mission turns on). `tests/engine.test.ts` gained 2 cases
  (99 total).
- **Dark mode for the Neuland Heute surfaces (founder chose "Map + Heute tiles"):** in dark mode the Üben
  city map and the Spielen tiles/backdrop used to render as bright light surfaces against the dark app.
  Now theme-aware:
  - **Üben map** (`UebenPath.tsx`): the `<canvas>` `drawCity` takes an `isDark` flag and picks `DARK_PAL`
    vs `LIGHT_PAL` (deep muted grass/roads/pavement/water/background-buildings); the glowing cyan route and
    the colour-coded landmark buildings stay vivid (a dark-map style). Theme read via a new reactive
    `useIsDark()` hook in `lib/useTheme.ts`; redraws on theme change.
  - **Spielen tiles** (`NeulandHub.tsx`): the mission cards were re-styled from the pixel `GameCard` to the
    **same app-tile language as the Üben "Als Nächstes" tile** (`rounded-[20px] border-border bg-surface` +
    the shared soft shadow, gradient play button, theme-aware Boss/Beta badges), so they're dark in dark
    mode and consistent across both tabs. `PixelStage` gained an opt-in `themed` prop (hub only) that dims
    the bright daytime backdrop art in dark mode.
  - In-mission `MissionPlayer` scenes remain light-only (locked, backlog #31): the pixel atoms in
    `stage.tsx` default to fixed light; only `NeulandHub` passes `themed`. Verified light + dark for both
    tabs via headless Chromium screenshots before shipping.
- **Layout polish round (founder, 8 asks):** *Spielen* (`NeulandHub.tsx`) — "Neuland" is now the section
  heading; "Kapitel 1 · Ankommen" moved **below** the backdrop as a smaller line; the dark-mode backdrop
  dim was reduced (`/45`→`/20`) + a border added so it's clearly visible; mission-tile **subtitles removed**
  and the green done-tick moved into a `bg-success/15` badge to the left of the play button. *Üben*
  (`UebenPath.tsx`) — the **stepper moved above the map**; the "Als Nächstes" tile is **taller** (`p-[18px]`
  → `px-5 py-6` + larger inner margins); the **map is cropped to 3:2** (`VIEW_H=117`/`CROP_TOP=24`, with a
  row-skip guard so neither the top decorative band nor the bottom row leaves a sliver) to match the Spielen
  backdrop dimensions; container spacing bumped `space-y-4`→`space-y-5`. Re-verified light + dark, both tabs.
- Gates green: build, typecheck, lint (0 errors), test:unit **99** (2 new: mission focus + `missionContentIds`),
  check:bundle **71.7 kB** / 400. Docs updated: CLAUDE.md (bundle note + the locked mobile-bar Spielen +
  Üben-tile/stepper/3:2/mission-focus lines + the game-art hub-theming note), this handoff, s85 handoff
  archived to W28, prompt log 265–270.
- **Ship status:** shipped to `main` across **4 squash-merged PRs** (#396 Spielen hub + Anwenden tile
  removal + Üben-practises-mission; #397 dark mode; #398 layout polish; #399 mission-focused sessions).
  Branch realigned to `origin/main` after each merge. **Founder verifies the live site** (the Pages deploy
  runs on each merge to `main`; the sandbox can't reach `*.github.io`).

## Session 88 (2026-07-10) — Heute design review + final direction (condensed handoff)

**Prior handoff after session 88 (2026-07-10). Heute design review + final direction implemented (branch
`claude/landing-page-design-review-ys5jck`, PR #401).**

Founder asked for a senior-designer review of the logged-in start page (screenshots of Üben, Spielen and
the account dropdown), explicitly requesting a **panel of subagents**. Ran 4 parallel reviewers (visual
craft, UX/IA, detail polish, Spielen), each grounding findings in the actual code; synthesized a ranked
top-10. Then iterated an HTML mockup Artifact (8 phone mockups: 3 Üben, 3 Spielen, 2 dropdown, plus 3 map
styles incl. two reimagined pixel treatments) through founder feedback to a final direction, and shipped it:
- **Üben (`UebenPath.tsx`, rewritten):** the green stepper is **retired** (founder); the map alone carries
  the journey. The low-res pixel canvas was replaced by a **soft illustrated SVG map** (360×230 viewBox):
  rounded streets, colored landmark tiles with white glyphs + labels (Bahnhof indigo, Laden coral, Zuhause
  amber, Amt teal), all inside blocks, never on a street. The **indigo route runs solid to the current stop
  and dotted onward**, every **completed stop gets a white route dot**, and a **location pin** (pulse ring +
  app-chrome "Du bist hier" chip floating above it) replaced the pixel character. Theme-aware via
  `MAP_LIGHT`/`MAP_DARK` + `hsl(var(--primary))` in-SVG. Mission tile: "Aktuelles Level" → real **"n / 6"**
  badge in accent (green stays "done"), CTA relabelled **"Jetzt üben"** on the token gradient
  (`bg-accent-gradient` + `shadow-glow`, replacing the hand-rolled indigo/violet + off-hue glow), plus a
  ghost **"Wiederholen · N fällig"** button (`dueCount` → `/revision`). Radii/shadows tokenized.
- **Spielen (`NeulandHub.tsx`, rewritten; shared with `/welt`):** header **hoisted out of the chapter loop**
  (kills the duplicate-H1/hero trap when Kapitel 2 ships) and **centered** ("Neuland" + neutral Beta chip;
  the amber chip sat on the reserved reward-gold hue). The hero got a **scrim overlay** (Kapitel eyebrow,
  district title, "n / 6 Missionen" chip, **"Mission spielen"** CTA for the next unlocked mission). The
  mission list is one dense **checklist card**: tabular number column (fixes mid-compound wraps), done rows
  = green check **+ quiet replay icon button**, next = the single loud gradient play control, locked = Lock,
  boss tag inline. Footer filler sentence → **locked "Kapitel 2 · Wohnen" teaser card** (chapters registry).
- **`AccountMenu.tsx`:** card `w-60`→`w-72` + `shadow-elevated-soft`; theme pills → `grid-cols-3` with
  `px-1`/`min-w-0`/truncate (can't clip under font scaling); Einstellungen/Abmelden/auth rows get `px-2`
  so all left edges align; Abmelden calmed to `text-danger/80`.
- **`Dashboard.tsx`:** Suspense fallback reshaped to the real Üben silhouette (3:2 map + tile), no jump.
- Gates green: build, lint 0 errors, test:unit 99, bundle **71.9 kB** / 400. Verified light + dark + the
  dropdown via headless Chromium with mid-journey progress seeded (route to the Zuhause pin, white dots on
  Bahnhof/Laden/Amt); no page errors. Mockups live at the session Artifact (final direction + map styles).
- **Review findings NOT yet implemented (follow-up candidates):** the sync-banner layout/fold cost and its
  contradiction with the menu's "Synchronisiert" for anonymous users (incl. `useAuthStore.ts:79` falling
  back to `signedOut` on a failed session restore, which can show the sign-in nag to a signed-in user),
  mobile logo linking to `/welcome`, bottom-bar Bibliothek/Fortschritt icon twinning + optical size,
  streak pill carrying today's XP, and a due-review chip on Heute (partially covered by the new
  Wiederholen button).
- **Follow-up round (same session, founder):** a centered **"Lernpfad" title** on Üben (mirrors the Spielen
  "Neuland" header row), the map made a **native 3:2 block** (360×240 viewBox, mat padding dropped) so it has
  the SAME dimensions + screen position as the Spielen hero, and a **left/right module pager** at the bottom
  (chevrons + per-mission dots: active = primary pill, done = success) that flips the practice card through
  every Kapitel-1 mission (number + Als-Nächstes/Erledigt state chip; CTA → `/session?mission=<selected>`;
  the map pin never moves, progress truth). Verified via Playwright (pager click-through + tab comparison).
- **Second follow-up (same session, founder):** the **white surface mat came back** around the Üben map AND
  now frames the Spielen hero too (`bg-surface p-2 rounded-2xl` on both, so dimensions/positions stay
  identical); spacing tightened so the whole Üben tab **fits a phone viewport with zero scrolling**
  (verified: scrollHeight == viewport at 390×844; root `space-y-3`, compact card paddings, Dashboard
  `space-y-4`); the pager's **chevrons are desktop-only**, on mobile the dots (32px tap targets) plus a new
  **horizontal swipe on the practice card** navigate modules; the hero overlay type was tightened so
  "Bahnhofsviertel" no longer truncates inside the mat.
- **Third follow-up (same session, founder):** the practice card's two buttons merged into **ONE
  state-aware CTA**: "Jetzt üben" for a new module, "Wiederholen" (RotateCcw icon) for a completed one,
  both opening the same mission-focused session (`/session?mission=<selected>`); the separate
  "Wiederholen · N fällig" → `/revision` entry was removed from the card (founder: no need for a separate
  5-min revision module when the practice session is roughly as short; `/revision` itself still exists,
  reachable from Fortschritt). The module block (number, state chip, title, CTA) now **slides horizontally**
  (framer-motion, direction-aware, `useReducedMotion`-guarded) when the pager/swipe changes modules.
- **More Üben-card polish (#405):** the completed-module CTA "Wiederholen" renders on plain **`bg-muted`
  grey** (gradient reserved for "Jetzt üben"), and the green **"Erledigt" badge moved onto the title line**
  (right-aligned).
- **Üben vertical distribution (#406):** the Üben root became `flex min-h-[calc(100dvh-15rem)] flex-col
  justify-between gap-3` so the four blocks (title, map, card, pager) **spread evenly** down the page instead
  of clustering at the top; still no page scroll.
- **Spielen crop-and-scroll (#407–#409):** the Heute Spielen mission checklist is now a **fixed 3-row
  internally-scrollable tile** (`compact` prop on `NeulandHub`; `SpielenHub` passes it, `/welt` does not),
  scrollbar hidden (`no-scrollbar`), with a `useLayoutEffect` that **auto-centers the next unplayed mission**
  in the crop on open (uniform `ROW_H`=60, `COMPACT_LIST_H`=180). The header/hero/teaser stay in normal
  `space-y-4` flow and the page fits without scrolling. The owned-key-item **"Schlüssel-Dokumente" shelf was
  removed from the hub** (both surfaces; redundant with the in-mission bag).
- **Ship status:** PRs **#401–#409** all squash-merged to `main` (branch realigned after each). #401 the
  main redesign; #402 Lernpfad title + pager + map parity; #403 mat + no-scroll + mobile pager; #404 merged
  state-aware CTA + slide; #405 grey Wiederholen + Erledigt on title line; #406 Üben even distribution;
  #407 Spielen crop-scroll tile; #408 hidden scrollbar + shelf removal; #409 exact-3-rows + next-mission
  centering. **Founder verifies the live site** (Pages deploys on each merge; sandbox can't reach `*.github.io`).

---

**Handoff after session 89 (2026-07-10). Public help/blog section (`/hilfe`) with SEO prerendering
(branch `claude/blog-help-uben-spielen-wtbnq8`).**

Founder wanted "comprehensive blog/help pages explaining the Üben/Spielen part of the app," SEO-friendly
plus in-app support. Built a login-free help section outside the AppShell (like `/about`), bilingual
DE/EN toggle, with **build-time prerendering to static HTML** so all crawlers (not just Google's JS
renderer) and social previews see full content, matching the project's existing "raw HTML for crawlers"
approach (`boot-seo`, JSON-LD, sitemap).
- **Content bank `src/features/help/content.ts`** (one bilingual source for both the React reader and the
  prerender script): a `/hilfe` hub (intro + FAQ) + **6 articles** grouped in 3 categories (Grundlagen /
  Üben / Spielen): `erste-schritte`, `ueben`, `spielen-neuland`, `neuland-kapitel-missionen`,
  `spaced-repetition`, `ueben-und-spielen`. Blocks are a small closed union (p/h2/h3/ul/steps/note) +
  optional per-article FAQ + related links. No em dashes.
- **React reader** (all lazy, off the eager path): `HelpChrome.tsx` (shared shell: logo header, breadcrumb,
  DE/EN toggle, `HelpBlocks` renderer), `HelpHub.tsx` (`/hilfe`, grouped cards + FAQ), `HelpArticle.tsx`
  (`/hilfe/:slug`, body + FAQ + related; unknown slug → redirect to `/hilfe`). Public routes added to
  `router.tsx` outside `RequireOnboarding`/AppShell.
- **Prerender `scripts/prerender-help.mjs`** (chained into `build`: `tsc -b && vite build && node
  scripts/prerender-help.mjs`; loads the content bank via Vite `ssrLoadModule` like `lint-content.mjs`):
  for the hub + each article it emits `dist/hilfe/<slug>/index.html` from the built `index.html` template
  with a unique `<title>`, meta description, canonical, OG/Twitter tags, **Article + BreadcrumbList (+
  FAQPage) JSON-LD**, and the full German article text baked into `#root` as semantic HTML (React clears it
  on boot; real users get the SPA). It also **regenerates `dist/sitemap.xml`** (12 URLs: 5 static + hub + 6
  articles). Verified generated HTML: correct per-page title/canonical/description/JSON-LD, root
  `index.html` left untouched (WebApplication + landing FAQ intact).
- **Discovery links:** landing footer + Settings footer both gained a "Hilfe" entry.
- Gates green: build + prerender (7 pages), typecheck, ESLint 0, `lint:content` pass, `test:unit` 99/99,
  `check:bundle` **72.6 kB** / 400 (help is lazy, main chunk unchanged).
- **Ship status:** shipped as **PR #411**, squash-merged to `main`; branch realigned to `origin/main`
  after the merge. The Pages workflow runs `pnpm build` (which now includes the prerender), so the static
  `/hilfe` pages + `sitemap.xml` publish automatically. **Founder verifies the live site** (sandbox can't
  reach `*.github.io`; check `https://genauly.de/hilfe/ueben` "View source" shows the article text in raw HTML).
- **NOT done / follow-up candidates:** prerender emits the German snapshot only (the `?lang` toggle is
  client-side; could emit EN variants + `hreflang` if EN search matters); articles cover Kapitel 1 only
  (add per-Kapitel deep dives as Neuland grows); no per-article `og:image` (inherits the site card).

---

**Prior handoff after session 90 (2026-07-10). Heute Üben/Spielen tile parity + subtle section color theme
(branch `claude/ueben-spielen-layout-styling-h7fsvm`, PR #413).**

Founder: "keep the map/photo tile in üben/spielen same dimensions and fix them both in same position on the
screen. Also add a subtle color theme for the toggle buttons and the border padding." Then two follow-ups:
"use some other color instead of violet for üben" and "fill the üben icon when selected similar to spielen."
- **Tile parity (the core ask):** the tiles were already the same size (both 3:2 in a `p-2` surface mat,
  both inside the Dashboard `mx-auto max-w-md` wrapper), but their **screen position differed**: `UebenPath`
  used `flex … justify-between` (which pushed the map down) while the compact `NeulandHub` was top-aligned.
  Fix: Üben's header + map are **pinned to the top with a fixed `gap-4` (1rem)** matching Spielen (the s88
  "distribute evenly" rule is superseded by this explicit position request). Measured in a headless browser:
  **both tiles sit at the same top + `245×358px` below identically-positioned, page-centered titles** in
  both tabs. No jump on toggle. (A later founder round replaced the pager's `mt-auto` bottom-pin with a
  **`my-auto`-centered {card + pager} group + tight `space-y-3`** so the card drops down and the dots rise
  to sit just below it, killing the stranded card↔dots gap; header + map stay pinned, parity intact.)
- **Heading formatting (later founder round):** "Neuland" is now centered on the page **exactly like Üben's
  "Lernpfad"** (same `text-2xl`/`font-bold`; measured horizontal center = viewport center for both). The
  "Beta" chip is a **suffix, not part of the heading** — absolutely positioned off the h1's right edge and
  out of flow, so it no longer shifts "Neuland" off-center.
- **Subtle section color theme (final state after several founder rounds):** the active toggle button
  (`Dashboard.tsx`) lifts on the white pill and picks up a per-section tint. **Üben = teal/accent
  (`text-accent`) + a `Dumbbell` icon; Spielen = orange (`text-orange-500`) + a `Play` icon.** (History
  this session: first shipped Üben=indigo/Spielen=teal, then Üben recolored to orange on the founder's "not
  violet" note, then the two **swapped** to the final teal/orange, and Üben's `Zap` bolt replaced by the
  dumbbell.) Both active icons fill (`fillActive` flag): the Play triangle and the dumbbell's weight
  plates (a later founder round turned the dumbbell fill on; it reads fine at 16px).
- **Tile-mat border is neutral gray:** the s90 experiment with per-section colored mat borders was
  reverted at the founder's request ("colored borders don't look good"); both the Üben map mat and the
  Spielen hero mat use the shared muted **`border-border`**. The white `bg-surface` mat is preserved; the
  section color lives on the toggle only.
- **Filled active icon:** both active toggle icons fill (`fillActive`) — Spielen's `Play` triangle and,
  after a founder round, the Üben dumbbell's weight plates too (it reads fine filled at 16px).
- **Desktop adaptation (later founder rounds, PRs #423 then #425):** on desktop the start page was a narrow
  phone-width column stranded center-screen with big empty side margins. First shipped a **two-column** `lg`
  layout (#423, tile | practice·missions), but the **founder rejected it**. Reverted to **one column on all
  sizes** and adapted to desktop by **vertically centering** the whole start page instead (#425): the
  `Dashboard` root is `lg:flex lg:min-h-[calc(100vh-8.5rem)] lg:flex-col lg:justify-center`, so the focused
  column sits centered in the viewport rather than top-stranded. `UebenPath` takes natural height on desktop
  (`lg:min-h-0`, card/pager `lg:my-0`) so the Dashboard can center it. Mobile and `/welt` unchanged.
- **Desktop scrollbar fix + snappier motion (PR #427):** the single-column stack at `max-w-md` was ~801px
  tall on desktop, just over common laptop viewports, so the root `min-h-screen` forced a scrollbar.
  Narrowed the **desktop** column (mobile stays `max-w-md`) and made transitions snappier.
- **Size restore + directional tab slide (PR #429, later founder round):** the 22rem column from #427 read
  as too small ("components got reduced"). Restored the desktop column to **`lg:max-w-[26rem]`** (near
  mobile's `max-w-md`) and tightened the desktop toggle→content gap (`lg:space-y-3`) so the full-size stack
  still fits: **Üben scroll-free ≥768px, Spielen ≥~800px** (bigger components need more room, so below that
  Spielen can still scroll a little; inherent). Replaced the vertical fade on tab switch with a
  **directional horizontal slide** (right→left to Spielen, left→right to Üben) via `AnimatePresence`
  custom-direction + variants (~0.16s, reduced-motion safe). Verified both tabs at 768/800/832/900 + no page
  errors on switching, mobile unchanged.
- Gates green: build, lint 0 errors, `test:unit` 99/99, `check:bundle` **73.1 kB** / 400. Verified via
  Playwright (screenshots + measured scroll/bounding-box).
- **Ship status:** shipped across **PRs #413 (core), #414/#416/#417/#420/#424/#426/#428 (docs), #415 (color
  swap + neutral borders + dumbbell), #418 (center Neuland + tighten card/pager gap), #421 (fill dumbbell),
  #423 (desktop two-column, later reverted), #425 (revert to single column + desktop vertical centering),
  #427 (desktop scrollbar fix + snappier motion), #429 (restore desktop tile size + directional tab
  slide)**, all squash-merged to `main` (branch realigned after each). **Founder verifies the live site**
  (Pages deploys on merge; sandbox can't reach `*.github.io`; deploy runs confirmed green via the Actions
  API this session).

**Prior handoff after session 91 (2026-07-11). Bibliothek views: desktop filter rail + view switcher + word graph
(branch `claude/bibliothek-mockup-review-rcghlq`, PR #431).**

Founder shared a hand-drawn Bibliothek mockup (desktop: tab row, a 4-icon view switcher, card grid, right-hand
search + filter rail) and confirmed the intent in Q&A: (1) the four views are Tabelle / **nodal graph like
Obsidian** (all words, connections = which words go well together, node size = real-life usage) / Karten
(current) / Liste; (2) desktop-first but adapted to mobile; (3) the Thema/Kategorie filter belongs IN the
rail. Then "go ahead full speed." All three phases built, verified in a real browser (Playwright, desktop +
mobile, zero console errors), and shipped:
- **`features/shared/FilterRail.tsx`:** persistent right rail on lg+ for Wörter/Kollokationen/Redemittel
  inside a new two-column page grid (`lg:grid-cols-[minmax(0,1fr)_16rem]`, rail sticky with internal
  scroll). Suche on top (shared debounced `SearchField.tsx`, extracted from BrowseToolbar), then the primary
  scope as a row list (Domain-grouped Thema via `themeGroupsForMode`; Kategorie on Redemittel; capped
  `max-h-72` box so facets below stay discoverable), then every facet as always-visible pills with live
  what-a-tap-yields counts + zero-yield greying (same semantics as FacetSheet, but immediate commit, no
  draft/apply). Same URL params as mobile. **Mobile keeps the locked BrowseToolbar + FacetSheet untouched**
  (`lg:hidden` wrapper); the toolbar's trailing actions (Gespeichert/Üben) render in the meta row on desktop.
- **`features/shared/ViewSwitcher.tsx` (`?view=`, whitelist per tab, `karten` default + kept out of the
  URL):** Wörter = tabelle/graph/karten/liste; Kollokationen + Redemittel = tabelle/karten/liste; Grammatik
  untouched. **`features/shared/DataTable.tsx`** is the generic sortable table (asc→desc→bank-order cycling,
  German `Intl.Collator`, missing values sink, `usePagedList` incremental rows, own `overflow-x-auto` box;
  note: sort-header buttons need their own `uppercase` because Tailwind preflight resets it on buttons).
  Column defs + compact lists per tab: `vocabulary/VocabViews.tsx` (exports `SaveButton`),
  `collocations/CollocationViews.tsx`, `redemittel/RedemittelViews.tsx`. Vocab table sorts Häufigkeit by raw
  Zipf and strips articles for the Wort sort key.
- **The word graph (`vocabulary/WordGraph.tsx` + pure builder `vocabulary/wordGraph.ts`, pinned by
  `tests/wordgraph.test.ts`, 110 unit tests green):** graph of the CURRENTLY FILTERED vocab list. Edges from
  two authored sources only (no inference): `related` strings resolved to bank entries (normalizer strips
  der/die/das + ein-forms + "sich" + bracketed hints; unresolvable related terms are dropped, founder-confirmed)
  and collocations whose noun AND verb both resolve. Node radius = wordfreq Zipf (`frequency.ts`; no corpus
  evidence = min radius, never a fake claim), color = the 6 domains (legend under the canvas + n Wörter · m
  Verbindungen). Canvas-rendered (642 nodes smooth), d3-force (**new dep, 3.0.0**) with weak x/y centering so
  unlinked words stay in the cloud; sim pre-ticks 120 steps then settles gently; positions survive filter
  changes. Pan/pinch/wheel-zoom/node-drag; zoom-fades labels; tap selects a word → neighbors highlight,
  rest dims, and a detail card shows (word + SpeakButton + bookmark + CEFR/Häufigkeit/degree badges +
  example). Zoom +/−/fit buttons. **Lazy chunk** (`React.lazy` inside VocabularyTrainer, ~12 kB incl.
  d3-force); main chunk unchanged at **72.8 kB** / 400.
- Also fixed German: "n Worte" → "n Wörter" (meta row + FacetSheet apply label).
- Gates green: build + prerender, typecheck, ESLint 0 errors, `lint:content` pass, `test:unit` **110/110**,
  `check:bundle` 72.8 kB. Browser-verified: rail pill writes `?cefr=`, Thema row writes `?theme=`, all four
  views render desktop + mobile, graph click-select works, zero console errors.
- **Ship status:** shipped as **PR #431**, squash-merged to `main`; branch realigned after the merge.
  **Founder verifies the live site.**
- **Founder follow-up round (same session, PR #432):** the rail is now a **collapsible tile** (brand-tinted
  `bg-primary/10` header with "Filter" + active-count badge + chevron; whole panel expands/collapses), the
  **LibrarySwitcher moved into the left column** so the tab pills sit beside the filter tile on desktop,
  the **meta row + graph legend are centered on mobile**, and the duplicated word count was removed (the
  graph legend now shows only "n Verbindungen"; the word count lives in the meta row alone).
- **Founder follow-up round 2 (same session, PR #433):** the **Üben button moved to the bottom of the
  filter tile** as an always-visible `footer` slot (shows in collapsed state too; mobile keeps Üben in the
  toolbar, the desktop meta row keeps only Gespeichert on Wörter), and **every rail section got a pin**:
  the pin icon in a section header keeps that section (Thema/Kategorie or any facet group) visible while
  the panel is collapsed. Pins persist per tab in localStorage (`b2beruf.railPins`), verified across
  reload via Playwright.
- **Founder follow-up round 3 (same session, PR #434):** in the **graph view** the word count moved out of
  the top meta row and sits with the connection count at the bottom of the canvas ("586 Wörter · 673
  Verbindungen"); the meta row keeps only the view switcher + Gespeichert there. Other views (Tabelle/
  Karten/Liste) keep the word count in the meta row as before.
- **Founder follow-up round 4 (same session, PR #435):** the desktop filter tile was **too high** (it
  aligned with the tab row). Restructured all three browse pages so the **filter tile now starts level with
  the first content card** (measured rail-top = card-top).
- **Founder follow-up round 5 (same session, PR #436):** round 4 had stretched the tabs to full width; the
  founder wanted them back at content width. Switched all three pages to an **explicit 2-col × 2-row grid**:
  the tabs + view-switcher meta row sit in row 1 / col 1 (content-column width, NOT full width), and the
  content (row 2 / col 1) + the filter rail (row 2 / col 2) share row 2, so the tabs stay at content width
  AND the filter tile still lines up with the first card (measured tabs-right 1112 < grid-right 1400;
  rail-top = card-top = 329). Mobile unchanged.
- **Founder follow-up round 6 (same session, PR #437):** the rail's **primary scope (Thema/Kategorie) is
  now a `Select` dropdown** instead of the always-open row list, so the facet groups sit closer to the top.
  Reuses the same grouped options (Domain headings + counts) as the mobile toolbar; verified the dropdown
  opens and selecting a theme writes `?theme=`.
- **Founder follow-up round 7 (same session, PR #438):** (1) the **whole filter tile is brand-tinted**
  (`bg-primary/10` body + `border-primary/20` + `border-primary/15` dividers), not just the header; (2) the
  **same collapsible filter tile now renders on mobile too**, retiring the mobile BrowseToolbar + FacetSheet
  on these three pages. One `filterRailProps` object feeds a desktop `<FilterRail>` (sticky, default-open)
  and a mobile one (`lg:hidden`, inline, `defaultOpen={false}` so it starts as a compact Filter bar you tap
  to expand). Gespeichert (Wörter) moved into the meta row on mobile; Redemittel's mobile register chips
  were removed (Register is a rail facet). Verified both breakpoints via Playwright (themed tile, mobile
  collapse/expand, zero console errors). `BrowseToolbar`/`FacetSheet` remain in the repo, just unused here.
- **Founder follow-up round 8 (same session, PR #439):** (1) the filter tile switched from the brand tint to
  a **grey shade** (`bg-muted` + `border-border`; "Filter" label keeps the brand accent). (2) **Üben is now
  always visible.** On desktop the aside is a **capped scroll container** (`lg:overflow-y-auto` +
  `lg:max-h-[calc(100vh-22rem)]`) with the header `lg:sticky lg:top-0` and the Üben footer `lg:sticky
  lg:bottom-0`, so the facet body scrolls and Üben stays on screen at every scroll position (verified across
  800/900/1080 viewport heights). On mobile the tile initially had no footer; a shared `StickyUebenBar`
  floated Üben above the bottom nav. (The earlier flex-1 body-scroll attempt let the footer overflow past the
  clipped aside; the aside-scroll + sticky-footer pattern is the fix.)
- **Founder follow-up round 9 (same session, PR #440):** "üben should be always part of filter tile even in
  mobile." Removed the separate `StickyUebenBar`; the **mobile tile now carries the Üben footer** like
  desktop. To keep it visible while scrolling, the mobile FilterRail is a **grid child** (moved out of the
  header column, so its sticky containing block spans the card list) pinned just below the app header
  (`sticky top-[calc(4rem_+_env(safe-area-inset-top))] z-10 max-h-[70dvh] lg:hidden`) and capped, and the
  FilterRail's sticky header/footer + internal scroll now apply on both breakpoints. Verified: Üben is
  in-tile and inView at scroll 0/900/2500 on mobile (pinned at ~118px) with the app header sitting above it,
  and desktop still visible at all scroll positions.
- **NOT done / follow-up candidates:** graph for Kollokationen (decide after founder feedback); graph
  dark-canvas is theme-aware but in-graph label contrast could get a pass; `related` terms not in the bank
  could later render as satellite nodes; table column set per founder taste.

**Handoff after session 92 (2026-07-12). Bibliothek browse pages — 14 founder UI-refinement rounds
(branch `claude/uben-visibility-scrollbar-251zch`, PRs #442–#455, all squash-merged; branch realigned after
each).** A long chain of screenshot-driven mobile/desktop polish on the three browse pages
(Wörter/Kollokationen/Redemittel). **Final state (what's live):**
- **Search lives OUTSIDE the filter panel.** A search icon sits on the toolbar (right of the Wörter
  bookmark, same icon-only design); tapping it reveals a transient full-width `SearchField` (autofocus).
  Opening/closing never touches filter state; closing clears the query. Backed by **`src/lib/fuzzy.ts`**
  (`foldText` + `fuzzyMatch`): umlaut/case-insensitive, punctuation-ignoring, token-order-independent, and
  **Damerau edit-distance-1** tolerant for tokens ≥4 chars (adjacent transposition included). Pinned by
  **`tests/fuzzy.test.ts`**. Wörter search also **surfaces connections**: a matched word's `related` terms
  that resolve to other in-scope entries are appended (feeds the graph edges too). Redemittel/Kollokationen
  get the forgiving match only (no connection data there).
- **LibrarySwitcher = the page header** (HubHero dropped from all four Bibliothek tabs). A lifted
  `shadow-soft` recessed-grey bar; the **active tab is bold + brand** (reads as the section title), the
  others quiet; a framer **`layoutId="library-tab-pill"`** white pill slides between tabs (reduced-motion
  safe). `text-sm` on ALL breakpoints (an earlier `sm:text-base` bump read as oversized on desktop and was
  removed); tight mobile padding keeps four labels incl. "Kollokationen" on one phone row (no scroll).
  **ViewSwitcher** got the same sliding white-pill treatment (`layoutId="view-tab-pill"`, `h-10` to match
  the icon buttons).
- **Toolbar row (mobile), full width `justify-between`:** `[Filter icon] · [ViewSwitcher] · [bookmark
  (Wörter) + search]`. Icon buttons are `rounded-lg` 40px. Desktop hides the Filter icon (it uses the
  persistent rail) and the row is view-left / actions-right.
- **Filter tile:** `FilterRail` now has a body-only **`layout="panel"`** mode (Thema + Unterthema + facets
  only) used on mobile, mounted/unmounted with an **AnimatePresence height/opacity slide**; the desktop rail
  ("rail" layout) is unchanged (sticky right column, header + chevron, footer Üben, count). The tile is one
  solid **`bg-border`** grey. **Reset + close are icons** in the top-right (RotateCcw reset — disabled when
  nothing to clear — + X close on the mobile panel; reset only, top-right of the body, on desktop). The
  word **"Zurücksetzen" button was removed**. **Section pins are shown on both breakpoints** (the
  panel-mode gating that briefly hid them on mobile was removed).
- **Sub-themes are a filter dropdown, not a page.** The full-page `SubThemePicker` interstitial is gone;
  `FilterRail` gained an optional **`secondary`** scope dropdown ("Unterthema", per-sub-theme counts +
  "Gesamtes Thema"), rendered right under Thema when the active theme has sub-themes (Wörter + Kollokationen).
  The list shows the whole theme by default; a small breadcrumb shows the active sub-theme. `SubThemePicker`
  is now **unused** (kept in the repo; safe to delete in a follow-up once the founder confirms).
- **Üben + word count = a sticky bottom action bar on mobile** (full-bleed `-mx-4 sm:-mx-6`,
  `sticky bottom-[calc(3.9375rem+env(safe-area-inset-bottom))] z-30`, `bg-background/90` + `backdrop-blur`,
  border-top), placed after the content so it stays pinned above the nav while the list scrolls above it.
  Count is stacked (number over noun) at the bar's right, hidden in the Wörter graph view. **Desktop keeps
  Üben/count in the rail.**
- **Gates green throughout:** typecheck, ESLint (only the pre-existing react-hooks warning), `pnpm build`,
  `check:bundle` **73.1 kB**/400, `test:unit` **116/116** (fuzzy tests added). No Playwright this session
  (no browser driver in the sandbox; sized against known-fitting baselines and the founder verifies live).
- **Per-round PRs:** #442 (mobile tile: no scrollbar, Üben visible) · #443 (bg-border contrast, icon-only
  Filter/Bookmark on the view line) · #444 (Filter toggle into the footer, left of Üben) · #445 (drop
  HubHero headers, count stacked right of Üben, toggle repositions by state) · #446 (search out of panel +
  fuzzy + connections) · #447 (polish page toggle → sliding pill) · #448 (ViewSwitcher slide + mobile
  restructure: Filter on toolbar, standalone Üben, sliding panel) · #449 (bigger toggle + toolbar cohesion)
  · #450 (`text-sm`/`text-base` toggle, count beside Üben, `w-fit` width-match) · #451 (full-width toolbar +
  Üben rows) · #452 (drop oversized desktop toggle font) · #453 (sub-theme dropdown replaces picker page) ·
  #454 (header-like toggle + icon reset/close) · #455 (restore mobile pins + sticky bottom Üben bar).
- **NOT done / follow-up candidates:** delete the now-unused `SubThemePicker` once confirmed; the mobile
  sticky Üben bar is `sticky` (glued to the bottom while the list is long enough to scroll; a very short
  filtered list sits under its results instead of the viewport bottom — switch to `fixed` if "always glued"
  is wanted); mobile pins persist a preference but don't visually collapse sections the way desktop does
  (no mobile collapse state); `BrowseToolbar`/`FacetSheet` remain in the repo but unused on these pages.

**Handoff after session 93 (2026-07-12). Grammatik tab redesigned onto the shared Bibliothek skeleton
(branch `claude/grammatik-section-redesign-v3gmv7`, PR #457).** Founder asked for a "complete
re-imagination" of Grammatik: follow the other three tabs' high-level concept (filters → content → Üben)
but with design freedom, and make it highly useful and intuitive for adult learners and job holders.
- **Hub = the s92 skeleton, exactly:** LibrarySwitcher page header, toolbar row `[Filter icon (mobile) ·
  ViewSwitcher · Suche icon]`, transient full-width fuzzy `SearchField` (over titleDe/title/purposeDe/
  pattern/group label), `FilterRail` on both breakpoints from ONE `filterRailProps` (desktop sticky rail,
  mobile AnimatePresence slide panel), sticky mobile bottom bar with Üben + "n Themen". **Gruppe** is the
  primary dropdown (control-choice rule: it's the "where am I" cut) and **Stufe (CEFR)** the facet, added
  as `grammarFacets()`/`GRAMMAR_FACET_IDS` in `lib/facets.ts` (100% coverage, cefr required since s84).
  Params `?group=`/`?cefr=`/`?view=`/`?topic=` are URL-persisted; `/grammar?topic=` deep links (search)
  still resolve.
- **Views (new `grammar/GrammarViews.tsx`):** Karten (default) = redesigned topic cards (emerald group
  icon tile, **priority-rank chip**, CEFR badge, purpose, truncated mono pattern strip, "n Übungen" +
  "Lernen →" affordance); Liste = numbered compact rows. No Tabelle (a lesson is not a row of atomic
  facts). Shared metadata moved to `grammar/grammarMeta.ts`: `groupMeta`, the B2-marker `groupOrder`,
  `orderedGrammar` (the flattened priority spine) and `topicRank`.
- **Lesson page (new `grammar/GrammarTopicView.tsx`):** hero (group tile, English eyebrow, titleDe,
  purpose, badges) → explanation card with an emerald **Muster** formula panel → Beispiele (speakable) →
  Typische Fehler (warning list) → **numbered Übungen with a live progress bar** (first-answer results,
  local state remounted per topic) → a **completion panel** ("Thema abgeschlossen · k von n richtig" +
  one-tap "Weiter: <next topic>") → prev/next cards along the spine + the kept "Wissen im Quiz testen"
  `/quiz` CTA. "Thema n von 10" in the top row; lesson scrolls to top on open. Rationale for the rank/
  spine emphasis: the audience is time-poor working adults, so the section answers "where do I start,
  what's next" without them deciding (top of the list = biggest B2 lever).
- **Verified in a real browser** (Playwright + the preinstalled Chromium against `pnpm dev`): hub Karten/
  Liste on desktop + mobile, filter rail counts, lesson desktop + mobile, and the full drill loop (5/5
  answered → XP in header → completion panel → "Weiter: Konjunktiv II" navigates). Gates green:
  typecheck, ESLint 0 errors, `test:unit` 116/116, build + prerender, `check:bundle` **73.0 kB**/400.
- **Founder follow-up round (same session, PR #458, from a live phone screenshot):** three lesson fixes.
  (1) No navigation → the **LibrarySwitcher tabs now render on top of the lesson** too (tapping
  Grammatik doubles as back-to-overview). (2) No Üben → **Üben added to the lesson** (inline gradient
  button on desktop, sticky bottom action bar above the nav on mobile), replacing the "Wissen im Quiz
  testen" `/quiz` CTA (`/quiz` stays reachable via practiceAreas). (3) Too much text → the English
  all-caps eyebrow was dropped from the hero, and the **Muster panel now leads** the card with the
  explanation **clamped to three lines** behind a "Mehr anzeigen"/"Weniger anzeigen" expander.
  Re-verified on the 390px viewport (tabs navigate out, Üben bar sticks while scrolling, expander
  toggles); all gates green again.
- **Founder follow-up round 2 (same session, PR #459):** the lesson hero still described the topic twice
  (German `purposeDe` in the hero + the English explanation in the card below) and carried a meta badge
  row (CEFR + group + "n Übungen"). Both removed: the hero is now **group tile + German title only**;
  the topic is described ONCE (the clamped explanation card) and the drill count already shows in the
  Übungen progress. CEFR/purpose remain on the hub topic cards, where they inform the choice.
- **Founder follow-up round 3 (same session, PR #460):** the Muster read as one mush (multiple pattern
  variants wrapping into each other) and the explanation as one paragraph chunk. Both are now split at
  RENDER time, no content-bank change: `pattern` splits on the authored `" · "` separator into **one
  variant per row** (emerald dot markers when >1; verified against all 10 patterns, e.g. Relativsätze
  becomes a 4-row Nom/Akk/Dat/Gen list), and `explanation` splits into **sentence bullets** with the
  first point shown and the rest behind the "Mehr anzeigen" expander (regex fallback keeps unsplittable
  text as one line). If future explanations use dotted abbreviations, revisit the sentence split.
- **Founder follow-up round 4 (same session, PR #461): German-first lesson + hold-to-peek EN.** The
  lesson text is now German by default with English as a press-and-hold peek, across the section:
  (1) new bank fields **`explanationDe` + `pitfallsDe`** on all 10 topics (AI-drafted German, EN
  originals kept parallel in order/length; **founder verify pending**, flagged in the type comments);
  (2) new **`grammar/EnPeek.tsx`** chip (pointer-capture hold, Space/Enter hold on keyboard, never a
  sticky toggle) placed top-right of the explanation paragraph (NOT the tile), on the pitfalls header,
  per example card (beside the SpeakButton, gloss hidden until held), and on each drill via a new
  `glossPeek` prop on GrammarDrillCard (**lesson only; the composed session keeps always-visible
  glosses**); (3) the "Mehr anzeigen"/"Weniger anzeigen" expander moved to the **bottom-right corner of
  the tile**. Peek verified in-browser (hold shows EN, release reverts to German); `lint:content` clean
  (no em dashes in the new German); all gates green. Drill `explain` feedback stays English (open
  question for the founder: author `explainDe` for 47 drills?).
- **NOT done / follow-up candidates:** per-topic drill progress is session-local only (persisting
  "topic mastered" would need progress-store/cloudSync thought); `BrowseToolbar` lost its last consumer
  (kept in repo like `FacetSheet`/`SubThemePicker`); Grammatik group icons could get bespoke marks later.

## Session 94 (2026-07-12) — Bibliothek scale-up Wave 1: the Branche (sector) axis is ACTIVE

The founder presents Genauly to German-course classmates from all major professional sectors on
2026-07-13 and wants the Bibliothek to be their single source of truth after the course; this
**un-parks the sector facet** (founder decision 2026-07-12, superseding the 2026-07-09 audit's park;
recorded in `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §1 and `DECISIONS.md`).
- **Taxonomy:** `WorkSector` 5 → **11 values** (`+engineering`, `+construction`, `+production`,
  `+transport`, `+beauty`, `+sports`), mirrored in `lint-content.mjs`; labels in `facets.ts`
  (`SECTOR_OPTIONS`, care relabelled "Medizin & Pflege", hospitality "Gastronomie"); a sector facet was
  added to `COLLOCATION_FACETS` (vocab already had one). Rule kept: Branche = where you work, Thema =
  what you are doing; `transport` deliberately not named "Logistik" (theme-label clash).
- **Content Wave 1 (even spread, founder choice):** **+220 vocab** (20/sector, care extends the s43
  Pflege pack) and **+96 collocations** authored + 3 existing tagged, all with `cefr` + `sector` + full
  schema, spread across existing themes (care-pack pattern). Coverage cleared the 15% floor, so the
  **Branche facet renders on Wörter AND Kollokationen automatically** (11 pill options, `?sector=`).
  **+12 Redemittel** in the new sector-neutral `professionalIntro` category ("Über Beruf & Fachgebiet
  sprechen", Briefcase icon added to `lib/icons.ts`). **+328 provenance rows** (DWDS references, draft).
- **Verification (all green):** `lint:content` ✔; `build:oracles` refreshed → `verify:facts` **0
  two-oracle errors**; wordfreq installed → `build:frequency-subset` + `build:frequency` regenerated;
  LanguageTool resolved → `verify:grammar` **0 grammar flags**; `verify:cefr` + `build:verification`
  regenerated; typecheck, ESLint 0 errors, `test:unit` 116/116, build + prerender, `check:bundle`
  **73.0 kB**/400.
- **Strategy doc:** `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` — the 11-sector taxonomy, Waves 2–4,
  the per-wave quality gate, and the floor math.
- **NOT done / follow-up candidates:** all 328 new provenance rows are `draft` (founder/native review
  pass pending); sector `ReadingText`s were Wave 2; Wave 2 prioritization waits on classmate feedback
  after the 2026-07-13 presentation.

**Handoff after session 95 (2026-07-12). Scale-up Waves 2–4 EXECUTED and MERGED to `main`
(PR #463, squash; the founder reviewed the staged draft PR and gave the merge go-ahead).** One
wave per commit on the branch (b1c0766 W2, 8c0df08 W3, 2bfb57f W4 + docs commits). The approved plan
(with model policy: Fable 5 for German authoring, Sonnet 5 wiring, Haiku 4.5 mechanics) is folded into
`docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §0/§4–6.
- **Wave 2 (first tranche, feedback-driven default order):** engineering, it, construction,
  production each +40 vocab (to ~60), +17/16 collocations (to ~26), +1 sector `ReadingText`
  (Wartungsprotokoll memo · Sprint-Review email · Baustellenordnung announcement · Schichtplan
  voicemail, one per `kind`). Schema: **`ReadingText.sector`** added (validate-when-present).
  Banks: vocab 862 → **1,022**, collocations 636 → **701**, texts 22 → **26**.
- **Wave 3 (Redemittel phrasebook):** +5 sector-neutral categories (telephoning, emails,
  presentations, jobInterview, smallTalk; icons Phone/Mail/Presentation/UserCheck/Coffee),
  13 phrases each with cefr/register/example. Redemittel 84 → **149**.
- **Wave 4 (grammar canon):** +14 German-first topics on the B2-marker spine across **6 new
  groups** (nouns, attributes, reportedSpeech, wordFormation, infinitives, future): indirekte
  Rede, zweiteilige Konnektoren, Infinitivsätze, Finalsätze, Temporalsätze, Vergleichssätze,
  Partizipialattribute, Genitiv, n-Deklination, Nominalisierung, lassen, brauchen + zu,
  Futur I/II Vermutung, es-Konstruktionen. Grammar 10 → **24 topics / 117 drills**. The s93
  lesson page absorbed everything via `grammarMeta.ts` (`groupOrder` extended).
- **Provenance:** +378 rows (Waves 2–4), register 1,754 → **2,132**, all new rows `draft`.
  **`provenance.ts` is now two concatenated literals** (`provenancePart1/2`): a single 2,000+ row
  array literal exceeds TS2590; append to the second literal (script pattern unchanged).
- **Pipeline (all green):** lint:content clean; `build:oracles` → `verify:facts` **0 two-oracle
  errors** (781 noun lemmas); frequency subset + bins regenerated; `verify:grammar` **0
  grammar/agreement flags**; `verify:cefr` + `build:verification` (linguistic tier 1602 → **1,896**);
  typecheck, ESLint 0 errors, `test:unit` 116/116, build + prerender, `check:bundle` **73.0 kB**/400;
  floor smoke: Branche renders on Wörter AND Kollokationen, spine 24/24.
- **NOT done / follow-up:** the first verification session (build `scripts/review-queue.mjs` +
  `pnpm review:queue`, flip reviewed items draft → verified; all 2,107 non-Can-Do rows are still
  `draft`); Wave-2 tranche 2 (care, trades, retail, hospitality, transport, beauty, sports) after
  classmate feedback from the 2026-07-13 presentation; a Playwright smoke of one new grammar
  lesson in a real browser.

**Handoff after session 97 (2026-07-12). Review-queue tooling shipped (scale-up plan §7.6's
named next step).** `scripts/review-queue.mjs` + `pnpm review:queue`: a read-only dump of
`draft` provenance rows, grouped by content type then by sector (vocab/collocation/text) /
category (Redemittel) / group (grammar) / theme (Can-Do, dialogues, exam sets, writing prompts) /
chapter (missions), written to `docs/reports/review-queue.md`. Mechanical tooling (Haiku-tier per
the plan's model policy), no content or app-source changes.
- **Usage:** `pnpm review:queue` for the full draft queue; scope a session with
  `--type=vocabulary`, `--sector=it,engineering`, `--group=meetings`, or inspect what's already
  verified with `--status=verified|all`. `--dry` prints the console summary only, no report file.
  The headline summary (total rows, verified %) always covers the **whole register**, regardless
  of filters, so a scoped session never loses sight of the overall trust metric.
- **Current headline (unchanged by this session, now visible in one command):** **25 / 2,132 rows
  verified (1.2%)** — only the founder-approved Can-Do bank. Everything from Waves 1–4 (vocab,
  collocations, redemittel, grammar, texts, dialogues, exam sets, writing prompts, missions) is
  still `draft`.
- **Implementation note:** content_id → group lookup is built by cross-referencing the actual bank
  items (not the provenance `notes` free text, which isn't populated consistently across banks);
  grammar drills resolve to their parent topic's `group` field, missions to `chapter`.
- **Verification:** `lint:content` ✔ (unaffected, script is read-only); `typecheck` ✔; `eslint`
  0 errors (pre-existing hook warnings only); `test:unit` 116/116; full unfiltered run completes
  in ~2s and produces the counts matching the s95 handoff exactly (2,132 total / 25 verified /
  2,107 draft).
- **NOT done:** actually running a review pass with the tool (flipping any rows to `verified`) —
  this session shipped the tool only, per the plan's "Next step (first verification session)"
  wording; the review pass itself is the next session's work. Wave-2 tranche 2 and the Playwright
  grammar smoke (carried over from s95) are still open too.
- **Model for the review pass (decided end of s97, next session starts fresh):** this is judgment
  work on German correctness (article/plural, sense-match to the reference, register, CEFR
  plausibility), not mechanical wiring, so it sits in the plan's authoring tier alongside German
  writing, not the Haiku/Sonnet tier this session's tooling used. Recommended **Fable 5** first
  choice, **Opus 4.8** fallback; Fable 5 was unavailable, so the **next session runs on Opus 4.8**.

**Handoff after session 98 (2026-07-12). First AI-jury review pass EXECUTED (scale-up plan §7),
Opus 4.8.** The founder chose (via AskUserQuestion) to record the review as the honest machine-layer
**`jury` tier**, NOT to flip `review_status` (on `/sources`, `review_status: "verified"` reads as
"menschlich geprüft / human-verified", so an AI must not set it). Scope: Wave 3 Redemittel + Wave 4
grammar.
- **Reviewed 149 ids for German correctness** (grammar, spelling, article/plural, sense-match to the
  English gloss, register + CEFR plausibility): 65 Redemittel (telephoning/emails/presentations/
  jobInterview/smallTalk) + 14 grammar topics + 70 drills. Redemittel were **65/65 clean**; grammar
  had **4 real defects, all fixed** in `src/data/grammar.ts`: (1) Genitiv pitfalls contained literal
  `**s**` markdown that renders as visible asterisks (pitfalls are plain-text `<span>`, no markdown);
  (2) Infinitivsätze pitfall #3 EN was about modals while the German was about commas — the `EnPeek`
  swaps the list DE↔EN by index, so they must match; (3) Vergleichssätze drill d5 modeled `als ob` +
  indicative, contradicting the topic's own Konjunktiv-II rule; (4) brauchen+zu drill d5 had a doubled
  "nur" (the explain even apologized for it).
- **Mechanism (new, honest, reproducible):** a committed sidecar `docs/reports/jury-review.json`
  (`{ promptVersion, reviewer, pass: [content_id…] }`) lists the passed ids; `scripts/build-verification.mjs`
  reads it and elevates each (no failing check, not already `human`) to the **`jury`** tier
  (confidence 0.9, "KI-Jury/AI jury" badge on `/sources`, above `linguistic`, below `human`).
  `verification.ts` stays fully generated (never hand-edited); append ids + regenerate for later waves.
  `Sources.tsx` tier-summary list got `"jury"` added so the 149 show in the breakdown.
- **Pipeline (all green):** `build:verification` → tiers **human 25 · jury 149 · linguistic 1831 ·
  facts 1 · provenance 126**; `lint:content` ✔ (validates jury enum + prints distribution);
  `verify:facts` **0 two-oracle errors**; `typecheck` ✔; `test:unit` **116/116**; `build` + prerender
  ✔; `check:bundle` **73.0 kB**/400. No content-bank counts changed (edits were fixes, not additions);
  `review_status` unchanged, so headline **verified % stays 25/2,132 = 1.2%** (the human loop is still
  the founder's to run).
- **NOT done / follow-up:** the human `verified` pass (founder flips real rows via `pnpm review:queue`);
  extend the jury pass to Waves 1–2 vocab/collocations + texts (append to the sidecar); Wave-2 tranche 2
  (care/trades/retail/hospitality/transport/beauty/sports) after 2026-07-13 classmate feedback; the
  Playwright grammar-lesson smoke (carried over).

**Handoff after session 99 (2026-07-12). Branche filter overhaul PLANNED and approved, NOT
implemented (founder: "save it on the repo", implementation is a follow-up session).** Full plan:
**`docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md`**. The founder reported that common words (e.g.
das Projekt) look tied to a single Branche and demanded a root-cause fix plus missing industries.
- **Root cause diagnosed (verified in code):** `sector?: WorkSector` is single-valued and only
  ~406/1,022 words + 165/701 collocations are tagged; the facet filter is strict, so selecting any
  Branche hides EVERY untagged word (das Projekt has no tag at all) and pins tagged cross-industry
  words (die Wartung, das Werkzeug, der Schichtplan) to exactly one industry. Systemic, not
  per-word. There is also currently NO UI surface showing a word's Branche.
- **Approved design (see the plan for detail):** (1) `sectors?: WorkSector[]` with **untagged =
  universal** semantics (`matchesSector`: untagged shows under every Branche, tagged hides only
  under other Branchen), Branche moves out of the pill facets into a **scope dropdown**, rail
  hierarchy **Branche → Thema → Unterthema** (FilterRail generalized to an ordered `scopes[]`);
  (2) retag audit of all 571 tagged items (1–4 sectors typical, 5+ = untag) with a founder-review
  report `docs/reports/sector-audit-report.md`; (3) **4 new sectors** — `chemicals` (Chemie &
  Kunststoff), `pharma` (Pharma & Medizintechnik), `cleaning` (Reinigung), `security`
  (Sicherheitsdienste), 15 total — plus `transport` relabeled "Transport & Logistik" with a ~10-word
  Lager boost, each new sector with a full ~20-word + ~9-collocation starter pack (founder chose
  all options + full packs via AskUserQuestion); (4) Branche chips on Tabelle/Karten so
  applicability is inspectable; (5) new `tests/sectors.test.ts` + linter `sectors[]` validation +
  E2E checklist (das Projekt visible under IT AND Bau; Bauzaun only under Bau).
- **Freed constraints:** as a scope, Branche escapes the ≤12-option facet cap and the 15% coverage
  floor (which is what makes 15 sectors possible). The linter's frequency check only errors on
  STALE ids, so new words without a Häufigkeit bin don't block if `wordfreq` regen is unavailable.
- **NOT done:** all implementation. Carried over: human `verified` pass via `pnpm review:queue`,
  jury pass extension to Waves 1–2, Wave-2 tranche 2, Playwright grammar smoke.

**Handoff after session 100 (2026-07-12). Üben UI-refinements round: PLANNED AND APPROVED, deliberately
NOT implemented (founder instruction).** Six founder requests explored (3 parallel codebase passes),
designed, and written up as **`docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`**, which the founder approved
verbatim with "don't implement it now". Zero app-source or content changes this session; the plan doc
is the deliverable. Start the next session by picking a chunk from that plan.
- **The six requests (chunk → recommended model, full map in the plan):** (1a) Üben relevance:
  `?grammar=<topicId>` pins the session's grammar pool to the studied lesson, and a new pure
  `libraryFocus` helper translates Bibliothek facets (`?sub/?cefr/?sector`) and the Redemittel
  category (`?cat=`) into the existing mission-style `focus` opt → **Opus 4.8** (composer/SRS-adjacent);
  (1b) speaking block gets the typing block's "Anzeigen" give-up (grades wrong, unlocks Weiter) →
  **Sonnet 5**; (2) graph view: word count moves beside Üben like every view, only "n Verbindungen"
  stays under the canvas → **Sonnet 5**; (4+5) FilterRail desktop: restyle the grey `bg-border` slab
  as a standard `bg-surface shadow-soft` card (muted pills, eyebrow labels) and keep the count beside
  Üben in the footer even when expanded (reset icon moves into a restructured header) → **Sonnet 5**,
  escalate on taste rounds; (6) grammar lesson: Muster + explanation become a 2fr/3fr lg grid →
  **Sonnet 5**; (3) Üben city map: tappable building stops that slide the practice card via the
  existing `goTo` pager + a real beautification pass (two-tone building illustrations, gradient
  ground/parks, tree clusters, stronger route glow, both palettes, no reward-gold) → **Fable 5**
  first choice, **Opus 4.8** fallback.
- **Key code anchors verified this session:** TypingBlock already has "Anzeigen"
  (`SessionPlayer.tsx:846-853`), SpeakingBlock has none; the count jump lives in
  `FilterRail.tsx` L458-465 + the `!open` guard at L509; graph counts in `WordGraph.tsx:575-578`;
  the map stops are not tappable today (`UebenPath.tsx:246-263`, SVG `role="img"`).
- **Constraints folded into the plan:** mission-player/mat/s90 parity untouched, focus-mode
  semantics reused not re-invented, 400 kB bundle unaffected (all touched chunks lazy), all new
  copy em-dash-free.
- **NOT done:** all six chunks (the whole plan); plus the carried-over items: the founder's human
  `verified` pass, extending the AI-jury pass to Waves 1-2, Wave-2 tranche 2 (after the 2026-07-13
  classmate feedback), the Playwright grammar smoke.

**Handoff after session 101 (2026-07-12). Üben-refinements Work item 1 SHIPPED (Opus 4.8).** The
founder said "go ahead with first point" against `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`. Two
things: Üben is now specific to where the learner is, and the speaking block can be skipped.
- **Üben relevance (engine + wiring):** new composer opt `grammarTopicId` (`engine/session.ts`) pins
  Pool 3 to a studied grammar topic with 4 drills instead of the random topic's 2, and a new exported
  pure helper **`libraryFocus({theme, sub, cefr[], sector[], category})`** translates a browse page's
  narrowed state into the existing mission-style `focus` (lead with those exact items, drop the random
  grammar/Redemittel), returning `undefined` when nothing narrows past the theme (bare-theme Üben is
  unchanged). Caps `FOCUS_VOCAB_CAP=8` / `FOCUS_REDE_CAP=4`. `Session.tsx` parses `?grammar=`/`?cat=`/
  `?sub=`/`?cefr=`/`?sector=` (priority mission > grammar > libraryFocus) and forwards `grammarTopicId`
  through a new `SessionPlayer` prop; the remount key now includes every tailoring param. Callers:
  Grammatik lesson → `?grammar=${topic.id}`, Redemittel → `?cat=` when a category is picked, Wörter +
  Kollokationen `startSession` build the URL from live theme/sub/cefr/sector (pos/srs/frequency stay
  browse-only). GrammarHub stays bare `/session` (browsing is not a location).
- **Speaking give-up:** the speaking block gained an "Anzeigen" ghost button (prompt + typed stages,
  `SessionPlayer.tsx`) that calls the existing `evaluate("")` → reveals the answer, grades FSRS 0
  (never a pass), unlocks Weiter. Mirrors the typed block; no listening-stage button (Fertig already
  routes back).
- **Tests + gates:** 5 new `tests/engine.test.ts` cases (grammar-pin honored, unknown-id fallback,
  `libraryFocus` undefined/sub/category). `pnpm typecheck` ✔, `test:unit` **121/121**, `lint` **0
  errors** (42 pre-existing warnings), `build` + prerender ✔, `check:bundle` **73.0 kB**/400.
- **Grammatik correctness pass (same session, follow-up prompt):** audited `src/data/grammar.ts` (24
  topics / 117 drills). Mechanical completeness clean (explanationDe/purposeDe/pitfalls/pitfallsDe
  present, `pitfalls`/`pitfallsDe` lengths matched for the EnPeek index-swap, every drill has
  explain+gloss, no em dashes, all MCQ answers valid). Read every topic for German correctness; fixed
  4 inaccuracies (a garbled relative-clause EN pitfall, a duplicated "dass" in the Nebensatz EN
  explanation, an awkward Futur `purposeDe`, and a non-idiomatic "discuss about" example gloss).
  `lint:content` ✔, build ✔.
- **NOT done:** Üben-plan Work items 2 (graph count), 3 (map beautify + tappable stops), 4+5
  (FilterRail desktop + count), 6 (Muster/explanation grid); the Branche-overhaul plan (s99); and the
  standing content follow-ups (human `verified` pass, jury Waves 1-2, Wave-2 tranche 2, Playwright
  grammar smoke). Browser E2E walk-through of the tailored sessions is left to the founder (sandbox
  can't reach the live site).

**Handoff after session 102 (2026-07-12). Branche filter overhaul IMPLEMENTED and shipped (plan
`docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md`, approved s99), Fable 5.** Context: the founder presents
the app to an audience 2026-07-13 and named the Branche filter a core demo feature, so the deferred
plan was executed same-day and merged to `main`.
- **Data model:** `sector?: WorkSector` → `sectors?: WorkSector[]` on VocabItem/Collocation/ReadingText
  (mechanical migration of all 575 tagged rows); `WorkSector` extended to **15** (`chemicals`, `pharma`,
  `cleaning`, `security`; `transport` relabeled "Transport & Logistik"); linter validates `sectors[]`
  (non-empty, unique, enum) and ERRORS on the retired singular `sector`. `vocabulary.ts` is now two
  concatenated literals (`vocabularyPart1/2`, TS2590 limit, same split as provenance s95).
- **Root-cause fix:** `matchesSector` in `lib/facets.ts` (untagged = universal: general words show
  under EVERY Branche; tagged hide only under other Branchen), applied as a scope cut in
  VocabularyTrainer + CollocationsBrowser with **sector-first ordering** (Fachwörter lead, general
  follow). Branche left the pill facets (no ≤12 cap, no coverage floor); `?sector=` is a single-value
  scope param (old comma-list URLs degrade to first value).
- **FilterRail** generalized from `primary`/`secondary` to an ordered **`scopes: RailPrimary[]`**
  (stable `pinId` per scope keeps saved pins); Wörter/Kollokationen pass [Branche, Thema, Unterthema?],
  Redemittel/Grammatik unchanged. Branche dropdown shows per-sector dedicated-content counts within
  the current Thema scope. **Branche chips** (`features/shared/SectorChips.tsx`) on Wörter
  Tabelle/Karten + Kollokationen Tabelle (sortable column; untagged shows nothing = general).
- **Retag audit of all 562 tagged items** (393 words, 165 collocations, 4 texts): **117 untagged**
  (shift vocabulary, PPE basics, everyday/general German: das Werkzeug, die Schicht, der Führerschein),
  **162 widened** to 2-4 sectors (die Wartung → production+trades+engineering+chemicals), **279
  confirmed**. Founder-review artifact: `docs/reports/sector-audit-report.md` (old → new + rationale
  per item, grouped by decision).
- **New content:** ~20-word packs for chemicals/pharma/cleaning/security + ~9 collocations each, a
  10-word + 4-pair Lager boost (5 existing warehouse words tagged transport). Banks now **1,113 words /
  741 collocations / 2,263 provenance rows** (all new rows `draft` with DWDS references).
- **Gates all green:** lint:content ✔, typecheck ✔, lint 0 errors, **test:unit 124/124** (new
  `tests/sectors.test.ts` pins matchesSector semantics, sector-first sort, and the v_projekt/v_bauzaun
  regression pair), build + prerender ✔, bundle **73.0 kB**/400, `build:oracles` + `verify:facts` **0
  two-oracle errors** (new nouns verified). **E2E in-browser (Playwright, dev server):** das Projekt
  visible under IT AND Bau, der Bauzaun only under Bau, new sectors list their packs, `?sector=`
  round-trips, mobile filter panel intact.
- **NOT done / follow-up:** `pnpm build:frequency-subset` + `build:frequency` for the ~91 new words
  (needs Python `wordfreq`; absent bins are fine, linter only errors on stale ids); founder review of
  `sector-audit-report.md`; the human `verified` pass via `pnpm review:queue`; jury-pass extension to
  Waves 1-2; Wave-2 tranche 2 after the 2026-07-13 classmate feedback; Playwright grammar smoke.

## Handoff after session 103 (2026-07-12). Üben-refinements Work items 2, 4+5, 6 SHIPPED (Sonnet 5).
The founder said "go ahead with sonnet 5 items in the ui refinement plan" against
`docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`; work item 1 was already shipped (s101, Opus 4.8), item 3
(map beautification) stays for Fable 5 / Opus 4.8.
- **Item 2 (graph word count):** `WordGraph.tsx` canvas legend now shows only "m Verbindungen"; the
  word count moved to the shared `count` prop, so it sits beside Üben in the rail (desktop) and the
  sticky mobile action bar in `VocabularyTrainer.tsx`, exactly like every other Wörter view.
- **Items 4+5 (FilterRail desktop redesign + count always beside Üben):** restyled both the desktop
  rail and the mobile panel as a standard content card; header became a flex row (toggle + permanent
  reset icon); the result count sits beside Üben in every state. (Superseded in part by s104's grey
  tile and 2026-07-13's flex-column scroll rebuild.)
- **Item 6 (grammar lesson Muster/explanation side by side), `GrammarTopicView.tsx`:** `CardContent`
  gains a `lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]` at ≥1024px; mobile keeps the stacked
  order.
- **Gates:** typecheck ✔, lint 0 errors, test:unit 129/129, build ✔, bundle 73.0 kB. NOT done at the
  time: Üben-plan item 3 (map), content follow-ups, sector-audit review.

**Handoff after session 104 (2026-07-12, parallel to s103 and rebased onto it). Üben map re-spaced +
recolored via mockup rounds (Fable 5, Üben-refinements Work item 3, completed by the follow-ups).** The founder asked for
map mock-ups, iterated three rounds, and picked a direction that was then shipped to `main`.
- **Mockup rounds (preview sheet `preview/ueben-map-mockups.html`, delivered as a claude.ai artifact
  link):** R1 = the plan's illustrated-buildings recipe in 3 variants (rejected: "doesn't look good");
  a pixel-art village round against founder-shared Zelda/Pokemon-style references was **abandoned
  mid-review by founder choice** ("let's not waste resources"; never committed); R2 = the live map
  re-spaced + 4 color moods (`-r2-farbstimmungen.html`); R3 = founder picked Stimmung 3 (Brand-Ton)
  but its dark was too dark → 4 brighter dark variants (final sheet). **Founder picks: Stimmung 3
  light + "Dunkel D: Klarer Abend" dark.** R1/R2 are archived beside the final sheet
  (`preview/ueben-map-mockups-r1-beautify.html`, `-r2-farbstimmungen.html`). The pixel-art reference
  images were shared inline in chat and could not be exported to files; drop them into
  `preview/references/` if they should be kept.
- **Shipped in `UebenPath.tsx`:** street grid re-spaced (H y=88/170, V x=76/176/276; tiles Bahnhof
  [44,48], Laden [120,48], Zuhause [310,128], Amt [216,205]) so **no landmark tile hugs a map edge**
  (Bahnhof was 13 px, Amt 10 px from the edge); SEG_PATHS + parks/lots re-laid to the new blocks.
  **MAP_LIGHT = Brand-Ton** (indigo-tinted ground `#eef0f7` + lavender lots, green parks stay the
  contrast), **MAP_DARK = Klarer Abend** (deliberately bright blue-grey ground `#2e3450`, near-white
  labels `#dde1f2`; the old night palette was rejected as too dark/low contrast). New palette field
  **`route`**: the journey line/pin now use `P.route` instead of `hsl(var(--primary))` because the
  dark map needs a brighter indigo (`#a6a6fd`) than the dark `--primary` token on the lifted ground.
- **Gates:** typecheck ✔, lint 0 errors, test:unit **129/129**, build + prerender ✔, bundle **73.0
  kB**/400. **Verified in the real app** (vite preview + Playwright, 390x844): light + dark dashboards
  render the picked palettes exactly as mocked.
- **Follow-up (same session, from the founder's live screenshot):** at a fresh state the pin +
  pulse ring landed exactly on the Bahnhof label and the chip covered the tile. Fix: per-stop
  `labelPos`/`chipPos` (top-row stops label ABOVE the tile, chip RIGHT of the pin; Zuhause/Amt keep
  below/right labels and the above-chip), the Laden park reshaped to a vertical strip right of the
  tile + the top-left lot shrunk so the above-labels sit on clean ground. The founder kept the
  dotted future-route at full strength (a proposed quieter dotting was reverted on their call).
  Second follow-up: **the landmark tiles are now tappable** (per-stop `role="button"` groups; tap
  slides the practice card to that stop's first unplayed mission via `stopTarget` + the existing
  `goTo`, 44px invisible hit rects, hover/focus scale + focus ring, Enter/Space; the pin never
  moves) and the **pin was shrunk to 70%** (scaled about its tip; chip offsets retuned).
  Re-verified in-app across fresh/boss-done/mid states, light + dark; tap-routing checked per stop
  (Bahnhof with 1.1 done goes to 1.2, done stops go to their first mission).
- **NOT done:** the standing content follow-ups (frequency subset for ~91 new words, founder review
  of `sector-audit-report.md`, human `verified` pass, jury Waves 1-2, Playwright grammar smoke).
  With s103's items 2/4+5/6 shipped in parallel and the tappable stops in this session's follow-up,
  **the Üben UI-refinements plan is fully shipped**.

**Handoff after session 104 (2026-07-13). Bibliothek pre-demo round SHIPPED (Opus 4.8, mid-session
model switch from Sonnet 5).** A same-day founder round the day of the presentation, in two batches.
Batch 1 (two founder lines): scope dropdowns must be multi-select, and the reset must clear them.
Batch 2 (one long mid-turn message): a grab-bag of visual/UX fixes. All shipped together.
- **Multi-select scope dropdowns (reverses the s84 single-select lock; `AskUserQuestion` → "All scope
  dropdowns"):** `FilterRail.tsx` grew a hand-built checkbox popover `ScopeMultiSelect` (Radix `Select`
  is single-value); `RailPrimary` moved from `value`/`onChange(v)` to `values: string[]`/
  `onChange(values)`. `matchesSector`/`sectorFirst` (`lib/facets.ts`) + `themeGroupsForMode`
  (`lib/themeGroups.ts`) now take arrays (OR-within). Every browse page
  (Wörter/Kollokationen/Redemittel/Grammatik) reads its scope params as comma-lists. Sub-theme
  drill-down + travelling `useLibraryScope` engage only with exactly one active Thema; `startSession`
  collapses multi-Thema/Unterthema to the first value (composer biases one theme) but forwards every
  Branche. `tests/sectors.test.ts` updated to the array API + an OR-within case (130/130).
- **Reset clears scopes too** (was `onChange({})` only) and the active-count badge counts scopes +
  facets.
- **Filter tile is subtle grey again** (`bg-muted`, reversing s103's `bg-surface`): the founder found
  white-on-white too low-contrast. Controls inside stay white (`bg-surface` scope triggers + unselected
  facet pills) so they pop. See DECISIONS.md s104 for the s92→s103→s104 contrast arc.
- **Rail fills the viewport** (`lg:max-h-[calc(100vh-7rem)]`, was `-22rem`) with a **slim visible
  scrollbar** (`.slim-scrollbar` in `index.css`, replaced `no-scrollbar`).
- **Dropdown "Alle X" numbers show the option count** (15 Branchen / 15 Themen), not the item total,
  in the muted pill-number format; per-option counts unchanged.
- **Desktop search grows inline in the toolbar row** (`hidden lg:block lg:flex-1`); mobile keeps its
  own second row.
- **Wörter facet order:** Wortart moved up (after Thema/Unterthema), Stufe (CEFR) moved to the end.
- **Redemittel:** per-category card section headers removed → flat card grid; **Kategorie is now a
  16-pill multi-select facet** in the filter (`CATEGORY_FACET`), not a scope dropdown; `?cat=`/
  `?register=` both ride the facet selection; facets apply last over the full bank.
- **Grammatik hub cards** show ONE clean pattern (`pattern.split(" · ")[0]`) in the emerald Muster tint
  (was a truncated " · " fragment) + a bigger icon tile; **drill options** (`GrammarDrillCard.tsx`) got
  a `bg-muted/50` idle fill so they read as tappable answers, not disabled fields. (The lesson layout
  itself was already solid post-s93/s103; this was the "pre-demo sweep".)
- **Gates:** typecheck ✔, lint **0 errors** (42 pre-existing warnings), test:unit **130/130**, build +
  prerender ✔, bundle **73.0 kB**/400. Browser-verified (Playwright, dev server): grey tile + white
  pills/dropdowns, Branche multi-select checkbox popover with per-option counts, "15" option counts,
  inline desktop search, gray mobile filter panel, Grammatik cards. Founder verifies the live result.
- **NOT done:** Üben-plan Work item 3's **tappable stops** (the map re-space/recolor shipped in the
  parallel s104 handoff above; only the tap-to-slide-card sub-task remains); the standing content
  follow-ups (human `verified` pass, jury Waves 1-2, Wave-2 tranche 2, Playwright grammar smoke);
  founder review of `sector-audit-report.md`. Note: 16 Kategorie pills exceeds the ≤12 facet-hygiene
  guideline (a dev-only warning), accepted because the founder explicitly wanted the group names as
  pills.

**Handoff after session 105 (2026-07-13). Demo-prep sweep: nav rename + hide Anwenden, AI-disclaimer
feedback button (emails founder), Fortschritt redesign, flippable Bibliothek tiles, filter polish
(Opus 4.8).** A single long turn against many interleaved founder prompts (branch
`claude/demo-prep-feedback-rename-sl1jqq`, merged to `main`).
- **Nav (`nav-items.ts`, `BottomTabBar.tsx`, `LibrarySwitcher.tsx`, `route-icons.tsx`):** "Heute" →
  **"Praktisch"**, "Bibliothek" → **"Theorie"** (routes `/` and `/library` unchanged). **Anwenden is
  HIDDEN from the nav** (removed from `navItems`, `CONTENT`, `DEFAULT_PINNED_TABS`) but its route stays
  mounted so `/welt` + deep links still resolve; re-add the `navItems` entry to restore it. The
  Praktisch mark changed from a house to a **dumbbell** (`route-icons.tsx` "/" renderer + NORM box; the
  lucide fallback is now `Dumbbell`).
- **Feedback + AI disclaimer (`FeedbackButton.tsx` in AppShell, `lib/feedback.ts`,
  `supabase/functions/submit-feedback/`, migration `0006_feedback.sql`, `config.toml`):** a subtle
  fixed "Mit KI gebaut · Feedback" pill on every non-focus page (bottom-right desktop, above the nav +
  Üben bar on mobile). Opens a dialog (message + optional email); posts to the new `submit-feedback`
  Edge Function (`verify_jwt=false`, anonymous-OK), which **stores a `feedback` row AND emails the
  founder via Resend**. **Founder deploy step needed for emails** (see `docs/plans/PHASE2_SETUP.md`
  new section): run the migration, `supabase functions deploy submit-feedback`, set `RESEND_API_KEY`.
  Without it the UI still works and rows still store once deployed; email is best-effort.
- **Fortschritt redesign (`Analytics.tsx`):** the chaotic ~11-card stack became a calm grouped
  hierarchy: an **Überblick** card (goal ring + Level + XP bar) then a 2×2 lifetime stat grid; a
  **Dranbleiben** subsection with the weakness diagnose + next quest as a side-by-side pair (was two
  stacked full-width alert cards); **Was du schon kannst** (Can-Do); Meine Sammlung; and a **Details**
  collapsible that now also holds the writing-weakness + exam-history cards. New `Subheading` helper.
- **Bibliothek/Theorie tiles + filter (founder ran ~10 follow-ups):** (1) **Flippable Karten tiles**
  (`FlipCard.tsx`): Wörter/Kollokationen/Redemittel grid cards flip on click to show the **English on
  the back**; German front. Grammatik cards stay lesson-launchers (not flipped). (2) **Verbunden moved
  to the bottom-right** of Wörter cards. (3) **Redundant tags dropped** from tiles (Häufigkeit + Branche
  on Wörter, Register on Kollokationen, CEFR + Register on Redemittel, CEFR on Grammatik) since they
  duplicate filter facets; the live Lernstand badge stays. (4) **FilterRail rebuilt as a flex column**
  (`FilterRail.tsx`): fixed header + fixed Üben footer + ONE inner scroll region, so the tile is
  strictly viewport-capped and the auto-hiding `.scrollbar-hover` (new, in `index.css`) starts **below**
  the header separator; **pins hidden on the mobile panel**. (5) **"Mehr/Weniger anzeigen"** on facets
  with > 8 options (Redemittel Kategorie, Grammatik Gruppe). (6) **Grammatik Gruppe converted from a
  scope dropdown to a multi-select PILL facet** (`GROUP_FACET`) matching Redemittel Kategorie — both are
  multi-select. (7) **Toolbar row centered when search is closed; opens with a framer slide** (icon
  groups slide apart for the inline search field) across all four browse tabs. (8) The desktop-header
  XP line under the greeting was removed.
- **Gates + verification:** typecheck ✔, lint **0 errors** (42 pre-existing warnings), content-lint ✔,
  `test:unit` **130/130**, build + prerender ✔, `check:bundle` **75.8 kB**/400. Playwright-verified on
  the preview build (0 runtime errors on Praktisch/Theorie Wörter+Grammatik/Fortschritt, desktop +
  mobile): nav rename, dumbbell icon, feedback pill placement (clears the mobile Üben bar), flip-card
  fronts, dropped tags, grammar group pills + "Mehr anzeigen (8)", centered toolbar, Fortschritt groups.
- **Bibliothek follow-ups (same session, second turn):** (a) **all filter-duplicating tile tags
  removed** — the Lernstand/mastery badge off Wörter cards and the group-label subtitle off Grammatik
  cards (only plural + bookmark stay on Wörter); (b) **flip icon removed** from every tile (`FlipHint`
  kept in `FlipCard.tsx` but unused; tiles still flip on click); (c) **filter-rail white items smaller
  on desktop** (`lg:text-xs` + tighter padding on facet pills + scope triggers; mobile tap size kept);
  (d) **graph fit-to-screen now toggles** — first press fits, next press zooms into a random often-used
  word (weighted by wordfreq); (e) **tag audit**: all 1,113 vocab + 741 collocations have valid
  themeId + sectors (0 issues); the untagged majority is universal by design, so no content edits; (f)
  backlog #26 added (`PROJECT_REFERENCE.md`): **Verbs + Articles hubs** in Theorie.
- **NOT done / deferred:** the founder's "reorderable list" phrasing for the filter groups was read as
  the pill-list + Mehr/Weniger presentation; **drag-to-reorder of filter categories was NOT built**
  (no functional purpose for OR-filters, deferred). Standing content follow-ups + Üben map tappable
  stops + sector-audit review remain from prior sessions.


**Handoff after session 106 (2026-07-13). Üben-map pin polish: sizing/color fix + a toggle/heading
layout-shift bug (Sonnet 5), shipped straight from two founder screenshots/reports on branch
`claude/pin-sizing-color-6lofhi`, merged to `main`.**
- **"Du bist hier" pin (`UebenPath.tsx`):** the pulse ring (r 12→8, stroke 2→1.5) and the chip
  (`px-3 py-1 text-[11px]` → `px-2 py-0.5 text-[9px]`) were oversized relative to the small pin glyph;
  both shrunk to hug it. The pin (and its pulse ring) switched from the route indigo to a dedicated
  red (`PIN_COLOR = "#e5484d"`) per founder request, so the live-location marker reads distinctly from
  the indigo journey line; the pin's white inner ring/dot are unchanged.
- **Heute toggle/heading layout-shift bug (`Dashboard.tsx`):** on desktop the Üben/Spielen toggle sits
  above the tab content inside a `justify-center`d flex column, and the two panels render at different
  natural heights (Üben ~581px, Spielen ~607px), so the whole stack's centered position — and thus the
  toggle's screen position — shifted on every Üben ↔ Spielen switch. Diagnosed with a headless
  Playwright probe against the dev server (bypassing onboarding via a seeded `b2beruf.settings.v1`
  localStorage key): the toggle moved ~13px and both panels' own `<h1>` moved with it on every switch
  (confirmed before/after with real bounding-box measurements, not just code reading). Fix: the sliding
  content wrapper now reserves the taller panel's height (`lg:min-h-[38rem]`, Spielen's ~607px) so the
  toggle+content stack's total height — and therefore its `justify-center`d position — stays constant
  regardless of which tab is active. Mobile was already unaffected (normal document flow, not
  flex-centered).
- **Gates:** typecheck ✔, lint 0 errors (pre-existing warnings only), `pnpm build` + prerender ✔,
  `check:bundle` **76.9 kB**/400. Browser-verified with Playwright against the dev server at mobile
  (390×844) and multiple desktop widths (1024–1920px): toggle and heading now sit at identical
  bounding-box coordinates before/after every tab switch.
- **Shipped:** PR opened and squash-merged into `main` (was previously only on the feature branch;
  per this repo's rule, feature-branch pushes never go live on their own).
- **NOT done:** no other follow-up requested this session; standing content/Üben-map follow-ups from
  prior sessions (human `verified` pass, jury Waves, sector-audit review) remain untouched.

**Handoff after session 107 (2026-07-13). Demo-prep polish continued: compass Praktisch icon, feedback
placement, content-scoped Üben, mobile scroll UX, graph zoom, centered Üben label, Lernen/Blau toggle,
desktop white-block fix (Opus 4.8).** Continuation of the s105 demo sweep on branch
`claude/demo-prep-feedback-rename-sl1jqq`, shipped as two squash-merged PRs (#486, #488).
- **Praktisch nav icon → compass** (`route-icons.tsx` "/" renderer + NORM box, `nav-items.ts` lucide
  fallback `Compass`), replacing the dumbbell; founder wanted a "real-life orientation" mark.
- **Feedback button reworked (`FeedbackButton.tsx`, store-controlled via `useSessionStore.feedbackOpen`):**
  one app-mounted `FeedbackDialog` + three trigger surfaces — desktop bottom-right pill (skips `/`),
  mobile action-bar **icon** left of Üben (no floating pill over content), and a full "Feedback geben"
  button inside practice sessions (`SessionPlayer`). All use the **MessageSquareText** icon so the
  affordance reads as feedback.
- **Content-scoped Bibliothek Üben (`engine/session.ts` `buildScopedSession` + `ContentScope`,
  `useSessionStore.librarySession`, `Session.tsx` `?src=lib`, `SessionPlayer` contentScope/libraryIds):**
  each browse tab hands its filtered ids to a content-PURE session, so Üben on Redemittel drills
  Redemittel only, a Grammatik group drills that group only, etc. (was leaking generic vocab before).
  `SessionBlock` flashcard source union gained `"collocation"` (XP-only grade, no vocab FSRS).
- **Mobile browse scroll UX (`features/shared/browseScroll.tsx`, new):** `useScrollDirection` collapses
  the tabs+toolbar on scroll-down / restores on scroll-up (mobile only via `max-lg:` guard) and drives a
  centered `ScrollTopButton` above the Üben bar. `browseHeaderClass(hidden, scrolled)` now applies the
  opaque masking background **only when scrolled**, on both breakpoints.
- **Desktop "white block" fix:** the sticky tabs+toolbar header used to paint an always-on
  `bg-background/90` rectangle, showing a hard-cornered white block beside the tabs (above the filter
  rail) at rest. Now transparent at rest, backdrop fades in on scroll to mask pinned-header content.
  Reproduced + verified fixed with Playwright at 1280×900.
- **Wörter graph (`WordGraph.tsx`):** opens **zoomed into a readable random node** (k≈2.2) instead of
  fit-to-all; the legend is visible by default on mobile and doubles as domain filters.
- **Centered Üben label (`UebenLabel` in browseScroll):** the word "Üben" is centered in the button with
  the bolt icon floating to its left (absolute, no layout space), across all four trainers.
- **Praktisch toggle rename + recolor (`Dashboard.tsx`):** left mode "Üben" → **Lernen** (blue
  `text-blue-600` + `BookOpen` icon) so it no longer clashes with the Theorie Üben button; "Lernen /
  Spielen" reads as a pair. Spielen stays orange. Founder picked Lernen + Blau from preview options.
- **Post-ship follow-ups (same session, PRs #490, #491):** (a) the **compass** route accent moved to the
  nav blue `#2563eb` (so the ring AND the active-tab underline match the other nav marks) with a
  **thicker ring** (r8/stroke 2.7); (b) the **Üben-map onward route** is drawn per straight run with its
  dash pattern **phase-locked to the street lane dashes** (opaque, "7 9" period, offset = start-coord mod
  16, in `SEG_RUNS`) so route dashes land exactly on the lane markings instead of scattering as dots;
  (c) the pin's **pulse ring is a muted theme-aware gray** (`pulseRing`, was red) while the pin stays red;
  (d) the **Lernen toggle book fills when active** and, per a follow-up, uses a **custom open-book mark
  (`LernenBook`) with a ~2px transparent center gutter** so the two pages stay distinct when filled
  (lucide `BookOpen` dropped from the toggle). All Playwright-verified; gates green each ship.
- **Gates:** typecheck ✔, lint **0 errors** (43 warnings), content-lint ✔, `test:unit` **130/130**,
  build + prerender ✔, `check:bundle` **~77 kB**/400. Playwright-verified: white-block gone at rest +
  masks on scroll, toggle Lernen/blue live, compass blue, map dashes aligned, gray pulse ring, filled
  book with center gutter.
- **NOT done:** standing content/Üben-map follow-ups (human `verified` pass, jury Waves, sector-audit
  review) remain; the s105 "reorderable filter list" is still read as pill-list + Mehr/Weniger (no
  drag-reorder).

## Session 108 (2026-07-13) — CRITICAL account data-isolation bug (Resume-here handoff, archived from PROJECT_STATUS s110)

**Handoff after session 108 (2026-07-13). CRITICAL account data-isolation bug (Opus 4.8), on branch
`claude/account-data-isolation-bug-s517d1`.** Founder report: on a phone, switching between accounts
showed one account's progress under another.
- **Root cause:** `useProgressStore`/`useSettingsStore` persist to **device-global** localStorage keys
  (`b2beruf.progress.v1` / `.settings.v1`) shared by every account on the device. `startCloudSync(uid)`
  **merges** the incoming account's cloud row into whatever local cache is left from the previous account
  (`Math.max` / union / `mergeSrs`), then in step 2 **pushes that merged result up to the new account's
  cloud row**. Nothing cleared the cache on sign-out or account switch. So account A's XP/streak/SRS/saved
  words leaked into account B's view **and were written into B's cloud row**, propagating to all of B's
  devices. Settings leaked too (`mergeRemoteSettings` bails out when `local.onboarded` is already true, so
  B kept A's name/level).
- **Fix (`lib/cloudSync.ts`):** a persisted `b2beruf.syncUid` marker records which account owns the local
  cache. `startCloudSync` reads it first; if the incoming uid differs, it `resetLocalStores()` (wipes
  progress + settings back to defaults) **before** the pull/merge/push, so nothing cross-account can merge
  or upload. The marker is (re)written on every sync. A missing marker (first-ever sync, or an install
  predating this build) is treated as "same owner" so genuine offline/guest progress is preserved, and the
  guest→account upgrade keeps the same uid so it never hits the wipe branch. New exported
  `clearLocalAccountData()` (reset stores + forget the marker) is called from `useAuthStore.signOut` and
  `deleteAccount`, so the sign-in screen and the next account on a shared device never see stale data.
- **Tests:** `tests/cloudSync.test.ts` (new, mocks `@/lib/supabase`) pins four invariants: a different
  account wipes the previous cache before syncing and never pushes the old data up; the first/guest sync
  preserves local progress (merge, not wipe); the same account re-syncing does not wipe; and
  `clearLocalAccountData` zeroes both stores + the marker.
- **Gates:** typecheck ✔, lint **0 errors** (43 pre-existing warnings), `test:unit` **134/134**, `pnpm
  build` + prerender ✔, `check:bundle` **77.4 kB**/400, `lint:content` ✔.
- **NOT done / consider next:** the local cache is still a single device-global key that is wiped-and-
  reloaded on switch (correct + robust, but a future hardening could namespace the persist key per uid to
  avoid any wipe entirely). Live verification on a real phone with two accounts is left to the founder
  (sandbox can't reach the deployed site). Standing content/Üben-map follow-ups remain untouched.

**Handoff after session 109 (2026-07-13). Two founder bug reports from phone screenshots: the ugly
"App failed to load" screen + the Wörter graph opening too zoomed-out (Opus 4.8), on branch
`claude/app-loading-screen-5av7dt`, shipped as PR #496 (squash-merged `b6998ee`).**
- **"App failed to load" screen (offline SW-update crash):** the reported screenshot was taken in
  **airplane mode**. On app resume, `lib/swUpdate.ts` calls `reg.update()` (no `.catch()`) to check for a
  new deploy; offline / on any transient network blip the browser can't fetch `sw.js`, so `update()`
  rejects with *"Failed to update a ServiceWorker … An unknown error occurred when fetching the script"*.
  That unhandled rejection tripped `main.tsx`'s global handler → the raw monospace `paintFatal` screen,
  **over a working app** (it runs from the precache). Fix: (1) `swUpdate.ts` swallows the best-effort
  `update()` rejection with `.catch()`; (2) new `isServiceWorkerError()` in `lib/recover.ts`, and both
  global `error`/`unhandledrejection` handlers in `main.tsx` now ignore SW registration/update failures
  (non-fatal); (3) `paintFatal` repainted as a calm branded card (headline + *Neu laden* button) with the
  raw error/stack behind a collapsed *Technische Details* expander (mobile-debug net preserved).
- **Wörter graph default zoom (`features/vocabulary/WordGraph.tsx`):** opened at `k=2.2` (max node radius
  is only 12 world units, so the biggest circle was ~26px). Raised the initial open zoom to `k=3.4` and
  centered the opening view on an **area-weighted (frequent)** node (r² ∝ wordfreq) so it lands among
  common, well-connected words instead of a lone rare word in an empty corner. The fit button's
  zoom-to-frequent-word target was matched to the same `k` (was 2.6).
- **Gates:** typecheck ✔, lint **0 errors** (43 pre-existing warnings), `pnpm build` + prerender ✔,
  `test:unit` **134/134**.
- **NOT done:** live verification on a real phone (offline crash no longer appears; graph zoom feel) is
  left to the founder (sandbox can't reach the deployed site). Standing content/Üben-map follow-ups remain.

## Session 110 (2026-07-13) — Bibliothek tab-switch slide animation (archived from PROJECT_STATUS s112)

**Handoff after session 110 (2026-07-13). Bibliothek tab-switch slide animation (Opus 4.8), on branch
`claude/bibliothek-slide-animations-hdf738`.** Founder: switching between the four Bibliothek/Theorie
tabs loaded the content abruptly; wanted a snappy left/right slide. (Code shipped as PR #495 / `43761a3`,
which merged just before the session-109 fixes above; documented here as a distinct handoff.)
- **Change:** `LibraryHub` (`src/features/library/LibraryHub.tsx`) computes the tab-index direction
  (target vs. previous, via a `useRef`) and wraps the segment in `<div key={tab}>` with a
  `.lib-slide-in-right` / `.lib-slide-in-left` class. The four segments already remount per `?tab=`, so
  the mount-time keyframe replays each switch: the incoming panel slides in ~220ms from the side tapped
  toward (forward = from the right) and fades up (`cubic-bezier(0.22,1,0.36,1)`). Enter-only (the old
  panel is swapped out instantly), which keeps it snappy and avoids double-mounting two heavy lazy lists.
- **Why a CSS keyframe, not a framer transform wrapper:** the tab bar (`LibrarySwitcher`) lives INSIDE
  each segment, and the segments rely on `position: sticky`/`fixed` descendants (desktop filter rail,
  mobile sticky Üben action bar, fixed scroll-top button). A persistent `transform` at rest establishes a
  containing block and would trap all of those. The keyframe (`.lib-slide-in-*` in `index.css`) uses the
  **default `none` fill-mode**, so the transform exists only during the slide and reverts to none at rest.
  Global `html`/`body` `overflow-x: clip` means the 1.25rem offset adds no scrollbar; the existing global
  `prefers-reduced-motion` rule already neutralises it.
- **Gates:** typecheck ✔, `pnpm build` + prerender ✔, `check:bundle` **77.4 kB**/400, `test:unit`
  **134/134**. **Shipped:** PR #495 squash-merged to `main` (`43761a3`).
- **NOT done / consider next:** it is enter-only, not a full swipe (old panel doesn't slide out); a true
  swipe would need AnimatePresence keeping both segments mounted, which double-mounts the heavy lists and
  reintroduces the `library-tab-pill` layoutId collision, so it was deliberately skipped. The whole panel
  (incl. the tab bar, since the bar is inside each segment) slides subtly; offset kept small (~20px) so it
  reads as content, not a bar jump. Live visual confirm on the deployed site is the founder's.

---

## Session 111 (2026-07-13) — Demo-readiness plan authored + baseline verified (archived from PROJECT_STATUS s112)

**Handoff after session 111. Demo-readiness PLAN authored + baseline verified (Fable 5); implementation
intentionally NOT started.** The demo is 2026-07-14 (founder presents live, then shares the link; both a
seeded account and a clean profile are wanted). The founder is nearly out of Fable for the week, so the
plan routes every implementation chunk to Opus 4.8 / Sonnet 5 and defers Fable-grade work to next week.
- **Baseline verified on `main` (ae0c2fc):** all 9 gates green (typecheck; lint 0 errors / 44 deliberate
  warnings; lint:content; test:unit 134/134; test:srs 323; test:pronounce 26; audit 0 vulnerabilities;
  build + prerender; bundle 79.5 kB/400). Security greps clean (no secrets, no XSS sinks, every
  `target="_blank"` carries `rel="noreferrer"`, only public keys reach the client). Confirmed:
  `public/404.html` SPA fallback exists; the PWA is `autoUpdate`; `evaluate-writing` has daily + monthly
  cost caps.
- **Known gap found:** `submit-feedback` had NO rate limit (fixed in s112 Chunk 3).
- **Plan chunks (P0):** 1 Playwright smoke test (Sonnet 5) · 2 regression review (Opus 4.8) · 3 abuse
  hardening (Opus 4.8) · 4 UI polish (Sonnet 5) · 5 `docs/DEMO_RUNBOOK.md` + demo states (Sonnet 5). P1:
  6 perf sanity. P2 next week: Fable content proofread (done s112) + full security review.
- **Artifacts:** `docs/plans/DEMO_READINESS_PLAN.md` (new) + doc updates.

**Handoff after session 112 (2026-07-13). Demo-readiness P2 content-accuracy pass shipped (Fable →
Opus 4.8), on branch `claude/predemo-plan-fable-tasks-gdray4`.** The plan's P2 "content accuracy pass"
(proofread demo-visible German beyond the automated checkers). Content-only; no app logic changed.
- **verify:grammar fixes (real findings only):** `r_neg7` `auf einander`→`aufeinander`; `r_cla6`
  straight→curly closing quote; dialogue `k3a` `Dieses`→`dieses` after a colon; dialogue `s4b`
  `du`→`Du` after a colon; 4 texts `den`→`dem` ("am Dienstag, dem 14. Juli");
  `tx_wohnen_email_besichtigung` `gern`→`gerne` clash + "Die Kaution beträgt"→"Als Kaution verlangen wir".
- **verify:cefr FLAG retags:** `v_umwelt`→B1.1, `v_vermeiden`→B1.2, `v_muell_vermeiden`→B1.2,
  `v_energie_sparen`→B1.1, `v_bewusst`→B2.1, `v_zudem`→B2.1.
- **Proofread clean (no edits):** all 6 Kapitel-1 mission scripts, the 6 top-spine grammar lessons,
  the 7 help articles.
- **Jury sidecar + verification map:** +39 reviewed ids to `jury-review.json`; `pnpm build:verification`
  regen also fixed a stale generated `verification.ts` (2,110→2,263 records, jury 149→188; the s102
  Branche collocation packs were missing).
- **Gates:** all 9 green (typecheck; lint 0 err/44 warn; lint:content; test:unit 134/134; test:srs 323;
  test:pronounce 26; audit 0; build+prerender; bundle 79.5 kB/400).

**Handoff after session 112 (2026-07-13). Demo-readiness Chunks 2 + 3 shipped (Opus 4.8), on branch
`claude/predemo-opus-tasks-ek5qhz`.** The two Opus "Tonight A" chunks of `DEMO_READINESS_PLAN.md`:
regression review of the s102–110 demo-prep rounds + abuse hardening of the public feedback path.
- **Chunk 2 (regression review) — findings:** fixed the two stale "(Heute)" strings the rename left
  behind (`Session.tsx` session-empty-state eyebrow → "Praktisch"; the `hilfe/erste-schritte` help
  article DE+EN → "(Praktisch)", reprerendered). Verified SAFE with no change needed: (a) the
  returning-user `pinnedTabs`/`ROUTE_SUCCESSOR` migration — `BottomTabBar` filters pins to
  `CONTENT=["/library","/analytics"]` and `BarTab` returns null for unknown paths, and `Sidebar`
  renders `navItems` directly, so a stale `/anwenden` pin from a pre-s105 device can't break either
  bar; (b) the feedback surfaces (pill desktop-only + off `/` + off focus/missions, dialog mounted
  app-wide, graceful failure); (c) `/session` junk-param handling (`mission`/`grammar`/`theme`/`cefr`/
  `sector`/`cat`/`sub`/`min` all fall back, never crash).
- **Chunk 3 (abuse hardening) — shipped:** `submit-feedback` (`supabase/functions/submit-feedback/`)
  now has two **migration-free** guards: a per-IP burst limit (≤5 / 10 min, in-memory, hashed IP) and
  a DB-backed global hourly email ceiling (≤60/hr stops the email but still stores the row). Friendly
  German error preserved. RLS re-checked across 0001–0006 (all owner-scoped to `auth.uid()` or the
  founder-email gate; `feedback` + `ai_usage` service-role-only; no public SELECT). `delete-account` +
  `evaluate-writing` re-confirmed JWT-gated + CORS-allowlisted; evaluate-writing keeps its daily/
  monthly/per-user caps. Founder console steps added to `docs/plans/PHASE2_SETUP.md`.
- **Follow-up (post-merge, same day): the feedback backend was never deployed.** Activating the rate
  limit surfaced that `submit-feedback` had never been deployed at all (authored s105, deploy step never
  ran), so the table + function + Resend key did not exist in Supabase and the live feedback button was
  non-functional. The founder has no local terminal (repo-only), so they set it up **via the dashboard**:
  created `public.feedback` (migration 0006 SQL in the SQL Editor), created the `submit-feedback` Edge
  Function with **Verify JWT OFF** (anonymous feedback allowed), and set `RESEND_API_KEY`. **Feedback is
  now live end-to-end, including the s112 rate limit.** (A GitHub-Actions auto-deploy workflow was offered
  as a future convenience, not built.)
- **Gates:** all green — typecheck ✔, lint 0 errors/44 warnings, lint:content ✔, test:unit 134/134,
  test:srs 323, test:pronounce 26, build+prerender ✔, check:bundle 79.5 kB/400.
- **Remaining plan chunks:** 1 Playwright smoke test (Sonnet 5), 4 UI polish (Sonnet 5), 5 demo runbook
  `docs/DEMO_RUNBOOK.md` (Sonnet 5), 6 perf sanity (Sonnet 5, P1). See `DEMO_READINESS_PLAN.md`.

## Handoff after session 113 (2026-07-13) — Theorie tab-transition + compass-icon + feedback-pill polish (Opus 4.8)

**On branch `claude/theory-toggle-transitions-hloi6s`, merged to `main` across PRs
#506/#509/#511/#512.** UX-only, no logic/data change. (Session 114 later refined the tab *pill* glide on
top of this. Moved out of `PROJECT_STATUS.md` Resume-here in s113-branding per the two-handoff rule.)
- **Theorie tab slide (four founder rounds):** switching Wörter/Kollokationen/Redemittel/Grammatik used
  to flash blank + reload. **R1** swapped the enter-only CSS keyframe + `Suspense fallback={null}` for the
  Praktisch `AnimatePresence` directional `x`-slide + skeleton (removed the dead `.lib-slide-in-*`
  keyframes). **R2 (the structural fix):** the `LibrarySwitcher` (tab bar) was rendered INSIDE each
  trainer, so it sat in the animated subtree and the tabs themselves reloaded on every toggle. **Hoisted
  the switcher into `LibraryHub` as one static element** (only the content slides now, true Praktisch
  parity), removed `<LibrarySwitcher/>` from the 4 trainers + `GrammarTopicView` (else the lesson doubles
  the bar), and **preload all 4 tab chunks on mount** so a switch never hits the loading skeleton. Desktop
  tabs sit at content-column width (col 1 of the same `[1fr,16rem]` grid). **R3 (feel):** `mode="wait"`
  felt slow and its blank fade-out gap read as heavy, so switched to **`mode="popLayout"`** (leaving panel
  popped out of flow, panels cross at once, no empty beat, no jump; presence wrapped in a `relative`
  container), duration 0.16→0.13, snappy ease `[0.22,1,0.36,1]`, slide carries the motion. **R4:** eased
  0.13→**0.15** (a touch too snappy). framer resolves the resting `x:0` to `transform:none`, so the sticky
  filter rail / Üben bar are not trapped. Verified in Chromium (1280/1600/390-wide): one bar per surface,
  static tabs, no skeleton flash, no horizontal scrollbar, no jump.
- **Compass icon:** the Praktisch route mark is a thin outline ring that read smaller than its neighbors;
  bumped its optical weight `0.95→1.05` in `route-icons.tsx` `NORM` so it matches
  Theorie/Fortschritt/Einstellungen.
- **Feedback pill (R4):** the desktop "Mit KI gebaut · Feedback" pill was anchored by its right EDGE at
  the FilterRail's center, so it hung half its width to the left. Added `lg:translate-x-1/2` in
  `FeedbackButton.tsx` so its center lands on the rail center (measured 0px diff at 1280 + 1600 wide).
- **Files:** `src/features/library/LibraryHub.tsx` · `src/index.css` · `route-icons.tsx` ·
  `src/features/{vocabulary,collocations,redemittel,grammar}/*` + `grammar/GrammarTopicView.tsx` (removed
  in-tree `LibrarySwitcher`) · `src/components/layout/FeedbackButton.tsx`.
- **Gates:** typecheck; lint 0 err/44 warn; test:unit 134/134; build+prerender; check:bundle 79.5 kB/400.

---

**Handoff after session 114 (2026-07-13). Theorie pill animation robustness + dark-mode purple
contrast (Opus 4.8), on branch `claude/theroie-toggle-animation-t5c86i` — pushed, NOT yet merged
(commit `688bd0d`; asked the founder before opening a PR).** Follow-up to s113's tab-slide work,
fixing the *pill* jerk specifically (s113 fixed the content-panel slide; the pill glide was still
stuttering). No logic/data change. (Moved out of `PROJECT_STATUS.md` Resume-here in s115 per the
two-handoff rule.)
- **Pill animation (the real fix):** both `LibrarySwitcher` (tab bar) and `ViewSwitcher` (Tabelle/
  Graph/Karten/Liste) animated their active pill with framer's `layoutId` **shared-layout crossfade** —
  the pill rendered ONLY on the active segment (`{active && <motion.span layoutId=…/>}`), so each switch
  unmounted the old pill + mounted a new one, forcing framer to re-measure both and cross-fade. On the
  library tabs the same click also renders a whole trainer (walks a content bank), so that measurement
  competed for the main thread and the pill stuttered. Replaced with new
  **`src/features/shared/useSlidingPill.ts`**: ONE always-mounted pill measured to the active segment
  from the live DOM (`offsetLeft`/`offsetWidth`, re-measured on active change + `ResizeObserver`,
  positioned pre-paint via `useLayoutEffect`), animating only `x`/`width` (compositor-friendly transform
  for the equal-width segments), decoupled from the rest of the frame. Robust to gaps/padding/responsive/
  unequal widths. If you touch either switcher, keep the single-pill pattern; do NOT reintroduce the
  per-segment `layoutId` crossfade.
- **Dark-mode purple contrast:** dark `--primary` was `245 80% 68%` (~4.3:1 on the dark bg, under the
  WCAG AA 4.5:1 floor for the small bold uppercase eyebrows / active-tab labels / `text-primary` links);
  lifted to `245 84% 74%` (~5.6:1), `--ring` matched. Primary-as-button-fill unaffected (its dark
  `primary-foreground` text only gains contrast).
- **Verified in Chromium** (playwright-core, seeded onboarded localStorage, light + dark at 900×700): pill
  lands pixel-accurately on both the first (Wörter) and far (Grammatik) tabs, ViewSwitcher pill correct,
  purple labels/links clearly legible in dark, no light-mode regression.
- **Files:** `src/features/shared/useSlidingPill.ts` (new) · `src/features/library/LibrarySwitcher.tsx` ·
  `src/features/shared/ViewSwitcher.tsx` · `src/index.css`.
- **Gates:** typecheck ✔; build+prerender ✔; test:unit 134/134; check:bundle 79.5 kB/400.

---

**Handoff after session 113 (2026-07-13). Brand identity exploration (Opus 4.8), on branch
`claude/branding-logo-redesign-947e61`, merged to `main` (PR #516). Parallel to the demo work; no app
code changed.** (Moved out of `PROJECT_STATUS.md` Resume-here in s116 per the two-handoff rule.) The
founder wants to replace the branding (logo, visual assets, colour scheme): the current gradient
rounded-square "G" reads as a Canva lookalike. Deliverable = a **catalogue of 20 logo/identity
directions** for founder review, saved under `preview/branding/` (open the HTML files in a browser;
index in that folder's `README.md`).
- **What was produced:** three self-contained HTML "studio spec-sheet" pages, each direction a live
  SVG/CSS mark + a 5-colour palette (hex) + a licensable type pairing. `genauly-identity-vol1.html` +
  `vol2.html` (foundation *genau* = precision): Genau., Wasserwaage, Umlaut, Zielband, Neuland, „Genau",
  Der·Die·Das, Fokus, Roter Faden, Stempel. `vol3.html` (three new brand *philosophies*):
  Ankommen/belonging (Schwelle, Der Tisch, Schlüssel, Heimat), Durchbruch/momentum (Durchbruch, Schwung,
  Sprung), Klarheit/clarity (Prisma, Sonnenaufgang, Klartext).
- **Assistant shortlist:** Der·Die·Das (brand = the gender-colour teaching system), Neuland (one world
  with the game), Durchbruch (owns the plateau story), Ankommen/Schwelle (warmest, most distinctive).
- **NOT done (deliberate):** nothing in `src/` touched. No palette/token edit in `src/index.css` or
  `tailwind.config.ts`, no logo/favicon/PWA-icon regen. **That is the next step, and it only starts once
  the founder picks a direction** (belief + mark + palette, mixes allowed): lock one spec, wire the
  tokens (light + dark), regenerate all icons from the mark, `pnpm build`, ship to `main`. Also published
  as private Claude artifacts (Vol. I `fed14c61`, II `02c0d954`, III `dc5d3da7`).
- **Gates:** none run (no code change); docs + preview HTML only.
