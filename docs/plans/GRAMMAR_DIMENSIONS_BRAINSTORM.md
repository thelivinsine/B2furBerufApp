# Grammar Dimensions & Transformation Options — Brainstorm + Recommendations

_Authored 2026-07-23 (branch `claude/grammar-dimensions-transformations-l3ib3m`). Extends the
Schreibtraining redesign (`docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md`) with a full catalog of the
grammatical dimensions and transformation operations the **Fokus "Satzlabor"** could offer, a
feasibility read on each, and a phased recommendation. Companion previews:
`preview/grammar-dimensions-satzlabor.html` (the built tool in action) and
`preview/grammar-dimensions-catalog.html` (the full dimension roadmap as a decision matrix)._

---

## 0. TL;DR (the recommendation in one screen)

1. **Split the taxonomy into two buckets** instead of one flat tuple:
   - **Formachsen** (grammatical axes that _combine_): **Genus Verbi × Zeitform × Modus**. Orthogonal,
     mostly rule-friendly, a small precomputable grid. This is what the current `GrammarTuple` already
     models. Promote **Modus** from a pinned constant to a real axis.
   - **Umformungen** (directional _operations_, one target each, do NOT multiply the grid): **Register**
     (Sie↔du / formell), **Satzbau** (Hauptsatz↔Nebensatz), **Stil** (verbal↔nominal),
     **Relativsatz↔Partizip**, **Kondition** (wenn→sollten/falls/bei), **Infinitiv** (Nebensatz→um…zu).
     Each is a single lazy+cached transform, not a grid cell. This is the key architectural addition.
2. **Order the menu by B2-marker value, not grammar-book order**: Passiv, Nominalstil, Konjunktiv II,
   Konnektoren lead. (Ranking in §4.)
3. **Match the engine to a feasibility tier** (§3): Tier A rule-generatable, Tier B rule-scaffold +
   tolerant grading, Tier C AI-only + rubric. Mark Tier-A/B transforms high-confidence and Tier-C ones
   "draft," mirroring the app's existing provenance discipline.
4. **Bidirectionality is a free doubling of value**: nominal↔verbal and Partizip↔Relativsatz each give a
   _produce_ (B2/C1, hard) and a _decode_ (comprehension, easier) exercise from one rule.
5. **Guardrails are the real IP** (§5): grey the blocked pill with a one-line German reason
   ("geht hier nicht: kein Akkusativobjekt") rather than force a wrong output. A refused transform
   teaches as much as a successful one.

Recommended build order: **Wave 2** = Modus(K-II) + Zustandspassiv + Register + Satzbau. **Wave 3** =
Stil(nominal), Relativ↔Partizip, Infinitiv, Kondition, anchored Plusquamperfekt, Passiversatzformen.
**Deep-link only** = Indirekte Rede (K-I), Futur-als-Vermutung, affix-Negation, Steigerung.
**Cut** = Futur II, standalone Numerus.

---

## 1. What exists today (the starting point)

The Fokus "Satzlabor" (`src/features/writing/fokus/`) is a write → correct → transform loop:

- `check-sentence` (Haiku, `temperature 0`) corrects the learner's sentence and detects
  `{voice, tense, mood}` on the **corrected** form.
- `transform-sentence` (Haiku, Sonnet-capable) rewrites the corrected sentence to a target
  `GrammarTuple {voice, tense, mood}`, with an **abstain-not-hallucinate** contract + refusal reasons.
- The rail is **data-driven** off `GRAMMAR_AXES` in `grammarDimensions.ts`, so growing the taxonomy is
  largely a data edit plus the edge-function enum + prompt.

**Backend already supports more than the UI shows.** The detection/transform enums already include:

```
VOICES  = aktiv, passiv_vorgang, passiv_zustand
TENSES  = praesens, perfekt, praeteritum, plusquamperfekt, futur1, futur2
MOODS   = indikativ, konjunktiv1, konjunktiv2, imperativ
```

