import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tailwindcss from "eslint-plugin-tailwindcss";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "tina/__generated__",
      "**/.next",
      "**/node_modules",
      "**/dist",
      "**/public",
      "**/content",
      "**/coverage",
      "next.config.mjs",
      "**/*.js",
      "**/*.mjs",
    ],
  },
  ...compat.extends(
    "eslint:recommended",
    "next/core-web-vitals",
    "next/typescript",
    "plugin:tailwindcss/recommended",
    "plugin:prettier/recommended",
  ),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      tailwindcss,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "no-console": "warn",
      "@next/next/no-duplicate-head": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@next/next/no-page-custom-font": "off",
      "tailwindcss/no-unknown-animations": "off",
      "@typescript-eslint/no-unused-expressions": "error",
      quotes: ["error", "double"],
      "tailwindcss/no-arbitrary-value": [
        "error",
        {
          allowlist: [
            "transition-[width]",
            "max-h-[2000px]",
            "text-[#3B82F6]",
            "text-[#FF5533]",
            "pb-[10px]",
            "pt-[12px]",
            "leading-[1.3]",
            "max-h-[2000px]",
            "text-[#3B82F6]",
            "text-[#FF5533]",
            "pb-[10px]",
            "pt-[12px]",
            "leading-[1.3]",
            "max-h-[2000px]",
            "text-[#3B82F6]",
            "text-[#FF5533]",
            "pb-[10px]",
            "pt-[12px]",
            "leading-[1.3]",
            "max-h-[2000px]",
            "text-[#3B82F6]",
            "text-[#FF5533]",
            "pb-[10px]",
            "leading-[1.3]",
          ],
        },
      ],
      "tailwindcss/classnames-order": "error",
      "@typescript-eslint/no-require-imports": "off",
      "tailwindcss/no-custom-classname": [
        "error",
        {
          whitelist: [
            "animate-fade-down",
            "animate-duration-300",
            "from-seafoam-500",
            "to-seafoam-700",
            "text-seafoam-700",
            "text-md",
            "font-mono",
            "video-container",
            "callout",
            "learnImage",
            "calloutButton",
            "wide",
            "word-break",
            "white-space",
            "margin-0",
            "video",
            "group-hover:animate-wiggle",
            "recipe-block-container",
            "title-description",
            "content-wrapper",
            "instructions",
            "max-h-50vh",
            "instruction-item",
            "codeblock",
            "focus:shadow-outline",
            "pl",
            "code-toolbar",
            "mermaid",
            "line-numbers",
            "codeblock-container",
          ],
        },
      ],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    files: ["**/api/**/*.ts", "**/server/**/*.ts"],
    plugins: {
      tailwindcss,
    },
    rules: {
      "no-console": "off",
      "@next/next/no-duplicate-head": "off",
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];
