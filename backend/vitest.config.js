import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{js,ts}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "services/**/*.js",
        "utils/**/*.js",
        "config/**/*.js",
        "middlewares/**/*.js",
        "controllers/**/*.js",
      ],
    },
    deps: {
      inline: ["mongoose"],
    },
    globals: true,
  },
});
