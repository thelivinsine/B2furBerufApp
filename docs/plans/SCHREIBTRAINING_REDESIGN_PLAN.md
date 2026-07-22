# Schreibtraining Redesign — Implementation Plan (Satzlabor)

_Authored 2026-07-22 (session on branch `claude/schreibtraining-todo-review-afoegv`) from a
five-expert design panel (AI/LLM engine, frontend architecture, German B1-B2 pedagogy, backend
cost/security, UX/product). Covers founder backlog item #6 "Redesign the Schreibtraining section."_

> **Note on backlog #2 ("Gate Schreibtraining behind sign-in"): already shipped.** `WritingHub.tsx`
> already stashes the draft and opens `AuthDialog` when a guest submits (`handleEvaluate`). Tick it off;
> this plan is only #6.

---

## 1. The vision (from the founder's sketch)

Turn the current "type an essay → get one coaching tip" screen into an interactive **write → correct →
transform** language lab:

- A **grammar-dimension filter rail** on the right (Aktiv/Passiv; Zeitform: Präsens/Präteritum/…),
  styled like the Bibliothek `FilterRail`.
- A **top box** where the learner writes a sentence. On submit, the AI shows the **corrected version
  below their text in the same box**, AND auto-selects the rail pills matching the sentence's current
  grammar ("this is Aktiv + Präsens").
- A **bottom box** that fills when the learner taps a *different* pill (Passiv, or Präteritum): the same
  sentence **transformed along that axis**, with a short German explanation of what changed.
- A top **Fokus / Kurz / Lang** mode toggle. Fokus = this new sentence lab. Kurz/Lang = the existing
  guided writing tasks (Kurz e.g. Beschwerde, Bitte um Info; Lang e.g. Bewerbungsschreiben,
  Forumsbeitrag).

Working name for the Fokus mode: **Satzlabor** (eyebrow), H1 stays **Schreiben**. Route stays `/writing`.

---

## 2. Decisions locked by the panel (near-unanimous)

These emerged independently from multiple experts and should be treated as the design spine:

1. **Fokus operates on ONE sentence, not a paragraph.** Voice/tense/mood transforms are sentence-internal;
   a paragraph mixes tenses and makes both detection and transform ambiguous. The corrector accepts 1-3
   sentences and segments; the transform bench works on one focal (learner-picked) sentence.
2. **Detection and transforms run on the CORRECTED sentence, never the raw input.** A broken sentence has
   undecidable voice/tense (missing auxiliary → "Perfekt vs Präteritum" is unknowable). The corrected form
   is the canonical anchor; every pill produces a variant of *that*.
3. **Transforms derive from the corrected base each time, not by compounding** the previous transform
   (avoids error accumulation). Voice and Tense are orthogonal and combine, so the bottom box always shows
   "corrected sentence, in the currently-selected voice + tense."
4. **Abstain, never hallucinate.** A wrong transform teaches an error, which is worse than no transform.
   The engine must return a structured "not applicable + reason" signal for impossible/unnatural
   transforms (passive of an intransitive, etc.), validated by a code contract + a LanguageTool re-check +
   a hand-built eval gate.
5. **A GLOBAL, cross-user transform cache is the primary cost lever.** A given (corrected sentence + target
   grammar) transforms identically for every learner, so the cache is shared, not per-user. This is what
   keeps the feature inside the existing **$5/month** global spend cap.
6. **The grammar rail is a NEW component, not a reused `FilterRail`.** FilterRail models "narrow a list by
   facets with live counts." The grammar rail models "show detected state + accept a target." Borrow its
   *visual language* (grey `bg-muted` tile, uppercase eyebrows, pill sizing, rail/panel responsive split),
   build a new `GrammarRail` with tri-state pills.
7. **MVP dimension set = Voice × Tense grid only:** Aktiv / Vorgangspassiv × Präsens / Perfekt /
   Präteritum. That alone is a complete, high-value, shippable tool. Everything else is Wave 2+.

---

## 3. The grammar dimension taxonomy

### 3.1 MVP (Wave 1) — the Voice × Tense grid

