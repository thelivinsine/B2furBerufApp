# Status-log archive, ISO week 2026-W32

Handoffs moved out of `docs/PROJECT_STATUS.md` once they aged past the two most recent.


**Handoff after session 183 (2026-08-02): the Prüfung icons, and the merge question answered.**
Founder: "D and 2", then "keep them separate".
- **Bar mark: the orange Absolventenhut** (`graduationCap` in `route-icons.tsx`). The target rings
  it replaced were the bar's only OUTLINE mark among filled two-tone shapes, which is the whole
  reason it read thinner than its neighbours. `/anwenden` and `/exam` now share that one mark on
  purpose: the tab and the hub card are the same thing at two depths.
- **Hub tiles: the branded route marks on tinted squircles** (`AnwendenHub.tsx`). Each card renders
  `RouteIcon` for its own route, so the Schreiben card carries the exact pencil the nav does, the
  microphone matches it in style, and the cap ties the exam card to the zone. The white-on-gradient
  tiles this replaced turned every mark into the same white silhouette.
- **Two fixes the implementation forced.** (1) Routes that are not `navItems` entries had no accent
  colour, so all three marks would have drawn brand blue: `OFF_NAV_COLOR` now supplies cyan for
  `/simulation` and orange for `/exam`. (2) The tiles were `rounded-2xl`, and `--radius + 10` is
  24px, exactly half of a 48px tile, so they were rendering as full CIRCLES (already true of the old
  gradient tiles). Now `rounded-xl`, matching the approved preview and the squircle law.
  The `/simulation` teal also went from `#5eead4` to `#2dd4bf`, which washed out on the tinted tile.
- **Sprechen vs. Prüfungssimulation: KEEP BOTH, founder decision.** Same dialogue engine and
  scenario bank; Sprechen is untimed practice with hints across all 30 scenarios, Prüfungssimulation
  wraps one scenario in exam conditions (Aufgabenblatt, 6-minute countdown, rubric self-check,
  score). Nothing was merged and nothing changed in either runner.
- **Gates:** typecheck · lint 0 errors · test:unit **496/496** · build · check:bundle 123.2 kB.
  Verified in the BUILT app at 320px, 390px (light + dark) and desktop: five even bar slots with the
  cap active, the three tiles read apart at a glance, and all three cards still open their trainer.
