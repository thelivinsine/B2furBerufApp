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
