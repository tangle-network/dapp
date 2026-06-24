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
        xs: ['14px', { lineHeight: '1.4rem' }],
        sm: ['16px', { lineHeight: '1.55rem' }],
        base: ['18px', { lineHeight: '1.7rem' }],
        lg: ['20px', { lineHeight: '1.75rem' }],
        xl: ['24px', { lineHeight: '1.9rem' }],
        '2xl': ['28px', { lineHeight: '2.1rem' }],
        '3xl': ['34px', { lineHeight: '2.4rem' }],
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
