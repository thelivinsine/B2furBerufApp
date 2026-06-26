# Theme Taxonomy & Filtering Redesign

**A first-principles redesign of how Genauly categorizes and filters learning content
across Wortschatz, Kollokationen, Redemittel and Schreibtraining.**

Prepared as a slide deck. Audience: founder (non-technical) + future implementer.
Each `## Slide N` block is one slide. Read top to bottom.

> Status: proposal / research. Nothing here is shipped. The "Final Recommendation"
> (slides 23–25) is the part to act on; slides 1–22 are the reasoning.

---

## Slide 1 — Executive Summary

**The problem in one sentence:** Genauly indexes every module on a single flat list
of 11 themes, but its content does not actually live on one axis, and that mismatch
caps discoverability, personalization and scale.

**Three findings from the current code:**

1. **The app already runs three incompatible taxonomies and pretends it runs one.**
   - Vocabulary and Collocations are filed by **theme** (`themeId`: meetings, behoerde, …).
   - Redemittel is filed by **communicative function** (`RedemittelCategory`: suggestions,
     agree, disagree, negotiation, …) plus a `register` axis (neutral/formal/diplomatic).
   - Grammar is filed by **structural group** (`GrammarGroup`: connectors, passive, cases, …).

   These are not three messy versions of one taxonomy. They are three *correct* taxonomies
   for three different kinds of content. The redesign should make that explicit, not erase it.

2. **There is no level axis at all.** Vocab/collocation entries carry no CEFR or difficulty
   field. Only quiz questions have `difficulty: 1|2|3`, and it is never surfaced as a filter.
   For a product whose entire identity is "the B1–B2 plateau," level is invisible to the learner.

3. **Filtering is one dropdown.** `VocabularyTrainer` offers exactly one control: a theme
   `Select` ("Alle Themen" + 11 themes). No sub-themes, no level, no register, no
   "what do I still need to practice." It does not scale past ~15 themes, and it can never
   answer an intent like *"formal email phrases at B2 that I haven't mastered yet."*

**The recommendation in one sentence:** Move from a single flat theme list to a
**faceted (multi-axis) tagging model** with a shallow theme **hierarchy** (Domain →
Theme → Sub-theme), where every content item carries a small set of orthogonal facets
(theme, CEFR, function, register, part-of-speech, frequency, exam-relevance) and the UI
exposes a **progressive filter stack** that is identical in plumbing across modules but
shows only the facets that module actually has.

**Why now:** at 11 themes and ~660 content items the pain is mild. The model you pick
*now* is the one 100 themes and 10,000 items will inherit. Faceted tagging is cheap to
add today and very expensive to retrofit later. This is the cheapest it will ever be.

---

## Slide 2 — Benchmark Analysis (1 of 3): The consumer apps

| Platform | How content is structured | Filtering model | Strength | Weakness for us |
|---|---|---|---|---|
| **Duolingo** | Single linear "path." Units → lessons. Theme + grammar interleaved, hidden behind one track. | Almost none. The algorithm picks; the learner does not filter. | Zero decision fatigue; momentum. | No discoverability, no self-direction. Useless for an adult who knows they need *Behörde* vocabulary *this week*. |
| **Babbel** | Courses by **goal** ("Beginner I", "Business German", "Grammar") then lessons. Multiple parallel tracks. | Pick a course; light topic browse. | Goal-framed entry ("Business") matches adult intent. | Tracks are siloed; the same word lives in many courses with no shared spine. Hard to scale content without duplication. |
| **Busuu** | CEFR-first. Content explicitly tagged A1–B2; lessons grouped by level then topic. | Filter by **level**, then topic. | CEFR is front and center, exactly our learner's mental model. | Topic taxonomy under each level is shallow and generic. |
| **Memrise / Anki** | Pure **deck/tag** model. A card can carry many tags; users filter by tag intersection. | Powerful free-form tag filtering. | Maximum flexibility, scales to millions of cards. | No pedagogy out of the box; the learner must build their own structure. Too raw for a guided product. |

**Takeaway:** The consumer leaders sit on a spectrum from *zero filtering / max guidance*
(Duolingo) to *max filtering / zero guidance* (Anki). Genauly's audience (motivated adults
with a concrete need) wants the **middle**: guided defaults, but the ability to filter hard
when they have intent. Busuu's level-first instinct is right for us; Anki's tag model is the
right *backend*; neither nails the front end alone.

---

## Slide 3 — Benchmark Analysis (2 of 3): Structured courses & the exam world

