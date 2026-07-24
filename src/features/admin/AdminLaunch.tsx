import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Download,
  Trash2,
  DownloadCloud,
  CalendarClock,
} from "lucide-react";
import { CONSENT_VERSION, consentInSync } from "@/lib/consent";
import { PRIVACY_LAST_UPDATED_ISO } from "@/lib/legalMeta";
import { downloadAuditPackage, auditStats } from "@/lib/auditExport";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchLaunchChecklist,
  saveLaunchChecklistItem,
  fetchGdprEvidence,
  type LaunchChecklistState,
  type GdprEvidence,
} from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { useAdminLang } from "./adminI18n";

/**
 * Launch checklist (Kontrollzentrum §G1): the literal open list that gates a
 * public launch, checkable and persisted in Supabase (launch_checklist) so
 * ticks follow the founder across devices. The Impressum row is flagged as the
 * legal blocker; the Google-OAuth row carries the "do not re-click 'I have
 * fixed the issues'" memo. The consent-version row (§G2) surfaces the current
 * CONSENT_VERSION so the legal-page lockstep stays visible.
 */

interface ChecklistItem {
  id: string;
  de: string;
  en: string;
  noteDe?: string;
  noteEn?: string;
  /** A legal/technical blocker for a public launch. */
  blocker?: boolean;
}

const ITEMS: ChecklistItem[] = [
  {
    id: "impressum",
    de: "Impressum mit echter Adresse ausfüllen und Route + Links aktivieren",
    en: "Fill the Impressum with a real address and re-enable its route + links",
    noteDe: "Rechtlich zwingend für einen öffentlichen Start. Route ist aktuell deaktiviert.",
    noteEn: "Legally required for a public launch. The route is currently disabled.",
    blocker: true,
  },
  {
    id: "lawyer",
    de: "Rechtliche Prüfung von AGB und Datenschutzerklärung",
    en: "Legal review of the Terms and Privacy Policy",
  },
  {
    id: "google-oauth",
    de: "Google-OAuth-Branding-Review bestanden",
    en: "Google OAuth branding review passed",
    noteDe: "Memo: NICHT erneut auf „Ich habe die Probleme behoben“ klicken, bevor wirklich alles stimmt.",
    noteEn: "Memo: do NOT re-click 'I have fixed the issues' until everything is genuinely correct.",
  },
  {
    id: "turnstile",
    de: "Turnstile (Bot-Schutz) für Gast-Konten aktiviert",
    en: "Turnstile (bot protection) enabled for guest accounts",
    noteDe: "Braucht BEIDES: CAPTCHA in Supabase Auth (Secret Key) UND das GitHub-Secret VITE_TURNSTILE_SITE_KEY (Site Key) + Deploy. Nur eine Seite = Anmeldung schlägt fehl.",
    noteEn: "Needs BOTH: CAPTCHA in Supabase Auth (secret key) AND the GitHub secret VITE_TURNSTILE_SITE_KEY (site key) + a deploy. Only one side = sign-in fails.",
  },
  {
    id: "resend",
    de: "Resend-Domain verifiziert (Feedback-E-Mail-Zustellung)",
    en: "Resend domain verified (feedback email delivery)",
  },
  {
    id: "supabase-plan",
    de: "Supabase-Plan geprüft (Free-Tier pausiert nach 7 Tagen Inaktivität)",
    en: "Supabase plan reviewed (free tier pauses after 7 idle days)",
  },
];

