/** @type {import('tailwindcss').Config} */

const config = require('../../tailwind.config');
const merge = require('lodash.merge');
const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');

module.exports = merge(config, {
  content: [
    join(__dirname, 'src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
});
