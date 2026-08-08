# Genauly — German for the intermediate (B1–B2) plateau

Genauly helps adult learners break through the intermediate German plateau (B1–B2) and build
practical fluency for the situations that matter in real life: the **workplace**, plus **everyday
tasks** like bureaucracy (Behörde), banking, healthcare (Arzt), and housing. It also supports
direct preparation for the **telc Deutsch B2 Beruf** and **Goethe-Zertifikat B2** exams.
React + TypeScript + Vite SPA, deployed to GitHub Pages at `genauly.de`.

**Scope note (do not narrow this again):** the product was repositioned (session 21) from "B2
Beruf speaking-exam prep" to the broader B1–B2 plateau framing above. Exam prep is **one pillar**,
not the whole product; daily-life domains beyond the workplace are core, not optional.

**How this file works (maintenance rule):** CLAUDE.md states **current law only**, in short
bullets, and stays under ~350 lines (the linter warns past that). When a rule changes, REPLACE it
here and update the matching `docs/areas/*` file in the same PR; the history and the "why" go to
`docs/DECISIONS.md`, the blow-by-blow to `docs/SESSION_PROMPT_LOG.md`. Deep per-area detail lives
in `docs/areas/` and the two skills (`/design`, `/content`) — read them on demand, keep them
current-state-only too.

## Stack
- **Vite 6** + **React 18** + **TypeScript 5.7** (strict, project references via `tsc -b`)
- **Tailwind 3** (`tailwind.config.ts`), **Radix UI**, **framer-motion**, **lucide-react**,
  **recharts**; **zustand** state; **react-router-dom 6**
- No test framework beyond Vitest + targeted `scripts/*.mjs` gates.

## Commands (index — full detail in `docs/areas/COMMANDS.md`)
**Package manager is `pnpm`** (pinned; lockfile `pnpm-lock.yaml`). Never npm/yarn. `pnpm install`
after pulling.
- `pnpm dev` · `pnpm build` (tsc + vite + help prerender; run before pushing) · `pnpm typecheck` ·
  `pnpm preview` · `pnpm audit`
- CI gates: `pnpm lint:content` (after ANY content edit) · `pnpm lint:migrations` (after ANY new
  `supabase/migrations/*.sql`) · `pnpm lint` · `pnpm test:unit` ·
  `pnpm test:srs` (after `engine/srs.ts` edits) · `pnpm test:pronounce` (after
  `engine/pronounce.ts` edits) · `pnpm check:bundle` (400 kB main-chunk budget, after build) ·
  `pnpm check:contrast` (WCAG gate, after `src/index.css` token edits) ·
  `pnpm verify:facts` (noun fact gate; `pnpm build:oracles` first after adding nouns)
- Warn-only checks: `pnpm verify:grammar` · `pnpm verify:cefr` (`pnpm verify:sentences` = both)
- Generated data: `pnpm build:frequency` (→ `src/data/frequency.ts`) · `pnpm build:verification`
  (→ `src/data/verification.ts`) · `pnpm build:verbs-subset` + `pnpm build:verb-forms`
  (→ `src/data/verbForms.ts`, verb morphology) — regenerate, never hand-edit
- Review loop: `pnpm review:queue` · `pnpm stamp:verified` (same commit as any verified flip) ·
  `pnpm apply:reviews` (founder decisions; integrity rules in COMMANDS.md, do not weaken) ·
  `pnpm build:review-queue` · `pnpm report:exercise-coverage`
- `.npmrc` supply-chain cooldown + blocked dependency build scripts: keep it that way.

## Layout (`src/`)
- `data/` — content banks + `provenance.ts` + generated `frequency.ts`/`verification.ts`/
  `verbForms.ts` (see `docs/areas/CONTENT.md`)
