#!/usr/bin/env node
/**
 * Migration idempotency gate (`pnpm lint:migrations`).
 *
 * WHY. `.github/workflows/supabase.yml` applies migrations with
 * `supabase db push --include-all`, which re-applies any file that is missing
 * from the remote migration history, wherever its number sits. That is only
 * safe while every migration is idempotent. Until now that rule lived in a
 * comment at the top of each file, and the cost of breaking it is high: the
 * migration step runs BEFORE the Edge Function deploys in the same workflow, so
 * one `create policy` without its `drop policy if exists` does not just fail
 * itself, it blocks every backend deploy behind it. For a non-technical founder
 * that is an expensive failure to diagnose from a red CI square.
 * (Database architecture audit 2026-08-04, finding R6.)
 *
 * WHAT IT CHECKS. Per statement:
 *   create table / index / extension / sequence   → needs `if not exists`
 *   alter table ... add column                    → needs `if not exists`
 *   create function                               → needs `or replace`
 *   create policy / trigger "<name>"              → needs a matching
 *                                                   `drop ... if exists` earlier
 *                                                   in the same file
 *   insert into                                   → needs `on conflict`
 *
 * LEGACY BASELINE. Migrations up to and including `LEGACY_THROUGH` are already
 * recorded in the remote history, so `--include-all` will never re-apply them
 * and their (real) non-idempotent statements cannot fire again. They are
 * exempt. Everything added from now on must pass. Do NOT raise the baseline to
 * silence a new file: fix the file.
 *
 * Zero dependencies, same shape as the other scripts/*.mjs gates.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dir = join(root, "supabase/migrations");

/** Files numbered at or below this were applied before the gate existed. */
const LEGACY_THROUGH = 14;

/**
 * Strip comments and string/dollar-quoted literals so a rule never fires on
 * prose. Function bodies are dollar-quoted, so this also skips their contents,
 * which is correct: the body is re-created wholesale by `create or replace`.
 */
function stripNoise(sql) {
  let out = sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ");
  // Dollar-quoted blocks ($$ ... $$ / $tag$ ... $tag$), innermost first.
  let prev;
  do {
    prev = out;
    out = out.replace(/\$([a-zA-Z_]*)\$[\s\S]*?\$\1\$/g, " ");
  } while (out !== prev);
  return out.replace(/'(?:[^']|'')*'/g, "''");
}

/** Split into statements on semicolons (safe once literals are stripped). */
function statements(sql) {
  return stripNoise(sql)
    .split(";")
    .map((s) => s.replace(/\s+/g, " ").trim().toLowerCase())
    .filter(Boolean);
}

/** The quoted or bare object name a create/drop statement targets. */
function nameAfter(statement, keyword) {
  const m = statement.match(new RegExp(`${keyword}\\s+(?:if not exists\\s+)?("[^"]+"|[\\w.]+)`));
  return m ? m[1].replace(/"/g, "") : null;
}

const problems = [];

for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  const number = Number(file.slice(0, 4));
  if (Number.isFinite(number) && number <= LEGACY_THROUGH) continue;

  const sql = readFileSync(join(dir, file), "utf8");
  const stmts = statements(sql);

  // Everything the file drops-if-exists, so a later create can be paired to it.
  const dropped = new Set();
  for (const s of stmts) {
    if (/^drop\s+(policy|trigger|index|table|function)\s+if exists/.test(s)) {
      const kind = s.split(/\s+/)[1];
      const name = nameAfter(s, `drop ${kind} if exists`);
      if (name) dropped.add(`${kind}:${name}`);
    }
  }

  const fail = (statement, rule) =>
    problems.push({ file, rule, statement: statement.slice(0, 110) });

  for (const s of stmts) {
    if (/^create (table|index|unique index|extension|sequence)\b/.test(s) && !/if not exists/.test(s)) {
      fail(s, "needs IF NOT EXISTS");
    }
    if (/^alter table\b/.test(s) && /\badd column\b/.test(s) && !/add column if not exists/.test(s)) {
      fail(s, "ADD COLUMN needs IF NOT EXISTS");
    }
    if (/^create (or replace )?function\b/.test(s) && !/^create or replace function\b/.test(s)) {
      fail(s, "needs OR REPLACE");
    }
    for (const kind of ["policy", "trigger"]) {
      if (new RegExp(`^create ${kind}\\b`).test(s)) {
        const name = nameAfter(s, `create ${kind}`);
        if (!name || !dropped.has(`${kind}:${name}`)) {
          fail(s, `needs a preceding DROP ${kind.toUpperCase()} IF EXISTS "${name ?? "?"}"`);
        }
      }
    }
    if (/^insert into\b/.test(s) && !/on conflict/.test(s)) {
      fail(s, "needs ON CONFLICT");
    }
  }
}

if (problems.length) {
  console.error(
    `\nMigration idempotency gate: ${problems.length} problem(s).\n` +
      `Every migration must survive being applied twice: supabase db push --include-all\n` +
      `re-applies any file the remote history does not already record.\n`,
  );
  for (const p of problems) {
    console.error(`  ${p.file}\n    ${p.rule}\n    → ${p.statement}\n`);
  }
  process.exit(1);
}

console.log("Migration idempotency gate: all migrations are safe to re-apply.");
