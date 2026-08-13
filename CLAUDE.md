# Genauly — German for the intermediate (B1–B2) plateau

Genauly helps adult learners break through the intermediate German plateau (B1–B2) and build
practical fluency for the situations that matter in real life: the **workplace**, plus **everyday
tasks** like bureaucracy (Behörde), banking, healthcare (Arzt), and housing. It also supports direct
preparation for the **telc Deutsch B2 Beruf** and **Goethe-Zertifikat B2** exams. React + TypeScript
+ Vite SPA, deployed to GitHub Pages at `genauly.de`.

**Scope note (do not narrow this again):** the product was repositioned (session 21) from "B2
Beruf speaking-exam prep" to the broader B1–B2 plateau framing above. Exam prep is **one pillar**,
not the whole product; daily-life domains beyond the workplace are core, not optional.

**How this file works (maintenance rule):** CLAUDE.md states **current law only**, in short bullets,
and stays under ~350 lines (the linter warns past that). A law states the RULE and points at its
detail: the mechanism, the measurements and the story of what went wrong belong in `docs/areas/` and
the two skills (`/design`, `/content`), the "why" in `docs/DECISIONS.md`, the blow-by-blow in
`docs/SESSION_PROMPT_LOG.md`. When a rule changes, REPLACE it here and update the matching
`docs/areas/*` file in the same PR. Keep those current-state-only too.

## Stack
- **Vite 6** + **React 18** + **TypeScript 5.7** (strict, project references via `tsc -b`)
- **Tailwind 3** (`tailwind.config.ts`), **Radix UI**, **framer-motion**, **lucide-react**,
  **recharts**; **zustand** state; **react-router-dom 6**. No test framework beyond Vitest +
  targeted `scripts/*.mjs` gates.

## Commands (index — full detail in `docs/areas/COMMANDS.md`)
**Package manager is `pnpm`** (pinned; lockfile `pnpm-lock.yaml`). Never npm/yarn. `pnpm install` after pulling.
- `pnpm dev` · `pnpm build` (tsc + vite + help prerender; run before pushing) · `pnpm typecheck` ·
  `pnpm preview` · `pnpm audit`
- CI gates: `pnpm lint:content` (after ANY content edit) · `pnpm lint:migrations` (after ANY new
  `supabase/migrations/*.sql`) · `pnpm lint` · `pnpm test:unit` · `pnpm test:srs` /
  `pnpm test:pronounce` (after `engine/srs.ts` / `engine/pronounce.ts`) · `pnpm check:bundle`
  (400 kB main-chunk budget, after build) · `pnpm check:contrast` (WCAG gate, after `src/index.css`
  token edits) · `pnpm verify:facts` (noun fact gate; `pnpm build:oracles` first after adding nouns).
  Warn-only: `pnpm verify:grammar` · `pnpm verify:cefr` (`pnpm verify:sentences` = both).
- Generated data (`frequency.ts`, `verification.ts`, `verbForms.ts`): regenerate with its
  `pnpm build:*` script, never hand-edit.
- Review loop: `pnpm review:queue` · `pnpm stamp:verified` (same commit as a verified flip) ·
  `pnpm apply:reviews` (integrity rules in COMMANDS.md, do not weaken) · `pnpm build:review-queue`
- `.npmrc` supply-chain cooldown + blocked dependency build scripts: keep it that way.

## Layout (`src/`)
- `data/` — content banks + `provenance.ts` + generated `frequency.ts`/`verification.ts`/
  `verbForms.ts` (see `docs/areas/CONTENT.md`)
- `engine/` — `srs.ts` (FSRS-6), `session.ts` (composer), `exam.ts` (mock-exam composer + scoring),
  `mission.ts` (game runner), `collection.ts` (FSRS→Lv 1-5 mapping, stable game contract, don't
  drift the bands), `conversation.ts` + `speaking.ts` (spoken-conversation state machine + brief
  derivation), `blank.ts` (the ONE gap rule), `pronounce.ts scoring.ts speech.ts quiz.ts`
