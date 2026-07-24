# Feature components — help section, Artikel-Visuals, domain buildings

## Public help/blog section (`/hilfe` + `/hilfe/:slug`)
`src/features/help/`: bilingual DE/EN, login-free, outside AppShell like `/about`. One content
bank `content.ts` (hub + Üben/Spielen articles, closed-union blocks) feeds BOTH the lazy React
reader (`HelpChrome`/`HelpHub`/`HelpArticle`) AND the build-time prerender
`scripts/prerender-help.mjs`, which emits a real static HTML file per page (unique meta +
Article/BreadcrumbList/FAQPage JSON-LD + full text in `#root`) for SEO. When adding/renaming
articles: update `content.ts` only, then `pnpm build` (regenerates pages + sitemap). No em
dashes. The `HelpChrome` Back button uses the history-aware `handleBack` (navigate(-1), fallback
`/welcome`), same as `LegalChrome`.

## Artikel-Visuals gender system (`components/artikel/`; plan `docs/plans/ARTIKEL_VISUALS_PLAN.md`, fully shipped)
- `gender.ts`: pure `genderOf`, reads ONLY the authored `article` field, null = no mark.
- `Wesen.tsx`: the three creature marks (spiky blue der / round rose die / boxy green das; full
  creature ≥ 24px, solid shape below; geometry from the founder-picked Preview B in
  `preview/artikel-visuals/gender-doodles-panel.html`).
- `ArtikelEffect.tsx`: flip/answer reveal (der bursts, die blooms, das shatters; CSS
  `.artikel-fx-*` in `index.css`, 200ms delay so the effect stays visible after the FlipCard
  rotation; reduced-motion = fading tint).
- `ArtikelLegend.tsx`: one-time hint, `artikelLegendDismissed` in `useSettingsStore`.
- Colors ride the `--der/--die/--das` (+`-bg`) tokens (light + dark, distinct from the
  `graphPalette.ts` domain hues; never domain/graph colors). Wired into the Bibliothek Wörter
  Karten/Tabelle/Liste.
- **Fused doodles** live in `features/vocabulary/doodles/` (`index.ts` = eager id registry +
  `hasDoodle`/`loadDoodle`; `art.tsx` = the scenes, referents in `--ink`, creature via the
  exported `WesenBody`, own-gender tokens ONLY, enforced by `tests/doodles.test.ts` incl. a
  rendered-markup check). The art is a lazy chunk loaded on a registered card's first flip; the
  card back shows the doodle above the English. Growing the bank = add the scene in `art.tsx` +
  the id in `index.ts` + record it in the plan §4.
- **Reuse:** the reveal effect fires on correct NOUN answers in the composed session (see
  `docs/areas/SESSION.md`), and the Wesen mark appears on the Wörter-graph selected-node card +
  the legacy `Flashcards` front.

## Domain buildings (`components/city/domain-buildings.tsx`)
The six flat SVG domain buildings: two-tone + neon marks in the `route-icons.tsx` language, soft
corners only (rx on every rect, round-join strokes on pointed shapes), ground-aligned optical
sizing, plus the `DOMAIN_BUILDINGS` mastery registry the city strip consumes. Lit = bright white
windows, unlit = dark shaded openings; **no reward color in these marks** (the founder rejected
gold windows). Review sheet: `preview/domain-buildings-preview.svg` (the TSX is the geometry
source of truth). Mapping: `arzt`→arztpraxis (via `gesundheit`), `wohnen`→wohnhaus,
`bank`→bank (explicit `themeIds`), `bildung`→pruefungshalle (via the `bildung` rollup); the
Wohnhaus also carries `domains: ["alltag"]` so unclaimed `alltag` themes fold into it
(`tests/city-mastery.test.ts` enforces full coverage). The city strip (`CityStrip.tsx`) is
currently unmounted from Heute (component kept).
