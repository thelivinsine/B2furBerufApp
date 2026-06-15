# Certification & EU AI Act Research (backlog #19)

_Completed 2026-06-15. This is the cited research pass that validates the assumptions in
`DATA_GOVERNANCE.md`. It answers: which standard fits us, what it costs, our EU AI Act risk class, the
obligations that follow, and which trust schemes are worth pursuing. **Caveat:** this is desk research,
not legal advice. The EU AI Act classification in particular needs a lawyer's sign-off before we rely
on it or quote it externally (ties into backlog #15, the legal review)._

Method: five parallel web-research passes (standards comparison, cost/timeline, AI Act risk class, AI
Act obligations/timeline, edtech trust schemes), each cross-checking claims across independent sources.
Confidence is flagged per finding. Several EU primary pages (EUR-Lex, IAPP, some law firms) blocked the
fetcher with HTTP 403; article and annex wording was confirmed via mirrors that reproduce the Official
Journal text (artificialintelligenceact.eu, the EU AI Act Service Desk). Verify verbatim sub-clauses
against EUR-Lex before any legal reliance.

## 1. What each standard actually certifies, and which fits us

| Framework | What it is | Fit for us |
|---|---|---|
| **ISO/IEC 42001:2023** | A **certificate** for an AI Management System (AIMS): a process/governance system covering AI risk, bias, transparency, data use, monitoring. The only one built specifically for AI. | **The natural fit.** AI-specific, aligns with EU AI Act, and reuses an ISO 27001 system. |
| **ISO/IEC 27001** | A **certificate** for an Information Security Management System (ISMS). | **What EU buyers actually demand.** The de facto baseline in European procurement. |
| **SOC 2** | **Not a certificate.** A CPA firm's **assurance report** against the AICPA Trust Service Criteria. Type I = design at a point in time; Type II = operating effectiveness over 3 to 12 months. | **US-centric.** Only matters if we chase US enterprise customers. |
| **ISAE 3000** | The international assurance **standard** under which SOC-2-style reports are produced. "European SOC 2" is often an ISAE 3000 report. | Same role as SOC 2, EU framing. Defer with SOC 2. |

Key distinction (high confidence): **ISO = a certificate from an accredited body; SOC 2 / ISAE 3000 = an
auditor's opinion/report on your controls.** EY and the other Big Four do the SOC 2 / ISAE 3000 side, not
ISO certification.

Relationships (high confidence): ISO 42001 shares the Annex SL structure with ISO 27001 and builds on
top of it, so doing 27001 first reportedly saves several weeks on 42001. ISO 42001 supports EU AI Act
compliance but is **not** the same thing: the Act says *what*, ISO 42001 shows *how*.

Sources: iso.org/standard/42001; secureframe.com/blog/soc-2-vs-iso-27001;
isms.online/iso-27001/iso-27001-certification-vs-soc-2-attestation; crowe.com guide to ISO 27001 / ISAE
3000 / SOC; trustcloud.ai (EU prefers ISO 27001); sprinto.com/blog/iso-42001; vanta.com and isaca.org on
ISO 42001 + EU AI Act.

## 2. Cost and timeline for a small company (<20 people)

Wide variance, vendor estimates not firm quotes, and most exclude internal staff time (often the biggest
hidden cost). ISO 42001 numbers are the least firm because the standard is new (2023).

| Route | All-in cost (small co.) | Timeline |
|---|---|---|
| **ISO/IEC 27001** | ~$14K to $60K first year (tiny SaaS from ~$14K to $16K); audit fee alone $5K to $10K | ~3 to 6 months |
| **ISO/IEC 42001** | ~$15K to $40K (audit minor; implementation 2 to 3x the audit); UK floor ~£8K to £10K | ~4 to 9 months |
| **SOC 2 Type II** | ~$15K to $40K all-in for a startup (premium firms quote higher) | ~6 to 12 months incl. the 3 to 12 month observation window |

Confidence: medium to high on 27001 and SOC 2 (cross-checked); medium on 42001 (few public small-company
data points). Sources: sprinto.com, acato.co.uk/iso-42001-cost, zipsec.com, soc2auditors.org, vanta.com,
strongdm.com, drata.com.

**Bodies.** ISO certs need an **accredited certification body**: TÜV SÜD, TÜV NORD, TÜV Rheinland, DEKRA,
BSI, DNV, SGS, Bureau Veritas, A-LIGN, Schellman. SOC 2 needs a **licensed CPA firm** (A-LIGN, Schellman,
the Big Four); the TÜVs do **not** issue SOC 2.

**ISO 42001 at the TÜVs (our specific question):** all three German TÜVs are live on it. **TÜV NORD** is
among the first bodies worldwide accredited for ISO 42001 (UKAS and RvA accreditation); TÜV SÜD and TÜV
Rheinland also offer it. Could not confirm DAkkS (German) accreditation specifically. Sources:
tuev-nord-group.com, tuvsud.com, certification.tuv.com.

## 3. EU AI Act risk classification (the important one)

**Annex III(3) "education and vocational training"** lists four high-risk uses, each tied to
**"educational and vocational training institutions"** (high confidence on wording):
- (a) determine **access or admission** or assign people to institutions;
- (b) **evaluate learning outcomes**, including when used to **steer the learning process**;
- (c) assess the **appropriate level of education** a person will receive/access;
- (d) **monitor and detect prohibited behaviour** of students during tests.

**Our likely position: NOT high-risk** (medium confidence, needs counsel):
- A standalone consumer practice app is not an "institution," does not gate access (a), does not assign
  institutional grades (b), does not set education level (c), and does not police exam-room conduct (d).
- **Recital 56** says these are high-risk because they "may determine the educational and professional
  course of a person's life." Formative practice feedback that drives no consequential outcome lacks that.
- Draft Commission guidelines (Feb 2026, **non-binding**) reportedly distinguish **summative** assessment
  tied to final/consequential decisions (high-risk) from **formative** practice/feedback tools (not).
- **Article 6(3) derogation:** even if Annex III applied, a system is not high-risk if it does not pose a
  significant risk and only performs a **narrow procedural** or **preparatory** task and does not
  materially influence decision-making. Practice feedback plausibly fits.

**Two caveats that would flip us to high-risk** (the live uncertainties):
1. **Profiling.** Art. 6(3) says a system is *always* high-risk if it performs **profiling** of natural
   persons. Tracking a learner's traits/progress to adapt content could arguably be profiling (GDPR Art.
   4(4)). This is the sharpest risk and must be assessed before relying on the carve-out.
