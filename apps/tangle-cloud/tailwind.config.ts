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
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      // Unified type scale — bumped from Tailwind defaults (xs 12 / sm 14 /
      // base 16 / lg 18 / xl 20) so cloud's body, subtext, tables, and buttons
      // read larger and consistent. Line-heights loosened to match.
      fontSize: {
        xs: ['13px', { lineHeight: '1.35rem' }],
        sm: ['15px', { lineHeight: '1.5rem' }],
        base: ['17px', { lineHeight: '1.65rem' }],
        lg: ['19px', { lineHeight: '1.7rem' }],
        xl: ['22px', { lineHeight: '1.85rem' }],
        '2xl': ['25px', { lineHeight: '2rem' }],
        '3xl': ['30px', { lineHeight: '2.25rem' }],
      },
      backgroundImage: {
        glass:
          'linear-gradient(180deg,rgba(255,255,255,0.94) 0%,rgba(255,255,255,0.74) 100%)',
        glass_dark:
          'linear-gradient(180deg,rgba(43,47,64,0.94) 0%,rgba(43,47,64,0.78) 100%)',
      },
    },
  },
  plugins: [],
} as const satisfies Config;
