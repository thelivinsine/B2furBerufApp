# Project Status

_Last updated: 2026-08-05 (session 190). **A defect session on the Bibliothek, all six items from
the founder's own screenshots, all measured in a browser rather than guessed.** Five of them trace
to one change: s189 moved the desktop scroll from the page into the content column.
**Go to top** was reading `window.scrollY`, which no longer moves on desktop, so the button never
appeared (mobile still worked, which is why it read as "missing"); `useScrollDirection(root)` now
reads whichever element actually scrolls, and the placement is the founder's s189 rule, measured:
button at the filter rail's left edge, Feedback pill at its right.
**The filter rail** stretched to its cap in every state, because a grid item defaults to
`align-self: stretch`, so a collapsed rail was 564 px of empty Himmelblau: `lg:self-start` plus a
stage-relative cap, open 655 px / collapsed **119 px**.
**The search and bookmark toggles** rendered white on white (`BROWSE_TOOLBAR_BUTTON` ends in
`bg-surface` and wins the tailwind-merge against the `default` variant's `bg-primary`), i.e. the
blank square in the founder's crop; new `BROWSE_TOOLBAR_BUTTON_ON` constant.
**"The background surrounding the cards"** was already transparent (measured `rgba(0,0,0,0)` on the
column and its parent); the real defect was the second half of that prompt, cards sliced by the
scroll container's edge, answered with `useEdgeFade` + `mask-fade-*` (a mask, not an overlay: the
ground is a gradient).
**The blue outlines** were the global `:focus-visible` ring firing after a click; `trackInputMode()`
marks `<html data-input="pointer|keyboard">` and the ring is now keyboard-only, which keeps
WCAG 2.4.7.
**Redemittel vs Kollokationen card height** was not the Wendung: `FlipCard` takes the taller face and
the unclamped BACK ran to 272 px against a 165 px front, so `auto-rows-fr` pushed all 193 cards to
272. Capped: **272 → 188 px**, against Kollokationen's 195.
The founder also asked for an audit of the previous session's feedback; every item was re-verified
live (Beispiel column, horizontal-scroll fades, internal scroll on all four tabs, the 30 px toolbar,
the Wörter three-column grid), and the only one still open was the card-height parity above.
Gates green: typecheck · lint 0 errors (77 warnings = the pre-change baseline) · 551 tests · build ·
check:bundle 126.6 kB · check:contrast.
Prior s189 (2026-08-05): **the Prüfung zone became ONE page.** Founder prompt:
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
Shipped as **PR #799**, squash-merged into `main`, then **PR #800** carried the follow-up run:
the filter rails took the Schreiben rail's Himmelblau fill (superseding the grey tile of s104), the
four hand-copied Bibliothek action bars became ONE shared `FloatingActionCluster` with Schreiben,
text fields lost the global focus ring (the caret is the indicator; buttons keep theirs), and the
Bibliothek desktop scrolls INSIDE its content column instead of scrolling the page, which needed
`usePagedList` made root-aware first.
**Resume here:** one question is deliberately open, `FilterRail`'s mobile panel keeps its own
`max-h-[45dvh]` cap instead of the new one-screen `max-h-panel-stage`; ask the founder before
changing an approved surface. Everything else in the Prüfung zone is done.
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
Prior s185: **the content-audit backlog closed except P10** (P9 noun facts, P7 re-levelling, P5
grammar drills, P4 scenarios, P3 exam-length texts + the Notizen step), and a parallel **database
architecture audit** shipped four fixes (#786, #787): no silent cloud write, pg_cron retention,
400-day day maps, `pnpm lint:migrations`. Detail in `docs/reports/CONTENT_AUDIT_2026-07-30.md` §5
and `docs/reports/db-architecture-audit-2026-08-04.md`; the still-open items are listed under
"Resume here" below.
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
