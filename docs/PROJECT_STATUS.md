# Project Status

_Last updated: 2026-08-04 (session 187). **Dark mode is no longer blue, the corners are tighter,
and the running Prüfungsteil got its polish round.** All four founder picks came off ONE interactive
preview (`preview/exam-question-tile-polish.html`, artifact link in `docs/DECISIONS.md` §s187).
**Palette "N3 Slate", app-wide:** the dark greys were a blue at 44 % saturation with two coloured
radials laid over every screen; they are near-neutral now (10-15 %, ground `220 15% 4%`, cards
`220 10% 17%`) with the washes off in dark, and blue survives only where it acts. The contrast
relationship is the founder-confirmed one: card/ground 1.38:1, edge/ground 3.03:1, plus a third step
for anything nested inside a card, because the exam's answer rows carried the very fill of the card
they sat in (1.00:1). **Corners:** `--radius` 0.875rem → 0.5rem (card 10px, row 8px, pill 6px).
**Exam:** the question carries NO tile any more (it floats on the ground beside the ONE card on
screen), each block is content-tall with the pair centred, the number strip moved down beside
Zurück/Weiter with real space around them, both blocks are drag-resizable (with arrow-key support)
and reset on every question change, and the exit is red: the bare door mark on a phone, mark plus
"Verlassen" from `sm` up. The answered number is no longer blue-on-blue. Verified by driving the
real build: **225 in-exam screens** across five viewports and three fresh draws each of Lesen and
Hören, all at 0 px page overflow with the question fully visible; gates green (typecheck, lint 0
errors, 551 tests, check:contrast, bundle 126.0 kB).
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
