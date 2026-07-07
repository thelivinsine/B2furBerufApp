# Data Governance & Content Provenance

_Companion doc: **`docs/strategy/DATA_STRATEGY.md`** (2026-07-07) is the top-level data strategy. This
doc covers the **legal / licensing / certification** layer (is the content clean, who wrote it); the
strategy doc covers the **accuracy verification** layer (is the German actually correct, and how do we
verify it without a native speaker, via the automated verification ladder). Read them together._

_Status: **v0.5 (2026-07-03)**. The certification deep-research pass (backlog #19) is now done:
see **`docs/strategy/CERTIFICATION_RESEARCH.md`** for the cited findings. This doc's assumptions held; the
refinements from the research are folded in below and flagged "(research-validated 2026-06-15)". The
research is desk research, not legal advice: the EU AI Act risk classification still needs a lawyer's
sign-off (backlog #15) before we rely on it externally._

_v0.2 change (founder decision, 2026-06-15): the content strategy is **traceability over ownership**.
We do not lean on a blanket "we wrote it in-house, so we own it." Every item must trace to an
authoritative reference or a commercial-safe source. AI-assisted drafting is only a first step that
must then be verified and cited. Existing content is re-verified and provenance-tagged, not discarded._

This document describes how Genauly sources, licenses, verifies, and records the content in its
learning library so that the process is **audit-ready**: an outside examiner (an investor's technical
due-diligence team, an enterprise or government buyer, or a certification body) can inspect it and
satisfy themselves that the data is high-quality and legally clean for commercial use.

It is the elaboration of backlog item #7 ("sourcing/audit infrastructure"), now with a certification
target attached.

## Why this exists (the four drivers)

The founder confirmed all four motivations apply, in roughly this order of rigor:

1. **Enterprise / government edtech sales.** Schools, universities, and public language programmes
   increasingly require compliance evidence (EU AI Act, ISO, SOC 2) before they buy. This is the
   strongest reason to build real, auditable controls rather than just good intentions.
2. **Legal risk and copyright safety.** We must never be exposed to a copyright claim over content,
   and we must meet the EU AI Act's data-governance obligations, which are law, not optional.
3. **Investor / fundraising credibility.** A documented, professional data operation signals
   operational maturity in due diligence.
4. **Brand and trust marketing.** A recognised trust posture (and eventually a certificate) is a
   differentiator versus larger competitors.

## What "certification" actually means (important framing)

There is no single stamp that says "your data is clean." The relevant routes are different things,
and all of them certify our **process and management system**, not the data itself:

- **TÜV Rheinland / TÜV SÜD / TÜV NORD** certify against a **published standard**. The most relevant
  is **ISO/IEC 42001:2023**, an Artificial Intelligence Management System (think "ISO 9001 for AI").
  It certifies that we have documented, followed processes for data governance, sourcing, quality,
  and risk. They also certify **ISO/IEC 27001** (information security).
- **EY and the other Big Four** do **assurance**, not certification. They examine the controls we
  claim and issue a report attesting that those controls are designed and operating (for example a
  **SOC 2** report, or an **ISAE 3000** engagement). Enterprise customers often ask for these.
- **The EU AI Act** is the concrete near-term legal driver. Its **Article 10 (data governance)**
  requires that data used by an AI system be relevant, representative, error-checked, and carry
  **documented provenance**. Building for Article 10 gets us most of the way to ISO 42001.

The practical takeaway: **the certificate is downstream.** What we build now is the *system*. The
external examination of that system is a later, paid step.

**Research-validated (2026-06-15):** ISO is a *certificate* from an accredited body; SOC 2 / ISAE 3000
is an auditor's *report* (EY and the Big Four do this side, not ISO). **SOC 2 is US-centric; European
buyers ask for ISO 27001.** ISO 42001 is the AI-specific standard and builds on top of ISO 27001. So
when we do certify, the sequence is **ISO 27001 first, then ISO 42001 on top** (reuses the same
management system), with **TÜV NORD / TÜV SÜD** as the likely body (both are live on ISO 42001; TÜV NORD
is among the first accredited). SOC 2 only if we later chase US enterprise. Budget roughly **$15K to
$60K per standard** and several months each. Full detail and sources in `CERTIFICATION_RESEARCH.md`.

## Scope

This governance applies to every item in the learning library (`src/data/*`): vocabulary,
collocations, grammar topics and drills, branching dialogues, exam sets, redemittel, themes, and
writing prompts. It does **not** cover user-generated data (that is handled by the privacy / GDPR
documentation) or the AI model providers (handled by the security and vendor documentation).

## Core principles

1. **Every data point is traceable to an authoritative reference.** Nothing is "just made up." Each
   item records either the external source it came from or, for content we write ourselves, the free
   authoritative reference it was verified against (Wiktionary, DWDS, Tatoeba). AI-assisted drafting
   is allowed only as a first step. An unverifiable, uncited item does not stay in the library.
2. **Commercial-safe by construction.** Only an approved allowlist of licenses is permitted, and a
   machine checks this so it cannot be bypassed by oversight.
3. **Four eyes.** The person who adds content is not the person who approves it.
4. **Immutable trail.** Every change is recorded with author, reviewer, and date (git history plus
   the provenance register), so the history is reconstructable.
5. **Evidence at acquisition time.** We snapshot a source's license as it was the day we used it,
   because sources change their terms.

## What counts as "traceable" (facts vs. creative content)

Traceability means different things for different content, and the distinction is also what keeps us
copyright-clean:

- **Facts are not copyrightable.** A German word, its article (der/die/das), and its plural are facts.
  Nobody owns "der Engpass." We can use any word, as long as we verify it against a free authoritative
  reference (**Wiktionary**, **DWDS**) rather than copying somebody's curated *list*. A specific
  published word list (Goethe Wortliste, telc, Klett) can carry compilation / EU database rights in
  its selection and arrangement, so we never copy a protected list wholesale. We verify individual
  entries against open references instead.
- **Creative text is where licensing bites.** Example sentences, dialogues, and grammar explanations
  are authored expression. For these we either source from a commercial-safe corpus, or author and
  cite the reference we checked against.

**Approved open sources (commercial-safe):**

| Source | Use | License / basis |
|---|---|---|
| **Tatoeba** | Example sentences (the workhorse) | CC-BY 2.0 (credit required) |
| **Wiktionary** | Reference for word facts: gender, plural, meaning | CC-BY-SA 4.0 (we cite facts, which are not copyrightable, rather than copying its prose) |
| **DWDS** | Reference for usage and frequency | Reference only (cite; do not copy protected example text) |
| **Public-domain texts** (e.g. Project Gutenberg) | Reading / source passages | Public domain |

**Sources we do NOT use** (copyrighted, on the avoid list): Goethe Wortlisten, telc materials, Klett /
Routledge textbooks, most Deutsche Welle assets. See the "Sources to avoid" table in
`PROJECT_STATUS.md`.

**On AI-assisted drafting (important).** AI-generated text carries no third-party copyright (there is
no rights holder to infringe), so it is legally safe to ship. But "an assistant wrote it" is a weak
provenance answer for an auditor, and unverified AI text risks accuracy errors. So AI drafting is a
*first step only*: every AI-drafted item must then be verified against one of the references above and
have that reference recorded, or be rewritten or discarded. We do not claim a blanket `OWNED`.

## The content provenance register

Today, content lives inline in TypeScript files with no provenance metadata. The plan is a separate,
structured **provenance register** keyed by content id, kept as a reviewable file in the repo
(CSV or a typed data file), so it is auditable independently of the code. Every content id must have
exactly one register row.

Proposed fields per item:

| Field | Meaning |
|---|---|
| `content_id` | Matches the `id` in the data files (e.g. `v_engpass`). |
| `content_type` | vocabulary / collocation / grammar_drill / dialogue / exam_set / redemittel. |
| `label` | Human-readable headword or summary, for reviewers. |
| `origin` | `sourced` (taken from an external source), `adapted` (remixed from a source), or `authored` (written by us, AI-assisted then verified). |
| `source_name` | The source, if any (e.g. "Tatoeba", "Wiktionary"). Blank for `authored`. |
| `source_url` | Direct link to the source item. |
| `reference` | Authoritative reference the item was verified against (Wiktionary / DWDS / Tatoeba URL). **Required for `authored` and `adapted`**, so even our own writing is traceable, not "just made up." |
| `license` | SPDX identifier (see license policy). For `authored`, `OWNED`. |
| `license_url` | Link to the license text. |
| `license_snapshot` | Path to archived evidence of the license at acquisition time. |
| `acquired_date` | When we obtained or wrote it. |
| `attribution_required` | Whether the license requires credit (true for CC-BY / CC-BY-SA). |
| `attribution_text` | The exact credit string to display, if required. |
| `added_by` | Who added it. |
| `verified_by` | Who reviewed and approved it (must differ from `added_by`). |
| `verified_date` | When it was approved. |
| `review_status` | `draft` / `verified` / `published` / `retired`. |
| `notes` | Anything an auditor should know (e.g. "translation adapted from X"). |

Note on existing content (honest accounting): much of today's library was **AI-assisted drafting**,
not sourced from an external corpus. That is legally safe to ship (AI text has no rights holder), but
"an assistant wrote it" is not a strong provenance answer on its own. So the policy is **not** to
claim a blanket `OWNED`. Instead we back-fill a verifying `reference` for each item (the word checked
against Wiktionary / DWDS, the example sentence sourced from or matched against Tatoeba), tag its true
`origin`, and rewrite or discard the small tail of items that cannot be verified. **Traceable beats
"owned."**

## License policy (commercial-safe by construction)

We use **SPDX license identifiers** so licenses are machine-checkable. The allowlist:

**Permitted (commercial-safe):**
- `OWNED` (authored in-house; we hold the rights)
- `CC0-1.0` (public domain dedication, no conditions)
- `CC-BY-4.0` (and 2.0 / 3.0 / 2.0-FR variants; free for commercial use, must credit)
- `CC-BY-SA-4.0` (free for commercial use, must credit, **share-alike applies**, see trap below)
- `Public-Domain` (e.g. expired copyright, Project Gutenberg texts)

**Forbidden (block monetization, rejected at the gate):**
- Anything `-NC-` (non-commercial), e.g. `CC-BY-NC-4.0`
- Anything `-ND-` (no derivatives), e.g. `CC-BY-ND-4.0`
- All-rights-reserved / unknown / unspecified
- Copyrighted commercial sources (Goethe Wortlisten, Routledge, Klett textbooks, most Deutsche Welle
  assets). See the "Sources to avoid" table in `PROJECT_STATUS.md`.

**The CC-BY-SA "share-alike" trap (a real decision).** CC-BY-SA is viral: if we **adapt** CC-BY-SA
content, our adapted version must be released under the same open license. That can be awkward for a
paid product. Policy: allow CC-BY-SA only for content we keep clearly separable and substantially
verbatim. For anything we remix or adapt, prefer `OWNED`, `CC0-1.0`, or `CC-BY-4.0`. The `origin`
field (`authored` vs `adapted`) is what lets us enforce this distinction.

## Roles and the four-eyes workflow

- **Author / sourcer.** Adds content plus its full provenance row, with `review_status: draft`.
- **Verifier / approver.** A different person who checks (a) the license is permitted and correctly
  recorded, (b) the German is accurate and B2-appropriate, and (c) attribution is captured. On
  approval, sets `verified_by`, `verified_date`, and `review_status: verified`.
- **Publisher.** Merges to `main` (which deploys). The merge is the immutable record.

Until the team grows, the founder is the verifier of record for AI-assisted contributions. The
separation is still meaningful: the AI/assistant authors, the founder approves.

## Source register and evidence snapshots

A master **source register** lists every external source we draw from, once: its name, license,
attribution requirement, scope of permitted use, and a link to an **archived snapshot** of the
license page as it was when we first used it. Auditors sample-test content items back to this
register. Snapshots protect us if a source later changes its terms.

## Attribution surfacing

CC-BY and CC-BY-SA require visible credit. The **auto-generated "Sources & Licenses" page** lives at
**`/sources`** (`src/features/legal/Sources.tsx`, shipped 2026-06-23), built directly from the
provenance register so it stays in sync automatically. It shows the traceability approach, the upstream
references we rely on (Wiktionary, DWDS, Wikipedia, CEFR) with their licences, the licence breakdown of
our own content, and the full itemised list of every content id with a link to its source (grouped by
type, collapsible). It already renders any `attribution_required` / `attribution_text` rows, so the
moment we ingest CC-BY content (e.g. **Tatoeba** example sentences) the credit surfaces automatically.
The page is linked from Settings and the landing footer. The mechanism now exists ahead of ingesting
any externally licensed content, as required.

## Automated controls

- **Already live (2026-06-14):** `pnpm lint:content` + the `validate.yml` CI gate validate structural
  integrity (duplicate ids, broken dialogue branches, missing fields, cross-references, em dashes).
  See `CLAUDE.md`.
- **Live (Phase 1, 2026-06-15):** the linter now also enforces provenance integrity: every
  `content_id` **must** have exactly one register row whose `license` is on the allowlist, or the
  build fails; it errors on a row for a non-existent id and warns on an authored/adapted row with no
  reference. This turns "we only use commercial-safe licenses" from a promise into a machine-enforced,
  auditor-verifiable fact.
- **Reference URL checker (`pnpm check:refs`, added 2026-06-23):** an on-demand audit that fetches
  every `reference` URL and reports dead links, wrong Wiktionary headwords (404), missing Wikipedia
  articles, and unknown DWDS entries. It runs gently (low concurrency, honours `Retry-After`) and
  **separates hard failures (a genuine 404 / dead link) from "could not verify" results** (HTTP 429
  rate-limiting or 403 bot-blocks, e.g. the Council of Europe site): only hard failures fail the run, so
  transient rate-limits do not cry wolf. The DWDS corpus-search and CEFR links are treated as
  not-status-checkable. It is **not a PR gate** (external checks are flaky/slow); it runs from the
  script or the manual `check-refs.yml` GitHub Action (Actions tab → "Check provenance references" →
  Run). The **first two live runs (2026-06-23) found 143 dead Wiktionary references** (B2-Beruf
  compound nouns with no Wiktionary entry, reflexive/particle verbs, a few headword bugs); these were
  re-pointed to DWDS corpus search via `scripts/fix-provenance-refs.mjs`. A live link confirms the page
  exists, **not** that it is the correct sense, so this attests to one machine-checkable half of
  verification; content accuracy still needs human sign-off.
- **Reference back-fill (maintained; register now 1,111 rows, last reconciled 2026-07-03):** every one
  of the **1,111** rows carries a non-empty
  `reference`, so the back-fill warning queue is empty. (The register was 809 rows at the 2026-06-20
  back-fill; it has since grown with the s43+ content and the s47 Can-Do bank, each new item added with
  its reference at authoring time.) Coverage by type: vocabulary → Wiktionary
  headword; collocations → DWDS noun entry; grammar topics/drills → the German Wikipedia article for
  the topic (grammar rules are facts, cited not copied); redemittel → DWDS corpus search for the
  phrase; dialogues / exam sets / writing prompts → the Council of Europe CEFR B2 descriptors they
  are designed against. The bootstrap/back-fill scripts (`scripts/generate-provenance-stubs.mjs`,
  `scripts/backfill-provenance-refs.mjs`) document exactly how each reference was derived. **These
  references are machine-assigned starting points, not human-verified:** 1,086 rows stay
  `review_status: "draft"`; only the 25 Can-Do statements are `"verified"` (founder-reviewed 2026-07-02).
  Flipping the remaining draft rows → verified is the still-open four-eyes step (Phase 2).

## Documented procedures (the "management system")

ISO 42001 and SOC 2 fundamentally certify that documented procedures exist and are followed. The
procedures to write (short, practical SOPs, drafted in a later phase):
- Content sourcing and license-vetting checklist.
- The verification / approval workflow (the four-eyes process above).
- Takedown / dispute handling (what we do if someone challenges a piece of content).
- Periodic review cadence and internal audit.
- Roles and responsibilities (RACI).

## Risk register (starter)

| Risk | Mitigation |
|---|---|
| Copyright infringement from a mis-licensed source | Allowlist + machine gate + four-eyes review + evidence snapshots. |
| A source changes its license after we used content | License snapshot at acquisition time. |
| Inaccurate or non-B2 German content | Each item carries a `reference` (Wiktionary / DWDS / Tatoeba) it was verified against, plus verifier sign-off (the pedagogical review half of backlog #4, still open). |
| Unverifiable AI-drafted content slips through | `reference` required for `authored`/`adapted` items; linter flags any without one; rewrite or discard the tail. |
| Share-alike obligation triggered unintentionally | `origin` field policy; prefer OWNED/CC0/CC-BY for adapted content. |
| Provenance drift (content without a register row) | Linter gate requiring a row per content id. |
| PII / bias in content | Content is curated and reviewed, not scraped at scale; documented in review. |

## Standards mapping (provisional, validate via backlog #19)

| Our control | ISO/IEC 42001 | EU AI Act | SOC 2 / ISAE 3000 |
|---|---|---|---|
| Provenance register | Data governance | Art. 10 (provenance, quality) | Documented control |
| License allowlist + gate | Data governance / compliance | Art. 10 + IP compliance | Automated control evidence |
| Four-eyes verification | Operational controls | Art. 10 (error-checking) | Segregation of duties |
| Immutable git trail | Documented information | Record-keeping (Art. 12) | Audit trail |
| SOPs + risk register | Core management system | Risk management (Art. 9) | Control environment |
| Internal audit cadence | Performance evaluation | Post-market monitoring | Monitoring |

**EU AI Act risk class (research-validated 2026-06-15, lawyer sign-off still pending).** Genauly gives
AI feedback on writing and pronunciation. It does not make admissions decisions or assign formal grades
that gate access to education. The research concludes we are **most likely NOT high-risk**: Annex III(3)
is tied to educational *institutions* and consequential outcomes, formative practice feedback is
plausibly outside it, and the **Article 6(3) carve-out** (narrow/preparatory task, no material influence
on decisions) likely applies. **Two things would flip us to high-risk, and are the live uncertainties:**
1. **Profiling.** A system that profiles natural persons is *always* high-risk. Tracking a learner's
   traits/progress to adapt content could count as profiling. Assess this before relying on the carve-out.
2. **Institutional deployment / gating.** If the app is used inside a course/institution or its scores
   gate progression or certification, it slides toward Annex III(3)(b).

If we claim the carve-out, the Act (Art. 6(4)) requires a **documented risk assessment on file before
going to market**. We still **design to the stricter (high-risk) data-governance standard regardless**,
so a later reclassification does not force a rebuild. See `CERTIFICATION_RESEARCH.md` for sources.

**Near-term legal action: Article 50 transparency (effective 2 Aug 2026).** Regardless of risk class,
if AI interacts directly with users we must tell them they are interacting with an AI, and generative
AI output should be marked as AI-generated. This is a concrete obligation that plausibly binds us and is
a small UI/copy change. **Tracked as an action below and in `CERTIFICATION_RESEARCH.md`.** (A pending
"Digital Omnibus" proposal may defer the *high-risk* dates to Dec 2027, but it is not yet law, and it
does not obviously move the Art. 50 date.)

## Phased roadmap

**Phase 0 (now, done):** this document; the structural content linter + CI gate; the license
allowlist defined; the certification research added to the backlog.

**Phase 1 (cheap, mostly mechanical, recommended next):** create the provenance register; back-fill
it for existing content by attaching a verifying `reference` to each item (word vs Wiktionary / DWDS,
example sentence vs Tatoeba), tagging true `origin`, and rewriting or discarding the unverifiable
tail; extend the linter to require both an allowlisted `license` **and** a `reference`-or-`source`
per content id (the machine gate).

**Phase 2:** formalise the four-eyes workflow; build the source register + evidence-snapshot habit;
ship the auto-generated "Sources & Licenses" page.

**Phase 3:** write the SOPs and the full risk register; start an internal audit cadence (sample N
items per quarter, re-verify license + accuracy, retain evidence).

**Phase 4 (only when revenue or a concrete customer / investor demand justifies it):** engage an
external body. **Sequence (research-validated): ISO 27001 first** (what EU buyers ask for), then
**ISO 42001** on top (AI-specific, reuses the 27001 system); **TÜV NORD / TÜV SÜD** are the likely
bodies. SOC 2 / ISAE 3000 (via a CPA firm such as A-LIGN, Schellman, or a Big Four) only for US
enterprise. Budget roughly **$15K to $60K per standard** and several months each. Do not start it
speculatively.

**Near-term legal actions (not certification, but cheap and arguably required):**
- **Article 50 transparency — SHIPPED (2026-06-20), ahead of the 2 Aug 2026 date.** The only
  generative-AI surface is the writing coach (speech is the Web Speech API, simulations are scripted
  dialogue trees). It already marked its output as "KI-generierte Rückmeldung" in both the live result
  and the history. We added an explicit point-of-use disclosure on the writing editor: "Dein Text wird
  zur Auswertung an eine KI (Anthropic Claude) gesendet. Die Rückmeldung ist KI-generiert und kann
  Fehler enthalten," linking to the privacy page. Revisit if any new AI-interactive surface is added.
- **Write a documented Article 6(3) risk assessment** answering the profiling question (see EU AI Act
  section). Needed on file if we claim we are not high-risk.
- Consider cheap trust signals: the German **MISSION KI** low-risk-AI standard (built for SMEs), an
  **Art. 95 voluntary code of conduct** posture, the **Comenius EduMedia** edtech seal, and the free
  **Fraunhofer KI-Prüfkatalog** as an internal checklist. Detail in `CERTIFICATION_RESEARCH.md`.

## CTO recommendation

Build Phases 1 to 3 now, because they are cheap, largely mechanical, and directly satisfy EU AI Act
data-governance law. They make us genuinely "audit-ready," so the day a buyer or investor asks (or we
choose to certify), we are most of the way there instead of starting from zero. **Defer the paid
certification (Phase 4) until there is revenue or a customer demanding it.** Paying for ISO 42001 or
SOC 2 today would be premature for a pre-revenue product and a poor use of money.

## Open decisions

- Register format: CSV (spreadsheet-friendly for non-technical review) versus a typed data file
  (machine-validatable). Leaning toward a typed file with a CSV export, to get both.
- Whether to permit CC-BY-SA at all, given the share-alike trap, or to exclude it entirely for
  simplicity.
- Who is the verifier of record as the team grows.

## Change log

- **v0.5 (2026-07-03):** docs-audit reconciliation. The provenance register has grown from 809 rows
  (the 2026-06-20 back-fill snapshot) to **1,111 rows** as content expanded (s43 Pflege/office packs,
  the s47 Can-Do bank, and other additions). Updated the current-state counts throughout: 1,111 rows,
  all still carrying a non-empty `reference` (back-fill queue empty), split 1,086 `draft` / 25
  `verified` (the founder-approved Can-Do statements). No policy change; numbers only.
- **v0.4 (2026-06-20):** two stream items shipped. (1) **Reference back-fill complete** — all 809
  register rows now carry a non-empty `reference` (grammar → German Wikipedia, redemittel → DWDS
  corpus search, dialogues/exam sets/writing prompts → CEFR B2 descriptors), so the linter's
  back-fill warning queue is empty. Added `scripts/backfill-provenance-refs.mjs` to document the
  derivation. Rows stay `draft`; human verification (four-eyes) is the next open step. (2) **EU AI Act
  Article 50 transparency shipped** on the writing coach (explicit point-of-use AI disclosure plus the
  existing AI-generated output marking), ahead of the 2 Aug 2026 date.
- **v0.3 (2026-06-15):** certification deep-research pass (backlog #19) completed and folded in; see
  `CERTIFICATION_RESEARCH.md`. Key refinements: we are most likely **not high-risk** under the EU AI Act
  (with profiling + institutional-gating as the two flip risks); **Article 50 transparency** (by 2 Aug
  2026) is a concrete near-term action; certification sequence is **ISO 27001 then ISO 42001** via TÜV
  NORD/SÜD; cost estimates (~$15K to $60K/standard) and the "defer paid cert" call confirmed. Added cheap
  trust-signal options (MISSION KI, Art. 95 code, Comenius, Fraunhofer KI-Prüfkatalog).
- **v0.2 (2026-06-15):** founder set the content strategy to **traceability over ownership**. Dropped
  the "written in-house, so we own it" framing; added the facts-vs-creative-text distinction, the
  approved open-source table (Tatoeba CC-BY, Wiktionary / DWDS as references), a required `reference`
  field on the register, and the AI-drafting policy (verify-and-cite, or discard). Existing content is
  re-verified and provenance-tagged, not rebuilt from scratch.
- **v0.1 (2026-06-14):** initial roadmap drafted. Pending validation from the certification
  deep-research pass (backlog #19).
