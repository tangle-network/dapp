const base = require('@polkadot/dev/config/eslint.cjs');

// add override for any (a metric ton of them, initial conversion)
module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    project: ['./tsconfig.json'],
  },
  rules: {
    ...base.rules,
    '@typescript-eslint/no-explicit-any': 'off',
    'react/prop-types': 'off',
    'header/header': 'off',
    'comma-dangle': 'off',
    'react/jsx-fragments': 'off',
    'react/jsx-max-props-per-line': 'off',
    'react/jsx-sort-props': 'off',
    'padding-line-between-statements': 'off',
    'object-curly-newline': 'off',
    'no-unused-vars': 'off',
    'sort-keys': 'off',
    'no-empty-pattern': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/indent': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-tag-spacing': 'off',
    'react/jsx-first-prop-new-line': 'off',
    'react/jsx-closing-bracket-location': 'off',
    'import-newlines/enforce': 'off',
    'brace-style': 'off',
    'react/jsx-props-no-multi-spaces': 'off',
    'react/jsx-newline': 'off'
	},
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  extends: ['eslint:recommended', 'prettier/react', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
};
