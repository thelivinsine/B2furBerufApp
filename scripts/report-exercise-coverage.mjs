/**
 * Exercise-variety coverage report (s131, the Üben exercise-variety plan).
 *
 * Answers one question in plain language: "for each topic, how many DIFFERENT
 * kinds of exercise does a custom Üben set actually produce, and where is it
 * thin?" It runs the REAL session builder (`engine/session.ts`), so it can never
 * drift from what learners actually get, then writes a visual, jargon-light
 * report to `docs/reports/exercise-coverage-report.md`.
 *
 * It also flags the CHEAP content fixes that would unlock more variety (a missing
 * example sentence, a missing `related` link, too few collocations), so the
 * expensive Phase 4 (authored packs / AI generation) is only reached for once
 * those are done. Run with `pnpm report:exercise-coverage`.
 *
 * Deterministic: Math.random is seeded below so the union of kinds (and the git
 * diff) is stable across runs.
 */
import path from "node:path";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { writeReportSidecarSync } from "./report-sidecar.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* --- Seed Math.random (mulberry32) so the report is stable run-to-run. --- */
let _seed = 0x9e3779b9;
Math.random = () => {
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const RUNS = 18; // builder passes per (level × maturity) combo; union = the "menu"
const MINUTES = 15; // a generous session length so rare kinds get a chance
const BAR_MAX = 12; // widest realistic vocab menu, for the bar chart scale
const LEVELS = [1, 2, 3]; // A2/B1 · B2 · C1 (union across levels = full menu)

/* Plain-language names for every block/question kind the builders can emit. */
const QUIZ_LABEL = {
  translation: "Übersetzung (Wort → Bedeutung)",
  article: "Artikel (der/die/das)",
  plural: "Plural",
  cloze: "Lückentext (Wort wählen)",
  redemittelCloze: "Redemittel-Lücke",
  listeningCloze: "Hören (Wort erkennen)",
  oddOneOut: "Ausreißer (was passt nicht)",
  wordOrder: "Satzbau",
  matching: "Zuordnung",
  collocationFill: "Nomen + Verb",
  connectorChoice: "Konnektoren",
  relativePronoun: "Relativpronomen",
  daWord: "da-/wo-Wörter",
};

function blockLabel(b) {
  if (b.kind === "flashcard")
    return b.source === "collocation"
      ? "Kollokations-Karte"
      : b.source === "redemittel"
        ? "Redemittel-Karte"
        : "Karteikarte (umdrehen)";
  if (b.kind === "typing") return b.cloze ? "Tipp-Lücke (Satz ergänzen)" : "Tippen (aus dem Kopf)";
  if (b.kind === "grammar") return "Grammatik-Übung";
  if (b.kind === "reading") return "Lesen/Hören";
  if (b.kind === "quiz") {
    // collocationMatch reuses the "matching" kind, so tell the two apart by the
    // authored prompt (noun-verb grid vs. word ↔ meaning matching).
    if (b.question.kind === "matching")
      return /Verb/.test(b.question.prompt) ? "Nomen-Verb-Paare" : "Zuordnung";
    return QUIZ_LABEL[b.question.kind] ?? b.question.kind;
  }
  return b.kind;
}

/**
 * Union of exercise kinds a scope produces for `ids`, across all CEFR levels
 * (A2/B1 · B2 · C1) and both word maturities (new + mature). That is the FULL
 * menu a topic can offer over a learner's whole journey; a single learner at one
 * level with one deck sees a subset.
 */
function kindsFor(buildScopedSession, type, ids, srsStates, opts = {}) {
  const seen = new Set();
  for (const srs of srsStates) {
    for (const difficulty of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const plan = buildScopedSession(type, ids, { srs, minutes: MINUTES, difficulty, ...opts });
        for (const b of plan.blocks) seen.add(blockLabel(b));
      }
    }
  }
  return seen;
}