- `engine/` — `srs.ts` (FSRS-6), `pronounce.ts`, `session.ts` (composed-session composer),
  `exam.ts` (mock-exam composer + scoring, s186), `mission.ts` (game runner), `collection.ts`
  (FSRS→Lv 1-5 mapping, stable game contract, don't drift the bands), `conversation.ts` +
  `speaking.ts` (the spoken-conversation state machine + brief derivation, s193), `scoring.ts`,
  `speech.ts`, `quiz.ts`
- `store/` — `useProgressStore`, `useSessionStore`, `useSettingsStore`, `useAuthStore`,
  `useLibraryScope`, `useExamStore` (the one running mock exam, persisted)
- `lib/` — `facets.ts` (single facet registry, ≤12-option rule + coverage floor), `cefr.ts`
  (single CEFR source), `lifeAreas.ts` (the ONE Berufsleben/Alltag fold + the `?area=` matcher) with
  `themeGroups.ts` (the grouped Thema options every dropdown reads), `search.ts`, `fuzzy.ts`,
  `graphPalette.ts`, `phase.ts`, `idRenames.ts`,
  `admin.ts` (FOUNDER_EMAILS), `appConfig.ts` (remote config; empty config == default behavior),
  hooks/icons/utils
- `features/` — `pruefung/` (the one Prüfung hub), `session/` (SessionPlayer + ReadingBlock), `library/`, `vocabulary/`,
  `collocations/`, `redemittel/`, `grammar/`, `writing/`, `sprechen/` (the AI conversation
  partner, s193), `dashboard/`, `welt/` (game),
  `exam/` (mock exam: MockExamRunner + the four part views),
  `collection/` (Sammlung), `help/`, `legal/`, `admin/`, `shared/` (FilterRail, LifeAreaPills,
  ViewSwitcher, DataTable, SearchField, useSlidingPill)
- `components/` — `layout/` (AppShell, BottomTabBar, Sidebar, route-icons, FeedbackButton),
  `artikel/` + `city/` (see `docs/areas/COMPONENTS.md`), `ui/` primitives, `shared/Logo.tsx`
- `types/index.ts` shared types · `types/game.ts` mission schema · `router.tsx`, `App.tsx`
- Routes: `/` Praktisch dashboard · `/library` Bibliothek · `/analytics`
  Fortschritt · `/settings` · `/session` · `/welt` game · `/anwenden` **Prüfung** (the nav zone
  that holds the four modules + Modelltest since s182) · the four Ohne-Zeit choosers
  `/lesen` · `/hoeren` · `/writing` · `/simulation` (each a card in that hub, not a tab) ·
  `/exam` **Modelltest** (the four-part mock exam: hub at rest, the running Teil takes the route
  over) ·
  `/sources` (founder review table lives in `/admin/pruefen`) · `/admin/*` (founder) ·
  `/auth/confirm` (email-confirmation landing, ungated on purpose) · `/hilfe`,
  `/privacy`,
  `/terms`, `/about`, `/welcome` (public)

## Hard invariants (cross-cutting; never break without an explicit founder request)
- **Shipped content ids are PERMANENT** — progress is id-keyed locally + in the cloud. Retire,
  never rename/delete; unavoidable renames go through `ID_RENAMES` forever.
- **Closed-enum rule:** every union added to `src/types/index.ts` is mirrored by an array +
  validate-when-present check in `scripts/lint-content.mjs`.
- **Every content_id has a provenance row**, added in the same edit.
- **Content facts are stated, never left blank** (s185, all gates): every noun carries `plural` XOR
  `numerus`; `pron` follows the ONE respelling scheme (`docs/areas/CONTENT.md` §Pronunciation); every
  grammar topic has 10 drills with ≥3 productive; the count of B2.2/C1 items that are
  specialized-or-rarer is ratcheted at 334, because a rare compound is not an advanced word.
- **Pedagogical shape is gated too** (s198; `scripts/content-shape.mjs` +
  `tests/contentShape.test.ts`): a `core`-frequency word is never labelled B2.2/C1, every theme
  carries ≥3 verbs AND ≥3 adjectives, and three ratchets pin the measured bank (rare 53.87%,
  no-corpus-evidence 100, noun 77.59%). Raising a ceiling is a deliberate edit there with a reason,
  never the way to land a word.
- **A gap in an example sentence comes from ONE rule** (`src/engine/blank.ts`, s198), used by the
  MCQ/listening/typed clozes and the coverage report; it reports WHICH form it blanked so
  distractors match. Never re-copy it into a call site: four copies is how an ASCII `\b` silently
  disabled every umlaut-initial word.
- **A human-verified row is never edited by an AI to satisfy a new rule.** The content fingerprint
  ties the `verified` stamp to exact content, so a new content-shape check WARNS on verified rows
  and queues them for the next human pass; it never re-stamps and never flips them back to draft.
- **A filter filters; it never substitutes.** In every Aufgabe rail (all four modules since s196)
  Niveau, Thema, Unterthema and Textsorte are HARD; Branche stays soft (untagged-=-universal) and is
  applied last so it cannot hide a hard match; ONE function counts what the module draws; zero-yield
  options grey out with their honest count; an empty scope gets an empty state naming the one filter
  to drop. Related founder law: **only a task carrying the full brief is served** (Adressat, du/Sie,
  2-5 Leitpunkte, Niveau, Textsorte, word target), because the AI grades Aufgabenerfüllung against
  it: **717 writing tasks, every one servable**, ≥2 per Unterthema per length, all 16 Textsorten
  live. A `du` brief never names a title + surname (s200): the Adressat drives the Anrede.
  `tests/writingScope.test.ts` and `tests/moduleScope.test.ts` gate it. (Why → `DECISIONS.md`
  §s180/s196.)
- **A TAG IS EARNED, and a brief ASKS for what it is graded on.** Two rules, one arrangement: ONE
  lexicon per rule in `scripts/`, shared by `lint:content` AND `tests/writingScope.test.ts`, so gate
  and test cannot drift.
  - **Branche** (`sector-markers.mjs`, founder s199): the brief must name that workplace. The
    all-15-per-Thema floor is GONE (satisfiable by tagging; 199 of 600 tags named an industry the
    brief never entered). Beruf keeps ≥8 of 15 earned, Alltag few and honestly. Dropping a false tag
    costs no reach (Branche is soft), so add the missing word to the lexicon or drop the tag.
  - **Argumentation** (`justification-markers.mjs`, s200): a `stellungnahme`, `forumsbeitrag`,
    `widerspruch` or `beschwerde` at B2+ carries ≥1 Leitpunkt demanding a **reason, a consequence or
    a stance**, because `level` is what tells `evaluate-writing` to mark strictly. Fix by REPLACING
    the weakest descriptive point, never a fifth. Matching is phrase-level over the whole clause,
    never the opening verb ("**Legen** Sie dar, warum …" IS the argumentative move). B1 exempt.
  - **A supplied `source` text belongs to the REPLY genre, never to an opinion task** (s200): no
    exam supplies a text for a Forumsbeitrag or a Stellungnahme (Goethe B2 Teil 1, DTB B2 Teil 2),
    while DTB B2 Teil 1 prints the customer mail you answer. `source` is currently read by nothing.
  (Why → `DECISIONS.md` §s199/§s200.)
- **Keep eager code light:** the Dashboard imports NO content bank; bank-consuming dashboard
  elements are lazy chunks. Never re-introduce a static import chain from eager code to a bank.
- **Reward color (Koralle, `--reward`)** is reserved for loot/combo/streak celebration moments
  (plus Fokus error underlines); never general chrome, never building marks.
- **Locked structures** (change only on explicit founder request): the mobile bottom tab bar
  (`docs/areas/PRAKTISCH-NAV.md`), the dialog/overlay recipe (`docs/areas/BRAND.md` §Dialog), the
  in-mission pixel chrome + "failure is content, never lockout" + the ungated boss mission 1.6
  (`docs/areas/GAME.md`), the Himmelblau-fill/white-controls FilterRail and Aufgabe-rail answer
  (s189/s196, `features/shared/ScopeRail.tsx`), the sliding-pill switcher mechanism
  (`useSlidingPill`, no per-segment `layoutId`), the Prüfung module card's anatomy (s191/s196: no
  description line, icon top-left, minutes badge beside it when timed, arrow bottom-right, sizing
  narrower-than-the-column and closer to square), the Schreiben mobile anatomy
  (`docs/areas/SCHREIBEN.md`), the Prüfung zone's one frame (s195, below).
