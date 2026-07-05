# Genauly — UX/UI & Front-End Design Analysis

> Evaluation of Genauly's front-end against the research meta-prompt in
> `LANGUAGE_LEARNING_SUCCESS_FACTORS.md` (Section 11), read through a **UX/UI and
> interaction-design** lens. Grounded in the actual codebase (`src/features/*`,
> `src/components/layout/*`), benchmarked against the competitors named in the
> research (Section 8), and cross-checked against the pedagogical conventions of
> German B1–B2 (Beruf) textbooks. Prepared 2026-07-05.

---

## 1. Product Overview & Core Pedagogy

**Genauly** is a React + TypeScript SPA that helps adult learners break the
**B1–B2 German plateau** and build practical fluency for the workplace and
everyday life (Behörde, Bank, Arzt, Wohnung), with direct prep for **telc
Deutsch B2 Beruf** and **Goethe-Zertifikat B2**. Its pedagogical spine, as
built, is:

- A **session-first learning loop** (`/session`, `features/session/SessionPlayer.tsx`):
  one composed, interleaved run mixing flashcards, leveled quiz questions,
  grammar micro-drills, and optional speaking drills behind a single progress
  bar + XP tally, ending on a "what got stronger" screen.
- An **FSRS-6 spaced-repetition engine** (`engine/srs.ts`) that captures **response
  latency**, not just correctness — the exact upgrade the research calls the
  next-generation standard over SM-2.
- A **four-zone information architecture** — Heute · Bibliothek · Anwenden ·
  Fortschritt — with a locked mobile bottom bar, a global ⌘K search, and
  CEFR **Can-Do milestones** (`data/canDo.ts`, 25 statements) driving progress.

In the research's own competitive frame, Genauly is positioned to be the
"Next-Gen Improvement" it prescribes for Anki and the Goethe materials: an FSRS
engine and a streamlined mobile UI wrapped around textbook-grade B2-Beruf
content. The gap between that promise and today's build is almost entirely on
the **exercise surface and production side**, not the engine.

---

## 2. Multi-Dimensional UX/UI Scorecard

Each dimension rated 1 (Poor) → 5 (World-Class), scored on **how the front-end
executes it**, not just whether the capability exists somewhere in the code.

| # | Dimension | Score | One-line justification (UX/UI lens) |
|---|-----------|:---:|-------------------------------------|
| 1 | Cognitive Foundations & Memory Mechanics | **4 / 5** | World-class FSRS+latency engine and `guessFirst` errorful default, but the visible exercise surface leans on **recognition** (MCQ, matching, self-graded flip) more than forced production. |
| 2 | Applied SLA (Input / Output) | **3 / 5** | Speaking production exists but is **opt-in and OFF by default**; authentic comprehensible-input (reading/listening immersion) is thin for a product whose whole job is the B1–B2 plateau. |
| 3 | Behavioral Design & Habit (Fogg / Hook) | **4 / 5** | The one-tap "Session starten" hero is excellent **Ability** design; streaks are forgiving. Rewards are monotone (no variable-reward or investment loop beyond XP). |
| 4 | Curriculum Structure & Content Architecture | **4 / 5** | Modular 5–15 min sessions, CEFR Can-Do, faceted taxonomy, band+1 defaults. The **blocked→interleaved** progression is implicit, not surfaced to the learner. |
| 5 | Interactive Exercise Design | **3 / 5** | Feedback is immediate and adjacent (good). Production depth is low: the vocab quiz is MCQ-forward-recognition; flashcards self-grade without typing. |
| 6 | Multimedia & Interface Clarity (Mayer CTML) | **4 / 5** | Clean, coherent, low-clutter, strong visual hierarchy and signaling. Held back by a **single synthetic TTS voice** (talker variability off by default) and no concept-illustrating graphics. |
| 7 | Gamification & Engagement Quality | **3 / 5** | XP + streak + daily goal + an intrinsic "Stärker geworden" panel. Purely standard extrinsic loop; no variable rewards, no anti-gaming design, no stored-value investment. |

