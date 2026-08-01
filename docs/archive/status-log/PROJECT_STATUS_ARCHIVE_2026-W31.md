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

---

**Handoff after session 178, part 1 (2026-07-30).** _(Archived from `PROJECT_STATUS.md` in session 178 part 3; the full report is `docs/reports/CONTENT_AUDIT_2026-07-30.md`.)_

**Handoff after session 178 (2026-07-30). Full content audit: coverage, quality, real-world
frequency, fitness for B1–C1.** Branch `claude/app-content-audit-92sgh1`.
Founder asked for a detailed audit of the app's content. Report:
**`docs/reports/CONTENT_AUDIT_2026-07-30.md`** (measured, not estimated: every bank loaded through
Vite `ssrLoadModule`, cross-read against the four generated verify reports). **Docs-only session, no
bank or code change.** The verdict in one line: *structurally excellent, pedagogically lopsided.*
- **What is genuinely strong.** 3,896 content items, 100% provenance coverage, 0 gate-level
  article/plural errors across 1,366 nouns (two-oracle), 99.4% of 5,236 German sentences clean
  through LanguageTool, every vocab item with 2 examples + pron + context + related, 117/117 drills
  and 108/108 text checks with explanations, 335/335 dialogue options with feedback + quality + uses.
  95.3% of examples contain their own headword, so exercise generation is near-maxed (20/20 themes
  green). The **collocation bank is the best asset**: 71% at "häufig" or above.
- **The five findings that matter**, in order: (1) **C1 is a level with no content** (0 grammar,
  0 texts, 0 Can-Do, 34 words) while onboarding offers it; (2) **the bank is 79% nouns / 13% verbs /
  5% adjectives**, and verbs carry no Partizip II, no auxiliary and **0 of 234 state case or
  preposition**, so plateau accuracy is untrainable; (3) **texts are 90 words median** (exam Lesen is
  300-450) and listening is 6 TTS voicemails; (4) **the Sprechen + Prüfung content is dark** (30
  dialogues, 335 coached options, 15 exam sets behind `/anwenden`, off the nav since 2026-07-13),
  and 20 of 30 scenarios have no free-speak node; (5) **54.3% of vocabulary is below Zipf 3.5** and
  B2.2 is 82% Fachsprache compounds, so "advanced" is being encoded as "rare".
- **Two live defects found, not just untidiness.** `translationQ` (`engine/quiz.ts:149`) filters
  distractors by id only, never by `en`, and **5 English glosses collide inside a single theme**
  (`deadline`, `business trip`, `user interface`, `evacuation`, `health insurance card`), so a
  translation MCQ can render the same option twice. And `v_konferenz_raum` / `v_konferenzraum_hotel`
  are the **same word, same theme, same CEFR, same pron** (a pure duplicate = two SRS cards);
  `v_ausweis_pass` / `v_reisepass` duplicate `der Reisepass` at two levels with two different
  pronunciation respellings.
- **The `pron` field is two systems, quantified.** /aɪ/ is spelled `y`/`ey` in 176 items and `ai` in
  83; /ɔʏ/ is `oy` in 21 and `oi` in 13; /x/ is `kh` in 148 and `x` in 7. The split tracks authoring
  waves (148 of the 176 `y` items are workplace themes; 69 of the 83 `ai` items are daily-life), and
  `v_einerseits` mixes both inside one string (`EYE-ner-zaits`). No scheme is documented, so nothing
  lints it.
- **The s21 repositioning has not reached the bank.** 63% of vocabulary is still `beruf`; the five
  newest `alltag` packs are 49 words each. Sub-themes are inverted: all 10 daily-life themes have 4
  each, but 8 of 10 workplace themes have **none**, so 59% of vocab carries no `subThemeId` in exactly
  the themes with the most content.
- **A stale doc claim, corrected here.** The counts block said "none human-verified"; there are **13**
  (vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset). Counts also refreshed from
  s176 to live values.
- **Ranked backlog (P1-P10) with a cheapest-first-step column is in §5 of the report.** Nothing was
  implemented: the founder decides what to spend content effort on. The three open founder rejects
  (`v_ansprechpartner`, `v_bedenken`, `v_scope_creep`) are still unresolved in the bank.
- **Gates:** `lint:content` clean (banks untouched). No build/test run needed: docs-only.

