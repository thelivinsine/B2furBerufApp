# Bibliothek Categorization Audit & Marketplace-Readiness Report

_Last updated: 2026-07-09 · Branch: `claude/bibliothek-categorization-analysis-mtqo5o`_

## Scope & method

This audits how the **Bibliothek** (Wörter, Kollokationen, Redemittel, Grammatik) classifies and
filters content, and what it needs to feel intuitive and marketplace-ready. It was commissioned by the
founder, who flagged that the categorization "needs a lot of improvement" and asked specifically about:
the difference between Thema and Situation, the weak/vague Branche filter (with "Büro" as a wrong value),
why Kollokationen and Redemittel have so few filters and Grammatik none, when a control should be a
dropdown vs a filter, visual bugs, and a "most useful words" graph.

**Method.** A codebase audit established the ground-truth facts (tag coverage counts, control inventory,
existing assets), then a panel of five independent experts analysed it in parallel (information
architecture, DaF/CEFR pedagogy, UX/interaction, content-data strategy, competitive/marketplace), an
adversarial red-team challenged both the panel and the founder's ideas, and a lead analyst synthesised
one decisive report. The red-team memo is preserved verbatim as Appendix A because its "stop
over-scoping" steer is load-bearing.

**Ground-truth facts the audit established** (verify with `pnpm lint:content` / the cited files):

| Fact | Value | Source |
| --- | --- | --- |
| Branche (`sector`) coverage | 26 / 642 words (4%); only `care` (15) + `office` (11) populated; 4 of 6 values empty | `vocabulary.ts`, `lib/facets.ts` |
| Situation (`workSituation`) coverage | 14 / 642 (2.2%); 4 of 7 values used; onboarding/sick-leave/review = 0 | `vocabulary.ts`, `lib/facets.ts` |
| Redemittel level/topic tags | 0 / 82 have `cefr`; 0 / 82 have `themeId` | `redemittel.ts` |
| Grammar level | No `cefr`/`level`/`difficulty` field on `GrammarTopic` at all | `grammar.ts`, `types/index.ts` |
| Register `diplomatic` on collocations | 0 items (2-value facet in practice) | `collocations.ts` |
| Frequency tags | 0 items tagged, but `scripts/vendor/german-frequency-subset.json` (wordfreq Zipf) already exists, build-time only | `types/index.ts`, `scripts/` |
| Domain axis | 6 values, tags every theme, surfaced nowhere in the Bibliothek UI | `domains.ts` |
| Naming collision | Theme `meetings` vs situation value `meeting` = same concept, two axes | `themes.ts`, `types/index.ts` |

The developer-facing sections below (6, 7, 9, 10) are specific enough to implement from. The one-line
steer from the whole exercise: **stop trying to _complete_ the taxonomy; make it stop _looking_ broken,
surface the structure you already own, add the one machine-derivable signal (frequency), and refuse any
change that needs the founder to hand-tag hundreds of items or learn a new navigation model.**

---

## 1. Executive summary

**Verdict on marketplace-readiness: not ready, but the gap is narrow and mostly cosmetic.** The Bibliothek does not have a broken taxonomy. It has a *sound* taxonomy with two half-populated facets that make it *look* broken, one invisible organizing layer, and two tabs (Redemittel, Grammatik) whose data was never tagged. Fix the "looks broken" tells and surface the structure you already own, and the library reads as finished. Do not redesign it.

The seven things that matter:

1. **Two facets ship as broken promises.** Branche is tagged on 26 of 642 words (4%) and collapses to a two-pill menu (Pflege, Büro); Situation on 14 of 642 (2.2%), four of seven values ever used. A confident-looking two-option filter over a six-value enum is worse than no filter. This is the single loudest amateur-taxonomy tell in the product, and it is a handful of lines to fix.

2. **The founder's confusion ("is Bank a topic or an industry?") is caused by one invisible layer.** The six-value Domain axis (`beruf`, `arbeitswelt`, `alltag`, `gesundheit`, `bildung`, `pruefung`) already exists in `domains.ts`, already tags every theme, and is surfaced nowhere in the Bibliothek. The learner sees a flat 15-item Thema dropdown that mixes workplace tasks (meetings, conflict) with life errands (bank, arzt, wohnen). Surfacing Domain resolves the ambiguity for free.

3. **"Situation" is not a second axis. It is the fine grain of Thema, plus a naming bug.** The theme `meetings` and the situation value `meeting` (Besprechung) are the same concept spelled two ways. Retire the `workSituation` facet, keep the two grains (Thema then Sub-theme). Do not build a separate task-navigation paradigm.

4. **Redemittel and Grammatik "have few/no filters" because their data was never tagged, not because the UI is missing.** 0 of ~82 Redemittel carry `cefr` or `themeId`; `GrammarTopic` has no level field at all. The fix is a small content pass plus (for grammar) one schema field, not a new filter engine.

5. **"Most useful words" is worth building and is nearly free, but the literal chart the founder asked for is a trap.** The Zipf dataset is already vendored (`scripts/vendor/german-frequency-subset.json`) and recharts already ships in Analytics. But a "most-used words" leaderboard over a *curated* 642-word exam bank surfaces function words (der, und, sein) and buries the B2 compounds the product exists to teach (Aufenthaltserlaubnis scores Zipf 0). Ship it as a per-word `core/häufig/Fachsprache` badge plus a composition view. Never make the "most common German words" claim.

6. **The highest-leverage move is trivial.** A facet coverage floor (auto-hide any facet with fewer than ~3 populated values, not just its empty options) plus deleting "Büro" removes both broken-looking filters this week, with zero content work, zero migration risk, and zero founder tagging.

7. **Two free axes nobody is using.** Domain (structure you own) and an SRS-state filter ("fällig / lerne ich gerade / gemeistert", derivable from the FSRS `cardLevel`/stability data already on every card) are the two most valuable additions and both need no hand-tagging. The SRS filter is more valuable to a returning learner than sector, frequency, and register combined.

The steering principle for everything below: **stop trying to *complete* the taxonomy; make it stop *looking* broken, surface the structure you already have, add the one machine-derivable signal, and refuse anything that needs the founder to hand-tag hundreds of items or learn a new navigation model.**

---

## 2. The classification vocabulary

Every axis falls into one of three families. Getting this straight is what answers the founder's core question.

