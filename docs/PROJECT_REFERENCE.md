# Project Reference — stable, low-churn material

_Split out of `docs/PROJECT_STATUS.md` in session 70 for token efficiency. This holds the parts
that rarely change and are consulted on demand, not on every resume: reusable research findings,
the founder backlog, the product-evaluation findings, and per-session model guidance. The living
status doc is `docs/PROJECT_STATUS.md`; the append-only history is
`docs/archive/PROJECT_STATUS_ARCHIVE.md`._

## Research findings to reuse (don't re-research)

### Licensing guardrails for commercial use
Only use content under these licenses — anything else blocks monetization:
- **CC0** — public domain, no restrictions whatsoever.
- **CC BY** — free commercially; must credit the source.
- **CC BY-SA** — free commercially; modified versions must carry the same license.
- **CC BY 2.0 Fr** (Tatoeba's licence) — commercial-friendly; attribute the platform.
- ⚠️ **Never use CC BY-NC or CC BY-ND** — NC = non-commercial, ND = no derivatives; both block a paid app.

### Approved open-licensed sources (commercial-safe)
| Source | What it provides | Licence | Notes |
|---|---|---|---|
| **Tatoeba** | Hundreds of thousands of DE↔EN sentence pairs; community audio | CC BY 2.0 Fr | Best source for authentic example sentences; bulk download available |
| **Wiktionary / Wikidata** | Genders, plurals, inflections, definitions | CC BY-SA 4.0 | Good for vocab schema fields (article, plural) |
| **DWDS / Leipzig Wortschatz** | Word frequency, collocations, usage examples | Various (check per dataset) | APIs available; great for B2-level frequency filtering |
| **Wikibooks: German** | Structured grammar tables, vocabulary modules, A1→advanced | CC BY-SA 4.0 | Can integrate text into app; must keep project open-source under same licence if distributing modified version |
| **Wikimedia Commons** | Isolated German audio pronunciations by native speakers, illustrations | Mostly CC0 / CC BY / CC BY-SA (filter on-site) | Filter search to commercial-only before downloading any asset |
| **Project Gutenberg** | Original German texts (Kafka, Goethe, Brothers Grimm) | Public Domain | Copyright expired; freely slice, remix, sell as reading modules |
| **LibriVox** | Audiobook recordings of public-domain German texts | Public Domain | Volunteer-recorded; pairs with Gutenberg texts |

### Sources to avoid / handle with care
- **Goethe Wortlisten, Routledge Frequency Dictionary, all Klett books** (Netzwerk, Aspekte, Sicher!, Linie 1 Beruf) — fully copyrighted, no commercial reuse.
- **Deutsche Welle (DW)** — free for personal/educational use only; *not* universally CC-licensed for commercial redistribution. Check specific file metadata before using any DW asset; contact their distribution team if in doubt.

### Open-source infrastructure worth evaluating
- **AnkiDroid / AnkiCore ecosystem** — underlying SRS algorithm and app variants are open-source. Could inform future SRS improvements (the current `engine/srs.ts` implements FSRS-6 since s53; SM-2 fields kept warm for rollback).
- **LARA (Learning and Reading Assistant)** — open-source platform for building interactive reading materials with audio + translation. Relevant if we add a reading-comprehension module later.

### Writing eval infrastructure
- LanguageTool (LGPL, hosted API w/ free tier) for error categories; RAG is overkill for a single-insight output.
- Supabase supports anonymous sign-in, pgvector (unused), Edge Functions for secret-safe LLM calls from a static GitHub Pages SPA.


## Backlog — founder ideas (not yet scoped, added 2026-06-07)
Raw list from the founder, for future planning sessions to scope, sequence, and break into
phases. None of these are started; treat as candidates for the next `EXPANSION_PLAN.md` revision.

1. **Redesign the Dashboard** (the home/progress screen).
2. **Gate Schreibtraining behind sign-in:** show the login/sign-up popup (`AuthDialog`) when a
   signed-out guest tries to use Schreibtraining, instead of letting them in freely.
3. **Animated-character scenario simulations:** visual, contextual practice — simulate real
   workplace scenarios with animated characters (beyond today's text-based branching dialogues).
4. **Visual mnemonics for vocabulary:** icons/illustrations per noun gender — e.g. man, woman,
   baby/neutral or non-living-thing — to aid visual memory of `der`/`die`/`das`.
5. **Domain-based filtering for Vocabulary, Collocations, and scenario-based learning:**
   split content into "Bürokratie / bureaucratic work" vs. "office work," and within office
   work, further filter by industry/sector.
   - **SCOPED 2026-06-26 (session 41).** This is now designed in `docs/archive/TAXONOMY_REDESIGN.md`
     (+ `.pptx`) and planned in `docs/archive/TAXONOMY_IMPLEMENTATION_PLAN.md`: a faceted Domain → Theme →
     Sub-theme model with a Work/Personal/Both **Mode** lens and work-only **sector** facet (the
     industry/sector split the founder asked for). Not built yet; Phase 0–1 is the next build step.
6. **Redesign the Schreibtraining section.**
7. **Sourcing/audit infrastructure for content data:** build a data structure + pipeline to
   scrape from reliable open-licensed sources (see "Approved open-licensed sources" above), with
   a clear, audit-ready human-verification workflow. Every data point in the app should carry
   a clear source, verified status, and other metadata, tracked in an Excel/CSV in the project
   folder (not just inline in the TS files) so it's reviewable independent of the code.
   - **Now elaborated in `docs/strategy/DATA_GOVERNANCE.md` (v0.2, added 2026-06-14, revised 2026-06-15):** the
     full governance roadmap, provenance-register schema, commercial-safe license allowlist (SPDX) +
     planned machine gate, four-eyes workflow, and a phased path mapping to ISO/IEC 42001 + EU AI Act
     Article 10. **Founder policy (v0.2): traceability over ownership** — every item traces to an
     authoritative reference (Wiktionary / DWDS for word facts) or a commercial-safe source (Tatoeba
     CC-BY for example sentences); AI-assisted drafting must be verified and cited, not claimed as
     `OWNED`. Phase 1 (provenance register + reference/license gate in the linter + back-fill existing
     content) is the recommended next build step.
8. **Pricing page + plan design:** create a pricing page and design the various paid plans/tiers
   to offer (ties into the "monetize later" decision and the planned `tier` flag).
9. **Payment gateway integration:** add a payment provider so the plans in #8 can actually be
   purchased/billed.
10. **FAQ section on the landing page.**
11. **Expand landing page copy:** the landing page's body copy needs more substance/depth overall
    (beyond just adding an FAQ).
12. **SEO:** make the whole app + landing page SEO-friendly and take concrete measures so it
    surfaces in Google search results (meta tags, structured data, sitemap, performance, etc.).
13. **Marketing campaign:** plan and run a marketing campaign to drive signups/awareness.
14. **GDPR compliance (IN PROGRESS, s20 2026-06-08):** audit done + first robust pass shipped.
    Delivered: sign-up/onboarding consent checkbox with recorded consent (`CONSENT_VERSION`),
    in-app data export, in-app account deletion (`delete-account` Edge Function), per-submission
    writing delete (+ `writing_delete_own` RLS policy), honest reset that also clears cloud, a
    bilingual `/impressum` page, and privacy/terms copy updates (email usage, language-precedence,
    data-location, self-service rights). Decision: **no cookie banner** (functional-only storage is
    consent-exempt). Founder one-time steps in `docs/plans/PHASE2_SETUP.md` (deploy function, run
    migration 0003, optionally enable pg_cron retention, fill Impressum + region placeholders).
    Still open: lawyer review (#15), real Impressum details, optional auto-retention, marketing
    opt-in UI once a campaign (#13) is built.
    - **Impressum TEMPORARILY HIDDEN (founder, 2026-06-08):** the founder prefers not to put a home
      name/address in the public Impressum yet (an Impressum is public by law; a GitHub secret can't
      hide it since the page renders it to everyone). So `/impressum` is built but unrouted and all
      links removed; `Impressum.tsx` stays in the repo. Re-enable with a business/service address
      (a "ladungsfähige Anschrift", not a P.O. box) during the lawyer/launch pass: uncomment the
      import + route in `router.tsx` and restore the footer/Settings/privacy/terms links.
    - **Email-usage note (2026-06-07):** when doing this, make the privacy policy explicitly
      cover *every* way email is used — auth/login, password reset + account recovery, and any
      future transactional mail (payment receipts/billing) and marketing mail — and add proper
      opt-in consent for anything marketing-related. Context: we removed the "Wir nutzen deine
      E-Mail nur für die Anmeldung" line from the sign-in dialog (PR #114) because that promise
      was already a stretch (reset/recovery) and would be broken outright once the marketing
      campaign (#13) and payment gateway (#9) ship. So the policy must not repeat that narrow
      "only for sign-in" claim.
16. **Business plan + case study (added 2026-06-11, v1.1 shipped 2026-06-12):** produce a
    well-researched business plan and case study for Genauly — covering market sizing, competitive
    landscape, product-led growth model, unit economics, and traction narrative. Delivered in
    `docs/strategy/BUSINESS_PLAN.md`. Updated in v1.1 to reflect the broader positioning (see #18).
    Intended as a foundation for investor conversations and pre-seed fundraising (#17). Recommended
    model: **Fable** (research-heavy strategy work).
17. **Pre-seed funding (added 2026-06-11):** plan and execute a pre-seed fundraising round.
    Scope includes identifying suitable investors (edtech / language-learning / EU-focused), preparing
    pitch materials (deck, one-pager, data room), and deciding on instrument (SAFE, convertible note,
    or priced round). Depends on #16 (business plan) being substantially complete. Recommended
    model: **Fable** for strategy/pitch drafting.
18. **Reposition and redesign for the broader B1-B2 real-life purpose (added 2026-06-12):**
    The founder confirmed that Genauly's purpose is broader than exam prep. The primary audience is
    anyone who has learned basic German (around B1) and is stuck at the intermediate plateau: they
    can manage simple exchanges but lack confidence in real-life situations. The app should help them
    practise the situations that actually matter — presentations at work, visits to the Behörde,
    doctor appointments, job interviews, difficult conversations with colleagues — not just the
    ten current workplace/meeting themes.

    **What this backlog item covers (to be scoped and phased):**
    - Content expansion: add new scenario themes beyond the current workplace focus.
      Priority candidates: Behörde/bureaucracy, healthcare/doctor, job-hunting/interviews,
      social/housing, and public-transport/daily-life. Each theme needs dialogues, vocabulary,
      collocations, Redemittel, grammar drills, and quizzes at three levels.
    - Navigation and UI redesign: the current topic structure ("Meetings", "Logistics", etc.)
      maps to the old workplace-only framing. Redesign the topic browser, Dashboard, and
      onboarding flow to present the app as a situation-based real-life German tool, with
      workplace as one of several life domains.
    - Branding and copy alignment: update app shell labels, onboarding copy, and in-app
      descriptions to match the "German for real life, B1-B2" positioning (not "B2 Beruf exam
      prep"). Public-facing copy (landing, /about) was updated in the 2026-06-12 session;
      in-app copy still reflects the old framing.
    - Exam prep preserved but repositioned: the telc B2 Beruf and Goethe B2 exam-prep value is
      real and should remain, positioned as one benefit of the broader real-life practice, not
      the primary hook.
    - Do NOT hard-code specific content counts (word counts, scenario counts) in UI copy or
      marketing; the library is growing and numbers will be outdated quickly.
    - Recommended model for the design/planning phase: **Fable** (creative + strategic).
      Implementation: **Opus** for cross-section rework, **Sonnet** for mechanical content work.
    - **PROGRESS (2026-06-20):** the **first daily-life content pack shipped**, theme `behoerde`
      (Behörden & Ämter): ~25 vocab, 12 collocations, 2 branching scenarios (levels 1–2), 1 writing
      prompt, provenance rows. It auto-surfaces in Quiz/Vocabulary/Collocations/Simulation (those
      map over `themes` / group scenarios by level), so no UI redesign was needed. Counts now: 515
      vocab, 396 collocations, 12 dialogues, 11 themes. This is the reference template for the
      remaining packs (banking, healthcare, housing). Still open under #18: the nav/Dashboard
      "situation-based" redesign and the Bürokratie-vs-Office domain grouping (backlog #5).
      Scoping doc: `docs/strategy/AI_PRODUCT_STRATEGY.md`.
15. **Legal review with a lawyer (founder, 2026-06-08):** the live `/privacy` and `/terms` (AGB)
    pages were written in plain language by the team, not a lawyer. Before any paid plans (#8/#9)
    or a marketing campaign (#13) launch, have a qualified lawyer review both for German/EU
    enforceability. Likely additions a lawyer will want: a proper **Impressum (§5 TMG)** with the
    operator's real name + address, a clause on **which language version prevails** if DE and EN
    differ, withdrawal/cancellation rights for paid plans (Widerrufsrecht), and tightened
    liability wording. Ties into the GDPR-compliance item (#14).
    - **Disclaimer-banner question (2026-06-08):** founder asked whether the live pages should say
      the terms are "in development / under review." Recommendation: **no.** Calling your own terms
      provisional weakens their enforceability and looks unfinished; the "Zuletzt aktualisiert" date
      already signals they evolve. Keep the internal "needs lawyer review" caveat in this backlog,
      not user-facing. **Founder confirmed 2026-06-08: no banner.** (Revisit only the
      language-precedence line + Impressum during the lawyer pass.)
19. **Certification landscape deep-research — DONE (2026-06-15).** Completed via the deep-research
    harness (5 parallel cited passes). Output: **`docs/strategy/CERTIFICATION_RESEARCH.md`** (full findings +
    sources), with conclusions folded into `DATA_GOVERNANCE.md` v0.3. Headlines: we are **most likely
    NOT high-risk** under the EU AI Act (Annex III(3) is institution-tied; formative feedback + the Art.
    6(3) carve-out likely keep us out), with **profiling** and **institutional gating** as the two flip
    risks; **Article 50 transparency** (tell users they're interacting with AI / mark AI output) is a
    real obligation by **2 Aug 2026**; when we certify, sequence **ISO 27001 then ISO 42001** via TÜV
    NORD/SÜD (~$15K to $60K per standard); SOC 2 is US-centric, defer. Cheap trust signals exist (MISSION
    KI, Art. 95 code, Comenius EduMedia, Fraunhofer KI-Prüfkatalog). **Still needs a lawyer's sign-off**
    on the risk class (ties into #15). Spawned a new action #21 (ship Art. 50 transparency).
20. **Redo the logo — too close to Canva (added 2026-06-15):** the founder noticed the current
    Genauly mark (rounded gradient square with a white "G") looks very close to the Canva logo and
    wants it redesigned into something distinctive. Scope when picked up:
    - Design a new brand mark that is clearly differentiated from Canva (and other rounded-gradient-
      square app icons). Keep it legible at favicon size and recognisable on a home screen.
    - Once approved, regenerate **every** asset that currently uses the mark, matching the existing
      treatment rules in `CLAUDE.md` → "Brand logo": the canonical in-app file
      `public/genauly-default-logo-transparent-corners.png` (rounded transparent corners, used in all
      in-app spots), the favicons (`favicon-32.png`/`favicon-16.png`, rounded transparent corners),
      and the **full-bleed opaque** OS icons (`apple-touch-icon.png`, `pwa-192x192.png`,
      `pwa-512x512.png`, `pwa-maskable-512x512.png`). Also refresh the full-bleed square variant used
      for Google's OAuth consent crop (not in the repo).
    - Recommended model: **Fable** for the design direction, then **Sonnet** for the mechanical
      asset regeneration + wiring.
21. **EU AI Act Article 50 transparency (added 2026-06-15, from the #19 research) — CLOSED (s80,
    2026-07-07).** Both parts done: (1) the Art. 50 transparency **copy** is live — a point-of-use
    disclosure on `/writing` (`WritingHub.tsx`: text is sent to an AI, output is "KI-generierte
    Rückmeldung" and may contain errors) plus a dedicated DE/EN "KI-Schreibfeedback: wohin dein Text
    geht" section in `PrivacyPolicy.tsx`; (2) the documented **Article 6(3) risk assessment** now exists
    on file at **`docs/strategy/AI_ACT_RISK_ASSESSMENT.md`** (v1.0): assesses Genauly as not high-risk /
    limited-risk, relies on the Art. 6(3) narrow-task derogation, and flags **profiling** as the one
    point counsel must confirm. **Still open:** lawyer sign-off on the risk class (folds into #15); a
    machine-readable AI-output marking beyond the on-screen label if counsel wants it. Detail and sources
    in `docs/strategy/CERTIFICATION_RESEARCH.md`.
22. **Comprehensive end-to-end data strategy (added 2026-06-23):** produce a single coherent strategy
    document (e.g. `docs/DATA_STRATEGY.md`) covering the **full lifecycle of every kind of data in the
    app**, unifying threads currently spread across `DATA_GOVERNANCE.md`, `EXPANSION_PLAN.md`, and
    `PHASE2_SETUP.md`. Scope when picked up:
    - **Inventory by data class:** learning content (`src/data/*`), the provenance register, user
      progress + SRS state, writing submissions + AI feedback, settings + consent, and any analytics.
    - **Where each lives and how it flows:** localStorage (`b2beruf.*`), Supabase `profiles.settings`
      jsonb via `cloudSync`, the writing/delete-account Edge Functions, and AI-provider round-trips.
    - **Lifecycle:** acquisition/sourcing, validation (`lint:content`, `check:refs`), the four-eyes
      verification roadmap (draft → verified), Tatoeba example-sentence sourcing, retention/deletion
      (GDPR export + delete), and backup/migration.
    - **Governance & compliance:** how it satisfies EU AI Act Art. 10 / ISO 42001, the licence
      allowlist, and the audit-ready posture already built.
    - **A data model / ERD** and a roadmap of the gaps. This is the strategic umbrella over the
      audit-ready stream (#7). Recommended model: **Fable** (strategy; **Opus** while Fable is
      restricted).
23. **Detailed visualization plan for all learning components (added 2026-06-23):** produce a thorough
    design + data-viz plan (e.g. `docs/VISUALIZATION_PLAN.md`) for how **every learning component is
    visually presented** and how progress/data is visualized, consistent with the locked design system
    (bottom nav, dialog overlays, brand, two-tone icons). Scope when picked up:
    - **Component by component:** Vocabulary (flashcards, der/die/das gender colour-coding, visual
      mnemonics — ties #4), Collocations, Grammar drills, Redemittel, Dialogues/Simulations (ties #3),
      Exam mode, Quiz, and the Writing coach.
    - **Progress & data visualization:** the Dashboard (ties #1) and Analytics — SRS due/mastery
      views, XP/levels/streaks, per-theme and per-weakness breakdowns, using the existing `recharts`
      dependency. Define a consistent chart language.
    - **Cross-cutting:** a shared visual vocabulary, empty/loading/error states, motion
      (`framer-motion`) guidelines, dark-mode, and accessibility (contrast, reduced-motion).
    - Deliver mockups/specs per component and a build order. Ties into #1 (Dashboard redesign) and #6
      (Schreibtraining redesign). Recommended model: **Fable** (design direction; **Opus** for now),
      **Sonnet/Opus** for the build.
24. **Deep-dive source review + source strategy (added 2026-06-25):** properly review **every external
    source the content relies on**, confirm each one's **licence and commercial-use terms**, and write a
    coherent **source strategy** as a strand of the data strategy (#22). This is the qualitative "are
    these the right sources, and are we allowed to use them?" pass that complements the mechanical
    `check:refs` link-liveness gate. Scope when picked up:
    - **Audit the sources actually in use:** start from `SOURCE_META` in `src/features/legal/Sources.tsx`
      and the host breakdown the `/sources` page computes from `src/data/provenance.ts` (currently
      Wiktionary, DWDS, Wikipedia, Europarat/CEFR). For each: confirm the real licence + version, whether
      commercial use and our specific use (citing word facts vs. copying lists/sentences) is permitted,
      what attribution it requires, and stability/accessibility of the URL.
    - **Fix problem sources:** e.g. the founder flagged a **dwds.de** item whose reference "asks me to
      login" — find a freely-viewable, citable alternative (or a stable deep link). Generally prefer
      sources that are open without login and unambiguously commercial-safe.
    - **License hygiene:** reconcile what `SOURCE_META` claims against the commercial-safe SPDX allowlist
      the linter enforces and the `provenance.ts` `license` field; flag any mismatch (e.g. CC BY-SA
      share-alike implications for any adapted text, DWDS "reference" status).
    - **Define the strategy:** a ranked list of approved sources per content type (word facts, example
      sentences, grammar, level descriptors), the rule for when each may be used, the attribution
      pattern, and a fallback order. Capture it in `docs/strategy/DATA_GOVERNANCE.md` (or the planned
      `docs/DATA_STRATEGY.md` from #22) so future content authoring follows it.
    - Ties into **#7** (audit infrastructure) and **#22** (end-to-end data strategy); this is the
      "sources" chapter of that umbrella. Recommended model: **Fable** (research/strategy; **Opus** for
      now while Fable is restricted).
25. **"EN" peek/translate button (added 2026-07-02, founder idea, NEEDS BRAINSTORMING):** a button at
    the top of the app that translates the whole current screen to English at once, temporarily; the
    founder's sketch is "show EN for a few seconds, then it locks/reverts" so a learner gets a quick
    comprehension check without abandoning German immersion. **Deliberately parked**: the founder wants
    to brainstorm the interaction before anything is built. Notes for when picked up:
    - Pedagogically a "comprehension safety net" on top of the German-first copy policy (see
      `docs/archive/UX_OVERHAUL_PLAN.md` Part H, decision 3). The playbook favours desirable difficulty, so a
      deliberate-friction reveal (e.g. press-and-hold to peek) may beat a free toggle.
    - **Prerequisite already planned:** the UX-overhaul Phase-0 German copy pass keeps every EN string
      as data (blurbs, purposes, etc.), which is exactly what a whole-screen EN layer needs. No conflict.
    - Open questions to brainstorm: what does "the whole screen" cover (UI chrome, learning content, or
      both)? Reveal per screen or per element? What does "locked" mean afterwards (cooldown, daily peek
      budget, nothing)? Accessibility (reduced motion, screen readers).
    - Recommended model: **Fable** for the interaction-design brainstorm, **Sonnet** for the build.

26. **Verben- und Artikel-Hubs in der Bibliothek/Theorie (added 2026-07-13, founder to-do):** add a
    dedicated **Verbs hub** and a **Articles (der/die/das) hub** somewhere in the Theorie section
    (`/library`). Not yet scoped — likely new browse surfaces (or filtered lenses over the existing
    vocab bank) focused on (a) verb conjugation/valency practice and (b) noun-gender + article drilling
    (pairs naturally with backlog #4, the der/die/das visual mnemonics). Decide placement (a fifth
    LibrarySwitcher tab vs. entry cards vs. facet lenses), data source (derive from the vocab bank's
    articles/plurals + a verb-forms field, or a new bank), and whether it reuses the session engine.

### Product-evaluation findings (added 2026-07-03, from `docs/strategy/PRODUCT_EVALUATION.md`)

The five items below (#26–#30) are the recommendations from scoring Genauly against the learning-science
playbook (`docs/reference/LANGUAGE_LEARNING_SUCCESS_FACTORS.md`, Section 11). Each carries a **priority** on a
value·evidence ÷ effort basis (P1 = do first, P3 = nice-to-have) and names the evaluation dimension /
failure mode it closes. Suggested sequence: land the cheap wins that ride alongside other work (#26a
latency logging, #28, #30), then the two big rocks (#27 then #26b), with #29 paired to the AI roadmap.

> **SCOPED 2026-07-03 → `docs/plans/LEARNING_ENGINE_PLAN.md`; ALL FIVE ITEMS SHIPPED ✅ (Phase 0 =
> 26a + #28 + #30 in s51/PR #271, Phase 3 = #29 in s52/PR #273, Phase 1 = 26b FSRS in s53/PR #275,
> Phase 2 = #27 speaking block in s56/PR #284).** Only the optional Phase 1.5 latency plug-in
> remains. The summaries below are the original scoping record; the as-shipped notes live in the
> plan doc and the "Resume here" handoffs.

26. **FSRS scheduler + response-latency capture — Priority P1 (High).** _Fixes eval dim 1; failure mode
    #1._ The playbook's single most-cited upgrade: replace the SM-2 scheduler (`src/engine/srs.ts`) with
    **FSRS** (stability / difficulty / retrievability), which the source reports cuts review volume ~23%
    at equal retention, and score reviews on **latency, not just correctness**. Split into two sub-steps:
    - **26a (quick win, do now):** start *recording* per-review response latency in the review flow and
      SRS card state, even before changing the algorithm, so the training data exists when FSRS lands.
      Small, low-risk, unblocks 26b. Effort: **S**.
    - **26b:** swap SM-2 → FSRS behind the existing `engine/srs.ts` interface (a drop-in the UX plan
      appendix already anticipates), keeping "mastered" cards in long-term rotation. Effort: **M–L**.
    - Recommended model: **Opus** (algorithm + engine correctness).
27. **Speech-first, latency-tracked production drill — Priority P1 (High).** _Fixes eval dim 5 (the
    lowest score, 3/5); failure mode #2._ The blueprint's top exercise recommendation: hands-free,
    time-pressured speech-recognition drills that build spoken fluency, which today's scripted
    option-selection speaking does not. **MVP:** a new `SessionPlayer` block that prompts the learner to
    *say* the target under a soft timer, captures it via the existing Web Speech STT (`src/engine/
    speech.ts`, already feature-detected), and scores accuracy + latency; graceful text fallback when STT
    is unavailable. Upgrade path to Azure/SpeechAce phoneme scoring behind a paid tier later. Effort:
    **M–L.** Recommended model: **Opus** (new session block + speech integration).
28. **Guess-before-reveal (errorful learning) — Priority P2 (Medium, quick win).** _Fixes eval dim 1;
    failure mode #3._ Prompt a quick guess before showing a translation/answer (anticipatory prediction
    error), a cheap, high-evidence technique the playbook calls out. **MVP:** an optional "guess first"
    step in the existing flashcard/quiz components; measure repeat-error rate. Effort: **S.** Recommended
    model: **Sonnet**.
29. **Hook "investment" surface: custom decks / word capture — Priority P2 (Medium).** _Fixes eval dim 3;
    failure mode #4._ Today users build little "stored value", so switching cost stays low. **MVP:** a
    "Zu meiner Liste" / save-word action and a personal list that feeds the SRS with the learner's own
    context; later, import a word/sentence from anywhere. Pairs naturally with the AI sentence-mining idea
    in `docs/strategy/AI_PRODUCT_STRATEGY.md` (idea 11). Effort: **M** (touches store + cloudSync + a new surface).
    Recommended model: **Opus** (store/sync wiring), **Sonnet** for the UI.
30. **Talker variability: multi-voice TTS + speed toggle — Priority P3 (Low, quick win).** _Fixes eval
    dim 1/2 (phonological transfer); failure mode #5._ A single TTS voice ties schemas to one sanitized
    speaker; the playbook flags multi-voice/speed exposure as a productive desirable difficulty. **MVP:**
    let `engine/speech.ts` rotate among available `speechSynthesis` voices per session block, plus a
    speed toggle in settings. Effort: **S.** Recommended model: **Sonnet**.
31. **Game dark mode (DEFERRED by founder, 2026-07-06, session 72):** the dark-theme variant of the
    blessed modern pixel style (`preview/game-pixel-mockups/scene8-modern-dunkel.png`: dusk scene,
    night window, dithered lamp pool, dark UI surfaces). The founder liked it but ruled it "a bit of
    a stretch because of limited budget"; v1 game scenes ship light-theme only. Revisit only on an
    explicit founder go-ahead, ideally after the G2 playtest. Full decision record in
    `docs/DECISIONS.md` → "Game art direction (session 72)".
32a. **Waiting-as-gameplay (founder direction s73, spec in `GAME_DESIGN.md` §4):** every story
    wait runs a fictional clock and offers engage-or-wait choices (small talk, notice board,
    side quest); engaging is rewarded. Build with the G2 chapter-1 missions. Effort: **M**.
32b. **Print-Prop-Quests (founder direction s73, spec in `GAME_DESIGN.md` §10):** recurring
    tappable Werbung/Anzeige/Flyer props opening mini-exercises (comprehension, crossword,
    grid games) that pay perks. Needs a new mini-game renderer family; G2+. Effort: **M-L**.
32. **Game progression cloud sync (G2 migration, added s73):** `useProgressStore.missionsDone` +
    `keyItems` (game G1) are local-only because cloudSync's `progress` upsert has a fixed column
    set; an unknown column fails the WHOLE progress upsert. G2 adds a Supabase migration (e.g. a
    `game jsonb` or two array columns), then extends `progressRow`/`mergeRemoteProgress`
    (union-merge, like `scenariosDone`). Effort: **S** (plus the founder's one-time SQL step,
    PHASE2_SETUP pattern). Recommended model: **Sonnet**.

33. **Human-in-the-loop content-tracking + exception-queue tooling (added 2026-07-07, from the data-strategy
    Q&A):** the plumbing for the reviewer loop that `DATA_STRATEGY.md` §3 Layers 4–5 describe but hasn't
    been built. Scope: generate the committed **exception queue** report (`docs/reports/verification-queue.md`)
    from the machine sweeps (the items the fact/grammar/jury layers flag or disagree on, plus a random
    confidence sample), and wire it to the existing founder-only review surface — the `provenance_reviews`
    table (migration `0004`) + the `/sources` admin overlay (`src/lib/provenanceReviews.ts`) — so a reviewer
    clears the queue and each verdict persists with `reviewed_by` + timestamp and flips
    `review_status → verified`. This is the "how a human keeps track of content" answer made operational.
    Depends on Phase D (the AI jury) landing to fully populate the queue, but the queue-generator + review
    loop can be built against the Phase A/B (facts/grammar) flags now. Effort: **M**. Recommended model: **Opus**.
34. **Auditor handoff package (added 2026-07-07, from the data-strategy Q&A):** a one-page, repeatable
    "how to hand our data + sources to an auditor" doc/export that packages the reproducible per-item
    verification chain for an EU AI Act Art. 10 / ISO 42001 examiner. It composes what already exists —
    the `/sources` page (register + tier badge + confidence), the provenance register (typed + CSV export),
    the committed `docs/reports/verify-*.md` reports, the jury golden-set calibration metrics, and the git
    four-eyes trail — into a single sampling guide ("pick any content_id → here is its source, license
    snapshot, fact/grammar/jury verdicts with tool+version+date, and human sign-off"). Cheap, doc-only,
    strengthens the due-diligence story. Effort: **S**. Recommended model: **Fable** or **Opus**.
35. **Scale-to-100x database plan (added 2026-07-07, from the data-strategy Q&A):** the DB-management story
    the strategy docs don't yet cover, split by data plane. **Content plane:** trigger to migrate the
    learning library out of static `src/data/*.ts` into a Supabase `content` table (or headless CMS) with
    the provenance + verification fields as columns, CDN-cached at build time — only once the *library*
    itself approaches ~100x (build/lint/sweep times, review UI ergonomics); the verification ladder is
    already content_id-keyed so it moves unchanged. **User plane (the real 100x pressure):** a Supabase/
    Postgres scaling checklist — Supavisor/PgBouncer connection pooling first, index + index-friendly RLS
    predicates on every `user_id`, partition + archive the append-only tables (`ai_usage`, writing
    submissions), read replicas + the existing client cache, and the product-specific lever: **meter and
    server-side rate-limit/cap AI-writing-coach token spend** (`ai_usage` exists; the cap doesn't) so the
    Claude bill can't scale 100x uncapped. Also resolve the `progress` fixed-column upsert debt (see #32)
    before scale. Deliverable: a phased migration checklist with the specific Supabase migrations. Effort:
    **M** (planning) / **L** (execution, staged). Recommended model: **Opus**.

## Model guidance — which Claude model to set per session (added 2026-06-11)

> **Fable available again (2026-07-02):** the earlier restriction (noted 2026-06-15) is lifted; Fable
> is selectable and session 46's app review + UX overhaul plan ran on it. The "Opus for now"
> workaround no longer applies; "Recommended: Fable" rows mean Fable again.

We now have **Fable 5** as the frontier model alongside the Claude 4/5 families. Claude Code does
**not** auto-pick a model per task: whatever you set in `/model` runs the whole session, and the
assistant can't reassign itself mid-task. So set the model at the **start of each session** based
on the dominant work. (Subagents the assistant spawns can run on a cheaper model on their own, but
that's separate from the main session model.)

Rule of thumb: **design/decide with Fable, build with Opus/Sonnet, fill-in with Haiku.** Step up a
tier for ambiguous or high-stakes work (legal, payments). `opusplan` is a useful hybrid: Opus while
planning, then auto-switches to Sonnet for execution.

| Model | Best for | Cost |
| --- | --- | --- |
| **Fable 5** (frontier) | Architecture/system design, legal nuance, pricing/monetization strategy, persuasive marketing copy, research-heavy planning | Highest |
| **Opus 4.8** | Heavy cross-cutting implementation: multi-file features, careful refactors, security-sensitive integrations | High |
| **Sonnet 5** | Standard build work: well-specified features, UI from an approved plan, structured content authoring, doc-following integrations | Medium |
| **Haiku 4.5** | Mechanical, well-bounded edits: placeholder fills, config flips, single-file copy tweaks | Low |

Backlog items mapped to a recommended model (see "Backlog — founder ideas" and "Resume here"):

| Task | Recommended | Why |
| --- | --- | --- |
| Fill data-location placeholder (privacy DE/EN) | **Haiku** | One mirrored line, no judgment |
| Fill Impressum address + re-enable route/links | **Sonnet** | Mechanical but multi-file; must not break build |
| Enable pg_cron writing-text retention | **Sonnet** | Apply provided SQL with light care |
| Draft legal enforceability additions (Widerrufsrecht, liability, language-precedence) | **Fable** | German/EU legal reasoning, binding DE version |
| Content QC pipeline — CI lint (dup IDs, broken nodes) | **Sonnet** | Bounded script + CI wiring |
| Content QC — pedagogical / German accuracy review | **Fable** | B2-level correctness judgment |
| Grammar drills (shipped: now 24 topics / 117 drills) | **Sonnet** | Follows established schema; Fable for a final accuracy pass |
| Vocabulary (shipped: now 1,022 words) | **Sonnet** | Bulk schema-following content |
| FAQ section (landing) | **Sonnet** | Straightforward copy + UI |
| Expand landing copy | **Fable** | Persuasive, on-voice copy; Sonnet if budget-conscious |
| Visual mnemonics for vocab (der/die/das) | **Sonnet** | Asset wiring against existing schema |
| Dashboard redesign | **Opus** | Superseded by UX overhaul Phase 1 (see the phase table below) |
| Schreibtraining redesign | **Opus** | Cross-section rework |
| Animated-character scenarios | **Fable → Opus** | Design with Fable, implement with Opus |
| Legal review with a lawyer (#15) | **Fable** | Engage/brief a lawyer; German/EU legal judgment, not code |
| Resend SMTP / LanguageTool key | **Haiku** | Config-level, follow docs |
| Turnstile CAPTCHA on guest sign-in | **Sonnet** | Follows provider docs, some care |
| Google sign-in branding completion | **Sonnet** | Mostly console steps + guidance, little code |
| Gate Schreibtraining behind sign-in | **Sonnet** | Reuse existing `AuthDialog` |
| Pricing page + plan/tier design | **Fable → Sonnet** | Strategy with Fable, build page with Sonnet |
| End-to-end data strategy (#22) | **Fable** (Opus for now) | Cross-cutting strategy + data modelling, not code |
| Visualization plan for learning components (#23) | **Fable → Opus/Sonnet** | Design direction with Fable, build the views with Opus/Sonnet |
| Monetization tier + paywall feature flags | **Opus** | Backend + UI + careful gating logic |
| Payment gateway integration | **Opus** | Money-handling; Fable for architecture/security design |
| Domain-based content filtering (by sector) | **Fable → Opus** | Data-model design with Fable, implement with Opus |
| Content sourcing/audit pipeline | **Fable** | Research-heavy design + verification workflow |
| SEO optimization (meta, sitemap, structured data) | **Sonnet** | Largely mechanical |
| Marketing campaign | **Fable** | Planning + creative |
| Business plan + case study (#16) | **Fable** | Market sizing, competitive research, unit economics, traction narrative |
| Pre-seed fundraising (#17) | **Fable** | Investor targeting, pitch deck, data room, instrument strategy |
| Routine bugfixes (e.g. UI tweaks) | **Sonnet** | Step up to Opus only when a fix turns gnarly or spans many files |

### UX overhaul plan phases mapped to models (added s46; see `docs/archive/UX_OVERHAUL_PLAN.md`)

The design/strategy work is already done (Fable, s46), so the phases below are **implementation**:
do not burn Fable on them. Fable reappears only where new pedagogical content gets authored.

| Phase | Scope | Recommended | Why |
| --- | --- | --- | --- |
| 0. Quick wins | Banner demotion, header slimming, German copy pass, cold-start state | **Sonnet 5** | Well-specified multi-file edits; founder reviews the German copy on the live site |
| 1. Session engine + Heute | `engine/session.ts`, SessionPlayer, end screen, Heute redesign | **Opus 4.8** | The big cross-cutting build: new engine + player + dashboard rework, regression-sensitive |
| 2. Global search + Tier-0 defaults | `searchAll()`, result sheet, band-default lists | **Sonnet 5** | Bounded: one pure function + one UI surface + list defaults |
| 3. Bibliothek + travelling scope | `/library` hub, segments, redirects, scope as app state | **Opus 4.8** | Routing/redirect/app-state work across four pages; easy to regress deep links |
| 4. Fortschritt + Can-Do | `canDo.ts` data + linter, milestone UI, diagnose card | **Fable → Sonnet 5** | Can-Do statements are pedagogical German content (Fable authors/reviews); UI build is standard |
| 5. Anwenden + nav re-map + facet registry | Anwenden hub, `DEFAULT_PINNED_TABS`, `lib/facets.ts` | **Opus 4.8** | Touches the locked nav store + pinned-tab migration; careful, not big |

