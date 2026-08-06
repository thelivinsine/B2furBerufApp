# Project Status

_Last updated: 2026-08-06 (session 197 replaced the s196 Prüfung header title with founder pick C:
the switcher as the page header and ONE 40rem column for the whole page; see "Resume here")._

## Session 197 log

Founder: "in one of the previous sessions, I asked sonnet to replace the hello greeting with the
page's name as a header ... But it created this funny looking page ... It is looking ridiculous at
the moment", then "C, medium".
**The Prüfung hub has ONE column now and no page title.** s196 had read "aligned to left vertically
with the toggle buttons" as the APP header's left gutter, which is a different left edge from every
control it was meant to line up with; the page under it nested three separately centred widths, so
nothing shared an edge with anything. A preview round
(`preview/pruefung-header-align.html`, artifact
<https://claude.ai/code/artifact/77b2bdcf-aa2d-431d-a45a-cd6ea9d16c49>) offered A (title in the
page), B (title in the header, page moves to its edge) and C (no title, the switcher IS the page
header, as in the Bibliothek). The founder picked **C at 640px**: the app header's greeting slot
stays empty on this route, and one `HUB_COL` (`max-w-[40rem]`) carries the switcher row, the scope
row, the module grid and the Verlauf card. The tile grid and the Stärkeprofil dropped their own
caps, because the column was measured from the TILES rather than the page.
**Full detail in "Resume here" below**, including the two resting scrolls this deliberately did not
fix and the CI/Pages situation around the merge. The "why" is in `docs/DECISIONS.md` §s197.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · **Prüfung** · Fortschritt, s182: Schreiben moved into the Prüfung hub),
the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-08-01, session 182, measured against the live banks — re-verify with
`pnpm lint:content` before quoting):** vocab **1,743** (**1,733 browsable**; 8 mis-filed noun+verb combos
retired in s142 + 2 true duplicates retired in s178, ids kept) · collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **32 topics / 195 drills** (18 groups; 37 productive, s182) · Lese-/Hörtexte **42** (126 checks) ·
writing tasks **717**, every one servable (s181) in 20 pools ·
Can-Do **57** · dialogues **30** (178 nodes, 335 options; every scenario ends in a free-speak turn since s182) · exam sets **15** · missions **6** ·
provenance **3,432 rows** (four concatenated parts since s182, TS2590) · themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,419 of 3,432 provenance rows are AI-drafted `draft`**; only **13** are
human-verified (13 vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset to restart the
review pass; see `strategy/DATA_GOVERNANCE.md`). The full picture of what the banks do and do not
cover is `docs/reports/CONTENT_AUDIT_2026-07-30.md` (session 178).

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

**Handoff after session 197 (2026-08-06): the Prüfung hub got ONE column and lost the s196
header title (branch `claude/page-header-alignment-glqts5`).**
Founder, with the same `/anwenden` screenshot: the s196 change "created this funny looking page ...
It is looking ridiculous at the moment", and asked for previews of how the page should look overall
before anything was built.
- **The diagnosis.** s196 read their "aligned to left vertically with the toggle buttons" as the APP
  header's left gutter, which is a different left edge from every control it was meant to line up
  with. Underneath, the page nested THREE separately centred widths (`lg:max-w-4xl` panel column,
  `max-w-[30rem]` module grid, `max-w-[26rem]` Stärkeprofil), so the tiles started ~220px right of
  the title and a narrow tile island floated over a full-width Verlauf card.
