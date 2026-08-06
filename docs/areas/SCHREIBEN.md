# Schreiben (`/writing`) — current state

A visual EXTENSION of the Bibliothek design language (see the `/design` skill). Founder-approved
previews: `preview/schreiben-bibliothek-extension*.html`, `preview/schreiben-design-review.html`,
`preview/fokus-correction-*.html`, the s168 Fokus-mobile series
`preview/fokus-grammatik-mobile{,-r2,-r3,-r4}.html` (**r4 "Option 2" is the shipped one**; the
earlier rounds are kept as the record of what was rejected, see `/design` §7), and
`preview/verlauf-fortschritt-redesign.html` (Verlauf variant **C "Entwicklung zuerst"**,
founder-picked s171).

## Page frame
- 4-segment sliding-pill switcher **Fokus · Kurz · Lang · Verlauf** IS the page header (no
  eyebrow/H1; Verlauf rides `?mode=verlauf`), capped `lg:max-w-xl` + centered (four short labels
  at full column width read oversized), over the standard `[minmax(0,1fr)_16rem]` content+rail
  grid.
- Schreiben is a CARD in the Prüfung hub (`/anwenden`) since s182, not a top-level nav item
  (it had a tab from 2026-07-22 to s182; founder: "just move schreiben to anwenden"). The route
  `/writing`, the pencil mark and every deep link are unchanged, so a resumed draft still lands here.
- Guest submits: `WritingHub` stashes the draft and opens `AuthDialog`; drafts carry
  `promptIndex` so the OAuth resume restores the exact task.

## Kurz / Lang (guided writing)
- Land STRAIGHT on a randomly drawn Aufgabe + editor — never a theme-picker interstitial.
  `src/data/writingPrompts.ts` holds per-theme task pools (see `docs/areas/CONTENT.md`).