- **A signed-in learner is restored from the cloud, never re-onboarded.** Signing in wipes the
  device-global cache first (account isolation), so `onboarded` and the profile can ONLY come back
  from `profiles.settings`. `mergeRemoteSettings` adopts on `settings.onboarded === true` and nothing
  else (a proxy field sent every account back through onboarding and discarded its level and goal).
  Where a not-onboarded visitor goes depends on their session: signed out → `/welcome`, signed in →
  `/start` (`docs/DECISIONS.md` §s174).
- **Sprechen is Schreiben with a microphone** (s193): a chooser with the one Aufgabe rail, a brief, a
  conversation, the EXISTING `features/writing/correction.tsx` card as the debrief (its fourth
  caller; never a fifth copy), and its own Verlauf. Deliberately NOT an open chatbot (an LLM adapts
  down and assesses nothing): the brief makes it an exercise, the partner never corrects mid-flow.
  **Layout is a property of the TASK**: practice runs the transcript (`gespraech`), an exam task
  keeps its Aufgabe on screen (`buehne`) unless reading would defeat it (`anruf`). **The row is
  written when a conversation STARTS** (s194), so the daily limit counts what costs money and the
  turn ceiling is measured against the STORED transcript AND on the client; **the practice counts
  once the learner has SPOKEN, not once the AI has graded** (s196), so a failed debrief is
  retryable. Detail: `docs/areas/SPRECHEN.md`.
