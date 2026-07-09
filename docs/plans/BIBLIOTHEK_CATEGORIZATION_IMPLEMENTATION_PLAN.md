# Bibliothek Categorization: Implementation Plan

_Last updated: 2026-07-09 · Branch: `claude/bibliothek-categorization-analysis-mtqo5o`_

Companion to **`docs/plans/BIBLIOTHEK_CATEGORIZATION_AUDIT_2026-07-09.md`** (the findings). This is the
scoped build plan for the top priorities, grounded in the real code. Each unit below is one shippable PR
with exact files, edge cases, backwards-compat, gates, and effort. Effort is engineering effort; content
review by hand is called out separately.

## Two corrections to the audit (found while grounding this plan)

1. **Kollokationen already has a Thema dropdown.** `CollocationsBrowser.tsx` passes a `primary` Select with
   all themes to `BrowseToolbar`. The audit's "add the Thema dropdown to Kollokationen" is therefore wrong.
   The real parity gaps vs Wörter are (a) no option **counts** on that dropdown and (b) no **sub-theme
   picker** (collocations carry 250 `subThemeId` tags and `collocationsBySubTheme` exists, so it is
   feasible). Rescoped into PR 5.
2. **`ui/select` does not re-export `SelectGroup`/`SelectLabel`.** The Domain-grouped dropdown (PR 4) needs
   those Radix primitives added to `src/components/ui/select.tsx` first. Small, but not free.

## Sequencing

| PR | Title | Decision-gated? | Ships value | Effort |
| --- | --- | --- | --- | --- |
| **1** | Stop looking broken | No, ship now | Retires both broken filters, removes "Büro" | **S** |
| **2** | Grammar joins the toolbar | No | Search + group filter on Grammatik | **S** |
| **3** | Frequency signal | Chart part gated by decision 3 | "Learn this first" badge + facet | **M** |
| **4** | Free structure: Domain + SRS | Domain layering gated by decision 4 | The two highest-value axes | **M–L** |
| **5** | Polish batch | No | Visual bugs, register fold, Kollok parity | **S–M** |

Recommended order: **1 → 2 → 5 → 3 → 4**. PR 1 alone makes the library read as finished, so ship it first
and standalone. PRs 1, 2, 5 need no founder decisions.

Every PR must pass the CI gate before merge: `pnpm build`, `pnpm lint:content`, `pnpm test:unit`,
`pnpm lint`, and (PR 5, after bundle-affecting work) `pnpm check:bundle`. No em dashes in any new
user-facing copy; eyebrow ≤ 2 words, title ≤ 5 words.

---

## PR 1 — Stop looking broken (P0)

**Goal.** Remove the two filters that read as amateur (Branche at 4%, Situation at 2.2%) and delete the
"Büro" category error, with zero content authoring and no migration risk. After this, Wörter's facets are
just CEFR + Wortart, and no near-empty facet renders anywhere.

### 1a. Facet coverage floor (`src/lib/facets.ts`)
The single highest-leverage change. Today `facet()` only hides *empty options*; it will still render a
facet where just one value is populated. Add a coverage floor so a whole facet hides when the bank barely
uses it.

- Add a constant `MIN_FACET_COVERAGE = 0.15` (a facet must be tagged on ≥15% of the bank) and keep a
  distinct-values guard of ≥2 populated values.
- Implement as a small filter applied where each accessor assembles its array, so `facet()`'s return type
  stays `FacetDef<T>`:
  ```ts
  function passesFloor<T>(f: FacetDef<T>, items: T[]): boolean {
    const present = items.map((i) => f.get(i)).filter((v) => v !== undefined);
    const distinct = new Set(present).size;
    return distinct >= 2 && present.length / items.length >= MIN_FACET_COVERAGE;
  }
  ```
- `vocabFacets(mode)` returns `[VOCAB_CEFR, VOCAB_POS, VOCAB_SECTOR, VOCAB_SITUATION].filter((f) => passesFloor(f, vocabulary))`.
  Drop the `mode==='work'` branch entirely (the floor now decides visibility, not the mode lens). This is
  what the audit means by "visibility follows coverage, not mode."
