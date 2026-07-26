# Project Status

_Last updated: 2026-07-26 (session 169, PRs #726 to #728, live). **Schreiben on mobile, finished:
a freshly opened trainer never scrolls, and Fokus, Kurz and Lang share one bottom-chrome geometry.**
s168 (PRs #717 to #724) pinned the chrome and measured the heights; the founder's review round then
found that the writing field was still handed a floor the screen could not pay for, that the Fokus
tile column let its natural height win, and that the two clusters sat ~13px apart. All three are
fixed by making the elastic element give way. Plus the finishing work: the Fokus tiles (two stacked
regions, one full-height correction separator, a shimmering skeleton while the KI works) and an
Aufgabe pop-up behind an expand button, which the capping rule made necessary. Standing law now:
**the Himmelblau accent is a fill with NO visible edge** (shadow separates the rails, like the
Bibliothek cards), **a page that scrolls the moment it opens is a bug**, and the dialog backdrop is
deep enough to actually separate a white card from the page (0.48/0.76 = 3.3:1). Prior s167 (PRs
#711 to #715): one shared Aufgabe-selection rule so the picker's counts stop lying, the exam-shaped
task schema, and two content waves taking the bank to **643 tasks**;
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

**Handoff after session 169 (2026-07-26): the s168 review round. ALL MERGED AND LIVE**
(PRs **#726**, **#727**, **#728**). Branch `claude/fokus-kurz-lang-layout-s8unl4`. The founder
reviewed the shipped s168 Schreiben mobile rework on a phone and sent an eight-point list, then two
short follow-ups. Previews were explicitly waived for the whole session ("just execute them
directly"). Two of the points were bugs; the rest was finishing work, and one of them (the Aufgabe
pop-up) closes a gap the s168 fit-to-one-screen rule had opened.

**1 · No resting page scroll, on any of the three trainers (#726).** Screenshots showed ~50-60px of
scroll on a freshly opened Fokus, Kurz and Lang. Measured before it was touched, with a headless
sampler across seven phone viewports, with and without simulated safe-area insets, 5-6 random
Aufgaben each. Two independent causes.
- **Kurz/Lang:** `useFillEditor` handed the writing field its floor (`max(160px, 22vh)`) even when
  the screen did not have the room, so chrome + field exceeded the viewport by exactly that
  overshoot. **The floor is a preference now; the fit is the guarantee.** Order of concession:
  Aufgabe card (its prompt region caps and scrolls internally, `TASK_BODY_MIN` 96 → 72) → field
  (`HARD_MIN` 72px) → page scroll, which in practice never happens on a 360x740 screen or larger.
- **Fokus:** the tile column had a `minHeight`, so the tiles' natural height simply won whenever a
  wrapping legend or a dial row that wraps on a narrow phone outgrew it. It now gets an exact
  `height` before a correction and a `minHeight` after (a long fix list MUST be able to grow), with
  `min-h-0` down the flex chain so the writing field absorbs the shortfall.
- **Result: zero overflow from 360x740 up.** SE-class 667px viewports still come up ~75px short,
  which is structural (the chrome alone exceeds them) and is logged as open below.

**2 · One bottom-chrome geometry for the three modes (#726).** The buttons "keep switching
abruptly" because Kurz/Lang kept its caption INSIDE the fixed cluster while Fokus had it as a
separately fixed line, putting the two button rows ~13px apart. Both now sit at
`bottom-[calc(nav + safe-area + 2rem)]` with a fixed KI line at `+0.5rem` (the lift trimmed from
2.5rem to 2rem to pay for the reservation this costs Kurz/Lang). Keep the two call sites identical:
anything mode-specific in that row shows up as a jump on every tab switch.

**3 · The accent rails lost their outline (#726), and dialogs gained contrast (#728).** Two colour
answers, both now written into `CLAUDE.md` + `/design` + the area docs.
- Rails: border in the fill's OWN colour, separation by `shadow-soft`, like the Bibliothek word
  cards the founder pointed at; inner dividers tinted to match. This is the **third** edge answer
  (accent s166 → neutral grey s168 → none s169), so the rule is now "the accent is a fill with no
  visible edge". Applies to `WritingRail`, `GrammarRail`, `GrammarDials` and the `accent` Button.
- Dialogs: the founder reported the Aufgabe pop-up had "no contrast with the background". Measured
  in the running app rather than judged: white card on the near-white page ground was **1.9:1**
  against the old backdrop, because `shadow-elevated-soft` is invisible over a dark wash, so the
  backdrop is the ONLY thing defining the card. `bg-dialog-overlay` deepened 0.30/0.62 → **0.48/0.76**
  = **3.3:1**, clear of the 3:1 UI floor; dark mode re-checked. Changed on the token, never per
  dialog. (The locked dialog recipe now records its alphas and the reasoning in `BRAND.md`.)

**4 · The Fokus tiles finished (#726, #727).** Sentence card: sentence and detail block are two
stacked regions, so the sentence centres in the room left over instead of collecting all the slack
above it; no horizontal rule under it; the correction columns are separated by ONE full-height rule
(the per-cell `border-l` stopped after row 1 with three fixes); the eyebrow hugs its own fix
(`mb-0.5`) against a wider row gap (`gap-y-5`). Grammatik tile: the legend parks on the tile's
bottom edge with the dials centred above, the same split, so the two tiles rhyme.

**5 · Waiting is shown where the answer lands (#726).** New `.fx-skeleton-bar` utility: three
tapering rounded bars with a slow Himmelblau sweep, reduced-motion safe, 0.14s per-bar stagger.
During the correction call the learner's own sentence stays above it; during a transform it replaces
the sentence region. The spinning dial and the button label alone did not read as "something is
happening".

**6 · The "Noch N Wörter" hint moved into the card (#726),** under the umlaut keys, in BOTH
trainers, reversing the s168 rule that parked transient hints in the cluster caption. The bottom
line is the Art. 50 note in every state now and never swaps content.

**7 · The Aufgabe pop-up + shuffle (#727, #728).** The Aufgabe card header carries two BORDERLESS
40px icon buttons, **shuffle left, expand right**. Expand opens the whole task in the app's standard
centred dialog (the round-1 Fokus preview's "Variante A": soft darkening, no blur, explicitly not a
bottom sheet). This is the consequence of the capping rule above: the card is capped on purpose, so
a long Aufgabe gets cut mid-line and one place has to show all of it. Shuffle replaces the dice; the
glyph is point-symmetric, so the half-turn per roll still reads as motion and settles back into the
same shape. Adressat + Leitpunkte are shared between card and pop-up.

- **Files:** `src/features/writing/useFillEditor.ts` · `src/features/writing/fokus/FokusTrainer.tsx`
  · `src/features/writing/GuidedWritingTrainer.tsx` · `src/features/writing/WritingRail.tsx` ·
  `src/features/writing/fokus/GrammarRail.tsx` · `src/features/writing/fokus/GrammarDials.tsx` ·
  `src/components/ui/button.tsx` · `src/index.css` · `tailwind.config.ts` · `CLAUDE.md` ·
  `.claude/skills/design/SKILL.md` · `docs/areas/SCHREIBEN.md` · `docs/areas/BRAND.md` ·
  `docs/DECISIONS.md`. **Gates (every PR):** typecheck · lint (0 errors) · lint:content ·
  test:unit **317/317** · build · check:bundle (117.3 kB) · check:contrast.
- **Method note worth keeping:** every layout claim this session was measured in headless Chromium
  against the running app, not reasoned from the source. That caught two things reasoning would not
  have: the real cause of the Kurz/Lang scroll (a floor treated as a guarantee) and a tailwind.config
  change that Vite had not rebuilt, which made a screenshot pass look like a no-op.
- **Open, small:** SE-class (667px) viewports still page-scroll on Kurz/Lang; closing that needs
  chrome to go, not elasticity (the "Aufgabe wählen" toggle row and the two-card split are the
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
filter/selection rail, instead of the bright blue outline … use a muted soft gray outline." Both
Schreiben rails and the `accent` Button variant moved off the s166 `accent-ink/70` edge onto the
neutral `border-border`. **Superseded by s169** (see the handoff above): the grey edge was rejected
in turn, and the rails now border in their own fill colour with `shadow-soft` doing the separating.
The lasting part of this decision is that the accent is a FILL; fix tiles and Verlauf detail tiles
keep their accent edge on purpose, because they are content, not rails.

**3 · Fokus mobile rework (#720 to #723), four preview rounds.** The transform feature, which IS
the Satzlabor, hid behind a "Grammatik" toggle that sat where Kurz/Lang put a filter and looked
exactly like one. Rounds: r1 (move the panel elsewhere; **both variants rejected**) → r2 ideation
in chat ("it is a flow step, not a filter", concept C picked) → r3 (two tiles; treatment G) → r4
(full-height tiles, fixed KI line; "Option 2" with one amendment). All in
`preview/fokus-grammatik-mobile*.html`, one artifact URL redeployed throughout:
`https://claude.ai/code/artifact/dbc08865-71de-4ec2-94cb-99d23ca1d75b`.
- **Shipped (mobile only, desktop rail untouched):** toolbar toggle and collapsed panel gone. Two
  tiles fill the height between the switcher and the fixed bottom chrome. The new **`GrammarDials`** tile ("Grammatik" header + reset) carries one centered
  dial per axis: green dot = detected form, solid primary = target, tap opens a picker popover;
  dimmed but visible before a correction, so the feature announces itself. Its legend line doubles
  as the refusal/error slot.
- The sentence card owns every state behind a centered Original / Korrigiert / **Umgeformt**
  toggle: the transformed sentence renders in place, green-marked via a diff against the corrected
  one, with Hinweis + Nochmal + Vorlesen beneath. The separate transform card is desktop-only now.
  **"Neu"** (not "Neuer Satz") sits top-right, the Kurz/Lang icon-button corner, icon-only beside three
  segments. **Corrections are two text columns with a vertical separator** (founder amendment: no
  chip backgrounds on mobile; category eyebrow, struck original and green fix keep their colors).
- Feedback + Korrigieren float fixed above the KI line until a correction exists; the KI line is
  locked above the nav in every state (s169 moved the "Noch N Wörter" hint out of it, into the card).
- **Verified in headless Chromium at 390x844** with stubbed check/transform responses, across idle →
  too-short → corrected → picker → Passiv + Perfekt → view toggles → reset → Neu.

**4 · The Aufgabe card caps instead of scrolling the page (#724).** When a long Aufgabe would push
the field below its floor, `useFillEditor` caps the card's prompt + Inhaltspunkte region by exactly
the shortfall and scrolls it internally (the eyebrow + icon row stay put). Sampled 30 re-rolls per
mode: **0/30 page scrolls at 390x844**, was up to 227px. The cap math works off `scrollHeight`,
never by un-capping to re-measure, so the ResizeObserver watching the card cannot ping-pong. (s169
tuned the minimum to 72px and made the field give way after it, see the handoff above.)

**Cross-cutting lesson worth keeping:** all fixed mobile chrome in Schreiben is **portalled to
`<body>`**. WritingHub slides tab panels with an `x` transform, and a transformed ancestor becomes
the containing block for its `fixed` descendants, so without the portal every pinned layer
re-anchors mid-slide (and the measurement reads the wrong reserve on mount).

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
