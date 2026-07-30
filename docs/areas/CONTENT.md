# Content conventions — banks, taxonomy, provenance

Read this before adding or editing anything under `src/data/`. The add-content workflow checklist
lives in the `/content` skill (`.claude/skills/content/SKILL.md`); this file is the reference.
Counts below are as of s177; re-verify against `pnpm lint:content` before quoting.

## Hard invariants (also in CLAUDE.md)
- **Shipped content ids are PERMANENT.** Learner progress (FSRS cards, practice counts, saved
  words, done scenarios/missions) is keyed by content id, locally AND in the cloud `progress` row.
  Never rename or delete a shipped id; retire content from the app surface instead. If a rename is
  truly unavoidable, map it in `ID_RENAMES` (`src/lib/idRenames.ts`) and keep the entry forever:
  the progress store applies the map on rehydrate and cloudSync applies it to incoming remote rows.
  The linter validates the table (source gone, target resolves, no cycles);
  `tests/idRenames.test.ts` pins the remap helpers.
- **Closed-enum rule:** when you add a union to `src/types/index.ts`, mirror it with a JS array +
  a validate-when-present check in `scripts/lint-content.mjs`.
- **Every content_id needs a provenance row** in `src/data/provenance.ts` at the same time; the
  linter errors otherwise.
- **No em dashes** in any content copy.

## Themes (20)
Ten **workplace** topics (meetings, scheduling, logistics, customer, conflict, project,
technology, sustainability, safety, travel; all `domain: "beruf"`) plus **ten daily-life packs**:
`behoerde`, `arzt` (sub-themes termin/symptome/behandlung/versicherung), `wohnen`
(suche/vertrag/nebenkosten/probleme), `bank` (konto/zahlung/karte/finanzen), `bildung`
(sprachkurs/anerkennung/pruefung/weiterbildung), and the five `alltag` packs `einkaufen`
(supermarkt/kleidung/umtausch/online, icon ShoppingCart), `essen`
(restaurant/bestellen/bezahlen/kochen, UtensilsCrossed), `mobilitaet`
(oepnv/ticket/auto/wegbeschreibung, Bus), `freizeit` (hobbys/verabredung/smalltalk/veranstaltung,
PartyPopper), `digitales` (vertrag/internet/geraete/konto, Smartphone). All five domains are
populated; the former `arbeitswelt` domain was merged into `beruf` (near-synonym split confused
learners).

**Adding a theme:** extend the `ThemeId` union in `src/types/index.ts` AND `THEME_IDS` in
`scripts/lint-content.mjs`; register the lucide icon in `src/lib/icons.ts`; match the `ExamTheme`
schema in `src/data/themes.ts` (incl. `domain` + `context`, optional `subThemes`); add a writing
prompt (one per theme required); keep ids unique; add matching vocab/collocations/dialogues +
provenance rows. The `behoerde` pack is the reference template. **City-strip mapping:** the
`tests/city-mastery.test.ts` full-coverage invariant enforces that every vocab word lights some
domain building; a new theme must map to one (the Wohnhaus carries `domains: ["alltag"]`, so any
new `alltag` theme not explicitly claimed folds into it; `bank`/`behoerde`/`wohnen` stay
explicitly claimed first so they never double-count).

## Taxonomy layer (faceted model)
Above the flat themes sits Domain → Theme → Sub-theme plus orthogonal facets
(plan: `docs/archive/TAXONOMY_IMPLEMENTATION_PLAN.md`).
- **Domains** (`src/data/domains.ts`; 5: `beruf`, `alltag`, `gesundheit`, `bildung`, `pruefung`)
  group the themes; each theme carries `domain` + `context` (`work`|`personal`|`both`).
- **Sub-themes** live on `ExamTheme.subThemes` (slug id like `behoerde.antrag`, bilingual title,
  optional `situationsIndex`).
- **Facets** are optional content fields: `cefr` (`ContentCefr`: A2/B1.1/B1.2/B2.1/B2.2/C1) and
  `subThemeId` on vocab + collocations, plus `frequency` (REAL, served by the generated
  `src/data/frequency.ts` Häufigkeit map with the hand-set field as override). Every facet is
  optional and rolls up: untagged items still appear under the parent theme.
