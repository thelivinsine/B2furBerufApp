# Session & Prompt Log

**Purpose.** A chronological, append-only record of every instruction the founder gives and the
assistant's response to it. This exists to create a clear, timestamped **paper trail of authorship
and creative direction** for the elements of this app, in case we register or defend copyright in
them. It complements (does not replace) the primary record, which is **git history** (timestamped,
authored commits) and the **merged pull requests**.

> Not legal advice. For an actual filing, a lawyer should advise on what evidence matters in the
> relevant jurisdiction (the product targets Germany/EU, where copyright protects human-authored
> creative expression; a log showing substantial human creative direction strengthens that claim).

## How this log is maintained (the rule)
- **Every founder prompt gets one entry**, appended in order, newest at the bottom. Entries are
  never edited or deleted after the fact (append-only); corrections go in a new entry.
- Each entry records the meta info below. Prompts are stored **verbatim** (they are the creative
  direction). If a prompt included an attachment (image, file), that is noted.
- The assistant writes the entry as part of handling the prompt. Keep the **response summary**
  concise but specific, and always tie it to the resulting **artifacts** (files, commit SHAs, PRs)
  so each instruction is traceable to the code that realized it.
- **Do not paste secrets** (keys, tokens, personal data) into this file; it is committed to the repo.
- This file is the detailed trail. `CLAUDE.md` only carries the short rule and points here, and
  `docs/PROJECT_STATUS.md` keeps the higher-level session narrative. Keep those lean; put the
  blow-by-blow here.
- **Append to the tail, don't re-read the whole log.** To add an entry you only need the last entry's
  number and the template above. Read the final ~30 lines, not the entire file, so logging stays cheap
  as history grows.