- **TOPIC** = what the content is *about* (or, for phrases/rules, what it *does*). Single-select navigation.
- **CONTEXT** = the situational surround: which workplace, which scene. Orthogonal to topic.
- **ATTRIBUTE** = an intrinsic property of the item itself: its level, its formality, its part of speech, its commonness. Orthogonal to everything.

| Axis | Family | What it means | Boundary (the plain-language rule) |
|---|---|---|---|
| **Domain** (Bereich) | Topic, top grain | The life-sphere the content serves: Beruf, Arbeitswelt, Alltag, Gesundheit, Bildung, Prüfung. 6 values. | Broader than a Thema. It *groups* themes; it is never itself a subject. Answers "which part of my life is this for." Exists in data, invisible in UI. |
| **Thema** (Thema) | Topic, middle grain | The subject the words/phrases are about: Besprechungen, Konfliktlösung, Bank & Finanzen, Arzt. 15 values. | A Thema sits inside exactly one Domain. It is a topic, never a workplace (that is Branche) and never a difficulty (that is CEFR). Single-select, so it is a dropdown. |
| **Sub-theme / Situation** (Unterthema) | Topic, fine grain | The concrete communicative scene inside a Thema: "eine Reklamation bearbeiten", "einen Termin vereinbaren", `meetings.ablauf`. Derived from each theme's `situations[]`. | This *is* what "Situation" should mean: a finer grain of Thema, not a separate axis. One scene can recur across themes, but it always lives under a parent theme. Second dropdown / picker, never a facet. |
| **Branche** (Branche) | Context (Space) | The industry a learner is *employed in*: Pflege, Handwerk, IT, Handel, Gastgewerbe. | Orthogonal to Thema: the same topic (Konfliktlösung) happens in every industry. Answers "in which workplace." Work-only; meaningless for Alltag content. "Büro" is not a value: every industry has an office, so it is a category error, not a redundant tag. |
| **CEFR** (Stufe) | Attribute | Intrinsic difficulty on the A2–C1 scale (`lib/cefr.ts`). | A property of the item, independent of topic or context. The one axis that should exist on all four banks. Drives the level-band default. |
| **Register** | Attribute | Formality/tone of a phrase: neutral, formell, (diplomatisch). | Intrinsic like CEFR but orthogonal to it. Belongs on phrasal content (Redemittel, Kollokationen). "Diplomatic" is strictly a pragmatic *function*, not a register (see §3). |
| **Wortart** (Part of speech) | Attribute, Wörter only | Grammatical class: Nomen/Verb/Adjektiv/… | A property of a single word. Meaningless on Kollokationen (all Nomen-Verb) or Redemittel (all phrases). Secondary to search; do not generalize it. |
| **Frequency / Usefulness** (Häufigkeit) | Attribute | How common a word is in real German, binned core/häufig/Fachsprache from wordfreq Zipf. | Intrinsic and orthogonal to CEFR: a word can be A2-easy but rare, or B2-hard but very common. Machine-derivable. This is the axis that answers "what should I learn first." |
| **Category** (Redemittel) / **group** (Grammatik) | Topic, per-type | For Redemittel, the speech-act (zustimmen, widersprechen); for Grammatik, the structural family (Konnektoren, Passiv). | These *are* the Thema of phrases and rules, so they correctly serve as each tab's primary dropdown. |

**The three boundaries the founder keeps hitting, stated plainly:**

- **Thema vs Situation:** same axis, two altitudes. Thema is the topic area; Situation is a scene inside it. If you can say "X happens *within* Y," Y is the Thema and X is the Sub-theme. "Besprechung" is a scene within the Thema "Besprechungen & Teamarbeit." They feel like two axes only because a naming collision (`meetings` theme vs `meeting` situation) spells the same idea twice.
- **Thema vs Branche:** decide by role. A learner acting as *customer/citizen doing an errand* → Thema. A learner describing the *field they are employed in* → Branche. **"Bank" in Genauly is a Thema:** the daily-life errand of dealing with a bank (open an account, dispute a Lastschrift), in the Alltag domain. The finance *industry* would be a Branche, but it is out of scope for this product and holds zero content, so it does not exist here. Never put the same label on both axes.
- **CEFR vs Frequency:** difficulty is not commonness. A word can be low-level and rare, or high-level and everyday. Keep them as two separate attributes.

---

## 3. Current-state audit

### Per axis

| Axis | Coverage | Verdict |
|---|---|---|
| Domain | 100% (every theme tagged) | **Sound but invisible.** Modelled correctly in `domains.ts`, never surfaced in the Bibliothek. The topic axis has no visible top grain, so the primary dropdown is a flat 15 mixing work and daily-life. |
| Thema | 100% on Wörter/Kollokationen (dropdown); **0% on Redemittel, 0% on Grammar** | Coherent within a tab but not shared across tabs. Flat, ungrouped, mixes two grains. |
| Sub-theme | 7 of 15 themes split | Fine where it exists. Shown on Wörter only; Kollokationen ignores it despite `collocationsBySubTheme` existing. |
| **Situation** (workSituation) | **14 of 642 = 2.2%**, only 4 of 7 values used (onboarding/sick-leave/review = 0) | **Broken and redundant.** Duplicates Thema, collides by name (`meeting` vs `meetings`), work-mode-only so most users never see it. Retire. |
| **Branche** (sector) | **26 of 642 = 4%**, only care (15) + office (11) live; 4 of 6 values empty | **Broken-looking facade + a category error.** `facet()` hides empties, so it renders as a two-pill menu, one pill of which ("Büro") is wrong. Worse than no facet. |
| CEFR | 100% Wörter + Kollokationen; **0% Redemittel; no field on Grammar** | Solid where present. The band-default pre-limit is a silent no-op on Redemittel (all untagged pass). |
| Register | Kollokationen: neutral 392 + formal 148, **diplomatic 0**; Redemittel: neutral 38 + formal 29 + diplomatic 5 | Two errors: "diplomatic" is a pragmatic function, not a register (which is *why* 0 collocations carry it, lexis cannot hold a politeness strategy), and as a third tier it is near-empty. |
| Wortart | 100% Wörter | Fine, but over-promoted as a co-equal headline facet; search covers most POS lookups. |
| Frequency | **0 tagged everywhere**, despite the Zipf subset sitting in the repo | The one machine-fillable axis, left on the table. |
| counterpart / taskType | 0 tagged, never rendered | Dormant forward-declares. Harmless only because unsurfaced. |

