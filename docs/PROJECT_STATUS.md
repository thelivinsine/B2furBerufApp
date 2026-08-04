# Project Status

_Last updated: 2026-08-04 (session 185). **The content-audit backlog is down to one open item.**
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
Prior s183: **The Prüfung zone has a new icon language: the orange
Absolventenhut in the bar (founder pick D), and the branded route marks on tinted tiles in the hub
(pick 2).** The founder also settled the merge question: **Sprechen and Prüfungssimulation stay
separate.**
Prior s182: **Three audit items closed in one session: P6, P4 and P5.**
P6: Redemittel 158 → **220** with five Alltag packs and selective `themeId` tagging (untagged =
universal), plus a Thema scope on the Redemittel tab.
P4: **all 30 speaking scenarios now end in a free-speak turn with a model answer** (was 10 of 30),
and Anwenden is back on the desktop sidebar.
P5: the missing B1 accuracy canon shipped (Adjektivdeklination, Perfekt/Präteritum, Verben mit
Präpositionen, Komparativ/Superlativ, 10 drills each) and **every B1 topic now has ≥3 productive
drills**, so the bank stopped testing recognition and calling it practice (grammar 28 topics/137
drills → **32/195**, productive 4% → 19%).
Then the founder answered the nav question P4 had left open: **the bar's fifth zone is Prüfung and
Schreiben lives inside it** (Praktisch · Bibliothek · Prüfung · Fortschritt · Einstellungen, still
five slots; `/writing` keeps its route and is a card in the hub).
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
- [x] ~~Decide where Anwenden lives on MOBILE (s182, audit P4).~~ **DECIDED 2026-08-01 by the
      founder:** "just move schreiben to anwenden and rename anwenden as prufung." Shipped in s182,
      so the bar stays at five slots and now reads Praktisch · Bibliothek · **Prüfung** ·
      Fortschritt · Einstellungen, with Sprechen, Schreiben and Prüfungssimulation inside the hub.
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

**Handoff after session 185a (2026-08-04): the content-audit backlog, minus P10.** Founder, after
being shown what was left: "go ahead with all the items except for the p10."
- **Closed outright: P9, P7, P5, P4.** P9 gave every noun a `plural` or a `numerus` and folded the
  two `pron` schemes into one documented, linted scheme. P7 re-levelled 108 items off the advanced
  bands and froze the rare-compound count with a linter ratchet. P5 took EVERY grammar topic to 10
  drills with ≥3 productive (the 21 B2/C1 topics had zero productive between them). P4 added six
  level-3 scenarios, three of them Alltag.
- **P3 is done.** Eight exam-length B2 texts shipped, all six voicemails carry `notes` fields, and
  the Notizen step itself shipped as **variante A**, which the founder picked from
  `preview/notizen-varianten.html` and then refined over three rounds. The settled shape is in
  `docs/areas/CONTENT.md` and should be treated as locked: Himmelblau message tile above a WHITE
  Notizen sheet (colours swapped on request), ruled lines rather than boxed inputs, a 40px play
  button on the title row, and identical row heights before and after "Notizen vergleichen" so the
  button underneath never moves. Final render: `preview/notizen-a-r2.html`.
- **Three things were deliberately left alone, and each is a rule, not a shortcut.** (1) The 12
  human-verified rows that P9's new checks touch: editing one breaks the content fingerprint its
  `verified` stamp is tied to, so the linter warns and they queue for the next human review. (2)
  P7's "spend the next 200 items on core verbs, adjectives and connectors" is a standing authoring
  rule in `docs/areas/CONTENT.md`, not a shippable change. (3) P10 itself, per the founder.
- **Two rules are gates now, so they cannot rot:** `tests/grammar.test.ts` asserts 10 drills + 3
  productive per topic, and `lint-content.mjs` gates noun numerus, the pron scheme and the
  rare-compound ceiling. A future pack cannot quietly re-open any of them.
- **One test fixture was rewritten, not patched.** The composer's listening test scoped to logistics
  because that theme's only text WAS a voicemail; the new logistics text falsified that. It now
  derives the theme from the bank, so adding a text anywhere cannot make it stale again.