| Axis (group) | Pills (DE / EN gloss) | Notes |
| --- | --- | --- |
| **Genus Verbi** | Aktiv / **Vorgangspassiv** (*werden* + Partizip) | The #1 B2-Beruf marker; agentless process passive saturates workplace/admin German. Default "Passiv" pill = Vorgangspassiv. |
| **Zeitform** | Präsens / Perfekt / Präteritum | Perfekt↔Präteritum is a *register* choice (spoken vs written), not a meaning change — examiners reward it. |

Single-select **within** each group (radio behaviour); the two groups **combine** into a 2×3 grid.

### 3.2 Wave 2 (after the eval suite proves Wave 1)

- **Zustandspassiv** (*sein* + Partizip) as a distinct pill (teaches *wird geprüft* = process vs *ist
  geprüft* = state; do NOT fold into Vorgangspassiv).
- **Konjunktiv II (höflich/irreal)** — *können → könnten*, *ich will → ich hätte gern*. The fastest visible
  "sounds like a competent adult" upgrade. Deep-links `konjunktiv2`.
- **Register: Formell (Sie) ↔ Informell (du)** — directly in-scope (email vs chat); propagates to verb
  ending, possessive (Ihr↔dein), imperative.
- **Satzbau: Hauptsatz ↔ Nebensatz** (weil/dass) — makes the verb-final Verbklammer physically visible.
  The best single animation the tool can offer. Deep-links `subordinate`/`verbPosition`.

### 3.3 Deferred / gated / deep-link-only (NOT free toggles)

- **Konjunktiv I / indirekte Rede** — a trap as a live toggle (forms collapse to K-II in most persons,
  needs a matrix verb, rarely produced). Deep-link the `reportedSpeech` lesson instead.
- **Futur I** — trains the unnatural "werden + Inf" where Präsens is idiomatic; ship only as *Vermutung*
  with a warning note. **Futur II** — cut entirely (noise at B1-B2).
- **Plusquamperfekt** — stranded without a second past event; offer only with a temporal anchor.
- **Nominalstil (nominal↔verbal)** — high value but C1-leaning and easy to make clunky; frame as
  *situationally formal*, never "more advanced = better." Wave 3.

### 3.4 The linguistic guardrails (the tool's real IP)

Per axis, detect the blocker and **grey the pill with a one-line German reason** rather than force output.
A greyed pill with "geht hier nicht: intransitives Verb" teaches as much as a successful transform.

- **Passiv:** no accusative object → no personal passive (intransitives: offer impersonal *Es wird…* only
  when idiomatic, else refuse). Non-passivizable verbs (*haben, bekommen, kennen, es gibt*, most
  reflexives) → refuse. **Dative-object verbs keep the dative and stay subjectless** (*Man hilft dem
  Kunden* → *Dem Kunden wird geholfen*, never *Der Kunde wird geholfen*). **Perfekt passive uses *worden*
  not *geworden*** (*ist geprüft worden*). Offer dropping the *von*-agent (agentless is the more B2 form).
- **Tempus:** separable verbs split then rejoin in the participle (*rufe an* → *habe angerufen*).
  Motion/change-of-state verbs take *sein* not *haben* (*bin gefahren*). **Modals + haben/sein/wissen stay
  Präteritum even in "spoken past"** (*konnte, musste, war, hatte*), don't force *hat gekonnt*.
- **Konjunktiv II:** prefer the synthetic form for *sein/haben/modals/strong verbs* (*wäre, hätte,
  könnte, käme*) over weak *würde sein*.
