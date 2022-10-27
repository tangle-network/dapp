/** @type {import('tailwindcss').Config} */

const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');
const config = require('../../tailwind.config');
const merge = require('lodash.merge');

module.exports = merge(config, {
  content: [
    join(__dirname, 'src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
});
