# Project Status

_Last updated: 2026-07-31 (session 181). **The Schreiben Aufgabe backlog is closed.** Waves 3 and 4
of `docs/plans/SCHREIBEN-OVERHAUL.md` shipped together with the authoring to-do list s180 exposed:
all 373 bare one-liners were authored up to the full exam brief in place, 74 tasks were added and 60
tagged, so the bank is **717 tasks and every one of them is servable**. Coverage is gated now rather
than aspirational: at least 2 tasks per Unterthema per length, all 15 Branchen at both lengths on all
20 Themen (Alltag included, by founder decision, with the work context as the reason the everyday
task is hard), and all 16 Textsorten live including `bewerbung`. Niveau: B1 307 / B2 302 / C1 108.
One deliberate zero remains, C1 + E-Mail (privat), which has no exam analogue. **Next up (founder,
not started): an audit of task QUALITY and filter fit** (`docs/PROJECT_REFERENCE.md`); the exam-source
items are parked as low priority.
Prior s180: **the Aufgabe filters now mean what they say.** Niveau, Textsorte and Unterthema became
HARD filters, one counting rule serves both the rail and the draw, zero-yield options grey out with
honest counts, and an empty scope gets an empty state naming the one filter to drop instead of a
substituted task.
Prior s179: **Bibliothek card grids, the floating toolbar and readable AI feedback**, plus
self-applying Supabase migrations.
Prior s178: **content audit + its P0/P1/P2 fixes** (duplicate quiz options, 234 verb paradigms
generated into `src/data/verbForms.ts`, the empty C1 band filled).
Prior s177 / s176: two founder word-field packs for answering written complaints (170 new items).
Prior s175: the `/sources` chunk is excluded from the workbox precache (PR #751); a telc-sourced word
pack stays parked and unmerged under `strategy/DATA_GOVERNANCE.md`.
Prior s174: **security audit + the sign-up flow it uncovered**, including the `onboarded` fault that
discarded learner profiles on every sign-in (#745).
Prior s173: **a deploy can no longer refresh a learner's work away** (`src/lib/liveWork.ts`).
Prior s172: the correction now appears in the Kurz/Lang trainer, rendered from
ONE shared module (`src/features/writing/correction.tsx`) with Fokus, Kurz/Lang and Verlauf
(PR #739). `docs/plans/SCHREIBEN-OVERHAUL.md` carries the writing-content roadmap.
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
(Praktisch · Bibliothek · Schreiben · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-07-30, session 178, measured against the live banks — re-verify with
`pnpm lint:content` before quoting):** vocab **1,743** (**1,733 browsable**; 8 mis-filed noun+verb combos
retired in s142 + 2 true duplicates retired in s178, ids kept) · collocations **1,072** · Redemittel **158** ·
grammar **28 topics / 137 drills** (17 groups) · Lese-/Hörtexte **42** (126 checks) · writing tasks **717** (all servable) in 20
pools, of which **270 are SERVED** (s180: only a task carrying the full exam brief is drawn; the
other 373 are retired one-liners, ids kept, and each returns when it is authored up to the shape) ·
Can-Do **57** · dialogues **30** (158 nodes, 335 options) · exam sets **15** · missions **6** ·
provenance **3,308 rows** · themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,295 of 3,308 provenance rows are AI-drafted `draft`**; only **13** are
human-verified (13 vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset to restart the
review pass; see `strategy/DATA_GOVERNANCE.md`). The full picture of what the banks do and do not
cover is `docs/reports/CONTENT_AUDIT_2026-07-30.md` (session 178).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
- [x] ~~Paste `supabase/migrations/0013_admins_table.sql`.~~ **APPLIED 2026-07-27** by the founder in
      the SQL editor, without the lock-out guard firing (it raises rather than swapping the gate when
      the seed finds no account, so a clean run means `public.admins` is seeded). Audit F1 closed:
      the admin gate is now a user-id table, not an email claim. Live confirmation that `/admin`
      still opens is the founder's last check; the rollback to the 0008 email gate sits in a comment
      at the foot of the migration if it ever does not.
- [x] ~~Paste `supabase/migrations/0014_writing_insight_en.sql` into the SQL editor.~~ **APPLIED
      2026-07-31 by CI**, along with 0010, after the founder added `SUPABASE_DB_PASSWORD`. Migrations
      now ship themselves on merge; **there is no SQL to paste any more.**
- [ ] **Add Resend SMTP** (Auth → SMTP settings). Was optional; now needed, because "Confirm email"
      is ON and Supabase's built-in sender only allows a few messages an hour. Founder bought the
      `genauly.de` mailbox 2026-07-27; next is verifying the domain in Resend, then the SMTP fields,
      then pasting the two branded templates. Full steps: `docs/reference/auth-emails/README.md`.
- [x] ~~Enable "Confirm email".~~ **DONE 2026-07-27**, closing half of audit F1 (nobody can register
      an address they do not own). Required the `/auth/confirm` work in the s174 handoff.
- [x] ~~Enable Turnstile CAPTCHA on guest sign-in.~~ **DONE 2026-07-24** (live sign-in verified; both
      Supabase Auth CAPTCHA and the `VITE_TURNSTILE_SITE_KEY` GitHub secret set). Details in
      `PROJECT_FOUNDATION.md`.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [x] ~~Redeploy `transform-sentence` to activate the "Nochmal" regenerate button (s163).~~
      **DONE 2026-07-24** (founder redeployed via the Supabase dashboard; the capped variant path is
      live).
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Start with this: the queued quality audit.** The founder closed s181 by settling two open items and
adding one task:
- **The Niveau mix stays as shipped** (B1 307 / B2 302 / C1 108). Founder: "keep the Niveau mix as it
  is." The old 35/50/15 target is retired; do not rebalance it.
- **The exam-source items are PARKED**, not pending. Founder: "park the exam source items with
  official documents task for later, it's not that important." (`SCHREIBEN-OVERHAUL.md` §12 + P0.3.)
- **NEXT TODO, not started:** a thorough analysis of **writing-task quality and filter fit**, with
  research from reliable sources. Founder: "I want you to do a thorough analysis of the quality of
  these tasks and how they go with the filter, do the required research from reliable sources, this
  is one of the next todos for later." Full scope, including which sources are usable now that the
  exam documents are parked, is in **`docs/PROJECT_REFERENCE.md` → "QUEUED (founder, s181)"**. The
  short version: s181 proved COVERAGE (717 tasks, gated); nobody has verified that a task tagged B1
  reads as B1, that its Leitpunkte are answerable in the word target, or that the Branche framing
  convinces someone who works in that industry. Deliverable shape: a report in `docs/reports/` with a
  prioritised fix list, like the s178 content audit.


**Handoff after session 181 (2026-07-31). The Aufgabe backlog is closed: 717 tasks, every one of
them servable.** Branch `claude/latest-plan-steps-ydumbt`.
Founder: "what's steps are to do in the latest plan?" then "complete the full implementation of both
these plans". The two plans were `docs/plans/SCHREIBEN-OVERHAUL.md` (waves 3 and 4 outstanding since
s167) and the authoring backlog s180 made visible when it retired every bare Aufgabe from the draw.
- **What the bank looked like going in:** 643 tasks, **270 servable, 373 bare**. 30 of 92 Unterthema
  x Länge cells empty, 13 Niveau x Textsorte cells empty, `bewerbung` at zero everywhere, and
  `project`, `sustainability` and `travel` with no Branche variants at all.
- **Three founder decisions were needed first,** because the plans left them open: the Niveau mix,
  where Bewerbung lives (**under Bildung**, both sub-themes), and whether Alltag tasks get Branche
  tags (**tag every Alltag task**, against this plan's own recommendation). The third was made honest
  rather than cosmetic: every Alltag task names the work context that makes the everyday situation
  hard (Schichtdienst gegen Behörden-Öffnungszeiten, Montage ohne Wochentage), so a Branche on a
  Kontokündigung is a reason, not a sticker.
- **Shipped in one pass: 373 upgrades in place + 74 new tasks + 60 tagged. Bank 643 → 717, zero bare.**
  Every id and every pool position survived, so resumed drafts and Verlauf rows still resolve; only
  text and tags changed.
- **Coverage is now gated, not aspirational** (`tests/writingScope.test.ts`, 413 tests):
  **≥2 tasks per Unterthema per length**; **all 15 Branchen x both Längen on all 10 Beruf Themen**
  (wave 2 did five, wave 4 the rest) **and on all 10 Alltag Themen**; **all 16 Textsorten live**,
  `bewerbung` included. Seven completely empty B1 Textsorte cells closed (Bericht, Beschwerde,
  Forumsbeitrag, Kündigung, Protokoll, Stellungnahme, Widerspruch), which is what a B1 learner
  picking a Textsorte actually feels.
- **Niveau: B1 307 / B2 302 / C1 108, and the founder has since SETTLED this as final.** The excess
  over the old 35/50/15 target is entirely Kurz tasks, and a 40-word task with three Leitpunkte is B1
  work. Promotion was limited to Lang tasks in demanding genres with 4+ Leitpunkte, so no task wears
  a Niveau it cannot carry. Do not rebalance it in a later session.
- **One deliberate zero left: C1 + E-Mail (privat).** A private informal mail has no C1 exam
  analogue, so the rail greys it with an honest count instead of serving a formal letter under an
  informal label. It is now the fixture that pins `blockingAxis` in the tests.
- **NOT done, and it cannot be done from a session:** the plan's §12 verification items (exam point
  values, weightings, timings, verbatim prompt wording) and P0 item 3 (obtain the Goethe/telc/BAMF
  source documents). Both need primary documents this repo does not hold, and telc material may not
  be copied at all under `strategy/DATA_GOVERNANCE.md`. **Nothing shipped depends on them:** no exam
  score or timing is printed anywhere, `words` follows Genauly's own per-band convention, and `exam`
  is a shape label on our own tasks. **Founder action if you want it closed:** buy the Goethe
  Modellsätze (B1/B2/C1) and drop the PDFs into the repo; a session can then read them locally.
- **Gates:** typecheck · lint:content clean · test:unit **413/413** · build · check:bundle 123.2 kB.

**Same session, follow-up: the app now has exactly TWO learner-facing categories.** Founder, on the
Schreiben Thema dropdown: "there seems to be some topics in the themen dropdown which are non-beruf
but are not part of alltag ... There has to be only two overarching categories similar to the nodal
graphs in bibliothek. This has to be consistent across the app."
- **Three surfaces, three different answers.** The Schreiben rail folded `gesundheit` into Alltag but
  not `bildung`, so "Bildung & Sprache" was a third heading; the Bibliothek Thema dropdown grouped by
  all five content domains; only the graphs were binary, and they called the second area
  "Privatleben".
- **`src/lib/lifeAreas.ts` is the one fold now.** Two areas, `beruf` = Berufsleben and every other
  domain = Alltag, with `themeGroupsByArea` as the single grouped-options builder that the Schreiben
  rail, the Bibliothek dropdowns (Wörter + Kollokationen) and both graph legends all call.
- **Naming: Berufsleben / Alltag** (founder pick). "Privatleben" is retired from the graph legend so
  the whole app says the same two words.
- **The Mode lens still narrows inside the two groups**, never adds a heading, and a deep-linked
  theme is still never orphaned (s104). `tests/lifeAreas.test.ts` fails if a third group ever
  appears, in any mode, or if a new domain does not fold into Alltag.
- **Verified in the built app, not only in tests** (headless Chromium): Schreiben shows BERUFSLEBEN /
  ALLTAG, the Bibliothek dropdown the same two, the Wörter graph legend reads "Berufsleben · Alltag".
- **Gates:** typecheck · lint 0 errors · lint:content clean · test:unit **419/419** · build ·
  check:bundle 123.2 kB.

**Handoff after session 180 (2026-07-31). The Aufgabe filters now mean what they say.** Branch
`claude/aufgabe-rail-bugs-1xdep2`. Founder, with three screenshots of Schreiben Lang: "I selected
Forumsbeitrag but the Aufgabe doesn't relate to it. Do a thorough analysis and find all the bugs and
necessary improvements with the Aufgabe feature."
- **Root cause: Niveau and Textsorte were never really filters.** `eligibleTasks` narrowed them
  prefer-tagged-else-untagged, the rule that is right for Branche. 373 of the 643 tasks carry no
  `format`, so on every theme without a tagged task the fallback swallowed the filter, and where even
  the untagged set was empty the filter was dropped entirely. Measured on the shipped bank: under
  "Alle Themen + Forumsbeitrag" the draw pool was 85 tasks of which **71 were not Forumsbeiträge**
  (84%), and the rail printed the honest count, 14, right beside the option. Every Textsorte was
  wrong between 66% and 100% of the time. **Both axes filter hard now**, and the order is
  Unterthema → Niveau → Textsorte → Branche (the soft axis last, so it can never hide the only task
  matching a hard one). `countExact` is gone: one hard rule means the rail count and the draw pool
  are one number.
- **A scope can now legitimately be empty, and the trainer says so.** Every dropdown greys its
  zero-yield options with the count still visible; where greying cannot help (a Kurz/Lang switch
  carrying a length-specific Textsorte, a stale deep link) the Aufgabe card is replaced by
  "Forumsbeitrag gibt es nur bei Lang." plus the one-tap "Textsorte zurücksetzen" that `blockingAxis`
  picks. `randomTask` returns null for an empty list instead of the first task of the first theme.
- **Five smaller faults fixed in the same pass.** `bewerbung` was a permanently empty dropdown option
  (0 tasks at either length, since s167), so the Textsorte list is derived from the bank now. The
  Niveau option labelled "B2" matched the tag `B2.1` exactly, which would have made the first `B2.2`
  task silently unreachable; it matches by BAND, and "C1.1" is labelled "C1" like everywhere else.
  The Ziel line printed `words x 1.25` unrounded ("Ziel 150–188 Wörter") and never named the Niveau;
  it is "B2 · Bericht · Ziel 150–190 Wörter" now. Every scope change pushed a history entry, so the
  phone's back gesture undid filter taps one at a time. Fokus and Verlauf kept `?level`/`?format`
  alive after a tab switch.
- **The sign-in draft hand-off lost the text on the email/password path.** `initialText` is read once
  on mount, and signing in from the login wall does not remount the trainer when the learner is
  already on the draft's own tab, so the draft came back only after the Google redirect. Consuming a
  resume now remounts the trainer, and the Aufgabe's theme travels as a prop instead of `?theme=`,
  which used to pin an "Alle Themen" learner to one Thema and clear the draft on the way in.
- **Follow-up in the same session, founder decision: only fully briefed Aufgaben are served.** The
  founder sent a fourth screenshot, `wt_safety_l12` ("Verfasse eine kurze Unterweisung für neue
  Mitarbeitende ...", one sentence, no Adressat, no Leitpunkte, no Niveau): "this one has too little
  description of the task." The bank held two generations: **270 tasks carry the whole exam brief**
  (Adressat, du/Sie, 2 to 5 Leitpunkte, Niveau, Textsorte, word target) and **373 are one-liners**.
  Presented both options (upgrade the 373 over several content sessions, or serve only the 270 now);
  the founder chose the smaller, better bank. Bare tasks failed three ways at once: they leave
  `evaluate-writing` nothing to grade Aufgabenerfüllung against, so feedback silently drops to
  grammar and vocabulary; they carry neither filter tag, so they were reachable ONLY under the
  default scope, which is where 58% of draws landed; and they read as unfinished. At the Kurz 4 /
  Lang 2 daily allowance, 270 tasks is about two months before anything repeats, so the number the
  learner can feel is unchanged. **Nothing is deleted:** the 373 keep their ids AND pool positions,
  so drafts and Verlauf rows still resolve, and each returns to the draw the moment it is authored up
  to the full shape, with no code change. `sub` became a hard filter with it (it used to fall back to
  the whole Thema, the last silent substitution in the selector).
- **The zeros in the rail are now the content backlog**, deliberately visible rather than papered
  over: `bewerbung` has no task at any length, **15 of 46 Unterthemen have none at each length**,
  `bericht` at C1 has one. Every Thema and every Branche still yields tasks at both lengths.
- **Gates:** typecheck · lint 0 errors · test:unit **410/410** (new `tests/writingAufgabe.test.tsx`
  renders the trainer: 20 consecutive draws per scope obey the filter, and 30 default draws all carry
  an Adressat, Leitpunkte and a Niveau) · lint:content clean · build · check:bundle 123.2 kB.
- **Shipped as two PRs, both squash-merged and deployed green** (`Validate content` + `Deploy site to
  GitHub Pages` success on each): **#766** the filter fix, **#768** the fully-briefed-Aufgaben rule.
- **Next session, if the founder wants the gaps closed:** the authoring list is in
  `docs/areas/CONTENT.md` (Bewerbung has no task at any length, 15 of 46 Unterthemen have none at
  each length, `bericht` at C1 has one). Authoring one task into the full shape makes its whole
  Niveau x Textsorte x Unterthema cell selectable, so the greyed zeros in the rail are the progress
  bar for that work. Load the `/content` skill first.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
