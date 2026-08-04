# Ukrainian and Arabic as learner support languages

**Status: PLANNED, not started.** Written in session 184 from a founder request. Nothing in this
plan has shipped; no code, data or migration exists yet.

**Trigger:** founder, s184: first "how difficult is it to add other translations (user language)
to the app other than english?", then "i want Ukrainian and arabic to be other alternative
languages to English in the app".

**Founder decisions taken before this plan was written** (asked and answered in the same session,
so treat them as settled, not as options): full swap including graded exercises · LLM draft plus a
native-speaker review pass · Arabic RTL handled inline only, the German UI stays LTR · public
pages limited to the landing page and `/welcome`.

Extends `docs/areas/CONTENT.md`. Related law: `docs/DECISIONS.md` §s93 (EnPeek, never sticky),
§s74 (translation is a rationed game resource), `docs/strategy/DATA_GOVERNANCE.md:117-121`
(AI drafting is a first step only).

---

## Context

Genauly teaches German. Its interface is deliberately German (immersion), and **English is not
the UI language, it is the support layer**: the gloss under a word, the hold-to-peek explanation,
the right column of a matching grid, the AI feedback paragraph. Today that support layer has
exactly one language, spelled inline in the content banks as `en:` / `gloss:` / `titleEn:` and
read at 116 call sites.

The founder wants **Ukrainian and Arabic as alternatives to English**, chosen by the learner.
That reaches further than it looks, because these strings are not decoration: `engine/quiz.ts`
uses the gloss as the **correct answer** in translation MCQs (`quiz.ts:196-200`), as the graded
right column of the matching grid (`quiz.ts:423`, graded at `QuestionViews.tsx:333`), and as the
prompt a learner translates from in typing and speaking blocks (`session.ts:171,521`). A support
language is therefore an assessment surface, and a half-finished one is a wrong-answer bug, not a
cosmetic gap.

Four founder decisions frame the work:

1. **Full swap, graded.** A learner on Arabic matches German↔Arabic and answers Arabic MCQs.
2. **LLM draft + native-speaker review**, through a clickable admin queue.
3. **Arabic RTL is inline only.** The German UI stays left-to-right; no app-wide flip.
4. **Public pages:** landing and `/welcome` get UK/AR. Help and legal stay DE/EN.

Intended outcome: a learner picks a support language once, and every gloss, hint, prompt,
generated exercise and AI tip speaks it, falling back cleanly to English wherever a translation
has not been reviewed yet.

**Scale:** ~8,637 strings per language, ≈55,600 words. vocabulary 5,229 · collocations 2,144 ·
redemittel 440 · grammar 291 · missions 286 · dialogues 148 · canDo 57 · texts 42 titles + 42
multi-paragraph bodies.

---

## Architecture

### 1. Sidecar maps for UK/AR; English stays inline

`en` **stays exactly where it is**, inline in the banks. Ukrainian and Arabic ship as separate
generated-style maps, following the `src/data/frequency.ts` / `verbForms.ts` idiom:

```
src/data/gloss.uk.ts   export const glossUk: Record<GlossKey, GlossEntry> = { … }
src/data/gloss.ar.ts
```

This is the load-bearing decision. Widening items to `{de, en, uk, ar}` would:

- break every `review_status: "verified"` fingerprint, because `contentHash()`
  (`src/lib/contentHash.ts:37`) hashes the **whole item**, and `lintVerifiedFingerprints()`
  (`lint-content.mjs:1265-1291`) then errors "content changed AFTER human verification";
- roughly double the shipped bytes of vocabulary (941 kB), collocations (377 kB) and texts
  (147 kB) **for every learner**, whichever language they picked, against a 400 kB main-chunk
  budget (`scripts/check-bundle-size.mjs:16`) and a hard 2 MiB-per-asset workbox ceiling
  (`vite.config.ts:41-53`) the provenance chunk is already near;
- force a decision about provenance rows for ~17,000 new strings.

Sidecars avoid all four. Keeping `en` inline avoids a second problem: English is the fallback, and
it stays under the linter rules that already guard it (`lint-content.mjs:241,268,576,692,715`),
with zero edits to 3,432 provenance rows.

### 2. The gloss key

