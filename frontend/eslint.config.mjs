import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/components/ui/*.tsx",
    "src/hooks/use-mobile.ts",
  ]),
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "prefer-const": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
]);

export default eslintConfig;
