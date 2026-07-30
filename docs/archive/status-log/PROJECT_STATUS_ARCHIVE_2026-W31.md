**Handoff after session 173 (2026-07-27).** _(Archived from `PROJECT_STATUS.md` in session 175.)_

**Handoff after session 173 (2026-07-27). The app no longer refreshes work away. Merged as PR #740
(`805fff0`), branch `claude/app-refresh-data-loss-01xd0e`.**
Founder bug report: "whenever the user is working on something like writing an email or practicing an
Übung session, the update takes place and the app refreshes", losing the draft or the session. Root
cause was `src/lib/swUpdate.ts`: when a new service worker took control it reloaded unconditionally,
either immediately (within 30s of load) or **at the next resume from the background**, which is
exactly the moment a learner returns to a half-written email. Fixed in two layers:
- **Layer 1, never reload over live work.** New `src/lib/liveWork.ts` is a tiny module-level registry
  (not a store: the reloaders run outside React). A surface holding unsaved in-memory work claims it
  via the `useLiveWork(active, label, flush)` hook; `hasLiveWork()` gates every automatic reload, so
  a queued deploy simply waits and retries on each later resume. The app runs fine on the old bundle
  meanwhile. Claimants today: the Fokus / Kurz / Lang editors (non-empty text) and a running Üben run.
- **Layer 2, make any unavoidable reload recoverable.** Some reloads must still happen (a chunk-load
  self-heal in `lib/recover.ts`, a manual refresh, iOS discarding the tab), so work now persists:
  - `src/features/writing/draftAutosave.ts` (localStorage, one draft PER mode, 7-day TTL) autosaves
    500ms after the last keystroke and on unmount/pagehide, and restores on mount. It is deliberately
    a **separate key and record** from `resumeDraft.ts`: that one is the sign-in hand-off with the
    `resume: true` flag AppShell redirects on, and an autosave must never trigger that redirect.
  - `src/features/session/sessionResume.ts` (**sessionStorage**, keyed by a signature of the launch
    params, 3h TTL) snapshots plan + index + tallies + loot. sessionStorage on purpose: it survives a
    reload of the tab but dies with it, so a learner who opens Üben tomorrow gets a fresh session,
    never a silent resume. The snapshot always points at the next **unanswered** block, since an
    answered one is already graded into FSRS/XP and replaying it would double-count. Cleared on
    finish, on "Beenden", and on "Neue Runde" (with an `abandoned` ref so the unmount flush cannot
    write it back).
- `installLiveWorkFlush()` in `main.tsx` flushes every claim on pagehide / beforeunload / hidden, so
  even a reload nobody asked for lands on the restore path.
- `tests/liveWork.test.ts` (18 cases) pins the registry, per-mode draft isolation, staleness, corrupt
  storage, and that a snapshot never resumes into a differently-scoped session.
- **Not verifiable from the sandbox:** service-worker update behavior needs the live site. What the
  founder should see after the deploy: backgrounding the app mid-draft and returning no longer wipes
  the editor, and a refresh restores both the text and its Aufgabe. Hard-refresh once first, since a
  stale service worker can still serve the pre-fix build for one launch.
