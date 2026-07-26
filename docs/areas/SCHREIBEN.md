# Schreiben (`/writing`) — current state

A visual EXTENSION of the Bibliothek design language (see the `/design` skill). Founder-approved
previews: `preview/schreiben-bibliothek-extension*.html`, `preview/schreiben-design-review.html`,
`preview/fokus-correction-*.html`. **Verlauf is slated for rework — do not treat its current
design as reference.**

## Page frame
- 4-segment sliding-pill switcher **Fokus · Kurz · Lang · Verlauf** IS the page header (no
  eyebrow/H1; Verlauf rides `?mode=verlauf`), capped `lg:max-w-xl` + centered (four short labels
  at full column width read oversized), over the standard `[minmax(0,1fr)_16rem]` content+rail
  grid.
- Schreiben is a top-level nav item (rose accent, pencil mark).
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
  - `sector` follows the untagged-=-universal rule **per theme**, so a Branche under Alle Themen
    keeps the broad pool instead of collapsing to the handful of tagged tasks.
  - **Niveau and Textsorte do NOT follow untagged-=-universal**, and this distinction is the whole
    point: an untagged task is not "every level" and certainly not "every Textsorte". They PREFER
    their tagged tasks, and their dropdowns count with `countExact` (no fallback) and grey out at
    zero. Admitting untagged tasks made "C1.1 + Widerspruch" serve a B1 address-change mail, since
    legacy tasks outnumber tagged ones roughly ten to one. A Lang-only Textsorte (Forumsbeitrag)
    therefore reads as unavailable under Kurz rather than quietly serving a Notiz.
  - No scope is ever empty, so **Branche never disables**. `tests/writingScope.test.ts` pins all of it.
- **Every dropdown carries a generic first option** (founder s167): "Alle Niveaus", "Alle Branchen",
  "Alle Themen", "Gesamtes Thema", "Alle Textsorten".
- **A scope change never re-rolls onto the same Aufgabe** (s167): the re-roll passes the current task
  as `exclude`, exactly like the dice. Most scope changes still redraw from a pool the filter did not
  narrow, so without this a filter looked broken roughly one time in twelve.
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
- The dice on the Aufgabe card (standard 40px icon button, half-spin per roll) re-rolls within
  the current scope (keeps typed text, clears a stale result). Scope changes (`?sub=`/`?sector=`;
  theme switch clears sub, Branche travels) reset the draft.
- Aufgabe card: NO theme icon; a **brand-colored bold** "Aufgabe: <Thema>" eyebrow + one Ziel
  line (the editor word count does NOT repeat the Ziel range). The AI disclaimer is NOT inside the
  card: on desktop it is a fixed line at the bottom of the viewport level with the floating Feedback
  pill; on mobile it rides the floating cluster's caption slot (s160, same as Fokus, see below).
- **`WritingRail` = "Aufgabe wählen": a light HIMMELBLAU tile** (`bg-accent/20`, dark
  `bg-accent/10`; NOT grey) in a neutral `border-border` outline (founder s168: the accent is a
  fill, never an edge) with a header reset icon and the
  scope hierarchy Niveau → Branche → Thema → Unterthema → Textsorte as single-select dropdowns
  (Textsorte grouped by family: E-Mail & Nachricht / Meinung & Öffentlichkeit / Bericht /
  Beschwerde & Antrag) (grouped listbox
  popovers, internal scroll, live counts, zero-yield greyed; Unterthema only when the theme has
  sub-themes; Thema groups = Domain categorization with gesundheit folded into Alltag). No
  overflow clipping on the tile (popovers must escape); the mobile panel animates via fade/slide,
  not height collapse, for the same reason.
- Mobile Kurz/Lang = the Bibliothek pattern: a toolbar button toggles the collapsible panel
  (`layout="panel"`, no floating chip rows) plus the floating Auswerten cluster (below). Fokus has
  NO toolbar toggle since the s168 rework; its mobile grammar controls live in the always-visible
  `GrammarDials` tile (see §Fokus).
