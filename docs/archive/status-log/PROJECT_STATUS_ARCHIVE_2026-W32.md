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
