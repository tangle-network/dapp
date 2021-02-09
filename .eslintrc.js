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
  },
  extends: ['eslint:recommended', 'prettier/react', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
};
