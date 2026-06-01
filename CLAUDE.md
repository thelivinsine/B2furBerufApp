# B2 Beruf Speaking Prep

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
- **Vocabulary** (`src/data/vocabulary.ts`): each entry has `id`, article, plural, pronunciation hint, two example sentences, and related terms. Currently **293 words** (~25–33 per theme). When adding words: match the existing schema, keep ids unique, source from standard Goethe-Zertifikat B2 Beruf / telc Deutsch B2+ Beruf word fields, and verify with `npm run build`.

## Deployment (GitHub Pages)
- **`main` is production.** Pushing/merging to `main` triggers `.github/workflows/pages.yml` (official Actions Pages deploy → builds `dist/` and publishes). This is the **only** deploy path — `pages.yml` is the sole workflow in `.github/workflows/`. (The old `deploy.yml`/`gh-pages` fallback no longer exists.)
- **Feature-branch pushes do NOT update the live site.** Work only goes live once merged to `main`. If the founder says "I don't see the change," the most likely cause is unmerged work on `claude/determined-euler-xUDrh`.
- The remote sandbox cannot reach the live `*.github.io` site — verifying the deploy (Actions tab green + live site) is left to the user.

## Workflow notes
- Development branch for this work: **`claude/determined-euler-xUDrh`**. Ship to production by opening a PR into `main` and merging (squash) — the merge triggers `pages.yml`.
- **Auto-ship preference (founder approved 2026-06-01):** the founder wants changes live, not parked on the branch. When a change is complete and `npm run build` is green, **open a PR into `main` and squash-merge it yourself** (no need to ask each time) so it deploys. Use the GitHub MCP tools. The founder remains the one who confirms the live result.

## Roadmap & status (read these when resuming)
- **`docs/PROJECT_STATUS.md`** — current status, all locked decisions, research findings, and the
  "resume here" pointer. Start here.
- **`docs/EXPANSION_PLAN.md`** — approved phased plan (Phase 1: grammar/collocations/leveled
  quizzes, client-side; Phase 2: Supabase auth + cloud sync + AI writing coach). Next work = Phase 1.
- **`docs/IMPLEMENTATION_PLAN.md`** — original from-scratch build plan (historical reference).
- Founder is **non-technical**; act as a decisive CTO who minimizes their ops burden and caps costs.
