# UX Overhaul Plan: from tool drawer to learning loop

> **Execution status (session 47, 2026-07-02):** Phase 0 ✅ merged · Phase 1 ✅ merged · Phase 2 ✅
> merged · Phase 3 ✅ merged (as a **soft merge** per founder choice; the hard `/library` URL merge +
> Quiz retirement + Vokabeltrainer-tab removal are deferred into Phase 5) · Phase 4 🟡 content half
> committed (Can-Do bank + linter, unmerged), **UI half pending** on Sonnet 5 · Phase 5 ⬜ not started
> (Opus 4.8). See `docs/PROJECT_STATUS.md` "Resume here" for the exact handoff.
>
> Status: **FULLY APPROVED** (founder, 2026-07-02): all four Part-H decisions recorded, including
> the tab-bar default-pin change (approved after a plain-language walkthrough; the s26–28 bar
> mechanics stay locked and untouched). Drafted session 46 on founder request. Supersedes the ambition level of
> `docs/FILTER_HARMONIZATION_PLAN.md` (implemented s45; its primitives are kept and reused, see
> Part B). Grounded in a full-app screen review (all 13 routes, mobile + desktop) and the uploaded
> playbook `docs/Language Learning App Success Factors.docx`. Companion specs:
> `docs/TAXONOMY_REDESIGN.md`, `docs/AI_PRODUCT_STRATEGY.md`.

## Part A: key findings from the app review

The app has excellent raw material: 528 tagged vocab words, 396 collocations, 72 Redemittel, 10
grammar topics with drills, branching simulations, an AI writing coach, a real SM-2 SRS engine, XP
and streaks, and a clean visual system. The problem is not missing features. The problem is that
**the app is organised as a drawer of eleven parallel tools, and the learner has to be their own
teacher**: every visit starts with "which of these 11 sections should I open, which theme, which
level, which filter?". The playbook calls this out directly: choice overhead is extraneous cognitive
load, and self-directed systems still need the system to do the pathing.

### The five major UX problems