- **Approved mockups:** `preview/pruefung-icons.html` (variants A-D and 1-3 as shown to the founder).
- **Shipped:** PR **#780**, squash-merged as `797f65d`. `Validate content` and `Deploy site to
  GitHub Pages` both green on the merge commit, so this is live on genauly.de. Post-merge
  housekeeping done: branch reset onto `main`, working tree clean. (The mockup round and the
  implementation went out as ONE PR: the preview commit was still unmerged when the founder picked,
  so the picks were added to the same branch.)
- **One open one-liner for the founder:** the page's `HubHero` still shows the lucide target, so the
  zone is a cap in the bar and the sidebar but a target at the top of its own page. Swapping it
  would put two caps on that page (hero + Prüfungssimulation card), which is why it was left alone.

**Session 182 is fully archived** in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`:
part 1 (audit P6, the Redemittel phrase bank) and, aged out by this session, part 4 (the five-slot
Prüfung nav zone, PR #778). Their law lives on in `docs/DECISIONS.md` §s182,
`docs/areas/CONTENT.md` and `docs/areas/PRAKTISCH-NAV.md`. (Part 4 had been sitting in this file
TWICE, once above the s183 handoff and once below it; the duplicate went with the archive move.)

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_

**Handoff after session 184 (2026-08-03): the Lebensbereich pills, in every rail.** Founder: "I want
a clear Berufswelt and Alltag pills in each and every filter or aufgabe rail through out the app
right below the Branchen filter."
- **Naming was asked BEFORE building**, because it was the only part that changed the scope: the
  prompt said "Berufswelt", the app's locked word is **Berufsleben** (s181), and one surface saying
  something different is the exact drift `lib/lifeAreas.ts` exists to stop. Founder kept
  **Berufsleben**, so nothing was renamed and the change stayed additive.
- **One shared control, `src/features/shared/LifeAreaPills.tsx`**, now in Wörter, Kollokationen,
  Redemittel and the Schreiben Kurz/Lang Aufgabe rail, on desktop rails and mobile panels alike.
  **Grammatik is the one deliberate exception:** grammar topics carry no `themeId`, so a life-area
  filter there would be dead chrome, not a filter.
- **The rail owns the slot, not the caller** (`area` prop on `FilterRail`, inserted after the
  `sector` scope, or first on a tab with no Branche dropdown), so "right below the Branchen filter"
  cannot drift per surface. Single-select that toggles off, `?area=`, pinnable, counted by the badge,
  cleared by both rails' reset.
- **Coherence is enforced, not hoped for:** picking an area narrows the Thema dropdown to that area
  AND drops a Thema from the other one, so pill, dropdown and list can never contradict each other.
  Pill counts are computed before Thema/search/facets, so the other pill never goes dead at exactly
  the moment you want to switch. In Schreiben `area` became a HARD, coarsest axis, so the two areas
  partition the 717-task pool exactly, with `blockingAxis` gaining `area` for the stale-deep-link case.
- **One visual correction during the round:** an equal-width 2-column pill grid truncated
  "Berufsleben" against a four-digit count in the 16rem desktop rail, so the pills use the
  content-sized wrapping facet-pill layout the same tile already uses two sections below.
- **Gates:** typecheck · lint 0 errors · lint:content · test:unit **506/506** (10 new) · build ·
  check:bundle 123.1 kB. Verified in a headless browser on both rails: `theme=arzt` + tap Berufsleben
  → `?area=professional` with Thema back to "Alle Themen", the Thema dropdown then listing exactly
  one heading; toggle-off, pin+collapse and reset all behave.
- **Shipped:** PR **#782**, squash-merged as `c612a5d`; `Validate content` and `Deploy site to
  GitHub Pages` both green on the merge commit, so this is live on genauly.de. The session record
  followed in PR **#783** (`f3b4395`) and the layout-index gaps it exposed in PR **#784**. Post-merge
  housekeeping done after each: branch reset onto `main`, working tree clean.
- **Not touched, on purpose:** Grammatik (no `themeId` on its topics), Sammlung (a Lv 1-5 chip row,
  not a scope rail), the Fokus grammar dials (form controls, not a content scope), and
  `libraryFocus` in `engine/session.ts` (Bibliothek Üben hands over already-filtered ids, so the
  area rides along; only hand-built `/session?…` links would need the param, and nothing writes them).
- **Worth the founder's eye on the live site:** whether "Lebensbereich" is the right section label
  (one word, matches the two pills under it), and whether Grammatik should carry the pills anyway.
  Both are small changes.


**Sessions 182 and 183 are fully archived** in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`: s182 parts 1 and 4, and, aged out by
this session, the full s183 handoff (the Prüfung icon language, PR #780). Their law lives on in
`docs/DECISIONS.md` §s182/§s183, `docs/areas/CONTENT.md`, `docs/areas/PRAKTISCH-NAV.md` and
`docs/areas/BRAND.md`.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_

**Handoff after session 185a (2026-08-04): the content-audit backlog, minus P10.** Founder, after
being shown what was left: "go ahead with all the items except for the p10." Shipped as PR **#785**,
squash-merged `863b7d4`, after resolving a docs-only conflict with the parallel 185b branch.
- **Closed outright: P9, P7, P5, P4.** P9 gave every noun a `plural` or a `numerus` and folded the
  two `pron` schemes into one documented, linted scheme. P7 re-levelled 108 items off the advanced
  bands and froze the rare-compound count with a linter ratchet. P5 took EVERY grammar topic to 10
  drills with ≥3 productive (the 21 B2/C1 topics had zero productive between them). P4 added six
  level-3 scenarios, three of them Alltag.
- **P3 is done.** Eight exam-length B2 texts shipped, all six voicemails carry `notes` fields, and
  the Notizen step itself shipped as **variante A**, which the founder picked from
  `preview/notizen-varianten.html` and then refined over three rounds. The settled shape is in
  `docs/areas/CONTENT.md` and should be treated as locked: Himmelblau message tile above a WHITE
  Notizen sheet (colours swapped on request), ruled lines rather than boxed inputs, a 40px play
  button on the title row, and identical row heights before and after "Notizen vergleichen" so the
  button underneath never moves. Final render: `preview/notizen-a-r2.html`.
- **Three things were deliberately left alone, and each is a rule, not a shortcut.** (1) The 12
  human-verified rows that P9's new checks touch: editing one breaks the content fingerprint its
  `verified` stamp is tied to, so the linter warns and they queue for the next human review. (2)
  P7's "spend the next 200 items on core verbs, adjectives and connectors" is a standing authoring
  rule in `docs/areas/CONTENT.md`, not a shippable change. (3) P10 itself, per the founder.
- **Two rules are gates now, so they cannot rot:** `tests/grammar.test.ts` asserts 10 drills + 3
  productive per topic, and `lint-content.mjs` gates noun numerus, the pron scheme and the
  rare-compound ceiling. A future pack cannot quietly re-open any of them.
- **One test fixture was rewritten, not patched.** The composer's listening test scoped to logistics
  because that theme's only text WAS a voicemail; the new logistics text falsified that. It now
  derives the theme from the bank, so adding a text anywhere cannot make it stale again.

**Handoff after session 185b (2026-08-04, parallel branch): the database architecture audit.**
Founder: "the database architecture is concerningly linear.. can you do a thorough audit and provide
your analysis with risks and recommendations?"
- **The report is `docs/reports/db-architecture-audit-2026-08-04.md`** (all 15 migrations, the 5 Edge
  Functions, `cloudSync.ts`, the admin RPCs; findings R1-R8 with per-finding status). **Verdict:**
  the "linear" schema is the correct consequence of keeping the ~5,000-id content catalog in the
  repo; the real risks were growth-shaped, not shape-shaped. Read the report for the reasoning; this
  handoff records only what changed and what is still owed.
- **The founder then said "do the four fixes", and all four shipped:**
  1. **R3, the silent sync.** The push helpers ignored the supabase-js `{ error }`, so a permanently
     failing sync was indistinguishable from a working one. They now read it, retry with backoff,
     and after 3 consecutive failures Settings shows an amber **"Sync pausiert"** with the last
     backup time and a live retry. Also added an **unknown-column retry**: the site and migration
     deploys are separate workflows, and an unknown column fails the whole upsert.
  2. **R4, retention** (`0015_retention.sql`): three weekly `pg_cron` purges, guests 90 d, dead
     transform-cache rows 60 d, learner text 730 d. Block exception-wrapped so a missing extension
     warns instead of failing the migration step and blocking the function deploys behind it.
  3. **R1, day-map caps:** `RETAIN_DAYS = 400`, dropped active days folded into `activeDaysFolded`
     (+ cloud column) so the lifetime "N aktive Tage" figure is unchanged.
  4. **R6, the idempotency gate:** `pnpm lint:migrations` + a `validate.yml` step, six rules, files
     ≤ 0014 exempt as already-applied history. Verified in both directions.
- **The one question the code could not answer went to the founder: learner text expires after
  2 years** (audit F11, now CLOSED). The job NULLs the text columns rather than deleting rows, so AI
  limits and aggregates keep working and Verlauf keeps the evaluation: the learner loses old raw
  text, never their progress record. The privacy policy was rewritten in the same change (also
  documenting the new 90-day guest rule, and dropping the sentence that had promised indefinite
  retention). Standing rule in `docs/DECISIONS.md` §s185.
- **The documentation pass then caught a real miss in that policy change and fixed it.** The rewrite
  had shipped WITHOUT bumping `PRIVACY_LAST_UPDATED_ISO` and `CONSENT_VERSION`, so a legal page
  rendered materially new retention terms under the old date. **The §G2 drift check provably cannot
  catch this:** `consentInSync()` compares the two constants to each other, so forgetting BOTH stays
  green. Both are now `2026-08-04`; the rule is written into `docs/areas/LEGAL-ADMIN.md`.
- **Still owed (see "Resume here"):** confirm `/admin → Launch` reads `retention_scheduled: true`.
- **Design:** `preview/sync-status.html`, screenshot-verified. The new state reuses the existing
  badge recipe with the warning token, so no new visual language was introduced.
- **Gates:** typecheck · lint 0 errors · lint:content · lint:migrations · test:unit **515/515**
  (9 new) · build · check:bundle 124.7 kB. **Shipped:** PR **#786** (`7fe00dd`) and **#787**
  (`f738544`), both squash-merged, all three workflows green, migration 0015 applied to the live
  database.

**Handoff after session 186 (2026-08-04): the Prüfungssimulation rework, in four merged PRs.**
Founder: the simulation "should actually feel like an exam with all the lesen, hören, schreiben and
sprechen modules with a timer and clear instructions"; picks after a preview round
(`preview/pruefungssimulation-rework.html`): **Option B start page + a Niveau row (A2 to C1),
Option C answer-sheet runner, quiet outline Zurück/Weiter (dark blue only on submission moments),
and the Schreiben expand button where useful.**
**PRs: #791** (the exam) · **#792** (exam chrome) · **#793** (the stage, no page scroll) ·
**#794** (question always visible, desktop side by side). All squash-merged; deploys green (one
Supabase run needed a re-run after an `esm.sh` 522 outage, unrelated to the code).
- **What shipped:** `engine/exam.ts` (level-aware composer + scoring; 3 Texte, 2 Ansagen max 2x,
  1 voll gebriefte Schreibaufgabe, 1 Sprechen-Szenario über die 1-3-Leiter; Bestanden ab 60 %),
  `useExamStore` (persisted run: plan ids, answers, Notizen, essay, remaining seconds; a reload
  resumes mid-part; Sprechen restarts its dialogue with full time, documented), the reworked
  `ExamHub` (Niveau row, slim full-exam card, four module cards, each startable alone, honest
  zero states), `MockExamRunner` + parts (Anleitung pages, runbar with amber-under-2-min timer,
  numbered answer strip, Hören with TTS + Notizen lines, Schreiben with fullscreen dialog +
  UmlautKeys, embedded Sprechen), and the Ergebnis screen (per-Teil bars, weakest-part Üben CTA,
  answer review). Writing is scored by `evaluate-writing`'s new **exam mode** (0-100, telc-weighted;
  `exam_score` persisted, migration 0016) and the result renormalises honestly when no score came
  back. `progress.mock_exams` syncs the runs (bounded at 100, unknown-column retry covers the
  deploy window). Tests: `tests/exam.test.ts` (9) + the full suite green; bundle 125 kB.
