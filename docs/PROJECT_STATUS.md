# Project Status

_Last updated: 2026-07-26 (session 169). **Schreiben on mobile, finished: a freshly opened trainer
never scrolls, and Fokus, Kurz and Lang share one bottom-chrome geometry.** s168 (PRs #717 to #724,
live) pinned the chrome and measured the heights; the founder's review round then found that the
writing field was still handed a floor the screen could not pay for, that the Fokus tile column let
its natural height win, and that the two clusters sat ~13px apart. All three are fixed by making the
elastic element give way, plus the finishing work on the Fokus sentence tile (two stacked regions,
one full-height correction separator, a shimmering skeleton while the KI works). Standing law now:
**the Himmelblau accent is a fill with NO visible edge** (shadow separates the rails, like the
Bibliothek cards), and **a page that scrolls the moment it opens is a bug**. Prior s167 (PRs #711 to
#715): one shared Aufgabe-selection rule so the picker's counts stop lying, the exam-shaped task
schema, and two content waves taking the bank to **643 tasks**;
`docs/plans/SCHREIBEN-OVERHAUL.md` carries the rest of that roadmap.
`.github/workflows/supabase.yml` deploys Edge Functions on merge, so backend changes no longer need
a CLI. Product name: **Genauly** (`genauly.de`)._

This is the **lean, living** status doc: current state plus the two most recent session handoffs.
**Start at the `## Resume here (next session)` section at the end.** Companion files:
- **`docs/PROJECT_FOUNDATION.md`** — the stable technical baseline that rarely changes: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra, and completed founder
  action items. Read it when you need the "what's built and how" detail that used to sit here.
- **`docs/PROJECT_REFERENCE.md`** — stable reference: the founder backlog, product-evaluation
  findings, per-session model guidance, and reusable research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked UX decisions.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only session-log history,
  chunked by ISO week under `docs/archive/status-log/`.
- **`../CLAUDE.md`** — the lean always-on operating rules (restructured s155, ~180 lines); deep
  per-area detail lives in **`docs/areas/`** (COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN,
  PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN, COMPONENTS) + the `/design` and `/content` skills.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · Schreiben · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,107
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **all** provenance rows are AI-drafted and `draft`, none human-verified
(human verification was reset to zero on 2026-07-22 at founder request, to restart the review pass;
see `strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
- [x] ~~Enable Turnstile CAPTCHA on guest sign-in.~~ **DONE 2026-07-24** (live sign-in verified; both
      Supabase Auth CAPTCHA and the `VITE_TURNSTILE_SITE_KEY` GitHub secret set). Details in
      `PROJECT_FOUNDATION.md`.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [x] ~~Redeploy `transform-sentence` to activate the "Nochmal" regenerate button (s163).~~
      **DONE 2026-07-24** (founder redeployed via the Supabase dashboard; the capped variant path is
      live).
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 169 (2026-07-26): the s168 founder review round. Branch
`claude/fokus-kurz-lang-layout-s8unl4`.** Eight numbered points on the shipped Schreiben mobile
rework, executed directly (previews explicitly waived). Two were bugs, six were finishing work.

- **1 · No resting page scroll on any of the three trainers.** The founder's screenshots showed
  ~50-60px of scroll on a freshly opened Fokus, Kurz and Lang. Two independent causes.
  **Kurz/Lang:** `useFillEditor` handed the writing field its floor (`max(160px, 22vh)`) even when
  the screen did not have it, so the sum of chrome + field exceeded the viewport by exactly that
  overshoot. The floor is a preference now; `HARD_MIN` (72px) is the guarantee, and the Aufgabe
  card's cap gives up a little more first (`TASK_BODY_MIN` 96 → 72). **Fokus:** the tile column had
  a `minHeight`, so the tiles' natural height (a wrapping legend, a dial row that wraps on a narrow
  phone) simply won. It now gets an exact `height` before a correction and a `minHeight` after,
  with `min-h-0` down the flex chain so the writing field absorbs the shortfall. Verified headless
  at 320x568 / 375x812 / 390x664 / 360x740 / 360x800 / 393x852 / 412x915, with and without
  simulated safe-area insets, 5-6 random Aufgaben each: **zero overflow from 360x740 up.** SE-class
  667px viewports still come up ~75px short, which is structural (chrome alone exceeds them).
- **2 · One bottom-chrome geometry for all three modes.** The buttons "keep switching abruptly"
  because Kurz/Lang kept its caption INSIDE the fixed cluster while Fokus had it as a separate
  fixed line, which put the two button rows ~13px apart. Both now sit at
  `bottom-[calc(nav + safe-area + 2rem)]` with a separately fixed KI line at `+0.5rem` (the lift
  came down from 2.5rem to 2rem to pay for the reservation this costs Kurz/Lang).
- **3 · The rails lost their outline.** Third and final answer after an accent edge (s166) and a
  neutral grey one (s168): border in the fill's own colour, separation by `shadow-soft`, like the
  Bibliothek word cards the founder pointed at. Inner dividers tinted to match. Applies to
  `WritingRail`, `GrammarRail`, `GrammarDials` and the `accent` Button variant. `check:contrast`
  untouched (pure edge change).
- **4 · Fokus sentence tile.** Sentence and detail block are two stacked regions, so the sentence is
  centered in the room left over instead of collecting all the slack above it; the horizontal rule
  under it is gone; the correction columns are separated by ONE full-height rule (the per-cell
  `border-l` stopped after row 1 with three fixes); the eyebrow hugs its own fix (`mb-0.5`) and the
  row gap widened (`gap-y-5`).
- **5 · A waiting animation in the tile the answer lands in.** `.fx-skeleton-bar` (new,
  `index.css`): three tapering rounded bars with a slow Himmelblau sweep, reduced-motion safe,
  0.14s per-bar stagger. Shown during the correction call (with the learner's sentence above it)
  and again in the sentence region during a transform.
- **6 · The "Noch N Wörter" hint moved into the card,** under the umlaut keys, in BOTH trainers
  (reversing the s168 rule that parked it in the cluster caption). The bottom line is the Art. 50
  note in every state now and never swaps content.
- **Files:** `src/features/writing/useFillEditor.ts` · `src/features/writing/fokus/FokusTrainer.tsx`
  · `src/features/writing/GuidedWritingTrainer.tsx` · `src/features/writing/WritingRail.tsx` ·
  `src/features/writing/fokus/GrammarRail.tsx` · `src/features/writing/fokus/GrammarDials.tsx` ·
  `src/components/ui/button.tsx` · `src/index.css` · `CLAUDE.md` ·
  `.claude/skills/design/SKILL.md` · `docs/areas/SCHREIBEN.md` · `docs/DECISIONS.md`.
  **Gates:** typecheck · lint (0 errors) · lint:content · test:unit **317/317** · build ·
  check:bundle (117.3 kB) · check:contrast.
- **Open, small:** SE-class (667px) viewports still page-scroll on Kurz/Lang; closing that needs
  chrome to go, not elasticity (the "Aufgabe wählen" toggle row and the two-card split are the two
  candidates). Fokus's `GrammarRail` `layout="panel"` branch is still dead code on mobile.

**Handoff after session 168 (2026-07-26): the Schreiben mobile pass. ALL MERGED AND LIVE**
(PRs **#717** to **#724**). Eight PRs across one theme: on a phone, every Schreiben surface now
rests at exactly one viewport, with its chrome pinned instead of drifting. Four of the eight are
Fokus preview rounds; the rework they produced is the largest change.

**1 · Kurz/Lang bottom chrome + writing field (#717, #718).** Founder, with two phone screenshots:
"the feedback button, auswerten button and the line below keep moving up and down when switching
between the toggles and tasks in Kurz and lang." Preview round explicitly waived.
- **Cause: the cluster was `sticky`, not `fixed`.** Sticky only sticks once the page actually
  scrolls; whenever the content fit the viewport it parked at the END of the content, which is a
  different height in Kurz than in Lang and moves with every Aufgabe. Now `fixed` above the nav,
  mirroring AppShell's `<main>` offsets. Verified identical y across Kurz, Lang, 3 re-rolls and the
  whole 150 ms tab slide.
- **`src/features/writing/useFillEditor.ts` (new) sizes the field.** Fills to the bottom chrome at
  rest, grows with the text (page scroll on) to 1.8x the resting height / the space the screen
  offers / 60% of the viewport, whichever is largest, then scrolls internally. `resize-none`;
  `rows` is only the pre-measurement fallback. Measured in JS deliberately: the trainer sits inside
  AppShell → WritingHub → AnimatePresence, none height-constrained, so a `dvh`/flex chain would
  have meant touching every other Schreiben surface.
- **Desktop caps the RESTING height** (#718, `desktopFieldCap`): Kurz = max(176px, 22% of the
  viewport), Lang = max(252px, 32%), because filling a whole desktop window "looks odd". Measured
  at 1440x900 / 1680x1050 / 1280x800: the field ends 220-480px above the window bottom, Lang ~45%
  taller than Kurz. Mobile is provably untouched (below `lg` the cap is skipped, so the formula
  reduces to the first pass exactly).

**2 · The accent is a FILL, never an outline (#719).** Founder: "wherever there is blue
filter/selection rail, instead of the bright blue outline … use a muted soft gray outline."
Both Schreiben rails (`WritingRail`, `GrammarRail`, incl. internal dividers) and the `accent`
Button variant that opens them now carry `border-border`, the neutral edge the Bibliothek
FilterRail and every card already wear; the Himmelblau fill is untouched. **Retires the s166
`accent-ink/70` workaround**, which existed only because no alpha of the 77%-light accent clears
the 3:1 UI floor on a near-white ground. Fix tiles and Verlauf detail tiles keep their accent edge
on purpose: they are content, not rails. Written into CLAUDE.md + `/design` §3; `check:contrast`
still green.

**3 · Fokus mobile rework (#720 to #723), four preview rounds.** The transform feature, which IS
the Satzlabor, hid behind a "Grammatik" toggle that sat where Kurz/Lang put a filter and looked
exactly like one. Rounds: r1 (move the panel elsewhere; **both variants rejected**) → r2 ideation
in chat ("it is a flow step, not a filter", four shapes offered, concept C picked) → r3 (two tiles;
Himmelblau treatment G picked) → r4 (full-height tiles, fixed KI line; "Option 2" picked with one
amendment). All rounds are in `preview/fokus-grammatik-mobile*.html`, one artifact URL redeployed
throughout: `https://claude.ai/code/artifact/dbc08865-71de-4ec2-94cb-99d23ca1d75b`.
- **Shipped (mobile only, desktop rail untouched):** toolbar toggle and collapsed panel gone. Two
  tiles fill the height between the switcher and the fixed bottom chrome (`measureMobile` sets
  minHeight). The new **`GrammarDials`** tile ("Grammatik" header + reset) carries one centered
  dial per axis: green dot = detected form, solid primary = target, tap opens a picker popover;
  dimmed but visible before a correction, so the feature announces itself. Its legend line doubles
  as the refusal/error slot.
- The sentence card owns every state behind a centered Original / Korrigiert / **Umgeformt**
  toggle: the transformed sentence renders in place, green-marked via a diff against the corrected
  one, with Hinweis + Nochmal + Vorlesen beneath. The separate transform card is desktop-only now.
  **"Neu"** (not "Neuer Satz") sits top-right, the Kurz/Lang dice corner, icon-only beside three
  segments. **Corrections are two text columns with a vertical separator** (founder amendment: no
  chip backgrounds on mobile; category eyebrow, struck original and green fix keep their colors).
- Feedback + Korrigieren float fixed above the KI line until a correction exists; the KI line is
  locked above the nav in every state and carries the "Noch N Wörter" hint while the sentence is
  too short.
- **Verified in headless Chromium at 390x844** with stubbed check/transform responses: zero page
  scroll and one KI-line position across idle → too-short → corrected → picker → Passiv → Passiv +
  Perfekt → view toggles → reset → Neu. Desktop anatomy unchanged.

**4 · The Aufgabe card caps instead of scrolling the page (#724).** The one limit the first pass
accepted (a third of tasks still scrolled a little at rest) is gone: when a long Aufgabe would push
the field below its floor, `useFillEditor` caps the card's prompt + Inhaltspunkte region by exactly
the shortfall and scrolls it internally (eyebrow + dice stay put; 96px minimum). Sampled 30
re-rolls per mode: **0/30 page scrolls at 390x844** in both modes, was up to 227px. A 360x640
viewport keeps a structural ~165px (field floor + minimum card + chrome exceed 640), down from
~430px. The cap math works off `scrollHeight`, never by un-capping to re-measure, so the
ResizeObserver watching the card cannot ping-pong.

**Cross-cutting lesson worth keeping:** all fixed mobile chrome in Schreiben is **portalled to
`<body>`**. WritingHub slides tab panels with an `x` transform, and a transformed ancestor becomes
the containing block for its `fixed` descendants, so without the portal every pinned layer
re-anchors to the panel mid-slide (and the measurement reads the wrong reserve on mount).

- **Files:** `src/features/writing/useFillEditor.ts` (new) ·
  `src/features/writing/fokus/GrammarDials.tsx` (new) ·
  `src/features/writing/GuidedWritingTrainer.tsx` · `src/features/writing/fokus/FokusTrainer.tsx` ·
  `src/features/writing/WritingRail.tsx` · `src/features/writing/fokus/GrammarRail.tsx` ·
  `src/components/ui/button.tsx` · `preview/fokus-grammatik-mobile{,-r2,-r3,-r4}.html` (new) ·
  `CLAUDE.md` · `.claude/skills/design/SKILL.md` · `docs/areas/SCHREIBEN.md`.
  **Gates (every PR):** typecheck · lint (0 errors) · test:unit **317/317** · build · check:bundle
  (117.2 kB) · check:contrast · lint:content.
- **Open, small:** Fokus's own `GrammarRail` panel layout (`layout="panel"`) is now dead code on
  mobile but still used by the desktop rail; the `panel` branch itself could be retired. Sub-660px
  viewports still page-scroll ~165px in Kurz/Lang, which is structural, not a bug.


_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