- **A1. No session loop.** The single highest-value action ("do 10 focused minutes, composed for
  me") does not exist as a first-class object. The pieces all exist: SRS due cards
  (Schnellwiederholung), a quiz generator (`engine/quiz.ts`), grammar drills, Redemittel practice.
  But they are separate destinations the learner must sequence manually. The playbook's strongest
  findings (retrieval practice, interleaving: up to 43% better retention vs blocked practice) argue
  for one **mixed session** that interleaves vocab retrieval, a collocation, a grammar micro-drill
  and a Redemittel in a single 5–10 minute run.
- **A2. The home screen leads with choices, not with "continue".** On mobile the dashboard opens
  with a sign-in banner, then a wall of seven full-width gradient intent cards. The compact stats
  strip and the (good!) `recommendedNext()` CTA sit below the fold. Every intent card deep-links to
  a **browse** view, i.e. more choosing. Nothing on the screen says "here is today's session, tap
  once".
- **A3. Redundant practice surfaces.** Three flashcard/quiz experiences (Vokabeltrainer tabs, the
  standalone Quiz hub, Schnellwiederholung) and four reference libraries in four nav slots
  (Wortschatz, Kollokationen, Redemittel, Grammatik), now with intentionally identical toolbars,
  which makes the duplication more visible, not less. Eleven sidebar items for what is really four
  jobs: learn today, look something up, apply it, see progress.
- **A4. Language and positioning inconsistencies.** German UI with English content in load-bearing
  places: all 11 theme `blurb`s are English ("Lead and contribute to workplace meetings…"), grammar
  card purposes are English, "Quick Review" is an English H1 under a German eyebrow, onboarding
  mixes both mid-sentence. Meanwhile "Prüfungsthemen" and the simulation title "Lösung finden"
  (telc module jargon) contradict the s21 repositioning away from exam-only framing.
- **A5. Progress is bookkeeping, not motivation.** Fortschritt shows Gesamt-XP 0, Serie 0 Tage,
  0/528 gemeistert as giant tiles: a demotivating cold start ("you are at zero four ways"). No
  CEFR "Can-Do" milestones ("Ich kann mich beim Bürgeramt anmelden"), which the playbook names as
  the way to make progress feel like competence instead of a counter. The header shows two separate
  "0" pills whose meaning is never explained.

### Per-screen findings (every route)

| Screen | State | Main issues |
| --- | --- | --- |
| `/welcome` landing | Good | Story is "situations that matter" but the app behind it opens on a tool drawer; keep, revisit copy after IA change. |
| `/start` onboarding | OK | Mixed DE/EN copy; collects name/mode/exam date but no daily-minutes or Can-Do goal, so the app learns nothing it can use to compose sessions. |
| `/` Dashboard | Weak | A2 above; seven stacked gradient cards on mobile; "Prüfungsthemen" heading; English blurbs; banner pushes content ~200px down. |
| `/vocabulary` | Good bones | Harmonized toolbar works; but it is a **library** posing as a **trainer** (learning modes are tabs inside a browse context). |
| `/collocations` | Mixed | Clean after s45, but the new Verb facet is a 100+ option pill soup inside the sheet (see B). |
| `/redemittel` | Good | Clean after s45. |
| `/grammar` | OK | English purposes on cards; otherwise a solid mini-textbook. |
| `/quiz` | Redundant | Theme grid → level cards → run: three screens of choosing before the first question; duplicates Vokabeltrainer quiz tab. |
| `/revision` | Hidden gem | This IS the proto-session (SRS-due, mode/level-weighted, 15 cards) but it is one tab among eleven and titled in English. |
| `/simulation` | Good | Strongest transfer feature; buried under jargon title; barely linked from theme context. |
| `/writing` | Good | The differentiator loop (write → one insight → drill deep-link) works; entry is another theme-picker wall. |
| `/exam` | Good | Clear, purposeful. Fine as a distinct mode. |
| `/analytics` | Weak | A5 above; giant zero tiles; no goals, no Can-Do, no diagnosis ("your weak spot is X"). |
| `/settings` | Good | Dense but appropriate. |
| Header (AppShell) | Noisy | Five widgets on 390px incl. two unlabeled zero-pills. |
| Sign-in banner | Harmful | Renders on top of **every** screen until dismissed; competes with the primary action everywhere. |
| Bottom tab bar | Locked | Mechanics are excellent (s26–28). The **default pinned set** (`/`, `/vocabulary`, `/quiz`, `/analytics`) points at two browse surfaces and stats, not at the learning loop. |

## Part B: critical review of the filter harmonization plan (s44/s45)

What it got right, and we keep all of it:

- `BrowseToolbar` + `FacetSheet` + `src/lib/cefr.ts` are exactly the right **reference-layer
  primitives**: consistent, URL-addressable, live-counted faceting with greyed dead-ends. Nothing
  here is wasted; the architecture in Part D is built from these parts.
- Killing the verb rail and the colour legend was correct de-cluttering (Coherence Principle).
- One responsive sheet for mobile+desktop was the right call; no facet rail to maintain twice.

Where it fell short of "massively improve" (being honest, including about what we shipped):

- **It answered "how should filters look?" and never asked "why is the learner filtering?"** In a
  learning app, facet filtering is a librarian's interaction, not a learner's. Learners think in
  situations ("I have a meeting tomorrow") and needs ("I keep messing up connectors"), not in
  facet algebra ("B2.1 ∧ diplomatisch ∧ Verb=abstimmen"). The facet system is a content-management
  UI that leaked into the learner UX; s45 made the leak consistent.
- **It polished the secondary layer.** Harmonizing three library toolbars makes lookup nicer; it
  does not change what a learner does in their first 60 seconds, where the product is won or lost.
- **Search stayed siloed per bank.** Searching "Termin" in Wortschatz finds words but not the
  collocation "einen Termin vereinbaren", the Redemittel, or the scheduling dialogue. Three search
  boxes that each see a quarter of the content is not discovery; it is compartmentalised lookup.
- **Scope does not travel.** Pick "Behörde" in Wortschatz, open Kollokationen: the theme resets.
  The learner's context (their situation) is page state when it should be app state.
- **It created a new problem:** moving the verb rail into the sheet produced a facet with 100+
  option pills and 1–5 counts each. That is a data-quality browser, not a learner control. A facet
  whose option list needs its own search box is signalling it wants to be a search query, not a facet.
- **Scalability was not considered.** Facet defs are hand-declared per page. Each new content pack
  (banking, healthcare, housing are on the roadmap) and each new facet multiplies per-page wiring.
  At 1,000+ words and 20+ sub-themes the current pattern produces ever-longer option lists with
  ever-thinner counts.

## Part C: the north star

> **Open the app. One tap. A composed 8–10 minute session that interleaves your due reviews, your
> weakest area, and one new thing, wrapped in a real situation. End screen shows what got stronger.
> Tomorrow it adapts.**

Design principles (each traceable to the playbook):

1. **Session-first, library-second.** Retrieval + interleaving in one composed run; browsing stays
   available but is never the default path.
2. **The system does the pathing.** Onboarding captures a goal (situations + minutes/day); the
   composer uses SRS state + weak-band detection (already built in `reviewWeight`) to fill each
   session. Learner agency = can always override; learner burden = never must.
3. **Progress = competence, not counters.** CEFR Can-Do milestones per theme, checked off by
   session performance; streaks framed positively, never punitively.
4. **One voice.** German-first UI with English glosses where pedagogically useful.
5. **Strip extraneous load.** One primary CTA per screen; banner demoted; header chrome halved.

## Part D: the recommended filter architecture

Four tiers, ordered by how often a learner should touch them. The design goal is measurable:
**most learning sessions involve zero filter interactions.**

### Tier 0: personalized defaults (the invisible filter)

The session composer IS the primary filter. SRS due-state, the weak CEFR band, the weak grammar
group, and the Mode lens already exist as signals; composing with them means the learner's level,
context, and gaps filter the content automatically, with no UI at all. Additionally, every list
surface defaults to the learner's band: a B1 learner opening the Bibliothek sees B1/B2.1 items
first with a quiet "auch B2.2/C1 zeigen" escape, instead of an unfiltered 528-item pile plus a
CEFR facet they must operate themselves. The Mode lens continues to gate work-only facets
(unchanged), but it also pre-biases defaults rather than only hiding controls.

### Tier 1: global search (the universal shortcut)

One search, all banks. A single search surface (header icon on mobile, ⌘K on desktop) that queries
vocabulary, collocations, Redemittel, grammar topics, and dialogue scenarios together and returns
grouped results ("Wörter (3) · Kollokationen (2) · Redemittel (1) · Grammatik (1)"), each row
deep-linking to its home surface. Implementation is cheap: all banks are static in-memory arrays;
one `searchAll(query)` over the existing normalised fields (~1,000 items total, no index needed).
This replaces three siloed per-page search boxes as the *primary* discovery path; the per-page
boxes remain as scoped refiners. It also solves the verb problem correctly: "abstimmen" typed into
global search finds every collocation with that verb, without a 100-pill facet.

### Tier 2: scope (one mental model: Situation, not facets)

The learner's one deliberate choice is **where they are**: Domain → Theme → Sub-theme. This is the
taxonomy's own hierarchy, surfaced as a single **Scope picker** (generalising `SubThemePicker` +
the Primary dropdown into one shared control), and critically, **scope is app state, not page
state**: pick "Behörde · Anträge" once and Wörter, Kollokationen, Redemittel, Grammatik, and the
"Üben" session launcher all follow it until changed (a dismissible scope chip shows the active
context on every scoped surface; URL params still override for shareable deep links). Redemittel,
which has no themeId, scopes by its own primary axis (Kategorie) exactly as shipped in s45.

