import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const ignoreFiles = ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "src/components/ui/*.tsx"];

const eslintRules = {
  "prefer-const": "error",
  "@typescript-eslint/explicit-function-return-type": "error",
};

const eslintConfig = [
  {
    ignores: ignoreFiles,
  },
  {
    rules: eslintRules,
  },
  // Workaround for https://github.com/microsoft/rushstack/issues/4965
  {
    name: "next/core-web-vitals",
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  ...compat.extends("next/typescript"),
];

export default eslintConfig;
