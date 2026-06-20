# Genauly — AI Product Innovation Strategy

_Research-backed playbook for using modern AI to generate, validate, prioritise, and ship
high-value features for Genauly: helping B1–B2 learners break through the intermediate German
plateau and reach usable fluency for real-life situations (workplace **plus** bureaucracy, banking,
healthcare, and housing), with certification exam prep as one pillar._

_Prepared: 2026-06-20 (rev. 3) · Branch `claude/genauly-ai-strategy-8wrlcz` · Audience: non-technical founder + small build team (currently the founder + Claude Code as CTO)._

> **Revision 3 (2026-06-20).** Refreshed all research to the June 2026 landscape and corrected dated
> claims: model/tool names and prices are now current (Claude Opus 4.8 / Sonnet 4.6 / Haiku 4.5,
> GPT-5.5, Gemini 3.1 Pro / 3.5 Flash, `gpt-realtime`, Gemini Live); added the 2025 Harvard
> AI-tutoring RCT and 2026 market data; corrected the EU AI Act timeline (high-risk deadline deferred
> to Dec 2027, not Aug 2026); and added a "productive struggle" guardrail finding. Net: the strategy
> is unchanged in direction but better grounded and now evidence-led rather than assertion-led.

> **Scope (corrected 2026-06-20).** Genauly's mission is to help adult learners break through the
> **intermediate German plateau (B1–B2)** and reach usable fluency for the situations that matter:
> the workplace *and* everyday life (bureaucracy/Behörde, banking, healthcare/Arzt, housing). Direct
> **exam prep (telc Deutsch B2 Beruf, Goethe-Zertifikat B2) is one pillar, not the whole product.**
> Revision 1 of this doc over-indexed on the speaking exam because the developer-facing `CLAUDE.md`
> header still described the app as "B2 Beruf Speaking Prep"; that header (and the `EXPANSION_PLAN`
> title) were stale and have been corrected alongside this revision. The repositioning itself shipped
> in session 21 (live landing page, `/about`, PWA manifest, `docs/BUSINESS_PLAN.md`).
>
> **Scope note.** This is a strategy/advisory document, not product copy. It still follows the
> house no-em-dash rule. Where it cites evidence, links are inline and collected under "Sources".
> Nothing here changes app behaviour; it is a decision aid you can act on incrementally.

---

## 1. Executive summary

Genauly's mission is to get learners *off the intermediate plateau*. The B1–B2 stall is the single
most documented dropout point in language learning: generic high-frequency vocabulary runs out, and
the next level demands spontaneous, flexible production across many real-world topics rather than
rehearsed phrases. Most learners never escape it. That is the problem Genauly exists to solve, in two
domains that mainstream apps ignore: the **workplace** *and* the **everyday-life situations** that
matter most to adult immigrants and residents (a Behörde appointment, a bank call, a doctor visit, a
rental viewing). Exam prep (telc B2 Beruf, Goethe B2) is one important pillar, because B2 gates visas
and professional licensing, but it is not the whole product.

Genauly already does the hard, unglamorous part right: it is built on the two learning mechanisms
with the strongest empirical support in all of cognitive psychology, **retrieval practice (active
recall)** and **spaced repetition** (your SM-2 SRS engine). The 2013 Dunlosky review and the
Roediger & Karpicke "testing effect" work put these at the top of the evidence pile, ahead of
re-reading, highlighting, and most "edtech" gimmicks. That is a real moat: most competitors bolt AI
onto a weak pedagogical core. You should bolt AI onto a strong one.

What breaks a plateau is **contextual practice in real situations**, combining rich comprehensible
*input* slightly above the learner's level (Krashen) with structured *output* where they produce
language, notice the gap, and self-correct (Swain). The biggest product gap mainstream apps leave is
exactly this: believable, feedback-rich practice in the specific situations a learner will actually
face, across both work and daily life. That used to be impossible to deliver cheaply at scale.
Modern LLMs plus speech models change the unit economics: a Behörde-counter roleplay, a "explain
this Bescheid in plain German" helper, a mock job interview, or instant diagnostic feedback on a
spoken answer used to be impossible for a two-person team. They are now a weekend prototype.

Three 2025–2026 developments make this the right moment, and they are why this revision is more
confident than a generic "add AI" pitch. **First, the evidence turned:** a 2025 Harvard randomized
controlled trial found a well-designed AI tutor beat an active-learning class by roughly 0.7–1.3
standard deviations, in less time (Finding 3). AI conversation is now a measured learning
intervention, not just engagement bait. **Second, the market validated it:** online language learning
is ~$24B and growing ~16%/year, Duolingo reports users will pay more for premium AI speaking, and the
AI-conversation app Speak reportedly hit a ~$1B valuation (Finding 4). **Third, cost collapsed:** a
capable chat-turn model now costs cents per active user per month (Finding 6). The one essential
caveat (Finding 8): badly designed AI tutors create dependence, not skill, so every feature here is
built around *productive struggle*, the learner produces first, then gets feedback, then retrieves.

Three strategic bets, in order:

1. **Quick wins (now → 4 weeks):** Use AI as a *build-time and back-office* tool first (generate
   situation scenarios and content for new life-domains *with provenance*, rubric feedback on the
   writing coach you already planned, internal idea/validation workflows). Low risk, no new runtime
   data processing, no GDPR surface. This is also how you cheaply expand content beyond the workplace.
