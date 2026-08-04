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
  (FSRS→Lv 1-5 mapping, stable game contract, don't drift the bands), `dialogue.ts`, `scoring.ts`,
  `speech.ts`, `quiz.ts`
- `store/` — `useProgressStore`, `useSessionStore`, `useSettingsStore`, `useAuthStore`,
  `useLibraryScope`, `useExamStore` (the one running mock exam, persisted)
- `lib/` — `facets.ts` (single facet registry, ≤12-option rule + coverage floor), `cefr.ts`
  (single CEFR source), `lifeAreas.ts` (the ONE Berufsleben/Alltag fold + the `?area=` matcher) with
  `themeGroups.ts` (the grouped Thema options every dropdown reads), `search.ts`, `fuzzy.ts`,
  `graphPalette.ts`, `phase.ts`, `idRenames.ts`,
  `admin.ts` (FOUNDER_EMAILS), `appConfig.ts` (remote config; empty config == default behavior),
  hooks/icons/utils
- `features/` — `session/` (SessionPlayer + ReadingBlock), `library/`, `vocabulary/`,
  `collocations/`, `redemittel/`, `grammar/`, `writing/`, `dashboard/`, `welt/` (game),
  `exam/` (mock exam: ExamHub, MockExamRunner + the four part views, ExamRunner dialogue),
  `collection/` (Sammlung), `help/`, `legal/`, `admin/`, `shared/` (FilterRail, LifeAreaPills,
  ViewSwitcher, DataTable, SearchField, useSlidingPill)
- `components/` — `layout/` (AppShell, BottomTabBar, Sidebar, route-icons, FeedbackButton),
  `artikel/` + `city/` (see `docs/areas/COMPONENTS.md`), `ui/` primitives, `shared/Logo.tsx`
- `types/index.ts` shared types · `types/game.ts` mission schema · `router.tsx`, `App.tsx`
- Routes: `/` Praktisch dashboard · `/library` Bibliothek · `/writing` Schreiben · `/analytics`
  Fortschritt · `/settings` · `/session` · `/welt` game · `/anwenden` **Prüfung** (the nav zone
  that holds Sprechen + Schreiben + Prüfungssimulation since s182; `/writing` keeps its route but
  is a card in that hub, not a tab) · `/exam` **Prüfungssimulation** (the four-part mock exam,
  s186: hub at rest, and the running Teil takes the route over) ·
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
- **Content facts are stated, never left blank** (audit P9/P5/P7, s185; all four are gates):
  every noun carries `plural` XOR `numerus` (`uncountable`/`pluralOnly`); `pron` follows the ONE
  documented respelling scheme (`docs/areas/CONTENT.md` §Pronunciation); every grammar topic has 10
  drills with ≥3 productive (`tests/grammar.test.ts`); and the count of B2.2/C1 items that are
  specialized-or-rarer is ratcheted at 334, because a rare compound is not an advanced word.
- **A human-verified row is never edited by an AI to satisfy a new rule.** The content fingerprint
  ties the `verified` stamp to exact content, so a new content-shape check WARNS on verified rows
  and queues them for the next human pass; it never re-stamps and never flips them back to draft.
- **A filter filters; it never substitutes.** In Schreiben's Aufgabe rail, Niveau, Textsorte and
  Unterthema are HARD (Branche stays soft, untagged-=-universal, and is applied last so it cannot
  hide a hard match), ONE function counts what the trainer draws, zero-yield options grey out with
  their honest count, and an empty scope gets an empty state naming the one filter to drop. The
  prefer-tagged-else-untagged fallback these replaced made "Forumsbeitrag" serve a Beschwerde 84% of
  the time (s180). Related founder law: **only a task carrying the full brief is served** (Adressat,
  du/Sie, 2-5 Leitpunkte, Niveau, Textsorte, word target), because the AI grades Aufgabenerfüllung
  against it. The 373 bare legacy tasks that law retired were all authored up to that shape in s181
  (waves 3 and 4), in place and keeping their ids: **717 tasks, every one servable**, with ≥2 tasks
  per Unterthema per length, all 15 Branchen on every Beruf AND Alltag theme at both lengths, and all
  16 Textsorten live. `tests/writingScope.test.ts` gates each of those, so they are invariants now.
- **Keep eager code light:** the Dashboard imports NO content bank; bank-consuming dashboard
  elements are lazy chunks. Never re-introduce a static import chain from eager code to a bank.
- **Reward color (Koralle, `--reward`)** is reserved for loot/combo/streak celebration moments
  (plus Fokus error underlines); never general chrome, never building marks.
- **Locked structures** (change only on explicit founder request): the mobile bottom tab bar
  (structure, edit mode, icon rules — `docs/areas/PRAKTISCH-NAV.md`), the dialog/overlay recipe
  (`docs/areas/BRAND.md` §Dialog), the in-mission pixel chrome + "failure is content, never
  lockout" (`docs/areas/GAME.md`), the ungated boss mission 1.6, the grey-tile/white-controls
  FilterRail answer, the sliding-pill switcher mechanism (`useSlidingPill`, no per-segment
  `layoutId`), the Schreiben mobile anatomy (ONE fixed bottom-chrome geometry shared by Fokus,
  Kurz and Lang + measured tile heights + the Fokus dial tile — four preview rounds settled it,
  `docs/areas/SCHREIBEN.md`).
- **A signed-in learner is restored from the cloud, never re-onboarded.** Signing in wipes the
  device-global cache first (account isolation), so `onboarded` and the profile can ONLY come back
  from `profiles.settings`. `mergeRemoteSettings` adopts on `settings.onboarded === true` and nothing
  else: a proxy field (it was `profile.name`, which onboarding never collects) silently sent every
  account back through onboarding and discarded its level and goal. Where a not-onboarded visitor
  goes depends on their session: signed out → `/welcome`, signed in → `/start`
  (`docs/DECISIONS.md` §s174).
- **A failed cloud write is never silent** (DB audit R3, s185). supabase-js returns `{ error }`
  instead of throwing, so an ignored result makes a permanently broken sync look identical to a
  working one while localStorage keeps the app running. Every push reads its error, retries with
  backoff, and after 3 consecutive failures flips `useAuthStore.syncHealth` to `"failing"`, which
  the Settings account panel shows as "Sync pausiert" with a retry. Any new cloud write path does
  the same; never `await` a Supabase call and drop its result.
- **The cloud row is bounded, not append-forever** (DB audit R1/R4, s185). `dailyXp`/`activeDays`
  keep `RETAIN_DAYS` (400) days, folding dropped active days into `activeDaysFolded` so the
  lifetime "N aktive Tage" figure is unchanged; migration 0015 purges abandoned guest accounts
  (90 days), never-reused transform-cache rows (60 days) and learner TEXT (730 days, founder
  decision s185) by `pg_cron`. The text purge NULLs columns, never deletes rows, so limits and
  aggregates survive and Verlauf keeps the evaluation. **A retention timer and the privacy-policy
  copy describing it ship in the SAME change**; never resolve a conflict between them by editing
  the copy alone.
- **Never reload over a learner's unsaved work.** The PWA adopts deploys by reloading; every
  automatic reload is gated on `hasLiveWork()` (`src/lib/liveWork.ts`) and retries at a later
  resume. Any new surface holding in-memory work claims it with `useLiveWork(active, label, flush)`
  AND persists itself, so an unavoidable reload (chunk-load self-heal, manual refresh, iOS
  discarding the tab) is recoverable rather than lost work.
- **A freshly opened page never scrolls.** Every trainer sizes its elastic element (the writing
  field, the tile column) to the room actually left, and gives up its preferred floor rather than
  push the resting page past one viewport (`useFillEditor`, `measureMobile`). The **exam** answers
  this with a stage instead of measurement (s186): a running Teil is `h-exam-stage` tall, pins its
  RunBar/strip/actions and scrolls ONE inner region, so all ten in-exam screens rest at exactly 0
  page scroll down to 360x640. Height only, never `overflow:hidden`, or the mobile keyboard cannot
  scroll the field into view.
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
  dropdowns, facet pills, sticky mobile action bars) and the one categorization hierarchy
  (Branche → **Lebensbereich** → Thema → Unterthema). **Exactly TWO learner-facing categories,
  everywhere: Berufsleben and Alltag** (`src/lib/lifeAreas.ts` is the one fold; only `beruf` is
  Berufsleben, every other domain is Alltag). The five content domains stay the authoring grain,
  never a heading a learner sees; a third group in any dropdown or legend is a bug (founder, s181).
