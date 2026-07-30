# Project Status

_Last updated: 2026-07-30 (session 178). **Content audit, then the first two fixes from it.**
`docs/reports/CONTENT_AUDIT_2026-07-30.md` measures coverage, quality, real-world usage frequency and
fitness for B1-C1 across all 3,896 content items. Verdict: **structurally excellent, pedagogically
lopsided.** Then P0 and P2 of its backlog shipped. **P0:** a quiz could render the same option twice
(one of them the answer), because distractors were filtered by id and 5 English glosses collided
inside a theme; two words shipped twice (`der Reisepass`, `der Konferenzraum`); CO2 was spelled two
ways, one of them unreachable for a learner who types it. All fixed and gated. **P2:** all 234 verbs
now have Partizip II, auxiliary, Präteritum and separability in the generated
`src/data/verbForms.ts`, derived from a vendored dictionary oracle rather than typed by hand.
Displaying them on a card is a founder pick: `preview/verb-forms-card.html`, variants A-D.
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
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** (108 checks) · writing tasks **643** in 20
pools · Can-Do **52** · dialogues **30** (158 nodes, 335 options) · exam sets **15** · missions **6** ·
provenance **3,273 rows** · themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,260 of 3,273 provenance rows are AI-drafted `draft`**; only **13** are
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
- **Awaiting the founder, nothing blocked on code:** the verb forms are **inert until they appear on a
  card**, and that is design work, so `preview/verb-forms-card.html` offers **variants A-D** (one foot
  pill where a noun's "Pl.:" sits · two pills · pill + full list on the flip side · plus a separability
  dot in the headword), built from the real tokens and the real `VocabList.tsx` geometry, published as
  an artifact. Pick one and it gets implemented exactly.
- **NOT started: P1 (C1 has no content).** It is the biggest hole (0 C1 grammar topics, 0 C1 texts,
  0 C1 Can-Dos behind a level onboarding offers) and it is a content-authoring project, not a fix.
  Recommended shape when it starts: 4 C1 grammar topics none of which exist yet (Konzessiv- und
  Restriktivkonnektoren, Passiversatzformen, subjektive Modalverben, Modalpartikeln), 6 texts at
  300-400 words (which also starts P3, since today's median text is 90 words), 5 C1 Can-Dos.
- **Gates (all three commits):** lint:content clean (1 warning, the deliberate `der Empfang` homonym) ·
  build · typecheck · lint 0 errors · test:unit **384/384** · check:bundle 123.2 kB of 400 kB.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
