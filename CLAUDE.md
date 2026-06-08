# Genauly — B2 Beruf Speaking Prep

Interactive prep platform for the **Goethe / telc Deutsch B2 Beruf** speaking exam.
React + TypeScript + Vite SPA, deployed to GitHub Pages.

## Stack
- **Vite 6** + **React 18** + **TypeScript 5.7** (strict, project references via `tsc -b`)
- **Tailwind 3** (config in `tailwind.config.ts`), **Radix UI** primitives, **framer-motion**, **lucide-react**, **recharts**
- **zustand** for state, **react-router-dom 6** for routing
- No test framework configured yet.

## Commands
**Package manager is `pnpm`** (pinned via the `packageManager` field; lockfile is `pnpm-lock.yaml`).
Do NOT use `npm`/`yarn` — there is no `package-lock.json`. Run `pnpm install` after pulling.
- `pnpm dev` — local dev server
- `pnpm build` — `tsc -b && vite build` (run this to verify before pushing)
- `pnpm typecheck` — `tsc -b --noEmit`
- `pnpm preview` — preview the production build
- `pnpm audit` — check for dependency vulnerabilities (CI/security gate)

Notes: `.npmrc` sets `minimum-release-age` (24h supply-chain cooldown) and
`package-manager-strict`. pnpm blocks dependency build scripts by default (a supply-chain
protection); the build does NOT need any allowlisted scripts — keep it that way.

## Layout (`src/`)
- `data/` — content: `vocabulary.ts`, `redemittel.ts`, `dialogues.ts`, `examSets.ts`, `grammar.ts`, `themes.ts`
- `engine/` — logic: `dialogue.ts`, `scoring.ts`, `speech.ts`, `srs.ts` (spaced repetition)
- `store/` — zustand stores: `useProgressStore`, `useSessionStore`, `useSettingsStore`
- `lib/` — `hooks.ts`, `icons.ts`, `useTheme.ts`, `utils.ts`
- `types/index.ts` — shared types
- `router.tsx`, `App.tsx`, `main.tsx`

## Writing style (applies to ALL user-facing copy)
- **Avoid em dashes (`—`).** The founder dislikes them; they are an overused "AI" tell. Use them
  only when genuinely essential (and that is rare). For everything else, **rewrite or paraphrase**
  the sentence: split it into two with a period, or use a comma, colon, parentheses, or "so"/"and".
  Examples: "Build natural word order — a B2 marker." → "Build natural word order, a B2 marker.";
  "Noch keine Daten — reiche Text ein." → "Noch keine Daten. Reiche Text ein." This applies to
  every visible string: UI labels, onboarding/landing copy, content data (`src/data/*`), grammar
  explanations/glosses, toasts, and meta/manifest text. (The en dash `–` and bullet `·` are fine.)
- This rule is for all AI tools building this app. Prefer plain, natural punctuation over dashes.

## Content conventions
- **Themes**: ten workplace topics: meetings, scheduling, logistics, customer, conflict, project, technology, sustainability, safety, travel.
- **Vocabulary** (`src/data/vocabulary.ts`): each entry has `id`, article, plural, pronunciation hint, two example sentences, and related terms. Currently **354 words** (~34–39 per theme). When adding words: match the existing schema, keep ids unique, source from standard Goethe-Zertifikat B2 Beruf / telc Deutsch B2+ Beruf word fields, and verify with `pnpm build`.
- **Collocations** (`src/data/collocations.ts`): currently **120 Nomen-Verb pairs** (12 per theme). Schema: `id`, `noun`, `verb`, `full`, `en`, `register` (`neutral`|`formal`), `themeId`, `example {de, en}`. Keep ids unique (`c_` prefix + snake_case).
- **Grammar** (`src/data/grammar.ts`): currently **10 topics / 47 drills**. Schema: `GrammarTopic` with `id`, `group`, `title`, `titleDe`, `purpose`, `explanation`, `pattern`, `examples`, `pitfalls`, `drills[]`. Drills have `id`, `prompt`, `answer`, `options?` (MCQ) or no options (word-order), `explain`, `gloss`.

