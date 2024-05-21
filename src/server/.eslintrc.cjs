module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["tsconfig.json"],
  },
  rules: {
    "import/extensions": ["error", "always"],
  },
};
