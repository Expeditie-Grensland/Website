module.exports = {
  root: true,
  ignorePatterns: ['.eslintrc.cjs', 'dist/'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
  },
  rules: {
    'no-constant-condition': ['error', { checkLoops: false }],
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
};
