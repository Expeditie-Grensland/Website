module.exports = {
  root: true,
  ignorePatterns: ['.eslintrc.cjs', 'dist/'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
};
