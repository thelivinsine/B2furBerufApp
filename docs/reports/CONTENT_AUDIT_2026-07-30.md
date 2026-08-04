# Content audit — coverage, quality, real-world frequency, fitness for B1–C1

_Session 178, 2026-07-30. Branch `claude/app-content-audit-92sgh1`. Every number below was measured
against the live banks on this commit (the banks were loaded through Vite exactly as
`lint-content.mjs` does), or quoted from a generated report in `docs/reports/`. Counts marked
"generated" come from `frequency.ts` / `verification.ts` / the verify:\* reports._

---

## 0. Executive summary

**The content is structurally excellent and pedagogically lopsided.**

Structure and hygiene are stronger than almost any solo-built learning product: 3,896 content
items, every one with a provenance row, every vocabulary entry with two example sentences plus a
pronunciation hint plus related terms, every quiz check and grammar drill with an explanation, every
dialogue option with coaching feedback and a quality score, zero article/plural errors surviving a
two-oracle fact gate, and 99.4% of 5,236 German sentences clean through LanguageTool. Content
correctness is not the problem.

The problem is **shape**. Five findings dominate:

| # | Finding | Size of the gap |
|---|---|---|
| 1 | **C1 is a level with no content behind it.** Onboarding offers C1; the bank holds 34 C1 words, 16 C1 collocations, 3 C1 Redemittel, **0 C1 grammar topics, 0 C1 texts, 0 C1 Can-Dos**. A C1 learner gets the B2 app. | The entire top band |
| 2 | **The bank is a noun museum.** 79% nouns (1,366), 13% verbs (234), 5% adjectives (88). Nouns carry article + plural; **verbs carry no Partizip II, no auxiliary, no Präteritum, and 0 of 234 state their case or preposition**. Adjectives carry no comparative/superlative. | The plateau is not a noun problem |
| 3 | **Reading and listening are a quarter of exam length.** 36 texts, median **90 words**, longest 116. Goethe/telc B2 Lesen texts run 300–450+. Listening = 6 voicemails read by TTS. | Skimming, scanning and note-taking are untrainable |
| 4 | **Half the vocabulary is rarer than "häufig".** 54.3% of items sit below Zipf 3.5, 21% below 2.5, 100 items have no corpus evidence at all; only 162 items (9%) are Kernwortschatz. B2.2 is now 72% Fachsprache compounds. | ~900 items competing for SRS slots |
| 5 | **The speaking and exam content is authored but dark.** 30 branching dialogues (158 nodes, 335 coached options) and 15 exam sets live behind `/anwenden`, which was taken off the nav on 2026-07-13 "not needed for the demo". Reachable only by deep link or one dashboard card. | ~12% of authored content, and the whole speaking skill |

Everything else in this report is detail, ranked at the end.

---

## 1. Inventory

| Bank | Count | Notes |
|---|---:|---|
| Vocabulary | **1,743** | 1,735 browsable (8 retired as mis-filed Nomen-Verb combos) |
| Collocations (Nomen-Verb) | **1,072** | 843 distinct nouns, 481 distinct verbs |
| Redemittel | **158** | 15 categories |
| Grammar topics | **24** | in 16 groups, **117** drills |
| Lese-/Hörtexte | **36** | **108** comprehension checks, 3,238 words of German total |
| Dialogues (Sprechsimulation) | **30** | 158 nodes, 335 options |
| Exam sets | **15** | all one task shape (paired decision-finding) |
| Writing tasks | **643** | 324 kurz / 319 lang across 20 pools |
| Can-Do milestones | **52** | 2–3 per theme |
| Missions (Neuland) | **6** | chapter 1 only |
| Themes / sub-themes / domains | **20 / 46 / 5** | |
| Provenance rows | **3,273** | 100% coverage, 100% `authored`/`OWNED` |
| Machine-verification rows | **3,107** | generated |
| Frequency rows | **2,693** | generated |

Total learner-facing content items: **3,896**.

---

## 2. Coverage