**Composite read:** a **strong cognitive core and a genuinely clean, adult,
low-friction UI**, throttled by a recognition-heavy exercise surface, a
production side that is switched off by default, and thin authentic input for
the exact learner (B1–B2) the product targets.

---

## 3. Deep-Dive Analytical Findings

### Dimension 1 — Cognitive Foundations & Memory Mechanics (4/5)

**Strengths (grounded in code).** The scheduler is the research's headline
recommendation, already shipped: `engine/srs.ts` is FSRS-6 and every result
handler in `SessionPlayer.tsx` threads a `latencyMs` into `reviewVocab(...)`
(flashcard flip time, MCQ tap time, speaking think-time). This is the
"correct-but-slow" signal the research says reduces review volume ~23%. The
`guessFirst` setting (default **true**) implements **anticipatory prediction
error** exactly as prescribed: the MCQ view hides options behind *"Überlege
zuerst: Wie heißt die Antwort? Dann vergleiche."* before revealing them. The
session **composer interleaves block kinds**, which the research links to up to
43% better retention of confusable categories.

**The UX gap: recognition still dominates the surface.** The research is blunt
that passive matching produces "fragile, context-bound receptive vocabulary;
poor spoken recall," and ranks **forward L1→L2 cloze/production** as the durable
alternative. Yet the three quiz renderers in `QuestionViews.tsx` are
**MCQView** (pick one of four), **WordOrderView** (drag tokens — recognition of
order), and **MatchingView** (the single modality the research explicitly names
as fragile). The `FlashcardBlock` grades on a **self-assessed flip**
("Gewusst / Nochmal") — honest, but it never forces the learner to *type or say*
the target, so the retrieval is unverified. The engine is Formula-1; the pedals
it is wired to are mostly recognition taps.

**Second-order impact.** Because the strongest retrieval signal (production
latency + accuracy) only fires on the opt-in speaking block and typed grammar
drills, the FSRS model is being fed a diet that is heavier on recognition than
its own math is optimized for. Converting even the vocab flashcard into an
optional **typed-recall** step would materially improve both retention and the
quality of the data the scheduler learns from.

### Dimension 2 — Applied SLA: Input & Output (3/5)

**Output is built but hidden.** Genauly has real Comprehensible-Output
machinery: `SpeakingBlock` (Web Speech STT, tolerant matching via
`engine/pronounce.ts`, an 8-second listening window, a graceful typed-fallback
ladder) plus a writing coach (`features/writing`). This is genuinely ahead of
Duolingo. **But `recognitionEnabled` defaults to `false`** (`useSettingsStore`),
so the median learner never meets the production loop unless they dig into
settings. Swain's "push to fluency" is present in the repo and absent from the
default experience — a UX default, not an engineering, problem.

**Input scaffolding (i+1) is thin — and this is the strategic one.** The
research's Section 9 is written almost precisely about Genauly's user: the
"B1–B2 progress plateau," where sanitized classroom drills stop moving the
needle and only **authentic, context-rich content** (articles, dialogues,
native audio) bridges to fluency. Genauly has a rich `dialogues.ts` bank and a
`SimulationRunner`, but the *default* daily loop is decontextualized
word/phrase drilling. The i+1 "slightly above current level" input that Krashen
describes is not surfaced as a first-class daily activity. LingQ and Clozemaster
own this territory; for a plateau-breaker product it is the biggest strategic
hole, and it is a **content-surfacing/UX** decision more than a new engine.

**Negotiation of meaning is single-shot.** Feedback is "correct / here's the
answer," not a Vygotskian back-and-forth that asks the learner to *rephrase or
repair*. The speaking block showing "Deine Antwort: „…"" next to the target is
the closest thing to it and is a good pattern to extend.

### Dimension 3 — Behavioral Design & Habit Mechanics (4/5)

