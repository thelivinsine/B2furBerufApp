import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Combine, ListChecks } from "lucide-react";
import { collocations } from "@/data/collocations";
import { themes, themeById } from "@/data/themes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { HubHero } from "@/components/shared/HubHero";
import {
  applyFacets,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { BrowseToolbar } from "@/features/shared/BrowseToolbar";
import { CEFR_ORDER } from "@/lib/cefr";

function normalise(s: string) {
  return s.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c));
}

type CollocationItem = (typeof collocations)[number];

const REGISTER_LABEL: Record<string, string> = {
  neutral: "neutral",
  formal: "formell",
  diplomatic: "diplomatisch",
};
const cefrPresent = CEFR_ORDER.filter((c) => collocations.some((x) => x.cefr === c));
const registerPresent = ["neutral", "formal", "diplomatic"].filter((r) =>
  collocations.some((x) => x.register === r),
);
const allVerbs = [...new Set(collocations.map((c) => c.verb))].sort();

const COLLOCATION_FACETS: FacetDef<CollocationItem>[] = [
  {
    id: "cefr",
    label: "Stufe (CEFR)",
    hint: "Mehrfachauswahl",
    options: cefrPresent.map((c) => ({ value: c, label: c })),
    get: (c) => c.cefr,
  },
  {
    id: "register",
    label: "Register",
    options: registerPresent.map((r) => ({ value: r, label: REGISTER_LABEL[r] })),
    get: (c) => c.register,
  },
  {
    id: "verb",
    label: "Verb",
    options: allVerbs.map((v) => ({ value: v, label: v })),
    get: (c) => c.verb,
  },
];

const ALL_FACET_IDS = COLLOCATION_FACETS.map((f) => f.id);

type Collocation = (typeof collocations)[number];

function CollocationCard({ c }: { c: Collocation }) {
  return (
    <Card className="card-hover h-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="min-w-0 truncate font-semibold">{c.full}</p>
              <SpeakButton text={c.full} className="shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">{c.en}</p>
          </div>
          {(c.register === "formal" || c.register === "diplomatic") && (
            <Badge variant="accent" className="shrink-0">
              {c.register === "diplomatic" ? "diplomatisch" : "formell"}
            </Badge>
          )}
        </div>

        <div className="mt-2 border-t border-border pt-2">
          <div className="flex items-start gap-1.5">
            <p className="min-w-0 flex-1 text-sm italic text-muted-foreground">„{c.example.de}"</p>
            <SpeakButton text={c.example.de} className="shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CollocationsBrowser() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const themeParam = params.get("theme") ?? "all";
  const search = params.get("q") ?? "";

  const selection: FacetSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const id of ALL_FACET_IDS) {
      const raw = params.get(id);
      if (raw) s[id] = raw.split(",");
    }
    return s;
  }, [params]);

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    setParams(p, { replace: true });
  };

  const setSelection = (next: FacetSelection) => {
    const p = new URLSearchParams(params);
    for (const id of ALL_FACET_IDS) {
      const v = next[id];
      if (v && v.length) p.set(id, v.join(","));
      else p.delete(id);
    }
    setParams(p, { replace: true });
  };

  const removeFacetValue = (facetId: string, value: string) =>
    setSelection({ ...selection, [facetId]: (selection[facetId] ?? []).filter((v) => v !== value) });

  const setTheme = (val: string) => {
    const p = new URLSearchParams(params);
    if (val === "all") p.delete("theme");
    else p.set("theme", val);
    setParams(p, { replace: true });
  };

  const setSearch = (q: string) => setParam("q", q || null);

  const scoped = useMemo(() => {
    let list =
      themeParam === "all" ? collocations : collocations.filter((c) => c.themeId === themeParam);
    if (search.trim()) {
      const q = normalise(search.trim());
      list = list.filter(
        (c) =>
          normalise(c.full).includes(q) ||
          normalise(c.noun).includes(q) ||
          normalise(c.verb).includes(q) ||
          normalise(c.en).includes(q),
      );
    }
    return list;
  }, [themeParam, search]);

  const filtered = useMemo(
    () => applyFacets(scoped, COLLOCATION_FACETS, selection),
    [scoped, selection],
  );

  const activeChips = COLLOCATION_FACETS.flatMap((f) =>
    (selection[f.id] ?? []).map((v) => ({
      facetId: f.id,
      value: v,
      label: f.options.find((o) => o.value === v)?.label ?? v,
    })),
  );

  const activeTheme = themeParam !== "all" ? themeById(themeParam) : null;

  const primaryOptions = [
    { value: "all", label: "Alle Themen" },
    ...themes.map((t) => ({ value: t.id, label: t.titleDe })),
  ];

  return (
    <div className="space-y-5">
      <HubHero
        icon={Combine}
        gradient="from-violet-500 to-purple-500"
        eyebrow="Nomen-Verb-Verbindungen"
        title="Kollokationen"
        description="Feste Verbindungen aus Nomen und Verb. Lerne sie als Einheit und klinge natürlich und präzise im B2-Beruf-Gespräch."
      />

      <BrowseToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Suche nach Nomen, Verb, Übersetzung …"
        primary={{ value: themeParam, onChange: setTheme, options: primaryOptions }}
        facetItems={scoped}
        facets={COLLOCATION_FACETS}
        facetSelection={selection}
        onFacetChange={setSelection}
        resultLabel={(n) => `${n} Kollokation${n !== 1 ? "en" : ""} anzeigen`}
        activeChips={activeChips}
        onRemoveChip={removeFacetValue}
        trailing={
          activeTheme ? (
            <Button
              size="sm"
              variant="outline"
              className="h-10 shrink-0"
              onClick={() => navigate(`/quiz?theme=${activeTheme.id}&level=2`)}
            >
              <ListChecks className="h-3.5 w-3.5" /> Quiz: {activeTheme.titleDe}
            </Button>
          ) : undefined
        }
      />

      <p className="text-sm text-muted-foreground">
        {filtered.length} Kollokation{filtered.length !== 1 ? "en" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          Keine Ergebnisse. Versuche einen anderen Filter oder Begriff.
        </div>
      ) : (
        <motion.div
          key={`${themeParam}__${params.get("cefr") ?? ""}__${params.get("register") ?? ""}__${params.get("verb") ?? ""}__${search}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((c) => (
            <CollocationCard key={c.id} c={c} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
