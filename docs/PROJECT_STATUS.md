# Project Status

_Last updated: 2026-07-31 (session 180). **The Schreiben Aufgabe filters now mean what they say.**
Picking a Textsorte or a Niveau used to PREFER its tagged tasks and fall back to the untagged ones,
so "Forumsbeitrag" drew a Beschwerde an eine Fluggesellschaft: 84% of that scope's pool contradicted
the filter while the rail printed the honest count beside the option. Both axes filter hard now, one
counting rule serves the rail and the draw, zero-yield options grey out, and a genuinely empty scope
(Kurz + Forumsbeitrag) gets an honest empty state with a one-tap escape instead of a substitute task.
**And only fully briefed Aufgaben are served** (founder decision): the 373 one-line legacy tasks, 58%
of the default draws, left the AI nothing to grade Aufgabenerfüllung against, so the bank the trainer
draws from is the 270 exam-shaped ones. Nothing is deleted; upgrading the rest is the content backlog
and every zero in the rail is an entry on it.
Prior s179: **Bibliothek card grids, the floating toolbar, and the AI
feedback made usable.** The writing feedback is now written in simple A2 German with a sticky DE/EN
switch on every AI text (Kurz/Lang Tipp, Verlauf, Fokus Hinweis), the capped fix tiles expand, and
Shuffle clears the editor. **Migrations now apply themselves on merge** (the founder set
`SUPABASE_DB_PASSWORD`; the hand-pasted history was bridged and two genuinely missing migrations,
0010 and 0014, were applied), so there is no SQL to paste any more. Also: the AI
allowances are visible. Each writing trainer now prints "Heute noch 7 von 10" beside the button
that spends the day's AI budget (Fokus 10 / Kurz 4 / Lang 2), and Fokus "Nochmal" says how many new
phrasings are left ("2 von 3 übrig"); the numbers come from the Edge Functions themselves. Also: the
sticky view-button row no longer fades a blurred band in behind itself: it is transparent in every
state and its controls float on their own shadow. Every tile in a Karten grid now shares ONE height
(`auto-rows-fr` on all four tabs), with the card content vertically centered and the Wörter verb
paradigm paired two-per-row so the uniform tile stays tight. "Nach oben" gained a desktop placement.
Prior s178: **Content audit, then its P0-P2 fixes and the C1 slice.**
`docs/reports/CONTENT_AUDIT_2026-07-30.md` measures coverage, quality, real-world usage frequency and
fitness for B1-C1 across all 3,896 content items. Verdict: **structurally excellent, pedagogically
lopsided.** Then P0 and P2 of its backlog shipped. **P0:** a quiz could render the same option twice
(one of them the answer), because distractors were filtered by id and 5 English glosses collided
inside a theme; two words shipped twice (`der Reisepass`, `der Konferenzraum`); CO2 was spelled two
ways, one of them unreachable for a learner who types it. All fixed and gated. **P2:** all 234 verbs
now have Partizip II, auxiliary, Präteritum and separability in the generated
`src/data/verbForms.ts`, derived from a vendored dictionary oracle rather than typed by hand.
They now show on the Wörter card (founder picked variant C from `preview/verb-forms-card.html`).
**P1:** the C1 band had 0 grammar topics, 0 texts and 0 Can-Dos behind a level onboarding offers; it
now has 4 topics (20 drills), 6 texts of 305-344 words and 5 Can-Dos.
Prior s177: **Complaint response pack 2, cleaning-service focus.** A
second founder-supplied word field for answering a written complaint, framed around a
Reinigungsservice customer relationship, was audited against the live banks (including the s176 pack
it overlaps with): about 90 of ~150 requested items were already shipped, **60 are now in** (38
Wörter, 18 Kollokationen, 4 Redemittel), all `draft`. Prior s176: **formal complaint response pack (B2/C1 business German).** A
founder-supplied word field for answering a written complaint was audited against the banks: 41 of
151 items were already shipped, the other 110 are now in, split by the bank rules (82 Wörter, 19
Nomen-Verb chunks into Kollokationen, 5 Redemittel sentence frames, 4 already covered by existing
phrases). 106 new provenance rows, all `draft`. Prior s175: **a latent build-breaker is defused, and a
238-item word-field pack is parked.** The `/sources` workbench chunk bundles the whole provenance
register, so it grows with the content banks; at ~1.96 MB it was roughly **200 content items** from
workbox's 2 MiB precache ceiling, which **fails `pnpm build`** rather than warning. `vite.config.ts`
now keeps that founder-only chunk out of the precache (PR #751). The pack that surfaced it stays
parked on `claude/word-list-validation-br3u2g`: the word list came from photographed pages of a
commercial telc B2 Beruf coursebook, and `strategy/DATA_GOVERNANCE.md` puts telc materials on the
do-not-use list and forbids copying a published word list wholesale. **PR #749 was withdrawn.**
Also s175: **Fokus mobile tiles breathe.** The two mobile Fokus tiles
filled the room down to the fixed bottom chrome to the last pixel and read as cramped; they now keep
90% of it (`FILL_RATIO` in `FokusTrainer.tsx`), anchored at the same top, and sit `gap-5` apart, so
the freed strip sits under the lower tile. Prior s174: **Security audit + the sign-up flow it uncovered.**
`docs/reports/security-audit-2026-07-27.md` covers the bundle, the five Edge Functions, all twelve
migrations, CI and the dependency tree; the architecture held, and three findings were fixed in the
same pass. Acting on finding F1 the founder turned **"Confirm email" ON**, which exposed that
**email sign-up had never actually worked end to end**, and pulling that thread reached a latent
fault that had been quietly discarding learner profiles: `onboarded` was written to the cloud and
never read back, so every sign-in on a device restarted onboarding and lost the learner's level and
goal (#745). Sign-up, log-in, the confirmation link and the profile restore all work now; the auth
dialog was reworked along the way. Still open for the founder: Resend SMTP so mail comes from
Genauly (migration 0013 is applied). Prior s173: **a deploy can no longer refresh a learner's work away.**
The PWA's auto-update reload now waits while any surface holds unsaved work (`src/lib/liveWork.ts`),
and both kinds of work persist so even an unavoidable reload is recoverable: writing drafts autosave
per mode (`draftAutosave.ts`), and a running Üben session snapshots its plan + position
(`sessionResume.ts`). **Merged (PR #740).** Prior s172: the correction now appears in the Kurz/Lang trainer, rendered from
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
grammar **28 topics / 137 drills** (17 groups) · Lese-/Hörtexte **42** (126 checks) · writing tasks **643** in 20
pools · Can-Do **57** · dialogues **30** (158 nodes, 335 options) · exam sets **15** · missions **6** ·
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

**Handoff after session 179, part 4 (2026-07-31). Migrations apply themselves now, and two of them
were missing from production.** Branch `claude/ui-layout-buttons-cards-zkchha`.
Founder: "can you apply the migration in supabase yourself? I remember we setup something for this
earlier" → the pipeline existed (s167) but only ever deployed Edge Functions, because
`SUPABASE_DB_PASSWORD` was deliberately unset. The founder set it; the first `db push` then FAILED,
and the failure was worth having.
- **The remote had NO migration history at all.** Every migration to date was pasted into the SQL
  editor by hand, which never writes to `supabase_migrations`, so `db push` tried to replay 0001
  against a database that already had everything and died on "policy profiles_select_own already
  exists". Because migrations run before functions, the function deploy was skipped with it.
- **Evidence before repair.** Marking a version applied skips its SQL forever, so nothing was
  repaired on trust: a dispatch-only **schema probe** (Management API query endpoint) listed the live
  tables, the `progress`/`writing_evaluations` columns, every public function and every RLS policy.
  It proved 0001-0004, 0006-0009 and 0011-0013 were present.
- **It also found a real hole: migration 0010 had never been applied.** No `gdpr_events` table, no
  `log_gdpr_event`, no `admin_gdpr_evidence`, so the GDPR evidence counters the Launch screen reads
  had no store behind them. Applied now, along with 0005 (idempotent, so a no-op if it was already
  there) and 0014.
- **The bridge, once:** `repair_applied` marked the eleven verified versions, then
  `db push --include-all` applied the three unrecorded ones. `--include-all` is now permanent,
  because a repaired history legitimately leaves an older file unrecorded below a newer applied one.
- **Verified after:** `migration list` shows Local = Remote for all 14, `writing_evaluations.insight_en`
  exists, `gdpr_events` exists.
- **From now on a merge to `main` applies pending migrations and then deploys the functions.** Three
  dispatch-only inputs stay for diagnosis: `list_only`, `probe_schema`, `repair_applied`.
- **Still true:** keep every migration idempotent. With `--include-all` an unrecorded file is applied
  wherever its number sits.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