- **Exam chrome (founder follow-up, same session):** while a run is on screen the mobile bottom
  bar is hidden and the header's streak pill + account menu become ONE quiet muted X. It is the
  only exit (the RunBar X and the Anleitung abort link were removed with it), it confirms through
  a `danger` dialog mid-exam and closes without one on the result screen. The flag is
  `useSessionStore.examExit`, a callback rather than a boolean so eager `AppShell` never imports
  the exam store (bundle held at 125.7 kB). Not the same thing as focus mode, which hides the
  header too; both are documented in `docs/areas/PRAKTISCH-NAV.md`.
- **No page scroll inside the exam (founder follow-up):** a running Teil is a STAGE, not a
  document. `main` becomes `h-exam-stage` tall and every part pins its RunBar, answer strip and
  actions around one internally scrolling region. Audited by driving the real build at 393x852,
  375x667 and 360x640: all ten in-exam screens (hub-to-Ergebnis) rest at **0 px** page overflow.
  The hub itself still scrolls ~150 px on a 667 px phone and is meant to: it is a menu, and the
  least-scrolling hub in the app (`/anwenden` 237 px, Praktisch 253 px at the same size).
- **The question tile is never what shrinks (founder follow-up, #794).** Sharing one scroll region
  buried it under a long text. Now the text (Lesen) and the Notizen sheet (Hören) are the elastic
  tiles and the question keeps its natural height, verified fully visible for **every** question
  (9 Lesen + 6 Hören) at all three phone sizes. Three rules make it fit and are load-bearing: no
  "Aufgabe N von M" eyebrow on the question card (the centred number strip says it), "Teil
  abschließen" only on the LAST question once everything is answered (it replaces Weiter; the
  permanent submit row cost every screen ~52 px), and a `gap-1` strip so nine numbers hold one row
  at 360 px. **Desktop lays the two tiles side by side** (3/5 + 2/5, Schreiben mirrored) and exam
  chrome additionally hides the sidebar and the Feedback pill there, which overlapped the Weiter
  button; the header mark becomes a non-clickable `Logo`, since navigating away would end the run.
  Known limit, accepted: on 375/360-wide phones the reading pane can fall to ~2 lines for the
  tallest questions (it scrolls; the expand button reads full-screen). Giving it more would mean
  shrinking the question tile, which is the thing this guarantees.
