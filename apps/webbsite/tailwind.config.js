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
    join(__dirname, 'public/static/assets/hero-background.svg'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      backgroundImage: {
        hero_bg_image: "url('/static/assets/hero-background.png')",
        dyed: "url('/static/assets/bg-dyed.png')",
        tangle_network: "url('/static/assets/tangle-network.png')",
      },
    },
  },
};
