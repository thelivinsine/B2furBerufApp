import { Monitor, Moon, Sun } from "lucide-react";
import { useSettingsStore, type ThemeMode } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

const options: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

export function ThemeToggle() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setSettings = useSettingsStore((s) => s.setSettings);

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-surface/60 p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setSettings({ themeMode: value })}
          aria-label={`${label} theme`}
          aria-pressed={themeMode === value}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            themeMode === value
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
