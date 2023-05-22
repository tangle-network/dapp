const preset = require('@webb-tools/tailwind-preset');

const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
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
    join(__dirname, 'public/static/assets/hero-background.svg'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      backgroundImage: {
        hero_bg_image: "url('/static/assets/hero-background.png')",
        tangle_network: "url('/static/assets/tangle-network.png')",
        in_action: "url('/static/assets/in-action.png')",
        good_pink: "url('/static/assets/good-pink.png')",
        cool: "url('/static/assets/cool.png')",
        mock_bridge: "url('/static/assets/mock-bridge.png')",
        mock_stats: "url('/static/assets/mock-stats.png')",
        community_bg_texture: "url('/static/assets/community-texture.png')",
        brandkit_hero:
          "linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), url('/static/assets/brandkit-hero.png')",
        brandkit_iconography_desktop:
          "url('/static/assets/brandkit-iconography-desktop.png')",
        brandkit_iconography_mobile:
          "url('/static/assets/brandkit-iconography-mobile.png')",
      },

      fontFamily: {
        satoshi: [
          'Satoshi',
          '-apple-system',
          'BlinkMacSystemFont',
          'Arial',
          'sans-serif',
        ],
      },

      screens: {
        xs: '375px',
      },
    },
  },
};
