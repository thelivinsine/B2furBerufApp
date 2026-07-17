# Daily-life content scale-up plan (non-workplace domains)

**Created:** 2026-07-17 · **Branch:** `claude/scale-words-domains-qjv9x4` · **Status:** scoped, not started

## Why

The banks are workplace-heavy. Of 1,246 vocabulary items, **~78% (977) are `beruf`** (the 10 workplace
themes), and only ~22% cover daily life. Yet the session-21 repositioning made daily-life domains
**core, not optional** (see `CLAUDE.md` scope note). Two gaps follow from that:

1. **Depth gap** — the 5 existing daily-life themes are ~half as deep as the workplace themes.
2. **Coverage gap** — the whole `alltag` domain today is only bureaucratic (Behörde, Wohnen, Bank).
   The most common everyday situations (shopping, food, transport, leisure, digital life) have **no
   theme at all**.

### Current depth (2026-07-17)

| Domain | Theme | Vocab | Colloc | vs workplace avg (98 / 58) |
|---|---|---|---|---|
| beruf | 10 workplace themes | 977 total | 577 total | baseline |
| gesundheit | arzt | 74 | 56 | near parity |
| alltag | wohnen | 57 | 45 | thin |
| alltag | behoerde | 49 | 42 | thin |
| bildung | bildung | 46 | 39 | thin |
| alltag | bank | 43 | 38 | thinnest |

CEFR spread of existing daily-life vocab is healthy and B1–B2-centred (B1.2 + B2.1 dominate); new
content should match that centre of gravity, not drift up to C1.

---

## Phase A — Deepen the 5 existing daily-life themes (low risk, no taxonomy/UI change)

**Goal:** bring each existing daily-life theme to **~80 vocab / ~50 collocations**, balanced across its
4 sub-themes. Pure content addition into the existing banks; nothing structural changes.

### Per-theme targets

| Theme | Vocab now → target | Δ vocab | Colloc now → target | Δ colloc |
|---|---|---|---|---|
| bank | 43 → 80 | **+37** | 38 → 50 | +12 |
| bildung | 46 → 80 | **+34** | 39 → 50 | +11 |
| behoerde | 49 → 80 | **+31** | 42 → 50 | +8 |
| wohnen | 57 → 80 | **+23** | 45 → 50 | +5 |
| arzt | 74 → 80 | **+6** | 56 → 56 | 0 |
| **Total** | | **~+131 words** | | **~+36 pairs** |

### Per-item requirements (each new word / pair)
- Match the existing schema exactly; unique ids (`v_`/`c_` prefix pattern already in bank).
- `cefr` facet on every item, weighted B1.1–B2.2 (see spread above); `subThemeId` on every item,
  **spread evenly across the theme's 4 sub-themes** (fills the starved ones: e.g. `bank.karte` 9,
  `wohnen.suche` 8, `behoerde.bescheid` 8, `bildung.anerkennung` 7).
- No `sectors` tag (daily-life = universal). Nouns: article + plural. Two example sentences. No em dashes.
- **One `provenance.ts` row per new id** (append to `provenancePart2`), `review_status: "draft"`,
  non-empty `reference` (Wiktionary/DWDS for word facts, Tatoeba for sentences).

### Optional depth extras (only if a theme warrants it)
- +1 dialogue and/or +1 Lese-/Hörtext per theme where the current 2 feel thin.

### Gates (run after each theme, before shipping)
1. `pnpm lint:content` — ids, taxonomy, provenance completeness, em dashes.
2. `pnpm build:frequency` then `pnpm build:oracles` then `pnpm verify:facts` — refresh generated
   frequency map + morphology oracle subsets, then the der/die/das + plural fact gate.
3. `pnpm build` — full typecheck + build.
4. Optional warn-only: `pnpm verify:cefr`, `pnpm verify:grammar`.

**Suggested execution order (thinnest first):** bank → bildung → behoerde → wohnen → arzt. Ship each
theme as its own squash-merge to `main` so progress is incremental and reviewable.

---

## Phase B — Add new everyday-life themes (broaden `alltag`)

