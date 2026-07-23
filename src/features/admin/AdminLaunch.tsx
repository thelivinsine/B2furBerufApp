import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { CONSENT_VERSION } from "@/lib/consent";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchLaunchChecklist,
  saveLaunchChecklistItem,
  type LaunchChecklistState,
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
    noteDe: "Vorbereitet in PHASE2_SETUP.md §4; Umsetzung in Chunk 11.",
    noteEn: "Prepared in PHASE2_SETUP.md §4; wired in chunk 11.",
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

  useEffect(() => {
    let alive = true;
    void fetchLaunchChecklist().then((m) => {
      if (!alive) return;
      setState(m);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

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

      {/* G2 consent-version lockstep */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-soft">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t("Consent-Version", "Consent version")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t(
              `Aktuell: ${CONSENT_VERSION}. Bei materiellen Änderungen an AGB/Datenschutz CONSENT_VERSION und die LAST_UPDATED-Daten der Rechtsseiten im Gleichschritt hochsetzen.`,
              `Currently: ${CONSENT_VERSION}. On any material change to Terms/Privacy, bump CONSENT_VERSION and the legal pages' LAST_UPDATED dates together.`,
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
