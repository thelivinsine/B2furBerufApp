import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Lightbulb,
  Loader2,
  MessagesSquare,
  Mic,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { scenarioById } from "@/data/dialogues";
import { examSets } from "@/data/examSets";
import { briefGoals } from "@/engine/speaking";
import {
  deleteSpeakingConversation,
  getSpeakingHistory,
  type SpeakingHistoryEntry,
} from "@/lib/speaking";
import { useSessionStore } from "@/store/useSessionStore";
import { FeedbackLangChip } from "@/features/writing/FeedbackLang";
import {
  CorrectionToggle,
  FixTiles,
  MarkedParagraphs,
  MAX_FIX_TILES,
  useCorrectionDiff,
  type CorrectionViewMode,
} from "@/features/writing/correction";
import { examSetTitle } from "@/features/exam/partMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The Sprechen Verlauf (s196).
 *
 * Founder s196: "the Verlauf section isn't updated with this progress, it's
 * basically lost." It was: `speaking_conversations` has recorded every spoken
 * conversation since s193 and no surface ever read it back, so the free
 * Sprechtrainer was the one trainer whose work vanished the moment the learner
 * left the debrief. CLAUDE.md already said the untimed trainers "keep their own
 * Verlauf on their own pages"; Schreiben had one, Sprechen never got it.
 *
 * It is deliberately Schreiben's Verlauf row, not a new one: the same compact
 * disclosure, the same `features/writing/correction.tsx` Original/Korrigiert
 * card, the same tip block with its DE/EN chip. A correction looks identical
 * whichever trainer produced it (s172).
 *
 * A conversation whose debrief never arrived still appears here, with its
 * transcript and without a correction. That is the point: the work is on
 * record even when the grader was unreachable.
 */

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" }).format(
    new Date(iso),
  );
}

/** The Aufgabe a recorded conversation was held against, resolved by its id. */
function briefOf(entry: SpeakingHistoryEntry): { title: string; goals: string[] } | null {
  if (!entry.brief_id) return null;
  const scenario = scenarioById(entry.brief_id);
  if (scenario) return { title: scenario.title, goals: briefGoals(scenario) };
  const set = examSets.find((e) => e.id === entry.brief_id);
  if (set) return { title: examSetTitle(set.title), goals: set.aspects.slice(0, 5) };
  return null;
}

