import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Volume2, VolumeX, Mic, MicOff, AlertTriangle, Download, Loader2, Trash2 } from "lucide-react";
import { useSettingsStore, type ThemeMode } from "@/store/useSettingsStore";
import { navItems } from "@/components/layout/nav-items";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getGermanVoices } from "@/engine/speech";
import { exportUserData } from "@/lib/dataExport";
import { pushProgressNow } from "@/lib/cloudSync";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/misc";
import { AccountPanel } from "@/features/auth/AccountPanel";
import { cn } from "@/lib/utils";

const DELETE_CONFIRM_WORD = "LÖSCHEN";

const themeModes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Hell", icon: Sun },
  { id: "dark", label: "Dunkel", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function Settings() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const savedCount = useProgressStore((s) => s.savedWords.length);
  const showToast = useSessionStore((s) => s.showToast);
  const status = useAuthStore((s) => s.status);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const busy = useAuthStore((s) => s.busy);
  const [confirmReset, setConfirmReset] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteWord, setDeleteWord] = useState("");

  const signedIn = status === "signedIn" || status === "anonymous";
  const voices = getGermanVoices();
  const pinnedTabs = useSettingsStore(s => s.pinnedTabs);
  const setPinnedTabs = useSettingsStore(s => s.setPinnedTabs);

  const MAX_PINNED = 4;
  // Items available for pinning (exclude settings itself from the list)
  const pinnableItems = navItems.filter(i => i.to !== "/settings");

  const togglePin = (path: string) => {
    if (pinnedTabs.includes(path)) {
      if (pinnedTabs.length > 1) {
        setPinnedTabs(pinnedTabs.filter(p => p !== path));
      }
    } else {
      if (pinnedTabs.length < MAX_PINNED) {
        // Insert in natural navItems order
        const next = pinnableItems.map(i => i.to).filter(p => [...pinnedTabs, path].includes(p));
        setPinnedTabs(next);
      }
    }
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetProgress();
    settings.resetSettings();
    // Local-only reset would be undone by the next cloud merge (it takes the
    // max of local/remote), so when signed in push the zeroed state up too.
    if (signedIn) {
      const ok = await pushProgressNow();
      showToast(
        ok
          ? "Fortschritt zurückgesetzt (auch in der Cloud)."
          : "Lokal zurückgesetzt. Die Cloud wird synchronisiert, sobald du online bist.",
        "warning",
      );
    } else {
      showToast("Lokaler Fortschritt zurückgesetzt.", "warning");
    }
    setConfirmReset(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportUserData();
      showToast("Datenexport heruntergeladen.", "success");
    } catch {
      showToast("Export fehlgeschlagen. Bitte versuche es erneut.", "warning");
    }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteWord.trim().toUpperCase() !== DELETE_CONFIRM_WORD) return;
    const ok = await deleteAccount();
    if (ok) {
      showToast("Dein Konto wurde gelöscht.", "default");
      navigate("/welcome", { replace: true });
    } else {
      showToast("Konto konnte nicht gelöscht werden. Bitte versuche es erneut.", "warning");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeading
        eyebrow="Einstellungen"
        title="Einstellungen"
        description="Passe App-Verhalten, Sprach- und Darstellungsoptionen an."
      />

      <div className="mx-auto max-w-2xl space-y-5">
        {/* Account & cloud sync */}
        <AccountPanel />

        {/* Profile */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-semibold">Profil</p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <input
                value={settings.name}
                onChange={(e) => settings.setSettings({ name: e.target.value })}
                className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Dein Name"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sprachniveau</label>
                <Select value={settings.level} onValueChange={(v) => settings.setSettings({ level: v as never })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["A2", "B1", "B2", "C1"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tägliches XP-Ziel</label>
                <Select
                  value={String(settings.dailyGoalXp)}
                  onValueChange={(v) => settings.setSettings({ dailyGoalXp: Number(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 XP · Entspannt</SelectItem>
                    <SelectItem value="80">80 XP · Stetig</SelectItem>
                    <SelectItem value="120">120 XP · Ehrgeizig</SelectItem>
                    <SelectItem value="200">200 XP · Intensiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Prüfungsdatum</label>
              <input
                type="date"
                value={settings.examDate ?? ""}
                onChange={(e) => settings.setSettings({ examDate: e.target.value || null })}
                className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* Learning */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-semibold">Lernen</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Erst überlegen, dann Optionen</p>
                <p className="text-xs text-muted-foreground">
                  Bei Auswahlfragen kurz selbst antworten, bevor die Optionen erscheinen. Das
                  stärkt den Abruf.
                </p>
              </div>
              <Switch
                checked={settings.guessFirst}
                onCheckedChange={(v) => settings.setSettings({ guessFirst: v })}
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium">Gespeicherte Wörter</p>
                <p className="text-xs text-muted-foreground">
                  {savedCount > 0
                    ? `${savedCount} Wort${savedCount !== 1 ? "e" : ""} in deinem Merkzettel. Sie kommen in Übungen häufiger dran.`
                    : "Tippe das Lesezeichen an einem Wort, um es öfter zu üben."}
                </p>
              </div>
              {savedCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => navigate("/library?tab=woerter&saved=1")}
                >
                  Ansehen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-semibold">Darstellung</p>
            <div className="flex gap-2">
              {themeModes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => settings.setSettings({ themeMode: id })}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                    settings.themeMode === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reduzierte Animation</p>
                <p className="text-xs text-muted-foreground">Weniger Bewegung in der UI</p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(v) => settings.setSettings({ reducedMotion: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation customisation */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Navigation anpassen</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Wähle bis zu 4 Bereiche für die untere Leiste. "Mehr" ist immer sichtbar.
                </p>
              </div>
              <span className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
                pinnedTabs.length >= MAX_PINNED
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {pinnedTabs.length}/{MAX_PINNED}
              </span>
            </div>

            <div className="space-y-1">
              {pinnableItems.map(({ to, label, icon: Icon, color, bg }) => {
                const pinned = pinnedTabs.includes(to);
                const atMax  = pinnedTabs.length >= MAX_PINNED;
                const isLast = pinned && pinnedTabs.length === 1;
                const disabled = isLast || (!pinned && atMax);

                return (
                  <button
                    key={to}
                    onClick={() => togglePin(to)}
                    disabled={disabled}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      pinned
                        ? "bg-[var(--item-bg)]"
                        : "hover:bg-muted/50",
                      disabled && "opacity-40 cursor-not-allowed",
                    )}
                    style={{ "--item-bg": pinned ? bg : "transparent" } as React.CSSProperties}
                  >
                    {/* Icon dot */}
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: pinned ? bg : "rgba(0,0,0,.04)" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: pinned ? color : "#a0a3b8" }} />
                    </span>

                    <span className={cn(
                      "flex-1 text-sm font-medium",
                      pinned ? "text-foreground" : "text-muted-foreground",
                    )}>
                      {label}
                    </span>

                    {/* Checkbox indicator */}
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        pinned
                          ? "border-[var(--item-color)] bg-[var(--item-color)]"
                          : "border-border bg-transparent",
                      )}
                      style={{ "--item-color": color } as React.CSSProperties}
                    >
                      {pinned && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {pinnedTabs.length >= MAX_PINNED && (
              <p className="text-xs text-muted-foreground">
                Maximum erreicht. Entferne einen Bereich, um einen anderen hinzuzufügen.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Speech */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-semibold">Sprachausgabe</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <div>
                  <p className="text-sm font-medium">Text-zu-Sprache</p>
                  <p className="text-xs text-muted-foreground">Aussprachehilfe für Vokabeln & Dialoge</p>
                </div>
              </div>
              <Switch
                checked={settings.speechEnabled}
                onCheckedChange={(v) => settings.setSettings({ speechEnabled: v })}
              />
            </div>
            {settings.speechEnabled && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Sprechgeschwindigkeit</span>
                    <span className="tabular-nums text-muted-foreground">{settings.speechRate.toFixed(2)}×</span>
                  </div>
                  <Slider
                    value={[settings.speechRate]}
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    onValueChange={([v]) => settings.setSettings({ speechRate: v })}
                  />
                </div>
                {voices.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Stimme (Deutsch)</label>
                    <Select
                      value={settings.voiceURI ?? voices[0]?.voiceURI ?? ""}
                      onValueChange={(v) => settings.setSettings({ voiceURI: v, voiceVariety: false })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {voices.map((v) => (
                          <SelectItem key={v.voiceURI} value={v.voiceURI}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {voices.length > 1 && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Stimmen abwechseln</p>
                      <p className="text-xs text-muted-foreground">
                        Wechselt bei jeder Wiedergabe zwischen den verfügbaren deutschen Stimmen.
                      </p>
                    </div>
                    <Switch
                      checked={settings.voiceVariety}
                      onCheckedChange={(v) => settings.setSettings({ voiceVariety: v, voiceURI: v ? null : settings.voiceURI })}
                    />
                  </div>
                )}
              </motion.div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                {settings.recognitionEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <div>
                  <p className="text-sm font-medium">Spracherkennung</p>
                  <p className="text-xs text-muted-foreground">Schaltet Sprechblöcke in Sessions frei. Experimentell, nicht auf allen Geräten verfügbar</p>
                </div>
              </div>
              <Switch
                checked={settings.recognitionEnabled}
                onCheckedChange={(v) => settings.setSettings({ recognitionEnabled: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Your data */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="font-semibold">Deine Daten</p>
            <p className="text-sm text-muted-foreground">
              Lade eine Kopie deiner Daten als JSON herunter: dein Profil, dein Lernfortschritt und
              (wenn du angemeldet bist) deine gespeicherten Schreib-Auswertungen.
            </p>
            <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-2">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Daten exportieren
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone: reset progress */}
        <Card className="border-danger/30">
          <CardContent className="space-y-3 p-5">
            <p className="font-semibold text-danger">Gefahrenzone</p>
            <p className="text-sm font-medium">Fortschritt zurücksetzen</p>
            <p className="text-sm text-muted-foreground">
              Setzt deinen Lernfortschritt (XP, Karteikarten, Serien, Prüfungsdaten) zurück.
              {signedIn
                ? " Da du angemeldet bist, wird auch die Cloud-Kopie gelöscht."
                : " Dies betrifft nur dieses Gerät."}{" "}
              Dein Konto bleibt bestehen.
            </p>
            {confirmReset && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
              </motion.div>
            )}
            <div className="flex gap-2">
              {confirmReset && (
                <Button variant="outline" onClick={() => setConfirmReset(false)}>Abbrechen</Button>
              )}
              <Button variant={confirmReset ? "danger" : "outline"} onClick={handleReset}>
                {confirmReset ? "Ja, Fortschritt löschen" : "Fortschritt zurücksetzen"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone: delete account (only when there's an account to delete) */}
        {signedIn && (
          <Card className="border-danger/30">
            <CardContent className="space-y-3 p-5">
              <p className="flex items-center gap-2 font-semibold text-danger">
                <Trash2 className="h-4 w-4" /> Konto löschen
              </p>
              <p className="text-sm text-muted-foreground">
                Löscht dein Konto und alle damit verbundenen Daten (Profil, Fortschritt,
                Schreib-Auswertungen) endgültig aus der Cloud. Diese Aktion kann nicht rückgängig
                gemacht werden. Tipp: exportiere vorher deine Daten.
              </p>
              {!confirmDelete ? (
                <Button variant="outline" onClick={() => setConfirmDelete(true)}>
                  Konto löschen
                </Button>
              ) : (
                <div className="space-y-3 rounded-lg bg-danger/10 p-3">
                  <p className="flex items-start gap-2 text-sm text-danger">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    Gib zur Bestätigung <strong>{DELETE_CONFIRM_WORD}</strong> ein.
                  </p>
                  <input
                    value={deleteWord}
                    onChange={(e) => setDeleteWord(e.target.value)}
                    placeholder={DELETE_CONFIRM_WORD}
                    className="h-10 w-full rounded-lg border border-danger/40 bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-danger/40"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setConfirmDelete(false);
                        setDeleteWord("");
                      }}
                      disabled={busy}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteAccount}
                      disabled={busy || deleteWord.trim().toUpperCase() !== DELETE_CONFIRM_WORD}
                      className="gap-2"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Konto endgültig löschen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-muted-foreground">
          <button
            onClick={() => navigate("/privacy")}
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Datenschutzerklärung
          </button>
          <span aria-hidden className="text-border">·</span>
          <button
            onClick={() => navigate("/terms")}
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            AGB
          </button>
          <span aria-hidden className="text-border">·</span>
          <button
            onClick={() => navigate("/sources")}
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Quellen & Lizenzen
          </button>
        </p>
      </div>
    </div>
  );
}
