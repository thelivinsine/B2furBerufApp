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
neutral `border-border`. **Superseded by s169:** the grey edge was rejected in turn, and the rails
now border in their own fill colour with `shadow-soft` doing the separating. The lasting part of
this decision is that the accent is a FILL; fix tiles and Verlauf detail tiles keep their accent
edge on purpose, because they are content, not rails.

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
tuned the minimum to 72px and made the field give way after it.)

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

**Handoff after session 167 (2026-07-25), part 3: the Branche answer + wave 2. MERGED AND LIVE**
(PRs **#714**, **#715**).

- **Founder: "when a thema is selected and then the Branche is changed, the aufgabe doesn't change."**
  Reproduced in the running app rather than reasoned from the code: the task IS re-drawn every time,
  on desktop and in the mobile panel. The cause was **coverage**, not the mechanism. Only **71 of 600**
  theme x Länge x Branche slots carried a task tagged for that Branche (11.8%), and **11 of 20 Themen
  had none**, so the fallback served the identical pool whichever Branche was picked, and the re-roll
  landed back on the same task about one time in twelve.
- **Fix (#714):** the scope-change re-roll now passes the current task as `exclude`, exactly like the
  dice, so a filter change is always visible (founder rule: controls always visibly act). Verified on
  `behoerde` (zero coverage, worst case): 14 consecutive Branche switches, 0 repeats.
- **Mobile panel stays open until closed (#715).** Picking a Thema used to dismiss it while every
  other scope left it open, so the one control that auto-closed was also the one that changed the
  most. Only the X and the toolbar toggle close it now.
- **Wave 2 (#715): 150 Branche-specific Aufgaben.** The five Beruf Themen that apply to EVERY industry
  (`meetings`, `scheduling`, `conflict`, `safety`, `customer`) x **all 15 Branchen** x both Längen, at
  B2. Bank: 493 -> **643 tasks**. **Branche slots filled: 71/600 (11.8%) -> 173/600 (28.8%).**
  Every variant satisfies the four-way-difference test (plan §8): different ADDRESSEE, GENRE, domain
  CONTENT POINTS and FACHLEXIK. Swapping the Branche noun breaks all of them, which was the point.
- **A test pins it:** for those five Themen every Branche must have a tagged task AND the draw must
  serve it rather than fall back past it. The task-count assertion is now self-maintaining (compares
  against pool totals) so it does not need bumping as the bank grows.
- **Still generic: 11 Themen** (`travel` + all 10 Alltag). For Alltag this is partly principled, since
  Branche means where you WORK and a Wohnen or Bank task is personal life. But some genuinely do vary
  (Krankmeldung in Schichtdienst vs Büro, Urlaubsantrag auf der Baustelle). That judgement call is
  **wave 3**, together with rewriting the remaining legacy tasks to carry Inhaltspunkte.



**Handoff after session 167 (2026-07-25), part 2: P2 + no-CLI deploys, MERGED AND LIVE.**
Branch `claude/writing-aufgaben-research-faw959`, PRs **#711** (the overhaul) and **#712** (a CI fix).

- **P2: the evaluator receives the Aufgabe.** `evaluate-writing` previously got `{theme, length,
  text}` and the task text never reached a prompt, so Aufgabenerfüllung was structurally
  uncheckable. It now receives `taskId · task · points[] · level · format · addressee · register ·
  words`, all bounded server-side (learner-supplied input on the wire, not trusted content).
  `buildSystemPrompt(level, hasTask)` replaced the fixed "Prüfer:in für Deutsch B2 Beruf" string: it
  grades at the TASK's level and checks content FIRST, mirroring Goethe Erfüllung / telc Leitpunkte.
  New `taskCompletion` WeaknessCategory (mirrored in `practiceAreas`, deep-linking back into Kurz,
  and in the linter). The Aufgabe travels with every provider call so a cascade fallback cannot
  downgrade to language-only grading.
- **Cache correctness:** `hashText` now folds in the task id, the level and `PROMPT_REV`. Text-only
  keying would have returned a verdict produced for a DIFFERENT Aufgabe the moment the task shaped
  the prompt. Bump `PROMPT_REV` on any rubric change.
- **Permanent task ids:** all **493** tasks carry `wt_<themeId>_<s|l><nn>`, required by the schema
  and enforced unique + pattern-matched by `lintWritingPrompts` (negative-tested). Migration **0011**
  adds `writing_evaluations.task_id`; `writingTaskById()` resolves it and **Verlauf shows the Aufgabe
  again** with its Inhaltspunkte. Old rows have no id and still render text-only.
- **No-CLI deploys (the founder has no CLI).** New `.github/workflows/supabase.yml` verifies the
  access token, applies migrations, then deploys every Edge Function on merge to `main`.
  `SUPABASE_ACCESS_TOKEN` is set; **`SUPABASE_DB_PASSWORD` is deliberately NOT**, so CI skips
  migrations and each new migration is pasted into the Dashboard SQL editor (which is how 0011 was
  applied). **Keep migrations idempotent** for that reason.
- **Token expiry:** the access token carries a 30-day expiry (~24 Aug 2026). A "Verify access token"
  step runs first and, on rejection, fails with an explicit regenerate-it error having deployed
  nothing.
- **My mistake, for the record:** the first deploy run FAILED because I pinned `supabase/setup-cli`
  to a commit SHA I invented (this sandbox has no network to verify one). It failed at action
  resolution, so nothing deployed and nothing was half-applied. Fixed in #712 by pinning to the `v1`
  TAG, a documented deviation from this repo's SHA-pinning convention. **Re-pin it to a verified SHA
  when someone with network can look one up.**
- **Verified:** run `30165587804` green (token verified, migrations skipped by design, all five
  functions deployed in 31s), alongside Pages and Validate on `6b9b6a8`.
- **NOT verified:** the Edge Functions are syntax-checked only. No Deno in the sandbox and they
  import from `esm.sh` URLs `tsc` cannot resolve, and the new grading prompt was never exercised
  end-to-end (needs live credentials + a real model call). The first Kurz submission after deploy is
  its first real test; failure modes fail safe (`parseInsight` falls back to `vocabularyRange`).
- **Next:** content waves 2 to 4 in `docs/plans/SCHREIBEN-OVERHAUL.md` §11 P3 (Branche variants
  written to the four-way-difference test, the Alltag rewrite of the ~373 legacy tasks so they carry
  Inhaltspunkte, then breadth), plus the §12 items that must not be hard-coded until verified from a
  primary source.

**Follow-up in session 167: Wave 1 content + per-module daily limits.**
- **Schema + content.** `WritingTask` gained the exam-shaped fields (`points[]` = the Inhaltspunkte an
  examiner grades, `addressee`, `register`, `level`, `format`, `exam`, `words`, `source`), all optional
  so the bank upgrades in waves. New `WritingFormat`/`WritingExam`/`WritingRegister` unions mirrored in
  `scripts/lint-content.mjs` (points bounded 2..5, words 30..300, register requires an addressee).
  **120 new Aufgaben**: every Thema x Niveau (B1/B2/C1.1) x Länge, modelled on the Goethe B1/B2/C1 and
  telc B2 Beruf task SHAPES. Founder was explicit that these are **reference, not mock exams**: no exam
  wording is copied. Alltag tasks now carry the formal apparatus (Betreff, Aktenzeichen, Bezugsdatum,
  Frist, Grußformel) as Inhaltspunkte and **assert no statutory deadline or euro amount**.
- **Rail** gained Niveau + Textsorte; the Aufgabe card renders the Inhaltspunkte and takes its word
  target from the task (real exam targets run 40 to 200 and share no single number).
- **Filter-rule correction, caught by screenshotting the real app.** untagged-=-universal is right for
  Branche but WRONG for Niveau/Textsorte: legacy tasks outnumber tagged ones ~10:1, so
  "C1.1 + Widerspruch" was serving a B1 address-change mail. Those two axes now prefer their tagged
  tasks and count with `countExact` (no fallback), greying out at zero, so a Lang-only Textsorte
  (Forumsbeitrag) reads as unavailable under Kurz instead of quietly serving a Notiz.
- **Daily allowances set by the founder:** Fokus **10**/day (`DAILY_CHECK_LIMIT`; one round = one
  Korrektur, the Umformung never consumes a second unit), Kurz **4** (`DAILY_LIMIT_SHORT`), Lang **2**
  (`DAILY_LIMIT_LONG`), the last two counted separately against `writing_evaluations.length`.
  `TRANSFORM_DAILY_LIMIT` dropped to 30 as a pure runaway guard. **The three Edge Functions must be
  redeployed for these to take effect.**
- **Gates:** typecheck · lint (0 errors) · lint:content · test:unit **313/313** · build ·
  check:bundle (117.2 kB). Verified in a real viewport, desktop + mobile 390px.
- **P2 SHIPPED later the same session** (see the handoff above): the evaluator receives the Aufgabe,
  every task has a permanent id, and evaluations record it.

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

---

---

**Handoff after session 171 (2026-07-26). Verlauf + Fortschritt redesign (founder picks C and 3),
branch `claude/selection-color-contrast-3upqkz`, PRs #685 + #733.** Opened with a one-line contrast fix
(the desktop Sidebar's active row was too dark: `bg-border` -> `bg-muted`, lighter than the old
selection but still darker than the hover, PR #685, merged). Then a four-agent analysis of Schreiben's
Verlauf and the Fortschritt page, preview-first design
(`preview/verlauf-fortschritt-redesign.html`, artifact c3df428e, 3 named variants per surface), and
implementation of the two picks.
- **Verlauf = C "Entwicklung zuerst"** (`WritingHistory.tsx`, rewritten): a "Deine Entwicklung" card
  leads (top-3 weaknesses as 3-month bar groups, trend arrows, "X % weniger" badge, "Jetzt üben"),
  over a COMPACT row list. The disclosure now reads in event order: **Aufgabe** (from s167's
  `task_id`) -> **Dein Text** -> **Tipp** next to the practice CTA, with delete + the standalone AI
  line at the foot. Kurz/Lang `ModeSwitcher` only when both kinds exist.
- **Honesty guards (do not weaken):** a month needs >=2 texts to be a comparison point
  (`MIN_TEXTS_PER_MONTH`), a month with no texts prints "-" not 0, and under two comparable months
  the card falls back to totals. The live check caught the bug this prevents: compared against a
  one-text month, an improving category rendered as WORSENING.
- **Fortschritt = 3 "Kompetenzkurve"** (`Analytics.tsx`): a competence curve sits directly under the
  unchanged Überblick (mastered words / Can-Dos over time, green dots on days a Can-Do was reached,
  "Zuletzt erreicht" line); the XP chart moved into Details, because XP measures effort and dips in a
  quiet week, which reads as regression. The card states DIRECTION only ("+16 Wörter diese Woche");
  the absolute count stays on the Vokabeln tile. **Dranbleiben** = Prüfung (days-remaining ring over
  a 90-day run-up + last simulation + `/exam`, only while `examDate` is ahead) + a **writing-aware
  Diagnose** (most-flagged weakness of the last 60 evaluations, falling back to the weakest
  band/theme) + Nächste Quest (spans both columns when Prüfung shows). The duplicated
  writing-weakness panel was DELETED from Details: fed 60 entries against Verlauf's 30, the two
  surfaces could name different top weaknesses.
- **Competence is SAMPLED, never reconstructed:** `useProgressStore.masteryHistory` +
  `canDoAchievedAt` + `recordCompetence`, written from Analytics on view and from
  `lib/competence.ts` at session end. FSRS keeps current card state only, so this history cannot be
  backfilled; dating cards by `lastReview` was rejected (a word mastered in May but reviewed
  yesterday would fake a hockey stick). Pre-existing milestones carry `SEEDED_MILESTONE` so they
  never plot as "reached today". Both fields are local-only, same caveat as `missionsDone`/`keyItems`.
  **`lib/competence.ts` imports content banks: never import it from eager code.**
- **`getWritingHistory` returns `null` on failure** (was `[]`), so the Verlauf error card is
  reachable and an empty history is never faked. `Analytics` treats null as "no data" and keeps its
  vocabulary fallback.
- **Verified in the real app, not the mockup:** seeded a demo state and screenshotted `/analytics`
  and `/writing?mode=verlauf` in light AND dark plus the expanded row, which is what surfaced the
  trend-arrow bug above and a two-line label pushing its arrow out of place.
- **Merge note:** `main` advanced 47 commits (sessions 161-170) while this branch was open. Merged
  in; `lib/writing.ts` auto-merged (our null return + s167's `task_id` select), `WritingHistory.tsx`
  resolved by hand (our variant-C structure + main's Aufgabe tile), docs re-applied against main's
  newer text. s167 had already shipped the "store the Aufgabe" follow-up, so only the CORRECTION and
  Fokus history remain open.
- **Gates:** typecheck · lint 0 errors · test:unit · build · check:bundle **117.3 kB** · lint:content.
- **Then, same session: the correction itself now ships** (founder asked why the backend follow-up
  needed them at all, given `supabase.yml`). Verified from the run history: the workflow DOES deploy
  every Edge Function on merge (last run's "Deploy Edge Functions" = success), and only "Apply
  migrations" is gated, skipped when `SUPABASE_DB_PASSWORD` is absent. So:
  - **Migration 0012** adds `writing_evaluations.corrected_text` (idempotent, so a hand-paste and a
    later CI `db push` cannot collide).
  - **`evaluate-writing`** now asks for `corrected` too: a MINIMAL repair of the learner's own text,
    never a rewrite. `max_tokens` 400 -> 2000 for Anthropic (the corrected text is ~750 tokens on a
    MAX_TEXT_LEN submission); a CEILING, not a spend, and every existing fuse is untouched.
    `PROMPT_REV` -> `s171.0` so cached verdicts without a correction are not served.
  - **Nothing regresses if the migration lags the code**, which is the normal order here: `parseInsight`
    salvages weakness + insight from a truncated payload and drops the correction; `sanitizeCorrected`
    rejects a rewrite, a stump, an Aufgabe echo or an unchanged copy; the cache read and the client
    select fall back to the legacy column list; and the insert steps DOWN through the optional columns
    (full -> without corrected_text -> base) so a row always lands, which matters because the daily
    limit counts rows.
  - **Verlauf renders it** with the Fokus language (Original/Korrigiert toggle, coral on the original,
    green on the corrected, Himmelblau category tiles, capped at 6 with "+N weitere"). Marks are
    computed client-side by `wordDiff`, so no AI cost per view. Two fixes found by screenshotting the
    real page: the diff now runs PER PARAGRAPH (one whole-text diff collapsed a letter into a block)
    and `classifyChange` gained **Zeichensetzung** (a bare comma fix read as "Groß-/Kleinschreibung").
- **Next (both done since):** (1) Fokus history, shipped later the same session; (2) the correction
  right after submitting, shipped in s172 above. Still optional: "In die Wiederholung" (turn a
  correction into an FSRS card).
- **What actually happened on merge:** the Supabase workflow run for #734 shows "Deploy Edge
  Functions: success" and "Apply migrations: **skipped**" — `SUPABASE_DB_PASSWORD` is still unset, so
  the founder applied **0012 by hand** in the Dashboard SQL editor. Like 0011 it is therefore absent
  from `supabase_migrations.schema_migrations`; both are idempotent, so a later CI `db push` is a
  no-op (recorded in `docs/plans/PHASE2_SETUP.md`). The founder will look at the DB-password secret
  later; until it exists every migration needs one paste. Note Supabase never re-displays the
  database password after project creation, so obtaining a usable value means resetting it — safe
  here, since the password appears nowhere in this project except that workflow (the app uses the
  anon and service-role keys).
- **Founder review round on the live mobile Verlauf** (screenshot): the Entwicklung card was showing
  the totals-only FALLBACK, because all four of their texts sit in one month (June) and July has none,
  so no trend was provable. Working as designed, but it read as "not the preview". Both fixes
  founder-picked: (1) the **monthly layout is now always the card's shape** (empty months print "–");
  only the arrows and the "% weniger" badge still wait for two qualifying months, with one muted line
  explaining their absence. (2) The row is **one line at every width**: below `sm` the date shortens
  and the Thema badge drops (a long Thema was pushing the weakness chip onto a second line), and the
  Thema reappears at the top of the expanded area, since an older entry has no stored Aufgabe to name
  the topic. Bar area is `h-12 sm:h-16` on `grid-cols-2 sm:grid-cols-3`.
- **Fokus history (founder-approved follow-up, same session):** Verlauf is now ONE chronological list
  across both trainers. It needed **no migration**: `sentence_checks` (0009) has stored every check's
  correction and detected grammar since s147, with owner-read/delete RLS, so the founder's existing
  sentences appeared immediately. A Fokus row carries a correction-COUNT chip (or a green
  "fehlerfrei"), expands into the same `CorrectionView` plus one "Erkannt: …" line, and the filter now
  offers only the kinds on record (`Alle` + Fokus/Kurz/Lang). The trend card stays Kurz/Lang-only, since
  Fokus's diff categories are a different taxonomy from the evaluator's `WeaknessCategory`. A partial
  load failure is reported with a retry rather than shown as a shorter history.
- **`wordDiff` now collapses a swapped run into ONE "Wortstellung" fix.** "weil ich war krank." ->
  "weil ich krank war." used to surface as "war → krank" + "krank. → war.", both labelled
  Rechtschreibung, which taught the wrong rule. This fixes Fokus's own correction card too
  (`tests/wordDiff.test.ts` pins it).
- **Screenshot lesson worth keeping:** headless Chromium clamps its viewport to a 500px MINIMUM, so
  `--window-size=390` silently lays out at 500 and crops, which looks exactly like horizontal
  overflow. Verify true phone widths by loading the app in an IFRAME of that width inside a wider
  window (`public/__frame.html` pattern, deleted after use).
- **Not verifiable from the sandbox:** the network policy blocks `*.supabase.co` (403 on CONNECT), so
  whether the column is live has to be confirmed in the app: write a Kurz text, open it in Verlauf,
  and the Original/Korrigiert toggle should appear.