**Ability (Fogg) is the standout.** The Dashboard hero is a single gradient card
that resolves the entire "what do I do now?" question into one tap — *"Deine
Session · ~10 Min → Session starten,"* with a deterministic preview line so it
reads as *"Weiter, wo du warst."* This is textbook friction-reduction: even at
low motivation the behavior stays above the Fogg threshold. The
`/revision` "Schnelle Runde" and the mode-scoped Situationen chips give
low-cost alternate entry points. This is the app's best UX asset.

**Triggers & Investment are underdeveloped.** The Hook model's later stages are
mostly missing from the UI. Streaks exist and are humane (`useEffectiveStreak`
forgives a one-day gap, resets after two — not punitive, good), but there is no
**context-aware prompting** and, more importantly, no **stored-value investment
loop**: the research's switching-cost mechanic (learners building custom decks,
personal dictionaries, saved lists) is only weakly present via `savedWords`. The
"Stärker geworden" end panel is a nice **Self** variable-reward seed, but it is
the only one; there is no **Hunt** (discovering idioms/collocations) or **Tribe**
(any social/native-correction surface).

### Dimension 4 — Curriculum Structure & Content Architecture (4/5)

Genauly matches the research's "modular, ontology-mapped" ideal better than any
other dimension. Content is chunked into 5–15 min sessions (the Segmenting
Principle), the **Bibliothek** is a faceted Domain→Theme→Sub-theme hierarchy
with band+1 defaults, and **Can-Do milestones** give concrete CEFR "Ich kann…"
targets — the exact alignment the research and every German textbook chapter
opener use. The information architecture (four zones, global search) directly
answers the research's Section 9 discoverability requirement.

**What's missing is *visible* progression.** The research prescribes an
"increasing practice schedule": **blocked, scaffolded** intro of a topic
transitioning to **interleaved** review within ~2 weeks. The composer
interleaves, but the learner has no UI sense of *"you're in the scaffolded phase
of Konjunktiv II"* vs *"this is now in mixed review."* Surfacing that arc (even a
small per-theme phase indicator) would convert an internal algorithm into
felt-progress and directly attack plateau-boredom.

### Dimension 5 — Interactive Exercise Design (3/5)

**Feedback placement is a strength.** Every renderer places its verdict
**adjacent to the input** — the MCQ explanation sits under the options, the
grammar drill's *"Lösung: …"* + explanation renders in the same card, the
speaking block's correct/heard comparison is in-place. This satisfies Mayer's
**Spatial Contiguity** and the research's "feedback in the user's focus"
requirement well.

**Production depth and modality are the weak axis.** The research asks for the
**ratio of active production to passive recognition** and for
**speech-recognition-driven drills that prioritize articulation over taps.** In
the default loop that ratio is low: MCQ + matching + word-order tapping, with
speech gated off. There is no free-text **forward-translation cloze** in the
core vocab path (the grammar drills have a typed mode; vocab does not). The
"Prüfen" → reveal flow is solid interaction design; it is just pointed at
recognition tasks more often than production ones.

### Dimension 6 — Multimedia & Interface Clarity / Mayer CTML (4/5)

**Coherence & visual hierarchy: excellent.** The UI is disciplined — a single
accent-gradient hero, restrained cards, `SectionHeading` eyebrows, no decorative
stock imagery, no ambient noise. This is exactly the "strip extraneous load"
posture the research demands, and it reads as **adult and professional**, which
suits the B2-Beruf audience far better than Duolingo's cartoon register.
**Signaling** is present (color-coded success/danger states, badges naming the
task kind, `Zap`/XP cues).

**Two concrete CTML gaps.** (a) **Modality/Talker variability:** the app ships a
`voiceVariety` flag but defaults it **off**, so pronunciation plays through one
synthetic TTS voice. The research names multi-voice **talker variability** a
*productive* desirable difficulty, and Memrise's whole edge is native-speaker
video clips. Genauly already has the switch; the default is the miss. (b)
**Multimedia principle:** grammar/vocab is text-and-audio only; there are no
small **concept-illustrating visuals** (e.g. a case/preposition diagram, a
Wechselpräposition motion arrow) of the kind German textbooks (Aspekte,
Menschen, Sicher!) use heavily. The research rates the Multimedia and Signaling
principles as high-impact; a little targeted illustration would pay off.

