import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Volume2, VolumeX, Mic, MicOff, AlertTriangle } from "lucide-react";
import { useSettingsStore, type ThemeMode } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { getGermanVoices } from "@/engine/speech";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/misc";
import { AccountPanel } from "@/features/auth/AccountPanel";
import { cn } from "@/lib/utils";

const themeModes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Hell", icon: Sun },
  { id: "dark", label: "Dunkel", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function Settings() {
  const settings = useSettingsStore();
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const showToast = useSessionStore((s) => s.showToast);
  const [confirmReset, setConfirmReset] = useState(false);

  const voices = getGermanVoices();

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetProgress();
    settings.resetSettings();
    showToast("Fortschritt zurückgesetzt.", "warning");
    setConfirmReset(false);
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
            <div className="grid gap-4 sm:grid-cols-2">
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
                      onValueChange={(v) => settings.setSettings({ voiceURI: v })}
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
              </motion.div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                {settings.recognitionEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <div>
                  <p className="text-sm font-medium">Spracherkennung</p>
                  <p className="text-xs text-muted-foreground">Experimentell – nicht auf allen Geräten verfügbar</p>
                </div>
              </div>
              <Switch
                checked={settings.recognitionEnabled}
                onCheckedChange={(v) => settings.setSettings({ recognitionEnabled: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-danger/30">
          <CardContent className="space-y-3 p-5">
            <p className="font-semibold text-danger">Gefahrenzone</p>
            <p className="text-sm text-muted-foreground">
              Alle Lernfortschritte (XP, Karteikarten, Serien, Prüfungsdaten) werden dauerhaft gelöscht.
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
                {confirmReset ? "Ja, alles löschen" : "Fortschritt zurücksetzen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
