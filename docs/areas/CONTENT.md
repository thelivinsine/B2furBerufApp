# Content conventions — banks, taxonomy, provenance

Read this before adding or editing anything under `src/data/`. The add-content workflow checklist
lives in the `/content` skill (`.claude/skills/content/SKILL.md`); this file is the reference.
Counts below are as of s185 (verified against `pnpm lint:content`); re-verify before quoting.

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
  `transport` is labeled "Transport & Logistik". Branche renders LAST in the rail hierarchy
  Lebensbereich → Thema → Unterthema → Branche (founder s199; it used to lead), and locks where no
  item carries the tag; `?sector=` is a single-value scope param; sector-tagged
  items sort first when a Branche is selected. As a scope it escapes the ≤12-option facet cap AND
  the coverage floor. The singular `sector` field is retired (linter errors); `office` stays
  deleted as a category error; `workSituation`/`counterpart`/`taskType` stay retired (linter errors
  on reintroduction). Retag-audit report: `docs/reports/sector-audit-report.md`.
  **On WRITING TASKS a Branche tag must be EARNED (s199):** the brief (instruction + Leitpunkte +
  Adressat) has to contain a marker of that workplace, defined once in `scripts/sector-markers.mjs`
  and enforced by `lint:content` plus `tests/writingScope.test.ts` (one lexicon, so gate and test
  cannot drift). This replaced the "all 15 Branchen on every Thema at both lengths" coverage floor,
  which was satisfiable by tagging and duly was: all 40 pools carried exactly 15 sectors, the size
  of the enum, in pools as small as 11 tasks, and 199 of 600 tagged tasks named an industry their
  brief never entered. 331 unearned tag instances were stripped; 220 tasks became universal again.
  Authoring rule: when a real sector term is missing from the lexicon ADD IT; otherwise drop the
  tag, which costs no reach because Branche is soft and untagged = universal. Measured after the
  strip: Beruf pools average 13.4 of 15 sectors with earned content (floor 8, `travel`, because a
  Dienstreise is genuinely industry-neutral), Alltag 3.0. Full audit:
  `docs/reports/writing-tasks-audit-2026-08-07.md`.
  **Axis rule: Branche = where you work, Thema = what you are doing; never reuse a label across
  axes.** Situation = the sub-theme grain of Thema, never a separate axis.
- **`mode`** (`LearningMode` in `useSettingsStore`, default `both`) is a top-level lens chosen at
  onboarding, switchable in Einstellungen → Lernen, persisted via cloudSync. It filters the
  dashboard intent cards; it does NOT gate any facet (facet visibility follows the coverage floor
  in `lib/facets.ts`, `MIN_FACET_COVERAGE`/`MIN_FACET_VALUES`).
- Helpers: `filterVocab({theme, sub, cefr})`, `vocabBySubTheme`, `collocationsBySubTheme`.

## Banks
- **Vocabulary** (`src/data/vocabulary.ts`, ~1,743 words): each entry has `id` (`v_`), article
  (nouns), plural **or** `numerus` (see below), pronunciation hint, two example sentences, related terms; all
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

