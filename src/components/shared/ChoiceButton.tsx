import { motion } from "framer-motion";
import { Check, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChoiceState = "idle" | "correct" | "wrong" | "dim";

interface ChoiceButtonProps {
  children: React.ReactNode;
  state?: ChoiceState;
  disabled?: boolean;
  onClick?: () => void;
  /** Dialogue-option style: leading ChevronRight, no feedback states */
  asOption?: boolean;
  className?: string;
}

export function ChoiceButton({
  children,
  state = "idle",
  disabled,
  onClick,
  asOption = false,
  className,
}: ChoiceButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
        asOption ? "flex w-full items-center gap-2" : "flex items-center justify-between",
        state === "idle" && "border-border bg-surface hover:border-primary/40 hover:bg-muted/40",
        state === "correct" && "border-success bg-success/10 text-success",
        state === "wrong" && "border-danger bg-danger/10 text-danger",
        state === "dim" && "border-border opacity-50",
        className,
      )}
    >
      {asOption && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <span className={asOption ? undefined : "flex-1"}>{children}</span>
      {!asOption && state === "correct" && <Check className="h-4 w-4 shrink-0" />}
      {!asOption && state === "wrong" && <X className="h-4 w-4 shrink-0" />}
    </motion.button>
  );
}
