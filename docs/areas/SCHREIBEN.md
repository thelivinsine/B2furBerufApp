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
  `src/data/writingPrompts.ts` holds per-theme task pools (see `docs/areas/CONTENT.md`); a
  selected Branche prefers its tagged tasks, else falls back to untagged, never empty.
- The dice on the Aufgabe card (standard 40px icon button, half-spin per roll) re-rolls within
  the current scope (keeps typed text, clears a stale result). Scope changes (`?sub=`/`?sector=`;
  theme switch clears sub, Branche travels) reset the draft.
- Aufgabe card: NO theme icon; a **brand-colored bold** "Aufgabe: <Thema>" eyebrow + one Ziel
  line (the editor word count does NOT repeat the Ziel range). The AI disclaimer is a standalone
  line below the editor/sentence card, never inside it.
- **`WritingRail` = "Aufgabe wählen": a light HIMMELBLAU tile** (`bg-accent/20` +
  `border-accent/50`, dark `bg-accent/10` + `/25`; NOT grey) with a header reset icon and the
  scope hierarchy Branche → Thema → Unterthema as single-select dropdowns (grouped listbox
  popovers, internal scroll, live counts, zero-yield greyed; Unterthema only when the theme has
  sub-themes; Thema groups = Domain categorization with gesundheit folded into Alltag). No
  overflow clipping on the tile (popovers must escape); the mobile panel animates via fade/slide,
  not height collapse, for the same reason.
- Mobile = the Bibliothek pattern: a toolbar button toggles the collapsible panel
  (`layout="panel"`, no floating chip rows); Kurz/Lang get a sticky bottom Auswerten action bar.
- Umlaut keys (`UmlautKeys`, below) sit in the word-count row of `GuidedWritingTrainer.tsx`.
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
  after "Grüner Punkt = dein Satz.". Mobile (pre-correction) floats the **Feedback icon button next
  to Korrigieren** (both squircle, no bordered bar chrome) with the condensed KI-Hinweis centered
  directly beneath them (s160); the mobile Grammatik button always opens (never `disabled`).
- The transform box is a **white card** (never a grey wash) with a bold colored "Hinweis:" label
  (no i icon) and "KI-generierte Umformung" centered at the card bottom. The send-to-AI note +
  that footer are ONE combined Art. 50 note. **Desktop (s160):** it is dropped to a fixed line at
  the very bottom of the viewport, level with the floating "Mit KI gebaut · Feedback" pill (full
  sentence, left; pill, right; no bordered bar), mirroring the pill's `lg:pl-64` + `max-w-6xl`
  offsets and clearing the pill on the right; pointer-events pass through except the link.
  **Mobile (s160):** condensed to "KI-geprüft, kann Fehler enthalten. Mehr" under the button row.
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
  (both flagged) + `changes` (each with a `category`); `tests/wordDiff.test.ts` pins it.
- The Fokus Original/Korrigiert toggle is `rounded-lg`/`rounded-md` squircle.

## Umlaut keys
`src/features/writing/UmlautKeys.tsx`: reusable insert bar (ä ö ü ß Ä Ö Ü) for non-German
keyboards. Inserts at the caret (over a selection too), neutral `bg-surface` at rest, flashes
Himmelblau on press, keys ~24px. Wired into the Fokus input footer (shares the desktop row with
Korrigieren) and the Kurz/Lang editor. Takes `{ textareaRef, value, onChange }`.

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