### Texts: exam length and the Notizen task (audit P3, s185)
The bank's median was **90 words**, which can be read in full every time, so nothing exercised the
two B2 reading skills (skim for gist, scan for detail) and all 108 checks were literal retrieval.
s178 added 6 C1 texts at 305-344 words; s185 added **8 at B2**, chosen so every domain has at least
two exam-length texts: gesundheit and bildung had **none** (arzt ×2, bildung ×2), plus customer,
logistics · bank, mobilitaet. Range 288-333 words, three checks each, and a check must need an
inference ACROSS paragraphs (which of three changes helps you and why; what follows from a
condition stated two paragraphs earlier), never a lookup.
**`notes?: TextNoteField[]`** marks a listening text that carries a **Notizen task**: the facts a
voicemail exists to deliver (callback number, new time, deadline, what to bring). All 6 voicemails
carry 5 fields each. `label` is what to catch, `value` is what the message said, so the learner
self-corrects. The linter requires both halves and warns if a non-voicemail carries the field.
**Keep a `value` under ~32 characters:** it is a note, not a sentence ("Rückflug Do. gestrichen",
not "Der Rückflug am Donnerstag wurde gestrichen"), and a one-line value is what keeps the sheet the
same height before and after the reveal.
**The step ships as founder-picked variant A** (`preview/notizen-a-r2.html`), in `ReadingBlock`
between the audio and the comprehension checks, and only while the text is actually being listened
to: with the text on screen, noting it is copying. Its shape is founder-settled, so treat it as
locked: the message tile carries the Himmelblau fill and the Notizen sheet is the white one (the
colours were swapped on request); fields are ruled LINES, never boxes; the play control is a 40px
button on the title row, never a tile of its own; and both states are one 44px row so the button
underneath does not move when the answers appear.

### Noun number: every noun says `plural` or `numerus` (audit P9, s185)
329 nouns simply had no `plural`, so "nobody authored this" and "there is nothing to author" looked
identical, and the Wörter card showed a blank where a fact belongs. Each of those now carries
`numerus` instead: **`uncountable`** (Singularetantum, no plural in ordinary use: `der Stress`,
`das Gepäck`, `die Nachhaltigkeit`) or **`pluralOnly`** (the headword IS the plural: `die Spesen`,
`die Nebenkosten`, `die Stakeholder`). The linter requires exactly one of the two on every noun.
**Do not backfill a plural from the oracle without reading it.** Both lexicons attest `Stresse`,
`Supporte`, `Benzine` and `Konsense`; all four are wrong to teach a B1-B2 learner, which is why
this classification was made by hand and not generated. `pluralLabel()`
(`src/features/vocabulary/pluralLabel.ts`) renders the three cases as the plural, `kein Plural` or
`nur Plural`, and `verify:facts` reads `pluralOnly` instead of inferring it from a `die` + masc/neut
oracle disagreement.

### CEFR band: what "advanced" means (audit P7, s185)
A band is a claim about how demanding a word is, not about how rare it is. Two drifts were fixed:
**the connectors were over-levelled** (`somit` B2.2, `angesichts`/`vielmehr`/`ferner` C1, when these
are exactly what a B1 learner needs to sound coherent) and **B2.2 had become a Fachsprache bucket**
(82% specialized-or-rarer, so `die Lieferkettentransparenz` held the same SRS slot as `trotzdem`).
108 items were re-levelled: the 10 FLAG connectors to B2.1 (register is real, C1 was not), and 98 of
the 105 WATCH items to B1.1/B1.2. Bands went A2 13 · B1.1 131→**147** · B1.2 396→**482** ·
B2.1 774→**690** · B2.2 387→**382** · C1 34→**29**, so the B1 half is 36% of the bank, not 30%.
Seven WATCH items stayed B2.1 on purpose because their register really is B2: `darüber hinaus`,
`zudem`, `ebenso`, `zur Sprache bringen`, `einerseits … andererseits`, `die Anerkennung`,
`die Ich-Botschaft`.

**The rare-compound ratchet** (`lintAdvancedRareRatchet`) freezes the count of B2.2/C1 items that
are specialized-or-rarer at its current 334. Existing ones are grandfathered; adding one fails the
lint. When a new item trips it, the fix is nearly always to pitch it at the band a learner actually
meets it in. **Standing rule from the same audit item:** new vocabulary slots go to core verbs,
adjectives and connectors before they go to another closed compound. Only 9% of the bank is core
(Zipf ≥ 4.5) and 54% sits below "häufig"; the collocation bank, at 71% häufig-or-above, is the
model. Raising the ceiling is a deliberate edit with a reason, never a way to land a pack.

