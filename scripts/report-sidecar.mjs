/**
 * Shared helper: write a machine-readable JSON sidecar next to a report's
 * markdown (Kontrollzentrum chunk 8). Every offline report script emits one so
 * the admin Übersicht can show "this number is from <date>, N of M items"
 * instead of presenting stale data as current. verify-grammar already writes
 * its own sidecar in a different shape; this standardises the rest on
 * `{ generatedAt, registerRows, ... }`.
 *
 * Node's `new Date()` is available here (the ban is only inside Workflow
 * scripts), so the generatedAt stamp is taken at write time.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Derive the `.json` sidecar path from a report's `.md` path. */
export function sidecarPathFor(mdPath) {
  return mdPath.replace(/\.md$/, ".json");
}

function buildPayload({ registerRows, ...extra }) {
  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    registerRows: registerRows ?? null,
    ...extra,
  };
}

/** Synchronous variant for scripts that write their markdown with writeFileSync. */
export function writeReportSidecarSync(mdPath, data) {
  const jsonPath = sidecarPathFor(mdPath);
  mkdirSync(path.dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(buildPayload(data), null, 2) + "\n", "utf8");
  return jsonPath;
}

/**
 * Write a sidecar. `registerRows` is the provenance register size the report
 * was generated against (the staleness yardstick); `extra` carries any
 * report-specific counters.
 */
export async function writeReportSidecar(mdPath, data) {
  const jsonPath = sidecarPathFor(mdPath);
  await mkdir(path.dirname(jsonPath), { recursive: true });
  await writeFile(jsonPath, JSON.stringify(buildPayload(data), null, 2) + "\n", "utf8");
  return jsonPath;
}