- `store/` — `useProgressStore useSessionStore useSettingsStore useAuthStore useLibraryScope`,
  `useExamStore` (the one running mock exam, persisted)
- `lib/` — `facets.ts` (facet registry, ≤12-option rule + coverage floor), `cefr.ts`, `lifeAreas.ts`
  (the ONE Berufsleben/Alltag fold + `?area=`) with `themeGroups.ts` (the grouped Thema options),
  `anrede.ts` (the ONE du/Sie rule), `uiLang.ts` + `uiStrings.ts` (the ONE interface-language fold),
  `appConfig.ts` (remote config; empty config == default behavior), plus `liveWork.ts admin.ts
  search.ts fuzzy.ts graphPalette.ts phase.ts idRenames.ts`, hooks/icons/utils
- `features/` — `pruefung/` (the one Prüfung hub + shared chooser), `exam/` (MockExamRunner + the
  four part views), `sprechen/` (AI conversation partner), `welt/` (game), `collection/` (Sammlung),
  plus `session/ library/ vocabulary/ collocations/ redemittel/ grammar/ writing/ dashboard/ help/
  legal/ admin/` and `shared/` (FilterRail, ScopeRail, LifeAreaPills, ViewSwitcher, DataTable, …)
- `components/` — `layout/` (AppShell, BottomTabBar, Sidebar, route-icons, FeedbackButton),
  `artikel/` + `city/` (see `docs/areas/COMPONENTS.md`), `ui/` primitives, `shared/Logo.tsx`
- `types/index.ts` shared types · `types/game.ts` mission schema · `router.tsx` · `App.tsx`
- Routes (all of them, with the why, in `router.tsx`): `/` Praktisch · `/library` · `/analytics` ·
  `/settings` · `/session` · `/welt` · `/anwenden` **Prüfung**, the zone holding the four modules +
  Modelltest (`/lesen` `/hoeren` `/writing` `/simulation` are its Ohne-Zeit choosers, cards not
  tabs; `/exam` is the Modelltest a running Teil takes over) · `/sources` · `/admin/*` · `/hilfe`
  `/privacy` `/terms` `/about` `/welcome` · `/auth/confirm` (ungated on purpose)

## Hard invariants (cross-cutting; never break without an explicit founder request)
- **Shipped content ids are PERMANENT** — progress is id-keyed locally + in the cloud. Retire,
  never rename/delete; unavoidable renames go through `ID_RENAMES` forever.
- **Closed-enum rule:** every union added to `src/types/index.ts` is mirrored by an array +
  validate-when-present check in `scripts/lint-content.mjs`.
- **Every content_id has a provenance row**, added in the same edit.
- **Content facts are stated, never left blank** (s185, all gates): every noun carries `plural` XOR
  `numerus`; `pron` follows the ONE respelling scheme; every grammar topic has 10 drills with ≥3
  productive. **Pedagogical shape is gated too** (s198; `scripts/content-shape.mjs` +
  `tests/contentShape.test.ts`): a `core`-frequency word is never labelled B2.2/C1, every theme
  carries ≥3 verbs AND ≥3 adjectives, and every other threshold is a RATCHET on the measured bank.
  Raising a ceiling is a deliberate edit with a reason, never the way to land a word. →`CONTENT.md`.
- **A gap in an example sentence comes from ONE rule** (`src/engine/blank.ts`, s198) for every cloze
  and the coverage report, reporting WHICH form it blanked so distractors match. Never re-copy it
  into a call site (four copies is how an ASCII `\b` disabled every umlaut-initial word).
- **A human-verified row is never edited by an AI to satisfy a new rule.** The content fingerprint
  ties the `verified` stamp to exact content, so a new check WARNS on verified rows and queues them
  for the next human pass; it never re-stamps them and never flips them back to draft.
