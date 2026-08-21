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

      // Verifica se variáveis não declaradas estão sendo usadas
      "no-undef": "off",

      // Verifica se variáveis não utilizadas estão sendo usadas
      "no-unused-vars": "off",

      /* no-undef e no-unused-vars estão desabilitados para evitar conflitos com o Typescript, que já faz ambas 
      as verficiações */

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",

      "react/react-in-jsx-scope": "off",
    },
  },
];
