# EU AI Act — Risk Classification & Article 6(3) Assessment (Genauly)

_Version 1.0 · 2026-07-07 · Internal record._

**Status: internal working assessment, pending qualified legal sign-off (backlog #15).** This document
exists to satisfy the Article 6(4) expectation that a provider claiming the Article 6(3) derogation
**documents that assessment before placing the system on the market**. It is a good-faith self-assessment
by a non-lawyer team, grounded in the research in `docs/strategy/CERTIFICATION_RESEARCH.md`. It is not
legal advice and must be reviewed and confirmed by counsel before it is relied on externally.

## 1. System description

- **Product:** Genauly, a consumer web app (React SPA on GitHub Pages) that helps adult learners practise
  German for real-life B1–B2 situations and, as one pillar, prepare for the telc Deutsch B2 Beruf and
  Goethe-Zertifikat B2 exams.
- **The AI component in scope.** One AI feature ships today: the **AI Schreibcoach** (`/writing`). A user
  submits a short practice text; a hosted LanguageTool pass categorises errors, and **only when a deeper
  read helps**, the text goes to Anthropic Claude (server-side Supabase Edge Function) to turn the findings
  into one prioritised improvement tip. On rare technical failure the request may fall back to Google
  Gemini or OpenAI. Text-to-speech and speech recognition use the browser's built-in Web Speech APIs (no
  third-party AI model, no server round-trip).
- **What the AI does NOT do.** It returns **formative** practice feedback only. It issues no grade of
  record, no certificate, no pass/fail, and gates nothing. It does not decide access to any course,
  institution, job, or exam. It is a standalone consumer tool, not deployed inside any educational or
  vocational-training institution.

## 2. Provider role and placement

Genauly is the **provider** (Art. 3(3)) of the Schreibcoach feature as integrated into the app. The
underlying general-purpose models (Claude, Gemini, GPT) are provided by Anthropic, Google, and OpenAI
respectively; we are a **downstream deployer/integrator** of those GPAI systems via their APIs.

## 3. Risk classification

### 3.1 Prohibited practices (Art. 5) — not applicable
The Schreibcoach performs none of the Art. 5 prohibited practices (no social scoring, no manipulative or
exploitative techniques, no biometric categorisation, no emotion recognition in work/education contexts,
no untargeted scraping). **Conclusion: not prohibited.**

### 3.2 High-risk under Annex III(3) — assessed, likely NOT high-risk
Annex III(3) ("education and vocational training") lists four high-risk uses, each **tied to educational
and vocational-training institutions**:
- (a) determine **access or admission** or assign people to institutions;
- (b) **evaluate learning outcomes**, including when used to **steer the learning process**;
- (c) assess the **appropriate level of education** a person will receive or can access;
- (d) **monitor and detect prohibited behaviour** of students during tests.

Applied to Genauly:

| Annex III(3) trigger | Does Genauly do this? | Basis |
|---|---|---|
| (a) access/admission | **No** | No admissions decision; anyone can use the app freely. |
| (b) evaluate learning outcomes / steer learning | **No (formative only)** | Feedback is a practice tip with no outcome of record; it steers nothing consequential. |
| (c) set appropriate education level | **No** | The learner self-selects level; the app makes no binding placement. |
| (d) monitor prohibited behaviour in tests | **No** | No proctoring, no exam-room surveillance. |

Recital 56 explains these uses are high-risk because they "may determine the educational and professional
course of a person's life." Genauly's formative feedback drives **no consequential outcome**, so the
rationale does not attach. Draft (non-binding) Commission guidance reportedly distinguishes **summative**
assessment tied to final decisions (high-risk) from **formative** practice tools (not). **Preliminary
conclusion: Annex III(3) is not triggered.**

### 3.3 Article 6(3) derogation — relied on in the alternative
Even if a reviewer read Annex III(3) more broadly, Art. 6(3) provides that an Annex III system is **not**
high-risk where it does **not pose a significant risk of harm to health, safety or fundamental rights**,
including where it performs only a **narrow procedural task** or a task **preparatory** to a human
assessment, and does not **materially influence** the outcome of decision-making. A German-writing practice
tip that the learner may accept or ignore, with no decision attached, fits the preparatory/narrow-task
description and does not materially influence any decision.

