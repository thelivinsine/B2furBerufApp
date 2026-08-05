/**
 * Records whether the learner is currently driving the app with a POINTER or
 * the KEYBOARD, as `<html data-input="pointer">` / `"keyboard"`.
 *
 * `index.css` uses it to suppress the focus ring for pointer interaction only
 * (founder s190: no blue outline after clicking a toggle or the Filter row).
 * `:focus-visible` alone does not settle this: a control that re-renders under
 * the click, like the Bibliothek switcher pill or the filter toggle, can end up
 * focused again and keep matching, and the browsers differ on when. Tracking the
 * actual input device makes the rule the same everywhere.
 *
 * No attribute is set until the learner acts, so the untouched default is plain
 * `:focus-visible` behaviour. Keyboard navigation always restores the ring.
 */
export function trackInputMode() {
  if (typeof document === "undefined") return;
  const set = (mode: "pointer" | "keyboard") => {
    document.documentElement.dataset.input = mode;
  };
  // Capture phase: the flag has to be right BEFORE the click handler re-renders
  // whatever was pressed, otherwise the ring flashes for one frame.
  window.addEventListener("pointerdown", () => set("pointer"), true);
  window.addEventListener(
    "keydown",
    (e) => {
      // Only keys that MOVE or ACTIVATE focus count. Typing into a field is not
      // keyboard navigation, and treating it as such would put a ring back on
      // the control the learner just clicked.
      if (
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "Escape" ||
        e.key.startsWith("Arrow")
      ) {
        set("keyboard");
      }
    },
    true,
  );
}
