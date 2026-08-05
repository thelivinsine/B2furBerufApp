import { createContext, useContext, type ReactNode } from "react";

/**
 * The element a browse surface scrolls its list INSIDE, or `null` when the page
 * itself is the scroller (founder s189: desktop keeps an internal scroll rather
 * than a page scroll).
 *
 * It exists because of `usePagedList`. That hook grows the rendered window when
 * a sentinel comes near, and its IntersectionObserver measures against the
 * VIEWPORT by default. The moment the list lives in its own scroll container,
 * the sentinel is clipped by that container's overflow and stops intersecting,
 * so paging quietly dies and the learner is left with the fallback button. The
 * observer therefore needs the container as its `root`, and the hook is called
 * deep inside the list components, far from the surface that owns the
 * container. Context is the short path between them.
 *
 * A surface that scrolls the page (mobile, and anything that has not adopted
 * the desktop stage) provides nothing, and the default `null` is exactly the
 * viewport-root behaviour the hook had before.
 */
const ScrollRootContext = createContext<HTMLElement | null>(null);

export function ScrollRootProvider({
  value,
  children,
}: {
  value: HTMLElement | null;
  children: ReactNode;
}) {
  return <ScrollRootContext.Provider value={value}>{children}</ScrollRootContext.Provider>;
}

/** The current scroll container, or `null` for the viewport. */
export function useScrollRoot(): HTMLElement | null {
  return useContext(ScrollRootContext);
}