- **Content gaps this exposed (PROJECT_REFERENCE backlog):** A2 has NO exam content anywhere (the
  A2 Niveau pill shows an honest empty state), and C1 Hören has a single audio text, so it tops up
  from B2.2. Both need an authoring wave before those levels feel native.
- **Verify live after merge:** run one full B2 exam end to end (Hören audio is device TTS; the
  Schreiben score needs the deployed function + migration).
- **Next, if the founder does not redirect:** the **queued writing-task quality audit** below is
  still the oldest open item. The exam's own next steps, in the order they would pay off: the A2
  and C1-Hören content waves (`PROJECT_REFERENCE` → CONTENT GAPS), then a Fortschritt tile reading
  `progress.mock_exams` (the data is synced but nothing plots it yet), then per-Teil exam history.
  Nothing is half-built: every part of the exam ships complete.


**Handoff after session 187 (2026-08-04): the exam polish round + the app-wide dark palette.**
Founder feedback on the shipped Prüfungsteil (7 numbered points across the session), answered with
ONE interactive preview and then implemented from their picks. **What shipped:**
- **Dark palette "N3 Slate", app-wide** (`src/index.css` `.dark` + `--wash-a`/`--wash-b` read by
  `bg-page`/`bg-mesh`): near-neutral greys, no coloured page radials in dark, blue only where it
  acts. Contrast steps are the founder-confirmed "K2" relationships (card/ground 1.38:1,
  edge/ground 3.03:1, nested-in-card 1.20:1). `pnpm check:contrast` green.
