module.exports = {
  root: true,
  ignorePatterns: [".eslintrc.cjs", "dist/"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/stylistic",
  ],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["tsconfig.json"],
  },
  env: {
    node: true,
  },
  rules: {
    "no-constant-condition": ["error", { checkLoops: false }],
    "@typescript-eslint/consistent-type-definitions": "off",
    "no-unused-variable": [true, { "ignore-pattern": "^_" }],
  },
};
