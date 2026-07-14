# Session & Prompt Log — Archive 2026-W28 (2026-07-06 to 2026-07-12)

_Weekly archive slice of the append-only prompt log (ISO week 2026-W28). The maintenance rule and
entry template live in the live log `docs/SESSION_PROMPT_LOG.md`; the index of weekly files is
`docs/archive/prompt-log/README.md`. Left as written (append-only history)._

## Entry 170 — 2026-07-06 (session 69)
- **Branch:** `claude/task-4-3-2mzx51`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > implement task 4.3
- **Response summary:** Executed Phase 4 task 4.3, the Lesen/Hören content bank (first half of Session B). New `src/data/texts.ts` with 10 authored authentic-style B1–B2 texts across 9 themes in the five planned genres: 2 Behörden letters (Anmeldung appointment B1.2/meldewesen, missing Wohngeld documents with deadline B2.1/antrag), 2 workplace emails (rescheduling B1.2, complaint response B2.1/reklamation), 2 memos (meeting minutes B2.1/entscheidung, project status B2.2), 2 announcements (IT maintenance B1.2, warehouse safety briefing B2.1), 2 voicemail scripts (flight rebooking B1.2, delivery delay B2.1; these double as TTS listening input in 4.4). Each carries a German title + full text, an English gloss and 2–3 German MCQ comprehension checks with English explains (30 checks total); all names/numbers fictitious, no em dashes. New types `TextKind`/`TextCheck`/`ReadingText` and `"text"` added to `ProvenanceContentType`. Linter gained the `TEXT_KINDS` closed-enum mirror plus `lintTexts` (kind/themeId/cefr enums, required fields, checks length >= 2 as an error, answer among options, globally unique check ids, subThemeId cross-check, tx_ prefix warning); the bank is loaded, counted and wired into the provenance cross-check. 10 authored/OWNED provenance rows at review_status "draft" (CoE level descriptors cited as CEFR calibration reference); register now 1,121 rows. `/sources` page got the label + order entry the `Record<ProvenanceContentType, ...>` map requires. Gates all green: lint:content (10 texts / 30 checks, 0 errors/warnings), build, lint 0 errors, test:unit 59, check:bundle 78.9 kB unchanged (no eager consumer). Shipped via PR #320, squash-merged to main at `f09da8e`, branch realigned. Docs updated (plan 4.3 checkmark, PROJECT_STATUS header + session-69 handoff + content counts, CLAUDE.md counts, this entry).
- **Artifacts:** `src/data/texts.ts` (new), `src/types/index.ts`, `scripts/lint-content.mjs`, `src/data/provenance.ts`, `src/features/legal/Sources.tsx`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, `CLAUDE.md` (modified). **PR #320**, squash SHA **`f09da8e`**.