- **Branche (`sectors`) is a SCOPE, not a facet** (overhaul plan
  `docs/plans/BRANCHE_FILTER_OVERHAUL_PLAN.md`): `sectors?: WorkSector[]` multi-tag with
  **untagged = universal** (`matchesSector` in `lib/facets.ts`: untagged items show under EVERY
  Branche; tagged items hide only under other Branchen). 15 values, each with a starter pack;
  `transport` is labeled "Transport & Logistik". Branche renders as the FIRST dropdown in the rail
  hierarchy Branche → Thema → Unterthema; `?sector=` is a single-value scope param; sector-tagged
  items sort first when a Branche is selected. As a scope it escapes the ≤12-option facet cap AND
  the coverage floor. The singular `sector` field is retired (linter errors); `office` stays
  deleted as a category error; `workSituation`/`counterpart`/`taskType` stay retired (linter errors
  on reintroduction). Retag-audit report: `docs/reports/sector-audit-report.md`.
  **Axis rule: Branche = where you work, Thema = what you are doing; never reuse a label across
  axes.** Situation = the sub-theme grain of Thema, never a separate axis.
- **`mode`** (`LearningMode` in `useSettingsStore`, default `both`) is a top-level lens chosen at
  onboarding, switchable in Einstellungen → Lernen, persisted via cloudSync. It filters the
  dashboard intent cards; it does NOT gate any facet (facet visibility follows the coverage floor
  in `lib/facets.ts`, `MIN_FACET_COVERAGE`/`MIN_FACET_VALUES`).
- Helpers: `filterVocab({theme, sub, cefr})`, `vocabBySubTheme`, `collocationsBySubTheme`.

## Banks
- **Vocabulary** (`src/data/vocabulary.ts`, ~1,743 words): each entry has `id` (`v_`), article
  (nouns), plural (countable nouns), pronunciation hint, two example sentences, related terms; all
  tagged `cefr`, split themes carry `subThemeId`, sector-specific items a `sectors[]` multi-tag
  (1-4 typical; general words stay untagged). **The bank is two concatenated array literals**
  (`vocabularyPart1/2`, split for the TS2590 union-complexity limit); append new packs to part 2.
  Source from standard Goethe-Zertifikat B2 Beruf / telc Deutsch B2+ Beruf word fields; verify with
  `pnpm build` + `pnpm lint:content`. **`pos` has no `preposition` value on purpose:** text-organising
  prepositions (`bezüglich`, `hinsichtlich`, `aufgrund`, `infolge`, `angesichts`) are tagged
  `connector`, which is what they do for a learner, and their case government is stated in `context`.
  Do NOT widen `PartOfSpeech` for them; that is a closed enum and every addition costs a linter mirror. **Wörter-surface retire set:** a Nomen-Verb collocation must
  live in the Kollokationen bank, not the single-word Wörter list. Mis-filed combos are listed in
  `RETIRED_VOCAB_IDS`; **`browsableVocabulary`** (= bank − retired) is what every "words" surface
  reads (Wörter browse, `lib/search.ts`, session word pools, `Sammlung.tsx`). `vocabById`/
  `vocabulary` stay the FULL bank so ids still resolve. `lintVocabCollocationOverlap` **errors** if
  a vocab `de` equals a collocation `full` unless the id is retired: add the combo to Kollokationen
  + the id to `RETIRED_VOCAB_IDS`.
- **Collocations** (`src/data/collocations.ts`, ~1,072 Nomen-Verb pairs): `id` (`c_` prefix +
  snake_case), `noun`, `verb`, `full`, `en`, `register` (`neutral`|`formal`), `themeId`,
  `example {de, en}`, optional `cefr`/`subThemeId`/`sectors[]`.
