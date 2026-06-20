# Genauly — AI Product Innovation Strategy

_Research-backed playbook for using modern AI to generate, validate, prioritise, and ship
high-value features for the B2 Beruf speaking-prep app._

_Prepared: 2026-06-20 · Branch `claude/genauly-ai-strategy-8wrlcz` · Audience: non-technical founder + small build team (currently the founder + Claude Code as CTO)._

> **Scope note.** This is a strategy/advisory document, not product copy. It still follows the
> house no-em-dash rule. Where it cites evidence, links are inline and collected under "Sources".
> Nothing here changes app behaviour; it is a decision aid you can act on incrementally.

---

## 1. Executive summary

Genauly already does the hard, unglamorous part right: it is built on the two learning mechanisms
with the strongest empirical support in all of cognitive psychology, **retrieval practice (active
recall)** and **spaced repetition** (your SM-2 SRS engine). The 2013 Dunlosky review and the
Roediger & Karpicke "testing effect" work put these at the top of the evidence pile, ahead of
re-reading, highlighting, and most "edtech" gimmicks. That is a real moat: most competitors bolt AI
onto a weak pedagogical core. You should bolt AI onto a strong one.

The single biggest product gap for a **speaking** exam is **productive output practice**. The
research splits into Krashen's "comprehensible input" (you learn by understanding language slightly
above your level) and Swain's "comprehensible output" (you learn by producing language, noticing the
gap, and self-correcting). A speaking exam lives almost entirely in Swain's territory, and output
practice is exactly what is hardest to deliver cheaply at scale without AI. This is where modern
LLMs plus speech models change the unit economics: a believable B2-Beruf roleplay partner, instant
diagnostic feedback on a spoken answer, and pronunciation scoring used to be impossible for a
two-person team. They are now a weekend prototype.

Three strategic bets, in order:

1. **Quick wins (now → 4 weeks):** Use AI as a *build-time and back-office* tool first (content
   generation with provenance, exam-rubric feedback on the writing coach you already planned,
   internal idea/validation workflows). Low risk, no new runtime data processing, no GDPR surface.
2. **Medium term (1–3 months):** Ship an **AI speaking partner** and **AI exam examiner** as the
   flagship runtime features, gated behind auth (your Phase 2 Supabase work), with audio processed
   transiently and never stored by default.
3. **Long term (3–9 months):** Personalised, adaptive study plans driven by your existing analytics,
   plus a thin "ask-anything" tutor. These need the most care on cost, latency, and GDPR/EU AI Act,
   so they come last.

The thread through all of it: **AI is leverage on a pedagogically sound product, not the product.**
Measure every AI feature against learning outcomes (mock-exam score deltas, retention of reviewed
items) and retention (D7/D30, streak survival), not "engagement with the AI" for its own sake.

---

## 2. Key research findings (with sources)