- **A filter filters; it never substitutes.** In every Aufgabe rail (all four modules since s196)
  Niveau, Thema, Unterthema and Textsorte are HARD; Branche stays soft (untagged-=-universal), applied
  last so it cannot hide a hard match; ONE function counts what the module draws; zero-yield options
  grey out with their honest count; an empty scope names the one filter to drop. (§s180/s196.)
- **Only a task carrying the full brief is served** (Adressat, du/Sie, 2-5 Leitpunkte, Niveau,
  Textsorte, word target), because the AI grades Aufgabenerfüllung against it: **717 writing tasks,
  every one servable**, ≥2 per Unterthema per length, all 16 Textsorten live. A `du` brief never
  names a title + surname (s200): the Adressat drives the Anrede. `tests/writingScope.test.ts` and
  `tests/moduleScope.test.ts` gate it.
- **A TAG IS EARNED, and a brief ASKS for what it is graded on.** ONE lexicon per rule in
  `scripts/`, shared by `lint:content` AND `tests/writingScope.test.ts`, so gate and test cannot drift.
  - **Branche** (`sector-markers.mjs`, founder s199): the brief must name that workplace (Beruf keeps
    ≥8 of 15 earned, Alltag few and honestly). Dropping a false tag costs no reach, Branche being
    soft: add the missing word to the lexicon, or drop the tag.
  - **Argumentation** (`justification-markers.mjs`, s200): a `stellungnahme`, `forumsbeitrag`,
    `widerspruch` or `beschwerde` at B2+ carries ≥1 Leitpunkt demanding a **reason, a consequence or
    a stance**, because `level` tells `evaluate-writing` to mark strictly. Fix by REPLACING the
    weakest descriptive point, never a fifth. B1 exempt.
  - **A supplied `source` text belongs to the REPLY genre, never to an opinion task** (s200), and
    `source` is currently read by nothing.
  (Detail → `docs/areas/CONTENT.md`; why → `DECISIONS.md` §s199/§s200.)
- **Keep eager code light:** the Dashboard imports NO content bank (they are lazy chunks); never
  re-introduce a static import chain from eager code to a bank.
- **Reward color (Koralle, `--reward`)** is loot/combo/streak moments plus Fokus error underlines
  only; never general chrome or building marks.
- **Locked structures** (change only on explicit founder request): the mobile bottom tab bar
  (`PRAKTISCH-NAV.md`), the dialog/overlay recipe (`BRAND.md` §Dialog), the in-mission pixel chrome +
  "failure is content, never lockout" + the ungated boss mission 1.6 (`GAME.md`), the
  Himmelblau-fill/white-controls FilterRail and Aufgabe-rail answer (s189/s196, `ScopeRail.tsx`), the
  sliding-pill switcher (`useSlidingPill`, no per-segment `layoutId`), the Prüfung module card
  (s191/s196, `PRUEFUNG.md`), the Schreiben mobile anatomy, the zone's one frame (s195).
- **The nav runs ONE order and setup ends in the Bibliothek** (founder s207, `PRAKTISCH-NAV.md`):
  Bibliothek · Prüfung · Fortschritt · **Spielplatz** (**Beta**) · Einstellungen, bar and sidebar
  alike, from the single `navItems`; Bibliothek, Spielplatz and Einstellungen are the fixed slots
  (`NEVER_HIDEABLE`), only Prüfung + Fortschritt reorder. Onboarding hands over to `/library`.
  Named Praktisch through s209; renamed **Spielplatz** (founder s210, "Simulation" and "Alltag"
  both already taken elsewhere); the area guide keeps its old filename, `PRAKTISCH-NAV.md`.
- **A signed-in learner is restored from the cloud, never re-onboarded.** Signing in wipes the
  device-global cache first (account isolation), so `onboarded` and the profile can ONLY come back
  from `profiles.settings`, and `mergeRemoteSettings` adopts on `settings.onboarded === true` and
  nothing else. Not onboarded: `/welcome` signed out, `/start` signed in (`DECISIONS.md` §s174).