- **The Prüfung zone has ONE frame** (founder s195). ONE exit, the LAST control in the header, top
  right, on every screen of the zone and at every width (`useSessionStore.zoneExit`, rendered by
  `AppShell`): grey **Zurück**, or red **Verlassen** while a clock runs. `examStage` is a separate
  flag and only a run sets it. **A confirm is about losing work, never about the clock:**
  `hasProgress(run)` gates it, the Schreibtrainer never asks (its draft autosaves, so the warning
  would be false) and a started conversation always does. **The word Zurück belongs to that exit
  alone**, so the question stepper is a chevron. A phone carries the module row on every screen
  (`ModuleHeader`, `lg:hidden`; in a Teil that row IS the `RunBar`). **That row NAMES the module and
  carries no control** (founder s201): the Aufgabe toggle moved to the chooser's own toolbar row,
  level with the count it changes and directly above the panel it opens. ONE Niveau control per
  screen. The HUB rests at `HUB_COL` (`max-w-[40rem]`, s197: one width for every block, so they
  share two edges), a chooser wears Schreiben's content-plus-16rem-rail grid (s196), and only a
  RUNNING Teil gets the wide `lg:max-w-6xl` stage. A Verlauf ships in an empty state from visit one.
- **An exercise the app scores can always be handed in, and every score it produces is reachable**
  (s194 audit). A clock is never the ONLY way a part ends ("Teil abschließen" sits on the last
  question unconditionally, blanks cost a confirm) and a clock is measured against a DEADLINE, never
  by decrementing, or a background tab pauses the exam. Every correction the evaluator returns is
  rendered, and a result surfaces in exactly ONE Verlauf: **a Modelltest sat all four parts, a run
  that sat one is module practice** (`isFullMockRun`, bank-free; `examsDone` is retired), and a
  trainer that produces a correction rather than a percentage keeps its own Verlauf on its own page
  (Schreiben since s171, Sprechen since s196 — a recorded row nothing reads back is lost work).
  **Every module page carries that Verlauf** (founder s201: "either keep verlauf in every module or
  remove it from all of the individual modules"), so a learner finds their history where they
  practise; Lesen's and Hören's are their own sittings (`moduleRuns` + `features/pruefung/
  verlauf.tsx`, which is also the hub's card). The hub keeps the CROSS-module view only.
- **A failed cloud write is never silent** (s185). supabase-js returns `{ error }` instead of
  throwing, so an ignored result makes a permanently broken sync look identical to a working one.
  Every push reads its error, retries with backoff, and after 3 consecutive failures flips
  `useAuthStore.syncHealth` to `"failing"` ("Sync pausiert" in Settings, with a retry). Any new
  cloud write does the same; never `await` a Supabase call and drop its result.
- **The cloud row is bounded, not append-forever** (DB audit R1/R4, s185). `dailyXp`/`activeDays`
  keep `RETAIN_DAYS` (400) days, folded into `activeDaysFolded`; migration 0015 purges abandoned
  guest accounts (90 days), transform-cache rows (60 days) and learner TEXT (730 days) by `pg_cron`,
  NULLing columns rather than deleting rows so limits, aggregates and the Verlauf entry survive. **A retention timer and the privacy-policy
  copy describing it ship in the SAME change**; never resolve a conflict between them by editing
  the copy alone.
- **Never reload over a learner's unsaved work.** Every automatic reload is gated on
  `hasLiveWork()` (`src/lib/liveWork.ts`) and retries at a later resume. Any new surface holding
  in-memory work claims it with `useLiveWork(active, label, flush)` AND persists itself, so an
  unavoidable reload is recoverable rather than lost work.
- **A tile the learner EXPANDS obeys one rule, everywhere, filters included** (founder s189):
  at rest the page does not scroll; expanding releases the page's height cap (`.h-page-stage`); the
  expanded tile is never taller than one screen (`.max-h-panel-stage`), so its own borders stay
  visible; ONE inner region scrolls (`min-h-0 flex-1 overflow-y-auto`) and, because nothing sets
  `overscroll-behavior`, reaching its top hands the scroll on to the page; and it scrolls itself
  into view via `useStagePanel` WITH `scroll-mt-*`/`scroll-mb-*` for the header and bottom bar.
- **A freshly opened page never scrolls.** Every trainer sizes its elastic element (the writing
  field, the tile column) to the room actually left, and gives up its preferred floor rather than
  push the resting page past one viewport (`useFillEditor`, `measureMobile`). The **exam** answers
  this with a stage instead of measurement (s186): a running Teil is `h-exam-stage` tall, pins its
  RunBar/strip/actions and scrolls ONE inner region, so all ten in-exam screens rest at exactly 0
  page scroll down to 360x640. Height only, never `overflow:hidden`, or the mobile keyboard cannot
  scroll the field into view. **The Prüfung hub** uses `h-pruefung-stage` (s196), which unlike the
  shared `h-page-stage` keeps a real ceiling from `lg` up too (`h-page-stage` goes `auto` on desktop
  on the once-true assumption that desktop has room to spare).
- **A focus ring answers the KEYBOARD only** (founder s190). `trackInputMode()` marks
  `<html data-input="pointer|keyboard">` and one rule in `index.css` drops the ring while the pointer
  is in charge; keyboard navigation keeps it, so WCAG 2.4.7 holds. `:focus-visible` alone does not
  settle it: a control that re-renders under the click can come back focused and keep matching, and
  browsers disagree on when. Never answer a stray ring by deleting the indicator outright.
- **A hover style answers a POINTER only** (founder s201, the same law one input mode further):
  `future.hoverOnlyWhenSupported` in `tailwind.config.ts` compiles every `hover:` into
  `@media (hover: hover)`. A touch browser keeps `:hover` on the last element tapped until the next
  tap somewhere else, so a tapped button stayed lit and "deactivated when tapped on empty spaces".
  A control's ON state is therefore always its own class, never a hover fill.
- **When a page changes WHAT scrolls, everything reading the window has to move with it** (s190):
  hooks take the scroll root (`useScrollDirection(root)`, `ScrollRootProvider`), never the window by
  assumption. A scroll container also SLICES what crosses its edge (`useEdgeFade`), and a rail
  beside it needs `self-start` or the grid stretches it to its cap.
- **Design landmines:** the `/design` skill §7 lists everything shipped-then-reverted; never
  reintroduce an item on that list.
- The remote-config contract: empty/unreachable `app_config` must equal today's behavior
  byte-for-byte (`tests/appConfig.test.ts`).
- Admin RPCs return aggregates only, never individual learner rows (exception: `feedback`).

## Founder design preferences (UI; full record in `docs/DECISIONS.md`)
**Before ANY design/UI work (new page, section, component, restyle, mockup), load the `design`
skill** (`.claude/skills/design/SKILL.md`, also invocable as `/design`): it holds the full design
system, the preview-first process, the pre-flight checklist ranked by past rework causes, and the
rejected-then-reverted landmine list. The bullets below are only the always-on summary.
- **Extend the existing design system, never invent a parallel style:** reuse the Bibliothek
  building blocks (sliding-pill switcher AS the page header, FilterRail tile language, scope
  dropdowns, facet pills, the ONE floating mobile action cluster) and the one categorization
  hierarchy, **Lebensbereich → Thema → Unterthema → Branche** (founder s199; it was
  Branche-first until then). **Exactly TWO learner-facing categories,
  everywhere: Berufsleben and Alltag** (`src/lib/lifeAreas.ts` is the one fold; only `beruf` is
  Berufsleben, every other domain is Alltag). The five content domains stay the authoring grain,
  never a heading a learner sees; a third group in any dropdown or legend is a bug (founder, s181).
- **A bottom-bar tab is lit by its ZONE, not by its URL** (founder s192): `navZoneOf` folds every
  route into the tab that owns it (`/writing` is Prüfung, `/session` is Praktisch, `/sammlung` is
  Fortschritt), and the bar and sidebar render plain `Link`s, because `NavLink` re-decides the state
  AND swallows `aria-current`. A visible bar with nothing lit is a bug.
- **A result is shown in ONE place per page** (founder s188): past scores live in that page's
  Verlauf block, never also on the run band or the module cards.
- **The Prüfung zone is ONE page with a switcher as its header** (founder s189, `/anwenden`):
  **Module üben** | **Modelltest**. The switcher IS the header at every width (no HubHero, no `h1`,
  no page title) and the AppShell greeting slot stays EMPTY here (pick C, s197). Niveau is a compact
  button; scope controls sit BELOW the switcher, both rows centred.
  **Mit Zeit / Ohne Zeit** rests on Ohne Zeit and is the ONLY way into the four choosers (`/lesen`,
  `/hoeren`, `/writing`, `/simulation`), which are the same four modules without a clock, never a
  fifth block. All four wear ONE "Aufgabe wählen" rail (`features/shared/ScopeRail.tsx`, s196);
  Lesen/Hören keep their old random draw as a "Zufällige Auswahl" button. **The three list choosers
  are ONE component** (`ModulePicker` + `ChooserCard` + `ModuleTabs`, s201): Üben/Verlauf switcher,
  one toolbar row (count · Aufgabe · Zufällige Auswahl), one card anatomy (mark + title + context
  line + chevron, facts on a bottom-aligned foot row), one 0.16s stagger. **The exam FRAME is Mit
  Zeit's alone** (s192): Ohne Zeit skips the Anleitung and opens the drill; only the STAGE is
  shared, and the exit follows the one-frame law, not the clock.
- **BOTH Prüfung tabs share one frame and end in a Verlauf** (founder s190): a height-stable scope
  row, and the module card's minutes badge in a corner RESERVED in both clock states, so the clock
  switch cannot move a card edge. Modelltest's Verlauf leads with the last score plus its delta
  (Bester and Bestanden as supporting stats, the last seven runs as bars against the pass line);
  Module üben's is a Stärkeprofil (pale = first attempt, solid = the gain since).
- **Every rail runs ONE order, Lebensbereich FIRST** (founder s184, reordered s199):
  `LifeAreaPills` lead, then Thema, Unterthema, Branche, then Niveau and Textsorte. Single-select
  that toggles off, `?area=` in the URL, honest counts; picking one narrows the Thema dropdown to
  that area, so pill, dropdown and list can never disagree. The order lives INSIDE the rails, never
  in a caller, so it cannot drift. Grammatik is the one exception (no Thema, so no life-area pills).
- **Branche LOCKS where it has nothing; it never merely greys** (founder s199). Its count is the
  DEDICATED one, not what the soft fallback would serve, because a healthy number beside an option
  that changes nothing is the rail lying about the engine. Zero renders a padlock; when EVERY option
  is zero, ONE line replaces the control (the normal state on Lesen/Hören, 4 of 52 texts tagged).
  The engine keeps its untagged-=-universal fallback, so nothing is unreachable.
- **A rail is ONE piece** (founder s199): no separator rules, no second fill on header or footer.
  They painted the accent wash ON TOP of the tile's own, composited darker, and read as bolted-on
  parts. They need no opaque backing: the flex column already clips the scroll region away.
- **Previews first for design work:** founder-reviewable `preview/*.html` mockups from the real
  tokens, iterate on the feedback list, then implement.
- **No redundancy:** each fact appears once, no explanatory filler lines, compact chrome
  (content-sized toggles, 40px icon buttons).
- **Dropdowns over pill walls** for long scope lists; rails never outgrow their tile.
- **Controls always visibly act:** no disabled-at-default buttons; zero-yield options grey out
  with honest counts.
- **Dark mode is near-neutral, not blue** (founder s187, "N3 Slate"): greys carry a whisper of cool
  (ground `220 15% 4%`, cards `220 10% 17%`), the two coloured page radials are OFF, and colour
  survives only where it ACTS (gradient CTA, active number, selected answer). Three layers always
  separate: ground → card (1.38:1) → anything nested in a card (`--elevated`). Corners are the
  "tighter" scale (`--radius: 0.5rem` → card 10px, row 8px, pill 6px).
- **Color language:** Himmelblau accent tiles for selection rails (not grey), and the accent is a
  FILL with NO visible edge: rails and the buttons that open them border in their own fill color
  and separate from the page by `shadow-soft` alone, like the Bibliothek cards (never an accent
  edge, never a grey one). Content on white cards (no grey washes); card-title eyebrows bold brand
  blue, inner labels muted; a bold colored word label over an i icon; green dot = detected fact;
  AI/legal disclaimers as standalone lines below cards; labels neutral dark grey, never accent blue.
- **Consistency + motion:** primary actions in the same place across sibling modes; subtle
  micro-motion in one timing family (0.12-0.18s, reduced-motion safe); squircle corners on
  toggles/pills, round only for dots/badges/avatars/circular icon buttons.

## Writing style (ALL user-facing copy)
- **Avoid em dashes (`—`).** Rewrite with a period, comma, colon, parentheses, or "so"/"and";
  applies to every visible string (UI labels, content data, legal copy, toasts, manifest). En
  dash `–` and bullet `·` are fine. This rule is for all AI tools building this app.
- **Microcopy budget:** interface copy is chrome, not content. Eyebrow ≤ 2 words, title ≤ 5
  words, no section-description sentence under a header (the `SectionHeading`/`HubHero`
  `description` prop stays unset). German learning content itself is display-size and exempt;
  functional strings (EmptyState, form helpers, the session preview line) are kept.
- In-app UI language is German (hold-to-peek EN pattern); public/landing pages English-first.
- **Everything the FOUNDER reads is ENGLISH** (founder rule, restated s187 after a German preview
  page): chat, PR bodies, docs, and every `preview/*.html` mockup or artifact, including its
  headings, option names, notes, tables and switch labels. The German-UI rule above is about the
  product, not about review material. The ONLY German inside a preview is the copy that is literally
  app copy in the mocked screen (task text, button labels, tooltips), because that is the thing
  under review. Same for any AI tool working on this app.

## Area guides (`docs/areas/` — read the matching file BEFORE touching an area)
- `COMMANDS.md` — every script's full behavior, gates vs warn-only, integrity rules.
- `CONTENT.md` — banks, schemas, taxonomy, linter checklist, provenance. Pair with `/content`.
- `BIBLIOTHEK.md` — the `/library` tabs, views, graphs, FilterRail, search, Grammatik lessons.
- `SESSION.md` — the composed session engine, Üben auto-variety rules, focus mode, SRS engines.
- `PRUEFUNG.md` — the `/anwenden` zone: the two tabs, the run and its deadline clock, what a level
  can serve, what a Modelltest costs the daily AI budget, where a result is shown.
- `SCHREIBEN.md` — `/writing` Fokus/Kurz/Lang, rails, correction card, the mobile anatomy (fixed
  chrome, measured heights, Fokus dial tile), umlaut keys, AI cascade.
- `SPRECHEN.md` — the AI conversation partner: the brief/conversation/debrief shape, the three
  layouts and which task gets which, the cost guards, the `converse` function.
- `PRAKTISCH-NAV.md` — dashboard Üben/Spielen, bottom tab bar (locked), header, feedback pill.
- `GAME.md` — the Neuland layer: missions-as-data, scenes/sprites, pixel rules, hub surfaces.
- `BRAND.md` — logo/wordmark rules, icons/favicons, theme tokens, dialog overlay convention.
- `LEGAL-ADMIN.md` — legal pages, consent, GDPR self-service, `/sources`, the admin center.
- `COMPONENTS.md` — help/blog section, Artikel-Visuals gender system, domain buildings.

## Deployment (GitHub Pages)
- **`main` is production.** Pushing/merging to `main` triggers TWO deploys (s167):
  `.github/workflows/pages.yml` ships the site, and `.github/workflows/supabase.yml` deploys every
  Supabase Edge Function (and applies migrations first, when `SUPABASE_DB_PASSWORD` is set).
  `validate.yml` is the content-lint + test gate and never deploys.
- **No CLI is needed for backend changes, migrations included (s179).** With
  `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` (both set; the token expires and the run then
  says so), **a merge to `main` applies pending migrations, then deploys every Edge Function**.
  **Keep migrations idempotent** (`… if not exists`, `drop policy if exists` before `create`): the
  push runs `--include-all`, so an unrecorded file is applied wherever its number sits, and
  migrations run BEFORE the functions, so a non-idempotent statement blocks the whole backend
  deploy. `pnpm lint:migrations` gates this since s185 (files ≤ 0014 exempt as applied history;
  never raise that baseline). Rescue inputs + detail: `docs/areas/COMMANDS.md`.
- **Feature-branch pushes do NOT update the live site** ("I don't see the change" = unmerged work).
- The sandbox cannot reach the live `*.github.io` site; the founder verifies live results.
- **A Pages deploy outlasts the action's 10-minute default:** attempt 1 gets `timeout: 1800000`
  (30 min), the two retries keep 600000 (the transient "try again later" should fail fast). A red
  deploy is re-run before the build is suspected. Why → `docs/DECISIONS.md` §s196.
- The app is a PWA: after a deploy, a stale service worker can serve the old build; hard-refresh
  before diagnosing "missing" changes. Since s173 the auto-update reload also **defers while a draft
  or session is open**, so a learner mid-task adopts the new build at their next clean resume.

## Workflow
- **Token/context discipline:** prefer targeted Grep/Glob over whole-file reads; batch
  independent tool calls; no subagents for routine work; plan first on big refactors; keep the
  docs lean (history → `docs/DECISIONS.md`, blow-by-blow → `docs/SESSION_PROMPT_LOG.md`).
- The dev branch is **reassigned every session**; `main` is always the source of truth. Ship by
  PR into `main`, squash-merged.
- **Auto-ship (founder approved):** when a change is complete and `pnpm build` is green, open a
  PR into `main` and squash-merge it yourself (GitHub MCP tools); the founder confirms the live
  result.
- **Post-merge housekeeping (REQUIRED after every squash-merge):** `git fetch origin main` →
  `git reset --hard origin/main` → `git push --force-with-lease origin <branch>` → confirm clean.
  Never plain `--force`. Don't pre-write the next PR's log entries against a stale branch.
- **Documentation (REQUIRED after every significant task):** update `docs/PROJECT_STATUS.md`
  (session log, counts, "Resume here"; keep under ~250 lines, archive handoffs older than the
  two most recent into the ISO-week chunk under `docs/archive/status-log/`). Backlog/model
  guidance goes to `docs/PROJECT_REFERENCE.md`. **"Update the documentation" always means BOTH
  `PROJECT_STATUS.md` AND `SESSION_PROMPT_LOG.md`** plus any docs the work made stale (including
  this file and the matching `docs/areas/*`).
- **Prompt & session log (REQUIRED for every founder prompt):** append one entry per founder
  prompt to `docs/SESSION_PROMPT_LOG.md` (append-only, newest at the bottom: verbatim prompt,
  timestamp, branch, response summary, artifacts · commit SHAs · PR #s). Authorship paper trail;
  no secrets, no internal model identifiers. Any "document this session" request implies it.
- The founder is **non-technical**; act as a decisive CTO who minimizes their ops burden, caps
  costs, and explains things in plain language.

## Roadmap & status (read when resuming)
- **`docs/PROJECT_STATUS.md`** — living status + the two most recent handoffs. **Start here.**
- **`docs/PROJECT_FOUNDATION.md`** — stable technical baseline (architecture, infra, Supabase).
- **`docs/PROJECT_REFERENCE.md`** — founder backlog, model guidance, research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked decisions; read before undoing anything
  called "locked".
- **`docs/SESSION_PROMPT_LOG.md`** — the append-only founder-prompt paper trail.
- **`docs/archive/`** — status-log history by ISO week + completed plans.