- Coverage is computed over the **full bank** (module-level `vocabulary`/`collocations`), not the current
  scope, so facets do not flicker on/off as the learner narrows a theme.
- **Check it keeps the right facets:** CEFR (100%), Wortart (100%), Register on collocations (~100%, 2
  values) all pass; sector (4%) and workSituation (2.2%) both fail and disappear. Register survives the ≥2
  guard because neutral + formal are both present.

### 1b. Delete "Büro" from the industry axis
`office` is a workplace, not an industry. No code outside the data/types/facets reads it (verified;
`provenance.ts` only mentions `sector=care` as prose).

- `src/types/index.ts`: remove `"office"` from the `WorkSector` union.
- `scripts/lint-content.mjs`: remove `"office"` from the `WORK_SECTORS` mirror (line ~63).
- `src/lib/facets.ts`: remove the `{ value: "office", label: "Büro" }` row from `SECTOR_OPTIONS`.
- `src/data/vocabulary.ts`: delete the `sector: "office"` field from the 11 words that carry it:
  `v_besprechung, v_tagesordnung, v_protokoll, v_frist, v_sitzung, v_meeting, v_abstimmung, v_beschluss,
  v_bericht, v_deadline, v_moderation`. They keep their `themeId`, so they still appear under their theme.
- Result: `sector` now has only `care` (15 words), which the PR 1a floor hides. Branche is gone from the UI
  but the field survives for a future deep sector pack (per decision 1).

### 1c. Retire the Situation facet
`workSituation` duplicates Thema and collides by name (`meeting` vs theme `meetings`). No consumer outside
the data/types/facets (verified), so it can be removed cleanly.

- `src/lib/facets.ts`: delete `SITUATION_OPTIONS`, `VOCAB_SITUATION`, and its entries in `vocabFacets` and
  `VOCAB_FACET_IDS`.
- `src/types/index.ts`: remove the `WorkSituation` union and the `workSituation?` field from `VocabItem`
  (and from the Collocation interface if present).
- `scripts/lint-content.mjs`: remove the `WORK_SITUATIONS` mirror and both validate-when-present lines
  (vocab ~L214, collocation ~L238).
- `src/data/vocabulary.ts`: strip `workSituation: "..."` from the 14 words that carry it (`v_sitzung,
  v_meeting, v_beraten, v_beratung, v_vorschrift, v_schutz, v_gefahr, v_schicht, v_schichtdienst,
  v_uebergabe, v_hygiene, v_desinfektion, v_schutzkleidung, v_fallbesprechung`). Their real situational
  meaning is already carried by `subThemeId` where it matters, so no information is lost that the topic
  spine does not already hold.

### Backwards-compat
- Old deep links `?sector=` / `?workSituation=` stop being parsed because they are dropped from
  `VOCAB_FACET_IDS`; unknown params are simply ignored by `useSearchParams`, so no crash. No persisted
  facet state exists (facets live in the URL, not the settings store), so no migration needed.

### Gates
`pnpm build`, `pnpm lint:content` (enum mirrors must match the unions or it errors), `pnpm test:unit`,
`pnpm typecheck`. Effort **S**.

---

## PR 2 — Grammar joins the toolbar (P1, no new data)

**Goal.** Give Grammatik the same `[Search] [Primary ▾]` shape as the other tabs and order the 10 topics by
what actually throttles B2 output. No schema change (the per-card CEFR badge is deferred to a later PR
because it needs a new field).

- `src/features/grammar/GrammarHub.tsx`: mount `BrowseToolbar` with:
  - **Search** over `titleDe`, `title`, `purposeDe`, and `pattern` (client-side `normalise` filter, same
    helper the other pages use).
  - **Primary dropdown** = grammar `group` (`groupMeta` already has German labels), plus an "Alle" option,
    with per-group counts.
  - No facet sheet (10 items do not warrant one; pass `facets={[]}` or omit the Filter chip).
