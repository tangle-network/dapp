import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import plugin from 'tailwindcss/plugin';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line @nx/enforce-module-boundaries
import preset from '../../tailwind.preset.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    join(__dirname, '{src,public}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8E59FF',
      },
      backgroundImage: {
        glass:
          'linear-gradient(180deg,rgba(255,255,255,0.80) 0%,rgba(255,255,255,0.00) 100%)',
        glass_dark:
          'linear-gradient(180deg,rgba(43,47,64,0.80) 0%,rgba(43,47,64,0.00) 100%)',
        token_info_card:
          'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.5) 100%)',
        token_info_card_dark:
          'linear-gradient(180deg, #2B2F40 0%, rgba(43, 47, 64, 0.5) 100%)',
        validator_table: 'linear-gradient(180deg, #C0C5D800 0%, #FFFFFF66 40%)',
        validator_table_dark:
          'linear-gradient(180deg, #707AA600 0%, #2B2F4066 40%)',
        liquid_staking_banner:
          'linear-gradient(78.54deg, rgba(199, 201, 229, 0.6) 8.85%, rgba(236, 238, 249, 0.6) 55.91%, rgba(244, 235, 240, 0.6) 127.36%)',
        liquid_staking_banner_dark:
          'linear-gradient(78.54deg, rgba(30, 32, 65, 0.8) 8.85%, rgba(38, 52, 116, 0.8) 55.91%, rgba(113, 61, 89, 0.8) 127.36%)',
        liquid_staking_tokens_table:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.5) -428.82%, rgba(255, 255, 255, 0) 180.01%)',
        liquid_staking_tokens_table_dark:
          'linear-gradient(180deg, rgba(43, 47, 64, 0.5) -428.82%, rgba(43, 47, 64, 0) 180.01%)',
        liquid_staking_input:
          'linear-gradient(360deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.6) 100%)',
        liquid_staking_input_dark:
          'linear-gradient(180deg, rgba(43, 47, 64, 0.4) 0%, rgba(112, 122, 166, 0.04) 100%)',
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