- **Sprechen is Schreiben with a microphone** (s193): a chooser with the one Aufgabe rail, a brief,
  a conversation, `features/writing/correction.tsx` as the debrief (never a new copy), a Verlauf.
  **Deliberately NOT an open chatbot:** the brief makes it an exercise; no correction mid-flow.
  **Layout is a property of the TASK** (`gespraech` / `buehne` / `anruf`), and the task TRAVELS:
  `brief.situation` is stated on the brief and in the running Aufgabe panel (founder s209). **A
  speech transcript is ASSIGNED, never appended** (s209): `listen()` reports the whole transcript
  every event. **The row is written when a conversation STARTS** (s194), so the daily limit counts
  what costs money, **the practice counts once the learner has SPOKEN, not once the AI has graded**
  (s196), the debrief retryable and free. **A practice conversation carries its Redemittel
  structurally** (founder s202): the runner takes them as a PROP, the Modelltest passes nothing, so
  a candidate never reads what they are graded on; at most FIVE, easiest by CEFR (s206).
- **A wall is stated BEFORE the commitment, and a wall with a remedy IS its remedy** (s194, widened
  s206): allowance, account and connection are gates on the start, never a caption after the
  commitment; ONE rule serves guard and gate; a failure never renders in the grey a status uses.
  **Every provider call carries a deadline and every cascade a TOTAL budget; the debrief LEADS on
  the strong model** (s211): a leg that cannot finish in what remains is never started, a losing leg
  logs it, the failure carries its reason, and **what the learner SAID is stored as it is said**, so
  a failed grade never empties the Verlauf. → `SPRECHEN.md`.
- **The Prüfung zone has ONE frame** (founder s195; mechanism in `docs/areas/PRUEFUNG.md`). ONE exit,
  the LAST control in the header, top right, on every screen of the zone and at every width
  (`useSessionStore.zoneExit`): grey **Zurück**, or red **Verlassen** while a clock runs. **Wherever
  that exit shows it is the ONLY control on that side** (founder s201): `quietHeader` drops the
  streak pill and the account menu. **A confirm is about losing work, never about the clock**
  (`hasProgress(run)`; the Schreibtrainer never asks, its draft autosaving). **The word Zurück
  belongs to that exit alone**, so the question stepper is a chevron. A phone carries the module row
  on every screen (`ModuleHeader`, `lg:hidden`; in a Teil that row IS the `RunBar`), and **that row
  NAMES the module and carries no control** (founder s201: the Aufgabe toggle lives on the chooser's
  own toolbar row). ONE Niveau control per screen. Widths: the HUB is `HUB_COL` (`max-w-[40rem]`), a
  chooser wears Schreiben's content-plus-16rem-rail grid, only a RUNNING Teil gets `lg:max-w-6xl`.
- **An exercise the app scores can always be handed in, and every score it produces is reachable**
  (s194 audit). A clock is never the ONLY way a part ends ("Teil abschließen" sits on the last
  question unconditionally, blanks cost a confirm) and a clock is measured against a DEADLINE, never
  by decrementing, or a background tab pauses the exam. Every correction the evaluator returns is
  rendered, and a result surfaces in exactly ONE Verlauf: **a Modelltest sat all four parts, a run
  that sat one is module practice** (`isFullMockRun`, bank-free; `examsDone` is retired). **Every
  module page carries that Verlauf** (s201) from visit one; the hub keeps the CROSS-module view.
- **A failed cloud write is never silent** (s185). supabase-js returns `{ error }` instead of
  throwing, so an ignored result makes a broken sync look exactly like a working one: every push
  reads its error, retries with backoff, and after 3 failures flips `useAuthStore.syncHealth` to
  `"failing"` ("Sync pausiert" in Settings). Never `await` a Supabase call and drop its result.
