import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { provenance } from "@/data/provenance";
import type { ProvenanceContentType, ProvenanceEntry } from "@/types";
import { LegalChrome, Section, type Lang } from "./LegalChrome";

/**
 * /sources — the auto-generated "Sources & Licenses" page (Phase 2 of the data
 * governance roadmap, see docs/DATA_GOVERNANCE.md). It is built entirely from
 * the provenance register (src/data/provenance.ts), so it stays in sync with the
 * content automatically: every learning item, the public reference it traces to,
 * and its licence. This is the human-readable, public-facing view of the
 * traceability-over-ownership policy, and the surface that carries any required
 * attribution if we later ingest CC-BY content.
 */

/* Human-readable names for each content type. */
const TYPE_LABEL: Record<ProvenanceContentType, { de: string; en: string }> = {
  vocabulary: { de: "Wortschatz", en: "Vocabulary" },
  collocation: { de: "Kollokationen", en: "Collocations" },
  grammar_topic: { de: "Grammatik (Themen)", en: "Grammar (topics)" },
  grammar_drill: { de: "Grammatik (Übungen)", en: "Grammar (drills)" },
  dialogue: { de: "Dialoge", en: "Dialogues" },
  exam_set: { de: "Prüfungssätze", en: "Exam sets" },
  redemittel: { de: "Redemittel", en: "Set phrases" },
  writing_prompt: { de: "Schreibaufgaben", en: "Writing prompts" },
};

const TYPE_ORDER: ProvenanceContentType[] = [
  "vocabulary",
  "collocation",
  "redemittel",
  "grammar_topic",
  "grammar_drill",
  "dialogue",
  "exam_set",
  "writing_prompt",
];

/* Upstream references we verify content against, keyed by hostname (no www.). */
const SOURCE_META: Record<
  string,
  { name: string; site: string; license: string; de: string; en: string }
> = {
  "de.wiktionary.org": {
    name: "Wiktionary",
    site: "https://de.wiktionary.org",
    license: "CC BY-SA 4.0",
    de: "Wortfakten: Artikel (der/die/das), Plural und Bedeutung. Fakten sind nicht urheberrechtlich geschützt; wir zitieren sie, statt Listen zu kopieren.",
    en: "Word facts: gender (der/die/das), plural and meaning. Facts are not copyrightable; we cite them rather than copying lists.",
  },
  "dwds.de": {
    name: "DWDS",
    site: "https://www.dwds.de",
    license: "Referenz / reference",
    de: "Digitales Wörterbuch der deutschen Sprache: Beleg- und Korpusverwendung, um Kollokationen und Redemittel gegen echten Sprachgebrauch zu prüfen.",
    en: "Digital dictionary of German: usage and corpus evidence, used to check collocations and set phrases against real native usage.",
  },
  "de.wikipedia.org": {
    name: "Wikipedia",
    site: "https://de.wikipedia.org",
    license: "CC BY-SA 4.0",
    de: "Grammatikkonzepte (Regeln sind Fakten), als Referenz für die Grammatikthemen und -übungen.",
    en: "Grammar concepts (rules are facts), as the reference for the grammar topics and drills.",
  },
  "coe.int": {
    name: "Europarat – GER (CEFR)",
    site: "https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions",
    license: "© Council of Europe",
    de: "Niveaubeschreibungen des Gemeinsamen Europäischen Referenzrahmens. Standard, an dem unsere Dialoge, Prüfungssätze und Schreibaufgaben das B2-Niveau ausrichten.",
    en: "Common European Framework level descriptors. The standard our dialogues, exam sets and writing prompts target B2 against.",
  },
};

const LICENSE_LABEL: Record<string, { de: string; en: string }> = {
  OWNED: { de: "Eigenerstellt (Genauly hält die Rechte)", en: "Authored in-house (Genauly holds the rights)" },
  "CC0-1.0": { de: "Gemeinfrei (CC0)", en: "Public domain (CC0)" },
  "CC-BY-4.0": { de: "CC BY 4.0 (Namensnennung)", en: "CC BY 4.0 (attribution)" },
  "CC-BY-SA-4.0": { de: "CC BY-SA 4.0 (Namensnennung, share-alike)", en: "CC BY-SA 4.0 (attribution, share-alike)" },
  "Public-Domain": { de: "Gemeinfrei", en: "Public domain" },
};

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/* One collapsible group of items for a single content type. Children render only
   when the group is opened, so the full register stays light until expanded. */
