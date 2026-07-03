# Genauly — Product Evaluation against the Learning-Science Playbook

> _Run 2026-07-03. Applies the Section 11 "Reusable Educational Product Evaluation Framework" from
> `docs/LANGUAGE_LEARNING_SUCCESS_FACTORS.md` to Genauly. Grounded in the codebase (`src/engine/*`,
> `src/data/*`, the session engine, the Can-Do bank) and the shipped UX overhaul, not a generic rubric.
> Scores are 1 (Poor) to 5 (World-Class). This is an internal self-assessment, not an external audit._

## 1. Product overview & core pedagogy

Genauly is a mobile-first PWA that targets the **B1–B2 German plateau** for real-life situations
(workplace plus Behörde/banking/healthcare/housing), with telc/Goethe B2 exam prep as one pillar. Its
pedagogical core is genuinely strong by this playbook's standards: it is built on **retrieval practice +
spaced repetition** (an SM-2 SRS engine), and the recent UX overhaul added the single highest-leverage
structure the playbook argues for: a **composed, interleaved session** (`engine/session.ts`) that mixes
vocab retrieval, quiz items, and grammar drills into one 5–10 minute run, launched in one tap from
"Heute". It also shipped **CEFR Can-Do milestones**, which the playbook names explicitly as the way to
make progress feel like competence. The gaps are concentrated in **production mechanics** (speech-first
drills) and **scheduler sophistication** (SM-2 rather than FSRS, no latency signal).

## 2. Multi-dimensional scorecard

| # | Dimension | Score | One-line justification |
|---|---|---|---|
| 1 | Cognitive foundations & memory mechanics | **3.5 / 5** | Interleaved session loop is a direct hit; but SM-2 (not FSRS), no response-latency signal, no "guess-before-reveal" errorful learning. |
| 2 | Applied SLA (input/output) | **4 / 5** | Writing coach is a real Swain output loop; example translations hidden to preserve effort (input); free *spoken* output is the missing half. |
| 3 | Behavioral design & habit mechanics | **3.5 / 5** | One-tap session loop nails Fogg friction reduction; Hook "investment" (custom decks/import) and variable/social rewards are thin. |
| 4 | Curriculum structure & content architecture | **4.5 / 5** | Modular 5–10 min sessions, CEFR bands + Tier-0 defaults, taxonomy, and shipped Can-Do milestones. The strongest dimension. |
| 5 | Interactive exercise design | **3 / 5** | Instant formative feedback and a free-writing task are good; but recognition-heavy vocab and **no speech-first, latency-tracked drills** (the playbook's #1 exercise ask). |
| 6 | Multimedia design & CTML | **4 / 5** | The overhaul deliberately stripped clutter (Coherence Principle), feedback sits near input, reduced-motion respected. |
| 7 | Gamification & engagement quality | **3.5 / 5** | XP/streaks are non-punitive and paired with intrinsic Can-Do/diagnosis; but rewards don't yet privilege "desirable-difficulty" completion, and there's no social layer. |

**Weighted read:** strongest on **curriculum/CEFR (4.5)**, **SLA writing loop (4)**, and **UI/CTML (4)**;
weakest on **exercise production (3)** and dragged in dimension 1 by the **SM-2-not-FSRS** choice.

## 3. Deep-dive analytical findings

### 1. Cognitive foundations & memory mechanics — 3.5
The interleaved **session composer** is the headline strength: it reuses `reviewWeight` (mode/level/weak-
band weighting) and `isDue` to build a mixed block of flashcards, quiz questions, and grammar drills,
which is exactly the "shuffle diverse domains within one block" the playbook credits with up to 43%
better retention. The weakness is the scheduler and the signal it captures. `engine/srs.ts` is a
**compact SM-2** implementation; the playbook is emphatic that **FSRS** (stability/difficulty/retriev-
ability) reduces review volume ~23% at equal retention and, critically, that scheduling should read
**response latency**, not just correctness. Genauly tracks correctness only (no latency captured
anywhere in `src/`). There is also no **anticipatory prediction error** ("guess before you see the
answer"), a cheap, high-evidence technique the blueprint calls out. One thing Genauly gets right by
default: SM-2 keeps "mastered" cards in the long-term rotation rather than dropping them, which the
playbook warns is a common fatal error.

### 2. Applied SLA (comprehensible input & output) — 4
This is where Genauly's differentiator lands well. The **writing coach** (write → one prioritized
insight → deep-link to the exact drill) is a textbook **Swain output loop**: it forces production,
surfaces the learner's biggest gap, and routes to corrective practice. On the input side, the s40 move
to **hide example translations** aligns with Krashen-via-the-playbook's warning that frictionless
one-tap translation destroys the cognitive effort that drives acquisition. The affective filter is well
managed (non-punitive streaks, warm German copy, low-stakes retry). The clear gap is **spoken output**:
the speaking simulations are scripted branching dialogues with option selection plus Web Speech TTS, not
free spoken production that is captured and evaluated. STT exists in `speech.ts` but is not wired into a
graded speaking exercise, so the "push to fluency" is strong in writing and weak in speech.

### 3. Behavioral design & habit mechanics — 3.5
Fogg's B = M·A·P is served well on the **Ability/friction** axis: the "Deine Session · ~8 Min" hero and
the Schnellwiederholung preset are the "one-tap launch loop" the playbook prescribes, keeping a
low-motivation learner above the action threshold. Where Genauly under-invests is the Hook Model's
**Investment** phase: there is **no custom-deck building, personal dictionary, or content import** (grep
confirms none), so users accumulate little "stored value" and switching costs stay low. Variable rewards
are mostly the Self axis (progress/XP); the Hunt (discovery) is partial and the Tribe (social) is absent
by design. Reminders/notifications are not yet context-aware.

### 4. Curriculum structure & content architecture — 4.5
Genauly's best dimension. Content is chunked into **5–10 minute microlearning** sessions (inside the
playbook's 10–15 min target), organized by a real **taxonomy** (Domain → Theme → Sub-theme + CEFR
facets), and lists default to the learner's band (Tier-0), preventing difficulty spikes. Most decisively,
it shipped **CEFR "Can-Do" milestones** (`data/canDo.ts`, 25 statements, founder-verified) as the lead
of the Fortschritt screen, which is precisely the CEFR-alignment the framework asks for. The one missing
piece is an explicit **increasing-schedule** progression (start blocked/scaffolded on a new topic, then
auto-transition to interleaved); today the session is interleaved from the start rather than adaptively
ramping.

