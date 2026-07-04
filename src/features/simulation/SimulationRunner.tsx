import { useEffect, useReducer, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Lightbulb,
  ChevronRight,
  User,
  Users,
  Info,
  Trophy,
  RotateCw,
  Eye,
  Check,
  Mic,
} from "lucide-react";
import type { Scenario } from "@/types";
import {
  startDialogue,
  currentNode,
  recordPartnerLine,
  chooseOption,
  advanceFree,
  useHint,
  scoreDialogue,
  type DialogueState,
} from "@/engine/dialogue";
import { speak } from "@/engine/speech";
import { XP } from "@/engine/scoring";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/misc";
import { cn } from "@/lib/utils";

type Action =
  | { type: "record_partner" }
  | { type: "choose"; optionId: string }
  | { type: "advance_free"; spoken?: string }
  | { type: "hint" }
  | { type: "restart"; scenario: Scenario };

function reducer(state: DialogueState, action: Action): DialogueState {
  switch (action.type) {
    case "record_partner":
      return recordPartnerLine(state);
    case "choose": {
      const node = currentNode(state);
      const option = node.options?.find((o) => o.id === action.optionId);
      if (!option) return state;
      return chooseOption(state, option);
    }
    case "advance_free":
      return advanceFree(state, action.spoken);
    case "hint":
      return useHint(state);
    case "restart":
      return startDialogue(action.scenario);
    default:
      return state;
  }
}

