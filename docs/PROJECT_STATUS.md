# Project Status

_Last updated: 2026-08-03 (session 184). **Every filter and Aufgabe rail now carries the
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

**Handoff after session 184 (2026-08-03): the Lebensbereich pills, in every rail.** Founder: "I want
a clear Berufswelt and Alltag pills in each and every filter or aufgabe rail through out the app
right below the Branchen filter."
- **Naming was asked BEFORE building**, because it was the only part that changed the scope: the
  prompt said "Berufswelt", the app's locked word is **Berufsleben** (s181), and one surface saying
  something different is the exact drift `lib/lifeAreas.ts` exists to stop. Founder kept
  **Berufsleben**, so nothing was renamed and the change stayed additive.
- **One shared control, `src/features/shared/LifeAreaPills.tsx`**, now in Wörter, Kollokationen,
  Redemittel and the Schreiben Kurz/Lang Aufgabe rail, on desktop rails and mobile panels alike.
  **Grammatik is the one deliberate exception:** grammar topics carry no `themeId`, so a life-area
  filter there would be dead chrome, not a filter.
- **The rail owns the slot, not the caller** (`area` prop on `FilterRail`, inserted after the
  `sector` scope, or first on a tab with no Branche dropdown), so "right below the Branchen filter"
  cannot drift per surface. Single-select that toggles off, `?area=`, pinnable, counted by the badge,
  cleared by both rails' reset.
- **Coherence is enforced, not hoped for:** picking an area narrows the Thema dropdown to that area
  AND drops a Thema from the other one, so pill, dropdown and list can never contradict each other.
  Pill counts are computed before Thema/search/facets, so the other pill never goes dead at exactly
  the moment you want to switch. In Schreiben `area` became a HARD, coarsest axis, so the two areas
  partition the 717-task pool exactly, with `blockingAxis` gaining `area` for the stale-deep-link case.
- **One visual correction during the round:** an equal-width 2-column pill grid truncated
  "Berufsleben" against a four-digit count in the 16rem desktop rail, so the pills use the
  content-sized wrapping facet-pill layout the same tile already uses two sections below.
- **Gates:** typecheck · lint 0 errors · lint:content · test:unit **506/506** (10 new) · build ·
  check:bundle 123.1 kB. Verified in a headless browser on both rails: `theme=arzt` + tap Berufsleben
  → `?area=professional` with Thema back to "Alle Themen", the Thema dropdown then listing exactly
  one heading; toggle-off, pin+collapse and reset all behave.
- **Worth the founder's eye on the live site:** whether "Lebensbereich" is the right section label
  (one word, matches the two pills under it), and whether Grammatik should carry the pills anyway.
  Both are small changes.

**Handoff after session 183 (2026-08-02): the Prüfung icons, and the merge question answered.**
Founder: "D and 2", then "keep them separate".
- **Bar mark: the orange Absolventenhut** (`graduationCap` in `route-icons.tsx`). The target rings
  it replaced were the bar's only OUTLINE mark among filled two-tone shapes, which is the whole
  reason it read thinner than its neighbours. `/anwenden` and `/exam` now share that one mark on
  purpose: the tab and the hub card are the same thing at two depths.
- **Hub tiles: the branded route marks on tinted squircles** (`AnwendenHub.tsx`). Each card renders
  `RouteIcon` for its own route, so the Schreiben card carries the exact pencil the nav does, the
  microphone matches it in style, and the cap ties the exam card to the zone. The white-on-gradient
  tiles this replaced turned every mark into the same white silhouette.
- **Two fixes the implementation forced.** (1) Routes that are not `navItems` entries had no accent
  colour, so all three marks would have drawn brand blue: `OFF_NAV_COLOR` now supplies cyan for
  `/simulation` and orange for `/exam`. (2) The tiles were `rounded-2xl`, and `--radius + 10` is
  24px, exactly half of a 48px tile, so they were rendering as full CIRCLES (already true of the old
  gradient tiles). Now `rounded-xl`, matching the approved preview and the squircle law.
  The `/simulation` teal also went from `#5eead4` to `#2dd4bf`, which washed out on the tinted tile.
- **Sprechen vs. Prüfungssimulation: KEEP BOTH, founder decision.** Same dialogue engine and
  scenario bank; Sprechen is untimed practice with hints across all 30 scenarios, Prüfungssimulation
  wraps one scenario in exam conditions (Aufgabenblatt, 6-minute countdown, rubric self-check,
  score). Nothing was merged and nothing changed in either runner.
- **Gates:** typecheck · lint 0 errors · test:unit **496/496** · build · check:bundle 123.2 kB.
  Verified in the BUILT app at 320px, 390px (light + dark) and desktop: five even bar slots with the
  cap active, the three tiles read apart at a glance, and all three cards still open their trainer.
- **Approved mockups:** `preview/pruefung-icons.html` (variants A-D and 1-3 as shown to the founder).
- **Shipped:** PR **#780**, squash-merged as `797f65d`. `Validate content` and `Deploy site to
  GitHub Pages` both green on the merge commit, so this is live on genauly.de. Post-merge
  housekeeping done: branch reset onto `main`, working tree clean. (The mockup round and the
  implementation went out as ONE PR: the preview commit was still unmerged when the founder picked,
  so the picks were added to the same branch.)
- **One open one-liner for the founder:** the page's `HubHero` still shows the lucide target, so the
  zone is a cap in the bar and the sidebar but a target at the top of its own page. Swapping it
  would put two caps on that page (hero + Prüfungssimulation card), which is why it was left alone.

**Session 182 is fully archived** in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W31.md`:
part 1 (audit P6, the Redemittel phrase bank) and, aged out by this session, part 4 (the five-slot
Prüfung nav zone, PR #778). Their law lives on in `docs/DECISIONS.md` §s182,
`docs/areas/CONTENT.md` and `docs/areas/PRAKTISCH-NAV.md`. (Part 4 had been sitting in this file
TWICE, once above the s183 handoff and once below it; the duplicate went with the archive move.)

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