export function AdminLaunch() {
  const { t, lang } = useAdminLang();
  const user = useAuthStore((s) => s.user);
  const [state, setState] = useState<Map<string, LaunchChecklistState>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [gdpr, setGdpr] = useState<GdprEvidence | null>(null);
  const [gdprLoaded, setGdprLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    void fetchLaunchChecklist().then((m) => {
      if (!alive) return;
      setState(m);
      setLoaded(true);
    });
    void fetchGdprEvidence().then((e) => {
      if (!alive) return;
      setGdpr(e);
      setGdprLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const inSync = consentInSync();
  const stats = useMemo(() => auditStats(), []);

  const toggle = useCallback(
    async (id: string) => {
      const cur = state.get(id);
      const next: LaunchChecklistState = { itemId: id, done: !(cur?.done ?? false), note: cur?.note ?? null };
      // Optimistic
      setState((prev) => new Map(prev).set(id, next));
      setSavingId(id);
      const ok = await saveLaunchChecklistItem(next, user?.id ?? "unknown");
      setSavingId(null);
      if (!ok) setState((prev) => new Map(prev).set(id, cur ?? { itemId: id, done: false, note: null }));
    },
    [state, user?.id],
  );

  const doneCount = ITEMS.filter((it) => state.get(it.id)?.done).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-display text-xl font-extrabold tracking-tight sm:text-2xl">
          {t("Launch", "Launch")}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(
            `${doneCount} von ${ITEMS.length} erledigt · über Geräte synchronisiert`,
            `${doneCount} of ${ITEMS.length} done · synced across devices`,
          )}
        </p>
      </div>

      {!loaded && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("Lädt…", "Loading…")}
        </div>
      )}

      <div className="space-y-2">
        {ITEMS.map((it) => {
          const done = state.get(it.id)?.done ?? false;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => void toggle(it.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border bg-surface p-3.5 text-left shadow-soft transition-colors",
                done ? "border-emerald-500/30" : it.blocker ? "border-danger/30" : "border-border",
              )}
            >
              <span className="mt-0.5 shrink-0">
                {savingId === it.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("flex items-center gap-2 text-sm font-semibold", done && "text-muted-foreground line-through")}>
                  {lang === "de" ? it.de : it.en}
                  {it.blocker && !done && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-danger/15 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                      <AlertTriangle className="h-3 w-3" /> {t("Blocker", "Blocker")}
                    </span>
                  )}
                </span>
                {(it.noteDe || it.noteEn) && (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {lang === "de" ? it.noteDe : it.noteEn}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Compliance pack (§G2/§G3/§G4) */}
      <h2 className="pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {t("Compliance", "Compliance")}
      </h2>

      {/* G2 consent-drift check */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-soft",
          inSync ? "border-border" : "border-danger/40",
        )}
      >
        {inSync ? (
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {t("Consent-Version", "Consent version")}
            {!inSync && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-danger/15 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                {t("Abweichung", "Drift")}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {inSync
              ? t(
                  `Im Gleichschritt: CONSENT_VERSION ${CONSENT_VERSION} = Rechtsseiten-Stand ${PRIVACY_LAST_UPDATED_ISO}. Bei materiellen Änderungen an AGB/Datenschutz beide zusammen hochsetzen.`,
                  `In sync: CONSENT_VERSION ${CONSENT_VERSION} = legal pages ${PRIVACY_LAST_UPDATED_ISO}. On any material change to Terms/Privacy, bump both together.`,
                )
              : t(
                  `Abweichung: CONSENT_VERSION ${CONSENT_VERSION}, Rechtsseiten-Stand ${PRIVACY_LAST_UPDATED_ISO}. Beide auf denselben Wert setzen, sonst wird die Re-Consent-Aufforderung nicht ausgelöst.`,
                  `Drift: CONSENT_VERSION ${CONSENT_VERSION}, legal pages ${PRIVACY_LAST_UPDATED_ISO}. Set both to the same value, or the re-consent prompt will not fire.`,
                )}
          </p>
        </div>
      </div>

      {/* G3 auditor export */}
      <div className="rounded-xl border border-border bg-surface p-3.5 shadow-soft">
        <div className="flex items-start gap-3">
          <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("Auditor-Paket", "Auditor package")}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t(
                `Herkunfts-Register als CSV (${stats.total.toLocaleString("de-DE")} Einträge, davon ${(stats.byStatus["verified"] ?? 0).toLocaleString("de-DE")} menschlich geprüft) plus eine Markdown-Zusammenfassung mit Vertrauensstufen, Lizenzen, Belegen und Stichproben-Anleitung.`,
                `Provenance register as CSV (${stats.total.toLocaleString("en-US")} items, ${(stats.byStatus["verified"] ?? 0).toLocaleString("en-US")} human-verified) plus a Markdown summary of trust tiers, licences, references and a sampling guide.`,
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => downloadAuditPackage()}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          {t("Paket exportieren", "Export package")}
        </button>
      </div>

      {/* G4 GDPR ops evidence */}
      <div className="rounded-xl border border-border bg-surface p-3.5 shadow-soft">
        <p className="text-sm font-semibold">{t("DSGVO-Nachweise", "GDPR ops evidence")}</p>
        {!gdprLoaded ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("Lädt…", "Loading…")}
          </p>
        ) : gdpr === null ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t(
              "Noch nicht verfügbar. Migration 0010 im Supabase-SQL-Editor ausführen und die delete-account-Funktion neu deployen, dann werden Löschungen und Exporte gezählt.",
              "Not available yet. Run migration 0010 in the Supabase SQL editor and redeploy the delete-account function, then deletions and exports are counted.",
            )}
          </p>
        ) : (
          <>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("Aggregierte Zähler, keine personenbezogenen Daten.", "Aggregate counters, no personal data.")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" /> {t("Löschungen", "Erasures")}
                </p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums">{gdpr.deletions}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <DownloadCloud className="h-3.5 w-3.5" /> {t("Exporte", "Exports")}
                </p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums">{gdpr.exports}</p>
              </div>
            </div>
            <div
              className={cn(
                "mt-2 flex items-center gap-2 rounded-lg border p-2.5 text-xs",
                gdpr.retentionScheduled
                  ? "border-emerald-500/30 text-foreground"
                  : "border-warning/40 bg-warning/10 text-foreground",
              )}
            >
              <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
              {gdpr.retentionScheduled
                ? t("Aufbewahrungs-Job (pg_cron) ist geplant.", "Retention job (pg_cron) is scheduled.")
                : t(
                    "Kein pg_cron-Aufbewahrungs-Job geplant. Vor dem öffentlichen Start eine Aufbewahrungsfrist einrichten.",
                    "No pg_cron retention job scheduled. Set up a retention policy before public launch.",
                  )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
