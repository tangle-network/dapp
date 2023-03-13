const preset = require('@webb-tools/tailwind-preset');

const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    join(
      __dirname,
      'src/{pages,app,components,provider}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    join(__dirname, 'src/styles/**/*.{css,scss,sass,less,styl}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};
