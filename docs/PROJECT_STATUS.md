# Project Status

_Last updated: 2026-08-02 (session 183). **Prüfung icon mockup round is OPEN, founder picks
pending** (bar mark A-D, hub tiles 1-3, and the keep-or-merge verdict on Sprechen vs.
Prüfungssimulation); see the newest handoff below.
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

**Handoff after session 182, part 4 (2026-08-01): the nav zone question is answered.** Founder, first
"yes keep it in the bottom bar", then, seeing the six-slot direction: "just move schreiben to
anwenden and rename anwenden as prufung."
- **The bar stays FIVE slots**, which is why this answer is better than the one it replaced. The
  six-slot version was built and measured first: at 320px it overflowed, because the longest label
  ("Einstellungen") set a 73px width floor and pushed the gear off screen. That is fixed either way
  now (`min-w-0` on every slot, so the name truncates instead of setting a floor), but the founder's
  reshape means the bar never had to grow.
- **Praktisch · Bibliothek · Prüfung · Fortschritt · Einstellungen.** `/writing` lost the tab it had
  held since 2026-07-22 and is a card in the hub again; the hub is labelled **Prüfung** and holds
  the three exam skills. The exam card inside it is "Prüfungssimulation", because a card cannot
  carry the name of the page it sits on.
- **Nothing about Schreiben itself changed**: same route, same pencil mark, same deep links, same
  draft-resume redirect in `AppShell`. A learner who had pinned `/writing` gets remapped through
  `ROUTE_SUCCESSOR`, so no one lands on an empty slot.
- `tests/nav.test.tsx` (5 tests) pins the five slots and their order, the remap of a stale `/writing`
  pin, and that Schreiben is no longer a top-level entry while Prüfung is.
- **Gates:** typecheck · lint 0 errors · test:unit **496/496** · build · check:bundle 123.3 kB.
  Verified in the built app at 320px and 390px (five even slots, "Prüfung" active) and on desktop
  (sidebar reads Praktisch · Bibliothek · Prüfung · Fortschritt · Einstellungen, and the Schreiben
  card still opens the trainer at `/writing`).
- **Shipped:** PR **#778**, squash-merged as `3863c49`, `Validate content` and `Deploy site to
  GitHub Pages` both green. Main had moved again (#776 and #777 landed while the work ran), so the
  prompt log conflicted; resolved by keeping session 182's entry at the tail and filing session
  179's late prompt 14 under its own heading, where #777 had just moved the rest of that session.
  Post-merge housekeeping done: branch reset onto `main`, working tree clean.
- **Worth the founder's eye on the live site:** whether "Prüfung vorbereiten" reads right as the
  page title, and whether Schreiben sitting one tap deeper is felt in daily use. Both are one-line
  changes.

**Handoff after session 183 (2026-08-02): Prüfung icon mockup round, picks pending.** Founder had
three comments on the s182 nav change; nothing shipped yet, this was a previews-first round.
- **1, bar icon:** the Prüfung mark is the bar's only stroke-drawn icon (hollow target ring); every
  neighbour is a filled two-tone shape. `preview/pruefung-icons.html` offers four filled
  orange+amber replacements: **A** volle Zielscheibe, **B** Klemmbrett mit Haken, **C** Stoppuhr,
  **D** Absolventenhut, each in a five-slot bar replica (light + dark) plus a 64px detail row.
- **3, hub tiles:** same preview, Teil 2: the menu-bar pencil on the Schreiben tile, the same-style
  microphone on Sprechen, the cap recoloured amber on Prüfungssimulation, in three treatments:
  **1** white marks on the existing gradients, **2** own-colour marks on tinted squircles,
  **3** own-colour marks on the grey bar squircle.
- **2, Sprechen vs. Prüfungssimulation:** answered in chat, recommendation KEEP BOTH. Same dialogue
  engine and scenario bank; Sprechen is untimed practice with hints (30 scenarios),
  Prüfungssimulation wraps one scenario in exam conditions (Aufgabenblatt, countdown, rubric
  self-check, score). Awaiting the founder's verdict alongside the icon picks.
- **Next step:** implement exactly the picked variants (bar mark in `route-icons.tsx` incl. its
  `NORM` box, hub tiles in `AnwendenHub.tsx`), then verify live against the preview.
- **Gates:** preview + docs only; no app code touched.

**Session 182's first part (audit P6, the Redemittel phrase bank) is archived** in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`; its law lives on in
`docs/DECISIONS.md` §s182 and `docs/areas/CONTENT.md`.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
