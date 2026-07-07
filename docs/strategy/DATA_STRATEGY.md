# Data Strategy — source-verified, audit-ready, and automated

_Status: **v1.0 (2026-07-07)**. Author: session `app-data-strategy`. This is the top-level data
strategy for Genauly. It sits above two existing documents and does not repeat them:_

- _**`docs/strategy/DATA_GOVERNANCE.md`** — the legal / licensing / certification layer (provenance
  register, license allowlist, EU AI Act, ISO/SOC posture). Still current; this doc references it._
- _**`docs/strategy/CERTIFICATION_RESEARCH.md`** — the cited certification desk-research._

_The governance doc answers "is the content legally clean and who wrote it." This doc answers the
harder, still-open question: **"is the German actually correct, and how do we know that without a
native speaker checking every word by hand?"** It is desk strategy, not legal advice._

---

## 1. The problem, stated honestly

Genauly ships **1,195+ content items** (558 vocabulary, 432 collocations, 47 grammar drills,
dialogues, exam sets, redemittel, texts, missions). The register already proves each item is
**legally clean** (allowlisted license) and **has a reference URL**. But of those 1,195 rows,
**~1,170 are still `review_status: "draft"`**. Only the 25 Can-Do statements are `"verified"`.

The reason is a single hard constraint the founder has named directly:

> The founder is **not a native German speaker** and **cannot manually verify each word.**

Every piece of the current pipeline that needs a human to confirm the German is *correct, natural,
and genuinely B2* is stalled on a reviewer who does not exist. `check:refs` can confirm a Wiktionary
link is alive; it cannot confirm "der Engpass" is the right article, that an example sentence is
grammatical, that a translation is faithful, or that a drill is really B2 and not A2 or C1. The
governance doc says this in six different places ("content accuracy still needs human sign-off").

So the strategy is not "hire a reviewer and grind through 1,195 items." It is:

> **Replace the single native-speaker reviewer with an automated ensemble of independent
> authoritative sources and models, and shrink the irreducible human step to a rationed audit
> of only the items the machines disagree on.**

This is achievable because **most of what a reviewer would check is machine-checkable today**, and
the residue that genuinely needs judgment is small enough to buy cheaply.

### Scope: this applies to both existing and future content

The strategy runs on two fronts at once, and it must be both — fixing only one leaves the other as a
liability.

- **Existing content (the backlog): a one-time cleanup sweep.** The ~1,170 `draft` items were
  AI-drafted and never accuracy-verified. The ladder runs over all of them once: Phase A
  machine-verifies every existing word's facts, Phase B grammar-checks every existing sentence, Phase
  D's jury triages the remainder, and Phase E's rationed human review clears only the exceptions. This
  is how the backlog moves from "1,170 draft" to "machine-verified + human-audited." It is the urgent
  target.
- **Future content: born verified.** The same checks become **CI gates on every new item** (see §7),
  so the debt never re-accumulates. A new noun/verb whose article/plural/POS does not match Wiktextract
  *fails the build*; the item enters at tier `facts` automatically, and the scheduled jury and reviewer
  promote it from there. You never rebuild a backlog, because each future item is verified at the
  moment it is added.

**One caveat on the AI jury (Layer 4).** The deterministic layers (facts, grammar) apply identically to
old and new content. The jury, though, is only a *final* verdict once it is calibrated against the
golden set (§3, Layer 4). Until that calibration proves it matches a native speaker, the jury is a
**triage tool that routes existing content to human review**, not an auto-pass. So for the backlog it
accelerates the human; for future content, once calibrated, it promotes items on its own.

Which phases serve which front: the **backlog cleanup** is a single full pass of Phases A–E; **future
content** is Layers 0–2 gating merges continuously, Layers 3–4 running on a schedule, and Layer 5 as a
light quarterly cadence.

## 2. Three requirements, one design

The founder named three properties. They are not in tension; one pipeline delivers all three.

| Requirement | What it means here | How this strategy delivers it |
|---|---|---|
| **Source-verified** | Every fact traces to an authoritative source, and the *content matches the source*, not just links to it. | Word facts checked field-by-field against a structured Wiktionary/DWDS dump; sentences checked against an offline grammar engine and a corpus. |
| **Audit-ready** | An outside examiner can reconstruct *how* each item was verified: by what, when, with what result. | Every check writes a dated, versioned verdict into the provenance register. "Machine-verified vs Wiktextract 2026-07 + LanguageTool + 2-model jury" replaces "an assistant wrote it." |
| **Automated** | It runs without a human in the common case, and re-runs on a schedule and in CI. | Layers 0–3 are deterministic gates in CI; Layer 4 (AI jury) runs scheduled; humans see only the exception queue. |

