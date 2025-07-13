const ignoreFiles = [];

const eslintRules = {
  "prefer-const": "error",
  "@typescript-eslint/explicit-function-return-type": "error",
};

const eslintConfig = [
  {
    ignores: ignoreFiles,
    rules: eslintRules,
  },
];

export default eslintConfig;
