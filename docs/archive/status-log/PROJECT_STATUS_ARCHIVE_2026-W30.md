# Project Status Archive — 2026-W30

Append-only session-handoff history for ISO week 2026-W30 (chunked per the s70 doc-hygiene
rule; index at `docs/archive/PROJECT_STATUS_ARCHIVE.md`). Newest at the top.

**Handoff after session 151 (2026-07-23). Fokus "Satzlabor" grammar-bug fix + AI provider cascade
rework, branch `claude/ai-response-bug-xfsth9`.** Founder flagged (screenshots) that the Satzlabor gave
wrong, self-contradictory German feedback.
- **Bug.** For "Ich bin krank wegen Kälte und Husten" (a plain Aktiv copula, sein + adjective) the
  panel marked **Passiv** as the detected form, then refused Perfekt/Präteritum with "Der Satz steht
  schon in dieser Form" (Präsens treated as already past) and refused a passive it simultaneously
  claimed the sentence already was. Root cause: the cheap Haiku detector misread "sein + Adjektiv" as
  a Zustandspassiv, which `normalizeDetected` then collapsed onto the Vorgangspassiv pill.
- **Fix (server prompts).** `check-sentence`: explicit rule that sein/werden/bleiben + adjective/adverb
  is always Aktiv, only + Partizip II of a transitive verb is passive; worked examples; strict
  JSON-only. `transform-sentence`: `bereits_zielform` only when BOTH voice AND tense already match (a
  tense change is a real transform); same copula rule. `evaluate-writing`: JSON-only hardening.
- **Fix (client).** `grammarDimensions.ts` `normalizeDetected` no longer maps a detected
  `passiv_zustand` onto the Passiv pill; it returns null (no marker), so a misdetected copula can never
  surface a wrong Passiv dot. `tests/fokusGrammar.test.ts` updated to lock this in.
- **Provider cascade (all 3 AI functions).** Founder wanted Gemini primary everywhere + a combined
  budget. `check-sentence`/`transform-sentence`/`evaluate-writing` each now run **Gemini 2.5 Flash
  (free, recorded $0) → Claude Sonnet 5 → GPT-5**: Sonnet leads the paid backup until month-to-date
  Claude spend across **both** `sentence_ai_ops` + `writing_evaluations` reaches `CLAUDE_BUDGET_USD`
  ($2), then GPT-5 leads. The existing global `MONTHLY_SPEND_CAP_USD` ($5, shared via `ai_usage`)
  bounds all three combined. Anthropic calls drop `temperature` + disable thinking (Sonnet 5 family);
  Gemini forces JSON output + a generous token budget; GPT-5 uses `max_completion_tokens` +
  `reasoning_effort: minimal`. Every model id + the $2 threshold are env-overridable (`GEMINI_MODEL`,
  `CHECK_MODEL`/`TRANSFORM_MODEL`/`EVAL_MODEL`, `OPENAI_MODEL`, `CLAUDE_BUDGET_USD`). Caches
  invalidated so stale wrong answers are not re-served (check-sentence `CHECK_VERSION` salt,
  transform-sentence `PROMPT_VERSION` bump).
- **Transparency.** The two EU AI Act Art. 50 disclaimers (Satzlabor + writing coach) and the privacy
  policy (DE + EN) now name all three providers routing-neutrally. Judged non-material (processors +
  purpose unchanged, all already disclosed): `CONSENT_VERSION` NOT bumped, so no forced re-consent.
- **Fokus disclaimer consolidation (follow-up, same session).** The Fokus view's two AI notes (the
  send-to-AI line + the "KI-generierte Umformung" footer inside the transform box) were merged into
  ONE harmonized, centered note ("Dein Satz wird von einer KI … geprüft und umgeformt") in normal
  flow under the content. (A first pass pinned it to the bottom via `min-h` + `mt-auto` to line up
  with the "Mit KI gebaut · Feedback" pill; the founder found that detached band ugly, so it was
  reverted to a plain centered note.)
- **Mobile Grammatik button fix (follow-up).** On mobile the Grammatik toggle was `disabled` until a
  correction existed, so tapping it pre-correction did nothing and it read as broken. Removed the
  `disabled`: it now always opens the panel, which shows the GrammarRail's "Prüf zuerst deinen Satz …"
  hint (disabled pills) before a correction, matching the always-visible desktop rail. The session's
  disclaimer changes were already shared (`aiNote`/`bottomBox` render in both the mobile and desktop
  blocks), so no separate mobile adaptation was needed. **Founder confirmed the mobile fix works live.**
- **Founder ops (done):** deployed all three functions, set `GEMINI_API_KEY` (primary) + provider keys.
- **Gates:** typecheck ✓ · test:unit **260/260** · build ✓. Edge functions are Deno (no local
  `deno check`/keys in the sandbox); every path is fail-safe (any provider → null → fall through →
  `{ ok: false }`). Watch the function logs on the first Gemini-primary calls.
- **Caveat carried forward:** Gemini Flash primary is the same cheap tier that caused the original bug;
  the hardened prompt carries it and Sonnet backstops, but if wrong grammar reappears, flip the primary
  back via `GEMINI_MODEL` (one env var, no code change).

**Handoff after session 150 (2026-07-23). Fokus correction-card redesign + Umlaut keys, branch
`claude/diagonal-gradient-invert-odi99r`, PRs #653 + #654 merged.** Founder started from "invert the
background gradient diagonally" (PR #653: `tailwind.config.ts` `mesh`/`page` accent radial moved
top-right → bottom-left, linear angle 150°→120°), then pivoted to redesigning the Fokus corrected-state
card as "too noisy and redundant" and iterated across ~8 preview rounds before approving a combined
design and asking to implement + ship.
- **Design-review artifact.** A single consolidated gallery (`preview/schreiben-design-review.html`,
  published as a claude.ai artifact) with a version switcher (Final + Alle + every prior variant), an
  app light/dark toggle, and live interactions. All step previews are committed under `preview/`
  (`fokus-correction-redesign`, `-ac`, `-v4-himmel`, `-toggle`, `fokus-umlaut-keys`, `schreiben-design-review`).
- **Correction card (`FokusTrainer.tsx`).** Removed the struck-through original, the "· n Änderungen"
  counter, the in-place `<mark>` highlight, and the "Was ich geändert habe" list. New: eyebrow "Dein
  Satz" shares its row with an **Original/Korrigiert segmented toggle** (default Korrigiert; resets to
  Korrigiert on each new correction via a `view` state + effect on `m.corrected`). Original view marks
  the wrong words with `.fx-mark-coral` (`--reward`), Korrigiert marks the fixes with `.fx-mark-green`
  (`--success`) — both are calm underlines (`index.css` `@layer utilities`). Below: **Himmelblau fix
  tiles** (`bg-accent/30 border-accent/70` light, `dark:bg-accent/[0.18] dark:border-accent/[0.45]`),
  each = category eyebrow (`text-accent-ink`) + `old → new`. **Neuer Satz** is an outline button on the
  tiles row, `ml-auto self-end` (right + bottom aligned, wraps only if needed); removed from the mobile
  toolbar and the desktop `GrammarRail` (`onNewSentence` no longer passed) so it appears once.
- **Umlaut keys (`src/features/writing/UmlautKeys.tsx`).** Reusable bar, keys ä ö ü ß Ä Ö Ü at ~24px
  (h-6, min-w 1.6rem), neutral `bg-surface` at rest, Himmelblau on press; inserts at the caret
  (`onMouseDown` preventDefault keeps focus, `requestAnimationFrame` restores selection). Wired into the
  Fokus input footer (shares the desktop row with Korrigieren; mobile keeps the sticky Korrigieren bar)
  and the Kurz/Lang guided editor (`GuidedWritingTrainer.tsx`, in the word-count row).