**Handoff after session 178, part 2 (2026-07-30). Audit P0 + P2 shipped; P2's display and P1 await a
founder pick.** Branch `claude/app-content-audit-92sgh1`.
Founder: "start one working with p0-p2 items". Three commits on top of the audit.
- **P0, two learner-visible defects, both gated so they cannot return.**
  (1) A quiz could show the same option twice, one of them the answer: `translationQ` and the cloze,
  listening-cloze, collocation-fill and matching builders filtered distractors by `id` only, while 5
  English glosses collided INSIDE one theme (`deadline` = v_frist + v_deadline, plus business trip /
  user interface / evacuation / health insurance card). Option assembly now dedupes on the rendered
  LABEL (`mcqOptions`, `distinctPairs` in `engine/quiz.ts`) and degrades to a shorter option list
  rather than an ambiguous question. (2) Two words shipped twice: `der Reisepass` as v_ausweis_pass +
  v_reisepass and `der Konferenzraum` as v_konferenz_raum + v_konferenzraum_hotel (same theme, same
  level, same pron), each giving a learner two SRS cards for one word; the weaker of each pair is
  retired. **Note the id `v_ausweis_pass` reads like "der Ausweis" but its headword always was "der
  Reisepass"**; `der Personalausweis` is a separate, correct entry.
  Fixed at the source too: the 5 glosses now carry the real nuance, a missing comma in
  `v_monatskarte`, and `Samstag Vormittag` -> `Samstagvormittag`.
  **CO2 is now ASCII everywhere, overruling the LanguageTool suggestion on purpose:** the bank shipped
  both spellings and `normalizeTyped`/the fuzzy search normalizer strip the subscript, so a learner
  typing "CO2-Ausstoß" was graded WRONG against "CO₂-Ausstoß" and could not find it by search.
  New linter gates: duplicate headwords (erroring only when the gloss or theme matches too, so real
  homonyms like `der Empfang` warn instead), same-theme gloss collisions, and any subscript digit in a
  typed or searched field. `tests/quizOptions.test.ts` pins the engine with a SYNTHETIC colliding pair,
  verified to fail against the old assembly (the bank-wide assertions alone passed either way, since
  fixing the data removed the trigger).