2. **Institutional deployment / gating.** If the app is deployed **inside a course/institution** or its
   scores **gate progression or certification**, it slides toward Annex III(3)(b) high-risk.

If we claim the Art. 6(3) carve-out, **Art. 6(4) requires us to document that assessment before going to
market and register the system** (Art. 49(2)). Sources: artificialintelligenceact.eu/annex/3, /recital/56,
/article/6; ai-act-service-desk.ec.europa.eu; modulos.ai summary of the draft guidelines;
digital-strategy.ec.europa.eu.

## 4. Obligations that follow

**If limited/minimal-risk (our likely case): Article 50 transparency is the real near-term duty**
(high confidence), effective **2 Aug 2026**:
- If AI **interacts directly** with users (a chatbot/feedback agent), users must be **informed they are
  interacting with an AI**, unless obvious.
- **Generative** outputs (synthetic text/audio) must be **marked machine-readable and detectable as
  AI-generated.** (The deepfake/public-interest-text disclosure duties in 50(4) are unlikely to bite a
  language app, but the "you're talking to an AI" and "AI-generated output" duties plausibly do.)

**If high-risk (the stricter design target):** Art. 10 (data governance: relevant, representative,
error-checked data, documented **provenance**, bias examination), Art. 9 (risk management), Art. 11 +
Annex IV (technical documentation), Art. 12 (automatic logging), Art. 13 (transparency to deployers),
Art. 14 (human oversight), Art. 15 (accuracy/robustness/cybersecurity). Our provenance-register work maps
directly onto Art. 10. Sources: securiti.ai, aiact.algolia.com, artificialintelligenceact.eu articles
9 to 15 and 50, gtlaw.com.

## 5. Timeline (as the law stands today)

