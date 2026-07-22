import { useMemo, useState } from "react";
import { Save, RotateCcw, AlertTriangle, Info, Loader2, Check, Presentation } from "lucide-react";
import type { BiText } from "@/lib/appConfig";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useAppConfigStore,
  DEFAULT_APP_CONFIG,
  type AppConfigData,
} from "@/lib/appConfig";
import { saveAppConfigEntry, deleteAppConfigEntry } from "@/lib/adminApi";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import { useAdminLang } from "./adminI18n";

/**
 * Steuerung panel (Kontrollzentrum §H). Edits the remote `app_config` object:
 * nav labels (H1), middle-tab visibility (H2), the feature-flag registry (H4),
 * the feedback widget (H5), the Beta chip (H6) and the Dashboard start tab (H8).
 * Every edit updates a LIVE PREVIEW immediately (applyLocal on the store) so the
 * founder sees the effect at once; "Speichern" persists to Supabase for all
 * users; "Auf Standard zurücksetzen" removes the overrides (back to the compiled
 * defaults). Guardrails from the plan are enforced: Home/Einstellungen can never
 * be hidden, and a "referenced in content" note reminds that label overrides do
 * not reach content banks or the prerendered /hilfe pages.
 */

// Only middle tabs may be hidden (locked bar keeps Home + Einstellungen fixed).
const HIDEABLE = new Set(["/library", "/analytics"]);

const CONFIG_KEYS: (keyof AppConfigData)[] = [
  "navLabels",
  "hiddenTabs",
  "features",
  "feedback",
  "betaChip",
  "dashboardStartTab",
  "impressumEnabled",
  "header",
  "landing",
];

