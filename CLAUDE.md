# Genauly — German for the intermediate (B1–B2) plateau

Genauly helps adult learners break through the intermediate German plateau (B1–B2) and build
practical fluency for the situations that actually matter in real life: the **workplace**, plus
**everyday tasks** like bureaucracy (Behörde), banking, healthcare (Arzt), and housing. It also
supports direct preparation for the **telc Deutsch B2 Beruf** and **Goethe-Zertifikat B2** exams.
React + TypeScript + Vite SPA, deployed to GitHub Pages.

**Scope note (do not narrow this again):** the product was repositioned in session 21 (2026-06-12)
from "B2 Beruf speaking-exam prep" to the broader B1–B2 plateau framing above. The live landing page,
`/about`, the PWA manifest, and `docs/strategy/BUSINESS_PLAN.md` already reflect it. Exam prep is **one
pillar**, not the whole product; daily-life domains beyond the workplace are core, not optional.

## Stack
- **Vite 6** + **React 18** + **TypeScript 5.7** (strict, project references via `tsc -b`)
- **Tailwind 3** (config in `tailwind.config.ts`), **Radix UI** primitives, **framer-motion**, **lucide-react**, **recharts**
- **zustand** for state, **react-router-dom 6** for routing
- No test framework configured; targeted gates live as `scripts/*.mjs` (see `pnpm test:srs` below).

## Commands
**Package manager is `pnpm`** (pinned via the `packageManager` field; lockfile is `pnpm-lock.yaml`).
Do NOT use `npm`/`yarn` — there is no `package-lock.json`. Run `pnpm install` after pulling.
- `pnpm dev` — local dev server
- `pnpm build` — `tsc -b && vite build && node scripts/prerender-help.mjs` (run this to verify before
  pushing). The final step prerenders the public help section (`src/features/help/`, see Layout) to static
  HTML under `dist/hilfe/` and regenerates `dist/sitemap.xml`; it needs `dist/index.html`, so it runs after
  `vite build`. `pnpm prerender:help` runs just that step against an existing `dist/`.
- `pnpm typecheck` — `tsc -b --noEmit`
- `pnpm preview` — preview the production build
- `pnpm audit` — check for dependency vulnerabilities (CI/security gate)
- `pnpm lint:content` — validate the `src/data/*` content banks (CI gate, see below)
- `pnpm verify:facts` — Layer 2 fact gate (data strategy, s77): checks every noun's der/die/das +
  plural against **two independent morphology oracles** (LanguageTool + German Wiktionary), fails CI
  only when **both** agree a form is wrong. Runs offline against the committed subsets in
  `scripts/vendor/`. **After adding nouns, run `pnpm build:oracles` to refresh those subsets** (fetches
  npm + PyPI), then `pnpm verify:facts`. See `docs/strategy/DATA_STRATEGY.md` §3 / `docs/reports/verify-facts-report.md`.
- `pnpm verify:grammar` — Layer 3 grammar/spelling (data strategy, s78): runs **LanguageTool 6.8** over
  every German sentence in the banks (vocab/collocation examples, dialogue lines, reading texts,
  redemittel), bucketed report → `docs/reports/verify-grammar-report.md`. **Warn-only, NOT a gate** (LT
  over-flags idiomatic B2). LanguageTool is ~69 MB (not vendored); run `pnpm build:languagetool` first
  (resolves it pinned from Maven Central, then runs offline). Scheduled monthly via `verify-sentences.yml`.
- `pnpm verify:cefr` — Layer 3 CEFR plausibility heuristic (s78): flags items whose word-frequency
  (`wordfreq` Zipf) + sentence complexity are far from the claimed `cefr` facet. Precision-first (German
  compound frequency is a weak grader, so it flags only common-word/advanced-label, vocab only), report →
  `docs/reports/verify-cefr-report.md`. Runs offline against the vendored
  `scripts/vendor/german-frequency-subset.json`; regenerate with `pnpm build:frequency-subset` (needs
  Python `wordfreq`) after adding vocab/collocations. Warn-only. `pnpm verify:sentences` runs both.
- `pnpm build:frequency` — regenerate the **generated** `src/data/frequency.ts` (categorization plan
  PR 3, 2026-07-09): per-item Häufigkeit bins (core/common/specialized) from the vendored wordfreq Zipf
  subset, behind the Häufigkeit facet/badge (Wörter + Kollokationen) and the Fortschritt frequency
  chart. Items with Zipf < 1.5 (incl. out-of-corpus compounds) get NO bin on purpose; never label
  absence of corpus evidence "Fachsprache". Run after adding vocab/collocations (after
  `pnpm build:frequency-subset` refreshes the subset); `lint:content` errors on stale ids.