The **MVP UI** only exposes a 2×3 grid: Voice {Aktiv, Vorgangspassiv} × Tense {Präsens, Perfekt,
Präteritum}, with `mood` pinned to `indikativ` (`DEFAULT_MOOD`). Everything else (`passiv_zustand`,
`plusquamperfekt`, `futur1/2`, `konjunktiv1/2`, `imperativ`) is detected-but-collapsed
(`normalizeDetected`) and not yet a pill. So a lot of Wave-2 value is a **frontend + prompt** change,
not new backend plumbing.

**The one hard-coded assumption to widen:** `useFokusMachine` names the two axes literally
(`{voice, tense}`) in `detected`, `selection`, and the `voice|tense` cache key, and `FokusTrainer`'s
`transformLabel`/`loadingValue` memos do too. A third+ axis touches exactly those spots. A new
_operation_ bucket (§0) is a new, parallel concept rather than a third tuple axis, which keeps the tuple
grid small.

---

## 2. The full dimension catalog (the brainstorm)

Fifteen candidate dimensions. "Onset" = CEFR level where the transform first becomes a productive
target. "Tier" = automation feasibility (§3). "Rank" = position in the top-10 B2-marker list (§4).
"Bank link" = the `GrammarGroup` in the 24-topic lesson bank to deep-link ("mehr dazu").

| # | Dimension (DE / EN) | Transformation options (source → target) | Onset | Tier | Rank | Bank link |
|---|---|---|---|---|---|---|
| 1 | **Genus Verbi** / Voice | Aktiv→Vorgangspassiv (werden+PII), →Zustandspassiv (sein+PII), →Passiv+Modal, →Passiversatz (man / sich lassen / sein+zu / -bar) | B1→B2 | A / C | **1** | `passive` |
| 2 | **Zeitform** / Tense | Präsens↔Perfekt↔Präteritum, →Plusquamperfekt, →Futur I (Vermutung) | A2–B1 | A | 8 | `verbPosition` |
| 3 | **Modus: Konjunktiv II** | Indikativ→höfliche Bitte (könnten/hätte gern), →irreal (wäre/hätte), →K-II Vergangenheit, würde-Ersatz | B2 | B | **3** | `konjunktiv2` |
| 4 | **Modus: Konjunktiv I / Indirekte Rede** | direkte→indirekte Rede (K-I, K-II-Ersatz, Zeit-/Deixisverschiebung) | B2→C1 | C | 6 | `reportedSpeech` |
| 5 | **Stil: Nominal↔Verbal** | Nebensatz↔Präposition+Nominalphrase (weil↔wegen, nachdem↔nach…), Verb→Nomen | B2→C1 | C / B | **2** | `wordFormation` |
| 6 | **Konnektoren / Satzverknüpfung** | Hauptsatz(deshalb/trotzdem)↔Nebensatz(weil/obwohl)↔Präposition(wegen/trotz); 2 Sätze→1 | B1→B2 | B | **4** | `connectors`, `subordinate` |
| 7 | **Satzbau / Wortstellung** | Hauptsatz↔Nebensatz (verb-final Verbklammer), Vorfeld/TeKaMoLo, Inversion | A2→B2 | B | 4 | `verbPosition`, `subordinate` |
| 8 | **Register / Formalität** | informell→formell (du→Sie + Nominalstil + Höflichkeit − Modalpartikeln) | B2→C1 | C | HM | `konjunktiv2`, `modals` |
| 9 | **Relativsatz↔Partizipialattribut** | Relativsatz→erweitertes Partizip I/II (compress), Partizip→Relativsatz (decode) | B2→C1 | C / A | **5** | `attributes`, `relativeClauses` |
| 10 | **Infinitivkonstruktionen** | Nebensatz(dass/damit/weil)↔Infinitiv (um…zu / ohne…zu / anstatt…zu) | B1→B2 | B | **7** | `infinitives` |
| 11 | **Konditionalität** | real(wenn)↔irreal(K-II)↔wenn-drop V1(Sollten Sie…)↔falls/sofern↔bei+Nomen | B1→B2 | B | 9 | `subordinate`, `konjunktiv2` |
| 12 | **Negation** | positiv→nicht/kein, →lexikalisch (nie/niemand), →affix (un-/-los), weder…noch | A2–B1 | B | 10 | `verbPosition` |
| 13 | **Frage- / Satzart** | Aussage→Entscheidungs-/W-Frage→indirekte Frage (ob/W + verb-final), Imperativ↔höfliche Bitte | A2–B1 | B | — | `subordinate` |
| 14 | **Kasus** / Case | consequence of other transforms (Objekt→Subjekt im Passiv, Genitiv im Nominalstil); Dativ↔Akkusativ | A2–B2 | A | — | `cases` |
| 15 | **Steigerung + Numerus** | Positiv→Komparativ→Superlativ, je…desto, immer+Komp.; Singular↔Plural | A2–B1 | A | — | — |