**Goal:** add the missing everyday situations so `alltag` is a real daily-life domain, not just
bureaucracy. Each new theme launches at the **`behoerde` reference pack** shape:

> ~49 vocab · ~42 collocations · 2 dialogues · 2 texts · 3 Can-Do · 1 writing prompt · full provenance.

### Proposed new themes (all `domain: alltag`, `context: personal`)

| # | ThemeId | Title (DE / EN) | Sub-themes (4) |
|---|---|---|---|
| 1 | `einkaufen` | Einkaufen & Geschäfte / Shopping & stores | supermarkt · kleidung · umtausch · online |
| 2 | `essen` | Essen & Restaurant / Food & dining | restaurant · bestellen · bezahlen · kochen |
| 3 | `mobilitaet` | Mobilität & Verkehr / Getting around | oepnv · ticket · auto · wegbeschreibung |
| 4 | `freizeit` | Freizeit & Soziales / Leisure & social life | hobbys · verabredung · smalltalk · veranstaltung |
| 5 | `digitales` | Handy, Internet & Digitales / Phone & internet | vertrag · internet · geraete · konto |

**Recommended wave split:** Wave 1 = `einkaufen`, `essen`, `mobilitaet` (most universally needed
daily). Wave 2 = `freizeit`, `digitales`. Sub-theme slugs above are a starting proposal, refine per
theme during authoring.

### Per-theme build checklist (the `behoerde` pack is the template)
For **each** new theme, in one PR:
1. **Types:** extend the `ThemeId` union in `src/types/index.ts` **and** the `THEME_IDS` array in
   `scripts/lint-content.mjs` (kept in sync — the linter enforces this).
2. **Icon:** register a lucide icon in `src/lib/icons.ts`.
3. **Theme record:** add to `src/data/themes.ts` matching the `ExamTheme` schema — `domain: "alltag"`,
   `context`, `subThemes[]` (4, bilingual titles), and the writing prompt requirement.
4. **Content banks:** ~49 vocab (`vocabularyPart2`) + ~42 collocations, spread across the 4 sub-themes,
   CEFR-tagged B1–B2, no `sectors`. 2 dialogues, 2 texts (`texts.ts`), 3 Can-Do (`canDo.ts`, ascending
   cefr/threshold, "Ich kann…" prefix), 1 writing prompt (`writingPrompts.ts`).
5. **Provenance:** one row per new content id in `provenance.ts` (`review_status: "draft"`).
6. **City building (optional, later):** the six domain buildings in
   `components/city/domain-buildings.tsx` map to domains via rollup, so new `alltag` themes fold under
   the existing `alltag`/`wohnen` building automatically — no new SVG required unless we want one.
7. **Gates:** same as Phase A (`lint:content` → frequency/oracles/verify:facts → `build`).

### Locked success metric (carried from the game layer's data-not-code rule)
Adding a new theme should touch **only** `types/index.ts`, `lint-content.mjs`, `icons.ts`, and the
`src/data/*` banks — no feature/component code. If it needs component changes, something regressed the
faceted taxonomy; stop and reconsider.

---

## Sizing & sequencing summary

| Chunk | Rough size | Ships as |
|---|---|---|
| Phase A · bank | +37 vocab / +12 colloc | 1 PR |
| Phase A · bildung | +34 / +11 | 1 PR |
| Phase A · behoerde | +31 / +8 | 1 PR |
| Phase A · wohnen | +23 / +5 | 1 PR |
| Phase A · arzt | +6 / 0 | fold into wohnen PR |
| Phase B · Wave 1 | 3 new themes × full pack | 3 PRs (1/theme) |
| Phase B · Wave 2 | 2 new themes × full pack | 2 PRs (1/theme) |

Phase A first (balances what exists, zero structural risk), then Phase B (broadens the product). Each
theme/PR is independently shippable and deploys on squash-merge to `main`.

## Docs to update on completion
- `CLAUDE.md` content counts (vocabulary/collocations totals, theme list, domain-populated note).
- `docs/PROJECT_STATUS.md` (session log, content counts, Resume-here) + `docs/SESSION_PROMPT_LOG.md`.