- `pnpm build:verification` — Layer C trust model (data strategy, s78): composes the Layer 2 fact +
  Layer 3 grammar/CEFR results into the **generated** `src/data/verification.ts` (per-item `tier` /
  `checks` / `confidence`, keyed by content_id). Reads the `docs/reports/verify-grammar.json` sidecar
  (so run `pnpm verify:grammar` first) and recomputes facts/CEFR from the vendored subsets. `/sources`
  shows a tier badge per item; `lint:content` validates the enums + prints the tier distribution.
  Regenerate after re-running the `verify:*` checks. See `docs/strategy/DATA_STRATEGY.md` §4.
  **AI-jury tier (s98):** the `jury` rung ("KI-Jury"/"AI jury", confidence 0.9, above `linguistic`,
  below `human`) is fed by the committed sidecar `docs/reports/jury-review.json` — a `{ promptVersion,
  reviewer, pass: [content_id, …] }` record of an AI review pass for German correctness. Any listed id
  with no failing check is elevated to `jury` (unless `review_status: "verified"`, which stays `human`).
  This is an honest **machine** tier and does NOT touch `review_status`; only a human flips that (see
  the two-loop model in `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §7). Append ids to the sidecar as
  later waves are reviewed, then regenerate. Sidecar absent → no item is jury (non-breaking).
- `pnpm report:exercise-coverage` — the Üben exercise-variety gauge (s131 exercise-variety plan).
  Runs the REAL session builder across every theme (all CEFR levels × new/mature decks) and writes a
  visual, plain-language `docs/reports/exercise-coverage-report.md`: how many distinct exercise types
  each topic's custom Üben set can produce, plus the word-level residual (words with no self-example →
  no cloze/typing/listening; words with no resolvable `related` → no odd-one-out). Deterministic
  (seeded RNG), no gate. This is the "is template variety exhausted?" answer: theme-level is exhausted
  when every theme is 🟢; the report's word-level gaps are the remaining CHEAP content polish; the
  expensive Phase 4 only starts once those are closed AND learner-repetition/plateau signals appear
  (which need telemetry this report deliberately does not have). Re-run after content edits.
- `pnpm review:queue` — read-only dump of `draft` provenance rows grouped by bank, then by sector
  (vocab/collocation/text) / category (Redemittel) / group (grammar) / theme / chapter, written to
  `docs/reports/review-queue.md`, for offline founder/reviewer passes (scale-up plan §7.6, s97).
  Scope a session with `--type=`, `--sector=`, `--group=` (comma lists) and `--status=verified|all`;
  the headline verified % always covers the whole register regardless of filters. Flips nothing —
  a reviewer edits `review_status: "draft" → "verified"` by hand in `src/data/provenance.ts` after
  checking a row against its `reference`. Rising verified % is the trust-model quality headline.
- `pnpm stamp:verified` — content-fingerprint gate for human verification (s130 data-architecture
  review): writes a canonical-JSON sha256 per `review_status: "verified"` provenance row to
  `docs/reports/verified-hashes.json` (`scripts/stamp-verified-hashes.mjs`; hash helpers shared with
  the linter in `scripts/content-hash.mjs`). `lint:content` FAILS when a verified item's current
  content no longer matches its stamp, so a "verified" item can never be silently edited afterwards.
  **Run this right after flipping rows to `verified`** (and commit the sidecar with the flip);
  re-stamping is only legitimate after an actual re-review.
- `pnpm apply:reviews` — the review LOOP-CLOSER (admin center chunk 2, s144): applies the founder's
  review decisions back to the repo. **Two input modes.** KEYLESS (the supported path): the founder
  clicks "Entscheidungen" in the /sources workbench to download a decisions file
  (`buildDecisionExport`/`downloadDecisions` in `src/lib/reviewExport.ts`), and a session runs
  `pnpm apply:reviews --from <file>` (`parseDecisionFile` reads it; NO Supabase, NO service-role
  key, so no secret ever lives in the Claude environment's plaintext config). DIRECT-DB (optional,
  a secure local shell only): with `SUPABASE_SERVICE_ROLE_KEY` in env it fetches
  `provenance_reviews` rows with a `decision` and null `applied_at` itself. Either way it maps ids
  through `ID_RENAMES`, recomputes each item's fingerprint and compares it with the
  hash stored AT DECISION TIME (the workbench writes it via `src/lib/contentHash.ts` +
  `src/lib/contentIndex.ts`, kept byte-compatible with `scripts/content-hash.mjs` and pinned by
  `tests/contentHash.test.ts`), codemods matching approvals to `review_status: "verified"` (+
  `verified_by`/`verified_date`), then runs `stamp:verified` + `lint:content` so flip and stamp
  land in the SAME commit. Reject/needs_fix rows export to `docs/reports/review-defects.md`/`.json`
  (the AI repair queue). In KEYLESS mode there is no DB write-back: applied state reconciles from
  the deployed bundle (the item is `verified` in provenance.ts). In DIRECT-DB mode
  `applied_at`/`applied_sha` write-back is a RECONCILE pass that only marks rows whose verified flip
  is committed at a clean HEAD: run `pnpm apply:reviews --mark-applied` after merging (any later
  full run also self-heals). `--dry-run` classifies + prints, writes nothing. **Integrity rules (do
  not weaken): a null or
  mismatched decision hash is re-review, never a flip; already-verified repo rows are only ever
  marked applied; never re-stamp to silence a mismatch.** `tests/applyReviews.test.ts` pins the
  classification + codemod + `parseDecisionFile`; `tests/reviewExport.test.ts` pins the
  browser-export → script-parse round-trip.
- `pnpm test:srs` — assert `engine/srs.ts` against FSRS golden vectors from py-fsrs (CI gate, s53).
  **Run it after any `engine/srs.ts` edit.** Vector provenance is in the `scripts/test-srs.mjs` header.
- `pnpm test:pronounce` — assert the `engine/pronounce.ts` spoken/typed answer matcher (CI gate, s56).
  **Run it after any `engine/pronounce.ts` edit.**
- `pnpm lint` — ESLint (CI gate, s58). Errors block; the compiler-era react-hooks rules are
  deliberate warnings (visible debt), don't silence them wholesale.
- `pnpm test:unit` — Vitest smoke suite in `tests/` (CI gate, s58): stores, session composer,
  search, paged-list + debounce contracts. Extend it when touching those areas.
- `pnpm check:bundle` — main-chunk size budget, 400 kB (CI gate, s58; run after `pnpm build`).
  If a feature legitimately needs more, raise the budget in `scripts/check-bundle-size.mjs` in the
  same PR and say why. **Keep eager code light:** the Dashboard imports NO content bank at all (not
  even vocabulary; the main chunk is ~75 kB). Its Spielen tab `React.lazy`-loads
  `features/dashboard/SpielenHub.tsx` (renders the shared `features/welt/NeulandHub`, which imports
  the mission bank), and `GlobalSearch` imports
  `lib/search` dynamically. Don't re-introduce a static import chain from eager code to any content
  bank; a new Dashboard element that needs bank data belongs in a lazy chunk like SpielenHub
  or UebenPath (the s86 Üben Neuland-map, also lazy) (audit: `docs/plans/APP_AUDIT_2026-07-05.md`). (The city strip `CityStrip.tsx` was the prior lazy
  Dashboard element; the s85 Üben/Spielen start-page rework removed it from Heute, component kept.)

Notes: `.npmrc` sets `minimum-release-age` (24h supply-chain cooldown) and
`package-manager-strict`. pnpm blocks dependency build scripts by default (a supply-chain
protection); the build does NOT need any allowlisted scripts — keep it that way.

## Layout (`src/`)
- `data/` — content: `vocabulary.ts`, `redemittel.ts`, `dialogues.ts`, `examSets.ts`, `grammar.ts`, `themes.ts`, `domains.ts`, `collocations.ts`, `provenance.ts`, `canDo.ts` (Can-Do milestones, s47), `texts.ts` (Lesen/Hören texts, s69), `missions.ts` (Neuland game mission bank + chapter/NPC/key-item registries, game G1, s73), `verification.ts` (**generated** Layer C trust map, data strategy s78; per-item tier/confidence, written by `pnpm build:verification`, do not hand-edit)
- `engine/` — logic: `dialogue.ts`, `scoring.ts`, `speech.ts`, `srs.ts` (FSRS-6 spaced repetition since s53; legacy SM-2 fields kept warm for rollback), `pronounce.ts` (tolerant spoken-answer matcher for the speaking block, s56), `quiz.ts`, `session.ts` (composed-session composer, s47; speaking pool added s56 behind the `recognitionEnabled` opt-in), `collection.ts` (redesign Phase 2.4: pure FSRS-stability→Lv 1-5 "collection level" mapping, the stable game contract for loot cards / Sammlung; unit-tested, do not drift the band boundaries)
- `store/` — zustand stores: `useProgressStore`, `useSessionStore`, `useSettingsStore`, `useAuthStore`, `useLibraryScope` (travelling library scope, s47)
- `lib/` — `hooks.ts`, `icons.ts`, `useTheme.ts`, `utils.ts`, `cefr.ts` (shared CEFR scale + level→band defaults), `search.ts` (global `searchAll`, s47), `phase.ts` (per-theme Aufbau/Festigen/Gemischt progression label derived from the existing mastery ratio, redesign Phase 4.5, no new state)
- `features/session/` — `SessionPlayer` + `Session` route wrapper (the composed learning loop, s47); `ReadingBlock.tsx` (Lesen/Hören authentic-input block renderer, s69/4.4)
- `features/library/` — `LibrarySwitcher` + `ScopeChip` (unified Bibliothek chrome, s47)
- `features/help/` — public help/blog section (`/hilfe` + `/hilfe/:slug`, s89): bilingual DE/EN, login-free,
  outside AppShell like `/about`. One content bank `content.ts` (hub + 6 Üben/Spielen articles, closed-union
  blocks) feeds BOTH the lazy React reader (`HelpChrome`/`HelpHub`/`HelpArticle`) AND the build-time
  prerender `scripts/prerender-help.mjs`, which emits a real static HTML file per page (unique meta +
  Article/BreadcrumbList/FAQPage JSON-LD + full text in `#root`) for SEO. When adding/renaming articles,
  update `content.ts` only, then `pnpm build` (regenerates the pages + sitemap). No em dashes.
- `features/collection/Sammlung.tsx` — "Meine Sammlung" bag view (redesign Phase 3.4): every bookmarked word plus every word with a `cardLevel >= 1` (`engine/collection.ts`) as a browsable, level-filterable card grid. Off the nav, reached only via the "Meine Sammlung" entry card on Fortschritt (`/analytics`) and the `/sammlung` deep link, the same pattern as the retired `/quiz`. Lazy route (walks the vocabulary bank).
- `components/city/domain-buildings.tsx` — the six flat SVG domain buildings (redesign Phase 3.1): two-tone + neon marks in the `route-icons.tsx` language, soft corners only (rx on every rect, round-join strokes on pointed shapes), ground-aligned optical sizing, plus the `DOMAIN_BUILDINGS` mastery registry that 3.2's city strip consumes. Lit = bright white windows, unlit = dark shaded openings; the founder rejected gold windows, so **no reward color (Koralle since s133, gold before) in these marks**. Review sheet: `preview/domain-buildings-preview.svg` (the TSX is the geometry source of truth).
- `components/artikel/` — the Artikel-Visuals gender system (s129, plan: `docs/plans/ARTIKEL_VISUALS_PLAN.md`, Phase 1 shipped): `gender.ts` (pure `genderOf`, reads ONLY the authored `article` field, null = no mark), `Wesen.tsx` (the three creature marks: spiky blue der / round rose die / boxy green das; full creature ≥ 24px, solid shape below; geometry from the founder-picked Preview B in `preview/artikel-visuals/gender-doodles-panel.html`), `ArtikelEffect.tsx` (flip/answer reveal: der bursts, die blooms, das shatters; CSS `.artikel-fx-*` in `index.css`, 200ms delay so the effect stays visible after the FlipCard rotation, reduced-motion = fading tint), `ArtikelLegend.tsx` (one-time hint, `artikelLegendDismissed` in `useSettingsStore`). Colors ride the `--der/--die/--das` (+`-bg`) tokens (light + dark, distinct from the `graphPalette.ts` domain hues; never domain/graph colors). Wired into the Theorie Wörter Karten/Tabelle/Liste. **Phase 2 (s129): fused doodles** live in `features/vocabulary/doodles/` (`index.ts` = eager id registry + `hasDoodle`/`loadDoodle`; `art.tsx` = the 20 batch-1 scenes, referents in `--ink`, creature via the exported `WesenBody`, own-gender tokens ONLY, enforced by `tests/doodles.test.ts` incl. a rendered-markup check); the art is a lazy chunk loaded on a registered card's first flip, and the card back shows the doodle above the English. Growing the bank = add the scene in `art.tsx` + the id in `index.ts` + record it in the plan §4. **Phase 3 (s129): reuse** — the reveal effect fires on correct NOUN answers in the composed session (`SessionPlayer` flashcard/typing/speaking grade paths, gender via `vocabById(sourceId)`; the stage block content is `z-10` above the effect so the burst radiates from behind the opaque card, never over the text), and the Wesen mark also appears on the Wörter-graph selected-node card + the legacy `Flashcards` front. Plan fully shipped.
- `types/index.ts` — shared types; `types/game.ts` — the Neuland Mission/Scene schema (game G1, s73)
- `router.tsx`, `App.tsx`, `main.tsx`

## Neuland game layer (G1 shipped s73; **G2 in progress, Kapitel 1 complete**; plan: `docs/plans/GAME_IMPLEMENTATION_PLAN.md`)
**G2 direction (founder, s82):** (1) **scene variety before plumbing**, the next build rungs are the
hotspot tappable-stage layer → Keypad/Automat scene kind (re-skinning mission 1.2 off the dialogueBattle)
→ type-under-timer, THEN the composer / fetch-quest loop / Supabase game-state migration. Reason: all 6
Kapitel-1 missions center on one dialogueBattle, so the Geduld/Mut bars repeat and the boss stops feeling
special. (2) **The external 5–10-learner playtest moves to the END of the full build** (G2 + Kapitel 2–6 +
the G3 city), because the playtest crowd is B2 learners and Kapitel 1 is B1.1–B1.2; the founder is the
per-chapter internal tester until then, and a chapter-select / start-at-your-level entry is on the build
list. Full rationale + per-task model map in the plan's G2 status block.
- The life-story RPG ships INSIDE Genauly as the lazy **`/welt`** route (Beta; entry card on the
  Anwenden hub). **Chapter 1 "Ankommen" is complete (s81): 6 missions 1.1→1.6** (Willkommen,
  Fahrkarten-Automat, SIM-Karte, erster Einkauf, Dach über dem Kopf, Anmeldung boss), chained
  1.2→1.5 via `requiresMissions`; the boss (1.6) is deliberately **ungated** as the standalone
  playtest slice (pinned by a `tests/mission.test.ts` fixture, do not gate it). Scene backdrops
  live in the `SceneSetting` enum (`website`/`wohnung`/`strasse`/`wartezimmer`/`amt`/`terminal`/
  `laden`); every setting except `website` (which renders its own browser chrome) now has a
  code-authored placeholder backdrop from `preview/game-pixel-mockups/welt_assets.py` (s82 added
  `terminal`/`laden`), licensed pixel art still the eventual G2 upgrade. **Every scene shows people
  (s135, founder-caught: empty stages read as broken/missing art).** Character sprites are
  code-authored in `welt_assets.py` (26x32 front NPCs at the locked world scale, the 16-wide player
  back sprite), written to `src/features/welt/assets/`, keyed in `stage.tsx` `NPC_SPRITES` and
  mirrored by the linter's `GAME_SPRITES` (it ERRORS on a `GameNpc.sprite` with no registered art).
  Every dialogue-battle opponent AND the recurring companion Jonas have a `sprite:`; a new NPC must
  ship one. `BattleView` stages opponent-top/player-bottom, and `scenes.tsx` `CutsceneCast` stands
  the player bottom-left on every backdropped cutscene (the `website` prop scene stays
  character-free) plus the speaking NPC (current line's speaker if sprited, else the scene's primary
  sprited NPC). Listening/automat/form/loadout deliberately keep prop/device focus (no person).
  **Missions are data,
  not code:** `src/data/missions.ts` (bank + `chapters`/
  `gameNpcs`/`keyItems` registries) is interpreted by the pure runner `src/engine/mission.ts`
  (immutable transitions emit effects; `MissionPlayer` applies them to the real stores, so the
  game shares ONE progression state with the app: `addXp`, FSRS grades via `reviewVocab`,
  `practiceRedemittel`, key items). Locked success metric: **authoring mission #2 touches only
  data files.** Scene kinds (closed union in `types/game.ts`, mirrored in `lint-content.mjs`):
  `cutscene`, `websiteParody`, `loadout`, `listening`, `dialogueBattle`, `formCloze`. The linter
  enforces mission graph integrity (routing + battle graphs resolve and reach a win, content-bank
  ids exist, required key items are obtainable so a mission can never soft-lock, acyclic mission
  dependencies). `tests/mission.test.ts` pins the runner; extend it when touching
  `engine/mission.ts`.
- **Art/UI: scene-7 palette, PIXEL-GAME chrome, full-screen (s72 blessing as amended s74;
  `docs/DECISIONS.md` "Game art direction" + "Game interaction & pixel-UI rules"):** the in-mission
  game scenes (the full-screen `MissionPlayer`) are light-theme-only (dark deferred, backlog #31),
  brand Nachtblau (`#3D74ED`, the s133 rebrand; was indigo) the single loud accent,
  the Koralle reward tokens only on the victory loot screen. Since s74 the mission player is a FIXED
  full-screen layer (dark surround, edge-to-edge stage) and every in-game surface is
  pixel-styled (2px outlines in `GAME_OUT` #463c44, hard offset shadows, near-square corners,
  RPG name plates); do not reintroduce app-chrome cards inside missions. **The Neuland HUB
  surfaces are theme-aware, NOT the in-mission scenes (s87; restyled in the s88 design review):** the
  Heute → Spielen hub (`features/welt/NeulandHub`, also `/welt`) is a **centered header hoisted OUTSIDE
  the chapter loop** (keep it there: inside the loop it duplicates the
  H1 the moment Kapitel 2 is authored). "Neuland" is centered on the page exactly like Üben's "Lernpfad"
  (same `text-display`/`text-2xl` since the s137 premium pass); the neutral Beta chip (no amber) is a **suffix**, absolutely positioned
  off the h1's right edge and out of flow, so it does NOT shift the word off-center (s90) + a chapter hero with a scrim overlay (Kapitel eyebrow, district
  title, n/6 count, "Mission spielen" CTA) over ONE dense checklist card (done = green check + quiet
  replay icon button, next = the single gradient play control, locked = Lock, boss tag inline, a locked
  next-chapter teaser card instead of a footer sentence). In the Heute embed the hub takes a **`compact`
  prop** (`SpielenHub` passes it, `/welt` does not): the mission checklist is cropped to **exactly THREE
  uniform rows** (`ROW_H`=60, `COMPACT_LIST_H`) and scrolls internally (`no-scrollbar`), and a
  `useLayoutEffect` **auto-centers the next unplayed mission** in that 3-row tile on open; the rest of the
  page is normal flow (`space-y-4`) and fits without scrolling. `/welt` leaves `compact` off and scrolls the
  page normally. The **owned-key-item "Schlüssel-Dokumente" shelf was removed from the hub** (both surfaces,
  s88; it's redundant with the in-mission bag/HUD). The Üben map
  (`features/dashboard/UebenPath`) is a soft illustrated SVG city map with `MAP_LIGHT`/`MAP_DARK`
  palettes (switched by `useIsDark` from `lib/useTheme`); `PixelStage` keeps an opt-in `themed` prop
  (hub only) that dims the bright backdrop art in dark mode. In-mission `MissionPlayer` scenes stay light-only (the
  pixel atoms in `stage.tsx` default to fixed light; only the hub passes `themed`). **World scale is
  locked** at the top of `preview/game-pixel-mockups/welt_assets.py` (standing adult 28-32 px on
  the 240x160 world, chair ~19 px; `proportions-check.png` verifies), and battles stage
  opponent+bar top / player+Mut-bar bottom at ONE human scale (no foreground zoom). Placeholder
  art is code-authored (`welt_assets.py` writes `src/features/welt/assets/`); G2 replaces it
  with licensed packs selected against scene 7 AND the scale table. Renderers live in
  `src/features/welt/`; `/welt` is in the AppShell focus-mode gate. Failure is content, never
  lockout: battle losses route through `onLose` scaffolded-retry scenes; no hearts or energy
  meters, ever. **Interaction-first (founder, s73/s74):** scenes must play like game missions
  with minimal on-screen text. The **bag is in the HUD at all times** (backpack-shaped popup);
  document demands are battle `ask` nodes answered by tapping the item in the bag
  (`handItem`/`admitMissing`), never sentence lists. **English is a rationed resource:** the
  Wörterbuch bag item (3 charges/mission, `MissionRun.dictUses` + `useDictionary`) reveals
  English for the current scene only; there is no always-on E toggle in missions. Battles mix
  tap and typed cloze moves; both bars must stay high and the finish quality pays a victory
  bonus. Waiting beats become gameplay and print-prop mini-quests (Werbung/Anzeige/Flyer) are
  the recurring side-quest pattern; both specced in `GAME_DESIGN.md` §4/§10, built in G2.
  **Activity design source (s74):** new mission exercises draft against
  `docs/strategy/MISSION_ACTIVITY_RESEARCH.md` (the multi-persona research catalog); the
  founder-facing chapter-1 scripts are `docs/strategy/CHAPTER1_GAMEPLAY_DECK.html`.
- **Game progression state** (`missionsDone`, `keyItems` on `useProgressStore`) is **local-only
  for now**: cloudSync's `progress` upsert has a fixed column set and an unknown column fails the
  whole upsert, so syncing game state needs the G2 Supabase migration first.

## UX overhaul (sessions 47–49) — COMPLETE ✅ (plan: `docs/archive/UX_OVERHAUL_PLAN.md`)
The app was migrated from a "drawer of 11 tools" to a **session-first learning loop**, four zones:
**Heute · Bibliothek · Anwenden · Fortschritt** (+ Einstellungen). All five phases (0–5) shipped; the
phase-by-phase record is in **`docs/DECISIONS.md`**. Current-state anchors you must not regress:
- **Session engine:** `engine/session.ts` composer + `SessionPlayer` + `/session`; Schnellwiederholung
  is the ~5-min preset. Focused practice flows through the toolbar's **Üben → composed session**. Block
  kinds: recognition `flashcard` (vocab/Redemittel), `quiz`, `grammar`, `speaking` (mic opt-in, s56),
  `typing` (typed forward recall, s68/4.2), and `reading` (Lesen/Hören authentic-input, s69/4.4:
  `engine/session.ts` Pool 6 emits ~1 per session, `features/session/ReadingBlock.tsx` renders a text +
  its comprehension MCQs, a voicemail plays via TTS when `ttsSupported()`; feeds XP + the session tally,
  **never vocab FSRS**).
  **Bibliothek Üben sets are auto-varied (s131, `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md`, Phases
  0–3 shipped):** `buildScopedSession` (the Bibliothek tab's Üben) no longer stacks flip-cards. It
  interleaves recall cards with exercises **generated from the set's own items, zero new content
  data**: the pool-based `buildPoolQuiz` (the generalized `buildThemeQuiz`, now behavior-identical for
  `/quiz` + composed Pool 2) plus `buildRedemittelQuiz`/`buildListeningQuiz`/`buildOddOneOutQuiz`. New
  quiz kinds: `redemittelCloze`, `listeningCloze` (TTS, gated on `ttsSupported() && speechEnabled`),
  `oddOneOut` (Ausreißer, no sourceId → XP only), plus the noun↔verb match grid (reuses kind
  `"matching"`) and a **typed-cloze** `typing` variant (`cloze` field, graduated words only). Rules to
  keep: answers/sourceIds derive only from set items (distractor *strings* may come from the full
  bank); the FSRS write is guarded to ids that resolve in the vocab bank (collocation/redemittel
  questions award XP + combo only, never SRS under `c_*`/`r_*`); each item caps at 2 appearances
  (`capBySource`); `avoidRuns` breaks any 3-in-a-row same-kind. Gauge whether variety is exhausted with
  `pnpm report:exercise-coverage` (theme-level already 20/20 🟢; residual is word-level content polish).
  **Üben is scoped to where the learner is (s101, Üben-refinements plan item 1):** `Session.tsx` parses
  `?grammar=` (Grammatik lesson pins its topic via the `grammarTopicId` opt, Pool 3 uses 4 drills of
  that topic), `?cat=` (Redemittel category), and the Bibliothek facets `?sub=`/`?cefr=`/`?sector=`
  (the pure `libraryFocus` helper in `engine/session.ts` maps them onto the existing mission-style
  `focus`, so the session leads with that narrowed slice; `undefined` when nothing narrows past the
  theme, so a bare-theme Üben is unchanged). Priority mission > grammar > libraryFocus; GrammarHub +
  bare theme stay generic. The **speaking block has an "Anzeigen" give-up** (calls `evaluate("")`:
  reveals the answer, grades FSRS 0, unlocks Weiter), mirroring the typed block, so a learner who does
  not know a word can always move on.
  **Focus mode (redesign Phase 2.1):** `SessionPlayer` sets `useSessionStore.focusMode` while a block
  is on screen, and `AppShell` hides all chrome (header, bottom bar, sidebar) on `/session` + `/revision`
  so the session plays as a full-screen stage; chrome returns on the end screen. The locked bottom-bar
  internals are untouched (just not mounted in focus mode). Reward tokens (`--reward`/`--reward-bg`,
  Tailwind `reward`/`reward-bg`; **Koralle since the s133 rebrand**, gold before) are reserved for
  loot / combo / streak moments only (the domain-building marks tried gold windows and the founder
  rejected them; buildings light up white instead). Since s133 the header streak pill + the
  Fortschritt "Aktuelle Serie" StatCard ride them too (streak = celebration, not warning).
- **Global search:** `lib/search.ts` `searchAll` + `GlobalSearch` (header icon / Sidebar / ⌘K).
- **Bibliothek hub:** single `/library?tab=woerter|kollokationen|redemittel|grammatik`; old routes
  (`/vocabulary`, `/collocations`, `/redemittel`, `/grammar`) redirect in (query params preserved).
  Lists default to the learner's CEFR band + 1 (`defaultVisibleBands`).
  **Bibliothek views (s91, from the founder's hand-drawn mockup):** the three browse tabs each have a
  **view switcher** (`features/shared/ViewSwitcher.tsx`, `?view=`, `karten` default kept out of the URL):
  Wörter = Tabelle · Graph · Karten · Liste, Kollokationen = Tabelle · Graph · Karten · Liste (graph
  added s118), Redemittel = Tabelle · Karten · Liste,
  Grammatik = Karten · Liste (added s93, see below). Tabelle = generic sortable `features/shared/DataTable.tsx` (German collation,
  missing values sink, paged rows; sort-header buttons need their own `uppercase`, Tailwind preflight
  resets it on buttons) with per-tab columns + compact lists in `vocabulary/VocabViews.tsx` /
  `collocations/CollocationViews.tsx` / `redemittel/RedemittelViews.tsx`. **Wörter Graph** =
  Obsidian-style force-directed canvas of the CURRENTLY FILTERED list (`vocabulary/WordGraph.tsx` +
  pure builder `vocabulary/wordGraph.ts`, pinned by `tests/wordgraph.test.ts`): node radius = wordfreq
  Zipf (no corpus evidence = min radius, never a fake claim), **color = TWO life areas** (founder
  2026-07-19: Berufsleben/professional = the `beruf` domain, brand Nachtblau; Privatleben/personal =
  every other domain, teal; helpers `lifeAreaOf`/`lifeAreaColor`/`LIFE_AREAS` in `lib/graphPalette.ts`;
  the legend + its filter collapse to these two), edges ONLY from
  authored sources (`related` terms resolved to bank entries; collocations whose noun AND verb both
  resolve; unresolvable related terms are dropped, founder-confirmed 2026-07-11). **Kollokationen Graph
  (s118)** = a **bipartite noun ↔ verb** canvas of the filtered collocation list
  (`collocations/CollocationGraph.tsx` + pure builder `collocations/collocationGraph.ts`, pinned by
  `tests/collocationGraph.test.ts`): every distinct noun/verb is a node, every collocation an edge, so
  hub verbs (machen/treffen) surface naturally. Node size = **degree** (frequency is keyed by content_id,
  not surface form), **color = the TWO life areas** (professional vs personal, `lifeAreaColor`, same as
  the Wörter graph, founder 2026-07-19); nodes are pulled to per-**topic** centroids
  to form glowing **islands**, tuned to look striking fully zoomed out (fit-to-all on open, cached
  radial glow sprites, curved gradient-tinted edges, vignette background, nouns = solid discs / verbs =
  rings). **Layout is the founder-picked "Am engsten" recipe (2026-07-20, supersedes the s132 "by
  topic + tighter" numbers):** per-topic centroids on a ring (`118 + N*26`), strong centroid pull
  (forceX/Y `0.72`), high link tension (`0.38`), weak short-range repulsion (`-34`, distanceMax `200`),
  tight collision (`r+1.5`), so each topic contracts into a very compact island rather than one central
  tangle. Chosen from `preview/collocation-graph-tightness.html` (generator
  `preview/gen-collocation-graph-tightness.mjs` renders the real bank at three tightness settings).
  The palette is shared via `lib/graphPalette.ts`; the selected-node card is bipartite
  (tap a noun → its verbs, tap a verb → its nouns) and has a **shape toggle beside its close button**
  (s118): the card is either a full-width bar along the bottom (`horizontal`, default) or a full-height
  panel down the right (`vertical`); toggling re-fits the constellation into the area the card leaves
  free via `fitToRect`/`freeRect` (`cardExtent` keeps the fit math in lockstep with the card's CSS
  size). **Nodes are draggable and pin where dropped** (`fx`/`fy` kept on release, since the strong
  theme-centroid force would otherwise snap them back). Canvas **labels are collision-culled onto
  translucent pills** (selected-first, then by degree) when NOT focused, so they stay legible instead of
  overlapping. The d3-force dep rides ONLY in the two lazy graph chunks (shared `vendor-misc`,
  React.lazy); main chunk stays ~80 kB.
  **Graph selection / focus model (s125, IDENTICAL in both graphs; `WordGraph.tsx` +
  `CollocationGraph.tsx`, the old Kollokationen `READABLE_K`/`focusNode` is superseded):** selecting a
  node animates its connections into a **focused arrangement** and frames it at a readable zoom;
  deselecting (empty-space tap or card ✕) animates every displaced node back to its stored **home**.
  Mechanism: `homePosRef` stores each moved node's true home; `focusRafRef` runs an easeOut tween that
  pins moved nodes (`fx/fy`) so the sim can't fight it; on graph rebuild/unmount the HOME positions (not
  the transient focus spots) are cached to `posRef`. Placement rules (all founder-iterated): each
  connection **keeps its direction** (angle), but (1) `spreadAngles()` fans clustered angles toward even
  slots preserving circular ORDER so a one-sided hub still uses the left/right space; (2) each lands on an
  **ellipse sized to fill ~82% of the free area** at `TARGET_FOCUS_K` (2.3), per-axis rx/ry, radial
  factor floored at 0.72 so even a single connection spreads out (never cramped at center); (3)
  `relaxLabels` (AABB, selected word immovable) separates nodes by their **label box** (measured width +
  the line under the dot) and `frameFocus` pads its bounds by label extents, so no label clips; (4) while
  focused the draw pass does **not** cull labels, so no connection word can vanish. The fit-to-screen
  button toggles fit-all ↔ zoom into a **random well-connected node** (weighted by area, excludes the
  current selection) in BOTH graphs; **every fit-button view switch animates** (`fitToNodes`/`fitToRect`
  return the transform as `computeFit`/`computeFitRect`, tweened via the focus tween). The Kollokationen
  card floats off the canvas edges by the same `bottom-3/left-3/right-3` gap the Wörter card uses. All
  tweens respect `prefers-reduced-motion`. (The graphs are a PWA-cached surface: if a change doesn't show
  after deploy, the service worker is serving a stale build; hard-refresh.)
  **Desktop filter rail (s91):** on lg+ the browse tabs are an **explicit 2-col × 2-row grid**
  (`lg:grid-cols-[minmax(0,1fr)_16rem]`, `lg:gap-y-4 lg:space-y-0`): the LibrarySwitcher tabs +
  view-switcher meta row sit in **row 1 / col 1 (content-column width, NOT full width)**, and the content
  (`row-start-2 col-start-1`) + the persistent right rail (`col-start-2 row-start-2`) share row 2, so the
  **filter tile starts level with the first content card** while the tabs stay at content width (founder
  follow-up: measured rail-top = card-top; tabs are NOT stretched over the rail column). The rail is
  `features/shared/FilterRail.tsx`,
  a **collapsible tile** (founder follow-up s91) that is now **the single filter surface on BOTH
  breakpoints** (the old mobile BrowseToolbar + FacetSheet were retired on these three pages): the WHOLE
  tile carries a **grey shade** (`bg-muted`, `border-border`; the "Filter" label keeps the brand accent);
  the header row ("Filter" + active-count badge + chevron) expands/collapses the panel. On desktop the
  aside is itself the **capped scroll container** (`lg:overflow-y-auto` + `lg:max-h-[calc(100vh-22rem)]` on
  the page className) with the header `lg:sticky lg:top-0` and the **Üben footer `lg:sticky lg:bottom-0`**,
  so the middle scrolls and **Üben stays on screen at every scroll position** (verified across 800/900/1080
  viewport heights). **On mobile the same tile carries the Üben footer** and is a **grid child** (not nested
  in the header column, so its sticky containing block spans the card list) pinned just below the app header
  (`sticky top-[calc(4rem_+_env(safe-area-inset-top))] z-10 max-h-[70dvh] lg:hidden`) and capped, so the
  tile — and the Üben button inside it — stays visible while scrolling (founder: Üben must be part of the
  tile on mobile, not a separate floating button; the earlier `StickyUebenBar` was removed). **Each section
  has a pin** (`Pin` icon in the
  section header): pinned sections stay visible while collapsed. Pins persist per tab in localStorage
  (`b2beruf.railPins`, scoped by the `pinScope` prop; deliberately NOT in the synced settings store).
  Inside: Suche (shared
  debounced `SearchField.tsx`, extracted from BrowseToolbar), the primary scope as a **`Select` dropdown**
  (Thema Domain-grouped; Kategorie on Redemittel), then every
  facet as always-visible pills with live counts (immediate commit, no draft/apply). **One
  `filterRailProps` object feeds two `<FilterRail>` instances** (both carry the Üben footer): a desktop one
  (grid `col-start-2 row-start-2`, `hidden lg:block`, sticky, default-open) and a mobile one (`lg:hidden`,
  a grid child between the header column and the content, `defaultOpen={false}`, sticky-pinned below the
  app header). The
  **LibrarySwitcher tabs + the view-switcher meta row stay at the content-column width** (grid row 1 / col
  1, NOT full width, founder follow-up), while the filter tile lines up with the content cards (grid
  row 2). On mobile the meta row also shows the Gespeichert toggle (Wörter); Redemittel Register is now a
  rail facet (the old mobile register chips are gone). The meta row + the graph legend are **centered on
  mobile** (`justify-center lg:justify-start`). In the graph view both counts sit at the bottom of the
  canvas ("n Wörter · m Verbindungen") and the meta-row word count is hidden; other views keep the count in
  the meta row. (`BrowseToolbar`/`FacetSheet` stay in the repo but are no longer used by these three pages.)
  **Bibliothek s92 update (14 founder rounds, PRs #442–#455; supersedes several s91 specifics above):**
  (1) **Search lives OUTSIDE the filter tile.** A search icon on the toolbar (right of the Wörter bookmark,
  icon-only) toggles a transient full-width `SearchField` (autofocus); opening/closing never touches filter
  state, closing clears. Backed by **`src/lib/fuzzy.ts`** (`fuzzyMatch`/`foldText`: umlaut/case-insensitive,
  token-order-independent, Damerau edit-1 for 4+ char tokens), pinned by `tests/fuzzy.test.ts`. Wörter search
  also appends a match's **connections** (its `related` terms that resolve to in-scope entries). (2) **The
  HubHero page headers were dropped from all four Bibliothek tabs; `LibrarySwitcher` IS the page header** —
  a lifted `shadow-soft` bar, **active tab bold + brand** (reads as the section title), quiet inactive, with
  a **sliding white pill** (reduced-motion safe). `text-sm` on ALL breakpoints (an earlier
  `sm:text-base` was reverted as oversized). **`ViewSwitcher` got the same sliding pill** (`h-10`). (3)
  **Sliding-pill mechanism (s114, supersedes the earlier framer `layoutId` approach):** both switchers use
  the shared **`src/features/shared/useSlidingPill.ts`** hook — ONE always-mounted pill measured to the
  active segment via `offsetLeft`/`offsetWidth` (`useLayoutEffect` pre-paint + `ResizeObserver`), animating
  only `x`/`width` on a compositor-friendly transform. This replaced framer's `layoutId` shared-layout
  crossfade, which mounted/unmounted a pill per switch and stuttered against the trainer re-render. Keep
  the single-pill pattern; do NOT reintroduce the per-segment `layoutId` crossfade.
  **Mobile toolbar is a full-width `justify-between` row** `[Filter icon · ViewSwitcher · bookmark/search]`;
  the Filter icon is a page-owned toggle and the filter tile is a body-only **`FilterRail` `layout="panel"`**
  that slides open/closed via **AnimatePresence** (height/opacity). Since s132 the panel is moved OUT of the
  sticky browse header into normal flow (so it scrolls away, not sticks) and is **capped at `max-h-[55dvh]`
  as a flex column** (fixed header + one internal `overflow-y-auto` scroll region) so it never swallows the
  screen. The desktop persistent rail (`layout` default `"rail"`) is unchanged. (4) **Sub-themes are a filter dropdown, not a page:** the full-page
  `SubThemePicker` interstitial is gone; `FilterRail` gained an optional **`secondary`** scope ("Unterthema",
  per-sub-theme counts + "Gesamtes Thema") under Thema when the theme has sub-themes (Wörter + Kollokationen).
  `SubThemePicker` is now unused (kept in repo). (5) **Filter tile controls are icons:** a reset (RotateCcw,
  disabled when nothing to clear) + close (X, mobile panel only) in the top-right; the word "Zurücksetzen"
  button was removed. **Section pins show on BOTH breakpoints** again. (6) **Üben + word count are a sticky
  bottom action bar on mobile** (full-bleed, `sticky bottom-[nav]`, backdrop-blur, after the content so the
  list scrolls above them); desktop keeps Üben/count in the rail. `test:unit` 116/116; main chunk ~73 kB.
  **Grammatik redesign (s93):** the fourth tab now shares the SAME s92 skeleton (toolbar with mobile
  filter toggle + Karten/Liste ViewSwitcher + transient fuzzy search; `FilterRail` on both breakpoints
  with **Gruppe** as the primary dropdown and **Stufe (CEFR)** as the facet, `grammarFacets()` in
  `lib/facets.ts`; Üben in the rail footer / sticky mobile bar; params `?group=`/`?cefr=`/`?view=`/
  `?topic=` all URL-persisted). Feature split: `grammar/grammarMeta.ts` (group labels/icons, the
  B2-marker `groupOrder`, `orderedGrammar` spine, `topicRank`), `grammar/GrammarViews.tsx` (Karten cards
  with emerald group tile + priority-rank chip + mono pattern strip, compact Liste rows), and
  `grammar/GrammarTopicView.tsx`, the **lesson page**: the LibrarySwitcher tabs stay on top (founder
  follow-up: a lesson must keep the section navigation), then a minimal hero (group tile + German title
  ONLY; founder follow-ups removed the English eyebrow, the German purpose line, and the meta badge row
  as redundant: the topic is described once, in the card below), the emerald **Muster** formula panel FIRST
  (the authored " · "-separated `pattern` variants render ONE PER ROW with dot markers, never as one
  wrapped line) with the explanation rendered as sentence bullets, first point up front and the rest
  behind a "Mehr anzeigen" expander pinned to the tile's BOTTOM-RIGHT corner. **The lesson is
  German-first with hold-to-peek English (founder s93):** `explanationDe`/`pitfallsDe` show by default,
  and a small **EN chip** (`grammar/EnPeek.tsx`, top-right of the paragraph, NOT the tile) reveals the
  English only while pressed (pointer or Space/Enter held; never a sticky toggle). The same peek pattern
  covers example glosses (per-card chip beside the SpeakButton) and drill glosses (`glossPeek` on
  GrammarDrillCard, lesson only). Then Beispiele, Typische
  Fehler, numbered Übungen with a **live progress bar**, a **completion panel** ("Thema abgeschlossen ·
  k von n richtig" + "Weiter: <next>") and prev/next cards along the priority spine ("Thema n von 10"),
  so a time-poor learner is always handed the next-biggest B2 lever. **Üben is on the lesson too**
  (inline gradient button on desktop, sticky bottom action bar above the nav on mobile), replacing the
  old "Wissen im Quiz testen" `/quiz` CTA (the retired `/quiz` route stays reachable via practiceAreas,
  see below). Emerald stays the quiet Grammatik accent (icon tiles/Muster only); brand Nachtblau stays the
  action color. **Desktop the Muster panel and the explanation sit side by side** (s103,
  `CardContent` gains `lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`; mobile keeps the s93 stacked
  order untouched).
  **FilterRail + graph counts (s103, Üben-refinements plan items 2/4/5, supersedes the s91/s92 grey-tile
  language above):** the tile (both the desktop rail and the mobile panel) is now a standard content
  card, `bg-surface` + visible `border-border` + `shadow-soft`, not the old flat `bg-border` slab the
  founder called ugly; unselected facet pills are `bg-muted` (not stark white) and the scope section
  labels (Branche/Thema/Unterthema/Kategorie/Gruppe) share the same uppercase eyebrow style as the
  facets. The header is a toggle (Filter + active-count badge + chevron) plus a permanent reset icon
  beside it (no longer hidden inside an expanded-only first row). **The result count sits beside Üben
  in every state** (open, collapsed, and the mobile sticky bar), not just collapsed. The **Wörter graph
  view's word count moved off the canvas to sit beside Üben like every other view**; the canvas legend
  keeps only the connections count ("m Verbindungen").
  **s104 Bibliothek round (founder, supersedes several s102/s103 specifics above):** (1) **Scope
  dropdowns are MULTI-select** (Branche/Thema/Unterthema/Kategorie/Gruppe): `RailPrimary` now carries
  `values: string[]` + `onChange(values)`, rendered by a hand-built checkbox popover `ScopeMultiSelect`
  in `FilterRail.tsx` (Radix `Select` is single-value only). Each rides a comma-list URL param
  (empty/absent = "everything"); OR-within, same as a facet. `matchesSector`/`sectorFirst`
  (`lib/facets.ts`) + `themeGroupsForMode` (`lib/themeGroups.ts`) now take arrays. Sub-theme drill-down
  + the travelling `useLibraryScope` only apply when EXACTLY ONE Thema is active; `startSession`
  collapses multi-Thema/Unterthema to the first value (the composer biases ONE session) but forwards
  every Branche (`libraryFocus` sector is a list). This reverses the s84 "primary dropdown = single
  select" lock (see DECISIONS.md s104). (2) **Reset clears the scope dropdowns too** (was facet-only) and
  the active-count badge counts scopes + facets. (3) **The filter tile is subtle grey again** (`bg-muted`,
  the ViewSwitcher-track shade, NOT the s103 `bg-surface`): the founder found white-on-white too low
  contrast. Controls INSIDE stay white, so they pop, unselected facet pills went back to `bg-surface`,
  scope dropdown triggers are `bg-surface`. (4) **The desktop rail fills the viewport vertically**
  (`lg:max-h-[calc(100vh-7rem)]`, was `-22rem`) with a **slim visible scrollbar** (`.slim-scrollbar` in
  `index.css`, replaced `no-scrollbar`) once the filters overflow. (5) **Dropdown "Alle X" numbers show
  the OPTION count** (15 Branchen / 15 Themen), not the item total, in the muted pill-number format. (6)
  **Desktop search grows inline in the toolbar row** (`hidden lg:block lg:flex-1`, no third line); mobile
  keeps its own second row (`lg:hidden`). (7) **Wortart moved up** (right after Thema/Unterthema) and
  **Stufe (CEFR) moved to the END** of the Wörter facet order (`VocabularyTrainer` pulls CEFR out of the
  registry order and appends it after Lernstand). (8) **Redemittel: the per-category card SECTION HEADERS
  were removed** (they read as page headers, against the tab design language) → a flat card grid like
  Wörter/Kollokationen; **Kategorie became a multi-select PILL facet** (`CATEGORY_FACET` in
  `RedemittelTrainer.tsx`, 16 group-name pills), no longer a scope dropdown; `?cat=`/`?register=` both
  ride the facet selection. (9) **Grammatik hub cards cleaned up** (`GrammarViews.tsx`): the card pattern
  strip shows ONE variant (`pattern.split(" · ")[0]`) in the emerald Muster tint instead of a truncated
  " · "-joined fragment, bigger icon tile; drill options (`GrammarDrillCard.tsx`) got a `bg-muted/50` idle
  fill so they read as tappable answers, not disabled fields.
- **Anwenden hub:** `/anwenden`, 3 cards → Sprechen/Schreiben/Prüfung.
- **Schreiben hub (`/writing`; restyled s149 as a Bibliothek EXTENSION, founder-approved previews in
  `preview/schreiben-bibliothek-extension*.html` + a 13-point founder fix round):** the 4-segment
  sliding-pill switcher **Fokus · Kurz · Lang · Verlauf** IS the page header (s92 rule: no eyebrow/H1;
  Verlauf rides `?mode=verlauf`; capped `lg:max-w-xl` + centered on desktop, four short labels at full
  column width read oversized), over the standard `[minmax(0,1fr)_16rem]` content+rail grid.
  **Kurz/Lang draw a RANDOM Aufgabe:** `src/data/writingPrompts.ts` holds per-theme POOLS of task
  OBJECTS `{ text, sub?, sectors? }` (316 tasks since the s149 harmonization round; the whole pool
  rides the theme's one `wp_<themeId>` provenance row, the mission pattern). `sub` = a declared
  sub-theme slug (coverage invariant: every sub-theme of the 12 sub-themed themes has ≥2 short + ≥2
  long tagged tasks); `sectors` = Branche tags with the Bibliothek **untagged-=-universal draw
  rule** (a selected Branche prefers its tagged tasks, else falls back to untagged, never empty;
  wave 1 = it/care/construction/transport/hospitality at 6 tasks each, grow by tagging). The linter
  validates text/sub/sectors per task. The dice on the Aufgabe card (standard 40px icon button,
  half-spin per roll) re-rolls within the current scope (keeps typed text, clears a stale result);
  scope changes (`?sub=`/`?sector=`; theme switch clears sub, Branche travels) reset the draft;
  drafts carry `promptIndex` so the OAuth resume restores the exact task. The Aufgabe card has NO
  theme icon (founder), a **brand-colored bold** "Aufgabe: <Thema>" eyebrow + one Ziel line (the
  editor word count does NOT repeat the Ziel range), and the AI disclaimer is a **standalone line
  below the editor/sentence card**, never inside it. **AI backend (s151):** the Fokus Satzlabor
  (`check-sentence`/`transform-sentence`) AND the Kurz/Lang writing coach (`evaluate-writing`) share
  ONE provider cascade in their Supabase Edge Functions: **Gemini 2.5 Flash (free, recorded $0) →
  Claude Sonnet 5 → GPT-5**, where Sonnet leads the paid backup until month-to-date Claude spend
  across BOTH `sentence_ai_ops` + `writing_evaluations` reaches `CLAUDE_BUDGET_USD` ($2), then GPT-5
  leads; the global `MONTHLY_SPEND_CAP_USD` ($5, shared `ai_usage` fuse) bounds all three combined.
  Anthropic calls send no `temperature` + `thinking: disabled` (Sonnet 5 family), Gemini forces JSON
  output + a generous token budget, GPT-5 uses `max_completion_tokens` + `reasoning_effort: minimal`.
  Model ids + the $2 threshold are env-overridable (`GEMINI_MODEL`, `CHECK_MODEL`/`TRANSFORM_MODEL`/
  `EVAL_MODEL`, `OPENAI_MODEL`, `CLAUDE_BUDGET_USD`); flip `GEMINI_MODEL` to change the primary. The
  German-grammar prompts are hardened (copula sein+Adjektiv is Aktiv, never Passiv; `bereits_zielform`
  needs voice AND tense; strict JSON-only), and `normalizeDetected` never marks a detected
  Zustandspassiv as the Passiv pill. The two Art. 50 disclaimers + `/privacy` (DE+EN) name all three
  providers routing-neutrally. **Fokus (s151):** the send-to-AI note + the old "KI-generierte
  Umformung" footer are ONE combined, centered note in normal flow below the content (a first pass
  bottom-pinned it to align with the "Mit KI gebaut · Feedback" pill; the founder reverted that). **Eyebrow rule (s149): card-title eyebrows =
  bold `text-primary` ("Aufgabe:", "Dein Satz", the transform label); inner section labels stay
  muted.** **`WritingRail` = "Aufgabe wählen": a light HIMMELBLAU tile** (`bg-accent/20` +
  `border-accent/50`, dark `bg-accent/10` + `border-accent/25`; NOT grey) with a header reset icon
  and the Bibliothek scope hierarchy **Branche → Thema → Unterthema** as single-select **dropdowns**
  (grouped listbox popovers, internal scroll, live counts, zero-yield options greyed; Unterthema
  only when the theme has sub-themes; Thema groups = Domain categorization with **gesundheit folded
  into Alltag**, founder rule). No overflow clipping on that tile (the popovers must escape); the
  mobile panel animates via fade/slide, not height collapse, for the same reason. Fokus
  `GrammarRail` is the SAME Himmelblau tile (s149; was grey): detected form = **white pill + green
  `bg-success` dot** (never a blue fill/ring), target solid primary, pre-correction all idle, header
  reset icon (back to the detected form), hint breaks after "Grüner Punkt
  = erkannte Form.". The Fokus transform box is a **white card** (never a grey wash) with a bold
  colored "Hinweis:" label (no i icon) and "KI-generierte Umformung" centered at the card bottom.
  **Mobile = the Bibliothek pattern:** a toolbar button toggles the collapsible panel
  (`layout="panel"`, no floating chip rows), Kurz/Lang get a sticky bottom Auswerten action bar and
  Fokus a sticky Korrigieren bar (pre-correction). **Verlauf renders inside the same content grid column** as the other tabs (never full
  width) and its empty state deep-links into Kurz. `WritingHistory` shows only the learner's text
  (the exact prompt behind an old entry is not recoverable from theme+length since pools).
  **Fokus correction card (s150 redesign, `FokusTrainer.tsx`, founder-approved via the
  `preview/schreiben-design-review.html` artifact):** the corrected-state card dropped the noisy
  struck-through original + "· n Änderungen" counter + in-place `<mark>` highlight + "Was ich geändert
  habe" list. Now: the "Dein Satz" eyebrow shares its row with an **Original/Korrigiert view toggle**
  (default Korrigiert; resets to Korrigiert on each new correction), Original marks the wrong words
  with `.fx-mark-coral` (`--reward`) and Korrigiert marks the fixes with `.fx-mark-green` (`--success`)
  — calm underlines, not fills (`index.css` `@layer utilities`). Below sits a row of **Himmelblau fix
  tiles** (light `bg-accent/30 border-accent/70`, `dark:bg-accent/[0.18] dark:border-accent/[0.45]`),
  each = a heuristic learning-category eyebrow (`text-accent-ink`; Rechtschreibung / Umlaut /
  Groß-/Kleinschreibung / Grammatik / Ergänzung / Streichung, from `classifyChange` in `wordDiff.ts`)
  + the `old → new` edit, with **Neuer Satz** as an outline button on that same row (`ml-auto
  self-end`, wraps only if needed) — so Neuer Satz is NOT on the mobile toolbar or the desktop rail
  anymore. `wordDiff.diffWords` returns `tokens` + `originalTokens` (both flagged) + `changes`
  (each with a `category`); `tests/wordDiff.test.ts` pins it.
- **Umlaut keys (`src/features/writing/UmlautKeys.tsx`, s150):** a reusable insert bar (ä ö ü ß Ä Ö Ü)
  for learners on non-German keyboards. Inserts at the caret (over a selection too), neutral
  `bg-surface` at rest, flashes Himmelblau on press, keys ~24px. Wired into the Fokus input footer
  (shares the desktop row with Korrigieren) and the Kurz/Lang guided editor (`GuidedWritingTrainer.tsx`,
  in the word-count row). Takes `{ textareaRef, value, onChange }`.
- **Fortschritt + Can-Do:** `canDo.ts` bank (52 milestones) drives the Fortschritt
  lead section, a weakest-band diagnose card, and the relocated theme-mastery grid.
- **Nav zones (labels updated s105, 2026-07-13; `/library` reverted to Bibliothek s141; Schreiben added
  s147):** the tabs are now **Praktisch** (`/`, was "Heute"), **Bibliothek** (`/library`; renamed to
  "Theorie" in s105, reverted back to "Bibliothek" by founder in s141), **Schreiben** (`/writing`, added
  as a dedicated item s147, rose accent, pencil mark), **Fortschritt** (`/analytics`), + **Einstellungen**.
  **Anwenden is HIDDEN from the nav** (founder, demo): removed from `navItems`, but `/anwenden` stays
  mounted in `router.tsx` so `/welt` + deep links still resolve — re-add the `navItems` row to restore it.
  `BottomTabBar` `CONTENT` is now `["/library", "/writing", "/analytics"]` and `DEFAULT_PINNED_TABS` is
  `["/", "/library", "/writing", "/analytics"]` (Home + 3 middle + fixed Einstellungen = the 5 locked
  slots). The `/writing` → `/anwenden` `ROUTE_SUCCESSOR` remap was removed (it is a top-level route again).
  The Praktisch route mark is a **dumbbell** (`route-icons.tsx`), not a house. The s26–28 bottom-bar
  **mechanics stay locked**.
- **AI-disclaimer feedback button (s105):** `components/layout/FeedbackButton.tsx` renders a subtle fixed
  "Mit KI gebaut · Feedback" pill on every non-focus page (mounted in `AppShell`). It opens a dialog →
  `lib/feedback.ts` `submitFeedback` → the `submit-feedback` Edge Function (`verify_jwt=false`,
  anonymous-OK) which stores a `public.feedback` row (migration 0006) AND emails the founder via Resend.
  Founder deploy steps in `docs/plans/PHASE2_SETUP.md`.
- **Facet registry:** `src/lib/facets.ts` (`vocab`/`collocation`/`redemittel`/`grammar` facets +
  `*_FACET_IDS`) is the single source; the **≤12-option rule** (`MAX_FACET_OPTIONS`) is codified there.
- **Standalone `/quiz` status:** off the nav ("retired") but still a **live route**, reached via the
  `practiceAreas` deep link (the Grammatik lesson's "Wissen im Quiz testen" CTA was replaced by the
  standard Üben in s93). A hard redirect was deliberately NOT
  added so that intent keeps working. The Vokabeltrainer's in-page Karteikarten/Quiz tabs are hidden
  behind the reversible `SHOW_PRACTICE_TABS = false` flag; `Flashcards`/`VocabQuiz` stay in the repo
  (used by the session engine).

## Founder design preferences (UI; distilled s149, full record in `docs/DECISIONS.md`)
Apply these to ANY new or restyled surface, before the founder has to ask:
- **Extend the existing design system, never invent a parallel style:** reuse the Bibliothek
  building blocks (sliding-pill switcher AS the page header, FilterRail tile language, scope
  dropdowns, facet pills, sticky mobile action bars) and the one categorization hierarchy
  (Branche → Thema → Unterthema; learner-facing daily-life groupings fold Gesundheit into Alltag).
- **Previews first for design work:** founder-reviewable `preview/*.html` mockups from the real
  tokens, iterate on the feedback list, then implement.
- **No redundancy:** each fact appears once (no repeated ranges/labels), no explanatory filler
  lines in the UI; compact chrome (content-sized toggles, 40px icon buttons).
- **Dropdowns over pill walls** for long scope lists; rails never outgrow their tile (internal
  scrolling).
- **Controls always visibly act:** no disabled-at-default buttons that read as broken (reset =
  clear + fresh draw); zero-yield options grey out with honest counts.
- **Color language:** Himmelblau accent tiles for selection rails (not grey); content on white
  cards (no grey washes); card-title eyebrows bold brand blue, inner labels muted; a bold colored
  word label ("Hinweis:") over an i icon; green dot = detected fact; AI/legal disclaimers as
  standalone lines below cards.
- **Consistency + motion:** primary actions in the same place across sibling modes (mobile sticky
  bars); subtle micro-motion in one timing family (directional tab slides, 0.12-0.18s, reduced-
  motion safe).

## Writing style (applies to ALL user-facing copy)
- **Avoid em dashes (`—`).** The founder dislikes them; they are an overused "AI" tell. Use them
  only when genuinely essential (and that is rare). For everything else, **rewrite or paraphrase**
  the sentence: split it into two with a period, or use a comma, colon, parentheses, or "so"/"and".
  Examples: "Build natural word order — a B2 marker." → "Build natural word order, a B2 marker.";
  "Noch keine Daten — reiche Text ein." → "Noch keine Daten. Reiche Text ein." This applies to
  every visible string: UI labels, onboarding/landing copy, content data (`src/data/*`), grammar
  explanations/glosses, toasts, and meta/manifest text. (The en dash `–` and bullet `·` are fine.)
- This rule is for all AI tools building this app. Prefer plain, natural punctuation over dashes.
- **Microcopy budget (redesign Phase 1.5, 2026-07-05).** Interface copy is chrome, not content:
  keep it out of the way. A section/page/hub **eyebrow ≤ 2 words**, a **title ≤ 5 words**, and
  **no section-description sentence** under a header (the shared `SectionHeading`/`HubHero`
  `description` prop stays unset on hub/section headers). The German learning content itself is
  display-size and exempt. Functional strings that guide the user still stand: `EmptyState`
  descriptions, form helper/error text, and the dynamic session preview line are not "section
  descriptions" and are kept. When adding a new hub/section header, do not reintroduce a filler
  subtitle sentence.

## Content conventions
- **Themes** (20 total since s126): ten **workplace** topics (meetings, scheduling, logistics, customer, conflict, project, technology, sustainability, safety, travel) plus **ten daily-life packs**. Original five: `behoerde` (Behörden & Ämter, `alltag`, added 2026-06-20), `arzt` (Arzt & Gesundheit, `gesundheit`, sub-themes termin/symptome/behandlung/versicherung), `wohnen` (Wohnen & Zuhause, `alltag`, sub-themes suche/vertrag/nebenkosten/probleme), `bank` (Bank & Finanzen, `alltag`, sub-themes konto/zahlung/karte/finanzen), and `bildung` (Bildung & Sprache, `bildung`, sub-themes sprachkurs/anerkennung/pruefung/weiterbildung). Five NEW everyday-life `alltag` themes added in the **daily-life scale-up Phase B** (s126, 2026-07-17): `einkaufen` (Einkaufen & Geschäfte, sub-themes supermarkt/kleidung/umtausch/online, icon ShoppingCart), `essen` (Essen & Restaurant, restaurant/bestellen/bezahlen/kochen, UtensilsCrossed), `mobilitaet` (Mobilität & Verkehr, oepnv/ticket/auto/wegbeschreibung, Bus), `freizeit` (Freizeit & Soziales, hobbys/verabredung/smalltalk/veranstaltung, PartyPopper), and `digitales` (Handy, Internet & Digitales, vertrag/internet/geraete/konto, Smartphone) — each a full 49-vocab / 40-collocation / 2-dialogue / 2-text / 3-Can-Do / 1-writing-prompt pack. The `bildung` pack filled the last empty domain in s75, so **all five domains are now populated** (the `beruf` and `arbeitswelt` work domains were merged into a single `beruf` in s121, 2026-07-14: the split read as redundant near-synonyms to learners and their graph colors were near-identical; the 10 workplace themes now all carry `domain: "beruf"`). The city-strip domain buildings (`components/city/domain-buildings.tsx`) map `arzt`→arztpraxis (via `gesundheit`), `wohnen`→wohnhaus, `bank`→bank (explicit `themeIds`), and `bildung`→pruefungshalle (via the `bildung` domain rollup). **Since s126 the Wohnhaus also carries `domains: ["alltag"]`, so any new `alltag` theme not explicitly claimed (the five Phase B themes) folds into it by domain rollup** (`bank`/`behoerde`/`wohnen` stay explicitly claimed first, so they never double-count); the `tests/city-mastery.test.ts` full-coverage invariant enforces that every vocab word lights some building, so a NEW theme must map to one (add its `alltag` fold or an explicit `themeIds` entry). The product scope is broader than the workplace (see the scope note at the top): remaining content depth is per-theme (exam sets, more dialogues/texts, sub-theme splits). When adding a life-domain theme, extend the `ThemeId` union in `src/types/index.ts` **and** the `THEME_IDS` array in `scripts/lint-content.mjs` (kept in sync), register the lucide icon in `src/lib/icons.ts`, match the `ExamTheme` schema in `src/data/themes.ts` (including `domain` + `context`, and optionally `subThemes`; see the Taxonomy layer bullet below), add a writing prompt (one per theme is required), keep ids unique, and add matching vocab/collocations/dialogues + provenance rows. The `behoerde` pack is the reference template.
- **Taxonomy layer (faceted model, added s42; see `docs/archive/TAXONOMY_IMPLEMENTATION_PLAN.md`).** Above the 15 flat themes sits a shallow Domain → Theme → Sub-theme hierarchy plus orthogonal facets. **Domains** (`src/data/domains.ts`; 5: `beruf`, `alltag`, `gesundheit`, `bildung`, `pruefung`) group the themes, and each theme carries `domain` + `context` (`work`|`personal`|`both`). **Sub-themes** live on `ExamTheme.subThemes` (slug id like `behoerde.antrag`, bilingual title, optional `situationsIndex`); `behoerde`, `customer`, `meetings`, `arzt`, `wohnen`, `bank` and `bildung` are split so far (7 of 15). **Facets** are optional content fields: `cefr` (`ContentCefr`: A2/B1.1/B1.2/B2.1/B2.2/C1) and `subThemeId` on vocab + collocations, plus `sectors` (Branche, a context axis; **a SCOPE since the s102 overhaul, 2026-07-12, `docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md`**: `sectors?: WorkSector[]` multi-tag with **untagged = universal** (`matchesSector` in `lib/facets.ts`: untagged items show under EVERY Branche, tagged items hide only under other Branchen; that root-caused "das Projekt looks IT-only"), 15 values (s94's 11 + `chemicals`/`pharma`/`cleaning`/`security`, `transport` relabeled "Transport & Logistik"), each with a starter pack; Branche renders as the FIRST dropdown in the rail hierarchy Branche → Thema → Unterthema, `?sector=` is a single-value scope param, sector-tagged items sort first when a Branche is selected, and Branche chips show on Tabelle/Karten; as a scope it escapes the ≤12-option facet cap AND the coverage floor; the singular `sector` field is retired and the linter errors on it; retag-audit report: `docs/reports/sector-audit-report.md`; `office` stays deleted as a category error and `workSituation` stays retired, Situation = the sub-theme grain of Thema; rule: Branche = where you work, Thema = what you are doing, never reuse a label across axes) and `frequency` (vocab + collocations; since the audit P2/P3 pass this is REAL, served by the generated `src/data/frequency.ts` Häufigkeit map with the hand-set field as override; the dead `counterpart`/`taskType` forward-declares were CUT, linter errors on reintroduction). Every facet is **optional and rolls up**: untagged items still appear under the parent theme, so partial tagging never breaks the app. **`mode`** (`LearningMode` in `useSettingsStore`, default `both`) is a top-level lens chosen at onboarding and switchable in **Einstellungen → Lernen** (moved off the header in s86; the `ModeSwitcher` header component was removed). It is persisted (rides cloudSync) and now has a **real content effect** (Phase 3, s43): it filters the dashboard intent cards. (It no longer gates any facet: since the audit 2026-07-09, facet visibility follows the coverage floor in `lib/facets.ts`, `MIN_FACET_COVERAGE`/`MIN_FACET_VALUES`, never the Mode lens.) Broader mode/level re-weighting of the review queue is Phase 4. **Closed-enum rule:** when you add a union to `src/types/index.ts`, mirror it with a JS array + a validate-when-present check in `scripts/lint-content.mjs`. The linter already validates `DOMAIN_IDS`, `CONTEXT_TAGS`, `CEFR_LEVELS`, `FREQUENCIES`, `WORK_SECTORS` (and errors on any reintroduced `workSituation`/`counterpart`/`taskType`), and cross-checks that every `subThemeId` is declared on its theme. Helpers: `filterVocab({theme, sub, cefr})`, `vocabBySubTheme`, `collocationsBySubTheme`. UI: a **shared faceted filter** (`src/features/shared/FacetSheet.tsx`, s43): a "Filter" chip opens a slide-up sheet (built on `dialog.tsx`, overridden to a bottom sheet) with multi-select option pills showing live counts and greyed zero-yield values (AND-across / OR-within; exports `matchesFacets`/`applyFacets`/`activeFacetCount`/`ActiveFilterChip`). Wired into the **Vokabeltrainer** (CEFR + Wortart; `?cefr=`/`?pos=`), the **Kollokationen** browser (CEFR + Register + Verb) and the **Redemittel** browse view (Register). The Vokabeltrainer also keeps the theme `Select` + `SubThemePicker` drill-down (`?sub=`); the quiz shows CEFR labels (B1 / B2.1 / B2.2·C1) derived from its internal `Difficulty 1|2|3` via `difficultyToBand` in `src/lib/cefr.ts`. **Harmonized browse toolbar (s45, `docs/archive/FILTER_HARMONIZATION_PLAN.md`):** all three filtering pages (Vokabeltrainer, Kollokationen, Redemittel) share an identical `[Search] [Primary ▾] [Filter]` toolbar via `src/features/shared/BrowseToolbar.tsx`. All use `HubHero` headers. Kollokationen's verb-chip scroll rail was removed (verb is now a facet inside the sheet). Redemittel gained a Kategorie primary dropdown (`?cat=`). Free-text search added to Vokabeltrainer and Redemittel. `src/lib/cefr.ts` is the single source of truth for the CEFR scale (`CEFR_ORDER`, `cefrLabel`, `difficultyToBand`), replacing previously duplicated arrays.
- **Vocabulary** (`src/data/vocabulary.ts`): each entry has `id`, article (nouns), plural (countable nouns), pronunciation hint, two example sentences, and related terms. Currently **1,623 words** (~49 per workplace theme, a ~27-word `behoerde` pack, **28-word `arzt`/`wohnen`/`bank`/`bildung` packs** added s75, a 13-word care/Pflege pack added s43, the **11 Branche starter packs** added s94, the **Wave-2 deepening** (s95): engineering/it/construction/production at ~60 words each, the **s102 Branche-overhaul packs**: `chemicals`/`pharma`/`cleaning`/`security` at ~20 words each + a 10-word Transport & Logistik Lager boost, the **coverage-review deepening** (2026-07-14): +76 words for the thin service Branchen (hospitality/retail/beauty/cleaning/security/sports) and +57 for the thin daily-life themes, the **daily-life scale-up Phase A** (s126, 2026-07-17, `docs/plans/DAILY_LIFE_SCALEUP_PLAN.md`): +132 words bringing all five original daily-life themes (bank/bildung/behoerde/wohnen/arzt) to ~80 vocab each so they match workplace depth, plus the **daily-life scale-up Phase B** (s126): five NEW `alltag` themes (`einkaufen`/`essen`/`mobilitaet`/`freizeit`/`digitales`) at 49 vocab each (+245); verified by `pnpm lint:content`), all tagged with a `cefr` facet (AI-drafted, human-verify pending), for the split themes a `subThemeId`, and for sector-specific items a `sectors[]` multi-tag (1-4 typical; general words stay untagged = visible under every Branche). **The bank is two concatenated array literals** (`vocabularyPart1/2`, split in s102 for the TS2590 union-complexity limit, same as provenance); append new packs to part 2. When adding words: match the existing schema, keep ids unique, source from standard Goethe-Zertifikat B2 Beruf / telc Deutsch B2+ Beruf word fields, and verify with `pnpm build` + `pnpm lint:content`. **Wörter-surface retire set (s142):** a Nomen-Verb collocation must live in the Kollokationen bank, not the single-word Wörter list (it renders every entry with no POS filter, so a combo shows up article-less next to real nouns). Eight mis-filed combos are listed in **`RETIRED_VOCAB_IDS`** in `vocabulary.ts`; **`browsableVocabulary`** (= bank − retired) is what every "words" surface reads (Wörter browse via `themeScoped` + the now-browsable `vocabByTheme`/`vocabBySubTheme`, `lib/search.ts`, the `engine/session.ts` word pools, `Sammlung.tsx`). `vocabById`/`vocabulary` stay the FULL bank so ids still resolve (shipped ids are permanent, progress is id-keyed → retire, never delete). `lint:content`'s `lintVocabCollocationOverlap` **errors** if a vocab `de` equals a collocation `full` unless the id is retired, so a future overlap fails CI; add the combo to Kollokationen + the id to `RETIRED_VOCAB_IDS`.
- **Collocations** (`src/data/collocations.ts`): currently **1,035 Nomen-Verb pairs** (~36 per theme; +36 each for `arzt`/`wohnen`/`bank`/`bildung` in s75; +96 across the 11 Branche packs in s94; +65 in the s95 Wave-2 deepening; +40 in the s102 Branche-overhaul packs, ~9 per new sector + 4 Lager pairs; +56 in the coverage-review deepening (2026-07-14): 48 for the thin service Branchen + 8 for daily-life themes; +36 in the daily-life scale-up Phase A (s126): bank/bildung/behoerde/wohnen each to ~50 pairs; +200 in the daily-life scale-up Phase B (s126): 40 each for the five NEW `alltag` themes einkaufen/essen/mobilitaet/freizeit/digitales; +2 in s142: `c_planung_revidieren`/`c_vorwuerfe_zurueckweisen`, the noun+verb combos moved out of the Wörter surface, see the Wörter retire note below). Schema: `id`, `noun`, `verb`, `full`, `en`, `register` (`neutral`|`formal`, `diplomatic` folded into formal in the audit), `themeId`, `example {de, en}`, plus the optional facets `cefr` (all tagged), `subThemeId` (split themes) and the `sectors[]` multi-tag. Keep ids unique (`c_` prefix + snake_case). (The old "floor watch" rule is obsolete since s102: Branche is a scope, not a facet, so no coverage floor applies.)
- **Grammar** (`src/data/grammar.ts`): currently **24 topics / 117 drills** (s95 Wave 4 completed the B1–B2 canon: +14 German-first topics across 6 new groups `nouns`/`attributes`/`reportedSpeech`/`wordFormation`/`infinitives`/`future`; `grammarMeta.ts` `groupOrder` places them on the B2-marker spine). Schema: `GrammarTopic` with `id`, `group`, `cefr` (REQUIRED since the audit P2 pass, s84: completeness-checked by the linter, AI-drafted founder-verify pending, shown as a badge on the hub cards + topic view), `title`, `titleDe`, `purpose`, `purposeDe` (German added s47), `explanation`, `explanationDe` (s93: the German-FIRST lesson text; the EN `explanation` shows only via the hold-to-peek EN chip; AI-drafted, founder verify pending), `pattern`, `examples`, `pitfalls`, `pitfallsDe` (s93, parallel to `pitfalls`, same order/length), `drills[]`. Topics are ordered by B2-marker priority in the hub. Drills have `id`, `prompt`, `answer`, `options?` (MCQ) or no options (word-order), `explain`, `gloss` (in the lesson the gloss hides behind the EN peek via `GrammarDrillCard`'s `glossPeek` prop; sessions keep it always visible).
- **Can-Do milestones** (`src/data/canDo.ts`, added s47 for UX overhaul Phase 4): currently **52 `CanDoStatement`s** (2–3 per theme, all 20 themes covered; the s126 daily-life scale-up Phase B added 3 each for the five new `alltag` themes einkaufen/essen/mobilitaet/freizeit/digitales, all `draft`; **all 52 are now `draft`** since the 2026-07-22 human-verification reset). Schema: `id` (`cd_` prefix), `themeId`, `cefr` (`ContentCefr`), `statement` (German, must start with "Ich kann"), `en` gloss, `threshold` (0..1 theme-mastery ratio at which the milestone is achieved). **Provenance:** AI-drafted, aligned to the CoE CEFR self-assessment descriptors (cited in `provenance.ts`, never reproduced). The 25 Can-Do rows were founder-approved 2026-07-02 but **reset to `draft` on 2026-07-22** (human verification restarted from zero at founder request). When adding NEW statements: keep ids unique, ascending `cefr`/`threshold` within a theme, add a matching `can_do` provenance row (start it `review_status: "draft"` for the next review pass), run `pnpm lint:content`.
- **Lese-/Hörtexte** (`src/data/texts.ts`, added s69 for redesign Phase 4.3): currently **36 `ReadingText`s / 108 checks** (2 Behörden letters, 2 workplace emails, 2 memos, workplace + daily-life announcements, voicemail scripts, the s75 daily-life texts, an s80 round adding a new sub-theme to each daily-life theme, the **s95 Wave-2 sector texts** (a Wartungsprotokoll memo (engineering), a Sprint-Review email (it), a Baustellenordnung announcement (construction) and a Schichtplan voicemail (production)), plus **2 texts for each of the five new `alltag` themes** in the s126 scale-up Phase B (email + announcement per theme); voicemails double as TTS listening input in the 4.4 block). Schema: `id` (`tx_` prefix), `kind` (`TextKind`, closed enum: letter/email/memo/announcement/voicemail), `themeId`, `cefr`, `title`/`titleEn`, `de` (full text, blank-line paragraphs), `en` gloss, `checks` (2–3 `TextCheck` MCQs: German `question`, `options`, `answer` among options, optional English `explain`; check ids globally unique), optional `subThemeId`, optional `sector` (`WorkSector`, s95 Wave 2; validate-when-present in the linter). All texts are authored authentic-STYLE (fictitious names/numbers), CEFR-calibrated against the CoE level descriptors (cited in provenance, never reproduced), one `text` provenance row each (`review_status: "draft"`, founder review pending). Results feed XP/theme progress, NOT vocab FSRS, so texts carry no SRS fields. When adding texts: match the schema, no em dashes, run `pnpm lint:content`.
- **Content linter (`pnpm lint:content`, gate added 2026-06-14, provenance checks added 2026-06-15):**
  `scripts/lint-content.mjs` loads every `src/data/*` bank through Vite's `ssrLoadModule` (no extra
  dependency) and checks for duplicate ids, broken dialogue branches (bad `next` targets, orphan/
  dead-end nodes, `start` integrity), missing/empty required fields, dangling cross-references
  (`themeId`, `scenarioId`, Redemittel/grammar/weakness categories), **taxonomy integrity** (domain
  registry completeness, theme `domain`/`context`, every closed-enum facet validated when present, and
  every `subThemeId` declared on its parent theme), **Can-Do integrity** (unique ids, valid `themeId`/
  `cefr`, the "Ich kann" statement prefix, `threshold` in `(0,1]`, and every theme covered by at least
  one milestone), **text-bank integrity** (closed `kind` enum, the 2–3-checks contract, answers among
  options, globally unique check ids), em dashes in copy, and
  **provenance register integrity** (every content_id must have a register row; every row's license must
  be on the commercial-safe allowlist; authored/adapted items without a `reference` URL generate a
  warning). It runs in CI on every PR and on pushes to `main` (`.github/workflows/validate.yml`),
  failing the build on any error. **Run it after any content edit**, not just `pnpm build`
  (TypeScript does not catch duplicate ids, which silently drop React-keyed cards). Plural is
  intentionally NOT required on nouns (uncountable/plural-only). **Since s130 it also enforces,
  as errors:** global content-id uniqueness ACROSS banks plus each bank's id prefix
  (v_/c_/g_/sc_/ex_/r_/cd_/tx_/m_/wp_ — the prefixes are what make cross-bank collisions
  impossible), the verified-content fingerprint gate (see `pnpm stamp:verified`), and the
  `ID_RENAMES` registry (source gone, target resolves, no cycles). It also writes
  `docs/reports/related-terms-report.md`: `related` terms that resolve to no vocab entry are
  dropped word-graph edges (by design, founder-confirmed); the report + a summary line keep that
  visible, not a gate.
- **Provenance register (`src/data/provenance.ts`, added 2026-06-15):** one `ProvenanceEntry` row per
  content_id, tracking `origin` (authored/sourced/adapted), `reference` (Wiktionary/DWDS/Tatoeba URL),
  `license` (SPDX from the allowlist), `review_status` (draft/verified), and who added/verified it.
  All 3,107 content items have provenance rows, every one carrying a non-empty `reference` (so the
  back-fill queue is empty); **all 3,107 are `review_status: "draft"` and 0 are `"verified"`** (human
  verification was reset to zero at founder request, 2026-07-22: the previously-approved 25 Can-Do rows
  were flipped back to `draft` to restart the human-review pass from a clean slate; the `human` tier on
  `/sources` is now 0). Since s95 the register is **two concatenated array literals**
  (`provenancePart1/2`): a single 2,000+ row literal exceeds TypeScript's TS2590 union-complexity
  limit. Append new rows to the second literal (the append-script pattern is unchanged). Game missions get one row per mission id (scenes/moves/checks ride on it,
  like text-bank checks). The back-fill queue (items with empty
  `reference`) shows as linter warnings. **When adding new content:** add a corresponding row in
  `provenance.ts` at the same time — the linter errors if a content_id has no row. Use
  `pnpm generate:provenance` only to bootstrap a fresh register (it overwrites); add new rows manually
  for incremental additions. The `ProvenanceEntry` type lives in `src/types/index.ts`. See
  `docs/strategy/DATA_GOVERNANCE.md` for the full policy (traceability over ownership; Wiktionary/DWDS for word
  facts; Tatoeba CC-BY for example sentences).
- **Shipped content ids are PERMANENT (s130, data-architecture review):** learner progress (FSRS
  cards, practice counts, saved words, done scenarios/missions) is keyed by content id, locally AND
  in the cloud `progress` row, so renaming or deleting a shipped id orphans real learning history
  with no error anywhere. Never rename or delete a shipped id; retire content from the app surface
  instead. If a rename is truly unavoidable, map it in `ID_RENAMES` in `src/lib/idRenames.ts` and
  keep the entry forever: the progress store applies the map on rehydrate (persist v1 migrate) and
  cloudSync applies it to incoming remote rows, so history follows the item. `lint:content`
  validates the table (source must be gone, target must resolve, no cycles);
  `tests/idRenames.test.ts` pins the remap helpers.

## Mobile bottom tab bar (locked 2026-06-16; context strip removed s26)

> **UPDATED session 86 (2026-07-10) — restructured at founder request; the s16–29 rules below are the historical record and are partly SUPERSEDED.**
> **Current bar (updated s105, 2026-07-13; `/library` label reverted s141):** `Praktisch (fixed) · Bibliothek · Fortschritt · Einstellungen (fixed)` — "Heute" was renamed **Praktisch**, and **Anwenden was hidden from the nav** (demo), so only two middle sections remain. The `/library` tab was renamed "Bibliothek" → "Theorie" in s105 and **reverted back to "Bibliothek" in s141** (founder). Its route stays mounted; re-add the `navItems` row to restore it. (Historical: the pre-s105 bar was `Home · Bibliothek · Anwenden · Fortschritt · Einstellungen`.)
> **Active-tab labels (s141):** each tab shows its section name under the icon in the mobile bar, visible ONLY on the selected tab. The label slot is a reserved fixed-height row on every tab (so selecting one never shifts the icon rail); the name is a neutral theme-aware dark grey (`text-slate-600 dark:text-slate-300`, NOT the section accent, founder: blue "not premium"). This replaced the old small active underline, and the active squircle shrank `h-11 w-11` → `h-10 w-10` to fit the label inside the locked 63px bar (a deliberate, founder-approved exception to the s28 `h-11` lock).
> The **"Mehr" overflow sheet was retired** (`MoreSheet.tsx` deleted): **Einstellungen replaced Mehr** as the fixed last slot and is a plain `NavLink` to `/settings`. There is **no add/remove** any more; the three middle content sections are **always visible** and only **reorder** via a hidden **long-press easter egg** (jiggle + drag, no +/X badges; a transparent full-screen layer means "tap anywhere to finish", and navigating also ends it). **Home and Einstellungen never move.** `pinnedTabs` still stores `["/", ...middle]` and the reorder persists there; `moreOrder`/`setMoreOrder` are now **legacy/unused** (kept in the store only so old persisted settings don't break). `BottomTabBar` owns its own `editMode` (no longer coordinated with `AppShell`).
> **Header also slimmed (same session):** it now carries only **logo · streak · account**. Search icon removed (⌘K + desktop Sidebar entry remain; mobile has no global-search entry, founder choice); `ThemeToggle` moved into the `AccountMenu` dropdown (a Hell/System/Dunkel row); `ModeSwitcher` removed from the header and **Modus moved into Einstellungen → Lernen** (still filters the dashboard cards); the "Genauly" wordmark dropped on mobile (G logo stays); the streak pill lost its goal-gauge ring. `ModeSwitcher.tsx` + `ThemeToggle.tsx` deleted. **Dashboard Heute → Üben tab is the Neuland city-map path** (`features/dashboard/UebenPath.tsx`, lazy — imports the mission bank, so Heute stays bank-free; **redesigned s88**, the s86 pixel canvas + the s87 stepper are retired): a **soft illustrated SVG city map** with the Kapitel-1 stops (Bahnhof/Laden/Zuhause/Amt) as colored landmark tiles **inside their blocks, never on a street**, state from `missionsDone`: an indigo route runs **solid to the current stop and dotted onward**, every **completed stop gets a white route dot**, and a **location pin + "Du bist hier" chip** marks the current stop (no player figure, no stepper; the map is the single journey surface, founder s88). A centered **"Lernpfad" title** mirrors the Spielen "Neuland" header, and the map is a **native 3:2 block (360x240 viewBox) inside a `bg-surface p-2` mat** — the SAME mat frames the Spielen chapter hero, so both tiles share dimensions AND screen position: **s90 locked this** by pinning Üben's header+map to the top with a fixed `gap-4` (matching Spielen's top-aligned compact `NeulandHub`) and pushing the pager to the bottom with `mt-auto` (measured parity: both tiles `tileTop=353`, `245×358px` at 390×844). The founder explicitly wants the **white mat** (`bg-surface`), don't remove it; both mats share a **neutral gray `border-border`** (s90 tried per-section colored borders but the founder found they read poorly, so the section color lives on the toggle only, not the mat). Below it the **practice-module card** (real **"n / 6" progress badge in accent** — green stays reserved for done, no static "Aktuelles Level" —, a "1.x" number + an "Als Nächstes" chip in the meta row, the **"Erledigt" green badge on the title line (right-aligned)** for a completed module, and **ONE state-aware CTA**: "Jetzt üben" on the token gradient `bg-accent-gradient` + `shadow-glow` for a new module, **"Wiederholen" on plain `bg-muted` grey** for a completed one, BOTH opening the same mission-focused session — the founder merged the buttons and removed the card's separate `/revision` entry, don't re-add it; the module block slides horizontally via framer-motion on pager change, `useReducedMotion`-guarded), and at the bottom a **module pager**: per-mission dots (active = primary pill, done = success) with 32px tap targets; the chevron buttons are **desktop-only (`hidden sm:grid`)** — on mobile the dots plus a **horizontal swipe on the card** navigate modules (founder: no arrows on mobile). Paging never moves the map pin (progress truth). The Üben root is a **`flex min-h-[calc(100dvh-15rem)] flex-col gap-4`** with the header + map pinned to the TOP and the **practice card + module pager grouped and vertically centered in the space below the map (`my-auto` + a tight `space-y-3`)** so the card drops down and the dots rise to sit just below it (s90, superseding the s88 `justify-between` "distribute evenly" rule; the map tile still lands at the exact same screen position as the Spielen hero); the tab still **fits a phone viewport without scrolling** (the min-height is tuned to stay just under the bottom nav; compact card paddings; Dashboard wrapper `space-y-4`); keep it that way. The Heute Üben/Spielen **toggle** (`Dashboard.tsx`) gives the active tab a subtle section tint on the lifted white pill (**Üben `text-accent` teal + a `Dumbbell` icon**, **Spielen `text-orange-500` + a `Play` icon**; s90 swapped the two colors and replaced Üben's old `Zap` bolt with the dumbbell). **Both** active icons fill when selected (`fillActive` flag, s90): the Play triangle and the Dumbbell's weight plates. The card's CTA starts a composed practice session **focused on the selected mission** (`/session?mission=<id>`), NOT the game (founder s87: the Üben tab is for practising a mission's content, not entering it; playing missions lives under Heute → Spielen and `/welt`). The session **leads with the mission's own vocab + Redemittel** (the exact ids its scenes reference, via `missionContentIds` in `engine/mission.ts` → `buildSession`'s `focus` opt), then fills from the mission's theme (quiz/due vocab/reading) and drops the untethered grammar drill, so **Üben mission N mirrors Spielen mission N** (founder rule). The map SVG uses a 360×230 (~3:2) viewBox matching the Spielen backdrop proportions and is theme-aware (`MAP_LIGHT`/`MAP_DARK`). Stops are laid out as a tour (Bahnhof→Laden→Zuhause→Amt) so none is stacked under another. **s104 (founder-picked from `preview/ueben-map-mockups*.html`):** the street grid is re-spaced so no landmark tile hugs a map edge, MAP_LIGHT is the brand-tinted "Stimmung 3" (indigo-tinted ground/lots, green parks), MAP_DARK is the deliberately BRIGHT "Klarer Abend" (blue-grey ground, near-white labels; the founder rejected a darker night palette as low-contrast, don't darken it back), and the route/pin color rides the palette (`P.route`; dark uses a brighter indigo than the dark `--primary` token, don't revert it to `hsl(var(--primary))`). **Labels and the "Du bist hier" chip are collision-authored per stop** (`labelPos`/`chipPos` in STOPS): the top-row stops (Bahnhof/Laden, tile above the stop) label ABOVE the tile and put the chip RIGHT of the pin, because a below-label/above-chip lands exactly under the pin + pulse ring when that stop is current; keep this rule when adding stops. **The landmark tiles are tappable (s104):** each stop is a `role="button"` SVG group (44px hit rect, hover/focus scale, Enter/Space) whose tap slides the practice card to that stop's first unplayed mission (`stopTarget` → `goTo`); the pin never moves (progress truth) and renders at 70% scale about its tip. The **daily-goal ring moved to Fortschritt** (`/analytics`), so Üben no longer repeats progress (Option B's goal-ring/heatmap/stat-tiles were intermediate and are gone). **Spielen is the Neuland world hub** (`features/dashboard/SpielenHub.tsx`, lazy): it renders the shared `features/welt/NeulandHub` (centered Neuland header + chapter hero with overlay CTA + mission checklist since s88, the same view as `/welt`) and deep-links `/welt?mission=<id>` to play a mission full-screen (s87, replacing the earlier `NeulandCarousel`; the `Neuland` tile was also removed from the Anwenden hub the same change). **Desktop (`lg`, s90):** the founder tried a two-column desktop layout and rejected it; the page is **one column on all sizes**. The desktop adaptation is **vertical centering**: the `Dashboard` root becomes `lg:flex lg:min-h-[calc(100vh-8.5rem)] lg:flex-col lg:justify-center` so the focused column sits in the middle of the viewport instead of stranded at the top. On desktop the column is **`lg:max-w-[26rem]`** (mobile stays `max-w-md`), a touch smaller than mobile so the 3:2 tile + card + pager stack fits without a scrollbar (at `max-w-md` the stack is ~815px, over common laptop viewports, and the root `min-h-screen` forces a scrollbar). The desktop toggle→content gap is tightened (`lg:space-y-3`) to help it fit: **Üben is scroll-free down to a 768px viewport, Spielen down to ~800px** (below that the content genuinely can't fit and scrolls, acceptable). `UebenPath` takes natural height on desktop (`lg:min-h-0`, card/pager `lg:my-0`) so the Dashboard can center it. Mobile and `/welt` are unchanged. **Tab switch is a directional horizontal slide** (right→left to Spielen, left→right to Üben) via `AnimatePresence` custom-direction + slide variants (~0.16s easeOut, reduced-motion safe); toggle mount ~0.18s, Üben module slide ~0.13s.
> The iOS fixes further down (`no-callout`, `translateZ(0)`, safe-area sizing) **still apply**; `modal={false}` was sheet-only and is no longer relevant.

The founder iterated extensively on the mobile nav bar (sessions 15–29). The rules below are locked:
**do not change structure, edit-mode behavior, or icon rules without an explicit founder request.**
Deeper mechanism/mockup references and the s25–29 evolution are in **`docs/DECISIONS.md`**.

### Layout
- Fixed bottom bar with a single **icon rail** (63px tall; icons render at 29px, matching the More
  sheet). The old **context strip** (the label row above the icons that showed the section name +
  subtitle) was **removed in s26**: each section already renders its own title at the top of the
  page, so it was redundant. The `desc` field on `NavItem` stays for reuse (landing/marketing copy)
  but is no longer shown in the bar. The More sheet's overlay `bottom` (`3.9375rem`), its bottom
  padding (`5.75rem`), and the `.pb-nav` utility are all sized for the single-rail bar; keep them in
  sync if the rail height changes.
- **Mehr selection (s26):** the Mehr tab shows its selected state (indigo pill + underline) while
  the More sheet is open, and the pinned tabs drop their highlight so the selection clearly sits on
  Mehr. `BottomTabBar` takes a `moreOpen` prop from `AppShell` for this.
- **5 slots total:** Home (fixed, always slot 1) + up to 3 moveable icons + Mehr (fixed, always
  last). This gives max 4 content icons + Mehr.
- Minimum 2 icons in the bar (Home + at least one other); the X button hides when at the minimum.
- Icons not pinned to the bar live in the **More sheet** (grid of 3 columns with names below each icon).

### Icon color rule (updated 2026-06-17, s27)
- Icons are **always colored** (never grey/monochrome) and now render at **full opacity everywhere**
  (founder request s27: the old 38% inactive dimming read as blurred). The active tab is marked by
  its grey-gradient backdrop + underline (bar), highlight (More sheet), or row styling (sidebar), not
  by opacity. `RouteIcon`/`MoreIcon` still accept an `active` prop for call-site compatibility but it
  no longer changes opacity. Do not reintroduce inactive dimming.
- **Two-tone + neon marks (s27):** every route's mark is **two-tone**, its section base colour plus a
  brighter **neon** second tone. The base layer reads from the route accent (`c` in `route-icons.tsx`);
  the neon tone is hard-coded per mark in the renderer (examples + preview sheet in `DECISIONS.md`).
  Do not flatten these back to a single accent with opacity layers.
- **Box backdrops are grey, not section-tinted (s27; flat fill since s29):** the rounded pill/tile
  behind an icon uses a neutral **flat light grey** (`bg-border`, adapts to dark mode), NOT the
  section colour at low opacity. This applies to the bar's active pill, the Mehr pill, the selected
  More-sheet tile, and the sidebar's active row. The old per-section `bg` tint field in
  `nav-items.ts` is no longer used for backdrops (kept in the data for possible reuse). Do not
  reintroduce colour-tinted icon boxes.
- **Flat fill, no gradient (updated 2026-06-18, s29):** the founder liked the grey selection circle
  but not the gradient, so the backdrop is now a single flat `bg-border` shade everywhere (was
  `bg-gradient-to-b from-muted to-border`). Do not reintroduce a gradient on these backdrops.
- **Compact-squircle backdrop (updated 2026-06-17, s28):** the backdrop is a **compact rounded
  squircle that hugs the icon** (`h-11 w-11 rounded-2xl` in the bar, `h-12 w-12 rounded-2xl` in the
  More sheet), NOT a pill that fills the whole tab slot or a full-width `h-16` tile. No inner
  highlight + drop-shadow recipe, which made the box read as a raised/protruding dome. Keep it flush.
- **More-sheet cloud only on the selected tile (s28):** in the normal (browse) sheet the grey
  squircle cloud appears **only behind the currently-selected section**; every other tile shows a
  bare icon (no backdrop, no ring). In **edit mode** all tiles keep the squircle cloud as the
  draggable-tile affordance (they jiggle and host the green + badge). Do not put a cloud behind
  unselected browse tiles again. (Reference mockups in `DECISIONS.md`.)
- **Every route has ONE custom branded SVG mark and ONE unique accent base colour**, both defined
  once in `src/components/layout/route-icons.tsx` (`RouteIcon`) + `nav-items.ts` (`color`). The same
  mark and colours render on every surface: bottom tab bar, More sheet, and desktop `Sidebar`.
  (This replaced the old split where only four "hero" routes had custom SVGs and the rest used
  lucide.) `nav-items.ts` still carries a lucide `icon` per route purely as a `RouteIcon` fallback.
- Marks are normalised to a common **optical size** (`NORM` map + `normTransform` in
  `route-icons.tsx`): each mark's bounding box is scaled to a centred 16-unit target with a
  per-mark weight, so a filled disc doesn't read larger than an airy glyph. Re-tune via that map.
- Dashboard = a house glyph; the **Mehr** menu = the 2×2 grid (the apps/more glyph), `MoreIcon`.
  Both keep the brand Nachtblau `#3D74ED` (s133 rebrand; was indigo `#5b5be6`). Reference sheet: `preview/route-icons-preview.svg`.

### Edit mode (iOS home-screen style)
- Triggered by **long-pressing anywhere** on the tab bar OR anywhere on the More sheet (600ms, with
  haptic vibrate). Both surfaces open edit mode simultaneously.
- In edit mode: icons **jiggle** (framer-motion `rotate` keyframes, infinite) and show a badge (red
  X in the bar, green + in the sheet). Dragging icons left/right reorders them in the bar. Tapping X
  removes a bar icon. There is **no instruction sentence** in the sheet (removed s26).
- **Both the bar AND the More sheet are reorderable (s26).** Bar icons reorder via framer
  `Reorder.Group` (horizontal). Sheet icons reorder via a **custom 2D grid drag-sort** in
  `MoreSheet.tsx` (mechanism in `DECISIONS.md`). The sheet order persists in
  `useSettingsStore.moreOrder` (full ordering of every route path; empty = `nav-items` order);
  `setMoreOrder` keeps pinned routes in their slots and only rearranges the non-pinned ones.
- **Add/remove movement animation (s26):** bar and sheet items use `layout` + `AnimatePresence` so
  adding/removing an icon slides the others into their new positions instead of snapping.
- **Enter/exit is opacity-only, never `scale` (s26, locked):** animating a transform (scale) on a
  `layout`/`Reorder` element fights framer-motion's layout projection (it froze the jiggle and shifted
  icon positions; full why in `DECISIONS.md`). Keep tile enter/exit on `opacity`. Do not reintroduce
  a scale pop on these elements.
- **No "Fertig" / "Done" button.** Edit mode ends automatically when the user taps anywhere outside
  the sheet (auto-save). The sheet also has a grab handle; tapping the dimmed overlay above closes it.
- Home and Mehr are **fixed** and not draggable or removeable.

### Opening / closing the More sheet (s26)
- The **Mehr** tab toggles the sheet: tapping it opens the sheet, or closes it (and exits edit mode)
  if already open. `AppShell.toggleMore` drives this; `BottomTabBar` gets `onMore={toggleMore}`.
- **Navigating to any route closes the sheet.** Because the bar sits below the sheet overlay
  (`modal={false}`), tapping a bar tab (e.g. Home) navigates without Radix closing the sheet, so
  `AppShell` closes `moreOpen` + `editMode` on every `location.pathname` change.

### Adding icons to the bar
While the More sheet is open in edit mode, **tap the green + badge** on a sheet icon to add it to the
bar. (The earlier "drag the icon downward ~72px to add" gesture was removed in s26 because free
drag now reorders the sheet grid; the + badge is the single, unambiguous add affordance.)

### iOS-specific fixes (do not revert)
- **No native link popup on long-press:** `.no-callout` CSS class (in `src/index.css`) with
  `-webkit-touch-callout: none !important` applied to the container AND its `*` children. Inline
  style does NOT cascade to NavLink's `<a>` tags — only the CSS class selector does.
- **`modal={false}`** on `DialogPrimitive.Root` in `MoreSheet.tsx`: Radix Dialog defaults to modal,
  which sets `pointer-events: none` on all elements outside the sheet. This makes the tab bar inert
  while the sheet is open. `modal={false}` prevents this.
- **`transform: translateZ(0)` + `willChange: transform`** on the `<nav>` in `BottomTabBar.tsx`:
  forces a GPU compositing layer, preventing iOS Safari from collapsing the bar under a
  `backdrop-filter` sibling and making it invisible.

### Store architecture
- Pinned tabs stored in `useSettingsStore` as `pinnedTabs: string[]` (array of route paths).
- More-sheet order stored in `useSettingsStore` as `moreOrder: string[]` (full ordering of every
  route path; empty array = fall back to `nav-items` order). Rides into `profiles.settings` jsonb
  via cloudSync like the other settings.
- `DEFAULT_PINNED_TABS = ["/", "/library", "/writing", "/analytics"]` in `nav-items.ts` (Schreiben added
  s147; Anwenden dropped from the
  nav in s105; was `["/", "/library", "/anwenden", "/analytics"]` in Phase 5, session 49). The store is
  persisted at `version: 1`; its `migrate` remaps any pre-Phase-5 pins/More-order via `ROUTE_SUCCESSOR`
  (also in `nav-items.ts`) so removed routes forward to their successor zone instead of vanishing.
- `BottomTabBar` reads the store **directly** (no local buffer state). Any external write
  (e.g. MoreSheet adding a tab) is reflected immediately. Never add a `localOrder` cache or
  `useEffect` sync layer — that was the root cause of the "icon added but didn't appear" bug.
- `Reorder.Group` uses `flexGrow: moveablePaths.length` so all icon slots stay the same width
  when the icon count changes in edit mode.
- X-button `onClick` is guarded with `onPointerDownCapture` + `onPointerDown` stopPropagation so
  framer-motion's drag gesture doesn't consume the pointer before the click fires.

## UI conventions — modal / popup overlays (locked 2026-06-07)
The founder reviewed the sign-in dialog's backdrop and **locked this as the standard look for
all popups/modals/dialogs** going forward (don't reintroduce flat `bg-black/*` or heavy
`backdrop-blur` on new overlays):
- **Backdrop**: `bg-dialog-overlay` (defined in `tailwind.config.ts` → `backgroundImage`), a
  brand-tinted radial spotlight using the cool-slate `--shadow` token — lighter directly behind
  the card (`hsl(var(--shadow)/0.30)`), deepening toward the screen edges (`hsl(var(--shadow)/0.62)`).
  Adapts to dark mode automatically via the token. **No `backdrop-blur`.**
- **Card shadow**: `shadow-elevated-soft` (in `tailwind.config.ts` → `boxShadow`), a ~50%-strength
  version of `shadow-elevated` so the halo around the card stays gentle and doesn't bleed far
  past the border.
- Both are already wired into the shared `DialogContent`/`DialogPrimitive.Overlay` in
  `src/components/ui/dialog.tsx`, so any new dialog built on that primitive inherits this for
  free. Reuse those tokens (don't hand-roll a new overlay style) for sheets, drawers, and other
  popups too, adjusting only the radial center/stops if a different focal point is needed.

## Brand logo (rebrand shipped s133; mark locked 2026-06-08 → 2026-07-19)
- **Brand kit (s133): the full, browsable kit lives in `brand-kit/`** (logo mark/wordmark/lockups/
  mono, `color/` palette + `tokens.css`/`tokens.json`, `type/` specimen, `icons/`, `social/`,
  `previews/`, and a `README.md` with usage rules). It is **generated from the app's own source** by
  `scripts/branding/build-brand-kit.mjs` (colors read live from `src/index.css`; the marks are SVG,
  and since the s138 logo v2 the **wordmark + lockups are PNG copied/composited from the
  `public/genauly-wordmark*.png` that `build-logo-assets.mjs` renders** — the lowercase wordmark is
  live Inter, so it cannot be a portable vector). It cannot drift from what ships. **Run
  `build-logo-assets.mjs` first, then `build-brand-kit.mjs`** after any mark or token change (the kit
  copies the wordmark PNGs the logo script produces). Do not hand-edit the generated files.
- **Premium pass (s137):** the `accent-gradient` stops are the theme-aware `--gradient-from`/
  `--gradient-to` tokens in `index.css` (light: deep Nachtblau → primary → vivid sky; dark: light
  end-to-end so the dark `primary-foreground` text passes AA — never reintroduce a fixed dark end
  stop, it broke dark-mode contrast once already). Both stops are gated in `check-contrast.mjs`.
  Shared text classes in `index.css`: **`.text-display`** for page H1s (extrabold, tracking-tight,
  balanced wrap; SectionHeading + HubHero already use it) and **`.text-eyebrow`** for overline
  kickers (color stays per surface). Use these instead of hand-rolling heading/eyebrow recipes.
  The default Button variant carries a subtle white top sheen over `bg-primary`; landing CTAs ride
  `bg-accent-gradient` with `text-primary-foreground` (NOT `text-white`, which fails on the light
  dark-mode gradient). **Second wave (same session, report items 8-10):** the dark theme's surfaces
  are hue **228 warm navy** (re-hued from the violet 250 left over from the indigo era; do not
  revert), and the no-JS shells/manifest dark hexes are `#131620` bg / `#e7e8ef` fg (index.html,
  vite.config.ts manifest, prerender-help.mjs, brand-kit docs). Decorative gradient pairs
  (themes.ts `accent`, HubHero tiles, intent cards) come ONLY from the brand families
  (blue/sky/cyan = Nachtblau/Himmelblau, emerald/teal/green = Blatt, amber/orange/yellow = Butter,
  orange/red = Koralle, rose/pink = the sanctioned extra); never indigo/violet/purple/fuchsia.
  `bg-mesh` sits at 0.10/0.09 (visible whisper, not a band), and the landing numbers band's
  gradient-clipped stat values are the one sanctioned `text-gradient`-style moment.
  **Light-theme ground since s140 (2026-07-21, founder-picked "I1"):** the warm Papier chrome is
  retired in the light theme. `--muted`/`--border`/`--input` are neutral cool greys (220-hue;
  founder-lightened to 90%/86% in-session), and the page ground is **`bg-page`** (tailwind config):
  the bg-mesh washes over a very subtle mint → sky 150° diagonal riding the `--page-from/mid/to`
  tokens (dark sets all three to the flat dark ground, so dark mode is unchanged). `bg-page` is on
  the five full-page shells (AppShell ×2, Onboarding, LegalChrome, HelpChrome); Cards keep plain
  `bg-mesh`. Flat `--background` (`180 45% 98%`) is the fallback + sticky-bar/input fill; the light
  `theme-color` meta rides the gradient's mint top stop `#F7FCF9`. Preview picker artifacts:
  `preview/background-gradient-variations*.html`. Semantic `--warning` Butter and the app-icon
  Papier tile are deliberately untouched.
- **Current mark (s133 PR B, reworked s138 2026-07-20): the lowercase g on a Himmel Soft highlighter
  swipe**. The swipe is **Himmel Soft `#8CDBFB`** (founder-picked s138: the original Himmelblau
  `#52C6F9` read too harsh against black/white). In a same-session follow-up the founder applied
  Himmel Soft app-wide: **`--accent` is now `197 93% 77%` in BOTH themes** (index.css; the darker
  `--accent-ink` text variant and the CTA `--gradient-*` stops are different blues and stayed). The **g is OUTLINED to a `<path>`** (Inter 800, the app's own UI typeface) so it renders
  identically everywhere. **s138 additions:** (1) every icon centers the mark by its TRUE bounding box
  ("Größer", 12% margin — the founder picked it over the tighter 5% "Randnah", which read too big
  live; `TILE_MARGIN` in `build-logo-assets.mjs`; the raw path sits low in the 64-box and used to leave an empty band at the top
  of the app icon — never revert to raw-coordinate centering); (2) **dark-ground marks are TWO-TONE**:
  ink where the artwork sits on the swipe, white where it falls off (only the g's descender); (3) a
  **lowercase wordmark** "genauly" with the swipe under "genau" is the primary logo where there is room
  (`public/genauly-wordmark.png`/`-dark.png`; dark keeps "enau" solid ink + "ly" white so ONLY the g is
  dual-tone). Design source: `docs/branding/BRAND_SPEC.md` §3. **All assets are generated from ONE
  source** by `scripts/branding/build-logo-assets.mjs` (swipe + outlined-g + wordmark band constants).
  It is dev tooling, NOT part of the app build: it needs a local Playwright Chromium (deterministic
  SVG→PNG, no `sharp`) and the app's installed `@fontsource-variable/inter` (for the wordmark); rerun
  it after any mark change. The old gradient "G" is retired.
- **The in-app logo is TILE-LESS (transparent, no tile; founder s133).** Two variants since s138,
  both served by the shared **`src/components/shared/Logo.tsx`** (`variant="mark" | "wordmark"`,
  images swapped by the `.dark` class: `block dark:hidden` / `hidden dark:block`; `useTheme` puts
  `.dark` on `<html>` globally): the compact **g mark** (`genauly-logo.png`/`-dark.png`) for
  space-constrained spots, and the **wordmark** (`genauly-wordmark.png`/`-dark.png`, size with
  `h-* w-auto`) as the primary logo where there is room. On dark grounds both are TWO-TONE (ink on
  the swipe, white off it — only the g splits). Current placement: mobile header `AppShell` = mark
  (founder dropped the mobile wordmark in s86); desktop `Sidebar`, `AuthDialog`, onboarding,
  `LegalChrome`, `HelpChrome`, landing footer = wordmark (adjacent "Genauly" text spans were removed,
  the image IS the name); landing header = mark on phones, wordmark from `sm:`. **No tile, no
  `rounded`/`shadow-glow` box** (the tile-less logo floats). The static no-JS shells (`index.html`,
  `scripts/prerender-help.mjs`) are dark and hard-code `genauly-wordmark-dark.png`. When adding a
  logo spot, use `<Logo>`, do not box it.
- **App icons keep their Papier tile** (browser tab + OS masks need a filled background; transparency
  shows black). The tiled favicons/PWA/apple-touch/maskable are still generated by
  `build-logo-assets.mjs`; only the in-app `<img>` logo went tile-less.
- **Browser-tab favicon (updated 2026-06-14, s22):** `public/favicon-32.png` + `public/favicon-16.png`,
  generated from the canonical logo with **rounded transparent corners** (transparency looks right in a
  browser tab). `index.html` links these PNGs. They replaced the old `public/favicon.svg`, which drew a
  plain system-font "G" rather than the real mark (`favicon.svg` may still exist in the repo but is no
  longer referenced; don't reintroduce it as the favicon).
- **Home-screen / PWA icons are intentionally FULL-BLEED OPAQUE (updated 2026-06-14, s22):**
  `public/apple-touch-icon.png` and `public/pwa-192x192.png` / `pwa-512x512.png` are full-bleed with
  **no transparent corners** (corner alpha 255). iOS fills transparent areas with black when it applies
  its own rounding mask, so transparent corners showed up as dark corners on the home screen. The
  maskable `pwa-maskable-512x512.png` keeps the logo within the inner 80% safe zone on a full-bleed
  background. **Do not "fix" these back to transparent corners.** This full-bleed treatment is correct
  and required for OS-masked icons, and is the one exception to the rounded-transparent rule below.
- **The in-app `<img>` logo is NEVER full-bleed.** Every in-app logo spot uses the rounded
  transparent-corner asset. A full-bleed square variant also exists **only** for Google's OAuth consent
  screen (its circular crop reveals white through transparent corners); that one is not in the repo.
  Full-bleed-everywhere across the in-app UI was shipped then reverted (PRs #120/#121); keep in-app
  logos on the rounded transparent mark. (This is distinct from the OS home-screen icons above, which
  are correctly full-bleed.)

## Legal pages & consent (GDPR)
- `/privacy` and `/terms` are bilingual (DE/EN) via the shared `LegalChrome` + `Section` in
  `src/features/legal/`. **German is the legally binding version** (English is a convenience
  translation, stated on each page). Every legal-copy edit MUST be mirrored in BOTH the `*De` and
  `*En` bodies, and follow the no-em-dash writing rule.
- **`/impressum` is built but TEMPORARILY HIDDEN** (`src/features/legal/Impressum.tsx` exists, but
  the route in `router.tsx` is commented out and all links, footer/Settings/privacy/terms, are
  removed) because the founder hasn't filled the real name/address yet and prefers not to. Re-enable
  once a business/service address is ready: uncomment the import + route, and restore the footer +
  Settings + privacy/terms Impressum links. A commercial public launch legally needs this live.
- Sign-up (`AuthDialog`) and the final onboarding step require an "I agree to AGB + Datenschutz"
  checkbox; consent is recorded via `recordConsent()` (`src/lib/consent.ts`) into the settings
  store, which rides into `profiles.settings` jsonb through `cloudSync`. **Keep `CONSENT_VERSION`
  in `src/lib/consent.ts` in lockstep with the `LAST_UPDATED` date on the legal pages**: when you
  materially change Terms/Privacy, bump both so a future re-consent prompt can detect the change.
- GDPR self-service lives in Settings: data export (`src/lib/dataExport.ts`), account deletion
  (`delete-account` Edge Function + `useAuthStore.deleteAccount`), per-submission delete
  (`WritingHistory` + `writing_delete_own` RLS policy, migration 0003). See `docs/plans/PHASE2_SETUP.md`
  for the founder's one-time Supabase steps (deploy the function, run the migration, fill the
  Impressum + data-location placeholders).
- **No cookie-consent banner**: storage is functional-only (auth session + `b2beruf.*` settings/
  progress + PWA cache), which is consent-exempt under GDPR/§25(2) TTDSG. Only revisit if
  analytics/marketing storage is ever added.
- **`/sources` = "Quellen & Datenqualität" (redesigned s130; table restructure 2026-07-22):** the
  public page tells the data-architecture story visually (stat tiles, five-step pipeline graphic,
  stacked tier bar, per-bank counts, sources/licenses, full item browse), generated from the
  provenance register + verification map. **The "Alle Inhalte und ihre Quellen" item browse is now
  behind a collapse toggle (`showAll`, collapsed by default)** so the page no longer scrolls
  endlessly. Founders additionally get the **Daten-Werkbank**
  (`features/legal/AdminWorkbench.tsx`): the full register as a sortable table with fuzzy search,
  Typ/Stufe/Status filters, CSV export of the filtered view (`src/lib/csv.ts`), copy-id chips and
  per-row verified-checkbox + note (Supabase `provenance_reviews`). **The workbench moved OFF the
  main /sources page onto its own founder-only sub-page `/sources/werkbank`** (2026-07-22, route
  `RequireFounder`-gated in `router.tsx`, same lazy chunk; `SourcesWorkbench` + the shared
  `useWorkbench` hook in `Sources.tsx`); the main page shows admins a link card to it. Human
  verification was reset to zero the same day (see the provenance bullet), so the `human` tier and
  the "menschlich geprüft" stat tile read 0 until the review pass restarts. **Admin gate = the two
  `FOUNDER_EMAILS` in `src/lib/admin.ts`** (client) + the RLS policy from migrations 0004/0007 and
  the `is_founder()`/`assert_founder()` gate in migration 0008 (server); keep all in lockstep,
  `tests/admin.test.ts` pins the email list against both the client list and the migration SQL.
- **Admin control center backend (s144, build plan chunk 1):** migration
  `supabase/migrations/0008_admin_center.sql` widens `provenance_reviews` to real decisions
  (`decision approve|reject|needs_fix` + `content_hash`/`reviewer_email`/`applied_at`/`applied_sha`;
  `verified=true` rows backfilled to `decision='approve'`), adds feedback triage columns
  (`status`/`priority`/`note`/`link`), creates `app_config` (world-readable, founder-writable; the
  Steuerung remote-config store, consumed in chunk 7) and `launch_checklist` (founder-only), and
  installs the founder-gated SECURITY DEFINER RPCs `admin_overview()`, `admin_daily_series()`,
  `admin_feedback_recent(n)`, `admin_feedback_update(...)`. **Privacy line: RPCs return aggregates
  only, never individual learner rows** (exception: `feedback` rows, operational mail addressed to
  the founder); `profiles`/`progress`/`writing_evaluations` keep owner-only RLS with NO admin SELECT
  policies. Client wrappers: `src/lib/adminApi.ts` (typed, fail-soft, lazy-only consumer surface).
  **Chunk 2 (same session): the `pnpm apply:reviews` loop-closer** (see the command bullet above):
  the /sources workbench now stores `decision` + a decision-time `content_hash` +
  `reviewer_email` on every approve click (`computeDecisionHash` in `src/lib/provenanceReviews.ts`,
  banks loaded lazily via `src/lib/contentIndex.ts`, ~4 kB glue chunk over the shared bank chunks).
  **Chunk 3 (s145): the `/admin` shell + Übersicht cockpit.** Founder-only lazy route `/admin/*`
  (`RequireFounder` in `router.tsx` mirrors `RequireOnboarding`; standalone full-screen shell like
  `/sources`, outside AppShell). The whole subtree is ONE lazy chunk (`src/features/admin/AdminApp.tsx`
  owns descendant `<Routes>`): `AdminShell` (8-item bilingual DE/EN sidebar, founder chip, lang
  toggle; fetches `admin_overview` once and shares it via Outlet context), `AdminOverview` (the
  Übersicht: **A1** funnel tiles + all-banks trust-ladder from bundled `provenance.ts`+`verification.ts`,
  **A4** sync-gap + "Übergabe-Prompt kopieren" via `adminFunnel.ts` `pendingApprovals`/`buildHandoffPrompt`,
  **D1** AI-budget tile, **C1** live-deploy widget `liveWidget.ts` = `__BUILD_SHA__` Vite define vs
  latest `main` GitHub API + PWA-cache hint), and `AdminPlaceholder` for the not-yet-built screens
  (deep links resolve, never 404; chunks 4-7 swap them in). `t(de,en)` via `adminI18n.tsx` (no i18n
  framework). Founder-account AccountMenu shows a "Kontrollzentrum" entry. `tests/adminFunnel.test.ts`
  pins the pure funnel. The `__BUILD_SHA__`/`__BUILD_TIME__` defines are read ONLY in the admin chunk.
  Plans: `docs/plans/ADMIN_CONTROL_CENTER_PLAN.md` (scope) + `ADMIN_CONTROL_CENTER_BUILD_PLAN.md`
  (chunks; next: chunk 11, Turnstile + abuse meters).
  **Chunks 4-10 (s146): the rest of the MVP + early Phase 2, all lazy under `AdminApp`.** Chunk 4
  **Review Cockpit** (`/admin/pruefen`): `scripts/review-score.mjs` (pure A2 scoring
  defect_signal > traffic_proxy > (1-confidence) > bank_criticality, pinned by `tests/reviewScore.test.ts`)
  + `pnpm build:review-queue` (`scripts/build-review-queue.mjs` → compact `src/features/admin/reviewQueue.json`,
  regenerate after content edits) + `Pruefmodus.tsx` (filterable queue + keyboard review V/X/N/→/←,
  item rendered via `contentIndex`, machine-check panel, autosave to `provenance_reviews` with a
  decision-time hash, 50-approvals rubber-stamp nudge). Chunk 5 **Feedback-Inbox** (`AdminFeedback.tsx`,
  triage via `admin_feedback_update`). Chunk 6 **System + Launch** (`AdminSystem.tsx` gate strip/pings/
  meters via `systemHealth.ts`; `AdminLaunch.tsx` checklist in `launch_checklist`). Chunk 7 **Steuerung
  core** (`src/lib/appConfig.ts`: typed remote config, `mergeAppConfig` defensively coerces, zustand
  store loaded once in `App.tsx`; **empty/unreachable config == today's behavior byte-for-byte, pinned
  by `tests/appConfig.test.ts` — never break this**; `AdminSteuerung.tsx` panel with live preview,
  saves only real overrides). Consumers read `config.X ?? current-default`: H1 nav labels
  (BottomTabBar/Sidebar), H2 middle-tab hide (nav only, routes stay mounted, Home/Einstellungen locked),
  H4 flags (SHOW_PRACTICE_TABS/SHOW_RELATED → `features.*`), H5 feedback pill, H6 Beta chip, H8
  dashboard start tab, H3 `impressumEnabled` (route always mounted, links gated + confirm dialog), H7
  streak pill, H10 landing copy, H12 Demo-Modus preset. Chunk 8 **report sidecars** (`scripts/report-sidecar.mjs`
  → `{generatedAt, registerRows}` JSON beside verify-facts/verify-cefr/review-queue/exercise-coverage;
  `reportStaleness.ts` + Übersicht staleness strip). Chunk 9 **Inhalte** (`AdminInhalte.tsx`: depth
  matrix, flag triage → Prüfmodus, exercise-coverage residual "Copy ids" work orders; coverage sidecar
  carries per-theme residual ids).

## Deployment (GitHub Pages)
- **`main` is production.** Pushing/merging to `main` triggers `.github/workflows/pages.yml` (official Actions Pages deploy → builds `dist/` and publishes). This is the **only** deploy path — the only other workflow in `.github/workflows/` is `validate.yml` (the content-lint + SRS test gate), which never deploys. (The old `deploy.yml`/`gh-pages` fallback no longer exists.)
- **Feature-branch pushes do NOT update the live site.** Work only goes live once merged to `main`. If the founder says "I don't see the change," the most likely cause is unmerged work on the active automation branch (reassigned every session).
- The remote sandbox cannot reach the live `*.github.io` site — verifying the deploy (Actions tab green + live site) is left to the user.
- **Deploy retry (s53):** `pages.yml`'s deploy job retries `actions/deploy-pages` up to 3 times in-job (fail-soft attempts 1–2 with 15s/60s pauses, hard attempt 3) to absorb GitHub's transient `Deployment failed, try again later` Pages flake. A green run may therefore show a red attempt 1; that is expected, not a regression. Only a sustained GitHub Pages outage now needs a manual "Re-run failed jobs".

## Workflow notes
- **Working efficiently (token / context discipline, added 2026-07-05).** The founder is on a usage-
  windowed plan, so wasted context = less real work per window. Keep sessions lean: (1) prefer
  **targeted `Grep`/`Glob` search over reading whole files**; read only the slice you need. (2) **Batch
  independent tool calls** in one step. (3) Don't spawn **subagents** for routine work, each cold-starts
  and re-derives context (the expensive path); handle it inline. (4) Route by job size: small/mechanical
  asks stay small and scoped; for a big refactor, **plan first, then execute** so you don't re-walk the
  tree mid-loop. (5) `/compact` when a session gets long. (6) Keep this file and the docs lean, historical
  "why" belongs in `docs/DECISIONS.md`, the blow-by-blow in `docs/SESSION_PROMPT_LOG.md`, not here.
- The development branch is **reassigned every session** (the task assigns it), so no branch name is
  written here as permanent. **`main` is always the source of truth**; whatever branch a session is
  assigned, ship to production by opening a PR into `main` and merging (squash).
- **Auto-ship preference (founder approved 2026-06-01):** the founder wants changes live, not parked on the branch. When a change is complete and `pnpm build` is green, **open a PR into `main` and squash-merge it yourself** (no need to ask each time) so it deploys. Use the GitHub MCP tools. The founder remains the one who confirms the live result.
- **Documentation (REQUIRED after every significant task or series of tasks):** after shipping a feature, a content expansion, or a batch of UX fixes, update `docs/PROJECT_STATUS.md` — the session log, content counts, and "Resume here" section. **Keep it lean:** when you add a new handoff to "Resume here", move any handoff older than the two most recent into the current ISO-week chunk under `docs/archive/status-log/` (add a row to the index `docs/archive/PROJECT_STATUS_ARCHIVE.md` if you create a new week file; the archive was chunked by week in s70 for token efficiency; target under ~250 lines). Backlog / model-guidance / research-findings edits go in `docs/PROJECT_REFERENCE.md`, not here. Commit and push the doc update on the dev branch, then merge it to `main` like any other change. This keeps the status doc accurate for future sessions. **"Update the documentation" (or "document this session", or any similar request) means BOTH `docs/PROJECT_STATUS.md` AND `docs/SESSION_PROMPT_LOG.md` (and any plan/CLAUDE.md docs the work made stale), not just the status doc.** The founder will not always name the prompt log explicitly; treat it as implied. Also refresh stale facts in this `CLAUDE.md` (e.g. content counts, conventions) when the work changed them.
- **Prompt & session log (REQUIRED for every founder prompt, added 2026-06-16):** append one entry per founder prompt to `docs/SESSION_PROMPT_LOG.md` (append-only, newest at the bottom) capturing the verbatim prompt, timestamp, branch, any attachments, a response summary, and the artifacts (files · commit SHAs · PR #s). This is the **authorship paper trail** for a possible copyright filing. Keep the detail there, not in this file. Do NOT paste secrets, and do NOT write the assistant's internal model identifier into the log (it is a committed artifact). Git history + merged PRs remain the primary record; the log is the human-readable supplement. See the `SESSION_PROMPT_LOG.md` header for the full policy and entry template. (The old `UserPromptSubmit` auto-logging hook was removed at the founder's request on 2026-06-25; prompt-log entries are now made manually.) **Any "update the documentation"-type request implies appending the session's prompts here too** (founder direction, s42): don't wait to be told the prompt log by name. When you log, cover every founder prompt of the session, newest at the bottom, and ship it with the other doc updates.

### Post-deploy GitHub housekeeping (REQUIRED after every squash-merge)
Squash-merging rewrites history: `main` gets one new commit while the long-lived dev branch still holds the original unsquashed commits, so they diverge and the **next** PR conflicts (this bit us on PR #23). Run this realignment **every time** right after a merge:
1. `git fetch origin main`
2. `git reset --hard origin/main` — make the dev branch identical to production.
3. `git push --force-with-lease origin <current-branch>` — `--force-with-lease` (never plain `--force`); safe because this is the sole dedicated automation branch with no other contributors.
4. Confirm `git status` shows the branch level with `origin/main` and the working tree clean.

Also: don't pre-write the next PR's `_Last updated`/log entry against a stale branch — realign first, then make new edits. The founder still verifies the live result; the sandbox can't reach the `*.github.io` site or the Actions tab.

## Roadmap & status (read these when resuming)
- **`docs/PROJECT_STATUS.md`** — the **lean, living** status doc: current state, current content
  counts, and the "Resume here" pointer with the two most recent handoffs. Start here. (Split for token
  efficiency in s70; the stable technical baseline moved to `PROJECT_FOUNDATION.md` in s95; keep it
  under ~250 lines, and when appending a handoff move any older than the two most recent into the
  current ISO-week chunk under `docs/archive/status-log/` — the rule is restated at the top of the file.)
- **`docs/PROJECT_FOUNDATION.md`** — the **stable technical baseline** consulted on demand: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra setup, and completed founder
  setup items. Split out of `PROJECT_STATUS.md` in s95 so the status file holds only living state.
- **`docs/PROJECT_REFERENCE.md`** — stable, low-churn reference consulted on demand: the founder
  backlog, product-evaluation findings, per-session model guidance, and reusable research findings.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only history, chunked by ISO week
  under `docs/archive/status-log/` (sessions 1–71 across W23–W28, plus an `ops-notes` file).
- **`docs/archive/EXPANSION_PLAN.md`** — approved phased plan (Phase 1: grammar/collocations/leveled
  quizzes, client-side; Phase 2: Supabase auth + cloud sync + AI writing coach). Next work = Phase 1.
- **`docs/archive/IMPLEMENTATION_PLAN.md`** — original from-scratch build plan (historical reference).
- **`docs/DECISIONS.md`** — the "why" behind locked decisions (UX-overhaul phase history, mobile-bar
  mechanism/mockup detail). Read before undoing any "locked" rule stated tersely in this file.
- **`docs/SESSION_PROMPT_LOG.md`** — append-only paper trail of every founder prompt + response
  (authorship record for a possible copyright filing). Append an entry for each prompt; see the
  "Prompt & session log" rule under "Workflow notes".
- Founder is **non-technical**; act as a decisive CTO who minimizes their ops burden and caps costs.