| Source | How content is structured | What we can steal |
|---|---|---|
| **Lingoda** | Live classes on a strict **CEFR grid** (A1.1 … C1.x). Every lesson has a level, a topic, and a material PDF. | Level is a hard, visible coordinate, not a vibe. Each cell = (level × topic). A clean 2D grid is legible to adults. |
| **Goethe-Institut** | Per-level **can-do descriptors** ("Kann in einer Besprechung …") and themed Wortschatz/Redemittel lists. | The **can-do statement** as the atomic unit of "why am I learning this." Maps perfectly onto our `situations[]` field, which is underused. |
| **telc B2 Beruf** | Organized by **Handlungsfeld** (field of action) and **exam task type** (E-Mail schreiben, Stellungnahme, Gespräch). | Two facets we are missing: *field of action* (a coarse domain) and *exam task type* (a filterable, high-intent tag). |
| **CEFR itself** | Content described on two axes: **communicative activity** (the can-do) and **competence** (linguistic range, including register). | The official model is *already faceted*: activity × competence × level. Our Redemittel-vs-theme split is CEFR's activity-vs-domain split rediscovered by accident. |
| **Educational publishers (Klett, Hueber, Cornelsen)** | Coursebook = linear spine, but the **teacher's index** is faceted: by grammar point, by Redemittel function, by Wortfeld, by exam task. | The *learner-facing* view can be linear while the *content database* is faceted. Same data, two projections. |

**Takeaway:** Everyone serious about adult/exam German uses **more than one axis**, and CEFR
gives us the canonical set: **level × communicative activity × domain × competence (register/
range)**. We should align to that vocabulary rather than invent our own.

---

## Slide 4 — Benchmark Analysis (3 of 3): What "good" looks like, distilled

Five best practices, ranked by how much they matter for Genauly:

1. **Faceted, not hierarchical-only.** Modern content systems (e-commerce, Netflix, LMS)
   abandoned deep folder trees for **facets** (orthogonal tags you combine). A grocery item
   is "dairy" AND "organic" AND "under €5" at once. A vocab item is "behoerde" AND "B2" AND
   "noun" AND "formal" AND "high-frequency" at once. Deep trees force one parent; facets do not.

2. **Level is a first-class coordinate** (Busuu, Lingoda, CEFR). For a plateau-breaker product,
   not having it is a strategic hole.