## Entry 171 — 2026-07-06 (session 69)
- **Branch:** `claude/task-4-3-2mzx51`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > (after switching the session model to Opus 4.8:) continue
- **Response summary:** With 4.3 shipped (entry 170) and the model switched to Opus 4.8, "continue" was the signal to proceed to Phase 4 **task 4.4** (the plan's Opus task, second half of Session B): the Lesen/Hören composer block + renderer. Added a first-class `kind: "reading"` `SessionBlock` (`textId` + `listening` flag). Composer (`engine/session.ts`): Pool 6 emits exactly one reading block per session, preferring a text on the scoped/weak theme, else the active Mode lens, else any; a voicemail text plays as a **listening** variant when the caller reports TTS (new pure `listening` opt, player passes `ttsSupported()`), every other genre renders as readable text. New `src/features/session/ReadingBlock.tsx` renderer, extracted so `SessionPlayer` stays under the plan's ~1000-line line: a two-stage full-screen focus block, read/listen the passage (tap-gloss title, `Übersetzung` toggle, TTS play/replay + `Text anzeigen` reveal for the listening variant) then the 2–3 comprehension MCQs one at a time, reusing the quiz MCQ styling + `explain`. Scoring: `XP.readingCheck` (8) per correct check; the block registers ONE aggregate tally result (majority-correct) at completion so it never inflates correct/total, and it **never touches vocab FSRS** (comprehension practice, not a graded SRS card, keeping 4.5's "no new state" invariant intact). Wired into `SessionPlayer` with `listening: ttsSupported()`. 3 new composer Vitest cases (one-block, listening-gating, theme-scope); `test:unit` 59 → 62. All gates green (build, typecheck, lint 0 errors, lint:content, check:bundle main chunk 78.9 kB — bank + renderer ride the lazy session chunk). Shipped **PR #322**, squash-merged at **`98c4688`**, branch realigned. Verification note: no Playwright module was available to drive the new block in a browser, so verification rests on the composer unit tests + green typecheck (`noUnusedLocals` proves every import is exercised) and the renderer reusing the proven MCQ pattern; a live check on the deployed site is worth doing. Session B (4.3 + 4.4) is complete; tasks 4.5 + 4.6 remain.
- **Artifacts:** `src/types/index.ts`, `src/engine/scoring.ts`, `src/engine/session.ts`, `src/features/session/ReadingBlock.tsx` (new), `src/features/session/SessionPlayer.tsx`, `tests/engine.test.ts`. **PR #322**, squash SHA **`98c4688`**. Docs (plan 4.4 checkmark + PROJECT_STATUS handoff + CLAUDE.md session-engine anchor + this entry): **PR #323** (`f41db39`).

## Entry 172 — 2026-07-06 (session 69)
- **Branch:** `claude/task-4-3-2mzx51`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the second and provide me with prompts for next sessions
- **Response summary:** Tidied the prompt log so each founder prompt owns one entry: entry 170 = "implement task 4.3", entry 171 rewritten to be the clean "continue" → task 4.4 entry (previously it redundantly re-documented 4.3). Confirmed task 4.4's substantive docs were already shipped in PR #323 (plan checkmark, PROJECT_STATUS session-69 handoff, CLAUDE.md session-engine anchor + ReadingBlock in the layout list). Provided the founder with ready-to-paste prompts for the next sessions (Session C: task 4.5 progression chip, then 4.6 wrap; plus the standing game-plan G1 alternative). Doc-only.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded on merge.

## Entry 173 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > does the plan provide model recommendations for the tasks? and also a phase wise non tech executive summary?
- **Response summary:** Honest answer: it had neither (the game plan predates the session-63 convention set by `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`). Both added to `docs/plans/GAME_IMPLEMENTATION_PLAN.md` in that plan's format: (1) a plain-words executive summary, one paragraph per phase G0–G4, non-technical; (2) a "Claude model recommendations" section with the shared four-tier table (Haiku 4.5 / Sonnet 5 / Opus 4.8 / Fable 5) and a per-task model map across the phases (Fable for the mission schema + Anmeldung content + chapter-arc design + pixel mockups; Opus for dialogue-battle wiring, FSRS-recurrence composer logic, and the React↔Phaser bridge; Sonnet as the workhorse for scene renderers and mission data at volume; Haiku for gates + ship), including the "open on the strongest-model task, then downshift" working pattern and a `/code-review` pass before each phase PR. Also refreshed the plan's G0 status while rebasing over the parallel sessions' work: redesign Phases 1–3 (plus Phase 4 Sessions A+B) are fully shipped, so the G0 prerequisite is COMPLETE and G1 is eligible now.
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 174 — 2026-07-06 (session 70)
- **Branch:** `claude/phase-4-session-c-tasks-79shhv`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Finish Phase 4 Session C: implement task 4.5 (progression chip) and then task 4.6 (gates + docs wrap), shipping each to main.
- **Response summary:** Executed the final two tasks of Phase 4. **4.5** (progression chip): new `src/lib/phase.ts` exporting a pure `themePhase(ratio)` function mapping a theme's existing mastery ratio to a three-step **Aufbau → Festigen → Gemischt** label, reusing the app's two existing mastery bars (below the city `LIT_THRESHOLD` 0.4 = Aufbau, below the SRS `mastery() >= 0.8` "mastered" bar = Festigen, at/above it = Gemischt) so the ladder lines up with bars learners already see elsewhere; no new state, both call sites (`Analytics.tsx` theme grid, `components/city/mastery.ts` city progress) already compute the ratio. Wired a phase `Badge` onto each row of the Fortschritt "Beherrschung nach Thema" grid, and folded the phase label into `CityStrip`'s per-building `aria-label`/`title` (the existing "tap" affordance) alongside the mastery percentage. Shipped standalone via a first commit. **4.6** (gates + docs wrap): ran the full gate suite (`pnpm install` first, since `node_modules` was missing in the fresh session) — `build`, `typecheck`, `lint` (0 errors, only the documented pre-existing react-hooks warnings), `test:unit` 62 passed, `test:srs` 323 checks, `test:pronounce` 26 checks, `check:bundle` main chunk 79.0 kB, `lint:content` 0 errors. Updated docs: `CLAUDE.md` `lib/` file list gained `phase.ts`; `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md` marked 4.5/4.6 ✅ and Phase 4 COMPLETE; `docs/PROJECT_STATUS.md` got a new session-70 "Resume here" handoff (with the two oldest handoffs, sessions 68 and 69's 4.3-only entry, rotated into `docs/archive/PROJECT_STATUS_ARCHIVE.md` per the two-most-recent rule) and a trimmed top summary line; this prompt-log entry. Rebased over the parallel session-62 game-plan doc update (entry 173) that landed on `main` concurrently. Both tasks pushed to `main` via PR → squash-merge → branch realign, closing out Phase 4.
- **Artifacts:** `src/lib/phase.ts` (new), `src/features/analytics/Analytics.tsx`, `src/components/city/CityStrip.tsx` (4.5). `CLAUDE.md`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md` (4.6). PR #s + squash SHAs recorded on merge.

## Entry 175 — 2026-07-06 (session 71)
- **Branch:** `claude/frontend-design-audit-6r743d`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you do a thorough audit of the front end design, brand and visual assets and provide me with a report on weaknesses and top 5 recommendations?
- **Response summary:** Read-only design/brand audit, delivered as `docs/plans/DESIGN_AUDIT_2026-07-06.md` (no app code changed). Reviewed the token system (`tailwind.config.ts`, `src/index.css`), `index.html`/PWA manifest, all `public/` brand assets, the shared component layer, app chrome, landing page, and repo-wide color/a11y greps. Verdict: the token + component architecture is genuinely strong; the gaps are coherence and outward-facing surfaces. Weaknesses found: (A) zero social/link-preview metadata and no OG image or canonical URL, no SVG logo master, three near-identical brand indigos, stale `favicon.svg` still shipped + SW-precached, dark-only `theme-color`; (B) five parallel accent systems (~43 raw Tailwind palette classes + 57 hex literals) so zones wear different colors on different surfaces; (C) wrong-theme boot flash for light-mode users (hardcoded `class="dark"` + dark splash, default themeMode `system`); (D) unregulated Denglish (CTA labels disagree: "Kostenlos starten" vs "testen"; "a Arztbesuch"; `html lang="en"` vs manifest `lang: "de"`); (E) contrast failures (`text-warning` ~2.2:1 as text) and button-instead-of-link navigation on the landing page; (F) minor: single-face typography, no German hyphenation strategy. Top-5 recommendations (impact ÷ effort): 1) ship OG/twitter meta + 1200×630 share image + canonical; 2) define ONE brand indigo + a curated zone palette as tokens and remap themes/hubs/nav onto it; 3) CSP-safe pre-boot theme script + light/dark `theme-color` metas + theme-aware splash; 4) codify the Sprachmix voice rule in CLAUDE.md and sweep the landing copy, set `lang="de"`; 5) contrast + link-semantics a11y pass. Also flagged: create an SVG logo master, remove/replace the stale `favicon.svg`. Docs updated per workflow (this entry + PROJECT_STATUS handoff, session-69 handoff rotated to the archive).
- **Artifacts:** `docs/plans/DESIGN_AUDIT_2026-07-06.md` (new), `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md`. PR # + squash SHA recorded on merge.

## Entry 176 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > give me a prompt to start in a new session
- **Response summary:** Provided two ready-to-paste prompts for the next sessions, now that the parallel sessions (63–71) have completed the entire UX redesign (Phases 1–4) plus the design/brand audit, leaving game Phase G1 as the standing next step. Primary prompt: approve and start **G1** (read `docs/plans/GAME_IMPLEMENTATION_PLAN.md` + `docs/strategy/GAME_CONCEPT.md`, build the Mission/Scene schema + `engine/mission.ts` runner + lint checks first, then scene renderers and the Anmeldung mission content, free placeholder art only, normal PR flow, announce model downshift points), to be run on Fable 5 per the plan's model map. Secondary optional prompt: the pre-G1 **pixel-art mockups** for the founder's art blessing (2–3 Anmeldung scenes, free assets, zero spend, no purchases, no game code). Doc-only ship: this entry.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded in git history.

## Entry 177 — 2026-07-06 (session 71)
- **Branch:** `claude/ux-audit-gap-analysis-91yadk`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > do a comprehensive audit and gap analysis of ux implementation that's done the latest. provide me with a detailed report.
- **Response summary:** Ran a full code-level audit of the UX redesign (Phases 1–4, sessions 63–70) against `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, verifying each of the 22 tasks against the actual code (not the docs' "COMPLETE" claims) via four parallel per-phase code reviews, and re-ran every gate from a clean install (all green: build, typecheck, lint 0 errors, lint:content 10 texts/30 checks, test:unit 62, test:srs 323, test:pronounce 26, check:bundle 79.0 kB). Verdict: the redesign is faithfully implemented, not doc-inflation; all locked invariants intact (persist migration `v1→2` flips only false→true with no wipe; FSRS `latencyMs` reaches `reviewVocab` on every main graded path; focus mode route-guarded with iOS `translateZ`/`no-callout` fixes intact; reward-gold tokens match spec; `engine/collection.ts` band mapping clean + unit-tested; typed grader sound; reading block never touches vocab FSRS). Gaps surfaced: (1) 🔴 a latent eager-bundle landmine — `intentCards.ts` statically imported `filterVocab` from the 245 kB vocab bank, kept out of the main chunk only by tree-shaking dead `cardMeta`/`cefrRange`; (2) 🟠 the promised Can-Do "claim moment" was silently passive; (3) 🟡 onboarding defers name/exam-date to Settings (which covers them, acceptable); (4) 🟡 word-order quiz feeds FSRS without a latency sample (pre-existing); (5) 🟡 `bank`/`wohnhaus` city buildings can't light (await content packs). Wrote the report both in chat and as `docs/plans/UX_AUDIT_2026-07-06.md`.
- **Artifacts:** `docs/plans/UX_AUDIT_2026-07-06.md` (new). Fixes shipped under entry 178.

## Entry 178 — 2026-07-06 (session 71)
- **Branch:** `claude/ux-audit-gap-analysis-91yadk`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead with your recommendations
- **Response summary:** Implemented the two actionable audit recommendations. **(1) Eager-bundle de-risk:** removed the dead `cardMeta`/`cefrRange` helpers and the `filterVocab`/`CEFR_ORDER` imports from `src/features/dashboard/intentCards.ts`, so the eager Dashboard path no longer has any static edge into a content bank — Heute's ~78 kB eager-path invariant is now structural rather than an accident of tree-shaking (main chunk unchanged, 79.1 kB). **(2) Quest claim moment:** added a persisted `claimedMilestones: string[]` + idempotent `claimMilestone(id)` action to `useSettingsStore` (rides cloudSync via the settings jsonb blob, `SettingsSnapshot` is derived from the store so no cloudSync change and no persist version bump needed — a new field merges to its default). Fortschritt (`Analytics.tsx`) now renders a reward-gold, spring-in (framer-motion, reduced-motion honored via the global `MotionConfig`) "Quest geschafft · <Thema>" card for any achieved-but-unclaimed Can-Do milestone, with an "Einlösen" button that claims it and advances to the next unclaimed win; count suffix when several are waiting. Added a `claimMilestone` idempotency unit test (`tests/stores.test.ts`, test:unit 62 → 63). Verified gap #3 (onboarding-deferred fields) as acceptable — name/XP-goal/exam-date are all editable in `Settings.tsx`, so no code change. All gates green. Docs: audit report `docs/plans/UX_AUDIT_2026-07-06.md` "Actions taken" section, `docs/PROJECT_STATUS.md` session-71 handoff, this entry.
- **Artifacts:** `src/features/dashboard/intentCards.ts`, `src/store/useSettingsStore.ts`, `src/features/analytics/Analytics.tsx`, `tests/stores.test.ts`, `docs/plans/UX_AUDIT_2026-07-06.md`, `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md`. PR # + squash SHA recorded on merge.

## Entry 179 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > what's this blessing part you keep talking about?
- **Response summary:** Explained the docs' shorthand: "blessing" = the founder's explicit approval of the pixel-art direction, a gate set in `GAME_CONCEPT.md` (session 54) because art style is a taste/brand decision only the founder can make (precedent: rejected gold windows, the long tab-bar iteration). The rule: no asset purchases and no shipped sprites until the founder approves 2–3 mockup scenes, which cost nothing to produce. Answer was interrupted mid-delivery by the next prompt; no artifacts.
- **Artifacts:** none (chat answer only; logged here).

## Entry 180 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > before we move ahead with the game implementation, I want you to write a detailed gameplan with storyline with descriptions of each mission, what are various elemnts of the game, how the player interacts, etc, etc. Provide this as a well-formatted slide deck.
- **Response summary:** Wrote the detailed game design and delivered it two ways: (1) the durable source of truth **`docs/strategy/GAME_DESIGN.md`** (new), the design layer between `GAME_CONCEPT.md` and `GAME_IMPLEMENTATION_PLAN.md`; (2) a 21-slide founder deck as a Claude Artifact (link in chat) in a retro-pixel visual identity built on the app's brand indigo + reward gold. Design contents: premise and character creation (no villain; everyday Germany as the antagonist), proposals for the game title ("Neuland") and city ("Neustadt"), a six-NPC recurring cast (Jonas, Frau Schmidt, Ayşe, Herr Krause, Frau Weber, Herr Nguyen), the core loop (map → loadout → scenes → loot → FSRS-scheduled recurrence), the interaction model (D/E on every line, tap→type→speak input ladder, register-marked choices, playable parody documents, TTS listening), conversation-battle anatomy (Geduld vs Standing, Redemittel moves, Konjunktiv-II crits, kind status effects, Jonas wild card), the six-class bag taxonomy, progression (one shared state with the app), failure-is-content rules, **six chapters with ~36 individually described missions** (Ankommen, Wohnen, Geld & Papierkram, Arbeit, Gesund & Sozial, Mein Ziel with five endgame paths, exam optional per the scope guardrail), real-world side quests (Wort-Safari, Kiez-Aufträge, Fundstücke), and tone/art rules (pixel direction still awaiting blessing). PROJECT_STATUS updated (new handoff, hygiene move of the older s71 handoff to the archive), GAME_CONCEPT.md pointer added.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md` (new); `docs/strategy/GAME_CONCEPT.md`, `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Slide deck delivered as a Claude Artifact. PR # + squash SHA recorded in git history.

## Entry 181 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the link to deck isn't working. where can I find it on the repo?
- **Response summary:** The deck existed only as a hosted Claude Artifact (session-delivered link) and was not in the repo; only the markdown design doc was. Fixed by committing the deck itself: new **`docs/strategy/GAME_DESIGN_DECK.html`**, the self-contained 21-slide deck (inline CSS/JS, no external requests) with a proper doctype/meta header so it opens standalone in any browser. Told the founder the three ways to view it: the file sent directly in chat, the repo file (download raw + open), and `docs/strategy/GAME_DESIGN.md` which renders readably on GitHub with the same content. PROJECT_STATUS handoff amended to name the committed deck path.
- **Artifacts:** `docs/strategy/GAME_DESIGN_DECK.html` (new); `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 182 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i love it. only weird thing I found it with the job interview. even though the interview is the boss round, I see there are more missions after that. shouldn't the interview with boss be the final mission and all tasks leading up to that should be the missions before? the activities after the interview can be part of later chapters. come up with missions leading up to interview. can you create a new version of the above html by updating this part?
- **Response summary:** Founder review of the game design: approved overall ("i love it") with one structural correction, which is now a **locked structural rule: every chapter ends on its boss**. Restructured the Arbeit chapter accordingly in BOTH `docs/strategy/GAME_DESIGN.md` and `docs/strategy/GAME_DESIGN_DECK.html` (+ redeployed the Artifact, same URL): **Kapitel 4 is now "Die Jobsuche"** (Agentur & Zuhause), 7 missions leading up to the interview boss: 4.1 Die Orientierung (skills inventory + parody job portal), 4.2 Die Stellenanzeige (job-ad reading battle incl. a red-flag ad), 4.3 Der Lebenslauf (tabellarischer Lebenslauf typed finale), 4.4 Das Anschreiben (cover letter from Redemittel blocks, Schreibtraining tie-in), 4.5 Der Anruf (phone call + voicemail, listening/speaking), 4.6 Die Generalprobe (WG mock interview with Ayşe + Jonas, bag loadout), BOSS Das Vorstellungsgespräch (reward: Arbeitsvertrag, Büropark unlocks). The former post-interview office missions moved to a new **Kapitel 5 "Im Büro"** (5 missions, boss = Die Dienstreise); Gesund & Sozial renumbered to K6, Mein Ziel to K7 ("chapter-6 finale" reference updated). Story is now **seven chapters / ~40 authored missions**; deck is 22 slides with renumbered eyebrows and updated overview slide. PROJECT_STATUS handoff amended.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md`, `docs/strategy/GAME_DESIGN_DECK.html`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Artifact redeployed at the same URL. PR # + squash SHA recorded in git history.

## Entry 183 — 2026-07-06 (session 72)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Read docs/strategy/GAME_CONCEPT.md and the tooling section of docs/plans/GAME_IMPLEMENTATION_PLAN.md, then produce 2 or 3 mockup scenes of the Anmeldung mission in the proposed retro pixel style, using free assets only and spending nothing. Show them to me as images so I can approve or reject the art direction. No game code and no purchases.
- **Response summary:** Produced the pre-G1 art-blessing mockups: three scenes of the Anmeldung vertical slice in retro GBA pixel style (240x160 native, 4x nearest-neighbor upscale to 960x640), delivered as PNGs in `preview/game-pixel-mockups/` and sent to the founder as images. Scene 1: the parody Termin booking website (Serviceportal header, "Nächster freier Termin: IN 8 WOCHEN" in red, wait-vs-spontan-6-Uhr choice in a GBA dialogue box). Scene 2: the Bürgeramt waiting room (LED call board AUFRUF 087 / SCHALTER 3, ticket chip "Deine Nr. 112", two chair rows with seated NPCs, ambient listening hook). Scene 3: the Frau Schmidt boss dialogue battle (GEDULD bar for her, MUT bar for the player, 2x2 Redemittel move menu with Konjunktiv II selected, "Höflich trifft kritisch!"). Every scene carries the D/E chips and the brand indigo #5b5be6 in the dialogue chrome. Zero spend honored with a documented constraint: the sandbox network policy blocks kenney.nl, OpenGameArt and itch.io, so no packs could be downloaded; all art was instead hand-authored in code (original + license-clean), imitating the Kenney/LimeZu reference style: `scenes.py` composes the scenes and `pixfont.py` is a hand-drawn bitmap pixel font with umlauts and ß; both committed next to the PNGs for reproducibility. No game code, no purchases, nothing merged to `main` app-wise; work parked on the branch pending the founder's approve/reject of the direction.
- **Artifacts:** `preview/game-pixel-mockups/` (3 PNGs + `README.md` + `scenes.py` + `pixfont.py`), `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 184 — 2026-07-06 (session 72, continued)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you generate a couple more mockups of the scene with frau schmidt?
- **Response summary:** Added three more Frau Schmidt boss-scene mockups in the same hand-authored GBA pixel style, each testing a different beat of the dialogue battle (`preview/game-pixel-mockups/scenes2.py`, same zero-spend, license-clean approach as entry 183). Scene 4 "Am Schalter": close-up confrontation with a newly authored large (2x) Frau Schmidt bust looming behind the counter glass (mirror-built 44x42 sprite: grey bun, stern brow, glasses, teal cardigan), the player's documents laid out on the counter (Ausweis, Vertrag) with the missing Wohnungsgeberbestätigung as a red dashed slot, and the Konjunktiv-II choice in the dialogue box. Scene 5 "Kritischer Treffer": the wide battle layout mid-attack, Konjunktiv II lands with a gold KRITISCH! banner, -18 GEDULD floating damage, sparkle bursts, her Geduld bar in the red, full-width message box. Scene 6 "Sieg": victory screen with retro dither-dimmed background and a gold-bordered Schlüssel-Item card for the Meldebestätigung (+120 XP) plus the chapter-3 bank dependency hook; deliberately the one mockup using the app's reserved reward-gold family, matching the loot-only gold rule. Sent all three to the founder as images; direction approval still pending.
- **Artifacts:** `preview/game-pixel-mockups/` (3 new PNGs + `scenes2.py`, README updated), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 185 — 2026-07-06 (session 72, continued)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the mockups look good in being honest to the art form but the color and design language feels quite outdated. It reminds me of the 90's. Can you generate a couple more mock ups of the same picture but with different colour choices and design of the elements?
  > it should look as modern and relatable as possible but the 2D art form should stay
- **Response summary:** Restyled the wide Frau Schmidt battle scene into a modern indie-pixel direction while keeping the 2D pixel form (`preview/game-pixel-mockups/scenes3.py`, two images). What changed versus the GBA look: muted contemporary palette instead of saturated primaries; the office became a relatable modern Bürgeramt (wood plank floor, monstera plants, bookshelf, big window, minimal wall signage, white desk with a monitor); sprite outlines softened from black to warm dark tones and the player recolored into a brand-indigo hoodie; all boxy black-bordered chrome replaced with app-style UI, floating rounded cards with soft drop shadows, thin rounded progress bars, level chips, pill buttons (filled indigo primary "Konjunktiv II"), a bottom sheet with grab handle, sentence case instead of ALL CAPS. Technique: world stays chunky 240x160 while the UI layer renders at 480x320 (half-size pixels), the crisp-UI-over-pixel-world convention of modern pixel games. Two themes delivered: `scene7-modern-hell.png` (light, warm) and `scene8-modern-dunkel.png` (dark mode at dusk: night window, dithered lamp-pool light, dark UI surfaces). Same zero-spend hand-authored approach; both sent to the founder as images for the direction call.
- **Artifacts:** `preview/game-pixel-mockups/` (2 new PNGs + `scenes3.py`, README updated), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 186 — 2026-07-06 (session 72, continued)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i love this new mock up style! dark mode in the game is a bit of a stretch because of limited budget but we'll keep it as a future to-do. save all these mockups and document clearly my preferences and decisions made
- **Response summary:** Recorded the founder's art blessing across the docs so the direction is locked and future sessions do not relitigate it. Decisions captured: (1) 2D pixel form approved; (2) GBA-era styling of mockup scenes 1–6 rejected as dated ("reminds me of the 90's"); (3) the modern restyle `preview/game-pixel-mockups/scene7-modern-hell.png` blessed as THE art-direction reference (muted contemporary palette, modern Bürgeramt set design, soft outlines, app-language UI with rounded floating cards / pills / bottom sheet / brand-indigo accent, crisp half-size UI pixels over the chunky pixel world); (4) in-game dark mode (scene 8) liked but deferred as a future to-do for budget reasons. Where it is documented: new "Game art direction (session 72)" section in `docs/DECISIONS.md` (full verdicts with the founder's verbatim wording and the trait list G1/G2 must match); `docs/strategy/GAME_CONCEPT.md` Visuals pillar updated from "awaiting blessing" to BLESSED-with-styling-correction and the open-questions bullet resolved; `docs/plans/GAME_IMPLEMENTATION_PLAN.md` pixel-blessing guardrail bullet and founder-decision item marked done with the verdict; game dark mode added as backlog item #31 in `docs/PROJECT_REFERENCE.md`; verdict banner added at the top of `preview/game-pixel-mockups/README.md`; session-72 handoff in `docs/PROJECT_STATUS.md` rewritten to "blessing complete, next step G1". All eight mockup PNGs + their generators were already committed on the branch (entries 183–185); this turn merged the whole mockup + decision-record branch to `main` so the record is permanent.
- **Artifacts:** `docs/DECISIONS.md`, `docs/strategy/GAME_CONCEPT.md`, `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_REFERENCE.md`, `preview/game-pixel-mockups/README.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded on merge.

## Entry 187 — 2026-07-06 (session 72, continued)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > neuland is good. document the session and give a prompt for a fresh session
- **Response summary:** Recorded the founder's approval of the game title **"Neuland"** (from the `GAME_DESIGN.md` naming proposals): design-doc header and §1 updated from proposal to approved, §13 open decisions updated (art blessing RESOLVED via session 72's mockups; names PARTIALLY RESOLVED, title approved while city "Neustadt" + NPC cast remain unobjected proposals; chapter-1 sign-off STILL OPEN), a short "Game title (session 72)" record appended to `docs/DECISIONS.md`, and the `PROJECT_STATUS.md` header + session-72 handoff refreshed accordingly. Session-wide documentation was already current from entries 183–186 (mockups, blessing record, PR #334 squash-merged to `main` with the post-merge branch realignment done). Closed the session by giving the founder a ready-to-paste prompt for a fresh session: start game phase G1 on Fable 5 per the plan's model map (Mission/Scene schema + `engine/mission.ts` + lint checks first, then scene renderers to the blessed scene-7 style, then the Anmeldung mission content from `GAME_DESIGN.md` chapter 1), zero purchases, normal PR flow.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md`, `docs/DECISIONS.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded on merge.

## Entry 188 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > move the im buro chapter into one of the options for mein ziel. another thing is that pfand should not just be a decorative item. it should have some value in the game and it should be a recurring gag in the game as it's culturally an important thing in Germany.
- **Response summary:** Applied both founder directions to `docs/strategy/GAME_DESIGN.md` and the deck (`docs/strategy/GAME_DESIGN_DECK.html`; Artifact redeployed at the same URL). (1) **Im Büro moved into Mein Ziel:** the office arc is now the CAREER endgame chain ("Die Karriere: Im Büro": erster Arbeitstag, Meeting, schwieriger Kunde, Streit ums Projekt, Dienstreise, BOSS: der unbefristete Vertrag with Frau Weber; maps the ten workplace themes, unlocks the Büropark). The spine is back to six chapters (K5 Gesund & Sozial, K6 Mein Ziel); K4 interview-boss reward text adjusted; deck back to 21 slides with renumbered eyebrows/mission numbers. (2) **Pfand is a real economy + recurring gag** (new §6 subsection): Pfandflaschen are the game's found currency (own bag row, removed from Fundstücke); the Leergutautomat return is a micro-review mini-game (accepted bottle = one retrieval, miss = red X) paying der Pfandbon → Pfandgeld, which buys the consumables at Herr Nguyen's Späti plus flat cosmetics; recurring gag beats specced (1.4 first Pfandbon + Einweg 25 ct vs Mehrweg 8 ct lore, Ayşe's "you do NOT throw away Pfand" house rule, the Pfandspende kindness scene, Herr Nguyen's bottle appraisals, the post-party bottle-mountain payday, the Pfandmillionär achievement). Rebased over the parallel session-72 merges (#334 art blessing, #335 "Neuland" title approval) and amended the PROJECT_STATUS session-62 handoff accordingly.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md`, `docs/strategy/GAME_DESIGN_DECK.html`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 189 — 2026-07-06 (session 73)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Start game phase G1 per docs/plans/GAME_IMPLEMENTATION_PLAN.md. First read that plan plus docs/strategy/GAME_DESIGN.md and docs/strategy/GAME_CONCEPT.md, and honor the locked session-72 decisions in docs/DECISIONS.md: modern pixel style per preview/game-pixel-mockups/scene7-modern-hell.png (not the GBA mockups), light theme only, title "Neuland". Build in this order: (1) the Mission/Scene data schema and the engine/mission.ts runner with lint-content graph checks, sized to survive hundreds of missions; (2) the scene renderers for the Anmeldung vertical slice styled to the scene-7 reference; (3) the Anmeldung mission content from chapter 1 of GAME_DESIGN.md. Before authoring content, show me the chapter-1 mission list for sign-off. Free placeholder art only, no purchases, everything in a lazy chunk that keeps the 400 kB main budget. Announce when it's sensible to downshift to a cheaper model, run the full gates plus a /code-review pass before each PR, and ship via the normal PR flow.
- **Response summary:** Built and shipped game phase G1 end to end. (1) Schema + runner: `src/types/game.ts` (Mission/Scene closed unions: cutscene, websiteParody, loadout, listening, dialogueBattle, formCloze; chapter/NPC/key-item registries; BiText everywhere for D/E) and `engine/mission.ts` (pure immutable runner in the dialogue.ts style; transitions emit effects like XP, FSRS vocab grades, Redemittel practice, key items, which the player component applies to the real stores, honoring the one-progression-state rule). Game state (`missionsDone`, `keyItems`) added to `useProgressStore`, local-only until a G2 Supabase migration (a new column in the upsert would break cloud sync). (2) Lint gates: `lint-content.mjs` loads the mission bank and enforces graph integrity (routing resolves + reachable win scene, battle node graphs with reachable win terminals, content-bank id references, key-item obtainability so a mission can never soft-lock, acyclic mission dependencies, closed enums mirrored); `tests/mission.test.ts` (13 runner tests: win path, fetch-quest loss, bar drain, loadout grading tiers). (3) Renderers: `src/features/welt/` (stage atoms, six scene views, MissionPlayer, Welt hub) in the blessed scene-7 style: light-only floating cards, pill buttons, thin bars, brand-indigo accent, chunky pixel backdrops with code-authored placeholder art (`welt_assets.py` generator, zero spend), focus mode hides chrome on `/welt`; entry via a Neuland (Beta) card on the Anwenden hub. (4) The founder-approved chapter-1 mission list (approved as-is via the sign-off question this session) unblocked authoring the Anmeldung boss mission `m_kap1_anmeldung` (9 scenes incl. the Frau Schmidt battle with Geduld/Mut bars, Konjunktiv-II crits, the missing-Wohnungsgeberbestätigung fetch-quest loop) plus 2 new vocab entries and 3 provenance rows. Verified with a full scripted playthrough in the sandbox browser (zero console errors); all gates green; game ships as its own ~53 kB lazy chunk, main chunk unchanged at 79.5 kB. Code-review pass run before the PR; findings fixed (see PR).
- **Artifacts:** `src/types/game.ts`, `src/engine/mission.ts`, `src/data/missions.ts`, `src/features/welt/*`, `src/data/vocabulary.ts`, `src/data/provenance.ts`, `scripts/lint-content.mjs`, `tests/mission.test.ts`, `src/store/useProgressStore.ts`, `src/router.tsx`, `src/components/layout/AppShell.tsx`, `src/features/anwenden/AnwendenHub.tsx`, `src/features/legal/Sources.tsx`, `preview/game-pixel-mockups/welt_assets.py`, docs. PR # + squash SHA recorded on merge.

## Entry 191 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > there's a latest version of design doc committed in the repo. refer to it.
- **Response summary:** Verified the branch was level with `origin/main` (4a36086) at that moment, so the working tree carried the then-latest committed design doc (v2). The founder was referring to design v3 (PR #336: Im Büro moved into the Mein Ziel career chain, six-chapter spine, Pfand economy), which a parallel session merged to `main` shortly after; it surfaced during the pre-merge rebase of this session's PR, and the game schema was aligned to it (ChapterId union + `chapters` registry + linter mirror updated to the six-chapter spine; Kapitel 1 unchanged, so the approved mission list stood).
- **Artifacts:** none (verification only).

## Entry 191 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue
- **Response summary:** Continued the G1 build. Presented the chapter-1 mission list (1.1 Willkommen in Neuland, 1.2 Der Fahrkarten-Automat, 1.3 Die SIM-Karte, 1.4 Der erste Einkauf, 1.5 Ein Dach über dem Kopf, 1.6 BOSS Die Anmeldung) for sign-off; the founder chose "Approved as-is", resolving GAME_DESIGN.md §13 open decision 3. The rest of the session's work is recorded under entry 188.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md` (§13 sign-off recorded), `docs/DECISIONS.md` (chapter-1 list approval record).

## Entry 192 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 screenshot (the loadout scene on the founder's phone)
- **Prompt (verbatim):**
  > this one feels a bit off. There's no clear way of telling what this image means. Also, in every screen, there is way too much text which would overwhelm the player.
- **Response summary:** First founder playtest feedback on the shipped G1 slice, applied immediately (the G1 exit-criterion loop). (1) **The loadout image now tells the task:** the stage shows an open pixel travel bag with one dashed slot per required document (new code-authored sprites: bag + Ausweis/Vertrag/Bestätigung doc icons in `welt_assets.py`); the active slot glows indigo and a packed document pops in full-color with a teal ring, so progress is visible in the world, not in a text checklist. (2) **Where-am-I chips:** every stage now carries a small location caption ("Deine Wohnung", "Bürgeramt · Wartezimmer", "Bürgeramt · Schalter 2") via a `SETTING_LABEL` map in `stage.tsx`. (3) **Text diet:** the loadout's intro sentence and the redundant English checklist are gone (sheet = one "Pack ein:" prompt + options + a shortened skip link); the listening scene lost its intro line (the ticker chip already says it) and shows the check explanation only after a WRONG answer; the booking-parody website dropped its redundant "Dienstleistung" row. Schema: `LoadoutScene.intro` became optional (linter updated). All gates green; full scripted playthrough re-verified; shipped via PR (squash-merged, branch realigned).
- **Artifacts:** `src/features/welt/stage.tsx`, `src/features/welt/scenes.tsx`, `src/features/welt/Welt.tsx`, `src/types/game.ts`, `src/data/missions.ts`, `scripts/lint-content.mjs`, `preview/game-pixel-mockups/welt_assets.py`, `src/features/welt/assets/` (4 new sprites), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded on merge.

## Entry 193 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > this can come later but important to document now that whenever there is a waiting period, it should have an effect in the gameplay. Like waiting at the queue need not resemble exact time counter but there should be some fictional timer running and the user have to either wait or engage with the world, like make small talk, or complete a side quest, etc, etc. We can flesh out the details later but this should be done at some point.
  > also, in the exercise to pack important things for the Anmeldung.. the player is not engaged enough and it's entirely text based game. The exercise can be something like there are various items in the room but the user have to go to each of the important items in the room and pick these things up and then pack them in the bag to go. The missions should actually be playable game like missions, not just a visual with a lot of text on the screen
  > an example for side quest in an interactive world can be - Werbung, or Anzeige, Folie (pamphlet) which will be recurring in many of the scenes and everytime a player engages with these, they'll have to complete an exercise like reading comprehension or crossword puzzle or guessing game like gridgames.. completing these will give more powers/points/ perks in the game.
  > A bug I observed is that when the geduld of frau schmidt is reduced, the number is shown in the players Mut bar. Another weird thing I observed is that the player's Mut is unchanged no matter what option is chosen and how much ever the geduld of Frau Schmidt is decreased. Both should be dependent on each other. In this case, the goals is to maintain both the bars high.
  > In the kind of questions asked in conversation with Frau Schmidt, all the questions shouldn't be multiple choice questions. There should be more variety and make the user put in effort to complete the mission. Finishing with good amount of points vs less points should have some effect on the progress of the player.
- **Response summary:** Split into build-now and document-now. BUILT NOW: (1) **Battle bar bug fixed**: the Geduld delta now floats on Frau Schmidt's card and the Mut delta on the player's card (previously one combined chip sat on the player card, showing her Geduld numbers there). (2) **Mut is alive**: battles gained a `mutStart` (Anmeldung: 60 of 100), so gains have visible headroom; every move's deltas were rebalanced so each choice noticeably moves BOTH bars. (3) **Finish quality matters**: winning pays a victory bonus scaled by the remaining Geduld+Mut (up to 30 XP, `BATTLE_FINISH_BONUS`), so keeping both bars high is the game. (4) **Input variety**: battle moves support typed cloze challenges (`BattleMove.cloze`, linted as a substring of the sentence); both Konjunktiv-II crits now require TYPING the key word (freundlich / Kugelschreiber); a correct answer lands the crit + typing bonus, a near-miss loses the crit, a wrong answer misfires with bar penalties. (5) **Walk-and-pick loadout**: the packing exercise is now a room interaction: three documents lie at spots in the room, tapping one walks the player sprite over, the retrieval question packs it, the bag (with an n/3 counter) is the tappable exit, thin-bag exit behind a confirm. One line of on-screen text. DOCUMENTED NOW for G2 (founder direction recorded in `GAME_DESIGN.md` §4/§10 + backlog #32a/#32b + CLAUDE.md): **waiting periods are gameplay** (fictional clock; wait or engage via small talk/side quests, engagement rewarded) and **Print-Prop-Quests** (recurring Werbung/Anzeige/Flyer props opening comprehension/crossword/grid mini-exercises that pay perks). Also recorded the interaction-first principle (missions must play, minimal text). All gates green, 81 unit tests, full scripted playthrough re-verified (typed crit included).
- **Artifacts:** `src/types/game.ts`, `src/engine/mission.ts`, `src/data/missions.ts`, `src/features/welt/scenes.tsx`, `src/features/welt/BattleView.tsx`, `scripts/lint-content.mjs`, `tests/mission.test.ts`, `docs/strategy/GAME_DESIGN.md`, `docs/PROJECT_REFERENCE.md`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded on merge.

## Entry 194 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Can I use opus 4.8 for the changes in g1 and then implement g2? I ask because I'm running out of fable usage limit
- **Response summary:** Confirmed yes: the Fable-tier G1 work (mission schema architecture, art direction, chapter-1 narrative specs, Anmeldung content) is done and locked, so remaining G1 tweaks and all of G2 run on cheaper models per the plan's own model map: Opus 4.8 for the FSRS-recurrence engine work and other SRS-adjacent changes, Sonnet 5 for authoring missions 1.1-1.5 against the scene-by-scene `GAME_DESIGN.md` specs and for component work, Haiku 4.5 for gates/ship. Safety nets that make this safe: the mission graph linter (broken missions cannot pass CI) and the 81-test runner suite. Optional Fable spend later: a single tone/humor pass over the finished chapter-1 German, or a mechanic rethink if the playtest demands one. Recorded the decision in the `PROJECT_STATUS.md` G2 handoff so the next session picks it up on any model.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 195 — 2026-07-06 (session 73, close)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Document this session so far. I'll continue in another session. I have more feedback and tweaks to make
- **Response summary:** Session-73 documentation wrap. The session shipped game phase G1 end to end plus two same-day founder playtest rounds, across four merged PRs: **#338** (mission engine: `types/game.ts` schema, `engine/mission.ts` runner, linter graph checks, Vitest suite, six scene renderers under `src/features/welt/`, the Anmeldung boss mission, chapter-1 list sign-off, design-v3 alignment to the six-chapter spine), **#339** (playtest round 1: where-am-I stage chips, text diet, bag-slot loadout visual), **#340** (playtest round 2: walk-and-pick loadout room interaction, battle delta-chip bug fix, live Mut bar via `mutStart` + rebalance, typed cloze battle moves, bar-scaled victory bonus; waiting-as-gameplay + Print-Prop-Quests specced into `GAME_DESIGN.md` §4/§10 and backlog #32a/#32b), **#341** (founder model decision: G2 runs on Opus 4.8/Sonnet 5/Haiku, Fable optional for a later content tone pass). All prompts logged as entries 188–194; `PROJECT_STATUS.md` header + handoff refreshed, noting the founder has MORE feedback/tweaks queued as the next session's first order of business, before G2. Gates green throughout (81 unit tests, bundle 79.5 kB main, game in its own lazy chunk); every round verified with a full scripted browser playthrough.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). Merge SHAs: #338 `70fa084`, #339 `6337dbb`, #340 `54aaef1`, #341 `405e106`.

## Entry 196 — 2026-07-06 (session 74, open)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Read the "Resume here" handoff in docs/PROJECT_STATUS.md. First apply my feedback below to the Neuland G1 slice, then continue with G2 per the plan. Here's my feedback:
  > 1. The pokemon style bag is missing. It should be with the player and should be visible in the game at all times and the items within should be useful to the player when completing the missions.
  > 2. The english translation button should not be available to the player all the time, else it doesn't feel like a game anymore.
  > 3. I want more variety in the questions type - in the mission with Frau schmidt, if there are multiple options with a much nicer option and another one also a nice option, then it doesn't make much of a difference to the player if they chose either of those. And another question is like can you handover a personalauswies - instead of providing text options below the question, the user should search in the bag to tap on one of the items.
  > 4. I want you to do write a robust plan on researching, brainstorming and ideating what kind of questions and activities should be part of the missions - just sharing an idea but you could also use different approach if better - may be you could use multiple agents with various personalities like expert german teacher meets expert game developer meets expert in german literature to ideate this. Once this research and brainstorming is completed - in the first part of the report I want the outcome of the research, then in second section I want complete sccript for the gameplay for each of the first chapter in a html based slide deck (similar to the design doc v3) missions leading upto the boss stage including the intorduction of the game to the player, introduction tot he characters, backstory, selection of language level of the player, his friends, what environments the player travels across in each stage, what challenges the player has, the help and options he has like the freinds or bag or EN translation, mission challenges and any other aspects I may have missed.
  > 5. The dimensions of objects vs player are way too off. Example - the chairs in the waiting room are way too bigger than the player, and the player itself is too small and looks somewhat vertically squished. Such dimensions of the things and relative sizes should be taken care of and well defined.
  > 6. I expected the game to be in full screen where all the interactions happen inside the game area, and I want the design of questions and other interactive elements to follow the game 2d pixelated art as it currently looks like a patchwork of different arts and not immersive.
- **Response summary:** Playtest round 3 applied and shipped (PR #343, squash `5aa4080`), then the research
  commissioned in item 4 executed and shipped (PR #346, squash `7769a6c`). **Code (items 1/2/3/5/6):**
  (1) persistent HUD bag with item count that pulses on demands; (2) the always-on E toggle removed and
  replaced by the Wörterbuch bag item (3 charges per mission; one charge reveals English for the current
  scene only; engine: `MissionRun.dictUses` + `useDictionary`); (3) new battle `ask` nodes: document
  demands are answered by opening the Tasche and tapping the item (engine `handItem`/`admitMissing`;
  wrong item costs Geduld + earns a deadpan reaction line; conceding routes into the fetch-quest
  branch); both Schmidt document demands converted, remaining option lists differentiated (visible
  costs + reaction feedback on the plain-polite moves, a costly "So tun als ob" bluff path, crits no
  longer telegraphed); (5) world scale locked in `welt_assets.py` (standing adult 28-32 px, chair
  ~19 px, seated ~20 px; player sprite redrawn 16x30, chairs shrunk, committed `proportions-check.png`);
  (6) the mission player became a fixed full-screen game layer and every in-game surface was restyled
  to the pixel language (outlined panels, hard offset shadows, RPG name plates, chunky bars). Linter
  gained ask-node graph checks + `dictUses`; runner tests extended to 85; verified with a full scripted
  phone-viewport browser playthrough (wrong-item beat + dictionary flow included), zero console errors.
  **Research (item 4, the multi-agent brainstorm):** four independent expert personas ran IN PARALLEL as
  subagents, each blind to the others, each grounded in `GAME_DESIGN.md` + `src/data/missions.ts` +
  `src/types/game.ts`: (P1) a veteran DaF-Didaktikerin and telc/Goethe examiner (activity types by
  competence + SLA principle, meaningful-choice rules, error-handling design), (P2) a veteran 2D-RPG
  game designer (interaction verbs beyond multiple choice, choice-architecture levers, Pokemon-grade bag
  design, full-screen scene grammar, chapter pacing), (P3) a German culture and literature expert
  (authentic text-genre props, per-mission comedy beats, unwritten-rules moments, NPC register voices,
  text-genre difficulty ladder), and (P4) a market researcher with live web access who surveyed 11
  shipped language-learning games (Wagotabi, Noun Town, Influent, Shashingo, Lingotopia, Learn Japanese
  to Survive, Duolingo Stories/Adventures, Crystallize, Newcomer, Terra Alia, Kagami) with sources, and
  extracted the most-praised patterns, the failure modes, and the gaps nobody owns. Per the founder's
  budget decision (s73), the personas ran on the cheaper tiers (two on Opus 4.8, two on Sonnet 5); the
  lead session synthesized the four reports. Deliverables: `docs/strategy/MISSION_ACTIVITY_RESEARCH.md`
  (method as a rerunnable plan, the merged 20-entry activity catalog with engine-fit + CEFR bands, six
  meaningful-choice levers, recast-based error handling, market evidence, ranked G2 adoption order,
  chapter-1 pedagogy map) and `docs/strategy/CHAPTER1_GAMEPLAY_DECK.html` (the founder-facing two-part
  slide deck in the v3 deck's visual language: Part 1 research outcomes; Part 2 the complete chapter-1
  gameplay script: opening + character creation incl. language-level selection, cast + backstory, help
  systems, missions 1.1-1.6 scene by scene with German lines, environments/text-genre ladder, the
  one-new-mechanic-per-mission ramp), also delivered as a claude.ai Artifact for immediate viewing.
- **Artifacts:** PR #343 (`5aa4080`): `src/types/game.ts`, `src/engine/mission.ts`, `src/data/missions.ts`,
  `src/features/welt/*` (stage/MissionPlayer/scenes/BattleView/Welt + assets incl. new `dict.png`),
  `scripts/lint-content.mjs`, `tests/mission.test.ts`, `src/index.css`,
  `preview/game-pixel-mockups/welt_assets.py` + `proportions-check.png`. PR #346 (`7769a6c`):
  `docs/strategy/MISSION_ACTIVITY_RESEARCH.md`, `docs/strategy/CHAPTER1_GAMEPLAY_DECK.html`.

## Entry 197 — 2026-07-06 (session 74, continued)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the player avatar is standing in an empty space in a weird position in the newly generated boss mission scene. The lady and her patience bar is on the top of the screen so the player avatar and the player's bar can be to the bottom so that the user/player has clear idea of the elements on the screen
- **Response summary:** Battle composition rule applied (PR #344, squash `1aa76dd`): Frau Schmidt and her
  Geduld bar keep the top band, the player sprite moved to the bottom band standing on a proper ground
  shadow (regenerated `amt.png`), next to the "Du"/Mut card. Top = opponent, bottom = you.
- **Artifacts:** `src/features/welt/BattleView.tsx`, `preview/game-pixel-mockups/welt_assets.py`,
  `src/features/welt/assets/amt.png` (part of PR #344).

## Entry 198 — 2026-07-06 (session 74, continued)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the tasche pop up window looks good but it would be even better if the outline of the pop up window is in the shape of a backpack
- **Response summary:** The bag popup is now drawn as the backpack itself (same PR #344): carry handle on
  top, leather dome with rounded shoulders, amber zip band, cream interior holding the item grid.
- **Artifacts:** `src/features/welt/MissionPlayer.tsx` (part of PR #344).

## Entry 199 — 2026-07-06 (session 74, continued)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > now the player avatar looks way too big. Can you keep the people's sixes more or less the same?
- **Response summary:** The foreground zoom from the composition fix was reverted (PR #345, squash
  `9bfa14b`): the player renders at the same human scale as Frau Schmidt (7% stage width, matching the
  loadout walk sprite) on a proportional shadow, still holding the bottom band. Locked as a rule: people
  stay at ONE world scale, no foreground zoom (recorded in `DECISIONS.md`).
- **Artifacts:** `src/features/welt/BattleView.tsx`, `welt_assets.py`, `amt.png` (PR #345).

## Entry 200 — 2026-07-06 (session 74, continued)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session first, espcially the brainstorming with multi agents and the research involved.
- **Response summary:** This documentation pass: prompt-log entries 196-201, a new `PROJECT_STATUS.md`
  handoff (older handoff archived to the W28 chunk), the session-74 founder rulings recorded in
  `docs/DECISIONS.md` ("Game interaction & pixel-UI rules"), `GAME_DESIGN.md` §4 amended (translation as
  a bag resource supersedes always-on D/E inside missions; bag-answered demands; battle composition),
  and the CLAUDE.md game-layer section refreshed. The multi-agent research method and outcomes were
  already durably recorded in `docs/strategy/MISSION_ACTIVITY_RESEARCH.md` (PR #346); entry 196 above
  carries the full method description for the paper trail.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entries 196-201),
  `docs/DECISIONS.md`, `docs/strategy/GAME_DESIGN.md`, `CLAUDE.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`.

## Entry 201 — 2026-07-06 (session 74, close)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > where are you now in the game implementation plan? stop before proceeding with g2. Wait for my go
- **Response summary:** G2 halted per founder instruction. Plan position: G0 complete (s63-66), G1
  complete and shipped with three founder playtest rounds applied (s73 rounds 1-2, s74 round 3 across
  PRs #343/#344/#345), the s74 activity research + chapter-1 gameplay deck complete (PR #346). G2 had
  just been STARTED when the stop arrived: schema groundwork (three new scene settings terminal/laden/
  supermarkt with generated backdrops, scene `label` override, Reisepass icon, four chapter-1 NPCs,
  three key items) plus draft mission data for 1.1 "Willkommen in Neuland" and 1.2 "Der
  Fahrkarten-Automat". That work was PARKED UNMERGED as a clearly-labeled WIP commit on the session
  branch (missions 1.3-1.5, provenance rows, boss gating, gates and playthrough all still open); main
  contains no G2 content. Next session resumes from the WIP commit only after the founder's explicit go.
- **Artifacts:** parked WIP commit on `claude/neuland-g1-g2-feedback-wkf28n` (unmerged; see PROJECT_STATUS
  "Resume here").

## Entry 202 — 2026-07-06 (session 74, close)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim, two consecutive messages):**
  > save the multi agent research and ideation as a separate file complementing the other relevant docs
  > with all the details from the chat in it
- **Response summary:** Created `docs/strategy/MISSION_ACTIVITY_IDEATION_TRANSCRIPTS.md`: the
  complete, verbatim archive of the multi-agent brainstorm: the founder's commission, the method
  (four personas in parallel, blind to each other, two on Opus 4.8 + two on Sonnet 5), the exact
  brief given to each persona, and each persona's full unedited report (DaF-Didaktikerin
  activity catalog + choice/error design in German, the game designer's 20-verb interaction
  catalog + six choice levers + bag spec + full-screen scene grammar + chapter pacing, the
  culture expert's prop catalog + comedy beats + unwritten rules + register voices + genre
  ladder, and the market researcher's 12-game sweep with sources, praised/panned patterns, gaps
  and ranked recommendations). Cross-linked from `MISSION_ACTIVITY_RESEARCH.md` §1.
- **Artifacts:** `docs/strategy/MISSION_ACTIVITY_IDEATION_TRANSCRIPTS.md`,
  `docs/strategy/MISSION_ACTIVITY_RESEARCH.md` (cross-link).

## Entry 203 — 2026-07-06 (session 74, close)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session. i'll continue in another session
- **Response summary:** Final documentation pass for session 74 (most of the session was already
  documented in PR #347: prompt-log entries 196-202, the PROJECT_STATUS handoff, DECISIONS.md
  "Game interaction & pixel-UI rules", GAME_DESIGN.md §4 amendments, CLAUDE.md game-layer
  refresh, and the verbatim multi-agent transcripts in
  `docs/strategy/MISSION_ACTIVITY_IDEATION_TRANSCRIPTS.md`). This entry adds the closing prompt to
  the log and sharpens the PROJECT_STATUS "Resume here" pointer to the parked G2 WIP (named by
  branch + commit-message prefix `wip(G2, PARKED, DO NOT MERGE)` rather than a fragile SHA, with
  the exact resume command). Session-74 shipping recap: G1 playtest round 3 (#343) + two live
  hotfixes (#344 battle composition + backpack popup, #345 one human scale), the multi-agent
  mission-activity research + chapter-1 gameplay deck (#346), and the documentation wrap (#347),
  all squash-merged to `main` and deploying via Pages. G2 remains HALTED awaiting the founder's
  explicit go; its partial draft stays parked unmerged on the session branch.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (this entry), `docs/PROJECT_STATUS.md` (Resume-here
  pointer sharpened).

## Entry 204 — 2026-07-07 (session 75)
- **Branch:** `claude/whats-next-l61ca3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim, in order):**
  > what's next?

  > 4

  > I'd like you to work in content expansion
- **Response summary:** (1) Briefed the founder on current state: session 74 shipped (playtest
  round 3 + mission-activity research), the roadmap's next item G2 is HALTED on the founder's
  explicit order, parked unmerged on `claude/neuland-g1-g2-feedback-wkf28n`. Offered the session's
  options. (2) Founder picked "4" (just brief me), so walked through the G2 plan, the four-persona
  research findings (market gaps we own, chapter-1 mission map, adoption order), and the honest
  risk of scaling on an un-playtested slice. (3) Founder chose content expansion. Surveyed the
  content banks (10 workplace themes + `behoerde`; the `gesundheit`/`bildung`/`pruefung` domains
  had zero themes). The AskUserQuestion tool failed twice in this environment, so made the CTO call
  to build the **Arzt & Gesundheit** pack (fills the empty `gesundheit` domain, most universal
  daily-life situation), using `behoerde` as the reference template. Built the full theme: ThemeId
  + linter, Stethoscope icon, ExamTheme with 4 sub-themes, writing prompt, 28 vocab, 36
  collocations, 3 Can-Do milestones, 2 reading texts (6 checks), 1 branching dialogue, 71
  provenance rows. All gates green (lint:content, build, bundle 79.5 kB, 85 unit tests, eslint 0
  errors). No em dashes. Pushed to the session branch; NOT merged to `main` pending the founder's
  OK on the domain choice (Arzt vs Wohnen/Bank).
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`, `src/lib/icons.ts`,
  `src/data/themes.ts`, `src/data/writingPrompts.ts`, `src/data/vocabulary.ts`,
  `src/data/collocations.ts`, `src/data/canDo.ts`, `src/data/texts.ts`, `src/data/dialogues.ts`,
  `src/data/provenance.ts`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. Commit SHA(s): see the branch.

## Entry 205 — 2026-07-07 (session 75, cont.)
- **Branch:** `claude/whats-next-l61ca3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim, in order):**
  > merge

  > go ahead with wohnen and bank
- **Response summary:** (1) "merge" → opened **PR #349** for the Arzt & Gesundheit pack and
  squash-merged it to `main` (`fc35d60`); ran the post-merge housekeeping (realign dev branch to
  `origin/main` via reset --hard + force-with-lease). (2) "go ahead with wohnen and bank" → built
  two more full daily-life themes on the same template: **`wohnen` (Wohnen & Zuhause)** and
  **`bank` (Bank & Finanzen)**, both `alltag` domain. Each: ThemeId + linter, icon (Home /
  Banknote), ExamTheme with 4 sub-themes, writing prompt, 28 vocab, 36 collocations, 3 Can-Do, 2
  reading texts (6 checks), 1 branching dialogue, provenance rows (142 across both). Also wired the
  placeholder `bank`/`wohnhaus` city-strip domain buildings to their new themes
  (`domain-buildings.tsx`) and updated the now-outdated `tests/city-mastery.test.ts` ("future packs
  empty" → "packs wired"). Gates green: lint:content (14 themes, 614 vocab, 504 collocations, 1,337
  provenance), build, bundle 79.5 kB, 85 unit tests, eslint 0 errors. No em dashes.
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`, `src/lib/icons.ts`,
  `src/data/themes.ts`, `src/data/writingPrompts.ts`, `src/data/vocabulary.ts`,
  `src/data/collocations.ts`, `src/data/canDo.ts`, `src/data/texts.ts`, `src/data/dialogues.ts`,
  `src/data/provenance.ts`, `src/components/city/domain-buildings.tsx`, `tests/city-mastery.test.ts`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, `CLAUDE.md`. PR #349 (Arzt, merged);
  Wohnen+Bank PR to follow. Commit SHAs: see the branch.

## Entry 206 — 2026-07-07 (session 75, cont.)
- **Branch:** `claude/whats-next-l61ca3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue
- **Response summary:** Took "continue" as content expansion and built the highest-value next
  move: **`bildung` (Bildung & Sprache)**, filling the last empty top-level domain (`bildung`), so
  all six domains are now populated. Full theme on the same template: ThemeId + linter,
  GraduationCap icon, ExamTheme (domain `bildung`, context `both`, 4 sub-themes
  sprachkurs/anerkennung/pruefung/weiterbildung), writing prompt, 28 vocab, 36 collocations, 3
  Can-Do, 2 reading texts (course-confirmation email + Anerkennung letter, 6 checks), 1 branching
  dialogue (`sc_sprachkursberatung`), 71 provenance rows. `bildung` maps into the existing
  `pruefungshalle` city building via the domain rollup (no building-registry change needed). Gates
  green: lint:content (15 themes, 642 vocab, 540 collocations, 1,408 provenance), build, bundle
  79.5 kB, 85 unit tests, eslint 0 errors. No em dashes. Squash-merged via PR (see below); ran the
  post-merge branch realignment.
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`, `src/lib/icons.ts`,
  `src/data/themes.ts`, `src/data/writingPrompts.ts`, `src/data/vocabulary.ts`,
  `src/data/collocations.ts`, `src/data/canDo.ts`, `src/data/texts.ts`, `src/data/dialogues.ts`,
  `src/data/provenance.ts`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, `CLAUDE.md`.
  Commit SHAs: see the branch.

## Entry 207 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I want you to author a comprehensive and robust data strategy for the app. The challenge I have is neither am I a native German speaker nor do I possess the skill to manually verify each of the word in the app. this strategy should also adress the following among other important and relevant points: one of the important questions and challenges is that how do we make sure the data/content in the app is source verified, audit-ready but it should also be automated.
- **Response summary:** Researched the existing provenance infrastructure (register, license
  allowlist, `check:refs`, `lint-content.mjs`) and found the legal/licensing layer mature but the
  German-accuracy layer explicitly unsolved (blocked on a native reviewer). Authored
  **`docs/strategy/DATA_STRATEGY.md` (v1.0)**: a six-layer **verification ladder** (structural →
  provenance → factual-match → linguistic → AI jury → rationed human audit) that replaces one native
  reviewer with a panel of independent sources + models (agreement = confidence, disagreement = the
  only thing a human sees). Added a per-item `verification` trust model extending `ProvenanceEntry`, a
  CI-vs-scheduled automation split, cost envelope, decay/re-verification cadence, and an EU AI Act
  Article 10 mapping. Cross-linked `DATA_GOVERNANCE.md` both ways (legal layer) without duplicating it.
- **Artifacts:** `docs/strategy/DATA_STRATEGY.md` (new), `docs/strategy/DATA_GOVERNANCE.md`
  (companion cross-link). Commit on the branch; later shipped via PR #352.

## Entry 208 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > so this strategy is applied for the existing content or the ones we would in future?
- **Response summary:** Explained it is both by design: a one-time cleanup sweep over the ~1,170
  `draft` backlog **and** a permanent CI gate on new content, with the AI jury as triage-only until
  calibrated. Offered to make it explicit in the doc.

## Entry 209 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes
- **Response summary:** Added a "Scope: existing vs. future content" subsection to
  `DATA_STRATEGY.md` (one-time backlog sweep of Phases A–E + permanent CI gate for new content; the
  jury is triage-only until golden-set-calibrated). Committed and pushed.
- **Artifacts:** `docs/strategy/DATA_STRATEGY.md`.

## Entry 210 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > merge
- **Response summary:** Opened **PR #352** (no PR template in repo) and squash-merged the data
  strategy to `main` (`c0d3d1a`). Ran the post-merge housekeeping: realigned the dev branch to
  `origin/main` (reset --hard + `--force-with-lease`).
- **Artifacts:** PR #352 (merged).

## Entry 211 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > scope it
- **Response summary:** Interpreted as "scope Phase A" (the Layer 2 fact-match gate). Ran plan mode
  (Explore agents for the vocab/collocation schemas + lint/CI patterns; verified real counts of 642
  vocab / 540 collocations after the agent undercounted), produced an approved plan, then **built the
  spike**. Discovered kaikki/Wiktionary are blocked by the environment's network policy (npm is the
  only allowed host), so pivoted the data source to **`german-words-dict`** (Apache-2.0, derived from
  LanguageTool's `german-pos-dict`, CC-BY-SA-4.0) fetched from npm — fully offline and CI-capable, a
  better outcome than the plan's network approach. Shipped `scripts/build-dict-subset.mjs`
  (`pnpm build:dict-subset`), `scripts/verify-facts.mjs` (`pnpm verify:facts`), a 12 KB vendored
  subset, and a generated report. **Result over 489 nouns:** 224 genders + 174 plurals machine-verified
  with zero human effort; 3 plurale-tantum headwords auto-detected/skipped; 47% coverage. **Key
  finding:** a single lexicon can't gate — all 4 remaining disagreements were hand-checked as
  lexicon-side issues (`der Husten` correct; `Risiken`/`Visa` are the standard plurals), validating
  the strategy's multi-source thesis. Scoped the next step (second oracle + compound gender rule).
- **Artifacts:** `scripts/build-dict-subset.mjs`, `scripts/verify-facts.mjs`,
  `scripts/vendor/german-words-subset.json`, `docs/reports/verify-facts-report.md`, `package.json`
  (`build:dict-subset` + `verify:facts` scripts). Commit `b9fbbb2`.

## Entry 212 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > merge and document the session
- **Response summary:** Documented the session (this `SESSION_PROMPT_LOG.md` entry set +
  `docs/PROJECT_STATUS.md` handoff and header; moved the session-74 handoff to the W28 archive per the
  doc-hygiene rule), then opened a PR folding the fact-check spike + docs and squash-merged it to
  `main`, followed by the post-merge branch realignment.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. PR + commit: see below.

## Entry 213 — 2026-07-07 (session 77)
- **Branch:** `claude/data-strategy-plan-78r0jq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue the data strategy plan
- **Response summary:** Completed Phase A of the verification ladder by shipping the **second oracle**
  the v1.1 spike said was required. Confirmed kaikki/de.wiktionary/dwds are still 403-blocked by the
  network policy, then found the "Wiktionary route" through an allowed host: **`german-nouns`** on PyPI
  (~100k nouns compiled from German Wiktionary, CC-BY-SA-4.0, already allowlisted), an independent
  lineage from oracle A (LanguageTool). Built `scripts/build-nouns-subset.mjs`
  (`pnpm build:nouns-subset`, +`build:oracles`) writing a 25 KB vendored subset with a compound
  **head-noun gender fallback**. Rewrote `scripts/verify-facts.mjs` to two-oracle voting: an error is
  reported **only when both oracles reject a form and agree on the correction** (`GATE`), everything
  else is a review signal. **Result over 489 nouns: coverage 47% → 97%, 458 articles + 260 plurals
  verified (221/167 by both oracles), 0 two-oracle-confirmed errors**; the 6 review signals and the old
  4 disagreements all hand-checked as valid variants/head-heuristic artefacts. Promoted `verify:facts`
  to a real **offline CI gate** in `validate.yml`. Updated `DATA_STRATEGY.md` → v1.2, regenerated the
  report, and did the doc handoff (moved the session-75 handoff to the W28 archive per the doc-hygiene
  rule). Gates green: `pnpm lint:content`, `pnpm verify:facts` (exit 0).
- **Artifacts:** `scripts/build-nouns-subset.mjs`, `scripts/verify-facts.mjs` (rewritten),
  `scripts/vendor/german-nouns-subset.json`, `package.json` (`build:nouns-subset` + `build:oracles`),
  `.github/workflows/validate.yml`, `docs/strategy/DATA_STRATEGY.md`,
  `docs/reports/verify-facts-report.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. Shipped via **PR #354**
  (squash-merged, `37073b4`), then the post-merge branch realignment.

## Entry 214 — 2026-07-07 (session 77)
- **Branch:** `claude/data-strategy-plan-78r0jq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session and give me a prompt to continue the work in a new session
- **Response summary:** The session's substantive docs were already updated and merged in entry 213
  (`PROJECT_STATUS.md` handoff + header, `DATA_STRATEGY.md` v1.2, `CLAUDE.md` gate note, regenerated
  report, W28 archive move). Appended this prompt-log entry and shipped the doc-only change, then handed
  the founder a ready-to-paste continuation prompt for the next session (Phase B / Layer 3: LanguageTool
  sentence grammar; plus optional Layer-2 coverage polish and the Phase C `verification` trust block).
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`. PR + commit: see below.

## Entry 215 — 2026-07-07 (session 78)
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Continue the data strategy plan (docs/strategy/DATA_STRATEGY.md). Phase A (Layer 2, the two-oracle
  > noun-fact CI gate) is done and merged — start at the "Resume here" handoff in docs/PROJECT_STATUS.md
  > (session 77). Build Phase B — Layer 3, the offline linguistic engine: run LanguageTool over every
  > German sentence in the content banks (vocab examples, collocation example.de, dialogue lines,
  > reading texts, redemittel) for grammar/spelling, plus a CEFR plausibility heuristic (word-frequency
  > + sentence complexity) that flags items far from their claimed cefr facet. Constraints, mirroring
  > Phase A: outbound HTTPS only reaches npm/PyPI/crates/Go/JSR (kaikki, de.wiktionary, DWDS are
  > 403-blocked); check early whether a usable LanguageTool distribution is reachable, else fall back to
  > an unrestricted CI machine. Layer 3 is warn-only / scheduled report, NOT a hard merge gate. Emit a
  > bucketed report to docs/reports/. Work on branch claude/data-strategy-plan-78r0jq, keep gates green,
  > auto-ship via a squash-merged PR into main, update docs + prompt log. If Phase B's tooling is
  > blocked, fall back to Phase C instead.
- **Response summary:** Built **Phase B (Layer 3)**. First proved the tooling is reachable: the
  LanguageTool download host + kaikki/de.wiktionary are 403, but **Maven Central is reachable**, and
  Java 21 + Maven are installed, so LanguageTool 6.8 `language-de` (88 jars, ~69 MB) resolves in-sandbox
  — no fallback needed. **Grammar/spelling:** `scripts/build-languagetool.mjs` (resolves LT pinned from
  Maven, gitignored) + a Java runner `scripts/lt/LtCheck.java` + `scripts/verify-grammar.mjs` run LT over
  **2,315 German sentences** (vocab/collocation examples, dialogue lines/options/models/prompts,
  reading-text bodies/questions, redemittel phrases/examples). **0 grammar errors, 98.8% clean**, one
  real headword typo caught and fixed (`v_kulanzloesung`: "Kulanslösung" → "Kulanzlösung"). **CEFR
  heuristic:** `scripts/build-frequency-subset.mjs` (vendors `wordfreq` German Zipf, offline) +
  `scripts/verify-cefr.mjs` compare claimed `cefr` to word frequency + sentence complexity. First cut
  flagged 44% (unigram frequency can't grade German compounds), so recalibrated to precision-first —
  flags only the reliable "common word, advanced label" direction, vocab only → **6 FLAG + 72 WATCH** of
  1,182 items. Both are **warn-only reports** (`docs/reports/verify-grammar-report.md`,
  `verify-cefr-report.md`), regenerated monthly by `.github/workflows/verify-sentences.yml` (artifacts,
  no auto-commit); `validate.yml` untouched. All gates green: `lint:content`, `verify:facts` (0 gate
  errors), `build`, `lint` (0 errors), `test:unit/srs/pronounce`, `check:bundle`. Updated
  `DATA_STRATEGY.md` → v1.3, `CLAUDE.md`, `PROJECT_STATUS.md` (+ moved the session-76 handoff to the W28
  archive per the doc-hygiene rule). (Branch used: `claude/data-strategy-phase-b-wiw3mu`, the one this
  session was assigned.)
- **Artifacts:** `scripts/lt/LtCheck.java`, `scripts/build-languagetool.mjs`, `scripts/verify-grammar.mjs`,
  `scripts/build-frequency-subset.mjs`, `scripts/verify-cefr.mjs`,
  `scripts/vendor/german-frequency-subset.json`, `scripts/vendor/german-nouns-subset.json` (1-line
  regen), `src/data/vocabulary.ts` (typo fix), `package.json`, `.gitignore`,
  `.github/workflows/verify-sentences.yml`, `docs/reports/verify-grammar-report.md`,
  `docs/reports/verify-cefr-report.md`, `docs/strategy/DATA_STRATEGY.md`, `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`,
  `docs/SESSION_PROMPT_LOG.md`. Shipped via **PR #356** (squash-merged, `56e4225`), then branch realignment.

## Entry 216 — 2026-07-07 (session 78)
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > what's next?
- **Response summary:** Gave a CTO read of the remaining verification-ladder phases. Recommended **Phase C
  (the trust model)** next as the highest-leverage free move: it turns the Layer 2/3 checks into a
  per-item, auditable tier surfaced on `/sources` (the Article 10 payoff), needs no German and no spend.
  Flagged the alternatives (small content cleanups from the Phase B reports; Phase D, the AI jury, as the
  first paid rung needing ~150 human-labeled calibration items). Asked whether to build Phase C.
- **Artifacts:** none (recommendation only).

## Entry 217 — 2026-07-07 (session 78)
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes, implement phase c
- **Response summary:** Built **Phase C (the trust model)**. Added the `Verification` block
  (`tier`/`checks[]`/`confidence`/`last_verified` + `VerificationTier`/`Layer`/`Result` enums) to
  `ProvenanceEntry`. Wrote `scripts/build-verification.mjs` (`pnpm build:verification`) that composes the
  Layer 2 fact verdicts + Layer 3 grammar (via a new `docs/reports/verify-grammar.json` sidecar emitted by
  `verify:grammar`) + CEFR results into the **generated** `src/data/verification.ts`, keyed by content_id,
  every record sharing one sweep-date const so re-runs only diff moved items. Exported the compute helpers
  from `verify-facts`/`verify-cefr` (and guarded their `main()`) so the aggregator reuses them without
  re-running LanguageTool. `/sources` (`Sources.tsx`) now shows a per-item **tier badge + confidence** and
  a tier-distribution section; `lint:content` validates the closed enums and prints the distribution
  (records, not a gate). **First sweep over 1,408 items: 25 human · 1,266 linguistic · 1 facts · 116
  provenance** (1,292 machine-attested). `DATA_STRATEGY.md` → **v1.4**. All gates green (`lint:content`
  with the tier summary, `verify:facts`, `build`, `lint` 0 errors, `test:unit/srs/pronounce`,
  `check:bundle` main 79.5 kB; `verification.ts` rides the lazy `/sources` chunk).
- **Artifacts:** `src/types/index.ts`, `scripts/build-verification.mjs`, `src/data/verification.ts` (generated),
  `scripts/verify-facts.mjs` + `scripts/verify-cefr.mjs` (export helpers + guard main),
  `scripts/verify-grammar.mjs` (owner tags + `verify-grammar.json` sidecar), `scripts/lint-content.mjs`,
  `src/features/legal/Sources.tsx`, `package.json`, `docs/reports/verify-grammar.json`,
  `docs/strategy/DATA_STRATEGY.md`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.
  Shipped via **PR #357** (squash-merged, `05d21fd`), then branch realignment.

## Entry 218 — 2026-07-07 (session 78)
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** The session's substantive docs were already written and merged inline with the
  work: `PROJECT_STATUS.md` (session-78 handoff covering Phase B + Phase C, header, content counts, W28
  archive move of the session-76 handoff), `DATA_STRATEGY.md` → v1.4 (Phase B + C "SHIPPED" notes,
  roadmap, changelog), `CLAUDE.md` (new `verify:grammar` / `verify:cefr` / `build:languagetool` /
  `build:frequency-subset` / `build:verification` command docs + `verification.ts` in the data layout),
  and prompt-log entries 215–217. This entry closes the paper trail for the "document the session"
  request; shipped as a doc-only change.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`. PR + commit: see below.

## Entry 219 — 2026-07-07 (session 79)
- **Branch:** `claude/human-loop-data-strategy-scale-jp0lzf`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > following the data strategy implementation plan, how would a hum in the loop keep track of the content, share the data matched with sources to auditors and how would the database be managed when the app is scaled 100x from now?
- **Response summary:** Research-and-answer only, no code changes. Read `DATA_STRATEGY.md` (v1.4),
  `DATA_GOVERNANCE.md`, the provenance/verification infra (`provenance.ts`, generated `verification.ts`,
  `Sources.tsx`), and the Supabase schema (`provenance_reviews` migration 0004 + `provenanceReviews.ts`,
  the five migrations). Answered in three parts framed around Genauly's **two data planes** (static
  content plane vs Supabase user plane). **(1) Human-in-the-loop tracking:** the verification ladder tracks
  every item's `tier`/`confidence` in data; the human works only the machine-generated **exception queue**,
  and verdicts persist via the founder-only `provenance_reviews` table + `/sources` admin overlay
  (`review_status → verified`), with a staleness re-verification cadence. **(2) Auditor sharing:** the
  reproducible per-item chain (source + license snapshot + fact/grammar/jury verdicts with tool/version/date
  + human sign-off), surfaced on the auto-generated `/sources` page and mapped to EU AI Act Art. 10/12.
  **(3) 100x DB:** content plane stays CDN-cheap (migrate files → content table only if the *library* grows
  100x); user plane is standard Postgres scaling (Supavisor pooling → indexed/index-friendly RLS →
  partition/archive `ai_usage`+writing → replicas) plus the real lever: **server-side metering/capping of
  AI-writing-coach token spend**, and resolving the `progress` fixed-column upsert debt. Offered three
  follow-up deliverables (now backlog #33–#35).
- **Artifacts:** none (Q&A; no files changed).

## Entry 220 — 2026-07-07 (session 79)
- **Branch:** `claude/human-loop-data-strategy-scale-jp0lzf`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document this session. we'll come back to these tasks later
  >
  > also add the above tasks to backlog tiems
- **Response summary:** Doc-only session close. Appended prompt-log entries 219–220; added a session-79
  handoff pointer to `PROJECT_STATUS.md` "Resume here" (the three follow-ups are parked, no code shipped);
  and added the three offered deliverables to the founder backlog in `PROJECT_REFERENCE.md` as **#33**
  (human-in-the-loop exception-queue tooling), **#34** (auditor handoff package), and **#35** (scale-to-100x
  database plan). No product code touched.
- **Artifacts:** `docs/PROJECT_REFERENCE.md` (backlog #33–#35), `docs/PROJECT_STATUS.md` (Resume-here
  pointer), `docs/SESSION_PROMPT_LOG.md` (entries 219–220).

## Entry 221 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > based on the project documentation what are the top 3 most value added tasks to work on next?
- **Response summary:** Research-only answer. Read `PROJECT_STATUS.md` + `PROJECT_REFERENCE.md` and
  recommended, ranked, as a CTO: (1) **EU AI Act Article 50 transparency (#21)** — hard 2 Aug 2026
  deadline, cheap, de-risking; (2) **SEO + landing FAQ/copy (#10/#11/#12)** — the product is
  feature-complete but has had no acquisition work; (3) **deepen the daily-life content + verify the draft
  rows** — the repositioning's core differentiation, with the newest packs still shallow. Noted the built
  roadmap's own next rung (Phase D, the AI jury) but ranked it below, since it is the first *paid* rung and
  parked items #33–35 were deferred by the founder.
- **Artifacts:** none (advice; no files changed).

## Entry 222 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > isn't the first point already done? if not, do it. work on all three now
- **Response summary:** Verified and executed all three. **#21:** the Art. 50 *copy* was already live
  (`WritingHub.tsx` point-of-use notice + "KI-generierte Rückmeldung" label + `PrivacyPolicy.tsx` DE/EN AI
  section); the missing piece was the documented Article 6(3) risk assessment, now written as
  **`docs/strategy/AI_ACT_RISK_ASSESSMENT.md`** (v1.0: not high-risk/limited-risk, Art. 6(3) derogation,
  profiling flagged for counsel). **SEO:** added Open Graph + Twitter meta, canonical, and two JSON-LD
  graphs (WebApplication + FAQPage) to `index.html`; added `public/robots.txt` + `public/sitemap.xml`; added
  a "Wie funktioniert Genauly?" 3-step strip and a 6-item FAQ accordion to `LandingPage.tsx`. **Content:**
  +4 reading texts (18→22, checks 54→66), one per newest daily-life theme covering a new sub-theme + new
  kind, with +4 provenance rows (1408→1412, all draft). All gates green (`lint:content`, `build`,
  `check:bundle` 83 kB, `lint` 0 errors, `test:unit` 85). Marked #21 CLOSED in `PROJECT_REFERENCE.md`.
- **Artifacts:** `docs/strategy/AI_ACT_RISK_ASSESSMENT.md` (new), `index.html`, `public/robots.txt` (new),
  `public/sitemap.xml` (new), `src/features/landing/LandingPage.tsx`, `src/data/texts.ts`,
  `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/PROJECT_REFERENCE.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/SESSION_PROMPT_LOG.md` (entries
  221–222). Shipped as PR #360 (squash-merged to `main`, commit `cb7d9dc`).

## Entry 223 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > it's live now. What's next?
- **Response summary:** Recommended the next push and offered four directions via a choice prompt; the
  founder picked **"Deepen daily-life content."** Executed: added **5 exam sets** (`examSets` 10→15), one per
  daily-life theme (behoerde/arzt/wohnen/bank/bildung), each a telc-style joint-planning speaking simulation
  referencing the theme's existing scenario and reusing `sharedRubric`, so every life domain now has
  exam-prep parity with the workplace themes (previously workplace-only). +5 `exam_set` provenance rows
  (draft), 1412→1417. `ExamHub` maps over all sets unfiltered, so they surface immediately. Gates green
  (`lint:content` 15 examSets / 1417 rows, `build`, `check:bundle` 83 kB, `test:unit` 85). Docs updated
  (handoff follow-on, counts, CLAUDE.md provenance count).
- **Artifacts:** `src/data/examSets.ts`, `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 223). Shipped as PR #361 (squash-merged to `main`, commit `2b396de`).

## Entry 224 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue
- **Response summary:** Continued the daily-life depth work with the next suggested step: a **2nd branching
  dialogue per newest daily-life theme** (`dialogues` 16→20, all level 2). Added `sc_apotheke` (arzt,
  redeeming a prescription at the pharmacy), `sc_wohnungsmangel` (wohnen, reporting a heating defect to the
  landlord), `sc_kartesperren` (bank, blocking a lost card), and `sc_pruefungsanmeldung` (bildung,
  registering for the telc exam). Each is a 5-node graph (4 partner turns + narrator end, 3 scored options
  each) matching the existing schema and covering a different situation than the theme's L1 scenario. +4
  `dialogue` provenance rows (draft), 1417→1421. Verified against the dialogue linter's graph-integrity
  rules (start/next/reachability/no-orphans/valid speakers+redemittel). Gates green (`lint:content` 20
  dialogues / 1421 rows, `build`, `check:bundle` 83 kB, `test:unit` 85). Docs updated.
- **Artifacts:** `src/data/dialogues.ts`, `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 224). Shipped as PR #362 (squash-merged to `main`, commit `7ffe5ae`).

## Entry 225 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > work on seo task then
- **Response summary:** Closed the one open SEO/growth follow-up: a proper **1200×630 Open Graph share
  image** (previously the link preview used the square PWA icon). Built `public/og-image.png` as a branded
  card (logo, "Break through the B1–B2 plateau", domain pills, genauly.de tagline) via a new generator
  `preview/og-image/make-og.mjs` that writes a self-contained HTML card screenshotted with the pre-installed
  Chromium (the repo has no headless-render dependency). Wired `index.html`: `og:image` + `twitter:image`
  now point at it, added `og:image:width/height/type` + descriptive alt, and upgraded the Twitter card to
  `summary_large_image`. Build green; the image ships to `dist/og-image.png`; main chunk holds at 83 kB.
  This completes the SEO surface (meta/OG/Twitter/canonical/JSON-LD, robots, sitemap, landing FAQ, share
  card); remaining growth work is non-code (real screenshots/testimonials) or a separate lane.
- **Artifacts:** `public/og-image.png` (new), `preview/og-image/make-og.mjs` (new), `index.html`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 225). Shipped as PR #363 (squash-merged to
  `main`, commit `a6f0690`).

## Entry 226 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Session documentation pass. Prompt-log entries 221–225 were written as the work
  shipped; this pass backfilled the PR/commit references on the last entry, added this entry (226), and
  verified `docs/PROJECT_STATUS.md` (consolidated session-80 handoff + all content counts:
  22 texts/66 checks, 15 exam sets, 20 dialogues, 1,421 provenance rows), `docs/PROJECT_REFERENCE.md`
  (#21 marked closed), and `CLAUDE.md` (text/provenance counts) are current. **Session 80 shipped 4 PRs to
  `main`:** #360 (EU AI Act Art. 6(3) risk assessment doc + full SEO meta/OG/JSON-LD/robots/sitemap +
  landing FAQ/how-it-works + 4 daily-life reading texts), #361 (5 daily-life exam sets), #362 (4 second
  daily-life dialogues), #363 (1200×630 OG share image). No code changed in this doc pass.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (entries 225–226), `docs/PROJECT_STATUS.md` (verified).
  Commit SHA + PR # to be filled on push/merge.

## Entry 227 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > What's next in the game plan?
- **Response summary:** Explained the Neuland game roadmap state (`GAME_IMPLEMENTATION_PLAN.md`): G0/G1
  shipped, **G2 is the next rung but HALTED on founder order**. Noted the parked G2 groundwork draft (missions
  1.1/1.2 + settings) sitting unmerged on the old branch `claude/neuland-g1-g2-feedback-wkf28n`, the Supabase
  game-state migration prerequisite, and that G2 = 5–8 Kapitel-1 missions + a real learner playtest. Asked
  whether to unpark or keep on hold. No code.
- **Artifacts:** none (chat only).

## Entry 228 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > is ut really necessary to pay in g2? what is it I'm paying for?
- **Response summary:** Clarified the cost boundary: the only paid items in the whole game plan are optional,
  one-time, and ~30–60 EUR total (itch.io modern-city pixel art packs + Aseprite editor), with zero recurring
  cost. Free path exists (Kenney CC0 packs + Pixelorama/LibreSprite). The trade-off is setting/consistency
  and my patching time, not raw quality. Recommended: pay nothing yet, ship G2 with free/placeholder art,
  run the playtest first, buy one matching pack only if the playtest succeeds. No code.
- **Artifacts:** none (chat only).

## Entry 229 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes let's do that then
- **Response summary:** Founder gave the go for G2 (zero-spend, incremental, playtest-first). Started G2 with
  the first increment: **ported chapter-1 missions 1.1 (Willkommen in Neuland) and 1.2 (Der Fahrkarten-Automat)**
  from the parked draft onto current `main`. Did NOT rebase the whole parked branch (189 files, diverged since
  s74); extracted only the two draft missions and reconciled them against the current schema. Small contained
  schema extension: added a `terminal` scene setting (airport/station backdrop, neutral stage + "Bahnhof"
  caption for now) and an optional per-scene `label` (stage caption override), mirrored in `lint-content.mjs`
  and threaded through the Cutscene/Listening/Battle renderers. Added NPCs `npc_beamter`/`npc_automat`, key
  items `ki_reisepass`/`ki_fahrschein`, and 2 provenance rows (draft). Missions are travel-theme, B1.1, each a
  cutscene → dialogue battle → payoff arc with a scaffolded-retry lose path (failure-as-content). Neuland now
  has **3 missions** (1.1, 1.2, 1.6 boss); 1.3–1.5 remain for the next increments. Gates green:
  `lint:content` (3 missions / 18 scenes / 8 NPCs / 6 key items / 1423 rows), `build`, `check:bundle` (83 kB,
  game stays lazy), `test:unit` (85), `lint` (0 errors).
- **Artifacts:** `src/data/missions.ts`, `src/data/provenance.ts`, `src/types/game.ts`,
  `scripts/lint-content.mjs`, `src/features/welt/stage.tsx`, `src/features/welt/scenes.tsx`,
  `src/features/welt/BattleView.tsx`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entries 227–229).
  Shipped as **PR #365** (squash-merged to `main`, commit `e4e00e7`).

## Entry 230 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead with 1.3 to 1.5
- **Response summary:** Authored the remaining three chapter-1 Neuland missions (not in the parked draft, so
  written fresh against the established scene patterns), completing **Kapitel 1 end-to-end**:
  **1.3 "Die SIM-Karte"** (phone-shop upsell battle vs Milo, resist the Vertrag, tariff-page parody, grants
  `ki_sim_vertrag`; theme `technology`), **1.4 "Der erste Einkauf"** (Leergutautomat/Pfand parody teaching
  Mehrweg 8 ct / Einweg 25 ct + the legendary checkout-speed battle vs the Kassiererin; theme `sustainability`
  via the recycling angle), **1.5 "Ein Dach über dem Kopf"** (landlord Herr Brandt polite-register battle +
  the Wohnungsgeberbestätigung form-cloze, grants `ki_wohnungsgeberbestaetigung`, sets up the boss's document
  chain; theme `wohnen`). Added a `laden` (shop) scene setting, NPCs `npc_milo`/`npc_kassiererin`/
  `npc_herr_brandt`, key item `ki_sim_vertrag`, and 3 draft provenance rows. Chained 1.2→1.3→1.4→1.5 via
  `requiresMissions`; **left the boss (1.6) ungated on purpose** (a `mission.test.ts` fixture pins it as the
  standalone playtest slice) after briefly gating it broke that test. Neuland now has **6 missions** (full
  Kapitel 1). Gates green: `lint:content` (6 missions / 35 scenes / 11 NPCs / 7 key items / 1426 rows),
  `build`, `check:bundle` (83 kB, game stays lazy), `test:unit` (85), `lint` (0 errors).
- **Artifacts:** `src/data/missions.ts`, `src/data/provenance.ts`, `src/types/game.ts`,
  `scripts/lint-content.mjs`, `src/features/welt/stage.tsx`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 230). Shipped as **PR #366** (squash-merged to `main`, commit `bfd143b`).

## Entry 231 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Documentation wrap-up for session 81 (G2 kickoff + Neuland Kapitel 1 completed across
  PRs #365 and #366). Most of the record was written inline as the two increments shipped: the
  `PROJECT_STATUS.md` header, content counts (game missions 1→6, scenes→35, NPCs→11, key items→7, provenance
  →1,426) and the session-81 "Resume here" handoff (rewritten to reflect the complete chapter), plus
  prompt-log entries 227–230 and the move of the session-79 handoff into the W28 status archive. This pass
  backfilled the PR/commit references on entries 229 (**PR #365**, `e4e00e7`) and 230 (**PR #366**, `bfd143b`),
  refreshed the stale game facts in `CLAUDE.md` (Kapitel 1 now complete, G2 is GO) and flipped the
  `GAME_IMPLEMENTATION_PLAN.md` G2 phase status from not-started to in-progress, and added this entry.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (entries 229–231), `CLAUDE.md`,
  `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md` (verified current). Doc-only; shipped
  via PR → squash-merge → branch realign.

## Entry 232 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 2 screenshots of `/welt` (the Willkommen passport battle + the Fahrkarten-Automat cutscene), both showing a blank beige game stage
- **Prompt (verbatim):**
  > looks like there's no game visuals here..
- **Response summary:** Diagnosed and fixed. Root cause: `SETTING_ART` in `src/features/welt/stage.tsx`
  mapped the `terminal` (8 scenes) and `laden` (8 scenes) settings to `null`, so the two most-used
  Chapter-1 backdrops rendered as the neutral paper stage. Authored two code-authored placeholder backdrops
  in `preview/game-pixel-mockups/welt_assets.py` (blessed scene-7 pixel language, new polished-tile floor
  helper): **terminal** (transit hall: split-flap board, passport/service counter under the battle-opponent
  spot, self-service ticket machine, direction sign) and **laden** (shop: product shelves, checkout counter
  with register + card terminal, sale poster). Installed Pillow, regenerated `terminal.png`/`laden.png`,
  wired both into `SETTING_ART` (`website` stays `null` on purpose). Sent the founder upscaled previews.
  Gates green: `pnpm build`, `check:bundle` (83 kB, game stays lazy).
- **Artifacts:** `preview/game-pixel-mockups/welt_assets.py`, `src/features/welt/assets/terminal.png`,
  `src/features/welt/assets/laden.png`, `src/features/welt/stage.tsx`. Shipped as **PR #368** (squash-merged
  to `main`, commit `5445b79`).

## Entry 233 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 screenshot (Fahrkarten-Automat now rendering with the transit-hall backdrop after deploy)
- **Prompts (verbatim):**
  > yes.. automerge!!
  > the visual is the same in 1.2, is that correct?
  > will the character be able to walk in the game as per the plan?
  > is g2 complete?
  > should we continue g2 implementation here or in a fresh session?
  > go ahead
- **Response summary:** Opened + squash-merged **PR #368** into `main`, ran the post-merge branch realign
  (reset to `origin/main`, force-with-lease push). Answered a run of roadmap questions: (1) the repeated
  backdrop within mission 1.2 is correct, backdrops are per-location and 1.2 is all at the Hauptbahnhof;
  the unoccupied counter is because the battle opponent (`npc_automat`) has no sprite. (2) Walking is
  planned but phased, full free-roam is **G3** (Phaser overworld, playtest-gated); battle/cutscene scenes
  are staged React tableaux by design; only the loadout scene walks today. (3) **G2 is in progress, not
  complete**, remaining: recurring-mission composer, fetch-quest loop, Supabase game-state migration.
  Recommended doing those in a fresh session (different subsystem, wants plan-first) and closing the
  doc-accuracy update here. On "go ahead", updated the stale "neutral stages" lines in `CLAUDE.md` +
  `GAME_IMPLEMENTATION_PLAN.md`, refreshed `PROJECT_STATUS.md` (s82 header + handoff, dropped backdrops
  from the G2-pending list, moved the aged-out s80 handoff into the W28 archive), and added these entries.
- **Artifacts:** `CLAUDE.md`, `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`,
  `docs/SESSION_PROMPT_LOG.md` (entries 232–233). Doc-only; shipped via PR → squash-merge → branch realign.

## Entry 234 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > why is every mission looking like final boss mission with energy bars? is there no variety?
  > your explanation is too technical. can you brief me in simpler language and what's your recommendation?
  > is it necessary to change the order? if we complete the game implementation plan, anyway everything will be in place, right?
  > go with your recommendation
- **Response summary:** Confirmed the founder's observation from the data: all 6 Kapitel-1 missions have
  exactly one dialogueBattle as centerpiece (scene mix 20 cutscene / 6 battle / 3 websiteParody /
  2 listening / 2 formCloze / 1 loadout), so the Geduld/Mut bars appear every mission. Cause: the battle is
  the only fully-built interactive mechanic; the 20-type activity catalog in
  `MISSION_ACTIVITY_RESEARCH.md` mostly needs renderers not yet built (mission 1.2 was always intended as
  a Keypad/Automat scene, authored as a battle because that kind doesn't exist). Recommended, and the
  founder approved after a plain-language briefing and an is-it-necessary check (answer: same total work,
  re-sequenced so the playtest measures fun, not repetition): **build scene variety before the plumbing.**
  New G2 order: (1) hotspot tappable-stage layer, (2) Keypad/Automat kind + re-skin 1.2 and the 1.4
  Leergut beat, (3) type-under-timer for the 1.4 checkout, then (4) recurring-mission composer,
  (5) fetch-quest loop, (6) Supabase game-state migration. Decision recorded in
  `GAME_IMPLEMENTATION_PLAN.md` (G2 status block) and the s82 handoff in `PROJECT_STATUS.md`.
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 234). Doc-only; shipped via PR → squash-merge → branch realign.

## Entry 235 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I'd like to complete the implementation of the game plan before showing it to a crowd because the crowd I'll be sharing with are b2 learners. if they don't have enough content to play with they'll be bored with the easy stuff in the beginning.
- **Response summary:** Validated the concern with data (all Kapitel-1 missions are B1.1–B1.2, too easy
  for a B2 crowd) and sized the options: the assistant recommended a middle path (G2 variety + Kapitel 2
  + a start-at-your-level entry, city after external feedback), and offered "through Kapitel 3" and "full
  plan incl. city" as alternatives. **The founder chose the full plan: complete G2 + author Kapitel 2–6 +
  build the G3 walkable city before the external 5–10-learner playtest.** Risk management agreed: founder
  remains the internal per-chapter tester, content before engine, zero-spend holds, and a chapter-select /
  start-at-your-level entry joins the build list so B2 testers can skip the easy opening. Recorded in
  `GAME_IMPLEMENTATION_PLAN.md` (G2 status block + a G3 gating note: G3 no longer playtest-gated; the
  external test moves to the end of G3) and the s82 handoff in `PROJECT_STATUS.md` (long-road order:
  G2 variety rungs → Kapitel 2–6 → plumbing interleaved → chapter-select → G3 city → external playtest).
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 235). Doc-only; shipped via PR → squash-merge → branch realign.

## Entry 236 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > is model recommendations included in the plan?
- **Response summary:** Yes: `GAME_IMPLEMENTATION_PLAN.md` has a "Claude model recommendations" section
  (tier table + per-task map + the open-strong/downshift working pattern), and general per-session model
  guidance lives in `PROJECT_REFERENCE.md`. The map predated the two s82 decisions, so added rows for the
  newly approved work: variety scene-kind SCHEMA shape (Fable 5, closed-union longevity), variety
  renderers + 1.2/1.4 re-skin (Sonnet 5), chapter-select entry (Sonnet 5), Kapitel 2–6 arc design per
  chapter (Fable 5), and Kapitel 2–6 mission authoring (Sonnet 5 draft + Haiku 4.5 gates).
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (entry 236).
  Doc-only; shipped via PR → squash-merge → branch realign.

## Entry 237 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > okay. document this session. I'll continue in another one
  > continue
- **Response summary:** Session-82 documentation wrap-up. Most of the record was written inline as the work
  shipped (PROJECT_STATUS s82 header + handoff, the two decision notes in `GAME_IMPLEMENTATION_PLAN.md`, the
  model-map rows, prompt-log entries 232–236, the s80 handoff moved to the W28 archive). This pass finished
  it: rewrote the `PROJECT_STATUS.md` `_Last updated_` header to lead with the visuals fix + both G2
  decisions, refreshed the stale game-layer header in `CLAUDE.md` (G2 GO → G2 in progress; added the s82
  direction summary), and added this entry. Session shipped 5 PRs to `main`: #368 (terminal/laden
  backdrops, the only code change), #369 (doc-accuracy), #370 (variety-first reorder), #371 (playtest gate
  to end of full build), #372 (model-map rows).
- **Artifacts:** `docs/PROJECT_STATUS.md`, `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md` (entry 237). Doc-only;
  shipped via PR → squash-merge → branch realign.

## Entry 238 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > start the G2 variety work
- **Response summary:** Read the s82-approved G2 reorder (scene variety before plumbing) and built
  **rung 1: the `hotspot` scene kind** (activity catalog #2 "Hotspot antippen", one generic
  tappable-stage layer that also carries #7 "Aufruf abfangen" and #18 "Listen-and-act" via an optional
  TTS `audio` line). The player proves comprehension by TAPPING the right place on the pixel stage
  instead of picking a sentence; wrong taps earn only a deadpan reaction (failure is content), the scene
  clears once every `correct` spot is found. Missions stay data, not code: `types/game.ts` (`Hotspot` +
  `HotspotScene` in the closed `MissionScene` union), `engine/mission.ts` (pure `tapHotspot`/
  `hotspotSolved` with scene-scoped first-try FSRS grading + XP, two run-state maps), `HotspotView`
  renderer in `features/welt/scenes.tsx` (blessed pixel-UI language, wired into `MissionPlayer`),
  `lint-content.mjs` mirror + spot validation, 6 runner tests over an inline fixture. Used the kind in
  the two earliest-played missions so the variety is visible: **1.1** gains a listen-and-act departure
  board (tap Gleis 4), **1.4** gains the shelf search (tap Milch/Brot/Äpfel among distractors). Gates
  green: `lint:content` (6 missions / 37 scenes), `test:unit` (91, +6), `build`, `check:bundle` (83 kB),
  `lint` (0 errors). Shipped as PR #374.
- **Artifacts:** `src/types/game.ts`, `src/engine/mission.ts`, `src/features/welt/scenes.tsx`,
  `src/features/welt/MissionPlayer.tsx`, `scripts/lint-content.mjs`, `src/data/missions.ts`,
  `tests/mission.test.ts`; docs `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 238). PR #374 → squash-merge → branch realign.

## Entry 239 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead
- **Response summary:** Built **G2 variety rung 2: the `automat` (Keypad/Automat) scene kind** (activity
  catalog #8). A step-by-step rendered machine: the player reads the screen and presses the right key; a
  correct key advances the machine, a wrong key only buzzes (infinite patience, no bars, no lockout).
  Missions stay data, not code: `types/game.ts` (`AutomatKey`/`AutomatStep`/`AutomatScene` in the closed
  union), `engine/mission.ts` (pure `pressKey`/`currentAutomatStep`/`automatDone` with per-step first-try
  FSRS grading + XP, `AutomatRuntime` on the run, cleared on win), `AutomatView` renderer (device plate +
  LCD screen + keypad) wired into `MissionPlayer`, `lint-content.mjs` step-graph validation, 6 runner
  tests. **Re-skinned off the dialogueBattle per the founder's s82 reorder:** 1.2 Fahrkarten-Automat (the
  ticket-machine battle becomes a real machine; removed the unused `neustart` retry scaffolding, one fewer
  battle) and the 1.4 Leergut beat (the Pfand websiteParody becomes the Leergutautomat; removed the
  `vergessen` branch). `npc_automat` now unused, left in the registry (harmless). Gates green:
  `lint:content` (6 missions / 35 scenes), `test:unit` (97, +6), `build`, `check:bundle` (83 kB), `lint`
  (0 errors). Shipped as PR #375.
- **Artifacts:** `src/types/game.ts`, `src/engine/mission.ts`, `src/features/welt/scenes.tsx`,
  `src/features/welt/MissionPlayer.tsx`, `scripts/lint-content.mjs`, `src/data/missions.ts`,
  `tests/mission.test.ts`; docs `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 239). PR #375 → squash-merge → branch realign.

## Entry 240 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the 1.1 departure-board hotspot scene (game `/welt`)
- **Prompt (verbatim):**
  > @".../7a56fccf-1000085657.png" is this what you intended? it looks weird. what are the bubbles supposed to mean in thr game world?
- **Response summary:** Explained the "bubbles" are the hotspot tap targets (tap your platform, Gleis 4,
  to advance) and agreed the presentation was poor: big translucent circles read as floating soap bubbles
  disconnected from the world. **Fix (PR #376):** restyled labeled hotspot targets as solid pixel
  sign-plates (opaque cream fill, `GAME_OUT` border, hard shadow, gentle idle bob) so they read as
  tappable station/shelf signs; kept the translucent pulsing ring only for label-less "tap the real object"
  spots; found → teal plate + check, wrong → rose shake. Tidied 1.1 platform signs into a row and 1.4 shelf
  tags into two rows. Verified the look with a Chromium-rendered mock over the real `terminal.png` backdrop
  and sent it to the founder. Gates green (lint:content, 97 tests, build, bundle 83 kB, lint 0 errors);
  CI green; squash-merged; branch realigned.
- **Artifacts:** `src/features/welt/scenes.tsx`, `src/data/missions.ts`; PR #376 → squash-merge → realign.
  `docs/SESSION_PROMPT_LOG.md` (entry 240).

## Entry 241 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the story line and the exercises/missions are weak. suggest me how can I research and brainstorm with various tools like chatgpt or Gemini
- **Response summary:** Advisory answer (no code). Named the two real problems (story = no player *want* /
  flat stakes / thin NPCs; missions = repeated shape + choices without consequence), gave the four-rule
  method that makes LLM brainstorming work (prime with real docs → ask for a named artifact → force a
  critique loop → cross-examine tools then synthesize), a tool-by-tool guide (Claude/ChatGPT deep
  research/Gemini/NotebookLM), and a starter copy-paste prompt pack. Offered four concrete next actions
  (primer pack, in-house brainstorm, deep-research report, expanded prompt pack). A follow-up
  AskUserQuestion failed on a tool-permission error, so the options were restated in plain text.
- **Artifacts:** none (advisory). `docs/SESSION_PROMPT_LOG.md` (entry 241).

## Entry 242 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i want all four
- **Response summary:** Produced all four deliverables as `docs/strategy/` docs (PR #377, docs-only),
  grounding them in `GAME_CONCEPT.md` + `GAME_DESIGN.md` and real web research (Wagotabi, Influent,
  Duolingo Adventures, Terra Alia, the serious-games narrative review, Dan Harmon story circle, task-based
  SLA): **`NEULAND_PRIMER.md`** (paste-ready context pack), **`BRAINSTORM_TOOLKIT.md`** (method + prompt
  pack + tool tactics), **`STORY_MISSION_BRAINSTORM.md`** (worked multi-lens brainstorm: keystone want
  "stop being a problem to be processed, become a person who belongs"; Chapter 1 on the Harmon circle
  with 1.5 as false victory and 1.6 as the cost; cast want/flaw/tic; per-mission fixes for 1.1/1.3/1.5),
  **`LANGUAGE_RPG_RESEARCH.md`** (cited survey + 10 prioritized recommendations). Sent all four to the
  founder; committed and squash-merged; branch realigned. Recommended the keystone decision is the player
  *want*, and flagged that all AI-drafted German stays a draft until `verify:grammar`/native review.
- **Artifacts:** `docs/strategy/NEULAND_PRIMER.md`, `docs/strategy/BRAINSTORM_TOOLKIT.md`,
  `docs/strategy/STORY_MISSION_BRAINSTORM.md`, `docs/strategy/LANGUAGE_RPG_RESEARCH.md`; PR #377 →
  squash-merge → realign. `docs/SESSION_PROMPT_LOG.md` (entry 242).

## Entry 243 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I'll run it through other llms. document the session for now
- **Response summary:** Session-documentation pass. Updated `docs/PROJECT_STATUS.md` (header + s83 handoff:
  added the hotspot sign-plate polish and the four story-research docs, noting the founder is taking them
  to other LLMs and the keystone decision is the player want) and appended prompt-log entries 240–243.
  No code changes.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 243). Doc-only; shipped via
  PR → squash-merge → branch realign.

## Entry 244 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the categorization of the items in the bibliothek needs a lot of improvement. Define what each
  > filter or classification means (difference between Situation and Thema) and do a thorough analysis
  > of the weak or vague or incorrect implementation of the various filters like Thema, Branche, etc. I
  > personally think it's helpful to classify using filters like below (not comprehensive): * Thema/
  > Situation - Teamarbeit, Besprechung, Transport, etc. * Branche - Pflege, Schule, Finanz, Bank, IT,
  > etc. (currently, there is Buro in Branche which is redundant and wrong to keep it here because every
  > Branche area has a Buro - if anything it should be in Thema but it's too vague to be there as there
  > are already specific Buro situations there. ) * Why Kollocations and Redemittel have way too less
  > filters? And Grammatik has no filter at all? * UI/UX elements like why should something be a dropdown
  > vs filter tab? * Visual bugs and improvements * How can one know what are the most useful words - can
  > there be some kind of graph to show most used words? I want you to spin up a panel of experts to
  > validate, research, challenge above ideas, existing content and structure, identify missing aspects
  > and finally provide a thorough and robust report with findings, gap analysis and recommendations to
  > take the app to make it ready for marketplace that would be genuinely useful and extremely intuitive
  > to work with for the users.
- **Response summary:** Analysis-only session (no app code changed). Ran a codebase audit that established
  the ground-truth facts (Branche `sector` 26/642 = 4%, only care+office live; Situation `workSituation`
  14/642 = 2.2%; Redemittel 0/82 with cefr or themeId; Grammar has no level field; Register `diplomatic`
  0 on collocations; `frequency` 0-tagged though `scripts/vendor/german-frequency-subset.json` wordfreq
  data already ships build-time-only; Domain axis exists in `domains.ts` but is surfaced nowhere; the
  theme `meetings` vs situation `meeting` naming collision). Then convened a 7-agent expert panel via a
  Workflow (information architecture, DaF/CEFR pedagogy, UX/interaction, content-data strategy,
  competitive/marketplace) + an adversarial red-team + a synthesis pass. Key conclusions: taxonomy is
  sound but *looks* broken; Thema vs Situation is one axis at two grains (retire `workSituation`, keep
  sub-themes); "Büro" removal is correct (category error); Branche should be hidden until a sector has
  depth (do not author per-industry packs); Redemittel needs CEFR but NOT a single themeId; Grammar needs
  search+group+level-badge not a facet sheet; "most useful words" ships as a generated frequency badge +
  honest composition chart, never a leaderboard; two free high-value axes nobody proposed (surface Domain
  as the spine, add an SRS-state filter). Delivered a full repo doc + a visual Artifact. No PR opened
  (analysis deliverable; P0 quick wins offered to the founder as the next step).
- **Artifacts:** `docs/plans/BIBLIOTHEK_CATEGORIZATION_AUDIT_2026-07-09.md` (full report + verbatim
  red-team appendix); visual report Artifact (categorization audit). `docs/SESSION_PROMPT_LOG.md`
  (entry 244). Committed to the dev branch; not merged (no code change).

## Entry 245 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead and scope the implementation of the top priorities from the report
- **Response summary:** Grounded the audit against the real code (found two audit corrections: the
  Kollokationen Thema dropdown already exists; `ui/select` lacked group primitives; verified the enum
  removals have no consumers outside data/types/facets) and wrote
  `docs/plans/BIBLIOTHEK_CATEGORIZATION_IMPLEMENTATION_PLAN.md`: five shippable PRs (1 stop-looking-broken,
  2 Grammar toolbar, 5 polish, 3 frequency, 4 Domain+SRS) with exact files, edge cases, backwards-compat,
  gates and effort, plus the decision-gated Redemittel backfill. Recommended order 1→2→5→3→4; PRs 1/2/5
  decision-independent.
- **Artifacts:** `docs/plans/BIBLIOTHEK_CATEGORIZATION_IMPLEMENTATION_PLAN.md` (commit 903eb9d, pushed to
  the dev branch). `docs/SESSION_PROMPT_LOG.md` (entry 245).

## Entry 246 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > let's lock in more decisions
- **Response summary:** Locked all five audit decisions via AskUserQuestion (founder answers): (1)
  **Branche parked** (after a clarifying founder question "why will be deleted? there is domain which is
  same as Branche isn't it?", answered with the Domain-vs-Branche role rule: Domain = life-sphere of the
  topic, Branche = industry you work in, cutting across topics); (2) **Redemittel CEFR backfill: yes**,
  AI-draft + founder review; (3) **Häufigkeit: badge + chart**; (4) **Domain/Mode: Mode on top**, Mode
  pre-selects domains; (5) **Amtssprache: parked** (default, no objection). Then implemented and
  squash-merged the ENTIRE plan in the same session: PR #379 (coverage floor + Büro deletion +
  workSituation retirement), PR #380 (Grammatik search + Gruppe dropdown + B2-priority order), PR #381
  (polish batch: diplomatic→formal fold, Redemittel restructure with inline register chips, Kollokationen
  counts + sub-theme picker, visible "Stufe: bis X" level chip, a11y), PR #382 (generated Häufigkeit
  signal: `pnpm build:frequency` → `src/data/frequency.ts`, facet + card label + Fortschritt chart with
  mastery overlay; also fixed the pre-existing black-charts bug where all Analytics charts referenced
  non-existent `var(--color-*)` vars), PR #383 (Domain-grouped theme dropdown via `lib/themeGroups.ts` +
  per-learner Lernstand `?srs=` facet), and the final docs+backfill PR (all 72 Redemittel AI-draft-tagged
  with cefr, level badge on each card for founder review). Every PR passed build, lint:content, test:unit
  (97), lint (0 errors), check:bundle (83 kB) and was Chromium-smoke-tested before merge.
- **Artifacts:** PRs #379, #380, #381, #382, #383 + the final docs/backfill PR (all squash-merged to
  `main`, branch realigned each time); `src/data/frequency.ts` (generated), `scripts/build-frequency.mjs`,
  `src/lib/themeGroups.ts` (new); updated `CLAUDE.md`, `docs/strategy/DATA_GOVERNANCE.md`,
  `docs/plans/BIBLIOTHEK_CATEGORIZATION_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`.
  `docs/SESSION_PROMPT_LOG.md` (entry 246). **Founder review pending: the 72 Redemittel cefr drafts.**

## Entry 247 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > implement p2 and p3 too
- **Response summary:** Shipped the audit's remaining P2 + P3 items as PR #385. P2: `GrammarTopic.cefr`
  added and all 10 topics AI-draft-tagged (B1.1 Nebensätze/Modalverben · B1.2 Relativsätze/Verbstellung/
  Kasus · B2.1 Konnektoren/da-Wörter/Konjunktiv II/Passiv · B2.2 Funktionsverbgefüge; founder verify
  pending), shown as badges on the hub cards + topic view, with a linter COMPLETENESS check; the
  control-choice rule + axis rule codified in the `lib/facets.ts` header and as a locked
  "Bibliothek classification axes" section in `docs/DECISIONS.md`. P3 resolved as CUT (not park): the
  0-tagged `counterpart`/`taskType` forward-declares deleted from types + linter mirrors (zero data
  lost), with a linter error on reintroduction. CLAUDE.md taxonomy/grammar facts refreshed. All gates
  green (build, lint:content, test:unit 97, lint 0 errors, bundle 83 kB) + Chromium smoke of the badges.
  With this, EVERY item from the categorization audit roadmap is shipped or founder-review-pending.
- **Artifacts:** PR #385 → squash-merge → realign; `docs/DECISIONS.md` (new locked section),
  `docs/SESSION_PROMPT_LOG.md` (entry 247).

## Entry 248 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document this session.
- **Response summary:** Session-documentation pass. Most docs were written incrementally during the
  session (prompt-log entries 244–247; the PROJECT_STATUS session-84 handoff; CLAUDE.md taxonomy/grammar
  facts; the locked "Bibliothek classification axes" section in `docs/DECISIONS.md`; the implementation
  plan marked fully shipped). This pass applied the doc-hygiene rotation rule: moved the older
  **session-82 handoff** out of PROJECT_STATUS "Resume here" into
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` (Resume here now holds only the two most
  recent handoffs, 84 + 83; live doc trimmed 386→348 lines), updated the "Older handoffs" note (1–82 /
  69–82 in W28) and the archive index row, and appended this entry. No app code changed.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`,
  `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md` (entry 248). Doc-only; shipped
  via PR → squash-merge → branch realign.
## Entry 249 — 2026-07-09 (session 85)
- **Branch:** `claude/genauly-start-page-preview-1ih2vi`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** a hand-drawn notebook photo titled "Start page" (two variants: a Genauly sidebar +
  Willkommen header + a Spielen/Üben toggle over either a "Neuland" carousel with < > arrows or a
  "Last Session" card + "Fortschritt Verlauf" progress rings).
- **Prompt (verbatim):**
  > can you generate a preview of the start page of genauly app based on the attached drawing?
- **Response summary:** Read the app's real tokens/nav and built a faithful interactive HTML Artifact of
  the start page (sidebar + top row + Spielen/Üben toggle: Spielen → Neuland chapter carousel, Üben →
  last-session + Fortschritt rings), light/dark aware, on brand indigo.
- **Prompt (verbatim):**
  > I like it, try to make the spielen part a bit more minimalistic. Also, switch the positions of
  > spielen and uben. Uben should be first and oopened by default.
- **Response summary:** Reordered the toggle (Üben first + default) and stripped the Spielen card to a
  minimal indigo panel (dropped the pixel-scene band, Beta chip, redundant caption); redeployed the same
  Artifact URL.
- **Prompt (verbatim):**
  > I see the left side vertical bar is gone and is on the top now but you can keep the left side bar and
  > the existing elements on the top row intact. Only change the contents within the Heute page. I like
  > the proposed design. Implement it with a robust plan.
- **Response summary:** Implemented the design in-app, scoped to the Dashboard body. New Üben/Spielen
  toggle; Üben reuses `/session` + a store-only four-ring Fortschritt row; Spielen is a new lazy
  `NeulandCarousel` deep-linking into `/welt?mission=<id>`; `Welt.tsx` gained `?mission=` auto-open.
  Kept the sidebar + greeting row. Verified both tabs in Chromium (no page errors); all gates green.
  Via AskUserQuestion the founder confirmed removing the city strip + Situationen chips and merging to
  production.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/dashboard/NeulandCarousel.tsx`
  (new), `src/features/welt/Welt.tsx` (commit d7e9bb8); updated `CLAUDE.md`, `docs/PROJECT_STATUS.md`;
  `docs/SESSION_PROMPT_LOG.md` (entry 249). PR into `main` (squash) + branch realignment.

## Entry 250 — 2026-07-09 (session 85)
- **Branch:** `claude/genauly-start-page-preview-1ih2vi`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > move the sichere deine fortschritt to bottom left corner of the navigation panel on the leftm remove
  > the bereit for prufung part. Also, remove the greeting with little progress graphic. Include that in
  > the top row. Keep the spielen/uben toggle centred.
- **Response summary:** Layout pass on the shell + Heute body. `SaveProgressBanner` gained a compact
  `variant="sidebar"` and now sits at the bottom-left of the desktop `Sidebar` (mobile keeps the
  Heute-top banner via `lg:hidden`); the sidebar's "Bereit für die Prüfung?" card was removed; the
  greeting + the little conic streak/goal ring moved out of the Heute body into the global `AppShell`
  header (greeting left, ring right, replacing the old "Willkommen zurück" text + flat streak pill); the
  Üben/Spielen toggle is centred (`mx-auto flex w-fit`). Verified in Chromium (no page errors); build +
  lint (0 errors) green. Shipped via PR → squash-merge → branch realign.
- **Artifacts:** `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`,
  `src/features/auth/SaveProgressBanner.tsx`, `src/features/dashboard/Dashboard.tsx`;
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 250).

## Entry 251 — 2026-07-09 (session 85)
- **Branch:** `claude/genauly-start-page-preview-1ih2vi`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** a live mobile screenshot of Heute showing the 4 identical rings + the stacked header icon.
- **Prompt (verbatim):**
  > all the icons are similar with a round metered like graph. also, the icon in the top row has the fire
  > emoji on top of the number which is weird - they should be beside each other horizontally. Generate a
  > couple of previews on how would you improve this page when it comes to design and ux
- **Response summary:** Built a comparison Artifact with two directions (A: each tile a distinct form;
  B: one Tagesziel hero bar + week heatmap + a calm icon-stat strip), both fixing the stacked header icon
  (horizontal flame+number chip).
- **Prompt (verbatim):**
  > i like option b. remove the icon tray in fortschritt page
- **Response summary:** Implemented Option B in the app minus the icon-stat tray. `Dashboard.tsx`: the
  four `StatRing`s are replaced by a single Tagesziel **hero bar** (gradient) + a **7-day activity
  heatmap** (shaded by daily XP vs goal, today ringed, weekday initials), from the progress store only.
  `AppShell.tsx`: the header streak becomes a **horizontal chip** (flame + number + "Tage", goal ring
  around the flame). Verified desktop + mobile in Chromium (no page errors); build + lint (0 errors) green.
  Shipped via PR → squash-merge → realign.
- **Artifacts:** comparison Artifact (`scratchpad/heute-redesign-options.html`);
  `src/features/dashboard/Dashboard.tsx`, `src/components/layout/AppShell.tsx`; `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 251).

## Entry 252 — 2026-07-09 (session 85)
- **Branch:** `claude/genauly-start-page-preview-1ih2vi`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > when I said remove icon tray in fortschritt.. I didn't mean to remove something from the fortschritt
  > section of heute page in option b preview. I meant to remove the icon tray on the top in the dedicated
  > fortschritt page.
- **Response summary:** Corrected the prior misread. (1) Restored the full Option B on Heute: re-added the
  3 icon-stat row (Serie/Wörter/Fällig) below the Tagesziel hero bar + heatmap in `Dashboard.tsx`.
  (2) On the dedicated Fortschritt page (`/analytics`), removed the `CityStrip` icon tray (the row of six
  domain-building icons) from the top, confirmed by screenshot as the element meant; `CityStrip` import
  dropped from `Analytics.tsx` (component kept in the repo). Verified Heute + Fortschritt in Chromium (no
  page errors); build + lint (0 errors) green. Shipped via PR → squash-merge → realign.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/analytics/Analytics.tsx`;
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 252).

## Entry 253 — 2026-07-09 (session 85)
- **Branch:** `claude/genauly-start-page-preview-1ih2vi`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > okay, document the session
- **Response summary:** Session-documentation pass. Most docs were already written incrementally through
  the session (PROJECT_STATUS session-85 handoff; prompt-log entries 249–252; the CLAUDE.md bundle note).
  This pass reconciled the handoff's first Dashboard bullet to the final state (greeting moved to the top
  row; Fortschritt became the Option B hero-bar layout, not four rings) and appended this entry. Doc-only;
  shipped via PR → squash-merge → branch realign.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 253).

## Entry 254 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the Heute/Dashboard (mobile, dark).
- **Prompt (verbatim):**
  > spin up a panel of experts to brainstorm how to improve this page for a beat quality user experience
  > which looks like a product by a billion dollar technology giant and is highly polished. try to also see
  > if any of the top row icons could be removed like search icon and alltag and beruf button.
- **Response summary:** Traced the page (`AppShell` header + `Dashboard.tsx` + `ModeSwitcher`/`ThemeToggle`/
  `AccountMenu`). Delivered a six-lens expert critique (product, visual, interaction, growth, a11y, perf)
  grounded in code: identified the 6-control header, triplicated numbers (streak/due/goal), truncated stat
  labels, and the invisible mobile CTA (`hidden sm:inline-flex`). Gave an icon-removal verdict table (remove
  Search + Theme + Mode from header; keep streak/account) and a ranked build list. Asked the founder to lock
  the icon decisions + scope via `AskUserQuestion`.
- **Founder answers (via tool):** remove Search; move Theme → Account menu; drop "Genauly" wordmark; remove
  the Beruf/Alltag/Beides icon from the page and do NOT add it to the account dropdown; scope = "just the
  brainstorm for now".
- **Artifacts:** none committed (analysis + decisions only).

## Entry 255 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** image of the typed request.
- **Prompt (verbatim):**
  > provide a set of recommendations based on the brainstorming session and provide 3 mockups in a html by
  > implementing those recommendations.
- **Response summary:** Pulled the app's real dark tokens and built a published HTML Artifact: a
  recommendations card set + three phone mockups of the redesigned Heute (Fokus / Momentum / Ruhe), all
  sharing the cleaned 3-control header, deduped numbers, full-width CTA, and no truncated labels. Rendered
  in the app palette; theme-aware shell.
- **Artifacts:** Artifact `heute-mockups.html` (scratchpad; published).

## Entry 256 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none (plus an interrupt message, logged inline).
- **Prompt (verbatim):**
  > I like option 2 with a few things to consider:
  > 1. Reduce the circle size proportionally a little bit
  > 2. No need of changing any bottom icons and replace the more icon with settings and no need of extra more
  > menu. you can keep the option to reorder the middle icons as an easter egg. keep the home and settings
  > icon in fixed position m
  > 3. see if you can reduce some text compared to what's shown in preview by 10-15%.
  > prepare a solid and thorough plan to implement this.
  > [interrupt] also keep the uben/spielen toggle from option a
- **Response summary:** Read the bottom-bar machinery (`BottomTabBar`, `nav-items`, `MoreSheet`,
  `route-icons`, `Sidebar`, store, tests) to size the change. Key finding: `navItems` has only 5 routes with
  Settings the sole unpinned one, so the More sheet exists essentially to hold Settings → replacing Mehr with
  a Settings tab orphans nothing (desktop Sidebar keeps Settings + search). Delivered a thorough phased plan
  (header slim-down; bar Settings-replaces-Mehr + reorder-only easter egg; Dashboard Option B; verify + docs)
  with risks and open questions.
- **Artifacts:** plan (chat); no code yet.

## Entry 257 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the founder's answers to the plan's three questions.
- **Prompt (verbatim, from the answer screenshot):**
  > Modus → In Einstellungen. Mobile search → No, just remove it. Proceed → Refresh mockup first.
- **Response summary:** Refreshed the published Artifact to the final Option B (single phone + changelog):
  smaller 128px ring, kept Üben/Spielen toggle, ~12% less copy, header = logo/streak/account, bottom bar
  Mehr→Einstellungen. Held for sign-off per the "refresh mockup first" choice.
- **Artifacts:** Artifact `heute-mockups.html` (updated in place).

## Entry 258 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > looks good. no need of x fälling beside the time. Just keep the number of minutes. no need of approx.
  > character. also, no need of green dot on account settings icon.
- **Response summary:** Implemented the redesign with the two tweaks baked in. **Header** (`AppShell.tsx`):
  removed Search + `ThemeToggle` + `ModeSwitcher` + the mobile wordmark; simplified the streak pill (flame +
  day count, no goal gauge). **`AccountMenu.tsx`:** removed the green sync dot; added a Hell/System/Dunkel
  theme row. **`BottomTabBar.tsx`:** rewrote so Einstellungen replaces Mehr as the fixed last slot, the More
  sheet is gone, the three content sections always show and reorder via a long-press easter egg (no +/X, tap
  anywhere to finish); Home + Einstellungen fixed. **`AppShell`** stopped rendering `MoreSheet`. **Deleted**
  `MoreSheet.tsx`, `ThemeToggle.tsx`, `ModeSwitcher.tsx`. **`Settings.tsx`:** added the Lernmodus selector to
  the Lernen card, removed the obsolete "Navigation anpassen" card. **`Dashboard.tsx`:** Option B (goal-ring
  hero + 7-day heatmap + full-width "Weitermachen" button with a minutes-only subtitle + one slim "Wörter
  gelernt · Alle Statistiken" line); dropped the duplicated streak/goal/due tiles. Gates green: typecheck,
  lint (0 errors), test:unit (97), build, check:bundle (74.9 kB, budget 400).
- **Artifacts:** `src/components/layout/AppShell.tsx`, `src/components/layout/BottomTabBar.tsx`,
  `src/features/auth/AccountMenu.tsx`, `src/features/settings/Settings.tsx`,
  `src/features/dashboard/Dashboard.tsx`; deleted `MoreSheet.tsx`/`ThemeToggle.tsx`/`ModeSwitcher.tsx`;
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/DECISIONS.md`, `docs/SESSION_PROMPT_LOG.md` (entries 254–258).

## Entry 259 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the Option-B goal-ring on Heute.
- **Prompt (verbatim):**
  > i want you to move this to Fortschritt section and reimagine this section. I think the top row and the
  > bottom row just above the navigation menu already talks about the progress. There's too much emphasis on
  > progress here again. I want this section to show a graph or roadmap of the uben exercises. It's even
  > better if these exercises are directly in sync with the Neuland game. This way the learner has a good
  > orientation of where they are, and what's next with a high-level overview. Generate a preview considering
  > this. [then] generate 3 previews
- **Response summary:** Built a published Artifact with three Üben-tab concepts (all move the goal ring to
  Fortschritt): **A Lernpfad** (winding Duolingo path), **B Kapitel-Roadmap** (Als-Nächstes hero + chapter
  cards), **C Neuland-Karte** (stylized game map). Used the real Kapitel-1 mission structure.
- **Artifacts:** Artifact `uben-roadmap.html`.

## Entry 260 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i prefer concept c layout. But with following details: 1. The map should show bird's eye view of the
  > Neuland city map with a roadmap showing various stop points from hbf to home to amt, etc. Use the
  > pixelated 2D theme within this map layout. 2. For the bottom tile, use the concept b's first tile - but
  > remove the line "Übt mit mission 1.2..." and swap the positions of Kapital eins and the green text saying
  > "current level". provide a preview now
- **Response summary:** Refined Concept C into a single phone: a canvas-drawn pixel city map (buildings,
  road, route, stops) upscaled crisp, plus the revised hero tile (subtitle removed, Kapitel left, green
  status right). Republished to the same Artifact URL.
- **Artifacts:** Artifact `uben-roadmap-c.html`.

## Entry 261 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the rendered pixel map.
- **Prompt (verbatim):**
  > here's the screenshot. there are several things wrong with this design.
  > [answers] fix all: art quality/composition, fog + weak current stop, no clear route, labels cover art;
  > "it should be a proper city map with grid blocks and several other buildings around the focus buildings";
  > art direction: "you decide".
- **Response summary:** Named the concrete flaws, then rebuilt the map: a real street grid with blocks +
  many background buildings, a park and pond, one clear glowing route, numbered stop-pins with the names in
  a legend BELOW the map (off the art), a bold teardrop "Du bist hier" pin, and soft feathered fog. Kept the
  pixel top-down treatment. Republished to the same URL.
- **Artifacts:** Artifact `uben-roadmap-c.html` (rebuilt).

## Entry 262 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > looks good. the location tags below the map should be centered. also, I don't understand why the fog is
  > necessary - better to remove it abd show the upcoming route with a dotted line. continue to scope the
  > work and implement the task
- **Response summary:** Applied the two tweaks to the preview (centered legend, fog removed, upcoming route
  dotted), then **implemented in the app**. New lazy `features/dashboard/UebenPath.tsx` ports the canvas
  city map bound to real Kapitel-1 missions (`missions.ts`), state from `missionsDone`, centered legend,
  "Du bist hier" pin, and the "Als Nächstes" tile (→ `/welt?mission=<id>`). `Dashboard.tsx` slimmed to the
  toggle + two lazy tabs; the daily-goal ring moved to `Analytics.tsx` (Fortschritt). Gates green:
  typecheck, lint (0 errors), test:unit (97), build, check:bundle (71.6 kB). Docs updated (CLAUDE.md,
  PROJECT_STATUS, DECISIONS, this log). Shipped to the branch.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx` (new), `src/features/dashboard/Dashboard.tsx`,
  `src/features/analytics/Analytics.tsx`; `docs/*`; Artifact `uben-roadmap-c.html`.

## Entry 263 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** two live screenshots of the shipped Üben tab (map + account menu).
- **Prompt (verbatim):**
  > keeping the high standards and expectations in mind, make this more polished the current version here
  > looks somewhat unfinished and cheap. take note of all the elements and make sure everything is of
  > exceptional quality [then, after a first map-only pass:] You're overdoing it. when I said notice every
  > small detail in the screen.. I meant to check all elements of the page and not the 2D map - for example
  > the green check and lock need not be on the map, they're already on the legend. Make sure the basics are
  > right in the map and things are legible and keep it simple - that's one of the main ideas of the 2D map.
  > However be thorough for other items and components of the page like size and shape of the tiles, spacing
  > between components, legend's size, etc. [then:] the page outside the 2D map should be top class billion
  > dollar app
- **Response summary:** Set up headless-Chromium screenshots (`/opt/pw-browsers`) to iterate on the real
  render instead of guessing. **Map simplified** per direction: removed the on-map flags/lock seals (state
  is in the legend), kept it to city + route + "Du bist hier" figure. **Fixed a real layout bug** (Bahnhof
  was stacked under Laden, so the current-stop banner always collided) by re-laying the stops as a tour
  (BL→BR→TR→TC) and gluing the banner a fixed gap above the figure with a tail. **Page chrome upgraded to
  a premium bar:** replaced the pill legend with a proper **stepper** (connected dots, done/current/locked),
  refined tile (green "Aktuelles Level" tag, no subtitle, larger button), consistent spacing, and made the
  **map taller** so the hero fills the screen and kills the dead space. Verified the composition + both the
  mid and fresh-user states via screenshots before porting. Gates green (typecheck, lint 0 errors,
  test:unit 97, build, bundle 71.6 kB).
- **Artifacts:** `src/features/dashboard/UebenPath.tsx` (rewritten); `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 263).

## Entry 264 — 2026-07-10 (session 86)
- **Branch:** `claude/page-polish-icon-review-dbmp0v`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session along with saving the preview htmls in the repo.
- **Response summary:** Documentation pass. Most docs were written incrementally through the session
  (PROJECT_STATUS session-86 handoff, prompt-log entries 254–263, the CLAUDE.md locked mobile-bar + Üben-map
  notes, the DECISIONS entries). This pass **saved the reviewed design previews into the repo** under
  `preview/heute-redesign/` (`heute-option-b.html`, `uben-concepts.html`, `neuland-map-concept-c.html`,
  `uben-tab-final.html`, + a `README.md` index; artifact fragments wrapped into standalone docs, the final
  page copied as-is), noted their location in the handoff, and appended this entry. Doc/asset-only; shipped
  via PR → squash-merge → branch realign.
- **Artifacts:** `preview/heute-redesign/*` (5 files); `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 264).

## Entry 265 — 2026-07-10 (session 87)
- **Branch:** `claude/game-tile-removal-nav-hi37z5`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** one screenshot of the `/welt` Kapitel 1 · Ankommen mission list.
- **Prompt (verbatim):**
  > [screenshot] this screen should open under spielen in heute page. get rid of the game tile in Anwenden
  > screen
- **Response summary:** Made Heute → **Spielen** render the full Neuland world hub (the same chapter +
  mission list as `/welt`, matching the screenshot) instead of the minimal mission carousel, and **removed
  the "Neuland" game tile from the Anwenden hub**. Extracted the shared presentational
  `src/features/welt/NeulandHub.tsx` (chapter sections + mission list + Schlüssel-Dokumente, `onPlay`
  callback); `Welt.tsx` uses it with the inline full-screen `MissionPlayer`; new lazy
  `src/features/dashboard/SpielenHub.tsx` uses it with `onPlay = navigate('/welt?mission=<id>')` so play
  still happens on `/welt` (focus mode + full-screen player intact, no z-index/chrome regression).
  `NeulandCarousel.tsx` deleted. `AnwendenHub.tsx` lost the `/welt` card (grid `lg:grid-cols-4`→`3`). Gates
  green: build, typecheck, lint 0 errors, check:bundle 71.7 kB / 400.
- **Artifacts:** `src/features/welt/NeulandHub.tsx` (new), `src/features/dashboard/SpielenHub.tsx` (new),
  `src/features/welt/Welt.tsx`, `src/features/dashboard/Dashboard.tsx`, `src/features/anwenden/AnwendenHub.tsx`,
  `src/features/dashboard/NeulandCarousel.tsx` (deleted); `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/SESSION_PROMPT_LOG.md` (entry 265).

## Entry 266 — 2026-07-10 (session 87)
- **Branch:** `claude/game-tile-removal-nav-hi37z5`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > when pressing continue button on üben page, the user enters the game directly. that's not the purpose of
  > it. The user should be able to practice everything related to that particular mission but not enter the
  > game. It should be just an üben session but with the content corresponding to the particular mission in
  > the game.
- **Response summary:** The Üben tab's "Als Nächstes" tile button navigated to `/welt?mission=<id>`, entering
  the game. Changed it to start a **composed practice session scoped to the mission's theme**:
  `navigate('/session?theme=<nextMission.themeId>')`, reusing the existing session composer's `scope` (which
  biases the vocab/quiz/reading pools to that theme). Relabelled the button **"Üben"**. Game entry stays under
  Heute → Spielen and `/welt`. One-line behavior change in `UebenPath.tsx`; build + typecheck green.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 266).

## Entry 267 — 2026-07-10 (session 87)
- **Branch:** `claude/game-tile-removal-nav-hi37z5`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** two dark-mode screenshots (Spielen mission list + Üben pixel city map).
- **Prompt (verbatim):**
  > [two screenshots] is it possible to adjust the maps and tiles to dark mode?
  > [mid-turn] also adapt the tiles design of spielen section based on tile from Üben
- **Response summary:** Yes. Asked one scoping question (touches the locked "game is light-theme-only"
  decision); founder chose **Map + Heute tiles** (leave in-mission scenes light). Implemented:
  (1) **Üben map** `drawCity` now takes `isDark` and switches `DARK_PAL`/`LIGHT_PAL` (deep muted
  grass/roads/buildings; glowing route + landmarks stay vivid), theme read via a new reactive
  `useIsDark()` hook in `lib/useTheme.ts`. (2) **Spielen tiles** re-styled from the pixel `GameCard` to the
  **same app-tile language as the Üben "Als Nächstes" tile** (`bg-surface`/`border-border` + shared soft
  shadow, gradient play button, theme-aware Boss/Beta badges), so they go dark for free and match Üben.
  `PixelStage` gained an opt-in `themed` prop (hub only) that dims the bright backdrop art in dark mode;
  in-mission scenes keep the fixed-light atoms. Verified light + dark on both tabs via headless Chromium.
  Gates green: build, typecheck, lint 0 errors, bundle 71.7 kB.
- **Artifacts:** `src/features/welt/NeulandHub.tsx`, `src/features/welt/stage.tsx`,
  `src/features/dashboard/UebenPath.tsx`, `src/lib/useTheme.ts`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 267).

## Entry 268 — 2026-07-10 (session 87)
- **Branch:** `claude/game-tile-removal-nav-hi37z5`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > for spielen part: 1. Kapital 1. Ankommen should be below the image with a smaller text 2. Neuland should
  > be the heading. 3. the inage has too little contrast and is not easily visible in the dark mode. 4. remove
  > subtitles in spielen tiles and position the green tick appropriately. for the üben part: 1. move the
  > milestone icons above the image 2. increase the height of the bottom tile by 10-15% so that it doesn't
  > look cramped. 3. Crop the size of the map to match the dimensions of the image in Spielen. 4. Adjust the
  > spacing between the components - legend , map and tile in appropriately.
- **Response summary:** A layout-polish round on both Heute tabs. **Spielen** (`NeulandHub.tsx`): made
  "Neuland" the section heading, moved "Kapitel 1 · Ankommen" below the backdrop as a smaller line, reduced
  the dark-mode backdrop dim (`/45`→`/20`) and added a border so the image is clearly visible, removed the
  mission-tile subtitles, and moved the green done-tick into a `bg-success/15` badge to the left of the play
  button. **Üben** (`UebenPath.tsx`): moved the stepper above the map, made the "Als Nächstes" tile taller
  (`p-[18px]`→`px-5 py-6` + bigger inner margins), cropped the map canvas to a **3:2 view**
  (`VIEW_H=117`/`CROP_TOP=24` + a row-skip guard so neither end slivers) to match the Spielen backdrop
  dimensions, and bumped the inter-component spacing. Verified light + dark on both tabs via headless
  Chromium. Gates green: build, typecheck, lint 0 errors, bundle 71.7 kB.
- **Artifacts:** `src/features/welt/NeulandHub.tsx`, `src/features/welt/stage.tsx`,
  `src/features/dashboard/UebenPath.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 268).

## Entry 269 — 2026-07-10 (session 87)
- **Branch:** `claude/game-tile-removal-nav-hi37z5`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > when i open the session under üben in heute menu, the practice words and drills are all unrelated items
  > to the words used in the game. remember the rule - the practice item (e.g. 1.5) in üben should have items
  > related to the corresponding mission in spielen (e.g. 1.5)
- **Response summary:** The earlier pass only scoped the Üben session to the mission's *theme*, so the
  words/drills weren't the mission's actual game content. Added `missionContentIds(mission)` to
  `engine/mission.ts` (extracts the exact vocab + Redemittel ids a mission's scenes reference: loadout
  slots, battle moves, item demands, hotspots, automat keys), and a `focus` opt to `buildSession`: those
  items are practised **first, regardless of SRS due state**, the untethered grammar drill is **dropped**,
  and the rest fills from the mission's theme (quiz/due vocab/reading). `Session.tsx` now resolves
  `?mission=<id>` → focus + theme scope; `SessionPlayer` threads it through; the Üben button links to
  `/session?mission=<id>`. Verified in the app: `/session?mission=m_kap1_dach` leads with
  "die Wohnungsgeberbestätigung" (the word that mission turns on). Gates green: build, typecheck, lint 0
  errors, test:unit 99 (2 new cases), bundle 71.7 kB.
- **Artifacts:** `src/engine/mission.ts`, `src/engine/session.ts`, `src/features/session/Session.tsx`,
  `src/features/session/SessionPlayer.tsx`, `src/features/dashboard/UebenPath.tsx`, `tests/engine.test.ts`;
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 269).

## Entry 270 — 2026-07-10 (session 87)
- **Branch:** `claude/game-tile-removal-nav-hi37z5`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Documentation pass. Most docs were written incrementally through the session
  (PROJECT_STATUS s87 handoff, prompt-log entries 265–269, the CLAUDE.md game-art hub-theming + mobile-bar
  Spielen/Üben-tile/stepper/3:2/mission-focus lines). This pass verified consistency, corrected the s87
  handoff "Ship status" to reflect the **4 squash-merged PRs** (#396–#399, all live on `main`, branch
  realigned after each), refreshed the doc-artifact list, and appended this entry. Doc-only.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 270).

## Entry 271 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 3 iPhone screenshots (Heute Üben with sync banner, Üben banner dismissed, account dropdown open)
- **Prompt (verbatim):**
  > this is the first page any user would see and it's extremely important that this looks as polished as
  > possible with highest standards. Imagine if you're a senior expert in front end design and ux ui who
  > works for billion dollar companies that has modern designs with exceptional ui. what are the top 5-10
  > changes you'd recommend based on the screenshots? spin up a panel og subagents if necessary and provide
  > a detailed analysis and recommendations.
- **Response summary:** Ran a 4-agent review panel (visual craft, UX/IA, detail polish, later Spielen), each
  reading the screenshots and verifying findings against the code. Synthesized a ranked top-10: sync-state
  contradiction (menu "Synchronisiert" vs banner, `useAuthStore` signedOut fallback), banner size/fold cost,
  one-loud-accent violations (two gradient recipes, triple "Üben"), map route contradicting "Du bist hier",
  stepper glyph mix (emoji lock) + 1px connector misalignment, dead Spielen hero + duplicate-H1 trap,
  identical "Nochmal" pills, token drift (shadows/radii/status colors), uninformative "Aktuelles Level",
  amber Beta badge on the reward-gold hue. Plus a quick-win list (dropdown alignment/overflow, logo →
  /welcome, Suspense fallback, bottom-bar icon twins).
- **Artifacts:** analysis only (no code changes).

## Entry 272 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 iPhone screenshot (Heute Spielen tab)
- **Prompt (verbatim):**
  > in addition also analyse the spielen screen
- **Response summary:** Added a fourth reviewer for the Spielen hub. Key findings: three identical loud
  "Nochmal" gradient pills spend the brand accent on replays while the next mission is below the fold; the
  hero carries one word of information (dead hero); the header + hero render INSIDE the chapter loop
  (duplicate H1 the moment Kapitel 2 is authored); no current-state in the mission list; amber Beta badge
  off-token and reward-gold-adjacent; mission titles wrap mid-compound against the fixed button column;
  microcopy-budget-violating footer sentence.
- **Artifacts:** analysis only.

## Entry 273 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > taking the above analysis and recommendations into consideration, provide me with 3 mockups for each of
  > the heute screen - üben and spielen. also include 2 mock ups of the account settings drop-down. provide
  > them as a html artifact
- **Response summary:** Built an HTML Artifact with 8 phone mockups on the app's real tokens: Üben U1
  (card-first), U2 (current order, craft fixed), U3 (composed single card); Spielen S1 (hero with overlay
  CTA), S2 (full path list), S3 (chapter card + checklist); dropdown D1 (current menu corrected), D2 (guest
  state with honest sync story). Each captioned with the findings it applies.
- **Artifacts:** session Artifact `genauly-heute-mockups.html` (claude.ai/code artifact).

## Entry 274 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the html looks broken ans there are several mistakes in it. I also don't like the 2D pixelated maps -
  > reimagine how the city should also look like and instead of the character being there on the map, a 📍
  > could also be an option?
- **Response summary:** Fixed two real rendering bugs (dropdown overlays had no `position: relative` anchor;
  fixed phone heights let content overflow) and the internal mission-state inconsistencies. Reimagined the
  map as a soft illustrated city (rounded streets, landmark tiles, smooth route, location pin; U3 shows the
  📍 emoji option). Verified headlessly before republishing.
- **Artifacts:** updated Artifact.

## Entry 275 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I want the html to also have a couple of reimagined 2D pixelated map
- **Response summary:** Added a "Karten-Stile" section comparing three map directions: M1 soft illustrated,
  M2 refined pixel city (muted brand-tuned palette, outlined buildings, pixel pin), M3 pixel path (winding
  stone tour through green, Duolingo-journey feel).
- **Artifacts:** updated Artifact.

## Entry 276 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > For üben, I like the U2 but it's fine to remove the green horizontal milestone part - also currently on
  > the map, some buildings are in the street fix it and add the white round dot (which is on the map for
  > only one completed milestone in the U2) for all the completed milestones. for the Spielen, I like the
  > picture part of S1 and the bottom half tile from S3 - make sure to also add a repeat icon beside the
  > green ticks. Also keep the Neuland beta in the center.
- **Response summary:** Rebuilt the Artifact around a "Finale Richtung" section: Üben = U2 without the
  stepper (map re-laid so no building touches a street, white dots on every completed stop, pin current);
  Spielen = S1 hero over S3 checklist with a replay icon beside every green check and "Neuland Beta"
  centered. Map styles + dropdown sections kept for reference.
- **Artifacts:** updated Artifact (final direction).

## Entry 277 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead and implement it
- **Response summary:** Implemented the final direction in the app. `UebenPath.tsx` rewritten: stepper
  retired, pixel canvas → soft illustrated SVG map (landmark tiles inside blocks, route solid to the pin +
  dotted onward, white done-dots, location pin + "Du bist hier" chip, `MAP_LIGHT`/`MAP_DARK`), mission tile
  with real n/6 badge + "Jetzt üben" token-gradient CTA + "Wiederholen · N fällig" ghost button.
  `NeulandHub.tsx` rewritten: centered header outside the chapter loop (neutral Beta chip), hero scrim
  overlay with "Mission spielen" CTA, dense checklist (done = check + replay, next = single gradient play,
  locked Kapitel-2 teaser). `AccountMenu.tsx` alignment/overflow/danger-weight polish; `Dashboard.tsx`
  fallback reshaped. Gates green (build, lint 0 errors, test:unit 99, bundle 71.9 kB); verified light/dark/
  dropdown via headless Chromium. Shipped as PR #401 (squash-merged), docs updated.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx`, `src/features/welt/NeulandHub.tsx`,
  `src/features/auth/AccountMenu.tsx`, `src/features/dashboard/Dashboard.tsx`; `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entries 271–277); PR #401.

## Entry 278 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > add a title to uben page and add a left and right navigation to different uben modules on the bottom of
  > the screen. Finally, make sure to keep the same dimensions for map in üben and photo tile of spielen and
  > keep them in same position on the screen
- **Response summary:** Üben follow-up round (`UebenPath.tsx`): added a centered **"Lernpfad"** title
  mirroring the Spielen "Neuland" header row; made the map a **native 3:2 block** (viewBox 360×240, content
  group shifted +5y, mat padding dropped) so it has the same dimensions and screen position as the Spielen
  chapter hero (toggle → title → media, identical gaps); and added a **left/right module pager** at the
  bottom (chevron buttons + per-mission dots: active = primary pill, done = success tint) that flips the
  practice card through every Kapitel-1 mission. The card shows the selected module's number plus an
  Als-Nächstes/Erledigt state chip and its CTA opens `/session?mission=<selected>`; the map pin stays
  truthful to actual progress (paging never moves it). Verified via Playwright (pager click-through to 1.3
  showing "Erledigt", dot states, tab position comparison); gates green (build, lint 0 errors, test:unit 99,
  bundle 71.9 kB). Shipped as PR #402.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 278); PR #402.

## Entry 279 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i like the white padding around the map in previous version. bring it back and apply the same to spielen
  > tile as well. Can you make sure to adjust the spacing of components and bottom tile such that the user
  > doesn't have to scroll? also for mobile there's no need of left and right arrows. the bottom dots are
  > enough. if vertical space is contrained and difficult to keep it without scrolling, considering keeping
  > the dots vertically to the side and the user can scroll up and down on the bottom tile to navigate the
  > exercises.
- **Response summary:** Brought the `bg-surface p-2` mat back around the Üben map and applied the identical
  mat to the Spielen chapter hero (dimensions/positions stay matched). Tightened vertical rhythm so the
  whole Üben tab fits a phone viewport with no scrolling (verified scrollHeight == viewport at 390×844:
  root `space-y-3`, card `py-4` + compact CTA paddings, Dashboard wrapper `space-y-4`; NeulandHub matched).
  The pager's chevrons are now desktop-only (`hidden sm:grid`); on mobile the dots (32px tap targets) plus a
  new horizontal swipe gesture on the practice card navigate modules, so the side-dots fallback wasn't
  needed. Also fixed "Bahnhofsviertel" truncating in the hero overlay after the mat narrowed it. Verified
  via Playwright (fit measurement, swipe 1.5→1.6, both tabs light). Gates green; shipped as PR #403.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx`, `src/features/welt/NeulandHub.tsx`,
  `src/features/dashboard/Dashboard.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 279); PR #403.

## Entry 280 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > okay, I think they both should be the same buttons. There's no need of a separate 5 min revision module
  > if the actual practice session also lasts roughly the same time. for the completed exercise the button
  > should show wiederholen and for the new one, jetzt üben. make sure to add an appropriate sliding
  > animation to show the transition.
- **Response summary:** Merged the practice card's two buttons into ONE state-aware CTA on the token
  gradient: "Jetzt üben" (ArrowRight) for a new module, "Wiederholen" (RotateCcw) for a completed one, both
  opening the same mission-focused session (`/session?mission=<selected>`). Removed the card's separate
  "Wiederholen · N fällig" → `/revision` entry (the `/revision` route itself stays, reachable from
  Fortschritt). The module block (number, state chip, title, CTA) now slides in horizontally on pager/swipe
  change (framer-motion, direction-aware from navigation direction, disabled under `useReducedMotion`).
  Verified via Playwright: swipe to 1.6 shows the gradient "Wiederholen" CTA, page still fits the viewport
  with no scrolling; gates green (build, lint 0 errors, test:unit 99, bundle 71.9 kB). Shipped as PR #404.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 280); PR #404.

## Entry 281 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the wiederholen button can stay gray. also the erledigt green badge should appear on the same line as
  > the title of the card to the right.
- **Response summary:** Two small tweaks to the Üben practice card (`UebenPath.tsx`): the completed-module
  CTA "Wiederholen" now renders on plain `bg-muted` grey (no gradient/glow, muted icon) while "Jetzt üben"
  keeps the token gradient; and the "Erledigt" green badge moved out of the meta row onto the **title line,
  right-aligned** (title + badge in a `flex items-start justify-between`). Verified via Playwright (module
  1.6 shows the grey Wiederholen button + Erledigt badge beside "Die Anmeldung"; page still fits the
  viewport). Gates green (build, lint 0 errors). Shipped as PR #405.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx`; `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`
  (entry 281); PR #405.

## Entry 282 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > distribute all the components in the page with proper spacing vertically.
- **Response summary:** The four Üben blocks (title, map, card, pager) were clustering in the top ~65% with
  dead space above the nav bar. Changed the UebenPath root from `space-y-3` to
  `flex min-h-[calc(100dvh-15rem)] flex-col justify-between gap-3`, so the blocks distribute evenly down the
  available height. Measured in-browser: content now fills 151→755px (was 151→681) with even ~37px gaps, and
  scrollHeight still == viewport (844) so it never scrolls; `gap-3` is a floor so items never touch on short
  screens. Gates green (build, lint 0 errors). Shipped as PR #406.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx`; `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`
  (entry 282); PR #406.

## Entry 283 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you also crop the tile below the spielen photo and make it such that we can scroll up and down within
  > the cropped tile to see the missions. try to keep the contents below the photo such that the user doesn't
  > have to scroll the page.
- **Response summary:** Added a `compact` prop to `NeulandHub` (passed by `SpielenHub`, NOT by `/welt`):
  the root becomes `flex h-[calc(100dvh-15rem)] flex-col overflow-hidden`, the chapter section a
  `flex-1 min-h-0` column, the header + hero + Kapitel-2 teaser stay fixed (`shrink-0`), and the mission
  checklist card becomes the single `flex-1 min-h-0 overflow-y-auto overscroll-contain` region — so the
  mission tile scrolls internally to reveal all six missions while the whole page never scrolls. `/welt`
  (no `compact`) keeps its normal full-page scroll. Verified via Playwright: page docScroll == viewport
  (no page scroll), mission card scrolls (clientH 226 of scrollH 333), top shows 1.1–1.4, scrolled shows
  1.3–1.6 boss; no page errors. Gates green (build, lint 0 errors). Shipped as PR #407.
- **Artifacts:** `src/features/welt/NeulandHub.tsx`, `src/features/dashboard/SpielenHub.tsx`; `CLAUDE.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 283); PR #407.

## Entry 284 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 screenshot (Heute Spielen, scrollbar annotated)
- **Prompt (verbatim):**
  > get rid of the scroll bar to the right. see the annotation. Also expand the crop of the missions cell a
  > bit more so that two missions would be visible comfortably.
- **Follow-up prompt (verbatim, mid-turn):**
  > get rid of the key documents items in the bottom. it's in the game bag anyway
- **Response summary:** Applied the existing `.no-scrollbar` utility to the compact mission-list scroll
  region (hides the right scrollbar). Removed the "Schlüssel-Dokumente" shelf from `NeulandHub` entirely
  (both the Heute compact view and `/welt`, per the follow-up: it's redundant with the in-mission bag),
  dropping the now-unused `KeyRound`/`Gloss`/`keyItemById` imports. With the shelf gone the compact mission
  list's `flex-1` region grows so ~4 missions show comfortably (was ~1.5 when the shelf ate footer height),
  scroll reveals the rest, and the page still doesn't scroll. Verified via Playwright with the founder's
  state (5/6 done + 4 key items): shelf absent, docScroll == viewport, list clientH 226 of scrollH 345.
  Gates green (build, lint 0 errors). Shipped as PR #408.
- **Artifacts:** `src/features/welt/NeulandHub.tsx`; `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md` (entry 284);
  PR #408.

## Entry 285 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 screenshot (Heute Spielen)
- **Prompt (verbatim):**
  > shorten the height of missions list tile so that exactly three missions lines are visible. also make sure
  > the next mission to be played stays in the center line already scrolled up when the user opens spielen
  > page. keep appropriate spacing between various components of the page
- **Response summary:** Reworked the compact (Heute) mission tile in `NeulandHub`: rows are now a uniform
  fixed height (`ROW_H`=60px), the scroll tile is capped to exactly three rows (`COMPACT_LIST_H`=180), and a
  `useLayoutEffect` sets the tile's `scrollTop` on open so the next unplayed mission sits on the CENTER line
  (`offsetTop - (clientH - rowH)/2`, clamped ≥ 0). Dropped the earlier fill-viewport flex approach for
  normal `space-y-4` flow now that the tile is short (better, even component spacing). Verified via
  Playwright with the founder's state (5/6 done, next=1.5): exactly 3 rows visible (1.4/1.5/1.6), 1.5
  centered and bold with the gradient play button, docScroll == viewport (no page scroll), no errors. Gates
  green (build, lint 0 errors). Shipped as PR #409.
- **Artifacts:** `src/features/welt/NeulandHub.tsx`; `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md` (entry 285);
  PR #409.

## Entry 286 — 2026-07-10 (session 88)
- **Branch:** `claude/landing-page-design-review-ys5jck`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Documentation consistency pass at session end. Most docs were written incrementally
  through the session (PROJECT_STATUS s88 handoff, prompt-log entries 271–285, the CLAUDE.md Heute-surface
  facts). This pass: updated the PROJECT_STATUS s88 handoff "Ship status" to cover all **PRs #401–#409**
  (was stale at #404) with a per-PR one-liner, added handoff bullets for the #405–#409 follow-up rounds
  (grey Wiederholen + Erledigt-on-title, Üben even distribution, Spielen crop-scroll tile, hidden scrollbar
  + shelf removal, exact-3-rows + centering), rewrote the top `_Last updated_` summary to frame the whole
  multi-round session, and appended this entry. Doc-only.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 286).

## Entry 287 — 2026-07-10 (session 89)
- **Branch:** `claude/blog-help-uben-spielen-wtbnq8`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i want the app to have a comprehensive blog/help pages explaining the üben/spielen part of the app. the
  > goal is to have an seo friendly site along with support for users seeking more info.
- **Response summary:** Built a public, login-free help/blog section at `/hilfe` (outside the AppShell, like
  `/about`), bilingual DE/EN, explaining Üben and Spielen. Since SEO was the explicit goal, chose
  **build-time prerendering to static HTML** over runtime-only meta (so Bing/social crawlers, not just
  Google's JS renderer, see full content), matching the project's existing `boot-seo`/JSON-LD/sitemap
  approach. Shipped: one bilingual content bank `src/features/help/content.ts` (a hub + 6 articles in 3
  categories, closed-union content blocks + per-article FAQ + related links); lazy React reader
  (`HelpChrome`/`HelpHub`/`HelpArticle`) wired as public routes in `router.tsx`; and
  `scripts/prerender-help.mjs` (chained into `build`) which loads the bank via Vite `ssrLoadModule` and
  emits `dist/hilfe/<slug>/index.html` per page with unique title/description/canonical + OG/Twitter +
  Article/BreadcrumbList/FAQPage JSON-LD + the full German text in `#root`, plus a regenerated
  `dist/sitemap.xml` (12 URLs). Added "Hilfe" links to the landing + Settings footers. Verified generated
  HTML (per-page meta/JSON-LD correct, root index.html untouched). Gates green: build+prerender (7 pages),
  ESLint 0, lint:content pass, test:unit 99/99, check:bundle 72.6 kB/400. No em dashes in any copy.
- **Artifacts:** `src/features/help/content.ts`, `src/features/help/HelpChrome.tsx`,
  `src/features/help/HelpHub.tsx`, `src/features/help/HelpArticle.tsx`, `scripts/prerender-help.mjs`,
  `src/router.tsx`, `package.json`, `src/features/landing/LandingPage.tsx`,
  `src/features/settings/Settings.tsx`; `docs/PROJECT_STATUS.md` (s89 handoff + s87 archived to W28),
  `docs/SESSION_PROMPT_LOG.md` (entry 287).

## Entry 288 — 2026-07-10 (session 89)
- **Branch:** `claude/blog-help-uben-spielen-wtbnq8`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > is it live?
- **Response summary:** Clarified that the work was only pushed to the feature branch, so it was NOT live:
  Genauly deploys only on merge to `main` (the Pages workflow). Offered to open a PR into `main` and
  squash-merge to deploy. No code change.
- **Artifacts:** none.

## Entry 289 — 2026-07-10 (session 89)
- **Branch:** `claude/blog-help-uben-spielen-wtbnq8`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes
- **Response summary:** Shipped the help section. Checked for a PR template (none found), created **PR #411**
  into `main`, and **squash-merged** it (`4319758`). Ran the required post-merge realignment: fetched
  `origin/main`, `git reset --hard origin/main`, force-with-lease pushed the dev branch (now level with
  `main`, clean). The Pages deploy runs `pnpm build` (incl. the new prerender) automatically, so the static
  `/hilfe` pages + `sitemap.xml` publish on deploy. Founder verifies the live site (sandbox can't reach the
  live host/Actions tab).
- **Artifacts:** PR #411 (squash-merge `4319758`); branch realigned to `origin/main`.

## Entry 290 — 2026-07-10 (session 89)
- **Branch:** `claude/blog-help-uben-spielen-wtbnq8`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Session-end documentation pass. Most docs were written incrementally (PROJECT_STATUS
  s89 handoff, entry 287, CLAUDE.md build/layout notes, s87 archived to W28). This pass updated the
  now-stale ship status: the s89 handoff header + "Ship status" bullet now record PR #411 squash-merged to
  `main` and the branch realignment (was "not yet merged"), and appended prompt-log entries 288–290. Doc-only.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entries 288–290).

## Entry 291 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > make sure to keep the map/photo tile in üben/spielen same dimensions and fix them both in same position on the screen. Also add a subtle color theme for the toggle buttons and the border padding

  (then, after an interrupt:)
  > continue
- **Response summary:** The tiles were already the same size (both 3:2 in a `p-2` surface mat, both inside
  Dashboard's `mx-auto max-w-md`) but sat at different vertical positions: `UebenPath` used `justify-between`
  (pushing the map down) while the compact `NeulandHub` was top-aligned. Pinned Üben's header + map to the
  top with a fixed `gap-4` and pushed the pager to the bottom with `mt-auto` (keeps the no-scroll fit).
  Measured parity in a headless browser (390×844): both tiles `tileTop=353`, `245×358px`, `gap=16`. Added a
  subtle section color: active toggle button + tile-mat border tinted (initially Üben=primary/indigo,
  Spielen=teal/accent; white mat kept). Verified with screenshots + bounding-box measurement.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/dashboard/UebenPath.tsx`,
  `src/features/welt/NeulandHub.tsx` (commit `d1a4d5f`); shipped in PR #413.

## Entry 292 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes
- **Response summary:** Confirmation to open a PR into `main`, squash-merge, and update the docs. Created
  **PR #413** (no template in repo), squash-merged to `main` (`2bbb055`), ran the post-merge realignment
  (fetch `origin/main`, `git reset --hard`, force-with-lease push; branch clean and level), and updated
  `PROJECT_STATUS.md` (s90 handoff + s88 handoff archived to W28), `CLAUDE.md` (Üben layout/toggle notes),
  and this log. Founder verifies the live site.
- **Artifacts:** PR #413 (squash `2bbb055`); `docs/PROJECT_STATUS.md`, `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 293 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > use some other color instead of violet for üben
- **Response summary:** Switched Üben's section tint from indigo/primary to **orange** (`text-orange-500`
  on the toggle, `border-orange-400/40` on the map mat), chosen to stay distinct from Spielen's teal and
  from the green done/Erledigt cues on the same screen (and it echoes the map's Zuhause/Laden landmark
  tiles). Spielen stays teal/accent. Re-verified via screenshot.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/dashboard/UebenPath.tsx`
  (commit `add4b7f`); shipped in PR #413.

## Entry 294 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > fill the üben icon when selected similar to spielen
- **Response summary:** Changed the toggle icon fill from Spielen-only (`id === "spielen" && tab === id`)
  to **either active tab** (`tab === id && "fill-current"`), so the selected Üben Zap renders solid like the
  selected Spielen Play. Verified in both tabs.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx` (commit `add4b7f`); shipped in PR #413.

## Entry 295 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > swap the colors of üben and spielen for the buttons. Also, the colored borders doesn't look good for the map/photo tile.. find a muted gray as a common border color.
- **Response summary:** Swapped the toggle section colors (Üben → `text-accent` teal, Spielen →
  `text-orange-500`) and reverted both tile mats (Üben map + Spielen hero) from the per-section colored
  borders back to the shared muted `border-border` gray; the white surface mat is unchanged and the section
  color now lives on the toggle only. Verified both tabs via screenshots. Shipped in PR #415.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/dashboard/UebenPath.tsx`,
  `src/features/welt/NeulandHub.tsx` (commit `87d2895`, PR #415 squash `f172f73`).

## Entry 296 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > instead of the current thunder icon for üben, use a muscle or dumbbell icon.
- **Response summary:** Replaced Üben's `Zap` (thunderbolt) with lucide's `Dumbbell`. A filled dumbbell
  renders as a solid blob, so I kept the active-fill for Spielen's `Play` only (via a `fillActive` flag) and
  left the dumbbell stroked; the teal tint + lifted white pill still mark the active state. Verified via
  screenshot. Shipped in the same PR #415.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx` (commit `87d2895`, PR #415).

## Entry 297 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > (session documentation for the swap/border/dumbbell follow-ups)
- **Response summary:** Updated `PROJECT_STATUS.md` (s90 handoff folded in the color-swap, neutral-border
  and dumbbell follow-ups + PR #413/#414/#415 ship trail) and `CLAUDE.md` (Üben toggle = teal + dumbbell,
  Spielen = orange + play, mats share `border-border`, Play-only fill). Doc-only; merged like the rest.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 298 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > are thr changes live?
- **Response summary:** Checked the `pages.yml` workflow runs on `main` via the GitHub Actions API: the
  deploy for the code commit `f172f73` (PR #415) and for the final `main` `d719203` (PR #416 docs) both
  completed with conclusion **success**, so all of the session's Heute work is published. Noted the Pages
  CDN can take a minute to propagate and the browser/PWA may serve a cached copy (hard-refresh / private
  window to bust it). No code change.
- **Artifacts:** none (read-only status check).

## Entry 299 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > also document the session
- **Response summary:** Session-end documentation pass. Most docs were written incrementally during the
  session (PROJECT_STATUS s90 handoff folding in all the layout/color/border/icon rounds, s88 handoff
  archived to W28, CLAUDE.md Üben layout + toggle notes, prompt-log entries 291–297). This pass appended the
  two remaining prompt-log entries (298–299) and reconfirmed the s90 handoff + CLAUDE.md reflect the final
  shipped state. Doc-only; merged to `main`.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (entries 298–299).

## Entry 300 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Lernpfad and Neuland should have save formatting. Beta is not part of the heading so don't consider it when keeping the heading centered. the word beta is more like a suffix. also, the bottom tile in üben and the dots below the tile have too much space in between. it looks weird. Move the tile a bit down and move the dots a bit above to keep them in optimum positions
  > same formatting*
- **Response summary:** (1) NeulandHub header restructured so "Neuland" is centered on the page exactly like
  Üben's "Lernpfad" (same `text-2xl`/`font-bold`; measured horizontal center = viewport center = 195px for
  both), with the "Beta" chip made a suffix (absolutely positioned off the h1's right edge, `left-full`,
  out of flow) so it no longer shifts the word. (2) UebenPath: grouped the practice card + module pager and
  vertically centered them below the map (`my-auto` + tight `space-y-3`), replacing the pager's `mt-auto`
  bottom-pin, so the card drops down and the dots rise to sit just below it; header + map stay pinned so
  tile parity with Spielen holds (both tiles measured identical top/height). Verified via Playwright
  (banner-dismissed real state) + measurements. Gates green (lint 0, bundle 72.7 kB). Shipped as PR #418,
  squash-merged; branch realigned.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx`, `src/features/welt/NeulandHub.tsx` (commit
  `0a36806`, PR #418 squash `862325e`).

## Entry 301 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Final session-documentation pass. All substantive docs were written incrementally
  during the session (PROJECT_STATUS s90 handoff folding in every layout/color/border/icon/heading round +
  the #413–#419 ship trail, s88 handoff archived to W28, CLAUDE.md Üben layout + Spielen header + toggle
  notes, prompt-log entries 291–300). This pass appended entry 301 and reconfirmed the s90 handoff +
  CLAUDE.md reflect the final shipped state. Doc-only; merged to `main`.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (entry 301).

## Entry 302 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > everything looks good but the dumbell doesn't fill up when selected. fix it.
- **Response summary:** Flipped the Üben tab's `fillActive` flag to `true` so the selected dumbbell fills
  solid (its two weight plates) like Spielen's play triangle; both active toggle icons now read as filled.
  (This reverses the earlier same-session decision to keep the dumbbell stroked; at 16px the filled dumbbell
  is recognizable, verified via screenshot.) Gates green (lint 0). Shipped as PR #421, squash-merged; branch
  realigned. Updated CLAUDE.md + the s90 handoff (both-icons-fill).
- **Artifacts:** `src/features/dashboard/Dashboard.tsx` (commit `211b5b4`, PR #421 squash `be4c40b`);
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 303 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > make sure to adapt the current start page design to be compatible with desktop site as well
- **Response summary:** Screenshotted the Heute start page at desktop width (1280) and confirmed it rendered
  as a narrow phone-width column stranded center-screen with large empty side margins. Since "compatible
  with desktop" could mean a few different layouts and the founder has iterated carefully on this page,
  tried to ask a clarifying question (centered column vs two-column vs wide single column); the question tool
  failed to deliver, so I began implementing the most faithful default (centered column) but paused for the
  founder's pick (next entry). No code shipped under this prompt.
- **Artifacts:** none (investigation + screenshots).

## Entry 304 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go with the second option you suggested - two column
- **Response summary:** Implemented the desktop two-column start-page layout (`lg`), mobile + `/welt`
  unchanged. Dashboard tab-content widened to `lg:max-w-4xl`; `UebenPath` → `lg:grid lg:grid-cols-2` (map |
  card+pager, vertically centered); `NeulandHub` (compact only) → hero | checklist two columns with the
  `max-w-lg` cap dropped on `lg` and the checklist un-cropped (`lg:!h-auto`, all 6 rows). Content stays
  top-aligned so the tile doesn't jump on tab toggle. Fixed the initial Spielen-hero-cramped bug (the inner
  `max-w-lg` was clamping the columns). Verified desktop + mobile + `/welt` via Playwright; gates green
  (lint 0, unit 99/99, bundle 72.7 kB). Shipped as PR #423, squash-merged; branch realigned. Updated
  CLAUDE.md + the s90 handoff.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/dashboard/UebenPath.tsx`,
  `src/features/welt/NeulandHub.tsx` (commit `86802e0`, PR #423 squash `c0d23a5`); `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 305 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I don't llike the two column design - revert to one column but adapt it to desktop
- **Response summary:** Reverted the PR #423 two-column desktop layout back to a single column on all sizes,
  and adapted it to desktop by vertically centering the whole start page in the viewport (`Dashboard` root
  `lg:flex lg:min-h-[calc(100vh-8.5rem)] lg:flex-col lg:justify-center`) so the focused column sits centered
  instead of stranded at the top. Kept the column at `max-w-md` on desktop (a wider 3:2 tile overflows the
  viewport; measured NO-SCROLL on both tabs after tuning the min-height). `UebenPath` takes natural height
  on desktop so the Dashboard can center it; `NeulandHub` two-column bits + `/welt` fully reverted. Verified
  desktop (no scroll), mobile (unchanged) and `/welt` via Playwright. Gates green (lint 0, unit 99/99,
  bundle 72.8 kB). Shipped as PR #425, squash-merged; branch realigned. Updated CLAUDE.md + s90 handoff.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/dashboard/UebenPath.tsx`,
  `src/features/welt/NeulandHub.tsx` (commit `2e6619f`, PR #425 squash `e65eb51`); `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 306 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > there's a scroll bar visible in the uben page - fix it. Make sure to keep the transition animations a bit more snappy, currenly the animation motion it feels heavy.
- **Response summary:** Diagnosed the scrollbar by measuring scrollHeight across desktop viewport heights:
  the single-column stack (3:2 tile + card + pager) at `max-w-md` was ~801px tall, just over common laptop
  viewports, and the AppShell root `min-h-screen` then forced a scrollbar. Narrowed the desktop column to
  `lg:max-w-[22rem]` (mobile stays `max-w-md`) so both Üben and Spielen fit scroll-free down to a 768px
  viewport (measured 768/800/832/900 all NO-SCROLL; below ~760 it genuinely can't fit, acceptable). Also
  made transitions snappier: tab-switch 0.2→0.13s (y 8→4), toggle mount 0.18s (y 10→6), Üben module slide
  0.2→0.13s (x 44→28). Verified desktop + mobile via Playwright. Gates green (lint 0, unit 99/99, bundle
  72.9 kB). Shipped as PR #427, squash-merged; branch realigned. Updated CLAUDE.md + s90 handoff.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/dashboard/UebenPath.tsx` (commit
  `f4547e3`, PR #427 squash `2988121`); `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 307 — 2026-07-10 (session 90)
- **Branch:** `claude/ueben-spielen-layout-styling-h7fsvm`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > For some reason, the components size got reduced and the animations doesn't look that snappy! For the animation when switching between uben/spielen, make it right to left and left to right slide motion
- **Response summary:** The #427 scrollbar fix had shrunk the desktop column to 22rem, which read as too
  small. Restored the desktop column to `lg:max-w-[26rem]` (near mobile's max-w-md) and tightened the
  desktop toggle->content gap (`lg:space-y-3`) so the full-size stack still fits: measured Üben scroll-free
  ≥768px, Spielen ≥800px (bigger components need more room, so below that Spielen can still scroll slightly,
  inherent). Replaced the vertical fade on tab switch with a directional horizontal slide (right→left to
  Spielen, left→right to Üben) via AnimatePresence custom-direction + slide variants (0.16s easeOut,
  reduced-motion safe). Verified both tabs at 768/800/832/900 + no page errors on switching; mobile
  unchanged. Gates green (lint 0, unit 99/99, bundle 73.1 kB). Shipped as PR #429, squash-merged; branch
  realigned. Updated CLAUDE.md + s90 handoff.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx` (commit `6590d8c`, PR #429 squash `f28e44a`);
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.
## Entry 308 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** photo of a hand-drawn Bibliothek desktop mockup (tab row Wörter/Redemittel/Kollokationen/
  Grammatik, a 4-icon view-mode row, a two-column card grid, and a right-hand panel with Suche + three
  labeled filter groups as pill rows)
- **Prompt (verbatim):**
  > what do you understand from the attached mockup drawing for bibliothek page?
- **Response summary:** Read the sketch as a desktop redesign of `/library`: keep the four-tab hub, add a
  view-mode switcher (read the icons as table / graph-or-relations / card grid / list), show content as a
  card grid, and replace the toolbar+sheet pattern with an always-visible right-hand search + facet rail.
  Flagged the open questions (meaning of the four icons, desktop-only vs mobile adaptation, masonry vs
  sketch looseness, whether Thema joins the rail). No code changes.
- **Artifacts:** none (analysis).

## Entry 309 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > 1. The first view is a tabular view. the second view mode is a nodal graph which is one of the features in apps like obsidian. The idea is that all words of in the app should be shown in this way and shows how each word goes will with the others - that's the connection. And the size of the nodes can represent how often is the word used in real life. The third is the grid view which is the current situation. Fourth is a simple list.
  > 2. this is desktop view but shold be adapted to mobile screen as well.
  > 3. The filter rail should also contain the Thema/Katogorie filter in it
  > Does it answer your questions?
- **Response summary:** Confirmed feasibility against the code (node size can use the raw Zipf scores in the
  generated `frequency.ts`; connections exist as authored `related` terms + collocation noun/verb pairs;
  facet logic is reusable) and proposed a three-phase plan: (1) desktop filter rail with Thema grouped under
  its 6 domains, mobile keeping the toolbar+sheet, (2) `?view=` switcher with Tabelle/Liste, (3) the
  force-directed graph as a lazy d3-force canvas on Wörter first, with filters shrinking the graph on
  mobile. Recommended dropping `related` terms that are not bank entries. No code changes yet.
- **Artifacts:** none (plan).

## Entry 310 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Yes, go ahead full speed! Aim for the best output and excellent result. Think like billionaire tech company's app designers and tech experts and provide me with a polished result.
- **Response summary:** Built and shipped all three phases. New shared pieces: `SearchField` (debounced input
  extracted from BrowseToolbar), `FilterRail` (desktop lg+ right rail: Suche, Domain-grouped Thema/Kategorie
  rows in a capped scroll box, always-visible facet pills with live counts + zero-yield greying, immediate
  commit, same URL params as mobile), `ViewSwitcher` (`?view=`, per-tab whitelist, karten default),
  `DataTable` (generic sortable table: German collation, missing-values-sink, paged rows). Per-tab table +
  compact-list views (`VocabViews`, `CollocationViews`, `RedemittelViews`). The Wörter graph view:
  `wordGraph.ts` pure builder (nodes = filtered vocab, radius from Zipf, edges from `related` matches +
  collocation pairs; article/sich/bracket-stripping normalizer) pinned by `tests/wordgraph.test.ts`, and
  `WordGraph.tsx`, an Obsidian-style canvas force graph (d3-force 3.0.0 new dependency, lazy chunk;
  pan/pinch/wheel zoom, node drag, tap-select with neighbor highlight + word card, domain color legend,
  zoom/fit controls, positions survive filter changes). Pages restructured to a two-column lg grid with the
  mobile toolbar untouched. Fixed "n Worte" to "n Wörter". Verified in a real browser (Playwright, desktop +
  mobile, all views, zero console errors, URL writes checked) plus all gates (build, lint 0 errors,
  lint:content, test:unit 110/110, bundle 72.8 kB unchanged). Shipped as PR #431, squash-merged to `main`;
  branch realigned. Docs updated (CLAUDE.md, PROJECT_STATUS.md s91 handoff, this log).
- **Artifacts:** `src/features/shared/{SearchField,FilterRail,ViewSwitcher,DataTable}.tsx`,
  `src/features/shared/BrowseToolbar.tsx`, `src/features/vocabulary/{VocabularyTrainer.tsx,VocabViews.tsx,
  WordGraph.tsx,wordGraph.ts}`, `src/features/collocations/{CollocationsBrowser,CollocationViews}.tsx`,
  `src/features/redemittel/{RedemittelTrainer,RedemittelViews}.tsx`, `tests/wordgraph.test.ts`,
  `package.json`/`pnpm-lock.yaml` (d3-force) (commit `952a759`, PR #431); `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, archive W28 chunk.

## Entry 311 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the filter rail should be a proper collapsible and expandable tile with theme color. The vocabulary toggle buttons should be to the left of this filter tile/panel on the desktop. on mobile, the legend and view buttons should be centered. there's a redundancy of numberbof words- fix it.
- **Response summary:** Four fixes on the fresh Bibliothek views. (1) `FilterRail` became a proper tile:
  rounded card with a brand-tinted `bg-primary/10 text-primary` header row ("Filter" icon + label +
  active-filter count badge + rotating chevron) that collapses/expands the whole panel; internal scroll
  moved inside the tile body; the redundant inner "Filter" heading dropped (reset action kept). (2) The
  `LibrarySwitcher` tab pills moved into the LEFT grid column on all three browse tabs, so on desktop they
  sit beside the filter tile (mobile unchanged, still full-width above the toolbar). (3) The meta row
  (view switcher + count) and the graph legend are centered on mobile (`justify-center lg:justify-start`).
  (4) Removed the duplicated word count: the graph legend now shows only "n Verbindungen"; the word count
  appears once, in the meta row. Verified via Playwright (desktop expanded + collapsed, mobile graph +
  centered legend, zero console errors); gates green (typecheck, lint 0 errors, test:unit 110/110, bundle
  73.1 kB). Shipped as PR #432, squash-merged; branch realigned.
- **Artifacts:** `src/features/shared/FilterRail.tsx`, `src/features/vocabulary/{VocabularyTrainer.tsx,
  WordGraph.tsx}`, `src/features/collocations/CollocationsBrowser.tsx`,
  `src/features/redemittel/RedemittelTrainer.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (PR #432).

## Entry 312 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > üben button should be at the bottom of filter panel. it should be visible even when filter is collapsed. add a pin button for each of the filter section so that users can pin some filters to be visible even when collapsed.
- **Response summary:** FilterRail gained a `footer` slot rendered below the collapsible body in every
  state: on desktop the Üben button now lives there (full-width gradient), visible whether the panel is
  expanded or collapsed. Mobile keeps Üben in the BrowseToolbar (no rail on mobile); the desktop meta row
  keeps only the Gespeichert toggle on Wörter (dropped entirely on Kollokationen/Redemittel). Every rail
  section (Thema/Kategorie primary + each facet group) got a pin toggle in its header: pinned sections
  keep rendering while the panel is collapsed. Pins persist per tab in localStorage (`b2beruf.railPins`,
  keyed by a new `pinScope` prop: woerter/kollokationen/redemittel; deliberately device-local, not in the
  synced settings store). Verified via Playwright: pin CEFR → collapse → section + Üben still visible,
  pin survives reload, footer Üben navigates to /session; zero console errors. Gates green (typecheck,
  lint 0 errors, test:unit 110/110, bundle 73.1 kB). Shipped as PR #433, squash-merged; branch realigned.
- **Artifacts:** `src/features/shared/FilterRail.tsx`, `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`;
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (PR #433).

## Entry 313 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the words count and connection count both can be at the bottom
- **Response summary:** In the Wörter graph view the word count moved out of the top meta row and now sits
  next to the connection count at the bottom of the canvas ("586 Wörter · 673 Verbindungen"). The meta row
  hides the word count only when `view === "graph"` (Tabelle/Karten/Liste keep it as before), so nothing is
  duplicated. Verified via Playwright (legend reads both counts, meta row clean, zero console errors); build
  + bundle green (73.1 kB). Shipped as PR #434, squash-merged; branch realigned.
- **Artifacts:** `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/vocabulary/WordGraph.tsx`;
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (PR #434).

## Entry 314 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > in the desktop view the filter tile should start from same level as the words tiles when in grid view to the right. it's a bit too to the top at the moment.
- **Response summary:** The desktop filter tile aligned with the tab row (too high). Restructured all three
  browse pages (Wörter/Kollokationen/Redemittel) so the LibrarySwitcher tabs, the mobile toolbar, the
  view-switcher meta row and the level chip span the full width at the top, and only the content column +
  the filter rail sit in the two-column grid below. Result: the filter tile top now equals the first
  content-card top (measured 353px = 353px, delta 0 via Playwright), which also matches the founder's
  original mockup (tabs across the top, filter panel beside the content). Mobile layout unchanged. Gates
  green (typecheck, lint 0 errors, test:unit 110/110, bundle 73.1 kB). Shipped as PR #435, squash-merged;
  branch realigned.
- **Artifacts:** `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`;
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (PR #435).

## Entry 315 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the browse tabs should stay the way they were before.. no need for full width
- **Response summary:** Round 4 (PR #435) had made the browse tabs span the full width to align the filter
  tile with the cards. The founder wanted the tabs back at content-column width. Switched all three browse
  pages from "full-width header above the grid" to an explicit 2-col × 2-row CSS grid: the tabs + mobile
  toolbar + view-switcher meta row + level chip sit in row 1 / col 1 (content width only), and the content
  (row 2 / col 1) + the filter rail (row 2 / col 2) share row 2. Result: the tabs no longer stretch over
  the rail column (measured tabs-right 1112 < grid-right 1400) while the filter tile still starts level with
  the first card (rail-top = card-top = 329, delta 0). `lg:space-y-0 lg:gap-y-4` keeps the mobile stack
  spacing without margin-in-grid issues; mobile layout unchanged. Verified via Playwright (desktop
  measurements + mobile screenshot, zero console errors); gates green (typecheck, lint 0 errors, test:unit
  110/110, bundle 73.1 kB). Shipped as PR #436, squash-merged; branch realigned.
- **Artifacts:** `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`;
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (PR #436).

## Entry 316 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > alle themen should be a drop-down.
- **Response summary:** Replaced the desktop filter rail's primary-scope row list (the "Alle Themen" +
  Domain-grouped theme rows in a capped scroll box) with a `Select` dropdown, reusing the same grouped
  options (Domain `SelectGroup` headings + counts) the mobile toolbar already renders. Removed the now-dead
  `PrimaryRow` helper. Applies to Thema (Wörter/Kollokationen) and Kategorie (Redemittel). Verified the
  dropdown opens and picking a theme writes `?theme=behoerde`; gates green (typecheck, lint 0 errors,
  test:unit 110/110, bundle 73.1 kB). Shipped as PR #437, squash-merged; branch realigned.
- **Artifacts:** `src/features/shared/FilterRail.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (PR #437).

## Entry 317 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the whole filter rail should be the same theme color. Apply same filter tile ui to mobile as well.
- **Response summary:** Two changes to the Bibliothek filter. (1) The WHOLE FilterRail tile is now
  brand-tinted (`bg-primary/10` body + `border-primary/20` + `border-primary/15` dividers), not just the
  header; the white controls (search, Thema Select, facet pills) provide contrast. (2) The same collapsible
  filter tile now renders on MOBILE too, replacing the mobile BrowseToolbar + FacetSheet on all three browse
  pages. Extracted a single `filterRailProps` object per page and rendered it as two `<FilterRail>`
  instances: desktop (grid col2/row2, sticky, default-open) and mobile (`lg:hidden`, inline in the header
  column, new `defaultOpen={false}` prop so it starts as a compact Filter bar the user taps to expand).
  Moved Gespeichert (Wörter) into the meta row on mobile; removed Redemittel's mobile register chips (Register
  is a rail facet). Removed the now-dead BrowseToolbar imports + activeChips/removeFacetValue/primaryOptions
  helpers from the three pages (BrowseToolbar/FacetSheet stay in the repo, just unused here). Verified via
  Playwright: desktop themed tile, mobile collapsed → tap → expanded full tile (Suche/Thema dropdown/all
  facet groups + pins + Üben footer), zero console errors. Gates green (typecheck, lint 0 errors, test:unit
  110/110, bundle 73.1 kB). Shipped as PR #438, squash-merged; branch realigned.
- **Artifacts:** `src/features/shared/FilterRail.tsx`, `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`;
  `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (PR #438).

## Entry 318 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > apply a grey shade to filter tile. üben button should always be visible on the screen.
- **Response summary:** (1) Recolored the FilterRail tile from the brand tint to a grey shade (`bg-muted` +
  `border-border`; the "Filter" header label keeps the brand accent). (2) Made Üben always visible. Desktop:
  the aside is now itself the capped scroll container (`lg:overflow-y-auto` + `lg:max-h-[calc(100vh-22rem)]`)
  with the header `lg:sticky lg:top-0` and the Üben footer `lg:sticky lg:bottom-0`, so only the facet body
  scrolls and Üben stays on screen at every scroll position (an earlier flex-1 body-scroll attempt let the
  footer overflow past the clipped aside; measured false at scroll 0, so switched to aside-scroll + sticky
  footer). Verified inView=true at scroll 0/600/3000 across 800/900/1080 viewport heights. Mobile: the tile
  drops its footer and a new shared `StickyUebenBar` (`features/shared/StickyUebenBar.tsx`, `lg:hidden`)
  floats the Üben button just above the bottom nav (offset `calc(4.4375rem + env(safe-area-inset-bottom))`
  clears the 63px nav + safe area), always reachable while scrolling; verified the mobile button stays at
  the bottom (top 729 of 844) with only one Üben present. Gates green (typecheck, lint 0 errors, test:unit
  110/110, bundle 73.1 kB). Shipped as PR #439, squash-merged; branch realigned.
- **Artifacts:** `src/features/shared/FilterRail.tsx`, `src/features/shared/StickyUebenBar.tsx` (new),
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/collocations/CollocationsBrowser.tsx`,
  `src/features/redemittel/RedemittelTrainer.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (PR #439).

## Entry 319 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > is everything live?
- **Response summary:** Checked the GitHub Pages deploy history via the Actions API rather than assuming.
  `main` is at `ab908dd` (PR #439) and its Pages deploy shows completed/success, as do all prior deploys
  this session; confirmed all nine session PRs (#431–#439) are merged to `main` and deployed. Noted the
  sandbox can't reach the live `genauly.de`/`*.github.io` site, so the final visual check (hard-refresh to
  dodge the PWA cache) is the founder's. No code change.
- **Artifacts:** none (status verification).

## Entry 320 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Session docs were already updated + merged incrementally with each PR (the
  PROJECT_STATUS s91 handoff with all founder follow-up rounds, CLAUDE.md's Bibliothek anchor, and
  prompt-log entries 308–318). This pass appended the trailing prompt-log entries so every founder prompt of
  the session has a record, and confirmed the status doc's "Last updated" summary reflects the final state.
  (A new founder prompt — entry 321 — arrived during this pass, so the doc finalization shipped together
  with that round-9 code in PR #440 rather than as a docs-only PR.)
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`, `docs/PROJECT_STATUS.md`, `CLAUDE.md` (PR #440).

## Entry 321 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > üben should be always part of filter tile even in mobile
- **Response summary:** Round 8 had put the mobile Üben in a separate floating `StickyUebenBar`; the founder
  wants Üben to be part of the filter tile on mobile too (while still always visible). Removed the
  `StickyUebenBar` component + usages, restored the Üben footer on the mobile FilterRail, and made the mobile
  tile stay visible by (a) moving it OUT of the header column to be a **grid child** (so its sticky
  containing block spans the card list, not the short header column) and (b) pinning it just below the app
  header (`sticky top-[calc(4rem_+_env(safe-area-inset-top))] z-10 max-h-[70dvh] lg:hidden`). Made the
  FilterRail's sticky header/footer + `overflow-y-auto` scroll apply on both breakpoints (removed the `lg:`
  gating) so the mobile tile behaves like the desktop one. Verified via Playwright: on mobile Üben is
  in-tile and inView at scroll 0/900/2500 (pinned ~118px) with the app header (bottom 65) sitting just above
  the tile (top 64); desktop still visible at all scroll positions; only one Üben present. Gates green
  (typecheck, lint 0 errors, test:unit 110/110, bundle 73.1 kB). Shipped as PR #440, squash-merged; branch
  realigned.
- **Artifacts:** `src/features/shared/FilterRail.tsx`, `src/features/shared/StickyUebenBar.tsx` (deleted),
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/collocations/CollocationsBrowser.tsx`,
  `src/features/redemittel/RedemittelTrainer.tsx`; `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (PR #440).

## Entry 322 — 2026-07-11 (session 91)
- **Branch:** `claude/bibliothek-mockup-review-rcghlq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > now document the session
- **Response summary:** Final documentation pass. The substantive docs were already written + merged
  incrementally through the session (PROJECT_STATUS s91 handoff = base build + 9 founder refinement rounds
  with per-round PR numbers; CLAUDE.md Bibliothek anchor at final state; prompt-log entries 308–321). This
  pass tightened the PROJECT_STATUS "Last updated" summary to reflect the FINAL state (grey collapsible tile,
  view switcher, word graph) and the full PR range #431–#440, and logged this prompt (entry 322) so every
  founder prompt of the session has a record. Confirmed session 91 is fully documented and shipped. Docs-only
  update to `main`.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (docs-only PR).

## Entry 323 — 2026-07-12 (session 92)
- **Branch:** `claude/uben-visibility-scrollbar-251zch` (all of session 92)
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot (mobile Vokabeltrainer, filter tile expanded with a right-hand scrollbar)
- **Prompt (verbatim):**
  > @screenshot üben is not visible here - fix it. also get rid of the scroll bar to the right
- **Response summary:** The mobile filter tile was capped `max-h-[70dvh]` with internal scroll, which pushed
  the sticky Üben footer below the bottom nav (invisible) and showed a scrollbar. Made the mobile tile grow
  naturally (no cap, no internal scroll → no scrollbar) with the Üben footer sticking to the viewport bottom
  above the nav; desktop kept its capped scroll rail with the scrollbar hidden (`no-scrollbar`). Shipped as
  PR #442.
- **Artifacts:** `src/features/shared/FilterRail.tsx`, `VocabularyTrainer.tsx`, `RedemittelTrainer.tsx`,
  `CollocationsBrowser.tsx` (PR #442).

## Entry 324 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > yes, if you knew I have an auto-ship preference, why did you not do it?
- **Response summary:** Fair callout — I had asked to confirm the merge instead of auto-shipping per the
  standing preference. Acknowledged, merged PR #442 into `main` (squash), realigned the branch, and adopted
  auto-ship for green changes going forward without asking each time.
- **Artifacts:** PR #442 merged.

## Entry 325 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > there's very little contrast for filter tile, increase it - perhaps better to keep the same shade as the top section of the filter tile. also, filter doesn't need to have a word, just the icon would suffice - same applies to bookmarks. put the filter and bookmark icon in the same line along with the view options.
- **Response summary:** The filter tile used `bg-muted` (95% L) on a near-white page — barely any contrast.
  Switched the whole tile to one solid `bg-border` shade (header/body/footer), made the Filter toggle + the
  Gespeichert bookmark icon-only, and moved the Filter toggle onto the view-options line. Shipped as PR #443.
- **Artifacts:** `FilterRail.tsx`, the three trainer pages (PR #443).

## Entry 326 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > is it live?
- **Response summary:** Checked the Pages deploy via the Actions API — the latest `pages.yml` runs for the
  merged commits completed successfully, so the changes were live (modulo PWA cache).
- **Artifacts:** none (status check).

## Entry 327 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > can you add the filter button beside the üben button to the left? it should be inside the filter tile.
- **Response summary:** Relocated the mobile Filter toggle from the view line into the tile footer, to the
  left of the Üben button (`[Filter][Üben]`), keeping the active-facet-count badge; removed it from the meta
  row. Shipped as PR #444.
- **Artifacts:** `FilterRail.tsx`, the three trainer pages (PR #444).

## Entry 328 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > get rid of the headers with icons. The toggle buttons is enough to know what the user is looking at. And, without changing the dimensions of the filter tile when it's collapsed collapsed, work with the üben botton in such a way to keep the words count to the right side of üben button. ideally adjust the font size in a way that the number and the word Wörter are sitting on top of the other respectively. lastly, when the filter is expanded, keep the filter icon to the left of the search button in the top of the filter tile.
- **Response summary:** Removed the `HubHero` page header from all four Bibliothek tabs (the LibrarySwitcher
  identifies the section). Moved the word count into the tile footer, stacked (number over noun) to the right
  of Üben, sized to keep the collapsed tile's dimensions. Made the Filter toggle reposition by state:
  top-left next to the search when expanded, footer-left next to Üben when collapsed. Added `FilterRail`
  `count` prop. Shipped as PR #445.
- **Artifacts:** `FilterRail.tsx`, `GrammarHub.tsx`, the three trainer pages (PR #445).

## Entry 329 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > search should live outside of filter panel. the search function should be more forgiving and it should also show the connections for the searched word as well. The search is a temporary thing so nothing should change in filter when it's being used. the icon should be yo the right side of bookmark similar to bookmark icon's design. another specific thing is that when the filter is expanded the words count should be shown in the first row - it should only be shown beside üben button when collapsed.
- **Response summary:** Moved search OUT of the filter panel into a transient toggle (search icon right of
  the bookmark; opening/closing never touches filter state, closing clears). Added a forgiving matcher
  `src/lib/fuzzy.ts` (umlaut/case-insensitive, token-order-independent, Damerau edit-1 for 4+ char tokens) +
  `tests/fuzzy.test.ts`, wired into all three pages. Wörter search now also surfaces a matched word's
  connections (related terms resolved to in-scope entries, feeding the graph edges). Count shows in the
  panel's first row when expanded, beside Üben only when collapsed. Shipped as PR #446.
- **Artifacts:** `src/lib/fuzzy.ts` (new), `tests/fuzzy.test.ts` (new), `SearchField.tsx` (autoFocus),
  `FilterRail.tsx`, the three trainer pages (PR #446).

## Entry 330 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > can you optimise and polish the page toggle button design?
- **Response summary:** Reworked LibrarySwitcher to the app's premium toggle language (recessed grey track +
  lifted white active pill) with a framer `layoutId` sliding indicator (reduced-motion safe), and made it fit
  four labels on a phone without a scroll (`text-xs`→`sm:text-sm`, full-pill rounding, tablist/aria roles).
  Shipped as PR #447.
- **Artifacts:** `src/features/library/LibrarySwitcher.tsx` (PR #447).

## Entry 331 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > apply the same sliding animation to the view buttons as the page toggle. when collapsed - no need of filter tile concept - it's only applicable when expanded. move the filter icon to the same row with other buttons and to the left of view icons. üben button can be a stand alone button below these buttons. xxx wörter can also be moved to outside to the buttom of üben button without any gray tile surrounding it. When expanded: the filter tile opens below the xx wörter. the wörter count need not be repeated inside the gray tile again. add a neat sliding animation for opening and closing of filter rail.
- **Response summary:** Big mobile restructure. ViewSwitcher got the same sliding white-pill indicator.
  Added a body-only `layout="panel"` mode to FilterRail (Thema + facets only). On mobile: Filter toggle
  moved onto the toolbar row (left of the view icons); Üben became a standalone full-width button; the count
  became plain text under it; and the filter panel slides open (AnimatePresence height/opacity) below the
  count. Shipped as PR #448.
- **Artifacts:** `ViewSwitcher.tsx`, `FilterRail.tsx`, the three trainer pages (PR #448).

## Entry 332 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > increase the size of the page toggles a bit but there should be no scroll - it should fit within the screen. Optimise and polish all the buttons, icons in all the bibliothek pages.
- **Response summary:** Bumped the toggle to `text-[13px]` + taller with tight mobile padding (same
  footprint, still fits). Cohesion pass on the toolbar: all controls at 40px height (ViewSwitcher `h-10`
  matching the icon buttons), consistent `rounded-lg` on Filter/Bookmark/Search, `rounded-xl` + `text-base`
  Üben CTA. Shipped as PR #449.
- **Artifacts:** `LibrarySwitcher.tsx`, `ViewSwitcher.tsx`, the three trainer pages (PR #449).

## Entry 333 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > increase the font size of the toggle page buttons. rhe xx wörter can go to the right side of the üben button as before. the horizontal width of the üben button and word count combined should be same the horizontal width of the filter/view/search buttons
- **Response summary:** Toggle → `text-sm` mobile / `text-base` desktop. Count moved back to the right of
  Üben (stacked). Grouped toolbar + search + Üben/count in a `w-fit` column so Üben + count together spanned
  exactly the toolbar controls' width. Shipped as PR #450. (The `w-fit` width-match was reverted next round.)
- **Artifacts:** `LibrarySwitcher.tsx`, the three trainer pages (PR #450).

## Entry 334 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > actually for the icon row and üben row.. feel free to use the full width on mobile. the compressed rows doesn't look good. it's your call on how to optimise the ui here.
- **Response summary:** Dropped the `w-fit` centering: the toolbar is a full-width `justify-between` row
  (Filter left, view centered, bookmark/search right) and the Üben row fills full-width with the count at the
  far right. Shipped as PR #451.
- **Artifacts:** the three trainer pages (PR #451).

## Entry 335 — 2026-07-12 (session 92)
- **Attachments:** screenshot (wide viewport, toggle font oversized)
- **Prompt (verbatim):**
  > @screenshot the size of font for the page toggle buttons is abnormally big in desktop view. when I was asking you to increase the size earlier, I was talking about mobile screen.
- **Response summary:** The `sm:text-base` (16px) + taller padding I'd added for wide screens read as
  oversized. Dropped the desktop bump so the toggle stays `text-sm` (14px) across all breakpoints. Shipped as
  PR #452.
- **Artifacts:** `LibrarySwitcher.tsx` (PR #452).

## Entry 336 — 2026-07-12 (session 92)
- **Attachments:** screenshot (mobile Wörter, bildung theme showing the sub-theme picker page)
- **Prompt (verbatim):**
  > @screenshot here's the mobile screenshot. Is the font size changed? Also, why are the subthemes appearing as a separate page, it should be part of the filter.
- **Response summary:** Confirmed the font did change (16→14px on wide screens; if unchanged it's the PWA
  cache). Replaced the full-page `SubThemePicker` interstitial with an **"Unterthema" dropdown inside the
  filter** (new `FilterRail` `secondary` scope, with per-sub-theme counts + "Gesamtes Thema"); the list shows
  the whole theme by default and a breadcrumb shows the active sub-theme. Wörter + Kollokationen dropped the
  picker. Shipped as PR #453.
- **Artifacts:** `FilterRail.tsx`, `VocabularyTrainer.tsx`, `CollocationsBrowser.tsx` (PR #453).

## Entry 337 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > the top page toggle section should both look like a header and also be functional - optimize it. Also, add a reset and close icons on the top right corner of the filter tile when expanded. Discard the word-based reset button.
- **Response summary:** Made LibrarySwitcher read as the page header (lifted `shadow-soft` bar; active tab
  bold + brand like a title, others quiet) while staying a tab row. Removed the word "Zurücksetzen" button;
  added icon controls: a reset (RotateCcw, disabled when nothing to clear) + close (X) in the top-right of
  the mobile filter panel (close collapses it), and the reset icon top-right of the desktop rail body.
  Shipped as PR #454.
- **Artifacts:** `LibrarySwitcher.tsx`, `FilterRail.tsx`, the three trainer pages (PR #454).

## Entry 338 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > the pin buttons are gone in mobile from the filter tile for some reason. fix it. Also, keep the üben and word count at the bottom of the screen and always visible. So, the scrolling should happen above it.
- **Response summary:** Restored the section pin buttons in the mobile panel (removed the `pinnable={!panel}`
  gating). Moved mobile Üben + count out of the toolbar into a **sticky bottom action bar** (full-bleed,
  above the nav, backdrop-blur) that stays visible while the list scrolls above it; desktop keeps Üben/count
  in the rail. Shipped as PR #455.
- **Artifacts:** `FilterRail.tsx`, the three trainer pages (PR #455).

## Entry 339 — 2026-07-12 (session 92)
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Documentation pass for session 92: appended prompt-log entries 323–339 (verbatim
  prompts + response summaries tied to PRs #442–#455), added the session-92 handoff to `PROJECT_STATUS.md`
  (moving the s90 handoff to the W28 archive), and refreshed the stale Bibliothek/mobile-layout facts in
  `CLAUDE.md` to the final state (search outside the panel + fuzzy matcher, sub-theme dropdown, full-width
  toolbar, header-like toggle with sliding pills, icon reset/close, sticky bottom Üben bar).
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `CLAUDE.md`.

## Entry 340 — 2026-07-12 (session 93)
- **Prompt (verbatim):**
  > grammatik section needs a complete re imagination. Check the other three sections of bibliothek and follow the concept of these sections on a high-level like visual hierarchy of filter icons then content and at the bottom üben button. But for all other things take all the freedom you want to redesign this section to be a worldclass billion dollar app designed by tech experts from various departments of a tech company. I want to see a page of highest quality and standard that's fully polished.
- **Response summary:** Rebuilt the Grammatik tab onto the shared s92 browse skeleton: LibrarySwitcher
  header, toolbar (mobile filter toggle + Karten/Liste ViewSwitcher + transient fuzzy search), FilterRail
  on both breakpoints (Gruppe primary dropdown + Stufe/CEFR facet via a new `grammarFacets()` registry
  entry, Üben footer), sticky mobile Üben + count bar. Redesigned topic cards (emerald group tile,
  priority-rank chip, CEFR badge, mono pattern strip, "Lernen" affordance), added a compact Liste view,
  and rebuilt the topic page as a focused lesson (hero, emerald Muster panel, Beispiele, Typische Fehler,
  numbered drills with a live progress bar, prev/next navigation along the B2-marker spine). Verified in
  a real browser at both breakpoints; all gates green. Shipped as PR #457.
- **Artifacts:** `src/features/grammar/GrammarHub.tsx` (rewrite), new `GrammarViews.tsx` /
  `GrammarTopicView.tsx` / `grammarMeta.ts`, `src/lib/facets.ts` (PR #457).

## Entry 341 — 2026-07-12 (session 93)
- **Prompt (verbatim):**
  > make sure the grammatik section is highly useful and intuitive to use for adult learners and job holders. read the purpose of the app for better clarity and understanding
- **Response summary:** Folded the audience lens (time-poor working adults on the B1–B2 plateau) into the
  redesign: the B2-marker priority order is now an explicit guided path (rank chips on cards/rows, "Thema
  n von 10" in the lesson), and finishing a topic's drills shows a completion panel ("Thema abgeschlossen ·
  k von n richtig") with a one-tap "Weiter: <next topic>" CTA, so the section always answers "where do I
  start, what's next" without the learner deciding. Same PR #457.
- **Artifacts:** `grammarMeta.ts` (`topicRank`), `GrammarViews.tsx`, `GrammarTopicView.tsx` (PR #457).

## Entry 342 — 2026-07-12 (session 93)
- **Attachments:** screenshot (mobile Grammatik lesson, Konnektoren topic)
- **Prompt (verbatim):**
  > @screenshot this section has no navigation, no üben button and there's too much text - fix these three
- **Response summary:** Three lesson-page fixes: (1) the LibrarySwitcher tabs now render on top of the
  lesson (navigation restored; tapping Grammatik returns to the topic grid); (2) Üben added to the lesson,
  inline gradient on desktop and a sticky bottom action bar above the nav on mobile, replacing the
  "Wissen im Quiz testen" /quiz CTA (/quiz stays reachable via practiceAreas); (3) less text up front: the
  English all-caps eyebrow was dropped from the hero and the Muster formula panel now leads the card, with
  the explanation clamped to three lines behind a "Mehr anzeigen" expander. Re-verified at 390px in a real
  browser; all gates green. Shipped as PR #458.
- **Artifacts:** `src/features/grammar/GrammarTopicView.tsx`, `CLAUDE.md`, `docs/PROJECT_STATUS.md` (PR #458).

## Entry 343 — 2026-07-12 (session 93)
- **Prompt (verbatim):**
  > there's a redundancy of text both in English and German. and below the text there's meta info like b2 and 5 Übungen. it's not necessary. review and fix
- **Response summary:** The lesson hero described the topic twice (German purposeDe line + the English
  explanation card below) and carried a meta badge row (CEFR, group, "n Übungen"). Removed both: the hero
  is now group tile + German title only; the clamped explanation card is the single description, and the
  drill count already shows in the Übungen progress bar. CEFR and purpose stay on the hub topic cards
  where they inform the choice. Re-verified at 390px; gates green. Shipped as PR #459.
- **Artifacts:** `src/features/grammar/GrammarTopicView.tsx`, `CLAUDE.md`, `docs/PROJECT_STATUS.md` (PR #459).

## Entry 344 — 2026-07-12 (session 93)
- **Attachments:** screenshot (mobile Grammatik lesson, Konnektoren, Muster panel + explanation)
- **Prompt (verbatim):**
  > @screenshot in muster it's not very clear whether there are two or more different connectors's pattern given. Make the format clear for user to understand. Another complaint is that the text below is like a big chunk of paragraph. It needs improvement for readability and digestion of info clearly.
- **Response summary:** Both fixed at render time (no content-bank change). The Muster panel now splits the
  authored " · " separator into one pattern variant per row with emerald dot markers (verified across all
  10 topics; Relativsätze becomes a 4-row Nom/Akk/Dat/Gen list). The explanation paragraph now renders as
  sentence bullets: the first point up front, the rest behind the existing "Mehr anzeigen" expander.
  Re-verified at 390px on Konnektoren and Relativsätze; gates green. Shipped as PR #460.
- **Artifacts:** `src/features/grammar/GrammarTopicView.tsx`, `CLAUDE.md`, `docs/PROJECT_STATUS.md` (PR #460).

## Entry 345 — 2026-07-12 (session 93)
- **Prompt (verbatim):**
  > keep the text in German but add a translation button like EN on the top right corner of the paragraph (not the tile), whenever user needs translation, they should keep it clicked or tapped to have a peek. this should be the case across Grammatik section. move the expand and collapse button to the right side bottom corner in the tile.
- **Response summary:** Made the Grammatik lesson German-first with hold-to-peek English. Added
  explanationDe + pitfallsDe to all 10 grammar topics (AI-drafted German, founder verify pending) and a
  new EnPeek chip component (shows English only while pressed, pointer or keyboard, never sticky): on the
  explanation paragraph's top-right, the Typische-Fehler header, each example card (gloss hidden until
  held) and each drill (new glossPeek prop, lesson only; sessions keep visible glosses). Moved the
  Mehr/Weniger-anzeigen expander to the tile's bottom-right corner. Verified hold/release in a real
  browser; lint:content + all gates green. Shipped as PR #461.
- **Artifacts:** `src/data/grammar.ts`, `src/types/index.ts`, `src/features/grammar/EnPeek.tsx` (new),
  `GrammarTopicView.tsx`, `GrammarDrillCard.tsx`, `CLAUDE.md`, `docs/PROJECT_STATUS.md` (PR #461).

## Entry 346 — 2026-07-12 (session 94)
- **Prompt (verbatim):**
  > I'm going to present to my German classmates this app tomorrow. they're from different professions like architecture, software engineering, material science, mechanical engineering, manufacturing and production, gastronomy, beauty and personal care, medicine, sports, transportation, etc and so on. Basically from all relevant sectors in Germany. I want you to prepare a robust and thorough scale up plan of Bibliothek's content. It should be highly relevant and useful for them even after our German course ends. This app should be the single source of truth they should refer to for vocabulary, redemittel, collocations and grammar.
- **Follow-up (verbatim):**
  > aim for billion dollar app quality and standards
- **Response summary:** Plan-mode session; the approved plan un-parked the Branche/sector axis (founder
  decision superseding the 2026-07-09 audit park) and shipped Wave 1: `WorkSector` extended 5 → 11
  (engineering, construction, production, transport, beauty, sports), 220 new vocab (20 per sector,
  care extends the Pflege pack), 96 new collocations + 3 existing tagged (9 per sector), 12 new
  Redemittel in the sector-neutral `professionalIntro` category, 328 provenance rows (DWDS references,
  draft). The Branche facet now renders automatically on Wörter and Kollokationen (coverage floor
  cleared: 27% / 15.6%). Long-term strategy doc `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` written
  (Waves 2–4: sector depth, Redemittel phrasebook to ~150, grammar canon to ~24 topics). Full pipeline
  green: verify:facts 0 two-oracle errors (oracles rebuilt), frequency subset + bins regenerated
  (wordfreq installed), verify:grammar 0 grammar flags on ~700 new sentences, verification tiers
  rebuilt, typecheck/ESLint/116 tests/build/bundle 73.0 kB.
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`, `src/lib/facets.ts`,
  `src/lib/icons.ts`, `src/data/{vocabulary,collocations,redemittel,provenance,frequency,verification}.ts`,
  `scripts/vendor/*` (regenerated subsets), `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md`,
  `docs/DECISIONS.md`, `docs/PROJECT_STATUS.md`, `CLAUDE.md`, `docs/reports/*` (PR pending).

## Entry 347 — 2026-07-12 (session 95)
- **Prompt (verbatim):**
  > create a solid plan for wave 2 to 4
- **Follow-up (verbatim):**
  > opus 4.8 prepared the model. I don't trust it enough and I want the highest quality output possible. I switched to Fable now. review the plan and make necessary changes to it. Include model recommendations for each chunk of the three waves and a non tech summary. provide a revised plan now.
- **Response summary:** Plan-mode session. Drafted and revised the Waves 2-4 execution plan (approved):
  Wave 2 feedback-driven sector deepening with sector reading texts (ReadingText.sector), Wave 3
  Redemittel phrasebook via 5 speech-act categories, Wave 4 the missing B1-B2 grammar canon, plus a
  verification workstream (review-queue tooling, draft-to-verified flow) and per-chunk model
  recommendations (Fable 5 for all German authoring, Sonnet 5 wiring, Haiku 4.5 mechanics) and a
  non-technical summary.
- **Artifacts:** plan approved; folded into `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` (see entry 348).

## Entry 348 — 2026-07-12 (session 95)
- **Prompt (verbatim):**
  > go ahead until the fable tasks are done in w4 as per the plan and then wait for my review.
- **Follow-up (verbatim):**
  > save your work on to the current branch after each wave
- **Response summary:** Executed Waves 2-4 end to end, one commit per wave, PR opened but NOT merged
  (awaiting founder review). Wave 2 first tranche: engineering/it/construction/production +40 vocab
  each (bank 1,022), +65 collocations + 1 tagged (bank 701), 4 sector reading texts one per kind
  (bank 26), ReadingText.sector schema + linter. Wave 3: 5 new Redemittel categories, 65 phrases
  (bank 149). Wave 4: 14 German-first grammar topics + 70 drills across 6 new groups (bank 24/117),
  grammarMeta spine extended. +378 provenance rows (2,132 total; provenance.ts split into two
  concatenated literals to stay under TS2590). Pipeline green: verify:facts 0 two-oracle errors,
  verify:grammar 0 grammar flags (no warn signal touches the ~800 new sentences), frequency + trust
  tiers regenerated, typecheck/ESLint/116 tests/build/73.0 kB. Docs: strategy doc updated with the
  executed state + model policy + non-tech summary; CLAUDE.md counts; s95 status handoff (s93
  archived).
- **Artifacts:** commits b1c0766 (W2) · 8c0df08 (W3) · 2bfb57f (W4) + docs commit on
  `claude/bibliothek-scaleup-german-pros-slcnh5`; PR pending founder review.

## Entry 349 — 2026-07-12 (session 95)
- **Prompt (verbatim):**
  > document the session and merge to main
- **Response summary:** Final documentation pass (this entry; s95 handoff and status header updated
  from "PR open, awaiting review" to merged state) and shipped: PR #463 marked ready for review and
  squash-merged to main (Waves 2-4: vocab 1,022, collocations 701, Redemittel 149, texts 26, grammar
  24 topics / 117 drills, provenance 2,132 rows), then the branch realigned onto origin/main per the
  post-merge housekeeping rule.
- **Artifacts:** PR #463 (squash-merged), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 350 — 2026-07-12 (session 93)
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Documentation pass for session 93 (the Grammatik redesign, PRs #457–#461). Most of
  the paper trail shipped incrementally with each PR: prompt-log entries 340–345, the s93 handoff with
  per-round bullets (later archived to W28 by session 95's doc pass), and CLAUDE.md kept current each round
  (Bibliothek views line, Grammatik redesign block, grammar bank schema with explanationDe/pitfallsDe + the
  EnPeek pattern, the /quiz status note, the facet registry line). This pass refreshed the status doc's
  "Prior, session 93" header block to cover the full session arc and added this closing entry. Sessions 94
  and 95 (Bibliothek scale-up) landed in parallel; their doc updates were reconciled by rebasing this pass
  onto the post-#463 main. Verified the s95 grammar canon adopted the German-first schema (24/24 topics
  carry explanationDe + pitfallsDe). Shipped as PR #464.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (PR #464).

## Entry 351 — 2026-07-12 (session 96)
- **Prompt (verbatim):**
  > the project status file seems to have a lot of technical info is too bulky. optimize it by splitting it as another doc or moving the info to other relevant areas and cite it well.
- **Follow-up (verbatim):**
  > along with this file, also check all other docs to optimize them well.
- **Response summary:** Documentation-optimization pass. `PROJECT_STATUS.md` had ballooned to 361 lines,
  chiefly from an 18-session narrative in the top `_Last updated_` block and stable shipped-architecture
  sections (Original SPA / Phase 1 / Phase 2 / Branding / locked decisions / completed setup items).
  Split the stable technical baseline out to a new **`docs/PROJECT_FOUNDATION.md`** (shipped architecture,
  locked architectural decisions, backend/infra, completed founder setup items) and slimmed the status
  file to current state + current counts + the two live handoffs (**361 → 122 lines**). Ran a read-only
  audit across the other live docs (plans/, strategy/, root) and applied the safe high-value fixes:
  flipped misleading "PROPOSED/IN PROGRESS/Nothing implemented" headers on shipped plans
  (GAME_IMPLEMENTATION_PLAN, MINIMAL_UX_REDESIGN_PLAN, UX_REDESIGN_IMPLEMENTATION_PLAN, both
  BIBLIOTHEK_CATEGORIZATION docs), removed durable `claude/...` branch names (AI_PRODUCT_STRATEGY + the
  two BIBLIOTHEK docs), refreshed stale content counts (BUSINESS_PLAN, DATA_STRATEGY, GAME_IMPLEMENTATION,
  PROJECT_REFERENCE) with as-of dates, fixed the SM-2→FSRS-6 factual error in PROJECT_REFERENCE, and
  updated the README index + CLAUDE.md roadmap pointer + best-practice rule #3 for the new FOUNDATION doc.
  Physical archive-moves of shipped plans were deliberately skipped (they are still cross-referenced by
  live docs; header flips solve the confusion without churning ~8 references). Append-only logs/archives
  left untouched.
- **Artifacts:** new `docs/PROJECT_FOUNDATION.md`; edited `docs/PROJECT_STATUS.md`, `docs/README.md`,
  `docs/PROJECT_REFERENCE.md`, `CLAUDE.md`, `docs/plans/{GAME_IMPLEMENTATION_PLAN,MINIMAL_UX_REDESIGN_PLAN,UX_REDESIGN_IMPLEMENTATION_PLAN,BIBLIOTHEK_CATEGORIZATION_AUDIT_2026-07-09,BIBLIOTHEK_CATEGORIZATION_IMPLEMENTATION_PLAN}.md`,
  `docs/strategy/{AI_PRODUCT_STRATEGY,BUSINESS_PLAN,DATA_STRATEGY}.md`.

## Entry 352 — 2026-07-12 (session 97)
- **Prompt (verbatim):**
  > what's next in the scale up plan?
- **Follow-up (verbatim):**
  > yes, which model should I select for this?
- **Follow-up (verbatim):**
  > go ahead
- **Response summary:** Answered the "what's next" question by reading
  `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` and the s95 handoff: content Waves 1-4 are all shipped,
  the plan's own named next step is the first verification session (build the review-queue tool, then
  run a review pass), gated on nothing; Wave-2 tranche 2 is deliberately gated on 2026-07-13 classmate
  feedback. Recommended Haiku 4.5 per the plan's model policy (mechanical tooling, no authoring/wiring),
  founder picked Sonnet 5 for headroom on new code. Shipped **`scripts/review-queue.mjs`** (+
  `pnpm review:queue`): loads every content bank plus `provenance.ts` via `ssrLoadModule`, cross-
  references each provenance row's `content_id` against the real bank item (not the free-text `notes`
  field, which isn't populated consistently) to resolve its sector/category/group/theme/chapter, then
  dumps `draft` rows grouped by content type and that axis to `docs/reports/review-queue.md`. Supports
  `--type=`/`--sector=`/`--group=` (comma lists) to scope a session and `--status=verified|all`; the
  headline verified % always covers the whole register regardless of filters. Verified output against
  the s95 handoff numbers (2,132 total / 25 verified / 2,107 draft, exact match) and that Wave-2's
  `it` vocab tranche resolves to 60 rows. Ran the full quality gate available for a script-only change:
  `lint:content` clean, `typecheck` clean, `eslint` 0 errors, `test:unit` 116/116. Updated
  `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §7.6 and `CLAUDE.md`'s command list, archived the s94
  handoff into the W28 weekly file per the doc-hygiene rule, and added the s97 handoff to
  `docs/PROJECT_STATUS.md`. Did NOT run an actual review pass (flip any row to `verified`) — that is
  explicitly next session's work, this session shipped the tool only. Not yet committed/pushed/merged.
- **Artifacts:** `scripts/review-queue.mjs`, `package.json`, `docs/reports/review-queue.md`,
  `docs/PROJECT_STATUS.md`, `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md`, `CLAUDE.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 353 — 2026-07-12 (session 97, continued)
- **Prompt (verbatim):**
  > what is the model recommendation for the next task?
- **Follow-up (verbatim):**
  > you need to explain me in plain language what you recommend.
- **Follow-up (verbatim):**
  > okay, I'll go with opus in a new session because Fable isn't available for today. Document the
  > session, I'll start with another new session for this task
- **Response summary:** Recommended a model for the actual review pass (checking `draft` provenance
  rows against their `reference` and flipping them to `verified`) that this session's tool
  (`pnpm review:queue`) was built to support. Judged it belongs in the plan's authoring tier, not
  the Haiku/Sonnet mechanical tier used for the tool itself: verifying German correctness (article/
  plural, sense-match, register, CEFR plausibility) requires the same command of German as writing
  it, and a wrong "verified" flag is worse than an unreviewed row. Recommended Fable 5 first choice,
  Opus 4.8 fallback, then re-explained the same reasoning in plain language on request. Founder
  confirmed Opus 4.8 for the next session (Fable 5 unavailable today) and asked for this exchange
  documented before starting a fresh session for the review pass. No code changes; `docs/
  PROJECT_STATUS.md`'s s97 handoff got a short addendum recording the model decision so the next
  session (which starts cold) knows to run on Opus 4.8 without re-deriving the reasoning.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 354 — 2026-07-12 (session 98)
- **Branch:** `claude/bibliothek-scale-up-yfzekq`
- **Prompt (verbatim):**
  > continue with the next step in bibliothek scale up plan
- **Response summary:** Ran the scale-up plan's named next step, the first review pass, on Opus 4.8.
  Found a product-honesty conflict first: the plan's "flip rows to `verified`" step surfaces on
  `/sources` as "menschlich geprüft / human-verified" (Sources.tsx counts `review_status: "verified"`
  as human-verified, all such rows `verified_by: "founder"`), so an AI flipping them would make a
  false claim. Surfaced two decisions via AskUserQuestion; founder chose to **feed the honest
  machine-layer `jury` tier** (the reserved "KI-Jury/AI jury" rung, already in `TIER_META` + the type
  ladder but never populated) and scoped the pass to **Wave 3 Redemittel + Wave 4 grammar**. Reviewed
  all 149 ids (65 Redemittel, 14 grammar topics, 70 drills) for German correctness. Redemittel 65/65
  clean; grammar had 4 real defects, all fixed: literal `**s**` markdown in Genitiv pitfalls (plain-text
  render), an Infinitivsätze EN/DE pitfall mismatch that breaks the hold-to-peek swap, a Vergleichssätze
  drill using `als ob` + indicative against its own Konjunktiv-II rule, and a doubled "nur" in a
  brauchen+zu drill. Built a committed sidecar `docs/reports/jury-review.json` (the passed ids) and
  wired `scripts/build-verification.mjs` to read it and elevate those ids to the `jury` tier (conf 0.9),
  keeping `verification.ts` fully generated. Added `"jury"` to the `Sources.tsx` tier-summary list so the
  149 show in the breakdown. Deliberately left `review_status` untouched (that is the human loop). Full
  gate green: build:verification (jury 149), lint:content, verify:facts 0 errors, typecheck, test:unit
  116/116, build + prerender, check:bundle 73.0 kB. Updated the plan §7 (two-loop review model),
  `CLAUDE.md` (jury-sidecar mechanism), `docs/PROJECT_STATUS.md` (s98 handoff, s95 archived), and this
  log. Committed, pushed, PR into `main`, squash-merged, branch realigned.
- **Artifacts:** `src/data/grammar.ts`, `src/data/verification.ts`, `scripts/build-verification.mjs`,
  `src/features/legal/Sources.tsx`, `docs/reports/jury-review.json`,
  `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 355 — 2026-07-12 (session 98, continued)
- **Branch:** `claude/bibliothek-scale-up-yfzekq`
- **Prompt (verbatim):**
  > document the session
- **Response summary:** The session's documentation was already written and merged inline with the
  work in PR #468: the s98 handoff in `docs/PROJECT_STATUS.md` (plus the `_Last updated_` block and
  archiving the s95 handoff to the W28 chunk), the two-loop review model in
  `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §7, the jury-sidecar note in `CLAUDE.md`, and prompt-log
  Entry 354. This entry closes the paper trail for the explicit "document the session" prompt. No
  further code or content changes; log-only, shipped on the dev branch.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`.

## Entry 356 — 2026-07-12 (session 99)
- **Branch:** `claude/filter-hierarchy-branches-e35yxg`
- **Prompt (verbatim):**
  > Subtheme and Branche should be drop downs and the default heriarhy should be - Branche, Thema,
  > Sub-thema. I need you to check the filter selecions and the words visible. There are common
  > words for Branche and Thema which are not always visible. For example, when I select the word
  > das Projekt, it's only showing it's applicable for IT Branche. Why is that? Projekt is
  > applicable widely in several sectors/Branchen - fix such connection errors.
  >
  > also, common industries like Plastics, Chemicals or pharmaceuticals is missing in Branches.
  > Look for such obvious sectors missing in the app. Prepare a robust plan including verification
  > for the above items.
- **Follow-up (verbatim):**
  > it's not just isolated case of Projekt. The problem for it may persist for several words. if
  > not for all of them. You need to fix the root cause of it.
- **Follow-up (verbatim):**
  > i approve the plan but don't implement it now. Just save it on the repo and merge to main.
  > Document the session.
- **Response summary:** Plan-mode session (Fable 5). Investigated the Branche filter end to end and
  diagnosed the root cause: `sector` is a single optional value, only ~406/1,022 words and 165/701
  collocations carry one, and the facet filter is strict, so selecting any Branche hides every
  untagged word (das Projekt carries no tag at all) and pins tagged cross-industry words (die
  Wartung, das Werkzeug, der Schichtplan) to the one sector of the pack they were authored in.
  Confirmed systemic, exactly as the founder's second prompt insisted, and that no UI surface shows
  a word's Branche today. Via AskUserQuestion the founder chose the maximum sector expansion
  (Chemie & Kunststoff and Pharma & Medizintechnik as separate sectors, plus Reinigung,
  Sicherheitsdienste, and a Transport → Transport & Logistik expansion) with full ~20-word +
  ~9-collocation starter packs each. Wrote the approved plan: `sectors[]` multi-tagging with
  untagged = universal semantics, Branche as a scope dropdown above Thema and Unterthema
  (FilterRail generalized to ordered `scopes[]`, escaping the 12-option facet cap and the 15%
  coverage floor), a retag audit of all 571 tagged items with a founder-review report, Branche
  chips on the Tabelle/Karten views, and a verification section (new `tests/sectors.test.ts`,
  linter `sectors[]` checks, gate suite, browser E2E checklist). Founder approved the plan but
  deferred implementation: this session only saved the plan to
  `docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md`, documented the session (status handoff s99, s97
  archived to the W28 chunk, this log entry), and merged to `main`. No code or content changes.
- **Artifacts:** `docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 357 — 2026-07-12 (session 100)
- **Branch:** `claude/uben-ui-refinements-dibbiz`
- **Prompt (verbatim):**
  > [7/12, 10:26] Suhas: Üben should be specific and relevant to where in the learner is in the app. In practice sessions, add an option to show answer for speaking/typing questions as currently the user has no way to move on if they don't know the answer.
  > [7/12, 10:28] Suhas: Even in the graph view the words count should be in the same place as in other views beside the üben button. Keep the connectors count in the same location as it is currently.
  > [7/12, 10:46] Suhas: The map should have the most beautiful design as it's the first thing a user sees when opening the app. Currently the colors and design of the app is average. Also, make sure an interactive element to the app - when the user taps on the building icons, the bottom tile should be get in sync with it by sliding to the corresponding session.
  > [7/12, 10:47] Suhas: The filter tray looks ugly in desktop view.
  > [7/12, 10:49] Suhas: In desktop view - The word count can stay beside the üben button to the right even when expanded.
  > [7/12, 10:51] Suhas: The muster and explanation can stay side by side in desktop view.
- **Response summary:** Plan-mode session. Explored the six request areas with three parallel
  read-only codebase passes (session player speaking/typing blocks + every Üben entry point and
  `buildSession`'s options; FilterRail desktop anatomy + the count/Üben placement per view incl.
  the graph legend; the UebenPath map SVG + GrammarTopicView's Muster/explanation card), then
  designed one implementation plan covering all six: (1a) Üben relevance via a `?grammar=` param
  pinning the lesson's topic in the session composer plus a pure `libraryFocus` helper mapping
  Bibliothek facets and the Redemittel category onto the existing mission-style `focus` opt;
  (1b) a speaking-block "Anzeigen" give-up mirroring the typing block's (grades wrong, never a
  pass); (2) graph word count relocated beside Üben, connections count staying under the canvas;
  (4+5) FilterRail desktop restyled as a standard surface card with the count kept beside Üben in
  the sticky footer in both states; (6) a lg two-column grid for Muster + explanation; (3) tappable
  map stops driving the existing card pager plus a concrete SVG beautification recipe. Founder
  approved the plan (see Entry 358) with the instruction to save rather than implement.
- **Artifacts:** exploration only; the plan file ships in Entry 358.

## Entry 358 — 2026-07-12 (session 100, continued)
- **Branch:** `claude/uben-ui-refinements-dibbiz`
- **Prompt (verbatim):**
  > i approve the plan but don't implement it now - include model recommendations for each chunk. Then, save it on the repo and merge to main. Document the session.
- **Response summary:** Wrote the approved plan to **`docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`**
  with a per-chunk model map in the house tiering (Opus 4.8 for the composer/SRS-adjacent Üben
  relevance chunk; Sonnet 5 for the speaking "Anzeigen", graph count, FilterRail redesign, and
  grammar-lesson grid; Fable 5 first choice with Opus 4.8 fallback for the map beautification;
  Haiku 4.5 for docs/gates). No app-source changes. Documented the session: s100 handoff appended
  to `docs/PROJECT_STATUS.md` (s98 handoff archived to the W28 chunk per the two-handoff rule,
  `_Last updated_` block refreshed) and this log. Committed, pushed, PR into `main`, squash-merged,
  branch realigned.
- **Artifacts:** `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 359 — 2026-07-12 (session 101)
- **Branch:** `claude/uben-ui-refinements-dibbiz`
- **Model:** Opus 4.8 (the plan's tier for the composer/SRS-adjacent chunk)
- **Prompt (verbatim):**
  > go ahead with first point
- **Response summary:** Implemented Work item 1 of `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`
  (Üben relevance + speaking "Anzeigen"). Engine (`src/engine/session.ts`): added the `grammarTopicId`
  build opt (Pool 3 pins the studied grammar topic, 4 drills vs the random 2) and an exported pure
  helper `libraryFocus({theme, sub, cefr[], sector[], category})` that maps a browse page's narrowed
  state onto the existing mission-style `focus` (caps `FOCUS_VOCAB_CAP=8`/`FOCUS_REDE_CAP=4`, returns
  undefined when nothing narrows past the theme). Route wrapper (`Session.tsx`): parses `?grammar=`/
  `?cat=`/`?sub=`/`?cefr=`/`?sector=` (priority mission > grammar > libraryFocus), forwards a new
  `SessionPlayer` `grammarTopicId` prop, and extends the remount key. Callers rewired: Grammatik
  lesson (`?grammar=${topic.id}`), Redemittel (`?cat=` when a category is active), Wörter +
  Kollokationen `startSession` (build the URL from live theme/sub/cefr/sector). Speaking block
  (`SessionPlayer.tsx`) gained an "Anzeigen" ghost button in the prompt + typed stages calling the
  existing `evaluate("")` (reveals the answer, grades FSRS 0, unlocks Weiter). Added 5
  `tests/engine.test.ts` cases. Gates: typecheck ✔, test:unit 121/121, lint 0 errors, build +
  prerender ✔, check:bundle 73.0 kB. Updated the plan doc (item 1 marked shipped), `PROJECT_STATUS.md`
  (s101 handoff, s99 archived), `CLAUDE.md` (session-engine note), and this log. Committed, pushed,
  PR into `main`, squash-merged, branch realigned.
- **Artifacts:** `src/engine/session.ts`, `src/features/session/Session.tsx`,
  `src/features/session/SessionPlayer.tsx`, `src/features/grammar/GrammarTopicView.tsx`,
  `src/features/redemittel/RedemittelTrainer.tsx`, `src/features/vocabulary/VocabularyTrainer.tsx`,
  `src/features/collocations/CollocationsBrowser.tsx`, `tests/engine.test.ts`,
  `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `CLAUDE.md`,
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 360 — 2026-07-12 (session 101, continued)
- **Branch:** `claude/uben-ui-refinements-dibbiz`
- **Model:** Opus 4.8
- **Prompt (verbatim):**
  > Once you're done with it, check for any inaccuracies in Grammatik section, perform completeness
  > checks and fix them.
- **Response summary:** Audited the whole grammar bank (`src/data/grammar.ts`, 24 topics / 117 drills).
  (1) **Mechanical completeness** via a scratchpad script (loaded the real module through Vite
  `ssrLoadModule`): confirmed every topic has `explanationDe`/`purposeDe`/`pitfalls`/`pitfallsDe`
  (with `pitfalls` and `pitfallsDe` the same length, since `EnPeek` swaps them by index), every drill
  has `explain`+`gloss`, no em dashes anywhere, every MCQ answer is among its options. No structural
  gaps. (2) **German-correctness read** of all 24 topics: the content is high quality (Wave 4 was
  jury-reviewed in s98); found and fixed 4 inaccuracies: g_relativsaetze pitfall[1] EN was garbled
  ("not 'denen' ↔ 'die'" → "not 'die'", shows on the EN peek); g_nebensatz explanation EN listed
  "dass" twice in the conjunction list (removed the duplicate); g_futur_vermutung `purposeDe` read
  awkwardly ("wahrscheinlich ist er es JETZT" → "wahrscheinlich ist er gerade dort", rendered in the
  card/list views); g_praepositionalpronomen example EN "What did you discuss about?" →
  "What did you discuss?". Gates: `lint:content` ✔ (no errors), completeness audit clean, `build` +
  prerender ✔. Committed, pushed, PR into `main`, squash-merged, branch realigned.
- **Artifacts:** `src/data/grammar.ts`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 361 — 2026-07-12 (session 102)
- **Branch:** `claude/fable-time-prioritization-126bp4`
- **Prompt (verbatim):**
  > I'm presenting this app to an audience tomorrow. Today is the last day I have Fable available.
  > What should I prioritize and how can I make sure I use the last hour of fable?
- **Follow-up (verbatim):**
  > how should I make sure I make the best use of Fable*
- **Follow-up (verbatim):**
  > but the branch filter overhaul is one of the core features I want to present
- **Follow-up (verbatim):**
  > continue
- **Response summary:** Prioritization session that turned into the Branche filter overhaul
  implementation (Fable 5, the founder's last Fable day). Initial recommendation was to freeze main before the demo and spend the
  model's last day on the AI-jury German review, treating the s99 overhaul plan as post-demo work;
  the founder countered that the Branche filter is a core feature of the presentation, which
  reversed the priority. Executed the full approved plan same-day: (1) `sectors[]` data-model
  migration (575 rows), 15 sectors (4 new: Chemie & Kunststoff, Pharma & Medizintechnik, Reinigung,
  Sicherheitsdienste; Transport relabeled Transport & Logistik), linter guard against the retired
  singular field; (2) the untagged-= universal `matchesSector` scope semantics + sector-first
  ordering in both browse pages (the das-Projekt root-cause fix); (3) FilterRail generalized to
  ordered scopes (Branche → Thema → Unterthema) with per-sector dedicated-content counts;
  (4) Branche chips on Tabelle/Karten; (5) retag audit of all 562 tagged items (117 untagged,
  162 widened, 279 confirmed) with the founder-review report `docs/reports/sector-audit-report.md`;
  (6) four ~20-word + ~9-collocation starter packs plus the Lager boost (+91 words, +40 pairs,
  +131 provenance rows); (7) `tests/sectors.test.ts` with the v_projekt/v_bauzaun regression pair.
  vocabulary.ts split into two concatenated literals (TS2590). All gates green (124/124 unit tests,
  bundle 73.0 kB, verify:facts 0 errors with refreshed oracles) and the plan's browser E2E checklist
  verified against the dev server on desktop + mobile viewports. Docs updated and shipped to main
  per the auto-ship preference so the feature is live for the 2026-07-13 presentation.
- **Artifacts:** `src/types/index.ts` · `src/lib/facets.ts` · `src/features/shared/FilterRail.tsx` ·
  `src/features/shared/SectorChips.tsx` · `src/features/vocabulary/VocabularyTrainer.tsx` +
  `VocabViews.tsx` + `VocabList.tsx` · `src/features/collocations/CollocationsBrowser.tsx` +
  `CollocationViews.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `src/features/grammar/GrammarHub.tsx` · `src/data/vocabulary.ts` / `collocations.ts` / `texts.ts` /
  `provenance.ts` · `scripts/lint-content.mjs` · `tests/sectors.test.ts` ·
  `docs/reports/sector-audit-report.md` · `docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · scripts/vendor oracle subsets.

## Entry 362 — 2026-07-12 (session 102, continued)

- **Branch:** `claude/fable-time-prioritization-126bp4`
- **Prompt (verbatim):**
  > what should be the next task to do with fable?
- **Follow-up (verbatim):**
  > document the session
- **Response summary:** Post-merge advisory + documentation turn (recommendation given on Fable 5;
  this doc pass run on Opus 4.8 after the founder switched models). Recommended the **Üben city-map
  redesign** (item 3 of `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md`) as the next Fable task: that
  plan's own per-task model map already assigns it to Fable 5 (Opus 4.8 fallback), it is the first
  screen the demo audience sees ("the map should have the most beautiful design"), and the tappable
  building-stop interaction reads well live. Named the AI-jury German-correctness review (the 131
  items authored in s102 plus dialogues/texts) as the zero-risk runner-up, and flagged that Üben
  items 2/4+5/6 are Sonnet-tier per the plan so Fable should not be spent on them. Then documented
  the session: this log entry. The s102 handoff in `PROJECT_STATUS.md`, the `CLAUDE.md` content
  counts/Branche notes, and the plan status line were all already refreshed and shipped inside the
  merged PR #473 (Entry 361), so no further status/CLAUDE edits were needed.

## Entry 363 — 2026-07-12 (session 103)

- **Branch:** `claude/sonnet-5-ui-refinement-7w4z1v`
- **Prompt (verbatim):**
  > go ahead with sonnet 5 items in the ui refinement plan
- **Response summary:** Implemented the three remaining Sonnet-5-tier chunks of
  `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md` (work item 1 was already shipped s101; item 3 stays for
  Fable 5 / Opus 4.8). (2) `WordGraph.tsx` + `VocabularyTrainer.tsx`: moved the graph view's word
  count off the canvas legend to sit beside Üben like every other view (rail + mobile sticky bar);
  the canvas keeps only the connections count. (4+5) `FilterRail.tsx`: restyled the tile (desktop
  rail and mobile panel) from the flat `bg-border` slab to a standard content card (`bg-surface` +
  `border-border` + `shadow-soft`), muted unselected facet pills, eyebrow-style scope labels,
  restructured the header into a toggle + a permanent reset icon, and made the result count sit
  beside Üben in every state (open, collapsed, mobile) instead of only when collapsed. (6)
  `GrammarTopicView.tsx`: grid-split the lesson's Muster panel and explanation side by side at
  `lg:`, mobile unchanged. Ran the full gate sequence after installing deps (`pnpm lint` 0 errors,
  `pnpm typecheck`, `pnpm test:unit` 129/129, `pnpm build` + prerender, `pnpm check:bundle` 73.0 kB)
  and browser-verified all three changes with Playwright against the local dev server (light + dark,
  desktop + mobile viewports, including the grammar lesson at 1280px and 390px). Updated the plan's
  progress block, `CLAUDE.md`'s Bibliothek section, and `docs/PROJECT_STATUS.md` (archived the s101
  handoff to the W28 weekly file, added the s103 handoff).
- **Artifacts:** `src/features/vocabulary/WordGraph.tsx` · `src/features/vocabulary/
  VocabularyTrainer.tsx` · `src/features/shared/FilterRail.tsx` ·
  `src/features/grammar/GrammarTopicView.tsx` · `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` ·
  `docs/SESSION_PROMPT_LOG.md`.

## Entry 364 — 2026-07-12 (session 104)

- **Branch:** `claude/map-mockup-generation-t0bsl6`
- **Prompt (verbatim):**
  > go ahead with the map mock-up generation as per the ui refinement plan. Provide a few mock-ups in a html file for preview
- **Follow-up (verbatim, with 3 attached pixel-art village reference images):**
  > The previews doesn't look good in your html. I'm attaching some style references. The thumbnail map can be inspired from these but not necessarily heavily detailed. Try again to generate some beauties and provide me a preview link
- **Follow-up (verbatim, interrupting the pixel round mid-review):**
  > stop with the current preview generations - let's not waste resources going in that path. Take the current map live and add enough spacing such that the active icons are not too much to the edge, and play with the colors of the shapes within and provide me with a few mock-ups in a preview link
- **Follow-up (verbatim):**
  > I like stimmung 3 but the dark mode is too dark with low contrast. Provide a couple of previews for dark mode
- **Follow-up (verbatim):**
  > I like dunkel D
- **Follow-up (verbatim, mid-implementation):**
  > Once done with the task, save the previews and reference images shared on the repo and document the session.
- **Follow-up (verbatim, with a live screenshot of the fresh-state map):**
  > this is how it looks at after the changes are live - clearly there's more improvement needed here
- **Follow-up (verbatim, interrupting a proposed quieter dotted-route change):**
  > the dotten chain is fine. Leave it as is. Anyway, the user sees a thick line (as per the preview) after traveling so that's okay.
- **Follow-up (verbatim):**
  > the icons aren't interactive on the map. clicking on them doesn't do anything - fix it. Also, reduce the size of pin by 30%. 
- **Response summary:** Üben map mockup session (Fable 5, run in parallel with s103; rebased onto its merge) that converged on a shipped redesign of
  `UebenPath.tsx` (Üben-refinements plan, Work item 3, re-scoped by the founder along the way).
  Round 1: the plan's illustrated-buildings recipe as 3 SVG variants (plan spec / lively / depth),
  light + dark; rejected. Round 2: a code-generated pixel-art village renderer (canvas, seeded,
  day/night palettes) against the founder's Zelda/Pokemon-style references; the founder stopped this
  direction mid-review to save resources (never committed; the reference images arrived inline in
  chat and could not be exported to repo files). Round 3: the live map's design language kept, street
  grid re-spaced so no landmark tile hugs an edge, four color moods (Live / Frisches Grün / Brand-Ton
  / Warm & Hell), each light + dark, delivered as a claude.ai artifact link. Founder picked Stimmung
  3 but rejected its dark as too dark, so a fourth sheet offered four brighter dark treatments
  differing in where the brightness sits (lifted / light streets / light blocks / brightest ground);
  founder picked "Dunkel D: Klarer Abend". Implemented in `UebenPath.tsx`: re-spaced grid (streets
  y 88/170, x 76/176/276; tiles at [44,48]/[120,48]/[310,128]/[216,205]), re-laid parks/lots,
  MAP_LIGHT = Brand-Ton, MAP_DARK = Klarer Abend, and a new `route` palette field replacing
  `hsl(var(--primary))` on the journey line/pin (the dark map needs a brighter indigo than the dark
  --primary token). Gates green (typecheck, lint 0 errors, test:unit 129/129, build + prerender,
  bundle 73.0 kB) and verified in the built app via Playwright in both themes. Mockup rounds 1 and 3
  archived beside the final dark-variants sheet under `preview/`. Shipped to `main` per the
  auto-ship preference; docs updated (this entry, the s104 handoff, CLAUDE.md map notes, plan
  progress block). Post-ship follow-up from the founder's live screenshot: per-stop
  `labelPos`/`chipPos` collision fixes (top-row labels above the tile, chip right of the pin),
  scenery reshaped under the new labels; the dotted future-route stayed at full strength on the
  founder's call. Re-verified across fresh/boss-done/mid states in both themes and shipped.
  Third round: made the landmark tiles tappable (the plan's remaining work-item-3 sub-task:
  per-stop button groups, stopTarget slides the practice card to the stop's first unplayed
  mission, 44px hit rects, hover/focus scale, keyboard support, pin untouched by taps) and shrunk
  the pin to 70% scaled about its tip (chip offsets retuned). Tap-routing verified per stop in the
  built app; all gates green; shipped. This closes the Üben UI-refinements plan.
- **Artifacts:** `src/features/dashboard/UebenPath.tsx` · `preview/ueben-map-mockups.html` (final,
  dark variants) · `preview/ueben-map-mockups-r1-beautify.html` ·
  `preview/ueben-map-mockups-r2-farbstimmungen.html` · `docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · `CLAUDE.md`.