### Tier 3: refinement facets (progressive disclosure, data-driven)

The FacetSheet survives, demoted to what it is good at: occasional refinement by power users.
Three changes:

- **Central facet registry** (`src/lib/facets.ts`): facet definitions declared once per content
  type, derived from the taxonomy enums, instead of hand-wired per page. New content packs and new
  facets then appear everywhere automatically; pages just say `facetsFor("vocab", mode)`.
- **Facet hygiene rule:** a facet must have ≤ ~12 options to exist as pills. Verb (100+) is removed
  as a facet; global/scoped search covers it. If a long-tail dimension ever genuinely needs
  faceting, it renders as a type-ahead row inside the sheet, not pills.
- **CEFR pre-selection** from the learner's band (Tier 0) shown as a preselected chip the learner
  can clear, so the sheet opens reflecting reality instead of blank.

### What this means for the s45 toolbar

The `[Search] [Primary ▾] [Filter]` strip evolves into `[Scope chip] [Search (scoped)] [Filter]`
inside the Bibliothek, with global search living in the chrome. Same components, one fewer
per-page concept, and the primary dropdown stops being a per-page silo.

## Part E: the new information architecture

Four zones (plus Einstellungen). Every existing route keeps working (redirects/deep-links), so
nothing external breaks.

```
HEUTE            BIBLIOTHEK          ANWENDEN            FORTSCHRITT
(home, session)  (unified reference) (transfer)          (goals & growth)
  Session-Start    Wörter              Sprechen (Sim)      Can-Do-Meilensteine
  Weiter-lernen    Kollokationen       Schreiben (KI)      Schwachstellen-Diagnose
  Situationen      Redemittel          Prüfungsmodus       Serie & XP (sekundär)
  Tagesstatus      Grammatik
```