- Reorder `groupOrder` by B2 priority: `connectors, konjunktiv2, passive, subordinate, relativeClauses,
  cases, verbPosition, prepositionalPronouns, modals, collocations` (Konnektoren / Konjunktiv II / Passiv
  are the strongest B2 markers). Confirm exact order with the founder if desired; it is a copy-level call.
- Keep the existing grouped card grid; filter the flattened topic list by search + selected group.
- Optional follow-on (not this PR): link the reordered topics from the Fortschritt weakness/diagnose card
  so grammar answers "which rule is holding my output back."

### Gates
`pnpm build`, `pnpm test:unit`, `pnpm lint`. Effort **S**.

---

## PR 3 — Frequency: the "learn this first" signal (P1)

**Goal.** Turn the already-vendored wordfreq data into a shipped per-word usefulness signal: a
`Häufigkeit` badge and a 3-pill facet. This is the one net-new feature, and it needs zero hand-tagging.
Model it exactly on the `verification.ts` generated-file precedent.

### 3a. Generate the map
- New `scripts/build-frequency.mjs`, modeled on `scripts/build-verification.mjs`. It:
  - reads `scripts/vendor/german-frequency-subset.json` (`freq: { headword: zipf }`),
  - reuses the headword-extraction already in `scripts/build-frequency-subset.mjs` (strip the article from
    a noun `de` like "die Sitzung" → "Sitzung"; use verbs/adjectives as-is) to key each vocab + collocation
    `content_id` to a Zipf value,
  - bins Zipf: `core` ≥ 4.5, `common` 3.5–4.5, `specialized` 1.5–3.5,
  - **OOV / compound fallback (the critical correctness rule):** Zipf 0, missing headword, or a compound
    whose base token is absent → **leave the bin undefined** (do not guess "specialized"). Untagged items
    roll up normally.
  - writes generated `src/data/frequency.ts`:
    `export const frequency: Record<string, { bin: Frequency; zipf: number }> = { ... }` with a
    do-not-edit header and a `frequencyGeneratedAt` date.
- Add `"build:frequency": "node scripts/build-frequency.mjs"` to `package.json`. Add it to the docs list in
  `CLAUDE.md` (Commands section).
- `Frequency` union (`core/common/specialized`) and the `FREQUENCIES` lint mirror **already exist**; no type
  change.

### 3b. Wire the facet + badge
- `src/lib/facets.ts`: add a `Häufigkeit` facet for vocab and collocations whose `get(item)` reads
  `frequency[item.id]?.bin`. German labels: `core → "Kernwortschatz"`, `common → "häufig"`,
  `specialized → "Fachsprache"`. 3 options, well under the ≤12 rule; it passes the PR 1a floor only once
  coverage ≥ 15% (the curated bank should clear this easily for the common bins; verify after generation).
- `src/features/vocabulary/VocabList.tsx` (and the collocation card): a small muted badge showing the bin.
  Keep it quiet; it is metadata, not content.
- `scripts/lint-content.mjs`: optional check that every key in `frequency.ts` resolves to a real
  `content_id` (guards against a stale generated file).

### 3c. Composition chart (OPTIONAL, gated by decision 3)
Only if the founder wants the study-planner view. In `src/features/analytics/Analytics.tsx` (already uses
recharts), one honest bar/stacked chart "dein Wortschatz nach Häufigkeit," ideally overlaid with FSRS
mastery (`cardLevel`) so it reads as "high-value words not yet learned," tap deep-links to the word. Lazy
route, so no main-chunk cost. **Never** label it "die häufigsten deutschen Wörter"; the axis is
Häufigkeit, not Wichtigkeit.

### Provenance / bundle
Frequencies are uncopyrightable facts (wordfreq Apache-2.0/MIT). The generated file rides the existing
per-item provenance rows (it is a derived attribute, like `verification.ts`); add one dataset credit note
in `DATA_GOVERNANCE.md` + a header credit in `frequency.ts`. ~1.2k tiny entries gzip to a few KB, offline,
no runtime fetch. Keep the import off eager/Dashboard code (Library + Analytics are lazy) so the 400 kB
main-chunk budget is untouched; run `pnpm check:bundle` after.