## UI conventions — modal / popup overlays (locked 2026-06-07)
The founder reviewed the sign-in dialog's backdrop and **locked this as the standard look for
all popups/modals/dialogs** going forward (don't reintroduce flat `bg-black/*` or heavy
`backdrop-blur` on new overlays):
- **Backdrop**: `bg-dialog-overlay` (defined in `tailwind.config.ts` → `backgroundImage`), a
  brand-tinted radial spotlight using the cool-slate `--shadow` token — lighter directly behind
  the card (`hsl(var(--shadow)/0.30)`), deepening toward the screen edges (`hsl(var(--shadow)/0.62)`).
  Adapts to dark mode automatically via the token. **No `backdrop-blur`.**
- **Card shadow**: `shadow-elevated-soft` (in `tailwind.config.ts` → `boxShadow`), a ~50%-strength
  version of `shadow-elevated` so the halo around the card stays gentle and doesn't bleed far
  past the border.
- Both are already wired into the shared `DialogContent`/`DialogPrimitive.Overlay` in
  `src/components/ui/dialog.tsx`, so any new dialog built on that primitive inherits this for
  free. Reuse those tokens (don't hand-roll a new overlay style) for sheets, drawers, and other
  popups too, adjusting only the radial center/stops if a different focal point is needed.

## Brand logo (locked 2026-06-08)
- The **default logo is the rounded gradient "G" with transparent corners.** The canonical asset
  is **`public/genauly-default-logo-transparent-corners.png`**; every in-app logo `<img>` points
  at it (sign-in dialog, mobile header `AppShell`, desktop `Sidebar`, landing, onboarding,
  `/privacy`). When adding a new logo spot, reuse this file (keep the CSS `rounded-lg`/`rounded-xl`
  + `shadow-glow` styling).
- `public/favicon.svg` is the rounded **vector source** of the same mark (used for the browser
  tab); `public/pwa-*.png` + `apple-touch-icon.png` are the PWA install / home-screen icons. They
  all show the **same** logo under their conventional, tooling-required filenames. Don't rename them.
- **Never make the app logo full-bleed.** A full-bleed square variant exists **only** for Google's
  OAuth consent screen (its circular crop reveals white through transparent corners). It is not in
  the repo. Full-bleed-everywhere was shipped then reverted (PRs #120/#121); keep the app on the
  rounded transparent logo.

## Legal pages & consent (GDPR)
- `/privacy` and `/terms` are bilingual (DE/EN) via the shared `LegalChrome` + `Section` in
  `src/features/legal/`. **German is the legally binding version** (English is a convenience
  translation, stated on each page). Every legal-copy edit MUST be mirrored in BOTH the `*De` and
  `*En` bodies, and follow the no-em-dash writing rule.
- **`/impressum` is built but TEMPORARILY HIDDEN** (`src/features/legal/Impressum.tsx` exists, but
  the route in `router.tsx` is commented out and all links, footer/Settings/privacy/terms, are
  removed) because the founder hasn't filled the real name/address yet and prefers not to. Re-enable
  once a business/service address is ready: uncomment the import + route, and restore the footer +
  Settings + privacy/terms Impressum links. A commercial public launch legally needs this live.
- Sign-up (`AuthDialog`) and the final onboarding step require an "I agree to AGB + Datenschutz"
  checkbox; consent is recorded via `recordConsent()` (`src/lib/consent.ts`) into the settings
  store, which rides into `profiles.settings` jsonb through `cloudSync`. **Keep `CONSENT_VERSION`
  in `src/lib/consent.ts` in lockstep with the `LAST_UPDATED` date on the legal pages**: when you
  materially change Terms/Privacy, bump both so a future re-consent prompt can detect the change.
- GDPR self-service lives in Settings: data export (`src/lib/dataExport.ts`), account deletion
  (`delete-account` Edge Function + `useAuthStore.deleteAccount`), per-submission delete
  (`WritingHistory` + `writing_delete_own` RLS policy, migration 0003). See `docs/PHASE2_SETUP.md`
  for the founder's one-time Supabase steps (deploy the function, run the migration, fill the
  Impressum + data-location placeholders).
- **No cookie-consent banner**: storage is functional-only (auth session + `b2beruf.*` settings/
  progress + PWA cache), which is consent-exempt under GDPR/§25(2) TTDSG. Only revisit if
  analytics/marketing storage is ever added.

## Deployment (GitHub Pages)
- **`main` is production.** Pushing/merging to `main` triggers `.github/workflows/pages.yml` (official Actions Pages deploy → builds `dist/` and publishes). This is the **only** deploy path — `pages.yml` is the sole workflow in `.github/workflows/`. (The old `deploy.yml`/`gh-pages` fallback no longer exists.)
- **Feature-branch pushes do NOT update the live site.** Work only goes live once merged to `main`. If the founder says "I don't see the change," the most likely cause is unmerged work on the active automation branch (currently `claude/genauly-blank-page-9biDi`).
- The remote sandbox cannot reach the live `*.github.io` site — verifying the deploy (Actions tab green + live site) is left to the user.

## Workflow notes
- Development branch for this work: **`claude/genauly-blank-page-9biDi`** (the active automation branch since session 9; `claude/loving-cray-lMLj3` was used through session 8 and is now stale). The branch name may be reassigned per session — **`main` is always the source of truth**; whatever branch a session is assigned, ship to production by opening a PR into `main` and merging (squash) — the merge triggers `pages.yml`.
- **Auto-ship preference (founder approved 2026-06-01):** the founder wants changes live, not parked on the branch. When a change is complete and `pnpm build` is green, **open a PR into `main` and squash-merge it yourself** (no need to ask each time) so it deploys. Use the GitHub MCP tools. The founder remains the one who confirms the live result.
- **Documentation (REQUIRED after every significant task or series of tasks):** after shipping a feature, a content expansion, or a batch of UX fixes, update `docs/PROJECT_STATUS.md` — the session log, content counts, and "Resume here" section. Commit and push the doc update on the dev branch, then merge it to `main` like any other change. This keeps the status doc accurate for future sessions.

### Post-deploy GitHub housekeeping (REQUIRED after every squash-merge)
Squash-merging rewrites history: `main` gets one new commit while the long-lived dev branch still holds the original unsquashed commits, so they diverge and the **next** PR conflicts (this bit us on PR #23). Run this realignment **every time** right after a merge:
1. `git fetch origin main`
2. `git checkout claude/genauly-blank-page-9biDi`
3. `git reset --hard origin/main` — make the dev branch identical to production.
4. `git push --force-with-lease origin claude/genauly-blank-page-9biDi` — `--force-with-lease` (never plain `--force`); safe because this is the sole dedicated automation branch with no other contributors. (Substitute the session's actual assigned branch if different.)
5. Confirm `git status` shows the branch level with `origin/main` and the working tree clean.

Also: don't pre-write the next PR's `_Last updated`/log entry against a stale branch — realign first, then make new edits. The founder still verifies the live result; the sandbox can't reach the `*.github.io` site or the Actions tab.

## Roadmap & status (read these when resuming)
- **`docs/PROJECT_STATUS.md`** — current status, all locked decisions, research findings, and the
  "resume here" pointer. Start here.
- **`docs/EXPANSION_PLAN.md`** — approved phased plan (Phase 1: grammar/collocations/leveled
  quizzes, client-side; Phase 2: Supabase auth + cloud sync + AI writing coach). Next work = Phase 1.
- **`docs/IMPLEMENTATION_PLAN.md`** — original from-scratch build plan (historical reference).
- Founder is **non-technical**; act as a decisive CTO who minimizes their ops burden and caps costs.
