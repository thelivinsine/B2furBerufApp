# Project Status

_Last updated: 2026-08-05 (session 190). **The Prüfung zone was polished to a finished product.**
Founder: the two tabs "still look cheap or like MVP", make them read like "a billion dollar edu tech
app". Analysis first (twelve findings), three options previewed, then a second round on the pick:
the founder took **B "Prüfungstag"**, **V2 "Zahl und Kurve"** for the Modelltest Verlauf and
**M3 "Stärkeprofil"** for a NEW Module üben Verlauf.
**What shipped.** ONE 896px frame for both tabs (they had different widths, so the page jumped on
every switch), a height-stable scope row, the Bibliothek's directional tab slide, in-family gradient
mark tiles, and a module card that reads as a button: mark top-left, arrow top-right, the module's
hue washed into the bottom-right corner, and **that corner RESERVED in both clock states**, so the
Mit Zeit badge appears without moving a card edge (the founder's first amendment). The Modelltest
band becomes a two-column ticket from `lg` (52 Min as a display figure, countdown and CTA left, the
four Teile as a ladder right) and states the total once per breakpoint. Modelltest's Verlauf now
leads with the last score and its delta, with Bester/Bestanden as supporting stats and the last seven
runs as bars against the 60 % pass line; Module üben's is a Stärkeprofil where the pale segment is
the first attempt and the solid cap the gain since. **A Modelltest is a run that sat all four parts;
a run that sat one is module practice** (`isFullRun`/`toPractice`, 7 new tests) — before this a
single Lesen drill counted as a Modelltest result and its score landed in "Bester". Dash tables are
gone: an unscored run says "Noch keine Bewertung" and its row says "Nicht bewertet".
**Verified by driving the real build over CDP**, not by reading mockups: 14 states across
1280×900 / 1440×900 / 1024×820 / 834×1112 / 393×852, light + dark, both clock states, expanded,
first visit, unscored and A2, each reporting `scrollHeight` vs `innerHeight`. That is what caught the
four bugs the mockups could not: the desktop Module tab scrolled at rest (930px against 780px of
room, fixed by splitting that Verlauf into summary | rows from `lg`), the switcher stretched the full
column on an 834px tablet, the run band stretched to 800px on a tall tablet (filling the stage is a
PHONE rule now), and M3's dotted "first attempt" marker was invisible over a saturated fill.
Gates green: build · typecheck · lint 0 errors · 558 tests · check:bundle 125.8 kB · check:contrast.
Shipped as **PR #801**, squash-merged into `main`.
**Resume here:** nothing is open in the Prüfung zone. The one deliberate open question from s189
still stands (below).
Prior s189 (2026-08-05). **The Prüfung zone became ONE page.** Founder prompt:
"this page should be redone. insert a toggle in place of the current header, similar to Bibliothek
... Module wide practice and model test as the two options". The three-card `/anwenden` hub and the
`/exam` Modelltest page folded into a single page whose header IS a two-segment sliding-pill
switcher: **Module üben** | **Modelltest**. `/exam` redirects into it.
Two preview rounds settled it (`preview/pruefung-hub-redesign.html`, `-r2`); the founder picked
layout **A "Kompakt"**, the **Modern** module marks in **Rezeptiv / Produktiv** colours, and kept
the zone name **Prüfung**.
**Module üben** is the four modules as identical cards, and the free Schreib- and Sprechtrainer
merged INTO them (founder pick "idea 3"): **Mit Zeit / Ohne Zeit** is one switch beside Niveau,
**resting on Ohne Zeit**, so Schreiben ohne Zeit opens `/writing`, Sprechen ohne Zeit
`/simulation`, and Lesen/Hören run the same drill `untimed` (no tick, no timer pill, never
auto-handed in). The separate "Freies Üben" block is gone with it. "Einzeln üben" is gone from the
Modelltest tab: it IS this tab now.
**Modelltest** is the run band plus Verlauf and nothing else. Verlauf rests OPEN, leading with three
centred figures (Letzter · Bester · Bestanden), and the timeline connector is now one segment per
gap drawn BETWEEN the tiles (founder: "should not overlap the icons").
**The session also set an app-wide law: the expand rule.** A page rests at zero scroll
(`.h-page-stage`); expanding a tile releases that cap; the expanded tile is never taller than one
screen (`.max-h-panel-stage`) so its own borders stay visible; ONE inner region scrolls and hands
the scroll on to the page at its top; and `useStagePanel` scrolls it into view with scroll margins
for the header and bottom bar. Verified by driving the real build over CDP at 393x852: at rest
`scrollHeight === innerHeight`; with 20 runs expanded the tile measures 692 px inside an 852 px
viewport, top 80 / bottom 772 (the bar starts at 789), and its list scrolls 859/547 internally.
Gates green: typecheck · lint 0 errors · 551 tests · build · check:bundle 125.8 kB · check:contrast.
Shipped as **PR #799**, squash-merged into `main`.
One question is deliberately open from that session: `FilterRail`'s mobile panel keeps its own
`max-h-[45dvh]` cap instead of the new one-screen `max-h-panel-stage`; ask the founder before
changing an approved surface.
Prior s188: the Prüfungssimulation hub was re-done and renamed **Modelltest** (founder pick
"Prüfungstag"): the page led with the run band, then "Einzeln üben", then Verlauf as the one place
a result is shown. s189 kept the band, the one-place rule and the countdown, and moved the rest.
Prior s187: dark mode became near-neutral ("N3 Slate", ground `220 15% 4%`, cards `220 10% 17%`,
page radials off in dark), the corner scale tightened (`--radius` 0.5rem → card 10px, row 8px,
pill 6px), and the running Prüfungsteil got its polish round (no tile on the question, drag-resizable
blocks, the number strip beside Zurück/Weiter, a red exit), verified over 225 in-exam screens.
Prior s186: the Prüfungssimulation became a real four-part mock exam (Lesen, Hören, Schreiben,
Sprechen) in four PRs (#791-#794), with per-Teil timers, an answer-sheet strip, the one-viewport
exam stage and a result screen with a 60 % pass line.
Prior s185: **The content-audit backlog is down to one open item.**
The founder asked for every remaining action except P10 (human verification), and P9, P7, P5 and P4
are closed outright, and so is P3 now that the founder picked and refined the Notizen step.
P9: every noun declares `plural` or `numerus` (329 had neither), and the `pron` respelling is ONE
documented scheme with a linter gate instead of two schemes split by authoring wave.
P7: 108 items re-levelled off the advanced bands, so the B1 half is **36%** of the bank (was 30%)
and verify:cefr FLAG went 10 → **0**; a linter ratchet freezes the rare-compound count at 334.
P5: **every** grammar topic now has 10 drills with ≥3 productive (bank 195 → **320**, productive
19% → **33%**); the 21 B2/C1 topics had zero productive drills between them.
P4: six level-3 scenarios, three of them Alltag, so the ladder is **13/15/8** not 13/15/2.
P3: eight exam-length B2 texts (288-333 words), chosen so every domain has ≥2; gesundheit and
bildung had none. All 6 voicemails carry `notes` for a Notizen task, and the founder picked
**variante A** for the learner-facing step, which shipped after three rounds of feedback (bigger
write lines, a 40px play button instead of a tall tile, ruled lines instead of boxes, tile colours
swapped, row heights locked so the button never jumps). **The whole audit backlog is closed except
P10**, which the founder deferred.
**The same session also ran a database architecture audit and shipped four of its fixes**, on a
parallel branch (#786, #787).
That work: Report: `docs/reports/db-architecture-audit-2026-08-04.md`. Verdict: the linear
shape is deliberate (content lives in the repo; the DB holds only per-learner state + ops), but six
growth/sync risks were found. Four shipped the same session: a **failed cloud write is no longer
silent** (Settings shows "Sync pausiert" with a retry), **retention jobs** purge abandoned guest
accounts and dead cache rows on pg_cron (migration 0015), the **day maps are capped at 400 days**
with the lifetime figure preserved, and **`pnpm lint:migrations`** gates migration idempotency.
Learner writing now expires after **2 years** (founder decision, asked because the privacy policy
promised the opposite), which closes security-audit finding F11. Still open by design: the `srs`
per-card table and the admin analytics rollups.
Prior s184: **Every filter and Aufgabe rail now carries the
Lebensbereich pills, Berufsleben · Alltag, directly below Branche** (Wörter, Kollokationen,
Redemittel, Schreiben Kurz/Lang; Grammatik is excluded on purpose, its topics carry no Thema). One
shared `LifeAreaPills` control, `?area=` in the URL, and the pill narrows the Thema dropdown and
drops a Thema from the other area so the three controls can never disagree.
Prior s183 and older (Prüfung icon language, the s182 audit items and the five-slot nav, the
Schreiben Aufgabe backlog, hard filters, the security audit, liveWork): condensed away on purpose,
per the doc-hygiene rule below. Read them in `docs/archive/status-log/` by ISO week.
`docs/plans/SCHREIBEN-OVERHAUL.md` carries the writing-content roadmap.
`.github/workflows/supabase.yml` deploys Edge Functions on merge, so backend changes no longer need
a CLI. Product name: **Genauly** (`genauly.de`)._

This is the **lean, living** status doc: current state plus the two most recent session handoffs.
**Start at the `## Resume here (next session)` section at the end.** Companion files:
- **`docs/PROJECT_FOUNDATION.md`** — the stable technical baseline that rarely changes: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra, and completed founder
  action items. Read it when you need the "what's built and how" detail that used to sit here.
- **`docs/PROJECT_REFERENCE.md`** — stable reference: the founder backlog, product-evaluation
  findings, per-session model guidance, and reusable research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked UX decisions.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only session-log history,
  chunked by ISO week under `docs/archive/status-log/`.
- **`../CLAUDE.md`** — the lean always-on operating rules (restructured s155, ~180 lines); deep
  per-area detail lives in **`docs/areas/`** (COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN,
  PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN, COMPONENTS) + the `/design` and `/content` skills.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

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

**Handoff after session 190 (2026-08-05): the Prüfung polish round (branch
`claude/polish-ui-ux-design-92sbje`).**
Founder: "still look cheap or like MVP ... I want them to look highly polished, excellent UI/UX, like
a billion dollar edu tech app", then "V2 and M3 ... take screenshots during the testing phase and
optimize and polish the spacing ... without any bugs".
**Process:** analysis in chat first (no code touched), three named options previewed
(`preview/pruefung-polish.html`), a second round on the pick (`preview/pruefung-polish-r2.html`,
artifact https://claude.ai/code/artifact/fd7d867c-39e0-4f7d-9525-3d64270b6e04, redeployed to the same
URL), then implementation verified against the REAL app.
**What shipped** (`src/features/pruefung/PruefungHub.tsx` rewritten; `partMeta.ts` gained
`wash`/`fillPale`/`fillSolid` and gradient `tile`s; `index.css` gained `.mod-wash-*` + `.mod-go`):
- One 896px frame for both tabs, a fixed-height scope row, the Bibliothek's `popLayout` tab slide.
- The module card: mark + arrow row, title, description, the hue wash in the bottom-right corner and
  that corner reserved by the card's bottom padding, so Ohne Zeit / Mit Zeit never resizes anything.
- The run band: a two-column ticket from `lg`, today's stacked band below it, `flex-1` on phones only.
- Modelltest Verlauf **V2**: display figure + delta chip, Bester/Bestanden as stats, seven bars
  against the pass line (named in the caption, never on the chart).
- Module üben Verlauf **M3**: four columns on one scale, pale = first attempt, solid = the gain;
  split into summary | rows from `lg`, which is what keeps a 1280×900 laptop at zero scroll.
- The `mockExams` split into full runs vs single-module practice (`tests/pruefungHub.test.ts`).
**Verification tooling** lives in the session scratchpad, not the repo: a ~60-line CDP driver
(Node 22's built-in WebSocket, no new deps) that seeds localStorage, sets a viewport, clicks by
button text, screenshots, and prints `scrollHeight`/`innerHeight`. Worth rebuilding next time a
surface has to be checked in the real app rather than in a mockup.
**Nothing is left open in this zone.**


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