- **Worth knowing for the next reload-ish change:** the rule is now a CLAUDE.md hard invariant, so any
  new surface that holds in-memory work must both claim `useLiveWork` AND persist itself. Persisting
  alone is not enough (the reload still throws away the on-screen state around the draft), and
  claiming alone is not enough (a chunk-load self-heal ignores no-one's convenience).
- **Deliberately NOT done:** no "a new version is available, reload?" toast. The founder's report was
  about interruption, and a banner is a second interruption; the queued-update-on-next-safe-resume
  path ships the same deploy without asking anything of the learner. Revisit only if a deploy ever
  needs to be forced out mid-session (e.g. a broken backend contract).


---

**Handoff after session 174 (2026-07-27).** _(Archived from `PROJECT_STATUS.md` in session 175.)_

**Handoff after session 174 (2026-07-27). Full security audit:
`docs/reports/security-audit-2026-07-27.md`.**
Full-surface review (bundle · five Edge Functions · twelve migrations · CI · dependency tree), not a
diff review. The architecture held up: RLS covers every table, no injection sink exists in `src/`,
the CSP is enforcing, CI actions are SHA-pinned, secrets are server-side only, and `delete-account`
derives its user id from the JWT alone. Thirteen findings; three fixed in this pass.
- **Fixed here.** (1) Writing drafts (`genauly.writing.autosave` / `.resume`) were in no teardown
  path, so on a shared device the next learner opened Schreiben into the previous one's text, and an
  erasure request left it on disk for a week. Now cleared from `clearLocalAccountData()` (sign-out +
  deletion) and, autosave only, from the shared-device branch of `startCloudSync()` (the resume draft
  is kept there on purpose: that branch is also the login-wall hand-off). (2) `submit-feedback` is
  unauthenticated by design and its per-IP guard reads the caller-supplied `x-forwarded-for`, so row
  insertion was unbounded; the hourly count that already gates email is now also a hard storage
  ceiling (`FEEDBACK_HOURLY_ROW_CAP`, default 300). (3) The GDPR export omitted `sentence_checks` /
  `sentence_ai_ops`, i.e. every sentence the learner wrote in Fokus.
- **The one item that needs the founder (F1, high).** Admin access is `auth.jwt() ->> 'email' in
  (two Gmail addresses)`, with no check that the address was ever verified, and
  `config.toml` has `enable_confirmations = false`. If the hosted project matches that, and if
  either address is not already registered, anyone can claim it via the guest-upgrade path
  (`updateUser({email})`, `useAuthStore.ts:121`) and get the feedback inbox plus `app_config` write.
  **`supabase/migrations/0013_admins_table.sql` fixes it, and the founder applied it on 2026-07-27**:
  it moves
  the gate onto an `admins(user_id)` table (service-role only, no client policies), seeds it from the
  accounts holding those addresses today, and REFUSES to swap `is_founder()` if the seed matched
  nobody, so a wrong address errors out instead of locking everyone out. It also re-points the last
  hard-coded email policy (`provenance_reviews`, from 0007) at `is_founder()` and pins `search_path`
  on both helpers (F12). Idempotent, rollback in a trailing comment, pinned by `tests/admin.test.ts`.
  Turning "Confirm email" on is a SEPARATE, later task: Supabase's built-in mailer is rate-limited to
  a few messages an hour, so it needs real SMTP first or sign-ups start failing.
- **Also open:** `pnpm audit` is no longer 0 (7 high + 3 moderate); react-router 6.x has an open
  redirect with **no fix in the 6.x line**, so a 6→7 migration needs scheduling (the app is not
  reachable through it today — every `navigate()` target is built from internal ids, and that is now
  a rule worth keeping). Lower: `*.github.io` is still wildcard-allowlisted on every function; the AI
  daily/monthly limits are check-then-act so parallel requests slip past them (bounded by the $5
  fuse); `log_gdpr_event()` is callable by `anon`; no retention job on learner text.
- **Then the audit's own recommendation broke sign-up, which turned out to be a good thing.** The
  founder switched "Confirm email" ON, and email sign-up stopped working: clicking the link
  confirmed the account server-side but never signed anyone in, and coming back to the (default)
  "Konto erstellen" tab produced a "confirm your email" toast that would never come true. TWO
  independent bugs, neither introduced by the audit, both live since email sign-up existed:
  - **The link could not deliver a session.** Supabase's default template returns it in the URL
    HASH; React Router rewrites the URL as it mounts, so the tokens were gone before any code read
    them, and the client runs PKCE, which does not look there anyway (the same collision
    `lib/supabase.ts` documents for Google). `src/lib/authCallback.ts` now snapshots the parameters
    at module-eval time (imported FIRST in `main.tsx`, before `createRoot`), and the new ungated
    route **`/auth/confirm`** (`features/auth/ConfirmEmail.tsx`) completes the sign-in. It accepts
    all three shapes (`token_hash` → `verifyOtp`, hash tokens → `setSession`, `?code=` already
    consumed by supabase-js), so it works with or without the branded template. `signUp` pins
    `emailRedirectTo` to the running origin, so a wrong Site URL can no longer strand a learner.
  - **A second sign-up with the same address looked like a fresh one.** With confirmations ON,
    Supabase answers an already-registered address with a success-shaped response and NO error (it
    will not reveal which addresses exist), so `needsConfirmation` was true. The tell is an empty
    `identities` array: `signUp` now returns `alreadyRegistered` and the dialog switches to Anmelden
    with the address kept. The existing `friendlyError` "already registered" mapping never fired
    because that path produces no error to map.
- **Auth dialog reworked** (all three founder complaints): password reveal toggle; the AGB checkbox
  moved from the top of the dialog to directly above the button it gates; the primary and Google
  buttons no longer sit disabled-at-default but always act and NAME the first unmet requirement in
  one message slot; and the confirmation state became a panel that keeps the dialog open, shows the
  address and offers "E-Mail erneut senden". Screenshot from the real component:
  `preview/auth-dialog.html` (open it with `pnpm dev`).
- **Caught by the new tests:** the dialog's reset effect listed `clearError` in its dependencies, so
  any store handing back a fresh action identity per render wiped the consent tick and the pending
  panel the instant they were set. Now a ref synced in its own effect.
- **Gates:** typecheck · lint 0 errors (75 warnings, same as the untouched tree) · test:unit
  **363/363** · build · check:bundle 122.9 kB.
- **Then four rounds of live debugging (#743, #744, #745), all from one founder report that started
  as "login with email doesn't work now".** Worth reading before touching auth or sync: the report
  was accurate, my first two diagnoses were not, and the fault was nowhere near where I was looking.
  - **#743, two real defects on the log-in path, neither the reported one.** `signIn` inferred
    `needsConfirmation` from a response carrying no session as well as from the error, so a correct
    password could be answered with "check your inbox"; and an unconfirmed account had the whole
    log-in form replaced by the sign-up "check your inbox" panel, which claims a link was just sent
    (untrue there) and removed the only way in. `pending` and `resendFor` are now separate states.
  - **#744, after the founder added "with a secondary account, it redirects me to landing page".**
    That sentence reframed everything: the sign-in was SUCCEEDING. `RequireOnboarding` sent every
    resolved not-onboarded visitor to `/welcome`, i.e. the page that asks you to sign up, which is
    indistinguishable from a failed log-in. Signed-out still goes there; an account holder now goes
    to `/start`. A successful sign-in FROM a public page also now hands over to `/`, because the
    dialog closing left the learner on a landing page still showing "Start free".
  - **#745, the root cause, and it explains all three symptoms.** `mergeRemoteSettings` decided
    whether to adopt a cloud profile with `if (!profile.name) return`. Onboarding collects goal,
    mode and level and NO name, so `name` was `""` for every account ever created and the guard
    bailed every time. Since a sign-in wipes the local cache first (account isolation, deliberate),
    `onboarded` could only return from the cloud, and never did. Latent since that line was written:
    any learner signing in on a second device silently lost their level and goal. Adoption now tests
    `settings.onboarded`, which still rejects the empty row the sign-up trigger creates.
  - **The rule that came out of it, now a CLAUDE.md invariant:** when a check needs to know whether
    state exists, ask the flag that means that, never a field that usually accompanies it. A proxy
    that is right most of the time fails silently and permanently when it is wrong.
- **Gates across the round:** typecheck · lint 0 errors (75 warnings) · test:unit **370/370**
  (+7 over the audit PR: `authDialog` router destinations, `cloudSync` profile adoption) · build ·
  check:bundle within budget.
- **Next:** Resend SMTP is the one open founder action (`docs/reference/auth-emails/README.md`).
  Then, when scheduled, the react-router 6 → 7 migration from audit F2. **The founder should expect
  onboarding ONCE more per account** after #745: that run is what finally writes a flag the app can
  read back.


---

**Handoff after session 175 (2026-07-28), first task.** _(Archived from `PROJECT_STATUS.md` in session 175.)_

**Handoff after session 175 (2026-07-28). Fokus mobile tiles: 10% shorter from the bottom.**
Branch `claude/fokus-tile-height-9lxw8g`.
Founder: the two mobile Fokus tiles looked cramped. They filled the room between their top and the
fixed bottom chrome exactly, so the sentence card and the Grammatik dial tile ran right into the
Korrigieren cluster.
- `measureMobile` in `src/features/writing/fokus/FokusTrainer.tsx` now keeps `FILL_RATIO = 0.9` of
  the measured room (floor 240px, was 260px unscaled). The top of the column is unchanged, so the
  10% comes off the BOTTOM and the tiles stop short of the chrome. Both the exact `height` used
  before a correction and the `minHeight` used after are scaled, so a long correction still grows
  the page as before.
- The mobile column gap went `gap-4` → `gap-5`, which is the "breathing space between the tiles"
  half of the request; the tiles keep their `grow-[1.15]` / `grow` ratio, so both shrink evenly.
- Nothing else in the locked Schreiben mobile anatomy moved: the fixed cluster and KI line, the
  `bottomLimit()` picker floor and the desktop layout are untouched. `docs/areas/SCHREIBEN.md`
  records the 90% rule.
- **Gates:** typecheck · lint 0 errors (75 warnings, unchanged) · build. Phone verification is the
  founder's, as usual.


---

**Handoff after session 175 (2026-07-28), second task.** _(Archived from `PROJECT_STATUS.md` in session 176.)_

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

**Handoff after session 175 (2026-07-28), third task.** _(Archived from `PROJECT_STATUS.md` in
session 177.)_

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

---

**Handoff after session 176 (2026-07-28).** _(Archived from `PROJECT_STATUS.md` in session 178.)_

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

---

**Handoff after session 177 (2026-07-28).** _(Archived from `PROJECT_STATUS.md` in session 178.)_

**Handoff after session 177 (2026-07-28). Complaint response pack 2 (cleaning-service focus): 60 new
items.** Branch `claude/complaint-response-vocab-cwlqvj`.
Founder supplied a second B2/C1 word field for answering a written complaint, this one framed around
a **Reinigungsservice** (cleaning-service) customer relationship: referring to the complaint,
apologising, naming problems and causes, staff-shortage vocabulary, taking action, giving assurance,
future improvements, customer-service nouns, formal closings, plus its own "high-frequency verbs /
nouns / connectors" glossary sections.
- **Audited against the s176 pack first, not just the live banks.** The two word fields overlap
  heavily (both are "answering a complaint" business German), so the real risk was re-adding items
  session 176 already shipped. Loaded `vocabulary` / `collocations` / `redemittel` through Vite
  (same `ssrLoadModule` approach as s176; a `de:`/`full:` regex misses most one-line entries) and
  checked every item, including the three glossary sections, against it. **~90 of the ~150 requested
  items were already covered** (`bezüglich`, `hinsichtlich`, `in Bezug auf`, `aufgrund`, `infolge`,
  `entstehen`, `auftreten`, `vorkommen`, `verursachen`, `Beschwerde`, `Beanstandung`, `Mangel`,
  `Vorfall`, `Verzögerung`, `Unannehmlichkeit`, `Personalengpass überbrücken`, `Verständnis haben
  für`, `Maßnahmen ergreifen`, `alles daransetzen`, `um Entschuldigung bitten`, `sich aufrichtig
  entschuldigen` …). **60 new items.**
- **Split by the bank rules, same as s176.** 38 Wörter (the cause set `sich ereignen/feststellen/
  sich ergeben/beeinträchtigen/hervorrufen/auslösen/führen zu`, the staffing set `Personalmangel/
  Personalengpass/Krankheitsfall/Ersatzpersonal/Reinigungspersonal/die Mitarbeitenden/das Personal/
  die Fachkraft`, the customer-facing set `Dienstleistung/Service/Reinigung/Räumlichkeiten/Objekt/
  betreuen/einsetzen/einstellen`, and connectors `wegen/bedingt durch/verursacht durch/künftig/
  zukünftig/krankheitsbedingt/vorübergehend`); 18 Kollokationen for the idioms (`Bezug nehmen auf`,
  `jemanden auf etwas aufmerksam machen`, `sein Bedauern ausdrücken/aussprechen`, `um Verständnis
  bitten`, `es kommt zu etwas`, `eine Beschwerde geht ein`, `den Ablauf beeinträchtigen`,
  `Ersatzpersonal einsetzen`, `zusätzliches Personal einstellen`, `kurzfristig Ersatz organisieren`,
  `den Vorfall untersuchen`, `den Sachverhalt prüfen`, `Verbesserungen umsetzen`, `Mitarbeitende
  schulen`, `Qualitätskontrollen durchführen`, `Maßnahmen treffen`, `Ihre Räumlichkeiten betreuen`);
  4 Redemittel (`r_mail19`-`r_mail22`, category `emails`, for the two closing lines the s176 pack
  had not covered plus the formal `Sollten Sie …` conditional-inversion opener).
- **`das Reinigungspersonal` and `die Reinigung` are `sectors: ["cleaning"]`**, the only two items
  tagged to the founder's own industry; every other item (staffing shortages, assurance language,
  formal closings) stays untagged/universal, since that vocabulary applies to any service business
  answering a complaint, not just cleaning. The app already ships a sizeable `cleaning`-sector pack
  (`v_reinigungskraft`, `v_gebaeudereinigung`, `v_reinigungsplan` …); this adds the missing base
  nouns (`die Reinigung`, `das Reinigungspersonal`) without duplicating the trade-specific compounds.
- **Verbs that only ever appear inside one idiom stayed out of the Wörter list** (`untersuchen`,
  `schulen`, `organisieren`'s new object, `der Sachverhalt`), matching how s176 left `ergreifen`,
  `schaffen`, `nachgehen` etc. collocation-only. Verbs the founder listed in a dedicated
  "High-Frequency B2 Business Verbs" glossary (`betreuen`, `einsetzen`, `einstellen`, `untersuchen`,
  `analysieren`, `mitteilen`, `verhindern`, `dafür sorgen`) got standalone entries instead, since a
  founder-authored glossary section is itself a request for reusable vocabulary, not just collocation
  filler.
- **`verify:cefr` flags 2 of the new items** (`v_sich_ergeben`, `v_verursacht_durch`, both claimed
  C1 against a B1.1 raw-frequency score). Kept as labelled, same reasoning as the 8 flags in s176:
  the check scores corpus frequency, not formal register, and both are ordinary in *spoken* German
  while distinctly formal/written in this business sense. Warn-only by design.
- **Gates:** lint:content ✔ (1,743 vocab · 1,072 collocations · 158 Redemittel · 3,273 provenance) ·
  build:frequency-subset + build:frequency (regenerated; `wordfreq` needed a fresh `pip install` in
  this sandbox) · build:oracles + verify:facts ✔ 0 gate errors, all 8 new-item signals are
  "not covered" (no oracle entry for a compound/rare word), none is a real mismatch · build ·
  check:bundle 123.2 kB · lint 0 errors (75 warnings, unchanged) · test:unit 370/370 ·
  report:exercise-coverage (20/20 green) · build:review-queue.
- **Next for this content:** `draft` like everything else; lands in the `/admin/pruefen` review
  queue. No writing prompt, Can-Do or text was added, so exercise coverage is unchanged.
- **Shipped:** **PR #755**, squash-merged as `cbacc98`. Post-merge housekeeping done: branch reset
  onto `main`, working tree clean.
