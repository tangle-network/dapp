// @ts-check

import js from '@eslint/js';
import nxEslintPlugin from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import tseslint from 'typescript-eslint';

const reactCompilerReadinessRules = {
  'react-hooks/config': 'warn',
  'react-hooks/error-boundaries': 'warn',
  'react-hooks/gating': 'warn',
  'react-hooks/globals': 'warn',
  'react-hooks/immutability': 'warn',
  'react-hooks/preserve-manual-memoization': 'warn',
  'react-hooks/purity': 'warn',
  'react-hooks/refs': 'warn',
  'react-hooks/set-state-in-effect': 'warn',
  'react-hooks/set-state-in-render': 'warn',
  'react-hooks/static-components': 'warn',
  'react-hooks/unsupported-syntax': 'warn',
  'react-hooks/use-memo': 'warn',
};

export default tseslint.config(
  tseslint.configs.recommended,
  js.configs.recommended,
  reactRefresh.configs.recommended,
  ...nxEslintPlugin.configs['flat/base'],
  ...nxEslintPlugin.configs['flat/typescript'],
  ...nxEslintPlugin.configs['flat/javascript'],
  ...nxEslintPlugin.configs['flat/react'],
  ...storybook.configs['flat/recommended'],
  { plugins: { '@nx': nxEslintPlugin } },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
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
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // The v7 hooks plugin adds React Compiler readiness diagnostics to the
      // Nx React preset. Keep them visible without making compiler adoption a
      // repo-wide CI gate before the codebase is migrated.
      ...reactCompilerReadinessRules,
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
    },
  },
  {
    ignores: ['**/.netlify/', '**/contracts/**', '**/scripts/migration/**'],
  },
  {
    files: ['**/tailwind.config.ts', '**/eslint.config.{mjs,js}'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  eslintConfigPrettier,
);
