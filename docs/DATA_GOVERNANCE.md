# Data Governance & Content Provenance

_Status: **v0.2 draft (2026-06-15)**. This roadmap is intentionally provisional. The specific
certification claims (which standard, which body, cost, timeline, and our EU AI Act risk class) are
estimates and MUST be validated by the certification deep-research pass (backlog #19) before we act
on them or quote them externally. Update this doc once that research lands._

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

CC-BY and CC-BY-SA require visible credit. The plan is an **auto-generated "Sources & Licenses"
page** in the app, built from the `attribution_required` / `attribution_text` fields in the register,
so compliance is both real and demonstrable. Because the plan leans on **Tatoeba (CC-BY)** for example
sentences and cites Wiktionary / DWDS as references, this page carries real attribution rather than
being a formality. The mechanism must exist before we ingest any externally licensed content.

## Automated controls

- **Already live (2026-06-14):** `pnpm lint:content` + the `validate.yml` CI gate validate structural
  integrity (duplicate ids, broken dialogue branches, missing fields, cross-references, em dashes).
  See `CLAUDE.md`.
- **Planned (Phase 1):** extend the same linter so every `content_id` in the data files **must** have
  a provenance row whose `license` is on the allowlist, or the build fails. This turns "we only use
  commercial-safe licenses" from a promise into a machine-enforced, auditor-verifiable fact. It also
  flags any content id with no register row, and any register row for a non-existent id.

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

**EU AI Act risk class (to confirm in deep research).** Genauly is currently a learning aid that
gives AI feedback on writing and pronunciation. It does not, today, make admissions decisions or
formally grade outcomes that determine access to education. That likely places it below the
"high-risk" education category in Annex III, but the line is genuinely uncertain. We will **design to
the stricter (high-risk) data-governance standard regardless**, so a later classification change does
not force a rebuild.

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
external body for an ISO 42001 readiness assessment or a SOC 2 / ISAE 3000 engagement, and pursue the
certificate. This is the expensive step (an estimate, to be confirmed: several months and tens of
thousands of euros). Do not start it speculatively.

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

- **v0.2 (2026-06-15):** founder set the content strategy to **traceability over ownership**. Dropped
  the "written in-house, so we own it" framing; added the facts-vs-creative-text distinction, the
  approved open-source table (Tatoeba CC-BY, Wiktionary / DWDS as references), a required `reference`
  field on the register, and the AI-drafting policy (verify-and-cite, or discard). Existing content is
  re-verified and provenance-tagged, not rebuilt from scratch.
- **v0.1 (2026-06-14):** initial roadmap drafted. Pending validation from the certification
  deep-research pass (backlog #19).
