# Project Status

_Last updated: 2026-07-28 (session 175). **A latent build-breaker is defused, and a 238-item word-field
pack is parked.** The `/sources` workbench chunk bundles the whole provenance register, so it grows
with the content banks; at ~1.96 MB it was roughly **200 content items** from workbox's 2 MiB
precache ceiling, which **fails `pnpm build`** rather than warning. `vite.config.ts` now keeps that
founder-only chunk out of the precache, so the next content pack cannot break the build, and every
learner's first load drops **6,947 KiB → 5,029 KiB**. The pack that surfaced it stays parked on
`claude/word-list-validation-br3u2g`: the word list came from photographed pages of a commercial telc
B2 Beruf coursebook, and `strategy/DATA_GOVERNANCE.md` puts telc materials on the do-not-use list and
forbids copying a published word list wholesale. **PR #749 was withdrawn**; bank counts below are
unchanged and still describe live `main`. Prior s175: **Fokus mobile tiles
breathe.** The two mobile Fokus tiles
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

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,107
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

**Handoff after session 175 (2026-07-28), second task. A word-field pack built, gated, then PARKED
on licensing grounds.** Branch `claude/word-list-validation-br3u2g` (commit `9032660`), **not merged**.
Founder sent four photos of a **telc Deutsch B2 Beruf Wortschatzliste** and asked which words the app
already had, with the rest added at audit-ready quality. The work was done and every gate passed. It
was then parked, unshipped, because of where the list came from. Nothing reached `main`.

**Why it is parked (read this before reviving the branch).** `docs/strategy/DATA_GOVERNANCE.md`
§"What counts as traceable" already answers the question the founder asked afterwards:
> "A specific published word list (Goethe Wortliste, telc, Klett) can carry compilation / EU database
> rights in its selection and arrangement, so we never copy a protected list wholesale. We verify
> individual entries against open references instead."

and the same file lists **telc materials** under "Sources we do NOT use", as does the "Sources to
avoid" table in `PROJECT_REFERENCE.md`. The branch does the forbidden thing: it transcribes the list
page by page, keeps the book's section order, and names the book's chapters in the code comments and
in all 238 provenance notes. That rule should have been checked before transcribing, not after.

**The legal shape of it, for whoever picks this up.**
- **The words are safe.** Single German words, their articles and plurals are facts; nothing owns
  "der Absolvent". Any of them is usable if verified against DWDS or Wiktionary, which is what the
  policy prescribes and what the branch already did.
- **The authored material is safe.** The 464 example sentences, glosses, pronunciation hints, context
  notes, related terms, CEFR tags and theme assignments are original and appear in no book.
- **The selection and arrangement are the exposure.** Two rights: §4 UrhG (creative compilation) and,
  the sharper one, the **sui generis database right** (§§87a-87e UrhG, EU Directive 96/9/EC), which
  needs no creativity, runs 15 years, and is infringed by extracting a substantial part.
- **Trademark is already handled.** `TermsOfService.tsx` states in both languages that Genauly is not
  affiliated with, endorsed by, or a source of Goethe-Institut or telc material. Naming the exam is
  lawful nominative use; keep the disclaimer wherever telc appears.

**If the branch is revived,** the fix is to remove the structural fingerprint rather than the
vocabulary: drop the book's chapter names from the section comments and the 238 provenance notes,
re-derive the selection from the app's own `frequency.ts` bands plus the sub-theme taxonomy (an
independent, defensible rationale), and cut the handful of entries that only exist because they were
on that page (`der Fluggerätemechaniker`, `das Zweigwerk`, `die Lagerliste`, `das Pflegezertifikat`,
`das Präsenzseminar`). Most of the pack is ordinary B2 workplace German that any independent
selection would reach anyway, so the overlap alone is not the problem.

**What is on the branch, if it is ever wanted.** 232 vocabulary entries in `vocabularyPart2`, 6
Nomen-Verb combos in the collocation bank (`Kenntnisse erwerben`, `zur Verfügung stehen`,
`Produkte einführen`, `Ruhe bewahren`, `das Du anbieten`, `den Schluss nahelegen`), and 238 matching
provenance rows. Gates all green: `lint:content` · `build` · `verify:facts` 0 errors at 98% oracle
coverage · `build:frequency` · `build:verification` · `lint` 0 errors · `test:unit` 370/370 ·
`check:bundle` 123.2 kB · `report:exercise-coverage` 20/20 · `build:review-queue`. Two gate findings
were fixed in the branch: `die Geldsorgen` lost its `plural` field so the plurale-tantum detector
recognises it, and `sich behaupten` moved B2.2 → B2.1, restoring `verify:cefr` to 0 FLAG.

**One finding on the branch is worth salvaging independently of the content.** The growing provenance
and verification register pushed the founder-only workbench chunk past workbox's **2 MiB per-asset
precache ceiling**, which fails `pnpm build` outright. The branch fixes it by adding
`**/useWorkbench-*.js` to `globIgnores` in `vite.config.ts`, so `/sources` and `/admin/pruefen` load
on demand instead of being precached into every learner's cache (PWA precache 7,155 KiB → 5,174 KiB).
**This will bite again on the next sizeable content addition, from any source.** Worth cherry-picking
on its own.

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

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
