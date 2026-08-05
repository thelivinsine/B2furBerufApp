import { useRef } from "react";
import { Check, Lightbulb, Mic, PhoneOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UmlautKeys } from "@/features/writing/UmlautKeys";
import { cn } from "@/lib/utils";

/**
 * The one control cluster every spoken layout shares (s193).
 *
 * Same geometry as the Schreiben floating cluster: no bar behind it, every
 * control on its own opaque backing, and the primary action in the SAME place
 * across all three layouts so switching between practice and exam never moves
 * the button under the learner's thumb.
 *
 * The typed fallback below is not a degraded mode to apologise for: it is
 * exactly what the Sprechen area did before this feature existed, so a learner
 * on Firefox (no speech recognition at all) is no worse off than they were, and
 * everyone else gets a microphone.
 */
export function MicCluster({
  listening,
  supported,
  busy,
  onStart,
  onStop,
  onHint,
  onEnd,
  endLabel = "Beenden",
  caption,
  typed,
  onTypedChange,
  onTypedSubmit,
}: {
  listening: boolean;
  supported: boolean;
  /** Waiting for the partner: the microphone must not open on top of it. */
  busy: boolean;
  onStart: () => void;
  onStop: () => void;
  /** Absent in exam mode: there are no hints in the Modelltest. */
  onHint?: () => void;
  onEnd: () => void;
  /** "Auflegen" in the call layout. Neutral, never danger red: that colour is
   *  reserved for errors (founder s193 kept the rule rather than the phone
   *  convention). */
  endLabel?: string;
  caption?: string | null;
  typed: string;
  onTypedChange: (v: string) => void;
  onTypedSubmit: () => void;
}) {
  const typedRef = useRef<HTMLTextAreaElement>(null!);

  if (!supported) {
    return (
      <div className="mt-auto pt-3">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <textarea
              ref={typedRef}
              value={typed}
              onChange={(e) => onTypedChange(e.target.value)}
              rows={2}
              disabled={busy}
              aria-label="Deine Antwort"
              placeholder="Dein Browser kann nicht zuhören. Tippe deine Antwort."
              className="w-full resize-none rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <UmlautKeys textareaRef={typedRef} value={typed} onChange={onTypedChange} />
          </div>
          <Button
            variant="gradient"
            size="icon"
            className="h-11 w-11 shrink-0"
            disabled={busy || !typed.trim()}
            onClick={onTypedSubmit}
            aria-label="Antwort senden"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onEnd}>
            {endLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-auto pt-3">
      <div className="flex items-center justify-center gap-5">
        {onHint ? (
          <ClusterButton icon={<Lightbulb className="h-[19px] w-[19px]" />} label="Hilfe" onClick={onHint} disabled={busy} />
        ) : (
          // The exam has no hint button, but the microphone must not move: the
          // slot is reserved so the primary action sits at the same x in both.
          <span className="h-[44px] w-[44px] shrink-0" aria-hidden />
        )}

        <button
          type="button"
          onClick={listening ? onStop : onStart}
          disabled={busy}
          aria-label={listening ? "Aufnahme stoppen" : "Sprechen"}
          aria-pressed={listening}
          className={cn(
            "grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full transition-all disabled:opacity-50",
            listening
              ? "border-2 border-primary bg-surface text-primary"
              : "bg-accent-gradient text-primary-foreground shadow-soft hover:brightness-105",
          )}
        >
          {listening ? (
            <span className="h-[22px] w-[22px] rounded-[5px] bg-primary" />
          ) : (
            <Mic className="h-7 w-7" />
          )}
        </button>

        <ClusterButton
          icon={
            endLabel === "Auflegen" ? (
              <PhoneOff className="h-[19px] w-[19px]" />
            ) : (
              <Check className="h-[19px] w-[19px]" />
            )
          }
          label={endLabel}
          onClick={onEnd}
        />
      </div>
      <p className="mt-2.5 min-h-[18px] text-center text-xs text-muted-foreground">
        {caption ?? ""}
      </p>
    </div>
  );
}

function ClusterButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex shrink-0 flex-col items-center gap-1 text-[11.5px] font-semibold text-muted-foreground disabled:opacity-50"
    >
      <span className="grid h-[44px] w-[44px] place-items-center rounded-full border border-border bg-surface shadow-soft">
        {icon}
      </span>
      {label}
    </button>
  );
}
