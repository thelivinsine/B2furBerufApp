/**
 * Fetch + build the offline LanguageTool toolchain for the data-strategy
 * Layer 3 grammar check (docs/strategy/DATA_STRATEGY.md §3).
 *
 *   pnpm build:languagetool     # resolve LT 6.8 jars + compile the Java runner
 *
 * WHY THIS ISN'T A VENDORED SUBSET (unlike Phase A's oracles). LanguageTool's
 * German engine is ~69 MB across 88 jars — far too large to commit. But the
 * environment's network policy that blocks kaikki/de.wiktionary DOES reach
 * **Maven Central** (repo1.maven.org), where LanguageTool is published. So we
 * resolve a PINNED version (reproducible) from an allowed host at build time
 * into a gitignored local lib dir, then run fully offline against it. This is
 * the same "route around the blocked host through an allowed one" move Phase A
 * used for PyPI; the artifact is just too big to vendor, so it is cached, not
 * committed.
 *
 * Output (all gitignored, see .gitignore):
 *   scripts/vendor/lt-lib/*.jar   — LanguageTool 6.8 + language-de + deps
 *   scripts/vendor/lt-lib/LtCheck.class — the compiled runner
 *
 * Requires: `mvn` and a JDK (both present in CI via setup-java). If Maven is
 * unreachable the grammar check degrades to a no-op with a clear message, so it
 * never breaks a build (Layer 3 is warn-only by design).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LT_VERSION = "6.8"; // pinned for reproducibility; bump deliberately
const LIB = path.join(root, "scripts", "vendor", "lt-lib");
const RUNNER = path.join(root, "scripts", "lt", "LtCheck.java");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.error) throw r.error;
  return r.status ?? 1;
}

async function main() {
  // A throwaway pom that pulls language-de (which drags in core + all deps).
  await mkdir(LIB, { recursive: true });
  const pomDir = path.join(root, "scripts", "vendor", ".lt-pom");
  await mkdir(pomDir, { recursive: true });
  await writeFile(
    path.join(pomDir, "pom.xml"),
    `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>genauly</groupId><artifactId>lt-resolve</artifactId><version>1.0</version>
  <packaging>jar</packaging>
  <properties><maven.compiler.release>17</maven.compiler.release></properties>
  <dependencies>
    <dependency>
      <groupId>org.languagetool</groupId>
      <artifactId>language-de</artifactId>
      <version>${LT_VERSION}</version>
    </dependency>
  </dependencies>
</project>\n`,
    "utf8"
  );

  console.log(`Resolving LanguageTool ${LT_VERSION} (language-de + deps) from Maven Central …`);
  const status = run("mvn", [
    "-q", "-B",
    "-f", path.join(pomDir, "pom.xml"),
    "dependency:copy-dependencies",
    `-DoutputDirectory=${LIB}`,
  ]);
  if (status !== 0) {
    console.error(
      "\n✖ Maven resolution failed. LanguageTool needs `mvn` + network to repo1.maven.org.\n" +
      "  Layer 3 grammar is warn-only, so this is not fatal to any build — but the grammar\n" +
      "  report cannot be generated without the jars. On an unrestricted machine, retry."
    );
    process.exitCode = 1;
    return;
  }

  const jars = (await readdir(LIB)).filter((f) => f.endsWith(".jar"));
  console.log(`  resolved ${jars.length} jars into ${path.relative(root, LIB)}`);

  console.log("Compiling the Java runner …");
  const cp = process.platform === "win32" ? `${LIB}\\*` : `${LIB}/*`;
  const jc = run("javac", ["-cp", cp, "-d", LIB, RUNNER]);
  if (jc !== 0) {
    console.error("✖ javac failed.");
    process.exitCode = 1;
    return;
  }
  if (!existsSync(path.join(LIB, "LtCheck.class"))) {
    console.error("✖ LtCheck.class not produced.");
    process.exitCode = 1;
    return;
  }

  console.log(`\n✔ LanguageTool ${LT_VERSION} ready. Run \`pnpm verify:grammar\`.`);
}

main().catch((err) => {
  console.error("build-languagetool failed:", err?.message ?? err);
  process.exitCode = 1;
});
