import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookMarked, Lightbulb, Volume2, GraduationCap } from "lucide-react";
import type { GrammarGroup, GrammarTopic } from "@/types";
import { grammar, grammarById } from "@/data/grammar";
import { iconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { SectionHeading, EmptyState } from "@/components/shared/misc";
import { GrammarDrillCard } from "./GrammarDrillCard";

/** Display metadata for each grammar group. */
const groupMeta: Record<GrammarGroup, { labelDe: string; icon: string }> = {
  connectors: { labelDe: "Konnektoren", icon: "Link2" },
  relativeClauses: { labelDe: "Relativsätze", icon: "GitBranch" },
  prepositionalPronouns: { labelDe: "da-/wo-Wörter", icon: "CornerDownRight" },
  collocations: { labelDe: "Nomen-Verb-Verbindungen", icon: "Combine" },
  verbPosition: { labelDe: "Verbstellung", icon: "MoveHorizontal" },
  subordinate: { labelDe: "Nebensätze", icon: "CornerDownRight" },
  cases: { labelDe: "Kasus", icon: "ArrowRightLeft" },
  konjunktiv2: { labelDe: "Konjunktiv II", icon: "Layers" },
  modals: { labelDe: "Modalverben", icon: "KeyRound" },
  passive: { labelDe: "Passiv", icon: "Boxes" },
};

const groupOrder: GrammarGroup[] = [
  "connectors",
  "relativeClauses",
  "prepositionalPronouns",
  "verbPosition",
  "subordinate",
  "cases",
  "collocations",
  "konjunktiv2",
  "modals",
  "passive",
];

export function GrammarHub() {
  const [params, setParams] = useSearchParams();
  const topicId = params.get("topic");
  const topic = topicId ? grammarById(topicId) : undefined;

  // Hook must run unconditionally (before any early return).
  const grouped = useMemo(() => {
    return groupOrder
      .map((g) => ({ group: g, topics: grammar.filter((t) => t.group === g) }))
      .filter((x) => x.topics.length > 0);
  }, []);

  if (topicId && topic) {
    return <GrammarTopicView topic={topic} onBack={() => setParams({}, { replace: true })} />;
  }

  const open = (id: string) => setParams({ topic: id });

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Grammatik"
        title="Grammatik-Werkstatt"
        description="Die wichtigsten B2-Strukturen verständlich erklärt – mit Mustern, Beispielen, typischen Fehlern und Mini-Übungen mit sofortigem Feedback."
      />

      {grouped.map(({ group, topics }) => {
        const meta = groupMeta[group];
        const Icon = iconByName(meta.icon);
        return (
          <section key={group} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-primary/12 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold leading-tight">{meta.labelDe}</h3>
              <Badge variant="muted" className="ml-auto">{topics.length}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((t, i) => (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  onClick={() => open(t.id)}
                  className="text-left"
                >
                  <Card className="card-hover h-full">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold leading-snug">{t.titleDe}</p>
                        <Badge variant="muted">{t.drills.length} Übg.</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{t.purpose}</p>
                      <p className="rounded-md bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">{t.pattern}</p>
                    </CardContent>
                  </Card>
                </motion.button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function GrammarTopicView({ topic, onBack }: { topic: GrammarTopic; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Übersicht
        </Button>
        <Badge variant="muted" className="ml-auto">{groupMeta[topic.group].labelDe}</Badge>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{topic.title}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{topic.titleDe}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{topic.purpose}</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm leading-relaxed">{topic.explanation}</p>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Muster</p>
            <p className="mt-0.5 font-mono text-sm">{topic.pattern}</p>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold"><BookMarked className="h-4 w-4 text-primary" /> Beispiele</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {topic.examples.map((ex, i) => (
            <Card key={i}>
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div>
                  <p className="font-medium">{ex.de}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{ex.en}</p>
                </div>
                <SpeakButton text={ex.de} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pitfalls */}
      {topic.pitfalls && topic.pitfalls.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4 text-warning" /> Typische Fehler</h2>
          <ul className="space-y-2">
            {topic.pitfalls.map((p, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm">
                <span className="mt-0.5 text-warning">⚠</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Drills */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold"><GraduationCap className="h-4 w-4 text-primary" /> Übungen</h2>
        <div className="space-y-3">
          {topic.drills.length > 0 ? (
            topic.drills.map((d) => <GrammarDrillCard key={d.id} drill={d} />)
          ) : (
            <EmptyState icon={Volume2} title="Keine Übungen" description="Für dieses Thema gibt es noch keine Übungen." />
          )}
        </div>
      </section>

      <Button asChild variant="gradient" className="w-full sm:w-auto">
        <Link to="/quiz">Wissen im Quiz testen</Link>
      </Button>
    </div>
  );
}
