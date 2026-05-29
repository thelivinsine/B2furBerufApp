import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, ttsSupported } from "@/engine/speech";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  text: string;
  size?: "icon" | "icon-sm";
  variant?: "ghost" | "outline" | "secondary";
  className?: string;
  label?: string;
}

export function SpeakButton({
  text,
  size = "icon-sm",
  variant = "ghost",
  className,
  label = "Aussprache anhören",
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const rate = useSettingsStore((s) => s.speechRate);
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const enabled = useSettingsStore((s) => s.speechEnabled);

  if (!ttsSupported() || !enabled) return null;

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      aria-label={label}
      title={label}
      className={cn(speaking && "text-primary", className)}
      onClick={() => {
        setSpeaking(true);
        speak(text, { rate, voiceURI: voiceURI ?? undefined, onEnd: () => setSpeaking(false) });
      }}
    >
      <Volume2 className={cn("h-4 w-4", speaking && "animate-pulse")} />
    </Button>
  );
}