### 2.1 Theme and domain balance — the repositioning has not reached the bank

CLAUDE.md (session 21) repositioned the product from "B2 Beruf speaking prep" to the B1–B2 plateau,
with daily-life domains "core, not optional". The vocabulary still reads like the old scope:

| Domain | Vocab | Collocations | Texts | Dialogues | Writing tasks | Can-Do |
|---|---:|---:|---:|---:|---:|---:|
| beruf (10 themes) | **1,086 (63%)** | 616 | 12 | 10 | 406 | 22 |
| alltag (7 themes) | 487 (28%) | 350 | 18 | 16 | 190 | 24 |
| gesundheit (arzt) | 80 | 56 | 3 | 2 | 24 | 3 |
| bildung | 82 | 50 | 3 | 2 | 23 | 3 |

Per-theme vocabulary ranges from **49 (einkaufen, essen, mobilitaet, freizeit, digitales) to 217
(customer)**, a 4.4× spread. The five newest `alltag` packs are all exactly 49/40 — starter-sized
and untouched since. Meanwhile `customer` (217), `technology` (190) and `safety` (169) are three
times any daily-life theme.

**Sub-theme structure is inverted.** All 10 daily-life themes have 4 sub-themes each; of the 10
workplace themes only `meetings` (3) and `customer` (3) have any. `scheduling`, `logistics`,
`conflict`, `project`, `technology`, `sustainability`, `safety`, `travel` have **none** — so 1,019 of
1,735 words (59%) and 560 of 1,072 collocations (52%) carry no `subThemeId`, and the Unterthema
dropdown is empty for exactly the themes with the most content.

Sub-theme coverage where it exists is healthy: every one of the 46 sub-themes clears the ≥2 short +
≥2 long writing-task floor, and every one has 5–42 words and 7–19 collocations. The thinnest is
`essen.bezahlen` (5 words).

### 2.2 Skill coverage

**Reading / listening (weakest).** 36 texts, 5 genres (12 email, 10 announcement, 6 voicemail,
5 letter, 3 memo). Median **90 words**, range 57–116, 3 checks each, all with `explain`. Two
structural problems:

- **Length.** No text approaches exam length. At B2 a candidate must skim a 400-word Fachartikel
  for gist and scan for detail; nothing in the bank exercises that, because 90 words can be read
  in full every time. The comprehension checks are correspondingly literal (all 108 are
  3-option retrieval questions; none requires inference across paragraphs).
- **Reuse.** The session composer takes **one reading block per session**, sampled at random
  (`engine/session.ts:585`), and there is **no per-text completion tracking anywhere in
  `useProgressStore`** — so nothing can exclude a text a learner has already read. With a theme
  scope active the pool is 1–3 texts (behoerde has 2), so scoped learners see the same text
  alternating.

Listening is 6 voicemails spoken by the browser's TTS voice. No authentic audio, no two-speaker
listening, no note-taking or Notizen task, no A2/B1.1 listening at all.

**Speaking.** 30 branching dialogues, well built: every one of the 335 options carries a `feedback`
line, a `quality` score and a `uses` Redemittel tag, and 128 of 158 nodes carry both a gloss and
progressive hints. Two limits:

- **Mostly recognition, not production.** Only the 10 original workplace scenarios have a free-speak
  node with a model answer. The 20 newer scenarios are 100% multiple-choice: 4 choice nodes, 12
  options, 0 free-speak. So the newer half of the speaking content never asks the learner to
  produce a sentence.
- **Difficulty ceiling.** Level 1: 13 scenarios, level 2: 15, **level 3: 2** (`sc_konflikt`,
  `sc_nachhaltigkeit`). The hardest speaking practice in the app is two scenarios.