- **`src/lib/writingScope.ts` is the ONE task-selection rule** (s167): `eligibleTasks({theme, sub,
  sector, level, format, length})` returns `WritingTaskRef[]` (`{theme, ix}`), and BOTH the trainer's
  draw and every rail dropdown count go through it. Before s167 the rail counted only sector-TAGGED tasks and
  greyed out at zero while the trainer drew with a prefer-tagged-else-untagged fallback, so most
  Branchen read as unavailable although the full universal pool sat behind them (only 70 of 373
  tasks carry a `sectors` tag; 11 of 20 Themen carry none). Never reintroduce a second counting rule.
  - `theme: ""` = **Alle Themen**, and it is the DEFAULT landing scope (was `themes[0]`). The drawn
    task carries its own theme, which is what the "Aufgabe: <Thema>" eyebrow, the evaluation call
    and the saved draft record.
  - `sub` applies only inside a concrete theme (slugs are theme-scoped) and is ignored under Alle
    Themen; the Unterthema dropdown hides there.
  - **Only tasks with Inhaltspunkte are served** (founder decision, 2026-07-31). A served Aufgabe
    always carries the whole brief: Adressat, du/Sie, 2 to 5 Leitpunkte, Niveau, Textsorte, word
    target. A bare one-liner downgrades the AI to language-only feedback (there is nothing to check
    Aufgabenerfüllung against) and carries neither filter tag. Founder, on a screenshot of
    `wt_safety_l12`: "this one has too little description of the task."
    **The 373 that were retired from the draw are all authored now (waves 3 and 4, s181): 717 tasks,
    every one servable.** They were rewritten in place, same ids and same pool positions, so resumed
    drafts and Verlauf rows still resolve (`taskAt`/`writingTaskById` index the full pool on purpose).
    The rail has no zero-yield Unterthema or Branche left; see `docs/areas/CONTENT.md` for the
    coverage invariants that now gate it.
  - **Niveau, Textsorte and Unterthema are HARD filters** (2026-07-31), and the filters apply in this order:
    Unterthema → Niveau → Textsorte → Branche. A task that is not tagged with the chosen
    Niveau/Textsorte is not a match, full stop. They used to PREFER their tagged tasks and fall back
    to the untagged ones, which is how "Forumsbeitrag" served a Beschwerde an eine Fluggesellschaft
    (founder screenshot): 373 of 643 tasks carry no `format`, so every theme without a tagged task
    contributed its legacy ones, and where even those were absent the filter was dropped entirely.
    Measured on the shipped bank, 66% to 100% of the draws under a Textsorte contradicted it while
    the rail printed the honest (much smaller) count beside the option: the same rail-vs-engine
    disagreement s167 fixed for Branche, still alive on these two axes. Niveau matches by BAND
    (`levelBand`), so a future `B2.2` task answers to "B2" and older `?level=B2.1` links normalize.
  - **Lebensbereich is HARD too, and coarsest** (founder s184): `area` filters the theme loop before
    anything else, so the two areas partition the pool exactly (pinned in
    `tests/writingScope.test.ts`). The rail clears a cross-area Thema when the pill changes, so the
    only way to an empty area scope is a stale deep link; `blockingAxis` then names `area` and the
    empty state offers "Lebensbereich zurücksetzen". The pills' own counts ignore Thema/Unterthema
    (they supersede those), so switching area is never blocked by the Thema you are leaving.
  - `sector` follows the untagged-=-universal rule **per theme** and is applied LAST, so a Branche
    prefers the tagged tasks among whatever the hard axes left. A soft axis must never hide the only
    task matching a hard one, and applying it last is also what keeps **Branche unable to empty a
    pool** (it disables only when Niveau/Textsorte already left nothing).
  - **`countTasks` is the ONE counting function**: with hard axes the rail count and the draw pool
    are the same number, so the separate `countExact` is gone. Every dropdown greys its zero-yield
    options and keeps the honest count visible on them; only the generic "Alle …" option is never
    disabled, since it is the way back out.
  - **An Unterthema with no task reads as empty too.** It used to fall back to the whole Thema,
    which was the last silent substitution in the selector. Retiring the bare tasks emptied 15 of the
    46 Unterthemen at each length, so that fallback would have started firing in earnest; wave 3
    refilled them (≥2 short + ≥2 long each, gated), but the hard rule stays: a new sub-theme without
    tasks reads as unavailable rather than quietly serving its Thema.
  - **A scope CAN now be empty**, and the trainer says so instead of substituting: `blockingAxis`
    names the single filter causing it and the empty state offers exactly that escape ("Forumsbeitrag
    gibt es nur bei Lang." + "Textsorte zurücksetzen"). Greying prevents walking into an empty scope
    inside the rail; what it cannot prevent is a Kurz/Lang switch carrying a length-specific
    Textsorte, or a stale deep link. `randomTask` returns **null** for an empty list (it used to hand
    back the first task of the first theme, which is the bug in miniature).
  - The Textsorte list is **derived from the bank**: an option with no task at any length is dead
    chrome, not a zero-yield scope (`bewerbung` had sat in the list at 0 since s167; it ships under
    Bildung since s181, so all 16 Textsorten are live). It returns by
    itself when content ships one. `tests/writingScope.test.ts` +
    `tests/writingAufgabe.test.tsx` pin all of it, the latter through the rendered trainer.
- **Every dropdown carries a generic first option** (founder s167): "Alle Niveaus", "Alle Branchen",
  "Alle Themen", "Gesamtes Thema", "Alle Textsorten".
- **A scope change never re-rolls onto the same Aufgabe** (s167): the re-roll passes the current task
  as `exclude`, exactly like the shuffle button. Most scope changes still redraw from a pool the filter did not
  narrow, so without this a filter looked broken roughly one time in twelve.
- **Scope changes REPLACE the history entry** (the ViewSwitcher rule, 2026-07-31). Pushing one per
  dropdown made the phone's back gesture undo five filter taps instead of leaving Schreiben. The
  Niveau/Textsorte params are also dropped when the tab switches to Fokus or Verlauf, like
  theme/sub/sector: nothing there reads them and they came back on the next Kurz/Lang visit.
- **The mobile panel stays open until the learner closes it** (founder s167). Picking a Thema used to
  close it while every other scope left it open, so the one control that auto-dismissed was also the
  one that changed the most. Only the X and the toolbar toggle close it now.
- **The task schema is exam-shaped** (s167, `WritingTask`): `points[]` (2 to 5 Inhaltspunkte, the
  thing an examiner actually grades), `addressee`, `register` (du/sie), `level`, `format`, `exam`,
  `words`, `source`. All optional so the bank upgrades in waves; the linter validates when present.
  The Aufgabe card renders the Inhaltspunkte plus "An: <Adressat> (Sie/du)", and the **word target
  comes from the task**, not the mode: real exam targets run 40 to 200 and share no single number
  (`rangeByLength` is only the fallback for untagged legacy tasks).
- **Branche coverage (wave 2, s167):** the five Beruf Themen that apply to EVERY industry
  (`meetings`, `scheduling`, `conflict`, `safety`, `customer`) now carry a dedicated task for all 15
  Branchen in both Längen, at B2. Branche slots filled went from 71/600 (11.8%) to 173/600 (28.8%).
  `tests/writingScope.test.ts` pins it: for those five Themen every Branche must have a tagged task
  AND the draw must serve it rather than fall back past it. The 11 Themen where Branche still changes
  nothing (`travel` + all Alltag) are wave 3/4.
- **Exam formats are REFERENCE, not reproduction** (founder s167): tasks are modelled on the Goethe
  B1 Teil 1-3, B2 Teil 1-2, C1 Teil 1-2 and telc B2 Beruf shapes. No exam wording is copied and the
  module is not advertised as a mock exam. Alltag tasks carry the formal apparatus (Betreff,
  Aktenzeichen, Bezugsdatum, Frist, Grußformel) as Inhaltspunkte, and **never assert a statutory
  deadline or euro amount**: they ask the learner to name the date instead.
- **The Aufgabe card header carries two 40px icon buttons, both BORDERLESS** (founder s169
  follow-up: no box around them; hover tint only, matching the rail header icons).
  **Shuffle sits left, Expand right** (founder order, s169): the button that CHANGES the Aufgabe
  keeps away from the card's outer corner, the one that only opens it takes the corner.
  **Expand** (`Maximize2`) opens the whole task in the app's standard centered dialog: the card is
  capped so the page fits one viewport and can therefore cut a long Aufgabe mid-line, so there has
  to be one place that shows all of it. Same eyebrow + Ziel line as the card, so it reads as the
  same object; standard dialog recipe (soft darkening, no blur), never a bottom sheet. **Shuffle**
  (`Shuffle`, replacing the dice, s169) re-rolls within the current scope and CLEARS the editor with
  it (founder 2026-07-31, reversing the older "keep the typed text" rule: a new Aufgabe means a new
  text, and the old one left standing means writing the next answer around it; the rail reset and the
  scope-change redraw clear too, so all three paths agree); the icon is point-symmetric, so the half-turn per roll reads as motion and
  settles back into the same shape. Scope changes (`?sub=`/`?sector=`; theme switch clears sub,
  Branche travels) reset the draft.
- Aufgabe card: NO theme icon; a **brand-colored bold** "Aufgabe: <Thema>" eyebrow + one meta line
  **Niveau · Textsorte · Ziel** (the editor word count does NOT repeat the Ziel range). The Niveau
  joined it on 2026-07-31: under "Alle Niveaus" nothing on screen said whether the Aufgabe in front
  of the learner was a B1 or a C1 one. The Ziel upper bound is `words x 1.25` **rounded up to a full
  ten**, since "Ziel 150–188 Wörter" read like a figure to hit exactly. The AI disclaimer is NOT inside the
  card: on desktop it is a fixed line at the bottom of the viewport level with the floating Feedback
  pill; on mobile it is a fixed line just above the nav, in every state (s160/s169, same as Fokus,
  see below).
- **`WritingRail` = "Aufgabe wählen": a light HIMMELBLAU tile** (`bg-accent/20`, dark
  `bg-accent/10`; NOT grey) with **no visible outline at all** (founder s169): the border wears the
  fill's own colour (`border-accent/20`, dark `border-accent/10`) and the tile is separated from the
  page by `shadow-soft`, exactly like the Bibliothek word cards. The s168 answer (a neutral
  `border-border` edge) is retired: a grey rule around a blue wash read as dirty. Inner dividers are
  tinted to match (`border-accent-ink/10`), so no hard grey line survives on the tile. Header reset
  icon and the
  scope hierarchy Niveau → Branche → **Lebensbereich** → Thema → Unterthema → Textsorte, all
  single-select dropdowns except Lebensbereich, which is the shared `LifeAreaPills` pill pair
  (Textsorte grouped by family: E-Mail & Nachricht / Meinung & Öffentlichkeit / Bericht /
  Beschwerde & Antrag) (grouped listbox
  popovers, internal scroll, live counts, zero-yield greyed; Unterthema only when the theme has
  sub-themes; Thema groups = the two life areas from `lib/lifeAreas.ts`, Berufsleben and Alltag,
  never a third heading, and an active Lebensbereich pill leaves exactly the one group it names). No
  overflow clipping on the tile (popovers must escape); the mobile panel animates via fade/slide,
  not height collapse, for the same reason.
- Mobile Kurz/Lang = the Bibliothek pattern: a toolbar button toggles the collapsible panel
  (`layout="panel"`, no floating chip rows) plus the floating Auswerten cluster (below). Fokus has
  NO toolbar toggle since the s168 rework; its mobile grammar controls live in the always-visible
  `GrammarDials` tile (see §Fokus).
- **The panel toggle wears the rail's own Himmelblau** (s166): "Aufgabe wählen" (Kurz/Lang) is
  `variant="accent"` when closed, `default` (solid primary) when open.
  `outline`'s `bg-surface/50` made them vanish into the page ground. Since s169 the `accent`
  variant follows the rails exactly: border in its own fill colour plus `shadow-soft`, no visible
  edge (s166's `accent-ink/70` and s168's neutral `border` are both retired; the alpha problem they
  were solving disappears once there is no edge to read). Label contrast is unchanged,
  4.72:1 light / 7.71:1 dark. Reuse the variant for any panel toggle, never re-tint `outline`.
- Umlaut keys (`UmlautKeys`, below) sit in the word-count row of `GuidedWritingTrainer.tsx`.
- **The writing field is sized, not fixed-`rows`** (`useFillEditor.ts`, founder s168). At rest it
  fills from its own top down to whichever bottom chrome is laid out (mobile cluster / desktop
  Art. 50 line), so the page does not scroll; typing past that grows it (page scroll turns on) to
  at most 1.8x the resting height, the space the screen actually offers, or 60% of the viewport,
  whichever is largest; past that it stops and scrolls internally. `resize-none`: the height is
  measured, so hand-resizing is gone and `rows` is only the pre-measurement fallback.
- **The floor is a preference, the fit is the guarantee** (founder s169: "there should be no
  scrolling when opened newly"). Preferred floor = max(160px, 22% of the viewport). When a long
  Aufgabe (Inhaltspunkte) would push the field below it, the shortfall comes out of the AUFGABE
  CARD first: its prompt + Inhaltspunkte region is capped by exactly the deficit and scrolls
  internally (`slim-scrollbar`; the eyebrow + icon-button row never scrolls away), down to a **72px**
  minimum. Anything still missing after that comes out of the FIELD, down to `HARD_MIN` = 72px:
  handing the field its preferred floor regardless is what put ~60px of resting scroll on Kurz and
  Lang. A field that small only happens on a small phone with a long Aufgabe, and typing grows it
  again immediately. Measured headless from 320x568 to 412x915, with and without simulated
  safe-area insets: zero overflow from 360x740 up, SE-class 667px viewports still short by design.
  Once a result is on screen the field drops to its text's own height so the feedback is not pushed
  a screen down. Measure it in JS, not a `dvh`/flex chain: the trainer sits inside AppShell →
  WritingHub → AnimatePresence, none of them height-constrained.
- **The "Noch N Wörter" hint lives in the editor card, under the umlaut keys** (founder s169), not
  in the action cluster's caption slot (the s168 answer). It is the honest reason Auswerten is
  inactive, and it belongs next to the thing being typed; the cluster sits high enough now that a
  card-tail line cannot land under it. Same placement in Fokus.
- **From `lg` up the RESTING height is capped and Kurz is shorter than Lang** (`desktopFieldCap`
  in `GuidedWritingTrainer.tsx`, founder s168 follow-up: filling a whole desktop window "looks
  odd"). Kurz = max(176px, 22% of the viewport), Lang = max(252px, 32%), so the field never
  reaches the bottom chrome on desktop and the two modes read as different sizes. **Mobile has no
  cap and still fills** — on phones the space is genuinely scarce, which is the whole point there.
  Growth and internal scrolling are unchanged by the cap.

## Verlauf (history)
Renders inside the same content grid column (never full width); the empty state deep-links into
Kurz. Design = variant C, "development first" (founder-picked s171):
- **"Deine Entwicklung" card leads the tab**: the top 3 weakness categories as monthly mini bar
  groups over `TREND_MONTHS` (3) calendar months, oldest bar lightest, with a per-category trend
  arrow (down = `--success`, up = `--warning`, flat = muted) and a success badge for the biggest
  drop ("Kasus & Artikel: 33 % weniger"). Footer = "Größte Schwachstelle: X" + "Jetzt üben".
- **The monthly layout is ALWAYS the card's shape** (founder s171 follow-up: with only one month on
  record the old totals-only fallback read as a different card from the approved preview). What waits
  for evidence is the CLAIM, not the shape: the arrows and the "% weniger" badge appear only once two
  months qualify, and until then a single muted line explains why ("Der Trend erscheint ab dem
  zweiten Monat."). Never restore a second layout here.
- **Honesty rules that must not be weakened:** a month only counts as a comparison point with
  `MIN_TEXTS_PER_MONTH` (2) texts or more, so a quiet month never reads as progress; a month with
  no texts prints "–", never 0. The first live check caught exactly what this prevents: compared
  against a one-text month, an IMPROVING category rendered as worsening.
- Bar groups sit on `grid-cols-2 sm:grid-cols-3` with a shorter bar area on mobile (`h-12 sm:h-16`),
  so three categories stay compact on a phone.
- **List = compact rows** (date · Thema · Kurz/Lang · Himmelblau weakness chip · chevron). The row
  disclosure holds, in the order it happened, the **Aufgabe** (resolved from `task_id`, s167; older
  rows without one omit it), **Dein Text**, then the **Tipp** next to the practice CTA, with delete
  and the standalone AI line at the foot.
- **The row is ONE line at every width** (founder s171 follow-up). Below `sm` the date shortens
  ("16. Jun") and the **Thema badge is dropped**, because a long Thema pushed the weakness chip onto a
  second line; date + Art + chip are what the learner scans. The Thema then reappears as a badge at
  the TOP of the expanded area (`sm:hidden`), so the topic is never invisible on a phone: an older
  entry carries no stored Aufgabe to name it.
- Kurz/Lang filter (`ModeSwitcher`, the shipped grey-track/white-pill language) appears ONLY when
  both kinds exist; the count badge next to "Letzte Auswertungen" reflects the filtered list.
- `getWritingHistory` returns `null` on a failed query (never `[]`), so the error card with
  "Erneut versuchen" is reachable and an empty history is never faked.
- **The correction is stored and shown** (s171, migration **0012** adds `corrected_text`). The row
  disclosure renders it with the Fokus language: an Original/Korrigiert toggle, coral marks on the
  original, green on the corrected, and Himmelblau tiles naming each edit's category. Rules:
  - The diff runs **per paragraph** (`\n{2,}`), so a letter keeps salutation / body / sign-off;
    `diffWords` tokenizes on whitespace, so one diff over the whole text collapses it to a block. A
    changed paragraph COUNT falls back to one whole-text diff.
  - Marks and tiles are computed client-side by `lib/wordDiff.ts`. Only the corrected TEXT is stored,
    so no extra AI cost per view, and `classifyChange` gained **Zeichensetzung** (a bare comma fix used
    to read as "Groß-/Kleinschreibung", which taught the wrong rule).
  - Tiles cap at `MAX_FIX_TILES` (6) so a long text cannot wall off the card; "+N weitere" is a
    TOGGLE that expands to every correction and folds back (founder 2026-07-31).
  - `corrected_text` is null for pre-s171 rows, for the templated spelling verdict (no model call) and
    for an error-free text, so the toggle appears only when there is a real correction. The plain
    "Dein Text" block is the fallback.
  - The evaluator asks for a MINIMAL repair, never a rewrite (a diff against a re-imagined text is
    unreadable), and `sanitizeCorrected` drops anything that is a rewrite, a truncated stump, an echo
    of the Aufgabe or an unchanged copy.
- **Fokus sentences share the list** (s171): ONE chronological Verlauf across both trainers, newest
  first, capped at 30. This needed **no migration** — every check has been persisted to
  `sentence_checks` since s147 (migration 0009) with its correction and detected grammar, and the
  table already carries owner-read + owner-delete RLS, so the history reaches back over everything
  already practised.
  - A Fokus row reads like a writing row: date · "Fokus" · a Himmelblau chip with the correction
    COUNT (or a green "fehlerfrei" badge) · chevron. Expanded it shows the same `CorrectionView`, the
    detected form as one muted "Erkannt: Aktiv · Perfekt · Indikativ" line, and delete.
  - The filter offers only the kinds ON RECORD (`Alle` + Fokus/Kurz/Lang as they exist) and appears
    only when there is more than one, so a segment can never yield nothing.
  - **"Deine Entwicklung" stays sourced from Kurz/Lang only.** Its axis is the evaluator's single
    prioritised `WeaknessCategory`; Fokus produces diff categories from a different taxonomy, and
    mixing the two would rank incomparable things.
  - A partial load failure is reported under the list with a retry, never silently shown as a shorter
    history; only a failure of BOTH sources replaces the page.
## The correction in Kurz/Lang (founder pick A, s172)
`preview/kurz-lang-korrektur.html` offered three places for it (A im Schreibfeld · B alles im
Ergebnis · C zum Aufklappen); the founder picked **A**, and asked for tiles harmonious with Fokus.
`preview/kurz-lang-korrektur-r2.html` (+ `-dark`, generator `gen-kurz-lang-korrektur-r2.mjs`) is the
verification sheet: unlike the older generators it SSR-renders the real components next to the Fokus
card, so it cannot drift from what ships.
- **The editor card becomes the correction card** once an evaluation lands, exactly as Fokus swaps its
  input for the corrected sentence: bold brand-blue "Dein Text" eyebrow sharing its row with the
  Original/Korrigiert toggle, the marked text (coral on Original, green on Korrigiert), a divider, then
  the Himmelblau fix tiles. The RESULT card below stays short (tip + Übungs-CTA), which is why A won
  over B.
- **The plain field returns for everything without a correction**: an error-free text, the templated
  spelling verdict, a failed or limit-reached call. Those keep the textarea, the umlaut keys, the word
  count and both desktop buttons, so fixing and resubmitting still works.
- **"Neu schreiben" rides the tile row on desktop** (`ml-auto self-end`), the Fokus "Neuer Satz" spot,
  and Auswerten drops out there while a correction is on screen: re-pressing it returns the same
  cached verdict. On mobile nothing moves, the floating cluster keeps Neu schreiben + Auswerten at
  the locked geometry.
- **`useFillEditor` no longer needs a textarea to exist.** The bottom clearance is measured first, so
  the state with no field still reserves the fixed chrome; the Aufgabe-card cap is RELEASED there,
  since the page scrolls for the result anyway and the whole task should be readable next to the
  correction.
- No backend work: `evaluate-writing` has returned `corrected` (and served it from cache) since s171.

## ONE correction language (`src/features/writing/correction.tsx`, s172)
Fokus, the Kurz/Lang result and the Verlauf render corrections from the SAME pieces:
`useCorrectionDiff` (per-paragraph diff), `CorrectionToggle`, `MarkedTokens`/`MarkedParagraphs`,
`FixTiles` (optional `max` → "+N weitere", optional `action` slot). The markup used to be copied per
surface and had already drifted: the Verlauf tiles had lost the "→" and printed an em dash for an
empty side, so one edit read differently depending on where the learner met it. `tests/correction.test.tsx`
pins the tile anatomy (category eyebrow, struck original, arrow, green fix, `∅`/`(entfernt)`, the cap,
the moved-word single word).
- Fokus **mobile** keeps its own two-column correction list (no chip backgrounds, founder r4
  amendment): that card has a measured height, so tiles cannot grow in it. Kurz/Lang shows tiles at
  both breakpoints, because its result page scrolls.
- `classifyChange` gained **"Kasus & Artikel"** (s172): a swap between two article/possessive/
  determiner forms ("meine → meiner", "der → den") is a declension fix, and calling it
  "Rechtschreibung" taught the wrong rule in the mistake B1/B2 learners make most. Both sides must be
  in the closed set, so "das → dass" stays Rechtschreibung and a case-only change stays
  Groß-/Kleinschreibung.


## Fokus (Satzlabor)
- Every check lands in `sentence_checks` and is surfaced in **Verlauf** (s171), so a corrected
  sentence stays re-studiable instead of vanishing on reset.
- Single-sentence write → correct → transform lab. **Grammar rail = three combinable axes,
  data-driven from `grammarDimensions.ts`: Genus Verbi (Aktiv · Passiv · Zustandspassiv), Zeitform
  (Präsens · Perfekt · Präteritum), Modus (Indikativ · Konjunktiv II)** (s159, Wave 2). `mood` is a
  real axis now (was the pinned `DEFAULT_MOOD`); Zustandspassiv is its own pill (a detected
  `passiv_zustand` maps straight to it). `GrammarRail` is the same Himmelblau tile:
  detected form = **white pill + green `bg-success` dot** (never a blue fill/ring), target solid
  primary, pre-correction all idle, header reset icon (back to the detected form), hint breaks
  after "Grüner Punkt = dein Satz.". Desktop only since s168; the founder-approved
  mobile rework (preview rounds r2 to r4, "Option 2") replaced the collapsed panel + toolbar toggle,
  which read as a filter and hid the transform feature:
  - **Two tiles fill 90% of the height** between the switcher and the fixed bottom chrome (sentence
    card `grow-[1.15]`, tile `grow`, content vertically centered). `measureMobile` measures the room
    down to that chrome and keeps `FILL_RATIO = 0.9` of it, anchored at the top, so the pair stops
    short of the chrome instead of filling every pixel (founder s175: it read as cramped); the
    tiles sit `gap-5` apart. `measureMobile` sets an exact
    **`height`** before a correction exists and a **`minHeight`** after (founder s169): a minimum
    alone let the tiles' natural height win whenever card chrome + three dials + a wrapping legend
    outgrew the screen, which is where Fokus's resting page scroll came from. With a fixed height
    the writing field (`min-h-[72px]`, `min-h-0` on every flex ancestor) absorbs the shortfall;
    after a correction it must be a minimum again, because a long list of fixes has to grow.
  - **`GrammarDials`** (mobile-only) is a Himmelblau tile headed "Grammatik" (+ reset icon) with
    ONE content-sized dial per axis, centered, axis eyebrows above: green dot = detected form,
    solid primary = chosen target, tap opens a small picker popover. Dimmed but visible before a
    correction, so the feature announces itself. The legend line doubles as the refusal/error slot
    and is **parked at the tile's bottom edge** (founder s169 follow-up), with the dials centered in
    the room above it: the same two-region split the sentence card uses, so the two tiles rhyme.
  - **The picker places itself** (s170): it is measured before paint, then flipped ABOVE the dial
    whenever it would not clear the floor, capped to the room it has (internal scroll as the last
    resort) and nudged back inside the viewport when an edge dial would push it off screen. The
    floor is the LOWER of the tile's foot and `bottomLimit()`, the live top of the fixed bottom
    chrome that `FokusTrainer` passes down: once a long correction lets the page scroll, the tile's
    own foot slides under that chrome and stops being the limit. A downward-only picker was the bug
    (founder s170: the last options sat under the tab bar with no scroll able to reach them).
  - **The sentence card owns every state** behind a centered view toggle: Original (coral marks) /
    Korrigiert (green marks) / **Umgeformt** (the transformed sentence, green-marked via a diff
    against the corrected one, plus the Hinweis + Nochmal + speak row). The separate transform card
    below is desktop-only. **"Neu"** (not "Neuer Satz") sits top-right of the card, the Kurz/Lang
    shuffle/expand corner; icon-only beside the three-segment toggle.
  - **The card body is TWO stacked regions** (founder s169): the sentence centered in a `flex-1`
    region, the detail block (corrections / Hinweis + actions / "Alles korrekt") anchored under it.
    One centered group gave all its slack to the space ABOVE the sentence ("more space before the
    sentence than after"). **No horizontal rule under the sentence** either; the gap separates them.
  - **Corrections are two text columns** (founder r4 amendment: no Himmelblau chip backgrounds on
    mobile; category eyebrow, struck original and green fix keep their colors). The separator is
    ONE full-height rule down the middle of the grid (`absolute inset-y-0 left-1/2`), never a
    per-cell `border-l`: with three fixes the per-cell version stopped after row 1 (founder s169).
    The eyebrow hugs its fix (`mb-0.5`) and the row gap is wider (`gap-y-5`), so each category +
    edit reads as one unit. Desktop keeps the fix tiles.
  - **While the KI works, the sentence line becomes a skeleton**: three tapering rounded bars with
    a slow Himmelblau sweep (`.fx-skeleton-bar` in `index.css`, reduced-motion safe, 0.14s per-bar
    stagger). Shown during the correction call (with the learner's own sentence above it, the card's
    whole idle body replaced) and again in the sentence region during a transform. Founder s169:
    the spinning dial and the button label alone did not read as "something is happening".
  - **Korrigieren floats fixed** above the KI line until a correction exists (portalled,
    see §Mobile floating action cluster); the KI line is locked just above the nav in every state
    and carries the Art. 50 note only (the "Noch N Wörter" hint moved into the card, s169).
- **All AI feedback prose is written for a beginner, and carries a DE/EN switch** (founder
  2026-07-31: "the vocabulary used is way too advanced ... with an english toggle button even for
  this section"). Grading level and EXPLAINING level are two different things: a C1 text is still
  graded at C1, but the Tipp and the Hinweis are asked for in simple A2 German (short main
  sentences, everyday words, no "Aufgabenerfüllung"/"Inhaltspunkt"/"Adressat"/"Konnektor"/
  "Umformulierung", a concrete example from the learner's own text) plus the same sentence in
  equally simple English. `evaluate-writing` returns `insightEn` (stored in `insight_en`,
  migration 0014, so Verlauf keeps it) and `transform-sentence` returns `note_en`; both prompt
  revisions were bumped (`PROMPT_REV`, `PROMPT_VERSION`) so the caches cannot serve prose written
  under the old wording. The switch is `src/features/writing/FeedbackLang.tsx`, **sticky, NOT the
  hold-to-peek `EnPeek`**: a tip is a paragraph of instruction and nobody reads a paragraph with a
  finger held down. `EnPeek` remains the pattern for LEARNING content (word cards, Grammatik). The
  chip renders only when an English version exists, so a pre-0014 Verlauf row shows no dead control.
- The transform box is a **white card** (never a grey wash) with a bold colored "Hinweis:" label
  (no i icon) and "KI-generierte Umformung" centered at the card bottom. Its header row carries a
  **"Nochmal" button** (RefreshCw, beside the speaker) that asks the AI for an alternative phrasing
  of the SAME target form (s163): `useFokusMachine.regenerate()` cycles variant 0→1→2→0, generating
  each new variant once then serving cached ones for free, with `m.variantsLeft` printed on the
  button as "2 von 3 übrig". Cost cap is enforced server-side too
  (`transform-sentence` clamps `variant` to 0..2; variant 0 keeps the original global cache key,
  variants 1..2 cache under their own keys). Needs `transform-sentence` deployed with the `variant`
  param (done s163). The send-to-AI note +
  that footer are ONE combined Art. 50 note. **Desktop (s160):** it is dropped to a fixed line at
  the very bottom of the viewport, level with the floating "Feedback" pill (full sentence, left;
  pill, right; no bordered bar), mirroring the pill's `lg:pl-64` + `max-w-6xl` offsets and clearing
  the pill on the right; pointer-events pass through except the link. **Mobile (s160):** condensed
  to "KI-geprüft, kann Fehler enthalten. Mehr · Feedback geben" under the button row (the Feedback
  link joined it in s192). **Kurz/Lang uses the exact same
  treatment** (`GuidedWritingTrainer.tsx`, s160): its own `aiNoteDesktop` fixed note above the
  floating Auswerten (and Neu schreiben after a result), condensed note beneath.
- **Correction card** (`FokusTrainer.tsx`; approved via `preview/schreiben-design-review.html`):
  the "Dein Satz" eyebrow shares its row with an **Original/Korrigiert view toggle** (default
  Korrigiert; resets to Korrigiert on each new correction). Original marks wrong words with
  `.fx-mark-coral` (`--reward`), Korrigiert marks fixes with `.fx-mark-green` (`--success`) —
  calm underlines, not fills (`index.css` `@layer utilities`). No struck-through original, no
  "· n Änderungen" counter, no in-place `<mark>`, no "Was ich geändert habe" list (all retired).
- Below: a row of **Himmelblau fix tiles** (light `bg-accent/30 border-accent/70`, dark
  `bg-accent/[0.18] border-accent/[0.45]`), each = a heuristic category eyebrow
  (`text-accent-ink`; Rechtschreibung / Umlaut / Groß-/Kleinschreibung / Grammatik / Ergänzung /
  Streichung, from `classifyChange` in `wordDiff.ts`) + the `old → new` edit, with **Neuer Satz**
  as an outline button on that same row (`ml-auto self-end`, wraps only if needed) — NOT on the
  mobile toolbar or the desktop rail. With more tiles than `MAX_FIX_TILES` (6) the tail folds behind
  a **"+N weitere" TOGGLE** that expands to every correction and folds back to "Weniger" (founder
  2026-07-31: "there's no way to expand upon it and see all the chips"); the cap only decides what
  the card opens with, it never hides a correction for good. `wordDiff.diffWords` returns `tokens` + `originalTokens`
  (both flagged) + `changes` (each with a `category`); `tests/wordDiff.test.ts` pins it. A word that
  was only **reordered** is collapsed by `collapseMoves` into ONE `{category:"Wortstellung",
  moved:true}` change (was a contradictory Streichung + Ergänzung pair, s163); a `moved` tile renders
  the word ONCE (green, no `old → new` arrow).
- The Fokus Original/Korrigiert toggle is `rounded-lg`/`rounded-md` squircle.

## The mobile header rows (founder s195)
A phone carries TWO short rows above the trainer, and they are the zone's, not Schreiben's:
1. **The module row** (`features/pruefung/ModuleHeader.tsx`, `lg:hidden`): the Schreiben mark and
   the word "Schreiben", ~32px, no controls. Every screen in the Prüfung zone has it on a phone, so
   a trainer finally says which module it belongs to.
2. **The switcher row**: `WritingModeSwitcher` and, on Kurz/Lang, the Aufgabe toggle beside it,
   labelled just **"Aufgabe"** with no icon. The toggle is PORTALLED up from
   `GuidedWritingTrainer` into a slot `WritingHub` owns, because the trainer owns the open state
   and the panel; the panel itself still renders under the row, which is what makes the toggle
   read as opening it. `empty:hidden` on the slot keeps the switcher full width on Fokus and
   Verlauf, which park nothing there. The switcher's segments are `px-1 text-[13px]` below `sm`
   so four labels plus the toggle fit 360px.

Net effect measured in the real build at 360x640 on Kurz: the resting page scroll went from 134px
to 99px, because merging the picker row saves more than the module row costs. It is not 0 there:
the field is at its `HARD_MIN` 72px floor and the Aufgabe card at its own, which is the documented
give-up case in `useFillEditor`. At 393x852 and every larger width it is 0.

## Mobile floating action cluster (Fokus + Kurz/Lang)
The bottom cluster (Korrigieren / Auswerten, and Neu schreiben after a result) carries
**no bar chrome** (founder s159/s160): no border, no full-width backdrop. It therefore floats
straight over the content cards, so nothing in it may be see-through (s164 founder report: the
disabled Auswerten button and the card's hint line read as two labels on top of each other).
- **`fixed`, not `sticky`** (founder s168). Sticky parks the cluster at the END of the
  content whenever the page fits the viewport, so it sat at one height in Kurz, another in Lang,
  and jumped on every task change. It is now pinned above the nav at one height for good, with
  AppShell's `<main>` offsets mirrored (`mx-auto max-w-6xl px-4 sm:px-6`) so it stays in the
  content column, and `useFillEditor` gives the trainer root the matching bottom clearance.
- **ONE geometry for all three trainers** (founder s169: the buttons "keep switching abruptly"
  between Fokus and Kurz/Lang). Both clusters sit at
  `bottom-[calc(3.9375rem + safe-area + 2rem)]`, and BOTH carry their KI line as a separately fixed
  line at `+0.5rem`, never as an in-cluster caption. Before this, Kurz/Lang's note rode inside the
  cluster, which pushed its buttons ~13px below the Fokus ones. Anything mode-specific in this row
  shows up as a jump on every tab switch, so keep the two call sites identical.
- Fokus's cluster disappears once a correction exists (the card corner "Neu" and the dial tile take
  over); its KI line stays.
- **All fixed layers are portalled to `<body>`.** WritingHub slides tab panels with an `x`
  transform, and a transformed ancestor becomes the containing block for its `fixed` descendants;
  without the portal the clusters and the KI lines re-anchor to the panel mid-slide.
- **Opacity is the contract, not the bar.** `src/features/writing/floatingCluster.ts` holds the two
  class names: `floatingSlot` (opaque `bg-background` behind a control, because `variant="outline"`
  is `bg-surface/50` and `disabled:` is `opacity-50`) and `floatingNote` (the caption plate,
  `bg-background/90` + `backdrop-blur-sm`, matching the other mobile bars). `--background` equals
  the page stops, so both are invisible against the page ground and only mask over a card.
- **The primary action owns the whole row** (founder s195). The Zurück pill that held the left
  slot from s192 is gone: the zone's ONE exit is the shell's top-right corner now, on every screen
  and at every width, which is also the first time the desktop trainers have had a way back at all
  (`docs/areas/PRUEFUNG.md` §One frame). It still means `/anwenden`, never history, because
  `/writing` is entered from the hub card, the dashboard recommendation and ⌘K. Leaving asks
  nothing, because `draftAutosave` keeps the text of each mode: a "dein Fortschritt wird nicht
  gespeichert" here would be false. Feedback stays DOWN in the caption line as a plain
  `FeedbackLink`, the shape the Bibliothek tabs already use:
  "KI-geprüft, kann Fehler enthalten. Mehr · Feedback geben", one line down to 320px wide.
  Both trainers render the SAME `MobileAiNote` component now, so the two copies cannot drift apart.
- **The caption slot carries the Art. 50 note and nothing else** (founder s169, superseding the
  s168 rule that put transient hints there; s192 added the Feedback link beside it, which is the
  same fixed pair in every state, not a swap). The "Noch N Wörter schreiben …" line moved into the
  card, under the umlaut keys, in both trainers: it is a note about what the learner is typing, and
  a bottom line that swaps content between states reads as chrome that cannot be trusted. The
  original reason for the s168 placement (a card-tail line landing under the pinned cluster) is
  gone now that the cluster sits 2rem higher and the field is sized to end 12px above it.

## Umlaut keys
`src/features/writing/UmlautKeys.tsx`: reusable insert bar (ä ö ü ß Ä Ö Ü) for non-German
keyboards. Inserts at the caret (over a selection too), neutral `bg-surface` at rest, flashes
Himmelblau on press, keys ~24px. Wired into the Fokus input footer (shares the desktop row with
Korrigieren) and the Kurz/Lang editor. Takes `{ textareaRef, value, onChange }`.

## Daily allowances (founder s167)
Per learner, per day, all env-overridable in the Edge Functions:
- **Fokus: 10 Runden** (`DAILY_CHECK_LIMIT`, `check-sentence`). One round = one
  Korrektur. The optional Umformung that follows does **not** consume a second unit, so
  the counter is the CORRECTION count only. `TRANSFORM_DAILY_LIMIT` (30) exists purely so
  the "Nochmal" variant cycle cannot run away (10 rounds x 3 variants); it is never the
  binding constraint and must stay >= 3x `DAILY_CHECK_LIMIT`.
- **Kurz: 4** (`DAILY_LIMIT_SHORT`) and **Lang: 2** (`DAILY_LIMIT_LONG`), counted
  SEPARATELY against `writing_evaluations.length`, so spending the day on Kurz cannot
  exhaust the Lang allowance. The old single `DAILY_LIMIT` (5, shared) is retired.
- A cached resubmission of the same text returns before the row is written, so it is free
  and does not consume the day's allowance.
- The per-user monthly ceilings and the global `MONTHLY_SPEND_CAP_USD` fuse still apply
  above these.
- **The allowance is VISIBLE, not just enforced** (founder 2026-07-31, "even for korrigieren,
  there is no count"). Each trainer prints `Heute noch 7 von 10` beside the button that spends
  it: Fokus under the Korrigieren row (both breakpoints), Kurz/Lang under the umlaut keys,
  sharing one line with the transient "Noch N Wörter" hint (hint left, allowance right).
  `src/lib/aiAllowance.ts` owns the number, `src/features/writing/AllowanceNote.tsx` renders it.
  Two sources, in this order: (1) `dailyLimit`/`dailyRemaining`, which `check-sentence` and
  `evaluate-writing` now return on EVERY response, so an env-raised limit shows up by itself;
  (2) a row count on mount over the same tables and the same UTC day boundary the functions
  count (`sentence_checks`, `writing_evaluations` filtered by `length`; both are select-own under
  RLS). Unknown (signed out, offline, query failed) renders NO number rather than a guess.
- **The Umformung has its OWN visible allowance since s197** (`AiMode` gained `transform`, default
  30). It was the one AI feature with no readout at all, so `TRANSFORM_DAILY_LIMIT` arrived as a
  wall with no warning. It stays a SEPARATE budget rather than joining Fokus, because an Umformung
  has never spent a Korrektur (above) and one round can spend three of it. Counted against the same
  ledger the function counts (`sentence_ai_ops`, `kind = 'transform'`, select-own under RLS; only
  PAID ops land there, so a cached Umformung is free on both sides), and `transform-sentence` now
  returns `dailyLimit`/`dailyRemaining` on its success and limit-reached responses (never on a cache
  hit, which spends nothing and returns before the count is taken). Rendered by the existing
  `AllowanceNote` in the Umformung card: the header row on desktop, under the Nochmal row on a phone.
- **"Nochmal" carries its own counter**: `2 von 3 übrig`, the NEW AI phrasings still available for
  the current target form (`TRANSFORM_VARIANTS`, matching the server's 0..2 clamp). Cycling back to
  an already-generated phrasing is cached and free, so it does not count down; picking a different
  target form starts a fresh 3. At 0 the button keeps working and its tooltip stops promising
  something new. Pinned by `tests/fokusVariants.test.tsx`.

## The evaluator receives the Aufgabe (s167 P2)
Before s167 `evaluate-writing` got `{theme, length, text}` and the task text NEVER reached a
prompt, so Aufgabenerfüllung was structurally uncheckable: the model graded language in a vacuum
and could not know a content point was missing, the Anredeform wrong, or the text far too short.
- The client now sends `taskId · task · points[] · level · format · addressee · register · words`
  (`src/lib/writing.ts`). Every field is OPTIONAL and bounded server-side before it reaches a
  prompt (task 600 chars, each point 200, max 5 points): it is learner-supplied input on the wire,
  not trusted content. A legacy task without structure degrades to language-only feedback.
- `buildSystemPrompt(level, hasTask)` replaced the fixed "Prüfer:in für Deutsch B2 Beruf" string.
  It grades at the TASK's level (a B1 text is no longer marked to a B2 bar) and, when a task is
  present, checks **content first**: every Inhaltspunkt covered, Anrede matching the addressee,
  length roughly met. That mirrors the real rubrics (Goethe zeroes an Aufgabe whose Erfüllung
  fails; telc counts covered Leitpunkte).
- **`taskCompletion` (Aufgabenerfüllung) is a new `WeaknessCategory`**, mirrored in
  `src/data/practiceAreas.ts` (deep-links back into Kurz, since the fix is rewriting the task, not
  a grammar lesson) and in `scripts/lint-content.mjs`.
- **The cache key folds in the task id + level + `PROMPT_REV`.** It was text-only, which was
  harmless while the task did not shape the prompt and would have been a correctness bug the
  moment it did. Bump `PROMPT_REV` on any rubric/prompt change to invalidate the cache.
- The Aufgabe travels with EVERY provider call, so a cascade fallback cannot silently downgrade to
  language-only grading.
- **The dominant-spelling shortcut still bypasses the task check by design** (>=3 spelling errors,
  >8% of words, and at least 2x the grammar count): a text that misspelt is served the spelling
  tip with no LLM call at all, which is both the right feedback and free.

## Drafts are never lost to a reload (s173)
- Two different persistences, do not merge them:
  - **`resumeDraft.ts`** — the sign-in hand-off. ONE draft, stashed deliberately when a guest hits
    the login wall, consumed once, and its `resume: true` flag is what makes `AppShell` redirect
    back to `/writing` after the OAuth round trip. Consuming it **remounts the guided trainer**
    (`key={guided-<resumeKey>}`) and passes the Aufgabe's theme as a **prop**, never as `?theme=`
    (2026-07-31). Both were bugs: `initialText` is read once on mount, and signing in with
    email/password does not remount anything when the learner is already on the draft's own tab, so
    the text came back only after the Google round trip; and writing `?theme=` pinned a learner who
    had been on "Alle Themen" to one Thema they never picked, whose scope change then cleared the
    draft being restored.
  - **`draftAutosave.ts`** — the quiet autosave. localStorage, one draft PER mode (Fokus / Kurz /
    Lang each keep their own, so a tab switch is not destructive), 7-day TTL. Written 500ms after
    the last keystroke and again on unmount / pagehide; restored on mount, guided modes together
    with the exact Aufgabe (`theme` + `promptIndex`) the text was written against. It must never
    carry `resume`, or it would trigger the sign-in redirect.
- Both trainers also hold a **live-work claim** (`lib/liveWork.ts`) while the editor is non-empty,
  so the PWA's auto-update reload waits instead of throwing the draft away mid-sentence.

## Task ids and the evaluation reference
- Every task carries a **permanent** `id` (`wt_<themeId>_<s|l><nn>`), enforced unique + pattern-
  matched by `lintWritingPrompts`. Same law as every other content id: retire from the surface,
  never rename, reuse or renumber. An evaluation row references it and the AI cache is keyed on it.
- `writing_evaluations.task_id` (migration **0011**) records it, so **Verlauf can show the Aufgabe
  again** (with its Inhaltspunkte), which pooled prompts made impossible after s148.
- **Deploy order matters: run migration 0011 BEFORE deploying `evaluate-writing`.** The insert is
  guarded (it retries without `task_id` and logs) so a wrong order degrades to "no task reference"
  instead of losing the row, which would also have stopped the daily limit counting.

## AI backend
The Fokus Satzlabor (`check-sentence`/`transform-sentence`) AND the Kurz/Lang coach
(`evaluate-writing`) share ONE provider cascade in their Supabase Edge Functions:
**Gemini 2.5 Flash (free, recorded $0) → Claude Sonnet 5 → GPT-5.** Sonnet leads the paid backup
until month-to-date Claude spend across `sentence_ai_ops` + `writing_evaluations` reaches
`CLAUDE_BUDGET_USD` ($2), then GPT-5 leads; the global `MONTHLY_SPEND_CAP_USD` ($5, shared
`ai_usage` fuse) bounds all three combined. Anthropic calls send no `temperature` +
`thinking: disabled`; Gemini forces JSON output + a generous token budget; GPT-5 uses
`max_completion_tokens` + `reasoning_effort: minimal`. Model ids + the $2 threshold are
env-overridable (`GEMINI_MODEL`, `CHECK_MODEL`/`TRANSFORM_MODEL`/`EVAL_MODEL`, `OPENAI_MODEL`,
`CLAUDE_BUDGET_USD`); flip `GEMINI_MODEL` to change the primary. The German-grammar prompts are
hardened (copula sein+Adjektiv is Aktiv, never Passiv; `bereits_zielform` needs voice AND tense;
Konjunktiv-II synthetic-vs-würde + Vorgang-vs-Zustand rules; strict JSON-only), and
`normalizeDetected` maps each detected form to its own pill (Zustandspassiv has its own pill now;
konjunktiv1/imperativ map to null). `transform-sentence` `PROMPT_VERSION` is at **4** — bump it on
any prompt change (the global cache is keyed on it). The two Art. 50 disclaimers + `/privacy`
(DE+EN) name all three providers routing-neutrally.