- **Grammar** (`src/data/grammar.ts`, 24 topics / 117 drills): `GrammarTopic` with `id` (`g_`),
  `group`, `cefr` (REQUIRED, completeness-checked), `title`, `titleDe`, `purpose`, `purposeDe`,
  `explanation`, `explanationDe` (the German-FIRST lesson text; EN shows only via the hold-to-peek
  chip), `pattern`, `examples`, `pitfalls`, `pitfallsDe` (parallel, same order/length), `drills[]`.
  Topics ordered by B2-marker priority (`grammarMeta.ts` `groupOrder`). Drills: `id`, `prompt`,
  `answer`, `options?` (MCQ) or none (word-order), `explain`, `gloss` (lesson hides gloss behind
  the EN peek; sessions keep it visible).
- **Redemittel** (`src/data/redemittel.ts`, ~158; `r_` prefix).
- **Can-Do milestones** (`src/data/canDo.ts`, 52): `id` (`cd_`), `themeId`, `cefr`, `statement`
  (German, must start with "Ich kann"), `en`, `threshold` (0..1 theme-mastery ratio). Aligned to
  the CoE CEFR self-assessment descriptors (cited in provenance, never reproduced). Keep ascending
  `cefr`/`threshold` within a theme; add a `can_do` provenance row (`draft`).
- **Lese-/Hörtexte** (`src/data/texts.ts`, 36 texts / 108 checks): `id` (`tx_`), `kind` (closed
  enum letter/email/memo/announcement/voicemail), `themeId`, `cefr`, `title`/`titleEn`, `de`
  (blank-line paragraphs), `en`, `checks` (2-3 MCQs: German `question`, `options`, `answer` among
  options, optional `explain`; check ids globally unique), optional `subThemeId`/`sector`.
  Authored authentic-STYLE (fictitious names/numbers), CEFR-calibrated. Results feed XP/theme
  progress, NOT vocab FSRS (no SRS fields). Voicemails double as TTS listening input.
- **Writing prompts** (`src/data/writingPrompts.ts`, ~316 tasks): per-theme POOLS of task objects
  `{ text, sub?, sectors? }`; the whole pool rides ONE `wp_<themeId>` provenance row (the mission
  pattern). `sub` = declared sub-theme slug (coverage invariant: every sub-theme of the sub-themed
  themes has ≥2 short + ≥2 long tagged tasks); `sectors` = Branche tags with the untagged-=-
  universal draw rule (a selected Branche prefers tagged tasks, else falls back to untagged, never
  empty).
- **Missions** (`src/data/missions.ts`; `m_` ids) — see `docs/areas/GAME.md`.
- Other banks: `dialogues.ts` (`sc_`), `examSets.ts` (`ex_`), `themes.ts`, `domains.ts`.
- **Verb morphology** (`src/data/verbForms.ts`, 234 verbs; GENERATED, s178): Partizip II, auxiliary
  (haben/sein), Präteritum, `separable`, zu-infinitive, keyed by vocab id. Nouns carry `article` +
  `plural` on the item; verbs deliberately do NOT carry their forms as authored fields, because a
  wrong Partizip II teaches a lasting error. Regenerate with `pnpm build:verbs-subset` (network, refreshes
  `scripts/vendor/german-verbs-subset.json` from `german-verbs-dict`) then `pnpm build:verb-forms`
  (offline). 225 of 234 forms are dictionary-attested, 9 come from the regular weak paradigm and are
  marked `source: "rule"`. **The auxiliary is the one hand-maintained field** (no open lexicon carries
  it): the sein-verbs are enumerated in `scripts/build-verb-forms.mjs` with a reason each, defaulting
  to haben, which is right for every transitive and every reflexive. The linter gates coverage (a verb
  with no forms is an ERROR), rejects entries on non-verbs, validates the auxiliary value, and
  cross-checks it against any `context` prose claiming "Perfect with 'sein'" (that check caught
  `sich ereignen`, where the prose was wrong: reflexives always take haben).
- **Label collisions are linted (s178):** two browsable entries may not share a German headword when
  the gloss or the theme also matches (genuine homonyms across themes, like `der Empfang`, warn
  instead), and two entries in ONE theme may not share an English gloss, because a theme is a quiz
  pool and the option would appear twice. Retire the loser via `RETIRED_VOCAB_IDS`, or differentiate
  the glosses.