- **Round 1, previews only** (`preview/pruefung-header-align.html`, generator beside it, artifact
  <https://claude.ai/code/artifact/77b2bdcf-aa2d-431d-a45a-cd6ea9d16c49>): the diagnosis at today's
  real measurements, then A (title inside the page), B (title stays in the header, the page moves to
  its left edge) and C (no title, the switcher as the page header). Live Theme / Column width /
  Alignment-guide switches, light and dark, a desktop and a phone frame each.
- **Founder picked "C, medium".** Built exactly that: `AppShell` no longer renders a title or a
  second switcher copy (its greeting slot stays EMPTY on this route, which is the part of s196 that
  survives), the hub's switcher is its header at every width, and ONE `HUB_COL` (`max-w-[40rem]`)
  carries the switcher row, the scope row, the module grid and the Verlauf card. The grid and the
  Stärkeprofil lost their own caps: the column was measured from the TILES instead, so they keep the
  shape s196 asked for without a cap that breaks the page's edges.
- **Three details the narrower card forced:** the Verlauf's split is proportional now
  (`1.15fr / 1px / 1fr`, not a fixed 26rem half); its four profile labels put the mark ABOVE the
  name at every width (side by side, "Schreiben" pushed through the divider into the list); and the
  practice row uses one padding and one gap at every width, because at `sm:gap-4 lg:px-6` it had
  exactly 0px spare and the score badge wrapped its "%" while the module name truncated.
- **Empty Verlauf.** The Stärkeprofil columns are half height while empty (`h-6 sm:h-8`), with a
  one-line caption: at full height four grey slabs at "–" read as a failed render.
**Verified in the real built app** (Playwright over the global Chromium, seeded store, not a
mockup): at 1440×900, 1440×760, 1024×850, 1023×850, 390×844 and 360×640, both tabs, empty / practice
/ full history, the panel, the module grid and the Verlauf card report the SAME left edge and the
same width at every size. Zero resting page scroll and zero horizontal overflow, except two bands
that scroll on `main` too and were measured before and after: 1023×850 rests at 54px (unchanged) and
360×640 at 43px (63px before this change).
Gates: typecheck · lint 0 errors (77 warnings) · 624 tests · build · check:bundle 127.9 kB of 400
(down from 129.0: AppShell dropped its `hubSwitcher` import) · check:contrast.
Shipped as **PR #817**, squash-merged into `main` as `a2ad467`.
- **CI never ran, so every gate was run locally instead.** GitHub Actions scheduled nothing for this
  repo across the whole window: no check registered on PR #817, no `Validate content` run was
  created for the branch, and the `Validate content` run for the previous merge (#816, on `main`)
  was **cancelled after 15 minutes without ever starting**. Before merging, `validate.yml`'s full
  list was run here in its own order (`lint:content` · `lint:migrations` · `check:contrast` ·
  `verify:facts` · `test:srs` · `test:pronounce` · `lint` · `test:unit`), all green. Note
  `verify:facts` rewrites `docs/reports/verify-facts-report.json` with today's date every run; that
  timestamp-only diff was reverted, not committed.
- **The Pages deploy needed the documented workaround.** #816's deploy job self-cancelled at exactly
  15 minutes (`build` green in 60 s, `deploy` 16:24:20 → 16:39:26) — the 600 s timeout diagnosed in
  s196 — and its leftover is the likeliest reason no deploy run was created for this merge at all.
  Dispatched `pages.yml` on `main` manually; it built `a2ad467` and **succeeded** (run
  31128920435), so the change is live.
**Resume here:** three known-open things, none of them blocking.
1. The two pre-existing resting scrolls above (1023×850 at 54px, 360×640 at 43px). Both come from
   the Verlauf card being `flex-none` at rest, so it cannot give room back when the stage is short;
   fixing it means letting the collapsed list scroll inside the card, which touches the s195/s196
   Verlauf behaviour and was left for the founder to ask for rather than assumed.
2. The Modelltest tab's EMPTY Verlauf is a tall card with a small empty state in it (the s195 "fills
   the frame" rule), and the narrower s197 column makes that more visible. Offered, not changed.
3. **`pages.yml`'s `timeout` is still 600 s** and has now cost three sessions. The fix agreed in
   s196 (raise to ~30 min, keep the 3-attempt retry) is a one-line change waiting for a go-ahead.

**Handoff after session 196 (2026-08-06): fixed a desktop scroll regression in the Prüfung hub
and gave it a real page header (branch `claude/prufung-hub-layout-ffco93`).**
Founder, from a desktop screenshot of `/anwenden`: the page scrolled, the bottom Verlauf tile
"looks unnecessarily big", the four module tiles "look empty" (too wide), the arrow and minutes
badge should swap corners, and the "Guten Morgen" greeting space should become a big left-aligned
header like the zone's own nav label, sitting next to the toggle buttons.
- **The scroll.** `h-page-stage` (every trainer's shared zero-scroll stage class) goes
  `height: auto` from `lg` up, on the assumption desktop has no shortage of room. This hub's
  Verlauf card had grown past that assumption: at a real laptop height (900px minus browser chrome
  is often 750-800px usable) the page overflowed. New `.h-pruefung-stage` (`src/index.css`) keeps
  the mobile/`sm` formula `h-page-stage` already had and borrows `h-browse-stage`'s desktop formula
  for `lg` instead of `auto`. Verified scroll-free at 1440×760, 1440×900, 1024×850 and 390×844,
  both tabs, light and dark, with and without run history.
- **The tiles.** `ModuleGrid`'s wrapper is now capped at `max-w-[26rem]`/`sm:max-w-[30rem]` instead
  of stretching to the column, so the four cards read closer to square. The minutes badge (Mit
  Zeit only) moved from the bottom-right corner to beside the icon in the top row; the arrow moved
  from beside the icon to the bottom-right corner it vacated. Card height no longer needs a
  clock-mode-driven reservation: the icon alone sets the top row's height either way, and the arrow
  shows whenever the module can open, in both clock states.
- **The Verlauf tile.** Trimmed the elements that carried most of its height for little
  information: the Stärkeprofil bars (`h-24`→`h-16` desktop), the run chart (`H=68`→`52`), the
  display score (`2.5rem`→`2rem`), and several paddings.
- **The header.** From `lg` up, `AppShell` shows a big left-aligned "Prüfung" `h1` beside the
  Module üben/Modelltest switcher, in the slot the generic greeting used to fill; below `lg` the
  hub keeps its own switcher unchanged. New `features/pruefung/hubSwitcher.tsx` holds the switcher,
  the `Tab` type and `usePruefungTab` (a `?tab=` reader/writer), so both switcher copies drive the
  same URL param and `AppShell` never has to import `PruefungHub.tsx` itself — that file pulls in
  `engine/exam` and the content banks behind it, which would break the keep-eager-code-light
  invariant (AppShell mounts on every route). Confirmed by clicking the header copy's tab buttons
  over CDP and reading the resulting URL/panel.
Gates: typecheck · lint 0 errors (unchanged warning count) · 610 tests (unchanged) · build ·
check:bundle 129.0 kB of 400 · check:contrast.
Shipped as **PR #813**, squash-merged into `main`.
- **Post-merge: the Pages deploy failed, twice looked like the code but wasn't.** Founder saw a red
  "Deploy site to GitHub Pages" run right after the merge and asked to check it. The `build` job
  (typecheck, `pnpm build`, artifact upload) was green; only the `deploy` job's calls into GitHub's
  Pages API failed, each of the workflow's 3 built-in retries independently stuck in
  `deployment_queued` for the full 10-minute timeout before aborting. A platform-side stall, the same
  class of issue this repo hit once before (2026-07-04, noted in `pages.yml`'s own comments).
  Founder asked whether a same-day parallel session (PR #812, open, unmerged) could be the cause;
  ruled out by checking `git log origin/main` (unchanged since this PR's merge) and confirming
  `pages.yml` only triggers on a push to `main`, of which there was exactly one in the window.
  Re-ran the failed `deploy` job (`rerun_failed_jobs`); it succeeded on its first internal attempt
  ~47 minutes after the original push, once the platform recovered. **Founder confirmed the site
  live at `genauly.de`.** Nothing in the app or the workflow needed changing.
  **One real, unrelated finding surfaced along the way:** because this PR merged first, PR #812
  showed `mergeable_state: "dirty"` against `main` (both sessions touched overlapping Prüfung-area
  docs). Correctly flagged rather than fixed here; the #812 session then resolved it by merging
  `main` in and keeping both sessions' facts in every conflicted doc.
**Resume here:** nothing is open. The greeting→title swap is scoped to `/anwenden` only; the
founder's other example ("Bibliothek") read as illustrative of the pattern rather than a request
to retitle that page today. `navItems` already carries every route's label if that changes.

Older "Resume here" handoffs (s195 and earlier) are archived alongside their status-log entries in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