### Dimension 7 — Gamification & Engagement Quality (3/5)

The loop is the **standard extrinsic triad** — XP, streak, daily-goal % — cleanly
executed and, to Genauly's credit, **not gameable in the harmful way** the
research warns about (XP is awarded for correctness on real difficulty, not raw
taps; there is no way to farm a streak with a trivial lesson). The end-screen's
**"Stärker geworden"** panel and *"Morgen: … festigen"* line are the beginnings
of the research's **intrinsic / stored-value** shift. But that is where it stops:
no variable-reward unpredictability, no collection/mastery meta-layer to chase,
no social validation. For a solo, no-teacher product this is the dimension with
the most untapped retention upside after the input gap.

---

## 4. Competitor Benchmark (UX/UI lens)

How the named competitors inform Genauly's front-end decisions:

| Platform | UX/UI lesson **for Genauly** |
|----------|------------------------------|
| **Duolingo** | The gold standard for **Ability/one-tap entry** and momentum — Genauly's hero card already borrows this well. **Do not** borrow its cartoon register or streak-guilt; wrong tone for B2-Beruf adults. |
| **Babbel** | Closest tonal peer: clean, dialogue-first, **adult** UI with an explicit review manager. Validates Genauly's restrained visual language and argues for surfacing the **review queue** more prominently (the `X fällig` chip is a start). |
| **Busuu** | Community-correction UI and a visible **study plan**. Points at Genauly's missing **Tribe** reward and at making the curriculum arc visible (Dimension 4). |
| **Memrise** | **Native-speaker video clips** = talker variability done as UX. Directly indicts Genauly's single-TTS-voice default (Dimension 6a). |
| **Anki** | Powerful FSRS, brutal UI. Genauly's thesis — FSRS **plus** a humane mobile UI — is validated; the job is to keep widening that UX lead, not the engine lead. |
| **LingQ / Clozemaster** | **Authentic reading/listening immersion + cloze** — the plateau-breaking input Genauly lacks by default (Dimension 2). The single biggest strategic borrow. |
| **Speak** | **Speech-first AI conversation** sets the production bar. Genauly has the STT plumbing; the lesson is to turn production **on by default** and make it the spine, not a setting. |

---

## 5. German-Textbook Criteria (what "good B2-Beruf" looks like on paper)

The user asked to check criteria against German textbooks. The established
B1–B2 (Beruf) course books — **telc / Goethe Prüfungstraining**, Hueber
**Menschen im Beruf** & **Sicher!**, Klett **Aspekte neu**, Cornelsen **Panorama
/ Fokus Deutsch** — share a recognizable pedagogical skeleton. Genauly maps onto
it unusually well, with two clear gaps:

| Textbook convention | What it is | Genauly today |
|---------------------|-----------|---------------|
| **Kann-Beschreibungen** at chapter start | "Ich kann…" can-do goals frame each unit | ✅ `data/canDo.ts` (25 milestones) drives Fortschritt — strong match |
| **Redemittel boxes** | Fixed, register-marked phrase banks (formell/neutral) | ✅ `data/redemittel.ts` + trainer, register-tagged — strong match |
| **Handlungsorientierung** | Action-oriented real situations (E-Mail, Reklamation, Termin) | ✅ Dashboard "Situationen" chips + dialogues/simulation |
| **Grammatik im Kontext + Übersichten** | Rule-in-context plus a summary table/diagram | ⚠️ Rules + patterns exist; **visual Übersichten/diagrams** missing (Dim 6b) |
| **Aussprache** sections | Explicit pronunciation practice, native models | ⚠️ TTS + STT present but **single voice, opt-in** (Dim 6a / 2) |
| **Authentische Lese-/Hörtexte + Landeskunde** | Graded authentic-style reading/listening | ❌ Thin in the **default** loop — the plateau gap (Dim 2) |
| **Prüfungstraining** | Exam-format practice under conditions | ✅ `features/exam` + `examSets.ts` |