**Writing (strongest).** 643 tasks, 16 Textsorten, register split 255 Sie / 15 du, exam shapes
telc_b2_beruf 141 / dtb 34 / goethe_b1 33 / alltag 32 / goethe_c1 21 / goethe_b2 9. But the s167
exam-realistic upgrade is **42% done**: only 270 of 643 tasks carry `points` (the Inhaltspunkte the
AI coach grades against), `addressee`, `register`, `level`, `format`, `exam` and `words`. Six themes
(meetings, scheduling, customer, conflict, safety, plus partial) have 36 upgraded tasks each; the
other 14 themes have exactly **6 each**. And `source` is used by **0 of 643 tasks**, so no task asks
the learner to react to an incoming mail or forum post, which is the actual shape of Goethe B2
Schreiben Teil 1 and telc's Leitpunkte-plus-Vorlage tasks.

**Grammar.** 24 topics, all with German-first explanation, 3 examples, 2–3 pitfalls in both
languages with perfect parity, and 4–5 drills each with `explain` and `gloss`. Three gaps:

- **Format monotony.** 111 of 117 drills are multiple choice; 6 are word-order. Nothing asks for
  free production, and a topic is exhausted in one sitting (max 5 drills).
- **Canon holes.** No **Adjektivdeklination** (the single most consequential B1 accuracy topic), no
  **Perfekt vs. Präteritum**, no **Verben mit Präpositionen** as a topic (only the da-/wo-word side
  of it), no **Komparativ/Superlativ**, no Passiversatzformen (`sich lassen`, `-bar`), no subjektive
  Modalverben, no Konjunktiv I outside indirekte Rede.
- **Band coverage.** 2 topics at B1.1, 5 at B1.2, 11 at B2.1, 6 at B2.2, **0 at A2 and 0 at C1**.

**Redemittel.** 158 phrases, all with example and CEFR, 49 with a usage note. Two problems:

- **`themeId` is set on 0 of 158.** Redemittel cannot be scoped to a theme like every other bank, so
  the surface can't be filtered by Thema and the session composer can't pick topically relevant
  phrases.
- **The categories are all workplace-discussion shaped**: suggestions, agree, disagree, negotiation,
  compromise, clarification, opinion, prosCons, reactions, professionalIntro, telephoning, emails,
  presentations, jobInterview, smallTalk. There is nothing for the Amt, the Arztpraxis, the
  Wohnungsbesichtigung or a Widerspruch, so the daily-life half of the product has **no phrase bank**
  beyond what is embedded in dialogues.

**Pronunciation.** No dedicated content. The `pron` field is an ad-hoc anglicised respelling and it
is **not standardised** (see §3.5).

**Exam preparation.** 15 exam sets, all built on the same shape: a paired task where two candidates
negotiate to a shared decision, with the same 5-criterion rubric. That matches Goethe B2 Sprechen
Teil 2 / telc B2 Beruf Teil 3. **Missing entirely: the solo Vortrag** (Goethe B2 Sprechen Teil 1),
any Lesen mock, any Hören mock, and any timed full-exam Schreiben run. Combined with §2.2's text
lengths, the "direct preparation for telc Deutsch B2 Beruf and Goethe-Zertifikat B2" claim is
currently honoured for **speaking (one task shape) and writing**, not for reading or listening.

### 2.3 CEFR band coverage

Exact-band pools (what a learner sees in focus mode, where `v.cefr === band`):

| Band | Vocab | Collocations | Redemittel | Grammar | Texts | Can-Do |
|---|---:|---:|---:|---:|---:|---:|
| A2 | 13 | 9 | 3 | 0 | 0 | 1 |
| B1.1 | 131 | 63 | 31 | 2 | 0 | 5 |
| B1.2 | 396 | 259 | 49 | 5 | 14 | 18 |
| B2.1 | **774** | **520** | 56 | 11 | 18 | 20 |
| B2.2 | 387 | 205 | 16 | 6 | 4 | 8 |
| C1 | **34** | 16 | 3 | **0** | **0** | **0** |

The bank is a **B2.1-centred pyramid**: 45% of the vocabulary sits in one band. For the stated B1–B2
plateau audience the B1 half (B1.1 + B1.2 = 527 words, 30%) is the thinner half, and everything
below B1.1 is a rounding error.

