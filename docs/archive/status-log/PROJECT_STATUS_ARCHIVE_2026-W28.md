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
