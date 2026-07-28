# Project Status

_Last updated: 2026-07-28 (session 176). **Formal complaint response pack (B2/C1 business German).**
A founder-supplied word field for answering a written complaint was audited against the banks: 41 of
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

**Content banks (as of 2026-07-28, session 176, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,705** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,054** · Redemittel **154** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,213
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **all** provenance rows are AI-drafted and `draft`, none human-verified
(human verification was reset to zero on 2026-07-22 at founder request, to restart the review pass;
see `strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
- [x] ~~Paste `supabase/migrations/0013_admins_table.sql`.~~ **APPLIED 2026-07-27** by the founder in
      the SQL editor, without the lock-out guard firing (it raises rather than swapping the gate when
      the seed finds no account, so a clean run means `public.admins` is seeded). Audit F1 closed:
      the admin gate is now a user-id table, not an email claim. Live confirmation that `/admin`
      still opens is the founder's last check; the rollback to the 0008 email gate sits in a comment
      at the foot of the migration if it ever does not.
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

**Handoff after session 175 (2026-07-28), third task. The PWA precache ceiling, defused on its own.**
Merged as **PR #750** (docs) and **PR #751** (this fix). Branch `claude/pwa-precache-fix`.
Salvaged from the parked word-field branch, because the problem is not about words at all.

- **What was actually wrong.** The `/sources` + `/admin/pruefen` workbench chunk bundles the entire
  provenance + verification register, so its size tracks the content banks and nothing else. Workbox
  refuses to precache any single asset over **2 MiB** and **fails the build** when it meets one; it
  does not warn and carry on. On `main` the chunk measured **1,963.67 kB** at 3,107 provenance rows.
  The ceiling is 2,097 kB, and each new content item costs roughly 0.6 kB across the two registers,
  so `main` was about **200 content items** from a build failure whose error message names the
  service worker and never mentions the content that caused it.
- **The fix.** `vite.config.ts` adds `**/useWorkbench-*.js` to `globIgnores`. The chunk is
  founder-only and needs a live connection to load review data anyway, so precaching it into every
  learner's cache bought nothing. It now loads on demand, unchanged in behaviour. The comment in the
  config explains the trap so the line does not get "tidied away" later; `docs/areas/CONTENT.md`
  carries the same warning next to the register description.
- **Measured effect.** PWA precache **6,947 KiB → 5,029 KiB** (121 entries, was 122): a ~1.9 MB
  smaller first load for every learner, on top of removing the build risk. The chunk itself is
  unchanged at 1,963.67 kB; it is simply no longer precached.
- **Proof it works.** On the parked branch the same build failed at a 2.11 MB chunk and passed with
  this line present, chunk size unchanged. That is the before/after.
- **Gates:** `typecheck` · `build` green · `lint` 0 errors (75 warnings, unchanged) · `test:unit`
  370/370 · `check:bundle` 123.2 kB of 400 kB · `lint:content` clean (banks untouched).
- **Correction to an earlier estimate in this session:** the headroom was reported to the founder as
  "about 60 rows". Measured properly it is ~200 content items. Worth fixing, not an emergency.

**Handoff after session 176 (2026-07-28). Formal complaint response pack: 110 new items.**
Branch `claude/business-german-vocabulary-36z6ua`.
Founder supplied a B2/C1 business-German word field (answering a written complaint: reference,
apology, cause, event organisation, catering, responsibility, improvement, customer relationship,
closings, idioms, connectors) and asked what was already in the app, with the rest added.
- **Audit first, then add.** All 151 requested items were checked against `vocabulary` /
  `collocations` / `redemittel` loaded through Vite (not grepped: the banks are one-line entries and
  a naive `de:` regex finds only 3% of them). **41 already shipped** (`v_beschwerde`, `v_anliegen`,
  `v_bedauern`, `v_entschuldigen`, `v_mangel`, `v_massnahme`, `v_verantwortung`, `c_verständnis_zeigen`,
  `c_verantwortung_uebernehmen_sust`, the connectors `deshalb/jedoch/dennoch/zudem/außerdem/allerdings` …).
  **110 added.** `r_mail8` ("Für Rückfragen stehe ich Ihnen gern zur Verfügung.") already covered one
  requested closing, so it was not duplicated.
- **Split by the bank rules, not by the founder's headings.** The 17 Nomen-Verb idioms in the
  founder's "Redemittel" section went to **Kollokationen** (`Maßnahmen ergreifen`, `Abhilfe schaffen`,
  `zur Kenntnis nehmen`, `in die Wege leiten`, `dafür Sorge tragen`, `einer Angelegenheit nachgehen`,
  `den Erwartungen gerecht werden`, `einen reibungslosen Ablauf gewährleisten` …), because a noun+verb
  combo in the Wörter list shows up article-less and the linter errors on the overlap. Only the
  sentence frames became Redemittel (`r_mail14`-`r_mail18`, category `emails`).
- **`verlegen` needed a collocation, not a second word.** `v_verlegen` already ships in the
  `wohnen`/trades sense ("to lay tiles"); the business sense is now `c_termin_verlegen`.
- **19 formal connectors + 5 genitive prepositions** are tagged `pos: "connector"` (there is no
  `preposition` value and adding one would mean a new closed enum for four items); the genitive
  government is stated in each `context`.
- **`verify:cefr` flags 8 of the new connectors** (`somit`, `ferner`, `angesichts`, `vielmehr`,
  `bezüglich`, `in Bezug auf`, `hingegen`, `beziehen auf`) as "common word, advanced label". Kept as
  labelled: the check scores raw corpus frequency, and these are frequent in *written* German while
  functionally B2/C1 by register. Warn-only by design.
- **Gates:** lint:content ✔ (1,705 vocab · 1,054 collocations · 154 Redemittel · 3,213 provenance) ·
  build:frequency-subset + build:frequency (regenerated; note `wordfreq` must be pip-installed in a
  fresh sandbox) · build:oracles + verify:facts ✔ 0 gate errors, no new review signals ·
  build · check:bundle 123.2 kB · lint 0 errors · test:unit 370/370 ·
  report:exercise-coverage (20/20 green) · build:review-queue.
- **Licensing: settled, given the s175 precedent one handoff up.** The founder confirmed the word
  field is **personally curated**, not taken from a published source. A self-made selection carries no
  third-party compilation right (§4 UrhG) and no database right (§§87a-87e UrhG), which were the two
  exposures that parked the telc pack, and every shipped artifact here (examples, glosses,
  pronunciation hints, context notes, CEFR tags, theme assignments) is authored in-repo. **Nothing
  about this pack needs revisiting; do not re-open it by reading the s175 handoff alone.**
- **A defect this session introduced and fixed, worth not repeating.** The documentation pass used a
  whole-file string replace whose anchor text was not unique, so a licensing note landed inside the
  **session-175 parked-pack prompt-log entry** as well as the intended one. `SESSION_PROMPT_LOG.md` is
  append-only, so writing into a shipped entry is a real defect. It is restored to what shipped in
  PR #750. **Rule: assert the match count before replacing in an append-only or long doc**, or edit by
  anchor with surrounding context. The same check caught the next attempt before it wrote.
- **Next for this content:** it is `draft` like everything else, so it lands in the `/admin/pruefen`
  queue for the human review pass. No writing prompt, Can-Do or text was added, so exercise coverage
  is unchanged.
- **Shipped:** **PR #752** (the pack, squash-merged as `7197a44`) and **PR #753** (the licensing
  answer + the log restore, squash-merged as `810a405`). Branch reset onto `main`, working tree clean.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