### Pronunciation: ONE respelling scheme (audit P9, s185)
`pron` is an anglicised respelling for an English-reading learner. It used to be **two** schemes
split by authoring wave (the workplace half wrote /aɪ/ `y` and /x/ `kh`; the daily-life half wrote
them `ai` and `x`, and `der Reisepass` shipped both spellings side by side), which makes the field
useless: a symbol has to mean one sound. The scheme, enforced by `checkPron` in the linter:

| Sound | Write | Example | Never |
|---|---|---|---|
| /aɪ/ (ei, ai) after a consonant | `y` | `TSYT-plahn`, `ZI-cher-hyt` | `ai` (reads like "rain") |
| /aɪ/ starting a syllable, closed by n | `INE` | `INE-kowfs-vaa-gen` | `AIN`, `AYN`, `EYN` |
| /aɪ/ starting an open syllable | `EYE` | `EYE-mer` | a bare `Y` (reads /j/) |
| /ɔʏ/ (eu, äu) | `oy` | `ROY-moong` | `oi` |
| /x/ (ach-Laut) | `kh` | `NAAKH-for-de-roong` | `x` (reads /ks/) |
| /eː/ (long e) | `ay` | `be-LAYK` | (this is why `AYN` is wrong for "ein") |
| /yː/, /øː/ (ü, ö) | `UE`, `OE` | `UE-boong` | `Uu`, `Ou`, a bare `Ü` |

The stressed syllable is CAPITALISED; a monosyllable has none to mark and is exempt. **Known gap,
deliberately not in the lint:** the ich-Laut/ach-Laut split (`ch` vs `kh`) is still inconsistent
across the bank, and `au` is written `au` in some entries and `ow` in others. Both are a bigger
re-derivation than P9 covered; do not "fix" one item in passing, fix the class or leave it.

