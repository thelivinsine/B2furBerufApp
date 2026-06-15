import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems, PRIMARY_TAB_PATHS } from "./nav-items";

// ── Per-tab metadata (color + tinted bg) ──────────────────────
const MORE_COLOR = "#5b5be6";
const MORE_BG    = "rgba(91,91,230,.08)";

const TAB_DEFS = [
  { to: "/",           end: true,  label: "Dashboard",   color: "#5b5be6", bg: "rgba(91,91,230,.08)"  },
  { to: "/vocabulary", end: false, label: "Wortschatz",  color: "#5b5be6", bg: "rgba(91,91,230,.08)"  },
  { to: "/quiz",       end: false, label: "Quiz",        color: "#f59e0b", bg: "rgba(245,158,11,.08)" },
  { to: "/analytics",  end: false, label: "Fortschritt", color: "#10b7cf", bg: "rgba(16,183,207,.08)" },
] as const;

type TabPath = (typeof TAB_DEFS)[number]["to"];
const PATH_META = Object.fromEntries(TAB_DEFS.map(t => [t.to, t])) as Record<TabPath, typeof TAB_DEFS[number]>;

function getContextMeta(pathname: string) {
  if (pathname in PATH_META) return PATH_META[pathname as TabPath];
  const match = navItems.find(i => i.to !== "/" && pathname.startsWith(i.to));
  return { label: match?.label ?? "Mehr", color: MORE_COLOR, bg: MORE_BG };
}

// ── Custom SVG icons — 24 px, ~15% larger than the old h-5 w-5 ─
function IcoDashboard({ active }: { active: boolean }) {
  const c = active ? "#5b5be6" : "#c2c4d6";
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2"  y="2"  width="7" height="7" rx="1.5" fill={c} />
      <rect x="11" y="2"  width="7" height="7" rx="1.5" fill={c} opacity={active ? .72 : .8} />
      <rect x="2"  y="11" width="7" height="7" rx="1.5" fill={c} opacity={active ? .72 : .7} />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill={c} opacity={active ? .45 : .5} />
    </svg>
  );
}

function IcoBook({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {/* Left page — indigo when active */}
      <path
        d="M10 4C8 3.2 5.5 3.2 3.5 4V16c2-.8 4.5-.8 6.5 0V4Z"
        fill={active ? "#5b5be6" : "#c2c4d6"}
      />
      {/* Right page — cyan when active */}
      <path
        d="M10 4c2-.8 4.5-.8 6.5 0V16c-2-.8-4.5-.8-6.5 0V4Z"
        fill={active ? "#10b7cf" : "#c2c4d6"}
        opacity={active ? 1 : .7}
      />
      {/* Page lines — only visible when active */}
      {active && (
        <>
          <line x1="5"    y1="7.5" x2="8.5" y2="7.5" stroke="white" strokeWidth=".9" strokeLinecap="round" opacity={.7} />
          <line x1="5"    y1="10"  x2="8.5" y2="10"  stroke="white" strokeWidth=".9" strokeLinecap="round" opacity={.5} />
          <line x1="11.5" y1="7.5" x2="15"  y2="7.5" stroke="white" strokeWidth=".9" strokeLinecap="round" opacity={.5} />
          <line x1="11.5" y1="10"  x2="15"  y2="10"  stroke="white" strokeWidth=".9" strokeLinecap="round" opacity={.35} />
        </>
      )}
    </svg>
  );
}

