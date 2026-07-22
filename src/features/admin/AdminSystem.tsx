import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  HelpCircle,
  ExternalLink,
  Database,
  Server,
  Mail,
  Bot,
  Users,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLang } from "./adminI18n";
import { useAdminData } from "./AdminShell";
import {
  fetchGateRuns,
  pingServices,
  DASHBOARD_LINKS,
  type WorkflowRun,
  type GateState,
  type ServicePing,
} from "./systemHealth";

/**
 * System & health (Kontrollzentrum §C2/§C3/§D2): the "is anything on fire"
 * corner. CI gate status in plain words, live service pings, the AI/Resend/
 * guest meters, the Supabase free-tier idle-pause warning, and deep-link tiles
 * to the operational dashboards. Everything degrades gracefully offline.
 */

function GateIcon({ state }: { state: GateState }) {
  if (state === "success") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (state === "failure") return <XCircle className="h-4 w-4 text-danger" />;
  if (state === "running") return <Loader2 className="h-4 w-4 animate-spin text-warning" />;
  return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
}

function Meter({
  label,
  value,
  max,
  unit,
  pct,
  tone,
  hint,
}: {
  label: string;
  value: string;
  max: string;
  unit?: string;
  pct: number;
  tone: "ok" | "warn" | "danger";
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-xl font-extrabold tracking-tight">
        {value}
        {unit && <span className="text-sm font-semibold text-muted-foreground"> {unit}</span>}
        <span className="ml-1 text-sm font-medium text-muted-foreground">/ {max}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "ok" && "bg-emerald-500",
            tone === "warn" && "bg-warning",
            tone === "danger" && "bg-danger",
          )}
          style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

