import { useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Trophy,
  Users,
  User,
  ListChecks,
} from "lucide-react";
import type { ExamSet, Scenario } from "@/types";
import {
  startDialogue,
  currentNode,
  recordPartnerLine,
  chooseOption,
  advanceFree,
  scoreDialogue,
  type DialogueState,
} from "@/engine/dialogue";
import { XP } from "@/engine/scoring";
import { speak } from "@/engine/speech";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatSeconds, cn } from "@/lib/utils";

type Phase = "briefing" | "running" | "debrief";
type Action =
  | { type: "record_partner" }
  | { type: "choose"; optionId: string }
  | { type: "advance_free"; spoken?: string };

function reducer(state: DialogueState, action: Action): DialogueState {
  switch (action.type) {
    case "record_partner": return recordPartnerLine(state);
    case "choose": {
      const node = currentNode(state);
      const option = node.options?.find((o) => o.id === action.optionId);
      if (!option) return state;
      return chooseOption(state, option);
    }
    case "advance_free": return advanceFree(state, action.spoken);
    default: return state;
  }
}

export function ExamRunner({
  examSet,
  scenario,
  onBack,
}: {
  examSet: ExamSet;
  scenario: Scenario;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [state, dispatch] = useReducer(reducer, scenario, startDialogue);
  const [freeText, setFreeText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [selfScores, setSelfScores] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addXp = useProgressStore((s) => s.addXp);
  const completeExam = useProgressStore((s) => s.completeExam);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);
  const speechEnabled = useSettingsStore((s) => s.speechEnabled);
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const speechRate = useSettingsStore((s) => s.speechRate);

  const totalSecs = examSet.totalMinutes * 60;
  const timeLeft = Math.max(0, totalSecs - elapsed);

  useEffect(() => {
    if (phase === "running") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (elapsed >= totalSecs && phase === "running") {
      setPhase("debrief");
    }
  }, [elapsed, totalSecs, phase]);

  const node = currentNode(state);

  useEffect(() => {
    if (phase !== "running" || state.done) return;
    if (!node.options && !node.prompt) {
      const alreadyLogged = state.transcript.some((t) => t.nodeId === node.id);
      if (!alreadyLogged) {
        dispatch({ type: "record_partner" });
        if (speechEnabled && node.line) {
          speak(node.line, { voiceURI: voiceURI ?? undefined, rate: speechRate });
        }
      }
    }
  });

  useEffect(() => {
    if (state.done && phase === "running") {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("debrief");
    }
  }, [state.done, phase]);

  const dialogueScore = phase === "debrief" ? scoreDialogue(state) : null;

  const submitSelfScore = () => {
    const trueCount = Object.values(selfScores).filter(Boolean).length;
    const pct = Math.round(
      ((trueCount / examSet.rubric.length) * 0.6 + (dialogueScore?.quality ?? 70) / 100 * 0.4) * 100
    );
    completeExam(examSet.id, pct);
    addXp(XP.examComplete);
    registerSession();
    showToast(`Prüfung abgeschlossen: ${pct}%`, "success");
  };

  /* ---- Briefing ---- */
  if (phase === "briefing") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </button>
        <Card className="border-accent/40 shadow-glow">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{examSet.title}</p>
              <Badge variant="accent"><Clock className="h-3.5 w-3.5" /> {examSet.totalMinutes} Min</Badge>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aufgabenblatt</p>
              <p className="mt-1 text-sm">{examSet.taskSheet}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aspekte</p>
              <ul className="mt-1.5 space-y-1">
                {examSet.aspects.map((a) => (
                  <li key={a} className="flex items-center gap-1.5 text-sm">
                    <ListChecks className="h-3.5 w-3.5 shrink-0 text-primary" /> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
              Die Uhr startet, sobald du auf „Prüfung starten" klickst. Es gibt keine Hinweise im Prüfungsmodus.
            </div>
            <Button variant="gradient" className="w-full" onClick={() => setPhase("running")}>
              Prüfung starten <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Debrief ---- */
  if (phase === "debrief") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </button>
        <Card className="border-primary/30 shadow-glow">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              <p className="font-semibold">Prüfung beendet</p>
              <Badge variant="muted" className="ml-auto">
                {formatSeconds(elapsed)} / {formatSeconds(totalSecs)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Bewertet dich jetzt anhand des Bewertungsrasters. Sei ehrlich – das Ergebnis zählt nur für dich.
            </p>
            <div className="space-y-3">
              {examSet.rubric.map((r) => (
                <div key={r.id} className="flex items-start gap-3">
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      onClick={() => setSelfScores((s) => ({ ...s, [r.id]: true }))}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                        selfScores[r.id] === true
                          ? "border-success bg-success/15 text-success"
                          : "border-border hover:border-success/50"
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setSelfScores((s) => ({ ...s, [r.id]: false }))}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                        selfScores[r.id] === false
                          ? "border-danger bg-danger/15 text-danger"
                          : "border-border hover:border-danger/50"
                      )}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>Abbrechen</Button>
              <Button
                variant="gradient"
                className="flex-1"
                disabled={Object.keys(selfScores).length < examSet.rubric.length}
                onClick={submitSelfScore}
              >
                Ergebnis speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Running ---- */
  const isFreeSpeakNode = !!node.prompt;
  const isChoiceNode = !!(node.options?.length);
  const timerPct = (timeLeft / totalSecs) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setPhase("debrief")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="truncate min-w-0">{examSet.title}</span>
            <span className={cn("shrink-0 tabular-nums font-semibold", timeLeft < 60 && "text-danger")}>
              <Clock className="inline h-3 w-3 mr-0.5" />
              {formatSeconds(timeLeft)}
            </span>
          </div>
          <Progress value={timerPct} className={cn(timeLeft < 60 && "[&>[data-slot=bar]]:bg-danger")} />
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
          {!isFreeSpeakNode && (
            <Card className={cn(
              node.speaker === "examiner" && "border-accent/40 bg-accent/5",
              node.speaker === "narrator" && "border-dashed bg-surface/40",
            )}>
              <CardContent className="flex items-start gap-2.5 p-5">
                <div className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  node.speaker === "examiner" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                )}>
                  {node.speaker === "examiner" ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {node.speaker === "partner" ? "Partner:in" : node.speaker === "examiner" ? "Prüfer:in" : "Erzähler"}
                  </p>
                  <p className="mt-0.5 font-medium">{node.line}</p>
                </div>
              </CardContent>
            </Card>
          )}

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
                <p className="rounded-lg border border-dashed border-border bg-surface p-3 text-sm text-muted-foreground">
                  {node.prompt}
                </p>
                <input
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  aria-label="Antwort eingeben"
                  placeholder="Tippe deine Antwort …"
                  className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <Button variant="gradient" className="w-full" onClick={() => {
                  dispatch({ type: "advance_free", spoken: freeText || undefined });
                  setFreeText("");
                }}>
                  Weiter <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {isChoiceNode && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deine Antwort</p>
              {node.options!.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => dispatch({ type: "choose", optionId: opt.id })}
                  className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3.5 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {opt.text}
                </button>
              ))}
            </div>
          )}

          {!isChoiceNode && !isFreeSpeakNode && node.next && !state.done && (
            <Button variant="outline" className="w-full" onClick={() => dispatch({ type: "advance_free" })}>
              Weiter <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
