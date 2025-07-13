const ignoreFiles = [];

const eslintRules = {
  "prefer-const": "error",
};

const eslintConfig = [
  {
    ignores: ignoreFiles,
    rules: eslintRules,
  },
];

export default eslintConfig;