export function AdminSystem() {
  const { t } = useAdminLang();
  const { overview } = useAdminData();

  const [gates, setGates] = useState<WorkflowRun[] | null>(null);
  const [ping, setPing] = useState<ServicePing | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setGates(null);
    setPing(null);
    void fetchGateRuns(ctrl.signal).then(setGates);
    void pingServices(ctrl.signal).then(setPing);
    return () => ctrl.abort();
  }, [reloadKey]);

  const ai = overview?.ai;
  const cost = ai?.costEstimate ?? 0;
  const emailedToday = overview?.feedback.emailedToday ?? 0;
  const anon = overview?.accounts.anonymous ?? 0;

  const pingRow = (label: string, icon: React.ReactNode, state: ServicePing[keyof ServicePing] | undefined) => (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      {state === undefined ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : state === "ok" ? (
        <span className="flex items-center gap-1 text-xs font-semibold text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> {t("erreichbar", "reachable")}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-semibold text-danger">
          <XCircle className="h-3.5 w-3.5" /> {t("nicht erreichbar", "unreachable")}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-xl font-extrabold tracking-tight sm:text-2xl">
            {t("System", "System")}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("Gates, Dienste, Kosten und Grenzen auf einen Blick.", "Gates, services, cost and limits at a glance.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" /> {t("Neu prüfen", "Re-check")}
        </button>
      </div>

      {/* C2 gate strip */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
        <h2 className="mb-3 text-sm font-extrabold">{t("CI-Gates (main)", "CI gates (main)")}</h2>
        <div className="space-y-2">
          {gates === null ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("Lädt…", "Loading…")}
            </div>
          ) : (
            gates.map((g) => (
              <div key={g.file} className="flex items-center gap-2.5 text-sm">
                <GateIcon state={g.state} />
                <span className="flex-1 font-medium">{g.name}</span>
                <span className="text-xs text-muted-foreground" title={g.detail}>
                  {g.state === "success"
                    ? t("grün", "green")
                    : g.state === "failure"
                      ? t("rot", "red")
                      : g.state === "running"
                        ? t("läuft", "running")
                        : t("unbekannt", "unknown")}
                </span>
                {g.url && (
                  <a href={g.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80" aria-label="GitHub">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {t(
            "Ein grüner Pages-Lauf kann trotzdem einen roten ersten Versuch zeigen (GitHub-Flake, wird bis zu 3x wiederholt). Nur ein dauerhaft roter Lauf braucht dich.",
            "A green Pages run can still show a red first attempt (GitHub flake, retried up to 3x). Only a sustained red run needs you.",
          )}
        </p>
      </div>

      {/* C3 service pings */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
        <h2 className="mb-3 text-sm font-extrabold">{t("Dienste", "Services")}</h2>
        <div className="space-y-2">
          {pingRow("Supabase", <Database className="h-4 w-4" />, ping?.supabase)}
          {pingRow(
            t("Edge Function (submit-feedback)", "Edge Function (submit-feedback)"),
            <Server className="h-4 w-4" />,
            ping?.edgeFunction,
          )}
        </div>
      </div>

      {/* D2 meters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Meter
          label={t("KI-Budget", "AI budget")}
          value={`$${cost.toFixed(2)}`}
          max="$5"
          pct={(cost / 5) * 100}
          tone={cost >= 4.5 ? "danger" : cost >= 3 ? "warn" : "ok"}
          hint={t("Auto-Abschaltung bei $5/Monat.", "Auto-shutoff at $5/month.")}
        />
        <Meter
          label={t("Feedback-Mails heute", "Feedback emails today")}
          value={`${emailedToday}`}
          max="100"
          pct={emailedToday}
          tone={emailedToday >= 90 ? "danger" : emailedToday >= 60 ? "warn" : "ok"}
          hint={t("Resend-Gratislimit 100/Tag.", "Resend free limit 100/day.")}
        />
        <Meter
          label={t("Gast-Konten", "Guest accounts")}
          value={`${anon}`}
          max="∞"
          pct={0}
          tone="ok"
          hint={t("Turnstile noch aus (Chunk 11).", "Turnstile still off (chunk 11).")}
        />
      </div>

      {/* Free-tier idle-pause warning */}
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
        <p className="font-semibold">
          {t("Supabase Free-Tier: 7-Tage-Inaktivitätspause", "Supabase free tier: 7-day inactivity pause")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t(
            "Ohne Aktivität pausiert das Projekt nach 7 Tagen. Das ist die wahrscheinlichste Ursache für „der Demo-Link ist tot“. Einmal die Woche die App öffnen hält es wach.",
            "With no activity the project pauses after 7 days. That is the most likely cause of a dead demo link. Opening the app once a week keeps it awake.",
          )}
        </p>
      </div>

      {/* Deep links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DashLink href={DASHBOARD_LINKS.supabase} icon={<Database className="h-4 w-4" />} label="Supabase" sub={t("Logs, Tabellen, Billing", "Logs, tables, billing")} />
        <DashLink href={DASHBOARD_LINKS.githubActions} icon={<Bot className="h-4 w-4" />} label="GitHub Actions" sub={t("Läufe & Deploys", "Runs & deploys")} />
        <DashLink href={DASHBOARD_LINKS.resend} icon={<Mail className="h-4 w-4" />} label="Resend" sub={t("E-Mail-Zustellung", "Email delivery")} />
      </div>

      {/* AI cache detail (D1 companion) */}
      {ai && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-4 text-sm shadow-soft">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {t(
              `${ai.calls} KI-Aufrufe im ${ai.month} · ${ai.evals30d > 0 ? Math.round((ai.cachedEvals30d / ai.evals30d) * 100) : 0}% Cache-Treffer (30 Tage)`,
              `${ai.calls} AI calls in ${ai.month} · ${ai.evals30d > 0 ? Math.round((ai.cachedEvals30d / ai.evals30d) * 100) : 0}% cache hits (30 days)`,
            )}
          </span>
        </div>
      )}
    </div>
  );
}

function DashLink({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-soft transition-colors hover:border-primary/40"
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{sub}</span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}
