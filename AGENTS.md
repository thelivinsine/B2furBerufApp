# Agent instructions

This file is a router, not a rulebook. It intentionally contains no rules of its own so it can
never drift out of sync.

1. **Read `CLAUDE.md` first.** It is the single source of operating law for every AI coding agent
   working on this repo: stack, commands, hard invariants, locked designs, writing style, workflow.
2. **Before touching an area, read its guide in `docs/areas/`** (COMMANDS, CONTENT, BIBLIOTHEK,
   SESSION, SCHREIBEN, PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN, COMPONENTS). The index is in
   `CLAUDE.md` §Area guides.
3. **Before any design/UI work**, read `.claude/skills/design/SKILL.md`; **before adding or editing
   content in `src/data/`**, read `.claude/skills/content/SKILL.md`. Claude Code loads these as
   skills; every other tool should treat them as required documentation.
4. **To re-orient in the project**, start at `docs/PROJECT_STATUS.md` → its "Resume here" section;
   the full docs map is `docs/README.md`.

The hard invariants in `CLAUDE.md` (permanent content ids, provenance rows, the closed-enum rule,
eager-code weight, locked structures) bind every tool equally.
