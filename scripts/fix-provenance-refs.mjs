/**
 * One-off provenance reference correction (2026-06-23).
 *
 * The first live run of `pnpm check:refs` (GitHub Actions) found that a set of
 * vocabulary/collocation references pointed at Wiktionary pages that do not
 * exist (HTTP 404): mostly B2-Beruf compound nouns with no Wiktionary entry
 * (Cloud-Speicher, Meldebescheinigung, …), reflexive/particle verbs
 * ("sich abstimmen"), and a few headword bugs (gender pairs "X / die Y",
 * "(Pl.)", "(PSA)"). Two collocation references used a prepositional phrase as
 * the DWDS lemma, and one grammar topic used a non-existent Wikipedia title.
 *
 * This re-points exactly those rows (the verified-404 ids from the run log) to a
 * reference that resolves and is honest provenance:
 *  - vocabulary / collocations -> DWDS corpus search (/r?q=…), which resolves for
 *    any attested German term and shows real native usage. The right reference
 *    for a word/phrase that has no clean dictionary headword.
 *  - the "Konnektoren" grammar topic + drills -> de.wikipedia "Konjunktion (Wortart)".
 *
 * It touches only the listed ids; every other reference is left untouched.
 * review_status stays "draft" (human verification is still separate).
 *
 *   pnpm exec node scripts/fix-provenance-refs.mjs
 */
import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/data/provenance.ts");

const KONNEKTOREN_WIKI = "https://de.wikipedia.org/wiki/Konjunktion_(Wortart)";

/* content_ids whose Wiktionary/DWDS reference returned a genuine 404 in the
   first live check:refs run. Re-pointed to DWDS corpus search. */
const DEAD_404 = new Set([
  // meetings / general verbs + phrases
  "v_abstimmen", "v_zustaendig", "v_aufgabe_verteilen", "v_zufrieden", "v_zustandig_klaeren",
  "v_teilnehmen", "v_entscheiden", "v_zur_sprache_bringen", "v_ausreden_lassen", "v_einbringen",
  "v_ergebnisprotokoll", "v_aktionspunkt", "v_zeitwaechterin", "v_konsensbasiert",
  // scheduling
  "v_liefertermin", "v_terminvorschlag", "v_ueberschneidung", "v_kapazitaetsplanung",
  "v_quartalsplanung", "v_planung_revidieren", "v_terminabstimmung", "v_urlaubsplanung",
  "v_planungshorizont", "v_soll_ist_vergleich", "v_durchlaufzeit",
  // logistics
  "v_lagerkosten", "v_zeitrahmen", "v_umsetzungsplan", "v_ladeliste", "v_mindestbestand",
  "v_just_in_time", "v_retouren_management", "v_lkw_fahrer", "v_lagerhaltungskosten",
  "v_rueckstandsliste", "v_wareneingang",
  // customer
  "v_kundenzufriedenheit", "v_kundenpflege", "v_transportschaden", "v_reklamationsbearbeitung",
  "v_kulanzloesung", "v_kundenbindung", "v_erwartungsmanagement", "v_ansprechpartner",
  "v_servicelevel", "v_eskalationsstufe", "v_kundenfeedback",
  // conflict
  "v_sich_beschweren", "v_entschuldigen", "v_ruhig_bleiben", "v_klaerungsgespraech",
  "v_vermittlungsgespraech", "v_projektcharter", "v_mediationsverfahren",
  // project / technology
  "v_software_einfuehren", "v_digital_prozess", "v_stakeholder", "v_ampelstatus",
  "v_projektabschluss", "v_scope_creep", "v_projektsponsor", "v_projektphase",
  "v_nutzeroberflaeche", "v_review_meeting", "v_fortschrittsbericht", "v_serverausfall",
  "v_it_sicherheit", "v_cloud_speicher", "v_softwareaktualisierung", "v_fernzugriff",
  "v_datenmigration", "v_systemwartung", "v_zugriffsrechte", "v_lizenzverwaltung",
  "v_schnittstellen_integration", "v_nutzerschulung", "v_ausfallsicherheit", "v_fernwartung",
  // sustainability
  "v_muell_vermeiden", "v_energie_sparen", "v_co2_ausstoss", "v_ressourceneffizienz",
  "v_lieferkettentransparenz", "v_co2_kompensation", "v_energieaudit", "v_nachhaltigkeitsbericht",
  "v_erneuerbare_energie", "v_betriebsoekologie", "v_verpackungsreduktion",
  // safety
  "v_sicherheitsregel", "v_unfallverhuetung", "v_sicherheitsunterweisung",
  "v_persoenliche_schutzausruestung", "v_unfallmeldung", "v_sicherheitscheck",
  "v_schutzmassnahmenkatalog", "v_arbeitsstoffverzeichnis",
  // travel
  "v_dienstreisegenehmigung", "v_tagegeld", "v_transferzeit", "v_reisebuchung",
  "v_reisekostenrichtlinie", "v_zeitzonendifferenz", "v_reisebereitschaft", "v_dienstreisericht",
  // behoerde
  "v_buergeramt", "v_ummeldung", "v_meldebescheinigung", "v_wartenummer",
  // collocations whose DWDS noun lemma was a prepositional phrase
  "c_zur_sprache_bringen", "c_gefahr_hinweisen",
]);

