import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ChevronDown,
  Database,
  ExternalLink,
  Layers,
  ShieldCheck,
  SpellCheck,
  Table2,
  UserCheck,
} from "lucide-react";
import { provenance } from "@/data/provenance";
import { verification as verificationMap } from "@/data/verification";
import type { ProvenanceContentType, ProvenanceEntry, VerificationTier } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { isFounder } from "@/lib/admin";
import {
  computeDecisionHash,
  fetchProvenanceReviews,
  saveProvenanceReview,
  type ProvenanceReview,
} from "@/lib/provenanceReviews";
import { cn } from "@/lib/utils";
import { AdminWorkbench, type WorkbenchApi } from "./AdminWorkbench";
import { LegalChrome, Section, type Lang } from "./LegalChrome";

/**
 * /sources — the auto-generated "Sources & Data Quality" page (data governance
 * Phase 2; redesigned s130). Built entirely from the provenance register
 * (src/data/provenance.ts) + the generated Layer C verification map, so it
 * stays in sync with the content automatically. Public visitors get the visual
 * data-architecture story (pipeline, tier bar, bank numbers, sources,
 * licenses, full item browse); founders additionally get the AdminWorkbench
 * data table (search/filter/sort/CSV export + live review marks).
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
  can_do: { de: "Kann-Beschreibungen (Meilensteine)", en: "Can-do milestones" },
  mission: { de: "Spiel-Missionen (Neuland)", en: "Game missions (Neuland)" },
  text: { de: "Lese- und Hörtexte", en: "Reading and listening texts" },
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
  "can_do",
  "text",
  "mission",
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

/* The machine-verification tier badge shown per item (data-strategy Layer C).
   Ordered strongest-first; unverified/structural collapse into "sourced". */