export function AdminSteuerung() {
  const { t } = useAdminLang();
  const user = useAuthStore((s) => s.user);
  const live = useAppConfigStore((s) => s.config);
  const applyLocal = useAppConfigStore((s) => s.applyLocal);

  // Draft = the live config (preview updates the store directly).
  const draft = live;
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(DEFAULT_APP_CONFIG),
    [draft],
  );

  /** Mutate one field of the config and push it to the live preview. */
  const patch = (p: Partial<AppConfigData>) => {
    applyLocal({ ...draft, ...p });
    setSaveState("idle");
  };

  const save = async () => {
    setSaveState("saving");
    const email = user?.id ?? "unknown";
    let ok = true;
    for (const key of CONFIG_KEYS) {
      const value = draft[key];
      const isDefault = JSON.stringify(value) === JSON.stringify(DEFAULT_APP_CONFIG[key]);
      // Store only real overrides; a value back at its default is removed so the
      // "empty config == defaults" invariant stays clean.
      const landed = isDefault ? await deleteAppConfigEntry(key) : await saveAppConfigEntry(key, value, email);
      ok = ok && landed;
    }
    setSaveState(ok ? "saved" : "error");
  };

  const resetAll = async () => {
    applyLocal(DEFAULT_APP_CONFIG);
    setSaveState("saving");
    let ok = true;
    for (const key of CONFIG_KEYS) ok = (await deleteAppConfigEntry(key)) && ok;
    setSaveState(ok ? "saved" : "error");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-display text-xl font-extrabold tracking-tight sm:text-2xl">
          {t("Steuerung", "Controls")}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(
            "Live-Vorschau sofort, für alle erst nach „Speichern“. Inhalte laufen weiter nur über Claude-Sessions.",
            "Live preview instantly; for everyone only after Save. Content still flows only through Claude sessions.",
          )}
        </p>
      </div>

      {/* H1 nav labels */}
      <Section
        title={t("Menü-Beschriftungen", "Nav labels")}
        note={t(
          "Überschreibt nur die Menü-Namen. Reicht NICHT in die Inhalte oder die vorab gerenderten /hilfe-Seiten.",
          "Overrides only the menu names. Does NOT reach content banks or the prerendered /hilfe pages.",
        )}
      >
        <div className="space-y-2">
          {navItems.map((it) => (
            <div key={it.to} className="flex items-center gap-3">
              <code className="w-24 shrink-0 font-mono text-xs text-muted-foreground">{it.to}</code>
              <input
                value={draft.navLabels[it.to] ?? ""}
                placeholder={it.label}
                onChange={(e) => {
                  const next = { ...draft.navLabels };
                  if (e.target.value.trim()) next[it.to] = e.target.value;
                  else delete next[it.to];
                  patch({ navLabels: next });
                }}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* H2 nav visibility */}
      <Section
        title={t("Menü-Sichtbarkeit", "Nav visibility")}
        note={t(
          "Blendet nur die Menü-Kachel aus. Die Route bleibt aktiv (Deep-Links funktionieren weiter). Praktisch und Einstellungen sind fest.",
          "Hides only the menu tile. The route stays live (deep links keep working). Praktisch and Einstellungen are fixed.",
        )}
      >
        <div className="space-y-2">
          {navItems
            .filter((it) => HIDEABLE.has(it.to))
            .map((it) => {
              const hidden = draft.hiddenTabs.includes(it.to);
              return (
                <Toggle
                  key={it.to}
                  label={`${it.label} (${it.to})`}
                  checked={!hidden}
                  onChange={(visible) => {
                    const set = new Set(draft.hiddenTabs);
                    if (visible) set.delete(it.to);
                    else set.add(it.to);
                    patch({ hiddenTabs: [...set] });
                  }}
                  onText={t("sichtbar", "shown")}
                  offText={t("versteckt", "hidden")}
                />
              );
            })}
        </div>
      </Section>

      {/* H4 feature flags */}
      <Section title={t("Funktions-Schalter", "Feature flags")}>
        <div className="space-y-2">
          <Toggle
            label={t("Vokabeltrainer: Karteikarten/Quiz-Tabs", "Vocabulary: Karteikarten/Quiz tabs")}
            checked={draft.features.practiceTabs}
            onChange={(v) => patch({ features: { ...draft.features, practiceTabs: v } })}
          />
          <Toggle
            label={t("Wörter: „Verbunden“-Panel", "Words: 'Related' panel")}
            checked={draft.features.relatedPanel}
            onChange={(v) => patch({ features: { ...draft.features, relatedPanel: v } })}
          />
          <Toggle
            label={t("Flip-Hinweis (geparkt)", "Flip hint (parked)")}
            checked={draft.features.flipHint}
            onChange={(v) => patch({ features: { ...draft.features, flipHint: v } })}
          />
        </div>
      </Section>

      {/* H5 feedback */}
      <Section title={t("Feedback-Widget", "Feedback widget")}>
        <div className="space-y-3">
          <Toggle
            label={t("Feedback-Pill anzeigen", "Show feedback pill")}
            checked={draft.feedback.enabled}
            onChange={(v) => patch({ feedback: { ...draft.feedback, enabled: v } })}
          />
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">{t("Label", "Label")}</span>
            <input
              value={draft.feedback.label ?? ""}
              placeholder="Mit KI gebaut · Feedback"
              onChange={(e) =>
                patch({ feedback: { ...draft.feedback, label: e.target.value.trim() || null } })
              }
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </Section>

      {/* H6 beta chip */}
      <Section title={t("Neuland Beta-Chip", "Neuland Beta chip")}>
        <Toggle
          label={t("„Beta“-Chip anzeigen", "Show 'Beta' chip")}
          checked={draft.betaChip}
          onChange={(v) => patch({ betaChip: v })}
        />
      </Section>

      {/* H8 dashboard start tab */}
      <Section title={t("Start-Tab auf „Praktisch“", "Start tab on 'Praktisch'")}>
        <div className="flex gap-1.5">
          {(["ueben", "spielen"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => patch({ dashboardStartTab: tab })}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                draft.dashboardStartTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "ueben" ? t("Lernen", "Learn") : t("Spielen", "Play")}
            </button>
          ))}
        </div>
      </Section>

      {/* H7 header switches */}
      <Section title={t("Header-Elemente", "Header elements")}>
        <Toggle
          label={t("Serien-Pille (Flamme + Tage)", "Streak pill (flame + days)")}
          checked={draft.header.streakPill}
          onChange={(v) => patch({ header: { ...draft.header, streakPill: v } })}
        />
      </Section>

      {/* H10 landing copy overrides */}
      <Section
        title={t("Landing-Texte", "Landing copy")}
        note={t(
          "Überschreibt nur die Landing-Seite. Beide Sprachen müssen gefüllt sein, sonst greift der Standardtext.",
          "Overrides the landing page only. Both languages must be filled or the built-in copy is used.",
        )}
      >
        <div className="space-y-3">
          <BiTextField
            label={t("Hero-Eyebrow", "Hero eyebrow")}
            placeholderEn="German for real life"
            placeholderDe="Deutsch fürs echte Leben"
            value={draft.landing.heroEyebrow}
            onChange={(v) => patch({ landing: { ...draft.landing, heroEyebrow: v } })}
          />
          <BiTextField
            label={t("Start-Button", "Start CTA")}
            placeholderEn="Start free"
            placeholderDe="Kostenlos starten"
            value={draft.landing.ctaLabel}
            onChange={(v) => patch({ landing: { ...draft.landing, ctaLabel: v } })}
          />
        </div>
      </Section>

      {/* H3 Impressum */}
      <ImpressumSection
        enabled={draft.impressumEnabled}
        onChange={(v) => patch({ impressumEnabled: v })}
        t={t}
      />

      {/* H12 Demo-Modus preset */}
      <Section
        title={t("Demo-Modus", "Demo mode")}
        note={t(
          "Ein Preset für Präsentationen: blendet Feedback-Pill, Beta-Chip und Serien-Pille aus. Danach speichern.",
          "A preset for presentations: hides the feedback pill, Beta chip and streak pill. Save afterwards.",
        )}
      >
        <button
          type="button"
          onClick={() =>
            patch({
              feedback: { ...draft.feedback, enabled: false },
              betaChip: false,
              header: { ...draft.header, streakPill: false },
            })
          }
          className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:brightness-105"
        >
          <Presentation className="h-4 w-4" /> {t("Demo-Preset anwenden", "Apply demo preset")}
        </button>
      </Section>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-page/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <button
          type="button"
          onClick={resetAll}
          disabled={!dirty}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t("Auf Standard zurücksetzen", "Reset to default")}
        </button>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs",
              saveState === "error" && "text-danger",
              saveState === "saved" && "text-success",
              saveState === "saving" && "text-muted-foreground",
            )}
          >
            {saveState === "saving"
              ? t("Speichern…", "Saving…")
              : saveState === "saved"
                ? t("Gespeichert", "Saved")
                : saveState === "error"
                  ? t("Fehler", "Error")
                  : ""}
          </span>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saveState === "saving"}
            className="flex items-center gap-1.5 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-105 disabled:opacity-60"
          >
            {saveState === "saving" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveState === "saved" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("Speichern", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <h2 className="mb-2.5 text-sm font-extrabold">{title}</h2>
      {children}
      {note && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          {note.includes("NICHT") || note.includes("NOT") ? (
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
          ) : (
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
          )}
          {note}
        </p>
      )}
    </div>
  );
}

