import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.node,
      },
    },

    rules: {
      quotes: ["warn", "double", { avoidEscape: true }],
      semi: ["warn", "always"],

      eqeqeq: "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",

      "no-empty": "warn",

      // Async
      "no-async-promise-executor": "warn",
    },
  },
];
