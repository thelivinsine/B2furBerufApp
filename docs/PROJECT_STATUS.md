# Project Status

_Last updated: 2026-07-24 (session 166). **Schreiben mobile action cluster de-collided:** the
floating Feedback + Auswerten/Korrigieren cluster carries no bar chrome, so a disabled
(`opacity-50`) button let the card text behind it bleed through and the card-tail "Noch N
Wörter" hint sat exactly under the pinned cluster. Controls now get an opaque backing and the
hint rides the cluster's caption slot (`src/features/writing/floatingCluster.ts`). Prior s165:
Control Center layout aligned to `AppShell` + prominent top back-button + Prüfmodus note-save.
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

**Handoff after session 166 (2026-07-24). Mobile floating action cluster no longer collides with
the card underneath (Schreiben), branch `claude/button-overlap-fix-s7fl28`.** Founder screenshot of
`/writing` (Lang, dark, mobile): the "Feedback" pill, the "Auswerten" button and the card's
"Noch N Wörter schreiben, dann kannst du auswerten." line all rendered on top of each other.
- **Root cause (two halves).** The mobile cluster is `sticky` with NO bar chrome (founder s159/s160),
  so it floats straight over the content cards. (a) With 0 words the Auswerten button is `disabled`
  → the base `disabled:opacity-50` made it half-transparent, so the card text behind bled *through*
  the button; `variant="outline"` (`bg-surface/50`) has the same problem. (b) The hint line is the
  LAST element of the editor card, i.e. exactly where the pinned cluster sits, so the collision was
  guaranteed whenever the button was inactive. Padding cannot fix this: a bottom-pinned sticky
  element floats over content at every scroll position except the very end.
- **Fix (both writing trainers, shared contract).** New `src/features/writing/floatingCluster.ts`
  exports `floatingSlot` (opaque `bg-background` backing behind each control) and `floatingNote`
  (`bg-background/90` + `backdrop-blur-sm` plate behind the caption, matching the other mobile bars).
  `--background` equals the page stops, so both are invisible against the page ground and only mask
  where they float over a card. The transient "Noch N Wörter …" hint moved from the card tail into
  the cluster's single caption slot (hint while too short, Art. 50 note once evaluating is possible,
  never both); the card keeps it on `lg:` only, where there is no cluster.
- **Files:** `src/features/writing/floatingCluster.ts` (new), `GuidedWritingTrainer.tsx`,
  `fokus/FokusTrainer.tsx`, `docs/areas/SCHREIBEN.md`.
- **Verified in a real mobile viewport** (Playwright, 360×800 @3x, light + dark, cluster parked
  pinned over the editor card): buttons opaque, caption legible, nothing overlapping in any state
  (too short / ready / Fokus). The other four mobile bars (Wörter, Kollokationen, Redemittel,
  Grammatik) already carry `bg-background/90 backdrop-blur` and needed no change.
- **Gates:** typecheck · lint (0 errors) · test:unit **293/293** · build · check:bundle (117.0 kB),
  all green.

**Handoff after session 165 (2026-07-24). Control Center layout brought inline with the app +
prominent top back-button, branch `claude/control-center-layout-margins-yn6nvd`.** The founder asked
why margins/layout jump drastically when moving from the app into the Control Center. Root cause:
`AdminShell` renders outside `AppShell` and had drifted, wrapping the whole shell in a centered
`mx-auto max-w-[1240px]` grid (`256px 1fr`) with an uncapped, left-aligned content column and a
sidebar that was a grid column rather than an edge-pinned rail.
- **Fix (no preview, founder-waived):** `AdminShell` now mirrors `AppShell` exactly. Desktop sidebar
  is a `fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-surface/60 backdrop-blur-xl lg:block` rail;
  content wrapper is `lg:pl-64`; `<main>` is `mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8` — same
  width, centering, and gutters as the app. Below `lg` the rail becomes a top nav bar (admin has no
  bottom tab bar).
- **Back-to-app moved to the top** of the nav panel (was a small muted bottom link) as a Himmelblau
  accent tile (`border-accent/40 bg-accent/15 text-accent-ink`, dark `/25` `/10`) + ArrowLeft, so it
  pops against the neutral nav rows; a compact "App" copy sits top-right on the mobile bar.
- **Follow-up (same session): Prüfmodus note save.** The founder asked "where is the save button?" on
  the review cockpit's note box. It saves with the Approve/Reject decision only (no standalone save; the
  N button just opens the box). Added a **„Notiz speichern"** button (note-only `onChange`, keeps the item
  in the queue undecided, ⌘/Ctrl+Enter shortcut) + a helper line explaining both save paths. Reused the
  existing note-only path in `useWorkbench`.
- **Files:** `src/features/admin/AdminShell.tsx`, `src/features/admin/Pruefmodus.tsx`. **Gates:**
  typecheck · lint (0 errors) · build, green.
- **Cannot live-verify** (`/admin` is founder-auth-gated in the sandbox); founder verifies live (PWA:
  hard-refresh past a stale SW).

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
