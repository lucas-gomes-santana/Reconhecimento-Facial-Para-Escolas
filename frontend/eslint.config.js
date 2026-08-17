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

      "no-console": "off",

      // Evita que variáveis não declaradas sejam usadas, mas permite que o TypeScript faça a verificação de tipos.
      // Isso evita que o linter reclame sobre tipos como React.FormEvent, que são definidos pelo TypeScript, mas não são reconhecidos pelo ESLint.
      "no-undef": "off",

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",

      "react/react-in-jsx-scope": "off",
    },
  },
];
