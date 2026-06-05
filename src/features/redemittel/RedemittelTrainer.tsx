import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Library } from "lucide-react";
import { redemittel, redemittelByCategory, redemittelCategories } from "@/data/redemittel";
import { iconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { SectionHeading } from "@/components/shared/misc";
import { RedemittelPractice } from "./RedemittelPractice";

const registerLabel: Record<string, { text: string; variant: "muted" | "default" | "accent" }> = {
  neutral: { text: "neutral", variant: "muted" },
  formal: { text: "formell", variant: "default" },
  diplomatic: { text: "diplomatisch", variant: "accent" },
};

export function RedemittelTrainer() {
  const [tab, setTab] = useState("browse");

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

        <TabsContent value="browse" className="space-y-8">
          {redemittelCategories.map((cat) => {
            const Icon = iconByName(cat.icon);
            const phrases = redemittelByCategory(cat.id);
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
                <div className="grid gap-3 sm:grid-cols-2">
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