**Finding 1 — Your core is the highest-evidence learning science there is. Lean into it in copy and product.**
A large interdisciplinary review (Dunlosky et al.) rated *practice testing* and *distributed
practice* as the only two techniques with "high utility" across ages, materials, and subjects;
spacing can roughly double the efficiency of massed study at equal total time. The "testing effect"
(Roediger & Karpicke, 2006) shows retrieval beats re-study, with the gap widening at one-week delay.
**Implication:** market the science, and make every AI feature *generate retrieval opportunities*
(e.g. an AI conversation should end by feeding missed words back into the SRS queue).
[Spacing-effect evidence (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8759977/) ·
[Active recall vs spaced repetition, evidence compared](https://recallify.ai/evidence-for-active-recall-and-spaced-repetition/)

**Finding 2 — A speaking exam is an "output" problem, and output practice is the scarce, defensible thing.**
Swain's comprehensible-output hypothesis argues learners advance when they *produce* language, notice
where they cannot express meaning, and revise. Krashen counters that input dominates. For a B2 Beruf
*Sprechen* exam (presenting, negotiating, reacting), the test literally scores output, so the
practical answer is: you need both, but the product gap competitors under-serve is *structured,
feedback-rich speaking output*. **Implication:** AI roleplay + diagnostic feedback is the highest-
leverage feature, not more flashcards.
[Krashen vs Swain overview (Leonardo English)](https://www.leonardoenglish.com/blog/comprehensible-input) ·
[Swain, Comprehensible Output (Krashen's reply, PDF)](https://www.sdkrashen.com/content/articles/comprehensible_output.pdf)

**Finding 3 — The category leader has already validated AI roleplay + "explain my answer", and monetised it.**
Duolingo Max (GPT-4) ships exactly two features: **Roleplay** (scenario conversation partner with
feedback) and **Explain My Answer** (rule breakdown on mistakes), later **Video Call** with a
character. They put these behind the top subscription tier. This is strong market validation that
(a) learners value AI conversation + explanation, and (b) it supports premium pricing. **Implication:**
you can fast-follow with a *B2-Beruf-specialised* version, which is a sharper wedge than Duolingo's
generalist breadth.
[OpenAI × Duolingo case](https://openai.com/index/duolingo/) ·
[Duolingo Max announcement (investor)](https://investors.duolingo.com/news-releases/news-release-details/duolingo-max-shows-future-ai-education)

**Finding 4 — Automatic pronunciation assessment is now good enough to be useful, with known limits.**
CALL research shows ASR-based mispronunciation detection and automatic pronunciation assessment work
well on *segmental* features (individual sounds), and LLM/multimodal models have pushed accuracy
further, but there is a persistent gap on *prosody* (rhythm, intonation, stress). **Implication:**
ship pronunciation feedback, but scope claims to word/sound-level accuracy and "intelligibility";
do not over-promise native-like intonation scoring you cannot reliably deliver.
[Systematic review of ASR in EFL pronunciation (T&F)](https://www.tandfonline.com/doi/full/10.1080/2331186X.2025.2466288) ·
[AI in CALL overview (arXiv)](https://arxiv.org/pdf/2505.02032)

**Finding 5 — Running AI on user speech/text in the EU is a GDPR *and* EU AI Act question, and DPIAs are becoming the default gate.**
The EU AI Act layers on top of GDPR; it does not replace it. For conversational AI touching personal
data at scale, a **DPIA** is increasingly the standard gating step, and the EDPB's Opinion 28/2024
is the reference for how GDPR applies to AI models. Most B2-Beruf practice content is not "special
category" data, which keeps you out of the worst tier, but a learner's voice and free-text answers
are still personal data. **Implication:** design for *transient processing, no audio retention by
default, EU-region inference where possible, and a short DPIA* before the speaking features go live.
[EDPB Opinion 28/2024 explainer](https://measuredcollective.com/edpb-ai-models-personal-data-gdpr-guidance/) ·
[EU AI Act × GDPR (Taylor Wessing)](https://www.taylorwessing.com/en/global-data-hub/2025/eu-digital-laws-and-gdpr/gdh---the-eu-ai-act-and-the-gdpr)

**Finding 6 — Prioritisation should use a lightweight, reach-aware scoring model.**
RICE (Reach × Impact × Confidence ÷ Effort, from Intercom) and its simpler cousin ICE (Sean Ellis)
are the pragmatic standard for a small team. RICE is better once you have usage data to estimate
Reach; ICE is fine before that. **Implication:** use the adapted scoring model in §6 below; start
with ICE-style estimates, switch the Reach term to real analytics once Phase 2 telemetry exists.
[RICE vs ICE (Railsware)](https://railsware.com/blog/rice-framework/) ·
[ICE origin, Sean Ellis (ProductLift)](https://www.productlift.dev/blog/prioritizing-with-ice-model/)

---

## 3. The AI opportunity landscape for Genauly

Eight categories, with where Genauly specifically wins. "B2 Beruf" focus is your differentiator
against generalist apps, so every row is framed for the *workplace German exam*, not generic English.

| Category | Highest-leverage AI move for Genauly | Why it matters here |
|---|---|---|
| **Learning effectiveness** | AI feeds missed words/structures from conversations back into the SRS queue; "explain my mistake" in German + English | Closes the loop between output practice and retrieval practice (Findings 1–2) |
| **User engagement** | Scenario roleplay with your 10 workplace themes (meeting, conflict, logistics…) | Output practice is intrinsically more engaging than flashcards, and it is exam-shaped |
| **Personalisation** | Adaptive daily plan from analytics: target weak themes/grammar groups | You already track weakness categories; AI turns them into a sequenced plan |
| **Retention** | AI "exam-day countdown" coach + smart streak recovery | Speaking confidence is the emotional hook; tie streaks to mock-exam readiness |
| **Content creation** | Build-time generation of vocab examples, collocations, distractors, with provenance rows | Scales your 490-word/120-collocation banks safely under your governance policy |
| **Assessment & feedback** | AI examiner that scores a spoken/written answer against the real Goethe/telc rubric | This is the feature learners will pay for; it is your writing-coach plan extended to speaking |
| **Community & social** | AI-moderated peer practice matching + shared scenario library | Lightweight social without building a full community product |
| **Business growth** | AI-personalised landing pages per acquisition channel; in-app upsell at the "you're exam-ready" moment | Convert the confidence payoff into subscription intent |

---

## 4. AI tools and workflows (with strengths, weaknesses, cost, ideal use)

Split into **build-time / back-office** tools (you the team use them; no user-data or GDPR surface)
and **runtime** tools (called from the app on user input; cost, latency, and GDPR matter).

### 4a. Build-time & team tools

| Tool | Best for | Strengths | Weaknesses | Rough cost | Ideal Genauly use |
|---|---|---|---|---|---|
| **Claude (Opus/Sonnet) + Claude Code** | Ideation, content drafting, coding, this kind of analysis | Strong reasoning, long context, already your dev harness | Needs review for German-fact accuracy | API usage-based; Code in your plan | Generate vocab examples/distractors, draft feature specs, write the validation artefacts |
| **ChatGPT / GPT-4-class** | Brainstorming, competitor synthesis, German copy variants | Fast, broad, good German | Hallucinates citations; verify | ~$20/mo Plus or API | Second opinion on ideas; A/B copy generation |
| **Perplexity** | Competitor & market research with sources | Returns citations you can check | Shallow on niche edtech | ~$20/mo | Map competitor feature sets, exam-format changes |
| **NotebookLM** | Synthesising your own docs/research | Grounded in *your* uploads, low hallucination | Google account/data residency review | Free tier | Synthesise user interviews + your docs into themes |
| **Figma + First Draft / AI plugins** | UX/UI ideation, mockups | Fast layout exploration | Generic output, needs taste | Figma free/paid | Prototype the speaking-session screen before building |
| **v0 / Bolt / Lovable** | Rapid throwaway prototypes | Working React fast | Not your stack conventions; throwaway only | Free–$20/mo | Validate a flow in a clickable prototype, then rebuild properly in your repo |
| **Dovetail / Marvin (or NotebookLM)** | User-research synthesis | Tags + themes from transcripts | Paid tiers add up | Free–$$ | Cluster interview pain points into JTBD |
| **Maze / PostHog** | Experiment design + behavioural analytics | A/B tests, funnels, session insight; PostHog is EU-hostable | Setup effort | Free tiers exist | Run validation tests; measure activation/retention |

### 4b. Runtime AI (called on user input)

| Tool | Best for | Strengths | Weaknesses | Rough cost | Ideal Genauly use |
|---|---|---|---|---|---|
| **Anthropic Claude API (Haiku/Sonnet)** | Roleplay turns, feedback, "explain my answer" | Strong German, good instruction-following, **EU inference options + no-training commitments on API** | Per-token cost at scale | Haiku is cheapest; Sonnet for graded feedback | Conversation engine + rubric-based scoring |
| **OpenAI Realtime / GPT-4o** | Low-latency *spoken* conversation | Best-in-class voice latency | Cost, data-residency review needed | Usage-based, voice is pricier | Live spoken roleplay (premium tier) |
| **Web Speech API (already in your stack)** | TTS prompts + STT capture | Free, on-device, no data leaves browser | Browser-dependent quality, weak STT for accented German | Free | Keep as the zero-cost default tier |
| **Azure Speech / SpeechAce / ELSA-style APIs** | Pronunciation scoring | Phoneme-level assessment, German support | Cost; prosody still weak (Finding 4) | Per-minute | Premium pronunciation feedback |
| **Whisper (self-host or API)** | Transcribing user speech for grading | Robust multilingual ASR | Self-host = infra; API = data leaves | API usage / GPU cost | Transcribe spoken answers before LLM grading |
| **Supabase Edge Functions (your Phase 2)** | Server-side AI proxy | Keeps API keys off client, EU region, RLS | You maintain it | Included in Supabase | The *only* correct place to call paid AI APIs from |

**Hard rule:** never call a paid AI API directly from the browser SPA. Route every runtime AI call
through a **Supabase Edge Function** so keys stay server-side, region is EU, rate limits are
enforced, and you have one place to log/consent/redact. This matches your existing Phase 2 plan.

---

## 5. The repeatable AI-powered innovation workflow

A loop a two-person team can actually run. Each stage has a copy-paste prompt scaffold.

```
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ 1. DISCOVER │ →  │ 2. GENERATE │ →  │ 3. VALIDATE │ →  │ 4. PRIORITISE│ → │ 5. BUILD &  │
   │ pains/JTBD  │    │ ideas       │    │ cheaply     │    │ RICE/ICE    │    │ MEASURE     │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
          ↑                                                                          │
          └──────────────────────── learnings feed back ────────────────────────────┘
```

**Stage 1 — Discover (pain points & Jobs-to-be-Done).** Feed real inputs (interview notes, app-store
reviews of competitors, support messages, your analytics on where users drop) into Claude/NotebookLM.

> Prompt: *"You are a JTBD researcher. Here are [N] notes from B2-Beruf exam candidates: [paste].
> Extract the top jobs in the format 'When I ___, I want to ___, so I can ___.' For each, rate
> frequency and intensity 1–5, and quote the evidence. Flag jobs unique to a **workplace** exam
> (vs general German) and jobs nobody is serving well."*

**Stage 2 — Generate (feature ideation against a job).** One job at a time, not "give me 50 ideas".

> Prompt: *"For this job: [paste one JTBD]. Generate 8 feature concepts for a B2-Beruf speaking-prep
> app. For each: the concept in one line, the learning-science rationale (retrieval/spacing/output),
> the smallest version that delivers value, and the riskiest assumption. Bias toward ideas that
> reuse an existing SRS/analytics/dialogue engine. No generic gamification."*

**Stage 3 — Validate (cheapest test first).** See §6. Generate the artefacts with AI, run the test
with humans.

**Stage 4 — Prioritise.** Score with the model in §7.

**Stage 5 — Build & measure.** Define the success metric *before* building. Ship behind a flag,
instrument it, and review against the metric in 1–2 weeks. Kill or double down.

Cadence for a small team: run Stages 1–2 monthly, keep a living scored backlog, build 1–2 validated
ideas per cycle.

---

## 6. Validation & testing framework

Validate before you build. Order tests cheapest-to-most-expensive; stop as soon as an idea fails.

| Method | What AI does | What humans do | Signal you want |
|---|---|---|---|
| **User-interview prep** | Generate a non-leading discussion guide + probes from the JTBD | Run 5–8 interviews | Do people describe the pain unprompted? |
| **Survey generation** | Draft a short German survey, balanced scales, no leading questions | Send to your list / exam forums | Demand intensity, willingness to pay |
| **Landing-page test** | Generate headline/benefit variants + a fake-door "Join waitlist / Try AI examiner" button | Put it on a `/preview` route or a separate page | Click-through to the fake door = real intent |
| **MVP / Wizard-of-Oz** | Generate the scenario scripts and rubric | *You* hand-grade the first 20 spoken answers before automating | Does the feedback feel useful? |
| **A/B test** | Generate variants + hypothesis | Split via flag, run with enough users | Lift in activation/retention, not vanity clicks |
| **Behavioural analytics** | Suggest the funnel + events to instrument | Wire PostHog/Supabase events | Where users drop, what predicts D30 |

**Success metrics that matter for Genauly (define per feature):**
- **Learning:** mock-exam score delta; % of conversation-missed items later passed in SRS.
- **Activation:** % of new users who complete one speaking session in week 1.
- **Engagement:** speaking sessions/week per active user (quality over raw screen time).
- **Retention:** D7/D30 retention; streak survival; exam-date cohort retention.
- **Business:** free→paid conversion at the "exam-ready" moment; gross margin per AI session (watch token cost).

**Fake-door is your best friend.** Because the live site is static GitHub Pages and feature-branch
pushes do not deploy, the cleanest pre-build test is a single landing/`/preview` page on `main` with
a waitlist button wired to a Supabase table. Cost: near zero. Signal: high.

---

## 7. Prioritisation system (scoring model + worked examples)

Adapted RICE, tuned for a pre-revenue B2-Beruf team. Two extra factors matter for you that vanilla
RICE omits: **Strategic differentiation** (does it deepen the B2-Beruf wedge vs generalist apps?)
and **Risk** (GDPR/cost/latency). Score each 1–5 except Reach and Effort.

```
Score = (Reach × Impact × Confidence × Differentiation) / (Effort × Risk)

  Reach          1–5   how many active users touch it (use real analytics once you have them)
  Impact         1–5   per-user value: learning outcome + engagement
  Confidence     1–5   evidence it will work (research + validation done)
  Differentiation 1–5  how much it sharpens the B2-Beruf moat
  Effort         1–5   build + maintenance cost (5 = very large)
  Risk           1–5   GDPR/cost/latency/accuracy exposure (5 = scary)
```

Worked examples (illustrative pre-validation estimates; re-score after validation):

| Idea | R | I | C | Diff | Eff | Risk | Score | Read |
|---|---|---|---|---|---|---|---|---|
| AI speaking roleplay (themes) | 5 | 5 | 4 | 5 | 3 | 3 | **55.6** | Flagship, do first |
| AI exam examiner (rubric scoring) | 4 | 5 | 4 | 5 | 3 | 3 | **44.4** | Pair with roleplay |
| Explain-my-mistake (DE+EN) | 5 | 4 | 5 | 3 | 2 | 2 | **75.0** | Cheap, high-value quick win |
| AI-generated content + provenance | 3 | 3 | 5 | 2 | 2 | 1 | **45.0** | Back-office quick win |
| Adaptive daily study plan | 4 | 4 | 3 | 4 | 4 | 2 | **24.0** | Medium term |
| Live low-latency voice call | 3 | 4 | 3 | 4 | 5 | 4 | **7.2** | Long term (cost/latency) |
| Pronunciation phoneme scoring | 3 | 4 | 3 | 4 | 4 | 4 | **9.0** | Long term (prosody gap, cost) |

The pattern is deliberate: the **highest scores are the cheap, high-confidence wins**
("explain my mistake", content generation), which you ship first to build momentum, while the
glamorous voice features score lower until cost/latency/GDPR confidence improves. Re-score with real
Reach numbers once Phase 2 analytics land.

---

## 8. Ten to twenty high-potential AI feature ideas (with validation method each)

Numbered, mapped to a category, with the smallest viable version and the cheapest validation. IDs are
for your backlog.

1. **AI Speaking Partner ("Sprechpartner")** — *Engagement / Output.* Text-or-voice roleplay across
   your 10 workplace themes (lead a meeting, de-escalate a conflict, brief a colleague). Ends by
   pushing missed words into SRS. **MVP:** text-only, 3 scenarios, Web Speech for voice-out.
   **Validate:** fake-door waitlist + Wizard-of-Oz (you play the partner for 10 testers via chat).

2. **AI Exam Examiner ("Prüfer-Modus")** — *Assessment.* Submit a spoken or written answer to a
   Teil-1/2/3 task; get a score against the real Goethe/telc rubric (Aufgabenbewältigung, Kohärenz,
   Wortschatz, Korrektheit, Aussprache) plus 2 concrete fixes. **MVP:** written first, reuse your
   planned writing coach. **Validate:** hand-grade 20 answers, ask testers if scores feel fair.

3. **Explain-My-Mistake (DE + EN)** — *Feedback.* On any wrong quiz/drill answer, a one-tap "warum?"
   gives a short rule explanation in German with an English gloss. **MVP:** cache explanations per
   drill so cost is near-zero. **Validate:** A/B the button; measure repeat-error rate.

4. **Adaptive Daily Plan ("Heute üben")** — *Personalisation.* Turns your weakness-category analytics
   into a sequenced 15-minute plan (this grammar group + these collocations + one speaking task).
   **MVP:** rules first, AI only for the rationale text. **Validate:** does plan-completion predict D30?

5. **Pronunciation Coach (segmental)** — *Feedback.* Record a sentence, get word/sound-level feedback
   and a model re-read. Scope to sounds/intelligibility, not intonation (Finding 4). **MVP:** Web
   Speech STT + simple diff before paying for SpeechAce/Azure. **Validate:** do users re-record?

6. **Conversation-to-SRS loop** — *Learning effectiveness.* Any word/structure a user fumbled in a
   roleplay is auto-added as an SRS card with the user's own sentence as context. **MVP:** extract
   top-3 gaps per session. **Validate:** retention of "conversation-sourced" cards vs normal cards.

7. **AI Scenario Generator** — *Content creation.* On-demand new roleplay scenarios for a chosen
   theme/role, with provenance rows auto-stubbed. **MVP:** build-time only (you curate before
   shipping). **Validate:** linter passes + spot-check German quality.

8. **Smart Distractor Factory** — *Content creation (build-time).* Generate plausible-but-wrong MCQ
   options and word-order shuffles for the quiz engine, reviewed by you. **Validate:** item difficulty
   stats (are distractors actually chosen?).

9. **"Mock Oral Exam" full run** — *Assessment / Retention.* A timed end-to-end simulation of the
   real speaking exam with an AI examiner and a final report. The emotional payoff that drives
   conversion. **MVP:** stitch ideas 1+2. **Validate:** does a completed mock predict subscription?

10. **Exam-Readiness Score** — *Retention / Growth.* A single 0–100 confidence number from analytics
    + mock results, with "what to do to raise it". **MVP:** weighted formula, AI writes the advice.
    **Validate:** correlate the score with real reported exam pass/fail.

11. **AI Vocabulary Sentence Mining** — *Personalisation.* Personalised example sentences for a target
    word using the learner's own job context ("ich arbeite in der Logistik"). **Validate:** do
    personalised examples beat generic on recall?

12. **Register Switcher** — *Learning effectiveness.* Take a learner's casual sentence and show the
    formal/workplace ("Sie"-form, professional) version, a core B2-Beruf skill. **MVP:** build-time
    pairs first. **Validate:** survey demand among testers.

13. **AI-Moderated Peer Practice Matching** — *Community.* Match two learners at similar levels for a
    scripted roleplay; AI provides the scenario and post-session feedback to both. **MVP:** async
    (record + swap) before live. **Validate:** do matched users return more?

14. **"Ask Genauly" Tutor** — *Engagement.* A constrained Q&A bot that answers German-grammar/usage
    questions, grounded only in your content banks (RAG) to limit hallucination and cost. **Validate:**
    answer-accuracy spot-checks; question volume.

15. **Spaced Roleplay Reminders** — *Retention.* AI schedules the *next* best roleplay based on SRS
    timing and weak themes, delivered as a push/email nudge. **Validate:** nudge → session conversion.

16. **AI-Personalised Landing & Onboarding** — *Business growth.* Tailor the first-run flow and
    marketing headline to the user's stated exam (Goethe vs telc) and job field. **MVP:** 2–3 variants,
    not full generation. **Validate:** A/B activation rate.

17. **Confidence Journal with AI Reflection** — *Retention.* Short weekly "how do you feel about
    speaking?" check-in; AI reflects patterns and celebrates progress. **Validate:** retention lift in
    the cohort that journals.

18. **Build-time Content QA Agent** — *Content creation / quality.* An agent that pre-checks new
    content for em-dashes, register, factual German, and missing provenance *before* `pnpm lint:content`.
    **Validate:** fewer linter failures + reviewer time saved.

Ideas 3, 7, 8, 18 are **build-time / low-GDPR quick wins**. Ideas 1, 2, 6, 9 are the **flagship
runtime cluster**. Ideas 11–17 are medium-term once the flagship is live.

---

## 9. Practical roadmap (with GDPR/security baked in)

### Phase 0 — Guardrails first (week 0, before any runtime AI)
- Write a **short DPIA** for AI features touching voice/free-text (Finding 5). Most content is not
  special-category data, so this is light, but do it.
- Decide the data rule and put it in your privacy page: **audio is processed transiently and not
  stored by default; transcripts/feedback are stored only with consent and are user-deletable**
  (you already have per-submission delete + export from Phase 2 GDPR work, reuse it).
- Pick an EU-region inference path and a provider with **no-training-on-API-data** terms; route all
  calls through **Supabase Edge Functions**, never the browser.
- Add an AI-specific consent line and bump `CONSENT_VERSION` in lockstep with the legal pages.

### Quick wins (weeks 1–4) — build-time AI + cheapest runtime feature
- **Explain-My-Mistake (idea 3)** with cached explanations: near-zero runtime cost, high value.
- **Build-time content generation** (ideas 7, 8, 18) under your provenance/governance policy.
- **Fake-door landing test** for the AI Speaking Partner to size demand before building it.
- Internalise the §5 workflow: run one Discover→Generate→Validate loop end-to-end.

### Medium term (months 1–3) — the flagship cluster
- **AI Speaking Partner (idea 1)**, text-first then Web-Speech voice, behind auth, EU edge function.
- **AI Exam Examiner (idea 2)** reusing the writing-coach plumbing; start written, add spoken.
- **Conversation-to-SRS loop (idea 6)** to tie it back to your retrieval-practice core.
- **Mock Oral Exam (idea 9)** + **Exam-Readiness Score (idea 10)** as the conversion moment.
- Instrument everything in PostHog/Supabase; re-score the backlog with real Reach.

### Long term (months 3–9) — adaptive + voice + monetisation
- **Adaptive daily plan (idea 4)** and **personalised sentences (idea 11)** once telemetry is rich.
- **Low-latency live voice** and **phoneme pronunciation scoring** once cost/latency/accuracy and the
  EU AI Act high-risk timeline (obligations land Aug 2026) are comfortable.
- **AI-personalised growth (ideas 15–17)** to lift retention and conversion.
- Revisit the DPIA and AI Act posture as features deepen.

### Cost discipline (non-negotiable for a small team)
- Default to the **cheapest model that passes** (Haiku-class for chat turns, a stronger model only
  for graded feedback). Cache aggressively (idea 3). Cap tokens per session. Put a per-user daily AI
  budget behind the free tier and meter the paid tier. Track **gross margin per AI session** as a
  first-class metric so a viral week cannot blow up the bill.

---

## 10. Prioritised action plan — next steps

1. **This week:** Run one full §5 loop on the single job "I need to feel ready to *speak* on exam
   day." Output: a scored backlog (use §7), confirming the flagship cluster.
2. **This week:** Ship **Explain-My-Mistake** with cached explanations (quick win, idea 3) and put a
   **fake-door waitlist** for the AI Speaking Partner on a `/preview` page on `main`.
3. **Week 0 of any runtime AI:** Write the light **DPIA**, set the **no-store audio** rule, wire the
   **Supabase Edge Function proxy** with EU region + no-training provider terms, bump consent version.
4. **Weeks 2–4:** Use build-time AI to expand content under your provenance policy; measure reviewer
   time saved and waitlist signups.
5. **Month 1–3:** Build the flagship cluster (ideas 1, 2, 6, 9, 10) behind auth; instrument metrics;
   hand-grade before automating (Wizard-of-Oz) so feedback quality is proven before scale.
6. **Ongoing:** Monthly innovation loop; keep this doc's scoring backlog live; re-score with real
   analytics; track gross margin per AI session every week.

**The one-sentence strategy:** Genauly's edge is a pedagogically sound retrieval-and-spacing core; use
AI to add the one thing that core cannot cheaply provide on its own, *feedback-rich speaking output
practice for the workplace exam*, and ship it safely, cheaply, and measurably.

---

## Sources

- Dunlosky-style spacing/testing evidence — [PMC: spacing effect](https://pmc.ncbi.nlm.nih.gov/articles/PMC8759977/)
- Active recall vs spaced repetition, compared — [recallify.ai](https://recallify.ai/evidence-for-active-recall-and-spaced-repetition/)
- Krashen comprehensible input vs Swain output — [Leonardo English](https://www.leonardoenglish.com/blog/comprehensible-input)
- Swain comprehensible output (with Krashen reply, PDF) — [sdkrashen.com](https://www.sdkrashen.com/content/articles/comprehensible_output.pdf)
- Duolingo × OpenAI case — [openai.com/index/duolingo](https://openai.com/index/duolingo/)
- Duolingo Max announcement — [investors.duolingo.com](https://investors.duolingo.com/news-releases/news-release-details/duolingo-max-shows-future-ai-education)
- ASR in EFL pronunciation, systematic review — [Taylor & Francis](https://www.tandfonline.com/doi/full/10.1080/2331186X.2025.2466288)
- AI in CALL, overview — [arXiv 2505.02032](https://arxiv.org/pdf/2505.02032)
- EDPB Opinion 28/2024 on AI & personal data — [explainer](https://measuredcollective.com/edpb-ai-models-personal-data-gdpr-guidance/)
- EU AI Act × GDPR — [Taylor Wessing](https://www.taylorwessing.com/en/global-data-hub/2025/eu-digital-laws-and-gdpr/gdh---the-eu-ai-act-and-the-gdpr)
- RICE framework — [Railsware](https://railsware.com/blog/rice-framework/)
- ICE framework / Sean Ellis — [ProductLift](https://www.productlift.dev/blog/prioritizing-with-ice-model/)

_Caveat: web-sourced claims above were drawn from reputable secondary summaries; for a formal
filing or legal sign-off, confirm the primary papers (Dunlosky et al. 2013; Roediger & Karpicke 2006;
Swain 1985) and have a DPO review the DPIA._
