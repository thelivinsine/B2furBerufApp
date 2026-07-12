# Branche filter overhaul: hierarchy, multi-sector tagging, new industries

_Status: **IMPLEMENTED in session 102 (2026-07-12)**, one day after approval, because the founder
named the Branche filter a core feature of the next-day presentation. All six sections shipped:
`sectors[]` migration + linter guard, `matchesSector` scope semantics, the FilterRail `scopes[]`
hierarchy, the 562-item retag audit (report: `docs/reports/sector-audit-report.md`), the 4 new
sector packs + Logistik boost, and the Branche chips. E2E-verified per §Verification (das Projekt
visible under IT and Bau; der Bauzaun construction-only)._

## Context

Three founder-reported problems in the Bibliothek Branche (sector) filter:

1. **Common words disappear under Branche filters.** Root cause: `sector` is a single optional
   value (`sector?: WorkSector`) and only ~406/1,022 words + 165/701 collocations carry one (the
   s94/95 starter packs). The facet filter is strict: selecting any Branche hides every untagged
   word (das Projekt, der Termin, ...) and shows a tagged cross-industry word under exactly one
   industry (die Wartung only under Produktion, das Werkzeug only under Handwerk). The founder's
   "das Projekt reads as IT-only" report is one symptom of this systemic issue, not a per-word
   data bug. The fix must be structural.
2. **Filter hierarchy:** Branche should be a dropdown, and the scope order should be
   **Branche → Thema → Unterthema** (all three as dropdowns). Today Branche is a pill facet
   rendered last; Thema/Unterthema are already dropdowns.
3. **Missing industries:** no Chemie/Kunststoff, Pharma, Reinigung, Sicherheit; Logistik/Lager is
   only implicit under Transport. Founder decision (session 99, via AskUserQuestion): add ALL of
   these, with **Pharma separate from Chemie**, and give each new sector a **full starter pack**
   (~20 words + ~9 collocations, the established s94 pattern).

## Design

### 1. Data model: `sector` becomes `sectors: WorkSector[]` (untagged = universal)

- `src/types/index.ts`: replace `sector?: WorkSector` with `sectors?: WorkSector[]` on `VocabItem`,
  `Collocation`, and `ReadingText`. Semantics: **absent/empty = general vocabulary, applicable in
  every Branche; present = notably specific to those sectors (typically 1 to 4).**
- Extend the `WorkSector` union with 4 new values: `chemicals` (Chemie & Kunststoff), `pharma`
  (Pharma & Medizintechnik), `cleaning` (Reinigung), `security` (Sicherheitsdienste), giving 15
  total. Relabel `transport` to "Transport & Logistik".
- Mechanical migration of all data files first (`sector: "x"` → `sectors: ["x"]` in
  `vocabulary.ts`, `collocations.ts`, `texts.ts`), then the audit pass (§4) widens/narrows tags.
- `scripts/lint-content.mjs`: extend `WORK_SECTORS`; validate `sectors` when present (array,
  non-empty, unique, all values in the enum) on vocab/collocations/texts; **error if a singular
  `sector` field reappears** (same guard pattern as the retired `workSituation`).

### 2. Filter semantics (the root-cause fix)

- New pure helper `matchesSector(item, sector)` in `src/lib/facets.ts`:
  `!sector || !item.sectors?.length || item.sectors.includes(sector)`. Untagged words are visible
  under every Branche; tagged words are hidden only under OTHER Branchen.
- Apply it as a **scope filter** (like theme/sub) in `VocabularyTrainer.tsx` (before the existing
  `filterVocab` → search → band → `applyFacets` chain) and in `CollocationsBrowser.tsx`.
- **Remove Branche from the pill facets:** drop `VOCAB_SECTOR` from `ALL_VOCAB_FACETS` and the
  collocation sector facet in `facets.ts`. Keep `SECTOR_OPTIONS` as the exported label source for
  the dropdown and card chips. Remove `"sector"` from `VOCAB_FACET_IDS`/`COLLOCATION_FACET_IDS`;
  `?sector=` becomes a single-value scope param (old comma-list URLs degrade to the first value).
- When a Branche is selected, **sort sector-tagged items first** so the learner's Fachwörter lead
  the list and the general words follow.
- The 15% coverage floor (`passesFloor`) and the 12-option facet cap no longer apply to Branche
  (it is a scope, not a facet). That is what makes 15 sectors possible.

### 3. FilterRail hierarchy: Branche → Thema → Unterthema

- `src/features/shared/FilterRail.tsx`: generalize the two hardcoded scope slots
  (`primary`/`secondary`, rendered by `scopeSelect` in `filterBody`) into an ordered
  **`scopes: RailPrimary[]`** array (each with a stable `pinId` for the existing pin persistence).
  Update the collapsed pinned-body block too.
- Call sites: Wörter + Kollokationen pass `[Branche, Thema, Unterthema?]` (Unterthema still only
  when the active theme has sub-themes); Redemittel (`[Kategorie]`) and Grammatik (`[Gruppe]`)
  keep their current behavior.
