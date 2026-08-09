import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLang } from "./adminI18n";
import {
  fetchAiReconciliation,
  fetchAiSyncState,
  refreshAiReconciliation,
  type AiReconciliationRow,
  type AiSyncState,
} from "@/lib/adminApi";

/**
 * "Ours vs theirs" for AI cost (founder s205: "how do we make sure we see real
 * usage and costs and not just estimates?").
 *
 * Our own figure is DERIVED: real token counts times a rate table we maintain.
 * Anthropic's is what it actually charged. The card exists for the gap between
 * them, so the layout puts the two numbers next to each other and the delta
 * last; a single figure cannot tell you it has drifted.
 *
 * Deliberate shapes here:
 *  - **Anthropic only.** Anthropic is the only provider we can currently read a
 *    bill from. Gemini has no comparable API (its 0 stays an assumption about
 *    the free tier) and OpenAI needs its own key, so neither is shown as
 *    reconciled rather than being shown as agreeing.
 *  - **A missing provider number is blank, never 0.** "Not reported yet" and
 *    "cost nothing" are different facts.
 *  - **Staleness is louder than the numbers.** The founder's admin key expires
 *    every 30 days by choice, so an expired key has to read as a broken
 *    comparison, not as quiet agreement.
 *
 * Visual language is the existing admin card verbatim (same shell, type scale
 * and tone colours as the meters beside it). A richer view owes a preview round.
 */

/** Above this, the two sides have diverged enough to look at. */
const DELTA_ALERT_USD = 0.5;
/** Refresh on open at most this often; there is no cron (see the function). */
const AUTO_REFRESH_MS = 60 * 60 * 1000;

function usd(n: number): string {
  return `$${n.toFixed(n < 1 ? 4 : 2)}`;
}

function ago(iso: string | null, t: (de: string, en: string) => string): string {
  if (!iso) return t("noch nie", "never");
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return t("gerade eben", "just now");
  if (mins < 60) return t(`vor ${mins} Min.`, `${mins} min ago`);
  const hours = Math.round(mins / 60);
  if (hours < 24) return t(`vor ${hours} Std.`, `${hours} h ago`);
  return t(`vor ${Math.round(hours / 24)} Tagen`, `${Math.round(hours / 24)} d ago`);
}

export function AiCostReconciliation() {
  const { t } = useAdminLang();
  const [rows, setRows] = useState<AiReconciliationRow[] | null>(null);
  const [state, setState] = useState<AiSyncState | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [r, s] = await Promise.all([fetchAiReconciliation(14), fetchAiSyncState()]);
    setRows(r.filter((row) => row.provider === "anthropic"));
    setState(s.find((x) => x.provider === "anthropic") ?? null);
    return s.find((x) => x.provider === "anthropic") ?? null;
  }, []);

  const refresh = useCallback(async () => {
    setBusy(true);
    setNote(null);
    const res = await refreshAiReconciliation(14);
    if (!res.ok) setNote(res.message ?? t("Der Abgleich schlug fehl.", "The check failed."));
    await load();
    setBusy(false);
  }, [load, t]);

  // On open: read what we have, and only reach out to Anthropic if the last
  // successful check is more than an hour old. There is no scheduled job, so
  // this is what keeps the numbers current without a second stored credential.
  useEffect(() => {
    let live = true;
    void load().then((s) => {
      if (!live) return;
      const stale = !s?.lastOkAt || Date.now() - new Date(s.lastOkAt).getTime() > AUTO_REFRESH_MS;
      if (stale) void refresh();
    });
    return () => {
      live = false;
    };
  }, [load, refresh]);

  const oursTotal = (rows ?? []).reduce((s, r) => s + r.oursUsd, 0);
  const theirsTotal = (rows ?? []).reduce((s, r) => s + (r.theirsUsd ?? 0), 0);
  const comparable = (rows ?? []).filter((r) => r.theirsUsd !== null);
  const delta = comparable.reduce((s, r) => s + ((r.theirsUsd ?? 0) - r.oursUsd), 0);
  const drifted = Math.abs(delta) >= DELTA_ALERT_USD;
  const error = state?.lastError ?? null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold">
          {t("KI-Kosten: unsere Zahl vs. Anthropic", "AI cost: our figure vs Anthropic")}
        </h2>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {t("Abgleichen", "Check")}
        </button>
      </div>

      {/* The health of the comparison comes before the comparison: numbers with
          a broken sync behind them are worse than no numbers. */}
      {(error || note) && (
        <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-danger/10 p-2 text-xs font-medium text-danger">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{note ?? error}</span>
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("Unsere Schätzung", "Our estimate")}
          </div>
          <div className="mt-1 text-lg font-extrabold tabular-nums">{usd(oursTotal)}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("Anthropic sagt", "Anthropic says")}
          </div>
          <div className="mt-1 text-lg font-extrabold tabular-nums">
            {state?.lastOkAt ? usd(theirsTotal) : "–"}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("Differenz", "Difference")}
          </div>
          <div
            className={cn(
              "mt-1 text-lg font-extrabold tabular-nums",
              drifted ? "text-warning" : "text-success",
            )}
          >
            {comparable.length ? `${delta >= 0 ? "+" : ""}${usd(delta)}` : "–"}
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {t("Letzte 14 Tage", "Last 14 days")} ·{" "}
        {t("zuletzt geprüft", "last checked")} {ago(state?.lastOkAt ?? null, t)}
      </p>

      {rows === null ? (
        <div className="mt-3 flex justify-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t(
            "Noch keine KI-Aufrufe in diesem Zeitraum.",
            "No AI calls in this period yet.",
          )}
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs tabular-nums">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-1 text-left font-bold">{t("Tag", "Day")}</th>
                <th className="py-1 text-right font-bold">{t("Aufrufe", "Calls")}</th>
                <th className="py-1 text-right font-bold">{t("Wir", "Us")}</th>
                <th className="py-1 text-right font-bold">{t("Anthropic", "Anthropic")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 14).map((r) => (
                <tr key={r.day} className="border-t border-border/60">
                  <td className="py-1 text-left">{r.day.slice(5)}</td>
                  <td className="py-1 text-right text-muted-foreground">{r.calls}</td>
                  <td className="py-1 text-right">{usd(r.oursUsd)}</td>
                  <td
                    className={cn(
                      "py-1 text-right",
                      r.theirsUsd === null && "text-muted-foreground",
                    )}
                  >
                    {/* Blank, not zero: the provider may simply not have
                        reported this day yet. */}
                    {r.theirsUsd === null ? "–" : usd(r.theirsUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {t(
          "Nur Anthropic lässt sich abgleichen. Gemini läuft im Gratis-Kontingent und wird mit $0 verbucht, was eine Annahme ist und keine Messung; OpenAI bräuchte einen eigenen Schlüssel.",
          "Only Anthropic can be reconciled. Gemini runs inside the free tier and is booked at $0, which is an assumption rather than a measurement; OpenAI would need its own key.",
        )}
      </p>
    </div>
  );
}
