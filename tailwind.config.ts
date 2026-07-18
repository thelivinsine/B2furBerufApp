import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        elevated: "hsl(var(--elevated))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        // Reward-gold (redesign Phase 2.3): loot / combo moments only.
        reward: {
          DEFAULT: "hsl(var(--reward))",
          bg: "hsl(var(--reward-bg))",
        },
        // Gender marks (Artikel-Visuals, s128 plan): der / die / das + pale
        // `-bg` tints. Used only by the Artikel-Wesen marks + reveal effects,
        // never as domain/graph colors.
        der: {
          DEFAULT: "hsl(var(--der))",
          bg: "hsl(var(--der-bg))",
        },
        die: {
          DEFAULT: "hsl(var(--die))",
          bg: "hsl(var(--die-bg))",
        },
        das: {
          DEFAULT: "hsl(var(--das))",
          bg: "hsl(var(--das-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 10px)",
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "Inter var",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px hsl(var(--shadow) / 0.04), 0 4px 12px hsl(var(--shadow) / 0.06)",
        elevated:
          "0 2px 4px hsl(var(--shadow) / 0.05), 0 12px 32px hsl(var(--shadow) / 0.12)",
        // Toned-down (~50%) version of `elevated` for the sign-in dialog, so the
        // soft halo around the card is less intense and spreads about half as
        // far past the border.
        "elevated-soft":
          "0 1px 2px hsl(var(--shadow) / 0.025), 0 6px 16px hsl(var(--shadow) / 0.06)",
        glow: "0 0 0 1px hsl(var(--primary) / 0.12), 0 8px 30px hsl(var(--primary) / 0.18)",
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
        "mesh":
          "radial-gradient(at 0% 0%, hsl(var(--primary) / 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, hsl(var(--accent) / 0.1) 0px, transparent 50%)",
        // Dialog backdrop: a brand-tinted radial that's lighter directly behind
        // the card and deepens toward the screen edges (a subtle spotlight). Uses
        // the cool-slate `--shadow` token instead of flat black, so it adapts to
        // dark mode automatically. No blur.
        "dialog-overlay":
          "radial-gradient(120% 120% at 50% 45%, hsl(var(--shadow) / 0.30), hsl(var(--shadow) / 0.62))",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // Like slide-up, but composed with the -translate-x-1/2 -translate-y-1/2
        // centering transform that <DialogContent> uses to sit at exactly
        // 50%/50%. A bare `transform: translateY()` keyframe would replace
        // (not add to) that centering offset for the animation's duration,
        // making the dialog render off-center and then visibly snap into
        // place the instant the animation ends.
        "dialog-in": {
          from: { opacity: "0", transform: "translate(-50%, -50%) translateY(8px)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "dialog-in": "dialog-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
