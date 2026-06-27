import { useState, useRef, useEffect } from "react";
import { Briefcase, Home, Sparkles, ChevronDown } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { LearningMode } from "@/types";
import { cn } from "@/lib/utils";

const MODES: { id: LearningMode; label: string; icon: typeof Briefcase }[] = [
  { id: "work", label: "Beruf", icon: Briefcase },
  { id: "personal", label: "Alltag", icon: Home },
  { id: "both", label: "Beides", icon: Sparkles },
];

export function ModeSwitcher() {
  const mode = useSettingsStore((s) => s.mode);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const current = MODES.find((m) => m.id === mode) ?? MODES[2];
  const Icon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex h-9 items-center gap-1 rounded-full bg-muted/60 px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-40 rounded-xl border border-border bg-surface p-1 shadow-elevated-soft">
          {MODES.map((m) => {
            const MIcon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => { setSettings({ mode: m.id }); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  mode === m.id
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <MIcon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