### Rotation policy (keep the live file bounded, added 2026-07-05)
This live file must not grow without limit. **Budget: keep the current session plus roughly the last 5
sessions here, and rotate whenever the live file passes ~1,200 lines.** To rotate, move the oldest
entries out of this file into the **ISO-week** archive under `docs/archive/prompt-log/` (one file per
week, `SESSION_PROMPT_LOG_YYYY-Www.md`; see that folder's `README.md` index). Append each moved entry to
the week file matching **its own date** (create the week file if it does not exist yet, with the same
short header the others use). Keep this header, the rule, and the entry template in the live file. The
week archives themselves are append-only history: never rewrite entries when moving them, and loading a
single week stays cheap because each week file is small.

### Automated raw capture (removed 2026-06-25)
There used to be a `UserPromptSubmit` hook (`.claude/hooks/log-prompt.sh`) that appended one JSON
line per prompt to **`docs/prompt-log-raw.jsonl`**. The founder asked for it to be removed on
2026-06-25, so the hook and its script are gone and `.claude/settings.json` no longer wires it. The
existing `docs/prompt-log-raw.jsonl` is kept as a historical record but is no longer appended to.
This curated Markdown file remains the prompt log, and entries are now added **manually**. The founder
directed (s42) that **any "update the documentation"-type request implies updating this log too**, even
when the prompt log is not named explicitly. So whenever you update `docs/PROJECT_STATUS.md` for a
session, append that session's prompts here as well and ship them together.

### Entry template
```
## Entry N — <YYYY-MM-DD HH:MM UTC>
- **Branch:** <git branch>
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** <none | description>
- **Prompt (verbatim):**
  > <the founder's message>
- **Response summary:** <what the assistant did / answered>
- **Artifacts:** <files changed · commit SHAs · PR #s · merge SHAs>
```

---

## Archived entries

Entries **1–391 (through 2026-07-14, session 119)** are archived by ISO week under
**`docs/archive/prompt-log/`** (`SESSION_PROMPT_LOG_2026-W25/W26/W27/W28/W29.md`; see that folder's
`README.md` index). This file holds **session 133 / 2026-07-19 onward** (s120–132 were rotated into the
W29 chunk on 2026-07-20). Keep appending here, newest at the bottom, and rotate per the policy above.

## Session 133 — 2026-07-19 — Brand-kit modernization plan

- **Branch:** `claude/brand-kit-modernization-igqlnm`
- **Prompt 1 (verbatim):** `> check the brand spec document, scope the work with a robust plan with clear model recommendations for each chunk of work. Except for the logo, feel free to deviate subtly wherever needed to make the brand kit of app look modern and top billion dollar successful edutech app. Aim for the highest quality and excellent output. Save the plan to repo.`
- **Response 1 (Fable 5):** Read `docs/branding/BRAND_SPEC.md` and surveyed every brand touchpoint in
  the code (tokens in `src/index.css`/`tailwind.config.ts`, hardcoded hexes in `nav-items.ts`,
  `route-icons.tsx`, `graphPalette.ts`, `UebenPath.tsx`, the four `features/welt` chrome files,
  `domain-buildings.tsx`, `index.html`, `vite.config.ts` manifest, `prerender-help.mjs`, the
  `public/` icon set, and the landing page). Authored
  **`docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md`**: a four-PR implementation sequence (A atomic
  token flip + accent-role audit + chrome/meta, Fable 5 · B logo outline + full icon/og pipeline
  with zero deviation, Opus 4.8 · C deep surface sweep of game/map/buildings/landing, Opus 4.8 or
  Sonnet 5 · D dark-mode design pass + typography/motion/reward polish, Fable 5), a
  sanctioned-deviations register (logo locked; primary darkening for AA, `--accent-ink`,
  ink-on-Koralle, gradient demotion, der-token nudge, dual theme-color metas, typography
  micro-polish), computationally verified WCAG contrast findings (white on Nachtblau 4.27:1,
  Nachtblau on Papier 3.96:1, Himmelblau on white 1.94:1, white on Koralle 3.26:1), a proposed
  permanent `check:contrast` gate, and a risk register (accent-foreground white→ink semantic flip,
  PWA stale cache, locked palettes re-hued only, OAuth consent-logo re-upload). Docs-only session:
  no `src/` change. Also aged the s131 handoff into the W29 archive per the doc-hygiene rule.
- **Artifacts (Prompt 1):** `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · PR #592
- **Prompt 2 (verbatim):** `> go ahead with a`
- **Response 2 (Fable 5):** Built and shipped plan PR A, the atomic brand flip. Token systems for
  both themes in `src/index.css` (Papier ground, Nachtblau primary at `221 83% 54%`, Himmelblau
  accent with ink pairing + new `--accent-ink`, Koralle reward at `11 82% 54%`, warm `--shadow`
  `#22304F`; all deviations WCAG-driven and documented in the BRAND_SPEC status header),
  `tailwind.config.ts` accent.ink + re-stopped accent-gradient + quieted mesh, the
  `text-accent`→`text-accent-ink` sweep across 7 files, chrome alignment (`nav-items.ts`,
  `route-icons.tsx` BRAND, `graphPalette.ts` beruf/professional → Nachtblau), shell/meta
  (dual theme-color metas + no-JS shell in `index.html`, manifest `#3D74ED`/`#151320`,
  `prerender-help.mjs`, `src/main.tsx` boot-error gradient), and the permanent
  `scripts/check-contrast.mjs` gate wired into `validate.yml` (42/42 pairings pass). Gates all
  green (typecheck, lint 0 errors, test:unit 219, build, bundle 80.8 kB). Playwright screenshots
  light+dark × mobile+desktop verified Praktisch, Theorie (Karten + Graph), Fortschritt, Landing.
  Marked PR A shipped in the plan + BRAND_SPEC. Squash-merged to `main`.
- **Artifacts (Prompt 2):** `src/index.css` · `tailwind.config.ts` · `scripts/check-contrast.mjs` ·
  `package.json` · `.github/workflows/validate.yml` · `src/components/layout/nav-items.ts` ·
  `src/components/layout/route-icons.tsx` · `src/lib/graphPalette.ts` · `index.html` ·
  `vite.config.ts` · `scripts/prerender-help.mjs` · `src/main.tsx` · 7 `text-accent` call-site
  files · `docs/branding/BRAND_SPEC.md` · `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` · PR (see
  merge commit on `main`)
- **Prompt 3 (verbatim):** `> go ahead with b and c`
- **Response 3 (Opus 4.8):** Shipped brand plan PRs B and C as two PRs.
  **PR B (#594) — logo + icon pipeline:** outlined the lowercase g from **Inter 800** (chosen from a
  5-candidate panel rendered on the locked swipe — Inter 800/900, Manrope 800, Figtree 900, Nunito
  900 — for wordmark cohesion with the app's Inter UI type + favicon-scale legibility) into a real
  `<path>` via opentype.js. Wrote `scripts/branding/build-logo-assets.mjs` (dev tooling, not in the
  app build): one source of truth for the swipe + outlined-g, rasterizing every `public/` asset with
  Playwright Chromium (no sharp) — default logo + favicon-16/32/48 (transparent corners),
  apple-touch/pwa-192/512 (full-bleed opaque), maskable (inner 80%), a new Papier og-image (mark +
  Inter-800 wordmark + tagline + genauly.de plate), and the canonical
  `preview/branding/genauly-logo-final.svg`. Verified on white/dark + iOS/circle mask sims and in the
  app header/landing/sidebar.
  **PR C (#595) — deep surface sweep:** Neuland game chrome `#5b5be6`→Nachtblau `#3D74ED` across all
  four welt files (`GAME_INDIGO`→`GAME_BLUE`; leather-backpack amber art + `GAME_OUT` outline kept as
  game props; victory loot already Koralle via PR A); Üben map route/Bahnhof→Nachtblau, MAP_LIGHT
  scenery tints hue-shifted 245→221 at identical (founder-locked) lightness, MAP_DARK route→`#8AB0F9`;
  Büro building→Nachtblau; landing step-chips + closing CTA band flattened to flat `bg-primary` (hero
  CTAs + "plateau." headline keep the gradient per the discipline); der token deepened to a cooler
  cobalt (light `226 74% 48%` / dark `226 88% 76%`) so a der Wesen never reads as the brand.
  Gates green (typecheck, lint 0 errors, test:unit 219, build, bundle 80.8 kB, contrast 42/42).
  Verified in-mission battle chrome, Spielen hub, Theorie der/die/das marks, flattened landing CTA.
  Both squash-merged to `main`; docs (BRAND_SPEC, plan, PROJECT_STATUS, this log) updated.
- **Artifacts (Prompt 3):** `scripts/branding/build-logo-assets.mjs` · `preview/branding/genauly-logo-final.svg` ·
  `public/` (9 icon/og assets) · `src/features/welt/{stage,BattleView,MissionPlayer,scenes}.tsx` ·
  `src/features/dashboard/UebenPath.tsx` · `src/components/city/domain-buildings.tsx` ·
  `src/features/landing/LandingPage.tsx` · `src/index.css` · `CLAUDE.md` ·
  `docs/branding/BRAND_SPEC.md` · `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` · PRs #594, #595
- **Prompt 4 (verbatim):** `> go ahead `
- **Response 4 (Fable 5):** Shipped brand plan PR D (#596), completing the rebrand. The PR A dark
  theme survived its design review nearly intact; judged changes: dark `--muted-foreground` 76%→72%
  (hierarchy: secondary text now reads secondary, still ~8:1 on the ground), streak surfaces moved
  from warning/Butter to **Koralle** (header streak pill `bg-reward-bg`/`text-reward`/`fill-reward`,
  Fortschritt "Aktuelle Serie" StatCard via a new `reward` accent), `tabular-nums` on the StatCard
  value (the one numeric surface missing it), and the CLAUDE.md color-language sweep (brand
  indigo→Nachtblau, reward-gold→Koralle; DECISIONS.md deliberately kept as history). Found already
  done and left alone: button pressed states (`active:scale-[0.98]`), display `tracking-tight`,
  Analytics/session tabular-nums. Gates green (typecheck, lint 0 errors, test:unit 219, build,
  bundle 80.8 kB, contrast 42/42 incl. the retuned dark muted pairs). Verified the Koralle streak
  pill light+dark and the dark Fortschritt hierarchy by screenshot. BRAND_SPEC flipped to FULLY
  IMPLEMENTED; the plan doc records all four PRs (#593 Fable 5 · #594/#595 Opus 4.8 · #596 Fable 5).
  Squash-merged to `main`.
- **Artifacts (Prompt 4):** `src/components/layout/AppShell.tsx` · `src/components/shared/StatCard.tsx` ·
  `src/features/analytics/Analytics.tsx` · `src/index.css` · `CLAUDE.md` · `docs/branding/BRAND_SPEC.md` ·
  `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` · `docs/PROJECT_STATUS.md` · PR #596
- **Prompt 5 (verbatim):** `> document the session. ` _(switched session model to Opus 4.8)_
- **Response 5 (Opus 4.8):** Started the documentation close-out (the session had been documented
  incrementally after each PR, so this was the hygiene sweep: refreshed the s133 handoff header in
  `PROJECT_STATUS.md` from "PLAN authored" to "plan authored AND fully shipped"). Interrupted by
  prompt 6 before finishing; folded the remaining doc work into the prompt-7 pass below.
- **Prompt 6 (verbatim):** `> store all the brand kit items in a dedicated repo. generate proper brand kit if any of them isn't available. `
- **Response 6 (Opus 4.8):** Asked (AskUserQuestion) whether the kit should be a standalone GitHub
  repo or a folder in this repo; founder chose **folder in this repo** (recommended: one source of
  truth, no drift). Built **`brand-kit/`** + the generator **`scripts/branding/build-brand-kit.mjs`**,
  which reads the mark constants + the live tokens from `src/index.css` so the kit cannot drift from
  what ships. **Generated the missing pieces** a proper kit needs: the "Genauly" **wordmark** (outlined
  from Inter 800 glyph-by-glyph with kerning, bypassing an unsupported opentype GSUB feature →
  `scripts/branding/wordmark-data.mjs`), horizontal + stacked **lockups** (ink + white), a **mono
  knockout** mark (swipe filled, g cut out as negative space, verified legible on white/Papier/blue/
  ink grounds), a **clear-space** guide, the **palette.svg** swatch sheet + `tokens.css`/`tokens.json`,
  an **Inter type specimen**, copied **app icons**, a **square social avatar** + og-image, PNG
  **preview** contact sheets, and a **README** with full usage rules. ~592 kB, 27 files. Verified the
  logo-overview, palette, typography, and mono sheets by screenshot.
- **Prompt 7 (verbatim):** `> then document the session once done with the current task`
- **Response 7 (Opus 4.8):** This close-out. Folded the brand-kit deliverable into the s133
  `PROJECT_STATUS.md` handoff, noted it in the plan doc + a new CLAUDE.md Brand-logo bullet (where the
  kit lives + how to regenerate), refreshed the handoff header, and logged prompts 5–7 here. Doc
  hygiene checked: `PROJECT_STATUS.md` holds the two most recent handoffs (s133 + s132), under the
  250-line cap. Shipped with the brand-kit PR.
- **Artifacts (Prompts 5–7):** `brand-kit/` (27 files) · `scripts/branding/build-brand-kit.mjs` ·
  `scripts/branding/wordmark-data.mjs` · `CLAUDE.md` · `docs/PROJECT_STATUS.md` ·
  `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 8 (verbatim):** `> for the dark mode logo, why can't you use the same blue for the highlight but white for the letter g?`
- **Response 8 (Opus 4.8):** Rendered the option rather than asserting: white-g + Himmelblau swipe on
  dark actually works (the descender reads on the dark ground; the bowl-on-swipe contrast is modest
  but legible at logo size). Explained the app was using ONE universal Papier-tile mark, not a
  theme variant. Offered A (tile-less white g) vs B (dark sticker tile + white g); founder picked B.
- **Prompt 9 (verbatim):** `> the white g looks too white.m can you look for a lighter shade and provide some previews?`
- **Response 9 (Opus 4.8):** Rendered 6 g shades on the dark tile (pure white → Papier cream →
  off-whites → grey-lavender → steel blue) and sent the comparison; asked which to use, recommending
  Papier `#FAF6EC`. Founder replied "[No preference]", so I took the recommendation.
- **Prompt 10 (verbatim):** `> also, the logo should just be the letter with the blue highlight.. the background shouldn't be part of the logo and should always be transparent. all the previews you provided look the samem generate an html artifact`
- **Response 10 (Opus 4.8, artifact-design skill):** Two changes: the logo becomes **tile-less**
  (transparent always, just swipe + g), and I built a proper interactive **HTML artifact**
  (`brand-kit/previews/logo-preview.html`, theme-aware, Papier/Tinte + Nachtblau, marks at full size)
  showing the tile-less mark on transparent/light/dark grounds + the dark-mode g-shade chooser so the
  differences actually read. Published via the Artifact tool.
- **Prompt 11 (verbatim):** `> provide the artifact here`
- **Response 11 (Opus 4.8):** Rendered the artifact inline via SendUserFile (display:render) and
  re-shared the published URL.
- **Prompt 12 (verbatim):** `> go ahead with the recommendation` (+ mid-turn: `once done with the current task, check if the branding is applied to the app well and make any improvements or corrections if needed, then document the session and push everything to main`)
- **Response 12 (Fable 5 → Opus 4.8):** Implemented the tile-less logo end-to-end with Papier g on
  dark. `build-logo-assets.mjs` now emits `genauly-logo.png` (ink g) + `genauly-logo-dark.png`
  (Papier g), both transparent/tile-less; favicons/PWA keep their tile. New shared
  `src/components/shared/Logo.tsx` swaps them on `.dark` (no JS); all 7 in-app logo spots switched to
  `<Logo>` with no tile/rounded/glow box; the dark no-JS shells (`index.html`, `prerender-help.mjs`)
  hard-code the dark logo; the old `genauly-default-logo-transparent-corners.png` removed. Brand kit +
  its generator + README updated to tile-less (mark/mark-dark/app-icon-tile, lockups, overview).
  Branding QA: verified the logo swap in header/landing/sign-in light+dark; the wider app was already
  verified across PRs A–D. Gates green (typecheck, lint 0 errors, test:unit, build, bundle 80.8 kB,
  check:contrast). Docs (PROJECT_STATUS, BRAND_SPEC, CLAUDE.md, this log) updated; pushed to `main`.
- **Artifacts (Prompts 8–12):** `src/components/shared/Logo.tsx` · `public/genauly-logo.png` ·
  `public/genauly-logo-dark.png` · `scripts/branding/build-logo-assets.mjs` ·
  `scripts/branding/build-brand-kit.mjs` · `brand-kit/` (logo/README/previews incl.
  `logo-preview.html`) · 7 in-app logo components · `index.html` · `scripts/prerender-help.mjs` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/branding/BRAND_SPEC.md` · `docs/SESSION_PROMPT_LOG.md`

## Session 134 — 2026-07-19 — Mobile filter rail height, park Verbunden, Option B word cards

- **Branch:** `claude/filter-rail-mobile-height-n8ktd6`
- **Model:** Opus 4.8 (founder switched to it via `/model` mid-way through prompt 1).
- **Prompt 1 (verbatim):** `> the filter rail occupies a bit too much space on mobile view when opened. reduce its height by 3-4 lines worth of space for mobile. `
- **Response 1 (Opus 4.8):** Reduced the `FilterRail` mobile `panel` cap from `max-h-[55dvh]` to
  `max-h-[45dvh]` (`src/features/shared/FilterRail.tsx`), ~10 dvh / roughly 3-4 text lines on a phone,
  leaving more of the card list visible; the fixed header + internal scroll region keep the filters
  reachable. Typecheck green. Committed + pushed; not yet shipped at this point.
- **Prompt 2 (verbatim):** `> the verbunden drop-down and links to other parts of the app can be parked for now as I need to brainstorm on it and think how it's useful and what are the dependencies for it. for now keep it hidden. Then provide a few previews of rearranging items on the cards for best looks. `
- **Response 2 (Opus 4.8):** Traced "Verbunden" to the vocab-card cross-module panel (`RelatedPanel`
  → Kollokation/Schreibtraining/Dialog, toggled in `VocabList.tsx`). Parked it behind a reversible
  `const SHOW_RELATED = false` (gates `hasRelated`); `RelatedPanel.tsx` + `relatedRows` kept untouched
  so re-enabling is one line. Built `preview/vocab-card-layouts.html` (real design tokens, light/dark
  toggle, 2-up grid) with four card-rearrangement options — A baseline · B actions-to-the-foot ·
  C example bottom-anchored + plural pill · D genus color rail — and sent it via SendUserFile.
- **Prompt 3 (verbatim):** `> provide the artifact here again `
- **Response 3 (Opus 4.8):** Re-sent the same `preview/vocab-card-layouts.html` render.
- **Prompt 4 (verbatim):** `> i like option b. ` _(mid-turn follow-up: `> for the animation on the backside of the card, move it to the right of the card as for most of the cards the right side is empty. Also, the female animation seems too slow and not as snappy as for the others, so fix it.`)_
- **Response 4 (Opus 4.8):** Implemented Option B in `VocabList.tsx` (quiet headline = creature + word
  left / bookmark right; example gets room; foot row pins plural pill left + speak button right via
  `mt-auto`). For the mid-turn asks: gave `ArtikelEffect` a new `align` prop and passed `align="right"`
  from the card back (origin → `--fx-x: 78%`, the empty right side; `SessionPlayer` stays centered),
  and made the "die" bloom snappier — `470ms` fast-out cubic-bezier (was `650ms` ease-out) with a
  tighter `200/280/360ms` ring stagger (was `200/310/420`). The three `.artikel-fx-*` origins now read
  `var(--fx-x, 50%)`. Gates: typecheck clean, lint 0 errors, build green, `test:unit` 219/219.
- **Prompt 5 (verbatim):** `> give me a png preview here ` _(also `> provide the artifact here again` earlier; and a bare `> continue`)_
- **Response 5 (Opus 4.8):** Rendered a PNG of Option B (three front cards die/der/das + one back face
  showing the right-shifted reveal), light + dark side by side, by driving the pre-installed headless
  Chromium (`/opt/pw-browsers/chromium-1194`) against a scratchpad HTML built from the real tokens
  (no Playwright package available). Sent it via SendUserFile.
- **Prompt 6 (verbatim):** `> yes ` _(to opening + merging a PR for the batch)_
- **Response 6 (Opus 4.8):** Opened **PR #598** into `main` (no PR template in repo) and squash-merged
  it (`796fb01`): filter-rail height, parked Verbunden + preview, Option B cards, reveal-effect move +
  die timing. Ran the required post-merge realignment (`fetch origin main` → `reset --hard` →
  `push --force-with-lease`) so the dev branch is level with `main`.
- **Prompt 7 (verbatim):** `> document the session `
- **Response 7 (Opus 4.8):** This close-out. Added the s134 handoff to `PROJECT_STATUS.md`, aged the
  s132 handoff into the W29 archive per the two-handoff hygiene rule, refreshed the `_Last updated_`
  header to s134, and logged prompts 1-7 here.
- **Artifacts:** `src/features/shared/FilterRail.tsx` · `src/features/vocabulary/VocabList.tsx` ·
  `src/components/artikel/ArtikelEffect.tsx` · `src/index.css` · `preview/vocab-card-layouts.html` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · commits `2f1c7d4` / `1c48a33` /
  `df0c9bd` · PR #598 (squash `796fb01`)

## Session 135 — 2026-07-20 — Game demo-readiness review + P0 batch (Fable 5)

- **Branch:** `claude/game-review-demo-readiness-8fdpid`
- **Prompt 1 (verbatim):** `do a comprehensive review and analysis of the current game and provide priority actions and recommendations so that the game can also be presented in the demo this week.`
- **Response 1:** Reviewed the Neuland layer end-to-end: re-ran gates (typecheck, test:unit 219,
  lint:content), then a scripted Playwright playthrough (390x844) of the hub (light+dark), mission
  1.1 incl. the battle + bag ask flow, the boss opening, and the Heute → Spielen embed — zero console
  errors. Authored `docs/plans/GAME_DEMO_READINESS_REVIEW.md`: verdict "demo-ready with one must-fix
  bug" (the Spielen compact tile opens scrolled to max, hiding the next mission; offsetParent bug in
  `NeulandHub.tsx`), a Nachtblau asset-regen P1 (assets still carried pre-rebrand `#5b5be6`), founder
  prep tasks, and a 3–4-minute game demo script. Started committing doc updates.
- **Prompt 2 (verbatim):** `why are you editing the documentation.. you haven't yet delivered what I asked for`
- **Response 2:** Fair correction; delivered the full review in chat (verdict, evidence, prioritized
  P0/P1/P2, demo script, by-design caveats). Doc edits committed to the session branch only after the
  stop-hook required it; no merge to `main`.
- **Prompt 3 (verbatim):** `some of the game screenshots literally doesn't have a character sometimes.. why isn't that captured in the analysis?`
- **Response 3:** Verified the founder was right and the review had misfiled it as "placeholder art
  by design": `NPC_SPRITES` contained ONLY Frau Schmidt, so 4 of 5 dialogue battles ran against an
  invisible opponent, and only the hotspot renderer places the player. Re-ranked the priorities:
  battle-NPC sprites became P0.2, cutscene character placement P1.
- **Prompt 4 (verbatim):** `which model you recommend for p0 and p1?`
- **Response 4:** Sonnet 5 for the scroll fix, Fable 5 for the sprite design (character art in the
  blessed style), Haiku-grade for the recolor riding along, Sonnet 5 for the cutscene pass; offered
  to run the whole P0 batch in the current Fable session.
- **Prompt 5 (verbatim):** `go ahead with the whole P0 batch in this session`
- **Response 5:** Shipped the batch: (1) `NeulandHub.tsx` compact tile made `relative` (auto-center
  fixed; verified fresh profile → 1.1–1.3, mid-chapter → 1.4 centered); (2) four new 26x32 battle-NPC
  sprites authored in `welt_assets.py` (Grenzbeamte cap+badge, Milo lanyard, Kassiererin apron,
  Herr Brandt balding+mustache), registered in `stage.tsx` `NPC_SPRITES` + `sprite:` fields in
  `missions.ts` + the linter `GAME_SPRITES` mirror; (3) `INDIGO`→`(61,116,237)` Nachtblau, all assets
  regenerated. Verified via sprite sheets, per-backdrop anchor composites, and a Playwright run
  (Beamter renders in the 1.1 battle, zero errors). Gates: typecheck ✓, lint 0 errors ✓,
  lint:content ✓, test:unit 219 ✓, build ✓, bundle 80.7 kB ✓. Updated the review doc with the
  implementation record + the founder-caught finding, refreshed `PROJECT_STATUS.md`, logged here.
- **Artifacts:** `docs/plans/GAME_DEMO_READINESS_REVIEW.md` · `src/features/welt/NeulandHub.tsx` ·
  `preview/game-pixel-mockups/welt_assets.py` · `src/features/welt/assets/*` (4 new sprites + 6
  recolored) · `src/features/welt/stage.tsx` · `src/data/missions.ts` · `scripts/lint-content.mjs` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  commit `46e22eb` + the P0-batch commit/PR
- **Prompt 6 (verbatim):** `go ahead with p1 tasks` _(model switched to Opus 4.8 via /model for this turn)_
- **Response 6 (Opus 4.8):** Shipped the P1 cutscene-character pass. Root gap: all 19 cutscenes
  rendered empty rooms (only hotspot placed the player), and the dominant cutscene speaker Jonas
  (22 lines) had no sprite. Authored a **Jonas sprite** in `welt_assets.py` (messy brown hair, rust
  hoodie, denim; validated 26x32, distinct from the cast), registered in `stage.tsx` `NPC_SPRITES` +
  `sprite:` on `npc_jonas` in `missions.ts` + the linter `GAME_SPRITES` mirror. Added `CutsceneCast`
  to `scenes.tsx`: the player stands bottom-left on every backdropped cutscene (the `website` prop
  scene stays character-free), the speaking NPC stands right (current line's speaker if sprited, else
  the scene's primary sprited NPC via useMemo, so it doesn't flicker on narrator/player lines).
  Placement composite-checked on all five cutscene backdrops; verified in-app that the player renders
  on the 1.1 arrivals cutscene (zero console errors). Listening/automat/form/loadout deliberately keep
  their prop/device focus (no person). Gates: typecheck ✓, lint 0 errors ✓, lint:content ✓,
  test:unit 219 ✓, build ✓, bundle 80.7 kB ✓. Updated the review doc (P1 item + implementation
  record), `PROJECT_STATUS.md`, and this log.
- **Artifacts (P1):** `preview/game-pixel-mockups/welt_assets.py` (Jonas) ·
  `src/features/welt/assets/jonas.png` (new) · `src/features/welt/stage.tsx` ·
  `src/features/welt/scenes.tsx` (`CutsceneCast`) · `src/data/missions.ts` · `scripts/lint-content.mjs` ·
  `docs/plans/GAME_DEMO_READINESS_REVIEW.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 7 (verbatim):** `document the session`
- **Response 7 (Opus 4.8):** Session close-out. Most doc updates already landed inline during the P0
  and P1 work; this pass verified and completed them: confirmed the s135 `PROJECT_STATUS.md` handoff
  reflects both the P0 batch and the P1 cutscene pass (P0.1 scroll fix, P0.2 battle-NPC sprites, P1
  Nachtblau regen, P1 cutscene `CutsceneCast` + Jonas), refreshed the `_Last updated_` header, added
  a **game-layer sprite/cutscene convention note to `CLAUDE.md`** (every scene shows people;
  `NPC_SPRITES` is linter-mirrored by `GAME_SPRITES`; new NPCs must ship a sprite; `CutsceneCast`
  placement rules) so a future session doesn't regress it, and logged prompts 6–7 here. No app code
  changed in this turn.
- **Artifacts (doc pass):** `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/plans/GAME_DEMO_READINESS_REVIEW.md`

## Session 136 — 2026-07-20 — Landing-page redesign (analysis → previews → ship)

- **Branch:** `claude/landing-page-redesign-iqxlja`
- **Prompt 1 (verbatim):** `> do an analysis of the landing page and improve it such that it provides the highest value to the learner and has highest conversion rate. The visuals and quality should resemble a billion dollar edutech app with excellent finesse which also includes creative elements, doodles, artistic elements and visual coherence wherever applicable. Go ahead and provide a couple of previews of the homepage for such highest standards. `
- **Response 1:** Audited `src/features/landing/LandingPage.tsx` against conversion best practice
  (biggest gaps: no product visual anywhere, no honest proof/trust signals, flat card grids, competing
  hero CTAs, the OAuth prose block killing momentum) and built two self-contained on-brand previews in
  `preview/landing-redesign/`, both reusing the shipped logo geometry and the real Wesen creature paths:
  **A "Der Textmarker"** (warm Papier editorial; the Himmelblau highlighter swipe as the page-wide
  device, doodle annotations, flashcard collage hero, scenario marquee, "Du bist hier" plateau chart,
  bento feature grid, honest content-count band) and **B "Die Nachtstadt"** (cinematic night-city hero
  with the six lit domain buildings + phone mockup of the Heute screen, trust bar, three product splits
  incl. Neuland and the word constellation, data-quality tier band, "Die Stadt wird hell, wenn du übst"
  closer). Verified both at 1280/390 px via headless Chromium, fixed badge overlap / mobile nav wrap /
  floating-chip collisions, wrote the analysis into `preview/landing-redesign/README.md`, pushed, and
  sent the founder the two HTMLs plus full-page desktop/mobile screenshots. Nothing shipped to the app
  yet; awaiting the founder's pick before implementing in `LandingPage.tsx`.
- **Artifacts:** `preview/landing-redesign/landing-a-textmarker.html` ·
  `preview/landing-redesign/landing-b-nachtstadt.html` · `preview/landing-redesign/README.md` ·
  commit `253534e`
- **Prompt 2 (verbatim):** `> provide the artifacts now here by publishing them `
- **Response 2:** Published both previews as claude.ai artifacts (adapted copies: document
  wrapper stripped, CDN font link removed since the artifact CSP blocks external hosts; the
  system-font fallback matches the shipped app, which does not self-host Inter).
- **Prompt 3 (verbatim):** `> I like preview a very much. Just make sure the logo as a whole should be horizontally aligned with the text Genauly beside it. Currently it seems as if the logo is somewhat lower compared to the Genauly text. for the landing page, add some menu items on the top like About, Sources, Help, etc. Make use of existing pages. Additionally, Stress on the landing page somewhere about the fact that the learner can specifically filter the words by various criteria and practice by custom ueben session. Finally, the page should predominantly be in English with German used only for the no-brainer or obvious stuff - the german words should be only 10-20% of the total words. ` _(mid-turn follow-up: `> in addition to the above comments and tasks, also provide an option to switch to German on the homepage just like other pages in the app`)_
- **Response 3:** Preview A revised: logo viewBox cropped to the artwork bounds (`7 12 52 52`)
  so the mark centers optically on the wordmark; nav + footer link the real pages (/about,
  /hilfe, /sources, /privacy, /terms); new "Filter what you need. Practice exactly that."
  section with a filter-rail mockup (Thema/Stufe/Wortart/Branche + Üben footer) selling the
  faceted library and custom scoped Üben sessions; all copy rewritten English-first with
  German only for obvious/brand terms; and a working EN/DE nav toggle (JS dictionary swaps
  the whole page's copy, mirroring the bilingual public pages). Verified via headless
  Chromium (EN/DE roundtrip clean, DE nav fits one line), artifact A republished at the
  same URL.
- **Artifacts (rev 2):** `preview/landing-redesign/landing-a-textmarker.html` ·
  `preview/landing-redesign/README.md`
- **Prompt 4 (verbatim):** `> if the user already logged in, the landing page cta should be go to app, not go to dashboard. also, regarding the claim "no textbook" - replace it with something else. This app is never a direct replacement for traditional learning but a smart and modern companion for learning. `
- **Response 4:** Steps headline replaced: "Three steps. No textbook." became "Three steps.
  Your smart companion." (DE "Dein smarter Begleiter."); the companion-not-replacement
  positioning rule is recorded in the preview README for all future landing copy. The
  logged-in CTA spec ("Go to app" / "Zur App" routing to `/`, replacing the live page's
  "Zum Dashboard") is recorded there too since the preview shows only the logged-out
  state. Fixed the two mobile fallouts the longer headline exposed (h2 down to 1.55rem
  below 480px; nav drops the wordmark below 520px, matching the shipped app header) and
  verified zero horizontal overflow at 390px in both languages. Artifact republished at
  the same URL.
- **Prompt 5 (verbatim):** `> looks good. the caption says "German for real life B1-B2" remove the B1-B2 there. implement the design, document the session and merge everything to main `
- **Response 5:** Removed "· B1–B2" from the hero eyebrow (both languages; footer tagline kept).
  Then implemented the approved Preview A as the real landing: `src/features/landing/LandingPage.tsx`
  rebuilt from scratch (token-based colors so dark mode works; sticky nav with anchors +
  About/Help/Sources + EN/DE LangToggle + auth-aware CTA; swiped hero + Wesen flashcard collage;
  scenario marquee; PlateauChart; bento features; filter-rail mock + custom-Üben section; dark
  numbers band; "Your smart companion." steps; the OAuth "What is Genauly?" purpose card preserved
  bilingually; FAQ; closing CTA; footer), with all copy as inline `t(en, de)` pairs and logged-in
  visitors getting "Go to app"/"Zur App". New `.landing-*` CSS (swipe/float/marquee,
  reduced-motion-safe) in `src/index.css`; fixed a transform-override bug (CSS float animation vs
  Tailwind translate/rotate) found via rendered-output verification (pnpm preview + headless
  Chromium: light/dark, EN/DE, 390/1280, logged-in). Gates: typecheck ✓, lint 0 errors, build ✓,
  test:unit 219/219, bundle 111 kB / 400 kB. Documented (PROJECT_STATUS s136 handoff; s133 handoff
  aged into the new W30 archive chunk; this log), opened a PR into main and squash-merged, then ran
  the post-merge realignment.
- **Artifacts (implementation):** `src/features/landing/LandingPage.tsx` · `src/index.css` ·
  `preview/landing-redesign/*` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 6 (verbatim):** `> [2 live-site screenshots] this looks different from the artifact. Make the button normal without the glow. Also, for the example card - Bewerbung, the card doesn't float as shown in the preview artifact - fix it. Save the artifact also to the repo. ` _(mid-turn follow-up: `> don't edit all the buttons' glow. Only the blue card's white button has too much glow which needs fixing.`)_
- **Response 6:** Removed the shadow from ONLY the closing blue card's white CTA (the halo the
  founder flagged); per the mid-turn correction the nav/hero/Üben-mock buttons keep their original
  `shadow-glow`. The hero "Bewerbung" collage float was converted from the CSS keyframe (present in
  the built CSS but not running on the founder's iPhone) to framer-motion (`float()` helper,
  `y: [0,-9,0]`, 7s loop, staggered delays), the same animation engine the rest of the app
  demonstrably runs on that device; the dead `.landing-float` CSS was removed. The published
  artifact's single-file copy was saved to the repo as
  `preview/landing-redesign/landing-a-artifact.html`. Verified in the production build (float
  transform sampled moving; closing-button screenshot halo-free). Gates: typecheck ✓, lint 0
  errors, build ✓, test:unit 219/219, bundle 110.8 kB. Squash-merged to main.
- **Prompt 7 (verbatim):** `> document the session `
- **Response 7:** This close-out. The session's documentation had been kept current at each merge
  (s136 status handoff incl. the fix round, W29/W30 archive reconciliation after the parallel game
  session, prompts 1-6 logged here); this pass added the final prompt entry and shipped it to main.
  Session 136 total: landing analysis → two previews (A "Der Textmarker" picked, B "Die Nachtstadt"
  parked) → four founder feedback rounds → full implementation in `LandingPage.tsx` → post-launch
  device fixes (closing-CTA halo, framer float) → docs. PRs #603, #605, #606 squash-merged.
- **Artifacts (session total):** `src/features/landing/LandingPage.tsx` · `src/index.css` ·
  `preview/landing-redesign/` (2 mockups + artifact copy + README) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md` · PRs #603 (`4c32e58`),
  #605 (`766584b`), #606 (`f065c60`)

## Session 137 — 2026-07-20 — Branding-refresh review + premium pass (fixes 1-7)

- **Branch:** `claude/app-branding-refresh-review-bmrly2`
- **Prompt 1 (verbatim):** `> review the branding refresh of the app. Insert some of the elements from previous versions like gradients on the buttons, better text styles as the current one doesn't look as premium as before. do a thorough analysis and report top ten things to refine or update.`
- **Response 1 (merged with prompt 2's instruction):** Began evidence-gathering: diffed the s133
  rebrand PRs A-D and the s136 landing against the pre-rebrand design system (old indigo→cyan
  gradient vs the new muddier Nachtblau sweep, flattened landing CTAs/step chips, near-invisible
  mesh, unused `.text-gradient`, three competing eyebrow recipes, stale indigo/violet remnants).
- **Prompt 2 (verbatim):** `> don't implement any changes yet, provide me the report first`
- **Response 2:** Delivered the analysis-only report: what shipped in s133, which premium cues were
  lost, and a ranked top-ten refinement list. (1) retune `accent-gradient` to end bright; (2) fix
  the dark-mode gradient contrast defect (fixed end stop ~2.5:1 under dark text, invisible to
  `check:contrast`); (3) restore gradients on landing CTAs/step chips/closing band; (4) subtle
  gradient on the default Button; (5) unify display typography; (6) one canonical eyebrow style;
  (7) purge pre-rebrand indigo/violet remnants; (8) re-derive HubHero/themes.ts rainbow gradients
  from the brand family; (9) align dark mode's violet hue (250) with the brand hue (221); (10)
  restore a whisper of ambient depth (mesh + `.text-gradient` moments). No code changed.
- **Prompt 3 (verbatim):** `> go ahead with all the fixes until 7`
- **Response 3:** Implemented fixes 1-7: token-driven `--gradient-from`/`--gradient-to` (light deep
  Nachtblau → primary → vivid sky; dark light end-to-end), both stops added to the
  `check-contrast.mjs` gate (46/46 pass); landing nav/hero CTAs + step chip 1 back on
  `bg-accent-gradient` with theme-aware `text-primary-foreground`; default Button top sheen; new
  `.text-display` applied to every page H1 (SectionHeading, HubHero, Lernpfad, Neuland,
  GrammarTopicView, LegalChrome, HelpChrome, QuizHub, WritingHub) and `.text-eyebrow` (headers +
  6 landing eyebrows); indigo/violet purge (Neuland Boss tag → primary tint, game Chip tone
  indigo→blue, QuizHub hero + intent cards + Anwenden Prüfung card → brand-family gradients, stale
  comments reworded). Gates: typecheck ✓, lint 0 errors, test:unit 219/219, build ✓, bundle
  110.9 kB, check:contrast 46/46. Verified rendered output via pnpm preview + headless Chromium
  (landing light/dark, Anwenden, Fortschritt). Documented (s137 handoff; s135 aged into the new
  W30 archive chunk; this log), PR into main squash-merged, post-merge realignment run.
- **Artifacts:** `src/index.css` · `tailwind.config.ts` · `scripts/check-contrast.mjs` ·
  `src/components/ui/button.tsx` · `src/components/shared/misc.tsx` ·
  `src/components/shared/HubHero.tsx` · `src/features/landing/LandingPage.tsx` ·
  `src/features/dashboard/UebenPath.tsx` · `src/features/welt/NeulandHub.tsx` ·
  `src/features/welt/stage.tsx` · `src/features/quiz/QuizHub.tsx` ·
  `src/features/dashboard/intentCards.ts` · `src/features/anwenden/AnwendenHub.tsx` ·
  `src/features/grammar/GrammarTopicView.tsx` · `src/features/grammar/GrammarViews.tsx` ·
  `src/features/writing/WritingHub.tsx` · `src/features/legal/LegalChrome.tsx` ·
  `src/features/help/HelpChrome.tsx` · `src/components/layout/route-icons.tsx` · `CLAUDE.md` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 4 (verbatim):** `> go ahead with the rest of the items`
- **Response 4:** Shipped report items 8-10. (8) themes.ts accents with indigo/violet/purple/
  fuchsia re-derived from the brand families (meetings blue→sky, project teal→cyan, technology +
  digitales cyan→blue, bildung sky→blue, freizeit pink→rose), Sammlung hub tile → Koralle
  orange→red, Anwenden Prüfung card → amber→orange (matches ExamHub). (9) dark theme re-hued
  250 → 228 warm navy across background/surface/elevated/muted/border/input/foregrounds/ink
  (same L/S, contrast gate still green), plus the hard-coded shells: index.html dual theme-color
  + no-JS shell, vite.config.ts manifest background, prerender-help.mjs shell (#151320→#131620,
  #e8e6f0→#e7e8ef) and the brand kit (tokens regenerated via build-brand-kit.mjs; README +
  logo-preview hexes updated). (10) bg-mesh 0.07/0.06 → 0.10/0.09 and the landing numbers band's
  stat values gradient-clipped with fixed light Himmelblau stops (the band is fixed-dark in both
  themes). ALSO fixed a self-inflicted breakage: PR #609's squash contained an unresolved
  rebase-conflict marker in LandingPage.tsx (the conflicted file list had been truncated and
  gates were not re-run post-rebase), which broke main's build; resolved by keeping main's
  single-button primaryCta with the gradient classes. Gates re-run in full: typecheck ✓, lint 0
  errors, test:unit 219/219, build ✓, bundle 110.7 kB, check:contrast ✓, lint:content ✓; verified
  dark Fortschritt/Theorie + the landing numbers band by screenshot. Documented and squash-merged
  to main.
- **Artifacts (wave 2):** `src/data/themes.ts` · `src/features/collection/Sammlung.tsx` ·
  `src/features/anwenden/AnwendenHub.tsx` · `src/index.css` · `tailwind.config.ts` ·
  `index.html` · `vite.config.ts` · `scripts/prerender-help.mjs` · `brand-kit/color/tokens.*` ·
  `brand-kit/README.md` · `brand-kit/previews/logo-preview.html` ·
  `src/features/landing/LandingPage.tsx` · `CLAUDE.md` · `docs/PROJECT_STATUS.md` ·
  `docs/SESSION_PROMPT_LOG.md`
- **Prompt 5 (verbatim):** `> document the session `
- **Response 5:** This close-out. The session's documentation had been kept current at each merge
  (s137 handoff covering both waves + the hotfix, prompts 1-4 logged here, CLAUDE.md premium-pass
  conventions, the W30 archive chunk); this pass added the deploy confirmation to the handoff (the
  wave-1 Pages run failed on the #609 conflict marker, the wave-2 run add6529 went green, so both
  waves went live together), rewrote `docs/branding/BRAND_SPEC.md` §2 from "dark mode to be tuned"
  to the shipped, s137-re-hued warm-navy values, and logged this prompt. Session 137 total:
  branding-refresh review → ten-point report (report-first at founder request) → fixes 1-7 (PR
  #609) → items 8-10 + hotfix (PR #610) → docs. PRs #609, #610 squash-merged.
- **Artifacts (close-out):** `docs/PROJECT_STATUS.md` · `docs/branding/BRAND_SPEC.md` ·
  `docs/SESSION_PROMPT_LOG.md` · PRs #609 (`902ba22`), #610 (`add6529`)

## Session 138 — 2026-07-20 — Logo v2 rework (Himmel Soft swipe, wordmark, Randnah icons)

- **Branch:** `claude/logo-blue-contrast-xsfk19`
- **Prompt 1 (verbatim):** `> the blue highlight on the logo has a harsh contrast with black and white.. can you provide previews with lighter shades of blue?`
- **Response 1:** Published a claude.ai artifact preview rendering the actual mark geometry with
  the current Himmelblau #52C6F9 plus five lighter candidates (#74D2FA → #CFF0FE), each shown on
  the light Papier and dark navy grounds. No repo changes.
- **Prompt 2 (summary; attachment: home-screen icon screenshot):** Picked **Himmel Soft #8CDBFB**;
  asked for a full-word "genauly" logo with the highlight on the "genau" letters, keeping the
  g-only mark for constrained spots, and flagged the favicon mark as too small in its tile.
- **Responses 2-6 (preview iteration v2→v8):** Seven more artifact rounds refining the design per
  founder feedback: gentler swipe angle; dark-ground color rules (several missteps: whole-word
  two-tone, then a g-only narrow highlight, both rejected); the founder re-anchored on the
  Version-2 swipe ("exactly like the screenshot", "width or height exactly same from v2") with
  ONLY the letter g dual-tone on dark; favicon centered by true bbox with "Größer"/"Randnah" size
  options. Each round was verified by headless-Chromium screenshot before publishing (caught white
  slivers on e/n/a bottoms and letters-with-holes regressions).
- **Prompt 7 (verbatim):** `> finalize these logos and radnah favicon. Apply the logos everywhere in the app.` (interrupted, then:) `> remember this session's work is only about logos. So, the implementation should only be for the logos. now go ahead`
- **Response 7:** Implemented the finalized design, logos only: rewrote
  `scripts/branding/build-logo-assets.mjs` (Himmel Soft swipe; bbox-measured "Randnah" centering
  at 5% margin for favicons/apple-touch/pwa, 10% for maskable; two-tone dark marks; NEW lowercase
  wordmark assets rendered from the app's own Inter variable font with the exact v2 band
  geometry); regenerated all public/ icons + og-image + canonical SVG; `Logo.tsx` gained
  `variant="mark" | "wordmark"`; wordmark applied in Sidebar, AuthDialog, Onboarding, HelpChrome,
  LegalChrome, landing header (sm+)/footer, and the dark no-JS shells (adjacent "Genauly" text
  spans removed); mobile AppShell header keeps the mark. Brand kit swipe const updated + kit
  regenerated; BRAND_SPEC §3 + CLAUDE.md brand section rewritten. Fixed in verification: a
  responsive-utility clash that showed both theme images on the landing (display utilities now
  wrap `<Logo>` instead of being passed in). Gates: typecheck ✓ · lint 0 errors · test:unit
  219/219 · build ✓ · bundle 110.5 kB. Verified via `pnpm preview` + headless Chromium
  (landing light/dark/mobile, /hilfe dark). Squash-merged to `main`.
- **Artifacts:** `scripts/branding/build-logo-assets.mjs` · `scripts/branding/build-brand-kit.mjs` ·
  `src/components/shared/Logo.tsx` · `src/components/layout/Sidebar.tsx` ·
  `src/features/{auth/AuthDialog,onboarding/Onboarding,help/HelpChrome,legal/LegalChrome,landing/LandingPage}.tsx` ·
  `index.html` · `scripts/prerender-help.mjs` · `public/genauly-*.png` + favicons/pwa/apple-touch/og ·
  `preview/branding/genauly-logo-final.svg` · `brand-kit/` (regenerated) ·
  `docs/branding/BRAND_SPEC.md` · `CLAUDE.md` · `docs/PROJECT_STATUS.md` · this log