- **The cloud row is bounded, not append-forever** (DB audit R1/R4, s185; timers in
  `docs/PROJECT_FOUNDATION.md`): `RETAIN_DAYS` (400) folded into `activeDaysFolded`, `pg_cron`
  purging guests, cache rows and learner TEXT by NULLing columns, never deleting rows, so limits,
  aggregates and the Verlauf entry survive. **A retention timer and the privacy-policy copy
  describing it ship in the SAME change**, never resolved by editing the copy alone.
- **AI usage is MEASURED; only the cost is derived** (s204): every call writes an `ai_calls` row with
  the provider's own token counts, priced from ONE table (`functions/_shared/aiUsage.ts`, overridable
  via `app_config.ai_rates`) and checked against the real bill (s205). Never re-hardcode a price.
- **Never reload over a learner's unsaved work:** every automatic reload is gated on `hasLiveWork()`
  (`src/lib/liveWork.ts`) and retries at a later resume; a new surface holding in-memory work claims
  it with `useLiveWork(active, label, flush)` AND persists itself.
- **A tile the learner EXPANDS obeys one rule, everywhere, filters included** (founder s189): at rest
  the page does not scroll; expanding releases the page's height cap (`.h-page-stage`); the tile is
  never taller than one screen (`.max-h-panel-stage`); ONE inner region scrolls (`min-h-0 flex-1
  overflow-y-auto`), handing the scroll back to the page at its top (nothing sets
  `overscroll-behavior`); and it scrolls into view via `useStagePanel` WITH `scroll-mt-*`/`-mb-*`.
- **A freshly opened page never scrolls.** Every trainer sizes its elastic element to the room left
  and gives up its preferred floor rather than push the resting page past one viewport
  (`useFillEditor`, `measureMobile`); the **exam** answers it with a stage instead (s186):
  `h-exam-stage`, pinned RunBar/strip/actions, ONE inner region scrolling. Height only, never
  `overflow:hidden`, or the mobile keyboard cannot scroll the field into view. **The Prüfung hub**
  uses `h-pruefung-stage` (s196), which keeps a real ceiling from `lg` up too.
- **A focus ring answers the KEYBOARD only, and a hover style answers a POINTER only** (founder
  s190/s201). `trackInputMode()` marks `<html data-input="pointer|keyboard">` and one rule in
  `index.css` drops the ring while the pointer is in charge, so WCAG 2.4.7 holds without a stray
  ring (`:focus-visible` alone does not settle it; the indicator is never deleted to fix one).
  `future.hoverOnlyWhenSupported` compiles every `hover:` into `@media (hover: hover)`, a touch
  browser keeping `:hover` on the last element tapped, so **a control's ON state is always its own
  class, never a hover fill**.
- **When a page changes WHAT scrolls, everything reading the window has to move with it** (s190):
  hooks take the scroll root (`useScrollDirection(root)`, `ScrollRootProvider`), never the window by
  assumption. A scroll container SLICES what crosses its edge, so it fades PER EDGE and only where
  content continues (`useEdgeFade`; never a hardcoded `mask-fade-*`, s206/s209), and a rail beside
  it needs `self-start` or the grid stretches it to its cap.
- **Design landmines:** never reintroduce anything on the `/design` skill's §7 reverted list.
- The remote-config contract: empty/unreachable `app_config` must equal today's behavior
  byte-for-byte (`tests/appConfig.test.ts`). Admin RPCs return aggregates only (exception: `feedback`).

## Founder design preferences (UI; full record in `docs/DECISIONS.md`)
**Before ANY design/UI work (new page, section, component, restyle, mockup), load the `design`
skill** (`.claude/skills/design/SKILL.md`, also invocable as `/design`): it holds the full design
system, the preview-first process, the pre-flight checklist ranked by past rework causes, and the
rejected-then-reverted landmine list. The bullets below are only the always-on summary.
- **Extend the existing design system, never invent a parallel style:** reuse the Bibliothek
  building blocks (sliding-pill switcher AS the page header, FilterRail tile language, scope
  dropdowns, facet pills, the ONE floating mobile action cluster) and the one categorization
  hierarchy, **Lebensbereich → Thema → Unterthema → Branche** (founder s199). **Exactly TWO
  learner-facing categories, everywhere: Berufsleben and Alltag** (`src/lib/lifeAreas.ts` is the one
  fold; only `beruf` is Berufsleben, every other domain is Alltag). The content domains stay the
  authoring grain, never a heading a learner sees; a third group anywhere is a bug (founder, s181).