The unifying idea is a **verification ladder**: each item climbs from `unverified` to a trust tier by
passing independent, cheap-to-strict checks. A native speaker is one expert; we substitute a *panel
of independent witnesses* (dictionaries, a grammar engine, multiple models) and treat **agreement as
confidence and disagreement as the only thing a human ever looks at.**

## 3. The verification ladder (the core of the strategy)

Six layers. Layers 0–2 exist or are cheap deterministic additions; Layer 3 is the offline
linguistic engine; Layer 4 is the AI jury that stands in for native-speaker judgment; Layer 5 is the
minimized human. An item's **trust tier** is the highest rung every relevant check has passed.

```
Layer 5  Human audit (rationed)      ── native-speaker spot-check of the exception queue + random sample
Layer 4  AI jury (ensemble)          ── multiple independent models judge naturalness / register / CEFR / translation
Layer 3  Linguistic engine (offline) ── LanguageTool grammar + hunspell spelling + CEFR heuristic
Layer 2  Factual match (offline)     ── article/plural/POS checked field-by-field vs Wiktextract + DWDS dump
Layer 1  Provenance + license (live) ── allowlist gate + reference-URL liveness (check:refs)   [EXISTS]
Layer 0  Structural (live)           ── schema, ids, cross-refs, em dashes (lint:content)       [EXISTS]
```

### Layer 0 — Structural integrity — **shipped**
`pnpm lint:content` + the `validate.yml` CI gate. Duplicate ids, broken dialogue branches, missing
fields, dangling cross-references, taxonomy/enum integrity, em dashes. Nothing to add; it is the
floor every item already stands on.

### Layer 1 — Provenance & licensing — **shipped**
The license allowlist gate in `lint-content.mjs` (build fails on a non-allowlisted license or a
missing row) plus `pnpm check:refs` (reference-URL liveness, separating hard 404s from transient
rate-limits). This is the **legal** half of "source-verified." It proves the link is real. It does
**not** prove the content matches what the link says. That is Layer 2, and it is the missing rung.

### Layer 2 — Factual match against a structured lexical dump — **build this first (biggest win)**
This is the single highest-leverage addition, and it needs **zero German skill and zero ongoing
cost.** German Wiktionary is published as structured, machine-readable JSON via
**Wiktextract / kaikki.org** (one downloadable dump, offline, no API rate limits). For every word
fact we assert today, we can now check it *field-by-field*:

- **Nouns:** does our `article` (der/die/das) match the dump's gender? Does our `plural` match its
  declension table? Is it even a noun?
- **Verbs:** is the headword actually a verb? Is a claimed reflexive/separable form real?
- **All words:** does the headword exist as a lemma at all (catches typos and invented compounds)?
- **Spelling of every German token** in examples/glosses via the offline **hunspell `de_DE_frami`**
  dictionary (the LibreOffice German dictionary) — catches typos a link-check never could.

Any mismatch is a hard, specific finding: `v_engpass: article "die" but Wiktionary says "der"`. A
non-native founder can act on that finding without judging German, because the authority, not the
founder, made the call. **This converts the vocabulary and collocation banks (the ~990-item bulk of
the library) from "AI-drafted, unverified" to "every core fact machine-verified against Wiktionary,"
with an auditable, reproducible record.** It is the difference between *linking* a source and *being
verified by* it.

> Implementation: a new `scripts/verify-facts.mjs` loads the Wiktextract German dump (vendored or
> cached), joins it to `vocabulary.ts` / `collocations.ts` by headword, and emits per-item pass/flag
> plus a machine verdict written to the register. Runs offline, so it can be a **CI gate** for new
> nouns/verbs, not just an audit.

### Layer 3 — Offline linguistic engine — **build second**
Facts are single words; sentences need grammar. **LanguageTool** is an open-source, self-hostable
German grammar and style checker (the engine behind many German proofreaders). Run every example
sentence, dialogue line, gloss, and reading text through a **local LanguageTool server**:

- grammar and agreement errors (case, gender, verb position),
- spelling and punctuation,
- optionally its style rules (register hints).