/* Clean a label into a DWDS corpus-search query: drop a leading article, the
   gender-pair tail ("X / die Y" -> "X"), and any "(…)" annotation. */
function cleanTerm(label) {
  let s = label.replace(/^(der|die|das)\s+/i, "").trim();
  s = s.split(" / ")[0].trim();
  s = s.replace(/\s*\([^)]*\)/g, "").trim();
  return s;
}

const dwdsCorpus = (term) => `https://www.dwds.de/r?q=${encodeURIComponent(term)}`;

async function main() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  let provenance;
  try {
    provenance = (await server.ssrLoadModule("/src/data/provenance.ts")).provenance;
  } finally {
    await server.close();
  }

  let fixed = 0;
  const next = provenance.map((entry) => {
    if (entry.content_id.startsWith("g_konnektoren")) {
      if (entry.reference === KONNEKTOREN_WIKI) return entry;
      fixed += 1;
      return { ...entry, reference: KONNEKTOREN_WIKI };
    }
    if (DEAD_404.has(entry.content_id)) {
      const reference = dwdsCorpus(cleanTerm(entry.label));
      if (reference === entry.reference) return entry;
      fixed += 1;
      return { ...entry, reference };
    }
    return entry;
  });

  const entriesJson = JSON.stringify(next, null, 2).replace(/"([a-z_][a-z0-9_]*)"\s*:/g, "$1:");
  const fileContent = `/**
 * Content provenance register.
 *
 * Every entry corresponds to a content_id in the src/data/* banks. The linter
 * (pnpm lint:content) errors on missing rows or non-allowlisted licenses and
 * warns on authored/adapted rows with no reference. \`pnpm check:refs\` verifies
 * the reference URLs resolve.
 *
 * References were bootstrapped (vocabulary -> Wiktionary, collocations -> DWDS),
 * back-filled (grammar -> German Wikipedia, redemittel -> DWDS corpus search,
 * dialogues/exam sets/writing prompts -> CEFR B2 descriptors), and corrected
 * after the first live check:refs run (dead Wiktionary compounds/verbs ->
 * DWDS corpus search). review_status stays "draft" until a human verifies.
 *
 * DO NOT regenerate from scratch — it would overwrite back-filled references.
 * Add new rows manually as new content is added.
 *
 * Total rows: ${next.length}
 */
import type { ProvenanceEntry } from "@/types";

export const provenance: ProvenanceEntry[] = ${entriesJson};
`;
  writeFileSync(out, fileContent, "utf8");
  console.log(`Re-pointed ${fixed} reference(s).`);
}

main().catch((err) => {
  console.error("Fix crashed:", err);
  process.exitCode = 1;
});
