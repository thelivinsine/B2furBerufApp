# Project Status

_Last updated: 2026-07-24 (session 158). **Nav-icon family harmonization (founder-picked):**
Praktisch = Wegweiser, Bibliothek = Buch mit Lesezeichen, Schreiben = Federspitze (accent rose → brand
blue), Fortschritt = Fortschrittsring; the dashboard toggle is now "Trainieren" with the Dumbbell; and
Fortschritt is pinned directly left of Einstellungen in the bottom bar for all users. Prior s159:
Fokus "Satzlabor" Wave 2 (Konjunktiv II + Zustandspassiv; `transform-sentence` redeployed 2026-07-24, live).
Product name: **Genauly** (`genauly.de`)._

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
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 158 (2026-07-24). Nav-icon family harmonization + Trainieren toggle,
branch `claude/schreiben-icon-design-cz21ts`, PRs #679-#683.** A preview-first icon session: the
founder picked every mark by letter from tab-bar mockups (`preview/schreiben-icon-harmony{,-r2}.html`,
`praktisch-icon-vorschlaege.html`, `bibliothek-icon-vorschlaege.html`,
`fortschritt-icon-vorschlaege.html`), then everything was implemented in one pass:
- **New route marks** (`route-icons.tsx` + `NORM` boxes): Praktisch = **Wegweiser** signpost (pick I,
  replaced the compass), Bibliothek = **Buch mit Lesezeichen** (pick P, replaced the lying stack),
  Schreiben = **Federspitze** nib (pick E; `nav-items.ts` accent moved rose `#f43f5e` → brand blue
  `#3D74ED` with it), Fortschritt = **Fortschrittsring** (pick S, replaced the bar chart). All marks
  stay two-tone with neon-cyan `#22d3ee` companions.
- **Trainieren toggle:** the Praktisch dashboard toggle "Lernen" renamed to **"Trainieren"** with the
  lucide Dumbbell restored (`Dashboard.tsx`, `LernenBook` removed; admin H8 label; Help-hub line).
- **Fortschritt pinned:** `BottomTabBar` now keeps Fortschritt directly LEFT of Einstellungen for
  every user (`REORDERABLE = ["/library", "/writing"]` + `FIXED_LAST_CONTENT`); older persisted
  orders normalise at read time; edit-mode reorder covers only Bibliothek + Schreiben.
- **Verified live** (vite preview + Playwright): all five tabs render the picked marks at equal
  widths; screenshots match the approved previews. Docs: `docs/areas/PRAKTISCH-NAV.md` updated.
- **Gates:** build · check:bundle **116.9 kB** · test:unit green.
- **Next:** nothing pending from this session; the old `preview/route-icons-preview.svg` reference
  sheet is stale (pre-s158 marks) if anyone wants to regenerate it.

**Handoff after session 159 (2026-07-24). Fokus "Satzlabor" Wave 2 (Konjunktiv II + Zustandspassiv),
branch `claude/grammar-dimensions-transformations-l3ib3m`, PR #678 merged.** Started as a
grammar-dimensions brainstorm (four research agents) -> `docs/plans/GRAMMAR_DIMENSIONS_BRAINSTORM.md`
(dimension catalog, feasibility tiers, B2-marker ranking, guardrails, Now/Next/Later/Skip roadmap) +
two previews (`preview/grammar-dimensions-satzlabor.html`, `-catalog.html`) + a combined claude.ai
artifact (daa4dbb6). Then built the "easy half":
- **Konjunktiv II** as a new **Modus** rail axis: `mood` promoted from the pinned `DEFAULT_MOOD` to a
  real, combinable axis across `grammarDimensions.ts` / `useFokusMachine.ts` / `GrammarRail.tsx` /
  `FokusTrainer.tsx` (rail is data-driven, so the Modus section renders itself).
- **Zustandspassiv** as a third Genus-Verbi pill (data-only value add): a detected `passiv_zustand`
  now maps to its own pill instead of null; also fixed a phantom "Aktiv looks selected" quirk on a
  real Zustandspassiv sentence. The copula safeguard (misread "Ich bin krank" -> aktiv) stays in the
  check-sentence prompt.
- **Edge function:** `transform-sentence` prompt gained K-II (synthetic-vs-wuerde) + Vorgang-vs-Zustand
  rules + examples; `PROMPT_VERSION` 2 -> 4. **Founder redeployed `transform-sentence` on 2026-07-24**
  via the Supabase dashboard code editor (single self-contained file, no local clone / CLI needed), so
  the improved output is live. The pills also worked before that against the live function (its enums
  already accept konjunktiv2 / passiv_zustand as targets).
- **Copy:** rail legend simplified to "Gruener Punkt = dein Satz." / "Tippe eine andere Form, um ihn
  umzuwandeln."
- **Held (operation-style, need a NEW edge-function contract, not the tuple):** Register (Sie<->du),
  Satzbau (HS<->NS), Nominalstil, Relativ<->Partizip. Plusquamperfekt deferred (needs a temporal
  anchor). Roadmap: brainstorm-doc section 6.1.
- **Merge note:** `main` force-advanced 10 commits (CLAUDE.md restructure #671, prompt-log rotation,
  sessions 155-158) while this branch was open; merged it in - code auto-merged (mood/copy edits +
  main's cosmetic tweaks both intact), the 4 doc conflicts resolved to main's new structure and the
  docs re-applied against it (this handoff, `docs/areas/SCHREIBEN.md` Wave-2 axes, prompt-log s159).
- **Gates:** typecheck / test:unit **289/289** / lint 0 errors / build / check:bundle **112 kB** /
  lint:content. Edge function is Deno (not deployed from the sandbox).

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