- **The panel toggle wears the rail's own Himmelblau** (s166): "Aufgabe wählen" (Kurz/Lang) is
  `variant="accent"` when closed, `default` (solid primary) when open.
  `outline`'s `bg-surface/50` made them vanish into the page ground. Since s168 the `accent`
  variant is outlined with the neutral `border` token, matching the rails it opens (the earlier
  `accent-ink/70` edge existed only to clear the 3:1 UI floor that no alpha of the 77%-light accent
  can reach on a near-white ground; a neutral edge sidesteps it). Label contrast is unchanged,
  4.72:1 light / 7.71:1 dark. Reuse the variant for any panel toggle, never re-tint `outline`.
- Umlaut keys (`UmlautKeys`, below) sit in the word-count row of `GuidedWritingTrainer.tsx`.
- **The writing field is sized, not fixed-`rows`** (`useFillEditor.ts`, founder s168). At rest it
  fills from its own top down to whichever bottom chrome is laid out (mobile cluster / desktop
  Art. 50 line), so the page does not scroll; typing past that grows it (page scroll turns on) to
  at most 1.8x the resting height, the space the screen actually offers, or 60% of the viewport,
  whichever is largest; past that it stops and scrolls internally. `resize-none`: the height is
  measured, so hand-resizing is gone and `rows` is only the pre-measurement fallback. Floor =
  max(160px, 22% of the viewport). When a long Aufgabe (Inhaltspunkte) would push the field below
  that floor, the shortfall comes out of the AUFGABE CARD first: its prompt + Inhaltspunkte region
  is capped by exactly the deficit and scrolls internally (`slim-scrollbar`; the eyebrow + dice row
  never scrolls away), down to a 96px minimum, past which a small page scroll is the lesser evil
  (only sub-660px viewports hit it). Once a result is on screen the
  field drops to its text's own height so the feedback is not pushed a screen down. Measure it in
  JS, not a `dvh`/flex chain: the trainer sits inside AppShell → WritingHub → AnimatePresence,
  none of them height-constrained.
- **From `lg` up the RESTING height is capped and Kurz is shorter than Lang** (`desktopFieldCap`
  in `GuidedWritingTrainer.tsx`, founder s168 follow-up: filling a whole desktop window "looks
  odd"). Kurz = max(176px, 22% of the viewport), Lang = max(252px, 32%), so the field never
  reaches the bottom chrome on desktop and the two modes read as different sizes. **Mobile has no
  cap and still fills** — on phones the space is genuinely scarce, which is the whole point there.
  Growth and internal scrolling are unchanged by the cap.
- Verlauf renders inside the same content grid column (never full width); its empty state
  deep-links into Kurz. `WritingHistory` shows only the learner's text (the exact prompt behind
  an old entry is not recoverable since pools).

## Fokus (Satzlabor)
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
  - **Two tiles fill the height** between the switcher and the fixed bottom chrome (`measureMobile`
    sets `minHeight`; sentence card `grow-[1.15]`, tile `grow`, content vertically centered). No
    resting page scroll.
  - **`GrammarDials`** (mobile-only) is a Himmelblau tile headed "Grammatik" (+ reset icon) with
    ONE content-sized dial per axis, centered, axis eyebrows above: green dot = detected form,
    solid primary = chosen target, tap opens a small picker popover. Dimmed but visible before a
    correction, so the feature announces itself. The legend line doubles as the refusal/error slot.
  - **The sentence card owns every state** behind a centered view toggle: Original (coral marks) /
    Korrigiert (green marks) / **Umgeformt** (the transformed sentence, green-marked via a diff
    against the corrected one, plus the Hinweis + Nochmal + speak row). The separate transform card
    below is desktop-only. **"Neu"** (not "Neuer Satz") sits top-right of the card, the Kurz/Lang
    dice corner; icon-only beside the three-segment toggle.
  - **Corrections are two text columns with a vertical separator** (founder r4 amendment: no
    Himmelblau chip backgrounds on mobile; category eyebrow, struck original and green fix keep
    their colors). Desktop keeps the fix tiles.
  - **Feedback + Korrigieren float fixed** above the KI line until a correction exists (portalled,
    see §Mobile floating action cluster); the KI line is locked just above the nav in every state,
    and carries the "Noch N Wörter" hint instead while the sentence is too short.
