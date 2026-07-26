import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          // The top sheen (white/12 fading out) gives primary buttons a subtle
          // dimensionality without the full two-hue gradient (s137 premium
          // pass); the underlying bg-primary still drives the hover shift.
          "bg-primary bg-gradient-to-b from-white/12 to-transparent text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-glow",
        gradient:
          "bg-accent-gradient text-primary-foreground shadow-soft hover:shadow-glow hover:brightness-105",
        secondary:
          "bg-muted text-foreground hover:bg-muted/70",
        outline:
          "border border-border bg-surface/50 hover:bg-muted/60 hover:border-border",
        // Himmelblau tile as a button (s166): the panel toggles on Schreiben
        // ("Grammatik", "Aufgabe wählen") wear the fill of the accent rail they
        // open, because `outline`'s half-transparent fill made them disappear
        // into the ground. One step stronger than the rails themselves so a
        // 40px control still reads. The OUTLINE is the neutral `border` token
        // (founder s168): a blue edge around a blue fill read as too loud, and
        // the rails this opens now wear the same neutral edge. Label contrast
        // is unchanged (accent-ink on accent/35): 4.72:1 light, 7.71:1 dark.
        accent:
          "border border-border bg-accent/35 text-accent-ink hover:bg-accent/50 dark:bg-accent/[0.18] dark:hover:bg-accent/[0.28]",
        ghost: "hover:bg-muted/60",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        info: "bg-accent text-accent-foreground hover:bg-accent/90",
        danger: "bg-danger text-danger-foreground hover:bg-danger/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
