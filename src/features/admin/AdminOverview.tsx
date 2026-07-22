import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, RefreshCw, ClipboardCheck, AlertTriangle } from "lucide-react";
import { provenance } from "@/data/provenance";
import { verification as verificationMap } from "@/data/verification";
import type { VerificationTier } from "@/types";
import { fetchProvenanceReviews } from "@/lib/provenanceReviews";
import { cn } from "@/lib/utils";
import { useAdminLang } from "./adminI18n";
import { useAdminData } from "./AdminShell";
import {
  computeFunnel,
  pendingApprovals,
  buildHandoffPrompt,
  type FunnelResult,
} from "./adminFunnel";
import { fetchDeployStatus, type DeployStatus } from "./liveWidget";

/* Tier display meta for the trust-ladder bar (strongest first), mirroring the
   colours the public /sources page uses. */
const TIER_META: Record<VerificationTier, { de: string; en: string; dot: string }> = {
  human: { de: "Menschlich", en: "Human", dot: "bg-emerald-500" },
  jury: { de: "KI-Jury", en: "AI jury", dot: "bg-violet-500" },
  linguistic: { de: "Linguistik", en: "Linguistic", dot: "bg-primary" },
  facts: { de: "Fakten", en: "Facts", dot: "bg-sky-500" },
  provenance: { de: "Provenienz", en: "Provenance", dot: "bg-muted-foreground/40" },
  structural: { de: "Provenienz", en: "Provenance", dot: "bg-muted-foreground/40" },
  unverified: { de: "Offen", en: "Unverified", dot: "bg-muted-foreground/25" },
};
const TIER_ORDER: VerificationTier[] = ["human", "jury", "linguistic", "facts", "provenance"];