**C1 is the headline gap.** `CefrLevel` in `useSettingsStore` offers C1 at onboarding;
`defaultVisibleBands("C1")` returns every band, so a self-declared C1 learner gets exactly the B2
experience. Behind the label there are 34 words, 16 collocations, 3 phrases, no grammar, no texts and
no milestones. If B1–C1 is the target audience, this is the largest single hole in the product.

### 2.4 Branche (sector) coverage

All 15 sectors have a starter pack and none is empty. Spread: production 80 / engineering 71 /
construction 65 / it 55 vs sports 32 / security 33 / transport 33 / beauty 34. Writing tasks are
evenly tagged (14–20 each). 73% of vocabulary and 79% of collocations stay untagged (= universal),
which is the correct default under the untagged-is-universal rule.

---

## 3. Quality

### 3.1 Structural completeness: effectively perfect

| Check | Result |
|---|---|
| Vocab with exactly 2 examples | 1,735 / 1,735 |
| Vocab missing `pron` / `context` / `related` | 0 / 0 / 0 |
| Nouns missing an article | 0 / 1,366 |
| Text checks with an explanation | 108 / 108 |
| Grammar drills with `explain` **and** `gloss` | 117 / 117 |
| Grammar pitfall DE/EN parity mismatches | 0 |
| Dialogue options with feedback + quality + uses | 335 / 335 |
| Collocations missing an example or theme | 0 / 0 |
| Content ids without a provenance row | 0 |
| Provenance rows without a reference | 0 |

Example sentences are well pitched: median 7 words (p25 6, p75 8, max 15), and **95.3%** of the
3,470 examples contain their own headword, so nearly every word can generate a cloze, a typed gap
and a listening item. Related terms resolve to another bank entry 85.6% of the time (507 dropped
edges, itemised in `related-terms-report.md`), which is a deliberate tolerance, not a defect.

### 3.2 Linguistic accuracy

LanguageTool 6.8 over every German sentence: **5,236 sentences, 33 with a finding, 99.4% clean, 0
grammar/agreement findings.** Most of the 34 findings are proper nouns absent from the dictionary
(Rahimi, Haddad, Okonkwo, telc-Prüfung, Lessons Learned). Genuine defects worth fixing:

- `v_monatskarte` example 1: missing comma before `so oft ich will`.
- `sc_freunde_verabreden:v3:v3b`: `Samstag Vormittag` should be `Samstagvormittag`.
- `v_co2_ausstoss` / `v_treibhausgas`: write `CO2` where `c_co2_bilanz_verbessern` writes `CO₂`, so
  the same term is spelled two ways across banks.
- `r_mail2` and `tx_engineering_memo_wartungsprotokoll`: sentence-initial lowercase (`vielen Dank`,
  `gez`), both defensible in a letter body but inconsistent.

### 3.3 Fact layer (article and plural)

Two independent lexicons vote on every noun. **0 gate-level errors across 1,366 nouns**; 1,315
articles and 864 plurals positively verified; 8 review signals, nearly all gendered job titles where
the second oracle prefers the feminine head (`der Ansprechpartner / die Ansprechpartnerin`); 163
plurals asserted with no oracle entry to compare against. This layer is in better shape than most
commercial word lists.

### 3.4 Duplicates and collisions

- **`v_konferenz_raum` and `v_konferenzraum_hotel`**: identical headword (`der Konferenzraum`),
  identical theme (`travel`), identical CEFR (B1.2), identical pron. A pure duplicate producing two
  SRS cards and two rows in the Wörter list.
- **`v_ausweis_pass` (travel, B1.2, `RYE-ze-pass`) and `v_reisepass` (behoerde, B1.1, `RAI-ze-pas`)**:
  same word, two levels, two different pronunciation respellings.
- **12 duplicate collocation `full` forms**, e.g. `einen Termin absagen` ×3, `den Vertrag kündigen`
  ×2 (once `neutral`/logistics, once `formal`/digitales), `eine Störung melden` ×2.
