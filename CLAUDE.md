# Genauly — B2 Beruf Speaking Prep

Interactive prep platform for the **Goethe / telc Deutsch B2 Beruf** speaking exam.
React + TypeScript + Vite SPA, deployed to GitHub Pages.

## Stack
- **Vite 6** + **React 18** + **TypeScript 5.7** (strict, project references via `tsc -b`)
- **Tailwind 3** (config in `tailwind.config.ts`), **Radix UI** primitives, **framer-motion**, **lucide-react**, **recharts**
- **zustand** for state, **react-router-dom 6** for routing
- No test framework configured yet.

## Commands
- `npm run dev` — local dev server
- `npm run build` — `tsc -b && vite build` (run this to verify before pushing)
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run preview` — preview the production build

## Layout (`src/`)
- `data/` — content: `vocabulary.ts`, `redemittel.ts`, `dialogues.ts`, `examSets.ts`, `grammar.ts`, `themes.ts`
- `engine/` — logic: `dialogue.ts`, `scoring.ts`, `speech.ts`, `srs.ts` (spaced repetition)
- `store/` — zustand stores: `useProgressStore`, `useSessionStore`, `useSettingsStore`
- `lib/` — `hooks.ts`, `icons.ts`, `useTheme.ts`, `utils.ts`
- `types/index.ts` — shared types
- `router.tsx`, `App.tsx`, `main.tsx`

## Content conventions
- **Themes**: ten workplace topics — meetings, scheduling, logistics, customer, conflict, project, technology, sustainability, safety, travel.
- **Vocabulary** (`src/data/vocabulary.ts`): each entry has `id`, article, plural, pronunciation hint, two example sentences, and related terms. Currently **354 words** (~34–39 per theme). When adding words: match the existing schema, keep ids unique, source from standard Goethe-Zertifikat B2 Beruf / telc Deutsch B2+ Beruf word fields, and verify with `npm run build`.
- **Collocations** (`src/data/collocations.ts`): currently **120 Nomen-Verb pairs** (12 per theme). Schema: `id`, `noun`, `verb`, `full`, `en`, `register` (`neutral`|`formal`), `themeId`, `example {de, en}`. Keep ids unique (`c_` prefix + snake_case).
- **Grammar** (`src/data/grammar.ts`): currently **10 topics / 47 drills**. Schema: `GrammarTopic` with `id`, `group`, `title`, `titleDe`, `purpose`, `explanation`, `pattern`, `examples`, `pitfalls`, `drills[]`. Drills have `id`, `prompt`, `answer`, `options?` (MCQ) or no options (word-order), `explain`, `gloss`.

## Deployment (GitHub Pages)
- **`main` is production.** Pushing/merging to `main` triggers `.github/workflows/pages.yml` (official Actions Pages deploy → builds `dist/` and publishes). This is the **only** deploy path — `pages.yml` is the sole workflow in `.github/workflows/`. (The old `deploy.yml`/`gh-pages` fallback no longer exists.)
- **Feature-branch pushes do NOT update the live site.** Work only goes live once merged to `main`. If the founder says "I don't see the change," the most likely cause is unmerged work on `claude/loving-cray-lMLj3`.
- The remote sandbox cannot reach the live `*.github.io` site — verifying the deploy (Actions tab green + live site) is left to the user.

## Workflow notes
- Development branch for this work: **`claude/loving-cray-lMLj3`**. Ship to production by opening a PR into `main` and merging (squash) — the merge triggers `pages.yml`.
- **Auto-ship preference (founder approved 2026-06-01):** the founder wants changes live, not parked on the branch. When a change is complete and `npm run build` is green, **open a PR into `main` and squash-merge it yourself** (no need to ask each time) so it deploys. Use the GitHub MCP tools. The founder remains the one who confirms the live result.
- **Documentation (REQUIRED after every significant task or series of tasks):** after shipping a feature, a content expansion, or a batch of UX fixes, update `docs/PROJECT_STATUS.md` — the session log, content counts, and "Resume here" section. Commit and push the doc update on the dev branch, then merge it to `main` like any other change. This keeps the status doc accurate for future sessions.

### Post-deploy GitHub housekeeping (REQUIRED after every squash-merge)
Squash-merging rewrites history: `main` gets one new commit while the long-lived dev branch still holds the original unsquashed commits, so they diverge and the **next** PR conflicts (this bit us on PR #23). Run this realignment **every time** right after a merge:
1. `git fetch origin main`
2. `git checkout claude/loving-cray-lMLj3`
3. `git reset --hard origin/main` — make the dev branch identical to production.
4. `git push --force-with-lease origin claude/loving-cray-lMLj3` — `--force-with-lease` (never plain `--force`); safe because this is the sole dedicated automation branch with no other contributors.
5. Confirm `git status` shows the branch level with `origin/main` and the working tree clean.

Also: don't pre-write the next PR's `_Last updated`/log entry against a stale branch — realign first, then make new edits. The founder still verifies the live result; the sandbox can't reach the `*.github.io` site or the Actions tab.

## Roadmap & status (read these when resuming)
- **`docs/PROJECT_STATUS.md`** — current status, all locked decisions, research findings, and the
  "resume here" pointer. Start here.
- **`docs/EXPANSION_PLAN.md`** — approved phased plan (Phase 1: grammar/collocations/leveled
  quizzes, client-side; Phase 2: Supabase auth + cloud sync + AI writing coach). Next work = Phase 1.
- **`docs/IMPLEMENTATION_PLAN.md`** — original from-scratch build plan (historical reference).
- Founder is **non-technical**; act as a decisive CTO who minimizes their ops burden and caps costs.