Notes: Kasus (14) is rarely a standalone drill; it _falls out of_ Passiv, Nominalstil, and clause
restructures, so surface it as feedback inside those, not as its own pill. Numerus (15) is low-value as a
standalone B2 axis; keep it as a sub-check.

### The two buckets, made explicit

| Bucket | Members | Combine? | Grid impact | Engine |
|---|---|---|---|---|
| **Formachsen** (tuple) | Genus Verbi × Zeitform × Modus | Yes, multiplicatively | grows the grid (guard size) | mostly rule/hybrid, batch-precompute while small |
| **Umformungen** (operations) | Register, Satzbau, Stil, Relativ↔Partizip, Kondition, Infinitiv, Negation, Frageart | No — each a single target | flat, no multiplication | lazy per-tap, cache-first; Tier B/C |

Keeping Umformungen out of the tuple is what prevents the "72-cell grid" cost problem the redesign plan
worried about (§4.3 there): three Formachsen at 2–3 values each is at most ~24 cells, and the operations
are O(1) buttons, not multiplicands.

---

## 3. Feasibility tiers (how each maps to the engine)

The design question per transform: **can I specify one correct target and grade deterministically?**

- **Tier A — rule-generatable, deterministic grading.** Near-unique output; generate with rules, grade
  with parse-tolerant string comparison. → Präsens→Perfekt/Präteritum/Plusquamperfekt, core
  Aktiv→Vorgangspassiv, Singular↔Plural, Komparativ/Superlativ, statement→question,
  Partizip→Relativsatz (the decode direction). Ship as **rule target + auto-check**; the app's verified
  `vocabulary.ts` (plurals, aux haben/sein data) feeds the rules. Mark high-confidence.
- **Tier B — structurally regular, multi-valid.** Teachable structure, several acceptable outputs. →
  Konnektor swaps, Konjunktiv II, Konditional variants, Infinitivkonstruktionen, Satzbau HS↔NS,
  Negation, Frageart, Relativsatz→Partizip (compress). Ship a **canonical target for the reveal**, grade
  with a **tolerant matcher + small accepted-variants set**, AI only to adjudicate borderline answers.
- **Tier C — open-ended / holistic, no single key.** Register, Nominalstil (forward), Indirekte Rede,
  "two sentences → one." → **AI-generated model answer + names the levers pulled**, AI/rubric-graded,
  never string-matched. This is where transforming the learner's _own_ sentence pays off most.

**Build heuristic.** Rule engine: Tempus, core Passiv, question-formation, Partizip→Relativsatz,
Steigerung/Numerus. Rule-scaffold + tolerant/AI adjudication: Konnektoren, K-II, Konditional, Infinitiv,
Satzbau, Negation, Relativsatz→Partizip. AI + rubric: Indirekte Rede, Nominalstil, Register.

