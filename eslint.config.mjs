import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const ignoreFiles = ["src/components/ui/*.tsx"];

const eslintRules = {
  "@typescript-eslint/explicit-function-return-type": "error",
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ignoreFiles,
    rules: eslintRules,
  },
];

export default eslintConfig;
