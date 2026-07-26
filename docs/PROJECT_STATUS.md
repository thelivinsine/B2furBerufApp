# Project Status

_Last updated: 2026-07-26 (session 170, PR #730, live). **Praktisch's Trainieren/Spielen toggle
now shares the squircle-track + sliding-pill language with Bibliothek/Schreiben** (was a fully
`rounded-full` track); **Bibliothek's route icon reverted to the pre-s158 "stack of three books"**,
and **Fortschritt's became the "Pokal" (trophy/cup)** from the unpicked s158 icon-preview batch.
All three founder-requested, direct ports of already-approved designs. Prior s169 (PRs #726 to
#728): Schreiben on mobile finished, a freshly opened trainer never scrolls and Fokus/Kurz/Lang
share one bottom-chrome geometry; standing law: **the Himmelblau accent is a fill with NO visible
edge** (shadow separates the rails, like the Bibliothek cards), **a page that scrolls the moment it
opens is a bug**, and the dialog backdrop is deep enough to separate a white card from the page
(0.48/0.76 = 3.3:1). `docs/plans/SCHREIBEN-OVERHAUL.md` carries the writing-content roadmap.
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

**Handoff after session 170 (2026-07-26): Praktisch toggle joins the squircle language;
Bibliothek + Fortschritt icon swaps. MERGED AND LIVE** (PR **#730**). Founder: adapt the
reduced-rounding toggle design from Bibliothek/Schreiben to Praktisch, restore the previous
Bibliothek icon, and give Fortschritt the leaderboard-cup icon from an earlier preview batch. All
three were direct, unambiguous ports of already-approved designs (no new preview round needed).
- **Trainieren/Spielen toggle** (`Dashboard.tsx`) now shares `LibrarySwitcher`/
  `WritingModeSwitcher`'s exact language: `rounded-lg` track, `rounded-md` sliding pill measured by
  `useSlidingPill`, instead of the older `rounded-full` track with two independently-flagged
  buttons. Kept content-sized (`w-fit`, centered) since it's a two-segment toggle, not a full-width
  one; the section-tinted active icon/label (blue Dumbbell / orange Play) is untouched.
- **Bibliothek's route icon reverts to the "stack of three books"** shipped before session 158,
  restored verbatim (mark + `NORM` box) from git history (`997e8a0`), replacing the "closed book +
  bookmark ribbon" mark that had been in place since.
- **Fortschritt's route icon becomes the "Pokal" (trophy/cup)**, option T from the session-158
  icon-preview batch (`preview/fortschritt-icon-vorschlaege.html`) that lost to the Ring at the
  time. Ported verbatim (`#0ea5e9`, own `NORM` box) in place of the progress ring.
- **Verified in headless Chromium** at 390×844 (bottom tab bar, both icons active/inactive, the
  toggle sliding between Trainieren/Spielen) and 1280×900 (desktop Sidebar + toggle).
- **Files:** `src/features/dashboard/Dashboard.tsx` · `src/components/layout/route-icons.tsx` ·
  `docs/areas/PRAKTISCH-NAV.md` · `.claude/skills/design/SKILL.md` · `docs/DECISIONS.md`.
  **Gates:** typecheck · lint (0 errors, pre-existing warnings only) · test:unit **317/317** ·
  build · check:bundle (118.1 kB).

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

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