- **No subscript/superscript digits** in `de`/`plural`/`en`/`noun`/`verb`/`full` or an example
  (linted): `normalizeTyped` and the fuzzy search normalizer strip them, so "CO₂-Ausstoß" grades a
  learner who types "CO2-Ausstoß" as wrong and cannot be found by searching "co2". Write CO2.
- **Generated, do not hand-edit:** `src/data/frequency.ts` (`pnpm build:frequency`),
  `src/data/verification.ts` (`pnpm build:verification`), `src/data/verbForms.ts`
  (`pnpm build:verb-forms`).

## Linter (`pnpm lint:content`)
`scripts/lint-content.mjs` loads every bank through Vite's `ssrLoadModule` and checks: duplicate
ids; broken dialogue branches (bad `next`, orphan/dead-end nodes, `start` integrity);
missing/empty required fields; dangling cross-references (`themeId`, `scenarioId`,
Redemittel/grammar/weakness categories); taxonomy integrity (domain registry completeness, theme
`domain`/`context`, every closed-enum facet validated when present, every `subThemeId` declared on
its parent theme); Can-Do integrity (unique ids, valid `themeId`/`cefr`, the "Ich kann" prefix,
`threshold` in `(0,1]`, every theme covered); text-bank integrity (closed `kind` enum, the
2-3-checks contract, answers among options, globally unique check ids); em dashes in copy;
provenance register integrity (every content_id has a row; license on the commercial-safe
allowlist; authored/adapted items without a `reference` warn); mission graph integrity (routing +
battle graphs resolve and reach a win, content-bank ids exist, required key items obtainable,
acyclic dependencies; `GAME_SPRITES` errors on a `GameNpc.sprite` with no registered art); global
content-id uniqueness ACROSS banks + per-bank id prefixes (v_/c_/g_/sc_/ex_/r_/cd_/tx_/m_/wp_);
the verified-content fingerprint gate (`stamp:verified`); the `ID_RENAMES` registry; writing-task
text/sub/sectors validity. Plural is intentionally NOT required on nouns (uncountable/plural-only).
It also writes `docs/reports/related-terms-report.md` (unresolvable `related` terms = dropped
word-graph edges, by design; visible, not a gate).

## Provenance register (`src/data/provenance.ts`)
One `ProvenanceEntry` row per content_id: `origin` (authored/sourced/adapted), `reference`
(Wiktionary/DWDS/Tatoeba URL), `license` (SPDX from the allowlist), `review_status`
(draft/verified), who added/verified. All ~3,273 items have rows with non-empty `reference`; **all
are `draft`, 0 `verified`** (human verification reset to zero 2026-07-22 at founder request; the
`human` tier on `/sources` reads 0 until the review pass restarts). The register is **two
concatenated array literals** (`provenancePart1/2`, TS2590); append new rows to the second. Game
missions get one row per mission id. Full policy: `docs/strategy/DATA_GOVERNANCE.md` (traceability
over ownership; Wiktionary/DWDS for word facts; Tatoeba CC-BY for example sentences).

**Sourcing limit (read before transcribing anything):** individual word facts are free to use, but a
specific *published* word list (Goethe Wortliste, telc, Klett) can carry compilation / EU database
rights in its **selection and arrangement**. Verify entries against open references; never copy a
curated list wholesale, and never carry a source book's section names or ordering into ids, comments
or provenance notes. telc/Goethe/Klett materials are on the explicit do-not-use list in
`DATA_GOVERNANCE.md` and the "Sources to avoid" table in `PROJECT_REFERENCE.md`.

**Register size is a build constraint (s175).** The `/sources` + `/admin/pruefen` workbench chunk
bundles the whole register, so it grows with the banks and nothing else. Workbox refuses to precache
any single asset over **2 MiB** and **fails `pnpm build`** when it meets one, with an error naming the
service worker rather than the content that caused it. The chunk sat at ~1.96 MB at 3,107 rows, about
**200 content items** short of the ceiling, so `vite.config.ts` now lists `**/useWorkbench-*.js` in
`globIgnores`: founder-only, needs the network anyway, so it loads on demand instead of being
precached. If that line is ever removed, a large content pack will break the build again.