- **18 English glosses collide**, of which **5 collide inside the same theme**: `deadline`
  (v_frist + v_deadline, scheduling), `business trip` (v_dienstreise + v_geschaeftsreise, travel),
  `user interface` (v_nutzeroberflaeche + v_benutzeroberflaeche, technology), `evacuation`
  (v_evakuierung + v_raeumung, safety), `health insurance card` (v_versichertenkarte +
  v_gesundheitskarte, arzt).
  **This is a live defect**, not just untidiness: `translationQ` in `engine/quiz.ts:149` draws
  distractors with `pool.filter(v => v.id !== item.id)` and never compares `en`, so a translation
  MCQ can render the same option string twice, one of which is the right answer.

### 3.5 The pronunciation field is not one system

The `pron` respelling uses **two competing conventions for the same sounds**:

| Sound | Convention A | Convention B |
|---|---|---|
| /aɪ/ (`ei`) | `y` / `ey` — **176 items** (`TSYT-plahn`, `MY-len-shtyn`, `ZICH-er-hyt`) | `ai` — **83 items** (`AIN-kaufs-vaa-gen`, `PRAIS-shilt`) |
| /ɔʏ/ (`eu`, `äu`) | `oy` — 21 items | `oi` — 13 items |
| /x/ (`ch`) | `kh` — 148 items | `x` — 7 items (`MEL-de-pflixt`, `KO-xen`) |

The split tracks authoring waves: of the 176 `y`-scheme items **148 are workplace themes**, and of
the 83 `ai`-scheme items **69 are daily-life themes**. The two `Reisepass` entries show both schemes
side by side, and `v_einerseits` mixes them inside one string (`EYE-ner-zaits`). 34 items also carry
no stress marker at all. There is no IPA anywhere and no documented scheme to lint against.

### 3.6 CEFR labelling drifts high on function words and low on compounds

`verify:cefr` flags **10 reliable mislabels** and 105 watch items, and the pattern is systematic:
**high-frequency discourse connectors carry advanced labels.** `somit` (Zipf 5.04) is B2.2;
`hingegen` (4.76), `in Bezug auf` (4.72), `bezüglich` (4.46) are B2.2; `angesichts` (4.53),
`vielmehr` (4.50), `ferner` (4.41) are C1; `allerdings` (5.51) and `aufgrund` (5.16) are B2.1. These
are the exact words a B1 learner needs early to sound coherent, and they are gated behind the top
bands.

The mirror image shows in the CEFR × frequency cross-tab:

| Claimed CEFR | core | common | specialized | no evidence |
|---|---:|---:|---:|---:|
| A2 | 1 | 9 | 3 | 0 |
| B1.1 | 34 | 69 | 27 | 1 |
| B1.2 | 39 | 189 | 156 | 12 |
| B2.1 | 82 | 283 | 361 | 48 |
| B2.2 | **3** | 66 | **279** | 39 |
| C1 | 3 | 15 | 16 | 0 |

**B2.2 has become a Fachsprache bucket**: 82% of it is specialized-or-rarer. "Advanced" is being
encoded as "rare compound" rather than "structurally or pragmatically demanding".

### 3.7 Human verification is 0.4%

