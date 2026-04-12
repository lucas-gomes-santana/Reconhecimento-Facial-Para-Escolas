import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "@typescript-eslint": tseslint,
      "unused-imports": unusedImports,
      import: importPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // Estilo
      quotes: ["error", "double"],
      semi: ["error", "always"],

      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],

      // Qualidade
      eqeqeq: "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "@typescript-eslint/no-explicit-any": "warn",

      // Ordem dos imports
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          "newlines-between": "always",
        },
      ],

      // Limpeza de imports não usados
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