### Gates
`pnpm build`, `pnpm lint:content`, `pnpm test:unit`, `pnpm check:bundle`. Effort **M**.

---

## PR 4 — Free structure: Domain spine + SRS-state filter (P1)

**Goal.** Surface the two highest-value axes that need no tagging: the Domain layer you already own, and a
"where am I in learning this" filter from FSRS data already on every card.

### 4a. Surface Domain as the spine (gated by decision 4)
- `src/components/ui/select.tsx`: re-export Radix `SelectGroup` + `SelectLabel` (they exist in
  `@radix-ui/react-select`, just not surfaced by the wrapper).
- `src/features/shared/BrowseToolbar.tsx`: extend `PrimaryOption` to allow a grouped shape
  (`{ group: string; options: PrimaryOption[] }[]`) and render `SelectGroup`/`SelectLabel` when grouped.
  Keep the flat shape working for the other tabs.
- Wörter + Kollokationen: build the theme dropdown grouped by `domain` (from `domains.ts`, `titleDe` as the
  group header; `domainById`/theme `domain` already exist). This makes "Alltag: Bank" read as an errand and
  kills the topic-vs-industry ambiguity for free.
- **Design with Mode, not against it (decision 4):** let the `mode` lens pre-select which domains show
  (work modes show Beruf/Arbeitswelt/Prüfung; personal shows Alltag/Gesundheit; `both` shows all). Confirm
  the founder wants Mode to stay the top lens with Domain as the in-library spine underneath.

### 4b. SRS-state filter (decision-independent, recommended)
This is **not** a content facet: SRS state is per-learner and lives in the store, so it cannot use a pure
`get(item)`. Follow the existing "Gespeichert" pattern (a toolbar toggle with `?saved=1`, applied outside
the facet registry).

- Wörter only (SRS cards are vocab-only: `useProgressStore.srs` is `vocabId → SrsCard`; collocations have no
  cards).
- Add a small toolbar control (segmented or a compact Select) writing `?srs=neu|lerne|gemeistert` (optional
  4th: `faellig`).