function pct(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

/* A headline stat tile. */
function Tile({
  k,
  value,
  unit,
  detail,
  detailTone,
  barPct,
  barClass,
}: {
  k: string;
  value: string;
  unit?: string;
  detail: string;
  detailTone?: "up" | "muted" | "reward";
  barPct: number;
  barClass: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-1.5 text-2xl font-extrabold tracking-tight">
        {value}
        {unit && <span className="ml-0.5 text-sm font-semibold text-muted-foreground">{unit}</span>}
      </div>
      <div
        className={cn(
          "mt-0.5 text-xs",
          detailTone === "up" && "font-semibold text-success",
          detailTone === "reward" && "font-semibold text-reward",
          (!detailTone || detailTone === "muted") && "text-muted-foreground",
        )}
      >
        {detail}
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", barClass)} style={{ width: `${Math.min(barPct, 100)}%` }} />
      </div>
    </div>
  );
}

/* The trust-ladder stacked bar + count legend. */
function TierBar({ funnel, lang }: { funnel: FunnelResult; lang: "de" | "en" }) {
  const { byTier, total } = funnel;
  return (
    <div>
      <div className="flex h-6 overflow-hidden rounded-lg border border-border">
        {TIER_ORDER.filter((t) => byTier.get(t)).map((tier) => (
          <div
            key={tier}
            className={TIER_META[tier].dot}
            style={{ width: `${((byTier.get(tier) ?? 0) / Math.max(total, 1)) * 100}%` }}
            title={`${TIER_META[tier][lang]}: ${byTier.get(tier)}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {TIER_ORDER.filter((t) => byTier.get(t)).map((tier) => (
          <span key={tier} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", TIER_META[tier].dot)} />
            {TIER_META[tier][lang]} <b className="font-bold text-foreground">{pct(byTier.get(tier) ?? 0, total)}%</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { t, lang } = useAdminLang();
  const { overview, loading, supabaseOk, reload } = useAdminData();

  // A1 funnel is pure + bundled: compute synchronously from the register.
  const funnel = useMemo(() => computeFunnel(provenance, verificationMap), []);
  const verifiedIds = useMemo(
    () => new Set(provenance.filter((r) => r.review_status === "verified").map((r) => r.content_id)),
    [],
  );

  // A4 sync-gap: approved decisions not yet verified in the bundle.
  const [pendingIds, setPendingIds] = useState<string[] | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchProvenanceReviews().then((reviews) => {
      if (!alive) return;
      const approved = [...reviews.values()].filter((r) => r.decision === "approve").map((r) => r.content_id);
      setPendingIds(pendingApprovals(approved, verifiedIds));
    });
    return () => {
      alive = false;
    };
  }, [verifiedIds]);

  // C1 live-deploy status.
  const [deploy, setDeploy] = useState<DeployStatus | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    void fetchDeployStatus(ctrl.signal).then(setDeploy);
    return () => ctrl.abort();
  }, []);

  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyHandoff = async () => {
    const prompt = buildHandoffPrompt(pendingIds ?? []);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked: no-op, the button just does not confirm */
    }
  };
  useEffect(
    () => () => {
      if (copyTimer.current != null) clearTimeout(copyTimer.current);
    },
    [],
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? t("Guten Morgen", "Good morning") : hour < 18 ? t("Hallo", "Hello") : t("Guten Abend", "Good evening");

  const ai = overview?.ai;
  const cacheRate = ai && ai.evals30d > 0 ? Math.round((ai.cachedEvals30d / ai.evals30d) * 100) : 0;
  const cost = ai?.costEstimate ?? 0;
  const pendingCount = pendingIds?.length ?? overview?.reviews.approvedUnapplied ?? 0;

  return (
    <div className="space-y-4">
      {/* Topline */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-display text-xl font-extrabold tracking-tight sm:text-2xl">{greeting} 👋</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("Register", "Register")}: {funnel.total.toLocaleString(lang === "de" ? "de-DE" : "en-US")}{" "}
            {t("Inhalte", "items")}
            {!supabaseOk && !loading && (
              <span className="ml-2 text-warning">{t("· Supabase offline", "· Supabase offline")}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft hover:text-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          {t("Aktualisieren", "Refresh")}
        </button>
      </div>

      {/* A1 + D1 tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          k={t("Menschlich geprüft", "Human-verified")}
          value={funnel.verified.toLocaleString(lang === "de" ? "de-DE" : "en-US")}
          unit={`/ ${funnel.total.toLocaleString(lang === "de" ? "de-DE" : "en-US")}`}
          detail={
            funnel.verifiedThisWeek > 0
              ? t(`+${funnel.verifiedThisWeek} diese Woche`, `+${funnel.verifiedThisWeek} this week`)
              : t("Ausnahmen + Stichproben, nicht 100%", "exceptions + samples, not 100%")
          }
          detailTone={funnel.verifiedThisWeek > 0 ? "up" : "muted"}
          barPct={pct(funnel.verified, funnel.total)}
          barClass="bg-emerald-500"
        />
        <Tile
          k={t("KI-Jury-Abdeckung", "AI-jury coverage")}
          value={`${Math.round(funnel.juryCoverage * 100)}`}
          unit="%"
          detail={t("Ziel 100% · läuft ohne dich", "target 100% · runs without you")}
          barPct={Math.round(funnel.juryCoverage * 100)}
          barClass="bg-violet-500"
        />
        <Tile
          k={t("Wartende Entscheidungen", "Waiting decisions")}
          value={`${pendingCount}`}
          detail={t("geprüft, noch nicht im Repo", "reviewed, not yet in the repo")}
          detailTone="reward"
          barPct={Math.min(pendingCount, 100)}
          barClass="bg-reward"
        />
        <Tile
          k={t(`KI-Budget ${ai?.month ?? ""}`.trim(), `AI budget ${ai?.month ?? ""}`.trim())}
          value={usd(cost)}
          unit="/ $5"
          detail={
            overview
              ? t(`${cacheRate}% Cache-Treffer · Limit fern`, `${cacheRate}% cache hits · well under cap`)
              : t("keine Daten", "no data")
          }
          barPct={pct(cost, 5)}
          barClass="bg-accent-gradient"
        />
      </div>

      {/* Trust ladder + handoff | live widget */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-extrabold">{t("Vertrauensleiter", "Trust ladder")}</h2>
            <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {t("alle Bänke", "all banks")}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/admin/pruefen?defect=1"
                className="flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning hover:brightness-105"
              >
                <AlertTriangle className="h-3 w-3" /> {t("Verdachtsfälle", "Flagged")}
              </Link>
              <Link
                to="/admin/pruefen"
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary hover:brightness-105"
              >
                <ClipboardCheck className="h-3 w-3" /> {t("Prüfen", "Review")}
              </Link>
            </div>
          </div>
          <TierBar funnel={funnel} lang={lang} />

          {/* A4 handoff */}
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {pendingCount > 0 ? (
                <>
                  <b className="text-foreground">
                    {t(
                      `${pendingCount} Freigaben warten auf Übernahme ins Repo.`,
                      `${pendingCount} approvals are waiting to be applied to the repo.`,
                    )}
                  </b>{" "}
                  {t(
                    "Kopiere den Übergabe-Prompt und gib ihn der nächsten KI-Session: sie führt ",
                    "Copy the handoff prompt and give it to the next AI session: it runs ",
                  )}
                  <span className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">pnpm apply:reviews</span>
                  {t(", stempelt und merged.", ", stamps and merges.")}
                </>
              ) : (
                <span className="text-foreground">
                  {pendingIds === null
                    ? t("Prüfe wartende Entscheidungen …", "Checking for waiting decisions …")
                    : t(
                        "Keine wartenden Freigaben. Alle Entscheidungen sind im Repo.",
                        "No waiting approvals. Every decision is in the repo.",
                      )}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={copyHandoff}
              disabled={pendingCount === 0}
              className={cn(
                "flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all",
                pendingCount === 0
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-accent-gradient text-primary-foreground shadow-soft hover:brightness-105",
              )}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied
                ? t("Kopiert", "Copied")
                : t("Übergabe-Prompt kopieren", "Copy handoff prompt")}
            </button>
          </div>
        </div>

        {/* C1 live widget */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft sm:p-5">
          <h2 className="mb-3 text-sm font-extrabold">{t("Ist meine Änderung live?", "Is my change live?")}</h2>
          <LiveWidget deploy={deploy} supabaseOk={supabaseOk} loading={loading} />
        </div>
      </div>
    </div>
  );
}

/* C1 renderer: plain-language deploy verdicts. */
function LiveWidget({
  deploy,
  supabaseOk,
  loading,
}: {
  deploy: DeployStatus | null;
  supabaseOk: boolean;
  loading: boolean;
}) {
  const { t } = useAdminLang();
  const Mono = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{children}</span>
  );
  const Row = ({ tone, children }: { tone: "g" | "a" | "r"; children: React.ReactNode }) => (
    <div className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
      <span
        className={cn(
          "mt-1 h-2 w-2 shrink-0 rounded-full",
          tone === "g" && "bg-success",
          tone === "a" && "bg-warning",
          tone === "r" && "bg-danger",
        )}
      />
      <span>{children}</span>
    </div>
  );

  return (
    <div className="space-y-2.5">
      {deploy === null ? (
        <Row tone="a">{t("Deploy-Status wird geladen …", "Loading deploy status …")}</Row>
      ) : deploy.state === "current" ? (
        <Row tone="g">
          <b className="text-foreground">{t("Live und aktuell.", "Live and current.")}</b>{" "}
          {t("Build", "Build")} <Mono>{deploy.buildSha}</Mono> = {t("neuester Stand von", "latest of")}{" "}
          <Mono>main</Mono>.
        </Row>
      ) : deploy.state === "behind" ? (
        <Row tone="a">
          <b className="text-foreground">{t("Neuer Stand wird deployed.", "A newer build is deploying.")}</b>{" "}
          {t("Live", "Live")} <Mono>{deploy.buildSha}</Mono>, {t("main", "main")} <Mono>{deploy.latestSha}</Mono>.{" "}
          {t("Der Pages-Deploy braucht 1–2 Minuten.", "The Pages deploy takes 1–2 minutes.")}
        </Row>
      ) : (
        <Row tone="a">
          {t("Build", "Build")} <Mono>{deploy.buildSha}</Mono>.{" "}
          {t(
            "Neuester main-Stand nicht abrufbar (GitHub-API offline oder Limit).",
            "Latest main not reachable (GitHub API offline or rate-limited).",
          )}
        </Row>
      )}

      <Row tone="a">
        {t(
          "Dein Gerät zeigt evtl. eine gecachte Version (PWA). Einmal hart neu laden.",
          "Your device may be showing a cached version (PWA). Do one hard refresh.",
        )}
      </Row>

      <Row tone={loading ? "a" : supabaseOk ? "g" : "r"}>
        {loading
          ? t("Supabase wird geprüft …", "Checking Supabase …")
          : supabaseOk
            ? t("Supabase erreichbar.", "Supabase reachable.")
            : t("Supabase nicht erreichbar (offline oder pausiert).", "Supabase unreachable (offline or paused).")}
      </Row>
    </div>
  );
}