function TypeGroup({
  type,
  rows,
  lang,
}: {
  type: ProvenanceContentType;
  rows: ProvenanceEntry[];
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  const name = TYPE_LABEL[type][lang];
  return (
    <details
      className="rounded-lg border border-border bg-surface/50"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground">
        <span>{name}</span>
        <span className="text-xs text-muted-foreground">{rows.length}</span>
      </summary>
      {open && (
        <ul className="divide-y divide-border border-t border-border">
          {rows.map((r) => (
            <li key={r.content_id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
              <span className="min-w-0 truncate text-foreground/90">{r.label}</span>
              {r.reference ? (
                <a
                  href={r.reference}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  {hostOf(r.reference) || (lang === "de" ? "Quelle" : "source")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {lang === "de" ? "keine Quelle" : "no source"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

export function Sources() {
  const [lang, setLang] = useState<Lang>("de");

  const stats = useMemo(() => {
    const byType = new Map<ProvenanceContentType, ProvenanceEntry[]>();
    const byHost = new Map<string, number>();
    const byLicense = new Map<string, number>();
    let verified = 0;
    let attributions: ProvenanceEntry[] = [];
    for (const r of provenance) {
      if (!byType.has(r.content_type)) byType.set(r.content_type, []);
      byType.get(r.content_type)!.push(r);
      const h = hostOf(r.reference);
      if (h) byHost.set(h, (byHost.get(h) ?? 0) + 1);
      byLicense.set(r.license, (byLicense.get(r.license) ?? 0) + 1);
      if (r.review_status === "verified") verified += 1;
      if (r.attribution_required) attributions.push(r);
    }
    return { byType, byHost, byLicense, verified, total: provenance.length, attributions };
  }, []);

  const t = (de: string, en: string) => (lang === "de" ? de : en);

  return (
    <LegalChrome
      lang={lang}
      setLang={setLang}
      title={t("Quellen & Lizenzen", "Sources & Licenses")}
      lastUpdated="2026-06-23"
    >
      <Section title={t("Unser Ansatz", "Our approach")}>
        <p>
          {t(
            "Jeder Lerninhalt in Genauly ist nachvollziehbar. Statt uns auf „selbst geschrieben, also gehört es uns“ zu verlassen, führt jeder Eintrag auf eine freie, autoritative Referenz zurück (Wiktionary, DWDS, Wikipedia, GER). Das nennen wir „Nachvollziehbarkeit vor Eigentum“.",
            "Every learning item in Genauly is traceable. Rather than relying on “we wrote it, so we own it”, each item traces back to a free, authoritative reference (Wiktionary, DWDS, Wikipedia, CEFR). We call this “traceability over ownership”.",
          )}
        </p>
        <p>
          {t(
            "Diese Seite wird automatisch aus unserem Herkunftsregister erzeugt und bleibt damit immer aktuell. Die vollständige Richtlinie steht in unserer Daten-Governance-Dokumentation.",
            "This page is generated automatically from our provenance register, so it always stays current. The full policy is in our data-governance documentation.",
          )}
        </p>
        <p className="text-foreground">
          {t(
            `Aktuell: ${stats.total} Inhalte, ${stats.verified} davon menschlich geprüft. Alle Inhalte sind eigenerstellt und gegen die unten genannten Quellen verifiziert.`,
            `Currently: ${stats.total} items, ${stats.verified} human-verified. All content is authored in-house and verified against the references below.`,
          )}
        </p>
      </Section>

      <Section title={t("Quellen, auf die wir uns stützen", "Sources we rely on")}>
        <ul className="space-y-3">
          {[...stats.byHost.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([host, count]) => {
              const meta = SOURCE_META[host];
              return (
                <li key={host} className="rounded-lg border border-border bg-surface/50 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={meta?.site ?? `https://${host}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary"
                    >
                      {meta?.name ?? host}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {meta?.license} · {count} {t("Einträge", "items")}
                    </span>
                  </div>
                  {meta && <p className="mt-1.5">{lang === "de" ? meta.de : meta.en}</p>}
                </li>
              );
            })}
        </ul>
      </Section>

      <Section title={t("Lizenzen unserer Inhalte", "Licences of our content")}>
        <ul className="space-y-1.5">
          {[...stats.byLicense.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([lic, count]) => (
              <li key={lic} className="flex items-center justify-between gap-3">
                <span className="text-foreground">{LICENSE_LABEL[lic]?.[lang] ?? lic}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{count}</span>
              </li>
            ))}
        </ul>
        {stats.attributions.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <h3 className="mb-1.5 font-semibold text-foreground">{t("Namensnennung", "Attribution")}</h3>
            <ul className="space-y-1">
              {stats.attributions.map((r) => (
                <li key={r.content_id}>{r.attribution_text ?? r.label}</li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title={t("Alle Inhalte und ihre Quellen", "All content and its sources")}>
        <p className="mb-3">
          {t(
            "Aufgeklappt zeigt jede Gruppe jeden Eintrag mit Link zur Quelle. Ein lebender Link bestätigt, dass die Seite existiert, nicht die inhaltliche Richtigkeit; die fachliche Prüfung erfolgt zusätzlich durch Menschen.",
            "Expand a group to see every item with a link to its source. A live link confirms the page exists, not that the content is correct; accuracy is additionally checked by humans.",
          )}
        </p>
        <div className="space-y-2">
          {TYPE_ORDER.filter((type) => stats.byType.has(type)).map((type) => (
            <TypeGroup key={type} type={type} rows={stats.byType.get(type)!} lang={lang} />
          ))}
        </div>
      </Section>
    </LegalChrome>
  );
}
