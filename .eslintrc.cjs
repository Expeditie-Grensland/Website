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
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
};
