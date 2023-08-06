/* eslint-env node */
module.exports = {
  env: {
    node: false,
    browser: true,
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["tsconfig.json"],
  },
};