### Per tab

- **Wörter (642).** The reference implementation: Search + Thema dropdown + Sub-theme picker + Filter sheet (CEFR, Wortart, and the work-only Branche/Situation). Also carries the two broken facets and a "Gespeichert" toggle. Everything else should look like this tab, minus the broken facets.
- **Kollokationen (540).** Exposes only CEFR + Register. It *has* `themeId` in data (grouped ~36 per theme) but never shows a Thema dropdown, breaking parity with Wörter. No count shown on its primary options (inconsistent with the other tabs). Verb was correctly dropped as a facet (100+ values breaks the ≤12 rule; search covers it).
- **Redemittel (~82).** The thinnest tab, and it is a *data* gap: 0 `cefr`, 0 `themeId`, so only Category (dropdown) + Register (facet) work, and the band-default is a no-op. Also has two UI smells: a second segmented control (Wendungen/Üben) stacked under the LibrarySwitcher, and duplicated search+facet logic inline when `category==='all'`. A single 3-value Register dimension does not justify a bottom sheet.
- **Grammatik (10 topics / 47 drills).** Outside the toolbar system entirely: no search, no dropdown, no filter. `GrammarTopic` has no `cefr`/`level`/`difficulty` field, only a structural `group`. It reads as an unfinished tab next to three filterable ones.

### Cross-cutting current-state defects

- **CEFR band-default hides content silently.** All three list tabs pre-limit to level+1; the only escape is a low-contrast text link below the toolbar, under the 44px tap target. The learner is not told a cut is applied.
- **Facets gated on `mode==='work'`.** Branche/Situation appear only in Work mode, so default-mode ("both") and personal-mode learners never see them. Visibility should follow coverage, not mode.
- **Redundant chrome.** The `ScopeChip` ("Kontext: Besprechungen") echoes the theme already shown in the dropdown and the URL. Search input has no aria-label. Disabled pills still print "0".

---

## 4. Gap analysis

To be intuitive and marketplace-ready, the library is missing:

1. **A visible spine.** Domain is computed but never shown, so the catalog presents as a flat 15-item mix with no organizing principle. This is the deepest intuitiveness gap and it needs no new data.
2. **Level + topic metadata on two of four tabs.** Redemittel (`cefr`) and Grammar (`level`) cannot participate in the CEFR system that Wörter/Kollokationen use. Any "one coherent library" claim is false until this is filled. Grammar additionally needs a schema field before it can be tagged.
3. **A usefulness signal.** The frequency enum is 0-tagged despite the Zipf asset shipping in the repo. Learners cannot answer "what do I learn first," the single most common question a paying B1–B2 learner asks and the founder's headline ask.
4. **An honesty floor on facets.** No rule stops a 4%-covered dimension from rendering as a complete-looking two-pill filter. This is what makes Branche/Situation read as broken.
5. **A personal axis.** No way to browse by SRS state (fällig / lerne ich gerade / gemeistert), even though the FSRS data already exists on every card. This is the highest-value *returning-user* filter and nobody is using it.
6. **A written dropdown-vs-facet rule.** The per-tab inconsistency comes from having no codified rule, so each page was built ad hoc.

Explicitly **not** gaps (the panel over-called these):
- A task/can-do cross-cutting browse engine. The four tabs plus a per-theme scope already deliver the bundle for most needs; the canDo bank can link into a filtered session without a fifth paradigm.
- Per-industry vocab packs. Off-strategy: telc/Goethe B2 Beruf is deliberately sector-neutral.
- A grammar facet sheet. 10 items do not need one.

---

## 5. The founder's ideas, judged

| Founder idea | Verdict | Why |
|---|---|---|
| **Remove "Büro" from Branche** | **Agree** | Unanimous across the panel. Every industry has an office, so Büro is a work-context, not a sector: a category error. Delete the `office` value, retag its 11 words to their real theme or a scene. |
| **Treat Thema and Situation as one axis** | **Agree with caveats** | He is right that `workSituation` is dead weight (2.2%, name-collides with `meetings`) and must go. He is wrong that they collapse into one *flat* list. Keep the two grains: Thema then Sub-theme. His conflation is caused by a fixable naming bug, not a real two-axis problem. |
| **Branche = real industries (Pflege, Schule, Finanz, IT…)** | **Disagree (as shipped)** | The concept is legitimate, but at 4% coverage with two live values it is noise, and B2 Beruf is deliberately sector-neutral so industry is a weak organizer for this audience. Do not promote it or author per-industry packs. Keep `sector` as a data field, remove Branche from the UI until a sector has real depth, and surface Pflege (if at all) as a pack you enter, not a facet. |
| **Is "Bank" a Thema or a Branche?** | **Agree (it is a Thema)** | Bank in Genauly is the daily-life errand (customer role, Alltag domain), full stop. The finance industry is out of scope and holds zero content. The fix that makes this obvious is surfacing the Domain layer, not adding a Branche. |
| **More filters for Kollokationen + Redemittel** | **Agree with caveats** | Kollokationen: add the Thema dropdown it already has data for (parity win, small). Redemittel: the thinness is a *data* gap. Fill `cefr` (a real property of a phrase). Do **not** fill `themeId`: Redemittel are cross-cutting ("Ich schlage vor, dass…" belongs to every theme), and a single themeId invents false precision that would *hide* general phrases. |
| **Grammar should have filters** | **Disagree (on a filter sheet); agree on a toolbar** | 10 items do not need a facet sheet; that solves a problem no learner has. Add a search box, expose the existing `group` as a light dropdown, add a per-card CEFR badge (needs one schema field), and reorder the 10 by B2-marker priority. The founder is noticing an *asymmetry*, not a usability failure. |
| **When is something a dropdown vs a filter tab?** | **Agree (needs a codified rule)** | See §7. The pages read inconsistent because no rule was written down. |
| **A graph of the most-used words** | **Agree on the value, disagree on the literal chart** | Do build usefulness (the data and charting infra already exist). But a "most-used words" leaderboard over a curated exam bank misrepresents how the words were chosen, surfaces A2 function words, and buries B2 compounds. Ship a per-word badge + a composition view, scoped and honestly labelled. |

---

## 6. Recommended target model

### The axis set (final)

Three families, cleanly separated:

