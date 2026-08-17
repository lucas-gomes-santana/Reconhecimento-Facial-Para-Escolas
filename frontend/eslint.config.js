import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      parser: tsParser,

      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      "@typescript-eslint": tseslint,
    },

    rules: {
      quotes: ["warn", "double"],
      semi: ["warn", "always"],
      "no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 1 }],

      eqeqeq: "error",

      // Console permitido
      "no-console": "off",

      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",

      "react/react-in-jsx-scope": "off",
    },
  },
];
