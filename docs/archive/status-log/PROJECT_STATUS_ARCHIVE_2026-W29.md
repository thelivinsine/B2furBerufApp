# Project Status Archive — 2026-W29 (Jul 13–19)

_Condensed "Resume here" handoffs aged out of `docs/PROJECT_STATUS.md`, filed by the ISO week of their
date. For current status see `docs/PROJECT_STATUS.md`; index at `docs/archive/PROJECT_STATUS_ARCHIVE.md`._

## Session 113 (2026-07-13) — Brand identity exploration (condensed handoff)

**Handoff after session 113 (2026-07-13). Brand identity exploration (Opus 4.8), on branch
`claude/branding-logo-redesign-947e61`, merged to `main` (PR #516). Parallel to the demo work; no app
code changed.** The founder wants to replace the branding (logo, visual assets, colour scheme): the
current gradient rounded-square "G" reads as a Canva lookalike. Deliverable = a **catalogue of 20
logo/identity directions** for founder review, saved under `preview/branding/` (open the HTML files in
a browser; index in that folder's `README.md`).
- **What was produced:** three self-contained HTML "studio spec-sheet" pages, each direction a live
  SVG/CSS mark + a 5-colour palette (hex) + a licensable type pairing. `genauly-identity-vol1.html` +
  `vol2.html` (foundation *genau* = precision): Genau., Wasserwaage, Umlaut, Zielband, Neuland, „Genau",
  Der·Die·Das, Fokus, Roter Faden, Stempel. `vol3.html` (three new brand *philosophies*):
  Ankommen/belonging (Schwelle, Der Tisch, Schlüssel, Heimat), Durchbruch/momentum (Durchbruch, Schwung,
  Sprung), Klarheit/clarity (Prisma, Sonnenaufgang, Klartext).
- **Assistant shortlist:** Der·Die·Das (brand = the gender-colour teaching system), Neuland (one world
  with the game), Durchbruch (owns the plateau story), Ankommen/Schwelle (warmest, most distinctive).
- **NOT done (deliberate):** nothing in `src/` touched. No palette/token edit in `src/index.css` or
  `tailwind.config.ts`, no logo/favicon/PWA-icon regen. **That is the next step, and it only starts once
  the founder picks a direction** (belief + mark + palette, mixes allowed): lock one spec, wire the
  tokens (light + dark), regenerate all icons from the mark, `pnpm build`, ship to `main`. Also published
  as private Claude artifacts (Vol. I `fed14c61`, II `02c0d954`, III `dc5d3da7`).
- **Gates:** none run (no code change); docs + preview HTML only.

_Follow-on: session 116 (2026-07-14) picked up this thread — explored applying direction 03's
"Cobalt & Butter" palette to the real app (rejected) and shipped `docs/branding/genauly-ai-mockup-guide.pdf`.
See that session's handoff in `docs/PROJECT_STATUS.md`._

## Session 115 (2026-07-14) — Demo-readiness sweep finished (condensed handoff)

**Handoff after session 115 (2026-07-14). Demo-readiness sweep finished (Opus 4.8), on branch
`claude/predemo-sweep-tasks-25oejy`.** Closed the remaining open chunks of
`docs/plans/DEMO_READINESS_PLAN.md`: P0 Chunk 1 (smoke test), Chunk 4 (UI polish), Chunk 5 (runbook),
and P1 Chunk 6 (perf). Chunks 2+3 were already done s112. **The whole P0+P1 plan is now complete.**
- **Chunk 1 — smoke test (clean sweep):** Playwright over `pnpm preview`, 4 combos (390×844 mobile +
  1440×900 desktop) × (light + dark), 28 routes each + cold-start onboarding + a core-interaction pass
  (session blocks, mission scenes, filter-rail facet+reset, Graph view, Grammatik lesson). Zero
  console errors, zero error boundaries, zero blank pages, zero dead routes, zero horizontal overflow.
  Redirects preserve params; `/anwenden`+`/welt` resolve; junk `?`-params fall back.
- **Chunk 4 — UI polish:** reviewed screenshots of every demo-visible screen (light+dark, mobile+
  desktop). No blemishes; **no code changes needed.**
- **Chunk 5 — runbook:** wrote `docs/DEMO_RUNBOOK.md` (device prep, two demo states, tour order,
  failure fallbacks, founder console checklist). The s112 feedback function + rate-limit are already
  deployed and live.
- **Chunk 6 — perf:** main chunk 79.5 kB/400; throttled (1.6 Mbps/4× CPU) first paint ~3.3–3.5s on
  `/`, `/library`, Graph, `/welt`, `/sammlung`; lazy chunks load without an error flash.
- **Also ran the P2 whole-app security review:** manual audit of the 3 Edge Functions, all 6 RLS
  migrations, client config, cloudSync isolation, XSS/CSP, supply chain. **No critical/high findings.**
  Report: `docs/reports/security-review-2026-07-14.md`. `pnpm audit` 0 vulns.
- **Only doc changes** this session. All 9 gates green.
- **Remaining (P2):** Turnstile enablement + Resend SMTP (standing pre-public-launch founder items),
  and post-demo feedback triage from the `public.feedback` table. Both next-week, not demo-blocking.

## Session 116 (2026-07-14) — Branding-redesign support (condensed handoff)

**Handoff after session 116 (2026-07-14). Branding-redesign support (Opus 4.8), on branch
`claude/branding-redesign-color-palette-dqkvtd`. Docs + previews only; no `src/` touched.** The founder
is choosing a new brand off the s113 catalogue and asked to see the **Umlaut / "Cobalt & Butter"**
palette (direction 03) applied to the app.
- **Approach that worked:** rather than hand-drawn mockups, rendered the **real app** headless
  (Playwright via global playwright, `pnpm dev`, seed `localStorage b2beruf.settings.v1` to skip
  onboarding) and swapped **only** the CSS color tokens via an injected `:root`/`.dark` style tag,
  screenshotting Praktisch/Theorie/Fortschritt in light+dark.
- **Two preview rounds, both rejected:** token-swap options, then flat variants (no gradients) + 8 flat
  logo color combos. Delivered as Claude artifacts + sent PNGs.
- **Palette mapping (if a token swap is ever chosen):** Cobalt → `--primary` `228 75% 52%`, Butter →
  `--accent` `39 100% 65%`, Cream → `--background` `45 33% 93%`, Ink → `--foreground` `223 17% 9%`, Sky
  `225 100% 90%`. NB: the header logo is a PNG and the nav-mark colors are hard-set in
  `route-icons.tsx`, not the token — both are separate manual steps.
- **Landed deliverable:** shipped `docs/branding/genauly-ai-mockup-guide.pdf` + `.html` source (PR #522,
  squash-merged): the brief, a tool-for-job table, copy-paste prompts (incl. a ground-up logo rework
  §4d), sizes/negative-prompt tips, and a hand-back checklist. Regenerate the PDF from the HTML via
  headless-chromium `page.pdf()`.
- **Next:** waiting on the founder to hand back **SVG + final hex codes**; then wire the tokens
  (light+dark) + regenerate logo/favicons/PWA icons.
- **Gates:** none run (docs + PDF only).

## Session 117 (2026-07-14) — Üben navigation + Bibliothek Üben-button copy (condensed handoff)

**Handoff after session 117 (2026-07-14). Üben navigation + Bibliothek Üben-button copy (Opus 4.8),
on branch `claude/uben-session-navigation-q4pfs0`. Two small, self-contained founder fixes; both
shipped to `main`.**
- **(1) Exit-returns-to-origin.** `SessionPlayer` (`src/features/session/SessionPlayer.tsx`) added an
  `exit()` helper: `(window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate("/")`. Every Üben
  entry point pushes a history entry (`navigate("/session?...")` from the Bibliothek trainers, Heute →
  `UebenPath`, Grammatik lessons, `Analytics`, `Sammlung`), so `navigate(-1)` lands back on the exact
  prior route with its filters/scroll intact; a deep link or fresh load (history idx 0) falls back to
  `/`. Wired into all three exit paths (empty-state button, done-screen "Zurück", exit-confirm
  "Beenden"); the two "Zur Übersicht" labels became "Zurück".
- **(2) Count in the Üben button.** `UebenLabel` (`src/features/shared/browseScroll.tsx`) now takes
  optional `count` + `noun` and renders "Üben mit {count} {noun}". The four Bibliothek trainers
  (`VocabularyTrainer`, `CollocationsBrowser`, `RedemittelTrainer`, `GrammarHub`) pass the filtered
  count with the correct **dative** noun (Wörtern / Kollokationen / Wendungen / Themen; singular
  fallbacks) at BOTH the desktop rail footer and the mobile sticky bar, and dropped the separate
  stacked count block (+ the `count` prop from each `filterRailProps`). `FilterRail`'s `count`/
  `countStack` are now unused but kept as an optional no-op API. Verified headless at 1280 + 390 wide.
- **Gates:** `pnpm typecheck` / `build` / `lint` (0 errors) / `test:unit` (134/134) all green. No
  content or engine changes, so no `lint:content` / `test:srs` impact.

## Session 118 (2026-07-14) — Kollokationen nodal graph (condensed handoff)

**Handoff after session 118 (2026-07-14). Kollokationen nodal graph (Opus 4.8), on branch
`claude/kollokations-nodal-graph-080jt7`, shipped (PR #527 + follow-up #528).** Added a Graph view to the
Bibliothek **Kollokationen** tab, matching the Wörter graph's slot but purpose-built for collocations.
- **Model + layout (founder-confirmed):** a **bipartite noun ↔ verb** graph (every noun/verb a node,
  every collocation an edge; hub verbs surface naturally), laid out as **theme islands** via per-theme
  `forceX/forceY` centroids. Opens **fit-to-all**; cached radial glow sprites, curved domain-tinted
  edges, vignette; **nouns = discs, verbs = rings**; node size = degree; domain color = majority theme.
- **Files:** `src/lib/graphPalette.ts` (shared `DOMAIN_COLORS`/`domainColor`, lifted out of `WordGraph`),
  `src/features/collocations/collocationGraph.ts` (pure builder) + `tests/collocationGraph.test.ts` (8
  tests), `src/features/collocations/CollocationGraph.tsx` (lazy renderer), wired into
  `CollocationsBrowser.tsx`. d3-force stays in the shared `vendor-misc` chunk (main chunk unaffected).
- **Follow-up (#528):** a **card shape toggle** (horizontal bottom bar ↔ vertical right panel) that
  re-fits the constellation into the free area. Gates green; browser-verified light+dark, desktop+mobile.
- **Follow-up (#532):** nodes are now **draggable and pin where dropped** (the strong centroid force was
  snapping them back); selecting a node **frames it at a gentle `READABLE_K=1.55`** (`focusNode`,
  replacing the too-strong `k=2.8` hub jump); canvas **labels are collision-culled onto translucent
  pills** so they stay legible. All verified headless; gates green.

## Session 119 (2026-07-14) — Account-dropdown z-index bug fix (condensed handoff)

**Handoff after session 119 (2026-07-14). Account-dropdown z-index bug fix (Opus 4.8), on branch
`claude/account-settings-dropdown-icons-b8feg6`, shipped to `main` (PR #529, squash-merged).** A
one-line founder bug fix.
- **Symptom (founder screenshot):** on a Bibliothek browse page (e.g. Kollokationen), opening the
  account menu showed the page's toolbar (the `ViewSwitcher` icons + the search magnifier) painting on
  top of the dropdown's **DESIGN** theme-toggle row. The dropdown background is opaque, so it was not a
  transparency issue.
- **Root cause:** the app header (`AppShell.tsx`, `sticky top-0 z-20`, a stacking context via its
  `backdrop-blur`) and the sticky Bibliothek browse toolbar (`browseHeaderClass` in
  `src/features/shared/browseScroll.tsx`, `sticky ... z-20`) were **both `z-20`**. Equal z-index →
  paint order decides, and the toolbar comes later in DOM order, so it painted over the account
  dropdown wherever the dropdown overflows below the header. The dropdown's own `z-50` only applies
  inside the header's stacking context, so it could not beat the sibling toolbar.
- **Fix:** header `z-20` → `z-30` (`src/components/layout/AppShell.tsx`). Layer order stays correct:
  header/dropdown now above the browse toolbar (`z-20`) but still below FeedbackPill (`z-40`), Toaster
  (`z-50`), and the mobile bottom nav (`z-[55]`/`z-[60]`); the desktop sidebar (also `z-30`) never
  overlaps the header spatially (header lives inside `lg:pl-64`). Bonus: makes the intended "toolbar
  slides under the header on scroll" behavior a real z-order instead of a DOM-order coincidence.
- **Gates:** `pnpm build` green (only gate relevant to a className change; no content/engine/type
  impact). Live verification (Actions tab + `*.github.io`) is the founder's, per the usual note.

## Session 120 (2026-07-14) — Content-library coverage review + deepening (condensed handoff)

**Handoff after session 120 (2026-07-14). Content-library coverage review + deepening (Opus 4.8), on
branch `claude/content-library-coverage-lih2fp`. Shipped to `main`.** The founder asked for a thorough
review of the content library to find themes/sub-themes/Branchen with too few words or collocations,
then to add genuinely useful, commonly-used items for those fields.
- **What the review found (quantified via a throwaway coverage script):** the industrial Branchen
  (production 80 / engineering 71 / construction 65 / it 55 / chemicals 49 vocab) are well-covered from
  the s94/s95/s102 packs; the imbalance was the **service/consumer world** where most B1-B2 immigrant
  learners actually work — sports 17, beauty 19, hospitality 19, retail 21 vocab. Thin daily-life
  themes: bank 29 (lowest), behoerde 33, bildung 34, wohnen 47. Starved sub-themes: `behoerde.bescheid`
  3, `behoerde.aufenthalt` 4, `arzt.versicherung` 4, all `bank`/`bildung` subs 6-8.
- **Wave 1 (service Branchen, +76 vocab / +48 colloc):** hospitality (Kellner, Vorspeise, Getränkekarte,
  abräumen, zapfen…), retail (Wechselgeld, Umtausch, Rückgaberecht, Warenkorb, Anprobe…), beauty (Frisur,
  Spülung, Tönung, Wimpernverlängerung, zupfen…), plus cleaning/security/sports top-ups (they were less
  thin, so fewer). Each rides `sectors:[…]` on the natural theme (mostly `customer`/`safety`/`arzt`).
- **Wave 2 (daily-life themes, +57 vocab / +8 colloc):** bank (Überweisen, Einzahlung, Buchung, Mahnung,
  Zahlungsverzug…), behoerde (Wohnsitz, an/abmelden, Niederlassungserlaubnis, Einbürgerung, Widerspruch,
  Rechtsmittel…), bildung (Wortschatz, Aussprache, mündlich/schriftlich, durchfallen, Praktikum,
  Bildungsgutschein…), wohnen (Betriebskosten, Nachzahlung, Zählerstand, Wasserschaden, Rohrbruch…),
  arzt.versicherung (Zuzahlung, Überweisungsschein, Attest, Zusatzversicherung…). Sub-theme-tagged so the
  starved slices fill.
- **Mechanics:** appended to `vocabularyPart2` / the collocations array; provenance rows added (DWDS
  refs, `review_status:"draft"` for the next founder review pass); `content_type` is `"vocabulary"` (not
  `"vocab"` — TS enum, caught at build). Regenerated `frequency.ts` after `pip install wordfreq` +
  `build:frequency-subset` (unbinned dropped 342 to 86). Refreshed the morphology oracle subsets.
- **Gates:** `lint:content` OK, `typecheck` OK, `build` OK, `test:unit` 142/142, `check:bundle` 79.6 kB,
  `verify:facts` OK (0 two-oracle-confirmed errors; the one new signal, `die Betriebskosten`, is a correct
  plurale tantum). Everything AI-drafted, founder-verify pending like the rest of the bank.

## Session 121 (2026-07-14) — Merged the `arbeitswelt` domain into `beruf` (condensed handoff)

**Handoff after session 121 (2026-07-14). Merged the `arbeitswelt` domain into `beruf` (Opus 4.8), on
branch `claude/berufsleben-arbeitsumfeld-overlap-itmpeg`, shipped to `main` (PR #535, squash-merged).**
The founder asked, looking at a Bibliothek graph, what the difference between the "Berufsleben" and
"Arbeitswelt" categories was, since they had near-identical colors and read as redundant to a learner,
then said "merge".
- **The two domains:** `beruf` ("Berufsleben") grouped the 6 communication-heavy workplace themes
  (meetings, scheduling, logistics, customer, conflict, project); `arbeitswelt` ("Arbeitswelt & Umfeld")
  grouped 4 topical ones (technology, sustainability, safety, travel). Both were `context: "work"`. The
  split was a taxonomist's cut (comms vs. topics), invisible to learners, and their graph colors
  (`#5b5be6` indigo vs `#8b5cf6` violet, ~30° apart) read as one color on the dense force-directed canvas.
- **The merge (6 code sites + CLAUDE.md):** dropped the `arbeitswelt` entry from `src/data/domains.ts`;
  retagged technology/sustainability/safety/travel to `domain: "beruf"` in `src/data/themes.ts` (all 10
  workplace themes now in `beruf`); removed the `arbeitswelt` color from `src/lib/graphPalette.ts`;
  removed `"arbeitswelt"` from the `DomainId` union (`src/types/index.ts`) and from `DOMAIN_IDS`
  (`scripts/lint-content.mjs`); set the Büro building rollup to `domains: ["beruf"]`
  (`src/components/city/domain-buildings.tsx`). `themeGroupsForMode` (`lib/themeGroups.ts`) is
  data-driven, so the library primary dropdown now shows one "Berufsleben" group covering all 10
  workplace themes with no code change.
- **Gates:** `lint:content` OK, `typecheck` OK, `build` OK, `test:unit` 142/142. Content counts
  unchanged (this was a taxonomy edit, not a content edit).
- **Note for next session:** the domain count is now 5, but `pruefung` still has no themes mapped to it
  (exam prep lives separately), so 4 domains actually carry the 15 themes. Pre-existing, unrelated to
  this merge.