### 5. Interactive exercise design — 3
Formative feedback is a strength: drills grade instantly, the writing coach returns one precise insight,
grammar topics carry explanations and pitfalls. Production depth is mixed. The vocab surface skews toward
**recognition** (MCQ quiz, flashcard flip), with genuine production in word-order drills, cloze, and the
free-writing task. The decisive gap versus the playbook is **speech-first production**: the blueprint's
top exercise recommendation is hands-free, **time-pressured speech-recognition drills that track latency
and accuracy**, and Genauly has none as a session block type (blocks are flashcard/quiz/grammar). This is
the single most impactful missing exercise modality.

### 6. Multimedia design & CTML — 4
The UX overhaul was, in effect, a Coherence-Principle pass: the sign-in banner was demoted, the header
halved, the filter clutter (verb rail, colour legend) removed, and one primary CTA per screen enforced.
Feedback is placed near the input (Spatial Contiguity), the design system is clean and high-readability,
and reduced-motion is respected. Temporal-contiguity of audio+visual is only partial (TTS plays a word;
there is no synchronized highlight animation), and Modality (spoken narration of diagrams) is not used,
but for a text-forward learning app the extraneous-load discipline is strong.

### 7. Gamification & engagement quality — 3.5
Genauly avoids the playbook's central "gamification dilemma" trap reasonably well: streaks are framed
**non-punitively**, and the motivation model is anchored by **intrinsic** signals (Can-Do milestones, a
weakness "diagnose" card) rather than pure streak-chasing. XP/levels/tiers remain extrinsic scaffolding.
Two refinements the framework points to are open: rewards do not yet explicitly privilege completing
**hard/"desirable-difficulty"** exercises over easy reps, and there is no social/competition layer
(neither a flaw nor a strength here, given the deliberate solo-learner scope).

## 4. Product failure modes & design blindspots

1. **SM-2, not FSRS; no latency signal.** The playbook's single most-cited upgrade. Correctness-only
   scheduling leaves ~23% of review volume on the table and cannot detect "correct but slow" items.
2. **No speech-first production.** Spoken practice is scripted option-selection, not free, time-pressured,
   latency-tracked speech. The blueprint is blunt that tap-to-select does not build spoken fluency.
3. **No errorful "guess-before-reveal".** Anticipatory prediction errors are cheap and high-evidence;
   absent today.
4. **Thin Hook "investment" layer.** No custom decks / personal dictionary / import, so switching costs
   and personalization capital stay low.
5. **No talker variability.** A single TTS voice ties phonological schemas to one sanitized speaker; the
   playbook flags multi-voice/speed exposure as a productive desirable difficulty.
6. **Interleaving is not adaptively ramped.** No explicit blocked→interleaved "increasing schedule" when
   a brand-new topic is introduced.

## 5. Strategic architectural recommendations

1. **Promote FSRS + latency capture from "later bet" to a scoped project.** It is a drop-in behind the
   `engine/srs.ts` interface (the UX plan appendix already anticipates this). Start by *recording*
   per-review latency now, even before switching schedulers, so the data exists when FSRS lands. Highest
   evidence-to-effort ratio in the whole backlog.
2. **Add a speech-first session block.** A `SessionPlayer` block that prompts the learner to *say* the
   target under a soft timer, captures it via the existing Web Speech STT, and scores accuracy + latency.
   Free on Web Speech first; upgrade to Azure/SpeechAce for a paid tier later. This closes the biggest
   single gap (dimension 5) and directly serves the plateau thesis.
3. **Ship "guess-first" errorful mode.** Before revealing a translation/answer, prompt a quick guess.
   Small UI change to existing drill components; measurable effect on retention.
4. **Build a lightweight Hook investment surface.** "Save to my deck" / a personal word list / import a
   word from anywhere, feeding the SRS with the learner's own context (pairs naturally with the
   AI-sentence-mining idea in `AI_PRODUCT_STRATEGY.md`). Raises switching cost and personalization.
5. **Add talker variability as a session setting.** Multiple TTS voices + a speed toggle, rotated across
   session blocks. Cheap, and a genuine desirable difficulty that improves phonological transfer.

**Net:** Genauly already implements the *hard* half of this playbook (retrieval + spacing + interleaving
+ CEFR Can-Do + decluttered UI). The gains left on the table are concentrated in **production mechanics**
(speech-first) and **scheduler intelligence** (FSRS + latency), which are also the two upgrades the
source document argues have the largest effect on durable, transferable fluency.
