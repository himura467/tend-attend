import { FlatCompat } from "@eslint/eslintrc";
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
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
