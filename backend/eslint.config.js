import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Base JS rules
  js.configs.recommended,

  // TypeScript recommended
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.node,
      },
    },

    rules: {
      // Style
      quotes: ["warn", "double", { avoidEscape: true }],
      semi: ["warn", "always"],

      // Best practices
      eqeqeq: "warn",
      "no-undef": "off",
      "no-empty": "warn",

      // Type augmentation (e.g. `declare global { namespace Express {...} }`)
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],

      // Unused vars
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],

      // Async
      "no-async-promise-executor": "warn",
    },
  },

  // Ignore build artifacts
  {
    ignores: ["dist/**", "build/**", "coverage/**", "node_modules/**"],
  },
];