Today's implementation is **all Tier C** (every transform is an AI call). That is fine for launch and
already cost-guarded by the global cache + $5 fuse. Tiering matters as the menu grows: the cheap Tier-A
transforms can eventually move to free deterministic rules (the plan's "Tier 1", currently launch-OFF),
shrinking spend and latency, while Tier C stays on the model. Don't block on it; treat it as a spend
optimization once cache hit-rate data is in.

---

## 4. Highest-value B2 markers — the ranking that should order the menu

These distinguish B2 writing from B1 most reliably and are what telc/Goethe reward under range/cohesion.

1. **Aktiv → Passiv (+ Ersatzformen)** — the register backbone of workplace/official German.
2. **Verbalstil → Nominalstil** — the biggest stylistic delta B1→B2/C1; report/application/Amt register.
3. **Indikativ → Konjunktiv II** — highest-frequency _productive_ politeness/hypothetical marker.
4. **Konnektor upgrade + Nebensatz verb-final** — cohesion + accuracy, directly scored.
5. **Relativsatz → erweitertes Partizipialattribut** — the most visibly "advanced" written compression.
6. **Direkte → Indirekte Rede (K-I)** — reporting register; distance/neutrality.
7. **Nebensatz → Infinitivkonstruktion** — economy + the subject-identity rule.
8. **Präteritum (report register) & Plusquamperfekt sequencing** — the register/sequence _choice_.
9. **Konditional register shift (wenn → falls/sofern/bei/Sollten-V1)** — the B2 workplace-email register.
10. **Negation/affix + register lexis** — quiet but reliable accuracy signals.

Honorable mention: full **informell→formell** register rewrite — arguably #1 in _product value_ for a
Beruf audience, but a composite of #1–#3 + #10, so it lives as the **Register** operation, not an axis.

---

## 5. Guardrails (the tool's real IP) — refuse, don't fabricate

Per transform, detect the blocker and **grey the pill with a one-line German reason**. The existing
refusal enum already carries the vocabulary: `kein_akkusativobjekt`, `intransitiv_unpersoenlich`,
`bereits_zielform`, `nicht_idiomatisch`, `mehrdeutig`, `modalverb_grenze`.

| Dimension | Blocker to detect → refusal | Correctness trap to enforce |
|---|---|---|
| **Passiv** | no accusative object → `kein_akkusativobjekt`; intransitive → impersonal only, else refuse | Dative-object verbs keep the dative, stay subjectless (_Dem Kunden wird geholfen_, never _Der Kunde…_); Perfekt-Passiv uses **worden** not geworden; agentless is the more B2 form |
| **Zeitform** | already target → `bereits_zielform` | aux **haben/sein** data-driven (motion/change-of-state → sein); separable verbs split then rejoin (_rufe an → habe angerufen_); modals + haben/sein/wissen stay Präteritum even in "spoken past" |
| **Konjunktiv II** | — | prefer synthetic (wäre/hätte/könnte/käme) over weak _würde sein_; never _würde_ in the wenn-clause |
| **Satzbau** | subjectless/es-sentences resist → `nicht_idiomatisch` | Nebensatz moves finite verb to end (aux-last in Perfekt); strict V2 after any Vorfeld reorder (never V3); modal double-infinitive quirk |
| **Register Sie→du** | — | must propagate to **every** dependent form (verb ending, Ihr↔dein, imperative); a half-converted sentence is worse than none |
| **Nominalstil** | clunky/unnatural → `nicht_idiomatisch` | correct article/gender of the derived noun; genitive not colloquial dative (_wegen des Regens_); don't over-nominalize into Beamtendeutsch |
| **Infinitiv (um…zu)** | subjects differ → refuse, suggest _damit_ | _zu_ inside separable verb (_anzurufen_) |

A greyed pill with "geht hier nicht: intransitives Verb" is a teaching moment, not a dead end. This is
also the trust anchor: a wrong transform destroys the tool; a principled refusal builds it.

---

## 6. Recommendations

### 6.1 Axis roadmap

| Wave | Add | Why here |
|---|---|---|
| **1 (shipped)** | Genus Verbi {Aktiv, Vorgangspassiv} × Zeitform {Präsens, Perfekt, Präteritum} | complete, high-value, shippable; backend already supports it |
| **2 (recommend next)** | **Modus {Indikativ, Konjunktiv II}** (promote from pinned constant); **Zustandspassiv** pill; **Register** operation (Sie↔du); **Satzbau** operation (HS↔NS) | all high B2-value, backend enums already exist for K-II/Zustandspassiv; Register + Satzbau are the two most _demonstrable_ operations (the Verbklammer animation especially) |
| **3** | **Stil** (verbal↔nominal, bidirectional); **Relativ↔Partizip** (bidirectional); **Infinitiv** (NS→um…zu); **Kondition** (wenn→sollten/falls/bei); **Plusquamperfekt** (only with a temporal anchor); **Passiversatzformen** (man / sich lassen / sein+zu) | the C1-leaning compression + the integrative operations; needs the Tier-B/C grading + guardrails mature |
| **Deep-link only** | Indirekte Rede (K-I), Futur I (as _Vermutung_ with a warning), affix-Negation, Steigerung | live toggles are traps (forms collapse, unnatural, low ceiling) — send the learner into the lesson bank instead |
| **Cut** | Futur II, standalone Numerus | noise at B1–B2 |

### 6.2 UI / product

- **Two rail sections**: "Formen" (the tuple pills, radio-within-group, combine) and "Umformungen" (the
  operation buttons, each fires one transform). The previews show this split.
- **Tri-state pills stay** (erkannt = white + green dot; Ziel = solid primary; idle = white), plus a
  **fourth disabled-with-reason state** (greyed, tooltip/inline reason) — the guardrail surface.
- **CEFR-gate advanced pills** behind the learner's level (badge, or hide below their band + 1), so a
  B1 learner isn't shown Indirekte Rede noise. Reuse `defaultVisibleBands`.
- **Bidirectional operations** show a direction toggle (verbal→nominal / nominal→verbal), doubling value.
- **Every transform keeps the one-line German Hinweis + "mehr dazu" deep-link** into the matching
  `GrammarGroup` (§2 "Bank link"). The tool becomes the front door to the 24-topic bank: the learner
  discovers a lesson through their own sentence.

### 6.3 Engine

- Promote `mood` to a selectable Formachse: add it to `GRAMMAR_AXES`, widen `useFokusMachine`'s
  `detected`/`selection`/cache-key from `{voice, tense}` to iterate the axes, update the
  `transformLabel`/`loadingValue` memos, and **bump `PROMPT_VERSION`** (the transform cache is keyed on
  it — new tuple values must not serve stale cached rows).
- Add an **operations contract** parallel to the tuple: `transform-sentence` accepts either a
  `GrammarTuple` (Formachsen) or an `operation` id (Register/Satzbau/Stil/…). Same abstain contract, same
  cache (key includes the operation id). Keep the tuple small; let operations be flat.
- **Tier the generation** (§3) only once cache-hit data justifies moving Tier-A transforms to free rules;
  launch everything on the model with the global cache + $5 fuse unchanged.
- Extend the **eval gate** (the plan's ~50 golden triples) with the §5 traps for each new axis/operation
  before it goes live. Non-negotiable: a wrong transform teaches an error.

---

## 7. Worked examples (drop-in for report + mockups)

Realistic workplace/daily-life sentences, app no-em-dash style.

| # | Transform | Source → Target |
|---|---|---|
| 1 | Aktiv → Vorgangspassiv | _Der Techniker prüft die Rechnung noch heute._ → _Die Rechnung wird noch heute (vom Techniker) geprüft._ |
| 2 | Aktiv → Passiversatz (sein+zu) | _Sie müssen den Antrag bis Freitag einreichen._ → _Der Antrag ist bis Freitag einzureichen._ |
| 3 | Verbal → Nominal (kausal) | _Weil der Zug verspätet war, habe ich den Termin verpasst._ → _Wegen der Verspätung des Zuges habe ich den Termin verpasst._ |
| 4 | Indikativ → Konjunktiv II (Bitte) | _Schicken Sie mir die Unterlagen bis morgen._ → _Könnten Sie mir die Unterlagen bitte bis morgen schicken?_ |
| 5 | Konjunktiv II Vergangenheit (irreal) | _Ich hatte keine Zeit, deshalb bin ich nicht zum Meeting gekommen._ → _Wenn ich Zeit gehabt hätte, wäre ich zum Meeting gekommen._ |
| 6 | Direkte → Indirekte Rede (K-I) | _Der Kollege sagt: „Ich habe die Datei schon hochgeladen."_ → _Der Kollege sagt, er habe die Datei schon hochgeladen._ |
| 7 | Präsens → Perfekt (haben/sein) | _Ich gehe zum Arzt und bekomme ein Rezept._ → _Ich bin zum Arzt gegangen und habe ein Rezept bekommen._ |
| 8 | Hauptsatz → Nebensatz (konzessiv) | _Das Projekt war teuer. Trotzdem haben wir es weitergeführt._ → _Obwohl das Projekt teuer war, haben wir es weitergeführt._ |
| 9 | Nebensatz → Infinitiv (final) | _Ich rufe beim Amt an, damit ich einen Termin bekomme._ → _Ich rufe beim Amt an, um einen Termin zu bekommen._ |
| 10 | Relativsatz → Partizipialattribut | _Die Studie, die letzte Woche veröffentlicht wurde, zeigt neue Zahlen._ → _Die letzte Woche veröffentlichte Studie zeigt neue Zahlen._ |
| 11 | Kondition: wenn → Sollten-V1 | _Wenn Sie noch Fragen haben, melden Sie sich gern._ → _Sollten Sie noch Fragen haben, melden Sie sich gern._ |
| 12 | Register: informell → formell | _Kannst du mir schnell sagen, warum die Lieferung nicht da ist?_ → _Könnten Sie mir bitte mitteilen, aus welchem Grund die Lieferung noch nicht eingetroffen ist?_ |

---

## 8. Open questions for the founder

1. **Bucket model** — adopt the Formachsen (tuple) vs Umformungen (operations) split? _Rec: yes; it caps
   grid cost and matches the pedagogy tiers._
2. **Wave 2 scope** — Modus(K-II) + Zustandspassiv + Register + Satzbau, or a subset? _Rec: all four; the
   first two are near-free (backend enums exist), the last two are the most demonstrable operations._
3. **CEFR-gating advanced pills** — hide below the learner's band, or show with a level badge? _Rec: hide
   below band + 1, badge the rest._
4. **Bidirectional operations** — worth the direction toggle for nominal↔verbal and Partizip↔Relativsatz?
   _Rec: yes; it doubles value (produce + decode) from one rule._
5. **Move Tier-A transforms to free deterministic rules** eventually, or keep everything on the model?
   _Rec: keep on the model at launch; revisit after cache hit-rate data._

---

## 9. Previews

- `preview/grammar-dimensions-satzlabor.html` — the recommended tool in action: expanded rail with the
  Formen/Umformungen split, tri-state + disabled-with-reason pills, a worked correction + Passiv
  transform (example #1), and the mobile chip-row variant. Real shipped tokens/styling.
- `preview/grammar-dimensions-catalog.html` — the full dimension roadmap as a founder decision matrix:
  every dimension as a card grouped by wave, with CEFR badge, feasibility tier, B2-marker rank,
  deep-link target, and a worked source→target example.
