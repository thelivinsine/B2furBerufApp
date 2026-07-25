# Schreiben overhaul: exam-realistic Aufgaben, a Niveau axis, real Branche differentiation

**Status:** P0, P1 and P2 SHIPPED in s167 (PRs #711, #712, live on `main`). P3 content waves 2 to 4
remain. Founder-approved scope; extends `docs/areas/SCHREIBEN.md`.

**Shipped:** the counting fix + one shared selector · "Alle Themen" and a generic option on every
dropdown · the Niveau and Textsorte axes · the exam-shaped `WritingTask` schema · permanent task ids
on all 493 tasks · 120 new Aufgaben (every Thema x Niveau x Länge) · the evaluator now receives the
Aufgabe and grades content first · `writing_evaluations.task_id` + Verlauf showing the task again ·
per-module daily limits (Fokus 10 / Kurz 4 / Lang 2) · CI that deploys Supabase without a CLI.

**Not shipped:** content waves 2 to 4 (§11 P3) and the §12 verification items.

**Trigger:** founder report "why are there almost no items in the writing section?" plus the
requirement that Aufgaben simulate real telc/Goethe exam tasks and that every filter option yield
tailored tasks rather than a Branche name-drop.

---

## 1. Executive summary

The pool is not empty. `src/data/writingPrompts.ts` holds **373 tasks** (189 Kurz, 184 Lang) across
all 20 Themen. What the founder saw is **three separate defects stacking**:

1. **A counting bug in the rail.** Branche options grey out unless a task is *explicitly* tagged with
   that sector, contradicting the app's own untagged-equals-universal rule. Most Branchen read as
   unavailable when they would in fact yield the full pool.
2. **A tagging gap.** Only 70 of 373 tasks (18.8%) carry any `sectors` tag, and 11 of 20 Themen carry
   none at all. Every Alltag theme has a completely dead Branche dropdown.
3. **A depth gap that tagging alone would not fix.** The tasks are one-line instructions with no
   Inhaltspunkte, no addressee, no register cue, no word target, and no level. A "Branche-specific"
   task today differs from the generic one only by naming the industry.

Defect 1 is a ten-line fix. Defect 2 is content work. Defect 3 is the real project, and it is also
the reason the AI feedback is weaker than it should be: **`evaluate-writing` never receives the task
text.** It grades writing without knowing what was asked.

---

## 2. Founder decisions (locked, s167)

| # | Decision |
|---|---|
| 1 | **Three levels: B1, B2, C1.1.** A Niveau axis enters the Schreiben module. |
| 2 | **No fifth tab.** Exam simulation rides Kurz/Lang via a Prüfungsformat tag, not a new mode. The 4-segment switcher stays locked. |
| 3 | **Add both new rail axes:** Niveau and Textsorte/Format. |
| 4 | **Deep content build, shipped in waves.** Target roughly 800 to 1200 tasks. |
| 5 | **Every rail dropdown gets a generic "Alle …" option** (Thema currently lacks one). |

---

## 3. Root cause detail

### 3.1 The Branche counting bug

`src/features/writing/WritingRail.tsx:210-212`:

```ts
const scopedTasks = tasksForSub(value, length, sub);
const sectorCount = (s) => scopedTasks.filter((t) => t.sectors?.includes(s)).length;
// -> disabled: count === 0   (:234)
```

The trainer's actual draw (`GuidedWritingTrainer.tsx:93-102`) implements prefer-tagged-else-untagged
and is never empty. The rail and the engine therefore disagree: the rail says "impossible", the
engine happily serves 19 tasks. Reaching `?sector=it&theme=wohnen` by URL works fine while the
dropdown marks that exact option unavailable.

Second inconsistency: Unterthema counts mean "tasks you will see", Branche counts mean "tasks tagged
with this Branche". Two different semantics in one tile.

**Fix:** extract the prefer-tagged-else-untagged rule into one shared selector and call it from both
the rail and the trainer. Branche counts then become honest and Branche never disables.

### 3.2 Tagging coverage today

| | tasks | with `sectors` |
|---|---|---|
| Beruf Themen (9 tagged) | 205 | 70 |
| Beruf Themen (travel) | 16 | 0 |
| Alltag + Bildung Themen (11) | 152 | 0 |

Zero-sector Themen: `travel`, `behoerde`, `arzt`, `wohnen`, `bank`, `bildung`, `einkaufen`, `essen`,
`mobilitaet`, `freizeit`, `digitales`.

### 3.3 The evaluation blind spot

`src/lib/writing.ts:77-100` sends `{ theme, length, text }`. In
`supabase/functions/evaluate-writing/index.ts`, `theme` and `length` are **only persisted** (`:465`);
they never reach a prompt. `buildUserPrompt` (`:177-185`) passes the learner's text plus a
LanguageTool summary and nothing else. `SYSTEM_PROMPT` (`:167`) is a fixed B2-Beruf framing with no
level parameter.

Consequences:
- Aufgabenerfüllung is **structurally uncheckable**. A learner can ignore every content point and
  still get a clean verdict.
- Register errors (du where Sie is required) cannot be caught reliably.
- Underlength cannot be flagged, because the word target is never communicated.
- The response cache is keyed on text alone (`hashText`, `:102`), so the same text under a different
  task returns the same verdict. This becomes **wrong** the moment the task influences the prompt.

This is the highest-leverage change in the whole plan and it is a backend change.

---

## 4. Exam research: what the Aufgaben must simulate

### 4.1 Verification status

Research ran under two hard environment limits: WebFetch returned 403 at the proxy for every
external host (goethe.de, telc.net, bamf.de, verbraucherzentrale.de, gesetze-im-internet.de), and the
session WebSearch budget was exhausted. **No official PDF could be opened.** Findings below come from
search-result summaries. Confidence is marked. No verbatim exam prompt was obtained, and none was
fabricated.

**Before content authoring starts, the Modellsatz PDFs must be dropped into the repo for local
extraction.** See §11.

### 4.2 Goethe-Zertifikat, Modul Schreiben

| Level | Teil | Textsorte | Wörter | Minuten | Stimulus |
|---|---|---|---|---|---|
| **B1** | 1 | informelle E-Mail (Freund/in, du) | ca. 80 | 20 | Situation + **3 Leitpunkte** |
| **B1** | 2 | Diskussionsbeitrag (Online-Gästebuch) | ca. 80 | 25 | **Quelltext**: post by a named user, react to it |
| **B1** | 3 | halbformelle E-Mail (Kursleiterin, Sie) | ca. 40 | 15 | Situation + 2 Sprechakte (entschuldigen + begründen) |
| **B2** | 1 | Forumsbeitrag | **min. 150** | 50 | Thema + **4 Inhaltspunkte** + "Denken Sie an Einleitung und Schluss" |
| **B2** | 2 | Nachricht (halbformell, Arbeitskontext, Sie) | ca. 100 | 25 | Situation + 4 Inhaltspunkte |
| **C1** | 1 | Diskussionsbeitrag | **min. 200** (Ziel ~230) | ~50-55 | Thema + **Grafik/Statistik** + **5 Inhaltspunkte** |
| **C1** | 2 | formelle Nachricht/E-Mail | ca. 120 | ~25 | Situation + **4 Sprachfunktionen** (not topics) |

Module totals: B1 60 min / 100 Punkte, B2 75 min / 100 Punkte, C1 ~80 min (one source says 75 net,
unresolved) / 100 Punkte.

**Rubric (identical four rows at every level, high confidence):**
`Erfüllung · Kohärenz · Wortschatz · Strukturen`, banded **A to E**, two independent raters, no
intermediate values. **If Erfüllung is rated E, the entire Aufgabe scores 0** regardless of the other
three rows. Per-band point values are **not verified** and must not be hard-coded yet.

**Corrections to current project assumptions:**
- **There is no Goethe-Zertifikat B2 Beruf.** Goethe-Test PRO (Beruf) tests only Lesen and Hören, no
  writing at all. The Beruf writing exam is a **telc** product. Goethe's workplace-writing analogue
  is simply B2 Schreiben Teil 2, which is already de facto a workplace task. **CLAUDE.md needed no
  change** (it names "telc Deutsch B2 Beruf" and "Goethe-Zertifikat B2", both of which exist and are
  correctly named); the wrong framing lived in the `evaluate-writing` system prompt, which called
  itself `Prüfer:in für Goethe/telc "Deutsch B2 Beruf"` for every text at every level. P2 replaced it
  with a per-level prompt.
- **Goethe C1's Umformulierung gap-fill task is retired** (modular C1 from 01.01.2024). Teil 2 is now
  a free-written formal e-mail. Much prep material still teaches the old format. Any "65 min / 15 min"
  split is an old-format tell.

### 4.3 telc and DTB (partial)

- **telc Deutsch B2+ Beruf:** written exam 3 hours; writing = **two texts, a Brief/Kurzbericht plus a
  halbformelle E-Mail, 60 minutes**. 60% needed in every part.
- **telc B1/B2 rubric:** criterion I is `Berücksichtigung der Leitpunkte`, graded by **count**:
  A = all four Leitpunkte handled, B = three, C = two, D = one or none. Criterion II covers
  Kohäsion and Kohärenz (Textlogik, Konnektoren, Register). Criterion III runs under
  "das Primat der Verständlichkeit" (Endungs- and Genusfehler weigh less than Kongruenzfehler).
  Criterion IV is Spektrum (Lexik und Syntax).
- **DTB (Deutsch-Test für den Beruf, BAMF §45a):** there is **no standalone Schreiben subtest**. The
  writing score is composed across *Lesen und Schreiben*, *Hören und Schreiben*, and *Sprachbausteine
  und Schreiben*. Design implication: short, **source-dependent** writing (reply to an email you
  read, take a note from something you heard), not one long free essay. Content is scored per task;
  language is scored **once holistically across both texts**.
- **Not obtained:** telc B2 Beruf exact task sheet, word counts, per-band point values.

**Do not** build content against the "telc Deutsch C1, 70 min Erörterung" model for DTB C1. Search
results conflate telc Deutsch C1 with DTB C1; they are different exams.

---

## 5. Kurz and Lang, redefined

Current buckets are absolute: `rangeByLength = { short: [40,60], long: [120,150] }`
(`GuidedWritingTrainer.tsx:31`). **They match no exam.**

- B1's *long* tasks are 80 words, the top of the current Kurz range. B1 collapses entirely into Kurz.
- B2 and C1's *short* tasks are 100 to 120 words: above the Kurz ceiling, below the Lang floor. They
  fit neither bucket.

**Decision: Kurz and Lang become task-SHAPE buckets, and the word target moves onto the task.**

- **Kurz** = one speech act, no argument structure. Cancel, apologize, request, report, hand over.
- **Lang** = a staged argument with Einleitung, Hauptteil, Schluss. Argue, weigh, complain formally,
  interpret a source.

This is exactly what the Kohärenz rubric row rewards, and it survives across all three levels.

| Niveau | Kurz target | Lang target |
|---|---|---|
| B1 | 40 W | 80 W |
| B2 | 100 W | 150 W |
| C1.1 | 120 W | 200 W |

`rangeByLength` is deleted. Each task carries its own `words` target; the Ziel line, the green-counter
heuristic and the textarea height all read from the task.

---

## 6. The Niveau axis

Reuse the existing `ContentCefr` union (`src/types/index.ts:49`) and `src/lib/cefr.ts` verbatim.
No new level infrastructure. Map: B1 -> `B1.2`, B2 -> `B2.1`/`B2.2`, C1.1 -> `C1`.

**What each level demands, as the one-line axis for content authors:**

> **B1 = handle my own situation. B2 = argue a case and manage a formal relationship.
> C1.1 = interpret a source and position myself in a public debate.**

| | B1 | B2 | C1.1 |
|---|---|---|---|
| Perspective | one, personal | two, held together | three: source, counter-position, own qualified stance |
| Addressee | concrete and known | anonymous public **or** institutional superior | public debate + institution |
| Core acts | report, narrate, apologize, cancel, invite, request, opinion + **one** reason | argue and justify, weigh Vor-/Nachteile, propose alternatives, complain, negotiate upward with face-saving hedging | summarize an external stimulus and use it as evidence, concede and refute, hedge and qualify, signpost an extended argument |
| Register | du (Teil 1) vs Sie (Teil 3), switching correctly | semi-formal workplace register, the distinctive B2 skill | deliberate register control as an object in itself |
| Grammar surface | Perfekt, Nebensätze mit weil/dass, Modalverben | Konjunktiv II hedging, Passiv, Konnektoren (deshalb, trotzdem, allerdings), Genitiv | Nominalstil, Partizipialattribute, Passiversatz, zwar…dennoch, einerseits…andererseits |
| Rubric pressure | Erfüllung = did you touch all three Leitpunkte | Kohärenz becomes load-bearing | Wortschatz/Strukturen shift from range to precision and appropriacy |

Note for authoring: **Profile deutsch does not level-assign Textsorten** (it differentiates them by
Kanal, Interaktion and Medium). Any Textsorte-to-level mapping is exam-format-derived, not
Profile-deutsch-derived, and should be justified against telc/Goethe formats.

---

## 7. The new task schema

```ts
export interface WritingTask {
  /** Stable id. Shipped ids are PERMANENT (id-permanence law). */
  id: string;
  /** The Situation frame: role, context, trigger. German, no em dashes. */
  situation: string;
  /** The explicit instruction line ("Schreiben Sie eine E-Mail an ..."). */
  instruction: string;
  /** 2 to 5 Inhaltspunkte. THE thing that makes AI feedback gradeable. */
  points: string[];
  /** Word target for THIS task, from the exam it simulates. */
  words: number;
  /** Who the learner writes to. Drives register and Anrede. */
  addressee: string;
  register: "du" | "sie";
  level: ContentCefr;
  format: WritingFormat;
  /** Which exam task this simulates, if any. */
  exam?: WritingExam;
  sub?: string;
  sectors?: WorkSector[];
  /** Optional source text the learner must react to (B1 Teil 2, DTB). */
  source?: string;
}
```

New closed enums, each mirrored into `scripts/lint-content.mjs` per the closed-enum rule:

```ts
type WritingFormat =
  | "email_informell" | "email_halbformell" | "email_formell"
  | "nachricht" | "notiz" | "uebergabe"
  | "forumsbeitrag" | "stellungnahme"
  | "bericht" | "protokoll"
  | "beschwerde" | "reklamation"
  | "antrag" | "widerspruch" | "kuendigung"
  | "bewerbung";

type WritingExam =
  | "goethe_b1_t1" | "goethe_b1_t2" | "goethe_b1_t3"
  | "goethe_b2_t1" | "goethe_b2_t2"
  | "goethe_c1_t1" | "goethe_c1_t2"
  | "telc_b2_beruf_brief" | "telc_b2_beruf_email"
  | "dtb_b2" | "dtb_c1"
  | "alltag";   // real-world genre, on no exam
```

`WritingFormat` exceeds the 12-option facet ceiling. That ceiling applies to facet pill rails
(`facets.ts:108`), **not** to scope dropdowns, and the founder rule "dropdowns over pill walls" already
covers this. Group the dropdown by family (E-Mail / Bericht / Beschwerde / Antrag / Öffentlich).

### Anatomy of a good task

```
Situation:    Sie arbeiten seit drei Monaten als Pflegefachkraft auf der Station 3B.
              Seit zwei Wochen fällt die Dienstplanung mehrfach kurzfristig aus.
Instruction:  Schreiben Sie eine E-Mail an Ihre Stationsleitung, Frau Wagner.
Adressat:     Stationsleitung (Sie)
Inhaltspunkte:
  · Beschreiben Sie, was konkret passiert ist.
  · Erklären Sie, welche Folgen das für die Patientenversorgung hat.
  · Machen Sie einen Vorschlag für die Dienstplanung.
  · Bitten Sie um ein Gespräch.
Ziel:         150 Wörter
```

Every slot earns its place: `situation` gives the learner something to write *from*, `points` is what
the evaluator checks for Aufgabenerfüllung, `addressee` + `register` is what makes a du/Sie error
detectable, `words` is what makes underlength flaggable.

---

## 8. What makes a Branche variant real, not cosmetic

The current failure mode is a task that name-drops the industry. A genuine variant changes **four**
things: the **addressee**, the **document genre**, the **domain content points**, and the
**Fachlexik**. Same Thema (Konflikt am Arbeitsplatz), same Niveau (B2), same Länge (Lang):

**Pflege** — Adressat: Stationsleitung. Genre: halbformelle E-Mail mit Eskalation.
> Sie arbeiten im Nachtdienst. Eine Kollegin übergibt seit Wochen unvollständig, zuletzt fehlte die
> Information über eine geänderte Medikation. Schreiben Sie an die Stationsleitung: schildern Sie den
> Vorfall sachlich, benennen Sie das Risiko für die Bewohnerin, schlagen Sie eine verbindliche
> Übergaberegel vor und bitten Sie um ein Gespräch zu dritt.

**IT** — Adressat: Teamlead. Genre: sachliche Eskalation mit Prozessvorschlag.
> In Ihrem Team blockieren Code-Reviews seit einem Monat jeden Sprint, weil Rückmeldungen erst nach
> mehreren Tagen kommen. Schreiben Sie an Ihre Teamleitung: beschreiben Sie die Verzögerung mit zwei
> konkreten Beispielen, erklären Sie die Folgen für den Releasetermin, schlagen Sie eine
> Review-Frist von 24 Stunden vor und bitten Sie um eine Entscheidung bis zum nächsten Sprint.

**Gastronomie** — Adressat: Inhaber. Genre: Beschwerde mit Dienstplanbezug.
> Im Service kommt es an Wochenenden regelmäßig zu Streit über die Trinkgeldverteilung, seit zwei
> Aushilfen neu im Team sind. Schreiben Sie an den Inhaber: schildern Sie die Situation, erklären
> Sie, warum die Stimmung im Team die Gäste betrifft, schlagen Sie eine klare Regelung vor und
> bitten Sie um eine Teambesprechung vor dem nächsten Wochenende.

Nothing here is swappable between the three. That is the test: **if you can substitute the Branche
noun and the task still works, it is not a Branche variant.**

---

## 9. Alltag genres: the formal-apparatus gap

Existing Alltag tasks read like *"Verfasse einen Widerspruch gegen einen Bescheid: Erkläre höflich,
warum du die Entscheidung für falsch hältst."* There is no Betreffzeile, no Aktenzeichen, no Frist,
no Grußformel requirement. **A learner can score well on that task and still write a Widerspruch that
gets rejected.**

Alltag tasks must carry the formal apparatus as Inhaltspunkte: name the Bescheid and its date, quote
the Aktenzeichen, state the objection, request a new decision, observe the Frist, close formally.

Priority genres (frequency x consequence): Widerspruch gegen einen Bescheid, Mängelanzeige an den
Vermieter, Kündigung (Vertrag/Abo), Krankmeldung an den Arbeitgeber, Reklamation/Widerruf,
Betriebskostenabrechnung-Widerspruch, Terminabsage bei Behörde/Arzt, Fristverlängerungsantrag.

**Legal-content warning.** Research on statutory Fristen was blocked and one premise was found wrong
in passing: the BEG IV Textform relaxation (from 01.01.2025) applies to **Gewerbemiete und
Grundstücke via §578 BGB, not to Wohnraum**. Kündigung of residential tenancy still requires
Schriftform under §568 BGB. Any task or feedback that states a deadline or a legal requirement must
be verified against a primary source before shipping, and the id-permanence law makes bad legal
content expensive to retire. **Prefer tasks that teach the letter's structure over tasks that assert
a deadline.**

---

## 10. Implementation surface

### Rail (`WritingRail.tsx`)
Five scope dropdowns, Bibliothek hierarchy order: **Niveau -> Branche -> Thema -> Unterthema ->
Textsorte**. Every one gets a generic first option: "Alle Niveaus", "Alle Branchen", "Alle Themen"
(new), "Gesamtes Thema", "Alle Textsorten". Counts use the shared selector so they are honest and
consistent across all five. Zero-yield greys out with an honest count, per the founder rule that
controls always visibly act.

Five dropdowns is a dense tile. Consider a two-column grid on desktop; that is a `/design` question
and needs a preview before implementation.

### Trainer (`GuidedWritingTrainer.tsx`)
- `eligible` gains level and format filters; URL params `?level=` and `?format=`.
- The Aufgabe card renders Situation, instruction, **Inhaltspunkte as a list**, Adressat and Ziel.
  This is a real design change and needs a `preview/*.html` mockup first.
- `rangeByLength` deleted; word target reads from the task.
- `WritingHub.tsx:45` param-clearing list must include the new params.

### Backend (`supabase/functions/evaluate-writing/index.ts`)
- Request body gains `taskId`, `taskText`, `points`, `level`, `format`, `register`, `words`.
- `SYSTEM_PROMPT` becomes level-aware; `buildUserPrompt` includes the task and its Inhaltspunkte.
- `VALID_WEAKNESS` gains an Aufgabenerfüllung/Inhalt category, which also touches
  `WeaknessCategory`, `src/data/practiceAreas.ts` and `scripts/lint-content.mjs:465`.
- **`hashText` must fold in the task id** or the cache serves the wrong verdict across tasks.
- New nullable columns on `writing_evaluations`; new migration; redeploy.

### Gates and docs
Mirror every new enum in `scripts/lint-content.mjs` (`lintWritingPrompts`, `:473-502`). All 20 `wp_*`
provenance rows are `review_status: "draft"`, so adding fields will **not** trip the fingerprint
gate today; it would if any row were flipped to verified first. Update `docs/areas/SCHREIBEN.md`,
`docs/areas/CONTENT.md`, `CLAUDE.md` (the Goethe B2 Beruf correction), `docs/DECISIONS.md`,
`docs/PROJECT_STATUS.md` and `docs/SESSION_PROMPT_LOG.md`.

---

## 11. Priority actions

**P0 — ship this week, small and independently valuable**
1. **Fix the Branche counting bug.** Extract prefer-tagged-else-untagged into one shared selector,
   call it from rail and trainer. Branche stops lying. (~1 file, no content, no backend.)
2. **Add "Alle Themen" to the Thema dropdown** and normalize the generic option across all
   dropdowns.
3. **Obtain the source PDFs.** Goethe B1/B2/C1 Modellsatz + Prüferblätter, telc B2 Beruf Übungstest,
   BAMF DTB Prüfungshandbuch. Dropped into the repo, they can be read locally with no network. This
   is the gate on faithful content: without them the Aufgaben are exam-*like*, not exam-simulating.

**P1 — the structural change**
4. Extend the `WritingTask` schema (§7), add the two enums, mirror them in the linter.
5. Migrate the 373 existing tasks into the new shape. Most already have usable `text`; they need
   `points`, `level`, `format`, `addressee`, `register`, `words` backfilled.
6. Rail: add Niveau and Textsorte. Preview first, per the design skill.
7. Aufgabe card redesign to render Inhaltspunkte. Preview first.

**P2 — the payoff**
8. **Send the task to the evaluator.** Backend change, cache-key fix, Aufgabenerfüllung rubric row.
   Until this ships, the extra schema is filtering metadata only. After it ships, the app can tell a
   learner "du hast Inhaltspunkt 3 nicht bearbeitet" and "du hast geduzt, hier ist Sie verlangt",
   which is the single biggest jump in learning value in this plan.

**P3 — content waves** (target 800 to 1200 tasks)
- **Wave 1 — exam core.** Every Goethe task type at every level, Thema-generic: B1 T1/T2/T3,
  B2 T1/T2, C1 T1/T2. Roughly 20 Themen x 2 Längen x 3 Niveaus, exam-tagged.
- **Wave 2 — Beruf Branche variants.** The 9 workplace Themen x the top 6 Branchen, written to the
  §8 four-way-difference test, at B2 and C1.1.
- **Wave 3 — Alltag formal apparatus.** Rewrite the 152 Alltag tasks with Betreff, Aktenzeichen,
  Frist and Grußformel as Inhaltspunkte. Legal claims verified against primary sources.
- **Wave 4 — remaining Branchen and B1 breadth.**

---

## 12. Open verification items

Nothing in this list may be hard-coded until confirmed from a primary source:

1. Per-band (A to E) point values for Schreiben at B1, B2, C1.
2. B1 Aufgabe weighting 40/40/20 (widely reported, unconfirmed).
3. B2 Aufgabe weighting 60/40 vs 50/50 (sources conflict).
4. C1 modular per-Teil minutes and module total (75 vs 80).
5. telc B2 Beruf task sheet, word counts, criteria weights: **entirely uncovered**.
6. DTB B2 timings (three conflicting figures found).
7. Verbatim prompt wording at every level. None obtained; none invented.
