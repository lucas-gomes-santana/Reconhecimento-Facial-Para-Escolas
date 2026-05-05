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
      "eol-last": ["error", "always"],

      // Boas práticas JS
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": "off",
      "no-undef": "error",

      // Console (controlado)
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Node.js
      "n/no-process-exit": "off",
      "n/no-missing-import": "error",
      "n/no-unpublished-import": "off",
      "n/no-unsupported-features/es-syntax": "off",

      // Segurança
      "security/detect-object-injection": "off",
      "security/detect-child-process": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-eval-with-expression": "error",

      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-unresolved": "error",
      "import/no-duplicates": "error",

      // Limpeza de código
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // Async / Promises
      "no-async-promise-executor": "error",
      "require-await": "warn",
    },
  },
];
