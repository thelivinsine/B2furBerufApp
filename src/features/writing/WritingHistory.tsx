import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, PenLine, Target, TrendingUp, AlertCircle, Trash2, ChevronDown, Lightbulb, Sparkles } from "lucide-react";
import type { WeaknessCategory } from "@/types";
import { themeById } from "@/data/themes";
import { practiceAreaById } from "@/data/practiceAreas";
import { writingPrompts } from "@/data/writingPrompts";
import { getWritingHistory, deleteWritingEvaluation, type WritingHistoryEntry } from "@/lib/writing";
import { useSessionStore } from "@/store/useSessionStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function WeaknessFrequency({ entries }: { entries: WritingHistoryEntry[] }) {
  const navigate = useNavigate();

  const freq = entries.reduce(
    (acc, e) => {
      if (e.weakness) acc[e.weakness] = (acc[e.weakness] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<WeaknessCategory, number>>,
  );

  const sorted = (Object.entries(freq) as [WeaknessCategory, number][]).sort(
    ([, a], [, b]) => b - a,
  );

  if (sorted.length === 0) return null;

  const maxCount = sorted[0][1];
  const topArea = practiceAreaById(sorted[0][0]);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" /> Deine häufigsten Schwachstellen
        </p>

        <div className="space-y-2.5">
          {sorted.slice(0, 5).map(([weakness, count], i) => {
            const area = practiceAreaById(weakness);
            const widthPct = Math.round((count / maxCount) * 100);
            return (
              <div key={weakness} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn("font-medium", i === 0 && "text-primary")}>
                    {area?.labelDe ?? weakness}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{count}×</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      i === 0 ? "bg-primary" : "bg-muted-foreground/40",
                    )}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {topArea && (
          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">
              Größte Schwachstelle: <span className="font-medium text-foreground">{topArea.labelDe}</span>
            </p>
            <Button size="sm" onClick={() => navigate(topArea.route)}>
              <Target className="h-3.5 w-3.5" /> Jetzt üben
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HistoryEntry({
  entry,
  index,
  onDelete,
}: {
  entry: WritingHistoryEntry;
  index: number;
  onDelete: (id: string) => Promise<void>;
}) {
  const navigate = useNavigate();
  const theme = themeById(entry.theme);
  const area = practiceAreaById(entry.weakness);
  const task = writingPrompts[entry.theme]?.[entry.length];
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const remove = async () => {
    setDeleting(true);
    await onDelete(entry.id);
    // On failure the parent keeps the row and toasts; reset so the user can retry.
    setDeleting(false);
    setConfirming(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="space-y-3 p-4">
          {/* Meta row: when + what */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{formatDate(entry.created_at)}</span>
            {theme && (
              <Badge variant="muted" className="text-xs">
                {theme.titleDe}
              </Badge>
            )}
            <Badge variant="muted" className="text-xs">
              {entry.length === "short" ? "Kurz" : "Lang"}
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              {confirming ? (
                <span className="flex items-center gap-2">
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
                  aria-label="Auswertung löschen"
                  className="text-muted-foreground transition-colors hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Feedback: the headline result, visually emphasised */}
          <div className="space-y-2 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Wichtigster Tipp
              </p>
              {area && (
                <Badge className="ml-auto bg-primary/10 text-primary text-xs">{area.labelDe}</Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{entry.insight}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 shrink-0" />
              KI-generierte Rückmeldung
            </p>
          </div>

          {/* Disclosure for the original task + the learner's own text */}
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
            {expanded ? "Aufgabe & deinen Text ausblenden" : "Aufgabe & deinen Text anzeigen"}
          </button>

          {expanded && (
            <div className="space-y-3">
              {task && (
                <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Target className="h-3.5 w-3.5" /> Aufgabe
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/80">{task}</p>
                </div>
              )}
              <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <PenLine className="h-3.5 w-3.5" /> Dein Text
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {entry.text?.trim() ? entry.text : "Kein Text gespeichert."}
                </p>
              </div>
            </div>
          )}

          {/* Practice CTA */}
          {area && (
            <div className="flex justify-end border-t border-border pt-3">
              <Button size="sm" variant="outline" onClick={() => navigate(area.route)} className="gap-1.5">
                <Target className="h-3.5 w-3.5" /> {area.labelDe} üben
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function WritingHistory() {
  const [entries, setEntries] = useState<WritingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const showToast = useSessionStore((s) => s.showToast);

  const handleDelete = async (id: string) => {
    const ok = await deleteWritingEvaluation(id);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast("Auswertung gelöscht.", "success");
    } else {
      // Loud failure (e.g. the DELETE RLS policy isn't live yet), never a silent no-op.
      showToast("Löschen fehlgeschlagen. Bitte versuche es erneut.", "warning");
    }
  };

  const load = async () => {
    setLoading(true);
    setError(false);
    const data = await getWritingHistory(30);
    if (data === null) {
      setError(true);
    } else {
      setEntries(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
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
            <PenLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">Noch keine Auswertungen</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Reiche deinen ersten Text ein und sieh hier deine Schwachstellen im Verlauf.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <WeaknessFrequency entries={entries} />

      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          Letzte Auswertungen · {entries.length}
        </p>
        {entries.map((e, i) => (
          <HistoryEntry key={e.id} entry={e} index={i} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