- **Corner scale "tighter"**: `--radius: 0.5rem` + tightened ± steps in `tailwind.config.ts`
  (card 10px, row 8px, pill 6px, `2xl` 14px). Affects every surface, on purpose.
- **The exam screen** (`src/features/exam/McParts.tsx`, rewritten): the question has no tile, one
  card per screen, content-tall blocks centred in the stage, the number strip in the bottom cluster
  with 16/12/16 px of air, drag-resize on both axes with arrow-key steps and a reset on every
  question change, fade-out on both scroll regions, `pb-safe-4`.
- **The exit** (`AppShell`): red `LogOut`, icon-only on a phone, icon + "Verlassen" from `sm` up.
- **The answered number** (`AnswerStrip`): `text-foreground` on the Himmelblau tint, not
  `text-accent-ink`.
**Verification:** a Playwright driver walked the real build over 225 in-exam screens (1440x900,
1024x768, 393x852, 375x667, 360x640 × Lesen + Hören × three fresh draws): 0 px page overflow
everywhere, question fully visible on every screen, no console errors, light and dark.
**Docs updated in the same PR:** CLAUDE.md (dark palette + corner law, and the English rule),
`docs/areas/BRAND.md` (tokens, radius scale), `docs/areas/PRAKTISCH-NAV.md` (exam anatomy, the
`max-h-full` geometry trap), `docs/DECISIONS.md` §s187, the `/design` skill (English previews, never
mark a recommendation, the new palette + corners).
**Next, if the founder does not redirect:** the queued writing-quality audit is still the oldest
open item, then the A2 / C1-Hören content waves, then a Fortschritt tile over `progress.mock_exams`
(synced but unplotted) and per-Teil exam history. Nothing from this session is half-built.

**Nothing is owed from s185b any more.** The founder verified `/admin → Launch` on 2026-08-04: it
shows the green **"Aufbewahrungs-Job (pg_cron) ist geplant"**, so pg_cron was available and all three
weekly purges (guests 90 d · transform cache 60 d · learner text 730 d) really are scheduled, not
merely installed. The same screenshot confirms the Consent-Version card green and **im Gleichschritt
at 2026-08-04**, so the legal-date fix is live too.