- **Topic spine (single-select navigation):** Domain → Thema → Sub-theme. One spine, three grains. Retire `workSituation`; its real values (Übergabe, Unterweisung) fold into Sub-themes.
- **Context (work-only, coverage-gated):** Branche. Kept in the data model, hidden from the UI until a sector clears the coverage floor. "Büro" deleted.
- **Attributes (multi-select refinement):** CEFR, Register, Wortart (Wörter only), Frequency (new), and SRS-state (new, personal).

### Per content type: exactly what to show and in which control

| Tab | Segmented (view switch) | Primary dropdown (single-select) | Sub-picker | Facet sheet (multi-select) | Inline chip |
|---|---|---|---|---|---|
| **Wörter** | LibrarySwitcher (4 tabs) | **Domain-grouped Thema** | Sub-theme picker where split | CEFR, Wortart, **Frequency**, **SRS-state**, Gespeichert | CEFR band-default (see §7) |
| **Kollokationen** | LibrarySwitcher | **Domain-grouped Thema** (add) | Sub-theme picker (add) | CEFR, Register, **Frequency**, **SRS-state** | CEFR band-default |
| **Redemittel** | LibrarySwitcher (drop the inner Wendungen/Üben tabs) | **Kategorie** (keep) | none | CEFR (after backfill) | **Register as a 3-chip inline row**, not a sheet |
| **Grammatik** | LibrarySwitcher | **Gruppe** (existing `group`) | none | none (badge only) | CEFR badge per card |

