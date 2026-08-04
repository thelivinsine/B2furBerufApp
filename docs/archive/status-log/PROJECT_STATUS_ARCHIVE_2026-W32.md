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