function ConversationRow({
  entry,
  index,
  onDelete,
}: {
  entry: SpeakingHistoryEntry;
  index: number;
  onDelete: (id: string) => Promise<void>;
}) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tipEnglish, setTipEnglish] = useState(false);
  const [view, setView] = useState<CorrectionViewMode>("corr");

  const brief = useMemo(() => briefOf(entry), [entry]);
  const spoken = entry.learner_text?.trim() ?? "";
  const corrected = entry.corrected_text?.trim() ?? "";
  const graded = !!entry.tip?.trim();
  const { paragraphs, changes } = useCorrectionDiff(spoken, corrected || spoken);
  const goalsMet = entry.goals_met ?? [];
  const met = goalsMet.filter(Boolean).length;

  const remove = async () => {
    setDeleting(true);
    await onDelete(entry.id);
    setDeleting(false);
    setConfirming(false);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.16 }}
    >
      <Card className="overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full flex-wrap items-center gap-2 p-4 text-left transition-colors hover:bg-muted/40"
        >
          <span className="text-xs font-medium tabular-nums text-muted-foreground sm:hidden">
            {formatDateShort(entry.created_at)}
          </span>
          <span className="hidden text-xs font-medium tabular-nums text-muted-foreground sm:inline">
            {formatDate(entry.created_at)}
          </span>
          {brief && (
            <Badge variant="muted" className="hidden max-w-[14rem] truncate sm:inline-flex">
              {brief.title}
            </Badge>
          )}
          <Badge variant="outline">{entry.exam ? "Modelltest" : "Gespräch"}</Badge>
          <span className="ml-auto flex items-center gap-2">
            {entry.score != null && (
              <Badge variant="muted" className="tabular-nums">
                {entry.score} %
              </Badge>
            )}
            {/* Aufgabenerfüllung at a glance: the fact the debrief is actually
                about. An ungraded conversation says so instead of showing 0/N,
                which would read as a bad result rather than as no result. */}
            {graded && goalsMet.length > 0 ? (
              <span className="rounded-md border border-accent/50 bg-accent/20 px-2 py-0.5 text-xs font-semibold tabular-nums text-accent-ink dark:border-accent/25 dark:bg-accent/10">
                {met}/{goalsMet.length} Punkte
              </span>
            ) : (
              !graded && <Badge variant="muted">Ohne Bewertung</Badge>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </span>
        </button>

        {expanded && (
          <CardContent className="space-y-3 border-t border-border p-4">
            {brief && (
              <div className="space-y-1.5 rounded-xl border border-accent/50 bg-accent/20 p-3.5 dark:border-accent/25 dark:bg-accent/10">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                  <MessagesSquare className="h-3.5 w-3.5" /> {brief.title}
                </p>
                <ul className="space-y-1 pt-0.5">
                  {brief.goals.map((goal, i) => (
                    <li key={goal} className="flex items-start gap-2 text-sm leading-relaxed">
                      {graded && goalsMet.length > i ? (
                        goalsMet[i] ? (
                          <Check className="mt-[0.2rem] h-3.5 w-3.5 shrink-0 text-success" />
                        ) : (
                          <X className="mt-[0.2rem] h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )
                      ) : (
                        <span
                          aria-hidden
                          className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent-ink"
                        />
                      )}
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Mic className="h-3.5 w-3.5" /> Was du gesagt hast
                </p>
                {corrected && corrected !== spoken && (
                  <CorrectionToggle view={view} onChange={setView} />
                )}
              </div>
              {spoken ? (
                <>
                  <MarkedParagraphs paragraphs={paragraphs} view={view} />
                  {changes.length > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      <FixTiles changes={changes} max={MAX_FIX_TILES} />
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Das Transkript wurde inzwischen gelöscht.
                </p>
              )}
            </div>

            {graded ? (
              <div className="space-y-2 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Wichtigster Tipp
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {tipEnglish && entry.tip_en ? entry.tip_en : entry.tip}
                  {entry.tip_en && (
                    <FeedbackLangChip
                      showEnglish={tipEnglish}
                      onChange={setTipEnglish}
                      className="ml-1.5 align-middle"
                    />
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Für dieses Gespräch gibt es keine Rückmeldung. Dein Gespräch ist trotzdem
                gespeichert.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {confirming ? (
                <span className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={deleting}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={remove}
                    disabled={deleting}
                    className="flex items-center gap-1 text-xs font-medium text-danger hover:underline"
                  >
                    {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Löschen
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  aria-label="Gespräch löschen"
                  className="text-muted-foreground transition-colors hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 shrink-0" />
                KI-generierte Rückmeldung
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

export function SprechenHistory({ onPractice }: { onPractice: () => void }) {
  const [entries, setEntries] = useState<SpeakingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const showToast = useSessionStore((s) => s.showToast);

  const load = async () => {
    setLoading(true);
    const rows = await getSpeakingHistory(30);
    setEntries(rows ?? []);
    setFailed(rows === null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await deleteSpeakingConversation(id);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast("Gespräch gelöscht.", "success");
    } else {
      showToast("Löschen fehlgeschlagen. Bitte versuche es erneut.", "warning");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (failed) {
    return (
      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="space-y-2">
            <p className="font-medium">Verlauf konnte nicht geladen werden</p>
            <Button size="sm" variant="outline" onClick={load}>
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-muted/50 p-4">
            <MessagesSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">Noch keine Gespräche</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Führe dein erstes Gespräch, dann steht hier deine Rückmeldung.
          </p>
          <Button variant="gradient" onClick={onPractice}>
            <Mic className="h-4 w-4" /> Erstes Gespräch führen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-eyebrow text-muted-foreground">Letzte Gespräche</p>
        <Badge variant="muted" className="tabular-nums">
          {entries.length}
        </Badge>
      </div>
      {entries.map((entry, i) => (
        <ConversationRow key={entry.id} entry={entry} index={i} onDelete={handleDelete} />
      ))}
    </div>
  );
}