- **Diff engine (`wordDiff.ts`).** `diffWords` now also returns `originalTokens` (flagged, so the
  Original view marks errors reliably) and a per-change `category` from the new exported
  `classifyChange` (umlaut fold + case/punct normalization + multi-word = Grammatik heuristic).
  Categories are heuristic — tune if a pattern mis-buckets. `tests/wordDiff.test.ts` extended.
- **Ops note.** The remote git proxy needs a credential helper (`username=local_proxy`, empty password)
  for `git push`/`fetch`; without it, pushes fall back to unauthenticated api.anthropic.com and fail.
  Set `git config credential.helper '!f() { echo username=local_proxy; echo password=; }; f'`.
- **Gates:** `pnpm build` ✓ · `pnpm lint` **0 errors** (pre-existing warnings only) · `pnpm test:unit`
  **262/262** · `check:bundle` unaffected (writing stays lazy). Sandbox can't reach the live site;
  founder confirms after the Pages deploy.
- **Open:** the s147 founder redeploy action below still stands; error categories are heuristic and can
  be refined once seen live.

**Handoff after session 149 (2026-07-23). Schreiben restyled as a Bibliothek extension, branch
`claude/schreiben-design-refinement-bw8rhh`.** Founder: "make the schreiben section look like it's an
extension of bibliothek". Two preview rounds (`preview/schreiben-bibliothek-extension.html` = variants
A/B, `-r2.html` = variant A + the founder's 7 changes), then implemented on founder go-ahead.
- **Chrome:** `WritingModeSwitcher` is now the full-width LibrarySwitcher-geometry page header with
  FOUR segments (Fokus · Kurz · Lang · Verlauf); the eyebrow/H1 and the separate Verlauf toggle are
  gone (`WritingHub` routes `?mode=verlauf`). Header sits at content-column width over the
  `[minmax(0,1fr)_16rem]` grid (was 18rem).
- **Guided (Kurz/Lang):** Aufgabe card has no icon tile; eyebrow "Aufgabe: <Thema>", one "Ziel n–m
  Wörter" line, a dice button that re-rolls a random task. **`writingPrompts.ts` restructured into
  pools** (`short`/`long` are `string[]`, 5 each × 20 themes = 200 prompts; wave 1 of the founder's
  15-20 target; the pool rides the theme's single `wp_<themeId>` provenance row, mission-style).
  Theme pick draws a random prompt; drafts carry `promptIndex` so OAuth resume restores the exact
  task. `WritingRail` = the "Aufgabe wählen" FilterRail tile (brand header + Target icon, Domain-
  grouped white pills, selected solid primary; the founder asked for "the same categorization as
  Bibliothek": prompts are keyed per THEME, so the rail mirrors the Thema dropdown's domain grouping;
  Branche/Unterthema don't exist on prompts). Mobile: toolbar button + collapsible panel (chips
  removed) + sticky bottom Auswerten bar; desktop actions stay in the editor card.
- **Fokus:** `GrammarRail` restyled to the same tile; detected = white pill + green `bg-success`
  dot, target = solid primary, pre-correction everything idle; no count/reset, footer = "Neuer
  Satz" only. Mobile pairs the Grammatik panel button with Neuer Satz in one row. `WritingHistory`
  shows only the learner's text now (the exact prompt behind an old entry is not recoverable);
  `RelatedPanel` links `/writing?mode=kurz&theme=…` with `wp.short[0]`.
- **Round 3 (same session, 13 founder fixes):** the Thema selection is a Bibliothek-style
  **dropdown** (grouped listbox popover, internal scroll), NOT pills; **gesundheit folds into
  Alltag** in its grouping (founder rule); the "Aufgabe wählen" tile is a light **Himmelblau**
  `bg-accent/20` wash with a header reset icon; the header switcher is capped `lg:max-w-xl` +
  centered (measured pixel-identical to Bibliothek's 816×44 before, but four short labels at full
  width read oversized); the Ziel range shows only on the Aufgabe card; the AI disclaimer is a
  standalone line below the editor/sentence card; the Aufgabe eyebrow is brand-colored; the Fokus
  transform box is a white card with a bold "Hinweis:" label (no i icon) and a centered
  "KI-generierte Umformung" footer; the Grammatik rail got a reset icon and a two-line hint. The
  mobile Aufgabe panel animates via fade/slide because a height collapse would clip the dropdown.
- **Harmonization round (same session, founder-approved P0+P1 list):** the Aufgabe-wählen rail
  now carries the FULL Bibliothek scope hierarchy **Branche → Thema → Unterthema** as grouped
  dropdowns (live counts, zero-yield greyed). `writingPrompts.ts` moved to task objects
  `{ text, sub?, sectors? }`: all tasks tagged, ~86 new sub-theme tasks authored (every sub-theme
  ≥2 short + ≥2 long) plus a 5-Branche starter wave (it/care/construction/transport/hospitality,
  6 each, untagged = universal so a Branche never empties a pool). Bank: **316 tasks**. P1: Fokus
  Grammatik rail Himmelblau like the Aufgabe rail (+ dark-mode alphas for both), Verlauf constrained
  to the content grid + empty-state CTA, unified eyebrow rule (card titles bold primary), 40px
  spinning dice, duplicate Fokus hint removed, Fokus mobile sticky Korrigieren bar.
- **P2 round (same session, founder go + reset-bug report):** the Aufgabe-wählen **reset is now
  always active** and does a full reset (clears every scope AND draws a fresh random task; it used
  to be disabled at the default state, which read as broken). Micro-motion pass: directional tab
  slide (LibraryHub popLayout pattern), 0.12s popover fade, shared 0.18s panel timing. Content:
  every theme now ≥8 short + ≥8 long, and **Branche wave 2 covers all 15 sectors** (4 tasks each
  for the 10 new ones). Bank: **373 tasks**. Remaining content waves: pools toward the founder's
  15-20 per theme/length (append-only authoring).
- **Gates:** typecheck ✓ · lint 0 errors · lint:content ✓ (pool schema validated) · test:unit
  **260/260** · build ✓ · check:bundle **112.3 kB** (writingPrompts stays a lazy chunk) · Playwright
  screenshots of desktop + mobile, both modes (incl. the open dropdown), verified against the
  approved mockups.
- **Open:** grow the pools toward 15-20 prompts per theme/length in content waves (append to the
  arrays in `writingPrompts.ts`, no schema work needed); the s147 founder redeploy action below still
  stands.

**Handoff after session 148 (2026-07-22). Auth bug fix: fresh-device OAuth login threw existing
accounts out to the landing page. Branch `claude/pwa-auth-uninstall-bug-hrafrw`, PR #644 merged.**
The founder reported: after uninstalling the PWA and logging into an admin account with Google, the
app redirects to the landing page right after login and throws them out.
- **Root cause.** Uninstalling the PWA wipes `localStorage`, so on the fresh install the local
  `onboarded` flag defaults to `false`. Google OAuth (`signInWithGoogle`) returns to `/`, where the
  `RequireOnboarding` guard (`router.tsx`) read the **local** `onboarded` flag *synchronously* and
  immediately `<Navigate to="/welcome">` — before `startCloudSync` (async) pulled the account's real
  `onboarded: true` from its Supabase profile. Any existing account on a fresh device got bounced.
  Not admin-specific; admins just hit it because they test on multiple devices. `RequireFounder` was
  never in the redirect path (OAuth returns to `/`, not `/admin`) and reads `user.email` which is
  available immediately, so it needed no change.
- **Fix (3 files, +37 lines).** New `syncHydrated: boolean` on `useAuthStore` (default false).
  `cloudSync.ts` sets it `false` at the start of each `startCloudSync` and in `stopCloudSync`
  (sign-out), and `true` in a `finally` **after** the first pull's profile merge (so the cloud
  `onboarded` is already applied when it flips; also covers the offline-catch path).
  `RequireOnboarding` now: (1) lets already-onboarded devices straight in; (2) renders `null` while
  `status === "loading"` (OAuth handshake in flight); (3) for a signed-in / guest user, renders
  `null` until `syncHydrated`; (4) only a genuinely signed-out visitor (or one whose pull finished
  still-not-onboarded) goes to `/welcome`. Circular import (`cloudSync` ↔ `useAuthStore`) is safe:
  both only touch each other inside function bodies, never at module eval.