/* --- Simple content-health checks, for the "cheap fix" notes. --- */
const ART_RE = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)\s+/i;
const headOf = (s) => s.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normForm = (s) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(ART_RE, "")
    .replace(/^sich\s+/, "")
    .replace(/\s+/g, " ")
    .trim();

function selfExample(v) {
  const head = headOf(v.de);
  if (head.length < 3) return false;
  const re = new RegExp(`\\b${escapeRe(head)}`, "i");
  return (v.examples ?? []).some((e) => re.test(e.de));
}

/* --- Rendering helpers --- */
const bar = (n) => "█".repeat(Math.min(n, BAR_MAX)) + "░".repeat(Math.max(0, BAR_MAX - n));
const status = (n) => (n >= 6 ? "🟢 reich" : n >= 4 ? "🟡 ok" : "🔴 dünn");

async function main() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });

  try {
    const load = (p) => server.ssrLoadModule(p);
    const [sessionMod, vocabMod, colMod, redeMod, gramMod, themeMod] = await Promise.all([
      load("/src/engine/session.ts"),
      load("/src/data/vocabulary.ts"),
      load("/src/data/collocations.ts"),
      load("/src/data/redemittel.ts"),
      load("/src/data/grammar.ts"),
      load("/src/data/themes.ts"),
    ]);
    const { buildScopedSession } = sessionMod;
    const vocabulary = vocabMod.vocabulary;
    const collocations = colMod.collocations;
    const redemittel = redeMod.redemittel;
    const grammar = gramMod.grammar;
    const themes = themeMod.themes;

    // Bank-wide resolver for `related` terms (drives odd-one-out).
    const byForm = new Map();
    for (const v of vocabulary) {
      const k = normForm(v.de);
      if (k && !byForm.has(k)) byForm.set(k, v);
    }
    const resolves = (term) => byForm.has(normForm(term));

    // A "mature deck" (every word graduated) so typed recall + typed cloze are
    // reachable; unioned with a fresh deck ({}) so the flip-card also appears.
    const grad = { ease: 2.5, interval: 20, reps: 5, due: "2020-01-01" };

    const rows = [];
    for (const t of themes) {
      const words = vocabulary.filter((v) => v.themeId === t.id);
      if (!words.length) continue;
      const cols = collocations.filter((c) => c.themeId === t.id);
      const matureSrs = Object.fromEntries(words.map((v) => [v.id, grad]));

      const vocabKinds = kindsFor(buildScopedSession, "vocab", words.map((v) => v.id), [{}, matureSrs], {
        listening: true,
      });
      const colKinds = cols.length
        ? kindsFor(buildScopedSession, "collocation", cols.map((c) => c.id), [{}])
        : new Set();

      // Content-health metrics behind the cheap-fix notes.
      const noExample = words.filter((v) => !selfExample(v));
      const noRelated = words.filter((v) => !(v.related ?? []).some(resolves));

      rows.push({
        id: t.id,
        title: t.titleDe ?? t.id,
        words: words.length,
        cols: cols.length,
        vocabKinds,
        colKinds,
        noExample: noExample.length,
        noRelated: noRelated.length,
      });
    }

    rows.sort((a, b) => a.vocabKinds.size - b.vocabKinds.size || a.title.localeCompare(b.title, "de"));

    // Redemittel + Grammatik (single, whole-bank scopes).
    const redeKinds = kindsFor(buildScopedSession, "redemittel", redemittel.map((r) => r.id), [{}]);
    const gramGroups = new Set(grammar.map((g) => g.group));

    /* ---------------- Compose the report ---------------- */
    const rich = rows.filter((r) => r.vocabKinds.size >= 6).length;
    const ok = rows.filter((r) => r.vocabKinds.size >= 4 && r.vocabKinds.size < 6).length;
    const thin = rows.filter((r) => r.vocabKinds.size < 4).length;

    // Biggest cheap win: the fix that unlocks the most across topics.
    const totalNoExample = rows.reduce((s, r) => s + r.noExample, 0);
    const totalNoRelated = rows.reduce((s, r) => s + r.noRelated, 0);

    const L = [];
    L.push("# Übungsvielfalt – Abdeckungsbericht");
    L.push("");
    L.push(
      "_Generated by `pnpm report:exercise-coverage`. Do not edit by hand. Re-run the command._",
    );
    L.push("");
    L.push("## Worum geht es hier? (in einem Satz)");
    L.push("");
    L.push(
      "Wenn ein Lernender in der Bibliothek auf **Üben** tippt, baut die App aus dem " +
        "vorhandenen Wortschatz automatisch verschiedene Übungstypen. Dieser Bericht zählt, " +
        "**wie viele verschiedene Übungstypen jedes Thema wirklich hergibt** und zeigt, wo es " +
        "eintönig wird und wie man das **günstig** beheben kann.",
    );
    L.push("");
    L.push(
      "Gezählt wird das **volle Menü, das ein Thema über alle Stufen (A2–C1) und mit der Zeit " +
        "(neue vs. gefestigte Wörter) hergibt**. Ein einzelner Lernender sieht je nach Stufe und " +
        "Fortschritt eine Teilmenge davon.",
    );
    L.push("");
    L.push("**So liest man den Balken:** mehr ausgefüllt = mehr Abwechslung.");
    L.push("");
    L.push("| Farbe | Bedeutung |");
    L.push("| --- | --- |");
    L.push("| 🟢 reich | 6+ verschiedene Übungstypen – abwechslungsreich |");
    L.push("| 🟡 ok | 4–5 Übungstypen – solide, aber ausbaufähig |");
    L.push("| 🔴 dünn | höchstens 3 Übungstypen – wird schnell eintönig |");
    L.push("");
    L.push("## Auf einen Blick");
    L.push("");
    L.push(`- **${rows.length} Themen** geprüft: 🟢 **${rich} reich** · 🟡 **${ok} ok** · 🔴 **${thin} dünn**.`);
    if (thin === 0 && ok === 0) {
      L.push(
        "- **Auf Themen-Ebene ist die Vielfalt ausgeschöpft:** jedes Thema kann bereits alle " +
          "Übungstypen bieten. Die restliche Arbeit ist Feinarbeit auf **Wort-Ebene** (unten).",
      );
    }
    L.push(
      `- **${totalNoExample} einzelne Wörter** haben keinen Beispielsatz, der das Wort selbst benutzt ` +
        "(diese Wörter erscheinen nie als Lückentext, Tipp-Lücke oder Hör-Übung).",
    );
    L.push(
      `- **${totalNoRelated} einzelne Wörter** haben keine verknüpften „verwandten Wörter“ (erscheinen ` +
        "nie als Ausreißer).",
    );
    L.push("");
    L.push(
      "> Diese restlichen Lücken sind **günstig** zu schließen (kleine Inhaltsergänzungen, kein neuer " +
        "Code). Der teure Schritt (Phase 4: eigens geschriebene oder KI-erzeugte Übungen) lohnt sich " +
        "erst, wenn diese günstigen Lücken geschlossen sind UND Lernende sich trotzdem wiederholende " +
        "Übungen ansehen – und das misst dieser Bericht bewusst nicht (dazu braucht es Nutzungsdaten).",
    );
    L.push("");

    L.push("## Übungstypen kurz erklärt");
    L.push("");
    L.push("| Übungstyp | Was der Lernende tut | Braucht |");
    L.push("| --- | --- | --- |");
    L.push("| Karteikarte | Karte umdrehen, Bedeutung prüfen | immer da |");
    L.push("| Tippen | das Wort aus dem Kopf tippen | immer da |");
    L.push("| Übersetzung | die richtige Bedeutung anklicken | immer da |");
    L.push("| Artikel | der/die/das wählen | ein Nomen mit Artikel |");
    L.push("| Plural | die Pluralform wählen | ein zählbares Nomen |");
    L.push("| Lückentext | fehlendes Wort im Satz anklicken | Beispielsatz, der das Wort nutzt |");
    L.push("| Tipp-Lücke | fehlendes Wort in den Satz tippen | Beispielsatz, der das Wort nutzt |");
    L.push("| Hören | gesprochenen Satz hören, Wort wählen | Beispielsatz + Sprachausgabe |");
    L.push("| Zuordnung | Wörter Bedeutungen zuordnen | 3–4 Wörter |");
    L.push("| Nomen + Verb | passendes Verb zum Nomen wählen | passende Kollokationen |");
    L.push("| Nomen-Verb-Paare | Nomen und Verben paaren | 4+ eindeutige Kollokationen |");
    L.push("| Satzbau | Wörter in die richtige Reihenfolge bringen | ein Kollokations-Beispiel |");
    L.push("| Ausreißer | das unpassende Wort finden | 2+ verknüpfte „verwandte Wörter“ |");
    L.push("");

    L.push("## Themen (Wörter-Üben), von dünn nach reich");
    L.push("");
    L.push("| Thema | Vielfalt | Typen | Status |");
    L.push("| --- | --- | ---: | --- |");
    for (const r of rows) {
      L.push(`| ${r.title} | \`${bar(r.vocabKinds.size)}\` | ${r.vocabKinds.size} | ${status(r.vocabKinds.size)} |`);
    }
    L.push("");

    // Word-level residual: a theme can offer every type, yet individual words are
    // stuck in only a few because their content is thin. This is the remaining
    // cheap polish once theme-level variety is maxed (as it is here).
    const fixes = rows
      .filter((r) => r.noExample > 0 || r.noRelated > 0)
      .sort((a, b) => b.noExample + b.noRelated - (a.noExample + a.noRelated));
    if (fixes.length) {
      L.push("### Restliche Feinarbeit: einzelne Wörter mit wenigen Übungstypen");
      L.push("");
      L.push(
        "Jedes Thema oben bietet zwar alle Typen, aber **einzelne Wörter** können nur wenige davon: " +
          "ein Wort ohne Beispielsatz, der es selbst benutzt, taucht nie als Lückentext, Tipp-Lücke " +
          "oder Hör-Übung auf; ein Wort ohne verknüpfte „verwandte Wörter“ nie als Ausreißer. Das sind " +
          "kleine Inhaltsergänzungen (kein neuer Code), sortiert nach Wirkung.",
      );
      L.push("");
      L.push("| Thema | Wörter ohne eigenen Beispielsatz | Wörter ohne verwandte Wörter |");
      L.push("| --- | ---: | ---: |");
      for (const r of fixes) {
        L.push(`| ${r.title} | ${r.noExample || "–"} | ${r.noRelated || "–"} |`);
      }
      L.push("");
      L.push(
        "**Lesehilfe:** „ohne eigenen Beispielsatz“ = die zwei Beispielsätze des Wortes benutzen das " +
          "Wort selbst nicht (z. B. nur ein Synonym), also lässt sich keine Lücke bilden. Fix: einen " +
          "der Beispielsätze so anpassen, dass das Wort darin vorkommt.",
      );
      L.push("");
    }

    // The full topic × kind matrix, folded so it does not dominate. Each column
    // is [full label seen from blockLabel, short header for the table].
    const MATRIX = [
      ["Karteikarte (umdrehen)", "Karte"],
      ["Tippen (aus dem Kopf)", "Tippen"],
      ["Übersetzung (Wort → Bedeutung)", "Übers."],
      ["Artikel (der/die/das)", "Artikel"],
      ["Plural", "Plural"],
      ["Lückentext (Wort wählen)", "Lücke"],
      ["Tipp-Lücke (Satz ergänzen)", "Tipp-Lücke"],
      ["Hören (Wort erkennen)", "Hören"],
      ["Zuordnung", "Zuordn."],
      ["Nomen + Verb", "N+V"],
      ["Nomen-Verb-Paare", "N-V-Paare"],
      ["Satzbau", "Satzbau"],
      ["Ausreißer (was passt nicht)", "Ausreißer"],
    ];
    L.push("<details>");
    L.push("<summary>Vollständige Übersicht: welches Thema kann welchen Typ? (aufklappen)</summary>");
    L.push("");
    L.push("Das ist das **volle Menü über alle Stufen (A2–C1) und alle Wort-Reifegrade**. Ein einzelner");
    L.push("Lernender auf einer Stufe sieht davon eine Teilmenge. ✓ = möglich · · = (noch) nicht möglich.");
    L.push("");
    L.push(`| Thema | ${MATRIX.map((m) => m[1]).join(" | ")} |`);
    L.push(`| --- | ${MATRIX.map(() => ":-:").join(" | ")} |`);
    for (const r of rows) {
      const cells = MATRIX.map(([label]) => (r.vocabKinds.has(label) ? "✓" : "·"));
      L.push(`| ${r.title} | ${cells.join(" | ")} |`);
    }
    L.push("");
    L.push("</details>");
    L.push("");

    L.push("## Kollokationen, Redemittel & Grammatik");
    L.push("");
    L.push(
      "Diese Bereiche haben eigene, kleinere Menüs. Kollokationen sind bewusst schlanker (die " +
        "Karte plus bis zu drei Übungstypen), Redemittel drehen sich um das Merken ganzer Wendungen, " +
        "und Grammatik variiert über die Aufgaben eines Themas, nicht über das Format.",
    );
    L.push("");
    L.push("| Bereich | Übungstypen |");
    L.push("| --- | --- |");
    // Per-theme collocation coverage, compact.
    const colRows = rows.filter((r) => r.colKinds.size > 0);
    const colKindUnion = new Set();
    for (const r of colRows) for (const k of r.colKinds) colKindUnion.add(k);
    L.push(`| Kollokationen (alle Themen) | ${[...colKindUnion].join(", ") || "(keine)"} |`);
    L.push(`| Redemittel | ${[...redeKinds].join(", ") || "(keine)"} |`);
    L.push(
      `| Grammatik | Grammatik-Übung über **${grammar.length} Themen** in **${gramGroups.size} Gruppen** (Vielfalt kommt aus den Themen, nicht aus dem Format) |`,
    );
    L.push("");

    L.push("## Wann ist die Vielfalt „ausgeschöpft“?");
    L.push("");
    L.push(
      "Kurz: wenn **zwei Dinge zugleich** zutreffen. Erstens sind die günstigen Lücken oben " +
        "geschlossen (fast alle Themen 🟢, kaum noch fehlende Beispielsätze oder verwandte Wörter). " +
        "Zweitens gibt es echte Hinweise, dass es sich für Lernende trotzdem wiederholt – dieselben " +
        "Lückensätze tauchen wieder auf, oder eine Fähigkeit (freies Formulieren, Situationen " +
        "meistern) bleibt stecken. Der erste Punkt steht in diesem Bericht; der zweite braucht " +
        "Nutzungs-Feedback und ist bewusst nicht hier. Erst wenn beides zutrifft, lohnt der teure " +
        "Schritt (Phase 4).",
    );
    L.push("");

    const out = path.join(root, "docs/reports/exercise-coverage-report.md");
    writeFileSync(out, L.join("\n") + "\n", "utf8");
    writeReportSidecarSync(out, { registerRows: rows.length, scope: "themes", rich, ok, thin });
    console.log(
      `exercise-coverage: ${rows.length} Themen (🟢 ${rich} · 🟡 ${ok} · 🔴 ${thin}) → docs/reports/exercise-coverage-report.md`,
    );
  } finally {
    await server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