const TIER_META: Record<VerificationTier, { de: string; en: string; className: string; barClassName: string }> = {
  human: { de: "menschlich geprüft", en: "human-verified", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", barClassName: "bg-emerald-500" },
  jury: { de: "KI-Jury", en: "AI jury", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400", barClassName: "bg-violet-500" },
  linguistic: { de: "sprachlich geprüft", en: "grammar-checked", className: "bg-primary/10 text-primary", barClassName: "bg-primary" },
  facts: { de: "Fakten geprüft", en: "facts-verified", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400", barClassName: "bg-sky-500" },
  provenance: { de: "Quelle belegt", en: "sourced", className: "bg-muted text-muted-foreground", barClassName: "bg-muted-foreground/40" },
  structural: { de: "Quelle belegt", en: "sourced", className: "bg-muted text-muted-foreground", barClassName: "bg-muted-foreground/40" },
  unverified: { de: "offen", en: "unverified", className: "bg-muted text-muted-foreground", barClassName: "bg-muted-foreground/25" },
};

/* Tiers shown in the public bar/legend, strongest first. */
const TIER_DISPLAY: VerificationTier[] = ["human", "jury", "linguistic", "facts", "provenance"];

/** The item's effective tier: an inline override on the row wins, else the generated map. */
function tierOf(r: ProvenanceEntry): VerificationTier | undefined {
  return r.verification?.tier ?? verificationMap[r.content_id]?.tier;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/* One item row: label + tier badge + source link. Public view. */
function ItemRow({ r, lang }: { r: ProvenanceEntry; lang: Lang }) {
  const tier = tierOf(r);
  const tierMeta = tier ? TIER_META[tier] : undefined;
  return (
    <li className="px-4 py-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-foreground/90">{r.label}</span>
          {tierMeta && (
            <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium", tierMeta.className)}>
              {tierMeta[lang]}
            </span>
          )}
        </span>
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
      </div>
    </li>
  );
}

/* One collapsible group of items for a single content type. Children render only
   when the group is opened, so the full register stays light until expanded. */
function TypeGroup({ type, rows, lang }: { type: ProvenanceContentType; rows: ProvenanceEntry[]; lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="rounded-lg border border-border bg-surface/50"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground">
        <span>{TYPE_LABEL[type][lang]}</span>
        <span className="text-xs text-muted-foreground">{rows.length}</span>
      </summary>
      {open && (
        <ul className="divide-y divide-border border-t border-border">
          {rows.map((r) => (
            <ItemRow key={r.content_id} r={r} lang={lang} />
          ))}
        </ul>
      )}
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Public visuals (s130 redesign)                                      */
/* ------------------------------------------------------------------ */

/** Four headline numbers, as stat tiles. */
function StatTiles({
  stats,
  lang,
}: {
  stats: { total: number; machineChecked: number; verified: number; withReference: number };
  lang: Lang;
}) {
  const t = (de: string, en: string) => (lang === "de" ? de : en);
  const tiles = [
    { value: stats.total.toLocaleString("de-DE"), label: t("Lerninhalte", "Learning items") },
    { value: stats.machineChecked.toLocaleString("de-DE"), label: t("maschinell geprüft", "machine-checked") },
    { value: stats.verified.toLocaleString("de-DE"), label: t("menschlich geprüft", "human-verified") },
    {
      value: `${Math.round((stats.withReference / Math.max(stats.total, 1)) * 100)}%`,
      label: t("mit Quellenbeleg", "with source reference"),
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-border bg-surface/50 px-3 py-2.5 text-center">
          <div className="text-lg font-bold tracking-tight text-foreground">{tile.value}</div>
          <div className="text-[11px] leading-tight text-muted-foreground">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}

/** The five-step content pipeline, as a compact vertical visual. */
function Pipeline({ lang }: { lang: Lang }) {
  const steps = [
    {
      icon: Database,
      de: ["Inhalte als Daten", "Jedes Wort, jede Übung liegt als strukturierter Datensatz vor, mit Thema, Niveau und Quellenangabe."],
      en: ["Content as data", "Every word and exercise is a structured record with its topic, level and source reference."],
    },
    {
      icon: ShieldCheck,
      de: ["Automatische Strukturprüfung", "Bei jeder Änderung prüft ein Wächter Verweise, Duplikate und Vollständigkeit. Fehler blockieren die Veröffentlichung."],
      en: ["Automatic structural checks", "Every change is checked for broken references, duplicates and completeness. Errors block publication."],
    },
    {
      icon: SpellCheck,
      de: ["Fakten- und Sprachprüfung", "Artikel und Plural werden gegen zwei unabhängige Wörterbücher geprüft, jeder deutsche Satz durch eine Grammatikprüfung."],
      en: ["Fact and language checks", "Gender and plural are checked against two independent dictionaries; every German sentence runs through a grammar check."],
    },
    {
      icon: Layers,
      de: ["Vertrauensstufen", "Die Ergebnisse ergeben eine Stufe pro Inhalt, vom Quellenbeleg bis zur menschlichen Prüfung, sichtbar als Abzeichen."],
      en: ["Trust tiers", "The results combine into a per-item tier, from sourced to human-verified, shown as a badge."],
    },
    {
      icon: UserCheck,
      de: ["Menschliche Prüfung", "Die höchste Stufe vergibt nur ein Mensch. Ein digitaler Fingerabdruck stellt sicher, dass geprüfte Inhalte danach unverändert bleiben."],
      en: ["Human review", "Only a person grants the top tier. A digital fingerprint guarantees verified content stays unchanged afterwards."],
    },
  ];
  return (
    <ol className="relative space-y-4 pl-10">
      <div aria-hidden className="absolute bottom-4 left-[15px] top-4 w-px bg-border" />
      {steps.map((step, i) => {
        const Icon = step.icon;
        const [title, body] = lang === "de" ? step.de : step.en;
        return (
          <li key={title} className="relative">
            <span className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-soft">
              <Icon className="h-4 w-4" />
            </span>
            <p className="font-semibold text-foreground">
              {i + 1}. {title}
            </p>
            <p className="mt-0.5">{body}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** Stacked tier-distribution bar with a count legend. */
function TierBar({ byTier, total, lang }: { byTier: Map<VerificationTier, number>; total: number; lang: Lang }) {
  // structural/unverified collapse into "provenance" for the public display.
  const counts = new Map<VerificationTier, number>();
  for (const [tier, n] of byTier) {
    const display = tier === "structural" || tier === "unverified" ? "provenance" : tier;
    counts.set(display, (counts.get(display) ?? 0) + n);
  }
  const tiered = [...counts.values()].reduce((a, b) => a + b, 0);
  const pending = Math.max(total - tiered, 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {TIER_DISPLAY.filter((tier) => counts.get(tier)).map((tier) => (
          <div
            key={tier}
            className={TIER_META[tier].barClassName}
            style={{ width: `${((counts.get(tier) ?? 0) / Math.max(total, 1)) * 100}%` }}
            title={`${TIER_META[tier][lang]}: ${counts.get(tier)}`}
          />
        ))}
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {TIER_DISPLAY.filter((tier) => counts.get(tier)).map((tier) => {
          const n = counts.get(tier) ?? 0;
          return (
            <li key={tier} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", TIER_META[tier].barClassName)} />
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TIER_META[tier].className)}>
                  {TIER_META[tier][lang]}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {n} · {Math.round((n / Math.max(total, 1)) * 100)}%
              </span>
            </li>
          );
        })}
        {pending > 0 && (
          <li className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted" />
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {lang === "de" ? "nächste Prüfwelle" : "next verification sweep"}
              </span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {pending} · {Math.round((pending / Math.max(total, 1)) * 100)}%
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

/** Per-bank item counts as a tile grid. */
function BankTiles({ byType, lang }: { byType: Map<ProvenanceContentType, ProvenanceEntry[]>; lang: Lang }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {TYPE_ORDER.filter((type) => byType.has(type)).map((type) => (
        <div key={type} className="rounded-lg border border-border bg-surface/50 px-3 py-2">
          <div className="text-base font-bold text-foreground">{byType.get(type)!.length.toLocaleString("de-DE")}</div>
          <div className="text-[11px] leading-tight text-muted-foreground">{TYPE_LABEL[type][lang]}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/**
 * Shared workbench state for the founder review table. Lives in a hook so both
 * the /sources summary (which only needs `admin` + `liveVerified`) and the
 * dedicated /sources/werkbank sub-page (which renders the full table) can drive
 * the same reviews cache + save handler without duplicating the logic.
 */
function useWorkbench() {
  const user = useAuthStore((s) => s.user);
  const admin = isFounder(user);

  const [reviews, setReviews] = useState<Map<string, ProvenanceReview>>(new Map());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Load the founder's saved review marks once, when signed in as admin.
  useEffect(() => {
    if (!admin) {
      setReviews(new Map());
      return;
    }
    let cancelled = false;
    fetchProvenanceReviews().then((m) => {
      if (!cancelled) setReviews(m);
    });
    return () => {
      cancelled = true;
    };
  }, [admin]);

  const api: WorkbenchApi | undefined = useMemo(() => {
    if (!admin) return undefined;
    return {
      reviews,
      onChange: async (contentId, patch) => {
        const uid = user?.id;
        if (!uid) return false;
        const cur = reviews.get(contentId) ?? {
          content_id: contentId,
          verified: false,
          comment: null,
          decision: null,
          content_hash: null,
          reviewer_email: null,
        };
        // Ticking the box is an APPROVE decision and fingerprints the content
        // as the reviewer sees it (the apply script compares this hash before
        // flipping the repo row). Unticking clears the decision; a note-only
        // edit leaves the decision and its hash untouched.
        const approving = patch.verified === true;
        const clearing = patch.verified === false;
        const merged: ProvenanceReview = {
          content_id: contentId,
          verified: patch.verified ?? cur.verified,
          // normalise an empty note to null so the column stays clean
          comment:
            patch.comment !== undefined ? (patch.comment ?? "").trim() || null : cur.comment,
          decision: approving ? "approve" : clearing ? null : cur.decision,
          content_hash: approving
            ? await computeDecisionHash(contentId)
            : clearing
              ? null
              : cur.content_hash,
          reviewer_email: user?.email?.toLowerCase() ?? cur.reviewer_email,
        };
        setSaveState("saving");
        const ok = await saveProvenanceReview(merged, uid);
        // Only commit to the local cache once the write actually lands, so a
        // failed save (e.g. table not provisioned) does not look saved.
        if (ok) setReviews((prev) => new Map(prev).set(contentId, merged));
        setSaveState(ok ? "saved" : "error");
        return ok;
      },
    };
  }, [admin, reviews, user?.id, user?.email]);

  const liveVerified = useMemo(
    () => [...reviews.values()].filter((r) => r.verified).length,
    [reviews],
  );

  return { admin, api, saveState, liveVerified };
}

export function Sources() {
  const [lang, setLang] = useState<Lang>("de");
  const { admin, liveVerified } = useWorkbench();
  const [showAll, setShowAll] = useState(false);

  const stats = useMemo(() => {
    const byType = new Map<ProvenanceContentType, ProvenanceEntry[]>();
    const byHost = new Map<string, number>();
    const byLicense = new Map<string, number>();
    const byTier = new Map<VerificationTier, number>();
    let verified = 0;
    let machineChecked = 0; // facts and/or linguistic (or higher)
    let withReference = 0;
    const attributions: ProvenanceEntry[] = [];
    for (const r of provenance) {
      if (!byType.has(r.content_type)) byType.set(r.content_type, []);
      byType.get(r.content_type)!.push(r);
      const h = hostOf(r.reference);
      if (h) byHost.set(h, (byHost.get(h) ?? 0) + 1);
      if (r.reference) withReference += 1;
      byLicense.set(r.license, (byLicense.get(r.license) ?? 0) + 1);
      if (r.review_status === "verified") verified += 1;
      if (r.attribution_required) attributions.push(r);
      const tier = tierOf(r);
      if (tier) byTier.set(tier, (byTier.get(tier) ?? 0) + 1);
      if (tier === "facts" || tier === "linguistic" || tier === "jury" || tier === "human") machineChecked += 1;
    }
    return { byType, byHost, byLicense, byTier, verified, machineChecked, withReference, total: provenance.length, attributions };
  }, []);

  const t = (de: string, en: string) => (lang === "de" ? de : en);

  return (
    <LegalChrome
      lang={lang}
      setLang={setLang}
      title={t("Quellen & Datenqualität", "Sources & Data Quality")}
      lastUpdated="2026-07-18"
    >
      {admin && (
        /* The full review table moved to its own sub-page (/sources/werkbank)
           so this page stays short. Admins get a link card instead of the
           inline table. */
        <Link
          to="/sources/werkbank"
          className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Table2 className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-foreground">
                {t("Daten-Werkbank (nur Admins)", "Data workbench (admins only)")}
              </span>
              <span className="block text-sm text-muted-foreground">
                {t(
                  `Ganzer Bestand als Tabelle: suchen, filtern, sortieren, CSV-Export, live prüfen. Live geprüft: ${liveVerified} von ${stats.total}.`,
                  `The full register as a table: search, filter, sort, CSV export, review live. Live-checked: ${liveVerified} of ${stats.total}.`,
                )}
              </span>
            </span>
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 -rotate-90 text-muted-foreground" />
        </Link>
      )}

      <Section title={t("Unser Ansatz", "Our approach")}>
        <p>
          {t(
            "Jeder Lerninhalt in Genauly ist nachvollziehbar. Statt uns auf „selbst geschrieben, also gehört es uns“ zu verlassen, führt jeder Eintrag auf eine freie, autoritative Referenz zurück (Wiktionary, DWDS, Wikipedia, GER). Das nennen wir „Nachvollziehbarkeit vor Eigentum“.",
            "Every learning item in Genauly is traceable. Rather than relying on “we wrote it, so we own it”, each item traces back to a free, authoritative reference (Wiktionary, DWDS, Wikipedia, CEFR). We call this “traceability over ownership”.",
          )}
        </p>
        <p>
          {t(
            "Diese Seite wird automatisch aus unserem Herkunftsregister erzeugt und bleibt damit immer aktuell.",
            "This page is generated automatically from our provenance register, so it always stays current.",
          )}
        </p>
        <StatTiles stats={stats} lang={lang} />
      </Section>

      <Section title={t("So entsteht ein Inhalt", "How an item is made")}>
        <p className="mb-4">
          {t(
            "Inhalte durchlaufen dieselbe Pipeline wie unser Programmcode: fünf Stationen, von der Datenerfassung bis zur menschlichen Prüfung. Kaputte oder unbelegte Inhalte erreichen die App nicht.",
            "Content travels the same pipeline as our program code: five stations, from data entry to human review. Broken or unsourced content cannot reach the app.",
          )}
        </p>
        <Pipeline lang={lang} />
      </Section>

      <Section title={t("Prüfstufen", "Verification tiers")}>
        <p className="mb-3">
          {t(
            `Jeder Inhalt trägt die höchste Stufe, deren Prüfungen er alle bestanden hat. ${stats.machineChecked} von ${stats.total} Inhalten sind maschinell auf Fakten oder Sprache geprüft; ${stats.verified} zusätzlich von einem Menschen.`,
            `Every item carries the highest tier whose checks it passed. ${stats.machineChecked} of ${stats.total} items are machine-checked for facts or language; ${stats.verified} additionally by a human.`,
          )}
        </p>
        <TierBar byTier={stats.byTier} total={stats.total} lang={lang} />
        <p className="mt-3 text-xs text-muted-foreground">
          {t(
            "Eine bestandene Prüfung belegt Fakten und Grammatik, nicht Stil, Register oder das genaue Niveau. Diese folgen über eine KI-Jury und eine menschliche Stichprobe.",
            "A passed check attests facts and grammar, not style, register, or the exact level. Those come via an AI jury and a human sample.",
          )}
        </p>
      </Section>

      <Section title={t("Inhalte in Zahlen", "Content in numbers")}>
        <BankTiles byType={stats.byType} lang={lang} />
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
            "Aufgeklappt zeigt jede Gruppe jeden Eintrag mit Prüfstufe und Link zur Quelle. Ein lebender Link bestätigt, dass die Seite existiert, nicht die inhaltliche Richtigkeit; die fachliche Prüfung erfolgt zusätzlich durch Menschen.",
            "Expand a group to see every item with its tier and a link to its source. A live link confirms the page exists, not that the content is correct; accuracy is additionally checked by humans.",
          )}
        </p>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          <span>
            {showAll
              ? t("Liste zuklappen", "Collapse list")
              : t("Alle Inhalte anzeigen", "Show all content")}
            <span className="ml-2 text-xs text-muted-foreground">
              {stats.total.toLocaleString("de-DE")}
            </span>
          </span>
          <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", showAll && "rotate-180")} />
        </button>
        {showAll && (
          <div className="mt-2 space-y-2">
            {TYPE_ORDER.filter((type) => stats.byType.has(type)).map((type) => (
              <TypeGroup key={type} type={type} rows={stats.byType.get(type)!} lang={lang} />
            ))}
          </div>
        )}
      </Section>
    </LegalChrome>
  );
}

/**
 * /sources/werkbank — the founder-only review table on its own page, so the
 * main /sources page stays short. Route-gated by RequireFounder; this extra
 * client check just redirects a non-admin who somehow reaches the component.
 */
export function SourcesWorkbench() {
  const [lang, setLang] = useState<Lang>("de");
  const { admin, api, saveState, liveVerified } = useWorkbench();

  const t = (de: string, en: string) => (lang === "de" ? de : en);
  const total = provenance.length;

  if (!admin || !api) return <Navigate to="/sources" replace />;

  return (
    <LegalChrome
      lang={lang}
      setLang={setLang}
      title={t("Daten-Werkbank", "Data workbench")}
      lastUpdated="2026-07-22"
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/sources"
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("← Zurück zu Quellen", "← Back to Sources")}
        </Link>
        <span className="text-xs text-muted-foreground">
          {saveState === "saving"
            ? t("Speichern…", "Saving…")
            : saveState === "saved"
              ? t("Gespeichert", "Saved")
              : saveState === "error"
                ? t("Fehler beim Speichern", "Save failed")
                : ""}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t(
          `Der ganze Inhaltsbestand als Tabelle: suchen, filtern, sortieren, als CSV exportieren, live prüfen. Deine Haken und Notizen sieht nur das Admin-Team. Live geprüft: ${liveVerified} von ${total}.`,
          `The full content register as a table: search, filter, sort, export as CSV, review live. Your checks and notes are visible to the admin team only. Live-checked: ${liveVerified} of ${total}.`,
        )}
      </p>
      {/* Break out of the narrow legal column on large screens so the table
          gets real width. */}
      <div className="lg:-mx-16 xl:-mx-40">
        <AdminWorkbench api={api} lang={lang} />
      </div>
    </LegalChrome>
  );
}