- **Satzbau:** Nebensatz moves the finite verb to the end (aux-last in the perfect); watch the modal
  double-infinitive quirk. After any Vorfeld reorder keep strict V2 (never V3). Subjectless/*es*-sentences
  resist these.
- **Register Sie→du:** must propagate to *every* dependent form; a half-converted sentence is worse than
  none.

### 3.5 Micro-explanations + curriculum deep-links

Each transform shows a one/two-line German note (hold-to-peek EN via the existing `EnPeek` pattern) naming
*what moved and why*, plus a "mehr dazu" link into the app's 24-topic grammar bank. The tool becomes a
**front door** to the grammar lessons: the learner discovers a topic through their own sentence.

| Transform | Deep-link topic (`group`) |
| --- | --- |
| Aktiv↔Passiv, worden, Zustandspassiv | `passive` |
| Perfekt/Präteritum (aux+participle bracket) | `verbPosition` |
| Konjunktiv II | `konjunktiv2` |
| Hauptsatz↔Nebensatz, Vorfeld/V2 | `subordinate`, `verbPosition` |
| Register / politeness | `konjunktiv2`, `modals` |
| Dative survives passive | `cases` |

---

## 4. AI engine

Two operations. Each reuses `evaluate-writing`'s auth / limit / `ai_usage` / provider-fallback plumbing.

### 4.1 `check-sentence` (correct + detect) — one call

Corrects the text and, on the **corrected** form, segments it and detects `{voice, tense, mood, finite_verb}`
per sentence. One call (correction + classification share the input; detection needs the corrected text).

- **Model:** `claude-haiku-4-5`, `temperature: 0`. Correction is what today's evaluator already does well;
  detection is classification.
- **Structured output** (`strict` JSON schema) replaces the current fragile `raw.match(/\{…\}/)` regex.
  Schema: `{ corrected: string, has_errors: bool, sentences: [{ text, voice, tense, mood, finite_verb }] }`
  with closed enums for voice/tense/mood.
- Draft system prompt: "Korrigiere nur echte Fehler, ändere korrekten Stil nicht; ist der Text fehlerfrei,
  gib ihn unverändert zurück und setze has_errors=false. Zerlege den KORRIGIERTEN Text in Sätze und
  bestimme voice/tense/mood/finite_verb." (Full draft in the panel briefs; no em dashes.)
- Returns a `check_id` the client uses to request transforms.

### 4.2 `transform-sentence` (transform) — cache-first, one call per settled toggle

Given the canonical corrected sentence + a target tuple `{voice, tense, mood}`, returns the transform.

- **Model:** `claude-sonnet-5` for transforms (morphological generation — participles, separable prefixes,
  auxiliary selection, K-II forms — is exactly where a small model fabricates plausible-wrong German).
  Send `thinking: disabled`, `output_config.effort: low`, no sampling params (Sonnet 5/Opus reject
  `temperature`). Per-call cost ≈ $0.002; trivial next to the $5 cap once cached. **A/B against Haiku on
  the eval set before locking in** — if Haiku passes the trap suite, downgrade for operational simplicity.
- **Structured output:** `{ applicable: bool, reason: enum, transformed: string, note: string,
  achieved: {voice, tense, mood} }`. Reason enum: `ok / kein_akkusativobjekt / intransitiv_unpersoenlich /
  bereits_zielform / nicht_idiomatisch / mehrdeutig / modalverb_grenze`.
- **Contract validation (free, in the Edge Function):** `applicable=true` ⇒ `transformed` non-empty AND
  ≠ source AND `achieved == requested tuple`; `applicable=false` ⇒ `transformed` empty, surface `reason`.
  Any violation → soft "nicht möglich" UI state, never a suspect sentence.
- **LanguageTool re-check** on the transformed sentence (already wired, near-free) — hard errors above a
  threshold → downgrade to the "not possible" state.

### 4.3 The precompute-vs-lazy reconciliation (the one panel tension)

The UX designer wanted the correction response to precompute all axes (instant taps, one round trip); the
LLM engineer rejected prefetching a 72-cell grid as wasteful. **Reconciliation, keyed to grid size:**

- **Wave 1 (6-cell grid):** the grid is small enough to **batch-precompute in ONE call at correction time**
  (a transform call whose schema returns an array of the 6 cells). Taps become instant, one round trip,
  and every cell lands in the global cache. This is the UX designer's "cleanest" path and it is affordable
  *because the MVP grid is tiny*.
- **Wave 2+ (grid grows past ~12 cells):** switch to **lazy one-call-per-settled-toggle**, cache-first,
  with optional background neighbor-warming (the other voice at the current tense; adjacent tenses).
  Debounced 250-350ms, `AbortController`-cancelable, client in-memory `Map` in front of the server cache.

Either way the global DB cache means repeated/return visits are free.

### 4.4 Eval gate (non-negotiable before launch)

Hand-build ~50 verified `(source, target, expected / not-applicable)` triples covering every trap in §3.4.
Gate model/prompt changes on it, analogous to the repo's `pnpm test:srs` golden vectors. Owner + acceptance
bar to be set with the founder.

---

## 5. Backend (cost / security / data)

### 5.1 Function topology — two new functions, do NOT overload `evaluate-writing`

`evaluate-writing` is the essay grader (3000-char input, `writing_evaluations` history, 5/day semantics
wrong for a rapid single-sentence tool). Copy its CORS allowlist, JWT-identify pattern, service-role
client, `monthKey`/`ai_usage`/`bump_ai_usage`, and `hashText` into the two new functions. `transform-sentence`
requires a `check_id` from `check-sentence`, so no un-checked raw text ever enters the transform path.

### 5.2 The three-tier cost ladder (each transform stops at first hit)

1. **Tier 0 — global cache (FREE):** `sentence_transforms` keyed by `hash(corrected_normalized + canonical
   target_tuple + PROMPT_VERSION + MODEL)`. Cross-user shared. No `ai_usage` bump, no rate-limit spend.
   Expect >90% hit rate within days (common textbook sentences overlap heavily; a learner toggling
   back-and-forth re-hits instantly).
2. **Tier 1 — deterministic rules (FREE):** **launch OFF** (empty rule set). German morphology is too
   irregular; a wrong free answer is worse than a correct paid one. Add rules only where provably safe
   (e.g. plural pulled from the app's own verified `vocabulary.ts`). Architecture supports it; don't block
   launch on it.
3. **Tier 2 — Sonnet 5 (PAID, last resort):** tiny payload (~150 tok in/out), `max_tokens: 200`. On
   success, **write into the Tier-0 cache** so no one pays for that transform again.

### 5.3 Rate limits (separate transform budget; count ONLY paid Tier-2 ops)

Cache/rule hits must NOT consume a learner's budget or the UX dies on a warm cache. All env-overridable.

| Limit | Value | Where |
| --- | --- | --- |
| Transform burst | 8 paid / 60s rolling | `transform-sentence` |
| Transform sustained | 40 paid / day / user | `transform-sentence` |
| Sentences checked | 20 / day / user | `check-sentence` |
| Per-user monthly paid ceiling | 200 paid ops / month (check+transform) | both |
| Global monthly $ cap | **reuse existing $5** via `ai_usage`, pre-flight | both |
| Per-IP burst (pre-DB brake) | ~30 req / IP / min | both (borrow `submit-feedback`'s `ipBurstHit`) |

**The headline safety property:** both functions gate on the shared `$5` `ai_usage` fuse *before* any paid
call. The feature multiplies *calls* but NOT *maximum monthly spend* — the $5 ceiling is preserved by
construction.

### 5.4 DB — migration `0009_sentence_studio.sql` (0008 is current highest)

- `sentence_checks` — per-sentence correction rows. Owner-only RLS (`select`/`delete` own, GDPR erasure
  like `writing_delete_own`); service-role inserts.
- `sentence_transforms` — **GLOBAL cache, no `user_id`, no client RLS policies** (service-role only, same
  posture as `ai_usage`). Holds only practice German sentences (no PII), so global sharing raises no GDPR
  concern. Columns: `transform_hash pk`, `source_hash`, `target_tuple jsonb`, `result`, `note`, `tier`,
  `model`, `hits`, `created_at`.
- `sentence_ai_ops` — append-only ledger of **paid** ops only (backs the rate limits; cleanly separates
  billable events from cached serves). Owner-read for transparency/export.
- **Kill-switch:** reuse `app_config` (0008) key `sentence_studio` (`{enabled, transforms_disabled}`);
  functions read it at startup, absent → enabled. Founder flips from `/admin` Steuerung, no redeploy.

### 5.5 Security

- **Input bounds:** `MAX_SENTENCE_LEN` env, default **300 chars** (10× below the essay cap). Reject <3 or
  >cap; reject multi-sentence blobs in `check-sentence` (enforce the single-sentence contract, don't assume).
- **Target-tuple validation** against a server-side closed enum (like `VALID_WEAKNESS`) — off-enum → 400,
  never forwarded to the LLM.
- **Auth:** reuse the JWT gate + guest-auto-create path (unless `TURNSTILE_ENABLED`). Every call attributes
  to a `user_id` for rate limiting. **CORS:** reuse the allowlist unchanged.
- **Prompt injection:** learner text is untrusted *data* — delimit it (`"""…"""`), put the task in the
  system prompt + structured tuple (never interpolate), demand JSON-only output (injection → parse fail →
  graceful fallback). Blast radius bounded: `max_tokens: 200`, no tools, no secrets/other-user data in
  context. Re-validate output via LanguageTool.

### 5.6 Observability

Transforms bump the same `ai_usage` row, so the `/admin` Übersicht AI tile shows combined spend with zero
new code. Extend `admin_overview()` to surface `sentence_ai_ops` counts + the **cache hit rate** (the single
number proving the cost design works). Alert the founder via the existing Resend path at ~60% of the cap.

---

## 6. Frontend architecture

### 6.1 Component tree — refactor `WritingHub` from a monolith into a mode router

```
WritingHub                     (route wrapper: ?mode / ?theme / ?view; owns AuthDialog + draft resume)
├── WritingModeSwitcher        (NEW — ViewSwitcher/useSlidingPill variant: Fokus · Kurz · Lang)
├── mode=fokus → FokusTrainer  (NEW — the sentence lab)
│   ├── FokusInputCard         (top box: textarea + Korrigieren; renders CorrectionView inline)
│   │   └── CorrectionView     (learner text muted, corrected line full-strength + soft-wash diff)
│   ├── FokusTransformCard     (bottom box: the transformed sentence + micro-explanation + SpeakButton)
│   ├── GrammarRail            (NEW — right rail desktop / chip row mobile; tri-state pills)
│   │   └── GrammarPill        (idle / detected="aktuell" / selected-target)
│   └── AiDisclaimer           (extract today's Art.50 line into a shared snippet)
├── mode=kurz|lang → GuidedWritingTrainer  (= today's editor+result flow, extracted near-verbatim)
│   └── ThemePicker · PromptCard · Editor · ResultCard (+ collapsible "Korrigierte Fassung anzeigen")
└── view=history → WritingHistory  (unchanged)
```

New pure-data + logic files: `fokus/grammarDimensions.ts` (axis/pill taxonomy, keys map 1:1 to the AI's
`detected` payload), `fokus/useFokusMachine.ts` (state), `aiCorrection.ts` (client calls, sibling of
`lib/writing.ts`). **Kurz = `length:"short"`, Lang = `length:"long"`** — the mode switcher absorbs the old
length toggle, so `evaluateWriting({theme,length,text})` and `writingPrompts[theme][length]` stay untouched.

### 6.2 State model — local `useFokusMachine`, not zustand

Ephemeral single-screen state (like today's local `WritingHub` state and `SessionPlayer`). Discriminated
union: `idle → submitting → corrected(+detected) → transforming(axis) → transformed`, plus `error`.
Holds `input`, `submittedText`, `correction {corrected, diff}`, `detected {axis:value}`, `target {axis,value}`,
`transform`. **Critical invalidation rule:** any edit to the top text after a correction clears
correction+detected+target+transform back to `idle` (a stale correction under a changed sentence is worse
than none). Only persistence need = draft-across-sign-in, served by extending `resumeDraft.ts` (add `mode`),
NOT zustand/cloudSync.

### 6.3 The rail's dual role (the core UX problem) — three pill states

A B1 learner must never confuse "what your sentence IS" with "tap to change it." Solve with distinct visuals
**plus** an explicit one-time legend ("Blau = jetzt. Tippe eine andere Form, um umzuformen.", dismissible
like `artikelLegendDismissed`):

| State | Meaning | Visual |
| --- | --- | --- |
| **aktuell** (detected) | the sentence's *current* grammar | soft fill `bg-primary/12`, `text-primary`, tiny `aktuell` badge/dot. Reads as a **status chip**. `aria-label="Aktiv, aktuelle Form"`. |
| **target** (tappable) | an alternative you can switch to | outlined `bg-surface border-border`, hover `bg-muted/60`. `aria-label="In Passiv umformen"`. |
| **selected target** | the transform now shown in the bottom box | outlined + `ring-2 ring-primary`, label bold. |

Fill = *fact about the sentence*; ring = *your action*. Groups are `role="radiogroup"` (single-select
within), Genus Verbi × Zeitform combine. A `RotateCcw` reset returns the bottom box to the corrected base.

### 6.4 Layout

- **Desktop (lg+):** reuse `VocabularyTrainer`'s FilterRail grid (`lg:grid-cols-[minmax(0,1fr)_18rem]`, a
  touch wider than 16rem for two groups). Row 1/col 1 = mode switcher at content width. Row 2 = left column
  (top box + correction, then bottom box) + right `GrammarRail` (`lg:sticky lg:top-20`, `bg-muted` tile,
  no Üben footer). Bottom box only exists after a transform (never two empty boxes).
- **Mobile:** distinct layout, not a squeezed rail. The grammar rail becomes a **horizontal scrollable chip
  row** directly between the corrected box and the bottom box (`aktuell` chips sort first, right-edge fade),
  so "current → tap → result right below" is a *better* proximity than desktop. Do NOT use a bottom sheet as
  the primary rail (it hides the detected state, half the point). Follow `FilterRail`'s `layout="panel"`
  mechanics if a sheet is ever needed for Wave-2 axis overflow.

### 6.5 Reuse vs new

- **Reuse:** `useSlidingPill` (verbatim), `Card`/`CardContent`/`Button`(`variant="gradient"`)/`Badge`/
  `HubHero`/`AuthDialog`/`SpeakButton`/`EnPeek`, `resumeDraft.ts` (extend), `WritingHistory` (unchanged),
  and FilterRail's **classNames/layout recipe** copied into `GrammarRail`.
- **New:** `GrammarRail`/`GrammarPill` (tri-state; FilterRail pills are binary+count-driven),
  `FokusTrainer`/`FokusInputCard`/`FokusTransformCard`/`CorrectionView`, `useFokusMachine`,
  `grammarDimensions.ts`, `aiCorrection.ts`, the two Edge Functions.
- **Do NOT reuse:** `FilterRail` component, `FacetSheet`/`FacetDef`, `BrowseToolbar` (list-filter
  abstractions irrelevant here).

### 6.6 Diff rendering

Corrected line shows changed tokens on soft washes (insertion `bg-success/12`, correction `bg-warning/12`),
NOT a scary inline redline (too noisy for B1). Tap a highlighted token → one-line German micro-explanation
(*den Kunden: Akkusativ nach an*). If nothing was wrong: collapse to one green line "Alles korrekt. Wähle
rechts eine Umformung." (green `--success`, NOT Koralle — reward tokens stay for streaks/loot).
**Dark-mode risk:** the 12% washes may fail contrast; fallback to underline/left-border accents, gate via
`check-contrast.mjs`.

### 6.7 Kurz / Lang

Keep today's theme-prompt + single-most-important-tip + "üben" deep-link (the app's signature, cheap). ADD
an **opt-in** collapsible "Korrigierte Fassung anzeigen" paragraph-level correction (reuses the Fokus diff
renderer at paragraph scale; opt-in so the cheap single-tip stays the default AI path). **No grammar rail
and no transforms in Kurz/Lang** (transforming a whole letter is meaningless) — the right column is reclaimed
by the prompt/task chooser, so the layout genuinely re-flows.

---

## 7. Phased build order

Each phase ends green on `pnpm typecheck · lint · lint:content · test:unit · build · check:bundle` (writing
stays a lazy chunk; no main-bundle impact). Ship phases as separate PRs into `main`.

- **Phase 0 — Scaffolding + mode router.** Refactor `WritingHub` into the mode router; extract
  `GuidedWritingTrainer`/`ThemePicker` (Kurz/Lang = today's behaviour, verified unchanged); add the
  `WritingModeSwitcher` (Fokus tab shows a "bald" placeholder). No AI change. Ships safely, de-risks the
  refactor. **Model: Sonnet.**
- **Phase 1 — Backend engine (behind a flag).** Migration `0009`; the two Edge Functions with the
  three-tier ladder, global cache, rate limits, structured output, LanguageTool re-check, kill-switch.
  Build the ~50-triple eval harness and pass it. **Model: Opus** (correctness-critical prompts + cost
  guards). Founder deploys functions + runs migration + sets secrets (`PROMPT_VERSION`, limits) per a new
  `docs/plans/PHASE2_SETUP.md` addendum.
- **Phase 2 — Fokus frontend (Wave-1 grid).** `FokusTrainer` + `GrammarRail` (Aktiv/Vorgangspassiv ×
  Präsens/Perfekt/Präteritum) + `useFokusMachine` + `aiCorrection.ts`, wired to Phase-1 with the
  batch-precompute-6-cells path (§4.3). Desktop rail + mobile chip row. Draft-resume + login wall reuse.
  **Model: Opus** (cross-cutting new UI + state machine).
- **Phase 3 — Kurz/Lang correction disclosure + polish.** The opt-in "Korrigierte Fassung" for guided
  modes; micro-explanations + deep-links into the grammar bank; TTS; a11y + contrast pass; `EnPeek` glosses.
  **Model: Sonnet.**
- **Wave 2 (later, separate epic).** Add Zustandspassiv, Konjunktiv II, Sie↔du, Hauptsatz↔Nebensatz;
  switch to lazy-per-toggle + neighbor-warming as the grid grows; CEFR-gate advanced pills behind the
  learner's level.

---

## 8. Decisions for the founder (with panel recommendations)

1. **Default mode on `/writing`** — Fokus (new hero) or Kurz (preserve today)? _Rec: Fokus._
2. **Do transforms cost a daily AI unit?** _Rec: NO. Separate, generous transform budget (§5.3); the
   batch-precompute + global cache make most taps free anyway. A learner who paid one correction must be
   able to explore all axes._
3. **Model for transforms** — Sonnet 5 (correctness) vs strict Haiku parity? _Rec: Sonnet 5, but A/B on the
   eval set; downgrade to Haiku only if it passes the trap suite._
4. **Wave-1 axis scope** — confirm Voice × Tense only for MVP? _Rec: yes._
5. **Zustandspassiv** — separate pill (Wave 2) or fold "Passiv" = Vorgangspassiv only? _Rec: default
   "Passiv" = Vorgangspassiv now; Zustandspassiv as a distinct Wave-2 pill._
6. **Konjunktiv I / indirekte Rede** — deep-link only (rec) or a gated live pill? _Rec: deep-link only._
7. **Does a transform award XP / feed progress?** _Rec: XP-only, no vocab FSRS (consistent with the reading
   block precedent). Optional "n Sätze korrigiert" streak may use Koralle._
8. **Eval-set ownership + acceptance bar** — who signs off the ~50 golden triples before launch?

---

## 9. Top risks

1. **Teaches wrong German.** Mitigation: abstain-by-default + code contract + LanguageTool re-check + the
   eval gate. Non-negotiable before launch.
2. **Detection mislabels the "aktuell" pill** → destroys trust. Mitigation: small unambiguous axis set,
   model returns explicit `{voice,tense}` with the correction (no client-side inference), defer murky
   Konjunktiv/Imperativ detection to Wave 2.
3. **Cost multiplication vs the $5 cap.** Mitigation: global cache + paid-only rate limits + shared $5 fuse
   (max spend unchanged by construction). Watch the cache hit rate from day one; seed the cache with a
   corpus of pre-transformed common sentences at build time if the hit rate is low.
4. **Cache hit rate is the whole game.** If real hit rate <50%, the $5 is spent faster (still capped, but
   the feature "runs out" mid-month). Monitor via the admin tile; expand Tier-1 rules / seed corpus.
5. **Dark-mode diff contrast.** Fallback to underline accents; gate via `check-contrast.mjs`.
6. **Guest abuse economics.** Global fuse + per-user monthly ceiling bound damage to $5; enable the wired
   Turnstile on guest creation if abuse is observed.

---

## 10. One-paragraph summary

Rebuild Schreibtraining as a three-mode surface. **Fokus** is a single-sentence grammar lab: the learner
writes one sentence, `check-sentence` (Haiku, structured output) corrects it in place and detects its
voice/tense, auto-lighting a tri-state grammar rail; tapping a target pill fills a second box with the
sentence transformed along that axis, produced by `transform-sentence` (Sonnet 5) which **abstains rather
than hallucinate** and is served from a **global cross-user cache** so repeated toggles are free. **Kurz/Lang**
keep today's guided-task + single-tip flow with an opt-in paragraph correction, no rail. The MVP ships the
Aktiv/Vorgangspassiv × Präsens/Perfekt/Präteritum grid (batch-precomputed in one call); Wave 2 adds
Konjunktiv II, register, and clause-order, switching to lazy+cache as the grid grows. The whole feature is
metered into the existing **$5/month** fuse, so it multiplies calls but not maximum spend.