function BiTextField({
  label,
  placeholderDe,
  placeholderEn,
  value,
  onChange,
}: {
  label: string;
  placeholderDe: string;
  placeholderEn: string;
  value: BiText | null;
  onChange: (value: BiText | null) => void;
}) {
  // A bilingual override only takes effect when BOTH sides are filled; clearing
  // either side removes the override (back to the built-in copy).
  const set = (de: string, en: string) => onChange(de.trim() && en.trim() ? { de, en } : null);
  const de = value?.de ?? "";
  const en = value?.en ?? "";
  return (
    <div>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        <input
          value={de}
          placeholder={`DE · ${placeholderDe}`}
          onChange={(e) => set(e.target.value, en)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
        <input
          value={en}
          placeholder={`EN · ${placeholderEn}`}
          onChange={(e) => set(de, e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

function ImpressumSection({
  enabled,
  onChange,
  t,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  t: (de: string, en: string) => string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [addressOk, setAddressOk] = useState(false);
  const [legalOk, setLegalOk] = useState(false);

  return (
    <Section
      title={t("Impressum", "Legal notice (Impressum)")}
      note={t(
        "Die Route /impressum ist immer erreichbar; nur die Links (Footer/Einstellungen/Rechtsseiten) hängen an diesem Schalter. Vor dem Öffentlich-Schalten die echte Adresse eintragen.",
        "The /impressum route always resolves; only the links (footer/Settings/legal) depend on this switch. Fill the real address before going public.",
      )}
    >
      {enabled ? (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
            <Check className="h-4 w-4" /> {t("Impressum-Links sichtbar", "Impressum links visible")}
          </span>
          <button
            type="button"
            onClick={() => onChange(false)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            {t("Ausblenden", "Hide")}
          </button>
        </div>
      ) : !confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm font-bold text-warning hover:brightness-105"
        >
          {t("Impressum aktivieren…", "Enable Impressum…")}
        </button>
      ) : (
        <div className="space-y-2.5 rounded-lg border border-warning/40 bg-warning/10 p-3">
          <p className="text-xs font-semibold text-foreground">
            {t("Bitte bestätigen, bevor die Links öffentlich werden:", "Please confirm before the links go public:")}
          </p>
          <label className="flex items-start gap-2 text-xs">
            <input type="checkbox" checked={addressOk} onChange={(e) => setAddressOk(e.target.checked)} className="mt-0.5" />
            {t(
              "Impressum.tsx enthält die echte, vollständige Anbieter-Adresse (kein Platzhalter).",
              "Impressum.tsx contains the real, complete provider address (no placeholder).",
            )}
          </label>
          <label className="flex items-start gap-2 text-xs">
            <input type="checkbox" checked={legalOk} onChange={(e) => setLegalOk(e.target.checked)} className="mt-0.5" />
            {t(
              "AGB und Datenschutz sind konsistent und aktuell.",
              "Terms and Privacy are consistent and current.",
            )}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!addressOk || !legalOk}
              onClick={() => {
                onChange(true);
                setConfirming(false);
              }}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-40"
            >
              {t("Aktivieren", "Enable")}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              {t("Abbrechen", "Cancel")}
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  onText,
  offText,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onText?: string;
  offText?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm hover:border-primary/40"
    >
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      <span className="flex items-center gap-2">
        <span className={cn("text-[11px] font-semibold", checked ? "text-success" : "text-muted-foreground")}>
          {checked ? (onText ?? "an") : (offText ?? "aus")}
        </span>
        <span
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition-colors",
            checked ? "bg-primary" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
              checked ? "left-[1.125rem]" : "left-0.5",
            )}
          />
        </span>
      </span>
    </button>
  );
}