function IcoQuiz({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill={active ? "#f59e0b" : "#c2c4d6"} />
      <polyline
        points="6.5,10 9,12.5 13.5,7.5"
        stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

function IcoAnalytics({ active }: { active: boolean }) {
  const c = active ? "#10b7cf" : "#c2c4d6";
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5"  y="12"  width="3.5" height="6"    rx="1.2" fill={c} />
      <rect x="8.25" y="7.5" width="3.5" height="10.5" rx="1.2" fill={c} opacity={.8} />
      <rect x="14"   y="3"   width="3.5" height="15"   rx="1.2" fill={c} opacity={.55} />
    </svg>
  );
}

function IcoMore({ active }: { active: boolean }) {
  const c = active ? "#5b5be6" : "#c2c4d6";
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5.5"  cy="5.5"  r="1.9" fill={c} opacity={active ? .9  : .8}  />
      <circle cx="10"   cy="5.5"  r="1.9" fill={c} opacity={active ? .7  : .6}  />
      <circle cx="14.5" cy="5.5"  r="1.9" fill={c} opacity={active ? .5  : .45} />
      <circle cx="5.5"  cy="10"   r="1.9" fill={c} opacity={active ? .7  : .6}  />
      <circle cx="10"   cy="10"   r="1.9" fill={c} opacity={active ? .5  : .45} />
      <circle cx="14.5" cy="10"   r="1.9" fill={c} opacity={active ? .35 : .3}  />
      <circle cx="5.5"  cy="14.5" r="1.9" fill={c} opacity={active ? .45 : .4}  />
      <circle cx="10"   cy="14.5" r="1.9" fill={c} opacity={active ? .3  : .25} />
      <circle cx="14.5" cy="14.5" r="1.9" fill={c} opacity={active ? .2  : .18} />
    </svg>
  );
}

const TAB_ICONS: Record<TabPath, (active: boolean) => React.ReactNode> = {
  "/":           a => <IcoDashboard active={a} />,
  "/vocabulary": a => <IcoBook      active={a} />,
  "/quiz":       a => <IcoQuiz      active={a} />,
  "/analytics":  a => <IcoAnalytics active={a} />,
};

// ── Component ──────────────────────────────────────────────────
interface Props {
  onMore: () => void;
}

export function BottomTabBar({ onMore }: Props) {
  const location  = useLocation();
  const pathname  = location.pathname;
  const moreActive = !PRIMARY_TAB_PATHS.includes(pathname);
  const ctx = getContextMeta(pathname);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex flex-col border-t border-border bg-surface/80 backdrop-blur-xl pb-safe lg:hidden">

      {/* ── Context strip ── */}
      <div
        className="flex items-center px-4 py-1"
        style={{
          background: ctx.bg,
          borderBottom: "1px solid rgba(0,0,0,.05)",
        }}
      >
        <span
          className="text-[11px] font-extrabold tracking-wide leading-none"
          style={{ color: ctx.color }}
        >
          {ctx.label}
        </span>
      </div>

      {/* ── Icon rail — no text labels ── */}
      <div className="flex h-[52px] items-stretch">

        {TAB_DEFS.map(({ to, end, label, color, bg }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className="flex flex-1 p-1"
          >
            {({ isActive }) => (
              <div
                className={cn(
                  "relative flex flex-1 items-center justify-center rounded-xl transition-colors duration-150",
                )}
                style={isActive ? { background: bg } : {}}
              >
                {TAB_ICONS[to](isActive)}
                {isActive && (
                  <span
                    className="absolute bottom-[7px] left-1/2 -translate-x-1/2 w-5 rounded-full"
                    style={{ height: 2.5, background: color }}
                  />
                )}
              </div>
            )}
          </NavLink>
        ))}

        {/* Mehr */}
        <button
          onClick={onMore}
          aria-label="Mehr"
          className="flex flex-1 p-1"
        >
          <div
            className={cn(
              "relative flex flex-1 items-center justify-center rounded-xl transition-colors duration-150",
            )}
            style={moreActive ? { background: MORE_BG } : {}}
          >
            <IcoMore active={moreActive} />
            {moreActive && (
              <span
                className="absolute bottom-[7px] left-1/2 -translate-x-1/2 w-5 rounded-full"
                style={{ height: 2.5, background: MORE_COLOR }}
              />
            )}
          </div>
        </button>

      </div>
    </nav>
  );
}
