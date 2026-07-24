# Project Status

_Last updated: 2026-07-24 (session 164). **Review harmonised into the Control Center:** the founder
review table moved out of the retired `/sources/werkbank` page into the `/admin/pruefen` Prüfen page as
a Warteschlange / Alle Inhalte sliding-pill switcher, both backed by one shared `useWorkbench` store;
the table cell gained a Freigeben/Ablehnen control + a note Save button. Also fixed the note/approve
save race and applied the founder's 13 hash-matched approvals (3 rejects + 1 re-review). Prior s163:
Fokus word-order correction collapse (PR #695); s162: `main` branch protection ruleset. Product name:
**Genauly** (`genauly.de`)._

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
- [ ] **Redeploy `transform-sentence` (Supabase dashboard) to activate the "Nochmal" regenerate**
      button (s163). Self-contained file; same steps as the s159 redeploy. Until then the button
      returns the cached canonical sentence (no visible change).
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 164 (2026-07-24). Review harmonised into the Control Center + note/approve
save race fixed + 13 approvals applied, branch `claude/apply-review-decisions-lw5azm`.** (Branched off
`main` at s160; s161–163 landed from parallel sessions while this was open, so this is logged as 164.)
Three linked pieces:
- **Save-race fix (`useWorkbench`).** The founder asked whether a note typed before approving is saved.
  It was NOT reliable: the note and the checkbox saved separately, but both `onChange` calls read the
  SAME stale `reviews` snapshot and each `upsert`ed the whole row, so typing a note then approving wrote
  the row twice off the same base and the approve write (empty comment) clobbered the note. Fix: merge
  from an always-latest `reviewsRef` + serialise writes per `content_id` (`writeChains`).
- **13 approvals applied.** `pnpm apply:reviews --from` on the founder's browser export (17 decisions):
  13 hash-matched approvals flipped draft→verified + stamped + lint green (commit `5188af2`); 3 rejects
  → `docs/reports/review-defects.md`; 1 (`v_besprechung`, null fingerprint) held for re-review.
- **Harmonisation (Variant A, founder-picked).** The founder review table moved OUT of the retired
  `/sources/werkbank` page INTO the Control Center's **Prüfen** page (`/admin/pruefen`) as a two-segment
  sliding-pill switcher: **Warteschlange** (priority queue + keyboard cockpit) · **Alle Inhalte** (the
  full `AdminWorkbench` table). One shared `useWorkbench` store now backs BOTH. The table cell gained a
  segmented **Freigeben/Ablehnen** control (reject was impossible in the table before) + a wider note
  field with an explicit **Save button** (appears when edited; still saves on blur/Enter). Redundant
  queue header/status copy removed. `/sources` links admins into `/admin/pruefen?view=table`.
- **Files:** `src/features/legal/useWorkbench.ts` (new), `AdminWorkbench.tsx`, `Pruefmodus.tsx`,
  `Sources.tsx`, `router.tsx`, `tests/adminWorkbench.test.tsx`, `preview/control-center-review.html`.
- **Gates:** typecheck · lint (0 errors) · test:unit **291/291** · build · check:bundle **116.6 kB** ·
  lint:content, all green. Decisions in `docs/DECISIONS.md`; area guide `docs/areas/LEGAL-ADMIN.md`.
- **Cannot live-verify** (`/admin` is founder-auth-gated in the sandbox); founder verifies live (PWA:
  hard-refresh past a stale SW). **Next:** re-approve `v_besprechung`; triage the 3 rejects.

**Handoff after session 163 (2026-07-24). Fokus correction: collapse a moved word into one
Wortstellung fix, branch `claude/disclaimer-text-layout-5zq5g0`, PR #695.** Numbered 163 (a
concurrent branch-protection session already took 162). Two founder screenshots of the Fokus screen:
- **"here's a mistake by ai" — not an AI error.** The corrected sentence was right; the fix tiles
  are a client-side LCS word-diff (`wordDiff.ts`) that rendered a *moved* word ("heute") as a pure
  deletion in its old slot + a pure insertion in its new slot, reading as a contradictory remove+add.
  `collapseMoves()` now pairs a same-word del/ins into ONE `{category:"Wortstellung", moved:true}`
  change; `FokusTrainer` renders a moved change as the word once (green, no strike/arrow). Two new
  `wordDiff.test.ts` cases. Gates green; shipped PR #695.
- **"why does Zustandspassiv wrap" — left as-is (founder decision).** Genuine width wrap on the
  256px desktop rail (reproduced in `preview/genus-verbi-wrap.html`); not a bug, no change.
- **"Nochmal"/regenerate button — BUILT, needs a founder redeploy to go live.** Founder chose the
  capped/cheap variant (cap = 2 alternatives). `transform-sentence` gains an optional `variant`
  (server-clamped 0..2): variant 0 keeps the original cache key byte-for-byte; variants 1..2 get
  their own global cache keys + an "alternative phrasing" instruction (Gemini temperature 0.9 for
  variants only). Client (`useFokusMachine.regenerate()` + a RefreshCw "Nochmal" button in the
  transform box) cycles 0→1→2→0, generating each new variant once (≤ 2 paid calls per sentence+
  selection, ever) then cycling the cached versions for free. **ACTION: the founder must redeploy
  `transform-sentence` via the Supabase dashboard** (self-contained file, same as the s159 redeploy);
  until then the button returns the cached canonical sentence (no visible change).

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