**The content audit is closed except P10.** s185a shipped P9, P7, P5, P4 and P3; the per-item record
is in `docs/reports/CONTENT_AUDIT_2026-07-30.md` §5. Three smaller follow-ups sit behind it:
**P10** itself (0.4% human-verified; the audit's plan is the ~320 highest-traffic items first), the
**12 verified nouns** that need a `numerus` at their next review (`pnpm lint:content` names them
every run, by design, see `docs/DECISIONS.md` §s185), and a live check of the **Notizen step** in a
real listening exercise, which is the one thing that could only be verified by rendering.

**Then start with the queued quality audit (founder, s181, not started):** a thorough analysis of
**writing-task quality and filter fit**, with research from reliable sources. s181 proved COVERAGE
(717 tasks, gated); nobody has verified that a task tagged B1 reads as B1, that its Leitpunkte are
answerable in the word target, or that the Branche framing convinces someone who works in that
industry. Deliverable: a report in `docs/reports/` with a prioritised fix list, like the s178 content
audit. **Full scope, the parked exam-source items, and the locked Niveau mix (B1 307 / B2 302 /
C1 108, do not rebalance) are all in `docs/PROJECT_REFERENCE.md` → "QUEUED (founder, s181)".**

**Handoff after session 188 (2026-08-04): the Modelltest hub (branch `claude/page-redesign-7md2zi`).**
Founder: "re-do this page" (a dark screenshot of `/exam`), then "go with B" plus two amendments.
**What shipped** (`src/features/exam/ExamHub.tsx`, rewritten; `partMeta.ts` gained a solid `bar`
colour per Teil):
- **The run leads.** One band: eyebrow + countdown, the four Teile as a connected timeline (one
  absolutely-positioned line inset to the first and last tile centre, masked by a `border-surface`
  ring), then the CTA on its own divided row. This is what removes the s186 duplication of
  "4 Teile · 52 Min" above four cards each printing their own minutes.
- **Results live only in Verlauf** (founder amendment): the last 5 runs for the selected Niveau, a
  row being date · four result segments in exam order · total badge · chevron, whose disclosure
  holds the four per-Teil percentages. A single-part run leaves three tracks empty and prints "–".
- **"Modelltest"** replaces "Prüfungssimulation" as the page name (founder amendment), one word,
  and the `/anwenden` entry card + the nav zone description were renamed with it. Content ids and
  provenance labels are untouched.
- **No HubHero** (founder amendment): `h1` + the Niveau sliding-pill switcher (`useSlidingPill`) on
  one line, full width on a phone.
- **The countdown** (`settings.examDate`) moved onto this page and retires itself once the date has
  passed. The A2 zero state states itself once per control; the page-level sentence was dropped.
**Verification:** the real build driven over a CDP script (no Playwright in this repo) at 1280x900,
390x844 and 360x640, light + dark, A2 and B2, Verlauf open and closed: 0 px horizontal overflow, no
console errors, the hub scrolls ~220 px on a phone, which is what a menu does.
**Follow-up in the documentation pass:** the rename had one leftover the redesign did not touch.
The Sprechen bank's exam sets are titled "Prüfungssimulation: <Aufgabe>" and are CONTENT (provenance
rows, human-verified stamps), so they were not rewritten; `examSetTitle()` in
`features/exam/partMeta.ts` strips the prefix at every render instead, which the mock-exam runner
had been doing inline and the Sprechen runner had not been doing at all. Verified in the real app:
the runner header now reads "Sicherheitsmängel beheben".
**Docs updated:** CLAUDE.md (route name + the one-place-per-result law),
`docs/areas/PRAKTISCH-NAV.md` (the hub anatomy), `docs/DECISIONS.md` §s188, the `/design` skill (the
Modelltest anchor), this file and the prompt log. The preview stays in
`preview/exam-hub-redesign.html` as the record of the round.
**Next, if the founder does not redirect:** unchanged from s187 (the queued writing-quality audit,
then the A2 / C1-Hören content waves, then a Fortschritt tile over `progress.mock_exams`). One item
this session made cheaper: per-Teil exam history now has a real surface to grow into.