- **A bottom-bar tab is lit by its ZONE, not by its URL** (founder s192): `navZoneOf` folds every
  route into the tab that owns it (`/writing` is Prüfung, `/session` is Praktisch, `/sammlung` is
  Fortschritt), and the bar and sidebar render plain `Link`s, because `NavLink` re-decides the state
  AND swallows `aria-current`. A visible bar with nothing lit is a bug.
- **A result is shown in ONE place per page** (founder s188): past scores live in that page's
  Verlauf block, never also on the run band or the module cards.
- **The Prüfung zone is ONE page with a switcher as its header** (founder s189, `/anwenden`):
  **Module üben** | **Modelltest**. The switcher IS the header at every width (no HubHero, no `h1`,
  no page title) and the AppShell greeting slot stays EMPTY here. Niveau is a compact button; scope
  controls sit BELOW the switcher, both rows centred. **Mit Zeit / Ohne Zeit** rests on Ohne Zeit and
  is the ONLY way into the four choosers, which are the same four modules without a clock, never a
  fifth block. All four wear ONE "Aufgabe wählen" rail (`ScopeRail.tsx`, s196), and **the three list
  choosers are ONE component** (`ModulePicker` + `ChooserCard` + `ModuleTabs`, s201). **The exam
  FRAME is Mit Zeit's alone** (s192): Ohne Zeit skips the Anleitung and opens the drill; only the
  STAGE is shared, and the exit follows the one-frame law, not the clock.
- **BOTH Prüfung tabs share one frame and end in a Verlauf** (founder s190): a height-stable scope
  row, and the module card's minutes badge in a corner RESERVED in both clock states, so the clock
  switch cannot move a card edge. Modelltest's Verlauf leads with the last score plus its delta;
  Module üben's is a Stärkeprofil (pale = first attempt, solid = the gain since).
- **Every rail runs ONE order, Lebensbereich FIRST** (founder s184, reordered s199): `LifeAreaPills`
  lead, then Thema, Unterthema, Branche, then Niveau and Textsorte. Single-select that toggles off,
  `?area=` in the URL, honest counts; picking one narrows the Thema dropdown to that area, so pill,
  dropdown and list can never disagree. The order lives INSIDE the rails, never in a caller.
  Grammatik is the one exception (no Thema, so no life-area pills).
- **Branche LOCKS where it has nothing; it never merely greys** (founder s199). Its count is the
  DEDICATED one, not what the soft fallback would serve, because a healthy number beside an option
  that changes nothing is the rail lying about the engine. Zero renders a padlock; when EVERY option
  is zero, ONE line replaces the control (the normal state on Lesen/Hören). The engine keeps its
  untagged-=-universal fallback, so nothing is unreachable.
- **A rail is ONE piece** (founder s199): no separator rules, no second fill on header or footer.
- **Previews first for design work:** founder-reviewable `preview/*.html` mockups from the real
  tokens, iterate on the feedback list, then implement.
- **No redundancy:** each fact appears once, no explanatory filler lines, compact chrome
  (content-sized toggles, 40px icon buttons). **Dropdowns over pill walls** for long scope lists;
  rails never outgrow their tile. **Controls always visibly act:** no disabled-at-default buttons.
- **Dark mode is near-neutral, not blue** (founder s187, "N3 Slate"): greys carry a whisper of cool
  (ground `220 15% 4%`, cards `220 10% 17%`), the two coloured page radials are OFF, and colour
  survives only where it ACTS (gradient CTA, active number, selected answer). Three layers always
  separate: ground → card (1.38:1) → anything nested in a card (`--elevated`). Corners are the
  "tighter" scale (`--radius: 0.5rem` → card 10px, row 8px, pill 6px).