**Handoff after session 185b (2026-08-04, parallel branch): the database architecture audit.** Founder: "the database
architecture is concerningly linear.. can you do a thorough audit and provide your analysis with
risks and recommendations?"
- **Deliverable:** `docs/reports/db-architecture-audit-2026-08-04.md`, covering all 14 migrations,
  the 5 Edge Functions, `src/lib/cloudSync.ts` and the admin RPCs. Analysis only, no code changed,
  because the prompt asked for an assessment.
- **Verdict in one line:** the "linear" schema (11 small tables around `auth.users`, few relations)
  is the correct consequence of keeping the ~5,000-id content catalog in the repo; the real risks
  are growth-shaped, not shape-shaped.
- **Findings, ranked R1-R8.** The three that matter most: the `progress` row is one ever-growing
  JSONB blob re-uploaded whole every 1.5 s of activity (R1); `pushProgress`/`pushSettings` never
  read the supabase-js `{ error }` result, so a permanently failing sync is invisible while the
  learner believes the cloud backup works (R3); nothing is ever deleted, and the pg_cron retention
  job that migration 0010's evidence probe expects was never scheduled, which also keeps audit F11
  (indefinite learner-text retention) open (R4).
- **Then the founder said "do the four fixes", and all four shipped in the same session:**
  1. **R3, the silent sync.** Both push helpers read `{ error }` now and return a boolean;
     `settle()` counts consecutive failures per channel and retries with backoff (5 s · 20 s · 60 s ·
     5 min). Three in a row flip `useAuthStore.syncHealth` to `"failing"`, which the Settings
     account panel shows as an amber **"Sync pausiert"** badge, one line of plain German, the last
     successful backup time and an always-live "Erneut versuchen" button. A transient failure heals
     itself unseen; a permanent one can no longer hide. The same change added an **unknown-column
     retry**, because the site deploy and the migration deploy are separate workflows and an
     unknown column otherwise fails the whole upsert.
  2. **R4, retention** (`0015_retention.sql`): `purge_stale_guests(90)` and
     `purge_transform_cache(60)` scheduled on `pg_cron` (Sundays, off-peak), the whole block
     exception-wrapped so a missing extension warns instead of failing the migration step and
     blocking the Edge Function deploys behind it. `admin_gdpr_evidence().retention_scheduled`
     (migration 0010) should now report **true** for the first time since it shipped. **Not yet
     verified:** `supabase db push` does not surface Postgres NOTICE/WARNING output, and the block
     warns instead of failing by design, so a green deploy does not prove the three jobs were
     scheduled. Confirm in **/admin → Launch** (`retention_scheduled`); if it reads false, enable
     pg_cron under Database → Extensions and re-run the Supabase workflow, which re-applies the
     migration idempotently.
  3. **R1, day-map caps:** `RETAIN_DAYS = 400`, folding dropped active days into
     `activeDaysFolded` (+ the `progress.active_days_folded` column) so the lifetime
     "N aktive Tage" figure a learner sees is unchanged.
  4. **R6, the idempotency gate:** `pnpm lint:migrations` + a `validate.yml` step, six rules,
     files ≤ 0014 exempt as already-applied history. Verified in both directions.
- **The one question the code could not answer was put to the founder, who answered it:**
  auto-deleting **learner writing** (audit F11). The published privacy policy promised the opposite
  in as many words, so the job shipped unscheduled and the question was asked directly. **Founder:
  delete after 2 years.** `purge_old_learner_text(730)` is now scheduled, and it NULLs the text
  columns rather than deleting rows, so the AI limits and admin aggregates keep working and Verlauf
  keeps the evaluation (date, Thema, Schwerpunkt, Tipp): the learner loses old raw text, never their
  progress record. **Audit F11 is closed.**
- **The privacy policy changed in two places**, both because the code now does something the policy
  did not describe: unused **guest** accounts are deleted after 90 days, and submitted **texts**
  after 2 years (with the sentence promising indefinite retention removed). Standing rule recorded
  in `docs/DECISIONS.md` §s185: a retention timer and the copy documenting it ship together.
- **Preview:** `preview/sync-status.html` (the three account-panel states side by side),
  screenshot-verified. The new state reuses the existing badge recipe with the warning token, so
  no new visual language was introduced.
- **Gates:** typecheck · lint 0 errors · lint:content · lint:migrations · test:unit **515/515**
  (9 new, `tests/retention.test.ts` + `tests/cloudSync.test.ts`) · build · check:bundle 124.7 kB.
- **Founder note:** merging this applies migration 0015 automatically. Nothing to paste anywhere.
