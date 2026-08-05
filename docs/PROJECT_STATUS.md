# Project Status

_Last updated: 2026-08-05 (session 189). **The Prüfung zone became ONE page.** Founder prompt:
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