```ts
type GlossKey = `${string}#${string}`   // "<content_id>#<path within the item>"
```

Examples: `v_besprechung#en` · `v_besprechung#examples.0.en` · `k_termin_vereinbaren#example.en` ·
`gd_konnektoren_1#gloss` · `tx_behoerde_anmeldung#titleEn` · `m_behoerde_1#brief` ·
`g_konnektoren#pitfalls.2`.

The path is **both the key suffix and the instruction for reading English off the live item**, so
one resolver serves both languages: walk the path for `en`, look up the map for `uk`/`ar`. The
`content_id` half reuses `buildContentIndex()` (`src/lib/contentHash.ts:76-96`), which already
maps every id to its item and is already mirrored in `scripts/content-hash.mjs`.

**The hard part is array-index drift**: inserting an example at index 0 silently reassigns every
`examples.N.en` key. Solved the same way the review loop already solves it, with a source
fingerprint:

```ts
interface GlossEntry {
  t: string;        // the translation
  src: string;      // 8-hex sha256 of the German+English source AS TRANSLATED
  by: "ai" | "human";
  at: string;       // ISO date of the approving review
}
```

`pnpm lint:gloss` walks the banks, recomputes every key and source hash, and classifies:

| Verdict | Meaning | Severity |
|---|---|---|
| `missing` | key in banks, no sidecar entry | info (counted, not fatal) |
| `orphan` | sidecar entry, key gone from banks | **error** — item retired or moved |
| `stale` | key in both, `src` differs | **error** — source changed after translation |
| `ok` | matched | — |

Index drift therefore surfaces as a loud `stale`/`orphan` pair, never as a silent mistranslation.
This mirrors the `content_hash` law in `src/lib/provenanceReviews.ts:7-15` (a null or mismatched
hash is treated as "needs re-review", never as a pass) — extend, don't invent.

Content ids are permanent (`src/lib/idRenames.ts`), so keys are stable by construction; the rare
unavoidable rename runs through `ID_RENAMES` and the gloss loader resolves it with the existing
`resolveContentId()`.

### 3. The accessor, and the graded/hint firewall

New `src/lib/gloss.ts`. The critical design constraint: a `glossLang` that silently changes what
`item.en` returns would change what `translationQ` grades against **with no compile error
anywhere**. So the two uses get two different functions:

```ts
export type GlossLang = "en" | "uk" | "ar";

/** Display support: hints, reveals, explanations, card backs.
 *  Falls back per-item: uk → en. Always returns a string. */
export function glossText(key: GlossKey, lang: GlossLang): string;

/** Answer keys and distractors. Resolves a WHOLE POOL at once and returns the
 *  language it actually resolved to, so a question is never mixed-language. */
export function assessmentPool(
  keys: GlossKey[], lang: GlossLang,
): { lang: GlossLang; glosses: string[] };
```

