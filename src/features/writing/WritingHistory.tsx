import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, PenLine, Target, TrendingUp, AlertCircle, Trash2 } from "lucide-react";
import type { WeaknessCategory } from "@/types";
import { themeById } from "@/data/themes";
import { practiceAreaById } from "@/data/practiceAreas";
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
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        <CardContent className="space-y-2.5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</span>
            {theme && (
              <Badge variant="muted" className="text-xs">
                {theme.titleDe}
              </Badge>
            )}
            <Badge variant="muted" className="text-xs">
              {entry.length === "short" ? "Kurz" : "Lang"}
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              {area && (
                <Badge className="bg-primary/10 text-primary text-xs">{area.labelDe}</Badge>
              )}
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

          <p className="text-sm leading-relaxed text-foreground/90">{entry.insight}</p>

          {area && (
            <button
              onClick={() => navigate(area.route)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {area.labelDe} üben →
            </button>
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