### E1. The session engine (`src/engine/session.ts`, new) and player

The one genuinely new build. A pure composer:

```
buildSession({ srs, mode, minutes, weakBand, scope? }) →
  SessionPlan: ordered blocks, e.g.
  [ 6× vocab retrieval (due, weighted)      ← reuses reviewWeight/isDue
    2× quiz questions (weak theme, level)   ← reuses buildThemeQuiz
    1× grammar micro-drill (weak group)     ← reuses grammar drill data
    2× collocation cloze                    ← new light question type from existing data
    1× redemittel prompt                    ← reuses RedemittelPractice mechanics
    repeat to fill `minutes` ]
```

A single **SessionPlayer** renders any block type with one progress bar, one XP tally, and an
**end screen**: XP earned, "stärker geworden" list (cards whose mastery rose), Can-Do progress
tick if earned, and one forward hook ("Morgen: Konnektoren festigen"). Schnellwiederholung becomes
the "kurze Session" preset of the same engine instead of a separate feature.

### E2. Heute (replaces Dashboard)

Order on mobile, top to bottom:
1. Greeting + **primary CTA card**: "Deine Session · ~8 Min" with composition preview ("12 fällige
   Wörter · Schwachstelle: Konnektoren · 1 neues Redemittel") and one button. `recommendedNext()`
   logic feeds it (promoted from strip-button to hero).
2. **Situationen row**: 3 compact intent chips (rotating by mode/recency), launching
   **scope-set sessions**, not browse views. "Alle Themen" link → Bibliothek.
3. **Compact status strip** (streak · XP/goal · days-to-exam when set) as today.
4. Theme mastery grid moves to Fortschritt. The "Prüfungsthemen" heading dies.
Sign-in banner: shown once per device on Heute only, dismiss persists; a quiet "Nur lokal" pill in
Settings remains the durable reminder.

### E3. Bibliothek (merges 4 routes into one hub, keeps s45 toolbars)

One nav destination with a segmented switcher: **Wörter | Kollokationen | Redemittel | Grammatik**.
Each segment = the existing page content (BrowseToolbar, facets, drills) under the shared Scope
(Tier 2). `/vocabulary` etc. redirect into `/library?tab=…` preserving all query params. The
Vokabeltrainer's Karteikarten/Quiz tabs move out: flashcards/quiz launch as **scoped sessions**
via an "Üben" button on the toolbar. Library becomes purely: find, inspect, listen, jump off.

### E4. Anwenden

Groups Sprechsimulation (renamed from "Lösung finden"; the telc module name stays only inside exam
context), Schreibtraining, Prüfungsmodus under one hub with three big cards. These are the transfer
layer and deserve equal visual rank with practice. Writing keeps its loop; its theme picker gets a
"Vorschlag" default (weakest theme) so the first tap can be "just write".

### E5. Fortschritt (redesign)

1. **Can-Do milestones** (new small data file: 2–3 statements per theme × level, ~60 rows,
   `src/data/canDo.ts` + linter rules): checked off when session performance in that sub-area
   crosses a threshold. This is the headline, not XP.
2. **Diagnose card**: current weakest band/group (already computed) with a one-tap "Session dazu
   starten".
3. Theme mastery grid (moved from dashboard); XP/streak/level as secondary tiles.
4. **Cold start**: before any data, show the goal-setting state ("Dein Ziel: B2 im Beruf · 10
   Min/Tag") instead of four zeros.

### E6. Chrome

- Header mobile: logo · streak flame · global-search icon · avatar. ModeSwitcher moves into Heute
  (it is a content lens, belongs near content). Level/XP pills only on Fortschritt.
- **Bottom tab bar: default pinned set** becomes Heute · Bibliothek · Anwenden · Fortschritt
  (+ Mehr). ⚠️ The bar's mechanics are founder-locked (s26–28); this plan changes only
  `DEFAULT_PINNED_TABS` + route registry entries, no structural/edit-mode/icon-rule changes, but it
  still **requires explicit founder sign-off** under the lock. Existing users' custom pins are
  preserved (store migration remaps removed routes to their successors).

### E7. Copy pass (all screens)

Translate all 11 theme blurbs + grammar purposes to German (EN kept as a secondary field for a
future EN-UI mode). "Quick Review" → "Schnelle Runde". Onboarding German-first with small EN echo
lines, plus a new goal step (minutes/day + target situations) feeding Tier 0. No em dashes in any
user-facing string (house rule).

## Part F: what explicitly stays

FacetSheet/BrowseToolbar/cefr.ts (s45), all engines (`srs`, `quiz`, `scoring`, `speech`,
`dialogue`), the writing loop, dialog/overlay tokens, logo rules, PWA setup, tab-bar mechanics,
GDPR/legal surface, provenance/linter gates. This plan adds one engine, one player, one hub
wrapper, one search function, and copy/data edits; it does not rewrite working systems.

## Part G: prioritization framework and roadmap

Scoring: **learner value** (does it change the daily loop?) × **frequency** (how often is the
surface touched?) ÷ **effort**. Applied ruthlessly: session loop > global search > defaults >
consolidation > facet refactor. Facet work scores lowest because Tier 3 is, by design, the least
used layer; that is why it ships last despite being the nominal subject of this plan.

| Phase | Scope | Size | Score rationale |
| --- | --- | --- | --- |
| **0. Quick wins** | Banner demotion; header slimming; German copy pass; "Prüfungsthemen" rename; Fortschritt cold-start state | S | High value ÷ tiny effort; zero structural risk; ships immediately |
| **1. Session engine + Heute** | `engine/session.ts` + SessionPlayer + end screen; Heute hero CTA + situation chips; Schnellwiederholung becomes preset | L | The core transformation (A1/A2); touches the first 60 seconds of every visit |
| **2. Global search + Tier-0 defaults** | `searchAll()` + result sheet + header entry; band-default lists with "auch schwerere zeigen" | M | Universal discovery; makes most filtering unnecessary before facets are ever touched |
| **3. Bibliothek + shared scope** | `/library` hub + segments + redirects; Scope picker as app state; Quiz hub folds in; "Üben" launches scoped sessions | M | Kills A3 redundancy; scope-travel fixes the biggest s45 leftover |
| **4. Fortschritt + Can-Do** | `canDo.ts` data + linter; milestone UI; diagnose card; theme grid relocation | M | Fixes A5; closes the loop with visible competence |
| **5. Anwenden + nav re-map + facet registry** | Anwenden hub; simulation rename; `DEFAULT_PINNED_TABS` (⚠️ founder unlock); `lib/facets.ts` registry; drop Verb facet; ≤12-option rule | S–M | IA coherence + scalability cleanup, correctly last |

Each phase: `pnpm typecheck` + `pnpm lint:content` + `pnpm build` + mobile/desktop screenshot pass,
PR to `main`, founder verifies live. Phase 0 can ship today; 1 → 2 → 3 in order; 4 and 5 can swap.

## Part H: founder decisions (recorded 2026-07-02)

1. **IA direction (session-first, 4 zones): APPROVED.** Phases 0–5 may proceed in order.
2. **Tab-bar default pins: APPROVED** (founder, 2026-07-02, after a plain-language walkthrough).
   The default set for new users changes from Home · Wortschatz · Quiz · Fortschritt (+ Mehr) to
   Heute · Bibliothek · Anwenden · Fortschritt (+ Mehr). **Scope of the unlock is exactly this and
   nothing more:** the s26–28 bar mechanics (long-press edit mode, jiggle, drag-reorder, More
   sheet, icon design rules, sizes) remain locked and untouched. Users who already customised
   their bar keep their custom set; removed routes are remapped to their successors (a pinned
   Wortschatz becomes Bibliothek). Ships in Phase 5.
3. **Copy: German-first CONFIRMED; "EN peek" button parked for brainstorming.** The Phase-0 copy
   pass proceeds (English blurbs/purposes translated to German, EN retained as data). The founder's
   new idea, an EN button at the top of the app that translates the whole screen briefly, is
   deliberately parked as **backlog #25** in `PROJECT_STATUS.md` pending a brainstorm. The copy
   pass is its prerequisite (a whole-screen EN layer needs the EN strings kept as data), so Phase 0
   enables rather than blocks it.
4. **Can-Do statements: AI-DRAFTED + FOUNDER REVIEW, checked against the data strategy.** This is
   the exact pattern `docs/DATA_GOVERNANCE.md` already documents: AI drafting is a permitted first
   step; the founder is the verifier of record (four-eyes preserved: assistant authors, founder
   approves); nothing ships as trusted until reviewed. Recipe for `src/data/canDo.ts`: one
   provenance row per statement with `origin: "authored"`, `license: "OWNED"`,
   `review_status: "draft"`, and a `reference` to the Council of Europe CEFR B2 descriptors, the
   same precedent already used for dialogues, exam sets, and writing prompts. Statements are
   written in our own German **aligned to** CEFR descriptors, never copied from them (CoE text is
   cited, not reproduced; Goethe "Kann-Beschreibungen" remain on the avoid list). The founder flips
   draft → verified during review, mirroring the pending CEFR-tag verification queue.

## Appendix: later bets (out of scope now, noted from the playbook)

- FSRS scheduler upgrade over SM-2 (playbook: ~23% less review volume at equal retention);
  drop-in behind the `engine/srs.ts` interface later.
- Listening/talker-variability track (multiple TTS voices, speed toggle) as a session block type.
- Context-aware, non-punitive session reminders once PWA notifications are wanted.
