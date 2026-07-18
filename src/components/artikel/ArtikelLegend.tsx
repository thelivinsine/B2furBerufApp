import { X } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { Wesen } from "./Wesen";
import { GENDER_LABEL, type Gender } from "./gender";

const GENDERS: Gender[] = ["der", "die", "das"];

/**
 * One-time hint that teaches the Artikel-Wesen system on the Wörter tab
 * (Artikel-Visuals, s128 plan). The research is explicit that an unexplained
 * cue does not transfer, so a learner meets the three creatures once, then the
 * card is dismissed for good (state in the settings store, rides cloudSync).
 * Renders nothing once dismissed.
 */
export function ArtikelLegend() {
  const dismissed = useSettingsStore((s) => s.artikelLegendDismissed);
  const setSettings = useSettingsStore((s) => s.setSettings);
  if (dismissed) return null;

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:gap-5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Drei Wesen zeigen den Artikel</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Jedes Nomen bekommt sein Wesen neben dem Wort. So siehst du den Artikel auf einen Blick.
        </p>
      </div>
      <div className="flex items-center gap-4">
        {GENDERS.map((g) => (
          <div key={g} className="flex items-center gap-1.5">
            <Wesen gender={g} size={28} />
            <span className="text-sm font-semibold" style={{ color: `hsl(var(--${g}))` }}>
              {GENDER_LABEL[g]}
            </span>
          </div>
        ))}
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Hinweis schließen"
        className="absolute right-1.5 top-1.5 sm:static"
        onClick={() => setSettings({ artikelLegendDismissed: true })}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
