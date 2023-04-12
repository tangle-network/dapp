const preset = require('@webb-tools/tailwind-preset');

const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    join(
      __dirname,
      'src/{pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    join(
      __dirname,
      '../../libs/webb-ui-components',
      'src/{pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      backgroundImage: {
        body: "url('/static/assets/body-bg.jpg')",
        hero_section: "url('/static/assets/hero-section.jpg')",
        introduction_section:
          'linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url("/static/assets/body-bg.jpg")',
      },
      colors: {
        tangle_purple: '#444BD3',
        tangle_dark_purple: '#C6BBFA'
      },
    },
  },
};
