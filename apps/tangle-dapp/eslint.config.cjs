const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const typescriptEslintParser = require('@typescript-eslint/parser');
const eslintPluginSimpleImportSort = require('eslint-plugin-simple-import-sort');
const eslintPluginUnusedImports = require('eslint-plugin-unused-imports');
const globals = require('globals');
const baseConfig = require('../../eslint.config.cjs');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...baseConfig,
  js.configs.recommended,
  ...compat.extends(
    'plugin:@nx/react-typescript',
    'next',
    'next/core-web-vitals',
  ),
  {
    plugins: {
      'unused-imports': eslintPluginUnusedImports,
      'simple-import-sort': eslintPluginSimpleImportSort,
    },
  },
  {
    languageOptions: {
      parser: typescriptEslintParser,
      globals: { ...globals.jest },
    },
  },
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
