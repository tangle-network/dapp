const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nxEslintPlugin = require('@nx/eslint-plugin');
const eslintPluginImportX = require('eslint-plugin-import-x');
const tsParser = require('@typescript-eslint/parser');
const unusedImports = require('eslint-plugin-unused-imports');
const reactRefresh = require('eslint-plugin-react-refresh');
const eslintConfigPrettier = require('eslint-config-prettier');

const { createNodeResolver } = eslintPluginImportX;

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends('plugin:storybook/recommended'),
  reactRefresh.configs.recommended,
  {
    plugins: {
      'import-x': eslintPluginImportX,
    },
    settings: {
      'import-x/resolver-next': [
        // This is the new resolver we are introducing
        createNodeResolver(),
        // you can add more resolvers down below
        require('eslint-import-resolver-typescript').createTypeScriptImportResolver(
          {
            alwaysTryTypes: true,
            project: [
              './tsconfig.base.json',
              'apps/*/tsconfig.json',
              'apps/*/tsconfig.app.json',
              'apps/*/tsconfig.node.json',
              'apps/*/tsconfig.spec.json',
              'libs/*/tsconfig.json',
              'libs/*/tsconfig.lib.json',
              'libs/*/tsconfig.spec.json',
            ],
          },
        ),
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ignores: ['**/eslint.config.cjs'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['metadata', 'viewport', 'dynamic'] },
      ],
    },
  },
  { plugins: { '@nx': nxEslintPlugin, 'unused-imports': unusedImports } },
  {
    rules: {
      'storybook/no-uninstalled-addons': [
        'error',
        {
          ignore: ['@nx/react/plugins/storybook'],
        },
      ],
    },
  },
  ...compat
    .config({
      extends: ['plugin:@nx/typescript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
      rules: {
        ...config.rules,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
      },
    })),
  ...compat
    .config({
      extends: ['plugin:@nx/javascript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
      rules: {
        ...config.rules,
      },
    })),
  ...compat
    .config({
      env: {
        jest: true,
      },
    })
    .map((config) => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
      rules: {
        ...config.rules,
      },
    })),
  eslintConfigPrettier,
  {
    ignores: ['**/.netlify/'],
  },
  {
    files: ['**/tailwind.config.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
