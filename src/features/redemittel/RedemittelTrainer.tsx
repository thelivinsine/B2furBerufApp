import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, Library, MessageSquareText } from "lucide-react";
import type { RedemittelPhrase } from "@/types";
import { redemittel, redemittelByCategory, redemittelCategories } from "@/data/redemittel";
import { iconByName } from "@/lib/icons";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  applyFacets,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { BrowseToolbar } from "@/features/shared/BrowseToolbar";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { HubHero } from "@/components/shared/HubHero";
import { defaultVisibleBands, hiddenBandsLabel } from "@/lib/cefr";
import { RedemittelPractice } from "./RedemittelPractice";

function normalise(s: string) {
  return s.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c));
}

const registerLabel: Record<string, { text: string; variant: "muted" | "default" | "accent" }> = {
  neutral: { text: "neutral", variant: "muted" },
  formal: { text: "formell", variant: "default" },
  diplomatic: { text: "diplomatisch", variant: "accent" },
};

const registerPresent = ["neutral", "formal", "diplomatic"].filter((r) =>
  redemittel.some((p) => p.register === r),
);
const REDEMITTEL_FACETS: FacetDef<RedemittelPhrase>[] = [
  {
    id: "register",
    label: "Register",
    options: registerPresent.map((r) => ({ value: r, label: registerLabel[r].text })),
    get: (p) => p.register,
  },
];

export function RedemittelTrainer() {
  const [tab, setTab] = useState("browse");
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const level = useSettingsStore((s) => s.level);
  const [showAllLevels, setShowAllLevels] = useState(false);

  const category = params.get("cat") ?? "all";

  const selection: FacetSelection = useMemo(() => {
    const s: FacetSelection = {};
    const raw = params.get("register");
    if (raw) s.register = raw.split(",");
    return s;
  }, [params]);

  const setSelection = (next: FacetSelection) => {
    const p = new URLSearchParams(params);
    const v = next.register;
    if (v && v.length) p.set("register", v.join(","));
    else p.delete("register");
    setParams(p, { replace: true });
  };

  const setCategory = (cat: string) => {
    const p = new URLSearchParams(params);
    if (cat === "all") p.delete("cat");
    else p.set("cat", cat);
    setParams(p, { replace: true });
  };

  const removeFacetValue = (facetId: string, value: string) =>
    setSelection({
      ...selection,
      [facetId]: (selection[facetId] ?? []).filter((v) => v !== value),
    });

  const activeChips = REDEMITTEL_FACETS.flatMap((f) =>
    (selection[f.id] ?? []).map((v) => ({
      facetId: f.id,
      value: v,
      label: f.options.find((o) => o.value === v)?.label ?? v,
    })),
  );

  const categoryScoped = useMemo(() => {
    if (category === "all") return redemittel;
    return redemittelByCategory(category as RedemittelPhrase["category"]);
  }, [category]);

  // Tier-0 personalized default (UX overhaul Phase 2): default to the
  // learner's CEFR band + one step up, with a quiet escape. No CEFR facet
  // exists here (Register is the only one), so the escape link is the only
  // override. Never activates if it would leave nothing to show.
  const visibleBands = useMemo(() => defaultVisibleBands(level), [level]);
  const bandNonEmpty = useMemo(
    () => categoryScoped.some((p) => !p.cefr || visibleBands.includes(p.cefr)),
    [categoryScoped, visibleBands],
  );
  const bandActive = !showAllLevels && !search.trim() && bandNonEmpty;
  const inBand = (p: RedemittelPhrase) => !bandActive || !p.cefr || visibleBands.includes(p.cefr);
  const bandLimited = useMemo(
    () => (bandActive ? categoryScoped.filter(inBand) : categoryScoped),
    [categoryScoped, bandActive, visibleBands],
  );
  const hiddenLabel = bandActive && bandLimited.length < categoryScoped.length ? hiddenBandsLabel(level) : null;

  const searched = useMemo(() => {
    if (!search.trim()) return bandLimited;
    const q = normalise(search.trim());
    return bandLimited.filter(
      (p) => normalise(p.de).includes(q) || normalise(p.en).includes(q),
    );
  }, [bandLimited, search]);

  const filtered = useMemo(
    () => applyFacets(searched, REDEMITTEL_FACETS, selection),
    [searched, selection],
  );

  const primaryOptions = [
    { value: "all", label: "Alle Kategorien", count: redemittel.length },
    ...redemittelCategories.map((cat) => ({
      value: cat.id,
      label: cat.labelDe,
      count: redemittelByCategory(cat.id).length,
    })),
  ];

  const categoriesToRender =
    category === "all"
      ? redemittelCategories
      : redemittelCategories.filter((c) => c.id === category);

  return (
    <div className="space-y-4 sm:space-y-6">
      <HubHero
        icon={MessageSquareText}
        gradient="from-emerald-500 to-teal-500"
        eyebrow="Redemittel"
        title="Redemittel-Training"
        description="Die wichtigsten Wendungen für Vorschläge, Zustimmung, Verhandlung und Kompromiss. Verstehen und aktiv anwenden."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="browse"><Library className="h-4 w-4" /> Wendungen</TabsTrigger>
          <TabsTrigger value="practice"><Dumbbell className="h-4 w-4" /> Üben</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <BrowseToolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Suche nach Wendung, Übersetzung …"
            primary={{ value: category, onChange: setCategory, options: primaryOptions }}
            facetItems={searched}
            facets={REDEMITTEL_FACETS}
            facetSelection={selection}
            onFacetChange={setSelection}
            resultLabel={(n) => `${n} Wendung${n !== 1 ? "en" : ""} anzeigen`}
            activeChips={activeChips}
            onRemoveChip={removeFacetValue}
          />

          {hiddenLabel && (
            <button
              onClick={() => setShowAllLevels(true)}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              Auch {hiddenLabel} zeigen ({categoryScoped.length - bandLimited.length})
            </button>
          )}

          {categoriesToRender.map((cat) => {
            const Icon = iconByName(cat.icon);
            const catPhrases = category === "all"
              ? redemittelByCategory(cat.id).filter(inBand)
              : searched;
            const phrases = category === "all"
              ? applyFacets(
                  search.trim()
                    ? catPhrases.filter((p) => {
                        const q = normalise(search.trim());
                        return normalise(p.de).includes(q) || normalise(p.en).includes(q);
                      })
                    : catPhrases,
                  REDEMITTEL_FACETS,
                  selection,
                )
              : filtered;
            if (phrases.length === 0) return null;
            return (
              <section key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold leading-tight">{cat.labelDe}</h3>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <Badge variant="muted" className="ml-auto">{phrases.length}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {phrases.map((p, i) => {
                    const reg = registerLabel[p.register];
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.25) }}
                      >
                        <Card className="card-hover h-full">
                          <CardContent className="space-y-2 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold leading-snug">{p.de}</p>
                              <SpeakButton text={p.de} />
                            </div>
                            <p className="text-sm text-muted-foreground">{p.en}</p>
                            {p.note && <p className="text-xs text-primary">💡 {p.note}</p>}
                            <div className="flex items-center justify-between border-t border-border pt-2">
                              <p className="text-xs italic text-muted-foreground">„{p.example.de}"</p>
                              <Badge variant={reg.variant}>{reg.text}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              Keine Ergebnisse. Versuche einen anderen Filter oder Begriff.
            </div>
          )}
        </TabsContent>

        <TabsContent value="practice">
          <RedemittelPractice phrases={redemittel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
