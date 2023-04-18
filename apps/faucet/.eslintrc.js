module.exports = {
  plugins: ['simple-import-sort', 'sort-keys-fix', 'neverthrow'],
  extends: [
    'plugin:@nrwl/nx/react-typescript',
    'next',
    'next/core-web-vitals',
    '../../.eslintrc.json',
  ],
  ignorePatterns: ['!**/*', '.next/**/*'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@next/next/no-html-link-for-pages': ['error', 'apps/faucet/src/pages'],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {},
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {},
    },
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'sort-keys-fix/sort-keys-fix': 'error',
    'neverthrow/must-use-result': 'error',
  },
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