- **Dialogues** (`src/data/dialogues.ts`, 36 scenarios; `sc_` prefix): `Scenario` with `themeId`,
  `task`, `context`, `level` 1-3, `minutes`, `start` and a `nodes` record. Every option carries
  `feedback`, a `quality` score and a `uses` Redemittel tag; every scenario ends in a free-speak
  node (`prompt` + `model`, audit P4 in s182) and a narrator end node. Option ids are
  scenario-scoped, not global (`d1a` recurs across scenarios); only the `sc_` id is a content_id.
  **Level 3 means the partner pushes back** (audit P4, s185): the ladder was 13/15/**2** and both
  level-3 scenarios were workplace, so the hardest speaking practice in the app was two items and
  the daily-life half had none. Six were added (customer, project, safety · behoerde, wohnen, arzt)
  to make it 13/15/**8**, three of them Alltag. What distinguishes the level from level 2: the
  partner counters after a good answer, the weak options are plausible professional judgements
  rather than obvious mistakes (conceding a discount you have no authority for, agreeing not to
  report a near-miss), and the free-speak turn asks the learner to hold a position under pressure
  rather than summarise agreement. `SimulationHub` groups by level automatically, so a new scenario
  needs no UI change; keep new entries at the END of the `scenarios` array, because "Empfohlen" is
  the first not-yet-completed item in array order.
- **Collocations** (`src/data/collocations.ts`, ~1,072 Nomen-Verb pairs): `id` (`c_` prefix +
  snake_case), `noun`, `verb`, `full`, `en`, `register` (`neutral`|`formal`), `themeId`,
  `example {de, en}`, optional `cefr`/`subThemeId`/`sectors[]`.
- **Grammar** (`src/data/grammar.ts`, 32 topics / 320 drills, 18 groups): `GrammarTopic` with `id` (`g_`),
  `group`, `cefr` (REQUIRED, completeness-checked), `title`, `titleDe`, `purpose`, `purposeDe`,
  `explanation`, `explanationDe` (the German-FIRST lesson text; EN shows only via the hold-to-peek
  chip), `pattern`, `examples`, `pitfalls`, `pitfallsDe` (parallel, same order/length), `drills[]`.
  Topics ordered by B2-marker priority (`grammarMeta.ts` `groupOrder`). Drills: `id`, `prompt`,
  `answer`, `options?` (MCQ) or none (PRODUCTIVE: the learner types the answer, graded by
  `normalize()` so case and punctuation are forgiven), `explain`, `gloss` (lesson hides gloss behind
  the EN peek; sessions keep it visible). **EVERY topic carries 10 drills with ≥3 productive**
  (audit P5: the bank was 131 MCQ against 6 productive, so it tested recognition and called it
  practice); `tests/grammar.test.ts` gates that per topic, plus the group registry and drill-id
  uniqueness. A productive answer must be unambiguous, since it is compared as one string. The B1
  accuracy canon that was missing entirely (Adjektivdeklination, Perfekt/Präteritum, Verben mit
  Präpositionen, Komparativ/Superlativ) shipped in s182. **s185 closed the B2/C1 half**: those 21
  topics sat at 4-5 drills with zero productive between them, so the hardest grammar in the app was
  also the only grammar a learner was never asked to produce, and a topic was exhausted in one
  sitting. 125 drills added (107 across the 21 B2/C1 topics, 18 bringing the last 7 B1 topics to
  10), so the bank is 195 → **320 drills, 33% productive**.
- **Redemittel** (`src/data/redemittel.ts`, 220; `r_` prefix): `id`, `de`, `en`, `category`
  (closed enum, 18), `register` (neutral/formal), `example` (de + en), optional `note`, `cefr`,
  `themeId`. **`themeId` is untagged-=-universal** (audit P6, s182), like Branche and unlike
  Wörter/Kollokationen where every item carries one: a phrase is tagged only when it belongs to one
  theme's situation (Vortrag → meetings, Bewerbung → bildung, Amt/Arzt/Wohnen/Bank/Reklamation →
  their Alltag theme), and an untagged phrase shows under EVERY Thema and in every learning mode.
  Blanket-tagging the discussion functions would be a sticker, not information, and
  `tests/redemittel.test.ts` fails if a pass ever does it. The 15 original categories were all
  workplace channels or discussion functions; the three Alltag speech acts (`appointments`,
  `formalities`, `complaints`) carry the counter language. Every category must have phrases behind
  it (the s180 `bewerbung` lesson: a permanently empty dropdown option is a broken control).
- **Can-Do milestones** (`src/data/canDo.ts`, 57): `id` (`cd_`), `themeId`, `cefr`, `statement`
  (German, must start with "Ich kann"), `en`, `threshold` (0..1 theme-mastery ratio). Aligned to
  the CoE CEFR self-assessment descriptors (cited in provenance, never reproduced). Keep ascending
  `cefr`/`threshold` within a theme; add a `can_do` provenance row (`draft`).
- **Lese-/Hörtexte** (`src/data/texts.ts`, 50 texts / 150 checks): `id` (`tx_`), `kind` (closed
  enum letter/email/memo/announcement/voicemail), `themeId`, `cefr`, `title`/`titleEn`, `de`
  (blank-line paragraphs), `en`, `checks` (2-3 MCQs: German `question`, `options`, `answer` among
  options, optional `explain`; check ids globally unique), optional `subThemeId`/`sector`.
  Authored authentic-STYLE (fictitious names/numbers), CEFR-calibrated. Results feed XP/theme
  progress, NOT vocab FSRS (no SRS fields). Voicemails double as TTS listening input.
  **Two length bands:** the original 36 run 57-116 words, which is fine for a quick check but too
  short to train skimming or inference; the **14 exam-length texts** run 288-344 words with
  inference-level checks, the band a B2/C1 reading task actually uses (six `tx_c1_*` from s178,
  eight `tx_b2_*` from s185). New long texts follow those fourteen, and every domain now has at
  least two. The `de` and `en` paragraph counts MUST match (both are blank-line split and rendered
  side by side).
- **Writing prompts** (`src/data/writingPrompts.ts`, 717 tasks, ALL servable): per-theme POOLS of
  task objects `{ id, text, sub?, sectors?, level?, format?, points?, ... }`; the whole pool rides ONE
  `wp_<themeId>` provenance row (the mission pattern). `sub` = declared sub-theme slug;
  `sectors` = Branche tags with the untagged-=-universal draw rule (a selected Branche prefers
  tagged tasks, else falls back to untagged, never empty), applied per theme and LAST.
  **`level`, `format` and `sub` are HARD filters** (`lib/writingScope.ts`). An untagged task is not
  "every Niveau" and certainly not "every Textsorte", so it is simply not a match, and a Textsorte
  with no task at a length reads as unavailable there.
  **Only a task with Inhaltspunkte is SERVED** (founder decision, 2026-07-31): the full shape is
  instruction + `addressee` + `register` + 2-5 `points` + `level` + `format` + `words`, which is what
  `evaluate-writing` grades Aufgabenerfüllung against.
  **The 373-task backlog is CLOSED (waves 3 and 4, s181).** Every task was authored up to that shape
  in place: same ids, same pool positions, only text and tags changed. Gated in
  `tests/writingScope.test.ts`, so these are invariants now, not aspirations:
  - **Unterthema:** every declared sub-theme has ≥2 short + ≥2 long servable tasks.
  - **Branche: a tag is EARNED, and the old all-15-per-Thema floor is GONE (s199).** The floor was
    satisfiable by tagging, and tagging is what happened (199 of 600 tagged tasks named an industry
    their brief never entered). A `sectors` tag now requires a marker of that workplace in the brief,
    checked by `scripts/sector-markers.mjs`, the ONE lexicon shared by `lint:content` and
    `tests/writingScope.test.ts`. Beruf pools keep ≥8 of 15 sectors earned; Alltag has few, honestly.
    Add a missing word to the lexicon rather than dropping a true tag; dropping a false one costs no
    reach, because Branche is soft.
  - **Argumentation (s200):** a `stellungnahme`, `forumsbeitrag`, `widerspruch` or `beschwerde` at
    B2 or above carries ≥1 Leitpunkt demanding a reason, a consequence or a stance
    (`scripts/justification-markers.mjs`, same shared-lexicon arrangement). `level` is what makes
    `evaluate-writing` mark strictly, so a brief that only describes gets the learner marked down for
    obeying it. Fix by REPLACING the weakest descriptive point, never by adding a fifth. B1 is exempt.
  - **Textsorte:** all 16 exist; `bewerbung` lives under Bildung (`anerkennung` + `weiterbildung`)
    and, since s200, under Wohnen (a Wohnungsbewerbung). **One deliberate zero: C1 + E-Mail
    (privat)**, which has no exam analogue; the rail greys it with an honest count.
    **The tag follows the REQUESTED OUTPUT, not the situation** (s200): "Sie führen das Protokoll …
    Halten Sie die Ergebnisse fest" is a `protokoll` however the situation is framed, while an
    incoming Reklamation the learner answers with a Nachricht is a `nachricht`.
  - **Register:** a `du` brief never names a title + surname. The Adressat drives the Anrede, so
    "Kollegin, Frau Bauer" with register `du` instructs "Hallo Frau Bauer, … kannst du …", which a
    German reader marks as wrong. Gated in `lint:content` since s200; use a first name, or `sie`.
  - **Niveau:** B1 307 / B2 302 / C1 108. Kurz stays B1-heavy on purpose (a 40-word task with three
    Leitpunkte is B1 work); promotion to B2 is limited to Lang tasks in demanding genres.
  Word targets are determined by (Niveau, Länge), and nothing else: B1 40/80, B2 100/150, C1 120/200
  (short/long). The `exam` field that claimed to set them was RETIRED in s200 (audit P3): no surface,
  filter or grader read it, so it drifted (69 tasks out of band, 61 `goethe_b1` tasks at 150 words).
  `lint:content` errors if it reappears.
- **Missions** (`src/data/missions.ts`; `m_` ids) — see `docs/areas/GAME.md`.
- Other banks: `dialogues.ts` (`sc_`), `examSets.ts` (`ex_`), `themes.ts`, `domains.ts`.
- **Sprech-Szenarien** (`dialogues.ts`, 30): `id` (`sc_`), `themeId`, `title`, `task`, `context`,
  `level` 1-3, `minutes`, `targetRedemittel[]`, `start`, `nodes` (keyed by node id, unique WITHIN
  the scenario only). A node is a choice node (`options[]`, each with `next`, `quality`, `feedback`,
  optional `uses`) or a **free-speak node** (`prompt` + `model` + `next`, no options). **Every
  scenario must carry at least one free-speak node with a model answer, on every path** (audit P4,
  s182: 20 of 30 ended on a multiple-choice turn, so the speaking trainer never asked for produced
  speech). `tests/scenarios.test.ts` gates it, together with node-reference integrity and
  reachability. Level 3 is still thin (2 of 30) and is the open half of P4.
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
text/sub/sectors validity; **every noun carries `plural` XOR `numerus`**, and **`pron` follows the
one respelling scheme** (both above). Those two report as a WARNING rather than an error on a
human-verified row: fixing one would change the content its `verified` stamp is fingerprinted
against, and only a human may re-verify, so the 12 affected rows are surfaced for the next review
pass instead of being edited through the gate.
It also writes `docs/reports/related-terms-report.md` (unresolvable `related` terms = dropped
word-graph edges, by design; visible, not a gate).

### The three pedagogical-shape gates (`scripts/content-shape.mjs`, s198)
The audit's closing observation was that structural quality is systematised and pedagogical shape is
not: a linter for every enum, a gate for every fact, and **no** gate for "is this word worth
learning", "is this band plausible" or "does this theme have a balanced part-of-speech mix". These
three are those gates, run from `lint:content` over the BROWSABLE bank (retired ids excluded) and
skipped wholesale when the generated frequency map is missing. Every threshold is the MEASURED state
on the day it landed, so none of them makes today's content illegal; raising one is a deliberate
edit in `content-shape.mjs`, with a reason.

| Gate | Rule | Anchor |
|---|---|---|
| Worth learning | share of specialized-or-unattested items may not grow | **53.87 %** |
| Worth learning | items with no corpus evidence at all may not grow | **100** |
| Band plausible | a `core`-frequency word may NOT be labelled B2.2/C1 | hard 0 |
| Band plausible | specialized-or-unattested items at A2/B1.1 may not grow | **32** |
| Part-of-speech | every theme carries ≥ 3 verbs AND ≥ 3 adjectives | floor |
| Part-of-speech | noun share of the bank may not grow | **77.59 %** |

A SHARE rather than a count wherever adding good content should buy room for a rare-but-necessary
item: the way past the rare-share ceiling is to add common words, which is the behaviour the audit
wanted. `tests/contentShape.test.ts` asserts each gate in both directions, because a ratchet that
cannot fire is decoration.

### One blanking rule (`src/engine/blank.ts`, s198)
Which word of an example sentence can become a gap is ONE function, shared by the MCQ cloze, the
listening cloze (`engine/quiz.ts`), the typed cloze (`engine/session.ts`) and
`report-exercise-coverage.mjs`. It used to be four copies carrying the same two defects: JavaScript's
`\b` is ASCII-only, so no umlaut-initial headword could ever match its own examples (25 words), and
only the infinitive was searched for, so every Perfekt sentence hid its verb (85 words). The rule now
looks for the headword, the Partizip II / Präteritum / zu-infinitive from `verbForms.ts`, the plural,
and the content token of a multi-word headword, and it REPORTS which form it found so distractors can
match the gap's shape (a Partizip II gap is answered against other Partizip II forms, never against a
list of infinitives that gives the answer away). Where an item has a choice it prefers the example
that does not leak its own answer inside a compound. **Authoring consequence:** an example no longer
has to contain the bare headword, so write the sentence that sounds natural.

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
