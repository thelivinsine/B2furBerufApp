# Interface language — current state

The founder's rule (s205): *"the app's language should adapt to various levels of user language
proficiency. if the user logs A2 or B1 level, the app should show everything in English except the
learning material which should obviously be in german."*

## The rule

- **A2 / B1 → the interface is English. B2 / C1 → the interface is German.** One fold,
  `uiLangFor(pref, level)` in `src/lib/uiLang.ts`. Nothing else may decide this.
- **The learning material is German at every level, always.** A vocabulary word, its example
  sentence, a Redemittel phrase, a grammar drill, an exam text, a writing brief, anything out of
  `src/data/*` is the thing the learner came to read in German. Translating it deletes the
  exercise. The hold-to-peek EN gloss (`Gloss.tsx`) stays the ONE place a learner is handed an
  English meaning, because there it is a deliberate teaching move.
- **The learner can override it**: `useSettingsStore.uiLang` is `"auto" | "de" | "en"`, default
  `"auto"` (= derive from level), set in Einstellungen → Profil → Sprache. It rides `cloudSync`
  inside the settings jsonb blob like every other flag, so the choice follows the account.
- `<html lang>` follows the interface language (set in `AppShell`, not in `index.html`, which can
  only ship one static value).

## The mechanism

The app was written German-first, so **the German string is the key**:

```tsx
const t = useT();
<span>{t("Wörter")}</span>          // "Wörter" in German, "Words" in English
```

`src/lib/uiStrings.ts` holds `UI_EN`, one flat `Record<German, English>`. Two properties matter:

1. **A missing key falls back to the German string**, which is exactly what that call site rendered
   before it was converted. So coverage grows one surface at a time and a half-converted app is
   never blank, never showing a raw key, never broken.
2. **Every English string is in ONE file**, readable end to end as a document (the founder reads
   English, and this is the artefact they can review).

Two more helpers, same rule:

- `useTx()` → `tx(de, en)` for a string that is BUILT at runtime (interpolation, plurals) and
  therefore cannot be a dictionary key.
- `translate(de, lang, ctx?)` for the rare non-hook caller. Onboarding uses it because its language
  follows the level chip the learner is *looking at*, not the stored one: tapping A2 flips that card
  to English on the spot, before anything is saved.

A German word needing two different English words takes a context: `t("Start", "session")` looks up
`"Start#session"` first, then plain `"Start"`.

## What is converted (s205)

Everything a learner meets as CHROME: the shell (header, greeting, streak, zone exit, resume
screen), both nav surfaces, the account menu/panel and the sign-in nudge, the feedback affordances,
onboarding, Settings, all four Bibliothek tabs including their rails, graphs, tables and empty
states, the Prüfung zone (hub, the four choosers, the exam runner and both Verläufe), Schreiben
(guided + Fokus), Sprechen, the composed session player, Fortschritt, Sammlung, the Neuland chrome,
the auth dialogs, global search and the error surfaces. A scripted audit checks that every key a
component hands the translator has an English entry.

The leverage is in the SINKS: `FilterRail`, `ScopeRail`, `FacetSheet`, `DataTable`,
`EmptyState`/`SectionHeading`, `ViewSwitcher`, `SearchField`, `BrowseToolbar` and `UebenLabel` all
take German strings as props from dozens of call sites and translate once, centrally.

## What stays German ON PURPOSE

Not gaps, decisions:

- **The Modelltest's Anleitung** (`exam/partMeta.ts`), because it reproduces the instruction text of
  the real telc paper. A candidate should meet it exactly as the exam prints it.
- **The grammar dial VALUES in Fokus** (Aktiv, Passiv, Präsens, Perfekt, Konjunktiv II …): those are
  the forms being practised. Their section headers (Voice, Tense, Mood) do translate.
- **The Neuland world**: place names, chapter and mission titles, scene text. The game is a German
  immersion layer, and its own chrome (buttons, HUD) is translated.
- **The grammar abbreviations on a word card** (Pl., Perf.) and everything out of `src/data/*`.
- The landing, legal and help pages, which are their own bilingual surfaces, and the admin center,
  which keeps its founder-facing DE/EN toggle (`adminI18n.tsx`).

## Adding a surface

1. `const t = useT()` in the component, wrap each chrome string: `{t("Weiter")}`.
2. Add the German → English pair to `UI_EN`, in the section for that surface.
3. Never wrap content that comes out of `src/data/*`, and never add a content string to `UI_EN`.
4. `tests/uiLang.test.ts` gates the rule, the fallback and the dictionary's shape (no empty values,
   no em dashes). Run `pnpm test:unit`.
