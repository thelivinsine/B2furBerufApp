# Bibliothek Scale-Up Plan: Branchen-Fachwortschatz für alle Berufsfelder

_Created 2026-07-12 (session 94). Founder decision: activate the sector (Branche) axis._
_Updated 2026-07-12 (session 95): Waves 2 (first tranche), 3 and 4 EXECUTED; founder review pending._

## 0. Non-technical summary (for the founder)

Wave 1 gave every profession a small starter set. Waves 2 to 4 turn those starters into a bank
professionals keep using after the course:
- **Wave 2, go deep per profession:** deepened sectors grow to ~60 words + ~26 word-pairs, plus a
  short authentic workplace text (memo, email, notice, voicemail) so people read and listen, not
  just memorise. Sectors are deepened in the order users ask for them.
- **Wave 3, a phrasebook for work life:** Redemittel grew from 84 to 149 phrases across phone
  calls, emails, presentations, job interviews and small talk. These fit every profession.
- **Wave 4, finish the grammar:** 10 → 24 lessons now cover the core B1–B2 grammar canon, each
  German-first with practice drills.
- **Trust runs through all of it:** everything AI-drafted starts as "draft"; a human review flips
  checked items to "verified" on the Sources page. Rising verified % is the quality headline.

**Model policy:** the German writing IS the product and runs on the strongest model (Fable 5;
Opus 4.8 only as fallback). Schema/enum wiring runs on Sonnet 5; mechanical steps (provenance
script, regenerating generated files, running gates) on Haiku 4.5. If a session mixes authoring
with wiring, the whole session runs on Fable 5, language work is never split down.

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

## 4. Wave 2 — depth where it is used (FIRST TRANCHE EXECUTED s95; review pending)

Target per prioritized sector: 20 → **60–80 words + 25–35 collocations + 1–2 reading texts**.
Priority is feedback-driven (founder decision): deepen what classmates request after the
2026-07-13 presentation; default order absent a signal: engineering → it → construction →
production → care → the remaining service sectors.

**Executed (s95, first tranche): engineering, it, construction, production** each grew +40 vocab
(to ~60), +17/16 collocations (to ~26) and got one sector `ReadingText` (Wartungsprotokoll memo,
Sprint-Review email, Baustellenordnung announcement, Schichtplan voicemail; one per `kind`).
`ReadingText` gained the optional **`sector`** field (linter validates when present). Bank now:
1,022 vocab · 701 collocations · 26 texts.

Remaining per-sector checklist (care, trades, retail, hospitality, transport, beauty, sports):
1. Vocab to 60–80, keeping the theme spread (never collapse into one theme).
2. Collocations to 25–35 (the Nomen-Verb pairs are the highest-value B2 asset).
3. 1–2 sector `ReadingText`s with 2–3 checks each.
4. Re-run the full pipeline (§7); sector Fachwörter legitimately skew "specialized"/no-bin.

Prioritization signal order: (1) direct user requests, (2) which `?sector=` filters get used
(no analytics yet, so ask users directly), (3) German labour-market size of the sector.

## 5. Wave 3 — Redemittel as a professional phrasebook (EXECUTED s95: 84 → 149; review pending)

Growth by **speech-act category**, never by sector. Shipped: `telephoning` (Telefonieren),
`emails` (E-Mails schreiben), `presentations` (Präsentieren), `jobInterview`
(Vorstellungsgespräch incl. Gehaltsvorstellung/Rückfragen) and `smallTalk` (incl. Feierabend/
Daumen drücken), 13 phrases each, every phrase with `cefr`, register and a realised example.
Wiring followed the `professionalIntro` template exactly (union + linter mirror + registry +
icons Phone/Mail/Presentation/UserCheck/Coffee).

Follow-up: now that the bank passed ~120 phrases, the audit's parked pragmatic politeness tag
(direkt/höflich/diplomatisch) may be revisited as a separate content project.

## 6. Wave 4 — Grammar: complete the B1–B2 canon (EXECUTED s95: 10 → 24 topics; review pending)

Grammar stays sector-neutral. Shipped, on the B2-marker spine (new groups in brackets):
indirekte Rede/Konjunktiv I [reportedSpeech] · zweiteilige Konnektoren [connectors] ·
Infinitivsätze [infinitives] · Finalsätze + Temporalsätze + Vergleichssätze [subordinate] ·
Partizipialattribute [attributes] · Genitiv & Genitiv-Präpositionen [cases] · n-Deklination
[nouns] · Nominalisierung [wordFormation] · lassen + Infinitiv + es-Konstruktionen
[verbPosition] · brauchen + zu [modals] · Futur I/II für Vermutungen [future].

Every topic follows the full schema: required `cefr`, German-first `explanationDe` +
`pitfallsDe` (EN on hold-to-peek), " · "-separated `pattern` variants, 3 examples, 5 drills
with `explain` + `gloss`. Bank: **24 topics / 117 drills**. `grammarMeta.ts` `groupOrder` was
extended so the s93 lesson page, spine rank, prev/next and completion panel absorbed everything
automatically. Note: `provenance.ts` is now two concatenated array literals (a single 2,000+ row
literal exceeds TypeScript's TS2590 union-complexity limit); the append pattern is unchanged.

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
   says so honestly per item. **Next step (first verification session):** build
   `scripts/review-queue.mjs` (+ `pnpm review:queue`), a read-only dump of draft items grouped
   by bank/sector/category for offline founder review; one review session after each content
   wave, tracking verified % as the headline quality metric.

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