export function SimulationRunner({
  scenario,
  onBack,
}: {
  scenario: Scenario;
  onBack: () => void;
}) {
  const [state, dispatch] = useReducer(reducer, scenario, startDialogue);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [freeRevealed, setFreeRevealed] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);

  const addXp = useProgressStore((s) => s.addXp);
  const completeScenario = useProgressStore((s) => s.completeScenario);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);
  const speechEnabled = useSettingsStore((s) => s.speechEnabled);
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const voiceVariety = useSettingsStore((s) => s.voiceVariety);
  const speechRate = useSettingsStore((s) => s.speechRate);

  const node = currentNode(state);

  // Auto-record partner/narrator line when we land on one.
  useEffect(() => {
    if (state.done) return;
    if (!node.options && !node.prompt) {
      const alreadyLogged = state.transcript.some((t) => t.nodeId === node.id);
      if (!alreadyLogged) {
        dispatch({ type: "record_partner" });
        if (speechEnabled && node.line) {
          speak(node.line, { voiceURI: voiceURI ?? undefined, variety: voiceVariety, rate: speechRate });
        }
      }
    }
  });

  // On finish
  useEffect(() => {
    if (state.done) {
      completeScenario(scenario.id);
      addXp(XP.scenarioComplete);
      registerSession();
      showToast("Szenario abgeschlossen!", "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.done]);

  const score = state.done ? scoreDialogue(state) : null;

  const totalNodes = Object.keys(scenario.nodes).length;
  const progressVal = (state.transcript.length / Math.max(totalNodes * 2, 1)) * 100;

  const handleHint = () => {
    dispatch({ type: "hint" });
  };

  const visibleHints = node.hints?.slice(0, state.hintsUsed) ?? [];
  const hasMoreHints = (node.hints?.length ?? 0) > state.hintsUsed;

  /* ---- Context card ---- */
  if (contextOpen) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </button>
        <Card className="border-primary/30 shadow-glow">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2 text-primary"><Info className="h-5 w-5" /></div>
              <p className="font-semibold">{scenario.title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aufgabe</p>
              <p className="text-sm">{scenario.task}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kontext</p>
              <p className="text-sm text-muted-foreground">{scenario.context}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {scenario.targetRedemittel.map((r) => (
                <Badge key={r} variant="muted">{r}</Badge>
              ))}
            </div>
            <Button variant="gradient" className="w-full" onClick={() => setContextOpen(false)}>
              Simulation starten <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Done screen ---- */
  if (state.done && score) {
    const color = score.quality >= 80 ? "text-success" : score.quality >= 55 ? "text-warning" : "text-danger";
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Alle Szenarien
        </button>
        <EmptyState
          icon={Trophy}
          title={`Qualität: ${score.quality}%`}
          description={
            score.quality >= 80
              ? "Ausgezeichnet! Du hast den Dialog überzeugend geführt."
              : score.quality >= 55
              ? "Gute Leistung – übe die schwächeren Optionen nochmal."
              : "Wiederhole das Szenario und nutze mehr Redemittel."
          }
          action={
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>Alle Szenarien</Button>
              <Button variant="gradient" onClick={() => {
                dispatch({ type: "restart", scenario });
                setFeedback(null);
                setFreeText("");
                setFreeRevealed(false);
                setContextOpen(true);
              }}>
                <RotateCw className="h-4 w-4" /> Nochmal
              </Button>
            </div>
          }
        />

        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold">Statistik</p>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className={cn("text-xl font-bold", color)}>{score.quality}%</p>
                <p className="text-xs text-muted-foreground">Qualität</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xl font-bold">{score.turns}</p>
                <p className="text-xs text-muted-foreground">Züge</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xl font-bold">{score.hintsUsed}</p>
                <p className="text-xs text-muted-foreground">Hinweise</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-5">
            <p className="text-sm font-semibold">Gesprächsprotokoll</p>
            {state.transcript.map((t, i) => (
              <div key={i} className={cn("flex gap-2 text-sm", t.speaker === "candidate" ? "justify-end" : "justify-start")}>
                {t.speaker !== "candidate" && (
                  <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    {t.speaker === "examiner" ? <Users className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-primary" />}
                  </div>
                )}
                <p className={cn(
                  "max-w-xs rounded-xl px-3 py-2 text-sm leading-snug",
                  t.speaker === "candidate"
                    ? "bg-primary/10 text-primary"
                    : t.speaker === "narrator"
                    ? "italic text-muted-foreground"
                    : "bg-muted/60"
                )}>
                  {t.text}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Running dialogue ---- */
  const isFreeSpeakNode = !!node.prompt;
  const isChoiceNode = !!(node.options?.length);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate min-w-0">{scenario.title}</span>
            <span className="shrink-0">{state.turns} Züge</span>
          </div>
          <Progress value={Math.min(progressVal, 95)} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-4"
        >
          {/* Partner/examiner/narrator line */}
          {!isFreeSpeakNode && (
            <Card className={cn(
              "border",
              node.speaker === "examiner" && "border-accent/40 bg-accent/5",
              node.speaker === "narrator" && "border-dashed border-border bg-surface/40",
              node.speaker === "partner" && "border-border",
            )}>
              <CardContent className="p-5">
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    node.speaker === "examiner" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                  )}>
                    {node.speaker === "examiner" ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {node.speaker === "partner" ? "Partner:in" : node.speaker === "examiner" ? "Prüfer:in" : "Erzähler"}
                    </p>
                    <p className="mt-0.5 font-medium">{node.line}</p>
                    {node.gloss && (
                      <p className="mt-1 text-xs italic text-muted-foreground">{node.gloss}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Free speak node */}
          {isFreeSpeakNode && (
            <Card className="border-accent/40 bg-accent/5">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Prüfer:in</p>
                    <p className="mt-0.5 font-medium">{node.line}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-surface p-3 text-sm text-muted-foreground border border-dashed border-border">
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <Mic className="h-4 w-4 text-primary" /> Deine Aufgabe
                  </p>
                  <p className="mt-1">{node.prompt}</p>
                </div>
                <input
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Tippe deine Antwort (optional) …"
                  className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                {freeRevealed && node.model && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-primary/30 bg-surface p-4 text-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Musterlösung</p>
                    <p className="italic">{node.model}</p>
                  </motion.div>
                )}
                <div className="flex gap-2">
                  {node.model && !freeRevealed && (
                    <Button variant="outline" size="sm" onClick={() => setFreeRevealed(true)}>
                      <Eye className="h-4 w-4" /> Musterlösung
                    </Button>
                  )}
                  <Button variant="gradient" className="ml-auto" onClick={() => {
                    dispatch({ type: "advance_free", spoken: freeText || undefined });
                    addXp(XP.simulationTurn);
                    setFreeText("");
                    setFreeRevealed(false);
                  }}>
                    Weiter <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback toast */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-sm text-primary"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hints */}
          {visibleHints.length > 0 && (
            <div className="space-y-1.5">
              {visibleHints.map((h, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                  {h}
                </div>
              ))}
            </div>
          )}

          {/* Choice options */}
          {isChoiceNode && !feedback && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deine Antwort</p>
              {node.options!.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    dispatch({ type: "choose", optionId: opt.id });
                    addXp(XP.simulationTurn);
                    if (opt.feedback) {
                      setFeedback(opt.feedback);
                      setTimeout(() => setFeedback(null), 3500);
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3.5 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {opt.text}
                </button>
              ))}
            </div>
          )}

          {/* Auto-advance for narration */}
          {!isChoiceNode && !isFreeSpeakNode && node.next && !state.done && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => dispatch({ type: "advance_free" })}
            >
              Weiter <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Hint button */}
          {isChoiceNode && !feedback && hasMoreHints && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleHint}>
              <Lightbulb className="h-4 w-4" /> Hinweis anzeigen
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
