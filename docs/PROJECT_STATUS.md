# Project Status

_Last updated: 2026-08-07 (session 201 made the four Ohne-Zeit module pages one product and
fixed the two dead ones: Lesen and Hören started runs nothing rendered. Session 200 shipped the
writing-audit fixes P2/P3/P5 in parallel, and P4 is closed as WRONG. Both handoffs under
"Resume here")._

## Session 201 log

Founder: four phone screenshots (`/lesen`, `/hoeren`, `/simulation`, `/writing`) with "make these
pages consistent and highly polished ... leave no stone unturned", two named bugs, then "go with
verlauf on all four".
**The headline is a bug the screenshots only hinted at: `/lesen` and `/hoeren` were dead pages.**
Tapping a text or "Zufällige Auswahl" wrote a run into `useExamStore`, and the Prüfung hub was the
only screen in the app that rendered a run, so nothing happened. What the founder reported as "the
shuffle button doesn't deactivate" was a stuck touch-`:hover` on a button whose tap led nowhere.
- **Both choosers work now.** `TextModuleHub` renders `<MockExamRunner />` while a run exists, the
  shell knows the two routes (`ZONE_ROUTES` + the new `STAGE_ROUTES`), and finishing or leaving a
  drill lands back on the list it was picked from. Verified end to end in a real browser.
- **The zone's ONE exit was missing on those same two pages** (they were never in `ZONE_ROUTES`),
  which is the visible difference in the founder's first two screenshots.
- **The Aufgabe toggle left the module row** for the chooser's own toolbar row (founder's bug 1).
- **Sticky touch-hover is gone app-wide:** `future.hoverOnlyWhenSupported` (founder's bug 2, the
  same law as s190's focus rings one input mode further).
- **One chooser for three modules:** `ModulePicker` owns the toolbar, `ChooserCard` is the one card,
  `ModuleTabs` the one switcher, and all four pages read module row → switcher → content.
- **A Verlauf on all four** (founder pick): the hub's Verlauf card was extracted to
  `features/pruefung/verlauf.tsx` and Lesen/Hören list their own sittings from it.
- **Re-verified after the `origin/main` merge**, not just before it: every gate green (652 tests,
  bundle 128.2 kB, contrast, content lint) and all four pages walked again at 360x640 and 1280x860,
  light and dark, including the full drill loop and both Verlauf states. `CLAUDE.md` came down 391 →
  383 lines (the merge had left one rule stated twice); it is still over the ~350 budget it was
  already over at `66061c3` (378), so that older debt wants a pass of its own.

## Session 200 log

Founder: "what's next?" → "go ahead" → "is Text zur Aufgabe really necessary? in my B2 für Beruf exam
they just gave the topic overview and asked to write a forumsbeitrag ... can you research what is
more realistic".
- **P2, the fix that mattered.** An argumentative Textsorte at B2+ must now carry a Leitpunkt
  demanding a **reason, a consequence or a stance**, because `level` is what makes `evaluate-writing`
  mark strictly. **30 tasks fixed** (each REPLACING its weakest descriptive point), **110 gated**,
  one shared classifier for gate and test (`scripts/justification-markers.mjs`).
- **P3:** `exam` gone from 717 tasks, the interface and the types, with a guard against its return.
- **P5:** five Textsorte re-tags and the 14 du/Sie hybrids, both now gated.
- **P4 stopped, then closed.** The founder's own exam contradicted the audit, the published
  Modellsätze back the founder, and the report carries a correction. The supplied text belongs to the
  reply genre, so the honest target is the 47 "Antworten Sie" tasks, not the 71 opinion tasks.
  Nothing was changed, and the founder agreed: the reply wave is the next session's work.

## Session 199 log

Founder: "what's next in the task list?", then "go ahead".
**The writing-task quality audit is done, and its headline is: the tasks are well written, the tags
on them are not.** s181 closed the COVERAGE backlog (717 tasks, every Unterthema, Textsorte and
Branche represented); this audit asked whether the tags are EARNED.
- **The good news, measured first:** only 6 near-duplicate instruction pairs across 256,686
  comparisons (all same-theme, zero cross-theme), 2,355 distinct Leitpunkte of 2,691, zero Leitpunkte
  demanding a non-written act, and a demand ladder that genuinely rises with the Niveau tag.
- **Branche is a coverage artifact.** All 40 theme×length pools carry exactly 15 distinct sectors,
  the size of the `WorkSector` enum, assigned in enum order down the pool index, in pools as small as
  11 tasks. 199 of 600 tagged tasks (33%) carry no marker of the sector they claim.
  `tests/writingScope.test.ts` forced this and 11-task Alltag pools cannot satisfy it by authoring.
- **The Niveau tag scales the word target and the AI grader's strictness, but not the task**: 236
  tasks (207 B2, 29 C1) ask for no justification, sharpest in 6 C1 Stellungnahmen at 200 words.
- **`exam` is dead metadata** (read by nothing) that contradicts `words`, and **`source` is unused on
  all 717 tasks**.
Full detail and the P1–P5 fix list are in the report.

**Then the founder answered P1 and asked for two more things**, so the session shipped three commits:
- **P1, option (a): a Branche tag is EARNED or it is not there.** `scripts/sector-markers.mjs` is the
  ONE lexicon (shared by `lint:content` AND `tests/writingScope.test.ts`, so gate and test cannot
  drift); 331 unearned tag instances stripped, 220 tasks universal again, no id or task text touched.
  The all-15-Branchen floor is replaced by the property it only proxied for, plus a floor keeping
  Berufsleben real (≥8 of 15 sectors per pool). Nothing became unreachable: Branche is soft, and a
  test asserts every Branche still draws everywhere.
- **The filter hierarchy inverts, in all 8 rails:** Lebensbereich → Thema → Unterthema → Branche, then
  Niveau and Textsorte (founder: "Berufsleben and Alltag as the first filter ... all across"). Applied
  inside the rails, never by a caller.
- **Branche LOCKS instead of greying.** Its count is now the DEDICATED one, so a padlock means nothing
  is written for that industry on this Thema; when every option is locked, one line replaces the
  control. The engine keeps its untagged-=-universal fallback, so deep links still work.
- **The rails are one piece.** The header and footer were painting the accent wash on top of the
  tile's own, compositing darker, with a tinted rule under each seam. Both fills and both rules gone.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · **Prüfung** · Fortschritt, s182: Schreiben moved into the Prüfung hub),
the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-08-07, session 198, measured against the live banks — re-verify with
`pnpm lint:content` before quoting):** vocab **1,768** (**1,758 browsable**; 8 mis-filed noun+verb combos
retired in s142 + 2 true duplicates retired in s178, ids kept; +25 everyday verbs/adjectives in s198
for the part-of-speech floor, so the mix is **77.6 % noun / 13.6 % verb / 6.1 % adjective**) ·
collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **32 topics / 195 drills** (18 groups; 37 productive, s182) · Lese-/Hörtexte **42** (126 checks) ·
writing tasks **717**, every one servable (s181) in 20 pools ·
Can-Do **57** · dialogues **30** (178 nodes, 335 options; every scenario ends in a free-speak turn since s182) · exam sets **15** · missions **6** ·
provenance **3,457 rows** (four concatenated parts since s182, TS2590) · themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,444 of 3,457 provenance rows are AI-drafted `draft`**; only **13** are
human-verified (13 vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset to restart the
review pass; see `strategy/DATA_GOVERNANCE.md`). The full picture of what the banks do and do not
cover is `docs/reports/CONTENT_AUDIT_2026-07-30.md` (session 178), whose backlog is **closed
except P10** since s198. The writing bank has its own quality audit since s199,
`docs/reports/writing-tasks-audit-2026-08-07.md`: the tasks read well, but a third of the Branche
tags were unearned and the Niveau tag scaled the word target without scaling the task. **P1, P2, P3
and P5 are shipped (s199, s200); P4 is marked WRONG in the report** and replaced by an optional
reply-task wave.

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

