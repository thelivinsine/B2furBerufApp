# Writing-task audit — quality, Niveau honesty, and filter fit

_Session 199, 2026-08-07. Branch `claude/task-list-priorities-3f50ad`. Queued by the founder in
s181: "I want you to do a thorough analysis of the quality of these tasks and how they go with the
filter." Every number below was measured against the live bank on this commit, loaded through Vite
exactly as `lint-content.mjs` does. Where a number rests on a heuristic, the heuristic and its
error rate are stated with it._

---

## 0. Executive summary

**The tasks are well written. The tags on them are not.**

s181 closed the *coverage* backlog: 717 tasks, every one carrying the full brief, every Unterthema
and Textsorte and Branche represented. This audit asked the question coverage cannot answer, which
is whether the tags are *earned*. They are not, and the reason is structural: the coverage
invariant is satisfiable by tagging, and tagging is what happened.

What is genuinely good, and should not be touched:

- **The German is clean and the situations are plausible.** Roughly 70 briefs were read in full
  across every band, theme and Textsorte. The scenarios are concrete and workplace-real
  ("Wegen Regen konnte heute auf der Baustelle nicht betoniert werden", "Eine Charge weicht von der
  Spezifikation ab"). Nothing read as machine-assembled filler.
- **The Leitpunkte are answerable and non-overlapping.** 2,691 Leitpunkte, 2,355 distinct. Within a
  task, only 5 pairs overlap above a 0.5 Jaccard, and all five are deliberate parallel pairs
  ("Fragen Sie nach den Zinsen für Tagesgeld / für Festgeld"). **Zero** Leitpunkte demand an act
  that cannot be performed in writing. Every task gives at least 13.3 words of target per point.
- **Repetition is low.** Across all 717 instructions there are **6** near-duplicate pairs (3-gram
  Jaccard ≥ 0.45), all inside a single theme, all mild variants. **Zero** cross-theme duplicates.
  For a bank authored in four waves, that is a good result.
- **The demand ladder does rise with the Niveau tag.** The share of tasks asking for no
  justification at all falls 86% (B1) → 69% (B2) → 27% (C1).

The five findings, ranked:

| # | Finding | Size |
|---|---|---|
| 1 | **Branche is a coverage artifact, not a description.** All 40 theme×length pools carry exactly 15 distinct sectors, the exact size of the `WorkSector` enum, in pools as small as 11 tasks. **199 of 600** tagged tasks (33%) contain no marker of the sector they claim. A Pharma learner is preferentially served "Sie haben auf einer Feier eine Bekannte wiedergetroffen". | 33% of tagged tasks |
| 2 | **The Niveau tag scales the word count and the grader's strictness, but not the task.** `level` is what sets "Bewerte streng auf X-Niveau" in `evaluate-writing`. Yet the brief's specialized-vocabulary share runs 2.7% (B1) → 2.3% (B2) → **1.6% (C1)**, inverted, and instruction length is flat at 14–16 words in every band. | The whole level axis |
| 3 | **236 tasks are graded for argumentation their brief never asked for.** 207 B2 and 29 C1 tasks carry no justification Leitpunkt. Sharpest: **6 C1 Stellungnahmen at 200 words** whose points are purely descriptive. Do exactly what the brief says and you produce a B1-shaped text, then get graded strictly at C1. | 6 acute, 236 total |
| 4 | **`exam` is dead metadata and disagrees with `words`.** 69 tasks carry a Niveau outside their exam shape's band. `words` is fully determined by (level, length) despite the field doc saying it follows the exam shape: **61** `goethe_b1`-shaped tasks carry a 150-word target. `exam` is read by nothing: not the trainer, not the evaluator, not any filter. | 69 + a dead field |
| 5 | **`source` is unused on all 717 tasks.** 54 Stellungnahmen and 17 Forumsbeiträge *describe* the discussion they react to instead of quoting it. The field exists for exactly this and is empty everywhere. | 71 tasks, 1 empty field |

Plus a short tail of 19 individually fixable defects (§7).

---

## 1. What was measured

| Dimension | Count |
|---|---:|
| Tasks | **717** (358 kurz + 359 lang across 20 themes, 40 pools) |
| Leitpunkte | **2,691** (2,355 distinct; 3 points 236x, 4 points 422x, 5 points 59x) |
| Niveau | B1.1 91 · B1.2 216 · B2.1 289 · B2.2 13 · C1 108 · **A2 0** |
| Textsorte | all 16 present; `email_formell` 148, `nachricht` 146, `email_halbformell` 80, `bericht` 77 |
| Register | `sie` 654 · `du` 63 (8.8%) |
| Branche | 117 untagged (universal) · 483 one sector · 117 two sectors |
| `exam` shape | `goethe_b1` 358 · `telc_b2_beruf` 176 · `goethe_c1` 84 · `alltag` 48 · `dtb` 44 · `goethe_b2` 7 |
| `source` | **0** |
| Adressat | 717/717 present |

---

## 2. Finding 1 — Branche is a coverage artifact

### 2.1 The evidence

Sector tags are distributed by **pool position**, not by content. The short pools of `project`,
`travel` and `sustainability` each hold 16 tasks and assign one sector per slot in enum order,
positions 9–11 left universal:

```
wt_travel_s01 [it]        wt_travel_s07 [pharma]      wt_travel_s13 [cleaning]
wt_travel_s02 [engineering] wt_travel_s08 [chemicals]  wt_travel_s14 [hospitality]
wt_travel_s03 [production]  wt_travel_s09 []           wt_travel_s15 [security]
wt_travel_s04 [retail]      wt_travel_s10 []           wt_travel_s16 [sports]
wt_travel_s05 [transport]   wt_travel_s11 []
wt_travel_s06 [construction] wt_travel_s12 [beauty]
```

Every one of the **40** theme×length pools carries exactly **15 distinct sectors** — the exact size
of the `WorkSector` enum. That holds in `mobilitaet/short`, which has **11 tasks**. Eleven tasks
cannot honestly represent fifteen industries; the tags were doubled up until the set closed.

### 2.2 How many tags are unearned

A tag counts as **earned** when the brief contains at least one token only that workplace produces.
The lexicon is the 473 sector-tagged vocabulary items plus a hand-written list of role, place and
abbreviation markers per sector (`Station`, `Polier`, `QS`, `Reinraum`, `Disposition`, `Revier`…).
The test is deliberately generous — anything ambiguous counts as earned — so this is a **floor**:

| | tasks | share |
|---|---:|---:|
| Branche-tagged | 600 | 84% of the bank |
| tag earned | 401 | 67% |
| **tag bare (no marker of the claimed sector at all)** | **199** | **33%** |

Worst by sector: `care` 34/62 bare, `engineering` 24/46, `chemicals` 20/42, `pharma` 19/41,
`it` 28/62. Best: `production` 14/46, `retail` 17/49.

### 2.3 In Alltag it breaks the founder's own rule

s181 set the rule explicitly: in Alltag the work context must be **the reason the everyday task is
hard** (Schichtdienst gegen Öffnungszeiten), never a name-drop. Where the bank obeys it, it works
well — `wt_freizeit_s02` [hospitality, retail] "Sie müssen am Samstag einspringen und können sich
nicht treffen" is exactly the intended shape.

Where it does not:

| Task | Tag | Brief |
|---|---|---|
| `wt_freizeit_s08` | pharma | "Sie haben auf einer Feier eine Bekannte wiedergetroffen. Schreiben Sie ihr am nächsten Tag." |
| `wt_mobilitaet_l09` | chemicals | "Ein Freund besucht Sie und weiß nicht, wie er zu Ihnen kommt." |
| `wt_essen_l10` | security | "Sie möchten Freunde zum Essen einladen." |
| `wt_essen_l08` | production | "Sie möchten Ihre Freundesgruppe zu einem gemeinsamen Kochabend einladen." |
| `wt_freizeit_l07` | cleaning | "Ihre Freundesgruppe hat sich lange nicht gesehen." |
| `wt_wohnen_s12` | beauty | "In Ihrer Wohnung tropft seit gestern der Wasserhahn im Bad." |
| `wt_behoerde_s13` | it | "Sie haben einen Bescheid erhalten, mit dem Sie nicht einverstanden sind." |

Of the 245 Branche-tagged Alltag tasks, **72** name no work-shaped constraint anywhere in the brief
(hand-checking a sample of that list finds roughly one false positive in fourteen — e.g.
`wt_wohnen_l03` does say "wegen einer neuen Stelle" — so the honest figure is about 65).

### 2.4 Why this happened, and why it is cheap to fix

`tests/moduleScope.test.ts` requires all 15 Branchen on every Beruf **and Alltag** theme at both
lengths. With 11-to-18-task Alltag pools that is arithmetically unsatisfiable by authoring, so it
was satisfied by tagging. The invariant did what invariants do: it got met.

**Removing a dishonest tag costs nothing in availability.** Branche is soft — untagged means
universal, and it is applied last precisely so it can never empty a pool. An untagged Alltag pool
still serves every Branche. The tags do not gain the learner access to anything; they only
misdirect the preference order, so the Pharma learner gets the party anecdote *ahead of* tasks that
would actually fit.

---

## 3. Finding 2 — the Niveau tag does not describe the language

`level` is not decoration. `evaluate-writing` reads it and builds
`"Du bist Prüfer:in … und bewertest einen Text auf Niveau ${lv}. Bewerte streng auf ${lv}-Niveau"`.
It is the single highest-stakes tag in the bank: it decides how harshly the learner is judged.

Measured across the briefs:

| Band | brief tokens classifiable | core | common | **specialized** |
|---|---:|---:|---:|---:|
| B1 | 5,280 | 6.2% | 7.3% | **2.7%** |
| B2 | 6,338 | 5.4% | 8.9% | **2.3%** |
| C1 | 2,773 | 4.9% | 10.0% | **1.6%** |

The lexical load is flat and, in the specialized band, **inverted**: C1 briefs use the *least*
demanding vocabulary. Instruction length is flat too (14.0–16.1 words at every band×length). On a
combined structural score (subordination + Konjunktiv II + nominalization + passive + length),
the bands overlap heavily: **81 of 307** B1 tasks score above the C1 median, and **25 of 108** C1
tasks score below the B1 median.

**Caveat, stated honestly:** the instruction is the rubric, addressed to the learner, and a rubric
the learner cannot read is a bad rubric. Some flatness is correct and deliberate. This finding is
therefore *soft on its own* — it matters because of where it meets Finding 3. Only 83% of brief
tokens are classifiable against the vocabulary bank, so the lexical table is directional, not exact.

---

## 4. Finding 3 — tasks graded for argumentation they never ask for

A Leitpunkt is **high-demand** when it forces justification or evaluation — something a B1 writer
cannot fake in one clause (`begründen`, `warum`, `aus Ihrer Sicht`, `darlegen`, `abwägen`,
`Gegenargument`, `Fazit`, `Konsequenz`, `Vor- und Nachteile`, `bewerten`, `Position`).

| Band | Leitpunkte | low | mid | **high** | tasks with **no** high point |
|---|---:|---:|---:|---:|---:|
| B1 | 996 | 83.7% | 11.8% | 4.4% | 264/307 (86%) |
| B2 | 1,207 | 65.9% | 25.2% | 8.9% | **207/302 (69%)** |
| C1 | 488 | 43.9% | 23.8% | 32.4% | **29/108 (27%)** |

The ladder is real and rising, which is the good news. The defect is at the top of it, and it is
sharpest where the Textsorte is argumentative **by definition**:

| Textsorte | tasks with no justification Leitpunkt |
|---|---:|
| `widerspruch` | 1/11 ✓ |
| `stellungnahme` | 9/54 |
| `forumsbeitrag` | 6/17 |
| `beschwerde` | 20/35 |

The six acute cases are **C1 Stellungnahmen at a 200-word target** whose Leitpunkte are entirely
descriptive: `wt_conflict_l01`, `wt_conflict_l05`, `wt_conflict_l15`, `wt_conflict_l17`,
`wt_conflict_l25`, `wt_bildung_l10`. In full, `wt_conflict_l05`:

> "Im Team gibt es Streit über die Urlaubsplanung in den Schulferien. Verfassen Sie eine
> Stellungnahme."
> · Beschreiben Sie das Problem. · Zeigen Sie Verständnis für beide Seiten. · Schlagen Sie eine
> klare Regel für die Zukunft vor. · Sagen Sie, wer die Regel beschließen soll.

A learner who covers all four Leitpunkte exactly has described, empathised, proposed and delegated.
They have not argued. The evaluator was told to grade strictly at C1. The learner is marked down for
missing something the brief did not ask for, which is the one failure mode a Leitpunkt-based brief
exists to prevent.

The same logic applies more mildly to the 20 of 35 `beschwerde` tasks: a complaint that never
justifies its demand is a B1 complaint wearing a B2 word count.

---

## 5. Finding 4 — `exam` and `words` contradict each other, and `exam` is dead

**`words` is fully determined by (level, length).** Nine combinations exist and each has exactly one
value: B1 short 40 / long 80, B2 short 100 / long 150, C1 short 120 / long 200. That matches
Genauly's documented per-band convention, so the *values* are fine. But the field's own doc says
"Word target for THIS task, taken from the exam shape it follows … Real exams do not share one
number", and the data says the opposite: the exam shape has no influence at all.

Consequences:

- **61** tasks tagged with the `goethe_b1` shape carry a **150-word** target; **1** task tagged
  `telc_b2_beruf` carries **40**.
- **69** tasks carry a Niveau outside their exam shape's band: 61 B2.1 tagged `goethe_b1`, 7 C1
  tagged `telc_b2_beruf`, 1 B1.2 tagged `telc_b2_beruf`.

**And none of it reaches the learner.** `exam` is not sent to `evaluate-writing`, not shown on the
Aufgabe card, and not a filter axis. (`evaluate-writing` does take an `exam` argument, but that is a
boolean "this is an exam run", a different thing.) It is authoring metadata that no gate checks and
no surface reads — which is exactly how it drifted 69 tasks out of band without anyone noticing.

---

## 6. Finding 5 — the reaction text is never supplied

`source` ("A short text the learner must react to (forum post, incoming mail)") is set on **0 of
717** tasks. Instead the instruction paraphrases the stimulus:

> "In einem Forum für Berufstätige wird diskutiert, ob feste wöchentliche Meetings noch zeitgemäß
> sind. Schreiben Sie einen Beitrag."

This is a defensible simplification, but it changes the exercise. Reacting to a *described* position
is easier and vaguer than reacting to a *stated* one: there is no wording to pick up, no claim to
quote back, nothing concrete to refute. It is also the point where the bank diverges most from the
telc B2 Beruf shape 176 of its tasks name, where the writing task is a reaction to a supplied text.
Most affected: the 54 Stellungnahmen and 17 Forumsbeiträge.

This is the cheapest of the five to fix incrementally — one `source` field per task, no schema
change, no id churn — and it is the one that most directly raises Finding 3's ceiling, because a
quoted position gives a Leitpunkt something to argue against.

---

## 7. The tail — 19 individually fixable defects

**Textsorte contradicted by the instruction (5).** The instruction names a genre other than the tag,
and it is the *requested output*, not the situation:

| Task | Tag | Instruction asks for |
|---|---|---|
| `wt_meetings_s05` | `notiz` | "Sie führen heute das **Protokoll** … Halten Sie die Ergebnisse fest" |
| `wt_meetings_l17` | `protokoll` | "Verfassen Sie eine **Notiz** für die Auftragsbesprechung" |
| `wt_logistics_s13` | `reklamation` | "Schreiben Sie eine kurze **Nachricht** an den Lieferanten" |
| `wt_bildung_l03` | `antrag` | "Verfassen Sie Ihre **Bewerbung**" |
| `wt_wohnen_l05` | `email_formell` | "Verfassen Sie Ihre **Bewerbung** um die Wohnung" |

(Seven further candidates were checked and cleared: in `wt_customer_s06/s14/s23/l06/l17` and
`wt_behoerde_l10` the other genre is the *incoming* situation, and `wt_travel_l03` says "Kündigen
Sie Ihren Besuch **an**", which is `ankündigen`.)

**Adressat contradicts the register (14).** The Adressat gives title + surname while the register
demands `du`, so the learner is instructed to write "Hallo Frau Bauer, … kannst du …" — a hybrid a
German reader marks as wrong. Fix either side: a first name, or `register: "sie"`.

`wt_scheduling_s01` ("Kollegin, Frau Bauer") · `wt_scheduling_s05` · `wt_conflict_s01` ·
`wt_conflict_s02` · `wt_conflict_s06` · `wt_conflict_l07` · `wt_travel_s07` · `wt_wohnen_s02` ·
`wt_bildung_s09` · `wt_mobilitaet_s08` · `wt_freizeit_s04` · `wt_freizeit_s08` · `wt_freizeit_l08` ·
`wt_freizeit_l09`.

**Not defects, checked and cleared.** Recycled Leitpunkte (12.5% of instances, but all generic
connective phrases like "Nennen Sie den Grund." — appropriate reuse, not template farming) ·
surname reuse across themes (18 surnames appear in ≥4 themes; harmless, the learner sees one task at
a time) · B2.2 holding only 13 tasks (the Niveau filter works on the coarse B1/B2/C1 band, so B2.2
is never a dead end) · the 40-word Kurz target (below every exam analogue, but it is Genauly's own
documented Kurz convention, not a mislabel).

---

## 8. Prioritised fix list

**P1 — Decide what Branche means, then make the gate match it.** (Founder decision, then one
authoring/tagging session.) The invariant "all 15 Branchen on every theme at both lengths" is what
produced 199 unearned tags. Two honest options:
  - **(a) Relax the floor for Alltag** and strip the tags that no brief earns. Costs nothing:
    Branche is soft, so untagged tasks still serve every Branche. This is the recommended option —
    it is a test change plus a tag deletion, and it makes the remaining tags mean something.
  - **(b) Keep the floor and author sector-specific variants** for the 199. That is a real
    authoring wave (~199 rewrites) and it grows the Alltag pools well past their current 11–18.

  Either way, add the honest check `lint:content` currently lacks: *a `sectors` tag requires a
  sector marker in the brief*. Without it, the next wave re-creates the problem.

**P2 — Fix the six acute C1 Stellungnahmen, then sweep the argumentative Textsorten.** Add one
justification Leitpunkt to `wt_conflict_l01/l05/l15/l17/l25` and `wt_bildung_l10` (replace the
weakest descriptive point, do not add a fifth). Then the 20 `beschwerde` and 9 `stellungnahme`
tasks. Small, surgical, and it removes the case where the grader punishes a learner for obeying the
brief. **Then gate it:** a `stellungnahme`, `forumsbeitrag` or `widerspruch` at B2 or above must
carry ≥1 justification Leitpunkt.

**P3 — Resolve `exam` vs `words`.** Cheapest correct answer: **retire `exam` from the schema** (it
is read by nothing, and the shipped-ids rule does not protect a field). If it stays, fix the 69
out-of-band tags and correct the `words` doc comment to say what is true — the target follows
(Niveau, Länge), which is Genauly's own convention and a fine rule.

**P4 — Add `source` to the 71 reaction tasks.** One short quoted forum post or incoming mail per
Stellungnahme/Forumsbeitrag. No schema change; the field and its rendering slot already exist. Do
this *after* P2, because a quoted position is what makes a justification Leitpunkt answerable.

**P5 — The 19 tail items.** Five Textsorte re-tags, fourteen Adressat/register fixes. An hour.

**Not scheduled, deliberately.** Finding 2 (the flat lexical profile) is not actionable on its own:
rewriting 717 rubrics to escalate in difficulty would make the C1 briefs harder to *read* without
making the tasks harder to *do*, and the second is what P2 addresses. Revisit only if a learner ever
reports that a C1 Aufgabe felt like a B1 one — and then fix the Leitpunkte, not the prose.

---

## 9. Method

- Bank loaded live through Vite `ssrLoadModule` (the `lint-content.mjs` pattern), so every count is
  the shipped value on this commit.
- **Repetition:** 3-gram shingle Jaccard over normalized instructions and over full briefs
  (instruction + Leitpunkte), all 256,686 pairs compared, threshold 0.45 / 0.40.
- **Demand classification:** phrase-level regex over the whole Leitpunkt, not the opening verb —
  German puts the meaning in the separable prefix at the end. A first pass keyed on the opening verb
  scored 9 of 11 `widerspruch` tasks as unargumentative; hand-reading them showed "**Legen** Sie
  dar, warum die Forderung unbegründet ist" is exactly the argumentative move, and the corrected
  classifier scores 1 of 11. Every figure in §4 comes from the corrected pass, and the sharp cases
  were read in full before being listed.
- **Branche markers:** 473 sector-tagged vocabulary items indexed on a 6-character stem, plus a
  hand-written role/place/abbreviation list per sector. Ambiguous matches count as *earned*, so
  §2.2's 33% is a floor. An earlier, thinner lexicon returned 40% and was discarded after hand-
  checking showed it missed `QS`, `Baugruppe`, `Validierung` and similar.
- **Lexical load:** `src/data/frequency.ts` bins, joined to the brief through the vocabulary head
  words (the map is keyed by content id, not surface form). 83% of brief tokens are not in the
  vocabulary bank at all, so §3's table is directional.
- **Exam-shape comparisons** are against published Goethe-Zertifikat and telc Deutsch B2 Beruf
  *format descriptions* (task shapes, word targets), never against exam material, per
  `strategy/DATA_GOVERNANCE.md`. The parked source-document item (s181) was not needed: every claim
  here is about internal consistency, not about matching an official rubric.
- Analysis scripts were scratch, not shipped. The two checks worth keeping are named in P1 and P2
  as `lint:content` additions.
