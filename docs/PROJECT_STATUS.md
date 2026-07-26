# Project Status

_Last updated: 2026-07-26 (session 168). **Schreiben Kurz/Lang: the bottom chrome stopped moving
and the writing field now fills the screen.** The Feedback/Auswerten row and its caption were
`sticky`, so whenever the page fit the viewport they parked at the end of the content, at one
height in Kurz and another in Lang. They are now `fixed` above the nav (portalled to `<body>`, so
WritingHub's tab-slide transform cannot re-anchor them), and a new `useFillEditor` hook sizes the
textarea to the space actually left: fills it at rest with no page scroll, grows with the text,
then scrolls internally. On desktop that resting height is capped (Kurz shorter than Lang, neither
filling the window); mobile still fills. Also this session: **the Himmelblau accent is a fill, never
an outline** (every filter/selection rail and its opening button now wears the neutral card edge),
and **the Fokus mobile rework shipped after four preview rounds**: the hidden Grammatik panel
became an always-visible dial tile below the sentence card, with an Umgeformt view toggle, a
corner "Neu", two-column corrections and the same fixed bottom chrome as Kurz/Lang. Prior s167 (merged and live, PRs #711 to #715): one shared Aufgabe-selection
rule so the picker's counts stop lying, the exam-shaped task schema, and two content waves taking the
bank to **643 tasks**; `docs/plans/SCHREIBEN-OVERHAUL.md` carries the rest of that roadmap.
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

**Handoff after session 168 (2026-07-26): Kurz/Lang bottom chrome pinned, writing field sized to
the screen.** Founder (with two phone screenshots): "the feedback button, auswerten button and the
line below keep moving up and down when switching between the toggles and tasks in Kurz and lang.
Make them fixed at the bottom below. Also, the writing field below the aufgabe should occupy the
rest of the space without any scrolling." Preview round explicitly waived.

- **Cause of the jumping: the cluster was `sticky`, not `fixed`.** A sticky element only sticks
  once the page actually scrolls; whenever the content fit the viewport it simply parked at the end
  of the content, which is a different height in Kurz than in Lang and moves with every Aufgabe.
  It is now `fixed` above the nav, mirroring AppShell's `<main>` offsets so it stays in the content
  column. Verified: the cluster sits at the identical y in Kurz, in Lang, across 3 re-rolls, and
  through the whole 150 ms tab slide.
- **Both fixed layers (cluster + desktop Art. 50 line) are portalled to `<body>`.** WritingHub
  slides tab panels with an `x` transform and a transformed ancestor becomes the containing block
  for its `fixed` descendants, so without the portal they re-anchor to the panel mid-slide.
- **`src/features/writing/useFillEditor.ts` (new) sizes the field.** Fills the gap between the
  Aufgabe card and the bottom chrome at rest (no page scroll), grows with the text (page scroll on)
  to 1.8x the resting height or 60% of the viewport, then stops and scrolls internally. `rows` no
  longer decides anything and the field is `resize-none`. Measured in JS deliberately: the trainer
  sits inside AppShell → WritingHub → AnimatePresence, none of them height-constrained, so a
  `dvh`/flex chain would have meant touching every other Schreiben surface.
- **The one honest limit:** on a phone, a long Aufgabe (one carrying Inhaltspunkte) can occupy
  47-52% of the viewport on a 390x844 device and 65-72% on a 360x640 one. Sampled 30 re-rolls per
  mode per size: about two thirds of tasks now fit with no page scroll at all; the rest keep a
  usable field (floor = max(160px, 22% of the viewport)) and the page scrolls a little instead of
  the field collapsing to four lines. Fully removing that would mean capping the Aufgabe card
  itself with internal scroll, which the founder did not ask for.
- **Fokus was left alone** (the founder named Kurz and Lang): it still uses the in-flow sticky
  cluster. If the same jumping is reported there, the fix is the same three changes.
- **Follow-up in the same session: the desktop field is capped.** Founder: "for desktop view
  specifically.. it's looks odd to fill up the entire screen. reduce it to some extent. Keep kurz
  writing field shorter than the lang but both never occupying the whole screen. Mobile view stays
  intact." From `lg` up the RESTING height is now capped (`desktopFieldCap`): Kurz = max(176px,
  22% of the viewport), Lang = max(252px, 32%). Measured at 1440x900 / 1680x1050 / 1280x800: the
  field ends 220-480px above the window bottom and Lang runs ~45% taller than Kurz. **Mobile is
  provably untouched** — below `lg` the cap is skipped, so `rest === available` and the formula
  reduces to exactly what shipped in the first pass. The growth ceiling gained `available` as a
  third term, because on desktop `rest` is deliberately short of the screen and 1.8x a capped
  height would have started internal scrolling while empty window was still going spare.
- **Second follow-up: the accent is a FILL, never an outline.** Founder: "wherever there is blue
  filter/selection rail, instead of the bright blue outline which is currently the case, use a
  muted soft gray outline for the buttons or rails" (preview round explicitly waived). Both
  Schreiben rails (`WritingRail`, `GrammarRail`, incl. their internal dividers) and the `accent`
  Button variant that opens them now carry `border-border`, the same neutral edge the Bibliothek
  FilterRail and every card already wear. The Himmelblau fill is untouched. This **retires the
  s166 `accent-ink/70` workaround**, which existed only because no alpha of the 77%-light accent
  clears the 3:1 UI floor on a near-white ground. Fix tiles and Verlauf detail tiles keep their
  accent edge on purpose: they are content, not rails. `check:contrast` still green.
- **Files:** `src/features/writing/useFillEditor.ts` (new) ·
  `src/features/writing/GuidedWritingTrainer.tsx` · `src/features/writing/WritingRail.tsx` ·
  `src/features/writing/fokus/GrammarRail.tsx` · `src/components/ui/button.tsx` ·
  `preview/fokus-grammatik-mobile.html` (new) · `CLAUDE.md` · `.claude/skills/design/SKILL.md` ·
  `docs/areas/SCHREIBEN.md`. **Gates:** typecheck · lint (0 errors) · test:unit **317/317** ·
  build · check:bundle (117.2 kB) · check:contrast · lint:content.

**Fokus mobile rework: SHIPPED after four preview rounds.** The transform feature, which IS the
Satzlabor, hid behind a "Grammatik" toggle that sat where Kurz/Lang put a filter and looked exactly
like one. Rounds: r1 (move the panel; both variants rejected) → r2 ideation ("it is a flow step,
not a filter"; concept C picked) → r3 (two tiles; Himmelblau treatment G picked) → r4 (full-height
tiles, fixed KI line; "Option 2" picked with one amendment). All rounds live in
`preview/fokus-grammatik-mobile*.html`, one artifact URL redeployed throughout.
- **What shipped (mobile only, desktop untouched):** the toolbar toggle and collapsed panel are
  gone. Two tiles fill the height between the switcher and the fixed bottom chrome (`measureMobile`
  minHeight; no resting page scroll). The new **`GrammarDials`** tile ("Grammatik" header + reset)
  carries one centered dial per axis: green dot = detected form, solid primary = target, tap opens
  a picker popover; dimmed but visible before a correction. The sentence card owns every state
  behind a centered Original / Korrigiert / **Umgeformt** toggle (transformed sentence in place,
  green-marked via diff against the corrected one, Hinweis + Nochmal + speak beneath; the separate
  transform card below is desktop-only now). **"Neu"** sits top-right (the Kurz/Lang dice corner;
  icon-only beside three segments). **Corrections are two text columns with a vertical separator**
  (founder amendment: no chip backgrounds on mobile; colors kept). Feedback + Korrigieren float
  fixed above the KI line until a correction exists; the KI line is locked above the nav in every
  state and carries the "Noch N Wörter" hint while the sentence is too short. All fixed chrome is
  portalled to `<body>` (the WritingHub tab-slide transform lesson).
- **Verified in headless Chromium at 390x844** with stubbed check/transform responses: zero page
  scroll and one KI-line position across idle → too-short → corrected → picker → Passiv → Passiv +
  Perfekt → back to Korrigiert → reset → Neu; desktop screenshot byte-identical anatomy.
- **Files:** `src/features/writing/fokus/GrammarDials.tsx` (new) ·
  `src/features/writing/fokus/FokusTrainer.tsx` · `docs/areas/SCHREIBEN.md`.
  **Gates:** typecheck · lint (0 errors) · test:unit **317/317** · build · check:bundle (117.2 kB).

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