**Handoff after session 201 (2026-08-07): the four Ohne-Zeit module pages are one product, and
the two that did nothing work.** Branch `claude/ui-polish-consistency-56ja1y`, PR #827.
Founder prompts: four phone screenshots + "make these pages consistent and highly polished ... leave
no stone unturned ... some of the observed bugs: the header bar shouldn't have the aufgabe button /
shuffle button ... deactivates when tapped on empty spaces" → "either keep verlauf in every module or
remove it from all of the individual modules" → "go with verlauf on all four".

- **The reported shuffle bug was a dead page.** `/lesen` and `/hoeren` wrote a run into
  `useExamStore` and nothing rendered it (only the hub did), so every card and the draw did nothing;
  the "stuck" button was a touch-`:hover` that never cleared. `TextModuleHub` renders
  `<MockExamRunner />` now, `AppShell` has `STAGE_ROUTES`, and the chooser's `zoneExit` steps aside
  while the runner owns the exit, clearing only an exit that is still its own.
- **`ZONE_ROUTES` never had those two routes**, so they were the only screens in the zone without
  the header exit. Fixed with the same one-line law.
- **One chooser for three modules:** `ModulePicker` (frame + toolbar row), `ChooserCard` (one card
  anatomy), `ModuleTabs` (one switcher), `verlauf.tsx` (the Verlauf card, extracted from the hub so
  a chooser never imports it and drags the writing-prompt bank into `/lesen`).
- **`future.hoverOnlyWhenSupported`** is app-wide: a `hover:` fill can no longer read as an ON state
  on a phone. Any new toggle states its ON state in its own class, never as a hover fill.
- Verified in a real browser at 360x640 and 1280x860, light and dark: the drill loop end to end, the
  Aufgabe panel, the empty scope, both Verlauf states. Gates: typecheck · lint 0 errors · 652 tests ·
  build · bundle 128.2 kB · contrast · lint:content.
- **Open, small:** `CLAUDE.md` is over its ~350-line budget (it was before this session too); the
  Sprechen/Schreiben Verlauf spinner has no timeout, so an unreachable Supabase hangs it forever.

