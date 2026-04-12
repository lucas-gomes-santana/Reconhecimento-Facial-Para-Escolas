import js from "@eslint/js";
import node from "eslint-plugin-n";
import security from "eslint-plugin-security";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    plugins: {
      n: node,
      security,
      "unused-imports": unusedImports,
      import: importPlugin,
    },

    rules: {
      // Estilo
      quotes: ["error", "double"],
      semi: ["error", "always"],

      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],

      // NodeJs
      "n/no-process-exit": "off", // útil em CLI
      "n/no-missing-import": "error",

      // Segurança
      "security/detect-object-injection": "on",
      "security/detect-child-process": "warn",

      // Qualidade
      eqeqeq: "error",
      "no-console": "off", // backend pode logar

      // Imports
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          "newlines-between": "always",
        },
      ],

      // Limpeza
      "unused-imports/no-unused-imports": "error",
    },
  },
];