- The transform box is a **white card** (never a grey wash) with a bold colored "Hinweis:" label
  (no i icon) and "KI-generierte Umformung" centered at the card bottom. Its header row carries a
  **"Nochmal" button** (RefreshCw, beside the speaker) that asks the AI for an alternative phrasing
  of the SAME target form (s163): `useFokusMachine.regenerate()` cycles variant 0→1→2→0, generating
  each new variant once then serving cached ones for free. Cost cap is enforced server-side too
  (`transform-sentence` clamps `variant` to 0..2; variant 0 keeps the original global cache key,
  variants 1..2 cache under their own keys). Needs `transform-sentence` deployed with the `variant`
  param (done s163). The send-to-AI note +
  that footer are ONE combined Art. 50 note. **Desktop (s160):** it is dropped to a fixed line at
  the very bottom of the viewport, level with the floating "Feedback" pill (full sentence, left;
  pill, right; no bordered bar), mirroring the pill's `lg:pl-64` + `max-w-6xl` offsets and clearing
  the pill on the right; pointer-events pass through except the link. **Mobile (s160):** condensed
  to "KI-geprüft, kann Fehler enthalten. Mehr" under the button row. **Kurz/Lang uses the exact same
  treatment** (`GuidedWritingTrainer.tsx`, s160): its own `aiNoteDesktop` fixed note + the Feedback
  icon button floating beside Auswerten (and Neu schreiben after a result), condensed note beneath.
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
  mobile toolbar or the desktop rail. `wordDiff.diffWords` returns `tokens` + `originalTokens`
  (both flagged) + `changes` (each with a `category`); `tests/wordDiff.test.ts` pins it. A word that
  was only **reordered** is collapsed by `collapseMoves` into ONE `{category:"Wortstellung",
  moved:true}` change (was a contradictory Streichung + Ergänzung pair, s163); a `moved` tile renders
  the word ONCE (green, no `old → new` arrow).
- The Fokus Original/Korrigiert toggle is `rounded-lg`/`rounded-md` squircle.

## Mobile floating action cluster (Fokus + Kurz/Lang)
The bottom cluster (Feedback + Korrigieren / Auswerten, and Neu schreiben after a result) carries
**no bar chrome** (founder s159/s160): no border, no full-width backdrop. It therefore floats
straight over the content cards, so nothing in it may be see-through (s164 founder report: the
disabled Auswerten button and the card's hint line read as two labels on top of each other).
- **Kurz/Lang: `fixed`, not `sticky`** (founder s168). Sticky parks the cluster at the END of the
  content whenever the page fits the viewport, so it sat at one height in Kurz, another in Lang,
  and jumped on every task change. It is now pinned above the nav at one height for good, with
  AppShell's `<main>` offsets mirrored (`mx-auto max-w-6xl px-4 sm:px-6`) so it stays in the
  content column, and `useFillEditor` gives the trainer root the matching bottom clearance.
- **Fokus followed in the same session** (the s168 mobile rework): its cluster is `fixed` too,
  raised 2.5rem above the nav so the locked KI line fits beneath it, and it disappears once a
  correction exists (the card corner "Neu" and the dial tile take over).
- **All fixed layers are portalled to `<body>`.** WritingHub slides tab panels with an `x`
  transform, and a transformed ancestor becomes the containing block for its `fixed` descendants;
  without the portal the clusters and the KI lines re-anchor to the panel mid-slide.
- **Opacity is the contract, not the bar.** `src/features/writing/floatingCluster.ts` holds the two
  class names: `floatingSlot` (opaque `bg-background` behind a control, because `variant="outline"`
  is `bg-surface/50` and `disabled:` is `opacity-50`) and `floatingNote` (the caption plate,
  `bg-background/90` + `backdrop-blur-sm`, matching the other mobile bars). `--background` equals
  the page stops, so both are invisible against the page ground and only mask over a card.
- **Transient hint lines belong in the cluster, not at the card tail.** The "Noch N Wörter
  schreiben …" line is the honest reason the primary button is inactive; a card-tail line lands
  exactly under the pinned cluster. It rides the cluster's single caption slot instead: the hint
  while the text is too short, the Art. 50 note whenever prüfen/auswerten is actually possible
  (never both, so this stays one line of chrome). The card keeps the hint on `lg:` only, where
  there is no cluster.

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
