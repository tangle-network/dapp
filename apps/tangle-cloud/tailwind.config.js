import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import plugin from 'tailwindcss/plugin';

// eslint-disable-next-line @nx/enforce-module-boundaries
import preset from '../../tailwind.preset.cjs';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    join(
      __dirname,
      '{src,pages,components,containers,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    join(
      __dirname,
      '../../libs/webb-ui-components',
      'src/{pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8E59FF',
      },
      backgroundImage: {
        glass:
          'linear-gradient(180deg,rgba(255,255,255,0.85) 0%,rgba(255,255,255,0.30) 100%)',
        glass_dark:
          'linear-gradient(180deg,rgba(43,47,64,0.85) 0%,rgba(43,47,64,0.30) 100%)',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities(
        {
          '.scrollbar-hide': {
            /* IE and Edge */
            '-ms-overflow-style': 'none',

            /* Firefox */
            'scrollbar-width': 'none',

            /* Safari and Chrome */
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          },

          '.scrollbar-default': {
            /* IE and Edge */
            '-ms-overflow-style': 'auto',

            /* Firefox */
            'scrollbar-width': 'auto',

            /* Safari and Chrome */
            '&::-webkit-scrollbar': {
              display: 'block',
            },
          },
        },
        ['responsive'],
      );
    }),
  ],
};
