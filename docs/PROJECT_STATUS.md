# Project Status

_Last updated: 2026-08-09 (session 208 fixed the CEFR level-band filter chip reappearing after a
dismiss + refresh on the Bibliothek trainers. Session 207 reordered the nav, ended onboarding in the
Bibliothek and made the INTERFACE LANGUAGE follow the learner's level: A2/B1 English, B2/C1 German,
learning material German at every level. Sessions 204-206 (the KI-usage task, its reconciliation, and
the Sprechen "AI doesn't work" fix) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`. All handoffs under their own
"Resume here")._

**Session 208 (2026-08-09, branch `claude/filter-persistence-error-yr2716`): the CEFR level-band
chip kept coming back.** Shipped as PR **#847** → **`de70c9b`**, squash-merged.
Founder report, with a screenshot of the Wörter tab: "there seems to be an error with the filter
here. Even if I remove and refresh it's still appearing. Fix it."
- **Root cause:** the "Level: up to …" `ActiveFilterChip` (the removable UI for the default
  CEFR-band cut on Wörter/Kollokationen/Redemittel, `defaultVisibleBands`) tracked its dismissal in
  a plain `useState(false)` per trainer. A full page refresh always remounts the component, so the
  flag reset to `false` and the chip reappeared even immediately after being dismissed.
- **Fix:** moved the flag into `useSettingsStore` as a new persisted field, `showAllCefrLevels`
  (default `false`), the same pattern already used for `artikelLegendDismissed` and
  `signInBannerDismissed`. All three trainers (`VocabularyTrainer.tsx`, `CollocationsBrowser.tsx`,
  `RedemittelTrainer.tsx`) now read/write that one store field instead of local state, so dismissing
  the chip on any of the three tabs sticks across refreshes and rides cloudSync like the other
  settings-store flags.
- Gates: typecheck · lint 0 errors (78 warnings, pre-existing baseline, unrelated to this change) ·
  build. No new test added (no test framework covers this UI interaction path today); verification
  was a targeted code read of the three call sites plus the settings-store persistence contract.
- **Not verified in a browser from the sandbox**: same network-policy limits as prior sessions.
  Worth a founder check on the live site: open Wörter, dismiss the "Level: up to …" chip, hard-refresh
  the page, confirm the chip stays gone.

**Session 207 (2026-08-09, branch `claude/remove-onboarding-practice-z7qfwu`): the nav order, the
onboarding hand-off, and the interface language.**
**Shipped in three PRs, all squash-merged to `main` and all deployed green:** **#843** the change
itself (`c334b65`, CI green on the merged tree `18a909f`), **#844** the paper trail (`fa3e97d`),
**#845** the tagline correction (`c0e7b0f`). Each merge's Pages deploy succeeded on attempt 1, so
everything below is live; a PWA hard-refresh may be needed to see it on a device that has the app
installed.

Founder, four prompts: *"remove the onboarding practice session when a new user signs up … finish
the onboarding form and immediately shown the bibliothek. Keep bibliothek on the top, and the
praktisch beside the settings. Praktisch should be labeled as beta."* → *"the app's language should
adapt to various levels of user language proficiency … if the user logs A2 or B1 level, the app
should show everything in English except the learning material which should obviously be in
german."* → *"the buttons like üben or stufe b1.1 and the hint on what the gender means are all
still in german. they're also considered as app language … check for other such overlooked items
all across the app."* → *"if the user selects b2, then the app can have the current german
wordings."*

- **Onboarding ends in the Bibliothek.** `completeOnboarding` used to hand straight over to a ~90s
  composed taster (`/session?min=1`), which decided a new learner's first minute for them. It now
  goes to `/library`. Nothing else about setup changed (one card, consent recorded before any
  progress is stored).
- **The nav runs ONE new order, on both surfaces:** Bibliothek · Prüfung · Fortschritt · Praktisch
  (**Beta**) · Einstellungen. Bibliothek opens the rail (it is what setup hands over to now),
  Praktisch sits directly left of Einstellungen because that zone is still being built, and it
  carries a Beta mark: a neutral bordered chip in the sidebar, a lighter bold suffix inside the bar's
  label slot (a chip there would grow the fixed 12px line and shift the icon rail). `/` is unchanged
  as a route: still the Dashboard, still the app root. The bar pins its own ends and only READS a
  saved order for the reorderable middle, so every pre-s205 pin list still renders five slots with no
  migration. `NEVER_HIDEABLE` makes the three fixed slots un-hideable on BOTH surfaces, so remote
  config cannot empty a slot on one and leave it drawn on the other.
- **The interface language follows the LEVEL** (`src/lib/uiLang.ts`, the one fold): A2/B1 read the
  interface in English, B2/C1 keep today's German, and **the learning material is German at every
  level** (a word, its example, a Redemittel, a grammar drill, an exam text, a writing brief, the
  game's German world). `useSettingsStore.uiLang` ("auto" | "de" | "en", default auto) overrides it
  from Einstellungen → Profil → Sprache and rides cloudSync in the settings blob. `<html lang>`
  follows. Onboarding reacts to the level chip the learner is LOOKING at, so tapping A2 flips that
  card to English before anything is saved.
- **How it is built, and why that shape:** the app is German-first, so **the German string is the
  key**. `t("Wörter")` looks up `src/lib/uiStrings.ts`, and a missing key renders the German, which
  is exactly what that call site rendered before. That is what let coverage grow surface by surface
  with no half-broken state, and it puts every English string in ONE file the founder can read as a
  document. Shared components translate at the SINK (FilterRail, ScopeRail, FacetSheet, DataTable,
  EmptyState/SectionHeading, ViewSwitcher, SearchField, UebenLabel), so one edit covered dozens of
  call sites. Taxonomy that already carries both languages in the bank (Themen, sub-themes, domains,
  life areas) goes through `useTitle()` instead of the dictionary, so 66 theme names are not
  duplicated. **~700 chrome strings across ~60 components** are converted: the shell, onboarding,
  Settings, all four Bibliothek tabs and their rails/graphs/tables, the Prüfung zone and its exam
  runner, Schreiben, Sprechen, the session player, Fortschritt, Sammlung and the game chrome.
- **Deliberately still German** (stated, not overlooked): the Modelltest's Anleitung, which
  reproduces the real telc instruction text; the grammar dial VALUES in Fokus (Aktiv/Passiv/Präsens/
  Perfekt are the forms being practised); the Neuland world's place and mission names; and the
  German grammar abbreviations on a word card (Pl./Perf.).
- **`main` moved under this branch** (#840, #841, #842, sessions 205 and 206 in parallel), so it was
  merged in and every gate re-run on the merged tree. The conflicts were all in the docs: CLAUDE.md
  took main's compressions plus this session's two new laws, and the append-only logs kept both sides.
- Gates on the MERGED tree: typecheck · lint 0 errors (77 warnings, unchanged baseline) · **701
  tests** (687 on `main`; `tests/uiLang.test.ts` pins the level rule, the German fallback and the
  dictionary's shape, and two nav cases join) · build · check:bundle 153.2 kB · check:contrast ·
  lint:content (CLAUDE.md back under its budget) · lint:migrations. Verified in a real browser at
  390px and 1280px, at A2 and at B2.

- **The tagline drift, found by the founder in a screenshot.** The sidebar caption still read
  "Deutsch im Beruf · B2", the line from before the s21 repositioning. It is
  "Deutsch fürs echte Leben · B1–B2" / "German for real life · B1–B2" now, the same tagline the
  landing hero, `index.html`, the OG tags and the PWA manifest already used. The same stale scope
  was still in the AGB and the Datenschutzerklärung (both languages opened by calling Genauly an
  exam-prep app for the B2-Beruf SPEAKING exam) and in the `types/index.ts` header; all corrected to
  what the app is. **`CONSENT_VERSION` was deliberately not bumped**: the edit changes no data
  practice, and a bump would ask every signed-in learner to re-consent for a wording fix.

Session 207's language-work summary: complete for chrome the learner meets, documented in
`docs/areas/UI-LANGUAGE.md`. Four items stay German by decision (Modelltest Anleitung, grammar dial
values, Neuland place/mission names, Pl./Perf. abbreviations); any NEW surface must call `useT()`.

Sessions 204-206 (the KI-usage measurement + reconciliation, and the Sprechen "AI doesn't work" fix)
are archived in full in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · **Prüfung** · Fortschritt, s182: Schreiben moved into the Prüfung hub),
the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks — every number below is `pnpm lint:content` output measured on 2026-08-08 (s203).
Re-measure before quoting; do not carry these forward.** vocab **1,768** (**1,758 browsable**; 8
mis-filed noun+verb combos retired in s142 + 2 true duplicates retired in s178, ids kept; the mix is
**77.3 % noun / 13.7 % verb / 6.1 % adjective**) · collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **32 topics / 320 drills** (18 groups; 110 productive, i.e. no options) ·
Lese-/Hörtexte **52** (156 checks) ·
writing tasks **717**, every one servable (s181), in 40 theme×length pools ·
Can-Do **57** · Sprech-Szenarien **36** (214 nodes, 394 options; level mix 13 / 15 / 8; every
scenario ends in a free-speak turn since s182) · exam sets **21** (the 6 above the entry rung came in
s194) · missions **6** (35 scenes, 11 NPCs, 7 key items) ·
provenance **3,604 rows** (four concatenated parts since s182, TS2590; append to the LAST) ·
themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121); four of them carry themes,
`pruefung` carries none and never has. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,591 of 3,604 provenance rows are AI-drafted `draft`**; only **13** are
human-verified (13 vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset to restart the
review pass; see `strategy/DATA_GOVERNANCE.md`). The full picture of what the banks do and do not
cover is `docs/reports/CONTENT_AUDIT_2026-07-30.md` (session 178), whose backlog is **closed
except P10** since s198. The writing bank has its own quality audit since s199,
`docs/reports/writing-tasks-audit-2026-08-07.md`: the tasks read well, but a third of the Branche
tags were unearned and the Niveau tag scaled the word target without scaling the task. **P1, P2, P3
and P5 are shipped (s199, s200); P4 is marked WRONG in the report** and replaced by an optional
reply-task wave.

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`, and the ones that were ticked off
in this list live in `docs/archive/PROJECT_STATUS_ARCHIVE.md` with their dates. The s147 Satzlabor
redeploy is done (s150: all three AI functions deployed on the Gemini-primary cascade,
`GEMINI_API_KEY` set). Still open:
- [ ] **Add Resend SMTP** (Auth → SMTP settings). Was optional; now needed, because "Confirm email"
      is ON and Supabase's built-in sender only allows a few messages an hour. Founder bought the
      `genauly.de` mailbox 2026-07-27; next is verifying the domain in Resend, then the SMTP fields,
      then pasting the two branded templates. Full steps: `docs/reference/auth-emails/README.md`.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 208 (2026-08-09): the CEFR level-band chip now stays dismissed.**
Branch `claude/filter-persistence-error-yr2716`, PR **#847** → **`de70c9b`**, squash-merged.
Post-merge housekeeping done, tree clean.
Founder report, with a screenshot: "there seems to be an error with the filter here. Even if I
remove and refresh it's still appearing. Fix it."

- **The fix is small and the pattern is worth remembering.** `showAllLevels` was local `useState`
  in three trainers, so every dismiss of the "Level: up to …" chip was wiped by the next page load.
  It now lives in `useSettingsStore.showAllCefrLevels`, persisted like `artikelLegendDismissed` and
  `signInBannerDismissed`. **Any future "dismiss this and remember it" UI should go straight into
  the settings store**, never local `useState`, or it will resurface the same bug.
- **Not verified in a browser from the sandbox** (same network-policy limits as prior sessions).
  Worth a founder check on the live site: open Wörter, dismiss the "Level: up to …" chip, hard-
  refresh, confirm it stays gone; repeat on Kollokationen and Redemittel.
- **Still open, unchanged from prior sessions:** the Sprechen/Schreiben Verlauf spinner has no
  timeout on an unreachable Supabase (client-side fetch, no deadline); the next content job is the
  reply-task wave (writing-audit P4), 47 authored `source` texts plus a rendering slot that does not
  exist yet, waiting on a founder placement pick from `preview/schreiben-source-text.html`.