**The fallback is per-question, never per-item.** If any member of the pool lacks a reviewed
translation, `assessmentPool` returns the whole pool in English. An English distractor sitting
among Ukrainian options is a free giveaway, and it is exactly what a naive per-item fallback
produces. Call sites that change: `quiz.ts` `translationQ`:189-204, `matchingQ`:409-425,
`distinctPairs`:445-458 (the dedupe key becomes the active language's gloss, not `v.en`), and the
second, independent MCQ in `VocabQuiz.tsx` (distractors :28, choices :29, correctness check
:86).

**A translation is only graded once reviewed.** `assessmentPool` ignores draft entries. Whether
learners see drafts at all is a founder switch through the existing remote `app_config`
(`src/lib/appConfig.ts`, whose contract is "empty config == today's behavior byte-for-byte"),
defaulting **off**. That satisfies `docs/strategy/DATA_GOVERNANCE.md:117-121` — AI drafting is a
first step only, verified or discarded — and removes the EU AI Act Art. 50 marking question from
the default path entirely.

Two existing invariants must survive the refactor:
- `quiz.ts:556-559` — `listeningClozeQ` deliberately has **no** hint, because a gloss reveals the
  heard word. Language-independent; keep it.
- `docs/DECISIONS.md:186-189` — in missions, translation is a **rationed bag resource**
  (`useDictionary`, `DICT_USES_DEFAULT = 3`), not an always-on button. The accessor inherits that
  gate; `GameText({de, en, translate})` (`welt/stage.tsx:321-335`) becomes
  `GameText({de, gloss, translate})` and the copy stops saying "English".

### 4. Lazy loading and chunking

Add to `vite.config.ts` `manualChunks` (before the `node_modules` branches, ~:104):

```js
const m = /src\/data\/gloss\.(uk|ar)\.ts$/.exec(id);
if (m) return `gloss-${m[1]}`;
```

`lib/gloss.ts` loads the active map with a dynamic `import()` and holds it in a module-level
registry. Before it lands, `glossText` returns English and `assessmentPool` resolves to English —
the same fallback path, so there is no loading state to design and no flash of empty glosses.
The Dashboard invariant holds because `lib/gloss.ts` imports no bank (it takes the item as an
argument) and the sidecars are `import()`-only.

**Search index invalidation:** `src/lib/search.ts` memoizes `INDEX` at module level
(`INDEX ??= buildIndex()`, :104) and indexes `.en` as both a haystack token and the result
subtitle (:52,55,60,63,68,71). Export a `resetSearchIndex()` and call it when `glossLang`
changes. `normalise()` (:27-29) folds only German umlauts; add per-language folding — Arabic
tashkeel stripping and alef/ya normalisation, Ukrainian apostrophe forms — or the search box
silently fails on typed Arabic.

### 5. Linter and gates

Anchored on `en`, unchanged: `checkExample()`:138-142, the required-field lists, and the
headword-homonym warning at :362-390 (its `sameGloss` test is a *meaning proxy*; OR-ing it across
languages would make a coarse Arabic gloss error on legitimate German homonyms).

Becomes per-language: the **gloss-collision-within-theme** rule at :392-408. It exists because a
theme is one quiz pool, and it must hold for whichever language the pool renders in. Ukrainian
and Arabic will each have their own, different collision sets.

`checkBiText()`:774-776 hard-codes the `{de,en}` pair across ~20 mission call sites — **one
signature change covers all twenty.**

New `scripts/lint-gloss.mjs` (wired into `pnpm lint:content` so CI picks it up with no workflow
edit): the `missing`/`orphan`/`stale` classification above, non-empty values, and the
per-language collision pass. Sidecars register through the **optional `.catch()` load tier**
at :1427-1433 and a dangling-key loop modelled on :1526-1531 — the cheapest of the three
hardcoded registration lists.

It should also enforce **paragraph parity** on the `tx_*#en` reading-text bodies: `ReadingBlock`
renders German and translation side by side after a blank-line split, so the counts must match.
`docs/areas/CONTENT.md:131-132` states this as a contract but nothing checks it today — the new
script closes that gap for English at the same time as it opens it for UK/AR.

Two exemptions, both real:
- **Em dash.** `scanEmDash()`:157-166 recurses every string in every bank and errors on `—`.
  Ukrainian typography uses тире heavily and correctly. Exempt the sidecars wholesale, the way
  `provenance` already is at :1583-1584. The house no-em-dash rule is about *our* German and
  English copy, not about correct Ukrainian punctuation.
- **Digits.** `lintTypographicDigits()`:418-440 targets subscript/superscript digits for
  typed-answer normalisation. Arabic-Indic digits (٠-٩) are ordinary in Arabic. Exempt the
  sidecars rather than extending the regex.

New scripts: `pnpm lint:gloss` · `pnpm build:gloss-keys` · `pnpm draft:gloss` ·
`pnpm apply:gloss-reviews`.

### 6. AI feedback layer

`evaluate-writing` currently asks for `insightEn` in one prompt line (:235-236) and stores it in
its own column (`0014_writing_insight_en.sql`). Three more columns is the wrong shape, because the
step-down ladders at :639-671 and :747-761 exist precisely so a function deploy can outrun a
migration — each column adds a tier to both.

**Migration 0015:** `add column if not exists insights jsonb` on `writing_evaluations`, and the
same for `sentence_transforms.notes`. `insight_en` stays for back-compat and keeps its ladder
tier; new writes populate both.

The function asks for **one** localized insight, in the learner's language, not all three: the
client sends `glossLang`, the prompt asks for `insightLoc` in that language, and the cache key
folds the language in. Cheaper, and it avoids paying for Arabic prose nobody reads.

Required bumps: `PROMPT_REV` (`evaluate-writing:115`) and `PROMPT_VERSION`
(`transform-sentence:79`) — a prompt-wording change is a cache invalidation, or the old prose is
served from the hash cache forever (`docs/DECISIONS.md` s179). The hand-written `TEMPLATED`
DE+EN literal pair at :174-185 needs UK/AR siblings, authored through the same review flow.
`check-sentence` is monolingual and needs no work.

`FeedbackLangChip` (`FeedbackLang.tsx:19-46`) stays a **two-state sticky toggle** — that is the
deliberate s93 exception (`docs/DECISIONS.md:953-957`) and must not be merged with `EnPeek`. It
simply learns which second language it holds: `{showLocal, lang, onChange}`, label `"UK"`/`"AR"`/
`"EN"`. Four call sites: `GuidedWritingTrainer.tsx:788`, `WritingHistory.tsx:510`,
`FokusTrainer.tsx:448,616`.

### 7. Arabic script: fonts and inline RTL

**Font.** Inter (`tailwind.config.ts:76-87`, via `main.tsx:19`) has **no Arabic glyphs**; Arabic
falls through to `system-ui` and may render as nothing on a bare Linux box. Add
`@fontsource-variable/noto-sans-arabic` (SIL OFL), imported **dynamically** only when
`glossLang === "ar"`, and appended to the `sans` stack after Inter so Latin still renders in
Inter. Self-hosted, so CSP `font-src 'self'` (`index.html:18`) is satisfied; fonts are separate
assets, so the 400 kB JS gate is untouched. Verify Inter's Cyrillic subset after `pnpm install`
(`grep unicode-range node_modules/@fontsource-variable/inter/index.css`) and add a Cyrillic face
the same way only if it is absent.

**Inline RTL.** `dir="auto"` on the *leaf that carries the translated text*, never on a container:

- `src/features/shared/Gloss.tsx:29-44` — one `dir` on the button covers all six call sites
  (`SessionPlayer.tsx:860,1017,1116`, `ReadingBlock.tsx:119`, `MissionPlayer.tsx:437,440`).
- The four AI-feedback paragraphs (`GuidedWritingTrainer.tsx:785-793`,
  `WritingHistory.tsx:507-516`, `FokusTrainer.tsx:443-450,611-618`) put a German label and the
  chip **inline in the same `<p>`** as the prose. Wrap the prose in its own `<span dir="auto">`;
  putting `dir` on the paragraph would flip the label and the chip too.
- `GrammarTopicView.tsx:167,212` swap whole `<li>` lists with leading icons at
  `flex items-start gap-2.5` — the only multi-item RTL surface; the icon needs `order` handling
  or per-item wrapping.
- `QuestionViews.tsx:363,385` — `text-left` → `text-start` on the two matching columns
  (`text-left` does not follow `dir`); `dir="auto"` on the right column's buttons.
- `SessionPlayer.tsx:822,986,990` prompts; `:663-664` adds `dir="auto"` so `truncate` puts the
  ellipsis on the logical side.
- Replace the hardcoded `→` at `QuestionViews.tsx:371` and `VocabQuiz.tsx:193` with the
  direction-neutral `·` already used elsewhere in the house style.
- Set `document.documentElement.lang = "de"`, fixing the stale `<html lang="en">` at
  `index.html:2` (the UI has been German for a long time).

Out of scope and needing nothing: the canvas/SVG text surfaces (`WordGraph.tsx:191`,
`CollocationGraph.tsx:233`, `doodles/art.tsx`, `UebenPath.tsx:344`, recharts in `Analytics.tsx`)
all render German source words only. There is **no pixel font** — the game's look is outlines and
bitmap sprites, all text is Inter — so the game needs no font work.

A full RTL flip is explicitly not being done: the codebase has 46 `ml-`, 28 `pl-`, 40 `text-left`,
81 `left-`/`right-` across 75 files and **zero** logical properties to build on.

### 8. Settings, onboarding, the picker

`glossLang: GlossLang` in `useSettingsStore` (default `"en"`). It rides `profiles.settings` jsonb
for free — `mergeRemoteSettings` spreads the whole blob (`cloudSync.ts:185-193`) and
`SettingsSnapshot` is structural (:94) — so keep it out of the promoted columns in `profileRow`.
No persist `version` bump is needed: zustand's shallow merge gives an absent key its default.

- **Settings:** a "Hilfssprache" card, three-button row mirroring `themeModes`
  (`Settings.tsx:24-28`).
- **Onboarding:** a fourth block in `Onboarding.tsx` (goal · level · **language** · consent).
- **Landing / `/welcome`:** a language switch that carries the choice into sign-up.

**All three are UI work, so `/design` must be loaded first** and founder-reviewable
`preview/*.html` mockups produced before implementation, per CLAUDE.md (70 precedents in
`preview/`).

### 9. Translation production and review

`scripts/draft-gloss.mjs` batches strings to an LLM with the context that makes glosses correct
rather than merely plausible: the German source, the existing English, the theme, the part of
speech, and **the sibling glosses already used in that theme** so the model is told what it must
not collide with. Output lands in a `gloss_reviews` table (migration 0015), never straight into
the sidecar.

Review reuses the existing workbench wholesale: a `gloss_reviews` table shaped like
`provenance_reviews` (`src/lib/provenanceReviews.ts`) — decision, comment, reviewer email, and a
`content_hash` of the source **as the reviewer saw it** — plus an "Übersetzungen" tab in
`/admin/pruefen` built on `Pruefmodus.tsx`'s keyboard-driven accept/reject and facet filters.
`pnpm apply:gloss-reviews` recomputes the hash from the repo and refuses to promote on mismatch,
exactly like `apply:reviews`. Approved strings are written into `src/data/gloss.<lang>.ts` with
`by: "human"` and the approval date.

RLS mirrors `provenance_reviews`: non-founder sessions get no rows and cannot write. Access is
already table-based rather than email-based since `0013_admins_table.sql` (the security audit
moved `is_founder()` onto `auth.uid()` against a service-role-only `admins` table), so a native
reviewer is one inserted row. **Recommendation:** give `gloss_reviews` its own `reviewers` table
with a `lang` column rather than reusing `admins`, so a Ukrainian reviewer cannot read learner
aggregates or flip provenance rows. That is a few lines of RLS in the same migration and it keeps
the admin boundary where the audit put it.

---

## Waves

Each wave is one PR into `main`, independently shippable, and green on
`pnpm lint:content && pnpm lint && pnpm test:unit && pnpm build && pnpm check:bundle`.
Start with `pnpm install` — `node_modules` is absent in this checkout.

| # | Wave | Delivers | Learner-visible? |
|---|---|---|---|
| 1 | **Key scheme + accessor** | `GlossKey`, `src/lib/gloss.ts`, `scripts/build-gloss-keys.mjs`, `lint:gloss`, empty `gloss.uk/ar.ts`, tests | No — byte-identical behavior |
| 2 | **Read-path refactor** | 116 `.en` reads → accessor; `Gloss`/`EnPeek`/`GameText` language-aware; `assessmentPool` firewall; search invalidation | No — English-only in practice, 496 tests stay green |
| 3 | **Language plumbing** | `glossLang` setting, Settings card, onboarding block, lazy chunks, Arabic font, inline RTL, `dir`/arrow/`text-start` fixes | Yes — UK/AR selectable, everything falls back to English. **Preview round first.** |
| 4 | **Translation pipeline** | `draft:gloss`, migration 0015 (`gloss_reviews`), Übersetzungen tab, `apply:gloss-reviews` | No |
| 5 | **AI feedback** | Migration 0016 jsonb `insights`/`notes`, prompt + `PROMPT_REV`/`PROMPT_VERSION` bumps, `TEMPLATED` UK/AR, N-language chip | Yes |
| 6 | **Content, bank by bank** | vocabulary → collocations → redemittel → grammar/dialogues → missions → texts/canDo. Each bank flips to graded once reviewed | Yes, incrementally |
| 7 | **Public pages** | Landing + `/welcome` in UK/AR | Yes |

Waves 1-5 are engineering and land before the bulk content. Wave 6 is the long pole and is paced
by review throughput, not by code.

---

## Verification

**Per wave:** `pnpm install` once, then
`pnpm lint:content && pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build && pnpm check:bundle`.
`pnpm check:contrast` only if `src/index.css` tokens change (they should not).

**New tests to add:**

- **Gloss completeness + integrity** — no `orphan`, no `stale` for any shipped language; counts
  reported per bank. There is no gloss-completeness test today; this is the one that keeps the
  content honest.
- **Pool homogeneity (the important one)** — build an MCQ and a matching question from a
  deliberately half-translated fixture bank and assert the options are all one language. This is
  the regression that would otherwise ship a free giveaway.
- **Per-language collision** — extend `tests/quizOptions.test.ts:87-96` (which today asserts the
  shipped bank has no same-theme English gloss collision) to loop over active languages.
- **Fallback chain** — `glossText` returns English for a missing key; `assessmentPool` returns
  `lang: "en"` when any pool member is missing or unreviewed.
- **Settings round-trip** — `glossLang` survives persist rehydrate and `mergeRemoteSettings`.
- **`tests/contentHash.test.ts` must stay untouched.** If this test needs editing, the sidecar
  architecture has been violated somewhere — treat it as the canary.
- **`tests/feedbackLang.test.tsx`** extended from binary to N-language.

**Manual, and not skippable:**

- Arabic and Ukrainian rendered in the real app at 320px and 390px: glosses, the matching grid,
  the AI feedback card, the flashcard back face. RTL bugs are invisible in unit tests and
  invisible to a founder who does not read Arabic — **a native speaker has to look at screens,
  not just at strings.**
- Verify the Arabic font actually loads (Network tab) and that no glyph boxes appear.
- Confirm switching language mid-session re-renders search results and does not strand a
  half-built question in the previous language.

---

## Risks, ranked

1. **Mixed-language exercise pools.** The single highest-severity failure: an English distractor
   among Ukrainian options tells the learner the answer. Mitigated by the per-question
   `assessmentPool` rule and its dedicated test; do not weaken it to a per-item fallback.
2. **Review throughput is the schedule.** 55,600 words × 2 languages. Engineering finishes long
   before content does. Wave 6 should be planned as a recurring content commitment.
3. **Key drift on array-indexed paths.** Mitigated by source hashes and the `stale`/`orphan`
   lint, but it needs the generator run after *every* content edit — same discipline as
   `build:frequency`, and it belongs in `.claude/skills/content/SKILL.md`.
4. **RTL defects nobody in the loop can see.** Needs a named Arabic reviewer with access to a
   deploy preview, not just to the string queue.
5. **Bundle and workbox ceilings.** Sidecars keep glosses out of the main chunk, but wave 6 grows
   two new chunks toward the 2 MiB per-asset workbox hard-fail. Watch `check:bundle` each content
   wave; the `globIgnores` escape hatch at `vite.config.ts:53` is the precedent if needed.
6. **Ukrainian em dash and Arabic-Indic digits** tripping linter rules written for German and
   English. Trivial once known, noisy if not.
7. **Search on non-Latin scripts.** `normalise()` folds German umlauts only; without per-language
   folding, typed Arabic quietly fails to match.

**One cleanup to decide on the way past:** `src/features/redemittel/RedemittelPractice.tsx` reads
`task.phrase.en` as a graded prompt (:158, :212, :281) but is **imported nowhere** — dead code
that looks live. Either delete it or bring it into the refactor; leaving it half-migrated is how
it comes back to life broken.

---

## Documentation to update (required, per CLAUDE.md)

`docs/areas/CONTENT.md` is the heavy one: bank field lists, the paragraph-parity invariant
(:131-132), the collision rule (:181-185), the linter checklist (:193-210). Then
`docs/areas/COMMANDS.md` (the four new scripts), `docs/areas/BIBLIOTHEK.md` (:50-55 the hardcoded
"Englisch" eyebrow on the word-card back; :204-207 the German-first hold-to-peek law),
`docs/areas/SCHREIBEN.md:352-366` (the EnPeek-vs-FeedbackLang split), `docs/areas/GAME.md:63-65`
(translation as a rationed bag resource, no longer "English"), `CLAUDE.md:160`, and
`.claude/skills/content/SKILL.md` — that last one matters most operationally, because it is what
loads before anyone touches `src/data/*`, and it needs the new law: **a gloss language is a keyed
sidecar, never a required item field**, plus `build:gloss-keys` in the gate order.
Per the standing rule, `docs/PROJECT_STATUS.md` and `docs/SESSION_PROMPT_LOG.md` get an entry
each wave.
