import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs"
    ]
  },
  {
    // Правила для всех файлов
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn", // Предупреждать вместо ошибки
      "no-console": "off", // Allow console logs in backend
      "prefer-const": "error",
    },
  },
  {
    // Правила для тестовых файлов
    files: ["**/__tests__/**/*", "**/*.test.*", "**/*.spec.*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-require-imports": "off", // Разрешить require в тестах
    },
  },
];