- 1 Aug 2024: in force. 2 Feb 2025: prohibited practices + AI literacy. 2 Aug 2025: GPAI + governance +
  penalties. **2 Aug 2026: general application, incl. Annex III high-risk obligations AND Article 50
  transparency.** 2 Aug 2027: Annex I embedded-product high-risk.
- **Proposal, NOT yet law (flag):** the "Digital Omnibus on AI" (published 19 Nov 2025, political
  agreement 7 May 2026) would defer Annex III high-risk to **2 Dec 2027**. It still needs Parliament +
  Council adoption + OJ publication. **Until then the 2 Aug 2026 dates stand.** Penalties up to €35M / 7%
  of turnover. Sources: legiscope.com, Orrick, DLA Piper, Gibson Dunn.

## 6. Edtech / AI trust schemes worth knowing (Germany/EU)

- **MISSION KI (Germany) — most relevant.** Federally funded voluntary quality standard + testing portal,
  explicitly for **start-ups/SMEs with low-risk AI**. Built by acatech, TÜV AI.Lab, VDE, Fraunhofer IAIS,
  PwC. New/maturing, school-buyer recognition unproven, pricing not public. (mission-ki.de)
- **EU AI Act Art. 95 voluntary code of conduct.** Low-cost self-commitment to transparency/oversight/
  ethics for non-high-risk providers. A cheap credibility signal. (artificialintelligenceact.eu/article/95)
- **Comenius EduMedia seal.** German pedagogy-focused seal for digital learning media; recognised by
  educators, cheap relative to AI audits. Does not certify GDPR/AI safety. (comenius-award.de)
- **Fraunhofer IAIS AI Assessment Catalog (KI-Prüfkatalog).** Free; use as an internal self-assessment
  checklist regardless. (iais.fraunhofer.de)
- **Defer as heavyweight/vanity for now:** BSI **AIC4**, VDE/AIQ **AI Trust Label** / IEEE CertifAIEd,
  EuroPriSe / Europrivacy GDPR seals. Better once there is revenue or a tender that demands them.

## Recommendation (what to do now vs defer)

**Now (cheap, and required regardless of risk class):**
1. **Implement Article 50 transparency** before 2 Aug 2026: a clear "this feedback is AI-generated" /
   "you are interacting with an AI" disclosure wherever the app gives AI feedback. This is the one
   concrete legal obligation that plausibly binds us, and it is a small UI/copy change. **New action.**
2. **Do a documented Article 6(3) risk assessment** (are we high-risk?), explicitly answering the
   profiling question. If we claim the carve-out, the Act requires the assessment to exist on file.
3. **Continue the data-governance Phase 1** (provenance register + license gate). It maps onto Art. 10
   and is the right foundation no matter the classification.
4. Adopt the **Fraunhofer KI-Prüfkatalog** as an internal checklist; consider an **Art. 95 voluntary
   code** posture and the **MISSION KI** standard as low-cost trust signals.

**Defer until revenue or a concrete buyer/tender demands it:**
- Paid certification. When we do go: **ISO 27001 first** (what EU buyers ask for), then **ISO 42001** on
  top (AI-specific, reuses the 27001 system), with **TÜV NORD / TÜV SÜD** as the likely body. SOC 2 /
  ISAE 3000 only for US enterprise. Budget roughly **$15K to $60K per standard** and several months each.

**Net:** the v0.1/v0.2 governance assumptions hold. The refinements are: (1) we are **probably not
high-risk**, but Article 50 transparency is a real 2026 obligation we should ship; (2) profiling and
institutional-gating are the two things that would flip us to high-risk; (3) when certifying, sequence
27001 then 42001; (4) cheap edtech/AI trust signals (MISSION KI, Comenius, Art. 95) exist and are worth a
look. None of this changes the "defer paid certification" call.

## Open items for the lawyer pass (backlog #15)
- Confirm the EU AI Act risk classification, especially the **profiling** question and whether any
  school/B2B deployment would pull us into Annex III(3)(b).
- Confirm the exact scope of Article 50 disclosure wording for our feedback features.
- Confirm whether the Digital Omnibus deferral has been adopted by the time we act.