Plus a **CEFR plausibility heuristic**: score each item's difficulty from word-frequency bands (a
CEFR-graded frequency list) and sentence complexity, and flag any item whose measured level is far
from its claimed `cefr` facet (e.g. a word tagged `B2.2` that is actually top-2000-frequency A2).
This is a *heuristic tripwire*, not a grader — it catches gross mislabels for the jury/human to
resolve.

Both are offline and free. LanguageTool findings are specific and actionable ("possible agreement
error: *dem* → *den*") and, again, need no native fluency to act on because the tool cites the rule.

### Layer 4 — AI jury: the native-speaker substitute — **build third**
Layers 2–3 verify facts and grammar. They cannot judge the things that actually need a fluent human:
*is this natural, is the register right, does the example genuinely illustrate the word, is the
English translation faithful, is this really the claimed CEFR level.* This is where we replace one
native reviewer with a **panel**.

**Principle: verification, not generation.** The models do not write content. They *judge existing
content against a fixed rubric* and return structured verdicts. Critically, we use **more than one
independent model** and adversarial prompting ("try to find what is wrong; default to REJECT if
unsure"), because a single model rubber-stamps its own style. The design:

- Each item is judged by **N independent judges** (e.g. Claude Opus + one other frontier model, or
  the same model under differently-seeded adversarial prompts) against a rubric that returns, per
  dimension: `correct` / `natural` / `register-ok` / `example-illustrates` / `translation-faithful`
  / `cefr-plausible`, each with a boolean + one-line reason + confidence.
- **Consensus resolves the verdict.** Unanimous pass with high confidence → item is `jury-verified`.
  Any reject, any disagreement, or low confidence → item drops to the **exception queue** for Layer 5.
- Every judge's verdict is logged with **model id, prompt version, date** — this is audit evidence,
  not a vibe.

**Calibrating the jury (non-negotiable).** An unaudited AI jury is just a confident guess. Before we
trust it, we build a small **golden set** (~150 items: a real native speaker labels known-good and
deliberately-broken items) and measure the jury's **precision and recall against it**. We only rely
on the jury for tiers where it demonstrably matches the human (e.g. ≥95% agreement). We re-run the
golden set whenever we change models or prompts, so the jury's trustworthiness is itself measured and
recorded. This is what makes "an AI checked it" defensible to an auditor.

### Layer 5 — Human audit, rationed to the exception queue — **the honest residue**
We cannot fully remove the human, and we should not pretend to. But we can shrink them from
"verify 1,195 items" to **"review only what the machines flagged, plus a random confidence sample."**
Realistically that is the ~5–15% the jury disagrees on or rejects, plus, say, 30 random already-passed
items per quarter to keep the machines honest.

The founder is not that human for German accuracy. The strategy is a **rationed native-speaker
budget**: a freelance certified German teacher (Fiverr/Upwork/italki, or a DaF-qualified reviewer)
engaged for a bounded number of hours to clear the exception queue and the audit sample. A
one-time pass over the current backlog's exceptions plus a light quarterly retainer is a **few hundred
euros, not a salary** — because the machines did 85–95% of the work first. This is the CTO cost cap:
buy a scalpel of human expertise, not a sledgehammer.

## 4. The trust model: one score per item

The ladder needs a home in the data. We extend the existing `ProvenanceEntry` (in
`src/types/index.ts`) with a `verification` block, so the register remains the single audit artifact
and the "Sources & Licenses" page (`/sources`) can surface it. Proposed shape (additive, optional, so
nothing breaks and untagged items still lint):

```ts
verification?: {
  tier: "unverified" | "structural" | "provenance" | "facts" | "linguistic" | "jury" | "human";
  checks: Array<{
    layer: "facts" | "linguistic" | "jury" | "human";
    tool: string;        // e.g. "wiktextract-de-2026-07" | "languagetool-6.4" | "claude-opus-4-8" | "reviewer:AB"
    result: "pass" | "flag" | "fail";
    detail?: string;     // the specific finding, for the exception queue
    date: string;        // ISO date — the audit timestamp
    prompt_version?: string; // for jury reproducibility
  }>;
  confidence: number;    // 0..1 rollup
  last_verified: string; // ISO date, drives the re-verification cadence
};
```

`tier` is the **highest rung all relevant checks passed** (a noun must pass facts + linguistic +
jury to reach `jury`; a reading text skips facts). `review_status` stays as the human gate: only a
Layer-5 sign-off flips an item to `"verified"`. The rest becomes machine-attested tiers below it.

This is what makes the whole thing **audit-ready**: an examiner samples any item and sees the exact
chain — *facts matched Wiktextract dump X on date Y, grammar clean under LanguageTool Z, jury of two
models passed on date W under rubric v3, human-audited in the Q3 sample* — reproducible on demand.

## 5. Automation: where each layer runs

| Layer | Trigger | Blocks a merge? | Cost |
|---|---|---|---|
| 0 Structural | CI on every PR (`validate.yml`) | **Yes** | free |
| 1 Provenance/license | CI on every PR (`lint:content`) | **Yes** | free |
| 1 Ref liveness | manual / scheduled Action (`check:refs`) | no (flaky by nature) | free |
| 2 Factual match | CI on every PR for new/changed nouns+verbs; full sweep scheduled | **Yes** for new items | free (offline dump) |
| 3 Linguistic | CI on changed sentences; full sweep scheduled | warn on PR, gate optional | free (self-hosted) |
| 4 AI jury | **scheduled** GitHub Action (weekly/on-demand), not per-PR | no (async) | LLM tokens |
| 5 Human audit | generated exception-queue report → freelance reviewer | no | rationed € |

Layers 0–2 are fast and deterministic, so they **gate merges** — new content cannot enter the library
factually wrong. Layers 3–4 are slower or paid, so they run **asynchronously on a schedule** and
update each item's tier and confidence, producing the exception queue as a committed report
(`docs/reports/verification-queue.md`) the reviewer works from. Nothing about this needs the founder
to read German; it needs the founder to run a script and forward a queue.

**Cost envelope (the founder's plan is usage-windowed, so this matters).** The only paid layer is the
jury. Judging ~1,200 items once with 2 models at a strict rubric is a **single-digit-to-low-tens-of-
euros** token spend, not a recurring bill; re-runs only touch changed items. Offline layers (Wiktextract,
hunspell, LanguageTool, frequency lists) are **free and have no rate limits**, which is why they carry
the bulk of the load. Human review is bounded by the queue size the machines leave behind. Total to get
the current backlog from "1,170 draft" to "machine-verified + human-audited exceptions" is a **few
hundred euros, one-time**, then near-zero to maintain.

## 6. Decay, drift, and re-verification

Verification is not one-and-done. Sources change, models change, and a green check from a year ago is
weak evidence.

- **Source drift:** Wiktextract dumps are re-pulled quarterly; a re-pull that changes a fact
  re-flags the affected items. License snapshots (already in the governance doc) cover the legal side.
- **Model drift:** the golden set re-runs whenever the jury's model or prompt version changes; if
  precision drops, the affected tier is demoted until recalibrated.
- **Staleness cadence:** `last_verified` older than a set window (e.g. 12 months) demotes an item's
  effective confidence and re-queues it in the next scheduled sweep. This is the "post-market
  monitoring" an ISO/EU-AI-Act auditor expects, made mechanical.

## 7. New content, going forward

The strategy must not just clean the backlog; it must keep new content clean by construction. The
authoring rule (added to `CLAUDE.md`'s content conventions) becomes:

> When you add a content item, add its provenance row **and** run `verify-facts` + `lint:content`
> before pushing. A new noun/verb whose article/plural/POS does not match Wiktextract **fails the
> build** — you fix the content or the source, not the gate. The item enters at tier `facts`; the
> scheduled jury and the reviewer promote it from there.

This means the backlog problem never recurs: every future item is born at least fact-verified, and
the draft→verified climb is automated rather than a growing manual debt.

## 8. Mapping to the compliance drivers

This is the same audit story the governance doc already tells investors and buyers, now with the
accuracy half filled in. The pipeline **is** the EU AI Act Article 10 evidence.

| This strategy's control | EU AI Act | ISO/IEC 42001 | What an auditor samples |
|---|---|---|---|
| Layer 2 factual match | Art. 10 (data quality, error-checking) | Data governance | Item → Wiktextract verdict + date |
| Layer 3 linguistic engine | Art. 10 (error-checking) | Data quality controls | Item → LanguageTool run + version |
| Layer 4 jury + golden-set calibration | Art. 10 + Art. 15 (accuracy) | Performance evaluation | Jury verdicts + calibration metrics |
| Layer 5 human audit cadence | Post-market monitoring | Internal audit | Quarterly sample records |
| `verification` register block | Record-keeping (Art. 12) | Documented information | The reproducible chain per item |

"We machine-verify every word fact against Wiktionary, grammar-check every sentence, run a
calibrated two-model jury, and a native speaker audits the exceptions and a quarterly sample" is a
**genuinely strong** answer to due diligence, and it is true rather than aspirational.

## 9. Phased roadmap

Ordered by leverage-per-effort, cheapest and highest-impact first.

**Phase A — Factual match (Layer 2), highest ROI.** Vendor/cache the Wiktextract German dump; write
`scripts/verify-facts.mjs`; join to vocabulary + collocations; emit findings; add hunspell spelling.
Wire it as a CI gate for new nouns/verbs. _Outcome: the ~990-item lexical bulk becomes fact-verified
with zero German skill and zero recurring cost. This alone retires most of the "unverified" risk._

**Phase B — Linguistic engine (Layer 3).** Stand up a local LanguageTool; run all sentences; add the
CEFR frequency heuristic. Findings → warnings on PR, full report on schedule.

**Phase C — Trust model.** Add the `verification` block to `ProvenanceEntry`; have Phases A/B write
tiers; surface tier + confidence on `/sources`; extend `lint-content.mjs` to record (not yet gate on)
tiers.

**Phase D — AI jury (Layer 4) + golden set.** Build the ~150-item golden set (needs the first bit of
paid native review); measure jury precision/recall; run the calibrated jury as a scheduled Action;
generate the exception queue.

**Phase E — Human audit loop (Layer 5).** Engage a freelance DaF reviewer for a bounded pass over the
exception queue + a random sample; feed corrections back; flip cleared items to `review_status:
verified`. Set the quarterly cadence.

**Phase F — Steady state.** Quarterly source re-pull, jury re-run on changes, golden-set recalibration,
staleness re-queue. The library maintains its own verified state.

Phases A–C are **free and need no native speaker.** Only D–E cost money, and only a bounded amount.

## 10. Open decisions (for the founder)

1. **Wiktextract dump: vendor or fetch-and-cache?** Vendoring (~a large JSON, filtered to the words we
   use) makes CI fully offline and reproducible; fetching keeps the repo lean. _Lean toward a filtered,
   vendored subset — reproducible builds beat a slim repo for an audit artifact._
2. **Jury composition.** Two frontier models from different vendors (strongest independence) vs one
   model under multiple adversarial personas (cheaper, less independent). _Lean toward two vendors for
   the calibration set, then whichever meets the precision bar for the bulk._
3. **Reviewer sourcing.** Freelance marketplace (cheapest, variable quality) vs a vetted DaF teacher on
   retainer (pricier, consistent, better audit story). _Lean toward one vetted reviewer for
   consistency; it is a stronger due-diligence answer than anonymous gig work._
4. **Gate strictness for Layer 3.** Block merges on LanguageTool findings, or warn only? Grammar
   engines have false positives on idiomatic B2 phrasing. _Lean toward warn-only for Layer 3, hard-gate
   for Layer 2 (facts are unambiguous)._

## 11. CTO recommendation

Build **Phases A–C now.** They are free, need no German fluency, run offline in CI, and they convert
the largest and riskiest part of the library (every word's core facts) from "AI-drafted, unverified"
to "machine-verified against Wiktionary with a reproducible record." That single move answers most of
the founder's worry and most of an auditor's Article 10 question, at zero recurring cost.

Then run **Phase D** (the jury is cheap) to triage everything a dictionary can't judge, and spend a
**bounded few hundred euros on Phase E** to clear only the exceptions the machines couldn't resolve.
Do **not** attempt a full manual native-speaker review of 1,195 items — it is unnecessary once the
ladder is in place, and it is exactly the cost the automation exists to avoid.

The result is a library that is source-verified field-by-field, carries a reproducible audit trail per
item, and re-verifies itself on a schedule — built by a founder who does not speak native German,
because the authorities and the panel do the speaking, and the human only settles the ties.

## Change log
- **v1.0 (2026-07-07):** initial data strategy. Framed the non-native-verification problem; defined
  the six-layer verification ladder (structural → provenance → factual match → linguistic → AI jury →
  human audit), the per-item trust model extending `ProvenanceEntry`, the automation/CI split, the
  cost envelope, decay/re-verification cadence, EU AI Act Article 10 mapping, and the A–F roadmap.
  Cross-links `DATA_GOVERNANCE.md` (legal layer) without duplicating it.
</content>
</invoke>
