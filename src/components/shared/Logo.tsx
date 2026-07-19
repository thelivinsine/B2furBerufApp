import { cn } from "@/lib/utils";

/**
 * The Genauly logo: the tile-less mark (g on the Himmelblau swipe, transparent
 * background, no tile). The g adapts to the theme so it stays legible on any
 * surface — Tinte ink in light mode, Papier in dark mode (the brand plan's
 * tile-less rework, s133). Both images are rendered and toggled by the `.dark`
 * class (which `useTheme` puts on <html> globally), so the swap is instant and
 * needs no JS. Browser/OS icons keep their tile; this is the in-app <img> logo.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <>
      <img
        src="/genauly-logo.png"
        alt="Genauly"
        className={cn("block dark:hidden", className)}
      />
      <img
        src="/genauly-logo-dark.png"
        alt="Genauly"
        aria-hidden="true"
        className={cn("hidden dark:block", className)}
      />
    </>
  );
}
