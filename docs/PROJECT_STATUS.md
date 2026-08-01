# Project Status

_Last updated: 2026-08-01 (session 182). **The daily-life half has a phrase bank.** Audit item P6
is closed: Redemittel went 158 → **220** with five Alltag packs (Amt, Arzt, Wohnen, Bank,
Einkauf/Reklamation), three new speech-act categories (`appointments`, `formalities`, `complaints`),
and `themeId` tagging on the 49 situational workplace phrases, where **untagged = universal**. The
tag was dead weight before: it sat on 0 of 158, so the session composer's mode filter never fired
and every scope showed the same phrases. The Redemittel tab now carries the sibling tabs' Thema
scope dropdown, and a scoped session leads with that situation's phrases.
Prior s181: **The Schreiben Aufgabe backlog is closed.** Waves 3 and 4
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

**Content banks (as of 2026-08-01, session 182, measured against the live banks — re-verify with
`pnpm lint:content` before quoting):** vocab **1,743** (**1,733 browsable**; 8 mis-filed noun+verb combos
retired in s142 + 2 true duplicates retired in s178, ids kept) · collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **28 topics / 137 drills** (17 groups) · Lese-/Hörtexte **42** (126 checks) ·
writing tasks **717**, every one servable (s181) in 20 pools ·
Can-Do **57** · dialogues **30** (158 nodes, 335 options) · exam sets **15** · missions **6** ·
provenance **3,370 rows** · themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,357 of 3,370 provenance rows are AI-drafted `draft`**; only **13** are
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

**Handoff after session 182 (2026-08-01). Audit P6 is closed: the daily-life half has a phrase
bank.** Branch `claude/next-steps-p3-analysis-7gx36m`.
Founder: "i remember we did an analysis recently.. and did complete until p3 tasks. what are the
next steps", then "continue with p6".
- **Where the audit backlog actually stood** (`docs/reports/CONTENT_AUDIT_2026-07-30.md` §5, now
  carrying a status block): P0/P1/P2 shipped in s178, P8 closed by the s181 Schreiben work, P3 only
  *started* (the six C1 texts at 305-344 words). P6 was the cheapest real win left, so it was
  recommended first and picked.
- **The gap, measured before touching anything:** all 158 phrases were workplace discussion
  functions or workplace channels (email, phone, presentation, interview, small talk), and
  **`themeId` sat on 0 of 158**. So a learner at the Bürgeramt, the Arztpraxis, the Vermieter or the
  Servicetheke had nothing, and the session composer's mode filter (`if (!r.themeId) return true`)
  was dead code.
- **62 new phrases in five Alltag packs**, each with `note`, example pair, CEFR and `themeId`:
  Amt 13, Arzt 13, Wohnen 13, Bank 11, Einkauf/Reklamation 12. They cover the counter language the
  audit named, Widerspruch included ("Hiermit lege ich Widerspruch gegen den Bescheid vom … ein.",
  "Ich bitte Sie, den Mangel bis zum … zu beheben.", "Ich setze Ihnen eine Frist bis zum …"), and
  several carry the s181 work-context reason ("Ich arbeite bis 15 Uhr, wäre auch ein Termin am
  späten Nachmittag möglich?").
- **Three new categories, because the existing 15 could not hold them honestly:** `appointments`
  (Termine), `formalities` (Anliegen & Anträge), `complaints` (Problem & Reklamation). Closed-enum
  rule followed in all three places (union, linter array, category metadata). Pill count on the
  Kategorie facet is now 18; say the word if that should become a dropdown.
- **Tagging is deliberately NOT blanket, and this is the decision to know about.** The audit said
  "tag the 158". Tagging a discussion function ("Da bin ich anderer Meinung.") with a theme would be
  a sticker: it belongs to no situation and works in all of them. So **49 situational phrases were
  tagged** (presentations → meetings, jobInterview + professionalIntro → bildung, the company-voice
  phone and email lines → customer) and the 109 function/channel phrases stay **untagged =
  universal**, exactly like an untagged Branche. `tests/redemittel.test.ts` (16 tests) fails if a
  later pass blanket-tags the bank, empties a pack, or leaves a category with no phrases.
- **Two places the tag now does work.** (1) The Redemittel tab carries the sibling tabs' **Thema
  scope dropdown** on the same `?theme=` param, with dedicated-content counts and zero-count Themen
  still selectable (Branche semantics, not Wörter semantics). Verified in the built app: Thema =
  Behörde & Ämter yields **122 Wendungen** (13 Amt + 109 universal) and the presentation openers are
  gone. (2) A scoped session leads Pool 4 with that theme's phrases, and a personal-mode session no
  longer serves "Vielen Dank für Ihre Aufmerksamkeit."
- **Gates:** typecheck · lint 0 errors · lint:content clean (220 redemittel, 3,370 provenance rows,
  1 known `der Empfang` warning) · test:unit **435/435** · build · check:bundle 123.2 kB ·
  report:exercise-coverage 20/20 green · build:review-queue refreshed. `verify:grammar` could not
  run in this sandbox (the LanguageTool toolchain needs `mvn` + Maven Central); it is warn-only.
- **Next, if you want the audit list continued:** P4 (Sprechen + Prüfung off the nav) needs a
  founder decision on whether the Anwenden entry returns to the four-zone nav; P5 (Adjektivdeklination,
  Perfekt vs. Präteritum, Verben mit Präpositionen, plus the 95% MCQ monoculture) is the next pure
  content win; P3's remaining half needs an audio strategy, since TTS voicemails cannot train
  note-taking.

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

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