- **Color language:** Himmelblau accent tiles for selection rails (not grey), and the accent is a
  FILL with NO visible edge: rails and the buttons that open them border in their own fill color and
  separate from the page by `shadow-soft` alone, like the Bibliothek cards. Content on white cards
  (no grey washes); card-title eyebrows bold brand blue, inner labels muted; a bold colored word
  label over an i icon; green dot = detected fact; AI/legal disclaimers as standalone lines below
  cards; labels neutral dark grey, never accent blue.
- **Consistency + motion:** primary actions in the same place across sibling modes; subtle
  micro-motion in one timing family (0.12-0.18s, reduced-motion safe); squircle corners on
  toggles/pills, round only for dots/badges/avatars/circular icon buttons.

## Writing style (ALL user-facing copy)
- **Avoid em dashes (`—`).** Rewrite with a period, comma, colon, parentheses, or "so"/"and";
  applies to every visible string (UI labels, content data, legal copy, toasts, manifest). En
  dash `–` and bullet `·` are fine. This rule is for all AI tools building this app.
- **Microcopy budget:** interface copy is chrome, not content. Eyebrow ≤ 2 words, title ≤ 5 words, no
  section-description sentence under a header (`SectionHeading`/`HubHero` `description` stays unset).
  Learning content is display-size and exempt; functional strings (EmptyState, form helpers, the
  session preview line) are kept.
- **In-app UI language follows the LEVEL** (founder s207): A2/B1 English, B2/C1 German, **the
  learning material German at every level** (gloss unchanged). One fold `src/lib/uiLang.ts`, all
  English in `uiStrings.ts` keyed by the German string; coverage + exceptions: `UI-LANGUAGE.md`.
- **Everything the FOUNDER reads is ENGLISH** (founder rule, restated s187): chat, PR bodies, docs,
  and every `preview/*.html` mockup or artifact, including headings, option names, notes, tables and
  switch labels. The interface-language rule above is about the product, not review material: the
  ONLY German in a preview is copy that is literally app copy in the mocked screen, the thing under
  review. Same for any AI tool working on this app.

## Area guides (`docs/areas/` — read the matching file BEFORE touching an area)
- `COMMANDS.md` — every script's full behavior, gates vs warn-only, integrity rules.
- `CONTENT.md` — banks, schemas, taxonomy, linter checklist, provenance. Pair with `/content`.
- `BIBLIOTHEK.md` — the `/library` tabs, views, graphs, FilterRail, search, Grammatik lessons.
- `SESSION.md` — the composed session engine, Üben auto-variety rules, focus mode, SRS engines.
- `PRUEFUNG.md` — the `/anwenden` zone: the tabs, the choosers, the run and its deadline clock, what
  a level can serve, what a Modelltest costs the AI budget, where a result is shown.
- `SCHREIBEN.md` — `/writing` Fokus/Kurz/Lang, rails, correction card, the mobile anatomy, AI cascade.
- `SPRECHEN.md` — the AI conversation partner: the brief/conversation/debrief shape, the three
  layouts, the Redemittel rail, the cost guards, the `converse` function.
- `PRAKTISCH-NAV.md` — dashboard Üben/Spielen, bottom tab bar (locked), header, feedback pill.
- `UI-LANGUAGE.md` — the A2/B1-English rule, the `t()` mechanism, what is converted and what is not.
- `GAME.md` — the Neuland layer: missions-as-data, scenes/sprites, pixel rules, hub surfaces.
- `BRAND.md` — logo/wordmark rules, icons/favicons, theme tokens, dialog overlay convention.
- `LEGAL-ADMIN.md` — legal pages, consent, GDPR self-service, `/sources`, the admin center.
- `COMPONENTS.md` — help/blog section, Artikel-Visuals gender system, domain buildings.

