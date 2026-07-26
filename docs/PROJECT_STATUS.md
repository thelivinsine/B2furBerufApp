# Project Status

_Last updated: 2026-07-26 (session 168). **The Schreiben mobile pass: every surface now rests at
exactly one viewport, with its chrome pinned instead of drifting** (PRs #717 to #724, all live).
Kurz/Lang: the Feedback/Auswerten row was `sticky`, so it parked at the end of the content whenever
the page fit the screen, at one height in Kurz and another in Lang; it is now `fixed` above the nav,
and a new `useFillEditor` hook sizes the textarea to the space actually left (capped on desktop,
Kurz shorter than Lang). A long Aufgabe no longer scrolls the page either: its card caps and scrolls
internally instead. **Fokus was reworked on mobile after four preview rounds**: the transform
feature, hidden behind a filter-looking "Grammatik" toggle, is now an always-visible dial tile under
the sentence card, with an **Umgeformt** view toggle, a corner "Neu" and two-column corrections.
Also standing law now: **the Himmelblau accent is a FILL, never an outline** (every filter/selection
rail and its opening button wears the neutral card edge). Prior s167 (PRs #711 to #715): one shared
Aufgabe-selection rule so the picker's counts stop lying, the exam-shaped task schema, and two
content waves taking the bank to **643 tasks**; `docs/plans/SCHREIBEN-OVERHAUL.md` carries the rest
of that roadmap. `.github/workflows/supabase.yml` deploys Edge Functions on merge, so backend
changes no longer need a CLI. Product name: **Genauly** (`genauly.de`)._

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

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,107
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **all** provenance rows are AI-drafted and `draft`, none human-verified
(human verification was reset to zero on 2026-07-22 at founder request, to restart the review pass;
see `strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
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

**Handoff after session 168 (2026-07-26): the Schreiben mobile pass. ALL MERGED AND LIVE**
(PRs **#717** to **#724**). Eight PRs across one theme: on a phone, every Schreiben surface now
rests at exactly one viewport, with its chrome pinned instead of drifting. Four of the eight are
Fokus preview rounds; the rework they produced is the largest change.

**1 · Kurz/Lang bottom chrome + writing field (#717, #718).** Founder, with two phone screenshots:
"the feedback button, auswerten button and the line below keep moving up and down when switching
between the toggles and tasks in Kurz and lang." Preview round explicitly waived.
- **Cause: the cluster was `sticky`, not `fixed`.** Sticky only sticks once the page actually
  scrolls; whenever the content fit the viewport it parked at the END of the content, which is a
  different height in Kurz than in Lang and moves with every Aufgabe. Now `fixed` above the nav,
  mirroring AppShell's `<main>` offsets. Verified identical y across Kurz, Lang, 3 re-rolls and the
  whole 150 ms tab slide.
- **`src/features/writing/useFillEditor.ts` (new) sizes the field.** Fills to the bottom chrome at
  rest, grows with the text (page scroll on) to 1.8x the resting height / the space the screen
  offers / 60% of the viewport, whichever is largest, then scrolls internally. `resize-none`;
  `rows` is only the pre-measurement fallback. Measured in JS deliberately: the trainer sits inside
  AppShell → WritingHub → AnimatePresence, none height-constrained, so a `dvh`/flex chain would
  have meant touching every other Schreiben surface.
- **Desktop caps the RESTING height** (#718, `desktopFieldCap`): Kurz = max(176px, 22% of the
  viewport), Lang = max(252px, 32%), because filling a whole desktop window "looks odd". Measured
  at 1440x900 / 1680x1050 / 1280x800: the field ends 220-480px above the window bottom, Lang ~45%
  taller than Kurz. Mobile is provably untouched (below `lg` the cap is skipped, so the formula
  reduces to the first pass exactly).

**2 · The accent is a FILL, never an outline (#719).** Founder: "wherever there is blue
filter/selection rail, instead of the bright blue outline … use a muted soft gray outline."
Both Schreiben rails (`WritingRail`, `GrammarRail`, incl. internal dividers) and the `accent`
Button variant that opens them now carry `border-border`, the neutral edge the Bibliothek
FilterRail and every card already wear; the Himmelblau fill is untouched. **Retires the s166
`accent-ink/70` workaround**, which existed only because no alpha of the 77%-light accent clears
the 3:1 UI floor on a near-white ground. Fix tiles and Verlauf detail tiles keep their accent edge
on purpose: they are content, not rails. Written into CLAUDE.md + `/design` §3; `check:contrast`
still green.

**3 · Fokus mobile rework (#720 to #723), four preview rounds.** The transform feature, which IS
the Satzlabor, hid behind a "Grammatik" toggle that sat where Kurz/Lang put a filter and looked
exactly like one. Rounds: r1 (move the panel elsewhere; **both variants rejected**) → r2 ideation
in chat ("it is a flow step, not a filter", four shapes offered, concept C picked) → r3 (two tiles;
Himmelblau treatment G picked) → r4 (full-height tiles, fixed KI line; "Option 2" picked with one
amendment). All rounds are in `preview/fokus-grammatik-mobile*.html`, one artifact URL redeployed
throughout: `https://claude.ai/code/artifact/dbc08865-71de-4ec2-94cb-99d23ca1d75b`.
- **Shipped (mobile only, desktop rail untouched):** toolbar toggle and collapsed panel gone. Two
  tiles fill the height between the switcher and the fixed bottom chrome (`measureMobile` sets
  minHeight). The new **`GrammarDials`** tile ("Grammatik" header + reset) carries one centered
  dial per axis: green dot = detected form, solid primary = target, tap opens a picker popover;
  dimmed but visible before a correction, so the feature announces itself. Its legend line doubles
  as the refusal/error slot.
- The sentence card owns every state behind a centered Original / Korrigiert / **Umgeformt**
  toggle: the transformed sentence renders in place, green-marked via a diff against the corrected
  one, with Hinweis + Nochmal + Vorlesen beneath. The separate transform card is desktop-only now.
  **"Neu"** (not "Neuer Satz") sits top-right, the Kurz/Lang dice corner, icon-only beside three
  segments. **Corrections are two text columns with a vertical separator** (founder amendment: no
  chip backgrounds on mobile; category eyebrow, struck original and green fix keep their colors).
- Feedback + Korrigieren float fixed above the KI line until a correction exists; the KI line is
  locked above the nav in every state and carries the "Noch N Wörter" hint while the sentence is
  too short.
- **Verified in headless Chromium at 390x844** with stubbed check/transform responses: zero page
  scroll and one KI-line position across idle → too-short → corrected → picker → Passiv → Passiv +
  Perfekt → view toggles → reset → Neu. Desktop anatomy unchanged.

**4 · The Aufgabe card caps instead of scrolling the page (#724).** The one limit the first pass
accepted (a third of tasks still scrolled a little at rest) is gone: when a long Aufgabe would push
the field below its floor, `useFillEditor` caps the card's prompt + Inhaltspunkte region by exactly
the shortfall and scrolls it internally (eyebrow + dice stay put; 96px minimum). Sampled 30
re-rolls per mode: **0/30 page scrolls at 390x844** in both modes, was up to 227px. A 360x640
viewport keeps a structural ~165px (field floor + minimum card + chrome exceed 640), down from
~430px. The cap math works off `scrollHeight`, never by un-capping to re-measure, so the
ResizeObserver watching the card cannot ping-pong.

**Cross-cutting lesson worth keeping:** all fixed mobile chrome in Schreiben is **portalled to
`<body>`**. WritingHub slides tab panels with an `x` transform, and a transformed ancestor becomes
the containing block for its `fixed` descendants, so without the portal every pinned layer
re-anchors to the panel mid-slide (and the measurement reads the wrong reserve on mount).

- **Files:** `src/features/writing/useFillEditor.ts` (new) ·
  `src/features/writing/fokus/GrammarDials.tsx` (new) ·
  `src/features/writing/GuidedWritingTrainer.tsx` · `src/features/writing/fokus/FokusTrainer.tsx` ·
  `src/features/writing/WritingRail.tsx` · `src/features/writing/fokus/GrammarRail.tsx` ·
  `src/components/ui/button.tsx` · `preview/fokus-grammatik-mobile{,-r2,-r3,-r4}.html` (new) ·
  `CLAUDE.md` · `.claude/skills/design/SKILL.md` · `docs/areas/SCHREIBEN.md`.
  **Gates (every PR):** typecheck · lint (0 errors) · test:unit **317/317** · build · check:bundle
  (117.2 kB) · check:contrast · lint:content.
- **Open, small:** Fokus's own `GrammarRail` panel layout (`layout="panel"`) is now dead code on
  mobile but still used by the desktop rail; the `panel` branch itself could be retired. Sub-660px
  viewports still page-scroll ~165px in Kurz/Lang, which is structural, not a bug.

**Handoff after session 167 (2026-07-25), part 3: the Branche answer + wave 2. MERGED AND LIVE**
(PRs **#714**, **#715**).

- **Founder: "when a thema is selected and then the Branche is changed, the aufgabe doesn't change."**
  Reproduced in the running app rather than reasoned from the code: the task IS re-drawn every time,
  on desktop and in the mobile panel. The cause was **coverage**, not the mechanism. Only **71 of 600**
  theme x Länge x Branche slots carried a task tagged for that Branche (11.8%), and **11 of 20 Themen
  had none**, so the fallback served the identical pool whichever Branche was picked, and the re-roll
  landed back on the same task about one time in twelve.
- **Fix (#714):** the scope-change re-roll now passes the current task as `exclude`, exactly like the
  dice, so a filter change is always visible (founder rule: controls always visibly act). Verified on
  `behoerde` (zero coverage, worst case): 14 consecutive Branche switches, 0 repeats.
- **Mobile panel stays open until closed (#715).** Picking a Thema used to dismiss it while every
  other scope left it open, so the one control that auto-closed was also the one that changed the
  most. Only the X and the toolbar toggle close it now.
- **Wave 2 (#715): 150 Branche-specific Aufgaben.** The five Beruf Themen that apply to EVERY industry
  (`meetings`, `scheduling`, `conflict`, `safety`, `customer`) x **all 15 Branchen** x both Längen, at
  B2. Bank: 493 -> **643 tasks**. **Branche slots filled: 71/600 (11.8%) -> 173/600 (28.8%).**
  Every variant satisfies the four-way-difference test (plan §8): different ADDRESSEE, GENRE, domain
  CONTENT POINTS and FACHLEXIK. Swapping the Branche noun breaks all of them, which was the point.
- **A test pins it:** for those five Themen every Branche must have a tagged task AND the draw must
  serve it rather than fall back past it. The task-count assertion is now self-maintaining (compares
  against pool totals) so it does not need bumping as the bank grows.
- **Still generic: 11 Themen** (`travel` + all 10 Alltag). For Alltag this is partly principled, since
  Branche means where you WORK and a Wohnen or Bank task is personal life. But some genuinely do vary
  (Krankmeldung in Schichtdienst vs Büro, Urlaubsantrag auf der Baustelle). That judgement call is
  **wave 3**, together with rewriting the remaining legacy tasks to carry Inhaltspunkte.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