**Handoff after session 200 (2026-08-07): P2, P3 and P5 shipped; P4 was stopped by the founder and
the audit finding behind it is now marked WRONG.**
Founder prompts: "what's next?" → "go ahead" → "is Text zur Aufgabe really necessary? in my B2 für
Beruf exam they just gave the topic overview and asked to write a forumsbeitrag ... can you research
what is more realistic".

- **P2, the one that mattered** (`663f993`). `level` tells `evaluate-writing` to mark strictly, and
  Aufgabenerfüllung is graded against the Leitpunkte, so an argumentative Textsorte whose points only
  describe marks a learner down for obeying the brief. **30 tasks fixed**, each REPLACING its weakest
  descriptive point (never a fifth), and gated: `scripts/justification-markers.mjs` is the ONE
  classifier, shared by `lint:content` and `tests/writingScope.test.ts`. **110 tasks gated, all
  passing.** A point counts when it forces a **reason, a consequence or a stance** (one demand, not
  two: a first cut demanded a stance specifically and failed `wt_safety_l04`, whose points are
  "Begründen Sie …/Legen Sie dar …/Entkräften Sie den Einwand …").
- **P3** (`a7dd57a`). `exam` retired from 717 tasks, the interface and `src/types/index.ts`;
  `lint:content` errors if it returns. `words` now documents the real rule, (Niveau, Länge).
- **P5** (`f9a1e78`). Five Textsorte re-tags (the tag follows the requested OUTPUT) and the 14
  du/Sie hybrids, fixed on the Adressat side with first names; gated in `lint:content`.
- Gates: lint:content 0 errors · typecheck · **651 tests** · (build/bundle/contrast not re-run after
  the docs-only commits).

**P4 is NOT a defect as the audit wrote it, and the report now says so.** The founder challenged it
from their own exam, and the published material agrees: **Goethe B2 Schreiben Teil 1** is a
Forumsbeitrag from a topic plus four Inhaltspunkte with nothing supplied, and **DTB B2** supplies a
text in Teil 1 (a forwarded customer complaint to answer) but not in Teil 2, which is a choice of two
topics, one a Forumsbeitrag. **The supplied text belongs to a GENRE, answering incoming workplace
mail, not to an exam.** The audit had selected the 54 Stellungnahmen and 17 Forumsbeiträge, exactly
the opinion tasks that never get one.
**Shipped:** PR **#828** (four commits: `663f993` P2, `a7dd57a` P3, `f9a1e78` P5, `74828a9` +
`c96c650` the P4 correction and docs) → squash-merged **`df101d7`**. Validate content and Deploy site
to GitHub Pages both green on `main`. **Deploy Supabase functions did not run, and that is correct**:
it is path-filtered to `supabase/functions/**`, `supabase/migrations/**` and its own file, none of
which this session touched. Post-merge housekeeping done, tree clean.

**START HERE next session: the reply wave** (founder: "i agree with your assessment on p4 and a gap
with Beschwerde. I'd go with your recommendation"). The **47 reply-shaped tasks** ("Ein Kunde
beschwert sich … Antworten Sie ihm") show nothing of what came in, which IS the DTB B2 Schreiben
Teil 1 shape, and it is the one place `source` earns its keep. What that session needs, in order:
1. **47 authored incoming texts** (customer mail, guest complaint, relative's message), each stating
   the facts the Leitpunkte answer: dates, order numbers, what was promised, what arrived. `/content`
   first; ids and instructions do not change, this is a new field only.
2. **A rendering slot, which does not exist yet.** The Aufgabe card (`GuidedWritingTrainer`), the
   exam's `SchreibenPart`, and the payload `evaluate-writing` grades against all ignore `source`
   today. The A/B/C placement mockup is already built and still applies:
   `preview/schreiben-source-text.html` (A text first / B task first / C folded behind one line);
   the founder has not picked yet, so start by asking.
3. **Watch the two height laws** while adding a block to that card: a freshly opened trainer never
   rests scrolled, and the Schreiben mobile anatomy is locked (`docs/areas/SCHREIBEN.md`). The card
   already caps and scrolls its task region internally, so the text is more content in that region,
   not new chrome.
4. **Gate it** the way s199 and s200 gated their rules: a reply-shaped brief without a `source` is
   the defect to catch, and the lexicon lives in `scripts/` shared by `lint:content` and the test.
2. **`source` has NO rendering slot** (read by nothing: not the Aufgabe card, not `SchreibenPart`,
   not `evaluate-writing`), so P4 was never the data-only edit the audit assumed. Either build it for
   the reply wave or retire the field like `exam`. Awaiting the founder's pick; nothing was changed.
3. The A/B/C placement mockup is built and still applies to the reply wave:
   `preview/schreiben-source-text.html`.

**Method note for the next audit:** §9 compared the bank against exam shapes from memory of the
format rather than against the published task descriptions, and that is what produced a wrong
finding. Where a claim turns on "this is what the exam does", fetch the Modellsatz.

Older handoffs (s199 and earlier) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