The takeaway: Genauly already reproduces the **structural** best practices of a
good German course book (Can-Do, Redemittel, handlungsorientiert, Prüfung). The
two things textbooks do that Genauly under-delivers are **authentic graded input
with native audio** and **visual grammar overviews** — both UX/content-surfacing
work, not new infrastructure.

---

## 6. Failure Modes & Design Blindspots

1. **The engine is production-first; the default UX is recognition-first.** FSRS
   + latency is wasted if the median session is MCQ taps and self-graded flips.
   *(Dims 1, 5)*
2. **The product's core promise (break the B1–B2 plateau) is under-served by the
   default loop.** The research says plateaus break on authentic input; the
   default daily activity is decontextualized drilling. *(Dim 2)*
3. **The best pedagogy is hidden behind default-off switches.** `recognitionEnabled`
   (speaking) and `voiceVariety` (talker variability) both default false — the
   two most research-endorsed mechanics are opt-in. *(Dims 2, 6)*
4. **No stored-value investment loop.** Nothing accrues that raises switching
   cost or personalizes the deck (custom lists, mastered-idiom collection). *(Dims 3, 7)*
5. **Progression is invisible.** The blocked→interleaved arc and per-theme
   "phase" are internal to the composer; the learner can't *feel* movement, which
   is precisely what fights plateau-boredom. *(Dim 4)*
6. **Reward monotony.** One XP/streak loop, one Self-reward panel; no variable
   reward or social layer for long-run retention. *(Dim 7)*

---

## 7. Strategic Recommendations (prioritized for a non-technical founder)

Ordered by **retention impact ÷ build effort**. Items 1–3 are mostly
**default/UX flips on machinery that already exists** — highest leverage.

| # | Recommendation | Why (research anchor) | Effort |
|---|----------------|----------------------|:---:|
| **1** | **Add a typed forward-recall step to vocab** (L1→L2, tolerant matching like the grammar drill already uses). Keep the flip as a "reveal" fallback. | Turns the dominant modality from recognition to **production** — the single biggest retention lever, and it feeds FSRS better latency/accuracy data. | **M** |
| **2** | **Flip the two best defaults on.** Default-enable talker-variability (`voiceVariety: true`) now; make speaking **on by default** where STT is supported, with the existing typed fallback. | Talker variability = desirable difficulty (Memrise's edge); output is Swain's "push to fluency." Both already built. | **S** |
| **3** | **Surface an authentic-input activity in the daily loop** — a short graded "Lesen/Hören" card (reuse `dialogues.ts` + a curated authentic-style text) as a first-class session block. | Directly attacks the **B1–B2 plateau** the product exists to break (LingQ/Clozemaster territory). | **M–L** |
| **4** | **Add a stored-value investment loop** — let learners build a custom list / "meine Wörter" deck and collect mastered idioms/collocations (a Hunt reward). | Raises switching cost, adds a variable **Hunt/Self** reward, personalizes prompts. | **M** |
| **5** | **Make progression visible + add concept visuals.** A small per-theme phase indicator (scaffold → mixed review) and a handful of grammar **Übersicht** diagrams (cases, Wechselpräpositionen). | Felt-progress fights plateau-boredom (Dim 4); Multimedia/Signaling are high-impact CTML principles and match German-textbook Übersichten. | **M** |

**If only one thing ships:** Recommendation **1** (typed forward-recall). It
converts the app's strongest hidden asset — the FSRS+latency engine — from a
recognition diet to the production diet the entire research report is built
around, with no new backend and no change to the locked navigation or mobile bar.

---

*Method note: scores reflect the **default** front-end experience a median
learner meets, per the research's own "execution over capability" standard.
Several dimensions would score a full point higher if their default-off,
research-endorsed switches were simply turned on — which is itself the headline
finding.*