## Deployment (GitHub Pages)
- **`main` is production.** Merging to it triggers TWO deploys (s167): `pages.yml` ships the site and
  `supabase.yml` deploys every Edge Function (applying migrations first). `validate.yml` is the
  content-lint + test gate and never deploys.
- **No CLI is needed for backend changes, migrations included (s179).** With
  `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` (both set; the token expires and the run then
  says so), **a merge to `main` applies pending migrations, then deploys every Edge Function**.
  **Keep migrations idempotent** (`… if not exists`, `drop policy if exists` before `create`): the
  push runs `--include-all`, and migrations run BEFORE the functions, so a non-idempotent statement
  blocks the whole backend deploy. `pnpm lint:migrations` gates this since s185 (files ≤ 0014 exempt
  as applied history; never raise that baseline). Rescue inputs + detail: `docs/areas/COMMANDS.md`.
- **Feature-branch pushes do NOT update the live site** ("I don't see the change" = unmerged work),
  and the sandbox cannot reach the live site; the founder verifies live results.
- **A Pages deploy outlasts the 10-min default:** attempt 1 gets 30 min, the retries 10 (why → §s197).
- The app is a PWA: after a deploy a stale service worker can serve the old build, so hard-refresh
  before diagnosing "missing" changes. The auto-update reload **defers while a draft or session is
  open** (s173), so a learner mid-task adopts the new build at their next clean resume.

## Workflow
- **Token/context discipline:** targeted Grep/Glob over whole-file reads; batch independent tool
  calls; no subagents for routine work; plan first on big refactors; keep the docs lean.
- The dev branch is **reassigned every session**; `main` is always the source of truth. Ship by
  PR into `main`, squash-merged.
- **Auto-ship (founder approved):** when a change is complete and `pnpm build` is green, open a PR
  into `main` and squash-merge it yourself (GitHub MCP tools); the founder confirms the live result.
- **Post-merge housekeeping (REQUIRED after every squash-merge):** `git fetch origin main` →
  `git reset --hard origin/main` → `git push --force-with-lease origin <branch>` → confirm clean.
  Never plain `--force`. Don't pre-write the next PR's log entries against a stale branch.
- **Documentation (REQUIRED after every significant task):** update `docs/PROJECT_STATUS.md`
  (session log, counts, "Resume here"; keep under ~250 lines, archiving the session logs and
  handoffs older than the two most recent into the ISO-week chunk under `docs/archive/status-log/`).
  Backlog/model guidance goes to `docs/PROJECT_REFERENCE.md`. **"Update the documentation" always
  means BOTH `PROJECT_STATUS.md` AND `SESSION_PROMPT_LOG.md`** plus any docs the work made stale
  (including this file and the matching `docs/areas/*`). **A count in a doc is MEASURED, never
  carried forward:** re-run `pnpm lint:content` and quote it with the date you measured it.
- **Prompt & session log (REQUIRED for every founder prompt):** append one entry per founder prompt
  to `docs/SESSION_PROMPT_LOG.md` (append-only, newest at the bottom: verbatim prompt, timestamp,
  branch, response summary, artifacts · commit SHAs · PR #s). Authorship paper trail; no secrets, no
  internal model identifiers. Any "document this session" request implies it.
- The founder is **non-technical**; act as a decisive CTO who minimizes their ops burden, caps
  costs, and explains things in plain language.

## Roadmap & status (read when resuming)
- **`docs/PROJECT_STATUS.md`** — living status + the two most recent handoffs. **Start here.**
- **`docs/PROJECT_FOUNDATION.md`** — stable technical baseline (architecture, infra, Supabase).
- **`docs/PROJECT_REFERENCE.md`** — founder backlog, model guidance, research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked decisions; read before undoing anything called
  "locked". · **`docs/SESSION_PROMPT_LOG.md`** — the founder-prompt paper trail. · **`docs/archive/`**.
