import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

/**
 * Lint gate (audit D2). Focused on the bug-catching rules: rules-of-hooks,
 * exhaustive-deps, unused code, and the TypeScript recommended set. Style is
 * left to the existing conventions (no formatting rules here).
 */
export default tseslint.config(
  { ignores: ["dist", "dev-dist", "node_modules", "preview"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // The React-Compiler-era rules (purity, set-state-in-effect, refs, ...)
      // flag several long-standing, deliberate patterns in this codebase
      // (mount-time performance.now() latency capture is contract-tested,
      // controlled resets in effects are the pre-compiler idiom). Keep them
      // VISIBLE as warnings; the classic bug-catchers below stay errors.
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/component-hook-factories": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-refresh/only-export-components": "off",
      // The Web Speech + Recognition wrappers deal with untyped vendor APIs;
      // keep `any` a warning (visible, not blocking) rather than an error.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{js,ts}", "vite.config.ts"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
);
