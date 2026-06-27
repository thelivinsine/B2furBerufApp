import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, Library } from "lucide-react";
import type { RedemittelPhrase } from "@/types";
import { redemittel, redemittelByCategory, redemittelCategories } from "@/data/redemittel";
import { iconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FacetSheet,
  ActiveFilterChip,
  applyFacets,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { SectionHeading } from "@/components/shared/misc";
import { RedemittelPractice } from "./RedemittelPractice";

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

  // Register filter for the browse view (state in ?register=).
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

  const activeChips = (selection.register ?? []).map((v) => ({
    value: v,
    label: registerLabel[v].text,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeading
        eyebrow="Redemittel"
        title="Redemittel-Training"
        description="Die wichtigsten Wendungen für Vorschläge, Zustimmung, Verhandlung und Kompromiss – verstehen und aktiv anwenden."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="browse"><Library className="h-4 w-4" /> Wendungen</TabsTrigger>
          <TabsTrigger value="practice"><Dumbbell className="h-4 w-4" /> Üben</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <FacetSheet
              items={redemittel}
              facets={REDEMITTEL_FACETS}
              selection={selection}
              onChange={setSelection}
              resultLabel={(n) => `${n} Wendung${n !== 1 ? "en" : ""} anzeigen`}
            />
            {activeChips.map((chip) => (
              <ActiveFilterChip
                key={chip.value}
                label={chip.label}
                onRemove={() =>
                  setSelection({
                    register: (selection.register ?? []).filter((v) => v !== chip.value),
                  })
                }
              />
            ))}
          </div>

          {redemittelCategories.map((cat) => {
            const Icon = iconByName(cat.icon);
            const phrases = applyFacets(redemittelByCategory(cat.id), REDEMITTEL_FACETS, selection);
            if (phrases.length === 0) return null;
            return (
              <section key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-primary/12 p-2 text-primary">
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
        </TabsContent>

        <TabsContent value="practice">
          <RedemittelPractice phrases={redemittel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
