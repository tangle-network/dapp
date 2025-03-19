import preset from '../../tailwind.preset';

import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import { Config } from 'tailwindcss/types/config';

export default {
  presets: [preset],
  content: [
    join(__dirname, '{src,public}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
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
        purple_gradient:
          'linear-gradient(79deg, #b6b8dd 8.85%, #d9ddf2 55.91%, #dbbdcd 127.36%)',
        purple_gradient_dark:
          'linear-gradient(79deg, rgba(30, 32, 65, 0.8) 8.85%, rgba(38, 52, 116, 0.8) 55.91%, rgba(113, 61, 89, 0.8) 127.36%)',
      },
    },
  },
  plugins: [],
} as const satisfies Config;