3,273 provenance rows: **3,260 `draft`, 13 `verified`.** The machine ladder covers 3,107 items
(2,789 at the `linguistic` tier, 188 `jury`, 130 `provenance`; confidence 0.5–0.9). So content
quality today is *machine-attested, not expert-attested*. Three founder rejections are still open
and unresolved in the bank: `v_ansprechpartner` (dead source), `v_bedenken` ("should be das
Bedenken"), `v_scope_creep` (dead source).

---

## 4. Frequency of usage (does the learner ever meet these words?)

Measured from `frequency.ts` (wordfreq Zipf values, generated 2026-07-28; 2,693 items scored).

**Vocabulary skews rare.**

| Bin | Vocab | Collocations |
|---|---:|---:|
| core (Zipf ≥ 4.5, Kernwortschatz) | **162 (9%)** | 324 (30%) |
| common (≥ 3.5, häufig) | 631 (36%) | 440 (41%) |
| specialized (≥ 1.5, Fachsprache) | **842 (49%)** | 286 (27%) |
| no corpus evidence | 100 (6%) | 22 (2%) |

- **54.3% of the vocabulary is below Zipf 3.5** (not even "häufig"); 21% is below 2.5. Median item
  Zipf is 3.46; p10 is 2.21.
- Only **162 items are core**, and 21 of those are connectors/adverbs, so the everyday backbone of
  German is barely represented as vocabulary at all.
- **Collocations are far better calibrated** than single words: 71% at "häufig" or above. The
  Nomen-Verb bank is the highest-utility asset in the product.

**What the tail actually contains.** The rarest scored items are hyper-specific compounds:
`die Kontoführungsgebühr` (1.50), `das Ergebnisprotokoll` (1.51), `die Staffelmiete` (1.52),
`die Rüstzeit` (1.63), `der Widerspruchsbescheid` (1.67), `die Rufnummernmitnahme` (1.70),
`das Energieaudit` (1.72), `die Taktzeit` (1.74), `der Schutzmaßnahmenkatalog` (no evidence),
`die Lieferkettentransparenz` (no evidence), `das Retourenmanagement` (no evidence),
`der Ampelstatus` (no evidence), `das Servicelevel` (no evidence), `die Betriebsökologie`
(no evidence). Each of these occupies the same SRS slot as `trotzdem` or `sich beziehen auf`.

**By theme** (median Zipf, and how much of the theme is specialized-or-rarer):

| Rare-heavy | median Zipf | spec + none | Well-calibrated | median Zipf | spec + none |
|---|---:|---:|---|---:|---:|
| safety | 3.07 | 113 / 169 | freizeit | **4.22** | 12 / 49 |
| bank | 3.07 | 59 / 81 (0 core items) | mobilitaet | 3.87 | 15 / 49 |
| behoerde | 3.20 | 56 / 80 | essen | 3.83 | 17 / 49 |
| wohnen | 3.20 | 53 / 81 | meetings | 3.90 | 25 / 68 |
| einkaufen | 3.30 | 32 / 49 | project | 3.78 | 41 / 105 |
| logistics | 3.32 | 57 / 94 | scheduling | 3.70 | 34 / 70 |
| customer | 3.41 | 119 / 217 | | | |
| technology | 3.47 | 100 / 190 | | | |

The daily-life packs written most recently (freizeit, mobilitaet, essen) are the best-calibrated
content in the app. The bureaucratic and workplace-technical themes are the rare-heavy ones, and
they are also the biggest.

**Usage inside the app** (from `exercise-coverage-report.md`): all 20 themes can already generate the
full 13–14 exercise types, so variety is structurally maxed at theme level. Residual per-word gaps:
**116 words** whose examples never use the word (so they can never appear as cloze, typed gap or
listening item) and **67 words** with no resolving related terms (never as odd-one-out). Both are
cheap content fixes.

**Consumption rate is the unmeasured risk.** A daily learner meets 1 reading text per session out of
36, randomly and without dedupe; 5 drills per grammar topic; 158 dialogue nodes total. Nothing in
the progress store tracks text or dialogue completion, so nothing can guarantee freshness.

---

## 5. Fitness for the B1–C1 audience, and the ranked backlog

### What genuinely serves the audience today

- **Nomen-Verb collocations (1,072).** The right unit for the plateau, 71% at "häufig" or above,
  every one with a natural example. This is the product's best asset.
- **The writing trainer's upgraded half (270 tasks).** Inhaltspunkte + addressee + register + word
  target is exactly what an examiner grades and what a coach can give feedback against.
- **Daily-life packs (freizeit / mobilitaet / essen / einkaufen / digitales).** Best frequency
  calibration, full sub-theme structure, complete writing pools.
- **Grammar lessons as reference.** German-first, purpose-framed, with parallel pitfalls. Good
  reading; thin practice.
- **The verification machinery.** Two-oracle fact gate, LanguageTool sweep, CEFR tripwire,
  100% provenance. Rare rigour.

### Ranked gaps

| P | Gap | Why it matters at B1–C1 | Cheapest first step |
|---|---|---|---|
| **P1** | **C1 has no content** (0 grammar, 0 texts, 0 Can-Do, 34 words) | A C1 learner is sold a level they cannot practise | Either drop C1 from onboarding, or ship a C1 slice: 4 grammar topics (Partizipialkonstruktionen, Nominalstil, Konzessivsätze, Modalpartikeln), 6 long texts, 5 Can-Dos |
| **P2** | **Verb + adjective morphology and valency absent**; 79/13/5 noun/verb/adjective split; 0 of 234 verbs state case or preposition; 87 separable verbs unmarked | Plateau errors are verb-frame, case and word-order errors, not noun-meaning errors | Extend `VocabItem` with `partizip2`, `aux`, `praeteritum`, `governs` (case/preposition); backfill the 234 verbs; then add verb-form and preposition drills |
| **P3** | **Texts are 90 words, listening is TTS-only** | Skimming, scanning, inference and note-taking are the B2/C1 reading-listening skills | Add 8–10 texts at 300–400 words with inference-level checks, 2 per major domain; mark voicemails that need a note-taking task |
| **P4** | **Speaking + Prüfung content is off the nav**; 20 of 30 scenarios have no free-speak node; only 2 level-3 scenarios | The speaking skill is the reason the product exists | Restore the Anwenden entry (one line in `nav-items.ts`), add a free-speak node with a model answer to the 20 newer scenarios |
| **P5** | **Grammar canon holes + 95% MCQ + 5-drill ceiling** | Adjektivdeklination and Perfekt/Präteritum are where B1 accuracy is won | Add Adjektivdeklination, Perfekt vs. Präteritum, Verben mit Präpositionen, Komparativ/Superlativ; raise every topic to 10 drills with at least 3 productive |
| **P6** | **Redemittel are workplace-only and theme-blind** (`themeId` on 0 of 158) | Half the product is daily life, with no phrase bank for it | Tag the 158 with `themeId`; add Amt / Arzt / Wohnung / Reklamation / Widerspruch packs (~60 phrases) |
| **P7** | **Rare-compound drift**: 54% below "häufig", B2.2 82% specialized, connectors over-levelled | Every rare compound displaces a high-utility item from the SRS queue | Re-level the 10 flagged + 105 watch items down; freeze new B2.2 compounds; spend the next 200 items on core verbs, adjectives and connectors |
| **P8** | **Writing bank 42% upgraded; `source` unused on all 643** | Reacting to an incoming text is the real exam shape | Finish the upgrade for the 14 six-task themes; add `source` to ~40 tasks |
| **P9** | **Content hygiene**: 2 duplicate word pairs, 12 duplicate collocations, 5 same-theme gloss collisions feeding a two-correct-answer MCQ, non-standard `pron` scheme, 329 nouns with no plural and no way to say "uncountable" | Small, visible, cheap; the MCQ one is a live bug | Retire one of each duplicate via `RETIRED_VOCAB_IDS`; de-dup by `en` in `translationQ`; document one pron scheme and lint it; add an `uncountable` flag |
| **P10** | **0.4% human-verified** (13 of 3,273) | Machine checks cannot see sense, register or naturalness | Prioritise the review queue by frequency: verify the 162 core items and the 158 Redemittel first (320 items ≈ the whole high-traffic surface) |

### Backlog status (updated as items ship)

- **Closed:** P0 hygiene bug + **P1** (the C1 slice) + **P2** (verb morphology) in s178;
  **P8** by the Schreiben work in s181 (717 tasks, every one carrying the full brief);
  **P6** in s182 (5 Alltag packs, 62 phrases, 3 new speech-act categories, `themeId` tagging with
  untagged-=-universal semantics, Thema scope on the Redemittel tab).
  **P4** across s182 (a free-speak node with a model answer on all 30 scenarios) and s185 (six
  level-3 scenarios, three of them Alltag, so the ladder is 13/15/**8** not 13/15/2). The mobile
  entry the audit listed as open was settled in s182: the bar's fifth zone is Prüfung.
  **P5** across s182 (the four missing B1 canon topics) and s185 (125 drills, so EVERY topic has 10
  drills with ≥3 productive; bank 137 → **320 drills**, productive 4% → **33%**, gated per topic in
  `tests/grammar.test.ts`).
  **P7** in s185: 108 items re-levelled (10 FLAG connectors + 98 of 105 WATCH), bands now A2 13 ·
  B1.1 147 · B1.2 482 · B2.1 690 · B2.2 382 · C1 29, so the B1 half is 36% of the bank not 30%;
  verify:cefr FLAG 10 → **0**. The "freeze new B2.2 compounds" half is a ratchet in the linter
  (`lintAdvancedRareRatchet`, ceiling 334), not a note.
  **P9** in s185: every noun declares `plural` or `numerus` (`uncountable` / `pluralOnly`), the
  `pron` respelling is ONE documented scheme with a linter gate, and the duplicate + two-correct-MCQ
  halves were already closed in s178 by `mcqOptions` and `lintVocabLabelCollisions`.
  **P3** across s178 (six C1 texts) and s185: **eight B2 texts** (288-333 words, chosen so every
  domain has ≥2 exam-length texts; gesundheit and bildung had none), all 6 voicemails carrying
  `notes`, and the learner-facing **Notizen step shipped as founder-picked variant A**, refined over
  three feedback rounds (`preview/notizen-a-r2.html`).
- **Open:** P10 only, deferred by the founder.
- **Deliberately not done:** the 12 human-verified rows that P9's two new rules touch. Editing one
  would break the content fingerprint its `verified` stamp is tied to, and only a human may
  re-verify, so the linter WARNS on them instead of erroring and they are queued for the next
  review pass. P7's third clause ("spend the next 200 items on core verbs, adjectives and
  connectors") is a standing authoring rule in `docs/areas/CONTENT.md`, not a shippable change.

### Two structural observations, not gaps

- **The daily-life half is starter-sized but better built.** The 5 newest `alltag` packs are 49
  words each yet have full sub-theme structure, the best frequency calibration and complete writing
  pools. The workplace half is 3× bigger, rarer, and has no sub-themes. If growth continues by
  "add a pack", the imbalance widens; if it continues by "deepen a pack", the daily-life packs are
  the ones with the scaffolding already in place.
- **Structural quality is systematised; pedagogical shape is not.** There is a linter for every
  enum, a gate for every fact, a report for every sentence. There is no gate for "is this word worth
  learning", "is this band plausible", or "does this theme have a balanced part-of-speech mix". The
  frequency data to build the first two already ships in `frequency.ts`.

---

## 6. Method

- Banks loaded live through Vite `ssrLoadModule` (the `lint-content.mjs` pattern), so every count is
  the shipped value on this commit, not a grep estimate.
- Frequency: `src/data/frequency.ts` (wordfreq Zipf, generated 2026-07-28), binned core ≥ 4.5 /
  common ≥ 3.5 / specialized ≥ 1.5, no bin below 1.5 by the compound rule.
- CEFR mislabel signals: `docs/reports/verify-cefr-report.md`.
- Article/plural facts: `docs/reports/verify-facts-report.md` (two-oracle gate).
- Sentence-level grammar and spelling: `docs/reports/verify-grammar-report.md` (LanguageTool 6.8).
- Exercise variety: `docs/reports/exercise-coverage-report.md`.
- Exam-shape comparisons are against published Goethe-Zertifikat B2 and telc Deutsch B2 Beruf
  format descriptions (task shapes and text lengths), not against any exam material.