- Branche dropdown: "Alle Branchen" default plus 15 options with counts = number of sector-tagged
  items per Branche in the current scope (the dedicated-content signal; zero-count sectors stay
  selectable because general words always show).

### 4. Retag audit of the existing 571 tagged items

- Review every tagged word/collocation and re-tag by the rule: **a tag means notably
  sector-specific, typically 1 to 4 sectors; applicable to 5+ sectors means untag (general).**
  Examples: die Wartung → `["production", "trades", "engineering", "chemicals"]`; der Schichtplan →
  untag or tag wide; der Bauzaun stays `["construction"]`.
- Emit `docs/reports/sector-audit-report.md`: every item with old → new sectors plus a one-line
  rationale, grouped by decision (widened / narrowed / untagged / unchanged), for founder review.
  This is the human-verification artifact.
- Also multi-tag existing relevant words INTO the new sectors (e.g. Produktion/Labor words into
  chemicals/pharma) during the same pass.

### 5. New content: 4 starter packs + Logistik boost

Follow the established s94 pack pattern in `src/data/vocabulary.ts` ("Branche = where you work,
Thema = what you are doing"):
- **chemicals, pharma, cleaning, security**: ~20 words + ~9 collocations each, spread across the
  existing themes, with `cefr`, `sectors`, examples, and related terms.
- **transport/Logistik boost**: ~10 Lager words (Gabelstapler, Kommissionierung, Wareneingang,
  Palette, Lieferschein, ...) plus ~4 collocations.
- Roughly 90 new words + 40 new collocations in total; one provenance row each appended to
  `provenancePart2` in `src/data/provenance.ts` (`review_status: "draft"`, non-empty `reference`).
- Update the content counts in `CLAUDE.md` (and the Branche facet notes there, which this plan
  makes stale: the "floor watch" rule no longer applies once Branche is a scope).

### 6. Card-level Branche visibility

Small addition so applicability is inspectable (the founder tried to check das Projekt's Branche
and there is currently no sector display anywhere in the UI): render Branche chips (labels from
`SECTOR_OPTIONS`) on tagged items in the Wörter **Tabelle** view (`vocabulary/VocabViews.tsx`, new
sortable column) and on the Karten card; untagged items show nothing (= general). Same for the
Kollokationen Tabelle.

## Files to modify

| Area | Files |
|---|---|
| Types + enum | `src/types/index.ts` |
| Data | `src/data/vocabulary.ts`, `collocations.ts`, `texts.ts`, `provenance.ts` |
| Filter logic | `src/lib/facets.ts` |
| UI | `src/features/shared/FilterRail.tsx`, `features/vocabulary/VocabularyTrainer.tsx` + `VocabViews.tsx`, `features/collocations/CollocationsBrowser.tsx` + `CollocationViews.tsx` |
| Gates | `scripts/lint-content.mjs`, new `tests/sectors.test.ts` |
| Docs | `CLAUDE.md`, `docs/reports/sector-audit-report.md` (new), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, note in `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` |

Reuse, do not rebuild: `applyFacets`/`matchesFacets` (`FacetSheet.tsx`) stay untouched because
sector leaves the facet system; `scopeSelect` + pin persistence in FilterRail; the `SECTOR_OPTIONS`
label map; the `filterVocab`/`vocabBySubTheme` helpers; the s94 pack + provenance append patterns.

## Verification

1. **Unit tests** (new `tests/sectors.test.ts`): `matchesSector` semantics (untagged visible under
   every Branche; single-tag hidden under other Branchen; multi-tag visible under each of its
   sectors), the sector-first sort, and a regression fixture: `v_projekt` (untagged) passes for
   all 15 sectors, `v_bauzaun` only for construction.
2. **Gates**: `pnpm lint:content` (new sectors-array checks + provenance completeness),
   `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm build`, `pnpm check:bundle`.
3. **Fact/frequency tooling (best-effort, network-dependent)**: `pnpm build:oracles` +
   `pnpm verify:facts` for the ~90 new nouns; `pnpm build:frequency-subset` +
   `pnpm build:frequency`. If the sandbox lacks Python `wordfreq` or network, new words simply
   have no Häufigkeit bin (the linter only errors on STALE frequency ids, verified in s99), so
   flag the regeneration as a founder follow-up instead of blocking.
4. **End-to-end** (dev server + browser): the Wörter tab shows dropdown order Branche → Thema →
   Unterthema; select "IT & Software" and confirm **das Projekt is visible** while Bau-only words
   are not; select "Bau & Architektur" and confirm der Bauzaun is visible and der Sprint hidden;
   "Alle Branchen" restores everything; each new sector (Chemie & Kunststoff, Pharma & Medizintechnik,
   Reinigung, Sicherheitsdienste, Transport & Logistik) lists its pack; the same checks on
   Kollokationen; `?sector=` round-trips through the URL; the mobile filter panel layout is intact.
5. **Human review artifact**: `docs/reports/sector-audit-report.md` for the founder to approve the
   retag decisions.

## Ship

PR into `main`, squash-merge per the auto-ship preference, then the post-merge branch realignment.
Docs updated in the same PR.
