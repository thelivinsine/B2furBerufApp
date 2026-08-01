---
name: content
description: Genauly content-authoring workflow. MUST be loaded BEFORE adding or editing anything in src/data/* (vocabulary, collocations, Redemittel, grammar, Can-Do, texts, writing prompts, missions, themes, provenance). Encodes the schema rules, the required provenance row, the id-permanence law, and the exact gate order to run before pushing.
---

# Genauly content authoring

Full schema reference: `docs/areas/CONTENT.md`. Command detail: `docs/areas/COMMANDS.md`.

## Iron laws
1. **Shipped content ids are permanent.** Never rename or delete one; retire from the surface
   instead. Unavoidable rename → `ID_RENAMES` in `src/lib/idRenames.ts`, kept forever.
2. **Every new content_id gets a provenance row** in `src/data/provenance.ts` in the same edit
   (append to the LAST provenance part; `review_status: "draft"`, non-empty `reference`).
3. **Id prefixes are law:** v_ / c_ / g_ / sc_ / ex_ / r_ / cd_ / tx_ / m_ / wp_. Ids unique
   across ALL banks.
4. **Closed-enum rule:** a new union in `src/types/index.ts` is mirrored by a JS array +
   validate-when-present check in `scripts/lint-content.mjs`.
5. **No em dashes** in any copy. German content sourced against Goethe B2 Beruf / telc B2+ Beruf
   word fields; CoE CEFR descriptors are cited, never reproduced.
6. Big banks are SPLIT into concatenated array literals for the TS2590 limit (vocabulary: 2 parts;
   provenance: 4 since s182, ~1,300 rows each). Append to the LAST part, and split it again when
   `tsc` starts reporting TS2590 on that literal.
7. Nomen-Verb combos belong in Kollokationen, never as Wörter entries (the linter errors;
   retire via `RETIRED_VOCAB_IDS` if one slips through).
8. A new theme needs: `ThemeId` union + `THEME_IDS` in the linter, icon in `lib/icons.ts`,
   `ExamTheme` row (domain + context), ≥1 writing prompt, Can-Do coverage, a city-building
   mapping (see `docs/areas/CONTENT.md` §Themes), and full vocab/collocation/dialogue packs
   (`behoerde` is the reference template).

## Gate order (run in this sequence, fix, re-run)
1. `pnpm lint:content` — after EVERY content edit, always.
2. `pnpm build` — TypeScript + the help prerender must stay green.
3. Added nouns? `pnpm build:oracles` then `pnpm verify:facts`.
4. Added vocab/collocations? `pnpm build:frequency-subset` then `pnpm build:frequency`
   (`lint:content` errors on stale ids), optionally `pnpm verify:sentences` (warn-only).
5. Touched verification inputs? `pnpm verify:grammar` then `pnpm build:verification`.
6. Flipped rows to `verified`? `pnpm stamp:verified` in the SAME commit.
7. After larger additions: `pnpm report:exercise-coverage` + `pnpm build:review-queue` to
   refresh the reports the admin screens read.

## Review loop (do not weaken)
Founder decisions come back via `pnpm apply:reviews` (keyless decisions file from the /sources
workbench). A null or mismatched decision hash is re-review, never a flip; already-verified repo
rows are only ever marked applied; never re-stamp to silence a fingerprint mismatch. Only a
human flips `review_status`; AI review passes feed the `jury` tier sidecar instead
(`docs/reports/jury-review.json`).