**Nothing is owed from s185b any more.** The founder verified `/admin → Launch` on 2026-08-04: it
shows the green **"Aufbewahrungs-Job (pg_cron) ist geplant"**, so pg_cron was available and all three
weekly purges (guests 90 d · transform cache 60 d · learner text 730 d) really are scheduled, not
merely installed. The same screenshot confirms the Consent-Version card green and **im Gleichschritt
at 2026-08-04**, so the legal-date fix is live too.

**The content audit is closed except P10.** s185a shipped P9, P7, P5, P4 and P3; the per-item record
is in `docs/reports/CONTENT_AUDIT_2026-07-30.md` §5. Three smaller follow-ups sit behind it:
**P10** itself (0.4% human-verified; the audit's plan is the ~320 highest-traffic items first), the
**12 verified nouns** that need a `numerus` at their next review (`pnpm lint:content` names them
every run, by design, see `docs/DECISIONS.md` §s185), and a live check of the **Notizen step** in a
real listening exercise, which is the one thing that could only be verified by rendering.

**Then start with the queued quality audit (founder, s181, not started):** a thorough analysis of
**writing-task quality and filter fit**, with research from reliable sources. s181 proved COVERAGE
(717 tasks, gated); nobody has verified that a task tagged B1 reads as B1, that its Leitpunkte are
answerable in the word target, or that the Branche framing convinces someone who works in that
industry. Deliverable: a report in `docs/reports/` with a prioritised fix list, like the s178 content
audit. **Full scope, the parked exam-source items, and the locked Niveau mix (B1 307 / B2 302 /
C1 108, do not rebalance) are all in `docs/PROJECT_REFERENCE.md` → "QUEUED (founder, s181)".**


**Handoff after session 190 (2026-08-05): six Bibliothek defects after the internal-scroll change
(branch `claude/card-transparency-go-to-top-jygye9`).**
Seven founder prompts, every one a defect report with a screenshot, against what PR #800 shipped the
day before. No preview round: these were bugs in an already-approved surface, so each was reproduced
in headless Chromium against the dev server, measured, fixed and re-measured.
**What shipped:**
- **`useScrollDirection(root)` + `ScrollTopButton root=`** (`features/shared/browseScroll.tsx`): the
  hook reads whichever element actually scrolls, and the column only counts while it overflows,
  which is false below `lg`. This is what brings the desktop go-to-top button back. Placement
  unchanged and re-measured against the founder's s189 rule: button left edge 1000 px = the rail's
  left edge, Feedback pill right edge 1256 px = the rail's right edge.
- **`useEdgeFade` + `.mask-fade-y|-top|-bottom`**: the scroll column fades at whichever vertical edge
  still has content, instead of slicing a card in half. A mask rather than an overlay, because the
  page ground is a gradient and a flat overlay would band in light and grey out in dark.
- **`BROWSE_TOOLBAR_BUTTON_ON`**: the ON state for the search and bookmark toggles, applied after
  the base class so the fill wins the tailwind-merge. They were white-on-white, i.e. invisible.
- **`lg:self-start` + `lg:max-h-[calc(100%-3.5rem)]` on all four rails**: content-sized, capped
  against the stage, and clear of the floating bottom line.
- **`src/lib/inputMode.ts` (new) + one rule in `index.css`**: the focus ring is keyboard-only.
- **Redemittel card parity**: front headline capped at 3 lines, every BACK part at 2, each with a
  `title`. 272 → 188 px against Kollokationen's 195.
**Audit the founder asked for (prompt 6):** every s189 feedback item re-verified in the browser, not
read off the log. Live and correct: the Redemittel **Beispiel** column, the horizontal-scroll fades,
internal scroll with the page unscrollable on all four tabs, the 30 px toolbar row, the
Feedback/go-to-top docking, the Wörter three-column grid. The only item still open from that list
was the card-height parity, now closed.
**Verification:** 1280x900 across all four tabs (rail open + collapsed, search open, mid-scroll) and
390x844 for the mobile fallback, where the page still scrolls, the button stays centred above the
Üben bar and no mask applies.
**Next, if the founder does not redirect:** unchanged from s188 below. One thing to watch: the
`3.5rem` reserve on the rail is tied to the floating bottom line's geometry, so if that cluster ever
moves, the reserve moves with it.