- **Gates:** `typecheck` ✓ · `lint` (0 errors; pre-existing warnings only) · `test:unit` **257/257** ·
  `build` ✓ · `check:bundle` **112.3 kB** (main chunk unchanged). Sandbox can't reach the live
  `*.github.io` site, so the founder confirms the reinstall-and-login result after the Pages deploy.

**Handoff after session 143 (2026-07-21). Admin Control Center scoping, branch
`claude/genauly-admin-control-center-7ohvnb`, shipped to `main` (PR #626, docs + preview only).**
Founder asked for a comprehensive admin control center: an expert-agent panel to scope it, a report
with recommendations, and HTML previews (research/design only, zero app-code changes).
- **Four-agent expert panel** (product strategy, infra/codebase audit, content ops, analytics/ops)
  synthesized into **`docs/plans/ADMIN_CONTROL_CENTER_PLAN.md`**: a 7-module blueprint (A Review
  Cockpit "Prüfmodus" flagship, B Feedback-Inbox, C Versand & Systemzustand incl. the "Ist meine
  Änderung live?" widget, D Kosten & Missbrauch, E Nutzer-Aggregate, F Inhalts-Intelligenz, G Launch
  & Compliance) + the P0 loop-closer `pnpm apply:reviews`, a migration-0008 sketch, a do-NOT-build
  list (no live CMS, no roles, no analytics SDK/cookie-banner risk, no per-user data browsing),
  phasing, and risks.
- **`preview/admin-control-center-mockups.html`**: 4 mockup screens on the real brand tokens
  (Übersicht cockpit, Prüfmodus review card, Feedback-Inbox + Systemzustand, Steuerung).
- **Founder decisions (plan §10):** dedicated `/admin` route · feedback triage = status + note +
  link + priority · launch checklist persisted in Supabase · admin UI bilingual DE/EN · plus a
  **Steuerung (remote-config) module** (§4 H, justified by a prompt-log mining pass: 25+
  config-shaped asks → a 12-switch catalog + guardrails; mechanism = Supabase `app_config`,
  world-readable/founder-writable, runtime-fetched to dodge the PWA cache; visibility toggles never
  unmount routes; the locked bar structure stays locked).
- **Build plan `docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md`:** the scope chunked into 12
  PR-sized chunks (+4 later) with per-chunk model recs (MVP mix: Fable ×2 security/integrity core,
  Opus ×3 cross-cutting builds, Sonnet ×3 well-specified UI). No gates (docs only).

**Handoff after session 142 (2026-07-21). Wörter (words) quality-control, branch
`claude/words-collocations-qc-0pycjq`, shipped to `main` (PR #624).** Founder screenshot of the
Theorie → Wörter list: "Aufgaben verteilen" (a Nomen-Verb collocation) sat article-less among real
nouns. QC found the Wörter list renders the whole vocab bank with no POS filter, so **8 noun+verb
collocations leaked in**; **6 were literal duplicates** of existing Kollokationen entries. Founder
direction: the individual words may stay in Wörter, but the *combination* belongs in Kollokationen.
What shipped:
- **Retire-from-surface, never delete** (shipped ids are permanent, progress is id-keyed). New
  `RETIRED_VOCAB_IDS` set + `browsableVocabulary` (= bank − retired) in `src/data/vocabulary.ts`.
  Every "words" surface reads `browsableVocabulary`: the Wörter browse (list/table/graph/counts,
  via `themeScoped` + `vocabByTheme`/`vocabBySubTheme` which are now browsable-based), global search
  (`lib/search.ts`), the composed-session word pools (`engine/session.ts` ×3: libraryFocus, focus,
  weightedDue), and `Sammlung.tsx`. `vocabById`/`vocabulary` stay the full bank for id resolution.
- **The 8 retired ids:** `v_aufgabe_verteilen`, `v_zustandig_klaeren`, `v_software_einfuehren`,
  `v_muell_vermeiden`, `v_energie_sparen`, `v_wortergreifen`, `v_planung_revidieren`,
  `v_vorwuerfe_zurueckweisen`.
- **Added the 2 combos missing from Kollokationen** (`c_planung_revidieren`,
  `c_vorwuerfe_zurueckweisen`) + provenance rows; the other 6 already existed there. Collocations
  1,033 → **1,035**.
- **`lint:content` guardrail (new `lintVocabCollocationOverlap`)** upgraded from warn to **ERROR**:
  a vocab word whose German equals a collocation `full` must be removed or listed in
  `RETIRED_VOCAB_IDS`, so a future overlap fails CI. Retired ids are the sanctioned exception; a
  stale set entry is also flagged. Normalizes lexemes (drops leading article, lowercases).
- **Gates:** `pnpm lint:content` (1,035 colloc, no errors) · `typecheck` · `test:unit` (219) ·
  `build` · `check:bundle` (110.5/400 kB) all green. Post-merge branch realigned to `main`.
  PWA caveat: the word list is service-worker-cached; hard-refresh the live site to see it.

**Handoff after session 141 (2026-07-21). Mobile bottom-nav item labels, branch
`claude/mobile-nav-item-labels-vx29vh`, shipped to `main` (PR #622).** Founder asked to add each
nav item's name under its icon in the mobile view, visible only when selected, with real-screenshot
previews. What shipped (all in `src/components/layout/`):
- **`BottomTabBar.tsx` — `BarTab` restructured to a vertical column** (icon squircle on top, label
  below). The label slot is a **reserved fixed-height row on every tab** (`h-3`, `opacity-0` when
  inactive) so selecting a tab never shifts the icon rail; the name fades in only on the active tab.
  The old small active underline was removed (label + grey squircle now mark the active tab). The
  squircle shrank `h-11 w-11` → **`h-10 w-10`** so icon + label fit inside the locked 63px bar
  height (a deliberate, founder-driven exception to the s28 `h-11` lock; noted in CLAUDE.md).
- **Label color:** first shipped in the section accent, then the founder called blue "not premium"
  → switched to a neutral theme-aware **dark grey** (`text-slate-600 dark:text-slate-300`,
  `font-semibold text-[10px]`). `color` was dropped from the `BarTab` destructure (now unused).
- **Rename Theorie → Bibliothek** (founder): `nav-items.ts` `/library` label + `LibrarySwitcher.tsx`
  `aria-label`. (This reverses the s105 Bibliothek→Theorie rename; the s105 change is still in the
  historical comments.) Edit mode, icon marks/colors, and the iOS fixes are untouched.
- **Verification:** `pnpm typecheck` ✓ · `pnpm build` ✓ (incl. PWA + help prerender). Captured
  real 390×844 mobile screenshots of the running dev app via the preinstalled headless Chromium
  (seeded `onboarded:true` in `b2beruf.settings.v1` localStorage to skip onboarding). Post-merge
  branch realigned to `main`. PWA caveat: the nav is service-worker-cached; hard-refresh to see it.

**Handoff after session 140 (2026-07-21). Light-theme recolor (two rounds + a 3-round preview
picker), branch `claude/session-f94z5m`, shipped to `main`.** Founder screenshot of `/library` on
mobile: the warm Papier tint (switcher tracks, tags, page ground) read as "butter yellow". What
shipped:
- **Round 1 (PR #619): neutral grey chrome + flat Himmelblau ground.** `--muted`/`--border`/
  `--input` moved from the warm 42/43-hue tans to neutral 220-hue greys; `--background` to a pale
  Himmelblau. Covers the LibrarySwitcher/ViewSwitcher tracks, `bg-muted` tag pills, the bottom-bar
  active `bg-border` squircle, and every border, app-wide by token.
- **Preview picker (3 rounds, committed to `preview/`):** `background-gradient-variations.html`
  (8 ground options A–H rendered in the real chrome), `…-r2-himmel-mint.html` (the founder liked
  Himmel → Mint; 4 intensity steps), `…-r3-invertiert.html` (the founder picked "Sehr dezent" but
  inverted; 3 mirrored takes). Screenshotted via the preinstalled headless Chromium; founder picked
  **I1** (very subtle mint → sky, 150° diagonal).
- **Round 2 (PR #620): the "I1" gradient ground + lighter greys.** New `--page-from/mid/to` tokens
  (light: mint `144 45% 98%` → `150 50% 98%` → sky `198 83% 98%`; dark: all three = the flat dark
  ground, so dark mode is a NO-OP) + a **`bg-page`** backgroundImage in `tailwind.config.ts` (the
  bg-mesh washes layered over the 150° linear). Applied on the five full-page shells (AppShell ×2,
  Onboarding, LegalChrome, HelpChrome); ExamHub/SimulationHub Cards keep plain `bg-mesh`. Flat
  `--background` became the near-white fallback `180 45% 98%` (sticky bars, inputs); light
  `theme-color` meta = the mint top stop `#F7FCF9`. Mid-round the founder also asked for lighter
  button greys: `--muted` 87% → **`220 10% 90%`**, `--border`/`--input` 83% → **`220 9% 86%`**.
- **Deliberately untouched:** dark theme; the semantic `--warning` Butter tokens; the brand-kit /
  logo scripts' `PAPIER` app-icon tile constant. CLAUDE.md brand section documents the new ground.
- **Gates (both rounds):** `check:contrast` all pairings ✓ · build ✓. PWA caveat: the shell is
  service-worker-cached; hard-refresh the live site to see the new colors.

**Handoff after session 139 (2026-07-20). Three small fixes, branch
`claude/app-icon-favicon-update-gympjq`, all shipped to `main` (PRs #616, #617).** Founder-reported
issues, handled one prompt at a time:
- **Icon-size preview correction (#616):** the founder thought the app icon/favicon still showed the
  old **Randnah** (5% margin) size. The shipped assets were in fact already **Größer** (12% margin)
  since s138 — verified by measuring every committed PNG (mark ≈ 73–75% of the tile = 12% margin;
  Randnah would be ≈ 90%). The confusion came from the saved preview
  `preview/branding/artifacts/genauly-logo-v2-previews.html`, which still highlighted Randnah as
  "empfohlen" and rendered the home-screen mockup row at the 5% margin. Fixed the preview to mark
  Größer as applied and render the OS row at 12%. **No shipped asset changed.** If the live
  tab/home-screen icon still looks old it is PWA/browser cache (hard-refresh; re-add the PWA).
- **Mission-exit toggle fix (#616):** exiting a mission launched from Heute → Spielen stripped the
  `?mission=` param and left the learner on the standalone `/welt` hub, which has no Lernen/Spielen
  toggle. Now `SpielenHub` tags the deep link `&from=heute`, `Welt.tsx` navigates back to
  `/?tab=spielen` on exit when it sees that marker, and `Dashboard.tsx` opens on the Spielen tab for
  `?tab=spielen` (clearing the param on a manual switch). Direct `/welt` visits are unchanged.
- **Kollokationen graph — tighter clusters (#617):** founder asked to pull the nodes closer so the
  theme islands look better; generated a 3-option preview
  (`preview/collocation-graph-tightness.html` + generator `preview/gen-collocation-graph-tightness.mjs`,
  rendering the REAL bank through the shipped d3-force layout) and the founder picked **"Am engsten"**.
  `CollocationGraph.tsx` force block now: centroid pull (forceX/Y) **0.72** (was 0.38), link **0.38**
  (0.22), charge **−34/max200** (−55/240), collision **r+1.5** (r+3), centroid ring **118+N·26**
  (140+N·35). Pure builder unchanged, so `tests/collocationGraph.test.ts` (11) still passes; CLAUDE.md
  layout-recipe note refreshed.
- **Gates (each PR):** typecheck ✓ · build ✓ · check:bundle 110.5 kB ✓ · test:unit 219/219 (#616) /
  collocationGraph 11/11 (#617) ✓. Post-merge branch realigned to `main` both times. PWA caveat: the
  graph + icons are service-worker-cached; hard-refresh the live site.

**Handoff after session 135 (2026-07-20). Game demo-readiness review + P0 batch + P1 cutscene pass
SHIPPED (PRs #601, #602 merged to `main`). Branch `claude/game-review-demo-readiness-8fdpid`.** The
founder asked for a comprehensive review of the current game (Neuland, G1 + G2 Kapitel 1) with
priority actions so the game can be presented in this week's demo, then greenlit the P0 batch and the
P1 cutscene pass in-session. Deliverables:
**`docs/plans/GAME_DEMO_READINESS_REVIEW.md`** (verdict, evidence, prioritized actions, a
3–4-minute game demo script, and the implementation record) plus the shipped fixes below. Key facts:
- **Evidence gathered:** `pnpm typecheck` ✓ · `test:unit` 219/219 ✓ · `lint:content` ✓, plus a
  scripted Playwright playthrough (mobile 390x844, dev build, fresh profile): hub light+dark, mission
  1.1 scenes + battle + bag ask flow (Reisepass hand-over, Wörterbuch), boss 1.6 reachable ungated,
  Heute → Spielen embed. **Zero console errors.**
- **P0.1 SHIPPED — Spielen-tile auto-center fix (`NeulandHub.tsx`):** the compact 3-row mission tile
  opened scrolled to max (hid the next mission + its play button) because the tile was not
  positioned, so the auto-center's `r.offsetTop` was document-relative. The tile is now `relative`
  (it becomes the rows' offsetParent). Verified scripted: fresh profile shows 1.1–1.3 (scrollTop 0),
  mid-chapter centers 1.4.
- **P0.2 SHIPPED — battle opponents have bodies (founder-caught; the review's first pass missed
  it):** `NPC_SPRITES` had only Frau Schmidt, so 4 of 5 dialogue battles ran against an invisible
  opponent. Four new code-authored 26x32 sprites in `welt_assets.py` (Grenzbeamte peaked cap+badge,
  Milo lanyard, Kassiererin apron, Herr Brandt balding+mustache+cardigan; blessed style, locked
  world scale), wired via `stage.tsx` `NPC_SPRITES`, `sprite:` on the 4 battle NPCs in
  `missions.ts`, and the linter's `GAME_SPRITES` mirror (`lint-content.mjs`, it errors on
  unregistered sprites). Shared battle anchor composite-checked on all four backdrops.
- **P1 art SHIPPED — Nachtblau asset regen:** `welt_assets.py` `INDIGO` `(91,91,230)`→`(61,116,237)`
  (`#3D74ED`), all assets regenerated (player backpack, backdrop accents, doc + Wörterbuch icons).
- **P1 SHIPPED — cutscene characters (`scenes.tsx` `CutsceneCast`):** all 19 cutscenes rendered as
  empty rooms (only hotspot placed the player). Now the player stands bottom-left on every
  backdropped cutscene (the `website` prop scene stays character-free) and the speaking NPC stands
  right (current line's speaker if sprited, else the scene's primary sprited NPC, so no flicker).
  Needed a new **Jonas sprite** (the recurring companion, 22 cutscene lines, was spriteless);
  registered like the others. Composite-checked on all 5 cutscene backdrops; verified in-app the
  player renders on the 1.1 arrivals cutscene. Listening/automat/form/loadout keep prop/device focus
  (no person) by design.
- **Still open before the demo:** founder tasks only — seed missions 1.1–1.3 on the exact demo
  device (game progress is LOCAL-ONLY) + dress rehearsal of 1.4 and the boss after the merge is live
  (hard-refresh, PWA autoUpdate).
- **By-design, don't "fix":** missions light-only (hub theme-aware), Kapitel 2+ locked teaser, dark
  surround below short scenes, no game cloud sync until the G2 migration.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · lint:content ✓ · test:unit 219/219 ✓ · build ✓ ·
  bundle 80.7 kB ✓.

**Handoff after session 136 (2026-07-20). Landing-page redesign, previews → full implementation,
branch `claude/landing-page-redesign-iqxlja`, shipped to `main`.** The founder asked for a
conversion-focused landing analysis + "billion-dollar edutech" previews, picked **Preview A "Der
Textmarker"** (warm highlighter editorial; Preview B "Die Nachtstadt" remains unbuilt in
`preview/landing-redesign/` as a future direction), then iterated: logo/wordmark optical alignment,
real page links in the nav, a filter→custom-Üben section, English-first copy, an EN/DE page toggle,
"Go to app" for logged-in visitors, and companion (not replacement) positioning.
- **`src/features/landing/LandingPage.tsx` rebuilt** (full rewrite, token-based so dark mode works):
  sticky nav (anchors + About/Help/Sources + LangToggle + auth-aware CTA) · hero (swiped "plateau."
  headline, flashcard collage with `Wesen` creatures + floating streak/XP pills) · scenario marquee ·
  plateau chart (`PlateauChart`, hand-drawn SVG with "Du bist hier") · bento features (session mock,
  der/die/das cells, FSRS bars, speaking wave, exam badges) · **filter rail mock + "Filter what you
  need. Practice exactly that."** · dark numbers band (honest counts + /sources link) · steps
  ("Your smart companion.") · the OAuth-required "What is Genauly?" purpose card (kept, bilingual) ·
  FAQ `details` · closing CTA · footer. All copy lives inline as `t(en, de)` pairs on a local `lang`
  state (default EN); German is reserved for obvious/brand terms per the founder's 10-20% rule.
- **New `.landing-*` CSS in `src/index.css`:** `landing-swipe` (the highlighter device; swiped text
  stays ink `#1c1a23` in BOTH themes since the swipe ground is always light Himmelblau; a
  `landing-swipe-reward` variant tints with `--reward-bg`) and `landing-marquee` (+ reduced-motion
  opt-out). **The hero collage float is framer-motion, NOT CSS** (the `float()` helper in
  `LandingPage.tsx`): a CSS-keyframe version shipped first but did not run on the founder's iPhone,
  and a CSS `transform` animation also overrides Tailwind translate/rotate on the same element, so
  the float animates an INNER wrapper via framer while the outer element keeps position/rotation.
  The closing card's white CTA carries **no shadow** (rendered as a heavy halo on device); the other
  CTAs keep `shadow-glow` (founder-specified). The published preview artifact is stored at
  `preview/landing-redesign/landing-a-artifact.html`.
- **Rules recorded:** logged-in CTA label is "Go to app"/"Zur App" (never "Dashboard"); no
  replacement-for-traditional-learning claims; hero eyebrow is "German for real life" (B1–B2
  removed at founder request; the footer keeps the full tagline).
- **Previews:** `preview/landing-redesign/` holds both mockups + README (analysis, revision log,
  implementation spec). Preview A includes a working JS EN/DE toggle; it was published as a claude.ai
  artifact for founder review across four feedback rounds.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · build ✓ · test:unit 219/219 ✓ · check:bundle 111 kB
  (landing is eagerly routed; +~30 kB static JSX, well under the 400 kB budget) ✓. Verified rendered
  output via `pnpm preview` + headless Chromium: light/dark, EN/DE, 390/1280, logged-in state.
  **PWA caveat:** the landing is service-worker-cached; hard-refresh the live site before judging.

**Handoff after session 137 (2026-07-20). Branding-refresh review + premium pass (fixes 1-7),
branch `claude/app-branding-refresh-review-bmrly2`, shipped to `main`.** The founder asked for a
review of the s133 rebrand ("doesn't look as premium as before"), first as a report only, then
greenlit fixes 1-7 of the ten-point list. What shipped:
- **Token-driven accent-gradient (fixes 1+2):** `--gradient-from: 226 83% 47%` / `--gradient-to:
  196 93% 38%` (light) and `226 90% 66%` / `198 90% 58%` (dark) in `index.css`;
  `tailwind.config.ts` renders `linear-gradient(135deg, from 0%, primary 45%, to 100%)`. Light mode
  now travels deep Nachtblau → vivid sky (ends brighter/more saturated, the s133 fixed end stop read
  muddy); dark mode stays light end-to-end so the near-black `primary-foreground` text passes (old:
  ~2.5:1, a real AA failure `check:contrast` could not see). Both stops are now gated
  (`primary-foreground` on from=CORE / on to=UI, both themes, 46/46 pass).
- **Gradient restored on the landing (fix 3):** the four `bg-primary` pill CTAs (nav + hero) and
  step chip 1 ride `bg-accent-gradient` again; all pills + the three step chips switched
  `text-white` → `text-primary-foreground` so they stay legible on the light dark-mode gradient.
- **Button default sheen (fix 4):** `bg-gradient-to-b from-white/12 to-transparent` over
  `bg-primary` in `button.tsx` (subtle dimensionality, hover behavior unchanged).
- **`.text-display` + `.text-eyebrow` (fixes 5+6)** in `index.css` `@layer components`; applied to
  SectionHeading + HubHero (all hub/Fortschritt/Settings headers), Lernpfad + Neuland H1s (parity
  kept, comments updated), GrammarTopicView, LegalChrome, HelpChrome, QuizHub, WritingHub, and the
  6 landing eyebrows. Page titles are now extrabold/tracking-tight like the s136 landing.
- **Indigo/violet purge (fix 7):** Neuland Boss tag → `bg-primary/10 text-primary`, game `Chip`
  tone `indigo` renamed `blue` (`bg-blue-50 text-blue-700`), QuizHub hero + intent cards
  `from-violet/indigo/purple-*` → brand families (`from-blue-600 to-sky-500`,
  `from-amber-500 to-orange-600`), Anwenden Prüfung card `to-purple-500` → `to-pink-500`, stale
  "brand indigo" comments reworded.
- **Second wave (items 8-10, greenlit in-session):** themes.ts accents + Sammlung/Anwenden hub
  tiles re-derived from the brand families (no more indigo/violet/purple/fuchsia); the dark theme
  re-hued 250 → **228 warm navy** across all surface/text tokens incl. the no-JS shells + manifest
  (`#131620`/`#e7e8ef`) and the brand-kit tokens/docs (regenerated); `bg-mesh` nudged to 0.10/0.09;
  the landing numbers band's stat values are gradient-clipped (fixed light Himmelblau stops, the one
  sanctioned text-gradient moment). **Hotfix ridealong:** PR #609's squash accidentally shipped an
  unresolved rebase-conflict marker in `LandingPage.tsx` (post-rebase gates were not re-run),
  breaking `main`'s build; resolved here (single-button `primaryCta` keeping main's simplification +
  the gradient classes) and all gates re-run. Item 10's "landing pills onto the shared Button"
  sub-idea was dropped as churn without visual payoff.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · test:unit 219/219 ✓ · build ✓ · bundle 110.9 kB ✓ ·
  check:contrast 46/46 ✓. Verified rendered output via `pnpm preview` + headless Chromium
  (landing light/dark, Anwenden hub, Fortschritt). **Deploy: the wave-1 Pages run failed (the #609
  conflict marker); the wave-2 run (`add6529`, PR #610) completed green, so BOTH waves went live
  together.** PWA caveat: hard-refresh the live site.

**Handoff after session 138 (2026-07-20). Logo v2 rework (logos ONLY, founder-scoped), branch
`claude/logo-blue-contrast-xsfk19`, shipped to `main`.** The founder found the logo's Himmelblau
swipe too harsh against black/white and iterated through 8 artifact preview rounds (v2→v8) to a
finalized design, then said "finalize these logos and Randnah favicon, apply everywhere, logos
only." What shipped:
- **Swipe color: Himmel Soft `#8CDBFB`** on every logo asset. (Initially the `--accent` token was
  deliberately left at Himmelblau `#52C6F9`; a same-session follow-up prompt then applied Himmel
  Soft app-wide: `--accent: 197 93% 77%` in BOTH themes in `index.css`, plus the two fixed
  `#53C7F9` hexes on the landing (numbers-band gradient stop, decorative doodle stroke). The darker
  `--accent-ink` text variant and the CTA `--gradient-*` stops are different blues and stayed.
  `check:contrast` green; brand kit regenerated.)
- **Icons re-centered ("Größer", `TILE_MARGIN = 0.12`):** `build-logo-assets.mjs` now measures the
  mark's true bbox in-browser and centers it at a 12% margin (favicons/apple-touch/pwa; maskable at
  14% since the OS crops it). This fixes the founder-screenshotted "empty band above the g" app icon.
  (Started at 5% "Randnah"; the founder found that too big live and picked Größer in a follow-up.)
  Never revert to raw-coordinate centering.
- **Two-tone dark logos:** on dark grounds, artwork on the swipe is ink, off the swipe is white —
  in practice only the g splits (ink bowl, white descender). Light grounds stay all ink.
- **New lowercase wordmark** (`public/genauly-wordmark.png`/`-dark.png`, 548×138): "genauly" in
  the app's own Inter (variable, wght 800, −0.02em, rendered via embedded `@fontsource-variable/
  inter` woff2), swipe under "genau" with the exact v2 band geometry (−0.16em/+0.10em overhangs,
  0.12em/0.10em em-box insets, −2° tilt). Dark wordmark: word white, "enau" solid ink on the
  swipe, ONLY the g dual-tone (clip = swipe ∪ an e..u rect, avoids white slivers on letter
  bottoms).
- **`Logo.tsx` gained `variant="mark" | "wordmark"`**; wordmark placed in Sidebar, AuthDialog,
  Onboarding, HelpChrome, LegalChrome, landing footer, **landing header at ALL sizes** (the
  founder wants a first-time visitor to see the app NAME, not just the mark; sized `h-7 w-auto
  sm:h-8`), and the dark no-JS shells (`index.html`, `prerender-help.mjs` — the adjacent "Genauly"
  text spans were removed, the image IS the name). Only the mobile in-app `AppShell` header keeps
  the compact mark (s86 rule). **Gotcha fixed in review:** responsive *display* utilities
  (block/hidden) must wrap `<Logo>` in a container, never be passed into it (they override the
  internal `dark:` image swap); *height* utilities are safe to pass in (they apply to both theme
  images), which is why the single responsive `h-7 sm:h-8` on the landing header works.
- **Brand kit + spec:** `build-brand-kit.mjs` reworked to the logo v2 (two-tone dark mark, Größer
  app-icon tile, the lowercase "genauly" wordmark as PNG copied from `public/`, PNG lockups; drops
  the `wordmark-data.mjs` capital-G dependency) and regenerated; `brand-kit/README.md`,
  `BRAND_SPEC.md` §3, and the CLAUDE.md brand section rewritten. The 8-round preview artifact is
  saved at `preview/branding/artifacts/genauly-logo-v2-previews.html`.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · test:unit 219/219 ✓ · build ✓ · bundle 110.5 kB ✓.
  Verified rendered output via `pnpm preview` + headless Chromium (landing light/dark/mobile,
  /hilfe dark) and the regenerated brand-kit contact sheet. PWA caveat: hard-refresh the live site;
  the home-screen icon may need re-adding to show the new size.


---

**Handoff after session 144 (2026-07-22). Admin Control Center chunks 1 + 2 (backend foundation +
the review loop-closer), branch `claude/admin-control-center-chunk-1-eafquu` (three PRs to `main`:
#631 chunk 1, #632 setup-doc fixes, #633 chunk 2).** The first two build chunks of
`docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md`, both on the recommended Fable tier (they are the
security + integrity core). Migration 0008 was deployed live by the founder and verified in-session.

### Chunk 1 · backend foundation (this chunk IS the security boundary)
What shipped:
- **Migration `supabase/migrations/0008_admin_center.sql`** (idempotent, founder pastes it into
  the Supabase SQL editor; steps appended to `docs/plans/PHASE2_SETUP.md`):
  (1) `provenance_reviews` widened from the boolean checkbox to real decisions:
  `decision approve|reject|needs_fix`, `content_hash` (the decision-time safety hash chunk 2's
  `apply:reviews` compares before flipping repo rows), `reviewer_email`, `applied_at`,
  `applied_sha`; `verified=true` rows backfilled to `decision='approve'` (legacy rows keep a null
  hash, which apply:reviews must treat as "needs re-review", never a free pass), reviewer emails
  backfilled from `reviewed_by`. The `verified` boolean stays until the chunk-2 workbench update.
  (2) `feedback` triage columns: `status neu|erledigt|verworfen`, `priority hoch|normal|niedrig`,
  `note`, `link` (table stays service-role-only; founder access via RPC only).
  (3) **`app_config`** (Steuerung store): key/value jsonb rows, world-READABLE RLS (the app will
  consume it at startup in chunk 7), founder-only writes. (4) **`launch_checklist`**: founder-only
  RLS, state synced across devices (items seeded by the chunk-6 UI).
  (5) **`is_founder()`** (the SINGLE email source for every 0008 policy/RPC) + **`assert_founder()`**
  + SECURITY DEFINER RPCs gated in-body per the 0004/0007 pattern: `admin_overview()` (one jsonb:
  accounts split guests/email/Google + new7d, active today/7d, sessions/XP/SRS-card totals, AI
  month spend vs cap inputs, feedback counts, review sync-gap counts), `admin_daily_series()`
  (30-day `{day, signups, actives}`), `admin_feedback_recent(n)`, `admin_feedback_update(...)`
  (validates enums; empty string clears note/link). All revoked from `public`/`anon`, granted to
  `authenticated` (guests ride the authenticated role, so the in-body email check is the real
  boundary). **Privacy line held: aggregates only, no RPC returns learner rows; no admin SELECT
  policies were added to `profiles`/`progress`/`writing_evaluations`** (the `feedback` table is the
  sanctioned per-row exception: operational mail addressed to the founder).
- **`src/lib/adminApi.ts`**: typed fail-soft wrappers (null/empty/false on error, offline-first)
  for the four RPCs + raw `app_config` and `launch_checklist` helpers. Not imported by any eager
  code yet (main chunk unchanged); consumers arrive with the `/admin` shell in chunk 3.
- **`tests/admin.test.ts` extended (lockstep pin):** migration 0007 + 0008 email sets must equal
  `FOUNDER_EMAILS` exactly, both emails must sit inside `is_founder()`, and every 0008 admin RPC
  must contain `perform public.assert_founder();` and a `revoke ... from public, anon`.
- **Docs:** founder deploy/verify steps in `PHASE2_SETUP.md` (run 0008; existing Werkbank ticks
  carry over as approve decisions, nothing re-clicked); CLAUDE.md admin-gate note now covers 0008.
- **Gates:** `typecheck` · `lint` (0 errors) · `test:unit` 222/222 · `build` · `check:bundle`
  (110.6/400 kB) · `lint:content` all green. Nothing visible in the app changes yet.
- **Deployed + verified live (same session):** the founder ran migration 0008 in the Supabase SQL
  editor (via the dashboard paste path; `PHASE2_SETUP.md` §1 now marks the CLI optional), confirmed
  the gate rejects an identity-less call ("forbidden: founder account required" is the HEALTHY
  result in the SQL editor), and got a real `admin_overview()` JSON via the
  `set_config('request.jwt.claims', ...)` trick: 6 accounts (4 Google / 2 guests), 8,053 XP,
  532 SRS cards, 60 sessions, 1 feedback (neu), reviews `decided: 1, approvedUnapplied: 1` (a
  legacy boolean-era tick, no decision hash, so chunk 2 routes it to re-review, never a blind flip).

### Chunk 2 · the loop-closer `pnpm apply:reviews` + decision-time hashes
The review pipeline "founder clicks on the phone → next Claude session commits it" now works end
to end:
- **Shared fingerprint:** new `src/lib/contentHash.ts` (browser SubtleCrypto sha256 over canonical
  JSON, byte-compatible with `scripts/content-hash.mjs`) + `src/lib/contentIndex.ts` (the same
  content-id universe as the stamp script; dynamic-import only, a ~4 kB glue chunk over the shared
  bank chunks, main chunk untouched at 110.7 kB). Parity pinned by `tests/contentHash.test.ts`
  (canonicalization, hashes, id universe; jsdom gets node webcrypto).
- **Decision-time capture:** the /sources Daten-Werkbank tick now saves `decision: "approve"` + a
  `content_hash` of the item as reviewed + `reviewer_email` (untick clears the decision; note-only
  edits leave it untouched); CSV export gained the decision column.
- **`scripts/apply-reviews.mjs`** (`pnpm apply:reviews`): decision source → `ID_RENAMES` → hash
  compare → codemod `provenance.ts` (`draft`→`verified` + `verified_by`/`verified_date`,
  format-exact) → `stamp:verified` + `lint:content` in the SAME commit → defects/re-review export
  to `docs/reports/review-defects.md` + `.json`. `--dry-run` writes nothing. Integrity rules pinned
  by `tests/applyReviews.test.ts`: null/mismatched decision hash = re-review (never a flip),
  already-verified rows only ever mark applied.
- **Verified end to end in-session:** real flip of `v_besprechung` through the codemod →
  `stamp:verified` (25→26) → `lint:content` green → reverted.

### Chunk 2 addendum · keyless review handoff (founder security review, same session)
The founder correctly flagged that the Claude environment's **environment-variables box is plaintext
and explicitly warns against secrets**, so storing `SUPABASE_SERVICE_ROLE_KEY` there (my first
instruction) was wrong. Replaced the key path with a keyless file handoff, no secret ever touches
the environment:
- **Browser export:** `src/lib/reviewExport.ts` (`buildDecisionExport`/`downloadDecisions`) + an
  **"Entscheidungen (N)"** button in the AdminWorkbench toolbar. The founder is already securely
  signed in on /sources (RLS grants read), so the browser downloads a `genauly-review-decisions-*.json`
  file (decisions + decision-time fingerprints, NO credential). CSV export unchanged.
- **Keyless script mode:** `pnpm apply:reviews --from <file>` (`parseDecisionFile`) reads that file
  instead of Supabase, does the identical hash-compare + codemod + stamp + lint, and writes NO
  database (applied state reconciles from the deployed bundle: the item is `verified` in
  provenance.ts). The direct-DB path stays for a secure local shell with the key, but is no longer
  the founder's path. Round-trip (browser export → script parse) pinned by `tests/reviewExport.test.ts`.
- **Verified end to end:** built a realistic 2-decision fixture (one hash-matching `v_besprechung`,
  one stale `v_tagesordnung`) → `--from` dry-run classified correctly (1 ready, 1 re-review) →
  real `--from` run flipped `v_besprechung`, stamped, linted green, exported the stale one to the
  re-review report → reverted.
- **Founder action: NONE.** No key to set up; the workbench button + file handoff is the whole flow.
  `PHASE2_SETUP.md` rewritten accordingly (and now says NOT to put the service-role key in the
  environment variables).
- **Gates:** `typecheck` · `lint` (0 errors; the one new hook-deps warning was fixed properly) ·
  `test:unit` 237/237 · `build` · `check:bundle` (110.7/400 kB) · `lint:content` all green.
- **Next:** chunk 3, the `/admin` shell + Übersicht cockpit (Opus recommended); chunks 1-2 outputs
  (sync-gap counter + handoff prompt) are its data feed.

**Handoff after session 145 (2026-07-22). Admin Control Center chunk 3 (`/admin` shell + Übersicht
cockpit), branch `claude/admin-control-center-chunk-3-7g5829`.** Chunk 3 of
`docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md` on the recommended Opus tier: the founder's front
door to the admin center, cross-cutting wiring against an already-approved design (mockup 1 in
`preview/admin-control-center-mockups.html`). What shipped:
- **Route + gate:** `RequireFounder` in `router.tsx` (mirrors `RequireOnboarding`; renders nothing
  while auth `status === "loading"` to avoid a redirect flash, else `isFounder(user)` or `<Navigate
  to="/">`). New standalone top-level route `/admin/*` (outside AppShell chrome, like `/sources`),
  lazy `AdminApp` (one chunk owns the whole `/admin` subtree via descendant `<Routes>`). Client gate
  is cosmetic; the real boundary stays the 0008 RLS/RPC.
- **`src/features/admin/` (all new, lazy):** `AdminApp.tsx` (lang provider + descendant routes),
  `AdminShell.tsx` (full-screen sidebar cockpit: 8-item DE/EN nav, founder chip, DE/EN toggle,
  "back to app"; fetches `admin_overview` ONCE and shares it via Outlet context so screens don't
  re-fetch; Feedback nav badge = `feedback.neu`), `AdminOverview.tsx` (the Übersicht), `adminI18n.tsx`
  (a `t(de, en)` context + localStorage-persisted lang, no i18n framework), `adminFunnel.ts` (pure,
  unit-tested), `liveWidget.ts` (C1), `AdminPlaceholder.tsx` (the not-yet-built screens
  Prüfen/Feedback/Inhalte/Nutzer/System/Steuerung/Launch resolve to it so deep links never 404;
  chunks 4-7 swap them in).
- **Übersicht tiles (mockup 1):** **A1** verification-funnel — "Menschlich geprüft" (verified count,
  25 today), "KI-Jury-Abdeckung" % (tier ≥ jury, the machine floor that costs nothing), and the
  all-banks trust-ladder stacked bar, all computed synchronously from bundled `provenance.ts` +
  `verification.ts` (zero backend). **A4** sync-gap — "Wartende Entscheidungen" count + a
  "Übergabe-Prompt kopieren" button producing the ready-to-paste `pnpm apply:reviews` handoff with
  the exact ids; pending = approved (`provenance_reviews.decision === "approve"`) minus already
  `verified` in the bundle (keyless-safe, matches how apply:reviews reconciles). **D1** AI-budget
  tile (`admin_overview` cost vs $5 + cache-hit rate). **C1** "Ist meine Änderung live?" — build
  stamp (new Vite `define` `__BUILD_SHA__`/`__BUILD_TIME__`, read only in the admin chunk) vs latest
  `main` from the public GitHub commits API, plain-language verdicts + the recurring PWA-cache hint +
  a Supabase-reachable line. Honest metrics: no fabricated deltas; "+N diese Woche" shows only when
  real (from `verified_date`).
- **AccountMenu:** founder accounts get a "Kontrollzentrum" (`ShieldCheck`) entry to `/admin`.
- **Gates:** `typecheck` ✓ · `lint` (0 errors) · `test:unit` **253/253** (new `tests/adminFunnel.test.ts`) ·
  `build` ✓ · `check:bundle` **111.6 kB** (main chunk unchanged; admin rides an 18 kB lazy chunk).
- **Next:** chunk 4, the Review Cockpit / Prüfmodus (Opus), needs the `build-review-queue.mjs` scorer.

**Handoff after session 146 (2026-07-22). /sources verification refresh + human-review reset + table
restructure, branch `claude/sources-unchecked-items-njvmao`.** The founder asked why /sources showed
"800+ items not yet checked". What shipped:
- **Stale verification map, regenerated.** `src/data/verification.ts` was generated 2026-07-13, before
  the s126 daily-life scale-up (2026-07-17) added ~844 items, so those had no tier and fell into the
  "next verification sweep" bucket (~27%) — a stale build artifact, not a quality hole. Refreshed all
  inputs against the current banks: `build:oracles` (der/die/das, 1292/1327 lemmas), `build:frequency-subset`
  (1889 tokens), `build:languagetool` + `verify:grammar` (5236 sentences, **0** grammar/agreement
  findings), `verify:facts` (**0** two-oracle errors) + `verify:cefr` (0 flags), then `build:verification`
  → **3,107 records** (was 2,263). The "next sweep" bucket is now 0; previously-untiered items show as
  grammar-checked (linguistic). Committed inputs: the vendored `scripts/vendor/*.json` subsets, the
  `docs/reports/verify-grammar.json` sidecar, and the three `verify:*` reports (the 69 MB LanguageTool
  lib is gitignored).
- **Human verification reset to zero (founder request).** The 25 founder-approved Can-Do provenance rows
  were flipped `review_status: "verified"`→`"draft"` (a precise codemod; `verified_by`/`verified_date`
  dropped), `build:verification` re-run (human tier → 0), `stamp:verified` re-run (`verified-hashes.json`
  hashes now `{}`). The `human` tier and the "menschlich geprüft" StatTile now read 0 until the review
  pass restarts. CLAUDE.md provenance + Can-Do bullets updated to match.
- **/sources table restructure (no more endless scroll).** The founder-only **Daten-Werkbank** table
  moved off the main /sources page onto its own sub-page **`/sources/werkbank`** (`RequireFounder`-gated
  route in `router.tsx`, same lazy chunk as Sources; extracted the shared `useWorkbench` hook +
  `SourcesWorkbench` component in `Sources.tsx`); the main page shows admins a link card to it. The
  public **"Alle Inhalte und ihre Quellen"** item browse is now behind a **collapse toggle** (`showAll`,
  collapsed by default).
- **Gates:** `typecheck` ✓ · `lint` (0 errors; warnings are the pre-existing debt) · `lint:content` ✓
  (0 verified) · `test:unit` **253/253** · `build` ✓ · `check:bundle` **111.8 kB** (main chunk unchanged;
  Sources stays a lazy chunk).

---

## Session 147 (2026-07-22) — Schreibtraining redesign: Fokus Satzlabor + nav item + harmonization (moved from PROJECT_STATUS.md in s149)

**Handoff after session 147 (2026-07-22). Schreibtraining redesign: Fokus "Satzlabor", branch
`claude/schreibtraining-todo-review-afoegv`, PR #640 merged.** Backlog #6. A five-expert design panel
(LLM engine, frontend, German B2 pedagogy, backend cost/security, UX) produced
`docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md`; mockups in `preview/schreibtraining-redesign-mockups.html`.
What shipped:
- **`/writing` is now a mode router** (`WritingHub` rewritten): **Fokus · Kurz · Lang** via
  `WritingModeSwitcher` (sliding pill) + a Verlauf toggle. Kurz/Lang extracted verbatim into
  `GuidedWritingTrainer` (old length toggle folded into the mode; existing `evaluate-writing` backend).
- **Fokus "Satzlabor"** (`src/features/writing/fokus/`): single-sentence lab. `FokusTrainer` +
  tri-state `GrammarRail` (aktuell / target / selected; desktop rail + mobile chip row) +
  `useFokusMachine` (edit invalidates, transforms derive from the corrected base, in-memory cache).
  `grammarDimensions.ts` = the Aktiv/Vorgangspassiv × Präsens/Perfekt/Präteritum MVP grid (data-driven,
  Wave 2 extends the arrays). Client `lib/sentenceStudio.ts` degrades gracefully if the backend is
  undeployed.
- **Backend:** migration `0009_sentence_studio.sql` (`sentence_checks` owner-only, GLOBAL cross-user
  `sentence_transforms` cache, `sentence_ai_ops` paid-op ledger, `bump_transform_hit` RPC,
  `sentence_studio` kill-switch) + Edge Functions `check-sentence` (correct + detect, Haiku, cache-first)
  and `transform-sentence` (transform, cache-FIRST, abstains rather than hallucinate; burst/daily/monthly
  limits count only paid ops; `TRANSFORM_MODEL` env-switchable to Sonnet). Metered into the shared **$5
  fuse** so max spend is unchanged. Deploy steps in `docs/plans/PHASE2_SETUP.md`.
- **The session continued past the initial ship (5 more PRs on the same branch):**
  - **Nav (PR #642):** Schreibtraining promoted to a dedicated top-level nav item **"Schreiben"**
    (`/writing`, rose accent, the existing pencil mark). `DEFAULT_PINNED_TABS` + `BottomTabBar` `CONTENT`
    now `["/library", "/writing", "/analytics"]`; the `/writing → /anwenden` `ROUTE_SUCCESSOR` remap was
    removed. CLAUDE.md nav bullets updated.
  - **Backend robustness (PR #643):** the two Edge Functions swallowed LLM errors silently, so failures
    were invisible in the logs. Added diagnostic `console.error` logging (HTTP status + body, parse
    failures, a providers-configured line) and a one-shot Anthropic 429/529 retry before falling to
    Gemini → OpenAI. **Founder must redeploy the functions to pick this up.**
  - **Design harmonization (PR #646):** the whole section now matches the Bibliothek design language.
    New `WritingRail` (grey `bg-muted` tile, uppercase domain eyebrows, single-select theme pills;
    desktop sticky aside + mobile chip row). `GuidedWritingTrainer` rewritten: **Kurz/Lang land straight
    on an Aufgabe + writing field** (no theme-picker page), topic switched from the Thema rail. Both
    guided + Fokus share the `[minmax(0,1fr)_18rem]` content+rail grid.
  - **Correction display fix (PR #646):** the Fokus correction showed the corrected sentence with no
    indication of what changed and a green check that read as "correct". Now a pure client-side word
    diff (`lib/wordDiff.ts`) strikes the original, **highlights the changed words in place**, lists each
    edit as before → after ("Was ich geändert habe"), and the header reads "Korrigiert · N Änderungen".
    No backend needed. `tests/wordDiff.test.ts` pins it.
- **Gates (final, PR #646):** typecheck ✓ · lint 0 errors ✓ · test:unit **260/260** (added
  `fokusGrammar` + `wordDiff` tests) · build ✓ · check:bundle **112.3 kB** (main unchanged; writing lazy).
- **Open follow-ups:** (1) founder **redeploys** `check-sentence`/`transform-sentence` for the logging +
  retry fix (the functions + migration 0009 are already deployed; Fokus worked but was flaky, likely a
  provider hiccup, hence the retry/logging); confirm `GEMINI_API_KEY` is set as a project secret so the
  fallback is active; (2) decide Haiku vs Sonnet 5 for transforms (default Haiku, one env var); (3) Wave
  2 axes (Zustandspassiv, Konjunktiv II, Sie↔du, clause order) + the ~50-triple eval harness; (4) optional:
  AI-authored per-change *explanations* in the correction tip (needs a backend field + redeploy). Fokus
  is single-sentence by design.