- Apply after facets, in `VocabularyTrainer`, using `useProgressStore.srs` + `engine/collection.ts`
  `cardLevel(card)`:
  - `neu` = level 0 (never reviewed), `lerne` = level 1–2, `gemeistert` = level 3–5.
  - optional `faellig` = card `due` ≤ now (needs the card's due date; skip if scoping tight).
- German labels, no em dashes. This is the single most valuable filter for a returning learner and needs no
  tagging.

### Gates
`pnpm build`, `pnpm test:unit`, `pnpm lint`. Effort **M–L** (4a medium, 4b medium).

---

## PR 5 — Polish batch (P1)

Small, mostly cosmetic, no decisions. Group them so the library reads finished.

- **Fold `diplomatic` register into `formal`** (0 collocations, 5 Redemittel): retag the 5 Redemittel to
  `formal`, drop `"diplomatic"` from the register unions/labels (`types/index.ts`, `facets.ts`,
  `RedemittelTrainer.tsx` `registerLabel`, `CollocationsBrowser` badge). Note: this is a real content edit
  on 5 items, still trivial. If the founder prefers to keep the diplomatic tier for the Behörde future,
  skip this bullet.
- **Redemittel:** drop the inner `Wendungen / Üben` segmented control; use the trailing "Üben → /session"
  button like the other tabs. Refactor the `category === 'all'` branch to reuse the single filtered result
  instead of re-implementing search + facet inline. Render Register as an inline chip row (3 chips), not a
  bottom sheet, since it is the only dimension there.
- **Kollokationen parity:** add per-option counts to the Thema dropdown (`primaryOptions` currently has no
  `count`); add the `SubThemePicker` (it already counts collocations via `collocationsBySubTheme`).
- **A11y / tidy:** `aria-label` on the `BrowseToolbar` search input; hide the "0" on disabled facet pills
  (or show it only on enabled ones); drop the redundant `ScopeChip` when the primary dropdown already shows
  the theme; remove the section-description line under `SubThemePicker` (microcopy budget).
- **Visible level default (can split to its own P2):** replace the tiny "Auch B2.2 · C1 zeigen (N)" text
  link with a muted, removable `ActiveFilterChip` in the toolbar, e.g. `Stufe: bis B2.1 (x)`, so the silent
  cut becomes an explicit filter and gains a real tap target.

### Gates
`pnpm build`, `pnpm lint:content`, `pnpm test:unit`, `pnpm lint`, `pnpm check:bundle`. Effort **S–M**.

---

## Deliberately NOT in this plan (decision-gated or deferred)

- **Redemittel CEFR backfill** (audit P1, content): ~82 items, AI-draft then founder review through the
  provenance draft→verified + `verify:facts` pipeline. Gated by **decision 2**. Note the behavior change:
  once tagged, the CEFR band-default starts hiding phrases that currently all pass. Do **not** add
  `themeId` (cross-cutting phrases; false precision). Its own PR once decided.
- **`GrammarTopic.cefr` field + per-card badge** (audit P2): one genuinely new schema field + lint mirror +
  tag 10 topics. Follows PR 2.
- **Register 4-band / Amtssprache + politeness axis** (decision 5): weeks of hand re-judgment on 540 + 82
  items. Parked.
- **Branche as a real sector** / per-industry packs, and a Task/Can-Do cross-cutting browse engine: both
  rejected in the audit as off-strategy or over-build.

## Founder decisions — ALL LOCKED (2026-07-09)
1. **Branche: PARKED.** `sector` stays as a hidden data field (with the 15 Pflege tags); the facet sits
   below the coverage floor until an industry has real depth. Not cut, no Pflege pack authored now.
2. **Redemittel CEFR backfill: YES.** AI-draft all ~82 tags, founder reviews. No `themeId` either way.
3. **Frequency: badge + chart.** Ship the Häufigkeit badge/facet AND the Fortschritt composition chart
   (FSRS-overlaid).
4. **Domain/Mode: Mode on top.** Mode stays the app-wide lens and pre-selects which domains show; the
   library theme dropdown groups by Domain underneath.
5. **Amtssprache/politeness axis: PARKED** (no objection raised; revisit when Behörde content grows).

Build status: **ALL UNITS SHIPPED 2026-07-09** (same session as the decisions):
- **PR 1** (#379): coverage floor `MIN_FACET_COVERAGE`/`MIN_FACET_VALUES` in `lib/facets.ts`, mode
  gating removed, `office` deleted (+11 word tags), `WorkSituation` retired (+14 tags stripped, linter
  errors on reintroduction).
- **PR 2** (#380): Grammatik gets BrowseToolbar (search + Gruppe dropdown with counts, no facet sheet),
  B2-priority topic order; FacetSheet renders nothing at 0 facet groups.
- **PR 5** (#381): diplomatic register folded into formal; Redemittel inner tabs dropped + single filter
  pipeline + inline register chips; Kollokationen dropdown counts + SubThemePicker; visible removable
  "Stufe: bis X" chip on all three list tabs; a11y/microcopy tidy.
- **PR 3** (#382): generated `src/data/frequency.ts` via `pnpm build:frequency` (1116/1182 binned, 66
  compounds honestly unbinned), Häufigkeit facet + card label, Fortschritt "Wortschatz nach Häufigkeit"
  chart with mastery overlay + tap deep-link. Also fixed the pre-existing black-charts bug (all
  Analytics charts referenced non-existent `var(--color-*)` vars).
- **PR 4** (#383): Domain-grouped theme dropdown on Wörter + Kollokationen (`lib/themeGroups.ts`; Mode
  pre-selects domains per decision 4; SelectGroup/SelectLabel added to ui/select), and the per-learner
  **Lernstand** facet (`?srs=`, values mirror the card badges).
- **Redemittel CEFR backfill** (final PR): all 72 phrases AI-draft-tagged (A2 3 · B1.1 19 · B1.2 27 ·
  B2.1 20 · B2.2 3), founder review pending; the level band-default is now live on the tab (a B1
  learner's default hides only the 3 B2.2 phrases) and each card shows its level badge for review.