- **P2, all 234 verbs now have the forms needed to PRODUCE them.** Nouns have carried article + plural
  since day one; verbs carried nothing. New generated `src/data/verbForms.ts` (Partizip II, auxiliary,
  Präteritum, `separable`, zu-infinitive), built by `pnpm build:verbs-subset` (vendors an oracle from
  `german-verbs-dict`, MIT, LanguageTool upstream, the same family as the existing noun oracle) then
  `pnpm build:verb-forms`. Generated rather than authored because a wrong Partizip II teaches an error
  a learner repeats for years: 225 of 234 are dictionary-attested, 9 come from the regular weak
  paradigm and are marked `source: "rule"`.
  **Four upstream defects had to be corrected, each with a rule, all caught by spot-checking output:**
  empty stubs (`aufrechterhalten` is `{}`) short-circuited the particle rule; `hasPrefix` is not always
  set, so separability is now read off the participle's internal ge- (teilgenommen splits,
  unterschrieben does not), fixing "teilnahm" -> "nahm teil"; a corrupt strong variant of the
  `bereiten` family gave "beritt vor", so a weak participle now forces a weak Präteritum ("bereitete
  vor"); and pre-1996 ß spellings ("faßte zusammen" -> "fasste zusammen"), decided by the participle's
  own spelling rather than by guessing vowel length.
  **The auxiliary is the one hand-maintained field** (no open lexicon carries it): 14 sein-verbs are
  listed in the generator with a reason each, defaulting to haben, which is correct for every
  transitive and every reflexive so an omission fails safe. That surfaced a real content error:
  `v_sich_ereignen`'s prose claimed "Perfect with 'sein'", but a reflexive always takes haben. Fixed,
  and the linter now cross-checks prose against the structured auxiliary. Coverage is an ERROR, not a
  warning. `tests/verbForms.test.ts` adds 7 checks (participle endings, no fused separable Präteritum,
  paradigm consistency, post-1996 spelling, reflexive-implies-haben, 8 spot-checked forms).
- **The card display shipped mid-session: founder picked variant C** from
  `preview/verb-forms-card.html` (A-D were one foot pill · two pills · pill + full list on the flip
  side · plus a separability dot). Implemented exactly: front foot shows `Perf.: hat verschoben` in the
  SAME slot and styling as `Pl.: die Termine`, so that row is now "this word's inflection" per part of
  speech; the back repeats it in full as a compact Präteritum · Perfekt · mit zu · trennbar grid, each
  row only when the data has it. `FlipCard` stacks both faces in one grid cell, so the tile grows to the
  taller face and nothing clips. New `src/lib/verbDisplay.ts` turns the stored infinitive auxiliary into
  the citation form ("hat verschoben" / "ist entstanden" / "hat/ist gependelt").
  **One deliberate deviation from the approved preview, flagged to the founder:** the row reads
  **Perfekt**, not "Partizip II", because "hat verschoben" IS the Perfekt and the bare participle is
  "verschoben"; easy to revert if they prefer the preview's wording.
- **NOT started: P1 (C1 has no content).** It is the biggest hole (0 C1 grammar topics, 0 C1 texts,
  0 C1 Can-Dos behind a level onboarding offers) and it is a content-authoring project, not a fix.
  Recommended shape when it starts: 4 C1 grammar topics none of which exist yet (Konzessiv- und
  Restriktivkonnektoren, Passiversatzformen, subjektive Modalverben, Modalpartikeln), 6 texts at
  300-400 words (which also starts P3, since today's median text is 90 words), 5 C1 Can-Dos.
- **Gates (all four commits):** lint:content clean (1 warning, the deliberate `der Empfang` homonym) ·
  build · typecheck · lint 0 errors · test:unit **388/388** · check:bundle 123.2 kB of 400 kB.

**Handoff after session 178, part 3 (2026-07-30). Audit P1 shipped: the C1 slice.** Branch
`claude/app-content-audit-92sgh1`.
Founder: "continue with the next step", after P0 and P2. P1 was the audit's biggest hole: onboarding
offers C1 and `defaultVisibleBands("C1")` returns every band, but behind the label sat 34 words,
**0 grammar topics, 0 texts, 0 Can-Dos**. A self-declared C1 learner got exactly the B2 app.
- **Four C1 grammar topics, 20 drills**, chosen so none overlapped an existing one: `g_konzessiv`
  (obgleich / wenngleich / zwar…doch / sofern / insofern als / es sei denn), `g_passiversatz`
  (sich lassen, sein + zu + Infinitiv, -bar/-lich, man), `g_subjektive_modalverben` (soll/will +
  Infinitiv Perfekt for reporting a claim, muss/dürfte/könnte for grading certainty) and
  `g_modalpartikeln` (doch, ja, mal, eben, wohl, denn).
- **A new grammar group `particles`**, mirrored in all three places the closed-enum rule demands
  (the `GrammarGroup` union, `GRAMMAR_GROUPS` in the linter, `groupMeta` + `groupOrder`). Modalpartikeln
  fit none of the existing 16: they link nothing, so they are not connectors, and they are not modal
  verbs. Placed LAST on the priority spine on purpose, since they fix no error.
- **Six C1 texts, which also start P3.** The bank's median text was 90 words against the 300-450 a
  B2/C1 reading task runs to, and at 90 words a learner reads every word, so skimming and inference
  cannot be trained. The six run **305-344 words** (Widerspruchsbescheid, Risikobericht,
  Modernisierungsmieterhöhung, Stellungnahme zur Klimabilanz, Unfalluntersuchung, Datenschutzauskunft)
  and their 18 checks ask what the text IMPLIES, not what it states. They were written short first
  (237-282) and extended, because German is more compact than the estimate and the length was the
  whole point. **`de` and `en` paragraph counts must match** (both are blank-line split and rendered
  together); noted in `areas/CONTENT.md` next to the schema.
- **Five C1 Can-Dos** above each theme's existing top threshold (meetings, conflict, customer,
  behoerde, project), describing what C1 adds: the unplanned, the implicit and the adversarial rather
  than the scripted case.
- 35 provenance rows, all `draft`. Nothing is claimed as verified, so the whole slice lands in the
  `/admin/pruefen` queue like every other bank addition.
- **Gates:** lint:content clean (1 known warning, the `der Empfang` homonym) · build · typecheck ·
  lint 0 errors · test:unit 388/388 · check:bundle 123.2 kB · report:exercise-coverage 20/20 green ·
  build:review-queue refreshed.
- **Still open from the audit backlog:** P3 beyond these six texts (listening is still 6 TTS
  voicemails), P4 (the Sprechen + Prüfung content is still off the nav), P5-P10. The ranked list with
  cheapest-first-steps stays in §5 of `docs/reports/CONTENT_AUDIT_2026-07-30.md`.
- **Shipped:** all of session 178 went to `main` as **PR #757**, squash-merged as `1c4bc83`
  (the audit, P0, P2 and P1 in nine commits), plus **#758** (`e1820a5`, the merge-SHA backfill).
  Post-merge housekeeping done both times: branch reset onto `main`, working tree clean.
- **A flake the C1 slice introduced, caught on `main` and fixed (#759).** `Validate content` went RED
  on `e1820a5`, a docs-only commit, at `tests/engine.test.ts:168`. Cause: the test asserted the
  scoped reading block by ID PREFIX (`textId.startsWith("tx_behoerde")`), which only held while every
  text id began with its theme. `tx_c1_behoerde_widerspruchsbescheid` is a behoerde text whose id
  starts `tx_c1_`, so once the composer had three behoerde texts to sample from it failed roughly one
  run in three (measured: 3 of 6 runs on the old assertion, 5 of 5 pass on the new one). The test now
  asserts `textById(...).themeId`, which is what the composer actually scopes on, plus a 40-draw loop
  so a single lucky sample cannot pass it again. **Only the test depended on the prefix**; production
  code scopes by `themeId` throughout, so nothing shipped was wrong. Lesson for future banks: a
  `tx_c1_*` id is fine, but never assert content scope through an id prefix.


**Handoff after session 179, parts 1 to 3 (2026-07-31).** _(Archived from `PROJECT_STATUS.md` in session 180.)_

**Handoff after session 179, part 3 (2026-07-31). The AI now explains itself in plain German, with
English beside it.** Branch `claude/ui-layout-buttons-cards-zkchha`. Three founder reports from the
Schreiben trainers.
- **"+6 weitere" was a dead end.** The fix tiles cap at 6 so a long text cannot wall off the card, but
  the tail had no way back. It is a TOGGLE now (expands to every correction, folds back to "Weniger");
  the cap only decides what the card opens with. Pinned in `tests/correction.test.tsx`.
- **The feedback was written for a linguist, not a learner.** "The vocabulary used is way too
  advanced." Grading level and EXPLAINING level are two different things: a C1 text is still graded at
  C1, but both prompts now ask for the prose in simple A2 German (short main sentences, everyday
  words, an example from the learner's own text, and an explicit ban on "Aufgabenerfüllung",
  "Inhaltspunkt", "Adressat", "Konnektor", "Umformulierung" and friends), plus the SAME sentence in
  equally simple English. `PROMPT_REV` (evaluate-writing) and `PROMPT_VERSION` (transform-sentence)
  were bumped so neither cache can serve prose written under the old wording. The templated spelling
  verdict was rewritten by hand to the same standard, and the one jargon line under the tip
  ("Alle Inhaltspunkte abdecken, den Adressaten und die Länge treffen") became plain German.
- **A DE/EN switch on every AI feedback text**, `src/features/writing/FeedbackLang.tsx`: the Kurz/Lang
  Tipp, every Verlauf row, and the Fokus Hinweis (which gave up its hold-to-peek `EnPeek` for it).
  Deliberately STICKY, unlike `EnPeek`: a tip is a paragraph of instruction and nobody reads a
  paragraph with a finger held down. `EnPeek` stays the pattern for LEARNING content (word cards,
  Grammatik lessons). The chip only appears when an English version exists, so nothing renders dead.
- **Shuffle clears the editor now** (founder, reversing the older "a mis-tap must not destroy work"
  rule): a new Aufgabe means a new text. The rail reset and the scope-change redraw already cleared,
  so all three paths finally agree.
- **Migration 0014 (`writing_evaluations.insight_en`) is APPLIED** (2026-07-31, by CI, see the
  part-4 handoff below). The read and the write still step down through the optional column, so a
  database without it degrades rather than breaks.
- **Gates:** typecheck · lint 0 errors · test:unit **398/398** (new: `tests/feedbackLang.test.tsx`,
  plus the fix-tile expansion case) · lint:content clean · build · check:bundle 123.2 kB.


**Handoff after session 179, part 2 (2026-07-31). The AI allowances became visible.** Branch
`claude/ui-layout-buttons-cards-zkchha`.
Founder, from the Fokus trainer: "when generating new umformen with AI, there's no count like
(2 left out of 3). Even for korrigieren, there is no count. Check the documentation on what we
agreed on and implement it neatly." The agreement was already law (s167 + the 2026-07-25 prompt):
**Fokus 10 Korrekturen · Kurz 4 · Lang 2 per day**, one Korrektur = one unit, its Umformung free.
It was only ever ENFORCED, never shown, so the first a learner knew of it was "komm morgen wieder".
- **`Heute noch 7 von 10` beside the button that spends it**, in all three trainers: Fokus under the
  Korrigieren row (desktop and mobile), Kurz/Lang under the umlaut keys sharing one line with the
  transient "Noch N Wörter" hint (hint left, allowance right). The mobile caption slot stays the
  Art. 50 note, per the s169 lock.
- **The number is the server's, not a guess.** `check-sentence` and `evaluate-writing` now return
  `dailyLimit`/`dailyRemaining` on every response (success, cache hit and limit-reached alike), so a
  limit raised via a Supabase secret shows up in the UI by itself. Before the first call of the day
  `src/lib/aiAllowance.ts` counts the learner's own rows over the SAME tables and the SAME UTC day
  boundary the functions count. When neither is available it renders nothing rather than a number it
  cannot stand behind. A cache hit in Kurz/Lang is free and correctly does NOT move the counter.
- **"Nochmal" counts its own phrasings: `2 von 3 übrig`.** Those are the NEW AI phrasings left for
  the current target form; cycling back to an already-generated one is cached and free, so it does
  not count down, and a different target form starts a fresh 3.
- **The two Edge Functions ship themselves**: `.github/workflows/supabase.yml` deploys every function
  on merge to `main`, so this needs no founder action. Until that run finishes the UI falls back to
  the row count, which is already correct.
- **Gates:** typecheck · lint 0 errors · test:unit **396/396** (two new suites:
  `tests/aiAllowance.test.ts`, `tests/fokusVariants.test.tsx`) · build · check:bundle 123.2 kB.

**Handoff after session 179 (2026-07-31). Bibliothek card grids and the floating toolbar.** Branch
`claude/ui-layout-buttons-cards-zkchha`. Founder, from a screenshot of the Wörter Karten view: the
view-button row has a blur background and should be completely transparent so the buttons look like
they float, with enough space above them; and the cards do not have the same dimensions. Follow-up in
the same session: add a "go to top" button to the bottom right on desktop, where it was missing.
- **The toolbar row is transparent in every state** (`browseHeaderClass`). It used to fade in a
  `bg-background/90 backdrop-blur` mask once the page scrolled, which is the blurred band the founder
  saw. The row now only sticks and collapses; the ViewSwitcher track and the Filter/Bookmark/Search
  icon buttons carry `shadow-soft` so they lift off the cards moving underneath, and `pt-3` gives the
  clearance under the app header.
- **The level-band chip moved out of the sticky row into the content column** (all three tabs that
  have one). Without a band behind it, a pinned chip printed straight over the card titles.
- **Every tile in a Karten grid is now the same height, not just per row** (`auto-rows-fr` on the
  Wörter, Kollokationen, Redemittel and Grammatik grids). `1fr` rows in an auto-height grid resolve to
  the tallest row, so the size stays content-driven and nothing is clipped: a filtered set of short
  cards still renders short.
- **The verb paradigm on the Wörter card back is two label/value pairs per row.** As a single column
  it ran four rows and made verb tiles the tallest card in the grid, which then set the height for
  every card. Measured at 1280px: uniform tiles were 209px with the old layout, 189px with the new one,
  and no back face overflows at either breakpoint (checked by flipping every verb card in the first
  batch, mobile and desktop).
- **Card content is vertically centered** on Wörter / Kollokationen / Redemittel. With one height for
  the whole grid, top-aligned content left a hollow lower half; this was clearest on Redemittel, where
  a short Wendung sat in a 256px card. Anchored elements stay anchored (the Wörter foot row, the
  Grammatik pattern chip and foot).
- **"Nach oben" now has a desktop placement** (`bottom-4 right-4`, clear of the Feedback pill); the
  centered mobile one above the Üben bar is unchanged. Same 280px show threshold.
- **Follow-up: the clearance moved from padding into the sticky offset.** `pt-3` applied at rest too
  and pushed the controls away from the tabs at the top of the page. The 0.75rem now rides
  `top-[calc(4rem+env(safe-area-inset-top)+0.75rem)]` / `lg:top-[4.75rem]` (repeated in the four
  trainers' own `lg:sticky` class), which does nothing until the row pins. At rest the tabs-to-buttons
  gap is back to 24px desktop / 16px mobile; pinned, the buttons sit 12px under the app header.
- **Follow-up in the same session: the toolbar buttons were half-transparent.** The shared `outline`
  button variant fills with `bg-surface/50`, which was invisible behind the old blurred band and let
  card titles print through the buttons once the band went away. Every browse-toolbar icon button now
  wears one exported constant, `BROWSE_TOOLBAR_BUTTON` (`bg-surface` + `hover:bg-muted` +
  `shadow-soft`); the global `outline` variant is untouched, since its translucency is wanted
  elsewhere. Checked by reading the computed background alpha of every control in the row on all four
  tabs at both breakpoints. **Rule for this row: anything added to it needs a full-alpha fill.**
- **Gates:** typecheck · lint 0 errors (75 pre-existing warnings) · test:unit 389/389 · build ·
  check:bundle 123.2 kB of 400 kB. Verified in headless Chromium at 390px and 1280px on all four tabs.

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
