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

## Session 122 (2026-07-16) — Theorie graph-view quality audit + P0/P1 fixes (condensed handoff)

**Handoff after session 122 (2026-07-16). Theorie graph-view quality audit + P0/P1 fixes (Fable 5), on
branch `claude/bibliothek-theorie-graphs-sk0dr3`, shipped to `main` (PR #539, squash-merged).** The
founder asked for a comprehensive bug/quality analysis of the Bibliothek/Theorie graph views, then a
P0–P3 report with per-action Claude-model routing, then approved the Opus-tier batch.
- **The audit (delivered in-chat):** ran the pure builders + a d3-force benchmark against the real
  banks. Key numbers: sim warmup froze the main thread **951ms (Wörter) / 1019ms (Kollokationen)** on a
  desktop-class CPU per open AND per filter change; Kollokationen fit-to-all zoom is k≈0.21 (phone) /
  0.55 (laptop), both under the old k>0.7 label gate → zero labels at the flagship zoomed-out view; only
  118/797 collocations resolve noun+verb into Wörter-graph edges (350 noun-only, 234 neither) and 494/
  2,514 `related` refs drop unresolved — that content gap is the **open P1-5 follow-up** (Opus curation
  list → Sonnet authoring). Remaining P2/P3 batch (label-culling + card-refit ports to Wörter, wheel
  scroll-trap, count-vs-filter mismatch, resize refit, data nits, hygiene) is scoped in the session-122
  prompt-log entry; fix order and model routing per action are recorded there too.
- **The four fixes shipped (components only; pure builders + tests untouched):** (1) warmup now runs in
  rAF slices with a 10ms/frame budget; a rebuild where >50% of nodes kept cached positions (filter
  tweak) needs only 20 ticks and draws immediately, cold starts settle blank-then-reveal (design
  intent kept, freeze gone). (2) The pinch branch releases a half-started node drag and the cool-down
  (`alphaTarget(0)`) runs whenever the last pointer lifts, so the sim always sleeps again (was: permanent
  jitter + a pinned node in Wörter). (3) Draw ignores focus ids not in the current graph (dormant
  selection revives if the node returns; `fitView` ignores a dormant selection's card). (4) Kollokationen
  hub labels: degree ≥ 5 keeps a readable label at any zoom, alpha ramping 0.4→0.9 by degree (the old
  dead `hubBoost` removed); collision culling keeps the canvas clean.
- **Verification:** Playwright end-to-end (onboarding skipped via seeded localStorage): both views paint
  after chunked warmup with zero >200ms long tasks, tap opens the card, filter change with active
  selection no longer ghosts, hub labels screenshot-verified at fit-to-all. `typecheck` clean, `lint` at
  the exact pre-change warning baseline, `test:unit` 147/147, `build` + `check:bundle` 79.6 kB.
- **Note:** PRs #537 (backlog-item doc tick) and #538 (singular/plural noun merge onto one graph node,
  Theorie) merged between s121 and this session without status-doc entries; s122 numbering continues
  from the last documented session.

## Session 123 (2026-07-16) — Theorie graph-view P2/P3 batch (condensed handoff)

**Branch `claude/graphs-troubleshooting-plan-2f6p4s` (Sonnet 5).** Finished the session-122 audit's
leftover fix list. **P2 (user-visible):** ported label-collision culling into `WordGraph.tsx`; a new
effect pans the Wörter view up so the selected-word card never covers its own node (no zoom change);
wheel now only zooms with ctrl/cmd held on BOTH graphs (plain wheel scrolls the page); the legend
connection count now respects the domain/kind filter on BOTH graphs; resize re-centers both graphs
(transform shifted by half the size delta); the fit-button random/hub jump only picks filter-passing
nodes. **P3 (hygiene):** removed the unused `register` field from `CollocationLink`/`SimLink` + its dead
test; moved `toggleLayout` side effects out of the `setCardLayout` updater; capped `posRef` at 4000
entries; fixed a stale "6-domain" comment in `graphPalette.ts`; added `role="img"` + aria-labels to both
canvases. **Out of scope:** the content-curation follow-up (unresolved `related` refs / edge resolution).
Gates: typecheck clean, lint at 53-warning baseline, `test:unit` 146/146, build + check:bundle 79.6 kB.

## Handoff after session 124 (2026-07-16) — Kollokationen Karten card text-cutoff + speak-button alignment fix

Kollokationen Karten card text-cutoff + speak-button alignment fix (Sonnet 5), on branch
`claude/card-text-alignment-fixes-cc3k0r`, shipped to `main` (PR #545, squash-merged). Founder-reported
bug via screenshot: in the Bibliothek/Theorie → Kollokationen "Karten" view, some card titles were cut
off mid-word with an ellipsis, and the speak-out-loud icon next to the title sat at inconsistent
horizontal positions from card to card.
- **Root cause:** `CollocationCard` in `src/features/collocations/CollocationsBrowser.tsx` rendered
  the title (`c.full`) in a `flex items-center` row with a hard `truncate` class and no `flex-1`. A
  short title (e.g. "Zeit sparen") left the `<p>` at its natural content width, so the `SpeakButton`
  sat immediately after the text instead of at the card's right edge; a long title filled the row via
  flex-shrink and got ellipsis-truncated. The example-sentence row directly below it already used the
  correct pattern (`min-w-0 flex-1`, no truncate) and never had this bug.
- **Fix (one file, 2 lines):** changed the title row to `flex items-start gap-1.5` and the title `<p>`
  to `min-w-0 flex-1 ... leading-snug` (dropped `truncate`, dropped `items-center`), mirroring the
  example row. Titles now wrap onto a second line when needed instead of truncating, and the speak
  icon is always flush against the card's right edge regardless of title length.
- **Verification:** `pnpm typecheck` clean, `pnpm lint` clean on the file, `pnpm build` +
  `pnpm check:bundle` green (main chunk 79.6 kB). Visually verified end-to-end via `pnpm preview` +
  Playwright screenshot of `/library?tab=kollokationen&view=karten` at 1200px wide.
- **Scope note:** only the Kollokationen Karten tile was reported/fixed. The Wörter card
  (`VocabList.tsx`) has the same `truncate`-without-`flex-1` pattern on its title but was left untouched
  (single vocab words rarely overflow at card width); worth the same fix if it's ever reported.

## Session 124 (2026-07-16) — Kollokationen Karten text-cutoff + speak-button alignment (condensed handoff)

**Branch `claude/card-text-alignment-fixes-cc3k0r` (Sonnet 5), shipped to `main` (PR #545).**
Founder-reported via screenshot: Kollokationen "Karten" card titles cut off mid-word with an ellipsis
and the speak icon at inconsistent horizontal positions. **Root cause:** `CollocationCard` in
`src/features/collocations/CollocationsBrowser.tsx` rendered the title in a `flex items-center` row
with a hard `truncate` and no `flex-1`, so short titles left the SpeakButton mid-card and long titles
got ellipsis-truncated. **Fix (one file, 2 lines):** title row to `flex items-start gap-1.5`, title
`<p>` to `min-w-0 flex-1 ... leading-snug` (dropped `truncate`), mirroring the example-sentence row:
titles wrap instead of truncating, speak icon flush right. **Verification:** typecheck/lint clean,
build + check:bundle 79.6 kB, Playwright screenshot of `/library?tab=kollokationen&view=karten`
confirmed all titles render in full. **Scope note:** the Wörter card (`VocabList.tsx`) has the same
`truncate`-without-`flex-1` pattern on its title but was not reported broken and was left untouched;
worth the same fix if ever reported.

## Session 125 (2026-07-16) — Theorie graph word-selection distribution + focus polish (condensed handoff)

**Handoff after session 125 (2026-07-16). Theorie graph word-selection distribution + focus polish
(Opus 4.8), on branch `claude/graph-word-selection-distribution-5av8xk`, shipped to `main` across nine
squash-merges (PRs #542, #543, #544, #546, #547, #548, #549, #550).** A long founder-iterated thread on
how the **Wörter** and **Kollokationen** graph views (`/library?tab=…&view=graph`) behave when a word is
selected. All work is in two files: `src/features/vocabulary/WordGraph.tsx` +
`src/features/collocations/CollocationGraph.tsx`. The final selection/focus model (identical in both
graphs):
- **Fan-out on select, restore on deselect (#542/#543).** Selecting a node animates its connections into
  a focused arrangement and frames them at a readable zoom (clamped, so a selection is never left too
  zoomed out after a fit-to-all); deselecting (empty-space tap or card ✕) animates every displaced node
  back to its stored **home** position. Implemented with a `homePosRef` (true home per displaced node) +
  a `focusRafRef` easeOut tween that pins moved nodes (`fx/fy`) so the d3 sim can't fight it; home
  positions (not the transient focus spots) are what get cached to `posRef` on rebuild/unmount.
- **Direction-preserving pull-in, not a rebuilt ring (#544).** Rejected the first "even symmetric ring"
  because it rearranged too much. Each connection keeps its **direction**; the founder then asked for the
  space to be used, so the final placement (#549) puts each connection on an **ellipse sized to fill
  ~82% of the free area** at the target zoom (`TARGET_FOCUS_K = 2.3`, per-axis rx/ry so a wide-but-short
  free area still fills across), at a radial factor that keeps relative order but never below 0.72 of the
  ellipse — so even a **single** connection spreads out instead of cramping at center.
- **Angle spreading (#550).** A hub whose connections all pointed one way (e.g. `beantragen`, 16) still
  stacked in a central column. `spreadAngles()` (module-scope pure fn in both files) blends each angle
  toward an even slot (slots rotation-aligned to the originals to minimize movement), preserving circular
  ORDER, so clustered connections fan around the whole ellipse and use the left/right space.
- **Label legibility (#548).** Nodes are spaced by their **label box** (measured width + the line under
  the dot) via an AABB `relaxLabels` pass with the selected word as an immovable box; `frameFocus`
  expands its bounds by label extents so nothing clips; and while focused the draw pass **no longer culls
  overlapping labels**, so a connection word can never silently disappear.
- **Fit button + animation parity (#547).** The Kollokationen fit-to-screen button now behaves like the
  Wörter one (second press zooms into a **random well-connected node**, weighted by area, excluding the
  current selection, instead of always the biggest hub). Every fit-button view switch animates (the
  fit-all press tweens the camera via the focus tween; the word-jump animates through the focus effect).
  `fitToNodes`/`fitToRect` were refactored to **return** the transform (`computeFit`/`computeFitRect`).
- **Card spacing (#544).** The Kollokationen selected-node card (both horizontal bar + vertical panel
  shapes) now floats clear of the canvas edges by the same `bottom-3/left-3/right-3` gap the Wörter card
  uses, instead of sitting flush.
- All tweens respect `prefers-reduced-motion` (instant). Verified with dark-mode mobile Playwright
  screenshots across 1-, 2-, 5-, 9-, and 16-connection selections + a numerical check of `spreadAngles`.
  Gates each PR: typecheck clean, lint at the 53-warning baseline (0 errors), `test:unit` 146/146, build +
  check:bundle 79.6 kB, 0 console errors.
- **Caching caveat surfaced repeatedly:** several founder screenshots showed already-fixed behavior,
  i.e. the installed PWA was serving a **cached** service-worker build. If a graph change doesn't appear
  after deploy, hard-refresh / reopen the app so the new SW activates. If `beantragen` still looks
  cramped after that, `spreadAngles`' `blend` (0.7) is the one knob to push harder.

## Session 126 (2026-07-17) — Daily-life content scale-up, Phase A + B (full handoff)

**Handoff after session 126 (2026-07-17). Daily-life content scale-up (Phase A + Phase B, COMPLETE), on
branch `claude/scale-words-domains-qjv9x4`, shipped to `main` across PRs #553–#558.** The founder:
_"currently the app has mainly berufsleben words. Can you scope a task to scale up words from other
domains?"_ → _"i chose both phase a and b"_ → _"go ahead with the plan"_ → _"yes go ahead with phase b"_.
- **Scoped** `docs/plans/DAILY_LIFE_SCALEUP_PLAN.md`: Phase A deepens the 5 existing daily-life themes to
  workplace parity; Phase B adds new everyday-life themes. Committed on the branch.
- **Executed Phase A (four theme commits, PR #553, squash-merged to `main`):**
  - `bank`: 43 → **81 vocab**, 38 → **50 colloc** (+38 v / +12 c).
  - `bildung`: 46 → **80 vocab**, 39 → **50 colloc** (+34 v / +11 c).
  - `behoerde`: 49 → **80 vocab**, 42 → **50 colloc** (+31 v / +8 c).
  - `wohnen`: 57 → **80 vocab**, 45 → **50 colloc** (+23 v / +5 c); `arzt`: 74 → **80 vocab** (+6 v).
  - Every item CEFR-tagged B1–B2, spread across the theme's 4 sub-themes (deliberately lifting the thin
    ones, e.g. behoerde.bescheid/aufenthalt, bildung.anerkennung/weiterbildung, wohnen.suche/vertrag). One
    `provenance.ts` row per id (all `review_status: "draft"`, DWDS/Wiktionary references). New bank totals:
    **1,378 vocabulary / 811 collocations / 2,620 provenance rows.**
  - Gates per theme: `pnpm lint:content` ✔, `pnpm build:frequency` (regenerated), `pnpm verify:facts`
    (0 two-oracle-confirmed errors; the 7 review signals are all pre-existing dual-gender headwords, none
    from this work), `pnpm build` ✔.
- **Phase B (COMPLETE): five NEW `alltag` themes, one PR each, all squash-merged to `main`:**
  - `einkaufen` (Einkaufen & Geschäfte, #554), `essen` (Essen & Restaurant, #555), `mobilitaet` (Mobilität
    & Verkehr, #556), `freizeit` (Freizeit & Soziales, #557), `digitales` (Handy, Internet & Digitales,
    #558). Each is a full `behoerde`-shape pack: **49 vocab / 40 collocations / 2 dialogues / 2 texts /
    3 Can-Do / 1 writing prompt / ~97 provenance rows**, spread across 4 sub-themes, CEFR-tagged B1–B2.
  - Per theme, wired: `types/index.ts` `ThemeId` + `scripts/lint-content.mjs` `THEME_IDS` (kept in sync),
    a new lucide icon in `src/lib/icons.ts` (ShoppingCart/UtensilsCrossed/Bus/PartyPopper/Smartphone), the
    `src/data/themes.ts` record, and the required `writingPrompts` entry (the `Record<ThemeId>` type forces
    it). **Locked success metric held:** no feature/component code changed except the one-line city rollup.
  - **City buildings:** einkaufen's PR added `domains: ["alltag"]` to the **Wohnhaus** building so all five
    new (and any future) unclaimed `alltag` themes fold in by domain rollup; bank/behoerde/wohnen stay
    explicitly claimed first. Updated `tests/city-mastery.test.ts` (`toContain("wohnen")`) for the
    full-coverage invariant. A dedicated "consumer/town-life" building is a possible future founder call.
  - Gates each PR: lint:content, build:frequency, verify:facts (0 errors), build, **test:unit 146/146**,
    check:bundle 79.6 kB, eslint 0 errors.
- **Recurring gotcha (both phases):** many planned ids collided with existing entries in OTHER themes
  (shopping ↔ customer, food ↔ customer, transport ↔ travel/logistics, digital ↔ technology). **Pre-check
  every candidate id with `grep -c 'id: "v_X"'` / `'id: "c_X"'` across the whole bank BEFORE authoring** to
  avoid rework; pick theme-distinct words rather than duplicating a concept already tagged elsewhere.
- **Next / follow-ups:** the whole scale-up plan is done. Natural continuations: (1) founder review pass to
  flip the new `draft` provenance rows to `verified` (use `pnpm review:queue`); (2) exam sets / more
  dialogues for the new themes if depth is wanted; (3) a dedicated city building for the consumer themes if
  the Wohnhaus fold feels wrong. Nothing is blocking.

## Session 127 (2026-07-17) — Brand kit catalogue Vol. IV–VII (condensed handoff)

On branch `claude/epic-ramanujan-p049i8`; preview + docs only, no `src/` touched, no gates run. The
founder rejected all 20 of session 113's brand directions and asked for fresh kits built on the
recorded preferences (s116 verbatim: no gradients on logo or buttons; a variety of colorful accents;
don't bulldoze the already-designed pages/menus/icons).
- **Vol. IV** `preview/branding/genauly-identity-vol4.html` (artifact `b4bd024b`): 8 complete kits,
  each a live SVG mark + wordmark + 64/40/20 px app icon + hex palette + free Google-Fonts pairing +
  flat UI probe + a "Passt zum Bestand" line. The set: Textmarker (Cobalt & Butter), Haken dran
  (keeps existing indigo, cheapest to ship), Sticker-Klub (`GAME_OUT #463C44`), Linie B2 (five line
  colors = five domains), Zwei Stimmen (teal + tangerine), Bauhaus Pause (geometric primitives),
  Neonschild (marketing face only), Der Dachs (mascot, brand surfaces only).
- **Vol. V:** real-app previews of Kits 1 + 6 plus four new kits in Kit 6's geometric philosophy
  (6A Bauklötze / 6B Ulm / 6C Plakat / 6D Neubau); seven preview strips in
  `preview/branding/vol5-screens/`, produced with the s116-proven token-swap method (documented in
  `preview/branding/README.md`).
- **Vol. VI (model switched to Opus 4.8):** eight premium variations of the two favorites (Kit 1:
  Kobalt & Butter / Tinte & Messing / Aubergine & Aprikose / Marine & Koralle; Kit 6: Bauhaus /
  Graphit & Messing / Bordeaux & Marine / Mitternacht dark-mode) with the core marks intact, 9 strips
  in `preview/branding/vol6-screens/` (the harness now also drives the app's real `.dark` mode).
  Artifact `dfcad5f6`.
- **Vol. VII:** the founder picked Kit 1 · Kobalt & Butter and asked to recolor it to the
  bottom-nav blues (dark blue `#2563EB` as primary; the nav's light blue in the logo swipe instead
  of butter). Delivered `preview/branding/genauly-identity-vol7.html` + 3 strips (`vol7-screens/`):
  **Himmelblau `#38BDF8`** (recommended) and **Cyan `#22D3EE`** (alternate) on the real app, plus
  the original for reference. Artifact `a4b80dcf`.
- **Next:** the founder picks the light blue; that is the likely next real `src/` change (wire the
  chosen two-blue palette into `src/index.css` + `tailwind.config.ts` light + dark, regenerate
  logo/favicons/PWA icons from the mark, `pnpm build`, ship to `main`). Until then nothing
  brand-related changes in the app.

**Handoff after session 128 (2026-07-18). Gender-visuals research panel + Artikel-Visuals
implementation plan (Opus 4.8 → Fable 5), on branch `claude/visual-gender-indicators-gsox24`,
docs/preview files only, nothing shipped to the app.** The founder asked how to add visuals showing a
word's gender so learners "also learn visually", then floated a moustache-stick-figure idea and asked
for an evidence-based expert brainstorm. What happened, in order:
- **Idea survey + first preview page:** seven visual-gender ideas (ArticleBadge chips, shape encoding,
  plural-morphology highlighting, graph gender rings, suffix-rule hints, a gender-sort game scene,
  sub-theme watermarks), mocked in the app's real tokens.
- **Three-expert evidence panel** (parallel research agents: SLA literature, memory science,
  competitor/illustration practice). Headline results: images that FUSE meaning+gender have the
  strongest evidence (Santos 2015, n=283); color alone is weak and voices are harmful; a repeated
  "bizarre" marker (the moustache) self-defeats (contrast collapse + seductive-details penalty); human
  personas teach a FALSE rule on `das Mädchen`/`die Person`/`der Gast` and carry stereotype risk, so
  they were dropped; learner-generated associations (generation effect) and retrieval-moment practice
  carry the largest durable gains. Full findings + citations live under **backlog #4 in
  `docs/PROJECT_REFERENCE.md`** (recorded this session; do not re-research), including two proposed
  quiz exercises the founder flagged: the **"Meine Eselsbrücke" self-made memory hook** and an
  **Artikel-Sprint** der/die/das drill.
- **Second preview page** (panel findings + previews A–E). The founder picked **Preview B
  (Artikel-Wesen: three non-human mascots, spiky-blue der / round-rose die / boxy-green das), Preview C
  (fused per-word doodles), and Preview D (gender effects at answer-reveal)** for the **Theorie
  cards**. Both preview pages are committed under **`preview/artikel-visuals/`** (open in a browser;
  they follow light/dark).
- **The build plan is `docs/plans/ARTIKEL_VISUALS_PLAN.md`:** three phased PRs (1: tokens + Wesen
  marks on Karten/Tabelle/Liste + flip effect + one-time legend; 2: lazy doodle registry + batch 1 of
  20 fused doodles; 3: reuse in session grading, graph card, flashcards), each with model
  recommendations (Opus 4.8 for the cross-cutting wiring, **Fable 5 high for the Wesen/doodle art**,
  Sonnet 5 for mechanical reuse), acceptance criteria, and guardrails (gender palette distinct from
  `graphPalette.ts` domain colors, shape never color-only, reduced-motion, bundle budget, no
  always-on animation).
- **Founder selection rule for the 20 batch-1 doodle words (2026-07-18): high frequency AND highly
  useful for Kapitel 1 of the game.** The plan encodes it: the 10 nouns Kapitel-1 missions directly
  reference (6 die / 4 der / 0 das, listed in the plan) + 10 top-Zipf nouns from the Kapitel-1 mission
  themes (`travel`/`technology`/`sustainability`/`wohnen`/`behoerde`) with a das-balance override
  (>= 4 das-words in the batch), selection snippet included in the plan. (The five NEW s126 `alltag`
  themes are not Kapitel-1 themes, so they don't enter batch 1.)
- **Next session: implement the plan, starting with PR 1** (restart the branch from `main` first per
  the merged-PR rule, since this session's docs PR has merged).
