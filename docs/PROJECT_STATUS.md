# Project Status

_Last updated: 2026-08-07 (session 200 shipped audit **P2** (an argumentative Aufgabe now asks for
the argument it is graded on, gated), **P3** (`exam` retired) and **P5** (the 19-item tail, register
gated). **P4 was stopped by the founder and the audit finding behind it is now marked WRONG**: no
exam supplies a text for a Forumsbeitrag or a Stellungnahme. Details under "Resume here")._

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

**Handoff after session 199 (2026-08-07): the audit shipped, its top fix shipped, and P2 is the
next session's work (founder: "I'll continue with the p2 and others in next session").**
Founder prompts: "what's next in the task list?" → "go ahead" → "go with your recommendation reg
branche. I prefer to have Berufsleben and Alltag as the first filter and then themen and only then
Branchen filter as the heirarchy of the filter rail all across. When a user selects a thema where
there is no branche specific content, just show the options within Branche as locked." → "no need of
design preview for the above mention rail changes" → "the header and footer of the filter rail seems
to look like separate pieces attached to the main body. remove the separator lines and make all the
filter rail same shade to look like one piece." → "document the session."

**Shipped:** PR **#824** (the audit report) → **`66061c3`**; PR **#825** (three commits: `acb21f7`
Branche cleanup, `7f5c464` rails, `40176d1` docs) → **`bf9db0b`**. Validate content and Deploy site
to GitHub Pages green on `main` for both. **Deploy Supabase functions did not run on `bf9db0b`, and
that is correct**: it is path-filtered to `supabase/functions/**`, `supabase/migrations/**` and its
own file, none of which this session touched. Housekeeping done after both merges.

### START HERE next session: audit P2

The one where the app currently punishes a learner for doing exactly what the brief asked.
**Six C1 Stellungnahmen at a 200-word target carry only descriptive Leitpunkte**, while `level` is
what tells `evaluate-writing` to "bewerte streng auf C1-Niveau":
`wt_conflict_l01`, `wt_conflict_l05`, `wt_conflict_l15`, `wt_conflict_l17`, `wt_conflict_l25`,
`wt_bildung_l10`.
1. **REPLACE the weakest descriptive point with a justification one; never add a fifth.** Four
   Leitpunkte in 200 words is already the exam shape, and `wt_conflict_l05` shows the pattern:
   "Beschreiben Sie das Problem / Zeigen Sie Verständnis / Schlagen Sie eine Regel vor / Sagen Sie,
   wer beschließen soll" has no point that forces an argument.
2. Then sweep the wider set: **20 of 35 `beschwerde`** and **9 of 54 `stellungnahme`** tasks carry no
   justification point either.
3. Then **gate it**, so it cannot come back: a `stellungnahme`, `forumsbeitrag` or `widerspruch` at
   B2 or above must carry ≥1 justification Leitpunkt. Anchor the check on the same phrase-level
   classifier the audit used, and **read §9 of the report first**: an opening-verb classifier is
   WRONG for German, because a separable prefix carries the meaning ("**Legen** Sie dar, warum …"
   scored as unargumentative and is exactly the opposite). Getting this wrong cost a re-run in s199.
4. Load `/content` before editing `writingPrompts.ts`; ids are permanent, so this edits fields only.

**Then, in priority order (all AI-shippable):**
- **P3:** retire `exam` from the schema (nothing reads it: not the trainer, not the evaluator, not a
  filter; the shipped-ids law protects ids, not fields), or fix its 69 out-of-band tags. Either way
  correct the `words` doc comment, which claims the target follows the exam shape when it is fully
  determined by (Niveau, Länge).
- **P4:** add `source` to the 71 reaction tasks (54 Stellungnahmen, 17 Forumsbeiträge), AFTER P2,
  because a quoted position is what makes a justification Leitpunkt answerable. No schema change.
- **P5:** the 19-item tail. 5 Textsorte re-tags (`wt_meetings_s05`, `wt_meetings_l17`,
  `wt_logistics_s13`, `wt_bildung_l03`, `wt_wohnen_l05`) and 14 Adressat/register fixes where `du`
  meets "Frau <Nachname>". About an hour.

**Two things to know before touching the rails again:**
- **The rail order lives INSIDE the rails** (`FilterRail` reorders its own `scopes` array), never in
  a caller. That is what s184 centralised and s199 kept; do not re-introduce per-surface ordering.
- **The lock lives in ONE place** (`ScopeSelect`'s row renderer + `ScopeLocked` in `ScopeRail.tsx`,
  plus `lockZero` on the Bibliothek's `ScopeMultiSelect`). It shipped WITHOUT a preview round at the
  founder's explicit waiver, so if they dislike the look it is a single-file change, not an
  eight-rail one. **Niveau moved below the hierarchy** on a literal reading of "Berufsleben and
  Alltag as the first filter"; flipping it back is one move per rail.

**Standing debt, unchanged:** P10 human content verification is still the only open s178 audit item
and is founder-owned (`pnpm review:queue` → decisions → `pnpm apply:reviews` → `pnpm stamp:verified`).
`verify:grammar` has still never run over the s198 sentences (no LanguageTool toolchain in this
sandbox). CLAUDE.md is **378 lines** against its ~350 budget, down from 380 despite three new rules;
the compression pass is worth finishing.

Gates on the merged work: lint:content 0 errors · typecheck · lint 0 errors (77 warnings) ·
**649 tests** · build · check:bundle 128.2 kB · check:contrast.

Older handoffs (s198 and earlier) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
