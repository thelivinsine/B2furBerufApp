# Bibliothek Scale-Up Plan: Branchen-Fachwortschatz für alle Berufsfelder

_Created 2026-07-12 (session 94). Founder decision: activate the sector (Branche) axis._

## 1. Why (the founder decision, superseding the 2026-07-09 audit)

The categorization audit (`docs/plans/BIBLIOTHEK_CATEGORIZATION_AUDIT_2026-07-09.md` §5, §11 Q1)
parked the `sector` facet: at the time it covered 15 of 642 words (2 values), and per-industry
packs were judged off-strategy for a sector-neutral exam product.

**On 2026-07-12 the founder un-parked it.** The product context changed with the session-21
repositioning: Genauly is no longer only exam prep. It targets the B1–B2 plateau for working
professionals, and its users (starting with the founder's German course, which spans architecture,
software engineering, material science, mechanical engineering, manufacturing, gastronomy, beauty,
medicine, sports and transportation) need the app to be their **single source of truth for
vocabulary, Redemittel, collocations and grammar** in THEIR working life, after the course ends.
A library that only speaks office-German cannot be that. The audit's own design held up: the
coverage floor in `src/lib/facets.ts` was built so that "when a dimension (e.g. a future sector
pack) crosses the floor, its facet reappears on its own". Wave 1 crosses it.

The audit's role rule stays law: **Branche = where you work, Thema = what you are doing.** Sector
packs are TAGS spread across existing themes (the care-pack pattern), never new themes, and no
label is reused across the two axes.

## 2. The sector taxonomy (11 values, within the ≤12-option rule)

| value | label (DE) | covers |
|---|---|---|
| `care` | Medizin & Pflege | medicine, nursing, care |
| `it` | IT & Software | software engineering, IT ops |
| `trades` | Handwerk | plumbing, electrics, carpentry, crafts |
| `retail` | Handel | retail and wholesale |
| `hospitality` | Gastronomie | restaurants, hotels, catering |
| `engineering` | Ingenieurwesen | mechanical engineering, material science |
| `construction` | Bau & Architektur | architecture, civil engineering, building |
| `production` | Produktion & Fertigung | manufacturing and production |
| `transport` | Transport & Verkehr | logistics driving, passenger transport |
| `beauty` | Beauty & Kosmetik | hairdressing, cosmetics, personal care |
| `sports` | Sport & Fitness | trainers, gyms, clubs |

Adding a 12th sector later is fine; a 13th requires either merging two or promoting Branche from
pills to a dropdown (discuss with the founder first). Enum lives in `src/types/index.ts`
(`WorkSector`), mirrored in `scripts/lint-content.mjs` (`WORK_SECTORS`), labels in
`src/lib/facets.ts` (`SECTOR_OPTIONS`).

## 3. Wave 1 — starter packs (SHIPPED in this session)

- **+220 vocabulary items** (20 per sector; care extends the existing 15-item Pflege pack):
  bank 642 → 862, sector coverage 235/862 = **27%** (floor: 15% across ≥2 values → visible).
- **+96 collocations** authored + 3 existing entries tagged (`c_sicherheitsluecke_schliessen`,
  `c_backup_erstellen` → it; `c_bestand_pruefen` → retail): bank 540 → 636, coverage 99/636 =
  **15.6%** (just above the floor: when adding untagged collocations, add tagged ones too or the
  facet hides itself again — the floor is computed over the whole bank).
- **+12 Redemittel** in the new `professionalIntro` category ("Über Beruf & Fachgebiet sprechen"):
  sector-NEUTRAL by design. Per the audit, Redemittel are cross-cutting speech acts; they get no
  `sector` or `themeId` field. What professionals need is phrases to talk ABOUT their field, which
  is what this category delivers.
- **UI: zero new surface.** The Branche facet appears automatically in the FilterRail on Wörter
  and Kollokationen (pills with live counts, `?sector=` URL param) because coverage now clears
  `MIN_FACET_COVERAGE`. Grammatik stays sector-free (grammar is universal).
- Every item: full schema (article/plural on nouns, 2 authored examples, `cefr`, related terms),
  one provenance row (`origin: authored`, DWDS corpus-search reference, `review_status: draft`).

## 4. Wave 2 — depth where it is used (next 2–4 sessions)

Target: the 3–5 sectors with real users (start with the course classmates' feedback after the
2026-07-13 presentation) grow from 20 to **60–80 words + 25–35 collocations** each.

Per-sector deepening checklist:
1. Vocab to 60–80, keeping the theme spread (a sector pack must never collapse into one theme).
2. Collocations to 25–35 (the Nomen-Verb pairs are the highest-value B2 asset).
3. **1–2 `ReadingText`s per sector** (`src/data/texts.ts`): an authentic-style workplace text
   (Dienstplan-Aushang, Wartungsprotokoll-Memo, Baustellenordnung, Hygieneschulung-Einladung),
   each with 2–3 comprehension checks. Texts carry `themeId`, not sector, until a `sector` field
   is added to `ReadingText` (do that when the first sector text lands; mirror in the linter).
