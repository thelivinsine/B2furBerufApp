# Project Status

_Last updated: 2026-07-24 (session 163). **Fokus correction fix:** a word that was only reordered no
longer shows as a contradictory "remove X" + "add X"; the client-side word-diff now collapses it into
one "Wortstellung" (word-order) fix (PR #695). Prior s162 (concurrent): `main` branch protection
ruleset enabled (restrict deletions + block force pushes, no required approvals, so auto-ship is
unaffected; see `PROJECT_FOUNDATION.md`). Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 161 (2026-07-24). Quiz-quality pass on the composed session, branch
`claude/word-verification-nl4m26`, PR #687 (content) + PR #691 (engine/loot).** Started
from founder screenshots of individual session cards; each turn diagnosed one exercise type and fixed it:
- **Content (merged, PR #687):** the `v_soll_ist_vergleich` English gloss reworded `target-actual
  comparison` → `target/planned vs. actual comparison`; and typed-cloze ("Lücke") cards, which showed
  only the blanked sentence (unanswerable, many words fit), now render the target word's English
  meaning as a muted "Hinweis:" line under the sentence (`SessionPlayer.tsx` TypingBlock).
- **Plural questions (`engine/quiz.ts`):** MCQ distractors are now generated from the noun's OWN stem
  (`sameStemPluralForms`: -e/-en/-n/-er/-s, Nullplural, umlaut variants) so all four options share the
  stem and only the correct pattern distinguishes them (was: distractors from unrelated nouns, an A1
  recognition move). Added a **typed** plural variant (new `pluralType` `QuizQuestion` kind +
  `TypedView` renderer in `QuestionViews.tsx`, graded by the existing typed grader); ~half of plural
  slots are typed. **Competency gate:** at difficulty 3 (C1) plural questions are limited to tricky
  plurals (`isTrickyPlural`: umlaut / -er / Nullplural / stem-changing like Praxis→Praxen); predictable
  -e/-en/-n/-s plurals drop out. Plural now also appears in the d3 branch.
- **Odd-one-out / Ausreißer (`engine/quiz.ts` `oddOneOutQ`):** added a **part-of-speech-matched**
  flavour (all four options share the anchor's POS, mixed ~50/50 with the old mixed-POS style) so the
  topic is the only discriminator; and the odd word must now be **genuinely unrelated** (different
  theme AND no shared `related` link in either direction), so a half-belonging word (abdichten next to
  Blech) can't be the answer. Probe over 1,200 questions: 64% fully POS-matched, 0 linked outsiders.
- **Round-summary loot cards (`SessionPlayer.tsx` `LootCard`):** dropped the coral reward wash (read
  like wrong answers) for plain white cards; a level-up is now a Himmelblau `bg-accent/20` "Lv ↑" pill,
  unchanged words keep a muted level, the "Gesammelt" eyebrow moves coral → brand blue. Trophy ring
  stays coral (the sanctioned celebration accent). Founder picked this variant (C) from a 4-shade preview.
- **Gates:** typecheck / test:unit **289/289** / lint 0 errors / build green. Previews:
  `preview/cloze-hint-preview.html`, `plural-variants-preview.html`, `loot-shade-preview.html`.
- **Next:** nothing pending. Held ideas from the discussion: odd-one-out option 3 (make it rarer /
  reserve for cleanly separable clusters) if the type still feels fuzzy; a "type it" plural could gain
  an "almost" partial-credit tier if strict grading feels harsh.

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