3. **Intent-based entry points** beat taxonomy browsing (Babbel "Business", telc "E-Mail
   schreiben"). Most adults arrive with a *task*, not a *topic*.

4. **Shallow hierarchy + rich tags** out-scales deep hierarchy. Two or three visible levels max;
   everything else is a facet. (Slide 7 has the evidence.)

5. **One backend taxonomy, many front-end projections.** The database is faceted; each surface
   (a linear "course," a filterable browser, a search box, an SRS queue) is a *query* over it.

**The anti-patterns to avoid** (all visible in either our app or the benchmarks):
- A single flat list that every module is forced to share (us, today).
- Deep folder trees the learner must drill through to find anything (old LMS).
- Per-module bespoke taxonomies with no shared spine (Babbel's siloed courses).
- Level as an afterthought or absent (us, today).

---

## Slide 5 — Core Taxonomy Principles (1 of 3): Facets vs. hierarchy

**The single most important decision:** is a category a **place** (one parent, a tree) or a
**property** (many tags, a facet)?

- A **hierarchy** answers *"where does this live?"* Each item has exactly one home.
  Good for: browsing, a sense of place, a table of contents. Bad at: items that belong in
  several places, and at evolving (re-parenting is painful).
- A **facet** answers *"what is this like?"* Each item carries many independent labels.
  Good for: filtering, search, personalization, growth. Bad at: giving a single "you are here."

**Genauly needs both, for different jobs:**

| Job | Mechanism |
|---|---|
| "Show me a map of what exists" | **Hierarchy** (Domain → Theme → Sub-theme) |
| "Narrow to exactly what I want right now" | **Facets** (level, function, register, status, …) |
| "Pick the next best item for me" | **Facets + learner state** (mastery, due date, weakness) |

**Principle:** Use a *shallow* hierarchy for the **theme dimension only** (because themes have
a natural part-whole nesting: "Grocery store" is part of "Shopping" is part of "Daily life").
Use **facets for everything else** (level, function, register, POS, frequency, exam tag,
mastery). Never model level or register as a hierarchy. They are properties, not places.

---

## Slide 6 — Core Taxonomy Principles (2 of 3): Orthogonality & the "one fact, one field" rule

**Orthogonality:** every axis must be independent of every other. You should be able to set
"level = B2" without it constraining "theme = Behörde" or "register = formal." When axes are
independent, N facets give you a combinatorial filtering power of their product, not their sum.
With 6 facets of ~5 values each that is ~15,000 addressable slices from ~30 stored labels.

**Test for a clean axis** — ask of any proposed category: *"Could two items be identical on
every other axis but differ on this one?"* If yes, it is a real, orthogonal facet. If no, you
are duplicating an axis you already have.
- "Formality" passes: two B2 Behörde nouns can differ only in register. ✔ keep.
- "Difficulty" vs "CEFR level" *fails*: they measure the same thing. ✘ collapse into one.

**One fact, one field:** never encode the same information twice. Today `difficulty: 1|2|3`
(on quizzes) and an implicit "B1–B2" framing both gesture at level. Pick one canonical level
scale (CEFR sub-bands) and derive everything else from it.

**Closed vs open axes:**
- **Closed** (fixed, small, enum-backed, validated by the linter): level, register, POS,
  communicative function, module. These power *filters*. Keep them short and stable.
- **Open** (free, growing, many-per-item): fine-grained topic tags / Wortfelder, can-do
  statements. These power *search and AI*, and are allowed to be messy.

This distinction maps cleanly onto our stack: closed axes become TypeScript union types in
`src/types/index.ts` and `THEME_IDS`-style arrays the linter checks; open tags become plain
`string[]` the linter only spell-checks against a registry.

---

## Slide 7 — Core Taxonomy Principles (3 of 3): Depth, the magic numbers, and naming

**How deep should the theme hierarchy go?** Evidence-based answer: **three levels, and stop.**

- Information architecture research (and every app on slide 2) converges on **2–3 visible
  levels**. Below 3, navigation cost (taps, working memory) grows faster than the value of the
  extra precision; learners get lost and bounce.
- **Breadth beats depth** up to a point: people scan a list of ~7±2 siblings comfortably. So
  aim for **5–9 items at each level**, not 30 at one level or 2 levels of 50.

**Target shape:**

```
~5–7 Domains            (broadest: "Berufsleben", "Alltag & Behörden", …)
   └─ ~6–10 Themes each (our current 11 themes live here)
        └─ ~3–6 Sub-themes each   (NEW; the missing middle)
             └─ items (vocab / collocation / phrase / prompt) tagged to the sub-theme
```

That yields room for ~5×8×4 ≈ **160 sub-themes** and effectively unlimited items before the
hierarchy feels strained, all while never showing the learner more than ~9 choices at a step.

**Naming rules** (cheap now, painful later):
- **Stable IDs, mutable labels.** `themeId` is a slug you never rename; the display title can
  change freely. (We already do this well: `behoerde` the id vs "Behörden & Ämter" the title.)
- **Bilingual labels everywhere** (`title` / `titleDe`), already our convention.
- **No em dashes in any label** (house style).
- IDs are lowercase slugs, unique across the whole hierarchy (a sub-theme id is globally unique,
  not just unique within its parent), so a single `string` tag is unambiguous.

---

## Slide 8 — Proposed Theme Architecture (1 of 5): The facet model overview

Every content item, in every module, carries this tag envelope. Bold = required; the rest are
optional and module-dependent.

| Facet | Type | Axis kind | Applies to | Example |
|---|---|---|---|---|
| **`module`** | enum | closed | all | `vocabulary` |
| **`theme`** | slug (leaf of hierarchy) | hierarchy leaf | vocab, colloc, dialogue, writing | `behoerde.anmeldung` |
| **`cefr`** | enum `A1…C2` (+ sub-band) | closed | all | `B2.1` |
| `function` | enum (communicative intent) | closed | redemittel, dialogue, phrase-like | `negotiation` |
| `register` | enum neutral/formal/diplomatic | closed | all text | `formal` |
| `pos` | enum | closed | vocabulary | `noun` |
| `frequency` | enum core/common/specialized | closed | vocab, colloc | `core` |
| `examTag` | enum set | closed, multi | all | `telc-email`, `goethe-sprechen` |
| `topicTags` | `string[]` | **open** | all | `["Meldebescheinigung","Termin"]` |
| `canDo` | `string` (Goethe-style descriptor) | open | all | "Kann sich beim Amt anmelden" |

**Reading it:** `theme` and `cefr` are the two spine facets present on *everything*. `function`
is the spine for Redemittel/dialogue. The rest are enrichment. The genius of this is that it is
**additive**: the app works today if we add only `cefr` + a `theme` that nests; everything else
can be back-filled over months without breaking anything.

---

## Slide 9 — Proposed Theme Architecture (2 of 5): The Domain layer (NEW, top level)

We have 11 sibling themes with no parent. As we add banking, Arzt, housing, … this flat list
breaks. Introduce **5–6 Domains** as the top tier. Proposed set, grounded in the product scope
note (workplace + daily-life + exam):

| Domain id | DE label | EN label | Holds (today + roadmap) |
|---|---|---|---|
| `beruf` | Berufsleben | Working life | meetings, scheduling, logistics, customer, conflict, project |
| `arbeitswelt` | Arbeitswelt & Umfeld | Work environment | technology, sustainability, safety, travel |
| `alltag` | Alltag & Erledigungen | Daily life & errands | behoerde, *banking, housing, shopping (roadmap)* |
| `gesundheit` | Gesundheit & Soziales | Health & social | *Arzt, insurance, family (roadmap)* |
| `bildung` | Bildung & Sprache | Education & language | *grammar-as-theme, study skills (roadmap)* |
| `pruefung` | Prüfungstraining | Exam training | *cross-cutting view, not a content home (see slide 11)* |

Notes:
- The split of the 10 workplace themes into `beruf` vs `arbeitswelt` is a judgment call; an
  alternative is one `beruf` domain of 10. Recommendation: **two domains** so no single domain
  has 10 children (keeps every tier within 7±2).
- This is purely additive: add a `domain` field to `ExamTheme` and one `domains.ts` file.
  No content moves; each existing theme just gains a parent pointer.

---

## Slide 10 — Proposed Theme Architecture (3 of 5): The Sub-theme layer (NEW, the missing middle)

Today a learner picks "Behörden & Ämter" and gets ~25 words in one undifferentiated pile. The
*situations* array already hints at the natural sub-themes; we should promote it to real tags.

**`behoerde` worked example** (template for every theme):

```
Domain:  alltag — Alltag & Erledigungen
 └─ Theme: behoerde — Behörden & Ämter
     ├─ behoerde.anmeldung      Anmeldung & Meldewesen      (register address, Meldebescheinigung)
     ├─ behoerde.auslaenderamt  Ausländerbehörde & Aufenthalt (visa, residence permit)
     ├─ behoerde.antrag         Anträge & Unterlagen         (forms, documents, deadlines)
     └─ behoerde.bescheid       Bescheide & Widerspruch      (official letters, appeals)
```

Each existing `situations[]` entry becomes (roughly) one sub-theme. Each vocab/collocation/
prompt then tags to a leaf (`behoerde.antrag`) instead of just the theme (`behoerde`).

**Migration is mechanical and low-risk:** an item with no sub-theme tag simply rolls up to its
theme (the current behavior), so we can introduce the layer and back-fill leaves theme by theme
without ever shipping a broken state. "Theme view" = union of its sub-themes; nothing regresses.

**Why this is the highest-value single change:** sub-themes are what make 10,000 items navigable
and what give the SRS/AI a fine enough grain to say "you are weak specifically on *Bescheide*,"
not just "weak on Behörde."

---

## Slide 11 — Proposed Theme Architecture (4 of 5): Cross-cutting views (exam, function) are NOT hierarchy nodes

A trap to avoid: making "Exam prep" or "Formal phrases" a *folder* in the theme tree. They are
**queries**, not places. An exam set pulls Behörde vocab + negotiation Redemittel + email
grammar; it does not *own* that content.

| View the learner wants | Implemented as | NOT as |
|---|---|---|
| "telc B2 Beruf prep" | a saved filter: `examTag = telc-*` across all modules | a top-level theme that duplicates content |
| "Formal email phrases" | `register=formal` × `function∈{request,opinion}` × `module=redemittel` | a "Formal" theme |
| "Everything at B2.1" | `cefr=B2.1` across all modules | a "B2" course silo |
| "My weak spots" | `masteryState=weak` (from SRS) | n/a |

This is the **"one backend, many projections"** principle from slide 4 made concrete. The
`pruefung` domain on slide 9 is therefore a *presented view* (a curated landing page that runs
exam-tag queries), not a content home. Keeping cross-cutting concerns as facets is what prevents
the dreaded content duplication that sinks Babbel-style siloed tracks.

---

## Slide 12 — Proposed Theme Architecture (5 of 5): Full visual hierarchy example

```
Genauly content universe
│
├─ DOMAIN  beruf — Berufsleben
│   ├─ THEME  meetings — Besprechungen & Teamarbeit            [B1–B2]
│   │   ├─ meetings.moderation     Moderieren & leiten
│   │   ├─ meetings.beitrag        Beiträge & Vorschläge
│   │   ├─ meetings.protokoll      Protokoll & Abstimmung
│   │   └─ meetings.konsens        Konsens & Entscheidung
│   ├─ THEME  conflict — Konfliktlösung                        [B2]
│   │   ├─ conflict.deeskalation   Deeskalation
│   │   ├─ conflict.kompromiss     Kompromiss aushandeln
│   │   └─ conflict.kritik         Kritik geben & annehmen
│   └─ … (scheduling, logistics, customer, project)
│
├─ DOMAIN  alltag — Alltag & Erledigungen
│   └─ THEME  behoerde — Behörden & Ämter                      [B1–B2]
│       ├─ behoerde.anmeldung · behoerde.auslaenderamt
│       └─ behoerde.antrag    · behoerde.bescheid
│
└─ DOMAIN  pruefung — Prüfungstraining   (VIEW, not a content home)
    ├─ telc B2 Beruf      → query: examTag = telc-*
    └─ Goethe B2          → query: examTag = goethe-*

FACETS (orthogonal, apply across the whole tree above):
  cefr ∈ {A2, B1.1, B1.2, B2.1, B2.2, C1}
  function ∈ {suggestion, agree, disagree, negotiation, … }   (9 today)
  register ∈ {neutral, formal, diplomatic}
  pos ∈ {noun, verb, adjective, … }
  frequency ∈ {core, common, specialized}
  examTag ∈ {telc-email, telc-gespraech, goethe-sprechen, … }  (multi)
  + masteryState (derived from SRS, per learner)
```

Three visible tiers. Everything else is a property you switch on, not a place you walk to.

---

## Slide 13 — Proposed Filtering System (1 of 4): The three filter tiers

Filters are graded by how often a learner needs them. Show the common ones always; tuck the rest
behind "More filters."

| Tier | Filters | Default visibility | Why |
|---|---|---|---|
| **Core (always visible)** | Theme/Sub-theme · CEFR level · (Module, when cross-module) | Inline chips/dropdowns | These answer 80% of intents: "Behörde words at my level." |
| **Contextual (one tap away)** | Domain · Frequency/Importance · Exam tag | Behind "Filter" button | High value but not every session. |
| **Linguistic / Learning (advanced)** | Register · POS/word-type · Function · Mastery state · Practice status | "Advanced" section in the filter sheet | Power users and the SRS/AI engine; most learners never touch them by hand. |

**Essential vs optional vs advanced**, stated plainly:
- **Essential** (build first, every module): Theme, Sub-theme, CEFR.
- **Optional** (build second): Exam tag, Frequency, Register.
- **Advanced** (build last / mostly machine-driven): POS, Function, Mastery state, full-text search.

Mastery/practice state deserves emphasis: it is the filter that turns a *browser* into a
*study tool* ("hide what I've mastered, drill what's due"). It is advanced to *expose as a manual
toggle* but central to the *automated* SRS path.

---

## Slide 14 — Proposed Filtering System (2 of 4): Filter logic (AND / OR / facet counts)

How filters combine determines whether the system feels smart or frustrating.

- **Across different facets: AND.** `theme=behoerde` AND `cefr=B2.1` AND `register=formal` →
  intersection. This is the universal, expected behavior.
- **Within one facet: OR.** `cefr ∈ {B1.2, B2.1}` (a range), `examTag ∈ {telc-email,
  goethe-schreiben}`. Multi-select inside a facet is a union.
- **Show live counts and disable dead ends.** Every facet value shows how many items remain
  given the *other* active filters (`Formell (12)`), and values that would yield zero are
  greyed, never offered as a trap. This single behavior is the difference between faceted search
  that feels guided and one that feels like a guessing game.
- **Never return an empty screen.** If a combination is empty, don't show a blank page; show
  "Nothing at B2.1 + formal here yet. Nearest: 8 items at B2.2." This also doubles as a content-gap
  signal for us (see slide 21).

**State lives in the URL** (we already use `useSearchParams` for `theme`). Extending it to
`?theme=behoerde.antrag&cefr=B2.1&register=formal` makes every filtered view **shareable,
bookmarkable, and deep-linkable** — which the writing coach's "Üben" deep-links (slide 18)
depend on.

---

## Slide 15 — Proposed Filtering System (3 of 4): UI patterns per surface

One filter *model*, several *renderings* sized to the device and the module.

| Surface | Pattern | Notes |
|---|---|---|
| **Mobile browser** | Sticky **filter bar** of scrollable chips (Theme ▾ · Level ▾ · More ▾). "More" opens a bottom **filter sheet** (reuse the locked overlay tokens from `dialog.tsx`). | Respects the locked mobile nav; the filter sheet is a normal dialog, not a nav change. |
| **Desktop browser** | Left **facet rail** with checkboxes + counts (Lingoda/Anki style). | Real estate exists; show more facets at once. |
| **Search box** | Free text over `topicTags` + headwords + `canDo`, scoped by the active facets. | Open axis. The escape hatch when the learner does not know the taxonomy. |
| **Guided entry** | Curated "starting points" on the dashboard: intent cards ("Prep a job interview", "Survive the Bürgeramt") that set a filter bundle. | Intent-based navigation from slide 4; the antidote to taxonomy paralysis. |

**Progressive disclosure is the core UX principle:** a first-time learner sees two controls
(Theme, Level) and an intent card. A power user opens "Advanced" and slices on register × POS ×
mastery. Same data, graduated complexity. Never show all 8 facets to a beginner.

---

## Slide 16 — Proposed Filtering System (4 of 4): Learner-state filters & personalization

The facets above are *content* properties. The most powerful filters are *relationship*
properties between the learner and the content. We already compute these in `engine/srs.ts`
(`mastery`, due dates) but never expose them as filters.

| Learner-state filter | Source | Powers |
|---|---|---|
| Mastery (new / learning / review / mastered) | `useProgressStore.srs` | "Hide mastered", "show weak" |
| Due now | SRS due date | The daily review queue |
| Weakness category | writing-coach analysis → `WeaknessCategory` | "Practice your cases", the `PracticeArea` deep-links |
| Seen / never opened | progress store | "New to me" discovery |

**This is where the taxonomy pays off for AI/adaptivity (slide 19):** the moment content is
tagged on clean facets, an adaptive engine can compose a session as a *query* — "12 due items,
weighted toward `cefr=B2.2` and `function=negotiation` because that is your weak corner, drawn
from the `customer` theme you started yesterday." Without facets, the engine is blind; with them,
personalization is just filtering with smart defaults.

---

## Slide 17 — Module-Specific Recommendations (1 of 3): Shared spine, module-specific facets

**The central question: one taxonomy or four?** Answer: **one shared spine, module-specific
extensions.** Standardize the axes that mean the same thing everywhere; let each module add the
facets only it needs.

| Facet | Vocabulary | Collocations | Redemittel | Schreibtraining |
|---|---|---|---|---|
| `theme` / sub-theme | ✔ primary | ✔ primary | ✔ secondary | ✔ primary |
| `cefr` | ✔ | ✔ | ✔ | ✔ (prompt level) |
| `register` | ✔ | ✔ (has it) | ✔ (has it) | ✔ (target register) |
| `function` | – | – | ✔ **primary** (has it) | ✔ (task intent) |
| `pos` | ✔ (has it) | – | – | – |
| `frequency` | ✔ | ✔ | – | – |
| `examTag` | ✔ | ✔ | ✔ | ✔ **primary** (task type) |

**Read the columns:**
- **Vocabulary** is theme-primary; its unique facet is `pos`.
- **Collocations** are theme-primary; `register` already exists and should be kept.
- **Redemittel** is **function-primary** (its `RedemittelCategory` *is* the spine) and theme is
  only a weak secondary. Forcing it under theme would be wrong; instead, *add* theme as an
  optional facet so a phrase can be surfaced inside a themed lesson.
- **Schreibtraining** is **exam-task-primary** (E-Mail / Stellungnahme / Notiz) with theme as the
  content source. Its current 1-short/1-long-per-theme structure should gain a `taskType` and a
  `cefr` so prompts are filterable by exam relevance and level.

---

## Slide 18 — Module-Specific Recommendations (2 of 3): Where to standardize vs customize

**Standardize (one definition, enforced by the linter):**
- The **theme hierarchy** (`domain → theme → sub-theme`). One source of truth in `themes.ts` /
  `domains.ts`; every module references the same leaf ids. This is what enables cross-module
  linking (slide 19).
- The **CEFR scale.** One enum, one set of sub-bands, used identically everywhere. No per-module
  "difficulty 1–3" that means something different in each place. *Migrate the quiz's
  `difficulty: 1|2|3` onto the CEFR enum so there is a single level vocabulary.*
- The **register enum.** Collocations use `neutral|formal`; Redemittel uses
  `neutral|formal|diplomatic`. **Unify to the superset** (`neutral|formal|diplomatic`) so a
  cross-module "formal" filter is meaningful.

**Customize (module owns it):**
- The **primary axis** per module (theme for vocab, function for Redemittel, task-type for
  writing). The shared model lets each module *declare* which facet is primary and render that
  one most prominently.
- Module-only facets (`pos` for vocab; `taskType` for writing).

**Rule of thumb:** standardize an axis the moment a learner could plausibly want to filter *across*
modules on it (level, theme, register, exam tag). Keep it module-local only if it is meaningless
elsewhere (POS of a multi-word phrase is meaningless; POS of a word is not).

---

## Slide 19 — Module-Specific Recommendations (3 of 3): Cross-module linking (the payoff)

A shared spine turns four parallel lists into **one connected graph**. Same `theme` leaf + same
`cefr` lets the app weave modules together — the feature competitors with siloed taxonomies
cannot build:

- On a **vocab** card for `der Bescheid` (theme `behoerde.bescheid`): "Used in collocations:
  *einen Bescheid erhalten*; Phrases for replying to one: *Hiermit lege ich Widerspruch ein…*;
  Practice: write a Widerspruch (writing prompt, same leaf)."
- A **dialogue/exam** scenario for a Bürgeramt visit auto-pulls the matching vocab, collocations
  and Redemittel by querying the shared leaf + level, instead of hand-maintaining ID lists.
- The **writing coach** detects weak `cases` → deep-links (existing `PracticeArea` mechanism) to
  a *filtered* drill set: `weakness=cases × cefr=B2 × theme=current`.

**This is the strategic reason to do the redesign now**, beyond tidiness: the faceted spine is the
substrate for adaptive learning, smart review, and AI-composed sessions. None of those are
buildable on a flat single-axis list; all of them fall out almost for free once the tags exist.
The taxonomy is not UI polish, it is the data model the intelligent features stand on.

---

## Slide 20 — Risks & Tradeoffs (1 of 3): Tagging cost & the over-engineering risk

| Risk | Severity | Mitigation |
|---|---|---|
| **Back-fill burden:** ~660 existing items need new tags (`cefr`, sub-theme, …). | Medium | Make every new facet **optional with a sane rollup default** (no sub-theme → rolls to theme; no cefr → "unleveled" bucket). Ship the *model* without a big-bang re-tag; back-fill theme by theme. The provenance register (`provenance.ts`) is the proof we can run a per-item back-fill queue with linter warnings. |
| **Over-engineering:** 8 facets is a lot of machinery for 11 themes. | High (real) | Phase it (slide 25). Ship **only `domain`+`sub-theme`+`cefr`** first. The other facets already exist on their modules (register, pos, function); we are *formalizing*, not inventing. Do not build facets with no content to fill them. |
| **CEFR-tagging is subjective.** Is *der Bescheid* B1 or B2? | Medium | Use the provenance/review workflow we already have (`review_status: draft→verified`). Tag as draft, refine over time. Lean on Goethe/telc word lists as the authority, exactly as the content conventions already require for sourcing. |
| **Linter scope creep.** | Low | `lint-content.mjs` already validates cross-refs and enums; new closed axes slot into the same pattern (one more array to keep in sync, like `THEME_IDS`). |

**The honest tradeoff:** faceted tagging front-loads authoring effort (every new item carries more
metadata) to buy back navigation, personalization and scale later. For a product betting on depth
and AI, that is the right trade. For a 50-item toy it would be over-engineering. We are past the
threshold where it pays off, and the cost only rises with every untagged item we add meanwhile.

---

## Slide 21 — Risks & Tradeoffs (2 of 3): UX complexity & content gaps

| Risk | Severity | Mitigation |
|---|---|---|
| **Filter overwhelm:** 8 facets paralyzes the learner. | High | Progressive disclosure (slide 15): 2 visible filters + intent cards by default; "Advanced" hides the rest. Most learners should never see a facet they don't need. |
| **Empty results:** narrow filters return nothing, feels broken. | Medium | Live counts + disabled dead-ends + "nearest match" fallback (slide 14). Never a blank screen. |
| **Sparse matrix:** facets multiply faster than content, so most (theme × level × register) cells are empty early on. | Medium | Treat empty cells as a **content roadmap**, not a bug. The filter UI's "0 items here yet" doubles as a heat-map of what to author next. Don't expose facet *combinations* we can't fill; reveal advanced facets as content density grows. |
| **Taxonomy churn:** sub-themes get renamed/re-parented as we learn. | Low–Med | Stable ids + mutable labels (slide 7). Re-parenting changes one `domain`/`parent` pointer, not every item, *because items tag the leaf id, not the path.* |

**Key UX insight:** the failure mode of faceted search is *too much control too soon*. The fix is
not fewer facets, it is **better defaults and staged reveal**. The power must exist; it must not
be in the beginner's face.

---

## Slide 22 — Risks & Tradeoffs (3 of 3): The decisions to make explicitly

These are genuine forks; picking deliberately now avoids thrash later.

1. **CEFR granularity: bands or sub-bands?** Recommendation: **sub-bands** (`B1.1, B1.2, B2.1,
   B2.2`). A plateau-breaker product lives *inside* B1→B2; whole-band resolution is too coarse to
   show progress across the exact stretch we specialize in.

2. **Two work domains or one?** (slide 9). Recommendation: **two** (`beruf` + `arbeitswelt`) to
   keep every tier ≤9 children. Reversible later; it is one pointer per theme.

3. **Sub-themes: required or optional?** Recommendation: **optional, rollup default.** Required
   would block content authoring and force a big-bang migration. Optional lets the layer grow
   organically. (Note: this contradicts the instinct to "make it clean from day one" — the
   pragmatic call is to let theme-only items keep working and back-fill sub-themes per theme.)

4. **Redemittel's primary axis: function or theme?** Recommendation: **keep function primary.**
   Resist the tidy-minded urge to force every module under `theme`. Redemittel is correctly
   function-indexed today; we *add* theme as a secondary facet rather than re-home it.

5. **Manual vs AI tagging for back-fill?** Recommendation: **AI-assisted, human-verified**, reusing
   the `review_status: draft → verified` workflow. An LLM proposes `cefr`/sub-theme/register; the
   linter flags drafts; a human confirms. Same governance pattern already in `provenance.ts`.

---

## Slide 23 — Final Recommendation (1 of 3): The framework

**Adopt a faceted taxonomy with a shallow theme hierarchy.**

1. **Spine (hierarchy, 3 tiers):** `Domain → Theme → Sub-theme`. ~6 domains, our 11 themes
   re-parented under them, ~3–6 sub-themes per theme. Items tag the **leaf id**.
2. **Facets (orthogonal tags):** `cefr` (sub-bands) and `register` on everything; `function` on
   Redemittel/dialogue; `pos`/`frequency` on vocab/collocations; `examTag` everywhere; open
   `topicTags` + `canDo` for search/AI.
3. **One shared spine, module-declared primary axis:** every module references the same theme +
   CEFR + register definitions; each declares which facet it renders first (theme / function /
   task-type).
4. **Filtering = progressive faceted search:** 2 core filters + intent cards by default; contextual
   and advanced facets behind "More"; AND across facets, OR within; live counts; URL-encoded state;
   plus learner-state filters (mastery/due/weakness) from the SRS.
5. **Cross-cutting concerns (exam, formal, level) are saved queries, never tree nodes.**

**What stays exactly as-is:** the locked mobile nav, the dialog/overlay tokens, the provenance
governance workflow, the linter architecture, the no-em-dash rule. This redesign is **purely
additive to the data model and the browser screens.** It does not touch any locked surface.

---

## Slide 24 — Final Recommendation (2 of 3): Implementation roadmap

Phased so value ships early and nothing breaks. Each phase is independently shippable and
linter-gated.

| Phase | Scope | Code touch points | Ships |
|---|---|---|---|
| **0 · Foundations** | Add `domain` + `domains.ts`; add optional `subThemeId` + `cefr` to types; extend `lint-content.mjs` with the new closed enums (mirror the `THEME_IDS` pattern). No content moves. | `types/index.ts`, new `data/domains.ts`, `themes.ts` (+domain pointer), `scripts/lint-content.mjs` | The model exists; everything still rolls up. Invisible to users. |
| **1 · Levels** | Tag all vocab/collocations with `cefr` (AI-draft → verify). Migrate quiz `difficulty` onto the CEFR enum. Add a **Level filter** to the vocab browser. | `vocabulary.ts`, `collocations.ts`, `VocabularyTrainer.tsx` | First user-visible win: "filter by level," the headline gap. |
| **2 · Sub-themes** | Promote `situations[]` into real sub-themes for the 2–3 densest themes (behoerde, customer, meetings). Add sub-theme drill-down to the browser. | `themes.ts`, content tags, browser UI | Navigable depth where content is densest. |
| **3 · Faceted browser** | Unify `register`; ship the full filter bar/sheet with counts + URL state; add intent cards to the dashboard. | shared filter component, `Dashboard.tsx` | The real multi-facet experience. |
| **4 · Cross-module + adaptive** | Cross-module "related" links via shared leaf+level; SRS-driven session composition; writing-coach deep-links onto filtered sets. | engine + feature wiring | The AI/personalization payoff. |

Phases 0–1 are the high-leverage minimum: they close the level gap and lay the spine. Phases 2–4
can follow content growth at the founder's pace.

---

## Slide 25 — Final Recommendation (3 of 3): Decisions needed & success metrics

**Decisions to confirm before Phase 0** (defaults in bold; all reversible):
- CEFR granularity → **sub-bands (B1.1…B2.2)**.
- Domain count → **6, with work split into `beruf` + `arbeitswelt`**.
- Sub-themes → **optional with theme rollup** (no big-bang migration).
- Redemittel primary axis → **stays `function`**, theme added as secondary.
- Back-fill method → **AI-draft + human-verify**, reusing the provenance review workflow.

**What success looks like:**
- A learner can express *"formal B2 Behörde email phrases I haven't mastered"* in ≤3 taps and get
  a non-empty, correct result.
- Adding a new daily-life domain (banking, Arzt) is *filling a template*, not *reshaping the model*
  — exactly as the content conventions already promise for themes today.
- The SRS/writing-coach can compose a session by querying facets, with no hand-maintained ID lists.
- Content gaps are visible as empty filter cells, turning the taxonomy into an authoring roadmap.

**One-line close:** the current flat 11-theme list is fine for 11 themes and fatal for 100. A
shallow hierarchy plus orthogonal facets is the smallest model that stays intuitive for the
learner, sound for the pedagogy, and open-ended for the content and the AI. Build the spine now,
while it is cheap; back-fill the facets as the library grows.

---

*Appendix — current-state reference (what exists in the code today):*
- *Themes:* 11, flat, one shared `ThemeId` union (`src/types/index.ts`), no parent, no sub-themes.
- *Vocabulary:* 516 items, faceted only by `themeId` + `pos`; **no level field**.
- *Collocations:* ~132, by `themeId` + `register (neutral|formal)`.
- *Redemittel:* function-indexed (`RedemittelCategory`, 9 values) + `register (neutral|formal|
  diplomatic)`; **theme-agnostic**.
- *Grammar:* `GrammarGroup` (10 structural buckets); its own axis.
- *Schreibtraining:* 1 short + 1 long prompt per theme (`writingPrompts.ts`), keyed by `themeId`.
- *Quizzes:* the only place a level-like field exists (`difficulty: 1|2|3`), not surfaced as a filter.
- *Filtering UI:* a single theme `Select` in `VocabularyTrainer.tsx`; theme state in the URL via
  `useSearchParams`. No other facet is filterable anywhere.