2. **Medium term (1–3 months):** Ship an **AI situation partner** (workplace *and* daily-life
   scenarios) and an **AI feedback/examiner** as the flagship runtime features, gated behind auth
   (your Phase 2 Supabase work), with audio processed transiently and never stored by default.
3. **Long term (3–9 months):** Personalised, adaptive study plans driven by your existing analytics,
   a real-life "scenario library" spanning bureaucracy/banking/healthcare/housing, plus a thin
   "ask-anything" tutor. These need the most care on cost, latency, and GDPR/EU AI Act, so they come last.

The thread through all of it: **AI is leverage on a pedagogically sound product, not the product.**
Measure every AI feature against learning outcomes (plateau progress: can the learner now handle the
situation? plus retention of reviewed items) and retention (D7/D30, streak survival), not
"engagement with the AI" for its own sake. Exam-score deltas are one outcome among several, not the
only one.

---

## 2. Key research findings (with sources)

**Finding 1 — Your core is the highest-evidence learning science there is. Lean into it in copy and product.**
A large interdisciplinary review (Dunlosky et al., 2013) rated *practice testing* and *distributed
practice* as the only two techniques with "high utility" across ages, materials, and subjects;
spacing can roughly double the efficiency of massed study at equal total time. The "testing effect"
(Roediger & Karpicke, 2006) shows retrieval beats re-study, with the gap widening at one-week delay.
**Implication:** market the science, and make every AI feature *generate retrieval opportunities*
(e.g. an AI conversation should end by feeding missed words back into the SRS queue).
[Spacing-effect evidence (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8759977/) ·
[Active recall vs spaced repetition, evidence compared](https://recallify.ai/evidence-for-active-recall-and-spaced-repetition/)

**Finding 2 — The B1–B2 plateau is the core problem, and it is broken by contextual input + output across real situations (not just exam drills).**
The intermediate plateau is a well-documented SLA phenomenon: high-frequency vocabulary runs out, and
the B1→B2 jump demands a qualitative shift from rehearsed responses to *spontaneous, flexible
production* on a wide range of topics, professional *and* everyday. Most learners stall here and many
give up. The mechanism for breaking through combines Krashen's *comprehensible input* (understanding
language a step above your level) with Swain's *comprehensible output* (producing language, noticing
the gap, revising). The practical answer: learners need rich, situation-specific practice, input and
output, across the exact contexts they will face, at work *and* in daily life (Behörde, bank, doctor,
landlord). That is the gap mainstream apps under-serve. **Implication:** AI roleplay + diagnostic
feedback, spanning workplace *and* daily-life scenarios, is the highest-leverage feature, not more
generic flashcards. A speaking exam is one high-stakes instance of this output problem, not the
boundary of it.
[Intermediate plateau, why B1–B2 learners stall (Glossika)](https://ai.glossika.com/blog/overcoming-intermediate-plateau) ·
[Krashen input vs Swain output overview (Leonardo English)](https://www.leonardoenglish.com/blog/comprehensible-input) ·
[Swain, Comprehensible Output (Krashen's reply, PDF)](https://www.sdkrashen.com/content/articles/comprehensible_output.pdf)

**Finding 3 — AI conversation and tutoring now produce real, measured learning gains, not just engagement (2025–2026 RCTs).**
This is the most important update since revision 1. A 2025 Harvard randomized controlled trial
(Kestin et al., *Scientific Reports*) found students learning through a well-designed AI tutor learned
*more in less time* than in an active-learning class, an effect size of roughly **0.7–1.3 standard
deviations**, while reporting higher engagement and motivation. A World Bank RCT in Nigeria (a
six-week after-school programme using a GPT-class model) found gains of ~0.3 SD overall and ~0.23 SD
in English. Google DeepMind's LearnLM trials had supervising human tutors approve ~76% of the model's
drafted Socratic messages with zero or minimal edits. **Implication:** a feedback-rich AI tutor/partner
is now an evidence-backed intervention, not a gimmick, *provided it is built around productive
struggle* (see Finding 8). This is the research backbone of the whole strategy.
[Harvard AI-tutoring RCT (Nature, Scientific Reports 2025)](https://www.nature.com/articles/s41598-025-97652-6) ·
[LearnLM pedagogy trials (Google DeepMind, Nov 2025, PDF)](https://storage.googleapis.com/deepmind-media/LearnLM/learnLM_nov25.pdf)

**Finding 4 — The market is large and growing, and the category leader has monetised AI speaking, validating the wedge.**
Online language learning is ~$24B in 2026, forecast to ~$51B by 2031 (~16% CAGR). Duolingo, the
leader, has made 2026 an explicit AI "investment year": its GPT-powered **Roleplay**, **Explain My
Answer**, and **Video Call** (real-time conversation with a character) sit in its top subscription
tiers, and management reports customers are *willing to pay more for premium speaking experiences*.
Speak, an AI-conversation-first app, reportedly raised ~$78M at a ~$1B valuation in 2026 on exactly
this thesis. **Implication:** AI conversation + explanation demonstrably attracts users and supports
premium pricing. Your edge is not breadth (Duolingo wins there) but a sharp, specialised wedge: the
German B1–B2 plateau across the real-life situations (work, Behörde, banking, healthcare, housing)
that generalists ignore. Fast-follow the proven features; differentiate on specificity.
[Online language-learning market size (Mordor)](https://www.mordorintelligence.com/industry-reports/online-language-learning-market) ·
[Duolingo 2026 AI "investment year" + premium speaking (PYMNTS)](https://www.pymnts.com/earnings/2026/duolingo-bets-on-user-growth-to-outpace-ai-disruption/) ·
[OpenAI × Duolingo case](https://openai.com/index/duolingo/)

**Finding 5 — Automatic pronunciation assessment is now good enough to be useful, with known limits.**
CALL research shows ASR-based mispronunciation detection and automatic pronunciation assessment work
well on *segmental* features (individual sounds), and LLM/multimodal models have pushed accuracy
further, but there is a persistent gap on *prosody* (rhythm, intonation, stress). Production APIs
(Azure Speech assesses ~33 locales for accuracy/fluency/miscue; SpeechAce scores at syllable/phoneme
level; ELSA covers sounds plus sentence-level intonation) exist and support German, but Microsoft's
own docs flag accuracy limits. **Implication:** ship pronunciation feedback, but scope claims to
word/sound-level accuracy and "intelligibility"; do not over-promise native-like intonation scoring
you cannot reliably deliver.
[Systematic review of ASR in EFL pronunciation (T&F)](https://www.tandfonline.com/doi/full/10.1080/2331186X.2025.2466288) ·
[Azure pronunciation assessment limits (Microsoft)](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/pronunciation-assessment/characteristics-and-limitations-pronunciation-assessment)

**Finding 6 — Capability is up and cost has fallen sharply (June 2026), so "build it now" is cheaper than even a year ago.**
The current frontier (June 2026): Anthropic **Claude Opus 4.8 / Sonnet 4.6 / Haiku 4.5**, OpenAI
**GPT-5.5**, Google **Gemini 3.1 Pro / 3.5 Flash**, all with ~1M-token context and aggressive cost
levers (batch processing ~50% off, prompt caching up to ~90% off). A capable chat-turn model (Haiku
4.5 at ~$1/$5 per million in/out tokens, Gemini 3 Flash at ~$0.50/$3) now costs cents per active user
per month, and cached/repeated content is near-free. Real-time speech-to-speech (OpenAI
`gpt-realtime`, Gemini Live) is production-ready but remains the priciest path. **Implication:** the
cheap text features in this doc are affordable today; reserve the expensive live-voice path for a paid
tier and meter it. Prices move fast, re-check before committing.
[Anthropic API pricing 2026](https://www.cloudzero.com/blog/claude-api-pricing/) ·
[OpenAI GPT-5.5 pricing 2026](https://devtk.ai/en/blog/openai-api-pricing-guide-2026/) ·
[Gemini 3 pricing 2026](https://www.eesel.ai/blog/google-gemini-3-pricing)

**Finding 7 — GDPR plus the EU AI Act, with a key 2026 update: high-risk deadlines slipped, but DPIAs still gate you.**
The EU AI Act layers on top of GDPR; it does not replace it. Under the **"Digital Omnibus" provisional
agreement (May 2026)**, the high-risk (Annex III) compliance deadline was **deferred from 2 Aug 2026
to 2 Dec 2027** (revision 1 of this doc wrongly said obligations land Aug 2026). General-purpose-AI
obligations have applied since Aug 2025. A language-learning *practice* tutor is generally **not**
high-risk, but note the nuance: AI used to *score exams or determine access to education* can fall
under Annex III, so frame your AI examiner as **practice feedback, not official certification**.
Regardless of tier, a **DPIA** is the practical gate for processing voice/free-text, and the EDPB's
Opinion 28/2024 is the GDPR-for-AI reference. **Implication:** transient processing, no audio
retention by default, EU-region inference where possible, and a short DPIA before speaking features
go live.
[EU AI Act Digital Omnibus, deferred high-risk dates (Gibson Dunn)](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/) ·
[EDPB Opinion 28/2024 explainer](https://measuredcollective.com/edpb-ai-models-personal-data-gdpr-guidance/)

**Finding 8 — Designed badly, AI tutors create dependence, not skill. Build for productive struggle.**
The necessary counterweight to Finding 3: recent studies warn of *"metacognitive laziness"*, where
learners who lean on generative AI for answers disengage their own effort and retain less. **Implication:**
every AI feature must push the learner to *produce and retrieve* (Swain output, then SRS), not just
receive answers. Concretely, the AI partner makes the user speak first; "explain my mistake" appears
*after* an attempt, never instead of it; and conversation gaps flow back into retrieval practice. This
discipline is also what differentiates Genauly from answer-dispensing chatbots.
[Generative AI and metacognitive laziness in education (arXiv 2025)](https://arxiv.org/pdf/2512.12306)

**Finding 9 — Prioritisation should use a lightweight, reach-aware scoring model.**
RICE (Reach × Impact × Confidence ÷ Effort, from Intercom) and its simpler cousin ICE (Sean Ellis)
are the pragmatic standard for a small team. RICE is better once you have usage data to estimate
Reach; ICE is fine before that. **Implication:** use the adapted scoring model in §7 below; start
with ICE-style estimates, switch the Reach term to real analytics once Phase 2 telemetry exists.
[RICE vs ICE (Railsware)](https://railsware.com/blog/rice-framework/) ·
[ICE origin, Sean Ellis (ProductLift)](https://www.productlift.dev/blog/prioritizing-with-ice-model/)

---

## 3. The AI opportunity landscape for Genauly

Eight categories, with where Genauly specifically wins. Your differentiator against generalist apps
is **plateau-breaking, situation-based German for real life**, work *and* daily-life domains
(bureaucracy/Behörde, banking, healthcare, housing), with exam prep as one high-value pillar. Every
row is framed for that, not for generic English and not for the workplace exam alone.

| Category | Highest-leverage AI move for Genauly | Why it matters here |
|---|---|---|
| **Learning effectiveness** | AI feeds missed words/structures from conversations back into the SRS queue; "explain my mistake" in German + English | Closes the loop between situation output practice and retrieval practice (Findings 1–2) |
| **User engagement** | Scenario roleplay across both pillars: the 10 workplace themes *and* daily-life situations (Behörde counter, bank call, doctor visit, flat viewing) | Situated output practice in the user's real life is intrinsically more engaging than flashcards |
| **Personalisation** | Adaptive plan from analytics: target weak themes/grammar groups *and* the life-domains the learner flags as their goal (job vs visa vs settling in) | You already track weakness categories; AI sequences them to the learner's real-life goal |
| **Retention** | AI goal coach (exam-day countdown *or* "ready for your Behörde appointment") + smart streak recovery | The emotional hook is confidence in a real upcoming situation, not only an exam |
| **Content creation** | Build-time generation of vocab/collocations/scenarios *for new life-domains*, with provenance rows | The cheapest way to expand beyond the 10 workplace themes into bureaucracy/banking/healthcare/housing |
| **Assessment & feedback** | AI feedback that scores a spoken/written answer against the real Goethe/telc rubric *and* against "did you accomplish the real-world task?" | Exam learners pay for rubric scoring; daily-life learners want "would this have worked at the counter?" |
| **Community & social** | AI-moderated peer practice matching + shared real-life scenario library | Lightweight social; user-contributed situations grow the scenario library |
| **Business growth** | AI-personalised onboarding by goal (exam / visa / job / settling in); upsell at the "you're ready for X" moment | Convert the confidence payoff into subscription intent across every goal, not just exam day |

---

## 4. AI tools and workflows (with strengths, weaknesses, cost, ideal use)

Split into **build-time / back-office** tools (you the team use them; no user-data or GDPR surface)
and **runtime** tools (called from the app on user input; cost, latency, and GDPR matter).

_Model names and prices below are the **June 2026** landscape and move fast; treat costs as
order-of-magnitude and re-check before committing. Per-million-token (input/output) rates are listed
where useful._

### 4a. Build-time & team tools

| Tool | Best for | Strengths | Weaknesses | Rough cost | Ideal Genauly use |
|---|---|---|---|---|---|
| **Claude Opus 4.8 / Sonnet 4.6 + Claude Code** | Ideation, content drafting, coding, this analysis | Strong reasoning, ~1M context, already your dev harness | Review for German-fact accuracy | Opus $5/$25, Sonnet $3/$15 per 1M; Code in your plan | Generate vocab examples/distractors, draft feature specs, write validation artefacts |
| **ChatGPT (GPT-5.5)** | Brainstorming, competitor synthesis, German copy variants | Fast, broad, strong German, 1M context | Hallucinates citations; verify | ~$20/mo Plus, or API $5/$30 per 1M | Second opinion on ideas; A/B copy generation |
| **Google Gemini 3.1 Pro / 3.5 Flash** | Long-context synthesis, cheap bulk drafting | 2M context (Pro), very cheap Flash tier | Data-residency review for EU | Flash $1.50/$9, Pro $2/$12 per 1M | Bulk-draft scenario/vocab candidates for review |
| **Perplexity** | Competitor & market research with sources | Returns citations you can check | Shallow on niche edtech | ~$20/mo | Map competitor feature sets, exam-format changes |
| **NotebookLM** | Synthesising your own docs/research | Grounded in *your* uploads, low hallucination | Google account/data residency review | Free tier | Synthesise user interviews + your docs into themes |
| **Lovable / v0 (Vercel) / Bolt / Figma Make** | Rapid throwaway prototypes | Working React fast; Bolt strong full-stack, v0 polished front-end, Figma Make adds interaction to designs | Not your stack conventions; throwaway only | Free–~$20–30/mo | Validate a flow as a clickable prototype, then rebuild properly in your repo |
| **Dovetail / Marvin (or NotebookLM)** | User-research synthesis | Tags + themes from transcripts | Paid tiers add up | Free–$$ | Cluster interview pain points into JTBD |
| **PostHog / Maze** | Experiment design + behavioural analytics | A/B tests, funnels, session insight; PostHog is EU-hostable | Setup effort | Generous free tiers | Run validation tests; measure activation/retention |

### 4b. Runtime AI (called on user input)

| Tool | Best for | Strengths | Weaknesses | Rough cost | Ideal Genauly use |
|---|---|---|---|---|---|
| **Claude Haiku 4.5** | High-volume roleplay turns, "explain my answer" | Cheap, fast, strong German; batch + prompt caching cut cost ~50–90% | Less depth than Opus/Sonnet | ~$1/$5 per 1M | Default conversation engine + cached explanations |
| **Claude Sonnet 4.6 (or Opus 4.8)** | Graded feedback / rubric scoring | Best instruction-following for nuanced scoring; **API no-training commitments** | Pricier than Haiku | $3/$15 (Sonnet), $5/$25 (Opus) | The AI examiner / task-feedback grader |
| **Gemini 3 Flash / 3.5 Flash** | Cheapest acceptable chat turns | Very low cost, 1M context | EU data-residency review | $0.50/$3 – $1.50/$9 | Cost-optimised alternative for chat-turn volume |
| **OpenAI `gpt-realtime` / Gemini Live** | Low-latency *spoken* conversation | Production speech-to-speech (WebRTC/WebSocket); Gemini Live does 70+ languages | Priciest path; data-residency review; latency not always published | Usage-based, voice premium | Live spoken roleplay (paid tier only) |
| **Web Speech API (already in your stack)** | TTS prompts + STT capture | Free, on-device, no data leaves browser | Browser-dependent; weak STT for accented German | Free | Keep as the zero-cost default tier |
| **Azure Speech / SpeechAce / ELSA** | Pronunciation scoring | Phoneme/syllable-level, German support (Azure ~33 locales) | Cost; prosody still weak (Finding 5) | Per-minute | Premium pronunciation feedback |
| **Whisper (self-host or API)** | Transcribing user speech for grading | Robust multilingual ASR | Self-host = infra; API = data leaves | API usage / GPU cost | Transcribe spoken answers before LLM grading |
| **Supabase Edge Functions (your Phase 2)** | Server-side AI proxy | Keeps API keys off client, EU region, RLS | You maintain it | Included in Supabase | The *only* correct place to call paid AI APIs from |

**Hard rule:** never call a paid AI API directly from the browser SPA. Route every runtime AI call
through a **Supabase Edge Function** so keys stay server-side, region is EU, rate limits are
enforced, and you have one place to log/consent/redact. This matches your existing Phase 2 plan.
**Model choice rule:** default to the cheapest model that passes your quality bar (Haiku 4.5 / Gemini
Flash for chat turns), and reserve Sonnet/Opus for graded feedback where nuance pays. Re-evaluate
quarterly; this tier list will shift.

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

> Prompt: *"You are a JTBD researcher. Here are [N] notes from B1–B2 German learners (mix of exam,
> work, and daily-life goals): [paste]. Extract the top jobs in the format 'When I ___, I want to
> ___, so I can ___.' For each, rate frequency and intensity 1–5, and quote the evidence. Flag jobs
> unique to **real-life German in Germany** (work, Behörde, banking, healthcare, housing) vs general
> German, and jobs nobody is serving well."*

**Stage 2 — Generate (feature ideation against a job).** One job at a time, not "give me 50 ideas".

> Prompt: *"For this job: [paste one JTBD]. Generate 8 feature concepts for Genauly, an app that helps
> B1–B2 learners break through the German plateau for real-life situations (work *and* daily life:
> Behörde, banking, healthcare, housing), with exam prep as one pillar. For each: the concept in one
> line, the learning-science rationale (retrieval/spacing/input/output), the smallest version that
> delivers value, and the riskiest assumption. Bias toward ideas that reuse an existing
> SRS/analytics/dialogue engine. No generic gamification."*

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
- **Business:** free→paid conversion at the "you're ready for X" moment (exam, appointment, interview); gross margin per AI session (watch token cost).

**Fake-door is your best friend.** Because the live site is static GitHub Pages and feature-branch
pushes do not deploy, the cleanest pre-build test is a single landing/`/preview` page on `main` with
a waitlist button wired to a Supabase table. Cost: near zero. Signal: high.

---

## 7. Prioritisation system (scoring model + worked examples)

Adapted RICE, tuned for a pre-revenue plateau-focused team. Two extra factors matter for you that
vanilla RICE omits: **Strategic differentiation** (does it deepen the "plateau-breaking, real-life
German" wedge vs generalist apps?) and **Risk** (GDPR/cost/latency). Score each 1–5 except Reach and Effort.

```
Score = (Reach × Impact × Confidence × Differentiation) / (Effort × Risk)

  Reach          1–5   how many active users touch it (use real analytics once you have them)
  Impact         1–5   per-user value: learning outcome + engagement
  Confidence     1–5   evidence it will work (research + validation done)
  Differentiation 1–5  how much it sharpens the plateau / real-life-German moat
  Effort         1–5   build + maintenance cost (5 = very large)
  Risk           1–5   GDPR/cost/latency/accuracy exposure (5 = scary)
```

Worked examples (illustrative pre-validation estimates; re-score after validation):

| Idea | R | I | C | Diff | Eff | Risk | Score | Read |
|---|---|---|---|---|---|---|---|---|
| AI situation partner (work + daily life) | 5 | 5 | 4 | 5 | 3 | 3 | **55.6** | Flagship, do first |
| AI examiner & task-feedback | 4 | 5 | 4 | 5 | 3 | 3 | **44.4** | Pair with the partner |
| Behörde & document decoder | 4 | 5 | 4 | 5 | 3 | 3 | **44.4** | Sharp daily-life wedge |
| Daily-life scenario packs (Behörde first) | 4 | 4 | 4 | 5 | 3 | 1 | **106.7** | Cheap content expansion, do early |
| Explain-my-mistake (DE+EN) | 5 | 4 | 5 | 3 | 2 | 2 | **75.0** | Cheap, high-value quick win |
| AI-generated content + provenance | 3 | 3 | 5 | 2 | 2 | 1 | **45.0** | Back-office quick win |
| Adaptive plan (goal-aware) | 4 | 4 | 3 | 4 | 4 | 2 | **24.0** | Medium term |
| Live low-latency voice call | 3 | 4 | 3 | 4 | 5 | 4 | **7.2** | Long term (cost/latency) |
| Pronunciation phoneme scoring | 3 | 4 | 3 | 4 | 4 | 4 | **9.0** | Long term (prosody gap, cost) |

The pattern is deliberate: the **highest scores are the cheap, high-differentiation wins** (daily-life
scenario packs, "explain my mistake", content generation), which you ship first to build momentum and
to widen the product beyond the workplace, while the glamorous voice features score lower until
cost/latency/GDPR confidence improves. Re-score with real Reach numbers once Phase 2 analytics land.

---

## 8. Ten to twenty high-potential AI feature ideas (with validation method each)

Numbered, mapped to a category, with the smallest viable version and the cheapest validation. IDs are
for your backlog.

1. **AI Situation Partner ("Gesprächspartner")** — *Engagement / Output.* Text-or-voice roleplay
   across **both pillars**: workplace scenarios (lead a meeting, de-escalate a conflict, brief a
   colleague) *and* daily-life scenarios (register at the Bürgeramt, dispute a bank charge, describe
   symptoms to a doctor, ask a landlord about the Nebenkostenabrechnung). Ends by pushing missed words
   into SRS. **MVP:** text-only, 3 scenarios spanning one work + two life domains, Web Speech for
   voice-out. **Validate:** fake-door waitlist + Wizard-of-Oz (you play the partner for 10 testers via chat).

2. **AI Examiner & Task-Feedback ("Prüfer-Modus")** — *Assessment.* Submit a spoken or written
   answer; get scored feedback plus 2 concrete fixes. Two modes share one engine: **exam mode** scores
   against the real Goethe/telc rubric (Aufgabenbewältigung, Kohärenz, Wortschatz, Korrektheit,
   Aussprache); **real-life mode** scores "did you accomplish the task, and was the register right for
   a counter/bank/doctor?". **MVP:** written exam mode first, reuse your planned writing coach.
   **Validate:** hand-grade 20 answers, ask testers if scores feel fair.

3. **Explain-My-Mistake (DE + EN)** — *Feedback.* On any wrong quiz/drill answer, a one-tap "warum?"
   gives a short rule explanation in German with an English gloss. **MVP:** cache explanations per
   drill so cost is near-zero. **Validate:** A/B the button; measure repeat-error rate.

4. **Adaptive Daily Plan ("Heute üben")** — *Personalisation.* Turns your weakness-category analytics
   into a sequenced 15-minute plan (this grammar group + these collocations + one speaking task).
   **MVP:** rules first, AI only for the rationale text. **Validate:** does plan-completion predict D30?

5. **Pronunciation Coach (segmental)** — *Feedback.* Record a sentence, get word/sound-level feedback
   and a model re-read. Scope to sounds/intelligibility, not intonation (Finding 5). **MVP:** Web
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

10. **Goal-Readiness Score** — *Retention / Growth.* A single 0–100 confidence number **per goal**
    (pass the exam, handle a Behörde appointment, get through a job interview, settle into daily life)
    from analytics + mock/scenario results, with "what to do to raise it". **MVP:** weighted formula,
    AI writes the advice. **Validate:** correlate with real reported outcomes (exam pass, "the
    appointment went fine").

11. **AI Sentence Mining (life context)** — *Personalisation.* Personalised example sentences for a
    target word using the learner's own context, work *or* daily life ("ich arbeite in der Logistik",
    "ich habe einen Termin beim Ausländeramt"). **Validate:** do personalised examples beat generic on recall?

12. **Register Switcher** — *Learning effectiveness.* Take a learner's casual sentence and show the
    formal ("Sie"-form, professional/official) version, a core plateau skill needed at work *and* with
    officials and banks. **MVP:** build-time pairs first. **Validate:** survey demand among testers.

13. **AI-Moderated Peer Practice Matching** — *Community.* Match two learners at similar levels for a
    scripted roleplay; AI provides the scenario and post-session feedback to both. **MVP:** async
    (record + swap) before live. **Validate:** do matched users return more?

14. **"Ask Genauly" Tutor** — *Engagement.* A constrained Q&A bot that answers German-grammar/usage
    questions, grounded only in your content banks (RAG) to limit hallucination and cost. **Validate:**
    answer-accuracy spot-checks; question volume.

15. **Spaced Roleplay Reminders** — *Retention.* AI schedules the *next* best roleplay based on SRS
    timing and weak themes, delivered as a push/email nudge. **Validate:** nudge → session conversion.

16. **AI-Personalised Onboarding by Goal** — *Business growth.* Tailor the first-run flow and headline
    to the user's stated goal (pass an exam / get a visa / handle a job / settle into daily life) and
    domain. **MVP:** 2–3 variants, not full generation. **Validate:** A/B activation rate.

17. **Confidence Journal with AI Reflection** — *Retention.* Short weekly "how do you feel about
    speaking German in real situations?" check-in; AI reflects patterns and celebrates progress.
    **Validate:** retention lift in the cohort that journals.

18. **Build-time Content QA Agent** — *Content creation / quality.* An agent that pre-checks new
    content for em-dashes, register, factual German, and missing provenance *before* `pnpm lint:content`.
    **Validate:** fewer linter failures + reviewer time saved.

19. **Behörde & Document Decoder** — *Daily-life / Learning effectiveness.* Paste or describe a German
    official letter (Bescheid, Mahnung, Nebenkostenabrechnung, a bank or insurance notice); get a
    plain-German + English explanation, the action required, and the 5 key terms pushed to SRS. A
    genuine "I needed this today" hook for immigrants, and a sharp daily-life differentiator. **MVP:**
    text paste only (no OCR yet), strictly explanation (not legal advice; show a disclaimer).
    **Validate:** fake-door + Wizard-of-Oz on 10 real documents from testers.

20. **Daily-Life Scenario Packs** — *Content creation / Engagement.* Themed scenario sets for the new
    life-domains (Bürgeramt/Ausländerbehörde, banking, doctor/Apotheke, housing/Wohnungssuche), built
    with the AI Scenario Generator (idea 7) under your provenance policy. This is how the product
    physically grows beyond the 10 workplace themes. **MVP:** one pack (Behörde) end-to-end.
    **Validate:** demand survey + completion/retention of the new pack vs the workplace themes.

Ideas 3, 7, 8, 18, 20 are **build-time / low-GDPR quick wins** (and the path into new life-domains).
Ideas 1, 2, 6, 9, 19 are the **flagship runtime cluster**, spanning work *and* daily life. Ideas
10–17 are medium-term once the flagship is live.

---

## 9. Practical roadmap (with GDPR/security baked in)

### Phase 0 — Guardrails first (week 0, before any runtime AI)
- Write a **short DPIA** for AI features touching voice/free-text (Finding 7). Most content is not
  special-category data, so this is light, but do it. Frame the AI examiner as *practice feedback*,
  not official certification, to stay clear of the EU AI Act's high-risk education tier.
- Decide the data rule and put it in your privacy page: **audio is processed transiently and not
  stored by default; transcripts/feedback are stored only with consent and are user-deletable**
  (you already have per-submission delete + export from Phase 2 GDPR work, reuse it).
- Pick an EU-region inference path and a provider with **no-training-on-API-data** terms; route all
  calls through **Supabase Edge Functions**, never the browser.
- Add an AI-specific consent line and bump `CONSENT_VERSION` in lockstep with the legal pages.

### Quick wins (weeks 1–4) — build-time AI + cheapest runtime feature + widen scope
- **Explain-My-Mistake (idea 3)** with cached explanations: near-zero runtime cost, high value.
- **First daily-life scenario pack (ideas 20 + 7)** built with build-time AI under provenance/governance
  policy. Start with **Behörde**: it widens the product beyond the workplace at near-zero runtime cost.
- **Build-time content generation** (ideas 7, 8, 18) for the new life-domains.
- **Fake-door landing test** for the AI Situation Partner *and* the Behörde Document Decoder (idea 19)
  to size demand across both pillars before building them.
- Internalise the §5 workflow: run one Discover→Generate→Validate loop end-to-end.

### Medium term (months 1–3) — the flagship cluster (work + daily life)
- **AI Situation Partner (idea 1)**, text-first then Web-Speech voice, covering workplace *and* the
  first daily-life packs, behind auth, EU edge function.
- **AI Examiner & Task-Feedback (idea 2)** reusing the writing-coach plumbing; start written, add spoken.
- **Behörde & Document Decoder (idea 19)** as the standout daily-life feature.
- **Conversation-to-SRS loop (idea 6)** to tie it back to your retrieval-practice core.
- **Mock Oral Exam (idea 9)** + **Goal-Readiness Score (idea 10)** as the conversion moment.
- Instrument everything in PostHog/Supabase; re-score the backlog with real Reach.

### Long term (months 3–9) — adaptive + full scenario library + voice + monetisation
- **Goal-aware adaptive plan (idea 4)** and **life-context sentences (idea 11)** once telemetry is rich.
- **Full daily-life scenario library** (banking, healthcare, housing) beyond the first Behörde pack.
- **Low-latency live voice** (`gpt-realtime` / Gemini Live) and **phoneme pronunciation scoring** once
  cost/latency/accuracy are comfortable. (The EU AI Act high-risk deadline was deferred to Dec 2027,
  so timeline pressure there has eased, but keep the practice-feedback framing from Finding 7.)
- **AI-personalised growth (ideas 15–17)** to lift retention and conversion.
- Revisit the DPIA and AI Act posture as features deepen.

### Cost discipline (non-negotiable for a small team)
- Default to the **cheapest model that passes** (Haiku-class for chat turns, a stronger model only
  for graded feedback). Cache aggressively (idea 3). Cap tokens per session. Put a per-user daily AI
  budget behind the free tier and meter the paid tier. Track **gross margin per AI session** as a
  first-class metric so a viral week cannot blow up the bill.

---

## 10. Prioritised action plan — next steps

1. **This week:** Run two full §5 loops, one per pillar: "I need to feel ready to *speak* on exam day"
   *and* "I need to handle my Behörde appointment in German." Output: a scored backlog (use §7),
   confirming the flagship cluster across work *and* daily life.
2. **This week:** Ship **Explain-My-Mistake** with cached explanations (quick win, idea 3) and put a
   **fake-door waitlist** for the AI Situation Partner *and* the Behörde Document Decoder on a
   `/preview` page on `main`, so you size demand for both pillars at once.
3. **Week 0 of any runtime AI:** Write the light **DPIA**, set the **no-store audio** rule, wire the
   **Supabase Edge Function proxy** with EU region + no-training provider terms, bump consent version.
4. **Weeks 2–4:** Use build-time AI to ship the **first daily-life scenario pack (Behörde)** and expand
   content under your provenance policy; measure reviewer time saved and waitlist signups.
5. **Month 1–3:** Build the flagship cluster (ideas 1, 2, 6, 9, 10, 19) behind auth; instrument metrics;
   hand-grade before automating (Wizard-of-Oz) so feedback quality is proven before scale.
6. **Ongoing:** Monthly innovation loop; keep this doc's scoring backlog live; re-score with real
   analytics; track gross margin per AI session every week.

**The one-sentence strategy:** Genauly's edge is a pedagogically sound retrieval-and-spacing core; use
AI to add the one thing that core cannot cheaply provide on its own, *feedback-rich, situation-based
practice that breaks the B1–B2 plateau across work and daily life*, and ship it safely, cheaply, and
measurably.

---

## Sources

_Learning science_
- Dunlosky-style spacing/testing evidence — [PMC: spacing effect](https://pmc.ncbi.nlm.nih.gov/articles/PMC8759977/)
- Active recall vs spaced repetition, compared — [recallify.ai](https://recallify.ai/evidence-for-active-recall-and-spaced-repetition/)
- Intermediate plateau (why B1–B2 learners stall) — [Glossika](https://ai.glossika.com/blog/overcoming-intermediate-plateau)
- Krashen comprehensible input vs Swain output — [Leonardo English](https://www.leonardoenglish.com/blog/comprehensible-input)
- Swain comprehensible output (with Krashen reply, PDF) — [sdkrashen.com](https://www.sdkrashen.com/content/articles/comprehensible_output.pdf)

_AI in education (evidence + cautions)_
- Harvard AI-tutoring RCT, effect size 0.7–1.3 SD — [Nature, Scientific Reports 2025](https://www.nature.com/articles/s41598-025-97652-6)
- LearnLM pedagogy trials — [Google DeepMind, Nov 2025 (PDF)](https://storage.googleapis.com/deepmind-media/LearnLM/learnLM_nov25.pdf)
- "Metacognitive laziness" / over-reliance caution — [arXiv 2025](https://arxiv.org/pdf/2512.12306)
- ASR in EFL pronunciation, systematic review — [Taylor & Francis](https://www.tandfonline.com/doi/full/10.1080/2331186X.2025.2466288)
- Azure pronunciation assessment limits — [Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/pronunciation-assessment/characteristics-and-limitations-pronunciation-assessment)

_Market & competitors_
- Online language-learning market size/forecast — [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/online-language-learning-market)
- Duolingo 2026 AI "investment year" + premium speaking — [PYMNTS](https://www.pymnts.com/earnings/2026/duolingo-bets-on-user-growth-to-outpace-ai-disruption/)
- Duolingo × OpenAI case — [openai.com/index/duolingo](https://openai.com/index/duolingo/)

_Models & pricing (June 2026, volatile)_
- Anthropic Claude API pricing 2026 — [CloudZero](https://www.cloudzero.com/blog/claude-api-pricing/)
- OpenAI GPT-5.5 pricing 2026 — [DevTk.AI](https://devtk.ai/en/blog/openai-api-pricing-guide-2026/)
- Google Gemini 3 pricing 2026 — [eesel AI](https://www.eesel.ai/blog/google-gemini-3-pricing)
- OpenAI realtime voice (`gpt-realtime`) — [OpenAI](https://openai.com/index/introducing-gpt-realtime/)
- AI prototyping tools compared (Lovable/v0/Bolt/Figma Make) — [EPAM](https://www.epam.com/insights/ai/blogs/best-vibe-coding-tools-v0-lovable-bolt-replit-and-figma-make)

_Compliance & process_
- EU AI Act Digital Omnibus, deferred high-risk dates — [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)
- EDPB Opinion 28/2024 on AI & personal data — [explainer](https://measuredcollective.com/edpb-ai-models-personal-data-gdpr-guidance/)
- RICE framework — [Railsware](https://railsware.com/blog/rice-framework/)
- ICE framework / Sean Ellis — [ProductLift](https://www.productlift.dev/blog/prioritizing-with-ice-model/)

_Caveats: (1) Several citations are reputable secondary summaries; for a formal filing or legal
sign-off, confirm the primary papers (Dunlosky et al. 2013; Roediger & Karpicke 2006; Swain 1985;
Kestin et al. 2025) and have a DPO review the DPIA. (2) Model names and prices reflect the June 2026
landscape and change frequently, re-check provider pricing pages before committing. (3) The Speak
~$1B valuation and exact model prices are as reported by industry sources, not company filings._