- **Every filter and Aufgabe rail carries the Lebensbereich pills** (founder, s184): one shared
  `LifeAreaPills` control in a fixed slot, directly BELOW the Branche dropdown (top of the scope
  stack on a rail without one), single-select that toggles off, `?area=` in the URL, honest counts.
  Picking one narrows the Thema dropdown to that area and drops a Thema from the other one, so pill,
  dropdown and list can never disagree. The one exception is Grammatik, whose topics carry no Thema:
  a life-area filter there would be dead chrome, not a filter.
- **Previews first for design work:** founder-reviewable `preview/*.html` mockups from the real
  tokens, iterate on the feedback list, then implement.
- **No redundancy:** each fact appears once, no explanatory filler lines, compact chrome
  (content-sized toggles, 40px icon buttons).
- **Dropdowns over pill walls** for long scope lists; rails never outgrow their tile.
- **Controls always visibly act:** no disabled-at-default buttons; zero-yield options grey out
  with honest counts.
- **Dark mode is near-neutral, not blue** (founder s187, "N3 Slate"): the greys carry a whisper of
  cool (10-15% saturation, ground `220 15% 4%`, cards `220 10% 17%`) and the two coloured page
  radials are OFF in dark (`--wash-a`/`--wash-b`). Colour survives only where it ACTS: the gradient
  CTA, an active number, a selected answer. Three layers always separate: ground → card (1.38:1) →
  anything nested inside a card (`--elevated`); a row that carries its card's own fill is a bug, not
  a style. Corners are the "tighter" scale (`--radius: 0.5rem` → card 10px, row 8px, pill 6px).
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
- `SCHREIBEN.md` — `/writing` Fokus/Kurz/Lang, rails, correction card, the mobile anatomy (fixed
  chrome, measured heights, Fokus dial tile), umlaut keys, AI cascade.
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
- **No CLI is needed for backend changes any more, migrations included (s179).** The Supabase
  workflow needs `SUPABASE_ACCESS_TOKEN` (set; carries an expiry, and the run fails with an explicit
  "regenerate it" error when it lapses) and, since 2026-07-31, `SUPABASE_DB_PASSWORD` (set), so
  **a merge to `main` applies pending migrations and then deploys every Edge Function**. Nothing is
  pasted into the SQL editor any more.
  **Keep migrations idempotent** (`add column if not exists`, `create table if not exists`,
  `drop policy if exists` before `create policy`): the push runs `--include-all`, so an unrecorded
  file is applied wherever its number sits. **`pnpm lint:migrations` gates this since s185** (files
  ≤ 0014 are exempt as already-applied history; never raise that baseline to silence a new file).
  Migrations run BEFORE the function deploys, so a non-idempotent statement blocks the whole
  backend deploy.
  The workflow also carries three dispatch-only inputs for when something is off:
  `list_only` (print local vs remote history), `probe_schema` (print the live tables, columns,
  functions, policies and recorded migrations) and `repair_applied` (mark versions as applied
  without running them). The s179 bridge from hand-pasted history used all three.
- **Feature-branch pushes do NOT update the live site.** If the founder says "I don't see the
  change", the likely cause is unmerged work on the session branch.
- The sandbox cannot reach the live `*.github.io` site; the founder verifies live results.
- The deploy job retries `actions/deploy-pages` up to 3 times to absorb GitHub's transient Pages
  flake; a green run may show a red attempt 1 (expected).
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