Rules baked into the table: Branche and Situation appear in **no** tab until they earn it. Every tab gets Search. Every primary dropdown shows option counts. The bottom sheet appears only where there are ≥2 facet groups (so Redemittel's single Register dimension becomes an inline chip row, not a modal).

### Proposed Branche list and how it stops colliding with Thema

If and when Branche is ever surfaced (post-coverage), the industry list is: **Pflege, Handwerk, IT, Handel, Gastgewerbe, Bau, Logistik**. It stops colliding with Thema by the role rule: Branche answers "where you work," Thema answers "what you are doing/learning about." Concretely:

- Never reuse a label across the two axes. If a finance *industry* is ever added, it is "Finanzdienstleistung" (Branche), distinct from "Bank & Finanzen" (Thema, the errand).
- The two axes live in different controls (Thema = dropdown, Branche = facet), so they can never appear in the same list.
- Because Domain is now the visible spine, the learner sees "Alltag: Bank" as an errand, which pre-empts the "is this an industry?" question entirely.

For the near term: **Branche stays out of the UI.** This is the honest call for a sector-neutral exam product.

---

## 7. UI/UX and control recommendations

### The dropdown-vs-facet decision rule (codify in `facets.ts` header)

- **Segmented control** = switch *which kind of content you see*. 2–5 mutually exclusive views. Current 4-tab LibrarySwitcher, keep.
- **Primary dropdown** (always visible, single-select) = the ONE "where am I" cut that re-scopes the whole page: Domain/Thema, or Kategorie (Redemittel), or Gruppe (Grammatik). Never goes inside the sheet. Never multi-select.
- **Facet pills in a bottom sheet** = orthogonal, multi-select, ≤12-option *attributes* that refine within the primary: CEFR, Register, Wortart, Frequency, SRS-state. Only mounts when there are ≥2 facet groups.
- **Inline chip row** = exactly one small refinement the user should see without opening a modal: Redemittel's Register, and the CEFR band-default state.
- **Sub-theme picker** = the dependent finer topic grain. Never a facet.
- **Hard floor:** never render a facet with fewer than ~3 populated values. Never render a facet that has fewer than ~15% of the bank tagged.

### One coherent toolbar across all four tabs

Mount the shared `[Search] [Primary ▾] [Filter]` `BrowseToolbar` on Grammatik (currently uses none of it) and add the missing Thema dropdown to Kollokationen. After that, all four tabs share one shape: this is the biggest single "reads as finished" win and most of it is wiring, not content.

### Grammar specifically

Add `BrowseToolbar` with `group` as the primary dropdown and free-text search over `titleDe`/`purposeDe`/`pattern` (zero new data). Add one schema field `cefr` to `GrammarTopic`, tag the 10 topics, show it as a per-card badge (not a facet). Reorder the 10 topics by B2-marker priority (Konnektoren, Konjunktiv II, Passiv, Nominalisierung first) and link them from the Fortschritt weakness/diagnose card, so grammar answers "which rule is throttling my output," not "where is the topic."

### Make the CEFR band-default visible

Replace the tiny "Auch B2.2 · C1 zeigen (N)" text link with a muted, tappable `ActiveFilterChip` in the toolbar row, e.g. `Stufe: bis B2.1 (x)`. This turns a silent cut into an explicit, removable filter and fixes the tap-target issue in one move. In the Prüfung context, default to the full target band (B2.1 + B2.2), not self-level+1, because exam candidates need the whole field and self-ratings are unreliable at the plateau.

### Empty / near-empty facet handling

- Add a `MIN_FACET_OPTIONS`/coverage floor to `facet()`: below the floor, hide the whole facet, not just its empty options. This retires Branche and Situation automatically until content justifies them.
- Stop gating facets on `mode==='work'`; visibility follows coverage.
- Fold `diplomatic` register into `formal` for now (0 collocations, 5 Redemittel). The pragmatic-function insight (direkt/höflich/diplomatisch as a separate tag, plus an Amtssprache register band) is correct linguistically but is a v2 content project: it would mean re-judging register on 540 collocations + 82 Redemittel by hand. Bank it.

### Visual-bug fixes (batch, all small)

- Drop Redemittel's inner Wendungen/Üben segmented control; use the trailing "Üben → /session" button pattern like the other tabs.
- Refactor Redemittel's `category==='all'` path to reuse the toolbar's single filtered result instead of re-implementing search+facet inline.
- Add option counts to the Kollokationen primary dropdown (parity).
- Add `aria-label` to the search input; hide the "0" on disabled pills; drop the redundant `ScopeChip` when the dropdown already shows the theme; remove the section-description sentence in the SubThemePicker (violates the microcopy budget).
- Gloss the German facet labels for B1 users where the term is itself above level (e.g. `Fachsprache`, and never introduce `Amtssprache` as a user-facing label to someone who does not yet know the word).

---

## 8. "Most useful words"

### The honest definition

For a **curated** 642-word exam bank, "usefulness" is **not** raw corpus frequency. Raw frequency fails this product three ways: its head is A2 function words (der, und, sein) with zero B2 learning value; the highest-value Beruf/Behörde items are compounds (Aufenthaltserlaubnis, Nebenkostenabrechnung) whose individual frequency is *low by construction*; and wordfreq is web/subtitle-weighted, so it under-counts the formal register the product targets. CLAUDE.md already concedes "German compound frequency is a weak grader."

So define usefulness as a **per-word attribute**: how common this word is in everyday German, binned `core / häufig / Fachsprache`, with compounds handled honestly.

### How to use the existing subset

Ship it as a **generated map**, following the `verification.ts` precedent (generated, do-not-hand-edit), so the hand-authored banks stay clean:

- Add `pnpm build:frequency` that reads `scripts/vendor/german-frequency-subset.json` and writes `src/data/frequency.ts`, keyed by `content_id → { bin, zipf }`.
- Binning, precision-first: `core` = Zipf ≥ 4.5; `häufig` = 3.5–4.5; `Fachsprache` = 1.5–3.5.
- **OOV/compound rule:** Zipf 0, or a compound whose base token is missing, → leave the bin undefined so it rolls up. Never auto-label a rare-looking compound "Fachsprache" just because the full form is rare. This is the single most important correctness rule of the feature.
- `facets.ts` reads the map to expose a `Häufigkeit` facet (3 pills, well under the ≤12 limit) on Wörter + Kollokationen. No type change needed: the `Frequency` enum, the optional fields, and the `FREQUENCIES` linter mirror already exist.
- Keep the map out of eager/Dashboard code (Library + Analytics are lazy). ~1.2k tiny entries gzip to a few KB, fully offline, no runtime fetch, no threat to the 400kB main-chunk budget.

### Where the view lives, and what it must not claim

- **Browse:** a `Häufigkeit` facet + a per-card badge in the Wörter list. Optionally a "Häufigkeit" sort.
- **Analytics/Fortschritt:** one honest composition chart, "dein Wortschatz nach Häufigkeit" (a stacked/bar via the recharts infra already there), ideally overlaid with FSRS mastery so it becomes "high-value words you have not learned yet" and a tap deep-links to the word. That overlay is what turns it from a decorative chart into a study planner.
- **Must NOT claim:** "die häufigsten deutschen Wörter" / "most-used German words." The bank was chosen by exam word-fields, not corpus rank; the claim is false and free frequency lists beat you at that framing. If a top-N is ever wanted, the only honest label is "am häufigsten im Alltagsdeutsch, unter den gelehrten Wörtern." Label the axis Häufigkeit, not Wichtigkeit.

All copy: no em dashes, eyebrow ≤2 words, title ≤5 words.

---

## 9. Data-model and content work

### Schema / union changes (`types/index.ts` + `scripts/lint-content.mjs` mirror)

Deliberately minimal. Only one true schema addition:

1. **`GrammarTopic.cefr?: ContentCefr`** (the only genuinely new field). Add a validate-when-present check in `lint-content.mjs` reusing the existing `CEFR_LEVELS` mirror (no new enum). Then tag all 10 topics and flip to a completeness check.
2. **Remove `office` from the `WorkSector` union** and its `WORK_SECTORS` linter mirror (small edit). Retag its 11 words.
3. **`frequency.ts`** is generated (§8); no hand-editing, no per-item TS field writes. Everything it needs already exists in the type system.

Everything else the panel wanted (`sector`, `workSituation`, `frequency`, Redemittel `cefr`/`themeId`) is already schema-complete and optional. The gaps there are data, not types.

### Tag-coverage backfill plan (ordered by cost honesty)

Prefer machine-derivable over human-judgment tags every time. For a non-technical solo founder, every human tag is either his labor or an AI-draft that must then pass `lint:content`, earn a provenance row (draft → verified), and survive `verify:facts`. "Effort M" is an engineer's estimate; the founder's real cost is 2–3x.

- **Frequency (machine, zero human tagging):** the generated map. Do first among data work.
- **Redemittel `cefr` (human, ~82 items):** AI-draft then founder-review. Anticipate a behavior change: once tagged, the CEFR band-default *starts hiding* Redemittel that previously all passed. Communicate/expect it.
- **Grammar `cefr` (human, 10 items):** trivial volume.
- **Redemittel `themeId`: do not fill.** Cross-cutting phrases; a single themeId invents false precision. If theme-reachability is ever wanted, it must be many-to-many task tags, which is not worth it for 82 items a search box already surfaces.

### What to cut or hide

- **Hide** Branche and Situation facets via the coverage floor (data fields retained).
- **Delete** the `office` sector value and retag.
- **Fold** `diplomatic` register into `formal`.
- **Decide** `counterpart` and `taskType`: if no authoring plan within a few sessions, cut them from the type + linter to shrink surface; if kept, comment them dormant and never surface until ≥15% tagged.

### Provenance

Frequencies are uncopyrightable facts (wordfreq Apache-2.0/MIT). The generated `frequency.ts` rides the existing per-item provenance rows (it is a derived attribute of already-provenanced `content_id`s, exactly like `verification.ts`). Add one dataset-level credit note in `DATA_GOVERNANCE.md` + a header in `frequency.ts` crediting wordfreq. Do not add per-word provenance rows for a machine-derived fact. New hand-authored `cefr` tags on Redemittel/Grammar follow the normal draft → verified provenance flow.

### Backwards-compat (the panel missed this)

Retiring the `workSituation`/`sector` facets and renaming enums touches `?cefr= ?pos= ?sub= ?cat=` deep links, `practiceAreas`, and the settings-store `version:1` migration with `ROUTE_SUCCESSOR`. When removing/renaming an enum value, drop stale URL params gracefully (ignore unknown, do not crash) and, if any facet state is persisted, extend the migrate step. Small, but not free: budget it into each removal.

---

## 10. Prioritised roadmap

Sequenced so the library stops looking broken first, then gains its one net-new value, then marketplace polish. Effort is engineering effort; multiply human-tagging tasks by ~2–3x for founder cost.

### Quick wins (ship this week, no content, no migration risk)

| P | Change | Effort |
|---|---|---|
| **P0** | **Facet coverage floor** in `facet()`: hide any facet with <3 populated values or <15% coverage. Stop gating facets on `mode==='work'`. *Removes both broken-looking filters instantly.* | **S** |
| **P0** | **Delete `office`/Büro** from the sector enum + linter mirror; retag its 11 words. | **S** |
| **P0** | **Retire the `workSituation` facet.** Fold its real values (Übergabe, Unterweisung) into Sub-themes; kill the `meeting`/`meetings` collision. | **S–M** |
| **P1** | **Add search to Grammatik** + `group` primary dropdown; reorder the 10 topics by B2 priority. | **S** |
| **P1** | **Fold `diplomatic` into `formal`** register. | **S** |
| **P1** | Visual-bug batch: drop Redemittel inner tabs + dedupe its filter logic, Register as inline chips, Kollokationen option counts, aria-label, disabled-pill "0", redundant ScopeChip, SubThemePicker description line. | **S–M** |

### The one big-value net-new feature

| P | Change | Effort |
|---|---|---|
| **P1** | **Generated `frequency.ts`** from the vendored Zipf subset → `Häufigkeit` badge + facet on Wörter/Kollokationen + one honest composition chart in Analytics (FSRS-overlaid). OOV/compound fallback mandatory. Never a "most-used" leaderboard. | **M** |

### Structure you already own (free, high intuitiveness)

| P | Change | Effort |
|---|---|---|
| **P1** | **Surface Domain** as a grouped header over the flat 15-theme dropdown (grouped Select or a domain row). No new data. Design it *with* the Mode lens so the two "which part of life" controls do not fight (let Mode pre-select which Domains show). | **M** |
| **P1** | **SRS-state facet** ("fällig / lerne ich gerade / gemeistert") from the existing FSRS `cardLevel`/stability data. No hand-tagging. The highest-value returning-user axis, and nobody proposed it. | **M** |
| **P1** | **Add the Thema dropdown + Sub-theme picker to Kollokationen** (data already present). Parity with Wörter. | **S** |

### Marketplace polish (after the above reads finished)

| P | Change | Effort |
|---|---|---|
| **P1** | **Backfill Redemittel `cefr`** (AI-draft → founder review). Anticipate the band-default behavior change. Do **not** add `themeId`. | **M** (human) |
| **P2** | **Add `GrammarTopic.cefr`** field + linter mirror; tag 10 topics; per-card badge. | **M** |
| **P2** | Make the CEFR band-default a visible, removable chip. | **M** |
| **P2** | Codify the dropdown-vs-facet rule + coverage floor in the `facets.ts` header and `DATA_GOVERNANCE.md`; document the Thema/Situation/Branche axis rule. | **S** |
| **P3** | Resolve `counterpart`/`taskType` (cut or formally park). | **S** |

### Explicitly deferred / rejected (do not spend runway here)

- Task/Can-Do cross-cutting browse engine (**L**). Rebuilds navigation to solve a problem the four tabs mostly already solve. If wanted later, it is a *link* from a Can-Do card into a pre-filtered session, not a fifth paradigm.
- Authoring per-industry Branche vocab packs (**L**). Off-strategy for a sector-neutral exam product.
- Register overhaul to four bands + a separate politeness axis (**L**). Correct linguistically, but weeks of hand re-judgment. v2.
- A grammar facet sheet. 10 items do not need one.

---

## 11. Open decisions for the founder

These are genuine judgment calls only you can make:

1. **Branche: park it or kill it?** The recommendation is to keep `sector` as a hidden data field and never surface it until a sector has real depth. Do you accept that Branche stays invisible for the foreseeable future (the honest, on-strategy call), or do you want to commit to authoring one deep sector pack (Pflege) as an *enterable pack*, not a facet? If neither, we cut the field entirely.

2. **Redemittel `cefr` backfill: worth ~82 review items?** This is real founder labor (AI-draft, then your review through the provenance pipeline), and it introduces a behavior change (the level default starts hiding phrases). Yes gives you a level filter on the tab; no leaves Redemittel filterable only by Category + Register, which is defensible for cross-cutting phrases. Your call on whether the payoff justifies the review time.

3. **Frequency framing: badge-only, or badge + Analytics chart?** The badge is low-risk and answers "learn this first." The composition chart adds a study-planner view but is more surface to get the honest-labeling right. Ship the badge for sure; the chart is optional in the same pass.

4. **Domain vs Mode overlap.** Surfacing Domain and keeping the Mode lens means two "which part of life" controls. The recommendation is to let Mode pre-select which Domains show (one drives the other). Confirm you want Mode to remain the top-level lens, with Domain as the in-library spine underneath it, rather than replacing Mode with Domain.

5. **Amtssprache / politeness axis: v2 or never?** For a Behörde-heavy product this is linguistically the richest future axis, but it is weeks of hand re-tagging. Confirm it is parked (recommended) so nobody starts it prematurely.

Files a developer would touch first: `src/lib/facets.ts` (coverage floor, sector edit, facet definitions), `src/types/index.ts` + `scripts/lint-content.mjs` (GrammarTopic.cefr, WorkSector edit), `src/features/grammar/GrammarHub.tsx` (BrowseToolbar), `src/features/collocations/CollocationsBrowser.tsx` (Thema dropdown), `src/features/library/LibrarySwitcher.tsx` (Domain grouping), and a new `scripts/build-frequency.mjs` → generated `src/data/frequency.ts`.

---

## Appendix A: Red-team critique (verbatim)

_Preserved as the counterweight to the panel's tendency to over-scope. Where this memo and the synthesis
disagree, the synthesis already incorporated the memo's calls; it is kept here for the reasoning._

# Red-Team Critique Memo: Genauly Bibliothek Taxonomy

Blunt verdict up front: the panel is smart but collectively **over-scopes this by 5x**. Five experts, ~40 recommendations, a dozen "P0"s, and several "effort: L" content projects, aimed at a **642-word app run by one non-technical person** who cannot write the tags himself. The correct output is not a taxonomy redesign. It is roughly four small changes that stop the library from *looking broken*, plus one genuinely new feature. Everything else is a trap.

Below: contradictions (with calls), over-engineering, where the founder is wrong, what everyone missed, and the single highest-leverage move.

---

## 1. Where the experts contradict each other, and who's right

### Ranked top 5 disagreements

**#1, Is "Situation" a separate primary axis, or just the fine grain of Thema?**
- **Expert 2 (Pedagogy)** stands alone: build a **Task/Can-Do lens as an alternative PRIMARY organizer** (effort L), lead *discovery* with it.
- **Experts 1, 3, 4, 5** all say: `workSituation` is a redundant, name-colliding, 2.2%-covered dead facet, **retire it, fold the real values into subThemes**. One spine: Thema → SubTheme.
- **CALL: the majority is right, Expert 2 is gold-plating.** The pedagogy point ("plateau learners need bundles, not four separate tabs") is *real and correct*, but the answer is not a new L-effort cross-cutting browse engine that pulls from four banks and needs a grammar-topic-per-task mapping. That's a quarter's work. The canDo.ts bank already exists and already lives on Fortschritt; if you want the task lens, it's a link from a Can-Do card into a pre-filtered session, not a fifth navigation paradigm. **Retire workSituation. Don't build the Task lens now.**

**#2, Frequency: "nearly free, strong yes" vs. "will actively mislead."**
- **Expert 1 (IA)**: "Strong yes, and it is nearly free… add a 'Nützlichste Wörter' chart." Waves it through.
- **Experts 2, 4, 5**: a raw most-used graph over a **curated** bank surfaces function words (der/und/sein) and **buries the B2 compounds the product exists to teach** (Aufenthaltserlaubnis scores Zipf 0). Reframe as a per-word *attribute* + composition, never a leaderboard.
- **CALL: Experts 2/4/5 are decisively right; Expert 1 is naive here.** His own CLAUDE.md says "German compound frequency is a weak grader." A "most-used words" leaderboard is a **vanity metric that would embarrass the product** (a rare-but-essential Behörde compound labelled "specialized"). Ship frequency as a build-time generated `core/häufig/Fachsprache` badge with an OOV/compound fallback (base-token or leave-untagged), and never make the "most common German words" claim, free frequency lists beat you at that framing anyway.

**#3, Redemittel: backfill themeId, or explicitly refuse to?**
- **Experts 1, 2, 5**: tag all ~82 Redemittel with `themeId` + `cefr` (P0).
- **Expert 4 (Data)** alone: **do NOT fill themeId.** Redemittel are cross-cutting by design ("Ich schlage vor, dass…" belongs to every theme); a single themeId invents false precision and would *hide* general phrases from the theme filter. Fill `cefr` only.
- **CALL: Expert 4 is right, and the other three are pattern-matching "more filters = better."** The honest fix is cefr (a genuine property of a phrase). If you want theme-reachability, it must be **many-to-many task tags**, not a single themeId, and that's more work than it's worth for 82 items that a good search box already surfaces. The band-default being a "silent no-op" on Redemittel is harmless today and Expert 4 correctly flags that filling cefr will *suddenly start hiding phrases*, a behavior change to anticipate.

**#4, Grammar: full BrowseToolbar, or a badge and a reorder?**
- **Experts 3, 5**: mount the shared `[Search][Primary▾][Filter]` toolbar, add cefr facet, search box, group dropdown.
- **Experts 2, 4**: **10 items do not need a filter.** A FacetSheet over 10 topics is over-engineering. Add a cefr *badge*, maybe reuse `group` as a light dropdown, and **reorder by B2-marker priority** + link from the weakness diagnostic.
- **CALL: Experts 2/4 are right.** "Grammatik has no filter" is the founder noticing an *asymmetry*, not a *problem*. You can eyeball 10 cards. A search box is cheap and fine; a facet sheet is solving a problem no learner has. The real grammar gap (which nobody should let the "add a filter" framing bury) is that the 10 topics aren't **ordered by what's throttling B2 output** (Konnektoren, Konjunktiv II, Passiv first).

**#5, Register: expand to four bands + a politeness axis, or collapse to two?**
- **Expert 2**: overhaul, `informell·neutral·formell·Amtssprache` on lexis, plus a *separate* `direkt·höflich·diplomatisch` function tag on Redemittel.
- **Expert 5**: **fold `diplomatic` into `formal`** (0 collocations, 5 Redemittel; no competitor ships a 3rd tier).
- **CALL: Expert 5 for now; Expert 2's insight is correct but it's a v2 content project.** Expert 2 is *linguistically* right that "diplomatic" is a pragmatic function, not a register, and that Amtssprache is the signature Behörde register. But adding two new enum bands means **re-judging register on 540 collocations + 82 redemittel by hand**, for a solo founder, that's weeks. Collapse the near-empty tier now. Bank the Amtssprache idea for when the Behörde content actually grows.

### Where the panel actually agrees (so treat as settled)
- **Delete "Büro" from Branche**, 5/5. It's a category error (every industry has an office). Non-controversial.
- **A facet coverage floor / auto-hide** (hide a facet with <2–3 populated values, not just empty options), Experts 3, 4, 5 independently. This is the cleanest consensus in the whole panel.
- **Surface the existing Domain layer**, 5/5, and it's free (domains.ts exists).
- **The dropdown-vs-facet rule**, 5/5 converge on the same rule: single-select "where am I" cut = dropdown; orthogonal multi-select refinement = facet pill.

---

## 2. Where the panel over-engineers, the minimum viable taxonomy

The panel forgets this is a **642-word app with a non-technical solo founder and a 24h dependency-cooldown supply chain**. Every "just backfill" is either founder labor or an AI-draft pass that then needs founder review through the provenance draft→verified + verify:facts pipeline. Gold-plating to cut:

- **Expert 2's Task/Can-Do cross-cutting lens (L).** Biggest single over-build. Kill it.
- **Making Branche "real" by authoring per-industry vocab packs (Experts 4/5, L).** This is off-strategy: telc/Goethe B2 Beruf is deliberately **sector-neutral**. Authoring IT/Handel/Gastgewerbe vocab is a content company's job, not a taxonomy fix. Branche should be **deleted from the UI**, kept as a data field only, and Pflege surfaced (if at all) as a *pack you enter*, not a facet.
- **Register overhaul to 4 bands + politeness axis (Expert 2).** v2 at best.
- **SubTheme consolidation across all 15 themes + enum renames + Domain surfacing + frequency + grammar toolbar + Redemittel backfill, all at once.** Doing the *whole* list is the trap. The MVP is a fraction of it.

**Minimum viable taxonomy (what I'd actually ship):**
1. Delete `office`/Büro from the sector enum + retag its 11 words. (S)
2. Add a **facet coverage floor** so Branche and Situation auto-hide until they earn their place. Stop gating facets on `mode==='work'`. (S), *this alone removes the two loudest "broken" tells.*
3. **Surface Domain** as a grouped header over the flat 15-theme dropdown. (M, no new data)
4. **Generate** `frequency.ts` at build time from the already-vendored Zipf subset → a per-word `Kernwortschatz/häufig/Fachsprache` badge + one honest composition chart in Analytics. (M), *the one net-new value.*
5. Add a **search box to Grammatik** and reorder its 10 topics by B2 priority. Add a cefr badge. No facet sheet. (S)
6. Draft `cefr` on the 82 Redemittel. Do **not** add themeId. (M content)

That's it. Everything else on the panel's list is v2+.

---

## 3. Where the founder is wrong or half-right

- **"Thema and Situation are one axis", half-right, for the wrong reason.** He's right that `workSituation` is dead weight and should go. He's wrong that they're literally one flat list. The truth: retire the *facet*, keep the **two grains** (Thema → SubTheme). His conflation is actually *caused by a fixable bug*, the theme `meetings` and the situation value `meeting` share a word. Fix the naming, keep the hierarchy.

- **"Bank is a Thema, and Branche should include Bank/Finanz", the panel is too generous here.** They all say "fine, on separate axes." I'll go further and be blunt: **for THIS product, Bank-as-industry does not exist and never will.** The scope is the learner-as-customer doing errands. Modeling "Finanzdienstleistung" as a Branche is inventing an axis to hold zero content. Bank is a Thema, full stop. Don't entertain the industry version, it's the founder chasing a symmetry that doesn't serve his users.

- **"A graph of most-used words", wrong premise.** You cannot show "most-used words" over a **hand-curated bank chosen by exam word-fields**, not by corpus rank. A leaderboard misrepresents how the words were selected and loses to free frequency lists. What he actually wants ("which should I learn first?") is answered by a per-word usefulness *badge* + coverage composition, scoped within a theme. Give him the value, refuse the literal chart.

- **"Why does Grammatik have no filter?", false symmetry.** He's assuming all four tabs should look alike. Consistency of *toolbar shape* is good; forcing a *filter* onto 10 items is not. The honest answer to his question is "because the data has no level field and 10 items don't need one", and the fix is a badge + search, not parity theater.

- **"Remove Büro", correct, ship it.** His one unambiguously right instinct.

---

## 4. What every expert missed

1. **Search vs. browse tradeoff, the biggest blind spot.** The app already ships `searchAll` + ⌘K global search. **A strong free-text search dissolves most of the demand for facets.** No expert seriously weighed "improve search instead of adding filters." Part-of-speech, verb-in-collocation, and even theme lookups are better served by search than by pills. Before backfilling anything, ask: does search already cover this? Often yes.

2. **SRS / "words I'm learning" as a filter, the highest-value personal axis, and it's FREE.** The FSRS data (`cardLevel`, stability, the collection-level mapping) already exists. A **"fällig / lerne ich gerade / gemeistert"** filter is worth more to a *returning* learner than sector, frequency, and register combined, it's the one axis about *them*. Only Expert 3 hints at overlaying FSRS on the frequency chart. Nobody proposed it as a browse filter. This is a bigger miss than anything the panel flagged.

3. **The cost of hand-tagging is systematically under-counted.** Experts toss "backfill cefr on 82 Redemittel (M)" around like it's an afternoon. For a **non-technical founder**, every tag is either his manual labor or an AI-draft that must then pass `lint:content`, get a provenance row (draft→verified), and survive `verify:facts`. "Effort: M" is an engineer's estimate; the founder's real cost is 2–3x. **Prefer machine-derivable tags (frequency) over human-judgment tags (sector, register) every time.** This reframes the whole priority list: frequency wins precisely because it needs *zero* human tagging.

4. **URL-param and persist-migration backwards-compat, unaddressed.** The app has `?cefr= ?pos= ?sub= ?cat=` deep links, `practiceAreas` linking into `/quiz`, and a settings-store `version:1` migration with `ROUTE_SUCCESSOR`. Retiring the workSituation/sector facets or renaming enums **breaks deep links and any stored state**. CLAUDE.md explicitly cares about this (the s49 pin-migration). No expert costed it. It's small, but "just delete the enum" isn't free.

5. **Label comprehensibility for a B1 user.** The facet labels are German-first (`Häufigkeit`, `Fachsprache`, `Amtssprache`). The *user is a B1–B2 learner* who may not parse "Fachsprache." Expert 2 wants to *add* `Amtssprache` as a user-facing label, to someone who doesn't know the word yet. Nobody asked whether the taxonomy labels are themselves at the right CEFR level or need EN glosses.

6. **Mode ↔ Domain redundancy.** The `work/personal/both` Mode lens already gates content. If you *also* surface the 6 Domains as a shelf, you now have **two overlapping "which part of life" controls.** Expert 1 gestures at "let Mode pre-select domains" but nobody resolved whether these collide. Design them together or you'll ship two controls that fight.

---

## 5. Single highest-leverage change vs. biggest waste

**Highest leverage: the facet coverage floor + delete Büro (both S).** This is a handful of lines in `facets.ts`. It **instantly removes the two loudest "amateur taxonomy" tells** (the 2-pill Branche, the 4-pill Situation) that every expert independently flagged as the #1 marketplace red flag, with zero content work, zero migration risk, and zero founder tagging. Nothing else on the list has that value-to-effort ratio. Ship it first, this week.

**Runner-up (best net-new value): generated frequency badge (M).** Machine-derivable, no hand-tagging, answers the founder's real question, uses assets already in the repo. But it must ship as a *badge + composition*, never a leaderboard.

**Biggest waste of effort: Expert 2's Task/Can-Do cross-cutting lens (L)** and **authoring per-industry Branche packs (L).** The first rebuilds navigation to solve a problem the four existing tabs mostly already solve; the second pours weeks of content work into an axis that is *off-strategy* for a deliberately sector-neutral exam product. Both are the kind of ambitious, defensible-on-paper work that would consume the founder's entire runway and leave the library looking exactly as "broken" as it does today, because neither touches the 2-pill facets that are the actual problem.

**One-line steering for the final report:** Stop trying to *complete* the taxonomy. Make it *stop looking broken* (coverage floor, kill Büro), surface the free structure you already have (Domain, and an SRS "was ich lerne" filter nobody proposed), add the one machine-derivable signal (frequency, as a badge), and refuse every recommendation that requires the founder to hand-tag hundreds of items or build a new navigation paradigm.