4. Re-run the full data pipeline (§7) and check the Häufigkeit distribution: sector Fachwörter
   legitimately skew "specialized"/no-bin; that is correct, never force-bin them.

Prioritization signal order: (1) direct user requests, (2) which `?sector=` filters get used
(no analytics yet, so ask users directly), (3) German labour-market size of the sector.

## 5. Wave 3 — Redemittel as a professional phrasebook (72 → ~150)

The thinnest bank. Growth is by **speech-act category**, never by sector:
- `telephoning` (Telefonieren: anrufen, verbinden, Rückruf, Anrufbeantworter)
- `emails` (E-Mails schreiben: Betreff, Anrede, Bezug nehmen, Anhang, Grußformel)
- `presentations` (Präsentieren: einleiten, Folien, Zwischenfragen, zusammenfassen)
- `jobInterview` (Vorstellungsgespräch: Stärken, Erfahrung, Rückfragen, Gehalt)
- `smallTalk` (Small Talk am Arbeitsplatz: Pausengespräche, Wochenende, Wetter, Feiern)

~12–16 phrases each, `cefr` on every phrase, register split neutral/formal. Each new category:
extend `RedemittelCategory` union + linter mirror + `redemittelCategories` registry (label,
labelDe, icon from `lib/icons.ts`) + provenance rows. `professionalIntro` (Wave 1) is the
template. When Redemittel pass ~120 phrases, revisit the audit's parked idea of a pragmatic
politeness tag (direkt/höflich/diplomatisch), which was banked as a v2 content project.

## 6. Wave 4 — Grammar: complete the B1–B2 canon (10 → ~24 topics)

Grammar stays sector-neutral (a Konjunktiv II is a Konjunktiv II in every industry). Missing
B1–B2 topics, in priority order along the existing B2-marker spine:
n-Deklination · Genitiv & Präpositionen mit Genitiv · Partizipien als Attribute
(Partizipialattribute) · indirekte Rede (Konjunktiv I) · Nominalisierung ↔ Verbalstil ·
zweiteilige Konnektoren (je…desto, sowohl…als auch, entweder…oder) · Infinitivsätze (zu, um…zu,
ohne…zu, statt…zu) · Finalsätze (damit) · Temporalsätze (während, bevor, nachdem, seitdem) ·
Vergleichssätze (als/wie, als ob) · lassen + Infinitiv · brauchen + zu · Futur I/II für
Vermutungen · es-Konstruktionen.

Each topic follows the `GrammarTopic` schema (required `cefr`, 4–6 drills with `explain` +
`gloss`, Typische Fehler section). 2–3 topics per session is a sustainable authoring pace with
founder review. The s93 lesson page (priority spine, prev/next, completion panel) absorbs new
topics automatically via `grammarMeta.ts` (`groupOrder`/`topicRank`: place each new topic on the
spine deliberately).

## 7. The quality gate (every wave, non-negotiable)

This is what makes the library a *source of truth* rather than a word list:
1. `pnpm lint:content` — schema, ids, cross-refs, taxonomy, provenance, em-dash ban.
2. `pnpm build:oracles` then `pnpm verify:facts` — every noun's der/die/das + plural checked
   against LanguageTool AND German Wiktionary; CI fails only when both agree a form is wrong.
3. `pnpm build:frequency-subset` then `pnpm build:frequency` — regenerate the Häufigkeit bins;
   `lint:content` errors on a stale `frequency.ts`. Out-of-corpus Fachwörter get NO bin on
   purpose (absence of corpus evidence is never labelled "Fachsprache").
4. `pnpm verify:grammar` / `pnpm verify:cefr` (warn-only) + `pnpm build:verification` — refresh
   the Layer C trust tiers shown on `/sources`.
5. `pnpm typecheck && pnpm test:unit && pnpm build && pnpm check:bundle` — the banks ride only
   in lazy chunks; the ~75 kB main chunk must not move.
6. Human loop: all new rows start `review_status: "draft"`; the founder (or a native-speaker
   reviewer) flips them to `verified` in review passes. AI-drafted ≠ verified, and `/sources`
   says so honestly per item.

## 8. Content sourcing rules (unchanged, see DATA_GOVERNANCE.md)

Word fields anchor on the sector-neutral Goethe-Zertifikat B2 / telc Deutsch B2+ Beruf lists;
sector Fachwortschatz is drafted from real professional usage and traced via DWDS/Wiktionary
references (never copied from a proprietary list). Example sentences are authored (OWNED),
CEFR-calibrated against the CoE descriptors (cited, never reproduced). Every content_id has a
provenance row from day one; `pnpm check:refs` keeps references alive.

## 9. Success criteria

- A learner from ANY of the 11 sectors opens Bibliothek → Wörter, taps their Branche, and finds
  a credible starter set today, a deep set (Wave 2) within weeks.
- The Branche facet never shows an empty or 2-item pill row (the floor guarantees this
  structurally; Wave 2 keeps collocation tagging above 15% as the bank grows).
- Redemittel + Grammatik reach "single source of truth" completeness via Waves 3–4 without ever
  needing a sector tag.
- Every shipped item survives the two-oracle fact gate and carries an honest trust tier.