**The decisive gate — profiling (Art. 6(3), final sentence).** The derogation is **unavailable** if the
system performs **profiling of natural persons** (GDPR Art. 4(4): automated evaluation of personal aspects,
in particular to analyse or predict a person's performance, behaviour, etc.). Our assessment:

- The app tracks per-item spaced-repetition state (FSRS), XP, streaks, and theme mastery to schedule
  reviews. This adaptation is **content sequencing driven by the learner's own answers**, held for the
  learner's own benefit, and is **not** used to evaluate, rank, predict, or make decisions **about** the
  person in a way that produces legal or similarly significant effects.
- The Schreibcoach itself is **stateless per submission**: it categorises the submitted text and returns
  one tip. It does not build or apply a cross-session profile of the writer.
- **Position:** we assess that the adaptive scheduling is personalisation/functionality, not profiling in
  the Art. 4(4) sense that Art. 6(3) targets. **Confidence: medium. This is the single most important point
  for counsel to confirm** before we rely on the derogation.

**Preliminary conclusion:** Genauly is **not high-risk**; it is a **limited/minimal-risk** AI system. Where
Annex III is argued to apply, we rely on the Art. 6(3) derogation (narrow/preparatory task, no material
influence, no profiling).

## 4. Conditions that would flip the classification (monitor these)

1. **Profiling creep.** If we add features that evaluate or predict a person's aptitude/behaviour to make
   decisions about them (e.g. an automated "you will/won't pass" verdict, adaptive gating that consequences
   attach to), re-run this assessment before shipping.
2. **Institutional deployment / gating.** If Genauly is ever deployed **inside a course or institution**,
   or its scores **gate progression, admission, or certification**, it slides toward Annex III(3)(b)
   high-risk. Any B2B/school channel must trigger a fresh classification.
3. **Summative assessment.** If the Schreibcoach output ever becomes a grade of record or a
   pass/fail/placement decision, it becomes summative and likely high-risk.

## 5. Obligations that follow from the "limited-risk" classification

- **Article 50 transparency (effective 2 Aug 2026) — IMPLEMENTED.**
  - _Interacting with an AI:_ the `/writing` surface states at the point of use that the text is sent to an
    AI (Anthropic Claude) for evaluation (`src/features/writing/WritingHub.tsx`).
  - _AI-generated output marked:_ feedback is labelled "KI-generierte Rückmeldung" and noted as possibly
    containing errors; the privacy policy has a dedicated "KI-Schreibfeedback: wohin dein Text geht"
    section in DE and EN (`src/features/legal/PrivacyPolicy.tsx`).
- **AI literacy (Art. 4, since 2 Feb 2025):** the team maintains basic AI-literacy awareness; user-facing
  copy explains in plain language what the AI does and its limits.
- **GPAI transparency:** we consume upstream GPAI via API; upstream Art. 53 obligations sit with the model
  providers. We keep the provider list current in the privacy policy.
- **Voluntary signals (optional, not obligations):** the Art. 95 voluntary code of conduct and MISSION KI
  are cheap credibility signals available if/when we want them (see `CERTIFICATION_RESEARCH.md` §6).

## 6. Data governance posture (maps to Art. 10, the high-risk standard we meet voluntarily)

Although we assess as not high-risk, the content pipeline already meets much of the Art. 10 data-governance
standard: a per-item **provenance register** (`src/data/provenance.ts`), a commercial-safe **license
allowlist** enforced in CI, a two-oracle **fact gate** (`verify:facts`), a LanguageTool **grammar sweep**
(`verify:grammar`), a **CEFR plausibility** tripwire, and a composed per-item **verification/trust tier**
surfaced on `/sources`. This is documented in `docs/strategy/DATA_STRATEGY.md` and
`docs/strategy/DATA_GOVERNANCE.md`.

## 7. Timeline and review triggers

- **2 Aug 2026:** Article 50 transparency + Annex III high-risk obligations apply (unless the "Digital
  Omnibus on AI" defers Annex III to 2 Dec 2027, which is proposed, not yet law). Our Art. 50 duties are
  already implemented.
- **Re-run this assessment when:** (a) counsel review completes (#15), (b) any new AI feature ships, (c) any
  profiling/gating/summative capability is added, (d) a B2B/institutional channel opens, or (e) the Act or
  its guidelines materially change.

## 8. Open items for counsel (#15)

1. Confirm the **profiling** determination in §3.3 (the decisive point for the Art. 6(3) carve-out).
2. Confirm we are **not** an Annex III(3) "institution" use and the formative/summative line as applied.
3. Advise on any **Art. 49(2) registration** step if the derogation is claimed formally.
4. Confirm the Art. 50 wording is sufficient and whether any machine-readable marking of AI output beyond
   the current on-screen labelling is expected for our case.

_Sources: `docs/strategy/CERTIFICATION_RESEARCH.md` (with primary citations to
artificialintelligenceact.eu Annex III / Recital 56 / Articles 6, 49, 50, 95; ec.europa.eu). This record is
maintained by the Genauly team; legal review is pending under backlog #15._
