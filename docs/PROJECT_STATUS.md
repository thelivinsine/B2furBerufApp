# Project Status

_Last updated: 2026-07-30 (session 178). **Content audit, then its P0-P2 fixes and the C1 slice.**
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

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
